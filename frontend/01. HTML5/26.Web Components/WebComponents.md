# 26. Web Components

## What Are Web Components?

Web Components let you create **reusable, encapsulated custom HTML elements** with their own markup, styles, and behavior.

### Three Key Technologies

| Technology | Purpose |
|-----------|---------|
| **Custom Elements** | Define new HTML tags |
| **Shadow DOM** | Encapsulated DOM and styles |
| **HTML Templates** | Reusable markup templates with `<template>` and `<slot>` |

---

## Custom Elements

### Defining a Custom Element

```javascript
class MyCard extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
      <div class="card">
        <h3>${this.getAttribute('title') || 'Card Title'}</h3>
        <p><slot></slot></p>
      </div>
    `;
  }
}

// Register the custom element
customElements.define('my-card', MyCard);
```

```html
<!-- Use it like a native HTML tag -->
<my-card title="Hello World">This is the card content.</my-card>
```

### Rules for Custom Element Names
- Must contain a **hyphen** (`-`) — e.g., `my-card`, `user-profile`
- Cannot be a single word — distinguishes from native HTML elements
- Must start with a lowercase letter

---

## Lifecycle Callbacks

```javascript
class MyElement extends HTMLElement {
  constructor() {
    super();
    // Element created (don't access attributes/children here)
  }
  
  connectedCallback() {
    // Element added to DOM — setup, render, event listeners
    console.log('Added to page');
  }
  
  disconnectedCallback() {
    // Element removed from DOM — cleanup
    console.log('Removed from page');
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    // An observed attribute changed
    console.log(`${name}: ${oldValue} → ${newValue}`);
  }
  
  static get observedAttributes() {
    // List of attributes to watch
    return ['title', 'theme', 'size'];
  }
  
  adoptedCallback() {
    // Element moved to a new document (rare)
  }
}

customElements.define('my-element', MyElement);
```

---

## Shadow DOM

Shadow DOM creates an **isolated DOM tree** with scoped styles that don't leak in or out.

```javascript
class MyButton extends HTMLElement {
  constructor() {
    super();
    
    // Create shadow root
    const shadow = this.attachShadow({ mode: 'open' });
    
    // Add scoped styles and markup
    shadow.innerHTML = `
      <style>
        button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        }
        button:hover {
          background: #2563eb;
        }
      </style>
      <button><slot>Click Me</slot></button>
    `;
  }
}

customElements.define('my-button', MyButton);
```

```html
<!-- The button styles are completely isolated -->
<my-button>Submit</my-button>
<my-button>Cancel</my-button>

<!-- External button styles won't affect my-button -->
<style>
  button { background: red; }  /* This won't affect shadow DOM buttons */
</style>
```

### Shadow DOM Modes

| Mode | Access |
|------|--------|
| `open` | Accessible via `element.shadowRoot` |
| `closed` | Not accessible from outside (more encapsulated) |

---

## `<template>` and `<slot>`

### Template

```html
<template id="card-template">
  <style>
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; }
    .card h3 { margin-top: 0; color: #333; }
  </style>
  <div class="card">
    <h3><slot name="title">Default Title</slot></h3>
    <p><slot name="body">Default body content</slot></p>
    <slot></slot>  <!-- Default slot for unnamed content -->
  </div>
</template>
```

### Slots — Content Projection

```javascript
class FancyCard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const template = document.getElementById('card-template');
    shadow.appendChild(template.content.cloneNode(true));
  }
}

customElements.define('fancy-card', FancyCard);
```

```html
<fancy-card>
  <span slot="title">My Custom Title</span>
  <span slot="body">This content fills the body slot.</span>
  <footer>This goes to the default slot.</footer>
</fancy-card>
```

---

## Complete Example: User Card Component

```javascript
class UserCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    const name = this.getAttribute('name') || 'Unknown';
    const role = this.getAttribute('role') || 'Member';
    const avatar = this.getAttribute('avatar') || '';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          font-family: system-ui, sans-serif;
        }
        .card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          max-width: 300px;
        }
        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 600;
        }
        .avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
        .info h3 { margin: 0; font-size: 16px; }
        .info p { margin: 4px 0 0; font-size: 14px; color: #6b7280; }
      </style>
      <div class="card">
        <div class="avatar">
          ${avatar ? `<img src="${avatar}" alt="${name}">` : name[0].toUpperCase()}
        </div>
        <div class="info">
          <h3>${name}</h3>
          <p>${role}</p>
        </div>
      </div>
    `;
  }
  
  static get observedAttributes() { return ['name', 'role', 'avatar']; }
  attributeChangedCallback() { if (this.isConnected) this.connectedCallback(); }
}

customElements.define('user-card', UserCard);
```

```html
<user-card name="Jane Smith" role="Developer" avatar="jane.jpg"></user-card>
<user-card name="John Doe" role="Designer"></user-card>
```

---

## `:host` and CSS Parts

```javascript
// Inside shadow DOM
shadow.innerHTML = `
  <style>
    :host {
      display: block;
      --primary: #3b82f6;
    }
    :host([theme="dark"]) {
      --primary: #8b5cf6;
    }
    button {
      background: var(--primary);
    }
  </style>
  <button part="btn"><slot>Click</slot></button>
`;
```

```css
/* External CSS can style ::part() */
my-button::part(btn) {
  font-size: 18px;
  border-radius: 999px;
}

/* External CSS can set custom properties */
my-button {
  --primary: #ef4444;
}
```

---

## Extending Built-in Elements

```javascript
class FancyButton extends HTMLButtonElement {
  constructor() {
    super();
    this.addEventListener('click', () => {
      this.style.transform = 'scale(0.95)';
      setTimeout(() => this.style.transform = '', 150);
    });
  }
}

customElements.define('fancy-button', FancyButton, { extends: 'button' });
```

```html
<button is="fancy-button">Click Me</button>
```

> Note: Safari doesn't support `is=""` — use autonomous custom elements for cross-browser support.

---

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Custom Elements | ✅ | ✅ | ✅ | ✅ |
| Shadow DOM | ✅ | ✅ | ✅ | ✅ |
| Templates/Slots | ✅ | ✅ | ✅ | ✅ |
| `is=""` (customized built-in) | ✅ | ✅ | ❌ | ✅ |
