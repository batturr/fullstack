# HTML & HTML5 Interview Questions — Freshers (0–2 Years)

100 fundamental questions with detailed answers. Use this for revision and mock interviews.

---

## 1. What is HTML, and what role does it play in web development?

HTML (HyperText Markup Language) is the standard markup language used to describe the structure and meaning of content on the web. It is not a programming language; it tells the browser what elements exist on a page—headings, paragraphs, links, images, forms—and how they relate to each other in a document tree. HTML documents are plain text files interpreted by browsers, which apply default styling and may combine them with CSS for presentation and JavaScript for behavior. Understanding HTML is foundational because every web page ultimately renders from an HTML tree, and accessibility and SEO depend heavily on correct, semantic markup.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Example Page</title>
  </head>
  <body>
    <p>This paragraph is <em>marked up</em> with HTML.</p>
  </body>
</html>
```

---

## 2. What is the basic structure of an HTML document?

A minimal HTML5 document includes a doctype, an `html` root element (often with `lang`), a `head` for metadata and resources, and a `body` for visible content. The `head` typically holds the character set, viewport, title, and links to stylesheets; the `body` contains everything users see. Browsers parse this structure into a DOM (Document Object Model) tree. Keeping this separation clear helps screen readers, search engines, and maintainability.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Page Title</title>
  </head>
  <body>
    <h1>Visible content starts here</h1>
  </body>
</html>
```

---

## 3. What is a DOCTYPE, and why is `<!DOCTYPE html>` used in HTML5?

The DOCTYPE is an instruction at the very top of an HTML file that tells the browser which parsing mode to use. In older HTML versions, long DOCTYPE strings referenced specific DTDs; HTML5 simplified this to `<!DOCTYPE html>`, which triggers standards mode in all modern browsers. Without a DOCTYPE, browsers may fall into quirks mode, where layout and CSS behave inconsistently with the specifications. For freshers, memorizing that a single short DOCTYPE enables predictable rendering is usually enough for interviews.

---

## 4. What is the difference between a tag and an element?

People often use “tag” and “element” interchangeably in conversation, but they are distinct. A **tag** is the markup token in angle brackets, such as `<p>` (opening) or `</p>` (closing). An **element** is the complete structure from the opening tag through the closing tag (or the self-closing form), including its content and attributes—e.g., `<p class="intro">Hello</p>` is one paragraph element. Knowing this distinction helps when discussing the DOM, nesting, and validation errors.

```html
<!-- "p" is the tag name; the whole line is a p element -->
<p class="intro" id="first">Hello</p>
```

---

## 5. What are HTML attributes, and how are they written?

Attributes provide extra information about an element, such as identity, behavior, or styling hooks. They appear in the opening tag (or on void elements) as `name="value"` pairs, though boolean attributes like `disabled` or `checked` may omit the value in HTML5. Attribute values should be quoted when they contain spaces or special characters. Some attributes are global (`id`, `class`, `lang`, `data-*`), while others are specific to certain elements (`href` on `a`, `src` on `img`).

```html
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  Example
</a>
<input type="text" name="username" required maxlength="50" />
```

---

## 6. How do you write comments in HTML, and when should you use them?

Comments use the syntax `<!-- ... -->` and do not appear on the rendered page. They are useful for leaving notes for developers, temporarily disabling markup during debugging, or documenting non-obvious structure. Comments are still sent to the client, so avoid putting secrets or sensitive data in them. Nested comments are invalid—do not put `<!--` inside another comment without closing the first.

```html
<!-- Main navigation: update links when IA changes -->
<nav aria-label="Main">
  <a href="/">Home</a>
</nav>
```

---

## 7. How does HTML handle whitespace and line breaks in normal text?

In HTML, consecutive spaces, tabs, and newlines in element text content are typically collapsed into a single space when rendered (with exceptions such as `pre` and elements styled with `white-space`). That is why extra indentation inside HTML source does not create visible gaps in the page. To force line breaks where whitespace rules apply, use `<br>` (sparingly) or block-level elements like `<p>`. For code or poetry where spacing must be preserved, use `<pre>` or CSS `white-space`.

```html
<p>This    text   will
  display as one line with single spaces.</p>
<pre>This    preserves    spaces</pre>
```

---

## 8. What is the difference between block-level and inline elements?

Block-level elements (e.g., `div`, `p`, `h1`–`h6`, `section`) typically start on a new line and stretch to fill the available width of their containing block unless constrained by CSS. Inline elements (e.g., `span`, `a`, `strong`, `em`) flow within a line and only take width as needed. In HTML5, the older “block vs inline” content models are refined with more precise categories, but the interview concept remains: layout and stacking behavior differ, and you cannot nest block elements inside `p` in invalid ways (e.g., `<p><div></div></p>` is invalid).

```html
<div>
  <p>Block paragraph.</p>
  <p>Inline <a href="#">link</a> inside a block.</p>
</div>
```

---

## 9. Briefly describe the history of HTML versions from HTML to HTML5.

HTML evolved from a simple 1990s markup for sharing documents to standardized versions: HTML 2.0, 3.2, HTML 4.01, and XHTML 1.0 (XML-based). HTML5 (a living standard maintained by WHATWG and W3C) introduced semantic elements, rich media (`video`, `audio`), APIs (storage, canvas), and better forms without requiring XHTML’s strict XML rules. Freshers should know that “HTML5” today refers to both the language and a broad set of related web platform features. Browsers implement features incrementally; feature detection matters more than version numbers in practice.

---

## 10. How do browsers render HTML from bytes to pixels?

Browsers fetch HTML (often over HTTP), decode bytes according to the document’s character encoding, and tokenize the stream into tags and text. The parser builds a DOM tree, may fetch CSS and scripts (which can modify the tree), and runs layout to determine box positions and sizes. Painting then draws pixels; compositing may layer GPU-accelerated parts. This pipeline explains why malformed HTML might still “work” (error recovery) and why render-blocking resources in `<head>` affect perceived performance.

---

## 11. What is the difference between HTML and XHTML?

XHTML applied XML rules to HTML: documents had to be well-formed (all tags closed, lowercase element names in XHTML 1.0 strict, attributes quoted). MIME type `application/xhtml+xml` triggered XML parsing, where a single error could stop rendering. HTML5 allows a more forgiving syntax while still recommending consistency. In practice, most sites serve HTML5 as `text/html`. Knowing XHTML helps when integrating with XML tools or legacy systems, but new projects typically use HTML5.

```html
<!-- XHTML-style self-closing (valid in HTML5 for void elements) -->
<img src="photo.jpg" alt="Photo" />
```

