# Pill Badges — Bootstrap 5.3+

Overview
- Pill badges use the `.rounded-pill` utility class to create fully rounded (capsule-shaped) badges. They are used for tags, labels, counts, or status indicators where a more modern, pill-like appearance is preferred.

Basic usage

```html
<span class="badge rounded-pill bg-primary">Primary</span>
<span class="badge rounded-pill bg-secondary">Secondary</span>
<span class="badge rounded-pill bg-success">Success</span>
<span class="badge rounded-pill bg-danger">Danger</span>
<span class="badge rounded-pill bg-warning">Warning</span>
<span class="badge rounded-pill bg-info">Info</span>
<span class="badge rounded-pill bg-light text-dark">Light</span>
<span class="badge rounded-pill bg-dark">Dark</span>
```

The `.rounded-pill` class
- Adds `border-radius: 50rem` (or equivalent) to create a fully rounded appearance.
- Works with all badge color utilities (`.bg-*`).
- Can be combined with other utility classes for sizing, spacing, and text styling.

Use cases
- **Tag labels**: highlight topics or categories in lists or articles.
- **Notification badges**: show counts on icons or buttons with a softer visual style.
- **Status pills**: display states (active, inactive, pending) in a rounded form.
- **Filter badges**: removable pills in filter interfaces.

Combining with colors and text

```html
<span class="badge rounded-pill bg-success">✓ Active</span>
<span class="badge rounded-pill bg-warning">⏳ Pending</span>
<span class="badge rounded-pill bg-light text-dark">Tag</span>
```

Sizing & spacing
- Adjust font-size and padding with utilities (`fs-6`, `py-1`, `px-2`, etc.) to fine-tune pill proportions.

```html
<span class="badge rounded-pill bg-primary py-2 px-3">Larger pill</span>
<span class="badge rounded-pill bg-secondary py-1 px-2 fs-6">Smaller pill</span>
```

Pill badges in buttons & headings

```html
<h4>Tags <span class="badge rounded-pill bg-info ms-2">10 items</span></h4>
<button type="button" class="btn btn-outline-primary">
  Filters <span class="badge rounded-pill bg-danger ms-2">3</span>
</button>
```

Accessibility
- Pill badges are visual-only by default. When conveying important state (e.g., "3 pending approvals"), provide descriptive text or `aria-label`:

```html
<span class="badge rounded-pill bg-warning" aria-label="3 pending approvals">3</span>
```

- Test contrast in light and dark themes, especially with `bg-light`.

Removable pills (tags)
- For interactive removable badges, wrap in a button or add JS to handle removal. Ensure keyboard access and `aria` semantics:

```html
<div class="d-inline-block">
  <span class="badge rounded-pill bg-primary me-2">
    Tag <button type="button" class="btn-close btn-close-white ms-1" aria-label="Remove"></button>
  </span>
</div>
```

Dark mode & theming
- Pill badges adapt to light/dark themes using utility backgrounds. For custom colors, ensure sufficient contrast in both modes.

Positioning & animation
- Combine with positioning utilities for badge overlays (e.g., notification counts on icons):

```html
<div class="position-relative d-inline-block">
  <i class="bi bi-person fs-3"></i>
  <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
    99+
  </span>
</div>
```

- Add CSS transitions or animations for interactive badge state changes (e.g., when removing or adding tags).

Best practices
- Use pill badges for modern, friendly UI designs (tags, filters, notification counts).
- Keep pill text short—long text in narrow pills reduces readability.
- Don't rely solely on color; combine with icons or text for clarity.
- Test interactive pills for keyboard and touch accessibility.

Examples from folder
- The provided `Example.html` demonstrates all eight color variants of pill badges; this `Container.md` expands on use cases, sizing, accessibility, positioning, and interactive patterns.

Further reading
- Bootstrap docs — Badges: https://getbootstrap.com/docs/5.3/components/badge/
- Bootstrap utilities — Border Radius: https://getbootstrap.com/docs/5.3/utilities/border-radius/
