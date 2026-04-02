# React 19 Interview Questions — Senior Level (7+ Years Experience)

100 advanced questions with expert-level answers covering architecture, internals, and leadership topics. Designed for senior/staff/principal engineers.

---

## 1. How does the React Fiber reconciler work at the data structure level?

At the data structure level, React’s reconciler models the UI as a **doubly linked list of Fiber nodes**, not a classic React element tree. Each Fiber is a mutable work unit that corresponds to either a host instance (DOM node), a function/class component, or a special type (Fragment, Suspense, etc.). The `child` pointer walks depth-first into the subtree, while `sibling` connects siblings at the same depth, and `return` points back to the parent—this layout lets the scheduler traverse and suspend work without deep recursion. During reconciliation, React **reuses or clones** fibers: it compares the new element’s type/key with the old fiber and either updates the existing fiber in place or tears down and creates a new subtree. Effects, refs, and layout are not applied during this traversal; they are collected into queues for the commit phase. The Fiber architecture decouples “what to render” from “when to finish,” enabling interruption, resumption, and prioritization. Understanding that each fiber carries `memoizedProps`, `memoizedState`, `updateQueue`, and flags like `Placement` or `Deletion` is essential when reasoning about incremental rendering. Compared to Stack reconciler days, Fiber trades some simplicity for schedulability and concurrent features.

```js
// Conceptual sketch: fiber shape (simplified from React internals)
function createFiberFromElement(element, parentFiber) {
  return {
    type: element.type,
    key: element.key,
    pendingProps: element.props,
    memoizedProps: null,
    memoizedState: null,
    child: null,
    sibling: null,
    return: parentFiber,
    updateQueue: null,
    flags: 0, // placement, update, deletion, passive, etc.
    lanes: 0,
  };
}
```

---

## 2. Explain the work loop, unit of work, and time slicing in Fiber.

The **work loop** is the core driver: while there is work, React picks the next fiber (the **unit of work**), processes it—creating children, reconciling lists, marking side-effects—and advances the traversal using `child`, `sibling`, or `return` links. Time slicing enters when the scheduler yields: after a slice of work, React checks elapsed time against a deadline derived from `scheduler` priorities and may **pause** before completing the whole tree, storing the next unit of work on the stack. This cooperative multitasking prevents long main-thread stalls during large updates. The unit of work granularity is typically one fiber per step, though batched updates may process related fibers quickly. When resumed, React continues from the saved pointer without redoing completed subtrees that did not change. The trade-off is complexity: intermediate UI may be inconsistent if not paired with concurrent features, which is why transitions and `useDeferredValue` exist to keep urgent updates responsive while deferring heavy work.

```js
// Pseudocode mirroring the cooperative loop idea
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
  if (workInProgress !== null) {
    return continuationCallback; // yield to browser
  }
  return null;
}
```

---

## 3. How does React's priority system (lanes) work?

React models urgency with **lanes**, a bitmask-based system where different update sources map to overlapping lanes (e.g., sync updates, transitions, retries, hydration). Multiple updates can share lanes, and React can **merge** or **entangle** lanes to express dependencies—such as ensuring a transition does not commit before a related suspense retry. During render, React picks the highest-priority non-empty lanes from `pendingLanes` and processes work for those lanes first, potentially starving lower-priority lanes until idle time or until higher lanes clear. This replaces older heuristic priority queues with a more composable structure suited to concurrent rendering and Suspense. Lanes also interact with hydration: certain lanes are reserved so client updates do not clobber server-rendered HTML prematurely. Misunderstanding lanes leads to bugs where “low priority” updates appear stuck because higher lanes never drain—usually a sign of continuous high-priority churn (e.g., unstable subscriptions firing `setState`). Debugging lane-related starvation often involves finding accidental synchronous updates in `useEffect`, animation frames, or third-party stores that continuously schedule sync lane work. Tools like React DevTools and performance profilers help correlate commits with update sources, but the mental model remains: lanes are a finite scheduling resource, not an invisible fairness queue. When integrating external schedulers, avoid starving React’s message-channel-driven work by batching external callbacks or lowering their frequency.

```js
// Mental model: many updates collapse into lane masks before commit
// (illustrative — actual APIs are internal)
// sync input → high lane; startTransition → transition lanes
```

---

## 4. How does React schedule updates - the Scheduler package internals?

The **Scheduler** bridges React and the browser event loop, using `MessageChannel` (or `setTimeout` fallback) to schedule macrotasks and `requestIdleCallback` concepts via a polyfilled idle deadline for low-priority work. It exposes `unstable_scheduleCallback` with priority levels that map into React lanes at the boundary. Internally, a **min-heap** orders scheduled tasks by expiration time; when a task is due, it runs until completion or yields if it exceeds a frame budget. React registers a callback that flushes work for the chosen lanes, coordinating with `flushSync` for synchronous paths. The Scheduler also supports **cancellation** and **continuation**, crucial for interruptible renders. Understanding this matters when integrating third-party schedulers or profiling jank: if something else starves the message loop, React’s scheduled work stalls regardless of fiber readiness. In production systems, heavy synchronous work in unrelated code (large JSON.parse on the main thread, synchronous XHR polyfills) can delay scheduled callbacks just as badly as an infinite React render. Priority levels are not guarantees of wall-clock latency—they express relative ordering when the main thread is available. Testing scheduling behavior should include throttled CPU in DevTools to surface starvation that fast laptops hide.

```js
// Scheduler-style priority constants (conceptual; names vary by version)
// Immediate > UserBlocking > Normal > Low > Idle
// React maps these into lane work when flushing
```

---

## 5. Explain the two-phase rendering (render and commit) in detail.

**Render phase** is pure and may run more than once (Strict Mode, aborted work): React walks fibers, computes diffs, builds effect lists, and marks flags—without touching the DOM. Side effects like `useLayoutEffect` callbacks are **scheduled**, not executed here. **Commit phase** is split: before mutation, React runs DOM mutations (`commitMutationEffects`), inserts nodes, updates refs in specific orders, and runs layout (`commitLayoutEffects`) for `useLayoutEffect`. Passive effects (`useEffect`) are queued and flushed asynchronously after paint in a separate pass. Server rendering has analogous phases but targets a stream/string instead of DOM. The split ensures the tree is consistent before observable mutations and allows React to discard render work if preempted. Breaking purity in render (mutating refs/globals) violates these assumptions and causes subtle bugs across retries.

```jsx
function Example() {
  // Render: compute; do not mutate DOM
  const ref = useRef();
  // Layout: measure DOM after commit mutations
  useLayoutEffect(() => {
    const w = ref.current?.getBoundingClientRect().width;
    document.title = `w=${w}`;
  }, []);
  // Passive: after paint
  useEffect(() => {
    fetch("/api/ping");
  }, []);
  return <div ref={ref} />;
}
```

---

## 6. How does the diffing algorithm work? What are its heuristics and limitations?

React’s reconciliation assumes **same-type elements at the same position** update in place, keyed children reorder efficiently, and **different types** replace entire subtrees. For children arrays, keys provide identity across moves; without keys, index-based reconciliation can cause incorrect state retention and performance cliffs. Heuristics favor O(n) scans: two-pointer algorithms for simple cases and maps for reorder detection. Limitations include inability to infer semantic equivalence across different component types even if output HTML is identical, and expensive list diffs when keys are unstable (random or array index for dynamic lists). Cross-component animations and preserving local state require careful keying and composition. Understanding these limits guides API design: stable IDs from domain models beat positional indices.

```jsx
// Bad: index keys when list reorders
items.map((item, i) => <Row key={i} id={item.id} />);

// Good: domain-stable keys
items.map((item) => <Row key={item.id} id={item.id} />);
```

---

## 7. How does React handle synthetic events internally?

React **pools** event semantics across browsers and registers root-level listeners, delegating most events to the document/root for bubbling phases (with notable exceptions evolving over time). A synthetic event wraps the native event with a consistent interface, applying propagation rules aligned with React’s tree—not always identical to raw DOM if portals are involved. Internally, React tracks paths through the fiber tree to invoke listeners in the correct order and can batch multiple `setState` calls per event using internal batching (now often extended via automatic batching in React 18+). Understanding delegation explains why `stopPropagation` timing can differ from expectations and why passive scroll/touch listeners interact with browser defaults. For advanced cases (e.g., DnD, capture-heavy handlers), developers sometimes attach native listeners on refs with careful cleanup.

```jsx
function Form() {
  const onSubmit = (e) => {
    e.preventDefault(); // synthetic wrapper
  };
  return <form onSubmit={onSubmit}>{/* ... */}</form>;
}
```

---

## 8. What is the component instance tree vs the fiber tree vs the DOM tree?

**Component instances** (classes) or hook state live on fibers (`memoizedState` chains) but there is no separate “instance tree” for function components—only fibers. The **fiber tree** is React’s complete work structure including host components, composites, Suspense, and Offscreen nodes; it mirrors logical UI, not necessarily one-to-one with DOM due to fragments and portals. The **DOM tree** is the browser’s live nodes—only host fibers (`div`, `span`) map directly, and portals attach elsewhere. Mismatches between fiber and DOM cause hydration warnings. DevTools presents a component-centric view closer to developer mental models, while reconciler internals require fiber thinking. Misunderstanding this leads to confusion about where state lives and why sibling portals behave differently in event bubbling. Strict Mode double-invoking render in development further blurs intuition: effects and renders may run twice to surface impure patterns, but the fiber tree is still the authoritative structure for reconciliation. When debugging “which component owns this DOM node,” `__reactFiber$...` internals in dev builds point back to fibers, not to conceptual class instances. Architectural discussions should keep these layers distinct: business logic often maps to component boundaries, while performance work often targets fibers and host nodes.

---

## 9. How does React implement state queuing and batching internally?

Functional updates enqueue on `updateQueue` with a circular linked list of **update objects** carrying `lane` masks and payload. Hooks store state on `memoizedState` with their own queues; `dispatch` pushes updates and schedules render. React 18+ **automatic batching** merges updates from promises, timeouts, and native handlers in many cases, reducing intermediate renders. Internally, batching is tied to `eventTime` and lane entanglement: multiple updates in the same event often collapse. `flushSync` opts out for synchronous DOM reads. Concurrent mode may apply partial updates only after commit boundaries—another reason render must stay pure.

```js
function reducer(state, action) {
  switch (action.type) {
    case "inc":
      return state + 1;
    default:
      return state;
  }
}
```

---

