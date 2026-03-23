# 12. Advanced Tags

## Horizontal Rule — `<hr>`

```html
<h2>Section 1</h2>
<p>Content...</p>
<hr>
<h2>Section 2</h2>
```

- Represents a **thematic break** between sections
- Self-closing void element

---

## Details & Summary — Native Accordion

```html
<details>
  <summary>What is HTML5?</summary>
  <p>HTML5 is the fifth and current major version of HTML, 
     introducing semantic elements, multimedia support, 
     and modern APIs.</p>
</details>

<!-- Open by default -->
<details open>
  <summary>Getting Started</summary>
  <p>Create an .html file and open it in a browser.</p>
</details>
```

### Exclusive Accordion (HTML `name` attribute)

```html
<!-- Only one details can be open at a time in the same name group -->
<details name="faq">
  <summary>Question 1</summary>
  <p>Answer 1</p>
</details>
<details name="faq">
  <summary>Question 2</summary>
  <p>Answer 2</p>
</details>
<details name="faq">
  <summary>Question 3</summary>
  <p>Answer 3</p>
</details>
```

> The `name` attribute on `<details>` creates exclusive accordions (Chrome 120+).

### Styling

```css
details {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.5rem;
}

summary {
  cursor: pointer;
  font-weight: 600;
  padding: 0.5rem;
}

/* Custom marker */
summary::marker {
  content: "▸ ";
}
details[open] summary::marker {
  content: "▾ ";
}

/* Remove default marker */
summary::-webkit-details-marker { display: none; }
summary { list-style: none; }
```

---

## DataList — Autocomplete Suggestions

```html
<label for="language">Programming Language:</label>
<input type="text" id="language" name="language" list="languages">

<datalist id="languages">
  <option value="JavaScript">
  <option value="Python">
  <option value="Java">
  <option value="TypeScript">
  <option value="C++">
  <option value="Go">
  <option value="Rust">
</datalist>
```

- Connected via `list` attribute on `<input>` ↔ `id` on `<datalist>`
- User can type freely or pick from suggestions
- Works with: `text`, `email`, `url`, `tel`, `search`, `number`, `range`, `date`, `color`

---

## Progress Bar

```html
<!-- Determinate: shows completion percentage -->
<label for="download">Downloading:</label>
<progress id="download" value="65" max="100">65%</progress>

<!-- Indeterminate: shows loading animation -->
<progress>Loading...</progress>
```

---

## `<article>`

```html
<article>
  <header>
    <h2>HTML5 New Features</h2>
    <time datetime="2025-02-08">Feb 8, 2025</time>
  </header>
  <p>HTML5 introduced semantic elements, audio/video support...</p>
  <footer>
    <p>By John Doe</p>
  </footer>
</article>
```

- Self-contained content that could stand alone (blog post, news article, comment, product card)
- Should have a heading
- Can be nested (e.g., comments within an article)

---

## `<output>`

```html
<form oninput="total.value = parseInt(price.value) * parseInt(qty.value)">
  <input type="number" id="price" name="price" value="10"> ×
  <input type="number" id="qty" name="qty" value="2"> =
  <output name="total" for="price qty">20</output>
</form>
```

- Displays the **result of a calculation or user action**
- `for` attribute lists the IDs of contributing elements

---

## `<dialog>` — Native Modal

```html
<dialog id="confirmDialog">
  <h3>Confirm Delete</h3>
  <p>This action cannot be undone.</p>
  <form method="dialog">
    <button value="cancel">Cancel</button>
    <button value="delete">Delete</button>
  </form>
</dialog>

<button onclick="document.getElementById('confirmDialog').showModal()">
  Delete Item
</button>
```

### JavaScript API

```javascript
const dialog = document.getElementById('confirmDialog');

dialog.showModal();     // Open as modal (with backdrop, Escape to close)
dialog.show();          // Open as non-modal
dialog.close();         // Close
dialog.close('result'); // Close with return value

dialog.returnValue;     // Gets the button value that closed it
```

### Styling the Backdrop

```css
dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}
```

---

## `<template>` — Reusable Content Template

```html
<template id="row-template">
  <tr>
    <td class="name"></td>
    <td class="email"></td>
    <td><button class="delete-btn">Delete</button></td>
  </tr>
</template>

<table>
  <thead>
    <tr><th>Name</th><th>Email</th><th>Action</th></tr>
  </thead>
  <tbody id="table-body"></tbody>
</table>
```

```javascript
const template = document.getElementById('row-template');
const tbody = document.getElementById('table-body');

users.forEach(user => {
  const clone = template.content.cloneNode(true);
  clone.querySelector('.name').textContent = user.name;
  clone.querySelector('.email').textContent = user.email;
  tbody.appendChild(clone);
});
```

- Content is **not rendered** until cloned by JavaScript
- Great for dynamic content, list items, card components

---

## `<slot>` (Web Components)

```html
<template id="card-template">
  <div class="card">
    <slot name="title">Default Title</slot>
    <slot name="body">Default body content</slot>
  </div>
</template>
```

- Used inside Web Components to define placeholder areas
- Content from the light DOM fills the slot

---

## `<data>`

```html
<ul>
  <li><data value="UPC-012345">Product A</data></li>
  <li><data value="UPC-067890">Product B</data></li>
</ul>
```

- Links human-readable content with a machine-readable `value`
