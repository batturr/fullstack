# Next.js MCQ - Set 1 (Beginner Level)

**1. What best describes Next.js in relation to React?**

a) `A runtime that replaces the React reconciler`
b) `A React framework that adds routing, rendering strategies, and tooling`
c) `A CSS preprocessor for React apps`
d) `A database ORM for full-stack React`

**Answer: b) `A React framework that adds routing, rendering strategies, and tooling`**

---

**2. Compared to using React alone, Next.js primarily provides which capability?**

a) `Virtual DOM implementation`
b) `JSX transformation`
c) `Opinionated file-based routing and server rendering options`
d) `State management like Redux`

**Answer: c) `Opinionated file-based routing and server rendering options`**

---

**3. Which command scaffolds a new Next.js app with recommended defaults?**

a) `npx create-react-app my-app`
b) `npm init next-app`
c) `npx create-next-app@latest`
d) `next new my-app`

**Answer: c) `npx create-next-app@latest`**

---

**4. In the App Router, which file name defines the UI for a route segment?**

a) `index.js`
b) `route.js`
c) `page.js or page.tsx`
d) `main.js`

**Answer: c) `page.js or page.tsx`**

---

**5. What is the purpose of `layout.js` in the `app` directory?**

a) `It replaces page.js for dynamic routes`
b) `It wraps child segments and persists across navigations within that segment`
c) `It only runs on the server during build`
d) `It defines API endpoints`

**Answer: b) `It wraps child segments and persists across navigations within that segment`**

---

**6. What does a `loading.js` file conventionally do in the App Router?**

a) `Blocks all JavaScript until data loads`
b) `Shows a loading UI while a route segment is loading, often with Suspense`
c) `Replaces error boundaries`
d) `Configures webpack`

**Answer: b) `Shows a loading UI while a route segment is loading, often with Suspense`**

---

**7. What is `error.js` used for in the App Router?**

a) `To log build errors only`
b) `To define 404 pages`
c) `As an error boundary for a route segment`
d) `To disable client-side navigation`

**Answer: c) `As an error boundary for a route segment`**

---

**8. Which import is correct for client-side navigation in the App Router?**

```jsx
import Link from "???";
```

a) `"react-router-dom"`
b) `"next/link"`
c) `"next/navigation"`
d) `"next/router"`

**Answer: b) `"next/link"`**

---

**9. What is a key benefit of `next/image` over a plain `<img>`?**

a) `It always loads images from a CDN you must configure`
b) `Automatic optimization, sizing, and lazy loading features`
c) `It only works with SVG`
d) `It removes the need for alt text`

**Answer: b) `Automatic optimization, sizing, and lazy loading features`**

---

**10. In the App Router, where do you typically define page metadata like title and description?**

a) `Only in next.config.js`
b) `Using the Head component from next/head in every file`
c) `Exporting a metadata object or generateMetadata from layout/page`
d) `In package.json`

**Answer: c) `Exporting a metadata object or generateMetadata from layout/page`**

---

**11. Where should static files like `favicon.ico` or `robots.txt` be placed for public URLs?**

a) `app/public/`
b) `src/assets/`
c) `public/` at the project root`
d) `static/` next to node_modules`

