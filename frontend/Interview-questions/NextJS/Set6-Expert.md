# Next.js MCQ - Set 6 (Expert Level)

**1. The React Server Components wire format is often called:**

a) `JSON-RPC`
b) `React Flight protocol`
c) `GraphQL SDL`
d) `Protobuf RSC`

**Answer: b) `React Flight protocol`**

---

**2. Hydration in Next.js means:**

a) `Deleting HTML`
b) `Attaching client React to server-rendered HTML for interactive islands`
c) `Only CSS application`
d) `Database seeding`

**Answer: b) `Attaching client React to server-rendered HTML for interactive islands`**

---

**3. Selective hydration strategies aim to:**

a) `Hydrate everything before paint`
b) `Prioritize interactive regions without blocking the whole page`
c) `Remove Server Components`
d) `Disable streaming`

**Answer: b) `Prioritize interactive regions without blocking the whole page`**

---

**4. Rendering pipeline summary: RSC payload + client references produce:**

a) `Only PDF`
b) `HTML stream with client component placeholders`
c) `Webpack stats only`
d) `SQL`

**Answer: b) `HTML stream with client component placeholders`**

---

**5. Bundle analysis in Next.js commonly uses:**

a) `next bundle analyzer (@next/bundle-analyzer) or Webpack Bundle Analyzer`
b) `Only console.count`
c) `next/font`
d) `middleware`

**Answer: a) `next bundle analyzer (@next/bundle-analyzer) or Webpack Bundle Analyzer`**

---

**6. Tree shaking removes:**

a) `All comments only`
b) `Unused module exports from production bundles when statically analyzable`
c) `TypeScript types at runtime always incorrectly`
d) `Public folder`

**Answer: b) `Unused module exports from production bundles when statically analyzable`**

---

**7. Code splitting strategy in App Router:**

a) `Single bundle always`
b) `Per-route and per-client-boundary chunks via compiler`
c) `No splitting`
d) `Only manual webpack entry per file`

**Answer: b) `Per-route and per-client-boundary chunks via compiler`**

---

**8. Lazy loading patterns include:**

a) `Import everything in layout always`
b) `next/dynamic and route-based splitting`
c) `Only synchronous requires`
d) `Inlining all SVG`

**Answer: b) `next/dynamic and route-based splitting`**

---

**9. Font optimization with `next/font` improves CLS by:**

a) `Removing text`
b) `Self-hosting and size-adjust strategies`
c) `Disabling fonts`
d) `Using only system monospace`

**Answer: b) `Self-hosting and size-adjust strategies`**

---

**10. Core Web Vitals include:**

a) `LCP, INP/FID, CLS (among key metrics)`
b) `Only npm audit`
c) `Only build time`
d) `Only SQL latency`

**Answer: a) `LCP, INP/FID, CLS (among key metrics)`**

---

**11. Waterfall prevention means:**

a) `Serializing unrelated fetches unnecessarily`
b) `Starting independent data dependencies in parallel`
c) `Removing Suspense`
d) `Disabling caching`

**Answer: b) `Starting independent data dependencies in parallel`**

---

**12. Suspense boundaries strategy: place boundaries:**

a) `Only at root always`
b) `Around slow async subtrees with meaningful fallbacks`
c) `Never in RSC`
d) `Only in CSS`

**Answer: b) `Around slow async subtrees with meaningful fallbacks`**

---

**13. Middleware chaining pattern:**

a) `Single middleware file composing helpers`
b) `Infinite nested next.config`
c) `Only getServerSideProps`
d) `Cannot compose`

**Answer: a) `Single middleware file composing helpers`**

---

**14. Conditional middleware logic should:**

a) `Run expensive DB on every asset`
b) `Early return with matcher + cheap checks`
c) `Never use matchers`
d) `Block all bots`

**Answer: b) `Early return with matcher + cheap checks`**

---

**15. Rate limiting pattern sketch:**

```javascript
// pseudocode in middleware
if (await isRateLimited(ip)) return new Response("Too Many", { status: 429 });
```

a) `Always impossible on Edge`
b) `Use external store or edge KV with atomic counters`
c) `Only in Service Worker`
d) `Only in CSS`

**Answer: b) `Use external store or edge KV with atomic counters`**

---

**16. Turborepo monorepo with Next.js often caches:**

a) `node_modules only`
b) `Task outputs via hashing inputs across packages`
c) `User sessions`
d) `Docker layers only`

