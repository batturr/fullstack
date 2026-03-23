# Next.js MCQ - Set 5 (Expert Level)

**1. Next.js compiles JavaScript/TypeScript primarily with:**

a) `Babel only in all versions forever`
b) `SWC by default for fast compilation`
c) `esbuild for app code only always`
d) `V8 snapshots only`

**Answer: b) `SWC by default for fast compilation`**

---

**2. Turbopack in Next.js is:**

a) `The production bundler replacing webpack in all cases always`
b) `An incremental Rust-based bundler used for dev (and evolving for build)`
c) `A CSS linter`
d) `A database`

**Answer: b) `An incremental Rust-based bundler used for dev (and evolving for build)`**

---

**3. `unstable_cache` wraps a function to:**

a) `Disable caching`
b) `Memoize expensive work across requests with tags and revalidation options`
c) `Replace middleware`
d) `Run only in browser`

**Answer: b) `Memoize expensive work across requests with tags and revalidation options`**

---

**4. React `cache()` helper is used to:**

a) `Configure next/image`
b) `Deduplicate function calls during a single server render`
c) `Replace fetch`
d) `Set CSP headers`

**Answer: b) `Deduplicate function calls during a single server render`**

---

**5. Partial Prerendering (PPR) conceptually combines:**

a) `Only CSR`
b) `Static shell with streamed dynamic holes`
c) `No HTML`
d) `GraphQL only`

**Answer: b) `Static shell with streamed dynamic holes`**

---

**6. Streaming SSR architecture benefits include:**

a) `Blocking TTFB until all DB queries finish`
b) `Earlier first byte and progressive HTML delivery`
c) `Removing hydration`
d) `Disabling SEO`

**Answer: b) `Earlier first byte and progressive HTML delivery`**

---

**7. Edge Runtime vs Node.js runtime — Edge is:**

a) `Always faster for heavy CPU crypto`
b) `Lightweight V8 isolates with restricted Node APIs`
c) `Identical to Node`
d) `Browser-only`

**Answer: b) `Lightweight V8 isolates with restricted Node APIs`**

---

**8. Middleware advanced pattern: geolocation uses:**

a) `navigator.geolocation in middleware`
b) `Vercel/geo headers or similar edge request hints`
c) `GPS hardware`
d) `Only client IP in localStorage`

**Answer: b) `Vercel/geo headers or similar edge request hints`**

---

**9. A/B testing at the edge via middleware can:**

a) `Never assign variants`
b) `Set cookies and rewrite to variant routes`
c) `Only change CSS`
d) `Disable RSC`

**Answer: b) `Set cookies and rewrite to variant routes`**

---

**10. Feature flags in middleware often:**

a) `Read flag state and rewrite/redirect before route handlers`
b) `Replace TypeScript`
c) `Compile components`
d) `Host images`

**Answer: a) `Read flag state and rewrite/redirect before route handlers`**

---

**11. Optimistic updates with Server Actions typically combine:**

a) `useOptimistic + pending UI + eventual server confirmation`
b) `Only useEffect`
c) `getServerSideProps`
d) `next/head only`

**Answer: a) `useOptimistic + pending UI + eventual server confirmation`**

---

**12. Server Action revalidation after mutation often calls:**

a) `revalidatePath / revalidateTag inside the action`
b) `window.location only`
c) `next/font`
d) `next/script`

**Answer: a) `revalidatePath / revalidateTag inside the action`**

---

**13. Progressive enhancement for forms means:**

a) `JavaScript required for any submit`
b) `Basic submit works without JS; enhanced with client behaviors`
c) `No server`
d) `Only WebSockets`

**Answer: b) `Basic submit works without JS; enhanced with client behaviors`**

---

**14. `instrumentation.js` (or `instrumentation.ts`) is for:**

a) `Defining CSS variables only`
b) `Registering OpenTelemetry/monitoring hooks on server start`
c) `Replacing middleware`
d) `Image optimization`

**Answer: b) `Registering OpenTelemetry/monitoring hooks on server start`**

---

**15. Vercel deployment of Next.js leverages:**

a) `Zero build step`
b) `Optimized platform integration (build, edge, ISR, images)`
c) `Only static FTP`
d) `Docker only`

**Answer: b) `Optimized platform integration (build, edge, ISR, images)`**

---

**16. Self-hosting Next.js requires you to:**

