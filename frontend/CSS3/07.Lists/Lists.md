# 07. Lists

## list-style-type

### Unordered List (`<ul>`)

| Value | Marker |
|-------|--------|
| `disc` | ● (default) |
| `circle` | ○ |
| `square` | ■ |
| `none` | (no marker) |

```css
ul { list-style-type: disc; }
ul.outline { list-style-type: circle; }
ul.custom { list-style-type: square; }
ul.clean { list-style-type: none; }
```

### Ordered List (`<ol>`)

| Value | Style |
|-------|-------|
| `decimal` | 1, 2, 3 (default) |
| `decimal-leading-zero` | 01, 02, 03 |
| `lower-alpha` | a, b, c |
| `upper-alpha` | A, B, C |
| `lower-roman` | i, ii, iii |
| `upper-roman` | I, II, III |
| `lower-greek` | α, β, γ |
| `none` | (no marker) |

```css
ol { list-style-type: decimal; }
ol.legal { list-style-type: upper-roman; }
ol.outline { list-style-type: lower-alpha; }
```

---

## list-style-position

```css
ul { list-style-position: outside; }   /* Default: marker outside content box */
ul { list-style-position: inside; }    /* Marker inside content, text wraps around it */
```

---

## list-style-image

Custom image as bullet marker:

```css
ul {
  list-style-image: url("arrow.png");
}
```

> **Tip:** Better approach is using `::marker` or `::before` pseudo-elements for more control.

---

## list-style (Shorthand)

```css
/* type position image */
ul {
  list-style: square inside url("arrow.png");
}

/* Common: remove all styling */
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
```

---

## ::marker Pseudo-Element

Style the bullet/number directly:

```css
li::marker {
  color: #3b82f6;
  font-size: 1.25em;
  font-weight: bold;
}

/* Emoji markers */
li::marker {
  content: "✓ ";
  color: green;
}

/* Different markers per item */
li.done::marker { content: "✅ "; }
li.pending::marker { content: "⏳ "; }
li.error::marker { content: "❌ "; }
```

---

## Custom Markers with ::before

More control than `::marker`:

```css
ul.custom {
  list-style: none;
  padding-left: 0;
}

ul.custom li {
  position: relative;
  padding-left: 1.5em;
}

ul.custom li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: #3b82f6;
  font-weight: bold;
}
```

---

## CSS Counters

Create custom numbering systems:

```css
/* Basic counter */
ol.custom {
  list-style: none;
  counter-reset: my-counter;     /* Initialize counter */
}

ol.custom li {
  counter-increment: my-counter;  /* Increment for each li */
  padding-left: 2em;
  position: relative;
}

ol.custom li::before {
  content: counter(my-counter) ". ";  /* Display counter */
  position: absolute;
  left: 0;
  font-weight: bold;
  color: #3b82f6;
}
```

### Nested Counters

```css
ol {
  counter-reset: section;
  list-style: none;
}

ol li {
  counter-increment: section;
}

ol li::before {
  content: counters(section, ".") " ";   /* Produces: 1.1, 1.2, 2.1 etc. */
  font-weight: bold;
}
```

### Custom Counter Styles (@counter-style)

```css
@counter-style emoji {
  system: cyclic;
  symbols: "🔴" "🟢" "🔵" "🟡";
  suffix: " ";
}

ul.emoji {
  list-style-type: emoji;
}
```

---

## Common List Patterns

### Navigation Menu (Reset List)

```css
nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 1.5rem;
}

nav li a {
  text-decoration: none;
  color: #374151;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s;
}

nav li a:hover {
  border-bottom-color: #3b82f6;
}
```

### Checklist

```css
.checklist {
  list-style: none;
  padding: 0;
}

.checklist li {
  padding: 0.5rem 0 0.5rem 2rem;
  position: relative;
}

.checklist li::before {
  content: "☐";
  position: absolute;
  left: 0;
  font-size: 1.2em;
}

.checklist li.checked::before {
  content: "☑";
  color: #22c55e;
}
```

### Numbered Steps

```css
.steps {
  list-style: none;
  counter-reset: step;
  padding: 0;
}

.steps li {
  counter-increment: step;
  padding: 1rem 0 1rem 3rem;
  position: relative;
  border-left: 2px solid #e5e7eb;
  margin-left: 1rem;
}

.steps li::before {
  content: counter(step);
  position: absolute;
  left: -1rem;
  top: 1rem;
  width: 2rem;
  height: 2rem;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
}
```
