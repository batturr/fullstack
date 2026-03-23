# Next.js MCQ - Set 2 (Beginner Level)

**1. In the App Router, what does a folder named `(marketing)` represent?**

a) `A dynamic API segment`
b) `A route group: organizes files without affecting the URL path`
c) `A private folder`
d) `A parallel route`

**Answer: b) `A route group: organizes files without affecting the URL path`**

---

**2. Parallel routes use which folder naming convention?**

a) `[id]`
b) `@slotName`
c) `(...modal)`
d) `_private`

**Answer: b) `@slotName`**

---

**3. Intercepting routes often use which folder naming pattern?**

a) `Parentheses prefixes like (.) (..) (..)(..) and (...)`
b) `@parallel only`
c) `[[...slug]] only`
d) `_intercept`

**Answer: a) `Parentheses prefixes like (.) (..) (..)(..) and (...)`**

---

**4. What is the difference between `layout.js` and `template.js`?**

a) `They are identical`
b) `Templates remount on navigation; layouts persist state across navigations`
c) `Templates cannot use children`
d) `Layouts only work in Pages Router`

**Answer: b) `Templates remount on navigation; layouts persist state across navigations`**

---

**5. Dynamic segment `[slug]` matches:**

a) `Zero path segments`
b) `Exactly one path segment`
c) `Only numeric segments`
d) `Only query strings`

**Answer: b) `Exactly one path segment`**

---

**6. Catch-all segment `[...slug]` matches:**

a) `No segments`
b) `One or more segments`
c) `Exactly one segment`
d) `Only file extensions`

**Answer: b) `One or more segments`**

---

**7. Optional catch-all `[[...slug]]` differs because:**

a) `It never matches`
b) `It can match zero or more segments`
c) `It only matches two segments`
d) `It is invalid in App Router`

**Answer: b) `It can match zero or more segments`**

---

**8. What does `app/not-found.js` define?**

a) `500 errors`
b) `The UI when notFound() is called or a route is unmatched`
c) `Loading states`
d) `API 401 responses`

**Answer: b) `The UI when notFound() is called or a route is unmatched`**

---

**9. In App Router, a Route Handler is typically defined in which file?**

a) `handler.js`
b) `api.js`
c) `route.js`
d) `server.js`

**Answer: c) `route.js`**

---

**10. Which export shape is valid for a GET handler in `route.js`?**

```javascript
export async function GET(request) {
  return Response.json({ ok: true });
}
```

a) `export default function GET()`
b) `export const get = () => {}`
c) `export async function GET(request) { ... }`
d) `module.exports = { handler: "GET" }`

**Answer: c) `export async function GET(request) { ... }`**

---

**11. Server Components are the default in App Router. Which is true?**

a) `Every file is a Client Component unless commented`
b) `Components are Server Components unless marked with "use client"`
c) `Only layouts are Server Components`
d) `Server Components cannot render HTML`

**Answer: b) `Components are Server Components unless marked with "use client"`**

---

**12. In Pages Router, API routes live under:**

a) `app/api/`
b) `pages/api/`
c) `server/api/`
d) `routes/http/`

**Answer: b) `pages/api/`**

---

**13. `next/font` helps with:**

a) `Image compression`
b) `Self-hosting and optimizing web fonts with zero layout shift patterns`
c) `Database pooling`
d) `Cookie signing`

**Answer: b) `Self-hosting and optimizing web fonts with zero layout shift patterns`**

---

**14. `next/script` is used to:**

a) `Import CSS modules`
b) `Control loading strategy for third-party scripts`
c) `Define middleware matchers`
d) `Replace fetch`

**Answer: b) `Control loading strategy for third-party scripts`**

---

**15. A rewrite in `next.config` typically:**

a) `Changes the browser URL`
b) `Maps an incoming request path to a different internal path without changing the visible URL`
c) `Deletes static files`
d) `Disables SSR`

**Answer: b) `Maps an incoming request path to a different internal path without changing the visible URL`**

---

**16. A redirect in Next.js navigation APIs typically:**

a) `Keeps the same URL`
b) `Sends the client to a new URL (temporary or permanent)`
c) `Only works in middleware`
d) `Cannot be used in Server Components`

**Answer: b) `Sends the client to a new URL (temporary or permanent)`**

---

**17. Static rendering at build time means:**

