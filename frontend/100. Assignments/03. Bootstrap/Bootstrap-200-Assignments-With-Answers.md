# 200 Bootstrap 5.3 Real-Time Assignments with Answers

Bootstrap **5.3** with `data-bs-*` and the **bundle** JS (no jQuery). **Assignments 1–6**: full HTML pages with CDN. **7–200**: paste into a page that already loads Bootstrap CSS/JS.

---

## BEGINNER (Assignments 1–70)

---

**Assignment 1:** Create a valid HTML5 page that loads Bootstrap 5.3 CSS and the Bootstrap bundle JS from a CDN in the correct order.

```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>A1 CDN</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
  
</head>
<body>
<main class="container py-4"><h1 class="h4">Bootstrap 5.3</h1></main>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>

</body>
</html>
```

---

**Assignment 2:** Add a `.container` with sample text and explain (in a comment) how its max-width changes at breakpoints.

```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>A2 Container</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
  
</head>
<body>
<main class="container py-4 border">
  <!-- .container is width:100% until breakpoint max-widths (sm/md/lg/xl/xxl) -->
  <p class="mb-0">Resize to see max-width change.</p>
</main>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>

</body>
</html>
```

---

**Assignment 3:** Build a page section using `.container-fluid` that spans the full viewport width with padded content.

```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>A3 Fluid</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
  
</head>
<body>
<main class="container-fluid py-4 px-3 bg-light border"><p class="mb-0">Edge-to-edge fluid.</p></main>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>

</body>
</html>
```

---

**Assignment 4:** Show three stacked blocks: default `.container`, `.container-sm`, and `.container-lg`, each with a visible border so width differences are obvious.

```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>A4 Containers</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
  
</head>
<body>
<div class="container border border-primary mb-2 p-2">.container</div>
<div class="container-sm border border-success mb-2 p-2">.container-sm</div>
<div class="container-lg border border-danger p-2">.container-lg</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>

</body>
</html>
```

---

**Assignment 5:** Use responsive container classes (e.g. `.container-md`) so the layout is fluid on extra-small screens and constrained from `md` upward.

```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>A5 container-md</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
  
</head>
<body>
<main class="container-md py-4 border"><p class="mb-0">Fluid until md.</p></main>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>

</body>
</html>
```

---

**Assignment 6:** Nest a `.container` inside a colored full-width wrapper (`.bg-light`) to demonstrate outer background vs inner constrained content.

```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>A6 Nested</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
  
</head>
<body>
<div class="bg-light py-5"><div class="container bg-white shadow-sm p-4 border">
<p class="mb-0">Outer bg + inner container.</p></div></div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>

</body>
</html>
```

---

**Assignment 7:** Create a single row with two equal columns on all breakpoints using the grid.

```html
<div class="container py-3"><div class="row"><div class="col-6"><div class="p-3 bg-primary text-white">A</div></div><div class="col-6"><div class="p-3 bg-secondary text-white">B</div></div></div></div>
```

---

**Assignment 8:** Build a row with three columns that stack on `xs` and sit side-by-side from `sm` upward (`col-12 col-sm-4`).

```html
<div class="container py-3"><div class="row g-2"><div class="col-12 col-sm-4"><div class="p-3 bg-light border">1</div></div><div class="col-12 col-sm-4"><div class="p-3 bg-light border">2</div></div><div class="col-12 col-sm-4"><div class="p-3 bg-light border">3</div></div></div></div>
```

---

**Assignment 9:** Use `col-md-6` and `col-md-6` for a two-column layout that stacks below `md`.

```html
<div class="container py-3"><div class="row"><div class="col-md-6"><div class="p-3 bg-info text-dark">L</div></div><div class="col-md-6"><div class="p-3 bg-warning text-dark">R</div></div></div></div>
```

---

**Assignment 10:** Create a layout with `col-lg-8` and `col-lg-4` that stacks on smaller screens.

```html
<div class="container py-3"><div class="row"><div class="col-lg-8"><div class="p-3 bg-light border">8</div></div><div class="col-lg-4"><div class="p-3 bg-light border">4</div></div></div></div>
```

---

**Assignment 11:** Use `col-xl` and `col-xxl` breakpoints: three columns from `xl`, four columns from `xxl`.

```html
<div class="container py-3"><div class="row g-2"><div class="col-12 col-xl-4 col-xxl-3"><div class="p-2 bg-primary text-white">1</div></div><div class="col-12 col-xl-4 col-xxl-3"><div class="p-2 bg-primary text-white">2</div></div><div class="col-12 col-xl-4 col-xxl-3"><div class="p-2 bg-primary text-white">3</div></div><div class="col-12 col-xxl-3 d-none d-xxl-block"><div class="p-2 bg-dark text-white">4</div></div></div></div>
```

---

**Assignment 12:** Demonstrate auto-layout columns using `.row` and multiple `.col` elements without explicit numbers.

```html
<div class="container py-3"><div class="row"><div class="col"><div class="p-2 border">a</div></div><div class="col"><div class="p-2 border">b</div></div><div class="col"><div class="p-2 border">c</div></div></div></div>
```

---

**Assignment 13:** Nest a `.row` inside a column: outer two columns, inner row with three equal child columns.

```html
<div class="container py-3"><div class="row"><div class="col-md-6"><div class="p-2 bg-light border">Out</div></div><div class="col-md-6"><div class="row g-1"><div class="col-4"><div class="p-2 bg-secondary text-white">n1</div></div><div class="col-4"><div class="p-2 bg-secondary text-white">n2</div></div><div class="col-4"><div class="p-2 bg-secondary text-white">n3</div></div></div></div></div></div>
```

---

**Assignment 14:** Use offset classes (`offset-md-2`, etc.) to center a `col-md-8` column.

```html
<div class="container py-3"><div class="row"><div class="col-md-8 offset-md-2"><div class="p-3 bg-light border text-center">Centered</div></div></div></div>
```

---

**Assignment 15:** Apply `.order-*` and responsive order utilities to reorder three columns on `md` vs `sm`.

```html
<div class="container py-3"><div class="row"><div class="col-md-4 order-md-3"><div class="p-2 bg-danger text-white">A</div></div><div class="col-md-4 order-md-1"><div class="p-2 bg-success text-white">B</div></div><div class="col-md-4 order-md-2"><div class="p-2 bg-primary text-white">C</div></div></div></div>
```

---

**Assignment 16:** Use default gutters, then a row with `.g-0`, then `.g-4` to show gutter differences.

```html
<div class="container py-3"><div class="row mb-2"><div class="col-6"><div class="bg-light border">d</div></div><div class="col-6"><div class="bg-light border">d</div></div></div><div class="row g-0 mb-2 border"><div class="col-6"><div class="bg-light">g0</div></div><div class="col-6"><div class="bg-light">g0</div></div></div><div class="row g-4"><div class="col-6"><div class="bg-light border">g4</div></div><div class="col-6"><div class="bg-light border">g4</div></div></div></div>
```

---

**Assignment 17:** Use `.gy-3` and `.gx-5` on one row to set vertical and horizontal gutters independently.

```html
<div class="container py-3"><div class="row gx-5 gy-3"><div class="col-6"><div class="p-2 bg-primary text-white">1</div></div><div class="col-6"><div class="p-2 bg-primary text-white">2</div></div><div class="col-6"><div class="p-2 bg-primary text-white">3</div></div><div class="col-6"><div class="p-2 bg-primary text-white">4</div></div></div></div>
```

---

**Assignment 18:** Build three columns with equal visual height using cards inside columns and `.h-100` on cards.

```html
<div class="container py-3"><div class="row g-3"><div class="col-md-4"><div class="card h-100"><div class="card-body">Short</div></div></div><div class="col-md-4"><div class="card h-100"><div class="card-body">Tall<br><br>x</div></div></div><div class="col-md-4"><div class="card h-100"><div class="card-body">Med</div></div></div></div></div>
```

---

**Assignment 19:** Hide a column on `xs` with `.d-none` and show it from `md` with `.d-md-block`.

```html
<div class="container py-3"><div class="row"><div class="col-md-6"><div class="p-2 border">Vis</div></div><div class="col-md-6 d-none d-md-block"><div class="p-2 bg-dark text-white">md+</div></div></div></div>
```

---

**Assignment 20:** Combine `col` sizing, `w-100` row breaks, and a nested grid in one responsive section.

```html
<div class="container py-3"><div class="row"><div class="col-md-4"><div class="p-2 border">A</div></div><div class="col-md-4"><div class="p-2 border">B</div></div><div class="w-100"></div><div class="col-md-6"><div class="row"><div class="col-6"><div class="p-2 bg-secondary text-white">n</div></div><div class="col-6"><div class="p-2 bg-secondary text-white">n</div></div></div></div></div></div>
```

---

**Assignment 21:** Use semantic headings `<h1>`–`<h6>` with Bootstrap heading classes where appropriate.

```html
<div class="container py-3"><h1>h1 <span class="h3 text-muted">.h3</span></h1><h2>h2</h2><h3>h3</h3><h4>h4</h4><h5>h5</h5><h6>h6</h6></div>
```

---

**Assignment 22:** Add `.display-1` through `.display-6` samples in one section.

```html
<div class="container py-3"><p class="display-1">d1</p><p class="display-4">d4</p><p class="display-6">d6</p></div>
```

---

**Assignment 23:** Style an intro paragraph with `.lead`.

```html
<div class="container py-3"><p class="lead">Lead intro.</p></div>
```

---

**Assignment 24:** Demonstrate text alignment utilities: `.text-start`, `.text-center`, `.text-end`, and responsive variants.

```html
<div class="container py-3"><p class="text-start border p-2">start</p><p class="text-center border p-2">center</p><p class="text-md-end border p-2">end md+</p></div>
```

---

**Assignment 25:** Show `.text-break`, `.text-nowrap`, and `.text-truncate` (with fixed width) examples.

```html
<div class="container py-3"><p class="text-break border p-2" style="max-width:120px">Verylongunbrokenstring</p><p class="text-nowrap border p-2 overflow-auto">nowrap — — —</p><div class="border p-2" style="max-width:200px"><span class="d-inline-block text-truncate w-100">Long truncated text here</span></div></div>
```

---

**Assignment 26:** Apply `.text-uppercase`, `.text-lowercase`, and `.text-capitalize` to sample text.

```html
<div class="container py-3"><p class="text-uppercase">up</p><p class="text-lowercase">LOW</p><p class="text-capitalize">cap each word</p></div>
```

---

**Assignment 27:** Use contextual text color utilities (`.text-primary`, `.text-muted`, `.text-danger`, etc.).

```html
<div class="container py-3"><p class="text-primary">pri</p><p class="text-muted">muted</p><p class="text-danger">dan</p></div>
```

---

**Assignment 28:** Build a `.blockquote` with `.blockquote-footer` and styled ordered/unordered lists (`.list-unstyled`, `.list-inline`).

```html
<div class="container py-3"><figure><blockquote class="blockquote"><p>Quote.</p></blockquote><figcaption class="blockquote-footer">By <cite>Source</cite></figcaption></figure><ul class="list-unstyled"><li>u</li></ul><ul class="list-inline"><li class="list-inline-item">a</li><li class="list-inline-item">b</li></ul></div>
```

---

**Assignment 29:** Display a row of text samples using `.text-primary`, `.text-secondary`, `.text-success`, `.text-warning`, `.text-info`, `.text-danger`.

```html
<div class="container py-3"><p class="text-primary">p</p><p class="text-secondary">s</p><p class="text-success">ok</p><p class="text-warning">w</p><p class="text-info">i</p><p class="text-danger">d</p></div>
```

---

**Assignment 30:** Show background utilities `.bg-primary` through `.bg-dark` on padded boxes with contrasting text.

```html
<div class="container py-3 d-flex flex-wrap gap-2"><div class="p-3 bg-primary text-white">1</div><div class="p-3 bg-secondary text-white">2</div><div class="p-3 bg-success text-white">3</div><div class="p-3 bg-warning text-dark">4</div><div class="p-3 bg-info text-dark">5</div><div class="p-3 bg-danger text-white">6</div><div class="p-3 bg-dark text-white">7</div></div>
```

---

**Assignment 31:** Use combined `.text-bg-primary`, `.text-bg-success`, etc., on badges or cards.

```html
<div class="container py-3"><span class="badge text-bg-primary me-1">a</span><span class="badge text-bg-success">b</span><div class="card text-bg-dark mt-2" style="max-width:18rem"><div class="card-body">Dark</div></div></div>
```

---

**Assignment 32:** Apply `.bg-opacity-*` (or text opacity) utilities on top of a colored background.

```html
<div class="container py-3 bg-primary p-4"><div class="p-3 bg-white bg-opacity-75 text-dark">opacity</div></div>
```

---

