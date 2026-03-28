# Next.js Topic 20 — State Management

How to choose and combine local state, URL state, React Context, global stores, and server caches in Next.js (App Router + Server Components). Examples span e-commerce carts, SaaS dashboards, blogs, social feeds, and marketing sites—with TypeScript throughout.

## 📑 Table of Contents

- [20.1 Local State](#201-local-state)
- [20.2 URL State](#202-url-state)
- [20.3 React Context](#203-react-context)
- [20.4 Global State Libraries](#204-global-state-libraries)
- [20.5 Server State](#205-server-state)
- [20.6 Form State](#206-form-state)
- [20.7 State Management Patterns](#207-state-management-patterns)
- [Document-Wide Best Practices](#document-wide-best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 20.1 Local State

### 20.1.1 `useState` in Client Components

**Beginner Level**  
`useState` stores values like open/closed for a mobile menu on a blog—simple and built-in.

**Intermediate Level**  
Split state by concern: `useState` for UI chrome, not for fetched server data (use server cache libraries instead).

**Expert Level**  
For high-frequency updates (animations), consider refs or imperative handles to avoid excessive renders; use `startTransition` for non-urgent state in React 18+.

```tsx
"use client";

import { useState } from "react";

export function CartDrawer({ itemCount }: { itemCount: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)} aria-expanded={open}>
        Cart ({itemCount})
      </button>
      {open ? <aside role="dialog" aria-label="Shopping cart">…</aside> : null}
    </div>
  );
}
```

**Key Points**

- Client Components only—Server Components cannot use hooks.
- Prefer colocating state in the subtree that needs it.

### 20.1.2 `useReducer`

**Beginner Level**  
`useReducer` is like Redux-lite for a single component tree—good when multiple actions update related fields (e.g., wizard step + form slice).

**Intermediate Level**  
Model ecommerce checkout as `{ step, shipping, payment }` with typed actions.

**Expert Level**  
Combine with `useMemo` selectors in large reducers; consider lifting to Zustand if multiple distant components need the same reducer state.

```tsx
"use client";

import { useReducer } from "react";

type WizardState = { step: 1 | 2 | 3; orgName: string };
type WizardAction = { type: "next" } | { type: "back" } | { type: "setOrg"; value: string };

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "next":
      return { ...state, step: (Math.min(3, state.step + 1) as WizardState["step"]) };
    case "back":
      return { ...state, step: (Math.max(1, state.step - 1) as WizardState["step"]) };
    case "setOrg":
      return { ...state, orgName: action.value };
    default:
      return state;
  }
}

export function SaaSOnboardingWizard() {
  const [state, dispatch] = useReducer(reducer, { step: 1, orgName: "" });
  return (
    <section>
      <p>Step {state.step}</p>
      <input value={state.orgName} onChange={(e) => dispatch({ type: "setOrg", value: e.target.value })} />
      <button type="button" onClick={() => dispatch({ type: "back" })}>Back</button>
      <button type="button" onClick={() => dispatch({ type: "next" })}>Next</button>
    </section>
  );
}
```

**Key Points**

- Great when transitions are event-driven and enumerated.
- Keep reducers pure—no side effects inside.

### 20.1.3 Local State Best Practices

**Beginner Level**  
Start with `useState` until pain appears—don’t globalize prematurely.

**Intermediate Level**  
Derive state when possible: `const total = items.reduce(...)` instead of storing `total` separately.

**Expert Level**  
Profile with React DevTools; lift state only with measured prop-drilling cost vs context/store complexity.

**Key Points**

- Colocate state with usage.
- Prefer server data as source of truth when it is authoritative.

---

## 20.2 URL State

### 20.2.1 Search Params as State

**Beginner Level**  
Put filters in the URL (`?q=shoes&sort=price`) so users can share e-commerce search results.

**Intermediate Level**  
URL is the persisted UI state for dashboards—bookmarkable views (`?range=7d&team=eng`).

**Expert Level**  
Normalize params server-side; avoid leaking internal enum values; cap string lengths to prevent abuse.

```typescript
export type ProductSearchParams = {
  q?: string;
  sort?: "relevance" | "price_asc" | "price_desc";
  page?: number;
};

export function parseProductSearchParams(sp: Record<string, string | string[] | undefined>): ProductSearchParams {
  const q = typeof sp.q === "string" ? sp.q.slice(0, 120) : undefined;
  const sort = sp.sort === "price_asc" || sp.sort === "price_desc" || sp.sort === "relevance" ? sp.sort : "relevance";
  const pageRaw = typeof sp.page === "string" ? Number(sp.page) : 1;
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.min(pageRaw, 10_000) : 1;
  return { q, sort, page };
}
```

**Key Points**

- Great for shareable and restorable UI.
- Validate types—query strings are always strings.

### 20.2.2 `useSearchParams`

**Beginner Level**  
`useSearchParams()` from `next/navigation` reads current URL query in Client Components.

**Intermediate Level**  
Use `useMemo` to parse into typed objects; sync inputs with debounced router updates.

**Expert Level**  
Mind SSR: search params may be empty on first paint—handle suspense boundaries per Next docs.

```tsx
"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

export function BlogFilters() {
  const sp = useSearchParams();
  const tag = useMemo(() => sp.get("tag") ?? "", [sp]);
  return <p>Filtered by tag: {tag || "all"}</p>;
}
```

**Key Points**

- Client-only hook.
- Prefer reading `searchParams` prop in Server Components for SSR-friendly defaults.

### 20.2.3 Updating URL State

**Beginner Level**  
`router.push('/shop?q=hat')` changes state and navigates.

**Intermediate Level**  
Use `router.replace` to avoid polluting history for minor filter tweaks on a SaaS table.

**Expert Level**  
Batch updates; avoid rapid `replace` loops; consider `scroll: false` option when provided by your Next version API.

```tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function onChange(next: string) {
    const q = new URLSearchParams(sp.toString());
    q.set("sort", next);
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
  }

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="relevance">Relevance</option>
      <option value="price_asc">Price ↑</option>
      <option value="price_desc">Price ↓</option>
    </select>
  );
}
```

**Key Points**

- URL updates should feel instant—debounce text search fields.
- Keep param keys stable for analytics.

### 20.2.4 Persistence (Shareability & Refresh)

**Beginner Level**  
URL state survives refresh—unlike ephemeral React state.

**Intermediate Level**  
Combine URL for coarse filters + local storage for UI prefs (column widths) in a dashboard.

**Expert Level**  
For sensitive data, do not put secrets in query strings—use server session.

**Key Points**

- Treat URL as public—never encode tokens in it.

---

## 20.3 React Context

### 20.3.1 Context in App Router

**Beginner Level**  
Context passes values like theme or lightweight user prefs without prop drilling—social app theme toggle.

**Intermediate Level**  
Create `ThemeProvider` client component; import in `app/layout.tsx` wrapping children.

**Expert Level**  
Split contexts to avoid broad re-renders; memoize context values with `useMemo`.

```tsx
"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

type ThemeCtx = { theme: Theme; setTheme: (t: Theme) => void };

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme must be used within ThemeProvider");
  return v;
}
```

**Key Points**

- Provider must be a Client Component if it uses stateful hooks.
- Default to `null` context + guard hook for clear errors.

### 20.3.2 Providers in Client Components

**Beginner Level**  
Compose providers (`QueryClientProvider`, `ThemeProvider`) in `components/providers.tsx` marked `"use client"`.

**Intermediate Level**  
Keep provider tree shallow; lazy load heavy providers on admin routes only.

**Expert Level**  
For Next 13+ App Router, isolate providers to avoid marking entire layout as client.

```tsx
// app/providers.tsx
"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
```

```tsx
// app/layout.tsx
import { AppProviders } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
```

**Key Points**

- Server `layout.tsx` stays a Server Component when providers are imported as client child.
- Document provider order (theme before toast, etc.).

### 20.3.3 Limitations in Server Components

**Beginner Level**  
Server Components cannot consume React Context—there is no React state tree on the server the same way.

**Intermediate Level**  
Pass serializable props from server to client islands that read context.

**Expert Level**  
Do not try to sync context with server secrets—use server-only modules for confidential values.

**Key Points**

- Context is a client bridge pattern.
- Fetch authoritative data on the server and pass down as props when possible.

---

## 20.4 Global State Libraries

### 20.4.1 Redux with Next.js

**Beginner Level**  
Redux holds global app state in a single store—traditionally used for large dashboards with many cross-cutting concerns.

**Intermediate Level**  
Hydrate store carefully with SSR: serialize initial state from server props for the first client render to match.

**Expert Level**  
Prefer Redux only when middleware/time-travel/devtools and strict update patterns justify complexity; colocate slices by domain (`billing`, `authUi`).

```typescript
import { configureStore } from "@reduxjs/toolkit";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type CartLine = { sku: string; qty: number };

const cartSlice = createSlice({
  name: "cart",
  initialState: { lines: [] as CartLine[] },
  reducers: {
    addLine(state, action: PayloadAction<CartLine>) {
      state.lines.push(action.payload);
    },
  },
});

export const store = configureStore({ reducer: { cart: cartSlice.reducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Key Points**

- Avoid duplicating server data long-term in Redux—cache libraries excel there.
- Type `useSelector`/`useDispatch` with `RootState`/`AppDispatch`.

### 20.4.2 Redux Toolkit Setup

**Beginner Level**  
RTK simplifies Redux with `createSlice` and `configureStore`.

**Intermediate Level**  
Use `createAsyncThunk` for client fetches when not using React Query—know overlap.

**Expert Level**  
RTK Query can replace separate data fetching layers; integrate with Next route segment caching thoughtfully.

```typescript
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (build) => ({
    getKpis: build.query<{ mrr: number }, { range: string }>({
      query: (arg) => `/saas/kpis?range=${encodeURIComponent(arg.range)}`,
    }),
  }),
});

export const { useGetKpisQuery } = analyticsApi;
```

**Key Points**

- Co-locate API slices with feature folders in a SaaS repo.
- Consider SSR prefetch patterns from RTK Query docs if needed.

### 20.4.3 Zustand

**Beginner Level**  
Zustand is a tiny global store with simple hooks—great for UI state shared across header and modals.

**Intermediate Level**  
Persist slices with `persist` middleware for non-sensitive preferences (column order) in a dashboard.

**Expert Level**  
Use `subscribeWithSelector` for fine-grained listeners; combine with immer middleware for complex immutable updates.

```typescript
import { create } from "zustand";

type SocialComposerState = {
  draft: string;
  setDraft: (t: string) => void;
  reset: () => void;
};

export const useComposer = create<SocialComposerState>((set) => ({
  draft: "",
  setDraft: (draft) => set({ draft }),
  reset: () => set({ draft: "" }),
}));
```

**Key Points**

- Avoid storing large server datasets—use TanStack Query.
- Mind SSR: client-only stores start empty unless hydrated.

### 20.4.4 Jotai

**Beginner Level**  
Jotai models state as atoms composed together—good for fine-grained updates in creative tools.

**Intermediate Level**  
Derive atoms for computed dashboard metrics from base atoms.

**Expert Level**  
Async atoms with suspense integration—align Suspense boundaries with Next streaming.

```typescript
import { atom, useAtom } from "jotai";

const likesAtom = atom(0);

export function LikeButton({ postId }: { postId: string }) {
  const [likes, setLikes] = useAtom(likesAtom);
  return (
    <button type="button" onClick={() => setLikes((n) => n + 1)} aria-label={`like post ${postId}`}>
      ♥ {likes}
    </button>
  );
}
```

**Key Points**

- Excellent ergonomics for derived state graphs.
- Document atom ownership per feature.

### 20.4.5 Recoil

**Beginner Level**  
Recoil uses atoms/selectors—Facebook-scale mental model for some teams.

**Intermediate Level**  
Works in client trees; ensure compatibility with your React major version.

**Expert Level**  
Evaluate maintenance/community trends vs Jotai/Zustand for new projects.

**Key Points**

- Prefer simpler tools unless you already standardized on Recoil.
- Keep async selectors from thundering herd with caching policies.

---

## 20.5 Server State

### 20.5.1 TanStack Query (React Query) with Next.js

**Beginner Level**  
Caches API responses, handles loading/error states—ideal for client-side dashboard polling.

**Intermediate Level**  
Use `QueryClient` in provider; prefetch in Server Components with `dehydrate`/`HydrationBoundary` patterns from docs for smoother handoff.

**Expert Level**  
Tune `staleTime` per endpoint; use `placeholderData` for paginated social feeds; integrate with `mutation` + `onSuccess` invalidation.

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";

type Invoice = { id: string; amountCents: number };

async function fetchInvoices(orgId: string): Promise<Invoice[]> {
  const res = await fetch(`/api/orgs/${orgId}/invoices`);
  if (!res.ok) throw new Error("Failed to load invoices");
  return res.json();
}

export function Invoices({ orgId }: { orgId: string }) {
  const q = useQuery({ queryKey: ["invoices", orgId], queryFn: () => fetchInvoices(orgId), staleTime: 60_000 });
  if (q.isLoading) return <p>Loading…</p>;
  if (q.isError) return <p>Could not load invoices</p>;
  return (
    <ul>
      {q.data!.map((i) => (
        <li key={i.id}>${(i.amountCents / 100).toFixed(2)}</li>
      ))}
    </ul>
  );
}
```

**Key Points**

- Server data should still be validated on the server—client cache is a view layer.
- Align query keys with invalidation strategy.

### 20.5.2 SWR

**Beginner Level**  
SWR provides similar caching to React Query with simpler defaults—great for read-heavy blog stats widgets.

**Intermediate Level**  
`useSWRImmutable` for static reference data; `refreshInterval` for live dashboards.

**Expert Level**  
Use middleware for auth token injection; dedupe requests across component tree.

```tsx
"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error("bad response");
  return r.json();
});

export function PageViews({ slug }: { slug: string }) {
  const { data, error, isLoading } = useSWR<{ views: number }>(`/api/blog/${slug}/views`, fetcher, { refreshInterval: 30_000 });
  if (isLoading) return <span>…</span>;
  if (error) return <span>Unavailable</span>;
  return <span>{data!.views} views</span>;
}
```

**Key Points**

- Choose between SWR and TanStack Query based on team familiarity and feature needs.
- Do not cache personalized data without `revalidateOnFocus` considerations.

### 20.5.3 Server Component State

**Beginner Level**  
Server Components don’t hold interactive state—they render from props and fetched data each request (with caching).

**Intermediate Level**  
Use `searchParams` and `cookies()` as inputs to server “state” for a product listing page.

**Expert Level**  
`cache()` and `fetch` caching directives act as memoization across the RSC tree—understand `dynamic` segment config.

**Key Points**

- Server state is request-scoped + cache layers—not React `useState`.
- Great default for SEO and security (secrets stay server-side).

### 20.5.4 Caching as State

**Beginner Level**  
Next.js `fetch` cache and `revalidateTag` make cached server responses part of your app’s effective state machine.

**Intermediate Level**  
After a mutation Route Handler, call `revalidateTag('products')` so catalog pages refresh.

**Expert Level**  
Design tag taxonomy (`user:${id}`, `org:${id}`) for SaaS multi-tenant invalidation precision.

```typescript
import { revalidateTag } from "next/cache";

export async function POST() {
  // await mutateProduct();
  revalidateTag("products");
  return Response.json({ ok: true });
}
```

**Key Points**

- Treat cache tags as part of your state invalidation architecture.
- Measure stale vs fresh tradeoffs for UX.

---

## 20.6 Form State

### 20.6.1 React Hook Form State

**Beginner Level**  
RHF keeps field values and errors outside React render for performance—e-commerce checkout forms.

**Intermediate Level**  
`watch`/`useWatch` selectively for dependent fields (postal code → city lookup).

**Expert Level**  
Integrate with schema validators (Zod) shared with Server Actions.

**Key Points**

- Form state is ephemeral—persist only when product requires drafts.

### 20.6.2 `useFormState` with Server Actions

**Beginner Level**  
Holds last server action result—error map or success flag—for a contact form.

**Intermediate Level**  
Return typed discriminated unions from actions for exhaustive UI handling.

**Expert Level**  
Combine with `useFormStatus` for pending; avoid storing non-serializable data.

**Key Points**

- Great bridge between server validation and client UI.

### 20.6.3 Validation State

**Beginner Level**  
Track `touched`/`dirty` via RHF or custom reducers.

**Intermediate Level**  
Mirror server field errors into RHF with `setError` after POST.

**Expert Level**  
Centralize message codes for i18n mapping in SaaS apps.

**Key Points**

- Separate transport errors from domain validation errors.

---

## 20.7 State Management Patterns

### 20.7.1 Lifting State Up

**Beginner Level**  
Move shared state to nearest common parent—two panels filtering the same blog list.

**Intermediate Level**  
Avoid lifting too high (root) prematurely—impacts re-render fanout.

**Expert Level**  
If lift crosses many layers, switch to context or colocated external store.

**Key Points**

- Measure before abstracting.

### 20.7.2 Colocation

**Beginner Level**  
Keep state in the component that uses it—default best practice.

**Intermediate Level**  
Colocate data fetching in Server Components near the subtree that needs it.

**Expert Level**  
Feature folders (`features/billing`) house state + components + hooks together.

**Key Points**

- Colocation reduces cognitive load in large repos.

### 20.7.3 Server-First

**Beginner Level**  
Fetch on the server; pass props; minimize client JS—great for content-heavy marketing and blogs.

**Intermediate Level**  
Use mutations via Server Actions instead of client stores when possible.

**Expert Level**  
Leverage streaming + Suspense for progressive rendering of dashboard sections.

**Key Points**

- Default stance in modern Next.js apps.

### 20.7.4 Client-First

**Beginner Level**  
Highly interactive experiences (image editors, real-time social) lean on client state and WebSockets.

**Intermediate Level**  
Still validate authoritative operations on the server.

**Expert Level**  
Use CRDTs/operational transforms for collaborative SaaS editors when needed.

**Key Points**

- Client-first doesn’t mean server-optional for security.

### 20.7.5 Hybrid

**Beginner Level**  
Server renders shell + data; client stores UI interactions (modals, selections).

**Intermediate Level**  
TanStack Query caches API JSON while RSC provides initial HTML and SEO.

**Expert Level**  
Define boundaries: which slices are ephemeral UI vs canonical server models.

```tsx
// Hybrid sketch: server passes initial data, client hydrates query cache (pattern name only)
export function KpiSection({ initial }: { initial: { mrr: number } }) {
  // useQuery with initialData: initial — consult TanStack Query docs for exact API
  return <strong>MRR ${initial.mrr}</strong>;
}
```

**Key Points**

- Document the hybrid contract so new features don’t duplicate sources of truth.

---

## Document-Wide Best Practices

1. Prefer Server Components + URL + cache tags before adding global client stores.
2. Keep global stores for client UI and derived view state—not long-lived copies of server DB rows unless offline needed.
3. Type stores and selectors; avoid `any` in Zustand/Redux.
4. Avoid storing secrets or PII in client global state.
5. Invalidate or revalidate caches after mutations—don’t show stale financial data.
6. Measure re-render counts when introducing Context—split providers.
7. Use DevTools (React Query/Redux) in development only bundles when possible.
8. For e-commerce, treat cart server-side when possible for consistency across devices.
9. For dashboards, combine SSR initial load + client polling with backoff.
10. Test state transitions: refresh, back/forward navigation, and multi-tab behavior for URL state.

---

## Common Mistakes to Avoid

1. Putting everything in Context—causes wide re-renders and brittle apps.
2. Duplicating server data in Redux without synchronization strategy.
3. Using `localStorage` as global state without versioning/migration plan.
4. Storing non-serializable values (class instances, functions) in persisted Zustand slices.
5. Ignoring URL state for filters users expect to share (SaaS reports).
6. Fetching in Client Components without caching—network waterfalls on dashboards.
7. Mixing sources of truth (server props + stale client cache) without merge rules.
8. Using global stores for form fields that should remain local.
9. Assuming Server Components can subscribe to client store updates—they cannot.
10. Forgetting to reset ephemeral client state on logout (social apps leaking drafts).

---

### Quick pick guide

| Scenario | Prefer |
| --- | --- |
| Marketing / blog content | Server Components + fetch cache |
| Shareable filters | URL search params |
| Theme / UI prefs | Context or Zustand + persistence |
| Complex admin tools | Redux Toolkit or TanStack Query + minimal UI store |
| Live dashboards | TanStack Query or SWR + server revalidation tags |

---

_End of Topic 20 — State Management._