# 24. Reusable Components Pattern

## The Problem: Repeated Utility Strings

```html
<!-- ❌ Duplicating the same classes everywhere -->
<button class="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
  Save
</button>
<button class="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
  Submit
</button>
<button class="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
  Confirm
</button>
```

## Three Solutions (Best to Worst)

### 1. Component Framework (Best)
### 2. @apply in CSS (Okay)
### 3. Template Partials (Okay)

---

## Solution 1: Framework Components

### React

```jsx
// components/Button.jsx
function Button({ variant = 'primary', size = 'md', children, ...props }) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]}`} {...props}>
      {children}
    </button>
  );
}

// Usage
<Button variant="primary">Save</Button>
<Button variant="danger" size="sm">Delete</Button>
<Button variant="ghost" size="lg">Cancel</Button>
```

### React Card Component

```jsx
function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border 
                     border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ children }) {
  return (
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      {children}
    </div>
  );
}

function CardBody({ children }) {
  return <div className="px-6 py-4">{children}</div>;
}

function CardFooter({ children }) {
  return (
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 
                    bg-gray-50 dark:bg-gray-900 rounded-b-xl">
      {children}
    </div>
  );
}

// Usage
<Card>
  <CardHeader><h2 className="text-lg font-bold">Title</h2></CardHeader>
  <CardBody><p>Content here</p></CardBody>
  <CardFooter><Button>Action</Button></CardFooter>
</Card>
```

### Vue

```vue
<!-- components/Button.vue -->
<template>
  <button :class="[base, variants[variant], sizes[size]]">
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
});

const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors';
const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};
const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};
</script>
```

---

## Solution 2: @apply (CSS Abstraction)

```css
@import "tailwindcss";

@layer components {
  .btn {
    @apply inline-flex items-center justify-center font-medium rounded-lg 
           transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
  }
  .btn-primary {
    @apply btn bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
  }
  .btn-sm { @apply px-3 py-1.5 text-xs; }
  .btn-md { @apply px-4 py-2 text-sm; }
  .btn-lg { @apply px-6 py-3 text-base; }
}
```

```html
<button class="btn-primary btn-md">Save</button>
```

### When @apply Makes Sense

| Good for | Bad for |
|----------|---------|
| CMS-generated HTML | One-off styles |
| Email templates | Complex components |
| Legacy projects without frameworks | Styles that need JS logic |
| Third-party library class hooks | Anything where utility-first works |

---

## Solution 3: Template Partials (Plain HTML)

### Using a Loop (Jinja/Nunjucks/EJS)

```html
<!-- _button.html -->
<button class="bg-blue-600 text-white px-4 py-2 rounded-lg 
               font-medium hover:bg-blue-700 transition">
  {{ text }}
</button>

<!-- page.html -->
{% include "_button.html" with { text: "Save" } %}
{% include "_button.html" with { text: "Submit" } %}
```

---

## Advanced Pattern: Class Merging

When building components, classes can conflict. Use a merge utility:

```bash
npm install tailwind-merge clsx
```

```jsx
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

// Utility to merge Tailwind classes without conflicts
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function Button({ className, variant = 'primary', ...props }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        className // Allow overrides from parent
      )}
      {...props}
    />
  );
}

// Now parent can override styles cleanly:
<Button variant="primary" className="rounded-full px-8">
  Pill Button (rounded-full overrides rounded-lg)
</Button>
```

---

## Advanced Pattern: CVA (Class Variance Authority)

For complex variant systems:

```bash
npm install class-variance-authority
```

```jsx
import { cva } from 'class-variance-authority';

const button = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      intent: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      intent: 'primary',
      size: 'md',
    },
  }
);

function Button({ intent, size, fullWidth, className, ...props }) {
  return <button className={button({ intent, size, fullWidth, className })} {...props} />;
}

// Usage
<Button intent="primary" size="lg">Large Primary</Button>
<Button intent="danger" size="sm" fullWidth>Full Width Danger</Button>
```

---

## Component Design Guidelines

1. **Prefer framework components** over @apply — they're more flexible
2. **Use `cn()` or `twMerge()`** — prevents class conflicts
3. **Define a variant system** — consistent API for props
4. **Keep components focused** — one component = one responsibility
5. **Allow className override** — let parents customize
6. **Use TypeScript** — type your variant props for safety
7. **Document with Storybook** — visual testing for all variants
