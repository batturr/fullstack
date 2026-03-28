# Testing (React + TypeScript)

**Testing** **gives** **confidence** **that** **your** **React** **UI** **behaves** **correctly** **for** **users**—**from** **e-commerce** **checkout** **flows** **and** **social** **feeds** **to** **dashboards**, **todo** **lists**, **weather** **widgets**, **and** **chat** **panels**. **TypeScript** **types** **help** **tests** **compile** **against** **real** **props** **and** **API** **shapes**; **Jest**, **React** **Testing** **Library**, **MSW**, **Cypress**, **and** **Playwright** **each** **serve** **different** **layers** **of** **the** **testing** **pyramid**.

---

## 📑 Table of Contents

- [Testing (React + TypeScript)](#testing-react--typescript)
  - [📑 Table of Contents](#-table-of-contents)
  - [17.1 Testing Fundamentals](#171-testing-fundamentals)
  - [17.2 Testing Library](#172-testing-library)
  - [17.3 Jest with React](#173-jest-with-react)
  - [17.4 Component Testing](#174-component-testing)
  - [17.5 Hook Testing](#175-hook-testing)
  - [17.6 Advanced Testing](#176-advanced-testing)
  - [17.7 E2E Testing](#177-e2e-testing)
  - [17.8 Visual Testing](#178-visual-testing)
  - [17.9 Testing Best Practices](#179-testing-best-practices)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices (Global)](#best-practices-global)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 17.1 Testing Fundamentals

### Why Test

**Beginner Level**

**Automated** **tests** **catch** **regressions** **before** **users** **do**. **A** **simple** **unit** **test** **might** **assert** **that** **a** **cart** **total** **sums** **correctly** **when** **quantities** **change**.

**Real-time example**: **E-commerce** **“** **mini** **cart** **”** **shows** **wrong** **tax** **after** **a** **refactor**—**a** **test** **fails** **in** **CI** **instead** **of** **in** **production**.

**Intermediate Level**

**Tests** **document** **intent** **and** **enable** **refactoring**: **when** **behavior** **is** **specified** **by** **tests**, **you** **can** **change** **implementation** **with** **less** **fear**. **They** **also** **speed** **up** **code** **review** **by** **making** **expected** **behavior** **explicit**.

**Real-time example**: **Social** **media** **“** **like** **”** **button** **must** **toggle** **optimistic** **UI** **and** **rollback** **on** **error**—**tests** **encode** **that** **contract**.

**Expert Level**

**Risk-based** **testing** **balances** **cost** **vs** **value**: **critical** **paths** **(checkout**, **auth**, **payments)** **get** **stronger** **coverage** **and** **E2E** **guards**; **pure** **utilities** **lean** **on** **fast** **unit** **tests**. **Flaky** **tests** **are** **worse** **than** **no** **tests** **because** **they** **train** **teams** **to** **ignore** **CI**.

```typescript
// Pure domain logic is cheap to test and high value (e-commerce totals).
export type LineItem = { unitPrice: number; qty: number; taxRate: number };

export function lineTotal(item: LineItem): number {
  const subtotal = item.unitPrice * item.qty;
  return subtotal * (1 + item.taxRate);
}
```

#### Key Points — Why Test

- **Tests** **are** **living** **specification** **and** **safety** **net**.
- **Prioritize** **behavior** **users** **care** **about** **over** **implementation** **details**.
- **Flakiness** **erodes** **trust**—**invest** **in** **deterministic** **setup**.

---

### Testing Pyramid

**Beginner Level**

**The** **pyramid** **suggests** **many** **fast** **unit** **tests**, **fewer** **integration** **tests**, **and** **the** **smallest** **number** **of** **slow** **E2E** **tests**. **Think** **“** **wide** **base**, **narrow** **top** **”**.

**Real-time example**: **Todo** **app**: **hundreds** **of** **unit** **tests** **for** **reducers** **and** **formatters**, **dozens** **of** **component** **tests**, **a** **handful** **of** **E2E** **flows** **(add**, **complete**, **delete)**.

**Intermediate Level**

**Integration** **tests** **validate** **wiring** **(Router**, **Context**, **API** **client)** **without** **full** **browser** **automation**. **E2E** **tests** **are** **expensive** **but** **catch** **real** **user** **journeys** **across** **services**.

**Real-time example**: **Dashboard** **E2E** **ensures** **filters** **+** **charts** **+** **export** **work** **together** **as** **deployed**.

**Expert Level**

**The** **pyramid** **is** **a** **guide**, **not** **dogma**: **some** **teams** **add** **a** **“** **ice** **cream** **cone** **”** **anti-pattern** **(many** **E2E**, **few** **unit)** **when** **flaky** **E2E** **dominate**. **Contract** **tests** **and** **visual** **regression** **can** **sit** **beside** **the** **pyramid**.

```typescript
// Example mental split for a weather app module surface:
// Unit: formatWind(), classifyAqi()
// Integration: WeatherCard + mocked fetch
// E2E: city search → forecast renders (Playwright)
```

#### Key Points — Testing Pyramid

- **Prefer** **fast**, **deterministic** **tests** **at** **the** **base**.
- **Reserve** **E2E** **for** **critical** **journeys** **and** **smoke** **suites**.
- **Rebalance** **when** **integration** **gaps** **appear** **(API** **mocks** **too** **optimistic)**.

---

### Unit vs Integration vs E2E

**Beginner Level**

**Unit** **tests** **isolate** **one** **function** **or** **component** **with** **controlled** **inputs**. **Integration** **tests** **combine** **multiple** **units** **(e.g.**, **form** **+** **validation** **+** **submit** **handler** **mocked** **at** **the** **network** **edge)**. **E2E** **tests** **drive** **a** **real** **browser** **against** **a** **running** **app** **(often** **with** **test** **data)**.

**Real-time example**: **Chat** **app**: **unit** **test** **message** **grouping**; **integration** **test** **MessageList** **with** **MSW**; **E2E** **send** **message** **and** **see** **it** **appear**.

**Intermediate Level**

**Boundaries** **matter**: **mock** **at** **system** **edges** **(HTTP**, **WebSocket**, **localStorage)** **not** **inside** **every** **child** **component** **unless** **necessary**. **Integration** **tests** **with** **RTL** **+** **MSW** **often** **give** **the** **best** **ROI** **for** **React** **apps**.

**Expert Level**

**E2E** **selectors** **should** **prefer** **roles** **and** **accessible** **names**; **parallel** **sharding** **and** **retries** **must** **be** **configured** **carefully** **to** **avoid** **masking** **real** **bugs**.

```tsx
// Unit-ish: pure selector for dashboard KPI
export function pickTopMetric(metrics: { name: string; value: number }[]): string {
  if (metrics.length === 0) return "—";
  return [...metrics].sort((a, b) => b.value - a.value)[0]!.name;
}
```

#### Key Points — Unit vs Integration vs E2E

- **Choose** **the** **smallest** **scope** **that** **still** **proves** **the** **behavior**.
- **Integration** **tests** **are** **often** **the** **sweet** **spot** **for** **React**.
- **E2E** **validates** **deployment** **shape**, **not** **every** **branch**.

---

### TDD (Test-Driven Development)

**Beginner Level**

**TDD** **means** **write** **a** **failing** **test** **first**, **then** **minimal** **code** **to** **pass**, **then** **refactor**. **It** **forces** **clear** **acceptance** **criteria**.

**Real-time example**: **Todo** **“** **mark** **all** **complete** **”**—**test** **lists** **expected** **state** **transition**, **then** **implement** **reducer**.

**Intermediate Level**

**Outside-in** **vs** **inside-out**: **outside-in** **starts** **with** **user-facing** **behavior** **(RTL)**; **inside-out** **starts** **with** **domain** **functions**. **Both** **work** **with** **TypeScript** **to** **lock** **types** **early**.

**Real-time example**: **E-commerce** **coupon** **validation**: **tests** **for** **invalid** **code**, **expired**, **stacking** **rules** **before** **UI** **polish**.

**Expert Level**

**TDD** **does** **not** **replace** **design** **or** **exploration** **spikes**—**use** **spikes**, **then** **discard** **and** **TDD** **the** **real** **solution**. **Snapshot** **TDD** **is** **usually** **a** **smell** **unless** **outputs** **are** **stable**.

```typescript
describe("coupon engine (e-commerce)", () => {
  it("rejects expired coupons", () => {
    const result = applyCoupon({ code: "SUMMER", now: new Date("2020-01-01"), expiresAt: new Date("2019-12-31") });
    expect(result.ok).toBe(false);
  });
});
```

#### Key Points — TDD

- **Red** → **green** → **refactor** **keeps** **changes** **small**.
- **Combine** **with** **types** **for** **fast** **feedback**.
- **Do** **not** **TDD** **unknown** **UI** **exploration**—**prototype** **first**.

---

## 17.2 Testing Library

### Philosophy (Testing Library)

**Beginner Level**

**React** **Testing** **Library** **(RTL)** **encourages** **tests** **that** **resemble** **how** **users** **interact** **with** **your** **app**: **render**, **find** **elements** **by** **accessible** **roles**/**labels**, **fire** **events**, **assert** **on** **the** **DOM**.

**Real-time example**: **Social** **“** **post** **composer** **”**: **test** **types** **text** **and** **clicks** **“** **Post** **”**, **not** **that** **internal** **`usePostDraft`** **was** **called**.

**Intermediate Level**

**Avoid** **testing** **implementation** **details** **(private** **state**, **internal** **methods)**—**those** **tests** **break** **on** **refactors** **that** **preserve** **UX**.

**Expert Level**

**Queries** **are** **prioritized**: **accessible** **queries** **first** **(`getByRole`**, **`getByLabelText`)**, **`getByTestId`** **last** **resort**. **`screen`** **encourages** **assertions** **from** **the** **user’s** **perspective**.

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("dashboard greets the signed-in user", async () => {
  const user = userEvent.setup();
  render(<DashboardHeader displayName="Asha" />);
  expect(screen.getByRole("heading", { name: /welcome, asha/i })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /open profile menu/i }));
});
```

#### Key Points — Philosophy

- **Test** **behavior**, **not** **internals**.
- **Prefer** **roles** **and** **labels**.
- **`userEvent`** **over** **`fireEvent`** **for** **realistic** **input**.

---

### render()

**Beginner Level**

**`render(ui)`** **mounts** **your** **component** **into** **a** **JSDOM** **document** **and** **returns** **helpers** **including** **`rerender`**, **`unmount`**.

**Real-time example**: **Weather** **card** **renders** **temperature** **string**.

**Intermediate Level**

**Wrap** **with** **providers** **(Router**, **QueryClient**, **Theme)** **via** **custom** **`render`** **helpers** **to** **avoid** **boilerplate**.

**Expert Level**

**Strict** **Mode** **double** **invocation** **in** **React** **18** **can** **surface** **effects**—**tests** **should** **still** **be** **deterministic** **(use** **fake** **timers**, **wait** **for** **async** **completion)**.

```tsx
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProductBreadcrumb } from "./ProductBreadcrumb";

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter initialEntries={["/shop/shoes/123"]}>{ui}</MemoryRouter>);
}

test("shows product segment", () => {
  const { container } = renderWithRouter(<ProductBreadcrumb title="Trail Runner" />);
  expect(container).toHaveTextContent("Trail Runner");
});
```

#### Key Points — render()

- **Centralize** **provider** **wrappers** **in** **test** **utils**.
- **Return** **values** **include** **`rerender`** **for** **prop** **changes**.

---

### Queries — getByRole

**Beginner Level**

**`getByRole`** **finds** **elements** **by** **ARIA** **role** **and** **accessible** **name**. **It** **matches** **what** **assistive** **tech** **uses**.

**Real-time example**: **E-commerce** **“** **Add** **to** **cart** **”** **button**: **`getByRole('button', { name: /add to cart/i })`**.

**Intermediate Level**

**Roles** **include** **`textbox`**, **`combobox`**, **`navigation`**, **`dialog`**. **Use** **`name`** **option** **with** **string**, **regex**, **or** **function**.

**Expert Level**

**Hidden** **elements** **may** **not** **be** **found** **depending** **on** **`hidden:`** **option** **(Testing** **Library** **query** **options)**—**prefer** **making** **the** **UI** **accessible** **rather** **than** **forcing** **queries**.

```tsx
import { render, screen } from "@testing-library/react";

test("checkout shows primary call to action", () => {
  render(<CheckoutBar totalLabel="Total" onPay={() => {}} />);
  expect(screen.getByRole("button", { name: /pay securely/i })).toBeEnabled();
});
```

#### Key Points — getByRole

- **Default** **query** **for** **most** **interactive** **elements**.
- **Combine** **with** **accessible** **names** **from** **visible** **text** **or** **`aria-label`**.

---

### Queries — getByText

**Beginner Level**

**`getByText`** **finds** **nodes** **by** **their** **text** **content** **(string** **or** **regex)**.

**Real-time example**: **Dashboard** **shows** **“** **Revenue:** **$12.4k** **”**—**assert** **with** **regex** **for** **numbers**.

**Intermediate Level**

**Text** **matchers** **can** **be** **too** **brittle** **if** **copy** **changes** **often**—**pair** **with** **`getByRole`** **when** **possible**.

**Expert Level**

**For** **i18n**, **avoid** **hard-coding** **strings** **in** **every** **test**—**use** **test** **ids** **or** **mock** **dictionaries** **for** **stable** **keys**.

```tsx
test("weather shows advisory for high wind", () => {
  render(<WeatherAlert windMph={45} />);
  expect(screen.getByText(/high wind advisory/i)).toBeInTheDocument();
});
```

#### Key Points — getByText

- **Great** **for** **static** **copy**.
- **Fragile** **for** **frequently** **edited** **marketing** **text**.

---

### Queries — getByLabelText

**Beginner Level**

**`getByLabelText`** **finds** **form** **controls** **by** **their** **associated** **`<label>`** **text**.

**Real-time example**: **Todo** **“** **New** **task** **”** **input** **bound** **to** **a** **label**.

**Intermediate Level**

**Works** **with** **`aria-label`** **when** **no** **visible** **label** **exists** **(use** **sparingly)**.

**Expert Level**

**Custom** **components** **must** **forward** **props** **to** **native** **inputs** **or** **use** **`aria-labelledby`** **for** **RTL** **to** **associate** **correctly**.

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("updates email field", async () => {
  const user = userEvent.setup();
  render(<AccountForm />);
  await user.type(screen.getByLabelText(/email address/i), "asha@example.com");
  expect(screen.getByLabelText(/email address/i)).toHaveValue("asha@example.com");
});
```

#### Key Points — getByLabelText

- **Best** **for** **form** **fields** **with** **proper** **labels**.
- **Fails** **fast** **when** **labeling** **is** **broken**—**good** **a11y** **signal**.

---

### Queries — getByPlaceholderText

**Beginner Level**

**`getByPlaceholderText`** **finds** **inputs** **by** **placeholder** **string**.

**Real-time example**: **Chat** **composer** **placeholder** **“** **Message** **#general** **”**.

**Intermediate Level**

**Placeholders** **are** **not** **substitutes** **for** **labels**—**tests** **should** **prefer** **`getByLabelText`** **when** **labels** **exist**.

**Expert Level**

**If** **design** **only** **provides** **placeholder**, **consider** **adding** **visually** **hidden** **labels** **for** **a11y** **and** **better** **queries**.

```tsx
test("search filters products by placeholder-assisted input", async () => {
  const user = userEvent.setup();
  render(<ProductSearch />);
  await user.type(screen.getByPlaceholderText(/search products/i), "sneaker");
  expect(await screen.findByText(/trail sneaker/i)).toBeInTheDocument();
});
```

#### Key Points — getByPlaceholderText

- **Use** **when** **placeholder** **is** **the** **stable** **hook**.
- **Prefer** **labels** **for** **accessibility**.

---

### Queries — getByTestId

**Beginner Level**

**`getByTestId`** **selects** **via** **`data-testid`**. **Escape** **hatch** **when** **roles/text** **cannot** **uniquely** **target** **an** **element**.

**Real-time example**: **Dashboard** **chart** **canvas** **without** **semantic** **role**.

**Intermediate Level**

**Overuse** **couples** **tests** **to** **DOM** **hooks** **that** **do** **not** **reflect** **user** **behavior**.

**Expert Level**

**In** **design** **systems**, **wrap** **primitives** **so** **test** **ids** **are** **rare** **and** **consistent**.

```tsx
test("maps marker exists for store locator", () => {
  render(<StoreMap testId="store-map" />);
  expect(screen.getByTestId("store-map")).toBeInTheDocument();
});
```

#### Key Points — getByTestId

- **Last** **resort** **in** **RTL** **priority** **list**.
- **Prefer** **accessible** **queries** **first**.

---

### User Events

**Beginner Level**

**`@testing-library/user-event`** **simulates** **user** **interactions** **more** **realistically** **than** **raw** **`fireEvent`** **(focus**, **keydown**, **input** **events**, **etc.)**.

**Real-time example**: **E-commerce** **quantity** **stepper** **clicks** **and** **keyboard** **entry**.

**Intermediate Level**

**Always** **`const user = userEvent.setup()`** **(v14+)** **and** **`await user.click(...)`** **for** **async** **behavior**.

**Expert Level**

**Pointer** **events** **and** **drag/drop** **have** **specific** **APIs**—**consult** **docs** **for** **gesture-heavy** **components**.

```tsx
import userEvent from "@testing-library/user-event";

test("social post can be liked", async () => {
  const user = userEvent.setup();
  const onToggle = jest.fn();
  render(<LikeButton liked={false} onToggle={onToggle} />);
  await user.click(screen.getByRole("button", { name: /like/i }));
  expect(onToggle).toHaveBeenCalledTimes(1);
});
```

#### Key Points — User Events

- **Prefer** **`userEvent`** **over** **`fireEvent`**.
- **Await** **async** **interactions**.

---

### Async Utilities — waitFor

**Beginner Level**

**`waitFor`** **polls** **until** **assertions** **pass** **or** **a** **timeout** **occurs**. **Use** **when** **state** **updates** **async** **after** **fetch** **or** **`act()`** **wrapped** **updates**.

**Real-time example**: **Weather** **forecast** **loads** **after** **`fetch`**.

**Intermediate Level**

**Avoid** **asserting** **immediately** **after** **triggering** **async** **work** **without** **awaiting** **UI** **settling**.

**Expert Level**

**Combine** **with** **fake** **timers** **carefully**—**advance** **timers** **inside** **`waitFor`** **when** **needed**.

```tsx
import { render, screen, waitFor } from "@testing-library/react";

test("shows loaded todos", async () => {
  render(<TodoPanel />);
  await waitFor(() => expect(screen.queryByText(/loading todos/i)).not.toBeInTheDocument());
  expect(screen.getByText(/buy milk/i)).toBeInTheDocument();
});
```

#### Key Points — waitFor

- **Use** **for** **async** **state** **transitions**.
- **Prefer** **`findBy*`** **queries** **when** **possible** **(see** **below)**.

---

### Async Utilities — findBy

**Beginner Level**

**`findBy*`** **queries** **return** **promises** **that** **resolve** **when** **the** **element** **appears**—**they** **wrap** **`waitFor`** **+** **`getBy*`**.

**Real-time example**: **Chat** **message** **appears** **after** **mocked** **send**.

**Intermediate Level**

**Use** **`findByRole`** **for** **accessible** **elements** **that** **arrive** **late**.

**Expert Level**

**Set** **reasonable** **`timeout`** **options** **for** **slow** **CI** **machines**.

```tsx
test("shows receipt after checkout", async () => {
  render(<CheckoutFlow />);
  expect(await screen.findByRole("heading", { name: /order confirmed/i })).toBeInTheDocument();
});
```

#### Key Points — findBy

- **Preferred** **async** **query** **for** **many** **cases**.
- **Avoid** **mixing** **`waitFor`** **and** **`findBy`** **redundantly**.

---

### screen

**Beginner Level**

**`screen`** **holds** **queries** **scoped** **to** **the** **whole** **document** **after** **`render`**. **Import** **and** **use** **`screen.getByRole(...)`** **instead** **of** **destructuring** **from** **`render`** **for** **readability**.

**Real-time example**: **Dashboard** **layout** **with** **nested** **components**—**still** **query** **from** **`screen`**.

**Intermediate Level**

**Helps** **avoid** **stale** **references** **when** **multiple** **renders** **or** **dialogs** **portaled** **to** **`document.body`**.

**Expert Level**

**For** **portals**, **`screen`** **often** **still** **works** **because** **elements** **mount** **into** **`document`**.

```tsx
import { render, screen } from "@testing-library/react";

test("modal announces title", async () => {
  render(<ConfirmDeleteDialog open title="Delete post?" />);
  expect(screen.getByRole("dialog", { name: /delete post/i })).toBeInTheDocument();
});
```

#### Key Points — screen

- **Improves** **test** **readability**.
- **Works** **well** **with** **portals** **when** **attached** **to** **`document`**.

---

### within

**Beginner Level**

**`within(element)`** **scopes** **queries** **to** **a** **subtree**. **Use** **when** **multiple** **similar** **widgets** **exist** **(two** **cards**, **two** **lists)**.

**Real-time example**: **E-commerce** **compare** **two** **products** **side** **by** **side**.

**Intermediate Level**

**Combine** **`within`** **with** **`getByRole`** **to** **disambiguate** **duplicates**.

**Expert Level**

**For** **tables**, **scope** **to** **`within(row)`** **to** **avoid** **brittle** **global** **text** **matches**.

```tsx
import { render, within, screen } from "@testing-library/react";

test("each cart line shows qty", () => {
  render(
    <CartTable
      lines={[
        { id: "1", title: "Sneaker", qty: 2 },
        { id: "2", title: "Socks", qty: 1 },
      ]}
    />
  );

  const rows = screen.getAllByRole("row");
  expect(within(rows[1]!).getByRole("cell", { name: /2/ })).toBeInTheDocument();
});
```

#### Key Points — within

- **Disambiguates** **repeated** **patterns**.
- **Pairs** **well** **with** **`getAllByRole`**.

---

## 17.3 Jest with React

### Configuration

**Beginner Level**

**Jest** **is** **configured** **via** **`jest.config.ts`** **/ **`jest.config.js`** **or** **`create-react-app`/`Vite`** **presets**. **Key** **fields**: **`testEnvironment` **(`jsdom` **for** **React)**, **`setupFilesAfterEnv`**, **`moduleNameMapper`** **for** **CSS/assets**.

**Real-time example**: **Map** **`\.svg$`** **to** **a** **mock** **file** **so** **dashboard** **icons** **do** **not** **break** **tests**.

**Intermediate Level**

**`transform`** **with** **`ts-jest`** **or** **`babel-jest`** **for** **TypeScript**. **`testMatch`** **controls** **which** **files** **run**.

**Expert Level**

**Projects** **with** **mixed** **ESM/CJS** **may** **need** **`extensionsToTreatAsEsm`** **and** **stable** **`moduleNameMapper`** **for** **`uuid`**, **`nanoid`**.

```typescript
// jest.config.ts (excerpt)
import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "\\.(css|less)$": "identity-obj-proxy",
    "\\.(svg)$": "<rootDir>/test/mocks/svgMock.tsx",
  },
};

export default config;
```

#### Key Points — Configuration

- **`jsdom`** **environment** **for** **DOM** **APIs**.
- **Map** **static** **assets** **to** **mocks**.

---

### Test Suites / Test Cases

**Beginner Level**

**`describe`** **groups** **related** **tests**; **`it`/`test`** **defines** **a** **single** **behavior**. **Names** **should** **read** **like** **specifications**.

**Real-time example**: **`describe('CartTotals')`** **with** **`it('applies tax for EU addresses')`**.

**Intermediate Level**

**Use** **`describe.each`** **for** **table-driven** **cases** **(currency** **rounding**, **locales)**.

**Expert Level**

**Avoid** **randomness** **in** **tests** **unless** **using** **explicit** **seeds** **or** **mocked** **`Math.random`**.

```typescript
describe("formatMoney (e-commerce)", () => {
  it("formats USD with two decimals", () => {
    expect(formatMoney(12.3, "USD")).toBe("$12.30");
  });
});
```

#### Key Points — Suites / Cases

- **One** **logical** **assertion** **focus** **per** **test** **(not** **always** **one** **`expect`)**.
- **Readable** **titles** **reduce** **debug** **time**.

---

### Matchers (expect)

**Beginner Level**

**`expect(x).toBe(y)`** **uses** **Object.is**; **`toEqual`** **for** **deep** **equality**. **RTL** **adds** **`toBeInTheDocument()`** **via** **`@testing-library/jest-dom`**.

**Real-time example**: **Todo** **count** **badge** **shows** **“** **3** **left** **”**.

**Intermediate Level**

**`expect.assertions(n)`** **ensures** **async** **branches** **actually** **run**.

**Expert Level**

**Custom** **asymmetric** **matchers** **can** **encode** **domain** **rules** **(invoice** **totals)**.

```typescript
import "@testing-library/jest-dom";

test("dashboard shows badge", () => {
  render(<InboxBadge count={3} />);
  expect(screen.getByText(/3/)).toBeInTheDocument();
});
```

#### Key Points — Matchers

- **Install** **`jest-dom`** **matchers** **for** **RTL**.
- **Use** **`toEqual`** **for** **objects/arrays**.

---

### Setup / Teardown

**Beginner Level**

**`beforeEach`** **prepares** **clean** **state**; **`afterEach`** **cleans** **mocks** **and** **DOM**. **RTL** **`cleanup`** **runs** **automatically** **in** **modern** **versions** **when** **imported** **from** **`@testing-library/react`**.

**Real-time example**: **Reset** **`fetch`** **mock** **between** **tests**.

**Intermediate Level**

**Global** **`fetch`** **mocks** **should** **restore** **in** **`afterEach`**.

**Expert Level**

**For** **MSW**, **`server.listen`** **in** **`beforeAll`**, **`server.resetHandlers`** **in** **`afterEach`**, **`server.close`** **in** **`afterAll`**.

```typescript
import { afterEach, beforeEach, jest } from "@jest/globals";

beforeEach(() => {
  jest.resetAllMocks();
});

afterEach(() => {
  localStorage.clear();
});
```

#### Key Points — Setup / Teardown

- **Isolation** **prevents** **order-dependent** **failures**.
- **Reset** **network** **mocks** **each** **test**.

---

### Mocking Modules

**Beginner Level**

**`jest.mock('./api')`** **replaces** **a** **module** **with** **a** **mock** **factory**. **Use** **for** **hard** **system** **boundaries**.

**Real-time example**: **Mock** **`./weatherClient`** **in** **component** **tests**.

**Intermediate Level**

**`jest.mock`** **is** **hoisted**—**put** **near** **top** **of** **file** **or** **use** **`jest.unstable_mockModule`** **for** **ESM** **advanced** **cases**.

**Expert Level**

**Prefer** **MSW** **for** **HTTP** **so** **tests** **exercise** **real** **`fetch`** **call** **sites**.

```typescript
jest.mock("../../services/analytics", () => ({
  track: jest.fn(),
}));
```

#### Key Points — Mocking Modules

- **Mock** **at** **boundaries**, **not** **everywhere**.
- **Keep** **mocks** **small** **and** **typed**.

---

### Mocking Functions

**Beginner Level**

**`jest.fn()`** **creates** **a** **spy** **with** **call** **records**. **Pass** **as** **props** **to** **verify** **callbacks**.

**Real-time example**: **E-commerce** **`onCheckout`** **called** **once**.

**Intermediate Level**

**`mockImplementation`** **simulates** **behavior**; **`mockResolvedValue`** **for** **async**.

**Expert Level**

**Type** **callbacks** **with** **`jest.MockedFunction`** **or** **`Mock`** **from** **`@types/jest`**.

```typescript
const onSave = jest.fn<(draft: string) => void>();

render(<Composer onSave={onSave} />);
expect(onSave).not.toHaveBeenCalled();
```

#### Key Points — Mocking Functions

- **Assert** **arguments** **with** **`toHaveBeenCalledWith`**.
- **Clear/reset** **between** **tests**.

---

### Snapshot Testing

**Beginner Level**

**`expect(tree).toMatchSnapshot()`** **stores** **serialized** **output** **on** **disk**. **Useful** **for** **stable** **error** **messages**, **CLI** **output**, **or** **serialized** **component** **trees** **(use** **with** **caution)**.

**Real-time example**: **Design** **system** **Icon** **SVG** **wrapper** **output**.

**Intermediate Level**

**For** **React**, **prefer** **explicit** **assertions** **over** **large** **DOM** **snapshots**.

**Expert Level**

**Inline** **snapshots** **can** **help** **review** **diffs** **in** **PRs** **but** **still** **risk** **noise**.

```tsx
test("renders weather summary consistently", () => {
  const { container } = render(<WeatherSummary tempC={21} condition="Clear" />);
  expect(container.firstChild).toMatchSnapshot();
});
```

#### Key Points — Snapshot Testing

- **Great** **for** **stable**, **low-churn** **outputs**.
- **Poor** **for** **rapidly** **changing** **UI** **markup**.

---

### Coverage Reports

**Beginner Level**

**Run** **`jest --coverage`** **to** **see** **line/branch/function** **coverage**. **HTML** **report** **shows** **uncovered** **lines**.

**Real-time example**: **Identify** **untested** **branches** **in** **pricing** **engine**.

**Intermediate Level**

**Coverage** **does** **not** **equal** **quality**—**100%** **can** **still** **miss** **bugs**.

**Expert Level**

**Exclude** **generated** **files** **via** **`collectCoverageFrom`** **`!** **patterns**.

```bash
jest --coverage --collectCoverageFrom="src/**/*.{ts,tsx}" --collectCoverageFrom="!src/**/*.d.ts"
```

#### Key Points — Coverage

- **Use** **as** **a** **guide**, **not** **a** **goal** **in** **isolation**.
- **Focus** **on** **critical** **modules** **first**.

---

## 17.4 Component Testing

### Function Components

**Beginner Level**

**Test** **function** **components** **by** **rendering** **them** **with** **props** **and** **asserting** **on** **output** **and** **events**.

**Real-time example**: **Profile** **avatar** **initials** **from** **display** **name**.

**Intermediate Level**

**Extract** **heavy** **logic** **to** **pure** **functions** **to** **unit** **test** **without** **DOM**.

**Expert Level**

**Memoized** **components** **`React.memo`** **still** **test** **via** **behavior**—**avoid** **testing** **memo** **internals**.

```tsx
type Props = { name: string };

export function Avatar({ name }: Props) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return <span aria-label={`Avatar for ${name}`}>{initials}</span>;
}
```

#### Key Points — Function Components

- **Test** **outputs** **and** **interactions**.
- **Keep** **domain** **logic** **testable** **in** **isolation**.

---

### Props

**Beginner Level**

**Pass** **props** **in** **`render(<Comp prop="x" />)`** **and** **assert** **text/attributes**.

**Real-time example**: **Product** **price** **shows** **sale** **badge** **when** **`onSale`**.

**Intermediate Level**

**Use** **TypeScript** **to** **ensure** **test** **fixtures** **match** **production** **types**.

**Expert Level**

**For** **union** **props**, **use** **`it.each`** **to** **cover** **discriminant** **branches**.

```tsx
type Props = { title: string; onSale: boolean };

export function PriceTag({ title, onSale }: Props) {
  return (
    <div>
      <h3>{title}</h3>
      {onSale ? <span>Sale</span> : null}
    </div>
  );
}
```

#### Key Points — Props

- **Fixture** **builders** **reduce** **boilerplate** **in** **large** **apps**.

---

### State

**Beginner Level**

**User-visible** **state** **changes** **are** **asserted** **after** **events** **(clicks**, **typing)**.

**Real-time example**: **Todo** **item** **toggles** **completed** **styling**.

**Intermediate Level**

**Do** **not** **read** **`useState`** **directly**—**assert** **DOM**.

**Expert Level**

**Concurrent** **features** **may** **require** **`async`** **utilities** **and** **proper** **`act`** **(often** **handled** **by** **RTL)**.

```tsx
test("toggles expanded state", async () => {
  const user = userEvent.setup();
  render(<ThreadPreview excerpt="Hello" body="Hello world" />);
  await user.click(screen.getByRole("button", { name: /expand/i }));
  expect(screen.getByText(/hello world/i)).toBeVisible();
});
```

#### Key Points — State

- **Black-box** **the** **component**.
- **Prefer** **`findBy`** **for** **async** **updates**.

---

### Events

**Beginner Level**

**Simulate** **clicks**, **keyboard**, **and** **input** **with** **`userEvent`**.

**Real-time example**: **Chat** **sends** **on** **Enter** **and** **button** **click**.

**Intermediate Level**

**Use** **`keyboard`** **API** **for** **shortcuts** **(e.g.**, **`{Control>}a{/Control}`)**.

**Expert Level**

**Pointer** **capture** **and** **complex** **gestures** **may** **need** **integration/E2E** **coverage**.

```tsx
test("submits on Enter", async () => {
  const user = userEvent.setup();
  const onSend = jest.fn();
  render(<ChatComposer onSend={onSend} />);
  await user.type(screen.getByRole("textbox"), "hi{enter}");
  expect(onSend).toHaveBeenCalledWith("hi");
});
```

#### Key Points — Events

- **Match** **real** **input** **paths**.
- **Test** **keyboard** **and** **pointer** **when** **both** **exist**.

---

### Conditional Rendering

**Beginner Level**

**Assert** **that** **branches** **show** **correct** **elements** **for** **given** **props/state**.

**Real-time example**: **Dashboard** **shows** **maintenance** **banner** **when** **`maintenanceMode`**.

**Intermediate Level**

**Use** **negative** **assertions** **carefully**—**prefer** **`queryBy`** **+** **`expect(...).not.toBeInTheDocument()`**.

**Expert Level**

**Test** **edge** **cases** **like** **empty** **lists**, **null** **props**, **and** **error** **boundaries** **separately**.

```tsx
test("shows empty state when no notifications", () => {
  render(<Notifications items={[]} />);
  expect(screen.getByText(/you're all caught up/i)).toBeInTheDocument();
});
```

#### Key Points — Conditional Rendering

- **Cover** **each** **meaningful** **branch**.
- **Prefer** **`queryBy`** **for** **absence**.

---

### Lists

**Beginner Level**

**Use** **`getAllByRole`** **and** **`within`** **to** **verify** **ordering** **and** **content**.

**Real-time example**: **E-commerce** **search** **results** **list**.

**Intermediate Level**

**For** **virtualized** **lists**, **integration/E2E** **may** **be** **needed** **to** **scroll** **items** **into** **view**.

**Expert Level**

**Stable** **row** **keys** **help** **React** **and** **also** **help** **tests** **target** **specific** **items** **via** **content**.

```tsx
test("renders feed items in order", () => {
  render(<Feed posts={[{ id: "1", title: "A" }, { id: "2", title: "B" }]} />);
  const articles = screen.getAllByRole("article");
  expect(within(articles[0]!).getByText("A")).toBeInTheDocument();
  expect(within(articles[1]!).getByText("B")).toBeInTheDocument();
});
```

#### Key Points — Lists

- **Assert** **order** **when** **it** **matters** **to** **users**.
- **Virtualization** **changes** **what’s** **in** **the** **DOM**.

---

### Forms

**Beginner Level**

**Fill** **fields** **with** **`user.type`**, **select** **options**, **submit** **forms**, **assert** **validation** **messages**.

**Real-time example**: **Checkout** **shipping** **form** **shows** **ZIP** **errors**.

**Intermediate Level**

**Use** **`await user.click(screen.getByRole('button', { name: /submit/i }))`** **for** **submit** **handlers**.

**Expert Level**

**Complex** **libraries** **(React** **Hook** **Form**, **Formik)** **may** **need** **`waitFor`** **for** **async** **validation**.

```tsx
test("shows validation error", async () => {
  const user = userEvent.setup();
  render(<ShippingForm onSubmit={jest.fn()} />);
  await user.click(screen.getByRole("button", { name: /continue/i }));
  expect(await screen.findByText(/address is required/i)).toBeInTheDocument();
});
```

#### Key Points — Forms

- **Interact** **like** **a** **user**.
- **Assert** **errors** **via** **accessible** **text**.

---

## 17.5 Hook Testing

### Custom Hooks

**Beginner Level**

**Hooks** **are** **functions** **that** **must** **run** **under** **React** **rules**. **You** **test** **them** **via** **components** **or** **`renderHook`**.

**Real-time example**: **`useDebounce`** **for** **dashboard** **search**.

**Intermediate Level**

**Prefer** **`@testing-library/react`** **`renderHook`** **(included** **in** **RTL** **v14+** **package** **ecosystem)**.

**Expert Level**

**For** **hooks** **that** **need** **context**, **wrap** **with** **`wrapper`** **option**.

```tsx
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "./useCounter";

test("increments", () => {
  const { result } = renderHook(() => useCounter(0));
  act(() => result.current.inc());
  expect(result.current.value).toBe(1);
});
```

#### Key Points — Custom Hooks

- **`renderHook`** **for** **direct** **hook** **testing**.
- **Avoid** **testing** **React** **internals**.

---

### renderHook()

**Beginner Level**

**`renderHook`** **mounts** **a** **test** **harness** **that** **calls** **your** **hook** **and** **returns** **`result.current`**.

**Real-time example**: **`useOnlineStatus`** **for** **chat** **connectivity** **indicator**.

**Intermediate Level**

**Use** **`initialProps`** **and** **`rerender`** **to** **test** **dependency** **changes**.

**Expert Level**

**Async** **hooks** **should** **use** **`waitFor`** **from** **`@testing-library/react`** **around** **assertions** **on** **`result.current`**.

```tsx
import { renderHook, waitFor } from "@testing-library/react";

test("loads profile", async () => {
  const { result } = renderHook(() => useProfile("user_123"), {
    wrapper: ({ children }) => <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>,
  });
  await waitFor(() => expect(result.current.status).toBe("success"));
});
```

#### Key Points — renderHook

- **Use** **`wrapper`** **for** **providers**.
- **`rerender`** **for** **prop** **changes**.

---

### Hook Updates

**Beginner Level**

**Wrap** **state** **updates** **triggered** **by** **hooks** **in** **`act()`** **when** **using** **low-level** **utilities**; **RTL** **often** **does** **this** **automatically**.

**Real-time example**: **`useToggle`** **in** **settings** **panel**.

**Intermediate Level**

**`renderHook`** **+** **`act`** **from** **RTL** **for** **manual** **invocations**.

**Expert Level**

**Strict** **mode** **may** **double** **invoke** **effects**—**ensure** **idempotent** **fetches** **or** **dedupe** **with** **libraries**.

```tsx
import { renderHook, act } from "@testing-library/react";
import { useToggle } from "./useToggle";

test("flips", () => {
  const { result } = renderHook(() => useToggle(false));
  act(() => result.current.toggle());
  expect(result.current.on).toBe(true);
});
```

#### Key Points — Hook Updates

- **`act`** **prevents** **warnings** **in** **tests**.
- **Prefer** **RTL** **helpers** **over** **manual** **renderers**.

---

### Async Hooks

**Beginner Level**

**Hooks** **that** **`fetch`** **data** **expose** **`loading/error/data`**—**assert** **transitions** **with** **`waitFor`**.

**Real-time example**: **Weather** **hook** **`useForecast(city)`**.

**Intermediate Level**

**Mock** **network** **with** **MSW** **to** **control** **latency** **and** **errors**.

**Expert Level**

**Simulate** **abort** **behavior** **when** **inputs** **change** **rapidly** **(search** **as** **you** **type)**.

```typescript
// Hook returns discriminated union for clarity
export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };
```

#### Key Points — Async Hooks

- **Test** **success** **and** **failure** **paths**.
- **Use** **MSW** **for** **realistic** **HTTP**.

---

## 17.6 Advanced Testing

### Context

**Beginner Level**

**Wrap** **with** **a** **provider** **in** **`render`** **helper** **and** **assert** **consumer** **output**.

**Real-time example**: **ThemeContext** **dark** **mode** **toggle** **for** **dashboard**.

**Intermediate Level**

**Create** **a** **`AllProviders`** **wrapper** **used** **everywhere**.

**Expert Level**

**Multiple** **contexts** **compose** **as** **nested** **providers** **or** **a** **single** **composed** **provider**.

```tsx
function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider initial="dark">{ui}</ThemeProvider>);
}
```

#### Key Points — Context

- **Centralize** **provider** **wrappers**.
- **Avoid** **testing** **context** **internals** **directly**.

---

### Redux

**Beginner Level**

**Wrap** **with** **`Provider` **and** **a** **store** **created** **for** **tests** **(`configureStore` **with** **preloadedState)**.

**Real-time example**: **E-commerce** **cart** **slice** **shows** **count** **badge**.

**Intermediate Level**

**Prefer** **integration** **tests** **that** **dispatch** **real** **actions** **over** **mocking** **all** **selectors**.

**Expert Level**

**For** **RTK** **Query**, **use** **MSW** **to** **mock** **endpoints** **and** **assert** **cache** **behavior** **with** **`waitFor`**.

```tsx
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";

test("shows cart count", () => {
  const store = configureStore({
    reducer: { cart: cartReducer },
    preloadedState: { cart: { items: [{ id: "1", qty: 2 }] } } as any,
  });
  render(
    <Provider store={store}>
      <CartBadge />
    </Provider>
  );
  expect(screen.getByText(/2/)).toBeInTheDocument();
});
```

#### Key Points — Redux

- **Preload** **state** **for** **deterministic** **scenarios**.
- **Test** **user-visible** **results** **of** **actions**.

---

### React Router

**Beginner Level**

**Use** **`MemoryRouter`** **with** **`initialEntries`** **to** **set** **location**.

**Real-time example**: **Social** **profile** **tab** **route** **shows** **posts**.

**Intermediate Level**

**Use** **`Routes`/`Route`** **as** **in** **app** **and** **navigate** **with** **`user.click`** **on** **links**.

**Expert Level**

**Test** **loaders** **/ **data** **routers** **with** **the** **framework’s** **testing** **utilities** **when** **using** **React** **Router** **data** **APIs**.

```tsx
import { MemoryRouter, Route, Routes } from "react-router-dom";

test("navigates to settings", async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={["/app"]}>
      <Routes>
        <Route path="/app" element={<AppHome />} />
        <Route path="/settings" element={<h1>Settings</h1>} />
      </Routes>
    </MemoryRouter>
  );
  await user.click(screen.getByRole("link", { name: /settings/i }));
  expect(await screen.findByRole("heading", { name: /settings/i })).toBeInTheDocument();
});
```

#### Key Points — React Router

- **`MemoryRouter`** **for** **unit/integration** **routing** **tests**.
- **Assert** **navigation** **outcomes**, **not** **router** **internals**.

---

### API Calls (MSW)

**Beginner Level**

**Mock** **Service** **Worker** **intercepts** **`fetch`/XHR** **in** **tests** **and** **returns** **fixtures**.

**Real-time example**: **Dashboard** **KPI** **cards** **GET** **`/api/metrics`**.

**Intermediate Level**

**Define** **`rest.get`** **handlers** **and** **override** **per** **test** **with** **`server.use`**.

**Expert Level**

**Simulate** **500** **errors**, **slow** **responses**, **and** **pagination** **edge** **cases**.

```typescript
import { rest } from "msw";
import { setupServer } from "msw/node";

export const handlers = [
  rest.get("/api/metrics", (_req, res, ctx) => res(ctx.json({ revenue: 12400 }))),
];

export const server = setupServer(...handlers);
```

#### Key Points — MSW

- **Exercise** **real** **request** **code** **paths**.
- **Keep** **fixtures** **typed**.

---

### Error Boundaries

**Beginner Level**

**Throw** **in** **child** **in** **test** **environment** **and** **assert** **fallback** **UI** **renders**. **Note**: **error** **boundaries** **behave** **differently** **in** **tests** **depending** **on** **React** **version** **and** **testing** **setup**—**often** **assert** **fallback** **via** **integration** **patterns** **or** **simulate** **with** **controlled** **components**.

**Intermediate Level**

**Use** **`react-error-boundary`** **library** **patterns** **or** **custom** **`componentDidCatch`** **with** **fallback** **prop**.

**Expert Level**

**Log** **reporting** **to** **Sentry** **should** **be** **mocked** **and** **asserted** **not** **to** **spam** **in** **tests**.

```tsx
class ProblemChild extends React.Component {
  render() {
    if (this.props.fail) throw new Error("boom");
    return <div>ok</div>;
  }
}
```

#### Key Points — Error Boundaries

- **Test** **fallback** **UI** **and** **logging** **side** **effects** **(mocked)**.
- **Know** **React** **testing** **limitations** **around** **errors**.

---

### Suspense

**Beginner Level**

**Suspense** **for** **data** **often** **shows** **fallback** **while** **loading**. **Tests** **should** **await** **resolved** **content** **with** **`findBy`**.

**Real-time example**: **Lazy** **dashboard** **widget** **with** **`React.lazy`**.

**Intermediate Level**

**Use** **`act`/`waitFor`** **carefully** **with** **concurrent** **features**.

**Expert Level**

**Testing** **libraries** **continue** **to** **improve** **Suspense** **support**—**verify** **versions**.

```tsx
test("shows widget after lazy load", async () => {
  render(
    <Suspense fallback={<div>Loading widget…</div>}>
      <LazySalesWidget />
    </Suspense>
  );
  expect(await screen.findByText(/net sales/i)).toBeInTheDocument();
});
```

#### Key Points — Suspense

- **Assert** **fallback** **then** **final** **UI**.
- **Keep** **React/RTL** **versions** **current**.

---

### Portals

**Beginner Level**

**Portals** **render** **into** **`document.body`**. **Use** **`screen`** **queries** **because** **they** **search** **the** **whole** **document**.

**Real-time example**: **E-commerce** **modal** **checkout** **dialog**.

**Intermediate Level**

**`within` **may** **still** **work** **if** **scoped** **to** **the** **portal** **root** **element**.

**Expert Level**

**Focus** **management** **tests** **may** **belong** **in** **E2E** **or** **dedicated** **a11y** **tests**.

```tsx
test("dialog is accessible", async () => {
  const user = userEvent.setup();
  render(<CartModal open />);
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /close/i }));
});
```

#### Key Points — Portals

- **Query** **with** **`screen`**.
- **Pair** **with** **E2E** **for** **focus** **trap** **behavior**.

---

## 17.7 E2E Testing

### Cypress with React

**Beginner Level**

**Cypress** **runs** **in** **the** **browser**, **drives** **your** **app**, **and** **asserts** **DOM**. **Great** **for** **critical** **flows**.

**Real-time example**: **E-commerce** **happy** **path** **browse** **→** **cart** **→** **checkout**.

**Intermediate Level**

**Use** **`data-cy`** **selectors** **sparingly**—**prefer** **roles** **where** **stable**.

**Expert Level**

**Component** **testing** **in** **Cypress** **can** **mount** **isolated** **components** **with** **providers**.

```typescript
describe("Weather city search", () => {
  it("shows forecast", () => {
    cy.visit("/weather");
    cy.findByRole("textbox", { name: /city/i }).type("London{enter}");
    cy.findByText(/cloudy/i).should("be.visible");
  });
});
```

#### Key Points — Cypress

- **Great** **DX** **and** **time** **travel** **debugging**.
- **Single** **browser** **tab** **model** **has** **constraints**.

---

### Playwright

**Beginner Level**

**Playwright** **supports** **multiple** **browsers**, **parallelism**, **and** **powerful** **tracing**.

**Real-time example**: **Dashboard** **export** **CSV** **download** **flow**.

**Intermediate Level**

**Use** **`page.getByRole`** **locators** **(Playwright** **recommended)**.

**Expert Level**

**Use** **fixtures** **for** **auth** **state** **to** **avoid** **logging** **in** **every** **test**.

```typescript
import { test, expect } from "@playwright/test";

test("chat sends message", async ({ page }) => {
  await page.goto("/chat/general");
  await page.getByRole("textbox", { name: /message/i }).fill("hello team");
  await page.getByRole("button", { name: /send/i }).click();
  await expect(page.getByText("hello team")).toBeVisible();
});
```

#### Key Points — Playwright

- **Cross-browser** **coverage**.
- **Strong** **for** **CI** **parallel** **sharding**.

---

### Structure (E2E)

**Beginner Level**

**Group** **tests** **by** **feature** **(`e2e/checkout.spec.ts`)**. **Keep** **fixtures** **and** **page** **objects** **in** **helpers**.

**Real-time example**: **Social** **app** **has** **`feed.spec.ts`**, **`profile.spec.ts`**.

**Intermediate Level**

**Page** **Object** **Model** **reduces** **duplication** **but** **avoid** **over-abstraction**.

**Expert Level**

**Tag** **tests** **(`@smoke`**, **`@nightly`)** **for** **selective** **CI** **runs**.

```typescript
// e2e/pages/LoginPage.ts
import type { Page } from "@playwright/test";

export class LoginPage {
  constructor(private readonly page: Page) {}
  async goto() {
    await this.page.goto("/login");
  }
  async login(email: string) {
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByRole("button", { name: /continue/i }).click();
  }
}
```

#### Key Points — E2E Structure

- **Colocate** **helpers** **with** **features**.
- **Keep** **tests** **independent** **with** **fresh** **state**.

---

### Best Practices (E2E)

**Beginner Level**

**Avoid** **sleep**—**use** **auto-waiting** **assertions**. **Keep** **tests** **short** **and** **focused**.

**Real-time example**: **Todo** **E2E** **adds** **one** **task** **per** **test**.

**Intermediate Level**

**Seed** **backend** **state** **via** **APIs** **or** **fixtures** **instead** **of** **long** **UI** **setup** **chains**.

**Expert Level**

**Flake** **budget**: **track** **retries** **and** **fix** **root** **causes**.

```typescript
// Playwright: prefer web-first assertions
await expect(page.getByText(/paid/i)).toBeVisible();
```

#### Key Points — E2E Best Practices

- **Deterministic** **data**.
- **Stable** **locators**.

---

## 17.8 Visual Testing

### Storybook

**Beginner Level**

**Storybook** **isolates** **components** **in** **stories** **for** **manual** **review** **and** **visual** **testing** **integration**.

**Real-time example**: **Design** **system** **Button** **variants** **for** **dashboard** **and** **e-commerce**.

**Intermediate Level**

**Args** **and** **controls** **let** **QA** **exercise** **states** **(loading**, **error)**.

**Expert Level**

**Integrate** **Chromatic** **or** **Storybook** **test** **runner** **for** **CI**.

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ProductCard } from "./ProductCard";

const meta = {
  title: "Commerce/ProductCard",
  component: ProductCard,
} satisfies Meta<typeof ProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnSale: Story = {
  args: { title: "Trail Shoe", price: 99, onSale: true },
};
```

#### Key Points — Storybook

- **Great** **for** **visual** **review** **and** **documentation**.
- **Stories** **double** **as** **test** **subjects**.

---

### Chromatic

**Beginner Level**

**Chromatic** **captures** **screenshots** **of** **stories** **and** **diffs** **PRs**.

**Real-time example**: **Catch** **unintended** **padding** **change** **in** **chat** **bubble**.

**Intermediate Level**

**Approve** **intentional** **visual** **changes** **in** **the** **Chromatic** **UI**.

**Expert Level**

**Use** **with** **design** **tokens** **to** **reduce** **noise**.

#### Key Points — Chromatic

- **PR-level** **visual** **regression**.
- **Requires** **discipline** **on** **review/approval**.

---

### Percy

**Beginner Level**

**Percy** **is** **another** **visual** **testing** **service** **that** **snapshots** **pages** **or** **components**.

**Real-time example**: **Marketing** **landing** **pages** **after** **CMS** **changes**.

**Intermediate Level**

**Stable** **rendering** **requires** **disabling** **animations** **and** **masking** **dynamic** **content**.

**Expert Level**

**Branch** **baselines** **and** **merge** **strategies** **vary** **by** **vendor**.

#### Key Points — Percy

- **Good** **for** **static** **pages**.
- **Mask** **dynamic** **timestamps**.

---

### Visual Regression (Concept)

**Beginner Level**

**Visual** **regression** **compares** **images** **of** **UI** **before/after**. **Complements** **functional** **tests**.

**Real-time example**: **Weather** **icons** **and** **gradients** **in** **widget**.

**Intermediate Level**

**Small** **changes** **(subpixel**, **font** **rendering)** **can** **flake** **across** **OS**.

**Expert Level**

**Run** **in** **consistent** **Docker** **images** **for** **stable** **screenshots**.

#### Key Points — Visual Regression

- **Not** **a** **replacement** **for** **a11y** **or** **functional** **tests**.
- **Invest** **in** **stable** **environments**.

---

## 17.9 Testing Best Practices

### User Behavior, Not Implementation

**Beginner Level**

**Ask** **“** **what** **would** **a** **user** **see/do?** **”** **and** **test** **that**.

**Real-time example**: **Social** **like** **count** **increments**, **not** **that** **`dispatch`** **called**.

**Intermediate Level**

**Avoid** **testing** **CSS** **class** **names** **unless** **they** **are** **contract** **(rare)**.

**Expert Level**

**Refactor** **internals** **freely** **when** **tests** **are** **behavioral**.

#### Key Points — User Behavior

- **Stable** **tests**, **happier** **teams**.

---

### Accessible Queries

**Beginner Level**

**Prefer** **`getByRole`**, **`getByLabelText`**. **Improves** **both** **tests** **and** **a11y**.

**Real-time example**: **Checkout** **form** **fields** **properly** **labeled**.

**Intermediate Level**

**If** **queries** **fail**, **fix** **the** **component** **accessibility**, **not** **only** **the** **test**.

**Expert Level**

**Pair** **with** **`jest-axe`** **(see** **Accessibility** **chapter)**.

#### Key Points — Accessible Queries

- **Tests** **mirror** **assistive** **technology**.

---

### Avoid Implementation Details

**Beginner Level**

**Do** **not** **assert** **on** **`useState`** **calls** **or** **private** **methods**.

**Real-time example**: **Todo** **list** **implementation** **switches** **from** **state** **to** **reducer**—**tests** **should** **still** **pass**.

**Intermediate Level**

**Mock** **children** **only** **when** **necessary** **for** **isolation**.

**Expert Level**

**Dangerously** **tight** **coupling** **to** **library** **internals** **(e.g.**, **React** **Fiber)** **is** **always** **fragile**.

#### Key Points — Implementation Details

- **Black** **box** **components**.

---

### Coverage Guidelines

**Beginner Level**

**Aim** **for** **meaningful** **coverage** **on** **critical** **modules**, **not** **a** **vanity** **number**.

**Real-time example**: **Payment** **calculation** **near** **100%**; **layout** **wrappers** **lower**.

**Intermediate Level**

**Track** **coverage** **trends** **over** **time**, **not** **absolute** **thresholds** **alone**.

**Expert Level**

**Mutation** **testing** **can** **find** **weak** **assertions**.

#### Key Points — Coverage Guidelines

- **Quality** **>** **quantity**.

---

### Accessibility Testing

**Beginner Level**

**Include** **automated** **a11y** **checks** **in** **component** **tests** **(`jest-axe`)**.

**Real-time example**: **Modal** **must** **not** **have** **focus** **traps** **broken** **(often** **E2E** **+** **manual)**.

**Intermediate Level**

**Combine** **with** **keyboard-only** **manual** **passes** **for** **releases**.

**Expert Level**

**Integrate** **axe** **in** **CI** **with** **severity** **thresholds**.

```tsx
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

it("has no obvious a11y violations", async () => {
  const { container } = render(<CheckoutStep />);
  expect(await axe(container)).toHaveNoViolations();
});
```

#### Key Points — Accessibility Testing

- **Automate** **basics**, **manual** **for** **complex** **flows**.

---

## Key Points (Chapter Summary)

- **Layer** **tests** **(unit**, **integration**, **E2E)** **by** **risk** **and** **cost**.
- **RTL** **+** **userEvent** **encode** **user-centric** **behavior**.
- **Jest** **provides** **structure**, **mocks**, **matchers**, **coverage**.
- **MSW** **makes** **network** **integration** **tests** **realistic**.
- **E2E** **(Cypress/Playwright)** **guards** **critical** **journeys**.
- **Visual** **tools** **catch** **styling** **regressions**.
- **Accessible** **queries** **and** **a11y** **checks** **raise** **quality** **for** **everyone**.

---

## Best Practices (Global)

- **Write** **tests** **that** **read** **like** **requirements** **for** **e-commerce**, **social**, **dashboard**, **todo**, **weather**, **and** **chat** **features**.
- **Prefer** **integration** **tests** **with** **real** **wiring** **and** **mocked** **HTTP** **at** **the** **edge**.
- **Keep** **tests** **fast**, **deterministic**, **and** **isolated** **with** **great** **fixtures**.
- **Use** **TypeScript** **types** **for** **props**, **API** **DTOs**, **and** **hook** **return** **values** **in** **tests**.
- **Run** **smoke** **E2E** **on** **main** **and** **gate** **releases** **on** **critical** **flows**.
- **Review** **flaky** **tests** **weekly**—**fix** **or** **delete**.
- **Pair** **snapshot** **tests** **with** **human** **judgment**—**avoid** **noise**.

---

## Common Mistakes to Avoid

- **Over-mocking** **internals** **so** **tests** **pass** **but** **integration** **breaks**.
- **Using** **`sleep`/fixed** **timeouts** **instead** **of** **`findBy`** **or** **proper** **waiting**.
- **Asserting** **on** **implementation** **details** **(state** **variable** **names**, **private** **hooks)**.
- **Ignoring** **async** **behavior**—**tests** **that** **pass** **by** **accident** **with** **act** **warnings**.
- **E2E** **for** **everything** **→** **slow**, **flaky** **suites**.
- **Treating** **coverage** **%** **as** **proof** **of** **correctness**.
- **Using** **`getByTestId`** **for** **everything** **instead** **of** **fixing** **accessibility**.
- **Not** **resetting** **MSW** **handlers** **between** **tests**, **causing** **cross-test** **pollution**.
- **Snapshot** **testing** **large** **DOM** **trees** **that** **change** **constantly**.
- **Skipping** **accessibility** **checks** **and** **assuming** **“** **looks** **fine** **”** **is** **enough**.

---
