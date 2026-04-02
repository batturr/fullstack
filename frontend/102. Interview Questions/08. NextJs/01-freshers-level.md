# Next.js Interview Questions — Freshers (0–2 Years)

100 fundamental questions with detailed answers. Use this for revision and mock interviews.

---

## 1. What is Next.js, and how does it relate to React?

Next.js is a React framework for building full-stack web applications. It extends React by providing conventions and built-in tooling for routing, rendering, data fetching, and deployment, so you spend less time wiring infrastructure and more time building product features. Unlike a plain React SPA (single-page app) that typically ships one bundle and handles routing on the client, Next.js can render on the server, stream HTML, and integrate backend logic in the same codebase. The framework is maintained by Vercel and follows a batteries-included philosophy: file-based routing, image optimization, and metadata APIs are first-class. For freshers, think of React as the UI library and Next.js as the opinionated application layer that makes production-ready web apps easier to ship.

---

## 2. Why would you choose Next.js over Create React App or Vite + React alone?

Create React App is largely unmaintained for new projects, and a bare Vite + React setup gives you flexibility but no standard way to do SSR, file-based routing, or integrated API routes without extra libraries. Next.js gives you a clear mental model (especially with the App Router), server rendering out of the box, and optimizations like automatic code splitting per route. Teams pick Next.js when they care about SEO, faster first paint, or running server-side logic close to the database. It also scales well from marketing sites to complex dashboards because you can mix static generation, dynamic rendering, and streaming in one app. The trade-off is learning framework-specific APIs—but that investment pays off in consistency across projects.

---

## 3. What are the main pillars of modern Next.js (App Router era)?

Modern Next.js centers on the App Router (`app/` directory), React Server Components (RSC) by default, and colocated route segments (each folder can own `page`, `layout`, `loading`, `error`, etc.). Data fetching can happen on the server during the request (or at build time), and mutations often use Server Actions instead of only client-side `fetch` to REST APIs. Streaming and Suspense boundaries let the shell of a page arrive quickly while slower sections load progressively. Tooling like Turbopack (dev bundler) and ongoing improvements to caching and partial prerendering round out the “latest” story in Next.js 15 and beyond. Together these pillars aim for fast UX, simpler mental models for data, and better defaults for production.

---

## 4. How do you create a new Next.js project with the App Router?

Use the official CLI with your preferred package manager. The CLI scaffolds TypeScript, ESLint, Tailwind, and the `app/` directory depending on your choices.

```bash
npx create-next-app@latest my-app
cd my-app
npm run dev
```

During prompts, select App Router (default in recent versions), TypeScript if you want type safety, and Tailwind if you use utility CSS. After `npm run dev`, visit `http://localhost:3000` to verify the dev server. The `package.json` scripts `dev`, `build`, and `start` map to development, production build, and running the production server. For teams, pinning `next` to a known major version in `package.json` avoids surprise breaking changes when upgrading.

---

## 5. Describe the typical folder structure of a Next.js App Router project.

At the root you usually see `app/` (routes and UI), `public/` (static assets), `next.config.ts` or `next.config.mjs`, and `package.json`. Inside `app/`, each route segment is a folder: for example `app/dashboard/page.tsx` maps to `/dashboard`. Shared UI might live in `components/` at the project root or inside feature folders. Route groups like `app/(marketing)/` and `app/(app)/` organize URLs without adding extra path segments—parentheses mean “group for structure only.” Co-locating tests or styles next to components is a common pattern. Understanding this structure helps you navigate large codebases and predict URLs from the file tree.

---

## 6. What is the role of `next.config.js` / `next.config.ts`?

The Next.js config file customizes build behavior: redirects, rewrites, headers, image remote patterns, experimental flags, and more. It runs in the Node.js context during `next build` and `next dev`, so you can use environment-aware logic carefully. TypeScript users often use `next.config.ts` with `import type { NextConfig } from 'next'`. Misconfiguration here can break deployments—for example, overly strict `images.remotePatterns` will block `next/image` for unlisted domains. Freshers should treat this file as the single source of framework-level tweaks rather than scattering magic numbers across the app.

Example snippet:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "example.com" }],
  },
};

