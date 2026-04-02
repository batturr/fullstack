# HTML & HTML5 Interview Questions — Mid-Level (3–5 Years)

100 intermediate-to-advanced questions with detailed answers. Covers real-world patterns, performance, accessibility, and HTML5 APIs.

---

## 1. How does the HTML5 outline algorithm relate to sectioning content, and why should you not rely on nested headings alone for document structure?

The HTML specification defines how sectioning elements (`section`, `article`, `aside`, `nav`) and heading elements (`h1`–`h6`) contribute to a document outline. In theory, each sectioning root creates a nested outline so you could repeat `h1` inside each `article`. In practice, browsers and assistive technologies historically did not fully implement a single shared “outline algorithm” the way the spec described, and **using multiple `h1` elements based on nesting was discouraged** for accessibility because screen reader support was inconsistent. Today, the pragmatic approach for most projects is to use a **logical heading level hierarchy** (`h1` once per page or main landmark, then `h2`, `h3`, etc.) that reflects visual structure, while still using semantic containers for meaning. Treat sectioning elements as **semantic wrappers**, not as a substitute for clear heading levels. Always test with real assistive technology when you experiment with outline-heavy patterns.

```html
<body>
  <h1>Product catalog</h1>
  <article>
    <h2>Wireless headphones</h2>
    <section aria-labelledby="specs-heading">
      <h3 id="specs-heading">Specifications</h3>
      <p>...</p>
    </section>
  </article>
</body>
```

---

## 2. What are HTML content models (flow, phrasing, embedded, interactive), and why do they matter beyond validation?

Content models describe **which elements are allowed as children** of a given element in HTML. **Flow content** is the broadest category (most body-level elements); **phrasing content** corresponds roughly to inline-level text and markup; **embedded content** includes `img`, `video`, `iframe`; **interactive content** includes controls that accept user input. Browsers use these rules during parsing: invalid nesting may be **auto-corrected** by the parser (e.g., closing a `p` before a `div` appears inside it), which can surprise developers when inspecting the DOM. Understanding content models helps you predict **implicit DOM fixes**, write valid markup that matches your intent, and avoid subtle accessibility bugs from broken structures. Validators and IDE HTML language services surface these issues early.

```html
<!-- Invalid: div inside p is not allowed; parser may close <p> early -->
<p>Start <div>oops</div></p>
```

---

## 3. When should you choose `article` versus `section`, and what is a practical decision rule for product UIs?

An **`article`** represents a **self-contained composition** that could theoretically be syndicated or reused on its own (blog post, card representing one item, forum comment with its own heading). A **`section`** is a **thematic grouping** within a document—a chapter-like division that needs a heading for navigation. If removing the block would leave a hole in the **topic flow** of the page but not necessarily a standalone story, `section` is often appropriate. If the block is **one independent unit of content** with its own title and metadata, `article` fits better. A common mistake is wrapping every UI block in `article` for “SEO”; search engines care more about clear headings and quality content than the sheer use of `article`. Use the element that matches **meaning**, not buzzwords.

```html
<article>
  <header><h2>Case study: Payments rollout</h2></header>
  <p>...</p>
</article>
<section aria-labelledby="faq">
  <h2 id="faq">FAQ</h2>
  <p>...</p>
</section>
```

---

## 4. How does `aside` differ from a sidebar widget, and when is `aside` inappropriate?

The **`aside`** element represents content **tangentially related** to the main content—side notes, pull quotes, advertising groups, or a list of related links. It does **not** strictly mean “sidebar column”; layout position is a CSS concern. If content is **essential** to understanding the main article (e.g., critical warnings or primary instructions), it should not be relegated to `aside` merely because it sits in a column. Conversely, **navigation** for the whole site belongs in `nav`, not `aside`, unless the aside is specifically a set of related links for the current article. Misusing `aside` for unrelated ads without labeling can hurt **screen reader landmarks** when users navigate by region.

```html
<article>
  <h1>Guide to hydration</h1>
  <p>Main article text...</p>
  <aside aria-label="Related products">
    <h2>You might also like</h2>
    <ul>...</ul>
  </aside>
</article>
```

---

## 5. What is the `main` landmark, how many can exist, and what are common accessibility mistakes?

The **`main`** element identifies the **primary content** of the page—what is unique to this document, excluding headers, footers, and global navigation. There should be **at most one visible `main`** per document (the spec allows multiple only if the others are hidden, e.g., inactive views in a single-page app, but this must be managed carefully). Putting **site-wide navigation** inside `main` breaks the landmark model for screen reader users who jump to “main” to skip chrome. Omitting `main` on app-like layouts is also a mistake when the page has a clear primary region. Pair `main` with **skip links** and a proper heading outline for best results.

```html
<body>
  <a class="skip-link" href="#primary">Skip to main content</a>
  <header>...</header>
  <main id="primary" tabindex="-1">
    <h1>Dashboard</h1>
  </main>
</body>
```

---

## 6. How do `header` and `footer` scope work when nested inside `section` or `article`?

`header` and `footer` are **sectioning content helpers**, not just page-wide chrome. A **`header`** can introduce any section or article (titles, bylines, meta). A **`footer`** can close that same section with footnotes, related links, or copyright for that block. Nesting does **not** create new sectioning roots by itself—you still rely on headings and/or explicit `section`/`article` boundaries. Multiple `footer` elements on a page are normal when each belongs to a different ancestor section. Confusion arises when developers use `footer` only for the page bottom and avoid it inside cards; that is a missed semantic opportunity for **per-component** metadata.

```html
<article>
  <header>
    <h2>Post title</h2>
    <p><time datetime="2026-04-02">Apr 2, 2026</time></p>
  </header>
  <p>Body...</p>
  <footer>
    <p>Tags: <a href="/tag/html">html</a></p>
  </footer>
</article>
```

---

## 7. What is `address` for, and what content must never be placed inside it?

The **`address`** element is for **contact information relevant to the nearest `article` or `body`**—not for every postal address on the site. It might hold the author’s email, organization name, or physical address for the current article’s contact block. It is **misused** when wrapping arbitrary street addresses in a store locator without tying them to document or article semantics, or when stuffing unrelated marketing copy into it. Do not wrap **arbitrary content** like maps or hours unless they are part of that contact metadata. Styling addresses purely with `address` does not help SEO; clarity and microdata (where appropriate) do.

```html
<article>
  <h1>Conference recap</h1>
  <p>...</p>
  <address>
    Written by <a href="mailto:jane@example.com">Jane Doe</a>.<br />
    Example Corp, 1 Market St, San Francisco, CA.
  </address>
</article>
```

---

## 8. What is microdata, and how does it relate to schema.org in HTML?

**Microdata** is a syntax (attributes like `itemscope`, `itemtype`, `itemprop`) for embedding **machine-readable labels** in HTML so crawlers can extract structured facts—products, events, breadcrumbs. **schema.org** provides shared vocabularies often referenced via `itemtype` URLs. Microdata competes with **JSON-LD** (usually preferred today for easier maintenance and separation of concerns) and **RDFa**. Mid-level engineers should know how to read microdata in legacy templates and when to migrate to JSON-LD for **Google-rich-result** compatibility. Incorrect nesting or missing required properties yields **no benefit** and can trigger warnings in testing tools.

```html
<div itemscope itemtype="https://schema.org/Product">
  <h2 itemprop="name">Noise-cancelling headset</h2>
  <p itemprop="description">...</p>
  <span itemprop="brand" itemscope itemtype="https://schema.org/Brand">
    <span itemprop="name">Acme</span>
  </span>
</div>
```

---

## 9. When would you use `figure` and `figcaption` instead of a `div` with a paragraph below the image?

Use **`figure`** when the image (or code block, quote, table) is a **self-contained unit** referenced from the main text, and **`figcaption`** provides a **caption or legend** that belongs to that unit. If the text is **not** a caption but unrelated body copy, do not force `figcaption`. Figures are great for **documentation screenshots**, **diagrams**, and **media with licensing** notes. A plain `div` with a `p` is not wrong semantically if there is no figure/figcaption relationship, but you lose the **explicit association** that assistive tech can expose. Ensure the figure does not duplicate **alt text** and caption in a redundant way unless intentional for different audiences.

```html
<figure>
  <img src="/diagram.svg" alt="Architecture: browser to CDN to origin" />
  <figcaption>Figure 1. Request path for static assets.</figcaption>
</figure>
```

---

## 10. How do `details` and `summary` support disclosure widgets, and what accessibility considerations apply?

