# 21. Customizing the Design System

## Extending the Theme

In Tailwind v4, `@theme` **extends** the defaults by default (no more `extend` nesting):

```css
@import "tailwindcss";

@theme {
  /* These ADD to the defaults — they don't replace them */
  --color-brand: oklch(0.58 0.22 265);
  --font-display: "Cal Sans", sans-serif;
  --spacing-128: 32rem;
}
```

---

## Overriding Defaults

To **replace** an entire namespace, use `initial`:

```css
@theme {
  /* Remove ALL default colors */
  --color-*: initial;

  /* Define only your colors */
  --color-primary: #2563eb;
  --color-secondary: #64748b;
  --color-accent: #f59e0b;
  --color-success: #22c55e;
  --color-warning: #eab308;
  --color-error: #ef4444;
  --color-white: #ffffff;
  --color-black: #000000;
}
```

### Partial Override
```css
@theme {
  /* Remove only the gray palette */
  --color-gray-*: initial;
  
  /* Replace with custom grays */
  --color-gray-50: #fafafa;
  --color-gray-100: #f4f4f5;
  --color-gray-200: #e4e4e7;
  --color-gray-300: #d4d4d8;
  --color-gray-400: #a1a1aa;
  --color-gray-500: #71717a;
  --color-gray-600: #52525b;
  --color-gray-700: #3f3f46;
  --color-gray-800: #27272a;
  --color-gray-900: #18181b;
  --color-gray-950: #09090b;
}
```

---

## Custom Fonts

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@import "tailwindcss";

@theme {
  /* Override default sans font */
  --font-sans: "Inter", system-ui, sans-serif;
  
  /* Add new font families */
  --font-display: "Cal Sans", sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;
  --font-serif: "Merriweather", Georgia, serif;
}
```

```html
<h1 class="font-display text-4xl">Display Heading</h1>
<p class="font-sans">Body text in Inter</p>
<code class="font-mono">Code block</code>
<blockquote class="font-serif italic">A quote</blockquote>
```

---

## Custom Spacing Scale

```css
@theme {
  /* Add extra large values */
  --spacing-112: 28rem;
  --spacing-128: 32rem;
  --spacing-144: 36rem;
  --spacing-160: 40rem;
}
```

### Change the Base Spacing Unit
```css
@theme {
  /* Default is 0.25rem per unit. Change to 0.2rem: */
  --spacing: 0.2rem;
}
```

Now `p-4` = `0.8rem` instead of `1rem`.

---

## Custom Breakpoints

```css
@theme {
  --breakpoint-xs: 30rem;     /* 480px */
  --breakpoint-3xl: 120rem;   /* 1920px */
  
  /* Override existing */
  --breakpoint-sm: 36rem;     /* Change 640px to 576px */
  
  /* Replace all breakpoints */
  --breakpoint-*: initial;
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}
```

---

## Custom Shadows

```css
@theme {
  --shadow-soft: 0 2px 15px -3px rgb(0 0 0 / 0.07), 
                 0 10px 20px -2px rgb(0 0 0 / 0.04);
  --shadow-hard: 5px 5px 0px 0px rgb(0 0 0 / 0.8);
  --shadow-glow: 0 0 15px rgb(59 130 246 / 0.5);
}
```

```html
<div class="shadow-soft">Soft shadow</div>
<div class="shadow-hard">Brutalist shadow</div>
<div class="shadow-glow">Glowing shadow</div>
```

---

## Custom Animations

```css
@theme {
  /* Custom easing curves */
  --ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);

  /* Custom animations */
  --animate-fade-in: fade-in 0.5s ease-out;
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  --animate-slide-up: slide-up 0.5s var(--ease-spring);
  @keyframes slide-up {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  
  --animate-pop: pop 0.3s var(--ease-spring);
  @keyframes pop {
    0% { transform: scale(0.9); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
}
```

---

## Custom Border Radius

```css
@theme {
  --radius-xs: 0.125rem;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-3xl: 1.5rem;
  --radius-4xl: 2rem;
}
```

---

## Design Token Sharing Across Projects

### Create a shared theme file:

```css
/* design-tokens.css */
@theme {
  /* Brand Colors - OKLCH for perceptual uniformity */
  --color-brand-50: oklch(0.97 0.01 265);
  --color-brand-100: oklch(0.93 0.03 265);
  --color-brand-200: oklch(0.86 0.06 265);
  --color-brand-300: oklch(0.76 0.10 265);
  --color-brand-400: oklch(0.66 0.16 265);
  --color-brand-500: oklch(0.58 0.22 265);
  --color-brand-600: oklch(0.50 0.22 265);
  --color-brand-700: oklch(0.42 0.20 265);
  --color-brand-800: oklch(0.35 0.16 265);
  --color-brand-900: oklch(0.28 0.12 265);
  --color-brand-950: oklch(0.20 0.08 265);

  /* Typography */
  --font-sans: "Inter Variable", system-ui, sans-serif;
  --font-display: "Cal Sans", sans-serif;

  /* Shadows */
  --shadow-card: 0 1px 3px rgb(0 0 0 / 0.1), 0 1px 2px rgb(0 0 0 / 0.06);
  --shadow-elevated: 0 10px 25px rgb(0 0 0 / 0.1);
}
```

### Import in any project:

```css
/* app.css */
@import "tailwindcss";
@import "./design-tokens.css";
```

### Publish as npm Package

```json
{
  "name": "@company/design-tokens",
  "exports": {
    ".": "./design-tokens.css"
  }
}
```

```css
@import "tailwindcss";
@import "@company/design-tokens";
```

---

## Complete Design System Example

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import "tailwindcss";

@theme {
  /* === Colors === */
  --color-*: initial;
  
  --color-white: #ffffff;
  --color-black: #0a0a0a;
  
  --color-gray-50: #fafafa;
  --color-gray-100: #f5f5f5;
  --color-gray-200: #e5e5e5;
  --color-gray-300: #d4d4d4;
  --color-gray-400: #a3a3a3;
  --color-gray-500: #737373;
  --color-gray-600: #525252;
  --color-gray-700: #404040;
  --color-gray-800: #262626;
  --color-gray-900: #171717;
  --color-gray-950: #0a0a0a;

  --color-primary: oklch(0.58 0.22 265);
  --color-secondary: oklch(0.60 0.18 165);
  --color-accent: oklch(0.75 0.18 80);
  --color-success: oklch(0.65 0.20 145);
  --color-warning: oklch(0.80 0.18 85);
  --color-error: oklch(0.60 0.22 25);

  /* === Typography === */
  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --font-display: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* === Spacing === */
  --spacing: 0.25rem;

  /* === Shadows === */
  --shadow-xs: 0 1px 2px rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* === Animations === */
  --ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  --animate-enter: enter 0.2s ease-out;
  @keyframes enter {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
}
```