export default nextConfig;
```

---

## 7. How does Next.js differ from React when we talk about “routing”?

In client-only React, you typically add `react-router` (or similar) and define a route configuration or nested `<Routes>`. In Next.js App Router, the URL is derived from the filesystem: folders under `app/` define segments, and special files (`page.tsx`, `layout.tsx`) define UI for those segments. This reduces boilerplate and makes deep linking and code splitting automatic per route. Next.js also supports parallel routes, intercepting routes, and route groups for advanced layouts—features you would hand-roll with more complexity in plain React. The framework router is deeply integrated with RSC, so navigation can prefetch Server Component payloads, not just JS bundles.

---

## 8. What is the default rendering model in the App Router?

Server Components are the default: components in the `app/` tree are Server Components unless marked with `"use client"`. That means their output is rendered on the server (or during static generation, depending on the route’s dynamic behavior), and large dependencies can stay off the client bundle. Client Components hydrate in the browser and can use hooks like `useState` and browser APIs. This default pushes data fetching and heavy logic to the server when appropriate, shrinking what users download. Understanding “default server” is essential to avoid accidentally importing server-only modules into Client Components.

---

## 9. What is Turbopack, and when do you encounter it?

Turbopack is Next.js’s Rust-based bundler aimed at faster local development. In recent Next.js versions it is used for `next dev` (often behind a flag or as default depending on version), while production builds may still use webpack or evolve toward Turbopack for production over time—check the release notes for your exact version. Faster refresh means shorter feedback loops when editing large apps. If something works in dev but fails in production build, the difference in bundlers or `NODE_ENV` optimizations can be a debugging clue. Always verify with `next build` before shipping.

```bash
next dev --turbo
```

---

## 10. What mental model should a fresher use for “full-stack” in Next.js?

Think of route handlers (`route.ts`) and Server Actions as your backend endpoints living next to your UI. You still separate concerns: database access in server-only modules, validation on the server, and thin UI components. Authentication cookies are often handled on the server via middleware or Server Actions. This colocation speeds development but requires discipline—never trust the client for authorization. The same repo can serve static marketing pages, dynamic dashboards, and JSON APIs without deploying three separate services for small teams.

---

## 11. How does file-based routing work in the `app` directory?

Each folder under `app/` represents a URL segment. A file named `page.tsx` (or `.js`) makes that segment a navigable route. For example, `app/blog/[slug]/page.tsx` handles `/blog/my-post`. Without `page.tsx`, a folder can still participate as a layout segment if it has `layout.tsx`, but it won’t be a leaf route by itself. Dynamic segments use square brackets; catch-all routes use `[...slug]`, and optional catch-all uses `[[...slug]]`. This convention is predictable once you memorize the special filenames: `page`, `layout`, `template`, `loading`, `error`, `not-found`, `route`, `default`, etc.

---

## 12. What is a dynamic route segment, and how do you read its value?

Dynamic segments are folders named like `[id]` or `[slug]`. The `page` component receives a `params` prop (in Next.js 15+, `params` is a Promise in async server components—await it). Client Components receive `params` via props from a parent Server Component or using hooks like `useParams` from `next/navigation` in the client layer.

```tsx
// app/items/[id]/page.tsx
type Props = { params: Promise<{ id: string }> };