The **`details`** element creates a native **disclosure widget** without JavaScript; **`summary`** is its visible label and focusable control. Content inside `details` (outside `summary`) is shown when open. This pattern helps **FAQ** and **progressive disclosure** with less code than custom accordions. Screen readers generally expose it as expandable content, but **custom styling** and nested interactive elements can still cause issues. Avoid putting **complex forms** solely inside `details` without testing keyboard and screen reader behavior. For critical legal text, ensure users cannot miss it—**don’t hide required consent** only inside a closed `details` without additional cues.

```html
<details>
  <summary>Pricing details</summary>
  <p>Annual plan includes SSO and audit logs.</p>
</details>
```

---

## 11. How does the Constraint Validation API work at the element and form level?

Browsers expose **`HTMLInputElement`, `HTMLTextAreaElement`, and `HTMLSelectElement`** methods such as `checkValidity()`, `reportValidity()`, and the **`validity`** object (`valueMissing`, `patternMismatch`, `tooLong`, etc.). At the form level, `HTMLFormElement` has `checkValidity()` and `reportValidity()` to validate **all** associated controls. This API runs on top of attributes like `required`, `min`, `max`, `pattern`, and `type`. You can intercept submission with `submit` events and call `preventDefault()` while using `reportValidity()` to show native tooltips. Custom validation often combines **attribute-based rules** with script that sets `customValidity()` on elements for **dynamic** messages.

```javascript
const email = document.querySelector('input[type="email"]');
email.addEventListener('input', () => {
  if (!email.value.endsWith('@company.com')) {
    email.setCustomValidity('Use your company email.');
  } else {
    email.setCustomValidity('');
  }
});
```

---

## 12. What is `setCustomValidity`, and how do you avoid leaving controls permanently invalid?

**`setCustomValidity(message)`** sets a **custom validation error**; an **empty string** clears it. If you forget to clear the message when input becomes valid, the control stays **blocked** for submission forever—a frequent bug. Always reset custom validity on **every** validation pass. Pair with `reportValidity()` for immediate feedback or rely on native submit blocking. Remember that **disabled** fields are skipped from validation and **not** submitted. For complex forms, centralize validation in one function that both **sets messages** and **clears** them consistently.

```javascript
function validatePasswordMatch(pw, confirm) {
  if (confirm.value && pw.value !== confirm.value) {
    confirm.setCustomValidity('Passwords must match.');
  } else {
    confirm.setCustomValidity('');
  }
}
```

---

## 13. How does `FormData` differ from serializing a form manually, and when is it essential?

The **`FormData`** API captures **name/value pairs** from a `<form>` or lets you append fields programmatically, including **`File`** inputs. Unlike `application/x-www-form-urlencoded` string building by hand, `FormData` handles **multipart** boundaries for file uploads when used with `fetch`. It interoperates with **`URLSearchParams`** when you need query strings instead. For **REST JSON APIs**, you might use `FormData` only as input, then transform to JSON in script—know your backend’s expected `Content-Type`. `FormData` entries preserve **multiple values** for the same name, mirroring successful form submission behavior.

```javascript
const form = document.querySelector('form');
const fd = new FormData(form);
fd.append('traceId', crypto.randomUUID());
await fetch('/api/profile', { method: 'POST', body: fd });
```

---

## 14. Explain `input` types `url`, `email`, `tel`, and `search` beyond their default appearance—what validation and UX do they provide?

These types hint **keyboard layouts** on mobile (`email` shows `@`, `tel` numeric) and enable **basic syntactic validation** for `url` and `email` in supporting browsers. They do **not** replace server-side validation: `type="email"` allows many strings users might still consider invalid for your domain. `search` may add a clear button in some UAs. **`tel`** often has **no strict pattern** unless you add `pattern`. Combine **`autocomplete`** attributes with these types for **password managers** and faster checkout flows. Relying only on `type` without **`aria-invalid`** and messaging for assistive users is a common gap.

```html
<label for="site">Website</label>
<input id="site" name="site" type="url" inputmode="url" autocomplete="url" />
```

---

## 15. What are `datetime-local`, `date`, `month`, and `week`, and what are their browser/UI inconsistencies?

**Date-oriented inputs** map to structured date/time values, but **rendering is highly browser-dependent** (native pickers vs. text-like fields). `datetime-local` includes date and time **without** timezone; storing UTC on the server requires explicit conversion. `month` and `week` are less consistently styled and sometimes **absent** on certain mobile keyboards. Always provide **`min`/`max`** when business rules require them, and consider **progressive enhancement** with a JS date library for consistent UX. Never assume the displayed format equals the **value** string sent to the server—always parse according to spec.

```html
<label for="start">Start</label>
<input id="start" name="start" type="datetime-local" min="2026-04-01T09:00" />
```

---

## 16. What is the difference between `application/x-www-form-urlencoded`, `multipart/form-data`, and `text/plain` encoding?

**`application/x-www-form-urlencoded`** (default) encodes pairs as `key=value` with escaping, suitable for most text fields. **`multipart/form-data`** is required for **file uploads** and sends parts with boundaries; it is heavier but binary-safe. **`text/plain`** is mostly historical and **not** used for typical APIs—avoid it unless you have a specific legacy need. When using `fetch`, picking `multipart/form-data` happens automatically with `FormData` and **no manual `Content-Type` header** (let the browser set the boundary). Mismatched encoding causes **silent data loss** or server parse errors—especially with files.

```html
<form action="/upload" method="post" enctype="multipart/form-data">
  <input type="file" name="doc" />
  <button type="submit">Upload</button>
</form>
```

---

## 17. How do `autocomplete` attribute tokens like `billing`, `shipping`, `section-*`, and `cc-*` improve forms?

HTML’s **`autocomplete`** standard tokens tell browsers and password managers **which logical field** a control is, improving autofill accuracy and **WCAG** ease of use. You can scope fields with **`section-*`** prefixes (e.g., `section-billing street-address`) to separate multiple addresses on one page. Payment forms use **`cc-name`**, **`cc-number`**, **`cc-exp`**, etc. Incorrect or generic `autocomplete` values reduce **successful autofill** and can frustrate users with disabilities who rely on predictable field detection. Combine with **visible labels** and avoid `autocomplete="off"` on login fields unless you have a **security** reason—often it harms usability without real gains.

```html
<input
  name="billing-line1"
  autocomplete="billing street-address"
/>
```

---

## 18. What is the `novalidate` form attribute, and when is it justified?

**`novalidate`** disables **native** constraint validation for a form—submissions will not be blocked by `required`, `pattern`, etc. Use it when you implement **fully custom** validation and messaging and want to avoid **double** error UI from both native and custom layers. It is **not** an excuse to skip validation entirely—**server-side** checks remain mandatory. Hybrid approaches sometimes use native validation but intercept with `reportValidity()` only on blur/submit. Removing native validation without **accessible** custom errors is a serious regression.

```html
<form novalidate id="signup">
  <!-- Custom validation pipeline -->
</form>
```

---

## 19. How do `inputmode` and `pattern` interact with `type="text"` for numeric codes?

**`inputmode="numeric"`** (or `decimal`) suggests **numeric soft keyboards** without changing string semantics the way `type="number"` does—important for **PINs**, **CVVs**, and **leading-zero** identifiers. **`pattern`** constrains allowed characters for **native validation** but is **not** always a good UX alone—users may see cryptic browser messages. **`type="number"`** is inappropriate for **credit card numbers** (loss of leading zeros, spinner UI). Combine **`inputmode`**, **`pattern`**, **`maxlength`**, and clear **`aria-describedby`** error text for robustness.

```html
<input
  name="otp"
  inputmode="numeric"
  pattern="[0-9]{6}"
  maxlength="6"
  autocomplete="one-time-code"
/>
```

---

## 20. What are `form` and `formaction` attributes, and how can they simplify multi-action forms?

The **`form`** attribute on a button or field associates a control with a **different form** by `id` elsewhere in the document—useful when layout prevents nesting. **`formaction`**, **`formmethod`**, **`formenctype`**, and **`formnovalidate`** on submit buttons let **one** form POST to **different endpoints** or methods per button (e.g., “Save draft” vs. “Publish”). This avoids duplicating hidden fields across forms but can confuse **analytics** if not instrumented carefully. Ensure **CSRF tokens** and **intent** fields align with each action. Test **keyboard** submission and default button behavior.

```html
<form id="post" method="post" action="/posts">
  <textarea name="body"></textarea>
  <button type="submit">Publish</button>
  <button type="submit" formaction="/drafts" name="intent" value="draft">
    Save draft
  </button>
</form>
```

---

## 21. What is the difference between implicit ARIA semantics and explicit `role` attributes, and when must you add roles?

