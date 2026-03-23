# 200 HTML Real-Time Assignments with Answers

---

## 🟢 BEGINNER LEVEL (Assignments 1–70)

### Basic Structure

---

**Assignment 1:** Create a minimal HTML5 document with `<!DOCTYPE html>` and the root `<html>` element with `lang="en"`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 1 — Minimal HTML5</title>

</head>
<body>
<h1>Minimal HTML5</h1>
<p>This page uses <code>&lt;!DOCTYPE html&gt;</code> and <code>&lt;html lang="en"&gt;</code>.</p>
</body>
</html>
```

---

**Assignment 2:** Build a complete page skeleton including `<head>` and `<body>` with a visible heading in the body.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 2 — Head and body</title>

</head>
<body>
<h1>Page skeleton</h1>
<p>Visible content lives in <code>body</code>; metadata lives in <code>head</code>.</p>
</body>
</html>
```

---

**Assignment 3:** Add a meaningful `<title>` in the head that appears in the browser tab.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 3 — Document title</title>

</head>
<body>
<h1>Tab title demo</h1>
<p>The browser tab reads from the <code>&lt;title&gt;</code> element in <code>head</code>.</p>
</body>
</html>
```

---

**Assignment 4:** Include `<meta charset="UTF-8">` and a `<meta name="viewport">` suitable for responsive layouts.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 4 — Charset and viewport</title>

</head>
<body>
<h1>Encoding and viewport</h1>
<p>UTF-8 and a responsive viewport meta tag are declared in <code>head</code>.</p>
</body>
</html>
```

---

**Assignment 5:** Use HTML comments to document each major section of your page structure (header, main, footer).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 5 — Section comments</title>

</head>
<body>
<!-- Header section: branding and top utilities -->
<header><h1>Comments demo</h1></header>
<!-- Main section: primary page content -->
<main><p>HTML comments document structure without affecting the layout.</p></main>
<!-- Footer section: legal and links -->
<footer><p>&copy; Demo</p></footer>
</body>
</html>
```

---

**Assignment 6:** Nest a `<div>` inside a `<section>` inside `<main>` with distinct text in each level to show hierarchy.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 6 — Nesting</title>

</head>
<body>
<main>
  <section>
    <h1>Outer section</h1>
    <div>
      <h2>Inner div</h2>
      <p>Nested: main → section → div.</p>
    </div>
  </section>
</main>
</body>
</html>
```

---

**Assignment 7:** Create a reusable HTML5 boilerplate file with essential meta tags, title, and an empty `<body>` ready for content.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 7 — Boilerplate</title>

</head>
<body>
<p>Empty body placeholder — add your app markup here.</p>
</body>
</html>
```

---

**Assignment 8:** In one document, include one `<script src>` in the `<head>` with `defer` and one inline script at the end of `<body>`; add HTML comments explaining typical execution order.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 8 — Script placement</title>
<script defer>
console.log("Deferred head script runs after parse");
</script>
</head>
<body>
<h1>Script loading</h1>
<p>Deferred script in <code>head</code> runs after the document is parsed; inline body script runs when parsed.</p>
<!-- Typical order: inline end-of-body runs first while parsing; deferred head scripts run before DOMContentLoaded. -->
<script>
  document.body.appendChild(document.createElement("p")).textContent = "Inline body script ran.";
</script>
</body>
</html>
```

---


### Text & Headings

---

**Assignment 9:** Build a page with `<h1>` through `<h6>` in logical order describing a blog article outline.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 9 — Heading hierarchy</title>

</head>
<body>
<article>
  <h1>How to brew pour-over coffee</h1>
  <h2>Ingredients</h2>
  <h3>Beans</h3>
  <h3>Water</h3>
  <h2>Steps</h2>
  <h3>Grind</h3>
  <h4>Grind size</h4>
  <h3>Bloom</h3>
  <h3>Pour</h3>
</article>
</body>
</html>
```

---

**Assignment 10:** Use multiple `<p>` elements with proper spacing for an “About” page biography.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 10 — Paragraphs</title>

</head>
<body>
<h1>About</h1>
<p>I build accessible web interfaces and care about semantic HTML.</p>
<p>When I am not coding, I read about performance and inclusive design.</p>
</body>
</html>
```

---

**Assignment 11:** Use `<br>` only where a line break is semantic (e.g., poem lines) within a paragraph.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 11 — Line breaks</title>

</head>
<body>
<h1>Haiku</h1>
<p>Green leaves whisper soft<br>Browser paints the morning light<br>Semantic markup</p>
</body>
</html>
```

---

**Assignment 12:** Insert `<hr>` between unrelated thematic sections on a single page.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 12 — Thematic breaks</title>

</head>
<body>
<h2>Chapter One</h2>
<p>Introductory thoughts.</p>
<hr>
<h2>Chapter Two</h2>
<p>Unrelated topic begins here.</p>
</body>
</html>
```

---

**Assignment 13:** Display formatted code or ASCII art using `<pre>` with preserved whitespace.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 13 — Preformatted text</title>

</head>
<body>
<h1>Banner</h1>
<pre>
  ____  _    _
 / ___|| | _| |_
 \___ \| |/ / __|
  ___) |   &lt;| |_
 |____/|_|\_\\__|
</pre>
</body>
</html>
```

---

**Assignment 14:** Add a `<blockquote>` with a citation using `<cite>` for the source name or title.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 14 — Blockquote</title>

</head>
<body>
<blockquote cite="https://www.w3.org/standards/webdesign/">
  <p>The power of the Web is in its universality.</p>
  <footer>— Tim Berners-Lee, <cite>W3C</cite></footer>
</blockquote>
</body>
</html>
```

---

**Assignment 15:** Emphasize words using `<strong>` for importance and `<em>` for stress within the same paragraph.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 15 — Strong and emphasis</title>

</head>
<body>
<p>This task is <strong>required</strong> for compliance, but you may <em>defer</em> optional steps.</p>
</body>
</html>
```

---

**Assignment 16:** Use `<small>`, `<sub>`, `<sup>`, and `<del>`/`<ins>` appropriately in a short product description.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 16 — Inline semantics</title>

</head>
<body>
<p>Was <del>$49.99</del> <ins>$39.99</ins>. Chemical: H<sub>2</sub>O. Area m<sup>2</sup>. <small>Tax may apply.</small></p>
</body>
</html>
```

---


### Links

---

**Assignment 17:** Create text links with `<a href>` to external HTTPS pages that open in a new tab using `target` and `rel`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 17 — External links</title>

</head>
<body>
<p><a href="https://developer.mozilla.org/" target="_blank" rel="noopener noreferrer">MDN Web Docs</a></p>
</body>
</html>
```

---

**Assignment 18:** Add an internal navigation menu linking to three fragment IDs on the same page (`#section-id`).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 18 — In-page anchors</title>

</head>
<body>
<nav aria-label="On this page">
  <ul>
    <li><a href="#intro">Intro</a></li>
    <li><a href="#details">Details</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
</nav>
<section id="intro"><h2>Intro</h2><p>Welcome.</p></section>
<section id="details"><h2>Details</h2><p>More info.</p></section>
<section id="contact"><h2>Contact</h2><p>Email us.</p></section>
</body>
</html>
```

---

**Assignment 19:** Create a `mailto:` link with subject and body query parameters.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 19 — mailto</title>

</head>
<body>
<p><a href="mailto:hello@example.com?subject=Hello&amp;body=Hi%20there">Email us</a></p>
</body>
</html>
```

---

**Assignment 20:** Create a `tel:` link for a clickable phone number labeled for mobile users.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 20 — tel</title>

</head>
<body>
<p>Call <a href="tel:+15551234567">+1 (555) 123-4567</a></p>
</body>
</html>
```

---

**Assignment 21:** Build “back to top” and “skip to content” style bookmark links using fragment identifiers.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 21 — Bookmarks</title>

</head>
<body>
<a href="#main">Skip to main</a>
<header><h1 id="top">Site</h1></header>
<main id="main"><p>Primary content.</p></main>
<p><a href="#top">Back to top</a></p>
</body>
</html>
```

---

**Assignment 22:** Use a download-style link pattern with `download` attribute on a same-origin or example path (document the intent in a comment if the file is placeholder).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 22 — Download link</title>

</head>
<body>
<!-- Replace href with a real same-origin file path for download to work -->
<p><a href="sample.txt" download="readme.txt">Download sample (placeholder)</a></p>
</body>
</html>
```

---


### Images

---

**Assignment 23:** Display an image with `<img src>`, meaningful `alt` text, and explicit `width` and `height` attributes.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 23 — img dimensions</title>

</head>
<body>
<p><img src="https://picsum.photos/seed/htmlassign/320/200" alt="Sample landscape" width="320" height="200"></p>
</body>
</html>
```

---

**Assignment 24:** Wrap an illustrative image in `<figure>` with a `<figcaption>` describing the image.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 24 — figure</title>

</head>
<body>
<figure>
  <img src="https://picsum.photos/seed/fig/400/240" alt="City skyline at dusk" width="400" height="240">
  <figcaption>Dusk skyline — illustrative photo.</figcaption>
</figure>
</body>
</html>
```

---

**Assignment 25:** Turn an image into a link by nesting `<img>` inside an `<a>` element.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 25 — Linked image</title>

</head>
<body>
<a href="https://example.com" aria-label="Example home">
  <img src="https://picsum.photos/seed/linkimg/120/120" alt="" width="120" height="120">
</a>
</body>
</html>
```

---

**Assignment 26:** Add `loading="lazy"` to below-the-fold images to defer loading.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 26 — Lazy loading</title>

</head>
<body>
<h1>Lazy images</h1>
<div style="height:120vh;background:#f4f4f4">Scroll down…</div>
<p><img src="https://picsum.photos/seed/lazy1/300/180" alt="Below fold" width="300" height="180" loading="lazy"></p>
</body>
</html>
```

---

**Assignment 27:** Use `<picture>` with `<source media>` and a fallback `<img>` for a responsive image example.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 27 — picture element</title>

</head>
<body>
<!-- Narrow screens get a portrait crop; wide screens get landscape -->
<picture>
  <source media="(max-width: 600px)" srcset="https://picsum.photos/seed/p1/300/400">
  <img src="https://picsum.photos/seed/p2/600/300" alt="Responsive picture demo" width="600" height="300">
</picture>
</body>
</html>
```

---

**Assignment 28:** Provide a simple `srcset`/`sizes` example on `<img>` for resolution switching (describe breakpoints in comments).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 28 — srcset sizes</title>

</head>
<body>
<!-- Breakpoints described in comments: ~400px slot on small, ~800px on large -->
<img
  src="https://picsum.photos/seed/ss/800/450"
  srcset="https://picsum.photos/seed/ss/400/225 400w, https://picsum.photos/seed/ss/800/450 800w"
  sizes="(max-width: 600px) 400px, 800px"
  alt="Resolution switching demo"
  width="800"
  height="450">
</body>
</html>
```

---


### Lists

---

**Assignment 29:** Create an unordered list of navigation items for a site menu.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 29 — Unordered nav</title>

</head>
<body>
<nav aria-label="Primary">
  <ul>
    <li><a href="#home">Home</a></li>
    <li><a href="#blog">Blog</a></li>
    <li><a href="#about">About</a></li>
  </ul>
</nav>
</body>
</html>
```

---

**Assignment 30:** Create an ordered list of steps for a recipe with nested unordered sub-lists for ingredients per step.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 30 — Nested recipe</title>