**Assignment 33:** Combine border color utilities with background colors for subtle cards.

```html
<div class="container py-3"><div class="card border-success bg-light"><div class="card-body text-success">Ctx</div></div></div>
```

---

**Assignment 34:** Use `.link-*` colored links and hover states in a short navigation list.

```html
<div class="container py-3"><a href="#" class="link-primary d-block">a</a><a href="#" class="link-danger d-block">b</a></div>
```

---

**Assignment 35:** Demonstrate margin scale `.m-0` through `.m-5` on separate boxes.

```html
<div class="container py-3"><div class="border mb-2"><span class="d-inline-block border bg-light m-0">m0</span></div><div class="border mb-2"><span class="d-inline-block border bg-light m-3">m3</span></div><div class="border"><span class="d-inline-block border bg-light m-5">m5</span></div></div>
```

---

**Assignment 36:** Use directional margins `.mt-*`, `.mb-*`, `.ms-*`, `.me-*` on headings and paragraphs.

```html
<div class="container py-3"><h2 class="mt-4 mb-2">H</h2><p class="ms-3 me-5 border-start border-3 ps-2">P</p></div>
```

---

**Assignment 37:** Apply padding `.p-*` and axis padding `.px-*`, `.py-*` inside bordered divs.

```html
<div class="container py-3"><div class="border p-4 mb-2">p4</div><div class="border px-5 py-2">px5</div></div>
```

---

**Assignment 38:** Use responsive spacing: e.g. `.p-2 .p-md-4 .p-lg-5` on one element.

```html
<div class="container py-3"><div class="border p-2 p-md-4 p-lg-5">rsp</div></div>
```

---

**Assignment 39:** Show `.mx-auto` centering a block with a defined width.

```html
<div class="container py-3"><div class="bg-light mx-auto border" style="width:200px">ctr</div></div>
```

---

**Assignment 40:** Use width utilities `.w-25`, `.w-50`, `.w-75`, `.w-100` inside a container.

```html
<div class="container py-3"><div class="w-25 bg-primary text-white p-2 mb-1">25</div><div class="w-50 bg-secondary text-white p-2 mb-1">50</div><div class="w-100 bg-dark text-white p-2">100</div></div>
```

---

**Assignment 41:** Use height utilities `.h-25`, `.h-50`, `.h-100` inside a min-height wrapper.

```html
<div class="container py-3" style="min-height:200px"><div class="h-50 bg-warning border d-inline-block" style="width:100px">50</div><div class="h-100 bg-info border d-inline-block align-top ms-2" style="width:100px">100</div></div>
```

---

**Assignment 42:** Combine `.min-vh-100` on a section with centered content using flex utilities.

```html
<div class="min-vh-100 d-flex align-items-center justify-content-center bg-light"><div class="text-center"><h1 class="h3">Center</h1></div></div>
```

---

**Assignment 43:** Create buttons for all solid variants: `.btn-primary` through `.btn-dark` and `.btn-link`.

```html
<div class="container py-3 d-flex flex-wrap gap-2"><button type="button" class="btn btn-primary">p</button><button type="button" class="btn btn-secondary">s</button><button type="button" class="btn btn-success">ok</button><button type="button" class="btn btn-danger">d</button><button type="button" class="btn btn-dark">dk</button><button type="button" class="btn btn-link">lk</button></div>
```

---

**Assignment 44:** Create outline buttons `.btn-outline-*` for at least four semantic colors.

```html
<div class="container py-3 d-flex flex-wrap gap-2"><button type="button" class="btn btn-outline-primary">a</button><button type="button" class="btn btn-outline-success">b</button><button type="button" class="btn btn-outline-danger">c</button><button type="button" class="btn btn-outline-dark">d</button></div>
```

---

**Assignment 45:** Show button sizes `.btn-lg`, default, and `.btn-sm`.

```html
<div class="container py-3 d-flex flex-wrap align-items-center gap-2"><button type="button" class="btn btn-primary btn-lg">lg</button><button type="button" class="btn btn-primary">df</button><button type="button" class="btn btn-primary btn-sm">sm</button></div>
```

---

**Assignment 46:** Build a full-width button with `.d-grid` and `.btn-block` pattern (Bootstrap 5: use grid gap).

```html
<div class="container py-3 d-grid gap-2"><button type="button" class="btn btn-primary">Full</button></div>
```

---

**Assignment 47:** Group buttons with `.btn-group` and a grouped set of three related actions.

```html
<div class="container py-3"><div class="btn-group" role="group"><button type="button" class="btn btn-outline-primary">L</button><button type="button" class="btn btn-outline-primary">M</button><button type="button" class="btn btn-outline-primary">R</button></div></div>
```

---

**Assignment 48:** Add `.btn-group` with `.active` toggle state using `data-bs-toggle="button"` on buttons.

```html
<div class="container py-3"><div class="btn-group" role="group"><button type="button" class="btn btn-primary" data-bs-toggle="button">T1</button><button type="button" class="btn btn-primary" data-bs-toggle="button">T2</button></div></div>
```

---

**Assignment 49:** Show disabled buttons using `disabled` attribute and `.disabled` on a link styled as button.

```html
<div class="container py-3 d-flex gap-2"><button type="button" class="btn btn-secondary" disabled>dis</button><a class="btn btn-primary disabled" tabindex="-1" aria-disabled="true">dis a</a></div>
```

---

**Assignment 50:** Create a horizontal row of “social” icon buttons (use text or SVG placeholders) with `.btn` variants.

```html
<div class="container py-3 d-flex flex-wrap gap-2"><button type="button" class="btn btn-primary rounded-circle" style="width:42px;height:42px" aria-label="X">X</button><button type="button" class="btn btn-dark rounded-circle" style="width:42px;height:42px" aria-label="G">G</button><button type="button" class="btn btn-danger rounded-circle" style="width:42px;height:42px" aria-label="Y">Y</button></div>
```

---

**Assignment 51:** Make an image responsive with `.img-fluid` inside a column.

```html
<div class="container py-3 col-lg-6"><img class="img-fluid" src="https://picsum.photos/800/400" alt=""></div>
```

---

**Assignment 52:** Apply `.img-thumbnail` to a square image.

```html
<div class="container py-3"><img class="img-thumbnail" src="https://picsum.photos/seed/t/120/120" width="120" height="120" alt=""></div>
```

---

**Assignment 53:** Use `.rounded`, `.rounded-circle`, and `.rounded-pill` on images or placeholders.

```html
<div class="container py-3 d-flex gap-2 flex-wrap align-items-center"><img class="rounded" src="https://picsum.photos/seed/a/80/80" width="80" height="80" alt=""><img class="rounded-circle" src="https://picsum.photos/seed/b/80/80" width="80" height="80" alt=""><div class="bg-secondary rounded-pill" style="width:100px;height:40px"></div></div>
```

---

**Assignment 54:** Structure content with `<figure>`, `.figure`, `.figure-img`, and `.figure-caption`.

```html
<div class="container py-3"><figure class="figure"><img src="https://picsum.photos/seed/f/320/200" class="figure-img img-fluid rounded" alt=""><figcaption class="figure-caption">Cap</figcaption></figure></div>
```

---

**Assignment 55:** Create a `.table-responsive` wrapper around a wide table.

```html
<div class="container py-3"><div class="table-responsive"><table class="table"><thead><tr><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th></tr></thead><tbody><tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr></tbody></table></div></div>
```

---

**Assignment 56:** Add `.table-striped` rows to a table.

```html
<div class="container py-3"><table class="table table-striped"><tbody><tr><td>1</td></tr><tr><td>2</td></tr></tbody></table></div>
```

---

**Assignment 57:** Add `.table-hover` and `.table-bordered` to a table.

```html
<div class="container py-3"><table class="table table-hover table-bordered"><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table></div>
```

---

**Assignment 58:** Apply `.table-primary`, `.table-danger`, etc., on rows or cells for contextual coloring.

```html
<div class="container py-3"><table class="table"><tbody><tr class="table-primary"><td>r</td></tr><tr><td class="table-danger">c</td></tr></tbody></table></div>
```

---

**Assignment 59:** Show dismissible and non-dismissible `.alert` variants with `.alert-*` colors.

```html
<div class="container py-3"><div class="alert alert-info">Static</div><div class="alert alert-warning alert-dismissible fade show">X<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div></div>
```

---

**Assignment 60:** Use `.badge` with `.text-bg-*` in headings and buttons.

```html
<div class="container py-3"><h3>H <span class="badge text-bg-secondary">N</span></h3><button type="button" class="btn btn-primary">Inbox <span class="badge text-bg-light text-dark">3</span></button></div>
```

---

**Assignment 61:** Build a `.breadcrumb` with three items, last one active.

```html
<div class="container py-3"><nav aria-label="breadcrumb"><ol class="breadcrumb"><li class="breadcrumb-item"><a href="#">H</a></li><li class="breadcrumb-item"><a href="#">L</a></li><li class="breadcrumb-item active" aria-current="page">Cur</li></ol></nav></div>
```

---

**Assignment 62:** Create a `.list-group` with active and disabled items.

```html
<div class="container py-3"><ul class="list-group"><li class="list-group-item active">A</li><li class="list-group-item">B</li><li class="list-group-item disabled" aria-disabled="true">D</li></ul></div>
```

---

**Assignment 63:** Add `.list-group-item-action` for hover states on list items.

```html
<div class="container py-3"><div class="list-group"><a href="#" class="list-group-item list-group-item-action">A</a><a href="#" class="list-group-item list-group-item-action">B</a></div></div>
```

---

**Assignment 64:** Show border and borderless `.spinner-border` and `.spinner-grow`.

```html
<div class="container py-3 d-flex gap-3"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Load</span></div><div class="spinner-grow text-success" role="status"><span class="visually-hidden">Load</span></div></div>
```

---

**Assignment 65:** Build labeled and striped `.progress` bars with `.progress-bar`.

```html
<div class="container py-3"><div class="progress mb-2" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar" style="width:40%">40%</div></div><div class="progress" style="height:8px"><div class="progress-bar progress-bar-striped bg-danger" style="width:65%"></div></div></div>
```

---

**Assignment 66:** Create a basic `.card` with `.card-body`, title, and text.

```html
<div class="container py-3"><div class="card" style="max-width:20rem"><div class="card-body"><h5 class="card-title">T</h5><p class="card-text">Txt</p></div></div></div>
```

---

**Assignment 67:** Add `.card-img-top` and a card image (placeholder) with body below.

```html
<div class="container py-3"><div class="card" style="max-width:20rem"><img src="https://picsum.photos/seed/ci/400/200" class="card-img-top" alt=""><div class="card-body"><p class="card-text">B</p></div></div></div>
```

---

**Assignment 68:** Use `.card-header` and `.card-footer` with a card body between.

```html
<div class="container py-3"><div class="card" style="max-width:22rem"><div class="card-header">H</div><div class="card-body">B</div><div class="card-footer text-body-secondary">F</div></div></div>
```

---

**Assignment 69:** Build a `.row`–`.col` horizontal card: image column + body column on `md+`.

```html
<div class="container py-3"><div class="card mb-3" style="max-width:540px"><div class="row g-0"><div class="col-md-4"><img src="https://picsum.photos/seed/h/300/260" class="img-fluid rounded-start h-100 object-fit-cover" alt=""></div><div class="col-md-8"><div class="card-body"><h5 class="card-title">Hz</h5><p class="card-text">md+</p></div></div></div></div></div>
```

---

**Assignment 70:** Implement `.pagination` with `.page-item` active/disabled states.

```html
<div class="container py-3"><nav aria-label="p"><ul class="pagination"><li class="page-item disabled"><a class="page-link" href="#" tabindex="-1">P</a></li><li class="page-item active"><a class="page-link" href="#">1</a></li><li class="page-item"><a class="page-link" href="#">2</a></li></ul></nav></div>
```

## INTERMEDIATE (Assignments 71–140)

---

**Assignment 71:** Build a basic `.navbar` with brand text and three links.

```html
<nav class="navbar navbar-expand-lg bg-body-tertiary"><div class="container-fluid">
<a class="navbar-brand" href="#">Brand</a>
<div class="navbar-nav"><a class="nav-link active" aria-current="page" href="#">Home</a>
<a class="nav-link" href="#">Link</a><a class="nav-link" href="#">Contact</a></div></div></nav>
```

---

**Assignment 72:** Add `.navbar-toggler` and a collapsible `.navbar-collapse` with `data-bs-toggle="collapse"`.

```html
<nav class="navbar navbar-expand-lg bg-light"><div class="container-fluid">
<a class="navbar-brand" href="#">Site</a>
<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nv" aria-controls="nv" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
<div class="collapse navbar-collapse" id="nv"><div class="navbar-nav"><a class="nav-link" href="#">A</a><a class="nav-link" href="#">B</a></div></div></div></nav>
```

