# Bootstrap MCQ - Set 6 (Expert Level)

**1. How do you create a modal instance with custom options in JavaScript?**

a) `Construct with new bootstrap.Modal(element, options)`
b) `Use jQuery .modal as the only supported API`
c) `Call document.createModal()`
d) `Call Modal.attach(element)`

**Answer: a) `Construct with new bootstrap.Modal(element, options)`**

---

**2. What does `bootstrap.Modal.getOrCreateInstance(el, config)` do?**

a) `Returns an existing instance or constructs one, optionally merging config`
b) `Always throws if an instance exists`
c) `Removes the element from the DOM`
d) `Loads jQuery automatically`

**Answer: a) `Returns an existing instance or constructs one, optionally merging config`**

---

**3. Which method programmatically shows a tab pane?**

a) `bootstrap.Tab.getOrCreateInstance(triggerEl).show()`
b) `Tab.openAll()`
c) `document.showTab()`
d) `bootstrap.Nav.show()`

**Answer: a) `bootstrap.Tab.getOrCreateInstance(triggerEl).show()`**

---

**4. How do you listen for Bootstrap’s lifecycle events?**

a) `element.addEventListener with the shown.bs.modal event`
b) `element.on with jQuery without a plugin`
c) `Set window.modal = true`
d) `Use CSS @events`

**Answer: a) `element.addEventListener with the shown.bs.modal event`**

---

**5. Where are default options for a plugin typically documented?**

a) `The component’s JavaScript documentation (Default values section)`
b) `Only in minified CSS comments`
c) `In package.json scripts`
d) `They are random per build`

**Answer: a) `The component’s JavaScript documentation (Default values section)`**

---

**6. What describes Bootstrap 5’s JavaScript plugin architecture?**

a) `Class-based plugins with a static getInstance pattern and data-api hooks`
b) `Global functions only`
c) `WebAssembly modules`
d) `PHP includes`

**Answer: a) `Class-based plugins with a static getInstance pattern and data-api hooks`**

---

**7. Is jQuery required for Bootstrap 5 JavaScript?**

a) `No; Bootstrap 5 JS is written without a jQuery dependency`
b) `Yes; jQuery is mandatory`
c) `Only on Safari`
d) `Only for CSS`

**Answer: a) `No; Bootstrap 5 JS is written without a jQuery dependency`**

---

**8. Which Vite entry pattern commonly imports Bootstrap SCSS and JS?**

a) `import 'bootstrap/scss/bootstrap.scss'; import * as bootstrap from 'bootstrap'`
b) `require('vite-jquery')`
c) `link rel="import" href="bootstrap.exe"`
d) `Only use Grunt`

**Answer: a) `import bootstrap SCSS and import bootstrap as ESM in main.js`**

---

**9. Why define `sass` `additionalData` or tilde aliases in webpack for Bootstrap?**

a) `So Sass can resolve Bootstrap’s internal imports and variables cleanly`
b) `To disable CSS`
c) `To bundle PHP`
d) `To replace HTML`

**Answer: a) `So Sass can resolve Bootstrap’s internal imports and variables cleanly`**

---

**10. What is a common PurgeCSS / content option strategy with Bootstrap?**

a) `Point content globs at all templates and JS files that emit class names`
b) `Scan only package.json`
c) `Disable safelisting entirely always`
d) `Remove bootstrap.css from disk`

**Answer: a) `Point content globs at all templates and JS files that emit class names`**

---

**11. Why safelist dynamic Bootstrap classes when purging?**

a) `Classes built at runtime (string concat) won’t appear in static scans`
b) `Safelisting is never needed`
c) `Bootstrap has no dynamic classes`
d) `PurgeCSS cannot read HTML`

**Answer: a) `Classes built at runtime (string concat) won’t appear in static scans`**

---

**12. How do you enable Bootstrap’s experimental CSS Grid layout mode?**

a) `Set $enable-cssgrid: true in Sass before importing Bootstrap`
b) `Add data-grid="on" to html`
c) `It is always on with no flag`
d) `Use only Bootstrap 3`

**Answer: a) `Set $enable-cssgrid: true in Sass before importing Bootstrap`**

