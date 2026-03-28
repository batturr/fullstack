# GraphQL Client Libraries

## 📑 Table of Contents

- [26.1 Apollo Client](#261-apollo-client)
  - [26.1.1 Installation and Setup](#2611-installation-and-setup)
  - [26.1.2 Creating Client](#2612-creating-client)
  - [26.1.3 InMemoryCache Configuration](#2613-inmemorycache-configuration)
  - [26.1.4 HTTP Link Setup](#2614-http-link-setup)
  - [26.1.5 Authentication Link](#2615-authentication-link)
- [26.2 Queries with Apollo Client](#262-queries-with-apollo-client)
  - [26.2.1 useQuery Hook](#2621-usequery-hook)
  - [26.2.2 Query Execution](#2622-query-execution)
  - [26.2.3 Loading States](#2623-loading-states)
  - [26.2.4 Error Handling](#2624-error-handling)
  - [26.2.5 Query Refetching](#2625-query-refetching)
- [26.3 Mutations with Apollo Client](#263-mutations-with-apollo-client)
  - [26.3.1 useMutation Hook](#2631-usemutation-hook)
  - [26.3.2 Mutation Execution](#2632-mutation-execution)
  - [26.3.3 Mutation Variables](#2633-mutation-variables)
  - [26.3.4 Optimistic Responses](#2634-optimistic-responses)
  - [26.3.5 Update Function](#2635-update-function)
- [26.4 Cache Management](#264-cache-management)
  - [26.4.1 Cache Normalization](#2641-cache-normalization)
  - [26.4.2 Cache Updates](#2642-cache-updates)
  - [26.4.3 Cache Eviction](#2643-cache-eviction)
  - [26.4.4 Cache Persistence](#2644-cache-persistence)
  - [26.4.5 Reactive Cache](#2645-reactive-cache)
- [26.5 Subscriptions](#265-subscriptions)
  - [26.5.1 WebSocket Link Setup](#2651-websocket-link-setup)
  - [26.5.2 useSubscription Hook](#2652-usesubscription-hook)
  - [26.5.3 Real-time Updates](#2653-real-time-updates)
  - [26.5.4 Error Handling](#2654-error-handling)
  - [26.5.5 Disconnection Handling](#2655-disconnection-handling)
- [26.6 Advanced Features](#266-advanced-features)
  - [26.6.1 Fetch Policies](#2661-fetch-policies)
  - [26.6.2 Field Policies](#2662-field-policies)
  - [26.6.3 Local State Management](#2663-local-state-management)
  - [26.6.4 Apollo DevTools](#2664-apollo-devtools)
  - [26.6.5 Testing](#2665-testing)
- [26.7 Alternative Clients](#267-alternative-clients)
  - [26.7.1 Relay](#2671-relay)
  - [26.7.2 Urql](#2672-urql)
  - [26.7.3 SWR](#2673-swr)
  - [26.7.4 React Query](#2674-react-query)
  - [26.7.5 TanStack Query](#2675-tanstack-query)
- [26.8 Mobile Clients](#268-mobile-clients)
  - [26.8.1 React Native Apollo](#2681-react-native-apollo)
  - [26.8.2 iOS Apollo](#2682-ios-apollo)
  - [26.8.3 Android Apollo](#2683-android-apollo)
  - [26.8.4 Offline Support](#2684-offline-support)
  - [26.8.5 Persisted Queries](#2685-persisted-queries)

---

## 26.1 Apollo Client

### 26.1.1 Installation and Setup

#### Beginner

**Apollo Client** is an npm package that runs in the browser or Node.js and talks to your GraphQL server. You install core packages, then add React bindings if you use React. A minimal setup needs `@apollo/client` and `graphql`.

#### Intermediate

Peer dependency **`graphql`** must match versions expected by your tooling. For React 18+, use **`@apollo/client`** v3.8+ with **`graphql` ^16**. Tree-shaking works best when you import only the links and hooks you use. TypeScript users add **`@graphql-codegen`** for typed documents.

#### Expert

Bundle Apollo with **ESM** builds and consider **`@apollo/client/react/ssr`** for Next.js streaming. Use **`exports` field** resolution in Node 20+ and verify **duplicate `graphql` instances** (pnpm hoisting) do not break runtime—`npm ls graphql` should show a single version.

```javascript
// package.json scripts (conceptual)
// "dependencies": {
//   "@apollo/client": "^3.11.0",
//   "graphql": "^16.9.0",
//   "react": "^18.3.1"
// }
```

```javascript
// vite.config.js — dedupe graphql in monorepos
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["graphql", "@apollo/client"],
  },
});
```

#### Key Points

- Install `@apollo/client` and `graphql` together.
- React apps wrap the tree with `ApolloProvider`.
- Monorepos must dedupe `graphql` to avoid subtle bugs.

#### Best Practices

- Pin major versions across apps in a monorepo.
- Use codegen for operation types in TypeScript.
- Document required Node/browser versions in README.

#### Common Mistakes

- Mismatched `graphql` versions across packages.
- Forgetting `ApolloProvider` and wondering why hooks throw.
- Installing server-only packages on the client bundle by mistake.

---

### 26.1.2 Creating Client

#### Beginner

You create an **`ApolloClient`** instance with a **`cache`** (usually `InMemoryCache`) and a **`link`** chain that ends in `HttpLink`. Pass that client to **`ApolloProvider`** in React.

#### Intermediate

The client owns **document cache**, **local state** (deprecated `@client` in favor of separate state), and **default options** like `watchQuery.fetchPolicy`. You can split **`ApolloClient`** per micro-frontend or use a **singleton** for SPAs.

#### Expert

For **SSR**, create a **new client per request** to avoid cross-user cache leaks, or use **`resetStore`** carefully. Customize **`assumeImmutableResults`** when your server guarantees immutable JSON for perf. Use **`client.query` / `client.mutate`** on the server without React.

```javascript
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client";

const httpLink = new HttpLink({
  uri: "https://api.example.com/graphql",
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" },
  },
});
```

```javascript
// Node.js script — no React
import { gql } from "@apollo/client";

const GET_STATUS = gql`
  query Health {
    __typename
  }
`;

const { data, errors } = await apolloClient.query({ query: GET_STATUS });
console.log({ data, errors });
```

#### Key Points

- `ApolloClient` combines link chain + cache.
- Default options apply to all operations unless overridden.
- Server-side usage needs isolation per request/user.

#### Best Practices

- Export a factory `createApolloClient(initialState?)` for SSR/SSG.
- Keep URI and credentials in environment variables.
- Document whether you use cookies vs bearer tokens.

#### Common Mistakes

- Sharing one client across SSR requests without clearing cache.
- Omitting `credentials: "include"` when the API uses cookies.
- Creating a new client on every render inside a component.

---

### 26.1.3 InMemoryCache Configuration

#### Beginner

**`InMemoryCache`** stores query results in memory and **normalizes** objects that have `__typename` and `id` (or `keyFields`). You rarely need config for simple apps.

#### Intermediate

Use **`typePolicies`** to define **`keyFields`** for types without `id`, merge strategies for **paginated lists**, and **`read` / `merge`** for custom fields. **`possibleTypes`** helps with **fragments on interfaces/unions**.

#### Expert

Tune **`resultCaching`** and **`canonizeResults`** for advanced memory/CPU tradeoffs. Implement **`fields` policies** that encapsulate **offset/limit vs cursor** pagination. Use **`addTypename: false`** only when you fully control normalization risks (usually avoid).

```javascript
import { InMemoryCache } from "@apollo/client";

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        feed: {
          keyArgs: ["type", "filter"],
          merge(existing = [], incoming, { args }) {
            const offset = args?.offset ?? 0;
            const merged = existing ? existing.slice(0) : [];
            for (let i = 0; i < incoming.length; i += 1) {
              merged[offset + i] = incoming[i];
            }
            return merged;
          },
        },
      },
    },
    Product: {
      keyFields: ["sku"],
    },
  },
});
```

#### Key Points

- Normalization requires stable cache IDs.
- `typePolicies` customize IDs, merges, and reads.
- Pagination almost always needs a custom `merge`.

#### Best Practices

- Align `keyFields` with your domain uniqueness.
- Test cache behavior with integration tests, not only UI.
- Document pagination args (`offset`, `after`, etc.) in schema.

#### Common Mistakes

- Duplicate cache entries because `keyFields` are wrong.
- Replacing instead of merging paginated lists incorrectly.
- Missing `possibleTypes` leading to fragment warnings.

---

### 26.1.4 HTTP Link Setup

#### Beginner

**`HttpLink`** sends GraphQL operations over **HTTP POST** (default) to your endpoint. Set **`uri`** and optionally **`headers`** and **`credentials`**.

#### Intermediate

Use **`BatchHttpLink`** to batch multiple operations in one HTTP request (trade latency vs throughput). Configure **`fetch`** for **timeouts**, **retries**, or **custom agents** in Node. **`useGETForQueries`** can help CDN caching for **APQ**-style GET requests.

#### Expert

Compose **`split` link** to route subscriptions vs queries, or send **persisted queries** only on GET. Instrument **`fetch`** with **OpenTelemetry** propagation headers. Handle **413** / **414** by falling back from GET to POST in gateway layers.

```javascript
import { HttpLink, ApolloLink, split } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

const httpLink = new HttpLink({
  uri: process.env.VITE_GRAPHQL_HTTP_URL,
  credentials: "include",
});

const wsLink = new GraphQLWsLink(
  createClient({ url: process.env.VITE_GRAPHQL_WS_URL })
);

export const splitHttpWs = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return (
      def.kind === "OperationDefinition" &&
      def.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);
```

```javascript
// Custom fetch with timeout (browser or undici in Node 18+)
const httpLinkWithTimeout = new HttpLink({
  uri: "https://api.example.com/graphql",
  fetch: (uri, options) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 12_000);
    return fetch(uri, { ...options, signal: controller.signal }).finally(
      () => clearTimeout(id)
    );
  },
});
```

#### Key Points

- `HttpLink` is the default transport for queries/mutations.
- `split` routes by operation type or context.
- Timeouts and retries belong in `fetch` or link wrappers.

#### Best Practices

- Use environment-based URIs for dev/stage/prod.
- Enable `credentials: "include"` only when CORS allows it.
- Log HTTP status and `errors` array separately.

#### Common Mistakes

- Pointing `uri` to REST URLs or wrong path (`/graphq` typos).
- Mixing WS and HTTP URLs incorrectly in `split`.
- No timeout causing hung UI states.

---

### 26.1.5 Authentication Link

#### Beginner

An **auth link** runs before `HttpLink` and attaches **`Authorization`** (or cookies via `credentials`). Apollo provides **`setContext`** from `@apollo/client/link/context`.

#### Intermediate

Read tokens from **memory** (not `localStorage` if XSS is a concern) or refresh flows with **`Observable`**. Chain **error link** to catch **401** and trigger **token refresh** once, avoiding infinite loops with a **mutex**.

#### Expert

Implement **request signing** or **mTLS** at the fetch layer. Propagate **trace context** (`traceparent`) alongside auth. For **BFF** patterns, forward **session cookies** server-side and never expose long-lived tokens to the browser.

```javascript
import { ApolloLink, HttpLink, ApolloClient, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

let getAccessToken = () => null;

export function configureAuth(getToken) {
  getAccessToken = getToken;
}

const authLink = setContext((_, { headers }) => {
  const token = getAccessToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const httpLink = new HttpLink({ uri: "/graphql", credentials: "include" });

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

```javascript
import { onError } from "@apollo/client/link/error";

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (networkError && "statusCode" in networkError && networkError.statusCode === 401) {
    // Trigger refresh, retry operation — use a dedicated mutex in production
    console.warn("Unauthorized", operation.operationName);
  }
  if (graphQLErrors) {
    graphQLErrors.forEach((e) => console.warn(e.message));
  }
});
```

#### Key Points

- Auth links prepend headers per operation.
- 401 handling should coordinate with refresh logic.
- Cookies vs bearer tokens change CORS and storage choices.

#### Best Practices

- Prefer short-lived access tokens + refresh in native/mobile.
- Avoid logging full tokens; redact in DevTools overlays.
- Test auth expiry during long-lived SPA sessions.

#### Common Mistakes

- Storing refresh tokens in localStorage on untrusted sites.
- Retry storms on 401 without deduplication.
- Sending auth headers to third-party GraphQL endpoints accidentally.

---

## 26.2 Queries with Apollo Client

### 26.2.1 useQuery Hook

#### Beginner

**`useQuery`** runs a GraphQL **query** when your component mounts and returns **`data`**, **`loading`**, **`error`**, and helpers like **`refetch`**. It uses the client cache by default.

#### Intermediate

Pass **`variables`**, **`skip`**, **`pollInterval`**, and **`fetchPolicy`** to control behavior. **`notifyOnNetworkStatusChange`** updates `loading` during refetches. Use **`useLazyQuery`** for user-triggered fetches.

#### Expert

**`useQuery`** subscribes to **cache diffs**; heavy queries benefit from **`returnPartialData`** and **`nextFetchPolicy`**. For **React Concurrent**, understand **suspense** experimental APIs (`useSuspenseQuery`) and **streaming SSR** boundaries.

```javascript
import { gql, useQuery } from "@apollo/client";

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
    }
  }
`;

export function UserProfile({ userId }) {
  const { data, loading, error, refetch } = useQuery(GET_USER, {
    variables: { id: userId },
    skip: !userId,
    fetchPolicy: "cache-first",
  });

  if (loading) return <p>Loading…</p>;
  if (error) return <p role="alert">{error.message}</p>;
  return (
    <section>
      <h1>{data.user.name}</h1>
      <button type="button" onClick={() => refetch()}>
        Refresh
      </button>
    </section>
  );
}
```

#### Key Points

- `useQuery` is declarative and cache-aware.
- `skip` prevents firing until inputs exist.
- `fetchPolicy` trades freshness vs bandwidth.

#### Best Practices

- Co-locate queries with feature components or use `graphql` files.
- Handle empty `data` when partial errors exist.
- Prefer `cache-and-network` for frequently changing lists.

#### Common Mistakes

- Using `useQuery` for mutations (use `useMutation`).
- Ignoring `error` when `data` is still present (partial success).
- Creating new `gql` documents inline every render (stability).

---

### 26.2.2 Query Execution

#### Beginner

Queries execute as **network requests** unless the cache fully satisfies them. **`client.query`** runs once imperatively; **`useQuery`** keeps a **live subscription** to cache updates.

#### Intermediate

**`fetchPolicy`** values: `cache-first`, `cache-only`, `network-only`, `no-cache`, `cache-and-network`, `standby`. **`context`** can pass per-request headers to links. **`queryDeduplication`** merges identical in-flight queries.

#### Expert

Tune **`canonizeResults`** and **`resultCache`** at the client level. Use **`client.query` with `fetchPolicy: "network-only"`** in CLI jobs. For **prefetch**, `client.query` + `cache.writeQuery` patterns integrate with routers (React Router loaders).

```javascript
import { gql } from "@apollo/client";
import { client } from "./apolloClient.js";

const LIST_POSTS = gql`
  query ListPosts {
    posts {
      id
      title
    }
  }
`;

export async function prefetchPosts() {
  await client.query({
    query: LIST_POSTS,
    fetchPolicy: "network-only",
  });
}
```

```graphql
query ListPosts {
  posts {
    id
    title
  }
}
```

#### Key Points

- Imperative vs hook-based execution share the same cache.
- Deduplication reduces thundering herds.
- `context` flows through the link chain.

#### Best Practices

- Prefetch on route hover for perceived performance.
- Use `network-only` for security-sensitive reads in admin tools.
- Align policies with UX (stale-while-revalidate patterns).

#### Common Mistakes

- Calling `client.query` in render causing waterfalls.
- Disabling deduplication without measuring impact.
- Assuming `cache-only` will have data without seeding.

---

### 26.2.3 Loading States

#### Beginner

**`loading`** is true on the **first fetch**. After data exists, background refetches may not flip `loading` unless **`notifyOnNetworkStatusChange: true`**.

#### Intermediate

Inspect **`networkStatus`** from `@apollo/client` to distinguish **initial load**, **refetch**, **poll**, and **setVariables**. Combine with **skeleton UI** and **stale data** display for better UX.

#### Expert

Implement **global loading bars** via **`ApolloLink`** observing in-flight operations. For **Suspense**, use **`useSuspenseQuery`** (where supported) to unify loading with React boundaries. Beware **double-fetch** in Strict Mode during development.

```javascript
import { useQuery, NetworkStatus } from "@apollo/client";
import { gql } from "@apollo/client";

const QUERY = gql`
  query Dashboard {
    stats {
      totalUsers
    }
  }
`;

export function Dashboard() {
  const { data, error, networkStatus } = useQuery(QUERY, {
    notifyOnNetworkStatusChange: true,
  });

  const isRefetching = networkStatus === NetworkStatus.refetch;
  const isInitial = networkStatus === NetworkStatus.loading;

  if (isInitial && !data) return <p>Loading dashboard…</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <div>
      {isRefetching ? <span aria-live="polite">Refreshing…</span> : null}
      <p>Users: {data.stats.totalUsers}</p>
    </div>
  );
}
```

#### Key Points

- `loading` alone is insufficient for refetch UX.
- `networkStatus` enables granular spinners.
- Suspense changes where loading renders (boundaries).

#### Best Practices

- Show previous data while refetching when possible.
- Announce async updates for screen readers (`aria-live`).
- Avoid flashing empty states on fast networks.

#### Common Mistakes

- Hiding all content during background refetch.
- Treating `loading` as false when `error` is set incorrectly.
- Infinite spinners when `skip` is true without handling UI.

---

### 26.2.4 Error Handling

#### Beginner

**`error`** on `useQuery` aggregates **network failures** and **GraphQL errors** (unless **`errorPolicy: "all"`**). GraphQL can return **200 OK** with `errors` in the body.

#### Intermediate

Use **`errorPolicy`**: `none` (default), `ignore`, `all`. With **`all`**, inspect **`data`** and **`error.graphQLErrors`**. Map **domain codes** from extensions to UI.

#### Expert

Normalize **ApolloError** with **Sentry** tags (`operationName`, `variables` redacted). Implement **retry links** for **5xx** and **rate limits** with **exponential backoff** and **jitter**. Distinguish **auth errors** from **validation** vs **system**.

```javascript
import { gql, useQuery } from "@apollo/client";

const QUERY = gql`
  query Node($id: ID!) {
    node(id: $id) {
      id
      ... on User {
        name
      }
    }
  }
`;

export function NodeViewer({ id }) {
  const { data, error } = useQuery(QUERY, {
    variables: { id },
    errorPolicy: "all",
  });

  if (error?.graphQLErrors?.length) {
    const forbidden = error.graphQLErrors.some(
      (e) => e.extensions?.code === "FORBIDDEN"
    );
    if (forbidden) return <p>Access denied.</p>;
  }

  if (!data?.node && error) return <p>Something went wrong.</p>;
  return <pre>{JSON.stringify(data?.node, null, 2)}</pre>;
}
```

#### Key Points

- GraphQL errors are not always HTTP errors.
- `errorPolicy: "all"` enables partial data rendering.
- Extensions carry machine-readable codes.

#### Best Practices

- Centralize logging in an `onError` link.
- Redact PII from error reports.
- Show actionable messages for validation errors.

#### Common Mistakes

- Assuming `fetch` errors mean GraphQL `errors` is empty.
- Swallowing errors without user feedback.
- Logging full variables containing passwords.

---

### 26.2.5 Query Refetching

#### Beginner

**`refetch()`** repeats the query with the **same variables**. **`refetchQueries`** on mutations updates related views after writes.

#### Intermediate

Pass **new variables** to `refetch({ id: nextId })`. Use **`awaitRefetchQueries: true`** on mutations for transactional UX. **`pollInterval`** automates refetch loops.

#### Expert

Prefer **cache updates** over blanket refetch for hot paths. Combine **`nextFetchPolicy`** to avoid hammering network after a `network-only` refresh. For **real-time**, subscriptions + targeted cache writes often beat polling.

```javascript
import { gql, useMutation, useQuery } from "@apollo/client";

const GET_TODOS = gql`
  query Todos {
    todos {
      id
      title
      done
    }
  }
`;

const ADD_TODO = gql`
  mutation AddTodo($title: String!) {
    addTodo(title: $title) {
      id
      title
      done
    }
  }
`;

export function TodoApp() {
  const { data } = useQuery(GET_TODOS);
  const [addTodo] = useMutation(ADD_TODO, {
    awaitRefetchQueries: true,
    refetchQueries: [{ query: GET_TODOS }],
  });

  return (
    <button type="button" onClick={() => addTodo({ variables: { title: "Buy milk" } })}>
      Add
    </button>
  );
}
```

#### Key Points

- Refetch is simple but can be heavy on large graphs.
- `refetchQueries` couples mutations to views.
- Polling is a blunt instrument for live data.

#### Best Practices

- Refetch lists after mutations when cache updates are complex.
- Debounce user-driven refetch buttons.
- Monitor refetch rates in production metrics.

#### Common Mistakes

- Refetching entire dashboard on every small mutation.
- Forgetting `awaitRefetchQueries` and navigating away too early.
- Polling too aggressively on mobile networks.

---

## 26.3 Mutations with Apollo Client

### 26.3.1 useMutation Hook

#### Beginner

**`useMutation`** returns a **tuple** `[mutateFn, { data, loading, error }]`. Call **`mutateFn({ variables })`** when the user submits a form.

#### Intermediate

Options include **`refetchQueries`**, **`update`**, **`optimisticResponse`**, **`errorPolicy`**, and **`context`**. The hook can take a **static** mutation document or you can pass **`mutation`** to the mutate function (less common).

#### Expert

Use **`onCompleted` / `onError`** carefully—they run on every invocation; prefer **`async`/`await`** with mutate for linear flows. For **concurrent mutations**, track **request IDs** to ignore stale responses.

```javascript
import { gql, useMutation } from "@apollo/client";

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      displayName
    }
  }
`;

export function ProfileForm({ initial }) {
  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE);

  async function onSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await updateProfile({
      variables: {
        input: { displayName: String(form.get("displayName") || "") },
      },
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <input name="displayName" defaultValue={initial.displayName} />
      <button type="submit" disabled={loading}>
        Save
      </button>
    </form>
  );
}
```

#### Key Points

- Mutations are triggered imperatively.
- The hook exposes network state like `useQuery`.
- `update` runs after the server response for cache writes.

#### Best Practices

- Disable submit while `loading`.
- Reset forms on `onCompleted` when appropriate.
- Type variables with codegen.

#### Common Mistakes

- Calling the mutation in render.
- Not handling errors on forms.
- Using mutations for read-only operations.

---

### 26.3.2 Mutation Execution

#### Beginner

**Execution** sends a **POST** with `{ query, variables, operationName }`. Apollo serializes the document and handles **multipart** uploads if using **`@apollo/client/link/upload`**.

#### Intermediate

**`client.mutate`** runs outside React. **`context`** can switch endpoints via custom links. **Idempotent** mutations should be safe to retry; use **mutation IDs** server-side for deduplication.

#### Expert

Batching mutations with **`BatchHttpLink`** can reorder—avoid when ordering matters unless your API is commutative. Instrument with **OpenTelemetry** spans around `mutate`. For **file uploads**, use **`createUploadLink`** or **`extract-files`**.

```javascript
import { gql } from "@apollo/client";
import { client } from "./apolloClient.js";

const CREATE_ORDER = gql`
  mutation CreateOrder($input: OrderInput!) {
    createOrder(input: $input) {
      id
    }
  }
`;

export async function createOrderNode(input) {
  const result = await client.mutate({
    mutation: CREATE_ORDER,
    variables: { input },
  });
  if (result.errors?.length) {
    throw new Error(result.errors.map((e) => e.message).join("; "));
  }
  return result.data.createOrder;
}
```

#### Key Points

- `client.mutate` mirrors hook behavior.
- Context flows through links for routing/auth.
- Batching changes failure and ordering semantics.

#### Best Practices

- Return affected entity IDs from mutations for cache updates.
- Validate inputs client-side before network calls.
- Log mutation names, not full payloads, in production.

#### Common Mistakes

- Assuming mutations are automatically retried safely.
- Omitting `await` and racing UI navigation.
- Huge variables payloads without compression or chunking.

---

### 26.3.3 Mutation Variables

#### Beginner

**Variables** are a JSON object matching your operation signature. Apollo sends them separately from the query string.

#### Intermediate

Use **input types** on the server for grouping fields. **`variables` must be JSON-serializable**—convert `Date` to ISO strings, `BigInt` to string if needed.

#### Expert

**Variable validation** can happen client-side with **zod** + codegen types. For **polymorphic inputs**, align with GraphQL **union input** limitations (not in spec—use separate mutations or `JSON` scalars carefully).

```graphql
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
  }
}
```

```javascript
await createPost({
  variables: {
    input: {
      title: "GraphQL clients",
      tags: ["apollo", "relay"],
      publishedAt: new Date().toISOString(),
    },
  },
});
```

#### Key Points

- Variables are typed by the GraphQL operation.
- Non-serializable values break at runtime.
- Input objects mirror server schema.

#### Best Practices

- Keep variables small; avoid echoing huge blobs.
- Use enums and scalars consistently with the schema.
- Strip undefined keys if your server rejects unknown fields.

#### Common Mistakes

- Passing `undefined` where `null` is required.
- Mismatched variable names (`userID` vs `userId`).
- Forgetting to wrap nested objects in `input`.

---

### 26.3.4 Optimistic Responses

#### Beginner

**`optimisticResponse`** lets the UI update **before** the server answers, assuming the result shape. Apollo rolls back if the mutation fails.

#### Intermediate

Must include **`__typename`** for normalized types. Match **field selection** to what your mutation returns. Combine with **`update`** for list edges.

#### Expert

For **temporary IDs**, use **client-generated IDs** and reconcile in `update` when the real ID returns. Watch **race conditions** when multiple optimistic mutations overlap—use **queues** or **serializable** UX.

```javascript
const [likePost] = useMutation(LIKE_POST, {
  optimisticResponse: (vars) => ({
    __typename: "Mutation",
    likePost: {
      __typename: "Post",
      id: vars.postId,
      likes: 1, // simplified; real apps read previous from cache
      likedByMe: true,
    },
  }),
});
```

#### Key Points

- Optimistic UI improves perceived latency.
- Correct `__typename` is mandatory.
- Failed mutations revert optimistic data.

#### Best Practices

- Read current values from cache for counters, not hard-coded guesses.
- Test failure paths to ensure rollback feels right.
- Keep optimistic shapes minimal.

#### Common Mistakes

- Missing `__typename` breaking normalization.
- Optimistic data that does not match server reality.
- Over-optimism on payments or irreversible actions.

---

### 26.3.5 Update Function

#### Beginner

The **`update(cache, result)`** function runs after a successful mutation so you can **`writeQuery`**, **`modify`**, or **`evict`** cache entries without refetching everything.

#### Intermediate

Use **`cache.updateQuery`** for ergonomic merges. Read with **`cache.readQuery`** only if data exists; guard with try/catch or `readField`.

#### Expert

Prefer **`cache.modify`** for surgical updates. Combine with **`relayStylePagination`** helper patterns for edges. Handle **multi-query** updates when the same entity appears in many views.

```javascript
import { gql, useMutation } from "@apollo/client";

const GET_COMMENTS = gql`
  query Comments($postId: ID!) {
    comments(postId: $postId) {
      id
      body
    }
  }
`;

const ADD_COMMENT = gql`
  mutation AddComment($postId: ID!, $body: String!) {
    addComment(postId: $postId, body: $body) {
      id
      body
    }
  }
`;

export function useAddComment(postId) {
  return useMutation(ADD_COMMENT, {
    update(cache, { data }) {
      const newComment = data?.addComment;
      if (!newComment) return;
      cache.updateQuery({ query: GET_COMMENTS, variables: { postId } }, (existing) => {
        if (!existing) return existing;
        return {
          comments: [...existing.comments, newComment],
        };
      });
    },
  });
}
```

#### Key Points

- `update` is the precise cache write hook post-mutation.
- `cache.modify` avoids reading whole queries.
- Guard for missing baseline cache data.

#### Best Practices

- Keep updates idempotent where possible.
- Factor repeated cache logic into helpers.
- Pair with `refetchQueries` as a safety net during migration.

#### Common Mistakes

- Throwing when `readQuery` misses—handle cold cache.
- Duplicating items in lists on retry.
- Updating wrong `variables` keys.

---

## 26.4 Cache Management

### 26.4.1 Cache Normalization

#### Beginner

Apollo flattens responses into a **normalized map** keyed by **`__typename:id`**. Repeated objects are **deduplicated** across queries.

#### Intermediate

**`dataIdFromObject`** (older) vs **`typePolicies.keyFields`** (preferred) control IDs. **Embedded objects** without IDs are **embedded** (not shared) unless you add `keyFields`.

#### Expert

**Non-normalized** nested objects can **denormalize** updates—design schemas with **stable IDs** on entities you mutate. **`possibleTypes`** required for accurate fragment matching in polymorphic lists.

```javascript
import { InMemoryCache } from "@apollo/client";

const cache = new InMemoryCache({
  typePolicies: {
    Comment: {
      keyFields: ["postId", "createdAt"],
    },
  },
});
```

#### Key Points

- Normalization enables automatic UI consistency.
- IDs must be unique and stable.
- Embedded objects duplicate until keyed.

#### Best Practices

- Ensure every mutable node has a server ID.
- Align `keyFields` with database primary keys.
- Audit types imported from REST wrappers for ID quality.

#### Common Mistakes

- Using display names as IDs.
- Colliding IDs across types (mitigated by typename prefix).
- Omitting `__typename` in manual `writeFragment` data.

---

### 26.4.2 Cache Updates

#### Beginner

Updates happen via **mutation `update`**, **`refetchQueries`**, or **`cache.writeQuery`**. Reads should go through hooks for reactivity.

#### Intermediate

**`cache.evict`** removes objects; **`cache.gc`** reclaims memory. **`modify`** can delete fields with **`DELETE`** sentinel from `@apollo/client`.

#### Expert

Implement **event-driven invalidation** from **subscriptions** writing to cache. For **pagination**, use **`merge` policies** that respect **args** and avoid O(n²) merges on large feeds.

```javascript
import { ApolloCache } from "@apollo/client";

function evictUser(cache, userId) {
  cache.evict({ id: cache.identify({ __typename: "User", id: userId }) });
  cache.gc();
}
```

#### Key Points

- Prefer targeted updates over wholesale refetch.
- Eviction + GC removes orphaned nodes.
- Pagination merges are the highest-risk area.

#### Best Practices

- Write integration tests around list operations.
- Document which queries show the same entity.
- Use `broadcast: false` only when you know the implications.

#### Common Mistakes

- Evicting without `gc` leaving stale references.
- Shallow merges losing nested fields.
- Updating cache shape that does not match query shape.

---

### 26.4.3 Cache Eviction

#### Beginner

**`cache.evict`** removes an entity or field from the store. Components **re-render** when watched data disappears.

#### Intermediate

Evict after **logout** to prevent cross-session leaks. Combine with **`resetStore`** to clear in-flight queries. **`ROOT_QUERY`** field eviction clears specific roots.

#### Expert

**Selective eviction** under memory pressure on low-end devices. Pair with **persisted cache** libraries that mirror eviction rules. Watch **reference leaks** when evicting nodes still referenced elsewhere.

```javascript
await client.clearStore(); // cancels in-flight, clears cache
// or
await client.resetStore(); // clear + refetch active queries
```

#### Key Points

- `evict` is granular; `clearStore` is nuclear.
- `resetStore` refetches active `useQuery` subscriptions.
- Logout flows should clear sensitive data.

#### Best Practices

- Centralize logout in an auth service.
- Test back-button behavior after eviction.
- Document which queries survive navigation.

#### Common Mistakes

- Using `resetStore` during form edits causing surprise refetches.
- Evicting only `User` but leaving `Session` objects.
- Not awaiting async store clears before redirect.

---

### 26.4.4 Cache Persistence

#### Beginner

**`apollo3-cache-persist`** (community) or custom **`localStorage`** hydration saves the cache across reloads. Restore before rendering the app.

#### Intermediate

**Encrypt** sensitive fields at rest or **avoid persisting** secrets entirely. **Throttle** writes to storage to reduce main-thread jank. **Version** persisted shape and **migrate** on app upgrades.

#### Expert

Use **IndexedDB** for large caches. **Partial persistence** stores public data only. **SSR** hydration merges **server snapshot** with **client persist** carefully to avoid **flash of stale content**.

```javascript
import { persistCache, LocalStorageWrapper } from "apollo3-cache-persist";
import { apolloClient } from "./apolloClient.js";

await persistCache({
  cache: apolloClient.cache,
  storage: new LocalStorageWrapper(window.localStorage),
  debounce: 500,
  key: "apollo-cache-persist",
});
```

#### Key Points

- Persistence improves offline and cold-start UX.
- Sensitive data persistence is a security risk.
- Debouncing protects performance.

#### Best Practices

- Gate persistence behind user consent where required.
- Bump storage key on breaking schema changes.
- Test private browsing modes (storage may throw).

#### Common Mistakes

- Persisting auth tokens in plaintext.
- Restoring incompatible cache versions crashing the app.
- Writing entire cache every render.

---

### 26.4.5 Reactive Cache

#### Beginner

When cache data changes, **`useQuery`** components **re-render** automatically. That is Apollo’s reactive model.

#### Intermediate

**`cache.watch`** provides low-level subscriptions for non-React code. **`makeVar`** from `@apollo/client` exposes **reactive variables** for local state (legacy patterns—often prefer React state today).

#### Expert

**`useFragment`** (newer APIs) fine-grains subscriptions to fragments. Combine **`relay-style` selectors** with **memoization** to minimize renders on large tables.

```javascript
import { makeVar, useReactiveVar } from "@apollo/client";

const cartOpenVar = makeVar(false);

export function useCartDrawer() {
  const open = useReactiveVar(cartOpenVar);
  return {
    open,
    setOpen: (v) => cartOpenVar(v),
  };
}
```

#### Key Points

- Reactive vars integrate with Apollo’s broadcast system.
- `useReactiveVar` bridges to React.
- Prefer minimal reactive surface area.

#### Best Practices

- Keep reactive vars for truly cross-cutting UI flags.
- Document who can mutate a var.
- Avoid storing large structures in vars.

#### Common Mistakes

- Using vars for server data duplicates source of truth.
- Mutating var objects without replacing reference.
- Overusing global vars causing hidden coupling.

---

## 26.5 Subscriptions

### 26.5.1 WebSocket Link Setup

#### Beginner

**Subscriptions** use a **WebSocket** connection. With **`graphql-ws`**, create a client and wrap it in **`GraphQLWsLink`**.

#### Intermediate

**`split`** routes subscriptions to WS and other operations to HTTP. Configure **`connectionParams`** for auth tokens sent on connect. **Reverse proxies** must support WS upgrades (sticky sessions).

#### Expert

**`lazy: true`** delays connection until first subscription. **`retryAttempts`** and **`shouldRetry`** handle flaky networks. Align **subprotocol** (`graphql-transport-ws` vs legacy) between client and server.

```javascript
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

const wsLink = new GraphQLWsLink(
  createClient({
    url: "wss://api.example.com/graphql",
    connectionParams: () => ({
      authorization: `Bearer ${getToken()}`,
    }),
    lazy: true,
  })
);
```

#### Key Points

- WS link is separate from `HttpLink`.
- `connectionParams` is the right place for auth.
- Infra must allow long-lived connections.

#### Best Practices

- Use `wss://` in production.
- Reconnect with backoff on mobile.
- Monitor connection counts server-side.

#### Common Mistakes

- Mixing wrong graphql-ws protocol with server.
- Putting huge JWTs in query strings.
- Load balancers timing out idle WS.

---

### 26.5.2 useSubscription Hook

#### Beginner

**`useSubscription`** listens for server-pushed events and updates **`data`** when messages arrive.

#### Intermediate

Options include **`shouldResubscribe`**, **`variables`**, **`skip`**, and **`onData` / `onError` / `onComplete`**. Combine with **`useQuery`** for initial snapshot + live updates.

#### Expert

**Multiplex** multiple logical channels with variables rather than opening many sockets if your server supports it. Handle **backpressure** when events arrive faster than render—**batch** in `useEffect`.

```javascript
import { gql, useSubscription } from "@apollo/client";

const ON_COMMENT_ADDED = gql`
  subscription OnCommentAdded($postId: ID!) {
    commentAdded(postId: $postId) {
      id
      body
    }
  }
`;

export function LiveComments({ postId }) {
  const { data, error } = useSubscription(ON_COMMENT_ADDED, {
    variables: { postId },
    skip: !postId,
  });

  if (error) return <p>{error.message}</p>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

#### Key Points

- Subscriptions are push, not pull.
- `skip` avoids subscribing until ready.
- Callbacks run outside React render—avoid setState races without care.

#### Best Practices

- Seed UI with a query, refine with subscription.
- Unsubscribe on unmount is automatic with the hook.
- Rate-limit high-frequency events at the server.

#### Common Mistakes

- Expecting `loading` semantics identical to queries.
- Subscribing in a loop per list item explosively.
- No initial query → empty UI until first event.

---

### 26.5.3 Real-time Updates

#### Beginner

When **`data`** updates from a subscription, Apollo writes to cache if configured, and components **re-render**.

#### Intermediate

Use **`updateQuery`** on the subscription result or **`cache.modify`** to merge into lists. Prefer **stable sorting** when inserting events.

#### Expert

**CRDT-style** merges for collaborative editors need **vector clocks** beyond GraphQL defaults. For **fanout**, shard subscriptions by **tenant** to cap cardinality.

```javascript
useSubscription(ON_MESSAGE, {
  variables: { roomId },
  onData({ client, data: { data: incoming } }) {
    const message = incoming?.messageReceived;
    if (!message) return;
    client.cache.updateQuery(
      { query: LIST_MESSAGES, variables: { roomId } },
      (prev) => ({
        messages: [...(prev?.messages ?? []), message],
      })
    );
  },
});
```

#### Key Points

- Decide whether subscription payloads are full entities or deltas.
- List merging must avoid duplicates.
- Client cache is single source for UI after merge.

#### Best Practices

- Include enough fields to normalize messages.
- De-duplicate by ID on the client.
- Server should order events consistently.

#### Common Mistakes

- Appending duplicates on reconnect replay.
- Dropping events when cache read misses.
- Over-updating causing render thrash.

---

### 26.5.4 Error Handling

#### Beginner

Subscription **transport errors** surface via hook **`error`**. **GraphQL errors** may still arrive as messages on the WS.

#### Intermediate

Use **`onError`** on `createClient` for **protocol-level** issues. Map **`forbidden`** closes to **auth refresh**. **Retry** subscriptions after token renewal.

#### Expert

**Heartbeat/ping** timeouts should align between client and server. **Classify** benign reconnects vs **fatal** auth failures to avoid infinite loops.

```javascript
import { createClient } from "graphql-ws";

createClient({
  url: "wss://api.example.com/graphql",
  on: {
    error: (err) => {
      console.error("graphql-ws error", err);
    },
    closed: (event) => {
      console.info("ws closed", event.code, event.reason);
    },
  },
});
```

#### Key Points

- Distinguish WS close codes from GraphQL errors.
- `onError` on the client complements hook errors.
- Token expiry needs proactive refresh.

#### Best Practices

- Surface a non-blocking “reconnecting…” banner.
- Log subscription names in observability.
- Test airplane mode transitions.

#### Common Mistakes

- Ignoring silent disconnects with no UI feedback.
- Refreshing page as the only recovery path.
- Treating all closes as auth failures.

---

### 26.5.5 Disconnection Handling

#### Beginner

WebSockets **drop** on sleep, network change, or server restart. Clients should **reconnect** automatically (`graphql-ws` does by default with config).

#### Intermediate

**`retryWait`** functions implement backoff. **`shouldRetry`** can stop after **401**. **`keepAlive`** settings detect half-open connections.

#### Expert

**Mobile OS** backgrounding suspends JS—expect gaps. **Replay** missed events using **cursor-based catch-up queries** on resume, not only WS.

```javascript
createClient({
  url: "wss://api.example.com/graphql",
  retryAttempts: Infinity,
  retryWait: async (retries) => {
    const base = 1000;
    const max = 30_000;
    const exp = Math.min(max, base * 2 ** retries);
    await new Promise((r) => setTimeout(r, exp));
  },
});
```

#### Key Points

- Reconnect is mandatory for production WS.
- Exponential backoff protects the server.
- Catch-up queries close data gaps.

#### Best Practices

- Persist last seen event ID server-side or client-side.
- Show offline state clearly.
- Cap retries on auth failure paths.

#### Common Mistakes

- Infinite tight reconnect loops hammering the server.
- Assuming no duplicate deliveries after reconnect.
- No user-visible offline indicator.

---

## 26.6 Advanced Features

### 26.6.1 Fetch Policies

#### Beginner

**`fetchPolicy`** controls how Apollo balances **cache** vs **network**. Defaults differ between **`watchQuery`** and **`query`**.

#### Intermediate

Common policies: **`cache-first`**, **`network-only`**, **`cache-and-network`**, **`no-cache`**, **`standby`**. Use **`nextFetchPolicy`** to change after first result.

#### Expert

**`cache-and-network`** shows stale fast then updates—great for dashboards. **`no-cache`** for **sensitive** reads. **`standby`** for background queries that should not fetch.

```javascript
useQuery(DASHBOARD, {
  fetchPolicy: "cache-and-network",
  nextFetchPolicy: "cache-first",
});
```

#### Key Points

- Policies are per-hook, per-call.
- `nextFetchPolicy` avoids perpetual network on refetch.
- `network-only` bypasses reads but still writes cache.

#### Best Practices

- Match policy to data freshness requirements.
- Document team defaults in a style guide.
- Measure cache hit rates before tuning.

#### Common Mistakes

- Using `no-cache` everywhere “to be safe.”
- Expecting `cache-only` to fetch when empty.
- Ignoring policy interaction with SSR.

---

### 26.6.2 Field Policies

#### Beginner

**Field policies** under **`typePolicies.Query.fields`** customize **how** cached fields are **read** and **merged**.

#### Intermediate

**`read(existing, { args, cache })`** can synthesize fields. **`merge`** handles **arguments** and **pagination**. **`keyArgs`** defines cache key components.

#### Expert

**`relayStylePagination`** helper standardizes **cursor connections**. **Field read functions** can **delegate** to other cache entities via **`toReference`**.

```javascript
import { relayStylePagination } from "@apollo/client/utilities";

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        postsConnection: relayStylePagination(["filter"]),
      },
    },
  },
});
```

#### Key Points

- Field policies encode list semantics in the cache.
- `keyArgs` must reflect meaningful cache partitions.
- Relay-style helpers reduce boilerplate.

#### Best Practices

- Start simple; add `merge` when duplicates appear.
- Test `fetchMore` paths exhaustively.
- Align with server cursor spec (Relay connections).

#### Common Mistakes

- Wrong `keyArgs` causing cross-user cache bleed.
- Merge functions that drop `pageInfo`.
- Custom read functions with side effects.

---

### 26.6.3 Local State Management

#### Beginner

Historically **`@client`** fields let Apollo hold **local-only** data. Modern guidance: use **React state**, **Zustand**, **Jotai**, etc., for UI state; use Apollo for **server state**.

#### Intermediate

**`ReactiveVar`**, **`localResolvers`** (deprecated path)—migrate to **explicit cache writes** or external stores. **`typePolicies` with `read`** can still project **computed** server fields.

#### Expert

If unifying is required, **colocate** server queries with **minimal** local overlays. **Avoid** duplicating the same entity in Apollo and Redux.

```javascript
// Prefer React state for purely local UI
import { useState } from "react";

export function useSidebar() {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}
```

#### Key Points

- Server cache and UI state have different lifecycles.
- Deprecated local resolver APIs should not start new projects.
- Computed reads can still live in `typePolicies`.

#### Best Practices

- Use Apollo for remote data; React for ephemeral UI.
- Document boundaries in architecture ADRs.
- Snapshot tests around cache for risky merges only.

#### Common Mistakes

- Storing form drafts in Apollo cache unnecessarily.
- Mixing `@client` with SSR awkwardly.
- Two sources of truth for the same entity.

---

### 26.6.4 Apollo DevTools

#### Beginner

**Apollo Client DevTools** (browser extension) inspects **cache**, **queries**, and **mutations**. Install from your browser’s store.

#### Intermediate

**`connectToDevTools: true`** enables in development builds only. **`name`** identifies clients in multi-client setups.

#### Expert

**Export cache snapshot** to JSON for reproducing bugs. Pair with **React DevTools profiler** to catch **over-render** from cache broadcasts.

```javascript
export const client = new ApolloClient({
  link,
  cache,
  connectToDevTools: import.meta.env.DEV,
  devtools: { name: "storefront" },
});
```

#### Key Points

- DevTools are development-only aids.
- Named clients disambiguate micro-frontends.
- Cache tab explains normalization visually.

#### Best Practices

- Disable in production bundles (tree-shake).
- Train support on exporting faulty cache states.
- Verify queries in DevTools before blaming the server.

#### Common Mistakes

- Shipping `connectToDevTools: true` to prod.
- Misreading normalized IDs as bugs.
- Ignoring `network` tab when WS is involved.

---

### 26.6.5 Testing

#### Beginner

Use **`MockedProvider`** from `@apollo/client/testing` to wrap components and supply **mocked responses** for **`useQuery`**.

#### Intermediate

**`addTypename: false`** in tests reduces noise; align with production **`InMemoryCache`** config when testing **`merge`**. Use **`waitFor`** from Testing Library.

#### Expert

**MSW** can mock HTTP at the network layer for integration tests. **Record/replay** with **Polly.js** for **contract tests** against staging GraphQL.

```javascript
import { MockedProvider } from "@apollo/client/testing";
import { render, screen, waitFor } from "@testing-library/react";
import { gql } from "@apollo/client";
import { UserProfile } from "./UserProfile.jsx";

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
    }
  }
`;

const mocks = [
  {
    request: { query: GET_USER, variables: { id: "1" } },
    result: { data: { user: { id: "1", name: "Ada", __typename: "User" } } },
  },
];

test("renders user", async () => {
  render(
    <MockedProvider mocks={mocks}>
      <UserProfile userId="1" />
    </MockedProvider>
  );
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText("Ada")).toBeInTheDocument());
});
```

#### Key Points

- `MockedProvider` uses a real Apollo cache.
- Mocks must match variables exactly.
- Integration tests benefit from MSW realism.

#### Best Practices

- Test error and loading paths.
- Keep mock data shapes aligned with schema.
- Snapshot critical cache updates after mutations.

#### Common Mistakes

- Forgetting `__typename` in mock entities.
- Mocks array order not matching operation order.
- Flaky tests without `waitFor`.

---

## 26.7 Alternative Clients

### 26.7.1 Relay

#### Beginner

**Relay** is Facebook’s GraphQL client for React with **strong opinions**: **fragments colocated** with components, **compiler** required.

#### Intermediate

**`RelayEnvironmentProvider`**, **`fetchQuery`**, **`useLazyLoadQuery`**, **`useFragment`**. The compiler generates **artifact files** and enforces **@connection** for pagination.

#### Expert

Relay excels at **very large** apps with **schema discipline**. **Persisted queries** and **normalization** are first-class. Migration from Apollo needs **fragment** refactoring and **build** pipeline changes.

```javascript
import { Environment, Network, RecordSource, Store } from "relay-runtime";
import { RelayEnvironmentProvider } from "react-relay";

function createEnvironment() {
  return new Environment({
    network: Network.create(async (params, variables) => {
      const res = await fetch("/graphql", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: params.text, variables }),
      });
      return res.json();
    }),
    store: new Store(new RecordSource()),
  });
}
```

#### Key Points

- Relay needs the compiler in the build.
- Co-located fragments enforce data dependencies.
- Steeper learning curve, strong payoff at scale.

#### Best Practices

- Invest in schema stable IDs.
- Teach teams Relay patterns early.
- Use official example apps as templates.

#### Common Mistakes

- Skipping the compiler and using text queries ad hoc.
- Mixing Apollo and Relay in one subtree without isolation.
- Under-specifying `@connection` keys.

---

### 26.7.2 Urql

#### Beginner

**urql** is a **lightweight** GraphQL client with a **piped** architecture (**exchanges**). Great for **bundle size** sensitivity.

#### Intermediate

**`Client`**, **`Provider`**, **`useQuery`**, **`useMutation`**, **`cacheExchange`**, **`fetchExchange`**. Add **`@urql/exchange-graphcache`** for normalized caching similar to Apollo.

#### Expert

Custom **exchanges** implement **dedup**, **retry**, **auth**, and **offline**. **Document caching** tradeoffs vs normalized **graphcache**.

```javascript
import { Client, cacheExchange, fetchExchange, Provider } from "urql";

const client = new Client({
  url: "/graphql",
  exchanges: [cacheExchange, fetchExchange],
});

export function AppProviders({ children }) {
  return <Provider value={client}>{children}</Provider>;
}
```

#### Key Points

- Exchanges compose like Apollo links.
- Default cache is simpler than Apollo’s normalization.
- Graphcache adds power with configuration.

#### Best Practices

- Start with defaults; add graphcache when needed.
- Read urql docs on SSR patterns.
- Measure bundle impact vs Apollo.

#### Common Mistakes

- Expecting Apollo-level defaults out of the box.
- Misordering exchanges in the pipeline.
- Ignoring subscription exchange setup.

---

### 26.7.3 SWR

#### Beginner

**SWR** caches **REST** (or any key) fetches, not GraphQL natively—but you can **POST GraphQL** with a stable key function.

#### Intermediate

Use **`useSWR`** with **`fetcher`** calling your endpoint; keys include **serialized variables**. Pair with **`graphql-request`** for tiny bundles.

#### Expert

**Normalized caching** is DIY compared to Apollo. Good for **BFF** endpoints that hide GraphQL complexity behind **REST-shaped** keys.

```javascript
import useSWR from "swr";

async function gqlFetcher([, doc, vars]) {
  const res = await fetch("/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: doc, variables: vars }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data;
}

export function useGql(doc, vars) {
  return useSWR(["gql", doc, vars], gqlFetcher);
}
```

#### Key Points

- SWR is transport-agnostic.
- Keys must uniquely identify operations + variables.
- No automatic fragment normalization.

#### Best Practices

- Keep documents stable (imported constants).
- Use `useSWRMutation` for mutations.
- Add middleware for auth headers.

#### Common Mistakes

- Keys that omit variables causing cache collisions.
- Throwing away GraphQL partial data semantics.
- No retry policy tuning for idempotent queries.

---

### 26.7.4 React Query

#### Beginner

**TanStack Query v4** (formerly React Query) can treat GraphQL **POST** responses as queries with manual **`queryKey`** design.

#### Intermediate

Use **`useQuery`** with **`queryFn`** invoking **`fetch`**. **Invalidation** after mutations replaces some Apollo **`refetchQueries`** patterns.

#### Expert

**Persisters** and **dehydration** support SSR. You still need **schema awareness** for **field-level** updates—often pair with **codegen** types only.

```javascript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function usePostsQuery(doc, variables) {
  return useQuery({
    queryKey: ["posts", variables],
    queryFn: async () => {
      const res = await fetch("/graphql", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: doc, variables }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error("Network error");
      if (json.errors?.length) throw new Error(json.errors[0].message);
      return json.data;
    },
  });
}
```

#### Key Points

- React Query excels at async state machine UX.
- GraphQL normalization is not built-in.
- Cache keys are entirely your responsibility.

#### Best Practices

- Centralize fetcher + error normalization.
- Use `staleTime` to mimic fetch policies.
- Invalidate by domain keys, not arbitrary strings.

#### Common Mistakes

- Using unstable `queryKey` references (inline objects).
- Duplicating the same post data under many keys.
- Ignoring GraphQL partial errors.

---

### 26.7.5 TanStack Query

#### Beginner

**TanStack Query v5** is the **framework-agnostic** evolution with **React**, **Solid**, **Vue**, and **Angular** adapters—same **GraphQL fetch** pattern as v4.

#### Intermediate

**`queryClient.prefetchQuery`** in routers mirrors Apollo prefetch. **`useMutation` + `onSettled`** invalidates lists.

#### Expert

Adopt **streaming SSR** patterns from TanStack Start/Remix docs; **dehydrate** query cache alongside **Apollo** only if you **split** responsibilities clearly—usually pick **one** graph client.

```javascript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
    },
  },
});

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

#### Key Points

- Branding shifted to TanStack Query; patterns remain.
- Multi-framework support helps design systems.
- Two caches (Apollo + TanStack) need clear boundaries.

#### Best Practices

- Choose a primary data layer per app.
- Wrap GraphQL fetchers in typed helpers.
- Use devtools plugin during development.

#### Common Mistakes

- Fighting duplicate caching between libraries.
- Forgetting suspense/query boundary differences per adapter.
- Over-invalidating causing thundering herds.

---

## 26.8 Mobile Clients

### 26.8.1 React Native Apollo

#### Beginner

Use the **same `@apollo/client`** packages with **`ApolloProvider`**. Replace **`@apollo/client/link/subscriptions`** transport with **React Native’s networking** constraints in mind.

#### Intermediate

**`AsyncStorage`** backs cache persistence. **Flipper** plugins can inspect network. Watch **Hermes** vs **JSC** differences in **polyfills** for `fetch`.

#### Expert

**Background tasks** may freeze the JS thread—**reconnect** subscriptions on `AppState` **active**. Align **cookie** auth with **`react-native-cookies`** or token storage.

```javascript
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./apolloClient";

export function Root() {
  return (
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  );
}
```

#### Key Points

- Apollo Client is JS-first; RN is supported.
- App lifecycle impacts WS and polling.
- Persistence uses AsyncStorage, not localStorage.

#### Best Practices

- Test on real devices with flaky networks.
- Minimize bundle with careful imports.
- Instrument Apollo + RN performance monitors.

#### Common Mistakes

- Assuming web `localStorage` exists.
- Not handling Android process death.
- Huge persisted caches slowing startup.

---

### 26.8.2 iOS Apollo

#### Beginner

**Apollo iOS** is a **Swift** client generating **types** from operations—different runtime from JS, same GraphQL wire format.

#### Intermediate

Use **Codegen** with **`.graphql` files** and **Swift Package Manager**. **URLSession** handles HTTP; **WebSocket** transport for subscriptions via **SplitNetworkTransport**.

#### Expert

**@defer/@stream** support tracks server capabilities. **SQLite** cache persists normalized records. **Test** with **stubbed schema** in CI.

```swift
// Conceptual Swift setup (Apollo iOS)
import Apollo

let store = ApolloStore(cache: InMemoryNormalizedCache())
let transport = RequestChainNetworkTransport(
  interceptorProvider: DefaultInterceptorProvider(client: URLSessionClient()),
  endpointURL: URL(string: "https://api.example.com/graphql")!
)
let client = ApolloClient(networkTransport: transport, store: store)
```

#### Key Points

- Native iOS client for Swift apps, not Node.js.
- Codegen is mandatory for ergonomic APIs.
- Normalized cache mirrors web Apollo concepts.

#### Best Practices

- Version codegen with CI.
- Use SPM for dependency hygiene.
- Align operation documents with backend schema.

#### Common Mistakes

- Drift between iOS ops and server schema.
- Ignoring subscription transport setup.
- Under-testing offline modes.

---

### 26.8.3 Android Apollo

#### Beginner

**Apollo Kotlin** (Android) generates **models** from **`.graphql` operations** and uses **OkHttp** for transport.

#### Intermediate

**Multiplatform** targets share client logic. **SQLite** cache for persistence. **Coroutines**/`Flow` for reactive queries.

#### Expert

**Batching**, **HTTP cache**, and **custom scalars** adapters integrate at build time. **Proguard/R8** rules ship with Apollo for release builds.

```kotlin
// build.gradle.kts (conceptual)
apollo {
  service("service") {
    packageName.set("com.example.graphql")
    mapScalar("DateTime", "java.time.Instant", "com.example.adapters.InstantAdapter")
  }
}
```

#### Key Points

- Kotlin client aligns with Android tooling.
- KMP enables shared GraphQL layer in mobile + desktop.
- Adapters map custom scalars safely.

#### Best Practices

- Keep schema in a registry or submodule.
- Test generated code compilation on upgrades.
- Use `Flow` watchers for live UI.

#### Common Mistakes

- Manual JSON parsing alongside generated models.
- Mismatched minSdk vs Apollo requirements.
- Forgetting R8 keep rules for reflective pieces.

---

### 26.8.4 Offline Support

#### Beginner

**Offline** means **reads** from persistent cache and **mutations** queued until connectivity returns—Apollo does not ship a full offline engine; you **compose** tools.

#### Intermediate

**`apollo3-cache-persist`**, **custom queues**, **retry links**. **Urql** offline exchange and **Relay** store persistence patterns are alternatives.

#### Expert

**Conflict resolution** requires **version vectors** or **server wins** policies. **Idempotency keys** on mutations prevent duplicate side effects on replay.

```javascript
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";

const retryLink = new RetryLink({
  delay: { initial: 300, max: 20_000, jitter: true },
  attempts: { max: 5, retryIf: (error) => !!error && !navigator.onLine === false },
});
```

#### Key Points

- True offline is an architecture, not a flag.
- Queued mutations need idempotency server-side.
- UX must communicate pending/failed states.

#### Best Practices

- Persist only safe data; encrypt if needed.
- Exponential backoff for retries.
- Reconcile server truth on reconnect.

#### Common Mistakes

- Replaying non-idempotent payment mutations.
- Silent data loss when cache eviction conflicts with queue.
- No UI for “pending sync”.

---

### 26.8.5 Persisted Queries

#### Beginner

**Automatic Persisted Queries (APQ)** send a **hash** instead of the full query body on repeat requests, saving bandwidth.

#### Intermediate

**`createPersistedQueryLink` from `@apollo/client/link/persisted-queries`** pairs with **`sha256`**. Server must **register** hashes or **allowlist** safelists.

#### Expert

**Trusted persisted queries** (operations fixed at build time) improve **security** (no ad-hoc queries) and **CDN cacheability** with GET. **Relay** and **Apollo Router** support PQ workflows natively.

```javascript
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { createPersistedQueryLink } from "@apollo/client/link/persisted-queries";
import { sha256 } from "crypto-hash";

const persistedQueriesLink = createPersistedQueryLink({ sha256 });
const httpLink = new HttpLink({ uri: "/graphql" });

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: persistedQueriesLink.concat(httpLink),
});
```

#### Key Points

- APQ is hash-on-the-fly; safelist is stricter.
- Requires server support (Apollo Server, etc.).
- GET + PQ enables edge caching for anonymous reads.

#### Best Practices

- Monitor cache hit rates for hashes.
- Fall back to full query on miss during rollout.
- Pair with CDN rules carefully for auth.

#### Common Mistakes

- Enabling PQ without server registration.
- Assuming POST queries become GET automatically everywhere.
- Logging hashes without linking to operation names.

---

