# React MCQ - Set 1 (Beginner Level)

**1. What is React primarily described as?**

a) `A relational database engine`
b) `A JavaScript library for building user interfaces`
c) `A CSS preprocessor`
d) `A Node.js web server framework`

**Answer: b) `A JavaScript library for building user interfaces`**

---

**2. Which statement best explains why React uses a component-based model?**

a) `Components are required by the ECMAScript specification`
b) `UI is split into reusable, composable pieces with their own logic and markup`
c) `Components replace the need for HTML entirely`
d) `Only class-based components can be composed`

**Answer: b) `UI is split into reusable, composable pieces with their own logic and markup`**

---

**3. What does the Virtual DOM help React optimize?**

a) `Network bandwidth between client and server`
b) `Comparing in-memory representations of the UI to minimize expensive direct DOM updates`
c) `Replacing the browser's layout engine`
d) `Storing user passwords securely`

**Answer: b) `Comparing in-memory representations of the UI to minimize expensive direct DOM updates`**

---

**4. When React reconciles updates, what is it comparing?**

a) `The previous Virtual DOM tree with the next Virtual DOM tree`
b) `Only CSS class names`
c) `Server HTML with client cookies`
d) `Webpack bundles with source maps`

**Answer: a) `The previous Virtual DOM tree with the next Virtual DOM tree`**

---

**5. Which is true about the real DOM versus the Virtual DOM in typical React apps?**

a) `React never touches the real DOM`
b) `React may batch updates and apply minimal patches to the real DOM`
c) `The Virtual DOM is the same object as document.body`
d) `Virtual DOM updates always require a full page reload`

**Answer: b) `React may batch updates and apply minimal patches to the real DOM`**

---

**6. JSX is best described as:**

a) `A separate programming language that replaces JavaScript`
b) `Syntax extension that looks like HTML and compiles to JavaScript`
c) `A browser-native markup supported without build tools`
d) `A JSON schema for API responses`

**Answer: b) `Syntax extension that looks like HTML and compiles to JavaScript`**

---

**7. What does this JSX expression render when `name` is `"Ada"`?**

```jsx
const name = "Ada";
return <h1>Hello, {name.toUpperCase()}!</h1>;
```

a) `Hello, {name.toUpperCase()}!`
b) `Hello, Ada!`
c) `Hello, ADA!`
d) `Hello, name.toUpperCase()!`

**Answer: c) `Hello, ADA!`**

---

**8. In JSX, why must multi-word HTML attributes like `class` be written differently?**

a) `class is a reserved word in JavaScript, so JSX uses className`
b) `React does not support CSS`
c) `Browsers reject the word class in HTML`
d) `Webpack renames class to id automatically`

**Answer: a) `class is a reserved word in JavaScript, so JSX uses className`**

---

**9. Which JSX correctly associates a label with an input using the `for` attribute equivalent?**

a) `<label for="email">Email</label>`
b) `<label htmlFor="email">Email</label>`
c) `<label forHtml="email">Email</label>`
d) `<label data-for="email">Email</label>`

**Answer: b) `<label htmlFor="email">Email</label>`**

---

**10. Which element is valid self-closing JSX?**

a) `<div />` (always required for div)
b) `<img src="x.png" />`
c) `<span></>` without children
d) `Using <p /> is a syntax error in all React versions`

**Answer: b) `<img src="x.png" />`**

---

**11. What does this return?**

```jsx
function Box() {
  return (
    <>
      <span>a</span>
      <span>b</span>
    </>
  );
}
```

a) `A single DOM node with two spans as text nodes only`
b) `Two sibling span elements without an extra wrapper DOM node (fragment)`
c) `A syntax error because fragments are not allowed`
d) `Only the first span; the second is ignored`

**Answer: b) `Two sibling span elements without an extra wrapper DOM node (fragment)`**

---

**12. Which is a valid functional component definition?**

