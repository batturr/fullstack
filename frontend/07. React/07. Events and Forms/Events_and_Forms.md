# Events and Forms (React + TypeScript)

**Events** in React are wrapped as **SyntheticEvents** for **cross-browser** consistency. **Forms** collect user input—**controlled** components tie inputs to **React state**; **uncontrolled** components rely on the **DOM**. This chapter uses **TypeScript** types for **handlers** and **form models**, with examples from **e-commerce checkout**, **social** **posts**, **dashboard** **filters**, **todo** lists, **weather** **search**, **chat** **composer**, and **admin** **CRUD** screens.

---

## 📑 Table of Contents

- [Events and Forms (React + TypeScript)](#events-and-forms-react--typescript)
  - [📑 Table of Contents](#-table-of-contents)
  - [7.1 Event Handling with TypeScript](#71-event-handling-with-typescript)
  - [7.2 Common Event Types](#72-common-event-types)
  - [7.3 Form Basics](#73-form-basics)
  - [7.4 Form Elements](#74-form-elements)
  - [7.5 Form State Management](#75-form-state-management)
  - [7.6 Form Validation](#76-form-validation)
  - [7.7 Form Libraries](#77-form-libraries)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices (Global)](#best-practices-global)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 7.1 Event Handling with TypeScript

### Synthetic Events

**Beginner Level**

React wraps **native DOM events** in **`SyntheticEvent`**—**pooling** (legacy behavior) and **normalized** **`target`** / **`currentTarget`**. In **TypeScript**, use **`React.ChangeEvent<T>`**, **`React.MouseEvent<T>`**, etc.

**Real-time example**: **E-commerce** **Add to cart** button **`onClick`** handler.

**Intermediate Level**

**`currentTarget`** is the element **the listener** is attached to; **`target`** may be a **child**—important for **bubbling** and **typing**.

**Expert Level**

**Passive** listeners and **pointer** events—React’s **synthetic** layer **delegates** at root; **native** **`addEventListener`** still available via **refs** when needed (**maps**, **third-party**).

```tsx
import type { MouseEvent } from "react";

export function AddToCartButton({ sku }: { sku: string }) {
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    void sku;
  };
  return (
    <button type="button" onClick={onClick}>
      Add {sku}
    </button>
  );
}
```

#### Key Points — Synthetic Events

- Prefer **React** types for **props** handlers.
- Know **`target`** vs **`currentTarget`**.
- **`preventDefault`** / **`stopPropagation`** work as on **native** events.

---

### Handler Naming

**Beginner Level**

Convention: **`handleClick`**, **`handleSubmit`**, **`onEmailChange`** for **internal** functions; **`onX`** for **props** **callbacks** passed **to** children.

**Real-time example**: **Dashboard** **`handleRangeChange`** updates **filter** state.

**Intermediate Level**

**Consistency** across codebase matters more than **one** **true** style—**document** team choice.

**Expert Level**

**Props** **`onChange`** **should not** be **confused** with **DOM** **`onChange`**—**composition** in **design systems** often **renames** to **`onValueChange`**.

```tsx
type Props = { onSave: (title: string) => void };

export function PostEditor({ onSave }: Props) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(title);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button type="submit">Post</button>
    </form>
  );
}
```

---

### Handler Types (TypeScript)

**Beginner Level**

Annotate as **`React.ChangeEventHandler<HTMLInputElement>`** or inline **`(e: React.ChangeEvent<HTMLInputElement>) => void`**.

**Intermediate Level**

**Extract** **`type FieldChange = React.ChangeEventHandler<HTMLInputElement>`** for **reuse** in **large** **forms**.

**Expert Level**

**Generics** for **custom** **components**: **`onChange?: (value: string) => void`** at **boundary**—**wrap** **native** event inside **component**.

```tsx
import type { ChangeEventHandler } from "react";

const handleSearch: ChangeEventHandler<HTMLInputElement> = (e) => {
  void e.target.value;
};
```

---

### Passing Arguments to Handlers

**Beginner Level**

**Bad**: **`onClick={addItem(item.id)}`** **invokes** immediately—use **`onClick={() => addItem(item.id)}`** or **`onClick={addItem.bind(null, item.id)}`**.

**Intermediate Level**

**Data attributes**: **`data-id`** on **button**, read **`e.currentTarget.dataset`**—**fewer** **closures**.

**Expert Level**

**Curried** **handlers**: **`const onSelect = (id: string) => () => { ... }`** for **stable** **identity** patterns in **lists**.

```tsx
function CartLines({ ids }: { ids: string[] }) {
  const remove = (id: string) => {
    void id;
  };

  return (
    <ul>
      {ids.map((id) => (
        <li key={id}>
          <button type="button" onClick={() => remove(id)}>
            Remove {id}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

---

### Event Object

**Beginner Level**

**`event.nativeEvent`** exposes **underlying** **DOM** event when **needed**.

**Intermediate Level**

**Async** **after** event: **`event.persist()`** was for **pooling**—**modern** React **does not** **pool** **events** the same way—still **copy** **fields** if you **defer** work.

**Expert Level**

**Batching** and **concurrent** updates—**don’t** **read** **`event.target.value`** **after** **await** without **capturing** first.

```tsx
async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const form = e.currentTarget;
  const file = (form.elements.namedItem("file") as HTMLInputElement).files?.[0];
  if (!file) return;
  await uploadFile(file);
}
```

---

### preventDefault

**Beginner Level**

**`e.preventDefault()`** stops **default browser action**—e.g. **form** **full page** **reload** on **submit**, **link** **navigation**.

**Real-time example**: **Chat** **composer** **Enter** to send—**prevent** **newline** in **some** designs (or **Ctrl+Enter**).

**Intermediate Level**

**Buttons** inside **forms**: **`type="button"`** vs **`submit`**—mis-typed **buttons** **submit** **unexpectedly**.

---

### stopPropagation

**Beginner Level**

**`e.stopPropagation()`** prevents **event** from **bubbling** to **parents**—**modal** **overlay** **click** vs **card** **click**.

**Intermediate Level**

**`stopPropagation`** does **not** **prevent** **default**—call **both** if needed.

**Expert Level**

**Portals** still **bubble** through **React** **tree**—understand **DOM** **hierarchy** vs **React** **hierarchy**.

```tsx
function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      role="presentation"
      className="backdrop"
      onClick={onClose}
    >
      <div
        role="dialog"
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
```

---

## 7.2 Common Event Types (TypeScript)

### MouseEvent

**Beginner Level**

**`React.MouseEvent<HTMLButtonElement>`** for **clicks**, **`clientX`**, **`clientY`**, **`button`**.

**Real-time example**: **Dashboard** **drag** **threshold** for **widget** **reorder** (with **pointer** events in **modern** apps).

```tsx
import type { MouseEvent } from "react";

function Inspector() {
  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    void (e.clientX + e.clientY);
  };
  return <div onMouseMove={onMouseMove} />;
}
```

---

### ChangeEvent

**Beginner Level**

**`React.ChangeEvent<HTMLInputElement>`** for **inputs**; use **`HTMLTextAreaElement`**, **`HTMLSelectElement`** as appropriate.

**Intermediate Level**

**`e.target.value`** is **`string`** for **most** inputs; **`checked`** is **boolean** for **checkboxes**.

```tsx
function EmailField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const handle: React.ChangeEventHandler<HTMLInputElement> = (e) => onChange(e.target.value);
  return <input type="email" value={value} onChange={handle} />;
}
```

---

### FormEvent

**Beginner Level**

**`React.FormEvent<HTMLFormElement>`** for **`onSubmit`**.

**Real-time example**: **E-commerce** **checkout** **form** **validation** on **submit**.

---

### FocusEvent

**Beginner Level**

**`onFocus`**, **`onBlur`**—**`React.FocusEvent<HTMLInputElement>`**.

**Intermediate Level**

**Focus** **trapping** in **modals**—**combine** with **keyboard** **handlers**.

---

### MouseEnter / MouseLeave

**Beginner Level**

**Enter/Leave** **bubble** differently than **`mouseover`/`mouseout`**—React **normalizes** to **`onMouseEnter`/`onMouseLeave`** **without** **heavy** bubbling to **children** in **typical** usage patterns (still know **DOM** **behavior** for **edge** cases).

**Real-time example**: **Social** **hover** **card** for **profile** **preview**.

---

### KeyboardEvent

**Beginner Level**

**`React.KeyboardEvent<HTMLInputElement>`** with **`e.key`**, **`e.code`**, **`e.shiftKey`**.

**Intermediate Level**

**`e.preventDefault()`** on **Space**/**Enter** for **custom** **buttons** **roles**.

```tsx
function SearchField() {
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.currentTarget.blur();
    }
  };
  return <input aria-label="Search" onKeyDown={onKeyDown} />;
}
```

---

### Keys (Keyboard)

**Beginner Level**

**`e.key === "Enter"`**—readable; **`e.code`** for **physical** key (layout-independent).

**Intermediate Level**

**Internationalization**: **`key`** may be **`Process`** for **IME** composition—**avoid** **shortcuts** during **composition** (`e.nativeEvent.isComposing`).

---

### TouchEvent

**Beginner Level**

**`React.TouchEvent`** for **`onTouchStart`**, **`touches`**, **`changedTouches`**.

**Real-time example**: **Mobile** **swipe** **carousel** on **product** **gallery**.

**Intermediate Level**

**Passive** **touch** listeners for **scroll** **performance**—may require **native** **ref** **attachment**.

---

### DragEvent

**Beginner Level**

**`React.DragEvent`** for **`onDragStart`**, **`onDrop`**, **`dataTransfer`**.

**Real-time example**: **Admin** **media** **library** **reorder** or **upload** **dropzone**.

```tsx
function Dropzone({ onFiles }: { onFiles: (files: FileList) => void }) {
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) onFiles(e.dataTransfer.files);
  };
  return (
    <div onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
      Drop files
    </div>
  );
}
```

---

## 7.3 Form Basics

### Controlled Components

**Beginner Level**

**Controlled**: React **state** is **source of truth**—**`<input value={x} onChange={...} />`**.

**Real-time example**: **Todo** **new task** **input**—**state** drives **value**.

**Intermediate Level**

**Single** **source** of truth simplifies **validation** and **reset** logic.

**Expert Level**

**Concurrent** **features**: **controlled** inputs **coordinate** with **React** **state** **updates** predictably.

```tsx
function ControlledSearch() {
  const [q, setQ] = useState("");
  return <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" />;
}
```

---

### Uncontrolled Components

**Beginner Level**

**Uncontrolled**: **DOM** holds **value**—use **`defaultValue`** and **`ref`** to **read**.

**Real-time example**: **File** **input** is often **uncontrolled**; **integrate** **third-party** **widgets**.

**Intermediate Level**

**Less** **React** **rerenders** on **every** **keystroke**—sometimes **performance** win for **huge** forms.

**Expert Level**

**Bridge** with **`useImperativeHandle`** or **form** **libraries** **register** **refs**.

```tsx
import { useRef } from "react";

function UncontrolledProfile() {
  const nameRef = useRef<HTMLInputElement>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(nameRef.current?.value ?? "");
  };

  return (
    <form onSubmit={onSubmit}>
      <input name="name" defaultValue="Ada" ref={nameRef} />
      <button type="submit">Save</button>
    </form>
  );
}
```

---

### Form Submission

**Beginner Level**

**`<form onSubmit={handler}>`** — **`handler`** calls **`preventDefault()`** for **SPA** **navigation** **prevention**.

**Real-time example**: **Login** **form** **POST** via **`fetch`** in **handler**.

---

### Form Reset

**Beginner Level**

**`<button type="reset">`** resets **uncontrolled** **defaults**; for **controlled**, **setState** to **initial** **values**.

**Intermediate Level**

**Libraries** expose **`reset()`** **imperatively**.

---

### Controlled vs Uncontrolled — Choosing

**Beginner Level**

**Controlled** when you need **instant** **validation**, **formatting**, **dependent** **fields**.

**Intermediate Level**

**Uncontrolled** when **integrating** **non-React** **inputs** or **minimal** **rerenders**.

**Expert Level**

**Hybrid**: **key** **remount** **trick** to **reset** **uncontrolled** **trees**.

---

## 7.4 Form Elements

### Text Inputs

**Beginner Level**

**`type="text"`**, **`email`**, **`password`**, **`search`**—**`value`/`onChange`** pattern.

**Real-time example**: **Weather** **city** **search** **field**.

```tsx
<input
  type="search"
  inputMode="search"
  autoComplete="address-level2"
  value={city}
  onChange={(e) => setCity(e.target.value)}
/>
```

---

### Textarea

**Beginner Level**

**`<textarea value={...} onChange={...} />`** — **`ChangeEvent<HTMLTextAreaElement>`**.

**Real-time example**: **Social** **post** **body** with **character** **count**.

---

### Select

**Beginner Level**

**`<select value={v} onChange={...}>`** with **`<option>`** children.

**Intermediate Level**

**Multi-select**: **`multiple`** + **`HTMLSelectElement`** **options**.

**Real-time example**: **E-commerce** **shipping** **country** **dropdown**.

```tsx
<select value={country} onChange={(e) => setCountry(e.target.value)}>
  <option value="US">United States</option>
  <option value="CA">Canada</option>
</select>
```

---

### Radio Buttons

**Beginner Level**

**Same** **`name`** **groups** **radios**; **`checked`** **controlled** by **`value === option`**.

**Real-time example**: **Payment** **method** **card** vs **PayPal**.

---

### Checkboxes

**Beginner Level**

**`type="checkbox"`** — **`checked`** **boolean** **`onChange`** **`e.target.checked`**.

**Real-time example**: **Todo** **done** **toggle**.

```tsx
<input
  type="checkbox"
  checked={done}
  onChange={(e) => setDone(e.target.checked)}
/>
```

---

### File Input

**Beginner Level**

**Often** **uncontrolled**—**`onChange`** read **`files`** from **`e.target.files`**.

**Intermediate Level**

**`accept`**, **`multiple`**, **`capture`** for **mobile** **camera**.

**Real-time example**: **Admin** **avatar** **upload**.

---

### Range

**Beginner Level**

**`type="range"`** — **`min`**, **`max`**, **`step`**; **value** is **string**/**number** depending on **browser**—**normalize** **`Number()`**.

**Real-time example**: **Dashboard** **priority** **slider** for **ticket**.

---

### Date / Time

**Beginner Level**

**`type="date"`**, **`time`**, **`datetime-local`**—**value** **format** **`YYYY-MM-DD`**.

**Intermediate Level**

**Timezones**: **prefer** **UTC** **storage** in **backend**; **use** **libraries** (**date-fns**, **Luxon**) for **complex** **scheduling**.

**Real-time example**: **Booking** **appointment** **picker** for **services** **dashboard**.

```tsx
<input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
```

---

## 7.5 Form State Management

### Single Field State

**Beginner Level**

**`useState`** per **field**—simple **login** **email**/**password**.

**Real-time example**: **Chat** **message** **input** **only**.

---

### Multiple Fields Object

**Beginner Level**

**`useState<Form>({ ... })`** — **update** with **spread** **`setForm({ ...form, field: x })`**.

**Intermediate Level**

**Type** **`Form`** **interface** for **compile-time** **safety**.

```tsx
interface CheckoutForm {
  name: string;
  address: string;
  city: string;
}

export function Checkout() {
  const [form, setForm] = useState<CheckoutForm>({ name: "", address: "", city: "" });

  const set =
    (key: keyof CheckoutForm): React.ChangeEventHandler<HTMLInputElement> =>
    (e) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <form>
      <input value={form.name} onChange={set("name")} />
      <input value={form.address} onChange={set("address")} />
      <input value={form.city} onChange={set("city")} />
    </form>
  );
}
```

---

### Dynamic Fields

**Beginner Level**

**Array** of **fields**—**add**/**remove** **lines** for **e-commerce** **gift** **messages** or **phone** **numbers**.

**Intermediate Level**

**Stable `key` per row**—avoid **index** as **key** when **reordering** (see Lists chapter).

---

### Form Arrays

**Beginner Level**

**State**: **`items: LineItem[]`**—**map** to **inputs**.

**Real-time example**: **Invoice** **line** **items** in **admin** **panel**.

---

### Nested Data

**Beginner Level**

**`address.line1`**, **`address.postcode`**—**immutable** **updates** with **spread** at **each** **level** or **Immer**.

**Intermediate Level**

**Normalize** **deep** **structures** for **easier** **updates** and **reuse**.

```tsx
type Address = { line1: string; zip: string };