</head>
<body>
<h1>Pasta</h1>
<ol>
  <li>Boil water
    <ul>
      <li>Salt generously</li>
    </ul>
  </li>
  <li>Cook pasta until al dente</li>
  <li>Drain and toss with sauce</li>
</ol>
</body>
</html>
```

---

**Assignment 31:** Build a description list (`<dl>`, `<dt>`, `<dd>`) defining at least three web terms.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 31 — Description list</title>

</head>
<body>
<h1>Web terms</h1>
<dl>
  <dt>HTML</dt><dd>HyperText Markup Language structures content.</dd>
  <dt>CSS</dt><dd>Cascading Style Sheets describe presentation.</dd>
  <dt>HTTP</dt><dd>Protocol for transferring web resources.</dd>
</dl>
</body>
</html>
```

---

**Assignment 32:** Nest an ordered list inside an unordered list (or vice versa) for an outline structure.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 32 — Mixed nested lists</title>

</head>
<body>
<ul>
  <li>Frontend
    <ol>
      <li>HTML</li>
      <li>CSS</li>
    </ol>
  </li>
  <li>Backend
    <ol>
      <li>APIs</li>
      <li>Databases</li>
    </ol>
  </li>
</ul>
</body>
</html>
```

---

**Assignment 33:** Use `<ol start="5">` to begin numbering at a specific value.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 33 — Custom start</title>

</head>
<body>
<ol start="5">
  <li>Fifth item</li>
  <li>Sixth item</li>
</ol>
</body>
</html>
```

---

**Assignment 34:** Use `<ol reversed>` for a countdown-style list.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 34 — Reversed list</title>

</head>
<body>
<ol reversed>
  <li>Third place</li>
  <li>Second place</li>
  <li>First place</li>
</ol>
</body>
</html>
```

---

**Assignment 35:** Create a list where each item contains a paragraph and a link.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 35 — List with links</title>

</head>
<body>
<ul>
  <li><p>News.</p><a href="https://example.com/news">Read</a></li>
  <li><p>Docs.</p><a href="https://example.com/docs">Open</a></li>
</ul>
</body>
</html>
```

---

**Assignment 36:** Mark up a FAQ-style page using lists (ordered or unordered) with clear list item semantics.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 36 — FAQ lists</title>

</head>
<body>
<h1>FAQ</h1>
<ul>
  <li><strong>What is HTML5?</strong> The living standard for HTML.</li>
  <li><strong>Why semantics?</strong> Better accessibility and SEO.</li>
</ul>
</body>
</html>
```

---


### Tables

---

**Assignment 37:** Build a basic data table with headers and multiple rows/columns.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 37 — Basic table</title>

</head>
<body>
<table>
  <tr><th>Name</th><th>Role</th></tr>
  <tr><td>Ada</td><td>Engineer</td></tr>
  <tr><td>Lin</td><td>Designer</td></tr>
</table>
</body>
</html>
```

---

**Assignment 38:** Structure a table with `<thead>`, `<tbody>`, and `<tfoot>` for summary rows.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 38 — thead tbody tfoot</title>

</head>
<body>
<table>
  <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
  <tbody>
    <tr><td>Notebook</td><td>2</td><td>$6</td></tr>
    <tr><td>Pen</td><td>5</td><td>$2</td></tr>
  </tbody>
  <tfoot><tr><th colspan="2">Total</th><th>$8</th></tr></tfoot>
</table>
</body>
</html>
```

---

**Assignment 39:** Use `colspan` to merge cells in a header row for grouped columns.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 39 — colspan</title>

</head>
<body>
<table>
  <tr><th colspan="2">Q1 Sales</th></tr>
  <tr><th>Region</th><th>Amount</th></tr>
  <tr><td>NA</td><td>$120k</td></tr>
</table>
</body>
</html>
```

---

**Assignment 40:** Use `rowspan` to merge cells vertically for a sidebar label column.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 40 — rowspan</title>

</head>
<body>
<table>
  <tr><th rowspan="2">Team A</th><td>Task 1</td></tr>
  <tr><td>Task 2</td></tr>
  <tr><th>Team B</th><td>Task 3</td></tr>
</table>
</body>
</html>
```

---

**Assignment 41:** Add `<caption>` describing the purpose of the table for accessibility.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 41 — caption</title>

</head>
<body>
<table>
  <caption>Quarterly results (USD)</caption>
  <tr><th>Q</th><th>Rev</th></tr>
  <tr><td>1</td><td>10</td></tr>
</table>
</body>
</html>
```

---

**Assignment 42:** Apply basic table styling using `<style>` (borders, spacing) without external CSS files.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 42 — Table CSS</title>

