# Next.js Client Components

**Client Components** are React components marked with **`'use client'`** that **hydrate** in the browser, enabling **hooks**, **events**, and **browser APIs**. In the **App Router**, they are **deliberate islands** within a **server-first** app. This guide covers **boundaries**, **patterns**, **third-party** integration, **optimization**, and **client↔server** **mutations**—with **SaaS**, **e-commerce**, **dashboard**, and **social** examples.

---

## 📑 Table of Contents

1. [5.1 Client Component Basics](#51-client-component-basics)
2. [5.2 Client-Only Features](#52-client-only-features)
3. [5.3 Client Component Patterns](#53-client-component-patterns)
4. [5.4 Third-party Libraries](#54-third-party-libraries)
5. [5.5 Client Component Optimization](#55-client-component-optimization)
6. [5.6 Client-Server Interaction](#56-client-server-interaction)
7. [Best Practices](#best-practices)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 5.1 Client Component Basics

### 'use client' Directive

**Beginner Level:** Put **`'use client'`** at the **very top** of a file to tell Next **this** file must run in the **browser** too—**needed** for a **clickable** **like** button on a **social** **post**.

**Intermediate Level:** The directive creates a **client boundary**: **that module** and its **imports** (unless **further** split) become part of the **client** **bundle**. **Re-export** patterns can **accidentally** widen the boundary.

**Expert Level:** **Bundler** **graph** analysis shows **transitive** **client** **dependencies**. **Server** **Components** may **import** **Client** **components**, but **not** vice versa with **server-only** modules. **Micro-bundle** **strategies** sometimes **isolate** **`'use client'`** to **tiny** **wrappers**.

```tsx
'use client';

import { useState } from 'react';

export function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false);
  return (
    <button type="button" aria-pressed={liked} onClick={() => setLiked((v) => !v)}>
      {liked ? 'Liked' : 'Like'} · {postId}
    </button>
  );
}
```

#### Key Points

- **Place** **`'use client'`** at the **top** of the module (**only** **comments** may appear **above** it—**not** **imports**, per **React** **docs**).
- **Minimize** files with the directive.
- **Review** **import** **fan-out** on **every** **PR**.

---

### When to Use Client Components

**Beginner Level:** Use **client** when you need **interactivity**: **toggles**, **typing** in **search**, **drag** and **drop** on a **kanban** **board**.

**Intermediate Level:** Also for **effects** (`useEffect`), **browser-only** APIs, **most** **third-party** **React** libraries that rely on **hooks** or **window**.

**Expert Level:** **Performance** **sensitivity**: **virtualized** **grids**, **canvas** **editors**, **WebRTC**. **Security**: **never** **place** **secrets** here. **Progressive** **enhancement**: **prefer** **forms** + **Server Actions** for **simple** **mutations** when **possible**.

#### Key Points

- **Need** **hooks** or **events** → **client**.
- **Pure** **render** of **data** → **server**.
- **Re-evaluate** as **libraries** gain **RSC** support.

---

### Client Boundaries

**Beginner Level:** A **boundary** is where **server** **meets** **client**—like a **door** between **kitchen** (**server**) and **dining** room (**client**).

**Intermediate Level:** **Everything** **imported** by a **client** file (transitively) must be **safe** for **bundling** to **browser** (no **`server-only`**). **Props** **from** **server** must be **serializable**.

**Expert Level:** **Multiple** **boundaries** **increase** **chunk** **count** but **shrink** **hydration** **cost** when **done** **well**. **Barrel** files can **widen** boundaries—**lint** against **deep** **client** **graphs**.

```tsx
// server/parent.tsx (Server Component)
import { ClientIsland } from './client-island';

export default function Parent({ items }: { items: { id: string; label: string }[] }) {
  return <ClientIsland initialItems={items} />;
}
```

#### Key Points

- **Draw** boundaries **early** in **design** reviews.
- **Serialize** **props** **consciously**.
- **Avoid** **accidental** **widening** via **barrels**.

---

### Hydration

**Beginner Level:** **Hydration** is React **attaching** **event** **listeners** to **HTML** the **server** already **sent**—your **cart** **button** becomes **clickable**.

**Intermediate Level:** **Mismatches** between **server** HTML and **client** **first** **render** cause **warnings** and **bugs** (**useEffect** for **browser-only** values). **`suppressHydrationWarning`** only for **known** **exceptions** (e.g., **timestamps**).

**Expert Level:** **Streaming** **hydration** order; **selective** **hydration** in **advanced** setups; **measure** **INP** after **hydration** completes on **interactive** elements.

```tsx
'use client';

import { useEffect, useState } from 'react';

export function Clock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    setNow(new Date().toISOString());
  }, []);
  return <time suppressHydrationWarning>{now ?? '…'}</time>;
}
```

#### Key Points

- **Never** **randomize** on **server** without **stable** **seeds**.
- **Guard** **browser** APIs with **`useEffect`**.
- **Test** **hydration** in **production** **builds**.

---

## 5.2 Client-Only Features

### React Hooks

**Beginner Level:** **`useState`** remembers **clicks**; **`useEffect`** runs **after** **paint**—**basic** **counter** on a **landing** page **demo**.

**Intermediate Level:** **`useMemo`**, **`useCallback`**, **`useRef`**, **`useTransition`**, **`useDeferredValue`** for **performance** and **UX** (**SaaS** **tables**). **Rules** of **Hooks** still apply.

**Expert Level:** **Concurrent** features; **tearing** avoidance with **external** stores (**`useSyncExternalStore`**). **Custom** hooks to **reuse** **client** **logic** cleanly.

```tsx
'use client';

import { useMemo, useState } from 'react';

type Row = { id: string; amountCents: number };

export function InvoiceTable({ rows }: { rows: Row[] }) {
  const [filter, setFilter] = useState('');
  const total = useMemo(
    () => rows.filter((r) => r.id.includes(filter)).reduce((s, r) => s + r.amountCents, 0),
    [rows, filter],
  );
  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter id" />
      <p>Total: ${(total / 100).toFixed(2)}</p>
    </div>
  );
}
```

#### Key Points

- **Hooks** **only** in **client** (or **client**-eligible) modules.
- **Profile** before **micro-optimizing** **`useMemo`**.
- **Extract** **custom** hooks for **clarity**.

---

### Browser APIs

**Beginner Level:** **`window`**, **`document`**, **`localStorage`** exist **only** in the **browser**—use them inside **`useEffect`** or **event** handlers for a **theme** **toggle**.

**Intermediate Level:** **`matchMedia`**, **`IntersectionObserver`**, **`ResizeObserver`**, **`navigator.clipboard`**. **Feature** **detect** gracefully.

**Expert Level:** **Permissions** policies; **Safari** **quirks**; **secure** **contexts** for **clipboard**; **SSR** safe **guards**.

```tsx
'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'ui-theme';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as 'light' | 'dark' | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <button type="button" onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}>
      Theme: {theme}
    </button>
  );
}
```

#### Key Points

- **Never** **touch** **`window`** during **SSR** **render** path.
- **Graceful** **degradation** when APIs **missing**.
- **Respect** **privacy** (**storage** consent).

---

### Event Listeners

**Beginner Level:** **`onClick`**, **`onChange`** on **JSX** elements—**add** **items** to a **shopping** **cart** UI.

**Intermediate Level:** **Delegation**, **keyboard** **handlers** for **a11y**, **`pointer` events** for **hybrid** devices.

**Expert Level:** **Passive** listeners for **scroll** performance; **cleanup** in **`useEffect`** for **`addEventListener`**; **avoid** **re-registering** **listeners** **excessively**.

```tsx
'use client';

import { useEffect } from 'react';

export function EscapeToClose({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return null;
}
```

#### Key Points

- **Prefer** **React** **props** over **manual** DOM when possible.
- **Clean up** **subscriptions**.
- **Test** **keyboard** **flows**.

---

### State Management

**Beginner Level:** **`useState`** for **local** UI state—**accordion** **open**/**closed** on **FAQ**.

**Intermediate Level:** **Context** for **medium** **shared** state (**theme**, **cart** UI). **Zustand**/**Jotai**/**Redux** for **larger** **client** **state** in **dashboards**.

**Expert Level:** **Server** state via **React Query**/**SWR** calling **route handlers** or **using** **Server Actions**—**separate** **remote** vs **local** **state**. **Avoid** **duplicating** **server** **truth** **long-term** on **client**.

```tsx
'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type CartLine = { sku: string; qty: number };

type CartContextValue = { lines: CartLine[]; add: (sku: string) => void };

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      add(sku) {
        setLines((prev) => {
          const idx = prev.findIndex((l) => l.sku === sku);
          if (idx === -1) return [...prev, { sku, qty: 1 }];
          return prev.map((l, i) => (i === idx ? { ...l, qty: l.qty + 1 } : l));
        });
      },
    }),
    [lines],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
```

#### Key Points

- **Prefer** **server** **source** of **truth** for **checkout** **totals** (**prices**).
- **Context** **sparingly** to **avoid** **rerender** **storms**.
- **Pick** **libraries** with **RSC**-aware **docs**.

---

### Interactive UI

**Beginner Level:** **Sliders**, **tabs**, **menus**—**things** that **move** under **user** input on a **media** **player** app.

**Intermediate Level:** **Controlled** vs **uncontrolled** components; **focus** management; **ARIA** attributes.

**Expert Level:** **Gesture** libraries; **virtualization**; **canvas**/**WebGL** **bridges** with **typed** **refs**.

#### Key Points

- **Ship** **accessible** patterns by default.
- **Measure** **INP** on **primary** interactions.
- **Debounce** **expensive** **handlers** when needed.

---

### Custom Hooks

**Beginner Level:** **`useToggle`** **wraps** **`useState`** so **many** **components** share the **same** **logic**—**DRY** for **filters** on a **jobs** board.

**Intermediate Level:** **Compose** hooks (**`useMediaQuery`**, **`useOnScreen`**). **Return** **stable** APIs (**tuples** vs **objects**).

**Expert Level:** **Lint** **rules** for **hooks** dependencies; **test** hooks with **`@testing-library/react`** **renderHook**.

```tsx
'use client';

import { useCallback, useState } from 'react';

export function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn((v) => !v), []);
  const set = useCallback((v: boolean) => setOn(v), []);
  return [on, toggle, set] as const;
}
```

#### Key Points

- **Name** hooks **`use*`**.
- **Only** call hooks at **top** level.
- **Unit** test **hooks** **in** **isolation**.

---

## 5.3 Client Component Patterns

### Moving Client Boundaries Down

**Beginner Level:** Instead of marking the **whole** **page** **`'use client'`**, make **only** the **search** **bar** client—**smaller** **JS** for a **blog**.

**Intermediate Level:** **Server** **page** **fetches** **posts**; **client** **child** handles **instant** **filtering** of **already** **fetched** list **or** **calls** **server** for **queries**.

**Expert Level:** **Analyze** **bundle** **with** **analyzer** after **moving** boundaries; **watch** **waterfalls** if **client** **over-fetches**.

```tsx
// page.tsx (Server Component)
import { PostListClient } from './post-list.client';

export default async function BlogPage() {
  const posts = await fetch('https://api.example.com/posts', { next: { revalidate: 60 } }).then((r) => r.json());
  return <PostListClient posts={posts as { id: string; title: string }[]} />;
}
```

#### Key Points

- **Leaf** **client** **islands** **win**.
- **Pass** **serializable** **data** **down**.
- **Measure** **First** **Load** **JS**.

---

### Passing Server Data to Client

**Beginner Level:** **Server** **parent** **awaits** **JSON**, **passes** **array** to **client** **table**—**inventory** **dashboard**.

**Intermediate Level:** **Convert** **Dates** to **strings**; **strip** **sensitive** fields **before** **passing**.

**Expert Level:** **tRPC**/typed **handlers** **return** **DTOs**; **zod** **parse** on **server** before **props**.

```tsx
'use client';

import { useMemo, useState } from 'react';

type Product = { sku: string; name: string; priceCents: number };

export function MerchandisingTable({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('');
  const rows = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [products, query],
  );
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul>
        {rows.map((p) => (
          <li key={p.sku}>
            {p.name} — ${(p.priceCents / 100).toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### Key Points

- **DTO** **shapes** **stable** across **versions** when possible.
- **Never** pass **secrets**.
- **Co-locate** **types** in **`types/`** shared modules.

---

### Serialization Rules

**Beginner Level:** **Props** must be **JSON-like**—**no** **class** **methods** or **closures** (except **Server Actions** as **special** cases).

**Intermediate Level:** **`undefined`** **handling** differs in **some** **cases**—**normalize** to **`null`** when **in doubt**.

**Expert Level:** **Map/Set** → **arrays**; **BigInt** → **string**; **React elements** from **server** via **`children`** pattern rather than **weird** **nested** props.

#### Key Points

- **Think** **wire** **format**.
- **Test** **edge** **types** early.
- **Centralize** **serializers**.

---

### Composition with Server Parents

**Beginner Level:** **Server** **page** wraps **client** **modal** **trigger**—**clean** split for **marketing** **site**.

**Intermediate Level:** **Pass** **`children`** from **server** into **client** **layout** **shells** for **maximum** **flexibility**.

**Expert Level:** **Slot** **components** for **design** **systems**; **typed** **`children`** with **`ReactNode`**.

```tsx
'use client';

import type { ReactNode } from 'react';

export function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <header className="sticky top-0 bg-white/80 backdrop-blur">{title}</header>
      {children}
    </section>
  );
}
```

#### Key Points

- **Server** **owns** **data** **fetch**; **client** **owns** **interaction** shell when needed.
- **Keep** **shells** **thin**.
- **Avoid** **fetch** in **client** when **server** can **prime** data.

---

### Context Providers on the Client

**Beginner Level:** **`ThemeProvider`** wraps **subtree**—**children** **consume** context in **client** **components**.

**Intermediate Level:** **Place** **providers** in a **small** **`providers.tsx`** **`'use client'`** file imported from **server** **`layout.tsx`**.

**Expert Level:** **Split** **providers** to **avoid** **mega** **client** **bundles**; **lazy** **initialize** **heavy** SDKs.

```tsx
// app/providers.tsx
'use client';

import type { ReactNode } from 'react';
import { CartProvider } from '@/components/cart-context';

export function Providers({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
```

```tsx
// app/layout.tsx (Server Component excerpt)
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

#### Key Points

- **One** **`providers.tsx`** is a **common** pattern.
- **Do not** **export** **server-only** imports from **providers**.
- **Scope** providers **narrowly** when possible.

---

## 5.4 Third-party Libraries

### Client-Only Libraries

**Beginner Level:** **Chart** or **map** SDKs need **`window`**—they are **client-only** for your **logistics** **dashboard**.

**Intermediate Level:** **Check** **docs** for **SSR** support; **dynamic** **`import()`** with **`ssr: false`** when required.

**Expert Level:** **License** compliance; **CSP** **nonces** for **injected** scripts; **lazy** load **heavy** **SDKs** on **route** **segment** **entry**.

```tsx
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const HeavyChart = dynamic(() => import('./heavy-chart'), { ssr: false, loading: () => <p>Loading chart…</p> });

export function AnalyticsPanel() {
  return (
    <Suspense fallback={null}>
      <HeavyChart />
    </Suspense>
  );
}
```

#### Key Points

- **Read** **Next** **+** **library** **compatibility** notes.
- **`ssr: false`** **disables** server render for that **import**.
- **Guard** **routes** behind **auth** before **loading** **expensive** libs.

---

### Dynamic Imports

**Beginner Level:** **Load** code **only** when **needed**—**admin** **tools** on a **SaaS** app **shouldn’t** **bloat** **every** **user**.

**Intermediate Level:** **`next/dynamic`** wraps **`React.lazy`** with **SSR** options. **Named** exports **require** **`.then(m => m.X)`** pattern.

**Expert Level:** **Prefetch** on **hover** for **power** users; **measure** **chunk** sizes; **watch** **layout** **shift** when **loading** **components** **mount**.

#### Key Points

- **Dynamic** import **per** **heavy** **widget**.
- **Provide** **loading** **UI**.
- **Test** **network** **failures**.

---

### 'use client' in npm Packages

**Beginner Level:** Some **packages** ship **`'use client'`** **entry** points—**they** **become** **client** **modules** when **imported**.

**Intermediate Level:** **Transpile** **`node_modules`** packages in **`next.config`** **`transpilePackages`** when needed for **monorepos**.

**Expert Level:** **Dual** **publish** ESM/CJS concerns; **peer** **dependencies** on **React** versions; **verify** **RSC** **compatibility** **tickets** upstream.

#### Key Points

- **Pin** **versions** of **UI** libraries during **Next** upgrades.
- **`transpilePackages`** for **local** **workspace** libs.
- **Contribute** **fixes** upstream when **broken**.

---

### Wrapping Third-Party Components

**Beginner Level:** Create **`'use client'`** **wrapper** around **datepicker** to **use** in **server** **pages**—**thin** **adapter**.

**Intermediate Level:** **Map** **props** to **stable** **API** for **your** **design** **system**.

**Expert Level:** **Tree-shake** **unused** **submodules**; **lazy** **load** **rare** **widgets**; **document** **a11y** **gaps** in **wrappers**.

```tsx
'use client';

import DatePicker from 'some-datepicker';
import type { ComponentProps } from 'react';

type Props = ComponentProps<typeof DatePicker>;

export function ClientDatePicker(props: Props) {
  return <DatePicker {...props} />;
}
```

#### Key Points

- **Wrappers** **localize** **dependency** **risk**.
- **Re-export** **types** **cleanly**.
- **Test** **wrapper** **behavior** **minimally**.

---

## 5.5 Client Component Optimization

### Minimizing JavaScript

**Beginner Level:** **Smaller** **JS** means **faster** **phones** on your **news** **reader** app.

**Intermediate Level:** **Remove** **unused** **deps**; **prefer** **server** **rendering** for **static** **text**; **avoid** **huge** **icons** packs—**tree-shake**.

**Expert Level:** **Analyze** bundles; **split** **vendor** chunks; **consider** **preact** only if **warranted** (usually **not** in **Next** apps).

#### Key Points

- **RSC** already **helps**—**don’t** **undo** with **fat** **client** **trees**.
- **Run** **`next build` analyzer** periodically.
- **Budget** **per** **route** in **large** **teams**.

---

### Code Splitting

**Beginner Level:** **Split** **code** so **users** **download** **checkout** **only** when **needed**.

**Intermediate Level:** **Route-level** splitting automatic; **dynamic** imports for **components**; **lazy** **routes** in **SPA-ish** patterns **less** relevant in **App Router** but **still** for **client** **imports**.

**Expert Level:** **Granular** **chunks** for **A/B** features; **prebundle** **shared** **deps** carefully in **monorepos**.

#### Key Points

- **Trust** **Next** **defaults**, then **optimize** hotspots.
- **Avoid** **barrel** **imports** pulling **unused** code.
- **Measure** **cache** **hit** rates on **CDN**.

---

### Lazy Loading

**Beginner Level:** **Defer** **non-critical** **UI**—**below-the-fold** **carousel** on **e-commerce** **home**.

**Intermediate Level:** **`dynamic()`**, **`React.lazy`**, **intersection** **observers** for **infinite** **feeds**.

**Expert Level:** **Priority** hints; **image** **`loading=lazy`** via **`next/image`**; **skeleton** placeholders to **stabilize** **CLS**.

#### Key Points

- **Lazy** load **heavy** **visualizations**.
- **Prefetch** when **high** **probability** of use.
- **Watch** **SEO** for **critical** content.

---

### Bundle Size Awareness

**Beginner Level:** **One** **big** **library** can **double** **load** time—**notice** **bundle** **warnings**.

**Intermediate Level:** **Replace** **moment** with **date-fns**/**Temporal** polyfills thoughtfully; **import** **lodash** functions **directly**.

**Expert Level:** **Duplicate** **React** detection in **monorepos**; **pnpm** **overrides**; **monitor** **CI** **trends**.

#### Key Points

- **Dependencies** are **product** choices.
- **Automate** **regression** **alerts**.
- **Educate** **designers** about **icon** **set** size.

---

### Client Optimization Best Practices

**Beginner Level:** **Keep** **state** **local**; **avoid** **rerendering** **whole** **trees** for **tiny** **changes**.

**Intermediate Level:** **`useTransition`** for **non-urgent** updates; **memo** **pure** **lists**; **virtualize** **long** **tables**.

**Expert Level:** **Profile** **React** **DevTools** **Profiler**; **field** **telemetry** on **INP** **per** **component** **class** in **production** **sampling**.

```tsx
'use client';

import { memo, useCallback, useState } from 'react';

type Item = { id: string; title: string };

const Row = memo(function Row({ item, onOpen }: { item: Item; onOpen: (id: string) => void }) {
  return (
    <li>
      <button type="button" onClick={() => onOpen(item.id)}>
        {item.title}
      </button>
    </li>
  );
});

export function VirtualizedList({ items }: { items: Item[] }) {
  const [active, setActive] = useState<string | null>(null);
  const onOpen = useCallback((id: string) => setActive(id), []);
  return (
    <ul>
      {items.map((item) => (
        <Row key={item.id} item={item} onOpen={onOpen} />
      ))}
      <output aria-live="polite">{active ? `Active ${active}` : 'None'}</output>
    </ul>
  );
}
```

#### Key Points

- **Measure** before **`memo`** everywhere.
- **Stable** **callbacks** with **`useCallback`** when **passing** to **memo** **children**.
- **Virtualize** when **rows** **> ~few** hundred.

---

## 5.6 Client-Server Interaction

### Server Actions from Client

**Beginner Level:** Call **`action`** from **`onClick`** or **`<form action>`** to **save** **data** **without** **writing** **REST** **boilerplate** on a **CRM** **app**.

**Intermediate Level:** **Bind** **arguments** with **inline** **forms** patterns; **`useFormStatus`**/**`useFormState`** for **UX**.

**Expert Level:** **Security** **review** (**auth**, **CSRF** policy per version); **retry**/**idempotency** semantics; **toasts** on **result** objects.

```tsx
'use client';

import { useTransition } from 'react';
import { archiveTicket } from './actions';

export function ArchiveButton({ ticketId }: { ticketId: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} onClick={() => start(() => archiveTicket(ticketId))}>
      {pending ? 'Archiving…' : 'Archive'}
    </button>
  );
}
```

#### Key Points

- **Prefer** **actions** for **mutations** when **simple**.
- **Handle** **pending** states.
- **Surface** **errors** accessibly.

---

### Route Handlers

**Beginner Level:** **`fetch('/api/...')`** from **client** to **JSON** endpoints—**mobile** **app** **shared** **API**.

**Intermediate Level:** **Typed** **responses**; **throw**/**handle** **HTTP** errors; **cookies** **credentials** **`include`** when **same-site**.

**Expert Level:** **Rate** limiting; **CORS** if **cross-origin**; **OpenAPI** **clients** generated from **schemas**.

```tsx
'use client';

import { useEffect, useState } from 'react';

type Health = { ok: boolean };

export function ApiStatus() {
  const [data, setData] = useState<Health | null>(null);
  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json() as Promise<Health>)
      .then(setData)
      .catch(() => setData({ ok: false }));
  }, []);
  return <p>API: {data?.ok ? 'up' : 'checking…'}</p>;
}
```

#### Key Points

- **Don’t** **duplicate** **business** rules across **handlers** and **actions** without **shared** modules.
- **Validate** **JSON** shapes.
- **Secure** **sensitive** endpoints.

---

### Data Mutations

**Beginner Level:** **Create**, **update**, **delete** records—**cart** **lines**, **profile** **fields**.

**Intermediate Level:** **Optimistic** UI vs **pessimistic**; **invalidation** strategies (**router.refresh**, **React Query**).

**Expert Level:** **Concurrency** control (**ETags**, **version** columns); **conflict** **resolution** UX in **collaborative** **SaaS**.

#### Key Points

- **Single** **source** of **truth** after **mutation** completes.
- **Show** **progress** and **errors**.
- **Audit** **mutations** for **compliance** apps.

---

### Optimistic Updates

**Beginner Level:** **Show** **like** **count** **+1** **immediately**, **fix** if **server** **fails**—**snappy** **social** **feeds**.

**Intermediate Level:** **`useOptimistic`** (React) or **manual** **rollback** in **`useTransition`**.

**Expert Level:** **Queue** **operations** offline; **reconcile** **diffs**; **idempotency** keys to **avoid** **double** **counts**.

```tsx
'use client';

import { useOptimistic, useTransition } from 'react';
import { toggleFollow } from './actions';

type State = { following: boolean; count: number };

export function FollowButton({ initial }: { initial: State }) {
  const [pending, start] = useTransition();
  const [optimistic, applyOptimistic] = useOptimistic(initial, (s, next: State) => next);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const next = { following: !optimistic.following, count: optimistic.count + (optimistic.following ? -1 : 1) };
          applyOptimistic(next);
          await toggleFollow(!optimistic.following);
        })
      }
    >
      {optimistic.following ? 'Following' : 'Follow'} ({optimistic.count})
    </button>
  );
}
```

#### Key Points

- **Optimistic** UX **must** **recover** from **errors**.
- **Keep** **math** **consistent** with **server** rules.
- **Test** **race** conditions.

---

### Data Flow Summary

**Beginner Level:** **Server** **fetches** **first**, **client** **reacts**—**one-way** **water** **flow** **downhill** in a **dashboard**.

**Intermediate Level:** **Lift** **mutations** to **actions**/**handlers**; **refresh** **server** **components** after **success**.

**Expert Level:** **Event-driven** updates (**webhooks** → **revalidation**); **real-time** **channels** (**WebSockets**, **SSE**) **bridged** through **client** hooks with **server** **auth** **tickets**.

#### Key Points

- **Prefer** **explicit** **data** **flow** diagrams in **docs**.
- **Avoid** **circular** **client↔server** **ping-pong** without **caching** strategy.
- **Instrument** **end-to-end** **mutation** latency.

---

### Extended Example: E-commerce Cart + Checkout Bridge

**Beginner Level:** **Client** **cart** **UI** **shows** **items**; **checkout** button **calls** **server** **action** to **create** **payment** **intent**.

**Intermediate Level:** **Validate** **prices** on **server**; **client** **optimistic** **qty** changes **reverted** if **inventory** **fails**.

**Expert Level:** **Stripe** **Elements** in **client** **island**; **webhooks** **finalize** **orders**; **revalidate** **product** **pages** on **stock** **changes**.

```tsx
'use client';

import { useState } from 'react';
import { startCheckout } from './actions';

export function CheckoutCTA({ cartId }: { cartId: string }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button
        type="button"
        onClick={async () => {
          setError(null);
          const res = await startCheckout(cartId);
          if (!res.ok) setError(res.error);
          else window.location.href = res.url;
        }}
      >
        Pay securely
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}
```

#### Key Points

- **Never** **trust** **client** **prices**.
- **Redirect** URLs **from** **server** **responses** **validated**.
- **Log** **payment** **failures** **carefully** (**PCI** scope).

---

### Extended Example: SaaS Settings with Route Handler Fallback

**Beginner Level:** **Settings** form uses **Server Action**; **mobile** **app** uses **same** **validation** via **`/api/settings`**.

**Intermediate Level:** **Share** **Zod** schema in **`lib/validation`**.

**Expert Level:** **Feature** **flag** to **choose** **transport**; **observability** on **both** paths.

#### Key Points

- **One** schema, **many** **transports**.
- **Test** **both** **paths**.
- **Monitor** **divergence** bugs.

---

## Best Practices

- **Push** **`'use client'`** to the **smallest** subtree that needs **hooks**, **events**, or **browser** APIs.
- **Prime** data on the **server**, then **hydrate** **interactive** **islands** with **serializable** props.
- **Centralize** **providers** in a **dedicated** **`providers.tsx`** file to **avoid** marking **root** **layout** as **client**.
- **Dynamic** import **heavy** **third-party** **widgets**; **set** **`ssr: false`** only when **required**.
- **Pair** **mutations** with **clear** **pending**/**error** UI and **accessible** **live** regions.
- **Validate** sensitive **operations** on the **server** even if **client** validation exists.
- **Monitor** **INP** and **bundle** size **regressions** in **CI** for **customer-facing** apps.
- **Document** **which** **team** owns **client** **boundaries** in **large** **codebases**.

---

## Common Mistakes to Avoid

- **Marking** entire **layouts** or **pages** as **`'use client'`** without **need**, **ballooning** **JS** and **losing** **RSC** **benefits**.
- **Reading** **`window`** or **`localStorage`** during **render** instead of inside **`useEffect`**, causing **hydration** **mismatches**.
- **Passing** **non-serializable** props (**class** instances, **functions** except **Server Actions**) from **server** to **client**.
- **Importing** **`server-only`** utilities into **client** modules **by** **accident** via **shared** **barrel** files.
- **Duplicating** **authoritative** **business** rules only on the **client**—**attackers** bypass them.
- **Omitting** **cleanup** for **subscriptions**/**listeners**, causing **memory** leaks in **long-lived** **dashboard** sessions.
- **Overusing** **global** **context** for **high-frequency** updates, causing **broad** **rerenders**.
- **Ignoring** **accessibility** on **client-only** **widgets** (**focus**, **ARIA**, **keyboard**).
- **Using** **`ssr: false`** for **content** that **should** be **indexed** by **search** engines without **alternates**.
- **Assuming** **`fetch`** from **client** inherits **Next** **server** **`fetch`** **cache** semantics—it **does** **not**.

---

*Client boundaries interact tightly with React and Next.js releases—re-verify hydration and Server Action security guidance when upgrading.*
