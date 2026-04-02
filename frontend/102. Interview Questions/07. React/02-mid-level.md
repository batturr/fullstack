# React 19 Interview Questions — Mid-Level (4+ Years Experience)

100 in-depth questions with detailed answers covering intermediate to advanced React concepts. Ideal for engineers with 4+ years of experience.

## 1. How does the React Fiber architecture work internally?

React Fiber is the reconciliation engine introduced to replace the older stack reconciler, and it fundamentally changes how React walks your component tree, schedules work, and yields control back to the browser. Instead of recursively traversing the entire tree in one synchronous chunk, Fiber represents each component instance as a linked list of nodes where each fiber has pointers to its child, sibling, and return (parent) fiber. This structure allows React to interrupt rendering, resume later, assign priority to updates, and implement concurrent features such as transitions and suspense. When an update occurs, React builds a work-in-progress tree by cloning fibers from the current tree and applying mutations during the render phase; the commit phase then applies DOM updates, runs layout effects, and schedules passive effects. Each fiber carries memoized state, props, hooks list, and flags that indicate side effects like placement, update, or deletion. The scheduler cooperates with the browser by breaking work into units and using `requestIdleCallback`-style semantics, so high-priority updates (e.g., user input) can preempt lower-priority work (e.g., data fetching results). Understanding Fiber is essential for reasoning about why renders batch, why effects run in a specific order, and how Suspense boundaries can pause subtrees without blocking the whole application.

```jsx
// Conceptual mental model: Fiber links (simplified)
// current -> workInProgress -> commit when complete
function App() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount((c) => c + 1)}>
      {count}
    </button>
  );
}
// Each fiber for App, button, and text nodes holds hooks and effect flags.
```

---

## 2. Explain the reconciliation algorithm in detail.

Reconciliation is the process React uses to compare the new element tree produced by your latest render with the previous tree and compute the minimal set of changes needed to update the host tree (typically the DOM). React walks the tree in depth-first order, comparing children by position and type: if two elements have the same type and key at the same position, React reuses the underlying fiber and updates props in place; if the type or key differs, React unmounts the old subtree and mounts a new one. Keys are critical because they allow React to match list items across reordering operations without destroying and recreating every node. For class components, React compares instance identity; for function components, the fiber identity is tied to position in the tree and hooks order. The reconciliation algorithm splits into the render phase (pure, can be interrupted) and the commit phase (must be synchronous for DOM mutations and lifecycles). During render, React may bail out early if `memo` or `PureComponent` shallow comparisons show props are unchanged, or if hooks dependencies are stable. The algorithm also handles portals, fragments, and context propagation by traversing alternate paths in the fiber tree. With concurrent rendering, React may discard incomplete work-in-progress trees if a higher-priority update arrives, then restart reconciliation from a consistent snapshot. This design trades a bit of CPU for predictable UI updates and enables fine-grained scheduling.

```jsx
const List = ({ items }) => (
  <ul>
    {items.map((item) => (
      <li key={item.id}>{item.label}</li>
    ))}
  </ul>
);
// Keys let reconciliation match rows when items reorder instead of reusing wrong rows.
```

---

## 3. What are React Server Components and how do they differ from SSR?

React Server Components (RSC) are components that execute only on the server and stream a serialized representation of your UI to the client, where React reconstructs them without shipping their implementation or large dependencies to the browser. Unlike traditional server-side rendering (SSR), which runs your React tree on the server to produce HTML for hydration and still sends a client bundle for interactivity, RSC focuses on moving data fetching, heavy libraries, and backend-only logic entirely off the client bundle. SSR’s primary output is HTML plus hydration scripts; RSC’s primary output is a flight protocol payload that can describe UI trees, async server data, and references to client components at the leaves. You can combine both: SSR can deliver the initial HTML shell while RSC streams additional UI, and client components hydrate only where needed. RSC components cannot use browser-only APIs or hooks like `useState` in the server file itself; interactive pieces must be marked as client components. The mental model is separation of concerns: server components for data and structure, client components for stateful interactivity. Frameworks like Next.js App Router integrate RSC with routing, caching, and streaming, but the conceptual distinction is bundle size and execution environment, not merely “HTML generated on server.”

```jsx
// app/dashboard/page.jsx (Server Component by default in Next App Router)
import { getMetrics } from "@/lib/db";
import { ClientChart } from "./ClientChart";

export default async function DashboardPage() {
  const metrics = await getMetrics(); // runs on server only
  return (
    <section>
      <h1>Metrics</h1>
      <ClientChart data={metrics} />
    </section>
  );
}
```

---

## 4. How does the `use` hook work and what problems does it solve?

The `use` hook in React 19 lets you read the value of a Promise or a Context during render in a way that integrates with Suspense and error boundaries, so you can colocate async resource consumption with component tree structure instead of scattering loading states across every callsite. When you `use(promise)`, React suspends that component until the promise resolves, then resumes rendering with the resolved value; if the promise rejects, the nearest error boundary handles it. For Context, `use(Context)` subscribes like `useContext` but with slightly different rules aligned with the new concurrent model. This pattern reduces boilerplate compared to manual `useEffect` fetching plus local `isLoading` flags, and it composes naturally with streaming server components that pass promises from the server to the client. The hook solves the problem of unifying “read async data in render” with React’s declarative model, but it requires that promises be stable or cached appropriately—creating a fresh promise every render will cause infinite loops. Libraries and frameworks often wrap resources in caches keyed by query parameters so `use` reads stable, deduplicated promises. Understanding `use` is key for modern data loading patterns that blend Suspense boundaries, RSC, and client hydration.

```jsx
import { use, Suspense } from "react";

function User({ userPromise }) {
  const user = use(userPromise);
  return <p>{user.name}</p>;
}

export function Profile({ userPromise }) {
  return (
    <Suspense fallback={<p>Loading user…</p>}>
      <User userPromise={userPromise} />
    </Suspense>
  );
}
```

---

## 5. Explain Actions in React 19: transitions, form actions, and server actions.

Actions in React 19 unify asynchronous work triggered by user interactions—especially forms—with first-class support in the runtime, so you can express intent, pending state, and optimistic updates without ad hoc wiring. A function marked as an action can be passed to `form action` or invoked from `startTransition`, and React tracks pending transitions, batches updates, and coordinates with `useTransition` or `useFormStatus` for UI feedback. Client actions run in the browser and integrate with the transition scheduler so expensive updates do not block urgent input. Server actions are async functions executed on the server (often serializable across the network boundary) that let you mutate data securely without exposing secrets in client bundles; frameworks wire them through form posts or RPC-like calls. Form actions replace much of the “controlled form + onSubmit + fetch” boilerplate by letting the platform handle serialization and progressive enhancement. Together, transitions, form actions, and server actions align UX with data integrity: you keep the UI responsive, show pending indicators, and optionally roll back on failure using optimistic hooks. Understanding this triad is central to idiomatic React 19 data mutation patterns.

```jsx
"use client";
import { useTransition } from "react";

async function saveProfile(formData) {
  "use server";
  const name = formData.get("name");
  await db.users.update({ name: String(name) });
}

export function ProfileForm() {
  const [isPending, startTransition] = useTransition();
  return (
    <form
      action={(fd) => startTransition(() => saveProfile(fd))}
    >
      <input name="name" />
      <button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
```

---

## 6. How does useActionState work with forms?

`useActionState` (formerly `useFormState` in earlier releases) is a hook that pairs a server or client action with React-managed state derived from each submission, giving you a reducer-like loop where the action’s return value becomes the next state visible to your form UI. You pass an async action and an initial state; React invokes the action when the form is submitted, passes the previous state and the `FormData` payload, and re-renders with the updated state—ideal for validation errors, success messages, or field-level feedback without duplicating submission logic in `useEffect`. Because it integrates with form actions, you can keep progressive enhancement: the form still works even if JavaScript is delayed, while enhanced behavior layers on top. The hook also exposes a pending flag through the transition system so you can disable submit buttons or show spinners consistently. For multi-step wizards, you can thread state through returned objects and branch UI based on discriminated unions. Compared to manual `useState` plus `onSubmit`, `useActionState` centralizes the contract between action and UI and reduces stale closure bugs around submission state.

```jsx
"use client";
import { useActionState } from "react";

async function submit(prevState, formData) {
  const email = String(formData.get("email") ?? "");
  if (!email.includes("@")) {
    return { ok: false, error: "Invalid email" };
  }
  await api.subscribe(email);
  return { ok: true, error: null };
}

export function NewsletterForm() {
  const [state, formAction, isPending] = useActionState(submit, {
    ok: false,
    error: null,
  });
  return (
    <form action={formAction}>
      <input name="email" type="email" />
      <button type="submit" disabled={isPending}>Subscribe</button>
      {state.error && <p role="alert">{state.error}</p>}
      {state.ok && <p>Subscribed</p>}
    </form>
  );
}
```

---

## 7. How does useOptimistic implement optimistic UI updates?

`useOptimistic` lets you show a temporary, user-visible version of state while an asynchronous mutation is in flight, then automatically reconcile with the real result when the server responds or roll back on failure. You pass the current committed state and a reducer-like update function; when you enqueue an optimistic update, React renders the optimistic value immediately so lists, counters, or toggles feel instant, which is critical for perceived performance in collaborative or high-latency environments. When the async work completes, you replace optimistic state with authoritative data—React handles the transition so you do not flash intermediate inconsistent states if batching aligns. If the action fails, you restore from the last committed snapshot or merge with error UI, depending on how you structure your action. This hook is designed to compose with actions and transitions: you typically wrap optimistic updates in `startTransition` or tie them to server actions so concurrent rendering keeps input responsive. The key discipline is ensuring your optimistic projection is deterministic and that your server is the source of truth for conflict resolution in multi-user scenarios.

```jsx
"use client";
import { useOptimistic, useTransition } from "react";

export function Thread({ messages, sendMessage }) {
  const [isPending, startTransition] = useTransition();
  const [optimistic, addOptimistic] = useOptimistic(
    messages,
    (state, newMsg) => [...state, { ...newMsg, pending: true }],
  );

  function onSend(formData) {
    const text = String(formData.get("text") ?? "");
    startTransition(async () => {
      addOptimistic({ id: crypto.randomUUID(), text });
      await sendMessage(text);
    });
  }

  return (
    <form action={onSend}>
      <ul>
        {optimistic.map((m) => (
          <li key={m.id}>{m.text}{m.pending ? "…" : ""}</li>
        ))}
      </ul>
      <input name="text" />
      <button type="submit" disabled={isPending}>Send</button>
    </form>
  );
}
```

