# Outline Buttons — Bootstrap 5.3+

Overview
- Outline buttons use the `.btn-outline-*` variants to render a bordered (ghost) button that inherits background transparency while keeping the colored border and text. They are useful when you want a lighter visual weight than solid buttons.

Basic usage

```html
<button type="button" class="btn btn-outline-primary">Primary</button>
<button type="button" class="btn btn-outline-secondary">Secondary</button>
```

Available variants
- `.btn-outline-primary`, `.btn-outline-secondary`, `.btn-outline-success`, `.btn-outline-danger`, `.btn-outline-warning`, `.btn-outline-info`, `.btn-outline-light`, `.btn-outline-dark`.

Combining with sizes
- Use `.btn-lg` and `.btn-sm` with outline variants as you would with filled variants.

```html
<button class="btn btn-outline-primary btn-lg">Large Outline</button>
<button class="btn btn-outline-primary btn-sm">Small Outline</button>
```

Disabled and active states
- `disabled` attribute works on `<button>`; use `.disabled` on anchor elements. The `.active` class visually indicates an active state.

Toggles & accessibility
- Use `data-bs-toggle="button"` for toggle behavior and `aria-pressed` to indicate state to assistive tech.

```html
<button class="btn btn-outline-primary" data-bs-toggle="button" aria-pressed="false">Toggle</button>
```

Contrast and dark backgrounds
- Outline buttons on dark backgrounds can be hard to read if the border color is low contrast. For dark backgrounds prefer `.btn-outline-light` or add `text-white` to ensure legibility. Alternatively use `btn-outline-*` with a solid background utility for emphasis.

```html
<button class="btn btn-outline-light">On dark</button>
```

Focus and hover states
- Outline variants include hover and focus styles in Bootstrap. Ensure focus outlines are not removed — keep visible focus styles for keyboard users. You may customize `:hover` / `:focus` rules, but preserve accessible focus.

Icons and loading states
- Icons and spinners work the same with outline buttons as with filled buttons.

Theming & customization
- Customize outline colors by overriding Sass variables or CSS variables. Bootstrap exposes color tokens and supports Sass maps for variant customization.

Usage patterns
- Use outlines for secondary actions, ghosty UI, or where a subtle call-to-action is required.
- Avoid using outline buttons as the primary action when you need strong visual emphasis.

Examples from folder
- The included `Example.html` shows a set of outline button variants; this `Container.md` expands on sizes, accessibility, dark-mode considerations, toggles, and theming.

Further reading
- Buttons docs — https://getbootstrap.com/docs/5.3/components/buttons/
