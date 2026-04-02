# React 19 Interview Questions — Freshers (0–2 Years)

100 fundamental questions with detailed answers. Use this for revision and mock interviews.

## 1. What is React, and what problems does it solve?

React is a JavaScript library for building user interfaces, originally created at Meta and now maintained by the community alongside Meta. It encourages you to think in terms of reusable components that describe how the UI should look for a given application state, which makes large applications easier to reason about than manually wiring the DOM with imperative updates everywhere. React solves the problem of keeping the view in sync with data by computing what changed and updating the DOM efficiently, rather than forcing you to track every DOM node yourself. It also addresses team scalability by providing predictable patterns: one-way data flow, composition, and a rich ecosystem of tools and libraries. For freshers, the mental shift is from “tell the browser exactly how to change each element” to “describe the UI as a function of state and let React reconcile differences.” React does not prescribe routing, global state, or styling by itself; those are layered on with companion libraries or frameworks like React Router, Redux or Zustand, and CSS solutions. In modern stacks, React often pairs with a bundler (for example Vite) and sometimes with a meta-framework (for example Next.js) for routing, data loading, and deployment concerns.

```jsx
function Welcome({ name }) {
  return <h1>Hello, {name}</h1>;
}

export default function App() {
  return <Welcome name="Ada" />;
}
```

---

## 2. What is JSX, and how does it work under the hood?

JSX is a syntax extension that looks like HTML inside JavaScript, but it is not HTML and it does not run in the browser unchanged. Under the hood, build tools such as Babel or TypeScript compile JSX into plain JavaScript calls, typically `React.createElement` (or the newer automatic JSX runtime’s `_jsx` helpers), which produce plain JavaScript objects describing what to render. Those objects are called React elements: they carry a type (such as a string tag name or a function component), props, and children. This compilation step is why you must import React in older setups, while the automatic runtime can inject the helper imports for you. JSX expressions inside curly braces allow arbitrary JavaScript values to be embedded in the tree, which is how you interpolate variables, call functions, and conditionally render fragments of UI. Because JSX compiles to function calls, you can use it anywhere an expression is valid, store subtrees in variables, pass them as props, and return them from functions. Understanding JSX as “syntactic sugar for element creation” helps demystify errors: a missing key in a list, invalid attribute names, or returning multiple top-level nodes without a wrapper often trace back to how elements are constructed and reconciled.

```jsx
// JSX you write:
const element = <button className="primary">{label}</button>;

// Conceptually compiles to something like:
const element = React.createElement("button", { className: "primary" }, label);
```

---

## 3. What are components, and what is the difference between functional and class components?

A component is a reusable piece of UI logic that returns React elements describing what should appear on screen. Functional components are plain JavaScript functions that accept a `props` object and return JSX (or `null`), and they are the standard way to write React today. Class components are ES2015 classes extending `React.Component` that implement a `render` method and historically were the only way to use certain lifecycle features before hooks existed. With the introduction of hooks, nearly everything you once did in classes—state, side effects, context, refs—can be expressed in function components in a more composable way. Class components still exist in older codebases and remain supported, but new application code should prefer functions plus hooks for consistency and simpler mental models. For interviews, emphasize composition: small components that do one job well, combined to build screens. The distinction matters less for “which is better” and more for maintenance: teams converge on functions because they reduce boilerplate and align with hooks-first documentation and tooling.

```jsx
// Functional component (preferred today)
function Counter({ step = 1 }) {
  const [n, setN] = React.useState(0);
  return <button onClick={() => setN((x) => x + step)}>Count: {n}</button>;
}

// Class component (legacy pattern)
class LegacyCounter extends React.Component {
  state = { n: 0 };
  render() {
    return (
      <button onClick={() => this.setState({ n: this.state.n + 1 })}>
        Count: {this.state.n}
      </button>
    );
  }
}
```

---

## 4. What are props, and how do they work in React?

Props (short for properties) are the inputs you pass from a parent component to a child component so that the child can render differently without knowing where the data came from. In function components, props arrive as the first argument object; in class components, they are available as `this.props`. Props are read-only from the child’s perspective: a child should not mutate the props object because that breaks React’s predictability and can interfere with reconciliation and memoization. If a child needs to communicate upward, the parent passes down callback functions as props (the “lifting state up” pattern), and the child invokes those callbacks with new values or events. Default values can be supplied via default parameters, `defaultProps` (classes or legacy patterns), or destructuring with defaults. TypeScript interfaces for props are common in professional codebases because they catch mistakes at compile time. Understanding props as the external configuration of a component helps you design clear boundaries: presentational pieces receive data and callbacks, while containers fetch or own state.

```jsx
function Avatar({ src, alt, size = 40 }) {
  return <img width={size} height={size} src={src} alt={alt} />;
}

function ProfileHeader({ user, onEdit }) {
  return (
    <header>
      <Avatar src={user.avatarUrl} alt={user.name} />
      <h2>{user.name}</h2>
      <button type="button" onClick={onEdit}>
        Edit
      </button>
    </header>
  );
}
```

---

## 5. What is state in React?

State is data that belongs to a component (or to an external store) and can change over time, causing React to re-render when updates occur. In function components, `useState` and `useReducer` are the primary hooks for local state, while context or libraries handle broader sharing. Unlike props, state is intended to be updated through React’s APIs (`setState` in classes, setter functions from `useState`, or dispatch from `useReducer`), which schedule renders rather than mutating variables silently. Choosing what should be state is a design skill: prefer minimal state and derive everything you can from that state during render, which reduces bugs from duplicated sources of truth. For asynchronous updates, functional updaters like `setCount((c) => c + 1)` help avoid stale closures when multiple updates happen in quick succession. State updates may be batched for performance, meaning you should not assume intermediate renders occur after every single setter call in the same event handler.

```jsx
function SearchBox() {
  const [query, setQuery] = React.useState("");
  const normalized = query.trim().toLowerCase(); // derived, not stored separately

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder={`Searching: ${normalized || "…"}`}
    />
  );
}
```

---

## 6. What is the Virtual DOM, and how does React use it?

The Virtual DOM is a lightweight in-memory representation of the UI as a tree of React elements, not the browser’s actual DOM nodes. When state or props change, React runs your component functions again to produce a new element tree, then compares it with the previous tree in a process called reconciliation to compute the minimum set of changes needed. This indirection lets React batch updates and avoid many expensive direct DOM operations that naive hand-written code might trigger. It is a common misconception that the Virtual DOM is always faster than every alternative; rather, it provides predictable structure and opportunities for optimization (like memoization and concurrent features) at the framework level. React still ultimately manipulates the real DOM through a renderer such as `react-dom` for the web. Understanding the Virtual DOM helps explain why immutable updates matter: if you mutate objects in place, React may not detect changes correctly and the UI can drift out of sync.

```jsx
function List({ items }) {
  // React builds a virtual tree from this JSX on each render.
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.label}</li>
      ))}
    </ul>
  );
}
```

---

## 7. What is reconciliation?

Reconciliation is React’s algorithm for diffing the previous render’s element tree with the next render’s tree to decide which DOM nodes to create, update, or remove. React compares trees starting at the root and generally assumes that elements of the same type can be updated in place, while different types cause subtree replacement. For lists, the `key` prop helps React match items across renders so that reordering, insertion, and deletion do not destroy internal state unnecessarily. The exact heuristics are implementation details, but the developer-facing lesson is stable identities for list items and avoiding unnecessary remounts. Concurrent React features can interrupt and resume rendering work, but reconciliation remains the conceptual backbone of how updates become commits to the host tree. When you hear “React is declarative,” reconciliation is the machinery that makes that declaration efficient.

```jsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        // key stabilizes identity across reordering
        <li key={todo.id}>
          <input defaultValue={todo.text} />
        </li>
      ))}
    </ul>
  );
}
```

---

## 8. What is the component lifecycle?

The lifecycle is the sequence of phases a component goes through from mount to unmount: initialization, render, commit to the DOM, and cleanup. In class components, this maps to methods like `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount`. In function components, `useEffect` (and related hooks) express “after paint” side effects, while render itself should stay pure and fast. Mount means the component instance is created and inserted; update means props or state changed and React re-rendered; unmount means the component is removed and you should release resources. Strict Mode in development may intentionally double-invoke certain lifecycles to surface unsafe side effects, which surprises beginners but protects production quality. Thinking in lifecycle terms helps debug issues like subscriptions leaking, stale closures in effects, or animations firing at the wrong time.

```jsx
function Clock() {
  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id); // cleanup on unmount
  }, []);

  return <p>{now.toLocaleTimeString()}</p>;
}
```

---

## 9. What is conditional rendering?

Conditional rendering means choosing what JSX to return based on props, state, or context, so different UI appears under different conditions without separate pages of imperative DOM code. Common patterns include the `&&` operator for “render if true,” ternary expressions for “either A or B,” and early `return null` guards when prerequisites are missing. You should keep conditions readable: complex logic can be moved into helper functions or variables above the return to avoid deeply nested JSX. Accessibility and UX still matter: loading states, empty states, and error states are all conditional renders that should be planned explicitly. Remember that `0 && <Thing />` will render `0` in React because `0` is a valid React child, a frequent pitfall for beginners.

```jsx
function Banner({ status, message }) {
  if (!message) return null;
  if (status === "error") {
    return <div role="alert">{message}</div>;
  }
  return <div className="info">{message}</div>;
}
```

---

## 10. What are lists and keys in React?

