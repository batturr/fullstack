# 22. Deprecated Tags & Attributes

## What Is Deprecation?

**Deprecated** = still works in browsers but officially **removed from the HTML standard**. Should be replaced with modern CSS or semantic alternatives.

---

## Deprecated Tags

| Deprecated Tag | Purpose | Modern Replacement |
|---------------|---------|-------------------|
| `<font>` | Set font face, size, color | CSS `font-family`, `font-size`, `color` |
| `<center>` | Center-align content | CSS `text-align: center` or `margin: auto` |
| `<big>` | Larger text | CSS `font-size: larger` |
| `<strike>` | Strikethrough text | `<del>` or `<s>`, CSS `text-decoration: line-through` |
| `<tt>` | Teletype / monospace text | `<code>`, `<kbd>`, `<samp>`, CSS `font-family: monospace` |
| `<u>` *(was deprecated)* | Underlined text | Restored in HTML5 with new meaning (non-textual annotation) |
| `<basefont>` | Default font for the page | CSS `body { font-family: ...; }` |
| `<applet>` | Java applet | `<object>` or `<embed>` (or just don't) |
| `<frame>` | Frame in frameset | `<iframe>` |
| `<frameset>` | Collection of frames | Modern page layout (CSS Grid/Flexbox) |
| `<noframes>` | Fallback for no-frame browsers | Not needed |
| `<dir>` | Directory listing | `<ul>` |
| `<menu>` *(redefined)* | Menu list | Redefined in HTML5 as toolbar context |
| `<isindex>` | Single-line input | `<form>` + `<input>` |
| `<acronym>` | Abbreviation/acronym | `<abbr>` |
| `<marquee>` | Scrolling text | CSS animations (`@keyframes`) |
| `<blink>` | Blinking text | CSS `animation` (but don't) |
| `<xmp>` | Preformatted example | `<pre><code>` |
| `<listing>` | Code listing | `<pre><code>` |
| `<plaintext>` | Render rest of page as text | `<pre>` |

---

## Deprecated Attributes

### On Most Elements

| Deprecated Attribute | Was on | Modern Replacement |
|---------------------|--------|-------------------|
| `align` | Most elements | CSS `text-align`, `margin`, Flexbox, Grid |
| `bgcolor` | `<body>`, `<table>`, `<tr>`, `<td>` | CSS `background-color` |
| `border` | `<table>`, `<img>` | CSS `border` |
| `width` / `height` | `<table>`, `<td>`, `<hr>` | CSS `width`, `height` |
| `cellpadding` | `<table>` | CSS `padding` on `td`/`th` |
| `cellspacing` | `<table>` | CSS `border-spacing` or `border-collapse` |
| `valign` | `<tr>`, `<td>` | CSS `vertical-align` |
| `nowrap` | `<td>` | CSS `white-space: nowrap` |
| `hspace` / `vspace` | `<img>` | CSS `margin` |
| `color` | `<font>`, `<hr>` | CSS `color` |
| `face` | `<font>` | CSS `font-family` |
| `size` | `<font>`, `<hr>` | CSS `font-size`, `height` |
| `noshade` | `<hr>` | CSS styling |
| `link` / `vlink` / `alink` | `<body>` | CSS `a:link`, `a:visited`, `a:active` |
| `background` | `<body>` | CSS `background-image` |
| `text` | `<body>` | CSS `color` |
| `marginwidth` / `marginheight` | `<body>` | CSS `margin` |
| `scrolling` | `<iframe>` | CSS `overflow` |
| `frameborder` | `<iframe>` | CSS `border` |

---

## Migration Examples

### `<font>` → CSS

```html
<!-- ❌ Deprecated -->
<font face="Arial" size="4" color="red">Hello</font>

<!-- ✅ Modern -->
<span style="font-family: Arial; font-size: 18px; color: red;">Hello</span>

<!-- ✅ Even better: external CSS -->
<span class="highlight">Hello</span>
```

### `<center>` → CSS

```html
<!-- ❌ Deprecated -->
<center><h1>Title</h1></center>

<!-- ✅ Modern -->
<h1 style="text-align: center;">Title</h1>
```

### `bgcolor` → CSS

```html
<!-- ❌ Deprecated -->
<body bgcolor="#f0f0f0">
<table bgcolor="lightblue">
<tr bgcolor="white">

<!-- ✅ Modern -->
<body style="background-color: #f0f0f0;">
<table style="background-color: lightblue;">
<tr style="background-color: white;">
```

### Table Attributes → CSS

```html
<!-- ❌ Deprecated -->
<table border="1" cellpadding="10" cellspacing="0" width="100%">
  <tr>
    <td align="center" valign="middle" bgcolor="yellow" nowrap>Cell</td>
  </tr>
</table>

<!-- ✅ Modern -->
<table>
  <tr>
    <td>Cell</td>
  </tr>
</table>

<style>
table {
  width: 100%;
  border-collapse: collapse;
}
td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: center;
  vertical-align: middle;
  background-color: yellow;
  white-space: nowrap;
}
</style>
```

### `<marquee>` → CSS Animation

```html
<!-- ❌ Deprecated -->
<marquee>Scrolling text here</marquee>

<!-- ✅ Modern CSS -->
<div class="marquee">Scrolling text here</div>

<style>
.marquee {
  overflow: hidden;
  white-space: nowrap;
}
.marquee {
  animation: scroll 10s linear infinite;
}
@keyframes scroll {
  from { transform: translateX(100%); }
  to { transform: translateX(-100%); }
}
</style>
```

### `<frame>` / `<frameset>` → Modern Layout

```html
<!-- ❌ Deprecated: frameset layout -->
<frameset cols="200,*">
  <frame src="nav.html">
  <frame src="content.html">
</frameset>

<!-- ✅ Modern: CSS layout + iframe if needed -->
<div style="display: grid; grid-template-columns: 200px 1fr;">
  <nav>Navigation</nav>
  <main>Content</main>
</div>
```

---

## Still Valid `width` / `height` (Not Deprecated)

These attributes are **still valid** and recommended on:

| Element | Why Keep the Attribute |
|---------|----------------------|
| `<img width="800" height="600">` | Prevents layout shift (CLS) |
| `<video width="640" height="360">` | Aspect ratio hint |
| `<canvas width="600" height="400">` | Sets bitmap resolution |
| `<svg width="100" height="100">` | Sets viewport size |
| `<iframe width="560" height="315">` | Sets frame dimensions |

---

## Key Takeaway

> **Use HTML for structure and meaning. Use CSS for presentation and styling.**

- If an attribute controls **appearance** → replace with CSS
- If an attribute controls **behavior or meaning** → usually still valid HTML
