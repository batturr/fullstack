# Next.js MCQ - Set 3 (Intermediate Level)

**1. Server-Side Rendering (SSR) in Next.js typically means:**

a) `HTML is only built at build time`
b) `HTML is generated on the server per request (or when using dynamic rendering)`
c) `No server is involved`
d) `Only CSS is server-rendered`

**Answer: b) `HTML is generated on the server per request (or when using dynamic rendering)`**

---

**2. Static Site Generation (SSG) means:**

a) `Pages are generated at request time always`
b) `Pages can be pre-rendered at build time into static HTML`
c) `Only API routes`
d) `Client-only rendering`

**Answer: b) `Pages can be pre-rendered at build time into static HTML`**

---

**3. Incremental Static Regeneration (ISR) allows:**

a) `Static pages to be updated after build on a revalidation interval`
b) `Disabling caching entirely`
c) `Only client-side routing`
d) `Removing metadata`

**Answer: a) `Static pages to be updated after build on a revalidation interval`**

---

**4. In App Router, `revalidate` on a fetch might be set as:**

```javascript
await fetch(url, { next: { revalidate: 60 } });
```

a) `It disables caching`
b) `It suggests time-based revalidation for cached fetch results`
c) `It runs fetch in the browser only`
d) `It is invalid in Server Components`

**Answer: b) `It suggests time-based revalidation for cached fetch results`**

---

**5. `generateStaticParams` is used to:**

a) `Define middleware matchers`
b) `Pre-build dynamic route segments at build time`
c) `Configure next/image`
d) `Replace server actions`

**Answer: b) `Pre-build dynamic route segments at build time`**

---

**6. `fetch(..., { cache: 'force-cache' })` indicates:**

a) `Always skip cache`
b) `Prefer cached result when available (static-ish behavior)`
c) `Only for POST`
d) `Edge-only`

**Answer: b) `Prefer cached result when available (static-ish behavior)`**

---

**7. `fetch(..., { cache: 'no-store' })` pushes toward:**

a) `Strong static prerender`
b) `Dynamic data per request (no static data cache for that fetch)`
c) `Image optimization`
d) `Font subsetting`

**Answer: b) `Dynamic data per request (no static data cache for that fetch)`**

---

**8. Server Actions are defined with:**

a) `"use client"`
b) `"use server" at top of file or function level in supported patterns`
c) `"use strict" only`
d) `"server only" in package.json`

**Answer: b) `"use server" at top of file or function level in supported patterns`**

---

**9. A form can invoke a Server Action via:**

```jsx
<form action={myServerAction}>...</form>
```

a) `Only fetch from client`
b) `action prop pointing to an async server function`
c) `method="GET" only`
d) `Only in Pages Router`

**Answer: b) `action prop pointing to an async server function`**

---

**10. `useFormState` pairs with Server Actions to:**

a) `Replace all useState usage globally`
b) `Manage form state returned from an action (e.g. errors, values)`
c) `Configure middleware`
d) `Handle only GET requests`

**Answer: b) `Manage form state returned from an action (e.g. errors, values)`**

---

**11. `useFormStatus` is used to:**

a) `Read headers on the server`
b) `Know pending state of a parent form submission in Client Components`
c) `Define static params`
d) `Parse cookies in middleware`

**Answer: b) `Know pending state of a parent form submission in Client Components`**

---

**12. `middleware.js` runs:**

a) `Only after HTML is sent`
b) `On the Edge before a request finishes, can rewrite/redirect/respond`
c) `Only during npm run build`
d) `Only in the browser`

**Answer: b) `On the Edge before a request finishes, can rewrite/redirect/respond`**

---

**13. `NextResponse.next()` in middleware typically:**

a) `Stops the request`
b) `Continues the request to the matched route`
c) `Throws always`
d) `Only sets cookies client-side`

**Answer: b) `Continues the request to the matched route`**

---

**14. Middleware `matcher` config is used to:**

a) `Limit which paths invoke middleware`
b) `Define CSS modules`
c) `Set Open Graph images`
d) `Configure prisma`

**Answer: a) `Limit which paths invoke middleware`**

---

**15. Route Handlers can return:**

a) `Only strings`
b) `Web Response objects (Response.json, etc.)`
c) `Only JSX`
d) `Only streams of binary with no headers`

**Answer: b) `Web Response objects (Response.json, etc.)`**

---

**16. Streaming with Suspense allows:**

a) `Blocking the entire page until all data resolves`
b) `Sending fallback UI first then replacing with resolved content`
c) `Disabling HTML`
d) `Only static export`

**Answer: b) `Sending fallback UI first then replacing with resolved content`**

---

**17. Parallel data fetching in Server Components is often done by:**