Lists are collections rendered by mapping an array to an array of elements, typically siblings under a parent like `<ul>` or a fragment. The `key` prop is a stable identifier React uses to match list items between renders, which is critical when items reorder, are inserted, or removed. Keys should be unique among siblings and should represent the identity of the data row, usually a database id, not the array index unless the list is static and never reordered. Using index as key for dynamic lists can cause subtle bugs because component state may attach to the wrong row after reordering. Keys are not props in the usual sense; they are instructions to React’s reconciler and are not accessible as `props.key` inside the child in the way you might expect. Good list hygiene also includes avoiding expensive work inside `map` without memoization when lists grow large.

```jsx
function UserList({ users }) {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          {user.name} — {user.email}
        </li>
      ))}
    </ul>
  );
}
```

---

## 11. How does event handling work in React?

React wraps native browser events in a SyntheticEvent system that normalizes behavior across browsers and enables event pooling–related optimizations historically, while providing a familiar DOM-like API (`preventDefault`, `stopPropagation`). You attach handlers with camelCase props like `onClick` rather than strings, passing function references or inline arrow functions. Handlers often receive the event object as the first argument, and you should be careful with `async` handlers and state updates because closures can capture stale values unless you use functional updates or proper dependencies in effects. For forms, React encourages controlled components where the input value is driven by React state, giving you a single source of truth. Delegation details are mostly abstracted away, but understanding that React sets up listeners at the root level in many cases helps explain performance characteristics and DevTools behavior.

```jsx
function Form() {
  const [text, setText] = React.useState("");

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Submitted:", text);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button type="submit">Save</button>
    </form>
  );
}
```

---

## 12. What are controlled versus uncontrolled components?

A controlled component is an input whose value is owned by React state: you set `value` (or `checked`) and update it via `onChange`, so React is the source of truth. An uncontrolled component stores its own value in the DOM, and you read it with refs or on submit, similar to traditional HTML forms. Controlled inputs make validation, formatting, and disabling submit buttons straightforward because every keystroke flows through your state. Uncontrolled inputs can be simpler for basic forms or when integrating non-React widgets, but they make live validation harder. Switching between the two mid-flight causes bugs, so pick a strategy per field intentionally. File inputs are often uncontrolled because reading files through state is awkward, though patterns exist to upload via `FormData`.

```jsx
function Controlled() {
  const [name, setName] = React.useState("");
  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}

function Uncontrolled() {
  const ref = React.useRef(null);
  return (
    <input
      ref={ref}
      defaultValue=""
      onBlur={() => console.log(ref.current.value)}
    />
  );
}
```

---

## 13. What are fragments?

A fragment lets you group multiple JSX nodes without adding an extra DOM element, which matters for layout, CSS, and semantics. The shorthand syntax `<>...</>` compiles to `React.Fragment` with no wrapper node emitted. Fragments are useful when a component must return multiple siblings, such as a list of table rows or adjacent headings and paragraphs, while keeping the HTML structure valid. A keyed fragment (`<Fragment key={...}>`) is available when you need a stable key around a group inside a list, which the empty shorthand cannot express. Using fragments reduces unnecessary `div` soup that complicates styling and accessibility. They do not create a DOM node, so you cannot attach a ref to the shorthand fragment in older React versions; modern React provides ref support on `Fragment` in newer releases where applicable, but many teams still wrap with an element if a ref container is required.

```jsx
function Columns() {
  return (
    <>
      <td>Git</td>
      <td>React</td>
    </>
  );
}
```

---

## 14. What is React.StrictMode?

`StrictMode` is a development-only wrapper that activates additional checks and warnings to help you write safer concurrent-friendly code; it does not change production behavior visually by itself. In development, it may intentionally double-invoke renders, effects, and certain lifecycles to reveal impure side effects that would be problematic under Concurrent Rendering. It warns about deprecated APIs, unsafe lifecycles in class components, and legacy context patterns, steering codebases toward modern best practices. Wrapping the app root in `<React.StrictMode>` is a common recommendation in new projects created with current tooling. It is not a security feature or a runtime error boundary; it complements other tools like TypeScript and ESLint plugins. If you see effects running twice in development, Strict Mode is often the reason, and idempotent effect setup is the fix.

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

---

## 15. What is the difference between React elements and components?

A component is a function or class (or a special type like `memo` output) that encapsulates rendering logic, while an element is a plain object describing what to render: `{ type, props, ... }`. You create elements by writing JSX or calling `React.createElement`, and components are referenced as the `type` when you write `<MyComponent />`. This distinction explains many runtime messages: “element type is invalid” often means you accidentally exported `undefined` instead of a component. Elements are immutable snapshots produced on each render; components are the reusable factories that produce those snapshots. Multiple elements can share the same component type with different props, which is how reuse works. Understanding this separation clarifies higher-order patterns: a HOC returns a component; a render prop or child function returns elements.

```jsx
function Greet({ name }) {
  return <span>Hello {name}</span>;
}

const el = <Greet name="Lee" />; // el is a React element object describing a Greet instance
console.log(el.props.name); // "Lee"
```

---

## 16. What are hooks, and why were they introduced?

Hooks are functions like `useState` and `useEffect` that let function components use state and side effects without classes, using a consistent, composable model. They were introduced to reduce the complexity of lifecycle methods, avoid wrapper hell from render props and HOCs for cross-cutting concerns, and make reuse of stateful logic possible through custom hooks. Hooks rely on call order within a single component render, which is why the Rules of Hooks exist: only call hooks at the top level of React functions, not inside loops, conditions, or nested functions. This model aligns well with Concurrent features because effects declare intent more explicitly than many lifecycle combinations. For teams, hooks improve readability once conventions are established, though beginners must learn dependency arrays and stale closure pitfalls. The ecosystem largely standardizes on hooks-first patterns today.

```jsx
function useOnlineStatus() {
  const [online, setOnline] = React.useState(() => navigator.onLine);
  React.useEffect(() => {
    const go = () => setOnline(true);
    const stop = () => setOnline(false);
    window.addEventListener("online", go);
    window.addEventListener("offline", stop);
    return () => {
      window.removeEventListener("online", go);
      window.removeEventListener("offline", stop);
    };
  }, []);
  return online;
}
```

---

## 17. Explain the useState hook in detail.

`useState` declares a piece of state in a function component and returns a pair: the current value and a setter function that schedules an update and re-render. You can initialize with a value or a lazy initializer function `useState(() => expensive())` so the expensive work runs only once on mount. Updates may be batched, and multiple rapid updates should use functional form `setN((n) => n + 1)` to avoid stale reads. State is isolated per component instance: two `<Counter />` siblings do not share `useState` unless you lift state to a common parent or use context. Replacing objects and arrays should be done immutably so React can detect changes reliably, especially when derived memoization depends on reference identity. For complex state machines, consider `useReducer`, but `useState` remains ideal for simple independent values.

```jsx
function Toggle() {
  const [on, setOn] = React.useState(false);
  return (
    <button type="button" onClick={() => setOn((v) => !v)}>
      {on ? "On" : "Off"}
    </button>
  );
}
```

---

## 18. Explain useEffect: purpose, cleanup, and the dependency array.

`useEffect` runs side effects after paint: data fetching, subscriptions, timers, manual DOM manipulation, and logging. The function you pass can return a cleanup function that React runs before the next effect execution or on unmount, which is how you unsubscribe and avoid leaks. The dependency array controls when the effect re-runs: an empty array means “run once on mount,” omitting the array means “run after every render” (usually a mistake), and listing values means “run when any listed value changes by `Object.is` comparison.” ESLint’s `react-hooks/exhaustive-deps` rule helps keep dependencies correct, though occasionally you must refactor to satisfy it honestly rather than disabling it blindly. Effects are not the place for pure render logic; keep renders cheap and idempotent, and put asynchronous work inside effects with careful cancellation or ignore flags for race conditions.

```jsx
function useTitle(title) {
  React.useEffect(() => {
    const prev = document.title;
    document.title = title;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
```

---

## 19. What is the useContext hook?

`useContext` reads the nearest provided value for a given React context object, enabling deeply nested components to access shared data without prop drilling. A parent wraps subtrees with `<MyContext.Provider value={...}>`, and descendants call `useContext(MyContext)` to subscribe to updates when the provided value changes. Context is optimized for infrequent updates; passing a new object identity every render can cause broad re-renders unless you split contexts or memoize values carefully. Common uses include themes, authentication session snapshots, and localized feature flags. It pairs well with small state reducers or external stores for more complex global state needs.

```jsx
const ThemeContext = React.createContext("light");

function ThemedButton() {
  const theme = React.useContext(ThemeContext);
  return <button className={theme}>Themed</button>;
}
```

---

## 20. What is the useRef hook?

`useRef` returns a mutable object `{ current: ... }` that persists for the full lifetime of a component instance without causing re-renders when you change `current`. The most common use is grabbing DOM nodes for imperative operations like focusing inputs or measuring sizes. Refs can also hold any mutable value similar to an instance field, such as previous props, timers, or cancellation tokens, which is useful when you need persistence across renders without triggering updates. Updating `ref.current` does not schedule a render, so do not use refs as a substitute for state that should display in the UI. In React 19, function components can also receive refs via the `ref` prop directly without `forwardRef` in many cases, but `useRef` remains the primitive for creating ref objects.

```jsx
function TextField() {
  const inputRef = React.useRef(null);
  return (
    <>
      <input ref={inputRef} />
      <button type="button" onClick={() => inputRef.current?.focus()}>
        Focus
      </button>
    </>
  );
}
```

---

## 21. What is the useMemo hook?

`useMemo` memoizes a computed value between renders, recomputing only when dependencies change, which helps avoid expensive pure calculations on every render. It is not a general-purpose performance tool for every variable; misuse can add overhead and obscure bugs if dependencies are incomplete. The callback should be pure: no side effects inside `useMemo`, because React may skip execution when dependencies appear unchanged. Typical uses include derived data structures, filtered lists, and stabilizing object identities passed to memoized children. If the computation is cheap, prefer plain code in the render body for clarity.