**Answer: b) `Task outputs via hashing inputs across packages`**

---

**17. Micro-frontends with Next.js might use:**

a) `Only iframes always`
b) `Module federation or multi-zone apps with routing proxies`
c) `Disabling SSR`
d) `Single global Redux only`

**Answer: b) `Module federation or multi-zone apps with routing proxies`**

---

**18. Unit testing Next.js components often uses:**

a) `Only Playwright`
b) `Jest/Vitest + React Testing Library`
c) `Only Cypress component runner for all`
d) `next build --test`

**Answer: b) `Jest/Vitest + React Testing Library`**

---

**19. E2E testing commonly uses:**

a) `ESLint`
b) `Playwright or Cypress driving real browser`
c) `SWC only`
d) `TypeScript compiler`

**Answer: b) `Playwright or Cypress driving real browser`**

---

**20. Integration tests for Route Handlers:**

a) `Cannot call exported GET`
b) `Use fetch against dev server or invoke handler with Request polyfill`
c) `Only manual curl`
d) `Only in production`

**Answer: b) `Use fetch against dev server or invoke handler with Request polyfill`**

---

**21. Typed routes (experimental) improve:**

a) `Runtime regex`
b) `Autocomplete and safety for href strings`
c) `Database migrations`
d) `Image decoding`

**Answer: b) `Autocomplete and safety for href strings`**

---

**22. Metadata typing in TypeScript leverages:**

a) `Metadata type from next`
b) `any only`
c) `CSSModules`
d) `Prisma schema`

**Answer: a) `Metadata type from next`**

---

**23. Server Action typing pattern:**

```typescript
"use server";
export async function create(formData: FormData) { ... }
```

a) `Server actions cannot be typed`
b) `Use FormData + zod parsing with inferred types`
c) `Only string args`
d) `Must return void`

**Answer: b) `Use FormData + zod parsing with inferred types`**

---

**24. Prisma in Next.js should avoid:**

a) `Connection pooling considerations in serverless`
b) `Thinking about DB connection limits and pooling`
c) `Any schema`
d) `Migrations`

**Answer: b) `Thinking about DB connection limits and pooling`**

---

**25. Drizzle patterns emphasize:**

a) `Only Mongo`
b) `Type-safe SQL schemas + migrations`
c) `No TypeScript`
d) `Disabling SSR`

**Answer: b) `Type-safe SQL schemas + migrations`**

---

**26. WebSockets in Next.js:**

a) `Are first-class in Route Handlers the same as Node sockets always`
b) `Often need custom server, separate WS service, or platform-specific solutions`
c) `Cannot exist`
d) `Built into Link`

**Answer: b) `Often need custom server, separate WS service, or platform-specific solutions`**

---

**27. Real-time updates alternative to raw WS:**

a) `SSE or hosted realtime (Pusher/Ably) with RSC refresh`
b) `Only meta refresh`
c) `Only cookies`
d) `next/font`

**Answer: a) `SSE or hosted realtime (Pusher/Ably) with RSC refresh`**

---

**28. Advanced error monitoring integrates via:**

a) `instrumentation + OpenTelemetry or Sentry SDK`
b) `alert() only`
c) `CSS @error`
d) `Disabling logs`

**Answer: a) `instrumentation + OpenTelemetry or Sentry SDK`**

---

**29. Migration Pages Router to App Router often:**

a) `Deletes React`
b) `Moves routes incrementally; coexists during transition`
c) `Requires single day cutover only`
d) `Removes next/link`

**Answer: b) `Moves routes incrementally; coexists during transition`**

---

**30. Replacing `getServerSideProps` mentally maps to:**

a) `Only useEffect`
b) `Async Server Component + fetch or external data layer`
c) `next/head only`
d) `getInitialProps only`

**Answer: b) `Async Server Component + fetch or external data layer`**

---

**31. Replacing `getStaticProps` maps to:**

a) `Static RSC with cached fetch or generateStaticParams`
b) `middleware only`
c) `Client-only rendering always`
d) `API routes only`

**Answer: a) `Static RSC with cached fetch or generateStaticParams`**

---

**32. `pages/_app` global styles migration:**

a) `Move global imports to app/layout`
b) `Delete CSS`
c) `Only inline styles`
d) `Cannot migrate`

**Answer: a) `Move global imports to app/layout`**

---

**33. `getLayout` pattern in Pages Router maps loosely to:**