## 10. How does useEffect scheduling actually work under the hood?

`useEffect` creates a `Passive` effect on the fiber; during commit, React appends it to `pendingPassiveEffects`. After paint, `flushPassiveEffects` walks the list, invokes destroy functions from the previous commit, then create functions. Effects are **sorted** in tree order for predictable cleanup semantics. `useLayoutEffect` runs synchronously after DOM mutations but before paint, hence blocking—disallowed on the server. The dependency array is compared with `Object.is` on each slot; stale closures are a common pitfall when callbacks capture mutable objects without listing derived primitives. For expensive subscriptions, patternize with cleanup and gate on connection state. Understanding ordering prevents bugs where layout reads occur before passive network I/O mutates DOM.

```jsx
useEffect(() => {
  const ctrl = new AbortController();
  fetch("/api/x", { signal: ctrl.signal }).then(/* ... */);
  return () => ctrl.abort();
}, [id]);
```

---

## 11. How does Suspense work internally (throwing promises)?

When a child suspends (lazy component or data fetch with a compatible cache), React **throws a thenable** during render to signal incompleteness. The nearest Suspense boundary catches it, schedules retry when the promise resolves, and can show fallback UI depending on priority (e.g., avoid hiding already-visible content with `useTransition`). The fiber for the boundary tracks flags and retries with coordinated lanes. This contrasts with error boundaries which catch errors, not promises. Client-side cache integrations must ensure referential stability and deduplication to avoid request storms. Misusing throw breaks purity expectations—only vetted patterns should suspend.

```jsx
const Lazy = React.lazy(() => import("./Heavy"));

function View() {
  return (
    <React.Suspense fallback={<Spinner />}>
      <Lazy />
    </React.Suspense>
  );
}
```

---

## 12. How does React handle error boundaries internally (try/catch in rendering)?

Error boundaries are class components implementing `componentDidCatch` or `static getDerivedStateFromError`. During render, if a child throws, React unwinds to the nearest boundary fiber, simulating try/catch around user code without catching in async or event handlers outside React’s render path. The boundary schedules an update with captured error info; commit still runs for siblings when possible depending on the throw site. Functional components cannot yet be error boundaries natively—wrapper classes remain the pattern. Logging side effects belong in `componentDidCatch`, not render. Boundaries do not catch errors in `useEffect`, async callbacks, or server components errors mapped to different mechanisms.

```jsx
class Boundary extends React.Component {
  state = { err: null };
  static getDerivedStateFromError(err) {
    return { err };
  }
  componentDidCatch(err, info) {
    report(err, info);
  }
  render() {
    return this.state.err ? <Fallback /> : this.props.children;
  }
}
```

---

## 13. How do React Server Components work at the protocol/wire level?

React Server Components (RSC) execute on the server and stream a **serialized component tree** to the client without shipping component function bodies for server-only modules. The wire format (often called **Flight**) carries module references, props, and instructions to reconstruct UI on the client with streaming chunks. Client components are interleaved as markers requiring hydration boundaries. Data fetching co-located in server components avoids client waterfalls but couples deployment to a compatible bundler/runtime. The protocol is versioned; frameworks like Next.js encapsulate endpoints (`/_next/rsc` patterns) handling POST for navigations with router state. Wire payloads are typically **binary or length-prefixed text streams**, not REST JSON—clients must use framework-provided decoders that understand module graph wiring. Authentication cookies and headers flow through server fetches, so transport security (TLS, SameSite cookies) remains central. Custom integrations must align React version, bundler Flight plugin, and server runtime—skew breaks deserialization.

---

## 14. How does the RSC payload format work (Flight protocol)?

Flight serializes tree updates as a sequence of **rows**: module loads, JSON-like props (with special types), and commands to instantiate client components. Shared references deduplicate across rows for efficiency. Streaming allows early bytes to flush HTML-like structure while async data resolves. Security relies on **trusted serialization** boundaries—never pass untrusted input into props without validation. Debugging Flight payloads requires tooling awareness; raw streams are not human-friendly JSON. Evolution of the format is why coupling app code to a specific framework version matters during upgrades. Special types (dates, bigints, typed arrays) may use tagged encodings—client decoders revive them consistently with server encoders. Circular references and large binary blobs are handled via references rather than deep JSON duplication. When multiple navigations overlap, **payload merging** rules determine how rows append to existing client caches—frameworks hide this, but debugging race conditions requires knowing streams are incremental.

---

## 15. How does streaming SSR work with progressive hydration?

Streaming SSR emits HTML in chunks as Suspense boundaries resolve on the server, sending earlier segments to the browser sooner, improving TTFB and LCP for above-the-fold content. Hydration can proceed **incrementally** as markup arrives, attaching listeners boundary-by-boundary rather than waiting for the full document. This reduces Time to Interactive variance but complicates global script ordering—module graphs must align with streamed segments. Mismatched Suspense keys between server and client break hydration. The approach pairs well with edge runtimes that support streaming responses. **Backpressure** matters: slow clients should not cause unbounded server buffers—servers must handle write stalls and timeouts. Progressive hydration interacts with third-party scripts; if a global blocks parsing, early HTML may paint without interactivity. Testing should include slow 3G and CPU throttling to observe partial hydration ordering. SEO crawlers vary in executing JavaScript—ensure critical content appears in streamed HTML, not only post-hydration.

---

## 16. How does selective hydration prioritize interactive elements?

React can **prioritize hydrating** subtrees that the user interacted with or that are flagged urgent, deferring deep offscreen trees—implementation details vary by bundler integration. Event replay may queue inputs until hydration completes for targeted regions. This improves interactivity metrics when large pages hydrate lazily. Developers should mark critical UI paths and avoid giant single roots without Suspense splits. Testing real mobile hardware remains necessary because scheduling differs across browsers.

```jsx
// Split work so selective hydration has boundaries to target
<Suspense fallback={<Shell />}>
  <Main />
</Suspense>
```

---

## 17. What is the React Compiler doing at the AST level?

The React Compiler (formerly React Forget) performs **static analysis** on components and hooks to infer immutable value flow and effect dependencies, inserting automatic memoization and effect scheduling hints at compile time. It reasons about JavaScript semantics conservatively: mutation, closures, and dynamic property access constrain optimizations. At AST level, it tracks **reactive scopes**—regions of code that should rerun when specific state changes—and lifts computations accordingly. The goal is to remove manual `useMemo` noise without changing runtime semantics. When analysis is uncertain, it bails out, preserving correctness over performance. Integration with **TypeScript** or Flow types can refine analysis, but plain JS receives the same conservative treatment. The compiler emits **instrumentation hooks** in dev builds for debugging, similar to how Babel plugins annotate source maps. Library authors should expose stable, side-effect-free component APIs to maximize optimization coverage—imperative ref manipulation in render still blocks analysis.

---

## 18. How does the compiler's auto-memoization differ from manual React.memo/useMemo?

Manual memoization is **referential** and developer-driven: you specify dependencies and hope they are stable. Compiler-generated memoization is **provenance-based**, tying cached values to inferred reactive inputs, potentially finer-grained than a single `useMemo` block. `React.memo` still compares props shallowly unless custom compare; the compiler may split computations inside a component without wrapping the whole export. Edge cases differ: manual hooks allow intentional side effects in memo bodies (discouraged), while compiler assumes purer patterns. Teams should still profile: compiler reduces overhead but does not fix algorithmic complexity.

```jsx
function Price({ items, tax }) {
  // Compiler may auto-cache pure derivations
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  return <output>{(subtotal * (1 + tax)).toFixed(2)}</output>;
}
```

---

## 19. How does React handle concurrent rendering without tearing?

**Tearing** is when UI reads inconsistent state during concurrent updates. React mitigates this by ensuring commits are atomic per fiber subtree for a given lane set and by encouraging **concurrent-safe** patterns: `useSyncExternalStore` for external stores snapshots, avoiding mutable module-level singleton reads during render, and using `startTransition` to mark non-urgent updates. Third-party state libraries must provide consistent getServerSnapshot/getSnapshot pairs. If a store mutates outside React between reads, tearing can still occur—discipline at integration boundaries is essential.

```jsx
const slice = useSyncExternalStore(store.subscribe, store.getSnapshot, serverSnap);
```

---

## 20. What is the concept of transitions and how does the priority model handle them?

`startTransition` wraps updates as **transition** lane work, allowing React to keep input responsive by interleaving urgent updates (typing) with deferred rendering of heavy lists. `useTransition` exposes pending state for UX. Transitions may show stale UI until ready unless paired with Suspense or `useDeferredValue`. They differ from `setTimeout` because they integrate with lane scheduling and can be interrupted coherently. Overusing transitions for everything delays consistency; underusing them causes jank on large views.

```jsx
const [isPending, start] = useTransition();
function onChange(e) {
  setQ(e.target.value); // urgent
  start(() => setHeavyFilter(e.target.value)); // deferred
}
```

---

## 21. How to design a plugin architecture in React?

A robust plugin system treats UI as **composition of capabilities** registered at runtime: define a narrow plugin interface (metadata, routes, reducers, optional React nodes), a registry with dependency ordering, and sandboxed execution for untrusted plugins (iframe or worker). Provide **context** for shared services (telemetry, auth) and enforce versioned contracts. Server-side plugins for RSC require secure evaluation boundaries—prefer compile-time inclusion over arbitrary `eval`. For large orgs, combine feature flags with lazy `import()` per plugin to cap bundle size. Trade-offs: flexibility versus test matrix explosion; mitigate with conformance tests and plugin isolation stories.

```jsx
const PluginContext = createContext(null);
function App({ plugins }) {
  const registry = useMemo(() => buildRegistry(plugins), [plugins]);
  return (
    <PluginContext.Provider value={registry}>
      {registry.slots.header.map((P, i) => (
        <P key={i} />
      ))}
    </PluginContext.Provider>
  );
}
```

---

## 22. How to build a form library from scratch?

Model forms as **field controllers** connecting value, touched state, errors, and async validation with a central reducer or finite-state machine. Support controlled/uncontrolled hybrids via refs for performance. Integrate schema validation (Zod/Yup) with cancellable async checks. Expose composable primitives (`Field`, `Form`, `useField`) rather than one mega-component. Accessibility requires explicit `aria-describedby`, `aria-invalid`, and focus management on submit errors. For React 19, leverage `useActionState` / form actions where appropriate to align client and server submission flows.

