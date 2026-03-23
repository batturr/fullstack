# Next.js MCQ - Set 4 (Intermediate Level)

**1. Middleware-based authentication often checks:**

a) `Only CSS class names`
b) `Session token in cookies or headers before reaching routes`
c) `Only build logs`
d) `Image dimensions`

**Answer: b) `Session token in cookies or headers before reaching routes`**

---

**2. `cookies()` in a Server Component returns:**

a) `A plain browser document.cookie string only`
b) `A read/write cookie store abstraction on the server`
c) `Always null`
d) `Only middleware`

**Answer: b) `A read/write cookie store abstraction on the server`**

---

**3. `headers()` from `next/headers` is appropriate for:**

a) `Reading request headers in server contexts`
b) `Setting CSP in the browser only`
c) `Replacing fetch`
d) `Client-side routing`

**Answer: a) `Reading request headers in server contexts`**

---

**4. i18n routing in Next.js commonly uses:**

a) `Only CSS Modules`
b) `Locale prefixes in URLs or domain-based routing with middleware`
c) `Disabling all static pages`
d) `getInitialProps only`

**Answer: b) `Locale prefixes in URLs or domain-based routing with middleware`**

---

**5. `next/dynamic` with `ssr: false` means:**

a) `The component is server-rendered twice`
b) `The component loads only on the client (no SSR for that chunk)`
c) `It disables JavaScript`
d) `It forces static export`

**Answer: b) `The component loads only on the client (no SSR for that chunk)`**

---

**6. `next/image` `sizes` prop helps the browser:**

a) `Choose appropriate responsive source for different viewport widths`
b) `Compress video`
c) `Sign URLs`
d) `Parse JSON`

**Answer: a) `Choose appropriate responsive source for different viewport widths`**

---

**7. `quality` on `next/image` affects:**

a) `Font weight`
b) `Encoded image quality for optimization`
c) `Cache TTL only`
d) `Middleware order`

**Answer: b) `Encoded image quality for optimization`**

---

**8. `placeholder="blur"` with `blurDataURL` provides:**

a) `Video autoplay`
b) `Low-res preview while the image loads`
c) `Server push`
d) `GraphQL caching`

**Answer: b) `Low-res preview while the image loads`**

---

**9. Custom `loader` prop on `next/image` is used to:**

a) `Replace React entirely`
b) `Integrate external image CDNs or custom URL construction`
c) `Disable alt text`
d) `Run middleware`

**Answer: b) `Integrate external image CDNs or custom URL construction`**

---

**10. Full Route Cache stores:**

a) `Only CSS`
b) `HTML and RSC payload for static routes across requests`
c) `User passwords`
d) `npm cache`

**Answer: b) `HTML and RSC payload for static routes across requests`**

---

**11. Router Cache (client) stores:**

a) `RSC payloads for client navigations to avoid refetching`
b) `Webpack config`
c) `Database rows`
d) `Only images`

**Answer: a) `RSC payloads for client navigations to avoid refetching`**

---

**12. Request Memoization refers to:**

a) `Caching across all users forever`
b) `Deduplicating identical requests during a single render pass where applicable`
c) `Deleting fetch`
d) `Only Service Worker`

**Answer: b) `Deduplicating identical requests during a single render pass where applicable`**

---

**13. `revalidatePath("/dashboard")` invalidates:**

a) `Only fonts`
b) `Cached data and potentially rerenders tied to that path`
c) `Only middleware`
d) `Only robots.txt`

**Answer: b) `Cached data and potentially rerenders tied to that path`**

---

**14. `revalidateTag("posts")` requires:**

a) `Tagged fetches (e.g. next: { tags: ["posts"] })`
b) `Only Pages Router`
c) `No build`
d) `Edge only`

**Answer: a) `Tagged fetches (e.g. next: { tags: ["posts"] })`**

---

**15. `redirect()` from `next/navigation` in Server Components:**

a) `Throws a special error to perform navigation`
b) `Returns undefined silently`
c) `Only works in middleware`
d) `Sets cookies client-side only`

**Answer: a) `Throws a special error to perform navigation`**

---

**16. `notFound()` in App Router:**

a) `Always returns 500`
b) `Triggers the nearest not-found boundary`
c) `Redirects to home`
d) `Only in Pages Router`

**Answer: b) `Triggers the nearest not-found boundary`**

---

