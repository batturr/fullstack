# 16. Web Storage

## Overview

| Feature | `localStorage` | `sessionStorage` | Cookies |
|---------|---------------|------------------|---------|
| Capacity | ~5-10 MB | ~5-10 MB | ~4 KB |
| Lifetime | Permanent (until cleared) | Until tab/window closes | Set by `expires`/`max-age` |
| Sent with requests | ❌ No | ❌ No | ✅ Every request |
| Scope | Same origin (all tabs) | Same origin + same tab | Same origin (+ path) |
| API | Simple key-value | Simple key-value | `document.cookie` (string) |
| Server access | ❌ Client only | ❌ Client only | ✅ Server reads headers |

---

## localStorage

Data persists **permanently** (until explicitly cleared). Shared across all tabs/windows of the same origin.

### API

```javascript
// Store
localStorage.setItem('username', 'John');
localStorage.setItem('theme', 'dark');
localStorage.setItem('cart', JSON.stringify([{ id: 1, qty: 2 }]));

// Retrieve
const username = localStorage.getItem('username');    // "John"
const theme = localStorage.getItem('theme');           // "dark"
const cart = JSON.parse(localStorage.getItem('cart')); // [{id: 1, qty: 2}]

// Remove one item
localStorage.removeItem('username');

// Clear all
localStorage.clear();

// Get number of items
localStorage.length;

// Get key by index
localStorage.key(0);    // First key name

// Check if key exists
if (localStorage.getItem('theme') !== null) { }
```

### Use Cases
- User preferences (theme, language, font size)
- Shopping cart persistence
- Form draft auto-save
- Recently viewed items
- Auth tokens (though not recommended for sensitive tokens)

---

## sessionStorage

Data persists only for the **current browser tab/window**. Cleared when the tab is closed.

### API (Same as localStorage)

```javascript
// Store
sessionStorage.setItem('activeTab', 'settings');
sessionStorage.setItem('formData', JSON.stringify({ name: 'John' }));

// Retrieve
const tab = sessionStorage.getItem('activeTab');

// Remove
sessionStorage.removeItem('activeTab');

// Clear all
sessionStorage.clear();
```

### Use Cases
- One-time login tokens
- Multi-step form data (wizard progress)
- Temporary UI state (active tab, scroll position)
- Shopping cart for a single session

---

## Important Notes

### Storage Only Accepts Strings

```javascript
// ❌ Storing objects directly doesn't work
localStorage.setItem('user', { name: 'John' }); // Stores "[object Object]"

// ✅ Use JSON.stringify and JSON.parse
localStorage.setItem('user', JSON.stringify({ name: 'John', age: 30 }));
const user = JSON.parse(localStorage.getItem('user'));
```

### Storage Event (Cross-Tab Communication)

```javascript
// Fires in OTHER tabs when localStorage changes
window.addEventListener('storage', (event) => {
  console.log('Key:', event.key);
  console.log('Old value:', event.oldValue);
  console.log('New value:', event.newValue);
  console.log('URL:', event.url);
});
```

- Only fires in **other** tabs/windows (not the one that made the change)
- Only works with `localStorage` (not `sessionStorage`)

---

## Cookies

Sent with **every HTTP request** — used for server-side communication.

### Set a Cookie

```javascript
// Basic cookie
document.cookie = "username=John";

// With expiration
document.cookie = "username=John; expires=Fri, 31 Dec 2025 23:59:59 GMT";

// With max-age (seconds)
document.cookie = "username=John; max-age=86400";    // 1 day

// With path and domain
document.cookie = "username=John; path=/; domain=example.com; secure; SameSite=Strict";
```

### Read Cookies

```javascript
const allCookies = document.cookie;   // "username=John; theme=dark"

// Parse specific cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}
```

### Delete a Cookie

```javascript
document.cookie = "username=; max-age=0";    // Set max-age to 0
```

### Cookie Attributes

| Attribute | Purpose |
|-----------|---------|
| `expires` | Expiration date (GMT string) |
| `max-age` | Expiration in seconds |
| `path` | URL path the cookie applies to |
| `domain` | Domain the cookie applies to |
| `secure` | Only send over HTTPS |
| `SameSite` | `Strict`, `Lax`, `None` — CSRF protection |
| `HttpOnly` | Cannot be accessed by JavaScript (server-set only) |

---

## IndexedDB (Brief Overview)

For large amounts of structured data:

```javascript
// Open database
const request = indexedDB.open('MyDatabase', 1);

request.onupgradeneeded = (event) => {
  const db = event.target.result;
  const store = db.createObjectStore('users', { keyPath: 'id' });
  store.createIndex('name', 'name', { unique: false });
};

request.onsuccess = (event) => {
  const db = event.target.result;
  
  // Add data
  const tx = db.transaction('users', 'readwrite');
  tx.objectStore('users').add({ id: 1, name: 'John', age: 30 });
  
  // Read data
  const getTx = db.transaction('users', 'readonly');
  const getReq = getTx.objectStore('users').get(1);
  getReq.onsuccess = () => console.log(getReq.result);
};
```

| Feature | localStorage | IndexedDB |
|---------|-------------|-----------|
| Data type | Strings only | Any (including blobs, files) |
| Capacity | ~5-10 MB | Hundreds of MB+ |
| Async | ❌ Synchronous | ✅ Asynchronous |
| Indexes | ❌ | ✅ |
| Transactions | ❌ | ✅ |
| Use case | Simple key-value | Complex data, offline apps |

---

## When to Use What

| Need | Solution |
|------|---------|
| Theme preference | `localStorage` |
| Auth session | `sessionStorage` or HttpOnly `cookie` |
| Shopping cart | `localStorage` |
| Server auth | `cookie` (HttpOnly, Secure, SameSite) |
| Offline data | `IndexedDB` |
| Large files/blobs | `IndexedDB` |
| Form draft | `sessionStorage` or `localStorage` |
| Analytics tracking | `cookie` (sent to server) |
