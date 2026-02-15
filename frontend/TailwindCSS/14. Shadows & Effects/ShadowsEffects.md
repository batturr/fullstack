# 14. Shadows & Effects

## Box Shadow

### Default Shadow Scale

| Class | Description |
|-------|-------------|
| `shadow-2xs` | Barely visible shadow |
| `shadow-xs` | Extra small shadow |
| `shadow-sm` | Small shadow |
| `shadow` | Default shadow |
| `shadow-md` | Medium shadow |
| `shadow-lg` | Large shadow |
| `shadow-xl` | Extra large shadow |
| `shadow-2xl` | Huge shadow |
| `shadow-none` | No shadow |

```html
<div class="shadow-sm">Subtle shadow</div>
<div class="shadow">Default shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
<div class="shadow-xl">Extra large shadow</div>
<div class="shadow-2xl">Largest shadow</div>
```

### Shadow Color

```html
<div class="shadow-lg shadow-blue-500/50">Blue shadow</div>
<div class="shadow-xl shadow-purple-500/30">Purple shadow</div>
<div class="shadow-lg shadow-gray-900/20">Subtle dark shadow</div>
```

---

## Inset Shadow (v4 New)

Apply shadows inside an element:

```html
<div class="inset-shadow-xs">Extra small inset shadow</div>
<div class="inset-shadow-sm">Small inset shadow</div>
<div class="inset-shadow-md">Medium inset shadow (arbitrary)</div>

<!-- Color -->
<div class="inset-shadow-sm inset-shadow-blue-500/20">Blue inset shadow</div>
```

---

## Inset Ring (v4 New)

Combine multiple shadow layers:

```html
<!-- Stack up to 4 layers of shadows -->
<div class="shadow-md inset-shadow-sm ring ring-black/5 inset-ring inset-ring-white/10">
  Four layers of shadow effects!
</div>
```

---

## Drop Shadow (Filter)

For non-rectangular shapes (images, SVGs):

```html
<img class="drop-shadow-xs" src="logo.png">
<img class="drop-shadow-sm" src="logo.png">
<img class="drop-shadow-md" src="logo.png">
<img class="drop-shadow-lg" src="logo.png">
<img class="drop-shadow-xl" src="logo.png">
<img class="drop-shadow-2xl" src="logo.png">
<img class="drop-shadow-none" src="logo.png">
```

> **Tip:** Use `drop-shadow` instead of `shadow` for images with transparency (PNGs, SVGs).

---

## Text Shadow (v4 New)

```html
<h1 class="text-shadow-2xs">Barely visible text shadow</h1>
<h1 class="text-shadow-xs">Extra small text shadow</h1>
<h1 class="text-shadow-sm">Small text shadow</h1>
<h1 class="text-shadow-md">Medium text shadow</h1>
<h1 class="text-shadow-lg">Large text shadow</h1>
```

---

## Opacity

```html
<div class="opacity-0">Invisible</div>
<div class="opacity-5">5% visible</div>
<div class="opacity-25">25% visible</div>
<div class="opacity-50">Half visible</div>
<div class="opacity-75">75% visible</div>
<div class="opacity-100">Fully visible (default)</div>

<!-- Arbitrary -->
<div class="opacity-[0.67]">67% visible</div>
```

---

## Blur (Filter)

```html
<div class="blur-none">No blur</div>
<div class="blur-sm">Slight blur (8px)</div>
<div class="blur">Default blur (8px)</div>
<div class="blur-md">Medium blur (12px)</div>
<div class="blur-lg">Large blur (16px)</div>
<div class="blur-xl">Extra large blur (24px)</div>
<div class="blur-2xl">Heavy blur (40px)</div>
<div class="blur-3xl">Maximum blur (64px)</div>
```

---

## Backdrop Blur (Glassmorphism)

```html
<div class="backdrop-blur-sm">Slight backdrop blur</div>
<div class="backdrop-blur">Default backdrop blur</div>
<div class="backdrop-blur-md">Medium backdrop blur</div>
<div class="backdrop-blur-lg">Large backdrop blur</div>
<div class="backdrop-blur-xl">Extra backdrop blur</div>
```

---

## Other Filters

### Brightness
```html
<img class="brightness-50">50% brightness</img>
<img class="brightness-100">Normal</img>
<img class="brightness-150">150% brightness</img>
```

### Contrast
```html
<img class="contrast-50">Low contrast</img>
<img class="contrast-100">Normal</img>
<img class="contrast-200">High contrast</img>
```

### Grayscale
```html
<img class="grayscale">Full grayscale</img>
<img class="grayscale-0">No grayscale</img>
```

### Hue Rotate
```html
<img class="hue-rotate-90">Rotate hue 90°</img>
<img class="hue-rotate-180">Rotate hue 180°</img>
```

### Invert
```html
<img class="invert">Fully inverted</img>
<img class="invert-0">Normal</img>
```

### Saturate
```html
<img class="saturate-50">Desaturated</img>
<img class="saturate-100">Normal</img>
<img class="saturate-200">Oversaturated</img>
```

### Sepia
```html
<img class="sepia">Full sepia</img>
<img class="sepia-0">Normal</img>
```

---

## Mix Blend Mode

```html
<div class="mix-blend-multiply">Multiply</div>
<div class="mix-blend-screen">Screen</div>
<div class="mix-blend-overlay">Overlay</div>
<div class="mix-blend-darken">Darken</div>
<div class="mix-blend-lighten">Lighten</div>
<div class="mix-blend-color-dodge">Color dodge</div>
<div class="mix-blend-difference">Difference</div>
```

---

## Common Patterns

### Glassmorphism Card
```html
<div class="bg-white/10 backdrop-blur-lg rounded-2xl 
            border border-white/20 p-8 shadow-xl">
  <h2 class="text-white text-2xl font-bold">Glass Card</h2>
  <p class="text-white/80 mt-2">Frosted glass effect</p>
</div>
```

### Elevated Card (Multiple Shadows)
```html
<div class="bg-white rounded-xl p-6 
            shadow-lg shadow-gray-200/50 
            hover:shadow-xl hover:shadow-gray-300/50 
            transition-shadow duration-300">
  Elevated card with smooth shadow transition
</div>
```

### Image with Hover Effect
```html
<img class="rounded-lg grayscale hover:grayscale-0 
            transition duration-500 ease-in-out
            hover:scale-105"
     src="photo.jpg" alt="Photo">
```

### Overlay on Image
```html
<div class="relative group">
  <img class="w-full h-64 object-cover rounded-lg" src="photo.jpg">
  <div class="absolute inset-0 bg-black/0 group-hover:bg-black/50 
              transition rounded-lg flex items-center justify-center">
    <p class="text-white opacity-0 group-hover:opacity-100 transition">
      View Details
    </p>
  </div>
</div>
```

### Neon Glow Effect
```html
<button class="bg-cyan-500 text-white px-6 py-3 rounded-lg 
               shadow-lg shadow-cyan-500/50 
               hover:shadow-xl hover:shadow-cyan-500/70 
               transition-shadow">
  Neon Button
</button>
```
