# 12. CSS Selectors

## Complete Selector Reference

---

## Simple Selectors

### Universal Selector

```css
* { margin: 0; padding: 0; }          /* Select ALL elements */
*.intro { color: red; }                 /* Redundant, same as .intro */
```

### Type / Tag Selector

```css
p { color: #333; }
h1 { font-size: 2rem; }
a { text-decoration: none; }
```

### Class Selector

```css
.card { padding: 20px; }
.card.active { border-color: blue; }   /* Both classes on same element */
p.intro { font-size: 1.25em; }         /* <p> with class intro */
```

### ID Selector

```css
#header { background: navy; }
#main-content { max-width: 1200px; }
```

> IDs have high specificity (0,1,0,0). Prefer classes for styling.

---

## Attribute Selectors

```css
/* Has attribute */
[title] { cursor: help; }
a[href] { color: blue; }

/* Exact value */
input[type="text"] { border: 1px solid #ccc; }
a[target="_blank"] { /* external link */ }

/* Starts with */
a[href^="https"] { /* HTTPS links */ }
a[href^="#"] { /* Anchor links */ }

/* Ends with */
a[href$=".pdf"] { color: red; }
a[href$=".zip"] { /* ZIP downloads */ }

/* Contains substring */
a[href*="example"] { color: green; }

/* Contains word (space-separated) */
[class~="card"] { /* Has "card" as a separate word in class */ }

/* Starts with value or value- (hyphen-separated) */
[lang|="en"] { /* en, en-US, en-GB */ }

/* Case-insensitive flag */
a[href$=".PDF" i] { /* Matches .pdf, .PDF, .Pdf */ }
```

---

## Grouping Selector

Apply same styles to multiple selectors:

```css
h1, h2, h3 { font-family: "Inter", sans-serif; }
.btn, .link, a { cursor: pointer; }
```

---

## Combinator Selectors

### Descendant (space)

Selects elements **anywhere** inside the ancestor:

```css
article p { color: #333; }         /* Any <p> inside <article> */
.sidebar a { color: green; }       /* Any <a> inside .sidebar */
```

### Child (`>`)

Selects **direct children** only:

```css
ul > li { list-style: disc; }      /* Direct <li> children only */
.nav > a { font-weight: bold; }    /* Direct <a> children only */
```

### Adjacent Sibling (`+`)

Selects the element **immediately after**:

```css
h1 + p { font-size: 1.25em; }     /* First <p> after <h1> */
label + input { margin-left: 8px; }
```

### General Sibling (`~`)

Selects **all** siblings after:

```css
h1 ~ p { color: gray; }           /* All <p> after <h1> (same parent) */
.error ~ .field { border-color: red; }
```

### Diagram

```html
<div>
  <h1>Title</h1>
  <p>Adjacent sibling (+)</p>      <!-- h1 + p selects THIS -->
  <p>General sibling (~)</p>       <!-- h1 ~ p selects THIS too -->
  <div>
    <p>Descendant (space)</p>      <!-- div p selects THIS, NOT div > p -->
  </div>
</div>
```

---

## Pseudo-Classes

### Link & User Action

```css
a:link { color: blue; }           /* Unvisited link */
a:visited { color: purple; }      /* Visited link */
a:hover { color: red; }           /* Mouse over */
a:active { color: orange; }       /* While clicking */
a:focus { outline: 2px solid blue; }  /* Keyboard focused */
a:focus-visible { outline: 2px solid blue; }  /* Keyboard-only focus */
a:focus-within { /* Parent has a focused child */ }
```

> **LVHA Order:** `:link`, `:visited`, `:hover`, `:active` (must be in this order)

### Structural Pseudo-Classes

```css
li:first-child { font-weight: bold; }   /* First child */
li:last-child { border: none; }          /* Last child */
li:nth-child(3) { color: red; }          /* 3rd child */
li:nth-child(odd) { background: #f9f9f9; }  /* Odd rows */
li:nth-child(even) { background: #fff; }     /* Even rows */
li:nth-child(3n) { /* Every 3rd child */ }
li:nth-child(3n+1) { /* 1st, 4th, 7th... */ }
li:nth-child(-n+3) { /* First 3 children */ }
li:nth-last-child(2) { /* 2nd from end */ }
li:only-child { /* Only child of parent */ }
```

### Typed Structural Pseudo-Classes

```css
p:first-of-type { /* First <p> among siblings */ }
p:last-of-type { /* Last <p> among siblings */ }
p:nth-of-type(2) { /* 2nd <p> among siblings */ }
p:nth-last-of-type(1) { /* Last <p> among siblings */ }
p:only-of-type { /* Only <p> among siblings */ }
```

