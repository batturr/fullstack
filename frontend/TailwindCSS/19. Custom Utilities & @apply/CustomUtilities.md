# 19. Custom Utilities & @apply

## The @apply Directive

Extract repeated utility patterns into custom CSS classes:

```css
@import "tailwindcss";

/* Custom button class using @apply */
@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-semibold text-sm 
           transition-colors duration-200 focus:outline-none 
           focus:ring-2 focus:ring-offset-2;
  }

  .btn-primary {
    @apply btn bg-blue-600 text-white hover:bg-blue-700 
           focus:ring-blue-500;
  }

  .btn-secondary {
    @apply btn bg-gray-200 text-gray-800 hover:bg-gray-300 
           focus:ring-gray-500;
  }

  .btn-danger {
    @apply btn bg-red-600 text-white hover:bg-red-700 
           focus:ring-red-500;
  }
}
```

```html
<button class="btn-primary">Save</button>
<button class="btn-secondary">Cancel</button>
<button class="btn-danger">Delete</button>
```

---

## CSS Layers in Tailwind v4

Tailwind v4 outputs CSS in four layers:

```css
@layer theme, base, components, utilities;
```

| Layer | Purpose | Priority |
|-------|---------|----------|
| `theme` | CSS variables (`--color-*`, `--font-*`) | Lowest |
| `base` | Reset styles, HTML defaults | Low |
| `components` | Multi-property component classes | Medium |
| `utilities` | Single-purpose utility classes | Highest |

> **Important:** Utilities always beat components because of layer ordering.

---

## Adding Custom Component Classes

```css
@import "tailwindcss";

@layer components {
  .card {
    @apply bg-white dark:bg-gray-800 rounded-xl shadow-md p-6;
  }
  
  .card-header {
    @apply text-lg font-bold text-gray-900 dark:text-white mb-4;
  }

  .input-field {
    @apply w-full px-4 py-2 border border-gray-300 dark:border-gray-600
           rounded-lg bg-white dark:bg-gray-800 
           text-gray-900 dark:text-white
           placeholder-gray-400 
           focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
           focus:outline-none transition;
  }

  .badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full 
           text-xs font-medium;
  }

  .badge-green {
    @apply badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
  }

  .badge-red {
    @apply badge bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200;
  }
}
```

---

## Adding Custom Base Styles

```css
@layer base {
  h1 {
    @apply text-3xl font-bold text-gray-900 dark:text-white;
  }
  
  h2 {
    @apply text-2xl font-semibold text-gray-900 dark:text-white;
  }
  
  a {
    @apply text-blue-600 hover:text-blue-800 transition-colors;
  }

  body {
    @apply bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white;
  }
}
```

---

## Adding Custom Utilities

```css
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  .content-auto {
    content-visibility: auto;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
}
```

---

## @apply with Variants

```css
@layer components {
  .fancy-link {
    @apply text-blue-600 underline decoration-blue-300
           hover:text-blue-800 hover:decoration-blue-500
           dark:text-blue-400 dark:hover:text-blue-300
           transition-colors;
  }
}
```

---

## When to Use @apply vs Inline Utilities

### Use @apply When:

1. **Repeated patterns** — Same 5+ utility combo used 10+ times
2. **CMS/Markdown content** — Style prose HTML you don't control
3. **Third-party integration** — Need class names for libraries
4. **Design tokens** — Company-wide component classes

### Use Inline Utilities When:

1. **One-off styles** — Unique to a single element
2. **Small combinations** — 2-3 utilities together
3. **Components frameworks** — React/Vue components are already reusable
4. **Prototype/iterate** — Easier to change inline

### Component Framework (Preferred Over @apply)

```jsx
// React component — better than @apply!
function Button({ variant = 'primary', children, ...props }) {
  const base = 'px-4 py-2 rounded-lg font-semibold text-sm transition-colors';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  
  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}
```

---

## @apply Pitfalls

### 1. Order Doesn't Matter Inside @apply
```css
/* These are identical — @apply sorts by layer specificity */
.foo { @apply p-4 bg-blue-500; }
.foo { @apply bg-blue-500 p-4; }
```

### 2. Can't @apply Arbitrary Values with Spaces
```css
/* ❌ Won't work */
.foo { @apply grid-cols-[1fr 2fr]; }

/* ✅ Write it directly instead */
.foo { grid-template-columns: 1fr 2fr; }
```

### 3. Avoid Over-Abstracting
```css
/* ❌ Don't recreate Bootstrap */
.text-red { @apply text-red-500; }
.mt-20 { @apply mt-5; }

/* ✅ Abstract meaningful components */
.alert-error { @apply bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded; }
```

---

## Complete Example: Design System

```css
@import "tailwindcss";

@layer base {
  body {
    @apply bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased;
  }
}

@layer components {
  /* Buttons */
  .btn { @apply inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed; }
  .btn-sm { @apply px-3 py-1.5 text-xs; }
  .btn-lg { @apply px-6 py-3 text-base; }
  .btn-primary { @apply btn bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500; }
  .btn-ghost { @apply btn bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500; }

  /* Cards */
  .card { @apply bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800; }
  .card-body { @apply p-6; }
  .card-title { @apply text-lg font-semibold text-gray-900 dark:text-white; }

  /* Form elements */
  .form-input { @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition; }
  .form-label { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
}
```
