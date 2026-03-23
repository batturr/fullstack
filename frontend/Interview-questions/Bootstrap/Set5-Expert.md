# Bootstrap MCQ - Set 5 (Expert Level)

**1. Which Sass flag globally toggles rounded corners for many components?**

a) `$enable-rounded`
b) `$border-mode`
c) `$radius-all`
d) `$shape-on`

**Answer: a) `$enable-rounded`**

---

**2. Which map drives the numeric spacing scale for `m-*` and `p-*` utilities?**

a) `$spacers`
b) `$space-map`
c) `$gutters-only`
d) `$margin-list`

**Answer: a) `$spacers`**

---

**3. Which map pairs breakpoint names with min-width values for the grid system?**

a) `$grid-breakpoints`
b) `$container-widths`
c) `$breakpoints-only`
d) `$responsive-steps`

**Answer: a) `$grid-breakpoints`**

---

**4. To add a brand color that participates in theme utilities, you typically extend which map?**

a) `$theme-colors`
b) `$fonts`
c) `$zindex`
d) `$utilities`

**Answer: a) `$theme-colors`**

---

**5. Bootstrap 5’s “Utility API” primarily generates classes from which Sass structure?**

a) `The Sass utilities map ($utilities) and related configuration`
b) `Plain HTML attributes`
c) `PostCSS random rules`
d) `The Popper config object`

**Answer: a) `The $utilities` map and related configuration`**

---

**6. Which source partial defines the default utilities map in Bootstrap’s Sass?**

a) `_utilities.scss`
b) `_accordion.scss`
c) `_modal.scss`
d) `bootstrap-grid.css`

**Answer: a) `_utilities.scss`**

---

**7. What is a maintainable way to add a custom utility (for example a new `cursor` utility variant)?**

a) `Merge or extend the utility definition in Sass before final compilation`
b) `Patch bootstrap.min.css by hand in production`
c) `Avoid utilities entirely`
d) `Only use !important in DevTools`

**Answer: a) `Merge or extend the utility definition in Sass before final compilation`**

---

**8. Which folder in Bootstrap’s source holds component partials like `_modal.scss`?**

a) `The scss folder containing underscore partials`
b) `dist/js/`
c) `icons/svg/`
d) `templates/php/`

**Answer: a) `The scss folder containing underscore partials`**

---

**9. When compiling Bootstrap from Sass, what does `@import "bootstrap"` typically pull in?**

a) `The main bootstrap.scss entry that forwards component partials`
b) `Only JavaScript`
c) `Only the reboot font`
d) `Nothing; it is invalid`

**Answer: a) `The main bootstrap.scss entry that forwards component partials`**

---

**10. What does “tree-shaking” Bootstrap JavaScript usually require?**

a) `ES module imports of individual plugins plus a bundler that drops unused exports`
b) `Loading bootstrap.bundle.min.js always`
c) `Removing all CSS`
d) `Using only jQuery`

**Answer: a) `ES module imports of individual plugins plus a bundler that drops unused exports`**

---

**11. Which import style enables importing only the Modal plugin in modern bundlers?**

a) `import { Modal } from 'bootstrap'`
b) `require('jquery')`
c) `A script tag loading popper.js only`
d) `Import only bootstrap/dist/css/bootstrap.css`

**Answer: a) `import { Modal } from 'bootstrap'`**

---

**12. Which dependency do several Bootstrap JS components rely on for positioning?**

a) `@popperjs/core (Popper)`
b) `lodash`
c) `axios`
d) `react-dom`

**Answer: a) `@popperjs/core (Popper)`**

---

**13. Building a custom dropdown-like overlay “the Bootstrap way” usually means reusing which patterns?**

a) `Popper positioning, focus management, keyboard support, and WAI-ARIA roles`
b) `Only absolute CSS without focus handling`
c) `iframes`
d) `document.write`

**Answer: a) `Popper positioning, focus management, keyboard support, and WAI-ARIA roles`**

---

**14. Bootstrap 5 exposes many design tokens as which modern CSS feature at runtime?**

a) `CSS custom properties (variables) on :root`
b) `ActiveX controls`
c) `Flash variables`
d) `VBScript`

**Answer: a) `CSS custom properties (variables) on :root`**

---

**15. Which mixin supports responsive font sizing using the `rfs` engine?**

a) `The core font-size rules include RFS when enabled via Sass options`
b) `text-size-fixed()`
c) `px-only()`
d) `clamp-manual() only in HTML`

**Answer: a) `The core font-size rules include RFS when enabled via Sass options`**

---

**16. For RTL support, what should the document direction use?**

a) `Set dir="rtl" on the root element (commonly html)`
b) `Use only lang="rtl" without dir`
c) `Rotate the body 180 degrees`
d) `Mirror the page with scaleX(-1) on html`

**Answer: a) `Set dir="rtl" on the root element (commonly html)`**

---

**17. Which Sass option enables logical properties / RTL-oriented styles more comprehensively?**

a) `$enable-rtl when customizing the Sass build`
b) `$enable-jquery`
c) `$enable-php`
d) `$enable-flash`

**Answer: a) `$enable-rtl` when customizing the Sass build`**

