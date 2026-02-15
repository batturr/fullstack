# 13. Borders & Rounded Corners

## Border Width

```html
<!-- All sides -->
<div class="border">1px border (default)</div>
<div class="border-0">No border</div>
<div class="border-2">2px border</div>
<div class="border-4">4px border</div>
<div class="border-8">8px border</div>

<!-- Individual sides -->
<div class="border-t">Top border</div>
<div class="border-r">Right border</div>
<div class="border-b">Bottom border</div>
<div class="border-l">Left border</div>
<div class="border-t-2">2px top border</div>

<!-- Logical (RTL-safe) -->
<div class="border-s">Inline-start border</div>
<div class="border-e">Inline-end border</div>

<!-- Horizontal / Vertical -->
<div class="border-x">Left + right borders</div>
<div class="border-y">Top + bottom borders</div>
```

---

## Border Color

```html
<div class="border border-gray-300">Gray border</div>
<div class="border border-red-500">Red border</div>
<div class="border border-transparent">Transparent border</div>
<div class="border border-current">Uses current text color</div>

<!-- With opacity -->
<div class="border border-black/20">20% black border</div>

<!-- Per-side colors -->
<div class="border-t-blue-500 border-b-green-500">Different top & bottom</div>
```

---

## Border Style

```html
<div class="border border-solid">Solid (default)</div>
<div class="border border-dashed">Dashed</div>
<div class="border border-dotted">Dotted</div>
<div class="border border-double">Double</div>
<div class="border-none">No border</div>
<div class="border border-hidden">Hidden</div>
```

---

## Border Radius (Rounded Corners)

### Default Scale

| Class | Value | Pixels |
|-------|-------|--------|
| `rounded-none` | 0 | 0px |
| `rounded-xs` | 0.125rem | 2px |
| `rounded-sm` | 0.25rem | 4px |
| `rounded-md` | 0.375rem | 6px |
| `rounded` | 0.25rem | 4px |
| `rounded-lg` | 0.5rem | 8px |
| `rounded-xl` | 0.75rem | 12px |
| `rounded-2xl` | 1rem | 16px |
| `rounded-3xl` | 1.5rem | 24px |
| `rounded-4xl` | 2rem | 32px |
| `rounded-full` | 9999px | Circle/Pill |

```html
<div class="rounded-none">Square corners</div>
<div class="rounded">Slightly rounded</div>
<div class="rounded-lg">More rounded</div>
<div class="rounded-xl">Extra rounded</div>
<div class="rounded-full">Pill shape / Circle</div>
```

### Individual Corners

```html
<!-- Top corners -->
<div class="rounded-t-lg">Top corners</div>
<div class="rounded-b-lg">Bottom corners</div>
<div class="rounded-l-lg">Left corners</div>
<div class="rounded-r-lg">Right corners</div>

<!-- Single corner -->
<div class="rounded-tl-xl">Top-left only</div>
<div class="rounded-tr-xl">Top-right only</div>
<div class="rounded-bl-xl">Bottom-left only</div>
<div class="rounded-br-xl">Bottom-right only</div>

<!-- Logical (RTL-safe) -->
<div class="rounded-s-lg">Start corners</div>
<div class="rounded-e-lg">End corners</div>
<div class="rounded-ss-lg">Start-start corner</div>
<div class="rounded-ee-lg">End-end corner</div>

<!-- Arbitrary value -->
<div class="rounded-[12px]">Custom radius</div>
```

---

## Divide (Borders Between Children)

```html
<!-- Vertical dividers -->
<div class="divide-y divide-gray-200">
  <div class="py-4">Item 1</div>
  <div class="py-4">Item 2</div>
  <div class="py-4">Item 3</div>
</div>

<!-- Horizontal dividers -->
<div class="flex divide-x divide-gray-200">
  <div class="px-4">Item 1</div>
  <div class="px-4">Item 2</div>
  <div class="px-4">Item 3</div>
</div>

<!-- Divide color -->
<div class="divide-y divide-blue-300">...</div>

<!-- Divide width -->
<div class="divide-y-2">2px dividers</div>
<div class="divide-y-4">4px dividers</div>

<!-- Divide style -->
<div class="divide-y divide-dashed">Dashed dividers</div>
<div class="divide-y divide-dotted">Dotted dividers</div>
```

---

## Outline

```html
<button class="outline">Default outline</button>
<button class="outline-2">2px outline</button>
<button class="outline-4">4px outline</button>
<button class="outline-none">No outline</button>

<!-- Outline color -->
<button class="outline outline-blue-500">Blue outline</button>

<!-- Outline style -->
<button class="outline outline-dashed">Dashed outline</button>
<button class="outline outline-dotted">Dotted outline</button>

<!-- Outline offset -->
<button class="outline outline-2 outline-offset-2">Offset outline</button>
<button class="outline outline-2 outline-offset-4">More offset</button>
```

---

## Ring

A box-shadow-based "ring" utility (doesn't affect layout):

```html
<!-- Ring width -->
<button class="ring">3px ring (default)</button>
<button class="ring-0">No ring</button>
<button class="ring-1">1px ring</button>
<button class="ring-2">2px ring</button>
<button class="ring-4">4px ring</button>

<!-- Ring color -->
<button class="ring-2 ring-blue-500">Blue ring</button>
<button class="ring-2 ring-blue-500/50">50% opacity blue ring</button>

<!-- Ring offset -->
<button class="ring-2 ring-blue-500 ring-offset-2">Offset ring</button>
<button class="ring-2 ring-blue-500 ring-offset-4 ring-offset-white">
  Offset with color
</button>

<!-- Inset ring (v4 New) -->
<button class="inset-ring inset-ring-blue-500">Inset ring</button>
```

---

## Common Patterns

### Focus Ring on Buttons
```html
<button class="bg-indigo-600 text-white px-4 py-2 rounded-lg
               focus:outline-none focus:ring-2 focus:ring-indigo-500 
               focus:ring-offset-2 transition">
  Focusable Button
</button>
```

### Card with Border
```html
<div class="border border-gray-200 rounded-xl p-6 
            hover:border-gray-300 hover:shadow-md transition-all">
  <h3 class="font-semibold text-gray-900">Card Title</h3>
  <p class="text-gray-600 mt-2">Card description</p>
</div>
```

### Pill Badge
```html
<span class="inline-flex items-center px-3 py-1 
             rounded-full text-sm font-medium 
             bg-green-100 text-green-800 
             border border-green-200">
  Active
</span>
```

### Avatar with Border
```html
<img class="size-12 rounded-full ring-2 ring-white" 
     src="avatar.jpg" alt="Avatar">
```

### Stacked Avatars
```html
<div class="flex -space-x-2">
  <img class="size-10 rounded-full ring-2 ring-white" src="avatar1.jpg">
  <img class="size-10 rounded-full ring-2 ring-white" src="avatar2.jpg">
  <img class="size-10 rounded-full ring-2 ring-white" src="avatar3.jpg">
</div>
```

### Concentric Border Radius
```html
<div class="relative rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 p-1">
  <div class="rounded-[calc(var(--radius-xl)-4px)] bg-white p-6">
    Content with matching inner radius
  </div>
</div>
```

### Input with Focus Border
```html
<input class="w-full px-4 py-2 
              border border-gray-300 rounded-lg
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
              focus:outline-none transition"
       placeholder="Enter text...">
```