Many HTML elements have **implicit roles** (e.g., `<nav>` maps to `navigation`, `<button>` to `button`). You generally **should not** redundantly set `role` unless you are **fixing** broken markup or polyfilling patterns. Explicit roles are needed when using **`div`**/ **`span`** to build widgets that lack native semantics, or when **repurposing** elements (discouraged). Wrong roles—like `role="button"` on a `div` without **keyboard support**—create **worse** accessibility than using a real `<button>`. The first rule of ARIA: **if a native HTML element exists, use it**.

```html
<!-- Prefer -->
<button type="button">Save</button>
<!-- Avoid -->
<div role="button" tabindex="0">Save</div>
```

---

## 22. Explain `aria-expanded`, `aria-controls`, and `aria-current` in interactive components.

**`aria-expanded`** communicates whether a collapsible region or submenu is open—pair with `button` or `a` that toggles visibility. **`aria-controls`** references the **id** of the controlled region so assistive tech can announce relationships (support varies; still useful). **`aria-current`** marks the **current** item in a set—breadcrumb, step indicator, or nav link—with values like `page`, `step`, or `true`. These attributes reduce **guesswork** for screen reader users navigating dynamic UIs. Always update **`aria-expanded`** **synchronously** with visibility changes to avoid stale state.

```html
<button type="button" aria-expanded="false" aria-controls="help-text" id="help-btn">
  Help
</button>
<div id="help-text" hidden>...</div>
```

---

## 23. How do live regions (`aria-live`, `role="status"`, `role="alert"`) differ, and when is each appropriate?

**`aria-live="polite"`** announces updates when the user is idle—good for **toasts** that are not urgent. **`aria-live="assertive"`** interrupts—reserve for **critical errors** or time-sensitive warnings. **`role="alert"`** implies **assertive** live behavior and often maps to **alert** announcements. **`role="status"`** is a **polite** live region for **progress** or non-critical updates. Do not overuse **assertive** regions—they disorient users. **Empty** live regions should be present in the DOM early so assistive tech **registers** them before updates. Dynamic **SPA** routing should announce **page title** changes via a polite region or **focus management**.

```html
<div id="announce" aria-live="polite" aria-atomic="true" class="visually-hidden"></div>
```

```javascript
function announce(msg) {
  const el = document.getElementById('announce');
  el.textContent = '';
  requestAnimationFrame(() => {
    el.textContent = msg;
  });
}
```

---

## 24. What landmark roles (`banner`, `complementary`, `contentinfo`) map to which elements, and why avoid redundant roles?

HTML5 elements carry implicit landmarks: **`header`** may be `banner` when scoped to body, **`aside`** may be `complementary`, **`footer`** may be `contentinfo`. Adding **redundant** `role` attributes can sometimes **conflict** or create duplicate landmarks if mis-scoped. Too many **complementary** regions dilute navigation—limit **sidebars** labeled distinctly with `aria-label`. Landmarks help screen reader users **jump** between regions; missing `main` or duplicative `navigation` without labels harms efficiency. **Label** multiple `nav` blocks with **`aria-label`** to distinguish “Primary”, “Footer”, and “In-page” navigation.

```html
<nav aria-label="Primary">...</nav>
<nav aria-label="Breadcrumb">...</nav>
```

---

## 25. How do you build an accessible custom combobox or autocomplete list starting from HTML primitives?

Start with a **native `<select>`** when possible; if requirements exclude that, combine **`input`** with a **`listbox`** role container, **`aria-autocomplete`**, **`aria-activedescendant`** (or roving tabindex), and **keyboard** handlers for Arrow keys, Home/End, Escape. Manage **`aria-expanded`** on the input if paired with a popup pattern. Ensure **visible focus** and **click-outside** behavior do not trap focus incorrectly. Testing with **VoiceOver**, **NVDA**, and **keyboard-only** use is non-optional. Document **why** native controls were insufficient—interviewers look for this tradeoff awareness.

```html
<label for="combo">Country</label>
<input id="combo" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="listbox" />
<ul id="listbox" role="listbox" hidden>...</ul>
```

---

## 26. What is a skip navigation link, and how should it be implemented without breaking focus order?

A **skip link** lets keyboard and screen reader users **jump past** repetitive navigation to `main`. It is usually the **first focusable** element, hidden until focused. Use an **anchor** targeting the `id` of `main` and move focus with **`tabindex="-1"`** on the target so **focus** lands in the main region in some browsers when programmatically focused via script after click. Ensure the target is **not** removed from accessibility tree. **CSS** should make the link visible on `:focus` for sighted keyboard users. Skips are a **WCAG** best practice for large headers.

```html
<a href="#main" class="skip-link">Skip to main content</a>
<main id="main" tabindex="-1">...</main>
```

```css
.skip-link { position: absolute; left: -999px; top: auto; }
.skip-link:focus { left: 1rem; top: 1rem; z-index: 100; }
```

---

## 27. How does focus management differ between modal dialogs, drawers, and multi-step wizards?

**Modals** should trap **tab** focus inside, restore focus to the opener on close, and use **`aria-modal="true"`** with **`role="dialog"`** (or native `<dialog>`). **Drawers** may or may not trap focus depending on modality—full-screen drawers often should. **Wizards** should move focus to the **step heading** or first field on step change and expose **progress** with `aria-current="step"`. Letting focus wander **behind** an active modal is a major failure. **`inert`** (where supported) or **`aria-hidden`** on background content helps, but **`aria-hidden`** on focused elements is forbidden.

```html
<div role="dialog" aria-modal="true" aria-labelledby="dlg-title">
  <h2 id="dlg-title">Confirm</h2>
  <button type="button">Close</button>
</div>
```

---

## 28. What testing approach should a mid-level engineer describe for screen reader compatibility?

Combine **automated** checks (axe, Lighthouse) with **manual** screen reader passes: **NVDA/Firefox** on Windows, **VoiceOver/Safari** on macOS/iOS, optionally **JAWS** for enterprise. Test **keyboard-only** flows, **landmark** navigation, **form errors**, and **dynamic updates**. Learn each SR’s **navigation modes** (e.g., VO rotor). Record **specific** issues: missing names, incorrect roles, live region spam. **User testing** with disabled users is ideal but not always available—still, describe how you’d recruit sessions. Mention **speech viewer** tools to debug live announcements without audio.

---

## 29. How do `aria-labelledby` and `aria-describedby` reference multiple ids, and what are parsing constraints?

Both attributes take a **space-separated list of IDs**; the **accessible name** concatenates labels in order for `aria-labelledby`. **IDs must be unique** in the document; duplicates break references unpredictably. Hidden elements can participate in naming if not `display:none` in some cases—**be careful** with `visibility:hidden` vs. off-screen visually hidden patterns. **`aria-describedby`** is great for **helper text** and **error messages**; ensure errors are also **visible** and not color-only. Do not reference **thousands** of characters of help text—keep descriptions concise.

```html
<h2 id="title">Payment</h2>
<p id="hint">All fields required.</p>
<section aria-labelledby="title" aria-describedby="hint">...</section>
```

---

## 30. Why is `tabindex` greater than zero discouraged, and what are valid uses of `tabindex="-1"`?

**Positive `tabindex`** disrupts the **natural DOM order**, confusing keyboard users who expect top-to-bottom flow. Avoid it except rare legacy needs—**reorder DOM** or adjust layout instead. **`tabindex="0"`** inserts non-focusable elements into tab order (use sparingly). **`tabindex="-1"`** makes elements **programmatically focusable** but not tabbable—ideal for **skip link targets**, **managing focus** in modals, or **listbox** options with `aria-activedescendant` patterns. Misusing `-1` on interactive controls that should be reachable via Tab is a bug.

```html
<div id="panel" tabindex="-1"></div>
```

---

## 31. How does the Geolocation API interact with permissions, HTTPS, and user prompts?

**`navigator.geolocation.getCurrentPosition`** and **`watchPosition`** require **user permission**; browsers show a prompt and may remember the choice. **Secure contexts** (HTTPS or localhost) are required in modern browsers. Accuracy depends on **device capabilities** (GPS vs. IP). Handle **`PERMISSION_DENIED`**, **`POSITION_UNAVAILABLE`**, and **`TIMEOUT`** errors gracefully—never assume success. **Privacy**: explain why you need location in UI copy before triggering prompts—**spammy** requests reduce acceptance rates. For **continuous** tracking, prefer **`watchPosition`** with clear **stop** controls.

```javascript
navigator.geolocation.getCurrentPosition(
  (pos) => console.log(pos.coords.latitude, pos.coords.longitude),
  (err) => console.error(err.code, err.message),
  { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
);
```

---

## 32. What are the security and UX considerations when implementing HTML5 Drag and Drop?

