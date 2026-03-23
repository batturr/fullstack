# 07. Spacing & Sizing

## Spacing Scale

In Tailwind v4, spacing is driven by a single base variable:

```css
/* Default: --spacing: 0.25rem (4px) */
/* Every spacing utility = --spacing × multiplier */
```

| Class | Value | Pixels (default) |
|-------|-------|-----------------|
| `*-0` | 0 | 0px |
| `*-px` | 1px | 1px |
| `*-0.5` | 0.125rem | 2px |
| `*-1` | 0.25rem | 4px |
| `*-2` | 0.5rem | 8px |
| `*-3` | 0.75rem | 12px |
| `*-4` | 1rem | 16px |
| `*-5` | 1.25rem | 20px |
| `*-6` | 1.5rem | 24px |
| `*-8` | 2rem | 32px |
| `*-10` | 2.5rem | 40px |
| `*-12` | 3rem | 48px |
| `*-16` | 4rem | 64px |
| `*-20` | 5rem | 80px |
| `*-24` | 6rem | 96px |
| `*-32` | 8rem | 128px |
| `*-40` | 10rem | 160px |
| `*-48` | 12rem | 192px |
| `*-56` | 14rem | 224px |
| `*-64` | 16rem | 256px |
| `*-72` | 18rem | 288px |
| `*-80` | 20rem | 320px |
| `*-96` | 24rem | 384px |

### v4: Dynamic Spacing Values

In v4, spacing utilities accept **any value** dynamically:

```html
<!-- These all work in v4 without config! -->
<div class="mt-8">margin-top: calc(var(--spacing) * 8)</div>
<div class="w-17">width: calc(var(--spacing) * 17)</div>
<div class="pr-29">padding-right: calc(var(--spacing) * 29)</div>
```

---

## Padding

```html
<!-- All sides -->
<div class="p-4">1rem padding all around</div>

<!-- Horizontal (left + right) / Vertical (top + bottom) -->
<div class="px-6 py-3">Horizontal 1.5rem, Vertical 0.75rem</div>

<!-- Individual sides -->
<div class="pt-4">Padding top</div>
<div class="pr-4">Padding right</div>
<div class="pb-4">Padding bottom</div>
<div class="pl-4">Padding left</div>

<!-- Logical properties (RTL-safe) -->
<div class="ps-4">Padding inline-start</div>
<div class="pe-4">Padding inline-end</div>
```

---

## Margin

```html
<!-- All sides -->
<div class="m-4">1rem margin all around</div>

<!-- Auto centering -->
<div class="mx-auto max-w-md">Centered container</div>

<!-- Horizontal / Vertical -->
<div class="mx-4 my-8">Horizontal 1rem, Vertical 2rem</div>

<!-- Individual sides -->
<div class="mt-4">Margin top</div>
<div class="mr-4">Margin right</div>
<div class="mb-4">Margin bottom</div>
<div class="ml-4">Margin left</div>

<!-- Negative margins -->
<div class="-mt-4">Negative top margin</div>
<div class="-mx-2">Negative horizontal margin</div>

<!-- Logical properties -->
<div class="ms-4">Margin inline-start</div>
<div class="me-4">Margin inline-end</div>
```

---

## Space Between (Children Spacing)

Adds margin between direct child elements:

```html
<!-- Vertical spacing between children -->
<div class="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>  <!-- mt-4 applied -->
  <div>Item 3</div>  <!-- mt-4 applied -->
</div>

<!-- Horizontal spacing between children -->
<div class="flex space-x-4">
  <div>Item 1</div>
  <div>Item 2</div>  <!-- ml-4 applied -->
  <div>Item 3</div>  <!-- ml-4 applied -->
</div>

<!-- Reverse spacing (for flex-row-reverse) -->
<div class="flex flex-row-reverse space-x-reverse space-x-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

> **Tip:** For flex/grid layouts, prefer `gap-*` over `space-*` for cleaner behavior.

---

## Width

```html
<!-- Fixed widths -->
<div class="w-0">0</div>
<div class="w-4">1rem</div>
<div class="w-64">16rem</div>
<div class="w-96">24rem</div>

<!-- Percentage widths -->
<div class="w-1/2">50%</div>
<div class="w-1/3">33.333%</div>
<div class="w-2/3">66.667%</div>
<div class="w-1/4">25%</div>
<div class="w-3/4">75%</div>
<div class="w-full">100%</div>

