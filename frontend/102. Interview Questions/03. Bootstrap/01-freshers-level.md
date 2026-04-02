# Bootstrap Interview Questions — Freshers (0–2 Years)

100 fundamental questions with detailed answers. Use this for revision and mock interviews.

---

## 1. What is Bootstrap and why is it used in web development?

Bootstrap is a free, open-source front-end CSS framework originally created by Twitter (now maintained independently) that helps developers build responsive, mobile-first websites quickly. It provides a consistent design system with prebuilt components, a powerful grid, utility classes, and JavaScript plugins so you spend less time writing repetitive layout and styling code. Teams use Bootstrap to prototype fast, maintain visual consistency across pages, and rely on well-tested patterns for accessibility and cross-browser behavior. Version 5 is the current major line and drops jQuery dependency that Bootstrap 4 required for its JavaScript components. You still write your own HTML structure; Bootstrap supplies the styling and behavior layers on top.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="container"><h1 class="display-4">Hello, Bootstrap</h1></div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## 2. What does “mobile-first” mean in Bootstrap?

Mobile-first means default styles target small screens first, and larger layouts are added using min-width media queries at breakpoints. Smaller viewports get the base CSS without extra overrides, which tends to produce leaner CSS and clearer progressive enhancement. You design for narrow widths first, then enhance for tablets and desktops with classes like `col-md-*` or `d-md-flex`. Bootstrap 4 and 5 both follow this philosophy; the breakpoint scale is similar though naming and some utilities evolved. This approach aligns with how most users consume content on phones and improves performance on constrained devices.

```html
<div class="row">
  <div class="col-12 col-md-6">Full width on mobile, half on md+</div>
</div>
```

---

## 3. How do you include Bootstrap 5 via CDN?

You link the minified CSS in the document head and place the JavaScript bundle before the closing body tag (or use `defer` on script tags if you prefer the head). The “bundle” build includes Popper, which is required for dropdowns, tooltips, and popovers. Using a CDN gives fast delivery from edge caches and no local build step for simple projects. For production, pin a specific version in the URL to avoid surprise breaking changes when the CDN updates. Always include the `viewport` meta tag so responsive behavior works correctly on mobile browsers.

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
```

---

## 4. How does installing Bootstrap with npm differ from using the CDN?

With npm you add Bootstrap as a dependency (`npm install bootstrap`), import its SCSS or CSS in your bundler (Webpack, Vite, etc.), and tree-shake or customize variables before compilation. You control exactly which parts ship to users and can override Sass variables to rebrand the framework. The CDN path is ideal for static pages or demos where you want zero tooling. Bootstrap 5’s npm package exposes source files for deep customization; Bootstrap 4 worked similarly but used different variable names and required jQuery for JS. Production apps often prefer npm for versioning, reproducible builds, and integration with PostCSS or Sass pipelines.

```scss
// custom.scss
$primary: #6610f2;
@import "bootstrap/scss/bootstrap";
```

---

## 5. What is the Bootstrap grid system and how many columns does it use?

The grid is a flexbox-based layout system that divides the horizontal space into 12 equal columns per row. You place content in columns (`col-*`) inside rows (`row`) that sit inside a container (or a fluid container). Twelve is a convenient number because it divides evenly by 2, 3, 4, and 6, making common layouts easy without fractions. In Bootstrap 5, the grid still uses 12 columns like Bootstrap 4, but gutter behavior and utility APIs were refined. Understanding the 12-column mental model is essential for any Bootstrap interview answer about layouts.

```html
<div class="container">
  <div class="row">
    <div class="col-8">8 cols</div>
    <div class="col-4">4 cols</div>
  </div>
</div>
```

---

## 6. What is the difference between `.container` and `.container-fluid`?

`.container` has a max-width at each breakpoint and centers itself horizontally with automatic left and right margins, giving readable line lengths on large screens. `.container-fluid` spans 100% width at all breakpoints, edge to edge within the parent, which suits full-bleed hero sections or dashboards. Both add horizontal padding (gutters) so content does not touch the viewport edge. Bootstrap 4 used similar semantics; Bootstrap 5 adjusted default container max-widths slightly and added extra container variants. Choose `container` for typical marketing sites and `container-fluid` when you need edge-to-edge backgrounds or dense UIs.

```html
<div class="container">Centered, max-width</div>
<div class="container-fluid">Full width</div>
```

---

## 7. What are Bootstrap breakpoints and what are their default pixel values?

Breakpoints are viewport widths where layout rules change, implemented as min-width media queries in Bootstrap 5: `sm` 576px, `md` 768px, `lg` 992px, `xl` 1200px, `xxl` 1400px. Classes suffixed with these letters apply at that width and up unless overridden by larger breakpoint classes. There is no `xs` prefix because extra-small is the default (mobile-first base). Bootstrap 4 had `sm` through `xl` but no `xxl`; adding `xxl` in v5 helps ultra-wide layouts. You rarely need to memorize exact pixels if you think in terms of “stack until md, then two columns.”

```html
<div class="col-12 col-sm-6 col-lg-4">Responsive columns</div>
```

---

## 8. How do `.row` and `.col-*` classes work together?

`.row` is a flex container that wraps `.col-*` children; it establishes the flex context and negative horizontal margins to align column padding with the container’s gutters. Each column specifies how many of the 12 grid units it occupies at a given breakpoint, for example `col-md-6` for half width from medium screens up. If you omit the breakpoint, `col-6` applies at all sizes. Nesting is allowed: put another `row` inside a `col` for sub-grids. Bootstrap 4 used floats for the grid in older versions but switched to flexbox; Bootstrap 5 continues with flexbox and refined gutter utilities.

```html
<div class="row g-3">
  <div class="col-md">Equal flex columns on md+</div>
  <div class="col-md">Equal flex columns on md+</div>
</div>
```

---

## 9. What is the difference between `col-6`, `col-md-6`, and `col-auto`?

`col-6` always takes 6 of 12 columns at every viewport size. `col-md-6` applies 6 columns from the `md` breakpoint upward; below that, without another class, columns may stack full width depending on other rules you set. `col-auto` sizes the column to the width of its content (flex: 0 0 auto behavior within the grid). Use `col-auto` for shrink-wrapped sidebars or buttons next to fluid content. In Bootstrap 4, the same naming existed; behavior is largely analogous though v5 documents auto columns more prominently.

```html
<div class="row">
  <div class="col-auto">Label</div>
  <div class="col">Flexible</div>
</div>
```

---

## 10. What are gutter classes (`g-*`, `gx-*`, `gy-*`) in Bootstrap 5?

Gutters are the spacing between columns and rows; in Bootstrap 5 you control them with `g-*` for both axes, `gx-*` horizontal only, and `gy-*` vertical only, using spacing scale values 0 through 5. Apply these on the `.row` (e.g., `row g-4`) to adjust gap without manual margin hacks. This replaced older margin-based gutter approaches and aligns with CSS gap concepts. Bootstrap 4 used padding on columns with negative margins on rows; Bootstrap 5’s `g-*` utilities offer a clearer mental model. Smaller gutters tighten dense tables; larger gutters improve readability in marketing layouts.

```html
<div class="row g-4">
  <div class="col-6">A</div>
  <div class="col-6">B</div>
</div>
```

---

## 11. How do you offset a column in the Bootstrap grid?

Use offset classes like `offset-md-2` to push a column to the right by a number of grid units at a given breakpoint. This is useful for centering a narrower column or aligning content that does not start at column zero. Offsets consume space in the same 12-column system, so ensure your column width plus offset does not exceed 12. Bootstrap 5 also supports margin utilities (`ms-auto`, `me-auto`) for alignment in flex contexts, which sometimes replace offset needs. Bootstrap 4 had `offset-*` classes with the same general idea.

```html
<div class="row">
  <div class="col-md-6 offset-md-3">Centered on md+</div>
