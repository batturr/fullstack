# Basic Progress Bars — Bootstrap 5.3+

Overview
- Progress bars display progress of a task (e.g., file uploads, form submission, downloads). Bootstrap provides the `.progress` container and `.progress-bar` element for semantic, accessible progress visualization.

Basic markup

```html
<div class="progress">
  <div class="progress-bar" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100" style="width: 50%;">50%</div>
</div>
```

Structure
- `.progress` — outer container that sets the background and container styles.
- `.progress-bar` — inner bar showing the progress; control width with inline `style="width: X%"` or utility class `.w-*`.
- Use `role="progressbar"` and `aria-valuenow`, `aria-valuemin`, `aria-valuemax` for accessibility.

Sizing & height
- Progress bars use default height (1rem / ~16px). Customize with `height` style or apply height utility classes to the container:

```html
<div class="progress" style="height: 1px;">
  <div class="progress-bar" role="progressbar" style="width: 25%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
</div>

<div class="progress" style="height: 30px;">
  <div class="progress-bar" role="progressbar" style="width: 50%;" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">50%</div>
</div>
```

Showing percentage text
- Include text inside `.progress-bar` to display percentage, label, or count:

```html
<div class="progress-bar" role="progressbar" style="width: 75%;">75%</div>
```

Labels & descriptions
- Use `aria-label` or place descriptive text above or below the progress bar:

```html
<p>File upload progress</p>
<div class="progress">
  <div class="progress-bar" role="progressbar" aria-label="File upload" style="width: 60%;">60%</div>
</div>
```

Accessibility
- Always include `role="progressbar"` and the three ARIA attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`).
- For determinate progress (where you know the final value), use these attributes.
- For indeterminate progress (spinning animations), use `aria-busy="true"` instead.

Colors
- Use `.bg-*` utilities on `.progress-bar` to change bar color: `bg-success`, `bg-info`, `bg-warning`, `bg-danger`. (See next folder for detailed color examples.)

```html
<div class="progress-bar bg-success" role="progressbar" style="width: 25%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">25%</div>
```

Multiple bars (stacked)
- Place multiple `.progress-bar` elements inside a single `.progress` container for stacked/segmented progress:

```html
<div class="progress">
  <div class="progress-bar bg-success" role="progressbar" style="width: 35%;" aria-valuenow="35" aria-valuemin="0" aria-valuemax="100"></div>
  <div class="progress-bar bg-warning" role="progressbar" style="width: 20%;" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100"></div>
  <div class="progress-bar bg-danger" role="progressbar" style="width: 10%;" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"></div>
</div>
```

Animated progress
- Add `.progress-bar-animated` to create a striped, animated effect (if `.progress-bar-striped` is applied):

```html
<div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 50%;" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">50%</div>
```

Dynamic updates
- Update progress programmatically by changing the `style="width: X%"` and `aria-valuenow="X"` attributes in JavaScript.

Best practices
- Always include ARIA attributes for screen readers.
- Use descriptive labels or surrounding text to explain what is being tracked.
- For long operations, pair progress bars with estimated time remaining or status messages.
- Keep progress text/labels concise and clear.

Examples from folder
- The provided `Example.html` shows a basic progress bar with 50% width and centered alignment using `mx-auto`; this `Container.md` expands on structure, sizing, accessibility, colors, stacking, and animations.

Further reading
- Bootstrap docs — Progress: https://getbootstrap.com/docs/5.3/components/progress/
- WAI ARIA Authoring Practices — Progress Bar: https://www.w3.org/WAI/ARIA/apg/patterns/progressbar/