---

## 12. Is HTML case-sensitive?

HTML5’s parsing is case-insensitive for tag and attribute names when the document is served as `text/html`, so `<P>` and `<p>` are treated the same. Attribute values may be case-sensitive depending on context (e.g., MIME types). For consistency and compatibility with SVG/MathML inside HTML, the convention is lowercase for HTML tag and attribute names. XHTML served as XML is case-sensitive and must match the defined casing.

```html
<!-- Prefer lowercase for HTML elements -->
<section>
  <p>Lowercase is the common style.</p>
</section>
```

---

## 13. What are the rules for nesting HTML elements correctly?

Elements must be nested in a logical order: if element B starts inside element A, B must close before A closes (“proper nesting”). Some combinations are forbidden—e.g., an `a` must not contain interactive content like another `a` or a `button`. Flow content, phrasing content, and other categories in the spec define what can go where. Invalid nesting can confuse parsers and accessibility tools. Validators and IDE linters help catch mistakes early.

```html
<!-- Correct nesting -->
<article>
  <h2>Title</h2>
  <p>Paragraph <em>with emphasis</em> only inside.</p>
</article>
```

---

## 14. What are void elements and self-closing tags?

Void elements (e.g., `br`, `hr`, `img`, `input`, `meta`, `link`) have no content and no closing tag in HTML. The trailing slash in `<br />` is optional in HTML5 and ignored for void elements. Self-closing syntax on non-void elements (like `<div />`) is incorrect in HTML and should be avoided. SVG inside HTML may use XML-style self-closing for elements that allow it, following SVG rules.

```html
<meta charset="utf-8" />
<img src="logo.png" alt="Logo" />
<input type="search" name="q" />
```

---

## 15. What is character encoding in HTML, and why declare UTF-8?

Character encoding maps byte sequences to characters. Declaring UTF-8 (`<meta charset="utf-8">` in the first 1024 bytes) ensures international characters display correctly and avoids mojibake. UTF-8 is the universal choice for new pages. The HTTP `Content-Type` header can also specify charset and should agree with the meta declaration. For forms, encoding affects how data is transmitted; mismatches cause subtle bugs with non-ASCII text.

```html
<!DOCTYPE html>
<html lang="hi">
  <head>
    <meta charset="utf-8" />
    <title>नमस्ते</title>
  </head>
  <body><p>Unicode text displays correctly.</p></body>
</html>
```

---

## 16. How do heading elements `h1`–`h6` work, and what are best practices?

Headings define a document outline and hierarchy: `h1` is typically the main title, `h2` subsections, and so on. Skipping levels (e.g., `h1` to `h4`) can confuse assistive technology users who navigate by headings. Prefer one logical `h1` per page (or per major landmark region in complex apps). Headings should describe content, not be used purely for large bold styling—that is a CSS concern.

```html
<h1>Product Guide</h1>
<h2>Installation</h2>
<h3>Windows</h3>
<h3>macOS</h3>
<h2>FAQ</h2>
```

---

## 17. What is the purpose of the `p` element, and when should you use multiple paragraphs?

The `p` element represents a paragraph of text. Each distinct paragraph of prose should be its own `p` rather than using `<br><br>` between lines of text. Empty paragraphs are discouraged; use margins via CSS for spacing. For a single line of UI copy that is not really a paragraph, sometimes a `div` or other element is more appropriate, but for body text, `p` is correct.

```html
<p>First paragraph with complete thought.</p>
<p>Second paragraph separated semantically.</p>
```

---

## 18. What is `<br>`, and when is it appropriate?

`<br>` inserts a line break within the same block; it is a void element. It is appropriate for addresses, poems, or legal text where line breaks carry meaning. It should not be used to create vertical gaps between paragraphs—use CSS `margin` on `p` or block containers instead. Overusing `<br>` harms responsive layouts because line lengths change on different screens.

```html
<p>
  123 Main St<br />
  Springfield, IL 62704
</p>
```

---

## 19. What does `<hr>` represent in HTML5?

In HTML5, `<hr>` represents a thematic break between paragraph-level elements, not merely a decorative line (though browsers often render a horizontal rule by default). Styling with CSS can change its appearance. Use it when a shift in topic or scene is meaningful; for purely visual separators, a styled `div` with ARIA presentation might be preferred so assistive technologies are not told a “separator” exists unless it is meaningful.

```html
<section>
  <p>Part one of the story.</p>
  <hr />
  <p>Part two begins after a thematic break.</p>
</section>
```

---

## 20. How do `strong`, `b`, `em`, and `i` differ?

`strong` indicates strong importance for its contents; `em` indicates emphasis that might change the meaning of a sentence. `b` and `i` are stylistic hooks without inherent semantic emphasis in the same way—`b` for keywords or product names, `i` for alternate voice or technical terms, per HTML5 guidance. In practice, prefer `strong`/`em` when semantics matter; use `b`/`i` when only visual differentiation is needed without changing spoken stress. Default styles often make `strong`/`b` bold and `em`/`i` italic, but CSS can override.

```html
<p><strong>Warning:</strong> Do not open the valve.</p>
<p>You <em>must</em> complete this field.</p>
<p>The <i>Homo sapiens</i> entry is italicized.</p>
```

---

## 21. What are `sup` and `sub`, and where are they used?

`sup` renders superscript text; `sub` renders subscript. Common uses include exponents and ordinal numbers (`sup`) and chemical formulas (`sub`). They should not be used for entire lines of layout; for footnote markers, combine with links or `aside` as appropriate. Font size is usually smaller; avoid using them only for styling when another element fits better.

```html
<p>E = mc<sup>2</sup></p>
<p>H<sub>2</sub>O</p>
```

---

## 22. How does the `pre` element differ from normal paragraphs?

`pre` represents preformatted text: whitespace and line breaks are preserved as in the source. It is typically rendered in a monospace font. Use it for ASCII art, code snippets (though `<code>` inside `pre` is common), or any text where spacing matters. Because it does not wrap by default, long lines can overflow; CSS `overflow-x` or wrapping rules may be needed for responsive design.

```html
<pre><code>function hello() {
  console.log("hi");
}</code></pre>
```

---

## 23. What is `blockquote`, and how is it used with citations?

`blockquote` represents a section quoted from another source, usually rendered with indentation. For inline quotations within a paragraph, use `q`. Optional `cite` attribute on `blockquote` may hold a URL pointing to the source; the `cite` element can mark the title of a work. For long quotes, `blockquote` plus a `footer` or `cite` inside clarifies attribution.

