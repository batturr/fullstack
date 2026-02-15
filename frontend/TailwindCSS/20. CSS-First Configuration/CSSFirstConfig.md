# 20. CSS-First Configuration

## Overview

Tailwind CSS v4 is configured entirely in CSS — no more `tailwind.config.js`!

**Before (v3):**
```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        primary: '#3490dc',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
```

**After (v4):**
```css
/* app.css */
@import "tailwindcss";

@theme {
  --color-primary: #3490dc;
}

@plugin "@tailwindcss/typography";
```

---

## @import "tailwindcss"

This single import replaces the old three directives:

```css
/* v3 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v4 — just this: */
@import "tailwindcss";
```

This automatically includes all four layers: `theme`, `base`, `components`, `utilities`.

---

## @theme — Configuration

Replace `theme` and `theme.extend` from the config file:

```css
@import "tailwindcss";

@theme {
  /* Override a default */
  --color-primary: oklch(0.6 0.22 265);
  
  /* Add new values */
  --font-display: "Cal Sans", sans-serif;
  --breakpoint-3xl: 120rem;
  
  /* Extend the spacing scale */
  --spacing-128: 32rem;
  --spacing-144: 36rem;
}
```

### Removing Defaults

```css
@theme {
  /* Remove all default colors */
  --color-*: initial;
  
  /* Then define your own */
  --color-primary: #3b82f6;
  --color-secondary: #6b7280;
  --color-accent: #f59e0b;
}
```

### Theme Inline vs Static

```css
@theme inline {
  /* Variables are inlined at usage, not output as CSS custom properties */
  --color-primary: #3b82f6;
}

@theme static {
  /* Variables are not available as utilities but exist as custom properties */
  --color-surface: #ffffff;
}
```

---

## @source — Content Detection

v4 auto-detects template files in your project. Use `@source` for files outside the default detection:

```css
@import "tailwindcss";

/* Include additional paths */
@source "../node_modules/@my-company/ui-kit/src";
@source "../shared-components/**/*.tsx";
```

### Disabling Auto-Detection

```css
@import "tailwindcss" source(none);

/* Manually specify all sources */
@source "./src/**/*.{html,js,jsx,tsx}";
@source "./pages/**/*.vue";
```

---

## @plugin — Loading Plugins

```css
@import "tailwindcss";

/* Official plugins */
@plugin "@tailwindcss/typography";
@plugin "@tailwindcss/forms";

/* Plugin with options */
@plugin "@tailwindcss/typography" {
  className: "prose";
}

/* Local plugin file */
@plugin "./my-plugin.js";
```

### Writing a Plugin (JS file)

```js
// my-plugin.js
export default function ({ addUtilities, addComponents, theme }) {
  addUtilities({
    '.text-stroke': {
      '-webkit-text-stroke-width': '1px',
      '-webkit-text-stroke-color': theme('colors.black'),
    },
  });
  
  addComponents({
    '.prose-custom': {
      maxWidth: '65ch',
      color: theme('colors.gray.700'),
    },
  });
}
```

---

## @custom-variant — Custom Variants

Define your own variants in CSS:

```css
@import "tailwindcss";

/* Dark mode with class strategy */
@custom-variant dark (&:where(.dark, .dark *));

/* Custom variant for a specific parent state */
@custom-variant sidebar-open (&:where([data-sidebar-open], [data-sidebar-open] *));

/* Custom focus variant */
@custom-variant hocus (&:hover, &:focus);

/* Custom media query variant */
@custom-variant tall (@media (min-height: 800px));

/* print variant */
@custom-variant print (@media print);

/* Reduced motion */
@custom-variant motion-ok (@media (prefers-reduced-motion: no-preference));
```

```html
<div class="sidebar-open:translate-x-0 -translate-x-full transition">
  Sidebar slides in when open
</div>

<a class="hocus:text-blue-600 hocus:underline">
  Blue on both hover AND focus
</a>

<div class="tall:py-12 py-6">
  More padding on tall viewports
</div>
```

---

## @utility — Custom Utilities (v4 New)

Define functional utilities that work with Tailwind's modifier system:

```css
@import "tailwindcss";

@utility tab-* {
  tab-size: --value(--tab-size-*);
}
```

```html
<pre class="tab-4">Uses 4-space tabs</pre>
<pre class="tab-8">Uses 8-space tabs</pre>
```

---

## @variant — Custom Compound Variants

Apply a variant to a block:

```css
@variant dark {
  .hero {
    background: oklch(0.15 0 0);
  }
}

@variant md {
  .sidebar {
    width: 300px;
  }
}
```

---

## Migrating from v3 to v4

### Config → CSS Mapping

| v3 Config | v4 CSS |
|-----------|--------|
| `content: [...]` | Auto-detected or `@source` |
| `theme.colors` | `@theme { --color-*: ... }` |
| `theme.fontFamily` | `@theme { --font-*: ... }` |
| `theme.spacing` | `@theme { --spacing-*: ... }` |
| `theme.extend` | Just add to `@theme` (extends by default) |
| `plugins: [...]` | `@plugin "..."` |
| `darkMode: 'class'` | `@custom-variant dark (...)` |
| `prefix: 'tw-'` | `@import "tailwindcss" prefix(tw)` |

### Automatic Migration Tool

```bash
npx @tailwindcss/upgrade
```

This will:
- Convert `tailwind.config.js` → CSS directives
- Update `@tailwind` directives → `@import "tailwindcss"`
- Update deprecated utility names
- Convert `darkMode: 'class'` → `@custom-variant`

---

## Prefix (v4)

```css
@import "tailwindcss" prefix(tw);
```

```html
<div class="tw:bg-blue-500 tw:text-white tw:p-4">
  All utilities prefixed with tw:
</div>
```

---

## Complete Configuration Example

```css
@import "tailwindcss";

/* Content detection */
@source "../components/**/*.{jsx,tsx}";

/* Plugins */
@plugin "@tailwindcss/typography";
@plugin "@tailwindcss/forms";

/* Dark mode strategy */
@custom-variant dark (&:where(.dark, .dark *));

/* Custom variants */
@custom-variant hocus (&:hover, &:focus);
@custom-variant tall (@media (min-height: 800px));

/* Theme */
@theme {
  /* Colors */
  --color-brand: oklch(0.58 0.22 265);
  --color-brand-light: oklch(0.75 0.15 265);
  --color-brand-dark: oklch(0.40 0.22 265);

  /* Fonts */
  --font-display: "Inter Variable", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Spacing */
  --spacing-112: 28rem;
  --spacing-128: 32rem;

  /* Custom breakpoint */
  --breakpoint-3xl: 120rem;

  /* Custom easing */
  --ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  /* Animation */
  --animate-fade-in: fade-in 0.3s ease-out;
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
}

/* Base styles */
@layer base {
  body {
    @apply font-display bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100;
  }
}

/* Component classes */
@layer components {
  .btn-primary {
    @apply bg-brand text-white px-4 py-2 rounded-lg font-medium
           hover:bg-brand-dark transition ease-spring;
  }
}
```
