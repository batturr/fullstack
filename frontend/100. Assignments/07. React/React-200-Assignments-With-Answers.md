# 200 React 19 Real-Time Assignments with Answers

1. Create a functional component named `Welcome` that returns a single `<h1>` with the text `Hello, React 19`.

```jsx
import React from "react";

export function Welcome() {
  return <h1>Hello, React 19</h1>;
}

export default Welcome;
```

---

2. Inside JSX, render a variable `userName` and a mathematical expression `2 + 3` in one `<p>`.

```jsx
import React from "react";

export function UserGreeting() {
  const userName = "Alex";
  return (
    <p>
      {userName} — quick math: {2 + 3}
    </p>
  );
}

export default UserGreeting;
```

---

3. Build `Greeting` that accepts a `name` prop and displays `Hello, {name}`.

```jsx
import React from "react";

export function Greeting({ name }) {
  return <p>Hello, {name}</p>;
}

export default function App() {
  return <Greeting name="Jamie" />;
}
```

---

4. Give `Button` a `label` prop with default value `"Click me"` when the parent omits it.

```jsx
import React from "react";

export function Button({ label = "Click me", onClick, type = "button" }) {
  return (
    <button type={type} onClick={onClick}>
      {label}
    </button>
  );
}

export default function Demo() {
  return (
    <div>
      <Button />
      <Button label="Submit" />
    </div>
  );
}
```

---

5. Create `Card` that renders `children` between a header `<div>` and a footer `<div>`.

```jsx
import React from "react";

export function Card({ children }) {
  return (
    <article>
      <div className="card-header">Header</div>
      <div className="card-body">{children}</div>
      <div className="card-footer">Footer</div>
    </article>
  );
}

export default function Demo() {
  return <Card>Main content goes here.</Card>;
}
```

---

6. Return multiple sibling elements from `Toolbar` using a fragment (`<>...</>`) without wrapping in an extra DOM node.

```jsx
import React from "react";

export function Toolbar() {
  return (
    <>
      <button type="button">Cut</button>
      <button type="button">Copy</button>
      <button type="button">Paste</button>
    </>
  );
}

export default Toolbar;
```

---

7. Render `Status` that shows `Online` if `isOnline` is true, otherwise `Offline`, using a ternary in JSX.

```jsx
import React from "react";

export function Status({ isOnline }) {
  return <span>{isOnline ? "Online" : "Offline"}</span>;
}

export default function Demo() {
  return (
    <div>
      <Status isOnline />
      <Status isOnline={false} />
    </div>
  );
}
```

---

8. Render `Badge` that shows a `<span>` with `New` only when `show` is true, using `&&`.

```jsx
import React from "react";

export function Badge({ show }) {
  return <div className="badge-wrap">{show && <span>New</span>}</div>;
}

export default function Demo() {
  return (
    <div>
      <Badge show />
      <Badge show={false} />
    </div>
  );
}
```

---

9. Given `items = [{ id, label }]`, map them to `<li key={id}>{label}</li>` inside a `<ul>`.

```jsx
import React from "react";

const items = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Beta" },
];

export function ItemList() {
  return (
    <ul>
      {items.map(({ id, label }) => (
        <li key={id}>{label}</li>
      ))}
    </ul>
  );
}

export default ItemList;
```

---

10. Explain in your component why `key` must be stable and unique per list item (add a short comment in code).

```jsx
import React from "react";

const items = [
  { id: 1, label: "One" },
  { id: 2, label: "Two" },
];

export function KeyDemo() {
  return (
    <ul>
      {/*
        Keys must be stable (same id for the same logical row across renders) and unique among siblings
        so React can reconcile lists correctly. Using array index as key breaks when items reorder.
      */}
      {items.map((item) => (
        <li key={item.id}>{item.label}</li>
      ))}
    </ul>
  );
}

export default KeyDemo;
```

---

11. Compose `Page` from `Header`, `Main`, and `Footer` as three separate components.

```jsx
import React from "react";

function Header() {
  return <header>Site header</header>;
}

function Main() {
  return <main>Main area</main>;
}

function Footer() {
  return <footer>© {new Date().getFullYear()}</footer>;
}

export function Page() {
  return (
    <>
      <Header />
      <Main />
      <Footer />
    </>
  );
}

export default Page;
```

---

12. Create `utils.js` exporting `capitalize` and import it into `Title.jsx` to format the title prop.

```jsx
// utils.js
export function capitalize(s) {
  if (!s) return "";
  return s[0].toUpperCase() + s.slice(1);
}

// Title.jsx
import React from "react";
import { capitalize } from "./utils";

export function Title({ title }) {
  return <h1>{capitalize(title)}</h1>;
}

export default Title;
```

---

13. Build a counter with `useState`: increment and decrement buttons.

```jsx
import React, { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>{count}</p>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        +
      </button>
      <button type="button" onClick={() => setCount((c) => c - 1)}>
        −
      </button>
    </div>
  );
}

export default Counter;
```

---

14. Toggle a boolean `isVisible` with one button that switches a paragraph’s visibility.

```jsx
import React, { useState } from "react";

export function VisibilityToggle() {
  const [isVisible, setIsVisible] = useState(true);
  return (
    <div>
      <button type="button" onClick={() => setIsVisible((v) => !v)}>
        Toggle
      </button>
      {isVisible && <p>Now you see me.</p>}
    </div>
  );
}

export default VisibilityToggle;
```

---

15. Controlled text input: state holds the value; show the length below the input.

```jsx
import React, { useState } from "react";

export function ControlledLength() {
  const [value, setValue] = useState("");
  return (
    <div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Text"
      />
      <p>Length: {value.length}</p>
    </div>
  );
}

export default ControlledLength;
```

---

16. On form submit, prevent default and `alert` the current input values from controlled fields.

```jsx
import React, { useState } from "react";

export function AlertForm() {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        alert(`email=${email}, note=${note}`);
      }}
    >
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="note" />
      <button type="submit">Submit</button>
    </form>
  );
}

export default AlertForm;
```

---

17. `Button` calls `onClick` with an event; log `event.type` in the handler.

```jsx
import React from "react";

export function LogButton({ children = "Click" }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        console.log(event.type);
      }}
    >
      {children}
    </button>
  );
}

export default LogButton;
```

---

18. `onChange` on a range input updates numeric state and displays the value.

```jsx
import React, { useState } from "react";

export function RangeDemo() {
  const [volume, setVolume] = useState(50);
  return (
    <div>
      <input
        type="range"
        min={0}
        max={100}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
      />
      <p>{volume}</p>
    </div>
  );
}

export default RangeDemo;
```

---

19. Track `firstName`, `lastName`, and `age` with three `useState` hooks in one form preview card.

```jsx
import React, { useState } from "react";

export function ProfilePreview() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  return (
    <div>
      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First" />
      <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last" />
      <input
        type="number"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        placeholder="Age"
      />
      <div className="card">
        <strong>Preview</strong>
        <p>
          {firstName} {lastName}, age {age || "—"}
        </p>
      </div>
    </div>
  );
}

export default ProfilePreview;
```

---

20. Store `user` as `{ name, email }` in one state object; update `email` immutably on change.

```jsx
import React, { useState } from "react";

export function UserEmailForm() {
  const [user, setUser] = useState({ name: "", email: "" });
  return (
    <div>
      <input
        value={user.name}
        onChange={(e) => setUser((u) => ({ ...u, name: e.target.value }))}
        placeholder="name"
      />
      <input
        value={user.email}
        onChange={(e) => setUser((u) => ({ ...u, email: e.target.value }))}
        placeholder="email"
      />
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}

export default UserEmailForm;
```

---

21. Store `tags` as an array of strings; add a tag from an input without mutating the prior array.

```jsx
import React, { useState } from "react";

export function TagInput() {
  const [tags, setTags] = useState([]);
  const [draft, setDraft] = useState("");
  return (
    <div>
      <input value={draft} onChange={(e) => setDraft(e.target.value)} />
      <button
        type="button"
        onClick={() => {
          const t = draft.trim();
          if (!t) return;
          setTags((prev) => [...prev, t]);
          setDraft("");
        }}
      >
        Add tag
      </button>
      <ul>
        {tags.map((t, i) => (
          <li key={`${t}-${i}`}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

export default TagInput;
```

---

22. Lift `count` to parent `App`; pass `count` and `setCount` to two child buttons that share the same count.

```jsx
import React, { useState } from "react";

function DeltaButton({ delta, count, setCount }) {
  return (
    <button type="button" onClick={() => setCount((c) => c + delta)}>
      {delta > 0 ? "+" : ""}
      {delta}
    </button>
  );
}

export function LiftedCounterApp() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Shared: {count}</p>
      <DeltaButton delta={1} count={count} setCount={setCount} />
      <DeltaButton delta={-1} count={count} setCount={setCount} />
    </div>
  );
}

export default LiftedCounterApp;
```

---

23. Remove an item from an array in state by index using immutable update (no `.splice` on the same reference).

```jsx
import React, { useState } from "react";

export function RemoveByIndex() {
  const [items, setItems] = useState(["a", "b", "c"]);
  return (
    <ul>
      {items.map((item, index) => (
        <li key={item}>
          {item}{" "}
          <button type="button" onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}>
            remove
          </button>
        </li>
      ))}
    </ul>
  );
}

export default RemoveByIndex;
```

---

24. Toggle membership of an id in a `selectedIds` array immutably (add/remove like a set).

```jsx
import React, { useState } from "react";

export function SelectionSet() {
  const [selectedIds, setSelectedIds] = useState([]);
  const ids = ["x", "y", "z"];
  const toggle = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  return (
    <div>
      {ids.map((id) => (
        <label key={id}>
          <input type="checkbox" checked={selectedIds.includes(id)} onChange={() => toggle(id)} />
          {id}
        </label>
      ))}
      <pre>{JSON.stringify(selectedIds)}</pre>
    </div>
  );
}

export default SelectionSet;
```

---

25. Implement a simple `login` form: controlled fields, `onSubmit` sets a `submitted` flag in state.

```jsx
import React, { useState } from "react";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="user" />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="pass"
      />
      <button type="submit">Login</button>
      {submitted && <p>Submitted (mock).</p>}
    </form>
  );
}

export default LoginForm;
```

---

26. Reset all fields to initial values with a `Reset` button without mutating state in place incorrectly.

```jsx
import React, { useState } from "react";

const initial = { name: "", city: "", agree: false };

export function ResettableForm() {
  const [form, setForm] = useState(initial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <input
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
      <input
        value={form.city}
        onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
      />
      <label>
        <input
          type="checkbox"
          checked={form.agree}
          onChange={(e) => setForm((f) => ({ ...f, agree: e.target.checked }))}
        />
        Agree
      </label>
      <button type="button" onClick={() => setForm({ ...initial })}>
        Reset
      </button>
    </form>
  );
}

export default ResettableForm;
```

---

27. `useEffect` with `[]` runs once on mount; log `"mounted"` and return a cleanup that logs `"unmounted"`.

```jsx
import React, { useEffect } from "react";

export function MountLog() {
  useEffect(() => {
    console.log("mounted");
    return () => console.log("unmounted");
  }, []);
  return <p>Open the console.</p>;
}

export default MountLog;
```

---

28. Fetch JSON from `https://jsonplaceholder.typicode.com/posts/1` on mount; store `title` in state; show loading text.

```jsx
import React, { useEffect, useState } from "react";

export function PostTitleFetch() {
  const [title, setTitle] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("https://jsonplaceholder.typicode.com/posts/1");
        const data = await res.json();
        if (alive) setTitle(data.title);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  if (loading) return <p>Loading…</p>;
  return <h1>{title}</h1>;
}

export default PostTitleFetch;
```

---

29. Sync `document.title` to a `pageTitle` state value whenever it changes.

```jsx
import React, { useEffect, useState } from "react";

export function DocumentTitleSync() {
  const [pageTitle, setPageTitle] = useState("Home");
  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);
  return (
    <input value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} aria-label="Page title" />
  );
}

export default DocumentTitleSync;
```

---

30. Start an interval on mount that increments a counter every second; clear it on unmount.

```jsx
import React, { useEffect, useState } from "react";

export function Ticker() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return <p>{seconds}s</p>;
}

export default Ticker;
```

---

31. `useRef` holding a DOM reference; button scrolls the page to that element (`scrollIntoView`).

```jsx
import React, { useRef } from "react";

export function ScrollTargetDemo() {
  const targetRef = useRef(null);
  return (
    <div>
      <div style={{ height: "120vh" }}>Scroll down…</div>
      <div ref={targetRef} tabIndex={-1}>
        Target section
      </div>
      <button type="button" onClick={() => targetRef.current?.scrollIntoView({ behavior: "smooth" })}>
        Scroll to target
      </button>
    </div>
  );
}

export default ScrollTargetDemo;
```

---

32. Store the previous render’s value of `count` using `useRef` (not for DOM).

```jsx
import React, { useEffect, useRef, useState } from "react";

export function PreviousCount() {
  const [count, setCount] = useState(0);
  const prevRef = useRef(undefined);
  useEffect(() => {
    prevRef.current = count;
  });
  const previous = prevRef.current;
  return (
    <div>
      <p>
        Now: {count}, previous render value: {previous === undefined ? "—" : previous}
      </p>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        +
      </button>
    </div>
  );
}

export default PreviousCount;
```

---

33. On mount, focus a text input using `ref` and `useEffect`.

```jsx
import React, { useEffect, useRef, useState } from "react";

export function AutoFocusInput() {
  const inputRef = useRef(null);
  const [, setTick] = useState(0);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  return (
    <div>
      <input ref={inputRef} defaultValue="focused on mount" />
      <button type="button" onClick={() => setTick((t) => t + 1)}>
        Re-mount pattern: use key on parent in real apps
      </button>
    </div>
  );
}

export default AutoFocusInput;
```

---

34. Listen to `window` `resize` and store `innerWidth` in state; remove listener on cleanup.

```jsx
import React, { useEffect, useState } from "react";

export function WindowWidth() {
  const [innerWidth, setInnerWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setInnerWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return <p>innerWidth: {innerWidth}</p>;
}

export default WindowWidth;
```

---

35. Debounced search: typing updates `query` immediately but `debouncedQuery` only after 300ms idle (`useEffect` + timeout).

```jsx
import React, { useEffect, useState } from "react";

export function DebouncedSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <p>
        Immediate: <code>{query}</code>
      </p>
      <p>
        Debounced: <code>{debouncedQuery}</code>
      </p>
    </div>
  );
}

export default DebouncedSearch;
```

---

36. Abort a fetch on unmount or when the URL dependency changes using `AbortController`.

```jsx
import React, { useEffect, useState } from "react";

export function AbortFetchDemo({ url }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch(url, { signal: ac.signal });
        setData(await res.json());
      } catch (e) {
        if (e.name !== "AbortError") console.error(e);
      }
    })();
    return () => ac.abort();
  }, [url]);
  return <pre>{data ? JSON.stringify(data, null, 2) : "loading…"}</pre>;
}

export default function App() {
  const [u, setU] = useState("https://jsonplaceholder.typicode.com/posts/1");
  return (
    <div>
      <button type="button" onClick={() => setU("https://jsonplaceholder.typicode.com/posts/2")}>
        Switch URL
      </button>
      <AbortFetchDemo url={u} />
    </div>
  );
}
```

---

37. Apply inline `style` object for color and fontSize on a heading.

```jsx
import React from "react";

export function StyledHeading() {
  return (
    <h1 style={{ color: "crimson", fontSize: "2rem" }}>
      Inline styled heading
    </h1>
  );
}

export default StyledHeading;
```

---

38. Use `className` with static string classes on a card layout.