a) `HTML is generated per request always`
b) `HTML can be generated ahead of time and reused`
c) `No HTML is produced`
d) `Only JSON is sent`

**Answer: b) `HTML can be generated ahead of time and reused`**

---

**18. Dynamic rendering means:**

a) `The page is built once and never changes`
b) `The response may be computed per-request based on dynamic data or config`
c) `Only static assets`
d) `CSS-only output`

**Answer: b) `The response may be computed per-request based on dynamic data or config`**

---

**19. Static metadata in App Router is exported as:**

```javascript
export const metadata = {
  title: "Home",
};
```

a) `export const head = {}`
b) `export const metadata = { ... }`
c) `export default function metadata()`
d) `export const seo = {}`

**Answer: b) `export const metadata = { ... }`**

---

**20. `generateMetadata` is used when:**

a) `You only need a static title`
b) `Metadata depends on route params or async data`
c) `You want to disable SEO`
d) `You are using Pages Router only`

**Answer: b) `Metadata depends on route params or async data`**

---

**21. File-based convention `opengraph-image` in a segment:**

a) `Replaces all fonts`
b) `Can define Open Graph image for that route segment`
c) `Is only for favicons in /public`
d) `Disables metadata`

**Answer: b) `Can define Open Graph image for that route segment`**

---

**22. In App Router, which hook reads the current pathname on the client?**

```jsx
"use client";
import { usePathname } from "???";
```

a) `"next/router"`
b) `"next/navigation"`
c) `"next/link"`
d) `"react-router-dom"`

**Answer: b) `"next/navigation"`**

---

**23. `useRouter` from `next/navigation` is primarily for:**

a) `Reading cookies on the server`
b) `Programmatic navigation in Client Components`
c) `Defining API schemas`
d) `Webpack configuration`

**Answer: b) `Programmatic navigation in Client Components`**

---

**24. `useSearchParams` returns:**

a) `Server-only headers`
b) `A read-only URLSearchParams-like view of the current query string`
c) `POST body`
d) `Environment variables`

**Answer: b) `A read-only URLSearchParams-like view of the current query string`**

---

**25. Nested layouts in `app/dashboard/settings/` imply:**

a) `Only one layout for the whole app`
b) `Parent layouts wrap child segments, composing UI shells`
c) `Layouts cannot nest`
d) `URL must include literal folder names with parentheses`

**Answer: b) `Parent layouts wrap child segments, composing UI shells`**

---

**26. Route groups are useful for:**

a) `Adding extra URL segments`
b) `Sharing layouts among routes without changing URLs`
c) `Disabling routing`
d) `Webpack code splitting only`

**Answer: b) `Sharing layouts among routes without changing URLs`**

---

**27. Parallel routes require:**

a) `A single page.js only`
b) `Named slots with @ folders and default.js fallbacks in many setups`
c) `No layouts`
d) `getStaticProps`

**Answer: b) `Named slots with @ folders and default.js fallbacks in many setups`**

---

**28. POST in `route.js` is exported as:**

a) `export function post()`
b) `export async function POST(request) { ... }`
c) `export default POST`
d) `exports.post = ...`

**Answer: b) `export async function POST(request) { ... }`**

---

**29. `next/font/google` imports are:**

a) `Downloaded at runtime from unpkg always`
b) `Optimized and self-hosted by Next.js at build time`
c) `Only for SVG`
d) `Deprecated`

**Answer: b) `Optimized and self-hosted by Next.js at build time`**

---

**30. `loading.js` boundaries are tied closely to:**

a) `React Suspense streaming behavior`
b) `Redux store`
c) `Service workers only`
d) `GraphQL only`

**Answer: a) `React Suspense streaming behavior`**

---

**31. `error.js` must be a Client Component because:**

a) `Error boundaries in React require client-side capability`
b) `Servers can catch all errors in children`
c) `It never runs in the browser`
d) `Next.js forbids any client JS`

**Answer: a) `Error boundaries in React require client-side capability`**

---

**32. Intercepting routes are commonly used for:**

a) `Database migrations`
b) `Showing modals while preserving soft navigation context (e.g. photo modal over feed)`
c) `Static robots.txt only`
d) `Font subsetting`

**Answer: b) `Showing modals while preserving soft navigation context (e.g. photo modal over feed)`**

---

**33. Dynamic route `app/posts/[id]/page.js` receives params as:**

a) `props.searchParams only`
b) `props.params in page components`
c) `useRouter().query only`
d) `process.argv`