a) `Awaiting fetches one after another only`
b) `Starting independent promises before awaiting (e.g. Promise.all)`
c) `Using getServerSideProps only`
d) `Using window.fetch synchronously`

**Answer: b) `Starting independent promises before awaiting (e.g. Promise.all)`**

---

**18. Sequential data fetching means:**

a) `Second request depends on result of first`
b) `Always fastest`
c) `Same as parallel always`
d) `Forbidden in Next.js`

**Answer: a) `Second request depends on result of first`**

---

**19. React Server Components serialize:**

a) `Full component source to the client always`
b) `A serialized tree (Flight) describing server output and client boundaries`
c) `Only CSS`
d) `Only JSON from route handlers`

**Answer: b) `A serialized tree (Flight) describing server output and client boundaries`**

---

**20. Client/Server boundary rule: Client Components cannot import modules that:**

a) `Only export types`
b) `Use server-only APIs like fs or server-only data layers directly`
c) `Use CSS modules`
d) `Use children`

**Answer: b) `Use server-only APIs like fs or server-only data layers directly`**

---

**21. Passing a Server Action from Server to Client Component as prop is:**

a) `Always invalid`
b) `Supported as a special serializable reference`
c) `Only via query string`
d) `Only with Redux`

**Answer: b) `Supported as a special serializable reference`**

---

**22. `cookies()` from `next/headers` in App Router:**

a) `Works in Client Components`
b) `Is for Server Components / Server Actions / Route Handlers contexts`
c) `Replaces fetch`
d) `Only in middleware`

**Answer: b) `Is for Server Components / Server Actions / Route Handlers contexts`**

---

**23. Using `headers()` in a layout makes that subtree more likely to be:**

a) `Fully static always`
b) `Dynamic because request headers vary per request`
c) `Exported as JSON only`
d) `Ignored by Next.js`

**Answer: b) `Dynamic because request headers vary per request`**

---

**24. `export const dynamic = 'force-static'` attempts to:**

a) `Force dynamic per request`
b) `Opt into static behavior where possible`
c) `Disable routing`
d) `Run only on client`

**Answer: b) `Opt into static behavior where possible`**

---

**25. `export const revalidate = 0` is associated with:**

a) `No revalidation`
b) `Dynamic / fresh behavior depending on context (often no static ISR window)`
c) `Only image config`
d) `Only Pages Router`

**Answer: b) `Dynamic / fresh behavior depending on context (often no static ISR window)`**

---

**26. Server Actions can be bound with `.bind` to pass:**

a) `Only event objects`
b) `Extra arguments beyond form data`
c) `Webpack config`
d) `Middleware matchers`

**Answer: b) `Extra arguments beyond form data`**

---

**27. Route Handler `export const runtime = 'edge'` means:**

a) `Runs on Node.js only`
b) `Runs on the Edge runtime for that route`
c) `Disables the route`
d) `Only static files`

**Answer: b) `Runs on the Edge runtime for that route`**

---

**28. Suspense boundaries around slow server fetches help with:**

a) `Larger client bundles always`
b) `Streaming partial UI and improving perceived performance`
c) `Removing SEO`
d) `Disabling caching always`

**Answer: b) `Streaming partial UI and improving perceived performance`**

---

**29. `unstable_noStore()` (concept: opting out of static caching) signals:**

a) `Always cache forever`
b) `This scope should not be statically cached`
c) `Use only in middleware`
d) `Replace metadata`

**Answer: b) `This scope should not be statically cached`**

---

**30. Data cache in Next.js (fetch-related) differs from router cache because:**

a) `They are identical names`
b) `Data cache stores fetch results; router cache caches RSC payloads for client navigations`
c) `Neither exists`
d) `Only Pages Router has data cache`

**Answer: b) `Data cache stores fetch results; router cache caches RSC payloads for client navigations`**

---

**31. `generateStaticParams` returning `[]` for a dynamic route might:**

a) `Always error`
b) `Mean no paths pre-rendered at build (depending on config and fallback behavior)`
c) `Force edge only`
d) `Disable ISR`

**Answer: b) `Mean no paths pre-rendered at build (depending on config and fallback behavior)`**

---

**32. Server Component async components are written as:**

```javascript
export default async function Page() {
  const data = await fetch(...);
  return <div>...</div>;
}
```

a) `Invalid syntax`
b) `Supported in Server Components`
c) `Only in Pages Router`
d) `Requires "use client"`

**Answer: b) `Supported in Server Components`**

---

**33. `POST` Server Actions use which underlying mechanism conceptually?**

a) `GraphQL subscriptions`
b) `POST requests with Next.js action protocol`
c) `WebSockets only`
d) `GET with query`

