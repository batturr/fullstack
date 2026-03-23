# React MCQ - Set 3 (Intermediate Level)

**1. What does returning a function from `useEffect` represent?**

a) `A way to subscribe to context updates`
b) `A cleanup function that runs before the effect re-runs and on unmount`
c) `A render-phase side effect`
d) `An error handler for the effect`

**Answer: b) `A cleanup function that runs before the effect re-runs and on unmount`**

---

**2. Given this component, when does the cleanup run?**

```jsx
useEffect(() => {
  const id = setInterval(() => setCount((c) => c + 1), 1000);
  return () => clearInterval(id);
}, []);
```

a) `Only when the component unmounts`
b) `Before every re-render`
c) `Before the effect re-runs and on unmount (here, only on unmount because deps are [])`
d) `After every paint`

**Answer: c) `Before the effect re-runs and on unmount (here, only on unmount because deps are [])`**

---

**3. An empty dependency array `[]` in `useEffect` means:**

a) `The effect runs after every render`
b) `The effect runs once after the initial mount (in Strict Mode dev, setup may run twice intentionally)`
c) `The effect never runs`
d) `The effect runs only when props change`

**Answer: b) `The effect runs once after the initial mount (in Strict Mode dev, setup may run twice intentionally)`**

---

**4. Omitting the dependency array entirely (`useEffect(() => { ... })`) means:**

a) `The effect runs only on mount`
b) `The effect runs after every render`
c) `The effect runs in the render phase`
d) `React will throw a warning in all cases`

**Answer: b) `The effect runs after every render`**

---

**5. What is a “stale closure” in the context of hooks?**

a) `When state updates are lost between renders`
b) `When a callback or effect captures outdated values from an older render`
c) `When two components share the same ref`
d) `When Context.Provider is nested incorrectly`

**Answer: b) `When a callback or effect captures outdated values from an older render`**

---

**6. How can you avoid stale `count` inside an interval started in `useEffect` without adding `count` to deps?**

a) `Use count directly in the dependency array only`
b) `Use the functional updater form: setCount((c) => c + 1)`
c) `Use useMemo to freeze count`
d) `Call setState synchronously in render`

**Answer: b) `Use the functional updater form: setCount((c) => c + 1)`**

---

**7. `useReducer` is most appropriate when:**

a) `You only need a single boolean flag`
b) `State logic is complex or multiple sub-values update together`
c) `You must avoid re-renders entirely`
d) `You are replacing Redux in every app`

**Answer: b) `State logic is complex or multiple sub-values update together`**

---

**8. What does `dispatch` returned by `useReducer` guarantee regarding identity across renders?**

a) `It changes every render`
b) `It is stable (same function identity) for a given hook instance`
c) `It is only stable if wrapped in useCallback`
d) `It is undefined until the first update`

**Answer: b) `It is stable (same function identity) for a given hook instance`**

---

**9. A reducer for `useReducer` should be:**

a) `Async and return a Promise`
b) `Pure: given state and action, return the next state without mutating previous state`
c) `Allowed to mutate state if wrapped in batch`
d) `Called during the render of parent components only`

**Answer: b) `Pure: given state and action, return the next state without mutating previous state`**

---

**10. What does the third argument do here?**

```jsx
const [state, dispatch] = useReducer(reducer, 0, (n) => ({ count: n }));
```

a) `It is ignored in React 18`
b) `Lazy initializer: runs once to compute initial state from the second argument`
c) `Runs on every render before the reducer`
d) `Replaces the reducer`

**Answer: b) `Lazy initializer: runs once to compute initial state from the second argument`**

---

**11. `useMemo` returns:**

a) `A memoized callback`
b) `A memoized value computed from the factory function`
c) `A ref object`
d) `A deferred version of state`

**Answer: b) `A memoized value computed from the factory function`**

---

**12. `useCallback(fn, deps)` is roughly equivalent to:**

a) `useMemo(() => fn, deps)`
b) `useMemo(() => fn, [])`
c) `useRef(fn)`
d) `React.memo(fn)`

**Answer: a) `useMemo(() => fn, deps)`**

---

**13. When is `useMemo` / `useCallback` often unnecessary?**