---

**18. Deep theming often starts by overriding which variables before importing Bootstrap?**

a) `Override primary, body-bg, body-color, and related theme tokens`
b) `Only z-index values`
c) `Only HTML tags`
d) `Only package.json name`

**Answer: a) `Override primary, body-bg, body-color, and related theme tokens`**

---

**19. Which performance practice reduces unused CSS when using Bootstrap?**

a) `Purge content paths against templates and compile only needed Sass partials`
b) `Import every CDN stylesheet twice`
c) `Disable caching`
d) `Inline the entire min file on every element`

**Answer: a) `Purge content paths against templates and compile only needed Sass partials`**

---

**20. Which attribute helps screen readers understand a modal’s purpose?**

a) `aria-labelledby pointing to a visible title element`
b) `aria-hidden on the title always`
c) `role presentation on the dialog root alone`
d) `tabindex 0 on every paragraph`

**Answer: a) `aria-labelledby pointing to a visible title element`**

---

**21. Why does Bootstrap trap focus inside an open modal?**

a) `To meet expected dialog keyboard behavior and keep tab navigation contained`
b) `To block all keyboard use`
c) `To improve SEO crawlers`
d) `To disable screen readers`

**Answer: a) `To meet expected dialog keyboard behavior and keep tab navigation contained`**

---

**22. Which class visually hides content but keeps it available to assistive tech?**

a) `visually-hidden and the focusable variant when needed`
b) `d-none`
c) `opacity-0 without complementary screen reader text`
d) `hidden`

**Answer: a) `visually-hidden and the focusable variant when needed`**

---

**23. What prefix do Bootstrap 5 data attributes use consistently?**

a) `data-bs-*`
b) `data-toggle-*` only
c) `data-jquery-*`
d) `x-bootstrap-*`

**Answer: a) `data-bs-*`**

---

**24. Which attribute sets the delay before showing a tooltip?**

a) `data-bs-delay, including JSON-style show and hide values`
b) `data-delay-ms without the bs prefix`
c) `title-delay`
d) `wait-tooltip`

**Answer: a) `data-bs-delay, including JSON-style show and hide values`**

---

**25. Which event fires when a modal has finished its show transition?**

a) `shown.bs.modal`
b) `show.bs.modal`
c) `open.bs.modal`
d) `displayed.bs.modal`

**Answer: a) `shown.bs.modal`**

---

**26. Which event is cancelable before a tab is shown?**

a) `show.bs.tab`
b) `shown.bs.tab`
c) `hide.bs.tab`
d) `activate.bs.tab`

**Answer: a) `show.bs.tab`**

---

**27. Which event indicates a toast finished hiding?**

a) `hidden.bs.toast`
b) `hide.bs.toast`
c) `closed.bs.toast`
d) `gone.bs.toast`

**Answer: a) `hidden.bs.toast`**

---

**28. Which Sass function commonly fetches a color from the theme map?**

a) `map-get on $theme-colors (plus related color helpers in source)`
b) `rgb(0,0,0) only`
c) `console.log`
d) `parseInt`

**Answer: a) `map-get on $theme-colors (plus related color helpers in source)`**

---

**29. Which mixin generates responsive variants for utilities across breakpoints?**

a) `Utility API responsive configuration within each utility definition`
b) `@keyframes responsive`
c) `echo`
d) `mysql_query`

**Answer: a) `Utility API responsive configuration within each utility definition`**

---

**30. What does `$enable-shadows` control?**

a) `Whether default box-shadows are emitted for certain components`
b) `JavaScript module format`
c) `Icon sprite path`
d) `Babel presets`

**Answer: a) `Whether default box-shadows are emitted for certain components`**

---

**31. Which variable adjusts container max widths per breakpoint?**

a) `$container-max-widths and related container padding variables`
b) `$modal-z`
c) `$btn-padding-y`
d) `$carousel-interval`

**Answer: a) `$container-max-widths and related container padding variables`**

---

**32. In the Utility API, what does the `state` option enable?**

a) `Pseudo-class variants like hover and focus`
b) `Server-side sessions`
c) `SQL migrations`
d) `Service workers`

**Answer: a) `Pseudo-class variants like hover and focus`**

---

**33. Why compile Bootstrap from source instead of only using the CDN CSS file?**

a) `To trim unused components, customize variables, and control utility generation`
b) `To remove HTML`
c) `To avoid browsers`
d) `To disable accessibility`

**Answer: a) `To trim unused components, customize variables, and control utility generation`**

---

**34. Which practice reduces layout shift when using modals?**