```jsx
import React from "react";

export function StaticCard() {
  return (
    <div className="rounded border border-gray-300 p-4 shadow-sm max-w-sm">
      <h2 className="text-lg font-semibold">Card title</h2>
      <p className="text-sm text-gray-600">Card body using static className strings.</p>
    </div>
  );
}

export default StaticCard;
```

---

39. Import a CSS Module `Button.module.css` and apply `styles.primary` to a button.

```jsx
import React from "react";
// Assume Button.module.css contains: .primary { background: #2563eb; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; }
import styles from "./Button.module.css";

export function PrimaryButton() {
  return (
    <button type="button" className={styles.primary}>
      Primary
    </button>
  );
}

export default PrimaryButton;
```

---

40. Build `Pill` with conditional classes: active vs inactive (template string or `clsx`-style helper without library if you prefer).

```jsx
import React from "react";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function Pill({ active, children }) {
  return (
    <span
      className={cx(
        "inline-block rounded-full px-3 py-1 text-sm",
        active ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800",
      )}
    >
      {children}
    </span>
  );
}

export default function Demo() {
  return (
    <div className="flex gap-2">
      <Pill active>Active</Pill>
      <Pill active={false}>Inactive</Pill>
    </div>
  );
}
```

---

41. Dynamic width style on a progress bar from numeric `percent` prop (0–100).

```jsx
import React from "react";

export function ProgressBar({ percent }) {
  const p = Math.min(100, Math.max(0, percent));
  return (
    <div className="h-2 w-full rounded bg-gray-200">
      <div className="h-2 rounded bg-green-500 transition-all" style={{ width: `${p}%` }} />
    </div>
  );
}

export default function Demo() {
  return <ProgressBar percent={37} />;
}
```

---

42. Describe (in comments) how “styled components” work; render one plain component styled via CSS module as the practical part.

```jsx
import React from "react";
/*
  Styled-components (library): tagged template literals create unique class names and inject CSS at runtime.
  Practical equivalent here: CSS Module scopes styles locally to this component file.
*/
import styles from "./Card.module.css";

export function StyledCardNote() {
  return <div className={styles.box}>Styled via CSS module (like styled-components ergonomics).</div>;
}

export default StyledCardNote;
```

---

43. Use Tailwind utility classes (`className="flex gap-2 rounded-md p-4"`) on a toolbar component.

```jsx
import React from "react";

export function TailwindToolbar() {
  return (
    <div className="flex gap-2 rounded-md border border-gray-200 p-4 shadow-sm">
      <button type="button" className="rounded bg-gray-100 px-3 py-1">
        One
      </button>
      <button type="button" className="rounded bg-gray-100 px-3 py-1">
        Two
      </button>
    </div>
  );
}

export default TailwindToolbar;
```

---

44. Theme toggle that switches `data-theme` on `<html>` or a wrapper and uses CSS variables for colors.

```jsx
import React, { useEffect, useState } from "react";

export function ThemeToggleRoot() {
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return (
    <button type="button" onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
      Toggle theme (sets data-theme on &lt;html&gt; — pair with CSS variables in global CSS)
    </button>
  );
}

export default ThemeToggleRoot;
```

---

45. Todo list: add todo with unique id, toggle `done`, remove todo.

```jsx
import React, { useState } from "react";

let idSeq = 0;
function nextId() {
  return ++idSeq;
}

export function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          setTodos((t) => [...t, { id: nextId(), text: text.trim(), done: false }]);
          setText("");
        }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <label>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() =>
                  setTodos((list) => list.map((x) => (x.id === todo.id ? { ...x, done: !x.done } : x)))
                }
              />
              {todo.text}
            </label>
            <button type="button" onClick={() => setTodos((list) => list.filter((x) => x.id !== todo.id))}>
              delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoApp;
```

---

46. Search filter: list of names filters as user types in a search box (case-insensitive).

```jsx
import React, { useMemo, useState } from "react";

const NAMES = ["Anna", "Bob", "alice", "Zed", "Charlie"];

export function NameSearch() {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => NAMES.filter((n) => n.toLowerCase().includes(q.trim().toLowerCase())),
    [q],
  );
  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" />
      <ul>
        {filtered.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
}

export default NameSearch;
```

---

47. Sortable list: buttons sort an array of products by price ascending/descending (pure client state).

```jsx
import React, { useState } from "react";

const PRODUCTS = [
  { id: 1, name: "A", price: 30 },
  { id: 2, name: "B", price: 10 },
  { id: 3, name: "C", price: 20 },
];

export function SortProducts() {
  const [order, setOrder] = useState("asc");
  const sorted = [...PRODUCTS].sort((a, b) => (order === "asc" ? a.price - b.price : b.price - a.price));
  return (
    <div>
      <button type="button" onClick={() => setOrder("asc")}>
        Price ↑
      </button>
      <button type="button" onClick={() => setOrder("desc")}>
        Price ↓
      </button>
      <ul>
        {sorted.map((p) => (
          <li key={p.id}>
            {p.name} — {p.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SortProducts;
```

---

48. Fully controlled registration form: name, email, password fields bound to state.

```jsx
import React, { useState } from "react";

export function RegistrationForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="name" required />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" type="email" />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
        type="password"
      />
      <button type="submit">Register</button>
    </form>
  );
}

export default RegistrationForm;
```

---

49. Multi-field address form: street, city, zip; show a live JSON preview of the object.

```jsx
import React, { useState } from "react";

export function AddressForm() {
  const [address, setAddress] = useState({ street: "", city: "", zip: "" });
  const set = (k) => (e) => setAddress((a) => ({ ...a, [k]: e.target.value }));
  return (
    <div>
      <input value={address.street} onChange={set("street")} placeholder="street" />
      <input value={address.city} onChange={set("city")} placeholder="city" />
      <input value={address.zip} onChange={set("zip")} placeholder="zip" />
      <pre>{JSON.stringify(address, null, 2)}</pre>
    </div>
  );
}

export default AddressForm;
```

---

50. Validate email format on submit; show error message state without blocking typing.

```jsx
import React, { useState } from "react";

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export function EmailValidateForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(emailOk(email) ? "" : "Invalid email");
      }}
    >
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
      {error && <p role="alert">{error}</p>}
      <button type="submit">Submit</button>
    </form>
  );
}

export default EmailValidateForm;
```

---

51. Checkbox group for `interests[]`; toggling updates an array in state immutably.

```jsx
import React, { useState } from "react";

const OPTIONS = ["music", "sports", "coding"];

export function InterestsCheckboxes() {
  const [interests, setInterests] = useState([]);
  const toggle = (id) => {
    setInterests((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  return (
    <fieldset>
      <legend>Interests</legend>
      {OPTIONS.map((id) => (
        <label key={id}>
          <input type="checkbox" checked={interests.includes(id)} onChange={() => toggle(id)} />
          {id}
        </label>
      ))}
      <pre>{JSON.stringify(interests)}</pre>
    </fieldset>
  );
}

export default InterestsCheckboxes;
```

---

52. `<select>` for country; changing option updates state and shows selected label.

```jsx
import React, { useMemo, useState } from "react";

const COUNTRIES = [
  { code: "us", label: "United States" },
  { code: "ca", label: "Canada" },
  { code: "mx", label: "Mexico" },
];

export function CountrySelect() {
  const [code, setCode] = useState("us");
  const label = useMemo(() => COUNTRIES.find((c) => c.code === code)?.label ?? "", [code]);
  return (
    <div>
      <select value={code} onChange={(e) => setCode(e.target.value)}>
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label}
          </option>
        ))}
      </select>
      <p>Selected: {label}</p>
    </div>
  );
}

export default CountrySelect;
```

---

53. Radio group for `plan`: `free` / `pro`; only one selected at a time.

```jsx
import React, { useState } from "react";

export function PlanRadio() {
  const [plan, setPlan] = useState("free");
  return (
    <fieldset>
      <legend>Plan</legend>
      <label>
        <input type="radio" name="plan" checked={plan === "free"} onChange={() => setPlan("free")} />
        free
      </label>
      <label>
        <input type="radio" name="plan" checked={plan === "pro"} onChange={() => setPlan("pro")} />
        pro
      </label>
      <p>{plan}</p>
    </fieldset>
  );
}

export default PlanRadio;
```

---

54. File input: preview selected image with `URL.createObjectURL` and revoke on change/cleanup.

```jsx
import React, { useEffect, useState } from "react";

export function ImagePreviewInput() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      {url && <img src={url} alt="preview" style={{ maxWidth: 200 }} />}
    </div>
  );
}

export default ImagePreviewInput;
```

---

55. Dynamic fields: “Add another phone” pushes a new empty string into `phones` array with inputs bound per index.

```jsx
import React, { useState } from "react";

export function DynamicPhones() {
  const [phones, setPhones] = useState([""]);
  return (
    <div>
      {phones.map((p, i) => (
        <div key={i}>
          <input
            value={p}
            onChange={(e) =>
              setPhones((list) => list.map((x, j) => (j === i ? e.target.value : x)))
            }
          />
        </div>
      ))}
      <button type="button" onClick={() => setPhones((list) => [...list, ""])}>
        Add another phone
      </button>
    </div>
  );
}

export default DynamicPhones;
```

---

56. Form reset sets all controlled fields back to defaults including checkboxes and select.

```jsx
import React, { useState } from "react";

const defaults = { name: "", country: "us", newsletter: false };

export function FullResetForm() {
  const [name, setName] = useState(defaults.name);
  const [country, setCountry] = useState(defaults.country);
  const [newsletter, setNewsletter] = useState(defaults.newsletter);
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
    >
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <select value={country} onChange={(e) => setCountry(e.target.value)}>
        <option value="us">US</option>
        <option value="uk">UK</option>
      </select>
      <label>
        <input
          type="checkbox"
          checked={newsletter}
          onChange={(e) => setNewsletter(e.target.checked)}
        />
        Newsletter
      </label>
      <button
        type="reset"
        onClick={() => {
          setName(defaults.name);
          setCountry(defaults.country);
          setNewsletter(defaults.newsletter);
        }}
      >
        Reset
      </button>
    </form>
  );
}

export default FullResetForm;
```

---

57. Set up `react-router-dom` `BrowserRouter`, `Routes`, `Route` for `/`, `/about`.

```jsx
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function Home() {
  return <h1>Home</h1>;
}
function About() {
  return <h1>About</h1>;
}

export function AppRouter57() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter57;
```

---

58. Use `Link` for navigation and `Outlet` in a layout route wrapping children.

```jsx
import React from "react";
import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";

function Layout() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> | <Link to="/inbox">Inbox</Link>
      </nav>
      <Outlet />
    </div>
  );
}

export function AppRouter58() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<p>Home page</p>} />
          <Route path="inbox" element={<p>Inbox</p>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter58;
```

---

59. Nested routes: `/dashboard` and `/dashboard/settings` sharing a dashboard layout.

```jsx
import React from "react";
import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";

function DashboardLayout() {
  return (
    <div>
      <aside>
        <Link to="/dashboard">Overview</Link>
        <Link to="/dashboard/settings">Settings</Link>
      </aside>
      <Outlet />
    </div>
  );
}

export function AppRouter59() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<p>Dashboard home</p>} />
          <Route path="settings" element={<p>Settings</p>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter59;
```

---

60. Dynamic route `/users/:userId` reading `userId` via `useParams`.

```jsx
import React from "react";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";

function UserProfile() {
  const { userId } = useParams();
  return <p>User id: {userId}</p>;
}

export function AppRouter60() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/users/:userId" element={<UserProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter60;
```

---

61. Programmatic navigation: after “fake login”, `useNavigate` to `/home`.

```jsx
import React, { useState } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";

function LoginScreen() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (user.trim()) navigate("/home");
      }}
    >
      <input value={user} onChange={(e) => setUser(e.target.value)} />
      <button type="submit">Fake login</button>
    </form>
  );
}

function Home() {
  return <h1>Home</h1>;
}

export function AppRouter61() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter61;
```

---

62. `NavLink` with `className` or `style` callback to highlight the active route.

```jsx
import React from "react";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";

export function AppRouter62() {
  return (
    <BrowserRouter>
      <nav>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Home
        </NavLink>
        <NavLink
          to="/shop"
          style={({ isActive }) => ({ fontWeight: isActive ? 700 : 400 })}
        >
          Shop
        </NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<p>Home</p>} />
        <Route path="/shop" element={<p>Shop</p>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter62;
```

---

63. Catch-all route `path="*"` rendering a simple `NotFound` page.

```jsx
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function NotFound() {
  return <h1>404</h1>;
}

export function AppRouter63() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<p>OK</p>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter63;
```

---

64. Redirect from `/old` to `/new` using `Navigate` component.

```jsx
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

export function AppRouter64() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/old" element={<Navigate to="/new" replace />} />
        <Route path="/new" element={<p>New location</p>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter64;
```

---

65. `createContext` + `Provider` for a string `theme` (`light` | `dark`).

```jsx
import React, { createContext, useContext } from "react";

const ThemeContext = createContext("light");

export function ThemeProvider65({ children }) {
  return <ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>;
}

export function useTheme65() {
  return useContext(ThemeContext);
}

export default ThemeContext;
```

---

66. Consume theme in a deep child with `useContext` and style a box accordingly.

```jsx
import React, { createContext, useContext } from "react";

const ThemeContext = createContext("light");

function DeepChild() {
  const theme = useContext(ThemeContext);
  return (
    <div
      style={{
        padding: 8,
        background: theme === "dark" ? "#111" : "#eee",
        color: theme === "dark" ? "#eee" : "#111",
      }}
    >
      Deep themed box
    </div>
  );
}

export function ThemeTree() {
  return (
    <ThemeContext.Provider value="dark">
      <section>
        <DeepChild />
      </section>
    </ThemeContext.Provider>
  );
}

export default ThemeTree;
```

---

67. Theme context: toggle function in context value updates theme state in provider.

```jsx
import React, { createContext, useContext, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider67({ children }) {
  const [theme, setTheme] = useState("light");
  const value = useMemo(() => ({ theme, toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")) }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function ThemeToggleConsumer() {
  const ctx = useContext(ThemeContext);
  return (
    <button type="button" onClick={ctx.toggle}>
      theme: {ctx.theme}
    </button>
  );
}

export default ThemeProvider67;
```

---

68. Auth context: `{ user, login, logout }` with simple username string or `null`.

```jsx
import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider68({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(
    () => ({
      user,
      login: (username) => setUser(username),
      logout: () => setUser(null),
    }),
    [user],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthBar() {
  const { user, login, logout } = useContext(AuthContext);
  return user ? (
    <div>
      Hi {user} <button onClick={logout}>logout</button>
    </div>
  ) : (
    <button onClick={() => login("pat")}>login</button>
  );
}

export default AuthProvider68;
```

---

69. Language context: `locale` and `setLocale`; child displays a dictionary entry for `en` vs `es`.

```jsx
import React, { createContext, useContext, useMemo, useState } from "react";

const I18nContext = createContext(null);
const dict = {
  en: { hello: "Hello" },
  es: { hello: "Hola" },
};

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState("en");
  const value = useMemo(() => ({ locale, setLocale, t: dict[locale] }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function Greeting69() {
  const { locale, setLocale, t } = useContext(I18nContext);
  return (
    <div>
      <p>{t.hello}</p>
      <button type="button" onClick={() => setLocale(locale === "en" ? "es" : "en")}>
        toggle {locale}
      </button>
    </div>
  );
}

export default I18nProvider;
```

---

70. Split fast-changing and slow-changing values into two contexts to avoid unnecessary re-renders (demonstrate pattern in comments + minimal code).

