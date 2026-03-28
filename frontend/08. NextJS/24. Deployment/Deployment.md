# Deploying Next.js Applications

From Vercel’s zero-config flow to Docker, static exports, multi-cloud footprints, CDN edge caching, CI/CD, and production observability—this guide ties deployment choices to real products: e-commerce storefronts, blogs, SaaS dashboards, and social platforms.

## 📑 Table of Contents

- [24.1 Vercel Deployment](#241-vercel-deployment)
  - [Platform Overview](#platform-overview)
  - [Git Integration](#git-integration)
  - [Automatic Deployments](#automatic-deployments)
  - [Preview Deployments](#preview-deployments)
  - [Production Deployments](#production-deployments)
  - [Environment Variables](#environment-variables)
  - [Custom Domains](#custom-domains)
- [24.2 Build Configuration](#242-build-configuration)
  - [next build](#next-build)
  - [Build Output](#build-output)
  - [Standalone Output](#standalone-output)
  - [Static Export](#static-export)
  - [File Tracing](#file-tracing)
- [24.3 Self-hosting](#243-self-hosting)
  - [Node.js Server](#nodejs-server)
  - [Docker](#docker)
  - [Dockerfile](#dockerfile)
  - [Docker Compose](#docker-compose)
  - [Kubernetes](#kubernetes)
- [24.4 Static Exports](#244-static-exports)
  - [output export](#output-export)
  - [Static HTML](#static-html)
  - [Limitations](#limitations)
  - [Static Hosts](#static-hosts)
- [24.5 Cloud Platforms](#245-cloud-platforms)
  - [AWS EC2, ECS, and Lambda](#aws-ec2-ecs-and-lambda)
  - [Google Cloud Platform](#google-cloud-platform)
  - [Microsoft Azure](#microsoft-azure)
  - [DigitalOcean](#digitalocean)
  - [Railway](#railway)
  - [Render](#render)
- [24.6 CDN and Edge](#246-cdn-and-edge)
  - [Vercel Edge Network](#vercel-edge-network)
  - [Cloudflare Pages](#cloudflare-pages)
  - [Amazon CloudFront](#amazon-cloudfront)
  - [Edge Caching Strategies](#edge-caching-strategies)
- [24.7 CI/CD](#247-cicd)
  - [GitHub Actions](#github-actions)
  - [GitLab CI](#gitlab-ci)
  - [CircleCI](#circleci)
  - [Automated Testing in Pipelines](#automated-testing-in-pipelines)
  - [Build Optimization in CI](#build-optimization-in-ci)
- [24.8 Monitoring and Analytics](#248-monitoring-and-analytics)
  - [Sentry Error Tracking](#sentry-error-tracking)
  - [Performance Monitoring](#performance-monitoring)
  - [Application Logs](#application-logs)
  - [Real-time Dashboards](#real-time-dashboards)
- [Key Points (Chapter Summary)](#key-points-chapter-summary)
- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 24.1 Vercel Deployment

### Platform Overview

**Beginner Level:** Vercel hosts Next.js with automatic builds: push to GitHub, get a live URL for your blog.

**Intermediate Level:** Edge network, serverless functions, ISR, and analytics integrate tightly with Next.js releases.

**Expert Level:** Evaluate data residency, WAF, DDoS protection, and support SLAs for enterprise SaaS; multi-region failover strategies may combine Vercel with external origin health checks.

**Key Points — Platform Overview**

- Optimized defaults for Next.js teams.
- Vendor evaluation includes egress pricing and log retention.

---

### Git Integration

**Beginner Level:** Connect the Git repo in the Vercel dashboard; each branch can build.

**Intermediate Level:** Monorepo support via `rootDirectory` and Turborepo remote cache integration.

**Expert Level:** Protected branches, required status checks, and deployment protection for production.

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "staging": true
    }
  }
}
```

**Key Points — Git Integration**

- Treat `main` as production; use PR previews for QA.
- Lock down who can promote to production.

---

### Automatic Deployments

**Beginner Level:** Every push triggers `npm run build` (or pnpm/yarn) on Vercel builders.

**Intermediate Level:** Build command and output directory configurable; environment-specific variables.

**Expert Level:** Skip unnecessary builds with “ignored build step” scripts comparing changed paths in monorepos.

**Key Points — Automatic Deployments**

- Fast feedback loops for teams.
- Watch build minute budgets on free tiers.

---

### Preview Deployments

**Beginner Level:** Each PR gets `*.vercel.app` URL to share with stakeholders on an e-commerce redesign.

**Intermediate Level:** Comments bot posts links in GitHub; environment variables scoped to preview.

**Expert Level:** Ephemeral databases or seeded fixtures for preview-only E2E; protect previews with SSO for internal SaaS clones.

**Key Points — Preview Deployments**

- Human QA before merge.
- Do not point production webhooks at preview URLs.

---

### Production Deployments

**Beginner Level:** Merging to `main` updates the live marketing site.

**Intermediate Level:** Promote via Git tags or Vercel CLI for controlled releases.

**Expert Level:** Blue/green at CDN layer, instant rollback to previous deployment artifact on regression.

**Key Points — Production Deployments**

- Keep migrations backward compatible for zero-downtime deploys.
- Announce maintenance for destructive schema changes.

---

### Environment Variables

**Beginner Level:** `DATABASE_URL` set in dashboard for production only.

**Intermediate Level:** `NEXT_PUBLIC_*` exposed to browser; secrets server-only.

**Expert Level:** Sync from Vault with OIDC; rotate keys without redeploying code when platform supports it.

```typescript
function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const stripeSecretKey = () => requireEnv("STRIPE_SECRET_KEY");
```

**Key Points — Environment Variables**

- Never commit `.env.local` to Git.
- Validate required env at startup in self-hosted images.

---

### Custom Domains

**Beginner Level:** Point `www.shop.com` CNAME to Vercel.

**Intermediate Level:** Apex domain ALIAS/ANAME at DNS provider; automatic HTTPS certificates.

**Expert Level:** Multi-domain i18n (`fr.brand.com`) with middleware locale detection; wildcard certs for tenant subdomains in B2B SaaS.

**Key Points — Custom Domains**

- Verify DNS TTL before cutover.
- HSTS preload for high-security apps.

---

## 24.2 Build Configuration

### next build

**Beginner Level:** Locally run `next build` then `next start` to mimic production.

**Intermediate Level:** CI runs `next build` with `NODE_ENV=production`; fails on type errors when `ignoreBuildErrors` is false.

**Expert Level:** Split analytics for build phases (compile vs static generation) to catch slow `getStaticPaths`.

**Key Points — next build**

- Production build catches issues dev server masks.
- Keep TypeScript strict in CI.

---

### Build Output

**Beginner Level:** `.next` folder contains server and client artifacts.

**Intermediate Level:** `standalone` folder when enabled for Docker copies minimal server files.

**Expert Level:** Trace why certain files included with `.next/trace`.

**Key Points — Build Output**

- Cache `.next/cache` in CI for faster rebuilds when supported.
- Do not deploy dev `node_modules` patterns blindly.

---

### Standalone Output

**Beginner Level:** `output: 'standalone'` packages a minimal server for containers.

**Intermediate Level:** Copy `public` and `.next/static` into image manually per docs.

**Expert Level:** Multi-stage Docker builds: deps → build → runtime slim image.

```dockerfile
# Dockerfile excerpt (conceptual)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

**Key Points — Standalone**

- Smaller attack surface vs full repo in container.
- Follow official Next.js Docker example for exact paths.

---

### Static Export

**Beginner Level:** `output: 'export'` generates `out/` HTML/CSS/JS for static hosts.

**Intermediate Level:** No SSR/ISR/API routes unless adapted; great for docs sites.

**Expert Level:** Combine with client-only data fetching from public APIs for pseudo-dynamic dashboards—mind SEO and auth.

**Key Points — Static Export**

- Simplest hosting model; constrained features.
- Validate no dynamic server APIs are required.

---

### File Tracing

**Beginner Level:** Next traces which files a route needs for serverless bundles.

**Intermediate Level:** `outputFileTracingIncludes` adds native binaries or Prisma engines.

**Expert Level:** Debug missing files in serverless with tracing logs and explicit includes.

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/*": ["./node_modules/.prisma/client/**/*"],
    },
  },
};

export default nextConfig;
```

**Key Points — File Tracing**

- Essential for ORM and sharp binaries in lambdas.
- Keep includes minimal to reduce cold start size.

---

## 24.3 Self-hosting

### Node.js Server

**Beginner Level:** Run `next start` on a VM after `next build`.

**Intermediate Level:** Process manager (`pm2`, `systemd`) for restarts; reverse proxy nginx for TLS termination.

**Expert Level:** Horizontal scaling behind load balancer; sticky sessions only if required; health checks on `/api/health`.

**Key Points — Node.js Server**

- You own patching, scaling, and log shipping.
- Use standalone output for reproducible deploys.

---

### Docker

**Beginner Level:** Container packages Node + app for consistent dev/prod parity.

**Intermediate Level:** Multi-stage builds shrink final image.

**Expert Level:** Scan images (Trivy); non-root user; read-only root filesystem where possible.

**Key Points — Docker**

- Great for on-prem SaaS appliances.
- Layer caching speeds CI when lockfile stable.

---

### Dockerfile

**Beginner Level:** `FROM node:20`, copy files, `npm run build`.

**Intermediate Level:** `npm ci` not `npm install` in CI images.

**Expert Level:** Distroless or alpine variants; pin digests for supply chain.

**Key Points — Dockerfile**

- Keep secrets out of layers—use runtime env.
- `.dockerignore` excludes `.git` and `node_modules`.

---

### Docker Compose

**Beginner Level:** Compose app + Postgres for local prod-like stacks.

**Intermediate Level:** Override env files per service; named volumes for DB.

**Expert Level:** Compose for integration tests in CI with healthcheck dependencies.

```yaml
services:
  web:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/app
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 5
```

**Key Points — Docker Compose**

- Dev convenience; not always identical to K8s prod.
- Use profiles for optional services.

---

### Kubernetes

**Beginner Level:** Deployments + Service expose pods running `next start` container.

**Intermediate Level:** HPA on CPU/RAM; ingress with cert-manager.

**Expert Level:** PodDisruptionBudgets, readiness vs liveness probes hitting lightweight routes, progressive delivery (Argo Rollouts).

**Key Points — Kubernetes**

- Strong for large orgs with platform teams.
- Operational complexity vs PaaS trade-off.

---

## 24.4 Static Exports

### output export

**Beginner Level:** Set `output: 'export'` in `next.config` and run `next build`.

**Intermediate Level:** `next/image` may need `unoptimized` or custom loader for some hosts.

**Expert Level:** Path rewrites handled at CDN for SPA-like fallbacks if applicable.

**Key Points — output export**

- Regenerate on content changes via CI.
- No server route handlers.

---

### Static HTML

**Beginner Level:** Upload `out/` to S3 + CloudFront for a marketing blog.

**Intermediate Level:** Set correct `Content-Type` and long-cache headers for hashed assets.

**Expert Level:** Invalidate only HTML files on deploy; keep assets immutable.

**Key Points — Static HTML**

- Extremely cost-effective at scale.
- Dynamic personalization moves to client or edge workers.

---

### Limitations

**Beginner Level:** No dynamic route handlers in `app/api` on pure static export.

**Intermediate Level:** ISR and SSR require a server or edge runtime.

**Expert Level:** Middleware support evolving—verify current Next.js docs for static export compatibility before architecting auth gates.

**Key Points — Limitations**

- Choose static export consciously early.
- Hybrid architectures split static marketing + API elsewhere.

---

### Static Hosts

**Beginner Level:** Netlify, GitHub Pages, Cloudflare Pages host static folders.

**Intermediate Level:** Configure `_redirects` or `headers` for security.

**Expert Level:** Edge functions on those platforms for lightweight dynamic pieces.

**Key Points — Static Hosts**

- Pair with headless CMS webhooks rebuilding on publish.
- Global CDN default improves TTFB worldwide.

---

## 24.5 Cloud Platforms

### AWS EC2, ECS, and Lambda

**Beginner Level:** EC2 VM runs Dockerized Next indefinitely—classic e-commerce backend-for-frontend.

**Intermediate Level:** ECS Fargate removes server patching burden; ALB routes traffic.

**Expert Level:** Lambda@Edge or CloudFront Functions for auth cookie checks; split static to S3, dynamic to ECS.

**Key Points — AWS**

- Rich ecosystem; higher config surface.
- Cost modeling includes data transfer.

---

### Google Cloud Platform

**Beginner Level:** Cloud Run runs containerized Next with scale-to-zero.

**Intermediate Level:** Cloud CDN in front of backend buckets + Run service.

**Expert Level:** Multi-region Run with global LB; IAM service accounts for secret access.

**Key Points — GCP**

- Cloud Run fits bursty SaaS dashboards.
- Understand cold starts vs min instances.

---

### Microsoft Azure

**Beginner Level:** App Service deploys Node containers or Git pushes.

**Intermediate Level:** Front Door CDN for global entry.

**Expert Level:** Entra ID (Azure AD) integration for enterprise SSO portals on Next.

**Key Points — Azure**

- Common in enterprises already on M365.
- Map regions to user population.

---

### DigitalOcean

**Beginner Level:** Droplet + Docker Compose for indie SaaS MVP.

**Intermediate Level:** App Platform builds from Git with less ops overhead.

**Expert Level:** Managed Postgres + connection pooling for multi-tenant blog platforms.

**Key Points — DigitalOcean**

- Straightforward pricing for small teams.
- Plan upgrades before launch traffic spikes.

---

### Railway

**Beginner Level:** Connect repo; Railway builds and deploys with minimal YAML.

**Intermediate Level:** Add Postgres plugin; inject `DATABASE_URL`.

**Expert Level:** Ephemeral preview environments per PR for full-stack social app clones.

**Key Points — Railway**

- Fast prototyping to production path.
- Monitor usage-based billing.

---

### Render

**Beginner Level:** Static site + web service split for Next hybrid.

**Intermediate Level:** Managed TLS and autoscaling tiers.

**Expert Level:** Private services for internal admin Next apps behind VPN integrations.

**Key Points — Render**

- Simple UX similar to Heroku lineage users expect.
- Check build timeouts for large monorepos.

---

## 24.6 CDN and Edge

### Vercel Edge Network

**Beginner Level:** Static assets served geographically close to users automatically.

**Intermediate Level:** Edge Middleware runs before request hits origin—great for auth redirects on a social app.

**Expert Level:** Combine with Edge Config for feature flags evaluated at edge.

**Key Points — Vercel Edge**

- Tight integration with Next features.
- Understand edge runtime API limitations vs Node.

---

### Cloudflare Pages

**Beginner Level:** Host static export with Cloudflare CDN.

**Intermediate Level:** Functions folder for lightweight APIs at edge.

**Expert Level:** Workers KV/Durable Objects for globally distributed counters—careful consistency models.

**Key Points — Cloudflare Pages**

- Strong DDoS protection defaults.
- Validate Next feature parity for your version.

---

### Amazon CloudFront

**Beginner Level:** CDN in front of S3 static marketing site.

**Intermediate Level:** Signed URLs for premium e-commerce digital downloads.

**Expert Level:** Origin shield to reduce load on origin; tiered cache behaviors per path pattern.

**Key Points — CloudFront**

- Fine-grained cache key policies.
- Invalidate strategically to control costs.

---

### Edge Caching Strategies

**Beginner Level:** Long TTL for hashed JS/CSS.

**Intermediate Level:** Short TTL for HTML on ISR-backed pages at CDN.

**Expert Level:** `stale-while-revalidate` for catalog JSON from origin shield—warm caches globally.

```typescript
export function headers() {
  return {
    "cache-control": "public, s-maxage=300, stale-while-revalidate=86400",
  };
}
```

**Key Points — Edge Caching**

- Never cache authenticated HTML at shared caches.
- Tag-based purges when platform supports them.

---

## 24.7 CI/CD

### GitHub Actions

**Beginner Level:** Workflow on `pull_request` runs lint, test, build.

**Intermediate Level:** Matrix Node versions; cache `~/.npm`.

**Expert Level:** OIDC to cloud deploy roles—no long-lived AWS keys in secrets.

```yaml
name: deploy
on:
  push:
    branches: [main]
jobs:
  prod:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test -- --ci
      - run: npm run build
```

**Key Points — GitHub Actions**

- Marketplace actions speed setup.
- Concurrency groups prevent parallel production deploys colliding.

---

### GitLab CI

**Beginner Level:** `.gitlab-ci.yml` stages: test → build → deploy.

**Intermediate Level:** Docker executor builds production image; push to registry.

**Expert Level:** Review apps per MR with dynamic environments.

**Key Points — GitLab CI**

- Self-hosted runners for compliance-heavy SaaS.
- Cache Docker layers with BuildKit.

---

### CircleCI

**Beginner Level:** Orbs for Node and Docker simplify config.

**Intermediate Level:** Parallelism splits Jest across containers.

**Expert Level:** Resource classes tuned for large Next builds; monorepo conditional workflows.

**Key Points — CircleCI**

- Good for teams already standardized on it.
- Monitor credits vs GitHub Actions economics.

---

### Automated Testing in Pipelines

**Beginner Level:** Fail build on `jest` failure.

**Intermediate Level:** Playwright against ephemeral preview URL posted by Vercel/GitHub integration.

**Expert Level:** Contract tests between Next BFF and microservices before deploy.

**Key Points — Automated Testing**

- Smoke E2E on critical paths every deploy.
- Quarantine flaky tests—do not ignore silently.

---

### Build Optimization in CI

**Beginner Level:** Cache `node_modules` and Next cache folders.

**Intermediate Level:** Turborepo remote cache shared across developers and CI.

**Expert Level:** Distributed tracing of webpack/turbopack timings to catch regressions.

**Key Points — Build Optimization**

- Shave minutes off pipelines for faster reviews.
- Pin lockfile for reproducible builds.

---

## 24.8 Monitoring and Analytics

### Sentry Error Tracking

**Beginner Level:** Capture client exceptions in production blog.

**Intermediate Level:** Source maps uploaded in CI for readable stack traces.

**Expert Level:** Performance transactions for API routes; release health gates.

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
});
```

**Key Points — Sentry**

- Scrub PII in `beforeSend`.
- Separate projects per platform (web vs edge) if needed.

---

### Performance Monitoring

**Beginner Level:** Vercel Speed Insights charts.

**Intermediate Level:** OpenTelemetry exporters on self-hosted Node.

**Expert Level:** SLO dashboards on P95 latency for checkout API combined with synthetic checks.

**Key Points — Performance Monitoring**

- Correlate deploy markers with latency spikes.
- Alert on saturation, not only errors.

---

### Application Logs

**Beginner Level:** `console.log` appears in Vercel function logs.

**Intermediate Level:** Structured JSON logs (`pino`) shipped to Datadog/CloudWatch.

**Expert Level:** Trace IDs from middleware through API handlers for support debugging multi-tenant SaaS tickets.

```typescript
import pino from "pino";

export const logger = pino({ level: process.env.LOG_LEVEL ?? "info" });

export function logRequest(event: { method: string; path: string; requestId: string }) {
  logger.info(event, "incoming_request");
}
```

**Key Points — Application Logs**

- Structured logs enable queries.
- Avoid logging secrets or full credit card PANs.

---

### Real-time Dashboards

**Beginner Level:** Grafana charts from Prometheus metrics exporter sidecar.

**Intermediate Level:** WebSocket-based admin dashboard for live order throughput in e-commerce ops center.

**Expert Level:** Backpressure monitoring on event streams (Kafka) feeding Next analytics APIs.

**Key Points — Real-time Dashboards**

- Separate operational metrics from product analytics.
- Secure internal dashboards with SSO and IP allowlists.

---

## Key Points (Chapter Summary)

- Vercel offers the fastest path for many Next teams; self-host when compliance or cost models demand it.
- `standalone` Docker images are the common production pattern on VMs/Kubernetes.
- Static export trades features for hosting simplicity—validate requirements early.
- Multi-cloud options differ in ergonomics; Cloud Run, ECS, and Render all run containers well.
- CDN and edge caching require correct `Cache-Control` and auth awareness.
- CI/CD should cache dependencies, run tests, and deploy with secrets hygiene.
- Monitoring combines errors (Sentry), logs, metrics, and real user performance.

---

## Best Practices

1. **Mirror production locally** with `next build && next start` before releasing.
2. **Scope environment variables** per environment; audit `NEXT_PUBLIC_*` exposure.
3. **Use health checks** that do not depend on downstream outages misleadingly.
4. **Automate rollbacks** or keep previous container tags ready.
5. **Tag releases** in Git matching deployed artifacts for traceability.
6. **Infrastructure as code** (Terraform, Pulumi) for non-PaaS deployments.
7. **Separate preview databases** from production with realistic anonymized seeds.
8. **Upload source maps** to error trackers in CI only for private projects.
9. **Document runbooks** for incident response (cache purge, feature flag kill switches).
10. **Review CDN cache rules** whenever auth or personalization changes.

---

## Common Mistakes to Avoid

1. **Committing API keys** to repos or Docker layers.
2. **Caching authenticated HTML** at public CDNs.
3. **Omitting `standalone` static asset copies** (`public`, `.next/static`) in Docker images.
4. **Running `next dev` in production**—no optimizations, insecure defaults.
5. **No database migration strategy** causing downtime on deploy.
6. **Ignoring cold starts** on serverless—large bundles hurt UX.
7. **Preview environments pointing to production webhooks** causing data corruption.
8. **Under-provisioned build runners** leading to flaky OOM builds.
9. **No log retention policy**—cannot debug incidents after days.
10. **Skipping SSL/TLS best practices** on custom domains (weak ciphers, no HSTS).
