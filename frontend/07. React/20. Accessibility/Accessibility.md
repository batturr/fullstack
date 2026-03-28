# Accessibility (React + TypeScript)

**Accessibility** **(a11y)** **ensures** **people** **using** **keyboard**, **screen** **readers**, **voice** **control**, **or** **low** **vision** **settings** **can** **use** **your** **product**—**whether** **it** **is** **an** **e-commerce** **store**, **social** **network**, **analytics** **dashboard**, **todo** **app**, **weather** **site**, **or** **real-time** **chat**. **React** **helps** **you** **compose** **UI**, **but** **accessible** **HTML**, **ARIA**, **focus**, **and** **testing** **must** **be** **explicit**. **TypeScript** **does** **not** **enforce** **a11y** **at** **compile** **time**; **linters**, **libraries**, **and** **manual** **checks** **do**.

---

## 📑 Table of Contents

- [Accessibility (React + TypeScript)](#accessibility-react--typescript)
  - [📑 Table of Contents](#-table-of-contents)
  - [20.1 Accessibility Basics](#201-accessibility-basics)
  - [20.2 Accessible Components](#202-accessible-components)
  - [20.3 Focus Management](#203-focus-management)
  - [20.4 Screen Reader Support](#204-screen-reader-support)
  - [20.5 Accessibility Testing](#205-accessibility-testing)
  - [20.6 Accessibility Libraries](#206-accessibility-libraries)
  - [Key Points (Chapter Summary)](#key-points-chapter-summary)
  - [Best Practices (Global)](#best-practices-global)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 20.1 Accessibility Basics

### Why Accessibility Matters

**Beginner Level**

**Accessible** **apps** **reach** **more** **users**, **including** **people** **with** **disabilities** **and** **situational** **limitations** **(bright** **sunlight**, **no** **audio**, **one** **hand)**. **Semantic** **HTML** **often** **gives** **you** **keyboard** **and** **screen** **reader** **support** **for** **free**.

**Real-time example**: **E-commerce** **checkout** **must** **be** **usable** **without** **a** **mouse** **so** **customers** **can** **complete** **purchases** **with** **keyboard** **or** **switch** **devices**.

**Intermediate Level**

**Legal** **requirements** **(e.g.**, **ADA**, **EAA)** **and** **procurement** **policies** **increasingly** **require** **WCAG** **conformance**. **Accessibility** **defects** **are** **product** **defects**, **not** **nice-to-haves**.

**Expert Level**

**Inclusive** **design** **improves** **UX** **for** **everyone**: **clear** **focus**, **predictable** **tab** **order**, **and** **consistent** **labels** **reduce** **errors** **in** **high-stakes** **dashboards** **and** **chat** **moderation** **tools**.

```tsx
// Good baseline: real button, not a clickable div
export function AddToCartButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}>
      Add to cart
    </button>
  );
}
```

#### Key Points — Why Accessibility Matters

- **More** **users**, **lower** **support** **burden**, **better** **SEO** **(semantic** **content)**.
- **Keyboard** **and** **screen** **reader** **support** **are** **core** **quality** **bars**.

---

### WCAG Guidelines

**Beginner Level**

**Web** **Content** **Accessibility** **Guidelines** **(WCAG)** **define** **testable** **success** **criteria**. **Levels** **A**, **AA**, **AAA** **increase** **strictness**; **many** **orgs** **target** **AA**.

**Real-time example**: **Social** **media** **post** **composer** **needs** **labels**, **contrast**, **and** **error** **identification** **(WCAG** **form** **requirements)**.

**Intermediate Level**

**Four** **principles**: **Perceivable**, **Operable**, **Understandable**, **Robust** **(POUR)**. **Examples**: **text** **alternatives** **for** **images**, **minimum** **contrast**, **keyboard** **access**, **consistent** **navigation**.

**Expert Level**

**Map** **requirements** **to** **your** **design** **system** **tokens** **(color**, **spacing**, **typography)** **and** **automate** **checks** **in** **CI**.

```typescript
// Document targets in your design system README / ADR
export const a11yTargets = {
  wcagLevel: "AA" as const,
  minContrastRatio: { normalText: 4.5, largeText: 3 },
};
```

#### Key Points — WCAG

- **AA** **is** **a** **common** **contract** **with** **stakeholders**.
- **WCAG** **is** **not** **only** **about** **blind** **users**—**it** **covers** **motor**, **cognitive**, **and** **sensory** **needs**.

---

### ARIA Attributes

**Beginner Level**

**ARIA** **(Accessible** **Rich** **Internet** **Applications)** **attributes** **expose** **roles**, **states**, **and** **properties** **to** **assistive** **technologies** **when** **native** **HTML** **is** **insufficient**.

**Real-time example**: **Dashboard** **live** **region** **announces** **“** **Export** **complete** **”** **for** **screen** **reader** **users**.

**Intermediate Level**

**First** **rule** **of** **ARIA**: **don’t** **use** **ARIA** **if** **native** **HTML** **can** **do** **the** **job**. **Second** **rule**: **don’t** **break** **native** **semantics**.

**Expert Level**

**Incorrect** **ARIA** **can** **make** **things** **worse** **than** **no** **ARIA**—**test** **with** **screen** **readers** **and** **automated** **tools**.

```tsx
export function SearchField({ busy }: { busy: boolean }) {
  return (
    <div>
      <label htmlFor="q">Search products</label>
      <input id="q" aria-busy={busy} aria-invalid={false} />
    </div>
  );
}
```

#### Key Points — ARIA

- **Prefer** **native** **elements**.
- **Use** **ARIA** **to** **fill** **gaps** **in** **custom** **widgets**.

---

### Semantic HTML

**Beginner Level**

**Use** **`<button>`** **for** **actions**, **`<a href>`** **for** **navigation**, **`<main>`**, **`<nav>`**, **`<header>`**, **`<footer>`**, **headings** **`h1–h6`** **in** **order**.

**Real-time example**: **Weather** **app** **uses** **`main`** **for** **forecast** **content** **and** **`nav`** **for** **city** **links**.

**Intermediate Level**

**Headings** **outline** **the** **page** **for** **screen** **reader** **users** **navigating** **by** **headings**.

**Expert Level**

**Avoid** **`div`** **soup** **for** **interactive** **controls**—**it** **forces** **extra** **ARIA** **and** **keyboard** **handling**.

```tsx
export function WeatherPage() {
  return (
    <main>
      <h1>Forecast</h1>
      <section aria-labelledby="today-heading">
        <h2 id="today-heading">Today</h2>
        <p>Clear skies</p>
      </section>
    </main>
  );
}
```

#### Key Points — Semantic HTML

- **Semantics** **enable** **built-in** **keyboard** **and** **AT** **behavior**.
- **Heading** **levels** **should** **not** **skip** **arbitrarily**.

---

### Keyboard Navigation

**Beginner Level**

**All** **interactive** **controls** **must** **be** **reachable** **with** **`Tab`**, **activated** **with** **`Enter`/`Space`** **(buttons)**, **and** **escapable** **(modals)**.

**Real-time example**: **Todo** **list** **checkboxes** **and** **“** **Delete** **”** **buttons** **work** **without** **a** **mouse**.

**Intermediate Level**

**Custom** **widgets** **need** **documented** **keyboard** **models** **(roving** **tabindex**, **arrow** **keys** **in** **menus)**.

**Expert Level**

**Match** **ARIA** **Authoring** **Practices** **Guide** **patterns** **for** **combobox**, **listbox**, **tabs**, **dialog**.

```tsx
// Native elements already support keyboard activation
export function FollowButton() {
  return (
    <button type="button" onClick={() => {}}>
      Follow
    </button>
  );
}
```

#### Key Points — Keyboard Navigation

- **Never** **remove** **focus** **outlines** **without** **replacing** **them** **(see** **§20.3)**.
- **Document** **shortcuts** **that** **might** **conflict** **with** **AT**.

---

## 20.2 Accessible Components

### Accessible Forms

**Beginner Level**

**Associate** **labels** **with** **controls** **using** **`htmlFor`/`id`**. **Surface** **errors** **in** **text** **near** **the** **field** **and** **link** **with** **`aria-describedby`**.

**Real-time example**: **E-commerce** **shipping** **form** **shows** **“** **ZIP** **code** **required** **”** **next** **to** **the** **field**.

**Intermediate Level**

**Group** **related** **inputs** **with** **`<fieldset>`/`legend>`** **or** **`role="group"`** **with** **`aria-labelledby`**.

**Expert Level**

**Don’t** **rely** **only** **on** **color** **for** **errors**—**include** **text** **and** **`aria-invalid`**.

```tsx
type Props = {
  id: string;
  label: string;
  error?: string;
};

export function TextField({ id, label, error }: Props) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />
      {error ? (
        <p id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
```

#### Key Points — Forms

- **Labels**, **errors**, **and** **help** **text** **must** **be** **programmatically** **related**.
- **Validate** **on** **submit** **and** **provide** **clear** **recovery**.

---

### Accessible Buttons

**Beginner Level**

**Use** **`<button>`** **for** **in-page** **actions**. **Visible** **text** **or** **`aria-label`** **for** **icon-only** **buttons**.

**Real-time example**: **Chat** **“** **Send** **”** **and** **icon-only** **“** **Attach** **file** **”** **with** **accessible** **name**.

**Intermediate Level**

**`disabled`** **buttons** **should** **include** **explanation** **if** **the** **reason** **is** **not** **obvious** **(tooltip** **+** **`aria-describedby`)**.

**Expert Level**

**Toggle** **buttons** **use** **`aria-pressed`** **or** **switch** **semantics** **when** **appropriate**.

```tsx
export function IconButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick}>
      <PaperclipIcon aria-hidden="true" focusable="false" />
    </button>
  );
}
```

#### Key Points — Buttons

- **Icon** **buttons** **need** **names**.
- **Don’t** **use** **`div`** **with** **`onClick`** **without** **keyboard** **support**.

---

### Accessible Links

**Beginner Level**

**Use** **`<a href>`** **for** **navigation** **and** **`button`** **for** **actions** **that** **don’t** **navigate**. **Link** **text** **should** **make** **sense** **out** **of** **context** **(avoid** **“** **click** **here** **”)**.

**Real-time example**: **Social** **“** **View** **profile** **of** **Asha** **”** **instead** **of** **“** **here** **”**.

**Intermediate Level**

**If** **using** **client-side** **routing**, **still** **render** **a** **real** **`<a>`** **(React** **Router** **`Link`)** **for** **semantics**.

**Expert Level**

**Indicate** **external** **links** **visually** **and** **in** **text** **or** **`aria-label`**.

```tsx
import { Link } from "react-router-dom";

export function ProductLink({ id, name }: { id: string; name: string }) {
  return (
    <Link to={`/product/${id}`}>
      <span className="sr-only">Product:</span> {name}
    </Link>
  );
}
```

#### Key Points — Links

- **Meaningful** **link** **text** **is** **a** **WCAG** **requirement**.
- **Prefer** **native** **navigation** **semantics**.

---

### Images and alt Text

**Beginner Level**

**Informative** **images** **need** **`alt`** **describing** **purpose**. **Decorative** **images** **use** **`alt=""`** **and** **`aria-hidden`** **on** **SVG** **icons**.

**Real-time example**: **Weather** **icons** **with** **`alt="Cloudy"`** **or** **decorative** **if** **text** **duplicates** **condition**.

**Intermediate Level**

**Charts** **need** **text** **summaries** **or** **data** **tables** **as** **alternatives**.

**Expert Level**

**Complex** **graphics** **may** **require** **`longdesc`** **(rare)** **or** **inline** **explanations**.

```tsx
export function ProductImage({ alt, src }: { alt: string; src: string }) {
  return <img src={src} alt={alt} loading="lazy" />;
}
```

#### Key Points — Images

- **`alt`** **is** **required** **for** **`img`** **(can** **be** **empty** **only** **when** **decorative)**.
- **Don’t** **stuff** **keywords** **into** **`alt`**.

---

### Accessible Modals

**Beginner Level**

**Modal** **dialogs** **use** **`role="dialog"`** **(or** **`<dialog>`)** **with** **`aria-modal="true"`**, **`aria-labelledby`** **or** **`aria-label`**, **focus** **trap**, **and** **Escape** **to** **close** **(if** **appropriate)**.

**Real-time example**: **E-commerce** **“** **Confirm** **remove** **from** **cart** **”** **modal**.

**Intermediate Level**

**Return** **focus** **to** **the** **trigger** **on** **close**.

**Expert Level**

**Use** **libraries** **(Radix** **Dialog**, **React** **Aria** **Modal)** **to** **implement** **focus** **management** **correctly**.

```tsx
// Illustrative—prefer library primitives for focus trap + scroll lock
export function ConfirmDialog({ title, open }: { title: string; open: boolean }) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <h2 id="confirm-title">{title}</h2>
      <button type="button">Cancel</button>
      <button type="button">Confirm</button>
    </div>
  );
}
```

#### Key Points — Modals

- **Focus** **trap** **and** **restore** **are** **non-negotiable** **for** **most** **dialogs**.
- **Background** **content** **should** **be** **inert** **(often** **handled** **by** **libraries)**.

---

### Accessible Dropdowns

**Beginner Level**

**Menus** **and** **listboxes** **need** **keyboard** **support**: **arrow** **keys**, **`Home`/`End`**, **`Escape`**, **type-ahead**. **Buttons** **disclose** **with** **`aria-expanded`** **and** **`aria-controls`**.

**Real-time example**: **Dashboard** **“** **Export** **as…** **”** **menu**.

**Intermediate Level**

**Use** **`role="menu"`** **only** **for** **true** **menus** **(action** **lists)**, **not** **every** **popover**.

**Expert Level**

**Combobox** **pattern** **for** **searchable** **selects**—**follow** **ARIA** **APG** **examples**.

```tsx
export function MenuButton({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {label}
      </button>
      {open ? (
        <ul role="menu">
          <li role="menuitem">CSV</li>
          <li role="menuitem">PDF</li>
        </ul>
      ) : null}
    </div>
  );
}
```

#### Key Points — Dropdowns

- **Don’t** **under-implement** **keyboard** **behavior**.
- **Prefer** **headless** **libraries** **for** **complex** **widgets**.

---

### Accessible Tabs

**Beginner Level**

**Tabs** **pair** **`role="tablist"`**, **`role="tab"`**, **`role="tabpanel"`** **with** **`aria-selected`**, **`aria-controls`**, **`id`/`aria-labelledby`** **linking**.

**Real-time example**: **Social** **profile** **sections** **Posts** **/** **Media** **/** **About**.

**Intermediate Level**

**Arrow** **keys** **move** **between** **tabs** **in** **many** **patterns** **(roving** **tabindex)**.

**Expert Level**

**Activate** **tab** **panel** **visibility** **with** **CSS** **and** **`hidden`** **attribute** **appropriately**.

```tsx
export function TabStrip({ tabs }: { tabs: { id: string; label: string }[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  return (
    <div>
      <div role="tablist" aria-label="Profile sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            id={`tab-${t.id}`}
            aria-controls={`panel-${t.id}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <section key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={active !== t.id}>
          {/* content */}
        </section>
      ))}
    </div>
  );
}
```

#### Key Points — Tabs

- **Wire** **tab** **↔** **panel** **with** **IDs**.
- **Consider** **library** **primitives** **for** **keyboard** **behavior**.

---

## 20.3 Focus Management

### Focus States

**Beginner Level**

**Visible** **focus** **indicators** **help** **keyboard** **users** **see** **where** **they** **are**. **Don’t** **remove** **`outline`** **without** **a** **replacement** **that** **meets** **contrast**.

**Real-time example**: **Todo** **app** **list** **items** **show** **clear** **focus** **rings**.

**Intermediate Level**

**`:focus-visible`** **shows** **focus** **styles** **for** **keyboard** **users** **while** **reducing** **noise** **for** **mouse** **users**.

**Expert Level**

**Design** **tokens** **should** **include** **focus** **ring** **color** **and** **offset**.

```css
/* Example only—use your design system */
:focus-visible {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
}
```

#### Key Points — Focus States

- **Never** **use** **`outline: none`** **without** **substitute**.
- **`:focus-visible`** **is** **preferred** **for** **modern** **browsers**.

---

### Focus Trapping

**Beginner Level**

**When** **a** **modal** **opens**, **keyboard** **focus** **should** **stay** **inside** **until** **closed**.

**Real-time example**: **Chat** **image** **lightbox** **modal**.

**Intermediate Level**

**Focus** **the** **first** **focusable** **element** **or** **the** **dialog** **container** **on** **open**.

**Expert Level**

**Use** **tested** **libraries** **or** **`focus-trap-react`** **with** **care** **for** **portals**.

```tsx
// Prefer Radix/ React Aria for production traps
export function trapFocus(root: HTMLElement) {
  const focusables = root.querySelectorAll<HTMLElement>(
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
  return { first: focusables[0], last: focusables[focusables.length - 1] };
}
```

#### Key Points — Focus Trapping

- **Required** **for** **modals**, **drawers**, **non-modal** **dialogs** **need** **different** **patterns**.

---

### Focus Return

**Beginner Level**

**When** **a** **dialog** **closes**, **return** **focus** **to** **the** **element** **that** **opened** **it**.

**Real-time example**: **E-commerce** **quick** **view** **modal** **returns** **to** **product** **card** **“** **Quick** **view** **”**.

**Intermediate Level**

**Store** **a** **ref** **to** **the** **previously** **focused** **element** **on** **open**.

**Expert Level**

**Handle** **nested** **dialogs** **with** **a** **stack** **of** **previous** **focus** **targets**.

#### Key Points — Focus Return

- **Prevents** **users** **from** **losing** **their** **place** **in** **the** **page**.

---

### Skip Links

**Beginner Level**

**A** **“** **Skip** **to** **main** **content** **”** **link** **at** **the** **top** **of** **the** **page** **lets** **keyboard** **users** **jump** **past** **repetitive** **navigation**.

**Real-time example**: **Dashboard** **with** **long** **sidebar** **nav**.

**Intermediate Level**

**Hide** **skip** **link** **visually** **until** **focused** **(`.sr-only:focus`** **pattern)**.

**Expert Level**

**Ensure** **the** **target** **`main`** **has** **`tabindex="-1"`** **if** **needed** **for** **programmatic** **focus**.

```tsx
export function SkipNav() {
  return (
    <a className="skip-link" href="#main">
      Skip to main content
    </a>
  );
}
```

#### Key Points — Skip Links

- **Cheap** **win** **for** **keyboard** **users** **on** **busy** **layouts**.

---

### Focus Visible vs Focus

**Beginner Level**

**`:focus`** **matches** **any** **focus**, **including** **mouse** **clicks**. **`:focus-visible`** **heuristically** **matches** **keyboard-like** **focus**.

**Real-time example**: **Social** **comment** **composer** **shows** **subtle** **focus** **for** **mouse**, **strong** **ring** **for** **keyboard**.

**Intermediate Level**

**Combine** **with** **`:focus:not(:focus-visible)`** **to** **suppress** **outlines** **for** **mouse** **only** **if** **your** **design** **requires** **it**.

**Expert Level**

**Don’t** **break** **Windows** **High** **Contrast** **mode** **or** **forced** **colors**—**test** **in** **those** **modes**.

#### Key Points — Focus vs Focus-Visible

- **Improves** **perceived** **polish** **without** **hurting** **keyboard** **users**.

---

## 20.4 Screen Reader Support

### aria-label

**Beginner Level**

**`aria-label`** **provides** **an** **accessible** **name** **when** **no** **visible** **label** **exists** **or** **when** **icon-only**.

**Real-time example**: **Weather** **“** **refresh** **”** **icon** **button**.

**Intermediate Level**

**Prefer** **visible** **text** **when** **possible**—**hidden** **labels** **can** **reduce** **discoverability** **for** **sighted** **users**.

**Expert Level**

**Avoid** **duplicating** **visible** **text** **in** **`aria-label`** **unless** **clarifying** **context**.

```tsx
<button type="button" aria-label="Refresh forecast">
  <RefreshIcon aria-hidden="true" />
</button>
```

#### Key Points — aria-label

- **Names** **must** **be** **concise** **and** **unique** **where** **needed**.

---

### aria-labelledby

**Beginner Level**

**`aria-labelledby`** **points** **to** **one** **or** **more** **IDs** **that** **label** **this** **element**.

**Real-time example**: **Dashboard** **chart** **titled** **by** **a** **visible** **heading** **elsewhere**.

**Intermediate Level**

**Can** **combine** **multiple** **IDs** **for** **compound** **labels**.

**Expert Level**

**Ensure** **referenced** **elements** **are** **not** **`hidden`** **in** **ways** **that** **remove** **them** **from** **the** **accessibility** **tree** **inappropriately**.

```tsx
<section aria-labelledby="sales-heading">
  <h2 id="sales-heading">Sales</h2>
  <canvas aria-label="Sales chart" />
</section>
```

#### Key Points — aria-labelledby

- **Prefer** **visible** **headings** **for** **section** **labels**.

---

### aria-describedby

**Beginner Level**

**`aria-describedby`** **references** **additional** **help** **text** **or** **error** **messages**.

**Real-time example**: **E-commerce** **password** **field** **with** **requirements** **paragraph**.

**Intermediate Level**

**Combine** **with** **`role="alert"`** **for** **dynamic** **errors** **(careful** **with** **verbosity)**.

**Expert Level**

**Ensure** **help** **text** **is** **actually** **helpful** **and** **updated** **when** **validation** **changes**.

```tsx
<p id="pw-help">Use at least 12 characters.</p>
<input type="password" aria-describedby="pw-help" />
```

#### Key Points — aria-describedby

- **Links** **instructions** **to** **inputs** **for** **AT**.

---

### ARIA Live Regions

**Beginner Level**

**`aria-live`** **regions** **announce** **dynamic** **updates** **to** **screen** **readers** **(`polite`** **or** **`assertive`)**.

**Real-time example**: **Chat** **“** **Asha** **is** **typing…** **”** **status**.

**Intermediate Level**

**`aria-atomic`** **controls** **whether** **the** **whole** **region** **is** **read** **or** **only** **changes**.

**Expert Level**

**Avoid** **over-announcement** **that** **interrupts** **users**—**default** **to** **`polite`**.

```tsx
export function UploadStatus({ message }: { message: string }) {
  return (
    <p aria-live="polite" aria-atomic="true">
      {message}
    </p>
  );
}
```

#### Key Points — Live Regions

- **Great** **for** **async** **status** **without** **moving** **focus**.

---

### Role Attributes

**Beginner Level**

**`role`** **sets** **the** **accessible** **role** **when** **native** **semantics** **are** **insufficient** **(use** **sparingly)**.

**Real-time example**: **`role="status"`** **for** **inline** **notifications**.

**Intermediate Level**

**Don’t** **override** **native** **roles** **incorrectly** **(e.g.**, **`role="button"`** **on** **`a`** **without** **href)**.

**Expert Level**

**Follow** **ARIA** **spec** **for** **required** **owned** **elements** **(e.g.**, **`menu`** **owns** **`menuitem`)**.

```tsx
<div role="status" aria-live="polite">
  Saved
</div>
```

#### Key Points — Role Attributes

- **Prefer** **native** **elements** **first**.
- **Custom** **roles** **require** **complete** **keyboard** **and** **ARIA** **structure**.

---

### Screen Reader Testing

**Beginner Level**

**Test** **with** **VoiceOver** **(macOS/iOS)**, **NVDA** **(Windows)**, **or** **JAWS** **on** **real** **scenarios** **(forms**, **navigation)**.

**Real-time example**: **Todo** **app** **task** **checkboxes** **announce** **state** **correctly**.

**Intermediate Level**

**Learn** **basic** **screen** **reader** **navigation** **(rotor**, **landmarks**, **headings)**.

**Expert Level**

**Test** **with** **different** **browsers** **(Chrome+NVDA** **is** **common)** **and** **mobile** **VoiceOver**.

#### Key Points — Screen Reader Testing

- **Automation** **cannot** **catch** **everything**.
- **Schedule** **regular** **manual** **passes** **before** **major** **releases**.

---

## 20.5 Accessibility Testing

### axe DevTools

**Beginner Level**

**axe** **browser** **extension** **scans** **pages** **for** **many** **WCAG-related** **issues** **with** **clear** **explanations**.

**Real-time example**: **Dashboard** **release** **candidate** **scan** **before** **ship**.

**Intermediate Level**

**Integrate** **axe-core** **in** **E2E** **(Playwright/Cypress)** **for** **regression** **guards**.

**Expert Level**

**Tune** **rules** **to** **avoid** **noise**, **but** **don’t** **disable** **rules** **without** **justification**.

```typescript
// Playwright + @axe-core/playwright (conceptual)
// await injectAxe(page); await checkA11y(page);
```

#### Key Points — axe DevTools

- **Fast** **feedback** **for** **obvious** **issues**.

---

### Lighthouse

**Beginner Level**

**Lighthouse** **accessibility** **score** **is** **a** **heuristic** **summary**—**not** **a** **guarantee** **of** **full** **WCAG** **compliance**.

**Real-time example**: **Weather** **PWA** **audit** **in** **Chrome**.

**Intermediate Level**

**Use** **Lighthouse** **in** **CI** **as** **a** **signal**, **pair** **with** **manual** **tests**.

**Expert Level**

**Don’t** **chase** **100** **at** **the** **expense** **of** **real** **user** **testing**.

#### Key Points — Lighthouse

- **Good** **macro** **indicator**.
- **Not** **a** **substitute** **for** **semantic** **HTML** **review**.

---

### jest-axe

**Beginner Level**

**Run** **axe** **assertions** **in** **unit/integration** **tests** **on** **rendered** **DOM**.

**Real-time example**: **E-commerce** **`CheckoutStep`** **component** **has** **no** **automatic** **violations** **in** **CI**.

**Intermediate Level**

**Scope** **tests** **to** **components** **you** **control**; **third-party** **widgets** **may** **need** **exceptions**.

**Expert Level**

**Combine** **with** **RTL** **to** **test** **states** **(errors**, **loading)**.

```tsx
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

it("CheckoutStep has no axe violations", async () => {
  const { container } = render(<CheckoutStep />);
  expect(await axe(container)).toHaveNoViolations();
});
```

#### Key Points — jest-axe

- **Catches** **regressions** **early**.
- **Still** **needs** **manual** **verification**.

---

### Manual Testing

**Beginner Level**

**Manual** **testing** **includes** **keyboard-only** **pass**, **zoom** **to** **200%**, **and** **screen** **reader** **spot** **checks**.

**Real-time example**: **Social** **posting** **flow** **from** **draft** **to** **publish**.

**Intermediate Level**

**Use** **structured** **test** **scripts** **(checklists)** **per** **release**.

**Expert Level**

**Include** **users** **with** **disabilities** **in** **research** **when** **possible**.

#### Key Points — Manual Testing

- **Finds** **UX** **and** **flow** **issues** **automation** **misses**.

---

### Keyboard-only Testing

**Beginner Level**

**Unplug** **the** **mouse** **and** **complete** **core** **tasks**: **login**, **search**, **checkout**, **send** **chat** **message**.

**Real-time example**: **Chat** **app** **must** **allow** **message** **send**, **emoji** **picker** **(if** **present)**, **and** **channel** **switch**.

**Intermediate Level**

**Watch** **focus** **traps** **and** **focus** **loss** **on** **route** **changes**.

**Expert Level**

**Test** **custom** **shortcuts** **against** **browser/AT** **defaults**.

#### Key Points — Keyboard Testing

- **The** **fastest** **way** **to** **catch** **focus** **and** **ordering** **bugs**.

---

## 20.6 Accessibility Libraries

### React ARIA (Adobe)

**Beginner Level**

**React** **Aria** **provides** **hooks** **that** **supply** **props** **for** **accessibility** **and** **keyboard** **behavior** **for** **custom** **components**.

**Real-time example**: **Dashboard** **filter** **combobox** **with** **correct** **ARIA** **and** **arrow-key** **navigation**.

**Intermediate Level**

**You** **bring** **styles**; **React** **Aria** **focuses** **on** **behavior** **and** **a11y**.

**Expert Level**

**Pair** **with** **React** **Stately** **for** **state** **machines** **separating** **concerns**.

```tsx
// Illustrative only—see official docs for full APIs
import { useButton } from "react-aria";

export function AriaButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ref = useRef<HTMLButtonElement>(null);
  const { buttonProps } = useButton(props, ref);
  return <button {...buttonProps} ref={ref} />;
}
```

#### Key Points — React ARIA

- **Great** **for** **design** **systems** **building** **custom** **UI**.

---

### Radix UI Primitives

**Beginner Level**

**Radix** **provides** **unstyled**, **accessible** **primitives** **(Dialog**, **DropdownMenu**, **Tabs)** **with** **focus** **management** **built** **in**.

**Real-time example**: **E-commerce** **modal** **checkout** **stepper** **dialogs**.

**Intermediate Level**

**Compose** **with** **your** **CSS** **or** **Tailwind** **for** **visual** **design**.

**Expert Level**

**Version** **upgrades** **may** **change** **DOM** **structure**—**read** **changelogs**.

```tsx
import * as Dialog from "@radix-ui/react-dialog";

export function ConfirmDelete() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Delete</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content aria-describedby={undefined}>
          <Dialog.Title>Delete item?</Dialog.Title>
          <Dialog.Close>Cancel</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

#### Key Points — Radix

- **Fast** **path** **to** **solid** **a11y** **for** **complex** **widgets**.

---

### Reach UI

**Beginner Level**

**Reach** **UI** **offers** **accessible** **components** **with** **simple** **APIs** **(MenuButton**, **Dialog**, **Tabs)**.

**Real-time example**: **Admin** **internal** **tools** **with** **minimal** **styling**.

**Intermediate Level**

**Smaller** **surface** **area** **than** **some** **design** **systems** **need**.

**Expert Level**

**Evaluate** **maintenance** **and** **community** **activity** **vs** **Radix/React** **Aria**.

#### Key Points — Reach UI

- **Good** **for** **teams** **wanting** **batteries-included** **behavior**.

---

### Choosing Libraries (Comparison)

**Beginner Level**

**Pick** **one** **primitive** **stack** **per** **design** **system** **to** **avoid** **duplicated** **behavior** **and** **bundle** **bloat**.

**Real-time example**: **Chat** **app** **standardizes** **on** **Radix** **for** **overlays** **and** **menus**.

**Intermediate Level**

**Headless** **libraries** **still** **require** **correct** **labels** **and** **content** **from** **your** **team**.

**Expert Level**

**Wrap** **primitives** **in** **your** **design** **system** **components** **to** **centralize** **policy**.

#### Key Points — Library Choice

- **Libraries** **accelerate** **ARIA** **correctness** **but** **don’t** **replace** **content** **design**.

---

## Key Points (Chapter Summary)

- **Semantic** **HTML** **first**; **ARIA** **to** **complete** **custom** **widgets**.
- **Keyboard** **navigation**, **visible** **focus**, **and** **predictable** **modals** **are** **foundational**.
- **Forms** **need** **labels**, **errors**, **and** **programmatic** **relationships**.
- **Images** **need** **appropriate** **`alt`**; **icons** **need** **text** **or** **`aria-label`**.
- **Screen** **reader** **support** **includes** **live** **regions**, **roles**, **and** **testing** **with** **real** **AT**.
- **Automate** **with** **axe** **and** **`jest-axe`**, **but** **manual** **keyboard/AT** **passes** **remain** **essential**.
- **Headless** **libraries** **(React** **Aria**, **Radix**, **Reach)** **reduce** **risk** **on** **complex** **patterns**.

---

## Best Practices (Global)

- **Bake** **a11y** **into** **your** **definition** **of** **done** **(keyboard**, **axe**, **spot** **SR** **checks)**.
- **Design** **focus** **states** **as** **first-class** **visual** **language**.
- **Use** **real** **`<button>`**, **`<a>`**, **`<label>`**, **and** **landmarks** **before** **reach** **for** **ARIA**.
- **For** **custom** **widgets**, **follow** **ARIA** **APG** **patterns** **or** **use** **tested** **primitives**.
- **Test** **representative** **flows**: **e-commerce** **checkout**, **social** **posting**, **dashboard** **exports**, **todo** **CRUD**, **weather** **search**, **chat** **send/receive**.
- **Track** **accessibility** **bugs** **like** **any** **P0** **when** **they** **block** **tasks**.

---

## Common Mistakes to Avoid

- **Clickable** **`div`** **without** **role**, **keyboard** **handlers**, **and** **tabindex**.
- **Missing** **`label`** **association** **for** **inputs** **(only** **placeholder** **text)**.
- **Icon-only** **buttons** **without** **accessible** **names**.
- **Opening** **modals** **without** **focus** **trap** **or** **return** **focus**.
- **Using** **`aria-hidden`** **on** **focused** **elements** **or** **hiding** **active** **content** **incorrectly**.
- **Overusing** **`aria-live="assertive"`** **and** **spamming** **announcements**.
- **Relying** **only** **on** **color** **for** **state** **(errors**, **toggles)**.
- **Broken** **heading** **order** **for** **visual** **styling** **reasons**.
- **Assuming** **Lighthouse** **100** **means** **fully** **accessible**.
- **Disabling** **focus** **outlines** **globally** **without** **accessible** **alternatives**.

---
