# 01. Introduction to Tailwind CSS

## What is Tailwind CSS?

Tailwind CSS is a **utility-first CSS framework** that allows developers to style their websites directly within HTML using concise utility classes. Unlike traditional CSS frameworks (Bootstrap, Foundation), Tailwind doesn't provide pre-built components — instead, it provides low-level utility classes that you compose to build custom designs.

```html
<!-- Traditional CSS approach -->
<div class="card">
  <h2 class="card-title">Hello</h2>
</div>

<!-- Tailwind CSS approach -->
<div class="bg-white rounded-lg shadow-md p-6">
  <h2 class="text-xl font-bold text-gray-900">Hello</h2>
</div>
```

## Tailwind CSS v4.0 — What's New?

Tailwind CSS v4.0 (released January 22, 2025) is a **ground-up rewrite** of the framework. Key highlights:

| Feature | Description |
|---------|-------------|
| **New Engine** | Full builds 3.5x+ faster, incremental builds 8x+ faster (microseconds!) |
| **CSS-First Config** | Configure in CSS with `@theme` instead of `tailwind.config.js` |
| **Zero Config** | No `content` array needed — automatic content detection |
| **Modern CSS** | Uses cascade layers, `@property`, `color-mix()`, logical properties |
| **One-Line Setup** | Just `@import "tailwindcss"` — no more `@tailwind` directives |
| **Vite Plugin** | First-party `@tailwindcss/vite` for best performance |
| **P3 Colors** | Modernized color palette using OKLCH for wider gamut |
| **Container Queries** | Built into core, no plugin needed |
| **3D Transforms** | New `rotate-x-*`, `rotate-y-*`, `scale-z-*`, `perspective-*` |
| **@starting-style** | CSS enter/exit transitions without JavaScript |

## Why Use Tailwind CSS?

### 1. Utility-First Approach
Build custom designs without writing custom CSS. Each class does one thing:

```html
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Click me
</button>
```

### 2. No Complex Class Names
No need for BEM, SMACSS, or other naming conventions:

```html
<!-- BEM approach (traditional) -->
<div class="card__header card__header--featured">...</div>

<!-- Tailwind approach -->
<div class="bg-indigo-500 text-white px-4 py-2 rounded-t-lg">...</div>
```

### 3. Responsive by Default
Built-in responsive prefixes make mobile-first design effortless:

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  <!-- Responsive grid without writing media queries -->
</div>
```

### 4. Minimized CSS Output
Tailwind scans your HTML and generates only the CSS you actually use — resulting in tiny production builds (often < 10KB gzipped).

### 5. Granular Control
Atomic-level control over every design detail:

```html
<p class="text-sm leading-relaxed tracking-wide text-gray-600 font-medium">
  Fine-tuned typography
</p>
```

## Tailwind vs Bootstrap vs Other Frameworks

| Feature | Tailwind CSS | Bootstrap | Foundation |
|---------|-------------|-----------|------------|
| Approach | Utility-first | Component-based | Component-based |
| Pre-built components | ❌ | ✅ | ✅ |
| Customization | Extremely flexible | Limited (overrides) | Moderate |
| File size (production) | Very small (purged) | ~160KB+ | ~150KB+ |
| Learning curve | Moderate | Low | Moderate |
| Responsive design | Utility classes | Grid system | Grid system |
| Design freedom | Full control | Looks like Bootstrap | More control |

## How Tailwind Works (Under the Hood)

```
1. You write HTML with utility classes
   ↓
2. Tailwind scans all your template files for class names
   ↓
3. It generates only the corresponding CSS styles
   ↓
4. Writes them to a static CSS file
   ↓
5. Zero-runtime — all CSS is generated at build time
```

## Example: Basic Tailwind Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="/src/style.css" rel="stylesheet">
</head>
<body class="bg-gray-100 min-h-screen">
  <div class="max-w-md mx-auto mt-10 bg-white rounded-xl shadow-md p-6">
    <h1 class="text-2xl font-bold text-gray-900">Welcome to Tailwind CSS v4</h1>
    <p class="mt-2 text-gray-600">
      A utility-first CSS framework for rapidly building custom designs.
    </p>
    <button class="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg 
                    hover:bg-indigo-500 transition">
      Get Started
    </button>
  </div>
</body>
</html>
```

## Key Terminology

| Term | Definition |
|------|-----------|
| **Utility class** | A single-purpose CSS class (e.g., `text-center`, `bg-red-500`) |
| **Design token** | A low-level design value (color, spacing, font) stored as a variable |
| **Theme variable** | CSS custom property defined via `@theme` that maps to utility classes |
| **Variant** | A prefix that applies styles conditionally (e.g., `hover:`, `dark:`, `md:`) |
| **Arbitrary value** | Custom values using bracket notation (e.g., `w-[137px]`, `text-[#1da1f2]`) |
| **Modifier** | A suffix that adjusts a utility (e.g., `bg-black/50` for 50% opacity) |