export function NestedAddress({ value, onChange }: { value: Address; onChange: (a: Address) => void }) {
  return (
    <>
      <input
        value={value.line1}
        onChange={(e) => onChange({ ...value, line1: e.target.value })}
      />
      <input
        value={value.zip}
        onChange={(e) => onChange({ ...value, zip: e.target.value })}
      />
    </>
  );
}
```

---

## 7.6 Form Validation

### Client-side Validation

**Beginner Level**

**Validate** on **`submit`** or **`onBlur`**—**set** **error** **strings** in **state**.

**Real-time example**: **E-commerce** **card** **number** **length** **check**.

---

### Field-level Validation

**Beginner Level**

**Per-field** **errors** **`errors.email`**.

**Intermediate Level**

**Validate** **onChange** after **first** **blur** (“**touched**” **pattern**).

---

### Form-level Validation

**Beginner Level**

**Cross-field** rules: **password** **confirmation**, **date** **range** **order**.

**Real-time example**: **Dashboard** **report** **start** **≤** **end** **date**.

---

### Error Messages

**Beginner Level**

**Associate** **`aria-describedby`** with **error** **elements** for **accessibility**.

**Intermediate Level**

**Summarize** **errors** at **top** of **form** for **screen** **readers** (**live** **region**).

---

### Yup / Zod

**Beginner Level**

**Zod**: **schema** **`z.object({ email: z.string().email() })`** — **infer** **TypeScript** **types** with **`z.infer`**.

**Intermediate Level**

**Integrate** with **React Hook Form** **`resolver`**.

**Expert Level**

**`.superRefine`** for **async** **server** **validation** (**email** **taken**).

```tsx
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  age: z.coerce.number().min(18),
});