</div>
```

---

## 12. What is the `.container-xxl` or responsive container in Bootstrap 5?

Bootstrap 5 introduced responsive container classes such as `.container-sm`, `.container-md`, etc., which are 100% wide until their named breakpoint, then behave like a fixed max-width container from that point up. This lets one element fluid on phones but constrained on desktops without writing custom media queries. The plain `.container` is responsive across all breakpoints with stepped max-widths. Compared to Bootstrap 4, these per-breakpoint containers are a v5 addition for finer control. Pick them when a design calls for full bleed only on the smallest screens.

```html
<div class="container-lg">Fluid until lg, then max-width</div>
```

---

## 13. How does Bootstrap handle typography out of the box?

Bootstrap sets a base font size on the `html` element (typically 16px), defines a readable `line-height`, and styles headings (`h1`–`h6`) with consistent margins and font sizes. It includes display classes (`display-1` through `display-6`) for large hero text and lead paragraphs (`.lead`) for emphasized intro copy. The framework uses a native font stack for fast loading and OS-native appearance. Bootstrap 4 was similar; Bootstrap 5 refined heading sizes and added variable font considerations in documentation. You can override everything with CSS variables or Sass maps if you brand the site.

```html
<h1 class="display-4">Display heading</h1>
<p class="lead">Lead paragraph stands out.</p>
```

---

## 14. What are Bootstrap’s text alignment utilities?

Classes like `text-start`, `text-center`, and `text-end` align inline content within a block; responsive variants exist (`text-md-center`) to change alignment per breakpoint. For flex containers, alignment utilities sometimes pair with `justify-content-*` on parents. These utilities map to logical properties in RTL layouts when using Bootstrap’s RTL build. Bootstrap 4 used `text-left` and `text-right`; Bootstrap 5 prefers start/end naming for internationalization, though older names may still appear in legacy codebases. Always test RTL if your audience needs it.

```html
<p class="text-center text-lg-start">Center on small, start on lg+</p>
```

---

## 15. How do Bootstrap color utilities work?

Semantic color classes apply theme colors: `text-primary`, `bg-success`, `border-danger`, etc., using CSS variables under the hood in Bootstrap 5. You can combine background and text utilities but must ensure contrast for accessibility (e.g., dark text on `bg-warning`). Subtle backgrounds use `bg-opacity-*` with RGBA in v5. Bootstrap 4 had similar named colors but relied more on Sass variables without the same CSS variable layer. Custom themes often remap `--bs-primary` and related variables.

```html
<p class="text-primary">Primary text</p>
<div class="p-2 bg-dark text-white">High contrast</div>
```

---

## 16. What is the spacing scale in Bootstrap utilities?

Margin and padding utilities use a scale from 0 to 5 (and sometimes auto), where each step maps to a `rem`-based spacing token (e.g., `.mt-3` margin-top, `.px-4` horizontal padding). The scale is consistent across margin (`m-*`), padding (`p-*`), and gap utilities so designers learn one system. You can reference Sass maps to extend the scale in custom builds. Bootstrap 4 used a similar `$spacer`-based scale; Bootstrap 5 expanded documentation and added more arbitrary utilities in later minor versions. Using the scale avoids one-off pixel values scattered in CSS.

```html
<div class="mt-3 mb-4 px-2">Spacing utilities</div>
```

---

## 17. What is the difference between `mx-auto` and `ms-auto`?

`mx-auto` sets left and right margins to auto, which horizontally centers a block-level element with a defined width inside its parent. `ms-auto` (margin-start auto) pushes an item to the end in a flex row in LTR layouts, commonly used to separate navbar brand from nav links. In Bootstrap 4 you would often use `ml-auto` instead of `ms-auto`; the switch to logical start/end properties is a Bootstrap 5 convention. Understanding flex context matters because auto margins interact with flex alignment differently than block centering.

```html
<div class="d-flex">
  <span>Left</span>
  <span class="ms-auto">Right</span>
</div>
```

---

## 18. How do you make responsive images in Bootstrap?

Use `.img-fluid` on an image to apply `max-width: 100%` and `height: auto` so it scales within its container without overflowing. Pair with the `picture` element or `srcset` for art direction and resolution switching outside Bootstrap’s scope. For fixed aspect ratios, Bootstrap 5 offers ratio helpers (`.ratio`, `.ratio-16x9`) wrapping embedded or image content. Bootstrap 4 had `.img-fluid` as well; the ratio component is more prominent in v5. Always provide meaningful `alt` text for accessibility.

```html
<img src="photo.jpg" class="img-fluid" alt="Description">
```

---

## 19. What are Bootstrap tables and how do you style them?

Add `.table` to a `<table>` for basic Bootstrap styling: padding, borders, and hover-friendly rows when combined with `.table-hover`. Modifier classes include `.table-striped`, `.table-bordered`, `.table-sm`, and responsive wrappers `.table-responsive` or breakpoint-specific `.table-responsive-md`. Tables inherit colors from theme variables; use `.table-dark` for inverted schemes. Bootstrap 4 tables are very similar; v5 refined focus styles and documentation. For large datasets, consider pagination and sorting outside Bootstrap or with a JS library.

```html
<div class="table-responsive">
  <table class="table table-striped table-hover">
    <thead><tr><th>Name</th></tr></thead>
    <tbody><tr><td>Ada</td></tr></tbody>
  </table>
</div>
```

---

## 20. How do Bootstrap buttons work and what variants exist?

Buttons use `.btn` for base padding, typography, and focus rings, plus `.btn-*` for color variants: `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `light`, `dark`, and `link`. Outline styles use `.btn-outline-*`. Size modifiers `.btn-lg` and `.btn-sm` adjust padding and font size; `.btn` can be applied to `<a>`, `<button>`, or `<input>` though semantic `<button>` is preferred for actions. Bootstrap 5 improved focus-visible styles and removed default underline quirks from older browsers compared to Bootstrap 4. Disabled buttons use the `disabled` attribute or `.disabled` on links (with `aria-disabled` for a11y).

```html
<button type="button" class="btn btn-primary">Save</button>
<a class="btn btn-outline-secondary" href="#">Cancel</a>
```

---

## 21. What is a button group in Bootstrap?

`.btn-group` joins adjacent buttons visually by removing double borders and rounding only the outer corners. Use `.btn-group` for related actions like a pagination-style toolbar or split buttons with dropdowns. Vertical groups use `.btn-group-vertical`. Accessibility: ensure keyboard navigation and screen reader labels remain clear when buttons are fused. Bootstrap 4’s button groups behave similarly; check dropdown integration because Popper positioning attaches to the toggle. Do not nest rows inside button groups; keep structure flat.

```html
<div class="btn-group" role="group">
  <button type="button" class="btn btn-primary">Left</button>
  <button type="button" class="btn btn-primary">Right</button>
</div>
```

---

## 22. How does the Bootstrap form layout system work?

Wrap fields in `.mb-3` or grid columns for spacing; use `.form-label` on labels and `.form-control` on inputs for consistent sizing and focus styles. Checkboxes and radios use `.form-check` with `.form-check-input` and `.form-check-label`. Horizontal forms combine grid columns with labels and controls aligned in rows. Bootstrap 5 dropped `.form-group` in favor of margin utilities or grid gaps, whereas Bootstrap 4 used `.form-group` frequently. Validation states use `.is-invalid`, `.is-valid`, and `.invalid-feedback` text blocks.

```html
<div class="mb-3">
  <label for="email" class="form-label">Email</label>
  <input type="email" class="form-control" id="email">
</div>
```

---

## 23. What is floating labels in Bootstrap 5?

`.form-floating` places the label inside the input and animates it when the field has focus or content, saving vertical space while preserving a visible label for accessibility. The input must have a placeholder (often a space) for correct layout in some browsers. This pattern became first-class in Bootstrap 5; Bootstrap 4 did not ship floating labels as a core component. Pair with validation classes carefully so error messages do not collide with the floating animation. Test with autofill and screen readers.