a) `Nested layouts in app/`
b) `Parallel routes only`
c) `middleware`
d) `next.config redirects only`

**Answer: a) `Nested layouts in app/`**

---

**34. Flight protocol serialization includes:**

a) `Only HTML entities`
b) `Component tree descriptions and references to client modules`
c) `Webpack zip`
d) `SQL rows`

**Answer: b) `Component tree descriptions and references to client modules`**

---

**35. Performance: avoid huge client bundles by:**

a) `Marking everything "use client"`
b) `Keeping data fetching and heavy libs on server side`
c) `Inlining 10MB JSON`
d) `Removing Suspense`

**Answer: b) `Keeping data fetching and heavy libs on server side`**

---

**36. `React.cache` dedupes:**

a) `Network across users`
b) `Function calls in a render for same args`
c) `CSS modules`
d) `Images across domains`

**Answer: b) `Function calls in a render for same args`**

---

**37. LCP optimization checklist includes:**

a) `Defer hero image and no priority`
b) `Preload/priority for LCP image, reduce TTFB, avoid render-blocking assets`
c) `Only smaller bundle`
d) `Remove alt`

**Answer: b) `Preload/priority for LCP image, reduce TTFB, avoid render-blocking assets`**

---

**38. INP focuses on:**

a) `Server build time`
b) `Interaction responsiveness`
c) `Font files count`
d) `Docker size`

**Answer: b) `Interaction responsiveness`**

---

**39. CLS spikes often from:**

a) `Sized images and stable fonts`
b) `Unsized media and late web fonts without metrics`
c) `Server Components`
d) `Static generation`

**Answer: b) `Unsized media and late web fonts without metrics`**

---

**40. Monorepo package imports benefit from:**

a) `transpilePackages in next.config for workspace libs`
b) `Deleting tsconfig`
c) `Only relative paths outside repo`
d) `Disabling SWC`

**Answer: a) `transpilePackages in next.config for workspace libs`**

---

**41. Micro-frontend routing proxy:**

a) `Cannot forward paths`
b) `rewrites in next.config or reverse proxy rules`
c) `Only middleware on client`
d) `Only GraphQL`

**Answer: b) `rewrites in next.config or reverse proxy rules`**

---

**42. Playwright test against Next.js:**

a) `Requires production build always`
b) `Can run against dev or preview URLs with webServer config`
c) `Cannot test App Router`
d) `Only unit`

**Answer: b) `Can run against dev or preview URLs with webServer config`**

---

**43. Cypress component vs E2E:**

a) `Identical`
b) `Component tests mount isolated; E2E drives full app`
c) `Only E2E exists`
d) `Only for CSS`

**Answer: b) `Component tests mount isolated; E2E drives full app`**

---

**44. Strict TypeScript in Next.js catches:**

a) `Runtime network errors always`
b) `Bad props and server/client boundary mistakes earlier`
c) `All security issues`
d) `Image sizes`

**Answer: b) `Bad props and server/client boundary mistakes earlier`**

---

**45. Prisma Accelerate/Data Proxy addresses:**

a) `CSS`
b) `Connection pooling in serverless/edge-like deployments`
c) `Font loading`
d) `Open Graph`

**Answer: b) `Connection pooling in serverless/edge-like deployments`**

---

**46. Drizzle + edge driver considerations:**

a) `Ignore environment`
b) `Choose drivers compatible with edge constraints`
c) `Always use fs`
d) `No migrations`

**Answer: b) `Choose drivers compatible with edge constraints`**

---

**47. `server-only` package marks modules:**

a) `For client import`
b) `That must not be bundled for client`
c) `As deprecated`
d) `As CSS`

**Answer: b) `That must not be bundled for client`**

---

**48. `client-only` package marks modules:**

a) `That must not run on server`
b) `For Prisma`
c) `For robots`
d) `For sitemap`

**Answer: a) `That must not run on server`**

---

**49. Advanced monitoring: trace IDs through:**

a) `middleware setting request headers propagated to handlers`
b) `window.alert`
c) `CSS variables only`
d) `Deleting logs`

**Answer: a) `middleware setting request headers propagated to handlers`**

---

**50. Successful Pages→App migration validates:**

a) `Only homepage visually`
b) `SEO metadata, redirects, auth flows, and data parity per route`
c) `Only lint`
d) `Only TypeScript version`

**Answer: b) `SEO metadata, redirects, auth flows, and data parity per route`**

---