The **Drag and Drop API** uses events like **`dragstart`**, **`dragover`**, **`drop`**, and data transfer via **`dataTransfer.setData`**. You must **`preventDefault()`** on `dragover` to allow dropping. **Security**: validate dropped content on the server—never trust **client-side** data as authoritative. **Custom drag images** can improve UX. **Accessibility**: native DnD is **mouse-centric**; provide **keyboard alternatives** or use **ARIA** patterns with clear instructions—this is a common gap. Touch devices have **inconsistent** support; test mobile browsers.

```javascript
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
});
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  const text = e.dataTransfer.getData('text/plain');
});
```

---

## 33. Compare `localStorage` and `sessionStorage` for real-world HTML apps—capacity, lifetime, and pitfalls.

Both are **Web Storage** key/value APIs synchronous on the main thread—**blocking** large writes can jank UI. **`localStorage`** persists until cleared; **`sessionStorage`** is per **top-level browsing context** and tab lifetime. Typical **5MB** quota (implementation-dependent). **Not** for secrets—any script on the origin can read them (XSS risk). **No** structured query—serialize JSON yourself. **`storage` event** fires in **other** tabs for `localStorage` changes—useful for **cross-tab** signaling. Avoid storing **PII** without product/legal review.

```javascript
sessionStorage.setItem('checkoutStep', '2');
const step = sessionStorage.getItem('checkoutStep');
```

---

## 34. When would you choose IndexedDB over Web Storage for an HTML5 offline feature?

**IndexedDB** is an **asynchronous**, **indexed** key-value store suitable for **larger** structured data, **binary** blobs, and **query** needs. It has a **steeper API** (often wrapped by libraries like Dexie). Use it for **offline caches** of application records, **media**, or **sync** queues. Web Storage is simpler but **blocking** and size-limited. **Service Workers** pair with IndexedDB for **robust** offline-first apps. Plan for **schema migrations** and **browser eviction** under storage pressure—**persist** permission where available.

```javascript
const openReq = indexedDB.open('app-db', 1);
openReq.onupgradeneeded = () => {
  const db = openReq.result;
  if (!db.objectStoreNames.contains('items')) db.createObjectStore('items', { keyPath: 'id' });
};
```

---

## 35. How does the History API (`pushState`, `replaceState`, `popstate`) support SPA routing from an HTML perspective?

**`history.pushState`** and **`replaceState`** let scripts **change the URL** without full navigation, enabling **client-side routers** to sync address bar with views. The **`popstate`** event fires on **back/forward** but **not** on `pushState`—routers listen and render accordingly. You must still provide **real URLs** that work with **server configuration** (deep links). **Scroll restoration** and **focus** must be managed manually—poor History API usage breaks **browser expectations**. Always update **document title** and **main** content for assistive tech.

```javascript
history.pushState({ view: 'details' }, '', '/items/42');
window.addEventListener('popstate', (e) => {
  /* render from e.state */
});
```

---

## 36. What are the prerequisites and limitations of the Notifications API in web pages?

**Notifications** require **permission** (`Notification.requestPermission`) and are best in **secure contexts**. Notifications may be **blocked** at OS or browser levels. **Service Worker** notifications enable **push**-style workflows when combined with **Push API**. Foreground pages can show notifications directly; background delivery typically needs **SW**. **Spam** risks mean UX should gate prompts behind **clear user intent**. Test on **macOS/Windows** differences. **Icons** and **actions** improve usefulness.

```javascript
if ('Notification' in window && Notification.permission === 'default') {
  await Notification.requestPermission();
}
if (Notification.permission === 'granted') {
  new Notification('Build finished', { body: 'Deploy succeeded.' });
}
```

---

## 37. How can Intersection Observer be used with HTML to lazy-load images and infinite-scroll markers?

**`IntersectionObserver`** watches when **target elements** enter/exit a root (often viewport) efficiently without scroll listeners. Pair with **`loading="lazy"`** on `img`/`iframe` for **native** lazy loading where sufficient—use observers for **older browsers** or **custom** behaviors (e.g., fetch JSON when sentinel visible). **RootMargin** can prefetch slightly before visibility. **Avoid** observing thousands of nodes individually—**batch** or use **sentinel** elements. Remember **`prefers-reduced-motion`** when animating reveals.

```javascript
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) loadMore();
    });
  },
  { rootMargin: '200px' }
);
io.observe(document.getElementById('sentinel'));
```

---

## 38. What does the Fullscreen API offer for `<video>` or app containers, and what are common pitfalls?

**`element.requestFullscreen()`** presents a video or container fullscreen; **`document.exitFullscreen()`** reverses. Listen for **`fullscreenchange`** to update UI. **Vendor prefixes** existed historically—feature detect. **iOS Safari** historically used **`webkitEnterFullscreen`** on video—**cross-browser** video UIs need branching. **Keyboard** shortcuts and **captions** must remain operable. **User gesture** requirements often apply to entering fullscreen. **Accessibility**: fullscreen can **trap** context—ensure **exit** controls are obvious.

```javascript
video.addEventListener('dblclick', async () => {
  if (!document.fullscreenElement) await video.requestFullscreen();
  else await document.exitFullscreen();
});
```

---

## 39. How do feature detection and progressive enhancement apply to HTML5 APIs in production?

Use **`'geolocation' in navigator`**, **`'serviceWorker' in navigator`**, etc., before calling APIs. **Polyfills** may exist but often **partial**—design **fallbacks** (manual city entry if geolocation denied). **Progressive enhancement** means core tasks work with **basic HTML forms**; APIs **layer** nicer UX. Document **browser support** in ADRs for your team. **Telemetry** helps catch API failures in the wild—never **silent catch** without logging.

```javascript
if ('IntersectionObserver' in window) {
  /* enhanced path */
} else {
  /* load images eagerly or use scroll handler fallback */
}
```

---

## 40. Why might you avoid calling multiple heavy HTML5 APIs synchronously on first page load?

Many APIs trigger **permission prompts** or **main-thread work** (IndexedDB upgrades, large storage reads). Stacking prompts **annoys users** and reduces grant rates. Heavy synchronous storage access can **block** rendering. **Batch** initialization, **defer** non-critical probes until **idle** (`requestIdleCallback` where available), and **orchestrate** feature activation behind user actions. **Performance budgets** should include **third-party embeds** that also touch these APIs indirectly.

---

## 41. What advanced `<video>` attributes (`preload`, `poster`, `playsinline`, `disablePictureInPicture`) affect performance and mobile behavior?

**`preload="metadata|auto|none"`** hints how much to buffer—`none` saves data but delays readiness; **`metadata`** is a common default for lists. **`poster`** shows an image before playback—good for LCP placeholders. **`playsinline`** is critical on **iOS** to avoid forced fullscreen. **`disablePictureInPicture`** opts out of PiP UI where supported. **Codec** support varies—provide **multiple `<source>`** elements with **type** hints. **CORS** and **`crossorigin`** matter for canvas frame capture.

```html
<video
  controls
  playsinline
  preload="metadata"
  poster="/thumb.jpg"
  crossorigin="anonymous"
>
  <source src="movie.webm" type="video/webm" />
  <source src="movie.mp4" type="video/mp4" />
</video>
```

---

## 42. How does the `audio` element differ from `video` for streaming and background playback policies?

**`audio`** lacks a visual box but shares **many attributes** (`preload`, `src`, `source` children). **Autoplay** policies often **block** audio until user gesture—plan **muted** autoplay for video if needed, not audio. **Background** tab playback may be **suspended**—handle `pause` events. For **live streams**, ensure **`MediaSource`** extensions where applicable. Always expose **controls** or custom UI with **keyboard** access.

```html
<audio controls preload="none">
  <source src="podcast.mp3" type="audio/mpeg" />
</audio>
```

---

## 43. What are Media Source Extensions (MSE), and how do they relate to `<video>` markup?

**MSE** lets JavaScript append **media segments** to a **`MediaSource`** attached to `HTMLMediaElement`—enabling **adaptive bitrate** (DASH/HLS client libraries). The **HTML** side still uses `<video>`, but **`src`** may be a **blob URL** from `MediaSource`. This is **not** beginner `<source src>` static files—it's **advanced** streaming. **CDN** and **DRM** (EME) often appear in enterprise video. **Compatibility** and **CORS** are tricky; use established players when possible.

---

## 44. Explain `srcset` and `sizes` on `img`—how does the browser pick an image candidate?

**`srcset`** lists **candidates** with **width descriptors** (`700w`) or **density descriptors** (`2x`). **`sizes`** tells the browser **display width** across media conditions so it can pick a **reasonable** resource before layout completes—critical for **responsive** images. Without **`sizes`**, width descriptors assume **`100vw`**—often wrong. **`src`** remains fallback. **Art direction** uses **`<picture>`** instead. Getting **`sizes`** wrong wastes **bandwidth** or serves **blurry** images—measure layouts.

