# Vertical Button Groups — Bootstrap 5.3+

Overview
- Vertical button groups stack related buttons in a column using `.btn-group-vertical`. They are useful for toolbars, sidebars, and compact stacked controls.

Basic usage

```html
<div class="btn-group-vertical" role="group" aria-label="Vertical button group">
  <button type="button" class="btn btn-primary">Top</button>
  <button type="button" class="btn btn-primary">Middle</button>
  <button type="button" class="btn btn-primary">Bottom</button>
</div>
```

Sizing
- Apply `.btn-group-lg` or `.btn-group-sm` to the group container to size all child buttons.

```html
<div class="btn-group-vertical btn-group-sm" role="group">...</div>
```

Toggle inputs
- Use the accessible `.btn-check` + `<label>` pattern for radio/checkbox toggles inside vertical groups.

```html
<div class="btn-group-vertical" role="group" aria-label="Radio toggle vertical">
  <input type="radio" class="btn-check" name="voptions" id="voption1" autocomplete="off" checked>
  <label class="btn btn-outline-primary" for="voption1">Option 1</label>
  <input type="radio" class="btn-check" name="voptions" id="voption2" autocomplete="off">
  <label class="btn btn-outline-primary" for="voption2">Option 2</label>
</div>
```

Split buttons and dropdowns
- Vertical groups support split dropdowns and mixed content; ensure dropdown menus are positioned correctly and accessible.

Accessibility
- Use `role="group"` and `aria-label` to describe the control set.
- Ensure keyboard navigation is logical: Tab reaches the group controls, and arrow keys can be used if you implement roving focus behavior. By default, native buttons are tabbable individually.
- For input-based toggles use native inputs (`.btn-check`) so assistive tech reads state changes.

Spacing and layout
- Use `gap-*` or `my-*` utilities to control spacing between stacked groups or between the group and surrounding content.
- Use grid or `d-grid` with `gap-2` for stacked button layouts where you want full-width controls.

Example — full-width stacked buttons

```html
<div class="d-grid gap-2">
  <button class="btn btn-primary" type="button">Primary action</button>
  <button class="btn btn-secondary" type="button">Secondary action</button>
</div>
```

Styling & theming
- Vertical groups accept the same variants and outline styles as horizontal groups. Customize via Sass variables or CSS variables as needed.

Common pitfalls
- Avoid putting non-interactive elements inside `.btn-group-vertical` if they are intended to be clickable—use proper interactive elements.
- Don’t attempt to make the `<div>` itself interactive; keep semantics on buttons/inputs.

Examples from folder
- `Example.html` shows an outline-style vertical group. This `Container.md` documents accessibility, toggle patterns, sizing, spacing, and alternatives (e.g., `d-grid`) aligned with Bootstrap 5.3 best practices.

References
- Bootstrap docs — Button group: https://getbootstrap.com/docs/5.3/components/button-group/