```html
<div class="form-floating mb-3">
  <input type="email" class="form-control" id="floatingEmail" placeholder="name@example.com">
  <label for="floatingEmail">Email address</label>
</div>
```

---

## 24. How do you build a responsive navbar in Bootstrap 5?

Use `.navbar`, `.navbar-expand-*` to define at which breakpoint the collapse opens into a horizontal bar, and `.navbar-toggler` with `data-bs-toggle="collapse"` targeting a `.collapse.navbar-collapse` region. Inside, place `.navbar-nav` with `.nav-link` items. Bootstrap 5 uses `data-bs-*` attributes; Bootstrap 4 used `data-toggle` and required jQuery. Include `aria` attributes on the toggler for accessibility. For sticky or fixed positioning, add `.fixed-top` or utilities; mind content padding so the body is not hidden under the bar.

```html
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Brand</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="nav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link" href="#">Home</a></li>
      </ul>
    </div>
  </div>
</nav>
```

---

## 25. What is a Bootstrap card component?

`.card` is a flexible content container with optional `.card-header`, `.card-body`, `.card-footer`, and `.card-title` for structured blocks like dashboards or product tiles. Cards stack vertically by default; place them in a grid or flex row for multi-column layouts. Images can be `.card-img-top` or overlays with `.card-img-overlay`. Bootstrap 4 cards are conceptually the same; Bootstrap 5 refined spacing and shadow utilities. Cards are purely presentational; interactivity comes from links, buttons, or JavaScript you add.

```html
<div class="card" style="width: 18rem;">
  <div class="card-body">
    <h5 class="card-title">Title</h5>
    <p class="card-text">Content.</p>
    <a href="#" class="btn btn-primary">Go</a>
  </div>
</div>
```

---

## 26. How do alerts work in Bootstrap?

`.alert` with `.alert-*` color variants presents feedback messages; use `.alert-dismissible` with a close button and `data-bs-dismiss="alert"` for removable alerts. Alerts are static by default; for auto-dismiss you add small JavaScript. Roles: set `role="alert"` for important messages so assistive tech announces them. Bootstrap 5 uses `btn-close` instead of Bootstrap 4’s close icon markup. Keep messages concise and ensure color is not the only indicator of severity.

```html
<div class="alert alert-success alert-dismissible fade show" role="alert">
  Saved successfully.
  <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
```

---

## 27. What are badges in Bootstrap?

`.badge` creates small count or status labels, often inside headings or buttons; color variants mirror buttons (`bg-primary`, etc.). Pill style uses `.rounded-pill`. Bootstrap 5 positioned badges as generic components; Bootstrap 4 also had badges but with slightly different class names in older versions (`.badge-pill` became `.rounded-pill`). Use badges for supplementary information, not primary navigation. Ensure text contrast meets WCAG when placing badges on colored backgrounds.

```html
<h3>Notifications <span class="badge bg-secondary">4</span></h3>
```

---

## 28. What is a list group in Bootstrap?

`.list-group` is a vertical list of items with `.list-group-item` children, useful for menus, settings panels, or selectable lists. Enhance with `.list-group-item-action` for hover states on clickable rows. Combine with badges or flex utilities for complex rows. Bootstrap 4 list groups are similar; Bootstrap 5 improved focus rings. For navigation, consider `role` attributes and keyboard support if you build custom behavior.

```html
<ul class="list-group">
  <li class="list-group-item active">Active item</li>
  <li class="list-group-item">Second</li>
</ul>
```

---

## 29. How do modals work in Bootstrap 5?

Modals are dialog overlays created from markup with `.modal`, `.modal-dialog`, and `.modal-content`; you trigger them via `data-bs-toggle="modal"` and `data-bs-target="#id"` or the JavaScript API `new bootstrap.Modal(el)`. The modal JavaScript handles focus trap, backdrop, and ESC key. Bootstrap 5 modals use native JS; Bootstrap 4 required jQuery for the same API shape. Place modal HTML near the end of `body` to avoid stacking context issues. Use `aria-labelledby` and `aria-modal="true"` for accessibility.

```html
<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">Open</button>
<div class="modal fade" id="exampleModal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Title</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">Body</div>
    </div>
  </div>
</div>
```

---

## 30. What options does `.modal-dialog` support?

`.modal-dialog-centered` vertically centers the modal; `.modal-dialog-scrollable` makes the body scroll while header/footer stay fixed. Size classes `.modal-sm`, `.modal-lg`, `.modal-xl` adjust width. Fullscreen modals use `.modal-fullscreen` with breakpoint variants. These options help with long forms or mobile layouts. Bootstrap 4 introduced scrollable and centered variants later; Bootstrap 5 documents them as standard. Always test scroll behavior when nested forms or tall content appear inside modals.

```html
<div class="modal-dialog modal-dialog-centered modal-lg">
  ...
</div>
```

---

## 31. How does the Bootstrap carousel component work?

The carousel cycles through slides with `.carousel`, `.carousel-inner`, and `.carousel-item`; indicators and prev/next controls use `data-bs-slide` attributes or the Carousel API. Include `carousel slide` classes and consider `data-bs-interval` for autoplay timing. Accessibility: Bootstrap documentation recommends `role` attributes and pausing autoplay for users who need more time. Bootstrap 5 carousels use the same markup ideas as Bootstrap 4 but without jQuery. Prefer high-quality images with consistent aspect ratios or use the ratio utilities to avoid layout shift.

```html
<div id="c" class="carousel slide" data-bs-ride="carousel">
  <div class="carousel-inner">
    <div class="carousel-item active"><img class="d-block w-100" src="a.jpg" alt=""></div>
    <div class="carousel-item"><img class="d-block w-100" src="b.jpg" alt=""></div>
  </div>
  <button class="carousel-control-prev" type="button" data-bs-target="#c" data-bs-slide="prev"></button>
</div>
```

---

## 32. What is the Bootstrap accordion component?

Accordion is a vertically stacked set of collapsible panels using `.accordion`, `.accordion-item`, `.accordion-header`, and `.accordion-collapse` with `data-bs-toggle="collapse"`. Only one panel may stay open depending on `data-bs-parent` linking to the accordion container. This replaces older custom jQuery accordion patterns with accessible Bootstrap markup. Bootstrap 5 introduced a dedicated accordion component; Bootstrap 4 relied on generic collapse without the same unified styling. Use clear button labels in `.accordion-button` for screen readers.

```html
<div class="accordion" id="acc">
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#one">One</button>
    </h2>
    <div id="one" class="accordion-collapse collapse show" data-bs-parent="#acc">
      <div class="accordion-body">Content</div>
    </div>
  </div>
</div>
```

---

## 33. How do dropdowns work in Bootstrap 5?

Dropdowns toggle a menu with `.dropdown`, `.dropdown-toggle`, and `.dropdown-menu`; the toggle uses `data-bs-toggle="dropdown"` and Popper positions the menu. Menu items are `.dropdown-item`; use `.dropdown-divider` for separation. Bootstrap 5 dropdowns work without jQuery; Bootstrap 4 needed jQuery and used `data-toggle`. Keyboard navigation (arrows, ESC) is partially handled by the plugin but you should test custom content. Avoid nesting interactive elements incorrectly inside toggles.

```html
<div class="dropdown">
  <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">Menu</button>
  <ul class="dropdown-menu">
    <li><a class="dropdown-item" href="#">Action</a></li>
  </ul>
</div>
```

---

## 34. What is the difference between tooltips and popovers?

