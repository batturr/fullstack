# Lists and Keys (React + TypeScript)

Rendering **collections** is central to **e-commerce** **catalogs**, **social** **feeds**, **dashboard** **tables**, **todo** lists, **weather** **favorites**, **chat** **messages**, and **admin** **grids**. **Keys** tell React **which item is which** across **updates**—getting them wrong causes **bugs** (state **mis-association**, **incorrect** **animations**). This chapter uses **TypeScript** for **typed** **items** and **list** **operations**.

---

## 📑 Table of Contents

- [Lists and Keys (React + TypeScript)](#lists-and-keys-react--typescript)
  - [📑 Table of Contents](#-table-of-contents)
  - [8.1 Rendering Lists](#81-rendering-lists)
  - [8.2 Keys in React](#82-keys-in-react)
  - [8.3 List Manipulation](#83-list-manipulation)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices (Global)](#best-practices-global)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 8.1 Rendering Lists

### map() to Render Arrays

**Beginner Level**

**`items.map(item => <Row key={item.id} ... />)`** transforms **data** into **React elements**. **`map`** **returns** a **new** **array** of **elements**—valid **children** for **JSX**.

**Real-time example**: **E-commerce** **product** **grid** maps **`Product[]`** to **`<ProductCard />`**.

**Intermediate Level**

**Stable** **`key`** must come from **domain** **identity**—see §8.2.

**Expert Level**

**Virtualization** (§8.3) **still** **maps**, but **only** a **window** of **rows**—**keys** remain **critical**.

```tsx
type Product = { id: string; title: string; priceCents: number };

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid">
      {products.map((p) => (
        <li key={p.id}>
          <article>
            <h3>{p.title}</h3>
            <p>{(p.priceCents / 100).toFixed(2)}</p>
          </article>
        </li>
      ))}
    </ul>
  );
}
```

#### Key Points — map()

- **`map`** **connects** **data** → **UI**.
- **Always** **key** **list** **items**.
- **Prefer** **semantic** **wrappers** (`<ul>/<li>`) for **lists** when **appropriate**.

---

### Array of Components

**Beginner Level**

You can **store** **elements** in an **array** **variable**—**`const rows = items.map(...); return <>{rows}</>`** — **fragments** **group** **without** **extra** **DOM**.

**Intermediate Level**

**Avoid** **storing** **elements** in **state**—**derive** **from** **data** on **each** **render**.

**Expert Level**

**Precomputing** **elements** **with** **`useMemo`** only when **profiling** shows **cost**—**often** **unnecessary**.

```tsx
function Thread({ messages }: { messages: { id: string; text: string }[] }) {
  const bubbles = messages.map((m) => <p key={m.id}>{m.text}</p>);
  return <div className="thread">{bubbles}</div>;
}
```

---

### Inline vs Extracted List Item Components

**Beginner Level**

**Inline** **JSX** in **`map`** for **tiny** **rows**; **extract** **`ProductRow`** when **rows** **grow** **complex** or need **`memo`**.

**Real-time example**: **Dashboard** **table** **cells** **extracted** to **`MetricCell`** for **testing** and **readability**.

**Intermediate Level**

**Extracted** **components** **need** **props** **typing**—**clear** **interfaces**.

**Expert Level**

**Colocate** **memo** **boundary** at **row** **component** for **large** **lists**.

```tsx
import { memo } from "react";

type RowProps = { id: string; title: string };

export const TodoRow = memo(function TodoRow({ id, title }: RowProps) {
  return (
    <li>
      <span>{title}</span>
      <button type="button">Done</button>
    </li>
  );
});

export function TodoList({ items }: { items: RowProps[] }) {
  return (
    <ul>
      {items.map((it) => (
        <TodoRow key={it.id} id={it.id} title={it.title} />
      ))}
    </ul>
  );
}
```

---

### Conditional Rendering Inside Lists

**Beginner Level**

**Filter** **before** **map**, or **`map`** **returning** **`null`** for **hidden** **items**—**prefer** **filter** for **clarity** and **performance** when **many** **hidden**.

**Intermediate Level**

**Conditional** **wrappers**: **`{isAdmin && <AdminActions />}`** inside **row**.

**Expert Level**

**Virtualizers** **need** **consistent** **item** **count** **or** **measure** **callbacks**—**conditionals** affect **scroll** **height** **estimates**.

```tsx
function NotificationList({ items }: { items: { id: string; read: boolean; text: string }[] }) {
  const unread = items.filter((i) => !i.read);
  return (
    <ul>
      {unread.map((n) => (
        <li key={n.id}>{n.text}</li>
      ))}
    </ul>
  );
}
```

---

### Empty List States

**Beginner Level**

**Guard** **before** **map**: **`if (items.length === 0) return <EmptyState />`**.

**Real-time example**: **Social** **notifications** **inbox** **empty** **illustration**.

**Intermediate Level**

**Skeleton** **loading** vs **empty** **vs** **error** **states**—**three** **distinct** **UX** **patterns**.

**Expert Level**

**Accessibility**: **empty** **state** **still** **announced**—use **`role="status"`** or **live** **region** when **dynamic**.

```tsx
function CartLines({ lines }: { lines: { id: string; label: string }[] }) {
  if (!lines.length) {
    return <p>Your cart is empty — add items from the catalog.</p>;
  }
  return (
    <ul>
      {lines.map((l) => (
        <li key={l.id}>{l.label}</li>
      ))}
    </ul>
  );
}
```

---

## 8.2 Keys in React

### What is a Key?

**Beginner Level**

**`key`** is a **special** **prop** (not passed to **your** **component** as a **prop**) used by React to **match** **elements** in a **list** **between** **renders**.

**Real-time example**: **Chat** **messages** **list**—each **message** **id** is a **key**.

**Intermediate Level**

**Keys** **identify** **which** **item** **instance** **corresponds** to **which** **fiber**—enabling **efficient** **reconciliation**.

**Expert Level**

**Keys** **do not** have to be **globally** **unique**—only **among** **siblings** in **that** **array**.

```tsx
{msgs.map((m) => <Message key={m.id} body={m.body} />)}
```

#### Key Points — What

- **Sibling** **scoped** **uniqueness**.
- **Not** **for** **styling**—use **regular** **props** for **that**.
- **Stability** across **reorders** matters.

---

### Why Keys Matter

**Beginner Level**

Without **correct** **keys**, React may **reuse** **DOM** **nodes** **wrongly**—**input** **values** **jump** **between** **rows**, **animations** **misfire**.

**Intermediate Level**

**State** **inside** **row** **components** **associates** with **position** if **keys** **wrong**—**dangerous** for **editable** **tables**.

**Expert Level**

**Reconciliation** **algorithm** uses **keys** to **minimize** **work**—**good** **keys** **improve** **performance** and **correctness**.

---

### Rules for Keys

**Beginner Level**

- **Stable**: same **item** → same **key** across **renders**.
- **Unique** among **siblings**.
- **Avoid** **random** **keys** **per** **render** (`Math.random()`).

**Intermediate Level**

**Do not** use **array** **index** when **list** **can** **reorder**, **insert**, **delete** at **middle**—**prefer** **ids**.

**Expert Level**

**Composite** **keys** when **items** lack **single** **id**: **`${parentId}:${localId}`**—ensure **still** **unique**.

---

### Choosing Good Keys

**Beginner Level**

**Database** **primary** **keys**, **UUIDs**, **server**-assigned **ids**—best.

**Real-time example**: **E-commerce** **order** **line** **id** from **API**.

**Intermediate Level**

**Client-generated** **`crypto.randomUUID()`** when **creating** **new** **rows** **offline-first**.

**Expert Level**

**Never** **derive** **key** from **data** that **changes** **when** **identity** **doesn’t** (e.g. **title** **text**).

---

### Index as Key Anti-pattern

**Beginner Level**

**`key={index}`** **works** for **static** **lists** **never** **reordered** **and** **immutable** **identity** **per** **position**—rare.

**Intermediate Level**

**Reordering** **todo** **items** with **index** **keys** causes **bugs** in **local** **state** **per** **row**.

**Expert Level**

**Even** **append-only** **feeds** may **insert** **at** **top**—**index** **shifts** **all**.

```tsx
// Risky: reordering breaks association
function Bad({ titles }: { titles: string[] }) {
  return (
    <ul>
      {titles.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}
```

---

### uuid / nanoid for Client Keys

**Beginner Level**

When **creating** **new** **rows** **without** **server** **id**, generate **`nanoid()`** or **`crypto.randomUUID()`** **once** at **creation**—**store** in **state**, **don’t** **regenerate** **each** **render**.

**Intermediate Level**

**Batch** **imports**: **assign** **ids** **when** **parsing** **CSV** in **admin** **tool**.

**Expert Level**

**Collision** **probability** with **UUID** is **negligible**—**still** **namespace** if **merging** **datasets**.

```tsx
import { nanoid } from "nanoid";

type DraftLine = { clientId: string; sku: string; qty: number };

function addLine(lines: DraftLine[]): DraftLine[] {
  return [...lines, { clientId: nanoid(), sku: "", qty: 1 }];
}
```

---

### Component Identity

**Beginner Level**

**Key** **identifies** **instance**—moving **key** **moves** **internal** **state** **with** it.

**Intermediate Level**

**Wrapping** **in** **`<Fragment key={id}>`** **groups** **multiple** **nodes** **under** **one** **keyed** **unit** (see below).

**Expert Level**

**Portals** and **animations** **libraries** may **require** **stable** **keys** for **FLIP** **animations**.

---

### Keys with Fragments

**Beginner Level**

**Short** **syntax** **`<>`** **cannot** take **`key`**—use **`<Fragment key={id}>`** **imported** **from** **`react`**.

**Real-time example**: **Dashboard** **split** **row** **into** **two** **cells** **without** **wrapper** **div**.

```tsx
import { Fragment } from "react";

function SplitRows({ rows }: { rows: { id: string; a: string; b: string }[] }) {
  return (
    <ul>
      {rows.map((r) => (
        <Fragment key={r.id}>
          <li>{r.a}</li>
          <li>{r.b}</li>
        </Fragment>
      ))}
    </ul>
  );
}
```

---

## 8.3 List Manipulation

### Adding Items

**Beginner Level**

**Immutable** **append**: **`setItems((xs) => [...xs, newItem])`** or **`[newItem, ...xs]`** for **prepend**.

**Real-time example**: **Todo** **add** **task**; **Chat** **append** **message** **on** **send**.

**Intermediate Level**

**Normalize** **byId** **maps** for **large** **collections**—**add** **entry** **immutably**.

**Expert Level**

**Optimistic** **UI**: **add** **temporary** **client** **id**, **replace** **on** **server** **ack**.

```tsx
type Msg = { id: string; text: string };

function appendMessage(msgs: Msg[], text: string): Msg[] {
  return [...msgs, { id: crypto.randomUUID(), text }];
}
```

---

### Removing Items

**Beginner Level**

**`filter`** **out** **by** **id**: **`items.filter(i => i.id !== id)`**.

**Intermediate Level**

**Immer** **`produce`** for **nested** **structures**.

**Expert Level**

**Soft** **delete** **flags** vs **hard** **remove**—**admin** **audit** **requirements**.

```tsx
function removeById<T extends { id: string }>(items: T[], id: string): T[] {
  return items.filter((x) => x.id !== id);
}
```

---

### Updating Items

**Beginner Level**

**`map`** **replace** **matching** **id**: **`items.map(i => i.id === id ? { ...i, ...patch } : i)`**.

**Real-time example**: **E-commerce** **cart** **line** **quantity** **change**.

---

### Filtering Lists

**Beginner Level**

**`items.filter(predicate)`** before **render** or **store** **filtered** **view** in **derived** **value** with **`useMemo`** if **expensive**.

**Real-time example**: **Dashboard** **filter** **tickets** **by** **assignee**.

```tsx
import { useMemo, useState } from "react";

type Ticket = { id: string; assignee: string; title: string };

export function TicketTable({ tickets }: { tickets: Ticket[] }) {
  const [assignee, setAssignee] = useState<string | "all">("all");

  const visible = useMemo(
    () => (assignee === "all" ? tickets : tickets.filter((t) => t.assignee === assignee)),
    [assignee, tickets]
  );

  return (
    <div>
      <select value={assignee} onChange={(e) => setAssignee(e.target.value as typeof assignee)}>
        <option value="all">All</option>
        <option value="ada">Ada</option>
      </select>
      <ul>
        {visible.map((t) => (
          <li key={t.id}>{t.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

### Sorting Lists

**Beginner Level**

**`[...items].sort((a,b) => ...)`** — **copy** **first**—**never** **mutate** **state** **array** **in** **place**.

**Intermediate Level**

**Stable** **sort** **considerations** for **equal** **keys**—**tie-break** with **id**.

**Real-time example**: **Weather** **favorites** **sorted** **by** **temperature** **or** **city** **name**.

```tsx
type CityTemp = { id: string; city: string; c: number };

function sortByTempDesc(cities: CityTemp[]): CityTemp[] {
  return [...cities].sort((a, b) => b.c - a.c || a.city.localeCompare(b.city));
}
```

---

### Pagination

**Beginner Level**

**Slice** **page**: **`items.slice(page * pageSize, page * pageSize + pageSize)`**.

**Intermediate Level**

**URL** **query** **`?page=`** for **shareable** **dashboard** **views**; **`useSearchParams`** in **React Router**.

**Expert Level**

**Cursor-based** **pagination** for **infinite** **feeds**—**stable** **keys** from **server** **cursors**.

```tsx
function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = page * pageSize;
  return items.slice(start, start + pageSize);
}
```

---

### Infinite Scroll

**Beginner Level**

**IntersectionObserver** on **sentinel** **element** at **list** **end**—**fetch** **next** **page**, **append** **with** **dedupe** **by** **id**.

**Intermediate Level**

**Avoid** **duplicate** **fetches** with **`loading`** **flags** and **abort** **controllers**.

**Real-time example**: **Social** **feed** **infinite** **scroll**.

```tsx
import { useEffect, useRef } from "react";

export function InfiniteSentinel({ onNear }: { onNear: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onNear();
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [onNear]);

  return <div ref={ref} aria-hidden="true" />;
}
```

---

### Virtualized Lists (react-window / react-virtualized)

**Beginner Level**

**Virtualization** **renders** **only** **visible** **rows**—**massive** **lists** **stay** **fast** (**10k+** **rows**).

**Intermediate Level**

**`react-window`**: **`FixedSizeList`** when **row** **height** **constant**; **`VariableSizeList`** when **heights** **differ**.

**Expert Level**

**Measure** **dynamic** **heights** with **`ResizeObserver`** or **cache**—**complex** **but** **necessary** for **chat** **logs** with **multiline** **messages**.

**Real-time example**: **Admin** **log** **viewer**, **e-commerce** **SKU** **tables**.

```tsx
import { FixedSizeList as List } from "react-window";

type Row = { id: string; title: string };

export function VirtualCatalog({ rows }: { rows: Row[] }) {
  return (
    <List height={600} itemCount={rows.length} itemSize={36} width="100%">
      {({ index, style }) => <div style={style}>{rows[index]?.title}</div>}
    </List>
  );
}
```

#### Key Points — Virtualization

- **Keys** **still** **matter** if **mapping** **inside** **row** **renderers**.
- **Overscan** **reduces** **flicker** on **fast** **scroll**.
- **Avoid** **inline** **object** **props** **to** **Row** **without** **memo**—**rerender** **cost**.

---

### List Manipulation Performance Notes

**Beginner Level**

**Derive** **filtered/sorted** **lists** in **render** for **small** **data**; **`useMemo`** when **cost** **matters**.

**Intermediate Level**

**Normalized** **state** (**byId**, **allIds**) **speeds** **updates** **and** **lookups** for **large** **datasets**.

**Expert Level**

**Web Workers** for **heavy** **sort/filter** **of** **big** **arrays**—**don’t** **block** **main** **thread**.

---

## Key Points (Chapter Summary)

- **`map`** **renders** **lists**; **always** **supply** **`key`** **per** **top-level** **sibling** **in** **the** **array**.
- **Keys** **must** be **stable** and **unique** **among** **siblings**—**avoid** **index** for **dynamic** **lists**.
- **Extract** **row** **components** for **readability** and **`memo`** **boundaries**.
- **Empty**, **loading**, and **error** **states** are **first-class** **UX** **concerns**.
- **Virtualize** **very** **long** **lists** with **`react-window`** / **`@tanstack/react-virtual`**.
- **Immutable** **updates** (**filter/map/slice**) keep **React** **change** **detection** **predictable**.

---

## Best Practices (Global)

- **Prefer** **server**-assigned **ids** for **keys**; **generate** **client** **ids** **once** **per** **entity** **creation**.
- **Use** **semantic** **HTML** **lists** (`<ul>`/`<li>`) for **actual** **lists**; **tables** for **tabular** **data** with **headers**.
- **Profile** before **`useMemo`** on **derived** **lists**—often **cheap**.
- **For** **infinite** **scroll**, **dedupe** **by** **id** and **handle** **race** **conditions** from **out-of-order** **network** **responses**.
- **Accessibility**: **virtualized** **lists** may need **`aria-setsize`** / **`aria-posinset`** patterns—**follow** **library** **docs**.
- **Test** **reorder** **interactions** when **using** **drag-and-drop**—**keys** and **state** **must** **align**.

---

## Common Mistakes to Avoid

- **`key={Math.random()}`** or **new** **uuid** **each** **render**—**kills** **reconciliation** and **state** **association**.
- **Index** **keys** with **reordering** **lists** containing **local** **state** **per** **row**.
- **Mutating** **arrays** **in** **place** (`sort` **without** **copy**, **`push`** **on** **state** **array**).
- **Omitting** **keys** **entirely**—**React** **warning** and **subtle** **bugs**.
- **Using** **non-unique** **keys** **among** **siblings** (duplicate **ids**).
- **Virtualizing** **without** **fixed** **approximate** **row** **height** **strategy**—**janky** **scroll** **jump**.
- **Assuming** **`key`** **prop** **arrives** **inside** **child** **props**—it **does** **not**; use **your** **own** **`id`** **prop** if **needed**.

---

### Reordering Lists and Keys (Drag and Drop)

**Beginner Level**

When **users** **reorder** **rows** (**todo** **list**, **kanban**), **keys** **must** **follow** **the** **item** **identity**, **not** **the** **slot**—**index** **keys** **break** **local** **state** **in** **inputs**.

**Intermediate Level**

Libraries like **`@dnd-kit`** or **`react-beautiful-dnd`** **animate** **moves**—**still** **key** by **stable** **`id`**.

**Expert Level**

**Optimistic** **reorder**: **update** **local** **array** **order** **immediately**, **rollback** **on** **failure**; **keys** **remain** **unchanged** **so** **React** **tracks** **nodes** **correctly**.

```tsx
import { arrayMove } from "@dnd-kit/sortable";

type Row = { id: string; title: string };

function reorderRows(rows: Row[], activeId: string, overId: string): Row[] {
  const oldIndex = rows.findIndex((r) => r.id === activeId);
  const newIndex = rows.findIndex((r) => r.id === overId);
  if (oldIndex < 0 || newIndex < 0) return rows;
  return arrayMove(rows, oldIndex, newIndex);
}
```

#### Key Points — Reordering

- **Stable** **ids** **always**.
- **Test** **drag** **with** **controlled** **inputs** **in** **rows**.
- **Handle** **server** **sync** **errors** **explicitly**.

---

### TanStack Virtual (Alternative API)

**Beginner Level**

**`@tanstack/react-virtual`** **virtualizes** **any** **scrollable** **container**—**headless** **API** vs **`FixedSizeList`**.

**Intermediate Level**

**Measure** **element** **with** **`virtualizer.measureElement`** for **dynamic** **row** **heights**.

**Expert Level**

**Works** **well** with **infinite** **query** **observers**—**append** **pages** **as** **user** **scrolls**.

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

export function TanStackVirtualList({ rows }: { rows: { id: string; label: string }[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
  });

  return (
    <div ref={parentRef} style={{ height: 400, overflow: "auto" }}>
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((vi) => (
          <div
            key={rows[vi.index]?.id}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${vi.start}px)`,
            }}
          >
            {rows[vi.index]?.label}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### react-virtualized vs react-window (Practical Notes)

**Beginner Level**

**`react-window`** is **smaller** and **actively** used for **simple** **fixed/variable** **lists**. **`react-virtualized`** historically **offered** **more** **widgets** (**Table**, **Grid**) but **heavier**.

**Intermediate Level**

For **new** **projects**, **consider** **`@tanstack/react-virtual`** for **flexibility** or **`react-window`** for **simplicity**.

**Expert Level**

**Multi-column** **grids** with **dynamic** **cell** **sizes** **often** **need** **custom** **measurement** **caching**—**budget** **engineering** **time** accordingly.

---

### Merging and Deduplicating Lists (Feeds)

**Beginner Level**

**Social** **feeds** **append** **pages**—**merge** **by** **`id`** **Set** to **avoid** **duplicate** **keys** **when** **user** **refreshes** **overlap**.

**Intermediate Level**

**Normalize** **posts** **`byId`** and **`allIds`** for **O(1)** **lookup** and **stable** **render** **order**.

**Expert Level**

**Gap** **handling** when **items** **deleted** **server-side**—**reconcile** **with** **cursor** **pagination** **contracts**.

```tsx
function mergeById<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
  const map = new Map<string, T>();
  for (const x of existing) map.set(x.id, x);
  for (const x of incoming) map.set(x.id, x);
  return [...map.values()];
}
```

---

### Accessibility for Long Lists

**Beginner Level**

**Announce** **result** **counts** (“**12** **results**”) with **`aria-live`** **polite** **region** when **filters** **change**.

**Intermediate Level**

**Virtualized** **lists** **may** **not** **render** **all** **nodes** in **DOM**—**screen** **reader** **experience** **differs**; **some** **apps** **offer** **non-virtual** **“** **accessible** **mode** **”**.

**Expert Level**

**Follow** **WAI-ARIA** **grid** **and** **listbox** **patterns** when **building** **data** **tables** with **keyboard** **navigation**.

---

### TypeScript Patterns for List Utilities

**Beginner Level**

**Generic** **`IdOf<T>`** **constraint**: **`type WithId = { id: string }`** **helper** **functions** **`removeById<T extends WithId>`**.

**Intermediate Level**

**Readonly** **arrays** **`readonly T[]`** in **props** when **components** **must** **not** **mutate**.

**Expert Level**

**Branded** **types** for **`ProductId`** vs **`UserId`** **prevent** **accidental** **mix-ups** in **large** **apps**.

```tsx
type Brand<T, B extends string> = T & { readonly __brand: B };
type ProductId = Brand<string, "ProductId">;

function keyOfProduct(id: ProductId): string {
  return id as unknown as string;
}
```

---

_End of Lists and Keys chapter._