**Answer: c) `public/` at the project root`**

---

**12. How do CSS Modules files conventionally end?**

a) `.global.css`
b) `.module.css`
c) `.next.css`
d) `.scoped.less`

**Answer: b) `.module.css`**

---

**13. Where is global CSS typically imported in the App Router?**

a) `In any component with "use client"`
b) `Only in next.config.js`
c) `In the root layout (e.g. app/layout.js)`
d) `In middleware.js`

**Answer: c) `In the root layout (e.g. app/layout.js)`**

---

**14. In the App Router, Server Components are the default. What marks a file as a Client Component?**

a) `"use server" at the top`
b) `"use client" at the top`
c) `export const dynamic = "force-static"`
d) `import "client-only"`

**Answer: b) `"use client" at the top`**

---

**15. Which statement about Server Components in Next.js App Router is most accurate?**

a) `They can use useState and useEffect`
b) `They run on the server and can fetch data close to the source`
c) `They always ship their full source to the browser`
d) `They cannot import other components`

**Answer: b) `They run on the server and can fetch data close to the source`**

---

**16. Which env file is commonly gitignored and used for local secrets in development?**

a) `.env.production`
b) `.env.local`
c) `.env.example`
d) `.env.global`

**Answer: b) `.env.local`**

---

**17. Which prefix exposes a variable to the browser in Next.js?**

a) `SERVER_`
b) `NEXT_`
c) `PUBLIC_`
d) `NEXT_PUBLIC_`

**Answer: d) `NEXT_PUBLIC_`**

---

**18. What does `next.config.mjs` (or `next.config.js`) primarily configure?**

a) `Database migrations`
b) `Build and runtime behavior of the Next.js application`
c) `ESLint rules only`
d) `Git hooks`

**Answer: b) `Build and runtime behavior of the Next.js application`**

---

**19. Which npm script starts the development server with hot reload?**

a) `npm run build`
b) `npm run start`
c) `npm run dev`
d) `npm run preview`

**Answer: c) `npm run dev`**

---

**20. What does `npm run build` do?**

a) `Starts production server`
b) `Creates an optimized production build`
c) `Runs only unit tests`
d) `Deploys to Vercel automatically`

**Answer: b) `Creates an optimized production build`**

---

**21. After building, which command typically serves the production build locally?**

a) `npm run dev`
b) `npm run start`
c) `npm run serve`
d) `next preview`

**Answer: b) `npm run start`**

---

**22. Does `create-next-app` support TypeScript out of the box?**

a) `No, you must eject first`
b) `Yes, you can choose TypeScript during setup`
c) `Only with Pages Router`
d) `Only on Windows`

**Answer: b) `Yes, you can choose TypeScript during setup`**

---

**23. In file-based routing, what does `app/blog/page.js` map to?**

a) `/blog/page`
b) `/blog`
c) `/app/blog`
d) `/pages/blog`

**Answer: b) `/blog`**

---

**24. What is React in comparison to Next.js?**

a) `React is a framework; Next.js is a library`
b) `React is a UI library; Next.js is a framework built on React`
c) `They are unrelated technologies`
d) `React handles routing; Next.js handles components`

**Answer: b) `React is a UI library; Next.js is a framework built on React`**

---

**25. Which hook is NOT available in Server Components?**

```jsx
// This would error in a Server Component:
import { useState } from "react";
```

a) `useState is not available in Server Components`
b) `All React hooks work the same`
c) `Only useEffect is forbidden`
d) `Only useReducer is forbidden`

**Answer: a) `useState is not available in Server Components`**

---

**26. What does `next/link` render by default in modern Next.js?**

a) `A button element`
b) `An anchor (<a>) element suitable for navigation`
c) `A form`
d) `A div with onClick only`

**Answer: b) `An anchor (<a>) element suitable for navigation`**

---

**27. For `next/image`, what prop is required for static imports and remote images configuration?**

a) `href`
b) `src`
c) `path`
d) `url` only without src`

**Answer: b) `src`**

---

**28. In App Router, nested folders under `app/` represent what?**

a) `Webpack entry points`
b) `URL path segments`
c) `Database tables`
d) `Environment profiles`

**Answer: b) `URL path segments`**

---

**29. Can a route segment have both `layout.js` and `page.js`?**

a) `No, they conflict`
b) `Yes, layout wraps page`
c) `Only in Pages Router`
d) `Only if page.js is named index.js`

**Answer: b) `Yes, layout wraps page`**

---

**30. What is the Pages Router directory convention (older routing)?**

a) `routes/`
b) `pages/`
c) `views/`
d) `screens/`

**Answer: b) `pages/`**

---

**31. Basic data fetching in a Server Component often uses:**

a) `fetch in the component body or async component`
b) `only useEffect with axios`
c) `getServerSideProps in App Router`
d) `window.localStorage`

**Answer: a) `fetch in the component body or async component`**

---

**32. Client Components are needed when you require:**

a) `Only static HTML`
b) `Browser APIs, event handlers, or client-side state`
c) `Faster initial HTML always`
d) `No JavaScript in the bundle`

**Answer: b) `Browser APIs, event handlers, or client-side state`**

---

**33. What happens if you omit `"use client"` but use `onClick` in App Router?**

a) `Next.js auto-promotes to client`
b) `You get a build/compile error`
c) `It runs only on the server silently`
d) `It becomes a Server Action`

**Answer: b) `You get a build/compile error`**

---

**34. `NEXT_PUBLIC_API_URL` is accessible where?**