Tooltips show a short hint on hover or focus; popovers are larger and can include HTML-like structured content with a title. Both require initialization in Bootstrap 5 (`new bootstrap.Tooltip(el)`) because they are opt-in for performance and to avoid unexpected behavior on touch devices. Popper handles positioning for both. Bootstrap 4 required manual initialization as well and depended on jQuery. Use `container` options if clipping inside overflow-hidden parents. Respect `pointer-events` and mobile UX: long-press or tap patterns may need extra thought.

```js
const el = document.querySelector('[data-bs-toggle="tooltip"]');
new bootstrap.Tooltip(el);
```

```html
<button type="button" class="btn btn-secondary" data-bs-toggle="tooltip" title="Help text">Hover</button>
```

---

## 35. How does pagination work in Bootstrap?

`.pagination` on `<ul>` with `.page-item` and `.page-link` on `<a>` or buttons creates accessible page controls. States include `.active` and `.disabled` for current and unavailable pages. Sizing uses `.pagination-lg` or `.pagination-sm`. This is presentational; wiring page changes is your backend or SPA logic. Bootstrap 4 pagination markup matches closely; focus styles improved in v5. Provide `aria-label` on the `<nav>` wrapping the list for context.

```html
<nav aria-label="Page navigation">
  <ul class="pagination">
    <li class="page-item disabled"><a class="page-link">Prev</a></li>
    <li class="page-item active"><a class="page-link" href="#">1</a></li>
  </ul>
</nav>
```

---

## 36. What are breadcrumbs in Bootstrap?

`.breadcrumb` with `.breadcrumb-item` creates a horizontal trail showing hierarchy; the active page uses `.active` with `aria-current="page"`. Separators are added via CSS `::before` content. Breadcrumbs improve wayfinding on deep sites. Bootstrap 4 breadcrumbs are essentially the same visually. Keep labels short; do not rely on breadcrumbs as the only navigation aid on mobile if space is tight.

```html
<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a href="#">Home</a></li>
    <li class="breadcrumb-item active" aria-current="page">Library</li>
  </ol>
</nav>
```

---

## 37. How do spinners work in Bootstrap?

`.spinner-border` and `.spinner-grow` provide lightweight CSS loading indicators; add `.text-*` utilities for color and `.spinner-border-sm` for size. Use `role="status"` and visually hidden text for screen readers. Prefer spinners for inline loading states; for page-level loads, consider progress bars or skeleton screens. Bootstrap 4.2+ introduced spinners; Bootstrap 5 refined accessibility notes. Avoid overusing animated spinners for users sensitive to motion; respect `prefers-reduced-motion` in custom CSS if needed.

```html
<div class="spinner-border text-primary" role="status">
  <span class="visually-hidden">Loading...</span>
</div>
```

---

## 38. What are progress bars in Bootstrap?

`.progress` wraps `.progress-bar` to show completion; set width inline or with utilities and use `aria-valuenow`, `min`, `max` for accessibility. Striped and animated variants use `.progress-bar-striped` and `.progress-bar-animated`. Stacked bars can live in one `.progress` with multiple `.progress-bar` children. Bootstrap 4 progress bars are similar; Bootstrap 5 uses updated color tokens. For indeterminate tasks, consider indeterminate patterns or spinners instead of misleading percentages.

```html
<div class="progress" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
  <div class="progress-bar" style="width: 50%">50%</div>
</div>
```

---

## 39. What is the offcanvas component in Bootstrap 5?

Offcanvas slides a panel in from the side of the viewport, useful for mobile menus or filters; use `.offcanvas` with `.offcanvas-start` (or end/top/bottom) and toggle with `data-bs-toggle="offcanvas"`. It manages focus and backdrop similar to modals. This component is prominent in Bootstrap 5; Bootstrap 4 did not include offcanvas as a first-class component (developers used custom collapse sidebars). Pair with responsive utilities to show a normal navbar on desktop and offcanvas on small screens.

```html
<button class="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#filters">Open</button>
<div class="offcanvas offcanvas-start" tabindex="-1" id="filters">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title">Filters</h5>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
  </div>
  <div class="offcanvas-body">...</div>
</div>
```

---

## 40. What are responsive display utilities (`d-*`)?

Classes like `d-none`, `d-block`, `d-flex`, and `d-inline` control CSS `display`, with breakpoint variants such as `d-md-none` to hide or show elements at specific widths. This is essential for responsive layouts without writing custom CSS per component. Combine with other utilities: a row might be `flex` on medium screens and `block` on small. Bootstrap 4 had similar utilities but Bootstrap 5 expanded breakpoints and added `d-grid`. Remember hidden content may still be read by screen readers unless you use `aria-hidden` appropriately.

```html
<div class="d-none d-md-block">Desktop only</div>
```

---

## 41. How do flex utilities work in Bootstrap?

Apply `.d-flex` on a container, then use `.flex-row`, `.flex-column`, `.justify-content-*`, `.align-items-*`, `.flex-wrap`, and `.gap-*` to control layout. Responsive variants (`flex-md-row`) flip direction per breakpoint. These map directly to CSS flexbox properties. Bootstrap 4 introduced flex utilities; Bootstrap 5 added `gap` integration aligned with the spacing scale. Flex utilities often replace older float-based patterns for alignment. Use `order-*` utilities to reorder items responsively.

```html
<div class="d-flex justify-content-between align-items-center gap-2">
  <span>Left</span>
  <span>Right</span>
</div>
```

---

## 42. What is the difference between `justify-content` and `align-items`?

`justify-content` distributes space along the main axis (horizontal in a default `flex-row`), controlling gaps between items or pushing them to start, center, end, or space-between. `align-items` controls cross-axis alignment (vertical in `flex-row`), such as stretching or baseline alignment. When you switch to `flex-column`, main and cross axes swap roles, which confuses beginners until they visualize the axis model. Bootstrap utilities mirror CSS names (`justify-content-center`, `align-items-center`). This is standard flexbox, not unique to Bootstrap, but interviewers expect clear explanations.

```html
<div class="d-flex justify-content-center align-items-center" style="height: 200px;">
  Centered
</div>
```

---

## 43. How do float utilities work in Bootstrap?

`.float-start` and `.float-end` apply CSS floats for legacy layouts or wrapping text around images; responsive variants exist (`float-md-end`). Clearfix helpers like `.clearfix` on parent containers collapse properly when children float. Modern layouts prefer flex or grid, but floats still appear in older codebases and for specific typographic effects. Bootstrap 4 used `float-left` and `float-right`; Bootstrap 5 renamed to start/end for RTL consistency. Do not mix floats and flex on the same element without understanding stacking context.

```html
<div class="clearfix">
  <img src="x.jpg" class="rounded float-start me-3" alt="">
  <p>Text wraps around the image.</p>
</div>
```

---

## 44. What are position utilities in Bootstrap?

Classes like `.position-static`, `.relative`, `.absolute`, `.fixed`, and `.sticky` set `position` with companion inset utilities `.top-0`, `.start-50`, `.translate-middle` for centering overlays. Sticky positioning is common for subheaders in long pages. These utilities reduce one-off CSS for common patterns. Bootstrap 5 expanded inset and translate helpers; Bootstrap 4 had fewer utility combinations. Watch out for parent `overflow` properties that break `sticky` behavior.

```html
<div class="position-fixed bottom-0 end-0 p-3">Toast area</div>
```

---

## 45. How do sizing utilities work?

`.w-25`, `.w-50`, `.w-75`, `.w-100` set percentage widths; `.mw-100` caps max-width. Heights use `.h-25` through `.h-100` or `.min-vh-100` for viewport-relative minimum height. These utilities help quick prototyping but may need custom values for precise designs. Bootstrap 4 had width utilities; Bootstrap 5 documented them alongside `vw` helpers more clearly. Pair width utilities with the grid when building complex pages to avoid fighting specificity.

```html
<div class="w-50 mx-auto">Half width, centered</div>
```

---

## 46. What text utilities does Bootstrap provide besides alignment?

