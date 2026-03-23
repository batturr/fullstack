# Responsive Tables (Bootstrap 5.3+)

Overview
- Responsive tables enable horizontal scrolling for wide tables on smaller viewports. Bootstrap provides a set of responsive wrappers that add an overflow container around the `<table>` so content doesn't break layout.

Wrappers
- `.table-responsive` — always create a horizontally scrollable container.
- Breakpoint variants: `.table-responsive-sm`, `.table-responsive-md`, `.table-responsive-lg`, `.table-responsive-xl`, `.table-responsive-xxl`. These make the table scrollable below the given breakpoint.

Basic usage

```html
<div class="table-responsive">
  <table class="table">
    <!-- thead, tbody -->
  </table>
</div>
```

Breakpoint example

```html
<!-- table becomes horizontally scrollable below `md` -->
<div class="table-responsive-md">
  <table class="table">...</table>
</div>
```

Accessibility considerations
- Make the scroll container accessible:
  - Give the wrapper a focusable region with `tabindex="0"` when horizontal scrolling is important for keyboard users, or use `role="region"` and `aria-label`/`aria-labelledby` to describe the scrollable area.

```html
<div class="table-responsive" role="region" aria-label="User data table" tabindex="0">
  <table class="table">...</table>
</div>
```

- Keep semantic table markup (`<caption>`, `<thead>`, `<tbody>`) and `scope` attributes on header cells.
- Avoid hiding columns purely by horizontal scroll for essential information—consider reflow patterns or alternate presentation on small screens.

Alternatives to horizontal scrolling
- Reflow to stacked key/value lists or cards for narrow screens.
- Toggle columns with JavaScript, or show summaries with expandable rows.
- Use the `data-label` technique with CSS to show header labels for each cell on narrow screens.

Sticky headers inside scroll container
- To keep `<thead>` visible while scrolling horizontally, use `position: sticky; top: 0;` on `th` elements and ensure the `th` background is set so underlying content doesn't show through.

```css
.table-responsive thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--bs-table-bg, #fff);
}
```

Note: sticky headers may require extra z-index and background handling when used with multiple stacked scroll containers.

Performance & large datasets
- Scrolling containers are CSS-only and cheap; main performance concerns are DOM size and repaint cost when updating many rows. For very large datasets, prefer server-side paging, virtualization, or incremental rendering.

Visual affordances
- Provide visual cues when a table is horizontally scrollable (e.g., subtle fade gradients at the edges, scrollbar hints, or arrows) so users notice overflow.
- Ensure any fade overlays don't obscure content or reduce readability.

Examples from folder
- The included `Example.html` demonstrates `.table-responsive` wrapping a wide table; this `Container.md` expands on breakpoint wrappers, accessibility, sticky headers, alternatives to scrolling, and best practices.

Further reading
- Bootstrap docs — Tables: https://getbootstrap.com/docs/5.3/content/tables/
- WAI ARIA authoring: https://www.w3.org/WAI/ARIA/apg/ (for regions and labels)
