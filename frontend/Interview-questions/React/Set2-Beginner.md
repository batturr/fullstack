# React MCQ - Set 2 (Beginner Level)

**1. When does the effect in `useEffect(() => { ... }, [])` run?**

a) `Only when the component unmounts`
b) `After the first paint (mount), and not again on ordinary re-renders`
c) `Before every render`
d) `Only when props change`

**Answer: b) `After the first paint (mount), and not again on ordinary re-renders`**

---

**2. What does an empty dependency array `[]` mean for `useEffect`?**

a) `The effect never runs`
b) `Run once after initial mount (and cleanup on unmount if returned)`
c) `Run on every render`
d) `Run only when state is undefined`

**Answer: b) `Run once after initial mount (and cleanup on unmount if returned)`**

---

**3. If you omit the dependency array on `useEffect`, when does the effect run?**

a) `Never`
b) `Only on mount`
c) `After every render`
d) `Only when the user clicks`

**Answer: c) `After every render`**

---

**4. What should a `useEffect` cleanup function (returned function) be used for?**

a) `Updating state synchronously during render`
b) `Tearing down subscriptions, timers, or listeners to avoid leaks`
c) `Replacing componentDidMount`
d) `Fetching data on every keystroke only`

**Answer: b) `Tearing down subscriptions, timers, or listeners to avoid leaks`**

---

**5. When is the cleanup from `useEffect` invoked before the effect runs again?**

a) `Never; cleanup runs only on unmount`
b) `Before the next effect run, and on unmount`
c) `Only in production builds`
d) `Before the first mount`

**Answer: b) `Before the next effect run, and on unmount`**

---

**6. Which dependency list is correct if the effect reads `userId` from props?**

```jsx
useEffect(() => {
  fetch(`/api/user/${userId}`).then(/* ... */);
}, [userId]);
```

a) `[]` always
b) `[userId]`
c) `[fetch]`
d) `No array`

**Answer: b) `[userId]`**

---

**7. A controlled input in React is one where:**

a) `The DOM alone owns the value; React never reads it`
b) `The value is driven by React state and updates via onChange`
c) `It can only be a checkbox`
d) `It must use uncontrolled ref pattern`

**Answer: b) `The value is driven by React state and updates via onChange`**

---

**8. An uncontrolled input typically uses:**

a) `value + onChange bound to state`
b) `defaultValue and reads current value via ref or form APIs`
c) `Only disabled={true}`
d) `readOnly without a value`

**Answer: b) `defaultValue and reads current value via ref or form APIs`**

---

**9. What is wrong here for a controlled text input?**

```jsx
const [text, setText] = useState("");
return <input value={text} />;
```

a) `Nothing`
b) `Missing onChange; React will warn and the user cannot type`
c) `value cannot be an empty string`
d) `useState cannot hold strings`

**Answer: b) `Missing onChange; React will warn and the user cannot type`**

---

**10. How do you bind a `<textarea>` as controlled in React?**

a) `Use children text only; never value`
b) `Use value and onChange like an input`
c) `Use defaultChecked`
d) `Use src and alt`

**Answer: b) `Use value and onChange like an input`**

---

**11. For a controlled `<select>`, how do you set the chosen option?**

a) `selected attribute on each option only`
b) `value (or defaultValue for uncontrolled) on select plus onChange`
c) `Only CSS`
d) `Using key on option instead of value`

**Answer: b) `value (or defaultValue for uncontrolled) on select plus onChange`**

---

**12. What does "lifting state up" mean?**

a) `Moving state into global Redux only`
b) `Moving shared state to the closest common ancestor and passing it down as props`
c) `Deleting all local state`
d) `Using refs for all data`

**Answer: b) `Moving shared state to the closest common ancestor and passing it down as props`**

---

**13. Component composition often means:**

a) `Using only class components`
b) `Building UIs by nesting components and passing children or render slots`
c) `Avoiding props entirely`
d) `Inlining all CSS in one file`

**Answer: b) `Building UIs by nesting components and passing children or render slots`**

---

**14. React Developer Tools lets you primarily:**

a) `Compile Rust to WASM`
b) `Inspect the component tree, props, state, and hooks in the browser`
c) `Replace npm`
d) `Host static files on CDN only`

**Answer: b) `Inspect the component tree, props, state, and hooks in the browser`**

---

**15. `create-react-app` is best described as:**

a) `The React core runtime`
b) `A toolchain that scaffolds a React app with bundler and dev server preconfigured`
c) `A database ORM`
d) `A replacement for JSX`

**Answer: b) `A toolchain that scaffolds a React app with bundler and dev server preconfigured`**

---

**16. Vite for React typically provides:**

a) `Slower dev server than all alternatives always`
b) `Fast dev server using native ES modules and optimized production builds`
c) `Server-side rendering only with no client bundle`
d) `A non-JavaScript bundler`

**Answer: b) `Fast dev server using native ES modules and optimized production builds`**