a) `When the computation is trivial or child is not memoized`
b) `When passing children as JSX`
c) `When using Context`
d) `Never; always wrap everything`

**Answer: a) `When the computation is trivial or child is not memoized`**

---

**14. With `const MemoRow = React.memo(Row);`, when will `Row` re-render if `Row` only uses props?**

```jsx
function Parent() {
  const [n, setN] = useState(0);
  const stable = useMemo(() => ({ id: 1 }), []);
  return (
    <>
      <button onClick={() => setN((x) => x + 1)}>+</button>
      <MemoRow meta={stable} />
    </>
  );
}
```

a) `Every time n changes because Parent re-renders`
b) `Only when shallow prop comparison says props changed (here meta identity is stable, so not when only n changes)`
c) `Never, memo blocks all updates`
d) `Only in production`

**Answer: b) `Only when shallow prop comparison says props changed (here meta identity is stable, so not when only n changes)`**

---

**15. Custom hooks must:**

a) `Be named with use prefix and only call other hooks at the top level of the custom hook`
b) `Return JSX`
c) `Be defined in files named use*.tsx only`
d) `Always accept an initial state argument`

**Answer: a) `Be named with use prefix and only call other hooks at the top level of the custom hook`**

---

**16. Calling hooks inside a nested function (non-hook) violates:**

a) `The naming convention rule`
b) `The rules of hooks (only call hooks from React functions at top level)`
c) `The reducer purity rule`
d) `Strict Mode only`

**Answer: b) `The rules of hooks (only call hooks from React functions at top level)`**

---

**17. Multiple Context providers for unrelated concerns is generally:**

a) `Forbidden by React`
b) `A valid pattern to avoid one mega-context`
c) `Slower than a single context with everything`
d) `Only allowed with Redux`

**Answer: b) `A valid pattern to avoid one mega-context`**

---

**18. Combining Context with `useReducer` is commonly used to:**

a) `Replace the virtual DOM`
b) `Provide dispatch and state without prop drilling for medium-sized global state`
c) `Eliminate all re-renders`
d) `Run effects in the render phase`

**Answer: b) `Provide dispatch and state without prop drilling for medium-sized global state`**

---

**19. Class component error boundaries use which lifecycle for errors in the tree?**

a) `componentDidMount`
b) `componentDidCatch` (and optionally static `getDerivedStateFromError` for UI fallback state)`
c) `shouldComponentUpdate`
d) `getSnapshotBeforeUpdate`

**Answer: b) `componentDidCatch` (and optionally static `getDerivedStateFromError` for UI fallback state)`**

---

**20. Error boundaries catch errors during:**

a) `Event handlers, async code, and SSR errors universally`
b) `Rendering, lifecycle methods, and constructors of descendants (not most event handlers/async by default)`
c) `Only useEffect cleanups`
d) `Only warnings from React`

**Answer: b) `Rendering, lifecycle methods, and constructors of descendants (not most event handlers/async by default)`**

---

**21. `React.lazy` expects:**

a) `A synchronous component`
b) `A function that returns a dynamic import() Promise resolving to a module with a default export component`
c) `A string path to a chunk`
d) `A reducer`

**Answer: b) `A function that returns a dynamic import() Promise resolving to a module with a default export component`**

---

**22. What must wrap a `React.lazy` component to handle loading state?**

a) `React.StrictMode only`
b) `Suspense with a fallback`
c) `ErrorBoundary only`
d) `Portal`

**Answer: b) `Suspense with a fallback`**

---

**23. Code splitting at route level typically:**

a) `Loads all routes in the initial bundle`
b) `Defers loading route modules until navigated, reducing initial JS`
c) `Requires webpack only`
d) `Disables Suspense`

**Answer: b) `Defers loading route modules until navigated, reducing initial JS`**

---

**24. What does this pattern achieve?**

```jsx
import { createPortal } from "react-dom";

return createPortal(<Modal>{children}</Modal>, document.getElementById("modal-root"));
```

a) `Split bundles`
b) `Render children into a DOM node outside the parent DOM hierarchy while keeping React tree context`
c) `Replace refs`
d) `Catch errors`