---

**Assignment 73:** Use `.navbar-brand` with an `<img>` logo and site name.

```html
<nav class="navbar navbar-expand-lg bg-body-tertiary"><div class="container-fluid">
<a class="navbar-brand d-flex align-items-center gap-2" href="#"><img src="https://picsum.photos/seed/lg/32/32" width="32" height="32" class="d-inline-block rounded" alt="">Logo Co</a></div></nav>
```

---

**Assignment 74:** Place a `.dropdown` menu inside the navbar using `data-bs-toggle="dropdown"`.

```html
<nav class="navbar navbar-expand-lg bg-dark navbar-dark"><div class="container-fluid">
<ul class="navbar-nav"><li class="nav-item dropdown">
<a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" aria-expanded="false">Menu</a>
<ul class="dropdown-menu"><li><a class="dropdown-item" href="#">One</a></li><li><a class="dropdown-item" href="#">Two</a></li></ul></li></ul></div></nav>
```

---

**Assignment 75:** Use `.fixed-top` on a navbar and add top padding to `body` so content is not hidden.

```html
<!-- Full page: add body padding-top OR offset main -->
<nav class="navbar navbar-expand-lg bg-body-tertiary fixed-top border-bottom"><div class="container"><a class="navbar-brand" href="#">Fixed</a></div></nav>
<main class="container py-4" style="margin-top:4.5rem"><p>Content clears <code>.fixed-top</code> navbar.</p></main>
```

---

**Assignment 76:** Use `.sticky-top` navbar that sticks on scroll within the document flow.

```html
<main class="container py-3" style="min-height:120vh">
<nav class="navbar navbar-expand-lg bg-body-tertiary border sticky-top"><div class="container-fluid"><span class="navbar-brand mb-0 h1">Sticky</span></div></nav>
<p>Scroll — bar sticks within flow.</p></main>
```

---

**Assignment 77:** Apply `.navbar-dark` and `.bg-dark` (or `data-bs-theme="dark"` on navbar) for a dark scheme.

```html
<nav class="navbar navbar-expand-lg navbar-dark bg-dark"><div class="container-fluid"><a class="navbar-brand" href="#">Dark</a></div></nav>
```

---

**Assignment 78:** Build a responsive navbar that opens an `.offcanvas` panel for navigation on small screens.

```html
<nav class="navbar navbar-expand-lg bg-body-tertiary"><div class="container-fluid">
<a class="navbar-brand" href="#">App</a>
<button class="navbar-toggler d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#ocNav" aria-controls="ocNav"><span class="navbar-toggler-icon"></span></button>
<div class="offcanvas-lg offcanvas-end" tabindex="-1" id="ocNav"><div class="offcanvas-header"><h5 class="offcanvas-title">Nav</h5><button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button></div>
<div class="offcanvas-body"><div class="navbar-nav"><a class="nav-link" href="#">A</a><a class="nav-link" href="#">B</a></div></div></div>
<div class="navbar-nav ms-auto d-none d-lg-flex"><a class="nav-link" href="#">Desktop</a></div></div></nav>
```

---

**Assignment 79:** Add a search `.form-control` and button inside `.navbar` using `.d-flex`.

```html
<nav class="navbar bg-body-tertiary"><div class="container-fluid">
<form class="d-flex ms-auto" role="search"><input class="form-control me-2" type="search" placeholder="Search" aria-label="Search"><button class="btn btn-outline-success" type="submit">Go</button></form></div></nav>
```

---

**Assignment 80:** Create a multi-level style menu using dropdowns (nested menus simulated with dropdown headers/divider).

```html
<nav class="navbar navbar-expand-lg bg-light"><div class="container-fluid"><ul class="navbar-nav">
<li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">Shop</a>
<ul class="dropdown-menu"><li><h6 class="dropdown-header">Dept</h6></li><li><a class="dropdown-item" href="#">A</a></li><li><hr class="dropdown-divider"></li><li><a class="dropdown-item" href="#">B</a></li></ul></li></ul></div></nav>
```

---

**Assignment 81:** Build a navbar with `data-bs-theme="dark"` and a light page `data-bs-theme="light"` for contrast.

```html
<div class="p-3 bg-body-secondary"><nav class="navbar navbar-expand-lg border rounded px-3" data-bs-theme="dark" style="background:var(--bs-dark)">
<div class="container-fluid"><a class="navbar-brand text-white" href="#">Dark bar</a></div></nav>
<p class="mt-2 mb-0 small">Navbar <code>data-bs-theme="dark"</code> on light page.</p></div>
```

---

**Assignment 82:** Combine sticky navbar, container-fluid, and right-aligned dropdown user menu.

```html
<nav class="navbar navbar-expand-lg bg-body-tertiary sticky-top border-bottom"><div class="container-fluid">
<a class="navbar-brand" href="#">Co</a><div class="ms-auto dropdown"><button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">User</button>
<ul class="dropdown-menu dropdown-menu-end"><li><a class="dropdown-item" href="#">Profile</a></li><li><a class="dropdown-item" href="#">Sign out</a></li></ul></div></div></nav>
```

---

**Assignment 83:** Create a stacked form with `.mb-3`, labels, and `.form-control` inputs.

```html
<div class="container py-3"><form><div class="mb-3"><label class="form-label" for="e">Email</label><input type="email" class="form-control" id="e"></div>
<div class="mb-3"><label class="form-label" for="p">Password</label><input type="password" class="form-control" id="p"></div><button type="submit" class="btn btn-primary">Submit</button></form></div>
```

---

**Assignment 84:** Use `.form-floating` labels on email and password fields.

```html
<div class="container py-3"><form style="max-width:360px"><div class="form-floating mb-3"><input type="email" class="form-control" id="fe" placeholder="a@b.c"><label for="fe">Email</label></div>
<div class="form-floating"><input type="password" class="form-control" id="fp" placeholder="pw"><label for="fp">Password</label></div></form></div>
```

---

**Assignment 85:** Build `.input-group` with prepend text, control, and append button.

```html
<div class="container py-3"><div class="input-group mb-3"><span class="input-group-text">@</span><input type="text" class="form-control" placeholder="user"><button class="btn btn-outline-secondary" type="button">OK</button></div></div>
```

---

**Assignment 86:** Style `<select>` with `.form-select` and disabled/selected options.

```html
<div class="container py-3"><select class="form-select" aria-label="pick"><option selected>Open</option><option value="1">One</option><option value="2" disabled>Dis</option></select></div>
```

---

**Assignment 87:** Group checkboxes with `.form-check` and name attributes.

```html
<div class="container py-3"><div class="form-check"><input class="form-check-input" type="checkbox" value="" id="c1"><label class="form-check-label" for="c1">A</label></div>
<div class="form-check"><input class="form-check-input" type="checkbox" value="" id="c2"><label class="form-check-label" for="c2">B</label></div></div>
```

---

**Assignment 88:** Use inline radios with `.form-check-inline` for a choice set.

```html
<div class="container py-3"><div class="form-check form-check-inline"><input class="form-check-input" type="radio" name="r" id="r1" value="1"><label class="form-check-label" for="r1">1</label></div>
<div class="form-check form-check-inline"><input class="form-check-input" type="radio" name="r" id="r2" value="2"><label class="form-check-label" for="r2">2</label></div></div>
```

---

**Assignment 89:** Add a `.form-check.form-switch` toggle.

```html
<div class="container py-3"><div class="form-check form-switch"><input class="form-check-input" type="checkbox" role="switch" id="sw"><label class="form-check-label" for="sw">Notify</label></div></div>
```

---

**Assignment 90:** Implement a `.form-range` slider with label.

```html
<div class="container py-3"><label for="rg" class="form-label">Volume</label><input type="range" class="form-range" min="0" max="5" id="rg"></div>
```

---

**Assignment 91:** Add client-side validation: `.was-validated` on `<form>` with required fields.

```html
<div class="container py-3"><form class="row g-3 was-validated" novalidate><div class="col-md-6"><label class="form-label" for="v1">Name</label><input class="form-control" id="v1" required><div class="invalid-feedback">Required.</div></div>
<div class="col-12"><button class="btn btn-primary" type="submit">Submit</button></div></form></div>
```

---

**Assignment 92:** Show `.is-valid` and `.is-invalid` states with `.valid-feedback` / `.invalid-feedback`.

```html
<div class="container py-3"><div class="mb-3"><label class="form-label" for="ok">Ok</label><input type="text" class="form-control is-valid" id="ok" value="good"><div class="valid-feedback">Looks good.</div></div>
<div class="mb-3"><label class="form-label" for="bad">Bad</label><input type="text" class="form-control is-invalid" id="bad"><div class="invalid-feedback">Fix this.</div></div></div>
```

---

**Assignment 93:** Build a form using grid: `.row`, `.col-md-6` for name fields, full width for address.

```html
<div class="container py-3"><form class="row g-3"><div class="col-md-6"><label class="form-label">First</label><input class="form-control"></div><div class="col-md-6"><label class="form-label">Last</label><input class="form-control"></div>
<div class="col-12"><label class="form-label">Address</label><input class="form-control"></div></form></div>
```

---

**Assignment 94:** Create an inline-ish layout with `.row.g-3.align-items-end` and submit button.

```html
<div class="container py-3"><form class="row g-3 align-items-end"><div class="col-auto"><label class="form-label">Q</label><input class="form-control"></div><div class="col-auto"><button type="submit" class="btn btn-primary">Go</button></div></form></div>
```

---

**Assignment 95:** Use `.form-text` for help below an input.

```html
<div class="container py-3"><label for="h" class="form-label">Username</label><input type="text" class="form-control" id="h" aria-describedby="hh"><div id="hh" class="form-text">Letters only.</div></div>
```

---

**Assignment 96:** Disable a fieldset with `disabled` on `<fieldset>` wrapping controls.

```html
<div class="container py-3"><fieldset disabled><legend class="float-none w-auto px-2 fs-6">Disabled set</legend><input class="form-control mb-2" placeholder="cannot type"><button class="btn btn-secondary">Nope</button></fieldset></div>
```

---

**Assignment 97:** Use `.form-control-plaintext` for read-only display of an email.

```html
<div class="container py-3"><div class="mb-3 row"><label class="col-sm-2 col-form-label">Email</label><div class="col-sm-10"><input type="text" readonly class="form-control-plaintext" id="ro" value="you@example.com"></div></div></div>
```

---

**Assignment 98:** Combine validation, floating labels, and input group in one signup form.

```html
<div class="container py-3" style="max-width:420px"><form class="needs-validation" novalidate><div class="form-floating mb-2"><input type="email" class="form-control" id="se" required placeholder="e"><label for="se">Email</label></div>
<div class="input-group mb-2"><span class="input-group-text">Pw</span><input type="password" class="form-control" required><div class="invalid-feedback d-block">Need password.</div></div><button class="btn btn-primary w-100" type="submit">Join</button></form></div>
```

---

**Assignment 99:** Create a button that opens a basic modal via `data-bs-toggle="modal"` and `data-bs-target`.

```html
<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#m1">Open</button>
<div class="modal fade" id="m1" tabindex="-1" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h1 class="modal-title fs-5">Hi</h1><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body">Body</div></div></div></div>
```

---

**Assignment 100:** Set `data-bs-backdrop="static"` and `data-bs-keyboard="false"` on a modal.

```html
<button class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#m2">Static</button>
<div class="modal fade" id="m2" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h1 class="modal-title fs-5">No backdrop close</h1><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body">Use button.</div></div></div></div>
```

---

**Assignment 101:** Use `.modal-dialog-scrollable` for long modal body content.

```html
<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#m3">Scroll</button>
<div class="modal fade" id="m3" tabindex="-1"><div class="modal-dialog modal-dialog-scrollable"><div class="modal-content"><div class="modal-header"><h1 class="modal-title fs-5">Long</h1><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body"><p class="mb-2">Line</p><p class="mb-2">Line</p><p class="mb-2">Line</p><p class="mb-2">Line</p><p class="mb-2">Line</p><p class="mb-2">Line</p><p class="mb-2">Line</p><p class="mb-2">Line</p></div></div></div></div>
```

---

**Assignment 102:** Center the modal with `.modal-dialog-centered`.

```html
<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#m4">Center</button>
<div class="modal fade" id="m4" tabindex="-1"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-body">Centered.</div><div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">Close</button></div></div></div></div>
```

---

**Assignment 103:** Use `.modal-fullscreen` (or `modal-fullscreen-md-down`) for a responsive fullscreen modal.

```html
<button class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#m5">Full</button>
<div class="modal fade" id="m5" tabindex="-1"><div class="modal-dialog modal-fullscreen-md-down"><div class="modal-content"><div class="modal-header"><h1 class="modal-title fs-5">Fullscreen md-</h1><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body">Resize to compare.</div></div></div></div>
```