</head>
<body>
<style>
  table { border-collapse: collapse; width: 100%; max-width: 480px; }
  th, td { border: 1px solid #333; padding: 0.5rem; }
  th { background: #eee; }
</style>
<table><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table>
</body>
</html>
```

---

**Assignment 43:** Create a weekly class or work schedule table with times and activities.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 43 — Schedule</title>

</head>
<body>
<table>
  <caption>Weekly schedule</caption>
  <thead><tr><th>Time</th><th>Mon</th><th>Tue</th></tr></thead>
  <tbody>
    <tr><th scope="row">09:00</th><td>Math</td><td>Art</td></tr>
    <tr><th scope="row">11:00</th><td>CS</td><td>PE</td></tr>
  </tbody>
</table>
</body>
</html>
```

---

**Assignment 44:** Build a pricing comparison table for three product tiers with features and prices.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 44 — Pricing</title>

</head>
<body>
<table>
  <caption>Plans</caption>
  <thead><tr><th>Feature</th><th>Basic</th><th>Pro</th><th>Team</th></tr></thead>
  <tbody>
    <tr><th scope="row">Price</th><td>$0</td><td>$12</td><td>$29</td></tr>
    <tr><th scope="row">Storage</th><td>5GB</td><td>100GB</td><td>1TB</td></tr>
  </tbody>
</table>
</body>
</html>
```

---

**Assignment 45:** Add `<th scope="col">` and `<th scope="row">` appropriately for a complex table.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 45 — scope</title>

</head>
<body>
<table>
  <tr><th scope="col">Name</th><th scope="col">Score</th></tr>
  <tr><th scope="row">Ava</th><td>91</td></tr>
  <tr><th scope="row">Ben</th><td>88</td></tr>
</table>
</body>
</html>
```

---

**Assignment 46:** Create an accessible table with `<caption>` and headers associated to data cells for screen readers.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 46 — Accessible table</title>

</head>
<body>
<table>
  <caption>Support tickets by priority</caption>
  <thead>
    <tr><th id="p">Priority</th><th id="c">Count</th></tr>
  </thead>
  <tbody>
    <tr><th headers="p" id="low">Low</th><td headers="c low">3</td></tr>
    <tr><th headers="p" id="high">High</th><td headers="c high">1</td></tr>
  </tbody>
</table>
</body>
</html>
```

---


### Forms

---

**Assignment 47:** Build a form with labeled text `<input type="text">` and a submit button.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 47 — Text + submit</title>

</head>
<body>
<form action="#" method="get">
  <label for="u">Username</label>
  <input id="u" name="username" type="text" autocomplete="username">
  <button type="submit">Save</button>
</form>
</body>
</html>
```

---

**Assignment 48:** Add `<input type="email">` with `required` and `autocomplete="email"`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 48 — Email required</title>

</head>
<body>
<form>
  <label for="em">Email</label>
  <input id="em" name="email" type="email" autocomplete="email" required>
  <button>Submit</button>
</form>
</body>
</html>
```

---

**Assignment 49:** Add `<input type="password">` with `minlength` and show/hide note in nearby text.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 49 — Password</title>

</head>
<body>
<form>
  <label for="pw">Password</label>
  <input id="pw" name="password" type="password" minlength="8" required>
  <p><small>Use at least 8 characters.</small></p>
  <button>Sign in</button>
</form>
</body>
</html>
```

---

**Assignment 50:** Use `<input type="number">` with `min`, `max`, and `step`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 50 — Number</title>

</head>
<body>
<form>
  <label for="qty">Quantity</label>
  <input id="qty" name="qty" type="number" min="1" max="10" step="1" value="1">
  <button>Add</button>
</form>
</body>
</html>
```

---

**Assignment 51:** Use `<input type="date">` for selecting a birth date or appointment date.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 51 — Date</title>

</head>
<body>
<form>
  <label for="dob">Birth date</label>
  <input id="dob" name="dob" type="date" required>
  <button>Continue</button>
</form>
</body>
</html>
```

---

**Assignment 52:** Use `<input type="tel">` with `pattern` for a simple phone format.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 52 — Tel pattern</title>

</head>
<body>
<form>
  <label for="tel">Phone</label>
  <input id="tel" name="tel" type="tel" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" placeholder="555-123-4567">
  <button>Call me</button>
</form>
</body>
</html>
```

---

**Assignment 53:** Use `<input type="url">` for a website field with placeholder text.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 53 — URL</title>

</head>
<body>
<form>
  <label for="site">Website</label>
  <input id="site" name="site" type="url" placeholder="https://example.com">
  <button>Save</button>
</form>
</body>
</html>
```

---

**Assignment 54:** Use `<input type="color">` to pick a theme color.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 54 — Color</title>

</head>
<body>
<form>
  <label for="c">Theme color</label>
  <input id="c" name="color" type="color" value="#3366cc">
  <button>Apply</button>
</form>
</body>
</html>
```

---

**Assignment 55:** Use `<input type="range">` with `min`, `max`, and an associated `<output>` or label showing the value.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 55 — Range + output</title>

</head>
<body>
<form oninput="o.value = r.value">
  <label for="r">Volume</label>
  <input id="r" name="vol" type="range" min="0" max="100" value="40">
  <output id="o" for="r">40</output>
</form>
</body>
</html>
```

---

**Assignment 56:** Use `<input type="file">` with `accept` to restrict to images.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 56 — File accept</title>

</head>
<body>
<form>
  <label for="f">Upload image</label>
  <input id="f" name="file" type="file" accept="image/*">
  <button>Upload</button>
</form>
</body>
</html>
```

---

**Assignment 57:** Create a checkbox group for “interests” with shared `name` and distinct `value` attributes.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 57 — Checkboxes</title>

</head>
<body>
<fieldset>
  <legend>Interests</legend>
  <label><input type="checkbox" name="i" value="web"> Web</label>
  <label><input type="checkbox" name="i" value="design"> Design</label>
  <label><input type="checkbox" name="i" value="a11y"> Accessibility</label>
</fieldset>
</body>
</html>
```

---

**Assignment 58:** Create a radio group for selecting one shipping method.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 58 — Radio group</title>

</head>
<body>
<fieldset>
  <legend>Shipping</legend>
  <label><input type="radio" name="ship" value="std" checked> Standard</label>
  <label><input type="radio" name="ship" value="exp"> Express</label>
</fieldset>
</body>
</html>
```

---

**Assignment 59:** Add `<textarea>` with `rows`, `cols`, and `maxlength`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 59 — Textarea</title>

</head>
<body>
<form>
  <label for="msg">Message</label>
  <textarea id="msg" name="msg" rows="4" cols="40" maxlength="200"></textarea>
  <button>Send</button>
</form>
</body>
</html>
```

---

**Assignment 60:** Build a `<select>` with `<option>` groups (`<optgroup>`) for categorized choices.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 60 — Select optgroup</title>

</head>
<body>
<form>
  <label for="t">Topic</label>
  <select id="t" name="topic">
    <optgroup label="Frontend">
      <option>HTML</option>
      <option>CSS</option>
    </optgroup>
    <optgroup label="Backend">
      <option>Node</option>
      <option>APIs</option>
    </optgroup>
  </select>
  <button>OK</button>
</form>
</body>
</html>
```

---

**Assignment 61:** Use `<button type="submit">` and `<button type="reset">` appropriately.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 61 — Submit and reset</title>

</head>
<body>
<form>
  <label for="n">Name</label>
  <input id="n" name="n" type="text">
  <button type="submit">Save</button>
  <button type="reset">Clear</button>
</form>
</body>
</html>
```

---

**Assignment 62:** Group related fields with `<fieldset>` and `<legend>` and associate labels using `<label for>`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 62 — Fieldset legend labels</title>

</head>
<body>
<form>
  <fieldset>
    <legend>Account</legend>
    <p><label for="e">Email</label> <input id="e" name="e" type="email" placeholder="you@example.com" required></p>
    <p><label for="p">Password</label> <input id="p" name="p" type="password" required></p>
  </fieldset>
  <button>Create</button>
</form>
</body>
</html>
```

---


### Semantic Elements

---

**Assignment 63:** Mark up a page `<header>` containing a logo text and primary navigation.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 63 — Header + nav</title>

</head>
<body>
<header>
  <p class="logo">Acme</p>
  <nav aria-label="Primary"><a href="#a">Home</a> · <a href="#b">Docs</a></nav>
</header>
</body>
</html>
```

---

**Assignment 64:** Add a `<footer>` with copyright, contact link, and secondary links.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 64 — Footer</title>

</head>
<body>
<footer>
  <p><small>&copy; 2025 Demo Co.</small></p>
  <p><a href="mailto:hi@example.com">Contact</a> · <a href="/privacy">Privacy</a></p>
</footer>
</body>
</html>
```

---

**Assignment 65:** Wrap primary navigation links in `<nav>` with an `aria-label`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 65 — Nav aria-label</title>

</head>
<body>
<nav aria-label="Main navigation">
  <ul><li><a href="/">Home</a></li><li><a href="/blog">Blog</a></li></ul>
</nav>
</body>
</html>
```

---

**Assignment 66:** Use `<main>` exactly once with unique content for the page.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 66 — Single main</title>

</head>
<body>
<main>
  <h1>Dashboard</h1>
  <p>There must be only one <code>main</code> per page.</p>
</main>
</body>
</html>
```

---

**Assignment 67:** Split content into thematic `<section>` elements each with their own heading.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 67 — Sections</title>

</head>
<body>
<main>
  <section aria-labelledby="s1"><h2 id="s1">Features</h2><p>…</p></section>
  <section aria-labelledby="s2"><h2 id="s2">Pricing</h2><p>…</p></section>
</main>
</body>
</html>
```

---

**Assignment 68:** Mark up a blog post using `<article>` with author line and publication date text.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 68 — Article</title>

</head>
<body>
<article>
  <header><h1>Post title</h1><p>By <span>Jamie</span> · <time datetime="2025-03-23">Mar 23, 2025</time></p></header>
  <p>Article body…</p>
</article>
</body>
</html>
```

---

**Assignment 69:** Add an `<aside>` with related links or a sidebar note beside the main article layout.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 69 — Aside</title>

</head>
<body>
<main style="display:flex;gap:1rem">
  <article style="flex:1"><h1>Story</h1><p>Main narrative.</p></article>
  <aside style="width:220px"><h2>Related</h2><ul><li><a href="#">Link</a></li></ul></aside>
</main>
</body>
</html>
```

---

**Assignment 70:** Combine `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, and `<footer>` in one coherent semantic page layout.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 70 — Full semantic page</title>

</head>
<body>
<header><h1>News</h1><nav aria-label="Primary"><a href="#n">Home</a></nav></header>
<main>
  <section aria-labelledby="trending"><h2 id="trending">Trending</h2>
    <article><h3>Story A</h3><p>…</p></article>
  </section>
  <aside aria-label="Promo"><p>Sponsored</p></aside>
</main>
<footer><p>&copy; Demo</p></footer>
</body>
</html>
```

---

## 🟡 INTERMEDIATE LEVEL (Assignments 71–140)

### Advanced Forms

---

**Assignment 71:** Add `pattern` validation to a text field (e.g., username) and document the regex in a nearby `<small>`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 71 — Pattern validation</title>

</head>
<body>
<form>
  <label for="user">Username (letters only)</label>
  <input id="user" name="user" type="text" pattern="[A-Za-z]+" required>
  <small id="user-hint">Pattern: <code>[A-Za-z]+</code></small>
  <button>Submit</button>
</form>
</body>
</html>
```

---

**Assignment 72:** Use `min`/`max` on a number input together with a clear validation message area (use `title` or associated text).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 72 — min max number</title>

</head>
<body>
<form>
  <label for="age">Age</label>
  <input id="age" name="age" type="number" min="18" max="120" required title="Enter an age between 18 and 120">
  <p id="age-help" role="note">Must be between 18 and 120.</p>
  <button>OK</button>
</form>
</body>
</html>
```

---

**Assignment 73:** Combine `minlength`/`maxlength` on password and confirm password fields in one form.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 73 — Password lengths</title>

</head>
<body>
<form>
  <label for="pw1">Password</label>
  <input id="pw1" name="pw1" type="password" minlength="10" maxlength="64" required>
  <label for="pw2">Confirm</label>
  <input id="pw2" name="pw2" type="password" minlength="10" maxlength="64" required>
  <button>Register</button>
</form>
</body>
</html>
```

---

**Assignment 74:** Wire an `<input list>` to a `<datalist>` for autocomplete suggestions.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 74 — Datalist</title>

</head>
<body>
<form>
  <label for="city">City</label>
  <input id="city" name="city" type="text" list="cities">
  <datalist id="cities">
    <option value="Austin"></option>
    <option value="Boston"></option>
    <option value="Chicago"></option>
  </datalist>
  <button>Save</button>
</form>
</body>
</html>
```

---

**Assignment 75:** Use `<output>` with the `for` attribute to display a computed sum of two number inputs (include minimal inline script if needed, or use `oninput` on the form).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 75 — output for sum</title>

</head>
<body>
<form oninput="sum.value = Number(a.value) + Number(b.value)">
  <label for="a">A</label>
  <input id="a" name="a" type="number" value="0">
  <label for="b">B</label>
  <input id="b" name="b" type="number" value="0">
  <label for="sum">Sum</label>
  <output id="sum" name="sum" for="a b">0</output>
</form>
</body>
</html>
```

---

**Assignment 76:** Customize validation messages using the Constraint Validation API in a short inline script (`setCustomValidity`).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 76 — setCustomValidity</title>

</head>
<body>
<form id="f">
  <label for="code">Code (must be ABC)</label>
  <input id="code" name="code" type="text" required>
  <button type="submit">Check</button>
</form>
<script>
document.getElementById("code").addEventListener("input", (e) => {
  e.target.setCustomValidity(e.target.value === "ABC" ? "" : "Enter exactly ABC");
});
</script>
</body>
</html>
```

---

**Assignment 77:** Structure a multi-step form UI using `<fieldset>` sections and “Next/Previous” buttons (no backend; use buttons `type="button"`).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 77 — Multi-step fieldsets</title>

</head>
<body>
<form>
  <fieldset id="step1"><legend>Step 1</legend><label>Name <input name="n" type="text"></label></fieldset>
  <fieldset id="step2" hidden><legend>Step 2</legend><label>Email <input name="e" type="email"></label></fieldset>
  <p>
    <button type="button" onclick="step1.hidden=true;step2.hidden=false">Next</button>
    <button type="button" onclick="step1.hidden=false;step2.hidden=true">Previous</button>
  </p>
</form>
</body>
</html>
```

---

**Assignment 78:** Add `aria-invalid` and `aria-describedby` linking inputs to error message elements.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 78 — aria-invalid describedby</title>

</head>
<body>
<form>
  <label for="email">Email</label>
  <input id="email" type="email" aria-invalid="true" aria-describedby="err" value="bad">
  <p id="err" role="alert">Please enter a valid email address.</p>
</form>
</body>
</html>
```

---

**Assignment 79:** Ensure every form control has an associated label; use `aria-label` only where a visible label is impossible.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 79 — Labels for every control</title>

</head>
<body>
<form>
  <p><label for="one">Name</label> <input id="one" type="text" name="one"></p>
  <p><label for="two"><span class="visually-hidden">Search the site</span></label>
     <input id="two" type="search" name="two" aria-label="Search the site"></p>
  <button type="submit">Go</button>
</form>
<style>.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}</style>
</body>
</html>
```

---

**Assignment 80:** Group a search form with `role="search"` on a container element.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 80 — role search</title>

</head>
<body>
<search role="search">
  <form action="#" method="get">
    <label for="q">Search</label>
    <input id="q" type="search" name="q">
    <button>Search</button>
  </form>
</search>
</body>
</html>
```

---

**Assignment 81:** Add `aria-required="true"` to required fields in addition to the `required` attribute for redundancy with assistive tech.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 81 — aria-required</title>

</head>
<body>
<form>
  <label for="req">Required field</label>
  <input id="req" name="req" type="text" required aria-required="true">
  <button>Send</button>
</form>
</body>
</html>
```

---

**Assignment 82:** Create an accessible custom file input pattern: native input visually styled with a `<label>` and helper text tied via `aria-describedby`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 82 — Accessible file input</title>

</head>
<body>
<form>
  <label for="doc">Upload résumé (PDF)</label>
  <input id="doc" type="file" accept=".pdf,application/pdf" aria-describedby="doc-help">
  <p id="doc-help">Maximum 5 MB. PDF only.</p>
</form>
</body>
</html>
```

---


### Media

---

**Assignment 83:** Embed `<audio controls>` with a single MP3 source (use a placeholder path and comment for real URL).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 83 — Audio controls</title>

</head>
<body>
<!-- Replace src with a real MP3 URL -->
<audio controls src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3">
  Your browser does not support audio.
</audio>
</body>
</html>
```

---

**Assignment 84:** Provide `<audio>` with multiple `<source>` elements (`type` attributes included) for format fallback.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 84 — Audio multiple sources</title>

</head>
<body>
<audio controls>
  <source src="audio/sample.mp3" type="audio/mpeg">
  <source src="audio/sample.ogg" type="audio/ogg">
  Audio not supported.
</audio>
</body>
</html>
```

---

**Assignment 85:** Add `loop` to an audio element and document autoplay policy considerations in a comment.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 85 — Audio loop</title>

</head>
<body>
<!-- Autoplay is often blocked without user gesture; loop is shown here -->
<audio controls loop src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"></audio>
</body>
</html>
```

---

**Assignment 86:** Embed `<video controls poster>` with width/height and fallback text inside the video tag.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 86 — Video poster</title>

</head>
<body>
<video controls width="640" height="360" poster="https://picsum.photos/seed/poster/640/360">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
  Video not supported.
</video>
</body>
</html>
```

---

**Assignment 87:** Add `<track kind="subtitles" srclang label>` to a video element (placeholder `.vtt` path).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 87 — Video track</title>

</head>
<body>
<video controls width="640" height="360">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
  <track kind="subtitles" srclang="en" label="English" src="captions.vtt" default>
</video>
</body>
</html>
```

---

**Assignment 88:** Use `<picture>` with WebP and JPEG sources and `sizes` for art direction.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 88 — picture WebP JPEG</title>

</head>
<body>
<picture>
  <source type="image/webp" srcset="https://www.gstatic.com/webp/gallery/1.sm.webp" sizes="(max-width:600px) 100vw, 800px">
  <img src="https://www.gstatic.com/webp/gallery/1.jpg" alt="Gallery sample" width="800" height="600">
</picture>
</body>
</html>
```

---

**Assignment 89:** Demonstrate `srcset` with `w` descriptors and a `sizes` attribute on `<img>`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 89 — srcset w descriptors</title>

</head>
<body>
<img
  src="https://picsum.photos/seed/wdesc/800/450"
  srcset="https://picsum.photos/seed/wdesc/400/225 400w, https://picsum.photos/seed/wdesc/800/450 800w"
  sizes="(max-width: 600px) 400px, 800px"
  alt="Width descriptors demo"
  width="800"
  height="450">
</body>
</html>
```

---

**Assignment 90:** Embed a PDF or app with `<embed type>` and title text (placeholder URL).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 90 — embed</title>

</head>
<body>
<!-- Replace with a real PDF URL -->
<embed src="https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.pdf" type="application/pdf" width="600" height="400" title="Sample PDF">
</body>
</html>
```

---

**Assignment 91:** Embed a YouTube video using `<iframe>` with `title`, `allow`, and responsive width attributes.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 91 — YouTube iframe</title>

</head>
<body>
<iframe
  width="560"
  height="315"
  src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
  title="Demonstration video from YouTube"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowfullscreen
  loading="lazy"></iframe>
</body>
</html>
```

---

**Assignment 92:** Embed Google Maps (or similar) via `<iframe>` with descriptive `title` and `loading="lazy"`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 92 — Maps iframe</title>

</head>
<body>
<iframe
  title="Example location on Google Maps"
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151!2d144.9631!2d-37.8136!2z"
  width="600"
  height="450"
  style="border:0"
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"></iframe>
</body>
</html>
```

---


### Semantic & Accessibility

---

**Assignment 93:** Add `role="banner"` to the site header and `role="contentinfo"` to the footer where appropriate.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 93 — Banner contentinfo roles</title>

</head>
<body>
<header role="banner"><h1>Site</h1></header>
<main><p>Content</p></main>
<footer role="contentinfo"><p>&copy; Demo</p></footer>
</body>
</html>
```

---

**Assignment 94:** Use `aria-label` on icon-only buttons or links with no visible text.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 94 — aria-label icon link</title>

</head>
<body>
<a href="/search" aria-label="Search">🔍</a>
</body>
</html>
```

---

**Assignment 95:** Connect helper text to an input with `aria-describedby` matching an element `id`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 95 — aria-describedby</title>

</head>
<body>
<label for="pw">Password</label>
<input id="pw" type="password" aria-describedby="pw-rules" autocomplete="current-password">
<p id="pw-rules">At least 8 characters.</p>
</body>
</html>
```

---

**Assignment 96:** Hide decorative icons from assistive tech using `aria-hidden="true"`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 96 — aria-hidden decorative</title>

</head>
<body>
<p><span aria-hidden="true">★★★★☆</span> Rated 4 of 5</p>
</body>
</html>
```

---

**Assignment 97:** Implement a “skip to main content” link at the top of the page that targets `#main-content`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 97 — Skip link</title>

</head>
<body>
<a href="#main-content" class="skip">Skip to main content</a>
<header><h1>Header</h1></header>
<main id="main-content" tabindex="-1"><h2>Main</h2><p>Primary content starts here.</p></main>
<style>.skip{position:absolute;left:-999px}.skip:focus{left:8px;top:8px;background:#fff;padding:8px;z-index:99}</style>
</body>
</html>
```

---

**Assignment 98:** Build a keyboard-friendly horizontal nav using a list inside `<nav>` with clear focus styles in `<style>`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 98 — Keyboard nav focus styles</title>

</head>
<body>
<style>
  nav a { display:inline-block; padding:0.5rem; }
  nav a:focus { outline: 3px solid #06c; outline-offset: 2px; }
</style>
<nav aria-label="Main"><ul style="display:flex;gap:1rem;list-style:none;padding:0">
  <li><a href="#a">A</a></li><li><a href="#b">B</a></li><li><a href="#c">C</a></li>
</ul></nav>
</body>
</html>
```

---

**Assignment 99:** Mark up a form error summary region at the top of a form with `role="alert"` (static example).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 99 — Form error summary</title>

</head>
<body>
<form>
  <div role="alert"><h2>Please fix 2 errors</h2><ul><li>Email is invalid</li><li>Password required</li></ul></div>
  <label for="e">Email</label><input id="e" type="email" aria-invalid="true">
  <label for="p">Password</label><input id="p" type="password" aria-invalid="true">
</form>
</body>
</html>
```

---

**Assignment 100:** Add screen-reader-only text with a `.visually-hidden` CSS class and use it for context on ambiguous links.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 100 — Visually hidden</title>

</head>
<body>
<style>.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}</style>
<p><a href="/more">Read more <span class="visually-hidden">about our pricing plans</span></a></p>
</body>
</html>
```

---

**Assignment 101:** Use landmark roles thoughtfully: `role="navigation"`, `role="main"`, and native elements where they duplicate roles.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 101 — Landmarks</title>

</head>
<body>
<header><nav role="navigation" aria-label="Global">…</nav></header>
<main role="main"><h1>Page</h1></main>
</body>
</html>
```

---

**Assignment 102:** Audit and fix heading levels so there is one `<h1>` and levels do not skip incorrectly in a sample article page.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 102 — Heading audit</title>

</head>
<body>
<article>
  <h1>Article title</h1>
  <h2>Section one</h2>
  <h3>Subsection</h3>
  <h2>Section two</h2>
</article>
</body>
</html>
```

---

**Assignment 103:** Write `alt` text examples: one informative image, one decorative image with empty `alt`, and one functional image (linked).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 103 — Alt strategies</title>

</head>
<body>
<p>Informative:</p>
<img src="https://picsum.photos/seed/chart/200/120" alt="Bar chart showing Q1 sales up 12%" width="200" height="120">
<p>Decorative:</p>
<img src="https://picsum.photos/seed/dec/40/40" alt="" width="40" height="40">
<p>Functional (link):</p>
<a href="/home"><img src="https://picsum.photos/seed/logo/80/40" alt="Acme Home" width="80" height="40"></a>
</body>
</html>
```

---

**Assignment 104:** Create a data table with `<th scope>` and optional `headers`/`id` associations for a more complex grid.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 104 — Complex table headers</title>

</head>
<body>
<table>
  <caption>Quarterly by region</caption>
  <thead>
    <tr><th id="reg" scope="col">Region</th><th id="q1" scope="col">Q1</th><th id="q2" scope="col">Q2</th></tr>
  </thead>
  <tbody>
    <tr><th headers="reg" id="na">NA</th><td headers="q1 na">10</td><td headers="q2 na">12</td></tr>
  </tbody>
</table>
</body>
</html>
```

---

**Assignment 105:** Use `aria-expanded` and `aria-controls` on a disclosure-style button controlling a region (static markup).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 105 — aria-expanded controls</title>

</head>
<body>
<button type="button" aria-expanded="false" aria-controls="panel" id="disclosure-btn">Show details</button>
<div id="panel" role="region" aria-labelledby="disclosure-btn" hidden><p>Extra information.</p></div>
</body>
</html>
```

---

**Assignment 106:** Add `lang` on a paragraph of foreign language text using `lang="fr"` (or another language) inside an English page.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 106 — lang attribute</title>

</head>
<body>
<p lang="en">Welcome to our site.</p>
<p lang="fr">Bienvenue sur notre site.</p>
</body>
</html>
```

---

**Assignment 107:** Use `<abbr title>` for abbreviations the first time they appear in a document.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 107 — abbr</title>

</head>
<body>
<p>The <abbr title="World Wide Web Consortium">W3C</abbr> publishes web standards.</p>
</body>
</html>
```

---

**Assignment 108:** Combine landmarks, headings, and ARIA on a single “accessible profile card” page.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 108 — Profile card a11y</title>

</head>
<body>
<article aria-labelledby="card-name">
  <header><h1 id="card-name">Alex Rivera</h1><p class="subtitle">Engineer</p></header>
  <nav aria-label="Profile links"><a href="#projects">Projects</a></nav>
  <p aria-describedby="card-name">Building accessible UIs.</p>
</article>
</body>
</html>
```

---


### SEO & Meta

---

**Assignment 109:** Add `<meta name="description" content>` summarizing the page in ~155 characters.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 109 — Meta description</title>
<meta name="description" content="Learn semantic HTML5 with practical assignments. Free exercises from beginner to advanced for modern web developers.">
</head>
<body>
<main><h1>Landing</h1><p>See meta description in document head (view source).</p></main>
</body>
</html>
```

---

**Assignment 110:** Ensure `<meta name="viewport" content="width=device-width, initial-scale=1">` is present and correct.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 110 — Viewport</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
<main><h1>Responsive</h1><p>Viewport meta enables mobile layout.</p></main>
</body>
</html>
```

---

**Assignment 111:** Add Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) in `<head>`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 111 — Open Graph</title>
<meta property="og:title" content="HTML Assignments">
<meta property="og:description" content="Practice HTML5 with 200 assignments.">
<meta property="og:image" content="https://picsum.photos/seed/og/1200/630">
<meta property="og:url" content="https://example.com/html-assignments">
<meta property="og:type" content="website">
</head>
<body>
<main><h1>OG demo</h1></main>
</body>
</html>
```

---

**Assignment 112:** Add Twitter Card meta tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 112 — Twitter Card</title>
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="HTML Assignments">
<meta name="twitter:description" content="Practice HTML5.">
<meta name="twitter:image" content="https://picsum.photos/seed/tw/1200/600">
</head>
<body>
<main><h1>Twitter card demo</h1></main>
</body>
</html>
```

---

**Assignment 113:** Add `<link rel="canonical" href>` pointing to the preferred URL.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 113 — Canonical</title>
<link rel="canonical" href="https://example.com/preferred-url">
</head>
<body>
<main><h1>Canonical URL</h1></main>
</body>
</html>
```

---

**Assignment 114:** Add `<meta name="robots" content="index, follow">` (or a noindex example with comment explaining use).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 114 — robots meta</title>
<meta name="robots" content="index, follow">
<!-- Use noindex, nofollow for staging pages -->
</head>
<body>
<main><h1>Indexing policy</h1><p>This sample allows indexing.</p></main>
</body>
</html>
```

---

**Assignment 115:** Link a favicon using `<link rel="icon" href>` (placeholder path).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 115 — Favicon</title>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
</head>
<body>
<main><h1>Favicon linked in head</h1></main>
</body>
</html>
```

---

**Assignment 116:** Embed JSON-LD `<script type="application/ld+json">` for an `Organization` or `WebSite` schema.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 116 — JSON-LD</title>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Organization","name":"Demo Org","url":"https://example.com"}
</script>
</head>
<body>
<main><h1>Structured data</h1></main>
</body>
</html>
```

---

**Assignment 117:** Reference a sitemap in a comment or with `<link rel="sitemap" type="application/xml" href>` if appropriate for your setup.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 117 — Sitemap reference</title>
<link rel="sitemap" type="application/xml" title="Sitemap" href="https://example.com/sitemap.xml">
</head>
<body>
<main><h1>Sitemap</h1><p>Reference sitemap in head (optional pattern).</p></main>
</body>
</html>
```

---

**Assignment 118:** Combine SEO meta, Open Graph, Twitter, canonical, and JSON-LD on one cohesive landing page head.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 118 — Combined SEO head</title>
<meta name="description" content="Complete HTML5 assignment track for developers.">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="canonical" href="https://example.com/">
<meta property="og:title" content="HTML Track">
<meta property="og:description" content="Assignments 1–200.">
<meta property="og:image" content="https://picsum.photos/seed/combo/1200/630">
<meta property="og:url" content="https://example.com/">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="HTML Track">
<link rel="icon" href="/favicon.ico">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"HTML Track","url":"https://example.com/"}</script>
</head>
<body>
<main><h1>Full head demo</h1><p>Inspect <code>head</code> for meta bundle.</p></main>
</body>
</html>
```

---


### Advanced Elements

---

**Assignment 119:** Create an FAQ using native `<details>` and `<summary>` elements (multiple items).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 119 — details summary FAQ</title>

</head>
<body>
<h1>FAQ</h1>
<details><summary>What is HTML5?</summary><p>The living standard for HTML.</p></details>
<details><summary>Do I need to close void elements?</summary><p>Not in HTML syntax.</p></details>
</body>
</html>
```

---

**Assignment 120:** Use `<dialog>` with a button that opens it via `showModal()` in a short script.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 120 — dialog showModal</title>

</head>
<body>
<button type="button" id="open">Open dialog</button>
<dialog id="d"><p>Hello from dialog</p><form method="dialog"><button>Close</button></form></dialog>
<script>
document.getElementById("open").onclick = () => document.getElementById("d").showModal();
</script>
</body>
</html>
```

---

**Assignment 121:** Show task progress with `<progress value max>`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 121 — progress</title>

</head>
<body>
<label for="p">Download</label>
<progress id="p" value="32" max="100">32%</progress>
</body>
</html>
```

---

**Assignment 122:** Show a gauge with `<meter min max low high optimum value>`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 122 — meter</title>

</head>
<body>
<label for="m">Disk usage</label>
<meter id="m" min="0" max="100" low="33" high="66" optimum="20" value="72">72%</meter>
</body>
</html>
```

---

**Assignment 123:** Mark up dates and times using `<time datetime>` for machine-readable values.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 123 — time</title>

</head>
<body>
<p>Published <time datetime="2025-03-23">March 23, 2025</time></p>
</body>
</html>
```

---

**Assignment 124:** Highlight search terms in a paragraph using `<mark>`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 124 — mark</title>

</head>
<body>
<p>Search results for <mark>HTML5</mark> assignments.</p>
</body>
</html>
```

---

**Assignment 125:** Store machine-readable values inline using `<data value>`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 125 — data element</title>

</head>
<body>
<ul>
  <li><data value="sku-1001">Widget Pro</data></li>
  <li><data value="sku-1002">Widget Lite</data></li>
</ul>
</body>
</html>
```

---

**Assignment 126:** Add `data-*` attributes on several elements and document their purpose in comments.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 126 — data-* attributes</title>

</head>
<body>
<!-- data-user-id stores client id for scripts -->
<button type="button" data-action="save" data-user-id="42">Save</button>
<p data-theme="dark">Themed paragraph</p>
</body>
</html>
```

---

**Assignment 127:** Create a `contenteditable` region demonstrating editable rich text (with a note about production considerations).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 127 — contenteditable</title>

</head>
<body>
<p contenteditable="true" spellcheck="true">Click to edit this note (demo only).</p>
</body>
</html>
```

---

**Assignment 128:** Add microdata `itemscope`/`itemtype`/`itemprop` for a simple `Product` snippet.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 128 — Microdata Product</title>

</head>
<body>
<div itemscope itemtype="https://schema.org/Product">
  <h1 itemprop="name">USB-C Hub</h1>
  <img itemprop="image" src="https://picsum.photos/seed/hub/200/200" alt="" width="200" height="200">
  <p><span itemprop="brand" itemscope itemtype="https://schema.org/Brand"><span itemprop="name">Acme</span></span></p>
  <p><span itemprop="offers" itemscope itemtype="https://schema.org/Offer"><span itemprop="priceCurrency" content="USD">$</span><span itemprop="price">29.99</span></span></p>
</div>
</body>
</html>
```

---

**Assignment 129:** Define reusable markup inside `<template>` and clone it with JavaScript into the page.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 129 — template clone</title>

</head>
<body>
<ul id="list"></ul>
<template id="row">
  <li></li>
</template>
<script>
const t = document.getElementById("row");
const list = document.getElementById("list");
["A","B"].forEach((x) => {
  const node = t.content.cloneNode(true);
  node.querySelector("li").textContent = x;
  list.appendChild(node);
});
</script>
</body>
</html>
```

---

**Assignment 130:** Combine `<details>`, `<dialog>`, `<progress>`, and `<meter>` on a “dashboard widgets” demo page.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 130 — Dashboard widgets</title>

</head>
<body>
<h1>Widgets</h1>
<details><summary>Logs</summary><p>OK</p></details>
<button type="button" onclick="document.getElementById('dlg').showModal()">Open</button>
<dialog id="dlg"><p>Alert</p><form method="dialog"><button>OK</button></form></dialog>
<label>Task <progress value="3" max="5"></progress></label>
<label>CPU <meter min="0" max="100" value="45"></meter></label>
</body>
</html>
```

---


### Page Layouts

---

**Assignment 131:** Build a Holy Grail layout (header, footer, three columns) using semantic elements and CSS flex or grid in `<style>`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 131 — Holy grail</title>

</head>
<body>
<style>
  body { margin:0; min-height:100vh; display:grid; grid-template-rows:auto 1fr auto; grid-template-columns:200px 1fr 200px; grid-template-areas:"head head head" "nav main aside" "foot foot foot"; gap:8px; }
  header { grid-area:head; background:#ddd; padding:1rem; }
  nav { grid-area:nav; background:#eee; padding:1rem; }
  main { grid-area:main; padding:1rem; }
  aside { grid-area:aside; background:#eee; padding:1rem; }
  footer { grid-area:foot; background:#ddd; padding:1rem; }
</style>
<header>Header</header><nav>Nav</nav><main>Main</main><aside>Aside</aside><footer>Footer</footer>
</body>
</html>
```

---

**Assignment 132:** Build a blog index layout: featured post, list of posts, sidebar with categories.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 132 — Blog index</title>

</head>
<body>
<header><h1>Blog</h1></header>
<div style="display:grid;grid-template-columns:2fr 1fr;gap:1rem">
  <main>
    <article><h2>Featured</h2><p>Long post…</p></article>
    <article><h2>Older</h2><p>Snippet…</p></article>
  </main>
  <aside><h2>Categories</h2><ul><li>HTML</li><li>CSS</li></ul></aside>
</div>
</body>
</html>
```

---

**Assignment 133:** Build a portfolio page: hero, project grid, about section, contact strip.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 133 — Portfolio</title>

</head>
<body>
<header><h1>Portfolio</h1></header>
<section aria-labelledby="hero"><h2 id="hero">Hello</h2><p>Designer &amp; developer.</p></section>
<section aria-labelledby="work"><h2 id="work">Projects</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px"><article><h3>A</h3></article><article><h3>B</h3></article><article><h3>C</h3></article></div></section>
<section aria-labelledby="about"><h2 id="about">About</h2><p>Bio…</p></section>
<footer>Contact: <a href="mailto:me@example.com">email</a></footer>
</body>
</html>
```

---

**Assignment 134:** Build a product landing page: hero, features, testimonials, pricing teaser, CTA.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 134 — Landing page</title>

</head>
<body>
<header><h1>Product</h1></header>
<section><h2>Hero</h2><p>Value proposition</p><a href="#buy">Get started</a></section>
<section><h2>Features</h2><ul><li>Fast</li><li>Secure</li></ul></section>
<section><h2>Testimonials</h2><blockquote><p>Great!</p></blockquote></section>
<section id="buy"><h2>Pricing</h2><p>From $9/mo</p></section>
<footer>&copy; Co</footer>
</body>
</html>
```

---

**Assignment 135:** Build a dashboard layout: top bar, side nav, main panels grid.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 135 — Dashboard</title>

</head>
<body>
<style>body{display:grid;grid-template-columns:220px 1fr;grid-template-rows:auto 1fr;min-height:100vh;margin:0} header{grid-column:1/-1;padding:1rem;background:#222;color:#fff} nav{padding:1rem;background:#eee} main{padding:1rem;display:grid;grid-template-columns:repeat(2,1fr);gap:1rem}</style>
<header>Dashboard</header>
<nav><a href="#">Home</a><br><a href="#">Reports</a></nav>
<main><section><h2>Metric A</h2><p>12</p></section><section><h2>Metric B</h2><p>48</p></section></main>
</body>
</html>
```

---

**Assignment 136:** Build an e-commerce product page: gallery area, title/price, description, add-to-cart form placeholder, specs table.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 136 — Product page</title>

</head>
<body>
<article>
  <h1>Running Shoes</h1>
  <div style="display:flex;gap:1rem">
    <img src="https://picsum.photos/seed/shoe/300/300" alt="Shoe side view" width="300" height="300">
    <div><p>$129</p><form><button type="submit">Add to cart</button></form></div>
  </div>
  <p>Lightweight daily trainer.</p>
  <table><caption>Specs</caption><tr><th>Weight</th><td>240g</td></tr><tr><th>Drop</th><td>8mm</td></tr></table>
</article>
</body>
</html>
```

---

**Assignment 137:** Build a documentation page: sidebar ToC, main content with on-page anchors, code `<pre>` blocks.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 137 — Documentation</title>

</head>
<body>
<div style="display:flex;gap:1rem">
  <nav aria-label="Documentation"><ul><li><a href="#install">Install</a></li><li><a href="#api">API</a></li></ul></nav>
  <main>
    <h1>Docs</h1>
    <section id="install"><h2>Install</h2><pre><code>npm install demo</code></pre></section>
    <section id="api"><h2>API</h2><pre><code>GET /v1/items</code></pre></section>
  </main>
</div>
</body>
</html>
```

---

**Assignment 138:** Build a simple responsive email-style HTML table layout (inline-friendly structure, narrow width).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 138 — Email-style table layout</title>

</head>
<body>
<table role="presentation" width="100%" style="max-width:600px;margin:0 auto;background:#f9f9f9">
  <tr><td style="padding:24px;background:#333;color:#fff;font-family:sans-serif"><h1 style="margin:0">Newsletter</h1></td></tr>
  <tr><td style="padding:16px;font-family:sans-serif"><p>Hello subscriber,</p><p>Your weekly update.</p></td></tr>
  <tr><td style="padding:16px;font-size:12px;color:#666">Unsubscribe</td></tr>
</table>
</body>
</html>
```

---

**Assignment 139:** Build a creative 404 page with heading, helpful links, and search form.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 139 — 404 page</title>

</head>
<body>
<main style="text-align:center;padding:4rem;font-family:sans-serif">
  <h1>404</h1>
  <p>We could not find that page.</p>
  <p><a href="/">Home</a> · <a href="/search">Search</a></p>
  <form role="search"><label for="q">Search</label><input id="q" type="search" name="q"><button>Go</button></form>
</main>
</body>
</html>
```

---

**Assignment 140:** Build a login and registration page pair as two `<article>` sections or tabs on one page with two forms.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 140 — Login and register</title>

</head>
<body>
<main style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;max-width:720px;margin:auto">
  <article aria-labelledby="login-h"><h2 id="login-h">Log in</h2>
    <form><label>Email<input type="email" name="e" required></label><br><label>Password<input type="password" name="p" required></label><br><button>Log in</button></form>
  </article>
  <article aria-labelledby="reg-h"><h2 id="reg-h">Register</h2>
    <form><label>Name<input type="text" name="n" required></label><br><label>Email<input type="email" name="e" required></label><br><button>Create account</button></form>
  </article>
</main>
</body>
</html>
```

---

## 🔴 ADVANCED LEVEL (Assignments 141–200)

### Web Components

---

**Assignment 141:** Register a custom element `<hello-world>` that displays shadowed text using `customElements.define`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 141 — Custom element</title>

</head>
<body>
<hello-world></hello-world>
<script>
class HelloWorld extends HTMLElement {
  connectedCallback() { this.textContent = "Hello, world!"; }
}
customElements.define("hello-world", HelloWorld);
</script>
</body>
</html>
```

---

**Assignment 142:** Attach a shadow root to a custom element and place styled content inside closed or open shadow mode.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 142 — Shadow root</title>

</head>
<body>
<shadow-demo></shadow-demo>
<script>
class ShadowDemo extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `<style>p{color:#06c}</style><p>Shadow DOM content</p>`;
  }
}
customElements.define("shadow-demo", ShadowDemo);
</script>
</body>
</html>
```

---

**Assignment 143:** Use `<template>` with `<slot>` and named slots for component composition.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 143 — Template slot</title>

</head>
<body>
<user-card><span slot="name">Alex</span><span slot="bio">Builder</span></user-card>
<template id="uc-tpl">
  <style>:host{display:block;border:1px solid #ccc;padding:8px}</style>
  <h2><slot name="name">Name</slot></h2>
  <p><slot name="bio">Bio</slot></p>
</template>
<script>
class UserCard extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.appendChild(document.getElementById("uc-tpl").content.cloneNode(true));
  }
}
customElements.define("user-card", UserCard);
</script>
</body>
</html>
```

---

**Assignment 144:** Implement `connectedCallback` and `attributeChangedCallback` with `observedAttributes` on a custom element.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 144 — Lifecycle callbacks</title>

</head>
<body>
<life-el data-msg="hi"></life-el>
<script>
class LifeEl extends HTMLElement {
  static get observedAttributes() { return ["data-msg"]; }
  connectedCallback() { this.innerHTML = "<p>Connected</p>"; }
  attributeChangedCallback(name, oldV, newV) { if (name === "data-msg") this.dataset.display = newV; }
}
customElements.define("life-el", LifeEl);
</script>
</body>
</html>
```

---

**Assignment 145:** Reflect a JavaScript property to an HTML attribute (or vice versa) on a custom element.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 145 — Reflect attribute</title>

</head>
<body>
<counter-el count="0"></counter-el>
<script>
class CounterEl extends HTMLElement {
  static get observedAttributes() { return ["count"]; }
  attributeChangedCallback() { this.textContent = "Count: " + this.getAttribute("count"); }
}
customElements.define("counter-el", CounterEl);
</script>
</body>
</html>
```

---

**Assignment 146:** Extend a built-in element using `extends` and `is="..."` (where supported) with a fallback note in comments.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 146 — extends built-in</title>

</head>
<body>
<!-- is= is deprecated in Chrome; include native button fallback -->
<button is="fancy-btn" type="button">Fancy</button>
<button type="button">Plain fallback</button>
<script>
class FancyBtn extends HTMLButtonElement {
  connectedCallback() { this.style.border = "2px solid #06c"; }
}
customElements.define("fancy-btn", FancyBtn, { extends: "button" });
</script>
</body>
</html>
```

---

**Assignment 147:** Dispatch and listen for a `CustomEvent` between a host page and a custom element.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 147 — CustomEvent</title>

</head>
<body>
<event-host></event-host>
<p id="out"></p>
<script>
class EventHost extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<button type="button">Ping</button>`;
    this.querySelector("button").onclick = () =>
      this.dispatchEvent(new CustomEvent("host:ping", { bubbles: true, detail: { n: 1 } }));
  }
}
customElements.define("event-host", EventHost);
document.querySelector("event-host").addEventListener("host:ping", (e) => {
  document.getElementById("out").textContent = "Got ping " + e.detail.n;
});
</script>
</body>
</html>
```

---

**Assignment 148:** Pass data into a custom element via attributes and render updates in `attributeChangedCallback`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 148 — Attributes to render</title>

</head>
<body>
<greet-el who="World"></greet-el>
<script>
class GreetEl extends HTMLElement {
  static get observedAttributes() { return ["who"]; }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }
  render() { this.textContent = "Hello, " + (this.getAttribute("who") || "friend"); }
}
customElements.define("greet-el", GreetEl);
</script>
</body>
</html>
```

---

**Assignment 149:** Nest custom elements (parent/child) demonstrating light DOM composition.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 149 — Nested custom elements</title>

</head>
<body>
<parent-el></parent-el>
<script>
class ChildEl extends HTMLElement {
  connectedCallback() { this.textContent = "Child"; }
}
class ParentEl extends HTMLElement {
  connectedCallback() {
    this.innerHTML = "<child-el></child-el>";
  }
}
customElements.define("child-el", ChildEl);
customElements.define("parent-el", ParentEl);
</script>
</body>
</html>
```

---

**Assignment 150:** Build a small “card” web component with slots for title, media, and actions.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 150 — Card component slots</title>

</head>
<body>
<ui-card><span slot="title">Title</span><img slot="media" src="https://picsum.photos/seed/card/320/180" alt="" width="320" height="180"><button slot="actions" type="button">Go</button></ui-card>
<template id="card-tpl">
  <style>:host{display:block;border:1px solid #ccc;border-radius:8px;overflow:hidden}</style>
  <slot name="media"></slot>
  <div style="padding:8px"><h2><slot name="title">Title</slot></h2><slot name="actions"></slot></div>
</template>
<script>
class UiCard extends HTMLElement {
  constructor() {
    super();
    const s = this.attachShadow({ mode: "open" });
    s.appendChild(document.getElementById("card-tpl").content.cloneNode(true));
  }
}
customElements.define("ui-card", UiCard);
</script>
</body>
</html>
```

---


### Canvas & SVG

---

**Assignment 151:** Draw a rectangle, circle, and line on `<canvas>` using 2D context API.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 151 — Canvas drawing</title>

</head>
<body>
<canvas id="c" width="300" height="200" aria-label="Shapes demo"></canvas>
<script>
const ctx = document.getElementById("c").getContext("2d");
ctx.fillStyle = "#3366cc";
ctx.fillRect(20, 20, 100, 60);
ctx.beginPath();
ctx.arc(200, 80, 40, 0, Math.PI * 2);
ctx.fillStyle = "#cc6633";
ctx.fill();
ctx.strokeStyle = "#000";
ctx.beginPath();
ctx.moveTo(20, 150);
ctx.lineTo(280, 150);
ctx.stroke();
</script>
</body>
</html>
```

---

**Assignment 152:** Create an SVG with `<rect>`, `<circle>`, and `<line>` inline in HTML.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 152 — Inline SVG</title>

</head>
<body>
<svg width="200" height="120" viewBox="0 0 200 120" aria-label="Basic shapes">
  <rect x="10" y="10" width="80" height="50" fill="#69c"/>
  <circle cx="150" cy="45" r="30" fill="#c96"/>
  <line x1="10" y1="100" x2="190" y2="100" stroke="#333" stroke-width="4"/>
</svg>
</body>
</html>
```

---

**Assignment 153:** Animate SVG attributes or use `<animate>` on a shape (SMIL or CSS keyframes in `<style>`).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 153 — SVG animation</title>

</head>
<body>
<svg width="120" height="120" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="40" fill="#6c6">
    <animate attributeName="r" values="40;48;40" dur="2s" repeatCount="indefinite"/>
  </circle>
</svg>
</body>
</html>
```

---

**Assignment 154:** Make an interactive SVG button or shape that changes on click via a short script.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 154 — Interactive SVG</title>

</head>
<body>
<svg width="200" height="80" role="img" aria-label="Clickable shape">
  <rect id="hit" x="20" y="20" width="160" height="40" fill="#99f" tabindex="0" style="cursor:pointer"/>
</svg>
<p id="msg">Click the rectangle</p>
<script>
document.getElementById("hit").addEventListener("click", () => {
  document.getElementById("msg").textContent = "Clicked!";
});
</script>
</body>
</html>
```

---

**Assignment 155:** Build a small inline SVG icon sprite sheet using `<symbol>` and `<use href>`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 155 — SVG sprite</title>

</head>
<body>
<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <symbol id="icon-heart" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21s-6-4.35-9-8.5C1.5 9 3 6 6 6c1.74 0 3.41 1 4 2.09C10.59 7 12.26 6 14 6c3 0 4.5 3 3 6.5C14 16.65 12 21 12 21z"/></symbol>
</svg>
<p style="color:#c00;font-size:48px"><svg width="1em" height="1em" aria-hidden="true"><use href="#icon-heart"/></svg></p>
</body>
</html>
```

---

**Assignment 156:** Draw a simple movable “player” square on canvas with keyboard or button controls.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 156 — Canvas game square</title>

</head>
<body>
<canvas id="g" width="300" height="200" tabindex="0"></canvas>
<p>Arrow keys move the square</p>
<script>
const canvas = document.getElementById("g");
const ctx = canvas.getContext("2d");
let x = 50, y = 50;
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#06c";
  ctx.fillRect(x, y, 24, 24);
}
canvas.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") x += 8;
  if (e.key === "ArrowLeft") x -= 8;
  if (e.key === "ArrowDown") y += 8;
  if (e.key === "ArrowUp") y -= 8;
  draw();
});
draw();
</script>
</body>
</html>
```

---

**Assignment 157:** Create a minimal SVG bar chart from static data (rects with labels).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 157 — SVG bar chart</title>

</head>
<body>
<svg width="320" height="200" viewBox="0 0 320 200" role="img" aria-label="Sales by month">
  <g transform="translate(40,20)">
    <rect x="0" y="80" width="40" height="60" fill="#4472c4"/><text x="5" y="155" font-size="12">Jan</text>
    <rect x="60" y="50" width="40" height="90" fill="#4472c4"/><text x="65" y="155" font-size="12">Feb</text>
    <rect x="120" y="65" width="40" height="75" fill="#4472c4"/><text x="125" y="155" font-size="12">Mar</text>
  </g>
</svg>
</body>
</html>
```

---

**Assignment 158:** Make an SVG `viewBox` responsive inside a container with `preserveAspectRatio`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 158 — Responsive SVG</title>

</head>
<body>
<div style="max-width:100%;width:400px">
  <svg viewBox="0 0 100 60" width="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Banner">
    <rect width="100" height="60" fill="#e0e0e0"/>
    <text x="50" y="35" text-anchor="middle" font-size="10">Logo</text>
  </svg>
</div>
</body>
</html>
```

---

**Assignment 159:** Combine canvas and SVG on one page for different visual roles (explain in a heading).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 159 — Canvas and SVG together</title>

</head>
<body>
<main>
  <h1>Graphics</h1>
  <p>Canvas for raster drawing; SVG for scalable vector graphics.</p>
  <canvas id="cv" width="120" height="80" style="border:1px solid #ccc"></canvas>
  <svg width="120" height="80" style="vertical-align:top;border:1px solid #ccc"><circle cx="60" cy="40" r="30" fill="#9cf"/></svg>
</main>
<script>document.getElementById("cv").getContext("2d").fillRect(10,10,100,60);</script>
</body>
</html>
```

---

**Assignment 160:** Export or redraw canvas content on a button click (simple pixel clear/fill demo).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 160 — Canvas clear redraw</title>

</head>
<body>
<canvas id="x" width="200" height="120"></canvas>
<button type="button" id="btn">Redraw</button>
<script>
const c = document.getElementById("x");
const ctx = c.getContext("2d");
function paint() {
  ctx.fillStyle = "#" + Math.floor(Math.random()*0xffffff).toString(16).padStart(6,"0");
  ctx.fillRect(0, 0, c.width, c.height);
}
document.getElementById("btn").onclick = paint;
paint();
</script>
</body>
</html>
```

---


### Performance & Optimization

---

**Assignment 161:** Structure critical above-the-fold content first in `<body>` and defer non-critical widgets below.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 161 — Critical path structure</title>

</head>
<body>
<header><h1>Above the fold</h1><p>Hero content first in body order.</p></header>
<main><p>Primary story…</p></main>
<aside id="widgets"><p>Deferred widgets below main content in DOM order.</p></aside>
</body>
</html>
```

---

**Assignment 162:** Apply `loading="lazy"` to images and `loading="lazy"` to iframes where appropriate.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 162 — Lazy images iframes</title>

</head>
<body>
<p><img src="https://picsum.photos/seed/lz/400/240" alt="" width="400" height="240" loading="lazy"></p>
<iframe src="https://example.com" title="Example" width="400" height="200" loading="lazy"></iframe>
</body>
</html>
```

---

**Assignment 163:** Add `<link rel="preload" as="font" href>` (placeholder) with `crossorigin` note.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 163 — Preload font</title>
<link rel="preload" href="/fonts/variable.woff2" as="font" type="font/woff2" crossorigin>
</head>
<body>
<main><h1>Preload demo</h1><p>Font preload hint in head (placeholder URL).</p></main>
</body>
</html>
```

---

**Assignment 164:** Add `<link rel="prefetch" href>` for a likely next page (placeholder URL).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 164 — Prefetch</title>
<link rel="prefetch" href="/next-page.html">
</head>
<body>
<main><h1>Prefetch next page</h1></main>
</body>
</html>
```

---

**Assignment 165:** Add `<link rel="preconnect" href>` to a third-party origin (e.g., fonts or CDN).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 165 — Preconnect</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
</head>
<body>
<main><h1>Preconnect</h1></main>
</body>
</html>
```

---

**Assignment 166:** Load scripts with `defer` and `async` examples in comments comparing behavior.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 166 — async defer</title>
<!-- defer: order preserved, runs after parse | async: download in parallel, run when ready -->
<script defer src="data:text/javascript,console.log('defer')"></script>
<script async src="data:text/javascript,console.log('async')"></script>
</head>
<body>
<main><h1>Script loading</h1><p>See comments in head.</p></main>
</body>
</html>
```

---

**Assignment 167:** Use `fetchpriority="high"` on a hero image `<img>` (with supporting note).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 167 — fetchpriority hero</title>

</head>
<body>
<img src="https://picsum.photos/seed/hero/1200/600" alt="Hero" width="1200" height="600" fetchpriority="high">
</body>
</html>
```

---

**Assignment 168:** Provide a responsive image strategy section: `picture`, `srcset`, and art direction example together.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 168 — Responsive bundle</title>

</head>
<body>
<picture>
  <source media="(max-width:600px)" srcset="https://picsum.photos/seed/mob/400/300">
  <source type="image/webp" srcset="https://www.gstatic.com/webp/gallery/1.sm.webp">
  <img src="https://www.gstatic.com/webp/gallery/1.jpg" alt="Combined strategy" width="800" height="600" sizes="100vw">
</picture>
</body>
</html>
```

---

**Assignment 169:** Minimize render-blocking by moving styles inline for critical CSS demo and linking non-critical CSS (placeholder).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 169 — Critical CSS demo</title>

</head>
<body>
<style>body{font-family:system-ui;margin:0}header{background:#111;color:#fff;padding:1rem}</style>
<header>Critical CSS inlined</header>
<main><p>Non-critical stylesheet could load async (placeholder).</p></main>
<link rel="stylesheet" href="/non-critical.css" media="print" onload="this.media='all'">
</body>
</html>
```

---

**Assignment 170:** Document a performance checklist in the page using `<details>` sections (images, scripts, fonts, caching hints).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 170 — Performance checklist</title>

</head>
<body>
<h1>Performance checklist</h1>
<details><summary>Images</summary><p>Compress, lazy-load, correct sizes.</p></details>
<details><summary>Scripts</summary><p>Use defer/async; avoid blocking.</p></details>
<details><summary>Fonts</summary><p>Preload, subset, font-display.</p></details>
<details><summary>Caching</summary><p>Use cache headers on server.</p></details>
</body>
</html>
```

---


### Advanced Accessibility

---

**Assignment 171:** Add a static WCAG-oriented checklist table mapping criteria to your sample page features.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 171 — WCAG checklist table</title>

</head>
<body>
<table>
  <caption>Sample page vs WCAG ideas</caption>
  <thead><tr><th>Criterion</th><th>Implemented</th></tr></thead>
  <tbody>
    <tr><th scope="row">Text alternatives</th><td>Images use alt</td></tr>
    <tr><th scope="row">Keyboard</th><td>Focus styles on links</td></tr>
    <tr><th scope="row">Contrast</th><td>High contrast text</td></tr>
  </tbody>
</table>
</body>
</html>
```

---

**Assignment 172:** Implement `aria-live="polite"` on a status region updated by a button (simple text append).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 172 — aria-live polite</title>

</head>
<body>
<div id="status" aria-live="polite" aria-atomic="true"></div>
<button type="button" id="go">Save</button>
<script>
document.getElementById("go").onclick = () => {
  document.getElementById("status").textContent = "Saved at " + new Date().toLocaleTimeString();
};
</script>
</body>
</html>
```

---

**Assignment 173:** Trap focus inside an open `<dialog>` using `showModal()` defaults and explain in a paragraph.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 173 — Dialog focus trap</title>

</head>
<body>
<button type="button" id="op">Open modal</button>
<dialog id="m" aria-labelledby="mh"><h2 id="mh">Confirm</h2><p>Modal uses browser focus trap when opened with showModal().</p><form method="dialog"><button>OK</button></form></dialog>
<script>document.getElementById("op").onclick=()=>document.getElementById("m").showModal();</script>
</body>
</html>
```

---

**Assignment 174:** Build a keyboard-navigable list of buttons styled as tabs with `role="tablist"` pattern (ARIA).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 174 — Tabs ARIA</title>

</head>
<body>
<div class="tabs">
  <div role="tablist" aria-label="Sample tabs">
    <button role="tab" aria-selected="true" aria-controls="p1" id="t1" type="button">One</button>
    <button role="tab" aria-selected="false" aria-controls="p2" id="t2" type="button">Two</button>
  </div>
  <div role="tabpanel" id="p1" aria-labelledby="t1"><p>Panel one</p></div>
  <div role="tabpanel" id="p2" aria-labelledby="t2" hidden><p>Panel two</p></div>
</div>
</body>
</html>
```

---

**Assignment 175:** Build an accessible accordion with buttons controlling panels (`aria-expanded`, `aria-controls`).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 175 — Accordion ARIA</title>

</head>
<body>
<div>
  <button type="button" aria-expanded="true" aria-controls="acc1" id="b1">Section 1</button>
  <div id="acc1" role="region" aria-labelledby="b1"><p>Content 1</p></div>
  <button type="button" aria-expanded="false" aria-controls="acc2" id="b2">Section 2</button>
  <div id="acc2" role="region" aria-labelledby="b2" hidden><p>Content 2</p></div>
</div>
</body>
</html>
```

---

**Assignment 176:** Mark up a carousel with `role="region"`, `aria-roledescription="carousel"`, and live region hints (static).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 176 — Carousel region</title>

</head>
<body>
<section role="region" aria-roledescription="carousel" aria-label="Featured products" aria-live="polite">
  <h2>Featured</h2>
  <div role="group" aria-label="Slide 1 of 2"><p>Product A</p></div>
  <div role="group" aria-label="Slide 2 of 2" hidden><p>Product B</p></div>
  <button type="button">Previous</button>
  <button type="button">Next</button>
</section>
</body>
</html>
```

---

**Assignment 177:** Ensure visible focus outlines in CSS for all interactive elements in a complex layout.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 177 — Focus outlines</title>

</head>
<body>
<style>
  a:focus-visible, button:focus-visible, input:focus-visible { outline: 3px solid #06c; outline-offset: 2px; }
</style>
<nav><a href="#a">Link</a> <button type="button">Btn</button></nav>
<input type="text" aria-label="Demo">
</body>
</html>
```

---

**Assignment 178:** Provide “announcements” using `aria-live` and `aria-atomic` on a toast region.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 178 — aria-live toast</title>

</head>
<body>
<div id="toast" role="status" aria-live="polite" aria-atomic="true"></div>
<button type="button" onclick="document.getElementById('toast').textContent='Copied!'">Copy</button>
</body>
</html>
```

---

**Assignment 179:** Build an accessible modal dialog pattern with `<dialog>`, labeled title, and focus return note.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 179 — Accessible modal dialog</title>

</head>
<body>
<button type="button" id="openm">Open</button>
<dialog aria-labelledby="mt" id="md">
  <h2 id="mt">Settings</h2>
  <p>Focus moves to dialog on open; closing returns focus to trigger (browser default with showModal).</p>
  <form method="dialog"><button>Close</button></form>
</dialog>
<script>document.getElementById("openm").onclick=()=>document.getElementById("md").showModal();</script>
</body>
</html>
```

---

**Assignment 180:** Combine tabs, accordion, and skip link on one accessibility demo page with documentation comments.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 180 — A11y demo combo</title>

</head>
<body>
<a href="#main" class="vh">Skip</a>
<style>.vh{position:absolute;clip:rect(0 0 0 0)}</style>
<main id="main">
  <h1>Demo</h1>
  <div role="tablist"><button type="button" role="tab">Tab</button></div>
  <button type="button" aria-expanded="false" aria-controls="ac">Accordion</button>
  <div id="ac" hidden>Panel</div>
</main>
</body>
</html>
```

---


### Modern HTML APIs

---

**Assignment 181:** Implement HTML5 Drag and Drop: draggable item and drop zone with `dataTransfer` (minimal demo).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 181 — Drag and drop</title>

</head>
<body>
<p id="drag" draggable="true">Drag me</p>
<div id="drop" style="min-height:80px;border:2px dashed #333">Drop here</div>
<script>
const d = document.getElementById("drag");
const z = document.getElementById("drop");
d.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", "hi"));
z.addEventListener("dragover", (e) => e.preventDefault());
z.addEventListener("drop", (e) => { e.preventDefault(); z.textContent = e.dataTransfer.getData("text/plain"); });
</script>
</body>
</html>
```

---

**Assignment 182:** Use `localStorage` to persist a theme choice toggled by a button (short script).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 182 — localStorage theme</title>

</head>
<body>
<button type="button" id="toggle">Toggle theme</button>
<script>
const k = "theme";
if (localStorage.getItem(k) === "dark") document.body.style.background = "#222";
document.getElementById("toggle").onclick = () => {
  const dark = document.body.style.background === "rgb(34, 34, 34)";
  document.body.style.background = dark ? "" : "#222";
  localStorage.setItem(k, dark ? "light" : "dark");
};
</script>
</body>
</html>
```

---

**Assignment 183:** Request geolocation on button click with `navigator.geolocation.getCurrentPosition` and show coords in `<output>`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 183 — Geolocation</title>

</head>
<body>
<button type="button" id="geo">Where am I?</button>
<output id="o" for="geo"></output>
<script>
document.getElementById("geo").onclick = () => {
  navigator.geolocation.getCurrentPosition(
    (p) => { document.getElementById("o").textContent = p.coords.latitude + ", " + p.coords.longitude; },
    (e) => { document.getElementById("o").textContent = "Error: " + e.message; }
  );
};
</script>
</body>
</html>
```

---

**Assignment 184:** Use the History API (`pushState`) and `popstate` to swap main content titles without reload (minimal).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 184 — History API</title>

</head>
<body>
<nav><button type="button" id="a">View A</button> <button type="button" id="b">View B</button></nav>
<main><h1 id="t">Home</h1></main>
<script>
function setView(title) {
  document.getElementById("t").textContent = title;
  history.pushState({ title }, "", "#" + title);
}
document.getElementById("a").onclick = () => setView("A");
document.getElementById("b").onclick = () => setView("B");
window.addEventListener("popstate", (e) => {
  document.getElementById("t").textContent = e.state ? e.state.title : "Home";
});
</script>
</body>
</html>
```

---

**Assignment 185:** Use `IntersectionObserver` to add a class when a section scrolls into view (short script).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 185 — IntersectionObserver</title>

</head>
<body>
<div style="height:120vh">Scroll down</div>
<p id="seen" aria-live="polite">Not visible</p>
<div id="target" style="height:40px;background:#9cf">Target</div>
<script>
const el = document.getElementById("target");
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) document.getElementById("seen").textContent = "Target visible";
  });
}, { threshold: 0.5 });
io.observe(el);
</script>
</body>
</html>
```

---

**Assignment 186:** Use the Popover API (`popover` attribute, `popovertarget`) on a button and div.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 186 — Popover API</title>

</head>
<body>
<button type="button" popovertarget="info">Info</button>
<div id="info" popover><p>Popover content</p></div>
</body>
</html>
```

