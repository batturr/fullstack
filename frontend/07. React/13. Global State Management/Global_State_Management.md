# Global State Management (React + TypeScript)

**Global** **state** **lifts** **data** **above** **individual** **components** **so** **many** **screens** **(e-commerce** **cart,** **social** **feed** **preferences,** **dashboard** **filters,** **chat** **presence,** **weather** **favorites)** **stay** **consistent.** **TypeScript** **types** **for** **actions,** **selectors,** **and** **stores** **make** **refactors** **safer** **when** **teams** **grow** **and** **features** **multiply.**

---

## 📑 Table of Contents

- [Global State Management (React + TypeScript)](#global-state-management-react--typescript)
  - [📑 Table of Contents](#-table-of-contents)
  - [13.1 State Management Overview](#131-state-management-overview)
  - [13.2 Redux](#132-redux)
  - [13.3 Redux Toolkit (RTK)](#133-redux-toolkit-rtk)
  - [13.4 Zustand](#134-zustand)
  - [13.5 Jotai](#135-jotai)
  - [13.6 Recoil](#136-recoil)
  - [13.7 MobX](#137-mobx)
  - [13.8 Valtio](#138-valtio)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices (Global)](#best-practices-global)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 13.1 State Management Overview

### Local vs Global State

**Beginner Level**

**Local** **state** **lives** **inside** **one** **component** **(or** **a** **small** **subtree)** **via** **`useState`**, **`useReducer`**, **or** **component** **fields.** **Global** **state** **is** **shared** **across** **routes** **and** **trees** **without** **passing** **props** **through** **every** **layer.**

**Real-time example**: **Todo** **app** **—** **each** **task** **row’s** **“editing”** **flag** **is** **local;** **the** **list** **of** **tasks** **synced** **with** **the** **server** **might** **be** **global** **if** **multiple** **panels** **read** **it.**

**Intermediate Level**

**Colocate** **state** **by** **default.** **Promote** **to** **global** **only** **when** **multiple** **unrelated** **subtrees** **need** **the** **same** **writable** **source** **of** **truth** **or** **when** **debuggability** **/** **time-travel** **matters** **(Redux).** **Derived** **values** **should** **often** **be** **computed** **with** **selectors** **or** **`useMemo`**, **not** **stored** **twice.**

**Expert Level**

**Split** **“server** **state”** **(TanStack** **Query)** **from** **“client** **UI** **state”** **(Zustand/Redux/Context).** **Global** **stores** **should** **hold** **client-owned** **facts** **(cart** **session,** **theme,** **feature** **flags)** **and** **avoid** **mirroring** **network** **responses** **without** **a** **cache** **policy.**

```typescript
// Local-only: fine for ephemeral UI
type RowEditState = { editingId: string | null };

// Global candidate: shared cart across header + checkout + recommendations
export type CartLine = { sku: string; qty: number; title: string; unitPrice: number };
export type CartState = { lines: CartLine[]; currency: "USD" | "EUR" };
```

#### Key Points — Local vs Global

- **Prefer** **local** **state** **until** **a** **real** **consumer** **outside** **the** **subtree** **appears.**
- **Global** **state** **increases** **coupling** **—** **justify** **it** **with** **clear** **ownership.**
- **Separate** **remote** **data** **from** **UI** **state** **to** **avoid** **double** **sources** **of** **truth.**

---

### When to Use Global State

**Beginner Level**

**Use** **global** **state** **when** **many** **components** **need** **to** **read** **or** **write** **the** **same** **thing** **and** **prop** **drilling** **becomes** **painful** **or** **error-prone.**

**Real-time example**: **E-commerce** **—** **cart** **count** **in** **the** **header,** **mini-cart** **drawer,** **and** **checkout** **page** **should** **share** **one** **store.**

**Intermediate Level**

**Also** **consider** **global** **when** **you** **need** **middleware** **(logging,** **analytics,** **persistence),** **devtools,** **or** **predictable** **update** **ordering.** **If** **only** **reads** **fan** **out,** **Context** **plus** **a** **memoized** **provider** **may** **suffice** **before** **adopting** **Redux.**

**Expert Level**

**Measure** **re-render** **costs.** **Global** **Context** **without** **splitting** **can** **re-render** **too** **broadly;** **selector-based** **libraries** **(Redux,** **Zustand** **with** **shallow** **compare)** **or** **atom** **graphs** **(Jotai/Recoil)** **reduce** **blast** **radius.**

```tsx
// Signal: you need global client state (sketch)
export function useNeedsGlobalCart(): boolean {
  // If 3+ unrelated areas mutate/read the same cart: yes.
  return true;
}
```

#### Key Points — When Global

- **Prop** **drilling** **3+** **levels** **for** **the** **same** **business** **value** **is** **a** **smell.**
- **Cross-route** **persistence** **(e.g.,** **wizard** **steps)** **often** **warrants** **a** **store** **or** **URL** **state.**
- **Combine** **with** **URL** **params** **for** **shareable** **dashboard** **filters** **when** **possible.**

---

### Solutions Comparison

**Beginner Level**

**Redux** **is** **predictable** **and** **tooling-rich;** **Zustand** **is** **minimal** **and** **ergonomic;** **Jotai/Recoil** **use** **atoms** **and** **graphs;** **MobX** **is** **reactive/OOP;** **Valtio** **uses** **proxy** **snapshots.**

**Real-time example**: **Social** **app** **—** **Redux** **for** **large** **teams** **with** **strict** **patterns;** **Zustand** **for** **fast** **features** **with** **small** **footprint.**

**Intermediate Level**

**Pick** **by** **team** **skill,** **debug** **needs,** **and** **async** **complexity.** **RTK** **Query** **covers** **server** **cache** **inside** **Redux;** **TanStack** **Query** **pairs** **well** **with** **Zustand** **atoms** **for** **UI-only** **state.**

**Expert Level**

**Normalize** **relational** **entities** **(RTK** **`createEntityAdapter`,** **manual** **maps)** **for** **dashboards** **with** **thousands** **of** **rows;** **use** **atom** **families** **for** **dynamic** **lists** **(chat** **threads)** **where** **fine-grained** **subscriptions** **win.**

```typescript
export type GlobalStateSolution =
  | { name: "redux+rtk"; bestFor: "Strict workflows, DevTools, RTK Query" }
  | { name: "zustand"; bestFor: "Small bundles, pragmatic stores" }
  | { name: "jotai/recoil"; bestFor: "Fine-grained reactive graphs" }
  | { name: "mobx"; bestFor: "OOP/reactive models" }
  | { name: "valtio"; bestFor: "Mutable ergonomic proxies with snapshots" };
```

#### Key Points — Comparison

- **No** **single** **winner** **—** **match** **solution** **to** **constraints.**
- **Combine** **server** **cache** **libraries** **with** **light** **client** **stores.**
- **Invest** **in** **tests** **and** **lint** **rules** **regardless** **of** **library.**

---

## 13.2 Redux

### Core Concepts

**Beginner Level**

**Redux** **stores** **plain** **state** **in** **a** **single** **tree.** **You** **never** **mutate** **state** **directly;** **you** **dispatch** **actions** **that** **reducers** **use** **to** **compute** **the** **next** **tree.**

**Real-time example**: **Dashboard** **—** **`SET_DATE_RANGE`** **action** **updates** **filters** **used** **by** **charts** **and** **tables.**

**Intermediate Level**

**Reducers** **must** **be** **pure** **functions:** **same** **inputs** **⇒** **same** **outputs,** **no** **side** **effects** **inside.** **Side** **effects** **belong** **in** **middleware** **(e.g.,** **RTK** **`createListenerMiddleware`,** **redux-saga,** **thunks).**

**Expert Level**

**Normalize** **entities** **to** **O(1)** **updates** **by** **id;** **compose** **reducers** **with** **`combineReducers`.** **Use** **memoized** **selectors** **(reselect)** **to** **derive** **heavy** **views** **of** **dashboard** **KPIs.**

```typescript
import { combineReducers, createStore, type Reducer } from "redux";

export type VisibilityFilter = "SHOW_ALL" | "SHOW_ACTIVE" | "SHOW_COMPLETED";

export type Todo = { id: string; text: string; completed: boolean };

export type TodoAppState = {
  todos: Todo[];
  visibilityFilter: VisibilityFilter;
};

export const initialState: TodoAppState = {
  todos: [],
  visibilityFilter: "SHOW_ALL",
};

type Action =
  | { type: "ADD_TODO"; id: string; text: string }
  | { type: "TOGGLE_TODO"; id: string }
  | { type: "SET_VISIBILITY_FILTER"; filter: VisibilityFilter };

const todosReducer: Reducer<Todo[], Action> = (state = initialState.todos, action) => {
  switch (action.type) {
    case "ADD_TODO":
      return [...state, { id: action.id, text: action.text, completed: false }];
    case "TOGGLE_TODO":
      return state.map((t) => (t.id === action.id ? { ...t, completed: !t.completed } : t));
    default:
      return state;
  }
};

const visibilityReducer: Reducer<VisibilityFilter, Action> = (
  state = initialState.visibilityFilter,
  action
) => {
  if (action.type === "SET_VISIBILITY_FILTER") return action.filter;
  return state;
};

export const rootReducer = combineReducers({
  todos: todosReducer,
  visibilityFilter: visibilityReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
```

#### Key Points — Core Concepts

- **Single** **immutable** **state** **tree** **simplifies** **reasoning.**
- **Reducers** **stay** **pure;** **middleware** **handles** **I/O.**
- **Strongly** **type** **`Action`** **unions** **in** **TypeScript.**

---

### Actions

**Beginner Level**

**An** **action** **is** **a** **plain** **object** **with** **`type`** **and** **optional** **payload.** **They** **describe** **what** **happened,** **not** **how** **side** **effects** **run.**

**Real-time example**: **Chat** **app** **`{ type: "messages/received", payload: { threadId, items } }`.**

**Intermediate Level**

**Use** **action** **creators** **(functions)** **to** **avoid** **string** **typos** **and** **centralize** **payload** **shapes.** **With** **RTK,** **`createSlice`** **generates** **typed** **action** **creators** **automatically.**

**Expert Level**

**For** **large** **apps,** **namespace** **`type`** **strings** **`"domain/event"`** **and** **document** **versioning** **when** **persisting** **or** **replaying** **analytics** **events.**

```typescript
export const addTodo = (id: string, text: string) =>
  ({ type: "ADD_TODO", id, text }) as const;

export type AddTodoAction = ReturnType<typeof addTodo>;
```

#### Key Points — Actions

- **Prefer** **`as const`** **+** **union** **types** **for** **discriminated** **unions.**
- **Keep** **payloads** **serializable** **for** **DevTools** **and** **persistence.**
- **Name** **types** **for** **events,** **not** **setter** **imperatives,** **when** **possible.**

---

### Reducers

**Beginner Level**

**Reducers** **take** **`(state, action)`** **and** **return** **new** **state** **or** **the** **previous** **reference** **if** **nothing** **changed.**

**Real-time example**: **Weather** **favorites** **reducer** **adds/removes** **city** **ids.**

**Intermediate Level**

**Use** **immutable** **updates** **(spread,** **`immer`** **via** **RTK).** **Avoid** **deep** **clones** **everywhere** **—** **target** **only** **changed** **branches.**

**Expert Level**

**Split** **reducers** **by** **domain;** **use** **`combineReducers`** **and** **cross-slice** **logic** **in** **middleware** **or** **selectors,** **not** **by** **tightly** **coupling** **reducers** **to** **each** **other.**

```typescript
import { produce } from "immer";

type FavoritesState = { cityIds: string[] };

export function favoritesReducer(state: FavoritesState, action: { type: "toggle"; cityId: string }): FavoritesState {
  return produce(state, (draft) => {
    const idx = draft.cityIds.indexOf(action.cityId);
    if (idx === -1) draft.cityIds.push(action.cityId);
    else draft.cityIds.splice(idx, 1);
  });
}
```

#### Key Points — Reducers

- **Return** **the** **same** **reference** **if** **no** **change** **(helps** **`React-Redux`** **bailouts).**
- **`immer`** **reduces** **boilerplate** **for** **nested** **updates.**
- **Unit-test** **reducers** **as** **pure** **functions.**

---

### Store

**Beginner Level**

**The** **store** **holds** **current** **state** **and** **exposes** **`getState`,** **`dispatch`,** **`subscribe`.**

**Real-time example**: **E-commerce** **—** **one** **store** **instance** **per** **app** **(or** **per** **request** **on** **the** **server** **for** **SSR** **scenarios).**

**Intermediate Level**

**Avoid** **multiple** **stores** **unless** **you** **have** **isolation** **boundaries** **(micro-frontends).** **Use** **`replaceReducer`** **only** **for** **hot** **reload** **or** **advanced** **cases.**

**Expert Level**

**For** **SSR,** **create** **a** **fresh** **store** **per** **request** **to** **prevent** **data** **leaks** **between** **users.**

```typescript
import { legacy_createStore as createStore } from "redux";
import { rootReducer, type RootState } from "./reducers";

export function makeClientStore(preloaded?: Partial<RootState>) {
  return createStore(rootReducer, preloaded as RootState | undefined);
}
```

#### Key Points — Store

- **One** **store** **per** **tree** **is** **standard.**
- **Preload** **state** **for** **SSR/hydration** **carefully.**
- **Subscribe** **sparingly** **outside** **React** **—** **prefer** **`react-redux`.**

---

### Dispatch

**Beginner Level**

**`dispatch(action)`** **sends** **an** **action** **through** **middleware** **chain** **to** **reducers.**

**Real-time example**: **Todo** **—** **`dispatch(addTodo(id, text))`** **after** **user** **presses** **Enter.**

**Intermediate Level**

**Middleware** **can** **intercept** **actions** **for** **logging,** **analytics,** **or** **async** **work** **(thunks).** **Order** **matters** **—** **apply** **middleware** **left-to-right.**

**Expert Level**

**Typed** **hooks** **and** **`Dispatch<Action>`** **aliases** **ensure** **only** **valid** **actions** **reach** **the** **store** **when** **using** **module** **augmentation** **with** **RTK.**

```typescript
import type { Action, Dispatch, Middleware } from "redux";

export const analyticsMiddleware: Middleware =
  (api) => (next) => (action: Action) => {
    if (action.type.startsWith("cart/")) {
      // send analytics event (pseudo)
      console.info("[analytics]", action.type);
    }
    return next(action);
  };

export type AppDispatch = Dispatch<Action>;
```

#### Key Points — Dispatch

- **Keep** **dispatch** **thin** **in** **components** **—** **route** **complex** **flows** **to** **thunks/sagas.**
- **Type** **`dispatch`** **when** **using** **RTK** **Thunk** **or** **custom** **middleware.**
- **Avoid** **dispatching** **non-serializable** **values** **(functions,** **Promises)** **unless** **middleware** **unwraps** **them.**

---

### Selectors

**Beginner Level**

**Selectors** **read** **and** **derive** **data** **from** **`state`.** **Simple** **selectors** **are** **functions** **`(state) => state.cart`.**

**Real-time example**: **Dashboard** **`selectKpiSeries(state)`** **maps** **raw** **points** **to** **chart-ready** **arrays.**

**Intermediate Level**

**Memoize** **expensive** **selectors** **with** **`createSelector`** **from** **reselect** **to** **avoid** **recomputing** **when** **inputs** **are** **unchanged.**

**Expert Level**

**Parameterize** **selectors** **with** **factory** **functions** **for** **per-props** **memoization** **(e.g.,** **`makeSelectItemsByCategory(catId)`).**

```typescript
import { createSelector } from "reselect";
import type { RootState } from "./store";

const selectTodos = (s: RootState) => s.todos;
const selectFilter = (s: RootState) => s.visibilityFilter;

export const selectVisibleTodos = createSelector([selectTodos, selectFilter], (todos, filter) => {
  switch (filter) {
    case "SHOW_ACTIVE":
      return todos.filter((t) => !t.completed);
    case "SHOW_COMPLETED":
      return todos.filter((t) => t.completed);
    default:
      return todos;
  }
});
```

#### Key Points — Selectors

- **Compute** **derived** **data** **in** **selectors,** **not** **by** **duplicating** **state.**
- **Memoization** **prevents** **wasted** **work** **in** **large** **lists.**
- **Keep** **selectors** **pure** **and** **testable.**

---

### React-Redux — Provider

**Beginner Level**

**`<Provider store={store}>`** **makes** **the** **store** **available** **to** **`connect`** **and** **hooks** **below.**

**Real-time example**: **Social** **app** **root** **wraps** **routes** **so** **feed** **and** **sidebar** **share** **state.**

**Intermediate Level**

**Nest** **providers** **carefully** **—** **multiple** **`Provider`s** **can** **exist** **for** **islands** **(advanced).** **Pass** **`context`** **prop** **if** **you** **need** **separate** **stores** **(rare).**

**Expert Level**

**For** **SSR,** **provide** **the** **per-request** **store** **at** **the** **top** **of** **the** **React** **tree** **on** **each** **render.**

```tsx
import { Provider } from "react-redux";
import { makeClientStore } from "./store";

const store = makeClientStore();

export function App() {
  return (
    <Provider store={store}>
      <MainRoutes />
    </Provider>
  );
}
```

#### Key Points — Provider

- **Place** **`Provider`** **as** **high** **as** **needed,** **not** **always** **at** **true** **root** **if** **using** **micro** **UIs.**
- **Don’t** **recreate** **`store`** **each** **render** **without** **intent.**

---

### React-Redux — connect

**Beginner Level**

**`connect(mapState, mapDispatch)`** **wraps** **a** **component** **and** **injects** **props** **from** **the** **store.**

**Real-time example**: **E-commerce** **`CartBadge`** **receives** **`itemCount`** **from** **`mapState`.**

**Intermediate Level**

**Use** **`mergeProps`** **to** **combine** **own** **props** **with** **state** **props.** **Memoize** **`mapState`** **outputs** **with** **reselect** **to** **avoid** **extra** **renders.**

**Expert Level**

**Prefer** **hooks** **for** **new** **code;** **keep** **`connect`** **for** **legacy** **class** **components** **or** **when** **higher-order** **composition** **is** **already** **entrenched.**

```tsx
import { connect, type ConnectedProps } from "react-redux";
import type { RootState } from "./store";
import { addTodo } from "./actions";

const mapState = (s: RootState) => ({ count: s.todos.length });
const mapDispatch = { addTodo };

const connector = connect(mapState, mapDispatch);
type Props = ConnectedProps<typeof connector> & { placeholder?: string };

function TodoCounterView({ count, addTodo }: Props) {
  return (
    <button type="button" onClick={() => addTodo(crypto.randomUUID(), "New task")}>
      Add (total {count})
    </button>
  );
}

export const TodoCounter = connector(TodoCounterView);
```

#### Key Points — connect

- **`ConnectedProps`** **infers** **prop** **types** **from** **`connect`.**
- **Hooks** **are** **usually** **simpler** **in** **function** **components.**
- **Avoid** **inline** **object** **literals** **in** **`mapState`** **that** **allocate** **each** **call** **without** **memoization.**

---

### Redux Hooks — useSelector / useDispatch / useStore

**Beginner Level**

**`useSelector`** **subscribes** **to** **state** **slices;** **`useDispatch`** **returns** **`dispatch`;** **`useStore`** **accesses** **the** **store** **object** **(rare).**

**Real-time example**: **Chat** **—** **`useSelector`** **reads** **`activeThreadId`,** **`useDispatch`** **sends** **`selectThread`.**

**Intermediate Level**

**Pass** **a** **stable** **selector** **reference** **or** **inline** **with** **caution** **—** **default** **equality** **is** **strict** **`===`.** **Use** **shallow** **equal** **from** **`react-redux`** **for** **object** **slices.**

**Expert Level**

**Use** **`useStore`** **only** **for** **escape** **hatches** **(reading** **outside** **React** **lifecycle,** **subscriptions).** **Avoid** **`getState`** **in** **render** **paths** **that** **should** **subscribe.**

```tsx
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";
import { useCallback } from "react";

export function ThreadPreview({ threadId }: { threadId: string }) {
  const snippet = useSelector(
    (s: RootState) => s.chat.lastMessageByThread[threadId],
    shallowEqual
  );
  const dispatch = useDispatch<AppDispatch>();

  const open = useCallback(() => {
    dispatch({ type: "chat/openThread", threadId });
  }, [dispatch, threadId]);

  return (
    <button type="button" onClick={open}>
      {snippet?.text ?? "(no messages)"}
    </button>
  );
}
```

#### Key Points — Hooks

- **Type** **`dispatch`** **with** **`AppDispatch`** **from** **the** **store** **setup.**
- **Equality** **fn** **or** **memoized** **selectors** **prevent** **extra** **renders.**
- **`useStore`** **is** **for** **advanced** **cases** **only.**

---

## 13.3 Redux Toolkit (RTK)

### configureStore

**Beginner Level**

**`configureStore`** **creates** **a** **store** **with** **good** **defaults:** **Thunk** **middleware,** **DevTools,** **and** **`immer`** **in** **`createReducer`/`createSlice`.**

**Real-time example**: **Dashboard** **bootstraps** **store** **with** **`reducer`** **map** **and** **`middleware`** **customization.**

**Intermediate Level**

**Pass** **`preloadedState`** **for** **SSR** **hydration** **and** **tests.** **Use** **`getDefaultMiddleware`** **to** **customize** **serializable** **checks.**

**Expert Level**

**Tune** **`immutableCheck`** **and** **`serializableCheck`** **in** **performance-critical** **tests** **or** **when** **integrating** **non-serializable** **refs** **(with** **caution).**

```typescript
import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./rootReducer";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { ignoredActions: ["persist/PERSIST"] },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### Key Points — configureStore

- **Prefer** **RTK** **store** **setup** **over** **manual** **`createStore`.**
- **Export** **`RootState`** **and** **`AppDispatch`** **types.**
- **Compose** **middleware** **via** **`getDefaultMiddleware`.**

---

### createSlice

**Beginner Level**

**`createSlice`** **bundles** **reducer** **+** **actions** **with** **`name`** **and** **`initialState`.** **Mutative** **logic** **is** **safe** **because** **`immer`** **is** **applied.**

**Real-time example**: **Todo** **slice** **with** **`add`,** **`toggle`,** **`remove`.**

**Intermediate Level**

**Use** **`prepare`** **callbacks** **to** **shape** **payloads** **and** **include** **meta** **fields.**

**Expert Level**

**Split** **slices** **by** **bounded** **context;** **cross-slice** **updates** **via** **extraReducers** **listening** **to** **other** **slices** **or** **async** **thunks.**

```typescript
import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

type CartState = { items: Record<string, { title: string; qty: number }> };

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: {} } as CartState,
  reducers: {
    addItem: {
      reducer(state, action: PayloadAction<{ id: string; title: string; qty: number }>) {
        state.items[action.payload.id] = {
          title: action.payload.title,
          qty: action.payload.qty,
        };
      },
      prepare(payload: { title: string; qty: number }) {
        return { payload: { id: nanoid(), title: payload.title, qty: payload.qty } };
      },
    },
    removeItem(state, action: PayloadAction<string>) {
      delete state.items[action.payload];
    },
  },
});

export const { addItem, removeItem } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
```

#### Key Points — createSlice

- **Colocate** **actions** **and** **reducers.**
- **`prepare`** **for** **computed** **fields** **(ids,** **timestamps).**
- **Use** **`PayloadAction<T>`** **for** **typing.**

---

### createAsyncThunk

**Beginner Level**

**`createAsyncThunk`** **dispatches** **`pending/fulfilled/rejected`** **actions** **around** **a** **promise** **returned** **by** **your** **payload** **creator.**

**Real-time example**: **Weather** **`fetchForecastByCity`** **loads** **temperature** **series.**

**Intermediate Level**

**Use** **`rejectWithValue`** **to** **propagate** **API** **error** **payloads** **safely** **to** **reducers.**

**Expert Level**

**Cancel** **in-flight** **requests** **with** **`signal`** **from** **`thunkAPI`** **and** **`abort`** **in** **`fetch`.**

```typescript
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

type WeatherState = { status: "idle" | "loading" | "failed"; data?: { tempC: number } };

export const fetchWeather = createAsyncThunk(
  "weather/fetch",
  async (city: string, { rejectWithValue, signal }) => {
    const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`, { signal });
    if (!res.ok) return rejectWithValue(await res.text());
    return (await res.json()) as { tempC: number };
  }
);

const slice = createSlice({
  name: "weather",
  initialState: { status: "idle" } as WeatherState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchWeather.pending, (s) => {
      s.status = "loading";
    }).addCase(fetchWeather.fulfilled, (s, a) => {
      s.status = "idle";
      s.data = a.payload;
    }).addCase(fetchWeather.rejected, (s) => {
      s.status = "failed";
    });
  },
});
```

#### Key Points — createAsyncThunk

- **Handle** **all** **three** **states** **explicitly.**
- **Prefer** **RTK** **Query** **for** **cached** **HTTP** **in** **new** **code.**
- **Use** **`signal`** **for** **cancellation.**

---

### createEntityAdapter

**Beginner Level**

**Entity** **adapters** **store** **normalized** **collections** **`{ ids, entities }`** **and** **ship** **CRUD** **helpers.**

**Real-time example**: **Social** **posts** **by** **`id`** **for** **fast** **like/unlike.**

**Intermediate Level**

**Use** **`sortComparer`** **for** **stable** **ordering** **in** **`ids`.**

**Expert Level**

**Combine** **with** **selectors** **from** **`adapter.getSelectors`** **scoped** **to** **your** **`RootState`.**

```typescript
import { createEntityAdapter, createSlice, type EntityState } from "@reduxjs/toolkit";

type Product = { id: string; title: string; price: number };

const adapter = createEntityAdapter<Product>();

type CatalogSlice = { catalog: EntityState<Product, string> };

const slice = createSlice({
  name: "catalog",
  initialState: adapter.getInitialState() as CatalogSlice["catalog"],
  reducers: {
    upsertMany: (state, action: { payload: Product[] }) => {
      adapter.upsertMany(state, action.payload);
    },
  },
});

const selectors = adapter.getSelectors((s: { catalog: CatalogSlice["catalog"] }) => s.catalog);
export const { selectAll: selectAllProducts } = selectors;
```

#### Key Points — createEntityAdapter

- **Normalize** **to** **avoid** **O(n)** **array** **scans.**
- **Use** **`upsertMany`** **for** **pagination** **merges.**
- **Generate** **selectors** **for** **memoized** **lists.**

---

### RTK Query

**Beginner Level**

**`createApi`** **defines** **endpoints** **with** **`query`** **(GET-like)** **and** **`mutation`** **methods,** **generating** **hooks** **like** **`useGetXQuery`.**

**Real-time example**: **E-commerce** **`getProductById`** **caches** **product** **cards.**

**Intermediate Level**

**Use** **`providesTags`** **and** **`invalidatesTags`** **for** **cache** **coherency** **after** **mutations.**

**Expert Level**

**Integrate** **with** **SSR** **via** **`setupListeners`** **and** **prefetching** **on** **navigation** **for** **instant** **UX.**

```typescript
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type Product = { id: string; title: string; price: number };

export const catalogApi = createApi({
  reducerPath: "catalogApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Product"],
  endpoints: (build) => ({
    getProduct: build.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),
    updateProduct: build.mutation<Product, { id: string; patch: Partial<Product> }>({
      query: ({ id, patch }) => ({ url: `/products/${id}`, method: "PATCH", body: patch }),
      invalidatesTags: (result, error, { id }) => [{ type: "Product", id }],
    }),
  }),
});

export const { useGetProductQuery, useUpdateProductMutation } = catalogApi;
```

#### Key Points — RTK Query

- **Prefer** **for** **remote** **data** **with** **caching** **needs.**
- **Tag** **invalidation** **models** **relationships** **explicitly.**
- **Co-locate** **types** **with** **endpoints.**

---

### DevTools

**Beginner Level**

**Redux** **DevTools** **time-travel** **and** **inspect** **actions/state** **per** **dispatch.**

**Real-time example**: **Debug** **a** **dashboard** **filter** **bug** **by** **replaying** **`SET_RANGE`.**

**Intermediate Level**

**Name** **slices** **clearly** **—** **action** **types** **appear** **in** **the** **inspector.** **Use** **`action.meta`** **for** **trace** **ids.**

**Expert Level**

**Disable** **in** **production** **bundles** **or** **use** **lazy** **loading** **of** **the** **extension** **bridge** **only** **when** **present.**

```typescript
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== "production",
});
```

#### Key Points — DevTools

- **Indispensable** **for** **complex** **state** **flows.**
- **Keep** **actions** **serializable.**
- **Teach** **the** **team** **to** **record/replay** **sessions** **for** **bugs.**

---

## 13.4 Zustand

### Basics

**Beginner Level**

**Zustand** **creates** **a** **tiny** **store** **with** **`create((set, get) => ({ ... }))`.** **No** **providers** **are** **required** **(optional** **`useStore`/`Provider`** **for** **context-scoped** **stores).**

**Real-time example**: **Todo** **—** **`useTodoStore`** **tracks** **tasks** **without** **boilerplate.**

**Intermediate Level**

**Selectors** **on** **`useStore(s => s.filter)`** **avoid** **subscribing** **to** **the** **entire** **object** **if** **you** **structure** **carefully** **(use** **shallow** **compare** **from** **`zustand/shallow`).**

**Expert Level**

**Combine** **with** **middleware** **pipelines** **(`devtools`,** **`persist`,** **`immer`)** **for** **production** **patterns.**

```typescript
import { create } from "zustand";

type BearState = { bears: number; increase: () => void };

export const useBearStore = create<BearState>((set) => ({
  bears: 0,
  increase: () => set((s) => ({ bears: s.bears + 1 })),
}));
```

#### Key Points — Basics

- **Minimal** **API** **surface.**
- **Great** **for** **client** **UI** **state.**
- **Watch** **subscription** **granularity** **manually.**

---

### Creating Stores

**Beginner Level**

**Call** **`create`** **once** **per** **store** **module** **and** **export** **the** **hook.**

**Real-time example**: **Chat** **`useChatUiStore`** **for** **panel** **visibility.**

**Intermediate Level**

**For** **testing,** **use** **`createStore`** **pattern** **or** **reset** **helpers** **to** **isolate** **state** **between** **tests.**

**Expert Level**

**Scope** **stores** **per** **feature** **folder;** **avoid** **one** **mega** **store** **unless** **warranted.**

```typescript
import { createStore } from "zustand";

type CounterState = { count: number; inc: () => void };

export const counterStore = createStore<CounterState>((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
}));
```

#### Key Points — Creating Stores

- **One** **store** **per** **bounded** **context** **often** **scales** **better.**
- **Expose** **`createStore`** **when** **non-React** **code** **must** **read** **state.**

---

### Using State

**Beginner Level**

**`const n = useBearStore((s) => s.bears)`** **subscribes** **only** **to** **selected** **slices** **(reference** **equality** **on** **return** **value).**

**Real-time example**: **E-commerce** **header** **reads** **`cartTotal`**.

**Intermediate Level**

**Return** **primitives** **or** **memoize** **objects** **with** **`useShallow`** **(React** **19+/zustand** **helpers)** **or** **`zustand/shallow`** **to** **avoid** **rerenders.**

**Expert Level**

**Split** **stores** **or** **use** **selectors** **per** **component** **to** **minimize** **rerender** **fan-out** **on** **hot** **paths.**

```tsx
import { useShallow } from "zustand/shallow";
import { create } from "zustand";

type S = { a: number; b: number; incA: () => void };
export const useS = create<S>((set) => ({
  a: 0,
  b: 0,
  incA: () => set((s) => ({ a: s.a + 1 })),
}));

export function AReader() {
  const { a, incA } = useS(useShallow((s) => ({ a: s.a, incA: s.incA })));
  return (
    <button type="button" onClick={incA}>
      a={a}
    </button>
  );
}
```

#### Key Points — Using State

- **Selector** **returns** **stable** **references** **when** **possible.**
- **Shallow** **compare** **for** **object** **picks.**
- **Measure** **with** **React** **Profiler** **if** **in** **doubt.**

---

### Actions

**Beginner Level**

**Actions** **are** **functions** **on** **the** **store** **that** **call** **`set`** **to** **update** **state.**

**Real-time example**: **Social** **`toggleFollow(userId)`.**

**Intermediate Level**

**Use** **`set((s) => ...)`** **for** **functional** **updates** **to** **avoid** **stale** **closures.**

**Expert Level**

**Call** **async** **actions** **that** **internally** **`await`** **fetch,** **then** **`set`** **results** **—** **or** **delegate** **network** **to** **TanStack** **Query** **and** **keep** **Zustand** **for** **UI** **flags** **only.**

```typescript
import { create } from "zustand";

type AuthModal = { open: boolean; openModal: () => void; closeModal: () => void };

export const useAuthModal = create<AuthModal>((set) => ({
  open: false,
  openModal: () => set({ open: true }),
  closeModal: () => set({ open: false }),
}));
```

#### Key Points — Actions

- **Keep** **actions** **synchronous** **when** **possible;** **push** **I/O** **out.**
- **Use** **functional** **`set`** **for** **concurrent** **safety.**

---

### Middleware

**Beginner Level**

**Middleware** **wraps** **`set`** **to** **add** **logging,** **persistence,** **or** **devtools.**

**Real-time example**: **Log** **every** **cart** **mutation** **in** **staging.**

**Intermediate Level**

**Compose** **with** **`devtools`** **from** **`zustand/middleware`.**

**Expert Level**

**Write** **custom** **middleware** **to** **enforce** **invariants** **(assert** **valid** **transitions)** **in** **dev** **only.**

```typescript
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type S = { value: number; inc: () => void };

export const useDevStore = create<S>()(
  devtools(
    (set) => ({
      value: 0,
      inc: () => set((s) => ({ value: s.value + 1 }), false, "inc"),
    }),
    { name: "DevStore" }
  )
);
```

#### Key Points — Middleware

- **Start** **with** **`devtools`** **and** **`persist`.**
- **Custom** **middleware** **for** **cross-cutting** **concerns.**
- **Avoid** **heavy** **work** **in** **middleware** **on** **every** **set.**

---

### Persist

**Beginner Level**

**`persist`** **middleware** **saves** **state** **to** **`localStorage`** **(or** **custom** **storage)** **and** **rehydrates** **on** **load.**

**Real-time example**: **Theme** **toggle** **and** **dashboard** **column** **order.**

**Intermediate Level**

**Use** **`partialize`** **to** **avoid** **persisting** **ephemeral** **or** **sensitive** **fields.**

**Expert Level**

**Handle** **SSR** **mismatches** **—** **delay** **render** **until** **rehydration** **completes** **or** **suppress** **warnings** **with** **care.**

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

type UiPrefs = { density: "comfortable" | "compact"; setDensity: (d: UiPrefs["density"]) => void };

export const useUiPrefs = create<UiPrefs>()(
  persist(
    (set) => ({
      density: "comfortable",
      setDensity: (density) => set({ density }),
    }),
    { name: "ui-prefs", partialize: (s) => ({ density: s.density }) }
  )
);
```

#### Key Points — Persist

- **Never** **persist** **secrets** **or** **tokens** **without** **encryption** **and** **threat** **modeling.**
- **Partialize** **to** **minimize** **storage** **size.**
- **Test** **rehydration** **edge** **cases.**

---

### Zustand vs Redux

**Beginner Level**

**Zustand** **is** **smaller** **and** **less** **opinionated;** **Redux** **enforces** **actions/reducers** **and** **has** **richer** **ecosystem.**

**Real-time example**: **Startup** **MVP** **might** **pick** **Zustand;** **enterprise** **with** **existing** **Redux** **stays** **on** **RTK.**

**Intermediate Level**

**RTK** **Query** **+** **RTK** **slices** **shine** **for** **large** **teams** **needing** **strict** **patterns** **and** **DevTools** **integration** **out** **of** **the** **box.**

**Expert Level**

**You** **can** **use** **both** **—** **e.g.,** **Zustand** **for** **ephemeral** **UI** **while** **RTK** **Query** **owns** **server** **cache** **(avoid** **duplicating** **the** **same** **entities).**

```typescript
export type DecisionMatrix = {
  chooseReduxWhen: string[];
  chooseZustandWhen: string[];
};

export const guidance: DecisionMatrix = {
  chooseReduxWhen: [
    "Need time-travel DevTools across many features",
    "Want RTK Query integrated with global store",
    "Large team needs uniform reducer patterns",
  ],
  chooseZustandWhen: [
    "Want minimal boilerplate and tiny bundle",
    "Feature-local stores without providers",
    "Combine with TanStack Query for server cache",
  ],
};
```

#### Key Points — vs Redux

- **Prefer** **RTK** **if** **you** **already** **have** **Redux** **investment.**
- **Zustand** **excels** **at** **incremental** **adoption.**
- **Avoid** **two** **sources** **of** **truth** **for** **the** **same** **entity.**

---

## 13.5 Jotai

### Atoms

**Beginner Level**

**An** **atom** **is** **a** **piece** **of** **reactive** **state.** **`atom(initialValue)`** **creates** **a** **primitive** **atom.**

**Real-time example**: **Weather** **—** **`cityAtom`** **stores** **the** **current** **city** **string.**

**Intermediate Level**

**Atoms** **compose** **into** **graphs;** **components** **subscribe** **to** **atoms** **they** **read.**

**Expert Level**

**Use** **atoms** **for** **fine-grained** **updates** **instead** **of** **broadcasting** **context** **changes.**

```typescript
import { atom } from "jotai";

export const cityAtom = atom("London");
export const unitAtom = atom<"C" | "F">("C");
```

#### Key Points — Atoms

- **Think** **graph,** **not** **single** **store** **tree.**
- **Great** **for** **leafy** **UI** **state.**
- **Keep** **atoms** **small** **and** **named.**

---

### useAtom

**Beginner Level**

**`useAtom(atom)`** **returns** **`[value, setValue]`** **like** **`useState`.**

**Real-time example**: **Todo** **filter** **atom** **bound** **to** **a** **select** **input.**

**Intermediate Level**

**Use** **`useAtomValue`** **and** **`useSetAtom`** **to** **split** **read/write** **subscriptions.**

**Expert Level**

**Optimize** **hot** **lists** **with** **atom** **per** **row** **(family)** **to** **avoid** **parent** **rerenders.**

```tsx
import { useAtom } from "jotai";
import { cityAtom } from "./atoms";

export function CityInput() {
  const [city, setCity] = useAtom(cityAtom);
  return <input value={city} onChange={(e) => setCity(e.target.value)} />;
}
```

#### Key Points — useAtom

- **Split** **read/write** **when** **possible.**
- **Avoid** **storing** **derived** **data** **—** **use** **derived** **atoms.**

---

### Derived Atoms

**Beginner Level**

**A** **derived** **atom** **reads** **other** **atoms** **and** **computes** **a** **value.**

**Real-time example**: **`celsiusAtom`** **derived** **from** **`fahrenheitAtom`.**

**Intermediate Level**

**Derived** **atoms** **can** **be** **read-only** **or** **writable** **with** **`get/set`.**

**Expert Level**

**Use** **for** **selectors** **without** **reselect** **plumbing** **in** **atom** **architectures.**

```typescript
import { atom } from "jotai";

const dollarsAtom = atom(120);
export const eurAtom = atom(
  (get) => get(dollarsAtom) * 0.92,
  (get, set, eur: number) => {
    set(dollarsAtom, eur / 0.92);
  }
);
```

#### Key Points — Derived Atoms

- **Great** **for** **derived** **UI** **state** **without** **duplication.**
- **Watch** **for** **cycles** **in** **the** **graph.**
- **Memoization** **is** **built-in** **via** **atom** **graph** **tracking.**

---

### Async Atoms

**Beginner Level**

**Async** **atoms** **return** **promises** **or** **use** **`loadable`** **utilities** **to** **suspend** **or** **show** **loading** **states.**

**Real-time example**: **Dashboard** **fetches** **KPI** **JSON** **based** **on** **`rangeAtom`.**

**Intermediate Level**

**Combine** **with** **React** **Suspense** **boundaries** **for** **data** **loading** **UX.**

**Expert Level**

**Prefer** **TanStack** **Query** **for** **caching** **—** **use** **Jotai** **async** **atoms** **for** **lightweight** **prototypes** **or** **tightly** **coupled** **graph** **state.**

```typescript
import { atom } from "jotai";

export const userIdAtom = atom("u1");

export const userAtom = atom(async (get) => {
  const id = get(userIdAtom);
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error("failed");
  return (await res.json()) as { id: string; name: string };
});
```

#### Key Points — Async Atoms

- **Great** **for** **simple** **async** **dependencies.**
- **Add** **cache** **layer** **for** **production** **network** **calls.**
- **Handle** **errors** **with** **Error** **Boundaries** **or** **`loadable`.**

---

### Atom Families

**Beginner Level**

**Atom** **families** **parameterize** **atoms** **by** **key** **(e.g.,** **`atomFamily((id) => atom(...))`).**

**Real-time example**: **Chat** **—** **one** **atom** **per** **thread** **draft** **message.**

**Intermediate Level**

**Evict** **atoms** **when** **lists** **prune** **to** **avoid** **memory** **leaks** **(library-specific** **helpers).**

**Expert Level**

**Use** **for** **virtualized** **lists** **where** **each** **row** **owns** **fine-grained** **state.**

```typescript
import { atom } from "jotai";
import { atomFamily } from "jotai/utils";

export const draftAtomFamily = atomFamily((threadId: string) =>
  atom({ text: "", attachments: [] as string[] })
);
```

#### Key Points — Atom Families

- **Scales** **per-item** **state** **cleanly.**
- **Mind** **memory** **when** **keys** **grow** **unbounded.**
- **Combine** **with** **virtualization** **for** **performance.**

---

## 13.6 Recoil

### Recoil Atoms

**Beginner Level**

**`atom({ key, default })`** **declares** **a** **piece** **of** **state** **with** **a** **string** **key** **(must** **be** **unique** **globally).**

**Real-time example**: **Social** **`currentUserIdState`.**

**Intermediate Level**

**Keys** **are** **important** **for** **persistence** **and** **debugging** **—** **namespace** **them.**

**Expert Level**

**Avoid** **key** **collisions** **across** **packages** **by** **prefixing** **with** **app** **name.**

```typescript
import { atom } from "recoil";

export const feedFilterState = atom<"latest" | "popular">({
  key: "feedFilterState",
  default: "latest",
});
```

#### Key Points — Recoil Atoms

- **Unique** **`key`** **strings** **are** **mandatory.**
- **Great** **for** **prototyping** **graph** **state.**
- **Project** **status** **should** **be** **checked** **for** **long-term** **adoption** **(team** **policy).**

---

### Selectors

**Beginner Level**

**Selectors** **derive** **state** **from** **atoms** **and** **other** **selectors.**

**Real-time example**: **E-commerce** **`cartTotalSelector`** **sums** **line** **items.**

**Intermediate Level**

**Async** **selectors** **can** **fetch** **data** **(with** **caching** **policies)** **—** **understand** **Suspense** **integration.**

**Expert Level**

**Use** **selector** **families** **for** **parameterized** **derivations** **(per-id** **lookups).**

```typescript
import { atom, selector } from "recoil";

const cartAtom = atom<Record<string, number>>({ key: "cartAtom", default: {} });

export const cartTotalSelector = selector({
  key: "cartTotalSelector",
  get: ({ get }) => {
    const cart = get(cartAtom);
    return Object.values(cart).reduce((a, b) => a + b, 0);
  },
});
```

#### Key Points — Selectors

- **Keep** **them** **pure** **where** **possible.**
- **Name** **keys** **consistently.**
- **Watch** **bundle** **size** **and** **app** **constraints** **for** **your** **org.**

---

### useRecoilState

**Beginner Level**

**`useRecoilState(atomOrSelectorWritable)`** **returns** **`[value, set]`.**

**Real-time example**: **Todo** **checkbox** **bound** **to** **atom.**

**Intermediate Level**

**Prefer** **`useRecoilValue`** **for** **read-only** **components** **to** **reduce** **subscriptions.**

**Expert Level**

**Batch** **updates** **with** **Recoil** **batching** **APIs** **when** **setting** **many** **atoms** **at** **once.**

```tsx
import { useRecoilState } from "recoil";
import { feedFilterState } from "./state";

export function FeedTabs() {
  const [filter, setFilter] = useRecoilState(feedFilterState);
  return (
    <div>
      <button type="button" onClick={() => setFilter("latest")} disabled={filter === "latest"}>
        Latest
      </button>
      <button type="button" onClick={() => setFilter("popular")} disabled={filter === "popular"}>
        Popular
      </button>
    </div>
  );
}
```

#### Key Points — useRecoilState

- **Split** **reads** **and** **writes** **when** **possible.**
- **Avoid** **storing** **derived** **values.**
- **Measure** **render** **counts** **on** **large** **trees.**

---

### useRecoilValue

**Beginner Level**

**`useRecoilValue`** **subscribes** **read-only.**

**Real-time example**: **Dashboard** **KPI** **display** **from** **selector.**

**Intermediate Level**

**Combine** **with** **`React.memo`** **on** **leaf** **components** **for** **performance.**

**Expert Level**

**Use** **selector** **families** **to** **avoid** **rerendering** **unrelated** **branches.**

```tsx
import { useRecoilValue } from "recoil";
import { cartTotalSelector } from "./state";

export function CartBadge() {
  const total = useRecoilValue(cartTotalSelector);
  return <span aria-label="Cart items">{total}</span>;
}
```

#### Key Points — useRecoilValue

- **Prefer** **for** **leaf** **readers.**
- **Pair** **with** **fine-grained** **atoms/selectors.**
- **Avoid** **wide** **selectors** **that** **change** **often.**

---

### useSetRecoilState

**Beginner Level**

**`useSetRecoilState`** **returns** **only** **a** **setter** **function** **without** **subscribing** **to** **value** **changes.**

**Real-time example**: **Analytics** **event** **handler** **updates** **hidden** **preferences** **without** **rerendering** **the** **button** **on** **each** **change** **elsewhere.**

**Intermediate Level**

**Great** **for** **event** **handlers** **in** **lists** **where** **the** **handler** **component** **doesn’t** **need** **the** **current** **value.**

**Expert Level**

**Combine** **with** **callback** **refs** **or** **imperative** **controllers** **for** **performance** **sensitive** **widgets.**

```tsx
import { useSetRecoilState } from "recoil";
import { cartAtom } from "./state";

export function AddToCart({ sku }: { sku: string }) {
  const setCart = useSetRecoilState(cartAtom);
  return (
    <button
      type="button"
      onClick={() =>
        setCart((cart) => ({
          ...cart,
          [sku]: (cart[sku] ?? 0) + 1,
        }))
      }
    >
      Add
    </button>
  );
}
```

#### Key Points — useSetRecoilState

- **Avoids** **rerenders** **from** **value** **subscription.**
- **Use** **for** **write-only** **interactions.**
- **Keep** **updates** **immutable.**

---

## 13.7 MobX

### Observables

**Beginner Level**

**MobX** **turns** **class** **fields** **or** **objects** **into** **observables** **that** **track** **dependencies** **when** **read** **inside** **reactions.**

**Real-time example**: **Dashboard** **`observable`** **map** **of** **widgets** **by** **id.**

**Intermediate Level**

**Use** **`makeObservable`** **/`makeAutoObservable`** **for** **explicit** **vs** **convenient** **annotation.**

**Expert Level**

**Structure** **domain** **models** **as** **classes** **with** **actions** **for** **clear** **transactions.**

```typescript
import { makeAutoObservable } from "mobx";

export class Cart {
  lines = new Map<string, { title: string; qty: number }>();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  add(sku: string, title: string) {
    const line = this.lines.get(sku);
    if (!line) this.lines.set(sku, { title, qty: 1 });
    else line.qty += 1;
  }
}
```

#### Key Points — Observables

- **Great** **for** **OOP-style** **models.**
- **Requires** **discipline** **(actions,** **boundaries).**
- **Test** **stores** **in** **isolation.**

---

### Actions

**Beginner Level**

**`action`** **wraps** **mutations** **that** **should** **be** **atomic** **for** **derivations** **and** **debugging.**

**Real-time example**: **Chat** **`sendMessage`** **action** **updates** **thread** **+** **append** **message.**

**Intermediate Level**

**`runInAction`** **for** **async** **flows** **after** **`await`.**

**Expert Level**

**Use** **strict** **mode** **enforcement** **in** **development** **to** **catch** **untracked** **mutations.**

```typescript
import { action, makeObservable, observable } from "mobx";

class Counter {
  value = 0;

  constructor() {
    makeObservable(this, {
      value: observable,
      inc: action,
    });
  }

  inc = () => {
    this.value += 1;
  };
}
```

#### Key Points — Actions

- **Batch** **related** **updates** **into** **one** **action.**
- **Wrap** **async** **continuations** **properly.**
- **Don’t** **mutate** **outside** **actions** **in** **strict** **mode.**

---

### Computed

**Beginner Level**

**`computed`** **values** **cache** **derived** **results** **until** **dependencies** **change.**

**Real-time example**: **E-commerce** **`totalPrice`** **from** **lines.**

**Intermediate Level**

**Avoid** **side** **effects** **inside** **computed** **—** **keep** **them** **pure.**

**Expert Level**

**Use** **`computed.struct`** **for** **deep** **equality** **when** **returning** **objects/arrays.**

```typescript
import { computed, makeObservable, observable } from "mobx";

class CartView {
  lines: { price: number; qty: number }[] = [];

  constructor() {
    makeObservable(this, {
      lines: observable,
      total: computed,
    });
  }

  get total() {
    return this.lines.reduce((s, l) => s + l.price * l.qty, 0);
  }
}
```

#### Key Points — Computed

- **Derive,** **don’t** **duplicate.**
- **Keep** **pure.**
- **Pick** **structural** **comparison** **when** **needed.**

---

### observer HOC

**Beginner Level**

**`observer`** **from** **`mobx-react-lite`** **wraps** **components** **so** **they** **re-render** **when** **observables** **they** **read** **change.**

**Real-time example**: **Social** **post** **row** **re-renders** **when** **its** **`likes`** **observable** **changes.**

**Intermediate Level**

**Use** **function** **components** **+** **`observer`** **for** **best** **ergonomics.**

**Expert Level**

**Split** **observed** **trees** **to** **avoid** **large** **component** **re-renders** **when** **reading** **many** **observables.**

```tsx
import { observer } from "mobx-react-lite";
import type { Cart } from "./Cart";

export const CartSummary = observer(function CartSummary({ cart }: { cart: Cart }) {
  return <div>Items: {cart.lines.size}</div>;
});
```

#### Key Points — observer

- **Always** **wrap** **components** **that** **read** **observables.**
- **Split** **big** **trees.**
- **Prefer** **`mobx-react-lite`** **for** **function** **components.**

---

## 13.8 Valtio

### Proxy State

**Beginner Level**

**`proxy({ ... })`** **creates** **a** **mutable** **object** **tracked** **by** **proxy** **machinery.**

**Real-time example**: **Weather** **filters** **object** **updated** **imperatively.**

**Intermediate Level**

**Mutations** **are** **tracked** **for** **snapshots** **and** **subscriptions.**

**Expert Level**

**Use** **for** **ergonomic** **mutable** **models** **with** **React** **integration** **via** **`useSnapshot`.**

```typescript
import { proxy } from "valtio";

export type DashboardFilters = { range: "7d" | "30d"; region: string };

export const dashboardFilters = proxy<DashboardFilters>({ range: "7d", region: "EU" });
```

#### Key Points — Proxy State

- **Mutable** **ergonomics** **with** **reactivity.**
- **Not** **the** **same** **as** **Redux** **immutability** **—** **understand** **mental** **model.**
- **Great** **for** **local** **shared** **models.**

---

### useSnapshot

**Beginner Level**

**`useSnapshot(proxyObj)`** **returns** **an** **immutable** **snapshot** **for** **React** **rendering** **that** **tracks** **property** **access.**

**Real-time example**: **Todo** **list** **reads** **`snapshot.items`.**

**Intermediate Level**

**Snapshots** **are** **frozen** **in** **strict** **mode** **for** **render** **consistency.**

**Expert Level**

**Subscribe** **outside** **React** **with** **`subscribe`** **from** **`valtio/vanilla`** **for** **non-React** **consumers.**

```tsx
import { useSnapshot } from "valtio";
import { dashboardFilters } from "./filters";

export function RegionSelect() {
  const snap = useSnapshot(dashboardFilters);
  return (
    <select value={snap.region} onChange={(e) => (dashboardFilters.region = e.target.value)}>
      <option value="EU">EU</option>
      <option value="US">US</option>
    </select>
  );
}
```

#### Key Points — useSnapshot

- **Never** **mutate** **the** **snapshot** **—** **mutate** **the** **proxy.**
- **Fine-grained** **tracking** **via** **property** **reads.**
- **Use** **in** **React** **components** **only** **for** **rendering.**

---

### Patterns

**Beginner Level**

**Split** **proxies** **by** **feature:** **`authState`,** **`cartState`.**

**Real-time example**: **Chat** **—** **`threadDrafts`** **proxy** **map.**

**Intermediate Level**

**Derive** **with** **`derive`** **from** **`valtio/utils`** **for** **computed** **snapshots.**

**Expert Level**

**Combine** **with** **React** **Server** **Components** **carefully** **—** **proxies** **are** **client-only.**

```typescript
import { proxy } from "valtio";
import { derive } from "valtio/utils";

const base = proxy({ dollars: 100 });
export const derived = derive({ eur: (get) => get(base).dollars * 0.92 }, { proxy: base });
```

#### Key Points — Patterns

- **Keep** **proxies** **feature-scoped.**
- **Use** **`derive`** **for** **computed** **values.**
- **Test** **snapshot** **behavior** **across** **renders.**

---

## Key Points (Chapter Summary)

- **Start** **local,** **promote** **to** **global** **with** **clear** **ownership** **and** **performance** **data.**
- **Redux/RTK** **excels** **at** **predictable** **flows,** **DevTools,** **and** **normalized** **entities.**
- **RTK** **Query** **should** **own** **remote** **cache** **when** **you** **choose** **Redux.**
- **Zustand** **is** **minimal** **and** **pairs** **well** **with** **TanStack** **Query.**
- **Jotai/Recoil** **provide** **fine-grained** **graphs;** **mind** **keys** **and** **memory.**
- **MobX** **fits** **OOP** **domain** **models;** **use** **`observer`.**
- **Valtio** **offers** **mutable** **proxies** **with** **`useSnapshot`** **for** **React.**

---

## Best Practices (Global)

- **Co-locate** **state** **with** **its** **primary** **owner;** **avoid** **premature** **globalization.**
- **Keep** **server** **state** **in** **a** **cache** **layer** **(RTK** **Query,** **TanStack** **Query)** **with** **clear** **invalidation.**
- **Normalize** **relational** **entities** **for** **large** **dashboards** **and** **social** **graphs.**
- **Type** **actions,** **selectors,** **and** **stores** **with** **TypeScript;** **validate** **at** **boundaries** **with** **zod** **when** **needed.**
- **Measure** **re-renders** **with** **React** **Profiler** **before** **micro-optimizing** **subscriptions.**
- **Document** **store** **boundaries** **for** **new** **contributors** **(what** **belongs** **where).**

---

## Common Mistakes to Avoid

- **Mirroring** **the** **same** **remote** **data** **in** **Redux** **and** **React** **Query** **without** **a** **single** **source** **of** **truth.**
- **Storing** **derived** **values** **that** **should** **be** **computed** **(cart** **totals,** **sorted** **lists).**
- **Using** **Context** **for** **frequently** **changing** **values** **without** **splitting** **providers** **—** **causes** **wide** **rerenders.**
- **Dispatching** **non-serializable** **payloads** **then** **wondering** **why** **DevTools/persist** **break.**
- **Creating** **Zustand** **stores** **inside** **components** **(recreates** **state** **each** **render).**
- **Forgetting** **`observer`** **in** **MobX** **or** **mutating** **Valtio** **snapshots** **in** **render.**
- **Ignoring** **SSR** **constraints** **when** **persisting** **or** **reading** **`window`.**

---