---

**Assignment 104:** Put a small form (email + submit) inside `.modal-body`.

```html
<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#m6">Form</button>
<div class="modal fade" id="m6" tabindex="-1"><div class="modal-dialog"><form class="modal-content"><div class="modal-header"><h1 class="modal-title fs-5">Subscribe</h1><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body"><label class="form-label" for="em">Email</label><input type="email" class="form-control" id="em" required></div><div class="modal-footer"><button type="submit" class="btn btn-primary">Send</button></div></form></div></div>
```

---

**Assignment 105:** Create an offcanvas panel from the start (`offcanvas-start`) with a list of links.

```html
<button class="btn btn-primary" data-bs-toggle="offcanvas" data-bs-target="#oc1">Start</button>
<div class="offcanvas offcanvas-start" tabindex="-1" id="oc1"><div class="offcanvas-header"><h5 class="offcanvas-title">Nav</h5><button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button></div><div class="offcanvas-body"><div class="list-group"><a href="#" class="list-group-item list-group-item-action">A</a><a href="#" class="list-group-item list-group-item-action">B</a></div></div></div>
```

---

**Assignment 106:** Add `offcanvas-end` with contact details and a close button.

```html
<button class="btn btn-outline-primary" data-bs-toggle="offcanvas" data-bs-target="#oc2">End</button>
<div class="offcanvas offcanvas-end" tabindex="-1" id="oc2"><div class="offcanvas-header"><h5 class="offcanvas-title">Contact</h5><button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button></div><div class="offcanvas-body"><p class="small mb-0">hello@example.com</p></div></div>
```

---

**Assignment 107:** Use `offcanvas-top` for a thin announcement bar pattern.

```html
<button class="btn btn-sm btn-secondary" data-bs-toggle="offcanvas" data-bs-target="#oc3">Top</button>
<div class="offcanvas offcanvas-top" tabindex="-1" id="oc3" style="height:120px"><div class="offcanvas-header py-2"><h6 class="offcanvas-title">Announcement</h6><button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button></div><div class="offcanvas-body py-0"><p class="small mb-0">Sale ends tonight.</p></div></div>
```

---

**Assignment 108:** Use `offcanvas-bottom` with a mobile cart summary.

```html
<button class="btn btn-dark" data-bs-toggle="offcanvas" data-bs-target="#oc4">Cart</button>
<div class="offcanvas offcanvas-bottom" tabindex="-1" id="oc4" style="height:auto"><div class="offcanvas-header"><h5 class="offcanvas-title">Cart</h5><button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button></div><div class="offcanvas-body"><p class="mb-0">2 items · $42</p></div></div>
```

---

**Assignment 109:** Build a basic `.carousel` with three slides and prev/next controls.

```html
<div id="car" class="carousel slide" data-bs-ride="carousel"><div class="carousel-inner"><div class="carousel-item active"><div class="bg-primary text-white p-5 text-center">1</div></div><div class="carousel-item"><div class="bg-secondary text-white p-5 text-center">2</div></div><div class="carousel-item"><div class="bg-dark text-white p-5 text-center">3</div></div></div>
<button class="carousel-control-prev" type="button" data-bs-target="#car" data-bs-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Prev</span></button>
<button class="carousel-control-next" type="button" data-bs-target="#car" data-bs-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Next</span></button></div>
```

---

**Assignment 110:** Add `.carousel-caption` on each slide with title and text.

```html
<div id="car2" class="carousel slide"><div class="carousel-inner"><div class="carousel-item active"><div class="ratio ratio-21x9 bg-dark"><div class="carousel-caption d-none d-md-block"><h5>One</h5><p>Caption</p></div></div></div><div class="carousel-item"><div class="ratio ratio-21x9 bg-secondary"><div class="carousel-caption"><h5>Two</h5></div></div></div></div>
<button class="carousel-control-prev" type="button" data-bs-target="#car2" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span></button>
<button class="carousel-control-next" type="button" data-bs-target="#car2" data-bs-slide="next"><span class="carousel-control-next-icon"></span></button></div>
```

---

**Assignment 111:** Show `.carousel-indicators` with `data-bs-target` buttons.

```html
<div id="car3" class="carousel slide"><div class="carousel-indicators"><button type="button" data-bs-target="#car3" data-bs-slide-to="0" class="active"></button><button type="button" data-bs-target="#car3" data-bs-slide-to="1"></button></div><div class="carousel-inner"><div class="carousel-item active"><div class="p-5 bg-light border">A</div></div><div class="carousel-item"><div class="p-5 bg-light border">B</div></div></div></div>
```

---

**Assignment 112:** Add `.carousel-fade` for crossfade transition.

```html
<div id="car4" class="carousel slide carousel-fade" data-bs-ride="carousel"><div class="carousel-inner"><div class="carousel-item active"><div class="p-5 bg-info">A</div></div><div class="carousel-item"><div class="p-5 bg-warning">B</div></div></div>
<button class="carousel-control-prev" type="button" data-bs-target="#car4" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span></button>
<button class="carousel-control-next" type="button" data-bs-target="#car4" data-bs-slide="next"><span class="carousel-control-next-icon"></span></button></div>
```

---

**Assignment 113:** Set `data-bs-ride="carousel"` and `data-bs-interval` for autoplay behavior.

```html
<div id="car5" class="carousel slide" data-bs-ride="carousel" data-bs-interval="2000"><div class="carousel-inner"><div class="carousel-item active"><div class="p-4 bg-primary text-white">Auto 2s</div></div><div class="carousel-item"><div class="p-4 bg-success text-white">Slide 2</div></div></div></div>
```

---

**Assignment 114:** Create a default `.accordion` with three `.accordion-item` components.

```html
<div class="accordion" id="acc"><div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#a1">One</button></h2><div id="a1" class="accordion-collapse collapse show" data-bs-parent="#acc"><div class="accordion-body">A</div></div></div>
<div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#a2">Two</button></h2><div id="a2" class="accordion-collapse collapse" data-bs-parent="#acc"><div class="accordion-body">B</div></div></div></div>
```

---

**Assignment 115:** Use `.accordion-collapse` with `.show` on multiple items (always-open pattern via separate collapse IDs).

```html
<div class="d-flex flex-column gap-2"><button class="btn btn-outline-primary" type="button" data-bs-toggle="collapse" data-bs-target="#c1">T1</button><div class="collapse show" id="c1"><div class="card card-body">Open 1</div></div>
<button class="btn btn-outline-primary" type="button" data-bs-toggle="collapse" data-bs-target="#c2">T2</button><div class="collapse show" id="c2"><div class="card card-body">Open 2 (always-open)</div></div></div>
```

---

**Assignment 116:** Apply `.accordion-flush` inside a card-like container.

```html
<div class="card"><div class="card-body p-0"><div class="accordion accordion-flush" id="af"><div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#f1">Q</button></h2><div id="f1" class="accordion-collapse collapse" data-bs-parent="#af"><div class="accordion-body">A</div></div></div></div></div></div>
```

---

**Assignment 117:** Initialize tooltips in JS and add buttons with `data-bs-toggle="tooltip"` for top/bottom placements.

```html
<div class="p-5 d-flex gap-2 flex-wrap"><button type="button" class="btn btn-secondary" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Top tip">Top</button>
<button type="button" class="btn btn-secondary" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Bottom tip">Bottom</button></div>
<script>document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el=>new bootstrap.Tooltip(el));});</script>
```

---

**Assignment 118:** Use `data-bs-placement="left"` and `"right"` on tooltip triggers.

```html
<div class="p-5 d-flex gap-2"><button type="button" class="btn btn-outline-dark" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title="Left">Left</button>
<button type="button" class="btn btn-outline-dark" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="Right">Right</button></div>
<script>document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el=>new bootstrap.Tooltip(el));});</script>
```

---

**Assignment 119:** Enable a popover with `data-bs-toggle="popover"` and `data-bs-content`.

```html
<button type="button" class="btn btn-lg btn-danger" data-bs-toggle="popover" data-bs-title="Title" data-bs-content="Popover body.">Pop</button>
<script>document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el=>new bootstrap.Popover(el));});</script>
```

---

**Assignment 120:** Set `data-bs-html="true"` on a popover with simple HTML in the content (trusted content only).

```html
<button type="button" class="btn btn-info" data-bs-toggle="popover" data-bs-html="true" data-bs-title="HTML" data-bs-content="<strong>Bold</strong> <em>trusted HTML only</em>">HTML pop</button>
<script>document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el=>new bootstrap.Popover(el));});</script>
```

---

**Assignment 121:** Place a toast `.toast` inside `.toast-container` with a live region.

```html
<div class="toast-container position-fixed bottom-0 end-0 p-3"><div id="liveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true"><div class="toast-header"><strong class="me-auto">App</strong><button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button></div><div class="toast-body">Hello</div></div></div>
<button type="button" class="btn btn-primary" id="btnLiveToast">Show</button>
<script>document.getElementById("btnLiveToast").addEventListener("click",()=>bootstrap.Toast.getOrCreateInstance(document.getElementById("liveToast")).show());</script>
```

---

**Assignment 122:** Use `data-bs-autohide="true"` and `data-bs-delay` on a toast.

```html
<div class="toast-container position-fixed top-0 end-0 p-3"><div class="toast align-items-center text-bg-success border-0" id="t2" role="alert" data-bs-autohide="true" data-bs-delay="1500"><div class="d-flex"><div class="toast-body">Auto hide</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div></div></div>
<button class="btn btn-success" type="button" id="bt2">Toast</button><script>document.getElementById("bt2").addEventListener("click",()=>bootstrap.Toast.getOrCreateInstance(document.getElementById("t2")).show());</script>
```

---

**Assignment 123:** Stack multiple toasts vertically in one container.

```html
<div class="toast-container position-fixed bottom-0 start-0 p-3"><div class="toast text-bg-primary" id="x1"><div class="toast-body">One</div></div><div class="toast text-bg-dark mt-2" id="x2"><div class="toast-body">Two</div></div></div>
<button class="btn btn-primary btn-sm" id="sx">Stack</button><script>document.getElementById("sx").onclick=()=>{bootstrap.Toast.getOrCreateInstance(document.getElementById("x1")).show();bootstrap.Toast.getOrCreateInstance(document.getElementById("x2")).show();};</script>
```

---

**Assignment 124:** Add a “Show toast” button that displays a hidden toast using Bootstrap’s Toast API in a script.

```html
<div class="toast-container position-fixed end-0 bottom-0 p-3" id="tc"></div>
<button class="btn btn-outline-primary" id="tm">Show toast</button>
<template id="tpl"><div class="toast align-items-center" role="alert"><div class="d-flex"><div class="toast-body"></div><button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button></div></div></template>
<script>
function showToast(msg){
  const t=document.getElementById("tpl").content.firstElementChild.cloneNode(true);
  t.querySelector(".toast-body").textContent=msg;
  document.getElementById("tc").appendChild(t);
  bootstrap.Toast.getOrCreateInstance(t).show();
}
document.getElementById("tm").onclick=()=>showToast("Saved!");
</script>
```

---

**Assignment 125:** Basic single `.dropdown` button menu with three items.

```html
<div class="dropdown"><button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">Menu</button>
<ul class="dropdown-menu"><li><a class="dropdown-item" href="#">A</a></li><li><a class="dropdown-item" href="#">B</a></li><li><a class="dropdown-item" href="#">C</a></li></ul></div>
```

---

**Assignment 126:** Build a split button dropdown `.dropdown-toggle-split`.

```html
<div class="btn-group"><button type="button" class="btn btn-danger">Act</button><button type="button" class="btn btn-danger dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false"><span class="visually-hidden">Toggle</span></button>
<ul class="dropdown-menu"><li><a class="dropdown-item" href="#">1</a></li><li><a class="dropdown-item" href="#">2</a></li></ul></div>
```

---

**Assignment 127:** Use `.dropup`, `.dropend`, `.dropstart` variations with dropdown menus.

```html
<div class="d-flex flex-wrap gap-5 p-5"><div class="dropup"><button class="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">Up</button><ul class="dropdown-menu"><li><a class="dropdown-item" href="#">x</a></li></ul></div>
<div class="dropend"><button class="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">End</button><ul class="dropdown-menu"><li><a class="dropdown-item" href="#">y</a></li></ul></div>
<div class="dropstart"><button class="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">Start</button><ul class="dropdown-menu"><li><a class="dropdown-item" href="#">z</a></li></ul></div></div>
```

---

**Assignment 128:** Create `.nav.nav-tabs` with tab panes using `data-bs-toggle="tab"`.