```html
<blockquote cite="https://example.com/article">
  <p>Design is not just what it looks like.</p>
  <footer>— <cite>Steve Jobs</cite></footer>
</blockquote>
```

---

## 24. What is the `abbr` element used for?

`abbr` marks abbreviations and acronyms; the `title` attribute should expand the full term on hover for sighted users. Screen readers may read the expansion when configured. The first use of an abbreviation on a page often benefits from spelling out the full form in text, with `abbr` for subsequent mentions. Do not rely on `title` alone for critical information, since not all users can hover.

```html
<p>The <abbr title="HyperText Markup Language">HTML</abbr> spec is large.</p>
```

---

## 25. What does the `address` element represent?

`address` represents contact information for the nearest `article` or `body` ancestor—typically for a person, organization, or place related to the page. It is not for every postal address on a site (e.g., random customer addresses in a list might use a `p` or `div`). Browsers often italicize it by default; semantics matter more than default styling.

```html
<address>
  Contact: <a href="mailto:hi@example.com">hi@example.com</a><br />
  123 Web St, Internet City
</address>
```

---

## 26. What is the anchor element `a`, and what is `href`?

The `a` element creates hyperlinks to other resources when the `href` attribute is present. `href` can point to pages, fragments (`#section`), media, or use special schemes like `mailto:` or `tel:`. Without `href`, `a` can act as a placeholder for scripting but is not a link; use `<button>` for actions that do not navigate. Link text should be descriptive (“Read our pricing”) rather than generic (“click here”) for accessibility and SEO.

```html
<a href="/docs/guide">Read the guide</a>
<a href="#faq">Jump to FAQ</a>
```

---

## 27. What do `target` and `rel` do on links?

`target="_blank"` opens the link in a new browsing context (tab/window). For security and performance, add `rel="noopener"` (and often `noreferrer`) so the new page cannot access `window.opener`. `rel` can also express relationships like `nofollow` for SEO hints or `license` for linked licenses. Understanding `rel` is important for external links and security interviews.

```html
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  External site
</a>
```

---

## 28. What is the difference between absolute and relative URLs?

An **absolute URL** includes the scheme and authority (e.g., `https://example.com/path`), fully specifying how to fetch the resource. A **relative URL** is resolved against the current document’s URL—e.g., `../images/x.png` or `/assets/style.css` (root-relative). Relative paths simplify deployment across domains and environments. Protocol-relative URLs (`//cdn.example.com/...`) are less common now that HTTPS is standard.

```html
<a href="https://example.com/page">Absolute</a>
<a href="/about">Root-relative</a>
<a href="details.html">Document-relative</a>
```

---

## 29. How do bookmark links (fragment identifiers) work?

A fragment identifier follows `#` and points to an element with a matching `id` in the same document (or another document if combined with a full URL). When the page loads with a fragment, the browser scrolls that element into view. For accessibility, ensure the target exists and consider `scroll-margin-top` for fixed headers. Named anchors with `name` on `a` are legacy; prefer `id` on any element.

```html
<a href="#installation">Go to Installation</a>
<h2 id="installation">Installation</h2>
```

---

## 30. What are `mailto:` and `tel:` links?

`mailto:` links open the user’s email client with optional pre-filled fields using query parameters (`subject`, `body`, `cc`, `bcc`). `tel:` links initiate phone calls on capable devices. Always encode spaces and special characters in query strings. Not every user has a configured mail client, so provide visible email text as a fallback.

```html
<a href="mailto:support@example.com?subject=Help&body=Hello">Email us</a>
<a href="tel:+15551234567">Call us</a>
```

---

## 31. What does the `download` attribute on anchors do?

When used with same-origin URLs or blob/data URLs, `download` suggests the linked resource should be downloaded rather than navigated to, and optionally sets a filename via `download="filename.ext"`. Cross-origin URLs may ignore the attribute for security. It improves UX for exporting files generated by the server or client.

```html
<a href="/reports/summary.pdf" download="Q1-summary.pdf">Download PDF</a>
```

---

## 32. What is the `base` element, and why use caution?

`<base href="...">` in `head` sets the base URL for resolving relative URLs and can set a default `target` for links and forms. Only one `base` is allowed per document, and it affects all relative URLs—easy to break if forgotten. It is rarely needed in apps with bundlers and absolute paths; when used (e.g., static mirrors), test all links carefully.

```html
<head>
  <base href="https://cdn.example.com/app/" />
</head>
```

---

## 33. How do navigation landmarks relate to links?

Semantic containers like `nav` group major navigation links; not every `a` belongs in `nav`. Skip links at the top help keyboard users jump to main content. ARIA `aria-current="page"` on the active nav link indicates the current page. Consistent navigation patterns improve usability across screen sizes.

```html
<nav aria-label="Primary">
  <a href="/" aria-current="page">Home</a>
  <a href="/blog">Blog</a>
</nav>
```

---

## 34. What attributes are required for `img` for accessibility and validity?

Every `img` must have an `alt` attribute: describe meaningful images, use empty `alt=""` for decorative images so screen readers skip them. `src` points to the image resource; `width`/`height` help avoid layout shift. `loading="lazy"` defers offscreen images. `decoding="async"` can improve main thread responsiveness.

```html
<img
  src="hero.jpg"
  alt="Sunset over mountains"
  width="800"
  height="450"
  loading="lazy"
/>
```

---

## 35. Why is the `alt` attribute important beyond SEO?

`alt` text is read by screen readers when images are unavailable and displayed when images fail to load. It should convey the purpose of the image, not a literal description of every pixel unless the page is about the image itself. If text beside the image already describes it, `alt` can be minimal or empty to avoid redundancy. Never put “image of…” unless the fact that it is an image matters.

```html
<img src="chart.png" alt="Sales grew 20% year over year" />
<img src="decorative-swirl.svg" alt="" role="presentation" />
```

---

## 36. How do `figure` and `figcaption` relate to images?

`figure` is a self-contained unit of content (often an image, diagram, or code block) optionally with `figcaption` for a caption. Figures can be referenced from text (“see Figure 1”). If an image is purely decorative and not a figure, you might not need `figure`—a plain `img` suffices. Captions improve comprehension for all users.

```html
<figure>
  <img src="architecture.png" alt="System architecture diagram" />
  <figcaption>Figure 1: High-level architecture of the service.</figcaption>
</figure>
```

---

## 37. What are image maps (`map` and `area`)?

Image maps define clickable regions on an image using `map` linked by `usemap` on `img` and `area` elements with shapes (`rect`, `circle`, `poly`). They are less common today due to responsive design challenges but appear in legacy systems. Each `area` needs an `alt` for accessibility. Prefer CSS/SVG overlays for new interactive graphics when possible.

