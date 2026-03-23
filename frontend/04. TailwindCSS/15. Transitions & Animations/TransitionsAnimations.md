# 15. Transitions & Animations

## Transition Property

```html
<!-- Common transition subsets -->
<div class="transition">transition: all (color, bg, border, shadow, opacity, transform)</div>
<div class="transition-colors">Only color transitions</div>
<div class="transition-opacity">Only opacity</div>
<div class="transition-shadow">Only shadow</div>
<div class="transition-transform">Only transform</div>
<div class="transition-all">Literally everything</div>
<div class="transition-none">No transitions</div>

<!-- Discrete transitions (v4 New) -->
<div class="transition-discrete">Allow transitioning discrete properties (display, etc.)</div>
```

---

## Duration

```html
<div class="transition duration-75">75ms</div>
<div class="transition duration-100">100ms</div>
<div class="transition duration-150">150ms (default)</div>
<div class="transition duration-200">200ms</div>
<div class="transition duration-300">300ms</div>
<div class="transition duration-500">500ms</div>
<div class="transition duration-700">700ms</div>
<div class="transition duration-1000">1000ms</div>

<!-- Arbitrary -->
<div class="transition duration-[2000ms]">2 seconds</div>
```

---

## Timing Function (Easing)

```html
<div class="transition ease-linear">Linear (constant speed)</div>
<div class="transition ease-in">Ease in (slow start)</div>
<div class="transition ease-out">Ease out (slow end)</div>
<div class="transition ease-in-out">Ease in-out</div>

<!-- Custom cubic-bezier -->
<div class="transition ease-[cubic-bezier(0.95,0.05,0.795,0.035)]">Custom easing</div>
```

### Custom Easing in Theme
```css
@import "tailwindcss";

@theme {
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

```html
<div class="transition ease-fluid">Fluid easing</div>
<div class="transition ease-bounce">Bouncy easing</div>
```

---

## Delay

```html
<div class="transition delay-75">75ms delay</div>
<div class="transition delay-100">100ms delay</div>
<div class="transition delay-150">150ms delay</div>
<div class="transition delay-200">200ms delay</div>
<div class="transition delay-300">300ms delay</div>
<div class="transition delay-500">500ms delay</div>
<div class="transition delay-700">700ms delay</div>
<div class="transition delay-1000">1 second delay</div>
```

---

## Built-in Animations

### Spin
```html
<svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
  <!-- Loading spinner SVG -->
</svg>
```

### Ping
```html
<!-- Notification badge pulse -->
<span class="relative flex h-3 w-3">
  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
  <span class="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
</span>
```

### Pulse
```html
<!-- Loading skeleton -->
<div class="animate-pulse flex space-x-4">
  <div class="rounded-full bg-gray-300 h-10 w-10"></div>
  <div class="flex-1 space-y-4 py-1">
    <div class="h-4 bg-gray-300 rounded w-3/4"></div>
    <div class="h-4 bg-gray-300 rounded"></div>
  </div>
</div>
```

### Bounce
```html
<svg class="animate-bounce w-6 h-6 text-gray-900">
  <!-- Down arrow icon -->
</svg>
```

---

## Custom Animations with @theme

```css
@import "tailwindcss";

@theme {
  /* Fade in */
  --animate-fade-in: fade-in 0.5s ease-out;
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  /* Fade in + scale */
  --animate-fade-in-scale: fade-in-scale 0.3s ease-out;
  @keyframes fade-in-scale {
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }
  
  /* Slide in from bottom */
  --animate-slide-up: slide-up 0.4s ease-out;
  @keyframes slide-up {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  /* Shake */
  --animate-shake: shake 0.5s ease-in-out;
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  /* Wiggle */
  --animate-wiggle: wiggle 1s ease-in-out infinite;
  @keyframes wiggle {
    0%, 100% { transform: rotate(-3deg); }
    50% { transform: rotate(3deg); }
  }
}
```

```html
<div class="animate-fade-in">Fades in</div>
<div class="animate-fade-in-scale">Fades in with scale</div>
<div class="animate-slide-up">Slides up</div>
<div class="animate-shake">Shakes</div>
<div class="animate-wiggle">Wiggles forever</div>
```

---

## Common Transition Patterns

### Hover Button
```html
<button class="bg-indigo-600 text-white px-5 py-3 rounded-lg
               hover:bg-indigo-500 hover:-translate-y-0.5 
               active:bg-indigo-700
               transition duration-200 ease-out
               focus:outline-none focus:ring focus:ring-offset-2 
               focus:ring-indigo-500 focus:ring-opacity-50">
  Animated Button
</button>
```

### Card Hover Lift
```html
<div class="bg-white rounded-xl shadow-md p-6
            hover:shadow-xl hover:-translate-y-1
            transition-all duration-300 ease-out">
  Card that lifts on hover
</div>
```

### Smooth Color Change
```html
<a class="text-gray-600 hover:text-indigo-600 transition-colors duration-200">
  Color changes smoothly
</a>
```

### Expand on Hover
```html
<img class="w-full h-48 object-cover transition-transform duration-500 
            hover:scale-110"
     src="photo.jpg">
```

### Staggered Animation (with delay)
```html
<div class="space-y-4">
  <div class="animate-fade-in delay-0">First item</div>
  <div class="animate-fade-in delay-100">Second item</div>
  <div class="animate-fade-in delay-200">Third item</div>
  <div class="animate-fade-in delay-300">Fourth item</div>
</div>
```

### Loading Skeleton
```html
<div class="animate-pulse space-y-4">
  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
  <div class="h-4 bg-gray-200 rounded w-full"></div>
  <div class="h-4 bg-gray-200 rounded w-5/6"></div>
  <div class="flex items-center gap-4 mt-6">
    <div class="size-12 bg-gray-200 rounded-full"></div>
    <div class="flex-1 space-y-2">
      <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      <div class="h-3 bg-gray-200 rounded w-1/3"></div>
    </div>
  </div>
</div>
```

### Menu Toggle
```html
<div class="overflow-hidden transition-all duration-300 ease-in-out"
     :class="isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'">
  Menu content
</div>
```