```html
<ul class="nav nav-tabs" id="tb" role="tablist"><li class="nav-item" role="presentation"><button class="nav-link active" id="t1-tab" data-bs-toggle="tab" data-bs-target="#t1" type="button" role="tab">A</button></li>
<li class="nav-item" role="presentation"><button class="nav-link" id="t2-tab" data-bs-toggle="tab" data-bs-target="#t2" type="button" role="tab">B</button></li></ul>
<div class="tab-content border border-top-0 p-3"><div class="tab-pane fade show active" id="t1" role="tabpanel">Pane A</div><div class="tab-pane fade" id="t2" role="tabpanel">Pane B</div></div>
```

---

**Assignment 129:** Use `.nav-pills` instead of tabs for the same content panels.

```html
<ul class="nav nav-pills mb-3" role="tablist"><li class="nav-item"><button class="nav-link active" data-bs-toggle="pill" data-bs-target="#p1" type="button">1</button></li>
<li class="nav-item"><button class="nav-link" data-bs-toggle="pill" data-bs-target="#p2" type="button">2</button></li></ul>
<div class="tab-content"><div class="tab-pane fade show active" id="p1">One</div><div class="tab-pane fade" id="p2">Two</div></div>
```

---

**Assignment 130:** Stack `.nav.flex-column.nav-pills` for vertical navigation (width col-3 + content col-9).

```html
<div class="row"><div class="col-3"><div class="nav flex-column nav-pills" role="tablist"><button class="nav-link active" data-bs-toggle="pill" data-bs-target="#vp1">Home</button>
<button class="nav-link" data-bs-toggle="pill" data-bs-target="#vp2">Profile</button></div></div><div class="col-9"><div class="tab-content"><div class="tab-pane fade show active" id="vp1">Home content</div><div class="tab-pane fade" id="vp2">Profile content</div></div></div></div>
```

---

**Assignment 131:** Wire tab buttons to `.tab-content` and `.tab-pane` with `fade`.

```html
<ul class="nav nav-tabs"><li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#f1">A</button></li><li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#f2">B</button></li></ul>
<div class="tab-content p-3"><div class="tab-pane fade show active" id="f1">Alpha</div><div class="tab-pane fade" id="f2">Beta</div></div>
```

---

**Assignment 132:** Put a dropdown inside a tab bar item.

```html
<ul class="nav nav-tabs"><li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#z1">Tab</button></li>
<li class="nav-item dropdown"><a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#">More</a><ul class="dropdown-menu"><li><a class="dropdown-item" href="#">Item</a></li></ul></li></ul>
<div class="tab-content p-3"><div class="tab-pane fade show active" id="z1">Main</div></div>
```

---

**Assignment 133:** Build a toolbar using `.d-flex`, `.justify-content-between`, `.align-items-center`, and `.gap-2`.

```html
<div class="d-flex justify-content-between align-items-center gap-2 p-3 border bg-body-tertiary flex-wrap"><span class="fw-semibold">Toolbar</span>
<div class="d-flex gap-2"><button class="btn btn-sm btn-primary">New</button><button class="btn btn-sm btn-outline-secondary">Filter</button></div></div>
```

---

**Assignment 134:** Demonstrate `.position-static`, `.position-relative`, `.position-absolute`, and `.top-0.end-0` corner badge.

```html
<div class="position-relative p-5 bg-light border m-3" style="min-height:140px"><span class="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger">9</span><p class="mb-0">Relative + absolute badge</p></div>
<p class="small px-3"><code>.position-static</code> is default.</p>
```

---

**Assignment 135:** Use responsive display: `.d-none.d-md-flex` on a flex row.

```html
<div class="container py-2"><div class="d-none d-md-flex gap-2 bg-success text-white p-2 rounded">Visible md+ flex</div><div class="d-md-none text-muted small">Mobile: row hidden</div></div>
```

---

**Assignment 136:** Apply `.overflow-hidden`, `.overflow-auto` on fixed-height boxes.

```html
<div class="container py-3"><div class="border p-2 mb-2 overflow-hidden" style="height:60px">Hidden overflow — — — — —</div>
<div class="border p-2 overflow-auto" style="height:60px">Scroll — — — — — — — — —</div></div>
```

---

**Assignment 137:** Show shadow utilities `.shadow`, `.shadow-sm`, `.shadow-lg`, `.shadow-none`.

```html
<div class="container py-3 d-flex flex-wrap gap-3"><div class="p-4 bg-white shadow-sm border">sm</div><div class="p-4 bg-white shadow border">md</div><div class="p-4 bg-white shadow-lg border">lg</div><div class="p-4 bg-white shadow-none border">none</div></div>
```

---

**Assignment 138:** Combine `.border`, `.border-top`, `.rounded-3`, `.rounded-circle` on UI chips.

```html
<div class="container py-3 d-flex flex-wrap gap-2 align-items-center"><span class="border p-2 rounded">rounded</span><span class="border p-2 rounded-circle d-inline-flex align-items-center justify-content-center" style="width:48px;height:48px">O</span>
<span class="border p-2 rounded-3 bg-body-secondary">rounded-3</span></div>
```

---

**Assignment 139:** Use `.visible` and `.invisible` (and explain visibility vs display).

```html
<div class="container py-3"><div class="d-flex gap-3"><div class="border p-3 visible">visible</div><div class="border p-3 invisible">invisible</div></div>
<p class="small text-muted mt-2"><code>.d-none</code> removes layout; <code>.invisible</code> hides only visually.</p></div>
```

---

**Assignment 140:** Create a card where the whole card is clickable using `.stretched-link` on a nested anchor.

```html
<div class="container py-3"><div class="card" style="max-width:22rem"><img src="https://picsum.photos/seed/sl/400/200" class="card-img-top" alt=""><div class="card-body position-relative"><h5 class="card-title">Title</h5><p class="card-text">Stretched link.</p><a href="#" class="stretched-link">More</a></div></div></div>
```

## ADVANCED (Assignments 141–200)

---

**Assignment 141:** Build an admin dashboard shell: top navbar, sidebar column, and main content with cards.

```html
<div class="container-fluid"><nav class="navbar bg-dark navbar-dark mb-3"><div class="container-fluid"><span class="navbar-brand">Admin</span></div></nav>
<div class="row g-3"><aside class="col-lg-2 d-none d-lg-block"><div class="list-group"><a class="list-group-item active" href="#">Dash</a><a class="list-group-item" href="#">Users</a></div></aside>
<main class="col-lg-10"><div class="row g-3"><div class="col-md-4"><div class="card"><div class="card-body"><h6 class="text-muted">Sales</h6><p class="fs-3 mb-0">$12k</p></div></div></div><div class="col-md-8"><div class="card"><div class="card-body">Chart placeholder</div></div></div></div></main></div></div>
```

---

**Assignment 142:** Create an e-commerce product grid using responsive columns and uniform-height product cards.

```html
<div class="container py-3"><div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
<div class="col"><div class="card h-100"><img src="https://picsum.photos/seed/p1/400/240" class="card-img-top" alt=""><div class="card-body d-flex flex-column"><h5 class="card-title">Product</h5><p class="card-text small text-muted">Short desc</p><button class="btn btn-primary mt-auto">Add</button></div></div></div>
<div class="col"><div class="card h-100"><img src="https://picsum.photos/seed/p2/400/240" class="card-img-top" alt=""><div class="card-body d-flex flex-column"><h5 class="card-title">Product</h5><p class="card-text small">Desc</p><button class="btn btn-primary mt-auto">Add</button></div></div></div>
<div class="col"><div class="card h-100"><img src="https://picsum.photos/seed/p3/400/240" class="card-img-top" alt=""><div class="card-body d-flex flex-column"><h5 class="card-title">Product</h5><p class="card-text small">Desc</p><button class="btn btn-primary mt-auto">Add</button></div></div></div></div></div>
```

---

**Assignment 143:** Layout a blog: featured post row, list of posts, sidebar with widgets.

```html
<div class="container py-4"><div class="row g-4"><div class="col-lg-8"><article class="card mb-3"><img src="https://picsum.photos/seed/feat/800/320" class="card-img-top" alt=""><div class="card-body"><h2 class="h4">Featured</h2><p class="card-text">Lead post summary.</p></div></article><div class="list-group"><a href="#" class="list-group-item list-group-item-action">Older post</a><a href="#" class="list-group-item list-group-item-action">Older post</a></div></div>
<aside class="col-lg-4"><div class="card mb-3"><div class="card-header">About</div><div class="card-body small">Widget</div></div><div class="card"><div class="card-header">Tags</div><div class="card-body"><span class="badge text-bg-secondary me-1">css</span><span class="badge text-bg-secondary">html</span></div></div></aside></div></div>
```

---

**Assignment 144:** Portfolio gallery: masonry-style feel using a multi-column card grid and varied card heights.

```html
<div class="container py-3"><div class="row g-3">
<div class="col-sm-6 col-lg-4"><div class="card"><div class="card-body" style="min-height:120px">Short</div></div></div>
<div class="col-sm-6 col-lg-4"><div class="card"><div class="card-body" style="min-height:220px">Tall card</div></div></div>
<div class="col-sm-6 col-lg-4"><div class="card"><div class="card-body" style="min-height:160px">Medium</div></div></div></div>
<p class="small text-muted">Varied card heights in a multi-column grid (no Masonry JS).</p></div>
```

---

**Assignment 145:** Pricing page: three tier cards, middle tier emphasized with border/shadow.

```html
<div class="container py-4"><div class="row row-cols-1 row-cols-md-3 g-4 align-items-center"><div class="col"><div class="card h-100"><div class="card-body"><h5 class="card-title">Starter</h5><p class="display-6">$0</p><button class="btn btn-outline-primary w-100">Pick</button></div></div></div>
<div class="col"><div class="card h-100 border-primary shadow"><div class="card-header text-bg-primary">Popular</div><div class="card-body"><h5 class="card-title">Pro</h5><p class="display-6">$19</p><button class="btn btn-primary w-100">Pick</button></div></div></div>
<div class="col"><div class="card h-100"><div class="card-body"><h5 class="card-title">Team</h5><p class="display-6">$49</p><button class="btn btn-outline-primary w-100">Pick</button></div></div></div></div></div>
```

---

**Assignment 146:** Landing page: hero (jumbotron-style), features row, CTA, footer.

```html
<header class="bg-primary text-white py-5"><div class="container py-5"><h1 class="display-5">Hero headline</h1><p class="lead">Subcopy and CTA below.</p><a class="btn btn-light btn-lg" href="#">Get started</a></div></header>
<section class="py-5"><div class="container"><div class="row g-4"><div class="col-md-4"><h3>Feature</h3><p class="text-muted">Text</p></div><div class="col-md-4"><h3>Feature</h3><p class="text-muted">Text</p></div><div class="col-md-4"><h3>Feature</h3><p class="text-muted">Text</p></div></div></div></section>
<footer class="bg-body-tertiary py-4"><div class="container small text-center mb-0">© 2025</div></footer>
```

---

**Assignment 147:** Team page: responsive `.row-cols-*` of team member cards.

```html
<div class="container py-4"><div class="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
<div class="col"><div class="card text-center"><div class="card-body"><img class="rounded-circle mb-3" src="https://picsum.photos/seed/t1/96/96" width="96" height="96" alt=""><h5 class="card-title mb-0">Alex</h5><p class="text-muted small">Dev</p></div></div></div>
<div class="col"><div class="card text-center"><div class="card-body"><img class="rounded-circle mb-3" src="https://picsum.photos/seed/t2/96/96" width="96" height="96" alt=""><h5 class="card-title mb-0">Bo</h5><p class="text-muted small">Design</p></div></div></div>
<div class="col"><div class="card text-center"><div class="card-body"><img class="rounded-circle mb-3" src="https://picsum.photos/seed/t3/96/96" width="96" height="96" alt=""><h5 class="card-title mb-0">Cy</h5><p class="text-muted small">PM</p></div></div></div>
<div class="col"><div class="card text-center"><div class="card-body"><img class="rounded-circle mb-3" src="https://picsum.photos/seed/t4/96/96" width="96" height="96" alt=""><h5 class="card-title mb-0">Di</h5><p class="text-muted small">Ops</p></div></div></div></div></div>
```

---

**Assignment 148:** Split login/registration: two columns on `lg`, stacked on mobile.

```html
<div class="container py-4"><div class="row g-4"><div class="col-lg-6"><div class="card h-100"><div class="card-body"><h2 class="h4">Login</h2><form><div class="mb-3"><label class="form-label">Email</label><input class="form-control"></div><div class="mb-3"><label class="form-label">Password</label><input type="password" class="form-control"></div><button class="btn btn-primary">Sign in</button></form></div></div></div>
<div class="col-lg-6"><div class="card h-100"><div class="card-body"><h2 class="h4">Register</h2><form><div class="mb-3"><label class="form-label">Name</label><input class="form-control"></div><div class="mb-3"><label class="form-label">Email</label><input class="form-control"></div><button class="btn btn-outline-primary">Create</button></form></div></div></div></div></div>
```