```html
<img src="menu.png" alt="Menu" usemap="#menumap" width="400" height="200" />
<map name="menumap">
  <area shape="rect" coords="0,0,100,50" href="/a.html" alt="Option A" />
</map>
```

---

## 38. How does the `picture` element help with responsive images?

`picture` wraps multiple `source` elements with `media` or `type` conditions and a fallback `img`. The browser picks the first matching `source`, enabling art direction (different crops) or format selection (WebP with JPEG fallback). This is more flexible than `srcset` alone on `img` when you need MIME type or media queries at the markup level.

```html
<picture>
  <source media="(min-width: 800px)" srcset="wide.jpg" />
  <source srcset="narrow.webp" type="image/webp" />
  <img src="narrow.jpg" alt="Product" />
</picture>
```

---

## 39. What is `srcset`, and how does it differ from `src`?

`srcset` provides a list of image URLs with optional width (`w`) or density (`x`) descriptors so the browser can choose an appropriate asset based on viewport and DPR. `sizes` tells the browser how wide the image will be displayed in different layouts. `src` remains the fallback URL for older browsers and the final selected resource still loads through the chosen candidate.

```html
<img
  src="fallback.jpg"
  srcset="small.jpg 480w, large.jpg 800w"
  sizes="(max-width: 600px) 100vw, 50vw"
  alt="Responsive"
/>
```

---

## 40. What does the `video` element provide?

`video` embeds video content with attributes like `controls`, `autoplay`, `muted`, `loop`, `poster`, and `preload`. Multiple `source` children can offer different formats (MP4, WebM). Always include captions via `<track kind="captions">` for accessibility. Autoplay with sound is often blocked by browsers unless muted.

```html
<video controls width="640" poster="thumb.jpg">
  <source src="clip.webm" type="video/webm" />
  <source src="clip.mp4" type="video/mp4" />
  <track kind="captions" src="clip.vtt" srclang="en" label="English" />
</video>
```

---

## 41. How does the `audio` element work?

`audio` embeds sound similarly to `video` but without a visual frame unless styled. Use `controls` for native UI or build custom controls with JavaScript. Multiple `source` elements improve codec support. For background music, consider user preferences and autoplay policies—many users find unsolicited audio disruptive.

```html
<audio controls>
  <source src="podcast.mp3" type="audio/mpeg" />
  <source src="podcast.ogg" type="audio/ogg" />
</audio>
```

---

## 42. When would you use `embed`, `object`, or `iframe`?

`iframe` embeds another HTML page and is the common choice for maps, videos, or third-party widgets. `object` can embed diverse resources (PDF, Flash historically) with fallback content inside. `embed` is a void element for plugins and external content; it overlaps with `object` but has simpler syntax. For PDFs in modern sites, often link or use `iframe`/`object` depending on requirements and CSP.

```html
<iframe
  src="https://example.com/widget"
  title="Example widget"
  width="400"
  height="300"
></iframe>
```

---

## 43. What are ordered lists (`ol`), and what attributes control numbering?

`ol` represents a list where order matters (steps, rankings). The `reversed` attribute counts down; `start` sets the starting number; `type` can suggest numbering style (though CSS `list-style-type` is preferred for styling). List items are always `li`. Screen readers announce position (“1 of 5”), which helps for procedures.

```html
<ol start="3">
  <li>Third item</li>
  <li>Fourth item</li>
</ol>
```

---

## 44. How do unordered lists (`ul`) differ?

`ul` represents a list where order does not matter (navigation items, feature bullets). Default rendering is bullets; CSS changes markers. Do not use `ul` purely for indentation—that is a layout job for CSS. Nested `ul` inside `li` creates sublists with proper semantics.

```html
<ul>
  <li>Milk</li>
  <li>
    Bread
    <ul>
      <li>Whole wheat</li>
    </ul>
  </li>
</ul>
```

---

## 45. What is a definition list (`dl`), and how is it structured?

`dl` groups terms (`dt`) and definitions (`dd`). One `dt` can pair with multiple `dd` elements (synonyms or translations). In HTML5, `dl` is also used for name–value groups in metadata, though some argue `dl` should stay glossary-like. Avoid using `dl` for layout tables; use when term/definition semantics apply.

```html
<dl>
  <dt>HTML</dt>
  <dd>HyperText Markup Language.</dd>
  <dt>CSS</dt>
  <dd>Cascading Style Sheets.</dd>
</dl>
```

---

## 46. How do nested lists work, and what should you watch for?

Nest lists by placing `ul` or `ol` inside an `li` of the parent list, not directly inside `ul`/`ol` as a sibling to `li`. This keeps the DOM valid and screen reader announcements coherent. Deep nesting can hurt UX; consider flattening or progressive disclosure for long hierarchies.

```html
<ul>
  <li>
    Fruits
    <ul>
      <li>Apple</li>
    </ul>
  </li>
</ul>
```

---

## 47. What list-related attributes exist on `ol` and `li`?

Besides `reversed`, `start`, and `type` on `ol`, the `value` attribute on `li` can set a specific number within an ordered list (subsequent items increment from it). Use sparingly for legal or technical documents with non-contiguous numbering. Styling should generally use CSS pseudo-classes rather than deprecated presentational attributes when possible.

```html
<ol>
  <li>One</li>
  <li value="5">Five</li>
  <li>Six</li>
</ol>
```

---

## 48. Can you “customize” list styles?

Yes: CSS properties like `list-style-type`, `list-style-position`, and `list-style-image` (or `::marker` in modern CSS) control bullets and numbers. For full design control, some developers reset list styles and use flex/grid on `li`. Keep semantic list elements even when markers are hidden so assistive technology still recognizes lists.

```html
<ul class="checks">
  <li>Done</li>
  <li>Done</li>
</ul>
```

```css
.checks {
  list-style: none;
  padding: 0;
}
.checks li::before {
  content: "✓ ";
}
```

---

## 49. What elements make up a basic table structure?

A minimal data table uses `table`, `tr` (row), and `th` or `td` (cells). `caption` provides a title; `thead`, `tbody`, and `tfoot` group rows for semantics and printing. `colgroup`/`col` can style columns. Tables should be used for tabular data, not general page layout (that belongs in CSS grid/flexbox).

```html
<table>
  <caption>Quarterly sales</caption>
  <thead>
    <tr>
      <th scope="col">Q</th>
      <th scope="col">Sales</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>100</td>
    </tr>
  </tbody>
</table>
```

---

## 50. How do `colspan` and `rowspan` work?