---

**17. A common convention is to place reusable UI components under:**

a) `node_modules/components`
b) `A folder like src/components`
c) `public/src`
d) `dist/dev`

**Answer: b) `A folder like src/components`**

---

**18. Files in the `public` folder in CRA/Vite are typically:**

a) `Bundled as ES modules with tree-shaking only`
b) `Served as static assets at the root path`
c) `Ignored by the dev server`
d) `Compiled to WebAssembly`

**Answer: b) `Served as static assets at the root path`**

---

**19. With `prop-types`, what does `PropTypes.string` enforce?**

a) `The prop must be a React element`
b) `The prop should be a string (development warning if not)`
c) `The prop must be a function`
d) `The prop is always required to be a number`

**Answer: b) `The prop should be a string (development warning if not)`**

---

**20. What does `someProp: PropTypes.number.isRequired` express?**

a) `The prop is optional`
b) `The prop must be provided and be a number in development checks`
c) `The prop is stripped in production automatically`
d) `TypeScript will infer it without types`

**Answer: b) `The prop must be provided and be a number in development checks`**

---

**21. `React.StrictMode` in development may:**

a) `Disable all effects`
b) `Double-invoke certain lifecycles/effects in development to surface unsafe side effects`
c) `Remove warnings`
d) `Block rendering of class components`

**Answer: b) `Double-invoke certain lifecycles/effects in development to surface unsafe side effects`**

---

**22. Which component is typically used once at the top to enable client-side routing?**

a) `Routes with no router parent`
b) `BrowserRouter`
c) `A lone Route element with no Routes parent`
d) `A plain anchor tag only`

**Answer: b) `BrowserRouter`**

---

**23. In React Router v6, which wraps individual path definitions?**

a) `Switch (v5 style) as the only wrapper`
b) `Routes wrapping Route elements`
c) `Router with no child routes`
d) `NavLink lists without Route`

**Answer: b) `Routes wrapping Route elements`**

---

**24. What does `<Route path="/about" element={<About />} />` do?**

a) `Always navigates away from the app`
b) `Renders the About component when the URL matches /about`
c) `Downloads a new HTML page`
d) `Registers a service worker`

**Answer: b) `Renders the About component when the URL matches /about`**

---

**25. Which component creates an accessible navigation link without full page reload?**

a) `Plain anchor is always required for SPA routing`
b) `Link with a to prop from react-router-dom`
c) `button with href`
d) `form action only`

**Answer: b) `Link with a to prop from react-router-dom`**

---

**26. `NavLink` differs from `Link` mainly by:**

a) `Only working with hash URLs`
b) `Ability to apply active/styling state based on current route`
c) `Forcing a full reload`
d) `Being deprecated`

**Answer: b) `Ability to apply active/styling state based on current route`**

---

**27. What does `useNavigate()` return?**

a) `The current pathname string only`
b) `A function to navigate programmatically`
c) `All route params as an array`
d) `A ref to the root DOM node`

**Answer: b) `A function to navigate programmatically`**

---

**28. After this runs inside a click handler, what happens?**

```jsx
const navigate = useNavigate();
navigate("/dashboard");
```

a) `Full browser page load to /dashboard`
b) `Client-side navigation to /dashboard within the SPA`
c) `Nothing; navigate is async only`
d) `Only works with HashRouter`

**Answer: b) `Client-side navigation to /dashboard within the SPA`**

---

**29. `useRef` is often used to:**

a) `Store mutable values or hold a DOM node reference without causing re-renders`
b) `Replace all useState calls`
c) `Subscribe to Redux only`
d) `Declare prop types`

**Answer: a) `Store mutable values or hold a DOM node reference without causing re-renders`**

---

**30. What does `.current` on a ref object represent?**

a) `The previous props only`
b) `The mutable box React associates with the ref (DOM node or your own value)`
c) `The list of children`
d) `The webpack chunk name`

**Answer: b) `The mutable box React associates with the ref (DOM node or your own value)`**

---

**31. When is the DOM node available on `inputRef.current` for:**

```jsx
const inputRef = useRef(null);
return <input ref={inputRef} />;
```

a) `During render, before commit`
b) `After the element is mounted (e.g., in useEffect or event handlers)`
c) `Never; refs do not work on inputs`
d) `Only in class components`

**Answer: b) `After the element is mounted (e.g., in useEffect or event handlers)`**

---

**32. `createContext` is used to:**

a) `Create a new React root`
b) `Define a context object for sharing values through the tree without prop drilling`
c) `Replace hooks`
d) `Bundle CSS modules`

**Answer: b) `Define a context object for sharing values through the tree without prop drilling`**

---

**33. What does `<MyContext.Provider value={theme}>` do?**

a) `Deletes context`
b) `Supplies the value (e.g. theme) to consuming descendants`
c) `Validates PropTypes only`
d) `Registers a route`

