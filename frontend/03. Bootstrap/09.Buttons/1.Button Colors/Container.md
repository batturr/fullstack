# Button Colors — Bootstrap 5.3+

Overview
- Bootstrap buttons are created with the base `.btn` class and color variants such as `.btn-primary`, `.btn-secondary`, `.btn-success`, etc. These variants provide consistent background, border, and text colors that map to your theme’s color palette.

CDN example
- CSS:

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
```

Basic usage

```html
<button type="button" class="btn btn-primary">Primary</button>
<button type="button" class="btn btn-secondary">Secondary</button>
<button type="button" class="btn btn-success">Success</button>
<button type="button" class="btn btn-danger">Danger</button>
<button type="button" class="btn btn-warning">Warning</button>
<button type="button" class="btn btn-info">Info</button>
<button type="button" class="btn btn-light">Light</button>
<button type="button" class="btn btn-dark">Dark</button>
<button type="button" class="btn btn-link">Link</button>
```

Outline buttons
- Use `.btn-outline-*` for ghost-style buttons that use borders and transparent backgrounds.

```html
<button class="btn btn-outline-primary">Outline</button>
```

Button states
- Add `.active` to visually mark active buttons and use `disabled` attribute to disable. Use `aria-pressed="true"` for toggle buttons.

```html
<button class="btn btn-primary active" aria-pressed="true">Active</button>
<button class="btn btn-secondary" disabled>Disabled</button>
```

Sizes
- `.btn-lg`, `.btn-sm` adjust button padding and font-size.
- For full-width buttons use utilities like `w-100` (there is no `.btn-block` in Bootstrap 5).

Toggles & radios
- Turn a button into an accessible toggle using `data-bs-toggle="button"` or use the input-based button groups for checkbox/radio toggles.

```html
<button type="button" class="btn btn-primary" data-bs-toggle="button" aria-pressed="false">Toggle</button>
```

Links and buttons
- Anchor elements can be styled as buttons by adding `.btn` and the variant classes. Ensure `role="button"` when needed and include `href`.

Accessibility
- Prefer `<button>` for actions; use `<a>` for navigation.
- Provide `type="button"` on buttons that are not form submissions to avoid accidental form submission.
- Ensure color contrast meets WCAG; pair dark backgrounds with `text-white` when necessary.

Icons & loading
- Combine with icon libraries. For loading states use disabled button plus a spinner `.spinner-border` or `.spinner-grow` inside the button.

```html
<button class="btn btn-primary" disabled>
  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
  Loading...
</button>
```

Button groups
- Use `.btn-group` and `.btn-toolbar` to group buttons; variants apply per-button inside groups.

Theming & customization
- Bootstrap exposes Sass variables and CSS variables for buttons (e.g., `--bs-btn-bg`, `--bs-btn-color`, `--bs-btn-border-color`). Customize via Sass maps or override variables to adapt variants to your design system.

Dark mode
- Test variants in dark contexts; you may need to swap to `.btn-outline-*` or adjust variables for better contrast.

Best practices
- Use semantic element types and `type="button"` where appropriate.
- Don’t rely on color alone to convey meaning—combine with iconography or textual labels.
- Prefer utility classes (`me-2`, `w-100`, `d-block`) to control spacing and layout.

Examples from folder
- `Example.html` shows the basic variants. This `Container.md` expands with modern Bootstrap 5.3 guidance (toggles, outlines, accessibility, theming).

References
- Buttons docs — https://getbootstrap.com/docs/5.3/components/buttons/