a) `Never run Node`
b) `Run appropriate Node server or adapter for your features (SSR, RSC, etc.)`
c) `Only use Apache CGI`
d) `Disable middleware`

**Answer: b) `Run appropriate Node server or adapter for your features (SSR, RSC, etc.)`**

---

**17. Docker for Next.js often uses multi-stage builds and:**

a) `Only devDependencies in final image`
b) `output standalone to trim node_modules in runtime image`
c) `No COPY step`
d) `Hot reload in production`

**Answer: b) `output standalone to trim node_modules in runtime image`**

---

**18. `output: 'standalone'` produces:**

a) `Only static HTML`
b) `A minimal server bundle with traced dependencies`
c) `Webpack config JSON`
d) `Prisma migrations`

**Answer: b) `A minimal server bundle with traced dependencies`**

---

**19. On-demand ISR revalidation uses:**

a) `Only time-based revalidate`
b) `Secret token route to revalidateTag/Path from external systems`
c) `localStorage events`
d) `CSS animations`

**Answer: b) `Secret token route to revalidateTag/Path from external systems`**

---

**20. JWT in middleware pattern: verify signature and:**

a) `Trust token body without expiry check`
b) `Check exp/nbf claims and rotate refresh securely`
c) `Store JWT in URL`
d) `Disable HTTPS`

**Answer: b) `Check exp/nbf claims and rotate refresh securely`**

---

**21. OAuth in Next.js App Router often uses:**

a) `Only alert()`
b) `Route Handlers or auth libraries for callback + cookie session`
c) `document.write`
d) `middleware only without handlers`

**Answer: b) `Route Handlers or auth libraries for callback + cookie session`**

---

**22. Security headers in next.config headers() can set:**

a) `Only Content-Type`
b) `X-Frame-Options, HSTS, Permissions-Policy, etc.`
c) `Database URL`
d) `Font files`

**Answer: b) `X-Frame-Options, HSTS, Permissions-Policy, etc.`**

---

**23. Content-Security-Policy (CSP) with Next.js requires balancing:**

a) `unsafe-inline always for everything`
b) `Nonces/hashes for scripts vs strict directives`
c) `Disabling all JS`
d) `Only meta refresh`

**Answer: b) `Nonces/hashes for scripts vs strict directives`**

---

**24. next.config experimental flags may enable:**

a) `Stable APIs only always`
b) `Cutting-edge features (PPR, bundlers) subject to change`
c) `Removing TypeScript`
d) `Disabling routing`

**Answer: b) `Cutting-edge features (PPR, bundlers) subject to change`**

---

**25. Server Action error handling best practice:**

a) `Swallow all errors`
b) `Return discriminated union or field errors; use try/catch for unexpected`
c) `Only throw strings`
d) `Never validate`

**Answer: b) `Return discriminated union or field errors; use try/catch for unexpected`**

---

**26. Deduplication across fetch and cache() helps:**

a) `Waterfall only`
b) `Avoid redundant IO during nested server renders`
c) `Remove Suspense`
d) `Disable edge`

**Answer: b) `Avoid redundant IO during nested server renders`**

---

**27. Edge middleware cannot:**

a) `Rewrite requests`
b) `Use all Node native modules freely`
c) `Set cookies`
d) `Return JSON`

**Answer: b) `Use all Node native modules freely`**

---

**28. Node.js Route Handlers can use:**

a) `Only Web APIs`
b) `Node APIs like fs where runtime allows`
c) `No async`
d) `Only GET`

**Answer: b) `Node APIs like fs where runtime allows`**

---

**29. ISR revalidate path invalidation from CMS webhook:**

a) `Is impossible`
b) `Calls revalidation API with shared secret`
c) `Only works locally`
d) `Requires Pages Router`

**Answer: b) `Calls revalidation API with shared secret`**

---

**30. Advanced caching: tag invalidation granularity beats:**

a) `Full site rebuild for every typo`
b) `Only client cache`
c) `Only CSS`
d) `Nothing`

**Answer: a) `Full site rebuild for every typo`**

---

**31. instrumentation hook runs:**

a) `In the browser on click`
b) `On server initialization in supported deployments`
c) `Never`
d) `Only in Jest`

**Answer: b) `On server initialization in supported deployments`**

---

**32. Standalone output tracing includes:**

a) `Entire monorepo always`
b) `Dependencies used by the server bundle`
c) `All devDependencies`
d) `User uploads`

**Answer: b) `Dependencies used by the server bundle`**

