# 200 Bootstrap 5.3 Real-Time Assignments

Use **Bootstrap 5.3** (CDN or build), **`data-bs-*` attributes**, and the **Bootstrap JavaScript bundle** (no jQuery).

---

## BEGINNER (Assignments 1–70)

### Setup & Containers (1–6)

**Assignment 1:** Create a valid HTML5 page that loads Bootstrap 5.3 CSS and the Bootstrap bundle JS from a CDN in the correct order.

**Assignment 2:** Add a `.container` with sample text and explain (in a comment) how its max-width changes at breakpoints.

**Assignment 3:** Build a page section using `.container-fluid` that spans the full viewport width with padded content.

**Assignment 4:** Show three stacked blocks: default `.container`, `.container-sm`, and `.container-lg`, each with a visible border so width differences are obvious.

**Assignment 5:** Use responsive container classes (e.g. `.container-md`) so the layout is fluid on extra-small screens and constrained from `md` upward.

**Assignment 6:** Nest a `.container` inside a colored full-width wrapper (`.bg-light`) to demonstrate outer background vs inner constrained content.

### Grid System (7–20)

**Assignment 7:** Create a single row with two equal columns on all breakpoints using the grid.

**Assignment 8:** Build a row with three columns that stack on `xs` and sit side-by-side from `sm` upward (`col-12 col-sm-4`).

**Assignment 9:** Use `col-md-6` and `col-md-6` for a two-column layout that stacks below `md`.

**Assignment 10:** Create a layout with `col-lg-8` and `col-lg-4` that stacks on smaller screens.

**Assignment 11:** Use `col-xl` and `col-xxl` breakpoints: three columns from `xl`, four columns from `xxl`.

**Assignment 12:** Demonstrate auto-layout columns using `.row` and multiple `.col` elements without explicit numbers.

**Assignment 13:** Nest a `.row` inside a column: outer two columns, inner row with three equal child columns.

**Assignment 14:** Use offset classes (`offset-md-2`, etc.) to center a `col-md-8` column.

**Assignment 15:** Apply `.order-*` and responsive order utilities to reorder three columns on `md` vs `sm`.

**Assignment 16:** Use default gutters, then a row with `.g-0`, then `.g-4` to show gutter differences.

**Assignment 17:** Use `.gy-3` and `.gx-5` on one row to set vertical and horizontal gutters independently.

**Assignment 18:** Build three columns with equal visual height using cards inside columns and `.h-100` on cards.

**Assignment 19:** Hide a column on `xs` with `.d-none` and show it from `md` with `.d-md-block`.

**Assignment 20:** Combine `col` sizing, `w-100` row breaks, and a nested grid in one responsive section.

### Typography (21–28)

**Assignment 21:** Use semantic headings `<h1>`–`<h6>` with Bootstrap heading classes where appropriate.

**Assignment 22:** Add `.display-1` through `.display-6` samples in one section.

**Assignment 23:** Style an intro paragraph with `.lead`.

**Assignment 24:** Demonstrate text alignment utilities: `.text-start`, `.text-center`, `.text-end`, and responsive variants.

**Assignment 25:** Show `.text-break`, `.text-nowrap`, and `.text-truncate` (with fixed width) examples.

**Assignment 26:** Apply `.text-uppercase`, `.text-lowercase`, and `.text-capitalize` to sample text.

**Assignment 27:** Use contextual text color utilities (`.text-primary`, `.text-muted`, `.text-danger`, etc.).

**Assignment 28:** Build a `.blockquote` with `.blockquote-footer` and styled ordered/unordered lists (`.list-unstyled`, `.list-inline`).

### Colors & Backgrounds (29–34)

**Assignment 29:** Display a row of text samples using `.text-primary`, `.text-secondary`, `.text-success`, `.text-warning`, `.text-info`, `.text-danger`.

**Assignment 30:** Show background utilities `.bg-primary` through `.bg-dark` on padded boxes with contrasting text.

**Assignment 31:** Use combined `.text-bg-primary`, `.text-bg-success`, etc., on badges or cards.

**Assignment 32:** Apply `.bg-opacity-*` (or text opacity) utilities on top of a colored background.

**Assignment 33:** Combine border color utilities with background colors for subtle cards.

**Assignment 34:** Use `.link-*` colored links and hover states in a short navigation list.