```jsx
import React, { createContext, useContext, useMemo, useState } from "react";

/*
  Split contexts: consumers of UserProfileContext won't re-render when NotificationCountContext updates
  and vice versa, unlike a single context holding both.
*/
const UserProfileContext = createContext(null);
const NotificationCountContext = createContext(null);

export function SplitProviders({ children }) {
  const [profile] = useState({ name: "Sam" });
  const [notifCount, setNotifCount] = useState(0);
  const profileVal = useMemo(() => profile, [profile]);
  const notifVal = useMemo(() => ({ notifCount, bump: () => setNotifCount((n) => n + 1) }), [notifCount]);
  return (
    <UserProfileContext.Provider value={profileVal}>
      <NotificationCountContext.Provider value={notifVal}>{children}</NotificationCountContext.Provider>
    </UserProfileContext.Provider>
  );
}

export function ProfileOnly() {
  const p = useContext(UserProfileContext);
  return <span>{p.name}</span>;
}

export function NotifOnly() {
  const n = useContext(NotificationCountContext);
  return (
    <button type="button" onClick={n.bump}>
      notifs: {n.notifCount}
    </button>
  );
}

export default SplitProviders;
```

---

71. Counter with `useReducer` (`increment`, `decrement`, `reset`).

```jsx
import React, { useReducer } from "react";

function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return state + 1;
    case "decrement":
      return state - 1;
    case "reset":
      return 0;
    default:
      return state;
  }
}

export function ReducerCounter() {
  const [count, dispatch] = useReducer(reducer, 0);
  return (
    <div>
      <p>{count}</p>
      <button type="button" onClick={() => dispatch({ type: "increment" })}>+</button>
      <button type="button" onClick={() => dispatch({ type: "decrement" })}>−</button>
      <button type="button" onClick={() => dispatch({ type: "reset" })}>reset</button>
    </div>
  );
}

export default ReducerCounter;
```

---

72. `useReducer` managing `{ items, filter }` for a filterable todo list.

```jsx
import React, { useMemo, useReducer } from "react";

const initial = { items: [], filter: "all" };

function reducer(state, action) {
  switch (action.type) {
    case "add":
      return { ...state, items: [...state.items, { id: crypto.randomUUID(), text: action.text, done: false }] };
    case "toggle":
      return {
        ...state,
        items: state.items.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t)),
      };
    case "setFilter":
      return { ...state, filter: action.value };
    default:
      return state;
  }
}

export function FilterableTodos() {
  const [state, dispatch] = useReducer(reducer, initial);
  const visible = useMemo(() => {
    if (state.filter === "active") return state.items.filter((t) => !t.done);
    if (state.filter === "done") return state.items.filter((t) => t.done);
    return state.items;
  }, [state.items, state.filter]);
  return (
    <div>
      <div>
        {["all", "active", "done"].map((f) => (
          <button key={f} type="button" onClick={() => dispatch({ type: "setFilter", value: f })}>
            {f}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const text = e.target.elements.todo.value;
          if (text.trim()) dispatch({ type: "add", text: text.trim() });
          e.target.reset();
        }}
      >
        <input name="todo" />
        <button type="submit">add</button>
      </form>
      <ul>
        {visible.map((t) => (
          <li key={t.id}>
            <label>
              <input type="checkbox" checked={t.done} onChange={() => dispatch({ type: "toggle", id: t.id })} />
              {t.text}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FilterableTodos;
```

---

73. `useMemo` to compute an expensive sum of a large array derived from props (simulate with `Array.from`).

```jsx
import React, { useMemo } from "react";

export function ExpensiveSumDemo({ n = 50000 }) {
  const large = useMemo(() => Array.from({ length: n }, (_, i) => i + 1), [n]);
  const sum = useMemo(() => {
    let s = 0;
    for (let i = 0; i < large.length; i++) s += large[i];
    return s;
  }, [large]);
  return <p>Sum 1..{n} = {sum}</p>;
}

export default ExpensiveSumDemo;
```

---

74. `useCallback` stabilizes a child’s callback; pair with `React.memo` on the child to avoid extra renders.

```jsx
import React, { memo, useCallback, useState } from "react";

const Child = memo(function Child({ label, onClick }) {
  console.log("Child render", label);
  return <button onClick={onClick}>{label}</button>;
});

export function CallbackParent() {
  const [count, setCount] = useState(0);
  const stable = useCallback(() => setCount((c) => c + 1), []);
  return (
    <div>
      <p>{count}</p>
      <Child label="stable cb" onClick={stable} />
    </div>
  );
}

export default CallbackParent;
```

---

75. Extract `useLocalStorage(key, initial)` that syncs state with `localStorage`.

```jsx
import React, { useEffect, useState } from "react";

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);
  return [value, setValue];
}

export function LSDemo() {
  const [name, setName] = useLocalStorage("demo-name", "");
  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}

export default LSDemo;
```

---

76. `useDebounce(value, delay)` returning debounced value.

```jsx
import React, { useEffect, useState } from "react";

export function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function DebounceHookDemo() {
  const [q, setQ] = useState("");
  const d = useDebounce(q, 300);
  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} />
      <p>{d}</p>
    </div>
  );
}

export default DebounceHookDemo;
```

---

77. `useFetch(url)` returning `{ data, loading, error, refetch }`.

```jsx
import React, { useCallback, useEffect, useState } from "react";

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);
  const refetch = useCallback(() => setTick((t) => t + 1), []);
  useEffect(() => {
    if (!url) return;
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    fetch(url, { signal: ac.signal })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e);
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [url, tick]);
  return { data, loading, error, refetch };
}

export function FetchDemo() {
  const { data, loading, error, refetch } = useFetch("https://jsonplaceholder.typicode.com/posts/1");
  if (loading) return <p>loading</p>;
  if (error) return <p>{String(error)} <button onClick={refetch}>retry</button></p>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

export default FetchDemo;
```

---

78. `useToggle(initial)` returns `[value, toggle, setValue]`.

```jsx
import React, { useCallback, useState } from "react";

export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}

export function ToggleDemo() {
  const [on, toggle] = useToggle(false);
  return (
    <button type="button" onClick={toggle}>
      {on ? "ON" : "OFF"}
    </button>
  );
}

export default ToggleDemo;
```

---

79. `useMediaQuery("(max-width: 600px)")` updates on resize.

```jsx
import React, { useEffect, useState } from "react";

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = () => setMatches(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export function MqDemo() {
  const narrow = useMediaQuery("(max-width: 600px)");
  return <p>{narrow ? "narrow" : "wide"}</p>;
}

export default MqDemo;
```

---

80. `useOnClickOutside(ref, handler)` closes a dropdown when clicking outside.

```jsx
import React, { useEffect, useRef, useState } from "react";

export function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      const el = ref.current;
      if (!el || el.contains(e.target)) return;
      handler(e);
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

export function DropdownOutside() {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  useOnClickOutside(ref, () => setOpen(false));
  return (
    <div ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)}>
        menu
      </button>
      {open && <div className="panel">inside</div>}
    </div>
  );
}

export default DropdownOutside;
```

---

81. `usePrevious(value)` returns previous render’s value (generic hook).

```jsx
import React, { useRef, useState } from "react";

/** Returns the value from the previous render (generic). */
export function usePrevious(value) {
  const ref = useRef(undefined);
  const prev = ref.current;
  ref.current = value;
  return prev;
}

export function PrevDemo() {
  const [n, setN] = useState(0);
  const prev = usePrevious(n);
  return (
    <div>
      <p>
        Now: {n}, previous: {prev === undefined ? "—" : prev}
      </p>
      <button type="button" onClick={() => setN((x) => x + 1)}>+</button>
    </div>
  );
}

export default PrevDemo;
```

---

82. `useCounter(step)` with increment/decrement using functional updates.

```jsx
import React, { useState } from "react";

export function useCounter(step = 1) {
  const [n, setN] = useState(0);
  return {
    value: n,
    inc: () => setN((x) => x + step),
    dec: () => setN((x) => x - step),
    reset: () => setN(0),
  };
}

export function CounterStepDemo() {
  const c = useCounter(3);
  return (
    <div>
      <p>{c.value}</p>
      <button type="button" onClick={c.inc}>+</button>
      <button type="button" onClick={c.dec}>−</button>
      <button type="button" onClick={c.reset}>reset</button>
    </div>
  );
}

export default CounterStepDemo;
```

---

83. Combine `useReducer` + `useContext` for a mini global store (no Redux).

```jsx
import React, { createContext, useContext, useMemo, useReducer } from "react";

const StateCtx = createContext(null);
const DispatchCtx = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "inc":
      return { ...state, count: state.count + 1 };
    default:
      return state;
  }
}

export function MiniStoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  const d = useMemo(() => dispatch, []);
  return (
    <DispatchCtx.Provider value={d}>
      <StateCtx.Provider value={state}>{children}</StateCtx.Provider>
    </DispatchCtx.Provider>
  );
}

export function useMiniStore() {
  return [useContext(StateCtx), useContext(DispatchCtx)];
}

export function MiniToolbar() {
  const [s, d] = useMiniStore();
  return <button onClick={() => d({ type: "inc" })}>count {s.count}</button>;
}

export default MiniStoreProvider;
```

---

84. Custom hook `useEventListener(event, handler, element)` with proper cleanup.

```jsx
import React, { useEffect, useState } from "react";

export function useEventListener(event, handler, element = window) {
  useEffect(() => {
    if (!element?.addEventListener) return;
    element.addEventListener(event, handler);
    return () => element.removeEventListener(event, handler);
  }, [event, handler, element]);
}

export function KeyDemo84() {
  const [last, setLast] = useState("");
  useEventListener("keydown", (e) => setLast(e.key));
  return <p>last key: {last}</p>;
}

export default KeyDemo84;
```

---

85. Context provider wraps `useReducer` dispatch for a global todo app.

```jsx
import React, { createContext, useContext, useMemo, useReducer } from "react";

const TodoDispatchContext = createContext(null);
const TodoStateContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "add":
      return [...state, { id: crypto.randomUUID(), text: action.text, done: false }];
    case "toggle":
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
    default:
      return state;
  }
}

export function GlobalTodoProvider({ children }) {
  const [todos, dispatch] = useReducer(reducer, []);
  const d = useMemo(() => dispatch, []);
  return (
    <TodoDispatchContext.Provider value={d}>
      <TodoStateContext.Provider value={todos}>{children}</TodoStateContext.Provider>
    </TodoDispatchContext.Provider>
  );
}

export function useTodos() {
  return useContext(TodoStateContext);
}
export function useTodoDispatch() {
  return useContext(TodoDispatchContext);
}

export function TodoList85() {
  const todos = useTodos();
  const dispatch = useTodoDispatch();
  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>
          <button onClick={() => dispatch({ type: "toggle", id: t.id })}>{t.text}</button>
        </li>
      ))}
    </ul>
  );
}

export default GlobalTodoProvider;
```

---

86. Multiple providers nested: `ThemeProvider` inside `AuthProvider`; consume both in one component.

```jsx
import React, { createContext, useContext, useMemo, useState } from "react";

const AuthCtx = createContext(null);
const ThemeCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const v = useMemo(() => ({ user, setUser }), [user]);
  return <AuthCtx.Provider value={v}>{children}</AuthCtx.Provider>;
}

/** ThemeProvider nested inside AuthProvider (assignment order). */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const v = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeCtx.Provider value={v}>{children}</ThemeCtx.Provider>;
}

export function AppWithNestedProviders({ children }) {
  return (
    <AuthProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </AuthProvider>
  );
}

export function CombinedConsumer() {
  const { user } = useContext(AuthCtx);
  const { theme, setTheme } = useContext(ThemeCtx);
  return (
    <div>
      <p>
        {user ? user : "guest"} — {theme}
      </p>
      <button onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>theme</button>
    </div>
  );
}

export default AppWithNestedProviders;
```

---

87. Split “dispatch” and “state” contexts to reduce re-renders (pattern demonstration).

```jsx
import React, { createContext, useContext, useMemo, useReducer } from "react";

const StateCtx = createContext(null);
const DispatchCtx = createContext(null);

function reducer(s, a) {
  return a.type === "bump" ? { ...s, n: s.n + 1 } : s;
}

export function SplitDispatchProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { n: 0 });
  const d = useMemo(() => dispatch, []);
  return (
    <DispatchCtx.Provider value={d}>
      <StateCtx.Provider value={state}>{children}</StateCtx.Provider>
    </DispatchCtx.Provider>
  );
}

export function ReadOnlyChild() {
  const s = useContext(StateCtx);
  return <span>{s.n}</span>;
}

export function DispatchOnlyChild() {
  const d = useContext(DispatchCtx);
  return <button onClick={() => d({ type: "bump" })}>+</button>;
}

export default SplitDispatchProvider;
```

---

88. Shopping cart context: add/remove/update quantity, derived total price with `useMemo`.

```jsx
import React, { createContext, useContext, useMemo, useReducer } from "react";

const CartCtx = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "add":
      {
        const line = state.lines.find((l) => l.id === action.item.id);
        if (line) {
          return {
            ...state,
            lines: state.lines.map((l) =>
              l.id === action.item.id ? { ...l, qty: l.qty + 1 } : l,
            ),
          };
        }
        return { ...state, lines: [...state.lines, { ...action.item, qty: 1 }] };
      }
    case "remove":
      return { ...state, lines: state.lines.filter((l) => l.id !== action.id) };
    case "qty":
      return {
        ...state,
        lines: state.lines.map((l) => (l.id === action.id ? { ...l, qty: action.qty } : l)),
      };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { lines: [] });
  const total = useMemo(
    () => state.lines.reduce((s, l) => s + l.price * l.qty, 0),
    [state.lines],
  );
  const value = useMemo(() => ({ ...state, total, dispatch }), [state.lines, total]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function CartUI() {
  const { lines, total, dispatch } = useContext(CartCtx);
  return (
    <div>
      {lines.map((l) => (
        <div key={l.id}>
          {l.name} ×{l.qty} — {l.price}
          <button onClick={() => dispatch({ type: "remove", id: l.id })}>x</button>
        </div>
      ))}
      <p>Total: {total.toFixed(2)}</p>
      <button onClick={() => dispatch({ type: "add", item: { id: "1", name: "Book", price: 12 } })}>
        add book
      </button>
    </div>
  );
}

export default CartProvider;
```

---

89. Auth flow: mock `login` sets user; protected route wrapper redirects if logged out.

```jsx
import React, { createContext, useContext, useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";

const AuthCtx = createContext(null);

export function AuthProvider89({ children }) {
  const [user, setUser] = useState(null);
  const v = useMemo(() => ({ user, login: () => setUser("pat"), logout: () => setUser(null) }), [user]);
  return <AuthCtx.Provider value={v}>{children}</AuthCtx.Provider>;
}

export function useAuth89() {
  return useContext(AuthCtx);
}

function Protected({ children }) {
  const { user } = useAuth89();
  return user ? children : <Navigate to="/login" replace />;
}

function LoginPage() {
  const { login } = useAuth89();
  const nav = useNavigate();
  return (
    <button
      onClick={() => {
        login();
        nav("/app");
      }}
    >
      login
    </button>
  );
}

export function App89() {
  return (
    <BrowserRouter>
      <AuthProvider89>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/app"
            element={
              <Protected>
                <p>secret</p>
              </Protected>
            }
          />
        </Routes>
      </AuthProvider89>
    </BrowserRouter>
  );
}

export default App89;
```

---

90. Notification context: push toast messages with auto-dismiss timer.

```jsx
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);
  const push = useCallback((msg) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
  }, []);
  const value = useMemo(() => ({ push, toasts }), [push, toasts]);
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div style={{ position: "fixed", bottom: 8, right: 8 }}>
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}

export default ToastProvider;
```

---

91. Global modal context: `openModal(content)`, `closeModal()`, portal render target.

