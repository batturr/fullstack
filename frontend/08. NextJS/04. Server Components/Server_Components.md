# React Server Components in Next.js

**React Server Components (RSC)** let you render React on the **server** by default in the **App Router**, sending a **serialized component tree** to the client instead of a large **JavaScript** bundle. This guide covers **mental models**, **data fetching**, **composition patterns**, **Server Actions**, and **request context**—with **e-commerce**, **blog**, **dashboard**, and **SaaS** examples.

---

## 📑 Table of Contents

1. [4.1 Server Components Basics](#41-server-components-basics)
2. [4.2 Server Component Features](#42-server-component-features)
3. [4.3 Data Fetching in Server Components](#43-data-fetching-in-server-components)
4. [4.4 Server Component Patterns](#44-server-component-patterns)
5. [4.5 Server Actions](#45-server-actions)
6. [4.6 Server Component Context](#46-server-component-context)
7. [Best Practices](#best-practices)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 4.1 Server Components Basics

### What Are Server Components?

**Beginner Level:** **Server Components** are React components that **run on the server** only—users get **HTML** (and **RSC payload**) without downloading the **component’s logic** to the browser. A **simple product description** can be **server-rendered** like a **static flyer**.

**Intermediate Level:** They **can be async**, **await** I/O, access **secrets**, and **import** heavy libraries **without** bloating the client. They **cannot** use **`useState`**, **`useEffect`**, or **browser APIs**. **Client Components** are the **escape hatch** for interactivity.

**Expert Level:** RSC is a **new module graph**: **server** references **client** boundaries via **serialized props** and **import metadata**. **Flight** protocol streams **instructions** to **reconcile** on the client. **Framework** (Next) owns **bundling** splits—**mistakes** like **importing** server modules into client **fail** at **build** or **runtime**.

```tsx
type Book = { id: string; title: string; author: string };

async function getBook(id: string): Promise<Book> {
  const res = await fetch(`https://api.example.com/books/${id}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to load book');
  return res.json() as Promise<Book>;
}

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBook(id);
  return (
    <article>
      <h1>{book.title}</h1>
      <p>by {book.author}</p>
    </article>
  );
}
```

#### Key Points

- **Default** in **`app/`** without **`'use client'`**.
- **Async components** are **valid** on the server.
- **Interactivity** moves to **explicit** **Client** **children**.

---

### Server-First Default

**Beginner Level:** Next **assumes** **server** unless you **opt in** to **client**—good for a **news** site where **readers** mostly **scroll** and **read**.

**Intermediate Level:** **Push** **`'use client'`** to **leaves**—**date pickers**, **maps**, **charts**—while **keeping** **shells** on the server. **Reduces** **hydration** work and **JS** **download**.

**Expert Level:** **Server-first** interacts with **caching**: **`fetch`** defaults, **`revalidatePath`**, **`revalidateTag`**. **Design** **systems** should **expose** **server-safe** **primitives** separately from **client** **widgets** to **avoid** **accidental** **boundary** **violations**.

#### Key Points

- **Server-first** is a **performance** and **security** **stance**.
- **Client** **islands** should be **small** and **focused**.
- **Design** **components** with **boundary** in mind.

---

### Server vs Client Components

**Beginner Level:** **Server** = **no** **clicks** handled **in** that file; **Client** = **can** **use** **buttons** with **`onClick`**.

**Intermediate Level:** **Server** may **render** **Client** by **importing** it and **passing props**. **Client** **cannot** **import** **Server** **modules** that **use** **server-only** APIs—use **`children`** **composition** instead.

**Expert Level:** **Serialization** boundary: **props** to **client** must be **JSON-like** (**plain** objects, **arrays**, **strings**, **numbers**, **null**, **undefined** in supported forms). **Functions** passed to **client** are **Server Actions** (special **references**), not **arbitrary** closures.

```tsx
import { AddToCart } from './add-to-cart.client';

export default async function Product({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const priceCents = 4999;
  return (
    <section>
      <h1>{sku}</h1>
      <p>${(priceCents / 100).toFixed(2)}</p>
      <AddToCart sku={sku} priceCents={priceCents} />
    </section>
  );
}
```

```tsx
'use client';

import { useState } from 'react';

export function AddToCart({ sku, priceCents }: { sku: string; priceCents: number }) {
  const [qty, setQty] = useState(1);
  return (
    <div>
      <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
      <button type="button">Add {sku} × {qty} (${(priceCents / 100) * qty})</button>
    </div>
  );
}
```

#### Key Points

- **One-way** **dependency**: **Server** → **Client** imports OK (with rules); **reverse** is **restricted**.
- **Props** must be **serializable** to **client**.
- **Split** files **early** when **hooks** appear.

---

### Benefits of Server Components

**Beginner Level:** **Faster** **phones** **load** **less** **JavaScript** for a **travel** **blog** listing **articles**.

**Intermediate Level:** **Direct backend** access, **smaller** bundles, **better** **SEO** defaults, **automatic** **code** **splitting** of **client** **islands**, **streaming** **friendly** architecture.

**Expert Level:** **Security posture** improves when **tokens** never **touch** **client** bundles. **Dependency** **footprint** shifts **CPU** to **server**—**cost** **tradeoff** requires **monitoring** on **high** **QPS** **endpoints**. **Cache** **deduplication** of **`fetch`** reduces **duplicate** **work** within a **request**.

#### Key Points

- **Benefits** are **not** **free**—**watch** **server** **load**.
- **Combine** with **CDN** **caching** for **scale**.
- **Measure** **real** **user** **metrics**.

---

### When to Use Server Components

**Beginner Level:** Use **server** for **anything** that **just** **shows** **information**: **menus**, **footers**, **article** **body**.

**Intermediate Level:** Use **server** for **data** **joins** near **DB**, **personalization** that **must** stay **private**, **markdown** rendering with **large** parsers, **A/B** **assignments** computed **server-side**.

**Expert Level:** **Avoid** **client** for **orchestration** that touches **secrets** or **large** **libs**. **When** **latency** to **data** **stores** is **low** **inside** **VPC**, **server** **wins**; **when** **interaction** **density** is **high** (**Figma-like** editors), **client** **dominates**—**hybrid** **composition** is **normal**.

#### Key Points

- **Default** **server**; **justify** **client**.
- **Colocate** **fetch** with **UI** that **consumes** it.
- **Revisit** decisions when **requirements** change.

---

### Limitations of Server Components

**Beginner Level:** **No** **`useState`** in the **same** file—**state** lives in **client** **children**.

**Intermediate Level:** **No** **browser** APIs (**`window`**, **`document`**, **`localStorage`**). **No** **subscriptions** to **real-time** **events** without **client** **bridge**. **Side effects** belong in **mutations**/**handlers**, not **arbitrary** **mount** effects on server.

**Expert Level:** **Serialization** **limits** **patterns**—**passing** **React** **elements** from **server** to **client** works via **`children`**, but **complex** **cross-boundary** patterns need **discipline**. **Third-party** **ecosystem** **lag**: some **libraries** are **client-only** or **need** **wrappers**. **Debugging** **RSC** **errors** can be **opaque**—**logging** and **minimal** **repros** help.

#### Key Points

- **Know** **non-serializable** **types**.
- **Wrap** **legacy** **libs** in **client** **components**.
- **Upgrade** **dependencies** for **RSC** awareness.

---

## 4.2 Server Component Features

### Direct Database Access

**Beginner Level:** The **server** can **talk** to a **database** **directly**—your **todo** app **reads** **tasks** without exposing **connection** **strings** to **browsers**.

**Intermediate Level:** Use **ORMs** (**Prisma**, **Drizzle**) in **Server Components** or **data** **modules** marked **`server-only`**. **Pool** **sizing** and **timeouts** matter under **load**.

**Expert Level:** **Transactional** **consistency** across **multiple** **queries**; **read replicas** for **reporting** dashboards; **RLS** (**row-level security**) in **Postgres** for **multi-tenant** **SaaS**. **Avoid** **N+1** **patterns** in **RSC** **trees**—**batch** **loads** or **join** queries.

```typescript
import 'server-only';
import { db } from '@/lib/db';

export async function listOpenOrdersForUser(userId: string) {
  return db.order.findMany({ where: { userId, status: 'OPEN' }, take: 50 });
}
```

#### Key Points

- **Never** **expose** **DSN** to **client**.
- **Use** **connection** pooling.
- **Authorize** before **querying**.

---

### Backend Resources and Integrations

**Beginner Level:** Call **Stripe**, **SendGrid**, or **internal** **microservices** from the **server** to **confirm** **payments** for an **online** **boutique**.

**Intermediate Level:** **Centralize** **SDK** clients in **`lib/`** with **typed** **wrappers**. **Handle** **retries**, **idempotency** keys, **timeouts**.

**Expert Level:** **Circuit** **breakers** and **bulkheads** when **dependencies** **degrade**; **OpenTelemetry** **spans** around **outbound** calls; **secret** **rotation** without **redeploy** using **managed** **secret** stores.

#### Key Points

- **Keep** **SDKs** **server-side**.
- **Propagate** **request** **IDs** to **upstream**.
- **Map** **failures** to **user-visible** **errors** carefully.

---

### Sensitive Data Handling

**Beginner Level:** **API** **keys** and **PII** stay on the **server**—customers **never** **download** them from your **insurance** **portal**.

**Intermediate Level:** **Redact** logs; **minimize** **data** **returned** to **client** props. **Tokenize** **PANs**; **never** **serialize** **full** **user** **records** to **client** **unless** needed.

**Expert Level:** **Field-level** encryption, **KMS** integration, **audit** trails for **admin** **SaaS** actions. **Compliance** (**HIPAA**, **PCI**) **scopes** what can **run** where—**edge** may be **disallowed** for some **data** classes.

#### Key Points

- **Least** **privilege** for **service** accounts.
- **Classify** **data** per **route**.
- **Review** **props** in **code** review.

---

### Large Dependencies on the Server

**Beginner Level:** **Markdown** **parsers** or **syntax** **highlighters** can be **huge**—run them **on the server** for a **developer** **blog** so **readers**’ **phones** stay **fast**.

**Intermediate Level:** **Dynamic** **`import()`** still **bundles** for **server** **chunks**—but **nothing** ships to **client** if **unused** downstream. **Watch** **cold** **start** **impact** on **serverless**.

**Expert Level:** **WASM** modules, **native** addons—**validate** **deployment** target (**Node** vs **edge**). **Isolate** **CPU-heavy** work to **background** **workers** if **requests** **timeout**.

```tsx
import { compileMarkdown } from '@/lib/markdown-server';

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const html = await compileMarkdown(slug);
  return <article dangerouslySetInnerHTML={{ __html: html }} />;
}
```

#### Key Points

- **Profile** **server** **CPU** for **heavy** libs.
- **Sanitize** **HTML** when **injecting**.
- **Consider** **edge** **incompatibility**.

---

### Zero JS to the Client (for That Subtree)

**Beginner Level:** Pure **static** **article** **content** may ship **no** **React** **client** code for that **part**—just **HTML**.

**Intermediate Level:** **Removing** **accidental** **`'use client'`** **parents** maximizes **zero-JS** regions. **Links** use **`next/link`** from **server** components fine.

**Expert Level:** **Hydration** only for **client** **subtrees**; **measure** **bundle** **analyzer** diffs when **refactoring** boundaries. **Marketing** pages can approach **static** **HTML** **with** **islands**.

#### Key Points

- **Audit** **client** **boundaries** regularly.
- **Zero-JS** **improves** **median** **mobile** **performance**.
- **Interactivity** still needs **JS**—plan **islands**.

---

### Automatic Code Splitting

**Beginner Level:** Next **splits** **JavaScript** so **users** **download** only what **their** **route** needs—**checkout** code **doesn’t** **slow** **homepage**.

**Intermediate Level:** **Client** **components** **imported** from **server** become **separate** **chunks**. **Dynamic** **`import()`** with **`ssr: false`** for **client-only** (when appropriate).

**Expert Level:** **Analyze** **graphs** for **duplicate** **chunks** across **routes**; **dedupe** **dependencies** in **monorepos**; **avoid** **barrel** files pulling **unused** **client** code.

#### Key Points

- **Splitting** is **automatic** but **not** **magic**—**imports** matter.
- **Use** **dynamic** imports for **heavy** **client** **widgets**.
- **Monitor** **First** **Load** **JS** **budgets**.

---

## 4.3 Data Fetching in Server Components

### async / await in Components

**Beginner Level:** **`async function Page()`** can **`await`** **data** before **returning** **JSX**—your **weather** **banner** waits for **temperature**.

**Intermediate Level:** **Parallelize** independent **`await`s** with **`Promise.all`**. **Sequential** **awaits** create **waterfalls**—bad for **TTFB**.

**Expert Level:** **Structured** concurrency patterns; **abort** signals when **timeouts** elapse; **dedupe** identical **`fetch`** via **cache** in same **request**.

```tsx
async function loadDashboard(orgId: string) {
  const [users, invoices] = await Promise.all([
    fetch(`https://api.example.com/orgs/${orgId}/users`, { next: { revalidate: 60 } }).then((r) => r.json()),
    fetch(`https://api.example.com/orgs/${orgId}/invoices`, { next: { revalidate: 60 } }).then((r) => r.json()),
  ]);
  return { users, invoices };
}
```

#### Key Points

- **async** **Server Components** are **idiomatic**.
- **Avoid** **waterfalls** when **possible**.
- **Handle** **errors** with **`error.tsx`** or **try/catch** + **fallback** UI.

---

### fetch() with Server Components

**Beginner Level:** **`fetch`** pulls **JSON** from **APIs**—like **getting** **products** for a **store**.

**Intermediate Level:** Next **extends** **`fetch`** with **`next: { revalidate, tags }`** and **`cache`** options. **Defaults** differ from **browser** **`fetch`**—**read** **docs** per **version**.

**Expert Level:** **Request memoization** dedupes identical **`fetch`** in one **RSC** **render** pass. **Integrate** **ETag**/ **`If-None-Match`** when **calling** **compatible** **CDNs**. **GraphQL** **batching** still **benefits** from **server** **co-location**.

```typescript
type Product = { id: string; name: string };

export async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`https://api.example.com/products/${id}`, {
    next: { tags: [`product:${id}`] },
  });
  if (!res.ok) throw new Error('product fetch failed');
  return res.json() as Promise<Product>;
}
```

#### Key Points

- **Explicit** **`cache`** when **defaults** **surprise** you.
- **Tag** for **granular** **revalidation**.
- **Do not** mix **browser-only** assumptions.

---

### Direct Database Queries

**Beginner Level:** **Query** **SQL** **inside** **server** **functions** used by **pages**—**orders** for **today** on a **merchant** **dashboard**.

**Intermediate Level:** **Colocate** **queries** next to **routes** or **domain** modules. **Use** **transactions** for **invariants**.

**Expert Level:** **Read-after-write** consistency after **Server Actions**; **cursors** for **infinite** feeds; **avoid** leaking **ORM** **entities** with **non-serializable** fields into **props**.

#### Key Points

- **Keep** **queries** **parameterized** (**no** string concat for user input).
- **Index** for **hot** paths.
- **Test** **with** **realistic** **data** volume.

---

### Multiple Data Sources

**Beginner Level:** Combine **CMS** **posts** with **warehouse** **inventory** for a **commerce** **PDP**—**server** can **call** **both**.

**Intermediate Level:** **Orchestrate** with **typed** **adapters**; **normalize** **errors**; **partial** **success** strategies (**show** **CMS** even if **inventory** **degraded**).

**Expert Level:** **Sagas**/**process** managers for **consistent** **cross-service** reads; **feature** flags per **source**; **SLA** **tiering** (**degrade** **recommendations** first).

#### Key Points

- **Design** **fallbacks** per **source**.
- **Log** **per** **dependency** latency.
- **Cache** **carefully**—**staleness** varies by **domain**.

---

### Parallel Fetching

**Beginner Level:** **Ask** for **profile** and **notifications** **at the same time** so the **SaaS** **header** loads **faster**.

**Intermediate Level:** **`Promise.all`**, **`Promise.allSettled`** when **partial** failure is OK. **Combine** with **streaming** **Suspense** **children** for **progressive** rendering.

**Expert Level:** **Concurrency** limits to **protect** **origin** servers; **bulk** APIs instead of **fan-out** **storms**.

#### Key Points

- **Parallel** by default for **independent** reads.
- **Handle** **partial** failures **explicitly**.
- **Respect** **upstream** **rate** limits.

---

### Sequential Fetching

**Beginner Level:** Sometimes **step** **two** **needs** **step** **one’s** **id**—**shipping** **quotes** after **address** **validation**.

**Intermediate Level:** **Sequential** **awaits** are OK when **dependency** exists—**minimize** **chain** length. **Consider** **batch** endpoints.

**Expert Level:** **Dataloader** patterns on **server** for **dedupe** within **request**; **cursor** **pagination** loops—**watch** **timeouts**.

```tsx
export default async function CheckoutSummary({ params }: { params: Promise<{ cartId: string }> }) {
  const { cartId } = await params;
  const cart = await fetch(`https://api.example.com/carts/${cartId}`, { cache: 'no-store' }).then((r) => r.json());
  const rates = await fetch(`https://api.example.com/shipping-rates`, {
    method: 'POST',
    body: JSON.stringify({ zip: cart.shipToZip }),
    cache: 'no-store',
  }).then((r) => r.json());
  return (
    <section>
      <pre>{JSON.stringify({ cart, rates }, null, 2)}</pre>
    </section>
  );
}
```

#### Key Points

- **Justify** each **sequential** **step**.
- **Explore** **combined** APIs.
- **Instrument** **latency** per **hop**.

---

### Streaming Responses

**Beginner Level:** Send **header** **first**, **recommendations** **later**—user **sees** **progress** on a **media** **app**.

**Intermediate Level:** **`Suspense`** **boundaries** + **`loading.tsx`**. **RSC** **streaming** **flushes** **early** **segments**.

**Expert Level:** **Backpressure** and **HTML** **ordering** concerns; **SEO** for **below-the-fold** streaming content; **monitor** **TTFB** vs **FCP** tradeoffs.

#### Key Points

- **Stream** when **slow** **dependencies** **block** **fast** parts.
- **Skeleton** **stability** matters.
- **Test** on **slow** networks.

---

## 4.4 Server Component Patterns

### Composition with Server Trees

**Beginner Level:** **Break** UI into **small** **server** **components**: **header**, **grid**, **footer** for a **listing** page.

**Intermediate Level:** **Compose** **server** **components** freely **without** **client** **boundaries** between them. **Share** **utilities** in **`lib/`**.

**Expert Level:** **Memoization** rarely needed on server—**focus** on **query** **efficiency** and **caching**. **Cohesive** **modules** reduce **refetch** risk.

#### Key Points

- **Compose** **liberally** on the server.
- **Keep** **modules** **pure** where possible.
- **Watch** **import** **cycles**.

---

### Passing Server Components as Props

**Beginner Level:** **Pass** **pre-built** **UI** **pieces** into **wrappers**—like giving a **gift** **box** (**client**) a **pre-wrapped** **item** (**server**).

**Intermediate Level:** **Anti-pattern** fixed: **client** **imports** **server** **directly**—instead, **server** **passes** **`children`** or **slots** built on **server** into **client** **container**.

**Expert Level:** **Slot** patterns power **modals**, **sidebars**, **analytics** shells. **Type** **`ReactNode`** carefully; **avoid** **passing** **non-serializable** props alongside **server** **children**.

```tsx
'use client';

import type { ReactNode } from 'react';

export function ClientCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded border p-4">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

```tsx
import { ClientCard } from './client-card';
import { ServerMarkdown } from './server-markdown';

export default async function Article() {
  return (
    <ClientCard title="Release notes">
      <ServerMarkdown slug="2025-03" />
    </ClientCard>
  );
}
```

#### Key Points

- **`children`** is the **simplest** **slot**.
- **Client** **wrapper**, **server** **content** **inside**.
- **Verify** **serialization** rules when **adding** props.

---

### children Pattern

**Beginner Level:** **`layout.tsx`** **`{children}`** is the **nested** **page**—**basic** **routing** **composition**.

**Intermediate Level:** **Multiple** **slots** via **parallel** routes beyond **single** **`children`**. **Still** **server**-friendly.

**Expert Level:** **Typed** **`children`** with **`ReactNode`**; **avoid** **assumptions** about **deep** **structure**—**keep** **layouts** **generic**.

#### Key Points

- **children** is **foundational** **composition**.
- **Prefer** **slots** over **globals** when **flexibility** needed.
- **Document** **layout** **contracts** for **teams**.

---

### Interleaving Server and Client

**Beginner Level:** **Page** is **server**, **embedded** **map** is **client**—**best** of **both** on a **real-estate** site.

**Intermediate Level:** **Server** **fetches** **lat/lng**; **client** **renders** **interactive** map with **props**. **Avoid** **props** that **change** **identity** **every** **render** unnecessarily.

**Expert Level:** **Minimize** **client** **subtree** **depth** carrying **heavy** **context**. **Stabilize** **references** with **`useMemo`** on client when needed.

#### Key Points

- **Interleave** at **natural** **boundaries**.
- **Precompute** on server when possible.
- **Measure** **hydration** costs.

---

### Server Component Pattern Best Practices

**Beginner Level:** **Keep** **interactive** **bits** **small**; **everything** else **server**.

**Intermediate Level:** **`server-only`** **package** on **modules** with **secrets**. **Colocate** **tests** for **data** **loaders**.

**Expert Level:** **Enforce** **boundaries** with **ESLint** rules; **architectural** **decision** records for **controversial** **splits**; **load** **testing** **per** **route** after **changes**.

#### Key Points

- **Practice** **consistent** **folder** patterns.
- **Automate** **checks** in **CI**.
- **Review** **RSC** **imports** in **PRs**.

---

## 4.5 Server Actions

### 'use server' Directive

**Beginner Level:** **`'use server'`** marks **functions** that **run** **only** on the **server** when **called** from **forms** or **client** code—**save** **profile** **safely**.

**Intermediate Level:** **File-level** or **function-level** directive. **Actions** are **POST** requests under the hood with **framework** wiring. **Signatures** must be **serializable** arguments.

**Expert Level:** **Security**: **verify** sessions **inside** **every** action; **CSRF** protections depend on **framework** version/setup—follow **latest** guidance. **Idempotency** keys for **payments**.

```typescript
'use server';

import { revalidatePath } from 'next/cache';

export async function updateDisplayName(formData: FormData) {
  const name = String(formData.get('name') ?? '');
  if (name.length < 2) return { ok: false as const, error: 'Name too short' };
  // await db.user.update(...);
  revalidatePath('/settings/profile');
  return { ok: true as const };
}
```

#### Key Points

- **Never** **trust** **client**-supplied IDs without **authz**.
- **Return** **typed** **result** objects for **UI** handling.
- **Revalidate** after **mutations**.

---

### Forms and Server Actions

**Beginner Level:** `<form action={serverAction}>` **submits** without **writing** **`fetch`** by hand—**contact** **forms** on **marketing** sites.

**Intermediate Level:** **Hidden** fields for **CSRF** tokens when required; **progressive** enhancement **works** without JS for **basic** flows.

**Expert Level:** **Multipart** uploads; **streaming** **responses** from actions (when supported); **composition** with **validation** libraries on **server**.

```tsx
import { subscribeNewsletter } from './actions';

export default function NewsletterForm() {
  return (
    <form action={subscribeNewsletter} className="space-y-2">
      <input name="email" type="email" required className="border px-2 py-1" />
      <button type="submit" className="rounded bg-black px-3 py-2 text-white">
        Subscribe
      </button>
    </form>
  );
}
```

#### Key Points

- **Validate** on **server** always.
- **Accessible** forms by default.
- **Handle** **spam** with **rate** limits.

---

### useFormState

**Beginner Level:** Hook to **read** **messages** back from **actions**—**“Email** **sent!”** or **errors** on a **login** form.

**Intermediate Level:** **Pairs** **state** with **action** **results** for **client** **UI** while **submission** still **hits** **server** action.

**Expert Level:** **Type** **discriminated** unions for **results**; **avoid** **duplicating** **validation** messages between **client** and **server**—**server** is **source** of truth.

```tsx
'use client';

import { useFormState } from 'react-dom';
import { authenticate } from './actions';

const initialState = { error: '' as string };

export function LoginForm() {
  const [state, formAction] = useFormState(authenticate, initialState);
  return (
    <form action={formAction} className="space-y-2">
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Sign in</button>
      {state.error ? <p role="alert">{state.error}</p> : null}
    </form>
  );
}
```

#### Key Points

- **Great** for **progressive** **enhancement** UX.
- **Keep** **state** **minimal**.
- **Localize** **strings** server-side if possible.

---

### useFormStatus

**Beginner Level:** **Disable** **submit** **button** while **form** **posts**—**prevents** **double** **checkout** **charges**.

**Intermediate Level:** **Must** be used in **child** of **`form`**; exposes **`pending`**.

**Expert Level:** **Combine** with **optimistic** UI carefully—**reconcile** on **server** **response**; **watch** **accessibility** (**aria-busy**).

```tsx
'use client';

import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending}>
      {pending ? 'Placing order…' : 'Place order'}
    </button>
  );
}
```

#### Key Points

- **Prevents** **duplicate** submissions.
- **Nest** **correctly** under **`form`**.
- **Pair** with **clear** **pending** copy.

---

### Progressive Enhancement

**Beginner Level:** Forms **work** even if **JavaScript** **fails**—**better** **reliability** for **global** **audiences**.

**Intermediate Level:** **Server Actions** as **form** actions; **enhance** with **client** hooks **progressively**.

**Expert Level:** **Baseline** **no-JS** paths for **critical** flows (**password** reset, **billing**); **layer** **rich** UX **atop**.

#### Key Points

- **Prioritize** **critical** paths.
- **Test** with **JS** disabled occasionally.
- **Don’t** **block** server success on **client** only.

---

### Server Action Security

**Beginner Level:** **Always** **check** **who** the **user** is before **changing** **data**—**no** **anonymous** **admin** **deletes**.

**Intermediate Level:** **Session** validation, **organization** scoping, **rate** limiting, **input** validation.

**Expert Level:** **Replay** attack mitigations for **state-changing** endpoints; **double** submit **idempotency**; **WAF**/**bot** protection; **audit** **logging** for **SaaS** **compliance**.

#### Key Points

- **Authn** + **Authz** on **every** action.
- **Minimize** **exposed** surface area.
- **Monitor** **abuse** signals.

---

### Validation

**Beginner Level:** **Check** **email** **format** and **required** fields **on the server**—**bots** bypass **browsers**.

**Intermediate Level:** **Zod**/**Valibot** schemas shared where possible; **return** **field** errors.

**Expert Level:** **Unicode** normalization; **PII** validation rules; **business** invariants (**inventory** **≥** **qty**) in **transactions**.

```typescript
'use server';

import { z } from 'zod';

const schema = z.object({ sku: z.string().min(1), qty: z.number().int().positive() });

export async function addLineItem(raw: unknown) {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, errors: parsed.error.flatten() };
  // ... persist
  return { ok: true as const };
}
```

#### Key Points

- **Schema-first** validation.
- **Never** **skip** server validation.
- **Map** errors to **accessible** UI.

---

### Error Handling in Actions

**Beginner Level:** **Return** **nice** **errors** instead of **crashing**—**“Card** **declined”** on **subscriptions**.

**Intermediate Level:** **Discriminated** unions **`{ ok: true } | { ok: false, code }`**. **Log** **internals**, **show** **safe** messages.

**Expert Level:** **Compensating** transactions; **retry** guidance; **correlation** IDs for **support**.

#### Key Points

- **Distinguish** **user** vs **system** errors.
- **Observability** without **leaks**.
- **Localized** messaging strategies.

---

### Revalidation After Mutations

**Beginner Level:** After **adding** **a blog post**, **refresh** the **list** so **readers** **see** it—**revalidation** does that.

**Intermediate Level:** **`revalidatePath`**, **`revalidateTag`** (per **version** docs). **Choose** **path** vs **tag** **granularity**.

**Expert Level:** **On-demand** ISR with **CMS** webhooks; **stale-while-revalidate** user experiences; **cache** **coherency** across **CDNs**.

```typescript
'use server';

import { revalidateTag } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = String(formData.get('title') ?? '');
  // await save...
  revalidateTag('posts');
  return { ok: true as const };
}
```

#### Key Points

- **Revalidate** **minimal** **scope** needed.
- **Tag** **many** readers **efficiently**.
- **Test** **race** conditions between **read**/**write**.

---

## 4.6 Server Component Context

### headers()

**Beginner Level:** Read **HTTP** **headers** like **`accept-language`** to **guess** **locale** for a **travel** **site**.

**Intermediate Level:** **`import { headers } from 'next/headers'`** async in **latest** patterns—**follow** **typed** APIs for your **Next** **version**. **Do not** **cache** **misleadingly** if **response** varies by **header**.

**Expert Level:** **Vary** responses carefully with **CDN** **caching**; **forward** **selected** headers to **upstream** **with** **allowlists** only.

```typescript
import { headers } from 'next/headers';

export async function LocaleHint() {
  const h = await headers();
  const accept = h.get('accept-language') ?? 'en';
  return <p>Detected language hint: {accept.split(',')[0]}</p>;
}
```

#### Key Points

- **Headers** imply **dynamic** behavior often.
- **Never** **trust** **client** IP headers without **proxy** awareness.
- **Document** **caching** implications.

---

### cookies()

**Beginner Level:** Read **session** **cookie** to **personalize** a **dashboard** **greeting**.

**Intermediate Level:** **`cookies()`** from **`next/headers`**; **set**/**delete** in **Server Actions** or **route handlers** with **options** (**httpOnly**, **secure**, **sameSite**).

**Expert Level:** **Rotation** strategies; **tenant** **isolation**; **encryption** for **sensitive** **cookie** payloads—**prefer** **opaque** **tokens**.

```typescript
import { cookies } from 'next/headers';

export async function readTheme() {
  const store = await cookies();
  return store.get('theme')?.value ?? 'light';
}
```

#### Key Points

- **HttpOnly** cookies for **sessions**.
- **SameSite** policies for **CSRF** mitigation.
- **Minimize** **PII** in cookies.

---

### params in Server Components

**Beginner Level:** **URL** **placeholders** like **`[id]`** become **`params`** for **loading** **the right** **order** in **SaaS**.

**Intermediate Level:** **Await** **`params`** when **typed** as **Promise** in **new** Next **versions**. **Validate** with **Zod**.

**Expert Level:** **Multi-tenant** **`[orgSlug]`** resolution to **internal** **org IDs**—**never** **trust** slug alone without **DB** lookup **and** **authz**.

#### Key Points

- **Params** are **untrusted** input.
- **Map** **slugs** to **internal** IDs.
- **Keep** types **in sync** with **file** structure.

---

### searchParams

**Beginner Level:** **Query** strings like **`?tab=billing`** **control** **which** **panel** **shows** on **settings**.

**Intermediate Level:** **`searchParams`** prop on **`page.tsx`**; **await** if **async** API. **Coerce** types **safely**.

**Expert Level:** **Canonicalization** for **SEO** on **marketing** pages; **avoid** **infinite** **facet** combinations **indexed**; **validate** **enum** values.

```tsx
type Props = { searchParams: Promise<{ tab?: string }> };

export default async function Settings({ searchParams }: Props) {
  const { tab } = await searchParams;
  const active = tab === 'security' ? 'security' : 'profile';
  return <section>Active tab: {active}</section>;
}
```

#### Key Points

- **Treat** as **public** input.
- **Normalize** **unknown** values.
- **Align** **analytics** naming.

---

### Request Context (Holistic)

**Beginner Level:** **“Where** am **I?”** on the **server**: **which** **user**, **which** **headers**, **which** **route** **params**—**context** **answers** that for a **support** **portal**.

**Intermediate Level:** **Compose** **`headers()`**, **`cookies()`**, **`params`**, **`searchParams`** to **authorize** and **personalize**. **Avoid** **global** singletons tied to **requests**.

**Expert Level:** **AsyncLocalStorage** patterns (if used) must **align** with **Next** **runtime**; **edge** vs **node** differences; **testing** **doubles** for **context** in **unit** tests.

#### Key Points

- **Thread** **context** through **functions** **explicitly** when possible.
- **No** **hidden** **globals** for **request** data.
- **Mock** **context** in **tests**.

---

### Advanced: Request Context Patterns in SaaS

**Beginner Level:** **One** **function** **`getCurrentUser()`** used by **many** **pages**—**DRY** **auth** for a **simple** **app**.

**Intermediate Level:** **Centralize** **session** parsing; **attach** **`orgId`**, **`roles`**; **short-circuit** **unauthorized** **routes** early.

**Expert Level:** **Feature** **flags** per **tenant**; **request** **scoping** for **DB** **RLS** **SET** commands; **correlation** IDs **propagated** to **logs**/**traces**.

```typescript
import 'server-only';
import { cookies } from 'next/headers';

export type Session = { userId: string; orgId: string; roles: string[] };

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get('session')?.value;
  if (!token) return null;
  // verify JWT / session store
  return { userId: 'u_1', orgId: 'o_9', roles: ['admin'] };
}
```

#### Key Points

- **Single** **source** of truth for **session** parsing.
- **Minimize** **per-request** work with **caching** where **safe**.
- **Test** **authorization** **matrix** thoroughly.

---

### Telemetry and Server Components

**Beginner Level:** **Log** **which** **product** **page** **rendered**—helps **debug** **“wrong** **price”** **reports**.

**Intermediate Level:** **Structured** logging with **route**, **user** **id**, **timing** per **fetch**.

**Expert Level:** **OTel** spans around **server** **render** phases; **sampling**; **PII** **scrubbing**; **dashboards** per **tenant** **SLO**.

#### Key Points

- **Correlate** **client** and **server** traces.
- **Measure** **fetch** durations.
- **Protect** **privacy**.

---

### Caching Mental Model for RSC Data

**Beginner Level:** **Some** **data** **can** be **remembered** for **everyone**; **some** **must** be **fresh** **per** **login**—**caching** is that **distinction**.

**Intermediate Level:** **`fetch` cache**, **`revalidate`**, **`no-store`**, **tags**, **path** revalidation—**compose** consciously.

**Expert Level:** **Full Route Cache** vs **Data Cache** vs **Router Cache** (per **docs**); **stale-while-revalidate** UX; **cache** **poisoning** defenses.

#### Key Points

- **Draw** **diagrams** for **team** alignment.
- **Test** **mutations** + **reads** **together**.
- **Revisit** after **framework** upgrades.

---

### Edge vs Node Runtime for Server Logic

**Beginner Level:** Some code runs **closer** to **users** (**edge**), some needs **full** **Node** APIs—like choosing a **food truck** (**edge**) vs a **full** **kitchen** (**node**) for a **festival** **vendor** app.

**Intermediate Level:** **Route handlers** and **middleware** can set **`export const runtime = 'edge'`** where supported. **Prisma** and **native** modules often require **Node**. **Decide** per **route**.

**Expert Level:** **Latency** vs **compatibility** tradeoffs; **WASM** **fallbacks**; **secrets** availability on **edge**; **data** **locality** (global KV vs regional SQL). **Load** test **cold** starts on **serverless** **edge**.

```typescript
export const runtime = 'nodejs'; // explicit when using Node-only SDKs
```

#### Key Points

- **Pick** runtime based on **dependencies** and **latency** goals.
- **Avoid** **accidental** **edge** deployment of **Node-only** libraries.
- **Measure** **p95** on **both** runtimes.

---

### Anti-Patterns: Fat Server Pages

**Beginner Level:** One **giant** file that **does** **everything** is **hard** to **read**—like a **messy** **closet** in a **shared** **apartment**.

**Intermediate Level:** **Split** **data** loaders, **presentational** components, and **actions** into **modules**. **Unit** test **loaders** independently.

**Expert Level:** **Domain-driven** folders; **bounded** **contexts** for **SaaS** modules (**billing**, **crm**). **Enforce** **maximum** file **lines** via **lint** rules.

#### Key Points

- **Refactor** early when **files** exceed **team** **thresholds**.
- **Colocate** but **compose** smaller units.
- **Clarify** **ownership** in **monorepos**.

---

### Testing Server Components and Actions

**Beginner Level:** **Run** **pure** **loader** functions with **mocked** **HTTP**—ensure **blog** **titles** **parse** correctly.

**Intermediate Level:** **Vitest** for **utilities**; **integration** tests invoking **actions** with **fake** **sessions**; **MSW** for **`fetch`**.

**Expert Level:** **Contract** tests between **actions** and **database** **schemas**; **property-based** tests for **validators**; **load** tests on **hot** **mutations** such as **inventory** **reservations**.

#### Key Points

- **Test** **authorization** **matrices** **explicitly**.
- **Mock** **cookies** and **headers** in **unit** tests.
- **Prefer** **behavior** assertions over **large** **snapshots**.

---

### Working with CMS and Draft Mode

**Beginner Level:** **Preview** **unpublished** **articles** for a **magazine** site before **going** **live**.

**Intermediate Level:** **`draftMode()`** from **`next/headers`** enables **preview** **APIs**; **revalidate** when **publishing**.

**Expert Level:** **Secure** **preview** **tokens**; **short-lived** **URLs**; **audit** **who** **viewed** **drafts** in **enterprise** **CMS** workflows.

```typescript
import { draftMode } from 'next/headers';

export async function enableDraftMode() {
  'use server';
  (await draftMode()).enable();
}
```

#### Key Points

- **Never** expose **draft** content **without** **authentication**.
- **Guard** **preview** routes in **production** **environments**.
- **Coordinate** with **CMS** **webhooks** for **revalidation**.

---

### Streaming Errors and Fallback UI

**Beginner Level:** If **recommendations** **fail**, show **“We** **couldn’t** **load** **suggestions”** instead of **failing** the **entire** **retail** **product** page.

**Intermediate Level:** **Error** boundaries around **Suspense** regions enable **partial** **degradation**.

**Expert Level:** **Typed** **error** channels from **loaders**; **retry** strategies; **stale** **fallback** caches for **read** paths.

#### Key Points

- **Degrade** **gracefully** per **widget**.
- **Log** **root** causes **server-side** only.
- **Preserve** **core** **purchase** flows when **addons** fail.

---

### Multi-Tenant Data Access Patterns

**Beginner Level:** Each **SaaS** **customer** sees **only** **their** **projects**—**filter** by **`orgId`**.

**Intermediate Level:** **Derive** **`orgId`** from **session**, not from **URL** alone. **Parameterize** **SQL** queries.

**Expert Level:** **Row-level** **security** in **Postgres**; **separate** **schemas** or **databases** for **enterprise** tiers; **cross-tenant** **admin** tooling with **break-glass** **audits**.

```typescript
import 'server-only';

export async function listProjects(orgId: string, sessionOrgId: string) {
  if (orgId !== sessionOrgId) throw new Error('Forbidden');
  return [];
}
```

#### Key Points

- **Defense** in depth: **middleware** plus **server** checks.
- **Never** **trust** **client-provided** tenant identifiers.
- **Audit** **administrative** **overrides**.

---

### Serialization DTOs at Boundaries

**Beginner Level:** Treat **client** **props** like **JSON**—**dates** become **strings**, not **live** **`Date`** objects.

**Intermediate Level:** **Convert** **`Map`** to **arrays**, **`Decimal`** to **string** or **number** with care, **BigInt** to **string**.

**Expert Level:** **ORM** entities may carry **non-serializable** fields—**map** to **DTOs** before passing across **boundaries**. **Centralize** **mappers** per **domain**.

```typescript
export type ProjectDto = { id: string; name: string; createdAt: string };

export function toProjectDto(model: { id: string; name: string; createdAt: Date }): ProjectDto {
  return { id: model.id, name: model.name, createdAt: model.createdAt.toISOString() };
}
```

#### Key Points

- **DTOs** reduce **accidental** **leaks** of **internal** models.
- **Test** **round-trip** conversions.
- **Document** **field** **meanings** for **client** consumers.

---

### Background Jobs vs Inline Server Work

**Beginner Level:** **Sending** **thousands** of **emails** **inline** during a **request** will **timeout**—**enqueue** a **job** like a **bakery** scheduling **next-day** **batches**.

**Intermediate Level:** **Offload** to **workers** (**BullMQ**, **SQS**, **Cloud Tasks**) from **Server Actions** via **enqueue** with **idempotency** keys.

**Expert Level:** **Transactional** **outbox** pattern; **at-least-once** delivery semantics; **reconciliation** jobs for **billing** **discrepancies**.

#### Key Points

- **Keep** **request** paths **fast** and **predictable**.
- **Design** **idempotent** workers.
- **Surface** **async** **status** in **UI** where **needed**.

---

### Versioning Public APIs Alongside RSC

**Beginner Level:** A **mobile** app may call **`/api/v1/orders`** while **web** uses **RSC**—**both** can **coexist** in a **marketplace**.

**Intermediate Level:** **Version** **route** **handlers**; **stabilize** **DTOs**; **communicate** **deprecations** via **headers** and **docs**.

**Expert Level:** **Consumer-driven** contracts; **OpenAPI** checks in **CI**; **incremental** migration from **REST** to **RSC** **without** **big** **bang** releases.

#### Key Points

- **Document** surfaces **even** for **internal** **mobile** teams.
- **Sunset** old versions using **telemetry** on **traffic**.
- **Align** **authentication** across **API** and **RSC** paths.

---

### Performance Budgets for Data-Heavy Dashboards

**Beginner Level:** **Limit** how many **rows** load on **first** **paint**—**paginate** **support** **tickets**.

**Intermediate Level:** **Cursor** pagination; **virtualize** large **tables** on the **client**; **server** sends **first** **page** only.

**Expert Level:** **Approximate** counts; **materialized** views for **KPIs**; **precompute** **heavy** aggregates **offline**.

#### Key Points

- **Paginate** by **default** on **admin** views.
- **Cache** **aggregates** with **explicit** **TTLs**.
- **Watch** **memory** on **wide** **joins**.

---

### Collaboration Tips for Full-Stack Teams

**Beginner Level:** **Front-end** and **back-end** teammates **share** the **same** **Next** **files**—**talk** **early** about **who** owns **which** **folder** in a **social** **app**.

**Intermediate Level:** **Define** **API** contracts for **Server Actions** and **route** **handlers**; **review** **PRs** with **security** **checklist** (**auth**, **validation**, **caching**).

**Expert Level:** **RFCs** for **data** **fetching** strategy changes; **on-call** **runbooks** for **stale** **cache** incidents; **shared** **Zod** schemas across **actions** and **forms**.

#### Key Points

- **Align** on **caching** semantics before **launch** **deadlines**.
- **Pair** **reviews** on **first** **Server** **Action** in a **repo**.
- **Document** **tenant** and **auth** assumptions in **README** snippets.

---

## Best Practices

- **Default** to **Server Components**; **add** **`'use client'`** only for **interactivity**, **effects**, or **browser** APIs.
- **Mark** modules with **`server-only`** when they contain **secrets** or **database** clients.
- **Validate** all **external** inputs (**`params`**, **`searchParams`**, **forms**, **JSON**) on the server.
- **Parallelize** independent **`fetch`** calls; **tag** caches for **targeted** revalidation after **mutations**.
- **Compose** **server** **content** through **`children`** into **client** **wrappers** instead of importing server modules into client.
- **Keep** **Server Actions** **small**, **idempotent** where possible, and **always** **authorized**.
- **Differentiate** **expected** **not found** vs **exceptional** errors with **`notFound()`** vs **`error.tsx`** patterns.
- **Document** **caching** policies per **route** in **larger** **teams** to avoid **stale** **dashboard** data incidents.
- **Monitor** **server** **CPU** and **latency** after **moving** logic from **client** to **server**—**RSC** shifts **cost** **profiles**.
- **Test** **critical** **flows** both **with** and **without** **JavaScript** when using **progressive** **enhancement**.
- **Define** **DTOs** at **server-to-client** boundaries for **complex** **domain** models in **enterprise** **dashboards**.
- **Choose** **edge** or **Node** **runtime** **explicitly** when **dependencies** differ (**ORM**, **image** **processing**, **crypto** APIs).
- **Offload** **long** **running** work to **queues** rather than **blocking** **Server Actions** or **route** **handlers**.

---

## Common Mistakes to Avoid

- **Importing** **`server-only`** modules into **`'use client'`** files—**build** failures or **accidental** **bundling** attempts.
- **Passing** **non-serializable** props (**class instances**, **functions** besides **Server Actions**) to **Client Components**.
- **Using** **`useState`**/**`useEffect`** in **Server Components**—**split** a **client** **child** instead.
- **Trusting** **`searchParams`** or **`params`** for **authorization** without **server-side** verification against **session**/**DB**.
- **Creating** **`fetch`** **waterfalls** that **inflate** **TTFB** on **e-commerce** **PDPs**.
- **Forgetting** **`revalidatePath`**/**`revalidateTag`** after **mutations**, showing **stale** **carts** or **feeds**.
- **Leaking** **PII** in **logs** when **debugging** **Server Actions**.
- **Overusing** **dynamic** **`headers()`**/**`cookies()`** without **understanding** **cache** **de-opt** behavior.
- **Duplicating** **validation** only on the **client**—**bots** and **malicious** clients **bypass** it.
- **Giant** **`'use client'`** **trees** that **negate** **RSC** **benefits**.
- **Running** **CPU-heavy** **work** **inline** on **hot** **routes** without **queues** or **caching**, causing **timeouts** during **sales** **events**.
- **Mixing** **edge** and **Node** **assumptions** in **shared** **modules**, leading to **runtime** **crashes** in **production**.
- **Returning** **ORM** **entities** **directly** to **Client Components**, breaking **serialization** or **leaking** **internal** **fields**.

---

*Server Components and Server Actions continue to evolve—verify APIs against the Next.js and React documentation for your exact framework versions.*
