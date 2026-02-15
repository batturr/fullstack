# 11. Div and Span

## `<div>` — Block Container

```html
<div>
  <h2>Section Title</h2>
  <p>This content is grouped inside a div.</p>
</div>
```

- **Block-level** element — starts on a new line, takes full width
- Generic **container** for grouping content
- No semantic meaning — purely structural
- Most common use: apply CSS styles to a group of elements

```html
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
  </div>
  <div class="card-body">
    <p>Card content goes here.</p>
  </div>
  <div class="card-footer">
    <button>Read More</button>
  </div>
</div>
```

---

## `<span>` — Inline Container

```html
<p>The price is <span class="price">$29.99</span> per month.</p>
<p>Status: <span style="color: green;">Active</span></p>
```

- **Inline** element — stays on the same line, takes only needed width
- Generic inline container for styling a piece of text
- No semantic meaning

---

## Block vs Inline Comparison

| Feature | `<div>` (Block) | `<span>` (Inline) |
|---------|----------------|-------------------|
| New line | ✅ Starts on new line | ❌ Stays inline |
| Width | Full available width | Only content width |
| Height | Respects height | Ignores height |
| Margin | All four sides work | Only left/right work |
| Padding | All four sides work | All sides work (but may overlap vertically) |
| Can contain | Block + inline elements | Inline elements only |
| Use case | Sections, containers | Styling inline text |

---

## `display` Values

```css
.block { display: block; }          /* Div default */
.inline { display: inline; }        /* Span default */
.inline-block { display: inline-block; }  /* Best of both */
.none { display: none; }            /* Hidden completely */
```

### `inline-block`

Combines inline flow with block sizing:

```css
.badge {
  display: inline-block;
  padding: 4px 12px;         /* Padding works fully */
  width: 100px;              /* Width works */
  height: 30px;              /* Height works */
  text-align: center;
}
```

---

## When to Use `<div>` vs Semantic Tags

```html
<!-- ❌ Divitis: using div for everything -->
<div class="header">
  <div class="nav">
    <div class="nav-item"><a href="/">Home</a></div>
  </div>
</div>

<!-- ✅ Semantic: use appropriate tags -->
<header>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>
```

### When `<div>` IS appropriate:
- No semantic tag fits the purpose
- Purely for styling/layout grouping
- CSS Grid or Flexbox wrapper
- JavaScript DOM manipulation target

### Semantic Alternatives

| Instead of `<div class="...">` | Use |
|-------------------------------|-----|
| `<div class="header">` | `<header>` |
| `<div class="nav">` | `<nav>` |
| `<div class="main">` | `<main>` |
| `<div class="sidebar">` | `<aside>` |
| `<div class="footer">` | `<footer>` |
| `<div class="article">` | `<article>` |
| `<div class="section">` | `<section>` |

---

## When to Use `<span>` vs Semantic Tags

```html
<!-- ❌ Using span when a semantic tag exists -->
<p><span class="important">Warning!</span></p>

<!-- ✅ Use semantic tag -->
<p><strong>Warning!</strong></p>
```

| Instead of `<span class="...">` | Use |
|---------------------------------|-----|
| `<span class="bold">` | `<strong>` or `<b>` |
| `<span class="italic">` | `<em>` or `<i>` |
| `<span class="code">` | `<code>` |
| `<span class="highlight">` | `<mark>` |
| `<span class="abbrev">` | `<abbr>` |
| `<span class="time">` | `<time>` |

---

## Common Layout Patterns

### Wrapper / Container

```html
<div class="container">
  <!-- Page content centered with max-width -->
</div>
```

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

### Card Grid

```html
<div class="grid">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>
```

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}
```