Utilities include `.fw-bold`, `.fw-normal`, `.fst-italic`, `.text-decoration-none`, `.text-break`, `.text-wrap`, `.text-uppercase`, and line height with `.lh-sm`, `.lh-base`, `.lh-lg`. Color utilities combine with `.text-muted` for de-emphasized copy. Font stacks inherit from reboot styles; you typically do not set `font-family` per utility unless extending the framework. Bootstrap 4 offered many of the same with slightly different naming in places. Use semantic HTML (`strong`, `em`) where appropriate instead of only visual classes.

```html
<p class="text-muted text-uppercase fw-bold small">Caption</p>
```

---

## 47. How does vertical alignment work for inline and table content?

`.align-baseline`, `.align-top`, `.align-middle`, `.align-bottom`, `.align-text-top`, `.align-text-bottom` vertically align inline-level elements or table cells. In flex containers, prefer `align-items-*` on the parent for predictable results. These classes map to CSS `vertical-align`. Bootstrap 4 included the same set. Misunderstanding vertical alignment often comes from applying utilities to block-level elements where they have no effect.

```html
<span class="align-middle">Middle</span>
```

---

## 48. What visibility utilities exist in Bootstrap?

`.visible` and `.invisible` toggle `visibility` while preserving layout space; this differs from `display: none` which removes the box. `.visually-hidden` hides content visually but keeps it available to screen readers (similar to “sr-only” patterns). Choose the right tool: `d-none` removes from layout, `invisible` hides but occupies space, `visually-hidden` is for accessible labels. Bootstrap 4 used `.sr-only`; Bootstrap 5 renamed to `.visually-hidden` with responsive variants in later versions. Test with actual assistive technology when possible.

```html
<h2>Title <span class="visually-hidden">(step 2 of 4)</span></h2>
```

---

## 49. Does Bootstrap ship icons, and how do you use icons with Bootstrap?

Bootstrap Icons is a separate icon library (SVG font-based usage) maintained alongside Bootstrap; it is not bundled inside the core CSS by default. You can include Bootstrap Icons via CDN or npm and place SVGs inline or use `<i>` with appropriate classes per the Icons documentation. Alternatively, teams use Font Awesome, Material Icons, or Lucide with Bootstrap layouts interchangeably. Bootstrap 4 did not have an official icon set; Glyphicons were dropped after v3. Keep icon-only buttons accessible with `aria-label` or visually hidden text.

```html
<!-- After linking bootstrap-icons CSS -->
<i class="bi bi-alarm"></i>
```

---

## 50. What is Bootstrap Reboot and why does it matter?

Reboot is Bootstrap’s opinionated CSS reset built on Normalize-like principles: consistent typography, box-sizing `border-box`, sensible defaults for form elements, and reduced browser quirks. It runs before components and utilities, establishing a baseline so components look coherent. Understanding Reboot helps when your custom styles “fight” Bootstrap defaults. Bootstrap 4 had a similar layer called Reboot as well; tweaks between v4 and v5 include form controls and focus outlines. You can opt out partially by overriding variables or excluding parts in a custom Sass build.

```css
/* Conceptually: reboot sets things like */
*, *::before, *::after { box-sizing: border-box; }
```

---

## 51. How do you customize Bootstrap’s primary color?

In a Sass build, set `$primary` (and other theme colors) before importing Bootstrap’s SCSS, or in CSS override `--bs-primary` and related RGB variables when using the compiled CSS with custom properties. The CSS variable approach in Bootstrap 5 allows runtime theming without recompiling. Bootstrap 4 customization was primarily Sass-variable based at build time. After changing colors, verify contrast ratios for text and interactive states. Document brand tokens for your team so utilities stay consistent.

```css
:root {
  --bs-primary: #0d6efd;
  --bs-primary-rgb: 13, 110, 253;
}
```

---

## 52. What changed from Bootstrap 4 to Bootstrap 5 regarding JavaScript?

Bootstrap 5 rewrote plugins in vanilla JavaScript, removed jQuery as a dependency, and standardized `data-bs-*` attribute prefixes instead of `data-*` without the namespace in many cases. Initialization and events remain conceptually similar but API namespaced under `bootstrap.Modal`, etc. If you migrate legacy code, search-replace data attributes and remove jQuery chains. This reduces bundle size for projects not already using jQuery. Older IE support was dropped, aligning with modern browser baselines.

```js
document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
  new bootstrap.Tooltip(el);
});
```

---

## 53. What is the purpose of `.stretched-link`?

`.stretched-link` on a child link inside a positioned parent makes the entire parent clickable by stretching the link’s pseudo-area with `::after` covering the card. The parent usually needs `.position-relative`. This pattern avoids duplicate links around cards for accessibility if structured carefully. Bootstrap 4.3+ introduced stretched links; Bootstrap 5 continues them. Ensure only one primary interactive element is obvious to keyboard users and that nested interactive controls do not create ambiguous focus order.

```html
<div class="card position-relative">
  <div class="card-body">
    <h5 class="card-title">Title</h5>
    <a href="#" class="stretched-link">Read more</a>
  </div>
</div>
```

---

## 54. How do you create equal-height columns in a row?

In Bootstrap’s flexbox grid, columns in the same row stretch to equal height by default as flex items. If you need cards to match inner content heights, place cards inside columns and use `h-100` on the card to fill the column. For more complex cases, CSS grid or custom flex rules may apply outside Bootstrap. Bootstrap 4 flex grid behaves similarly though older float grids did not equalize heights automatically. Testing in the browser confirms the behavior better than memorizing rules alone.

```html
<div class="row">
  <div class="col-md-6"><div class="card h-100">...</div></div>
  <div class="col-md-6"><div class="card h-100">...</div></div>
</div>
```

---

## 55. What is `no-gutters` in Bootstrap 4 versus Bootstrap 5?

Bootstrap 4 used `.no-gutters` on a row to remove horizontal padding between columns. In Bootstrap 5, gutters are controlled with `g-0` (or `gx-0`/`gy-0`) on the row, reflecting the new gap-based gutter model. When reading older tutorials, mentally translate `no-gutters` to `g-0`. Removing gutters tightens layouts for edge-to-edge image grids but reduces separation between content; always check tap targets on touch devices.

```html
<!-- Bootstrap 5 -->
<div class="row g-0">...</div>
```

---

## 56. How do you nest grids correctly?

Place a new `.row` inside a `.col-*` (or `.col`) and then add columns inside that inner row. The nested row still uses 12 columns relative to its parent column width, not the full page. Avoid placing a row directly inside another row without a column wrapper. Nesting is useful for complex dashboards. Too many nested levels can hurt readability; sometimes flex utilities simplify the same layout. Bootstrap 4 nesting rules matched this pattern.

```html
<div class="row">
  <div class="col-9">
    <div class="row">
      <div class="col-6">Nested</div>
      <div class="col-6">Nested</div>
    </div>
  </div>
</div>
```

---

## 57. What is the `.col` class without a number?

`.col` inside a `.row` participates in flex layout with equal width columns among siblings, consuming available space evenly. You can mix `.col` with numbered columns in some cases, but equal distribution is the main use case. This is cleaner than splitting 12 by hand when you want three equal columns at a breakpoint. Bootstrap 4 added flex-based auto columns similarly. Combine with `col-md` if you want equal columns only from medium screens up.

```html
<div class="row">
  <div class="col">A</div>
  <div class="col">B</div>
  <div class="col">C</div>
</div>
```

---

## 58. How do you handle images in figures?

Use `.figure` with `.figure-img` on the image and `.figure-caption` for descriptive text below or beside. This provides consistent spacing and caption styling. Bootstrap’s figure styles are lightweight; most presentation still comes from utilities. Bootstrap 4 figures are comparable. For accessibility, captions should add information not fully duplicated in `alt` text unless appropriate.