```jsx
function useTextField(name, schema) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(null);
  const onBlur = () => setError(schema.safeParse(value).error?.flatten());
  return { name, value, error, onChange: (e) => setValue(e.target.value), onBlur };
}
```

---

## 23. Implementing a design system with compound components and polymorphic components?

**Compound components** share implicit state via context (`Tabs`, `Tab`, `Panel`), preserving flexible DOM ordering while keeping APIs ergonomic. **Polymorphic** components accept an `as` prop forwarding refs and valid props for the underlying element (`as="button"` vs `as={Link}`). Implement `forwardRef` + `mergeRefs` patterns and distribute props with type utilities (`ComponentPropsWithoutRef`). Document tokens and motion at the theme layer; avoid prop explosion by splitting variants. Ensure tree-shaking by exporting leaf modules. Testing focuses on accessibility contracts—keyboard roving tabindex for composites.

```jsx
const TabsCtx = createContext();
function Tabs({ children, value, onChange }) {
  return <TabsCtx.Provider value={{ value, onChange }}>{children}</TabsCtx.Provider>;
}
function Tab({ id, children }) {
  const { value, onChange } = useContext(TabsCtx);
  const selected = value === id;
  return (
    <button aria-selected={selected} onClick={() => onChange(id)}>
      {children}
    </button>
  );
}
```

---

## 24. How to build a headless UI component library?

Headless libraries separate **behavior/styling**: expose state machines, ARIA wiring, and event handlers via hooks (`useListbox`), letting consumers style any markup. Stabilize APIs with versioned state reducers and controlled/uncontrolled modes. Ship tiny core bundles and optional adapters. Document z-index/focus traps for overlays. Testing includes axe and user-event flows. Compared to styled kits, integration effort shifts to product teams—provide recipes. Performance hinges on minimizing context churn; use `useMemo` for API objects or split contexts.

```jsx
function useDisclosure(initial = false) {
  const [open, setOpen] = useState(initial);
  return {
    open,
    toggle: () => setOpen((o) => !o),
    getButtonProps: () => ({ "aria-expanded": open, onClick: () => setOpen((o) => !o) }),
    getPanelProps: () => ({ hidden: !open }),
  };
}
```

---

## 25. Inversion of control pattern in React components?

IoC moves decision-making to parents via **render props**, children functions, or slot props: the shell handles layout/concerns; the parent injects content/strategy. Contrast with deep prop drilling of flags everywhere. Hooks can accept **strategies** (`sortFn`, `mapRow`) enabling test doubles. Over-application yields callback hell—balance with sensible defaults. For enterprise tables, expose plugin points for filters while owning state in a controller hook.

```jsx
function DataPanel({ header, children }) {
  return (
    <section>
      <header>{header()}</header>
      <div>{children}</div>
    </section>
  );
}
```

---

## 26. How to implement a micro-frontend architecture with Module Federation?

Use **Module Federation** in Webpack/Rspack to expose/remote bundles at runtime, sharing React singletons via `shared` config to avoid duplicate React copies. Define **routing integration**—either shell router delegating to micro-app routers or URL namespaces. Establish a **design token contract** and cross-app event bus sparingly (prefer shared backend APIs). CI must verify semver compatibility of shared libraries. Failure modes include version skew and stylesheet collisions—mitigate with shadow DOM only when necessary due to complexity. Observability should tag spans by micro-app name.

```js
// webpack.config excerpt
new ModuleFederationPlugin({
  name: "shell",
  remotes: {
    checkout: "checkout@https://cdn.example.com/remoteEntry.js",
  },
  shared: { react: { singleton: true }, "react-dom": { singleton: true } },
});
```

---

## 27. How to design a state management solution from scratch?

Start from **invariants**: single source of truth, predictable updates, devtools/time-travel optional. Choose reducer-centric architecture with middleware chain (logging, async) similar to Redux, or **signals**-style fine-grained subscriptions for performance. Expose `subscribe/getSnapshot` to integrate `useSyncExternalStore`. For async, model explicit states (`idle/loading/success/error`) per domain slice rather than booleans. Normalize relational data to avoid duplication. Document module boundaries for RSC compatibility—server state should not leak into client singletons blindly.

```js
function createStore(reducer, initialState) {
  let state = initialState;
  const listeners = new Set();
  return {
    getState: () => state,
    dispatch: (action) => {
      state = reducer(state, action);
      listeners.forEach((l) => l());
    },
    subscribe: (l) => (listeners.add(l), () => listeners.delete(l)),
  };
}
```

---

## 28. Event sourcing and CQRS patterns in React applications?

Treat UI as **projections** of an append-only event log: commands validate, events persist, reducers derive read models. In React, display **read models** via selectors; write paths dispatch commands through APIs. CQRS separates heavy query models from command validation services—useful for auditability. Client complexity grows—use optimistic UI with server-assigned event versions for conflict detection. Testing focuses on reducer purity given event sequences. For most CRUD apps, full ES/CQRS is heavy—adopt where compliance/analytics demands immutable history.

```jsx
function Timeline({ events }) {
  const projection = useMemo(() => fold(events, initialView), [events]);
  return <ul>{projection.items.map((i) => <li key={i.id}>{i.title}</li>)}</ul>;
}
```

---

## 29. How to implement real-time collaboration features?

Combine **operational transforms** or **CRDTs** for text/shape merges with presence channels (WebSocket/WebRTC). React layers should separate **transport** from components: hooks manage channel lifecycle, backoff, and reconnection. Render remote cursors via absolute positions in a canvas/svg layer. Conflict resolution UX requires clear attribution and undo boundaries. Performance demands throttling and batched state updates; consider workers for CRDT heavy lifting. Privacy requires end-to-end encryption decisions early—see question 84 for chat specifics.

```jsx
function useRoom(roomId) {
  const [peers, setPeers] = useState([]);
  useEffect(() => {
    const ws = new WebSocket(`/rooms/${roomId}`);
    ws.onmessage = (e) => setPeers((p) => merge(p, JSON.parse(e.data)));
    return () => ws.close();
  }, [roomId]);
  return peers;
}
```

---

## 30. Implementing an undo/redo system with immutable data structures?

Store **history stacks** of immutable snapshots or inverse patches; cap depth for memory. Use structural sharing (`immer`) to keep copies cheap. Scope undo to focused editors—not global app state—unless product demands otherwise. Coalesce micro-updates (typing bursts) via debounced commits to history. Testing ensures redo restores forward state identically. For concurrent editing, undo must be **causally aware**—often requires operational history instead of naive stacks.

```js
import { produce } from "immer";
function undoable(reducer) {
  let past = [];
  let future = [];
  return (state, action) => {
    if (action.type === "undo") {
      const prev = past.pop();
      if (!prev) return state;
      future.push(state);
      return prev;
    }
    const next = produce(state, (d) => reducer(d, action));
    past.push(state);
    future = [];
    return next;
  };
}
```

---

## 31. How to build a performant virtualized grid component?

**Window** only visible rows/columns with overscan buffers; measure dynamic row heights via cache and binary search. Separate **scroll containers** from content transforms (`transform: translateY`) to minimize layout thrash. Use `ResizeObserver` for container changes. For huge datasets, avoid per-cell React elements—render cells as lightweight memoized rows keyed by stable IDs. Integrate with concurrent features: defer offscreen work with transitions. Accessibility: preserve tab order semantics with tricky roving strategies or aria grid roles mirroring visible subset.

```jsx
function VirtualList({ items, rowHeight, height }) {
  const [scrollTop, setScrollTop] = useState(0);
  const start = Math.floor(scrollTop / rowHeight);
  const end = Math.min(items.length, Math.ceil((scrollTop + height) / rowHeight));
  const slice = items.slice(start, end);
  return (
    <div style={{ height, overflow: "auto" }} onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
      <div style={{ height: items.length * rowHeight, position: "relative" }}>
        {slice.map((item, i) => (
          <div key={item.id} style={{ position: "absolute", top: (start + i) * rowHeight, height: rowHeight }}>
            {item.title}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 32. How to design a notification system in React?

Centralize a **notification queue** with priorities, deduplication keys, and persistence policy (toast vs banner). Expose `notify({ level, message, action })` backed by context/reducer. Integrate **ARIA live regions** (`role="status"`/`alert`) for screen readers without stealing focus inappropriately. For cross-route notifications, hoist provider near root and sync with router transitions. Rate-limit noisy sources server-side; client backoff prevents UI storms. Telemetry tracks impressions/clicks for funnel analysis.

```jsx
const NotifyCtx = createContext(() => {});
function NotifyProvider({ children }) {
  const [items, setItems] = useState([]);
  const notify = useCallback((n) => {
    setItems((xs) => [...xs, { id: crypto.randomUUID(), ...n }]);
  }, []);
  return <NotifyCtx.Provider value={notify}>{children}</NotifyCtx.Provider>;
}
```

---

## 33. Implementing drag and drop from scratch?

Choose **pointer events** unified model for mouse/touch/pen with capture to track movement across DOM boundaries. Maintain a **ghost layer** (fixed positioned clone) for visuals while updating drop targets via hit-testing (`document.elementFromPoint`) or registered droppable rects for performance. Keyboard-accessible DnD requires explicit alternate flows—often a “Move” dialog. Integrate HTML5 DnD only if legacy needs exist—pointer approach is more consistent. React state updates should be batched; consider `flushSync` rarely for measuring. Test scroll containers and iframes carefully.

```jsx
function useDrag(item) {
  const ref = useRef(null);
  const onPointerDown = (e) => {
    ref.current?.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!ref.current?.hasPointerCapture(e.pointerId)) return;
    // update position
  };
  return { ref, onPointerDown, onPointerMove, onPointerUp: (e) => ref.current?.releasePointerCapture(e.pointerId) };
}
```

---

## 34. How to build a rich text editor integration?

Wrap proven engines (**ProseMirror**, **Slate**, **Lexical**) rather than building parsers from scratch—edge cases dominate. Expose **controlled schema** for allowed marks/nodes; sanitize pasted HTML server-side too. Map editor transactions to React state cautiously—large documents need debounced onChange or non-React internal state with thin bridges. Collaborative editing requires CRDT/OT integration as in question 29. Accessibility: expose `contenteditable` roles, toolbar roving tabindex, and selection announcements. Performance-sensitive paths should avoid re-rendering the full editor on every keystroke; instead, let the engine own document state and sync snapshots to React for toolbar/UI chrome. IME composition, Android keyboards, and clipboard APIs each introduce platform quirks that pure React patterns handle poorly without engine help. For SSR, avoid rendering `contenteditable` until hydrated—placeholder shells prevent hydration mismatches. Security reviews must cover paste handlers, linkification, and embedded media. Version your document schema and provide migrations for stored content so product iteration does not corrupt user documents.

```jsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