```jsx
function Stats({ items }) {
  const total = React.useMemo(
    () => items.reduce((sum, x) => sum + x.price, 0),
    [items]
  );
  return <p>Total: {total}</p>;
}
```

---

## 22. What is the useCallback hook?

`useCallback` returns a stable function reference across renders unless dependencies change, which helps prevent unnecessary re-renders of child components wrapped in `React.memo` or dependent effects that list functions in dependency arrays. Like `useMemo`, it is meaningful when referential identity matters; otherwise inline functions are fine and simpler. A common pattern is wrapping event handlers passed deep into trees where memoization buys measurable wins. Combine with accurate dependency lists: stale closures happen when you omit dependencies or capture outdated values incorrectly. Overusing `useCallback` everywhere rarely helps and can harm readability.

```jsx
const Parent = React.memo(function Parent({ id }) {
  const log = React.useCallback(() => console.log(id), [id]);
  return <Child onLog={log} />;
});
```

---

## 23. What is the useReducer hook?

`useReducer` is an alternative to `useState` for state that transitions through well-defined actions, especially when the next state depends on the previous state in nontrivial ways. It accepts a reducer function `(state, action) => nextState` and an initial state (or init function), returning the current state and a `dispatch` function. This pattern scales nicely for forms, wizards, and UI state machines, and it can make updates more readable than multiple `setState` calls. Reducers should be pure functions, which simplifies testing. For app-wide state, you might still prefer external stores, but local complex state is a sweet spot for `useReducer`.

```jsx
function reducer(state, action) {
  switch (action.type) {
    case "inc":
      return { count: state.count + 1 };
    case "dec":
      return { count: state.count - 1 };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = React.useReducer(reducer, { count: 0 });
  return (
    <>
      <p>{state.count}</p>
      <button type="button" onClick={() => dispatch({ type: "inc" })}>
        +
      </button>
    </>
  );
}
```

---

## 24. What are custom hooks, and why and how do you write them?

A custom hook is a function whose name starts with `use` and that calls other hooks internally, letting you extract reusable stateful logic across components. They promote reuse without changing the component hierarchy the way HOCs often do. Examples include `useFetch`, `useLocalStorage`, or `useOnScreen`. Custom hooks should return stable APIs (values, callbacks) and document assumptions about where they can be used. They are not a way to share state magically between unrelated trees unless you include context or an external store inside the hook implementation. Testing custom hooks is often done with specialized utilities like `@testing-library/react`’s `renderHook`.

```jsx
function useToggle(initial = false) {
  const [value, setValue] = React.useState(initial);
  const toggle = React.useCallback(() => setValue((v) => !v), []);
  return [value, toggle];
}
```

---

## 25. What are the Rules of Hooks?

Hooks must only be called at the top level of React function components or other custom hooks, never inside loops, conditions, or nested functions, because React associates hook state with call order between renders. Breaking this rule misaligns state slots and leads to terrifying runtime errors. Hooks must run in the same order every render, which is why early returns before hooks are also problematic. These rules enable React to store hook state in a linked list internally without explicit IDs. Lint rules enforce them in most projects. Understanding the rules explains why certain abstractions need restructuring, such as splitting components or moving conditional logic inside a hook rather than around hook calls.

```jsx
function Bad({ show }) {
  // if (show) {
  //   const [x, setX] = React.useState(0); // breaks Rules of Hooks
  // }
  const [x, setX] = React.useState(0);
  if (!show) return null;
  return <button onClick={() => setX((n) => n + 1)}>{x}</button>;
}
```

---

## 26. What is the useId hook?

`useId` generates stable unique IDs across server and client renders, which is important for accessibility attributes like `id`, `aria-labelledby`, and form label associations in SSR environments. Unlike `Math.random()`, `useId` avoids hydration mismatches because the server and client produce matching identifiers. Use it whenever you need to link inputs and labels or reference elements in ARIA attributes reliably. Do not use the returned string as a `key` for list items; it identifies the component instance, not arbitrary collection rows.

```jsx
function Field({ label }) {
  const id = React.useId();
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </>
  );
}
```

---

## 27. What is the difference between useMemo and useCallback?

Both hooks memoize values across renders, but `useMemo` memoizes the result of a computation, while `useCallback` memoizes a function instance specifically. In fact, `useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)` conceptually. Choose `useMemo` for expensive derived data or stable object identities for props; choose `useCallback` when you need a stable function reference for dependencies or memo children. Neither replaces profiling: measure before optimizing. If dependencies change frequently, both hooks recompute often and provide little benefit.

```jsx
const memoizedValue = React.useMemo(() => compute(a, b), [a, b]);
const memoizedCb = React.useCallback(() => doThing(a, b), [a, b]);
```

---

## 28. When should you use useReducer versus useState?

Use `useState` for simple independent values and straightforward updates, especially when the next state does not depend intricately on the previous state beyond trivial increments. Use `useReducer` when multiple values must update together, when transitions are event-driven with named actions, or when state logic grows enough that a reducer clarifies invariants. Reducers also make it easier to unit test transition logic separately from components. If you find yourself chaining many `setState` calls to keep related fields consistent, that is a signal to consider a reducer or a small state machine.

```jsx
const [form, dispatch] = React.useReducer(
  (state, action) => {
    switch (action.type) {
      case "field":
        return { ...state, [action.name]: action.value };
      case "reset":
        return { name: "", email: "" };
      default:
        return state;
    }
  },
  { name: "", email: "" }
);
```

---

## 29. What is the dependency array in useEffect?

The dependency array is the second argument to `useEffect` that lists reactive values referenced inside the effect: props, state, and contextual values that should cause the effect to re-run when they change. React compares entries with `Object.is` to decide whether to run the effect again. If you omit the array, the effect runs after every render, which is occasionally intentional for logging but usually problematic. If the array is empty, the effect runs once after initial mount (in Strict Mode development, setup/cleanup may run twice to detect issues). Incomplete dependencies are a common source of stale data bugs, which is why exhaustive-deps linting exists. Sometimes the right fix is to move values inside the effect, split effects, or use functional updates to reduce dependencies.

```jsx
React.useEffect(() => {
  document.title = `Hello, ${name}`;
}, [name]);
```

---

## 30. How do you handle side effects in React?

Side effects are operations that reach outside the pure render function: network calls, timers, subscriptions, manual DOM APIs, and logging to external systems. Perform them in `useEffect` or event handlers, not during render, because render must stay pure and fast for Concurrent rendering to remain correct. Fetching should handle race conditions when inputs change quickly, often with `AbortController` or a cancellation flag. Subscriptions need cleanup functions to avoid memory leaks. For user-driven effects (submitting a form), prefer event handlers; for synchronizing React state with external systems (theme, online status), prefer effects. React 19 also introduces additional patterns around Actions for mutations tied to forms and transitions, but effects remain central for general synchronization.

```jsx
React.useEffect(() => {
  const ac = new AbortController();
  fetch(`/api/items?q=${encodeURIComponent(query)}`, { signal: ac.signal })
    .then((r) => r.json())
    .then(setItems)
    .catch((e) => {
      if (e.name !== "AbortError") console.error(e);
    });
  return () => ac.abort();
}, [query]);
```

---

## 31. What is new in React 19?

React 19 (released December 2024) is a major step that integrates features for server-first workflows, better forms and mutations, improved resource loading, and developer-experience upgrades such as the React Compiler story and refined concurrent behaviors. Notable additions include the `use` hook for reading promises and context during render in supported patterns, Actions for async functions used with forms and transitions, and new hooks such as `useActionState`, `useFormStatus`, and `useOptimistic` to model pending and optimistic UI. The framework also improves how components can declare document metadata (`<title>`, `<meta>`, `<link>`) and stylesheets/scripts in component trees, and it refines Suspense and hydration-related capabilities for modern apps. Ref forwarding is simplified by allowing `ref` as a regular prop on function components in many cases, reducing `forwardRef` boilerplate. For freshers, the headline is that React is not only a client UI library anymore in practice: Server Components and server-driven routing are first-class in the ecosystem, and React 19 aligns core APIs with those patterns.

```jsx
// Conceptual: Actions + optimistic updates (see dedicated questions for details)
import { useOptimistic, useTransition } from "react";

async function saveOnServer(data) {
  await new Promise((r) => setTimeout(r, 300));
  return { ok: true, data };
}
```

---

## 32. What are React Server Components (RSC)?

React Server Components are components that render on the server and send a serialized description to the client without shipping their full implementation to the browser, which reduces bundle size and keeps secrets and heavy dependencies server-side. They can fetch data directly during render on the server and pass serializable props to Client Components, which are the interactive pieces that hydrate in the browser. RSC is not a replacement for SSR alone; it composes with streaming and selective hydration in frameworks like Next.js App Router. You cannot use browser-only APIs inside server components, and event handlers belong in client components. Boundaries between server and client are explicit (for example `"use client"` in ecosystems that adopt that convention). Understanding RSC helps explain why some hooks only make sense on the client and why data fetching patterns differ between server files and interactive components.

```jsx
// Pseudocode illustrating the split — exact directives depend on your framework.
// ServerComponent.jsx (runs on server)
async function Product({ id }) {
  const product = await db.product.find(id);
  return <ProductView product={product} />;
}

// ClientComponent.jsx — in frameworks like Next.js, a "use client" directive
// at the top of the file marks the module as a Client Component.
export function AddToCart({ productId }) {
  const [busy, start] = React.useTransition();
  return (
    <button disabled={busy} onClick={() => start(() => add(productId))}>
      Add
    </button>
  );
}
```

---

## 33. What is the `use` hook in React 19?