**Answer: b) `POST requests with Next.js action protocol`**

---

**34. Middleware can read request headers via:**

a) `window`
b) `NextRequest headers`
c) `document.cookie only`
d) `localStorage`

**Answer: b) `NextRequest headers`**

---

**35. `NextResponse.redirect(url)` in middleware:**

a) `Rewrites internally only`
b) `Returns a redirect response to the client`
c) `Throws in Edge`
d) `Only works in getServerSideProps`

**Answer: b) `Returns a redirect response to the client`**

---

**36. When mixing Suspense boundaries, each boundary:**

a) `Must be a Client Component`
b) `Can wrap async Server Component subtrees with fallbacks`
c) `Cannot nest`
d) `Disables streaming`

**Answer: b) `Can wrap async Server Component subtrees with fallbacks`**

---

**37. Importing `fs` in a Client Component is:**

a) `Allowed`
b) `Not allowed; build should fail or it must not be bundled for client`
c) `Recommended`
d) `Only on Edge`

**Answer: b) `Not allowed; build should fail or it must not be bundled for client`**

---

**38. `cache: 'no-store'` on fetch often contributes to:**

a) `Fully prerendered static HTML for that data`
b) `Fresh per-request data behavior for that fetch`
c) `Automatic ISR 3600`
d) `Disabling the app`

**Answer: b) `Fresh per-request data behavior for that fetch`**

---

**39. Server Actions validation should happen:**

a) `Only on the client`
b) `On the server (never trust client-only validation)`
c) `Only in middleware for forms`
d) `Never`

**Answer: b) `On the server (never trust client-only validation)`**

---

**40. `useFormStatus.pending` helps implement:**

a) `Disabling submit button while submitting`
b) `Static generation`
c) `Image placeholders`
d) `Open Graph`

**Answer: a) `Disabling submit button while submitting`**

---

**41. Route Handlers and Server Actions both run on the server but differ in:**

a) `Nothing`
b) `HTTP shape: REST-like handlers vs action dispatch protocol`
c) `Only CSS handling`
d) `Only one can use async`

**Answer: b) `HTTP shape: REST-like handlers vs action dispatch protocol`**

---

**42. `fetch` deduplication in a single request (React/Next) refers to:**

a) `Caching across users globally always`
b) `Memoizing identical fetches during a render pass where applicable`
c) `Deleting fetch`
d) `Browser cache only`

**Answer: b) `Memoizing identical fetches during a render pass where applicable`**

---

**43. `loading.js` at a route is a special file that:**

a) `Defines API schema`
b) `Automatically wraps segment in Suspense with the provided fallback`
c) `Replaces middleware`
d) `Runs only on client build`

**Answer: b) `Automatically wraps segment in Suspense with the provided fallback`**

---

**44. Server Components can pass serializable props to Client Components except:**

a) `Strings`
b) `Functions (except special server action references) and class instances generally`
c) `Numbers`
d) `Plain objects`

**Answer: b) `Functions (except special server action references) and class instances generally`**

---

**45. ISR `revalidate` in route segment config (export const revalidate = N) sets:**

a) `Cookie max age`
b) `Default revalidation window for that static route segment`
c) `Font display`
d) `Middleware order`

**Answer: b) `Default revalidation window for that static route segment`**

---

**46. Dynamic rendering is triggered by APIs like:**

a) `Only console.log`
b) `cookies(), headers(), searchParams in pages, no-store fetch, etc.`
c) `Only CSS imports`
d) `Only Link`

**Answer: b) `cookies(), headers(), searchParams in pages, no-store fetch, etc.`**

---

**47. After a mutation, which `next/cache` helpers invalidate cached data?**

a) `revalidatePath and revalidateTag`
b) `next/font and next/script`
c) `redirect and notFound`
d) `headers and cookies`

**Answer: a) `revalidatePath and revalidateTag`**

---

**48. Server action errors should be handled by:**

a) `Ignoring`
b) `Returning structured error state or error boundaries on the client`
c) `Only alert()`
d) `Throwing uncaught always`

**Answer: b) `Returning structured error state or error boundaries on the client`**

---

**49. Parallel fetching example pattern:**

```javascript
const a = fetch(urlA);
const b = fetch(urlB);
const [ra, rb] = await Promise.all([a, b]);
```

a) `Waits for A before starting B`
b) `Starts both before awaiting results`
c) `Invalid in RSC`
d) `Only in useEffect`

**Answer: b) `Starts both before awaiting results`**

---

**50. RSC payload over the wire is primarily consumed by:**

a) `The database`
b) `React client runtime to reconcile client boundaries`
c) `Webpack only`
d) `nginx alone`

**Answer: b) `React client runtime to reconcile client boundaries`**

---