function RichEditor({ doc, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: doc,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });
  return <EditorContent editor={editor} />;
}
```

---

## 35. Multi-tenant application architecture in React?

Isolate tenants at **API, cache, and asset** layers; propagate `tenantId` from auth into data hooks. Avoid cross-tenant leakage in client caches by namespacing keys (`["user", tenant, id]`). Theming per tenant can use CSS variables toggled at root. For white-label domains, configure CSP and CORS per tenant at edge. RSC deployments should ensure server code cannot access another tenant’s secrets—enforce in data layer, not UI alone. Audit logs must include tenant context.

```jsx
const TenantContext = createContext(null);
export function useTenantQuery(key, fetcher) {
  const tenant = useContext(TenantContext);
  return useQuery([tenant, ...key], () => fetcher(tenant));
}
```

---

## 36. How to implement a robust caching strategy?

Layer caches: **HTTP** (CDN `Cache-Control`), **SWR/React Query** for client staleness with `stale-while-revalidate`, and **normalized stores** for relational data. Define explicit invalidation keys per mutation; avoid global busting. For RSC, align `fetch` caching semantics with tags where supported. Use ETags from APIs to minimize payloads. Document offline expectations separately—see question 39. Observability should track hit rates and stale reads.

```jsx
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, gcTime: 300_000 } },
});
```

---

## 37. How to handle optimistic updates with conflict resolution?

Apply **temporary UI mutations** while posting commands; on failure, roll back or branch. Track **versions** (`etag`/`updatedAt`) to detect conflicts—prompt merge or auto-rebase depending on domain. For collaborative domains, pair with CRDT/OT instead of naive retry. Testing must simulate race conditions. User messaging should clarify when data reverted. Keep server authoritative—optimistic layers are projections, not sources of truth.

```jsx
async function save(doc) {
  const prev = cache.get(doc.id);
  cache.set(doc.id, { ...doc, pending: true });
  try {
    const res = await api.put(doc, { headers: { "If-Match": doc.etag } });
    cache.set(doc.id, res);
  } catch (e) {
    if (e.status === 412) openConflictUI(prev, await api.get(doc.id));
    else cache.set(doc.id, prev);
  }
}
```

---

## 38. Implementing offline-first capabilities in React?

Use **service workers** with precache/app-shell and background sync for mutations queued in IndexedDB. Expose connectivity state and reconcile on reconnection with idempotent APIs. UI should communicate queued/pending clearly. Testing requires flaky network simulations. Pair with **CRDT** or careful merge for edits made offline concurrently by multiple devices. Security: encrypt IndexedDB at rest for sensitive apps.

```js
// sw.js (sketch)
self.addEventListener("fetch", (event) => {
  event.respondWith(caches.match(event.request).then((r) => r || fetch(event.request)));
});
```

---

## 39. How to build accessible components from scratch (ARIA patterns)?

Follow **WAI-ARIA Authoring Practices**: roving `tabindex` for toolbars/tabs, correct roles (`listbox`, `dialog`), labelled-by relationships, focus traps with escape hatches. Manage focus on open/close transitions. Do not overload `div` clicks without keyboard equivalents. Test with screen readers and **axe** in CI. Remember internationalization impacts aria labels. Performance: avoid rerendering entire lists on focus moves—use delegated handlers.

```jsx
<button aria-expanded={open} aria-controls="menu" id="menu-button" onClick={() => setOpen(!open)}>
  Menu
</button>
<ul id="menu" role="menu" hidden={!open} aria-labelledby="menu-button">
  <li role="menuitem">Copy</li>
</ul>
```

---

## 40. Composition vs inheritance - advanced patterns with React 19?

React favors **composition** (`children`, slots, hooks) over class inheritance; cross-cutting concerns use HOCs sparingly and hooks preferably. **Render props** and **compound components** replace fragile subclass overrides. With RSC, compose server and client boundaries explicitly—never inherit across the network. Inheritance still appears in domain models outside React—keep UI trees shallow. Mixins are obsolete; use hooks or utility modules.

```jsx
function Shell({ nav, main }) {
  return (
    <div className="layout">
      <aside>{nav}</aside>
      <section>{main}</section>
    </div>
  );
}
```

---

## 41. How to conduct a performance audit of a React application?

Start with **lab metrics** (Lighthouse/Web Vitals) and **field** RUM—correlate CLS/LCP/INP with releases. Profile React with **Profiler API** and Chrome Performance: mark long tasks, layout thrash, and scripting hotspots. Inspect unnecessary re-renders via `why-did-you-render` in staging only. Map network waterfalls: server HTML, JS chunks, data fetches post-hydration. Prioritize fixes by user impact and cost: code splitting and image optimization often beat micro memoization. Document baseline budgets before refactors.

```jsx
import { Profiler } from "react";
function onRender(id, phase, actualDuration) {
  if (actualDuration > 16) console.warn(id, phase, actualDuration);
}
<Profiler id="Page" onRender={onRender}>
  <Page />