The `use` hook lets React consume resources that behave like promises (and also context in some usages) within render in supported scenarios, enabling components to suspend while data resolves when wrapped in Suspense boundaries. Unlike `useEffect`, it participates directly in the render flow and integrates with Suspense for loading states and error boundaries for failures. It is intended for frameworks and patterns that provide compatible data sources; you still need to understand caching and invalidation strategies at the application level. Misusing `use` without proper boundaries can cause confusing UI states, so follow documentation from your meta-framework. For freshers, compare mentally to `async` server components on the server versus client suspense patterns on the client.

```jsx
import { use, Suspense } from "react";

function User({ userPromise }) {
  const user = use(userPromise);
  return <span>{user.name}</span>;
}

export function Profile({ userPromise }) {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <User userPromise={userPromise} />
    </Suspense>
  );
}
```

---

## 34. What are Actions in React 19?

Actions are functions, often asynchronous, that represent mutations such as form submissions or server updates, and React 19 provides first-class integration so pending states, errors, and optimistic UI are easier to model. You can pass an action function to `form`’s `action` prop or use hooks like `useActionState` to track the last result and pending status without manually wiring multiple pieces of state. Actions pair naturally with transitions (`useTransition`) so the UI stays responsive while work is in flight. They do not remove the need for validation, authorization on the server, or proper error handling; they improve the client ergonomics around those concerns. Frameworks may wire Actions to server endpoints or server functions, so always read your stack’s docs for the exact transport.

```jsx
async function createTodo(prevState, formData) {
  const title = String(formData.get("title") ?? "");
  if (!title.trim()) return { error: "Title required" };
  await api.createTodo({ title });
  return { ok: true };
}

function Form() {
  const [state, action, pending] = React.useActionState(createTodo, null);
  return (
    <form action={action}>
      <input name="title" />
      <button disabled={pending}>Save</button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
```

---

## 35. What is the useActionState hook?

`useActionState` (historically discussed under names like `useFormState` in earlier docs) wraps an action with state that updates when the action is invoked, which is ideal for forms that return validation messages or result objects from async work. It returns the current state, a wrapped action suitable for `form action={...}`, and a pending boolean so you can disable inputs or show spinners. This reduces boilerplate compared to manually tracking `isSubmitting`, `error`, and `result` with separate `useState` calls. The action receives the previous state as its first argument followed by form data when used with forms. Always validate on the server as well, because client-side state can be bypassed.

```jsx
const [state, formAction, isPending] = React.useActionState(async (prev, fd) => {
  const name = String(fd.get("name") ?? "");
  return name ? { ok: true, name } : { ok: false, message: "Invalid" };
}, null);
```

---

## 36. What is the useFormStatus hook?

`useFormStatus` is designed for child controls of a form to read submission state without prop drilling from the parent, specifically the pending status of the nearest form submission and related fields like `data`, `method`, and `action` in supporting implementations. This enables reusable submit buttons and inline spinners that automatically reflect whether the parent form’s action is running. It must be used in components rendered inside a `<form>` (or the subtree that React associates with that form) to make sense. For freshers, contrast it with local `useState` pending flags that you pass manually; `useFormStatus` centralizes the source of truth in the form’s lifecycle. Combine with accessible labels so disabled buttons still make sense to screen readers.

```jsx
function SubmitButton({ label }) {
  const { pending } = React.useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </button>
  );
}
```

---

## 37. What is the useOptimistic hook?

`useOptimistic` lets you show immediate UI updates before an asynchronous action finishes, while keeping a path to roll back or reconcile when the server responds. You provide a reducer-like update that applies optimistic state when an action starts, and React coordinates this with concurrent features so the UI remains consistent. It is ideal for likes, counters, and message sends where perceived speed matters but eventual correctness still comes from the server. Optimistic UI is not a substitute for authoritative validation; always reconcile with server results and handle conflicts. Pair with error handling so failed operations revert clearly.

```jsx
function Thread({ messages, send }) {
  const [optimistic, addOptimistic] = React.useOptimistic(
    messages,
    (state, newMsg) => [...state, { ...newMsg, pending: true }]
  );

  async function onSend(text) {
    addOptimistic({ id: crypto.randomUUID(), text });
    await send(text);
  }

  return <MessageList items={optimistic} onSend={onSend} />;
}
```

---

## 38. What is the new `ref` as a prop feature (and why does it reduce forwardRef)?

Historically, passing `ref` to function components required `React.forwardRef` because `ref` was treated specially and not passed as a normal prop. React 19 allows many function components to accept `ref` as a regular prop, reducing boilerplate and simplifying component libraries. This change makes wrapper components and design-system buttons easier to write while still forwarding refs to underlying DOM elements or child components. Library authors may still use `forwardRef` during migration or for advanced cases, but application code becomes cleaner. Always confirm your TypeScript types: `ref` typings may need updates in component props interfaces. The goal is ergonomic ref forwarding for focus management and measurements.

```jsx
function FancyInput({ ref, ...props }) {
  return <input ref={ref} className="fancy" {...props} />;
}

// Usage
function Form() {
  const inputRef = React.useRef(null);
  return <FancyInput ref={inputRef} placeholder="Type" />;
}
```

---

## 39. What are Document Metadata components (`title`, `meta`, `link`)?

React 19 allows declaring document metadata such as `<title>`, `<meta>`, and `<link>` inside your component tree in supported environments, and React hoists or manages them so that pages set SEO and social tags declaratively without imperative `document.head` manipulation scattered across effects. This aligns with component-driven routing where each route segment knows its metadata requirements. It complements server frameworks that stream HTML head tags for first-byte SEO. You should still avoid duplicating conflicting tags across nested routes without a clear precedence strategy—follow your meta-framework’s guidance. For SPAs, metadata handling may depend on hosting and routing integration.

```jsx
function ArticlePage({ title, description }) {
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

## 40. How does React 19 improve stylesheet support?

React 19 improves how stylesheets are represented in the component tree so that loading and precedence can be coordinated with Suspense boundaries and concurrent rendering, reducing flash-of-unstyled-content issues in complex apps when combined with modern bundlers. This matters when route segments load different CSS or when third-party widgets inject styles. The exact integration depends on your tooling (for example bundler plugins and framework conventions). Freshers should understand the goal: styles become part of the render lifecycle rather than ad hoc side effects. You still need discipline about global CSS versus modular CSS to avoid specificity wars.

```jsx
function AdminPanel() {
  return (
    <section>
      <link rel="stylesheet" href="/styles/admin.css" precedence="default" />
      <h2>Admin</h2>
    </section>
  );
}
```

---

## 41. How does React 19 improve async script support?

React 19 provides better coordination for async and deferred scripts declared in component trees so that execution ordering and hydration interact more predictably with Suspense and streaming setups. This reduces accidental duplicate script execution and helps progressive enhancement when third-party tags are involved. In practice, you will often rely on your framework’s `<Script>` component or bundler to emit the right tags, but understanding React’s role explains certain warnings and behaviors during hydration. Always load third-party scripts cautiously for performance and privacy. Testing in throttled networks remains essential.

```jsx
function Analytics() {
  return <script async src="https://example.com/analytics.js" />;
}
```

---

## 42. What is support for preloading resources (`preload`, `preinit`)?

React 19 exposes resource hints like `preload` and `preinit` through declarative component forms so the runtime can prioritize critical fonts, scripts, and other assets earlier in the page lifecycle, improving performance when used judiciously. These hints integrate with Suspense so that work can start sooner without blocking rendering unnecessarily. Over-preloading can waste bandwidth, so apply hints to truly critical assets. Your bundler or framework may automate much of this for route-based code splitting. Freshers should connect this feature to Core Web Vitals like LCP and FCP.

```jsx
function App() {
  return (
    <>
      <link rel="preload" as="font" href="/fonts/inter.woff2" type="font/woff2" crossOrigin="" />
      <RootRouter />
    </>
  );
}
```

---

## 43. What changed with React.lazy and Suspense in React 19?

`React.lazy` continues to enable dynamic import-based code splitting, while Suspense provides fallback UI while lazy chunks and async trees resolve; React 19 tightens integration across server streaming, concurrent rendering, and error boundaries so transitions feel smoother in modern apps. Hydration mismatches and lazy boundaries interact with your routing layer, so always test route transitions under slow networks. Error boundaries should wrap lazy sections to prevent a failed chunk from crashing the entire app. For data fetching, frameworks may prefer route-level loaders or RSC rather than only `React.lazy`, but lazy remains vital for client bundles. The mental model is unchanged: defer work, show placeholders, recover from errors.

```jsx
const Dashboard = React.lazy(() => import("./Dashboard.js"));