```jsx
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const ModalCtx = createContext(null);

export function ModalProvider({ children }) {
  const [node, setNode] = useState(null);
  const openModal = useCallback((content) => setNode(content), []);
  const closeModal = useCallback(() => setNode(null), []);
  const value = useMemo(() => ({ openModal, closeModal }), [openModal, closeModal]);
  return (
    <ModalCtx.Provider value={value}>
      {children}
      {node && createPortal(<div className="modal">{node}</div>, document.body)}
    </ModalCtx.Provider>
  );
}

export function useModal() {
  return useContext(ModalCtx);
}

export default ModalProvider;
```

---

92. Persist cart to `localStorage` on change, hydrate on load (inside provider).

```jsx
import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const CartCtx = createContext(null);
const STORAGE_KEY = "cart92";

function reducer(state, action) {
  if (action.type === "add") return [...state, action.item];
  return state;
}

export function PersistCartProvider({ children }) {
  const [lines, dispatch] = useReducer(
    reducer,
    [],
    () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"),
  );
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);
  const value = useMemo(() => ({ lines, dispatch }), [lines]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function CartView92() {
  const { lines, dispatch } = useContext(CartCtx);
  return (
    <div>
      {lines.map((l) => (
        <div key={l.id}>{l.name}</div>
      ))}
      <button onClick={() => dispatch({ type: "add", item: { id: String(Date.now()), name: "x" } })}>add</button>
    </div>
  );
}

export default PersistCartProvider;
```

---

93. Selector pattern: `useSelector` hook that subscribes to a slice of context state (simple implementation).

```jsx
import React, { createContext, useContext, useMemo, useReducer } from "react";

const StoreCtx = createContext(null);

function reducer(state, action) {
  if (action.type === "incA") return { ...state, a: state.a + 1 };
  if (action.type === "incB") return { ...state, b: state.b + 1 };
  return state;
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { a: 0, b: 0 });
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

/** Simple selector: re-renders when store context updates (slice by returning only needed fields). */
export function useSelector(selector) {
  const { state } = useContext(StoreCtx);
  return selector(state);
}

export function SliceA() {
  const a = useSelector((s) => s.a);
  return <span>a={a}</span>;
}

export default StoreProvider;
```

---

94. Middleware-style logging: wrap `dispatch` to log actions (lightweight pattern).

```jsx
import React, { useMemo, useReducer } from "react";

function reducer(state, action) {
  if (action.type === "add") return state + action.n;
  return state;
}

export function LoggingDispatchDemo() {
  const [sum, baseDispatch] = useReducer(reducer, 0);
  const dispatch = useMemo(() => {
    return (action) => {
      console.log("action", action);
      baseDispatch(action);
    };
  }, []);
  return (
    <div>
      <p>{sum}</p>
      <button onClick={() => dispatch({ type: "add", n: 2 })}>+2</button>
    </div>
  );
}

export default LoggingDispatchDemo;
```

---

95. Class-free error boundary using `react-error-boundary` library **or** document that native error boundaries are class-based and implement a minimal class `ErrorBoundary` as the standard approach — assignment: implement **recovery UI** with a reset key pattern from a parent functional component.

```jsx
import React, { Component, useState } from "react";

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error(error, info.componentStack);
  }
  render() {
    if (this.state.error) {
      return this.props.fallback(this.state.error, () => this.setState({ error: null }));
    }
    return this.props.children;
  }
}

export function RecoverableApp() {
  const [key, setKey] = useState(0);
  const [boom, setBoom] = useState(false);
  return (
    <ErrorBoundary
      key={key}
      fallback={(err, reset) => (
        <div>
          <p>{String(err.message)}</p>
          <button type="button" onClick={reset}>reset boundary</button>
          <button type="button" onClick={() => setKey((k) => k + 1)}>remount tree</button>
        </div>
      )}
    >
      <button type="button" onClick={() => setBoom(true)}>trigger error</button>
      {boom && <Buggy />}
    </ErrorBoundary>
  );
}

function Buggy() {
  throw new Error("bug");
}

export default RecoverableApp;
```

---

96. Fallback UI showing error message and a “Try again” button that resets boundary state.

```jsx
import React, { Component, useState } from "react";

class EB extends Component {
  state = { err: null };
  static getDerivedStateFromError(e) {
    return { err: e };
  }
  render() {
    if (this.state.err)
      return (
        <div>
          <p>{String(this.state.err.message)}</p>
          <button type="button" onClick={() => this.setState({ err: null })}>Try again</button>
        </div>
      );
    return this.props.children;
  }
}

export function Thrower({ should }) {
  if (should) throw new Error("boom");
  return null;
}

export function FallbackDemo96() {
  const [bad, setBad] = useState(false);
  return (
    <EB>
      <button type="button" onClick={() => setBad(true)}>break</button>
      <Thrower should={bad} />
    </EB>
  );
}

export default FallbackDemo96;
```

---

97. Nested boundaries: inner boundary catches component errors; outer catches layout errors.

```jsx
import React, { Component, useState } from "react";

class Outer extends Component {
  state = { e: null };
  static getDerivedStateFromError(err) {
    return { e: err };
  }
  render() {
    if (this.state.e) return <p>outer caught</p>;
    return this.props.children;
  }
}

class Inner extends Component {
  state = { e: null };
  static getDerivedStateFromError(err) {
    return { e: err };
  }
  render() {
    if (this.state.e) return <p>inner caught</p>;
    return this.props.children;
  }
}

function Boom() {
  throw new Error("inner");
}

export function NestedEB() {
  const [show, setShow] = useState(false);
  return (
    <Outer>
      <Inner>{show && <Boom />}</Inner>
      <button onClick={() => setShow(true)}>throw inner</button>
    </Outer>
  );
}

export default NestedEB;
```

---

98. Async error in child: demonstrate throwing in render after failed fetch state (or using an error boundary compatible pattern).

```jsx
import React, { Component, useEffect, useState } from "react";

class EB extends Component {
  state = { e: null };
  static getDerivedStateFromError(err) {
    return { e: err };
  }
  render() {
    if (this.state.e) return <p>Failed load</p>;
    return this.props.children;
  }
}

function AsyncErrorChild() {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(true);
  }, []);
  if (failed) throw new Error("fetch failed");
  return <p>ok</p>;
}

export function AsyncErrorDemo() {
  return (
    <EB>
      <AsyncErrorChild />
    </EB>
  );
}

export default AsyncErrorDemo;
```

---

99. Log errors to `console.error` with component stack info in `componentDidCatch` equivalent / library callback.

```jsx
import React, { Component } from "react";

class EB extends Component {
  state = { e: null };
  static getDerivedStateFromError(err) {
    return { e: err };
  }
  componentDidCatch(error, info) {
    console.error("logged", error.message, info.componentStack);
  }
  render() {
    if (this.state.e) return <p>caught</p>;
    return this.props.children;
  }
}

function X() {
  throw new Error("x");
}

export function LogDemo() {
  return (
    <EB>
      <X />
    </EB>
  );
}

export default LogDemo;
```

---

100. Button that intentionally throws caught by boundary; second button clears error via reset.

```jsx
import React, { Component, useState } from "react";

class EB extends Component {
  state = { e: null };
  static getDerivedStateFromError(err) {
    return { e: err };
  }
  render() {
    if (this.state.e)
      return (
        <div>
          <p>{String(this.state.e.message)}</p>
          <button type="button" onClick={() => this.setState({ e: null })}>clear</button>
        </div>
      );
    return this.props.children;
  }
}

function Bad() {
  throw new Error("intentional");
}

export function ThrowButtons() {
  const [on, setOn] = useState(false);
  return (
    <EB>
      <button type="button" onClick={() => setOn(true)}>throw</button>
      {on && <Bad />}
    </EB>
  );
}

export default ThrowButtons;
```

---

101. Wrap a slow child in `React.memo` and verify prop stability with `useCallback`.

```jsx
import React, { memo, useCallback, useState } from "react";

const SlowChild = memo(function SlowChild({ onClick }) {
  return <button onClick={onClick}>child</button>;
});

export function MemoParent101() {
  const [n, setN] = useState(0);
  const [x, setX] = useState(0);
  const cb = useCallback(() => setN((v) => v + 1), []);
  return (
    <div>
      <p>{n} {x}</p>
      <SlowChild onClick={cb} />
      <button type="button" onClick={() => setX((v) => v + 1)}>parent-only</button>
    </div>
  );
}

export default MemoParent101;
```

---

102. `useMemo` for filtering/sorting a large list before render.

```jsx
import React, { useMemo, useState } from "react";

const BIG = Array.from({ length: 5000 }, (_, i) => ({ id: i, v: (i * 7) % 100 }));

export function FilterSortMemo() {
  const [q, setQ] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const rows = useMemo(() => {
    let r = BIG.filter((row) => String(row.v).includes(q));
    r = [...r].sort((a, b) => (sortAsc ? a.v - b.v : b.v - a.v));
    return r;
  }, [q, sortAsc]);
  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} />
      <button type="button" onClick={() => setSortAsc((s) => !s)}>sort</button>
      <p>{rows.length} rows</p>
    </div>
  );
}

export default FilterSortMemo;
```

---

103. `useCallback` for handlers passed to many list items.

```jsx
import React, { useCallback, useState } from "react";

function Row({ id, onSelect }) {
  return (
    <button type="button" onClick={() => onSelect(id)}>
      {id}
    </button>
  );
}

export function ListHandlers() {
  const [sel, setSel] = useState(null);
  const onSelect = useCallback((id) => setSel(id), []);
  return (
    <div>
      <p>selected: {sel}</p>
      {Array.from({ length: 20 }, (_, i) => (
        <Row key={i} id={i} onSelect={onSelect} />
      ))}
    </div>
  );
}

export default ListHandlers;
```

---

104. `React.lazy` import of a heavy `Chart` component; wrap route in `<Suspense fallback=...>`.

```jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const Chart = lazy(
  () =>
    new Promise((resolve) =>
      setTimeout(() => resolve({ default: () => <p>Heavy Chart loaded</p> }), 500),
    ),
);

export function LazyRouteApp() {
  return (
    <BrowserRouter>
      <Suspense fallback={<p>loading chart…</p>}>
        <Routes>
          <Route path="/chart" element={<Chart />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default LazyRouteApp;
```

---

105. Multiple `Suspense` boundaries: shell loads fast, heavy panel suspends separately.

```jsx
import React, { Suspense, lazy } from "react";

const Heavy = lazy(() => Promise.resolve({ default: () => <p>heavy</p> }));

export function MultiSuspense() {
  return (
    <div>
      <p>fast shell</p>
      <Suspense fallback={<p>panel…</p>}>
        <Heavy />
      </Suspense>
    </div>
  );
}

export default MultiSuspense;
```

---

106. Code splitting concept: dynamic `import()` for a modal chunk (show loading state).

```jsx
import React, { startTransition, useState } from "react";

export function DynamicModal() {
  const [Mod, setMod] = useState(null);
  const [loading, setLoading] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setLoading(true);
          startTransition(() => {
            new Promise((resolve) =>
              setTimeout(() => resolve({ default: () => <p>Modal chunk</p> }), 400),
            ).then((m) => {
              setMod(() => m.default);
              setLoading(false);
            });
          });
        }}
      >
        open
      </button>
      {loading && <p>loading chunk…</p>}
      {Mod && <Mod />}
    </div>
  );
}

export default DynamicModal;
```

---

107. Explain windowing/virtualization concept; implement a simple “slice visible rows only” list for 10k ids (no library) with scroll container.

```jsx
import React, { useMemo, useRef, useState } from "react";

const ROW_HEIGHT = 24;
const TOTAL = 10_000;

export function WindowList() {
  const [scrollTop, setScrollTop] = useState(0);
  const ref = useRef(null);
  const ids = useMemo(() => Array.from({ length: TOTAL }, (_, i) => i), []);
  const viewport = 240;
  const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 5);
  const end = Math.min(TOTAL, Math.ceil((scrollTop + viewport) / ROW_HEIGHT) + 5);
  const slice = ids.slice(start, end);
  return (
    <div>
      {/*
        Windowing: only mount rows near the viewport. Full lists would create 10k DOM nodes;
        we render a spacer + slice + spacer to preserve scroll height.
      */}
      <div
        ref={ref}
        style={{ height: viewport, overflow: "auto" }}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <div style={{ height: start * ROW_HEIGHT }} />
        {slice.map((id) => (
          <div key={id} style={{ height: ROW_HEIGHT }}>
            Row {id}
          </div>
        ))}
        <div style={{ height: (TOTAL - end) * ROW_HEIGHT }} />
      </div>
    </div>
  );
}

export default WindowList;
```

---

108. Use React DevTools Profiler (describe steps in comments) and add `useMemo` to fix a deliberate wasted render in a demo component.

```jsx
import React, { useMemo, useState } from "react";

/*
  React DevTools Profiler: open Components tab → Profiler → Record → interact → Stop.
  Inspect "ranked" chart for wasted renders; memoize expensive child inputs.
*/
function Expensive({ items }) {
  const sum = useMemo(() => items.reduce((a, b) => a + b, 0), [items]);
  return <span>{sum}</span>;
}

export function ProfilerFixDemo() {
  const [n, setN] = useState(0);
  const items = useMemo(() => [1, 2, 3, n], [n]);
  return (
    <div>
      <button type="button" onClick={() => setN((x) => x + 1)}>bump</button>
      <Expensive items={items} />
    </div>
  );
}

export default ProfilerFixDemo;
```

---

109. Compound components: `Tabs`, `Tabs.List`, `Tabs.Tab`, `Tabs.Panel` using context for selection state.

```jsx
import React, { createContext, useContext, useMemo, useState } from "react";

const TabsCtx = createContext(null);

function TabsRoot({ children, defaultIndex = 0 }) {
  const [index, setIndex] = useState(defaultIndex);
  const v = useMemo(() => ({ index, setIndex }), [index]);
  return <TabsCtx.Provider value={v}>{children}</TabsCtx.Provider>;
}

function List({ children }) {
  return <div role="tablist">{children}</div>;
}

function Tab({ i, children }) {
  const { index, setIndex } = useContext(TabsCtx);
  return (
    <button type="button" role="tab" aria-selected={index === i} onClick={() => setIndex(i)}>
      {children}
    </button>
  );
}

function Panel({ i, children }) {
  const { index } = useContext(TabsCtx);
  if (index !== i) return null;
  return <div role="tabpanel">{children}</div>;
}

export const Tabs = Object.assign(TabsRoot, { List, Tab, Panel });

export default Tabs;
```

---

110. Render props: `MouseTracker` exposes `{ x, y }` to children function.

```jsx
import React, { useState } from "react";

export function MouseTracker({ children }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <div style={{ height: 120, border: "1px solid #ccc" }} onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}>
      {children(pos)}
    </div>
  );
}

export default function Demo110() {
  return <MouseTracker>{({ x, y }) => <p>{x},{y}</p>}</MouseTracker>;
}
```

---

111. HOC `withLoading(Component)` injecting `isLoading` prop (functional HOC returning function component).

```jsx
import React from "react";

export function withLoading(Component) {
  return function WithLoading(props) {
    return <Component {...props} isLoading={props.isLoading} />;
  };
}

function User({ isLoading, name }) {
  if (isLoading) return <p>…</p>;
  return <p>{name}</p>;
}

export const UserWithLoading = withLoading(User);

export default UserWithLoading;
```

---

112. Custom hook replacing the HOC for the same loading concern (compare in comments).

