# 09. Grid System

## Display Grid

```html
<div class="grid">Block-level grid container</div>
<div class="inline-grid">Inline grid container</div>
```

---

## Grid Template Columns

```html
<!-- Equal columns -->
<div class="grid grid-cols-1">1 column</div>
<div class="grid grid-cols-2">2 equal columns</div>
<div class="grid grid-cols-3">3 equal columns</div>
<div class="grid grid-cols-4">4 equal columns</div>
<div class="grid grid-cols-6">6 equal columns</div>
<div class="grid grid-cols-12">12 equal columns</div>

<!-- In v4: Dynamic values work out of the box -->
<div class="grid grid-cols-15">15 columns (no config needed!)</div>

<!-- None -->
<div class="grid grid-cols-none">No columns defined</div>

<!-- Subgrid -->
<div class="grid grid-cols-subgrid">Inherit parent grid columns</div>

<!-- Custom grid -->
<div class="grid grid-cols-[200px_1fr_200px]">Sidebar | Main | Sidebar</div>
<div class="grid grid-cols-[1fr_2fr_1fr]">1:2:1 ratio</div>
<div class="grid grid-cols-[auto_1fr_auto]">Auto | Fill | Auto</div>
```

---

## Grid Template Rows

```html
<div class="grid grid-rows-2">2 equal rows</div>
<div class="grid grid-rows-3">3 equal rows</div>
<div class="grid grid-rows-6">6 equal rows</div>
<div class="grid grid-rows-none">No explicit rows</div>
<div class="grid grid-rows-subgrid">Inherit parent rows</div>

<!-- Custom rows -->
<div class="grid grid-rows-[auto_1fr_auto]">Header | Content | Footer</div>
```

---

## Column Span

```html
<div class="grid grid-cols-6">
  <div class="col-span-2">Spans 2 columns</div>
  <div class="col-span-4">Spans 4 columns</div>
</div>

<!-- Common spans -->
<div class="col-span-1">1 column</div>
<div class="col-span-2">2 columns</div>
<div class="col-span-3">3 columns</div>
<div class="col-span-full">Full width</div>

<!-- Start/End positions -->
<div class="col-start-1 col-end-4">Columns 1-3</div>
<div class="col-start-2">Start at column 2</div>
<div class="col-end-5">End at column 5</div>
```

---

## Row Span

```html
<div class="grid grid-rows-3">
  <div class="row-span-2">Spans 2 rows</div>
  <div class="row-span-1">1 row</div>
</div>

<div class="row-span-full">Full height</div>
<div class="row-start-1 row-end-3">Rows 1-2</div>
```

---

## Gap

```html
<!-- Equal gap -->
<div class="grid grid-cols-3 gap-4">Equal gap everywhere</div>

<!-- Separate column/row gaps -->
<div class="grid grid-cols-3 gap-x-8 gap-y-4">
  Different horizontal and vertical gaps
</div>

<!-- Large gaps -->
<div class="grid grid-cols-2 gap-8">Spacious grid</div>
```

---

## Grid Auto Flow

```html
<div class="grid grid-flow-row">Fill rows first (default)</div>
<div class="grid grid-flow-col">Fill columns first</div>
<div class="grid grid-flow-dense">Dense packing (fills gaps)</div>
<div class="grid grid-flow-row-dense">Row + dense</div>
<div class="grid grid-flow-col-dense">Column + dense</div>
```

---

## Grid Auto Columns/Rows

```html
<!-- Auto-generated column sizes -->
<div class="grid auto-cols-auto">Auto sized</div>
<div class="grid auto-cols-min">min-content</div>
<div class="grid auto-cols-max">max-content</div>
<div class="grid auto-cols-fr">1fr (equal share)</div>

<!-- Auto-generated row sizes -->
<div class="grid auto-rows-auto">Auto sized rows</div>
<div class="grid auto-rows-min">min-content rows</div>
<div class="grid auto-rows-fr">1fr rows</div>
```

---

## Place Items / Content / Self

### Place Items (Align + Justify items)
```html
<div class="grid place-items-center">Center both axes</div>
<div class="grid place-items-start">Start both axes</div>
<div class="grid place-items-end">End both axes</div>
<div class="grid place-items-stretch">Stretch both axes</div>
```

### Place Content
```html
<div class="grid place-content-center">Center grid content</div>
<div class="grid place-content-between">Space between</div>
<div class="grid place-content-around">Space around</div>
```

### Place Self (Individual Item)
```html
<div class="place-self-center">Center this item</div>
<div class="place-self-start">This item at start</div>
<div class="place-self-end">This item at end</div>
```

---

## Common Grid Patterns

### Responsive Card Grid
```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <div class="bg-white rounded-lg shadow p-6">Card 1</div>
  <div class="bg-white rounded-lg shadow p-6">Card 2</div>
  <div class="bg-white rounded-lg shadow p-6">Card 3</div>
  <div class="bg-white rounded-lg shadow p-6">Card 4</div>
</div>
```

### Holy Grail Layout
```html
<div class="grid grid-rows-[auto_1fr_auto] min-h-screen">
  <header class="bg-gray-800 text-white p-4">Header</header>
  
  <div class="grid grid-cols-[200px_1fr_200px]">
    <aside class="bg-gray-100 p-4">Left Sidebar</aside>
    <main class="p-8">Main Content</main>
    <aside class="bg-gray-100 p-4">Right Sidebar</aside>
  </div>
  
  <footer class="bg-gray-800 text-white p-4">Footer</footer>
</div>
```

### Dashboard Layout
```html
<div class="grid grid-cols-4 grid-rows-3 gap-4 h-screen p-4">
  <div class="col-span-4 bg-white rounded-lg shadow p-4">Header / Stats</div>
  <div class="col-span-1 row-span-2 bg-white rounded-lg shadow p-4">Sidebar Nav</div>
  <div class="col-span-2 row-span-2 bg-white rounded-lg shadow p-4">Main Chart</div>
  <div class="col-span-1 bg-white rounded-lg shadow p-4">Widget 1</div>
  <div class="col-span-1 bg-white rounded-lg shadow p-4">Widget 2</div>
</div>
```

### Photo Gallery (Auto-fit)
```html
<div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
  <img class="w-full h-48 object-cover rounded-lg" src="photo1.jpg">
  <img class="w-full h-48 object-cover rounded-lg" src="photo2.jpg">
  <img class="w-full h-48 object-cover rounded-lg" src="photo3.jpg">
  <img class="w-full h-48 object-cover rounded-lg" src="photo4.jpg">
  <img class="w-full h-48 object-cover rounded-lg" src="photo5.jpg">
</div>
```

### 12-Column System (Bootstrap-like)
```html
<div class="grid grid-cols-12 gap-4">
  <div class="col-span-8">Main content (8/12)</div>
  <div class="col-span-4">Sidebar (4/12)</div>
</div>

<div class="grid grid-cols-12 gap-4">
  <div class="col-span-4">One third</div>
  <div class="col-span-4">One third</div>
  <div class="col-span-4">One third</div>
</div>
```

### Responsive Grid with Different Columns per Breakpoint
```html
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  <!-- 
    Mobile: 1 column
    sm (640px+): 2 columns
    md (768px+): 3 columns  
    lg (1024px+): 4 columns
  -->
</div>
```

### Asymmetric Grid (2:3 ratio)
```html
<div class="grid lg:grid-cols-5 gap-8">
  <div class="lg:col-span-2">Smaller section</div>
  <div class="lg:col-span-3">Larger section</div>
</div>
```