---

**Assignment 187:** Use `showModal()` / `close()` on `<dialog>` controlled by buttons (Dialog API practice).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 187 — Dialog API</title>

</head>
<body>
<button type="button" id="dlg-open">Open</button>
<dialog id="d1" aria-labelledby="dlg-t"><h2 id="dlg-t">Native dialog</h2><p>Uses showModal() and close().</p><button type="button" id="dlg-close">Close</button></dialog>
<script>
const d = document.getElementById("d1");
document.getElementById("dlg-open").onclick = () => d.showModal();
document.getElementById("dlg-close").onclick = () => d.close();
</script>
</body>
</html>
```

---

**Assignment 188:** Use View Transitions API (`document.startViewTransition`) guarded by feature detection for a simple theme swap.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 188 — View Transitions</title>

</head>
<body>
<button type="button" id="vt">Toggle</button>
<div id="box" style="width:80px;height:80px;background:#6c6"></div>
<script>
document.getElementById("vt").onclick = () => {
  const b = document.getElementById("box");
  if (document.startViewTransition) {
    document.startViewTransition(() => { b.style.background = b.style.background === "rgb(102, 204, 102)" ? "#66c" : "#6c6"; });
  } else {
    b.style.background = b.style.background === "rgb(102, 204, 102)" ? "#66c" : "#6c6";
  }
};
</script>
</body>
</html>
```