export function Home() {
  return (
    <React.Suspense fallback={<p>Loading dashboard…</p>}>
      <Dashboard />
    </React.Suspense>
  );
}
```

---

## 44. How does error handling improve in React 19?

React 19 continues the trend toward better error reporting for hydration issues, Suspense boundaries, and concurrent features, helping you pinpoint mismatches between server HTML and client renders and problems inside deferred trees. Error boundaries remain the primary React mechanism for isolating UI failures at the component level, while errors in event handlers and async code still require explicit handling because they do not bubble to boundaries the same way render errors do. Development builds surface more actionable messages; production should log to monitoring. Pair client boundaries with server-side validation and structured API errors for robust apps.

```jsx
class Boundary extends React.Component {
  state = { err: null };
  static getDerivedStateFromError(err) {
    return { err };
  }
  render() {
    if (this.state.err) return <p>Something broke.</p>;
    return this.props.children;
  }
}
```

---

## 45. What is the new React Compiler (sometimes associated with “React Forget”)?

The React Compiler is a build-time optimization that automatically memoizes where safe, reducing the need for manual `useMemo`, `useCallback`, and `memo` in many cases by analyzing component purity and dependencies. It aims to preserve React’s programming model while improving performance by default, especially in large apps where hand-tuned memoization is inconsistent. It is not a license to write impure renders; correctness still requires following React rules. Adoption depends on your bundler plugin and configuration; teams should roll it out with profiling. Freshers should learn manual reasoning first, then treat the compiler as an accelerator rather than a crutch.

```jsx
// Conceptually: you write straightforward code; the compiler may memoize internally.
function Price({ items }) {
  const total = items.reduce((s, i) => s + i.price, 0);
  return <output>{total}</output>;
}
```

---

## 46. What are the different ways to style React components?

Styling in React can be approached with global CSS files, CSS Modules, utility-first frameworks like Tailwind, CSS-in-JS libraries, inline styles, and component libraries with encapsulated tokens. Global CSS is simple but risks naming collisions unless you adopt conventions like BEM. CSS Modules scope class names per file, which scales well in application code. CSS-in-JS offers colocated styles with dynamic theming at the cost of tooling complexity and runtime overhead depending on the library. Inline styles provide fast prototyping but lack pseudo-classes and media queries unless you add libraries. Professional teams often combine a design system tokens layer with scoped CSS or utility classes for consistency. Choose based on team familiarity, performance budgets, and SSR compatibility.

```jsx
// Inline style object (camelCase CSS properties)
function Badge({ tone }) {
  const style = { padding: "0.25rem 0.5rem", borderRadius: 6, background: tone };
  return <span style={style}>New</span>;
}
```

---

## 47. What are CSS Modules in React?

CSS Modules are a build-time feature where each `.module.css` file exports locally scoped class names that compile to unique identifiers, preventing accidental clashes across the app. You import classes as an object and reference them in `className`, which keeps styles colocated with components while still using plain CSS features like media queries and pseudo-selectors. This approach is widely supported by Vite, Create React App, and webpack without requiring a runtime CSS-in-JS engine. Dynamic composition can be done with libraries like `clsx` or `classnames`. CSS Modules pair well with design tokens imported as variables through preprocessors if needed. They are a strong default for teams that want real CSS ergonomics without global pollution.

```jsx
import styles from "./Button.module.css";

export function Button({ children }) {
  return <button className={styles.primary}>{children}</button>;
}
```

```css
/* Button.module.css */
.primary {
  background: #2563eb;
  color: white;
}
```

---

## 48. What are styled-components and CSS-in-JS concepts?

Styled-components and similar libraries let you write component-scoped styles in JavaScript using tagged template literals or object APIs, often with theming via React context. CSS-in-JS can colocate styles with components, enable dynamic styling based on props, and automate critical CSS extraction depending on the setup. Trade-offs include runtime cost for some libraries, SSR configuration, and migration complexity compared to plain CSS. Newer zero-runtime approaches (for example Linaria) attempt to keep ergonomics while emitting static CSS. For interviews, emphasize understanding when CSS-in-JS shines (dynamic themes, design systems) versus when simpler scoping suffices.

```jsx
import styled from "styled-components";

const Card = styled.article`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
`;

export function UserCard({ name }) {
  return <Card>{name}</Card>;
}
```

---

## 49. How do inline styles work in React?

Inline styles in React accept a JavaScript object whose keys are camelCased CSS properties and whose values are strings or numbers as appropriate (`16` versus `"16px"`). They apply directly to the DOM element’s `style` attribute and have high specificity, which can make overrides from CSS classes harder unless managed carefully. Pseudo-classes like `:hover` are not expressible with plain inline styles; use classes or CSS-in-JS for that. Inline styles are convenient for one-off dynamic values derived at render time, such as widths from measurements. For performance, avoid recreating huge style objects unnecessarily; memoize if profiling shows hot paths.

```jsx
function Progress({ value }) {
  return (
    <div style={{ height: 8, background: "#eee", borderRadius: 999 }}>
      <div
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          height: "100%",
          background: "#22c55e",
          borderRadius: 999,
        }}
      />
    </div>
  );
}
```

---

## 50. How do you handle forms in React?

Forms combine controlled inputs, validation, submission handling, and accessibility. Controlled components keep input values in React state and update on `onChange`, giving you a single source of truth. Submit handlers call `preventDefault` and then perform client validation before calling APIs; server-side validation remains mandatory for security. React 19 Actions simplify pending states and result handling with hooks like `useActionState` and `useFormStatus`. Group related fields in objects or reducers when complexity grows. Always associate labels with inputs using `htmlFor`/`id` pairs or implicit nesting for screen readers.

```jsx
function LoginForm({ onSubmit }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ email, password });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Sign in</button>
    </form>
  );
}
```

---

## 51. How do you handle multiple inputs in forms?

Multiple inputs can be managed with separate `useState` calls for small forms, or a single state object updated via computed property names in `onChange` handlers for medium forms. For larger forms, `useReducer` or form libraries (React Hook Form, Formik) reduce boilerplate and improve validation orchestration. When using one object, spread the previous state immutably: `setForm((f) => ({ ...f, [name]: value }))`. Name attributes align with `FormData` if you submit via Actions or native forms. Avoid duplicating the same value in multiple state variables unless necessary.

```jsx
function Contact() {
  const [form, setForm] = React.useState({ first: "", last: "" });

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <>
      <input name="first" value={form.first} onChange={onChange} />
      <input name="last" value={form.last} onChange={onChange} />
    </>
  );
}
```

---

## 52. What are common form validation approaches?

Validation can be synchronous on each keystroke, on blur, or only on submit; asynchronous validation can check uniqueness against an API with debouncing. Simple apps use manual `if` statements and error state objects; larger apps adopt schema validators like Zod or Yup for shared rules between client and server. HTML5 validation attributes provide a baseline but are not sufficient alone. Display errors inline near fields and use `aria-invalid` and `aria-describedby` for accessibility. Always re-validate on the server because client checks can be bypassed.

```jsx
function EmailField() {
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState("");

  function onBlur() {
    setError(/@/.test(value) ? "" : "Email looks invalid");
  }

  return (
    <>
      <input
        aria-invalid={Boolean(error)}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
      />
      {error && <p role="alert">{error}</p>}
    </>
  );
}
```

---

## 53. What is prop drilling, and how do you avoid it?

Prop drilling is passing data and callbacks through many intermediate components that do not use the values themselves, only forwarding them downward. It is acceptable for shallow trees but becomes noisy and error-prone as depth grows, because every layer must know the prop names even when it does not care about them. Mitigations include component composition (passing JSX children), context for cross-cutting data, localized state stores, or state management libraries depending on scale. Refactor intermediate wrappers into layout components that accept `children` rather than knowing about every leaf prop, so only the parent and leaf coordinate details. Choosing the right tool depends on update frequency and how widely the data is needed, and on whether you need fine-grained subscriptions that Context alone cannot provide efficiently.

```jsx
function App({ user }) {
  return <Layout user={user} />;
}
function Layout({ user }) {
  return <Sidebar user={user} />;
} // Sidebar only needed user — intermediate pass-throughs add noise
```

---

## 54. What is the component composition pattern?

Composition means building larger UIs by nesting components and passing children or render slots rather than configuring everything through giant prop lists. React’s `children` prop lets containers define layout and behavior while leaves supply specific content. Patterns like `children`, slots as props, and compound components (related exports working together) reduce coupling compared to inheritance. This aligns with React’s philosophy: prefer many small composable pieces over deep inheritance hierarchies. Composition pairs well with design systems where `Card`, `Card.Header`, and `Card.Body` cooperate through context or explicit subcomponents.

```jsx
function Modal({ title, children, footer }) {
  return (
    <dialog open>
      <h2>{title}</h2>
      <div>{children}</div>
      <footer>{footer}</footer>
    </dialog>
  );
}
```

---

## 55. What is the render props pattern?

A render prop is a function prop that a component calls to render part of its UI, allowing shared logic with flexible presentation. It was popular before hooks for cases like data fetching, mouse tracking, or toggles. The component provides values to the function, and the parent decides how to render them. While hooks often replace render props for reuse, you will still encounter this pattern in older libraries. Typing render props in TypeScript requires accurate function signatures for safety.

```jsx
function MouseTracker({ render }) {
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  React.useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return render(pos);
}
```

---

## 56. What are Higher-Order Components (HOCs)?

An HOC is a function that takes a component and returns a new component with additional props or behavior, often used for cross-cutting concerns like authentication guards or injecting data. HOCs were common before hooks but can create indirection and naming collisions (`displayName` helps debugging). They still appear in legacy codebases and some libraries. Compare with hooks: `useAuth()` typically replaces `withAuth(Component)` for clarity. When using HOCs, forward unrelated props to the wrapped component and hoist statics carefully if needed.

```jsx
function withLoading(Component) {
  return function WithLoading(props) {
    if (props.isLoading) return <p>Loading…</p>;
    return <Component {...props} />;
  };
}
```

---

## 57. What is the container versus presentational component split?

Container components own data fetching, state, and side effects, while presentational components focus on how things look and receive data via props. This separation improves reusability and testability of UI pieces. Hooks blurred the line because a single function component can mix concerns, so the split is now more about discipline than syntax. Use it when teams benefit from clear boundaries and when designers collaborate on pure presentational pieces. Avoid over-splitting tiny wrappers that add no clarity.

```jsx
function UserContainer() {
  const [user, setUser] = React.useState(null);
  React.useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then(setUser);
  }, []);
  return <UserProfile user={user} />;
}