```html
<img
  src="fallback.jpg"
  srcset="small.jpg 480w, large.jpg 960w"
  sizes="(max-width: 600px) 100vw, 50vw"
  alt="Team photo"
/>
```

---

## 45. How do `picture`, `source`, `type`, and `media` attributes support art direction and modern formats?

**`<picture>`** wraps multiple **`<source>`** elements and a fallback **`img`**. Use **`media`** for **breakpoint**-specific crops, **`type`** for **MIME** negotiation (`image/avif`, `image/webp`). The browser picks the **first matching** `<source>`; the final **`img`** holds **alt** and **display**. **Testing** requires browsers without AVIF support—ensure **JPEG** fallback order. Don’t duplicate **`srcset`** unnecessarily—combine features thoughtfully.

```html
<picture>
  <source type="image/avif" srcset="hero.avif" />
  <source type="image/webp" srcset="hero.webp" />
  <img src="hero.jpg" alt="Conference stage" width="1200" height="600" />
</picture>
```

---

## 46. What is WebVTT, and how do `<track kind>` values map to captions, subtitles, and descriptions?

**WebVTT** (`.vtt` files) provides timed text for **`video`** via **`<track>`**. **`kind="captions"`** includes **sounds** for deaf users; **`subtitles`** translate dialogue; **`descriptions`** are **audio descriptions** text for blind users (rarely sufficient alone—full audio description track may be separate). **`default`** selects the initial track. **Styling** via pseudo-elements is limited and browser-specific. **CORS** must allow loading `.vtt` if cross-origin.

```html
<video controls src="movie.mp4">
  <track kind="captions" src="captions.vtt" srclang="en" label="English" default />
</video>
```

---

## 47. What are the trade-offs between Canvas and SVG for graphics-heavy web pages?

**Canvas** is a **bitmap** surface—great for **games**, **heavy** particle systems, and **image** pixel manipulation; poor for **DOM**-like accessibility unless you build **parallel** semantics. **SVG** is **vector** DOM—scales crisply, **CSS/JS** stylable, **accessible** if you use text/titles—but many nodes can **hurt** performance. **Hybrid** approaches use SVG icons + canvas charts. For **static** diagrams, **inline SVG** often wins; for **video** frame processing, **canvas**. Consider **GPU** limits on mobile.

```html
<svg viewBox="0 0 100 100" role="img" aria-labelledby="t">
  <title id="t">Checkmark</title>
  <path d="M10 50 L40 80 L90 20" fill="none" stroke="currentColor" />
</svg>
```

---

## 48. What responsive images strategy would you propose for a content site vs. a product gallery?

**Content sites** benefit from **`srcset`/`sizes`**, **CDN** resizing, **lazy** loading, and **modern formats** with fallbacks—optimize **LCP** image in HTML with **`fetchpriority="high"`** when appropriate. **Product galleries** need **consistent aspect ratios**, **`width`/`height`** attributes to reduce **CLS**, and **zoom** affordances—sometimes **srcset** per **thumbnail** and **lightbox** size. **CMS** should store **originals** and generate derivatives—avoid uploading one **giant** image only. **Measure** real devices; **don’t** guess breakpoints.

---

## 49. How does `image-set()` in CSS relate to HTML’s `srcset` problem space?

**`image-set()`** in CSS picks **background** images by resolution—similar philosophy to **`srcset`** but for **stylesheets**. Prefer **content images** in **`img`** for **SEO** and **alt text**; use **`image-set()`** for **decorative** backgrounds. Mixing approaches inconsistently can **double-download** if not careful—**preload** carefully. **HTML-first** responsive images are usually easier to **audit** for accessibility.

```css
.hero {
  background-image: image-set(
    url('hero.avif') type('image/avif') 1x,
    url('hero.webp') type('image/webp') 1x,
    url('hero.jpg') 1x
  );
}
```

---

## 50. Why should video/audio elements include explicit `width`/`height` or aspect-ratio containers?

**Layout shift** occurs when media metadata loads late—**CLS** hurts UX and metrics. Reserve space with **`width`/`height`** attributes (for `img`/`video`) or **`aspect-ratio`** in CSS. For **responsive** video, **`padding-top`** hacks are legacy—**`aspect-ratio: 16/9`** is cleaner. **Thumbnails** (`poster`) also help perceived stability. **Test** slow networks with devtools throttling.

```html
<video
  controls
  width="1280"
  height="720"
  style="max-width: 100%; height: auto"
  src="clip.mp4"
></video>
```

---

## 51. What do `rel="preload"`, `prefetch`, `preconnect`, and `dns-prefetch` each optimize, and in what order should hints appear?

**`preload`** fetches **early** critical resources (fonts, hero images, key JS modules) for **current** navigation—use **`as`** and correct **`type`**. **`prefetch`** is **lower priority** for **future** navigations. **`preconnect`** sets up **TCP/TLS** to origins; **`dns-prefetch`** resolves **DNS** only—lighter than preconnect. Put **`preconnect`** to critical third parties **early** in `head`. **Overusing** `preload` can **steal** bandwidth from critical HTML—**measure** with WebPageTest. **Wrong `as`** causes **double fetches** or ignored hints.

```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preload" href="/fonts/body.woff2" as="font" type="font/woff2" crossorigin />
```

---

## 52. How does native `loading="lazy"` on images and iframes interact with priority and SEO?

**Lazy loading** defers offscreen resources—**great** for long pages. **LCP images** should **not** be lazy-loaded; use **`fetchpriority="high"`** on the **hero** image when appropriate. **Search engines** generally execute JS and understand lazy loading, but **ensure** images are in HTML or discoverable—**don’t** lazy-load **critical** content purely to hide from users. **`loading="lazy"`** on iframes delays third-party cost—**good** for below-fold embeds.

```html
<img src="below.jpg" alt="..." loading="lazy" decoding="async" />
```

---

## 53. Explain `async` vs. `defer` on classic scripts—execution order, parser blocking, and `document.write` behavior.

**`defer`** scripts **preserve order**, run **after** HTML parsing, and respect **`DOMContentLoaded`**. **`async`** scripts download **in parallel** but execute **as soon as ready**—**order not guaranteed**—good for **independent** bundles. **Neither** should be used with **`document.write`** in external scripts—**classic** parser-blocking scripts are the legacy pattern that **`write`** expects. **Modules** (`type="module"`) defer by default—understand **module** graph semantics separately. Pick **`defer`** for dependent site JS; **`async`** for **analytics** snippets that are order-insensitive.

```html
<script defer src="/vendor.js"></script>
<script defer src="/app.js"></script>
```

---

## 54. What is the critical rendering path, and how does HTML parsing interact with CSS/JS?

The **CRP** is the sequence from bytes to pixels: **DOM** construction, **CSSOM**, **render tree**, **layout**, **paint**, **composite**. **Render-blocking CSS** delays **first paint** if needed for FOUC avoidance—**inline critical CSS** sometimes used. **JS** can **block** parsing unless **`async/defer`**. **HTML** is **streaming**—early chunks can start building DOM while later arrive. Understanding this explains **why** script placement and **resource hints** matter. **Minimize** blocking resources above the fold.

---

## 55. Which resources are render-blocking by default, and how do you mitigate them?

**Synchronous stylesheets** without **`media`** tricks are **render-blocking**. **Classic scripts without async/defer** **block parsing**. **Web fonts** can block text render (**FOIT/FOUT**)—mitigate with **`font-display`**, **subset** fonts, **`preload`**. **Mitigations**: split CSS, **critical CSS**, **defer** JS, **code-split**. **Measure** with Performance panel—not guesses.

```html
<link rel="stylesheet" href="/noncritical.css" media="print" onload="this.media='all'" />
```

---

## 56. Why is `document.write` discouraged in modern pages, and when does it still appear?

**`document.write`** blocks parsing and can **wipe** the document if called late—**terrible** for performance and **CSP**-friendliness. It’s still seen in **some ad tags**—**avoid** in app code. **Prefer** DOM APIs or **`insertAdjacentHTML`** with sanitization. If you **inherit** `document.write`, isolate in **iframes**—still not ideal. **HTTP/2** and modern bundling remove most historical needs.

---

## 57. How does speculative parsing (speculative DOM) differ from execution of deferred scripts?

Browsers **look ahead** in the byte stream to **discover** resources (`img src`, `link`) and **prefetch** them while the main parser is blocked—**speculative** loading. **`defer`** scripts **execute** after parsing completes—**order preserved**. Speculative parsing **does not** mean deferred scripts run early—don’t confuse **network** optimization with **execution** timing. **Mis-nested** HTML can still **rewind** speculative work.

---

