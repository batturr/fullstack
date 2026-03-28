# Build and Deployment (React + TypeScript)

Shipping a React + TypeScript application involves compiling TSX to JavaScript, bundling modules, optimizing assets, and deploying to hosting that serves static files or runs a server. This chapter ties **e-commerce storefronts**, **social feeds**, **dashboards**, **todo sync**, **weather widgets**, and **chat clients** to production pipelines: the same UI code must run fast, safely, and observably in the browser after CI/CD validates it.

---

## 📑 Table of Contents

- [Build and Deployment (React + TypeScript)](#build-and-deployment-react--typescript)
  - [📑 Table of Contents](#-table-of-contents)
  - [21.1 Build Tools](#211-build-tools)
    - [Create React App (CRA)](#create-react-app-cra)
    - [Vite](#vite)
    - [Webpack Configuration](#webpack-configuration)
    - [Rollup](#rollup)
    - [Parcel](#parcel)
    - [esbuild](#esbuild)
  - [21.2 Production Build](#212-production-build)
    - [Building for Production](#building-for-production)
    - [Environment Variables](#environment-variables)
    - [.env Files](#env-files)
    - [Build Optimization](#build-optimization)
    - [Source Maps](#source-maps)
    - [Asset Optimization](#asset-optimization)
  - [21.3 Deployment Platforms](#213-deployment-platforms)
    - [Vercel](#vercel)
    - [Netlify](#netlify)
    - [AWS S3 + CloudFront](#aws-s3--cloudfront)
    - [Firebase Hosting](#firebase-hosting)
    - [GitHub Pages](#github-pages)
    - [Heroku](#heroku)
    - [DigitalOcean](#digitalocean)
  - [21.4 CI/CD](#214-cicd)
    - [Continuous Integration](#continuous-integration)
    - [Continuous Deployment](#continuous-deployment)
    - [GitHub Actions](#github-actions)
    - [GitLab CI](#gitlab-ci)
    - [CircleCI](#circleci)
    - [Jenkins](#jenkins)
  - [21.5 Monitoring and Analytics](#215-monitoring-and-analytics)
    - [Error Tracking (Sentry)](#error-tracking-sentry)
    - [Performance Monitoring](#performance-monitoring)
    - [Google Analytics](#google-analytics)
    - [Application Insights](#application-insights)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices (Global)](#best-practices-global)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 21.1 Build Tools

### Create React App (CRA)

**Beginner Level**

Create React App wraps **Webpack**, **Babel**, and **ESLint** behind **`react-scripts`**. You run **`npm start`** for dev and **`npm run build`** for a production folder **`build/`**. It is ideal when you want **zero config** to learn React or ship a small **todo** or **weather** demo.

**Real-time example**: A **shopping catalog** prototype uses CRA so the team focuses on product cards and cart state, not bundler tuning.

**Intermediate Level**

CRA is **opinionated**: ejecting (`npm run eject`) exposes Webpack but loses easy upgrades. Environment variables use **`REACT_APP_*`** prefix. Code splitting uses **`React.lazy`** and dynamic **`import()`** out of the box.

**Expert Level**

For long-lived products, teams often **migrate off CRA** to Vite or a custom Webpack setup for faster cold starts and finer control. CRA maintenance mode means **new greenfield projects** usually start with **Vite** or **Next.js**.

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  }
}
```

#### Key Points — CRA

- Zero-config DX; limited escape hatches without eject.
- **`REACT_APP_`** prefix for client-side env vars.
- Prefer migration paths (CRACO, react-app-rewired, or Vite) instead of eject when possible.

---

### Vite

**Beginner Level**

Vite uses **esbuild** for dependency pre-bundling and **native ESM** in dev for **instant** server start. **`npm run dev`** is snappy for a **social feed** or **dashboard** with hundreds of modules.

**Real-time example**: A **chat** UI hot-reloads in milliseconds while WebSocket messages stream in.

**Intermediate Level**

Production builds use **Rollup** under the hood. **`import.meta.env`** exposes **`VITE_*`** variables. **`vite.config.ts`** supports plugins (`@vitejs/plugin-react-swc`), path aliases, and proxy for APIs.

**Expert Level**

SSR frameworks (e.g. **Vike**, custom SSR) can sit on Vite. **Library mode** emits ESM/CJS bundles for component libraries shared across apps.

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { "/api": "http://localhost:4000" } },
  build: { sourcemap: true, rollupOptions: { output: { manualChunks: { vendor: ["react", "react-dom"] } } } },
});
```

```tsx
// Access build-time flags (must be static for replacement)
const apiBase = import.meta.env.VITE_API_BASE_URL as string;
```

#### Key Points — Vite

- **`VITE_`** prefix for exposed env vars; never put secrets in client bundles.
- Use **`manualChunks`** for predictable code splitting (e.g. vendor vs routes).
- SWC plugin option speeds TS/JSX transform in large repos.

---

### Webpack Configuration

**Beginner Level**

Webpack **graphs** your dependencies and emits bundles. **`entry`**, **`output`**, **`module.rules`** (loaders), and **`plugins`** are the mental model. A **checkout** flow might split **`payment`** chunk from **`catalog`**.

**Intermediate Level**

**`mode: 'production'`** enables minification and tree shaking. **`splitChunks`** separates vendor code. **`resolve.alias`** shortens imports. **`devtool: 'source-map'`** aids debugging.

**Expert Level**

**Module Federation** shares remote bundles between micro-frontends (e.g. **e-commerce** shell + **recommendations** widget). **Cache** layers and **persistent** build caches speed CI.

```typescript
// webpack.config.ts (conceptual excerpt)
import path from "path";
import type { Configuration } from "webpack";

const config: Configuration = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: "./src/main.tsx",
  output: { path: path.resolve(__dirname, "dist"), filename: "[name].[contenthash].js", clean: true },
  module: {
    rules: [
      { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
    ],
  },
  resolve: { extensions: [".tsx", ".ts", ".js"], alias: { "@": path.resolve(__dirname, "src") } },
  optimization: { splitChunks: { chunks: "all" } },
};

export default config;
```

#### Key Points — Webpack

- Loaders transform; plugins hook lifecycle.
- Content hashes in filenames enable long-term caching on CDNs.
- Complexity grows quickly—document aliases and chunk strategy for the team.

---

### Rollup

**Beginner Level**

Rollup excels at **library** builds with **tree-shaking** and **ESM-first** output. If you publish a **design system** for **dashboard** apps, Rollup often backs the package.

**Intermediate Level**

**`rollup.config.mjs`** defines **`input`**, **`output`** (array for CJS + ESM), and plugins (`@rollup/plugin-typescript`, **`rollup-plugin-postcss`**). **`external`** marks **`react`** as peer-provided.

**Expert Level**

Multi-entry builds (icons, hooks-only entry) reduce consumer bundle size. **Visualizers** (`rollup-plugin-visualizer`) find heavy dependencies in **e-commerce** SDKs.

```typescript
// rollup.config.mjs (excerpt)
import typescript from "@rollup/plugin-typescript";

/** @type {import('rollup').RollupOptions} */
export default {
  input: "src/index.ts",
  output: [
    { file: "dist/index.cjs", format: "cjs", sourcemap: true },
    { file: "dist/index.mjs", format: "es", sourcemap: true },
  ],
  external: ["react", "react-dom"],
  plugins: [typescript({ tsconfig: "./tsconfig.json" })],
};
```

#### Key Points — Rollup

- Prefer for **libraries**; pair with Vite/Webpack for **apps** as needed.
- Declare **`external`** correctly or you bundle duplicate React copies.
- Source maps for libraries help consumers debug through your package.

---

### Parcel

**Beginner Level**

Parcel is **zero-config** like CRA but uses **filesystem** conventions and **parallel** workers. Good for **static sites** and small **marketing** pages pointing at a **weather** API.

**Intermediate Level**

**`.parcelrc`** customizes pipelines. Built-in **image** optimization and **HTML** as entry. TypeScript works without separate tsconfig in simple setups.

**Expert Level**

For monorepos, ensure **scope** and **hoisting** align with Parcel’s resolver; otherwise prefer Vite/Webpack with explicit aliases.

```json
{
  "source": "src/index.html",
  "scripts": {
    "start": "parcel",
    "build": "parcel build"
  }
}
```

#### Key Points — Parcel

- Fast onboarding; less ecosystem depth than Webpack for exotic loaders.
- Great for prototypes and static bundles with minimal config.

---

### esbuild

**Beginner Level**

esbuild is an **extremely fast** bundler/minifier written in Go. Tools like **Vite** use it internally. You rarely hand-roll esbuild for full **SPA** apps unless scripting **internal** CLIs.

**Real-time example**: A **CI** step bundles a **widget** script for third-party **e-commerce** embeds in seconds.

**Intermediate Level**

**`esbuild.build`** API: **`entryPoints`**, **`bundle`**, **`platform: 'browser'`**, **`define`** for env substitution. **No** type checking—run **`tsc --noEmit`** separately.

**Expert Level**

**Plugins** extend behavior; **esbuild** + **SSR** usually still needs Node polyfills care. Use for **libraries**, **scripts**, and **edge** bundles where speed matters.

```typescript
import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/embed.tsx"],
  bundle: true,
  outfile: "dist/embed.js",
  minify: true,
  sourcemap: true,
  define: { "process.env.NODE_ENV": '"production"' },
  loader: { ".png": "file" },
});
```

#### Key Points — esbuild

- Blazing fast; not a full replacement for Webpack feature surface alone.
- Always pair with **`tsc`** or **`vite build`**-style type checking when types matter.

---

## 21.2 Production Build

### Building for Production

**Beginner Level**

A production build **minifies** JS, **hashes** filenames, and **strips** dev-only code (`process.env.NODE_ENV === 'production'`). You upload **`dist/`** or **`build/`** to hosting. A **todo** app’s bundle should be small enough for mobile networks.

**Intermediate Level**

**Tree shaking** removes unused exports if packages are ESM-friendly. **Dead code elimination** relies on **pure** modules and side-effect flags in **`package.json`**.

**Expert Level**

**SSR/SSG** (Next.js, Remix) shifts some work to the server; **static export** (`output: 'export'`) still produces assets for CDN. Measure **TTI** and **LCP** after build, not just bundle size.

```bash
# Typical Vite production pipeline
npm run build
npm run preview # smoke-test locally
```

#### Key Points — Production Build

- Always **`NODE_ENV=production`** for optimizations.
- Smoke-test **`preview`** or staging before promoting.
- Compare gzip/brotli sizes, not raw JS alone.

---

### Environment Variables

**Beginner Level**

Client bundles **cannot hide secrets**: anything embedded in JS is visible. Use env vars for **public** config: API base URL, feature flags, analytics IDs. A **weather** app might read **`VITE_WEATHER_API_URL`**.

**Intermediate Level**

**Vite**: **`import.meta.env.VITE_*`**. **CRA**: **`process.env.REACT_APP_*`**. **Next.js**: **`NEXT_PUBLIC_*`**. Type them with **declaration merging** or a **`Env`** type map.

**Expert Level**

**Runtime config**: inject **`window.__ENV__`** from server HTML for **per-environment** URLs without rebuild—critical for **Docker** + **Kubernetes** **e-commerce** deployments.

```typescript
// env.d.ts — Vite
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
  readonly VITE_FEATURE_CHAT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

```tsx
const apiBase: string = import.meta.env.VITE_API_BASE;
```

#### Key Points — Environment Variables

- Never put **API keys** for paid services in client env vars without a backend proxy.
- Keep a **single source of truth** for env schema (`zod` validation at startup in dev).

---

### .env Files

**Beginner Level**

**`.env`**, **`.env.local`**, **`.env.production`** hold key=value pairs. **`.local`** files are gitignored for machine-specific overrides. **Social** app devs use **`.env.development`** for mock APIs.

**Intermediate Level**

**Priority**: often production > local > default. **CI** injects secrets via **platform UI**, not committed files. Document required keys in **`.env.example`**.

**Expert Level**

**Monorepos**: use **tool-specific** root vs package `.env` loading (Turborepo, Nx). **Secrets scanning** (GitHub secret scanning) blocks accidental commits.

```bash
# .env.example (committed)
VITE_API_BASE=https://api.example.com
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Key Points — .env Files

- Commit **`.env.example`**, not **`.env.local`** with secrets.
- Align naming with bundler (`VITE_`, `REACT_APP_`, etc.).
- Rotate keys if leaked; env files are not encryption.

---

### Build Optimization

**Beginner Level**

Enable **minification**, **compress images**, and **lazy-load routes**. An **e-commerce** site defers **admin** routes so shoppers load faster.

**Intermediate Level**

**`manualChunks`**, **dynamic `import()`**, **suspense** boundaries. **Analyze** bundles with **rollup-plugin-visualizer** or **webpack-bundle-analyzer**.

**Expert Level**

**Preload/prefetch** critical chunks. **HTTP/2** multiplexing reduces cost of splitting. **Brotli** at CDN. **Service workers** for offline **catalog** (careful with cache invalidation).

```tsx
import { lazy, Suspense } from "react";

const Admin = lazy(() => import("./routes/AdminDashboard"));

export function App() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <Admin />
    </Suspense>
  );
}
```

#### Key Points — Build Optimization

- Measure before optimizing; avoid premature micro-splits.
- Watch **third-party** SDKs (analytics, maps)—often largest slice.

---

### Source Maps

**Beginner Level**

Source maps map **minified** code back to **TSX** lines. Enable in **staging**; often **hidden** or **disabled** in public prod for IP reasons.

**Intermediate Level**

**`hidden-source-map`** generates maps without referencing them in the bundle—upload to **Sentry** only.

**Expert Level**

**Source map uploads** in CI with **release** and **dist** paths; correlate **errors** to original files. **Don't** expose full maps to browsers if proprietary logic is sensitive.

```typescript
// vite.config.ts excerpt
export default defineConfig({
  build: { sourcemap: "hidden" },
});
```

#### Key Points — Source Maps

- Essential for actionable **Sentry** stack traces.
- Balance **debuggability** vs **exposing** source structure.

---

### Asset Optimization

**Beginner Level**

Use **responsive images** (`srcset`), **SVG** for icons, **WebP/AVIF** where supported. A **dashboard** with big charts still benefits from slim PNGs.

**Intermediate Level**

**Image CDN** transforms (`?w=400&format=webp`). **Font subsetting** and **`font-display: swap`**. **CSS** purging with **Tailwind** content paths.

**Expert Level**

**Critical CSS** inlining for above-the-fold **landing** pages. **Lazy** decode images with **`loading="lazy"`** and **`decoding="async"`**. **Video**: adaptive streaming, not giant MP4 in bundle.

```tsx
type HeroProps = { alt: string; avifSrc: string; webpSrc: string; fallbackSrc: string };

export function HeroImage({ alt, avifSrc, webpSrc, fallbackSrc }: HeroProps) {
  return (
    <picture>
      <source type="image/avif" srcSet={avifSrc} />
      <source type="image/webp" srcSet={webpSrc} />
      <img src={fallbackSrc} alt={alt} width={1200} height={630} loading="lazy" decoding="async" />
    </picture>
  );
}
```

#### Key Points — Asset Optimization

- Always set **dimensions** to reduce CLS.
- Keep **videos** and **large binaries** out of JS bundles.

---

## 21.3 Deployment Platforms

### Vercel

**Beginner Level**

Connect a Git repo; Vercel builds on push and hosts **static** + **serverless** functions. Ideal for **Next.js** and **Vite SPAs** with **`vercel.json`** rewrites.

**Real-time example**: A **social** app’s **`/api/*`** proxies to a database via **serverless** routes.

**Intermediate Level**

**Preview deployments** per PR. **Edge** config, **ISR**, **environment** scopes (Preview vs Production).

**Expert Level**

**Regional** latency tuning; **middleware** at edge for A/B and auth gating. **Monorepo** support with **project** roots.

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

#### Key Points — Vercel

- Excellent DX for **frontend-first** teams.
- Understand **function** cold starts and **data** locality.

---

### Netlify

**Beginner Level**

Similar to Vercel: Git-driven deploys, **Forms**, **Functions**, **split testing**. **`_redirects`** or **`netlify.toml`** for SPA fallback.

**Intermediate Level**

**Build plugins** for Lighthouse CI, a11y checks. **Identity** for simple auth prototypes.

**Expert Level**

**Edge handlers** and **background functions** for longer work—still mind **timeouts** vs long **checkout** jobs (often better on a worker/queue).

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Key Points — Netlify

- **`publish`**: `dist` vs `build`—set correctly for your tool.
- Great for **JAMstack** marketing sites + **React** SPAs.

---

### AWS S3 + CloudFront

**Beginner Level**

Upload **`dist/`** to **S3** static website or **S3 + CloudFront** CDN. **Cheap** and **durable** for **global** **e-commerce** static assets.

**Intermediate Level**

**OAC** (origin access control) so S3 isn’t public directly. **Invalidations** on deploy for **`index.html`**. **WAF** for bot protection.

**Expert Level**

**Multi-region** failover, **Lambda@Edge** for auth headers, **signed URLs** for private assets. **Terraform** modules standardize buckets and distributions.

```bash
aws s3 sync dist/ s3://my-app-bucket --delete
aws cloudfront create-invalidation --distribution-id E123 --paths "/index.html" "/*"
```

#### Key Points — S3 + CloudFront

- Cache **`*.js`/`*.css`** aggressively; **short-cache** **`index.html`**.
- Automate invalidations in CI to avoid stale SPAs.

---

### Firebase Hosting

**Beginner Level**

**`firebase deploy`** ships **`dist`** with **CDN**, easy **rollbacks**, and integrates **Cloud Functions** for APIs.

**Real-time example**: A **chat** app uses **Firestore** + **Hosting** for static shell.

**Intermediate Level**

**Preview channels** per PR. **`firebase.json`** headers for caching and **`rewrites`** to Cloud Functions or Cloud Run.

**Expert Level**

**App Check** + **security rules** for **Firestore**; **SSR** with **Firebase** + **Cloud Functions** (latency tradeoffs).

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

#### Key Points — Firebase Hosting

- Tight integration with **Google** mobile/web SDKs.
- Watch **billing** on **Functions** + **Firestore** reads.

---

### GitHub Pages

**Beginner Level**

Free static hosting from a repo branch or **`gh-pages`** folder. Set **`homepage`** in **`package.json`** for CRA subpath deploys.

**Intermediate Level**

**GitHub Actions** build and push **`gh-pages`**. **`base`** in Vite must match repo name path.

**Expert Level**

**Custom domains** + **HTTPS** via GitHub; **no** serverless—pure static. Fine for **docs** and **portfolio** **dashboard** demos.

```typescript
// vite.config.ts for GitHub project pages
export default defineConfig({
  base: "/my-repo/",
});
```

#### Key Points — GitHub Pages

- Mind **`base` URL** for assets and router **`basename`**.
- Not for **private** backend APIs without external services.

---

### Heroku

**Beginner Level**

**Git push** deploys a **dyno** running **`npm start`** or a **static buildpack** + **Node** server for SPA. Good for **full-stack** prototypes (**Express** + React).

**Intermediate Level**

**`Procfile`** defines processes. **Config vars** for env. **Pipelines** for staging → prod.

**Expert Level**

**Cost** at scale vs **Kubernetes**; **sleeping** free dynos are gone—use **Render/Fly** alternatives if comparing. For **pure static**, S3/Netlify/Vercel often cheaper.

```procfile
web: npm run start:prod
```

#### Key Points — Heroku

- Ensure **Node** **build** runs in **`heroku-postbuild`** if needed.
- Static sites often simpler elsewhere unless you need **dyno** features.

---

### DigitalOcean

**Beginner Level**

**App Platform** connects Git and builds Docker-like images, or **Droplets** for raw VMs. Host **SPA** behind **Nginx** with **Let’s Encrypt**.

**Intermediate Level**

**Spaces** (S3-like) + **CDN** for assets. **Kubernetes** (DOKS) for larger **microfrontend** estates.

**Expert Level**

**Load balancers**, **VPC** peering to **managed DBs**. **Terraform** provider for infra parity with **AWS** patterns.

```nginx
location / {
  try_files $uri /index.html;
}
```

#### Key Points — DigitalOcean

- Predictable pricing vs hyperscalers for small teams.
- You own more **ops** on Droplets—use **App Platform** for less toil.

---

## 21.4 CI/CD

### Continuous Integration

**Beginner Level**

CI runs **on every push/PR**: **`npm ci`**, **`npm test`**, **`npm run build`**, **lint**. Catches broken **TypeScript** before merge. A **todo** app PR fails if **`tsc`** errors.

**Intermediate Level**

**Matrix** builds across Node versions. **Cache** **`node_modules`** or **pnpm store**. **Artifact** uploads (`dist`) for later deploy jobs.

**Expert Level**

**Merge queues**, **required checks**, **code owners**. **SonarQube** or **Codacy** for quality gates on **e-commerce** repos.

```yaml
# .github/workflows/ci.yml (excerpt)
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "npm" }
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --watch=false
      - run: npm run build
```

#### Key Points — CI

- Fast feedback loops—keep CI under ~10 minutes when possible.
- Same **Node** version as production.

---

### Continuous Deployment

**Beginner Level**

CD deploys **automatically** after CI passes on **`main`**. **Staging** first, then **production** with approval gates.

**Intermediate Level**

**Blue/green** or **canary** releases. **Feature flags** decouple deploy from **release**. **Database migrations** coordinated with app rollout.

**Expert Level**

**Progressive delivery** (Argo Rollouts, Flagger). **SLO-based** rollback on error rate spikes in **chat** services.

#### Key Points — CD

- **Automate** repetitive deploys; **human** approve risky changes.
- **Monitor** post-deploy with **Sentry** + **analytics**.

---

### GitHub Actions

**Beginner Level**

YAML workflows in **`.github/workflows/`**. **Triggers**: `push`, `pull_request`, `workflow_dispatch`. **Marketplace** actions for setup-node, deploy steps.

**Intermediate Level**

**Secrets** (`GITHUB_TOKEN`, repo secrets). **Environments** with **protection rules**. **Reusable workflows** across repos.

**Expert Level**

**OIDC** to AWS/GCP without long-lived cloud keys. **Matrix** + **shard** tests for large **dashboard** codebases.

#### Key Points — GitHub Actions

- Pin actions to **SHA** for supply-chain safety.
- Use **concurrency** groups to cancel superseded deploys.

---

### GitLab CI

**Beginner Level**

**`.gitlab-ci.yml`** defines **stages**: `build`, `test`, `deploy`. **Runners** execute jobs (shared or self-hosted).

**Intermediate Level**

**Caches**, **artifacts**, **only/except** rules (replaced by **`rules:`**). **Review apps** per branch.

**Expert Level**

**Parent-child pipelines**, **multi-project** pipelines for **microservices** + **SPA**.

```yaml
stages: [install, test, build, deploy]
test:
  stage: test
  script:
    - npm ci
    - npm test
```

#### Key Points — GitLab CI

- Self-hosted runners for **air-gapped** or **GPU** needs.
- Integrated **container registry** simplifies Docker flows.

---

### CircleCI

**Beginner Level**

**`.circleci/config.yml`** with **orbs** (`node`, `docker`). Parallelism for **Jest** split across containers.

**Intermediate Level**

**Workflows** with **approval** jobs. **Contexts** for org-wide env vars.

**Expert Level**

**Docker layer caching**, **resource_class** tuning for **large** **TypeScript** projects.

#### Key Points — CircleCI

- Strong for **teams** already invested; compare cost vs GHA.
- **Orbs** reduce YAML duplication.

---

### Jenkins

**Beginner Level**

Self-hosted **Jenkins** with **pipelines** (`Jenkinsfile` declarative). Plugins for Git, npm, Slack. Common in **regulated** enterprises.

**Intermediate Level**

**Agents** on K8s or VMs. **Shared libraries** for reusable pipeline steps.

**Expert Level**

**High availability** controllers, **backup** job configs. **Security** hardening (CSRF, RBAC) critical—Jenkins is a **high-value** target.

```groovy
pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        sh 'npm ci && npm run build'
      }
    }
  }
}
```

#### Key Points — Jenkins

- Maximum **flexibility**, higher **ops** burden.
- Keep plugins **updated**; isolate agents.

---

## 21.5 Monitoring and Analytics

### Error Tracking (Sentry)

**Beginner Level**

**Sentry** captures **exceptions** and **Promise rejections** in the browser with **stack traces** and **breadcrumbs**. Integrate **`@sentry/react`** in **`main.tsx`**.

**Real-time example**: **Checkout** failures on **`POST /orders`** show which **browser** + **release** broke.

**Intermediate Level**

**Error boundaries** report React render errors. **User context** (`setUser`) for support tickets. **Source maps** uploaded in CI.

**Expert Level**

**Performance** transactions, **profiling**, **replay** (session replay) with **PII** scrubbing. **Sampling** to control cost.

```tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 0.2,
  environment: import.meta.env.MODE,
});

export const AppRoot = Sentry.withErrorBoundary(App, { fallback: <ErrorFallback /> });
```

#### Key Points — Sentry

- Tag releases with **git SHA** for correlation.
- Don’t log **passwords** or **PAN** in breadcrumbs.

---

### Performance Monitoring

**Beginner Level**

Track **Web Vitals**: **LCP**, **FID/INP**, **CLS**. **Browser** **`PerformanceObserver`** or **Sentry**/**Vercel Analytics**/**web-vitals** library.

**Intermediate Level**

**Long tasks** and **TTI** proxies via **Lighthouse CI** in PRs. **Server timing** headers from APIs.

**Expert Level**

**Distributed tracing** across **SPA** + **BFF** + **services** (OpenTelemetry). **RUM** dashboards segment by **country**, **device**, **e-commerce** campaign.

```typescript
import { onCLS, onINP, onLCP } from "web-vitals";

function sendToAnalytics(metric: { name: string; value: number; id: string }) {
  void fetch("/api/metrics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metric),
  });
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
```

#### Key Points — Performance Monitoring

- Measure **real users**, not only lab Lighthouse.
- Correlate deploys with **vitals** regressions.

---

### Google Analytics

**Beginner Level**

**GA4** tracks **events**: `page_view`, `purchase`, `add_to_cart`. Install **gtag.js** or **GTM** snippet. **E-commerce** funnels show **drop-off** at **shipping** step.

**Intermediate Level**

**Enhanced measurement** + **custom** events via **`dataLayer`**. **Consent** mode for GDPR.

**Expert Level**

**BigQuery** export for **SQL** analysis. **Ads** + **GA** linking for attribution—watch **privacy** policies.

```tsx
type GaEvent = { eventName: string; params?: Record<string, string | number | boolean> };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent({ eventName, params }: GaEvent) {
  window.gtag?.("event", eventName, params);
}
```

#### Key Points — Google Analytics

- **PII** must not be sent as custom dimensions accidentally.
- Validate **events** in **DebugView** before relying on dashboards.

---

### Application Insights

**Beginner Level**

Azure **Application Insights** instruments **browser** + **Node** with **requests**, **dependencies**, **exceptions**. Good when your **enterprise** stack is **Azure**.

**Intermediate Level**

**KQL** queries for **failures** and **performance** blades. **Availability tests** ping endpoints.

**Expert Level**

**OpenTelemetry** bridge, **sampling** profiles, **integration** with **Log Analytics** workspaces for **dashboard** **SLA** reporting.

```typescript
import { ApplicationInsights } from "@microsoft/applicationinsights-web";

const appInsights = new ApplicationInsights({
  config: {
    connectionString: import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING,
    enableAutoRouteTracking: true,
  },
});
appInsights.loadAppInsights();
```

#### Key Points — Application Insights

- Align **release** annotations with deploys.
- Map **cloud roles** for microservice graphs.

---

## Key Points (Chapter Summary)

- **Choose** Vite or a framework (Next.js) for new apps; CRA is legacy for greenfield.
- **Never** treat client env vars as secrets; use **server** proxies for keys.
- **CDN** + **cache headers** + **hashed assets** = fast global SPAs.
- **CI** verifies **types**, **tests**, **build**; **CD** ships **predictably** with **monitoring**.
- **Sentry** + **RUM** + **analytics** close the loop from **errors** to **business** metrics.

---

## Best Practices (Global)

1. **One** **Node** version** via **`.nvmrc`** + **CI** matrix alignment.
2. **Preview** deployments for every PR with **E2E smoke** tests.
3. **Upload** source maps to **Sentry** in CI; keep them off public browsers if needed.
4. **Tag** releases (`git tag`, **`sentry-cli releases`**) for **rollback** clarity.
5. **Infrastructure as code** for **S3/CloudFront** or **Terraform** modules when beyond PaaS.
6. **Document** **env** variables in **`.env.example`** and **runbooks** for on-call.
7. **Automate** **dependency** updates (**Renovate**) with **CI** gates.

---

## Common Mistakes to Avoid

| Mistake | Why it hurts | Better approach |
|--------|----------------|-----------------|
| Putting **API secrets** in `VITE_*` | Exposed in bundle | Proxy via backend; use **server env** only |
| **No** **`index.html`** **fallback** on SPA hosts | 404 on refresh | Configure rewrites (Vercel, Netlify, S3+CF) |
| **Caching** **`index.html`** **for days** | Users stuck on old JS | Short TTL + **invalidation** on deploy |
| **Skipping** **`tsc`** in CI | Types drift | `tsc --noEmit` + ESLint type-aware rules |
| **Huge** **images** in repo | LCP suffers | CDN transforms, modern formats |
| **Disabling** source maps **everywhere** | Blind debugging | Hidden maps + Sentry upload |
| **Manual** deploys only | Human error | CD pipeline with approvals |
| **Ignoring** **CORS** in prod | APIs break after move | Test staging **URLs** early |

---

*End of Build and Deployment chapter.*
