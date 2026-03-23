# 200 Next.js 15 Real-Time Assignments

> Stack: **Next.js 15**, **App Router**, **React Server Components**, **Server Actions**, **Turbopack**, **Partial Prerendering**, streaming, parallel & intercepting routes.

---

## BEGINNER LEVEL (Assignments 1–70)

### Project Setup (1–6)

**Assignment 1:** Scaffold a new Next.js 15 project with TypeScript using `create-next-app` and the App Router.

**Assignment 2:** Explain and document the default App Router folder structure (`app/`, `public/`, config files) after creation.

**Assignment 3:** Create a minimal `app/page.tsx` and `app/layout.tsx` that render a site title and children.

**Assignment 4:** Configure `npm` scripts for development (`next dev` with Turbopack), production build, and production start.

**Assignment 5:** Enable strict TypeScript settings in `tsconfig.json` suitable for a Next.js 15 app.

**Assignment 6:** Load and use environment variables in both server and client contexts (`NEXT_PUBLIC_` vs server-only).

### Routing (7–20)

**Assignment 7:** Add a static route `app/about/page.tsx` linked from the home page.

**Assignment 8:** Create a nested route `app/dashboard/page.tsx` with its own content.

**Assignment 9:** Implement a dynamic segment `app/posts/[slug]/page.tsx` that displays the slug.

**Assignment 10:** Add a catch-all route `app/docs/[...slug]/page.tsx` that joins slug segments.

**Assignment 11:** Add an optional catch-all `app/optional/[[...slug]]/page.tsx` that works with or without segments.

**Assignment 12:** Use route groups: `app/(marketing)/page.tsx` and `app/(app)/dashboard/page.tsx` without affecting the URL.

**Assignment 13:** Add `app/loading.tsx` for a route segment to show a loading UI.

**Assignment 14:** Add `app/error.tsx` as a segment error boundary with reset behavior.

**Assignment 15:** Add `app/not-found.tsx` and trigger `notFound()` from a dynamic page when data is missing.

**Assignment 16:** Use the `<Link>` component for client-side navigation between routes.

**Assignment 17:** In a Client Component, use `useRouter()` from `next/navigation` for programmatic navigation.

**Assignment 18:** Use `usePathname()` to highlight the active nav item.

**Assignment 19:** Read and display query parameters with `useSearchParams()` in a Client Component.

**Assignment 20:** Combine dynamic params and search params on one page (server or client).

### Layouts & Templates (21–28)

**Assignment 21:** Define the root `app/layout.tsx` with `<html>`, `<body>`, and `{children}`.

**Assignment 22:** Add a nested layout `app/dashboard/layout.tsx` wrapping dashboard routes.

**Assignment 23:** Compare `layout.tsx` vs `template.tsx` by implementing both and observing remount behavior.

**Assignment 24:** Share UI state across a layout using a Client Component provider pattern.

**Assignment 25:** Export a static `metadata` object from a page for title and description.

**Assignment 26:** Implement `generateMetadata` for a dynamic route using fetched data.

**Assignment 27:** Add `app/favicon.ico` and `app/opengraph-image.tsx` (or static OG image) conventions.

**Assignment 28:** Use `robots` and `alternates.canonical` in metadata for a marketing page.

### Server Components (29–38)

**Assignment 29:** Confirm default Server Component behavior: fetch data in a page without `"use client"`.

**Assignment 30:** Add `"use client"` to a leaf component that uses `useState`.

**Assignment 31:** List criteria for choosing Server vs Client Components in an App Router app.

**Assignment 32:** Fetch JSON in a Server Component with `fetch` and render the result.

**Assignment 33:** Make a page component `async` and await data directly.

**Assignment 34:** Pass serializable props from a Server Component to a Client Component.

**Assignment 35:** Import a Client Component inside a Server Component and compose them.

**Assignment 36:** Avoid passing functions or non-serializable props from server to client.

**Assignment 37:** Split a feature into small Client boundaries while keeping the shell as Server Components.

**Assignment 38:** Render a list on the server and delegate item interactions to a Client child.

### Styling (39–46)

**Assignment 39:** Style a component with CSS Modules (`*.module.css`).

**Assignment 40:** Import global styles in `app/layout.tsx`.

**Assignment 41:** Integrate Tailwind CSS with Next.js 15 and use utility classes on a page.

**Assignment 42:** Use `next/font` (e.g. Geist or Inter) with `variable` and apply to `body`.

**Assignment 43:** Apply conditional class names based on props (with `clsx` or template literals).

**Assignment 44:** Explain trade-offs of runtime CSS-in-JS libraries with Server Components.

