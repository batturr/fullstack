# 16. Transforms & 3D

## 2D Transforms

### Translate (Move)

```html
<!-- Axis-specific -->
<div class="translate-x-4">Move right 1rem</div>
<div class="-translate-x-4">Move left 1rem</div>
<div class="translate-y-4">Move down 1rem</div>
<div class="-translate-y-4">Move up 1rem</div>

<!-- Percentage -->
<div class="translate-x-1/2">Move right 50%</div>
<div class="-translate-x-1/2">Move left 50%</div>
<div class="translate-y-full">Move down 100%</div>

<!-- Both axes -->
<div class="translate-x-4 translate-y-2">Move right and down</div>

<!-- Arbitrary -->
<div class="translate-x-[120px]">Custom translate</div>
```

### Centering Trick
```html
<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
  Perfectly centered (absolute)
</div>
```

---

### Scale

```html
<div class="scale-0">Hidden (0%)</div>
<div class="scale-50">Half size</div>
<div class="scale-75">75% size</div>
<div class="scale-90">90% size</div>
<div class="scale-100">Normal (default)</div>
<div class="scale-105">Slightly larger</div>
<div class="scale-110">10% larger</div>
<div class="scale-125">25% larger</div>
<div class="scale-150">50% larger</div>

<!-- Axis-specific -->
<div class="scale-x-50">Squish horizontally</div>
<div class="scale-y-150">Stretch vertically</div>
```

---

### Rotate

```html
<div class="rotate-0">No rotation</div>
<div class="rotate-1">1 degree</div>
<div class="rotate-2">2 degrees</div>
<div class="rotate-3">3 degrees</div>
<div class="rotate-6">6 degrees</div>
<div class="rotate-12">12 degrees</div>
<div class="rotate-45">45 degrees</div>
<div class="rotate-90">90 degrees</div>
<div class="rotate-180">180 degrees</div>
<div class="-rotate-45">-45 degrees</div>

<!-- Arbitrary -->
<div class="rotate-[17deg]">17 degrees</div>
```

---

### Skew

```html
<div class="skew-x-3">Skew X 3°</div>
<div class="skew-x-6">Skew X 6°</div>
<div class="skew-x-12">Skew X 12°</div>
<div class="skew-y-3">Skew Y 3°</div>
<div class="-skew-x-6">Negative skew</div>
```

---

### Transform Origin

```html
<div class="origin-center">Center (default)</div>
<div class="origin-top">Top</div>
<div class="origin-top-right">Top right</div>
<div class="origin-right">Right</div>
<div class="origin-bottom-right">Bottom right</div>
<div class="origin-bottom">Bottom</div>
<div class="origin-bottom-left">Bottom left</div>
<div class="origin-left">Left</div>
<div class="origin-top-left">Top left</div>
```

---

## 3D Transforms (v4 New)

### Perspective

```html
<!-- Perspective on parent -->
<div class="perspective-dramatic">100px perspective</div>
<div class="perspective-near">300px perspective</div>
<div class="perspective-normal">500px perspective</div>
<div class="perspective-midrange">800px perspective</div>
<div class="perspective-distant">1200px perspective</div>
<div class="perspective-none">No perspective</div>

<!-- Arbitrary -->
<div class="perspective-[600px]">Custom perspective</div>
```

### Perspective Origin
```html
<div class="perspective-origin-center">Center (default)</div>
<div class="perspective-origin-top">Top</div>
<div class="perspective-origin-bottom-right">Bottom right</div>
```

### Transform Style
```html
<div class="transform-3d">preserve-3d (enables 3D for children)</div>
<div class="transform-flat">flat (default)</div>
```

### 3D Rotate

```html
<!-- Rotate around X axis (tilt forward/backward) -->
<div class="rotate-x-0">No X rotation</div>
<div class="rotate-x-12">Tilt 12° forward</div>
<div class="rotate-x-45">Tilt 45° forward</div>
<div class="rotate-x-90">Tilt 90° forward</div>

<!-- Rotate around Y axis (turn left/right) -->
<div class="rotate-y-12">Turn 12° right</div>
<div class="rotate-y-45">Turn 45° right</div>
<div class="rotate-y-180">Flip horizontally</div>

<!-- Rotate around Z axis (normal 2D rotation) -->
<div class="rotate-z-45">Same as rotate-45</div>
```

### 3D Translate

```html
<!-- Move along Z axis (toward/away from viewer) -->
<div class="translate-z-4">Move toward viewer</div>
<div class="-translate-z-4">Move away from viewer</div>
<div class="translate-z-12">More toward viewer</div>
```

### 3D Scale

```html
<div class="scale-z-50">Scale Z axis to 50%</div>
<div class="scale-z-150">Scale Z axis to 150%</div>
```

### Backface Visibility

```html
<div class="backface-visible">Show back face</div>
<div class="backface-hidden">Hide back face</div>
```

---

## 3D Transform Examples

### 3D Card Effect
```html
<div class="perspective-distant">
  <article class="rotate-x-51 rotate-z-43 transform-3d 
                  bg-white rounded-xl shadow-xl p-6
                  transition-transform duration-500
                  hover:rotate-x-0 hover:rotate-z-0">
    <h2 class="font-bold text-xl">3D Card</h2>
    <p class="text-gray-600 mt-2">Hover to flatten</p>
  </article>
</div>
```

### Flip Card
```html
<div class="perspective-normal group">
  <div class="relative size-64 transition-transform duration-700 transform-3d 
              group-hover:rotate-y-180">
    <!-- Front -->
    <div class="absolute inset-0 bg-blue-500 text-white rounded-xl 
                flex items-center justify-center backface-hidden">
      Front Side
    </div>
    <!-- Back -->
    <div class="absolute inset-0 bg-purple-500 text-white rounded-xl 
                flex items-center justify-center backface-hidden rotate-y-180">
      Back Side
    </div>
  </div>
</div>
```

### 3D Tilt on Hover
```html
<div class="perspective-midrange">
  <div class="bg-white rounded-xl shadow-lg p-8
              transition-transform duration-300 ease-out
              hover:rotate-x-6 hover:-rotate-y-6">
    <h3 class="text-xl font-bold">Tilt Card</h3>
    <p class="text-gray-600">Tilts on hover</p>
  </div>
</div>
```

---

## Common 2D Transform Patterns

### Hover Scale Up
```html
<div class="transition-transform duration-300 hover:scale-105">
  Grows on hover
</div>
```

### Hover Lift (Translate + Shadow)
```html
<div class="transition-all duration-300 
            hover:-translate-y-1 hover:shadow-lg">
  Lifts on hover
</div>
```

### Button Press Effect
```html
<button class="transition-transform 
               active:scale-95 active:translate-y-0.5">
  Press me
</button>
```

### Image Zoom in Container
```html
<div class="overflow-hidden rounded-lg">
  <img class="w-full transition-transform duration-500 hover:scale-110"
       src="photo.jpg" alt="">
</div>
```
