# 05. Colors

## Tailwind CSS v4 Color System

Tailwind v4 uses **OKLCH** color space (modernized P3 gamut) for more vivid, wider-gamut colors.

### Color Format Comparison

```css
/* v3 — sRGB (rgb) */
--color-blue-500: rgb(59, 130, 246);

/* v4 — OKLCH (wider gamut) */
--color-blue-500: oklch(62.3% 0.214 259.815);
```

---

## Default Color Palette

Tailwind includes 22 color families, each with 11 shades (50-950):

| Color | Example Classes |
|-------|----------------|
| `red` | `text-red-500`, `bg-red-100`, `border-red-300` |
| `orange` | `text-orange-500`, `bg-orange-100` |
| `amber` | `text-amber-500`, `bg-amber-100` |
| `yellow` | `text-yellow-500`, `bg-yellow-100` |
| `lime` | `text-lime-500`, `bg-lime-100` |
| `green` | `text-green-500`, `bg-green-100` |
| `emerald` | `text-emerald-500`, `bg-emerald-100` |
| `teal` | `text-teal-500`, `bg-teal-100` |
| `cyan` | `text-cyan-500`, `bg-cyan-100` |
| `sky` | `text-sky-500`, `bg-sky-100` |
| `blue` | `text-blue-500`, `bg-blue-100` |
| `indigo` | `text-indigo-500`, `bg-indigo-100` |
| `violet` | `text-violet-500`, `bg-violet-100` |
| `purple` | `text-purple-500`, `bg-purple-100` |
| `fuchsia` | `text-fuchsia-500`, `bg-fuchsia-100` |
| `pink` | `text-pink-500`, `bg-pink-100` |
| `rose` | `text-rose-500`, `bg-rose-100` |
| `slate` | `text-slate-500`, `bg-slate-100` |
| `gray` | `text-gray-500`, `bg-gray-100` |
| `zinc` | `text-zinc-500`, `bg-zinc-100` |
| `neutral` | `text-neutral-500`, `bg-neutral-100` |
| `stone` | `text-stone-500`, `bg-stone-100` |

Plus: `black` and `white`

### Shade Scale

```
50   → Lightest (near white)
100  → Very light
200  → Light
300  → Medium light
400  → Medium
500  → Base / Default
600  → Medium dark
700  → Dark
800  → Very dark
900  → Near black
950  → Darkest
```

---

## Color Utilities

### Text Color
```html
<p class="text-gray-900">Very dark gray (common for body text)</p>
<p class="text-red-500">Red text</p>
<p class="text-indigo-600">Indigo text</p>
```

### Background Color
```html
<div class="bg-white">White background</div>
<div class="bg-gray-100">Light gray background</div>
<div class="bg-indigo-600">Indigo background</div>
```

### Border Color
```html
<div class="border border-gray-300">Gray border</div>
<input class="border-2 border-blue-500 focus:border-blue-700">
```

### Ring Color
```html
<button class="ring-2 ring-blue-500">Blue ring</button>
<button class="focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
  Focused ring
</button>
```

### Divide Color
```html
<div class="divide-y divide-gray-200">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Placeholder Color
```html
<input class="placeholder-gray-400" placeholder="Enter your name">
```

---

## Opacity Modifier

Control color opacity with the `/` syntax:

```html
<!-- Background opacity -->
<div class="bg-black/50">50% black overlay</div>
<div class="bg-blue-500/75">75% blue</div>
<div class="bg-white/10">10% white (subtle)</div>

<!-- Text opacity -->
<p class="text-white/80">80% white text</p>

<!-- Border opacity -->
<div class="border border-black/20">20% black border</div>

<!-- Arbitrary opacity -->
<div class="bg-indigo-600/[0.33]">33% indigo</div>
```

### Generated CSS (v4 uses color-mix):
```css
.bg-blue-500\/50 {
  background-color: color-mix(in oklab, var(--color-blue-500) 50%, transparent);
}
```

---

## Custom Colors with @theme

### Add New Colors
```css
@import "tailwindcss";

@theme {
  --color-brand: #0fa9e6;
  --color-brand-light: #3fbaeb;
  --color-brand-dark: #0c87b8;
}
```

```html
<span class="text-brand">Brand color</span>
<div class="bg-brand-light">Light brand background</div>
```

### Color with Shade Scale
```css
@import "tailwindcss";

@theme {
  --color-primary-100: #cffafe;
  --color-primary-200: #a5f3fc;
  --color-primary-300: #67e8f9;
  --color-primary-400: #22d3ee;
  --color-primary-500: #06b6d4;
  --color-primary-600: #0891b2;
  --color-primary-700: #0e7490;
  --color-primary-800: #155e75;
  --color-primary-900: #164e63;
}
```

```html
<h1 class="text-primary-700">Dark primary heading</h1>
<button class="bg-primary-500 hover:bg-primary-600">Primary button</button>
```

### Replace Entire Color Palette
```css
@import "tailwindcss";

@theme {
  --color-*: initial;  /* Remove all default colors */
  
  --color-black: #000;
  --color-white: #fff;
  --color-primary: #3f3cbb;
  --color-secondary: #78dcca;
  --color-accent: #121063;
}
```

---

## Using OKLCH Colors

OKLCH provides perceptually uniform colors with wider gamut:

```css
@theme {
  --color-vivid-blue: oklch(0.623 0.214 259.815);
  --color-vivid-green: oklch(0.723 0.219 149.579);
  --color-vivid-purple: oklch(0.606 0.25 292.717);
}
```

### OKLCH Format
```
oklch(lightness chroma hue)
  - lightness: 0 (black) to 1 (white)
  - chroma: 0 (gray) to ~0.4 (most vivid)
  - hue: 0-360 (color wheel angle)
```

---

## Color Tips

### 1. Use Dark Gray Instead of Black
```html
<!-- ❌ Pure black (harsh on eyes) -->
<p class="text-black">Hard to read</p>

<!-- ✅ Very dark gray (easier on eyes) -->
<p class="text-gray-900">Much better</p>
```

### 2. Adjacent Text Colors for Hierarchy
```html
<h1 class="text-gray-900">Heading (darkest)</h1>
<p class="text-gray-600">Body text (medium)</p>
<span class="text-gray-400">Muted text (lightest)</span>
```

### 3. Accessible Color Contrast
```html
<!-- ✅ Good contrast -->
<div class="bg-white text-gray-900">Dark on light</div>
<div class="bg-gray-900 text-white">Light on dark</div>

<!-- ❌ Poor contrast -->
<div class="bg-gray-200 text-gray-400">Hard to read</div>
```

### 4. Consistent Color Usage
```html
<!-- Use same color family for related elements -->
<button class="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 
               focus:ring-indigo-500 text-white">
  Consistent indigo theming
</button>
```

---

## Arbitrary Color Values

```html
<!-- Hex -->
<div class="bg-[#1da1f2]">Twitter blue</div>

<!-- RGB -->
<div class="bg-[rgb(255,115,0)]">Custom orange</div>

<!-- HSL -->
<div class="bg-[hsl(200,100%,50%)]">Custom blue</div>

<!-- OKLCH -->
<div class="bg-[oklch(0.7_0.15_200)]">Custom oklch</div>

<!-- currentColor -->
<div class="text-blue-500 border-current">Border matches text</div>
```
