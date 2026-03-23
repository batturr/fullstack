# React MCQ - Set 5 (Expert Level)

**1. In React’s Fiber architecture, what does a Fiber node primarily represent?**

a) `A DOM element only`
b) `A unit of work tied to a component instance or host node, forming a linked list tree`
c) `A Redux store slice`
d) `A webpack chunk`

**Answer: b) `A unit of work tied to a component instance or host node, forming a linked list tree`**

---

**2. During reconciliation, when the element type at the same position changes from a function component to a different function component, React typically:**

a) `Reuses the existing fiber and patches props only`
b) `Unmounts the subtree and mounts a fresh one`
c) `Ignores the change until the next frame`
d) `Merges state from the old component into the new one automatically`

**Answer: b) `Unmounts the subtree and mounts a fresh one`**

---

**3. Why are stable `key` values critical when rendering lists?**

a) `They improve TypeScript inference`
b) `They help React match previous and next elements to preserve identity and local state`
c) `They are required for CSS modules`
d) `They disable concurrent rendering`

**Answer: b) `They help React match previous and next elements to preserve identity and local state`**

---

**4. What is the main purpose of `startTransition` in concurrent React?**

a) `To pause all updates globally`
b) `To mark updates as non-urgent so urgent updates (like typing) can interrupt them`
c) `To force synchronous rendering`
d) `To replace useEffect`

**Answer: b) `To mark updates as non-urgent so urgent updates (like typing) can interrupt them`**

---

**5. `<Suspense>` used for data fetching on the client relies on components that:**

a) `Must only use fetch inside useEffect`
b) `Throw a Promise (or rely on a framework that does) while data is pending`
c) `Cannot be nested`
d) `Must be class components`

**Answer: b) `Throw a Promise (or rely on a framework that does) while data is pending`**

---

**6. Streaming SSR conceptually allows the server to:**

a) `Send the full HTML only after every async boundary resolves`
b) `Send HTML in chunks as parts of the tree become ready, improving time-to-first-byte`
c) `Skip hydration entirely`
d) `Run only in web workers`

**Answer: b) `Send HTML in chunks as parts of the tree become ready, improving time-to-first-byte`**

---

**7. React Server Components (RSC) are designed to:**

a) `Replace the browser entirely`
b) `Run on the server and send a serializable description without shipping that logic to the client bundle`
c) `Execute only inside Service Workers`
d) `Require Redux on the server`

**Answer: b) `Run on the server and send a serializable description without shipping that logic to the client bundle`**

---

**8. In RSC-oriented setups, a clear boundary between server and client components matters because:**

a) `Server components can import client components, but client components cannot import server-only modules`
b) `Client components can freely import any server-only database SDK without restrictions`
c) `Server components may use browser-only APIs like window freely`
d) `There is no bundler impact from crossing the boundary`

**Answer: a) `Server components can import client components, but client components cannot import server-only modules`**

---

**9. The `"use client"` directive marks a module as:**

a) `A server-only entry`
b) `A client boundary: the module and its dependency graph are eligible for the client bundle`
c) `A CSS-only file`
d) `A test mock`

**Answer: b) `A client boundary: the module and its dependency graph are eligible for the client bundle`**

---

**10. The `"use server"` directive is commonly used to:**

a) `Declare server actions / RPC-style functions callable from the client in supported frameworks`
b) `Force a component to render on the client only`
c) `Disable Strict Mode`
d) `Polyfill fetch`

**Answer: a) `Declare server actions / RPC-style functions callable from the client in supported frameworks`**

---

**11. A typical middleware pattern around `useReducer` involves:**

a) `Replacing reducers with useState only`
b) `Wrapping dispatch to intercept actions (logging, persistence, side effects orchestration)`
c) `Removing action types`
d) `Disabling batching`

**Answer: b) `Wrapping dispatch to intercept actions (logging, persistence, side effects orchestration)`**

---

**12. Composing custom hooks (`useX` calling `useY`) is valid when:**

a) `Hooks are called conditionally inside loops for flexibility`
b) `Each custom hook preserves the rules of hooks and encapsulates cohesive stateful logic`
c) `Only one hook may exist per file`
d) `Hooks must not return functions`

