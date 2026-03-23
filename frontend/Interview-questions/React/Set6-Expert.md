# React MCQ - Set 6 (Expert Level)

**1. `React.createElement(type, props, ...children)` ultimately produces:**

a) `A real DOM node`
b) `A plain object describing what to render (a React element)`
c) `A Fiber node directly`
d) `A Promise`

**Answer: b) `A plain object describing what to render (a React element)`**

---

**2. In the Fiber model, the `return` pointer on a fiber points to:**

a) `The next sibling in the list`
b) `The parent fiber`
c) `The DOM container`
d) `The Redux store`

**Answer: b) `The parent fiber`**

---

**3. React’s render phase is best described as:**

a) `Applying mutations to the DOM immediately`
b) `Calling components to compute an updated fiber tree (can be interrupted in concurrent mode)`
c) `Running all useEffect cleanups`
d) `Fetching data only`

**Answer: b) `Calling components to compute an updated fiber tree (can be interrupted in concurrent mode)`**

---

**4. The commit phase is when React:**

a) `Bails out of all updates`
b) `Applies DOM mutations and runs layout/paint effects after a tree is finalized`
c) `Parses JSX at build time only`
d) `Creates React elements only`

**Answer: b) `Applies DOM mutations and runs layout/paint effects after a tree is finalized`**

---

**5. Lanes in React’s scheduler are used to:**

a) `Hash CSS class names`
b) `Represent update priorities and batch/merge related work`
c) `Replace keys in lists`
d) `Compile TypeScript`

**Answer: b) `Represent update priorities and batch/merge related work`**

---

**6. An edge case: returning `null` from a component causes React to:**

a) `Throw in production`
b) `Reconcile to no output for that position (no host nodes from that component)`
c) `Reuse the previous DOM subtree unchanged`
d) `Force hydration mismatch`

**Answer: b) `Reconcile to no output for that position (no host nodes from that component)`**

---

**7. Mixing controlled and uncontrolled inputs (toggling `value` vs defaultValue patterns) often leads to:**

a) `Faster reconciliation`
b) `Warnings and inconsistent UI because React cannot enforce a single source of truth`
c) `Automatic memoization`
d) `Better SEO`

**Answer: b) `Warnings and inconsistent UI because React cannot enforce a single source of truth`**

---

**8. If two children swap positions but keep the same keys, React will:**

a) `Always unmount both`
b) `Reorder fibers/DOM when possible instead of remounting, preserving state tied to keys`
c) `Ignore keys for host components`
d) `Drop state randomly`

**Answer: b) `Reorder fibers/DOM when possible instead of remounting, preserving state tied to keys`**

---

**9. Reconciliation compares:**

a) `The previous and next element trees at a fiber’s position`
b) `Only CSS class strings`
c) `Only context consumers`
d) `Webpack chunks`

**Answer: a) `The previous and next element trees at a fiber’s position`**

---

**10. Fragments (`<>...</>`) affect reconciliation by:**

a) `Introducing an extra DOM element always`
b) `Grouping children without adding a host node, so children reconcile against parent’s child list`
c) `Disabling keys`
d) `Skipping the commit phase`

**Answer: b) `Grouping children without adding a host node, so children reconcile against parent’s child list`**

---

**11. Updates wrapped in `startTransition` generally have:**

a) `Higher priority than discrete input updates like typing`
b) `Lower priority than urgent updates, so they can be interrupted`
c) `The same priority as every useEffect`
d) `No scheduling`

**Answer: b) `Lower priority than urgent updates, so they can be interrupted`**

---

**12. Nested Suspense boundaries allow:**

a) `Only one fallback for the entire app`
b) `Finer-grained loading UI: inner boundaries resolve without blocking outer fallbacks incorrectly`
c) `Removing error boundaries`
d) `Synchronous server-only rendering only`

**Answer: b) `Finer-grained loading UI: inner boundaries resolve without blocking outer fallbacks incorrectly`**

---

**13. Selective hydration refers to:**

a) `Hydrating the entire document before any paint`
b) `Prioritizing hydration for interactive regions while deferring less critical subtrees`
c) `Disabling events until all images load`
d) `Removing Suspense`

