# 09. Miscellaneous Tags

## Horizontal Rule — `<hr>`

```html
<p>Section one</p>
<hr>
<p>Section two</p>
```

- Represents a **thematic break** between content sections
- Self-closing void element
- Default: horizontal line across the width

---

## Blockquote

```html
<blockquote cite="https://example.com/source">
  <p>The best way to predict the future is to create it.</p>
  <footer>— <cite>Peter Drucker</cite></footer>
</blockquote>
```

- Block-level quotation from an external source
- `cite` attribute: URL of the source (not visible)
- Default rendering: indented from both sides

---

## Preformatted Text — `<pre>`

```html
<pre>
    This    preserves
    all     spaces     and
    line breaks
</pre>
```

- Preserves all **whitespace, spaces, and line breaks** exactly as written
- Renders in **monospace** font
- Use with `<code>` for code blocks:

```html
<pre><code>function hello() {
    console.log("Hello, World!");
}</code></pre>
```

---

## Code, Keyboard, Sample, Variable

```html
<p>Use <code>&lt;img&gt;</code> for images.</p>
<p>Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save.</p>
<p>Output: <samp>Hello, World!</samp></p>
<p>Let <var>x</var> = 10</p>
```

| Tag | Purpose | Default Style |
|-----|---------|--------------|
| `<code>` | Code snippet | Monospace |
| `<kbd>` | Keyboard input | Monospace |
| `<samp>` | Program output | Monospace |
| `<var>` | Variable in math/programming | Italic |

---

## Abbreviation — `<abbr>`

```html
<p><abbr title="HyperText Markup Language">HTML</abbr> is the web's markup language.</p>
```

- `title` attribute shows a tooltip on hover
- Helps screen readers and SEO understand abbreviations

---

## Address

```html
<address>
  John Doe<br>
  123 Main Street<br>
  <a href="mailto:john@example.com">john@example.com</a><br>
  <a href="tel:+1234567890">+1 (234) 567-890</a>
</address>
```

- Contact information for the nearest `<article>` or `<body>` ancestor
- Not for arbitrary physical addresses
- Default: italic

---

## Mark (Highlight)

```html
<p>Search results for "CSS": Learn <mark>CSS</mark> basics.</p>
```

- Highlights text relevant in the current context
- Default: yellow background
- Use for search term highlighting

---

## Time

```html
<p>Meeting on <time datetime="2025-02-08">February 8, 2025</time>.</p>
<p>Event starts at <time datetime="14:30">2:30 PM</time>.</p>
<p>Published <time datetime="2025-02-08T10:30:00+05:30">8 Feb 2025, 10:30 AM IST</time>.</p>
```

- Machine-readable date/time via `datetime` attribute
- Helps search engines, calendars, and screen readers

### `datetime` Formats

| Format | Example |
|--------|---------|
| Date | `2025-02-08` |
| Time | `14:30` or `14:30:00` |
| Date + Time | `2025-02-08T14:30:00` |
| With timezone | `2025-02-08T14:30:00+05:30` |
| Duration | `PT2H30M` (2 hours 30 minutes) |
| Year-month | `2025-02` |
| Week | `2025-W06` |

---

## Meter

```html
<label for="disk">Disk Usage:</label>
<meter id="disk" value="70" min="0" max="100" low="30" high="80" optimum="50">70%</meter>

<meter value="0.8">80%</meter>    <!-- Fraction: 0 to 1 -->
```

- Displays a **scalar measurement** within a known range
- Browser renders a colored bar (green/yellow/red based on low/high/optimum)
- Not for task completion — use `<progress>` for that

| Attribute | Purpose |
|-----------|---------|
| `value` | Current value |
| `min` | Minimum value (default: 0) |
| `max` | Maximum value (default: 1) |
| `low` | Low threshold (yellow below this) |
| `high` | High threshold (yellow above this) |
| `optimum` | Optimal value |

---

## Progress

```html
<label for="task">Download:</label>
<progress id="task" value="70" max="100">70%</progress>

<!-- Indeterminate (no value) — shows animated bar -->
<progress>Loading...</progress>
```

- Displays **completion progress** of a task
- Text inside is fallback for non-supporting browsers
- `value` omitted = indeterminate (loading spinner/bar)

---

## Details and Summary (Accordion)

```html
<details>
  <summary>Click to expand</summary>
  <p>Hidden content revealed when you click the summary.</p>
</details>

<!-- Open by default -->
<details open>
  <summary>FAQ: What is HTML?</summary>
  <p>HTML stands for HyperText Markup Language.</p>
</details>
```

- Native **accordion/disclosure widget** — no JavaScript needed
- `<summary>` is the clickable toggle label
- `open` attribute: expanded on load
- Can contain any HTML content inside

### FAQ Example

```html
<div class="faq">
  <details>
    <summary>What is HTML5?</summary>
    <p>HTML5 is the latest version of the HyperText Markup Language.</p>
  </details>
  <details>
    <summary>What is a semantic tag?</summary>
    <p>Tags that describe the meaning of the content, like &lt;header&gt;, &lt;nav&gt;, etc.</p>
  </details>
</div>
```

---

## Dialog

```html
<dialog id="myDialog">
  <h2>Confirm Action</h2>
  <p>Are you sure you want to proceed?</p>
  <form method="dialog">
    <button value="cancel">Cancel</button>
    <button value="confirm">Confirm</button>
  </form>
</dialog>

<button onclick="document.getElementById('myDialog').showModal()">Open Dialog</button>
```

- Native **modal dialog** — replaces custom modal libraries
- `showModal()` — Opens as a modal with backdrop
- `show()` — Opens as a non-modal dialog
- `close()` — Closes the dialog
- Pressing **Escape** closes a modal dialog
- `<form method="dialog">` closes the dialog on submit

---

## Word Break Opportunity — `<wbr>`

```html
<p>Super<wbr>cali<wbr>fragil<wbr>istic<wbr>expi<wbr>ali<wbr>docious</p>
<p>https://www.example.com/very/<wbr>long/<wbr>path/<wbr>to/<wbr>resource</p>
```

- Suggests where the browser **can** break a long word if needed
- No break if the word fits on one line

---

## Output

```html
<form oninput="result.value = parseInt(a.value) + parseInt(b.value)">
  <input type="number" id="a" value="5"> +
  <input type="number" id="b" value="3"> =
  <output name="result" for="a b">8</output>
</form>
```

- Displays the **result of a calculation** or user action
- `for` attribute lists the IDs of contributing elements

---

## Data

```html
<ul>
  <li><data value="398">Mini Ketchup</data></li>
  <li><data value="399">Jumbo Ketchup</data></li>
</ul>
```

- Links content with a **machine-readable** value
- `value` attribute contains the machine-readable form

---

## Template

```html
<template id="card-template">
  <div class="card">
    <h3 class="card-title"></h3>
    <p class="card-body"></p>
  </div>
</template>
```

- Content inside `<template>` is **not rendered** on load
- Used by JavaScript to clone and insert content dynamically
- Great for component patterns, list rendering
