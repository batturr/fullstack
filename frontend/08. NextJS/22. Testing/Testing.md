# Testing Next.js Applications

A structured guide to testing React Server Components, Client Components, API routes, and end-to-end flows in Next.js using Jest, React Testing Library, Playwright, and Cypress. Examples reference e-commerce checkouts, blogs, SaaS dashboards, and social feeds.

## 📑 Table of Contents

- [22.1 Testing Overview](#221-testing-overview)
  - [Testing Philosophy](#testing-philosophy)
  - [Test Pyramid](#test-pyramid)
  - [Strategy for Next.js](#strategy-for-nextjs)
- [22.2 Unit Testing](#222-unit-testing)
  - [Jest Setup](#jest-setup)
  - [React Testing Library](#react-testing-library)
  - [Testing Components](#testing-components)
  - [Testing Hooks](#testing-hooks)
  - [Testing Utilities](#testing-utilities)
  - [Mock Data](#mock-data)
- [22.3 Testing Server Components](#223-testing-server-components)
  - [Async Component Testing](#async-component-testing)
  - [Mocking fetch()](#mocking-fetch)
  - [Data Fetching Tests](#data-fetching-tests)
  - [Server Action Tests](#server-action-tests)
- [22.4 Testing Client Components](#224-testing-client-components)
  - [useState and useEffect Testing](#usestate-and-useeffect-testing)
  - [User Interactions](#user-interactions)
  - [Events](#events)
  - [Form Testing](#form-testing)
- [22.5 Integration Testing](#225-integration-testing)
  - [Page Flows](#page-flows)
  - [Navigation](#navigation)
  - [API Routes](#api-routes)
  - [Database Integration](#database-integration)
- [22.6 E2E Testing](#226-e2e-testing)
  - [Playwright Setup](#playwright-setup)
  - [Cypress Setup](#cypress-setup)
  - [E2E Scenarios](#e2e-scenarios)
  - [Visual Regression](#visual-regression)
- [22.7 Testing API Routes](#227-testing-api-routes)
  - [Route Handlers](#route-handlers)
  - [Mocking Requests](#mocking-requests)
  - [HTTP Methods](#http-methods)
  - [Authentication in API Tests](#authentication-in-api-tests)
- [22.8 Testing Configuration](#228-testing-configuration)
  - [jest.config.js](#jestconfigjs)
  - [Environment Setup](#environment-setup)
  - [Coverage Reports](#coverage-reports)
  - [CI/CD Integration](#cicd-integration)
- [22.9 Testing Best Practices](#229-testing-best-practices)
  - [Test Organization](#test-organization)
  - [Naming Conventions](#naming-conventions)
  - [Isolation](#isolation)
  - [Mocking Discipline](#mocking-discipline)
  - [Accessibility Testing](#accessibility-testing)
- [Key Points (Chapter Summary)](#key-points-chapter-summary)
- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 22.1 Testing Overview

### Testing Philosophy

**Beginner Level:** Tests give you confidence that your blog still shows posts after a change. You write small checks: “when I render this, I see the title.”

**Intermediate Level:** Tests encode expectations about behavior, not implementation details. Prefer queries that resemble how users find elements (`getByRole`) over brittle CSS selectors. Next.js adds server/client boundaries—test each layer appropriately.

**Expert Level:** Risk-based testing balances speed and confidence. Critical paths (checkout, auth) get E2E coverage; pure utilities get fast unit tests; API contracts get integration tests. Align tests with deployment frequency and blast radius.

```typescript
// philosophy: test user-visible outcomes (e2e-style assertion helper)
import { screen } from "@testing-library/react";
import { expect } from "@jest/globals";

export function expectHeading(name: string | RegExp) {
  expect(screen.getByRole("heading", { name })).toBeInTheDocument();
}
```

**Key Points — Philosophy**

- User-centric assertions reduce breakage from refactors.
- Not every line needs a test; cover behavior and regressions.

---

### Test Pyramid

**Beginner Level:** Many unit tests at the bottom, fewer integration tests, very few slow browser tests at the top—like a pyramid.

**Intermediate Level:** Unit tests validate pure functions and hooks. Integration tests validate pages with mocked network or test DB. E2E validates full stack on staging.

**Expert Level:** For Next.js, “integration” often means rendering RSC trees with mocked `fetch`, or hitting route handlers with `node-mocks-http`. Tune the pyramid when microservices multiply—more contract tests, fewer giant E2E suites.

**Key Points — Pyramid**

- Cheap tests run on every commit; expensive tests run nightly or pre-release.
- Flaky E2E erodes trust—invest in stability or reduce count.

---

### Strategy for Next.js

**Beginner Level:** Test components like any React app; use Jest for logic and Playwright for “click login.”

**Intermediate Level:** Split by runtime: Server Components and route handlers run in Node tests; Client Components run in JSDOM. Use `next/jest` for transforms.

**Expert Level:** Mirror environments: Edge middleware tests may use `@edge-runtime/jest-environment`. Snapshot critical RSC payloads only when stable. Tag tests (`@smoke`) for selective CI.

```typescript
// jest strategy: separate projects for node vs jsdom (conceptual jest.config excerpt)
import type { Config } from "jest";

const config: Config = {
  projects: [
    {
      displayName: "node",
      testEnvironment: "node",
      testMatch: ["**/*.node.test.ts"],
    },
    {
      displayName: "client",
      testEnvironment: "jsdom",
      testMatch: ["**/*.client.test.tsx"],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    },
  ],
};

export default config;
```

**Key Points — Next.js Strategy**

- Match test environment to code runtime.
- Co-locate tests with features when teams scale.

---

## 22.2 Unit Testing

### Jest Setup

**Beginner Level:** Install `jest`, `@types/jest`, `ts-jest` or use Babel; run `jest` to execute `*.test.ts` files.

**Intermediate Level:** Use `next/jest` to apply Next.js compiler settings. Configure `moduleNameMapper` for `@/` aliases matching `tsconfig paths`.

**Expert Level:** Enable `isolatedModules`, `swc` transforms, and `testPathIgnorePatterns` for Playwright specs. Use `jest-environment-jsdom` for React components.

```typescript
// jest.config.ts
import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default createJestConfig(config);
```

```typescript
// jest.setup.ts
import "@testing-library/jest-dom";
```

**Key Points — Jest Setup**

- `next/jest` keeps transforms aligned with app builds.
- One setup file for jest-dom matchers.

---

### React Testing Library

**Beginner Level:** `render(<App />)` puts your dashboard on a fake DOM; `screen.getByText` finds elements.

**Intermediate Level:** Prefer `getByRole`, `findBy*` for async, and `userEvent` over `fireEvent` for realistic typing.

**Expert Level:** Wrap async Server Component results by testing exported pure child components, or use RSC integration patterns (see 22.3).

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "@jest/globals";
import { CartButton } from "./CartButton";

describe("CartButton", () => {
  it("announces add to cart for screen readers", async () => {
    const user = userEvent.setup();
    render(<CartButton sku="SKU-1" />);
    await user.click(screen.getByRole("button", { name: /add to cart/i }));
    expect(await screen.findByRole("status")).toHaveTextContent(/added/i);
  });
});
```

**Key Points — RTL**

- Queries reflect accessibility roles.
- `userEvent` simulates realistic input.

---

### Testing Components

**Beginner Level:** Render a product card with props; assert image alt text and price.

**Intermediate Level:** Mock `next/image` if dimensions break layout tests; mock `next/link` as `<a>`.

**Expert Level:** For Client Components using `useSearchParams`, wrap with a custom `Suspense` test harness or mock the hook module.

```tsx
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? ""} />;
  },
}));
```

**Key Points — Components**

- Mock Next.js primitives that JSDOM does not emulate fully.
- Test states: loading, empty, error, success.

---

### Testing Hooks

**Beginner Level:** `renderHook` from `@testing-library/react` tests a `useCart` hook’s initial count.

**Intermediate Level:** Wrap hooks needing context with `Wrapper` providers (theme, query client).

**Expert Level:** Fake timers for `useEffect` intervals in a SaaS analytics banner; assert cleanup on unmount.

```typescript
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "@jest/globals";
import { useCounter } from "./useCounter";

describe("useCounter", () => {
  it("increments", () => {
    const { result } = renderHook(() => useCounter(0));
    act(() => {
      result.current.inc();
    });
    expect(result.current.value).toBe(1);
  });
});
```

**Key Points — Hooks**

- Use `act` for state updates.
- Provide minimal providers to avoid huge trees.

---

### Testing Utilities

**Beginner Level:** Pure `formatPrice(cents)` returns `"$12.34"`—easy unit tests.

**Intermediate Level:** Test URL builders for i18n paths and pagination helpers used across blog and shop.

**Expert Level:** Property-based tests (fast-check) for slugifiers and parsers; snapshot only when output is stable.

```typescript
import { describe, it, expect } from "@jest/globals";
import { buildProductUrl } from "./urls";

describe("buildProductUrl", () => {
  it("encodes slug and preserves locale", () => {
    expect(buildProductUrl({ locale: "fr", slug: "café" })).toBe("/fr/p/caf%C3%A9");
  });
});
```

**Key Points — Utilities**

- Highest ROI per line of test code.
- No DOM required—fast feedback.

---

### Mock Data

**Beginner Level:** A `mockPost` object fills a blog card test.

**Intermediate Level:** Factories with `@faker-js/faker` generate realistic e-commerce orders; override fields per test.

**Expert Level:** Shared fixtures in `tests/factories`; MSW handlers for consistent API shapes across integration tests.

```typescript
import { faker } from "@faker-js/faker";

export type OrderLine = { sku: string; qty: number; priceCents: number };

export function makeOrderLine(overrides: Partial<OrderLine> = {}): OrderLine {
  return {
    sku: faker.string.alphanumeric(8).toUpperCase(),
    qty: faker.number.int({ min: 1, max: 5 }),
    priceCents: faker.number.int({ min: 500, max: 50000 }),
    ...overrides,
  };
}
```

**Key Points — Mock Data**

- Factories beat copy-paste objects.
- Keep types aligned with production DTOs.

---

## 22.3 Testing Server Components

### Async Component Testing

**Beginner Level:** Server Components are async functions—your test calls `await Dashboard()` and checks JSX.

**Intermediate Level:** Use React 18+ experimental test utilities or extract presentational sync child tested with props from async parent.

**Expert Level:** Integration-test async RSC by rendering through a small harness that awaits server components (community patterns evolve—prefer extracting pure view components for stability).

```typescript
import { describe, it, expect } from "@jest/globals";
import { ProductSummary } from "./ProductSummary";

describe("ProductSummary (server)", () => {
  it("renders title from props", async () => {
    const ui = await ProductSummary({ title: "Desk", priceCents: 19900 });
    expect(ui).toBeDefined();
  });
});
```

**Key Points — Async RSC**

- Prefer testing deterministic children with plain props.
- Watch React/testing library release notes for first-class async RSC APIs.

---

### Mocking fetch

**Beginner Level:** `global.fetch = jest.fn()` makes fetch return fake JSON for a product API.

**Intermediate Level:** Reset mocks in `beforeEach`; use `mockResolvedValueOnce` for sequences.

**Expert Level:** Align with Next.js extended `fetch` caching types; test cache tags indirectly via module boundaries or integration tests.

```typescript
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

beforeEach(() => {
  jest.resetAllMocks();
});

it("handles non-OK responses", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status: 500,
    json: async () => ({}),
  } as Response);
  await expect(loadProduct("x")).rejects.toThrow(/failed/i);
});
```

**Key Points — Mock fetch**

- Always type the mock `Response` minimally.
- Test both JSON parse errors and HTTP errors.

---

### Data Fetching Tests

**Beginner Level:** Test a function `getPosts()` that calls `fetch` and maps DTOs to view models.

**Intermediate Level:** Verify Zod parsing rejects invalid CMS payloads for a headless blog.

**Expert Level:** Test revalidation helpers (`revalidateTag`) by asserting they are invoked—mock `next/cache`.

```typescript
import { z } from "zod";

const PostSchema = z.object({ id: z.string(), title: z.string() });

export type Post = z.infer<typeof PostSchema>;

export async function parsePosts(json: unknown): Promise<Post[]> {
  return z.array(PostSchema).parse(json);
}
```

**Key Points — Data Fetching**

- Validate external data at boundaries.
- Separate transport from mapping logic.

---

### Server Action Tests

**Beginner Level:** Export the core logic of a Server Action as a pure `updateProfile(data)` function; test that without `"use server"` concerns.

**Intermediate Level:** If testing the action entry directly, mock `headers()` and `cookies()` from `next/headers`.

**Expert Level:** Integration-test actions via route handler or E2E when CSRF and auth middleware matter.

```typescript
"use server";

import { z } from "zod";

const Schema = z.object({ displayName: z.string().min(1) });

export async function updateDisplayName(formData: FormData) {
  const parsed = Schema.safeParse({ displayName: formData.get("displayName") });
  if (!parsed.success) return { ok: false as const, errors: parsed.error.flatten() };
  // ...persist
  return { ok: true as const };
}
```

```typescript
import { describe, it, expect } from "@jest/globals";
import { updateDisplayName } from "./actions";

describe("updateDisplayName", () => {
  it("validates input", async () => {
    const fd = new FormData();
    fd.set("displayName", "");
    const res = await updateDisplayName(fd);
    expect(res.ok).toBe(false);
  });
});
```

**Key Points — Server Actions**

- Test validation and branching with `FormData` or plain objects.
- Keep side effects behind injectable services in larger apps.

---

## 22.4 Testing Client Components

### useState and useEffect Testing

**Beginner Level:** Clicking “like” on a social post increments the counter—assert state-driven text.

**Intermediate Level:** Use `waitFor` when `useEffect` loads comments asynchronously.

**Expert Level:** Assert cleanup (abort fetch) by unmounting during pending effect; use `AbortSignal` mocks.

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PostLikes } from "./PostLikes";

it("likes optimistically", async () => {
  const user = userEvent.setup();
  render(<PostLikes postId="p1" initial={3} />);
  await user.click(screen.getByRole("button", { name: /like/i }));
  await waitFor(() => expect(screen.getByText(/4 likes/i)).toBeInTheDocument());
});
```

**Key Points — useState/useEffect**

- Async UI needs `findBy`/`waitFor`.
- Avoid sleeping with arbitrary timeouts.

---

### User Interactions

**Beginner Level:** Type into a search box; assert filtered products.

**Intermediate Level:** Test keyboard navigation for a command palette in a SaaS app.

**Expert Level:** Drag-and-drop with `@testing-library/user-event` pointer APIs or defer to Playwright for complex gestures.

**Key Points — Interactions**

- Prefer RTL for single-component interactions.
- E2E for multi-surface gestures.

---

### Events

**Beginner Level:** `onClick` opens a modal—assert dialog role appears.

**Intermediate Level:** Synthesize `onKeyDown` for Escape to close.

**Expert Level:** Delegate to native behavior when possible (`userEvent.keyboard`) instead of calling props directly.

```tsx
await user.keyboard("{Escape}");
expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
```

**Key Points — Events**

- Test both mouse and keyboard where applicable.
- Respect `stopPropagation` pitfalls in portals.

---

### Form Testing

**Beginner Level:** Submit newsletter signup; assert success message.

**Intermediate Level:** Assert inline errors from react-hook-form + zod resolver.

**Expert Level:** File upload flows: create `File` objects in JSDOM; for drag-drop zones combine unit + E2E.

```tsx
const file = new File(["hello"], "hello.png", { type: "image/png" });
await user.upload(screen.getByLabelText(/avatar/i), file);
await user.click(screen.getByRole("button", { name: /save/i }));
expect(await screen.findByText(/uploaded/i)).toBeInTheDocument();
```

**Key Points — Forms**

- Associate labels with inputs for accessible queries.
- Test server error mapping to fields.

---

## 22.5 Integration Testing

### Page Flows

**Beginner Level:** Render a checkout page with mocked cart provider; step through shipping → payment sections.

**Intermediate Level:** Use MSW to simulate Stripe-like endpoints; assert redirect to success page component.

**Expert Level:** Time-bound flows with session expiry; assert re-auth prompts.

**Key Points — Page Flows**

- Integrate real routers (`next-router-mock`) for navigation assertions.

---

### Navigation

**Beginner Level:** Click a `<Link>`; assert href.

**Intermediate Level:** Mock `useRouter` push calls to ensure login redirect after form submit.

**Expert Level:** App Router: mock `usePathname`, `useSearchParams` for analytics breadcrumbs on a blog.

```typescript
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/en/blog",
}));
```

**Key Points — Navigation**

- Prefer real links for static href tests.
- Mock imperative navigation for side effects.

---

### API Routes

**Beginner Level:** `POST /api/cart` adds item—call handler function with fake `Request`.

**Intermediate Level:** Spin up `node-mocks-http` or use `fetch` against a test server.

**Expert Level:** Contract tests comparing OpenAPI schema to actual JSON responses.

**Key Points — API Routes**

- Test status codes and error shapes consistently.
- Validate auth middleware order separately.

---

### Database Integration

**Beginner Level:** Use SQLite in-memory for order repository tests.

**Intermediate Level:** Prisma test database with migrations in CI; truncate between tests.

**Expert Level:** Transactional tests with rollback per case; avoid shared state for parallel workers.

```typescript
import { prisma } from "@/lib/db";
import { afterEach, describe, it, expect } from "@jest/globals";

afterEach(async () => {
  await prisma.order.deleteMany();
});
```

**Key Points — Database Integration**

- Isolate data per test.
- Migrations must run before suite.

---

## 22.6 E2E Testing

### Playwright Setup

**Beginner Level:** `npm init playwright`; run headed browser against `localhost:3000`.

**Intermediate Level:** Configure `webServer` in `playwright.config.ts` to boot `next dev` or `next start`.

**Expert Level:** Shard tests in CI; trace on failure; seed staging DB via API.

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://127.0.0.1:3000" },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

**Key Points — Playwright**

- Auto-start dev server simplifies local runs.
- Use `data-testid` sparingly; prefer roles.

---

### Cypress Setup

**Beginner Level:** Open Cypress UI; write `cy.visit("/")`.

**Intermediate Level:** Component testing for design-system widgets; API stubbing with `cy.intercept`.

**Expert Level:** Parallelize in CI with Docker; record flakes.

```typescript
describe("SaaS login", () => {
  it("logs in", () => {
    cy.visit("/login");
    cy.get('input[name="email"]').type("user@example.com");
    cy.get('input[name="password"]').type("secret");
    cy.contains("button", "Sign in").click();
    cy.url().should("include", "/dashboard");
  });
});
```

**Key Points — Cypress**

- Great DX for iterative debugging.
- Consider network stubbing costs vs realism.

---

### E2E Scenarios

**Beginner Level:** Smoke: home loads, nav works.

**Intermediate Level:** Purchase path on e-commerce: browse → product → cart → checkout (test mode).

**Expert Level:** Multi-role flows: admin approves content on blog CMS visible to readers after publish.

**Key Points — E2E Scenarios**

- Tag critical paths for release gates.
- Keep data setup idempotent.

---

### Visual Regression

**Beginner Level:** Playwright screenshots compared to baselines.

**Intermediate Level:** Percy/Chromatic for component libraries in Storybook.

**Expert Level:** Mask dynamic timestamps in dashboards; stabilize fonts with `font-display` and loaded webfonts in CI.

**Key Points — Visual Regression**

- Baseline updates need human review.
- Reduce flakiness with deterministic data.

---

## 22.7 Testing API Routes

### Route Handlers

**Beginner Level:** `export async function GET()` returns JSON—invoke with `new Request("http://localhost/api/health")`.

**Intermediate Level:** Assert `NextResponse` headers (`content-type`, `cache-control`).

**Expert Level:** Stream responses tests—consume `ReadableStream` chunks.

```typescript
import { GET } from "@/app/api/health/route";
import { describe, it, expect } from "@jest/globals";

describe("/api/health", () => {
  it("returns ok", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });
});
```

**Key Points — Route Handlers**

- Direct handler invocation is fast.
- Match runtime (edge vs node) in tests when APIs differ.

---

### Mocking Requests

**Beginner Level:** Build `Request` objects with JSON bodies for `POST`.

**Intermediate Level:** Mock `cookies()` and `headers()` when handlers read auth.

**Expert Level:** Property-based fuzzing for query params to harden parsers.

```typescript
const req = new Request("http://localhost/api/items?page=2", {
  method: "GET",
  headers: { cookie: "session=abc" },
});
```

**Key Points — Mocking Requests**

- Include content-type for JSON posts.
- Test malformed bodies.

---

### HTTP Methods

**Beginner Level:** `405` when `DELETE` not allowed on a read-only blog API.

**Intermediate Level:** `OPTIONS` for CORS preflight on public widgets.

**Expert Level:** Idempotency keys for `POST` checkout creates.

**Key Points — HTTP Methods**

- Explicit method guards improve security.
- Document expected verbs in OpenAPI.

---

### Authentication in API Tests

**Beginner Level:** Pass `Authorization: Bearer test-token` and mock verifier.

**Intermediate Level:** Session cookies from signed test fixtures.

**Expert Level:** Rotate keys in tests to ensure verifier handles kid headers.

```typescript
jest.mock("@/lib/auth", () => ({
  verifySession: jest.fn().mockResolvedValue({ userId: "u1" }),
}));
```

**Key Points — API Auth Tests**

- Never use production secrets in tests.
- Cover 401 vs 403 semantics.

---

## 22.8 Testing Configuration

### jest.config.js

**Beginner Level:** Single project jsdom config.

**Intermediate Level:** `collectCoverageFrom` excluding stories and types.

**Expert Level:** `maxWorkers` tuned for CI vCPU; cache directory persisted.

```typescript
const config = {
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts", "!src/**/index.ts"],
};

export default config;
```

**Key Points — jest.config**

- Keep transforms fast (SWC).
- Separate e2e from Jest via `testPathIgnorePatterns`.

---

### Environment Setup

**Beginner Level:** `.env.test` with fake API keys.

**Intermediate Level:** `loadEnvConfig` from `@next/env` in global setup.

**Expert Level:** Vault-injected secrets in CI only; never log env dumps on failure.

```typescript
// globalSetup.ts
import { loadEnvConfig } from "@next/env";

export default async function globalSetup() {
  const projectDir = process.cwd();
  loadEnvConfig(projectDir);
}
```

**Key Points — Environment**

- Deterministic env between local and CI.
- Document required vars in README.

---

### Coverage Reports

**Beginner Level:** `jest --coverage` HTML report.

**Intermediate Level:** Enforce thresholds per package in monorepo SaaS.

**Expert Level:** Diff coverage on PRs; exclude generated code.

**Key Points — Coverage**

- Percentage is a guide, not proof of quality.
- Focus on critical modules first.

---

### CI/CD Integration

**Beginner Level:** GitHub Actions matrix: node 20, run `lint`, `test`, `build`.

**Intermediate Level:** Upload coverage to Codecov; cache `node_modules` + Next cache.

**Expert Level:** Staged pipelines: fast unit on PR, full E2E nightly with sharding.

```yaml
name: ci
on: [push, pull_request]
jobs:
  test:
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

**Key Points — CI/CD**

- Fail fast on lint/typecheck.
- `npm ci` for reproducible installs.

---

## 22.9 Testing Best Practices

### Test Organization

**Beginner Level:** `__tests__` folders next to components.

**Intermediate Level:** Colocate `*.test.tsx` beside source for discoverability.

**Expert Level:** Domain folders (`billing/`, `feed/`) own tests and factories.

**Key Points — Organization**

- Pick one convention per repo.
- Mirror app structure.

---

### Naming Conventions

**Beginner Level:** `describe("CartSummary")` with `it("shows total")`.

**Intermediate Level:** Prefix `it` with behavior: `it("redirects unauthenticated users to /login")`.

**Expert Level:** Include ticket IDs only if team policy requires—avoid noise.

**Key Points — Naming**

- Behavior-focused names read like specs.
- Avoid test names that mirror implementation.

---

### Isolation

**Beginner Level:** Each test resets mocks.

**Intermediate Level:** Avoid global singletons; inject dependencies.

**Expert Level:** Detect shared state leaks with randomized test order (`--randomize`).

**Key Points — Isolation**

- Parallel-safe tests speed CI.
- Use `beforeEach` for consistent baselines.

---

### Mocking Discipline

**Beginner Level:** Mock network, not small internal helpers.

**Intermediate Level:** Prefer MSW for integration realism.

**Expert Level:** Contract tests ensure mocks match production schemas.

**Key Points — Mocking**

- Over-mocking hides integration bugs.
- Verify mock calls only when behavior demands it.

---

### Accessibility Testing

**Beginner Level:** RTL `getByRole` catches missing button names.

**Intermediate Level:** `jest-axe` scans rendered DOM for violations.

**Expert Level:** Playwright + axe-core on critical flows; focus management after modal open.

```typescript
import { axe, toHaveNoViolations } from "jest-axe";
import { render } from "@testing-library/react";

expect.extend(toHaveNoViolations);

it("has no obvious a11y issues", async () => {
  const { container } = render(<CheckoutForm />);
  expect(await axe(container)).toHaveNoViolations();
});
```

**Key Points — Accessibility**

- Automated a11y tests catch many regressions.
- Manual testing still required for complex widgets.

---

## Key Points (Chapter Summary)

- Align Jest environments with Node vs browser code paths in Next.js.
- Prefer RTL user-centric queries and `userEvent`.
- Server Actions and RSC: test pure logic and child views; add E2E for glue.
- Integration tests bridge UI, handlers, and DB with controlled fakes.
- Playwright/Cypress cover real navigation, auth, and visual regressions.
- CI should run fast feedback tests always, heavy suites on schedule.

---

## Best Practices

1. **Use `next/jest`** for consistent transforms with the framework.
2. **Colocate tests** with features and share factories for DTO shapes.
3. **Mark flaky tests** and fix or quarantine; never ignore silently long-term.
4. **Seed deterministic data** in E2E; avoid reliance on prod APIs.
5. **Test error and empty states**, not only happy paths.
6. **Mock `next/image` and `next/link`** in unit tests when needed.
7. **Separate unit, integration, and e2e** directories or naming for clarity.
8. **Enforce coverage thresholds** gradually, not in one huge jump.
9. **Run `next build` in CI** to catch server/client boundary mistakes.
10. **Accessibility checks** in component tests catch regressions early.

---

## Common Mistakes to Avoid

1. **Testing implementation details** (internal state) instead of outcomes.
2. **Using `fireEvent` everywhere** when `userEvent` better matches users.
3. **Sharing mutable globals** between tests causing order dependence.
4. **Not awaiting** async UI updates—flake city.
5. **Over-mocking Next.js** until tests no longer resemble real rendering.
6. **E2E without data strategy**—tests mutate shared staging data randomly.
7. **Ignoring Edge runtime differences** in middleware tests.
8. **Huge snapshots** of entire pages that change constantly.
9. **Skipping API error paths** (400/401/409) in handler tests.
10. **No CI caching** causing slow pipelines and skipped test runs “to save time.”