export type Signup = z.infer<typeof schema>;
```

---

### HTML5 Validation

**Beginner Level**

**`required`**, **`minLength`**, **`pattern`**, **`type="email"`** — **browser** **tooltips** **before** **JS**.

**Intermediate Level**

**`noValidate`** on **form** to **take** **full** **control** with **JS**/**libraries**.

**Expert Level**

**Customize** **CSS** **`:invalid`** carefully—**often** **prefer** **explicit** **error** **UI**.

---

## 7.7 Form Libraries

### React Hook Form

**Beginner Level**

**Minimal** **rerenders**—**uncontrolled** **by** **default** with **refs**; **`register`** **API**.

**Real-time example**: **Large** **dashboard** **settings** **form**.

**Intermediate Level**

**`Controller`** for **controlled** **components** (**MUI**, **Chakra**).

**Expert Level**

**Schema** **resolvers** (**Zod**) for **typed** **errors**.

```tsx
import { useForm } from "react-hook-form";

type Values = { title: string };

export function RHFPost() {
  const { register, handleSubmit } = useForm<Values>({ defaultValues: { title: "" } });
  const onSubmit = (data: Values) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("title", { required: true })} />
      <button type="submit">Save</button>
    </form>
  );
}
```

---

### Formik

**Beginner Level**

**Form-wide** **state** **with** **`values`**, **`errors`**, **`touched`**—**controlled** **approach**.

**Intermediate Level**

**`<Field>`**, **`<Form>`** **components**—**verbose** but **explicit**.

**Real-time example**: **Legacy** **enterprise** **apps** **often** **use** **Formik**.

---

### Final Form

**Beginner Level**

**Subscription-based** **fine-grained** **updates**—**good** **performance** **characteristics**.

**Intermediate Level**

**Less** **common** in **greenfield** **2025** **React** **projects** vs **RHF**/**TanStack** **Form**.

---

### When to Use Which Library

**Beginner Level**

**Small** **forms**: **native** **`useState`** **may** **suffice**.

**Intermediate Level**

**React Hook Form**: **performance** + **DX** for **many** **fields**; **Zod** **pairing**.

**Expert Level**

**TanStack Form** for **framework-agnostic** **ambitions**; **Remix**/**Next** **use** **server** **actions** + **progressive** **enhancement** patterns.

```tsx
// Decision matrix (simplified)
// 1-3 fields: useState + Zod on submit
// 4+ fields / complex validation: React Hook Form + Zod
// Highly dynamic wizard with nested routes: consider state machines + RHF
```

---

## Key Points (Chapter Summary)

- **Type** **events** with **React**’s **`SyntheticEvent`** **specializations**.
- **Controlled** **inputs** **centralize** **truth**; **uncontrolled** **fits** **certain** **integrations**.
- **Forms** **scale** with **typed** **models**, **immutable** **updates**, and **schema** **validation**.
- **Accessibility**: **labels**, **`aria-*`**, **keyboard** **support**, **focus** **management**.
- **Libraries** **reduce** **boilerplate**—**choose** based on **rerender** **needs** and **team** **familiarity**.

---

## Best Practices (Global)

- **Prefer** **`type="button"`** **unless** **submitting** a **form**.
- **preventDefault** on **`form`** **submit** **handlers** in **SPAs**.
- **Debounce** **search** **inputs** hitting **APIs** (**weather**, **catalog**).
- **Normalize** **file** **uploads** with **clear** **size**/**type** **rules** and **progress** **UI**.
- **Validate** **on** **server** **always**—**client** **validation** is **UX**, not **security**.
- **Use** **Zod**/**Yup** for **shared** **schemas** between **client** and **server** when possible.
- **Test** **forms** with **Testing Library**—**query** by **label** **text**.

---

## Common Mistakes to Avoid

- **`onClick={fn()}`** **immediate** **invocation** **mistake**.
- **Wrong** **event** **types** for **elements** (**textarea** vs **input**).
- **Missing** **`preventDefault`** on **`submit`** → **full** **page** **reload**.
- **Uncontrolled** **file** **inputs** **mixed** with **wrong** **reset** **patterns**.
- **Async** **validation** **without** **pending**/**error** **UI**.
- **Deep** **nested** **state** **updates** **without** **helpers** (**Immer**) → **bugs**.
- **Assuming** **browser** **validation** is **enough** for **security** or **data** **integrity**.

---

_End of Events and Forms chapter._