</Profiler>;
```

---

## 42. Explain the React profiler flame graph and ranked chart?

The **flame graph** shows component render times in tree order—wide blocks indicate costly subtrees; nesting reveals ancestors. The **ranked** chart sorts components by self time to spotlight hot leaves independent of structure. Interpretation requires distinguishing mount vs update and dev vs prod builds (dev is slower). Combine with Chrome tracing to see JS vs layout vs paint. Use commits comparison to spot regressions between branches. A wide parent in the flame graph may be “cheap” itself but still trigger expensive children—ranked view then shows whether leaves or parents dominate. Conversely, a deep narrow spike suggests a specific subtree algorithm is hot. Profiling captures React’s phase timing, but not network or layout thrash outside React unless you correlate timestamps. Record baseline profiles before optimization work; micro-optimizations to a 2ms component rarely matter when a single layout read costs 20ms. Synthetic interactions in tests rarely reproduce production data shapes, so supplement profiler data with RUM for real navigation paths.

```jsx
// Profiler reports: id, phase ("mount" | "update"), actualDuration, baseDuration
function onRender(id, phase, actualDuration, baseDuration) {
  performance.measure(`${id}:${phase}`, { detail: { actualDuration, baseDuration } });
}
```

---

## 43. How to identify and fix React rendering waterfalls?

Waterfalls occur when **data dependencies serialize**—child fetches wait for parent fetch completion. Fix by hoisting fetches to parallel routes/loaders, using `Promise.all`, or RSC colocated `fetch` with HTTP caching. For client apps, prefetch on navigation hover, split routes with `lazy`, and lift queries to layout level. Suspense boundaries help UX but do not remove network latency without parallelization. Visualize with network panels aligned to React commit markers.

```jsx
// Waterfall anti-pattern
function Parent() {
  const { data: a } = useSWR("/a");
  return a ? <Child a={a} /> : null;
}
function Child({ a }) {
  const { data: b } = useSWR(`/b?for=${a.id}`);
  return <div>{b}</div>;
}
```

---

## 44. Advanced memoization strategies beyond React.memo?

Employ **selector memoization** (`reselect`/`proxy-memoize`), **stable action creators**, and **structural sharing** in stores. Split contexts to avoid broad consumers. Use **lazy state initialization** `useState(() => expensive)` to avoid work each render. For lists, **windowing** beats memo of huge arrays. Compiler (Q17–18) can automate local derivations. Avoid memoizing cheap pure math—measure first.

```js
import { createSelector } from "reselect";
const selectCartTotal = createSelector(
  (s) => s.items,
  (items) => items.reduce((n, i) => n + i.price * i.qty, 0)
);
```

---

## 45. How does the React Compiler eliminate the need for manual memoization?

By proving which bindings depend on which state/props, the compiler inserts **automatic caching** of pure computations and stabilizes references where safe, shrinking re-render fan-out without developers listing dependencies manually. It does not change Big-O complexity or fix unstable props from parents—those still trigger work. Adoption requires supported build pipelines and lint rules acknowledging compiler constraints. Teams should delete redundant `useMemo` after verification to reduce noise. The compiler’s analysis is conservative: dynamic property access, mutation, or patterns that defeat static analysis force bailouts, leaving performance unchanged relative to pre-compiler code. Compared to `React.memo`, which memoizes whole component outputs based on props shallow compare, compiler granularity can track internal expressions even when props identities fluctuate, provided dependencies are proven stable. Interop with non-React libraries requires attention: refs and imperative APIs may inhibit optimization unless wrapped in stable patterns. Long-term, the goal is fewer footguns where developers forget dependency arrays or over-memoize; short-term, teams should treat compiler adoption as a migration with profiling gates.

---

## 46. How to implement efficient state selectors to prevent cascading re-renders?

Narrow subscriptions: derive **per-component selectors** from normalized stores, memoized with referential stability. With Zustand/Redux, use `shallow` comparisons or `useStore(selector, shallow)`. Avoid returning new objects from selectors unless memoized. For Context, split providers or use context selectors via third-party helpers. Profile to ensure selector evaluation itself is not hot.

```jsx
const name = useStore((s) => s.users[uid]?.name, shallow);
```

---

## 47. Techniques for optimizing React context with state slicing?

Replace single mega-context with **multiple providers** scoped by domain, or adopt **context selectors** libraries that subscribe to derived values. Memoize provider values with `useMemo` and stable dispatch functions with `useCallback`. For high-frequency updates (animations), prefer external stores with `useSyncExternalStore` instead of context. Anti-pattern: storing derived data in context updated every frame.

```jsx
const ThemeCtx = createContext();
const ThemeDispatch = createContext();
export function useThemeToken(name) {
  const t = useContext(ThemeCtx);
  return t[name];
}
```

---

## 48. How to implement progressive loading and rendering strategies?

Combine **route-based** and **component-based** code splitting, prioritize critical CSS, defer third-party scripts, and stream SSR segments. Use `Suspense` fallbacks tuned to skeleton UIs—not spinners everywhere. Prefetch next routes after idle (`requestIdleCallback`). For data, stagger queries with priorities (`useTransition`). Measure LCP improvements when hero image prioritized via `fetchpriority`.

```jsx
const Chart = lazy(() => import("./Chart"));
function Page() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <Chart />
    </Suspense>
  );
}
```

---

## 49. Memory management in long-lived React applications?

Avoid **retained closures** over large objects in long-lived effects; clear subscriptions and timers. Virtualize huge lists to prevent massive fiber/DOM memory. Detach global caches on route changes where safe. Use heap snapshots to find detached DOM nodes retained by accidental references. For SPAs open for days (kiosks), schedule periodic soft reloads if acceptable. Module-level singletons that accumulate data across navigations are a frequent source of unbounded growth—scope caches to session or use LRU eviction. Charting and map libraries often retain WebGL contexts or canvases; unmount paths must call `dispose` APIs when provided. React itself does not garbage-collect your domain objects; if state trees mirror large API payloads, normalize and prune aggressively. Memory pressure on mobile browsers can evict background tabs—design recovery paths that refetch rather than assuming in-memory caches are valid forever. Profiling should include repeated route transitions to catch climbing retained size.

```jsx
// Prefer scoped cache invalidation on route change
useEffect(() => {
  return () => queryClient.removeQueries({ queryKey: ["page", pageId] });
}, [pageId, queryClient]);
```

---

## 50. How to detect and fix memory leaks in React?

Chrome Memory profiler: **detached nodes** indicate leaks; **allocation timelines** during repeated navigations reveal growth. Common causes: forgotten `addEventListener`, `setInterval`, retained `AbortController` references, or caches without eviction. Fixing means pairing effects with cleanup, weak maps for auxiliary caches, and bounded LRU structures. Third-party libraries may leak—upgrade or patch.

```jsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);
```

---

## 51. How to implement Web Workers for CPU-intensive operations in React?

Offload heavy computation to workers via **Comlink** or raw `postMessage` with transferable buffers for large arrays. Keep React state updates on main thread—workers return compact results, not massive graphs. Type data as `ArrayBuffer` to avoid structured clone costs. For image processing, consider WASM inside workers. Testing requires worker mocks in Jest. UX should show progress messages via `postMessage` streams.

```js
// worker.js
self.onmessage = (e) => {
  const result = heavy(e.data);
  self.postMessage(result);
};
```

```jsx
function useWorkerCompute() {
  const ref = useRef();
  useEffect(() => {
    ref.current = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
    return () => ref.current.terminate();
  }, []);
  return ref;
}
```

---

## 52. Service Worker integration patterns with React?

Register SW from entry client after load to avoid blocking FCP; version assets with hashed filenames. Use **Workbox** strategies: stale-while-revalidate for APIs with caution. Communicate via `BroadcastChannel` to React hooks for update notifications. Ensure HTTPS and careful cache busting to prevent stale bundles breaking hydration. Provide user prompts when new SW activates. The registration promise should handle `navigator.serviceWorker.controller` state: first visit may have no controlling worker until reload—UI copy should not assume immediate offline support. Coordinate cache updates with app version headers so API responses do not silently mix old JS with new schemas. For SPAs, `skipWaiting` plus `clients.claim` forces fast takeover but can surprise users mid-session—often better to prompt. Testing service workers requires controlled cache clears; automate in CI with Playwright contexts. Error reporting should tag SW version to diagnose split-brain caches.

```jsx
useEffect(() => {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/sw.js").then((reg) => {
    reg.addEventListener("updatefound", () => {
      const nw = reg.installing;
      nw?.addEventListener("statechange", () => {
        if (nw.state === "installed" && navigator.serviceWorker.controller) setUpdateReady(true);
      });
    });
  });
}, []);
```

---

## 53. Advanced code splitting - granular chunk strategies?

Tune split points: **vendor** chunks for stable libraries, **route** chunks per page, **feature** chunks for heavy modules. Avoid excessive fragmentation raising HTTP overhead on HTTP/1.1—HTTP/2 mitigates but not entirely. Use dynamic `import()` with webpack magic comments `webpackChunkName` for grouping. Analyze bundles with `webpack-bundle-analyzer`. Preload critical chunks via `<link rel="modulepreload">` when router predicts navigation.

```js
const Admin = lazy(() => import(/* webpackChunkName: "admin" */ "./Admin"));
```

---

## 54. How to optimize hydration performance for SSR apps?

Reduce JS needed to hydrate: push more static content server-only via RSC, shrink event handlers with progressive enhancement where viable. Avoid mismatch by consistent `Date`/`Random` handling—gate client-only values in `useEffect`. Split hydration with Suspense boundaries and selective hydration (Q16). Minimize context depth before leaves. Use `hydrateRoot` concurrent APIs appropriately in React 18+.

```jsx
export function ClientClock() {
  const [now, setNow] = useState(null);
  useEffect(() => setNow(new Date().toISOString()), []);
  return <span>{now ?? "--"}</span>;
}
```

---

## 55. How to implement streaming rendering with out-of-order Suspense boundaries?

Server resolves boundaries independently; HTML chunks may arrive non-sequentially relative to initial skeleton. Client reconciler must handle **partial trees**—ensure keys stable and fallbacks meaningful. Framework integration typically manages stream ordering—custom setups need rigorous tests. Avoid coupling global styles to late-arriving content without reserving space to reduce CLS. Out-of-order completion means user-visible content may appear before sibling regions—design fallbacks so layout does not jump when a “lower” section resolves first. Streaming also interacts with `<head>` resource hints: late-discovered assets can delay LCP if hero content waited behind unrelated boundaries. For custom RSC/streaming setups, verify ordering of script injection so hydration chunks align with HTML segments. Fuzz testing with variable latency backends exposes race conditions in client assumptions. Document loading states per boundary so UX stays coherent when only part of the page is interactive.

---

## 56. Optimizing React Native for complex animations (if cross-platform)?

Prefer **Reanimated** worklets on UI thread to avoid JS bridge jank; minimize shadow recalculations and enable `shouldRasterizeIOS` sparingly. Batch layout reads; avoid `setState` per frame. Profile with Flipper and native instruments. For shared React web, remember RN layout differs—measure accordingly. Layout thrash from alternating `measure` and `setState` is a common pattern in gesture-driven UIs—read once per frame, write once. New Architecture (Fabric) changes threading characteristics; benchmark on target devices, not only simulators. Image decoding and blur views are expensive—cache sizes and prefer pre-scaled assets. Animations crossing the JS bridge every frame will lose to 60fps targets on mid-tier Android; move interpolation to native drivers. When sharing hooks between web and native, guard DOM-specific assumptions and test pointer vs touch lifecycles separately.

```jsx
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

function Knob() {
  const x = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(x.value) }],
  }));
  return <Animated.View style={style} />;
}
```

---

## 57. React and WebAssembly integration?

Load WASM modules asynchronously; expose narrow typed interfaces. Keep React state updates coarse-grained—WAM inside `useEffect` or workers. Transfer large buffers efficiently. Security: compile with safe toolchain flags; validate inputs crossing the boundary.

```js
const wasm = await WebAssembly.instantiateStreaming(fetch("/mod.wasm"));
export function runWasm(x) {
  return wasm.instance.exports.compute(x);
}
```

---

## 58. Database query optimization for React Server Components?

Co-locate queries but add **indexes** server-side, avoid N+1 via joins/batching, and tag-fetch for deduplication. Use connection pooling in server runtime. Measure TTFB vs DB latency—RSC shifts work serverward, shifting bottlenecks to databases. Cache query results with HTTP semantics where safe. DataLoader-style batching helps when multiple components request the same entity by ID in one request tree. Watch transaction isolation: long-held connections during streaming can exhaust pools under load—tune timeouts and split read replicas for heavy reads. Explain plans should be reviewed for hot routes; ORMs make it easy to accidentally fetch wide rows. For multi-tenant apps, ensure every query includes tenant predicates—indexes should align with those filters. Observability: trace DB spans alongside RSC flight generation to see whether CPU serialization or query latency dominates.

```js
// Example: single round-trip for many IDs (sketch)
async function loadUsers(ids) {
  return db.user.findMany({ where: { id: { in: ids } } });
}
```

---

## 59. How to implement incremental static regeneration patterns?

In frameworks like Next, use **ISR** to rebuild pages post-deploy on a TTL, serving stale while regenerating. For custom stacks, edge functions trigger rebuild jobs and purge CDN keys. Ensure **consistent reads** during regeneration—coordinate database snapshots if needed. Test cache invalidation thoroughly—stale legal content can be risky. On-demand revalidation hooks let you bypass TTL when content editors publish—wire CMS webhooks to purge paths. Traffic spikes during regeneration can stampede origins; use locks or single-flight regeneration per path. For personalized pages, ISR rarely fits—use SSR or edge personalization instead. Monitor error rates during background regeneration: a failing build should not poison cache forever; fall back to last good artifact and alert. Document which paths are static versus eventually consistent so support teams interpret user reports correctly.

```js
// Next.js App Router: on-demand revalidation (conceptual)
// await fetch(`https://site.com/api/revalidate?path=/blog/${slug}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
```

---

## 60. Measuring and optimizing Time to Interactive and Core Web Vitals?

TTI correlates with long tasks and hydration cost—reduce JS execution and split work. **LCP**: optimize hero image, server render critical markup, preconnect origins. **INP**: minimize input latency via efficient event handlers, `passive` listeners where appropriate, avoid synchronous `flushSync`. **CLS**: reserve space for media/ads, avoid inserting banners above content. Continuous RUM with attribution to releases catches regressions early.

```js
new PerformanceObserver((list) => {
  for (const e of list.getEntries()) console.log("LCP", e.startTime);
}).observe({ type: "largest-contentful-paint", buffered: true });
```

---

## 61. How to architect a React application for scale (100+ developers)?

Enforce **bounded contexts** in monorepos, strict **API layers**, and **design system** governance. Routing and state conventions per vertical team reduce collisions. Automated **linting**, **typechecking**, and **visual regression** in CI. Document **ADR** decisions. Feature flags decouple deploy from release. Onboarding relies on exemplar apps and codemods. Communication overhead is real—invest in tooling over headcount alone. At this scale, **ownership boundaries** matter more than framework choice: teams need clear packages with published APIs and deprecation policies. Central platform squads maintain bundler, testing, and release trains; product squads ship features without forking core infra. RFC processes for cross-cutting changes prevent twenty divergent state libraries. Incident response includes frontend-specific runbooks—bad deploys, CDN misconfig, client error spikes. Diversity of skill levels demands progressive disclosure documentation: quickstarts for new hires, deep dives for staff engineers. Quarterly dependency upgrades beat annual big-bang migrations.

```text
apps/
  checkout/
  account/