export default async function ItemPage({ params }: Props) {
  const { id } = await params;
  return <main>Item {id}</main>;
}
```

Always validate and sanitize `params` before using them in database queries to avoid injection issues.

---

## 13. What are nested layouts, and why are they powerful?

A `layout.tsx` wraps all child segments and persists across navigations within that subtree—ideal for sidebars, headers, and shared context that should not remount on every navigation. Layouts can be nested: `app/layout.tsx` wraps everything, while `app/dashboard/layout.tsx` wraps only `/dashboard/*`. This model avoids prop-drilling global chrome across every page component. Loading states can be scoped: a parent layout stays stable while a child `loading.tsx` shows a skeleton. For freshers, remember layouts are shared shells; `page.tsx` is the unique content for the route.

---

## 14. What are Route Groups, and how do they affect the URL?

Route Groups are folders wrapped in parentheses, e.g. `app/(shop)/` and `app/(site)/`. They do not add a segment to the URL—they only organize code and layouts. Two different groups can define different root layouts for different sections without changing paths. This keeps marketing and authenticated app experiences cleanly separated. Route Groups are also used for parallel route organization in advanced patterns.

---

## 15. What is the difference between `layout.tsx` and `template.tsx`?

Both wrap child routes, but `layout` state persists across navigations within its segment, while `template` remounts on navigation—resetting local state and effects for each visit. Use `layout` for durable UI chrome; use `template` when you need enter/exit animations or to reset client state on every navigation to a child. Many apps never need `template.tsx`, but interviewers like knowing you understand remounting behavior.

---

## 16. How do you create a link between pages in the App Router?

Use the `<Link>` component from `next/navigation` for client-side transitions that prefetch routes in production. Prefetching loads linked route segments ahead of time for snappier UX.

```tsx
import Link from "next/link";

export function Nav() {
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
    </nav>
  );
}
```

Avoid `<a href>` for internal navigation if you want SPA-like behavior, though plain anchors are fine for external URLs. For programmatic navigation, use `useRouter()` from `next/navigation` in Client Components.

---

## 17. What are loading UI and Suspense boundaries in routing?

`loading.tsx` is a special file that wraps the route segment in a React Suspense boundary automatically, showing fallback UI while the server-rendered content or async data is pending. You can also add explicit `<Suspense fallback={...}>` in your own components for finer control. Streaming means users see meaningful UI sooner instead of staring at a blank screen. This pattern pairs naturally with async Server Components that await data.

---

## 18. How does Next.js handle a `not-found` case for a specific route?

You can call `notFound()` from `next/navigation` inside a Server Component or route handler when a resource is missing; Next.js will render the nearest `not-found.tsx`. You can also add `app/not-found.tsx` for global 404 UI. For dynamic routes, this is cleaner than returning empty JSX with a manual message—HTTP semantics stay correct when paired with proper status handling in route handlers.

```tsx
import { notFound } from "next/navigation";

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser(id);
  if (!user) notFound();
  return <div>{user.name}</div>;
}
```

---

## 19. What is the purpose of `default.tsx` in parallel routes?

When using parallel routes (`@folder` slots), a `default.tsx` provides fallback UI when Next.js cannot render an active slot—for example on hard reload or direct navigation. Without defaults, the framework may show a blank or error state for missing parallel slots. This is an advanced routing topic but demonstrates deep App Router knowledge. Parallel routes are common in dashboards with modals and side panels.

---

## 20. How do you think about “colocation” in the App Router?

Colocation means placing components, styles, tests, and even server-only utilities near the route that uses them. The App Router encourages small `page.tsx` files that compose local components rather than giant pages. Server-only modules can live next to routes if imported only from Server Components or server code—use the `server-only` package to enforce that boundary and prevent accidental client imports. Colocation improves discoverability: developers find everything for `/billing` under `app/billing/` or a nearby feature folder.

---

## 21. What is `page.tsx`, and what exports does it support?

`page.tsx` defines the UI unique to a route segment. It default-exports a React component. In the App Router, you can also export `metadata` (static) or `generateMetadata` (dynamic) from the same file for SEO—see metadata section later. Pages can be async Server Components, which is the idiomatic way to await data fetching at the source. Do not confuse `page` with `route.ts`, which handles HTTP methods for API-like endpoints.

---

## 22. Explain root `app/layout.tsx` and why `children` matters.

The root layout is required and must include `<html>` and `<body>` tags (unless migrated carefully with documentation—conventionally they live here). It receives `children` representing matched child segments. Providers for Client Components (theme, state) are often placed in a small client wrapper imported into the root layout. Keeping the root layout lean avoids rerendering huge trees. Any font or global style imports might be configured here alongside `metadata`.

```tsx
// app/layout.tsx
import type { ReactNode } from "react";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

---

## 23. When would you use `template.tsx` instead of extra Client Components?

Use `template` when the remounting behavior should apply to an entire subtree on navigation without scattering `key` props manually. For example, a multi-step wizard might reset when switching sibling routes under the same layout. If only a small widget needs resetting, local state or `key` on that widget might suffice—`template` is the route-level hammer. Discussing trade-offs shows mature judgment.

---

## 24. What does `loading.tsx` do under the hood?

`loading.tsx` provides an instant fallback UI while the route’s async work completes. Next.js wraps the route segment’s content in Suspense automatically for that segment. This improves perceived performance, especially on slow networks. You can nest `loading` files at different depths so only a section shows a spinner. Combine with skeleton components for polished UX rather than generic “Loading…” text.

---

## 25. How does `error.tsx` work, and what are its constraints?

`error.tsx` defines an error boundary for a route segment—it catches runtime errors in Server or Client Components below it (not errors thrown in root layout during initial load in the same way—see docs for root error handling patterns). It must be a Client Component because error boundaries in React are client-side constructs in the App Router model. Export a function that receives `error` and `reset` to retry rendering. Use it for recoverable UI failures; for expected not-found cases prefer `notFound()`.

```tsx
"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
```

---

## 26. What is the difference between an error in `error.tsx` and returning an error response in a Route Handler?

`error.tsx` handles rendering failures and unexpected exceptions in the UI tree for that segment. A Route Handler (`route.ts`) returns HTTP responses—404, 500, JSON errors—directly to clients. APIs are often consumed by non-React clients, so they need explicit status codes. Confusing these leads to poor API contracts or masked UI bugs. For data-fetch errors inside RSC, you may handle them with `try/catch` or error boundaries depending on desired UX.

---

## 27. How do you implement a global `not-found` page?

Add `app/not-found.tsx` for custom 404 UI across the app. Additionally, `notFound()` triggers this when invoked from nested routes. You can include helpful navigation links back to home. For internationalized apps, you might nest `not-found` under localized segments. Remember that styling should remain consistent with your design system—404 pages are still brand touchpoints.

---

## 28. Can you have multiple `layout.tsx` files in one route branch?

Yes—layouts nest. Each segment can define its own `layout.tsx` that wraps deeper routes. The outer layout renders first and composes `children` with inner layouts. This enables section-specific navigation without duplicating wrappers in every `page.tsx`. Be mindful of depth: too many nested async boundaries can complicate debugging—sometimes a single layout with conditional rendering is simpler.

---

## 29. What is the role of `generateStaticParams` for dynamic routes?

For dynamic segments, `generateStaticParams` lets you prebuild popular paths at build time (static site generation for those paths). It pairs with static rendering when data is known ahead of time—great for blogs and docs. Paths not generated can still be handled with dynamic rendering or on-demand ISR depending on configuration. This function runs at build time and should be efficient—avoid fetching thousands of rows unnecessarily.

```tsx
export async function generateStaticParams() {
  const posts = await getPostSlugs();
  return posts.map((slug) => ({ slug }));
}
```

---

## 30. How do parallel and intercepting routes help UX?

Parallel routes (`@analytics`, `@team` slots) render multiple pages in the same layout simultaneously—useful for dashboards. Intercepting routes let you show a modal for a photo detail while keeping the background route—great for galleries (`(.)photo` segments). These patterns are advanced but illustrate how App Router models complex UI in a file-system-first way. They rely on conventions and naming discipline—great for interviews when discussing Instagram-like UX.

---

## 31. What is a React Server Component (RSC) in Next.js?

An RSC is a React component that runs on the server and sends a serialized payload to the client rather than shipping all its code to the browser. It can directly access backend resources (database, private env vars) without exposing them. RSC cannot use interactive hooks like `useState` because there is no persistent component instance in the browser for that logic—interactivity belongs in Client Components. Next.js composes RSC trees with client islands where needed. This model reduces bundle size and improves security for data access patterns.

---

## 32. What does the `"use client"` directive do?

Marking a file with `"use client"` at the top designates it as a Client Component boundary. Everything imported into that module graph is considered client-bound unless split out. Client Components can use state, effects, and browser APIs. You should push `"use client"` as deep as possible—only wrap interactive leaves—so the rest of the tree stays on the server. Server Components cannot import Client Components unless they are children passed as props (composition), not direct imports that break the server boundary rules—use children slots pattern.

```tsx
"use client";

import { useState } from "react";

export function Counter() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}
```

---

## 33. Why can’t you use `useState` in a Server Component?

Server Components execute during the render pass on the server to produce UI; there is no long-lived component instance in the browser to hold state between interactions. `useState` requires client-side reconciliation and event handling. If you need interactivity, extract a Client Component. Trying to use hooks in a Server Component causes build errors—this boundary is intentional to keep mental models clear. For server-side mutable workflows, use forms and Server Actions or external stores on the server.

---

## 34. How do you pass data from a Server Component to a Client Component?

Pass serializable props—objects, strings, numbers, arrays of plain data. You cannot pass functions, class instances, or non-serializable values unless using experimental documented patterns for specific cases. The server serializes props to the client bundle boundary. For callbacks, lift Client Components or use Server Actions triggered from client events. Misunderstanding serialization causes confusing runtime errors—stick to plain data transfer.

```tsx
// Server Component
import { ClientChart } from "./client-chart";

export default async function Page() {
  const data = await fetchMetrics(); // serializable JSON-like data
  return <ClientChart data={data} />;
}
```

---

## 35. What is the “server-only” / “client-only” package for?

`server-only` throws at build time if a module is imported from a Client Component, protecting secrets and database code. `client-only` marks modules that must not run on the server—useful for browser APIs. These packages document intent and prevent accidental boundary crossings. In interviews, mentioning them signals production awareness beyond tutorials.

```ts
import "server-only";

export async function getSecret() {
  return process.env.API_SECRET;
}
```

---

## 36. Can Server Components fetch data directly?

Yes—`async` Server Components can `await fetch()` or call database clients directly. This colocates data with UI and avoids creating redundant API layers for every screen. Ensure queries are efficient and cached appropriately using Next.js fetch caching semantics or `unstable_cache` where applicable. For highly dynamic data, opt into `no-store` or revalidation strategies. This direct access is one of the biggest productivity wins in Next.js 15+.

---

## 37. What are common pitfalls when mixing Server and Client Components?

Importing a Client Component into a Server file is fine, but passing non-serializable props is not. Importing server-only utilities into `"use client"` files breaks the build or leaks secrets. Putting too much in Client Components bloats bundles—keep clients thin. Another pitfall is fetching the same data twice on server and client due to misunderstanding caching—profile network and RSC payloads. Thoughtful boundaries keep apps fast and secure.

---

## 38. How does Next.js help with bundle size compared to traditional SPAs?

Server Components stay off the client bundle; only Client Components and their dependencies ship to the browser. Code splitting happens along route lines automatically. `next/dynamic` can lazy-load heavy client modules. Images and fonts are optimized by framework primitives. The net effect is smaller downloads and faster Time to Interactive for many apps. Always measure with Lighthouse and bundle analyzers—assumptions without metrics can mislead.

---

## 39. What is Partial Prerendering (PPR), conceptually?

Partial Prerendering is a Next.js feature direction (check stable/experimental status in your version) that combines static shells with dynamic holes in the same page, so the outer layout can be cached at the edge while personalized or slow sections stream in. It aims to get the benefits of static performance without sacrificing dynamic data where needed. Understanding PPR shows you follow cutting-edge Next.js roadmap items—pair answers with “verify experimental flags in `next.config`.” It relates closely to Suspense and caching boundaries.

---

## 40. When should you reach for `use client` at the file level vs wrapping a subcomponent?

Prefer leaf components: create `Counter.tsx` with `"use client"` and import it into a Server `page.tsx`. File-level `"use client"` on large files pulls more code client-side than necessary. If everything is interactive, a client page may be justified—some highly dynamic dashboards are mostly client. The rule of thumb is to keep server surface area maximal for performance and security. Interviewers reward mentioning “push the boundary down.”

---

## 41. How does `fetch` behave in Next.js Server Components regarding caching?

By default in many App Router versions, `fetch` requests are cached across requests (akin to static data) unless you opt out—always confirm behavior for your Next.js major version in the official docs, as defaults have evolved. You can tag requests and revalidate them with `revalidateTag` or use `cache: 'no-store'` for fully dynamic data. For third-party SDKs that don’t use `fetch`, caching may differ—wrap with `unstable_cache` or move logic into route handlers. Misunderstanding defaults causes stale UI or accidental database hits every request.

```tsx
const res = await fetch("https://api.example.com/items", {
  next: { revalidate: 60, tags: ["items"] },
});
```

---

## 42. What is `revalidatePath` and `revalidateTag`?

These functions invalidate cached data after mutations. `revalidateTag` ties to `fetch` tags you set in `next` options; `revalidatePath` refreshes a specific route’s cached RSC payload after a Server Action completes. They keep showing fresh lists after creating a record without manual client refetch spaghetti. Use them inside Server Actions on successful writes. Understanding invalidation strategy is key to correct UX in cached apps.

```ts
import { revalidatePath } from "next/cache";

export async function createPost() {
  "use server";
  await db.post.create(/* ... */);
  revalidatePath("/posts");
}
```

---

## 43. What is the Request Memoization concept in React for `fetch`?

Within a single server request, identical `fetch` calls may be deduplicated so components don’t trigger duplicate queries accidentally when composing trees. This improves performance and avoids inconsistent data within one render pass. It is not a substitute for application-level caching across different user requests—those layers remain governed by `fetch` cache and Next data cache rules. Clarifying request memoization vs cross-request caching demonstrates depth.

---

## 44. How do you fetch data on the client in App Router apps?

Use `useEffect` + `fetch`, SWR, React Query, or server-driven patterns that pass initial data as props from a Server Component. Prefer starting with server-fetched initial data for SEO and performance, then client refetch for interactivity if needed. For search-param driven lists, you may fetch in a Client Component when the URL updates frequently—balance with loading UX. Avoid waterfalls: parallelize independent requests with `Promise.all` on the server when possible.

---

## 45. What are static vs dynamic rendering decisions?

If a route uses non-cacheable dynamic functions (`cookies()`, `headers()`, or `fetch` with `no-store`), Next may treat the route as dynamic. Static routes can be generated at build time or cached aggressively at the edge. Dynamic rendering personalizes per request but costs more compute. Choose static for public content, dynamic for authenticated or real-time views—Next lets you mix both in one app. Profiling and product requirements should drive the choice, not dogma.

---

## 46. How does streaming improve data-heavy pages?

With Suspense, the HTML response can be sent in chunks: shell first, deferred sections later. Users see layout and placeholders quickly, improving Core Web Vitals like LCP when used thoughtfully. Streaming pairs with async Server Components awaiting slow sources. Ensure fallbacks are accessible—announce loading politely for screen readers when appropriate. This is a hallmark of modern React SSR architectures.

---

## 47. What is `unstable_cache` (and when is it used)?

`unstable_cache` wraps expensive functions—database queries or non-`fetch` IO—with caching keyed by inputs and optional tags/revalidate windows. It fills gaps where `fetch` caching doesn’t apply. Because APIs may evolve, check current docs and stability notes. Tag-based revalidation integrates with `revalidateTag` for coherent invalidation after mutations. Use it to avoid hammering databases on hot routes.

---

## 48. Can you use a REST API route instead of direct DB calls from RSC?

Yes—calling internal `/api` routes from Server Components is possible but often adds unnecessary network hops compared to calling server modules directly. Internal APIs make sense for shared endpoints consumed by mobile apps or third parties. For purely server-side rendering, direct module calls are simpler and faster. Architectural consistency sometimes still favors API layers in large orgs—be ready to discuss trade-offs.

---

## 49. What is the difference between client-side caching libraries and Next.js server caching?

Client libraries (React Query) manage browser cache, background refetch, and optimistic updates for interactive UX. Next.js server caching governs what gets computed on the server between requests and deployments. You may use both: server for initial truth, client for live updates after hydration. Conflicts arise if you duplicate sources of truth—document patterns for invalidation. Freshers should articulate layered caching clearly.

---

## 50. How would you debug stale data in a Next.js app?

Check `fetch` cache settings, `revalidate` intervals, and whether Server Actions call `revalidatePath`/`revalidateTag`. Inspect if CDN or hosting caches responses outside Next. Use logging on the server to verify data timestamps. Temporarily set `cache: 'no-store'` to confirm caching is the culprit. Systematic elimination beats guessing—especially under interview pressure.

---

## 51. What are Server Actions, and how do you declare one?

Server Actions are asynchronous functions that run on the server, invoked from forms or Client Components (with serialization boundaries). Define them with `"use server"` at the top of a file or function body. They replace much boilerplate of manual API routes for mutations tied to UI. Always validate inputs server-side and authorize the user—never trust the client.

```tsx
// app/actions.ts
"use server";