---

**Assignment 189:** Combine Web Storage and History API for a tiny multi-“page” state without server.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 189 — Storage + History</title>

</head>
<body>
<button type="button" id="save">Save view</button>
<button type="button" id="load">Load view</button>
<p id="v"></p>
<script>
document.getElementById("save").onclick = () => {
  localStorage.setItem("view", location.hash || "#home");
  document.getElementById("v").textContent = "Saved " + location.hash;
};
document.getElementById("load").onclick = () => {
  const h = localStorage.getItem("view") || "#home";
  history.pushState({}, "", h);
  document.getElementById("v").textContent = "Loaded " + h;
};
</script>
</body>
</html>
```

---

**Assignment 190:** Build a “feature support” panel listing which APIs appear available in `window`/`HTMLDialogElement` (feature checks only).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 190 — Feature detection panel</title>

</head>
<body>
<ul id="feats"></ul>
<script>
const ul = document.getElementById("feats");
const add = (n, ok) => { const li = document.createElement("li"); li.textContent = n + ": " + (ok ? "yes" : "no"); ul.appendChild(li); };
add("localStorage", !!window.localStorage);
add("geolocation", !!navigator.geolocation);
add("IntersectionObserver", !!window.IntersectionObserver);
add("showModal", typeof HTMLDialogElement !== "undefined" && HTMLDialogElement.prototype.showModal);
add("popover", typeof HTMLElement !== "undefined" && "popover" in HTMLElement.prototype);
</script>
</body>
</html>
```