packages/
  ui/           # design system
  api-client/   # generated from OpenAPI
  telemetry/
```

---

## 62. Monorepo strategies for React (Turborepo, Nx)?

Use **workspace protocol** (`pnpm`/`yarn`) for internal packages, **remote caching** for CI speed, and **affected** commands to limit tests/builds. Define **project graph boundaries** with lint rules (Nx tags). Share `tsconfig` bases and ESLint configs. Balance granularity—too many tiny packages slows velocity; too few creates coupling. Turborepo pipelines excel at task orchestration; Nx adds deeper generators and enforcement.

```json
{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test": { "dependsOn": ["^build"] }
  }
}
```

---

## 63. How to implement a CI/CD pipeline for a React monorepo?

Stages: **install**, **lint/types**, **unit**, **integration**, **visual**, **build**, **deploy** artifacts to CDN with immutable hashes. Cache dependencies and build outputs via remote cache. Gate main with green checks; use preview deployments per PR. Smoke test critical flows with Playwright. Secret scanning and SBOM generation increasingly expected. Parallelize jobs by package affected graph. Branch protection should require passing checks and reviewed PRs; **merge queues** serialize merges to catch integration failures that parallel PRs miss. Artifact promotion from staging to production via tagged releases preserves traceability. DORA metrics improve when lead time for changes drops—optimize CI wall-clock before adding more tests blindly. For mobile or desktop shells embedding web views, add a minimal **smoke bundle** job that loads critical routes. Rollback strategy: immutable CDN assets plus feature flags beat redeploy latency alone.

```yaml
# Illustrative job order (GitHub Actions style)
jobs:
  lint: { runs-on: ubuntu-latest, steps: [checkout, pnpm i, lint] }
  test: { needs: [lint], strategy: { matrix: { shard: [1, 2, 3, 4] } } }
  build: { needs: [test], steps: [turbo run build --filter=...[HEAD^1]] }
  deploy: { needs: [build], if: github.ref == 'refs/heads/main' }
```

---

## 64. Feature flag architecture and gradual rollouts?

Centralize flags with **typed definitions**, evaluation contexts (`userId`, `tenant`), and kill switches. Avoid importing flag SDK in hot paths without caching evaluations. For React, hydrate flags server-side to prevent flicker; fall back to safe defaults offline. Audit flag changes—stale flags become debt. Combine with metrics to auto-rollback on error rate spikes.

```jsx
function Checkout() {
  const on = useFlag("newCheckout");
  return on ? <CheckoutV2 /> : <CheckoutV1 />;
}
```

---

## 65. A/B testing infrastructure in React?

Assign users deterministically via hashed IDs to avoid bias; expose variants through provider. Prevent **flash of wrong variant** by resolving server-side when possible. Instrument key metrics tied to experiments; use statistical methods to avoid peeking pitfalls. Privacy: disclose tracking; minimize PII in assignment logs. Coordinate with feature flags to avoid interaction explosions. **Exposure** events must fire once per session per experiment—double-counting breaks analysis. Holdout groups preserve long-term baselines when shipping many concurrent tests. For RSC, assignment should occur before streaming meaningful HTML so users do not see control then treatment after hydration. Guardrails: auto-disable variants that spike errors or crash rates. Document interaction effects when checkout and homepage tests overlap. Statistical rigor often requires data science partnership—engineering owns instrumentation quality.

```jsx
function Experiment({ name, children }) {
  const variant = useAssignment(name); // stable per user, SSR-resolved
  return <VariantContext.Provider value={variant}>{children}</VariantContext.Provider>;
}
```

---

## 66. How to implement canary deployments for React apps?

Route small traffic percentages to new CDN version via load balancer or edge rules; monitor golden signals—errors, latency, business KPIs. Automatic rollback on SLO breach. Ensure database migrations are backward compatible during canary. Client caches may stick—use versioned filenames to guarantee fresh bundles. **Sticky sessions** can trap users in canary while others see stable—decide intentionally whether stickiness aids debugging or harms fairness. API compatibility matters: old JS bundles may call new endpoints during rollout—version APIs or maintain dual handlers briefly. Synthetic checks from multiple regions catch CDN misroutes. Pair canary with **dark launches** where new code paths execute server-side without user-visible changes first. Communicate blast radius: a bad React bundle can blank-screen users—feature flags inside bundles add defense in depth.

---

## 67. CDN strategies and edge rendering with React?

Serve static assets with **long cache** and **immutable** naming; HTML shorter TTL. Edge SSR/RSC places compute near users—watch cold start costs and regional data residency. Purge selectively on deploy. Use `stale-while-revalidate` for semi-static HTML cautiously when personalization is low. **Cache key** design must include `Accept-Language`, auth cookies, or device class when responses vary—misconfiguration leaks one user’s HTML to another. Brotli at the edge reduces JS transfer; ensure origin supports compression negotiation. For global apps, measure TTFB from PoPs versus origin-only paths. Purge APIs should be idempotent and authenticated—accidental open purge endpoints are incident bait. When mixing static and dynamic at the edge, document which routes are **soft-static** (revalidated) versus truly dynamic.

```http
Cache-Control: public, max-age=31536000, immutable
# hashed app.[contenthash].js
```

---

## 68. How to handle multi-region deployment?

Deploy apps and data replicas close to users; configure **global load balancing** with health checks. For writes, choose latency trade-offs (single leader vs CRDT). Session affinity interacts with canaries—validate stickiness. RSC/SSR must respect data residency—route requests to compliant regions. **GeoDNS** routes users to nearest healthy region; failover plans should include DNS TTL awareness—long TTLs slow failover. Data replication lag means users may read stale reads cross-region; product copy should acknowledge eventual consistency where relevant. Secrets and encryption keys need regional scope—avoid a single KMS in one region for global traffic. Compliance (GDPR, etc.) may forbid processing certain users outside home region—edge alone does not solve sovereignty if data still round-trips. Chaos testing regional outages validates that React clients degrade gracefully with cached shells and retry UX.

---

## 69. Security considerations in React - XSS prevention, CSP, sanitization?

Never `dangerouslySetInnerHTML` without **sanitize** libraries tuned for your markup subset. Default to **escaping** text nodes. CSP (`Content-Security-Policy`) limits script sources—avoid inline scripts or use nonces/hashes. Validate URLs before passing to `href`/`src` to block `javascript:` vectors. Third-party widgets may break strict CSP—plan allowances. Keep dependencies updated; supply chain attacks are rising.

```jsx
import sanitizeHtml from "sanitize-html";
function Preview({ html }) {
  return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
}
```

---

## 70. How to implement Content Security Policy with React?

Generate **per-request nonces** in SSR, threading nonce into `<script nonce>` and `hydrateRoot` container. Avoid `unsafe-inline` in production. For SPAs, configure dev servers separately. Test violations via `Content-Security-Policy-Report-Only` before enforcing. Hash only for static inline chunks if unavoidable. **Third-party scripts** (analytics, chat widgets) often conflict with strict CSP—negotiate `script-src` lists or use tag managers that support nonce propagation. Inline styles from CSS-in-JS may require `'unsafe-inline'` for `style-src` unless using nonce/hash strategies per library—evaluate Emotion/styled-components CSP modes. `img-src` and `connect-src` must include API hosts to avoid broken fetches. Report-only mode should run long enough in production-like traffic to catch edge cases from user-generated content. Mobile WebViews embedding your app may need coordinated policy updates with native teams.

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'nonce-{{nonce}}'; object-src 'none'; base-uri 'self';" />
```

---

## 71. Secure authentication flows in React (OAuth2, PKCE)?

Use **Authorization Code + PKCE** for public clients; never embed secrets in bundles. Store tokens in **httpOnly** cookies when possible to mitigate XSS impact—if using localStorage, tighten CSP and XSS defenses ruthlessly. Implement silent refresh with secure rotation. Deep-link mobile flows need verified redirect URIs. RSC calls should forward cookies via secure server fetch.

```js
const params = new URLSearchParams({
  response_type: "code",
  client_id,
  redirect_uri,
  code_challenge,
  code_challenge_method: "S256",
});
```

---

## 72. How to prevent and detect prototype pollution in React apps?

Avoid merging untrusted objects into defaults without key allowlists—`Object.assign` from user JSON is risky. Freeze schema objects where possible. Use `structuredClone` or libraries validating shapes. Monitor for suspicious keys (`__proto__`, `constructor`). Sanitize deeply on server boundaries, not only UI. Deep merge utilities in config loaders are frequent pollution vectors—prefer schema validation (Zod/io-ts) that strips unknown keys. Client bundles can still receive polluted objects from compromised APIs; treat deserialization as hostile. Static analysis and dependency audits catch known vulnerable packages. If you must merge, use `Object.create(null)` baselines or `lodash.merge` with care and updated versions. Security tests should include crafted JSON payloads in integration suites. Defense in depth: CSP limits script injection even if an object confuses a templating layer.

```js
import { z } from "zod";
const User = z.object({ name: z.string(), role: z.enum(["admin", "user"]) });
const safe = User.parse(untrustedJson);
```

---

## 73. Rate limiting and abuse prevention at the frontend level?

Frontend limits are **soft**—real enforcement is server-side. Still, throttle button clicks and cap retries with exponential backoff UX. CAPTCHA integration for suspicious signals. Telemetry on anomalous patterns feeds server rules. Never trust client clocks for security.

```jsx
function useThrottle(fn, ms) {
  const last = useRef(0);
  return (...args) => {
    const now = Date.now();
    if (now - last.current > ms) {
      last.current = now;
      fn(...args);
    }
  };
}
```

---

## 74. How to implement end-to-end encryption in a React chat app?

Use established protocols (**Signal**, **MLS**) via WASM/native bindings—do not roll crypto. Keys live outside React state ideally in secure modules; UI shows fingerprints for verification. Handle group membership changes carefully—forward secrecy rotates keys. Fall back gracefully when E2EE unavailable. Legal/compliance may require reporting—communicate honestly. **React’s role** is strictly presentation and orchestration: message list virtualization, optimistic sends with rollback, and attachment upload UX—not cryptographic primitives. Secure randomness (`crypto.getRandomValues`) and constant-time comparisons belong in audited libraries. Key material should never appear in props logged by error reporters—scrub payloads. Multi-device support complicates state sync—pair with secure enclave patterns on mobile when available. Penetration testing and external audits are non-optional for production E2EE. Document threat model: E2EE protects content on the wire and servers, not compromised endpoints.