```jsx
import React, { useEffect, useState } from "react";

/*
  Prefer a data hook over HOC: composable, no wrapper component types, easier tree shaking.
*/
export function useLoadingData() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  useEffect(() => {
    const t = setTimeout(() => {
      setData("loaded");
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, []);
  return { loading, data };
}

export function UserViaHook() {
  const { loading, data } = useLoadingData();
  if (loading) return <p>…</p>;
  return <p>{data}</p>;
}

export default UserViaHook;
```

---

113. Controlled vs uncontrolled input: two versions of the same field demonstrating both.

```jsx
import React, { useRef, useState } from "react";

export function ControlledField() {
  const [v, setV] = useState("");
  return <input value={v} onChange={(e) => setV(e.target.value)} />;
}

export function UncontrolledField() {
  const ref = useRef(null);
  return (
    <div>
      <input ref={ref} defaultValue="hi" />
      <button type="button" onClick={() => alert(ref.current?.value)}>
        read
      </button>
    </div>
  );
}

export default function Both113() {
  return (
    <>
      <ControlledField />
      <UncontrolledField />
    </>
  );
}
```

---

114. `forwardRef` is legacy in React 19; use **`ref` as a prop** on a function component wrapping an `<input>`.

```jsx
import React from "react";

export function TextInput({ ref, ...rest }) {
  return <input ref={ref} {...rest} />;
}

export default function Demo114() {
  const ref = React.useRef(null);
  return (
    <div>
      <TextInput ref={ref} defaultValue="React 19 ref prop" />
      <button type="button" onClick={() => ref.current?.select()}>select</button>
    </div>
  );
}
```

---

115. `useImperativeHandle` exposing `focus()` and `clear()` on that input ref (still valid pattern with `forwardRef` or ref callback — use React 19 ref-as-prop where possible).

```jsx
import React, { useImperativeHandle, useRef } from "react";

export function FancyInput({ ref }) {
  const inner = useRef(null);
  useImperativeHandle(ref, () => ({
    focus: () => inner.current?.focus(),
    clear: () => {
      if (inner.current) inner.current.value = "";
    },
  }));
  return <input ref={inner} defaultValue="text" />;
}

export default function Demo115() {
  const ref = useRef(null);
  return (
    <div>
      <FancyInput ref={ref} />
      <button type="button" onClick={() => ref.current?.focus()}>focus</button>
      <button type="button" onClick={() => ref.current?.clear()}>clear</button>
    </div>
  );
}
```

---

116. `createPortal` to render a modal into `document.body`.

```jsx
import React, { useState } from "react";
import { createPortal } from "react-dom";

export function ModalPortal() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>open</button>
      {open &&
        createPortal(
          <div className="overlay" role="presentation" onClick={() => setOpen(false)}>
            <div className="dialog" onClick={(e) => e.stopPropagation()}>
              modal
              <button type="button" onClick={() => setOpen(false)}>close</button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default ModalPortal;
```

---

117. Compose small presentational components instead of inheritance (demonstrate with `Avatar` + `UserRow`).

```jsx
import React from "react";

function Avatar({ src, alt }) {
  return <img src={src} alt={alt} width={32} height={32} style={{ borderRadius: "50%" }} />;
}

function UserRow({ name, avatarUrl }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Avatar src={avatarUrl} alt="" />
      <span>{name}</span>
    </div>
  );
}

export default function List117() {
  return <UserRow name="Riley" avatarUrl="https://placehold.co/32x32" />;
}
```

---

118. Provider pattern: feature-level provider colocated with hooks (`useFeature`).

```jsx
import React, { createContext, useContext, useMemo, useState } from "react";

const FeatureCtx = createContext(null);

export function FeatureProvider({ children }) {
  const [enabled, setEnabled] = useState(true);
  const v = useMemo(() => ({ enabled, setEnabled }), [enabled]);
  return <FeatureCtx.Provider value={v}>{children}</FeatureCtx.Provider>;
}

export function useFeature() {
  const ctx = useContext(FeatureCtx);
  if (!ctx) throw new Error("useFeature inside provider");
  return ctx;
}

export function Toggle118() {
  const { enabled, setEnabled } = useFeature();
  return <button onClick={() => setEnabled((e) => !e)}>{enabled ? "on" : "off"}</button>;
}

export default FeatureProvider;
```

---

119. Observer pattern: simple event emitter hook `useObservableStore`.

```jsx
import React, { useCallback, useMemo, useRef, useSyncExternalStore } from "react";

export function useObservableStore(initial) {
  const state = useRef(initial);
  const listeners = useRef(new Set());
  const subscribe = useCallback((cb) => {
    listeners.current.add(cb);
    return () => listeners.current.delete(cb);
  }, []);
  const get = useCallback(() => state.current, []);
  const set = useCallback((updater) => {
    state.current = typeof updater === "function" ? updater(state.current) : updater;
    listeners.current.forEach((l) => l());
  }, []);
  return useMemo(() => ({ subscribe, get, set }), [subscribe, get, set]);
}

export function useStoreSnapshot(store) {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

export default useObservableStore;
```

---

120. Mediator pattern: dialog between decoupled components via a central hook/store (e.g., filter + list).

```jsx
import React, { createContext, useContext, useMemo, useState } from "react";

const MediatorCtx = createContext(null);

const ITEMS = ["Apple", "apricot", "Banana", "berry"];

export function MediatorProvider({ children }) {
  const [q, setQ] = useState("");
  const value = useMemo(() => ({ q, setQ, items: ITEMS }), [q]);
  return <MediatorCtx.Provider value={value}>{children}</MediatorCtx.Provider>;
}

export function FilterBar120() {
  const { q, setQ } = useContext(MediatorCtx);
  return <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="filter" />;
}

export function FilteredList120() {
  const { q, items } = useContext(MediatorCtx);
  const filtered = items.filter((x) => x.toLowerCase().includes(q.toLowerCase()));
  return (
    <ul>
      {filtered.map((x) => (
        <li key={x}>{x}</li>
      ))}
    </ul>
  );
}

export default function MediatorApp120() {
  return (
    <MediatorProvider>
      <FilterBar120 />
      <FilteredList120 />
    </MediatorProvider>
  );
}
```

---

121. Fetch with explicit `loading`, `error`, `data` states and retry button.

```jsx
import React, { useCallback, useEffect, useState } from "react";

export function FetchRetry121() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("https://jsonplaceholder.typicode.com/posts/1");
      if (!r.ok) throw new Error(String(r.status));
      setData(await r.json());
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  if (loading) return <p>loading</p>;
  if (error) return (
    <div>
      <p>{String(error.message)}</p>
      <button type="button" onClick={load}>retry</button>
    </div>
  );
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

export default FetchRetry121;
```

---

122. `AbortController` cancel in-flight request when `id` changes or on unmount.

```jsx
import React, { useEffect, useState } from "react";

export function AbortById122({ id }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const ac = new AbortController();
    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, { signal: ac.signal })
      .then((r) => r.json())
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") console.error(e);
      });
    return () => ac.abort();
  }, [id]);
  return <pre>{data ? JSON.stringify(data, null, 2) : "…"}</pre>;
}

export default function Demo122() {
  const [id, setId] = useState(1);
  return (
    <div>
      <button type="button" onClick={() => setId((x) => x + 1)}>next id</button>
      <AbortById122 id={id} />
    </div>
  );
}
```

---

123. Implement a minimal SWR-like stale-while-revalidate: show cached data, refetch in background (in-memory cache).

```jsx
import React, { useEffect, useState } from "react";

const cache = new Map();

export function useSWRLite(url) {
  const [data, setData] = useState(() => cache.get(url) ?? null);
  const [stale, setStale] = useState(false);
  useEffect(() => {
    let alive = true;
    const cached = cache.get(url);
    if (cached) setData(cached);
    setStale(true);
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        cache.set(url, json);
        if (alive) {
          setData(json);
          setStale(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [url]);
  return { data, isRevalidating: stale };
}

export default function SWRDemo() {
  const { data, isRevalidating } = useSWRLite("https://jsonplaceholder.typicode.com/posts/1");
  return (
    <div>
      {isRevalidating && <p>revalidating…</p>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

---

124. Pagination: `page` state, “Next/Prev”, append or replace items.

```jsx
import React, { useEffect, useState } from "react";

export function Pagination124() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=5`)
      .then((r) => r.json())
      .then(setItems);
  }, [page]);
  return (
    <div>
      <ul>
        {items.map((p) => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ul>
      <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
        prev
      </button>
      <button type="button" onClick={() => setPage((p) => p + 1)}>next</button>
    </div>
  );
}

export default Pagination124;
```

---

125. Infinite scroll: load more when sentinel enters view (`IntersectionObserver`).

```jsx
import React, { useEffect, useRef, useState } from "react";

export function Infinite125() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const sentinel = useRef(null);
  useEffect(() => {
    fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=10`)
      .then((r) => r.json())
      .then((chunk) => setItems((prev) => (page === 1 ? chunk : [...prev, ...chunk])));
  }, [page]);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setPage((p) => p + 1);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div style={{ height: 200, overflow: "auto" }}>
      <ul>
        {items.map((p) => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ul>
      <div ref={sentinel}>load more…</div>
    </div>
  );
}

export default Infinite125;
```

---

126. Optimistic UI: immediately update UI on “like” then rollback on failure.

```jsx
import React, { useState } from "react";

async function fakeLikeApi(ok = true) {
  await new Promise((r) => setTimeout(r, 400));
  if (!ok) throw new Error("fail");
}

export function OptimisticLike() {
  const [liked, setLiked] = useState(false);
  const [pending, setPending] = useState(false);
  const toggle = async () => {
    const prev = liked;
    setLiked(!prev);
    setPending(true);
    try {
      await fakeLikeApi(Math.random() > 0.2);
    } catch {
      setLiked(prev);
    } finally {
      setPending(false);
    }
  };
  return (
    <button type="button" disabled={pending} onClick={toggle}>
      {liked ? "♥" : "♡"}
    </button>
  );
}

export default OptimisticLike;
```

---

127. Polling: refetch every N seconds with pause toggle.

```jsx
import React, { useEffect, useRef, useState } from "react";

export function Polling127() {
  const [data, setData] = useState(null);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);
  const intervalRef = useRef(3000);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      fetch("https://jsonplaceholder.typicode.com/posts/1")
        .then((r) => r.json())
        .then((j) => {
          setData(j);
          setTick((t) => t + 1);
        });
    }, intervalRef.current);
    return () => clearInterval(id);
  }, [paused]);
  return (
    <div>
      <p>ticks: {tick}</p>
      <button type="button" onClick={() => setPaused((p) => !p)}>{paused ? "resume" : "pause"}</button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default Polling127;
```

---

128. Simple cache map by key with TTL invalidation.

```jsx
import React, { useEffect, useState } from "react";

const store = new Map();

export function cacheGet(key) {
  const e = store.get(key);
  if (!e) return null;
  if (Date.now() > e.exp) {
    store.delete(key);
    return null;
  }
  return e.val;
}

export function cacheSet(key, val, ttlMs) {
  store.set(key, { val, exp: Date.now() + ttlMs });
}

export function TTLDemo() {
  const [v, setV] = useState(null);
  useEffect(() => {
    const key = "k1";
    const cached = cacheGet(key);
    if (cached) setV(cached);
    else {
      fetch("https://jsonplaceholder.typicode.com/posts/1")
        .then((r) => r.json())
        .then((j) => {
          cacheSet(key, j, 5000);
          setV(j);
        });
    }
  }, []);
  return <pre>{JSON.stringify(v, null, 2)}</pre>;
}

export default TTLDemo;
```

---

129. Retry with exponential backoff for failed fetch (3 attempts).

```jsx
import React, { useCallback, useState } from "react";

async function fetchWithBackoff(url, attempts = 3) {
  let delay = 300;
  for (let i = 0; i < attempts; i++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    } catch (e) {
      if (i === attempts - 1) throw e;
      await new Promise((res) => setTimeout(res, delay));
      delay *= 2;
    }
  }
}

export function Backoff129() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const run = useCallback(() => {
    setErr(null);
    fetchWithBackoff("https://jsonplaceholder.typicode.com/posts/404")
      .then(setData)
      .catch(setErr);
  }, []);
  return (
    <div>
      <button type="button" onClick={run}>fetch (will fail after retries)</button>
      {err && <p>{String(err.message)}</p>}
      <pre>{data ? JSON.stringify(data, null, 2) : ""}</pre>
    </div>
  );
}

export default Backoff129;
```

---

130. `Promise.all` parallel fetch of user + posts; single loading until both settle.

```jsx
import React, { useEffect, useState } from "react";

export function Parallel130() {
  const [loading, setLoading] = useState(true);
  const [bundle, setBundle] = useState(null);
  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch("https://jsonplaceholder.typicode.com/users/1").then((r) => r.json()),
      fetch("https://jsonplaceholder.typicode.com/posts?userId=1").then((r) => r.json()),
    ]).then(([user, posts]) => {
      if (alive) {
        setBundle({ user, posts });
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);
  if (loading) return <p>loading both…</p>;
  return <pre>{JSON.stringify(bundle, null, 2)}</pre>;
}

export default Parallel130;
```

---

131. Multi-step wizard with `step` state and Next/Back; final submit shows summary.

```jsx
import React, { useState } from "react";

export function Wizard131() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", plan: "" });
  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);
  return (
    <div>
      {step === 0 && (
        <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      )}
      {step === 1 && (
        <select value={form.plan} onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}>
          <option value="">pick</option>
          <option value="pro">pro</option>
        </select>
      )}
      {step === 2 && <pre>{JSON.stringify(form, null, 2)}</pre>}
      <div>
        {step > 0 && step < 2 && (
          <button type="button" onClick={back}>
            back
          </button>
        )}
        {step < 2 && (
          <button type="button" onClick={next}>
            next
          </button>
        )}
      </div>
    </div>
  );
}

export default Wizard131;
```

---

132. Dynamic form builder: config array `{ name, type, label }` renders fields.

```jsx
import React, { useState } from "react";

const CONFIG = [
  { name: "title", type: "text", label: "Title" },
  { name: "qty", type: "number", label: "Qty" },
];

export function DynamicForm132() {
  const [values, setValues] = useState(() =>
    Object.fromEntries(CONFIG.map((f) => [f.name, f.type === "number" ? 0 : ""])),
  );
  return (
    <form>
      {CONFIG.map((f) => (
        <label key={f.name}>
          {f.label}
          <input
            type={f.type}
            value={values[f.name]}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                [f.name]: f.type === "number" ? Number(e.target.value) : e.target.value,
              }))
            }
          />
        </label>
      ))}
      <pre>{JSON.stringify(values, null, 2)}</pre>
    </form>
  );
}

export default DynamicForm132;
```

---

133. Integrate validation pattern similar to a library: schema object validating on blur/submit.

```jsx
import React, { useState } from "react";

const schema = {
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "bad email"),
  age: (v) => (Number(v) >= 18 ? null : "18+ only"),
};

export function SchemaForm133() {
  const [fields, setFields] = useState({ email: "", age: "" });
  const [errors, setErrors] = useState({});
  const validate = (which) => {
    const e = schema[which](fields[which]);
    setErrors((er) => ({ ...er, [which]: e || undefined }));
  };
  const onSubmit = (ev) => {
    ev.preventDefault();
    const next = {};
    for (const k of Object.keys(schema)) {
      const msg = schema[k](fields[k]);
      if (msg) next[k] = msg;
    }
    setErrors(next);
  };
  return (
    <form onSubmit={onSubmit}>
      <input
        value={fields.email}
        onChange={(e) => setFields((f) => ({ ...f, email: e.target.value }))}
        onBlur={() => validate("email")}
      />
      {errors.email && <span>{errors.email}</span>}
      <input
        type="number"
        value={fields.age}
        onChange={(e) => setFields((f) => ({ ...f, age: e.target.value }))}
        onBlur={() => validate("age")}
      />
      {errors.age && <span>{errors.age}</span>}
      <button type="submit">go</button>
    </form>
  );
}

