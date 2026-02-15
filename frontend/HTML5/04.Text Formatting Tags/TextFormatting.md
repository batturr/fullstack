# 04. Text Formatting Tags

## Semantic vs Presentational

HTML offers both **semantic** (meaningful) and **presentational** (visual only) tags for text formatting:

| Purpose | Semantic Tag | Presentational Tag |
|---------|-------------|-------------------|
| **Bold** | `<strong>` (important) | `<b>` (visually bold) |
| **Italic** | `<em>` (emphasis) | `<i>` (visually italic) |
| **Underline** | `<ins>` (inserted text) | `<u>` (visually underlined) |
| **Strikethrough** | `<del>` (deleted text) | `<s>` (visually struck) |
| **Small text** | `<small>` (fine print) | — |
| **Highlight** | `<mark>` (highlighted) | — |

> **Best Practice:** Use semantic tags when the formatting conveys meaning. Use presentational tags when it's purely visual.

---

## Bold — `<strong>` and `<b>`

```html
<p>This is <strong>very important</strong> text.</p>
<p>This is <b>visually bold</b> but not semantically important.</p>
```

| Tag | Meaning | Screen Reader Behavior |
|-----|---------|----------------------|
| `<strong>` | Strong importance | Announces with emphasis |
| `<b>` | Visually bold | No special announcement |

### Nesting for Greater Importance

```html
<p><strong><strong>Critical warning!</strong></strong></p>
```

---

## Italic — `<em>` and `<i>`

```html
<p>I <em>really</em> need to finish this.</p>        <!-- Emphasis changes meaning -->
<p>The word <i>schadenfreude</i> is German.</p>       <!-- Foreign word, no emphasis -->
<p><i class="fas fa-home"></i> Home</p>               <!-- Icon fonts use <i> -->
```

| Tag | Meaning | Use Case |
|-----|---------|----------|
| `<em>` | Stress emphasis | Changes sentence meaning |
| `<i>` | Alternate voice/mood | Foreign words, technical terms, icons |

---

## Underline — `<u>` and `<ins>`

```html
<p>This has <u>an underline</u> for visual purposes.</p>
<p>The meeting is on <ins>Thursday</ins> <del>Wednesday</del>.</p>
```

| Tag | Meaning |
|-----|---------|
| `<u>` | Unarticulated annotation (misspelled words, proper names in Chinese) |
| `<ins>` | Inserted text (marks additions to a document) |

> **Warning:** Users associate underlines with links. Avoid `<u>` for general styling — use CSS instead.

---

## Strikethrough — `<del>` and `<s>`

```html
<p>Price: <del>$50</del> <ins>$30</ins></p>     <!-- Document edit -->
<p><s>Out of stock</s></p>                        <!-- No longer relevant -->
```

| Tag | Meaning |
|-----|---------|
| `<del>` | Deleted/removed text (document edit) |
| `<s>` | No longer accurate or relevant |

### `<del>` Attributes

```html
<p>
  <del cite="https://example.com/changelog" datetime="2025-01-15">
    Old information
  </del>
</p>
```

---

## Superscript and Subscript

```html
<!-- Superscript -->
<p>E = mc<sup>2</sup></p>
<p>x<sup>n</sup> + y<sup>n</sup> = z<sup>n</sup></p>
<p>1<sup>st</sup>, 2<sup>nd</sup>, 3<sup>rd</sup></p>
<p>Footnote reference<sup><a href="#fn1">[1]</a></sup></p>

<!-- Subscript -->
<p>H<sub>2</sub>O (Water)</p>
<p>CO<sub>2</sub> (Carbon Dioxide)</p>
<p>C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> (Glucose)</p>
<p>log<sub>2</sub>(8) = 3</p>
```

---

## Small Text — `<small>`

```html
<p><small>© 2025 Company Name. All rights reserved.</small></p>
<p><small>Terms and conditions apply.</small></p>
```

- Renders smaller than surrounding text
- Semantic meaning: **side comments, fine print, legal text, disclaimers**

---

## Highlighted Text — `<mark>`

```html
<p>Search results for "HTML": Learn <mark>HTML</mark> basics today.</p>
```

- Default: yellow highlight background
- Semantic meaning: **relevance** — text relevant in the current context
- Great for search result highlighting

---

## Abbreviation — `<abbr>`

```html
<p><abbr title="HyperText Markup Language">HTML</abbr> is the standard markup language.</p>
<p><abbr title="Cascading Style Sheets">CSS</abbr> handles styling.</p>
```

- The `title` attribute shows a tooltip on hover
- Helps screen readers and search engines understand abbreviations

---

## Citation and Quotation

### `<blockquote>` — Block Quotation

```html
<blockquote cite="https://example.com/source">
    <p>The only way to do great work is to love what you do.</p>
    <footer>— Steve Jobs</footer>
</blockquote>
```

### `<q>` — Inline Quotation

```html
<p>Einstein said, <q>Imagination is more important than knowledge.</q></p>
```

- Browser automatically adds **quotation marks** around `<q>` content

### `<cite>` — Citation

```html
<p><cite>The Great Gatsby</cite> by F. Scott Fitzgerald.</p>
```

- Represents the **title** of a creative work (book, film, song)
- Default rendering: italic

---

## Address

```html
<address>
    <strong>John Doe</strong><br>
    123 Main Street<br>
    New York, NY 10001<br>
    <a href="mailto:john@example.com">john@example.com</a>
</address>
```

- Contact information for the nearest `<article>` or `<body>` ancestor
- Default rendering: italic

---

## Bidirectional Text

```html
<!-- Override text direction -->
<p><bdo dir="rtl">This text is right to left</bdo></p>

<!-- Isolate bidirectional text -->
<p>User <bdi>إيان</bdi> posted 15 comments.</p>
```

| Tag | Purpose |
|-----|---------|
| `<bdo>` | Override text direction (`ltr` or `rtl`) |
| `<bdi>` | Isolate text that might have different directionality |

---

## Ruby Annotation (East Asian Text)

```html
<ruby>
  漢 <rp>(</rp><rt>かん</rt><rp>)</rp>
  字 <rp>(</rp><rt>じ</rt><rp>)</rp>
</ruby>
```

- `<ruby>` — Container for ruby annotation
- `<rt>` — Pronunciation guide (displayed above)
- `<rp>` — Fallback parentheses for non-supporting browsers

---

## Complete Reference Table

| Tag | Purpose | Type |
|-----|---------|------|
| `<strong>` | Strong importance | Semantic |
| `<b>` | Bold text | Presentational |
| `<em>` | Emphasis | Semantic |
| `<i>` | Alternate voice/mood | Presentational |
| `<u>` | Unarticulated annotation | Presentational |
| `<ins>` | Inserted text | Semantic |
| `<del>` | Deleted text | Semantic |
| `<s>` | No longer relevant | Semantic |
| `<sup>` | Superscript | — |
| `<sub>` | Subscript | — |
| `<small>` | Side comment / fine print | Semantic |
| `<mark>` | Highlighted / relevant | Semantic |
| `<abbr>` | Abbreviation | Semantic |
| `<code>` | Code snippet | Semantic |
| `<kbd>` | Keyboard input | Semantic |
| `<samp>` | Sample output | Semantic |
| `<var>` | Variable | Semantic |
| `<cite>` | Title of a work | Semantic |
| `<q>` | Inline quotation | Semantic |
| `<blockquote>` | Block quotation | Semantic |
| `<bdo>` | Text direction override | — |
| `<bdi>` | Bidirectional isolation | — |