**Answer: b) `Each custom hook preserves the rules of hooks and encapsulates cohesive stateful logic`**

---

**13. Over-memoizing with `useMemo` / `useCallback` can hurt performance because:**

a) `They always disable concurrent features`
b) `They add comparison and allocation overhead that may exceed the cost of recomputing`
c) `They force double rendering in Strict Mode only in production`
d) `They break referential equality for primitives`

**Answer: b) `They add comparison and allocation overhead that may exceed the cost of recomputing`**

---

**14. `React.memo` primarily helps when:**

a) `The component is always expensive regardless of props`
b) `A pure component re-renders often due to parent updates but props are shallowly equal`
c) `You need to memoize context values automatically`
d) `You want to skip effects`

**Answer: b) `A pure component re-renders often due to parent updates but props are shallowly equal`**

---

**15. A pitfall of `React.memo` with a custom comparator is:**

a) `It cannot be used with function components`
b) `An incorrect comparator can skip renders when props are not truly equivalent, causing stale UI`
c) `It only compares state, not props`
d) `It removes the need for keys in lists`

**Answer: b) `An incorrect comparator can skip renders when props are not truly equivalent, causing stale UI`**

---

**16. The React DevTools Profiler records:**

a) `Network waterfall timings only`
b) `Render durations and why components rendered (e.g., props/state/context changes)`
c) `Webpack bundle graphs`
d) `Server-only CPU profiles`

**Answer: b) `Render durations and why components rendered (e.g., props/state/context changes)`**

---

**17. List virtualization mainly improves:**

a) `Hydration of the entire DOM at once`
b) `Rendering cost by mounting only visible items (plus overscan) in large lists`
c) `CSS specificity`
d) `Server action latency`

**Answer: b) `Rendering cost by mounting only visible items (plus overscan) in large lists`**

---

**18. `flushSync` forces React to:**

a) `Defer all updates to the next frame`
b) `Flush updates synchronously inside the provided callback, potentially nesting unusual lifecycle timing`
c) `Disable error boundaries`
d) `Run effects immediately before paint always`

**Answer: b) `Flush updates synchronously inside the provided callback, potentially nesting unusual lifecycle timing`**

---

**19. `useSyncExternalStore` is intended for:**

a) `Animating SVG paths only`
b) `Subscribing to external stores in a way safe for concurrent rendering / tearing avoidance`
c) `Replacing all context usage`
d) `Server-only data fetching`

**Answer: b) `Subscribing to external stores in a way safe for concurrent rendering / tearing avoidance`**

---

**20. `useInsertionEffect` runs:**

a) `After paint, like useLayoutEffect always`
b) `Before layout effects, ideal for injecting styles without flicker in CSS-in-JS libraries`
c) `Only in development`
d) `Only for refs to DOM nodes`

**Answer: b) `Before layout effects, ideal for injecting styles without flicker in CSS-in-JS libraries`**

---

**21. An advanced error boundary pattern for recoverable UI often includes:**

a) `Catching errors in event handlers without any local state`
b) `Reset keys and lazy remounting of subtree after user-triggered retry`
c) `Using error boundaries inside async functions`
d) `Replacing try/catch for all promise rejections automatically`

**Answer: b) `Reset keys and lazy remounting of subtree after user-triggered retry`**

---

**22. Error boundaries do NOT catch errors from:**

a) `Rendering children`
b) `Lifecycle methods during render`
c) `Event handlers (use try/catch instead)`
d) `Suspense fallbacks`

**Answer: c) `Event handlers (use try/catch instead)`**

---

**23. The compound component pattern typically:**

a) `Forbids context between parent and children`
b) `Uses implicit coupling via context or cloneElement so subcomponents share private state/API`
c) `Requires a single giant prop object only`
d) `Only works with class components`

**Answer: b) `Uses implicit coupling via context or cloneElement so subcomponents share private state/API`**

---

**24. Modeling UI with explicit states/transitions (state machine) in React helps:**

a) `Eliminate the virtual DOM`
b) `Make impossible states unrepresentable and simplify async flows`
c) `Guarantee O(1) reconciliation`
d) `Remove the need for keys`

**Answer: b) `Make impossible states unrepresentable and simplify async flows`**

---

