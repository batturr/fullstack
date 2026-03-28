# Data Fetching (React + TypeScript)

**Data** **fetching** **connects** **UI** **to** **networks**, **databases** **(via** **APIs)**, **and** **real-time** **channels**. It **underpins** **e-commerce** **catalogs** **and** **checkout**, **social** **feeds** **and** **likes**, **analytics** **dashboards**, **todo** **sync**, **weather** **widgets**, **chat** **history**, and **admin** **tables**. **TypeScript** **types** **for** **requests** **and** **responses** **reduce** **runtime** **surprises**; **libraries** **like** **TanStack** **Query** **and** **SWR** **encode** **caching** **and** **revalidation** **policies** **explicitly**.

---

## 📑 Table of Contents

- [Data Fetching (React + TypeScript)](#data-fetching-react--typescript)
  - [📑 Table of Contents](#-table-of-contents)
  - [12.1 Fetching Basics](#121-fetching-basics)
  - [12.2 useEffect for Data Fetching](#122-useeffect-for-data-fetching)
  - [12.3 TanStack Query (React Query)](#123-tanstack-query-react-query)
  - [12.4 SWR](#124-swr)
  - [12.5 Server State Management](#125-server-state-management)
  - [12.6 GraphQL with React](#126-graphql-with-react)
  - [12.7 REST API Patterns](#127-rest-api-patterns)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices (Global)](#best-practices-global)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 12.1 Fetching Basics

### Fetch API (Native)

**Beginner Level**

**`fetch(url)`** **returns** **a** **`Promise<Response>`**. **Call** **`.json()`** **to** **parse** **JSON** **bodies**. **`fetch`** **does** **not** **reject** **on** **HTTP** **4xx/5xx**—**check** **`response.ok`**.

**Real-time example**: **Weather** **app** **GETs** **`/api/weather?city=London`** **and** **renders** **temperature**.

**Intermediate Level**

**Set** **`signal`** **from** **`AbortController`** **to** **cancel** **in-flight** **requests** **when** **inputs** **change** **or** **component** **unmounts**.

**Expert Level**

**Streaming** **bodies** (`response.body` as **ReadableStream**) **for** **chat** **tokens**—**different** **pattern** **than** **JSON** **`.json()`**.

```typescript
export type WeatherDto = { city: string; tempC: number; condition: string };

export async function fetchWeatherJson(signal: AbortSignal, city: string): Promise<WeatherDto> {
  const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });

  if (!res.ok) {
    throw new Error(`Weather request failed: ${res.status}`);
  }

  return (await res.json()) as WeatherDto;
}
```

#### Key Points — Fetch

- **Always** **handle** **`!response.ok`** **explicitly**.
- **Pass** **`signal`** **for** **cancellation**.
- **Typed** **DTOs** **at** **boundaries**—**validate** **with** **zod** **in** **production**.

---

### Axios

**Beginner Level**

**Axios** **wraps** **XHR/fetch** **with** **a** **convenient** **API**: **`axios.get(url)`**, **automatic** **JSON** **transform**, **interceptors**.

**Real-time example**: **E-commerce** **client** **centralizes** **`baseURL`**, **auth** **headers**, **and** **retry** **policies**.

**Intermediate Level**

**Axios** **throws** **`AxiosError`** **for** **non-2xx** **by** **default** **(configurable)**—**uniform** **error** **handling**.

**Expert Level**

**Request** **interceptors** **inject** **correlation** **ids** **and** **OAuth** **token** **refresh** **orchestration**.

```typescript
import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  headers: { Accept: "application/json" },
  timeout: 15_000,
});

export type CartDto = { id: string; items: { sku: string; qty: number }[] };

export async function fetchCart(cartId: string): Promise<CartDto> {
  const { data } = await api.get<CartDto>(`/carts/${encodeURIComponent(cartId)}`);
  return data;
}
```

#### Key Points — Axios

- **Great** **for** **shared** **client** **instances** **with** **interceptors**.
- **Adds** **bundle** **weight** **vs** **native** **`fetch`**.
- **Type** **generics** **on** **`get<T>`** **help**, **but** **runtime** **validation** **still** **recommended**.

---

### Async / Await in Components

**Beginner Level**

**`async`** **functions** **return** **promises**—**in** **React** **you** **usually** **call** **async** **functions** **inside** **`useEffect`** **or** **event** **handlers**, **not** **directly** **as** **the** **effect** **callback** **(which** **cannot** **be** **`async`** **in** **the** **naive** **way** **without** **wrapping)**.

**Real-time example**: **Todo** **app** **loads** **tasks** **on** **mount** **with** **`async`** **IIFE** **inside** **`useEffect`**.

**Intermediate Level**

**Extract** **`async function load()`** **and** **call** **it** **without** **marking** **`useEffect`** **callback** **itself** **`async`**.

**Expert Level**

**Prefer** **React** **Query** **for** **caching**—**raw** **`useEffect`** **fetch** **is** **easy** **to** **get** **wrong** **(see** **§12.2)**.

```tsx
import { useEffect, useState } from "react";

type Todo = { id: string; title: string; done: boolean };

export function TodoListPanel() {
  const [todos, setTodos] = useState<Todo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/todos");
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = (await res.json()) as Todo[];
        if (!cancelled) setTodos(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p role="alert">{error}</p>;
  if (!todos) return <p>Loading todos…</p>;

  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>
          {t.done ? "✓" : "○"} {t.title}
        </li>
      ))}
    </ul>
  );
}
```

#### Key Points — Async/Await

- **Never** **make** **`useEffect`** **callback** **`async`** **directly**—**use** **inner** **`async`** **function**.
- **Combine** **with** **cleanup** **flags** **or** **`AbortController`**.
- **Surface** **errors** **to** **UI** **explicitly**.

---

### Error Handling Strategies

**Beginner Level**

**Map** **errors** **to** **user-visible** **messages**; **log** **technical** **details** **to** **monitoring**.

**Real-time example**: **Social** **feed** **shows** **“Couldn’t** **load** **posts”** **with** **retry**.

**Intermediate Level**

**Discriminate** **`TypeError`** **network** **failures** **vs** **`HTTP`** **errors** **vs** **schema** **validation** **errors**.

**Expert Level**

**Standardize** **`AppError`** **types** **with** **correlation** **ids** **for** **support** **tickets**.

```typescript
export type AppError =
  | { kind: "network"; message: string }
  | { kind: "http"; status: number; message: string }
  | { kind: "parse"; message: string };

export function toAppError(e: unknown): AppError {
  if (e instanceof TypeError) return { kind: "network", message: e.message };
  if (e instanceof Error) return { kind: "network", message: e.message };
  return { kind: "network", message: "Unknown error" };
}
```

#### Key Points — Errors

- **Users** **need** **actionable** **messages**; **operators** **need** **structured** **logs**.
- **Retry** **only** **idempotent** **GETs** **by** **default**.
- **Never** **leak** **secrets** **in** **client** **error** **banners**.

---

### Loading States

**Beginner Level**

**Track** **`isLoading`** **boolean** **or** **tri-state** **`"idle"|"loading"|"success"|"error"`** **for** **UI** **spinners/skeletons**.

**Real-time example**: **Dashboard** **KPI** **cards** **skeleton** **while** **metrics** **fetch**.

**Intermediate Level**

**Avoid** **layout** **shift**—**reserve** **space** **with** **skeleton** **dimensions** **matching** **final** **UI**.

**Expert Level**

**Stale-while-revalidate**: **show** **cached** **data** **with** **subtle** **refresh** **indicator** (**TanStack** **Query**).

```tsx
type LoadState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: T };

export function useLoadState<T>(state: LoadState<T>) {
  if (state.status === "loading") return <p aria-busy="true">Loading…</p>;
  if (state.status === "error") return <p role="alert">{state.message}</p>;
  return state.data;
}
```

#### Key Points — Loading

- **Prefer** **skeletons** **over** **blocking** **spinners** **for** **content** **pages**.
- **Announce** **busy** **state** **for** **assistive** **tech** **where** **appropriate**.
- **Align** **with** **design** **system** **patterns**.

---

### AbortController & Cancellation

**Beginner Level**

**`const ac = new AbortController(); fetch(url, { signal: ac.signal })`** **and** **`ac.abort()`** **on** **cleanup** **or** **new** **input**.

**Real-time example**: **E-commerce** **search** **box** **cancels** **previous** **query** **when** **user** **types** **fast**.

**Intermediate Level**

**Axios** **supports** **`signal`** **too** **(v0.22+)**.

**Expert Level**

**Dedupe** **requests** **at** **cache** **layer** **(React** **Query)** **in** **addition** **to** **abort** **for** **efficiency**.

```typescript
export async function searchProducts(query: string, signal: AbortSignal) {
  const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`, { signal });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return (await res.json()) as { id: string; title: string }[];
}
```

#### Key Points — Abort

- **Prevents** **setState** **on** **unmounted** **components** **when** **paired** **with** **guards** **or** **caching**.
- **Required** **for** **race-free** **autocomplete**.
- **Do** **not** **abort** **mutations** **casually**—**confirm** **server** **side-effects**.

---

## 12.2 useEffect for Data Fetching

### Fetch on Component Mount

**Beginner Level**

**`useEffect(() => { ... }, [])`** **runs** **after** **first** **paint**—**common** **place** **for** **initial** **data** **loads**.

**Real-time example**: **Chat** **room** **loads** **last** **50** **messages** **when** **opening** **a** **channel**.

**Intermediate Level**

**Strict** **Mode** **double-invokes** **effects** **in** **development**—**ensure** **idempotent** **GETs** **or** **use** **proper** **cleanup/abort**.

**Expert Level**

**Prefer** **router** **loaders** **or** **React** **Query** **for** **SSR** **and** **deduplication**.

```tsx
import { useEffect, useState } from "react";

type Message = { id: string; text: string; sentAt: string };

export function ChatTranscript({ channelId }: { channelId: string }) {
  const [messages, setMessages] = useState<Message[] | null>(null);

  useEffect(() => {
    const ac = new AbortController();

    async function load() {
      const res = await fetch(`/api/channels/${encodeURIComponent(channelId)}/messages`, { signal: ac.signal });
      if (!res.ok) throw new Error("Failed to load messages");
      setMessages(await res.json());
    }

    void load().catch(() => {
      // handle/log
    });

    return () => ac.abort();
  }, [channelId]);

  if (!messages) return <p>Loading messages…</p>;

  return (
    <ol>
      {messages.map((m) => (
        <li key={m.id}>
          <time dateTime={m.sentAt}>{m.sentAt}</time> — {m.text}
        </li>
      ))}
    </ol>
  );
}
```

#### Key Points — Mount Fetch

- **Empty** **deps** **only** **when** **truly** **static**—**usually** **you** **need** **keys** **like** **`channelId`**.
- **Handle** **Strict** **Mode** **behavior** **in** **dev**.
- **Consider** **server** **state** **library** **for** **cache**.

---

### Dependency Arrays

**Beginner Level**

**Include** **every** **value** **from** **component** **scope** **used** **inside** **the** **effect** **that** **should** **trigger** **re-run**—**exhaustive-deps** **lint** **rule** **helps**.

**Real-time example**: **Dashboard** **refetches** **when** **`dateRange`** **changes**.

**Intermediate Level**

**Stabilize** **callbacks** **with** **`useCallback`** **or** **move** **functions** **outside** **component** **when** **possible**.

**Expert Level**

**Use** **`useEffectEvent`** **(React** **19+)** **for** **non-reactive** **effect** **logic** **where** **appropriate**—**follow** **current** **docs**.

```tsx
import { useEffect, useState } from "react";

export function Metrics({ range }: { range: "7d" | "30d" }) {
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch(`/api/metrics?range=${range}`);
      const json = (await res.json()) as { value: number };
      if (!cancelled) setValue(json.value);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [range]);

  return <p>{value ?? "…"}</p>;
}
```

#### Key Points — Dependencies

- **Stale** **closures** **happen** **when** **deps** **are** **wrong**.
- **Don’t** **disable** **lint** **without** **strong** **reason**.
- **Refactor** **to** **fewer** **effects** **when** **logic** **splinters**.

---

### Cleanup Functions

**Beginner Level**

**Return** **a** **function** **from** **`useEffect`** **to** **abort** **requests**, **clear** **timers**, **or** **unsubscribe**.

**Real-time example**: **Weather** **polling** **clears** **`setInterval`** **on** **unmount**.

**Intermediate Level**

**Cleanup** **should** **be** **idempotent** **and** **fast**.

**Expert Level**

**For** **subscriptions**, **use** **dedicated** **hooks** **or** **libraries** **with** **backoff** **and** **reconnect** **policies**.

```tsx
import { useEffect } from "react";

export function usePoll(callback: () => void, ms: number) {
  useEffect(() => {
    const id = window.setInterval(callback, ms);
    return () => window.clearInterval(id);
  }, [callback, ms]);
}
```

#### Key Points — Cleanup

- **Essential** **for** **timers**, **listeners**, **and** **abort** **controllers**.
- **Prevents** **memory** **leaks** **and** **duplicate** **network** **calls**.
- **Pair** **with** **abort** **for** **fetch**.

---

### Race Conditions

**Beginner Level**

**If** **two** **requests** **overlap**, **the** **slower** **one** **may** **resolve** **last** **and** **overwrite** **newer** **data**—**classic** **bug** **in** **search** **boxes**.

**Real-time example**: **E-commerce** **search** **shows** **stale** **results** **for** **“sho”** **after** **“shoes”** **returns**.

**Intermediate Level**

**Fix** **with** **abort**, **request** **ids**, **or** **caching** **layer** **dedupe**.

**Expert Level**

**TanStack** **Query** **handles** **this** **via** **query** **keys** **and** **cancellation** **policies**.

```tsx
import { useEffect, useState } from "react";

export function ProductSearch({ query }: { query: string }) {
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    const ac = new AbortController();
    const seq = Symbol("seq");

    async function run() {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(query)}`, { signal: ac.signal });
        const json = (await res.json()) as { items: string[] };
        setResults(json.items);
      } catch {
        // aborted => ignore
      }
    }

    void run();
    return () => ac.abort();
  }, [query]);

  return (
    <ul>
      {results.map((r) => (
        <li key={r}>{r}</li>
      ))}
    </ul>
  );
}
```

#### Key Points — Races

- **Always** **solve** **for** **rapid** **input** **changes**.
- **Abort** **is** **usually** **the** **simplest** **fix** **for** **GET** **requests**.
- **For** **mutations**, **use** **request** **ordering** **carefully**.

---

### Custom `useFetch` Hook (Illustrative)

**Beginner Level**

**Encapsulate** **`data/error/loading`** **state** **transitions** **for** **simple** **GET** **endpoints**.

**Real-time example**: **Internal** **admin** **tool** **fetches** **JSON** **from** **known** **routes**.

**Intermediate Level**

**Add** **`refetch`**, **`signal`**, **and** **typed** **generics** **`useFetch<T>`**.

**Expert Level**

**Replace** **with** **TanStack** **Query** **when** **you** **need** **cache**, **retries**, **and** **devtools**—**don’t** **reinvent**.

```typescript
import { useEffect, useState } from "react";

type AsyncResult<T> =
  | { status: "idle" | "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: T };

export function useFetchJson<T>(url: string): AsyncResult<T> & { refetch: () => void } {
  const [state, setState] = useState<AsyncResult<T>>({ status: "loading" });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const ac = new AbortController();
    setState({ status: "loading" });

    async function run() {
      try {
        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as T;
        setState({ status: "success", data });
      } catch (e) {
        if ((e as { name?: string }).name === "AbortError") return;
        setState({ status: "error", error: e instanceof Error ? e.message : "Error" });
      }
    }

    void run();
    return () => ac.abort();
  }, [url, tick]);

  return {
    ...state,
    refetch: () => setTick((x) => x + 1),
  } as AsyncResult<T> & { refetch: () => void };
}
```

#### Key Points — useFetch

- **Good** **learning** **exercise**; **limited** **for** **production** **scale**.
- **Missing** **dedupe** **across** **components** **by** **default**.
- **Upgrade** **path** **to** **TanStack** **Query** **is** **straightforward**.

---

## 12.3 TanStack Query (React Query)

### Basics & Mental Model

**Beginner Level**

**TanStack** **Query** **caches** **server** **data** **by** **key**, **refetches** **on** **window** **focus**/**reconnect**, **and** **tracks** **loading/error** **states**.

**Real-time example**: **Social** **feed** **posts** **cached** **per** **`['feed', tab]`** **key**.

**Intermediate Level**

**Separate** **server** **state** **from** **UI** **state**—**don’t** **duplicate** **fetched** **entities** **in** **`useState`**.

**Expert Level**

**Integrate** **with** **SSR** **hydration** **and** **streaming** **using** **framework-specific** **guides**.

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const qc = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}
```

#### Key Points — Basics

- **Central** **`QueryClient`** **configures** **defaults**.
- **Declarative** **hooks** **replace** **manual** **`useEffect`** **fetch** **for** **many** **cases**.
- **DevTools** **visualize** **cache** **and** **timing**.

---

### `useQuery`

**Beginner Level**

**`useQuery({ queryKey, queryFn })`** **returns** **`data`**, **`isLoading`**, **`isError`**, **`error`**, **`refetch`**.

**Real-time example**: **Weather** **widget** **query** **key** **`['weather', city]`**.

**Intermediate Level**

**`enabled`** **flag** **prevents** **fetch** **until** **inputs** **valid**.

**Expert Level**

**`select`** **maps** **data** **to** **view** **models** **with** **memoization** **per** **docs**.

```tsx
import { useQuery } from "@tanstack/react-query";

type Weather = { tempC: number };

async function fetchWeather(city: string): Promise<Weather> {
  const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export function WeatherCard({ city }: { city: string }) {
  const q = useQuery({ queryKey: ["weather", city], queryFn: () => fetchWeather(city), enabled: city.length > 0 });

  if (q.isLoading) return <p>Loading…</p>;
  if (q.isError) return <p role="alert">{(q.error as Error).message}</p>;
  return <p>{q.data.tempC.toFixed(1)}°C</p>;
}
```

#### Key Points — useQuery

- **Declarative** **loading** **and** **error** **states**.
- **`queryKey`** **must** **include** **all** **variables** **that** **affect** **the** **fetch**.
- **`throw`** **in** **`queryFn`** **for** **errors**—**library** **captures**.

---

### Query Keys

**Beginner Level**

**Keys** **are** **serializable** **arrays** **like** **`['user', userId]`**—**identify** **cached** **data**.

**Real-time example**: **E-commerce** **product** **`['product', slug]`**.

**Intermediate Level**

**Hierarchical** **keys** **enable** **partial** **invalidation** **`queryClient.invalidateQueries({ queryKey: ['product'] })`**.

**Expert Level**

**Stable** **key** **factories** **prevent** **typos** **across** **features**.

```typescript
export const qk = {
  product: (slug: string) => ["product", slug] as const,
  cart: (cartId: string) => ["cart", cartId] as const,
};
```

#### Key Points — Keys

- **Keys** **are** **the** **cache** **address**.
- **Include** **locale**, **filters**, **and** **pagination** **cursors** **when** **relevant**.
- **Avoid** **non-serializable** **objects** **in** **keys**.

---

### Query Functions (`queryFn`)

**Beginner Level**

**Pure** **async** **function** **that** **returns** **data** **or** **throws**.

**Real-time example**: **Dashboard** **metrics** **GET**.

**Intermediate Level**

**Use** **`QueryFunctionContext`** **in** **`queryFn`** **to** **read** **parts** **of** **`queryKey`** **safely**.

**Expert Level**

**Centralize** **HTTP** **client** **with** **interceptors** **and** **typed** **errors**.

```tsx
import { QueryFunctionContext, useQuery } from "@tanstack/react-query";

type Product = { id: string; title: string };

async function productQueryFn(ctx: QueryFunctionContext<readonly ["product", string]>): Promise<Product> {
  const [, id] = ctx.queryKey;
  const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

export function useProduct(id: string) {
  return useQuery({ queryKey: ["product", id] as const, queryFn: productQueryFn, enabled: Boolean(id) });
}
```

#### Key Points — queryFn

- **Throw** **Error** **subclasses** **for** **consistent** **handling**.
- **Keep** **side-effects** **minimal**—**prefer** **mutations** **for** **writes**.
- **Reuse** **functions** **across** **hooks** **and** **prefetchers**.

---

### Query Options (Stale Time, GC, Retries)

**Beginner Level**

**`staleTime`** **controls** **how** **long** **data** **is** **considered** **fresh**; **`gcTime`** **(formerly** **`cacheTime`)** **controls** **memory** **retention**.

**Real-time example**: **Weather** **updates** **every** **10** **minutes** **`staleTime: 600_000`**.

**Intermediate Level**

**`retry`** **and** **`retryDelay`** **for** **transient** **network** **errors**.

**Expert Level**

**`refetchOnWindowFocus`** **tuning** **for** **kiosk** **apps** **vs** **consumer** **web**.

```tsx
import { useQuery } from "@tanstack/react-query";

export function useWeather(city: string) {
  return useQuery({
    queryKey: ["weather", city],
    queryFn: async () => {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      if (!res.ok) throw new Error("fail");
      return res.json() as Promise<{ tempC: number }>;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });
}
```

#### Key Points — Options

- **Defaults** **are** **reasonable** **but** **not** **universal**.
- **Tune** **per** **query** **type** **(real-time** **vs** **static)**.
- **Document** **cache** **policy** **per** **domain** **entity**.

---

### `useMutation`

**Beginner Level**

**`useMutation`** **handles** **POST/PUT/DELETE** **with** **`mutate`**, **`isPending`**, **`isError`**.

**Real-time example**: **Todo** **app** **creates** **task** **via** **`POST`**.

**Intermediate Level**

**`onSuccess`** **invalidates** **related** **queries** **to** **refresh** **lists**.

**Expert Level**

**Optimistic** **updates** **with** **rollback** **on** **error** **(next** **section)**.

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

type CreateTodo = { title: string };

async function createTodo(payload: CreateTodo) {
  const res = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Create failed");
  return res.json() as Promise<{ id: string }>;
}

export function useCreateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTodo,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}
```

#### Key Points — useMutation

- **Separate** **reads** **and** **writes** **mentally** **even** **if** **both** **hit** **REST**.
- **Invalidate** **or** **update** **cache** **explicitly** **after** **success**.
- **Surface** **`isPending`** **to** **disable** **double** **submits**.

---

### Invalidation

**Beginner Level**

**`queryClient.invalidateQueries({ queryKey: ['todos'] })`** **marks** **stale** **and** **refetches** **active** **queries**.

**Real-time example**: **E-commerce** **cart** **invalidates** **`['cart', id]`** **after** **add-to-cart**.

**Intermediate Level**

**Predicates** **for** **fine-grained** **invalidation**.

**Expert Level**

**Batching** **invalidations** **after** **multi-step** **wizard** **completion**.

```tsx
import { QueryClient } from "@tanstack/react-query";

export function invalidateAllProducts(qc: QueryClient) {
  return qc.invalidateQueries({ queryKey: ["products"] });
}
```

#### Key Points — Invalidation

- **Prefer** **targeted** **invalidation** **over** **global** **`invalidate()`**.
- **Combine** **with** **mutation** **`onSettled`** **for** **consistent** **UX**.
- **Watch** **for** **request** **storms**—**debounce** **bulk** **operations**.

---

### Refetching (Manual & Automatic)

**Beginner Level**

**`refetch()`** **from** **`useQuery`** **or** **`queryClient.refetchQueries`**.

**Real-time example**: **Dashboard** **“Refresh”** **button**.

**Intermediate Level**

**`refetchInterval`** **for** **polling** **(use** **sparingly)**.

**Expert Level**

**WebSockets** **push** **events** **→** **`setQueryData`** **for** **instant** **updates** **without** **polling**.

```tsx
import { useQuery } from "@tanstack/react-query";

export function LiveIndicator() {
  const q = useQuery({
    queryKey: ["health"],
    queryFn: async () => (await fetch("/api/health")).json(),
    refetchInterval: 30_000,
  });
  return <span>{q.data ? "OK" : "…"}</span>;
}
```

#### Key Points — Refetch

- **Balance** **freshness** **vs** **server** **load**.
- **Polling** **is** **simple** **but** **not** **always** **scalable**.
- **Prefer** **push** **where** **possible** **for** **chat**/**notifications**.

---

### Optimistic Updates

**Beginner Level**

**Update** **UI** **before** **server** **ack**—**rollback** **if** **mutation** **fails**.

**Real-time example**: **Social** **like** **button** **toggles** **instantly**.

**Intermediate Level**

**`onMutate`** **snapshot** **previous** **cache** **for** **rollback** **in** **`onError`**.

**Expert Level**

**Idempotent** **server** **operations** **and** **conflict** **resolution** **strategies** **for** **high** **concurrency**.

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

type LikeState = { liked: boolean; count: number };

export function useLikePost(postId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (!res.ok) throw new Error("Like failed");
      return res.json() as Promise<LikeState>;
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["post", postId] });
      const prev = qc.getQueryData<LikeState>(["post", postId]);
      if (prev) {
        qc.setQueryData<LikeState>(["post", postId], {
          liked: !prev.liked,
          count: prev.count + (prev.liked ? -1 : 1),
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["post", postId], ctx.prev);
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
}
```

#### Key Points — Optimistic

- **Fantastic** **UX** **when** **done** **safely**.
- **Always** **plan** **rollback** **and** **reconciliation**.
- **Dangerous** **for** **financial** **mutations** **without** **strong** **server** **validation**.

---

### Pagination

**Beginner Level**

**`useQuery`** **with** **`page`** **in** **key** **`['feed', page]`** **or** **`useInfiniteQuery`** **for** **cursor** **pages**.

**Real-time example**: **E-commerce** **search** **results** **paged** **by** **offset**.

**Intermediate Level**

**Keep** **previous** **data** **`placeholderData: keepPreviousData`** **(v4/v5** **API** **names** **may** **differ)**.

**Expert Level**

**Prefetch** **next** **page** **on** **scroll** **near** **end**.

```tsx
import { keepPreviousData, useQuery } from "@tanstack/react-query";

type Page = { items: { id: string }[]; nextPage?: number };

export function useProductPage(page: number) {
  return useQuery({
    queryKey: ["products", "page", page],
    queryFn: async () => {
      const res = await fetch(`/api/products?page=${page}`);
      if (!res.ok) throw new Error("fail");
      return res.json() as Promise<Page>;
    },
    placeholderData: keepPreviousData,
  });
}
```

#### Key Points — Pagination

- **Include** **filters** **in** **keys**.
- **Avoid** **duplicate** **items** **when** **data** **shifts** **(infinite** **lists)**.
- **Virtualize** **long** **lists** **for** **performance**.

---

### Infinite Queries

**Beginner Level**

**`useInfiniteQuery`** **manages** **`pages`**, **`fetchNextPage`**, **`hasNextPage`**.

**Real-time example**: **Social** **infinite** **scroll** **feed**.

**Intermediate Level**

**`getNextPageParam`** **extracts** **cursor** **from** **last** **response**.

**Expert Level**

**Bi-directional** **infinite** **scroll** **for** **chat** **history** **is** **more** **complex**—**consider** **specialized** **hooks**.

```tsx
import { useInfiniteQuery } from "@tanstack/react-query";

type FeedPage = { items: { id: string }[]; nextCursor?: string };

export function useFeed(userId: string) {
  return useInfiniteQuery({
    queryKey: ["feed", userId],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const qs = new URLSearchParams();
      if (pageParam) qs.set("cursor", pageParam);
      const res = await fetch(`/api/users/${encodeURIComponent(userId)}/feed?${qs.toString()}`);
      if (!res.ok) throw new Error("fail");
      return res.json() as Promise<FeedPage>;
    },
    getNextPageParam: (last) => last.nextCursor,
  });
}
```

#### Key Points — Infinite

- **Great** **fit** **for** **timeline** **UIs**.
- **Careful** **with** **dedupe** **and** **ordering** **when** **new** **items** **insert** **at** **top**.
- **Measure** **scroll** **handlers** **for** **jank**.

---

### Caching Semantics

**Beginner Level**

**Cached** **data** **serves** **instant** **UI** **on** **revisit**—**stale** **data** **may** **still** **show** **while** **refetching** **in** **background**.

**Real-time example**: **Dashboard** **shows** **last** **KPIs** **instantly**, **then** **updates**.

**Intermediate Level**

**`staleTime` vs `gcTime`** **tuning** **per** **entity** **volatility**.

**Expert Level**

**Persist** **cache** **to** **`localStorage`** **(plugin)** **for** **offline** **PWAs**—**security** **review** **required**.

#### Key Points — Caching

- **Embrace** **stale-while-revalidate** **for** **snappy** **UX**.
- **Invalidate** **on** **mutations** **that** **change** **read** **models**.
- **Monitor** **memory** **usage** **on** **long** **sessions**.

---

### DevTools

**Beginner Level**

**`<ReactQueryDevtools />`** **visualizes** **queries**, **states**, **and** **timings**.

**Real-time example**: **Debug** **why** **cart** **query** **not** **updating**.

**Intermediate Level**

**Enable** **only** **in** **development** **builds**.

**Expert Level**

**Combine** **with** **browser** **network** **waterfall** **analysis**.

```tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function Devtools() {
  return process.env.NODE_ENV === "development" ? <ReactQueryDevtools initialIsOpen={false} /> : null;
}
```

#### Key Points — DevTools

- **Essential** **for** **learning** **cache** **behavior**.
- **Never** **ship** **to** **production** **without** **guarding**.
- **Teaches** **query** **keys** **discipline**.

---

## 12.4 SWR

### Basics

**Beginner Level**

**`useSWR(key, fetcher)`** **returns** **`data`**, **`error`**, **`isLoading`**, **`mutate`**.

**Real-time example**: **Weather** **endpoint** **keyed** **by** **`/api/weather?city=...`**.

**Intermediate Level**

**Global** **configuration** **via** **`SWRConfig`**.

**Expert Level**

**Compare** **feature** **set** **vs** **TanStack** **Query** **for** **your** **requirements**.

```tsx
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error("bad");
  return r.json();
});

export function SwrWeather({ city }: { city: string }) {
  const { data, error, isLoading } = useSWR(`/api/weather?city=${encodeURIComponent(city)}`, fetcher);
  if (isLoading) return <p>Loading…</p>;
  if (error) return <p>Failed</p>;
  return <p>{(data as { tempC: number }).tempC}°C</p>;
}
```

#### Key Points — SWR Basics

- **Simple** **API** **surface**.
- **Fetcher** **function** **is** **central** **extension** **point**.
- **Great** **for** **lightweight** **apps**.

---

### `useSWR` Patterns

**Beginner Level**

**Key** **can** **be** **`null`** **to** **disable** **fetching**.

**Real-time example**: **Only** **fetch** **profile** **when** **`userId`** **exists**.

**Intermediate Level**

**`useSWRImmutable`** **for** **static** **resources**.

**Expert Level**

**Middleware** **experimental** **features** **(check** **version** **docs)**.

```tsx
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useUser(userId: string | null) {
  return useSWR(userId ? `/api/users/${userId}` : null, fetcher);
}
```

#### Key Points — useSWR

- **Conditional** **keys** **are** **idiomatic**.
- **Mind** **identity** **of** **fetcher** **when** **passing** **inline** **functions**.
- **Use** **typed** **fetchers** **for** **safety**.

---

### Revalidation

**Beginner Level**

**`refreshInterval`**, **revalidate** **on** **focus**, **revalidate** **on** **reconnect**.

**Real-time example**: **Dashboard** **auto** **refresh** **every** **60s**.

**Intermediate Level**

**`revalidateIfStale`**, **`dedupingInterval`** **fine** **tuning**.

**Expert Level**

**Bound** **revalidation** **to** **visibility** **for** **battery** **savings** **on** **mobile**.

```tsx
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function MetricsSwr() {
  const { data } = useSWR("/api/metrics", fetcher, { refreshInterval: 60_000, revalidateOnFocus: true });
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

#### Key Points — Revalidation

- **Defaults** **feel** **snappy** **on** **consumer** **sites**.
- **Tune** **for** **kiosk**/**embedded** **apps**.
- **Pair** **with** **good** **HTTP** **cache** **headers** **on** **CDN**.

---

### Mutation & Cache Updates (`mutate`)

**Beginner Level**

**`mutate`** **updates** **cache** **locally** **or** **triggers** **revalidation**.

**Real-time example**: **Todo** **list** **optimistic** **append**.

**Intermediate Level**

**`mutate(key, data, { revalidate: true })`** **patterns**.

**Expert Level**

**Compare** **to** **`useMutation`** **ergonomics** **in** **TanStack** **Query** **for** **complex** **workflows**.

```tsx
import { useSWR, useSWRConfig } from "swr";

export function TodoComposer() {
  const { mutate } = useSWRConfig();

  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/todos", { method: "POST", body: JSON.stringify({ title: "New" }) });
        await mutate("/api/todos");
      }}
    >
      Add
    </button>
  );
}

export function TodoListSwr() {
  const { data } = useSWR("/api/todos", (url) => fetch(url).then((r) => r.json()));
  return <ul>{Array.isArray(data) ? data.map((t: { id: string; title: string }) => <li key={t.id}>{t.title}</li>) : null}</ul>;
}
```

#### Key Points — mutate

- **Powerful** **for** **small** **apps**.
- **Can** **get** **complex** **with** **many** **keys**.
- **Centralize** **key** **constants**.

---

### Configuration (`SWRConfig`)

**Beginner Level**

**Set** **default** **`fetcher`**, **`errorRetryCount`**, **`provider`** **for** **cache** **storage**.

**Real-time example**: **Attach** **auth** **headers** **in** **global** **fetcher**.

**Intermediate Level**

**Error** **retry** **with** **exponential** **backoff** **(built-in** **options)**.

**Expert Level**

**Integrate** **with** **Next.js** **SSR** **fallback** **data** **patterns**.

```tsx
import { SWRConfig } from "swr";

export function SwrAppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => fetch(url, { credentials: "include" }).then((r) => r.json()),
        errorRetryCount: 3,
      }}
    >
      {children}
    </SWRConfig>
  );
}
```

#### Key Points — SWRConfig

- **DRY** **defaults** **across** **routes**.
- **Per-hook** **overrides** **still** **available**.
- **Document** **credential** **policy** **explicitly**.

---

### SWR vs TanStack Query

**Beginner Level**

**Both** **cache** **server** **data**; **TanStack** **Query** **often** **more** **feature-rich** **for** **complex** **apps**.

**Real-time example**: **Startup** **MVP** **uses** **SWR**; **enterprise** **dashboard** **migrates** **to** **TanStack** **Query**.

**Intermediate Level**

**TanStack** **Query** **DevTools** **and** **mutation** **primitives** **excel** **for** **large** **teams**.

**Expert Level**

**Pick** **one** **per** **app**—**avoid** **two** **caching** **systems** **unless** **isolated** **packages**.

#### Key Points — Comparison

- **SWR** **minimalism** **vs** **TanStack** **depth**.
- **Migration** **is** **possible** **but** **costs** **time**.
- **Evaluate** **SSR**, **offline**, **and** **testing** **needs**.

---

## 12.5 Server State Management

### Server vs Client State

**Beginner Level**

**Server** **state** **originates** **remotely** **(products**, **profiles)**; **client** **state** **is** **local** **(modal** **open**, **draft** **text** **before** **save)**.

**Real-time example**: **Chat** **composer** **draft** **is** **client**; **message** **history** **is** **server**.

**Intermediate Level**

**Don’t** **store** **fetched** **entities** **redundantly** **in** **global** **Redux** **without** **need**.

**Expert Level**

**Use** **TanStack** **Query** **as** **source** **of** **truth** **for** **remote** **data**; **use** **Zustand/Redux** **for** **purely** **local** **concerns** **or** **when** **wiring** **complex** **cross-cutting** **state**.

#### Key Points — Split

- **Different** **lifecycles** **and** **invalidation** **rules**.
- **Mixing** **them** **causes** **stale** **bugs**.
- **Name** **variables** **clearly**: **`remoteUser` vs `draftProfile`**.

---

### Caching Layers (Browser, CDN, Client Library)

**Beginner Level**

**HTTP** **`Cache-Control`** **directs** **browser/CDN** **caching**; **client** **libraries** **add** **another** **layer** **in** **memory**.

**Real-time example**: **Static** **product** **images** **cached** **aggressively**; **prices** **cached** **shortly** **or** **not** **at** **all**.

**Intermediate Level**

**`ETag`**/**`If-None-Match`** **conditional** **requests** **save** **bandwidth**.

**Expert Level**

**Cache** **invalidation** **is** **still** **one** **of** **the** **two** **hard** **problems**—**design** **explicit** **policies**.

#### Key Points — Layers

- **Align** **client** **stale** **times** **with** **HTTP** **directives** **when** **possible**.
- **Don’t** **fight** **CDN** **caching** **with** **constantly** **changing** **URLs** **unless** **needed**.
- **Measure** **TTFB** **and** **payload** **sizes**.

---

### Cache Invalidation Strategies

**Beginner Level**

**Time-based** **TTL**, **event-based** **(mutation** **success)**, **manual** **refresh** **button**.

**Real-time example**: **E-commerce** **invalidates** **`['cart']`** **after** **add-to-cart**.

**Intermediate Level**

**Versioned** **API** **responses** **or** **`updatedAt`** **timestamps** **for** **conditional** **UI**.

**Expert Level**

**Webhooks** **→** **SSE** **→** **client** **cache** **patching** **for** **near** **real-time** **systems**.

#### Key Points — Invalidation

- **Prefer** **explicit** **invalidation** **over** **hope**.
- **Document** **which** **mutations** **touch** **which** **keys**.
- **Avoid** **over-invalidating** **everything**.

---

### Stale Data & Perceived Freshness

**Beginner Level**

**Stale** **data** **may** **still** **be** **shown** **while** **refetching**—**users** **see** **fast** **UI** **with** **background** **updates**.

**Real-time example**: **Social** **feed** **shows** **last** **fetch** **immediately** **on** **navigation** **back**.

**Intermediate Level**

**Indicate** **subtle** **“Updating…”** **when** **`isFetching`** **and** **`isLoading`** **false**.

**Expert Level**

**Conflict** **resolution** **when** **user** **edits** **stale** **records**—**ETags** **or** **version** **fields**.

#### Key Points — Stale

- **Great** **for** **read-heavy** **apps**.
- **Dangerous** **for** **financial** **balances** **without** **strong** **controls**.
- **Pair** **with** **visual** **freshness** **indicators**.

---

### Background Refetching

**Beginner Level**

**Libraries** **refetch** **on** **focus/reconnect** **to** **resync** **after** **sleep**/**offline**.

**Real-time example**: **Dashboard** **updates** **when** **user** **returns** **to** **tab**.

**Intermediate Level**

**Debounce** **focus** **events** **on** **mobile** **browsers** **with** **quirks**.

**Expert Level**

**Coordinate** **with** **`navigator.onLine`** **events** **and** **queued** **mutations** **(offline** **first)**.

#### Key Points — Background

- **Improves** **correctness** **without** **manual** **refresh** **buttons**.
- **Watch** **server** **rate** **limits** **on** **popular** **pages**.
- **Provide** **manual** **override** **for** **power** **users**.

---

## 12.6 GraphQL with React

### Apollo Client Setup

**Beginner Level**

**`ApolloClient`** **with** **`InMemoryCache`**, **`ApolloProvider`**.

**Real-time example**: **E-commerce** **product** **page** **queries** **variants** **and** **inventory**.

**Intermediate Level**

**Type** **policies** **and** **`keyFields`** **for** **cache** **normalization**.

**Expert Level**

**Persisted** **queries** **and** **APQ** **for** **performance** **and** **security** **hardening**.

```tsx
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "/graphql",
  cache: new InMemoryCache(),
});

export function ApolloAppProviders({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
```

#### Key Points — Apollo Setup

- **Cache** **configuration** **is** **where** **subtle** **bugs** **live**.
- **Auth** **link** **middleware** **for** **tokens**.
- **SSR** **requires** **hydration** **patterns** **from** **docs**.

---

### `useQuery` (Apollo)

**Beginner Level**

**`const { data, loading, error } = useQuery(GET_X)`** **declares** **GraphQL** **reads**.

**Real-time example**: **Social** **profile** **header** **fields**.

**Intermediate Level**

**`fetchPolicy`** **`cache-first` vs `network-only`**.

**Expert Level**

**`nextFetchPolicy`** **for** **pagination** **and** **UX** **tuning**.

```tsx
import { gql, useQuery } from "@apollo/client";

const GET_ME = gql`
  query Me {
    me {
      id
      handle
    }
  }
`;

type MeQuery = { me: { id: string; handle: string } };

export function MeBanner() {
  const { data, loading, error } = useQuery<MeQuery>(GET_ME);
  if (loading) return <p>Loading…</p>;
  if (error) return <p role="alert">{error.message}</p>;
  return <p>@{data!.me.handle}</p>;
}
```

#### Key Points — Apollo useQuery

- **Co-locate** **queries** **with** **components** **or** **use** **graphql-codegen**.
- **Understand** **cache** **identity** **rules**.
- **Handle** **partial** **data** **with** **error** **policies**.

---

### `useMutation` (Apollo)

**Beginner Level**

**`useMutation(MUTATION)`** **returns** **`[mutate, { loading, error }]`**.

**Real-time example**: **Todo** **GraphQL** **`createTodo`**.

**Intermediate Level**

**`refetchQueries`** **and** **`update`** **cache** **functions**.

**Expert Level**

**Optimistic** **response** **with** **rollback** **hooks**.

```tsx
import { gql, useMutation } from "@apollo/client";

const CREATE_TODO = gql`
  mutation CreateTodo($title: String!) {
    createTodo(title: $title) {
      id
      title
      done
    }
  }
`;

export function CreateTodoForm() {
  const [create, { loading }] = useMutation(CREATE_TODO);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void create({ variables: { title: "Buy milk" } })}
    >
      Create
    </button>
  );
}
```

#### Key Points — Apollo Mutation

- **Declarative** **variables** **with** **types** **from** **codegen**.
- **Prefer** **normalized** **cache** **updates** **over** **blind** **refetch** **when** **possible**.
- **Watch** **error** **policies** **for** **partial** **success**.

---

### GraphQL Code Generation

**Beginner Level**

**`graphql-codegen`** **generates** **TS** **types** **and** **hooks** **from** **schema** **+** **operations**.

**Real-time example**: **Large** **e-commerce** **schema** **with** **hundreds** **of** **types**.

**Intermediate Level**

**Client** **presets** **for** **Apollo/urql**.

**Expert Level**

**CI** **checks** **that** **operations** **match** **schema** **on** **every** **PR**.

#### Key Points — Codegen

- **Essential** **for** **large** **GraphQL** **codebases**.
- **Requires** **discipline** **in** **operation** **files**.
- **Improves** **refactor** **safety**.

---

### urql

**Beginner Level**

**Lightweight** **alternative** **with** **extensible** **exchanges**.

**Real-time example**: **Embedded** **widget** **with** **tiny** **bundle**.

**Intermediate Level**

**Graphcache** **for** **normalized** **caching**.

**Expert Level**

**Custom** **exchanges** **for** **auth** **and** **retry**.

```tsx
// Conceptual setup — see urql docs for exact APIs
declare const Provider: React.ComponentType<{ children: React.ReactNode }>;

export function UrqlProvider({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}
```

#### Key Points — urql

- **Great** **when** **bundle** **size** **matters**.
- **Plugin** **model** **is** **powerful** **but** **requires** **reading** **docs**.
- **Compare** **Dev** **experience** **to** **Apollo** **for** **your** **team**.

---

### Relay (Facebook)

**Beginner Level**

**Opinionated** **GraphQL** **framework** **with** **compile-time** **queries** **and** **strong** **normalization**.

**Real-time example**: **Large** **product** **surfaces** **with** **fragment** **colocation**.

**Intermediate Level**

**Steep** **learning** **curve** **and** **specific** **schema** **constraints**.

**Expert Level**

**Best** **when** **organization** **commits** **fully** **to** **Relay** **patterns** **and** **tooling**.

#### Key Points — Relay

- **Excellent** **scalability** **at** **very** **large** **scale**.
- **Not** **a** **light** **incremental** **add-on**.
- **Evaluate** **team** **capacity** **before** **adopting**.

---

## 12.7 REST API Patterns

### HTTP Methods (GET, POST, PUT/PATCH, DELETE)

**Beginner Level**

**GET** **reads**, **POST** **creates**, **PUT** **replaces**, **PATCH** **partially** **updates**, **DELETE** **removes**.

**Real-time example**: **Todo** **API**: **`GET /todos`**, **`POST /todos`**, **`PATCH /todos/:id`**, **`DELETE /todos/:id`**.

**Intermediate Level**

**Idempotency**: **PUT/DELETE** **should** **be** **idempotent**; **POST** **generally** **not**.

**Expert Level**

**Conflict** **responses** **`409`** **with** **structured** **bodies** **for** **merging** **strategies**.

```typescript
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function restCall<T>(method: HttpMethod, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}
```

#### Key Points — Methods

- **Match** **verb** **semantics** **to** **operation**.
- **Document** **which** **endpoints** **are** **safe** **for** **retries**.
- **Consider** **HEAD/OPTIONS** **for** **metadata** **and** **CORS** **preflight**.

---

### Headers (Auth, Content-Type, Accept)

**Beginner Level**

**`Authorization: Bearer <token>`** **for** **JWT** **sessions**; **`Content-Type: application/json`** **for** **JSON** **bodies**.

**Real-time example**: **Social** **API** **requires** **`Bearer`** **on** **mutations**.

**Intermediate Level**

**`Accept`** **negotiation** **for** **versioned** **responses** **`application/vnd.company.v+json`**.

**Expert Level**

**`Idempotency-Key`** **header** **for** **safe** **retries** **on** **POST** **payments**.

```typescript
export function authedHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
}
```

#### Key Points — Headers

- **Never** **log** **tokens** **client-side** **to** **analytics**.
- **CORS** **restrictions** **apply** **to** **browser** **requests**.
- **Standardize** **headers** **in** **one** **HTTP** **client** **wrapper**.

---

### Request Bodies & Serialization

**Beginner Level**

**`JSON.stringify`** **for** **objects**; **`FormData`** **for** **uploads**.

**Real-time example**: **Chat** **image** **upload** **uses** **`multipart/form-data`**.

**Intermediate Level**

**Validate** **payloads** **with** **zod** **before** **send**.

**Expert Level**

**Streaming** **uploads** **and** **signed** **URLs** **to** **object** **storage** **(S3)** **for** **large** **files**.

```typescript
export async function postJson<TResponse>(url: string, body: unknown): Promise<TResponse> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST failed ${res.status}`);
  return (await res.json()) as TResponse;
}
```

#### Key Points — Bodies

- **Choose** **JSON** **vs** **form** **based** **on** **API** **contract**.
- **Large** **payloads** **need** **progress** **UI** **and** **chunking** **strategies**.
- **Sanitize** **user** **input** **server-side** **always**.

---

### Response Handling & Parsing

**Beginner Level**

**Check** **`response.ok`**; **parse** **JSON** **or** **text** **based** **on** **`Content-Type`**.

**Real-time example**: **Dashboard** **handles** **`204 No Content`** **for** **deletes**.

**Intermediate Level**

**Problem** **JSON** **(`application/problem+json`)** **for** **structured** **errors**.

**Expert Level**

**Pagination** **headers** **`Link`**, **`X-Total-Count`**, **or** **JSON** **envelope** **`{ items, next }`**.

```typescript
export async function readJsonOrEmpty<T>(res: Response): Promise<T | null> {
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}
```

#### Key Points — Responses

- **Handle** **empty** **bodies** **explicitly**.
- **Don’t** **assume** **all** **errors** **are** **JSON**.
- **Map** **HTTP** **codes** **to** **UI** **states** **consistently**.

---

### REST Error Handling Patterns

**Beginner Level**

**Show** **message** **from** **server** **when** **safe**; **fallback** **to** **generic** **copy**.

**Real-time example**: **E-commerce** **checkout** **maps** **`402`** **to** **payment** **failure** **UI**.

**Intermediate Level**

**Retry** **only** **idempotent** **operations** **or** **with** **idempotency** **keys**.

**Expert Level**

**Circuit** **breakers** **and** **exponential** **backoff** **in** **native** **apps** **and** **sometimes** **BFFs**.

```typescript
export type ApiError = { status: number; message: string; requestId?: string };

export async function parseApiError(res: Response): Promise<ApiError> {
  const requestId = res.headers.get("x-request-id") ?? undefined;
  try {
    const j = (await res.json()) as { message?: string };
    return { status: res.status, message: j.message ?? res.statusText, requestId };
  } catch {
    return { status: res.status, message: res.statusText, requestId };
  }
}
```

#### Key Points — REST Errors

- **Centralize** **mapping** **from** **HTTP** **to** **UI** **states**.
- **Include** **support** **ids** **in** **logs**, **not** **necessarily** **in** **banners**.
- **Differentiate** **validation** **(400)** **from** **auth** **(401/403)**.

---

### Idempotency & Retries for REST

**Beginner Level**

**GET** **retries** **are** **usually** **safe**; **POST** **may** **duplicate** **unless** **designed** **for** **safety**.

**Real-time example**: **Payment** **submission** **uses** **idempotency** **key**.

**Intermediate Level**

**Exponential** **backoff** **with** **jitter** **for** **503** **responses**.

**Expert Level**

**Align** **client** **retry** **policy** **with** **API** **gateway** **rate** **limits**.

```typescript
export async function fetchWithRetry(url: string, init: RequestInit, attempts = 3): Promise<Response> {
  let last: Response | undefined;
  for (let i = 0; i < attempts; i++) {
    last = await fetch(url, init);
    if (last.ok) return last;
    if (last.status >= 500) {
      await new Promise((r) => setTimeout(r, 250 * 2 ** i));
      continue;
    }
    return last;
  }
  return last!;
}
```

#### Key Points — Idempotency

- **Design** **mutations** **for** **safe** **retries** **where** **UX** **demands** **it**.
- **Log** **duplicate** **detection** **server-side**.
- **Don’t** **blindly** **retry** **POST** **without** **keys**.

---

## Key Points (Chapter Summary)

- **Separate** **transport** **(fetch/axios)** **from** **state** **policy** **(caching**, **invalidation)**.
- **`useEffect`** **fetching** **is** **fine** **for** **learning** **and** **tiny** **widgets**—**libraries** **scale** **better**.
- **TanStack** **Query** **and** **SWR** **encode** **server** **cache** **behavior** **explicitly**.
- **GraphQL** **clients** **shine** **when** **schema** **is** **stable** **and** **colocated** **queries** **help** **teams**—**use** **codegen**.
- **REST** **patterns** **map** **cleanly** **to** **HTTP** **semantics**—**respect** **methods**, **headers**, **and** **error** **envelopes**.

---

## Best Practices (Global)

1. **Type** **DTOs** **at** **boundaries** **and** **validate** **with** **zod** **for** **untrusted** **JSON**.
2. **Cancel** **or** **ignore** **stale** **requests** **in** **interactive** **UIs**.
3. **Adopt** **one** **server-state** **library** **per** **app** **surface** **and** **standardize** **query** **keys**.
4. **Instrument** **fetch** **failures** **with** **request** **correlation** **ids**.
5. **Tune** **cache** **and** **revalidation** **per** **entity** **volatility** **(prices** **vs** **avatars)**.
6. **For** **GraphQL**, **invest** **in** **codegen** **and** **cache** **policies** **early**.
7. **For** **REST**, **centralize** **HTTP** **client** **configuration** **(base** **URL**, **auth**, **retry** **rules)**.

---

## Common Mistakes to Avoid

1. **Ignoring** **`!response.ok`** **with** **`fetch`** **and** **silently** **parsing** **error** **HTML** **as** **JSON**.
2. **Missing** **race** **handling** **in** **search** **and** **autocomplete** **components**.
3. **Duplicating** **server** **entities** **in** **`useState`** **and** **cache** **simultaneously** **without** **sync** **rules**.
4. **Over-polling** **endpoints** **that** **should** **use** **push** **or** **long** **cache** **TTLs**.
5. **Optimistic** **UI** **without** **rollback** **paths** **or** **server** **reconciliation**.
6. **GraphQL** **N+1** **queries** **at** **transport** **layer** **without** **batching**/**server** **optimization**.
7. **Retrying** **non-idempotent** **POST** **requests** **blindly** **after** **network** **errors**.

---

_This chapter connects to **Routing** (data loaders), **State Management** (local vs remote), and **Security** (tokens, CORS, and SSR)._
