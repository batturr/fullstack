# 200 HTML Real-Time Assignments

---

## 🟢 BEGINNER LEVEL (Assignments 1–70)

### Basic Structure

**Assignment 1:** Create a minimal HTML5 document with `<!DOCTYPE html>` and the root `<html>` element with `lang="en"`.

**Assignment 2:** Build a complete page skeleton including `<head>` and `<body>` with a visible heading in the body.

**Assignment 3:** Add a meaningful `<title>` in the head that appears in the browser tab.

**Assignment 4:** Include `<meta charset="UTF-8">` and a `<meta name="viewport">` suitable for responsive layouts.

**Assignment 5:** Use HTML comments to document each major section of your page structure (header, main, footer).

**Assignment 6:** Nest a `<div>` inside a `<section>` inside `<main>` with distinct text in each level to show hierarchy.

**Assignment 7:** Create a reusable HTML5 boilerplate file with essential meta tags, title, and an empty `<body>` ready for content.

**Assignment 8:** In one document, include one `<script src>` in the `<head>` with `defer` and one inline script at the end of `<body>`; add HTML comments explaining typical execution order.

### Text & Headings

**Assignment 9:** Build a page with `<h1>` through `<h6>` in logical order describing a blog article outline.

**Assignment 10:** Use multiple `<p>` elements with proper spacing for an “About” page biography.

**Assignment 11:** Use `<br>` only where a line break is semantic (e.g., poem lines) within a paragraph.

**Assignment 12:** Insert `<hr>` between unrelated thematic sections on a single page.

**Assignment 13:** Display formatted code or ASCII art using `<pre>` with preserved whitespace.

**Assignment 14:** Add a `<blockquote>` with a citation using `<cite>` for the source name or title.

**Assignment 15:** Emphasize words using `<strong>` for importance and `<em>` for stress within the same paragraph.

**Assignment 16:** Use `<small>`, `<sub>`, `<sup>`, and `<del>`/`<ins>` appropriately in a short product description.

### Links

**Assignment 17:** Create text links with `<a href>` to external HTTPS pages that open in a new tab using `target` and `rel`.

**Assignment 18:** Add an internal navigation menu linking to three fragment IDs on the same page (`#section-id`).

**Assignment 19:** Create a `mailto:` link with subject and body query parameters.

**Assignment 20:** Create a `tel:` link for a clickable phone number labeled for mobile users.

**Assignment 21:** Build “back to top” and “skip to content” style bookmark links using fragment identifiers.

**Assignment 22:** Use a download-style link pattern with `download` attribute on a same-origin or example path (document the intent in a comment if the file is placeholder).

### Images

**Assignment 23:** Display an image with `<img src>`, meaningful `alt` text, and explicit `width` and `height` attributes.

**Assignment 24:** Wrap an illustrative image in `<figure>` with a `<figcaption>` describing the image.

**Assignment 25:** Turn an image into a link by nesting `<img>` inside an `<a>` element.

**Assignment 26:** Add `loading="lazy"` to below-the-fold images to defer loading.

**Assignment 27:** Use `<picture>` with `<source media>` and a fallback `<img>` for a responsive image example.

**Assignment 28:** Provide a simple `srcset`/`sizes` example on `<img>` for resolution switching (describe breakpoints in comments).

### Lists

**Assignment 29:** Create an unordered list of navigation items for a site menu.

**Assignment 30:** Create an ordered list of steps for a recipe with nested unordered sub-lists for ingredients per step.

**Assignment 31:** Build a description list (`<dl>`, `<dt>`, `<dd>`) defining at least three web terms.

**Assignment 32:** Nest an ordered list inside an unordered list (or vice versa) for an outline structure.

**Assignment 33:** Use `<ol start="5">` to begin numbering at a specific value.

**Assignment 34:** Use `<ol reversed>` for a countdown-style list.

**Assignment 35:** Create a list where each item contains a paragraph and a link.

**Assignment 36:** Mark up a FAQ-style page using lists (ordered or unordered) with clear list item semantics.

### Tables

**Assignment 37:** Build a basic data table with headers and multiple rows/columns.

**Assignment 38:** Structure a table with `<thead>`, `<tbody>`, and `<tfoot>` for summary rows.