**Answer: b) `Supplies the value (e.g. theme) to consuming descendants`**

---

**34. How do function components read the nearest context value?**

a) `props.context`
b) `useContext(MyContext)`
c) `Static contextType on the function declaration`
d) `createContext().get()`

**Answer: b) `useContext(MyContext)`**

---

**35. What happens if `useContext` is called without a matching Provider above?**

a) `React throws always`
b) `You get the default value passed to createContext(defaultValue), if any`
c) `The app redirects to /`
d) `Hooks are disabled`

**Answer: b) `You get the default value passed to createContext(defaultValue), if any`**

---

**36. In `package.json`, `dependencies` are typically:**

a) `Only used in CI, never installed locally`
b) `Packages required at runtime by your app`
c) `Only TypeScript compiler options`
d) `Ignored by npm`

**Answer: b) `Packages required at runtime by your app`**

---

**37. `devDependencies` are intended for:**

a) `Libraries shipped to end users in the production bundle always`
b) `Tools used during development/build (linters, test runners, bundlers)`
c) `Runtime polyfills only`
d) `Docker base images`

**Answer: b) `Tools used during development/build (linters, test runners, bundlers)`**

---

**38. Which command installs `react` and `react-dom` and saves them to package.json?**

a) `npm init react`
b) `npm install react react-dom`
c) `npm publish react`
d) `node install react`

**Answer: b) `npm install react react-dom`**

---

**39. What does `npm run build` usually do in a Vite/React project?**

a) `Starts the dev server`
b) `Creates an optimized production bundle in the output directory`
c) `Deletes node_modules`
d) `Runs only unit tests`

**Answer: b) `Creates an optimized production bundle in the output directory`**

---

**40. In this effect, what is logged on first mount?**

```jsx
useEffect(() => {
  console.log("tick");
  return () => console.log("tock");
}, []);
```

a) `tock then tick`
b) `tick`
c) `tock only`
d) `Nothing`

**Answer: b) `tick`**

---

**41. If `userId` changes from `1` to `2`, what runs for:**

```jsx
useEffect(() => {
  const id = setInterval(() => {}, 1000);
  return () => clearInterval(id);
}, [userId]);
```

a) `Cleanup runs, then a new effect runs`
b) `Cleanup never runs until unmount only`
c) `The interval is never cleared`
d) `The effect does not re-run`

**Answer: a) `Cleanup runs, then a new effect runs`**

---

**42. Which form field is naturally suited to a single source of truth in the parent?**

a) `Only password fields`
b) `Any field where the parent must validate or coordinate multiple inputs`
c) `Only radio buttons without name`
d) `Fields that never change`

**Answer: b) `Any field where the parent must validate or coordinate multiple inputs`**

---

**43. What is a typical pattern for submitting a controlled form?**

a) `Never use onSubmit`
b) `onSubmit handler calls preventDefault and reads state values`
c) `Let the browser POST and reload`
d) `Use only defaultValue on submit`

**Answer: b) `onSubmit handler calls preventDefault and reads state values`**

---

**44. `import.meta.env` in Vite is commonly used for:**

a) `Defining React components`
b) `Accessing environment variables exposed to the client at build time`
c) `Replacing useEffect`
d) `Configuring Babel plugins only`

**Answer: b) `Accessing environment variables exposed to the client at build time`**

---

**45. Which file is usually the entry script that mounts the app with `createRoot`?**

a) `public/index.html as the script entry`
b) `src/main.jsx or src/index.js (tooling-dependent)`
c) `package-lock.json`
d) `vite.config.ts only`

**Answer: b) `src/main.jsx or src/index.js (tooling-dependent)`**

---

**46. PropTypes are checked when:**

a) `Only in production builds for performance`
b) `In development; they are not a substitute for static typing`
c) `At npm publish time only`
d) `Never if you use JSX`

**Answer: b) `In development; they are not a substitute for static typing`**

---

**47. Which route prop is used in React Router v6 for dynamic segments like `/users/:id`?**

a) `exact`
b) `path="/users/:id"`
c) `match`
d) `component={}`

**Answer: b) `path="/users/:id"`**

---

**48. Updating `ref.current` in a function component:**

a) `Always triggers a re-render`
b) `Does not by itself trigger a re-render`
c) `Is forbidden`
d) `Resets all state`

**Answer: b) `Does not by itself trigger a re-render`**

---

**49. Multiple contexts are often composed by:**

a) `Nesting Providers at different levels`
b) `Using only one global variable`
c) `Deleting children`
d) `Using Link for state`

**Answer: a) `Nesting Providers at different levels`**

---

**50. In `package.json`, the `"scripts"` field is used to:**

a) `List runtime dependencies only`
b) `Define shortcut commands like start, test, and build for npm/yarn/pnpm`
c) `Configure ESLint rules only`
d) `Pin Node.js major version`

**Answer: b) `Define shortcut commands like start, test, and build for npm/yarn/pnpm`**

---