```html
<figure class="figure">
  <img src="x.jpg" class="figure-img img-fluid rounded" alt="">
  <figcaption class="figure-caption">A caption.</figcaption>
</figure>
```

---

## 59. What are input groups in Bootstrap?

`.input-group` merges text addons, buttons, or selects with inputs visually; use `.input-group-text` for prepended or appended labels. Sizing uses `.input-group-sm` or `lg`. Ensure focus order and labels remain accessible when combining multiple controls. Bootstrap 4 input groups are similar; validation feedback placement may need flex tweaks. Do not nest `form-control` incorrectly; follow documentation structure.

```html
<div class="input-group mb-3">
  <span class="input-group-text">@</span>
  <input type="text" class="form-control" placeholder="Username">
</div>
```

---

## 60. How do you validate forms with Bootstrap styles?

Add `.was-validated` to the `<form>` after submit attempt, or use `.is-invalid` / `.is-valid` on individual fields. Provide `.invalid-feedback` blocks with messages tied to inputs via `aria-describedby`. HTML5 validation attributes (`required`, `pattern`) work alongside these classes. Client-side validation is not a substitute for server-side validation. Bootstrap 5 examples show both approaches; Bootstrap 4 used similar classes with `.needs-validation` patterns in docs. Keep error messages specific and actionable.

```html
<form class="needs-validation" novalidate>
  <div class="mb-3">
    <input type="text" class="form-control" required>
    <div class="invalid-feedback">Required field.</div>
  </div>
  <button class="btn btn-primary" type="submit">Submit</button>
</form>
```

---

## 61. What is a nav versus a navbar?

`.nav` and `.nav-link` build inline navigation lists for tabs or pills inside a page section, while `.navbar` is a full horizontal bar often with branding and collapse behavior. Tabs can activate tab panes with JavaScript. Navbars are higher-level layout components. You can place `.nav` inside `.navbar-collapse` for mobile menus. Bootstrap 4 distinguished these similarly. Choose navs for secondary navigation within content and navbars for global chrome.

```html
<ul class="nav nav-pills">
  <li class="nav-item"><a class="nav-link active" href="#">Active</a></li>
  <li class="nav-item"><a class="nav-link" href="#">Link</a></li>
</ul>
```

---

## 62. How do Bootstrap tabs work?

Use `.nav-tabs` with `data-bs-toggle="tab"` on links pointing to `.tab-pane` containers inside `.tab-content`. The Tab JavaScript shows one pane at a time. Set `role` attributes as in docs for accessibility. Bootstrap 5 uses `data-bs-toggle`; Bootstrap 4 used `data-toggle`. Manage initial active classes on both tab and pane. For dynamic content loading, hook into shown events.

```html
<ul class="nav nav-tabs" role="tablist">
  <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#home">Home</button></li>
</ul>
<div class="tab-content">
  <div class="tab-pane fade show active" id="home">...</div>
</div>
```

---

## 63. What is a jumbotron and what happened to it in Bootstrap 5?

Jumbotron was a large padded header component in Bootstrap 4 (`jumbotron` class) for marketing heroes. Bootstrap 5 removed the jumbotron component, encouraging utilities (`py-5`, `bg-light`, containers) or custom components instead. Migration involves replacing `jumbotron` with padded containers and typography utilities. This reduces framework surface area while keeping flexibility. Interviewers may ask this to see if you read migration notes.

```html
<!-- Bootstrap 5 replacement pattern -->
<div class="p-5 mb-4 bg-light rounded-3">
  <div class="container-fluid py-5">
    <h1 class="display-5 fw-bold">Hero</h1>
  </div>
</div>
```

---

## 64. How do you make a sticky top navbar?

Add `.sticky-top` to the navbar element so it sticks within its containing block when scrolling, using `position: sticky`. This differs from `.fixed-top`, which removes the element from flow and requires body padding adjustments. Sticky behavior depends on parent overflow and height. Bootstrap 4 introduced sticky utilities in later versions; Bootstrap 5 documents them clearly. Test on iOS Safari for known sticky quirks with complex ancestors.

```html
<nav class="navbar navbar-expand-lg navbar-light bg-light sticky-top">...</nav>
```

---

## 65. What are card groups and decks?

Bootstrap 4 promoted `.card-deck` for equal-width cards in a row; Bootstrap 5 removed card decks in favor of grid layouts: place cards in `.row` columns or use `.card-group` for merged cards without gutters. `.card-group` connects borders between cards for a unified look. Understanding this migration avoids deprecated markup. For responsive spacing, the grid plus `g-*` gutters is usually simplest.

```html
<div class="card-group">
  <div class="card">...</div>
  <div class="card">...</div>
</div>
```

---

## 66. How does the collapse component work?

`.collapse` hides content; toggling adds `.show` via JavaScript triggered by `data-bs-toggle="collapse"` and `data-bs-target`. Used in accordions and expandable sections. The plugin updates `aria-expanded` when wired correctly in examples. Bootstrap 5 collapse is vanilla JS; Bootstrap 4 needed jQuery. Animations respect `prefers-reduced-motion` if you add custom media queries. Avoid collapsing containers that contain focused elements without moving focus.

```html
<button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#more">More</button>
<div class="collapse" id="more">Hidden content</div>
```

---

## 67. What is a toast notification in Bootstrap?

Toasts are lightweight, autodismissing messages positioned with a `.toast-container`; initialize with `bootstrap.Toast`. They differ from alerts by being transient and often stacked in a corner. Use for nonblocking status updates; critical errors may need modals or inline validation instead. Bootstrap 4 did not include toasts; they are new in Bootstrap 5. Provide `role="alert"` or `status` depending on urgency.

```html
<div class="toast" role="alert">
  <div class="toast-header"><strong class="me-auto">App</strong></div>
  <div class="toast-body">Hello.</div>
</div>
```

---

## 68. How do you use Bootstrap with React or Vue?

You import Bootstrap CSS globally and either use native components with Bootstrap data attributes carefully (managing lifecycle in React) or adopt libraries like React-Bootstrap that reimplement components with framework idioms. Vue has BootstrapVue (note compatibility with Bootstrap versions). The main pitfall is duplicate initialization of tooltips/modals when the DOM re-renders; frameworks need refs and cleanup. Bootstrap itself is framework-agnostic CSS/JS. Bootstrap 4 era code often mixed jQuery; Bootstrap 5 pairs better with modern frameworks without jQuery conflicts.

```jsx
// Illustrative: import 'bootstrap/dist/css/bootstrap.min.css';
```

---

## 69. What is `prefers-reduced-motion` and does Bootstrap respect it?

Users can request reduced motion at the OS level; conscientious sites minimize animations for vestibular disorders. Bootstrap’s components include transitions; you can add CSS media queries to tone them down globally. Bootstrap 5 documentation mentions accessibility considerations for carousels and animations. Not every animation auto-disables without custom CSS. Mentioning this in interviews shows mature frontend awareness beyond class names.

```css
@media (prefers-reduced-motion: reduce) {
  .carousel-item { transition: none; }
}
```

---

## 70. How do you implement dark mode with Bootstrap?

Bootstrap 5.3+ introduced color modes: add `data-bs-theme="dark"` on a root element (often `<html>`) to switch palettes using CSS variables. You can build toggles that flip the attribute and persist preference in `localStorage`. Earlier Bootstrap versions lacked first-class dark mode and required manual overrides. Test components like forms and modals under both themes. Provide user choice rather than only `prefers-color-scheme` if your audience expects manual control.

```html
<html data-bs-theme="dark">
  ...
</html>
```

---

## 71. What is the difference between `container` and `container-fluid` regarding padding?

Both add horizontal padding so content does not touch viewport edges; fluid containers span full width but still have inner padding, while regular containers add padding within the max-width constraint. Adjust with utilities (`px-0`) if you need full-bleed inner content, but consider readability. Bootstrap 4 behaved similarly. Removing padding globally can break alignment with navbar containers; keep hierarchy consistent.