**Assignment 39:** Use `colspan` to merge cells in a header row for grouped columns.

**Assignment 40:** Use `rowspan` to merge cells vertically for a sidebar label column.

**Assignment 41:** Add `<caption>` describing the purpose of the table for accessibility.

**Assignment 42:** Apply basic table styling using `<style>` (borders, spacing) without external CSS files.

**Assignment 43:** Create a weekly class or work schedule table with times and activities.

**Assignment 44:** Build a pricing comparison table for three product tiers with features and prices.

**Assignment 45:** Add `<th scope="col">` and `<th scope="row">` appropriately for a complex table.

**Assignment 46:** Create an accessible table with `<caption>` and headers associated to data cells for screen readers.

### Forms

**Assignment 47:** Build a form with labeled text `<input type="text">` and a submit button.

**Assignment 48:** Add `<input type="email">` with `required` and `autocomplete="email"`.

**Assignment 49:** Add `<input type="password">` with `minlength` and show/hide note in nearby text.

**Assignment 50:** Use `<input type="number">` with `min`, `max`, and `step`.

**Assignment 51:** Use `<input type="date">` for selecting a birth date or appointment date.

**Assignment 52:** Use `<input type="tel">` with `pattern` for a simple phone format.

**Assignment 53:** Use `<input type="url">` for a website field with placeholder text.

**Assignment 54:** Use `<input type="color">` to pick a theme color.

**Assignment 55:** Use `<input type="range">` with `min`, `max`, and an associated `<output>` or label showing the value.

**Assignment 56:** Use `<input type="file">` with `accept` to restrict to images.

**Assignment 57:** Create a checkbox group for “interests” with shared `name` and distinct `value` attributes.

**Assignment 58:** Create a radio group for selecting one shipping method.

**Assignment 59:** Add `<textarea>` with `rows`, `cols`, and `maxlength`.

**Assignment 60:** Build a `<select>` with `<option>` groups (`<optgroup>`) for categorized choices.

**Assignment 61:** Use `<button type="submit">` and `<button type="reset">` appropriately.

**Assignment 62:** Group related fields with `<fieldset>` and `<legend>` and associate labels using `<label for>`.

### Semantic Elements

**Assignment 63:** Mark up a page `<header>` containing a logo text and primary navigation.

**Assignment 64:** Add a `<footer>` with copyright, contact link, and secondary links.

**Assignment 65:** Wrap primary navigation links in `<nav>` with an `aria-label`.

**Assignment 66:** Use `<main>` exactly once with unique content for the page.

**Assignment 67:** Split content into thematic `<section>` elements each with their own heading.

**Assignment 68:** Mark up a blog post using `<article>` with author line and publication date text.

**Assignment 69:** Add an `<aside>` with related links or a sidebar note beside the main article layout.

