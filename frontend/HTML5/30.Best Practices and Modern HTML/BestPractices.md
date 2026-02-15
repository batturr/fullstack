# 30. Best Practices & Modern HTML

## Document Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title — Site Name</title>
  <meta name="description" content="Concise page description.">
  <link rel="icon" href="/favicon.ico">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>...</header>
  <nav>...</nav>
  <main>...</main>
  <footer>...</footer>
  <script src="app.js" defer></script>
</body>
</html>
```

---

## HTML Best Practices

### 1. Always Declare DOCTYPE and Language

```html
<!DOCTYPE html>
<html lang="en">
```

- `<!DOCTYPE html>` triggers standards mode
- `lang` attribute helps screen readers, translation, and search engines

### 2. Use Semantic Elements

```html
<!-- ❌ Divitis -->
<div class="header">
  <div class="nav">...</div>
</div>
<div class="content">...</div>
<div class="footer">...</div>

<!-- ✅ Semantic -->
<header>
  <nav>...</nav>
</header>
<main>...</main>
<footer>...</footer>
```

### 3. Use Proper Heading Hierarchy

```html
<!-- ✅ Sequential heading order -->
<h1>Page Title</h1>           <!-- Only ONE h1 per page -->
  <h2>Section</h2>
    <h3>Subsection</h3>
    <h3>Subsection</h3>
  <h2>Section</h2>
    <h3>Subsection</h3>
      <h4>Sub-subsection</h4>

<!-- ❌ Skipping levels -->
<h1>Title</h1>
<h4>Jump to h4</h4>           <!-- Skipped h2 and h3 -->
```

### 4. Always Include Alt Text for Images

```html
<!-- Informative image -->
<img src="chart.png" alt="Revenue grew 25% in Q4 2024">

<!-- Decorative image -->
<img src="divider.png" alt="">

<!-- Never omit alt entirely -->
<img src="photo.jpg">  <!-- ❌ Missing alt attribute -->
```

### 5. Use Labels for Form Controls

```html
<!-- ✅ Always associate labels with inputs -->
<label for="email">Email:</label>
<input type="email" id="email" name="email" required>

<!-- ❌ No label -->
<input type="email" placeholder="Email">
```

### 6. Close All Tags Properly

```html
<!-- ✅ Properly nested -->
<p>This is <strong>bold and <em>italic</em></strong> text.</p>

<!-- ❌ Improperly nested -->
<p>This is <strong>bold and <em>italic</strong></em> text.</p>
```

### 7. Use Lowercase Tag and Attribute Names

```html
<!-- ✅ Standard convention -->
<div class="container">
  <img src="photo.jpg" alt="Photo">
</div>

<!-- ❌ Avoid -->
<DIV CLASS="container">
  <IMG SRC="photo.jpg" ALT="Photo">
</DIV>
```

### 8. Quote All Attribute Values

```html
<!-- ✅ Always use quotes -->
<div class="card" data-id="123">

<!-- ❌ Avoid unquoted -->
<div class=card data-id=123>
```

---

## Content Models

HTML5 defines clear rules about what can go where:

| Category | Elements | Can Contain |
|----------|----------|------------|
| **Flow** | Most elements (div, p, section, article...) | Flow + phrasing |
| **Phrasing** | Inline text elements (span, a, em, strong...) | Phrasing only |
| **Heading** | h1–h6, hgroup | Phrasing |
| **Sectioning** | article, aside, nav, section | Flow |
| **Embedded** | img, video, audio, iframe, canvas, svg | Specific to each |
| **Interactive** | a, button, details, input, select, textarea | Varies (no nesting) |

### Common Nesting Rules

```html
<!-- ✅ Block inside block -->
<div><p>Paragraph</p></div>

<!-- ❌ Block inside inline -->
<span><div>Block inside span</div></span>

<!-- ❌ Interactive inside interactive -->
<a href="/"><button>Click</button></a>

<!-- ✅ Inline inside block -->
<p>Text with <strong>bold</strong> and <a href="/">link</a>.</p>