### Spacing & Sizing (35–42)

**Assignment 35:** Demonstrate margin scale `.m-0` through `.m-5` on separate boxes.

**Assignment 36:** Use directional margins `.mt-*`, `.mb-*`, `.ms-*`, `.me-*` on headings and paragraphs.

**Assignment 37:** Apply padding `.p-*` and axis padding `.px-*`, `.py-*` inside bordered divs.

**Assignment 38:** Use responsive spacing: e.g. `.p-2 .p-md-4 .p-lg-5` on one element.

**Assignment 39:** Show `.mx-auto` centering a block with a defined width.

**Assignment 40:** Use width utilities `.w-25`, `.w-50`, `.w-75`, `.w-100` inside a container.

**Assignment 41:** Use height utilities `.h-25`, `.h-50`, `.h-100` inside a min-height wrapper.

**Assignment 42:** Combine `.min-vh-100` on a section with centered content using flex utilities.

### Buttons (43–50)

**Assignment 43:** Create buttons for all solid variants: `.btn-primary` through `.btn-dark` and `.btn-link`.

**Assignment 44:** Create outline buttons `.btn-outline-*` for at least four semantic colors.

**Assignment 45:** Show button sizes `.btn-lg`, default, and `.btn-sm`.

**Assignment 46:** Build a full-width button with `.d-grid` and `.btn-block` pattern (Bootstrap 5: use grid gap).

**Assignment 47:** Group buttons with `.btn-group` and a grouped set of three related actions.

**Assignment 48:** Add `.btn-group` with `.active` toggle state using `data-bs-toggle="button"` on buttons.

**Assignment 49:** Show disabled buttons using `disabled` attribute and `.disabled` on a link styled as button.

**Assignment 50:** Create a horizontal row of “social” icon buttons (use text or SVG placeholders) with `.btn` variants.

### Images & Tables (51–58)

**Assignment 51:** Make an image responsive with `.img-fluid` inside a column.

**Assignment 52:** Apply `.img-thumbnail` to a square image.

**Assignment 53:** Use `.rounded`, `.rounded-circle`, and `.rounded-pill` on images or placeholders.

**Assignment 54:** Structure content with `<figure>`, `.figure`, `.figure-img`, and `.figure-caption`.

**Assignment 55:** Create a `.table-responsive` wrapper around a wide table.

**Assignment 56:** Add `.table-striped` rows to a table.

**Assignment 57:** Add `.table-hover` and `.table-bordered` to a table.

**Assignment 58:** Apply `.table-primary`, `.table-danger`, etc., on rows or cells for contextual coloring.

### Basic Components (59–70)

**Assignment 59:** Show dismissible and non-dismissible `.alert` variants with `.alert-*` colors.

**Assignment 60:** Use `.badge` with `.text-bg-*` in headings and buttons.

**Assignment 61:** Build a `.breadcrumb` with three items, last one active.

**Assignment 62:** Create a `.list-group` with active and disabled items.

**Assignment 63:** Add `.list-group-item-action` for hover states on list items.

**Assignment 64:** Show border and borderless `.spinner-border` and `.spinner-grow`.

**Assignment 65:** Build labeled and striped `.progress` bars with `.progress-bar`.

**Assignment 66:** Create a basic `.card` with `.card-body`, title, and text.

**Assignment 67:** Add `.card-img-top` and a card image (placeholder) with body below.

**Assignment 68:** Use `.card-header` and `.card-footer` with a card body between.

**Assignment 69:** Build a `.row`–`.col` horizontal card: image column + body column on `md+`.

**Assignment 70:** Implement `.pagination` with `.page-item` active/disabled states.

---

## INTERMEDIATE (Assignments 71–140)

### Navbar (71–82)

**Assignment 71:** Build a basic `.navbar` with brand text and three links.

**Assignment 72:** Add `.navbar-toggler` and a collapsible `.navbar-collapse` with `data-bs-toggle="collapse"`.

**Assignment 73:** Use `.navbar-brand` with an `<img>` logo and site name.

**Assignment 74:** Place a `.dropdown` menu inside the navbar using `data-bs-toggle="dropdown"`.

**Assignment 75:** Use `.fixed-top` on a navbar and add top padding to `body` so content is not hidden.

