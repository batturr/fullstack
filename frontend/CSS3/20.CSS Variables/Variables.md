# 20. CSS Variables (Custom Properties)

## What Are CSS Variables?

CSS Custom Properties (commonly called CSS Variables) let you define reusable values that can be referenced throughout your stylesheets.

```css
/* Define variables with -- prefix */
:root {
  --primary-color: #3b82f6;
  --font-size-base: 1rem;
  --spacing-md: 1rem;
  --border-radius: 8px;
}

/* Use variables with var() */
.button {
  background: var(--primary-color);
  font-size: var(--font-size-base);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
}
```

---

## Syntax

```css
/* Declaration */
--property-name: value;

/* Usage */
property: var(--property-name);

/* With fallback */
property: var(--property-name, fallback-value);

/* Nested fallback */
property: var(--color, var(--fallback-color, blue));
```

---

## Scope & Inheritance

CSS variables follow the **cascade** and **inheritance** — they're scoped to the element they're declared on and inherited by all descendants.

### Global Scope

```css
:root {
  --color-primary: #3b82f6;  /* Available everywhere */
}
```

### Local Scope

```css
.card {
  --card-padding: 1.5rem;    /* Only available inside .card and descendants */
  padding: var(--card-padding);
}

.badge {
  padding: var(--card-padding);  /* ❌ Won't work — different scope */
}
```

### Overriding Variables

```css
:root {
  --bg: white;
  --text: #333;
}

.dark-section {
  --bg: #1a1a1a;
  --text: #eee;
}

.card {
  background: var(--bg);       /* Inherits from nearest ancestor that sets --bg */
  color: var(--text);
}
```

---

## Theming with CSS Variables

### Light / Dark Mode

```css
:root {
  /* Light theme (default) */
  --bg-primary: #ffffff;
  --bg-secondary: #f3f4f6;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border: #e5e7eb;
  --accent: #3b82f6;
}

[data-theme="dark"] {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --border: #374151;
  --accent: #60a5fa;
}

/* Or with media query */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #111827;
    --text-primary: #f9fafb;
    /* ... */
  }
}
```

```css
/* Usage — works for both themes automatically */
body {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
}
```

### Multiple Theme Colors

```css
:root {
  --brand-hue: 220;
  --brand: hsl(var(--brand-hue), 80%, 50%);
  --brand-light: hsl(var(--brand-hue), 80%, 90%);
  --brand-dark: hsl(var(--brand-hue), 80%, 30%);
}

/* Change entire color scheme by changing one variable */
.theme-red { --brand-hue: 0; }
.theme-green { --brand-hue: 140; }
.theme-purple { --brand-hue: 280; }
```

---

## Design Token System

```css
:root {
  /* Colors */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;

  --color-blue-500: #3b82f6;
  --color-blue-600: #2563eb;
  --color-red-500: #ef4444;
  --color-green-500: #22c55e;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* Typography */
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-mono: "Fira Code", monospace;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}
```

---

## Dynamic Variables with JavaScript

```javascript
// Set a variable
document.documentElement.style.setProperty('--primary-color', '#ff6b6b');

// Read a computed variable
const value = getComputedStyle(document.documentElement)
  .getPropertyValue('--primary-color');

// Set on specific element
element.style.setProperty('--progress', '75%');

// Remove a variable
element.style.removeProperty('--primary-color');
```

### Dynamic Progress Bar

```css
.progress-bar {
  --progress: 0%;
  width: var(--progress);
  height: 8px;
  background: var(--accent);
  border-radius: 4px;
  transition: width 0.3s ease;
}
```

```html
<div class="progress-bar" style="--progress: 75%;"></div>
```

### Mouse-Tracking Gradient

```css
.card {
  --mouse-x: 50%;
  --mouse-y: 50%;
  background: radial-gradient(
    circle at var(--mouse-x) var(--mouse-y),
    rgba(59, 130, 246, 0.15),
    transparent 60%
  );
}
```

```javascript
card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  card.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
  card.style.setProperty('--mouse-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
});
```

---

## Advanced Techniques

### Variables in calc()

```css
:root {
  --header-height: 64px;
  --footer-height: 80px;
}

.content {
  min-height: calc(100vh - var(--header-height) - var(--footer-height));
}
```

### Variables in Media Queries

CSS variables **cannot** be used in media query conditions:

```css
/* ❌ Does NOT work */
@media (min-width: var(--breakpoint-md)) { }

/* ✅ Use @custom-media (future spec) or preprocessors */
```

### Animating CSS Variables

```css
/* Register a custom property for animation */
@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

.spinner {
  --angle: 0deg;
  transform: rotate(var(--angle));
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { --angle: 360deg; }
}
```

---

## Variables vs Preprocessors (Sass)

| Feature | CSS Variables | Sass Variables |
|---------|--------------|----------------|
| Runtime | ✅ Yes (live) | ❌ No (compiled) |
| Cascading | ✅ Yes | ❌ No |
| Inheritance | ✅ Yes | ❌ No |
| JS access | ✅ Yes | ❌ No |
| Media queries | ❌ No | ❌ No |
| Complex math | Limited | ✅ Yes |
| Maps/lists | ❌ No | ✅ Yes |
| Browser support | All modern | Compile-time |

> **Best Practice:** Use CSS variables for theming and runtime values. Use preprocessors for build-time utilities and complex logic.