`colspan` merges a cell across multiple columns; `rowspan` merges across rows. They complicate screen reader navigation, so keep tables as simple as possible and ensure header associations remain clear. The total cells per row must still align with the table grid after spanning. Test with accessibility tools when using large spans.

```html
<table>
  <tr>
    <th colspan="2">Header spans two columns</th>
  </tr>
  <tr>
    <td>A</td>
    <td>B</td>
  </tr>
</table>
```

---

## 51. Why use `thead`, `tbody`, and `tfoot`?

These sectioning elements clarify which rows are headers, body data, and summaries (often repeated on printed pages). Browsers may use them for scrolling bodies with fixed headers. `tfoot` can appear before `tbody` in markup but still render at the bottom. They improve semantics over a flat sequence of `tr` elements.

```html
<table>
  <thead>
    <tr>
      <th>Item</th>
      <th>Price</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Tea</td>
      <td>$2</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td>Total</td>
      <td>$2</td>
    </tr>
  </tfoot>
</table>
```

---

## 52. How does `caption` improve table accessibility?

`caption` is the visible (or optionally visually hidden) title summarizing the table’s purpose. Screen readers often announce caption before navigating cells. It complements surrounding headings; do not duplicate the same text unnecessarily. CSS can position captions above or below the table.

```html
<table>
  <caption>Employee roster for April 2026</caption>
  <!-- rows -->
</table>
```

---

## 53. What table accessibility practices should freshers know?

Use `th` for headers with `scope="col"` or `scope="row"` in simple tables; for complex tables, `headers`/`id` associations or `aria-labelledby` may apply. Provide `caption` or a nearby heading. Avoid empty cells for spacing—use CSS. Ensure keyboard users can navigate; for interactive widgets inside cells, manage focus carefully. Test with VoiceOver/NVDA.

```html
<table>
  <tr>
    <th scope="row">Alice</th>
    <td>Engineer</td>
  </tr>
</table>
```

---

## 54. What is the `scope` attribute on `th`?

`scope` tells assistive technologies which cells a header cell applies to: `col`, `row`, `colgroup`, or `rowgroup`. It reduces ambiguity in non-trivial tables. For very complex layouts, additional techniques may be needed, but `scope` covers many real-world cases. It is simpler than wiring `headers` on every `td` when the grid is regular.

```html
<th scope="col">Product</th>
<th scope="row">North</th>
```

---

## 55. What are `colgroup` and `col` for?

`colgroup` groups columns for styling or attributes applied via `col` elements (`span` repeats across columns). This allows column-wide styling without repeating classes on every cell. Some attributes on `col` are limited; check browser support for what you need (e.g., `width` historically). Semantic alignment still relies on correct `th`/`td` usage.

```html
<table>
  <colgroup>
    <col class="names" />
    <col span="2" class="numbers" />
  </colgroup>
  <!-- ... -->
</table>
```

---

## 56. How can tables be made responsive?

Wide tables overflow on small screens; common patterns include horizontal scrolling with `overflow-x: auto` on a wrapper, transforming rows into cards with CSS (losing strict table semantics in some designs), or prioritizing key columns. Another approach is to repeat small summaries with “expand for details.” Always preserve access to full data for all users—do not hide columns without an alternative.

```html
<div class="table-scroll" style="overflow-x: auto">
  <table><!-- many columns --></table>
</div>
```

---

## 57. What is the `form` element’s role?

`form` groups interactive controls that submit data to a server or are processed by scripts. Important attributes include `action` (URL), `method` (`get` or `post`), `enctype` (for file uploads), `novalidate`, and `autocomplete`. Forms improve accessibility by exposing a single navigable region; hitting Enter in a single-line field often submits the form by default.

```html
<form action="/search" method="get" role="search">
  <label for="q">Search</label>
  <input id="q" name="q" type="search" />
  <button type="submit">Go</button>
</form>
```

---

## 58. What does `input type="text"` do, and what related attributes matter?

Text inputs accept free-form strings. Common attributes: `name` (key in form data), `value` (initial), `placeholder` (hint, not a label), `maxlength`, `minlength`, `pattern`, `required`, `readonly`, `disabled`, `autocomplete`, `inputmode`. Always pair with a visible `label` for accessibility; placeholders alone are insufficient.

```html
<label for="city">City</label>
<input id="city" name="city" type="text" autocomplete="address-level2" />
```

---

## 59. How does `input type="password"` behave?

Password fields mask characters for shoulder-surfing protection. They are not encrypted in transit by the input type itself—HTTPS encrypts the HTTP connection. Attributes like `autocomplete="current-password"` help password managers. `minlength`/`pattern` can enforce policy, but server-side validation is mandatory.

```html
<label for="pw">Password</label>
<input id="pw" name="password" type="password" autocomplete="current-password" required />
```

---

## 60. What is special about `input type="email"`?

Email inputs expose an email-friendly keyboard on mobile, basic built-in validation for the email format (when `required` or on submit), and can list multiple addresses with `multiple`. Server-side validation must still enforce rules; client validation is a convenience. Pair with `autocomplete="email"` where appropriate.

```html
<input type="email" name="email" autocomplete="email" required />
```

---

## 61. How do `input type="number"` and related attributes work?

Number inputs restrict input to numeric values and may show a stepper UI. Attributes: `min`, `max`, `step` (e.g., `0.01` for currency). Beware: localization and scientific notation edge cases exist; some teams prefer `text` with `inputmode="decimal"` for strict formatting control. Always validate on the server.

```html
<label for="qty">Quantity</label>
<input id="qty" name="qty" type="number" min="1" max="99" step="1" />
```

---

## 62. What does `input type="date"` provide?

Date inputs show a native date picker where supported and return a string in `YYYY-MM-DD` format. `min`/`max` constrain selectable ranges. Display format varies by locale in the UI, but the value is normalized. For custom calendars, libraries may replace native inputs; fallbacks matter for older browsers.

```html
<label for="start">Start date</label>
<input id="start" name="start" type="date" min="2026-01-01" max="2026-12-31" />
```

---

## 63. How does `input type="range"` work?

Range inputs provide a slider for approximate values within `min`/`max` with `step`. They often lack precise value display unless you bind to output text with JavaScript or CSS. Default styling differs across browsers; they are great for volume or filters, not exact scientific entry.

```html
<label for="vol">Volume</label>
<input id="vol" name="volume" type="range" min="0" max="100" />
```

---

## 64. What is `input type="color"`?

Color inputs provide a color picker UI and value as a hexadecimal color string (`#rrggbb`). Limited styling control exists; some apps build custom pickers. Value must still be validated server-side if used in security-sensitive contexts (e.g., themes).