**Assignment 76:** Use `.sticky-top` navbar that sticks on scroll within the document flow.

**Assignment 77:** Apply `.navbar-dark` and `.bg-dark` (or `data-bs-theme="dark"` on navbar) for a dark scheme.

**Assignment 78:** Build a responsive navbar that opens an `.offcanvas` panel for navigation on small screens.

**Assignment 79:** Add a search `.form-control` and button inside `.navbar` using `.d-flex`.

**Assignment 80:** Create a multi-level style menu using dropdowns (nested menus simulated with dropdown headers/divider).

**Assignment 81:** Build a navbar with `data-bs-theme="dark"` and a light page `data-bs-theme="light"` for contrast.

**Assignment 82:** Combine sticky navbar, container-fluid, and right-aligned dropdown user menu.

### Forms (83–98)

**Assignment 83:** Create a stacked form with `.mb-3`, labels, and `.form-control` inputs.

**Assignment 84:** Use `.form-floating` labels on email and password fields.

**Assignment 85:** Build `.input-group` with prepend text, control, and append button.

**Assignment 86:** Style `<select>` with `.form-select` and disabled/selected options.

**Assignment 87:** Group checkboxes with `.form-check` and name attributes.

**Assignment 88:** Use inline radios with `.form-check-inline` for a choice set.

**Assignment 89:** Add a `.form-check.form-switch` toggle.

**Assignment 90:** Implement a `.form-range` slider with label.

**Assignment 91:** Add client-side validation: `.was-validated` on `<form>` with required fields.

**Assignment 92:** Show `.is-valid` and `.is-invalid` states with `.valid-feedback` / `.invalid-feedback`.

**Assignment 93:** Build a form using grid: `.row`, `.col-md-6` for name fields, full width for address.

**Assignment 94:** Create an inline-ish layout with `.row.g-3.align-items-end` and submit button.

**Assignment 95:** Use `.form-text` for help below an input.

**Assignment 96:** Disable a fieldset with `disabled` on `<fieldset>` wrapping controls.

**Assignment 97:** Use `.form-control-plaintext` for read-only display of an email.

**Assignment 98:** Combine validation, floating labels, and input group in one signup form.

### Modals & Offcanvas (99–108)

**Assignment 99:** Create a button that opens a basic modal via `data-bs-toggle="modal"` and `data-bs-target`.

**Assignment 100:** Set `data-bs-backdrop="static"` and `data-bs-keyboard="false"` on a modal.

**Assignment 101:** Use `.modal-dialog-scrollable` for long modal body content.

**Assignment 102:** Center the modal with `.modal-dialog-centered`.

**Assignment 103:** Use `.modal-fullscreen` (or `modal-fullscreen-md-down`) for a responsive fullscreen modal.

**Assignment 104:** Put a small form (email + submit) inside `.modal-body`.

**Assignment 105:** Create an offcanvas panel from the start (`offcanvas-start`) with a list of links.

**Assignment 106:** Add `offcanvas-end` with contact details and a close button.

**Assignment 107:** Use `offcanvas-top` for a thin announcement bar pattern.

**Assignment 108:** Use `offcanvas-bottom` with a mobile cart summary.

### Carousel & Accordions (109–116)

**Assignment 109:** Build a basic `.carousel` with three slides and prev/next controls.

**Assignment 110:** Add `.carousel-caption` on each slide with title and text.

**Assignment 111:** Show `.carousel-indicators` with `data-bs-target` buttons.

**Assignment 112:** Add `.carousel-fade` for crossfade transition.

**Assignment 113:** Set `data-bs-ride="carousel"` and `data-bs-interval` for autoplay behavior.

**Assignment 114:** Create a default `.accordion` with three `.accordion-item` components.

**Assignment 115:** Use `.accordion-collapse` with `.show` on multiple items (always-open pattern via separate collapse IDs).

**Assignment 116:** Apply `.accordion-flush` inside a card-like container.

### Tooltips, Popovers & Toasts (117–124)

**Assignment 117:** Initialize tooltips in JS and add buttons with `data-bs-toggle="tooltip"` for top/bottom placements.

**Assignment 118:** Use `data-bs-placement="left"` and `"right"` on tooltip triggers.

**Assignment 119:** Enable a popover with `data-bs-toggle="popover"` and `data-bs-content`.

