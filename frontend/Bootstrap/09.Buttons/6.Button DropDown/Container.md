# Button Dropdowns — Bootstrap 5.3+

Overview
- Dropdown buttons provide a toggleable menu attached to a button. Bootstrap’s dropdowns are powered by a small JavaScript component (included in `bootstrap.bundle`) and Popper for positioning.

Basic dropdown button

```html
<div class="dropdown">
  <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
    Dropdown button
  </button>
  <ul class="dropdown-menu">
    <li><a class="dropdown-item" href="#">Action</a></li>
    <li><a class="dropdown-item" href="#">Another action</a></li>
    <li><hr class="dropdown-divider"></li>
    <li><a class="dropdown-item" href="#">Something else here</a></li>
  </ul>
</div>
```

Split button

```html
<div class="btn-group">
  <button type="button" class="btn btn-primary">Primary</button>
  <button type="button" class="btn btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
    <span class="visually-hidden">Toggle Dropdown</span>
  </button>
  <ul class="dropdown-menu">
    <li><a class="dropdown-item" href="#">Action</a></li>
  </ul>
</div>
```

Menu alignment & directions
- Align the menu with `.dropdown-menu-end` to right-align. Use directional classes to change drop direction:
  - `.dropup`, `.dropstart`, `.dropend` wrap the dropdown container.
- Example: `<div class="dropstart">` for a left-opening menu.

Dark menus
- Use `.dropdown-menu-dark` for dark themed dropdown menus.

Keyboard & accessibility
- Use the native `<button>` element with `data-bs-toggle="dropdown"` and `aria-expanded` for state.
- Dropdowns support keyboard navigation: Arrow keys to move, Enter/Space to activate, Esc to close.
- Use `role="menu"` / `role="menuitem"` only when necessary — Bootstrap’s markup using `<ul>` and `<li>` with anchor elements is already accessible; adding explicit roles may be useful for complex menus.

Forms and interactive content
- Dropdowns can contain forms or any interactive content. When placing focusable controls inside dropdowns, ensure focus management and `aria` semantics are correct.

```html
<form class="px-4 py-3">
  <div class="mb-3">
    <label for="dropdownFormEmail" class="form-label">Email address</label>
    <input type="email" class="form-control" id="dropdownFormEmail" placeholder="email@example.com">
  </div>
</form>
```

Dropdown within button groups
- Dropdowns work inside `.btn-group` for split-button patterns and toolbars. Ensure the group keeps `role`/`aria` labels as needed.

Auto-close behavior
- Control auto-close with `data-bs-auto-close` (true|false|inside|outside) or via JS options when creating the Dropdown instance.

Popper options
- Pass Popper offset and boundary options via `data-bs-offset` or through JavaScript to fine-tune positioning.

Example — right aligned, offset:

```html
<div class="dropdown">
  <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" data-bs-offset="10,8" aria-expanded="false">
    Right aligned
  </button>
  <ul class="dropdown-menu dropdown-menu-end">
    <!-- items -->
  </ul>
</div>
```

ARIA live regions & announcements
- Dropdowns do not typically need live-region announcements; they are focus-managed controls. When dynamically injecting items, ensure focus is set appropriately.

Styling & theming
- Customize via Sass variables or CSS variables; `.dropdown-menu` styles can be overridden to match your theme.

Common issues & fixes
- Legacy markup: replace `span.caret` and non-`btn` toggles with Bootstrap 5 syntax: `dropdown-toggle` + `data-bs-toggle="dropdown"` and `btn`/`btn-primary` classes.
- Ensure `bootstrap.bundle.js` is included for Popper and dropdown JS.

Best practices
- Prefer semantic anchors or buttons inside the menu; keep `href` for links and `button` for actions.
- Keep menus concise on mobile — consider converting complex menus to modal or offcanvas in small viewports.
- Add `aria-labelledby` or `aria-label` when menus aren’t clearly described by nearby text.

Examples from folder
- The provided `Example.html` shows a split dropdown pattern but uses an old `span.caret` and lacks `aria` text; this `Container.md` updates to Bootstrap 5.3 best practices and provides accessibility, positioning, and behavior notes.

Further reading
- Bootstrap docs — Dropdowns: https://getbootstrap.com/docs/5.3/components/dropdowns/
- Popper.js docs: https://popper.js.org/