---

**13. Which attribute naming change is a hallmark of Bootstrap 5 vs 4 for toggles?**

a) `data-bs-* instead of data-* for many components`
b) `onclick only`
c) `href-bs-*`
d) `There is no change`

**Answer: a) `data-bs-* instead of data-* for many components`**

---

**14. What happened to `.form-group` in Bootstrap 5 guidance?**

a) `It was dropped; spacing utilities and grid handle layout`
b) `It is required on every input`
c) `It moved to JavaScript`
d) `It became .form-row only`

**Answer: a) `It was dropped; spacing utilities and grid handle layout`**

---

**15. Which class replaced `.ml-*` / `.mr-*` in Bootstrap 5 utilities?**

a) `ms-* and me-* (logical start/end)`
b) `mxl-* and mxr-*`
c) `margin-left-* only`
d) `They were unchanged`

**Answer: a) `ms-* and me-* (logical start/end)`**

---

**16. Which breakpoint is new in Bootstrap 5 compared to Bootstrap 4?**

a) `xxl`
b) `xs as a new class prefix`
c) `3xl`
d) `nano`

**Answer: a) `xxl`**

---

**17. Compared to utility-first frameworks, a trade-off of Bootstrap is often what?**

a) `Faster prototyping but heavier defaults unless customized or purged`
b) `No components at all`
c) `No responsive features`
d) `Cannot use with React`

**Answer: a) `Faster prototyping but heavier defaults unless customized or purged`**

---

**18. Which pattern helps a “holy grail” layout: header, footer, fluid center, fixed sidebars?**

a) `Grid or flex utilities with sticky sidebars and min-height 100vh structure`
b) `Tables for all layout`
c) `iframes only`
d) `Framesets`

**Answer: a) `Grid or flex utilities with sticky sidebars and min-height 100vh structure`**

---

**19. For a dashboard with a sticky sidebar and scrollable main pane, which utilities help?**

a) `sticky-top / offcanvas for mobile, overflow-auto on main, flex columns`
b) `float-left on everything`
c) `position:absolute on body`
d) `marquee tags`

**Answer: a) `sticky-top / offcanvas for mobile, overflow-auto on main, flex columns`**

---

**20. Which attribute toggles light/dark color modes in Bootstrap 5.3+?**

a) `data-bs-theme="dark" on a root or subtree`
b) `data-dark="maybe"`
c) `class="night"`
d) `meta color-scheme only without attributes`

**Answer: a) `data-bs-theme="dark" on a root or subtree`**

---

**21. How can you switch color modes at runtime?**

a) `Set data-bs-theme on document.documentElement and persist user preference`
b) `Reload the OS only`
c) `Rename bootstrap.css manually`
d) `It cannot change`

**Answer: a) `Set data-bs-theme on document.documentElement and persist user preference`**

---

**22. Which class pair creates a floating label input?**

a) `form-floating with form-control inside`
b) `float-label-old`
c) `label-float-bs4`
d) `input-float only`

**Answer: a) `form-floating with form-control inside`**

---

**23. Bootstrap does not ship a built-in input mask plugin; what is the usual approach?**

a) `Integrate a dedicated masking library alongside form-control styling`
b) `Use type="mask"`
c) `Use only pattern attribute for all complex masks without JS`
d) `Masks are in bootstrap.bundle.js`

**Answer: a) `Integrate a dedicated masking library alongside form-control styling`**

---

**24. Which wrapper groups equal-width cards as a single visual unit?**

a) `card-group`
b) `card-deck (removed in Bootstrap 5)`
c) `card-row-old`
d) `panel-group-bs3`

**Answer: a) `card-group`**

---

**25. Why was `.card-deck` removed in Bootstrap 5?**

a) `Grid utilities and row/cols achieve the same layouts more flexibly`
b) `Cards were removed`
c) `It was merged into tables`
d) `Legal reasons`

**Answer: a) `Grid utilities and row/cols achieve the same layouts more flexibly`**

---

**26. Masonry-style layouts with Bootstrap typically require what?**