**17. `error.js` boundary catches:**

a) `404 only`
b) `Runtime errors in child segments (not notFound)`
c) `Lint errors`
d) `Build type errors`

**Answer: b) `Runtime errors in child segments (not notFound)`**

---

**18. Parallel routes at scale need careful handling of:**

a) `Only CSS specificity`
b) `Slots, default.js, and matching URLs for each parallel segment`
c) `package.json name`
d) `Image formats only`

**Answer: b) `Slots, default.js, and matching URLs for each parallel segment`**

---

**19. Intercepting routes combined with parallel routes enable:**

a) `Database migrations`
b) `Modal overlays that preserve background route context`
c) `Removing TypeScript`
d) `Static export only`

**Answer: b) `Modal overlays that preserve background route context`**

---

**20. Route groups `(folder)` help separate:**

a) `Public URLs always`
b) `Marketing vs app layouts without changing paths`
c) `API versions in query strings only`
d) `node_modules`

**Answer: b) `Marketing vs app layouts without changing paths`**

---

**21. Private folders `_components` are:**

a) `Exposed as routes`
b) `Not routable; colocate non-route modules`
c) `Required for every page`
d) `Only in Pages Router`

**Answer: b) `Not routable; colocate non-route modules`**

---

**22. `app/sitemap.js` exports:**

a) `Only XML strings manually always`
b) `A default function returning sitemap entries or MetadataRoute.Sitemap`
c) `robots rules only`
d) `Middleware config`

**Answer: b) `A default function returning sitemap entries or MetadataRoute.Sitemap`**

---

**23. `app/robots.js` configures:**

a) `Image loaders`
b) `Robots.txt rules via metadata route`
c) `Font files`
d) `Session store`

**Answer: b) `Robots.txt rules via metadata route`**

---

**24. `opengraph-image.js` can export:**

a) `A default image component or configured OG image generation`
b) `Only CSS`
c) `API keys`
d) `Webpack plugins`

**Answer: a) `A default image component or configured OG image generation`**

---

**25. Session management in Next.js often combines:**

a) `Only localStorage for secrets`
b) `HTTP-only cookies + server verification + middleware gates`
c) `Storing JWT in URL query always`
d) `Disabling HTTPS`

**Answer: b) `HTTP-only cookies + server verification + middleware gates`**

---

**26. Setting cookies in Route Handlers uses:**

a) `document.cookie`
b) `NextResponse with Set-Cookie headers`
c) `window.localStorage`
d) `import.meta.env only`

**Answer: b) `NextResponse with Set-Cookie headers`**

---

**27. `dynamic()` import returns:**

a) `A synchronous component always`
b) `A lazy-loaded React component with loading fallback options`
c) `A database client`
d) `A middleware chain`

**Answer: b) `A lazy-loaded React component with loading fallback options`**

---

**28. Responsive images with `fill` and parent `position: relative`:**

a) `Are invalid`
b) `Let the image cover the positioned parent`
c) `Disable lazy loading`
d) `Remove alt`

**Answer: b) `Let the image cover the positioned parent`**

---

**29. Data Cache invalidation after mutation often calls:**

a) `window.reload only`
b) `revalidatePath / revalidateTag from server contexts`
c) `next/script`
d) `next/font`

**Answer: b) `revalidatePath / revalidateTag from server contexts`**

---

**30. `headers().get("x-forwarded-for")` might affect caching because:**

a) `Headers are static always`
b) `Varying by request headers can opt into dynamic behavior`
c) `It removes RSC`
d) `It is client-only`

**Answer: b) `Varying by request headers can opt into dynamic behavior`**

---

**31. Auth in Server Actions should:**

a) `Trust hidden form fields only`
b) `Re-verify session/role on the server for each action`
c) `Skip CSRF because server`
d) `Use only client JWT in memory`

**Answer: b) `Re-verify session/role on the server for each action`**

---

**32. `next/headers` in Client Components is:**

a) `Allowed freely`
b) `Not supported; use server or pass props`
c) `Required for hooks`
d) `Same as usePathname`

**Answer: b) `Not supported; use server or pass props`**

---

**33. Internationalized path `/en/blog` suggests:**

a) `Catch-all only`
b) `Locale segment as part of URL structure`
c) `Private folder`
d) `Parallel route slot`

**Answer: b) `Locale segment as part of URL structure`**

---

**34. `priority` on `next/image` hints:**

