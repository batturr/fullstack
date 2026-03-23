# 18. Container Queries

## Overview

Container queries let you style elements based on the **size of their container** rather than the viewport. In Tailwind v4, container queries are built into core — no plugin needed!

---

## Basic Usage

### Mark a Container

```html
<div class="@container">
  <!-- Children can use container query variants -->
  <div class="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4">
    <div>Card 1</div>
    <div>Card 2</div>
    <div>Card 3</div>
    <div>Card 4</div>
  </div>
</div>
```

### Container Sizes

| Variant | Min Width |
|---------|-----------|
| `@3xs:` | 16rem (256px) |
| `@2xs:` | 18rem (288px) |
| `@xs:` | 20rem (320px) |
| `@sm:` | 24rem (384px) |
| `@md:` | 28rem (448px) |
| `@lg:` | 32rem (512px) |
| `@xl:` | 36rem (576px) |
| `@2xl:` | 42rem (672px) |
| `@3xl:` | 48rem (768px) |
| `@4xl:` | 56rem (896px) |
| `@5xl:` | 64rem (1024px) |
| `@6xl:` | 72rem (1152px) |
| `@7xl:` | 80rem (1280px) |

---

## Named Containers

```html
<div class="@container/sidebar">
  <div class="@md/sidebar:grid-cols-2">
    Responds to sidebar container width
  </div>
</div>

<div class="@container/main">
  <div class="@lg/main:grid-cols-3">
    Responds to main container width
  </div>
</div>
```

---

## Max-Width Container Queries (v4 New)

Target containers **narrower** than a size:

```html
<div class="@container">
  <div class="grid grid-cols-3 @max-md:grid-cols-1">
    <!-- 1 column when container is narrower than md (448px) -->
    <!-- 3 columns when container is wider -->
  </div>
</div>
```

---

## Container Query Ranges

Combine min and max:

```html
<div class="@container">
  <div class="flex @min-md:@max-xl:hidden">
    <!-- Hidden when container is between md and xl -->
  </div>
</div>
```

---

## Container Queries vs Media Queries

| Feature | Media Query (`md:`) | Container Query (`@md:`) |
|---------|---------------------|--------------------------|
| Based on | Viewport width | Container width |
| Use case | Page-level layout | Component-level layout |
| Works inside | Any element | Elements with `@container` parent |
| Reusability | Less reusable | Highly reusable components |

---

## Custom Container Sizes

```css
@import "tailwindcss";

@theme {
  --container-8xl: 90rem;
  --container-content: 65ch;
}
```

```html
<div class="@container">
  <div class="@8xl:grid-cols-6">Six columns at 90rem</div>
</div>
```

---

## Practical Examples

### Responsive Card Component

```html
<!-- This card adapts to its container, not the viewport -->
<div class="@container">
  <div class="flex flex-col @sm:flex-row gap-4 p-4 bg-white rounded-xl shadow">
    <img class="w-full @sm:w-48 h-48 object-cover rounded-lg" src="product.jpg">
    <div class="flex-1">
      <h3 class="text-lg @md:text-xl font-bold">Product Name</h3>
      <p class="text-gray-600 mt-1 @md:mt-2">
        Product description that adjusts based on available space.
      </p>
      <div class="mt-4 flex flex-col @md:flex-row gap-2">
        <button class="bg-blue-500 text-white px-4 py-2 rounded-lg">Buy Now</button>
        <button class="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">Learn More</button>
      </div>
    </div>
  </div>
</div>
```

### Dashboard Widget

```html
<div class="@container">
  <div class="p-4">
    <h4 class="text-sm @sm:text-base font-semibold">Revenue</h4>
    <p class="text-2xl @sm:text-3xl @lg:text-4xl font-bold mt-2">$24,780</p>
    <div class="hidden @md:flex gap-4 mt-4">
      <span class="text-green-500">↑ 12%</span>
      <span class="text-gray-500">vs last month</span>
    </div>
  </div>
</div>
```

### Sidebar That Adapts

```html
<aside class="@container w-64 lg:w-80">
  <nav class="flex flex-col gap-2">
    <a class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100">
      <svg class="size-5">...</svg>
      <span class="hidden @xs:inline">Dashboard</span>
    </a>
    <a class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100">
      <svg class="size-5">...</svg>
      <span class="hidden @xs:inline">Settings</span>
    </a>
  </nav>
</aside>
```

### Grid That Responds to Container

```html
<!-- Place this in any container — it adapts automatically -->
<div class="@container">
  <div class="grid grid-cols-1 @xs:grid-cols-2 @md:grid-cols-3 @xl:grid-cols-4 gap-4">
    <div class="bg-white rounded-lg shadow p-4">Widget 1</div>
    <div class="bg-white rounded-lg shadow p-4">Widget 2</div>
    <div class="bg-white rounded-lg shadow p-4">Widget 3</div>
    <div class="bg-white rounded-lg shadow p-4">Widget 4</div>
  </div>
</div>
```

---

## When to Use Container Queries vs Media Queries

| Scenario | Use |
|----------|-----|
| Page-level layout (header, footer, sidebar) | Media queries (`md:`, `lg:`) |
| Reusable components (cards, widgets) | Container queries (`@sm:`, `@md:`) |
| Components placed in different contexts | Container queries |
| Global responsive behavior | Media queries |
| Dashboard widgets in variable-width panels | Container queries |
