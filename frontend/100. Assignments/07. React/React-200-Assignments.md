# 200 React 19 Real-Time Assignments

Use **React 19** (latest). Prefer functional components, hooks, Server Components where noted, `"use client"` / `"use server"` where relevant, and awareness of the **React Compiler**, **Actions**, **`use()`**, **`useActionState`**, **`useFormStatus`**, **`useOptimistic`**, and **`ref` as a prop**.

---

## BEGINNER (1–70)

### JSX & Components (1–12)

1. Create a functional component named `Welcome` that returns a single `<h1>` with the text `Hello, React 19`.
2. Inside JSX, render a variable `userName` and a mathematical expression `2 + 3` in one `<p>`.
3. Build `Greeting` that accepts a `name` prop and displays `Hello, {name}`.
4. Give `Button` a `label` prop with default value `"Click me"` when the parent omits it.
5. Create `Card` that renders `children` between a header `<div>` and a footer `<div>`.
6. Return multiple sibling elements from `Toolbar` using a fragment (`<>...</>`) without wrapping in an extra DOM node.
7. Render `Status` that shows `Online` if `isOnline` is true, otherwise `Offline`, using a ternary in JSX.
8. Render `Badge` that shows a `<span>` with `New` only when `show` is true, using `&&`.
9. Given `items = [{ id, label }]`, map them to `<li key={id}>{label}</li>` inside a `<ul>`.
10. Explain in your component why `key` must be stable and unique per list item (add a short comment in code).
11. Compose `Page` from `Header`, `Main`, and `Footer` as three separate components.
12. Create `utils.js` exporting `capitalize` and import it into `Title.jsx` to format the title prop.

### State & Events (13–26)

13. Build a counter with `useState`: increment and decrement buttons.
14. Toggle a boolean `isVisible` with one button that switches a paragraph’s visibility.
15. Controlled text input: state holds the value; show the length below the input.
16. On form submit, prevent default and `alert` the current input values from controlled fields.
17. `Button` calls `onClick` with an event; log `event.type` in the handler.
18. `onChange` on a range input updates numeric state and displays the value.
19. Track `firstName`, `lastName`, and `age` with three `useState` hooks in one form preview card.
20. Store `user` as `{ name, email }` in one state object; update `email` immutably on change.
21. Store `tags` as an array of strings; add a tag from an input without mutating the prior array.
22. Lift `count` to parent `App`; pass `count` and `setCount` to two child buttons that share the same count.
23. Remove an item from an array in state by index using immutable update (no `.splice` on the same reference).
24. Toggle membership of an id in a `selectedIds` array immutably (add/remove like a set).
25. Implement a simple `login` form: controlled fields, `onSubmit` sets a `submitted` flag in state.
26. Reset all fields to initial values with a `Reset` button without mutating state in place incorrectly.

### Effects & Refs (27–36)

27. `useEffect` with `[]` runs once on mount; log `"mounted"` and return a cleanup that logs `"unmounted"`.
28. Fetch JSON from `https://jsonplaceholder.typicode.com/posts/1` on mount; store `title` in state; show loading text.
29. Sync `document.title` to a `pageTitle` state value whenever it changes.
30. Start an interval on mount that increments a counter every second; clear it on unmount.
31. `useRef` holding a DOM reference; button scrolls the page to that element (`scrollIntoView`).
32. Store the previous render’s value of `count` using `useRef` (not for DOM).
33. On mount, focus a text input using `ref` and `useEffect`.
34. Listen to `window` `resize` and store `innerWidth` in state; remove listener on cleanup.
35. Debounced search: typing updates `query` immediately but `debouncedQuery` only after 300ms idle (`useEffect` + timeout).
36. Abort a fetch on unmount or when the URL dependency changes using `AbortController`.

### Styling (37–44)

37. Apply inline `style` object for color and fontSize on a heading.
38. Use `className` with static string classes on a card layout.
39. Import a CSS Module `Button.module.css` and apply `styles.primary` to a button.
40. Build `Pill` with conditional classes: active vs inactive (template string or `clsx`-style helper without library if you prefer).
41. Dynamic width style on a progress bar from numeric `percent` prop (0–100).
42. Describe (in comments) how “styled components” work; render one plain component styled via CSS module as the practical part.
43. Use Tailwind utility classes (`className="flex gap-2 rounded-md p-4"`) on a toolbar component.
44. Theme toggle that switches `data-theme` on `<html>` or a wrapper and uses CSS variables for colors.

