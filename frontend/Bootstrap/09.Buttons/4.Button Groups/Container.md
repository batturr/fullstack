# Button Groups & Toolbars — Bootstrap 5.3+

Overview
- Button groups (`.btn-group`) let you group a series of buttons on a single line. Use button toolbars (`.btn-toolbar`) to combine groups into a single horizontal bar. These patterns keep related controls visually connected and save horizontal space.

Basic group

```html
<div class="btn-group" role="group" aria-label="Basic example">
  <button type="button" class="btn btn-primary">Left</button>
  <button type="button" class="btn btn-primary">Middle</button>
  <button type="button" class="btn btn-primary">Right</button>
</div>
```

Button toolbar

```html
<div class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
  <div class="btn-group me-2" role="group" aria-label="First group">
    <button type="button" class="btn btn-secondary">1</button>
    <button type="button" class="btn btn-secondary">2</button>
    <button type="button" class="btn btn-secondary">3</button>
  </div>
  <div class="btn-group me-2" role="group" aria-label="Second group">
    <button type="button" class="btn btn-secondary">4</button>
    <button type="button" class="btn btn-secondary">5</button>
  </div>
</div>
```

Vertical groups
- Stack buttons vertically with `.btn-group-vertical`.

```html
<div class="btn-group-vertical" role="group" aria-label="Vertical group">
  <button class="btn btn-primary">Top</button>
  <button class="btn btn-primary">Middle</button>
  <button class="btn btn-primary">Bottom</button>
</div>
```

Sizing
- Add `.btn-group-lg` or `.btn-group-sm` to the `.btn-group` container to size all child buttons.

```html
<div class="btn-group btn-group-sm" role="group">...</div>
```

Toggle buttons (checkbox & radio)
- Use `.btn-group` with inputs for accessible toggles. Add `data-bs-toggle="buttons"` on the group and wrap inputs in labels with `.btn` classes for CSS-only toggles. Prefer the JS-powered `data-bs-toggle="button"` on individual buttons for single toggles.

Radio example:

```html
<div class="btn-group" role="group" aria-label="Radio toggle">
  <input type="radio" class="btn-check" name="options" id="option1" autocomplete="off" checked>
  <label class="btn btn-outline-primary" for="option1">Radio 1</label>

  <input type="radio" class="btn-check" name="options" id="option2" autocomplete="off">
  <label class="btn btn-outline-primary" for="option2">Radio 2</label>
</div>
```

Checkbox example:

```html
<div class="btn-group" role="group" aria-label="Checkbox toggle">
  <input type="checkbox" class="btn-check" id="check1" autocomplete="off">
  <label class="btn btn-outline-primary" for="check1">Checkbox</label>
</div>
```

Split buttons & dropdowns
- Combine `.btn-group` with dropdowns for split-button patterns. Use the dropdown markup inside the group and ensure proper `aria-expanded` attributes are present.

```html
<div class="btn-group" role="group">
  <button type="button" class="btn btn-primary">Action</button>
  <button type="button" class="btn btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
    <span class="visually-hidden">Toggle Dropdown</span>
  </button>
  <ul class="dropdown-menu">
    <li><a class="dropdown-item" href="#">Action</a></li>
  </ul>
</div>
```

Accessibility
- Use `role="group"` or `role="toolbar"` and `aria-label` to describe grouped controls.
- For input-based toggles, prefer `.btn-check` + `<label>` pattern — this keeps inputs focusable and accessible to assistive tech.
- Ensure keyboard navigation order is logical; ensure dropdown toggles are reachable via Tab and toggled via Enter/Space.

Responsive behavior
- Button groups naturally wrap; use utility classes (`d-grid`, `gap-2`, `flex-wrap`) to control wrapping or stack groups vertically on smaller screens.

Styling & theming
- Groups inherit button styles; you can use outline variants, sizes, and color mixes. For consistent spacing use `me-2` on groups inside a toolbar.

Common pitfalls
- Don’t attempt to make an actual `<tr>` or non-interactive element clickable — wrap clickable elements in buttons/anchors and use proper roles.
- Avoid applying `disabled` to the `.btn-group` container; disable individual buttons instead.

Examples from folder
- The existing `Example.html` demonstrates a simple `.btn-group` with outline buttons. This `Container.md` expands on group types, toggle patterns, split dropdowns, accessibility, and sizing.

Further reading
- Bootstrap docs — Button group: https://getbootstrap.com/docs/5.3/components/button-group/
