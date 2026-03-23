# 11. Dark Mode

## Overview

Tailwind includes a `dark` variant for styling your site in dark mode. By default, it uses the `prefers-color-scheme` CSS media feature.

```html
<div class="bg-white dark:bg-gray-800 rounded-lg px-6 py-8 shadow-xl">
  <h3 class="text-gray-900 dark:text-white text-base font-medium">
    Writes upside-down
  </h3>
  <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm">
    The Zero Gravity Pen can be used to write in any orientation.
  </p>
</div>
```

---

## Method 1: System Preference (Default)

By default, `dark:` utilities are activated based on the user's OS/browser preference:

```css
/* Generated CSS */
@media (prefers-color-scheme: dark) {
  .dark\:bg-gray-800 {
    background-color: var(--color-gray-800);
  }
}
```

No configuration needed — it just works!

---

## Method 2: Manual Toggle with Class

Override the `dark` variant to use a CSS class:

```css
/* app.css */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

Now add the `dark` class to `<html>` to enable dark mode:

```html
<html class="dark">
  <body>
    <div class="bg-white dark:bg-black">
      This uses dark mode
    </div>
  </body>
</html>
```

### JavaScript Toggle

```js
// Toggle dark mode
document.documentElement.classList.toggle('dark');

// Check current mode
const isDark = document.documentElement.classList.contains('dark');
```

---

## Method 3: Using a Data Attribute

```css
/* app.css */
@import "tailwindcss";

@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

```html
<html data-theme="dark">
  <body>
    <div class="bg-white dark:bg-black">
      Dark mode via data attribute
    </div>
  </body>
</html>
```

---

## Three-Way Theme Toggle (Light / Dark / System)

### JavaScript Implementation

```js
// On page load or when changing themes (add inline in <head> to avoid FOUC)
document.documentElement.classList.toggle(
  "dark",
  localStorage.theme === "dark" ||
    (!("theme" in localStorage) && 
     window.matchMedia("(prefers-color-scheme: dark)").matches)
);

// Set light mode
localStorage.theme = "light";

// Set dark mode
localStorage.theme = "dark";

// Respect OS preference
localStorage.removeItem("theme");
```

### Toggle Button Example

```html
<button onclick="toggleTheme()" class="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
  <span class="dark:hidden">🌙</span>
  <span class="hidden dark:inline">☀️</span>
</button>

<script>
function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  document.documentElement.classList.toggle('dark', !isDark);
  localStorage.theme = isDark ? 'light' : 'dark';
}
</script>
```

---

## Color Scheme Utility (v4 New)

Control the browser's default color scheme for scrollbars, form controls, etc.:

```html
<!-- Fix light scrollbars in dark mode -->
<html class="dark scheme-dark">
  <!-- Now scrollbars, inputs, etc. will use dark OS styling -->
</html>

<!-- Or responsive -->
<html class="scheme-light dark:scheme-dark">
  ...
</html>
```

---

## Dark Mode Patterns

### Card Component
```html
<div class="bg-white dark:bg-gray-800 
            border border-gray-200 dark:border-gray-700 
            rounded-xl shadow-sm dark:shadow-gray-900/20 
            p-6">
  <h2 class="text-gray-900 dark:text-white font-semibold">Title</h2>
  <p class="text-gray-600 dark:text-gray-300 mt-2">Description</p>
  <button class="mt-4 bg-blue-600 dark:bg-blue-500 
                  text-white px-4 py-2 rounded-lg">
    Action
  </button>
</div>
```

### Navigation Bar
```html
<nav class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
  <div class="flex items-center justify-between px-6 py-4">
    <span class="text-gray-900 dark:text-white font-bold text-xl">Logo</span>
    <div class="flex gap-6">
      <a class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
        Home
      </a>
      <a class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
        About
      </a>
    </div>
  </div>
</nav>
```

### Form Inputs
```html
<input class="bg-white dark:bg-gray-800 
              border border-gray-300 dark:border-gray-600 
              text-gray-900 dark:text-white 
              placeholder-gray-400 dark:placeholder-gray-500
              rounded-lg px-4 py-2 
              focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
              focus:border-transparent"
       placeholder="Enter your email">
```

### Background Hierarchy
```html
<!-- Three levels of background depth -->
<div class="bg-gray-100 dark:bg-gray-900 min-h-screen">     <!-- Page bg -->
  <div class="bg-white dark:bg-gray-800 rounded-xl p-6">     <!-- Card bg -->
    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">  <!-- Nested bg -->
      Content
    </div>
  </div>
</div>
```

---

## Dark Mode Color Mapping Guide

| Light Mode | Dark Mode | Use Case |
|------------|-----------|----------|
| `bg-white` | `dark:bg-gray-800` or `dark:bg-gray-900` | Card/Surface |
| `bg-gray-50` | `dark:bg-gray-800` | Page background |
| `bg-gray-100` | `dark:bg-gray-900` | Secondary background |
| `text-gray-900` | `dark:text-white` | Primary text |
| `text-gray-700` | `dark:text-gray-200` | Secondary text |
| `text-gray-500` | `dark:text-gray-400` | Muted text |
| `border-gray-200` | `dark:border-gray-700` | Borders |
| `shadow-sm` | `dark:shadow-gray-900/20` | Shadows |

---

## Tips

1. **Avoid pure black** — Use `dark:bg-gray-900` or `dark:bg-gray-950` instead of `dark:bg-black`
2. **Reduce contrast** — Dark mode text should be slightly dimmer (e.g., `dark:text-gray-100` not `dark:text-white`)
3. **Test both modes** — Always check that both light and dark variants look good
4. **Use `color-scheme`** — Add `scheme-dark` to fix browser chrome in dark mode
5. **FOUC prevention** — Put the theme detection script in `<head>` before any CSS loads