**Assignment 120:** Set `data-bs-html="true"` on a popover with simple HTML in the content (trusted content only).

**Assignment 121:** Place a toast `.toast` inside `.toast-container` with a live region.

**Assignment 122:** Use `data-bs-autohide="true"` and `data-bs-delay` on a toast.

**Assignment 123:** Stack multiple toasts vertically in one container.

**Assignment 124:** Add a “Show toast” button that displays a hidden toast using Bootstrap’s Toast API in a script.

### Dropdowns & Tabs (125–132)

**Assignment 125:** Basic single `.dropdown` button menu with three items.

**Assignment 126:** Build a split button dropdown `.dropdown-toggle-split`.

**Assignment 127:** Use `.dropup`, `.dropend`, `.dropstart` variations with dropdown menus.

**Assignment 128:** Create `.nav.nav-tabs` with tab panes using `data-bs-toggle="tab"`.

**Assignment 129:** Use `.nav-pills` instead of tabs for the same content panels.

**Assignment 130:** Stack `.nav.flex-column.nav-pills` for vertical navigation (width col-3 + content col-9).

**Assignment 131:** Wire tab buttons to `.tab-content` and `.tab-pane` with `fade`.

**Assignment 132:** Put a dropdown inside a tab bar item.

### Utilities in Depth (133–140)

**Assignment 133:** Build a toolbar using `.d-flex`, `.justify-content-between`, `.align-items-center`, and `.gap-2`.

**Assignment 134:** Demonstrate `.position-static`, `.position-relative`, `.position-absolute`, and `.top-0.end-0` corner badge.

**Assignment 135:** Use responsive display: `.d-none.d-md-flex` on a flex row.

**Assignment 136:** Apply `.overflow-hidden`, `.overflow-auto` on fixed-height boxes.

**Assignment 137:** Show shadow utilities `.shadow`, `.shadow-sm`, `.shadow-lg`, `.shadow-none`.

**Assignment 138:** Combine `.border`, `.border-top`, `.rounded-3`, `.rounded-circle` on UI chips.

**Assignment 139:** Use `.visible` and `.invisible` (and explain visibility vs display).

**Assignment 140:** Create a card where the whole card is clickable using `.stretched-link` on a nested anchor.

---

## ADVANCED (Assignments 141–200)

### Complex Layouts (141–152)

**Assignment 141:** Build an admin dashboard shell: top navbar, sidebar column, and main content with cards.

**Assignment 142:** Create an e-commerce product grid using responsive columns and uniform-height product cards.

**Assignment 143:** Layout a blog: featured post row, list of posts, sidebar with widgets.

**Assignment 144:** Portfolio gallery: masonry-style feel using a multi-column card grid and varied card heights.

**Assignment 145:** Pricing page: three tier cards, middle tier emphasized with border/shadow.

**Assignment 146:** Landing page: hero (jumbotron-style), features row, CTA, footer.

**Assignment 147:** Team page: responsive `.row-cols-*` of team member cards.

**Assignment 148:** Split login/registration: two columns on `lg`, stacked on mobile.

**Assignment 149:** Multi-column footer with headings, links, and social row.

**Assignment 150:** Sidebar layout: collapsible sidebar + main; sidebar `col-lg-3`, content `col-lg-9`.

**Assignment 151:** Sticky sidebar with `.sticky-top` while main content scrolls (within a two-column row).

**Assignment 152:** “Masonry” simulation: multiple columns of cards with different lengths (no Masonry JS).

### JavaScript Components (153–164)

**Assignment 153:** Open a modal programmatically using `bootstrap.Modal` constructor and `.show()`.

**Assignment 154:** Initialize all `[data-bs-toggle="tooltip"]` on `DOMContentLoaded`.

**Assignment 155:** Create a popover whose content is updated before show using the `inserted.bs.popover` event.

**Assignment 156:** Implement scrollspy: `body { position: relative; }`, `.navbar` with `data-bs-spy="scroll"` targets.

**Assignment 157:** Toggle a collapse panel with `bootstrap.Collapse.getOrCreateInstance` in a button click handler.

**Assignment 158:** Move carousel to a specific slide with the Carousel API `.to()`.

**Assignment 159:** Write a minimal “toast manager” function `showToast(message)` that clones a template toast and shows it.