export default SchemaForm133;
```

---

134. Auto-save draft to `localStorage` on debounced field changes.

```jsx
import React, { useEffect, useState } from "react";

const KEY = "draft134";

export function Autosave134() {
  const [text, setText] = useState(() => localStorage.getItem(KEY) ?? "");
  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(KEY, text), 400);
    return () => clearTimeout(t);
  }, [text]);
  return <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} />;
}

export default Autosave134;
```

---

135. Rich text: integrate `contentEditable` div with sanitized display (basic, no heavy deps) or comment on using a library.

```jsx
import React, { useState } from "react";

function sanitize(html) {
  const d = document.createElement("div");
  d.textContent = html;
  return d.innerHTML;
}

/*
  Production: use a library (e.g. DOMPurify) for rich HTML. Here we echo plain text only for safety.
*/
export function RichLite135() {
  const [raw, setRaw] = useState("**bold** and *italic* as plain text");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      <textarea value={raw} onChange={(e) => setRaw(e.target.value)} />
      <div dangerouslySetInnerHTML={{ __html: sanitize(raw) }} />
    </div>
  );
}

export default RichLite135;
```

---

136. Drag-and-drop reorder list with native HTML5 DnD API for priorities.

```jsx
import React, { useState } from "react";

export function DnDList136() {
  const [items, setItems] = useState([
    { id: "1", label: "Low" },
    { id: "2", label: "Med" },
    { id: "3", label: "High" },
  ]);
  const onDragStart = (e, id) => e.dataTransfer.setData("text/id", id);
  const onDrop = (e, targetId) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/id");
    if (!id || id === targetId) return;
    setItems((list) => {
      const i = list.findIndex((x) => x.id === id);
      const j = list.findIndex((x) => x.id === targetId);
      const next = [...list];
      const [m] = next.splice(i, 1);
      next.splice(j, 0, m);
      return next;
    });
  };
  return (
    <ul>
      {items.map((it) => (
        <li
          key={it.id}
          draggable
          onDragStart={(e) => onDragStart(e, it.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDrop(e, it.id)}
        >
          {it.label}
        </li>
      ))}
    </ul>
  );
}

export default DnDList136;
```

---

137. Conditional fields: if `country === "US"` show `state` select.

```jsx
import React, { useState } from "react";

export function ConditionalCountry137() {
  const [country, setCountry] = useState("CA");
  const [state, setState] = useState("");
  return (
    <div>
      <select value={country} onChange={(e) => setCountry(e.target.value)}>
        <option value="US">US</option>
        <option value="CA">CA</option>
      </select>
      {country === "US" && (
        <select value={state} onChange={(e) => setState(e.target.value)}>
          <option value="">state</option>
          <option value="CA">California</option>
          <option value="NY">New York</option>
        </select>
      )}
    </div>
  );
}

export default ConditionalCountry137;
```

---

138. Repeatable “work experience” sections: add/remove blocks of fields.

```jsx
import React, { useState } from "react";

export function WorkExperience138() {
  const [blocks, setBlocks] = useState([{ company: "", years: "" }]);
  return (
    <div>
      {blocks.map((b, i) => (
        <fieldset key={i}>
          <input
            placeholder="company"
            value={b.company}
            onChange={(e) =>
              setBlocks((bs) => bs.map((x, j) => (j === i ? { ...x, company: e.target.value } : x)))
            }
          />
          <input
            placeholder="years"
            value={b.years}
            onChange={(e) =>
              setBlocks((bs) => bs.map((x, j) => (j === i ? { ...x, years: e.target.value } : x)))
            }
          />
          <button type="button" onClick={() => setBlocks((bs) => bs.filter((_, j) => j !== i))}>
            remove
          </button>
        </fieldset>
      ))}
      <button type="button" onClick={() => setBlocks((bs) => [...bs, { company: "", years: "" }])}>
        add experience
      </button>
    </div>
  );
}

export default WorkExperience138;
```

---

139. Centralized form state with `useReducer` and dispatched field updates.

```jsx
import React, { useReducer } from "react";

const initial = { name: "", email: "" };

function reducer(state, action) {
  switch (action.type) {
    case "field":
      return { ...state, [action.name]: action.value };
    case "reset":
      return initial;
    default:
      return state;
  }
}

export function ReducerForm139() {
  const [state, dispatch] = useReducer(reducer, initial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <input
        value={state.name}
        onChange={(e) => dispatch({ type: "field", name: "name", value: e.target.value })}
      />
      <input
        value={state.email}
        onChange={(e) => dispatch({ type: "field", name: "email", value: e.target.value })}
      />
      <button type="button" onClick={() => dispatch({ type: "reset" })}>reset</button>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </form>
  );
}

export default ReducerForm139;
```

---

140. Accessible form: associate labels, `aria-invalid`, `aria-describedby` for errors.

```jsx
import React, { useId, useState } from "react";

export function A11yForm140() {
  const id = useId();
  const errId = `${id}-err`;
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(value.length < 3 ? "min 3 chars" : "");
      }}
    >
      <label htmlFor={id}>Name</label>
      <input
        id={id}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errId : undefined}
      />
      {error && (
        <p id={errId} role="alert">
          {error}
        </p>
      )}
      <button type="submit">submit</button>
    </form>
  );
}

export default A11yForm140;
```

---

141. Explain Server Components vs Client Components (short comment block) and when to fetch on server.

```jsx
/*
  Server Components run on the server, can async/await data directly, and ship minimal JS.
  Client Components ("use client") hydrate in the browser for interactivity (state, effects, events).
  Fetch on the server when data is cacheable, avoids client waterfalls, and keeps secrets server-side.
*/
import React from "react";

export function RscNote141() {
  return <p>See comment block — this file would be a Client Component if it used hooks.</p>;
}

export default RscNote141;
```

---

142. Mark a client leaf component with `"use client"` (conceptual file) using interactivity (`onClick`).

```jsx
"use client";

import React, { useState } from "react";

export function ClientLeaf142() {
  const [n, setN] = useState(0);
  return <button type="button" onClick={() => setN((x) => x + 1)}>clicks: {n}</button>;
}

export default ClientLeaf142;
```

---

143. Client component uses `use()` to read a **promise** passed from a parent (or created with `useMemo`) — show Suspense fallback pattern.

```jsx
"use client";

import React, { Suspense, useMemo } from "react";
import { use } from "react";

function PostTitle({ promise }) {
  const data = use(promise);
  return <h1>{data.title}</h1>;
}

export function UsePromiseDemo143() {
  const promise = useMemo(
    () => fetch("https://jsonplaceholder.typicode.com/posts/1").then((r) => r.json()),
    [],
  );
  return (
    <Suspense fallback={<p>loading post…</p>}>
      <PostTitle promise={promise} />
    </Suspense>
  );
}

export default UsePromiseDemo143;
```

---

144. `use()` to read a context value conditionally deeper than hooks normally allow (demonstrate pattern per React 19 rules in comments).

```jsx
"use client";

/*
  Rules: use() for context must be in a child component so hooks order stays valid when conditionally
  rendering that subtree — do not call use(Context) after an early return in the same component.
*/
import React, { Suspense, createContext, use } from "react";

const Ctx = createContext(null);

function Inner({ show }) {
  if (!show) return <p>off</p>;
  return <Reader />;
}

function Reader() {
  const v = use(Ctx);
  return <p>{v}</p>;
}

export function ConditionalUseContext144() {
  return (
    <Ctx.Provider value="hello">
      <Suspense>
        <Inner show />
      </Suspense>
    </Ctx.Provider>
  );
}

export default ConditionalUseContext144;
```

---

145. Form with `<form action={serverAction}>` pattern: document progressive enhancement; client stub with `async function action(formData)`.

```jsx
"use client";

import React from "react";

async function signupAction(formData) {
  const email = formData.get("email");
  await new Promise((r) => setTimeout(r, 200));
  return { ok: true, email };
}

/*
  Progressive enhancement: with server actions + form action, the form POST works before JS loads.
  This stub runs client-side only but mirrors the same FormData contract.
*/
export function ProgressiveForm145() {
  return (
    <form
      action={async (fd) => {
        const r = await signupAction(fd);
        console.log(r);
      }}
    >
      <input name="email" type="email" required />
      <button type="submit">Sign up</button>
    </form>
  );
}

export default ProgressiveForm145;
```

---

146. `useFormStatus` in a nested submit button showing `pending` state during action.

```jsx
"use client";

import React, { useState } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

async function slowAction() {
  await new Promise((r) => setTimeout(r, 800));
}

export function FormStatusDemo146() {
  const [msg, setMsg] = useState("");
  return (
    <form
      action={async () => {
        await slowAction();
        setMsg("done");
      }}
    >
      <SubmitButton />
      <p>{msg}</p>
    </form>
  );
}

export default FormStatusDemo146;
```

---

147. `useActionState` (formerly `useFormState`) to handle form action result and display errors from server action stub.

```jsx
"use client";

import React, { useActionState } from "react";

async function loginAction(prevState, formData) {
  const u = formData.get("user");
  if (!u) return { ok: false, errors: { user: "required" } };
  await new Promise((r) => setTimeout(r, 300));
  return { ok: true, errors: {} };
}

export function ActionStateForm147() {
  const [state, formAction, pending] = useActionState(loginAction, { ok: null, errors: {} });
  return (
    <form action={formAction}>
      <input name="user" />
      {state?.errors?.user && <p>{state.errors.user}</p>}
      <button type="submit" disabled={pending}>
        go
      </button>
      {state?.ok && <p>welcome</p>}
    </form>
  );
}

export default ActionStateForm147;
```

---

148. `useOptimistic` for instant feedback on “add comment” while action resolves.

```jsx
"use client";

import React, { useOptimistic, useState, useTransition } from "react";

async function postComment(text) {
  await new Promise((r) => setTimeout(r, 500));
  return { id: crypto.randomUUID(), text };
}

export function OptimisticComments148() {
  const [items, setItems] = useState([]);
  const [optimistic, addOptimistic] = useOptimistic(items, (state, newItem) => [...state, newItem]);
  const [pending, startTransition] = useTransition();
  return (
    <div>
      <ul>
        {optimistic.map((c) => (
          <li key={c.id}>{c.text}</li>
        ))}
      </ul>
      <form
        action={(fd) => {
          const text = String(fd.get("c") || "");
          if (!text.trim()) return;
          startTransition(async () => {
            const tempId = "tmp-" + Date.now();
            addOptimistic({ id: tempId, text });
            const saved = await postComment(text);
            setItems((prev) => [...prev, saved]);
          });
        }}
      >
        <input name="c" />
        <button type="submit" disabled={pending}>
          add
        </button>
      </form>
    </div>
  );
}

export default OptimisticComments148;
```

---

149. Implement an **Action** that validates data and returns `{ ok, errors }` consumed by `useActionState`.

```jsx
"use client";

import React, { useActionState } from "react";

async function validateAction(prev, formData) {
  const email = String(formData.get("email") || "");
  const errors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "invalid";
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, errors: {} };
}

export function ValidatedAction149() {
  const [state, action, pending] = useActionState(validateAction, { ok: null, errors: {} });
  return (
    <form action={action}>
      <input name="email" type="email" />
      {state.errors?.email && <p>{state.errors.email}</p>}
      <button type="submit" disabled={pending}>submit</button>
      {state.ok && <p>valid</p>}
    </form>
  );
}

export default ValidatedAction149;
```

---

150. Progressive enhancement: form works without JS using native submit (describe + simulate with dual path in comments).

```jsx
"use client";

/*
  Without JS: native <form method="post" action="/api/..."> submits via full page navigation.
  With JS: the same form can call preventDefault and fetch() — dual path keeps resilience.
*/
import React, { useState } from "react";

export function DualPathForm150() {
  const [msg, setMsg] = useState("");
  return (
    <form
      method="post"
      action="/api/contact"
      onSubmit={(e) => {
        if (typeof window !== "undefined" && window.navigator.onLine) {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setMsg(`would POST ${fd.get("q")}`);
        }
      }}
    >
      <input name="q" />
      <button type="submit">send</button>
      <p>{msg}</p>
    </form>
  );
}

export default DualPathForm150;
```

---

151. React Compiler: list what it auto-memoizes (comments); write “compiler-friendly” code without manual `useMemo` where possible.

```jsx
/*
  React Compiler (when enabled) can auto-memoize stable component outputs and skip redundant useMemo/useCallback.
  Write small leaf components and avoid passing fresh inline objects/functions when possible.
*/
import React, { useState } from "react";

function Row({ label, value }) {
  return (
    <div>
      {label}: {value}
    </div>
  );
}

export function CompilerFriendly151() {
  const [n, setN] = useState(0);
  return (
    <div>
      <button type="button" onClick={() => setN((x) => x + 1)}>
        {n}
      </button>
      <Row label="doubled" value={n * 2} />
    </div>
  );
}

export default CompilerFriendly151;
```

---

152. Pass `ref` as a normal prop to a function component (React 19) attaching to DOM element.

```jsx
import React from "react";

export function Focusable152({ ref, children }) {
  return (
    <div ref={ref} tabIndex={-1} className="focus-ring">
      {children}
    </div>
  );
}

export default function Demo152() {
  const ref = React.useRef(null);
  return (
    <div>
      <Focusable152 ref={ref}>section</Focusable152>
      <button type="button" onClick={() => ref.current?.focus()}>
        focus section
      </button>
    </div>
  );
}
```

---

153. Ref **cleanup function** returned from ref callback (React 19) to remove listeners.

```jsx
import React, { useState } from "react";

export function RefCleanup153() {
  const [on, setOn] = useState(true);
  return (
    <div>
      <button type="button" onClick={() => setOn((x) => !x)}>toggle</button>
      {on && (
        <div
          ref={(el) => {
            if (!el) return;
            const log = () => console.log("click");
            el.addEventListener("click", log);
            return () => el.removeEventListener("click", log);
          }}
        >
          click me (React 19 ref cleanup removes listener)
        </div>
      )}
    </div>
  );
}

export default RefCleanup153;
```

---

154. Use `react-dom` `preload` pattern in comments; optional tiny demo preloading a font or module (conceptual).

```jsx
/*
  import { preload } from "react-dom";
  preload("/fonts/Inter.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
*/
import React from "react";

export function PreloadNote154() {
  return <p>See comment: call react-dom preload in route/layout setup for fonts or critical CSS.</p>;
}

export default PreloadNote154;
```

---

155. Metadata: demonstrate `DocumentTitle` effect or framework note — in Vite SPA use `useEffect` on title; comment on RSC metadata APIs in frameworks.

```jsx
import React, { useEffect, useState } from "react";

/*
  Next.js / Remix expose metadata APIs for RSC. In Vite SPA, sync document.title in an effect.
*/
export function DocumentTitle155() {
  const [title, setTitle] = useState("App");
  useEffect(() => {
    document.title = title;
  }, [title]);
  return <input value={title} onChange={(e) => setTitle(e.target.value)} />;
}

export default DocumentTitle155;
```

---

156. UI state machine with `useReducer` and explicit states `idle | loading | success | error`.

```jsx
import React, { useReducer } from "react";

function machine(state, action) {
  switch (state.status) {
    case "idle":
      if (action.type === "load") return { status: "loading" };
      return state;
    case "loading":
      if (action.type === "ok") return { status: "success", data: action.data };
      if (action.type === "err") return { status: "error", message: action.message };
      return state;
    case "success":
    case "error":
      if (action.type === "reset") return { status: "idle" };
      return state;
    default:
      return state;
  }
}

