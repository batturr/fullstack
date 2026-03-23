# React MCQ - Set 4 (Intermediate Level)

**1. In React Router v6, nested routes are typically declared where?**

a) `Only in a separate routes.config.json file`
b) `Child Route elements under a parent route (or route objects in data APIs)`
c) `Inside useEffect only`
d) `Only with HashRouter`

**Answer: b) `Child Route elements under a parent route (or route objects in data APIs)`**

---

**2. What does `<Outlet />` render?**

a) `The current URL pathname string`
b) `The matched child route’s element at this level of the route tree`
c) `An error boundary`
d) `The root component only`

**Answer: b) `The matched child route’s element at this level of the route tree`**

---

**3. In a route like `/users/:id`, how does `UserProfile` read `42` from `/users/42`?**

```jsx
import { useParams } from "react-router-dom";

function UserProfile() {
  const { id } = useParams();
  // id === ?
}
```

a) `useSearchParams only`
b) `useParams()`
c) `useLocation().pathname.split`
d) `window.location.hash`

**Answer: b) `useParams()`**

---

**4. Query strings like `?tab=1` in React Router v6 are commonly accessed with:**

a) `useParams`
b) `useSearchParams (tuple with getter/setter for query string)`
c) `useNavigate only`
d) `useReducer`

**Answer: b) `useSearchParams (tuple with getter/setter for query string)`**

---

**5. `useLocation()` provides:**

a) `Only the hostname`
b) `Location object with pathname, search, hash, state, key`
c) `Route loader data only`
d) `Dynamic import status`

**Answer: b) `Location object with pathname, search, hash, state, key`**

---

**6. Imperative navigation in v6 uses:**

a) `history.push`
b) `useNavigate hook, which returns a navigate function`
c) `redirect() only in components`
d) `window.assign only`

**Answer: b) `useNavigate hook, which returns a navigate function`**

---

**7. In React Router data APIs, a route `loader` runs to:**

a) `Style the route`
b) `Fetch/read data before rendering the route (can be parallelized)`
c) `Replace components with strings`
d) `Handle only POST requests in all cases`

**Answer: b) `Fetch/read data before rendering the route (can be parallelized)`**

---

**8. A route `action` is primarily for:**

a) `Declarative data mutations/forms tied to navigation (e.g., Form submissions)`
b) `CSS animations`
c) `Lazy loading images only`
d) `Replacing useEffect`

**Answer: a) `Declarative data mutations/forms tied to navigation (e.g., Form submissions)`**

---

**9. A “protected route” pattern typically:**

a) `Deletes the router`
b) `Wraps routes: if unauthenticated, redirect (e.g., to /login) else render children`
c) `Uses only HashRouter`
d) `Requires portals`

**Answer: b) `Wraps routes: if unauthenticated, redirect (e.g., to /login) else render children`**

---

**10. Prop drilling means:**

a) `Using CSS variables`
b) `Passing props through intermediate components that do not use them`
c) `Using dynamic import`
d) `Using useId`

**Answer: b) `Passing props through intermediate components that do not use them`**

---

**11. Context is best thought of as compared to Redux for many apps as:**

a) `Always a full replacement with devtools and middleware`
b) `Built-in dependency injection for tree-wide values; Redux adds predictable global store patterns`
c) `Identical to Redux`
d) `Unable to cause re-renders`

**Answer: b) `Built-in dependency injection for tree-wide values; Redux adds predictable global store patterns`**

---

**12. Redux-style single store conceptually emphasizes:**

a) `Mutable shared objects`
b) `Centralized state, explicit actions/reducers, time-travel debugging (with tooling)`
c) `Only local component state`
d) `No selectors`

**Answer: b) `Centralized state, explicit actions/reducers, time-travel debugging (with tooling)`**

---

**13. Zustand is often described as:**

a) `A class component API`
b) `A small external store with hooks; minimal boilerplate compared to classic Redux`
c) `A replacement for the virtual DOM`
d) `Built into React 19 only`

**Answer: b) `A small external store with hooks; minimal boilerplate compared to classic Redux`**

---

**14. Jotai’s mental model leans toward:**

a) `A single global reducer only`
b) `Atomic bottom-up state composition`
c) `Only URL state`
d) `Server components only`

**Answer: b) `Atomic bottom-up state composition`**

---

**15. Fetching in `useEffect` on mount typically needs:**

a) `No cleanup`
b) `AbortController or ignore flag to avoid setting state after unmount / race conditions`
c) `useMemo instead of effect`
d) `Only class components`

**Answer: b) `AbortController or ignore flag to avoid setting state after unmount / race conditions`**

---

**16. SWR / React Query–style libraries mainly add:**

a) `Routing`
b) `Caching, deduping, background refetch, stale-while-revalidate semantics`
c) `Portals`
d) `Synthetic events`

**Answer: b) `Caching, deduping, background refetch, stale-while-revalidate semantics`**

---

**17. In functional components, “mount” corresponds to effects with:**

a) `useEffect with [] running after paint`
b) `useLayoutEffect with deps including all state`
c) `render phase only`
d) `useId`

**Answer: a) `useEffect with [] running after paint`**