a) `A masonry library or CSS columns; Bootstrap grid is not a masonry engine`
b) `class="masonry" built into row`
c) `Only card-group`
d) `Java applets`

**Answer: a) `A masonry library or CSS columns; Bootstrap grid is not a masonry engine`**

---

**27. For a multi-level navbar, what is a common accessibility requirement?**

a) `Keyboard operability, aria-expanded, focus order, and escape to close submenus`
b) `Only mouse hover`
c) `Remove ARIA`
d) `Use divs without roles`

**Answer: a) `Keyboard operability, aria-expanded, focus order, and escape to close submenus`**

---

**28. Mega menus often combine which Bootstrap pieces?**

a) `Navbar, dropdown or full-width panels, grid inside dropdown, and careful positioning`
b) `Carousel only`
c) `Modal inside modal recursively without limit`
d) `Tables inside tooltips`

**Answer: a) `Navbar, dropdown or full-width panels, grid inside dropdown, and careful positioning`**

---

**29. Which CSP concern applies to Bootstrap’s JavaScript when using inline configuration?**

a) `Inline scripts may violate script-src unless nonces or hashes are allowed`
b) `CSP never applies to Bootstrap`
c) `Bootstrap requires eval always`
d) `CSP blocks only images`

**Answer: a) `Inline scripts may violate script-src unless nonces or hashes are allowed`**

---

**30. Which approach aligns with strict CSP when initializing components?**

a) `External JS files with addEventListener and constructors; avoid unsafe-inline`
b) `Many onclick attributes in HTML`
c) `javascript: URLs everywhere`
d) `data:text/html iframes`

**Answer: a) `External JS files with addEventListener and constructors; avoid unsafe-inline`**

---

**31. What does `preventDefault()` on `show.bs.modal` accomplish?**

a) `It can cancel the show action before the modal opens`
b) `It always hides the modal`
c) `It removes the backdrop permanently`
d) `It deletes the DOM node`

**Answer: a) `It can cancel the show action before the modal opens`**

---

**32. Which configuration object property controls focus retention in a modal?**

a) `focus true keeps focus management enabled by default`
b) `scroll false only`
c) `aria off`
d) `css true`

**Answer: a) `focus true keeps focus management enabled by default`**

---

**33. In ESM bundlers, why import Collapse explicitly?**

a) `To include only that plugin instead of the full bundle`
b) `Collapse cannot be imported alone`
c) `It is CSS-only`
d) `It requires PHP`

**Answer: a) `To include only that plugin instead of the full bundle`**

---

**34. Which Parcel pattern is typical for Bootstrap Sass?**

a) `Install bootstrap, import scss entry in JS, configure autoprefixer if needed`
b) `Email the CSS to Parcel`
c) `Use only CDN without bundler`
d) `Import .exe files`

**Answer: a) `Install bootstrap, import scss entry in JS, configure autoprefixer if needed`**

---

**35. What breaks when upgrading from Popper v1 assumptions to Bootstrap 5?**

a) `API and package name moved to @popperjs/core with different import paths`
b) `Nothing; they are identical packages`
c) `Bootstrap 5 removed Popper entirely`
d) `jQuery bundles Popper`

**Answer: a) `API and package name moved to @popperjs/core with different import paths`**

---

**36. Which Bootstrap 4 class was replaced by spacing utilities for custom gutters?**

a) `no-gutters was replaced by g-0 utilities on rows`
b) `gutter-none still exists unchanged`
c) `Rows cannot remove gutters in Bootstrap 5`
d) `container-no-gutter`

**Answer: a) `no-gutters was replaced by g-0 utilities on rows`**

---

**37. For complex responsive dashboards, why combine `offcanvas` with `navbar-expand-*`?**

a) `Collapsible navigation on small screens without losing navbar structure on large screens`
b) `To disable navigation`
c) `To remove CSS`
d) `To duplicate IDs`

**Answer: a) `Collapsible navigation on small screens without losing navbar structure on large screens`**

---

**38. Which HTML declares dark mode for a subtree only?**

```html
<div data-bs-theme="dark">...</div>
```

