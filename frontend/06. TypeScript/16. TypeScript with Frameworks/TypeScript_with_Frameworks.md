# TypeScript with Frameworks

Static typing patterns for React, Vue, Angular, Node/Express, Next.js, and Jest.
## 📑 Table of Contents
1. [React with TypeScript](#1-react-with-typescript)
   - [Function components vs `React.FC`](#11-function-components-vs-reactfc)
   - [Props interfaces and `children`](#12-props-interfaces-and-children)
   - [Event handler types](#13-event-handler-types)
   - [Refs: `useRef` and `forwardRef`](#14-refs-useref-and-forwardref)
   - [Hook typing patterns](#15-hook-typing-patterns)
   - [Context API types](#16-context-api-types)
   - [Custom hooks](#17-custom-hooks)
   - [`ReactNode` vs `JSX.Element`](#18-reactnode-vs-jsxelement)
   - [Generic components](#19-generic-components)
   - [HOC and render-prop types](#110-hoc-and-render-prop-types)
2. [Vue with TypeScript](#2-vue-with-typescript)
3. [Angular with TypeScript](#3-angular-with-typescript)
4. [Node.js with TypeScript](#4-nodejs-with-typescript)
5. [Next.js with TypeScript](#5-nextjs-with-typescript)
6. [Testing with TypeScript](#6-testing-with-typescript)
7. [Best Practices](#best-practices)
8. [Common Mistakes](#common-mistakes)

## 1. React with TypeScript
### 1.1 Function components vs `React.FC`
`React.FC` historically implied optional `children`. Prefer plain functions with explicit props.

#### 🟢 Beginner Example
```typescript
import type { FC } from "react";
type GreetProps = { name: string };
const Greet: FC<GreetProps> = ({ name }) => <h1>Hello, {name}</h1>;
```
#### 🟡 Intermediate Example
```typescript
import type { ReactElement } from "react";
type CardProps = { title: string; body: string };
function Card({ title, body }: CardProps): ReactElement {
  return (
    <article>
      <h2>{title}</h2>
      <p>{body}</p>
    </article>
  );
}
```
#### 🔴 Expert Example
```typescript
import type { ReactElement, ReactNode } from "react";
type PolymorphicProps<T extends React.ElementType> = {
  as?: T;
  children?: ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "children">;
function Box<T extends React.ElementType = "div">({
  as,
  children,
  ...rest
}: PolymorphicProps<T>): ReactElement {
  const Component = as ?? "div";
  return <Component {...rest}>{children}</Component>;
}
```
#### 🌍 Real-Time Example
```typescript
type ChatBubbleProps = { sender: string; text: string; ts: number };
export function ChatBubble({ sender, text, ts }: ChatBubbleProps) {
  return (
    <div data-testid="bubble">
      <strong>{sender}</strong>
      <time dateTime={new Date(ts).toISOString()}>{new Date(ts).toLocaleTimeString()}</time>
      <p>{text}</p>
    </div>
  );
}
```

### 1.2 Props interfaces and `children`
Use `ReactNode` for flexible `children`; use `ReactElement` when you require elements.
#### 🟢 Beginner Example
```typescript
import type { ReactNode } from "react";
interface LayoutProps {
  title: string;
  children: ReactNode;
}
export function Layout({ title, children }: LayoutProps) {
  return (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  );
}
```
#### 🟡 Intermediate Example
```typescript
import type { ReactElement } from "react";
interface PanelProps {
  header: ReactElement;
  children: ReactElement;
}
export function Panel({ header, children }: PanelProps) {
  return (
    <section>
      <header>{header}</header>
      <div>{children}</div>
    </section>
  );
}
```
#### 🔴 Expert Example
```typescript
import type { ReactNode } from "react";
type SlotProps =
  | { mode: "single"; child: ReactNode; children?: never }
  | { mode: "list"; children: ReactNode; child?: never };
type AdvancedSlotProps = { label: string } & SlotProps;
export function AdvancedSlot(props: AdvancedSlotProps) {
  const body = props.mode === "single" ? props.child : props.children;
  return (
    <div>
      <span>{props.label}</span>
      {body}
    </div>
  );
}
```
#### 🌍 Real-Time Example
```typescript
import type { ReactNode } from "react";
interface StreamLayoutProps {
  sidebar: ReactNode;
  main: ReactNode;
  overlay?: ReactNode;
}
export function StreamLayout({ sidebar, main, overlay }: StreamLayoutProps) {
  return (
    <div className="stream-root">
      <aside>{sidebar}</aside>
      <section>{main}</section>
      {overlay}
    </div>
  );
}
```

### 1.3 Event handler types

Prefer `ChangeEvent`, `FormEvent`, `KeyboardEvent`, etc., over untyped `Event`.

#### 🟢 Beginner Example
```typescript
import { useState, type ChangeEvent } from "react";
export function EmailField() {
  const [email, setEmail] = useState("");
  const onChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  return <input type="email" value={email} onChange={onChange} />;
}
```
#### 🟡 Intermediate Example
```typescript
import { type FormEvent } from "react";
type LoginFormProps = { onSubmit: (email: string, password: string) => void };
export function LoginForm({ onSubmit }: LoginFormProps) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSubmit(String(fd.get("email") ?? ""), String(fd.get("password") ?? ""));
  }
  return (
    <form onSubmit={handleSubmit}>
      <input name="email" />
      <input name="password" type="password" />
      <button type="submit">Log in</button>
    </form>
  );
}
```
#### 🔴 Expert Example
```typescript
import { useCallback, type DragEvent, type ClipboardEvent, type SyntheticEvent } from "react";
type DropZoneProps = { onFiles: (files: File[]) => void; onPasteUrl?: (url: string) => void };
export function DropZone({ onFiles, onPasteUrl }: DropZoneProps) {
  const stop = useCallback((e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  return (
    <div
      onDragOver={stop}
      onDrop={(e: DragEvent<HTMLDivElement>) => {
        stop(e);
        onFiles([...e.dataTransfer.files]);
      }}
      onPaste={(e: ClipboardEvent<HTMLDivElement>) =>
        onPasteUrl?.(e.clipboardData.getData("text"))
      }
      tabIndex={0}
    >
      Drop or paste
    </div>
  );
}
```
#### 🌍 Real-Time Example
```typescript
import { useRef, type KeyboardEvent } from "react";
type ChatInputProps = { onSend: (text: string) => void };
export function ChatInput({ onSend }: ChatInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const v = ref.current?.value.trim();
      if (v) onSend(v);
      if (ref.current) ref.current.value = "";
    }
  }
  return <input ref={ref} onKeyDown={onKeyDown} placeholder="Message…" />;
}
```

### 1.4 Refs: `useRef` and `forwardRef`
#### 🟢 Beginner Example
```typescript
import { useRef, useEffect } from "react";
export function FocusOnMount() {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  return <input ref={inputRef} />;
}
```
#### 🟡 Intermediate Example
```typescript
import { forwardRef, type ComponentPropsWithoutRef } from "react";
type TextFieldProps = ComponentPropsWithoutRef<"input"> & { label: string };
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, ...rest },
  ref
) {
  return (
    <label>
      {label}
      <input ref={ref} {...rest} />
    </label>
  );
});
```
#### 🔴 Expert Example
```typescript
import { forwardRef, useImperativeHandle, useRef, type ForwardedRef } from "react";
export type VideoHandle = { play: () => void; pause: () => void };
function VideoInner({ src }: { src: string }, ref: ForwardedRef<VideoHandle>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useImperativeHandle(ref, () => ({
    play: () => void videoRef.current?.play(),
    pause: () => void videoRef.current?.pause(),
  }));
  return <video ref={videoRef} src={src} />;
}
export const Video = forwardRef<VideoHandle, { src: string }>(VideoInner);
```
#### 🌍 Real-Time Example
```typescript
import { useRef, useEffect } from "react";
export function Transcript({ lines }: { lines: string[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines.length]);
  return (
    <div className="transcript">
      {lines.map((l, i) => (
        <p key={i}>{l}</p>
      ))}
      <div ref={endRef} />
    </div>
  );
}
```

### 1.5 Hook typing patterns
`useState`, `useEffect`, `useReducer`, `useContext`, `useMemo`, `useCallback`: add generics when inference is too wide or starts at `null`.

#### 🟢 Beginner Example
```typescript
import { useState, useEffect, useMemo } from "react";
export function Counter() {
  const [count, setCount] = useState(0);
  const label = useMemo(() => `Count: ${count}`, [count]);
  useEffect(() => {
    document.title = label;
  }, [label]);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}
```
#### 🟡 Intermediate Example
```typescript
import { useReducer, useCallback } from "react";
type State = { status: "idle" | "loading" | "done"; data?: string };
type Action = { type: "fetch" } | { type: "success"; payload: string } | { type: "reset" };
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "fetch":
      return { status: "loading" };
    case "success":
      return { status: "done", data: action.payload };
    case "reset":
      return { status: "idle" };
    default:
      return state;
  }
}
export function useAsyncReducer() {
  const [s, d] = useReducer(reducer, { status: "idle" } satisfies State);
  const reset = useCallback(() => d({ type: "reset" }), []);
  return [s, d, reset] as const;
}
```
#### 🔴 Expert Example
```typescript
import { useCallback, useMemo, useRef, useEffect, useState } from "react";
type Fn = (...args: never[]) => unknown;
export function useStableCallback<T extends Fn>(fn: T): T {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback(((...args: never[]) => ref.current(...args)) as T, []);
}
export function useDebouncedValue<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return useMemo(() => v, [v]);
}
```
#### 🌍 Real-Time Example
```typescript
import { useState, useEffect, useCallback } from "react";
type Presence = Record<string, boolean>;
export function usePresenceMap(roomId: string) {
  const [map, setMap] = useState<Presence>({});
  useEffect(() => subscribePresence(roomId, setMap), [roomId]);
  const setSelf = useCallback((online: boolean) => {
    setMap((m) => ({ ...m, self: online }));
  }, []);
  return { map, setSelf };
}
declare function subscribePresence(
  roomId: string,
  cb: (p: Presence) => void
): () => void;
```

### 1.6 Context API types
#### 🟢 Beginner Example
```typescript
import { createContext, useContext } from "react";
type Theme = "light" | "dark";
const ThemeContext = createContext<Theme>("light");
export function useTheme() {
  return useContext(ThemeContext);
}
```
#### 🟡 Intermediate Example
```typescript
import { createContext, useContext, useMemo, type ReactNode } from "react";
type AuthState = { user: { id: string } | null; token: string | null };
const AuthContext = createContext<AuthState | undefined>(undefined);
export function AuthProvider({ children, value }: { children: ReactNode; value: AuthState }) {
  const memo = useMemo(() => value, [value]);
  return <AuthContext.Provider value={memo}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth requires AuthProvider");
  return ctx;
}
```
#### 🔴 Expert Example
```typescript
import { createContext, useReducer, type Dispatch, type ReactNode } from "react";
type Cmd = { type: "JOIN"; room: string } | { type: "LEAVE"; room: string };
type RoomState = { active: Set<string> };
function roomReducer(state: RoomState, cmd: Cmd): RoomState {
  const next = new Set(state.active);
  if (cmd.type === "JOIN") next.add(cmd.room);
  if (cmd.type === "LEAVE") next.delete(cmd.room);
  return { active: next };
}
type RoomCtx = [RoomState, Dispatch<Cmd>];
const RoomContext = createContext<RoomCtx | null>(null);
export function RoomProvider({ children }: { children: ReactNode }) {
  const tuple = useReducer(roomReducer, { active: new Set() });
  return <RoomContext.Provider value={tuple}>{children}</RoomContext.Provider>;
}
```
#### 🌍 Real-Time Example
```typescript
import { createContext, useContext, useState, type ReactNode } from "react";
type Notification = { id: string; message: string };
type Ctx = {
  items: Notification[];
  push: (n: Omit<Notification, "id">) => void;
  dismiss: (id: string) => void;
};
const NotifContext = createContext<Ctx | null>(null);
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Notification[]>([]);
  const value: Ctx = {
    items,
    push: (n) => setItems((xs) => [...xs, { ...n, id: crypto.randomUUID() }]),
    dismiss: (id) => setItems((xs) => xs.filter((x) => x.id !== id)),
  };
  return <NotifContext.Provider value={value}>{children}</NotifContext.Provider>;
}
export function useNotifications() {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error("Notifications require provider");
  return ctx;
}
```

### 1.7 Custom hook types
#### 🟢 Beginner Example
```typescript
import { useState } from "react";
export function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  return { on, toggle: () => setOn((v) => !v), setOn } as const;
}
```
#### 🟡 Intermediate Example
```typescript
import { useEffect, useState } from "react";
type AsyncResult<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; data: T }
  | { status: "err"; error: unknown };
export function useFetchJson<T>(url: string): AsyncResult<T> {
  const [state, setState] = useState<AsyncResult<T>>({ status: "idle" });
  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetch(url)
      .then((r) => r.json() as Promise<T>)
      .then((data) => {
        if (!cancelled) setState({ status: "ok", data });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: "err", error });
      });
    return () => {
      cancelled = true;
    };
  }, [url]);
  return state;
}
```
#### 🔴 Expert Example
```typescript
import { useRef, useSyncExternalStore } from "react";
export function useExternalStore<T>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => T,
  getServerSnapshot?: () => T
): T {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
type Point = { x: number; y: number };
const listeners = new Set<() => void>();
let cursor: Point = { x: 0, y: 0 };
export function setCursor(p: Point) {
  cursor = p;
  listeners.forEach((l) => l());
}
export function useCursor() {
  return useExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => void listeners.delete(cb);
    },
    () => cursor
  );
}
```
#### 🌍 Real-Time Example
```typescript
import { useEffect, useState } from "react";
export function useWebSocket<T>(url: string) {
  const [lastMessage, setLastMessage] = useState<T | null>(null);
  const [readyState, setReadyState] = useState(WebSocket.CONNECTING);
  useEffect(() => {
    const ws = new WebSocket(url);
    ws.onopen = () => setReadyState(ws.readyState);
    ws.onmessage = (ev) => setLastMessage(JSON.parse(String(ev.data)) as T);
    ws.onclose = () => setReadyState(WebSocket.CLOSED);
    return () => ws.close();
  }, [url]);
  return { lastMessage, readyState };
}
```

### 1.8 `ReactNode` vs `JSX.Element`
#### 🟢 Beginner Example
```typescript
import type { ReactNode } from "react";
function Page({ children }: { children: ReactNode }) {
  return <div className="page">{children}</div>;
}
export const Demo = () => (
  <Page>
    Title<p>Body</p>
  </Page>
);
```
#### 🟡 Intermediate Example
```typescript
import type { JSX } from "react";
function Toolbar(): JSX.Element {
  return (
    <nav>
      <button type="button">Back</button>
    </nav>
  );
}
```
#### 🔴 Expert Example
```typescript
import { isValidElement, type ReactNode } from "react";
export function assertElement(node: ReactNode): asserts node is JSX.Element {
  if (!isValidElement(node)) throw new Error("Expected a single React element");
}
```
#### 🌍 Real-Time Example
```typescript
import type { ReactNode } from "react";
type DashboardProps = { header: ReactNode; metrics: ReactNode; feed: ReactNode };
export function Dashboard({ header, metrics, feed }: DashboardProps) {
  return (
    <div>
      {header}
      <section className="metrics">{metrics}</section>
      <section className="feed">{feed}</section>
    </div>
  );
}
```

### 1.9 Generic components
#### 🟢 Beginner Example
```typescript
type ListProps<T> = { items: T[]; renderItem: (item: T) => string };
export function StringList<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
```
#### 🟡 Intermediate Example
```typescript
type SelectProps<T extends string | number> = { value: T; options: T[]; onChange: (v: T) => void };
export function Select<T extends string | number>({ value, options, onChange }: SelectProps<T>) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as T)}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
```
#### 🔴 Expert Example
```typescript
import type { ReactNode } from "react";
type Column<T> = { key: keyof T; header: string; cell: (row: T) => ReactNode };
type DataTableProps<T> = { rows: T[]; columns: Column<T>[] };
export function DataTable<T extends Record<string, unknown>>({ rows, columns }: DataTableProps<T>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={String(c.key)}>{c.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map((c) => (
              <td key={String(c.key)}>{c.cell(row)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```
#### 🌍 Real-Time Example
```typescript
import type { ReactNode } from "react";
type LiveRow = { symbol: string; price: number };
type Column<T> = { key: keyof T; header: string; cell: (row: T) => ReactNode };
const columns: Column<LiveRow>[] = [
  { key: "symbol", header: "Sym", cell: (r) => r.symbol },
  { key: "price", header: "Px", cell: (r) => r.price.toFixed(2) },
];
// const quotes: LiveRow[] = … → <DataTable rows={quotes} columns={columns} />
```

### 1.10 HOC and render-prop types
#### 🟢 Beginner Example
```typescript
import type { ComponentType } from "react";
export function withLabel<P extends object>(Cmp: ComponentType<P>, label: string) {
  return function Wrapped(props: P) {
    return (
      <div>
        <span>{label}</span>
        <Cmp {...props} />
      </div>
    );
  };
}
```
#### 🟡 Intermediate Example
```typescript
import { useState, type ReactNode } from "react";
type RenderCounterProps = { children: (count: number) => ReactNode };
export function RenderCounter({ children }: RenderCounterProps) {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        +
      </button>
      {children(count)}
    </div>
  );
}
```
#### 🔴 Expert Example
```typescript
import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef, type ElementType } from "react";
export function asPolymorphic<T extends ElementType, P extends object>(Component: T) {
  return forwardRef<ComponentRef<T>, P & { as?: T }>(function As({ as, ...props }, ref) {
    const Tag = (as ?? Component) as ElementType;
    return <Tag ref={ref} {...(props as ComponentPropsWithoutRef<T>)} />;
  });
}
```
#### 🌍 Real-Time Example
```typescript
import type { ReactNode } from "react";
type InfiniteProps<T> = {
  items: T[];
  renderItem: (item: T) => ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
};
export function InfiniteList<T>({ items, renderItem, onLoadMore, hasMore }: InfiniteProps<T>) {
  return (
    <div
      onScroll={(e) => {
        const el = e.currentTarget;
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 40 && hasMore) onLoadMore();
      }}>
      {items.map((item, i) => (
        <div key={i}>{renderItem(item)}</div>
      ))}
    </div>
  );
}
```

## 2. Vue with TypeScript
### 2.1 Component options and `defineComponent`
#### 🟢 Beginner Example
```typescript
import { defineComponent } from "vue";
export default defineComponent({
  data() {
    return { count: 0 as number };
  },
  methods: {
    inc() {
      this.count++;
    },
  },
});
```
#### 🟡 Intermediate Example
```typescript
import { defineComponent, type PropType } from "vue";
type User = { id: string; name: string };
export default defineComponent({
  props: {
    user: { type: Object as PropType<User>, required: true },
  },
  setup(props) {
    return { display: () => props.user.name };
  },
});
```
#### 🔴 Expert Example
```typescript
import { defineComponent, computed } from "vue";
export default defineComponent({
  props: { modelValue: { type: String, required: true } },
  emits: { "update:modelValue": (v: string) => typeof v === "string" },
  setup(props, { emit }) {
    const doubled = computed(() => props.modelValue + props.modelValue);
    return {
      doubled,
      onInput: (e: Event) =>
        emit("update:modelValue", (e.target as HTMLInputElement).value),
    };
  },
});
```
#### 🌍 Real-Time Example
```vue
<script setup lang="ts">
import { ref, computed } from "vue";
const latency = ref<number[]>([]);
const avg = computed(() =>
  latency.value.length
    ? latency.value.reduce((a, b) => a + b, 0) / latency.value.length
    : 0
);
function recordPing(ms: number) {
  latency.value = [...latency.value.slice(-99), ms];
}
</script>
```

### 2.2 Props, emits, and computed (`<script setup>`)
#### 🟢 Beginner Example
```vue
<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>();
</script>
```
#### 🟡 Intermediate Example
```vue
<script setup lang="ts">
const props = withDefaults(defineProps<{ page?: number; pageSize?: number }>(), {
  page: 1,
  pageSize: 20,
});
const emit = defineEmits<{
  change: [page: number];
  "update:pageSize": [size: number];
}>();
</script>
```
#### 🔴 Expert Example
```typescript
import type { ExtractPropTypes } from "vue";
const propsConfig = {
  ids: { type: Array as () => string[], default: () => [] as string[] },
} as const;
type Props = ExtractPropTypes<typeof propsConfig>;
```
#### 🌍 Real-Time Example
```vue
<script setup lang="ts">
import { computed } from "vue";
const props = defineProps<{
  messages: { id: string; text: string; at: number }[];
}>();
const grouped = computed(() => {
  const map = new Map<string, typeof props.messages>();
  for (const m of props.messages) {
    const k = new Date(m.at).toDateString();
    map.set(k, [...(map.get(k) ?? []), m]);
  }
  return map;
});
</script>
```

### 2.3 Composition API: `ref`, `reactive`, and performance
#### 🟢 Beginner Example
```typescript
import { ref } from "vue";
const count = ref(0);
count.value++;
```
#### 🟡 Intermediate Example
```typescript
import { reactive, toRefs } from "vue";
const state = reactive({ x: 0, y: 0 });
const { x, y } = toRefs(state);
```
#### 🔴 Expert Example
```typescript
import { ref, shallowRef, triggerRef } from "vue";
const big = shallowRef(new Map<string, number>());
function bump(key: string) {
  big.value.set(key, (big.value.get(key) ?? 0) + 1);
  triggerRef(big);
}
```
#### 🌍 Real-Time Example
```typescript
import { ref, onMounted, onUnmounted } from "vue";
export function useTicker(_symbol: string) {
  const price = ref<number | null>(null);
  let id: ReturnType<typeof setInterval>;
  onMounted(() => {
    id = setInterval(() => {
      price.value = Math.random() * 100;
    }, 1000);
  });
  onUnmounted(() => clearInterval(id));
  return { price };
}
```

### 2.4 Template refs
#### 🟢 Beginner Example
```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";
const input = ref<HTMLInputElement | null>(null);
onMounted(() => input.value?.focus());
</script>
<template>
  <input ref="input" />
</template>
```
#### 🟡 Intermediate Example
```vue
<script setup lang="ts">
import { ref } from "vue";
import type { ComponentPublicInstance } from "vue";
import Child from "./Child.vue";
const child = ref<ComponentPublicInstance<typeof Child> | null>(null);
</script>
```
#### 🔴 Expert Example
```typescript
import { ref, defineExpose } from "vue";
const scrollTop = ref(0);
function scrollTo(y: number) {
  scrollTop.value = y;
}
defineExpose({ scrollTo });
```
#### 🌍 Real-Time Example
```vue
<script setup lang="ts">
import { ref, watchPostEffect } from "vue";
const list = ref<HTMLElement | null>(null);
watchPostEffect(() => {
  list.value?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
});
</script>
```

## 3. Angular with TypeScript
### 3.1 Components, services, and dependency injection
#### 🟢 Beginner Example
```typescript
import { Component, Input } from "@angular/core";
@Component({
  selector: "app-hello",
  standalone: true,
  template: `<p>Hello {{ name }}</p>`,
})
export class HelloComponent {
  @Input({ required: true }) name!: string;
}
```
#### 🟡 Intermediate Example
```typescript
import { Component, input, output } from "@angular/core";
@Component({
  selector: "app-counter",
  standalone: true,
  template: `<button (click)="inc.emit(step())">{{ value() }}</button>`,
})
export class CounterComponent {
  value = input.required<number>();
  step = input(1);
  inc = output<number>();
}
```
#### 🔴 Expert Example
```typescript
import { Injectable, InjectionToken, inject } from "@angular/core";
export const API_BASE = new InjectionToken<string>("API_BASE");
@Injectable({ providedIn: "root" })
export class ConfigClient {
  private base = inject(API_BASE);
  url(path: string) {
    return `${this.base}${path}`;
  }
}
```
#### 🌍 Real-Time Example
```typescript
import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
@Component({
  selector: "app-quote-row",
  standalone: true,
  template: `<span>{{ symbol }} {{ price | number : "1.2-2" }}</span>`,
})
export class QuoteRowComponent implements OnChanges {
  @Input({ required: true }) symbol!: string;
  @Input() price = 0;
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["price"]) {
      /* live tick handling */
    }
  }
}
```

### 3.2 Observables, RxJS, forms, and router
#### 🟢 Beginner Example
```typescript
import { Observable, map } from "rxjs";
const doubled: Observable<number> = new Observable<number>((sub) => {
  sub.next(1);
  sub.complete();
}).pipe(map((n) => n * 2));
```
#### 🟡 Intermediate Example
```typescript
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import type { Observable } from "rxjs";
type User = { id: string };
@Injectable({ providedIn: "root" })
export class UserApi {
  private http = inject(HttpClient);
  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }
}
export const login = new FormGroup({
  email: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.email] }),
  password: new FormControl("", { nonNullable: true, validators: Validators.minLength(8) }),
});
```
#### 🔴 Expert Example
```typescript
import { switchMap, catchError, EMPTY, type Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
type SearchResult = { items: string[] };
@Injectable({ providedIn: "root" })
export class SearchService {
  private http = inject(HttpClient);
  search(q$: Observable<string>): Observable<SearchResult> {
    return q$.pipe(
      switchMap((q) =>
        this.http.get<SearchResult>("/api/search", { params: { q } }).pipe(catchError(() => EMPTY))
      )
    );
  }
}
```
#### 🌍 Real-Time Example
```typescript
import { Injectable, inject } from "@angular/core";
import { Router, type CanActivateFn } from "@angular/router";
import { map, type Observable } from "rxjs";
@Injectable({ providedIn: "root" })
export class AuthService {
  token$(): Observable<string | null> {
    return new Observable((s) => {
      s.next("abc");
      s.complete();
    });
  }
}
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(AuthService)
    .token$()
    .pipe(map((t) => (t ? true : router.createUrlTree(["/login"]))));
};
```

## 4. Node.js with TypeScript
### 4.1 `@types/node`, Express, middleware, async handlers
#### 🟢 Beginner Example
```typescript
import fs from "node:fs/promises";
async function readPkg(): Promise<unknown> {
  const buf = await fs.readFile("package.json", "utf8");
  return JSON.parse(buf);
}
```
#### 🟡 Intermediate Example
```typescript
import express, { type Request, type Response, type NextFunction } from "express";
const app = express();
app.use(express.json());
app.post("/users", (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as { name?: string };
  if (!body.name) {
    res.status(400).json({ error: "name required" });
    return;
  }
  res.status(201).json({ id: "1", name: body.name });
});
```
#### 🔴 Expert Example
```typescript
import type { RequestHandler, ErrorRequestHandler, Request } from "express";
type Authed = { userId: string };
type ReqWithUser = Request & { user?: Authed };
export const requireAuth: RequestHandler = (req, res, next) => {
  const hdr = req.headers.authorization;
  if (!hdr?.startsWith("Bearer ")) {
    res.status(401).end();
    return;
  }
  (req as ReqWithUser).user = { userId: "u1" };
  next();
};
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "internal" });
};
```
#### 🌍 Real-Time Example
```typescript
import type { Request, Response, RequestHandler } from "express";
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
export async function sseHandler(_req: Request, res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.flushHeaders();
  const id = setInterval(() => res.write(`data: ${Date.now()}\n\n`), 1000);
  res.on("close", () => clearInterval(id));
}
```

### 4.2 ORM types: Prisma and TypeORM
#### 🟢 Beginner Example
```typescript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function oneUser() {
  return prisma.user.findUnique({ where: { id: "1" } });
}
```
#### 🟡 Intermediate Example
```typescript
import { Entity, PrimaryGeneratedColumn, Column, Repository, DataSource } from "typeorm";
@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;
  @Column()
  email!: string;
}
export async function findByEmail(ds: DataSource, email: string) {
  const repo: Repository<User> = ds.getRepository(User);
  return repo.findOneBy({ email });
}
```
#### 🔴 Expert Example
```typescript
import type { Prisma } from "@prisma/client";
type UserWithPosts = Prisma.UserGetPayload<{ include: { posts: true } }>;
export function mapUser(u: UserWithPosts) {
  return { id: u.id, titles: u.posts.map((p) => p.title) };
}
```
#### 🌍 Real-Time Example
```typescript
import type { PrismaClient } from "@prisma/client";
export async function enqueueEvent(db: PrismaClient, payload: unknown) {
  await db.$transaction([
    db.outboxEvent.create({ data: { payload: JSON.stringify(payload) } }),
  ]);
}
```

## 5. Next.js with TypeScript
### 5.1 Pages, `getStaticProps`, `getServerSideProps`, App Router pages
#### 🟢 Beginner Example
```typescript
import type { NextPage } from "next";
const About: NextPage = () => <h1>About</h1>;
export default About;
```
#### 🟡 Intermediate Example
```typescript
import type { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next";
type Props = InferGetServerSidePropsType<typeof getServerSideProps>;
const Page: NextPage<Props> = ({ user }) => <pre>{JSON.stringify(user)}</pre>;
export const getServerSideProps = (async () => ({
  props: { user: { id: "1" } },
})) satisfies GetServerSideProps<{ user: { id: string } }>;
export default Page;
```
#### 🔴 Expert Example
```typescript
import type { GetStaticPaths, GetStaticProps } from "next";
type Params = { slug: string };
export const getStaticPaths = (async () => ({
  paths: [{ params: { slug: "a" } }],
  fallback: "blocking",
})) satisfies GetStaticPaths<Params>;
export const getStaticProps = (async (ctx) => {
  const slug = ctx.params?.slug;
  if (!slug) return { notFound: true };
  return { props: { slug }, revalidate: 60 };
}) satisfies GetStaticProps<{ slug: string }, Params>;
```
#### 🌍 Real-Time Example
```typescript
type Entry = { rank: number; name: string; score: number };
export default async function LeaderboardPage() {
  const rows = await fetch(`${process.env.API_URL}/leaderboard`, {
    next: { revalidate: 5 },
  }).then((r) => r.json() as Promise<Entry[]>);
  return (
    <ol>
      {rows.map((e) => (
        <li key={e.rank}>
          {e.name} — {e.score}
        </li>
      ))}
    </ol>
  );
}
```

### 5.2 API routes, Route Handlers, server vs client components
#### 🟢 Beginner Example
```typescript
import type { NextApiRequest, NextApiResponse } from "next";
export default function handler(_req: NextApiRequest, res: NextApiResponse<{ ok: boolean }>) {
  res.status(200).json({ ok: true });
}
```
#### 🟡 Intermediate Example
```typescript
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const body = (await req.json()) as { text?: string };
  return NextResponse.json({ echo: body.text ?? "" });
}
```
#### 🔴 Expert Example
```typescript
import { NextRequest, NextResponse } from "next/server";
type Ctx = { params: Promise<{ id: string }> };
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return NextResponse.json({ id });
}
```
#### 🌍 Real-Time Example
```typescript
import type { ReactNode } from "react";
export default async function Layout({ children }: { children: ReactNode }) {
  const session = await getSession();
  return (
    <html lang="en">
      <body data-user={session?.id}>{children}</body>
    </html>
  );
}
declare function getSession(): Promise<{ id: string } | null>;
```

```typescript
"use client";
import { useEffect, useState } from "react";
export function LiveClock({ initialIso }: { initialIso: string }) {
  const [now, setNow] = useState(() => new Date(initialIso));
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <time dateTime={now.toISOString()}>{now.toLocaleTimeString()}</time>;
}
```

## 6. Testing with TypeScript
### 6.1 Jest types, RTL, `jest.Mock`, `jest.SpyInstance`
#### 🟢 Beginner Example
```typescript
import { add } from "./math";
describe("add", () => {
  it("sums", () => expect(add(1, 2)).toBe(3));
});
```
#### 🟡 Intermediate Example
```typescript
type Api = { fetchUser: (id: string) => Promise<{ id: string }> };
test("mock api", async () => {
  const fetchUser = jest.fn<Api["fetchUser"]>(async (id: string) => ({ id }));
  const api: Api = { fetchUser };
  await expect(api.fetchUser("a")).resolves.toEqual({ id: "a" });
  expect(jest.mocked(api.fetchUser)).toHaveBeenCalledWith("a");
});
```
#### 🔴 Expert Example
```typescript
import { createClient } from "./client";
import type { SpyInstance } from "jest-mock";
jest.mock("./client");
const MockedClient = jest.mocked(createClient);
let spy: SpyInstance;
beforeAll(() => {
  spy = jest.spyOn(console, "error").mockImplementation(() => {});
});
beforeEach(() => {
  MockedClient.mockReturnValue({
    connect: jest.fn().mockResolvedValue(undefined),
    send: jest.fn(),
  } as unknown as ReturnType<typeof createClient>);
});
afterAll(() => spy.mockRestore());
```
#### 🌍 Real-Time Example
```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInput } from "./ChatInput";
test("sends on Enter", async () => {
  const onSend = jest.fn();
  render(<ChatInput onSend={onSend} />);
  await userEvent.type(screen.getByPlaceholderText("Message…"), "hi{Enter}");
  await waitFor(() => expect(onSend).toHaveBeenCalledWith("hi"));
});
```

### 6.2 Assertions, custom matchers, narrowing `unknown`
#### 🟢 Beginner Example
```typescript
const value: unknown = JSON.parse("{}");
expect(value).toEqual({});
```
#### 🟡 Intermediate Example
```typescript
const fn = jest.fn<(x: number) => string>();
fn.mockImplementation((x) => String(x));
expect(fn(2)).toBe("2");
```
#### 🔴 Expert Example
```typescript
import * as mod from "./time";
jest.spyOn(mod, "now").mockReturnValue(1_700_000_000_000);
afterEach(() => {
  jest.restoreAllMocks();
});
```
#### 🌍 Real-Time Example
```typescript
function assertIsUser(x: unknown): asserts x is { id: string } {
  if (typeof x !== "object" || x === null || !("id" in x)) throw new Error("not user");
}
test("payload", () => {
  const body: unknown = { id: "1" };
  assertIsUser(body);
  expect(body.id).toBe("1");
});
```

## Best Practices

- Prefer explicit props on exported components; avoid `any` at boundaries (validate with zod/valibot). Default to plain React functions + explicit `children?: ReactNode` over `React.FC`.
- Share domain types in `types/`; colocate UI prop types with components. Use `satisfies` on reducer/config literals.
- Express: validate `req.body` once, then augment `Request`. Next.js: `"use client"` only where needed; fetch on the server when possible.
- Pin `@types/node` to your Node major; run `prisma generate` in CI. Type mocks with `jest.mocked` / `jest.MockedFunction`.

## Common Mistakes

- `React.FC` / implicit `children`; `useState(null)` without a generic; `event.target` vs `currentTarget`; `forwardRef` without `displayName`.
- Vue `PropType` widening; Angular Observable leaks; Express async handlers without `next(err)`.
- Next.js server modules in client bundles; Prisma casts instead of generated types; untyped `jest.fn()`; `mockReset` vs `mockClear`.

_This cheatsheet targets TypeScript 5.x-era framework typings. Confirm against your installed `react`, `vue`, `@angular/core`, `express`, `next`, and `typescript` versions._