```html
<div class="container-fluid px-0">Edge-to-edge inner (use carefully)</div>
```

---

## 72. How do you align columns vertically in a row?

Use `.align-items-center` or `.align-items-end` on the `.row` (a flex container) to align all columns on the cross axis. For individual column alignment, use `.align-self-*` on a column. This replaces older vertical alignment hacks. Bootstrap 4 flex grid supports the same idea once flex is enabled on rows. If content heights differ, flex alignment is the cleanest approach.

```html
<div class="row align-items-center" style="min-height: 200px;">
  <div class="col">Centered vertically</div>
</div>
```

---

## 73. What are Bootstrap’s print styles?

Bootstrap includes basic print utilities and reboot considerations so backgrounds and links print more predictably; utilities like `d-print-none` hide elements when printing. You can combine with `@media print` custom rules for page breaks in invoices or reports. Not all components print perfectly without tweaks. Bootstrap 4 had limited print helpers; Bootstrap 5 expanded utility coverage. Always use print preview when building printable pages.

```html
<div class="d-print-none">Hidden when printing</div>
```

---

## 74. How do you use `z-index` utilities?

Bootstrap provides stacking utilities like `.z-0`, `.z-1`, `.z-2`, `.z-3` mapped to layered design tokens to avoid arbitrary large z-index values. Stacking context still depends on positioned ancestors; utilities do not solve all overlay bugs. Modals and tooltips manage z-index internally. Bootstrap 5 introduced more systematic z-index scales; Bootstrap 4 relied more on component-specific Sass variables. Debugging overlays often requires inspecting stacking contexts in DevTools.

```html
<div class="position-relative z-3">Above siblings</div>
```

---

## 75. What is the purpose of `ratio` helpers?

The `.ratio` class combined with `.ratio-16x9` (or custom `--bs-aspect-ratio`) wraps iframes or videos to preserve aspect ratio responsively, preventing layout shift. This is preferable to fixed height on embedded media. Bootstrap 5 added these helpers prominently; Bootstrap 4 required manual padding-top hacks for 16:9 embeds. Use with `iframe` `title` attributes for accessibility.

```html
<div class="ratio ratio-16x9">
  <iframe src="https://www.youtube.com/embed/..." title="Video" allowfullscreen></iframe>
</div>
```

---

## 76. How do you use `order` utilities for responsive reordering?

`order-1` through `order-5` plus `order-first` and `order-last` control flex item order, with breakpoint variants (`order-md-2`). This lets you show content in one sequence on mobile and another on desktop without duplicating DOM if order alone suffices. Overusing order can confuse screen reader reading order if it does not match visual order; test accessibility. Bootstrap 4 had order utilities as well in flex contexts.

```html
<div class="d-flex flex-column flex-md-row">
  <div class="order-2 order-md-1">Main</div>
  <div class="order-1 order-md-2">Aside</div>
</div>
```

---

## 77. What is the difference between `mt-3` and `my-3`?

`mt-3` applies margin-top only using the spacing scale, while `my-3` applies both margin-top and margin-bottom equally. Choose axis-specific utilities when you need asymmetric spacing, such as more space below headings. The numeric token `3` refers to the same distance in both cases. Consistent spacing tokens create visual rhythm across a page. Bootstrap 4 used the same shorthand pattern.

```html
<h2 class="mt-5 mb-3">Heading</h2>
```

---

## 78. How do you create a split button dropdown?

Combine a primary button with a separate dropdown toggle button inside `.btn-group` using `.dropdown-toggle-split` to indicate the split. Both actions should be clearly labeled for assistive tech. Bootstrap 5 examples show split variants; Bootstrap 4 had similar patterns. Ensure keyboard users can open the menu from the caret button.

```html
<div class="btn-group">
  <button type="button" class="btn btn-danger">Action</button>
  <button type="button" class="btn btn-danger dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown"></button>
  <ul class="dropdown-menu">...</ul>
</div>
```

---

## 79. What are media objects in Bootstrap and are they still used?

Bootstrap 4 documented `.media` objects for left-aligned images with body content; Bootstrap 5 removed the media object component in favor of flex utilities (`d-flex`, `flex-shrink-0`, `ms-3`). Interviewers referencing older tutorials may mention media objects; you should explain the migration. The flex approach is more flexible and less markup-specific. This exemplifies Bootstrap’s shift toward utilities over bespoke components.

```html
<div class="d-flex">
  <div class="flex-shrink-0"><img src="x.jpg" alt=""></div>
  <div class="flex-grow-1 ms-3">Text</div>
</div>
```

---

## 80. How do you use `text-truncate` for long strings?

`.text-truncate` applies `overflow: hidden`, `text-overflow: ellipsis`, and `white-space: nowrap`, requiring a bounded width parent or `d-inline-block` with a width. Useful for table cells or card titles. For multi-line clamping, CSS line-clamp is outside core Bootstrap and may need custom CSS. Bootstrap 4 had `.text-truncate` similarly. Provide full text in a `title` attribute or expandable UI if truncation hides important information.

```html
<div class="text-truncate" style="max-width: 200px;">Very long product name...</div>
```

---

## 81. What is `placeholder` skeleton UI in Bootstrap?

Bootstrap 5.2+ includes `.placeholder` and `.placeholder-*` utilities to build loading placeholders that pulse or wave, mimicking content layout before data arrives. This improves perceived performance versus blank screens. It is separate from form placeholders. Combine with layout utilities to mirror final UI shapes. Bootstrap 4 did not ship this; developers used third-party skeleton libraries.

```html
<p class="placeholder-glow">
  <span class="placeholder col-7"></span>
</p>
```

---

## 82. How do you use `scrollspy`?

Initialize `bootstrap.ScrollSpy` on `body` or a scrollable container with `data-bs-spy="scroll"` and `data-bs-target` pointing to a nav list whose links reference section IDs. Nav highlights update as you scroll. Useful for documentation pages. Bootstrap 5 uses vanilla JS; Bootstrap 4 needed jQuery. Ensure scrollable parent overflow and offsets for fixed headers via `data-bs-offset`.

```html
<body data-bs-spy="scroll" data-bs-target="#toc" data-bs-offset="70">
```

---

## 83. What is the purpose of `data-bs-dismiss`?

It marks elements that dismiss interactive components such as modals, alerts, and offcanvas when clicked, wiring into Bootstrap’s JavaScript plugins without manual listeners. The attribute name changed from `data-dismiss` in Bootstrap 4 to `data-bs-dismiss` in Bootstrap 5 for namespacing. Understanding data attributes helps debug why a close button might not work—often a missing bundle script or wrong target. Always include proper button types to avoid unintended form submissions.

```html
<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
```

---

## 84. How does Bootstrap handle RTL (right-to-left) layouts?

Bootstrap provides an RTL version of the CSS build that mirrors logical properties for languages like Arabic and Hebrew. Use the documented RTL file and `dir="rtl"` on `html`. Start/end utility naming maps correctly in RTL, which is why Bootstrap 5 moved away from strict left/right names. Bootstrap 4 had experimental RTL support via community projects; Bootstrap 5 integrated RTL more officially. Test layouts because mirrored icons or third-party plugins may still need tweaks.

```html
<html lang="ar" dir="rtl">
  <link href="bootstrap.rtl.min.css" rel="stylesheet">
</html>
```

---

## 85. What is the `visually-hidden-focusable` utility?

It extends `visually-hidden` so content becomes visible when focused, commonly used for “Skip to main content” links for keyboard users. This balances hiding decorative offscreen links with accessibility requirements. Bootstrap 5 documents this pattern; similar `sr-only-focusable` existed in Bootstrap 4. Such details demonstrate knowledge beyond grid classes.

```html
<a class="visually-hidden-focusable" href="#main">Skip to content</a>
```

---

