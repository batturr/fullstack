# Alerts (Bootstrap 5.3+)

Overview
- Alerts provide contextual feedback messages for user actions. They are simple, flexible, and can be made dismissible. Bootstrap 5.3 uses utility classes and a small JavaScript component for dismissible behavior.

Basic markup

```html
<div class="alert alert-primary" role="alert">
  A simple primary alert—check it out!
</div>
```

Contextual types
- `.alert-primary`, `.alert-secondary`, `.alert-success`, `.alert-danger`, `.alert-warning`, `.alert-info`, `.alert-light`, `.alert-dark`.

Dismissible alerts
- Add a close button and the `.alert-dismissible` class. Use the `button` with `data-bs-dismiss="alert"` and `aria-label` for accessibility. Bootstrap’s JS removes the element after the dismiss transition.

```html
<div class="alert alert-warning alert-dismissible fade show" role="alert">
  <strong>Heads up!</strong> This alert needs your attention.
  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
</div>
```

Notes on markup in older examples
- The existing examples in this folder use legacy markup (`button.close` and `data-dismiss="alert"`). Update to Bootstrap 5+ syntax: `btn-close` and `data-bs-dismiss="alert"`.

Accessibility
- Always include `role="alert"` for live regions if you want immediate announcement to screen readers.
- For non-urgent messages, consider `role="status"` instead of `role="alert"` to avoid interrupting assistive technologies.
- Use `aria-live` and `aria-atomic` when dynamically inserting alerts via JavaScript.

Animation and transitions
- Use `.fade` + `.show` to enable CSS transitions. Dismissible alerts will automatically animate when removed.

Auto-dismissing alerts
- Bootstrap doesn’t include auto-hide for alerts by default. Implement with a small script if desired:

```js
setTimeout(() => {
  const alertEl = document.querySelector('.alert-auto-dismiss');
  if (alertEl) {
    const alert = bootstrap.Alert.getOrCreateInstance(alertEl);
    alert.close();
  }
}, 5000);
```

ARIA example for dynamic alerts

```html
<div id="alerts" aria-live="polite" aria-atomic="true"></div>
```

When injecting alerts via JS, append them into a live region (`#alerts`) so screen readers announce changes.

Links in alerts
- Use `.alert-link` to style links inside alerts to match the alert context.

```html
<div class="alert alert-primary" role="alert">
  A simple primary alert with <a href="#" class="alert-link">an example link</a>.
</div>
```

Stacking & layout
- Alerts are block-level elements. For stacked alerts, place them inside a container (e.g., `.container`, `.container-fluid`) or use utility spacing classes (`mb-3`) between them.

Customizing colors & dark mode
- Bootstrap 5.3 uses CSS variables — override theme tokens or use Sass maps to customize alert colors. For dark mode, ensure alert text contrast is sufficient; consider swapping to `alert-dark` variants or adjusting variables.

Differences vs Toasts
- Alerts are inline and part of the document flow; toasts are overlay notifications positioned with JS and ARIA roles for live regions. Use toasts for non-blocking notifications that can stack and appear in corners.

Common pitfalls & fixes
- Legacy attributes: replace `data-dismiss` with `data-bs-dismiss` and `button.close` with `button.btn-close`.
- Ensure Bootstrap JS bundle is included for dismiss behavior (`bootstrap.bundle.min.js`).

Examples from folder
- The folder examples show multiple alert types but use older dismiss markup. This `Container.md` preserves the examples and recommends updating dismiss markup to Bootstrap 5.3+.

Further reading
- Bootstrap docs — Alerts: https://getbootstrap.com/docs/5.3/components/alerts/
- WAI ARIA Authoring Practices — Live Regions: https://www.w3.org/WAI/ARIA/apg/patterns/liveregion/