---

**Assignment 149:** Multi-column footer with headings, links, and social row.

```html
<footer class="bg-dark text-white pt-5 pb-3"><div class="container"><div class="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4"><div class="col"><h6>Brand</h6><p class="small text-secondary">Tagline</p></div><div class="col"><h6>Product</h6><ul class="list-unstyled small"><li><a href="#" class="link-light link-underline-opacity-0">Pricing</a></li><li><a href="#" class="link-light link-underline-opacity-0">Docs</a></li></ul></div><div class="col"><h6>Company</h6><ul class="list-unstyled small"><li><a href="#" class="link-light link-underline-opacity-0">About</a></li></ul></div><div class="col"><h6>Social</h6><div class="d-flex gap-2"><a class="btn btn-sm btn-outline-light" href="#">X</a><a class="btn btn-sm btn-outline-light" href="#">in</a></div></div></div><hr class="border-secondary"><p class="small text-center text-secondary mb-0">© 2025</p></div></footer>
```

---

**Assignment 150:** Sidebar layout: collapsible sidebar + main; sidebar `col-lg-3`, content `col-lg-9`.

```html
<div class="container-fluid py-3"><div class="row"><nav class="col-lg-3 mb-3"><div class="list-group"><a class="list-group-item active" href="#">Overview</a><a class="list-group-item" href="#">Reports</a></div></nav>
<section class="col-lg-9"><div class="card"><div class="card-body"><h1 class="h4">Main</h1><p class="text-muted mb-0">Content beside sidebar.</p></div></div></section></div></div>
```

---

**Assignment 151:** Sticky sidebar with `.sticky-top` while main content scrolls (within a two-column row).

```html
<div class="container py-3"><div class="row align-items-start"><div class="col-lg-4"><div class="sticky-top pt-2" style="top:1rem"><div class="card"><div class="card-body"><h5 class="card-title">Sticky sidebar</h5><p class="small mb-0">Scroll main column.</p></div></div></div></div>
<div class="col-lg-8"><div class="vstack gap-3" style="min-height:160vh"><div class="card"><div class="card-body">Section</div></div><div class="card"><div class="card-body">Section</div></div><div class="card"><div class="card-body">Section</div></div></div></div></div></div>
```

---

**Assignment 152:** “Masonry” simulation: multiple columns of cards with different lengths (no Masonry JS).

```html
<div class="container py-3"><div class="row g-3">
<div class="col-md-4"><div class="card"><div class="card-body" style="min-height:180px">Tall</div></div></div>
<div class="col-md-4"><div class="card"><div class="card-body" style="min-height:100px">Short</div></div></div>
<div class="col-md-4"><div class="card"><div class="card-body" style="min-height:140px">Mid</div></div></div>
<div class="col-md-6"><div class="card"><div class="card-body" style="min-height:120px">Wide</div></div></div>
<div class="col-md-6"><div class="card"><div class="card-body" style="min-height:200px">Wide tall</div></div></div></div></div>
```

---

**Assignment 153:** Open a modal programmatically using `bootstrap.Modal` constructor and `.show()`.

```html
<button class="btn btn-primary" id="openM">Open modal (JS)</button>
<div class="modal fade" id="jsModal" tabindex="-1" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h1 class="modal-title fs-5">JS Modal</h1><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body">Shown via API</div></div></div></div>
<script>document.getElementById("openM").addEventListener("click",()=>{const el=document.getElementById("jsModal");bootstrap.Modal.getOrCreateInstance(el).show();});</script>
```

---

**Assignment 154:** Initialize all `[data-bs-toggle="tooltip"]` on `DOMContentLoaded`.

```html
<button class="btn btn-secondary" data-bs-toggle="tooltip" data-bs-title="Tip">Hover</button>
<script>document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el=>new bootstrap.Tooltip(el));});</script>
```

---

**Assignment 155:** Create a popover whose content is updated before show using the `inserted.bs.popover` event.

```html
<button class="btn btn-warning" id="popBtn" type="button" data-bs-toggle="popover" data-bs-title="Title" data-bs-content="Initial">Popover</button>
<script>document.addEventListener("DOMContentLoaded",()=>{const btn=document.getElementById("popBtn");const p=bootstrap.Popover.getOrCreateInstance(btn);btn.addEventListener("show.bs.popover",()=>{p.setContent({".popover-body":"Updated "+new Date().toLocaleTimeString()});});});</script>
```

---

**Assignment 156:** Implement scrollspy: `body { position: relative; }`, `.navbar` with `data-bs-spy="scroll"` targets.

```html
<body data-bs-spy="scroll" data-bs-target="#nav" data-bs-root-margin="0px 0px -25%" data-bs-smooth-scroll="true" tabindex="0" style="position:relative;min-height:200vh">
<nav id="nav" class="navbar navbar-light bg-light sticky-top px-3"><ul class="nav nav-pills"><li class="nav-item"><a class="nav-link" href="#s1">S1</a></li><li class="nav-item"><a class="nav-link" href="#s2">S2</a></li></ul></nav>
<div id="s1" class="p-5"><h2>Section 1</h2><p>Content</p></div><div id="s2" class="p-5"><h2>Section 2</h2><p>Content</p></div></body>
```

---

**Assignment 157:** Toggle a collapse panel with `bootstrap.Collapse.getOrCreateInstance` in a button click handler.

```html
<button class="btn btn-primary" id="togC" type="button">Toggle</button>
<div class="collapse" id="cp"><div class="card card-body">Panel</div></div>
<script>document.getElementById("togC").addEventListener("click",()=>{bootstrap.Collapse.getOrCreateInstance(document.getElementById("cp")).toggle();});</script>
```

---

**Assignment 158:** Move carousel to a specific slide with the Carousel API `.to()`.

```html
<div id="jc" class="carousel slide"><div class="carousel-inner"><div class="carousel-item active"><div class="p-5 bg-light border">0</div></div><div class="carousel-item"><div class="p-5 bg-light border">1</div></div><div class="carousel-item"><div class="p-5 bg-light border">2</div></div></div></div>
<button class="btn btn-dark mt-2" id="go2" type="button">Go to slide 2</button>
<script>document.getElementById("go2").addEventListener("click",()=>{bootstrap.Carousel.getOrCreateInstance(document.getElementById("jc")).to(2);});</script>
```

---

**Assignment 159:** Write a minimal “toast manager” function `showToast(message)` that clones a template toast and shows it.

```html
<div class="toast-container position-fixed bottom-0 end-0 p-3" id="tmgr"></div>
<button class="btn btn-success" id="tgo" type="button">Notify</button>
<template id="ttpl"><div class="toast" role="alert"><div class="d-flex"><div class="toast-body"></div><button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button></div></div></template>
<script>
function showToastMessage(m){const n=document.getElementById("ttpl").content.firstElementChild.cloneNode(true);n.querySelector(".toast-body").textContent=m;document.getElementById("tmgr").appendChild(n);bootstrap.Toast.getOrCreateInstance(n).show();}
document.getElementById("tgo").onclick=()=>showToastMessage("Done");
</script>
```

---

**Assignment 160:** Listen for `hidden.bs.dropdown` and log or update UI state.

```html
<div class="dropdown"><button class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" id="ddb">Log</button><ul class="dropdown-menu"><li><a class="dropdown-item" href="#">A</a></li></ul></div>
<script>document.getElementById("ddb").addEventListener("hidden.bs.dropdown",()=>console.log("dropdown hidden"));</script>
```

---

**Assignment 161:** Use the browser Constraint Validation API alongside Bootstrap visual states on submit.

```html
<form class="container py-3" id="vf" novalidate><div class="mb-3"><input class="form-control" required placeholder="required"></div><button class="btn btn-primary" type="submit">Submit</button></form>
<script>document.getElementById("vf").addEventListener("submit",e=>{e.preventDefault();const f=e.target;if(!f.checkValidity()){e.stopPropagation();f.classList.add("was-validated");}});</script>
```

---

**Assignment 162:** Dispatch and listen for a custom `app:themechange` event when toggling dark mode.

```html
<button class="btn btn-outline-dark" id="th" type="button">Toggle theme event</button>
<script>document.getElementById("th").addEventListener("click",()=>{document.documentElement.dispatchEvent(new CustomEvent("app:themechange",{detail:{theme:"dark"}}));});document.documentElement.addEventListener("app:themechange",e=>console.log(e.detail));</script>
```

---

**Assignment 163:** Programmatically show/hide offcanvas with Offcanvas API.

```html
<button class="btn btn-primary" id="oshow" type="button">Show offcanvas</button><button class="btn btn-warning" id="ohide" type="button">Hide</button>
<div class="offcanvas offcanvas-start" tabindex="-1" id="oj"><div class="offcanvas-header"><h5 class="offcanvas-title">OC</h5><button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button></div><div class="offcanvas-body">Hi</div></div>
<script>const o=document.getElementById("oj");const api=bootstrap.Offcanvas.getOrCreateInstance(o);document.getElementById("oshow").onclick=()=>api.show();document.getElementById("ohide").onclick=()=>api.hide();</script>
```

---

**Assignment 164:** Combine Modal events (`show.bs.modal`) to focus the first input when opened.

```html
<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#mf">Open</button>
<div class="modal fade" id="mf" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-body"><label class="form-label" for="fi">First</label><input class="form-control" id="fi"></div></div></div></div>
<script>document.getElementById("mf").addEventListener("shown.bs.modal",()=>document.getElementById("fi").focus());</script>
```

---

**Assignment 165:** Document (in comments) key Sass variables you would override for brand colors (`$primary`, etc.).

```html
<!--
  Sass example overrides:
  $primary: #6f42c1;
  $secondary: #6610f2;
  $body-bg: #f8f9fa;
  Then @import "bootstrap";
-->
<div class="container py-3"><p class="mb-0">See comment: typical variables are <code>$primary</code>, <code>$secondary</code>, <code>$body-bg</code>, <code>$font-family-base</code>.</p></div>
```

---

**Assignment 166:** Show a `<style>` block redefining CSS variables `--bs-primary` on `:root` for quick theming.

```html
<style>:root{--bs-primary:#6f42c1;--bs-link-color:var(--bs-primary);}</style>
<div class="container py-3"><button class="btn btn-primary">Themed primary</button><a href="#" class="ms-2">Link</a></div>
```

---

**Assignment 167:** Explain (comment) how to add a custom breakpoint in Sass (`$grid-breakpoints`).

```html
<div class="container py-3"><p class="small mb-0"><!-- Sass: $grid-breakpoints: map-merge($grid-breakpoints, (3xl: 1600px)); then regenerate CSS. --></p></div>
```

---

**Assignment 168:** Add a custom utility in a `<style>` block using the same pattern as Bootstrap utilities (single-property class).

```html
<style>.u-pointer{cursor:pointer!important;}</style><div class="container py-3"><p class="u-pointer text-primary mb-0">Custom utility class</p></div>
```

---

**Assignment 169:** Create a “stat card” component pattern using only utility classes and one extra semantic class in CSS.

```html
<div class="container py-3"><div class="card stat-card p-3 border-0 shadow-sm"><div class="text-muted text-uppercase small">MRR</div><div class="fs-2 fw-semibold">$8.4k</div></div></div>
<style>.stat-card{border-left:4px solid var(--bs-primary);}</style>
```

---

**Assignment 170:** Describe (comment) using Bootstrap’s Utility API (`utilities` map) in a custom Sass build.

```html
<div class="container py-3"><p class="small mb-0"><!-- Utility API (Sass): $utilities: map-merge($utilities, ("cursor": (property: cursor, class: cursor, values: (grab: grab, help: help)))); --></p></div>
```

---

**Assignment 171:** Override spacing scale via CSS variables `--bs-spacer` usage in a demo.

```html
<style>:root{--bs-spacer:1.25rem;}</style><div class="container py-3"><div class="p-4 border bg-body-secondary">Padding uses Bootstrap spacing scale based on spacer.</div></div>
```

---

**Assignment 172:** Build a small color palette swatch row using CSS variables mapped to buttons.

```html
<div class="container py-3 d-flex gap-2 flex-wrap"><button class="btn" style="background:var(--bs-primary);color:#fff">Primary</button><button class="btn" style="background:var(--bs-danger);color:#fff">Danger</button></div>
```

---

**Assignment 173:** Use `@import` in a commented example listing order for `functions`, `variables`, `maps`, `mixins`, `bootstrap`.

```html
<div class="container py-3"><pre class="small bg-body-secondary p-3 rounded"><code>// Custom Sass build order (excerpt)
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/variables-dark";
@import "bootstrap/scss/maps";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/root";
@import "bootstrap/scss/bootstrap";
</code></pre></div>
```

