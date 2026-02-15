# 11. Types of Style Sheets

## Overview

| Type | Where Defined | Scope | Priority |
|------|--------------|-------|----------|
| **Inline** | `style` attribute on element | Single element | Highest (1,0,0) |
| **Internal** | `<style>` tag in `<head>` | Single page | Normal specificity |
| **External** | Separate `.css` file via `<link>` | Multiple pages | Normal specificity |

---

## 1. Inline Styles

Applied directly to an HTML element using the `style` attribute:

```html
<h1 style="color: navy; font-size: 32px; text-align: center;">
  Inline Styled Heading
</h1>

<p style="background: #f0f0f0; padding: 16px; border-radius: 8px;">
  This paragraph has inline styles.
</p>
```

### When to Use
- Dynamic styles set by JavaScript: `element.style.color = 'red'`
- HTML email templates (many email clients don't support `<style>` blocks)
- Quick prototyping / debugging

### When NOT to Use
- ❌ Regular styling — use classes instead
- ❌ Reusable styles — inline can't be shared
- ❌ Complex styles — no pseudo-classes, media queries, or animations

### Drawbacks
- Highest specificity (1,0,0) — very hard to override
- No reusability
- Mixes content with presentation
- Cannot use pseudo-classes (`:hover`), pseudo-elements (`::before`), media queries, or keyframes

---

## 2. Internal (Embedded) Style Sheet

Defined inside a `<style>` tag in the HTML `<head>`:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: "Segoe UI", sans-serif;
      background: #fafafa;
    }
    
    h1 {
      color: navy;
      text-align: center;
    }
    
    .card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <h1>Page Title</h1>
  <div class="card">Content</div>
</body>
</html>
```

### When to Use
- Single-page applications with unique styles
- Critical CSS (above-the-fold first-paint styles)
- Small projects with only one HTML file
- Overriding external styles for a specific page

### Drawbacks
- Not reusable across pages
- Increases HTML file size
- Can't be cached separately by the browser

---

## 3. External Style Sheet

A separate `.css` file linked in HTML:

```html
<!-- In <head> -->
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="https://cdn.example.com/theme.css">
```

```css
/* styles.css */
body {
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
```

### Benefits
- ✅ **Reusable** across all pages
- ✅ **Cached** by the browser (faster loads after first visit)
- ✅ **Clean separation** of content (HTML) and presentation (CSS)
- ✅ **Maintainable** — change one file, affects entire site
- ✅ Supports all CSS features (pseudo-classes, media queries, animations)

---

## @import (Importing CSS)

Load one CSS file inside another:

```css
/* In styles.css */
@import url("reset.css");
@import url("variables.css");
@import url("components.css");
@import url("utilities.css");

/* Conditional import */
@import url("print.css") print;
@import url("mobile.css") (max-width: 768px);
```

### @import vs `<link>`

| Feature | `<link>` | `@import` |
|---------|----------|-----------|
| Loading | **Parallel** | Sequential (blocking) |
| Performance | **Better** | Slower |
| Where used | HTML only | CSS or `<style>` tag |
| Media queries | `media` attribute | Inline condition |
| Support | All browsers | All browsers |

> **Best Practice:** Prefer `<link>` for performance. `@import` causes waterfall loading (file must be downloaded and parsed before next import starts).

---

## Cascade Order (Priority Low → High)

When the same property is set multiple times, the cascade determines which wins:

```
1. Browser default styles      (lowest priority)
2. External style sheet
3. Internal style sheet
4. Inline styles               (highest priority)
5. !important                  (overrides everything)
```

### Complete Cascade Algorithm

1. **Origin**: User-agent → User → Author
2. **Layer**: `@layer` order (earlier layers have lower priority)
3. **Specificity**: (inline, IDs, classes, types)
4. **Scope proximity**: `@scope` closeness
5. **Source order**: Later declarations win

### Example of Cascade

```html
<!-- External: styles.css -->
<link rel="stylesheet" href="styles.css">

<!-- Internal -->
<style>
  p { color: blue; }
</style>

<!-- Inline -->
<p style="color: green;">What color am I?</p>
```

Result: **green** (inline wins over internal wins over external)

---

## Organizing External Style Sheets

### Single File (Small Projects)

```
project/
├── index.html
└── styles.css
```

### Multiple Files (Medium Projects)

```
project/
├── index.html
├── css/
│   ├── reset.css
│   ├── styles.css
│   └── responsive.css
```

```html
<link rel="stylesheet" href="css/reset.css">
<link rel="stylesheet" href="css/styles.css">
<link rel="stylesheet" href="css/responsive.css">
```

### Architecture (Large Projects)

```
css/
├── base/
│   ├── reset.css
│   ├── typography.css
│   └── variables.css
├── components/
│   ├── buttons.css
│   ├── cards.css
│   └── forms.css
├── layout/
│   ├── header.css
│   ├── footer.css
│   └── grid.css
├── pages/
│   ├── home.css
│   └── about.css
├── utilities/
│   └── helpers.css
└── main.css          ← imports all above
```

---

## Performance Tips

```html
<!-- Preload critical CSS -->
<link rel="preload" href="critical.css" as="style">
<link rel="stylesheet" href="critical.css">

<!-- Async non-critical CSS -->
<link rel="preload" href="non-critical.css" as="style" onload="this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="non-critical.css"></noscript>

<!-- Print styles (don't block rendering) -->
<link rel="stylesheet" href="print.css" media="print">
```
