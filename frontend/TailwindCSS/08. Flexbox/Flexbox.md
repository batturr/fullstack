# 08. Flexbox

## Display Flex

```html
<div class="flex">Flex container (row by default)</div>
<div class="inline-flex">Inline flex container</div>
```

---

## Flex Direction

```html
<div class="flex flex-row">Left to right (default)</div>
<div class="flex flex-row-reverse">Right to left</div>
<div class="flex flex-col">Top to bottom</div>
<div class="flex flex-col-reverse">Bottom to top</div>
```

---

## Flex Wrap

```html
<div class="flex flex-wrap">Wrap to next line</div>
<div class="flex flex-wrap-reverse">Wrap upwards</div>
<div class="flex flex-nowrap">No wrapping (default)</div>
```

---

## Justify Content (Main Axis)

```html
<div class="flex justify-start">Pack items to start</div>
<div class="flex justify-end">Pack items to end</div>
<div class="flex justify-center">Center items</div>
<div class="flex justify-between">Space between items</div>
<div class="flex justify-around">Space around items</div>
<div class="flex justify-evenly">Equal space around all</div>
```

### Visual:
```
justify-start:    |■ ■ ■         |
justify-end:      |         ■ ■ ■|
justify-center:   |    ■ ■ ■     |
justify-between:  |■     ■     ■ |
justify-around:   |  ■   ■   ■   |
justify-evenly:   | ■    ■    ■  |
```

---

## Align Items (Cross Axis)

```html
<div class="flex items-start">Align to top</div>
<div class="flex items-end">Align to bottom</div>
<div class="flex items-center">Center vertically</div>
<div class="flex items-baseline">Align text baselines</div>
<div class="flex items-stretch">Stretch to fill (default)</div>
```

---

## Align Content (Multi-line)

For flex containers with wrapped content:

```html
<div class="flex flex-wrap content-start">Pack lines to start</div>
<div class="flex flex-wrap content-center">Center lines</div>
<div class="flex flex-wrap content-end">Pack lines to end</div>
<div class="flex flex-wrap content-between">Space between lines</div>
<div class="flex flex-wrap content-around">Space around lines</div>
<div class="flex flex-wrap content-evenly">Equal space around lines</div>
```

---

## Align Self (Individual Item)

```html
<div class="flex items-start">
  <div>Normal</div>
  <div class="self-center">Centered</div>
  <div class="self-end">Bottom</div>
  <div class="self-stretch">Stretched</div>
  <div class="self-auto">Auto (default)</div>
</div>
```

---

## Flex Grow & Shrink

```html
<!-- Flex shorthand -->
<div class="flex-1">flex: 1 1 0% (grow and shrink equally)</div>
<div class="flex-auto">flex: 1 1 auto</div>
<div class="flex-initial">flex: 0 1 auto (default)</div>
<div class="flex-none">flex: none (don't grow or shrink)</div>

<!-- Individual grow -->
<div class="grow">flex-grow: 1</div>
<div class="grow-0">flex-grow: 0</div>

<!-- Individual shrink -->
<div class="shrink">flex-shrink: 1</div>
<div class="shrink-0">flex-shrink: 0 (prevent shrinking)</div>
```

---

## Flex Basis

```html
<div class="basis-0">flex-basis: 0</div>
<div class="basis-1/4">flex-basis: 25%</div>
<div class="basis-1/2">flex-basis: 50%</div>
<div class="basis-full">flex-basis: 100%</div>
<div class="basis-auto">flex-basis: auto</div>
<div class="basis-64">flex-basis: 16rem</div>
```

---

## Order

```html
<div class="flex">
  <div class="order-3">Shows third</div>
  <div class="order-1">Shows first</div>
  <div class="order-2">Shows second</div>
</div>

<!-- Special values -->
<div class="order-first">order: -9999</div>
<div class="order-last">order: 9999</div>
<div class="order-none">order: 0</div>
```

---

## Gap (Flex)

```html
<div class="flex gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Separate horizontal/vertical gaps -->
<div class="flex flex-wrap gap-x-8 gap-y-4">
  ...
</div>
```

---

## Common Flex Patterns

### Centered Content (Horizontal + Vertical)
```html
<div class="flex items-center justify-center h-screen">
  <div>Perfectly centered!</div>
</div>
```

### Navigation Bar
```html
<nav class="flex items-center justify-between px-6 py-4 bg-white shadow">
  <div class="text-xl font-bold">Logo</div>
  <div class="flex gap-6">
    <a href="#">Home</a>
    <a href="#">About</a>
    <a href="#">Contact</a>
  </div>
  <button class="bg-blue-500 text-white px-4 py-2 rounded">Sign Up</button>
</nav>
```

### Sidebar Layout
```html
<div class="flex min-h-screen">
  <aside class="w-64 shrink-0 bg-gray-800 text-white p-4">
    Sidebar
  </aside>
  <main class="flex-1 p-8">
    Main content
  </main>
</div>
```

### Card Row with Equal Heights
```html
<div class="flex gap-4">
  <div class="flex-1 bg-white rounded-lg p-6 shadow">
    <h3 class="font-bold">Card 1</h3>
    <p>Short content</p>
  </div>
  <div class="flex-1 bg-white rounded-lg p-6 shadow">
    <h3 class="font-bold">Card 2</h3>
    <p>Much longer content that stretches this card but all cards remain equal height.</p>
  </div>
  <div class="flex-1 bg-white rounded-lg p-6 shadow">
    <h3 class="font-bold">Card 3</h3>
    <p>Medium content</p>
  </div>
</div>
```

### Footer Push to Bottom
```html
<div class="flex flex-col min-h-screen">
  <header>Header</header>
  <main class="flex-1">Content</main>
  <footer>Always at bottom</footer>
</div>
```

### Media Object (Image + Text)
```html
<div class="flex items-start gap-4">
  <img class="size-12 rounded-full shrink-0" src="avatar.jpg" alt="">
  <div>
    <h4 class="font-bold text-gray-900">John Doe</h4>
    <p class="text-gray-600">A long comment that wraps naturally without pushing the avatar.</p>
  </div>
</div>
```

### Responsive Flex Direction
```html
<!-- Stack on mobile, row on desktop -->
<div class="flex flex-col md:flex-row gap-6">
  <div class="md:w-1/3">Sidebar</div>
  <div class="md:w-2/3">Main content</div>
</div>
```