**Answer: b) `Render children into a DOM node outside the parent DOM hierarchy while keeping React tree context`**

---

**25. A higher-order component (HOC) pattern typically:**

a) `Returns hooks from a function`
b) `Is a function that takes a component and returns a new component with added behavior/props`
c) `Must be named with use prefix`
d) `Cannot access Context`

**Answer: b) `Is a function that takes a component and returns a new component with added behavior/props`**

---

**26. HOC downsides compared to hooks include:**

a) `Impossible to compose`
b) `Prop name collisions / “wrapper hell” and harder debugging of component stacks`
c) `Cannot use with class components`
d) `No access to state`

**Answer: b) `Prop name collisions / “wrapper hell” and harder debugging of component stacks`**

---

**27. Render props pattern means:**

a) `Passing a function as a child or prop that returns UI, sharing logic via invocation`
b) `Using only CSS to render`
c) `Rendering in useLayoutEffect exclusively`
d) `Returning null from render`

**Answer: a) `Passing a function as a child or prop that returns UI, sharing logic via invocation`**

---

**28. How should you describe this input?**

```jsx
const [value, setValue] = useState("");
return <input value={value} onChange={(e) => setValue(e.target.value)} />;
```

a) `Uses defaultValue and manages DOM internally`
b) `Derives its value from React state and updates state on onChange`
c) `Never fires onChange`
d) `Requires uncontrolled ref only`

**Answer: b) `Derives its value from React state and updates state on onChange`**

---

**29. What happens if you set `value` on an input but omit `onChange`?**

a) `React allows free typing`
b) `You get a read-only controlled input warning/behavior (user cannot change it via typing)`
c) `The input becomes uncontrolled automatically`
d) `React throws immediately`

**Answer: b) `You get a read-only controlled input warning/behavior (user cannot change it via typing)`**

---

**30. `forwardRef` is used to:**

a) `Forward props only`
b) `Expose a child DOM node or imperative instance to parent refs`
c) `Replace Context`
d) `Batch updates`

**Answer: b) `Expose a child DOM node or imperative instance to parent refs`**

---

**31. `useImperativeHandle(ref, createHandle, deps)` should be paired with:**

a) `useRef on the parent only`
b) `forwardRef on the component receiving the ref`
c) `React.memo always`
d) `useId`

**Answer: b) `forwardRef on the component receiving the ref`**

---

**32. What will log on first mount (assuming Strict Mode double-invocation of effects in dev)?**

```jsx
useEffect(() => {
  console.log("effect");
  return () => console.log("cleanup");
}, []);
```

a) `Only "effect"`
b) `"effect" then "cleanup" then "effect" in React 18 Strict Mode (dev)`
c) `"cleanup" only`
d) `Nothing`

**Answer: b) `"effect" then "cleanup" then "effect" in React 18 Strict Mode (dev)`**

---

**33. If you add `userId` to the dependency array but read `user` object fields not listed, you risk:**

a) `Automatic deep comparison fixing it`
b) `Missing dependency updates / stale data unless user is stable or fully included`
c) `Infinite loop always`
d) `SSR failure`

**Answer: b) `Missing dependency updates / stale data unless user is stable or fully included`**

---

**34. `dispatch({ type: "increment" })` with `useReducer` triggers:**

a) `Synchronous re-render of all roots`
b) `A state update scheduled like other setState updates`
c) `Immediate DOM commit before event handler finishes`
d) `No re-render until unmount`

**Answer: b) `A state update scheduled like other setState updates`**

---

**35. `useMemo` factory runs again when:**

a) `Never after first run`
b) `Dependencies change (shallow compare) or on first render`
c) `Only when parent re-renders`
d) `Only in production`

**Answer: b) `Dependencies change (shallow compare) or on first render`**

---

**36. Custom hook `useWindowWidth` that subscribes to `resize` should:**

a) `Add listener in render`
b) `Add listener in useEffect with cleanup removing listener`
c) `Use useMemo for resize`
d) `Call window APIs in reducer`

**Answer: b) `Add listener in useEffect with cleanup removing listener`**

---

**37. Splitting `ThemeContext` and `UserContext` helps because:**