**Assignment 45:** Scope styles to a route segment using colocated CSS Module files.

**Assignment 46:** Build a responsive navigation bar with mobile and desktop layouts.

### Images & Assets (47–54)

**Assignment 47:** Render a local image with `next/image` using a static import.

**Assignment 48:** Configure `width`, `height`, and `sizes` for a responsive hero image.

**Assignment 49:** Use `placeholder="blur"` with a static import `blurDataURL`.

**Assignment 50:** Allow a remote image host in `next.config.ts` `images.remotePatterns` and render it.

**Assignment 51:** Mark above-the-fold images with `priority`.

**Assignment 52:** Use the `fill` prop with a sized parent container for a card image.

**Assignment 53:** Serve a PDF from `public/` via a plain URL.

**Assignment 54:** Reference fonts and icons from `public/` vs bundled assets.

### Basic Data Fetching (55–64)

**Assignment 55:** Fetch in a Server Component with default caching behavior.

**Assignment 56:** Use `cache: 'force-cache'` explicitly on a `fetch` call.

**Assignment 57:** Use `cache: 'no-store'` for always-fresh data.

**Assignment 58:** Use `next: { revalidate: 60 }` for time-based revalidation.

**Assignment 59:** Wrap a slow server fetch in `<Suspense>` with a fallback.

**Assignment 60:** Handle fetch errors in a Server Component and surface a friendly UI.

**Assignment 61:** Fetch two resources in parallel with `Promise.all` in a Server Component.

**Assignment 62:** Demonstrate sequential dependent fetches (waterfall) and explain impact.

**Assignment 63:** Use `generateStaticParams` to prebuild dynamic routes at build time.

**Assignment 64:** Combine static generation hints with `dynamicParams` behavior on dynamic routes.

### Basic API (65–70)

**Assignment 65:** Create `app/api/health/route.ts` with a `GET` handler returning JSON.

**Assignment 66:** Implement `POST` in `app/api/echo/route.ts` reading JSON body.

**Assignment 67:** Set `Response` headers and status codes explicitly in a route handler.

**Assignment 68:** Add `app/api/items/[id]/route.ts` with `GET` returning the id.

**Assignment 69:** Return `NextResponse.json` with different HTTP verbs in one file.

**Assignment 70:** Validate `Content-Type` and return `400` for invalid API requests.

---

## INTERMEDIATE LEVEL (Assignments 71–140)

### Server Actions (71–84)

**Assignment 71:** Declare a Server Action with `"use server"` in a dedicated file.

**Assignment 72:** Wire an HTML `<form action={serverAction}>` without client JavaScript.

**Assignment 73:** Use `useActionState` to show validation messages from a Server Action.

**Assignment 74:** Use `useFormStatus` for pending state on a submit button.

**Assignment 75:** Validate form data with Zod inside a Server Action.

**Assignment 76:** Call `revalidatePath('/')` after a mutation.

**Assignment 77:** Tag fetches with `next: { tags: ['posts'] }` and call `revalidateTag('posts')`.

**Assignment 78:** Implement optimistic UI with `useOptimistic` around a Server Action.

**Assignment 79:** Ensure forms work without JS (progressive enhancement) and enhance with client feedback.

**Assignment 80:** Return structured errors from a Server Action and display them in the UI.

**Assignment 81:** Redirect after success using `redirect()` from `next/navigation` in a Server Action.

**Assignment 82:** Upload a file with `<input type="file">` and process `FormData` in a Server Action.

**Assignment 83:** Invoke a Server Action from a Client Component via `action` prop or `startTransition`.

**Assignment 84:** Pass a bound Server Action as a prop to a Client Component child.

### Advanced Routing (85–96)

**Assignment 85:** Create parallel routes with `@analytics` and `@team` slots and a matching layout.

**Assignment 86:** Add `default.tsx` for a parallel route slot.

**Assignment 87:** Implement a modal using an intercepting route `(.)photo/[id]` plus parallel route.

**Assignment 88:** Use intercept patterns `(..)(..)` / `(...)` where appropriate for nested structures.

**Assignment 89:** Conditionally render slot content based on route segments.

**Assignment 90:** Use route groups to separate marketing vs app layouts sharing one `app` tree.

**Assignment 91:** Use a private folder `_components` for non-routable colocated files.

**Assignment 92:** Add `middleware.ts` that runs on matched paths.

**Assignment 93:** Redirect unauthenticated users to `/login` from middleware.

**Assignment 94:** Rewrite incoming paths to internal routes with `NextResponse.rewrite`.

**Assignment 95:** Attach auth session check in middleware and pass headers forward.

