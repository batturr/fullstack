# Routing in React (TypeScript + React Router)

**Client-side** **routing** maps **URLs** **to** **UI** **trees**, **enabling** **e-commerce** **catalog**/**checkout** **flows**, **social** **profiles**/**threads**, **analytics** **dashboards** **with** **deep** **links**, **todo** **lists** **per** **project**, **weather** **city** **routes**, **chat** **rooms**, and **admin** **CRUD** **screens**. **React** **Router** is **the** **de** **facto** **standard**; **alternatives** **exist** **for** **type-safe** **or** **minimal** **bundles**. This **chapter** **emphasizes** **v6** **patterns** **while** **documenting** **v5** **where** **migration** **matters**.

---

## 📑 Table of Contents

- [Routing in React (TypeScript + React Router)](#routing-in-react-typescript--react-router)
  - [📑 Table of Contents](#-table-of-contents)
  - [11.1 React Router Basics](#111-react-router-basics)
  - [11.2 Route Configuration](#112-route-configuration)
  - [11.3 Navigation](#113-navigation)
  - [11.4 Route Hooks](#114-route-hooks)
  - [11.5 Advanced Routing](#115-advanced-routing)
  - [11.6 Router Alternatives](#116-router-alternatives)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices (Global)](#best-practices-global)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 11.1 React Router Basics

### What Is React Router?

**Beginner Level**

**React** **Router** **keeps** **the** **address** **bar** **in** **sync** **with** **component** **trees**—**users** **bookmark**, **share**, **and** **navigate** **without** **full** **page** **reloads** (**SPA** **behavior**).

**Real-time example**: **E-commerce** **product** **URL** **`/products/:slug`** **opens** **the** **correct** **detail** **page** **on** **refresh**.

**Intermediate Level**

**History** **API** **(`pushState`)** **updates** **URL**; **router** **listens** **and** **renders** **matching** **routes**.

**Expert Level**

**Data** **routers** (**`createBrowserRouter`**) **integrate** **loaders**/**actions** **(Remix-style)** **for** **fetch-on-navigation** **patterns**.

#### Key Points — What Is RR

- **URL** **is** **part** **of** **UX** **and** **state**.
- **Enables** **deep** **linking** **for** **support** **and** **SEO** **strategies** **(with** **SSR/SSG)**.
- **Core** **concepts**: **location**, **history**, **matching**, **outlets**.

---

### Installing React Router

**Beginner Level**

**`npm i react-router-dom`** **(web)** **or** **`react-router`** **(core)**—**for** **browser** **apps** **use** **`react-router-dom`**.

**Real-time example**: **Social** **web** **app** **bootstrapped** **with** **Vite** **adds** **router** **for** **feed**/**profile** **routes**.

**Intermediate Level**

**Peer** **dependency** **on** **matching** **React** **major**—**read** **release** **notes** **when** **upgrading**.

**Expert Level**

**Pin** **versions** **across** **monorepo** **packages** **to** **avoid** **duplicate** **router** **context**.

```bash
npm install react-router-dom
```

#### Key Points — Install

- **Use** **`react-router-dom`** **for** **`<BrowserRouter>`** **and** **`<Link>`**.
- **Keep** **router** **version** **aligned** **with** **framework** **(Remix** **bundles** **its** **own** **integration)**.
- **TypeScript** **types** **ship** **with** **the** **package**.

---

### `BrowserRouter` vs `HashRouter`

**Beginner Level**

**`BrowserRouter`** **uses** **clean** **URLs** **`/inbox`**. **`HashRouter`** **uses** **`#/inbox`**—**older** **hosts** **without** **SPA** **fallback** **sometimes** **required** **hash** **mode**.

**Real-time example**: **Internal** **dashboard** **on** **legacy** **static** **hosting** **may** **still** **use** **`HashRouter`** **to** **avoid** **server** **rewrite** **rules**.

**Intermediate Level**

**`BrowserRouter`** **needs** **server** **configuration** **to** **serve** **`index.html`** **for** **unknown** **paths**.

**Expert Level**

**Basename** **prop** **for** **deploying** **under** **subpaths** **`/app`**.

```tsx
import { BrowserRouter } from "react-router-dom";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}
```

```tsx
import { HashRouter } from "react-router-dom";

export function EmbeddedWidgetApp({ children }: { children: React.ReactNode }) {
  return <HashRouter>{children}</HashRouter>;
}
```

#### Key Points — Browser vs Hash

- **Prefer** **`BrowserRouter`** **for** **modern** **deployments**.
- **`HashRouter`** **avoids** **server** **config** **but** **URLs** **are** **uglier** **and** **may** **interact** **badly** **with** **analytics**.
- **Set** **`basename`** **when** **not** **mounted** **at** **domain** **root**.

---

### React Router v5 vs v6 (Mental Model Shift)

**Beginner Level**

**v6** **is** **component** **driven** **with** **`<Routes>`** **and** **nested** **`<Route>`** **trees**; **v5** **used** **`<Switch>`** **and** **patterns** **like** **`<Route render>`**.

**Real-time example**: **E-commerce** **migrates** **from** **v5** **to** **v6** **for** **better** **nested** **route** **composition**.

**Intermediate Level**

**Breaking** **changes**: **`useHistory` → `useNavigate`**, **`Redirect` → `<Navigate>`**, **`component`/`render` → `element`**.

**Expert Level**

**Data** **APIs** **`createBrowserRouter`** **optional**—**enables** **loaders**, **errorElements**, **and** **fetch** **deduping**.

#### Key Points — v5 vs v6

- **Prefer** **v6** **for** **new** **projects**.
- **Migration** **guide** **is** **official**—**automate** **with** **codemods** **where** **possible**.
- **Test** **navigation** **and** **scroll** **behavior** **after** **upgrade**.

---

## 11.2 Route Configuration

### `<Route>` in v5 (Legacy Pattern)

**Beginner Level**

**`<Switch>`** **matches** **first** **`<Route path>`** **that** **fits** **and** **renders** **one** **branch**.

**Real-time example**: **Legacy** **todo** **app** **route** **`/lists/:id`** **shows** **list** **detail**.

**Intermediate Level**

**`exact`** **prop** **controls** **strict** **matching** **behavior** **(v5)**.

**Expert Level**

**Avoid** **new** **v5** **projects**—**maintain** **only** **until** **migration**.

```tsx
// Illustrative v5-style — do not use in new apps
import { Switch, Route } from "react-router-dom";

export function LegacyRoutes() {
  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/users/:id" component={UserPage} />
    </Switch>
  );
}

function Home() {
  return <div>Home</div>;
}
function UserPage() {
  return <div>User</div>;
}
```

#### Key Points — v5 Route

- **`Switch`** **name** **implies** **exclusive** **matching**.
- **Migration** **to** **v6** **replaces** **`Switch` → `Routes`** **and** **updates** **props**.
- **Tests** **may** **need** **`Router`** **wrappers** **with** **custom** **history**.

---

### `<Routes>` + `<Route element>` in v6

**Beginner Level**

**`<Routes>`** **contains** **`<Route path element>`** **pairs**—**`element`** **is** **a** **ReactNode**, **not** **a** **component** **reference** **only**.

**Real-time example**: **Social** **app** **defines** **`/`**, **`/explore`**, **`/messages`** **routes**.

**Intermediate Level**

**Relative** **routes** **nest** **inside** **parents** **with** **`<Outlet />`**.

**Expert Level**

**Route** **objects** **via** **`useRoutes`** **or** **`createBrowserRouter`** **for** **larger** **apps**.

```tsx
import { Routes, Route } from "react-router-dom";
import { FeedPage } from "./pages/FeedPage";
import { ExplorePage } from "./pages/ExplorePage";

export function SocialRoutes() {
  return (
    <Routes>
      <Route path="/" element={<FeedPage />} />
      <Route path="/explore" element={<ExplorePage />} />
    </Routes>
  );
}
```

#### Key Points — Routes v6

- **`element`** **prop** **accepts** **JSX**—**pass** **props** **directly**.
- **Ranking** **algorithm** **picks** **best** **match**—**not** **just** **first** **in** **list** **like** **v5** **Switch** **(understand** **priority** **section)**.
- **Nest** **layouts** **with** **parent** **routes** **and** **`<Outlet>`**.

---

### Path Matching Rules

**Beginner Level**

**Paths** **like** **`/shop`** **match** **locations** **starting** **with** **that** **prefix** **unless** **configured** **otherwise**—**use** **nested** **routes** **for** **clarity**.

**Real-time example**: **E-commerce** **`/checkout/payment`** **nested** **under** **`/checkout`**.

**Intermediate Level**

**Trailing** **slashes** **behavior** **depends** **on** **router** **config**—**normalize** **URLs** **at** **boundaries**.

**Expert Level**

**Optional** **segments** **and** **splats** **(see** **below)** **compose** **advanced** **patterns**.

#### Key Points — Matching

- **Prefer** **explicit** **nested** **route** **trees** **over** **giant** **flat** **paths**.
- **Test** **edge** **cases** **with** **query** **strings** **and** **encoded** **segments**.
- **Understand** **relative** **vs** **absolute** **paths** **inside** **nested** **trees**.

---

### Index Routes

**Beginner Level**

**`<Route index element={<DashboardHome/>} />`** **renders** **at** **parent** **path** **without** **extra** **segment**.

**Real-time example**: **`/dashboard`** **shows** **summary** **widgets**; **`/dashboard/reports`** **shows** **reports**.

**Intermediate Level**

**Index** **routes** **pair** **with** **layout** **routes** **using** **`<Outlet>`**.

**Expert Level**

**Breadcrumb** **generators** **read** **route** **matches** **including** **index** **flags**.

```tsx
import { Outlet, Route, Routes } from "react-router-dom";

function DashboardLayout() {
  return (
    <div className="dashboard">
      <aside>Nav</aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<p>Overview widgets</p>} />
        <Route path="reports" element={<p>Reports</p>} />
      </Route>
    </Routes>
  );
}
```

#### Key Points — Index Routes

- **Cleaner** **URLs** **without** **dummy** **segments**.
- **Great** **for** **default** **child** **views** **in** **nested** **navigation**.
- **Remember** **`<Outlet>`** **placement** **in** **parent** **layout**.

---

### Nested Routes

**Beginner Level**

**Parent** **route** **renders** **shell** **with** **`<Outlet />`**; **child** **routes** **render** **inside** **the** **outlet**.

**Real-time example**: **Chat** **app** **`/c/:channelId/*`** **shows** **channel** **sidebar** **+** **thread** **pane**.

**Intermediate Level**

**Relative** **paths** **inside** **parents** **avoid** **repeating** **prefixes**.

**Expert Level**

**Preserve** **scroll** **regions** **independently** **for** **sidebar** **vs** **main** **with** **layout** **CSS** **and** **keys**.

```tsx
import { NavLink, Outlet, Route, Routes } from "react-router-dom";

function ChatLayout() {
  return (
    <div className="grid grid-cols-[240px_1fr]">
      <nav className="border-r p-2">
        <NavLink to="/c/general">#general</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}

export function ChatRoutes() {
  return (
    <Routes>
      <Route path="/c" element={<ChatLayout />}>
        <Route path=":channelId" element={<ChannelPane />} />
      </Route>
    </Routes>
  );
}

function ChannelPane() {
  return <div className="p-4">Thread + composer</div>;
}
```

#### Key Points — Nested Routes

- **Share** **layout** **state** **without** **prop** **drilling** **via** **context** **or** **router** **loaders**.
- **Use** **`<Outlet>`** **for** **the** **nested** **render** **slot**.
- **Align** **with** **lazy** **loading** **per** **segment** **(§11.5)**.

---

### Dynamic Segments & URL Params

**Beginner Level**

**`:productId`** **declares** **a** **parameter** **read** **with** **`useParams()`**.

**Real-time example**: **E-commerce** **`/p/:slug`** **loads** **product** **details** **for** **SEO-friendly** **URLs**.

**Intermediate Level**

**Type** **params** **with** **generics** **or** **runtime** **validation** **(zod)** **at** **route** **boundary**.

**Expert Level**

**Encode** **IDs** **carefully**—**avoid** **leaking** **sequential** **ints** **if** **enumeration** **is** **a** **risk** **(security** **topic)**.

```tsx
import { useParams } from "react-router-dom";

type ProductParams = { slug: string };

export function ProductPage() {
  const { slug } = useParams<ProductParams>();
  if (!slug) return <p>Missing product</p>;
  return <h1>Product: {slug}</h1>;
}
```

#### Key Points — Params

- **Always** **handle** **missing** **params** **defensively**.
- **Prefer** **slugs** **over** **opaque** **IDs** **in** **public** **URLs** **when** **possible**.
- **Normalize** **case** **sensitivity** **policy** **(lower-case** **slugs)**.

---

### Optional Parameters

**Beginner Level**

**Optional** **segments** **can** **be** **modeled** **with** **multiple** **routes** **or** **query** **params**—**React** **Router** **v6** **does** **not** **use** **`:param?`** **syntax** **like** **some** **frameworks**.

**Real-time example**: **Weather** **app** **`/weather/:city`** **or** **`/weather`** **defaulting** **to** **geolocation**.

**Intermediate Level**

**Use** **two** **routes** **with** **shared** **element** **or** **parse** **optional** **info** **from** **search** **params**.

**Expert Level**

**TanStack** **Router** **has** **richer** **optional** **path** **grammar**—**compare** **§11.6**.

```tsx
import { Route, Routes } from "react-router-dom";
import { WeatherView } from "./WeatherView";

export function WeatherRoutes() {
  return (
    <Routes>
      <Route path="/weather" element={<WeatherView />} />
      <Route path="/weather/:city" element={<WeatherView />} />
    </Routes>
  );
}
```

#### Key Points — Optional Params

- **Explicit** **duplicate** **routes** **can** **be** **clearer** **than** **clever** **regex**.
- **Query** **strings** **often** **better** **for** **optional** **filters** **than** **path** **segments**.
- **Document** **canonical** **URL** **strategy** **for** **SEO**.

---

### Wildcard / Splats (`*`)

**Beginner Level**

**`*`** **captures** **the** **“rest”** **of** **the** **path**—**useful** **for** **nested** **CMS** **paths** **or** **file-like** **routes**.

**Real-time example**: **Docs** **site** **`/docs/*`** **hands** **off** **to** **markdown** **renderer**.

**Intermediate Level**

**Access** **via** **`useParams()`** **with** **`*` key** **depending** **on** **RR** **version** **—** **verify** **API** **in** **your** **installed** **version**.

**Expert Level**

**Combine** **with** **lazy** **loading** **for** **large** **doc** **trees**.

```tsx
import { Route, Routes } from "react-router-dom";
import { DocsCatchAll } from "./DocsCatchAll";

export function DocsRoutes() {
  return (
    <Routes>
      <Route path="/docs/*" element={<DocsCatchAll />} />
    </Routes>
  );
}
```

#### Key Points — Wildcards

- **Great** **for** **unknown-depth** **paths**.
- **Ensure** **404** **handling** **inside** **the** **catch-all** **component**.
- **Beware** **SEO** **implications** **for** **infinite** **URL** **spaces**.

---

### Route Priority & Ranking

**Beginner Level**

**v6** **picks** **the** **most** **specific** **matching** **route** **rather** **than** **pure** **first-match** **ordering** **in** **many** **cases**—**still**, **order** **can** **matter** **for** **ties**.

**Real-time example**: **Admin** **`/admin/users/new`** **vs** **`/admin/users/:id`** **specificity**.

**Intermediate Level**

**Use** **nested** **routes** **to** **reduce** **ambiguous** **ranking**.

**Expert Level**

**For** **complex** **rules**, **centralize** **route** **config** **in** **arrays** **processed** **by** **`useRoutes`**.

#### Key Points — Priority

- **Test** **competing** **patterns** **with** **integration** **tests**.
- **Prefer** **explicit** **structure** **over** **regex** **sprawl**.
- **Read** **official** **“Ranking** **Routes”** **doc** **for** **edge** **cases**.

---

## 11.3 Navigation

### `<Link>` Component

**Beginner Level**

**`<Link to="/inbox">`** **navigates** **without** **full** **reload**, **preserving** **SPA** **state**.

**Real-time example**: **Social** **bottom** **nav** **tabs** **switch** **views** **instantly**.

**Intermediate Level**

**`to` can be an object** **with** **`pathname`**, **`search`**, **`hash`** for **structured** **navigation**.

**Expert Level**

**Prefetch** **patterns** **(Remix/React** **Router** **future** **flags)** **—** **check** **current** **API** **for** **data** **routers**.

```tsx
import { Link } from "react-router-dom";

export function MainNav() {
  return (
    <nav aria-label="Primary">
      <Link to="/">Home</Link>
      <Link to={{ pathname: "/search", search: "?q=shoes" }}>Search shoes</Link>
    </nav>
  );
}
```

#### Key Points — Link

- **Prefer** **`Link`** **over** **`<a href>`** **for** **internal** **navigation**.
- **Use** **`relative`** **prop** **(v6.4+)** **for** **nested** **links** **carefully**.
- **External** **links** **still** **use** **`<a target`/`rel>`**.

---

### `<NavLink>` (Active Styling)

**Beginner Level**

**`className`/`style` as functions** **receive** **`{ isActive, isPending }`** **to** **highlight** **current** **tab**.

**Real-time example**: **Dashboard** **sidebar** **shows** **active** **section**.

**Intermediate Level**

**`end` prop** **controls** **whether** **child** **paths** **activate** **the** **link**.

**Expert Level**

**Combine** **with** **design** **tokens** **for** **consistent** **focus** **and** **active** **states**.

```tsx
import { NavLink } from "react-router-dom";

export function DashboardNav() {
  return (
    <nav aria-label="Dashboard">
      <NavLink
        to="/dashboard"
        end
        className={({ isActive }) => (isActive ? "navlink navlink--active" : "navlink")}
      >
        Overview
      </NavLink>
      <NavLink
        to="/dashboard/reports"
        className={({ isActive }) => (isActive ? "navlink navlink--active" : "navlink")}
      >
        Reports
      </NavLink>
    </nav>
  );
}
```

#### Key Points — NavLink

- **Accessible** **navigation** **landmarks** **pair** **well** **with** **`aria-current="page"`** **patterns**.
- **`end`** **prevents** **parent** **activation** **on** **child** **routes**.
- **Consider** **pending** **states** **for** **slow** **transitions**.

---

### `<Navigate>` (v6 Redirect Replacement)

**Beginner Level**

**`<Navigate to="/login" replace />`** **performs** **navigation** **during** **render**—**useful** **for** **guards**.

**Real-time example**: **Logged-out** **user** **visiting** **`/checkout`** **redirects** **to** **`/login`**.

**Intermediate Level**

**Prefer** **loader**/**action** **redirects** **in** **data** **routers** **for** **cleaner** **data** **sync**.

**Expert Level**

**Avoid** **infinite** **redirect** **loops**—**guard** **conditions** **carefully**.

```tsx
import { Navigate } from "react-router-dom";

export function RequireAuth({ userId, children }: { userId: string | null; children: React.ReactNode }) {
  if (!userId) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

#### Key Points — Navigate

- **`replace`** **avoids** **polluting** **history** **with** **bounce** **pages**.
- **Use** **sparingly** **inside** **render**—**prefer** **dedicated** **guard** **components** **or** **data** **router** **throws**.
- **Combine** **with** **location** **state** **for** **post-login** **return** **URLs**.

---

### Programmatic Navigation (`useNavigate` v6)

**Beginner Level**

**`const nav = useNavigate(); nav('/cart')`** **navigates** **from** **event** **handlers**.

**Real-time example**: **E-commerce** **“Add** **to** **cart”** **then** **optional** **redirect** **to** **cart** **drawer**.

**Intermediate Level**

**`navigate(-1)`** **history** **back**; **`{ replace: true }`** **option**.

**Expert Level**

**Pass** **`state`** **for** **wizard** **flows** **between** **steps** **(ephemeral)**.

```tsx
import { useNavigate } from "react-router-dom";

export function AddToCartButton({ onAdded }: { onAdded?: () => void }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => {
        // ... mutate cart
        onAdded?.();
        navigate("/cart", { replace: false });
      }}
    >
      Add to cart
    </button>
  );
}
```

#### Key Points — useNavigate

- **Do** **not** **navigate** **unconditionally** **during** **render**—**use** **effects** **or** **events** **unless** **using** **`<Navigate>`**.
- **Type** **routes** **with** **helpers** **in** **larger** **apps**.
- **Handle** **blocked** **navigation** **for** **unsaved** **forms** **(prompt** **patterns)**.

---

### `useHistory` (v5) — Legacy

**Beginner Level**

**`history.push('/x')`** **imperative** **navigation** **in** **v5**.

**Real-time example**: **Legacy** **admin** **app** **still** **on** **v5** **maintenance** **mode**.

**Intermediate Level**

**Migrate** **to** **`useNavigate`** **with** **mapping** **table** **for** **options**.

**Expert Level**

**Custom** **history** **objects** **for** **tests**—**still** **possible** **but** **patterns** **changed**.

```tsx
// v5 illustrative
import { useHistory } from "react-router-dom";

export function LegacyNext() {
  const history = useHistory();
  return (
    <button type="button" onClick={() => history.push("/step-2")}>
      Next
    </button>
  );
}
```

#### Key Points — useHistory

- **Do** **not** **use** **in** **new** **v6** **code**.
- **Testing** **utilities** **differ** **between** **versions**.
- **Plan** **migration** **early** **if** **on** **v5**.

---

### `<Redirect>` (v5) vs `<Navigate>` (v6)

**Beginner Level**

**`<Redirect from="/old" to="/new" />`** **(v5)** **→** **`<Route path="/old" element={<Navigate to="/new" replace />} />`** **or** **nested** **redirect** **routes** **in** **v6**.

**Real-time example**: **Marketing** **URL** **changes** **preserve** **SEO** **with** **301** **at** **server**—**client** **redirect** **for** **in-app** **only**.

**Intermediate Level**

**Server** **redirects** **matter** **for** **search** **engines**—**client** **alone** **is** **insufficient** **for** **canonical** **URLs**.

**Expert Level**

**Use** **hosting** **platform** **redirect** **rules** **for** **permanent** **moves**.

#### Key Points — Redirect

- **Pair** **client** **and** **server** **strategies**.
- **Avoid** **chains** **of** **redirects**—**bad** **for** **performance** **and** **UX**.
- **Test** **deep** **links** **after** **changes**.

---

### History `replace` Semantics

**Beginner Level**

**`replace: true`** **swaps** **current** **history** **entry**—**back** **button** **skips** **intermediate** **pages**.

**Real-time example**: **Login** **success** **replaces** **`/login`** **so** **back** **does** **not** **return** **to** **login** **form**.

**Intermediate Level**

**Use** **after** **mutations** **that** **should** **not** **be** **replayed**.

**Expert Level**

**Combine** **with** **`flushSync`** **carefully** **(rare)**—**usually** **unnecessary**.

```tsx
import { useNavigate } from "react-router-dom";

export function LoginSuccess() {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate("/app", { replace: true })}>
      Continue
    </button>
  );
}
```

#### Key Points — Replace

- **Improves** **UX** **after** **auth** **or** **wizard** **completion**.
- **Overuse** **can** **confuse** **users** **expecting** **history** **entries**.
- **Document** **when** **your** **app** **uses** **replace** **vs** **push**.

---

## 11.4 Route Hooks

### `useParams`

**Beginner Level**

**Reads** **dynamic** **segments** **from** **current** **match**—**returns** **object** **of** **strings**.

**Real-time example**: **Chat** **`channelId`** **from** **URL**.

**Intermediate Level**

**Union** **routes** **may** **mean** **params** **differ**—**narrow** **with** **route** **specific** **components**.

**Expert Level**

**Validate** **params** **with** **zod** **before** **fetching** **data**.

```tsx
import { useParams } from "react-router-dom";

export function ThreadPage() {
  const { channelId, threadId } = useParams<{ channelId: string; threadId: string }>();
  if (!channelId || !threadId) return null;
  return (
    <div>
      Channel {channelId} — Thread {threadId}
    </div>
  );
}
```

#### Key Points — useParams

- **Never** **trust** **param** **strings** **as** **authorization**—**verify** **server-side**.
- **Handle** **optional** **params** **explicitly**.
- **Works** **inside** **matching** **route** **components** **only**.

---

### `useLocation`

**Beginner Level**

**Provides** **`pathname`**, **`search`**, **`hash`**, **`state`**—**useful** **for** **analytics** **and** **return** **URLs**.

**Real-time example**: **E-commerce** **tracks** **page** **views** **on** **`location.pathname`**.

**Intermediate Level**

**Parse** **`search`** **with** **`URLSearchParams`**.

**Expert Level**

**Scroll** **restoration** **reads** **`location.key`** **in** **advanced** **setups**.

```tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function PageViewBeacon() {
  const location = useLocation();

  useEffect(() => {
    // send analytics event
    console.log("route", location.pathname);
  }, [location.pathname]);

  return null;
}
```

#### Key Points — useLocation

- **`location.state`** **is** **ephemeral**—**do** **not** **rely** **on** **it** **for** **deep** **linking**.
- **Combine** **with** **`useNavigationType`** **(data** **router)** **for** **fine-grained** **analytics**.
- **Memoize** **derived** **values** **from** **`search`** **carefully**.

---

### `useSearchParams` (v6)

**Beginner Level**

**Like** **`useState`** **for** **query** **string**—**getter/setter** **API** **for** **`URLSearchParams`**.

**Real-time example**: **Dashboard** **filters** **`?range=7d&region=eu`**.

**Intermediate Level**

**Setter** **replaces** **params**—**merge** **carefully** **to** **preserve** **unrelated** **keys**.

**Expert Level**

**Integrate** **with** **server** **pagination** **contracts** **and** **shareable** **URLs**.

```tsx
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

type Range = "7d" | "30d";

export function FiltersBar() {
  const [params, setParams] = useSearchParams();
  const range = useMemo((): Range => {
    const v = params.get("range");
    return v === "30d" ? "30d" : "7d";
  }, [params]);

  return (
    <div>
      <label>
        Range
        <select
          value={range}
          onChange={(e) => {
            const next = new URLSearchParams(params);
            next.set("range", e.target.value as Range);
            setParams(next);
          }}
        >
          <option value="7d">7 days</option>
          <option value="30d">30 days</option>
        </select>
      </label>
    </div>
  );
}
```

#### Key Points — useSearchParams

- **Great** **for** **filters** **and** **sort** **orders**.
- **Avoid** **storing** **sensitive** **data** **in** **query** **strings**.
- **Consider** **`replace`** **option** **when** **updating** **filters** **rapidly**.

---

### `useMatch` (v6)

**Beginner Level**

**Returns** **match** **info** **for** **a** **given** **pattern** **at** **current** **location**—**useful** **for** **nested** **menus** **and** **breadcrumbs**.

**Real-time example**: **Admin** **highlights** **“Settings”** **when** **URL** **matches** **`/admin/settings/*`**.

**Intermediate Level**

**Returns** **`null`** **when** **no** **match**.

**Expert Level**

**Combine** **with** **`matchPath`** **utilities** **for** **non-hook** **contexts**.

```tsx
import { useMatch } from "react-router-dom";

export function SettingsTabLink() {
  const match = useMatch("/admin/settings/*");
  const active = Boolean(match);
  return (
    <a className={active ? "tab tab--active" : "tab"} href="/admin/settings">
      Settings
    </a>
  );
}
```

#### Key Points — useMatch

- **Prefer** **`NavLink`** **for** **simple** **cases**.
- **Use** **`useMatch`** **for** **custom** **matching** **rules** **or** **non-link** **UI**.
- **Pattern** **strings** **must** **align** **with** **route** **definitions**.

---

### `useRoutes`

**Beginner Level**

**Declarative** **route** **objects** **rendered** **via** **hook**—**alternative** **to** **`<Routes>`** **JSX**.

**Real-time example**: **Large** **e-commerce** **app** **generates** **route** **table** **from** **config** **files**.

**Intermediate Level**

**Helps** **split** **routing** **across** **feature** **packages** **(merge** **arrays)**.

**Expert Level**

**Pair** **with** **lazy** **imports** **for** **code** **splitting**.

```tsx
import type { RouteObject } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import { lazy } from "react";

const Reports = lazy(() => import("./pages/Reports"));

const routes: RouteObject[] = [
  {
    path: "/dashboard",
    element: <div>Layout placeholder</div>,
    children: [{ path: "reports", element: <Reports /> }],
  },
];

export function DashboardRouteTable() {
  return useRoutes(routes);
}
```

#### Key Points — useRoutes

- **Enables** **data-driven** **routing**.
- **Type** **`RouteObject[]`** **for** **safety**.
- **Ensure** **suspense** **boundaries** **around** **lazy** **routes**.

---

## 11.5 Advanced Routing

### Protected Routes

**Beginner Level**

**Wrap** **routes** **with** **components** **that** **check** **auth** **and** **render** **`<Navigate>`** **otherwise**.

**Real-time example**: **SaaS** **dashboard** **requires** **signed-in** **user**.

**Intermediate Level**

**Preserve** **`location`** **for** **post-login** **redirect** **using** **`state`**.

**Expert Level**

**Server** **session** **validation** **must** **mirror** **client** **guards**.

```tsx
import { Navigate, useLocation } from "react-router-dom";

export function Protected({ userId, children }: { userId: string | null; children: React.ReactNode }) {
  const location = useLocation();
  if (!userId) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
```

#### Key Points — Protected Routes

- **Client** **routing** **is** **not** **security** **by** **itself**.
- **Avoid** **flash** **of** **protected** **content** **during** **auth** **loading**.
- **Test** **deep** **links** **with** **expired** **sessions**.

---

### Route Guards (Patterns)

**Beginner Level**

**Guards** **centralize** **access** **rules** **(auth**, **roles**, **feature** **flags)** **before** **entering** **routes**.

**Real-time example**: **Admin** **section** **requires** **`role=admin`**.

**Intermediate Level**

**Data** **routers** **support** **`loader`** **guards** **that** **run** **before** **render**.

**Expert Level**

**Combine** **with** **query** **cache** **(TanStack** **Query)** **to** **avoid** **request** **waterfalls**.

```tsx
import { Navigate } from "react-router-dom";

type Role = "member" | "admin";

export function AdminGuard({ role, children }: { role: Role; children: React.ReactNode }) {
  if (role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}
```

#### Key Points — Guards

- **Single** **policy** **module** **for** **permissions** **reduces** **drift**.
- **Log** **denied** **access** **attempts** **for** **security** **monitoring**.
- **Align** **error** **pages** **with** **HTTP** **403** **semantics** **where** **possible**.

---

### Lazy Loading Routes (`React.lazy` + `Suspense`)

**Beginner Level**

**`const Page = lazy(() => import('./Page'))`** **splits** **bundle**—**wrap** **with** **`<Suspense fallback=...>`**.

**Real-time example**: **Heavy** **dashboard** **reports** **route** **loads** **only** **when** **visited**.

**Intermediate Level**

**Prefetch** **on** **hover** **for** **critical** **journeys** **(custom)**.

**Expert Level**

**Error** **boundaries** **around** **lazy** **routes** **catch** **chunk** **load** **failures**.

```tsx
import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const Analytics = lazy(() => import("./pages/Analytics"));

export function LazyAnalyticsRoute() {
  return (
    <Routes>
      <Route
        path="/analytics"
        element={
          <Suspense fallback={<p>Loading analytics…</p>}>
            <Analytics />
          </Suspense>
        }
      />
    </Routes>
  );
}
```

#### Key Points — Lazy Routes

- **Improves** **initial** **load** **time** **dramatically**.
- **Provide** **meaningful** **fallbacks** **matching** **layout** **shells**.
- **Handle** **network** **errors** **when** **dynamic** **import** **fails**.

---

### Route Transitions

**Beginner Level**

**Animate** **`Outlet`** **changes** **with** **Framer** **Motion** **`AnimatePresence`** **and** **location** **keys**.

**Real-time example**: **Social** **tab** **switches** **with** **subtle** **fade**.

**Intermediate Level**

**Key** **by** **`location.pathname`** **to** **force** **transition** **on** **route** **change**.

**Expert Level**

**Respect** **`prefers-reduced-motion`**—**disable** **animations** **when** **needed**.

```tsx
import { AnimatePresence, motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";

export function AnimatedOutlet() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
```

#### Key Points — Transitions

- **Avoid** **layout** **thrash**—**measure** **performance**.
- **Coordinate** **scroll** **position** **with** **transitions**.
- **Test** **with** **keyboard** **navigation** **and** **focus**.

---

### Scroll Restoration

**Beginner Level**

**Browsers** **restore** **scroll** **on** **back/forward**, **but** **SPA** **navigation** **may** **need** **manual** **`window.scrollTo(0,0)`**.

**Real-time example**: **E-commerce** **search** **results** **scroll** **to** **top** **on** **new** **query**.

**Intermediate Level**

**Use** **`useLayoutEffect`** **with** **`location`** **changes** **to** **control** **scroll**.

**Expert Level**

**Preserve** **scroll** **per** **nested** **outlet** **with** **ref** **containers** **and** **keys**.

```tsx
import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const location = useLocation();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.key]);
  return null;
}
```

#### Key Points — Scroll Restoration

- **Different** **products** **need** **different** **policies** **(modals** **vs** **pages)**.
- **Consider** **accessibility** **when** **moving** **focus** **on** **navigation**.
- **Long** **lists** **may** **need** **virtualization** **plus** **scroll** **memory**.

---

### 404 / Not Found Pages

**Beginner Level**

**`<Route path="*" element={<NotFound/>} />`** **catches** **unknown** **paths**.

**Real-time example**: **Marketing** **site** **shows** **helpful** **404** **with** **search** **and** **support** **links**.

**Intermediate Level**

**Emit** **correct** **HTTP** **404** **on** **SSR** **for** **SEO**—**client** **route** **alone** **returns** **200** **unless** **server** **cooperates**.

**Expert Level**

**Log** **404** **paths** **to** **detect** **broken** **campaign** **links**.

```tsx
import { Route, Routes } from "react-router-dom";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="*" element={<p>404 — page not found</p>} />
    </Routes>
  );
}
```

#### Key Points — 404

- **User-friendly** **copy** **reduces** **bounce** **rate**.
- **SSR** **must** **set** **status** **codes** **properly**.
- **Avoid** **catch-all** **shadowing** **valid** **nested** **routes**—**ordering** **matters**.

---

## 11.6 Router Alternatives

### TanStack Router

**Beginner Level**

**Type-safe** **routing** **with** **search** **param** **schemas** **and** **strong** **link** **helpers**.

**Real-time example**: **Dashboard** **with** **complex** **typed** **filters** **in** **the** **URL**.

**Intermediate Level**

**Built-in** **loaders** **and** **context** **patterns** **overlap** **with** **React** **Query**.

**Expert Level**

**Excellent** **for** **large** **TS** **codebases** **where** **URL** **is** **part** **of** **API**.

```tsx
// Conceptual — see TanStack Router docs for exact APIs
declare const RouterProvider: React.ComponentType<{ router: unknown }>;
declare const router: unknown;

export function Root() {
  return <RouterProvider router={router} />;
}
```

#### Key Points — TanStack Router

- **Best-in-class** **URL** **typing**.
- **Learning** **curve** **higher** **than** **RR** **for** **simple** **apps**.
- **Evaluate** **bundle** **size** **trade-offs**.

---

### Wouter

**Beginner Level**

**Tiny** **1kB** **router** **alternative** **for** **minimal** **SPAs** **and** **embeds**.

**Real-time example**: **Weather** **widget** **embedded** **in** **third-party** **site** **with** **few** **routes**.

**Intermediate Level**

**Fewer** **features** **than** **RR**—**check** **nested** **route** **needs**.

**Expert Level**

**Great** **when** **bundle** **size** **is** **the** **top** **constraint**.

#### Key Points — Wouter

- **Minimal** **API** **surface**.
- **May** **require** **more** **manual** **patterns** **for** **complex** **apps**.
- **Assess** **maintenance** **and** **community** **support**.

---

### Reach Router (Legacy)

**Beginner Level**

**Predecessor** **merged** **into** **React** **Router** **v6**—**do** **not** **start** **new** **projects** **on** **Reach**.

**Real-time example**: **Legacy** **internal** **tools** **still** **being** **migrated**.

**Intermediate Level**

**Migration** **path** **documented** **by** **React** **Router** **team**.

**Expert Level**

**Prioritize** **security** **updates** **by** **moving** **to** **supported** **versions**.

#### Key Points — Reach Legacy

- **Historical** **interest** **only**.
- **Use** **RR** **v6+** **for** **new** **work**.
- **Test** **thoroughly** **when** **migrating** **old** **code**.

---

## Key Points (Chapter Summary)

- **React** **Router** **v6** **centers** **on** **`<Routes>`**, **nested** **layouts**, **and** **hooks** **`useNavigate`**, **`useParams`**, **`useSearchParams`**.
- **URLs** **should** **reflect** **user** **mental** **models** **and** **support** **sharing** **deep** **links**.
- **Guards** **and** **lazy** **loading** **are** **standard** **production** **patterns**.
- **Alternatives** **like** **TanStack** **Router** **excel** **at** **type-safe** **search** **params**.
- **Server** **configuration** **and** **HTTP** **status** **codes** **matter** **for** **SEO** **and** **404s**.

---

## Best Practices (Global)

1. **Colocate** **route** **definitions** **with** **feature** **folders** **or** **central** **registry**—**pick** **one** **strategy**.
2. **Use** **`NavLink`/`useMatch`** **for** **active** **states** **instead** **of** **string** **includes** **on** **`pathname`** **when** **possible**.
3. **Validate** **params** **and** **search** **values** **before** **fetching** **data**.
4. **Prefer** **`replace`** **after** **auth** **redirects** **to** **avoid** **history** **traps**.
5. **Lazy** **load** **heavy** **routes** **and** **show** **skeleton** **fallbacks**.
6. **Plan** **scroll** **and** **focus** **management** **for** **SPA** **accessibility**.
7. **Align** **client** **routes** **with** **server** **rewrites** **and** **canonical** **URLs**.

---

## Common Mistakes to Avoid

1. **Using** **`<a href>`** **for** **internal** **navigation** **and** **losing** **SPA** **state**.
2. **Forgetting** **`basename`** **when** **hosting** **under** **subpaths**.
3. **Infinite** **redirect** **loops** **in** **guards** **due** **to** **unstable** **conditions**.
4. **Not** **handling** **lazy** **import** **failures** **on** **bad** **networks**.
5. **Relying** **on** **`location.state`** **for** **critical** **business** **logic** **(lost** **on** **refresh)**.
6. **Incorrect** **404** **behavior** **on** **SSR** **(always** **200)** **hurting** **SEO**.
7. **Assuming** **v5** **and** **v6** **APIs** **are** **interchangeable** **without** **migration**.

---

_Combine with **Data Fetching** (loaders/query), **Conditional Rendering** (guards), and **Styling** (layouts)._
