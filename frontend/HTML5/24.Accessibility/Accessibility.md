# 24. Accessibility (a11y)

## What Is Web Accessibility?

Web accessibility means making websites usable by **everyone**, including people with:
- **Visual** impairments (blind, low vision, color blind)
- **Auditory** impairments (deaf, hard of hearing)
- **Motor** impairments (limited hand use, tremors)
- **Cognitive** impairments (learning disabilities, attention disorders)

---

## WCAG Guidelines

**Web Content Accessibility Guidelines (WCAG)** — 4 principles:

| Principle | Meaning |
|-----------|---------|
| **Perceivable** | Content can be presented in ways users can perceive |
| **Operable** | Interface components are operable by everyone |
| **Understandable** | Content and operation are understandable |
| **Robust** | Content is robust enough for diverse user agents |

### Conformance Levels
- **Level A** — Minimum accessibility
- **Level AA** — Standard target for most websites
- **Level AAA** — Highest level (not always achievable)

---

## Semantic HTML = Foundation of Accessibility

```html
<!-- ❌ Non-accessible -->
<div class="btn" onclick="submit()">Submit</div>

<!-- ✅ Accessible -->
<button type="submit">Submit</button>
```

Using semantic HTML provides **built-in accessibility** — keyboard navigation, screen reader support, and focus management come free.

---

## ARIA (Accessible Rich Internet Applications)

ARIA adds accessibility information when native HTML isn't sufficient.

### ARIA Rules
1. **Don't use ARIA if native HTML works** — `<button>` over `<div role="button">`
2. Don't change native semantics — don't add `role="heading"` to a `<div>` when `<h2>` exists
3. All interactive ARIA controls must be keyboard usable
4. Don't use `role="presentation"` or `aria-hidden="true"` on focusable elements

### ARIA Roles

```html
<!-- Landmark roles (prefer semantic HTML) -->
<div role="banner">        <!-- Same as <header> -->
<div role="navigation">    <!-- Same as <nav> -->
<div role="main">           <!-- Same as <main> -->
<div role="complementary">  <!-- Same as <aside> -->
<div role="contentinfo">    <!-- Same as <footer> -->
<div role="search">         <!-- Same as <search> -->

<!-- Widget roles -->
<div role="button" tabindex="0">Click me</div>
<div role="alert">Error: Invalid email</div>
<div role="dialog" aria-label="Confirm delete">...</div>
<div role="tab">Tab 1</div>
<div role="tabpanel">Panel content</div>
<div role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100">
```

### ARIA Properties

```html
<!-- Labels -->
<input type="text" aria-label="Search">
<input type="text" aria-labelledby="label1">
<div id="label1">Search field</div>

<!-- Description -->
<input type="password" aria-describedby="pwd-help">
<p id="pwd-help">Must be at least 8 characters.</p>

<!-- States -->
<button aria-expanded="false">Menu ▸</button>
<button aria-pressed="true">Bold</button>
<div aria-hidden="true">Decorative content</div>
<input aria-required="true">
<input aria-invalid="true" aria-errormessage="err1">
<span id="err1">Email is invalid.</span>
<div aria-disabled="true">Disabled section</div>

<!-- Live regions -->
<div aria-live="polite">Updated content (announced when convenient)</div>
<div aria-live="assertive">Urgent message (announced immediately)</div>
<div role="status">3 results found</div>
<div role="alert">Error: Form submission failed</div>
```

---

## Keyboard Navigation

All interactive elements must be usable with a keyboard:

| Key | Action |
|-----|--------|
| `Tab` | Move to next focusable element |
| `Shift+Tab` | Move to previous focusable element |
| `Enter` / `Space` | Activate buttons, links |
| `Arrow keys` | Navigate within widgets (tabs, menus, radios) |
| `Escape` | Close modals, menus |

### `tabindex`