export function AsyncMachine156() {
  const [s, dispatch] = useReducer(machine, { status: "idle" });
  return (
    <div>
      {s.status === "idle" && (
        <button type="button" onClick={() => dispatch({ type: "load" })}>load</button>
      )}
      {s.status === "loading" && <p>loading…</p>}
      {s.status === "success" && <pre>{JSON.stringify(s.data)}</pre>}
      {s.status === "error" && <p>{s.message}</p>}
      {s.status !== "idle" && (
        <button type="button" onClick={() => dispatch({ type: "reset" })}>reset</button>
      )}
    </div>
  );
}

export default AsyncMachine156;
```

---

157. Finite automata for a multi-step checkout with guarded transitions.

```jsx
import React, { useReducer } from "react";

const steps = ["cart", "shipping", "pay", "done"];

function checkoutReducer(state, action) {
  const i = state.stepIndex;
  if (action.type === "next" && i < steps.length - 1) {
    if (steps[i] === "shipping" && !state.address) return state;
    return { ...state, stepIndex: i + 1 };
  }
  if (action.type === "back" && i > 0) return { ...state, stepIndex: i - 1 };
  if (action.type === "addr") return { ...state, address: action.value };
  return state;
}

export function Checkout157() {
  const [s, d] = useReducer(checkoutReducer, { stepIndex: 0, address: "" });
  return (
    <div>
      <p>step: {steps[s.stepIndex]}</p>
      {steps[s.stepIndex] === "shipping" && (
        <input value={s.address} onChange={(e) => d({ type: "addr", value: e.target.value })} />
      )}
      <button type="button" onClick={() => d({ type: "back" })}>back</button>
      <button type="button" onClick={() => d({ type: "next" })}>next</button>
    </div>
  );
}

export default Checkout157;
```

---

158. Type-safe event emitter hook with TypeScript generics (`useEventBus<TMap>()`).

```jsx
import React, { useCallback, useEffect, useRef, useState } from "react";

/** JSDoc for TS users: @template {{ msg: (s: string) => void }} TMap */
export function useEventBus() {
  const map = useRef(new Map());
  const emit = useCallback((key, ...args) => {
    map.current.get(key)?.forEach((fn) => fn(...args));
  }, []);
  const subscribe = useCallback((key, fn) => {
    if (!map.current.has(key)) map.current.set(key, new Set());
    map.current.get(key).add(fn);
    return () => map.current.get(key)?.delete(fn);
  }, []);
  return { emit, subscribe };
}

export function Demo158() {
  const bus = useEventBus();
  const [log, setLog] = useState("");
  useEffect(() => bus.subscribe("msg", (s) => setLog(s)), [bus]);
  return (
    <div>
      <button type="button" onClick={() => bus.emit("msg", "hi")}>emit</button>
      <p>{log}</p>
    </div>
  );
}

export default Demo158;
```

---

159. Compound components with **private context** token for extensibility.

```jsx
import React, { createContext, useContext } from "react";

const TabsPrivate = Symbol("tabs-private");

const Ctx = createContext(null);

export function Tabs159({ children }) {
  return <Ctx.Provider value={{ [TabsPrivate]: true }}>{children}</Ctx.Provider>;
}

Tabs159.Tab = function Tab() {
  const v = useContext(Ctx);
  if (!v?.[TabsPrivate]) throw new Error("Tab must be inside Tabs");
  return <button type="button">tab</button>;
};

export default Tabs159;
```

---

160. Slot pattern: `Card.Header`, `Card.Body` as optional named slots (React children or context).

```jsx
import React from "react";

function Card160({ children }) {
  return <div className="card">{children}</div>;
}

function Header({ children }) {
  return <header>{children}</header>;
}
function Body({ children }) {
  return <main>{children}</main>;
}

Card160.Header = Header;
Card160.Body = Body;

export function SlotDemo160() {
  return (
    <Card160>
      <Card160.Header>Title</Card160.Header>
      <Card160.Body>Content</Card160.Body>
    </Card160>
  );
}

export default SlotDemo160;
```

---

161. Polymorphic `as` prop component rendering as `button` or `a` with proper typings (TSX).

```jsx
import React from "react";

export function Box161({ as: Comp = "div", ...rest }) {
  return <Comp {...rest} />;
}

export default function Demo161() {
  return (
    <div>
      <Box161 as="button" type="button">
        btn
      </Box161>
      <Box161 as="a" href="#x">
        link
      </Box161>
    </div>
  );
}
```

---

162. Generic `List<T>` component rendering items with render prop.

```jsx
import React from "react";

export function List162({ items, renderItem }) {
  return <ul>{items.map((item, i) => <li key={i}>{renderItem(item, i)}</li>)}</ul>;
}

export default function Demo162() {
  return <List162 items={[1, 2, 3]} renderItem={(n) => <strong>{n}</strong>} />;
}
```

---

163. Headless `useDisclosure` hook + unstyled button/panel pair.

```jsx
import React, { useCallback, useState } from "react";

export function useDisclosure(initial = false) {
  const [open, setOpen] = useState(initial);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  return { open, toggle, setOpen };
}

export function DisclosureDemo163() {
  const d = useDisclosure();
  return (
    <div>
      <button type="button" onClick={d.toggle} aria-expanded={d.open}>
        menu
      </button>
      {d.open && <div>panel</div>}
    </div>
  );
}

export default DisclosureDemo163;
```

---

164. Render delegation: parent passes `renderItem` to customize row UI.

```jsx
import React from "react";

export function List164({ items, renderItem }) {
  return <ul>{items.map((item, i) => <li key={i}>{renderItem(item)}</li>)}</ul>;
}

export default function Parent164() {
  return (
    <List164
      items={["a", "b"]}
      renderItem={(x) => <em>{x}</em>}
    />
  );
}
```

---

165. Plugin pattern: registry array of `{ id, Component }` rendered in order.

```jsx
import React from "react";

const registry = [
  { id: "a", Component: () => <p>A</p> },
  { id: "b", Component: () => <p>B</p> },
];

export function PluginHost165() {
  return (
    <div>
      {registry.map(({ id, Component }) => (
        <Component key={id} />
      ))}
    </div>
  );
}

export default PluginHost165;
```

---

166. Micro-frontend communication via `window` custom events or shared context (mock).

```jsx
import React, { useEffect, useState } from "react";

const EVT = "mf:msg";

export function MicroFrontendBridge166() {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    const h = (e) => setMsg(e.detail);
    window.addEventListener(EVT, h);
    return () => window.removeEventListener(EVT, h);
  }, []);
  return (
    <div>
      <button type="button" onClick={() => window.dispatchEvent(new CustomEvent(EVT, { detail: "hi" }))}>
        broadcast
      </button>
      <p>{msg}</p>
    </div>
  );
}

export default MicroFrontendBridge166;
```

---

167. Module Federation concept sketch in comments; dynamic remote component loader stub.

```jsx
/*
  Module Federation: build exposes remote Entry; host uses import("remote/App") at runtime.
  Below: stub dynamic import — replace with your federated module path.
*/
import React, { lazy, Suspense } from "react";

const Remote = lazy(() =>
  Promise.resolve({ default: () => <p>remote stub — use import('remote/App') with Module Federation</p> }),
);

export function FederatedStub167() {
  return (
    <Suspense fallback={<p>loading remote…</p>}>
      <Remote />
    </Suspense>
  );
}

export default FederatedStub167;
```

---

168. Islands architecture note: mostly static HTML with small interactive mounts (describe + tiny multi-root example in comments).

```jsx
/*
  Islands: static HTML shell; hydrate small roots:
  createRoot(document.getElementById("cart-island")).render(<MiniCart />)
*/
import React from "react";

export function IslandNote168() {
  return <p>Multiple createRoot mounts for cart / search / comments widgets.</p>;
}

export default IslandNote168;
```

---

169. RTL: render a component and `expect(screen.getByRole("button"))`.

```jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

function Hi() {
  return <button type="button">go</button>;
}

test("find button", () => {
  render(<Hi />);
  expect(screen.getByRole("button")).toBeInTheDocument();
});

export default Hi;
```

---

170. `userEvent.click` toggles checkbox; assert with `toBeChecked()`.

```jsx
import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";

function Box() {
  const [on, setOn] = useState(false);
  return <input type="checkbox" checked={on} onChange={() => setOn((x) => !x)} />;
}

test("toggle", async () => {
  const user = userEvent.setup();
  render(<Box />);
  await user.click(screen.getByRole("checkbox"));
  expect(screen.getByRole("checkbox")).toBeChecked();
});

export default Box;
```

---

171. Test async: `findByText` after fake timer or mocked fetch resolution.

```jsx
import React, { useEffect, useState } from "react";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

function AsyncHello() {
  const [t, setT] = useState(null);
  useEffect(() => {
    const id = setTimeout(() => setT("ready"), 100);
    return () => clearTimeout(id);
  }, []);
  return <p>{t}</p>;
}

test("findByText", async () => {
  render(<AsyncHello />);
  expect(await screen.findByText("ready")).toBeInTheDocument();
});

export default AsyncHello;
```

---

172. Test custom hook with `@testing-library/react` `renderHook`.

```jsx
import { renderHook, act } from "@testing-library/react";
import { expect, test } from "vitest";
import { useState } from "react";

function useStack() {
  const [s, setS] = useState([]);
  return { push: (x) => setS((p) => [...p, x]), len: s.length };
}

test("hook", () => {
  const { result } = renderHook(() => useStack());
  act(() => result.current.push(1));
  expect(result.current.len).toBe(1);
});

export default useStack;
```

---

173. Test context provider by wrapping `render` with provider utility.

```jsx
import React, { createContext, useContext } from "react";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

const Ctx = createContext(0);

function Child() {
  return <p>{useContext(Ctx)}</p>;
}

function wrap(ui) {
  return <Ctx.Provider value={42}>{ui}</Ctx.Provider>;
}

test("provider util", () => {
  render(wrap(<Child />));
  expect(screen.getByText("42")).toBeInTheDocument();
});

export default wrap;
```

---

174. Mock `fetch` globally and assert call count/args.

```jsx
import { render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi, afterEach } from "vitest";
import React, { useEffect, useState } from "react";

function Data() {
  const [d, setD] = useState(null);
  useEffect(() => {
    fetch("/api/x")
      .then((r) => r.json())
      .then(setD);
  }, []);
  return <p>{d?.v}</p>;
}

afterEach(() => vi.restoreAllMocks());

test("fetch mock", async () => {
  const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
    json: async () => ({ v: "ok" }),
  });
  render(<Data />);
  await waitFor(() => expect(screen.getByText("ok")).toBeInTheDocument());
  expect(spy).toHaveBeenCalledWith("/api/x");
});

export default Data;
```

---

175. Snapshot test a small presentational component (note pros/cons in comment).

```jsx
import React from "react";
import { render } from "@testing-library/react";
import { expect, test } from "vitest";

function Badge({ n }) {
  return <span className="badge">{n}</span>;
}

test("snapshot", () => {
  const { container } = render(<Badge n={3} />);
  /* Snapshots catch unintended UI drift; brittle if styles change often — prefer role queries. */
  expect(container.firstChild).toMatchSnapshot();
});

export default Badge;
```

---

176. `jest-axe` or `@axe-core/react` pattern for a11y smoke test (show setup snippet).

```jsx
/*
  npm i -D jest-axe
  import { axe } from "jest-axe"; expect.extend(toHaveNoViolations);
  const r = render(<App />); await expect(await axe(r.container)).toHaveNoViolations();
*/
import React from "react";

export function AxeNote176() {
  return <main><button type="button">ok</button></main>;
}

export default AxeNote176;
```

---

177. Integration test: form submit updates list within same render tree.

```jsx
import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";