**Answer: b) `Prioritizing hydration for interactive regions while deferring less critical subtrees`**

---

**14. Concurrent features can cause components to:**

a) `Never re-render`
b) `Render more than once before commit if work is discarded and retried`
c) `Skip the virtual DOM`
d) `Run hooks in random order`

**Answer: b) `Render more than once before commit if work is discarded and retried`**

---

**15. A Suspense boundary shows its fallback when:**

a) `Any state update occurs`
b) `A child suspends (throws a Promise to the nearest boundary) while rendering`
c) `Strict Mode is on`
d) `TypeScript fails`

**Answer: b) `A child suspends (throws a Promise to the nearest boundary) while rendering`**

---

**16. React Testing Library encourages queries that:**

a) `Target implementation details like internal state names`
b) `Resemble how users find elements (roles, labels, text)`
c) `Require CSS module hashes`
d) `Always use document.body.innerHTML only`

**Answer: b) `Resemble how users find elements (roles, labels, text)`**

---

**17. `act()` is important because it:**

a) `Replaces jest entirely`
b) `Flushes React updates/effects associated with a unit of testing work so assertions see consistent UI`
c) `Mocks fetch automatically`
d) `Runs tests in the browser only`

**Answer: b) `Flushes React updates/effects associated with a unit of testing work so assertions see consistent UI`**

---

**18. `waitFor` from Testing Library is used to:**

a) `Assert synchronous renders only`
b) `Retry assertions until async UI updates settle or a timeout occurs`
c) `Replace user-event`
d) `Compile components`

**Answer: b) `Retry assertions until async UI updates settle or a timeout occurs`**

---

**19. Testing custom hooks in isolation is commonly done with:**

a) `Rendering a test harness component that calls the hook and exposes values`
b) `Importing hook internals via reflection`
c) `Calling hooks outside React in a plain function without a component`
d) `Using only shallow render`

**Answer: a) `Rendering a test harness component that calls the hook and exposes values`**

---

**20. Mocking a child component with `jest.mock` can be problematic when:**

a) `You want faster tests`
b) `You accidentally remove behavior the parent relies on, hiding integration bugs`
c) `You use TypeScript`
d) `You use roles in queries`

**Answer: b) `You accidentally remove behavior the parent relies on, hiding integration bugs`**

---

**21. Async code in tests often requires:**

a) `Removing await entirely`
b) `Awaiting findBy queries or waitFor after user interactions`
c) `Disabling act warnings by ignoring them`
d) `Using only snapshot tests`

**Answer: b) `awaiting findBy queries or waitFor after user interactions`**

---

**22. Which snippet is invalid because it breaks the rules of hooks?**

```jsx
function Bad({ show }) {
  if (show) {
    const [x, setX] = useState(0);
  }
  return null;
}
```

a) `Valid: conditional hooks are allowed`
b) `Invalid: hooks must be called unconditionally at the top level`
c) `Invalid only in Strict Mode`
d) `Valid if show is stable`

**Answer: b) `Invalid: hooks must be called unconditionally at the top level`**

---

**23. A generic React component is declared like:**

```tsx
function Select<T>(props: { items: T[]; getLabel: (item: T) => string }) {
  return null;
}
```

What is the primary benefit?**

a) `Slower builds`
b) `Props and render logic stay type-safe for arbitrary item types`
c) `Runtime validation of all props`
d) `Removing the need for keys`

**Answer: b) `Props and render logic stay type-safe for arbitrary item types`**

---

**24. Discriminated unions for props are useful when:**

a) `Every prop is optional`
b) `Different variants require different required fields, enforced by a discriminant like kind or mode`
c) `You avoid using TypeScript`
d) `You only use class components`

**Answer: b) `Different variants require different required fields, enforced by a discriminant like kind or mode`**

---

**25. Typing `useReducer` well typically involves:**

a) `Using only any`
b) `Defining Action and State types and annotating the reducer`
c) `Avoiding tuples`
d) `Using only useState`

**Answer: b) `Defining Action and State types and annotating the reducer`**

---

**26. `createContext` with TypeScript often uses `undefined` default carefully because:**