---

**Assignment 174:** Create a branded navbar color by overriding `--bs-navbar-color` / background CSS variables on a wrapper.

```html
<nav class="navbar border rounded px-3" style="--bs-navbar-color:#fff;--bs-navbar-hover-color:#e9ecef;--bs-navbar-active-color:#fff;background:#14213d">
<div class="container-fluid"><a class="navbar-brand" style="color:var(--bs-navbar-color)" href="#">Brand</a></div></nav>
```

---

**Assignment 175:** Set `data-bs-theme="light"` on `<html>` and add a button to switch to `dark` by toggling the attribute with JS.

```html
<button class="btn btn-outline-secondary" id="themeBtn" type="button">Toggle theme</button>
<script>document.getElementById("themeBtn").addEventListener("click",()=>{const h=document.documentElement;const d=h.getAttribute("data-bs-theme")==="dark";h.setAttribute("data-bs-theme",d?"light":"dark");});</script>
```

---

**Assignment 176:** Use `[data-bs-theme="dark"]` scoped styles in `<style>` to tweak card borders.

```html
<style>[data-bs-theme="dark"] .card{border-color:rgba(255,255,255,.14);}</style>
<div class="container py-3 bg-dark" data-bs-theme="dark"><div class="card"><div class="card-body">Dark scoped card borders</div></div></div>
```

---

**Assignment 177:** Apply `data-bs-theme="dark"` only on a `.card` to show per-component theming.

```html
<div class="container py-3"><div class="card" data-bs-theme="dark"><div class="card-body">Per-card dark theme</div></div></div>
```

---

**Assignment 178:** Use `prefers-color-scheme: dark` in a small script to set initial theme automatically.

```html
<script>
const pref=window.matchMedia("(prefers-color-scheme: dark)");
function applyAuto(){document.documentElement.setAttribute("data-bs-theme",pref.matches?"dark":"light");}
applyAuto();pref.addEventListener("change",applyAuto);
</script><div class="container py-3"><p class="mb-0">Initial theme follows <code>prefers-color-scheme</code>.</p></div>
```

---

**Assignment 179:** Build themed cards that look correct in both light and dark using Bootstrap semantic classes only.

```html
<div class="container py-3"><div class="row g-3"><div class="col-md-6"><div class="card border-secondary"><div class="card-body"><h5 class="card-title">Light/Dark safe</h5><p class="text-body-secondary mb-0">Semantic text</p></div></div></div></div></div>
```

---

**Assignment 180:** Add a navbar toggle icon button that switches theme and persists choice in `localStorage`.

```html
<nav class="navbar bg-body-tertiary border-bottom"><div class="container-fluid"><span class="navbar-brand">App</span><button class="btn btn-sm btn-outline-secondary ms-auto" id="ts" type="button" aria-label="Toggle theme">🌓</button></div></nav>
<script>document.getElementById("ts").addEventListener("click",()=>{const h=document.documentElement;const next=h.getAttribute("data-bs-theme")==="dark"?"light":"dark";h.setAttribute("data-bs-theme",next);localStorage.setItem("bsTheme",next);});document.addEventListener("DOMContentLoaded",()=>{const s=localStorage.getItem("bsTheme");if(s)document.documentElement.setAttribute("data-bs-theme",s);});</script>
```

---

**Assignment 181:** Responsive sidebar that becomes offcanvas on screens below `lg`.

```html
<nav class="navbar navbar-expand-lg bg-body-tertiary"><div class="container-fluid"><a class="navbar-brand" href="#">App</a>
<button class="navbar-toggler d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#sb"><span class="navbar-toggler-icon"></span></button>
<div class="offcanvas-lg offcanvas-start" tabindex="-1" id="sb" style="--bs-offcanvas-width:260px"><div class="offcanvas-header"><h5 class="offcanvas-title">Menu</h5><button class="btn-close" type="button" data-bs-dismiss="offcanvas"></button></div><div class="offcanvas-body p-0"><div class="list-group list-group-flush"><a class="list-group-item" href="#">Dash</a><a class="list-group-item" href="#">Settings</a></div></div></div></div></nav>
<div class="container py-3"><p class="text-muted small mb-0">Sidebar via offcanvas on small screens; permanent on lg+.</p></div>
```

---

**Assignment 182:** Mobile-first dashboard: single column stats on `xs`, two on `sm`, four on `lg`.

```html
<div class="container-fluid py-3"><div class="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-4"><div class="col"><div class="card"><div class="card-body"><h6 class="text-muted">A</h6><p class="fs-4 mb-0">12</p></div></div></div><div class="col"><div class="card"><div class="card-body"><h6 class="text-muted">B</h6><p class="fs-4 mb-0">8</p></div></div></div><div class="col"><div class="card"><div class="card-body"><h6 class="text-muted">C</h6><p class="fs-4 mb-0">5</p></div></div></div><div class="col"><div class="card"><div class="card-body"><h6 class="text-muted">D</h6><p class="fs-4 mb-0">2</p></div></div></div></div></div>
```

---

**Assignment 183:** Pricing cards that stack on mobile and align as a row with featured scale on `md+`.

```html
<div class="container py-4"><div class="row g-4 align-items-center justify-content-center"><div class="col-md-4"><div class="card h-100"><div class="card-body text-center"><h5>Basic</h5><p class="display-6">$9</p><button class="btn btn-outline-primary">Choose</button></div></div></div>
<div class="col-md-4"><div class="card h-100 border-primary shadow-lg scale-md"><div class="card-body text-center"><h5>Pro</h5><p class="display-6">$29</p><button class="btn btn-primary">Choose</button></div></div></div>
<div class="col-md-4"><div class="card h-100"><div class="card-body text-center"><h5>Org</h5><p class="display-6">$99</p><button class="btn btn-outline-primary">Choose</button></div></div></div></div></div>
<style>@media(min-width:768px){.scale-md{transform:scale(1.04);}}</style>
```

---

**Assignment 184:** Navigation that shows inline links on `lg` and a navbar toggler below.

```html
<nav class="navbar navbar-expand-lg bg-body-tertiary"><div class="container-fluid"><a class="navbar-brand" href="#">Co</a>
<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nvb"><span class="navbar-toggler-icon"></span></button>
<div class="collapse navbar-collapse" id="nvb"><div class="navbar-nav ms-auto"><a class="nav-link" href="#">Pricing</a><a class="nav-link" href="#">Docs</a></div></div></div></nav>
```

---

**Assignment 185:** Footer columns: 1 col mobile, 2 cols `sm`, 4 cols `lg`.

```html
<footer class="bg-body-tertiary pt-4 pb-3"><div class="container"><div class="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3"><div class="col"><h6>Brand</h6></div><div class="col"><h6>Links</h6></div><div class="col"><h6>Support</h6></div><div class="col"><h6>Legal</h6></div></div></div></footer>
```

---

**Assignment 186:** Hero section with responsive typography (`.display-*` + column split image/text).

```html
<header class="bg-body-secondary"><div class="container py-5"><div class="row align-items-center g-4"><div class="col-lg-6"><h1 class="display-5">Responsive hero</h1><p class="lead text-muted">Copy scales with grid.</p></div><div class="col-lg-6"><img class="img-fluid rounded-3" src="https://picsum.photos/seed/hero/800/520" alt=""></div></div></div></header>
```

---

**Assignment 187:** Testimonials row using `.row-cols-1.row-cols-md-2.row-cols-lg-3`.

```html
<div class="container py-4"><div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
<div class="col"><div class="card h-100"><div class="card-body"><p class="mb-2">“Great.”</p><footer class="blockquote-footer mt-0">Pat</footer></div></div></div>
<div class="col"><div class="card h-100"><div class="card-body"><p class="mb-2">“Solid.”</p><footer class="blockquote-footer mt-0">Jamie</footer></div></div></div>
<div class="col"><div class="card h-100"><div class="card-body"><p class="mb-2">“Fast.”</p><footer class="blockquote-footer mt-0">Rae</footer></div></div></div></div></div>
```

---

**Assignment 188:** Vertical timeline layout using border utilities and responsive alignment.

```html
<div class="container py-4"><div class="row"><div class="col-lg-8 mx-auto"><ul class="list-unstyled"><li class="d-flex gap-3 mb-4"><div class="flex-shrink-0"><span class="badge rounded-pill text-bg-primary">2024</span></div><div><h6 class="mb-1">Milestone</h6><p class="text-muted small mb-0">Detail</p></div></li>
<li class="d-flex gap-3"><div class="flex-shrink-0"><span class="badge rounded-pill text-bg-secondary">2025</span></div><div><h6 class="mb-1">Next</h6><p class="text-muted small mb-0">Detail</p></div></li></ul></div></div></div>
```

---

**Assignment 189:** Single-page responsive marketing landing (hero, features, pricing teaser, footer).

```html
<header class="bg-primary text-white py-5"><div class="container text-center py-lg-5"><h1 class="display-5">Launch</h1><p class="lead">One-page marketing.</p><a class="btn btn-light btn-lg" href="#">Start</a></div></header>
<section class="py-5"><div class="container"><div class="row g-4 text-center"><div class="col-md-4"><h3>Fast</h3><p class="text-muted">Point</p></div><div class="col-md-4"><h3>Secure</h3><p class="text-muted">Point</p></div><div class="col-md-4"><h3>Global</h3><p class="text-muted">Point</p></div></div></div></section>
<section class="py-5 bg-body-tertiary"><div class="container text-center"><h2 class="h4">Pricing teaser</h2><a class="btn btn-primary" href="#">See plans</a></div></section>
<footer class="py-4 border-top"><div class="container small text-center text-muted">© 2025</div></footer>
```

---

**Assignment 190:** Admin dashboard with chart placeholders, table, and dropdown user menu.

```html
<nav class="navbar navbar-expand-lg border-bottom bg-body-tertiary"><div class="container-fluid"><a class="navbar-brand" href="#">Admin</a><div class="ms-auto dropdown"><button class="btn btn-outline-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown">Admin</button><ul class="dropdown-menu dropdown-menu-end"><li><a class="dropdown-item" href="#">Logout</a></li></ul></div></div></nav>
<div class="container-fluid py-3"><div class="row g-3"><div class="col-lg-4"><div class="card"><div class="card-body"><h6 class="text-muted">Users</h6><p class="fs-3 mb-0">1,248</p></div></div></div><div class="col-lg-8"><div class="card"><div class="card-body">Chart placeholder</div></div></div><div class="col-12"><div class="card"><div class="card-body p-0"><div class="table-responsive"><table class="table table-hover mb-0"><thead><tr><th>ID</th><th>Status</th></tr></thead><tbody><tr><td>42</td><td><span class="badge text-bg-success">OK</span></td></tr></tbody></table></div></div></div></div></div></div>
```

---

**Assignment 191:** E-commerce homepage: hero, categories, product grid, newsletter strip.

```html
<header class="bg-dark text-white py-5"><div class="container"><div class="row align-items-center"><div class="col-lg-7"><h1 class="display-6">Shop</h1><p class="lead mb-0">New arrivals</p></div><div class="col-lg-5 mt-3 mt-lg-0"><img class="img-fluid rounded" src="https://picsum.photos/seed/shop/720/360" alt=""></div></div></div></header>
<div class="container py-4"><h2 class="h5">Categories</h2><div class="row g-3 row-cols-2 row-cols-md-4 mb-4"><div class="col"><div class="p-3 border rounded text-center">A</div></div><div class="col"><div class="p-3 border rounded text-center">B</div></div><div class="col"><div class="p-3 border rounded text-center">C</div></div><div class="col"><div class="p-3 border rounded text-center">D</div></div></div>
<div class="row row-cols-1 row-cols-md-3 g-4"><div class="col"><div class="card h-100"><img src="https://picsum.photos/seed/e1/400/260" class="card-img-top" alt=""><div class="card-body"><h6 class="card-title">Item</h6><button class="btn btn-sm btn-primary">Buy</button></div></div></div><div class="col"><div class="card h-100"><img src="https://picsum.photos/seed/e2/400/260" class="card-img-top" alt=""><div class="card-body"><h6 class="card-title">Item</h6><button class="btn btn-sm btn-primary">Buy</button></div></div></div><div class="col"><div class="card h-100"><img src="https://picsum.photos/seed/e3/400/260" class="card-img-top" alt=""><div class="card-body"><h6 class="card-title">Item</h6><button class="btn btn-sm btn-primary">Buy</button></div></div></div></div></div>
<div class="bg-primary text-white py-4"><div class="container d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2"><div><strong>Newsletter</strong><div class="small opacity-75">Weekly deals</div></div><form class="d-flex gap-2"><input class="form-control" placeholder="Email"><button class="btn btn-light" type="button">Join</button></form></div></div>
```

---