---

## 8. What is the React Compiler (React Forget) and how does auto-memoization work?

The React Compiler is a build-time optimization that analyzes your React components and hooks to automatically insert memoization where it is safe and profitable, reducing the need for manual `useMemo`, `useCallback`, and `memo` sprinkled across codebases. It reasons about immutability and data flow to determine when a value’s identity can affect child re-renders or hook dependencies, then emits equivalent code that preserves referential stability without changing runtime semantics. Auto-memoization differs from blind caching: the compiler respects React’s rules of hooks and avoids breaking the freshness of props/state closures that must update. The goal is to let developers write straightforward code while still getting fine-grained update behavior in hot paths. For teams, this shifts effort from manual performance tuning toward modeling data immutably and avoiding side effects during render. The compiler works best with predictable patterns—direct mutation and unstable object creation in render can still defeat optimization or require explicit escape hatches. Monitoring and gradual adoption (per-file or per-directory) are common in large apps.

```jsx
// Before: manual memoization
// const cb = useCallback(() => doThing(a, b), [a, b]);

// After (conceptually): compiler may preserve stable identities automatically
function Row({ id, selected, onSelect }) {
  const handleClick = () => onSelect(id);
  return (
    <button type="button" aria-pressed={selected} onClick={handleClick}>
      {id}
    </button>
  );
}
```

---

## 9. How does ref as a prop work in React 19? What changes from forwardRef?

In React 19, function components can accept `ref` as a normal prop without wrapping the component in `forwardRef`, simplifying component APIs and reducing indirection for library authors. The host reconciler passes the ref through the same prop path as other props, and TypeScript typings have been updated so `ref` is part of the component’s props interface instead of a separate generic on `forwardRef`. Existing `forwardRef` usage remains valid for backward compatibility, but new code can omit it when targeting React 19 and appropriate type versions. This change matters most for design systems and polymorphic components where ref forwarding was boilerplate-heavy and confused beginners. `useImperativeHandle` still pairs with refs when you need to expose a narrow imperative API to parents. The mental model shifts from “refs are special” to “refs are props with special reconciliation behavior on DOM nodes,” which aligns better with how developers already reason about props. Migration is incremental: you can adopt ref-as-prop in new components while leaving legacy wrappers until refactors.

```jsx
function TextInput({ ref, label, ...rest }) {
  return (
    <label>
      {label}
      <input ref={ref} {...rest} />
    </label>
  );
}

// Usage: <TextInput ref={inputRef} label="Name" />
```

---

## 10. Explain Document Metadata support in React 19.

React 19 allows components to render document-level metadata such as `<title>`, `<meta>`, and `<link>` anywhere in the tree, and the reconciler hoists and deduplicates them in the actual document head so you can colocate SEO and social tags with routes or layouts without imperative DOM manipulation. This support is especially useful in streaming and RSC environments where different parts of the tree may resolve asynchronously; React coordinates ordering and precedence so that deeper or more specific routes can override parent defaults deterministically. The feature reduces reliance on side-effect hooks that imperatively mutate `document.title` on mount and restore on unmount, which can race with concurrent navigation. For SSR frameworks, metadata can be emitted as part of the shell or streamed updates, improving parity between server HTML and client hydration. Teams should still centralize policy (canonical URLs, robots) to avoid conflicting tags across nested layouts. Understanding deduplication rules in your meta framework is important because duplicate `og:title` tags can confuse crawlers.

```jsx
export function ArticlePage({ title, description }) {
  return (
    <article>
      <title>{title}</title>
      <meta name="description" content={description} />
      <h1>{title}</h1>
    </article>
  );
}
```

---

## 11. How does React 19 handle stylesheet deduplication and ordering?

React 19 improves how stylesheets declared in component trees are reconciled with the document so that duplicate `<link rel="stylesheet">` references collapse to a single network fetch while preserving predictable cascade order based on where they appear in the React tree. This matters for code-split routes that each import CSS modules or global layers: without deduplication, navigations could reinsert identical links and cause FOUC or redundant downloads. Ordering rules aim to match developer intent so that layout-level styles precede feature-level overrides when that is how components nest, though exact precedence still interacts with specificity and import order in bundled CSS. The feature pairs well with Suspense boundaries because styles needed for a deferred subtree can load when that subtree becomes relevant without breaking the rest of the page. Teams should still prefer design tokens and scoped CSS strategies to minimize global collisions, since deduplication does not solve specificity wars. Monitoring stylesheet counts in performance traces remains a good habit for production apps.

```jsx
import "./layout.css";
import "./feature.css";

export function FeatureShell({ children }) {
  return (
    <>
      <link rel="stylesheet" href="/vendor/themes/default.css" precedence="default" />
      <section className="feature">{children}</section>
    </>
  );
}
```

---

## 12. What are async scripts and resource preloading in React 19?

React 19 provides first-class handling for async scripts and resource hints so components can declare `<script async>`, `<link rel="preload">`, or module preloads in JSX and have React coordinate insertion, deduplication, and ordering with navigation and streaming. This reduces duplicated script tags when multiple routes share analytics or A/B snippets, and it aligns script execution timing with hydration boundaries so you do not accidentally block critical rendering paths. Preload hints help the browser discover fonts, hero images, or critical CSS earlier when those resources are known from server-rendered HTML or streamed RSC payloads. The integration is particularly valuable in micro-frontend or plugin architectures where independently developed bundles might otherwise inject redundant resource tags. You still must validate third-party scripts for CSP compliance and privacy, as React only manages placement—not sandboxing. Performance profiling should confirm that preloads truly shorten the critical path rather than contending with higher-priority assets.

```jsx
export function Analytics() {
  return (
    <script
      async
      src="https://example.com/analytics.js"
      // React dedupes identical script descriptors across the tree
    />
  );
}
```

---

## 13. How does improved error reporting work in React 19?

React 19 enhances error reporting by providing richer component stacks, clearer differentiation between recoverable and fatal errors, and better integration with error boundaries so developers see which boundary caught an error and what subtree was affected. Hydration mismatches produce more actionable messages that point to the specific prop or text difference and suggest common causes like locale formatting or random IDs, which historically were painful to debug in large apps. The reporting pipeline cooperates with source maps and framework overlays so that async stacks across Suspense boundaries remain readable instead of collapsing into anonymous boundaries. For production, you still forward errors to services like Sentry with tags for route, release, and user cohort, but the local DX improvements reduce time-to-fix for class issues around effects and server/client splits. Teams should keep error boundaries granular enough to isolate failures without masking state corruption that should fail fast. Understanding the difference between throw during render, rejected promises in Suspense, and errors in event handlers remains essential because only some propagate to boundaries.

```jsx
class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return <p>Something went wrong in this section.</p>;
    }
    return this.props.children;
  }
}
```

---

## 14. How does Suspense work with Server Components?

Suspense boundaries around Server Components allow the server to stream HTML and RSC payloads incrementally as data becomes available, so users see shell UI immediately while slower queries resolve in place without blocking the entire route. On the server, React can defer rendering of a suspended subtree and send fallbacks first, then follow with additional chunks—this differs from client-only Suspense where the fallback shows until a client fetch completes. Client components nested under a suspended server subtree hydrate when their props arrive, preserving interactivity at the leaves. You must structure boundaries so that essential above-the-fold content is not trapped behind unnecessarily wide suspense regions, which could delay meaningful paint. Error boundaries compose orthogonally: a server error might abort the stream, while client errors remain local. Framework caching layers can reuse serialized RSC trees across requests, so boundary placement also affects cache granularity.

```jsx
import { Suspense } from "react";
import { SlowCard } from "./SlowCard.server";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading insights…</p>}>
      <SlowCard />
    </Suspense>
  );
}
```

---

## 15. What is the Activity component (formerly Offscreen) in React 19?

The Activity component models visibility and priority of subtrees by allowing React to deprioritize hidden UI, reuse state for offscreen content, and prepare screens before they become visible—similar to keeping tabs alive without forcing full rerender cost on every navigation. It supports use cases like wizard steps, prefetch routes, or background panes where you want to preserve scroll position and component state without keeping DOM updates at full priority. Unlike `display: none` alone, Activity integrates with concurrent scheduling so React can delay effects and layout work for inactive regions. API details continue to evolve across experimental channels, so production adoption typically follows framework guidance and stability guarantees. Misuse can retain large subtrees in memory; pairing with virtualization or lazy mounting remains important for heavy dashboards. Understanding Activity helps you reason about how React can “keep warm” UI without blocking urgent interactions.

```jsx
// Conceptual usage (API may be experimental / framework-wrapped)
import { Activity } from "react";

export function Tabs({ active, children }) {
  return (
    <Activity mode={active ? "visible" : "hidden"}>
      {children}
    </Activity>
  );
}
```

---

## 16. What changed in React 19 regarding cleanup functions for refs?

React 19 refines ref cleanup semantics so that ref callbacks can return a cleanup function, mirroring the ergonomics of effects and making subscription-style refs less error-prone when elements mount and unmount frequently. Previously, ref callbacks required manual tracking of previous nodes to detach listeners; now you can return a teardown directly from the ref function when the element disconnects. This aligns with common patterns like observing `ResizeObserver` or attaching non-React listeners to DOM nodes while guaranteeing symmetric teardown. For object refs (`useRef`), behavior remains focused on assigning `.current`, but callback refs gain the richer lifecycle. Library authors benefit because wrappers around motion or measurement can colocate setup and cleanup without separate `useEffect` syncing. Teams migrating should audit ref callbacks that assumed void return types, though most code remains compatible because returning `undefined` is still valid.

```jsx
function useMeasure() {
  const ref = useCallback((node) => {
    if (!node) return;
    const ro = new ResizeObserver(([entry]) => {
      console.log(entry.contentRect.height);
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);
  return ref;
}
```

---

## 17. How does useDeferredValue work with its initial value parameter in React 19?

`useDeferredValue` accepts an optional initial value used on the first render so that UI can show a meaningful placeholder immediately while a deferred update catches up, improving perceived performance for expensive derived views fed by rapidly changing inputs. Without an initial value, the first paint might mirror the urgent value anyway; with it, you can separate “instant cheap preview” from “high-fidelity deferred render” more explicitly in concurrent mode. The hook still returns a deferred version of the value that trails urgent updates during transitions, so typing stays snappy while charts or search highlights update slightly later. This pairs naturally with `useTransition` boundaries where the urgent update is the input field and the deferred update is the heavy child. You should validate that your deferred subtree actually benefits—adding initial values to cheap lists adds complexity without gain. Profiling remains the arbiter of whether deferral improves INP and TBT metrics.