import { revalidatePath } from "next/cache";

export async function addTodo(formData: FormData) {
  const title = String(formData.get("title") ?? "");
  if (!title) return;
  await db.todo.create({ data: { title } });
  revalidatePath("/todos");
}
```

---

## 52. How do you wire a Server Action to a `<form>`?

Use the `action` prop with the async function directly in a Server Component form, or pass the action to a Client form when needed. Progressive enhancement works: users without JS may still submit depending on setup—Server Actions align with modern form handling. Show pending states with `useFormStatus` in nested client buttons for UX polish.

```tsx
import { addTodo } from "./actions";

export default function Page() {
  return (
    <form action={addTodo}>
      <input name="title" />
      <button type="submit">Add</button>
    </form>
  );
}
```

---

## 53. Can Server Actions return data to the client?

Yes—they can return serializable objects that React passes back to the caller when invoked from the client, but think of them primarily as mutation endpoints, not a general RPC layer. Handle validation errors by returning structured results `{ ok: false, error: "..." }` rather than throwing for expected cases if you want clean UX. For complex queries, prefer RSC data fetching or route handlers. Abuse of actions for reads can blur architecture—stay disciplined.

---

## 54. How do you secure Server Actions?

Authenticate using sessions/cookies readable only on the server, authorize every action against the user’s roles, validate and sanitize inputs (zod is popular), and rate-limit sensitive operations at the edge or server. Never expose private keys to the client. Treat actions like public endpoints—attackers can invoke them. Logging and monitoring help detect abuse.

---

## 55. What is the relationship between Server Actions and forms libraries?

Libraries like React Hook Form can submit via Server Actions by calling `action` on submit handlers or using hidden forms patterns—integration stories vary; check current examples. Native form actions remain attractive for simplicity. For highly dynamic client validation, client libraries still shine—combine client validation UX with server validation truth. Mentioning defense in depth impresses interviewers.

---

## 56. What is SSR (Server-Side Rendering) in Next.js terms?

SSR means generating HTML per request (or per dynamic context) on the server so clients receive a fully formed document. In App Router, this often happens via dynamic server rendering when cookies, headers, or `no-store` data are involved. SSR improves SEO and first paint for content that cannot be static. Costs include server compute per request—optimize queries and caches. Contrast SSR with static generation where HTML is produced ahead of time.

---

## 57. What is SSG (Static Site Generation)?

SSG pre-renders pages at build time into static assets served quickly from CDN. Ideal for blogs, marketing pages, and documentation. In App Router, static behavior emerges when routes use only cacheable data and no dynamic APIs. `generateStaticParams` enumerates dynamic paths to prebuild. Updates require rebuilds or ISR strategies unless you rely on on-demand revalidation patterns.

---

## 58. What is ISR (Incremental Static Regeneration)?

ISR serves static pages but regenerates them in the background after a time interval or on-demand when revalidation APIs trigger. It combines static speed with fresher data. In App Router, ISR maps to `revalidate` in `fetch` or segment config `export const revalidate = 3600`. Tune intervals based on data volatility—too frequent negates static benefits; too rare shows stale content. Monitor build and regeneration costs at scale.

```tsx
export const revalidate = 3600; // seconds

