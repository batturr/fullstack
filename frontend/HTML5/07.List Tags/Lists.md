# 07. List Tags

## Three Types of Lists

| Type | Tag | Purpose |
|------|-----|---------|
| **Ordered** | `<ol>` | Numbered/sequenced items |
| **Unordered** | `<ul>` | Bulleted items (no order) |
| **Description** | `<dl>` | Term-definition pairs |

---

## Ordered List (`<ol>`)

```html
<ol>
  <li>First item</li>
  <li>Second item</li>
  <li>Third item</li>
</ol>
```

**Output:** 1. First item  2. Second item  3. Third item

### Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `type` | Numbering style | `type="A"`, `type="a"`, `type="I"`, `type="i"`, `type="1"` |
| `start` | Starting number | `start="5"` |
| `reversed` | Count backwards | `<ol reversed>` |

```html
<!-- Uppercase letters starting from C -->
<ol type="A" start="3">
  <li>Item C</li>
  <li>Item D</li>
  <li>Item E</li>
</ol>

<!-- Roman numerals -->
<ol type="I">
  <li>Chapter I</li>
  <li>Chapter II</li>
  <li>Chapter III</li>
</ol>

<!-- Reversed countdown -->
<ol reversed start="5">
  <li>Five</li>
  <li>Four</li>
  <li>Three</li>
</ol>

<!-- Individual item value -->
<ol>
  <li value="10">Starts at 10</li>
  <li>Continues to 11</li>
  <li value="20">Jumps to 20</li>
  <li>Continues to 21</li>
</ol>
```

| Type Value | Style | Example |
|-----------|-------|---------|
| `1` | Decimal (default) | 1, 2, 3 |
| `A` | Uppercase letters | A, B, C |
| `a` | Lowercase letters | a, b, c |
| `I` | Uppercase Roman | I, II, III |
| `i` | Lowercase Roman | i, ii, iii |

---

## Unordered List (`<ul>`)

```html
<ul>
  <li>Apple</li>
  <li>Banana</li>
  <li>Cherry</li>
</ul>
```

**Output:** • Apple  • Banana  • Cherry

### Bullet Styles (CSS)

```css
ul { list-style-type: disc; }       /* ● Default filled circle */
ul { list-style-type: circle; }     /* ○ Hollow circle */
ul { list-style-type: square; }     /* ■ Filled square */
ul { list-style-type: none; }       /* No bullets (for navigation) */
```

---

## Nested Lists

```html
<ul>
  <li>Fruits
    <ul>
      <li>Apple</li>
      <li>Banana
        <ul>
          <li>Raw Banana</li>
          <li>Ripe Banana</li>
        </ul>
      </li>
    </ul>
  </li>
  <li>Vegetables
    <ol>
      <li>Carrot</li>
      <li>Broccoli</li>
    </ol>
  </li>
</ul>
```

- You can mix `<ul>` and `<ol>` when nesting
- Nested lists go **inside** the `<li>` element

---

## Description List (`<dl>`)

```html
<dl>
  <dt>HTML</dt>
  <dd>HyperText Markup Language — structure of web pages.</dd>

  <dt>CSS</dt>
  <dd>Cascading Style Sheets — styling and layout.</dd>

  <dt>JavaScript</dt>
  <dd>Programming language for web interactivity.</dd>
</dl>
```

| Tag | Purpose |
|-----|---------|
| `<dl>` | Description list container |
| `<dt>` | Description **term** (the key/label) |
| `<dd>` | Description **details** (the value/definition) |

### Multiple Definitions per Term

```html
<dl>
  <dt>HTML</dt>
  <dd>HyperText Markup Language</dd>
  <dd>The standard markup language for web pages</dd>
</dl>
```

### Multiple Terms per Definition

```html
<dl>
  <dt>HTML</dt>
  <dt>HyperText Markup Language</dt>
  <dd>The standard markup language for creating web pages.</dd>
</dl>
```

---

## Navigation Lists

```html
<nav>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/services">Services</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>
```

```css
nav ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 1rem;
}
```

---

## Accessible Lists

- Screen readers announce "list, 5 items" when they encounter a list
- Navigation menus should use `<ul>` inside `<nav>`
- Steps or rankings should use `<ol>`
- FAQs and glossaries work well as `<dl>`

---

## `<li>` Allowed Content

The `<li>` element can contain:
- Text
- Inline elements (`<a>`, `<strong>`, `<em>`, etc.)
- Block elements (`<p>`, `<div>`, `<h2>`, etc.)
- Other lists (nested lists)

```html
<ul>
  <li>
    <h3>Item Title</h3>
    <p>Item description with more details.</p>
  </li>
</ul>
```
