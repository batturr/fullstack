# 04. Theme Variables & @theme Directive

## Overview

In Tailwind CSS v4, design tokens are managed through **theme variables** — special CSS variables defined using the `@theme` directive. This is the biggest paradigm shift from v3.

> **v3:** Configure in `tailwind.config.js` (JavaScript)  
> **v4:** Configure in CSS with `@theme` (CSS-first)

---

## What Are Theme Variables?

Theme variables are CSS custom properties defined using `@theme` that tell Tailwind which utility classes to generate.

```css
/* app.css */
@import "tailwindcss";

@theme {
  --color-mint-500: oklch(0.72 0.11 178);
}
```

This creates:
- Utility classes: `bg-mint-500`, `text-mint-500`, `border-mint-500`, `fill-mint-500`, etc.
- CSS variable: `var(--color-mint-500)` available everywhere

```html
<!-- Now available as a utility -->
<div class="bg-mint-500">Mint background</div>

<!-- Also usable as CSS variable -->
<div style="background-color: var(--color-mint-500)">Also mint</div>
```

---

## Why `@theme` Instead of `:root`?

| `@theme` | `:root` |
|----------|---------|
| Creates utility classes + CSS variables | Only creates CSS variables |
| Must be top-level (not nested) | Can be nested anywhere |
| Instructs Tailwind's engine | Tailwind doesn't know about it |
| For design tokens → utilities | For regular CSS variables |

```css
/* Use @theme for design tokens that map to utilities */
@theme {
  --color-brand: #0fa9e6;
}

/* Use :root for regular CSS variables */
:root {
  --sidebar-width: 280px;
}
```

---

## Theme Variable Namespaces

Each namespace maps to specific utility classes:

| Namespace | Utility Classes Generated |
|-----------|-------------------------|
| `--color-*` | `bg-*`, `text-*`, `border-*`, `fill-*`, `stroke-*`, etc. |
| `--font-*` | `font-sans`, `font-serif`, `font-mono`, etc. |
| `--text-*` | `text-xs`, `text-sm`, `text-base`, `text-xl`, etc. |
| `--font-weight-*` | `font-thin`, `font-bold`, `font-black`, etc. |
| `--tracking-*` | `tracking-tight`, `tracking-wide`, `tracking-wider`, etc. |
| `--leading-*` | `leading-tight`, `leading-relaxed`, `leading-loose`, etc. |
| `--breakpoint-*` | `sm:*`, `md:*`, `lg:*`, `xl:*` (variants) |
| `--container-*` | `@sm:*`, `@md:*` (container query variants) |
| `--spacing-*` | `px-*`, `mt-*`, `w-*`, `h-*`, `gap-*`, etc. |
| `--radius-*` | `rounded-sm`, `rounded-md`, `rounded-lg`, etc. |
| `--shadow-*` | `shadow-sm`, `shadow-md`, `shadow-xl`, etc. |
| `--inset-shadow-*` | `inset-shadow-xs`, `inset-shadow-sm`, etc. |
| `--drop-shadow-*` | `drop-shadow-md`, `drop-shadow-lg`, etc. |
| `--blur-*` | `blur-sm`, `blur-md`, `blur-lg`, etc. |
| `--perspective-*` | `perspective-near`, `perspective-distant`, etc. |
| `--aspect-*` | `aspect-video`, `aspect-square`, etc. |
| `--ease-*` | `ease-in`, `ease-out`, `ease-in-out`, etc. |
| `--animate-*` | `animate-spin`, `animate-ping`, etc. |

---

## Extending the Default Theme

Add new values without removing defaults:

```css
@import "tailwindcss";

@theme {
  /* Add a new font family */
  --font-script: Great Vibes, cursive;
  
  /* Add a new color */
  --color-brand: #0fa9e6;
  
  /* Add a new breakpoint */
  --breakpoint-3xl: 120rem;
  
  /* Add a custom shadow */
  --shadow-brutal: 4px 4px 0px 0px rgb(0 0 0);
}
```

```html
<h1 class="font-script">Cursive heading</h1>
<div class="bg-brand">Brand color</div>
<div class="3xl:grid-cols-6">Only on 3xl screens</div>
<div class="shadow-brutal">Brutalist shadow</div>
```