a) `Reserve scrollbar gap handling and avoid duplicate padding hacks; use Bootstrap’s built-in scroll behavior`
b) `Always set body height to 0`
c) `Remove aria attributes`
d) `Use position:fixed on every paragraph`

**Answer: a) `Reserve scrollbar gap handling and avoid duplicate padding hacks; use Bootstrap’s built-in scroll behavior`**

---

**35. Which keyboard key typically closes a modal when keyboard support is enabled?**

a) `Escape`
b) `Enter` always
c) `Space on any element always`
d) `F5`

**Answer: a) `Escape`**

---

**36. What is the purpose of `aria-modal="true"` on a dialog?**

a) `Indicates the window is modal and external content should be inert to AT`
b) `Makes the page printable`
c) `Loads extra fonts`
d) `Disables CSS`

**Answer: a) `Indicates the window is modal and external content should be inert to AT`**

---

**37. Which data attribute sets the placement of a popover?**

a) `data-bs-placement`
b) `data-placement without the bs prefix (legacy style)`
c) `popover-pos`
d) `title-placement`

**Answer: a) `data-bs-placement`**

---

**38. Which Sass mixin centers a fixed-width element horizontally inside a container?**

a) `make-container patterns plus margin auto; utilities expose mx-auto`
b) `float: center`
c) `position: middle`
d) `text-align: justify only`

**Answer: a) `make-container patterns plus margin auto; utilities expose mx-auto`**

---

**39. Which partial is a good entry point to understand variable defaults?**

a) `_variables.scss`
b) `bootstrap.esm.js`
c) `README.pdf`
d) `composer.lock`

**Answer: a) `_variables.scss`**

---

**40. What does `prefers-reduced-motion` media query relate to in Bootstrap?**

a) `Respecting users who want less animation for transitions and carousels`
b) `Disabling HTML`
c) `Forcing dark mode`
d) `Enabling sound effects`

**Answer: a) `Respecting users who want less animation for transitions and carousels`**

---

**41. Which option object property sets a modal backdrop to static via JavaScript?**

a) `{ backdrop: 'static' }`
b) `{ keyboard: false }` only
c) `{ scroll: false }` only
d) `{ fade: 'static' }`

**Answer: a) `{ backdrop: 'static' }`**

---

**42. Which method shows a programmatically controlled toast instance?**

a) `toast.show()`
b) `toast.openHtml()`
c) `Toast.displayNow()`
d) `bootstrap.alert()`

**Answer: a) `toast.show()`**

---

**43. Which attribute initializes a dismiss handler for alerts?**

a) `data-bs-dismiss="alert"`
b) `data-dismiss="alert" (Bootstrap 4 style)`
c) `onclick hide only`
d) `aria-dismiss`

**Answer: a) `data-bs-dismiss="alert"`**

---

**44. For dropdowns, which ARIA role is typical for the menu panel?**

a) `role="menu" with role="menuitem" entries (application menu pattern)`
b) `role="table"`
c) `role="gridcell" on the toggle`
d) `role="banner"`

**Answer: a) `role="menu" with role="menuitem" entries (application menu pattern)`**

---

**45. Which Sass map often stores elevation/z-index layers for components?**

a) `$zindex-* variables and related stacking helpers`
b) `$colors-only`
c) `$font-sizes-only`
d) `$breakpoints-only`

**Answer: a) `$zindex-* variables and related stacking helpers`**

---

**46. What is a key benefit of Bootstrap’s `data-bs-config` JSON on components?**

a) `Declarative option overrides without writing imperative JS`
b) `It replaces HTML`
c) `It removes the need for Popper`
d) `It disables events`

**Answer: a) `Declarative option overrides without writing imperative JS`**

---

**47. Which event fires before a collapse starts to hide?**

a) `hide.bs.collapse`
b) `hidden.bs.collapse`
c) `hiding.bs.collapse`
d) `close.bs.collapse`

**Answer: a) `hide.bs.collapse`**

---

**48. Which event fires after a collapse finished hiding?**

a) `hidden.bs.collapse`
b) `hide.bs.collapse`
c) `collapsed.bs.collapse`
d) `done.bs.collapse`

**Answer: a) `hidden.bs.collapse`**

---

**49. In customized builds, why might you disable certain `$enable-*` flags?**

a) `To reduce CSS size by omitting optional styles like gradients or shadows`
b) `To break layouts intentionally`
c) `To remove HTML parsing`
d) `To force IE6 mode`

**Answer: a) `To reduce CSS size by omitting optional styles like gradients or shadows`**

---

**50. Examine this Sass-style override pattern:**

```scss
$primary: #2c3e50;
@import "bootstrap/scss/bootstrap";
```

What is the main intent?

a) `Compile Bootstrap with a customized primary brand color`
b) `Import JavaScript from Sass`
c) `Disable the grid globally automatically`
d) `Remove all utilities unconditionally`

**Answer: a) `Compile Bootstrap with a customized primary brand color`**

---