## 58. What role does the HTML document itself play in Largest Contentful Paint (LCP)?

**LCP** measures **largest visible** content element—often an **image** or **text block**. **HTML** determines **discovery order**—put **hero** image early or **`preload`** it; **avoid** lazy LCP. **Server-Timing** and **`priority hints`** (`fetchpriority`) tie to markup choices. **Client-side** rendering that injects LCP late **hurts** metrics—**SSR** or **static** HTML wins when possible. **CLS** and **INP** are separate but related UX stories.

---

## 59. How can you prioritize third-party embeds without wrecking Core Web Vitals?

Load **iframes** lazily, use **`loading="lazy"`**, facade **YouTube** with thumbnail click-to-load, **preconnect** to required origins, and **split** consent-gated tags behind **CMP** events. **Move** non-critical scripts **after** interaction or idle. **Measure** field data—**lab** tests alone mislead for ads. **HTML** can’t fix all ad tech, but **placement** and **lazy** strategies help.

```html
<iframe loading="lazy" src="https://example.com/embed" title="…"></iframe>
```

---

## 60. What are common mistakes when preloading images or fonts from HTML?

**Preloading** a resource **not used** soon wastes bandwidth—**Lighthouse** flags this. **Wrong MIME/`as`** mismatches cause **double fetch**. **Fonts** need **`crossorigin`** even on same origin in many cases. **Preloading** **every** page variant **bloats** `head`. **Coordinate** with **HTTP cache** headers—**immutable** assets help. **Self-host** critical fonts when possible for **privacy** and **control**.

---

## 61. What Open Graph tags should a mid-level engineer know, and how do they differ from Twitter Cards?

**Open Graph** (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) controls **rich previews** on many platforms. **Twitter** historically used **`twitter:card`**, **`twitter:image`**, etc.—often **mirror** OG with Twitter-specific tags for **large image cards**. **Image dimensions** and **HTTPS** matter—broken images ruin shares. **Cache** invalidation on CDNs can **stale** previews—use **debugger tools** provided by platforms. **JSON-LD** complements but does **not** replace OG for **all** social scrapers.

```html
<meta property="og:title" content="About our platform" />
<meta property="og:image" content="https://example.com/og.jpg" />
<meta name="twitter:card" content="summary_large_image" />
```

---

## 62. How should JSON-LD structured data be embedded, and what validates it?

Use **`<script type="application/ld+json">`** in `head` or `body`—**Google Rich Results Test** and **Schema.org** validators help. Keep **IDs** stable and **avoid** duplicating **conflicting** entities. **BreadcrumbList**, **Product**, **FAQ** schemas have **strict** required fields—**invalid** markup yields **no** rich result. **Don’t** fake reviews or ratings—**policy** violations penalize sites. **SPA** sites must **inject** JSON-LD on route changes if content changes materially.

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Example Inc",
    "url": "https://example.com"
  }
</script>
```

---

## 63. Why are canonical links important, and how do you implement them in HTML for parameterized URLs?

**`<link rel="canonical" href="...">`** suggests the **preferred URL** for duplicate or **near-duplicate** pages (query params, **HTTP/HTTPS** duplicates). It reduces **split** ranking signals. **Self-referencing** canonicals are normal. **Wrong** canonicals can **de-index** important pages—**QA** carefully. **Hreflang** pairs with internationalization—not the same as canonical. **JS** frameworks should emit canonicals **per route** server-side or via **helmet-like** utilities.

```html
<link rel="canonical" href="https://shop.example.com/products/42" />
```

---

## 64. What does the `robots` meta tag control, and how does it interact with `robots.txt`?

**`<meta name="robots" content="noindex,nofollow">`** instructs **crawlers** at the **page** level. **`robots.txt`** disallows **crawling** paths but **does not** guarantee **secrecy**—sensitive pages need **auth**. **`noindex`** on a page can still be **wasted crawl budget** if linked heavily—fix **architecture**. **`googlebot`** specific directives exist—use sparingly and per **vendor** docs. **Testing** in Search Console matters.

```html
<meta name="robots" content="index,follow,max-image-preview:large" />
```

---

## 65. How does `hreflang` markup work for multilingual sites, and where can it live?

**`hreflang`** can be **`link rel="alternate"`** in `head`, **HTTP headers**, or **sitemaps**. It maps **language/region** variants (`en-gb`, `x-default`). **Bi-directional** links between all variants are expected—**broken** graphs confuse search engines. **`x-default`** indicates fallback. **Implementation** mistakes cause **wrong** language SERP listings—**coordinate** with **routing** and **CMS**. **HTML** approach is easiest to **debug** in DevTools.

```html
<link rel="alternate" hreflang="en" href="https://example.com/en/" />
<link rel="alternate" hreflang="de" href="https://example.com/de/" />
<link rel="alternate" hreflang="x-default" href="https://example.com/en/" />
```

---

## 66. Explain the viewport meta tag in depth—what do `width=device-width`, `initial-scale`, and `user-scalable` affect?

**`width=device-width`** maps CSS pixels to **device-independent** width—essential for **responsive** layouts. **`initial-scale=1`** sets zoom baseline—**avoid** disabling zoom for **accessibility** (WCAG). **`maximum-scale=1` `user-scalable=no`** harms **low-vision** users—**avoid** unless exceptional justification. **`viewport-fit=cover`** matters for **notched** devices. **iOS** Safari has quirks with **`100vh`**—pair with **CSS env(safe-area-inset-*)**. Misconfigured viewports cause **tiny text** or **horizontal scroll**.

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

---

## 67. What charset considerations apply to HTML documents and HTTP headers?

**UTF-8** is standard: **`<meta charset="utf-8">`** must appear **early** in `head` (first 1024 bytes guidance historically). **HTTP `Content-Type`** charset should **agree** with meta—**mismatches** cause **mojibake**. **Avoid** declaring other encodings unless legacy systems require. **BOM** usage with UTF-8 can confuse some tools—**generally omit**. **Form submissions** encoding depends on document charset—**validate** server-side.

```html
<meta charset="utf-8" />
```

---

## 68. How do `theme-color`, `application-name`, and `apple-touch-icon` meta tags affect installed PWAs and mobile UX?

**`theme-color`** styles **browser UI**—improves **immersive** feel. **`apple-touch-icon`** provides **home screen** icons on iOS—**multiple** sizes may be needed. **`application-name`** pairs with **manifest**—prefer **Web App Manifest** for **installability**. These are **small** HTML touches with **big** polish impact. **Test** dark/light variants if your UI supports both.

```html
<meta name="theme-color" content="#0f172a" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
```

---

## 69. What is the `referrerpolicy` on elements like `a`, `img`, and `iframe`, and why set it?

**`referrerpolicy`** controls how much **Referer** header is sent—**`no-referrer`**, **`strict-origin-when-cross-origin`**, etc. Useful for **privacy** when linking to third parties or **embedding** media. **Default** behaviors vary—be explicit for **sensitive** pages. **SEO** internal links usually keep **referrers** for analytics—**balance** privacy and **measurement**. **CSP** **`referrer`** policy exists at document level too.

```html
<a href="https://partner.example" rel="noopener" referrerpolicy="no-referrer">Partner</a>
```

---

## 70. Why might duplicate or conflicting meta descriptions across routes hurt SEO, and how does HTML help?

**Unique** titles and descriptions improve **CTR** and clarity in SERPs—**templated** descriptions repeating “Welcome to…” hurt usefulness. **Server-rendered** HTML should emit **per-route** `<title>` and **`meta name="description"`**—SPAs often **fail** here without **SSR/SSG**. **Length** guidelines (~150–160 chars descriptions) are **hints**, not hard rules. **Structured data** should align with visible content—**mismatch** is a **spam** signal.

---

## 71. What sandbox flags exist on `iframe`, and what does each restrict?

The **`sandbox`** attribute applies **extra restrictions**: **`allow-scripts`**, **`allow-same-origin`**, **`allow-forms`**, **`allow-popups`**, **`allow-downloads`**, **`allow-modals`**, etc. **Without** `allow-same-origin`, content is treated as a **unique opaque origin**—**storage** isolation increases. **Empty `sandbox`** is maximal restriction—often breaks embeds until you **add back** needed flags. **`allow-top-navigation`** can enable **phishing** if combined carelessly—**avoid** unless required. **Combine** with **`referrerpolicy`** and **`allow`** lists.

```html
<iframe
  sandbox="allow-scripts allow-same-origin allow-popups"
  src="https://vendor.example/widget"
  title="Vendor widget"
