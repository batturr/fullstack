# 26. Best Practices & Tips

## Class Organization

### Recommended Ordering

Organize utility classes by category for readability:

```
Layout → Box Model → Typography → Visual → Interactive → Responsive
```

```html
<!-- ✅ Well-organized (logical grouping) -->
<div class="
  flex items-center justify-between              /* Layout */
  w-full max-w-md mx-auto p-6 gap-4             /* Box model / Spacing */
  text-sm font-medium text-gray-900             /* Typography */
  bg-white border border-gray-200 rounded-xl    /* Visual */
  shadow-md                                     /* Effects */
  hover:shadow-lg hover:border-gray-300          /* States */
  transition-all duration-200                    /* Animation */
  dark:bg-gray-800 dark:text-white              /* Dark mode */
  md:max-w-lg lg:max-w-xl                       /* Responsive */
">
```

### Use Prettier Plugin

```bash
npm install -D prettier-plugin-tailwindcss
```

```json
// .prettierrc
{
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

This automatically sorts classes in the recommended order!

---

## Naming Conventions

### Custom Class Names (When Using @apply)

```css
/* ✅ Descriptive, component-based names */
.btn-primary { ... }
.card-header { ... }
.nav-link { ... }
.form-input { ... }

/* ❌ Avoid vague or utility-like names */
.blue-text { ... }     /* Use text-blue-500 directly */
.big-margin { ... }    /* Use m-8 directly */
.centered { ... }      /* Use flex items-center justify-center */
```

### Component Naming (React/Vue)

```jsx
// ✅ Clear, descriptive component names
<PrimaryButton>Save</PrimaryButton>
<PageHeader title="Dashboard" />
<MetricCard value={42} label="Active Users" />

// ❌ Too generic
<StyledDiv>...</StyledDiv>
<BlueBox>...</BlueBox>
```

---

## Performance Best Practices

### 1. Avoid Overusing @apply

```css
/* ❌ Don't recreate the utility system */
.text-red { @apply text-red-500; }
.mt-big { @apply mt-8; }

/* ✅ Only abstract meaningful patterns */
.btn-primary { @apply bg-blue-600 text-white px-4 py-2 rounded-lg font-medium 
                      hover:bg-blue-700 transition; }
```

### 2. Use `transition` Selectively

```html
<!-- ❌ Transitioning everything is expensive -->
<div class="transition-all duration-300">...</div>

<!-- ✅ Transition only what changes -->
<div class="transition-colors duration-200">...</div>
<div class="transition-transform duration-300">...</div>
```

### 3. Prefer `translate` Over `top`/`left`

```html
<!-- ❌ Animating layout properties (triggers reflow) -->
<div class="relative hover:top-[-4px] transition-all">...</div>

<!-- ✅ Transform doesn't trigger reflow -->
<div class="hover:-translate-y-1 transition-transform">...</div>
```

### 4. Use `will-change` Sparingly

```html
<!-- Only for known animations, and remove when done -->
<div class="will-change-transform">...</div>
```

---

## Common Mistakes to Avoid

### 1. Conflicting Utilities

```html
<!-- ❌ These conflict — only one wins -->
<div class="w-full w-1/2">...</div>
<div class="text-left text-center">...</div>

<!-- ✅ Use responsive prefixes or conditional logic -->
<div class="w-full md:w-1/2">...</div>
```

### 2. Forgetting Dark Mode

```html
<!-- ❌ Only styled for light mode -->
<div class="bg-white text-gray-900 border-gray-200">

<!-- ✅ Always include dark variants -->
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
```

### 3. Hard-Coding Colors

```html
<!-- ❌ Magic hex values scattered everywhere -->
<div class="bg-[#3b82f6]">...</div>
<div class="text-[#3b82f6]">...</div>