a) `Valid: data-bs-theme scopes variables for descendants`
b) `Invalid: theme must be on head only`
c) `Must use class night-mode`
d) `Requires bootstrap-night.js`

**Answer: a) `Valid: data-bs-theme scopes variables for descendants`**

---

**39. Floating labels require which input sizing consideration?**

a) `Placeholder value (even a space) is needed for the label animation in many cases`
b) `Inputs cannot use type="email"`
c) `Labels must be outside the control`
d) `No spacing utilities allowed`

**Answer: a) `Placeholder value (even a space) is needed for the label animation in many cases`**

---

**40. Which Bootstrap helper visually connects a card footer button row?**

a) `card-group with card-footer alignment patterns`
b) `card-deck forced`
c) `table-footer`
d) `accordion only`

**Answer: a) `card-group with card-footer alignment patterns`**

---

**41. When using `dropdown-menu-end`, what problem does it solve?**

a) `Prevents overflow off the viewport on aligned dropdowns`
b) `Removes keyboard support`
c) `Disables Popper`
d) `Forces RTL`

**Answer: a) `Prevents overflow off the viewport on aligned dropdowns`**

---

**42. Which JS call updates a modal’s content before show?**

a) `Query the modal element and replace innerHTML or template, then call show()`
b) `Modal forbids dynamic content`
c) `Use only CSS content property`
d) `window.alert`

**Answer: a) `Query the modal element and replace innerHTML or template, then call show()`**

---

**43. What is a downside of loading `bootstrap.bundle.min.js` from CDN for SPAs?**

a) `Harder to tree-shake and duplicate Popper if another copy loads`
b) `It is always smaller than ESM chunks`
c) `It disables components`
d) `It cannot run in browsers`

**Answer: a) `Harder to tree-shake and duplicate Popper if another copy loads`**

---

**44. Which pattern avoids duplicate plugin instances on the same element?**

a) `Prefer getInstance / getOrCreateInstance instead of new Constructor repeatedly without checks`
b) `Always call new in a setInterval`
c) `Clone the node without removing listeners`
d) `Use inline styles only`

**Answer: a) `Prefer getInstance / getOrCreateInstance instead of new Constructor repeatedly without checks`**

---

**45. In Bootstrap 5, what replaced the `.close` class for dismiss buttons?**

a) `btn-close`
b) `dismiss-button`
c) `icon-x`
d) `close remains unchanged`

**Answer: a) `btn-close`**

---

**46. Which migration item affects form custom controls?**

a) `Custom check/radio/switch classes were consolidated under form-check patterns`
b) `All inputs became type="text"`
c) `Selects were removed`
d) `Validation no longer exists`

**Answer: a) `Custom check/radio/switch classes were consolidated under form-check patterns`**

---

**47. For sidebar + content layouts, why use `min-vh-100` on a flex column?**

a) `Ensures the column stretches to viewport height for sticky footers/sidebars`
b) `Disables scrolling`
c) `Hides mobile`
d) `Breaks modals`

**Answer: a) `Ensures the column stretches to viewport height for sticky footers/sidebars`**

---

**48. Which advanced responsive technique combines `order-*` utilities?**

a) `Reorder columns on breakpoints without changing DOM order for SEO`
b) `Remove responsive breakpoints`
c) `Fix width to 320px`
d) `Disable flex`

**Answer: a) `Reorder columns on breakpoints without changing DOM order for SEO`**

---

**49. Why might `dropdown-menu` with `w-100` be used inside `dropdown`?**

a) `Full-width menu aligned to toggle width (common in navbars)`
b) `To break Popper`
c) `To remove items`
d) `To convert to modal`

**Answer: a) `Full-width menu aligned to toggle width (common in navbars)`**

---

**50. Which statement about Bootstrap and CSP `style-src` is most accurate?**

a) `If you disallow unsafe-inline, avoid inline style attributes Bootstrap might expect from third-party snippets`
b) `Bootstrap always requires unsafe-inline for CSS`
c) `CSP does not apply to styles`
d) `Only images need CSP`

**Answer: a) `If you disallow unsafe-inline, avoid inline style attributes Bootstrap might expect from third-party snippets`**

---