```jsx
// UI wraps crypto; does not implement it
function Chat() {
  const crypto = useMessagingCrypto(); // loads WASM, holds keys off React state
  return <MessageList decrypt={crypto.decrypt} />;
}
```

---

## 75. Implementing audit logging in React applications?

Log **security-relevant** actions with user id, tenant, coarse IP (server), and object IDs—avoid PII unless necessary. Emit from API layer authoritatively; client logs are untrusted. Correlate with tracing IDs across microservices. Retention policies meet compliance. React can display audit timelines via paginated queries. **Immutability** of audit stores matters—append-only streams or WORM storage prevent tampering disputes. Clock skew across services should use UTC and NTP discipline; include monotonic sequence IDs when ordering matters. Client-side “audit” buttons should never be sole proof—backend enforces authorization and writes the log entry. For admin UIs built in React, separate highly privileged actions behind step-up auth and log those challenges. Redact tokens and secrets aggressively in log pipelines—structured logging helps scrub fields. React’s role is presentation: virtualize long audit tables for performance.

```jsx
function AuditTrail({ resourceId }) {
  const { data, fetchNextPage } = useInfiniteQuery(["audit", resourceId], fetchAuditPage);
  return <VirtualTable rows={data?.pages.flatMap((p) => p.rows) ?? []} onEndReached={fetchNextPage} />;
}
```

---

## 76. How to handle secrets management in React apps?

**Never embed secrets** in client bundles—environment variables prefixed for public only. Load private secrets in CI/CD and server runtimes. For local dev, use secret managers or dotenv excluded from git. Rotate on leaks. RSC server modules may access secrets—ensure not imported into client graphs. Build-time `define` plugins can accidentally inline values—audit webpack/vite env usage. Preview deployments need non-prod credentials scoped minimally. **Short-lived tokens** beat long-lived API keys in browsers when you must call third parties—use backend-for-frontend exchanges. Source maps uploaded to public hosts have leaked secrets before—strip or gate them. Incident playbooks should include Git history scrubbing when `.env` was committed. For monorepos, centralize secret naming conventions so packages do not each invent `REACT_APP_SECRET`.

```bash
# Vite: only VITE_* exposed; Next: NEXT_PUBLIC_* vs server-only
# Never: const key = "sk-live-..."
```

---

## 77. GDPR/privacy compliance implementation in React?

Provide **consent banners** with granular controls, wire analytics only after consent, and support data export/delete APIs. Localize privacy notices. Minimize tracking props to vendors. Test that disabling cookies actually stops requests. Server logs must honor retention limits. **Consent mode** should gate third-party script injection, not only React state—use tag managers or conditional `<script>` loading server-side when possible to avoid flicker. Data subject access requests need identifiable records without exposing others’ data—authorization checks belong server-side. React forms collecting sensitive data should avoid persisting drafts to localStorage unless disclosed. Right to erasure may require cascading deletes across microservices—UI confirms completion with job IDs, not immediate fake success. DPIAs document risky features (session replay, AI features). Internationalization includes legal text, not only UI chrome.

```jsx
function Analytics() {
  const consent = useConsent();
  useEffect(() => {
    if (consent.analytics) initVendor();
  }, [consent.analytics]);
  return null;
}
```

---

## 78. How to implement a robust error boundary hierarchy?

Layer boundaries: **route-level** for isolation, **feature-level** for modules, **root-level** for fallback branding. Log errors to centralized collectors with React component stacks. Reset keys on navigation to recover. Boundaries do not catch all errors—pair with global `window.onerror` handlers. Avoid swallowing errors silently—surface IDs for support.

```jsx
<RouteBoundary>
  <FeatureBoundary>
    <Page />
  </FeatureBoundary>
</RouteBoundary>
```

---

## 79. Graceful degradation and resilience patterns?

Serve **read-only** modes when writes fail; use stale caches with banners. Retry idempotent GETs with jitter. Circuit breakers on client fetch wrappers cooperate with server health. Offline queues pair with question 38. UX copy should set expectations—degraded but trustworthy beats silently broken. **Feature degradation** tiers help: hide non-essential widgets first when APIs slow. Skeleton screens beat spinners for perceived performance but should not fake completed data. Global error overlays in dev-only must never ship to production—users need actionable recovery. Resilience reviews should include third-party outages (auth, payments, CDN). React error boundaries catch render failures but not network partitions—pair with connectivity hooks. Chaos experiments in staging validate that degraded modes activate predictably.

```jsx
function useServiceHealth() {
  const [degraded, setDegraded] = useState(false);
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        await fetch("/healthz", { cache: "no-store" });
        setDegraded(false);
      } catch {
        setDegraded(true);
      }
    }, 30_000);
    return () => clearInterval(id);
  }, []);
  return degraded;
}
```

---

## 80. How to implement observability (tracing, metrics, logging) in React?

Propagate **trace context** (`traceparent`) from browser to APIs via fetch interceptors. Capture **Web Vitals** to analytics. Use OpenTelemetry in server components for unified traces. Log client errors with breadcrumbs (last actions) but scrub PII. Metrics: tag by release version and route. Dashboards tie frontend signals to backend saturation.

```jsx
fetch("/api/x", { headers: { traceparent: activeTraceContext() } });
```

---

## 81. How to plan and execute a large-scale migration to React 19?

Inventory **deprecated APIs**, run codemods (`npx codemod`), upgrade in **stages** (18.3 strict warnings first). Test concurrent features, Suspense boundaries, and RSC integration points. Train teams on new hooks/compiler semantics. Canary internal apps before broad rollout. Rollback plan: pin versions and feature flags around new renderer paths. Build a **compat matrix** across React, TypeScript, router, and bundler versions—peer dependency conflicts block clean installs. Automated visual regression and e2e suites catch subtle hydration changes. Allocate time for third-party library upgrades; unmaintained packages may need forks or replacements. Communicate timelines to product teams—migration weeks are not feature-free by default unless leadership protects capacity. Post-migration, remove compatibility shims to avoid permanent dual paths. Document lessons for the next major—migrations compound if tech debt ignored.

---

## 82. Strategies for migrating class components to hooks in a large codebase?

Prioritize **leaf components** and **shared libraries**; use **wrapper hooks** temporarily to compose class logic. Replace lifecycle pairs with `useEffect` carefully—mind dependency arrays. Error boundaries remain class until alternatives mature. Automate repetitive patterns with codemods but verify tests. Track bundle size improvements—hooks often reduce code. **`getDerivedStateFromProps`** migrations need explicit derived state patterns—often `useMemo` or reset keys on prop changes. Instance methods passed to children may need `useCallback` to preserve referential equality where `PureComponent` previously short-circuited. Context consumers in classes map cleanly to `useContext`. Refs: `createRef` versus callback refs—`useRef` covers most cases. Incremental migration allows mixed trees indefinitely, but testing matrices grow—set a sunset date for remaining classes. Team training on stale closures prevents subtle hook bugs that `this` previously masked differently.

---

## 83. How to introduce React Server Components into an existing app?

Start at **data-heavy, low-interactivity** routes behind flags. Define clear **client boundaries** with `"use client"`. Ensure bundler supports RSC flight endpoints. Train teams on forbidden client imports of server-only modules. Monitor latency shifts—server CPU becomes hotter. Document caching semantics for `fetch`.

```tsx
async function Page() {
  const data = await fetch("https://api.example.com/x", { cache: "force-cache" }).then((r) => r.json());
  return <List items={data.items} />;
}
```

---

## 84. How to evaluate and adopt the React Compiler?

Pilot on **leaf packages** with strict lint passes; compare Profiler timings and bundle sizes. Train developers on **rules of react** lint plugin. Establish bailout triage when compiler skips optimization. Integrate into CI with incremental rollout. Measure support burden—fewer manual memos vs build-time overhead. **Success criteria** should include median INP and error rates, not only local benchmarks. Compare developer experience: build times may rise slightly; ensure CI caches compensate. Document patterns that defeat analysis (heavy mutation, dynamic code) so teams refactor knowingly. Pair compiler rollout with removal of redundant memoization to realize bundle and readability wins. Escalation path: if a package cannot comply, isolate it behind boundaries until refactored. Long-term maintenance: stay aligned with compiler releases—treat it like a language extension.

---

## 85. How to build a team culture around React best practices?

Run **internal guilds**, share ADRs, and celebrate refactors that improve metrics. Pair staff engineers with product squads for reviews. Maintain a **living playbook** with examples—not only rules. Balance autonomy with central design system mandates where risk high. Recognize maintenance work in performance reviews. **Psychological safety** enables surfacing perf regressions early—blameless postmortems when incidents tie to frontend deploys. Office hours reduce siloed “tribal” knowledge about bundler quirks. Rotate guild leadership so it does not become a bottleneck. Tie practices to outcomes: accessibility and perf as part of definition of done, not optional polish. Junior-friendly documentation lowers the bar for consistent patterns across dozens of teams. Celebrate learning from mistakes—publicly share interesting bug stories with root causes.

---

## 86. Code review guidelines for React - what to look for?

Check **hook rules**, purity in render, effect dependency correctness, accessibility, and **security** of URLs/HTML. Question unnecessary context, large prop drilling versus composition. Ensure tests cover state transitions and error paths. Flag unstable inline functions passed to memoized children when hot paths. Verify RSC/client boundaries sane. Reviews should assess **data-fetching** patterns: waterfalls, cache invalidation, and error handling—not only JSX style. For design system usage, catch one-off styles that duplicate tokens. Performance-sensitive areas deserve explicit Profiler evidence or rationale. Naming and file structure should match repo conventions to reduce cognitive load. Escalate cross-cutting concerns (new global state, routing changes) to architects early. Reviews are mentoring moments—explain *why*, especially for subtle concurrent-mode bugs.

---

## 87. How to mentor junior developers in React?

Assign **bounded tasks** with explicit success criteria; review with Socratic questions. Share reading on reconciler basics once fundamentals solid. Encourage **profiling** over guessing. Pair on tricky async bugs. Provide feedback compassionately on repeated mistakes—often signals missing mental model, not effort. **Progressive complexity**: master one-way data flow before concurrent patterns; master `useEffect` cleanup before advanced caching. Encourage small PRs with narrative descriptions—communication skill compounds engineering impact. Safe sandbox repos let juniors experiment without production risk. Celebrate when they catch their own stale closure bug—signals growth. Long-term, connect them to open-source or internal platform work for breadth. Mentoring scales via office hours and recorded walkthroughs—avoid only 1:1 heroics.