function FormList() {
  const [items, setItems] = useState([]);
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const v = new FormData(e.target).get("t");
          setItems((x) => [...x, String(v)]);
        }}
      >
        <input name="t" />
        <button type="submit">add</button>
      </form>
      <ul>
        {items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

test("integration", async () => {
  const user = userEvent.setup();
  render(<FormList />);
  await user.type(screen.getByRole("textbox"), "one");
  await user.click(screen.getByRole("button", { name: "add" }));
  expect(screen.getByText("one")).toBeInTheDocument();
});

export default FormList;
```

---

178. E2E pattern with Playwright/Cypress steps listed in comments + pseudo-test.

```jsx
/*
  Playwright:
  await page.goto("/");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/dashboard/);

  Cypress:
  cy.visit("/"); cy.contains("Login").click(); cy.url().should("include", "dashboard");
*/
import React from "react";

export function E2ENote178() {
  return <p>E2E steps in comments.</p>;
}

export default E2ENote178;
```

---

179. Trap focus inside a modal (`useRef` + keydown Tab handling basic version).

```jsx
import React, { useEffect, useRef, useState } from "react";

export function FocusTrapModal179({ open, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const root = ref.current;
    if (!root) return;
    const focusables = () =>
      root.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const onKey = (e) => {
      if (e.key !== "Tab") return;
      const nodes = [...focusables()];
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const initial = [...focusables()];
    initial[0]?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  if (!open) return null;
  return (
    <div ref={ref} role="dialog">
      {children}
      <button type="button" onClick={onClose}>
        close
      </button>
    </div>
  );
}

export default FocusTrapModal179;
```

---

180. Keyboard navigable custom `role="menu"` with arrow keys (minimal).

```jsx
import React, { useCallback, useRef, useState } from "react";

const items = ["Copy", "Paste", "Cut"];

export function Menu180() {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const btnRef = useRef(null);
  const onKey = useCallback(
    (e) => {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIdx((i) => (i + 1) % items.length);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setIdx((i) => (i - 1 + items.length) % items.length);
      }
    },
    [open],
  );
  return (
    <div onKeyDown={onKey}>
      <button ref={btnRef} type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Edit
      </button>
      {open && (
        <ul role="menu">
          {items.map((label, i) => (
            <li key={label} role="menuitem" tabIndex={i === idx ? 0 : -1}>
              {label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Menu180;
```

---

181. `aria-live="polite"` region announcing dynamic status messages.

```jsx
import React, { useState } from "react";

export function LiveRegion181() {
  const [status, setStatus] = useState("");
  return (
    <div>
      <button type="button" onClick={() => setStatus("Saved at " + new Date().toLocaleTimeString())}>
        save
      </button>
      <div aria-live="polite" className="sr-only">
        {status}
      </div>
    </div>
  );
}

export default LiveRegion181;
```

---

182. Screen reader testing checklist comment (VoiceOver/NVDA) for your widget.

```jsx
/*
  VoiceOver (mac): VO+Right to read; rotor for landmarks.
  NVDA: Insert+Space browse mode; H for headings.
  Verify name, role, state for custom widgets.
*/
import React from "react";

export function SrChecklist182() {
  return <button type="button">demo</button>;
}

export default SrChecklist182;
```

---

183. Accessible modal: `role="dialog"`, `aria-modal`, labelled by heading id.

```jsx
import React, { useId, useState } from "react";

export function Dialog183({ open, onClose, title, children }) {
  const titleId = useId();
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2>
      {children}
      <button type="button" onClick={onClose}>
        close
      </button>
    </div>
  );
}

export default function Demo183() {
  const [o, setO] = useState(true);
  return <Dialog183 open={o} onClose={() => setO(false)} title="Settings" children={<p>body</p>} />;
}
```

---

184. Accessible tabs: `role="tablist"`, `tab`, `tabpanel`, roving tabindex pattern (basic).

```jsx
import React, { useId, useState } from "react";

const tabs = ["One", "Two"];

export function TabsA11y184() {
  const base = useId();
  const [i, setI] = useState(0);
  return (
    <div>
      <div role="tablist" aria-label="Sample">
        {tabs.map((label, idx) => (
          <button
            key={label}
            id={`${base}-tab-${idx}`}
            role="tab"
            aria-selected={i === idx}
            aria-controls={`${base}-panel-${idx}`}
            tabIndex={i === idx ? 0 : -1}
            type="button"
            onClick={() => setI(idx)}
          >
            {label}
          </button>
        ))}
      </div>
      {tabs.map((label, idx) => (
        <div
          key={label}
          id={`${base}-panel-${idx}`}
          role="tabpanel"
          tabIndex={0}
          hidden={i !== idx}
          aria-labelledby={`${base}-tab-${idx}`}
        >
          Panel {label}
        </div>
      ))}
    </div>
  );
}

export default TabsA11y184;
```

---

185. Accessible dropdown: button + listbox pattern with `aria-expanded`.

```jsx
import React, { useId, useRef, useState } from "react";

const opts = ["Red", "Green", "Blue"];

export function Listbox185() {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState(opts[0]);
  const id = useId();
  const listId = `${id}-list`;
  return (
    <div>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
      >
        {val}
      </button>
      {open && (
        <ul id={listId} role="listbox">
          {opts.map((o) => (
            <li
              key={o}
              role="option"
              aria-selected={o === val}
              onClick={() => {
                setVal(o);
                setOpen(false);
              }}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Listbox185;
```

---

186. Prefer semantic `<main>`, `<nav>`, `<button>` vs clickable divs in a layout component.

```jsx
import React from "react";

export function SemanticLayout186() {
  return (
    <>
      <nav aria-label="Main">
        <a href="#a">Home</a>
      </nav>
      <main>
        <h1>Page</h1>
        <button type="button">Action</button>
      </main>
    </>
  );
}

export default SemanticLayout186;
```

---

187. Todo app with full CRUD + filter + persist to `localStorage`.

```jsx
import React, { useEffect, useMemo, useState } from "react";

const KEY = "todo187";

export function TodoApp187() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [text, setText] = useState("");
  useEffect(() => {
    try {
      setTodos(JSON.parse(localStorage.getItem(KEY) || "[]"));
    } catch {
      setTodos([]);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(todos));
  }, [todos]);
  const visible = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.done);
    if (filter === "done") return todos.filter((t) => t.done);
    return todos;
  }, [todos, filter]);
  return (
    <div>
      <div>
        {["all", "active", "done"].map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          setTodos((t) => [...t, { id: crypto.randomUUID(), text: text.trim(), done: false }]);
          setText("");
        }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit">add</button>
      </form>
      <ul>
        {visible.map((t) => (
          <li key={t.id}>
            <label>
              <input type="checkbox" checked={t.done} onChange={() => setTodos((list) => list.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))} />
              {t.text}
            </label>
            <button type="button" onClick={() => setTodos((list) => list.filter((x) => x.id !== t.id))}>delete</button>
            <button
              type="button"
              onClick={() => {
                const next = prompt("edit", t.text);
                if (next != null) setTodos((list) => list.map((x) => (x.id === t.id ? { ...x, text: next } : x)));
              }}
            >
              edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoApp187;
```

---

188. Weather card UI: search city, show mock forecast data with icons placeholder.

```jsx
import React, { useMemo, useState } from "react";

const MOCK = {
  london: { city: "London", days: [{ d: "Mon", hi: 12, lo: 5, icon: "☁" }] },
  paris: { city: "Paris", days: [{ d: "Mon", hi: 14, lo: 6, icon: "☀" }] },
};

export function Weather188() {
  const [q, setQ] = useState("london");
  const data = useMemo(() => MOCK[q.toLowerCase()] ?? { city: q, days: [] }, [q]);
  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="city" />
      <h2>{data.city}</h2>
      <ul>
        {data.days.map((x) => (
          <li key={x.d}>
            {x.icon} {x.d} {x.hi}/{x.lo}°C
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Weather188;
```

---

189. E-commerce mini cart drawer with line items and quantity steppers.

```jsx
import React, { createContext, useContext, useMemo, useState } from "react";

const CartCtx = createContext(null);

export function MiniCartProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState([{ id: "1", name: "Mug", price: 12, qty: 1 }]);
  const api = useMemo(
    () => ({
      open,
      setOpen,
      lines,
      inc: (id) =>
        setLines((ls) => ls.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l))),
      dec: (id) =>
        setLines((ls) => ls.map((l) => (l.id === id ? { ...l, qty: Math.max(0, l.qty - 1) } : l)).filter((l) => l.qty > 0)),
    }),
    [open, lines],
  );
  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}

export function CartDrawer189() {
  const ctx = useContext(CartCtx);
  return (
    <>
      <button type="button" onClick={() => ctx.setOpen(true)}>cart</button>
      {ctx.open && (
        <aside>
          {ctx.lines.map((l) => (
            <div key={l.id}>
              {l.name} — {l.price}
              <button type="button" onClick={() => ctx.dec(l.id)}>−</button>
              <span>{l.qty}</span>
              <button type="button" onClick={() => ctx.inc(l.id)}>+</button>
            </div>
          ))}
          <button type="button" onClick={() => ctx.setOpen(false)}>close</button>
        </aside>
      )}
    </>
  );
}

export default function App189() {
  return (
    <MiniCartProvider>
      <CartDrawer189 />
    </MiniCartProvider>
  );
}
```

---

190. Blog list with client-side pagination and tag filter.

```jsx
import React, { useMemo, useState } from "react";

const POSTS = [
  { id: 1, title: "A", tags: ["react"] },
  { id: 2, title: "B", tags: ["js"] },
  { id: 3, title: "C", tags: ["react", "js"] },
  { id: 4, title: "D", tags: ["css"] },
];

const PAGE = 2;

export function Blog190() {
  const [tag, setTag] = useState("all");
  const [page, setPage] = useState(1);
  const filtered = useMemo(
    () => (tag === "all" ? POSTS : POSTS.filter((p) => p.tags.includes(tag))),
    [tag],
  );
  const slice = useMemo(() => {
    const start = (page - 1) * PAGE;
    return filtered.slice(start, start + PAGE);
  }, [filtered, page]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  return (
    <div>
      <select value={tag} onChange={(e) => setTag(e.target.value)}>
        <option value="all">all</option>
        <option value="react">react</option>
        <option value="js">js</option>
      </select>
      <ul>
        {slice.map((p) => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ul>
      <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
        prev
      </button>
      <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
        next
      </button>
    </div>
  );
}

export default Blog190;
```

---

191. Chat UI: message list, input, auto-scroll to bottom on new message.

```jsx
import React, { useEffect, useRef, useState } from "react";

export function Chat191() {
  const [msgs, setMsgs] = useState([{ id: 1, text: "hi" }]);
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);
  return (
    <div style={{ height: 200, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflow: "auto" }}>
        {msgs.map((m) => (
          <div key={m.id}>{m.text}</div>
        ))}
        <div ref={endRef} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          setMsgs((m) => [...m, { id: Date.now(), text: draft.trim() }]);
          setDraft("");
        }}
      >
        <input value={draft} onChange={(e) => setDraft(e.target.value)} />
        <button type="submit">send</button>
      </form>
    </div>
  );
}

export default Chat191;
```

---

192. Dashboard cards showing KPI numbers from mocked API JSON.

```jsx
import React, { useEffect, useState } from "react";

export function Dashboard192() {
  const [kpis, setKpis] = useState(null);
  useEffect(() => {
    setKpis([
      { label: "MRR", value: "$12k" },
      { label: "Users", value: "3,421" },
    ]);
  }, []);
  if (!kpis) return <p>loading…</p>;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
      {kpis.map((k) => (
        <article key={k.label} style={{ border: "1px solid #ccc", padding: 12 }}>
          <h3>{k.label}</h3>
          <p style={{ fontSize: 24 }}>{k.value}</p>
        </article>
      ))}
    </div>
  );
}

export default Dashboard192;
```

---

193. Authentication UI: login screen, mock token in context, logout in header.

```jsx
import React, { createContext, useContext, useMemo, useState } from "react";

const AuthCtx = createContext(null);

export function Auth193({ children }) {
  const [token, setToken] = useState(null);
  const v = useMemo(() => ({ token, login: () => setToken("mock-jwt"), logout: () => setToken(null) }), [token]);
  return <AuthCtx.Provider value={v}>{children}</AuthCtx.Provider>;
}

export function Header193() {
  const { token, logout } = useContext(AuthCtx);
  return <header>{token ? <button type="button" onClick={logout}>logout</button> : <span>guest</span>}</header>;
}

export function Login193() {
  const { login } = useContext(AuthCtx);
  return (
    <main>
      <button type="button" onClick={login}>login</button>
    </main>
  );
}

export default function App193() {
  return (
    <Auth193>
      <Header193 />
      <Login193 />
    </Auth193>
  );
}
```

---

194. Social feed: posts with like/comment counts (local state).

```jsx
import React, { useState } from "react";

const initial = [
  { id: 1, body: "Hello world", likes: 2, comments: 1 },
  { id: 2, body: "React 19", likes: 0, comments: 0 },
];

export function Feed194() {
  const [posts, setPosts] = useState(initial);
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>
          <p>{p.body}</p>
          <button type="button" onClick={() => setPosts((ps) => ps.map((x) => (x.id === p.id ? { ...x, likes: x.likes + 1 } : x)))}>
            like {p.likes}
          </button>
          <span> comments {p.comments}</span>
        </li>
      ))}
    </ul>
  );
}

export default Feed194;
```

---

195. Kanban columns: move tasks between columns immutably.

```jsx
import React, { useState } from "react";

const COLS = ["todo", "doing", "done"];

export function Kanban195() {
  const [tasks, setTasks] = useState([
    { id: "1", title: "A", col: "todo" },
    { id: "2", title: "B", col: "doing" },
  ]);
  const move = (id, col) => {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, col } : t)));
  };
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {COLS.map((c) => (
        <div key={c} style={{ flex: 1, border: "1px dashed #999", padding: 8 }}>
          <h3>{c}</h3>
          {tasks
            .filter((t) => t.col === c)
            .map((t) => (
              <div key={t.id} style={{ border: "1px solid #ccc", marginBottom: 4 }}>
                {t.title}
                <div>
                  {COLS.filter((x) => x !== c).map((x) => (
                    <button key={x} type="button" onClick={() => move(t.id, x)}>
                      →{x}
                    </button>
                  ))}
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

export default Kanban195;
```

---

196. Toast notification stack UI driven by context.

```jsx
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const ToastCtx = createContext(null);

export function ToastStack196({ children }) {
  const [items, setItems] = useState([]);
  const id = useRef(0);
  const push = useCallback((msg) => {
    const i = ++id.current;
    setItems((t) => [...t, { id: i, msg }]);
    setTimeout(() => setItems((t) => t.filter((x) => x.id !== i)), 3000);
  }, []);
  const v = useMemo(() => ({ push, items }), [push, items]);
  return (
    <ToastCtx.Provider value={v}>
      {children}
      <ul style={{ position: "fixed", top: 8, right: 8, listStyle: "none" }}>
        {items.map((t) => (
          <li key={t.id} style={{ background: "#222", color: "#fff", padding: 8, marginBottom: 4 }}>
            {t.msg}
          </li>
        ))}
      </ul>
    </ToastCtx.Provider>
  );
}

export function ToastDemo196() {
  const { push } = useContext(ToastCtx);
  return <button type="button" onClick={() => push("saved")}>toast</button>;
}

export default function App196() {
  return (
    <ToastStack196>
      <ToastDemo196 />
    </ToastStack196>
  );
}
```

---

197. File explorer tree: expand/collapse folders (nested object model).

```jsx
import React, { useState } from "react";

const tree = {
  name: "root",
  children: [
    { name: "src", children: [{ name: "App.jsx" }, { name: "main.jsx" }] },
    { name: "package.json" },
  ],
};

function Node197({ node }) {
  const [open, setOpen] = useState(false);
  const hasKids = node.children?.length;
  return (
    <div style={{ marginLeft: 12 }}>
      {hasKids ? (
        <button type="button" onClick={() => setOpen((o) => !o)}>
          {open ? "▼" : "▶"} {node.name}
        </button>
      ) : (
        <span>{node.name}</span>
      )}
      {open && hasKids && node.children.map((ch) => <Node197 key={ch.name} node={ch} />)}
    </div>
  );
}

export function FileExplorer197() {
  return <Node197 node={tree} />;
}

export default FileExplorer197;
```

---

198. Markdown preview split pane: type in textarea, render simple markdown subset (bold/italic) safely.

```jsx
import React, { useMemo, useState } from "react";

function renderMdSubset(s) {
  const escaped = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

export function MarkdownPreview198() {
  const [src, setSrc] = useState("**bold** and *italic*");
  const html = useMemo(() => renderMdSubset(src), [src]);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      <textarea value={src} onChange={(e) => setSrc(e.target.value)} rows={10} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

export default MarkdownPreview198;
```

---

199. Calendar month grid highlighting “today” and selected day.

```jsx
import React, { useMemo, useState } from "react";

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function Calendar199() {
  const now = new Date();
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selected, setSelected] = useState(now.getDate());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const total = daysInMonth(year, month);
  const cells = useMemo(() => {
    const arr = [];
    for (let i = 0; i < firstDow; i++) arr.push(null);
    for (let d = 1; d <= total; d++) arr.push(d);
    return arr;
  }, [firstDow, total]);
  const today = now.getDate();
  const todayMonth = now.getMonth() === month && now.getFullYear() === year;
  return (
    <div>
      <header>
        <button type="button" onClick={() => setCursor(new Date(year, month - 1, 1))}>‹</button>
        <strong>
          {cursor.toLocaleString("default", { month: "long" })} {year}
        </strong>
        <button type="button" onClick={() => setCursor(new Date(year, month + 1, 1))}>›</button>
      </header>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d}>{d}</div>
        ))}
        {cells.map((d, i) =>
          d == null ? (
            <div key={`e-${i}`} />
          ) : (
            <button
              key={d}
              type="button"
              style={{
                border: d === selected ? "2px solid blue" : "1px solid #ccc",
                background: todayMonth && d === today ? "#eef" : "#fff",
              }}
              onClick={() => setSelected(d)}
            >
              {d}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default Calendar199;
```

---

200. Real-time collaboration **UI** mock: show “user is typing…” and presence avatars using local simulated events.

```jsx
import React, { useEffect, useState } from "react";

const TYPING_EVT = "collab:typing";
const PRESENCE_EVT = "collab:presence";

export function CollabMock200() {
  const [typing, setTyping] = useState(false);
  const [users, setUsers] = useState(["you"]);
  useEffect(() => {
    const onT = () => setTyping(true);
    const onP = (e) => setUsers((u) => [...new Set([...u, e.detail])]);
    window.addEventListener(TYPING_EVT, onT);
    window.addEventListener(PRESENCE_EVT, onP);
    window.dispatchEvent(new CustomEvent(PRESENCE_EVT, { detail: "alex" }));
    const id = setTimeout(() => window.dispatchEvent(new Event(TYPING_EVT)), 800);
    const off = setTimeout(() => setTyping(false), 2500);
    return () => {
      window.removeEventListener(TYPING_EVT, onT);
      window.removeEventListener(PRESENCE_EVT, onP);
      clearTimeout(id);
      clearTimeout(off);
    };
  }, []);
  return (
    <div>
      <div style={{ display: "flex", gap: 4 }}>
        {users.map((u) => (
          <span key={u} title={u} style={{ width: 28, height: 28, borderRadius: "50%", background: "#94a3b8", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>
            {u[0]}
          </span>
        ))}
      </div>
      {typing && <p aria-live="polite">Someone is typing…</p>}
    </div>
  );
}

export default CollabMock200;
```

---

*Total: 200 Assignments with Complete Answers — 70 Beginner | 70 Intermediate | 60 Advanced*