export default async function Page() {
  const res = await fetch("https://api.example.com/quote", { next: { revalidate: 3600 } });
  const data = await res.json();
  return <div>{data.text}</div>;
}
```

---

## 59. How does streaming SSR differ from classic “wait for all data” SSR?

Classic SSR may buffer the entire response until all data resolves, delaying TTFB. Streaming sends early HTML and flushes later segments as promises resolve—better perceived latency. Next uses React streaming with Suspense boundaries. Ensure your hosting supports streaming-compatible responses. This is a common senior talking point that freshers can summarize conceptually.

---

## 60. What is client-side rendering (CSR) in a Next app?

CSR refers to rendering primarily in the browser after JS loads—common for highly interactive islands. In Next, pure CSR for the whole page is usually avoided for public content because it hurts SEO and first paint. Still, Client Components hydrate and handle post-load interactions. Understanding hydration—attaching event listeners to server HTML—is important when debugging mismatches. Balancing CSR islands with RSC is modern best practice.

---

## 61. What is the Edge Runtime vs Node.js Runtime for routes?

Next.js can run some route handlers and middleware on the Edge—lightweight, geographically distributed, but with restricted Node APIs. The Node.js runtime supports full ecosystem compatibility for database drivers that need TCP. Choose Edge for auth redirects, geolocation, or small transforms; choose Node for heavy IO and traditional ORMs unless Edge-compatible libraries exist. Misruntime errors (`fs` not available) are common fresher pitfalls.

```ts
export const runtime = "nodejs"; // or "edge" where supported
```

---

## 62. How does `dynamic` route segment config work?

Export `const dynamic = 'force-static' | 'force-dynamic' | 'auto'` (and related options) from `page.tsx` or `layout.tsx` to override rendering behavior explicitly when defaults are unclear. Use sparingly—prefer structuring data fetching to imply the right mode. Overrides help when refactoring legacy code or debugging caching surprises. Always consult the latest docs for allowed values in your Next version.

---

## 63. What is `fetchCache` / segment fetch caching controls?

Segment-level options can influence how `fetch` caching applies within a subtree (exact APIs have evolved by version). The goal is centralized control for routes with mixed data needs. When interviewers ask, explain the intent: tune caching at the route boundary to avoid repeating configuration on every `fetch`. Pair with tags and revalidation for maintainable cache busting.

---

## 64. How do Suspense boundaries relate to rendering strategy?

Suspense separates UI into independent async units, enabling partial streaming and finer-grained loading states. Server Components can `await` inside children wrapped by Suspense without blocking siblings. This modularity improves both UX and code organization. Too many tiny boundaries can complicate traces—balance clarity with performance.

---

## 65. What metrics should you mention when discussing rendering choices?

TTFB (time to first byte), FCP (first contentful paint), LCP (largest contentful paint), CLS (cumulative layout shift), and TTI (time to interactive) matter for user experience. SSR/SSG help LCP for text-heavy pages; excessive client JS hurts TTI. Use Next primitives to optimize images/fonts—rendering strategy is only part of the story. Showing awareness of Core Web Vitals proves production mindset.

---

## 66. What is `middleware.ts` in Next.js?

Middleware runs on the Edge before a request finishes, letting you rewrite, redirect, or modify headers for authentication, A/B tests, or geolocation. It can short-circuit requests to protect routes early. Keep middleware fast—avoid heavy DB calls; prefer token verification with cached keys. Place `middleware.ts` at the project root (or `src/` root) per conventions.

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("session");
  if (!token && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
```

