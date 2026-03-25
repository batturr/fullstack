# JavaScript Testing

Automated tests help you ship JavaScript with confidence: they document behavior, catch regressions early, and make refactors safer. This guide covers fundamentals, unit testing techniques, popular frameworks and tools, recurring patterns, and how to test asynchronous code—with runnable-style examples you can adapt to your stack.

---

## 📑 Table of Contents

1. [Testing Fundamentals](#1-testing-fundamentals)
2. [Unit Testing](#2-unit-testing)
3. [Testing Frameworks](#3-testing-frameworks)
4. [Testing Tools](#4-testing-tools)
5. [Test Patterns](#5-test-patterns)
6. [Testing Async Code](#6-testing-async-code)
7. [Best Practices](#best-practices)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 1. Testing Fundamentals

### Types of tests

- **Unit tests** exercise a single function, class, or module in isolation. They are fast and pinpoint failures.
- **Integration tests** verify that multiple units work together (e.g., service + database adapter with a test DB, or several modules wired as in production).
- **End-to-end (E2E) tests** drive the application like a user (browser or API) and assert on real workflows. They are slower but catch wiring and UX issues.

```javascript
// Conceptual split (not framework-specific):

// Unit: pure logic, no I/O
function add(a, b) {
  return a + b;
}
// Test: add(2, 3) === 5

// Integration: module A calls real module B (maybe with test doubles at boundaries)
// E2E: open login page, type credentials, expect dashboard URL
```

### TDD (Test-Driven Development)

Write a failing test first, implement the minimum code to pass, then refactor. The cycle is **Red → Green → Refactor**.

```javascript
// 1. Red: write test for behavior that does not exist yet
// test('formats currency', () => {
//   expect(formatCurrency(1234.5)).toBe('$1,234.50');
// });

// 2. Green: simplest implementation
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// 3. Refactor: extract helpers, improve names, keep tests green
```

### BDD (Behavior-Driven Development)

Focus on **behavior** described in readable examples, often with `describe`/`it` (or `feature`/`scenario`) wording that matches product language.

```javascript
// BDD-style description (Jest-like API):
// describe('Shopping cart', () => {
//   it('calculates total with tax for US customers', () => { ... });
// });
```

### Test coverage

**Coverage** measures which lines/branches/functions ran during tests. High coverage is useful but not proof of quality—assertions must still match real requirements.

```javascript
// Typical coverage metrics (reported by Istanbul/nyc, Jest, Vitest, etc.):
// - Statement coverage: % of statements executed
// - Branch coverage: % of if/else paths taken
// - Function coverage: % of functions invoked
// - Line coverage: similar to statements (tool-dependent)
```

### Assertions

An **assertion** states an expected outcome; the test runner fails the test if reality differs.

```javascript
// Manual assertion pattern (educational):
function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`${message} Expected ${expected}, got ${actual}`);
  }
}

assertEqual(add(1, 1), 2, 'addition');

// Frameworks provide richer matchers (toEqual, toThrow, etc.)
```

---

## 2. Unit Testing

### Writing unit tests

Good unit tests are **fast**, **deterministic**, **isolated**, and **readable**. One logical behavior per test is easier to debug than one giant test.

```javascript
// module: math.js
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// test idea: boundaries and typical values
// expect(clamp(5, 0, 10)).toBe(5);
// expect(clamp(-1, 0, 10)).toBe(0);
// expect(clamp(11, 0, 10)).toBe(10);
```

### Arrange–Act–Assert (AAA)

Structure tests in three phases: **Arrange** inputs and doubles, **Act** on the system under test, **Assert** on outcomes.

```javascript
// Arrange
const input = { price: 100, discountPercent: 20 };

// Act
const finalPrice = applyDiscount(input.price, input.discountPercent);

// Assert
if (finalPrice !== 80) {
  throw new Error(`expected 80, got ${finalPrice}`);
}
```

### Mocking

**Mocks** replace real dependencies with controlled implementations and often record **how** they were called (call count, arguments).

```javascript
// Simple manual mock function
function createEmailSenderMock() {
  const calls = [];
  return {
    send(to, body) {
      calls.push({ to, body });
    },
    getCalls() {
      return calls;
    },
  };
}

const sender = createEmailSenderMock();
notifyUser(sender, 'user@example.com', 'Welcome!');
// assert sender.getCalls().length === 1
```

### Stubbing

**Stubs** replace a dependency with a fixed response; the emphasis is on **controlling output**, not always on interaction verification.

```javascript
// Stub: always return a known value
const stubFetch = async () => ({ ok: true, json: async () => ({ id: 1 }) });

async function loadUser() {
  const res = await stubFetch('/api/user');
  return res.json();
}

// Test expects { id: 1 } without hitting the network
```

### Spies

**Spies** wrap the real function (or replace it) to observe calls while optionally delegating to the original.

```javascript
const obj = {
  save(x) {
    return x * 2;
  },
};

let callCount = 0;
const original = obj.save;
obj.save = function (...args) {
  callCount += 1;
  return original.apply(this, args);
};

const result = obj.save(3);
// result === 6, callCount === 1
```

---

## 3. Testing Frameworks

Frameworks provide a **runner**, **assertions** (or hooks to plug them in), **lifecycle hooks**, and **reporting**. Below are concise examples in each style.

### Jest

Popular for Node and React. Uses `describe`/`it` or `test`, `expect` matchers, and built-in mocking.

```javascript
// sum.js
export function sum(a, b) {
  return a + b;
}

// sum.test.js
import { sum } from './sum.js';

describe('sum', () => {
  it('adds two numbers', () => {
    expect(sum(2, 3)).toBe(5);
  });

  it('matches object shape', () => {
    expect({ a: 1, b: 2 }).toEqual({ a: 1, b: 2 });
  });

  it('throws on invalid input', () => {
    expect(() => sum('x', 1)).toThrow();
  });
});

// Setup / teardown (see also section 5)
// beforeEach(() => { ... });
// afterEach(() => { ... });
```

**Matchers (sample):** `toBe`, `toEqual`, `toStrictEqual`, `toContain`, `toMatch`, `toThrow`, `resolves` / `rejects` for promises.

### Mocha

Flexible runner; often paired with **Chai** and **Sinon**. No built-in `expect` unless you add an assertion library.

```javascript
// npm: mocha + chai
import { expect } from 'chai';

describe('Array', () => {
  describe('#indexOf()', () => {
    it('returns -1 when value absent', () => {
      expect([1, 2, 3].indexOf(4)).to.equal(-1);
    });
  });
});
```

### Jasmine

All-in-one BDD framework with matchers and spies; common in Angular (historically) and standalone projects.

```javascript
describe('A suite', () => {
  it('contains spec with expectation', () => {
    expect(true).toBe(true);
  });

  it('can spy on a function', () => {
    const foo = { bar: () => 42 };
    spyOn(foo, 'bar').and.returnValue(99);
    expect(foo.bar()).toBe(99);
  });
});
```

### Vitest

Jest-compatible API, fast ESM-first runner, good fit for **Vite** projects.

```javascript
import { describe, it, expect, vi } from 'vitest';

describe('mock example', () => {
  it('mocks a module function', async () => {
    const fn = vi.fn(() => 'mocked');
    expect(fn()).toBe('mocked');
    expect(fn).toHaveBeenCalled();
  });
});
```

### AVA

Runs tests concurrently; uses `test` instead of `it`, and ESM by default in recent versions.

```javascript
import test from 'ava';

test('foo is bar', (t) => {
  t.is('foo', 'foo');
});

test('async test', async (t) => {
  const value = await Promise.resolve(1);
  t.is(value, 1);
});
```

---

## 4. Testing Tools

### Chai (assertions)

Works with Mocha and others. Styles: **expect**, **should**, **assert**.

```javascript
import { expect, assert } from 'chai';

expect([1, 2]).to.have.lengthOf(2);
expect({ name: 'Ada' }).to.have.property('name');

assert.equal(foo, 'bar');
```

### Sinon (mocking, stubs, spies, fake timers)

```javascript
import sinon from 'sinon';

const callback = sinon.spy();
[1, 2, 3].forEach(callback);
// callback.calledThrice === true

const stub = sinon.stub().returns(42);
stub(); // 42

const clock = sinon.useFakeTimers();
setTimeout(() => {}, 1000);
clock.tick(1000);
clock.restore();
```

### Testing Library (React, DOM)

Encourages testing **as users** interact: queries by role, label, text—not implementation details.

```javascript
// @testing-library/react (conceptual)
import { render, screen, fireEvent } from '@testing-library/react';

// render(<Counter />);
// fireEvent.click(screen.getByRole('button', { name: /increment/i }));
// expect(screen.getByText('1')).toBeInTheDocument();
```

### Enzyme (legacy React testing)

Shallow rendering and full DOM rendering for React components. Many teams now prefer **Testing Library** for user-centric tests.

```javascript
// Enzyme (conceptual — requires adapter setup)
// import { shallow } from 'enzyme';
// const wrapper = shallow(<MyComponent />);
// expect(wrapper.find('.title').text()).to.equal('Hello');
```

### Cypress (E2E)

Runs in the browser with a rich time-travel debugger; great for product flows.

```javascript
// cypress/e2e/login.cy.js
describe('Login', () => {
  it('logs in', () => {
    cy.visit('/login');
    cy.get('[data-testid="email"]').type('user@example.com');
    cy.get('[data-testid="password"]').type('secret');
    cy.contains('button', 'Sign in').click();
    cy.url().should('include', '/dashboard');
  });
});
```

### Playwright (E2E)

Cross-browser automation with strong auto-waiting and tracing.

```javascript
// playwright test (JavaScript)
import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
});
```

### Puppeteer (browser automation)

Controls Chrome/Chromium via DevTools Protocol; useful for scraping, PDFs, and E2E-style checks.

```javascript
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('https://example.com');
const title = await page.title();
// assert title
await browser.close();
```

---

## 5. Test Patterns

### Setup and teardown (`beforeEach`, `afterEach`)

Use hooks to **reset state** so tests do not depend on order.

```javascript
// Jest-style
let db;

beforeAll(() => {
  // start test database once
});

beforeEach(() => {
  db = createInMemoryDb();
  seedMinimalData(db);
});

afterEach(() => {
  db.reset();
});

afterAll(() => {
  // shutdown shared resources
});
```

### Test fixtures

**Fixtures** are reusable static or factory data (users, API payloads) kept in files or builders.

```javascript
export const userFixture = {
  id: 'u1',
  email: 'ada@example.com',
  role: 'admin',
};

export function buildOrder(overrides = {}) {
  return {
    id: 'o1',
    items: [],
    total: 0,
    ...overrides,
  };
}
```

### Snapshot testing

Serializes output (UI tree, JSON, CLI text) to a **snapshot file**; future runs diff against it. Good for stable output; risky for volatile UI—review diffs carefully.

```javascript
// Jest
// expect(component).toMatchSnapshot();
// expect(data).toMatchInlineSnapshot(`...`);
```

### Property-based testing

Generate many random inputs (with shrinking on failure) to find edge cases. **fast-check** is a common library.

```javascript
import fc from 'fast-check';
import { test, expect } from 'vitest';

test('add is commutative', () => {
  fc.assert(
    fc.property(fc.integer(), fc.integer(), (a, b) => {
      expect(a + b).toBe(b + a);
    }),
  );
});
```

### Visual regression testing

Capture screenshots or component images and compare pixels to baselines (e.g., Percy, Chromatic, or custom Playwright screenshot diffs).

```javascript
// Playwright screenshot diff (conceptual)
// await expect(page).toHaveScreenshot('homepage.png');
```

---

## 6. Testing Async Code

### Testing callbacks

Use done callbacks (legacy) or prefer promises/async. Always handle errors.

```javascript
// Legacy Mocha-style with done
it('loads data', (done) => {
  fetchData((err, data) => {
    if (err) return done(err);
    try {
      if (data.id !== 1) throw new Error('bad id');
      done();
    } catch (e) {
      done(e);
    }
  });
});
```

### Testing promises

Return the promise so the runner waits; or use `async`/`await`.

```javascript
it('resolves to user', () => {
  return getUser(1).then((user) => {
    expect(user.name).toBe('Ada');
  });
});

it('rejects on missing id', () => {
  return expect(getUser(null)).rejects.toThrow('invalid id');
});
```

### Testing `async`/`await`

```javascript
it('fetches profile', async () => {
  const profile = await fetchProfile('u1');
  expect(profile.email).toMatch(/@/);
});
```

### Timeout handling

Slow or hanging async work needs explicit timeouts and cancellation where possible.

```javascript
// Jest: third argument is timeout ms
it(
  'completes within budget',
  async () => {
    await slowOperation();
  },
  10_000,
);

// AbortController for fetch
async function fetchWithTimeout(url, ms = 5000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}
```

### Fake timers with async code

Advance timers in tests; remember to `await` microtasks if the implementation uses `queueMicrotask` or `Promise`.

```javascript
import { vi } from 'vitest';

vi.useFakeTimers();

it('debounced call', async () => {
  const fn = vi.fn();
  const debounced = debounce(fn, 1000);
  debounced();
  vi.advanceTimersByTime(1000);
  await Promise.resolve(); // flush microtasks if debounce uses them
  expect(fn).toHaveBeenCalledTimes(1);
  vi.useRealTimers();
});
```

---

## Best Practices

- **Prefer tests that read like specifications** (clear `describe`/`it` names) so failures tell a story.
- **Test behavior, not private implementation**—especially in UI code—so refactors do not break tests unnecessarily.
- **Keep unit tests fast**; use integration/E2E sparingly for critical paths.
- **Isolate non-determinism**: mock time, randomness, and network in unit tests; use dedicated environments for integration tests.
- **One primary assertion concept per test** when possible; multiple `expect` calls are fine if they assert one behavior.
- **Maintain fixtures** in one place; avoid copy-pasted giant objects across files.
- **Review snapshot and visual diffs** in code review like any other code change.
- **Run tests in CI** on every push/PR with the same Node version and lockfile as local dev.
- **Fail fast on unhandled promise rejections** in Node test runs so silent async bugs surface.

---

## Common Mistakes to Avoid

- **Testing the mock**: assertions only verify the mock was called, not that the real integration behaves correctly—balance with integration tests.
- **Shared mutable state** between tests (global singletons, module-level variables) causing order-dependent flakes.
- **Missing `await` or return** on promises, so tests pass before async work finishes.
- **Over-mocking** the system under test until the test no longer resembles production behavior.
- **Ignoring async errors** in callbacks (calling `done()` without checking `err`).
- **Brittle selectors** in E2E tests (CSS classes that change every refactor); prefer stable `data-testid` or accessible roles.
- **Chasing 100% coverage** without meaningful assertions—coverage is a guide, not a goal.
- **Flaky timing** (`setTimeout` in tests without fake timers or proper waits) causing intermittent failures.
- **Testing framework internals** instead of your app’s public API surface.

---

*Use this document as a map: pick one framework (often Jest or Vitest for units, Playwright or Cypress for E2E), one assertion style, and grow patterns (AAA, fixtures, async discipline) as your codebase grows.*