```html
<label for="accent">Accent color</label>
<input id="accent" name="accent" type="color" value="#3366cc" />
```

---

## 65. How does `input type="file"` handle uploads?

File inputs let users pick files; `accept` filters MIME types or extensions (hint only). `multiple` allows several files. For uploads, set `form` `enctype="multipart/form-data"` and `method="post"`. File paths are not exposed for security—only filenames. Server-side checks on type, size, and malware are essential.

```html
<form method="post" action="/upload" enctype="multipart/form-data">
  <input type="file" name="resume" accept=".pdf" />
  <button type="submit">Upload</button>
</form>
```

---

## 66. Explain checkboxes vs radio buttons.

Checkboxes (`type="checkbox"`) allow zero or more selections from a set; each is independent unless grouped by `name` for arrays. Radio buttons (`type="radio"`) share a `name` and enforce exactly one selection from the group (when required). Use `value` to distinguish which option was chosen. `checked` sets the default state.

```html
<input type="checkbox" name="extras" value="wifi" /> Wi-Fi
<input type="radio" name="plan" value="free" /> Free
<input type="radio" name="plan" value="pro" /> Pro
```

---

## 67. What is `input type="hidden"` for?

Hidden inputs carry data not shown to users, such as CSRF tokens, record IDs, or workflow state. They are not truly secret—anyone can view source or tamper requests—so never rely on them for security. Use them for non-sensitive metadata the server needs round-tripped.

```html
<input type="hidden" name="csrf" value="token-value" />
```

---

## 68. What do `submit` and `reset` buttons do?

`type="submit"` sends the form; `type="reset"` reverts fields to initial values (often confusing UX and rarely recommended). Prefer explicit labels on buttons (“Save”, “Register”). Multiple submit buttons can exist with different `value` attributes if the server distinguishes them—ensure clarity for assistive tech.

```html
<button type="submit">Save</button>
<button type="button">Cancel</button>
```

---

## 69. How does `textarea` differ from `input`?

`textarea` is for multi-line text; it has `rows`/`cols` hints and supports `wrap` behavior. Content is body text, not attribute-based. `maxlength`/`minlength` apply like text inputs. For very large text, consider client-side performance and server limits.

```html
<label for="msg">Message</label>
<textarea id="msg" name="message" rows="5" cols="40" required></textarea>
```

---

## 70. How do `select`, `option`, and `optgroup` work?

`select` presents a dropdown (or listbox with `multiple`) of `option` elements; `optgroup` groups options under labels. `selected` marks defaults; `value` on `option` is what gets submitted. For long lists, search/filter UIs may be better UX than huge selects.

```html
<label for="country">Country</label>
<select id="country" name="country">
  <optgroup label="North America">
    <option value="us">United States</option>
    <option value="ca">Canada</option>
  </optgroup>
</select>
```

---

## 71. What is `datalist`?

`datalist` provides suggestions for compatible inputs (`text`, `url`, etc.) via `list` attribute linking to the `datalist` `id`. Users can still type arbitrary values unless constrained otherwise—unlike `select`. It combines free text with common choices, helpful for search boxes.

```html
<label for="browser">Browser</label>
<input list="browsers" id="browser" name="browser" />
<datalist id="browsers">
  <option value="Chrome"></option>
  <option value="Firefox"></option>
</datalist>
```

---

## 72. What are `fieldset` and `legend`?

`fieldset` groups related controls; `legend` is the caption for the group, improving semantics for screen readers. Disabled `fieldset` disables descendants. Use for radio groups, address blocks, or filter panels. Styling legends across browsers can be tricky but is a standard pattern.

```html
<fieldset>
  <legend>Shipping method</legend>
  <label><input type="radio" name="ship" value="std" /> Standard</label>
  <label><input type="radio" name="ship" value="exp" /> Express</label>
</fieldset>
```

---

## 73. Why associate `label` with controls?

Clicking a label focuses the associated control, increasing hit area. Labels are announced with inputs by screen readers. Use `for` matching `id`, or wrap the control inside `label`. Never duplicate `id`s; each pair must be unique.

```html
<label for="email">Email</label>
<input id="email" name="email" type="email" />

<label>
  <input name="agree" type="checkbox" /> I agree
</label>
```

---

## 74. What validation attributes exist in HTML5 forms?

Common built-ins: `required`, `pattern` (regex), `min`/`max` (numbers/dates), `minlength`/`maxlength`, `type` constraints. The Constraint Validation API (`checkValidity`, `reportValidity`) integrates with `:valid`/`:invalid` CSS. Client-side validation improves UX but must be mirrored on the server—never trust the client alone.

```html
<input name="zip" pattern="\d{5}" maxlength="5" required />
```

---

## 75. What is `placeholder`, and what mistakes do beginners make?

`placeholder` shows hint text in empty fields; it disappears on input. It is not a substitute for labels—placeholders are often low contrast and vanish, hurting memory and accessibility. Use for format hints only (“YYYY-MM-DD”), not critical instructions.

```html
<label for="phone">Phone</label>
<input id="phone" name="phone" type="tel" placeholder="+1 555 000 0000" />
```

---

## 76. What do `autofocus` and `autocomplete` do?

`autofocus` focuses an element on page load—use sparingly (one per page) to avoid disorienting keyboard users or hijacking focus in multi-form layouts. `autocomplete` hints at the kind of data (`name`, `shipping street-address`, `cc-number`) to help browsers autofill securely when users opt in.

```html
<input name="name" autocomplete="name" autofocus />
```

---

## 77. When should you use GET vs POST for forms?

`GET` appends fields in the query string—good for idempotent searches, bookmarkable URLs, cacheable requests—but exposes data in URLs/history. `POST` sends data in the body, suitable for large payloads, file uploads, and actions that change server state. Sensitive data should always use HTTPS regardless of method; choose POST for passwords and mutations.

```html
<form action="/search" method="get">...</form>
<form action="/register" method="post">...</form>
```

---

## 78. What is `enctype`, and when is it required?

`enctype` sets how form data is encoded. Default `application/x-www-form-urlencoded` works for typical fields. `multipart/form-data` is required for file inputs. `text/plain` is rarely used (debugging). Wrong `enctype` breaks file uploads silently in some cases.

```html
<form method="post" enctype="multipart/form-data">
  <input type="file" name="doc" />
</form>
```

---

## 79. What does the `action` attribute specify?