---

**18. “Update” phase effects run when:**

a) `Dependencies change (after render commit for that update)`
b) `Only once`
c) `Never`
d) `Before first render`

**Answer: a) `Dependencies change (after render commit for that update)`**

---

**19. “Unmount” cleanup corresponds to:**

a) `useState initializer`
b) `Effect cleanup functions and ref callbacks with null`
c) `React.memo comparator`
d) `useMemo factory`

**Answer: b) `Effect cleanup functions and ref callbacks with null`**

---

**20. Reconciliation is:**

a) `The process of comparing new element trees with previous fiber tree to compute minimal DOM updates`
b) `The same as hydration only`
c) `Only event delegation`
d) `Only SSR`

**Answer: a) `The process of comparing new element trees with previous fiber tree to compute minimal DOM updates`**

---

**21. Keys in lists help reconciliation by:**

a) `Making items render faster always`
b) `Identifying stable identity of items across reorders/insertions/deletions`
c) `Replacing props`
d) `Disabling diffing`

**Answer: b) `Identifying stable identity of items across reorders/insertions/deletions`**

---

**22. React synthetic events wrap native events to:**

a) `Remove bubbling`
b) `Normalize behavior across browsers and manage pooling/history depending on version; attach delegated listeners`
c) `Block all default actions always`
d) `Replace DOM entirely`

**Answer: b) `Normalize behavior across browsers and manage pooling/history depending on version; attach delegated listeners`**

---

**23. Calling `e.preventDefault()` on a React synthetic event:**

a) `Never works`
b) `Prevents the browser’s default action for that event when allowed`
c) `Stops React rendering`
d) `Only works in capture phase in React 18`

**Answer: b) `Prevents the browser’s default action for that event when allowed`**

---

**24. `e.stopPropagation()` in React:**

a) `Stops reconciliation`
b) `Stops the event from reaching further listeners up/down the DOM tree`
c) `Cancels fetch`
d) `Unmounts portals`

**Answer: b) `Stops the event from reaching further listeners up/down the DOM tree`**

---

**25. React 18 automatic batching batches:**

a) `Only events inside React DOM`
b) `Multiple setState updates in promises, timeouts, and native handlers into fewer renders (broader than React 17)`
c) `Nothing`
d) `Only class setState`

**Answer: b) `Multiple setState updates in promises, timeouts, and native handlers into fewer renders (broader than React 17)`**

---

**26. `flushSync` is used when you need to:**

a) `Always batch more`
b) `Force synchronous DOM flush for imperative reads (escape hatch; use sparingly)`
c) `Replace useTransition`
d) `Disable Strict Mode`

**Answer: b) `Force synchronous DOM flush for imperative reads (escape hatch; use sparingly)`**

---

**27. What is the role of `startTransition` here?**

```jsx
const [isPending, startTransition] = useTransition();

function onChange(e) {
  startTransition(() => {
    setQuery(e.target.value);
  });
}
```

a) `Runs updates as urgent always`
b) `Marks state updates inside as transitions that can be interrupted for higher-priority updates`
c) `Replaces all effects`
d) `Blocks the main thread`

**Answer: b) `Marks state updates inside as transitions that can be interrupted for higher-priority updates`**

---

**28. `useDeferredValue(value)` is useful to:**

a) `Generate unique IDs`
b) `Keep UI responsive by deferring re-rendering of expensive subtrees with a lagging value`
c) `Fetch data`
d) `Replace keys`

**Answer: b) `Keep UI responsive by deferring re-rendering of expensive subtrees with a lagging value`**

---

**29. Why use `useId` like this instead of `Math.random()`?**

```jsx
const id = useId();
return (
  <>
    <label htmlFor={id}>Name</label>
    <input id={id} />
  </>
);
```

a) `Sequential integers only`
b) `Stable unique IDs across SSR/client for accessibility attributes`
c) `UUIDs guaranteed globally unique across machines`
d) `CSS class names only`

**Answer: b) `Stable unique IDs across SSR/client for accessibility attributes`**

---

**30. React 18 concurrent features include concepts like:**

a) `Removing the virtual DOM`
b) `Transitions, deferred values, concurrent rendering/scheduling improvements`
c) `Removing hooks`
d) `Removing events`

**Answer: b) `Transitions, deferred values, concurrent rendering/scheduling improvements`**

---

**31. Relative routes in v6 are often resolved relative to:**

a) `window.origin only`
b) `The parent route path when using relative Link or navigate paths`
c) `Only absolute URLs`
d) `Hash only`

**Answer: b) `The parent route path when using relative Link or navigate paths`**

---

**32. `Navigate` element with `replace` prop:**

a) `Adds a history entry always`
b) `Redirects replacing the current history entry`
c) `Only works in class components`
d) `Loads a script`

**Answer: b) `Redirects replacing the current history entry`**

---

**33. Index routes in nested routing:**

a) `Cannot exist`
b) `Render at parent path when no child matches (default child UI)`
c) `Only for APIs`
d) `Require HashRouter`

**Answer: b) `Render at parent path when no child matches (default child UI)`**

---

**34. Why might you lift state up?**