**Assignment 96:** Exclude static assets and `_next` from middleware via `matcher` config.

### Caching & Revalidation (97–106)

**Assignment 97:** Explain the Data Cache vs Full Route Cache at a high level in comments.

**Assignment 98:** Demonstrate Router Cache behavior when navigating between shared layouts.

**Assignment 99:** Show request memoization by calling the same `fetch` URL twice in one request.

**Assignment 100:** Use `fetch` cache tags and `revalidateTag` together end-to-end.

**Assignment 101:** Trigger on-demand revalidation from a route handler using `revalidatePath`.

**Assignment 102:** Use `unstable_cache` to wrap an expensive async function with tags.

**Assignment 103:** Use React `cache()` to dedupe database or ORM calls in Server Components.

**Assignment 104:** Implement ISR-style listing: time revalidate + on-demand tag revalidation.

**Assignment 105:** Force dynamic rendering with `export const dynamic = 'force-dynamic'`.

**Assignment 106:** Compare `force-static` vs default static behavior for a specific route.

### Authentication (107–114)

**Assignment 107:** Implement middleware that checks a session cookie and protects `/dashboard/*`.

**Assignment 108:** Store session in an HTTP-only cookie set from a Server Action or route handler.

**Assignment 109:** Build a protected layout that redirects unauthenticated users.

**Assignment 110:** Implement login and logout Server Actions clearing/setting cookies.

**Assignment 111:** Add role-based access: admin-only segment under `app/admin`.

**Assignment 112:** Outline OAuth callback route handler pattern (e.g. exchange code for session).

**Assignment 113:** Verify a JWT on the server in a route handler and return `401` when invalid.

**Assignment 114:** Provide a thin client `AuthProvider` reading session from server props.

### Database Integration (115–122)

**Assignment 115:** Add Prisma to the project and define a `User` model.

**Assignment 116:** Query Prisma in a Server Component and list users.

**Assignment 117:** Create a Server Action that inserts a row with Prisma.

**Assignment 118:** Implement update and delete Server Actions with revalidation.

**Assignment 119:** Paginate list results with `skip`/`take` from search params.

**Assignment 120:** Implement search/filter in a Server Component using URL query strings.

**Assignment 121:** Use a Prisma transaction for two related writes.

**Assignment 122:** Document connection pooling considerations for serverless deployments.

### API Routes Advanced (123–130)

**Assignment 123:** Chain custom logic before/after a handler in a route module (helper pattern).

**Assignment 124:** Stream text from a route handler using Web `ReadableStream`.

**Assignment 125:** Implement a minimal SSE endpoint with `text/event-stream`.

**Assignment 126:** Support multiple HTTP methods with shared validation in `[id]/route.ts`.

**Assignment 127:** Validate request bodies with Zod in POST/PATCH handlers.

**Assignment 128:** Add CORS headers for a public API route.

**Assignment 129:** Implement a simple in-memory rate limit pattern per IP.

**Assignment 130:** Version an API under `app/api/v1/...` and keep v2 separate.

### SEO & Metadata (131–140)

**Assignment 131:** Export static `metadata` on a landing page with title template in root layout.

**Assignment 132:** Generate Open Graph images dynamically for blog posts.

**Assignment 133:** Add Twitter card metadata alongside Open Graph.

**Assignment 134:** Implement `app/sitemap.ts` returning `MetadataRoute.Sitemap`.

**Assignment 135:** Implement `app/robots.ts` allowing/disallowing crawlers.

**Assignment 136:** Inject JSON-LD structured data for an article in a Server Component.

**Assignment 137:** Set canonical URLs for duplicate content routes.

**Assignment 138:** Use `generateStaticParams` to maximize statically generated SEO pages.

**Assignment 139:** Provide `hreflang` alternates for a simple EN/ES marketing setup.

**Assignment 140:** Merge metadata from layout and page for a consistent SEO hierarchy.

---

## ADVANCED LEVEL (Assignments 141–200)

### Streaming & Suspense (141–148)

**Assignment 141:** Stream UI with `<Suspense>` around async Server Component children.

**Assignment 142:** Nest multiple Suspense boundaries for independent sections.

**Assignment 143:** Rely on `loading.tsx` at multiple segment levels and describe the hierarchy.

**Assignment 144:** Load two independent data regions in parallel inside one page.

**Assignment 145:** Demonstrate sequential streaming: outer shell first, inner deferred.

**Assignment 146:** Build skeleton components matching final layout for key pages.

**Assignment 147:** Progressive loading: show partial content while secondary metrics load.

**Assignment 148:** Combine error boundaries (`error.tsx`) with Suspense around risky subtrees.

