# 25. Iframes & Embedding

## `<iframe>` — Inline Frame

Embeds another HTML page within the current page.

```html
<iframe src="https://example.com" width="600" height="400" title="Example Site">
</iframe>
```

---

## Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `src` | URL to embed | `src="https://example.com"` |
| `width` | Frame width | `width="600"` |
| `height` | Frame height | `height="400"` |
| `title` | Accessible name (**required for a11y**) | `title="Map"` |
| `name` | Target name for forms/links | `name="content"` |
| `loading` | Lazy load | `loading="lazy"` |
| `allow` | Feature permissions | `allow="camera; microphone"` |
| `sandbox` | Security restrictions | `sandbox="allow-scripts"` |
| `referrerpolicy` | Referrer header control | `referrerpolicy="no-referrer"` |
| `srcdoc` | Inline HTML content | `srcdoc="<p>Hello</p>"` |

---

## Common Embeds

### YouTube Video

```html
<iframe 
  width="560" height="315"
  src="https://www.youtube.com/embed/VIDEO_ID"
  title="YouTube video player"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowfullscreen
  loading="lazy">
</iframe>
```

### Google Maps

```html
<iframe 
  src="https://www.google.com/maps/embed?pb=!1m18!..."
  width="600" height="450"
  style="border:0;"
  allowfullscreen=""
  loading="lazy"
  title="Google Maps"
  referrerpolicy="no-referrer-when-downgrade">
</iframe>
```

### CodePen

```html
<iframe 
  height="400" width="100%"
  src="https://codepen.io/username/embed/pen-id?default-tab=html%2Cresult"
  title="CodePen Embed"
  loading="lazy"
  allowfullscreen>
</iframe>
```

---

## Responsive Iframe

```html
<div style="aspect-ratio: 16 / 9; width: 100%; max-width: 800px;">
  <iframe 
    src="https://www.youtube.com/embed/VIDEO_ID"
    width="100%" height="100%"
    title="Video" allowfullscreen
    style="border: none;">
  </iframe>
</div>
```

---

## Sandbox — Security Restrictions

The `sandbox` attribute **restricts everything** by default. You then **allow** specific capabilities:

```html
<!-- Maximum restrictions: no scripts, no forms, no same-origin access -->
<iframe src="untrusted.html" sandbox></iframe>

<!-- Allow specific features -->
<iframe src="form.html" sandbox="allow-scripts allow-forms allow-same-origin"></iframe>
```

### Sandbox Values

| Value | Allows |
|-------|--------|
| (empty) | Everything restricted |
| `allow-scripts` | Run JavaScript |
| `allow-forms` | Submit forms |
| `allow-same-origin` | Access same-origin resources |
| `allow-popups` | Open popups/new windows |
| `allow-popups-to-escape-sandbox` | Popups without sandbox |
| `allow-top-navigation` | Navigate the top window |
| `allow-modals` | `alert()`, `confirm()`, `prompt()` |
| `allow-downloads` | Download files |

---

## `allow` — Permissions Policy

Controls which browser features the iframe can use:

```html
<iframe src="app.html" 
  allow="camera; microphone; geolocation; fullscreen; payment">
</iframe>
```

| Permission | Controls |
|-----------|---------|
| `camera` | Camera access |
| `microphone` | Microphone access |
| `geolocation` | Location access |
| `fullscreen` | Fullscreen API |
| `payment` | Payment Request API |
| `autoplay` | Autoplay media |
| `encrypted-media` | DRM content |
| `picture-in-picture` | PiP mode |
| `clipboard-write` | Clipboard access |

---

## `srcdoc` — Inline HTML Content

```html
<iframe srcdoc="<h1>Hello</h1><p>This is inline HTML content.</p>" 
        width="400" height="200" title="Inline content">
</iframe>
```

- Content is inline HTML, not a URL
- `srcdoc` takes priority over `src` if both are present
- Useful for sandboxed previews

---

## Communication Between Frames

### `postMessage` API

**Parent → Iframe:**

```javascript
// Parent page
const iframe = document.getElementById('myFrame');
iframe.contentWindow.postMessage('Hello from parent', 'https://example.com');
```

**Iframe → Parent:**

```javascript
// Inside iframe
window.parent.postMessage('Hello from iframe', 'https://parent-domain.com');
```

**Receive Messages (Both sides):**

```javascript
window.addEventListener('message', (event) => {
  // Always verify origin!
  if (event.origin !== 'https://trusted-domain.com') return;
  
  console.log('Received:', event.data);
  console.log('From:', event.origin);
});
```

> **Security:** Always check `event.origin` before processing messages.

---

## `<embed>` and `<object>`

### `<embed>` — External Content

```html
<embed src="document.pdf" type="application/pdf" width="600" height="400">
<embed src="flash.swf" type="application/x-shockwave-flash" width="400" height="300">
```

### `<object>` — With Fallback

```html
<object data="document.pdf" type="application/pdf" width="600" height="400">
  <p>Your browser doesn't support PDF viewing. 
     <a href="document.pdf">Download the PDF</a>.</p>
</object>
```

| Element | Fallback | Use Case |
|---------|----------|---------|
| `<iframe>` | Text between tags | Web pages, videos |
| `<embed>` | None | PDFs, plugins |
| `<object>` | Content between tags | PDFs, SVGs, with fallback |

---

## Security Best Practices

1. **Always use `sandbox`** for untrusted content
2. Set **`X-Frame-Options`** header on your server to prevent clickjacking:
   ```
   X-Frame-Options: DENY              # No framing
   X-Frame-Options: SAMEORIGIN        # Only same origin
   ```
3. Use **`Content-Security-Policy: frame-ancestors`**:
   ```
   Content-Security-Policy: frame-ancestors 'self' https://trusted.com
   ```
4. Validate `postMessage` origins
5. Use `loading="lazy"` for off-screen iframes (performance)
6. Always add `title` attribute (accessibility)