## 86. How do you combine Bootstrap with a CSS preprocessor workflow?

Import Bootstrap’s SCSS partials into your main file, override variables first, then import components selectively to reduce output size. Tools like Sass, Dart Sass, and build pipelines (Vite, Webpack) compile to CSS. You can also use PostCSS with Autoprefixer as Bootstrap expects vendor prefixes resolved at build time in many setups. Bootstrap 4 also used Sass; Less support ended earlier. Understanding the build chain matters for production performance.

```scss
$enable-grid-classes: true;
@import "bootstrap/scss/bootstrap";
```

---

## 87. What are `fw-*` and `fs-*` utilities?

`fw-*` controls font weight (`fw-bold`, `fw-light`, `fw-normal`) while `fs-*` sets font size relative to the type scale (`fs-1` largest, `fs-6` smaller). They decouple heading tags from visual size when semantics differ from design. Bootstrap 5 introduced these more systematically; Bootstrap 4 often used heading classes or custom CSS for the same effect. Avoid using smaller visual text for critical information solely to save space.

```html
<h2 class="fs-4 fw-semibold">Looks like small heading but stays h2 semantically</h2>
```

---

## 88. How do you debug when Bootstrap styles do not apply?

Check load order: your CSS should come after Bootstrap if overriding, unless using `!important` intentionally. Verify the correct bundle (CSS vs RTL) and that the path resolves in the network tab. Conflicting specificity from other frameworks can block utilities. Ensure the element has the expected classes and that parent structure matches docs (e.g., columns must be in rows). Version mismatches between docs and installed package cause subtle class differences.

```html
<!-- Your overrides -->
<link href="bootstrap.min.css" rel="stylesheet">
<link href="app.css" rel="stylesheet">
```

---

## 89. What is the difference between `.img-thumbnail` and `.rounded`?

`.img-thumbnail` adds padding, border, and border-radius for a polaroid-style thumbnail look. `.rounded` only rounds corners without the frame. Choose thumbnails for avatar grids; use `rounded` or `rounded-circle` for softer photo corners without borders. Bootstrap 4 `img-thumbnail` behaves similarly. Combine with `img-fluid` for responsive sizing.

```html
<img src="a.jpg" class="img-thumbnail" alt="">
<img src="b.jpg" class="rounded-circle" width="64" height="64" alt="">
```

---

## 90. How do you use `link-*` utilities for colored links?

Classes like `link-primary` style anchors with colored hover and focus states aligned to theme colors, replacing manual `a { color: ... }` rules. Use on `<a>` elements for consistent interactive affordances. Bootstrap 5.3+ expanded link utilities; earlier versions relied more on contextual classes. Ensure visited/focus states remain distinguishable for accessibility.

```html
<a href="#" class="link-secondary">Secondary link</a>
```

---

## 91. What is `object-fit` utility usage in Bootstrap?

Utilities like `.object-fit-cover` and `.object-fit-contain` control how replaced elements fill their box, useful for card images with fixed heights. Pair with fixed height containers to crop consistently. These map to CSS `object-fit`. Bootstrap 5 added object-fit utilities; Bootstrap 4 typically needed custom CSS. This helps image grids look uniform.

```html
<img src="x.jpg" class="w-100 h-100 object-fit-cover" alt="">
```

---

## 92. How do you handle long form multi-step wizards in Bootstrap?

Bootstrap does not provide a dedicated wizard component; you combine progress bars, tab/pill navigation, or step indicators built with utilities and your own state machine in JavaScript. Validate each step before advancing. Modals or full-page steps are design choices. Mentioning this shows you understand framework boundaries. Bootstrap 4 projects used the same approach.

```html
<div class="progress mb-3"><div class="progress-bar" style="width: 33%"></div></div>
```

---

## 93. What is `clearfix` and when is it needed?

`.clearfix` applies `::after` pseudo-element tricks so a parent containing floated children expands to contain them. Less critical now that flex/grid dominate, but still relevant when using float utilities. Bootstrap 4 documented clearfix similarly. If you can refactor to flexbox, you may avoid floats entirely.

```html
<div class="clearfix">
  <div class="float-start">Floated</div>
</div>
```

---

## 94. How do you lazy-load images with Bootstrap markup?

Bootstrap does not lazy-load by itself; you add native `loading="lazy"` on images or use a library. Markup remains standard with `img-fluid`. Performance is an orthogonal concern handled by the browser or JS. Interviewers may pair Bootstrap knowledge with core web platform features. Always size containers to reduce cumulative layout shift.

```html
<img src="big.jpg" class="img-fluid" loading="lazy" alt="">
```

---

## 95. What is the purpose of `role` attributes in Bootstrap components?

ARIA roles (`role="navigation"`, `role="alert"`, etc.) communicate semantics to assistive technologies where native HTML alone is insufficient or when composing widgets. Bootstrap examples include recommended roles for navbars, alerts, and modals. Roles do not replace keyboard behavior; you must implement interactions correctly. Bootstrap 4 and 5 docs both stress accessibility patterns. Misused roles can harm accessibility, so follow examples carefully.

```html
<nav class="navbar" role="navigation">...</nav>
```

---

## 96. What is the difference between Bootstrap grid columns and CSS multi-column layout?

Bootstrap’s `.col-*` classes implement a horizontal layout grid (flexbox) for page structure, not the CSS `column-count` / `column-gap` feature used for flowing newspaper-style text across multiple columns. The framework does not ship first-class utilities for typographic multi-column blocks; you add those with custom CSS or small project-specific classes when you need them. Confusing the two “column” concepts leads to wrong expectations in interviews and in implementation. For long article text, single-column layouts on small screens remain easier to read; use multi-column text sparingly and test line length.

```css
.article-columns {
  column-count: 2;
  column-gap: 2rem;
}
@media (max-width: 576px) {
  .article-columns { column-count: 1; }
}
```

---

## 97. What is Bootstrap’s policy on browser support?

Bootstrap 5 targets the latest stable releases of major browsers and does not support Internet Explorer 11, simplifying CSS and JS implementations. Bootstrap 4 had limited IE11 support with polyfills in some setups. Always check the version’s documentation for the exact matrix. Enterprise environments may lag; knowing version trade-offs is useful. Feature detection or progressive enhancement may still be needed for niche browsers.

---

## 98. How do you reduce Bootstrap bundle size?

Import only needed SCSS partials, enable/disable features via Sass flags like `$enable-utilities`, purge unused CSS with tools in production pipelines, and avoid importing the entire JS bundle if you only need collapse or modal—use modular imports where supported. CDNs minify but still ship full CSS unless you customize. Bootstrap 5’s modular Sass is easier to trim than older monolithic CSS workflows. Measure with bundle analyzers after changes.

```scss
$enable-negative-margins: false;
```

---

## 99. What are common mistakes beginners make with Bootstrap?

Frequent mistakes include nesting rows incorrectly, forgetting `container`/`container-fluid`, misusing offset classes so columns exceed 12 units, relying on utilities without understanding specificity, and initializing JavaScript components twice in SPAs. Another mistake is skipping accessibility attributes from documentation. Confusing Bootstrap 4 and 5 data attributes breaks toggles. Reviewing official docs and migration guides prevents these errors. Experience teaches debugging strategies more than memorizing class lists.

---

## 100. How would you summarize when to choose Bootstrap for a project?

Choose Bootstrap when you want rapid UI development with consistent components, strong documentation, and a utility-first companion to custom design systems, especially for dashboards and marketing sites where speed matters. Consider alternatives if you need a highly unique visual language with minimal resemblance to Bootstrap defaults, or if your team already standardized on another framework like Tailwind or Material. Bootstrap 5’s removal of jQuery and addition of CSS variables improve integration with modern toolchains compared to Bootstrap 4-era stacks. The right choice balances team skill, brand requirements, bundle size, and long-term maintenance expectations.

---