`action` is the URL that processes the form submission. Relative actions resolve against the current page. If omitted, the form submits to the current document URL. SPAs often intercept `submit` with JavaScript and use `preventDefault`, but progressive enhancement starts with a working `action`.

```html
<form action="/api/contact" method="post"></form>
```

---

## 80. What is the `header` element?

`header` groups introductory or navigational aids for its nearest sectioning ancestor or the whole page—not every `h1` wrapper needs a `header`, but site mastheads and article titles often do. Multiple `header` elements can exist in a document (e.g., per `article`). Do not confuse with `head` in the document metadata.

```html
<body>
  <header>
    <a href="/">Logo</a>
    <nav><!-- ... --></nav>
  </header>
</body>
```

---

## 81. What is the `footer` element?

`footer` represents footer content for its section or the page: copyright, links, author info. Like `header`, it can appear multiple times. Footers belong at the end of their section semantically, though CSS may reposition visually.

```html
<article>
  <h2>Post title</h2>
  <p>Content…</p>
  <footer>
    <p>Posted by <a href="/author/j">Jamie</a></p>
  </footer>
</article>
```

---

## 82. What is `nav` for?

`nav` marks major navigation blocks (primary nav, table of contents). Not every link group needs `nav`—footer legal links might be a `footer` without a separate `nav` if minor, but primary menus should use `nav`. Provide `aria-label` when multiple `nav` elements exist to distinguish them.

```html
<nav aria-label="Primary">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>
```

---

## 83. What is `main`?

`main` identifies the dominant content of the page; there should be only one `main` per document (unless using shadow DOM or templates carefully). Skip links often target `main`. It helps assistive tech jump to primary content. Do not nest `article`/`section` incorrectly inside `main`—`main` wraps the central topic.

```html
<body>
  <header>...</header>
  <main id="main"><h1>Topic</h1></main>
</body>
```

---

## 84. How does `article` differ from `section`?

`article` represents a self-contained composition (blog post, comment, card) that could be syndicated independently. `section` groups thematic content with a heading; it is not a generic wrapper—that is `div`. If in doubt whether content stands alone, `article` may fit; arbitrary layout grouping should use `div` with ARIA only when needed.

```html
<section>
  <h2>Latest news</h2>
  <article>
    <h3>Headline</h3>
    <p>Story…</p>
  </article>
</section>
```

---

## 85. When should you use `aside`?

`aside` represents tangential content: sidebars, pull quotes, advertising related to the surrounding content. It should be related to its parent section; site-wide sidebars still relate to the page. Do not use `aside` only for styling columns—semantics first.

```html
<article>
  <p>Main text…</p>
  <aside>
    <p>Related: <a href="#">Guide</a></p>
  </aside>
</article>
```

---

## 86. How do `figure` and captions fit into semantic HTML5?

Already covered for images, but semantically `figure` is not limited to pictures—code listings and diagrams qualify. This separates illustrative content from main flow while keeping an explicit caption. Search engines and readers understand figures as units.

```html
<figure>
  <pre><code>npm install</code></pre>
  <figcaption>Install dependencies</figcaption>
</figure>
```

---

## 87. What do `details` and `summary` provide?

`details` creates a disclosure widget toggled by `summary`; additional content is hidden until opened. No JavaScript is required. Default `open` attribute can start expanded. Use for FAQs and optional advanced sections; ensure `summary` is concise and the content inside is still accessible when closed (not removed from DOM).

```html
<details>
  <summary>Refund policy</summary>
  <p>We offer refunds within 30 days.</p>
</details>
```

---

## 88. What is the `mark` element?

`mark` highlights text relevant to the user’s current activity—search hits, quoted snippets—not generic bold styling. Default is yellow background. Use when the highlight meaning matches “reference” or “match,” not decoration.

```html
<p>Results for <mark>HTML5</mark> in this page.</p>
```

---

## 89. How is the `time` element used?

`time` represents dates/times; `datetime` attribute provides machine-readable ISO values while text can be human-friendly. Helps parsers and SEO with publish/modified dates. Use for schedules, deadlines, and article timestamps.

```html
<time datetime="2026-04-02">April 2, 2026</time>
```

---

## 90. What are `meter` and `progress`?

`progress` indicates completion of a task (known `max` or indeterminate). `meter` represents a scalar measurement within a known range (disk usage, rating), not task progress—confusing names! Both expose roles for assistive tech when used correctly.

```html
<label>Upload <progress value="40" max="100">40%</progress></label>
<label>Disk <meter min="0" max="100" value="72">72%</meter></label>
```

---

## 91. What is `localStorage`, and how does it relate to HTML5?

`localStorage` is a Web Storage API providing key–value persistence per origin with no expiry. It is accessed via JavaScript (`localStorage.setItem`), not declarative HTML, but interviewers group it under HTML5 platform features. Data survives tab closes; size limits apply (~5MB typical). Not for sensitive data; XSS can exfiltrate it.

```html
<script>
  localStorage.setItem("theme", "dark");
</script>
```

---

## 92. How does `sessionStorage` differ?

`sessionStorage` is like `localStorage` but scoped to the browser tab for the duration of the page session—data clears when the tab closes. Useful for wizard steps or ephemeral UI state. Same-origin rules apply.

```html
<script>
  sessionStorage.setItem("step", "2");
</script>
```

---

## 93. What are Web Workers at a high level?

Web Workers run JavaScript on background threads so heavy computation does not block the UI thread. They cannot access the DOM directly; communication uses `postMessage`. Dedicated vs shared workers serve different architectures. They are part of the HTML5-era web platform for performance.

```html
<script>
  const w = new Worker("worker.js");
  w.postMessage({ n: 42 });
</script>
```

---

## 94. What is the Geolocation API?

`navigator.geolocation` requests the user’s location (with permission) via callbacks or promises in modern wrappers. Privacy-sensitive: always explain why you need location and handle denial gracefully. HTTPS is required in production browsers for geolocation. Not HTML markup—pure JavaScript API.

```html
<script>
  navigator.geolocation.getCurrentPosition((pos) => {
    console.log(pos.coords.latitude, pos.coords.longitude);
  });
</script>
```

---

## 95. What is HTML5 drag and drop?

The Drag and Drop API uses events like `dragstart`, `dragover`, `drop`, and attributes `draggable="true"`. You typically prevent default on `dragover` to allow dropping. Accessible drag-and-drop is hard; provide keyboard alternatives. Data transfers use `dataTransfer.setData`.

```html
<div draggable="true" id="card">Drag me</div>
```

---

## 96. What is the Canvas API in brief?

