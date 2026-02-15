# 03. Basic Tags in HTML

## Headings

HTML provides 6 levels of headings, `<h1>` being the largest and `<h6>` the smallest:

```html
<h1>Heading 1 — Main heading (one per page)</h1>
<h2>Heading 2 — Section heading</h2>
<h3>Heading 3 — Subsection</h3>
<h4>Heading 4</h4>
<h5>Heading 5</h5>
<h6>Heading 6 — Smallest heading</h6>
```

### Best Practices

- Use **one `<h1>`** per page (for SEO and accessibility)
- Follow **heading hierarchy** — don't skip levels (h1 → h3)
- Use headings for **structure**, not for making text big (use CSS for sizing)
- Screen readers use headings to navigate — proper hierarchy matters

### Default Sizes (approximate)

| Tag | Default Size | Default Weight |
|-----|-------------|----------------|
| `<h1>` | 2em (32px) | Bold |
| `<h2>` | 1.5em (24px) | Bold |
| `<h3>` | 1.17em (18.7px) | Bold |
| `<h4>` | 1em (16px) | Bold |
| `<h5>` | 0.83em (13.3px) | Bold |
| `<h6>` | 0.67em (10.7px) | Bold |

---

## Paragraphs

```html
<p>This is a paragraph. Browsers add default margin above and below.</p>

<p>This is another paragraph. Even if you add extra
   spaces    or
   line breaks in the source code,
   the browser collapses them into a single space.</p>
```

### Key Points

- `<p>` is a **block** element — starts on a new line
- Browsers **collapse** multiple spaces and newlines into a single space (**whitespace collapsing**)
- Default margin: ~16px top and bottom (1em)
- **Cannot** nest block elements inside `<p>` (e.g., `<p><div>...</div></p>` is invalid)

---

## Line Breaks

```html
<p>Line one<br>Line two<br>Line three</p>
```

- `<br>` is a **void element** (self-closing, no content)
- Forces a line break **within** a block element
- Don't use `<br>` for spacing — use CSS margins/padding instead

### When to Use `<br>`

- Poems or song lyrics
- Addresses
- Line breaks within a paragraph that must stay together

```html
<address>
    John Doe<br>
    123 Main Street<br>
    New York, NY 10001
</address>
```

---

## Horizontal Rule

```html
<p>Section one content</p>
<hr>
<p>Section two content</p>
```

- `<hr>` is a **thematic break** — represents a topic change
- Void element (self-closing)
- Default: 1px border with margin above and below

---

## Comments

```html
<!-- Single-line comment -->

<!--
    Multi-line comment
    spanning several lines
-->
```

- Not rendered in the browser
- Visible in source code (don't put sensitive data)
- Use for notes, todos, debugging

---

## Preformatted Text

```html
<pre>
    This    text    preserves
    all     spaces  and
    line breaks exactly as written.
</pre>
```

- `<pre>` preserves **whitespace and line breaks** exactly
- Renders in a **monospace** font by default
- Commonly used for code blocks, ASCII art

---

## Special Characters (HTML Entities)

When you need to display reserved characters or symbols:

| Character | Entity Name | Entity Number | Description |
|-----------|-------------|---------------|-------------|
| `<` | `&lt;` | `&#60;` | Less than |
| `>` | `&gt;` | `&#62;` | Greater than |
| `&` | `&amp;` | `&#38;` | Ampersand |
| `"` | `&quot;` | `&#34;` | Double quote |
| `'` | `&apos;` | `&#39;` | Single quote |
| (space) | `&nbsp;` | `&#160;` | Non-breaking space |
| © | `&copy;` | `&#169;` | Copyright |
| ® | `&reg;` | `&#174;` | Registered |
| ™ | `&trade;` | `&#8482;` | Trademark |
| → | `&rarr;` | `&#8594;` | Right arrow |
| ← | `&larr;` | `&#8592;` | Left arrow |
| ♥ | `&hearts;` | `&#9829;` | Heart |
| € | `&euro;` | `&#8364;` | Euro |
| ₹ | — | `&#8377;` | Indian Rupee |
| ¥ | `&yen;` | `&#165;` | Yen / Yuan |

```html
<p>Price: &#8377;500</p>
<p>5 &lt; 10 and 10 &gt; 5</p>
<p>Use &amp;amp; to display an ampersand</p>
<p>&copy; 2025 My Company</p>
```

### Non-Breaking Space (`&nbsp;`)

- Prevents the browser from collapsing multiple spaces
- Prevents a line break between two words

```html
<p>10&nbsp;km</p>          <!-- "10 km" stays on same line -->
<p>Mr.&nbsp;Smith</p>       <!-- Won't break between Mr. and Smith -->
```

---

## Code Tag

```html
<p>Use the <code>&lt;p&gt;</code> tag for paragraphs.</p>
```

- `<code>` — Inline code (monospace font)
- Often combined with `<pre>` for code blocks:

```html
<pre><code>
function greet(name) {
    return "Hello, " + name;
}
</code></pre>
```

---

## Keyboard, Sample, Variable

```html
<p>Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy.</p>
<p>The output was: <samp>Hello, World!</samp></p>
<p>The variable <var>x</var> equals 10.</p>
```

| Tag | Purpose | Rendering |
|-----|---------|-----------|
| `<kbd>` | Keyboard input | Monospace |
| `<samp>` | Sample output | Monospace |
| `<var>` | Variable | Italic |