**Assignment 160:** Listen for `hidden.bs.dropdown` and log or update UI state.

**Assignment 161:** Use the browser Constraint Validation API alongside Bootstrap visual states on submit.

**Assignment 162:** Dispatch and listen for a custom `app:themechange` event when toggling dark mode.

**Assignment 163:** Programmatically show/hide offcanvas with Offcanvas API.

**Assignment 164:** Combine Modal events (`show.bs.modal`) to focus the first input when opened.

### Customization (165–174)

**Assignment 165:** Document (in comments) key Sass variables you would override for brand colors (`$primary`, etc.).

**Assignment 166:** Show a `<style>` block redefining CSS variables `--bs-primary` on `:root` for quick theming.

**Assignment 167:** Explain (comment) how to add a custom breakpoint in Sass (`$grid-breakpoints`).

**Assignment 168:** Add a custom utility in a `<style>` block using the same pattern as Bootstrap utilities (single-property class).

**Assignment 169:** Create a “stat card” component pattern using only utility classes and one extra semantic class in CSS.

**Assignment 170:** Describe (comment) using Bootstrap’s Utility API (`utilities` map) in a custom Sass build.

**Assignment 171:** Override spacing scale via CSS variables `--bs-spacer` usage in a demo.

**Assignment 172:** Build a small color palette swatch row using CSS variables mapped to buttons.

**Assignment 173:** Use `@import` in a commented example listing order for `functions`, `variables`, `maps`, `mixins`, `bootstrap`.

**Assignment 174:** Create a branded navbar color by overriding `--bs-navbar-color` / background CSS variables on a wrapper.

### Dark Mode (175–180)

**Assignment 175:** Set `data-bs-theme="light"` on `<html>` and add a button to switch to `dark` by toggling the attribute with JS.

**Assignment 176:** Use `[data-bs-theme="dark"]` scoped styles in `<style>` to tweak card borders.

**Assignment 177:** Apply `data-bs-theme="dark"` only on a `.card` to show per-component theming.

**Assignment 178:** Use `prefers-color-scheme: dark` in a small script to set initial theme automatically.

**Assignment 179:** Build themed cards that look correct in both light and dark using Bootstrap semantic classes only.

**Assignment 180:** Add a navbar toggle icon button that switches theme and persists choice in `localStorage`.

### Responsive Patterns (181–188)

**Assignment 181:** Responsive sidebar that becomes offcanvas on screens below `lg`.

**Assignment 182:** Mobile-first dashboard: single column stats on `xs`, two on `sm`, four on `lg`.

**Assignment 183:** Pricing cards that stack on mobile and align as a row with featured scale on `md+`.

**Assignment 184:** Navigation that shows inline links on `lg` and a navbar toggler below.

**Assignment 185:** Footer columns: 1 col mobile, 2 cols `sm`, 4 cols `lg`.

**Assignment 186:** Hero section with responsive typography (`.display-*` + column split image/text).

**Assignment 187:** Testimonials row using `.row-cols-1.row-cols-md-2.row-cols-lg-3`.

**Assignment 188:** Vertical timeline layout using border utilities and responsive alignment.

### Real-World Projects (189–200)

**Assignment 189:** Single-page responsive marketing landing (hero, features, pricing teaser, footer).

**Assignment 190:** Admin dashboard with chart placeholders, table, and dropdown user menu.

**Assignment 191:** E-commerce homepage: hero, categories, product grid, newsletter strip.

**Assignment 192:** Blog listing with sidebar categories, tags cloud placeholder, pagination.

**Assignment 193:** Personal portfolio: about, projects grid, contact form, social links.

**Assignment 194:** Restaurant menu: categorized sections, prices, dietary badges.

**Assignment 195:** Event booking: event details, schedule accordion, registration form, map placeholder.

**Assignment 196:** Social profile: cover area, avatar, stats row, post cards.

**Assignment 197:** Job board: filter form, job list group, pagination.

**Assignment 198:** Weather dashboard: city selector, card grid for metrics, list-group forecast.

**Assignment 199:** Real estate listings: filter bar, property cards with image, price badge, CTA.

**Assignment 200:** SaaS landing: hero with signup form, logo row, feature columns, testimonial, sticky CTA bar.