></iframe>
```

---

## 72. How does Content Security Policy relate to iframes (`frame-src`, `child-src`, `sandbox`)?

**CSP** directives like **`frame-src`** (or historically **`child-src`**) control **which origins** may be embedded—**complements** `sandbox` by **blocking** unwanted sources entirely. **Misconfigured** CSP breaks **legitimate** embeds—**report-only** mode helps rollout. **`frame-ancestors`** protects **your** page from being framed (**clickjacking**). **`sandbox`** is **orthogonal**—it tightens **capabilities** of framed content. **Third-party** SaaS often requires specific **CSP** allowances.

```http
Content-Security-Policy: frame-src https://trusted.example https://www.youtube-nocookie.com
```

---

## 73. What is `srcdoc` on `iframe`, and what security considerations apply?

**`srcdoc`** embeds **inline HTML** as the iframe’s document—useful for **sandboxed previews** or **isolated** components. Pair with **`sandbox`** to limit scripts. **Escaping** user content is **mandatory**—**XSS** in `srcdoc` is **critical**. **`srcdoc` + `sandbox`** can implement **safe** HTML previews better than `innerHTML` in parent page. **Size** limits and **memory** still matter for large strings.

```html
<iframe sandbox="allow-same-origin" srcdoc="<p>Hello</p>" title="Preview"></iframe>
```

---

## 74. How does `postMessage` enable cross-origin iframe communication safely?

**`window.postMessage(data, targetOrigin)`** sends messages across **origins** when both sides cooperate. **Always validate `event.origin`** on receive—**never** use `*` for **targetOrigin** in production sends when avoidable. **Structured** cloning applies—**functions** won’t transfer. **Pair** with **CSP** and **iframe sandbox** to reduce **exfiltration** risks. **Protocol** design should include **message types** and **nonce** verification for **high privilege** actions.

```javascript
window.parent.postMessage({ type: 'resize', height: 400 }, 'https://parent.example');
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://parent.example') return;
  if (e.data?.type === 'init') {
    /* ... */
  }
});
```

---

## 75. What are best practices for embedding third-party widgets securely?

Prefer **official** iframes with **`sandbox`** as tight as possible, **least privilege** `allow` features, **subresource integrity** for scripts when offered, and **isolate** payment flows. **Avoid** pasting arbitrary **script tags** from vendors into your main bundle without **review**. **CSP** and **iframe** **sandbox** together reduce blast radius. **Monitor** vendor **supply chain** incidents—**pin** versions when feasible.

---

## 76. Why was `seamless` removed from iframes, and what patterns replace the idea of inline embedding?

The **`seamless`** attribute aimed to make iframes **flow** in parent documents but saw **limited implementation** and **security** concerns—**removed** from the spec. **Today**, use **shadow DOM** styling boundaries, **CSS** to size iframes, or **portals**/**micro-frontends** with explicit integration. **Don’t** expect **inline** iframe content to **inherit** parent styles—**design** contracts between teams instead.

---

## 77. How do `loading="lazy"` and `importance`/`fetchpriority` differ for iframe heavy pages?

**Lazy** delays **loading** the iframe document—**great** for below-fold embeds. **`fetchpriority="high"`** on **critical** `iframe` is rarely used—**often** better to **lazy** heavy widgets. **Priority hints** are subtle—**test** impact. **Consent** gating should happen **before** creating **iframes** to avoid **tracking** calls.

---

## 78. What is `allow` (Feature Policy / Permissions Policy) on iframes?

The **`allow`** attribute delegates **browser features** (`camera`, `microphone`, `payment`, `clipboard-write`) to embedded content—**fine-grained** control. Without **`allow`**, powerful APIs may be **denied** inside iframe even if top-level has permission. **Syntax** uses **quoted** feature lists—**read** MDN tables per browser. **Misconfiguration** breaks **Stripe**/**video** calls—**document** required tokens for integrators.

```html
<iframe allow="camera; microphone" src="https://meet.example/call"></iframe>
```

---

## 79. How can you make iframe titles and focus accessible for screen reader users?

Always set **`title`** describing purpose (“Embedded map”, not “iframe”). Manage **focus** when opening modal-like iframe flows—**trap** focus inside if acting as dialog. **Announce** loading states for slow embeds via **live regions**. **Keyboard** users must reach **Skip** past endless iframe carousels—**landmarks** help.

```html
<iframe title="Google Map showing office location" src="https://maps.example/..."></iframe>
```

---

## 80. What embedding pitfalls show up with PDFs and `object`/`embed` vs. `iframe`?

**PDF** rendering differs by **browser**—some use **built-in viewers**. **`iframe`** is common; **`object`**/`embed` alternate. **CORS** and **`Content-Disposition`** affect inline display. **Accessibility** of PDFs is often **poor**—prefer **HTML** content or supply **download** link. **Fallback** text inside `object` helps when plugins fail.

```html
<object data="/whitepaper.pdf" type="application/pdf" width="800" height="600">
  <a href="/whitepaper.pdf">Download PDF</a>
</object>
```

---

## 81. How is the DOM constructed from HTML, and what is the difference between tokens, nodes, and the live DOM tree?

Parsing breaks bytes into **tokens** (start/end tags, characters), builds **nodes** (`Element`, `Text`), and connects them into a **tree**. The **live DOM** can be mutated by scripts—**not** a static snapshot. **innerHTML** parsing uses the **HTML fragment** algorithm—different rules than full documents. Understanding this explains **implicit** `<tbody>` insertion and **auto-closing** tags. **DevTools** shows the **rendered** DOM after **script** execution—**not** the original source.

---

## 82. What is the CSSOM, and how does it relate to the DOM for rendering?

The **CSSOM** is a tree of **style rules** derived from stylesheets, including **computed** cascades. **Render tree** connects **DOM** and **CSSOM**—elements without layout (`display:none`) may be omitted depending on stage. **JavaScript** reading layout forces **reflow** when styles change—**batch** reads/writes. **HTML** changes that add nodes trigger **style recalc** if selectors match. **Performance** tuning spans both trees.

---

## 83. Explain reflow vs. repaint with HTML/CSS examples—what forces each?

**Reflow** (layout) recalculates **positions/sizes**—e.g., changing **`width`**, **`content` text**, **font** loads. **Repaint** redraws pixels without layout—e.g., **`color`**, **`visibility`**. **Composite-only** changes (`transform`, `opacity`) are cheapest. **Adding** DOM nodes from HTML strings can **trigger** both. **Avoid** **layout thrashing** by alternating read/write to geometric properties in loops.

```javascript
// Bad: interleaved reads/writes causing repeated reflows
for (const el of nodes) {
  el.style.width = el.offsetWidth + 10 + 'px';
}
```

---

## 84. What does “parser-blocking” mean for classic scripts placed in the document?

**Parser-blocking** scripts **halt HTML parsing** while fetched (if external) and **executed** before continuing—**bad** for FCP if in `head` without **`async/defer`**. **Inline** scripts block immediately. This is why **modern** guidance places **non-critical** scripts at **end** or uses **`defer`**. **`type="module"`** scripts are **defer** by default. **document.write** only “works” as expected in parser-blocking contexts—another reason it’s toxic.

---

## 85. What is speculative parsing, and can it fetch resources inside conditional HTML that won’t execute?

Speculative **preloaders** scan ahead for URLs even when parser is **blocked**—they may **prefetch** assets in **hidden** markup that **later** is removed by script—**wasted** bandwidth in some cases. **Understanding** this helps diagnose **unexpected** network activity. It is **not** magic execution—JavaScript still controls logic. **HTTP/2** multiplexing changes waterfall **shapes**.

---

## 86. How do HTML parsers recover from errors, and why shouldn’t you depend on invalid markup?

HTML5 defines **error recovery** rules—**unclosed** elements imply closures, **mis-nested** tags reorder. Different browsers historically diverged less now but **still**—**invalid** HTML yields **unexpected** DOM fixes. **Don’t** rely on **browser fixing** your mistakes—**automated** formatting and **linters** help. **Accessibility** suffers when implicit fixes **split** headings or paragraphs oddly.

```html
<!-- Browser may auto-close <p> before <div> -->
<p>Hello<div>World</div></p>
```

---

## 87. What were Internet Explorer document modes, and what legacy concerns remain today?

Older IE used **`X-UA-Compatible`** to switch between **quirks**, **IE7**, **IE8** standards modes—**legacy enterprise** apps depended on this. **Modern** Edge (Chromium) does **not** use these modes—**compatibility** shifts to **Enterprise Mode** lists rarely. **Meta** `http-equiv="X-UA-Compatible"` still appears in **templates**—mostly **harmless** but **unnecessary** for greenfield. **DOCTYPE** still matters for **quirks** vs **standards** mode in all browsers.

```html
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
```

---

## 88. How does shadow DOM affect what you see in DevTools “Elements” vs. the serialized HTML file?

**Shadow roots** encapsulate **internal** DOM—**not** visible in **View Source** of the page—only in **DevTools** when expanding **#shadow-root**. **Selectors** from parent **do not** pierce without **`::part`** / **`::slotted`** / **CSS custom properties**. **HTML files** on disk **won’t** show hydrated shadow content for **declarative** shadow DOM unless present server-side. **Testing** and **SEO** must account for **encapsulation**.

---

## 89. Why can `innerHTML` insertion be worse than `appendChild` for performance and security?

**`innerHTML`** **parses** strings into a **fragment**—**CPU** cost and **XSS** risk if **unsanitized**. **`appendChild`** moves or inserts **existing** nodes without **re-parsing** text. For **large** lists, **DocumentFragment** minimizes **reflows**. **Sanitize** any user HTML with **trusted** libraries or **DOMPurify**. **Prefer** `textContent` for **plain** text.

```javascript
const frag = document.createDocumentFragment();
items.forEach((t) => {
  const li = document.createElement('li');
  li.textContent = t;
  frag.appendChild(li);
});
list.appendChild(frag);
```

---

## 90. How does the interaction of HTML, inline styles, and stylesheets determine “computed styles”?

**Cascade** merges **origin** (user agent, author, user), **importance** (`!important`), **specificity**, and **order**. **Inline** `style` attributes beat author styles unless `!important` elsewhere wins per rules. **HTML** attributes like **`hidden`** map to **UA styles**. **Understanding** this helps debug **why** a component **looks** wrong—**not** just “CSS is broken”. **DevTools Computed** panel is authoritative.

---

## 91. What are Web Components, and how do custom elements, shadow DOM, and HTML templates fit together?

**Web Components** are a suite of standards: **Custom Elements** (`customElements.define`) for new tag names, **Shadow DOM** for **style/DOM encapsulation**, and **`<template>`** / **`<slot>`** for **declarative** markup reuse. They enable **design systems** with **framework-agnostic** widgets. **Challenges** include **SSR**, **FOUC**, **accessibility** of focus across shadow boundaries, and **global** CSS variables for theming. **Frameworks** (React/Vue) integrate with **varying** degrees of friction—**know** your team’s pattern.

```javascript
class XBadge extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' }).innerHTML = `<style>:host{display:inline-block}</style><slot></slot>`;
  }
}
customElements.define('x-badge', XBadge);
```

---

## 92. How is the `template` element different from a hidden `div` for storing markup?

**`<template>`** contents are **inert**: scripts don’t run, images don’t load, styles don’t apply until **cloned**. **`content`** is a **`DocumentFragment`**—**efficient** to **`cloneNode(true)`** and attach. Hidden **`div`** approaches still **fetch** images and **execute** scripts if present—**bad** for performance. Use **`template`** for **client-side** microtemplates and **table** row patterns.

```html
<template id="row-tpl">
  <tr><td class="name"></td><td class="role"></td></tr>