function UserProfile({ user }) {
  if (!user) return null;
  return <h1>{user.name}</h1>;
}
```

---

## 58. What is lifting state up?

Lifting state means moving shared state to the nearest common ancestor so multiple children can read and update it consistently through props and callbacks. It is the default React pattern for keeping a single source of truth when siblings need to stay synchronized, such as two panels reflecting the same selection. The trade-off is that the ancestor may re-render more often, which is usually fine until performance requires memoization or more granular subscriptions. If many distant leaves need the same data, context or dedicated stores may scale better than repeated lifting.

```jsx
function Parent() {
  const [tab, setTab] = React.useState("a");
  return (
    <>
      <TabButtons tab={tab} onChange={setTab} />
      <TabPanel tab={tab} />
    </>
  );
}
```

---

## 59. What is the `children` prop?

`children` is a special prop that represents the nested JSX between opening and closing tags of a component, enabling wrapper components to define structure while callers supply content. It can be any valid React node: elements, strings, numbers, fragments, arrays, or functions depending on your API design. Layout components, providers, and generic panels commonly use `children`. TypeScript typing may use `React.ReactNode` for broad compatibility. Be cautious with `children` as functions (render props) versus elements; both are valid but imply different contracts.

```jsx
function Panel({ title, children }) {
  return (
    <section>
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

export function Demo() {
  return (
    <Panel title="Notes">
      <p>Hello</p>
    </Panel>
  );
}
```

---

## 60. What is the spread operator in props, and when is it used?

Spreading props (`<Foo {...props} />`) copies enumerable own properties from an object into JSX attributes, which is useful for wrapper components that forward most props to a child DOM element or component. It reduces repetition when building design-system primitives that accept standard HTML attributes. Be careful not to spread unsafe or unexpected props onto DOM elements, and strip internal props before forwarding. Order matters: later explicit props override earlier spread keys. TypeScript can help ensure allowed keys when you combine spreads with intersections.

```jsx
function Input({ label, ...rest }) {
  return (
    <label>
      {label}
      <input {...rest} />
    </label>
  );
}
```

---

## 61. What is the Context API?

The Context API provides a way to pass data through the tree without manually threading props at every level, using provider/consumer pairs. `React.createContext` returns an object with `Provider` and `Consumer` (or `useContext` hook). The provider’s `value` prop supplies the current context value to all nested consumers. Context is best for data that many components need but changes infrequently, like theme or locale; high-frequency updates can cause broad re-renders unless carefully structured. Context is not a full replacement for Redux in all cases, but it can back small global stores or feature flags.

```jsx
const ThemeContext = React.createContext("light");

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}
```

---

## 62. How do you create and use Context?

Create a context with `React.createContext(defaultValue)`, wrap subtrees with `<Ctx.Provider value={...}>`, and read values with `useContext(Ctx)` in descendants. The default value applies only when no provider is present above, which is useful for optional features but can hide missing providers if you forget to wrap. For complex values, memoize provider values with `useMemo` when passing object literals to avoid unnecessary consumer updates. Export the context from a module for reuse across components. Add custom hooks like `useTheme()` to centralize access and throw helpful errors when used outside providers.

```jsx
const AuthContext = React.createContext(null);

export function AuthProvider({ user, children }) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const user = React.useContext(AuthContext);
  if (!user) throw new Error("useAuth requires AuthProvider");
  return user;
}
```

---

## 63. When should you use Context versus external state management?

Use Context when you need moderate global or cross-cutting data with simple update patterns and acceptable re-render characteristics, such as themes, auth snapshots, or feature toggles. Reach for external libraries like Redux, Zustand, or Jotai when you need devtools time-travel, middleware, complex async flows, or fine-grained subscriptions that Context cannot provide efficiently. High-churn state in Context can re-render many consumers unless you split contexts or memoize aggressively. Evaluate maintenance cost: small apps often thrive on Context plus `useReducer`, while large apps benefit from structured patterns from dedicated stores. Always measure before premature optimization, but plan for growth if the domain is clearly complex.

```jsx
// Fine for low-frequency auth session
const SessionContext = React.createContext(null);
```

---

## 64. What is Redux at a high level?

Redux is a predictable state container that holds application state in a single store, updated by pure reducers in response to dispatched actions, often used with React via `react-redux`. It shines in large apps with complex cross-feature updates, time-travel debugging, and strict conventions. Middleware like Redux Toolkit Query handles caching for server state. The learning curve is steeper than Context alone, but patterns are well documented. Modern Redux encourages Redux Toolkit to reduce boilerplate compared to hand-written reducers everywhere. Freshers should know Redux conceptually even if their first job uses Zustand or similar lighter tools.

```js
function counter(state = 0, action) {
  switch (action.type) {
    case "inc":
      return state + 1;
    default:
      return state;
  }
}
```

---

## 65. What is Zustand at a high level?

Zustand is a small state-management library that uses simple stores with hooks like `useStore` to read slices of state without much ceremony. It avoids the boilerplate of actions and reducers for many use cases while still supporting middleware and persistence. Compared to Context, it often reduces unnecessary re-renders through selector subscriptions. It is popular in modern apps that want global state without Redux’s footprint. Understanding Zustand is useful in interviews as an example of pragmatic global state. Always keep server-authoritative data validated on the backend regardless of client store design.

```js
import { create } from "zustand";

const useCart = create((set) => ({
  items: [],
  add: (item) => set((s) => ({ items: [...s.items, item] })),
}));
```

---

## 66. What is React Router?

React Router is the de facto routing library for React SPAs, mapping URLs to components and enabling nested routes, parameters, and navigation APIs. It keeps the UI in sync with the browser history API so back/forward buttons work as users expect. Version 6+ uses a declarative route configuration with `<Routes>` and `<Route>` elements and supports data APIs in Remix-like patterns depending on the package variant. Routing is not built into React core because deployment modes differ (SPA, SSR, static hosting). Understanding React Router is essential for client-rendered apps even when you later adopt Next.js file-based routing.

```jsx
import { Routes, Route, Link } from "react-router-dom";

export function App() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link> <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
}
```

---

## 67. How do you set up basic routing?

Install `react-router-dom`, wrap your app with `BrowserRouter` (or `HashRouter` for static hosts without server fallback), define `<Routes>` with `<Route path element>` pairs, and use `<Link>` or `useNavigate` for navigation. Ensure your server is configured to serve `index.html` for SPA fallback routes in history mode. Keep route components lazy-loaded for large apps. Use relative paths inside nested route trees when appropriate. Testing routes may use `MemoryRouter` to control initial entries.

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

export function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users" element={<Users />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 68. What are route parameters?

Route parameters are dynamic segments in a URL pattern, such as `/users/:id`, that React Router captures and exposes via hooks like `useParams`. They let one route component render different records based on the URL. Optional parameters and splats exist for advanced patterns. Param values are strings; convert types explicitly (`Number(id)`) and validate existence. Changing params re-renders the route component, which may trigger data fetching effects keyed on the param.

```jsx
import { Route, Routes, useParams } from "react-router-dom";

function UserPage() {
  const { id } = useParams();
  return <p>User {id}</p>;
}

export function UserRoutes() {
  return (
    <Routes>
      <Route path=":id" element={<UserPage />} />
    </Routes>
  );
}
```

---

## 69. What are nested routes?

Nested routes model UI where parent layouts persist while child segments swap, such as a dashboard shell with inner pages. React Router allows `<Route>` elements to contain child `<Route>` elements, often with an `<Outlet>` in the parent layout to render child matches. Relative paths compose cleanly and reflect URL hierarchy. This mirrors component hierarchy and reduces remounting of shared chrome. Data routers can load data per segment depending on the API you use. Nested routes improve UX by preserving scroll positions in layout regions when configured properly.

```jsx
import { Outlet, Route, Routes } from "react-router-dom";