<!-- ✅ Define once in theme, use everywhere -->
<!-- In CSS: @theme { --color-brand: #3b82f6; } -->
<div class="bg-brand">...</div>
<div class="text-brand">...</div>
```

### 4. Over-Nesting with @apply

```css
/* ❌ Deep nesting defeats the purpose */
.header .nav .nav-item .nav-link {
  @apply text-gray-600 hover:text-gray-900;
}

/* ✅ Flat, direct class application */
.nav-link {
  @apply text-gray-600 hover:text-gray-900;
}
```

### 5. Using !important Unnecessarily

```html
<!-- ❌ Don't fight specificity with important -->
<div class="!bg-red-500">...</div>

<!-- ✅ Fix the root cause: ensure correct layer/selector -->
```

---

## Accessibility Tips

### 1. Color Contrast

```html
<!-- ✅ Minimum 4.5:1 contrast ratio for text -->
<p class="text-gray-700 bg-white">Good contrast (7:1)</p>
<p class="text-gray-400 bg-white">Bad contrast (3:1) ❌</p>

<!-- Use darker shades for small text -->
<p class="text-sm text-gray-600">Small text needs 600+ gray</p>
```

### 2. Focus Indicators

```html
<!-- ✅ Always visible focus styles -->
<button class="focus:outline-none focus-visible:ring-2 
               focus-visible:ring-blue-500 focus-visible:ring-offset-2">
  Accessible Button
</button>

<!-- ❌ Never remove focus without replacement -->
<button class="focus:outline-none">No focus indicator!</button>
```

### 3. Screen Reader Utilities

```html
<!-- Visually hidden but accessible to screen readers -->
<span class="sr-only">Close menu</span>

<!-- Becomes visible on focus (skip links) -->
<a class="sr-only focus:not-sr-only" href="#main">
  Skip to main content
</a>
```

### 4. Motion Preferences

```html
<div class="animate-bounce motion-reduce:animate-none">
  Respects reduced motion preference
</div>

<div class="transition-transform duration-300 motion-reduce:transition-none">
  No transitions if user prefers reduced motion
</div>
```

---

## Debugging Workflow

### 1. Use Browser DevTools

- **Inspect element** → See computed classes
- **Toggle classes** → Test adding/removing utilities
- **Responsive mode** → Check all breakpoints

### 2. VS Code Tailwind IntelliSense

- **Autocomplete** — Suggests classes as you type
- **Hover** — Shows the generated CSS for any class
- **Lint** — Flags conflicting or unknown classes
- **Color preview** — Shows color swatches inline

### 3. Add Debug Borders

```html
<!-- Temporarily add borders to debug layout -->
<div class="border border-red-500">
  <div class="border border-blue-500">
    <div class="border border-green-500">
      Debug nested layouts
    </div>
  </div>
</div>
```

### 4. Use Outline Instead of Border for Debugging

```html
<!-- Outlines don't affect layout (no extra box model space) -->
<div class="outline outline-red-500">Debug without shifting layout</div>
```

---

## Project Structure Recommendations

```
src/
├── app.css                 # Main CSS: @import "tailwindcss", @theme, etc.
├── components/
│   ├── Button.jsx
│   ├── Card.jsx
│   └── Input.jsx
├── layouts/
│   ├── MainLayout.jsx
│   └── DashboardLayout.jsx
├── pages/
│   ├── Home.jsx
│   └── About.jsx
└── styles/
    ├── design-tokens.css   # Shared @theme variables
    └── components.css      # @layer components { @apply ... }
```

---

## Quick Reference: Do's and Don'ts

| Do | Don't |
|----|-------|
| Use utility classes directly in HTML | Over-abstract with @apply |
| Define brand colors in @theme | Hard-code hex values in utilities |
| Use component frameworks for reuse | Create CSS classes for everything |
| Test responsive at every breakpoint | Assume desktop-first |
| Include dark mode variants | Forget dark mode |
| Use `sr-only` for accessibility | Remove focus styles without replacement |
| Use Prettier plugin for class sorting | Manually sort classes |
| Keep class strings as complete literals | Dynamically construct class names |
| Use `cn()` / `twMerge()` for merging | Rely on CSS specificity |
| Start mobile-first, then add prefixes | Start with desktop and hide on mobile |
