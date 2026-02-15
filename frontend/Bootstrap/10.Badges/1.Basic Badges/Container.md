# Basic Badges — Bootstrap 5.3+

Overview
- Badges are small, inline components used to display counts, labels, or status indicators. The base `.badge` class is used with background utilities like `.bg-primary`, `.bg-success`, etc., to add color and context.

Basic usage

```html
<span class="badge bg-secondary">New</span>
```

The `.badge` class
- Provides base styling: inline-block display, padding, font-size, and border-radius.
- Requires a background utility class (`.bg-*`) to display color; using `.badge` alone has no color.

Common patterns

Badges in headings:

```html
<h1>Heading <span class="badge bg-secondary">New</span></h1>
<h2>Heading <span class="badge bg-secondary">New</span></h2>
<h3>Heading <span class="badge bg-secondary">New</span></h3>
```

Badges in buttons:

```html
<button type="button" class="btn btn-warning">
  Messages <span class="badge bg-danger">4</span>
</button>
```

Available background colors
- Use utilities: `bg-primary`, `bg-secondary`, `bg-success`, `bg-danger`, `bg-warning`, `bg-info`, `bg-light`, `bg-dark`.

Text color pairing
- Light backgrounds (`.bg-light`) pair with `.text-dark` for contrast; dark backgrounds pair with default text (which is white in Bootstrap).

```html
<span class="badge bg-light text-dark">Light</span>
```

Accessibility
- Badges are decorative by default. When they convey important information (e.g., message counts), add descriptive text or use `aria-label`:

```html
<span class="badge bg-danger" aria-label="4 new messages">4</span>
```

- Ensure color contrast meets WCAG; test in light and dark modes.

Sizing & spacing
- Badges inherit font-size from their container. Adjust spacing with margin utilities (`ms-2`, `me-2`) when next to other elements.

```html
<h5>Messages <span class="badge bg-danger ms-2">4</span></h5>
```

Link badges
- Make badges clickable by wrapping in an anchor or applying `.btn` styling:

```html
<a href="#" class="badge bg-primary text-decoration-none">Click me</a>
```

Dark mode & theming
- Badges adapt to light/dark themes when using standard background utilities. For custom colors, override CSS variables or Sass variables as needed.

Best practices
- Use badges for short labels or numeric counts only.
- Don't use color alone to convey meaning; add icons or text labels.
- Keep badges subtle—they are accent elements, not primary content.

Examples from folder
- The provided `Example.html` demonstrates badges in headings and buttons using `.badge` with `bg-*` utilities; this `Container.md` expands on usage patterns, accessibility, and sizing.

Further reading
- Bootstrap docs — Badges: https://getbootstrap.com/docs/5.3/components/badge/