a) `Only in middleware`
b) `In browser and server bundles (inlined at build time)`
c) `Only in API routes`
d) `Only in .env.local on disk at runtime in production`

**Answer: b) `In browser and server bundles (inlined at build time)`**

---

**35. Which file is the root shell of an App Router app?**

a) `app/page.js` only
b) `app/layout.js` (root layout)`
c) `app/template.js`
d) `app/global.js`

**Answer: b) `app/layout.js` (root layout)`**

---

**36. In `next.config.js`, `images.domains` (or remotePatterns) configures:**

a) `Font sources`
b) `Allowed remote image hosts for next/image`
c) `API CORS`
d) `Cookie domains`

**Answer: b) `Allowed remote image hosts for next/image`**

---

**37. What is Turbopack relative to `npm run dev` in supported versions?**

a) `The production bundler only`
b) `An optional faster dev bundler (behind flags in some versions)`
c) `A database`
d) `A CSS framework`

**Answer: b) `An optional faster dev bundler (behind flags in some versions)`**

---

**38. TypeScript in Next.js typically uses which config file?**

a) `jsconfig.json` only always
b) `tsconfig.json`
c) `next-typescript.json`
d) `babel.config.ts`

**Answer: b) `tsconfig.json`**

---

**39. Global CSS import in root layout applies how?**

a) `Only to the first page`
b) `Across the app (global scope)`
c) `Only to server components`
d) `Only during SSR`

**Answer: b) `Across the app (global scope)`**

---

**40. CSS Modules help avoid what problem?**

a) `Slow network`
b) `Class name collisions by scoping styles`
c) `Missing TypeScript`
d) `Hydration mismatch always`

**Answer: b) `Class name collisions by scoping styles`**

---

**41. The `public/` folder files are served at:**

a) `The /static path prefix only`
b) `The root URL path matching the filename`
c) `Only through API routes`
d) `They are never served`

**Answer: b) `The root URL path matching the filename`**

---

**42. Which is true about `next/head`?**

a) `It is the primary metadata API in App Router`
b) `It is commonly used in Pages Router; App Router favors the Metadata API`
c) `It replaces next/image`
d) `It is deprecated entirely`

**Answer: b) `It is commonly used in Pages Router; App Router favors the Metadata API`**

---

**43. Server Components can import Client Components as:**

a) `Synchronous children or props, with client boundary below`
b) `Never`
c) `Only via dynamic import with ssr:false always`
d) `Only if Client Component has no props`

**Answer: a) `Synchronous children or props, with client boundary below`**

---

**44. A Client Component importing a Server Component directly is:**

a) `Allowed without restrictions`
b) `Generally not supported; server components cannot be imported into client modules that way`
c) `Required for hooks`
d) `Only allowed in middleware`

**Answer: b) `Generally not supported; server components cannot be imported into client modules that way`**

---

**45. `npm run lint` in a typical Next.js project often runs:**

a) `Only Prettier`
b) `ESLint (often next/core-web-vitals config)`
c) `TypeScript compiler`
d) `Jest only`

**Answer: b) `ESLint (often next/core-web-vitals config)`**

---

**46. What does the `app` directory represent conceptually?**

a) `Only static files`
b) `The App Router route tree`
c) `Server Actions storage`
d) `Docker config`

**Answer: b) `The App Router route tree`**

---

**47. For local development, default Next.js dev server port is commonly:**

a) `5000`
b) `8080`
c) `3000`
d) `4000`

**Answer: c) `3000`**

---

**48. Environment variables without `NEXT_PUBLIC_` are intended to be:**

a) `Exposed to the browser`
b) `Server-side only (not exposed to client bundles)`
c) `Ignored by Next.js`
d) `Only for Vercel`

**Answer: b) `Server-side only (not exposed to client bundles)`**

---

**49. Which describes "framework vs library" simply?**

a) `Next.js inverts control with conventions; React is a UI library you compose`
b) `There is no difference`
c) `React includes routing; Next.js does not`
d) `Libraries never ship CLI tools`

**Answer: a) `Next.js inverts control with conventions; React is a UI library you compose`**

---

**50. `loading.js` at a segment level is closest in spirit to:**

a) `A service worker`
b) `React Suspense fallback for that segment`
c) `A Redux middleware`
d) `A database transaction`

**Answer: b) `React Suspense fallback for that segment`**

---