---

## Overriding Default Values

Redefine an existing theme variable to change its value:

```css
@import "tailwindcss";

@theme {
  /* Change sm breakpoint from 40rem to 30rem */
  --breakpoint-sm: 30rem;
}
```

### Override an Entire Namespace

Use `initial` with the wildcard `*` to clear all defaults in a namespace:

```css
@import "tailwindcss";

@theme {
  /* Remove ALL default colors */
  --color-*: initial;
  
  /* Define only your custom colors */
  --color-white: #fff;
  --color-black: #000;
  --color-primary: #3f3cbb;
  --color-midnight: #121063;
  --color-tahiti: #3ab7bf;
  --color-bermuda: #78dcca;
}
```

Now only `bg-primary`, `text-midnight`, `bg-tahiti`, `bg-bermuda`, `text-white`, `text-black` exist (no `bg-red-500`, etc.).

---

## Using a Completely Custom Theme

Clear everything and start from scratch:

```css
@import "tailwindcss";

@theme {
  --*: initial;
  
  --spacing: 4px;
  --font-body: Inter, sans-serif;
  --color-lagoon: oklch(0.72 0.11 221.19);
  --color-coral: oklch(0.74 0.17 40.24);
  --color-driftwood: oklch(0.79 0.06 74.59);
  --color-tide: oklch(0.49 0.08 205.88);
  --color-dusk: oklch(0.82 0.15 72.09);
}
```

---

## Defining Animation Keyframes in @theme

```css
@import "tailwindcss";

@theme {
  --animate-fade-in-scale: fade-in-scale 0.3s ease-out;
  
  @keyframes fade-in-scale {
    0% {
      opacity: 0;
      transform: scale(0.95);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
}
```

```html
<div class="animate-fade-in-scale">Animated element</div>
```

---

## Referencing Other Variables (inline option)

When a theme variable references another variable, use the `inline` option:

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-inter);
}
```

The `inline` option ensures the utility class uses the variable value directly, avoiding CSS variable resolution issues.

---

## Static Theme (Generate All Variables)

By default, only used CSS variables are generated. Force all to be generated:

```css
@import "tailwindcss";

@theme static {
  --color-primary: var(--color-red-500);
  --color-secondary: var(--color-blue-500);
}
```

---

## Using Theme Variables

### In Custom CSS
```css
@import "tailwindcss";

@layer components {
  .typography {
    p {
      font-size: var(--text-base);
      color: var(--color-gray-700);
    }
    h1 {
      font-size: var(--text-2xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-gray-950);
    }
  }
}
```

### In Arbitrary Values
```html
<div class="rounded-[calc(var(--radius-xl)-1px)]">
  Concentric border radius
</div>
```

### In JavaScript
```js
// Using CSS variables directly
<motion.div animate={{ backgroundColor: "var(--color-blue-500)" }} />

// Getting resolved values
let styles = getComputedStyle(document.documentElement);
let shadow = styles.getPropertyValue("--shadow-xl");
```

---

## Sharing Theme Across Projects

Create a shared theme CSS file:

```css
/* packages/brand/theme.css */
@theme {
  --*: initial;
  --spacing: 4px;
  --font-body: Inter, sans-serif;
  --color-lagoon: oklch(0.72 0.11 221.19);
  --color-coral: oklch(0.74 0.17 40.24);
}
```

Import in any project:

```css
/* packages/admin/app.css */
@import "tailwindcss";
@import "../brand/theme.css";
```

---

## Default Theme Variable Reference (Excerpt)

```css
@theme {
  /* Fonts */
  --font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji"...;
  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas...;
  
  /* Spacing base unit */
  --spacing: 0.25rem;
  
  /* Breakpoints */
  --breakpoint-sm: 40rem;
  --breakpoint-md: 48rem;
  --breakpoint-lg: 64rem;
  --breakpoint-xl: 80rem;
  --breakpoint-2xl: 96rem;
  
  /* Border radius */
  --radius-xs: 0.125rem;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-3xl: 1.5rem;
  --radius-4xl: 2rem;
  
  /* Font weights */
  --font-weight-thin: 100;
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;
  --font-weight-black: 900;
}
```