<!-- Viewport widths -->
<div class="w-screen">100vw</div>
<div class="w-dvw">100dvw (dynamic viewport)</div>
<div class="w-svw">100svw (small viewport)</div>
<div class="w-lvw">100lvw (large viewport)</div>

<!-- Keyword widths -->
<div class="w-auto">auto</div>
<div class="w-min">min-content</div>
<div class="w-max">max-content</div>
<div class="w-fit">fit-content</div>

<!-- Arbitrary values -->
<div class="w-[137px]">137px</div>
<div class="w-[calc(100%-2rem)]">Calculated</div>
```

---

## Min/Max Width

```html
<!-- Min width -->
<div class="min-w-0">min-width: 0</div>
<div class="min-w-full">min-width: 100%</div>
<div class="min-w-min">min-width: min-content</div>

<!-- Max width (container sizes) -->
<div class="max-w-xs">20rem (320px)</div>
<div class="max-w-sm">24rem (384px)</div>
<div class="max-w-md">28rem (448px)</div>
<div class="max-w-lg">32rem (512px)</div>
<div class="max-w-xl">36rem (576px)</div>
<div class="max-w-2xl">42rem (672px)</div>
<div class="max-w-3xl">48rem (768px)</div>
<div class="max-w-4xl">56rem (896px)</div>
<div class="max-w-5xl">64rem (1024px)</div>
<div class="max-w-6xl">72rem (1152px)</div>
<div class="max-w-7xl">80rem (1280px)</div>
<div class="max-w-prose">65ch (readable text width)</div>
<div class="max-w-none">No max width</div>
```

---

## Height

```html
<!-- Fixed heights -->
<div class="h-0">0</div>
<div class="h-4">1rem</div>
<div class="h-64">16rem</div>
<div class="h-96">24rem</div>

<!-- Full/Screen/Viewport -->
<div class="h-full">100%</div>
<div class="h-screen">100vh</div>
<div class="h-dvh">100dvh (dynamic viewport)</div>
<div class="h-svh">100svh (small viewport)</div>
<div class="h-lvh">100lvh (large viewport)</div>
<div class="min-h-screen">min-height: 100vh</div>

<!-- Content-based -->
<div class="h-min">min-content</div>
<div class="h-max">max-content</div>
<div class="h-fit">fit-content</div>
```

---

## Size (Width + Height)

The `size-*` utility sets both width and height simultaneously:

```html
<div class="size-4">w-4 h-4 (16px × 16px)</div>
<div class="size-12">w-12 h-12 (48px × 48px)</div>
<div class="size-full">w-full h-full</div>

<!-- Perfect for avatars, icons -->
<img class="size-10 rounded-full" src="avatar.jpg" alt="Avatar">
<svg class="size-6 text-gray-500">...</svg>
```

---

## Gap (Flex/Grid Spacing)

```html
<!-- Gap for both axes -->
<div class="grid grid-cols-3 gap-4">
  <div>1</div> <div>2</div> <div>3</div>
</div>

<!-- Separate row/column gaps -->
<div class="grid grid-cols-3 gap-x-8 gap-y-4">
  <div>1</div> <div>2</div> <div>3</div>
</div>

<!-- Flex gap -->
<div class="flex gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

---

## Customizing Spacing

```css
@import "tailwindcss";

@theme {
  /* Change the base spacing unit */
  --spacing: 0.2rem; /* Now 1 unit = 0.2rem instead of 0.25rem */
}
```

---

## Common Patterns

### Centered Container
```html
<div class="max-w-md mx-auto px-4">
  Centered, max-width container with horizontal padding
</div>
```

### Full-Height Page Layout
```html
<div class="min-h-screen flex flex-col">
  <header class="h-16">Nav</header>
  <main class="flex-1">Content</main>
  <footer class="h-20">Footer</footer>
</div>
```

### Card with Internal Spacing
```html
<div class="p-6 space-y-4">
  <h2 class="text-xl font-bold">Card Title</h2>
  <p class="text-gray-600">Card description with comfortable spacing.</p>
  <button class="px-4 py-2 bg-blue-500 text-white rounded">Action</button>
</div>
```

### Responsive Spacing
```html
<div class="p-4 sm:p-6 md:p-8 lg:p-12">
  Padding increases with screen size
</div>
```