---

## 67. How do redirects differ from rewrites?

Redirects tell the client to go to a new URL (301/302/307/308)—visible in the browser address bar. Rewrites internally map a public URL to a different internal path without the user seeing the change—useful for proxies or legacy paths. Configure both in `next.config` or via `next/navigation` helpers for imperative redirects in Server Components. Choose redirects for canonical URLs; rewrites for implementation hiding.

```ts
// next.config.ts (conceptual)
async redirects() {
  return [{ source: "/old", destination: "/new", permanent: true }];
},
async rewrites() {
  return [{ source: "/blog", destination: "https://cms.example.com/blog" }];
},
```

---

## 68. When would you use `NextResponse.rewrite` in middleware?

When you need conditional routing based on cookies, A/B buckets, or feature flags—rewrite to different app paths server-side. This enables experiments without exposing multiple public URLs. Combine with careful caching headers to avoid CDN serving the wrong variant broadly. Document rewrite rules so teammates aren’t surprised by invisible routes.

---

## 69. Can middleware call a database?

Technically possible in some setups, but Edge middleware has limitations—prefer fast cryptographic verification or edge-friendly stores. For heavy lookups, consider checking lightweight session validity in middleware and deferring detailed authorization to Server Components or route handlers running in Node. Performance and cold start behavior matter—middleware runs on every matched request.

---

## 70. How do internationalization and middleware work together?

Middleware can detect `Accept-Language` or URL prefixes like `/en` and rewrite to localized routes. `next-intl` and similar libraries integrate with this pattern. Ensure SEO with `hreflang` metadata and consistent URL structures. i18n is a common enterprise requirement—knowing middleware’s role shows readiness for real products.

---

## 71. Why use `next/image` instead of `<img>`?

`next/image` automatically serves responsive sizes, modern formats where supported, and prevents layout shift when combined with width/height or `fill`. It can optimize loading priority (`priority` for LCP images) and integrates with configured remote patterns for security. The Image Optimization API (or static import pipeline) reduces bytes shipped to users. Always size images appropriately—optimization doesn’t replace art direction and good source assets.

