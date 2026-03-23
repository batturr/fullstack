# 10. Responsive Design

## Mobile-First Approach

Tailwind uses a **mobile-first** breakpoint system. Unprefixed utilities apply to all screen sizes. Prefixed utilities apply at that breakpoint **and above**.

### Default Breakpoints

| Prefix | Min Width | CSS |
|--------|-----------|-----|
| *(none)* | 0px | (applies to all) |
| `sm:` | 640px (40rem) | `@media (min-width: 640px)` |
| `md:` | 768px (48rem) | `@media (min-width: 768px)` |
| `lg:` | 1024px (64rem) | `@media (min-width: 1024px)` |
| `xl:` | 1280px (80rem) | `@media (min-width: 1280px)` |
| `2xl:` | 1536px (96rem) | `@media (min-width: 1536px)` |

### How It Works

```html
<!-- 
  Mobile (< 640px): 1 column, small text
  sm (≥ 640px): 2 columns, medium text
  lg (≥ 1024px): 4 columns, large text
-->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <h1 class="text-2xl sm:text-3xl lg:text-4xl">Responsive Heading</h1>
</div>
```

---

## The Mobile-First Workflow

### Step 1: Design for Mobile First (< 640px)

```html
<div class="px-8 py-10 max-w-md mx-auto">
  <img class="mt-6 rounded-lg shadow-xl" src="hero.jpg" alt="">
  <h1 class="mt-6 text-2xl font-bold text-gray-900">
    You can work from anywhere.
    <span class="text-indigo-600">Take advantage of it!</span>
  </h1>
  <p class="mt-2 text-gray-600">
    Find work-friendly rentals in beautiful locations.
  </p>
  <div class="mt-4">
    <a class="inline-block bg-indigo-600 px-5 py-3 text-gray-100 
              font-semibold rounded-lg uppercase tracking-wider text-sm shadow-lg" 
       href="#">
      Book your escape
    </a>
  </div>
</div>
```

> **Tip:** Use `text-gray-900` instead of pure `text-black` — dark gray is easier on the eyes.

### Step 2: sm Breakpoint (≥ 640px)

```html
<div class="px-8 py-10 max-w-md mx-auto sm:max-w-xl">
  <img class="mt-6 rounded-lg shadow-xl sm:mt-8 sm:h-64 sm:w-full sm:object-cover sm:object-center" 
       src="hero.jpg" alt="">
  <h1 class="mt-6 text-2xl font-bold text-gray-900 sm:mt-8 sm:text-4xl">...</h1>
  <p class="mt-2 text-gray-600 sm:mt-4 sm:text-xl">...</p>
</div>
```

### Step 3: lg Breakpoint (≥ 1024px)

Change layout from stacked to side-by-side:

```html
<div class="bg-gray-100 grid lg:grid-cols-2">
  <!-- Left: Text content -->
  <div class="px-8 py-10 max-w-md mx-auto sm:max-w-xl lg:px-12 lg:py-24 lg:max-w-full">
    <h1 class="text-2xl font-bold sm:text-4xl lg:text-3xl">...</h1>
    <!-- Hide mobile image on lg -->
    <img class="rounded-lg shadow-xl lg:hidden" src="hero.jpg">
  </div>
  
  <!-- Right: Image (hidden until lg) -->
  <div class="hidden lg:block">
    <img class="h-full object-cover object-center" src="hero.jpg">
  </div>
</div>
```

### Step 4: xl Breakpoint (≥ 1280px)

Fine-tune sizes:

```html
<h1 class="text-2xl sm:text-4xl lg:text-3xl xl:text-4xl">
  Heading gets bigger on xl
</h1>

<!-- Prevent unlimited stretching -->
<div class="lg:max-w-full xl:mr-0">
  <div class="xl:max-w-xl">
    Content constrained on very wide screens
  </div>
</div>
```

### Step 5: 2xl Breakpoint (≥ 1536px)

Adjust grid ratios for ultra-wide screens:

```html
<div class="grid lg:grid-cols-2 2xl:grid-cols-5">
  <div class="2xl:col-span-2">Text (2/5)</div>
  <div class="2xl:col-span-3">Image (3/5)</div>
</div>
```

---

## Max-Width Breakpoints (v4 New)

Target screens **below** a breakpoint:

```html
<!-- Only on screens narrower than md (768px) -->
<div class="max-md:hidden">Hidden on small screens</div>
<div class="max-md:text-sm">Small text under 768px</div>

<!-- Only on screens narrower than lg -->
<div class="max-lg:flex-col">Stack vertically under 1024px</div>
```

---

## Breakpoint Ranges

Combine `min-*` and `max-*` for ranges:

```html
<!-- Only between md and xl -->
<div class="md:max-xl:grid-cols-2">
  2 columns only between 768px and 1280px
</div>
```

---

## Custom Breakpoints

```css
@import "tailwindcss";

@theme {
  --breakpoint-3xl: 120rem;     /* 1920px */
  --breakpoint-xs: 30rem;       /* 480px */
  
  /* Override existing */
  --breakpoint-sm: 30rem;       /* Change sm from 640px to 480px */
}
```

```html
<div class="3xl:grid-cols-6">6 columns on ultrawide</div>
<div class="xs:text-lg">Larger text from 480px+</div>
```

---

## Responsive Utilities Cheat Sheet

### Show/Hide
```html
<div class="hidden sm:block">Hidden on mobile, shown on sm+</div>
<div class="block md:hidden">Shown on mobile, hidden on md+</div>
<div class="hidden lg:block xl:hidden">Only visible on lg screens</div>
```

### Responsive Typography
```html
<h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
  Scales with screen size
</h1>
```

### Responsive Spacing
```html
<div class="p-4 sm:p-6 md:p-8 lg:p-12">
  Padding increases with screen size
</div>
```

### Responsive Layout
```html
<!-- Stack → 2 col → 4 col -->
<div class="flex flex-col sm:flex-row sm:flex-wrap">
  <div class="sm:w-1/2 lg:w-1/4 p-4">Item</div>
  <div class="sm:w-1/2 lg:w-1/4 p-4">Item</div>
  <div class="sm:w-1/2 lg:w-1/4 p-4">Item</div>
  <div class="sm:w-1/2 lg:w-1/4 p-4">Item</div>
</div>
```

---

## Responsive Design Tips

1. **Always start with mobile** — write base styles first, then add breakpoint prefixes
2. **Don't duplicate** — if a style is the same across all breakpoints, don't prefix it
3. **Use `gap` over margins** — `gap-4` is cleaner than adding margins to each item
4. **Test every breakpoint** — resize your browser to check all sizes
5. **Consider `text-pretty`** — Tailwind v4's `text-pretty` prevents orphans in headings