**25. When reconciling children in an array, using array index as `key` for reorderable lists is risky because:**

a) `React forbids numeric keys`
b) `Identity can be mis-attributed, causing incorrect state retention and inefficient updates`
c) `It disables Strict Mode`
d) `It breaks React.memo always`

**Answer: b) `Identity can be mis-attributed, causing incorrect state retention and inefficient updates`**

---

**26. Fiber’s linked list structure (child/sibling/return) primarily enables:**

a) `Synchronous DOM measurement only`
b) `Interruptible work: pause, resume, and prioritize units of work`
c) `Removing keys from reconciliation`
d) `Direct mutation of props`

**Answer: b) `Interruptible work: pause, resume, and prioritize units of work`**

---

**27. Concurrent rendering means React may:**

a) `Never commit updates`
b) `Prepare multiple versions of the UI and discard interrupted work before committing`
c) `Run components on multiple threads always`
d) `Disable batching entirely`

**Answer: b) `Prepare multiple versions of the UI and discard interrupted work before committing`**

---

**28. Double rendering in React Strict Mode (development) helps reveal:**

a) `Production bundle size`
b) `Side effects and unsafe assumptions in render/setup that aren’t idempotent`
c) `Webpack cache misses`
d) `CSS specificity bugs`

**Answer: b) `Side effects and unsafe assumptions in render/setup that aren’t idempotent`**

---

**29. For hook dependency optimization, the most important rule is:**

a) `Omit dependencies to reduce renders`
b) `List all values from component scope that the effect/callback reads and that can change`
c) `Only include primitives`
d) `Never use eslint exhaustive-deps`

**Answer: b) `List all values from component scope that the effect/callback reads and that can change`**

---

**30. `useCallback` stabilizes a function reference primarily to:**

a) `Make the function faster to execute`
b) `Prevent child memoization (React.memo) from breaking when passing callbacks`
c) `Replace useMemo for objects`
d) `Force synchronous commits`

**Answer: b) `Prevent child memoization (React.memo) from breaking when passing callbacks`**

---

**31. What does this log likely illustrate about `useReducer`?**

```jsx
const [state, dispatch] = useReducer(reducer, 0);
dispatch({ type: "inc" });
dispatch({ type: "inc" });
console.log(state);
```

a) `Logs 2 immediately because dispatches apply synchronously to the same render snapshot`
b) `Logs 0 on the same render pass; state updates apply after this render`
c) `Throws because batching is illegal`
d) `Always logs 1`

**Answer: b) `Logs 0 on the same render pass; state updates apply after this render`**

---

**32. Ref forwarding with `forwardRef` is used to:**

a) `Expose every state variable automatically`
b) `Allow parent components to access a child’s DOM or imperative handle`
c) `Replace context`
d) `Disable concurrent features`

**Answer: b) `Allow parent components to access a child’s DOM or imperative handle`**

---

**33. `useImperativeHandle` customizes:**

a) `What the parent sees when it receives a ref (a limited imperative API)`
b) `CSS variables only`
c) `The fiber priority lane`
d) `Error boundary stack traces`

**Answer: a) `What the parent sees when it receives a ref (a limited imperative API)`**

---

**34. Callback refs run:**

a) `Only once on mount in production`
b) `When the instance is attached/detached, useful for DOM measurements`
c) `Before React exists`
d) `Only for class components`

**Answer: b) `When the instance is attached/detached, useful for DOM measurements`**

---

**35. Splitting a reducer with a middleware that logs actions should generally:**

a) `Mutate the previous state for speed`
b) `Return the same dispatch shape and keep reducers pure`
c) `Call reducer twice always`
d) `Replace state with window globals`

**Answer: b) `Return the same dispatch shape and keep reducers pure`**

---

**36. Streaming SSR + Suspense boundaries can improve perceived performance by:**

a) `Blocking all HTML until every boundary resolves`
b) `Showing fallbacks early and replacing them as segments stream in`
c) `Removing the need for HTML`
d) `Disabling SEO`

**Answer: b) `Showing fallbacks early and replacing them as segments stream in`**

---

**37. Client components importing server-only code fails in typical RSC setups because:**

a) `The server cannot serialize JSX`
b) `Bundler rules prevent server-only modules from entering the client graph`
c) `Hooks cannot run on the server`
d) `CSS cannot be imported`