```jsx
import { useDeferredValue, useState, memo } from "react";

const Heavy = memo(function Heavy({ q }) {
  return <pre>{expensiveFilter(q)}</pre>;
});

export function Search() {
  const [text, setText] = useState("");
  const deferred = useDeferredValue(text, "");
  return (
    <>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <Heavy q={deferred} />
    </>
  );
}
```

---

## 18. What hydration improvements exist in React 19?

React 19 continues hardening hydration by reducing mismatches from benign differences, improving patch strategies for text and attributes, and emitting more targeted warnings when client and server HTML diverge, which speeds up diagnosis in apps mixing SSR, RSC, and streaming. Automatic batching across suspense boundaries and selective hydration patterns help interleave urgent interactivity without waiting for the entire page to finish hydrating, improving metrics like First Input Delay. Better support for third-party scripts and styles reduces accidental reordering that previously caused subtle hydration failures. Developers still must avoid non-deterministic renders—random IDs without server/client alignment, time-dependent output, or locale mismatches remain common pitfalls. Testing SSR output snapshots alongside client renders catches issues early. For large tables, streaming hydration can prioritize visible rows when frameworks enable priority hints.

```jsx
// Ensure deterministic IDs across server/client (example pattern)
let serverCounter = 0;
function useStableId(prefix) {
  const idRef = useRef(null);
  if (idRef.current == null) {
    idRef.current = `${prefix}-${++serverCounter}`;
  }
  return idRef.current;
}
```

---

## 19. How does Context work as a provider in React 19 (no Context.Provider)?

React 19 allows using `MyContext` directly as a provider element (`<ThemeContext value={theme}>`) instead of the verbose `<ThemeContext.Provider value={theme}>`, reducing JSX noise and aligning usage with how developers already name contexts. The feature is syntactic sugar with the same semantics: subscribers re-render when the value changes per context propagation rules, and memoization pitfalls remain identical—new object identities still cause broad re-renders unless split contexts or selectors are used. Typings simplify for TypeScript users because the context object serves dual roles as consumer hook source and provider component. Migration is straightforward for most codebases: replace Provider wrappers with direct context components when on supported versions. Understanding context performance characteristics matters more than the JSX spelling; large frequently changing context values still benefit from partitioning or external stores.

```jsx
import { createContext, use } from "react";

const ThemeContext = createContext("light");

export function App() {
  return (
    <ThemeContext value="dark">
      <Toolbar />
    </ThemeContext>
  );
}

function Toolbar() {
  const theme = use(ThemeContext);
  return <button className={theme}>OK</button>;
}
```

---

## 20. What breaking changes exist in React 19?

React 19 removes or tightens several legacy APIs: UMD builds and older entry points have been streamlined, some deprecated lifecycle patterns are fully removed from strict usage paths, and certain typings changed for refs and JSX namespaces in TypeScript projects. String refs and legacy context APIs were already discouraged but upgrading may require deleting remaining usages. Error handling in Strict Mode may surface additional warnings around effects and suspense, which can break tests that assumed silent double-invocation behaviors. Framework-level migrations (Next.js, Remix) may require adopting new JSX transforms and server action conventions. Always run codemods provided by the React team and read the versioned changelog for subtle runtime changes in `flushSync`, `act`, or test utilities. The ref-as-prop and context-as-provider changes are backward compatible when old patterns remain, but ESLint rules may need updates. Planning incremental upgrades on staging with feature flags reduces risk for large apps.

```jsx
// Migrate away from forwardRef gradually; adopt new JSX transform settings in tsconfig/babel
// "jsx": "react-jsx" with automatic runtime
```

---

## 21. How do you design custom hooks with proper abstraction?

A strong custom hook isolates a coherent concern—data fetching, subscriptions, form state, or animation—behind a stable API whose inputs are explicit dependencies and whose outputs are minimal surfaces your components actually need. Name hooks with the `use` prefix and keep them pure with respect to React’s rules: call hooks unconditionally at the top level, and push conditional logic inside effects or callbacks rather than branching before hooks. Expose imperative operations as memoized callbacks when identity stability matters for child memoization, and return tuples or small objects consistently so call sites remain readable. Avoid leaking raw `useEffect` timing details unless consumers must know; instead document lifecycle through returned flags like `status` or `isSubscribed`. For testability, separate pure helpers (parsing, mapping) from hook wiring so you can unit test logic without `renderHook` when possible. Version hooks carefully in shared libraries: adding fields to returned objects is safer than reordering tuple positions.

```jsx
function useMediaQuery(query) {
  const getMatches = () =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false;
  const [matches, setMatches] = useState(getMatches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = () => setMatches(mql.matches);
    mql.addEventListener("change", handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}
```

---

## 22. Explain the internal implementation of useState.