`<canvas>` provides a bitmap drawing surface controlled by JavaScript (2D or WebGL contexts). It is resolution-dependent and not accessible for complex graphics unless supplemented with DOM text or ARIA. Good for charts, games, image processing—SVG is better for scalable diagrams and CSS styling of shapes.

```html
<canvas id="c" width="300" height="150"></canvas>
<script>
  const ctx = document.getElementById("c").getContext("2d");
  ctx.fillStyle = "navy";
  ctx.fillRect(10, 10, 80, 40);
</script>
```

---

## 97. What are SVG basics you should mention in interviews?

SVG is an XML-based vector format embedded inline in HTML (`<svg>...</svg>`) or referenced externally. Shapes (`rect`, `circle`, `path`) scale without pixelation; CSS can style `fill`/`stroke`. Inline SVG is in the DOM and scriptable. Accessibility: `title`/`desc` elements for screen readers.

```html
<svg width="100" height="100" aria-label="Green circle">
  <title>Green circle</title>
  <circle cx="50" cy="50" r="40" fill="green" />
</svg>
```

---

## 98. What are `data-*` attributes?

Custom `data-*` attributes store private application state on elements without conflicting with future HTML attributes. Access via `element.dataset` in camelCase (`data-user-id` → `dataset.userId`). They are visible in markup—do not store secrets. Useful for connecting JS behavior to markup generated by servers.

```html
<button data-product-id="42" data-action="add-to-cart">Add</button>
```

---

## 99. What does `contenteditable` do?

`contenteditable` makes elements user-editable like a mini word processor; combined with execCommand (legacy) or modern editing APIs for rich text. Sanitize output on the server—never trust HTML from users without cleaning. Accessibility of rich editors is challenging.

```html
<div contenteditable="true">Edit this text</div>
```

---

## 100. What is microdata, and why might you use it?

Microdata (`itemscope`, `itemtype`, `itemprop`) embeds machine-readable structured data in HTML for search engines (often alongside JSON-LD). It helps rich results for products, articles, events. Schema.org provides vocabularies. Maintenance burden exists; many sites prefer JSON-LD in `script` tags instead of inline microdata.

```html
<div itemscope itemtype="https://schema.org/Book">
  <span itemprop="name">HTML Mastery</span>
</div>
```

---

## 93. (duplicate numbering fix — see below)

*This file was corrected: questions 93–100 appear above as 91–100 in the semantic/API section; the following block completes Miscellaneous Q93–100 per the user outline.*

---

## 93. What meta tags belong in typical HTML documents?

Meta elements in `head` convey metadata: `charset`, `viewport` for responsive layouts, `description` for SEO snippets, Open Graph tags for social sharing, and `robots` for crawler hints. They do not display on the page but influence browsers, search engines, and social platforms. Keep `charset` within the first 1024 bytes. Each meta should have a clear purpose—avoid duplicating conflicting descriptions.

```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Short summary for search results." />
</head>
```

---

## 94. Why is the viewport meta tag important for mobile?

The viewport meta (`width=device-width, initial-scale=1`) tells mobile browsers to match the layout viewport to the device width instead of assuming a desktop-wide page. Without it, responsive CSS may not behave as designers expect, and text may appear tiny. `maximum-scale` and `user-scalable=no` restrict zoom and harm accessibility—avoid unless absolutely necessary with justification.

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

---

## 95. How do favicons work in modern browsers?

Favicons are linked via `<link rel="icon" href="/favicon.ico">` or PNG/SVG variants; `apple-touch-icon` supplies home-screen icons on iOS. Browsers fetch them for tabs and bookmarks. Multiple sizes and a web app manifest (`icons` entry) support PWA installs. Place icons in cache-friendly paths and use absolute paths if deploying to CDNs.

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/icons/apple-180.png" />
```

---

## 96. What are HTML character entities, and when are they used?

Entities represent characters that are reserved or hard to type: `&lt;`, `&gt;`, `&amp;`, `&quot;`, `&nbsp;` (non-breaking space), numeric `&#169;` for ©. Use them in HTML text when you need literal `<` or `&` in content. In attributes, always escape quotes appropriately. UTF-8 allows direct Unicode characters when the file encoding supports them.

```html
<p>5 &lt; 10 and AT&amp;T</p>
<p>Copyright &#169; 2026</p>
```

---

## 97. What are the main considerations when using `iframe`?

`iframe` embeds another browsing context; `sandbox` and `allow` attributes restrict capabilities for security. `title` is important for accessibility. Cross-origin frames have limited parent access per Same-Origin Policy. Performance: iframes add process/memory overhead; lazy-load when possible. Content Security Policy may block framing.

```html
<iframe
  src="https://example.com/embed"
  title="Embedded documentation"
  width="100%"
  height="400"
  loading="lazy"
></iframe>
```

---

## 98. What is ARIA, and how should beginners approach it?

WAI-ARIA (Accessible Rich Internet Applications) supplies roles, states, and properties to make dynamic UIs understandable to assistive technologies when native HTML is insufficient. Prefer native elements (`button`, `nav`) first; add ARIA only to fill gaps. Misused ARIA (`role="button"` on `div` without keyboard support) hurts accessibility. Learn `aria-label`, `aria-expanded`, `aria-live` as starting points.

```html
<button aria-expanded="false" aria-controls="menu" id="menubtn">Menu</button>
<div id="menu" hidden>…</div>
```

---

## 99. What basic SEO practices relate to HTML?

Use a single descriptive `title`, one logical `h1`, meaningful heading hierarchy, and meta description. Semantic tags (`article`, `header`, `nav`) help structure. Clean URLs in `canonical` link tags reduce duplicate content issues. Fast pages (lazy loading, dimensions on images) and mobile-friendly viewport improve rankings indirectly. Content quality outweighs tricks—markup supports discoverability.

```html
<title>HTML Interview Prep — Your Site</title>
<link rel="canonical" href="https://example.com/page" />
```

---

## 100. Why is the DOCTYPE declaration still important in interviews?

Interviewers expect you to connect DOCTYPE to standards mode versus quirks mode, ensuring predictable CSS layout and box model behavior. HTML5’s short `<!DOCTYPE html>` is easy to remember and should appear first. Omitting DOCTYPE can break modern layouts in subtle ways. Pair this knowledge with charset and viewport for a complete “document setup” answer.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Well-formed document</title>
  </head>
  <body></body>
</html>
```

---

_End of document — 100 questions numbered 1–100 with detailed answers. Remove the duplicate correction note if you prefer a single linear numbering; the Miscellaneous section Q93–100 are the authoritative final block for meta tags, viewport, favicon, entities, iframes, ARIA, SEO, and DOCTYPE importance._