<!-- ❌ p cannot contain block elements -->
<p><div>Block inside p</div></p>
```

---

## Security Best Practices

### Links to External Sites

```html
<!-- Always use rel="noopener noreferrer" with target="_blank" -->
<a href="https://external-site.com" target="_blank" rel="noopener noreferrer">
  External Link
</a>
```

- `noopener` prevents the new page from accessing `window.opener`
- `noreferrer` prevents sending the referrer header

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; img-src 'self' https:; script-src 'self';">
```

### Avoid Inline JavaScript

```html
<!-- ❌ Inline event handlers (XSS risk, bad practice) -->
<button onclick="doSomething()">Click</button>

<!-- ✅ Use event listeners -->
<button id="myBtn">Click</button>
<script>
  document.getElementById('myBtn').addEventListener('click', doSomething);
</script>
```

### Sanitize User Input

```html
<!-- ❌ Never inject raw user input into the page -->
<div id="output"></div>
<script>
  // ❌ XSS vulnerability
  output.innerHTML = userInput;
  
  // ✅ Safe: use textContent
  output.textContent = userInput;
</script>
```

---

## Modern HTML Features (2023-2025)

### `<search>` Element

```html
<search>
  <form action="/search">
    <input type="search" name="q" placeholder="Search...">
    <button type="submit">Search</button>
  </form>
</search>
```

### `popover` Attribute

```html
<button popovertarget="info">Show Info</button>
<div id="info" popover>
  <p>This is a popover! Click outside to dismiss.</p>
</div>
```

- No JavaScript needed
- Automatically dismisses on outside click or Escape
- Supports `popover="auto"` (light dismiss) and `popover="manual"`

### `<dialog>` (Modal)

```html
<button onclick="document.getElementById('dlg').showModal()">Open</button>
<dialog id="dlg">
  <h2>Modal Title</h2>
  <p>Content...</p>
  <form method="dialog"><button>Close</button></form>
</dialog>
```

### Exclusive Accordion

```html
<details name="faq"><summary>Q1</summary><p>A1</p></details>
<details name="faq"><summary>Q2</summary><p>A2</p></details>
<details name="faq"><summary>Q3</summary><p>A3</p></details>
```

### `inert` Attribute

```html
<!-- Makes content non-interactive and invisible to screen readers -->
<div inert>
  <button>Can't click me</button>
  <a href="#">Can't reach me</a>
</div>
```

### Lazy Loading (Native)

```html
<img src="photo.jpg" loading="lazy" alt="Photo">
<iframe src="embed.html" loading="lazy"></iframe>
```

---

## HTML Validation

Always validate your HTML:

- **W3C Validator**: [validator.w3.org](https://validator.w3.org/)
- **Browser DevTools**: Check console for HTML parsing warnings
- **VS Code Extensions**: HTMLHint, W3C Web Validator

---

## Code Style Guide

| Rule | Good | Bad |
|------|------|-----|
| Indentation | 2 spaces consistently | Mixed tabs/spaces |
| Tag names | `<div>` (lowercase) | `<DIV>` |
| Attribute quotes | `class="name"` | `class=name` |
| Self-closing void tags | `<img>` or `<img />` | No consistency |
| Boolean attributes | `<input required>` | `<input required="true">` |
| ID naming | `kebab-case` | `camelCase` or `PascalCase` |
| Class naming | BEM or utility classes | Random names |

---

## Quick Reference: HTML5 Document Checklist

```
□ <!DOCTYPE html> declared
□ <html lang="..."> set
□ <meta charset="UTF-8"> first in <head>
□ <meta name="viewport" content="width=device-width, initial-scale=1.0">
□ <title> is descriptive and unique per page
□ <meta name="description" content="..."> set
□ Favicon included
□ One <h1> per page
□ Heading hierarchy is sequential (h1→h2→h3)
□ All images have appropriate alt text
□ All form controls have labels
□ External links have rel="noopener noreferrer"
□ Semantic tags used (header, nav, main, footer, article, section)
□ Scripts loaded with defer or async
□ HTML validates without errors
□ Page is accessible (keyboard, screen readers)
```
