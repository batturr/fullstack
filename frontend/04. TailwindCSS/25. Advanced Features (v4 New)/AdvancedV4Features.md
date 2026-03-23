# 25. Advanced Features (v4 New)

## @starting-style — Entry Animations

Animate elements when they first appear (no JavaScript needed!):

```html
<div class="starting:opacity-0 starting:scale-95 
            opacity-100 scale-100 
            transition-all duration-300">
  This fades in and scales up when first rendered
</div>
```

### How It Works

The `starting:` variant maps to CSS `@starting-style`, which defines the **initial state** before the first frame. Combined with `transition`, elements animate from the starting state to their final state.

### Dialog/Modal Entry Animation

```html
<dialog class="starting:opacity-0 starting:scale-95
               open:opacity-100 open:scale-100
               transition-all duration-300 ease-out
               backdrop:bg-black/50 backdrop:starting:opacity-0
               backdrop:transition-opacity backdrop:duration-300
               rounded-xl shadow-2xl p-6 max-w-md">
  <h2 class="text-xl font-bold">Modal Title</h2>
  <p class="mt-2 text-gray-600">Modal content here.</p>
  <button class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg">Close</button>
</dialog>
```

### Popover Entry Animation

```html
<div popover class="starting:opacity-0 starting:translate-y-2
                     opacity-100 translate-y-0
                     transition-all duration-200 ease-out
                     bg-white rounded-xl shadow-xl p-4">
  Popover content
</div>
```

---

## not-* Variant

Negate any variant:

```html
<!-- Not hovered → dim -->
<div class="opacity-100 not-hover:opacity-50 transition">
  Dims when NOT hovered
</div>

<!-- Not first child → add top margin -->
<div class="not-first:mt-4">Spacing except first</div>

<!-- Not last child → add bottom border -->
<div class="not-last:border-b">Border except last</div>

<!-- Negate media features -->
<div class="not-supports-[backdrop-filter]:bg-gray-900 backdrop-blur-lg bg-white/10">
  Fallback for browsers without backdrop-filter
</div>
```

---

## in-* Variant

Style based on parent state without `.group`:

```html
<div class="hover:bg-blue-500 p-6 rounded-lg transition">
  <p class="text-gray-900 in-hover:text-white transition">
    Text turns white when parent is hovered
  </p>
  <span class="text-gray-500 in-hover:text-blue-200 transition">
    Subtitle also changes
  </span>
</div>
```

> No need to add `class="group"` to the parent — `in-*` traverses up automatically!

---

## ** (Descendant) Variant

Style all descendants:

```html
<article class="**:text-gray-700 **:leading-relaxed **:mb-4">
  <p>All paragraphs get these styles</p>
  <p>Without individual classes</p>
  <ul>
    <li>List items too</li>
  </ul>
</article>
```

### Useful for CMS/Markdown Content

```html
<div class="prose **:first:mt-0 **:last:mb-0 
            **:a:text-blue-600 **:a:underline">
  <!-- Rendered markdown content -->
</div>
```

---

## inert Variant

Style elements with the HTML `inert` attribute:

```html
<div class="inert:opacity-30 inert:pointer-events-none inert:select-none" 
     id="form-section">
  <input class="border rounded px-4 py-2">
  <button class="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
</div>

<script>
// Disable the entire section
document.getElementById('form-section').inert = true;
</script>
```

---

## nth-* Variants

Target specific children by position:

```html
<ul>
  <li class="nth-1:font-bold">First item (bold)</li>
  <li class="nth-2:text-blue-500">Second item (blue)</li>
  <li class="nth-3:bg-gray-100">Third item (gray bg)</li>
</ul>

<!-- Every 3rd child -->
<div class="nth-[3n]:bg-gray-50">...</div>

<!-- From the end -->
<div class="nth-last-1:font-bold">Last item</div>
<div class="nth-last-2:italic">Second to last</div>
```

---

## field-sizing Variant

Auto-resize textareas and inputs:

```html
<textarea class="field-sizing-content border rounded-lg p-3 w-full"
          placeholder="Start typing...">
</textarea>
```

The textarea automatically grows/shrinks to fit its content — no JavaScript needed!

---

## color-scheme Utility

Tell the browser which color scheme the page uses:

```html
<html class="scheme-light dark:scheme-dark">
  <!-- Browser UI (scrollbars, inputs) matches the scheme -->
</html>

<!-- Force dark scheme on a specific element -->
<div class="scheme-dark">
  <input type="text"> <!-- Dark-themed native input -->
</div>

<!-- Let the OS decide -->
<html class="scheme-light-dark">
  ...
</html>
```

---

## Anchor Positioning (Experimental)

Position elements relative to an "anchor" (CSS Anchor Positioning):

```html
<button id="trigger" class="anchor-[--menu]">
  Open Menu
</button>

<div class="fixed top-[anchor(--menu_bottom)] left-[anchor(--menu_left)]
            bg-white shadow-xl rounded-lg p-4">
  Menu positioned relative to button
</div>
```

> **Note:** Anchor Positioning is still a CSS draft; browser support is growing.

---

## Dynamic Utility Values (v4)

Many utilities now accept arbitrary numeric values without brackets:

```html
<!-- v3: Only predefined values or arbitrary -->
<div class="grid-cols-[15]">...</div>

<!-- v4: Dynamic values work directly -->
<div class="grid-cols-15">15-column grid</div>
<div class="z-999">z-index: 999</div>
<div class="opacity-67">opacity: 0.67</div>
```

---

## @property Support

Tailwind v4 generates `@property` declarations for theme variables, enabling transitions on CSS custom properties:

```css
/* Tailwind v4 automatically generates: */
@property --color-primary {
  syntax: "<color>";
  inherits: false;
  initial-value: oklch(0.58 0.22 265);
}
```

This means custom properties can be **animated**:

```css
.animate-color {
  transition: --color-primary 0.3s ease;
}
```

---

## Comparison: New v4-Only Features Summary

| Feature | What It Does |
|---------|-------------|
| `starting:` | Entry animations (CSS @starting-style) |
| `not-*:` | Negate any variant |
| `in-*:` | Group-like without `.group` class |
| `**:` | Style all descendants |
| `inert:` | Style inert elements |
| `nth-*:` | Target nth children |
| `field-sizing-content` | Auto-resize inputs/textareas |
| `scheme-*` | Browser color scheme |
| `text-shadow-*` | Native text shadows |
| `inset-shadow-*` | Inset box shadows |
| `inset-ring` | Inset ring utility |
| `rotate-x/y` | 3D rotation |
| `perspective-*` | CSS perspective |
| `bg-radial` | Radial gradients |
| `bg-conic` | Conic gradients |
| `bg-linear-*` | Angle-based linear gradients |
| `@container` | Container queries (in core) |
| `transition-discrete` | Discrete property transitions |