</template>
```

```javascript
const tpl = document.getElementById('row-tpl');
const row = tpl.content.firstElementChild.cloneNode(true);
row.querySelector('.name').textContent = 'Ada';
tableBody.appendChild(row);
```

---

## 93. What are slots in shadow DOM, and how do named slots and default slot content work?

**`<slot>`** defines **projection points** where **light DOM** children appear inside shadow trees. **Named slots** (`name="title"`) map children with **`slot="title"`**. **Default slot** catches unassigned nodes. **Composition** happens at render time—**not** simple string concat. **Styling** slots uses **`::slotted()`** with limitations. **Mis-slotting** yields **empty** UI—**test** thoroughly.

```html
<!-- usage -->
<my-card>
  <span slot="title">Hello</span>
  <p>Body text</p>
</my-card>
```

```html
<!-- shadow root -->
<div class="card">
  <h2><slot name="title">Untitled</slot></h2>
  <slot></slot>
</div>
```

---

## 94. What accessibility challenges does shadow DOM introduce for labels and focus?

**`aria-labelledby`** / **`for`/`id`** pairs may **cross** shadow boundaries **differently** depending on browser—**prefer** **slots** for labels inside the component or **export** parts. **Focus** outlines may be **clipped**—use **`focus-visible`** styles inside shadow. **Screen readers** generally traverse **flattened** accessibility trees, but **bugs** exist—**test**. **Provide** **role** and **name** via attributes on the host element.

```html
<x-search role="search" aria-label="Site search"></x-search>
```

---

## 95. What is declarative shadow DOM, and how does it help SSR?

**Declarative Shadow DOM** allows a **`<template shadowrootmode="open|closed">`** inside a custom element in **HTML** so the **shadow tree** serializes and **hydrates** on parse—**SSR-friendly**. **Browser** support is modern—**feature detect** or **polyfill** strategies. Enables **streaming** HTML with **embedded** component structure. **Security**: only **trusted** servers should emit—**don’t** reflect user HTML into declarative shadows without **sanitization**.

```html
<x-widget>
  <template shadowrootmode="open">
    <style>:host { display: block; }</style>
    <slot></slot>
  </template>
  Hello
</x-widget>
```

---

## 96. What happened to HTML Imports, and what replaced modular HTML includes?

**HTML Imports** were **deprecated**—never broadly shipped outside Chromium experiments. **Modern** replacements: **ES modules**, **bundlers**, **Web Components**, **server-side includes**, **templating** languages, and **micro-frontends**. **iframe** includes remain for **isolation** but aren’t “HTML modules”. **Import maps** help **JS** module graphs—not raw HTML fragments.

---

## 97. Compare `contenteditable` and `document.designMode` for rich text—risks and mitigations.

**`contenteditable`** makes elements **user-editable**, often used in **WYSIWYG** editors—**dangerous** if you **persist raw HTML** without **sanitization** (**XSS**). **`document.designMode = 'on'`** makes the **whole document** editable—mostly for **browser editing** demos. **Mitigations**: **sanitize** output, **use** a **controlled** schema (e.g., **Markdown**), **CSP**, **avoid** **paste** of arbitrary HTML. **Accessibility** of contenteditable is **hard**—**prefer** libraries with **ARIA** support.

```html
<div contenteditable="true" spellcheck="true">Edit me</div>
```

```javascript
document.designMode = 'on';
```

---

## 98. How do custom elements’ lifecycle callbacks map to HTML parsing (`connectedCallback`, `attributeChangedCallback`)?

**`connectedCallback`** fires when inserted into DOM—**safe** place to **upgrade** UI. **`attributeChangedCallback`** tracks **observed** attributes—declare **`static observedAttributes`**. **`constructor`** should be **light**—avoid **DOM** work before upgrade. **Parsing** order matters: **attributes** may arrive **before/after** connection—**handle** both. **SSR** + **hydration** needs **idempotent** callbacks.

```javascript
class PriceTag extends HTMLElement {
  static observedAttributes = ['currency'];
  attributeChangedCallback(name, oldVal, newVal) {
    this.render();
  }
  connectedCallback() {
    this.render();
  }
  render() {
    /* read attributes, update shadow/DOM */
  }
}
customElements.define('price-tag', PriceTag);
```

---

## 99. What are practical patterns for using `::part` and CSS custom properties to theme Web Components?

**`::part()`** exposes **named** internal elements for **styling** from outside without piercing full shadow CSS—**reduces** **encapsulation leaks** compared to **deep** selectors (deprecated). **CSS variables** on **`:host`** allow **tokens** (`--color-brand`) to **cascade** into shadow trees. **Document** the **public styling API** for consumers—**stability** matters. **Avoid** **too many** parts—becomes **hard** to maintain.

```css
x-card::part(header) {
  font-weight: 700;
}
```

```html
<style>
  x-card {
    --color-border: #e5e7eb;
  }
</style>
```

---

## 100. How would you summarize shadow DOM event retargeting and its impact on event listeners in the light DOM?

Events that originate inside a **shadow tree** appear to **outside** listeners as if they came from the **host element**—**retargeting**. **`event.target`** in the light DOM will be the **host** for shadow-internal nodes—can confuse **delegation** code expecting **inner** targets. Use **`event.composedPath()`** to see **full** path including shadow nodes if **`composed: true`** events (bubbles through shadow boundary). **Understanding** this prevents **bugs** in analytics and **menu** click handlers. **`mode: 'closed'`** shadow roots **hide** internals—**harder** debugging.

```javascript
host.addEventListener('click', (e) => {
  console.log(e.target); // likely the host for clicks inside shadow
  console.log(e.composedPath());
});
```

---

*Use these questions to probe practical HTML5 experience: follow-ups should ask candidates to sketch markup, outline accessibility tradeoffs, and explain how they’d validate behavior in browsers and assistive tech.*