**Answer: b) `Bundler rules prevent server-only modules from entering the client graph`**

---

**38. Element type comparison in reconciliation treats these as the same “type” only if:**

a) `Their string tag name or component reference is the same`
b) `Their props are deep-equal`
c) `Their children count matches`
d) `They share the same key across different positions`

**Answer: a) `Their string tag name or component reference is the same`**

---

**39. `useMemo` returns:**

a) `A stable function reference always`
b) `A memoized value recomputed when dependencies change`
c) `A ref object`
d) `A Promise`

**Answer: b) `A memoized value recomputed when dependencies change`**

---

**40. Overusing `React.memo` on leaf components that re-render cheaply often:**

a) `Always improves TTI`
b) `Adds prop comparison overhead with little benefit`
c) `Fixes hydration mismatches`
d) `Removes the need for context`

**Answer: b) `Adds prop comparison overhead with little benefit`**

---

**41. Context + frequent updates without splitting providers can cause:**

a) `Only the nearest leaf to re-render`
b) `All consumers of that context value to re-render when the value changes`
c) `No re-renders`
d) `Automatic memoization of children`

**Answer: b) `All consumers of that context value to re-render when the value changes`**

---

**42. `flushSync` should be used:**

a) `In every event handler by default`
b) `Sparingly; it opts out of batching and can harm concurrent scheduling`
c) `Only inside useInsertionEffect`
d) `Never; it was removed`

**Answer: b) `Sparingly; it opts out of batching and can harm concurrent scheduling`**

---

**43. `useSyncExternalStore` requires a `getServerSnapshot` on the server to:**

a) `Replace Suspense`
b) `Provide a consistent snapshot during SSR and avoid hydration mismatch warnings`
c) `Disable concurrent rendering`
d) `Measure layout`

**Answer: b) `Provide a consistent snapshot during SSR and avoid hydration mismatch warnings`**

---

**44. Compound components often avoid prop drilling by:**

a) `Using only global variables`
b) `Exposing a parent-managed context to named subcomponents`
c) `Banning children`
d) `Using dangerouslySetInnerHTML only`

**Answer: b) `Exposing a parent-managed context to named subcomponents`**

---

**45. In a state machine approach, representing `{ status: "loading" | "success" | "error" }` is better than separate booleans because:**

a) `It reduces bundle size to zero`
b) `It prevents contradictory states like isLoading and isError both true`
c) `It removes async`
d) `It disables re-renders`

**Answer: b) `It prevents contradictory states like isLoading and isError both true`**

---

**46. Virtualization libraries typically need:**

a) `A fixed universe of 10 items maximum`
b) `Item size estimation (fixed or dynamic) and scroll container metrics`
c) `No keys`
d) `Class components only`

**Answer: b) `Item size estimation (fixed or dynamic) and scroll container metrics`**

---

**47. Profiler “nested updates” in DevTools often indicate:**

a) `Network retries`
b) `A render triggered while React is already rendering (e.g., state update during render—usually a bug)`
c) `Successful code splitting`
d) `CSS animations`

**Answer: b) `A render triggered while React is already rendering (e.g., state update during render—usually a bug)`**

---

**48. Advanced ref pattern: storing mutable value without causing re-renders uses:**

a) `Use useState for everything`
b) `useRef for mutable instance fields that should not trigger renders`
c) `createRef in function components for all cases`
d) `useMemo without dependencies`

**Answer: b) `useRef for mutable instance fields that should not trigger renders`**

---

**49. Reconciliation across portals still:**

a) `Breaks the React tree identity completely`
b) `Preserves React tree structure; portals affect DOM placement, not logical ownership`
c) `Requires different element types always`
d) `Disables error boundaries`

**Answer: b) `Preserves React tree structure; portals affect DOM placement, not logical ownership`**

---

**50. Choosing `useReducer` over multiple `useState` hooks is often preferable when:**

a) `State transitions are numerous and coupled, benefiting from a single reducer and dispatch API`
b) `You need to avoid re-renders entirely`
c) `You only store booleans`
d) `You cannot use context`

**Answer: a) `State transitions are numerous and coupled, benefiting from a single reducer and dispatch API`**

---