---


### Real-World Projects

---

**Assignment 191:** Build a responsive restaurant menu page with sections (starters, mains, drinks) and prices.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 191 — Restaurant menu</title>

</head>
<body>
<header><h1>Bistro Luna</h1><p>Open daily 5–11pm</p></header>
<main>
  <section aria-labelledby="s"><h2 id="s">Starters</h2><ul><li>Soup — $6</li><li>Salad — $8</li></ul></section>
  <section aria-labelledby="m"><h2 id="m">Mains</h2><ul><li>Pasta — $14</li><li>Steak — $22</li></ul></section>
  <section aria-labelledby="d"><h2 id="d">Drinks</h2><ul><li>House wine — $7</li><li>Soda — $3</li></ul></section>
</main>
</body>
</html>
```

---

**Assignment 192:** Build an event registration form with relevant inputs, fieldsets, and client validation attributes.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 192 — Event registration</title>

</head>
<body>
<form>
  <fieldset><legend>Attendee</legend>
    <label>Full name <input name="name" type="text" required autocomplete="name"></label>
    <label>Email <input name="email" type="email" required autocomplete="email"></label>
  </fieldset>
  <fieldset><legend>Event</legend>
    <label>Date <input name="date" type="date" required></label>
    <label>Ticket <select name="t" required><option value="">Choose</option><option>General</option><option>VIP</option></select></label>
  </fieldset>
  <label><input type="checkbox" name="agree" required> I agree to terms</label>
  <button>Register</button>
</form>
</body>
</html>
```

