# 200 CSS Real-Time Assignments — With Answers

---

**Assignment 1:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 1 — Element selector</title>
  <style>
    p {
      font-size: 1.0625rem;
      color: #1e293b;
      max-width: 65ch;
    }
  </style>
</head>
<body>
  <p>All paragraphs pick up the shared font size and color from the element selector.</p>
  <p>Element selectors target every matching tag in the document.</p>
</body>
</html>
```

---

**Assignment 2:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 2 — .highlight</title>
  <style>
    .highlight {
      background-color: #fef08a;
      font-weight: 700;
      padding: 0.15em 0.35em;
      border-radius: 0.25rem;
    }
  </style>
</head>
<body>
  <p>Mark this phrase: <span class="highlight">important detail</span> in context.</p>
</body>
</html>
```

---

**Assignment 3:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 3 — #main-title</title>
  <style>
    #main-title {
      text-align: center;
      color: #7c3aed;
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      margin-block: 1rem;
    }
  </style>
</head>
<body>
  <h1 id="main-title">Single unique heading</h1>
</body>
</html>
```

---

**Assignment 4:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 4 — Universal selector</title>
  <style>
    *,
    *::before,
    *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: system-ui, sans-serif;
      padding: 1rem;
    }
  </style>
</head>
<body>
  <h1>Reset via universal selector</h1>
  <p>Margins and padding start from a predictable baseline.</p>
</body>
</html>
```

---

**Assignment 5:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 5 — Grouping selectors</title>
  <style>
    h1, h2, h3 {
      font-family: "Georgia", "Times New Roman", serif;
      margin-block: 0.75rem 0.35rem;
      line-height: 1.2;
    }
  </style>
</head>
<body>
  <h1>Title</h1>
  <h2>Section</h2>
  <h3>Subsection</h3>
</body>
</html>
```

---

**Assignment 6:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 6 — Descendant</title>
  <style>
    .article-body a {
      color: #0369a1;
      text-decoration: underline;
      text-underline-offset: 0.15em;
    }
    .article-body a:hover {
      color: #0c4a6e;
    }
  </style>
</head>
<body>
  <article class="article-body">
    <p>Read <a href="#">more inside the article</a> only.</p>
  </article>
  <p>Outside <a href="#">link</a> is not targeted.</p>
</body>
</html>
```

---

**Assignment 7:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 7 — Child combinator</title>
  <style>
    .menu > li {
      list-style: square;
      color: #0f766e;
      margin-block: 0.25rem;
    }
  </style>
</head>
<body>
  <ul class="menu">
    <li>Top level</li>
    <li>
      Parent
      <ul>
        <li>Nested (default bullets)</li>
      </ul>
    </li>
  </ul>
</body>
</html>
```

---

**Assignment 8:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 8 — Adjacent sibling</title>
  <style>
    h2 + p {
      font-size: 1.125rem;
      color: #334155;
      border-inline-start: 4px solid #6366f1;
      padding-inline-start: 0.75rem;
    }
  </style>
</head>
<body>
  <h2>Section</h2>
  <p>This paragraph immediately follows h2 and is styled.</p>
  <p>This one is not adjacent to h2.</p>
</body>
</html>
```

---

**Assignment 9:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 9 — Attribute selectors</title>
  <style>
    input[type="email"] {
      border: 2px solid #a855f7;
      border-radius: 0.375rem;
      padding: 0.5rem 0.75rem;
    }
    a[href^="https"] {
      color: #15803d;
    }
  </style>
</head>
<body>
  <label>Email <input type="email" placeholder="you@example.com"></label>
  <p><a href="https://example.com">Secure link</a> · <a href="http://insecure.test">Other</a></p>
</body>
</html>
```

---

**Assignment 10:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 10 — Combined selectors</title>
  <style>
    button {
      font: inherit;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      cursor: pointer;
    }
    button.primary {
      background: linear-gradient(135deg, #2563eb, #4f46e5);
      color: #fff;
      border-color: transparent;
    }
  </style>
</head>
<body>
  <button type="button" class="primary">Primary</button>
  <button type="button">Default</button>
</body>
</html>
```

---