a) `Lower quality`
b) `LCP image should load sooner`
c) `Disable optimization`
d) `SVG only`

**Answer: b) `LCP image should load sooner`**

---

**35. Error handling pattern: show fallback UI with:**

a) `error.js boundaries + structured logging`
b) `Only alert()`
c) `Deleting routes`
d) `middleware only for UI`

**Answer: a) `error.js boundaries + structured logging`**

---

**36. `revalidateTag` is best when:**

a) `You know affected resources share a tag`
b) `You never cache`
c) `Only static HTML`
d) `Only client state`

**Answer: a) `You know affected resources share a tag`**

---

**37. `revalidatePath` is best when:**

a) `You want to refresh a subtree tied to a URL`
b) `You only optimize fonts`
c) `You disable middleware`
d) `You need WebSockets`

**Answer: a) `You want to refresh a subtree tied to a URL`**

---

**38. Route groups cannot:**

a) `Nest layouts`
b) `Add URL segments by themselves`
c) `Contain pages`
d) `Use loading.js`

**Answer: b) `Add URL segments by themselves`**

---

**39. `opengraph-image.tsx` living next to `page.tsx` scopes OG image:**

a) `Globally only`
b) `To that route segment`
c) `To node_modules`
d) `To middleware`

**Answer: b) `To that route segment`**

---

**40. Dynamic import with `loading: () => <Spinner/>` improves:**

a) `Database indexes`
b) `Perceived performance while chunk loads`
c) `Type checking speed`
d) `CSP strictness`

**Answer: b) `Perceived performance while chunk loads`**

---

**41. Cookie-based sessions should prefer:**

a) `SameSite and HttpOnly flags where appropriate`
b) `Storing raw passwords in cookies`
c) `localStorage for refresh tokens`
d) `URL query for secrets`

**Answer: a) `SameSite and HttpOnly flags where appropriate`**

---

**42. `sitemap.js` dynamic entries might come from:**

a) `Only hardcoded array`
b) `CMS/database query at request/build depending on setup`
c) `CSS files`
d) `next.config only`

**Answer: b) `CMS/database query at request/build depending on setup`**

---

**43. `robots.js` `disallow` rules affect:**

a) `Browser JS execution`
b) `Crawler behavior (polite compliance, not security)`
c) `TLS`
d) `Server Components`

**Answer: b) `Crawler behavior (polite compliance, not security)`**

---

**44. Parallel route missing `default.js` when inactive slot can:**

a) `Always work silently`
b) `Cause errors in development for unmatched parallel routes`
c) `Replace layout`
d) `Disable RSC`

**Answer: b) `Cause errors in development for unmatched parallel routes`**

---

**45. `notFound()` vs `redirect()` — which keeps the user on a missing resource concept?**

a) `redirect always`
b) `notFound presents 404 UI`
c) `Neither`
d) `Both identical`

**Answer: b) `notFound presents 404 UI`**

---

**46. Image `sizes="(max-width: 768px) 100vw, 50vw"` communicates:**

a) `Font sizes`
b) `Displayed width hints across breakpoints for srcset generation`
c) `API pagination`
d) `Cookie max-age`

**Answer: b) `Displayed width hints across breakpoints for srcset generation`**

---

**47. Session fixation mitigation includes:**

a) `Rotating session ID on privilege change`
b) `Long-lived password in cookie`
c) `Disabling HTTPS`
d) `Client-only auth checks`

**Answer: a) `Rotating session ID on privilege change`**

---

**48. Colocating `_lib` with private folder naming:**

a) `Creates a public route /_lib`
b) `Avoids accidental routable segments for helpers`
c) `Is forbidden`
d) `Only works in Pages Router`

**Answer: b) `Avoids accidental routable segments for helpers`**

---

**49. Metadata routes like `sitemap.js` and `robots.js` are:**

a) `Only for static export`
b) `Special files under app/ that generate well-known endpoints`
c) `Deprecated`
d) `Only in /public`

**Answer: b) `Special files under app/ that generate well-known endpoints`**

---

**50. Combining middleware auth + RSC data fetching should ensure:**

a) `Secrets only in NEXT_PUBLIC_`
b) `Authorization checks at data layer, not only UI hiding`
c) `No HTTPS`
d) `Trust all headers blindly`

**Answer: b) `Authorization checks at data layer, not only UI hiding`**

---