```tsx
import Image from "next/image";
import pic from "./photo.jpg";

export function Hero() {
  return <Image src={pic} alt="Team" placeholder="blur" priority />;
}
```

---

## 72. What are `remotePatterns` / `domains` in image config?

They restrict which external image URLs `next/image` is allowed to optimize, mitigating abuse where attackers pass arbitrary URLs through your renderers. Prefer `remotePatterns` for fine control over protocol, hostname, and pathname. After config changes, rebuild or restart dev server as needed. Lock down sources in production—open configs are a cost and security risk.

---

## 73. How does the `fill` prop work on `next/image`?

`fill` makes the image stretch to its positioned parent—useful for unknown aspect ratios in cards when the parent defines size. Pair with `object-fit` via `className` for cropping behavior. Without a sized parent, layout can collapse—always set parent `position: relative` and dimensions. This prop is common in responsive layouts.

```tsx
<div className="relative h-64 w-full">
  <Image src="/banner.jpg" alt="Banner" fill className="object-cover" />
</div>
```

---

## 74. Why use `next/font` (Google and local fonts)?

`next/font` self-hosts fonts, removes extra network round trips to third-party font CDNs, and applies `font-display` strategies to reduce invisible text flashes. It generates CSS variables for consistent theming across layouts. Fewer layout shifts occur when paired with sizing strategies. This integrates tightly with Core Web Vitals—especially CLS.

```tsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

---

## 75. How do you avoid common image mistakes in Next.js?

Specify accurate `alt` text for accessibility, avoid gigantic unoptimized source images expecting automatic miracles, and don’t mark every image as `priority`—only true LCP candidates. For SVGs as icons, sometimes inline or `next/image` depending on need—vectors may not need the image optimizer. Test on slow networks; use placeholders (`blur`) for better perceived performance.

---

## 76. How do you set page metadata in the App Router?

Export a `metadata` object or `generateMetadata` function from `layout.tsx` or `page.tsx`. This replaces manual `<head>` manipulation for many cases and integrates with streaming RSC. Dynamic metadata can depend on route params or fetched data—great for SEO titles on detail pages.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Acme",
  description: "About our company",
  openGraph: { title: "About — Acme" },
};
```

---

## 77. What is the Metadata API advantage over `next/head` from Pages Router?

The Metadata API is declarative, colocated with routes, and designed for streaming and deduplication in RSC. It reduces bugs from duplicated tags across nested components. For migration projects, mental model shifts matter—new apps should prefer Metadata API in `app/`. Consistency across nested layouts is easier with composable rules.

---

## 78. How do you implement dynamic SEO for a blog post route?

Use `generateMetadata` with `params` to fetch the post and return a title/description, canonical, and Open Graph images. Handle missing posts with `notFound()`. Ensure URLs are absolute for OG image links. Good SEO is a system: structured data (JSON-LD), sensible headings, and fast LCP matter alongside metadata.

```tsx
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}
```

---

## 79. What role do sitemaps and `robots.txt` play, and how does Next help?

Sitemaps help crawlers discover URLs; `robots.txt` guides allowed paths. Next provides `app/sitemap.ts` and `app/robots.ts` to generate these dynamically from your data layer—better than static files for large sites. Keep them accurate—stale sitemaps waste crawl budget. Link sitemap URLs in Search Console when operating real products.

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://example.com", lastModified: new Date() }];
}
```

---

## 80. How do Open Graph and Twitter cards relate to Next metadata?

They control how links appear on social platforms—title, description, image, and card type. Next’s `metadata.openGraph` and `metadata.twitter` fields output the right tags. Test with platform debuggers (Facebook, Twitter) because caching is aggressive—cache-bust images when updating OG graphics. Good cards improve click-through rates for shared content.

---

## 81. What are Route Handlers (`route.ts`) in the App Router?

Route Handlers replace much of API routes from the Pages Router: define `GET`, `POST`, etc., in `app/api/.../route.ts`. They run on the server and return `Response` objects. Use them for JSON APIs, webhooks, and integrations with non-React clients. They participate in caching controls differently than pages—be explicit about dynamic behavior.

```ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true });
}
```

---

## 82. How do you read `request` data in a POST handler?

Use `request.json()`, `request.formData()`, or `request.text()` depending on content type. Validate payloads with zod or similar. Return appropriate HTTP status codes—400 for bad input, 401 for auth failures. For file uploads, consider streaming and size limits. Never trust client-sent user IDs without verifying session ownership.

```ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  return NextResponse.json({ created: true });
}
```

---

## 83. Can Route Handlers be cached?

Some `GET` handlers may be statically optimized if they don’t use dynamic APIs—verify with documentation for your version. For dynamic APIs, mark `export const dynamic = 'force-dynamic'` or use `request` signals that imply dynamism. Misconfigured caching on authenticated endpoints is a security bug—default to safe, private responses when in doubt by setting cache control headers explicitly.

---

## 84. How do Route Handlers compare to Server Actions?

Route handlers are great for public APIs, webhooks, and mobile clients; Server Actions excel at web form mutations tightly coupled to React. Actions abstract away some HTTP details; handlers give explicit REST semantics. Some teams expose handlers for third parties and actions for internal UI. Choosing between them is an architecture decision—interviews reward clear comparisons.

---

## 85. What CORS considerations exist for Route Handlers?

If browsers call your API cross-origin, configure `Access-Control-Allow-*` headers and handle `OPTIONS` preflight for non-simple requests. For same-site Next apps calling same-origin `/api`, CORS is often unnecessary. Public APIs need deliberate CORS policies—too permissive invites abuse; too strict breaks legitimate clients.

---

## 86. How do CSS Modules work in Next.js?

Files named `*.module.css` export class names that are locally scoped to avoid global collisions. Next wires them up with bundler support out of the box. This is great for component-scoped styling without runtime CSS-in-JS costs. Compose classes and use `:global()` sparingly when integrating third-party classes.

```tsx
import styles from "./Button.module.css";