a) `React merges contexts automatically`
b) `Consumers only re-render when their context value changes`
c) `Context cannot nest`
d) `Portals break single context`

**Answer: b) `Consumers only re-render when their context value changes`**

---

**38. `getDerivedStateFromError` should:**

a) `Perform side effects like logging to a server`
b) `Return an object to update state or null; stay pure`
c) `Return JSX`
d) `Call setState directly`

**Answer: b) `Return an object to update state or null; stay pure`**

---

**39. `componentDidCatch(error, info)` may:**

a) `Only return state`
b) `Log errors and perform side effects`
c) `Run during SSR for all errors`
d) `Replace Suspense`

**Answer: b) `Log errors and perform side effects`**

---

**40. Lazy route fails to render without Suspense; the user typically sees:**

a) `Silent blank screen only`
b) `Suspense fallback while chunk loads (or error if misconfigured)`
c) `Immediate crash of entire app without boundary`
d) `Static HTML only`

**Answer: b) `Suspense fallback while chunk loads (or error if misconfigured)`**

---

**41. Portals preserve:**

a) `Nothing from React tree`
b) `Event bubbling through React tree and context as if still in parent hierarchy`
c) `Only CSS variables`
d) `Only refs`

**Answer: b) `Event bubbling through React tree and context as if still in parent hierarchy`**

---

**42. Render prop vs HOC for sharing mouse position:**

a) `HOC cannot share state`
b) `Render prop inverts control: consumer decides what to render with data`
c) `Render props cannot access hooks`
d) `They are identical in React internals`

**Answer: b) `Render prop inverts control: consumer decides what to render with data`**

---

**43. Controlled select with unknown option value should use:**

a) `defaultValue only`
b) `value must match an option value, or use empty string / placeholder pattern`
c) `key on parent only`
d) `uncontrolled mode with ref`

**Answer: b) `value must match an option value, or use empty string / placeholder pattern`**

---

**44. `forwardRef` + function component without `forwardRef` when parent passes ref:**

a) `Ref attaches automatically`
b) `Warning/error: function components cannot receive refs unless forwardRef/memo with forwardRef`
c) `Ref goes to first child always`
d) `Works only in Strict Mode`

**Answer: b) `Warning/error: function components cannot receive refs unless forwardRef/memo with forwardRef`**

---

**45. `useImperativeHandle` is appropriate when:**

a) `You want maximum encapsulation but parent needs limited imperative methods`
b) `You want to replace all props`
c) `You must avoid forwardRef`
d) `Only for class components`

**Answer: a) `You want maximum encapsulation but parent needs limited imperative methods`**

---

**46. `React.memo` second argument is:**

a) `A dependency array`
b) `Optional custom props comparison function returning true if props are equal`
c) `A ref callback`
d) `A context consumer`

**Answer: b) `Optional custom props comparison function returning true if props are equal`**

---

**47. Stale closure in `useEffect` with `[query]` missing `page`:**

a) `Always fixed by eslint`
b) `Effect may run with an outdated page value captured from closure`
c) `page updates automatically inside effect`
d) `Only happens with classes`

**Answer: b) `Effect may run with an outdated page value captured from closure`**

---

**48. Code splitting dynamic import in event handler:**

a) `Is impossible`
b) `Loads chunk when triggered; not in initial route-based split unless prefetched`
c) `Always blocks UI without Suspense`
d) `Requires lazy()`

**Answer: b) `Loads chunk when triggered; not in initial route-based split unless prefetched`**

---

**49. Context + memoized value pattern uses `useMemo` on context value to:**

a) `Prevent any child render`
b) `Stabilize object identity when contents unchanged, reducing unnecessary consumer updates`
c) `Replace reducers`
d) `Enable portals`

**Answer: b) `Stabilize object identity when contents unchanged, reducing unnecessary consumer updates`**

---

**50. Which pair correctly describes `useCallback` usage?**

a) `Stabilize a function passed to a memoized child that depends on that identity`
b) `Always improves performance even if children are not memoized`
c) `Replaces useReducer`
d) `Runs work during render synchronously on every paint`

**Answer: a) `Stabilize a function passed to a memoized child that depends on that identity`**

---