### Lists & Forms (45–56)

45. Todo list: add todo with unique id, toggle `done`, remove todo.
46. Search filter: list of names filters as user types in a search box (case-insensitive).
47. Sortable list: buttons sort an array of products by price ascending/descending (pure client state).
48. Fully controlled registration form: name, email, password fields bound to state.
49. Multi-field address form: street, city, zip; show a live JSON preview of the object.
50. Validate email format on submit; show error message state without blocking typing.
51. Checkbox group for `interests[]`; toggling updates an array in state immutably.
52. `<select>` for country; changing option updates state and shows selected label.
53. Radio group for `plan`: `free` / `pro`; only one selected at a time.
54. File input: preview selected image with `URL.createObjectURL` and revoke on change/cleanup.
55. Dynamic fields: “Add another phone” pushes a new empty string into `phones` array with inputs bound per index.
56. Form reset sets all controlled fields back to defaults including checkboxes and select.

### Basic Routing (57–64)

57. Set up `react-router-dom` `BrowserRouter`, `Routes`, `Route` for `/`, `/about`.
58. Use `Link` for navigation and `Outlet` in a layout route wrapping children.
59. Nested routes: `/dashboard` and `/dashboard/settings` sharing a dashboard layout.
60. Dynamic route `/users/:userId` reading `userId` via `useParams`.
61. Programmatic navigation: after “fake login”, `useNavigate` to `/home`.
62. `NavLink` with `className` or `style` callback to highlight the active route.
63. Catch-all route `path="*"` rendering a simple `NotFound` page.
64. Redirect from `/old` to `/new` using `Navigate` component.

### Basic Context (65–70)

65. `createContext` + `Provider` for a string `theme` (`light` | `dark`).
66. Consume theme in a deep child with `useContext` and style a box accordingly.
67. Theme context: toggle function in context value updates theme state in provider.
68. Auth context: `{ user, login, logout }` with simple username string or `null`.
69. Language context: `locale` and `setLocale`; child displays a dictionary entry for `en` vs `es`.
70. Split fast-changing and slow-changing values into two contexts to avoid unnecessary re-renders (demonstrate pattern in comments + minimal code).

---

## INTERMEDIATE (71–140)

### Advanced Hooks (71–84)

71. Counter with `useReducer` (`increment`, `decrement`, `reset`).
72. `useReducer` managing `{ items, filter }` for a filterable todo list.
73. `useMemo` to compute an expensive sum of a large array derived from props (simulate with `Array.from`).
74. `useCallback` stabilizes a child’s callback; pair with `React.memo` on the child to avoid extra renders.
75. Extract `useLocalStorage(key, initial)` that syncs state with `localStorage`.
76. `useDebounce(value, delay)` returning debounced value.
77. `useFetch(url)` returning `{ data, loading, error, refetch }`.
78. `useToggle(initial)` returns `[value, toggle, setValue]`.
79. `useMediaQuery("(max-width: 600px)")` updates on resize.
80. `useOnClickOutside(ref, handler)` closes a dropdown when clicking outside.
81. `usePrevious(value)` returns previous render’s value (generic hook).
82. `useCounter(step)` with increment/decrement using functional updates.
83. Combine `useReducer` + `useContext` for a mini global store (no Redux).
84. Custom hook `useEventListener(event, handler, element)` with proper cleanup.

### Context & State Management (85–94)

85. Context provider wraps `useReducer` dispatch for a global todo app.
86. Multiple providers nested: `ThemeProvider` inside `AuthProvider`; consume both in one component.
87. Split “dispatch” and “state” contexts to reduce re-renders (pattern demonstration).
88. Shopping cart context: add/remove/update quantity, derived total price with `useMemo`.
89. Auth flow: mock `login` sets user; protected route wrapper redirects if logged out.
90. Notification context: push toast messages with auto-dismiss timer.
91. Global modal context: `openModal(content)`, `closeModal()`, portal render target.
92. Persist cart to `localStorage` on change, hydrate on load (inside provider).
93. Selector pattern: `useSelector` hook that subscribes to a slice of context state (simple implementation).
94. Middleware-style logging: wrap `dispatch` to log actions (lightweight pattern).

### Error Handling & Boundaries (95–100)