a) `To make components slower`
b) `To share state between siblings via a common ancestor`
c) `To avoid keys`
d) `To disable Context`

**Answer: b) `To share state between siblings via a common ancestor`**

---

**35. Context performance pitfall:**

a) `Context never triggers renders`
b) `Putting rapidly changing huge objects without splitting/memoization can re-render many consumers`
c) `Context works only once`
d) `Consumers ignore updates`

**Answer: b) `Putting rapidly changing huge objects without splitting/memoization can re-render many consumers`**

---

**36. React Query “stale time” conceptually means:**

a) `Data is forbidden`
b) `How long data is considered fresh before background refetch may occur (library-specific)`
c) `Router path depth`
d) `Transition duration fixed by React`

**Answer: b) `How long data is considered fresh before background refetch may occur (library-specific)`**

---

**37. SWR’s `mutate` can:**

a) `Only delete the cache`
b) `Optimistically update or revalidate cached keys`
c) `Replace ReactDOM`
d) `Compile routes`

**Answer: b) `Optimistically update or revalidate cached keys`**

---

**38. If two children swap positions without keys:**

a) `React always unmounts both`
b) `React may reuse DOM nodes incorrectly, causing state bugs`
c) `Keys are optional with no downside`
d) `Reconciliation is disabled`

**Answer: b) `React may reuse DOM nodes incorrectly, causing state bugs`**

---

**39. Fiber allows React to:**

a) `Remove scheduling`
b) `Interrupt work, prioritize updates, and resume rendering incrementally`
c) `Skip virtual DOM`
d) `Disable events`

**Answer: b) `Interrupt work, prioritize updates, and resume rendering incrementally`**

---

**40. Event handler passed `e` in React 18:**

a) `Is always a native event only`
b) `Synthetic event wrapper; use the nativeEvent property for the underlying DOM event`
c) `Cannot call preventDefault`
d) `Is synchronous during SSR`

**Answer: b) `Synthetic event wrapper; use the nativeEvent property for the underlying DOM event`**

---

**41. Batching does NOT mean:**

a) `Updates may be combined into one render`
b) `Every setState always causes an immediate separate paint synchronously in all cases`
c) `Fewer intermediate renders in many scenarios`
d) `Applies to transitions scheduling`

**Answer: b) `Every setState always causes an immediate separate paint synchronously in all cases`**

---

**42. `useTransition`’s `isPending` indicates:**

a) `Server offline`
b) `A transition update is pending / in progress`
c) `Router loading only`
d) `Suspense is missing`

**Answer: b) `A transition update is pending / in progress`**

---

**43. `useDeferredValue` differs from `startTransition` mainly in that:**

a) `It is for deferring a value you don’t control (e.g., prop), not only updates you wrap`
b) `It replaces useId`
c) `It runs in render phase only always`
d) `It fetches routes`

**Answer: a) `It is for deferring a value you don’t control (e.g., prop), not only updates you wrap`**

---

**44. `useId` should NOT be used for:**

a) `Linking label and input in SSR-safe way`
b) `Generating keys for list items from data`
c) `ARIA attributes`
d) `Stable ids for SVG gradients`

**Answer: b) `Generating keys for list items from data`**

---

**45. React 18 `createRoot` vs legacy `ReactDOM.render`:**

a) `They are identical`
b) `createRoot enables concurrent features and new APIs; legacy root is deprecated`
c) `createRoot removes hydration`
d) `Only affects TypeScript`

**Answer: b) `createRoot enables concurrent features and new APIs; legacy root is deprecated`**

---

**46. Data router `useRouteLoaderData` conceptually provides:**

a) `Window size`
b) `Data returned by the nearest route loader to the component`
c) `CSS variables`
d) `Synthetic events`

**Answer: b) `Data returned by the nearest route loader to the component`**

---

**47. `useFetcher` (React Router) is for:**

a) `Only full page reloads`
b) `Interactions and mutations without changing the URL (non-navigation fetches)`
c) `Portals`
d) `Lazy routes only`

**Answer: b) `Interactions and mutations without changing the URL (non-navigation fetches)`**

---

**48. Comparing Zustand to Context for global UI state:**

a) `Context always avoids renders`
b) `External store patterns can subscribe components narrowly; raw Context may re-render all consumers on any value change`
c) `Zustand cannot use hooks`
d) `They cannot coexist`

**Answer: b) `External store patterns can subscribe components narrowly; raw Context may re-render all consumers on any value change`**

---

**49. Double rendering in Strict Mode (dev) helps detect:**

a) `Production bundle size`
b) `Impure render side effects and missing cleanup assumptions`
c) `Router version`
d) `CSS specificity`

**Answer: b) `Impure render side effects and missing cleanup assumptions`**

---

**50. After this click in React 18, how many renders likely result from batching?**

```jsx
function App() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  return (
    <button
      onClick={() => {
        setA((x) => x + 1);
        setB((y) => y + 1);
      }}
    >
      go
    </button>
  );
}
```

a) `Two renders (one per setState)`
b) `One render (batched in the event handler)`
c) `Zero renders`
d) `Three renders`

**Answer: b) `One render (batched in the event handler)`**

---