---

**Assignment 193:** Build a portfolio page using full semantic structure, meta description, and Open Graph tags.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 193 — Portfolio + semantics + SEO</title>
<meta name="description" content="Jamie Chen — full-stack developer portfolio with selected projects.">
<meta property="og:title" content="Jamie Chen Portfolio">
<meta property="og:description" content="Selected work and contact.">
<meta property="og:type" content="profile">
</head>
<body>
<main>
  <h1>Jamie Chen — Developer</h1>
  <p>Projects and contact below.</p>
</main>
</body>
</html>
```

---

**Assignment 194:** Build an accessible dashboard with landmarks, headings table, and `aria-label` on nav regions.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 194 — Accessible dashboard</title>

</head>
<body>
<header role="banner"><h1>Dashboard</h1></header>
<nav aria-label="Main dashboard"><a href="#metrics">Metrics</a></nav>
<main role="main" id="metrics">
  <h2>Overview</h2>
  <table><caption>Key metrics</caption><thead><tr><th scope="col">Metric</th><th scope="col">Value</th></tr></thead><tbody><tr><th scope="row">Users</th><td>1.2k</td></tr></tbody></table>
</main>
</body>
</html>
```

---

**Assignment 195:** Build a responsive email newsletter template using tables for layout and inline-ready structure.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 195 — Email newsletter template</title>

