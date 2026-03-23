# Button Sizes — Bootstrap 5.3+

Overview
- Bootstrap provides size utilities for buttons: `.btn-lg` and `.btn-sm` change padding and font-size. For full-width (block) buttons use layout utilities such as `w-100` or grid utilities instead of the removed `.btn-block` from earlier versions.

Basic usage

```html
<button type="button" class="btn btn-primary btn-lg">Large button</button>
<button type="button" class="btn btn-primary">Default button</button>
<button type="button" class="btn btn-primary btn-sm">Small button</button>
```

Full-width / block buttons
- Use `w-100` to make a button span the container width; combine with responsive utilities to change behavior at breakpoints.

```html
<button class="btn btn-primary w-100">Full width</button>

<!-- responsive: full-width on xs only, normal on md+ -->
<button class="btn btn-primary d-block d-md-inline-block w-100 w-md-auto">Responsive width</button>
```

Notes about legacy `.btn-block`
- `.btn-block` was removed in Bootstrap 5. Use `w-100`, `d-grid gap-2` (for stacked buttons), or grid columns to achieve similar layouts.

Example — stacked full-width buttons with gap:

```html
<div class="d-grid gap-2">
  <button class="btn btn-primary btn-lg" type="button">Primary</button>
  <button class="btn btn-secondary" type="button">Secondary</button>
</div>
```

Toggle and group sizing
- Size classes apply to buttons inside `.btn-group` as well. Use `.btn-group .btn-sm` or add the size class to each button.

Accessibility & touch targets
- Larger buttons are easier for touch; ensure small buttons still meet minimum touch target sizes for tappable elements.
- Avoid cramping interactive controls—if a `btn-sm` contains other interactive elements, ensure they remain keyboard-accessible and tappable.

Combining with other modifiers
- `.btn-lg` / `.btn-sm` work with outline variants, contextual classes, and with spinners/icons inside buttons.

```html
<button class="btn btn-primary btn-sm">
  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
  Loading
</button>
```

Responsive sizing techniques
- There are no built-in responsive size variants for `.btn-*`. Use utility classes (responsive font-size `fs-*`, spacing `px-*`, `py-*`, or wrapper classes) to tune sizes at different breakpoints.

Theming & customization
- Customize button sizes by overriding Sass variables or CSS variables controlling `--bs-btn-padding-*` and `--bs-btn-font-size` in your theme.

Best practices
- Use `.btn-lg` for primary CTAs where emphasis and tappability matter.
- Use `.btn-sm` for compact toolbar actions where space is limited, but test accessibility.
- Prefer layout utilities (`w-100`, `d-grid`) over deprecated helpers for modern, responsive layouts.

Examples from folder
- `Example.html` includes legacy `.btn-block`; update examples to `w-100` or `d-grid` for Bootstrap 5.3.

References
- Buttons docs — https://getbootstrap.com/docs/5.3/components/buttons/
