# 12. Backgrounds & Gradients

## Background Color

```html
<div class="bg-white">White background</div>
<div class="bg-gray-100">Light gray</div>
<div class="bg-blue-500">Blue</div>
<div class="bg-transparent">Transparent</div>

<!-- With opacity -->
<div class="bg-black/50">50% black overlay</div>
<div class="bg-blue-500/75">75% blue</div>

<!-- Arbitrary -->
<div class="bg-[#1da1f2]">Custom color</div>
```

---

## Background Image

```html
<div class="bg-none">No background image</div>

<!-- Arbitrary URL -->
<div class="bg-[url('/img/hero.jpg')]">Background image</div>
```

---

## Background Size

```html
<div class="bg-auto">Default size</div>
<div class="bg-cover">Cover entire area</div>
<div class="bg-contain">Contain within area</div>
```

---

## Background Position

```html
<div class="bg-center">Centered</div>
<div class="bg-top">Top</div>
<div class="bg-right">Right</div>
<div class="bg-bottom">Bottom</div>
<div class="bg-left">Left</div>
<div class="bg-left-top">Left top</div>
<div class="bg-right-bottom">Right bottom</div>
```

---

## Background Repeat

```html
<div class="bg-repeat">Repeat both (default)</div>
<div class="bg-no-repeat">No repeat</div>
<div class="bg-repeat-x">Repeat horizontally</div>
<div class="bg-repeat-y">Repeat vertically</div>
<div class="bg-repeat-round">Round</div>
<div class="bg-repeat-space">Space</div>
```

---

## Background Attachment

```html
<div class="bg-fixed">Fixed (parallax effect)</div>
<div class="bg-local">Scroll with content</div>
<div class="bg-scroll">Scroll with element (default)</div>
```

---

## Background Clip

```html
<div class="bg-clip-border">Clip to border box</div>
<div class="bg-clip-padding">Clip to padding box</div>
<div class="bg-clip-content">Clip to content box</div>
<div class="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
  Gradient text!
</div>
```

---

## Linear Gradients

### Direction Keywords

```html
<div class="bg-linear-to-r from-blue-500 to-purple-500">Left to right</div>
<div class="bg-linear-to-l from-blue-500 to-purple-500">Right to left</div>
<div class="bg-linear-to-t from-blue-500 to-purple-500">Bottom to top</div>
<div class="bg-linear-to-b from-blue-500 to-purple-500">Top to bottom</div>
<div class="bg-linear-to-br from-blue-500 to-purple-500">Top-left to bottom-right</div>
<div class="bg-linear-to-tl from-blue-500 to-purple-500">Bottom-right to top-left</div>
```

> **Note:** In v4, `bg-gradient-to-*` was renamed to `bg-linear-to-*`.

### Angle-Based Gradients (v4 New)

```html
<div class="bg-linear-45 from-indigo-500 via-purple-500 to-pink-500">
  45 degree gradient
</div>
<div class="bg-linear-90 from-green-400 to-blue-500">90 degrees</div>
<div class="bg-linear-180 from-yellow-400 to-red-500">180 degrees</div>
<div class="bg-linear-[135deg] from-cyan-400 to-blue-600">Custom angle</div>
```

### Three-Color Gradient (via)

```html
<div class="bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500">
  Three-stop gradient
</div>
```

### Gradient Color Stops

```html
<!-- From color -->
<div class="from-blue-500">Start color</div>

<!-- Via color (middle) -->
<div class="via-purple-500">Middle color</div>

<!-- To color -->
<div class="to-pink-500">End color</div>

<!-- Stop positions -->
<div class="bg-linear-to-r from-blue-500 from-10% via-purple-500 via-50% to-pink-500 to-90%">
  Custom stop positions
</div>
```

---

## Gradient Interpolation (v4 New)

Control how colors blend in gradients:

```html
<!-- sRGB interpolation (default in CSS) -->
<div class="bg-linear-to-r/srgb from-indigo-500 to-teal-400">sRGB blend</div>

<!-- OKLCH interpolation (more vivid!) -->
<div class="bg-linear-to-r/oklch from-indigo-500 to-teal-400">OKLCH blend</div>

<!-- OKLAB interpolation (Tailwind v4 default) -->
<div class="bg-linear-to-r/oklab from-indigo-500 to-teal-400">OKLAB blend</div>

<!-- HSL interpolation -->
<div class="bg-linear-to-r/hsl from-indigo-500 to-teal-400">HSL blend</div>
```

> **Tip:** OKLCH/HSL produce more vivid gradients when colors are far apart on the color wheel.

---

## Radial Gradients (v4 New)

```html
<!-- Basic radial gradient -->
<div class="bg-radial from-white to-blue-500">
  Radial gradient
</div>

<!-- With position -->
<div class="bg-radial-[at_25%_25%] from-white to-zinc-900 to-75%">
  Positioned radial gradient
</div>

<!-- Custom shapes -->
<div class="bg-radial-[circle_at_top] from-blue-400 to-indigo-900">
  Circle at top
</div>
```

---

## Conic Gradients (v4 New)

```html
<!-- Basic conic gradient -->
<div class="size-24 rounded-full bg-conic from-red-500 to-blue-500">
  Conic gradient
</div>

<!-- Color wheel effect -->
<div class="size-24 rounded-full bg-conic/[in_hsl_longer_hue] from-red-600 to-red-600">
  Full spectrum wheel
</div>

<!-- From angle -->
<div class="bg-conic-[from_45deg] from-blue-500 via-green-500 to-blue-500">
  Starting from 45°
</div>
```

---

## Common Background Patterns

### Hero Section with Gradient Overlay
```html
<div class="relative bg-[url('/img/hero.jpg')] bg-cover bg-center h-96">
  <div class="absolute inset-0 bg-black/60"></div>
  <div class="relative z-10 flex items-center justify-center h-full">
    <h1 class="text-5xl font-bold text-white">Hero Title</h1>
  </div>
</div>
```

### Gradient Text
```html
<h1 class="text-6xl font-bold bg-linear-to-r from-blue-600 to-purple-600 
           bg-clip-text text-transparent">
  Gradient Heading
</h1>
```

### Gradient Button
```html
<button class="bg-linear-to-r from-purple-500 to-pink-500 
               hover:from-purple-600 hover:to-pink-600
               text-white font-semibold px-6 py-3 rounded-lg 
               shadow-lg transition-all">
  Gradient Button
</button>
```

### Gradient Border
```html
<div class="p-[2px] bg-linear-to-r from-blue-500 to-purple-500 rounded-xl">
  <div class="bg-white rounded-xl p-6">
    Content with gradient border
  </div>
</div>
```

### Mesh Gradient (Multiple Layers)
```html
<div class="relative h-96 bg-gray-900 overflow-hidden">
  <div class="absolute -top-20 -right-20 size-96 bg-purple-500/30 rounded-full blur-3xl"></div>
  <div class="absolute -bottom-20 -left-20 size-96 bg-blue-500/30 rounded-full blur-3xl"></div>
  <div class="absolute top-1/2 left-1/2 size-96 bg-pink-500/20 rounded-full blur-3xl"></div>
</div>
```