function DashboardLayout() {
  return (
    <div>
      <aside>Nav</aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/app" element={<DashboardLayout />}>
        <Route path="home" element={<Home />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
```

---

## 70. What is programmatic navigation?

Programmatic navigation means changing routes imperatively from code, such as after a successful login or when redirecting unauthorized users, instead of only via links. In React Router v6, `useNavigate` returns a function you call with a path or delta (`navigate(-1)`). Prefer declarative redirects when possible for clarity, but programmatic control is necessary for conditional flows. Integrate with authentication state so guards run deterministically. Remember that navigation triggers unmounts and effect cleanups.

```jsx
import { useNavigate } from "react-router-dom";

export function LoginForm() {
  const navigate = useNavigate();
  async function onSuccess() {
    navigate("/app", { replace: true });
  }
  return <button onClick={onSuccess}>Continue</button>;
}
```

---

## 71. What is the concept of protected or private routes?

Protected routes restrict access to authenticated or authorized users, typically by wrapping route elements with a guard component that checks session state and redirects to login otherwise. The guard can read from context, a store, or an auth hook. Avoid security theater: client-side guards improve UX but do not secure APIs; servers must enforce authorization. Handle loading states while auth is resolving to prevent flicker. Role-based conditions can branch within the guard or map roles to route trees.

```jsx
import { Navigate } from "react-router-dom";

function RequireAuth({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
```

---

## 72. What is lazy loading and code splitting?

Lazy loading defers loading JavaScript until it is needed, shrinking the initial bundle and speeding first paint. Code splitting is typically implemented with dynamic `import()` and `React.lazy` for route-level or feature-level chunks. Users on slow networks benefit most, but it adds runtime complexity around Suspense and error boundaries. Measure bundle sizes with analyzer tools and split at natural boundaries like routes or heavy admin panels. Prefetching on hover can hide latency for predictable navigations.

```jsx
const Reports = React.lazy(() => import("./Reports.js"));

export function LazyReports() {
  return (
    <React.Suspense fallback={<p>Loading…</p>}>
      <Reports />
    </React.Suspense>
  );
}
```

---

## 73. How do React.lazy and Suspense support code splitting?

`React.lazy` wraps a dynamic import promise in a component type Suspense can suspend on while the chunk loads. `Suspense` shows a fallback UI until the lazy component is ready, preventing blank screens. Error boundaries catch failed imports (network errors) if placed above the lazy tree. Name chunks meaningfully in bundler configuration for debugging. Avoid too many tiny lazy boundaries that fragment loading unpredictably without UX consideration. Pair with route-based splitting for maintainability.

```jsx
const Admin = React.lazy(() => import(/* webpackChunkName: "admin" */ "./Admin.js"));

export function Gate() {
  return (
    <React.Suspense fallback={<div>Loading admin…</div>}>
      <Admin />
    </React.Suspense>
  );
}
```

---

## 74. What are error boundaries?

Error boundaries are React components that implement `static getDerivedStateFromError` and/or `componentDidCatch` to catch JavaScript errors during rendering in their child tree and display fallback UI instead of crashing the whole app. They do not catch errors in event handlers, asynchronous code, or server components by themselves; those require `try/catch` or framework mechanisms. Boundaries help isolate failures in widgets or routes. Log errors to monitoring in `componentDidCatch` for diagnostics. Functional components cannot be error boundaries yet, so class components or framework helpers are used.

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err, info) {
    console.error(err, info);
  }
  render() {
    return this.state.hasError ? <p>Problem loading this section.</p> : this.props.children;
  }
}
```

---

## 75. What is React.memo?

`React.memo` is a higher-order component that memoizes a function component, skipping re-renders when props are shallowly equal to the previous render according to `Object.is` comparisons on each prop. It helps when a parent re-renders often but props to a heavy child rarely change. It is not magic: new object or function identities each render defeat memo unless stabilized with `useMemo`/`useCallback`. Use profiling to justify `memo`. For context consumers, memoizing may be less effective if context values change frequently.

```jsx
const Row = React.memo(function Row({ title }) {
  return <li>{title}</li>;
});

export function List({ items }) {
  return (
    <ul>
      {items.map((it) => (
        <Row key={it.id} title={it.title} />
      ))}
    </ul>
  );
}
```

---

## 76. How does React render and re-render?

Rendering is the process of calling your components to produce a React element tree describing the UI for the current props, state, and context. The first time a component mounts, React creates DOM nodes (or host output) based on that tree. Re-rendering happens when React detects state or context updates in a subtree, or parent renders that propagate changes downward, causing affected components to run again and produce a new element tree. React then reconciles the new tree with the previous one to compute minimal updates. Concurrent rendering can split this work into units, but the conceptual model remains: render is a pure computation step; commit applies changes. Understanding render versus commit clarifies why side effects belong in effects or event handlers, not directly in render bodies.

```jsx
let renders = 0;
function Demo() {
  renders += 1;
  const [n, setN] = React.useState(0);
  return <button onClick={() => setN((x) => x + 1)}>n={n}, renders={renders}</button>;
}
```

---

## 77. What triggers a re-render?

Re-renders are triggered when local state updates via `setState`/`useState` setters, `useReducer` dispatch, or when a consuming context value changes from a provider above. Parent re-renders also re-render children by default unless children are memoized or stabilized. Props changing identity causes child re-renders even if values look similar, which is why referential equality matters for objects and functions. External store subscriptions (for example `useSyncExternalStore`) can trigger renders when the store notifies. Low-level APIs like `forceUpdate` in classes are rare today. Knowing triggers helps you trace performance issues and stale UI bugs.

```jsx
const Ctx = React.createContext(0);

function Child() {
  const v = React.useContext(Ctx);
  return <span>{v}</span>;
}

function Parent() {
  const [x, setX] = React.useState(0);
  return (
    <Ctx.Provider value={x}>
      <button onClick={() => setX((n) => n + 1)}>Bump</button>
      <Child />
    </Ctx.Provider>
  );
}
```

---

## 78. How can you prevent unnecessary re-renders?

Start with good data design: keep state localized and derive values instead of storing duplicates. Use `React.memo` for expensive pure children when props are stable, and stabilize callbacks with `useCallback` when passing functions to memoized children. Split contexts so high-frequency updates do not invalidate unrelated consumers. For global stores, selectors or atomic state libraries reduce over-subscription. Always profile before optimizing; unnecessary memoization adds complexity. Concurrent features and transitions can keep the UI responsive even when renders occur.

```jsx
const Big = React.memo(function Big({ value }) {
  return <output>{value}</output>;
});

function Parent() {
  const [a, setA] = React.useState(0);
  const [b, setB] = React.useState(0);
  const incA = React.useCallback(() => setA((x) => x + 1), []);
  return (
    <>
      <button onClick={incA}>a++</button>
      <button onClick={() => setB((x) => x + 1)}>b++</button>
      <Big value={a} />
      <p>b (not passed to Big): {b}</p>
    </>
  );
}
```

---

## 79. Virtual DOM versus real DOM performance: what should freshers understand?

The real DOM is the browser’s live tree of nodes; manipulating it incurs layout and paint costs, so churning thousands of nodes per frame is expensive. The Virtual DOM helps React batch and minimize writes by computing diffs, but it does not guarantee superiority in every micro-benchmark compared to carefully hand-optimized imperative code. The practical win is developer productivity and predictable batching, plus React’s ecosystem for memoization and concurrent rendering. Performance problems more often come from unnecessary renders, large lists without virtualization, or heavy work in render functions than from Virtual DOM overhead alone. Profile with React DevTools and browser performance tabs rather than assuming.

```jsx
// Heavy work in render hurts regardless of Virtual DOM
function Slow({ items }) {
  const sorted = [...items].sort((a, b) => a.val - b.val); // consider memoization
  return sorted.map((x) => <div key={x.id}>{x.val}</div>);
}
```

---

## 80. What is batching in React, and what about automatic batching in React 18/19?

Batching means combining multiple state updates into a single re-render for efficiency. React 18+ automatically batches updates inside promises, timeouts, and native event handlers in many cases, not only in React event handlers as earlier versions did in practice. This reduces intermediate renders and improves performance, but it also means you should not rely on seeing every intermediate state flush immediately unless you use `flushSync` (rarely). Batching preserves functional correctness because updates still apply in order within an event. Concurrent features may further schedule updates in ways that prioritize urgent interactions.

```jsx
function Batched() {
  const [a, setA] = React.useState(0);
  const [b, setB] = React.useState(0);
  async function onClick() {
    setA((x) => x + 1);
    setB((x) => x + 1); // typically batched with a in React 18+
  }
  return (
    <button onClick={onClick}>
      a={a} b={b}
    </button>
  );
}
```

---

## 81. How do you use React DevTools effectively?

React DevTools is a browser extension that inspects the component tree, props, state, hooks, and context for a running app. Use it to trace why a component re-rendered, inspect hook values at runtime, and profile render times to find hotspots. The profiler records commits and shows which components rendered and how long they took. It helps verify that memoization works as expected and that context changes are not too broad. Combine DevTools with console logging sparingly; DevTools reduces noise. Learn keyboard shortcuts and the search feature in large apps.

```jsx
// DevTools displays component name; set displayName for HOCs
const MemoRow = React.memo(Row);
MemoRow.displayName = "MemoRow";
```

---

## 82. What is a pure component?

In React, a pure component typically means a component whose render output depends only on props and state and does not cause side effects during render; `React.PureComponent` in classes implements shallow prop/state comparison to skip updates. Functionally, purity implies you do not mutate external variables, subscribe, or call APIs directly in the render path. Side effects belong in effects or handlers. Pure renders enable memoization and concurrent rendering to behave predictably. Violating purity can cause subtle bugs when React retries or discards work.

```jsx
function Temperature({ c }) {
  const f = (c * 9) / 5 + 32; // derived from props only — pure render
  return <p>{c}°C ≈ {f.toFixed(1)}°F</p>;
}
```

---

## 83. What is immutability, and why is it important in React?

Immutability means updating state by creating new values rather than mutating existing objects or arrays in place. React relies on reference changes to detect updates efficiently; in-place mutation can prevent re-renders or break memoization. Spread syntax, `Array.prototype.map`, and libraries like Immer help maintain immutability ergonomically. Immutability also simplifies debugging because you can compare previous and next snapshots. Pair immutability with careful equality in dependencies for hooks.

```jsx
function addTodo(todos, text) {
  return [...todos, { id: crypto.randomUUID(), text, done: false }];
}
```

---

## 84. What are synthetic events?

Synthetic events are React’s cross-browser wrapper around native DOM events, exposing a consistent API and pooling behavior historically optimized for performance. They support `stopPropagation`, `preventDefault`, and normalized property names. In modern React, some older pooling quirks matter less, but you should still be aware that asynchronous access to event fields can require `event.persist()` in legacy patterns—prefer using values synchronously or copying fields. Synthetic events help React coordinate delegation and batching efficiently.

```jsx
function Link() {
  function onClick(e) {
    e.preventDefault();
    console.log("Handled in React without navigating");
  }
  return (
    <a href="/home" onClick={onClick}>
      Home
    </a>
  );
}
```

---

## 85. What is event delegation in React?

Event delegation attaches listeners at higher levels (often the document root) and dispatches to handlers based on the event target, reducing listener count. React historically relied on delegation for many events, which improves memory use for large trees. Developers still write `onClick` on elements as usual; React wires the underlying strategy. Understanding delegation explains certain nuances with `stopPropagation` ordering versus native listeners mixed into the same flow. It is mostly an implementation detail but appears in advanced debugging.

```jsx
function List({ items, onPick }) {
  return (
    <ul
      onClick={(e) => {
        const id = e.target.closest("li")?.dataset.id;
        if (id) onPick(id);
      }}
    >
      {items.map((it) => (
        <li key={it.id} data-id={it.id}>
          {it.label}
        </li>
      ))}
    </ul>
  );
}
```

---

## 86. What is declarative versus imperative programming in React?

Declarative code describes what the UI should look like given state (`<Box color={active ? "blue" : "gray"} />`), while imperative code issues step-by-step commands to mutate the DOM (`el.style.color = "blue"`). React encourages declarative views so that reconciliation can compute differences. You still write imperative code where appropriate inside effects or third-party integrations. Declarative UIs are easier to reason about and test because outputs are functions of inputs. Mixing paradigms cleanly—declarative React tree plus imperative adapters—is a senior-level skill but begins with this distinction.

```jsx
function Traffic({ status }) {
  return <div className={status === "go" ? "go" : "stop"} />;
}
```

---

## 87. What is unidirectional data flow?

Unidirectional data flow means data moves down the tree via props, and updates flow up via callbacks or centralized dispatchers, forming a predictable loop. This contrasts with two-way binding frameworks where models mutate from many directions implicitly. React’s model makes debugging easier because you can trace props and state owners. Flux/Redux extended this idea to app-wide stores. Understanding this flow explains why context providers sit high and why lifting state resolves sibling sync issues.

```jsx
function Parent() {
  const [value, setValue] = React.useState("");
  return <Child value={value} onChange={setValue} />;
}
function Child({ value, onChange }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />;
}
```

---

## 88. How do Jest and React Testing Library introduce testing in React apps?

Jest is a test runner and assertion library with mocking and snapshot features, while React Testing Library focuses on testing components as users interact with the DOM—queries like `getByRole` encourage accessible selectors. Together they promote tests that avoid implementation details and instead assert visible behavior. You render components with `render`, fire events with `userEvent`, and `await` async updates with `findBy` queries. Mock network calls with `msw` or Jest mocks for isolation. Tests give confidence when refactoring hooks or memoization.

```jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("increments", async () => {
  render(<Counter />);
  await userEvent.click(screen.getByRole("button", { name: /add/i }));
  expect(screen.getByText(/count: 1/i)).toBeInTheDocument();
});
```

---

## 89. What is snapshot testing?

Snapshot testing captures a serialized representation of a component tree (often HTML) on first run and compares future runs to detect unintended changes. It is useful for large static outputs but can be noisy if snapshots are overused for volatile markup. Review snapshot diffs carefully in code review; do not blindly accept changes. Prefer targeted assertions for behavior when possible. Snapshots complement, not replace, interaction tests.

```jsx
import renderer from "react-test-renderer";

test("matches snapshot", () => {
  const tree = renderer.create(<Badge>New</Badge>).toJSON();
  expect(tree).toMatchSnapshot();
});
```

---

## 90. What is the role of the `key` prop in lists beyond reconciliation?

Beyond helping React match moved items, keys isolate stateful child instances so that each row’s local state (inputs, animations) stays attached to the correct item identity. Changing keys intentionally can reset state for a subtree, which is useful when remounting a wizard step. Poor keys cause mis-bound state and bizarre UI bugs, especially with editable rows. Keys are not a way to pass secret data; they are reconciliation hints. Always derive keys from stable business identifiers.

```jsx
function EditableRows({ rows }) {
  return rows.map((row) => <input key={row.id} defaultValue={row.text} />);
}
```

---

## 91. What is Create React App versus Vite for React projects?

Create React App was a popular zero-config toolchain for SPAs that abstracted webpack configuration; it is now less recommended for new projects as maintenance slowed and ecosystem moved on. Vite uses esbuild for dev pre-bundling and Rollup for production builds, offering extremely fast cold starts and HMR with simpler configuration for many teams. Both can host React, but Vite’s speed and plugin ecosystem make it a common choice in 2025–2026 greenfield apps. Meta-frameworks like Next may supersede either for production sites needing SSR. Migration from CRA to Vite is common for performance wins.

```bash
npm create vite@latest my-app -- --template react
```

---

## 92. What is Next.js, and how does it relate to React?

Next.js is a React framework providing file-system routing, server rendering, static generation, API routes, and image optimization, depending on version and mode. It builds on React and integrates React Server Components in the App Router paradigm, enabling server-first data fetching and streaming HTML. React is the view layer; Next.js supplies the application skeleton and deployment conventions. Learning plain React remains essential because framework features map back to core concepts like hydration and suspense boundaries. Choose Next when you need SEO, fast first loads, or backend colocation; choose SPA tooling when appropriate.

```jsx
// Illustrative App Router component — exact APIs depend on Next.js version
export default function Page() {
  return <main>Hello</main>;
}
```

---

## 93. What are portals?

Portals let you render children into a DOM node outside the parent hierarchy, useful for modals, tooltips, and overlays that must escape `overflow: hidden` or stacking contexts. `createPortal(child, domNode)` keeps event bubbling behavior in React according to the React tree, even though the DOM placement differs. Manage focus and accessibility carefully for modals, including focus traps and `aria-modal`. Portals help avoid z-index battles scattered across components.

```jsx
import { createPortal } from "react-dom";

export function Modal({ open, children }) {
  if (!open) return null;
  return createPortal(<div className="modal">{children}</div>, document.body);
}
```

---

## 94. What are refs, and when should you use them?

Refs provide access to DOM nodes or mutable values that persist across renders without causing re-renders when updated. Use refs for focus management, text selection, integrating non-React libraries, or storing interval IDs. Avoid storing visual state that should render in refs; use state instead. Callback refs exist when you need to measure when a node mounts or unmounts. With React 19, passing `ref` as a prop to function components is easier, but the conceptual model remains.

```jsx
function Measure() {
  const ref = React.useRef(null);
  const [h, setH] = React.useState(0);
  React.useLayoutEffect(() => {
    setH(ref.current?.getBoundingClientRect().height ?? 0);
  }, []);
  return <div ref={ref} style={{ minHeight: h }}>Auto</div>;
}
```

---

## 95. What is the difference between the `react` and `react-dom` packages?

The `react` package defines components, hooks, and reconciliation logic independent of the rendering target. The `react-dom` package provides DOM-specific rendering via `createRoot` and `hydrateRoot`, translating React elements into HTML elements and events. Other renderers include `react-native` for mobile. Sharing `react` across packages ensures a single reconciler version. Version skew between `react` and `react-dom` can cause runtime errors, so keep them aligned. This split enables React’s multi-platform vision.

```jsx
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")).render(<App />);
```

---

## 96. What is hydration?

Hydration is the process of attaching event listeners and React’s internal bookkeeping to server-rendered HTML so the page becomes interactive on the client. React expects the client render to match the server HTML; mismatches cause hydration warnings and bugs. Hydration performance matters for Time to Interactive; large bundles delay interactivity. Patterns like deferring non-critical client-only trees and careful effects reduce issues. Frameworks may stream HTML and hydrate progressively.

```jsx
import { hydrateRoot } from "react-dom/client";

hydrateRoot(document.getElementById("root"), <App />);
```

---

## 97. What are SSR, CSR, and SSG?

Server-Side Rendering (SSR) builds HTML per request or at runtime on the server, improving SEO and first paint compared to a blank shell. Client-Side Rendering (CSR) delivers minimal HTML and renders in the browser, which is simpler to host as static files but can delay content visibility. Static Site Generation (SSG) pre-renders pages at build time for fast delivery from CDNs, ideal for mostly static content. Real projects mix modes: static for marketing pages, SSR for personalized pages, CSR islands for highly interactive widgets. Next.js popularizes hybrid approaches.

```txt
CSR: browser fetches JS → renders
SSR: server sends HTML → React hydrates
SSG: build-time HTML → CDN serves → hydrate
```

---

## 98. How do you fetch data in React?

Data fetching strategies depend on environment: in client components, use `useEffect` with cleanup, dedicated libraries like TanStack Query, or framework loaders. On the server with RSC, you may `await` database calls directly during render. Always handle loading, empty, and error states, and cancel in-flight requests when inputs change. For mutations, prefer Actions in React 19 where appropriate, plus optimistic UI patterns. Never trust client-only validation for security-sensitive operations.

```jsx
function User({ id }) {
  const [data, setData] = React.useState(null);
  React.useEffect(() => {
    let alive = true;
    fetch(`/api/users/${id}`)
      .then((r) => r.json())
      .then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, [id]);
  if (!data) return <p>Loading…</p>;
  return <p>{data.name}</p>;
}
```

---

## 99. What is the difference between mount and render?

Rendering is any invocation of your component function to produce an element tree, which can happen many times during a component’s lifetime. Mounting is the first time React inserts a component instance into the tree and creates associated DOM (or host) nodes. Subsequent updates re-render and reconcile without remounting unless the component type or key changes at that position. Unmount removes the instance and runs cleanups. Effects with empty dependency arrays run after the first mount commit, not after every render.

```jsx
function Flag() {
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    console.log("mounted");
    return () => console.log("unmounted");
  }, []);
  return <button onClick={() => setOn(!on)}>{String(on)}</button>;
}
```

---

## 100. What common mistakes do freshers make in React?

Freshers often mutate state directly, misuse effect dependency arrays leading to stale or infinite loops, use array indexes as keys for dynamic lists, put side effects in render, overuse context for high-frequency state, and optimize prematurely with `memo` without profiling. Another frequent issue is misunderstanding asynchronous state updates and closures, causing off-by-one logic in handlers. Forms suffer from missing labels, poor validation messaging, and no loading or error UX. Learning to read warnings, lean on Strict Mode, and test components with React Testing Library prevents many pitfalls. Adopting TypeScript early catches prop mistakes before runtime.

```jsx
// Mistake: mutating an array that still backs React state
function Bad({ items, setItems }) {
  items.push({ id: 1 });
  setItems(items); // same reference — unreliable updates; also corrupts prior state
}

// Better: immutable update
function Good({ items, setItems }) {
  setItems([...items, { id: 1 }]);
}
```

---