**Assignment 70:** Combine `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, and `<footer>` in one coherent semantic page layout.

---

## 🟡 INTERMEDIATE LEVEL (Assignments 71–140)

### Advanced Forms

**Assignment 71:** Add `pattern` validation to a text field (e.g., username) and document the regex in a nearby `<small>`.

**Assignment 72:** Use `min`/`max` on a number input together with a clear validation message area (use `title` or associated text).

**Assignment 73:** Combine `minlength`/`maxlength` on password and confirm password fields in one form.

**Assignment 74:** Wire an `<input list>` to a `<datalist>` for autocomplete suggestions.

**Assignment 75:** Use `<output>` with the `for` attribute to display a computed sum of two number inputs (include minimal inline script if needed, or use `oninput` on the form).

**Assignment 76:** Customize validation messages using the Constraint Validation API in a short inline script (`setCustomValidity`).

**Assignment 77:** Structure a multi-step form UI using `<fieldset>` sections and “Next/Previous” buttons (no backend; use buttons `type="button"`).

**Assignment 78:** Add `aria-invalid` and `aria-describedby` linking inputs to error message elements.

**Assignment 79:** Ensure every form control has an associated label; use `aria-label` only where a visible label is impossible.

**Assignment 80:** Group a search form with `role="search"` on a container element.

**Assignment 81:** Add `aria-required="true"` to required fields in addition to the `required` attribute for redundancy with assistive tech.

**Assignment 82:** Create an accessible custom file input pattern: native input visually styled with a `<label>` and helper text tied via `aria-describedby`.

### Media

**Assignment 83:** Embed `<audio controls>` with a single MP3 source (use a placeholder path and comment for real URL).

**Assignment 84:** Provide `<audio>` with multiple `<source>` elements (`type` attributes included) for format fallback.

**Assignment 85:** Add `loop` to an audio element and document autoplay policy considerations in a comment.

**Assignment 86:** Embed `<video controls poster>` with width/height and fallback text inside the video tag.

**Assignment 87:** Add `<track kind="subtitles" srclang label>` to a video element (placeholder `.vtt` path).

**Assignment 88:** Use `<picture>` with WebP and JPEG sources and `sizes` for art direction.

**Assignment 89:** Demonstrate `srcset` with `w` descriptors and a `sizes` attribute on `<img>`.

**Assignment 90:** Embed a PDF or app with `<embed type>` and title text (placeholder URL).

**Assignment 91:** Embed a YouTube video using `<iframe>` with `title`, `allow`, and responsive width attributes.

**Assignment 92:** Embed Google Maps (or similar) via `<iframe>` with descriptive `title` and `loading="lazy"`.

### Semantic & Accessibility

**Assignment 93:** Add `role="banner"` to the site header and `role="contentinfo"` to the footer where appropriate.

**Assignment 94:** Use `aria-label` on icon-only buttons or links with no visible text.

**Assignment 95:** Connect helper text to an input with `aria-describedby` matching an element `id`.

**Assignment 96:** Hide decorative icons from assistive tech using `aria-hidden="true"`.

**Assignment 97:** Implement a “skip to main content” link at the top of the page that targets `#main-content`.

**Assignment 98:** Build a keyboard-friendly horizontal nav using a list inside `<nav>` with clear focus styles in `<style>`.

**Assignment 99:** Mark up a form error summary region at the top of a form with `role="alert"` (static example).

**Assignment 100:** Add screen-reader-only text with a `.visually-hidden` CSS class and use it for context on ambiguous links.

**Assignment 101:** Use landmark roles thoughtfully: `role="navigation"`, `role="main"`, and native elements where they duplicate roles.

**Assignment 102:** Audit and fix heading levels so there is one `<h1>` and levels do not skip incorrectly in a sample article page.

**Assignment 103:** Write `alt` text examples: one informative image, one decorative image with empty `alt`, and one functional image (linked).

**Assignment 104:** Create a data table with `<th scope>` and optional `headers`/`id` associations for a more complex grid.

**Assignment 105:** Use `aria-expanded` and `aria-controls` on a disclosure-style button controlling a region (static markup).

**Assignment 106:** Add `lang` on a paragraph of foreign language text using `lang="fr"` (or another language) inside an English page.

**Assignment 107:** Use `<abbr title>` for abbreviations the first time they appear in a document.

**Assignment 108:** Combine landmarks, headings, and ARIA on a single “accessible profile card” page.

### SEO & Meta

**Assignment 109:** Add `<meta name="description" content>` summarizing the page in ~155 characters.

**Assignment 110:** Ensure `<meta name="viewport" content="width=device-width, initial-scale=1">` is present and correct.

**Assignment 111:** Add Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) in `<head>`.