a) `function Welcome(props) { return <h1>Hi</h1>; }`
b) `class Welcome extends Function { render() {} }`
c) `const Welcome = new Component(() => {})`
d) `function Welcome() = { return <h1>Hi</h1> }`

**Answer: a) `function Welcome(props) { return <h1>Hi</h1>; }`**

---

**13. In a class component, where must you return JSX from?**

a) `The constructor`
b) `The render method`
c) `componentDidMount only`
d) `static getDerivedStateFromProps only`

**Answer: b) `The render method`**

---

**14. What must a class component extend in React?**

a) `HTMLElement`
b) `React.Component or React.PureComponent`
c) `Object`
d) `Function`

**Answer: b) `React.Component or React.PureComponent`**

---

**15. Given:**

```jsx
function Greet({ user }) {
  return <p>{user}</p>;
}
```

What renders when used as `<Greet user="Sam" />`?

a) `undefined`
b) `Sam`
c) `[object Object]`
d) `user`

**Answer: b) `Sam`**

---

**16. How do you pass a numeric prop `count` with value 3 in JSX?**

a) `count="3"` only
b) `count={3}`
c) `count=(3)`
d) `count:3`

**Answer: b) `count={3}`**

---

**17. What does `props.children` represent?**

a) `Only the first child component`
b) `Content placed between the opening and closing tags of a component`
c) `All props except className`
d) `A built-in event handler`

**Answer: b) `Content placed between the opening and closing tags of a component`**

---

**18. With default props on a function component, which pattern is common in modern React?**

a) `Greeting.defaultProps = { name: "Guest" }` only (never other patterns)
b) `Default parameters: function Greeting({ name = "Guest" }) { ... }`
c) `props.name || "Guest" inside useEffect only`
d) `React.useDefaultProps hook`

**Answer: b) `Default parameters: function Greeting({ name = "Guest" }) { ... }`**

---

**19. What does `useState` return?**

a) `A single current state value only`
b) `A pair: current state and a setter function`
c) `A ref object`
d) `The previous props`

**Answer: b) `A pair: current state and a setter function`**

---