a) `Context must be null always`
b) `Consumers may need guards or a non-null assertion if no sensible default exists`
c) `TypeScript forbids context`
d) `Default values replace providers`

**Answer: b) `Consumers may need guards or a non-null assertion if no sensible default exists`**

---

**27. Typing an HOC that injects props often uses:**

a) `Omit / Pick utility types to subtract injected props from the wrapped component’s public props`
b) `Only enums`
c) `The never type for all props`
d) `globalThis`

**Answer: a) `Omit / Pick utility types to subtract injected props from the wrapped component’s public props`**

---

**28. `useRef<HTMLInputElement>(null)` is preferable to `useRef(null) as any` because:**

a) `Refs cannot hold DOM nodes`
b) `You get correct typings for DOM APIs like focus()`
c) `It removes null checks entirely`
d) `It disables Strict Mode`

**Answer: b) `You get correct typings for DOM APIs like focus()`**

---

**29. Render delegation (e.g., `asChild` patterns) means:**

a) `The parent always renders a fixed DOM element`
b) `The parent merges behavior/props onto a user-supplied child element instead of owning the outer node`
c) `Children cannot be functions`
d) `Context is forbidden`

**Answer: b) `The parent merges behavior/props onto a user-supplied child element instead of owning the outer node`**

---

**30. The provider pattern centralizes:**

a) `Webpack configuration`
b) `Shared state or configuration via context providers consumed by subtree components`
c) `CSS specificity`
d) `Fiber lanes`

**Answer: b) `Shared state or configuration via context providers consumed by subtree components`**

---

**31. An observer-style integration (e.g., MobX-like) with React typically:**

a) `Avoids re-renders completely always`
b) `Tracks observable reads during render and schedules targeted re-renders when observables change`
c) `Requires class components`
d) `Cannot work with hooks`

**Answer: b) `Tracks observable reads during render and schedules targeted re-renders when observables change`**

---

**32. Module federation at a high level enables:**

a) `Replacing the React reconciler`
b) `Loading independently built remote bundles at runtime and sharing dependencies`
c) `Removing TypeScript`
d) `Server Components only`

**Answer: b) `Loading independently built remote bundles at runtime and sharing dependencies`**

---

**33. The React Compiler (React Forget direction) aims to:**

a) `Remove JSX`
b) `Automatically memoize where safe via compile-time analysis, reducing manual memo noise`
c) `Replace Fiber with a VM`
d) `Disable concurrent mode`

**Answer: b) `Automatically memoize where safe via compile-time analysis, reducing manual memo noise`**

---

**34. A key implication of compile-time memoization is:**

a) `Runtime behavior becomes nondeterministic`
b) `Developers still must reason about purity; impure render output can still be wrong if “optimized”`
c) `Hooks are no longer needed`
d) `Effects run during render`

**Answer: b) `Developers still must reason about purity; impure render output can still be wrong if optimized`**

---

**35. Modeling UI with explicit states and events (XState-style) differs from ad-hoc booleans by:**

a) `Guaranteeing smaller bundles always`
b) `Making transitions explicit and reducing invalid state combinations`
c) `Removing the need for React`
d) `Disabling async`

**Answer: b) `Making transitions explicit and reducing invalid state combinations`**

---

**36. “Atomic” state libraries (e.g., Jotai-style) often emphasize:**

a) `One global reducer only`
b) `Granular atoms/selectors to limit rerender scope`
c) `No subscriptions`
d) `Only server state`

**Answer: b) `Granular atoms/selectors to limit rerender scope`**

---

**37. Signals (conceptually) compared to classic React state often highlight:**

a) `Fine-grained subscriptions updating DOM without re-running full component functions`
b) `Mandatory context providers`
c) `No reactivity`
d) `Removing virtual DOM always`

**Answer: a) `Fine-grained subscriptions updating DOM without re-running full component functions`**

---

**38. Focus management after route or dialog changes should often:**

a) `Ignore focus for simplicity`
b) `Move focus to a sensible element (e.g., heading or dialog) for keyboard users`
c) `Blur every element`
d) `Disable tab order globally`

**Answer: b) `Move focus to a sensible element (e.g., heading or dialog) for keyboard users`**