**Assignment 11:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 11 — Named colors</title>
  <style>
    .card {
      background-color: midnightblue;
      color: white;
      padding: 1.25rem;
      border-radius: 0.75rem;
      max-width: 22rem;
    }
    .card small {
      color: lightgray;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>Named palette</h2>
    <small>Caption in lightgray</small>
  </div>
</body>
</html>
```

---

**Assignment 12:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 12 — Hex colors</title>
  <style>
    :root {
      --brand-primary: #0ea5e9;
      --brand-secondary: #f97316;
      --surface: #f1f5f9;
    }
    body {
      background: var(--surface);
      font-family: system-ui, sans-serif;
    }
    .badge {
      background: var(--brand-primary);
      color: #ffffff;
      padding: 0.25rem 0.5rem;
      border-radius: 999px;
    }
    .accent {
      color: var(--brand-secondary);
      font-weight: 600;
    }
  </style>
</head>
<body>
  <p><span class="badge">New</span> <span class="accent">Hex-driven brand</span></p>
</body>
</html>
```

---

**Assignment 13:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 13 — rgb / alpha</title>
  <style>
    .overlay {
      position: relative;
      min-height: 8rem;
      border-radius: 0.75rem;
      background: rgb(15 23 42);
      color: white;
      display: grid;
      place-items: center;
      overflow: hidden;
    }
    .overlay::before {
      content: "";
      position: absolute;
      inset: 0;
      background: rgb(59 130 246 / 0.45);
    }
    .overlay span {
      position: relative;
      z-index: 1;
    }
  </style>
</head>
<body>
  <div class="overlay"><span>Semi-transparent blue wash</span></div>
</body>
</html>
```

---

**Assignment 14:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 14 — hsl</title>
  <style>
    .panel {
      background: hsl(220 30% 18%);
      color: hsl(210 40% 98%);
      padding: 1.5rem;
      border-radius: 0.75rem;
      max-width: 28rem;
    }
    .panel p {
      color: hsl(210 25% 85% / 0.95);
    }
  </style>
</head>
<body>
  <div class="panel">
    <h2>HSL surfaces</h2>
    <p>Readable body copy on a dark hsl background.</p>
  </div>
</body>
</html>
```

---

**Assignment 15:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 15 — Gradients</title>
  <style>
    .hero {
      min-height: 12rem;
      border-radius: 1rem;
      background:
        radial-gradient(circle at 20% 30%, rgb(250 204 21 / 0.35), transparent 55%),
        linear-gradient(120deg, #312e81, #7c3aed 45%, #db2777);
      color: white;
      display: grid;
      place-items: center;
      font-size: 1.25rem;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <header class="hero">Linear band + radial spotlight</header>
</body>
</html>
```

---

**Assignment 16:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 16 — background-image</title>
  <style>
    .banner {
      min-height: 10rem;
      border-radius: 0.75rem;
      background-color: #e2e8f0;
      background-image: url("https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=60");
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center;
    }
  </style>
</head>
<body>
  <div class="banner" role="img" aria-label="Landscape photo"></div>
</body>
</html>
```

---

**Assignment 17:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 17 — size & position</title>
  <style>
    .thumb {
      width: min(100%, 420px);
      aspect-ratio: 16 / 9;
      border-radius: 0.5rem;
      background-image: url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=60");
      background-size: cover;
      background-position: 20% 60%;
      border: 1px solid #cbd5e1;
    }
    .contain-box {
      width: 200px;
      height: 120px;
      margin-top: 1rem;
      background-image: url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=60");
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      background-color: #0f172a;
      border-radius: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="thumb"></div>
  <div class="contain-box"></div>
</body>
</html>
```

---

**Assignment 18:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 18 — Multiple backgrounds</title>
  <style>
    .layered {
      min-height: 11rem;
      border-radius: 1rem;
      padding: 1.5rem;
      color: white;
      font-weight: 600;
      background:
        linear-gradient(180deg, rgb(15 23 42 / 0.2), rgb(15 23 42 / 0.85)),
        url("https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&q=60") center / cover no-repeat,
        #0f172a;
    }
  </style>
</head>
<body>
  <div class="layered">Solid + image + gradient overlay</div>
</body>
</html>
```

---

**Assignment 19:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 19 — font-family stack</title>
  <style>
    body {
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif;
      line-height: 1.5;
    }
    code, kbd {
      font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace;
    }
  </style>
</head>
<body>
  <p>System UI stack for interface copy.</p>
  <p><kbd>Ctrl</kbd> + <kbd>C</kbd> uses the mono stack.</p>
</body>
</html>
```

---

**Assignment 20:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 20 — rem scale</title>
  <style>
    html {
      font-size: 100%;
    }
    body {
      font-size: 1rem;
    }
    h1 {
      font-size: 2.25rem;
    }
    h2 {
      font-size: 1.5rem;
    }
  </style>
</head>
<body>
  <h1>Page title</h1>
  <h2>Section</h2>
  <p>Body at 1rem scales with root font size.</p>
</body>
</html>
```

---

**Assignment 21:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 21 — font-weight</title>
  <style>
    .label {
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-size: 0.75rem;
    }
    .caption {
      font-weight: 400;
      color: #64748b;
      font-size: 0.875rem;
    }
    strong {
      font-weight: 700;
    }
  </style>
</head>
<body>
  <p class="label">Status</p>
  <p>Body <strong>emphasis</strong> and <span class="caption">caption weight</span>.</p>
</body>
</html>
```

---

**Assignment 22:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 22 — line-height</title>
  <style>
    h1 {
      line-height: 1.15;
    }
    p {
      line-height: 1.65;
      max-width: 60ch;
    }
  </style>
</head>
<body>
  <h1>Tight heading for display</h1>
  <p>Comfortable paragraph measure with relaxed line-height for long reading.</p>
</body>
</html>
```

---

**Assignment 23:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 23 — letter-spacing</title>
  <style>
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-size: 0.7rem;
      color: #64748b;
    }
    .display {
      font-size: clamp(2.5rem, 6vw, 4rem);
      letter-spacing: -0.03em;
      font-weight: 800;
    }
  </style>
</head>
<body>
  <p class="eyebrow">Release</p>
  <h1 class="display">Tight display type</h1>
</body>
</html>
```

---

**Assignment 24:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 24 — text-align</title>
  <style>
    .intro {
      text-align: center;
    }
    .legal {
      text-align: justify;
      hyphens: auto;
    }
    figcaption {
      text-align: end;
      color: #64748b;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <p class="intro">Centered intro</p>
  <p class="legal">Justified block for dense legal-style copy when appropriate.</p>
  <figure>
    <figcaption>Right-aligned caption</figcaption>
  </figure>
</body>
</html>
```

---

**Assignment 25:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 25 — text-decoration</title>
  <style>
    a {
      color: #2563eb;
      text-decoration: underline;
      text-decoration-thickness: 2px;
      text-underline-offset: 0.2em;
      transition: color 0.2s ease;
    }
    a:hover {
      color: #1d4ed8;
      text-decoration-color: currentColor;
    }
    .plain {
      text-decoration: none;
    }
  </style>
</head>
<body>
  <p><a href="#">Underlined link</a> · <a class="plain" href="#">No underline</a></p>
</body>
</html>
```

---

**Assignment 26:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 26 — text-transform</title>
  <style>
    nav a {
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.08em;
    }
    .title-case {
      text-transform: capitalize;
    }
  </style>
</head>
<body>
  <nav><a href="#">home</a> · <a href="#">docs</a></nav>
  <h1 class="title-case">the quick brown fox</h1>
</body>
</html>
```

---

**Assignment 27:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 27 — @font-face</title>
  <style>
    @font-face {
      font-family: "Demo Serif";
      src: local("Georgia");
      font-weight: 400 700;
      font-style: normal;
      font-display: swap;
    }
    h1 {
      font-family: "Demo Serif", Georgia, serif;
    }
  </style>
</head>
<body>
  <h1>Heading uses @font-face mapping to a local font file (swap with your .woff2 URL)</h1>
</body>
</html>
```

---

**Assignment 28:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 28 — Google Fonts</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: "Inter", system-ui, sans-serif;
    }
  </style>
</head>
<body>
  <p>Whole page uses Inter from Google Fonts.</p>
</body>
</html>
```

---

**Assignment 29:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 29 — Margin collapse</title>
  <style>
    .a, .b {
      background: #e2e8f0;
      padding: 0.5rem 1rem;
    }
    .a {
      margin-block-end: 2rem;
    }
    .b {
      margin-block-start: 2rem;
    }
    .note {
      margin-top: 1rem;
      font-size: 0.875rem;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="a">Block A (margin-bottom 2rem)</div>
  <div class="b">Block B (margin-top 2rem) — adjacent vertical margins collapse to the larger.</div>
  <p class="note">Inspect: gap between siblings is ~2rem, not 4rem.</p>
</body>
</html>
```

---

**Assignment 30:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 30 — padding shorthand</title>
  <style>
    .card {
      padding: 1rem 1.25rem 1.5rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      max-width: 20rem;
    }
  </style>
</head>
<body>
  <div class="card">Three-value padding: top, inline, bottom.</div>
</body>
</html>
```

---

**Assignment 31:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 31 — border</title>
  <style>
    input {
      border-width: 2px;
      border-style: solid;
      border-color: #94a3b8;
      border-radius: 0.5rem;
      padding: 0.5rem 0.75rem;
      font: inherit;
    }
    input:focus-visible {
      border-color: #2563eb;
      outline: none;
    }
  </style>
</head>
<body>
  <label>Name <input type="text"></label>
</body>
</html>
```

---

**Assignment 32:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 32 — width / height</title>
  <style>
    .box {
      width: 200px;
      height: 80px;
      background: #c7d2fe;
      overflow: hidden;
    }
    .scroll {
      overflow: auto;
      margin-top: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="box">Fixed box clips overflowing content when overflow hidden.</div>
  <div class="box scroll">Many lines<br>Many lines<br>Many lines<br>Many lines<br>Scroll appears.</div>
</body>
</html>
```

---

**Assignment 33:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 33 — box-sizing</title>
  <style>
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }
    .demo {
      width: 200px;
      padding: 16px;
      border: 4px solid #334155;
      background: #f1f5f9;
    }
  </style>
</head>
<body>
  <div class="demo">Total width stays 200px including padding and border.</div>
</body>
</html>
```

---

**Assignment 34:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 34 — outline</title>
  <style>
    button {
      font: inherit;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid #cbd5e1;
      background: white;
    }
    button:focus-visible {
      outline: 3px solid #38bdf8;
      outline-offset: 2px;
    }
  </style>
</head>
<body>
  <button type="button">Tab to me</button>
</body>
</html>
```

---

**Assignment 35:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 35 — border-radius</title>
  <style>
    .btn {
      border-radius: 999px;
      padding: 0.5rem 1.25rem;
      border: none;
      background: #4f46e5;
      color: white;
    }
    .card {
      border-radius: 1rem;
      padding: 1rem;
      background: white;
      box-shadow: 0 10px 30px rgb(15 23 42 / 0.08);
    }
    .avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f472b6, #6366f1);
    }
  </style>
</head>
<body>
  <button class="btn" type="button">Pill</button>
  <div class="card">Rounded card</div>
  <div class="avatar" aria-hidden="true"></div>
</body>
</html>
```

---

**Assignment 36:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 36 — min/max</title>
  <style>
    .fluid {
      width: min(100%, 720px);
      min-height: 120px;
      max-height: 240px;
      overflow: auto;
      margin-inline: auto;
      padding: 1rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="fluid">Constrained box: min/max width via min() and overflow for height cap.</div>
</body>
</html>
```

---

**Assignment 37:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 37 — overflow</title>
  <style>
    .clip {
      width: 12rem;
      height: 4rem;
      overflow: hidden;
      background: #fef3c7;
    }
    .scroll {
      width: 12rem;
      height: 4rem;
      overflow: auto;
      background: #dbeafe;
      margin-top: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="clip">Hidden overflow text that keeps going and going and going.</div>
  <div class="scroll">Scrollable overflow text that keeps going and going and going.</div>
</body>
</html>
```

---

**Assignment 38:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 38 — aspect-ratio</title>
  <style>
    .tile {
      aspect-ratio: 4 / 3;
      width: min(100%, 320px);
      border-radius: 0.5rem;
      background: center / cover no-repeat
        url("https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=60");
    }
  </style>
</head>
<body>
  <div class="tile" role="img" aria-label="Media tile"></div>
</body>
</html>
```

---

**Assignment 39:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 39 — block list</title>
  <style>
    ul.reset {
      list-style: none;
      padding: 0;
    }
    ul.reset li {
      display: block;
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <ul class="reset">
    <li>Item one</li>
    <li>Item two</li>
  </ul>
</body>
</html>
```

---

**Assignment 40:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 40 — inline badges</title>
  <style>
    .badge {
      display: inline;
      background: #ecfccb;
      color: #365314;
      padding: 0.1em 0.35em;
      border-radius: 0.25rem;
      font-size: 0.85em;
    }
  </style>
</head>
<body>
  <p>Price is <span class="badge">$19</span> including tax inline.</p>
</body>
</html>
```

---

**Assignment 41:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 41 — inline-block pills</title>
  <style>
    .pill {
      display: inline-block;
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      background: #e0e7ff;
      color: #312e81;
      margin-inline-end: 0.35rem;
    }
  </style>
</head>
<body>
  <span class="pill">Design</span><span class="pill">CSS</span>
</body>
</html>
```

---

**Assignment 42:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 42 — display none vs visibility</title>
  <style>
    .gone {
      display: none;
    }
    .invis {
      visibility: hidden;
    }
    .row {
      display: flex;
      gap: 0.5rem;
      margin-block: 0.5rem;
    }
    .box {
      width: 4rem;
      height: 2rem;
      background: #93c5fd;
    }
  </style>
</head>
<body>
  <p>display:none removes from layout; visibility:hidden keeps space.</p>
  <div class="row">
    <div class="box"></div>
    <div class="box gone"></div>
    <div class="box"></div>
  </div>
  <div class="row">
    <div class="box"></div>
    <div class="box invis"></div>
    <div class="box"></div>
  </div>
</body>
</html>
```

---

**Assignment 43:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 43 — relative offset</title>
  <style>
    .shift {
      position: relative;
      top: 8px;
      left: 12px;
      background: #fef9c3;
      padding: 0.5rem;
      display: inline-block;
    }
  </style>
</head>
<body>
  <p><span class="shift">Nudged box</span> keeps original space in flow.</p>
</body>
</html>
```

---

**Assignment 44:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 44 — absolute in positioned parent</title>
  <style>
    .card {
      position: relative;
      max-width: 18rem;
      padding: 1.25rem;
      border-radius: 0.75rem;
      background: white;
      border: 1px solid #e2e8f0;
    }
    .close {
      position: absolute;
      top: 0.5rem;
      inset-inline-end: 0.5rem;
      width: 1.75rem;
      height: 1.75rem;
      border: none;
      border-radius: 999px;
      background: #f1f5f9;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="card">
    <button class="close" type="button" aria-label="Close">×</button>
    <p>Corner button anchored to card.</p>
  </div>
</body>
</html>
```

---

**Assignment 45:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 45 — fixed header</title>
  <style>
    body {
      margin: 0;
      font-family: system-ui, sans-serif;
    }
    header {
      position: fixed;
      inset-block-start: 0;
      inset-inline: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.25rem;
      background: rgb(15 23 42 / 0.92);
      color: white;
      backdrop-filter: blur(8px);
    }
    main {
      padding: 5rem 1rem 2rem;
      min-height: 200vh;
    }
  </style>
</head>
<body>
  <header><strong>Brand</strong><span>Menu</span></header>
  <main>Scroll — header stays fixed.</main>
</body>
</html>
```

---

**Assignment 46:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 46 — sticky TOC</title>
  <style>
    body {
      margin: 0;
      font-family: system-ui, sans-serif;
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 1rem;
    }
    aside {
      position: sticky;
      top: 0;
      align-self: start;
      padding: 1rem;
      background: #f8fafc;
      border-inline-end: 1px solid #e2e8f0;
      max-height: 100vh;
      overflow: auto;
    }
    article {
      padding: 1rem;
      min-height: 150vh;
    }
  </style>
</head>
<body>
  <aside>
    <h2>TOC</h2>
    <a href="#s1">Section 1</a><br><a href="#s2">Section 2</a>
  </aside>
  <article>
    <h1 id="s1">Section 1</h1>
    <p>Long content…</p>
    <h1 id="s2">Section 2</h1>
  </article>
</body>
</html>
```

---

**Assignment 47:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 47 — z-index stacking</title>
  <style>
    .stack {
      position: relative;
      height: 6rem;
    }
    .a, .b, .c {
      position: absolute;
      width: 7rem;
      height: 4rem;
      border-radius: 0.5rem;
    }
    .a {
      background: #fca5a5;
      top: 0;
      left: 0;
      z-index: 1;
    }
    .b {
      background: #86efac;
      top: 1.5rem;
      left: 2rem;
      z-index: 2;
    }
    .c {
      background: #93c5fd;
      top: 3rem;
      left: 4rem;
      z-index: 3;
    }
  </style>
</head>
<body>
  <div class="stack"><div class="a"></div><div class="b"></div><div class="c"></div></div>
</body>
</html>
```

---

**Assignment 48:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 48 — float image</title>
  <style>
    img.float {
      float: left;
      width: 120px;
      height: 90px;
      object-fit: cover;
      margin: 0 1rem 0.5rem 0;
      border-radius: 0.35rem;
    }
    p {
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <p>
    <img class="float" src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=200&q=60" alt="">
    Text wraps around the floated thumbnail in classic magazine style.
  </p>
</body>
</html>
```

---

**Assignment 49:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 49 — clearfix / flow-root</title>
  <style>
    .media {
      display: flow-root;
      background: #f1f5f9;
      padding: 0.75rem;
      border-radius: 0.5rem;
    }
    .media img {
      float: left;
      width: 80px;
      height: 80px;
      border-radius: 0.35rem;
      margin-inline-end: 0.75rem;
    }
  </style>
</head>
<body>
  <div class="media">
    <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=160&q=60" alt="">
    <p>Parent contains floats via flow-root.</p>
  </div>
</body>
</html>
```

---

**Assignment 50:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 50 — badge on avatar</title>
  <style>
    .avatar-wrap {
      position: relative;
      width: 4rem;
      height: 4rem;
    }
    .avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
    .badge {
      position: absolute;
      bottom: 0;
      right: 0;
      min-width: 1.1rem;
      height: 1.1rem;
      padding: 0 0.2rem;
      border-radius: 999px;
      background: #ef4444;
      color: white;
      font-size: 0.65rem;
      display: grid;
      place-items: center;
      border: 2px solid white;
    }
  </style>
</head>
<body>
  <div class="avatar-wrap">
    <img class="avatar" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=60" alt="">
    <span class="badge">3</span>
  </div>
</body>
</html>
```

---

**Assignment 51:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 51 — :hover</title>
  <style>
    a, button {
      transition: color 0.2s ease, transform 0.2s ease;
    }
    a:hover {
      color: #7c3aed;
    }
    button:hover {
      transform: translateY(-2px);
    }
    button {
      font: inherit;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid #cbd5e1;
      background: white;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <p><a href="#">Hover link</a></p>
  <button type="button">Hover lift</button>
</body>
</html>
```

---

**Assignment 52:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 52 — :focus-visible</title>
  <style>
    a {
      color: #2563eb;
      text-decoration: underline;
    }
    a:focus {
      outline: none;
    }
    a:focus-visible {
      outline: 3px solid #38bdf8;
      outline-offset: 3px;
      border-radius: 2px;
    }
  </style>
</head>
<body>
  <p><a href="#">Tab to see focus ring (mouse click won’t show in supporting browsers)</a></p>
</body>
</html>
```

---

**Assignment 53:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 53 — :active</title>
  <style>
    .press {
      padding: 1rem;
      border-radius: 0.75rem;
      background: #e2e8f0;
      cursor: pointer;
      user-select: none;
      transition: transform 0.08s ease, background 0.08s ease;
    }
    .press:active {
      transform: scale(0.98);
      background: #cbd5e1;
    }
  </style>
</head>
<body>
  <div class="press" role="button" tabindex="0">Press / click me</div>
</body>
</html>
```

---

**Assignment 54:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 54 — :first-child</title>
  <style>
    .list li:first-child {
      font-weight: 700;
      color: #0f766e;
    }
  </style>
</head>
<body>
  <ul class="list">
    <li>First gets emphasis</li>
    <li>Second</li>
    <li>Third</li>
  </ul>
</body>
</html>
```

---

**Assignment 55:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 55 — :nth-child</title>
  <style>
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 0.35rem;
      margin-top: 1rem;
    }
    .grid span {
      padding: 0.5rem;
      text-align: center;
      background: #e2e8f0;
      border-radius: 0.25rem;
    }
    .grid span:nth-child(3n) {
      background: #c7d2fe;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <table>
    <tr><td>A</td><td>1</td></tr>
    <tr><td>B</td><td>2</td></tr>
    <tr><td>C</td><td>3</td></tr>
  </table>
  <div class="grid">
    <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
  </div>
</body>
</html>
```

---

**Assignment 56:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 56 — ::before</title>
  <style>
    h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    h2::before {
      content: "";
      width: 4px;
      height: 1.25em;
      border-radius: 2px;
      background: linear-gradient(180deg, #6366f1, #a855f7);
    }
  </style>
</head>
<body>
  <h2>Decorated heading</h2>
</body>
</html>
```

---

**Assignment 57:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 57 — ::after overlay</title>
  <style>
    .thumb {
      position: relative;
      width: min(100%, 280px);
      aspect-ratio: 16/9;
      border-radius: 0.5rem;
      overflow: hidden;
      background: center/cover
        url("https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=60");
    }
    .thumb::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 40%, rgb(15 23 42 / 0.75));
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div class="thumb" role="img" aria-label="Thumbnail"></div>
</body>
</html>
```

---

**Assignment 58:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 58 — ::placeholder</title>
  <style>
    input::placeholder {
      color: #94a3b8;
      font-style: italic;
    }
    input {
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid #cbd5e1;
      font: inherit;
    }
  </style>
</head>
<body>
  <input type="text" placeholder="Styled placeholder">
</body>
</html>
```

---

**Assignment 59:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 59 — ::selection</title>
  <style>
    ::selection {
      background: #fde68a;
      color: #1e293b;
    }
  </style>
</head>
<body>
  <p>Select this paragraph to see custom selection colors.</p>
</body>
</html>
```

---

**Assignment 60:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 60 — ::marker</title>
  <style>
    ul.fancy li::marker {
      color: #7c3aed;
      font-size: 1.1em;
    }
    ol.steps li::marker {
      font-weight: 700;
      color: #0d9488;
    }
  </style>
</head>
<body>
  <ul class="fancy">
    <li>One</li>
    <li>Two</li>
  </ul>
  <ol class="steps">
    <li>Alpha</li>
    <li>Beta</li>
  </ol>
</body>
</html>
```

---

**Assignment 61:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 61 — specificity</title>
  <style>
    p {
      color: #64748b;
    }
    .text {
      color: #2563eb;
    }
    #lead {
      color: #b45309;
    }
  </style>
</head>
<body>
  <p id="lead" class="text">ID (0,1,1,0) beats class (0,1,0,0) beats type (0,0,0,1).</p>
</body>
</html>
```

---

**Assignment 62:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 62 — !important</title>
  <style>
    .warn {
      color: #16a34a !important;
    }
    #x {
      color: #dc2626;
    }
  </style>
</head>
<body>
  <p id="x" class="warn">!important beats ID without !important.</p>
</body>
</html>
```

---

**Assignment 63:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 63 — inheritance</title>
  <style>
    .parent {
      color: #0f766e;
      font-size: 1.125rem;
      border: 2px dashed #94a3b8;
      padding: 0.75rem;
    }
    .child {
      margin-block-start: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="parent">
    Inherited color &amp; font-size
    <div class="child">Child — border/margin not inherited from parent border.</div>
  </div>
</body>
</html>
```

---

**Assignment 64:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 64 — cascade order</title>
  <style>
    p {
      color: #64748b;
    }
    p.specific {
      color: #1d4ed8;
    }
  </style>
</head>
<body>
  <p class="specific">Later rule with equal specificity wins; higher specificity beats lower regardless of order.</p>
</body>
</html>
```

---

**Assignment 65:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 65 — minimal reset</title>
  <style>
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }
    * {
      margin: 0;
    }
    body {
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      font-family: system-ui, sans-serif;
    }
    img, picture, video, canvas, svg {
      display: block;
      max-width: 100%;
    }
    input, button, textarea, select {
      font: inherit;
    }
  </style>
</head>
<body>
  <h1>Consistent baseline</h1>
  <p>Minimal reset removes default spacing surprises.</p>
</body>
</html>
```

---

**Assignment 66:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 66 — initial</title>
  <style>
    .inherit-all {
      color: #b91c1c;
      font-weight: 700;
    }
    .inherit-all span {
      color: initial;
      font-weight: initial;
    }
  </style>
</head>
<body>
  <p class="inherit-all">Red bold <span>span reset to initial</span> continues.</p>
</body>
</html>
```

---

**Assignment 67:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 67 — inherit</title>
  <style>
    .box {
      color: #0369a1;
      border: 2px solid currentColor;
      padding: 0.75rem;
    }
    .box button {
      color: inherit;
      border: 1px solid currentColor;
      background: transparent;
      padding: 0.35rem 0.6rem;
      border-radius: 0.35rem;
    }
  </style>
</head>
<body>
  <div class="box">
    <button type="button">Inherits parent color</button>
  </div>
</body>
</html>
```

---

**Assignment 68:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 68 — unset</title>
  <style>
    .card {
      color: #7c3aed;
      margin: 1rem;
      padding: 1rem;
      border: 1px solid #e2e8f0;
    }
    .card .muted {
      color: unset;
    }
  </style>
</head>
<body>
  <div class="card">
    <p>Purple inherited context</p>
    <p class="muted">unset on color behaves like inherit here.</p>
  </div>
</body>
</html>
```

---

**Assignment 69:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 69 — UA vs author</title>
  <style>
    /* Author styles override user-agent defaults */
    body {
      font-family: system-ui, sans-serif;
    }
    h1 {
      font-size: 1.5rem;
      margin: 0;
    }
  </style>
</head>
<body>
  <h1>Author h1 size supersedes UA default</h1>
</body>
</html>
```

---

**Assignment 70:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 70 — source order tie</title>
  <style>
    .btn {
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      border: none;
      cursor: pointer;
    }
    .btn.primary {
      background: #94a3b8;
      color: white;
    }
    .btn.primary {
      background: #2563eb;
    }
  </style>
</head>
<body>
  <button class="btn primary" type="button">Later rule wins at equal specificity</button>
</body>
</html>
```

---

**Assignment 71:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 71 — flex row</title>
  <style>
    .row {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 0.5rem;
    }
    .row > * {
      padding: 0.5rem 0.75rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.35rem;
    }
  </style>
</head>
<body>
  <div class="row"><span>A</span><span>B</span><span>C</span></div>
</body>
</html>
```

---

**Assignment 72:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 72 — flex-direction column</title>
  <style>
    .stack {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 16rem;
    }
    .stack button {
      font: inherit;
      padding: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="stack">
    <button type="button">One</button>
    <button type="button">Two</button>
  </div>
</body>
</html>
```

---

**Assignment 73:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 73 — flex-wrap</title>
  <style>
    .wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .chip {
      flex: 1 1 120px;
      padding: 0.5rem;
      background: #e0f2fe;
      border-radius: 0.35rem;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="chip">1</div><div class="chip">2</div><div class="chip">3</div>
    <div class="chip">4</div><div class="chip">5</div>
  </div>
</body>
</html>
```

---

**Assignment 74:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 74 — justify-content</title>
  <style>
    .bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: #0f172a;
      color: white;
      border-radius: 0.5rem;
    }
    .center-demo {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="bar"><span>Left</span><span>Right</span></div>
  <div class="center-demo"><button type="button">A</button><button type="button">B</button></div>
</body>
</html>
```

---

**Assignment 75:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 75 — align-items</title>
  <style>
    .row {
      display: flex;
      align-items: center;
      min-height: 5rem;
      gap: 0.5rem;
      background: #f1f5f9;
      padding: 0.5rem;
      border-radius: 0.5rem;
    }
    .tall {
      padding: 1.5rem 0.5rem;
      background: #c7d2fe;
    }
    .short {
      padding: 0.25rem;
      background: #bbf7d0;
    }
  </style>
</head>
<body>
  <div class="row">
    <div class="tall">Tall</div>
    <div class="short">Short</div>
  </div>
</body>
</html>
```

---

**Assignment 76:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 76 — align-self</title>
  <style>
    .row {
      display: flex;
      align-items: flex-start;
      min-height: 6rem;
      gap: 0.5rem;
      background: #fef3c7;
      padding: 0.5rem;
    }
    .row .end {
      align-self: flex-end;
      background: white;
      padding: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="row">
    <div>Start</div>
    <div class="end">Self end</div>
  </div>
</body>
</html>
```

---

**Assignment 77:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 77 — flex-grow / shrink</title>
  <style>
    .bar {
      display: flex;
      gap: 0.5rem;
    }
    .a {
      flex: 2 1 0;
      background: #93c5fd;
      padding: 0.75rem;
    }
    .b {
      flex: 1 1 0;
      background: #fca5a5;
      padding: 0.75rem;
    }
    .fixed {
      flex: 0 0 120px;
      background: #e9d5ff;
      padding: 0.75rem;
    }
  </style>
</head>
<body>
  <div class="bar">
    <div class="a">Grows 2x</div>
    <div class="b">Grows 1x</div>
    <div class="fixed">Fixed 120px</div>
  </div>
</body>
</html>
```

---

**Assignment 78:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 78 — flex-basis / shorthand</title>
  <style>
    .tools {
      display: flex;
      gap: 0.5rem;
    }
    .tools > * {
      flex: 1 1 140px;
      padding: 0.5rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.35rem;
    }
  </style>
</head>
<body>
  <div class="tools">
    <div>Tool A</div><div>Tool B</div><div>Tool C</div>
  </div>
</body>
</html>
```

---

**Assignment 79:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 79 — order</title>
  <style>
    .row {
      display: flex;
      gap: 0.5rem;
    }
    .row .b {
      order: -1;
      background: #fef08a;
      padding: 0.5rem;
    }
    .row .a,
    .row .c {
      padding: 0.5rem;
      background: #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="row">
    <div class="a">HTML first</div>
    <div class="b">Visual first (order:-1)</div>
    <div class="c">HTML third</div>
  </div>
</body>
</html>
```

---

**Assignment 80:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 80 — gap</title>
  <style>
    .grid-flex {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem 1.5rem;
    }
    .grid-flex > div {
      width: 6rem;
      height: 3rem;
      background: #bae6fd;
      border-radius: 0.35rem;
    }
  </style>
</head>
<body>
  <div class="grid-flex">
    <div></div><div></div><div></div><div></div>
  </div>
</body>
</html>
```

---

**Assignment 81:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 81 — flex navbar</title>
  <style>
    nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.75rem 1.25rem;
      background: #0f172a;
      color: white;
      border-radius: 0.5rem;
    }
    nav ul {
      display: flex;
      gap: 1rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    nav a {
      color: inherit;
      text-decoration: none;
      opacity: 0.85;
    }
    nav a:hover {
      opacity: 1;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <nav>
    <strong>Acme</strong>
    <ul>
      <li><a href="#">Docs</a></li>
      <li><a href="#">Pricing</a></li>
      <li><a href="#">Login</a></li>
    </ul>
  </nav>
</body>
</html>
```

---

**Assignment 82:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 82 — equal-height cards</title>
  <style>
    .row {
      display: flex;
      gap: 1rem;
      align-items: stretch;
    }
    .card {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      background: white;
    }
    .card p:last-child {
      margin-top: auto;
    }
  </style>
</head>
<body>
  <div class="row">
    <div class="card">
      <h3>Short</h3>
      <p>Footer pins down.</p>
    </div>
    <div class="card">
      <h3>Tall</h3>
      <p>More copy here that makes this card taller naturally.</p>
      <p>Footer</p>
    </div>
  </div>
</body>
</html>
```

---

**Assignment 83:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 83 — holy grail flex</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      font-family: system-ui, sans-serif;
    }
    header, footer {
      padding: 1rem;
      background: #1e293b;
      color: white;
    }
    .mid {
      flex: 1;
      display: flex;
      min-height: 0;
    }
    .side {
      flex: 0 0 180px;
      background: #e2e8f0;
      padding: 1rem;
    }
    main {
      flex: 1;
      padding: 1rem;
    }
    @media (max-width: 700px) {
      .mid {
        flex-direction: column;
      }
      .side {
        flex-basis: auto;
      }
    }
  </style>
</head>
<body>
  <header>Header</header>
  <div class="mid">
    <aside class="side">Left</aside>
    <main>Main content grows</main>
    <aside class="side">Right</aside>
  </div>
  <footer>Footer</footer>
</body>
</html>
```

---

**Assignment 84:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 84 — center modal</title>
  <style>
    .backdrop {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgb(15 23 42 / 0.45);
      padding: 1rem;
    }
    .modal {
      width: min(100%, 360px);
      padding: 1.25rem;
      border-radius: 0.75rem;
      background: white;
      box-shadow: 0 25px 50px rgb(0 0 0 / 0.2);
    }
  </style>
</head>
<body>
  <div class="backdrop">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="t">
      <h2 id="t">Centered</h2>
      <p>Flex center on both axes.</p>
    </div>
  </div>
</body>
</html>
```

---

**Assignment 85:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 85 — responsive flex grid</title>
  <style>
    .cards {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .cards article {
      flex: 1 1 200px;
      min-width: min(200px, 100%);
      padding: 1rem;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
    }
  </style>
</head>
<body>
  <div class="cards">
    <article>Card</article><article>Card</article><article>Card</article><article>Card</article>
  </div>
</body>
</html>
```

---

**Assignment 86:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 86 — form rows flex</title>
  <style>
    .field {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
      margin-block-end: 0.75rem;
    }
    .field label {
      flex: 0 0 6rem;
      font-weight: 600;
    }
    .field input {
      flex: 1;
      min-width: 0;
      padding: 0.45rem 0.6rem;
      border-radius: 0.35rem;
      border: 1px solid #cbd5e1;
      font: inherit;
    }
  </style>
</head>
<body>
  <form>
    <div class="field"><label for="e">Email</label><input id="e" type="email"></div>
    <div class="field"><label for="n">Name</label><input id="n" type="text"></div>
  </form>
</body>
</html>
```

---

**Assignment 87:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 87 — footer flex push</title>
  <style>
    footer {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #0f172a;
      color: white;
      border-radius: 0.5rem;
    }
    .copy {
      margin-inline-start: auto;
      opacity: 0.8;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <footer>
    <a href="#" style="color:inherit">Privacy</a>
    <a href="#" style="color:inherit">Terms</a>
    <span class="copy">© 2025</span>
  </footer>
</body>
</html>
```

---

**Assignment 88:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 88 — split hero</title>
  <style>
    .hero {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      align-items: center;
      padding: 2rem 1rem;
      max-width: 960px;
      margin-inline: auto;
    }
    .hero > * {
      flex: 1 1 280px;
      min-width: 0;
    }
    .hero img {
      width: 100%;
      border-radius: 1rem;
      aspect-ratio: 4/3;
      object-fit: cover;
    }
  </style>
</head>
<body>
  <section class="hero">
    <div>
      <h1>Split hero</h1>
      <p>Column direction stacks on narrow viewports.</p>
    </div>
    <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=60" alt="">
  </section>
</body>
</html>
```

---

**Assignment 89:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 89 — grid template</title>
  <style>
    .g {
      display: grid;
      grid-template-columns: 120px 1fr 100px;
      grid-template-rows: auto 1fr auto;
      gap: 0.5rem;
      min-height: 12rem;
      background: #f1f5f9;
      padding: 0.5rem;
      border-radius: 0.5rem;
    }
    .g > * {
      background: white;
      border: 1px solid #e2e8f0;
      padding: 0.5rem;
      border-radius: 0.35rem;
    }
  </style>
</head>
<body>
  <div class="g">
    <div style="grid-column:1/-1">Header</div>
    <div>Side</div>
    <div style="grid-column:span 2">Main</div>
    <div style="grid-column:1/-1">Footer</div>
  </div>
</body>
</html>
```

---

**Assignment 90:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 90 — fr unit</title>
  <style>
    .g {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr;
      gap: 0.5rem;
    }
    .g > div {
      padding: 0.75rem;
      background: #dbeafe;
      border-radius: 0.35rem;
    }
  </style>
</head>
<body>
  <div class="g"><div>1fr</div><div>2fr</div><div>1fr</div></div>
</body>
</html>
```

---

**Assignment 91:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 91 — repeat()</title>
  <style>
    .twelve {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 0.35rem;
    }
    .twelve span {
      height: 2rem;
      background: #c4b5fd;
      border-radius: 0.25rem;
    }
    .span-6 {
      grid-column: span 6;
      background: #6ee7b7;
    }
  </style>
</head>
<body>
  <div class="twelve">
    <span class="span-6"></span>
    <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
  </div>
</body>
</html>
```

---

**Assignment 92:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 92 — minmax</title>
  <style>
    .g {
      display: grid;
      grid-template-columns: repeat(3, minmax(160px, 1fr));
      gap: 0.75rem;
    }
    .g > div {
      padding: 1rem;
      background: #fef9c3;
      border-radius: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="g"><div>A</div><div>B</div><div>C</div></div>
</body>
</html>
```

---

**Assignment 93:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 93 — auto-fill vs auto-fit</title>
  <style>
    .fill {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .fit {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 0.5rem;
    }
    .fill > div,
    .fit > div {
      background: #bae6fd;
      padding: 0.75rem;
      border-radius: 0.35rem;
      text-align: center;
    }
  </style>
</head>
<body>
  <p>Resize window: auto-fill keeps empty tracks; auto-fit collapses extras.</p>
  <div class="fill"><div>1</div><div>2</div></div>
  <div class="fit"><div>1</div><div>2</div></div>
</body>
</html>
```

---

**Assignment 94:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 94 — grid-area</title>
  <style>
    .g {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
      gap: 0.5rem;
    }
    .a {
      grid-column: 1 / 2;
      grid-row: 1 / 3;
      background: #fca5a5;
      padding: 1rem;
      border-radius: 0.35rem;
    }
    .b {
      grid-area: 1 / 2 / 2 / 3;
      background: #93c5fd;
      padding: 1rem;
      border-radius: 0.35rem;
    }
    .c {
      grid-area: 2 / 2 / 3 / 3;
      background: #86efac;
      padding: 1rem;
      border-radius: 0.35rem;
    }
  </style>
</head>
<body>
  <div class="g">
    <div class="a">Tall A</div>
    <div class="b">B</div>
    <div class="c">C</div>
  </div>
</body>
</html>
```

---

**Assignment 95:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 95 — template areas</title>
  <style>
    .layout {
      display: grid;
      grid-template-columns: 200px 1fr;
      grid-template-rows: auto 1fr auto;
      grid-template-areas:
        "head head"
        "side main"
        "foot foot";
      gap: 0.5rem;
      min-height: 14rem;
      background: #f8fafc;
      padding: 0.5rem;
      border-radius: 0.5rem;
    }
    .layout > * {
      padding: 0.75rem;
      border-radius: 0.35rem;
      border: 1px solid #e2e8f0;
      background: white;
    }
    header {
      grid-area: head;
    }
    aside {
      grid-area: side;
    }
    main {
      grid-area: main;
    }
    footer {
      grid-area: foot;
    }
  </style>
</head>
<body>
  <div class="layout">
    <header>Header</header>
    <aside>Sidebar</aside>
    <main>Main</main>
    <footer>Footer</footer>
  </div>
</body>
</html>
```

---

**Assignment 96:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 96 — span</title>
  <style>
    .g {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.35rem;
    }
    .g > div {
      padding: 0.75rem;
      background: #e9d5ff;
      border-radius: 0.35rem;
      text-align: center;
    }
    .wide {
      grid-column: span 2;
      background: #fde68a;
    }
    .tall {
      grid-row: span 2;
      background: #99f6e4;
    }
  </style>
</head>
<body>
  <div class="g">
    <div class="wide">span 2 cols</div>
    <div>1</div>
    <div>2</div>
    <div class="tall">span 2 rows</div>
    <div>3</div>
    <div>4</div>
  </div>
</body>
</html>
```

---

**Assignment 97:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 97 — implicit grid</title>
  <style>
    .g {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.35rem;
    }
    .g > div {
      padding: 0.5rem;
      background: #fecdd3;
      border-radius: 0.25rem;
    }
  </style>
</head>
<body>
  <div class="g">
    <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div>
  </div>
</body>
</html>
```

---

**Assignment 98:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 98 — responsive gallery</title>
  <style>
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.5rem;
    }
    .gallery figure {
      margin: 0;
      aspect-ratio: 1;
      border-radius: 0.5rem;
      overflow: hidden;
    }
    .gallery img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  </style>
</head>
<body>
  <div class="gallery">
    <figure><img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&q=60" alt=""></figure>
    <figure><img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=60" alt=""></figure>
    <figure><img src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&q=60" alt=""></figure>
  </div>
</body>
</html>
```

---

**Assignment 99:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 99 — dashboard grid</title>
  <style>
    .dash {
      display: grid;
      grid-template-columns: 220px 1fr;
      grid-template-rows: 56px 1fr;
      grid-template-areas:
        "side top"
        "side main";
      min-height: 16rem;
      gap: 0.5rem;
      background: #0f172a;
      color: white;
      padding: 0.5rem;
      border-radius: 0.75rem;
    }
    .side {
      grid-area: side;
      background: #1e293b;
      border-radius: 0.5rem;
      padding: 0.75rem;
    }
    .top {
      grid-area: top;
      background: #334155;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      padding-inline: 1rem;
    }
    .main {
      grid-area: main;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.5rem;
    }
    .widget {
      background: #1e293b;
      border-radius: 0.5rem;
      padding: 0.75rem;
    }
  </style>
</head>
<body>
  <div class="dash">
    <aside class="side">Nav</aside>
    <header class="top">Top bar</header>
    <div class="main">
      <div class="widget">KPI</div>
      <div class="widget">Chart</div>
    </div>
  </div>
</body>
</html>
```

---

**Assignment 100:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 100 — magazine grid</title>
  <style>
    .mag {
      display: grid;
      grid-template-columns: 2fr 1fr;
      grid-auto-rows: 80px;
      gap: 0.5rem;
      max-width: 720px;
    }
    .mag > * {
      border-radius: 0.5rem;
      padding: 0.75rem;
      color: white;
      font-weight: 600;
    }
    .hero {
      grid-row: span 3;
      background: linear-gradient(135deg, #6366f1, #ec4899);
    }
    .tall {
      grid-row: span 2;
      background: #0ea5e9;
    }
    .small {
      background: #22c55e;
    }
  </style>
</head>
<body>
  <div class="mag">
    <div class="hero">Cover</div>
    <div class="tall">Feature</div>
    <div class="small">Note</div>
    <div class="small">Note</div>
  </div>
</body>
</html>
```

---

**Assignment 101:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 101 — grid + flex</title>
  <style>
    .cell {
      display: grid;
      place-items: stretch;
    }
    .toolbar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: #f1f5f9;
      border-radius: 0.5rem;
    }
    .toolbar .spacer {
      margin-inline-start: auto;
    }
    .layout {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="layout">
    <div class="cell">
      <div class="toolbar">
        <strong>Tools</strong>
        <button type="button">A</button>
        <button type="button">B</button>
        <span class="spacer">Right</span>
      </div>
    </div>
    <div style="padding:1rem;border:1px solid #e2e8f0;border-radius:0.5rem">Grid main</div>
  </div>
</body>
</html>
```

---

**Assignment 102:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 102 — justify/align items</title>
  <style>
    .g {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: 5rem;
      place-items: center;
      gap: 0.5rem;
      background: #fef3c7;
      padding: 0.5rem;
      border-radius: 0.5rem;
    }
    .g > div {
      width: 60%;
      height: 60%;
      background: #fb7185;
      border-radius: 0.35rem;
    }
  </style>
</head>
<body>
  <div class="g"><div></div><div></div><div></div></div>
</body>
</html>
```

---

**Assignment 103:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 103 — align/justify content</title>
  <style>
    .g {
      display: grid;
      grid-template-columns: repeat(3, 60px);
      grid-template-rows: repeat(2, 40px);
      width: 320px;
      height: 200px;
      gap: 0.35rem;
      justify-content: space-between;
      align-content: center;
      background: #e0e7ff;
      padding: 0.5rem;
      border-radius: 0.5rem;
    }
    .g > div {
      background: #4f46e5;
      border-radius: 0.25rem;
    }
  </style>
</head>
<body>
  <div class="g">
    <div></div><div></div><div></div>
    <div></div><div></div><div></div>
  </div>
</body>
</html>
```

---

**Assignment 104:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 104 — grid gap</title>
  <style>
    .g {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      row-gap: 1rem;
      column-gap: 0.5rem;
    }
    .g > div {
      background: #bbf7d0;
      padding: 0.5rem;
      border-radius: 0.35rem;
    }
  </style>
</head>
<body>
  <div class="g">
    <div>1</div><div>2</div><div>3</div>
    <div>4</div><div>5</div><div>6</div>
  </div>
</body>
</html>
```

---

**Assignment 105:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 105 — calendar grid</title>
  <style>
    .cal {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background: #cbd5e1;
      border: 1px solid #cbd5e1;
      max-width: 420px;
    }
    .cal > div {
      aspect-ratio: 1;
      display: grid;
      place-items: center;
      background: white;
      font-size: 0.85rem;
    }
    .cal .head {
      aspect-ratio: auto;
      min-height: 2rem;
      font-weight: 600;
      background: #f8fafc;
    }
  </style>
</head>
<body>
  <div class="cal">
    <div class="head">S</div><div class="head">M</div><div class="head">T</div><div class="head">W</div><div class="head">T</div><div class="head">F</div><div class="head">S</div>
    <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div>
  </div>
</body>
</html>
```

---

**Assignment 106:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 106 — pricing grid</title>
  <style>
    .pricing {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
      max-width: 900px;
    }
    .plan {
      display: grid;
      grid-template-rows: auto auto 1fr auto;
      gap: 0.5rem;
      padding: 1.25rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      background: white;
    }
    .plan h3 {
      margin: 0;
    }
    .price {
      font-size: 1.75rem;
      font-weight: 800;
    }
    .plan ul {
      margin: 0;
      padding-inline-start: 1.1rem;
    }
  </style>
</head>
<body>
  <div class="pricing">
    <div class="plan">
      <h3>Starter</h3>
      <div class="price">$0</div>
      <ul><li>Feature</li></ul>
      <button type="button">Choose</button>
    </div>
    <div class="plan">
      <h3>Pro</h3>
      <div class="price">$19</div>
      <ul><li>More</li></ul>
      <button type="button">Choose</button>
    </div>
    <div class="plan">
      <h3>Team</h3>
      <div class="price">$49</div>
      <ul><li>All</li></ul>
      <button type="button">Choose</button>
    </div>
  </div>
</body>
</html>
```

---

**Assignment 107:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 107 — subgrid</title>
  <style>
    .parent {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      max-width: 480px;
    }
    .card {
      display: grid;
      grid-template-rows: subgrid;
      grid-row: span 3;
      gap: 0.35rem;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      background: #f8fafc;
    }
    .card h3 {
      margin: 0;
      font-size: 1rem;
    }
    .card p {
      margin: 0;
      font-size: 0.875rem;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="parent">
    <article class="card">
      <h3>Alpha</h3>
      <p>Aligned rows</p>
      <button type="button">Go</button>
    </article>
    <article class="card">
      <h3>Beta longer title</h3>
      <p>More text in second row</p>
      <button type="button">Go</button>
    </article>
    <article class="card">
      <h3>Gamma</h3>
      <p>Short</p>
      <button type="button">Go</button>
    </article>
  </div>
</body>
</html>
```

---

**Assignment 108:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 108 — subgrid fallback</title>
  <style>
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .card {
      flex: 1 1 200px;
      display: flex;
      flex-direction: column;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
    }
    .card button {
      margin-top: auto;
    }
    @supports (grid-template-rows: subgrid) {
      .row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }
      .card {
        display: grid;
        grid-template-rows: subgrid;
        grid-row: span 3;
      }
    }
  </style>
</head>
<body>
  <div class="row">
    <article class="card"><h3>A</h3><p>Text</p><button type="button">OK</button></article>
    <article class="card"><h3>B</h3><p>Longer text block</p><button type="button">OK</button></article>
  </div>
</body>
</html>
```

---

**Assignment 109:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 109 — mobile-first MQ</title>
  <style>
    .grid {
      display: grid;
      gap: 0.75rem;
    }
    @media (min-width: 600px) {
      .grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (min-width: 960px) {
      .grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    .grid > div {
      padding: 1rem;
      background: #e0f2fe;
      border-radius: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="grid">
    <div>1</div><div>2</div><div>3</div><div>4</div>
  </div>
</body>
</html>
```

---

**Assignment 110:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 110 — breakpoints</title>
  <style>
    body::after {
      content: "default";
      display: block;
      margin: 1rem;
      font-weight: 700;
    }
    @media (min-width: 480px) {
      body::after {
        content: "phone landscape / large phone";
      }
    }
    @media (min-width: 768px) {
      body::after {
        content: "tablet";
      }
    }
    @media (min-width: 1024px) {
      body::after {
        content: "desktop";
      }
    }
  </style>
</head>
<body>
  <p>Resize to see breakpoint label (demo).</p>
</body>
</html>
```

---

**Assignment 111:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 111 — fluid type clamp</title>
  <style>
    h1 {
      font-size: clamp(1.75rem, 2vw + 1rem, 3rem);
      line-height: 1.1;
    }
    p {
      font-size: clamp(1rem, 0.35vw + 0.9rem, 1.125rem);
    }
  </style>
</head>
<body>
  <h1>Fluid heading</h1>
  <p>Resize viewport — type scales smoothly.</p>
</body>
</html>
```

---

**Assignment 112:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 112 — responsive images</title>
  <style>
    figure {
      margin: 0;
      max-width: min(100%, 640px);
    }
    img {
      display: block;
      width: 100%;
      height: auto;
      border-radius: 0.5rem;
    }
    .cover {
      aspect-ratio: 16 / 9;
      object-fit: cover;
    }
  </style>
</head>
<body>
  <figure>
    <img class="cover" src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=60" alt="Landscape">
  </figure>
</body>
</html>
```

---

**Assignment 113:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 113 — responsive table</title>
  <style>
    .table-wrap {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
    }
    table {
      width: 100%;
      min-width: 520px;
      border-collapse: collapse;
    }
    th, td {
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
    }
  </style>
</head>
<body>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Col A</th><th>Col B</th><th>Col C</th><th>Col D</th></tr></thead>
      <tbody>
        <tr><td>1</td><td>2</td><td>3</td><td>4</td></tr>
        <tr><td>5</td><td>6</td><td>7</td><td>8</td></tr>
      </tbody>
    </table>
  </div>
</body>
</html>
```

---

**Assignment 114:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 114 — hamburger CSS</title>
  <style>
    .nav-toggle {
      display: none;
    }
    .burger {
      display: none;
      flex-direction: column;
      gap: 4px;
      cursor: pointer;
      padding: 0.5rem;
    }
    .burger span {
      width: 22px;
      height: 2px;
      background: #0f172a;
      border-radius: 1px;
    }
    nav ul {
      display: flex;
      gap: 1rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    @media (max-width: 640px) {
      .burger {
        display: flex;
      }
      nav ul {
        display: none;
        flex-direction: column;
        padding: 0.5rem 0;
      }
      .nav-toggle:checked ~ ul {
        display: flex;
      }
    }
  </style>
</head>
<body>
  <nav>
    <input type="checkbox" id="nt" class="nav-toggle" aria-hidden="true">
    <label class="burger" for="nt" aria-label="Menu"><span></span><span></span><span></span></label>
    <ul>
      <li><a href="#">Home</a></li>
      <li><a href="#">About</a></li>
    </ul>
  </nav>
</body>
</html>
```

---

**Assignment 115:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 115 — responsive cards</title>
  <style>
    .cards {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    @media (min-width: 640px) {
      .cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (min-width: 1024px) {
      .cards {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    article {
      padding: 1rem;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      background: white;
    }
  </style>
</head>
<body>
  <div class="cards">
    <article><h3>One</h3><p>Text</p></article>
    <article><h3>Two</h3><p>Text</p></article>
    <article><h3>Three</h3><p>Text</p></article>
  </div>
</body>
</html>
```

---

**Assignment 116:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 116 — hide table columns</title>
  <style>
    th.optional,
    td.optional {
      display: table-cell;
    }
    @media (max-width: 600px) {
      th.optional,
      td.optional {
        display: none;
      }
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 0.35rem 0.5rem;
    }
  </style>
</head>
<body>
  <table>
    <thead>
      <tr><th>Name</th><th class="optional">SKU</th><th>Price</th></tr>
    </thead>
    <tbody>
      <tr><td>Item</td><td class="optional">X1</td><td>$10</td></tr>
    </tbody>
  </table>
</body>
</html>
```

---

**Assignment 117:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 117 — container queries</title>
  <style>
    .card-wrap {
      container-type: inline-size;
      container-name: card;
      max-width: 100%;
    }
    .card {
      display: grid;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
    }
    @container card (min-width: 320px) {
      .card {
        grid-template-columns: 80px 1fr;
        align-items: center;
      }
    }
  </style>
</head>
<body>
  <div class="card-wrap" style="width:280px;resize:horizontal;overflow:auto;border:1px dashed #cbd5e1;padding:4px">
    <div class="card">
      <div style="width:80px;height:80px;background:#bae6fd;border-radius:0.5rem"></div>
      <div><strong>Narrow stacks</strong><p>Widen container → two columns.</p></div>
    </div>
  </div>
</body>
</html>
```

---

**Assignment 118:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 118 — landing section fluid</title>
  <style>
    section {
      padding: clamp(2rem, 6vw, 5rem) clamp(1rem, 4vw, 3rem);
      background: linear-gradient(135deg, #0f172a, #312e81);
      color: white;
    }
    .inner {
      max-width: 56rem;
      margin-inline: auto;
    }
    h1 {
      font-size: clamp(2rem, 4vw + 1rem, 3.25rem);
    }
  </style>
</head>
<body>
  <section>
    <div class="inner">
      <h1>Responsive landing</h1>
      <p>Fluid padding and constrained content width.</p>
    </div>
  </section>
</body>
</html>
```

---

**Assignment 119:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 119 — transition</title>
  <style>
    .box {
      width: 120px;
      height: 120px;
      border-radius: 0.75rem;
      background: #6366f1;
      transition: opacity 0.35s ease, transform 0.35s ease;
    }
    .box:hover {
      opacity: 0.85;
      transform: translateY(-6px) scale(1.03);
    }
  </style>
</head>
<body>
  <div class="box" tabindex="0" role="img" aria-label="Hover me"></div>
</body>
</html>
```

---

**Assignment 120:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 120 — timing functions</title>
  <style>
    .track {
      display: grid;
      gap: 0.75rem;
      max-width: 360px;
    }
    .ball {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #f97316;
      translate: 0 0;
      transition: translate 1s;
    }
    .track:hover .ease {
      translate: 280px 0;
      transition-timing-function: ease;
    }
    .track:hover .ease-in-out {
      translate: 280px 0;
      transition-timing-function: ease-in-out;
    }
    .track:hover .linear {
      translate: 280px 0;
      transition-timing-function: linear;
    }
    .track:hover .bezier {
      translate: 280px 0;
      transition-timing-function: cubic-bezier(0.68, -0.55, 0.27, 1.55);
    }
  </style>
</head>
<body>
  <p>Hover track</p>
  <div class="track">
    <div class="ball ease"></div>
    <div class="ball ease-in-out"></div>
    <div class="ball linear"></div>
    <div class="ball bezier"></div>
  </div>
</body>
</html>
```

---

**Assignment 121:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 121 — translate</title>
  <style>
    .layer {
      position: relative;
      height: 4rem;
      background: #f1f5f9;
      border-radius: 0.5rem;
    }
    .floated {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: #22c55e;
      color: white;
      border-radius: 0.35rem;
      transform: translate(24px, 10px);
    }
  </style>
</head>
<body>
  <div class="layer"><span class="floated">Shifted</span></div>
</body>
</html>
```

---

**Assignment 122:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 122 — rotate & origin</title>
  <style>
    .icon {
      width: 3rem;
      height: 3rem;
      background: #e9d5ff;
      border-radius: 0.5rem;
      transform-origin: bottom right;
      transition: transform 0.4s ease;
    }
    .icon:hover {
      transform: rotate(-12deg);
    }
  </style>
</head>
<body>
  <div class="icon" aria-hidden="true"></div>
</body>
</html>
```

---

**Assignment 123:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 123 — scale hover</title>
  <style>
    button {
      font: inherit;
      padding: 0.6rem 1.2rem;
      border: none;
      border-radius: 0.5rem;
      background: #0ea5e9;
      color: white;
      cursor: pointer;
      box-shadow: 0 4px 14px rgb(14 165 233 / 0.35);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    button:hover {
      transform: scale(1.04);
      box-shadow: 0 8px 24px rgb(14 165 233 / 0.45);
    }
  </style>
</head>
<body>
  <button type="button">Scale up</button>
</body>
</html>
```

---

**Assignment 124:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 124 — skew</title>
  <style>
    .banner {
      display: inline-block;
      padding: 0.35rem 1.25rem;
      background: #fde047;
      transform: skewX(-8deg);
      font-weight: 700;
    }
    .banner span {
      display: inline-block;
      transform: skewX(8deg);
    }
  </style>
</head>
<body>
  <div class="banner"><span>Sale</span></div>
</body>
</html>
```

---

**Assignment 125:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 125 — combined transform</title>
  <style>
    .chip {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: #334155;
      color: white;
      border-radius: 999px;
      transition: transform 0.35s ease;
    }
    .chip:hover {
      transform: translateY(-4px) rotate(-3deg) scale(1.05);
    }
  </style>
</head>
<body>
  <span class="chip">Hover</span>
</body>
</html>
```

---

**Assignment 126:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 126 — hover lift cards</title>
  <style>
    .card {
      max-width: 220px;
      padding: 1rem;
      border-radius: 0.75rem;
      background: white;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 12px rgb(15 23 42 / 0.06);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 40px rgb(15 23 42 / 0.12);
    }
  </style>
</head>
<body>
  <article class="card"><h3>Lift</h3><p>Hover me</p></article>
</body>
</html>
```

---

**Assignment 127:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 127 — flip card</title>
  <style>
    .scene {
      width: 200px;
      height: 260px;
      perspective: 800px;
    }
    .flip {
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 0.7s ease;
    }
    .scene:hover .flip {
      transform: rotateY(180deg);
    }
    .face {
      position: absolute;
      inset: 0;
      backface-visibility: hidden;
      border-radius: 0.75rem;
      display: grid;
      place-items: center;
      font-weight: 700;
    }
    .front {
      background: #93c5fd;
    }
    .back {
      background: #fca5a5;
      transform: rotateY(180deg);
    }
  </style>
</head>
<body>
  <div class="scene">
    <div class="flip">
      <div class="face front">Front</div>
      <div class="face back">Back</div>
    </div>
  </div>
</body>
</html>
```

---

**Assignment 128:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 128 — spinner</title>
  <style>
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    .spinner {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 3px solid #e2e8f0;
      border-top-color: #2563eb;
      animation: spin 0.8s linear infinite;
    }
  </style>
</head>
<body>
  <div class="spinner" role="status" aria-label="Loading"></div>
</body>
</html>
```

---

**Assignment 129:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 129 — keyframes fade</title>
  <style>
    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    .box {
      padding: 1rem;
      background: #d9f99d;
      border-radius: 0.5rem;
      animation: fade-in 1s ease forwards;
    }
  </style>
</head>
<body>
  <div class="box">Fades in on load</div>
</body>
</html>
```

---

**Assignment 130:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 130 — animation props</title>
  <style>
    @keyframes move {
      from {
        translate: 0 0;
      }
      to {
        translate: 120px 0;
      }
    }
    .dot {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #ec4899;
      animation-name: move;
      animation-duration: 1.2s;
      animation-timing-function: ease-in-out;
      animation-delay: 0.2s;
      animation-iteration-count: 2;
      animation-direction: alternate;
      animation-fill-mode: both;
    }
  </style>
</head>
<body>
  <div class="dot"></div>
</body>
</html>
```

---

**Assignment 131:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 131 — infinite pulse</title>
  <style>
    @keyframes pulse {
      50% {
        transform: scale(1.15);
        opacity: 0.85;
      }
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #ef4444;
      animation: pulse 1.2s ease-in-out infinite;
    }
  </style>
</head>
<body>
  <span class="dot" aria-hidden="true"></span>
</body>
</html>
```

---

**Assignment 132:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 132 — progress bar</title>
  <style>
    @keyframes grow {
      from {
        width: 0%;
      }
      to {
        width: 100%;
      }
    }
    .bar {
      height: 10px;
      border-radius: 999px;
      background: #e2e8f0;
      overflow: hidden;
    }
    .fill {
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, #22c55e, #16a34a);
      animation: grow 2.5s ease-out forwards;
    }
  </style>
</head>
<body>
  <div class="bar"><div class="fill" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div></div>
</body>
</html>
```

---

**Assignment 133:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 133 — typewriter</title>
  <style>
    @keyframes typing {
      from {
        width: 0;
      }
      to {
        width: 22ch;
      }
    }
    @keyframes blink {
      50% {
        border-color: transparent;
      }
    }
    .tw {
      font-family: ui-monospace, monospace;
      overflow: hidden;
      white-space: nowrap;
      border-right: 3px solid #0f172a;
      width: 0;
      animation: typing 3.5s steps(22, end) forwards, blink 0.7s step-end infinite;
    }
  </style>
</head>
<body>
  <p class="tw">Hello — CSS typewriter.</p>
</body>
</html>
```

---

**Assignment 134:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 134 — bouncing ball</title>
  <style>
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
        animation-timing-function: ease-out;
      }
      50% {
        transform: translateY(-80px);
        animation-timing-function: ease-in;
      }
    }
    .stage {
      height: 120px;
      display: flex;
      align-items: flex-end;
      border-bottom: 3px solid #334155;
      width: 120px;
    }
    .ball {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #fef08a, #ca8a04);
      animation: bounce 0.9s infinite;
    }
  </style>
</head>
<body>
  <div class="stage"><div class="ball"></div></div>
</body>
</html>
```

---

**Assignment 135:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 135 — stagger fade</title>
  <style>
    @keyframes up {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    li {
      opacity: 0;
      animation: up 0.5s ease forwards;
    }
    li:nth-child(1) {
      animation-delay: 0.05s;
    }
    li:nth-child(2) {
      animation-delay: 0.15s;
    }
    li:nth-child(3) {
      animation-delay: 0.25s;
    }
    li:nth-child(4) {
      animation-delay: 0.35s;
    }
  </style>
</head>
<body>
  <ul>
    <li>One</li>
    <li>Two</li>
    <li>Three</li>
    <li>Four</li>
  </ul>
</body>
</html>
```

---

**Assignment 136:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 136 — slide drawer</title>
  <style>
    @keyframes slide-in {
      from {
        transform: translateX(-100%);
      }
      to {
        transform: translateX(0);
      }
    }
    .drawer {
      width: min(100%, 260px);
      min-height: 100vh;
      background: #1e293b;
      color: white;
      padding: 1rem;
      animation: slide-in 0.45s ease-out;
    }
  </style>
</head>
<body>
  <aside class="drawer">Drawer panel</aside>
</body>
</html>
```

---

**Assignment 137:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 137 — breathing glow</title>
  <style>
    @keyframes glow {
      50% {
        box-shadow: 0 0 0 6px rgb(99 102 241 / 0.35), 0 0 32px rgb(99 102 241 / 0.45);
      }
    }
    button {
      font: inherit;
      padding: 0.55rem 1.1rem;
      border: none;
      border-radius: 999px;
      background: #4f46e5;
      color: white;
      cursor: pointer;
      animation: glow 2s ease-in-out infinite;
    }
  </style>
</head>
<body>
  <button type="button">Glow</button>
</body>
</html>
```

---

**Assignment 138:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 138 — skeleton</title>
  <style>
    @keyframes shimmer {
      100% {
        translate: 100% 0;
      }
    }
    .sk {
      position: relative;
      overflow: hidden;
      height: 14px;
      border-radius: 4px;
      background: #e2e8f0;
      margin-block: 0.5rem;
    }
    .sk::after {
      content: "";
      position: absolute;
      inset: 0;
      translate: -100% 0;
      background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.55), transparent);
      animation: shimmer 1.2s infinite;
    }
  </style>
</head>
<body>
  <div class="sk" style="width:80%"></div>
  <div class="sk" style="width:60%"></div>
  <div class="sk" style="width:40%"></div>
</body>
</html>
```

---

**Assignment 139:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 139 — scroll-driven</title>
  <style>
    @keyframes reveal {
      from {
        opacity: 0.2;
        transform: scale(0.96);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    .card {
      min-height: 40vh;
      margin: 2rem 1rem;
      border-radius: 1rem;
      background: #c7d2fe;
      animation: reveal linear both;
      animation-timeline: view();
      animation-range: entry 0% cover 40%;
    }
  </style>
</head>
<body>
  <p style="min-height:120vh;padding:1rem">Scroll down — cards use view() timeline where supported.</p>
  <div class="card"></div>
  <div class="card"></div>
</body>
</html>
```

---

**Assignment 140:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 140 — animated gradient</title>
  <style>
    @keyframes shift {
      0% {
        background-position: 0% 50%;
      }
      100% {
        background-position: 100% 50%;
      }
    }
    .banner {
      padding: 1.25rem;
      border-radius: 0.75rem;
      color: white;
      font-weight: 700;
      background: linear-gradient(90deg, #6366f1, #ec4899, #22d3ee, #6366f1);
      background-size: 300% 100%;
      animation: shift 6s linear infinite;
    }
  </style>
</head>
<body>
  <div class="banner">Live gradient banner</div>
</body>
</html>
```

---

**Assignment 141:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 141 — custom properties</title>
  <style>
    :root {
      --color-fg: #0f172a;
      --color-bg: #f8fafc;
      --space-1: 0.5rem;
      --space-2: 1rem;
      --radius: 0.75rem;
    }
    body {
      background: var(--color-bg);
      color: var(--color-fg);
      font-family: system-ui, sans-serif;
      padding: var(--space-2);
    }
    .card {
      padding: var(--space-2);
      border-radius: var(--radius);
      border: 1px solid #e2e8f0;
      background: white;
    }
  </style>
</head>
<body>
  <div class="card">Token-driven spacing and radius</div>
</body>
</html>
```

---

**Assignment 142:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 142 — var fallback</title>
  <style>
    .pill {
      --pill-bg: var(--missing-token, #dbeafe);
      --pill-fg: var(--missing-token-2, #1e3a8a);
      display: inline-block;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      background: var(--pill-bg);
      color: var(--pill-fg);
    }
  </style>
</head>
<body>
  <span class="pill">Uses fallbacks</span>
</body>
</html>
```

---

**Assignment 143:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 143 — theme class</title>
  <style>
    :root {
      --bg: #ffffff;
      --fg: #0f172a;
      --card: #f1f5f9;
    }
    html.theme-dark {
      --bg: #0f172a;
      --fg: #f8fafc;
      --card: #1e293b;
    }
    body {
      margin: 0;
      min-height: 100vh;
      background: var(--bg);
      color: var(--fg);
      font-family: system-ui, sans-serif;
      padding: 1rem;
    }
    .card {
      padding: 1rem;
      border-radius: 0.75rem;
      background: var(--card);
    }
  </style>
</head>
<body>
  <div class="card">Toggle class <code>theme-dark</code> on <code>html</code>.</div>
</body>
</html>
```

---

**Assignment 144:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 144 — calc()</title>
  <style>
    .row {
      display: flex;
      gap: 1rem;
    }
    .side {
      flex: 0 0 200px;
      background: #e2e8f0;
      padding: 0.75rem;
      border-radius: 0.5rem;
    }
    .main {
      flex: 1 1 auto;
      width: calc(100% - 200px - 1rem);
      min-width: 0;
      background: #fef3c7;
      padding: 0.75rem;
      border-radius: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="row">
    <aside class="side">200px</aside>
    <main class="main">calc width minus gap</main>
  </div>
</body>
</html>
```

---

**Assignment 145:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 145 — min max clamp</title>
  <style>
    .box {
      width: min(100%, 480px);
      padding: clamp(0.75rem, 2vw, 1.5rem);
      font-size: max(1rem, 0.5vw + 0.85rem);
      border-radius: 0.75rem;
      background: #ddd6fe;
    }
  </style>
</head>
<body>
  <div class="box">Responsive padding and font floor</div>
</body>
</html>
```

---

**Assignment 146:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 146 — spacing scale</title>
  <style>
    :root {
      --s-1: 0.25rem;
      --s-2: 0.5rem;
      --s-3: 1rem;
      --s-4: 1.5rem;
    }
    .stack > * + * {
      margin-block-start: var(--s-3);
    }
    .p-3 {
      padding: var(--s-3);
    }
    .card {
      padding: var(--s-4);
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="stack">
    <div class="card p-3">A</div>
    <div class="card p-3">B</div>
  </div>
</body>
</html>
```

---

**Assignment 147:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 147 — color-scheme</title>
  <style>
    :root {
      color-scheme: light dark;
      --surface: light-dark(#ffffff, #0f172a);
      --text: light-dark(#0f172a, #f8fafc);
    }
    body {
      margin: 0;
      min-height: 100vh;
      background: var(--surface);
      color: var(--text);
      font-family: system-ui, sans-serif;
      padding: 1rem;
    }
  </style>
</head>
<body>
  <p>Uses OS light/dark where <code>light-dark()</code> is supported; falls back gracefully.</p>
</body>
</html>
```

---

**Assignment 148:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 148 — gradient token</title>
  <style>
    :root {
      --grad-brand: linear-gradient(120deg, #6366f1, #a855f7);
    }
    .btn {
      border: none;
      padding: 0.55rem 1rem;
      border-radius: 0.5rem;
      color: white;
      font-weight: 600;
      background: var(--grad-brand);
      cursor: pointer;
    }
    .hero {
      margin-top: 1rem;
      min-height: 6rem;
      border-radius: 0.75rem;
      background: var(--grad-brand);
    }
  </style>
</head>
<body>
  <button class="btn" type="button">Brand</button>
  <div class="hero" aria-hidden="true"></div>
</body>
</html>
```

---

**Assignment 149:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 149 — vars + media</title>
  <style>
    :root {
      --cols: 1;
    }
    @media (min-width: 640px) {
      :root {
        --cols: 2;
      }
    }
    @media (min-width: 1024px) {
      :root {
        --cols: 3;
      }
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(var(--cols), 1fr);
      gap: 0.5rem;
    }
    .grid > div {
      padding: 0.75rem;
      background: #bae6fd;
      border-radius: 0.35rem;
    }
  </style>
</head>
<body>
  <div class="grid"><div>1</div><div>2</div><div>3</div><div>4</div></div>
</body>
</html>
```

---

**Assignment 150:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 150 — density toggle</title>
  <style>
    :root {
      --density: 1;
    }
    html.compact {
      --density: 0.65;
    }
    body {
      font-family: system-ui, sans-serif;
      padding: calc(1rem * var(--density));
    }
    .row {
      display: flex;
      gap: calc(0.75rem * var(--density));
      margin-block-end: calc(0.75rem * var(--density));
    }
    button {
      padding: calc(0.5rem * var(--density)) calc(1rem * var(--density));
      font: inherit;
    }
  </style>
</head>
<body>
  <div class="row">
    <button type="button">A</button>
    <button type="button">B</button>
  </div>
  <p>Add class <code>compact</code> on <code>html</code> for tighter spacing.</p>
</body>
</html>
```

---

**Assignment 151:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 151 — :is()</title>
  <style>
    :is(a, button):is(:hover, :focus-visible) {
      outline: 2px solid #38bdf8;
      outline-offset: 2px;
    }
  </style>
</head>
<body>
  <p><a href="#">Link</a> <button type="button">Btn</button></p>
</body>
</html>
```

---

**Assignment 152:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 152 — :where()</title>
  <style>
    :where(h1, h2, h3) {
      margin-block: 0.5em;
      font-weight: 700;
    }
    h2 {
      color: #7c3aed;
    }
  </style>
</head>
<body>
  <h1>Title</h1>
  <h2>Subtitle wins color — :where keeps zero specificity</h2>
</body>
</html>
```

---

**Assignment 153:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 153 — :has()</title>
  <style>
    article {
      padding: 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
    }
    article:has(img) {
      display: grid;
      grid-template-columns: 100px 1fr;
      gap: 1rem;
      align-items: start;
      border-color: #6366f1;
    }
    article img {
      width: 100%;
      border-radius: 0.5rem;
      display: block;
    }
  </style>
</head>
<body>
  <article>
    <p>No image — single column.</p>
  </article>
  <article>
    <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=200&q=60" alt="">
    <div><h3>With image</h3><p>Layout changes via :has</p></div>
  </article>
</body>
</html>
```

---

**Assignment 154:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 154 — :not()</title>
  <style>
    .list button:not(:disabled) {
      background: #2563eb;
      color: white;
      border: none;
      padding: 0.35rem 0.65rem;
      border-radius: 0.35rem;
      cursor: pointer;
    }
    .list button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  </style>
</head>
<body>
  <div class="list">
    <button type="button">Active</button>
    <button type="button" disabled>Disabled</button>
  </div>
</body>
</html>
```

---

**Assignment 155:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 155 — @container</title>
  <style>
    .wrap {
      container-type: inline-size;
      container-name: promo;
      resize: horizontal;
      overflow: auto;
      max-width: 100%;
      border: 1px dashed #94a3b8;
      padding: 4px;
    }
    .promo {
      padding: 1rem;
      border-radius: 0.75rem;
      background: #fef9c3;
    }
    @container promo (max-width: 280px) {
      .promo {
        font-size: 0.9rem;
        background: #fee2e2;
      }
    }
  </style>
</head>
<body>
  <div class="wrap" style="width:360px">
    <div class="promo">Narrow the container → styles change.</div>
  </div>
</body>
</html>
```

---

**Assignment 156:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 156 — @layer</title>
  <style>
    @layer base, components, utilities;
    @layer base {
      body {
        margin: 0;
        font-family: system-ui, sans-serif;
        color: #334155;
      }
    }
    @layer components {
      .btn {
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        border: 1px solid #cbd5e1;
        background: #f8fafc;
      }
    }
    @layer utilities {
      .btn.primary {
        background: #2563eb;
        color: white;
        border-color: transparent;
      }
    }
  </style>
</head>
<body>
  <button class="btn primary" type="button">Layered button</button>
</body>
</html>
```

---

**Assignment 157:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 157 — nesting</title>
  <style>
    .card {
      padding: 1rem;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      & h3 {
        margin: 0 0 0.5rem;
      }
      &:hover {
        border-color: #6366f1;
        box-shadow: 0 8px 24px rgb(99 102 241 / 0.12);
      }
    }
  </style>
</head>
<body>
  <article class="card"><h3>Nested rules</h3><p>Hover the card</p></article>
</body>
</html>
```

---

**Assignment 158:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 158 — @scope</title>
  <style>
    @scope (.scoped) {
      p {
        color: #b45309;
      }
      a {
        color: #0369a1;
      }
    }
    p {
      color: #64748b;
    }
  </style>
</head>
<body>
  <p>Outside scope — gray</p>
  <div class="scoped">
    <p>Inside @scope — amber</p>
    <a href="#">Scoped link color</a>
  </div>
</body>
</html>
```

---

**Assignment 159:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 159 — :has() validation</title>
  <style>
    label {
      display: grid;
      gap: 0.35rem;
      max-width: 280px;
    }
    input {
      font: inherit;
      padding: 0.45rem 0.6rem;
      border-radius: 0.35rem;
      border: 1px solid #cbd5e1;
    }
    label:has(input:invalid:not(:placeholder-shown)) input {
      border-color: #ef4444;
    }
    label:has(input:valid) input {
      border-color: #22c55e;
    }
  </style>
</head>
<body>
  <label>
    Email
    <input type="email" placeholder="a@b.co" required>
  </label>
</body>
</html>
```

---

**Assignment 160:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 160 — hover + focus-within menu</title>
  <style>
    .menu {
      position: relative;
      display: inline-block;
    }
    .menu button {
      font: inherit;
      padding: 0.4rem 0.75rem;
    }
    .panel {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      min-width: 160px;
      padding: 0.35rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.35rem;
      box-shadow: 0 10px 30px rgb(0 0 0 / 0.08);
    }
    .menu:hover .panel,
    .menu:focus-within .panel {
      display: block;
    }
    .panel a {
      display: block;
      padding: 0.35rem 0.5rem;
      color: #0f172a;
      text-decoration: none;
    }
    .panel a:hover {
      background: #f1f5f9;
    }
  </style>
</head>
<body>
  <div class="menu">
    <button type="button">Menu ▾</button>
    <div class="panel" role="menu">
      <a href="#" role="menuitem">One</a>
      <a href="#" role="menuitem">Two</a>
    </div>
  </div>
</body>
</html>
```

---

**Assignment 161:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 161 — subgrid alignment</title>
  <style>
    .products {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      max-width: 720px;
    }
    .product {
      display: grid;
      grid-template-rows: subgrid;
      grid-row: span 4;
      gap: 0.35rem;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
    }
    .product img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 0.35rem;
    }
    .price {
      font-weight: 700;
      margin-top: auto;
    }
  </style>
</head>
<body>
  <div class="products">
    <article class="product">
      <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=200&q=60" alt="">
      <h3>Short</h3>
      <p>Text</p>
      <p class="price">$12</p>
    </article>
    <article class="product">
      <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&q=60" alt="">
      <h3>Longer product name</h3>
      <p>More description lines align across the row.</p>
      <p class="price">$24</p>
    </article>
    <article class="product">
      <img src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&q=60" alt="">
      <h3>Mid</h3>
      <p>OK</p>
      <p class="price">$18</p>
    </article>
  </div>
</body>
</html>
```

---

**Assignment 162:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 162 — masonry-like grid</title>
  <style>
    .masonry {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      grid-auto-rows: 40px;
      grid-auto-flow: dense;
      gap: 0.5rem;
    }
    .masonry > div {
      border-radius: 0.35rem;
      background: #c4b5fd;
      padding: 0.5rem;
    }
    .masonry .t2 {
      grid-row: span 2;
    }
    .masonry .t3 {
      grid-row: span 3;
    }
  </style>
</head>
<body>
  <div class="masonry">
    <div class="t3">A</div>
    <div class="t2">B</div>
    <div>C</div>
    <div class="t2">D</div>
    <div class="t3">E</div>
    <div>F</div>
  </div>
</body>
</html>
```

---

**Assignment 163:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 163 — aspect-ratio layouts</title>
  <style>
    .tiles {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      max-width: 540px;
    }
    .tiles figure {
      margin: 0;
      aspect-ratio: 3 / 4;
      border-radius: 0.5rem;
      overflow: hidden;
    }
    .tiles img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  </style>
</head>
<body>
  <div class="tiles">
    <figure><img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&q=60" alt=""></figure>
    <figure><img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=60" alt=""></figure>
    <figure><img src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&q=60" alt=""></figure>
  </div>
</body>
</html>
```

---

**Assignment 164:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 164 — logical properties</title>
  <style>
    .card {
      max-width: 20rem;
      margin-inline: auto;
      padding-block: 1rem;
      padding-inline: 1.25rem;
      border-inline-start: 4px solid #6366f1;
      border-block-end: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      background: #f8fafc;
    }
  </style>
</head>
<body>
  <div class="card">Logical margin, padding, and borders adapt to writing direction.</div>
</body>
</html>
```

---

**Assignment 165:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 165 — writing-mode</title>
  <style>
    .side-label {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      font-weight: 700;
      letter-spacing: 0.2em;
      padding-inline: 0.5rem;
      border-inline-end: 2px solid #cbd5e1;
    }
    .row {
      display: flex;
      gap: 1rem;
      align-items: stretch;
      min-height: 8rem;
    }
    .content {
      flex: 1;
    }
  </style>
</head>
<body>
  <div class="row">
    <div class="side-label">SECTION</div>
    <div class="content"><p>Main content beside vertical label.</p></div>
  </div>
</body>
</html>
```

---

**Assignment 166:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 166 — scroll-snap</title>
  <style>
    .track {
      display: flex;
      gap: 0.75rem;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding: 0.5rem;
      max-width: 100%;
    }
    .slide {
      flex: 0 0 80%;
      scroll-snap-align: center;
      min-height: 140px;
      border-radius: 0.75rem;
      background: linear-gradient(135deg, #93c5fd, #c4b5fd);
    }
  </style>
</head>
<body>
  <div class="track">
    <div class="slide"></div>
    <div class="slide"></div>
    <div class="slide"></div>
  </div>
</body>
</html>
```

---

**Assignment 167:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 167 — snap align</title>
  <style>
    .scroller {
      height: 200px;
      overflow-y: auto;
      scroll-snap-type: y proximity;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
    }
    .panel {
      scroll-snap-align: center;
      min-height: 180px;
      display: grid;
      place-items: center;
      font-size: 1.5rem;
      font-weight: 700;
    }
    .panel:nth-child(odd) {
      background: #fef3c7;
    }
    .panel:nth-child(even) {
      background: #dbeafe;
    }
  </style>
</head>
<body>
  <div class="scroller">
    <div class="panel">1</div>
    <div class="panel">2</div>
    <div class="panel">3</div>
  </div>
</body>
</html>
```

---

**Assignment 168:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 168 — sticky sidebar</title>
  <style>
    body {
      margin: 0;
      font-family: system-ui, sans-serif;
    }
    .layout {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: 1.5rem;
      max-width: 900px;
      margin-inline: auto;
      padding: 1rem;
    }
    aside {
      position: sticky;
      top: 1rem;
      align-self: start;
      padding: 1rem;
      background: #f1f5f9;
      border-radius: 0.5rem;
    }
    article {
      min-height: 180vh;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="layout">
    <aside>Sticky sidebar</aside>
    <article>Long article — sidebar stays in view while scrolling.</article>
  </div>
</body>
</html>
```

---

**Assignment 169:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 169 — sticky in grid dashboard</title>
  <style>
    .dash {
      display: grid;
      grid-template-columns: 200px 1fr;
      grid-template-rows: auto 1fr;
      grid-template-areas: "side top" "side main";
      min-height: 100dvh;
      gap: 0.5rem;
      padding: 0.5rem;
      background: #0f172a;
    }
    .side {
      grid-area: side;
      background: #1e293b;
      color: white;
      padding: 1rem;
      border-radius: 0.5rem;
      position: sticky;
      top: 0;
      align-self: start;
      max-height: 100dvh;
      overflow: auto;
    }
    .top {
      grid-area: top;
      background: #334155;
      color: white;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      position: sticky;
      top: 0;
      z-index: 2;
    }
    .main {
      grid-area: main;
      background: #f8fafc;
      border-radius: 0.5rem;
      padding: 1rem;
      min-height: 150vh;
    }
  </style>
</head>
<body>
  <div class="dash">
    <aside class="side">Nav</aside>
    <header class="top">Toolbar</header>
    <main class="main">Scrollable widgets area</main>
  </div>
</body>
</html>
```

---

**Assignment 170:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 170 — dvh grid</title>
  <style>
    body {
      margin: 0;
      min-height: 100dvh;
      display: grid;
      grid-template-rows: auto 1fr auto;
      font-family: system-ui, sans-serif;
    }
    header, footer {
      padding: 1rem;
      background: #1e293b;
      color: white;
    }
    main {
      padding: 1rem;
      overflow: auto;
    }
  </style>
</head>
<body>
  <header>Header</header>
  <main>Main fills remaining dynamic viewport height.</main>
  <footer>Footer</footer>
</body>
</html>
```

---

**Assignment 171:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 171 — accent-color</title>
  <style>
    :root {
      accent-color: #7c3aed;
    }
    fieldset {
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 1rem;
      max-width: 280px;
    }
    label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-block: 0.35rem;
    }
  </style>
</head>
<body>
  <fieldset>
    <label><input type="checkbox" checked> Option</label>
    <label><input type="range" min="0" max="100" value="40"> Range</label>
  </fieldset>
</body>
</html>
```

---

**Assignment 172:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 172 — color-mix</title>
  <style>
    :root {
      --a: oklch(0.65 0.2 280);
      --b: oklch(0.75 0.15 200);
    }
    .swatch {
      height: 4rem;
      border-radius: 0.5rem;
      background: color-mix(in oklch, var(--a), var(--b) 35%);
      border: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="swatch" role="img" aria-label="Mixed color"></div>
</body>
</html>
```

---

**Assignment 173:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 173 — oklch palette</title>
  <style>
    .row {
      display: flex;
      gap: 0.35rem;
      flex-wrap: wrap;
    }
    .sw {
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 0.35rem;
    }
    .sw:nth-child(1) {
      background: oklch(0.35 0.08 260);
    }
    .sw:nth-child(2) {
      background: oklch(0.5 0.12 260);
    }
    .sw:nth-child(3) {
      background: oklch(0.65 0.16 260);
    }
    .sw:nth-child(4) {
      background: oklch(0.78 0.12 260);
    }
    .sw:nth-child(5) {
      background: oklch(0.9 0.04 260);
    }
  </style>
</head>
<body>
  <div class="row">
    <div class="sw"></div><div class="sw"></div><div class="sw"></div><div class="sw"></div><div class="sw"></div>
  </div>
</body>
</html>
```

---

**Assignment 174:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 174 — @starting-style</title>
  <style>
    .popover {
      opacity: 1;
      transform: translateY(0);
      transition: opacity 0.35s ease, transform 0.35s ease;
      transition-behavior: allow-discrete;
    }
    @starting-style {
      .popover {
        opacity: 0;
        transform: translateY(8px);
      }
    }
    .popover {
      margin-top: 0.5rem;
      padding: 1rem;
      max-width: 240px;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
      background: white;
      box-shadow: 0 12px 40px rgb(0 0 0 / 0.1);
    }
  </style>
</head>
<body>
  <p>Open in a supporting browser — popover animates from starting style on first paint.</p>
  <div class="popover">New layer entrance</div>
</body>
</html>
```

---

**Assignment 175:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 175 — view-transition-name</title>
  <style>
    .card {
      view-transition-name: demo-card;
      padding: 1rem;
      border-radius: 0.75rem;
      background: #e0e7ff;
      max-width: 200px;
      cursor: pointer;
    }
    .card:active {
      transform: scale(0.98);
    }
  </style>
</head>
<body>
  <p>Assign <code>view-transition-name</code> for View Transitions API demos (enable in supporting Chromium).</p>
  <div class="card" tabindex="0" role="button">Named layer</div>
</body>
</html>
```

---

**Assignment 176:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 176 — scroll-driven progress</title>
  <style>
    @keyframes grow-w {
      from {
        width: 0%;
      }
      to {
        width: 100%;
      }
    }
    .bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 4px;
      background: #6366f1;
      width: 0;
      animation: grow-w linear both;
      animation-timeline: scroll();
    }
    body {
      min-height: 220vh;
      margin: 0;
      font-family: system-ui, sans-serif;
      padding: 2rem 1rem;
    }
  </style>
</head>
<body>
  <div class="bar" aria-hidden="true"></div>
  <p>Scroll — progress bar uses scroll() timeline where supported.</p>
</body>
</html>
```

---

**Assignment 177:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 177 — anchor positioning demo</title>
  <style>
    .anchor {
      anchor-name: --btn;
      display: inline-block;
      padding: 0.45rem 0.9rem;
      background: #0ea5e9;
      color: white;
      border-radius: 0.35rem;
      margin-top: 2rem;
    }
    .tip {
      position: absolute;
      position-anchor: --btn;
      bottom: anchor(top);
      left: anchor(center);
      translate: -50% -8px;
      padding: 0.35rem 0.6rem;
      background: #0f172a;
      color: white;
      border-radius: 0.35rem;
      font-size: 0.8rem;
      white-space: nowrap;
    }
    body {
      position: relative;
      font-family: system-ui, sans-serif;
      padding: 1rem;
    }
  </style>
</head>
<body>
  <p>Anchor positioning is cutting-edge; verify in latest Chrome/Canary.</p>
  <button class="anchor" type="button">Anchor</button>
  <div class="tip">Tooltip</div>
</body>
</html>
```

---

**Assignment 178:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 178 — @property</title>
  <style>
    @property --angle {
      syntax: "<angle>";
      inherits: false;
      initial-value: 0deg;
    }
    @keyframes spin-gradient {
      to {
        --angle: 360deg;
      }
    }
    .glow {
      --angle: 0deg;
      width: min(100%, 280px);
      height: 120px;
      border-radius: 1rem;
      background: conic-gradient(from var(--angle), #6366f1, #ec4899, #22d3ee, #6366f1);
      animation: spin-gradient 5s linear infinite;
    }
  </style>
</head>
<body>
  <div class="glow" aria-hidden="true"></div>
</body>
</html>
```

---

**Assignment 179:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 179 — color-scheme + light-dark</title>
  <style>
    :root {
      color-scheme: light dark;
    }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: system-ui, sans-serif;
      padding: 1rem;
      background: light-dark(#ffffff, #0f172a);
      color: light-dark(#0f172a, #f8fafc);
    }
  </style>
</head>
<body>
  <p>Surfaces follow system theme when <code>light-dark()</code> is available.</p>
</body>
</html>
```

---

**Assignment 180:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 180 — prefers-reduced-motion</title>
  <style>
    .bounce {
      animation: bounce 0.8s ease-in-out infinite alternate;
    }
    @keyframes bounce {
      to {
        transform: translateY(-12px);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .bounce {
        animation: none;
      }
    }
  </style>
</head>
<body>
  <div class="bounce" style="width:48px;height:48px;background:#f472b6;border-radius:50%"></div>
</body>
</html>
```

---

**Assignment 181:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 181 — circle / ellipse</title>
  <style>
    .circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #fef08a, #ca8a04);
    }
    .ellipse {
      width: 160px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #93c5fd, #6366f1);
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="circle"></div>
  <div class="ellipse"></div>
</body>
</html>
```

---

**Assignment 182:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 182 — triangle clip-path</title>
  <style>
    .tri {
      width: 0;
      height: 0;
      border-left: 50px solid transparent;
      border-right: 50px solid transparent;
      border-bottom: 86px solid #22c55e;
    }
    .tri2 {
      width: 100px;
      height: 86px;
      margin-top: 1rem;
      background: #f97316;
      clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    }
  </style>
</head>
<body>
  <div class="tri" aria-hidden="true"></div>
  <div class="tri2" aria-hidden="true"></div>
</body>
</html>
```

---

**Assignment 183:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 183 — CSS heart</title>
  <style>
    .heart {
      position: relative;
      width: 80px;
      height: 72px;
      margin: 2rem;
    }
    .heart::before,
    .heart::after {
      content: "";
      position: absolute;
      width: 40px;
      height: 64px;
      background: #ef4444;
      border-radius: 40px 40px 0 0;
    }
    .heart::before {
      left: 20px;
      transform: rotate(-45deg);
      transform-origin: 0 100%;
    }
    .heart::after {
      left: 20px;
      transform: rotate(45deg);
      transform-origin: 100% 100%;
    }
  </style>
</head>
<body>
  <div class="heart" aria-label="Heart" role="img"></div>
</body>
</html>
```

---

**Assignment 184:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 184 — hexagon clip-path</title>
  <style>
    .hex {
      width: 100px;
      height: 100px;
      background: center/cover
        url("https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=60");
      clip-path: polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%);
    }
  </style>
</head>
<body>
  <div class="hex" role="img" aria-label="Hex avatar"></div>
</body>
</html>
```

---

**Assignment 185:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 185 — shape-outside</title>
  <style>
    .float-img {
      float: left;
      width: 120px;
      height: 120px;
      shape-outside: circle(50%);
      clip-path: circle(50%);
      margin: 0 1rem 0.5rem 0;
      object-fit: cover;
    }
    p {
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <p>
    <img class="float-img" src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=240&q=60" alt="">
    Text wraps following a circular shape boundary around the floated image.
  </p>
</body>
</html>
```

---

**Assignment 186:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 186 — hamburger icon</title>
  <style>
    .burger {
      width: 28px;
      height: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      cursor: pointer;
    }
    .burger span {
      display: block;
      height: 3px;
      border-radius: 2px;
      background: #0f172a;
    }
  </style>
</head>
<body>
  <div class="burger" role="img" aria-label="Menu"><span></span><span></span><span></span></div>
</body>
</html>
```

---

**Assignment 187:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 187 — CSS landscape</title>
  <style>
    .scene {
      position: relative;
      width: min(100%, 320px);
      aspect-ratio: 16/10;
      border-radius: 0.75rem;
      overflow: hidden;
      background: linear-gradient(180deg, #38bdf8 0%, #bae6fd 55%, #fef9c3 55%, #facc15 100%);
    }
    .sun {
      position: absolute;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: radial-gradient(circle, #fef08a, #f59e0b);
      top: 18%;
      right: 22%;
    }
    .hill {
      position: absolute;
      bottom: 0;
      width: 120%;
      left: -10%;
      height: 35%;
      background: #15803d;
      border-radius: 50% 50% 0 0;
    }
    .hill2 {
      height: 28%;
      background: #166534;
      width: 110%;
      left: -5%;
    }
  </style>
</head>
<body>
  <div class="scene" aria-hidden="true">
    <div class="sun"></div>
    <div class="hill hill2"></div>
    <div class="hill"></div>
  </div>
</body>
</html>
```

---

**Assignment 188:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 188 — star clip-path</title>
  <style>
    .star {
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    }
  </style>
</head>
<body>
  <div class="star" aria-hidden="true"></div>
</body>
</html>
```

---

**Assignment 189:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 189 — landing page</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      font-family: system-ui, sans-serif;
      color: #0f172a;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem clamp(1rem, 4vw, 2rem);
      border-bottom: 1px solid #e2e8f0;
    }
    .hero {
      padding: clamp(3rem, 10vw, 6rem) clamp(1rem, 4vw, 2rem);
      text-align: center;
      background: linear-gradient(135deg, #eef2ff, #fce7f3);
    }
    .hero h1 {
      font-size: clamp(2rem, 5vw, 3rem);
      margin: 0 0 0.5rem;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      padding: 3rem clamp(1rem, 4vw, 2rem);
      max-width: 960px;
      margin-inline: auto;
    }
    .feat {
      padding: 1.25rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
    }
    .cta {
      text-align: center;
      padding: 3rem 1rem;
      background: #0f172a;
      color: white;
    }
    .cta a {
      display: inline-block;
      margin-top: 0.75rem;
      padding: 0.65rem 1.4rem;
      background: white;
      color: #0f172a;
      border-radius: 999px;
      font-weight: 600;
      text-decoration: none;
    }
    footer {
      padding: 1.5rem;
      text-align: center;
      font-size: 0.875rem;
      color: #64748b;
    }
  </style>
</head>
<body>
  <header><strong>Lumen</strong><nav><a href="#f">Features</a></nav></header>
  <section class="hero">
    <h1>Ship faster</h1>
    <p>Responsive landing with hero, features, CTA, footer.</p>
  </section>
  <section class="features" id="f">
    <div class="feat"><h3>Fast</h3><p>Performance first.</p></div>
    <div class="feat"><h3>Secure</h3><p>Best practices.</p></div>
    <div class="feat"><h3>Simple</h3><p>Clean UI.</p></div>
  </section>
  <section class="cta"><h2>Ready?</h2><a href="#">Get started</a></section>
  <footer>© 2025 Lumen</footer>
</body>
</html>
```

---

**Assignment 190:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 190 — pricing table</title>
  <style>
    .plans {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      max-width: 900px;
      margin: 2rem auto;
      padding: 0 1rem;
      font-family: system-ui, sans-serif;
    }
    .plan {
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .plan.popular {
      border-color: #6366f1;
      box-shadow: 0 12px 40px rgb(99 102 241 / 0.15);
      position: relative;
    }
    .plan.popular::before {
      content: "Popular";
      position: absolute;
      top: -10px;
      right: 1rem;
      background: #6366f1;
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 999px;
    }
    .price {
      font-size: 2rem;
      font-weight: 800;
    }
    .plan ul {
      margin: 0;
      padding-left: 1.1rem;
      flex: 1;
    }
    .plan button {
      font: inherit;
      padding: 0.55rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid #cbd5e1;
      background: white;
      cursor: pointer;
    }
    .plan.popular button {
      background: #4f46e5;
      color: white;
      border-color: transparent;
    }
  </style>
</head>
<body>
  <div class="plans">
    <div class="plan"><h3>Free</h3><p class="price">$0</p><ul><li>1 project</li></ul><button type="button">Choose</button></div>
    <div class="plan popular"><h3>Pro</h3><p class="price">$19</p><ul><li>Unlimited</li><li>Support</li></ul><button type="button">Choose</button></div>
    <div class="plan"><h3>Team</h3><p class="price">$49</p><ul><li>SSO</li></ul><button type="button">Choose</button></div>
  </div>
</body>
</html>
```

---

**Assignment 191:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 191 — dashboard</title>
  <style>
    body {
      margin: 0;
      font-family: system-ui, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
    }
    .shell {
      display: grid;
      grid-template-columns: 220px 1fr;
      grid-template-rows: 56px 1fr;
      grid-template-areas: "nav top" "nav main";
      min-height: 100dvh;
    }
    .nav {
      grid-area: nav;
      background: #020617;
      padding: 1rem;
    }
    .top {
      grid-area: top;
      display: flex;
      align-items: center;
      padding: 0 1rem;
      border-bottom: 1px solid #1e293b;
    }
    .main {
      grid-area: main;
      padding: 1rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
      align-content: start;
    }
    .widget {
      background: #1e293b;
      border-radius: 0.75rem;
      padding: 1rem;
      min-height: 100px;
    }
    .widget.wide {
      grid-column: 1 / -1;
    }
  </style>
</head>
<body>
  <div class="shell">
    <aside class="nav">Dashboard</aside>
    <header class="top">Search…</header>
    <main class="main">
      <div class="widget">KPI</div>
      <div class="widget">Users</div>
      <div class="widget wide">Chart area</div>
    </main>
  </div>
</body>
</html>
```

---

**Assignment 192:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 192 — portfolio grid</title>
  <style>
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 0.75rem;
      padding: 1rem;
      font-family: system-ui, sans-serif;
    }
    .item {
      position: relative;
      aspect-ratio: 1;
      border-radius: 0.75rem;
      overflow: hidden;
    }
    .item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.4s ease;
    }
    .item::after {
      content: attr(data-title);
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      background: rgb(15 23 42 / 0.55);
      color: white;
      font-weight: 600;
      opacity: 0;
      transition: opacity 0.35s ease;
    }
    .item:hover img {
      transform: scale(1.06);
    }
    .item:hover::after {
      opacity: 1;
    }
  </style>
</head>
<body>
  <div class="grid">
    <div class="item" data-title="Project A"><img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&q=60" alt=""></div>
    <div class="item" data-title="Project B"><img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=60" alt=""></div>
    <div class="item" data-title="Project C"><img src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&q=60" alt=""></div>
  </div>
</body>
</html>
```

---

**Assignment 193:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 193 — CSS dropdown</title>
  <style>
    .dd {
      position: relative;
      display: inline-block;
      font-family: system-ui, sans-serif;
    }
    .dd > button {
      font: inherit;
      padding: 0.45rem 0.9rem;
      border-radius: 0.35rem;
      border: 1px solid #cbd5e1;
      background: white;
      cursor: pointer;
    }
    .menu {
      display: none;
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      min-width: 180px;
      padding: 0.35rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.35rem;
      box-shadow: 0 12px 40px rgb(0 0 0 / 0.1);
    }
    .dd:hover .menu,
    .dd:focus-within .menu {
      display: block;
    }
    .menu a {
      display: block;
      padding: 0.4rem 0.55rem;
      color: #0f172a;
      text-decoration: none;
      border-radius: 0.25rem;
    }
    .menu a:hover,
    .menu a:focus-visible {
      background: #f1f5f9;
    }
  </style>
</head>
<body>
  <div class="dd">
    <button type="button">Products ▾</button>
    <div class="menu" role="menu">
      <a href="#" role="menuitem">Analytics</a>
      <a href="#" role="menuitem">Billing</a>
    </div>
  </div>
</body>
</html>
```

---

**Assignment 194:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 194 — email-friendly stub</title>
  <style>
    /* Many clients strip <style>; inline critical rules on elements in production */
    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: #f4f4f5;
    }
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
      }
      .stack {
        display: block !important;
      }
      .stack td {
        display: block !important;
        width: 100% !important;
      }
    }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px">
    <tr>
      <td align="center">
        <table class="container" role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px">
          <tr>
            <td style="padding:24px;font-size:16px;line-height:1.5;color:#18181b">
              <h1 style="margin:0 0 12px;font-size:22px">Newsletter</h1>
              <p style="margin:0 0 16px">Hybrid: table layout + responsive media query pattern.</p>
              <table class="stack" role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding:8px;vertical-align:top">Column A</td>
                  <td width="50%" style="padding:8px;vertical-align:top">Column B</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

**Assignment 195:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 195 — glassmorphism</title>
  <style>
    body {
      min-height: 100vh;
      margin: 0;
      display: grid;
      place-items: center;
      font-family: system-ui, sans-serif;
      background: center/cover fixed
        url("https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400&q=60");
    }
    .glass {
      width: min(100% - 2rem, 320px);
      padding: 1.5rem;
      border-radius: 1rem;
      background: rgb(255 255 255 / 0.12);
      border: 1px solid rgb(255 255 255 / 0.35);
      box-shadow: 0 8px 32px rgb(0 0 0 / 0.2);
      backdrop-filter: blur(14px) saturate(140%);
      color: white;
    }
  </style>
</head>
<body>
  <div class="glass">
    <h2 style="margin-top:0">Glass card</h2>
    <p>Frosted panel over imagery.</p>
  </div>
</body>
</html>
```

---

**Assignment 196:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 196 — neumorphism</title>
  <style>
    body {
      min-height: 100vh;
      margin: 0;
      display: grid;
      place-items: center;
      background: #e2e8f0;
      font-family: system-ui, sans-serif;
    }
    .neo {
      padding: 1.25rem 1.75rem;
      border-radius: 1rem;
      background: #e2e8f0;
      box-shadow: 8px 8px 16px #cbd5e1, -8px -8px 16px #ffffff;
    }
    .neo-btn {
      font: inherit;
      padding: 0.65rem 1.25rem;
      border: none;
      border-radius: 999px;
      background: #e2e8f0;
      color: #334155;
      cursor: pointer;
      box-shadow: 6px 6px 12px #cbd5e1, -4px -4px 10px #ffffff;
    }
    .neo-btn:active {
      box-shadow: inset 4px 4px 8px #cbd5e1, inset -2px -2px 6px #ffffff;
    }
  </style>
</head>
<body>
  <div class="neo">
    <p style="margin:0 0 0.75rem">Soft UI</p>
    <button class="neo-btn" type="button">Press</button>
  </div>
</body>
</html>
```

---

**Assignment 197:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 197 — dark mode toggle</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #ffffff;
      --fg: #0f172a;
      --card: #f8fafc;
    }
    html.dark {
      color-scheme: dark;
      --bg: #0f172a;
      --fg: #f8fafc;
      --card: #1e293b;
    }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: system-ui, sans-serif;
      background: var(--bg);
      color: var(--fg);
      padding: 2rem;
      transition: background 0.25s ease, color 0.25s ease;
    }
    .card {
      max-width: 360px;
      padding: 1.25rem;
      border-radius: 0.75rem;
      background: var(--card);
    }
    button {
      font: inherit;
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid #cbd5e1;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="card">
    <p>Toggle <code>dark</code> class on <code>html</code> (wire to JS in production).</p>
    <button type="button" onclick="document.documentElement.classList.toggle('dark')">Toggle theme</button>
  </div>
</body>
</html>
```

---

**Assignment 198:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 198 — CSS modal :target</title>
  <style>
    .modal {
      position: fixed;
      inset: 0;
      display: grid;
      place-items: center;
      background: rgb(15 23 42 / 0.55);
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.25s ease;
    }
    .modal:target {
      opacity: 1;
      visibility: visible;
    }
    .dialog {
      width: min(100% - 2rem, 400px);
      padding: 1.25rem;
      border-radius: 0.75rem;
      background: white;
      position: relative;
    }
    .dialog a.close {
      position: absolute;
      top: 0.5rem;
      right: 0.75rem;
      text-decoration: none;
      font-size: 1.25rem;
      color: #64748b;
    }
  </style>
</head>
<body style="font-family:system-ui,sans-serif;padding:1rem">
  <a href="#m">Open modal</a>
  <div id="m" class="modal">
    <div class="dialog">
      <a href="#" class="close" aria-label="Close">×</a>
      <h2 style="margin-top:0">Hello</h2>
      <p>Close via × (hash reset) or add separate close link to #.</p>
    </div>
  </div>
</body>
</html>
```

---

**Assignment 199:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 199 — timeline</title>
  <style>
    .timeline {
      --gap: 1.25rem;
      max-width: 480px;
      margin: 2rem auto;
      padding: 0 1rem;
      font-family: system-ui, sans-serif;
    }
    .item {
      display: grid;
      grid-template-columns: 12px 1fr;
      gap: var(--gap);
      position: relative;
      padding-block-end: 1.5rem;
    }
    .item::before {
      content: "";
      grid-column: 1;
      grid-row: 1 / span 2;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #6366f1;
      margin-top: 0.35rem;
      z-index: 1;
    }
    .item::after {
      content: "";
      position: absolute;
      left: 5px;
      top: 1rem;
      bottom: 0;
      width: 2px;
      background: #e2e8f0;
    }
    .item:last-child::after {
      display: none;
    }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 0.75rem 1rem;
    }
    @media (max-width: 400px) {
      .timeline {
        padding: 0 0.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="timeline">
    <div class="item"><div class="card"><strong>2023</strong><p>Kickoff</p></div></div>
    <div class="item"><div class="card"><strong>2024</strong><p>Launch</p></div></div>
    <div class="item"><div class="card"><strong>2025</strong><p>Scale</p></div></div>
  </div>
</body>
</html>
```

---

**Assignment 200:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assignment 200 — animated hero</title>
  <style>
    @keyframes pulse-ring {
      0%, 100% {
        box-shadow: 0 0 0 0 rgb(99 102 241 / 0.45);
      }
      70% {
        box-shadow: 0 0 0 14px rgb(99 102 241 / 0);
      }
    }
    .hero {
      min-height: 70vh;
      display: grid;
      place-items: center;
      text-align: center;
      padding: clamp(2rem, 8vw, 5rem) 1rem;
      background: linear-gradient(120deg, #312e81, #7c3aed 45%, #db2777);
      color: white;
      font-family: system-ui, sans-serif;
    }
    .hero h1 {
      margin: 0 0 0.75rem;
      font-size: clamp(2rem, 5vw + 1rem, 3.5rem);
      line-height: 1.1;
    }
    .hero p {
      margin: 0 0 1.5rem;
      max-width: 40ch;
      opacity: 0.95;
    }
    .cta {
      display: inline-block;
      padding: 0.7rem 1.5rem;
      border-radius: 999px;
      background: white;
      color: #4c1d95;
      font-weight: 700;
      text-decoration: none;
      animation: pulse-ring 2s ease-out infinite;
    }
  </style>
</head>
<body>
  <section class="hero">
    <div>
      <h1>Build in public</h1>
      <p>Gradient hero, fluid headline, CTA pulse.</p>
      <a class="cta" href="#">Start free</a>
    </div>
  </section>
</body>
</html>
```

---