**Answer: b) `props.params in page components`**

---

**34. In App Router pages, `searchParams` is passed as:**

a) `Only on the client`
b) `A prop on page components (in RSC page signatures)`
c) `headers() return value`
d) `cookies() return value`

**Answer: b) `A prop on page components (in RSC page signatures)`**

---

**35. `metadata.openGraph` can describe:**

a) `Webpack chunks`
b) `Open Graph tags for social sharing`
c) `Service worker scope`
d) `Database indexes`

**Answer: b) `Open Graph tags for social sharing`**

---

**36. Favicon conventions in App Router can include file:**

a) `app/favicon.ico`
b) `public/app.ico only`
c) `next/favicon`
d) `styles/favicon.css`

**Answer: a) `app/favicon.ico`**

---

**37. `useRouter().push("/dash")` in App Router comes from:**

a) `next/link`
b) `next/navigation`
c) `next/headers`
d) `next/server`

**Answer: b) `next/navigation`**

---

**38. Route Handlers support which runtimes configuration (conceptually)?**

a) `Only "edge" always`
b) `nodejs or edge depending on route segment config`
c) `No configuration`
d) `Only Python`

**Answer: b) `nodejs or edge depending on route segment config`**

---

**39. A segment without `page.js` but with nested routes:**

a) `Cannot exist`
b) `Can exist as a pathless layout segment using layout.js alone in some structures`
c) `Always 404`
d) `Must be a route group`

**Answer: b) `Can exist as a pathless layout segment using layout.js alone in some structures`**

---

**40. `next/script` strategy `afterInteractive` means:**

a) `Load before any HTML`
b) `Load after the page becomes interactive (default for many cases)`
c) `Never load`
d) `Only in Web Workers`

**Answer: b) `Load after the page becomes interactive (default for many cases)`**

---

**41. Rewrites vs redirects — which changes the visible URL in the browser?**

a) `Rewrite`
b) `Redirect`
c) `Neither`
d) `Both always`

**Answer: b) `Redirect`**

---

**42. `generateMetadata` can be:**

a) `Only synchronous`
b) `Async and return a Metadata object`
c) `Only for Pages Router`
d) `Only for CSS`

**Answer: b) `Async and return a Metadata object`**

---

**43. Parallel route slot folders live:**

a) `Only under public/`
b) `As siblings like app/@modal/ alongside app/page.js`
c) `Only in node_modules`
d) `Only in pages/`

**Answer: b) `As siblings like app/@modal/ alongside app/page.js`**

---

**44. `default.js` in parallel routes is used to:**

a) `Define robots rules`
b) `Render fallback when a slot is not active`
c) `Replace middleware`
d) `Configure images`

**Answer: b) `Render fallback when a slot is not active`**

---

**45. Dynamic `[slug]` folder name bracket syntax means:**

a) `Optional segment`
b) `Single dynamic param for that path piece`
c) `Catch-all`
d) `Private folder`

**Answer: b) `Single dynamic param for that path piece`**

---

**46. Optional catch-all `[[...slug]]` when the URL has no extra segments often yields:**

a) `A guaranteed 404`
b) `params.slug undefined or absent depending on structure; route still matches`
c) `Always params.slug = []`
d) `Only works in Pages Router`

**Answer: b) `params.slug undefined or absent depending on structure; route still matches`**

---

**47. `usePathname()` in a Client Component updates when:**

a) `Never`
b) `The client navigates to a new route`
c) `Only on full reload`
d) `Only if query changes without navigation`

**Answer: b) `The client navigates to a new route`**

---

**48. Metadata `robots` field can control:**

a) `Font display`
b) `Crawler directives for the page`
c) `Image formats`
d) `API rate limits`

**Answer: b) `Crawler directives for the page`**

---

**49. In `route.js`, `request` is typically a:**

a) `Node http.IncomingMessage always`
b) `Web standard Request (or NextRequest extension)`
c) `Express req`
d) `GraphQL context`

**Answer: b) `Web standard Request (or NextRequest extension)`**

---

**50. App Router `app` folder coexists with `pages` when:**

a) `Never allowed`
b) `Both can exist during migration; overlapping paths have defined precedence rules`
c) `Only on Vercel`
d) `Only if pages is empty`

**Answer: b) `Both can exist during migration; overlapping paths have defined precedence rules`**

---