95. Class-free error boundary using `react-error-boundary` library **or** document that native error boundaries are class-based and implement a minimal class `ErrorBoundary` as the standard approach — assignment: implement **recovery UI** with a reset key pattern from a parent functional component.
96. Fallback UI showing error message and a “Try again” button that resets boundary state.
97. Nested boundaries: inner boundary catches component errors; outer catches layout errors.
98. Async error in child: demonstrate throwing in render after failed fetch state (or using an error boundary compatible pattern).
99. Log errors to `console.error` with component stack info in `componentDidCatch` equivalent / library callback.
100. Button that intentionally throws caught by boundary; second button clears error via reset.

### Performance (101–108)

101. Wrap a slow child in `React.memo` and verify prop stability with `useCallback`.
102. `useMemo` for filtering/sorting a large list before render.
103. `useCallback` for handlers passed to many list items.
104. `React.lazy` import of a heavy `Chart` component; wrap route in `<Suspense fallback=...>`.
105. Multiple `Suspense` boundaries: shell loads fast, heavy panel suspends separately.
106. Code splitting concept: dynamic `import()` for a modal chunk (show loading state).
107. Explain windowing/virtualization concept; implement a simple “slice visible rows only” list for 10k ids (no library) with scroll container.
108. Use React DevTools Profiler (describe steps in comments) and add `useMemo` to fix a deliberate wasted render in a demo component.

### Patterns (109–120)

109. Compound components: `Tabs`, `Tabs.List`, `Tabs.Tab`, `Tabs.Panel` using context for selection state.
110. Render props: `MouseTracker` exposes `{ x, y }` to children function.
111. HOC `withLoading(Component)` injecting `isLoading` prop (functional HOC returning function component).
112. Custom hook replacing the HOC for the same loading concern (compare in comments).
113. Controlled vs uncontrolled input: two versions of the same field demonstrating both.
114. `forwardRef` is legacy in React 19; use **`ref` as a prop** on a function component wrapping an `<input>`.
115. `useImperativeHandle` exposing `focus()` and `clear()` on that input ref (still valid pattern with `forwardRef` or ref callback — use React 19 ref-as-prop where possible).
116. `createPortal` to render a modal into `document.body`.
117. Compose small presentational components instead of inheritance (demonstrate with `Avatar` + `UserRow`).
118. Provider pattern: feature-level provider colocated with hooks (`useFeature`).
119. Observer pattern: simple event emitter hook `useObservableStore`.
120. Mediator pattern: dialog between decoupled components via a central hook/store (e.g., filter + list).

### Data Fetching (121–130)

121. Fetch with explicit `loading`, `error`, `data` states and retry button.
122. `AbortController` cancel in-flight request when `id` changes or on unmount.
123. Implement a minimal SWR-like stale-while-revalidate: show cached data, refetch in background (in-memory cache).
124. Pagination: `page` state, “Next/Prev”, append or replace items.
125. Infinite scroll: load more when sentinel enters view (`IntersectionObserver`).
126. Optimistic UI: immediately update UI on “like” then rollback on failure.
127. Polling: refetch every N seconds with pause toggle.
128. Simple cache map by key with TTL invalidation.
129. Retry with exponential backoff for failed fetch (3 attempts).
130. `Promise.all` parallel fetch of user + posts; single loading until both settle.

### Forms Advanced (131–140)

131. Multi-step wizard with `step` state and Next/Back; final submit shows summary.
132. Dynamic form builder: config array `{ name, type, label }` renders fields.
133. Integrate validation pattern similar to a library: schema object validating on blur/submit.
134. Auto-save draft to `localStorage` on debounced field changes.
135. Rich text: integrate `contentEditable` div with sanitized display (basic, no heavy deps) or comment on using a library.
136. Drag-and-drop reorder list with native HTML5 DnD API for priorities.
137. Conditional fields: if `country === "US"` show `state` select.
138. Repeatable “work experience” sections: add/remove blocks of fields.
139. Centralized form state with `useReducer` and dispatched field updates.
140. Accessible form: associate labels, `aria-invalid`, `aria-describedby` for errors.

---

## ADVANCED (141–200)

### React 19 Features (141–155)

