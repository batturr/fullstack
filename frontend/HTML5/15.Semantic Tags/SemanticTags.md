# 15. Semantic Tags

## What Are Semantic Tags?

**Semantic tags** describe the **meaning** and **purpose** of their content, not just how it looks.

| Non-Semantic | Semantic |
|-------------|----------|
| `<div class="header">` | `<header>` |
| `<div class="nav">` | `<nav>` |
| `<div class="main">` | `<main>` |
| `<div class="sidebar">` | `<aside>` |
| `<div class="footer">` | `<footer>` |
| `<span class="time">` | `<time>` |

### Why Use Semantic Tags?

- **Accessibility** — Screen readers use them to navigate (landmarks)
- **SEO** — Search engines understand page structure better
- **Readability** — Developers understand code meaning faster
- **Maintainability** — Self-documenting code
- **Consistency** — Standard tags across all websites

---

## Page Structure

```
┌─────────────────────────────────────┐
│              <header>               │
│  ┌─────────────────────────────┐    │
│  │           <nav>             │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│              <main>                 │
│  ┌─────────────────┐ ┌──────────┐  │
│  │   <section>     │ │          │  │
│  │  ┌───────────┐  │ │ <aside>  │  │
│  │  │ <article> │  │ │          │  │
│  │  └───────────┘  │ │          │  │
│  │  ┌───────────┐  │ │          │  │
│  │  │ <article> │  │ │          │  │
│  │  └───────────┘  │ │          │  │
│  └─────────────────┘ └──────────┘  │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│              <footer>               │
└─────────────────────────────────────┘
```

---

## Semantic Tags Reference

### `<header>`

```html
<header>
  <img src="logo.svg" alt="Company Logo">
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>
```

- Introductory content or navigation for its parent
- Can be used for page header, article header, section header
- Multiple `<header>` elements allowed per page

### `<nav>`

```html
<nav aria-label="Main Navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>

<!-- Breadcrumb navigation -->
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li aria-current="page">Widget</li>
  </ol>
</nav>
```

- Major navigation blocks (main menu, breadcrumbs, pagination)
- Not all links need `<nav>` — only major navigation sections
- Use `aria-label` when there are multiple `<nav>` elements

### `<main>`

```html
<main>
  <!-- Primary content — unique to this page -->
</main>
```

- The **dominant content** of the page
- **Only one** `<main>` per page (unless others are hidden)
- Excludes repeated content (header, footer, sidebar navigation)
- Screen readers can jump directly to `<main>` (landmark)

### `<section>`

```html
<section>
  <h2>Our Services</h2>
  <p>We provide web development, design, and SEO.</p>
</section>
```

- A **thematic grouping** of content with a heading
- Use when: content naturally groups together and deserves a heading
- Don't use as a generic wrapper (use `<div>` for that)

### `<article>`

```html
<article>
  <header>
    <h2>Breaking News: HTML6 Announced</h2>
    <time datetime="2025-02-08">Feb 8, 2025</time>
  </header>
  <p>In a surprise announcement today...</p>
  <footer>
    <p>By Jane Reporter</p>
  </footer>
</article>
```

- **Self-contained** content that could be independently distributed
- Examples: blog post, news article, forum post, comment, product card
- Should have a heading
- Can be nested (comments inside an article)

### `<aside>`

```html
<aside>
  <h3>Related Articles</h3>
  <ul>
    <li><a href="/html-basics">HTML Basics</a></li>
    <li><a href="/css-guide">CSS Guide</a></li>
  </ul>
</aside>

<!-- Sidebar -->
<aside aria-label="Sidebar">
  <section>
    <h3>Categories</h3>
    <ul>...</ul>
  </section>
  <section>
    <h3>Recent Posts</h3>
    <ul>...</ul>
  </section>
</aside>
```

- Content **tangentially related** to surrounding content
- Examples: sidebar, pull quotes, ads, related links, glossary
- Can be used inside `<article>` for related info

### `<footer>`

```html
<footer>
  <p>&copy; 2025 Company Name. All rights reserved.</p>
  <nav>
    <a href="/privacy">Privacy Policy</a>
    <a href="/terms">Terms of Service</a>
  </nav>
</footer>
```

- Closing information for its parent
- Can be used for page footer, article footer, section footer
- Multiple `<footer>` elements allowed

---

## Additional Semantic Tags

### `<figure>` and `<figcaption>`

```html
<figure>
  <img src="chart.png" alt="Sales chart Q4 2024">
  <figcaption>Figure 1: Sales performance in Q4 2024</figcaption>
</figure>
```

- Self-contained content (image, diagram, code, quote) with an optional caption
- `<figcaption>` can be first or last child of `<figure>`

### `<time>`

```html
<p>Published <time datetime="2025-02-08T10:30:00">February 8, 2025 at 10:30 AM</time></p>
```

### `<mark>`

```html
<p>Search for <mark>semantic tags</mark> in the documentation.</p>
```

### `<address>`

```html
<address>
  Contact: <a href="mailto:info@example.com">info@example.com</a>
</address>
```

### `<details>` and `<summary>`

```html
<details>
  <summary>Show more information</summary>
  <p>Extended content here...</p>
</details>
```

### `<search>`

```html
<search>
  <form action="/search" method="GET">
    <input type="search" name="q" placeholder="Search...">
    <button type="submit">Search</button>
  </form>
</search>
```

> `<search>` is a new HTML element (2023+) that wraps search functionality.

---

## `<section>` vs `<article>` vs `<div>`

| Element | When to Use |
|---------|------------|
| `<section>` | Thematic group with a heading (chapters, tabbed content) |
| `<article>` | Self-contained, independently distributable content |
| `<div>` | No semantic meaning needed — just for styling/layout |

### Rule of Thumb

> If it could appear in an RSS feed or be shared independently → `<article>`
> If it's a logical section of the page with a heading → `<section>`
> If it's just a wrapper for CSS → `<div>`

---

## Complete Semantic Page Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Blog</title>
</head>
<body>
  <header>
    <h1>My Blog</h1>
    <nav aria-label="Main">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/archive">Archive</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section aria-label="Latest Posts">
      <h2>Latest Posts</h2>
      
      <article>
        <header>
          <h3><a href="/post-1">Understanding Semantic HTML</a></h3>
          <time datetime="2025-02-08">Feb 8, 2025</time>
        </header>
        <p>Semantic HTML gives meaning to your markup...</p>
        <footer>
          <p>By <a href="/author/john">John Doe</a></p>
        </footer>
      </article>

      <article>
        <header>
          <h3><a href="/post-2">CSS Grid Layout Guide</a></h3>
          <time datetime="2025-02-01">Feb 1, 2025</time>
        </header>
        <p>Learn how to create complex layouts with CSS Grid...</p>
      </article>
    </section>
  </main>

  <aside aria-label="Sidebar">
    <section>
      <h2>About Me</h2>
      <p>Web developer passionate about clean code.</p>
    </section>
    <section>
      <h2>Categories</h2>
      <ul>
        <li><a href="/cat/html">HTML</a></li>
        <li><a href="/cat/css">CSS</a></li>
        <li><a href="/cat/js">JavaScript</a></li>
      </ul>
    </section>
  </aside>

  <footer>
    <p>&copy; 2025 My Blog</p>
    <nav aria-label="Footer">
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </nav>
  </footer>
</body>
</html>
```