---

**33. Strict CSP with inline scripts in Next.js often needs:**

a) `unsafe-inline only`
b) `Nonces via middleware + headers configuration`
c) `Disabling App Router`
d) `Removing metadata`

**Answer: b) `Nonces via middleware + headers configuration`**

---

**34. Server Actions idempotency for payments should:**

a) `Rely on double-click only`
b) `Use idempotency keys and server-side guards`
c) `Skip database transactions`
d) `Trust client clocks`

**Answer: b) `Use idempotency keys and server-side guards`**

---

**35. Turbopack vs Webpack in dev:**

a) `Identical cold start always`
b) `Turbopack aims at faster incremental bundling`
c) `Webpack cannot HMR`
d) `Turbopack is CSS-only`

**Answer: b) `Turbopack aims at faster incremental bundling`**

---

**36. unstable_cache tags integrate with:**

a) `next/font`
b) `revalidateTag`
c) `next/script`
d) `robots.txt`

**Answer: b) `revalidateTag`**

---

**37. PPR static shell improves:**

a) `Time to first paint for outer layout`
b) `Nothing`
c) `Only build logs`
d) `npm install speed`

**Answer: a) `Time to first paint for outer layout`**

---

**38. Self-hosted image optimization may require:**

a) `sharp installed for next/image in Node`
b) `No dependencies`
c) `Only CDN URL`
d) `Disabling images`

**Answer: a) `sharp installed for next/image in Node`**

---

**39. Edge functions cold start characteristics differ from Node because:**

a) `They are always slower for CPU`
b) `Isolation model and smaller API surface`
c) `They never cold start`
d) `They run in browser tabs`

**Answer: b) `Isolation model and smaller API surface`**

---

**40. Feature flag middleware should avoid:**

a) `Consistent routing`
b) `Unbounded cookie growth and PII in cleartext`
c) `Reading headers`
d) `Using matchers`

**Answer: b) `Unbounded cookie growth and PII in cleartext`**

---

**41. revalidatePath with layout type option (where supported) can:**

a) `Only change fonts`
b) `Target page vs layout invalidation semantics`
c) `Disable ISR`
d) `Remove middleware`

**Answer: b) `Target page vs layout invalidation semantics`**

---

**42. OAuth PKCE is important for:**

a) `Public clients and preventing code interception`
b) `Static images`
c) `CSS modules`
d) `Font subsetting`

**Answer: a) `Public clients and preventing code interception`**

---

**43. Docker healthchecks for Next.js should hit:**

a) `A lightweight route that verifies process readiness`
b) `Only 404`
c) `node_modules`
d) `Webpack stats`

**Answer: a) `A lightweight route that verifies process readiness`**

---

**44. SWC is written in:**

a) `JavaScript`
b) `Rust`
c) `Go`
d) `PHP`

**Answer: b) `Rust`**

---

**45. Advanced server action security includes:**

a) `CSRF protections provided by framework for same-origin posts`
b) `Trusting Origin header alone always`
c) `Embedding secrets in client`
d) `Skipping authz`

**Answer: a) `CSRF protections provided by framework for same-origin posts`**

---

**46. Rate limiting at the edge middleware:**

a) `Cannot use external stores`
b) `Often uses KV/Redis or in-memory with caveats across regions`
c) `Only in databases`
d) `Is impossible`

**Answer: b) `Often uses KV/Redis or in-memory with caveats across regions`**

---

**47. output export static export cannot support:**

a) `Static HTML`
b) `All dynamic server features (SSR/RSC server as full dynamic app)`
c) `Images`
d) `CSS`

**Answer: b) `All dynamic server features (SSR/RSC server as full dynamic app)`**

---

**48. HSTS header purpose:**

a) `Force HTTPS for future visits`
b) `Cache images`
c) `Set cookies HttpOnly`
d) `CORS`

**Answer: a) `Force HTTPS for future visits`**

---

**49. X-Content-Type-Options: nosniff mitigates:**

a) `MIME confusion attacks`
b) `SQL injection in DB`
c) `Image lazy load`
d) `Font loading`

**Answer: a) `MIME confusion attacks`**

---

**50. Choosing Edge vs Node for a route depends on:**

a) `Always pick Edge`
b) `Needed APIs, latency goals, and library compatibility`
c) `Always pick Node`
d) `Only bundle size`

**Answer: b) `Needed APIs, latency goals, and library compatibility`**

---