**20. After clicking the button once, what count is shown?**

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>{count}</button>
  );
}
```

a) `0`
b) `1`
c) `2`
d) `The button throws before updating`

**Answer: b) `1`**

---

**21. Why should you not mutate state directly like `state.items.push(x)` when using `useState`?**

a) `Arrays cannot hold objects in React`
b) `React relies on new references to detect changes and schedule re-renders`
c) `push is deprecated in JavaScript`
d) `Hooks forbid any array methods`

**Answer: b) `React relies on new references to detect changes and schedule re-renders`**

---

**22. In React event handlers, the event object is typically:**

a) `A raw browser event only, never wrapped`
b) `A SyntheticEvent wrapper for cross-browser consistency`
c) `Always undefined in functional components`
d) `The same as window.event in all browsers without pooling`

**Answer: b) `A SyntheticEvent wrapper for cross-browser consistency`**

---

**23. Which handler runs when an input's value changes?**

a) `onSubmit`
b) `onChange`
c) `onLoad`
d) `onResize`

**Answer: b) `onChange`**

---

**24. What prevents a form from doing a full page reload on submit in React?**

a) `Using type="button" on submit buttons only`
b) `Calling event.preventDefault() in the submit handler`
c) `Setting form action="#"`
d) `React blocks all forms by default without configuration`

**Answer: b) `Calling event.preventDefault() in the submit handler`**

---

**25. What does this render when `loggedIn` is false?**

```jsx
function Banner({ loggedIn }) {
  return loggedIn ? <h1>Welcome back</h1> : <h1>Please sign in</h1>;
}
```

a) `Welcome back`
b) `Please sign in`
c) `Nothing`
d) `Both headings`

**Answer: b) `Please sign in`**

---

**26. What does `show && <Badge />` render when `show` is `0`?**

a) `<Badge />`
b) `Nothing`
c) `The number 0 (React renders numeric zero)`
d) `false` as visible text

**Answer: c) `The number 0 (React renders numeric zero)`**

---

**27. What does this component render when `mode` is `"dark"`?**

```jsx
function Theme({ mode }) {
  let label;
  if (mode === "dark") {
    label = <span>Dark</span>;
  } else {
    label = <span>Light</span>;
  }
  return <div>{label}</div>;
}
```

a) `Light`
b) `Dark`
c) `Nothing`
d) `Dark Light`

**Answer: b) `Dark`**

---

**28. Why does React warn when list items lack stable `key` props?**

a) `Keys are only for SEO`
b) `Keys help React identify which items changed, moved, or were removed across renders`
c) `Keys make components run faster by skipping render`
d) `Keys are required by the HTML specification`

**Answer: b) `Keys help React identify which items changed, moved, or were removed across renders`**

---

**29. What is wrong with this list rendering pattern?**

```jsx
{items.map((item) => (
  <li>{item.text}</li>
))}
```

a) `Nothing; this is always correct`
b) `Each list element should have a unique key prop`
c) `map cannot return JSX`
d) `li cannot be used inside JSX`

**Answer: b) `Each list element should have a unique key prop`**

---

**30. Where should the `key` prop be placed when mapping an array?**

a) `On the outermost element returned from the map callback`
b) `On the parent div wrapping the entire list only`
c) `Inside the item object as a property`
d) `On the array variable before map`

**Answer: a) `On the outermost element returned from the map callback`**

---

**31. How do you apply an inline style `font-size: 16px` in JSX?**

a) `style="font-size: 16px"`
b) `style={{ fontSize: "16px" }}`
c) `style={{ "font-size": "16px" }}` only (camelCase forbidden)
d) `css={{ fontSize: 16 }}`

**Answer: b) `style={{ fontSize: "16px" }}`**

---

**32. Which applies the CSS class `btn primary` in JSX?**

a) `class="btn primary"`
b) `className="btn primary"`
c) `classname="btn primary"`
d) `styles="btn primary"`

**Answer: b) `className="btn primary"`**

---

**33. In a typical CSS Modules setup, what does `import styles from "./Button.module.css"` let you do?**

a) `Delete all global CSS automatically`
b) `Use locally scoped class names like styles.root on elements`
c) `Load CSS only on the server`
d) `Replace JavaScript imports with JSON`

**Answer: b) `Use locally scoped class names like styles.root on elements`**

---

**34. Given `export default function App() {}` in `App.js`, which import is valid?**

a) `import { App } from "./App"`
b) `import App from "./App"`
c) `import * as App from "./App"` only as default
d) `require.default("./App")`

**Answer: b) `import App from "./App"`**

---

**35. Given `export function Header() {}` in `Header.jsx`, which import is valid?**

a) `import Header from "./Header"`
b) `import { Header } from "./Header"`
c) `import Header from Header`
d) `include Header from "./Header"`

**Answer: b) `import { Header } from "./Header"`**

---

**36. Which call is equivalent to `<Greet name="Ann" />` using `React.createElement`?**

a) `React.createElement("Greet", { name: "Ann" })`
b) `React.createElement(Greet, { name: "Ann" })`
c) `React.createElement("div", Greet, "Ann")`
d) `createElement.Greet({ name: "Ann" })`

**Answer: b) `React.createElement(Greet, { name: "Ann" })`**

---

**37. In React 18, what is the recommended root API for a client app?**

a) `ReactDOM.render(<App />, document.getElementById("root"))` only forever
b) `createRoot(container).render(<App />)`
c) `ReactDOM.hydrate` for every SPA
d) `document.render(<App />)`

**Answer: b) `createRoot(container).render(<App />)`**

---

**38. What does `ReactDOM.render` (legacy) do compared to `createRoot`?**

a) `It renders to a shadow root only`
b) `It attaches a React tree to a DOM container (legacy entry point)`
c) `It only works with class components`
d) `It replaces fetch for data loading`

**Answer: b) `It attaches a React tree to a DOM container (legacy entry point)`**

---

**39. Which component name follows React convention for components you use as JSX tags?**

a) `function welcome() { return <h1>Hi</h1>; }`
b) `function Welcome() { return <h1>Hi</h1>; }`
c) `function welcome_Component() { return <h1>Hi</h1>; }`
d) `const welcome = () => <h1>Hi</h1>;` used as `<welcome />`

**Answer: b) `function Welcome() { return <h1>Hi</h1>; }`**

---

**40. Why should you treat props as read-only inside a component?**

a) `Mutating props updates the parent state automatically`
b) `Props represent inputs from the parent; mutating them breaks one-way data flow`
c) `The JavaScript engine forbids reading props`
d) `Props are always frozen by Object.freeze in development`

**Answer: b) `Props represent inputs from the parent; mutating them breaks one-way data flow`**

---

**41. What does this render?**

```jsx
function Row(props) {
  return <td {...props} />;
}
// usage:
<Row colSpan={2} data-testid="cell" />;
```

a) `A td with only colSpan`
b) `A td with both colSpan and data-testid spread onto it`
c) `A syntax error`
d) `A td with no attributes`

**Answer: b) `A td with both colSpan and data-testid spread onto it`**

---

**42. In JSX, what does `<input disabled />` mean?**

a) `disabled={undefined}`
b) `disabled={true}`
c) `disabled={false}`
d) `It is invalid JSX`

**Answer: b) `disabled={true}`**

---

**43. What does `<React.Fragment key={id}>...</React.Fragment>` allow that `<>...</>` does not?**

a) `Nothing; they are identical`
b) `Passing a key to a fragment when mapping`
c) `Using hooks inside the fragment`
d) `Avoiding Babel`

**Answer: b) `Passing a key to a fragment when mapping`**

---

**44. What does this JSX render?**

```jsx
{false && <p>x</p>}
```

a) `The text "false"`
b) `Nothing visible`
c) `A runtime error`
d) `The paragraph "x"`

**Answer: b) `Nothing visible`**

---

**45. What happens when you use an index as `key` for a **dynamic** reorderable list?**

a) `It is always the best choice`
b) `It can cause incorrect UI state when item order changes`
c) `React forbids index keys`
d) `Keys are ignored for stateful children`

**Answer: b) `It can cause incorrect UI state when item order changes`**

---

**46. What does this output?**

```jsx
const x = 2;
return <div>{x > 1 ? "yes" : "no"}</div>;
```

a) `yes`
b) `no`
c) `true`
d) `2`

**Answer: a) `yes`**

---

**47. Which hook is used for local component state in function components?**

a) `useProps`
b) `useState`
c) `useLocal`
d) `useComponent`

**Answer: b) `useState`**

---

**48. In JSX, attribute names generally follow which style?**

a) `HTML lowercase only (onclick)`
b) `camelCase for event and DOM properties (onClick, tabIndex)`
c) `snake_case (on_click)`
d) `PascalCase for all attributes`

**Answer: b) `camelCase for event and DOM properties (onClick, tabIndex)`**

---

**49. What is `React.createElement(type, props, ...children)` third argument commonly used for?**

a) `Defining webpack entry points`
b) `Passing child nodes (elements or text) to the created element`
c) `Setting the Redux store`
d) `Registering service workers`

**Answer: b) `Passing child nodes (elements or text) to the created element`**

---

**50. After one click on the button, what is `count`?**

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button
      onClick={() => {
        setCount((c) => c + 1);
        setCount((c) => c + 1);
      }}
    >
      {count}
    </button>
  );
}
```

a) `1`
b) `2`
c) `0`
d) `3`

**Answer: b) `2`**

---

</think>
Fixing question 26: `0 && <Component />` renders `0` in React. Replacing that question with clearer options.

<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
StrReplace