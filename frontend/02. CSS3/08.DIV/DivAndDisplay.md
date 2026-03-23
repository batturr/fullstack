# 08. DIV, Display & Float

## The `<div>` Element

`<div>` is a **generic block-level container**. It has no semantic meaning — use it for grouping and layout.

```html
<div class="card">
  <div class="card-header">Title</div>
  <div class="card-body">Content</div>
  <div class="card-footer">Actions</div>
</div>
```

### Block vs Inline Elements

| Block Elements | Inline Elements |
|----------------|-----------------|
| `<div>`, `<p>`, `<h1>`–`<h6>` | `<span>`, `<a>`, `<strong>`, `<em>` |
| `<section>`, `<article>`, `<nav>` | `<img>`, `<input>`, `<code>` |
| `<ul>`, `<ol>`, `<li>` | `<label>`, `<abbr>`, `<br>` |
| `<form>`, `<table>`, `<header>` | `<button>`, `<select>`, `<textarea>` |
| Starts on new line | Flows inline with text |
| Takes full available width | Takes only content width |
| Width/height work | Width/height don't work |
| All margins work | Top/bottom margins don't work |

---

## Display Property

### Core Display Values

```css
div { display: block; }          /* Full width, new line */
span { display: inline; }        /* Content width, inline flow */
.badge { display: inline-block; } /* Inline flow + accepts width/height */
.hidden { display: none; }         /* Removed from layout (no space) */
```

### display: none vs visibility: hidden

```css
.gone { display: none; }        /* Element is REMOVED from layout */
.invisible { visibility: hidden; }  /* Element is INVISIBLE but still occupies space */
```

### display: contents

Removes the box but keeps children in layout:

```css
.wrapper {
  display: contents;  /* As if wrapper doesn't exist — children participate in parent's layout */
}
```

### display: flow-root

Creates a new block formatting context (clears floats):

```css
.clearfix {
  display: flow-root;    /* Modern replacement for clearfix hacks */
}
```

---

## Width & Height

```css
div {
  width: 300px;              /* Fixed width */
  width: 50%;                /* Percentage of parent */
  width: 100vw;              /* Full viewport width */
  width: fit-content;        /* As wide as content, up to available space */
  width: min-content;        /* Narrowest without overflow */
  width: max-content;        /* Widest — no wrapping */
  width: auto;               /* Browser calculates (default) */
}

div {
  height: 200px;
  height: 100vh;
  height: 100dvh;            /* Dynamic viewport height (mobile-safe) */
  min-height: 100vh;         /* At least full viewport */
  max-height: 500px;
}
```

### min/max Width & Height

```css
.container {
  width: 90%;
  max-width: 1200px;         /* Never wider than 1200px */
  min-width: 320px;          /* Never narrower than 320px */
  margin: 0 auto;            /* Center horizontally */
}

.card {
  min-height: 200px;         /* At least this tall */
  max-height: 80vh;          /* Never taller than 80% viewport */
}
```

---

## Float

Float removes an element from normal flow and pushes it left or right:

```css
img { float: left; }      /* Image floats left, text wraps around */
img { float: right; }     /* Image floats right */
div { float: none; }      /* Default — no float */
```

### Float Layout (Legacy)

```css
.col-left {
  float: left;
  width: 30%;
}
.col-right {
  float: left;
  width: 70%;
}
```

---

## Clear

Prevents elements from sitting beside floated elements:

```css
.footer {
  clear: both;      /* Don't allow floats on either side */
  clear: left;      /* Don't allow left floats */
  clear: right;     /* Don't allow right floats */
}
```

### Clearfix (Legacy Pattern)

```css
/* Old way — clearfix hack */
.clearfix::after {
  content: "";
  display: table;
  clear: both;
}

/* Modern way — use flow-root */
.parent {
  display: flow-root;    /* Contains floats automatically */
}
```

> **Modern CSS:** Use Flexbox or Grid instead of float for layouts. Float is now mainly used for wrapping text around images.

---

## Box-Sizing

Controls how width/height are calculated:

```css
/* content-box (default): width = content only */
div {
  box-sizing: content-box;
  width: 300px;
  padding: 20px;
  border: 5px solid black;
  /* Total visual width: 300 + 20 + 20 + 5 + 5 = 350px */
}

/* border-box: width = content + padding + border */
div {
  box-sizing: border-box;
  width: 300px;
  padding: 20px;
  border: 5px solid black;
  /* Total visual width: 300px (content shrinks to fit) */
}
```

### Universal Box-Sizing Reset (Best Practice)

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

---

## Semantic Alternatives to `<div>`

| Instead of `<div class="...">` | Use |
|--------------------------------|-----|
| Page header | `<header>` |
| Navigation | `<nav>` |
| Main content | `<main>` |
| Article/post | `<article>` |
| Related group | `<section>` |
| Sidebar | `<aside>` |
| Footer | `<footer>` |
| Figure + caption | `<figure>` + `<figcaption>` |

Only use `<div>` when no semantic element fits.