**Assignment 192:** Blog listing with sidebar categories, tags cloud placeholder, pagination.

```html
<div class="container py-4"><div class="row g-4"><div class="col-lg-8"><article class="mb-4 pb-4 border-bottom"><h2 class="h4">Post title</h2><p class="text-muted small">Mar 23 · 5 min</p><p>Excerpt...</p><a href="#">Read</a></article></div>
<aside class="col-lg-4"><div class="card mb-3"><div class="card-header">Categories</div><div class="list-group list-group-flush"><a class="list-group-item list-group-item-action" href="#">Code</a><a class="list-group-item list-group-item-action" href="#">Design</a></div></div>
<div class="card"><div class="card-header">Tags</div><div class="card-body"><span class="badge text-bg-light border me-1">ui</span><span class="badge text-bg-light border">ux</span></div></div></aside></div>
<nav class="mt-3"><ul class="pagination"><li class="page-item active"><a class="page-link" href="#">1</a></li><li class="page-item"><a class="page-link" href="#">2</a></li></ul></nav></div>
```

---

**Assignment 193:** Personal portfolio: about, projects grid, contact form, social links.

```html
<nav class="navbar navbar-expand-lg border-bottom bg-body-tertiary"><div class="container"><a class="navbar-brand" href="#">Portfolio</a><div class="navbar-nav ms-auto"><a class="nav-link" href="#">Projects</a><a class="nav-link" href="#">Contact</a></div></div></nav>
<section class="py-5 bg-body-secondary"><div class="container text-center"><img class="rounded-circle mb-3" src="https://picsum.photos/seed/me/120/120" width="120" height="120" alt=""><h1 class="h3">Alex Dev</h1><p class="text-muted mb-0">Frontend engineer</p><div class="mt-3 d-flex justify-content-center gap-2"><a class="btn btn-outline-dark btn-sm" href="#">GitHub</a><a class="btn btn-outline-primary btn-sm" href="#">LinkedIn</a></div></div></section>
<div class="container py-5"><h2 class="h4 mb-3">Projects</h2><div class="row g-4 row-cols-1 row-cols-md-2"><div class="col"><div class="card h-100"><img src="https://picsum.photos/seed/pr1/600/320" class="card-img-top" alt=""><div class="card-body"><h5 class="card-title">App</h5><p class="card-text small">Details</p></div></div></div><div class="col"><div class="card h-100"><img src="https://picsum.photos/seed/pr2/600/320" class="card-img-top" alt=""><div class="card-body"><h5 class="card-title">Site</h5><p class="card-text small">Details</p></div></div></div></div></div>
<div class="container pb-5" style="max-width:640px"><h2 class="h4 mb-3">Contact</h2><form class="row g-3"><div class="col-12"><input class="form-control" placeholder="Name"></div><div class="col-12"><input class="form-control" placeholder="Email" type="email"></div><div class="col-12"><textarea class="form-control" rows="4" placeholder="Message"></textarea></div><div class="col-12"><button class="btn btn-primary" type="button">Send</button></div></form></div>
```

---

**Assignment 194:** Restaurant menu: categorized sections, prices, dietary badges.

```html
<div class="container py-4"><h1 class="h3 mb-4">Menu</h1><div class="row g-4"><div class="col-lg-6"><h2 class="h5 border-bottom pb-2">Starters</h2><ul class="list-group list-group-flush"><li class="list-group-item d-flex justify-content-between align-items-center">Soup <span><span class="badge text-bg-success me-2">V</span><strong>$6</strong></span></li><li class="list-group-item d-flex justify-content-between align-items-center">Salad <strong>$8</strong></li></ul></div>
<div class="col-lg-6"><h2 class="h5 border-bottom pb-2">Mains</h2><ul class="list-group list-group-flush"><li class="list-group-item d-flex justify-content-between align-items-center">Pasta <span><span class="badge text-bg-warning me-2">Nuts</span><strong>$14</strong></span></li><li class="list-group-item d-flex justify-content-between align-items-center">Steak <strong>$22</strong></li></ul></div></div></div>
```

---

**Assignment 195:** Event booking: event details, schedule accordion, registration form, map placeholder.

```html
<div class="container py-4"><div class="row g-4"><div class="col-lg-7"><h1 class="h3">DesignConf</h1><p class="text-muted">June 12 · SF</p><p>Join us for workshops and talks.</p><div class="accordion" id="ev"><div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#e1">Schedule</button></h2><div id="e1" class="accordion-collapse collapse" data-bs-parent="#ev"><div class="accordion-body">10am keynote · 2pm labs</div></div></div></div></div>
<div class="col-lg-5"><div class="card"><div class="card-header">Register</div><div class="card-body"><form class="vstack gap-2"><input class="form-control" placeholder="Name"><input class="form-control" placeholder="Email" type="email"><button class="btn btn-primary" type="button">Book</button></form></div></div>
<div class="ratio ratio-16x9 bg-body-secondary mt-3 rounded border"><div class="d-flex align-items-center justify-content-center text-muted small">Map placeholder</div></div></div></div></div>
```

---

**Assignment 196:** Social profile: cover area, avatar, stats row, post cards.

```html
<div class="bg-body-secondary pb-4"><div class="container"><div class="position-relative" style="height:160px;background:url('https://picsum.photos/seed/cover/1200/400') center/cover"></div>
<div class="text-center" style="margin-top:-56px"><img class="rounded-circle border border-4 border-white" src="https://picsum.photos/seed/av/112/112" width="112" height="112" alt=""><h1 class="h4 mt-2 mb-0">Sam Rivera</h1><p class="text-muted small">@sam</p></div></div></div>
<div class="container py-4"><div class="row g-3 text-center"><div class="col-4"><div class="card"><div class="card-body py-2"><div class="fw-semibold">128</div><div class="small text-muted">Posts</div></div></div></div><div class="col-4"><div class="card"><div class="card-body py-2"><div class="fw-semibold">4.2k</div><div class="small text-muted">Followers</div></div></div></div><div class="col-4"><div class="card"><div class="card-body py-2"><div class="fw-semibold">310</div><div class="small text-muted">Following</div></div></div></div></div>
<div class="row g-3 mt-1"><div class="col-md-6"><div class="card"><div class="card-body"><p class="mb-0">Post card content…</p></div></div></div><div class="col-md-6"><div class="card"><div class="card-body"><p class="mb-0">Another post…</p></div></div></div></div></div>
```

---

**Assignment 197:** Job board: filter form, job list group, pagination.

```html
<div class="container py-4"><form class="row g-3 mb-4"><div class="col-md-4"><input class="form-control" placeholder="Keyword"></div><div class="col-md-3"><select class="form-select"><option>Location</option></select></div><div class="col-md-3"><select class="form-select"><option>Type</option></select></div><div class="col-md-2 d-grid"><button class="btn btn-primary" type="button">Filter</button></div></form>
<div class="list-group"><a href="#" class="list-group-item list-group-item-action"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">Frontend Engineer</h5><small class="text-success">Remote</small></div><p class="mb-1 small text-muted">React · TypeScript</p></a>
<a href="#" class="list-group-item list-group-item-action"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">UI Designer</h5><small class="text-muted">NY</small></div><p class="mb-1 small text-muted">Figma · Systems</p></a></div>
<nav class="mt-3"><ul class="pagination mb-0"><li class="page-item active"><a class="page-link" href="#">1</a></li><li class="page-item"><a class="page-link" href="#">2</a></li></ul></nav></div>
```

---

**Assignment 198:** Weather dashboard: city selector, card grid for metrics, list-group forecast.

```html
<div class="container py-4"><div class="row g-3 mb-3"><div class="col-md-4"><label class="form-label small mb-1">City</label><select class="form-select"><option>San Francisco</option><option>New York</option></select></div></div>
<div class="row g-3"><div class="col-md-3"><div class="card text-center"><div class="card-body"><div class="text-muted small">Temp</div><div class="display-6">18°</div></div></div></div><div class="col-md-3"><div class="card text-center"><div class="card-body"><div class="text-muted small">Humidity</div><div class="display-6">62%</div></div></div></div><div class="col-md-3"><div class="card text-center"><div class="card-body"><div class="text-muted small">Wind</div><div class="display-6">12</div></div></div></div><div class="col-md-3"><div class="card text-center"><div class="card-body"><div class="text-muted small">UV</div><div class="display-6">4</div></div></div></div></div>
<ul class="list-group mt-3"><li class="list-group-item d-flex justify-content-between"><span>Mon</span><span class="badge text-bg-primary">20°</span></li><li class="list-group-item d-flex justify-content-between"><span>Tue</span><span class="badge text-bg-info text-dark">18°</span></li></ul></div>
```

---

**Assignment 199:** Real estate listings: filter bar, property cards with image, price badge, CTA.

```html
<div class="container py-3"><div class="row g-3 mb-3"><div class="col-md-6"><input class="form-control" placeholder="Search city"></div><div class="col-md-3"><select class="form-select"><option>House</option><option>Condo</option></select></div><div class="col-md-3 d-grid"><button class="btn btn-dark" type="button">Search</button></div></div>
<div class="row g-4"><div class="col-md-6 col-lg-4"><div class="card h-100"><img src="https://picsum.photos/seed/re1/600/360" class="card-img-top" alt=""><div class="card-body"><span class="badge text-bg-success mb-2">New</span><h5 class="card-title">Loft</h5><p class="h4 text-primary mb-3">$925k</p><a href="#" class="btn btn-outline-primary stretched-link">Tour</a></div></div></div>
<div class="col-md-6 col-lg-4"><div class="card h-100"><img src="https://picsum.photos/seed/re2/600/360" class="card-img-top" alt=""><div class="card-body"><h5 class="card-title">Townhome</h5><p class="h4 text-primary mb-3">$640k</p><a href="#" class="btn btn-outline-primary stretched-link">Tour</a></div></div></div><div class="col-md-6 col-lg-4"><div class="card h-100"><img src="https://picsum.photos/seed/re3/600/360" class="card-img-top" alt=""><div class="card-body"><h5 class="card-title">Studio</h5><p class="h4 text-primary mb-3">$410k</p><a href="#" class="btn btn-outline-primary stretched-link">Tour</a></div></div></div></div></div>
```

---

**Assignment 200:** SaaS landing: hero with signup form, logo row, feature columns, testimonial, sticky CTA bar.

```html
<nav class="navbar navbar-expand-lg bg-body-tertiary border-bottom sticky-top"><div class="container"><a class="navbar-brand fw-semibold" href="#">SaaSify</a><div class="ms-auto d-flex gap-2"><a class="btn btn-outline-secondary btn-sm" href="#">Login</a><a class="btn btn-primary btn-sm" href="#">Start trial</a></div></div></nav>
<header class="py-5"><div class="container"><div class="row align-items-center g-4"><div class="col-lg-6"><h1 class="display-6">Ship faster</h1><p class="lead text-muted">Landing + signup in Bootstrap.</p><div class="d-flex flex-wrap gap-2"><button class="btn btn-primary btn-lg" type="button">Get started</button><button class="btn btn-outline-secondary btn-lg" type="button">Demo</button></div></div><div class="col-lg-6"><form class="card shadow-sm"><div class="card-body p-4"><h2 class="h5 mb-3">Create account</h2><input class="form-control mb-2" placeholder="Work email" type="email"><input class="form-control mb-3" placeholder="Password" type="password"><button class="btn btn-primary w-100" type="button">Sign up</button></div></form></div></div></div></header>
<section class="py-4 border-top border-bottom bg-body-tertiary"><div class="container"><div class="row row-cols-2 row-cols-md-4 g-3 text-center small text-muted"><div class="col">Logo</div><div class="col">Logo</div><div class="col">Logo</div><div class="col">Logo</div></div></div></section>
<section class="py-5"><div class="container"><div class="row g-4 text-center"><div class="col-md-4"><h3 class="h5">Automate</h3><p class="text-muted small">Feature</p></div><div class="col-md-4"><h3 class="h5">Analyze</h3><p class="text-muted small">Feature</p></div><div class="col-md-4"><h3 class="h5">Scale</h3><p class="text-muted small">Feature</p></div></div></div></section>
<section class="py-5 bg-body-secondary"><div class="container"><div class="card border-0 shadow-sm"><div class="card-body p-4 d-flex flex-column flex-md-row align-items-md-center gap-3"><div><h2 class="h5 mb-1">“We cut release time in half.”</h2><div class="text-muted small">— Taylor, CTO</div></div><div class="ms-md-auto"><span class="badge text-bg-primary">Case study</span></div></div></div></div></section>
<div class="position-fixed bottom-0 start-0 end-0 bg-dark text-white py-2 px-3 d-flex justify-content-between align-items-center"><span class="small">Ready to try SaaSify?</span><button class="btn btn-light btn-sm" type="button">Start free</button></div>
```