141. Explain Server Components vs Client Components (short comment block) and when to fetch on server.
142. Mark a client leaf component with `"use client"` (conceptual file) using interactivity (`onClick`).
143. Client component uses `use()` to read a **promise** passed from a parent (or created with `useMemo`) — show Suspense fallback pattern.
144. `use()` to read a context value conditionally deeper than hooks normally allow (demonstrate pattern per React 19 rules in comments).
145. Form with `<form action={serverAction}>` pattern: document progressive enhancement; client stub with `async function action(formData)`.
146. `useFormStatus` in a nested submit button showing `pending` state during action.
147. `useActionState` (formerly `useFormState`) to handle form action result and display errors from server action stub.
148. `useOptimistic` for instant feedback on “add comment” while action resolves.
149. Implement an **Action** that validates data and returns `{ ok, errors }` consumed by `useActionState`.
150. Progressive enhancement: form works without JS using native submit (describe + simulate with dual path in comments).
151. React Compiler: list what it auto-memoizes (comments); write “compiler-friendly” code without manual `useMemo` where possible.
152. Pass `ref` as a normal prop to a function component (React 19) attaching to DOM element.
153. Ref **cleanup function** returned from ref callback (React 19) to remove listeners.
154. Use `react-dom` `preload` pattern in comments; optional tiny demo preloading a font or module (conceptual).
155. Metadata: demonstrate `DocumentTitle` effect or framework note — in Vite SPA use `useEffect` on title; comment on RSC metadata APIs in frameworks.

### Advanced Patterns (156–168)

156. UI state machine with `useReducer` and explicit states `idle | loading | success | error`.
157. Finite automata for a multi-step checkout with guarded transitions.
158. Type-safe event emitter hook with TypeScript generics (`useEventBus<TMap>()`).
159. Compound components with **private context** token for extensibility.
160. Slot pattern: `Card.Header`, `Card.Body` as optional named slots (React children or context).
161. Polymorphic `as` prop component rendering as `button` or `a` with proper typings (TSX).
162. Generic `List<T>` component rendering items with render prop.
163. Headless `useDisclosure` hook + unstyled button/panel pair.
164. Render delegation: parent passes `renderItem` to customize row UI.
165. Plugin pattern: registry array of `{ id, Component }` rendered in order.
166. Micro-frontend communication via `window` custom events or shared context (mock).
167. Module Federation concept sketch in comments; dynamic remote component loader stub.
168. Islands architecture note: mostly static HTML with small interactive mounts (describe + tiny multi-root example in comments).

### Testing (169–178)

169. RTL: render a component and `expect(screen.getByRole("button"))`.
170. `userEvent.click` toggles checkbox; assert with `toBeChecked()`.
171. Test async: `findByText` after fake timer or mocked fetch resolution.
172. Test custom hook with `@testing-library/react` `renderHook`.
173. Test context provider by wrapping `render` with provider utility.
174. Mock `fetch` globally and assert call count/args.
175. Snapshot test a small presentational component (note pros/cons in comment).
176. `jest-axe` or `@axe-core/react` pattern for a11y smoke test (show setup snippet).
177. Integration test: form submit updates list within same render tree.
178. E2E pattern with Playwright/Cypress steps listed in comments + pseudo-test.

### Accessibility (179–186)

179. Trap focus inside a modal (`useRef` + keydown Tab handling basic version).
180. Keyboard navigable custom `role="menu"` with arrow keys (minimal).
181. `aria-live="polite"` region announcing dynamic status messages.
182. Screen reader testing checklist comment (VoiceOver/NVDA) for your widget.
183. Accessible modal: `role="dialog"`, `aria-modal`, labelled by heading id.
184. Accessible tabs: `role="tablist"`, `tab`, `tabpanel`, roving tabindex pattern (basic).
185. Accessible dropdown: button + listbox pattern with `aria-expanded`.
186. Prefer semantic `<main>`, `<nav>`, `<button>` vs clickable divs in a layout component.

### Real-World Projects (187–200)

187. Todo app with full CRUD + filter + persist to `localStorage`.
188. Weather card UI: search city, show mock forecast data with icons placeholder.
189. E-commerce mini cart drawer with line items and quantity steppers.
190. Blog list with client-side pagination and tag filter.
191. Chat UI: message list, input, auto-scroll to bottom on new message.
192. Dashboard cards showing KPI numbers from mocked API JSON.
193. Authentication UI: login screen, mock token in context, logout in header.
194. Social feed: posts with like/comment counts (local state).
195. Kanban columns: move tasks between columns immutably.
196. Toast notification stack UI driven by context.
197. File explorer tree: expand/collapse folders (nested object model).
198. Markdown preview split pane: type in textarea, render simple markdown subset (bold/italic) safely.
199. Calendar month grid highlighting “today” and selected day.
200. Real-time collaboration **UI** mock: show “user is typing…” and presence avatars using local simulated events.

---

**End of assignments (200).**