`useState` is implemented atop the same hooks dispatcher used by all hooks: each function component has an associated fiber with a singly linked list of hook cells created in mount order and reused on updates. A state hook cell stores the current value and a queue of pending updates; calling the setter enqueues an update object and schedules a re-render of the component’s fiber. Batching merges multiple setters in the same event tick into a single render pass for efficiency. Functional updaters `setState(prev => next)` run during the update application phase so you always compute from the latest committed state, avoiding stale values in rapid sequences. The dispatcher differs between render, mount, and strict-dev double-invoke paths, which is why hooks cannot be conditional—order must align across renders. For concurrent features, updates carry lanes and priorities so transitions and urgent updates interleave safely. Understanding this clarifies why async code must not read `state` immediately after `setState` expecting it to be updated synchronously except in rare synchronous flush cases.

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const increment = () => setCount((c) => c + 1);
  return <button type="button" onClick={increment}>{count}</button>;
}
```

---

## 23. How does useEffect cleanup timing work?

`useEffect` runs after paint for the committed tree: after React applies DOM updates from the render, the browser paints, then passive effects run; the previous effect’s cleanup runs before the next effect for that hook executes, synchronously at the start of the effect phase when dependencies change or on unmount. Layout effects (`useLayoutEffect`) run earlier, still after DOM mutations but before paint, which is why they can measure layout without flicker. Cleanups are essential for subscriptions, timers, and aborters to prevent leaks and stale updates; missing cleanup is a common source of “setState on unmounted component” warnings when promises resolve late. Strict Mode in development intentionally mounts, cleans up, and remounts to surface unsafe side effects, so effects must be idempotent. Dependency arrays must list every reactive value read inside the effect; eslint exhaustive-deps exists to keep this honest. Understanding ordering across parent and child effects helps avoid assumptions—child effects run after parents for mount, and cleanups run in reverse order on unmount.

```jsx
useEffect(() => {
  const ctrl = new AbortController();
  fetch("/api/data", { signal: ctrl.signal })
    .then((r) => r.json())
    .then(setData)
    .catch((e) => {
      if (e.name !== "AbortError") console.error(e);
    });
  return () => ctrl.abort();
}, []);
```

---

## 24. What is the difference between useEffect and useLayoutEffect?

`useLayoutEffect` fires synchronously after DOM mutations but before the browser paints, making it appropriate for measuring DOM geometry, synchronizing with third-party imperative libraries, and applying visual corrections that must occur before users see a frame. `useEffect` fires after paint, which keeps most data fetching and logging off the critical path and avoids blocking rendering for work that does not influence the immediate frame. Because `useLayoutEffect` can delay paint if it does heavy work, misuse harms interactivity metrics. Server rendering warns for `useLayoutEffect` because there is no layout on the server; patterns defer to `useEffect` or `useIsomorphicLayoutEffect` wrappers. Choose layout when missing it causes visible flicker or incorrect measurements; otherwise prefer passive effects. Testing environments often mock `requestAnimationFrame` and layout; be mindful that layout effects may run differently under JSDOM.

```jsx
useLayoutEffect(() => {
  const el = ref.current;
  if (!el) return;
  const { height } = el.getBoundingClientRect();
  setTooltipTop(height + 8);
}, [open]);
```

---

## 25. How does useTransition work and when should you use it?

`useTransition` returns a boolean `isPending` and a `startTransition` function that wraps state updates React should treat as lower priority, allowing urgent updates (like typing) to commit first while heavier updates (like filtering a large list) trail behind. It integrates with concurrent rendering and scheduling so the UI stays responsive even when expensive renders are triggered. Use transitions when the user expects slight delay in non-critical visual updates, not when every frame must reflect input immediately. Pair transitions with Suspense boundaries for data that loads asynchronously, so fallbacks appear while deferred transitions resolve. Avoid stuffing synchronous CPU-heavy work inside transitions without additional chunking—transitions reschedule, they do not magically parallelize computation. Instrument INP to verify transitions improve responsiveness on low-end devices.

```jsx
const [isPending, startTransition] = useTransition();
const [query, setQuery] = useState("");
const [deferredQuery, setDeferredQuery] = useState("");
const onChange = (e) => {
  const v = e.target.value;
  setQuery(v);
  startTransition(() => setDeferredQuery(v));
};
```

---

## 26. useDeferredValue vs useTransition — when to use which?

`useTransition` is imperative: you explicitly demote specific `setState` calls, which is ideal when the same state source splits into urgent vs non-urgent consumers. `useDeferredValue` is declarative: you pass a prop or computed value and receive a version that trails the latest urgent updates, which suits derived expensive children that should not block typing. If multiple children consume the same deferred input, `useDeferredValue` avoids threading `startTransition` everywhere. If you control the state setter and want clear boundaries around what is deferred, `useTransition` communicates intent at the callsite. You can combine both in advanced UIs: transitions for coarse updates, deferred values for fine-grained derived props. Neither replaces memoization or virtualization; they prioritize when renders happen. Measure both approaches because misuse can introduce unnecessary double renders.

```jsx
const deferredText = useDeferredValue(text);
return <ExpensiveHighlight text={deferredText} />;
```

---

## 27. How do you implement undo/redo with useReducer?

Model state as a structure containing `present`, `past`, and `future` stacks (or immutable vectors) with actions `UNDO`, `REDO`, and `APPLY` that push snapshots while bounding memory via max history depth. `useReducer` centralizes transitions so React batches UI updates and you can expose imperative helpers through context for toolbar buttons. Keep snapshots small by storing patches (deltas) instead of full objects when documents are large, using structural sharing libraries if needed. Debounce `APPLY` for drag operations to avoid flooding history with every pointer move. For collaborative editing, pair with operational transforms or CRDTs rather than naive stacks. Testing reducers as pure functions simplifies undo correctness immensely.

```jsx
const initial = { past: [], present: doc, future: [] };
function reducer(state, action) {
  switch (action.type) {
    case "APPLY": {
      const next = apply(state.present, action.patch);
      return {
        past: [...state.past, state.present],
        present: next,
        future: [],
      };
    }
    case "UNDO": {
      if (!state.past.length) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      };
    }
    default:
      return state;
  }
}
```

---

## 28. How do you build a custom hook for data fetching with caching?

Combine `useRef` maps for keyed caches, `useMemo` for stable query keys, and `useEffect` or Suspense-compatible resource wrappers to fetch and dedupe in-flight requests. Expose `data`, `error`, `status`, and `mutate` functions; synchronize with `AbortController` to cancel stale navigations. For advanced needs, adopt TanStack Query rather than reinventing eviction, background refetch, and focus replay. If implementing manually, use stale-while-revalidate: return cached data immediately, then refresh asynchronously and update if changed. Serialize keys deterministically (sorted objects) to avoid cache misses. Consider memory caps and LRU eviction for long-lived SPAs.

```jsx
const cache = new Map();
function useFetchJson(key, fetcher) {
  const [state, setState] = useState(() => cache.get(key) ?? { status: "idle" });
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setState((s) => ({ ...s, status: "loading" }));
      try {
        const data = await fetcher(key);
        if (cancelled) return;
        cache.set(key, { status: "success", data });
        setState({ status: "success", data });
      } catch (e) {
        if (!cancelled) setState({ status: "error", error: e });
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [key, fetcher]);
  return state;
}
```

---

## 29. How does useImperativeHandle work?

`useImperativeHandle` customizes the instance value exposed when a parent passes a ref to a child, typically combined with `forwardRef` (or ref prop in React 19) and `useRef` holding the internal DOM node. It lets libraries expose a minimal API—`focus`, `scrollToItem`, `reset`—instead of leaking raw DOM. The factory runs after layout, and dependencies control when the handle updates. Over-exposing DOM breaks encapsulation; prefer narrow methods. If parents only need measurements, consider callback refs or context instead. Testing can assert imperative methods via refs in integration tests.

```jsx
const FancyInput = forwardRef(function FancyInput(props, ref) {
  const inner = useRef(null);
  useImperativeHandle(ref, () => ({
    focus: () => inner.current?.focus(),
    blur: () => inner.current?.blur(),
  }), []);
  return <input ref={inner} {...props} />;
});
```

---

## 30. How do you handle race conditions in useEffect?

Race conditions occur when an older asynchronous response arrives after a newer request and overwrites state, causing UI flicker or wrong data. Mitigations include tracking request identifiers, aborting with `AbortController`, or ignoring stale results with a boolean `ignore` flag set in cleanup. For route params, key effects by `id` so cleanup aborts prior fetches. Libraries like TanStack Query handle this systematically. Always clear loading flags in `finally` blocks and guard `setState` when `ignore` is true. Testing should simulate slow/fast responses to ensure ordering.

```jsx
useEffect(() => {
  let ignore = false;
  (async () => {
    const res = await fetch(`/api/item/${id}`);
    const json = await res.json();
    if (!ignore) setItem(json);
  })();
  return () => {
    ignore = true;
  };
}, [id]);
```

---

## 31. What is the stale closure problem and how do you solve it?

Stale closures happen when callbacks capture outdated state or props from an earlier render, often in effects with missing dependencies, intervals, or event handlers created once. Fixes include functional updates `setState(s => ...)`, updating dependency arrays honestly, storing latest values in refs (`useRef` + `useEffect`), or using reducers to centralize transitions. For subscriptions, recreating the callback when dependencies change avoids reading stale data. ESLint `exhaustive-deps` catches many cases; remaining issues often need refs for stable event handlers that must read fresh state. Understanding closures clarifies why `useCallback` with wrong deps silently freezes values.

```jsx
const latest = useRef(count);
useEffect(() => {
  latest.current = count;
}, [count]);
useEffect(() => {
  const id = setInterval(() => {
    console.log(latest.current);
  }, 1000);
  return () => clearInterval(id);
}, []);
```

---

## 32. How do you implement debounce and throttle with hooks?

Debounce delays invoking a function until after a period of inactivity; throttle invokes at most once per interval. Implement with `useRef` timers and cleanup on unmount, or reuse battle-tested utilities from lodash with stable identities via `useMemo`. Expose both the debounced setter and immediate flush for submits. For React 18+ concurrent features, ensure debounced updates align with transitions if they trigger heavy work. Testing should fake timers with Jest. Avoid recreating debounced functions each render without memoization—child components will re-render unnecessarily.

```jsx
function useDebouncedCallback(fn, delay) {
  const t = useRef(null);
  return useCallback((...args) => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}
```

---

## 33. How do you share logic between components using custom hooks?

Extract shared stateful logic into hooks consumed by multiple components, keeping UI-specific JSX out of the hook so presentation stays flexible. When behavior varies, parameterize the hook or inject small strategy functions. For cross-cutting concerns like analytics or auth, combine hooks with context providers at subtree boundaries. Avoid mega-hooks that return dozens of fields; split into composable pieces (`useAuth`, `usePermissions`). Storybook stories can demo hook-backed behaviors via thin wrapper components. Document invariants: which hooks must be used within which providers.

```jsx
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn((v) => !v), []);
  return { on, toggle, setOn };
}
```

---

## 34. How do you handle complex forms with useReducer?

Represent form state as a single object with fields, touched flags, and errors; dispatch actions like `CHANGE`, `BLUR`, `SUBMIT`, `RESET` to keep transitions predictable. Derive validation in reducers or via selectors; async validation can dispatch follow-up actions when promises resolve. Pair with controlled inputs for accessibility and testability. For large forms, field-level components can dispatch via context to avoid prop drilling. Compare with form libraries (React Hook Form) if performance with thousands of fields becomes an issue due to rerenders.

```jsx
function formReducer(state, action) {
  switch (action.type) {
    case "CHANGE":
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: undefined },
      };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    default:
      return state;
  }
}
```

---

## 35. How does the compound component pattern work with Context?

Compound components expose related subcomponents (`Tabs`, `Tabs.List`, `Tabs.Panel`) that communicate via internal context rather than props at every level. A parent establishes shared state (selected index, keyboard handlers) in a provider; children consume via hooks or context without exposing internals. This API remains ergonomic while preserving flexibility in composition. Memoize context values or split contexts to avoid rerender storms. Document allowed child combinations for type-safe APIs. Radix UI and Reach patterns exemplify accessible compound components.

```jsx
import { createContext, use, useMemo, useState } from "react";