---

**39. Live regions (`aria-live`) are appropriate when:**

a) `Hiding all content from screen readers`
b) `Announcing dynamic status updates without moving focus`
c) `Replacing labels`
d) `Styling buttons`

**Answer: b) `Announcing dynamic status updates without moving focus`**

---

**40. Custom widgets that act like buttons should generally:**

a) `Use div with onClick only and no keyboard support`
b) `Support keyboard activation (Enter/Space) and appropriate ARIA if not native button`
c) `Avoid tabIndex`
d) `Use role presentation for everything`

**Answer: b) `Support keyboard activation (Enter/Space) and appropriate ARIA if not native button`**

---

**41. Semantic HTML in components helps accessibility because:**

a) `It automatically fixes all bugs`
b) `Assistive tech can use native roles/behaviors (e.g., button, nav, main) with less ARIA`
c) `It removes need for labels`
d) `It disables CSS`

**Answer: b) `Assistive tech can use native roles/behaviors (e.g., button, nav, main) with less ARIA`**

---

**42. React 19 Server Actions are often associated with:**

a) `Client-only fetch in useEffect always`
b) `Progressive enhancement: forms can post to server functions without client JS for basic cases`
c) `Removing HTML forms`
d) `Disabling hydration`

**Answer: b) `Progressive enhancement: forms can post to server functions without client JS for basic cases`**

---

**43. `useFormStatus` (React 19) is intended to be called from:**

a) `Any module scope`
b) `A component that is a descendant of a form, to read pending state of that form submission`
c) `Only class components`
d) `Server entrypoints only`

**Answer: b) `A component that is a descendant of a form, to read pending state of that form submission`**

---

**44. `useFormState` wraps a server or action handler to:**

a) `Replace all useReducer usage`
b) `Track the last returned state from a form action across submissions`
c) `Disable validation`
d) `Remove controlled inputs`

**Answer: b) `Track the last returned state from a form action across submissions`**

---

**45. `useOptimistic` lets UI:**

a) `Skip re-renders entirely`
b) `Show an immediate optimistic state that can reconcile when async work finishes`
c) `Replace Suspense`
d) `Run effects before render`

**Answer: b) `Show an immediate optimistic state that can reconcile when async work finishes`**

---

**46. The `use()` hook can read:**

a) `Only numbers`
b) `A Promise or Context during render (per React rules), integrating async data into the tree`
c) `Only refs`
d) `Only Redux`

**Answer: b) `A Promise or Context during render (per React rules), integrating async data into the tree`**

---

**47. Given:**

```jsx
import { useState, useOptimistic } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  const [optimistic, addOptimistic] = useOptimistic(count, (prev, n) => prev + n);
  return <button onClick={() => addOptimistic(1)}>{optimistic}</button>;
}
```

**What happens visually when the button is clicked (before any async resolution completes)?**

a) `The label stays at the previous count until blur`
b) `The label can jump ahead optimistically (e.g., count + 1)`
c) `React throws because useOptimistic is illegal on buttons`
d) `The count resets to 0`

**Answer: b) `The label can jump ahead optimistically (e.g., count + 1)`**

---

**48. React 19 Actions pair well with forms because:**

a) `They remove the need for HTML`
b) `They allow functions as action and formAction props with built-in pending states`
c) `They disable progressive enhancement`
d) `They only work with GET`

**Answer: b) `They allow functions as action and formAction props with built-in pending states`**

---

**49. `use()` with a Promise will:**

a) `Always return undefined`
b) `Suspend the component until the Promise resolves (with Suspense boundaries as usual)`
c) `Run only on the server`
d) `Replace error boundaries`

**Answer: b) `Suspend the component until the Promise resolves (with Suspense boundaries as usual)`**

---

**50. A practical accessibility pattern for modal dialogs in React is:**

a) `Use display:none on the page behind the dialog without moving focus`
b) `Trap focus inside the dialog, restore focus on close, and label the dialog`
c) `Remove all headings`
d) `Use only mouse events`

**Answer: b) `Trap focus inside the dialog, restore focus on close, and label the dialog`**

---
</think>


<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
Read