export function Button() {
  return <button className={styles.primary}>Save</button>;
}
```

---

## 87. How is Tailwind CSS typically integrated?

Tailwind is configured via `tailwind.config.ts` and `postcss.config` with directives in `globals.css`. Utility-first styling speeds iteration and keeps design tokens consistent. Use the class merge pattern (`clsx` + `tailwind-merge`) to avoid conflicting utilities in components. Purge/content scanning includes `app`, `components`, etc.—misconfigured content paths cause missing styles in production.

---

## 88. What is styled-jsx, and is it still relevant?

styled-jsx provides scoped CSS in Next.js examples historically via `<style jsx>` blocks. It remains usable but is less central now that Tailwind and CSS Modules dominate many teams. Know it exists for legacy codebases. Pick technologies your team standardizes on—consistency beats novelty.

---

## 89. How do you avoid CSS conflicts between global and modular styles?

Keep resets and design tokens in global CSS; scope component styling with Modules or Tailwind utilities. Avoid overly broad global selectors that fight component styles. Establish naming conventions for layout vs presentational classes. Debugging specificity issues is time-consuming—prevention via scoping pays off.

---

## 90. Can you use Sass or Less with Next?

Yes—install `sass` and import `.scss` files; Next’s bundler supports them. This helps teams migrating existing design systems. Maintain clear folder structure for variables and mixins to avoid import cycles. For new greenfield projects, many teams pick Tailwind—but Sass remains valid.

---

## 91. How do environment variables work in Next.js?

Use `.env.local` for secrets in local dev (gitignored). Variables prefixed `NEXT_PUBLIC_` are exposed to the browser bundle; everything else is server-only. Never place private keys in `NEXT_PUBLIC_`. For multi-environment deployments, configure env vars in the hosting provider UI. Next loads `.env*` files automatically with precedence rules documented officially.

```bash
# .env.local (server-only)
DATABASE_URL="postgres://..."
# public to browser
NEXT_PUBLIC_SITE_URL="https://example.com"
```

---

## 92. What is the difference between `next dev` and `next build && next start`?

`next dev` enables hot reloading, verbose diagnostics, and slower unoptimized behavior—never use as production. `next build` creates an optimized production bundle with static assets and server traces; `next start` serves it. CI should run `build` to catch type and compile errors early. Performance testing belongs to production mode—dev timings mislead.

---

## 93. What belongs in `next.config` for images, env, and experimental flags?

Centralize image remote patterns, set `reactStrictMode`, toggle `experimental` features like PPR when ready, and configure `typescript.ignoreBuildErrors` only as a temporary escape hatch—fix types instead. Keep config readable with comments for non-obvious flags. Review upgrades across Next major versions—experimental flags change frequently.

---

## 94. How do you manage configuration across staging and production?

Use environment variables per environment, separate projects in Vercel or your host, and secrets managers for sensitive values. Avoid committing `.env.production` with secrets. Feature flags may live in env or external services. Document required variables in README for onboarding—freshers benefit from clear checklists.

---

## 95. What TypeScript setup specifics matter for Next apps?

Enable `strict` mode for safer refactors. Use `next-env.d.ts` generated types and `paths` aliases in `tsconfig` for clean imports. For Server Actions and RSC, typings for `params` promises and serializable props reduce mistakes. Run `tsc` in CI in addition to `next build` if needed—catch issues faster.

---

## 96. Where do people commonly deploy Next.js apps?

Vercel is the reference platform with zero-config integrations, but AWS, GCP, Netlify, and self-hosted Node servers also work. Self-hosting requires understanding `output` modes—`standalone` Docker images are popular for Kubernetes. Edge features may depend on provider capabilities. Choose based on compliance, cost, and team expertise—not hype alone.

```js
// next.config.mjs — standalone output for Docker
/** @type {import('next').NextConfig} */
const nextConfig = { output: "standalone" };
export default nextConfig;
```

---

## 97. What happens during `next build`?

Next compiles pages, optimizes images pipeline configuration, tree-shakes client bundles, prerenders static segments, and emits server manifests. Warnings about dynamic usage appear when routes cannot be static. Build failures should block deploy—fix before release. Large builds may need memory tuning in CI (`NODE_OPTIONS=--max-old-space-size`).

---

## 98. What basic performance checklist applies to Next projects?

Optimize images/fonts, minimize client JS by favoring RSC, measure Core Web Vitals, cache server fetches appropriately, and audit bundle size with analyzer tools. Use meaningful loading skeletons and avoid layout shift. Performance is iterative—profile real user metrics, not only lab scores. Small changes compound at scale.

---

## 99. What security basics should freshers remember?

Validate inputs on the server, authenticate requests properly, set secure cookies (`HttpOnly`, `Secure`, `SameSite`), protect against CSRF for cookie-based auth flows (framework patterns vary—study your auth library), and avoid exposing secrets via `NEXT_PUBLIC_`. Keep dependencies updated and scan for vulnerabilities. Security is non-negotiable even in frontend-heavy roles.

---

## 100. How do you keep learning as Next.js evolves quickly?

Read official release notes each major version, follow RFC discussions, build small experiments toggling new flags, and maintain a toy project upgraded regularly. Compare App Router mental models with older Pages Router only when maintaining legacy apps. Community courses help, but source-of-truth docs beat outdated blog posts—verify dates and versions. Continuous learning is part of the job, not optional.

---