### `nth-child()` with Selector (of S syntax)

```css
/* Select the 2nd .active child */
li:nth-child(2 of .active) { color: red; }

/* Select the first .important child */
:nth-child(1 of .important) { font-weight: bold; }
```

### State Pseudo-Classes

```css
input:checked { /* Checked checkbox/radio */ }
input:disabled { opacity: 0.5; }
input:enabled { /* Not disabled */ }
input:required { border-color: orange; }
input:optional { /* Not required */ }
input:valid { border-color: green; }
input:invalid { border-color: red; }
input:in-range { /* Number in range */ }
input:out-of-range { border-color: red; }
input:placeholder-shown { /* Placeholder visible */ }
input:read-only { background: #f5f5f5; }
input:read-write { /* Editable */ }
input:autofill { background: yellow; }
```

### Content Pseudo-Classes

```css
:empty { display: none; }           /* No children or text */
:root { /* <html> element */ }
:target { /* Matches #hash in URL */ }
:lang(en) { quotes: '"' '"'; }
```

### Negation & Matching

```css
:not(.hidden) { display: block; }   /* Everything except .hidden */
:not(p):not(span) { /* Not p and not span */ }

:is(h1, h2, h3) { font-weight: bold; }    /* Matches any */
:where(h1, h2, h3) { margin: 0; }         /* Like :is() but 0 specificity */

:has(img) { padding: 10px; }              /* Parent has <img> child */
:has(> .active) { border-color: blue; }   /* Has direct .active child */
:has(+ .error) { color: red; }            /* Followed by .error sibling */
```

### :is() vs :where()

```css
/* :is() — takes highest specificity of its arguments */
:is(.card, #header) p { color: red; }     /* Specificity of #header */

/* :where() — always 0 specificity (easy to override) */
:where(.card, #header) p { color: blue; } /* Specificity: 0,0,0,1 */
```

### :has() — The "Parent Selector"

```css
/* Card that contains an image */
.card:has(img) { padding-top: 0; }

/* Form with invalid inputs */
form:has(:invalid) { border: 2px solid red; }

/* Details when open */
details:has([open]) { background: #f0f0f0; }

/* Label followed by required input */
label:has(+ input:required)::after { content: " *"; color: red; }
```

---

## Pseudo-Elements

```css
/* First line & first letter */
p::first-line { font-weight: bold; }
p::first-letter { 
  font-size: 3em; 
  float: left; 
  line-height: 1;
}

/* Generated content */
.required::before { content: "* "; color: red; }
.external::after { content: " ↗"; }
blockquote::before { content: open-quote; }
blockquote::after { content: close-quote; }

/* Placeholder text */
input::placeholder { color: #999; font-style: italic; }

/* Selection highlight */
::selection { background: #3b82f6; color: white; }

/* List markers */
li::marker { color: blue; font-weight: bold; }

/* Scrollbar (WebKit) */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }

/* File input button */
input[type="file"]::file-selector-button {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
}

/* Backdrop (for dialogs/fullscreen) */
dialog::backdrop { background: rgba(0,0,0,0.5); }
```

---

## Specificity Chart

```
Specificity:  (Inline, IDs, Classes, Types)

*                          →  0,0,0,0
p                          →  0,0,0,1
.card                      →  0,0,1,0
p.card                     →  0,0,1,1
#header                    →  0,1,0,0
#header .nav               →  0,1,1,0
#header .nav li.active     →  0,1,1,2
style="color:red"          →  1,0,0,0
!important                 →  Overrides all

:is(.a, #b) p              →  0,1,0,1  (takes #b's specificity)
:where(.a, #b) p           →  0,0,0,1  (zero specificity)
:not(.active)              →  0,0,1,0  (takes argument's specificity)
:has(.child)               →  0,0,1,0  (takes argument's specificity)
```

---

## Selector Performance

Selectors are read **right to left** by the browser:

```css
/* Browser first finds ALL <a>, then filters by .nav ancestors */
.nav ul li a { }  /* Slower — broad rightmost selector */

/* Better — narrow rightmost selector */
.nav-link { }     /* Faster — targets specific class */
```

### Best Practices
1. **Prefer classes** over complex selectors
2. **Avoid deep nesting** (max 2-3 levels)
3. **Avoid universal selector** with combinators (`* > .card`)
4. **Don't over-qualify** (`.card` not `div.card`)
5. **Use `:where()`** for resets to keep specificity low