</head>
<body>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4">
  <tr><td align="center" style="padding:16px">
    <table role="presentation" width="600" style="background:#fff;font-family:Arial,sans-serif">
      <tr><td style="padding:24px;font-size:24px;font-weight:bold">Weekly Digest</td></tr>
      <tr><td style="padding:16px 24px"><p>Hi there,</p><p>Here is your summary.</p></td></tr>
      <tr><td style="padding:16px 24px;font-size:12px;color:#666"><a href="#">Unsubscribe</a></td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>
```

---

**Assignment 196:** Build a small documentation site homepage with nav, sections, and code samples in `<pre><code>`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 196 — Documentation site home</title>

</head>
<body>
<header><h1>Kit Docs</h1><nav aria-label="Docs"><a href="#start">Start</a> · <a href="#api">API</a></nav></header>
<main>
  <section id="start"><h2>Getting started</h2><pre><code>npm install kit</code></pre></section>
  <section id="api"><h2>API</h2><pre><code>import { create } from 'kit'</code></pre></section>
</main>
<footer><p>&copy; Kit</p></footer>
</body>
</html>
```

---

**Assignment 197:** Build an interactive FAQ page using `<details>`/`<summary>` and jump links.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 197 — Interactive FAQ</title>

</head>
<body>
<h1>FAQ</h1>
<p><a href="#q1">Jump to shipping</a></p>
<details id="q1" open><summary>Shipping times?</summary><p>3–5 business days.</p></details>
<details><summary>Returns?</summary><p>30 days unused.</p></details>
</body>
</html>
```

---

**Assignment 198:** Build a multi-language page with `lang` attributes, alternate language links, and translated headings for two languages.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 198 — Multi-language page</title>

</head>
<body>
<header>
  <p><a hreflang="en" href="/en/">English</a> · <a hreflang="es" href="/es/">Español</a></p>
</header>
<main>
  <section lang="en"><h1>Welcome</h1><p>Our product helps teams ship faster.</p></section>
  <section lang="es"><h1>Bienvenido</h1><p>Nuestro producto ayuda a los equipos a publicar más rápido.</p></section>
</main>
</body>
</html>
```

---

**Assignment 199:** Build a Progressive Web App shell: `manifest` link, theme-color meta, and a service worker registration script stub.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 199 — PWA shell</title>
<meta name="theme-color" content="#0d47a1">
<link rel="manifest" href="/manifest.webmanifest">
<script>
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}
</script>
</head>
<body>
<main><h1>Offline-ready shell</h1><p>App shell pattern (service worker is a stub).</p></main>
</body>
</html>
```

---

**Assignment 200:** Build an accessible e-commerce category page: product cards as `<article>`, focusable links, and an accessible filter form.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Assignment 200 — Accessible e-commerce</title>

</head>
<body>
<header><h1>Shop</h1><nav aria-label="Store"><a href="#products">Products</a></nav></header>
<main id="products">
  <h2>Category: Shoes</h2>
  <form aria-label="Filter products">
    <fieldset><legend>Size</legend>
      <label><input type="checkbox" name="s" value="8"> 8</label>
      <label><input type="checkbox" name="s" value="9"> 9</label>
    </fieldset>
    <button type="submit">Apply</button>
  </form>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem">
    <article aria-labelledby="p1"><h3 id="p1"><a href="/p/1">Trail Runner</a></h3><img src="https://picsum.photos/seed/p1/200/200" alt="Trail Runner shoe" width="200" height="200"><p>$99</p></article>
    <article aria-labelledby="p2"><h3 id="p2"><a href="/p/2">City Walker</a></h3><img src="https://picsum.photos/seed/p2/200/200" alt="City Walker shoe" width="200" height="200"><p>$79</p></article>
  </div>
</main>
</body>
</html>
```

---

*Total: 200 Assignments with Complete Answers — 70 Beginner | 70 Intermediate | 60 Advanced*
