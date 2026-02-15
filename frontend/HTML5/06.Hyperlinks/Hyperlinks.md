# 06. Hyperlinks

## The `<a>` (Anchor) Tag

```html
<a href="https://www.google.com">Visit Google</a>
```

Creates a clickable link that navigates to another page, file, or location.

---

## Types of Links

### External Link

```html
<a href="https://www.google.com">Google</a>
<a href="https://developer.mozilla.org">MDN</a>
```

### Internal Link (Same Site)

```html
<!-- Relative path -->
<a href="about.html">About Us</a>
<a href="pages/contact.html">Contact</a>
<a href="../index.html">Back to Home</a>

<!-- Root-relative path -->
<a href="/about.html">About Us</a>
```

### Bookmark Link (Same Page)

```html
<!-- Link to a section on the same page -->
<a href="#section2">Jump to Section 2</a>
...
<h2 id="section2">Section 2</h2>

<!-- Back to top -->
<a href="#top">Back to Top</a>
<!-- or -->
<a href="#">Back to Top</a>
```

### Bookmark Link (Different Page)

```html
<a href="about.html#team">About — Team Section</a>
```

---

## Attributes

### `target` — Where to Open

```html
<a href="https://google.com" target="_blank">Opens in new tab</a>
<a href="page.html" target="_self">Opens in same tab (default)</a>
<a href="page.html" target="_parent">Opens in parent frame</a>
<a href="page.html" target="_top">Opens in full window</a>
```

| Value | Behavior |
|-------|----------|
| `_self` | Same tab/window (default) |
| `_blank` | New tab/window |
| `_parent` | Parent frame |
| `_top` | Full browser window (breaks out of all frames) |

### Security with `target="_blank"`

```html
<!-- ✅ Always add rel="noopener noreferrer" with target="_blank" -->
<a href="https://external-site.com" target="_blank" rel="noopener noreferrer">
  External Site
</a>
```

- `noopener` — Prevents the new page from accessing `window.opener` (security)
- `noreferrer` — Prevents sending the referrer header (privacy)

### `download` — Download Link

```html
<!-- Download with original filename -->
<a href="report.pdf" download>Download Report</a>

<!-- Download with custom filename -->
<a href="report.pdf" download="Annual-Report-2025.pdf">Download Report</a>
```

### `title` — Tooltip

```html
<a href="about.html" title="Learn more about our company">About Us</a>
```

### `hreflang` — Language of Linked Page

```html
<a href="https://example.fr" hreflang="fr">Version française</a>
```

### `type` — MIME Type of Linked Resource

```html
<a href="data.json" type="application/json">View JSON Data</a>
```

---

## Special Link Types

### Email Link

```html
<a href="mailto:info@example.com">Email Us</a>

<!-- With subject and body -->
<a href="mailto:info@example.com?subject=Hello&body=I%20have%20a%20question">
  Email with Subject
</a>

<!-- Multiple recipients -->
<a href="mailto:a@example.com,b@example.com?cc=c@example.com&bcc=d@example.com">
  Email Multiple
</a>
```

### Phone Link

```html
<a href="tel:+1234567890">Call Us: +1 (234) 567-890</a>
<a href="tel:+911234567890">+91 12345 67890</a>
```

### SMS Link

```html
<a href="sms:+1234567890">Send SMS</a>
<a href="sms:+1234567890?body=Hello">Send SMS with Message</a>
```

### WhatsApp Link

```html
<a href="https://wa.me/911234567890">Chat on WhatsApp</a>
<a href="https://wa.me/911234567890?text=Hello">Chat with Message</a>
```

### JavaScript Link (Avoid)

```html
<!-- ❌ Avoid using javascript: in href -->
<a href="javascript:void(0)">Click Me</a>

<!-- ✅ Better: use a button -->
<button onclick="doSomething()">Click Me</button>
```

---

## `rel` Attribute Values

```html
<a href="page.html" rel="nofollow">Don't follow for SEO</a>
```

| Value | Purpose |
|-------|---------|
| `nofollow` | Tells search engines not to follow this link |
| `noopener` | Security: prevents `window.opener` access |
| `noreferrer` | Privacy: prevents referrer header |
| `external` | Indicates external link |
| `author` | Link to author's profile |
| `license` | Link to license information |
| `prev` / `next` | Previous/next page in a series |
| `bookmark` | Permanent link (permalink) |
| `help` | Link to help/context information |
| `sponsored` | Paid/sponsored link (SEO) |
| `ugc` | User-generated content link (SEO) |

---

## Link States (CSS)

```css
/* Unvisited link */
a:link { color: blue; }

/* Visited link */
a:visited { color: purple; }

/* Mouse hover */
a:hover { color: red; text-decoration: underline; }

/* Active (being clicked) */
a:active { color: orange; }

/* Keyboard focus */
a:focus-visible { outline: 2px solid blue; }
```

> **LVHA order** — Always style in this order: Link, Visited, Hover, Active.

---

## Navigation Best Practices

```html
<nav>
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/services">Services</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>
```

- Use `<nav>` for main navigation blocks
- Use `<ul>` + `<li>` for navigation lists (accessible)
- `aria-current="page"` marks the current page link
- Make links **descriptive** — avoid "Click here" or "Read more"

```html
<!-- ❌ Bad: vague link text -->
<a href="report.pdf">Click here</a>

<!-- ✅ Good: descriptive link text -->
<a href="report.pdf">Download the 2025 Annual Report (PDF, 2.4 MB)</a>
```

---

## Skip Navigation Link (Accessibility)

```html
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <header>...</header>
  <nav>...</nav>
  <main id="main-content">
    ...
  </main>
</body>
```

```css
.skip-link {
  position: absolute;
  left: -9999px;
}
.skip-link:focus {
  position: static;
  left: auto;
}
```