---

## 88. How to conduct architecture reviews for React projects?

Evaluate **scalability** of state and data fetching, deployment model, security posture, and observability. Check coupling to frameworks—escape hatches documented? Assess **operational** runbooks for incidents. Include representatives from security and SRE early. Outcomes: action items with owners, not just opinions. **Agenda** should cover user journeys end-to-end, not only component diagrams—data residency, auth token lifetimes, and failure modes matter. Timebox decisions; defer bike-shedding to follow-ups. Record risks explicitly: accepted debt versus unknown unknowns. Revisit reviews after major milestones—architecture drifts. For acquisitions integrating codebases, reviews highlight duplicate design systems and routing conflicts. Success looks like aligned constraints that speed teams up, not heavyweight gates that stall launches without cause.

---

## 89. Performance budgeting and enforcement strategies?

Define **budgets** for JS KB, LCP ms, INP ms per route in CI using Lighthouse or custom scripts. Fail builds on regressions beyond thresholds with override process. Pair budgets with **field** monitoring—lab budgets alone mislead. Revisit quarterly as devices/networks evolve.

```json
{
  "budget": [{ "resourceSizes": [{ "resourceType": "script", "budget": 200000 }] }]
}
```

---

## 90. How to handle technical debt in a React codebase?

Inventory debt with **impact/effort** scoring; schedule **continuous** remediation alongside features. Use **codemods** for mechanical debt. Communicate product trade-offs—some debt is intentional speed-to-market. Prevent new debt via lint gates and reviews. Celebrate debt paydown in changelogs. **Debt types** differ: outdated dependencies (security), duplicated UI (inconsistency), poor data patterns (bugs), missing tests (incident risk). Allocate **20%** capacity rules-of-thumb only work if leadership protects them during crunch quarters. Track debt in the same system as features—otherwise it vanishes from roadmaps. When debt causes incidents, link postmortems to backlog items with owners. Refactor **hot paths** first; polishing rare screens yields low ROI. Teams should visualize dependency age dashboards—React majors age faster than many expect.

---

## 91. Evaluating framework alternatives (Next.js vs Remix vs Astro)?

**Next.js** offers integrated RSC, routing, and image optimization—great for full-stack teams. **Remix** emphasizes web standards, nested routes, and progressive enhancement—excellent form models. **Astro** minimizes JS by default—ideal content sites with islands. Pick based on team skills, hosting, and data location constraints—not hype. Migration cost matters—evaluate incrementally. **Vendor lock-in** differs: Next couples you to Vercel-adjacent defaults though self-hosting exists; Remix runs broadly on Node/edge; Astro targets static-first with optional React islands. Evaluate **data loading** ergonomics against your API shape—GraphQL apps may prefer client-heavy patterns; REST-heavy may love loaders. Long-term support: community size, hiring pipeline, and upgrade cadence matter for enterprise. Prototype one representative route in each candidate measuring TTFB, bundle KB, and DX. Do not ignore operations—edge cold starts, log formats, and observability plugins vary.

---

## 92. When NOT to use React - choosing the right tool?

For **mostly static** content with little interactivity, simpler static generators or server templates suffice—less JS, better performance. Highly **canvas/WebGL** apps may keep React at edges only. Tiny embeds might use **lit** or vanilla for footprint. Organizational inability to invest in bundler complexity also weighs against React. Pragmatism beats uniformity. Teams without test discipline suffer React’s flexibility—unconstrained patterns multiply bugs faster than opinionated frameworks. **Latency-critical** embedded UIs on constrained devices sometimes prefer Svelte or compiled outputs with smaller runtimes—measure. When SEO and crawlability dominate and interactivity is minimal, shipping HTML from the edge without hydration wins. Mixing React for app shell and vanilla islands for widgets is valid but adds operational complexity—justify with metrics. The “wrong tool” decision should be revisited as React Compiler and RSC shift the cost curve.

---

## 93. How to build a proof of concept for React Server Components?

Choose one read-heavy screen, implement server `fetch`, measure TTFB and server CPU vs client-only. Validate bundler setup and caching headers. Compare DX against existing data hooks. Document pitfalls (`Date` serialization, client-only APIs). Present metrics with methodology—not anecdotes. **Scope** the PoC to include one interactive island (`"use client"`) touching the same data to surface boundary friction. Capture waterfall diagrams from browser and server traces side-by-side. Include failure injection: slow API, error responses, and cache misses—RSC shifts failure modes serverward. Involve security early if fetching user-specific data on the server—session handling differs from pure CSR. Exit criteria: decide go/no-go on bundle reduction, operational cost, and team readiness—not only “it works locally.”

```tsx
export default async function PoC() {
  const res = await fetch("https://api.example.com/items", { next: { revalidate: 60 } });
  const items = await res.json();
  return <ClientList items={items} />;
}
```

---

## 94. How to implement a design system governance model?

Establish a **core team** with SLAs, contribution RFC process, and **semver** discipline. Provide Figma tokens synced to code. Enforce **visual regression** and accessibility checks on PRs. Deprecation windows with codemods. Balance innovation vs stability—allow experiments in labs packages. **Consumers** need clarity on how to propose components—templates reduce friction. Versioning policy: breaking changes require migration guides and dual-publish periods for large orgs. Measure adoption—orphaned duplicate buttons in product code signal governance gaps. Office hours and pairing sessions unblock teams faster than ticket queues alone. Align roadmap with brand and marketing—visual refresh cycles should not surprise the system team. Success metrics: reduced one-off CSS, faster feature delivery using primitives, fewer accessibility regressions in audits.

---

## 95. How to handle breaking changes across a component library?

Use **semver major** bumps, migration guides, and codemods. Communicate via changelog and internal posts. Support **dual-publish** periods if needed—wrapper components bridging APIs. Track adoption metrics of new APIs. Empathy for consumers prevents mutiny. **Communication** should include timelines: when old APIs stop receiving bugfixes. For monorepos, codemods run in CI on draft PRs to estimate migration cost. Provide compatibility shims with deprecation warnings using `console.warn` once per session—not spam. Cross-team migrations may need **office hours** and embedded support from design system engineers. Breaking visual changes need design QA sign-off—snapshots alone miss motion and focus behavior. Document rollback plans if a major release introduces production issues—feature flags on consuming apps help.

---

## 96. What is the future roadmap of React?

React’s direction continues toward **automatic performance** (Compiler), deeper **server/client integration** (RSC/Actions), and improved **concurrency** ergonomics—exact milestones shift; follow official react.dev blog and RFCs. Experimental channels preview features—treat as unstable until documented stable. Ecosystem tools (routers, metaframeworks) co-evolve; plan upgrades jointly. **Community process** matters: RFC discussions reveal rationale—read before adopting experiments in production. Meta’s internal priorities influence pacing, but open-source feedback shapes API details. Watch for deprecations removing legacy patterns—Stricter defaults in Strict Mode foreshadow future guarantees. Long-term, tighter integration between bundlers and React (flight, compiler) means toolchain choices increasingly equal framework choices. Teams should budget quarterly dependency review—not annual fire drills.

---

## 97. How to implement AI/LLM features in React applications?

Isolate **streaming token UI** with Suspense-friendly readers; throttle renders to avoid excessive commits. Sanitize model outputs before `dangerouslySetInnerHTML`—assume hostile. Handle **abort** via `AbortController` on navigations. Cost controls: server-side gating and rate limits. For RAG, show citations with inspectable sources to reduce hallucination risk. Privacy: minimize data sent to models.

```jsx
function Stream({ getReader }) {
  const [text, setText] = useState("");
  useEffect(() => {
    let cancel = false;
    (async () => {
      const r = await getReader();
      const dec = new TextDecoder();
      while (!cancel) {
        const { value, done } = await r.read();
        if (done) break;
        setText((t) => t + dec.decode(value));
      }
    })();
    return () => {
      cancel = true;
    };
  }, [getReader]);
  return <pre>{text}</pre>;
}
```

---

## 98. How to handle real-time data at scale in React?

Back **WebSocket** fanout with message brokers; shard channels by tenant/region. Client-side, debounce high-rate updates, coalesce state patches, and virtualize UIs. Use **CRDTs** where multiple writers collide. Backpressure: drop/tail for dashboards, never for financial ledgers—domain dependent. Monitor reconnect storms. **Rate limiting** applies to inbound messages too—parse and validate before `setState` to avoid main-thread overload. For global scale, regional brokers reduce cross-ocean chatter; users reconnect to nearest edge. Authentication and authorization per channel prevent subscription leakage—React cannot secure this alone. Test thundering herds when deployments reconnect every client simultaneously. Consider **SSE** for one-way streams where simpler than bidirectional sockets. Observability: tag WebSocket close codes and reconnect counts in client telemetry.

```jsx
import { startTransition, useEffect } from "react";

function useSocket(channel, onMessage) {
  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/${channel}`);
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      startTransition(() => onMessage(msg));
    };
    return () => ws.close();
  }, [channel, onMessage]);
}
```

---

## 99. How to implement an analytics pipeline with React?

Instrument events via a thin **analytics client** with typed event names, sampling, and PII scrubbing. Initialize consent-gated loading. Correlate with session replay tools cautiously—privacy review required. Server-side, join product analytics with warehouse ETL. Validate schemas to prevent garbage data. Test that ad blockers do not break core flows.

```jsx
function track(event, props) {
  if (!consent.analytics) return;
  navigator.sendBeacon("/a", JSON.stringify({ event, props, t: Date.now() }));
}
```

---

## 100. What distinguishes a senior React engineer from a staff engineer?

Senior engineers **ship excellent React**—master hooks, performance, accessibility, and testing. Staff engineers **multiply outcomes**: shape **cross-team architecture**, drive **reliability/security** standards, mentor broadly, and align technical direction with business constraints—often with less hands-on coding but deeper systems thinking. They anticipate framework shifts (RSC, compiler) and design migrations minimizing disruption. Communication and negotiation become as important as API design. Both value pragmatism; staff adds organizational leverage and long-horizon bets. Seniors often own features end-to-end; staff set **constraints** that make many teams faster—lint rules, templates, platform APIs. Staff engineers read organizational dynamics: when to standardize versus when local optimization wins. Influence without authority is hallmark: convincing through data, prototypes, and clear trade-off docs. Title ladders vary by company—some “principal” maps to what others call staff; focus on responsibilities over labels. Continuous learning remains essential at both levels; the toolkit expands from components to socio-technical systems.

---
