# Real-World Projects (React + TypeScript)

This chapter ties **React + TypeScript** skills to **production-shaped** applications: **e-commerce**, **social media**, **analytics dashboards**, **authentication**, and **real-time** experiences. Each section includes **folder layouts**, **domain types**, and **patterns** you can adapt—illustrated with **shopping carts**, **feeds**, **charts**, **JWT** sessions, **WebSocket** **chat**, and **notifications**.

---

## 📑 Table of Contents

- [Real-World Projects (React + TypeScript)](#real-world-projects-react--typescript)
  - [📑 Table of Contents](#-table-of-contents)
  - [24.1 E-commerce Application](#241-e-commerce-application)
    - [Product Catalog](#product-catalog)
    - [Shopping Cart](#shopping-cart)
    - [Checkout Flow](#checkout-flow)
    - [Payment Integration](#payment-integration)
    - [Order Management](#order-management)
  - [24.2 Social Media App](#242-social-media-app)
    - [Feed Implementation](#feed-implementation)
    - [Post Creation](#post-creation)
    - [Comments and Likes](#comments-and-likes)
    - [Real-time Updates](#real-time-updates)
    - [User Profiles](#user-profiles)
  - [24.3 Dashboard Application](#243-dashboard-application)
    - [Data Visualization](#data-visualization)
    - [Charts and Graphs](#charts-and-graphs)
    - [Tables and Pagination](#tables-and-pagination)
    - [Filters and Search](#filters-and-search)
    - [Export](#export)
  - [24.4 Authentication System](#244-authentication-system)
    - [Login/Signup Forms](#loginsignup-forms)
    - [JWT Token Management](#jwt-token-management)
    - [Protected Routes](#protected-routes)
    - [Role-based Access](#role-based-access)
    - [OAuth Integration](#oauth-integration)
  - [24.5 Real-time Features](#245-real-time-features)
    - [WebSocket Integration](#websocket-integration)
    - [Chat Application](#chat-application)
    - [Notifications](#notifications)
    - [Collaborative Editing](#collaborative-editing)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices (Global)](#best-practices-global)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 24.1 E-commerce Application

### Product Catalog

**Beginner Level**

A **catalog** lists **products** with **filters** (category, price), **sort**, and **pagination**. Data usually comes from **`GET /products?category=shoes&page=2`**. React renders **cards**; URL holds **shareable** filter state.

**Real-time example**: **Sneaker** store shows **thumbnail**, **title**, **price**, **rating**—click opens **Product Detail Page (PDP)**.

**Intermediate Level**

**TanStack Query** caches **`['products', query]`** keys. **Skeleton** loaders for **LCP** placeholders. **Types** separate **DTO** from **view model** (formatted money strings).

**Expert Level**

**Algolia/Meilisearch** for **faceted** search; **ISR** or **edge** caching for **popular** categories. **A/B** pricing behind **feature flags**.

**Example project structure**

```text
apps/storefront/
  src/
    app/
      routes/
        products.index.tsx
        products.$productId.tsx
    features/
      catalog/
        api/productQueries.ts
        components/ProductCard.tsx
        components/ProductGrid.tsx
        types.ts
    components/ui/
```

```typescript
// features/catalog/types.ts
export type Money = { currency: "USD"; amountMinor: number };

export type ProductSummary = {
  id: string;
  slug: string;
  title: string;
  price: Money;
  heroImageUrl: string;
  ratingAvg: number;
  reviewCount: number;
};

export type ProductListResponse = {
  items: ProductSummary[];
  page: number;
  pageSize: number;
  total: number;
};
```

```tsx
// features/catalog/components/ProductCard.tsx
import type { ProductSummary } from "../types";

type Props = { product: ProductSummary; onAdd: (id: string) => void };

function formatMoney(m: ProductSummary["price"]): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: m.currency }).format(
    m.amountMinor / 100,
  );
}

export function ProductCard({ product, onAdd }: Props) {
  return (
    <article className="card">
      <img src={product.heroImageUrl} alt="" loading="lazy" width={320} height={320} />
      <h3>{product.title}</h3>
      <p>{formatMoney(product.price)}</p>
      <button type="button" onClick={() => onAdd(product.id)}>
        Add to cart
      </button>
    </article>
  );
}
```

#### Key Points — Product Catalog

- **Stable** **`id`** keys in grids; **virtualize** long lists.
- **SEO**: framework **SSR** or **pre-render** PDP routes.
- **Analytics**: **`view_item_list`** / **`select_item`** events at boundaries.

---

### Shopping Cart

**Beginner Level**

**Cart** state: **line items** `{ sku, qty, unitPriceSnapshot }`. **Add** increments or inserts row. **Persist** to **`localStorage`** for guests; **merge** on login.

**Intermediate Level**

**Optimistic** UI with **rollback** on **`409`** **inventory** conflicts. **Zustand**/**Redux** slice **`cart`** with **selectors** for **subtotal**.

**Expert Level**

**Distributed** **inventory** reservations—**server** authoritative; client shows **pending** states.

```typescript
export type CartLine = {
  sku: string;
  title: string;
  qty: number;
  unitPriceMinor: number;
  currency: "USD";
};

export type CartState = {
  lines: CartLine[];
};

export function cartSubtotalMinor(c: CartState): number {
  return c.lines.reduce((sum, li) => sum + li.qty * li.unitPriceMinor, 0);
}
```

```tsx
import { useMemo } from "react";
import type { CartLine, CartState } from "./cartTypes";

export function CartSummary({ cart }: { cart: CartState }) {
  const subtotal = useMemo(() => cartSubtotalMinor(cart), [cart]);

  const formatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(subtotal / 100);

  return (
    <aside aria-labelledby="cart-heading">
      <h2 id="cart-heading">Cart</h2>
      <ul>
        {cart.lines.map((li: CartLine) => (
          <li key={li.sku}>
            {li.title} × {li.qty}
          </li>
        ))}
      </ul>
      <p>
        Subtotal: <output>{formatted}</output>
      </p>
    </aside>
  );
}
```

#### Key Points — Shopping Cart

- **Snapshot** prices at **add** time; **refresh** on **checkout** start.
- **Abandonment** analytics: funnel **drops** at **shipping**.

---

### Checkout Flow

**Beginner Level**

**Steps**: **Cart review → Shipping → Payment → Confirmation**. **React state machine** or **router** nested routes **`/checkout/shipping`**.

**Intermediate Level**

**React Hook Form** + **Zod** resolver for **addresses**. **Card** fields via **Stripe Elements** (PCI scope reduction).

**Expert Level**

**Idempotent** **`POST /orders`** with **client** **`Idempotency-Key`** header. **3DS** **SCA** redirects handled via **return URLs**.

```typescript
import { z } from "zod";

export const AddressSchema = z.object({
  fullName: z.string().min(2),
  line1: z.string().min(3),
  city: z.string().min(2),
  postalCode: z.string().min(3),
  country: z.string().length(2),
});

export type ShippingAddress = z.infer<typeof AddressSchema>;
```

```tsx
import { useState } from "react";
import { AddressSchema, type ShippingAddress } from "./schemas";

type Step = "shipping" | "payment" | "review";

export function CheckoutWizard() {
  const [step, setStep] = useState<Step>("shipping");
  const [address, setAddress] = useState<ShippingAddress | null>(null);

  return (
    <section>
      {step === "shipping" && (
        <ShippingStep
          onNext={(a) => {
            setAddress(a);
            setStep("payment");
          }}
        />
      )}
      {step === "payment" && address ? (
        <PaymentStep address={address} onBack={() => setStep("shipping")} />
      ) : null}
    </section>
  );
}

function ShippingStep({ onNext }: { onNext: (a: ShippingAddress) => void }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const parsed = AddressSchema.safeParse(Object.fromEntries(fd.entries()));
        if (parsed.success) onNext(parsed.data);
      }}
    >
      {/* controlled fields in real apps */}
      <button type="submit">Continue</button>
    </form>
  );
}

function PaymentStep({
  address,
  onBack,
}: {
  address: ShippingAddress;
  onBack: () => void;
}) {
  return (
    <div>
      <p>
        Ship to {address.fullName}, {address.city}
      </p>
      <button type="button" onClick={onBack}>
        Back
      </button>
    </div>
  );
}
```

#### Key Points — Checkout Flow

- **Minimize** steps; **guest** checkout option.
- **Telemetry** each step timing for **drop-off** analysis.

---

### Payment Integration

**Beginner Level**

Use **Stripe**/**PayPal** **hosted** fields or **redirect** flows—**never** **POST** raw PAN to your server unless **PCI** program demands it.

**Intermediate Level**

**`stripe.confirmPayment`** with **Elements**; **webhooks** on server finalize **order** state **`paid`**.

**Expert Level**

**Multi-currency** **presentment**, **tax** **VAT** **IDs**, **marketplace** **split** payments.

```typescript
export type PaymentIntentClient = {
  clientSecret: string;
  publishableKey: string;
};

export async function createPaymentIntent(orderId: string): Promise<PaymentIntentClient> {
  const res = await fetch(`/api/orders/${orderId}/payment-intent`, { method: "POST" });
  if (!res.ok) throw new Error("pi_failed");
  return (await res.json()) as PaymentIntentClient;
}
```

```tsx
// Skeleton: real integration uses @stripe/react-stripe-js Elements
export function PayButton({ clientSecret }: { clientSecret: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        void clientSecret; // stripe.confirmCardPayment(clientSecret, ...)
      }}
    >
      Pay now
    </button>
  );
}
```

#### Key Points — Payment Integration

- **Webhook** is **source of truth** for **paid** status.
- **Test** **cards** in **staging** only; **rotate** **keys** per environment.

---

### Order Management

**Beginner Level**

**Order history** page: **`GET /orders`** **paginated** table with **status** badge (**processing**, **shipped**).

**Intermediate Level**

**Detail** view **`GET /orders/:id`** with **timeline** component fed by **status events**.

**Expert Level**

**OMS** integrations (**ShipStation**), **returns** **RMA** flow, **partial** **refunds**.

```typescript
export type OrderStatus = "pending_payment" | "paid" | "fulfilled" | "cancelled";

export type OrderSummary = {
  id: string;
  placedAt: string;
  status: OrderStatus;
  totalMinor: number;
  currency: "USD";
};

export type OrderDetail = OrderSummary & {
  lines: { sku: string; title: string; qty: number; unitMinor: number }[];
  tracking?: { carrier: string; code: string };
};
```

```tsx
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const label: Record<OrderStatus, string> = {
    pending_payment: "Awaiting payment",
    paid: "Paid",
    fulfilled: "Shipped",
    cancelled: "Cancelled",
  };
  return <span data-status={status}>{label[status]}</span>;
}
```

#### Key Points — Order Management

- **Optimistic** **cancel** risky—**confirm** with **server**.
- **Support** tools: **deep link** to **order** from **email** **token**.

---

## 24.2 Social Media App

### Feed Implementation

**Beginner Level**

**Infinite** **scroll** **feed**: **`useInfiniteQuery`** with **`getNextPageParam`**. Each **post** **card** shows **author**, **media**, **snippet**.

**Intermediate Level**

**Virtualization** for **long** sessions. **Prefetch** **next** page on **sentinel** **intersection**.

**Expert Level**

**Ranked** **feed** **ML** scores from server; **client** only **renders**—**no** **re-sort** locally beyond **insert** **optimistic** posts.

```text
apps/social/
  src/features/feed/
    api/useFeed.ts
    components/FeedList.tsx
    components/PostCard.tsx
```

```typescript
export type PostId = string;
export type UserId = string;

export type Post = {
  id: PostId;
  authorId: UserId;
  authorHandle: string;
  createdAt: string;
  text: string;
  mediaUrl?: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
};
```

```tsx
import type { Post } from "./types";
import { useInView } from "react-intersection-observer"; // or custom hook

type Props = {
  posts: Post[];
  hasNextPage: boolean;
  fetchNextPage: () => void;
};

export function FeedList({ posts, hasNextPage, fetchNextPage }: Props) {
  const { ref, inView } = useInView();

  // when sentinel visible, load more
  // useEffect(() => { if (inView && hasNextPage) fetchNextPage(); }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div>
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
      {hasNextPage ? <div ref={ref} aria-hidden /> : null}
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <article>
      <header>
        <span>@{post.authorHandle}</span>
        <time dateTime={post.createdAt}>{post.createdAt}</time>
      </header>
      <p>{post.text}</p>
    </article>
  );
}
```

#### Key Points — Feed Implementation

- **Stable** **`post.id`** keys; **avoid** **index** when **pagination** shifts.
- **Sensitive** **content** moderation **server-side**.

---

### Post Creation

**Beginner Level**

**Composer** **textarea**, **character** **count**, **`POST /posts`**. **Disable** **submit** while **pending**.

**Intermediate Level**

**Media** **upload** to **object** **storage** then **`mediaUrl`** in **body**. **Draft** **autosave** **`localStorage`**.

**Expert Level**

**Rich** **text** **markdown** with **sanitization**; **mentions** **`@handle`** **typeahead**.

```tsx
import { useState } from "react";

export function Composer({ onCreated }: { onCreated: () => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("post_failed");
      setText("");
      onCreated();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label htmlFor="post-text">What’s happening?</label>
      <textarea
        id="post-text"
        maxLength={280}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="button" disabled={busy || text.trim().length === 0} onClick={() => void submit()}>
        Post
      </button>
    </div>
  );
}
```

#### Key Points — Post Creation

- **Rate** **limit** client UX (cooldown) + **server** enforcement.
- **Optimistic** **insert** with **rollback** on failure.

---

### Comments and Likes

**Beginner Level**

**Threaded** **comments**: **`GET /posts/:id/comments`**. **Like** toggles **`POST /posts/:id/like`**.

**Intermediate Level**

**Optimistic** **like** with **`useMutation`** **onMutate** **rollback**. **Pagination** **comments** **cursor**.

**Expert Level**

**Real-time** **comment** **counts** via **WebSocket** or **SSE** (see §24.5).

```typescript
export type Comment = {
  id: string;
  postId: string;
  authorHandle: string;
  text: string;
  createdAt: string;
};
```

```tsx
import { useState } from "react";

type LikeState = { count: number; liked: boolean };

export function LikeButton({ postId, initial }: { postId: string; initial: LikeState }) {
  const [state, setState] = useState<LikeState>(initial);
  const [pending, setPending] = useState(false);

  async function toggle() {
    const previous = state;
    const next: LikeState = {
      count: state.count + (state.liked ? -1 : 1),
      liked: !state.liked,
    };
    setState(next);
    setPending(true);
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (!res.ok) setState(previous);
    } finally {
      setPending(false);
    }
  }

  return (
    <button type="button" onClick={() => void toggle()} disabled={pending}>
      ♥ {state.count}
    </button>
  );
}
```

*For concurrent-friendly optimistic updates, React 19’s **`useOptimistic`** or TanStack Query’s **`useMutation`** (`onMutate` / `onError`) are common upgrades.*

#### Key Points — Comments and Likes

- **Debounce** **not** usually needed for **like**—**idempotent** **toggle** server-side.
- **Nest** **depth** limits to prevent **UI** **explosion**.

---

### Real-time Updates

**Beginner Level**

**WebSocket** channel **`feed:{userId}`** pushes **new** **posts**; **prepend** to **query** **cache**.

**Intermediate Level**

**Reconnect** **backoff** + **resume** **cursor**. **Toast** “**New posts**” **button** vs **auto** **scroll** **jump** (bad UX).

**Expert Level**

**CRDT**/**OT** for **collaborative** **editing** (see §24.5); **fanout** **Kafka** behind **socket** **server**.

#### Key Points — Real-time Updates

- **Don’t** **lose** **pagination** **cursor** on **prepend**.
- **Throttle** **DOM** **updates** for **high** **throughput** **firehose** **feeds**.

---

### User Profiles

**Beginner Level**

**Profile** **`/u/:handle`**: **avatar**, **bio**, **followers** **count**, **tabs** **Posts**/**Media**.

**Intermediate Level**

**Follow** **mutation** updates **cache** for **both** users. **Private** **profiles** **gate** **content**.

**Expert Level**

**Verification** **badges**, **PWA** **share** **targets**, **OpenGraph** **meta** via **SSR**.

```typescript
export type PublicProfile = {
  userId: UserId;
  handle: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  followers: number;
  following: number;
  followsYou: boolean;
};
```

```tsx
export function ProfileHeader({ p }: { p: PublicProfile }) {
  return (
    <header>
      <img src={p.avatarUrl} alt="" width={96} height={96} />
      <h1>{p.displayName}</h1>
      <p>@{p.handle}</p>
      <p>{p.bio}</p>
    </header>
  );
}
```

#### Key Points — User Profiles

- **Report/block** flows for **trust** **safety**.
- **Cache** **invalidation** on **avatar** **upload**.

---

## 24.3 Dashboard Application

### Data Visualization

**Beginner Level**

**KPI** **tiles**: **revenue**, **orders**, **conversion**. **Fetch** **`GET /metrics/summary?range=7d`**.

**Intermediate Level**

**Recharts/Visx** for **charts**; **loading** **skeletons** for **each** **widget**.

**Expert Level**

**Cross-filter** **dashboards** (click **bar** **filters** **table**) with **global** **filter** **context**.

```text
apps/dashboard/
  src/features/analytics/
    components/KpiCard.tsx
    components/RevenueChart.tsx
    hooks/useSummaryMetrics.ts
```

```typescript
export type Kpi = {
  id: "revenue" | "orders" | "aov";
  label: string;
  value: number;
  deltaPct: number;
  currency?: "USD";
};
```

#### Key Points — Data Visualization

- **Accessible** **colors** + **patterns** beyond **hue**.
- **Empty** and **error** states per **widget**.

---

### Charts and Graphs

**Beginner Level**

**Line** **chart** **revenue** over **time**; **tooltip** **formats** **currency**.

**Intermediate Level**

**Downsample** **large** **series** server-side. **`ResponsiveContainer`** for **resize**.

**Expert Level**

**Brush** **zoom**, **compare** **periods**, **export** **PNG** via **canvas** **toBlob**.

```tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type Point = { t: string; revenue: number };

export function RevenueLine({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="t" />
        <YAxis />
        <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
        <Line type="monotone" dataKey="revenue" stroke="#2563eb" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

#### Key Points — Charts and Graphs

- **Timezone** **explicit** on **axes** (business **TZ** vs **UTC**).
- **Memoize** **data** transforms **outside** render when **heavy**.

---

### Tables and Pagination

**Beginner Level**

**TanStack Table** for **sorting**/**pagination**. **Server** **pagination**: **`page`**, **`pageSize`**.

**Intermediate Level**

**Column** **visibility**/**pinning**. **Row** **selection** for **bulk** **actions**.

**Expert Level**

**Virtualized** **rows** **100k+** **records** with **server** **cursor**.

```typescript
export type OrderRow = {
  id: string;
  customer: string;
  placedAt: string;
  totalMinor: number;
  status: string;
};

export type Paged<T> = { rows: T[]; total: number; page: number; pageSize: number };
```

```tsx
import { useMemo, useState } from "react";

export function OrdersTable({ page, onPageChange }: { page: number; onPageChange: (p: number) => void }) {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const totalPages = useMemo(() => 10, []); // from API

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.customer}</td>
              <td>{(r.totalMinor / 100).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <nav aria-label="Pagination">
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Prev
        </button>
        <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </button>
      </nav>
    </div>
  );
}
```

#### Key Points — Tables and Pagination

- **Sticky** **header** for **long** **tables**.
- **CSV** **export** **matches** **visible** **columns** **policy**.

---

### Filters and Search

**Beginner Level**

**Controlled** **filters** **synced** to **URL** **`?status=paid&from=2025-01-01`**.

**Intermediate Level**

**Debounced** **search** **box**. **Reset** **filters** **button**.

**Expert Level**

**Saved** **views** **per** **user** **stored** **server-side**.

```tsx
import { useSearchParams } from "react-router-dom";

export function OrderFilters() {
  const [params, setParams] = useSearchParams();

  const status = params.get("status") ?? "";

  return (
    <label>
      Status
      <select
        value={status}
        onChange={(e) => {
          const next = new URLSearchParams(params);
          if (e.target.value) next.set("status", e.target.value);
          else next.delete("status");
          setParams(next);
        }}
      >
        <option value="">Any</option>
        <option value="paid">Paid</option>
        <option value="fulfilled">Fulfilled</option>
      </select>
    </label>
  );
}
```

#### Key Points — Filters and Search

- **Shareable** **URLs** for **support** **repro**.
- **Validate** **date** **ranges** client + server.

---

### Export

**Beginner Level**

**`GET /reports/orders.csv`** **opens** **download** via **`window.location`** or **`fetch`** returning a **`Blob`** (then **`downloadBlob`**).

**Intermediate Level**

**Large** **exports** **async** **job** + **email** **link** **when** **ready**.

**Expert Level**

**Row-level** **security** **applied** **on** **export** **endpoint**—same as **UI**.

```typescript
export async function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

#### Key Points — Export

- **Audit** **log** **exports** for **compliance**.
- **Stream** **CSV** **generation** **server-side** for **memory** **bounds**.

---

## 24.4 Authentication System

### Login/Signup Forms

**Beginner Level**

**Controlled** **email/password** fields, **`POST /auth/login`**, **store** **session** per **strategy** (cookie vs token).

**Intermediate Level**

**Zod** **schemas**, **password** **strength** meter, **ARIA** **errors**.

**Expert Level**

**Passkeys/WebAuthn**, **email** **magic** **links**, **bot** **protection** (**CAPTCHA**).

```typescript
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginValues = z.infer<typeof LoginSchema>;
```

```tsx
import { useState } from "react";
import { LoginSchema } from "./schemas";

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = LoginSchema.safeParse(Object.fromEntries(fd.entries()));
    if (!parsed.success) {
      setError("Invalid input");
      return;
    }
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    if (!res.ok) {
      setError("Login failed");
      return;
    }
    onSuccess();
  }

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" autoComplete="username" required />
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required />
      {error ? <p role="alert">{error}</p> : null}
      <button type="submit">Sign in</button>
    </form>
  );
}
```

#### Key Points — Login/Signup Forms

- **Never** **log** **passwords**; **HTTPS** **only**.
- **Throttle** **failed** **attempts** **server-side**.

---

### JWT Token Management

**Beginner Level**

**If** using **JWT** **in** **SPA**: prefer **short-lived** **access** + **refresh** **rotation**; **HttpOnly** **cookies** often **safer** than **`localStorage`**.

**Intermediate Level**

**Axios/fetch** **interceptor** **injects** **Authorization** **header**; **401** **triggers** **refresh** **queue**.

**Expert Level**

**Replay** **protection**, **binding** **tokens** to **DPoP**/**mTLS** in **high** **security** **dashboards**.

```typescript
export type Tokens = { accessToken: string; expiresAtEpochSec: number };

export function isExpired(t: Tokens, skewSec = 30): boolean {
  return Date.now() / 1000 > t.expiresAtEpochSec - skewSec;
}
```

```typescript
// fetch wrapper sketch
export async function authFetch(input: RequestInfo, init: RequestInit | undefined, getAccess: () => string | null) {
  const token = getAccess();
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
```

#### Key Points — JWT Token Management

- **Rotate** **refresh** **tokens**; **detect** **reuse** **theft**.
- **Clear** **tokens** on **logout** **everywhere** **tabs** (**BroadcastChannel**).

---

### Protected Routes

**Beginner Level**

**Wrapper** **route** checks **`useAuth()`**; **redirect** **`/login`** **with** **`returnTo`**.

**Intermediate Level**

**Loader** **functions** (Remix/React Router data APIs) **throw** **`redirect()`** **before** **render**.

**Expert Level**

**SSR** **cookie** **session** **validation** on **server** **matching** **client** **guards**.

```tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

export function RequireAuth({ isAuthed }: { isAuthed: boolean }) {
  const loc = useLocation();
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <Outlet />;
}
```

#### Key Points — Protected Routes

- **Avoid** **flash** **of** **protected** **content**—**load** **auth** **first** or **skeleton** **shell**.
- **Deep** **links** **after** **login** via **`state.from`**.

---

### Role-based Access

**Beginner Level**

**`user.role`** **`'admin' | 'staff' | 'customer'`** gates **menus** and **routes**.

**Intermediate Level**

**Permission** **strings** **`orders.refund`**, **`catalog.write`**—**map** **roles** **to** **permissions** **server-side** **authoritative**.

**Expert Level**

**ABAC** **attributes** (tenant, region) for **B2B** **dashboards**.

```typescript
export type Role = "admin" | "editor" | "viewer";

export type User = { id: string; role: Role };

const roleCan: Record<Role, (p: "publish" | "edit" | "read") => boolean> = {
  admin: () => true,
  editor: (p) => p !== "publish" || true,
  viewer: (p) => p === "read",
};

export function can(user: User, p: "publish" | "edit" | "read"): boolean {
  return roleCan[user.role](p);
}
```

```tsx
export function Gate({ user, need, children }: { user: User; need: "publish" | "edit" | "read"; children: React.ReactNode }) {
  return can(user, need) ? <>{children}</> : null;
}
```

#### Key Points — Role-based Access

- **Server** **must** **enforce**—UI **hiding** **is** **not** **security**.
- **Audit** **admin** **actions**.

---

### OAuth Integration

**Beginner Level**

**`GET /auth/oauth/google`** **redirect**; **callback** **`/auth/callback`** **exchanges** **code** **server-side**.

**Intermediate Level**

**PKCE** **for** **public** **clients**; **state** **param** **CSRF** **protection**.

**Expert Level**

**Account** **linking** **multiple** **IdPs**; **enterprise** **SAML** **via** **same** **UX** **patterns**.

```typescript
export type OAuthProvider = "google" | "github";

export function startOAuth(provider: OAuthProvider) {
  window.location.assign(`/api/auth/oauth/${provider}/start`);
}
```

#### Key Points — OAuth Integration

- **Never** **handle** **client** **secrets** in **browser**.
- **Verify** **email** **verified** **flag** from **IdP** before **trust**.

---

## 24.5 Real-time Features

### WebSocket Integration

**Beginner Level**

**`new WebSocket(url)`** **connect**; **`onmessage`** **JSON.parse** **events** **`{type, payload}`**.

**Intermediate Level**

**Reconnect** **with** **exponential** **backoff**; **heartbeat** **ping/pong**.

**Expert Level**

**Multiplex** **channels** **single** **socket**; **binary** **frames** for **efficiency**.

```typescript
export type ServerEvent =
  | { type: "notification"; payload: { text: string } }
  | { type: "presence"; payload: { userId: string; status: "online" | "away" } };
```

```tsx
import { useEffect, useRef, useState } from "react";

export function useSocket(url: string) {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.addEventListener("open", () => setConnected(true));
    ws.addEventListener("close", () => setConnected(false));
    return () => ws.close();
  }, [url]);

  return { ws: wsRef, connected };
}
```

#### Key Points — WebSocket Integration

- **Auth**: **ticket** **query** **param** **short-lived** or **post-connect** **auth** **message**.
- **Backpressure**: **drop** **or** **buffer** **events** **judiciously**.

---

### Chat Application

**Beginner Level**

**Messages** **list** **+** **composer**; **`POST /rooms/:id/messages`** **or** **WS** **send**.

**Intermediate Level**

**Optimistic** **messages** **with** **`tempId`**; **reconcile** **server** **`id`**.

**Expert Level**

**E2E** **encryption** (**Signal** **protocol**) **for** **privacy**—**major** **undertaking**.

```typescript
export type ChatMessage = {
  id: string;
  roomId: string;
  authorId: string;
  body: string;
  sentAt: string;
  delivery: "sending" | "sent" | "failed";
};
```

```tsx
import { useState } from "react";

export function ChatComposer({ roomId, onSend }: { roomId: string; onSend: (body: string) => Promise<void> }) {
  const [text, setText] = useState("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const body = text.trim();
        if (!body) return;
        setText("");
        await onSend(body);
      }}
    >
      <input value={text} onChange={(e) => setText(e.target.value)} aria-label="Message" />
      <button type="submit">Send</button>
    </form>
  );
}
```

#### Key Points — Chat Application

- **Scroll** **anchor** **behavior** **for** **new** **messages**.
- **Moderation** **hooks** **before** **broadcast**.

---

### Notifications

**Beginner Level**

**Toast** **queue** **for** **WS** **events**; **browser** **`Notification` **API** **permission** **prompt** **once**.

**Intermediate Level**

**Dedupe** **by** **`id`**; **priority** **lanes** **error** vs **info**.

**Expert Level**

**Push** **notifications** **via** **service** **worker** + **FCM**/**APNs**—**requires** **backend** **topics**.

```tsx
export function useBrowserNotifications() {
  async function ensurePermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) return "denied";
    if (Notification.permission === "granted") return "granted";
    return Notification.requestPermission();
  }

  return { ensurePermission };
}
```

#### Key Points — Notifications

- **Respect** **quiet** **hours** **and** **user** **prefs**.
- **Don’t** **spam** **permission** **prompts**.

---

### Collaborative Editing

**Beginner Level**

**Operational** **Transform** **or** **CRDT** **libraries** (**Yjs**, **Automerge**) **sync** **text** **fields**.

**Intermediate Level**

**Awareness** **cursors** **via** **provider** **metadata**.

**Expert Level**

**Server** **authority** **snapshots** **+** **CRDT** **merge** **for** **offline** **editing**.

```typescript
// Conceptual: domain types for a shared doc
export type DocId = string;

export type TextDocSnapshot = {
  id: DocId;
  title: string;
  updatedAt: string;
  // yjs update bytes or JSON CRDT state — transport-specific
  state: Uint8Array;
};
```

```tsx
// UI shell: mount provider once per doc route
export function CollabEditorShell({ docId, children }: { docId: string; children: React.ReactNode }) {
  return (
    <div data-doc={docId} className="collab-root">
      {children}
    </div>
  );
}
```

#### Key Points — Collaborative Editing

- **Conflict** **resolution** **UX** **copy** **for** **non-technical** **users**.
- **Performance**: **large** **docs** **need** **chunking** **virtualization**.

---

## Key Points (Chapter Summary)

- **E-commerce**: **catalog** **types**, **cart** **immutability**, **checkout** **validation**, **payments** **via** **providers**, **orders** **as** **server** **truth**.
- **Social**: **infinite** **feed**, **optimistic** **likes**, **profiles**, **real-time** **fanout**.
- **Dashboard**: **KPIs**, **charts**, **server** **pagination**/**filters**, **exports** **audited**.
- **Auth**: **validated** **forms**, **token** **lifecycle**, **route** **guards**, **RBAC** **server-side**, **OAuth** **PKCE**.
- **Realtime**: **WebSocket** **lifecycle**, **chat** **reconciliation**, **notifications**, **CRDT** **for** **collab**.

---

## Best Practices (Global)

1. **Treat** **API** **types** **as** **unknown** **until** **`zod`** **parse** at **boundaries**.
2. **Feature** **folders** **per** **24.x** **domains** **with** **explicit** **`index`** **exports**.
3. **Measure** **Web** **Vitals** on **key** **templates** (**PDP**, **feed**, **dashboard**).
4. **Security** **review** **payments**, **auth**, **exports**, **real-time** **payloads**.
5. **Storybook** **for** **catalog** **cards**, **charts**, **auth** **forms** **states**.
6. **E2E** **(Playwright)** **for** **checkout** **and** **login** **flows** **smoke** **per** **deploy**.
7. **Document** **env** **vars** **and** **third-party** **dashboards** **(Stripe,** **Sentry)** in **runbooks**.

---

## Common Mistakes to Avoid

| Mistake | Why it hurts | Better approach |
|--------|----------------|-----------------|
| **Trusting** **client** **prices** at **payment** | Fraud / mismatch | **Server** **recalculates** **totals** |
| **Index** **keys** in **infinite** **feed** | Broken **state** | **Stable** **ids** |
| **Giant** **table** **without** **virtualization** | Main **thread** **jank** | **Server** **page** **+** **virtual** **rows** |
| **JWT** **in** **`localStorage`** **without** **threat** **model** | XSS **theft** | **HttpOnly** **cookies** **or** **mitigations** |
| **WebSocket** **without** **reconnect** | Silent **drops** | **Backoff** **+** **resume** |
| **Missing** **RBAC** **on** **API** | Data **leaks** | **Server** **enforcement** |
| **Export** **without** **audit** | Compliance **risk** | **Log** **who/when** |
| **Collaborative** **editing** **DIY** **naively** | Lost **edits** | **CRDT** **libraries** |

---

*End of Real-World Projects chapter.*