const TabsCtx = createContext(null);
export function Tabs({ children, defaultIndex = 0 }) {
  const [index, setIndex] = useState(defaultIndex);
  const value = useMemo(() => ({ index, setIndex }), [index]);
  return <TabsCtx value={value}>{children}</TabsCtx>;
}
export function Tab({ i, children }) {
  const { index, setIndex } = use(TabsCtx);
  return (
    <button type="button" aria-selected={index === i} onClick={() => setIndex(i)}>
      {children}
    </button>
  );
}
```

---

## 36. Render props vs hooks — when to use which?

Render props invert control by passing a function child that receives state from a parent component, enabling powerful composition without wrapping entire subtrees in custom hooks. Hooks excel when stateful logic is reused across function components and you do not need dynamic injection of rendering strategies at runtime. Render props still help when multiple render strategies must coexist in one component tree or when you integrate with class components. Hooks cannot be called conditionally, whereas render props can choose different functions per branch. For library APIs, render props offer maximum flexibility; hooks offer ergonomics. Some libraries expose both patterns.

```jsx
<DataProvider render={(data) => <Chart points={data} />} />
```

---

## 37. What are controlled vs uncontrolled components — advanced patterns?

Controlled components source value from React state on every keystroke, enabling validation and immediate feedback but potentially costing performance on huge forms. Uncontrolled components rely on DOM state and `ref` access, reducing rerenders but complicating validation and programmatic resets. Advanced hybrids use `defaultValue` with key resets to remount inputs, or controlled fields with localized state containers per section. React Hook Form combines uncontrolled inputs with controlled validation layers. For file inputs, uncontrolled is typical due to security restrictions. Accessibility favors labels and error associations regardless of pattern.

```jsx
function UncontrolledEmail() {
  const input = useRef(null);
  const onSubmit = (e) => {
    e.preventDefault();
    console.log(input.current?.value);
  };
  return (
    <form onSubmit={onSubmit}>
      <input ref={input} name="email" defaultValue="" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## 38. How do you implement a hook that syncs with localStorage?

Read initial state lazily from `localStorage` inside `useState` initializer guarded for SSR, subscribe to `storage` events for cross-tab sync, and write back with `useEffect` on changes. Handle JSON parse errors and quota exceeded errors gracefully. Namespace keys per user or tenant to avoid collisions. Debounce writes for high-frequency updates. Privacy-sensitive data may need encryption or should not be stored locally.

```jsx
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return initial;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore quota */
    }
  }, [key, value]);
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === key && e.newValue) {
        setValue(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);
  return [value, setValue];
}
```

---

## 39. How do you implement infinite scroll with hooks?

Observe a sentinel element near the list bottom with `IntersectionObserver`, increment page state when visible, and dedupe fetch requests while appending items. Reset page when filters change. Virtualize long lists to avoid DOM blowups. Provide accessible loading announcements and keyboard alternatives (“Load more” button) since infinite scroll can harm usability. Handle errors with retry affordances.

```jsx
function useInfiniteScroll({ hasMore, loadMore }) {
  const sentinel = useRef(null);
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadMore]);
  return sentinel;
}
```

---

## 40. What are anti-patterns in React hooks?

Common anti-patterns include conditional hooks, omitting effect dependencies to silence lint warnings, storing non-serializable values in dependencies causing infinite loops, mirroring props into state unnecessarily, and performing heavy synchronous work during render. Overusing context for high-frequency updates causes broad rerenders; reaching for global state too early obscures data flow. Fetching in render without Suspense or guards causes waterfalls. Mutating refs that should trigger UI without state updates leads to inconsistent renders. Using `useMemo` to silence ESLint instead of fixing dependencies hides bugs. Recognizing these patterns helps code review and production stability.

```jsx
// Anti-pattern: effect missing deps -> stale state
useEffect(() => {
  sendAnalytics(user.id);
}, []); // eslint-disable-next-line -- hides bug when user changes
```

---

## 41. How does Redux Toolkit organize slices, thunks, and RTK Query?

Redux Toolkit (`@reduxjs/toolkit`) standardizes Redux usage with `createSlice`, which auto-generates action creators and reducers from a mutable-looking `createReducer` powered by Immer, reducing boilerplate and accidental mutation bugs. Async logic uses `createAsyncThunk` to dispatch pending/fulfilled/rejected actions with consistent error handling, or you can write thunks manually with typed `AppDispatch`. RTK Query is an optional data-fetching layer colocated with Redux that defines `endpoints`, manages caches, invalidation tags, polling, and optimistic updates declaratively, often replacing hand-written reducers for server state. Slices should remain domain-focused; cross-slice dependencies use selectors or extraReducers listening to other slices’ actions. Middleware stacks include serializable checks and immutability checks in development to catch mistakes early. For React 19 apps, RTK Query pairs well with suspense-driven routers when configured carefully to avoid double-fetch during navigation.

```jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchUser = createAsyncThunk("user/fetch", async (id) => {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
});

const userSlice = createSlice({
  name: "user",
  initialState: { data: null, status: "idle" },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchUser.pending, (s) => {
      s.status = "loading";
    }).addCase(fetchUser.fulfilled, (s, a) => {
      s.status = "idle";
      s.data = a.payload;
    });
  },
});
```

---

## 42. How do Zustand and Redux compare architecturally?

Zustand uses a minimal external store with subscribe-notify semantics and encourages colocated actions alongside state without enforced action types, reducing ceremony for small-to-medium apps. Redux centralizes updates through dispatched actions and pure reducers, excelling at time-travel debugging, strict contracts, and large-team scalability. Redux enforces unidirectional data flow with middleware pipelines (logging, sagas), while Zustand middleware is lighter and often composed ad hoc. Redux Toolkit closes ergonomics gaps; Zustand still wins on bundle size and gradual adoption without providers. Choose Redux when you need robust devtools and complex cross-cutting workflows; choose Zustand for nimble state with minimal boilerplate. Both can integrate with React concurrent rendering if updates are batched via `useSyncExternalStore`.

```jsx
import { create } from "zustand";

const useCart = create((set) => ({
  items: [],
  add: (item) => set((s) => ({ items: [...s.items, item] })),
}));
```

---

## 43. When should you use React Context versus external state managers?

Use Context for values that change infrequently along the tree—theme, locale, auth session pointers—where propagation cost is acceptable and updates are coarse. Avoid Context for high-frequency streams (mouse position, animation frames) unless split into tiny contexts or memoized consumers. External stores shine when many components subscribe to overlapping slices with fine-grained updates, or when you need middleware, persistence, or devtools. Hybrid architectures use Context for dependency injection of clients (API, analytics) and external stores for domain state. Measure rerenders: if context causes widespread rerenders, refactor to selectors or stores. Server Components change the calculus: server-held data should not be mirrored into client context unnecessarily.

```jsx
const ApiContext = createContext(null);
export function useApi() {
  const client = use(ApiContext);
  if (!client) throw new Error("ApiProvider missing");
  return client;
}
```

---

## 44. How does Redux middleware work?

Middleware intercepts dispatched actions in a composable chain: each middleware receives `store` and `next` and can pass actions onward, swallow them, or emit additional actions asynchronously. This enables cross-cutting concerns like logging, analytics, crash reporting, and async orchestration via sagas or listeners. Middleware runs before reducers, preserving reducer purity. Typing middleware in TypeScript requires augmenting dispatch to handle thunks or promises. Ordering matters: serializable check middleware should wrap async middleware appropriately. Understanding curried middleware signatures clarifies debugging when actions mysteriously never reach reducers.

```jsx
const logger = (store) => (next) => (action) => {
  console.log("dispatching", action);
  const result = next(action);
  console.log("next state", store.getState());
  return result;
};
```

---

## 45. How do you implement optimistic updates in state management?

Apply the optimistic change locally before awaiting the server, track pending transaction IDs, and reconcile or roll back on failure. RTK Query provides `onQueryStarted` optimistic updates with `updateQueryData` and undo patches; Redux slices can store temporary flags per entity. Ensure idempotency keys on the server to handle duplicate submissions. Surface user feedback on rollback and allow retry. For collaborative editing, pair optimistic UI with conflict resolution strategies beyond simple rollback.

```jsx
async onQueryStarted({ id, patch }, { dispatch, queryFulfilled, getState }) {
  const patchResult = dispatch(
    api.util.updateQueryData("post", id, (draft) => {
      Object.assign(draft, patch);
    }),
  );
  try {
    await queryFulfilled;
  } catch {
    patchResult.undo();
  }
}
```

---

## 46. How do server state and client state differ, and what role does TanStack Query play?

Server state is remote, asynchronous, and shared across users; client state is local UI concerns like toggles and transient form drafts. Mixing both in one reducer often blurs caching, invalidation, and staleness semantics. TanStack Query (React Query) models server state with queries and mutations, providing caches keyed by query keys, background refetch, deduping, and pagination helpers. Client state may remain in `useState` or lightweight stores. React 19’s `use` and Suspense interoperate with query libraries as they add suspense integrations. Always separate authoritative server data from optimistic overlays to avoid inconsistent caches.

```jsx
const q = useQuery({ queryKey: ["user", id], queryFn: () => fetchUser(id) });
```

---

## 47. How does React Query caching and invalidation work?

Queries cache by serialized `queryKey` arrays; stale times control refetch windows, and `gcTime` (formerly `cacheTime`) controls how long inactive data remains in memory. `invalidateQueries` marks matching keys stale and triggers refetch for active observers. Prefetching hydrates caches before navigation. Deduping ensures identical in-flight queries share one network call. Mutation callbacks can optimistically update caches or invalidate related lists (`['todos']`) after create/update. Understanding key design prevents over-fetching: include all variables that affect the response.

```jsx
queryClient.invalidateQueries({ queryKey: ["posts"] });
```

---

## 48. How do you implement global error handling?

Combine React error boundaries for render-time failures with centralized logging services and toast systems for mutation errors. In Redux or TanStack Query, subscribe to global error handlers and map HTTP codes to user messaging policies. For route-level handling, frameworks provide error elements that capture thrown promises. Never swallow errors silently; categorize retryable vs fatal. Pair with feature flags to disable flaky modules. Ensure SSR and RSC errors surface distinct pages with actionable IDs.

```jsx
export function RootBoundary({ children }) {
  return (
    <ErrorBoundary FallbackComponent={FatalScreen}>
      <QueryErrorResetBoundary>
        {children}
      </QueryErrorResetBoundary>
    </ErrorBoundary>
  );
}
```

---

## 49. How does micro-frontend architecture work with React?

Micro-frontends split delivery by team or domain, composing separately deployed bundles into a shell application via module federation, iframes, or server-side includes. React-specific concerns include shared dependency versions to avoid duplicate React copies, which break hooks, and consistent routing integration. Module federation shares vendor chunks carefully and uses singletons for React. Styling isolation may use CSS modules or shadow DOM. Communication uses custom events, shared stores, or props passed from shells. Testing must cover cross-bundle navigation and version skew.

```jsx
const RemoteCart = React.lazy(() => import("cartApp/Cart"));
```

---

## 50. What is module federation and how does it relate to React?

Webpack Module Federation allows runtime loading of remote entries exposing components, enabling independent deployments while sharing dependencies. React must be configured as a singleton so hooks and context work across remotes. Federation complements design systems by exposing component libraries as shared modules. Drawbacks include complex caching, version compatibility, and harder local DX without disciplined tooling. Alternatives like single-spa orchestrate frameworks at a higher level.

```js
new ModuleFederationPlugin({
  name: "shell",
  remotes: { mfeA: "mfeA@https://cdn.example.com/remoteEntry.js" },
  shared: { react: { singleton: true }, "react-dom": { singleton: true } },
});
```

---

## 51. How do you structure a large-scale React application?

Adopt feature folders (`features/invoices`, `features/auth`) with colocated components, hooks, API, and tests; shared primitives live in `ui` or `components`. Enforce boundaries with ESLint import rules preventing upward imports from shared to feature code. Use index barrels sparingly to avoid circular imports and slower TS resolution. Centralize routing, query clients, and theming in `app` providers. Document architectural decision records for cross-cutting changes. Scale tooling with CI caches, TS project references, and storybook for UI review.

```text
src/
  app/           # providers, routes
  features/
    billing/
      api.ts
      components/
      hooks/
  shared/
    lib/
    ui/
```

---

## 52. How do atomic design principles apply to React?

Atomic design stratifies UI into atoms, molecules, organisms, templates, and pages, mapping well to component composition in React. Atoms are tiny presentational pieces (buttons, inputs); molecules combine them; organisms represent sections; templates define layouts; pages bind data. In practice, strict layers flex—what matters is consistent naming and reuse boundaries. Pair atoms with design tokens for color and spacing. Storybook stories align with each layer for visual regression testing. Avoid leaking business logic into atoms; keep them style and accessibility focused.

```jsx
export function PrimaryButton(props) {
  return <button className="btn btn-primary" {...props} />;
}
```

---

## 53. Feature-based vs layer-based folder structure — which when?

Feature-based colocation places routes, components, hooks, tests, and API modules together under a domain folder such as `features/billing`, which improves discoverability when a squad owns an end-to-end slice and reduces cross-team merge conflicts because changes stay localized. Layer-based structures separate `components`, `hooks`, and `services` horizontally, which can feel simpler early on when the app is small and many files are shared utilities rather than product boundaries. The trade-off is that layer-based folders often sprawl: a single feature change touches many top-level directories, code review context fragments, and dead code hides because ownership is unclear. Many large products begin layer-based for speed and migrate toward feature modules once coupling slows velocity or when micro-frontends require clearer seams. Hybrid approaches keep `shared/ui` and `shared/lib` for primitives while domains live under `features/*`, enforcing import rules so features cannot import from sibling features’ internals—only from their public `index.ts` barrels. Tooling such as ESLint `no-restricted-imports`, Nx boundaries, or Turborepo tags should prevent cyclic dependencies regardless of style, because cycles hurt both layouts equally. Choose feature-first when multiple teams ship in parallel; choose layers when the codebase is a single team’s CRUD app with heavy cross-cutting UI reuse and minimal domain isolation.

---

## 54. How do you handle authentication state management?

Store minimal auth state—tokens or session references—securely (HTTP-only cookies preferred over localStorage for XSS resilience). Expose session info to React via initial HTML props or `/me` queries; refresh tokens with background timers. Pair with route guards in routers and suspense for loading profiles. Avoid storing PII in client stores unnecessarily. For SSR, ensure auth checks run on server routes to prevent leaking protected RSC payloads.

```jsx
const session = useSession(); // from provider backed by cookie session
if (!session) return <Navigate to="/login" replace />;
```

---

## 55. How do you implement role-based access control in React?

Encode roles or permissions in the session object, derive boolean flags with pure selectors, and gate routes with wrapper components or loader functions in data routers. For UI affordances, hide destructive actions when permissions absent, but always enforce authorization on the server—client checks are UX only. Fine-grained policies may use attribute-based access lists evaluated server-side with tokens carrying claims. Audit logs should record admin actions regardless of UI. Testing should cover permission matrices explicitly.

```jsx
function Can({ permission, children }) {
  const { perms } = useAuth();
  return perms.has(permission) ? children : null;
}
```

---

## 56. How do you manage WebSocket connections in React?

Create a single shared client in a module or context, subscribe in `useEffect`, and multiplex channels rather than opening per-component sockets. Handle reconnect with exponential backoff and jitter; flush message queues on reconnect. Use `useSyncExternalStore` if subscribing to external stores. Clean up listeners on unmount. For SSR, guard connection creation to the client. Backpressure and batching prevent flooding renders on high message rates.

```jsx
useEffect(() => {
  const ws = new WebSocket(url);
  ws.onmessage = (ev) => dispatch(JSON.parse(ev.data));
  return () => ws.close();
}, [url]);
```

---

## 57. How do you implement real-time features in React?

Combine WebSockets, SSE, or subscription frameworks (Ably, Pusher) with optimistic UI and conflict resolution strategies suited to your domain. Use TanStack Query subscriptions or dedicated hooks that merge server snapshots into caches. Throttle UI updates for high-frequency streams. Provide presence indicators and reconnect banners for transparency. Test flaky networks with chaos tools.

---

## 58. How do state machines with XState integrate with React?

XState models explicit states and events, reducing impossible UI states compared to ad hoc booleans. The `@xstate/react` hooks `useMachine` or `useInterpret` bridge machines to components, spawning actors for concurrent workflows. Machines excel for wizards, checkout, and multi-step async processes with cancellation. Visualizers aid communication with stakeholders. Overhead is justified when complexity grows; simple toggles need not become machines.

```jsx
import { useMachine } from "@xstate/react";
import { createMachine } from "xstate";

const machine = createMachine({ /* ... */ });
function Flow() {
  const [state, send] = useMachine(machine);
  return <button onClick={() => send("NEXT")}>{state.value}</button>;
}
```

---

## 59. How do Jotai and Recoil model atomic state?

Both libraries represent state as atoms—small reactive units—that components subscribe to individually, avoiding broad context rerenders. Jotai uses minimal atom primitives with derived atoms via read/write functions; Recoil exposes atoms and selectors with async support and graph-based dependency tracking. They suit fine-grained derived data and cross-cutting client state without Redux boilerplate. Integration with React concurrent mode requires attention to async atoms and suspense boundaries. Choose atoms when many independent small states interact; avoid atom explosion without discipline.

```jsx
import { atom, useAtom } from "jotai";

const countAtom = atom(0);
export function Counter() {
  const [count, setCount] = useAtom(countAtom);
  return <button type="button" onClick={() => setCount((c) => c + 1)}>{count}</button>;
}
```

---

## 60. What does event-driven architecture look like in React applications?

Event-driven UIs react to domain events—user actions, server pushes, timers—routed through buses or state machines instead of tightly coupling components. In React, this often means dispatching custom events to analytics, using message queues between micro-frontends, or applying Redux middleware to fan out side effects. Decouple producers and consumers so features evolve independently. Document ordering guarantees; without them, race conditions appear. Combine with idempotent handlers for retries.

```jsx
function useDomainEvents(bus) {
  useEffect(() => bus.subscribe("invoice.paid", handlePaid), [bus]);
}
```

---

## 61. What are the React rendering pipeline’s render phase and commit phase?

The render phase is pure and may run more than once in strict mode or concurrent retries: React calls your components to compute the next tree, schedules updates, and marks side effects without touching the DOM yet. The commit phase applies mutations in three subphases: DOM updates (`mutation`), `useLayoutEffect`, then paint, followed by `useEffect` passives. Interruptibility applies to render, not commit—commits are synchronous to maintain consistency. Understanding this split explains why render must stay pure (no timers, no subscriptions) and why layout effects can read measurements immediately after DOM changes. Profilers highlight render vs commit time separately, guiding optimizations.

```jsx
function Demo() {
  const [n, setN] = useState(0);
  console.log("render", n);
  useLayoutEffect(() => console.log("layout effect", n));
  useEffect(() => console.log("passive effect", n));
  return <button type="button" onClick={() => setN((x) => x + 1)}>{n}</button>;
}
```

---

## 62. How does React batching work internally?

React 18+ automatically batches state updates from multiple `setState` calls inside event handlers, promises, timeouts, and native event handlers by scheduling a single re-render per tick unless flushed explicitly. Batching reduces thrashing and inconsistent intermediate UI. `flushSync` escapes batching for rare cases needing immediate DOM reads. Concurrent updates may be split across lanes, but batching still coalesces where safe. Library authors wrapping non-React events should use `unstable_batchedUpdates` in older roots if needed, though modern roots batch more broadly. Tests using `act` rely on batching semantics to mirror production.

```jsx
function bump() {
  setA((x) => x + 1);
  setB((x) => x + 1); // single render in React 18+
}
```

---

## 63. How do concurrent features like startTransition and useDeferredValue interact?

Both APIs cooperate with the scheduler to prioritize urgent work, but `startTransition` wraps discrete updates while `useDeferredValue` produces a lagging view of a value for expensive derived output. They can be combined: keep input state urgent, defer derived props, and wrap secondary navigation in transitions. Suspense boundaries determine fallback behavior while deferred updates catch up. Misuse occurs when deferring critical feedback—always keep primary affordances immediate. Profiling with React DevTools concurrent profiler clarifies lanes.

---

## 64. How do you profile React applications?

Use React DevTools Profiler to record commits, flamegraphs per component time, and why renders occurred (props changed, hooks changed). Chrome Performance panel captures main-thread long tasks correlating with interactions (INP). Enable “Record why each component rendered” when available. For production, use `scheduler` profiling APIs sparingly and rely on RUM metrics. Pair with bundle analyzers to separate JS parse cost from render cost. Always test on throttled CPUs to mirror mobile reality.

```jsx
import { Profiler } from "react";
function onRender(id, phase, actualDuration) {
  analytics.track("render", { id, phase, actualDuration });
}
<Profiler id="Checkout" onRender={onRender}>{children}</Profiler>
```

---

## 65. How does React.memo compare props — deep vs shallow?

`React.memo` performs shallow comparison of props by default: it compares each prop with `Object.is`. Nested object identity changes trigger rerenders even if deep values are equal, which is why stable props via `useMemo` or selectors matter. Deep equality is not built-in; adding custom `arePropsEqual` enables deep compares at the cost of CPU—often worse than fixing upstream referential stability. For large lists, memoization plus virtualization beats deep compares. Context consumers rerender when context value changes shallowly.

```jsx
export const Row = React.memo(function Row({ item }) {
  return <div>{item.title}</div>;
}, (prev, next) => prev.item.id === next.item.id);
```

---

## 66. How do you optimize Context to prevent unnecessary re-renders?

Split contexts by concern (theme vs session), memoize provider values with `useMemo`, and pass state and dispatch via separate contexts to avoid consumers rerendering when unrelated slices change. For read-heavy trees, consider external stores with `useSyncExternalStore` selectors. Avoid putting huge objects in a single context value each render—derive smaller values or use atom libraries. Measure with Profiler before optimizing blindly.

```jsx
const ThemeState = createContext(null);
const ThemeDispatch = createContext(null);
export function ThemeProvider({ children }) {
  const [theme, dispatch] = useReducer(reducer, "light");
  const stateValue = useMemo(() => theme, [theme]);
  const dispatchValue = useMemo(() => dispatch, []);
  return (
    <ThemeState value={stateValue}>
      <ThemeDispatch value={dispatchValue}>{children}</ThemeDispatch>
    </ThemeState>
  );
}
```

---

## 67. How does virtualization help large lists in React?

Virtualization renders only visible rows plus small overscan buffers, recycling DOM nodes as users scroll, keeping layout and paint costs bounded for thousands of items. Libraries like `react-window` and `react-virtuoso` measure heights dynamically for variable rows. Caveats include keyboard navigation across unloaded rows and aria announcements—you may need `aria-rowcount`. Pair virtualization with memoized row components and stable item keys. For chat apps, reverse virtualization libraries handle bottom anchoring.

```jsx
import { FixedSizeList } from "react-window";

<FixedSizeList height={600} itemCount={items.length} itemSize={40} width="100%">
  {({ index, style }) => <div style={style}>{items[index].name}</div>}
</FixedSizeList>
```

---

## 68. What are code splitting strategies — route-based vs component-based?

Route-based splitting loads route modules on navigation, shrinking initial bundles—ideal for SPAs with distinct sections. Component-based splitting wraps heavy widgets (`React.lazy` + `Suspense`) to defer non-critical UI like charts or admin panels. Too many tiny chunks can increase HTTP overhead; balance with prefetching on intent (hover). SSR frameworks may inline critical CSS/JS while streaming others. Analyze bundles to ensure splits align with user journeys.

```jsx
const Admin = lazy(() => import("./AdminPanel"));
```

---

## 69. How do dynamic imports and lazy loading patterns work?

`import()` returns promises resolved with module namespaces, enabling webpack to emit separate chunks loaded at runtime. Wrap with `React.lazy` for components and place `Suspense` boundaries with meaningful fallbacks. Handle errors with error boundaries or retry loaders for flaky networks. Prefetch with `webpackPreload` comments or router-driven hints. Ensure default exports for `React.lazy` compatibility or map namespaces. For non-React modules, dynamic import still works in effects.

```jsx
const Chart = lazy(() => import(
  /* webpackChunkName: "chart" */ "./HeavyChart"
));
```

---

## 70. What image optimization strategies matter in React apps?

Use responsive `srcSet`, modern formats (AVIF/WebP), explicit width/height to reduce layout shift, and priority hints for hero images (`fetchpriority="high"`). In Next.js or similar, leverage image components handling optimization CDNs. Lazy-load below-the-fold images with `loading="lazy"`. Avoid giant unoptimized PNGs in bundles—serve from CDN with caching. Pair with skeleton placeholders for perceived performance. Monitor LCP in field data.

```jsx
<img
  src="/hero.avif"
  alt="Product"
  width={1200}
  height={630}
  fetchPriority="high"
/>
```

---

## 71. How do Web Workers interact with React?

Web Workers run CPU-heavy tasks off the main thread, keeping input and React responsive. You communicate via `postMessage` with structured cloning, not shared mutable state. Hooks can wrap workers with `useRef` instances and `useEffect` for setup, exposing promises to components. For large data, consider `ArrayBuffer` transfers. Avoid sending entire React state trees to workers—send minimal deltas. Testing requires worker mocks. Workers complement concurrent React but do not replace efficient algorithms.

```jsx
useEffect(() => {
  const w = new Worker(new URL("./hash.worker.js", import.meta.url));
  w.postMessage(payload);
  w.onmessage = (e) => setResult(e.data);
  return () => w.terminate();
}, [payload]);
```

---

## 72. How does tree shaking interact with React code?

ESM `import`/`export` enables bundlers to drop unused exports when side effects are absent. React’s package exports are structured for tree shaking in application bundles, but importing entire lodash without plugins bloats builds. Mark files as side-effect free in `package.json` for aggressive shaking. Dynamic imports with non-static strings limit shaking. Ensure Babel/TypeScript targets preserve ESM for bundlers. Verify with `webpack-bundle-analyzer` or `source-map-explorer`.

```js
import { debounce } from "lodash-es";
```

---

## 73. How do you analyze and optimize bundles?

Run production builds with source maps, visualize chunk composition, and identify duplicate dependencies or oversized polyfills. Split vendor chunks deliberately, enable compression (brotli) at CDN, and defer non-critical scripts. Compare before/after when upgrading dependencies—sometimes minor versions add KB. Use React DevTools and Lighthouse to tie bundle size to metrics like TTI. Consider HTTP/2 multiplexing when splitting aggressively.

```bash
npx source-map-explorer dist/assets/*.js
```

---

## 74. What causes memory leaks in React and how do you prevent them?

Memory leaks in React apps usually stem from subscriptions or timers that outlive a component because `useEffect` cleanups were omitted, from `addEventListener` on `window` or `document` without matching removal, or from asynchronous work that calls `setState` after unmount because fetch or `Promise` chains were not aborted. Third-party maps, charts, and observers (`ResizeObserver`, `IntersectionObserver`) are frequent culprits when teardown is skipped. Module-level singleton caches—common for deduplicating GraphQL or REST clients—can grow without bounds if keys include ever-changing query strings or user IDs without LRU eviction. Detached DOM nodes retained by closures appear in Chrome DevTools heap snapshots as nodes kept alive from JavaScript references even after React removed them from the tree. Prevention means pairing every subscription with cleanup, using `AbortController` for fetch, storing `ignore` flags or cancel tokens in effects, and bounding caches with max size or `WeakMap` where appropriate. Virtualized lists prevent unbounded DOM growth for long feeds. React Strict Mode’s double-mount in development helps surface effects that do not clean up symmetrically, which is an early warning before production leaks appear under navigation-heavy usage.

```jsx
useEffect(() => {
  const ctrl = new AbortController();
  let cancelled = false;
  fetch("/api/x", { signal: ctrl.signal })
    .then((r) => r.json())
    .then((data) => {
      if (!cancelled) setData(data);
    });
  return () => {
    cancelled = true;
    ctrl.abort();
  };
}, []);
```

---

## 75. How does React handle concurrent rendering and priorities?

React’s concurrent renderer cooperates with a scheduler that assigns updates to lanes—logical priority bands—so discrete user input can preempt in-flight rendering of lower-priority work such as deferred transitions or large list updates. Time slicing breaks render work into units that yield before exceeding a frame budget, allowing the browser to paint and process events between chunks. Internally, fibers carry flags and expiration times that determine commit order; the commit phase itself stays synchronous once React begins applying DOM mutations, because partial DOM updates would be inconsistent. Public APIs like `useTransition`, `useDeferredValue`, and Suspense integrate with this system by marking work as transition or suspense-related, which the scheduler can interrupt or restart. Understanding priorities explains Strict Mode’s double render in development and why sometimes `useEffect` runs later than you intuit after a burst of updates—effects wait for paint after commit. None of this removes the need to keep render functions pure and fast: a long synchronous loop inside a component still blocks the main thread and defeats concurrency, because the scheduler cannot preempt arbitrary JavaScript. Profiling with React DevTools shows which updates committed at which priority, which is invaluable when tuning interaction responsiveness.

---

## 76. What patterns apply to Suspense for data fetching?

Wrap async-capable components in `Suspense` with fallbacks; ensure data sources support caching and deduping promises through a library or framework integration. Avoid throwing new promises on every render without memoization. Pair with error boundaries for rejected resources. For routers, use loaders or RSC to prefetch. Testing suspense requires `act` async utilities or libraries supporting suspense testing. Hydration mismatches occur if server and client fetch differently—align caches.

```jsx
<Suspense fallback={<Skeleton />}>
  <Comments postId={id} />
</Suspense>
```

---

## 77. How does streaming SSR work in React 18 and 19?

Streaming server-side rendering sends HTML to the browser in chunks over a single HTTP response using chunked transfer encoding, so the shell of a page—layout, headers, static regions—can flush before slow database queries or downstream services resolve. The browser can parse and paint early content while the connection stays open for later segments, which improves perceived performance versus waiting for the entire tree to finish. React emits inline markers and script payloads so hydration can proceed incrementally; in React 19, integration with Server Components extends this model with flight payloads that describe serialized UI trees and client component references, not just HTML. Frameworks must configure proxies and CDNs carefully because some intermediaries buffer small chunks until a threshold, defeating streaming benefits unless tuned. Caching is nuanced: fully dynamic streams may be `Cache-Control: private`, while partially static shells might use edge caching with surrogate keys. Monitoring should compare TTFB, FCP, and LCP: over-granular chunking can increase overhead; under-streaming loses responsiveness. Pair streaming with Suspense boundaries so fallbacks are meaningful and the HTML skeleton matches what the client will hydrate.

---

## 78. What is selective hydration?

Selective hydration means React does not attach event listeners to every server-rendered node in document order; instead it prioritizes hydrating regions that are likely to receive user interaction soon—such as visible form controls and primary calls to action—while deferring large below-the-fold subtrees until idle time or viewport intersection. This improves Interaction to Next Paint on heavy marketing or dashboard pages where full-tree hydration would otherwise block the main thread for hundreds of milliseconds. The mechanism relies on Suspense boundaries and streamed HTML segments: interactive islands can become responsive before decorative content hydrates. Frameworks may replay early user events queued before hydration completes so clicks are not lost. Misplaced boundaries can backfire: wrapping an entire page in one boundary removes opportunities to prioritize, while splitting too finely can increase script coordination overhead. Server HTML must match what the client expects; hydration mismatches force expensive client rewrites that negate selective hydration’s wins. Testing on throttled devices validates whether the chosen boundaries align with real user interaction paths.

---

## 79. How do you optimize Web Vitals in React apps?

Reduce LCP by optimizing hero media and server response times; improve INP by shrinking JS, deferring non-critical work with transitions, and avoiding layout thrash in handlers; reduce CLS by setting dimensions on media and avoiding late-inserted banners. Use RUM to capture field data, not just lab Lighthouse. Feature-freeze third-party tags. Pair SSR streaming with prioritized hydration. Continuously monitor regressions via CI budgets.

```jsx
startTransition(() => setTab(next)); // keep input snappy during heavy tab switches
```

---

## 80. How do you implement skeleton screens and loading states?

Skeleton UIs mimic layout with neutral placeholders, reducing perceived latency versus spinners alone. Implement as lightweight components styled with design tokens; avoid expensive animations on huge lists. Pair skeletons with Suspense fallbacks and prefetching so they display briefly. Ensure accessible names (`aria-busy`, `aria-live`) so screen readers understand loading vs ready. For data tables, mirror column widths to prevent CLS.

```jsx
function TableSkeleton({ rows = 8 }) {
  return (
    <div aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row" />
      ))}
    </div>
  );
}
```

---

## 81. How do you test React components with React Testing Library?

React Testing Library focuses on testing components the way users interact—queries prioritize roles, labels, and text rather than implementation details. Render components with `render`, simulate events with `userEvent`, and assert visible outcomes and accessibility attributes. Avoid testing internal state or private methods; instead assert DOM results after interactions complete. Use `screen` queries scoped globally for readability. Async utilities `waitFor`/`findBy` handle effects and suspense. Mock network at the boundary (MSW) rather than stubbing fetch ad hoc everywhere. Integrate with Jest or Vitest for snapshots sparingly—prefer explicit expectations.

```jsx
import { render, screen, userEvent } from "@testing-library/react";
import { LoginForm } from "./LoginForm";

test("shows validation", async () => {
  const user = userEvent.setup();
  render(<LoginForm />);
  await user.click(screen.getByRole("button", { name: /sign in/i }));
  expect(await screen.findByText(/enter email/i)).toBeInTheDocument();
});
```

---

## 82. How do you test custom hooks?

Use `@testing-library/react`’s `renderHook` (or `renderHook` from React Testing Library depending on version) to mount hooks in isolation, wrapping providers when needed. Assert return values change after `act`-wrapped updates or async waits. For hooks depending on context, supply wrapper components. Test pure helper functions separately to keep hook tests focused on wiring. Avoid testing React internals—verify observable outputs.

```jsx
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "./useCounter";

test("increments", () => {
  const { result } = renderHook(() => useCounter());
  act(() => result.current.inc());
  expect(result.current.value).toBe(1);
});
```

---

## 83. What integration testing strategies work well for React apps?

Integration tests sit between isolated unit tests and full end-to-end suites: they render realistic subtrees with real routers (memory or production routers in test mode), real Redux or TanStack Query clients, and HTTP mocking via MSW so components exercise actual data flow without hitting production APIs. The goal is to catch wiring mistakes—wrong context provider nesting, broken loader contracts, race-prone query keys—that unit tests miss because they stub too aggressively. For SSR or RSC-heavy apps, spin up minimal server fixtures or use framework-provided test harnesses so serialization and hydration assumptions are validated. Balance remains important: integration tests are slower than unit tests, so target high-value journeys such as authentication, checkout, permissions, and data tables with filters. Tag tests as `@smoke` versus `@regression` so CI can run smoke on every push and defer heavier suites to nightly or pre-release. Pair with Playwright or Cypress for a thin happy-path smoke across browsers while RTL integration covers component permutations. Flakiness usually comes from async timing; prefer `findBy` queries, deterministic MSW handlers, and disabling animations in test environments.

```jsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { InvoicePage } from "./InvoicePage";

test("loads invoice", async () => {
  const qc = new QueryClient();
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/invoices/1"]}>
        <Routes>
          <Route path="/invoices/:id" element={<InvoicePage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  expect(await screen.findByRole("heading", { name: /INV-1/ })).toBeInTheDocument();
});
```

---

## 84. How do you mock API calls in tests?

Prefer Mock Service Worker to intercept network requests at the HTTP layer, keeping components unaware of test doubles. For unit tests, stub `fetch` minimally or inject API clients via context. Avoid mocking modules per test file inconsistently—centralize handlers. Record fixtures to keep payloads realistic. Reset handlers between tests to avoid bleed.

```js
import { setupServer } from "msw/node";
import { rest } from "msw";

const server = setupServer(
  rest.get("/api/user", (req, res, ctx) => res(ctx.json({ id: "1" }))),
);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 85. How do end-to-end tests with Cypress or Playwright complement React tests?

E2E tests validate full stacks—routing, cookies, service workers, and real browsers—catching issues RTL cannot, such as misconfigured proxies or CSS breaking clicks. Playwright offers multi-browser parallelism and trace viewer; Cypress excels at developer DX with time travel. Keep E2E counts lean and fast; run nightly for heavy suites. Use data-testid sparingly when roles/labels cannot disambiguate.

```js
import { test, expect } from "@playwright/test";

test("checkout", async ({ page }) => {
  await page.goto("/checkout");
  await page.getByRole("button", { name: "Pay" }).click();
  await expect(page.getByText("Thank you")).toBeVisible();
});
```

---

## 86. How do you test async operations and loading states?

Use `findBy` queries to await elements appearing after async work, `waitFor` for conditions, and MSW delays to simulate slow networks. Assert disabled buttons while pending and spinner accessibility. For suspense, ensure fallbacks render then resolve. Fake timers help debounce tests. Avoid arbitrary `setTimeout` sleeps—use deterministic awaits.

```jsx
expect(await screen.findByText(/loaded data/i)).toBeInTheDocument();
```

---

## 87. How does accessibility testing with axe or jest-axe work?

Automated axe checks catch missing labels, contrast failures, and invalid roles quickly in CI. Integrate `jest-axe` with RTL to run `expect(await axe(container)).toHaveNoViolations()` after renders. Manual testing with screen readers remains necessary for complex widgets. Pair with eslint-plugin-jsx-a11y for static analysis. Treat violations as build failures on critical routes.

```jsx
import { axe, toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);

test("a11y", async () => {
  const { container } = render(<Modal open />);
  expect(await axe(container)).toHaveNoViolations();
});
```

---

## 88. What does a CI/CD pipeline for React apps typically include?

Pipelines run lint, typecheck, unit/integration tests, bundle budgets, and production builds on each PR; main branch deploys to staging automatically with smoke E2E, then promotes to production with approvals. Cache `node_modules` and build artifacts. Upload source maps to error services on release. Use environment-specific env vars injected at build or runtime securely. Roll back via previous artifacts when health checks fail.

```yaml
# illustrative GitHub Actions snippet
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint && npm test -- --ci
      - run: npm run build
```

---

## 89. How do you containerize React apps with Docker?

Multi-stage Dockerfiles install dependencies and build static assets in a builder stage, then serve via `nginx` or Node SSR image in the final slim stage. Copy only `package*.json` first for layer caching. For SPAs, configure `nginx` fallback to `index.html`. Do not bake secrets into images—inject at runtime. Health check endpoints keep orchestrators informed.

```dockerfile
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

---

## 90. How do you manage environment configuration?

Use `.env` files with `VITE_`, `NEXT_PUBLIC_`, or framework-specific prefixes for client-safe vars; keep secrets server-side only in deployment platforms. Validate env at startup with schemas (zod) to fail fast. Separate staging/production keys for analytics and APIs. For SSR, expose only non-sensitive values to the browser bundle. Rotate keys regularly.

```js
import { z } from "zod";
const Env = z.object({ API_URL: z.string().url() });
export const env = Env.parse(import.meta.env);
```

---

## 91. How do you implement feature flags in React?

Evaluate flags client-side via bootstrap JSON from the server or SDKs (LaunchDarkly, Split) using context attributes for targeting. Wrap components with flag gates and prefetch variants to avoid flashes. For SSR, compute flags on the server to prevent hydration mismatches. Log exposures for experimentation analysis. Provide safe defaults when SDKs fail.

```jsx
function Home() {
  const showBeta = useFlag("beta-checkout");
  return showBeta ? <BetaCheckout /> : <Checkout />;
}
```

---

## 92. How does error monitoring with Sentry integrate into React?

Initialize Sentry with DSN via env, wrap the app with `ErrorBoundary` integration, and upload source maps in CI for symbolicated stacks. Tag releases with git SHA, user segments, and route names. Filter PII per compliance. Performance monitoring adds transaction traces for slow interactions. Replay sessions optionally for hard-to-reproduce bugs.

```jsx
import * as Sentry from "@sentry/react";

Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, integrations: [Sentry.browserTracingIntegration()] });
```

---

## 93. How do you implement analytics tracking responsibly?

Centralize analytics in a module translating domain events into vendor calls; guard against double firing on strict mode by idempotency keys. Respect consent banners and GDPR/CCPA requirements—load scripts after consent. Use batching to reduce main-thread impact. Correlate with feature flags. Test that navigation SPA events emit `page` calls on route changes.

```jsx
function track(event, payload) {
  if (!consent.analytics) return;
  gtag("event", event, payload);
}
```

---

## 94. How does internationalization (i18n) work in React?

Libraries like `react-i18next` load translation catalogs, interpolate variables, and handle pluralization and formatting via `Intl`. Lazy-load locales to shrink bundles. Keep keys stable and colocate namespaces per feature. SSR requires passing locale on requests and hydrating dictionaries consistently. Test pseudolocales to reveal layout issues. Remember RTL mirroring for styles.

```jsx
import { useTranslation } from "react-i18next";

export function Greeting({ name }) {
  const { t } = useTranslation("home");
  return <h1>{t("welcome", { name })}</h1>;
}
```

---

## 95. When do you choose SSR versus SSG for React apps?

Server-side rendering produces HTML on each request (or on cache miss), which suits pages that must reflect user-specific data, A/B assignments, or rapidly changing inventory where staleness is unacceptable. Static site generation bakes HTML at build time and serves it from the edge with minimal origin latency, which is ideal for marketing pages, documentation, and blogs where content changes on deploy cadence rather than per user. Modern frameworks blur the line with incremental static regeneration and hybrid routes: you might SSG a shell and client-fetch personalized widgets, or SSR the first paint and cache fragments at the CDN. The operational cost of SSG is rebuild and invalidation plumbing—knowing when to trigger regeneration when CMS content changes—while SSR shifts complexity to runtime scaling, database latency, and cache headers. Auth-heavy dashboards often use SSR for first paint plus cookies or CSR when SEO does not matter and APIs are fast enough behind SPA navigation. Measure TTFB, cache hit rates, and operational load: a globally cached SSG page beats SSR for anonymous traffic, but SSR wins when every request must be authoritative and personalized.

---

## 96. How does the Next.js App Router integrate with React 19?

The App Router defaults to React Server Components, nested layouts, streaming, and server actions, aligning closely with React 19 features like improved `fetch` caching semantics and form actions. Client components opt in via `"use client"`. Metadata APIs map to document tags with streaming. Upgrade paths require adopting new caching mental models and replacing older `getServerSideProps` patterns with loaders/RSC data fetching. Ensure React 19-compatible dependencies.

```jsx
// app/page.tsx — Server Component
export default async function Page() {
  const data = await fetch("https://api.example.com/items", { cache: "no-store" }).then((r) => r.json());
  return <List items={data} />;
}
```

---

## 97. How do you migrate from class components to hooks?

Incrementally refactor leaf components first, replacing lifecycle methods with `useEffect`, `useLayoutEffect`, and `useMemo` equivalents; convert `this.state` to `useState`/`useReducer`. Preserve public APIs for parents during migration. Replace context consumers with `useContext`. Error boundaries must remain classes unless using library alternatives. Add tests before refactors to catch regressions. For complex lifecycles, consider splitting responsibilities into custom hooks.

```jsx
class Clock extends React.Component {
  state = { now: Date.now() };
  tick = () => this.setState({ now: Date.now() });
  componentDidMount() {
    this.id = setInterval(this.tick, 1000);
  }
  componentWillUnmount() {
    clearInterval(this.id);
  }
  render() {
    return <span>{new Date(this.state.now).toLocaleTimeString()}</span>;
  }
}

function ClockFn() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span>{new Date(now).toLocaleTimeString()}</span>;
}
```

---

## 98. How do you upgrade to React 19?

Upgrade `react` and `react-dom` together, adopt the automatic JSX runtime in TypeScript, run codemods for deprecated APIs, and update testing libraries to versions compatible with React 19’s `act`. Validate third-party packages for concurrent compatibility—especially drag-and-drop and portals. In frameworks, follow their migration guides for RSC and routing. Run visual and E2E regression suites. Roll out behind feature flags if needed. Monitor error rates and Web Vitals post-deploy.

```bash
npm install react@^19 react-dom@^19
```

---

## 99. How do you implement a design system in React?

Centralize tokens (color, spacing, typography) as CSS variables or JS objects; build primitives (Button, Input) with accessibility baked in and variants via `cva` or similar. Document in Storybook with controls and a11y checks. Version the package independently from apps; use visual regression tests. Provide migration guides for breaking changes. Integrate with Figma via design tokens sync when possible. Ensure tree-shakeable exports.

```jsx
import { cva } from "class-variance-authority";

const button = cva("btn", {
  variants: {
    tone: { primary: "btn-primary", ghost: "btn-ghost" },
    size: { md: "btn-md", sm: "btn-sm" },
  },
  defaultVariants: { tone: "primary", size: "md" },
});

export function Button({ tone, size, className, ...props }) {
  return <button className={button({ tone, size, className })} {...props} />;
}
```

---

## 100. What are common performance pitfalls in production React apps?

Oversized client bundles from suboptimal imports and missing code splitting inflate parse time; excessive context causes wide rerenders; unmemoized callbacks break `memo` everywhere; heavy synchronous work in event handlers tanks INP; missing virtualization renders thousands of DOM nodes; hydration mismatches trigger costly re-renders; third-party tags block main thread; and unbounded `useEffect` subscriptions leak memory. Profiling plus Web Vitals monitoring separates real issues from speculation. Address highest-impact paths first—usually bundle size, image optimization, and interaction responsiveness—then micro-optimize hot components.

```jsx
// Pitfall: inline object props break memoization
function Parent() {
  return <Child style={{ margin: 8 }} />; // new object each render
}
```

---