### Advanced Data Patterns (149–158)

**Assignment 149:** Refactor a waterfall into parallel fetches where dependencies allow.

**Assignment 150:** Preload data from a layout for a child using shared `cache()` helpers.

**Assignment 151:** Warm caches after deploy via a secure internal revalidation route.

**Assignment 152:** Implement stale-while-revalidate UX: show cached data, refresh in background.

**Assignment 153:** Optimistic list updates with rollback on Server Action failure.

**Assignment 154:** Poll an API from a Client Component with `useEffect` + `router.refresh()`.

**Assignment 155:** Integrate WebSocket messages into client state with Server Component initial payload.

**Assignment 156:** Push live updates using SSE from a route handler consumed on the client.

**Assignment 157:** Infinite scroll: Client fetches next pages via route handler or Server Action.

**Assignment 158:** Hybrid: Server Component for first page, client for subsequent pages.

### Performance (159–168)

**Assignment 159:** Analyze bundles with `@next/bundle-analyzer` configuration.

**Assignment 160:** Lazy-load a heavy Client Component with `dynamic()` and `ssr: false` when appropriate.

**Assignment 161:** Split vendor code using dynamic imports for rare admin tools.

**Assignment 162:** Optimize fonts with `display: swap` and subsetting via `next/font`.

**Assignment 163:** Define an image optimization strategy (sizes, formats, priority).

**Assignment 164:** Measure and improve LCP, CLS, and INP on a sample page.

**Assignment 165:** Explain Partial Prerendering (PPR) concept and static shell + dynamic holes.

**Assignment 166:** Choose static vs dynamic segments for a mixed content site.

**Assignment 167:** Run selected route handlers on the Edge runtime.

**Assignment 168:** Stream HTML responses from a route handler compatible with RSC patterns.

### Deployment & Production (169–176)

**Assignment 169:** Deploy to Vercel with environment variables configured per environment.

**Assignment 170:** Configure `output: 'standalone'` for self-hosted Node deployments.

**Assignment 171:** Write a multi-stage `Dockerfile` for a Next.js 15 production image.

**Assignment 172:** Separate secrets vs public env vars and document them in `.env.example`.

**Assignment 173:** Use preview deployments for pull requests.

**Assignment 174:** Add basic production logging hooks (e.g. `instrumentation.ts` pattern).

**Assignment 175:** Integrate error tracking (e.g. Sentry) initialization for App Router.

**Assignment 176:** Expose `/api/health` for load balancer health checks.

### Testing (177–184)

**Assignment 177:** Unit test a pure Client Component with React Testing Library.

**Assignment 178:** Document limitations and patterns for testing async Server Components.

**Assignment 179:** Test a Server Action as a plain async function with mocked data layer.

**Assignment 180:** Integration test API route handlers with `GET`/`POST` requests.

**Assignment 181:** Add a Playwright test for critical navigation flows.

**Assignment 182:** Test middleware redirect behavior with mocked `NextRequest`.

**Assignment 183:** Snapshot JSON responses from route handlers for regression safety.

**Assignment 184:** Mock `fetch` or database modules in Vitest/Jest for isolated tests.

### Advanced Patterns (185–192)

**Assignment 185:** Sketch module federation or multi-zone routing for micro-frontends.

**Assignment 186:** Outline a Turborepo monorepo with `apps/web` and `packages/ui`.

**Assignment 187:** Add `next-intl` (or similar) for App Router i18n routing.

**Assignment 188:** Describe multi-tenant routing with subdomain or path-based tenants.

**Assignment 189:** Feature flags evaluated in middleware with cookie/query overrides.

**Assignment 190:** A/B split traffic in middleware assigning variant cookies.

**Assignment 191:** Inject analytics (e.g. Vercel Analytics or third-party) in root layout.

**Assignment 192:** Fetch CMS content in Server Components with draft mode preview route.

### Real-World Projects (193–200)

**Assignment 193:** Blueprint a blog: posts list, MDX content, tags, RSS.

**Assignment 194:** Blueprint an e-commerce store: catalog, cart Server Actions, checkout API.

**Assignment 195:** Blueprint a SaaS dashboard: teams, billing webhook route, settings.

**Assignment 196:** Blueprint a social app: feed, likes Server Actions, real-time notifications.

**Assignment 197:** Blueprint a job board: filters in URL, saved searches, employer portal.

**Assignment 198:** Blueprint a real estate site: map client boundary, image gallery, lead forms.

**Assignment 199:** Blueprint a documentation site: sidebar layout, versioned docs, search.

**Assignment 200:** Blueprint a project management tool: boards, tasks, comments, permissions.