**Assignment 112:** Add Twitter Card meta tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`).

**Assignment 113:** Add `<link rel="canonical" href>` pointing to the preferred URL.

**Assignment 114:** Add `<meta name="robots" content="index, follow">` (or a noindex example with comment explaining use).

**Assignment 115:** Link a favicon using `<link rel="icon" href>` (placeholder path).

**Assignment 116:** Embed JSON-LD `<script type="application/ld+json">` for an `Organization` or `WebSite` schema.

**Assignment 117:** Reference a sitemap in a comment or with `<link rel="sitemap" type="application/xml" href>` if appropriate for your setup.

**Assignment 118:** Combine SEO meta, Open Graph, Twitter, canonical, and JSON-LD on one cohesive landing page head.

### Advanced Elements

**Assignment 119:** Create an FAQ using native `<details>` and `<summary>` elements (multiple items).

**Assignment 120:** Use `<dialog>` with a button that opens it via `showModal()` in a short script.

**Assignment 121:** Show task progress with `<progress value max>`.

**Assignment 122:** Show a gauge with `<meter min max low high optimum value>`.

**Assignment 123:** Mark up dates and times using `<time datetime>` for machine-readable values.

**Assignment 124:** Highlight search terms in a paragraph using `<mark>`.

**Assignment 125:** Store machine-readable values inline using `<data value>`.

**Assignment 126:** Add `data-*` attributes on several elements and document their purpose in comments.

**Assignment 127:** Create a `contenteditable` region demonstrating editable rich text (with a note about production considerations).

**Assignment 128:** Add microdata `itemscope`/`itemtype`/`itemprop` for a simple `Product` snippet.

**Assignment 129:** Define reusable markup inside `<template>` and clone it with JavaScript into the page.

**Assignment 130:** Combine `<details>`, `<dialog>`, `<progress>`, and `<meter>` on a “dashboard widgets” demo page.

### Page Layouts

**Assignment 131:** Build a Holy Grail layout (header, footer, three columns) using semantic elements and CSS flex or grid in `<style>`.

**Assignment 132:** Build a blog index layout: featured post, list of posts, sidebar with categories.

**Assignment 133:** Build a portfolio page: hero, project grid, about section, contact strip.

**Assignment 134:** Build a product landing page: hero, features, testimonials, pricing teaser, CTA.

**Assignment 135:** Build a dashboard layout: top bar, side nav, main panels grid.

**Assignment 136:** Build an e-commerce product page: gallery area, title/price, description, add-to-cart form placeholder, specs table.

**Assignment 137:** Build a documentation page: sidebar ToC, main content with on-page anchors, code `<pre>` blocks.

**Assignment 138:** Build a simple responsive email-style HTML table layout (inline-friendly structure, narrow width).

**Assignment 139:** Build a creative 404 page with heading, helpful links, and search form.

**Assignment 140:** Build a login and registration page pair as two `<article>` sections or tabs on one page with two forms.

---

## 🔴 ADVANCED LEVEL (Assignments 141–200)

### Web Components

**Assignment 141:** Register a custom element `<hello-world>` that displays shadowed text using `customElements.define`.

**Assignment 142:** Attach a shadow root to a custom element and place styled content inside closed or open shadow mode.

**Assignment 143:** Use `<template>` with `<slot>` and named slots for component composition.

**Assignment 144:** Implement `connectedCallback` and `attributeChangedCallback` with `observedAttributes` on a custom element.

**Assignment 145:** Reflect a JavaScript property to an HTML attribute (or vice versa) on a custom element.

**Assignment 146:** Extend a built-in element using `extends` and `is="..."` (where supported) with a fallback note in comments.

**Assignment 147:** Dispatch and listen for a `CustomEvent` between a host page and a custom element.

**Assignment 148:** Pass data into a custom element via attributes and render updates in `attributeChangedCallback`.

**Assignment 149:** Nest custom elements (parent/child) demonstrating light DOM composition.

**Assignment 150:** Build a small “card” web component with slots for title, media, and actions.

### Canvas & SVG

**Assignment 151:** Draw a rectangle, circle, and line on `<canvas>` using 2D context API.

**Assignment 152:** Create an SVG with `<rect>`, `<circle>`, and `<line>` inline in HTML.

**Assignment 153:** Animate SVG attributes or use `<animate>` on a shape (SMIL or CSS keyframes in `<style>`).

**Assignment 154:** Make an interactive SVG button or shape that changes on click via a short script.

**Assignment 155:** Build a small inline SVG icon sprite sheet using `<symbol>` and `<use href>`.

**Assignment 156:** Draw a simple movable “player” square on canvas with keyboard or button controls.

**Assignment 157:** Create a minimal SVG bar chart from static data (rects with labels).

**Assignment 158:** Make an SVG `viewBox` responsive inside a container with `preserveAspectRatio`.

**Assignment 159:** Combine canvas and SVG on one page for different visual roles (explain in a heading).

**Assignment 160:** Export or redraw canvas content on a button click (simple pixel clear/fill demo).

### Performance & Optimization

**Assignment 161:** Structure critical above-the-fold content first in `<body>` and defer non-critical widgets below.

**Assignment 162:** Apply `loading="lazy"` to images and `loading="lazy"` to iframes where appropriate.

**Assignment 163:** Add `<link rel="preload" as="font" href>` (placeholder) with `crossorigin` note.

**Assignment 164:** Add `<link rel="prefetch" href>` for a likely next page (placeholder URL).

**Assignment 165:** Add `<link rel="preconnect" href>` to a third-party origin (e.g., fonts or CDN).

**Assignment 166:** Load scripts with `defer` and `async` examples in comments comparing behavior.

**Assignment 167:** Use `fetchpriority="high"` on a hero image `<img>` (with supporting note).

**Assignment 168:** Provide a responsive image strategy section: `picture`, `srcset`, and art direction example together.

**Assignment 169:** Minimize render-blocking by moving styles inline for critical CSS demo and linking non-critical CSS (placeholder).

**Assignment 170:** Document a performance checklist in the page using `<details>` sections (images, scripts, fonts, caching hints).

### Advanced Accessibility

**Assignment 171:** Add a static WCAG-oriented checklist table mapping criteria to your sample page features.

**Assignment 172:** Implement `aria-live="polite"` on a status region updated by a button (simple text append).

**Assignment 173:** Trap focus inside an open `<dialog>` using `showModal()` defaults and explain in a paragraph.

**Assignment 174:** Build a keyboard-navigable list of buttons styled as tabs with `role="tablist"` pattern (ARIA).

**Assignment 175:** Build an accessible accordion with buttons controlling panels (`aria-expanded`, `aria-controls`).

**Assignment 176:** Mark up a carousel with `role="region"`, `aria-roledescription="carousel"`, and live region hints (static).

**Assignment 177:** Ensure visible focus outlines in CSS for all interactive elements in a complex layout.

**Assignment 178:** Provide “announcements” using `aria-live` and `aria-atomic` on a toast region.

**Assignment 179:** Build an accessible modal dialog pattern with `<dialog>`, labeled title, and focus return note.

**Assignment 180:** Combine tabs, accordion, and skip link on one accessibility demo page with documentation comments.

### Modern HTML APIs

**Assignment 181:** Implement HTML5 Drag and Drop: draggable item and drop zone with `dataTransfer` (minimal demo).

**Assignment 182:** Use `localStorage` to persist a theme choice toggled by a button (short script).

**Assignment 183:** Request geolocation on button click with `navigator.geolocation.getCurrentPosition` and show coords in `<output>`.

**Assignment 184:** Use the History API (`pushState`) and `popstate` to swap main content titles without reload (minimal).

**Assignment 185:** Use `IntersectionObserver` to add a class when a section scrolls into view (short script).

**Assignment 186:** Use the Popover API (`popover` attribute, `popovertarget`) on a button and div.

**Assignment 187:** Use `showModal()` / `close()` on `<dialog>` controlled by buttons (Dialog API practice).

**Assignment 188:** Use View Transitions API (`document.startViewTransition`) guarded by feature detection for a simple theme swap.

**Assignment 189:** Combine Web Storage and History API for a tiny multi-“page” state without server.

**Assignment 190:** Build a “feature support” panel listing which APIs appear available in `window`/`HTMLDialogElement` (feature checks only).

### Real-World Projects

**Assignment 191:** Build a responsive restaurant menu page with sections (starters, mains, drinks) and prices.

**Assignment 192:** Build an event registration form with relevant inputs, fieldsets, and client validation attributes.

**Assignment 193:** Build a portfolio page using full semantic structure, meta description, and Open Graph tags.

**Assignment 194:** Build an accessible dashboard with landmarks, headings table, and `aria-label` on nav regions.

**Assignment 195:** Build a responsive email newsletter template using tables for layout and inline-ready structure.

**Assignment 196:** Build a small documentation site homepage with nav, sections, and code samples in `<pre><code>`.

**Assignment 197:** Build an interactive FAQ page using `<details>`/`<summary>` and jump links.

**Assignment 198:** Build a multi-language page with `lang` attributes, alternate language links, and translated headings for two languages.

**Assignment 199:** Build a Progressive Web App shell: `manifest` link, theme-color meta, and a service worker registration script stub.

**Assignment 200:** Build an accessible e-commerce category page: product cards as `<article>`, focusable links, and an accessible filter form.

---

*Total: 200 Assignments — 70 Beginner | 70 Intermediate | 60 Advanced*