```html
<div tabindex="0">Focusable (in normal tab order)</div>
<div tabindex="-1">Programmatically focusable only (not in tab order)</div>

<!-- ❌ Avoid positive tabindex — disrupts natural flow -->
<input tabindex="3">
```

### Skip Navigation

```html
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <header>...</header>
  <nav>...</nav>
  <main id="main-content">
    ...
  </main>
</body>

<style>
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  z-index: 100;
}
.skip-link:focus {
  top: 0;
}
</style>
```

---

## Images

```html
<!-- Informative image -->
<img src="chart.png" alt="Sales increased 25% in Q4 2024">

<!-- Decorative image (skip for screen readers) -->
<img src="decoration.png" alt="">

<!-- Complex image -->
<figure>
  <img src="infographic.png" alt="Company growth infographic" aria-describedby="desc">
  <figcaption id="desc">
    Detailed description of the infographic...
  </figcaption>
</figure>
```

### Alt Text Rules
- **Informative:** Describe the content/function
- **Decorative:** Use `alt=""` (empty, not omitted)
- **Functional** (linked image): Describe the destination
- **Complex:** Use `aria-describedby` for long descriptions
- Never start with "Image of..." — screen readers already say "image"

---

## Forms

```html
<form>
  <!-- Always use labels -->
  <label for="name">Full Name <span aria-hidden="true">*</span></label>
  <input type="text" id="name" name="name" required aria-required="true">
  
  <!-- Error messages -->
  <label for="email">Email</label>
  <input type="email" id="email" aria-invalid="true" aria-describedby="email-error">
  <span id="email-error" role="alert">Please enter a valid email address.</span>
  
  <!-- Group related fields -->
  <fieldset>
    <legend>Shipping Address</legend>
    <label for="street">Street</label>
    <input type="text" id="street">
    <label for="city">City</label>
    <input type="text" id="city">
  </fieldset>
</form>
```

---

## Color & Contrast

- **Minimum contrast ratio:** 4.5:1 for normal text, 3:1 for large text (WCAG AA)
- Don't rely on color alone to convey information
- Provide text labels alongside color indicators

```html
<!-- ❌ Color only -->
<span style="color: red;">●</span> Error

<!-- ✅ Color + text + icon -->
<span style="color: red;" role="img" aria-label="Error">⚠</span> Error: Invalid input
```

---

## Media Accessibility

```html
<!-- Video: captions and descriptions -->
<video controls>
  <source src="video.mp4" type="video/mp4">
  <track kind="captions" src="captions.vtt" srclang="en" label="English" default>
  <track kind="descriptions" src="descriptions.vtt" srclang="en">
</video>

<!-- Audio: provide transcript -->
<audio controls>
  <source src="podcast.mp3" type="audio/mpeg">
</audio>
<details>
  <summary>Read Transcript</summary>
  <p>Full transcript of the podcast episode...</p>
</details>
```

---

## Focus Management

```javascript
// Move focus to an element
document.getElementById('dialog').focus();

// Trap focus inside a modal
const modal = document.getElementById('modal');
const focusableElements = modal.querySelectorAll(
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
);
const first = focusableElements[0];
const last = focusableElements[focusableElements.length - 1];

modal.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  if (e.key === 'Escape') closeModal();
});
```

---

## Testing Checklist

| Test | How |
|------|-----|
| Keyboard navigation | Tab through entire page without a mouse |
| Screen reader | Use VoiceOver (Mac), NVDA/JAWS (Windows) |
| Color contrast | Use browser DevTools or WebAIM Contrast Checker |
| Zoom | Zoom to 200% — is everything still usable? |
| Images | Do all images have appropriate alt text? |
| Forms | Do all inputs have labels? Are errors announced? |
| Headings | Is heading hierarchy logical (h1 → h2 → h3)? |
| Focus visible | Can you see which element is focused? |
| Lighthouse | Run Lighthouse accessibility audit in DevTools |
