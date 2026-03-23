# 05. Span — Inline Element

## What is `<span>`?

`<span>` is a **generic inline container** — it wraps small portions of text or inline content for styling without breaking the flow.

| Feature | `<span>` (Inline) | `<div>` (Block) |
|---------|-------------------|-----------------|
| Display | `inline` | `block` |
| Width | Content width only | Full available width |
| New line? | No | Yes |
| Contains | Text, inline elements | Anything (block + inline) |
| Width/Height | Not directly settable | Directly settable |
| Margin top/bottom | Not respected | Respected |
| Padding top/bottom | Visual only (doesn't push neighbors) | Pushes neighbors |

---

## Basic Usage

```html
<p>This is <span style="color: red; font-weight: bold;">important</span> text.</p>

<p>Your total is <span class="price">$49.99</span></p>
```

```css
.price {
  color: green;
  font-weight: bold;
  font-size: 1.25em;
}
```

---

## Inline vs Block vs Inline-Block

```css
/* Inline — No width/height, no top/bottom margin */
span { display: inline; }

/* Block — Full width, starts on a new line */
div { display: block; }

/* Inline-Block — Inline flow + accepts width/height/margin */
.badge {
  display: inline-block;
  padding: 4px 12px;
  width: 100px;          /* Works! */
  margin: 8px;           /* All directions work! */
  vertical-align: middle;
}
```

### When to Use Each

| Element | Use Case |
|---------|----------|
| `<span>` as inline | Highlighting a word, inline icons, text coloring |
| `<span>` as inline-block | Badges, tags, inline buttons, pills |
| `<div>` as block | Sections, containers, layout boxes |

---

## Common Patterns

### Highlight Text
```html
<p>Please read the <span class="highlight">terms and conditions</span> carefully.</p>
```
```css
.highlight {
  background-color: #fef08a;
  padding: 0 4px;
  border-radius: 2px;
}
```

### Badge / Tag
```html
<span class="badge">New</span>
<span class="badge badge-success">Active</span>
```
```css
.badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  background: #e5e7eb;
  color: #374151;
}
.badge-success {
  background: #dcfce7;
  color: #166534;
}
```

### Typed Keyword
```html
<p>Use the <span class="code">forEach()</span> method to iterate.</p>
```
```css
.code {
  font-family: "Fira Code", monospace;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.875em;
  color: #dc2626;
}
```

---

## Semantic Alternatives to `<span>`

Before using `<span>`, consider if a semantic element is more appropriate:

| Instead of | Use |
|------------|-----|
| `<span class="bold">` | `<strong>` (important text) |
| `<span class="italic">` | `<em>` (emphasis) |
| `<span class="code">` | `<code>` (code) |
| `<span class="small">` | `<small>` (fine print) |
| `<span class="highlight">` | `<mark>` (highlighted text) |
| `<span class="abbr">` | `<abbr>` (abbreviation) |
| `<span class="time">` | `<time>` (date/time) |

Use `<span>` only when no semantic element applies.
