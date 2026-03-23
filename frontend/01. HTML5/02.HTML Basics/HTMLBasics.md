# 02. HTML Basics

## What is HTML?

- **HTML** = **H**yper**T**ext **M**arkup **L**anguage
- **HyperText** — Text that links to other text/pages (hyperlinks)
- **Markup** — Tags that annotate content to define its structure
- **Language** — A set of rules and syntax for writing web pages
- HTML is **NOT** a programming language — it's a markup language (no logic, loops, or conditions)

---

## HTML Versions

| Version | Year | Key Features |
|---------|------|-------------|
| HTML 1.0 | 1991 | Basic text, links |
| HTML 2.0 | 1995 | Forms, tables |
| HTML 3.2 | 1997 | Scripts, styles, applets |
| HTML 4.01 | 1999 | CSS separation, accessibility |
| XHTML 1.0 | 2000 | Stricter XML-based syntax |
| **HTML5** | **2014** | Semantic tags, audio/video, Canvas, APIs |
| HTML 5.1 | 2016 | Refinements, `picture` element |
| HTML 5.2 | 2017 | `dialog` element, payment API |
| **Living Standard** | **Ongoing** | Continuously updated by WHATWG |

> After HTML 5.2, the W3C and WHATWG adopted a **Living Standard** model — HTML is continuously updated rather than released in numbered versions.

---

## What is a Tag?

A tag is a keyword enclosed in angle brackets that tells the browser how to display content.

```html
<tagname>Content</tagname>
```

### Types of Tags

| Type | Description | Example |
|------|-------------|---------|
| **Paired (Container)** | Has opening and closing tag | `<p>Text</p>` |
| **Self-closing (Void)** | No closing tag needed | `<br>`, `<img>`, `<input>`, `<hr>` |

### Common Self-Closing (Void) Tags

```html
<br>          <!-- Line break -->
<hr>          <!-- Horizontal rule -->
<img>         <!-- Image -->
<input>       <!-- Form input -->
<meta>        <!-- Metadata -->
<link>        <!-- External resource link -->
<source>      <!-- Media source -->
<area>        <!-- Image map area -->
<col>         <!-- Table column -->
<wbr>         <!-- Word break opportunity -->
```

> In HTML5, the trailing slash is **optional**: `<br>` and `<br/>` are both valid.

---

## Tags vs Elements vs Attributes

```html
<a href="https://google.com" target="_blank">Google</a>
 ↑  └──────── Attributes ────────────┘       ↑
 │                                           │
 Opening Tag                          Closing Tag
 └──────────────── Element ──────────────────┘
```

| Term | Definition |
|------|-----------|
| **Tag** | The markup keyword (`<a>`, `</a>`) |
| **Element** | Opening tag + content + closing tag |
| **Attribute** | Extra information inside the opening tag (`href="..."`) |

### Attribute Syntax

```html
<tag attribute="value" attribute2="value2">Content</tag>
```

- Attributes are always in the **opening tag**
- Attributes come in **name="value"** pairs
- Values should be wrapped in **quotes** (double `"` or single `'`)
- Some attributes are **boolean** (presence = true): `<input disabled>`

---

## HTML Document Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>
</head>
<body>
    <!-- Visible content goes here -->
</body>
</html>
```

### Explanation

| Part | Purpose |
|------|---------|
| `<!DOCTYPE html>` | Tells the browser this is an HTML5 document |
| `<html lang="en">` | Root element; `lang` helps search engines & screen readers |
| `<head>` | Metadata (title, charset, styles, scripts) — NOT displayed |
| `<meta charset="UTF-8">` | Character encoding (supports all languages & emojis) |
| `<meta name="viewport">` | Responsive — fits content to device width |
| `<title>` | Page title shown in browser tab and search results |
| `<body>` | All visible page content |

---

## DOCTYPE Declaration

```html
<!-- HTML5 (simple) -->
<!DOCTYPE html>

<!-- HTML 4.01 Strict (old, verbose) -->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">

<!-- XHTML 1.0 Strict (old) -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
```

- `<!DOCTYPE html>` is **not** an HTML tag — it's an instruction to the browser
- Must be the **very first line** of the HTML document
- Case-insensitive: `<!doctype html>` also works
- Without it, the browser enters **quirks mode** (inconsistent rendering)

---

## Character Encoding

```html
<meta charset="UTF-8">
```

| Encoding | Characters Supported |
|----------|---------------------|
| ASCII | English letters, numbers, basic symbols (128 chars) |
| ISO-8859-1 | Western European languages (256 chars) |
| **UTF-8** | **All languages, emojis, symbols** (1,112,064 chars) |

> Always use **UTF-8**. It covers virtually every character in every language.

---

## Comments

```html
<!-- This is a comment — not displayed in browser -->

<!--
    Multi-line
    comment
-->

<!-- TODO: Add navigation menu -->
```

- Comments are **not rendered** in the browser
- Useful for notes, TODOs, temporarily hiding code
- **Visible** in page source (View Source / DevTools) — don't put secrets here

---

## Block vs Inline Elements

| Block Elements | Inline Elements |
|----------------|----------------|
| Start on a **new line** | Stay on the **same line** |
| Take **full width** available | Take only **needed width** |
| Can contain block + inline | Can contain only inline |
| `<div>`, `<p>`, `<h1>`-`<h6>`, `<ul>`, `<table>`, `<form>`, `<section>` | `<span>`, `<a>`, `<strong>`, `<em>`, `<img>`, `<input>`, `<br>` |

---

## Steps to Create Your First HTML Page

1. Open a text editor (VS Code, Notepad++, Sublime Text)
2. Create a new file and save as `index.html`
3. Type the HTML boilerplate:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is my first HTML page.</p>
</body>
</html>
```

4. Open the file in a browser (double-click or use Live Server in VS Code)

> **VS Code Shortcut:** Type `!` and press **Tab** to generate the HTML5 boilerplate instantly.
