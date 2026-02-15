# 03. Core Concepts - Utility First

## What is Utility-First CSS?

Instead of writing custom CSS for every component, you apply pre-existing utility classes directly in your HTML.

### Traditional CSS Approach

```css
/* styles.css */
.chat-notification {
  display: flex;
  align-items: center;
  max-width: 24rem;
  margin: 0 auto;
  padding: 1.5rem;
  border-radius: 0.5rem;
  background-color: #fff;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
.chat-notification-title {
  color: #1a202c;
  font-size: 1.25rem;
  line-height: 1.75rem;
  font-weight: 500;
}
```

```html
<div class="chat-notification">
  <h4 class="chat-notification-title">ChitChat</h4>
  <p class="chat-notification-message">You have a new message!</p>
</div>
```

### Tailwind Utility-First Approach

```html
<div class="flex items-center max-w-sm mx-auto p-6 rounded-lg bg-white shadow-xl">
  <h4 class="text-xl font-medium text-gray-900">ChitChat</h4>
  <p class="text-gray-500">You have a new message!</p>
</div>
```

No custom CSS needed! Every utility class maps to a single CSS property.

---

## How Utility Classes Work

Each utility class corresponds to a single CSS property-value pair:

| Utility Class | CSS Output |
|--------------|------------|
| `flex` | `display: flex` |
| `items-center` | `align-items: center` |
| `max-w-sm` | `max-width: 24rem` |
| `mx-auto` | `margin-left: auto; margin-right: auto` |
| `p-6` | `padding: 1.5rem` |
| `rounded-lg` | `border-radius: 0.5rem` |
| `bg-white` | `background-color: #fff` |
| `shadow-xl` | `box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1)...` |
| `text-xl` | `font-size: 1.25rem` |
| `font-medium` | `font-weight: 500` |
| `text-gray-900` | `color: oklch(21% 0.034 264.665)` |

---

## Design Principles

### 1. Never Leave Your HTML

Tailwind's core philosophy — style everything inline without switching between HTML and CSS files:

```html
<!-- Everything is right here in the HTML -->
<button class="bg-indigo-600 hover:bg-indigo-500 
               text-white font-semibold 
               px-5 py-3 rounded-lg 
               shadow-lg transition
               focus:outline-none focus:ring focus:ring-indigo-500">
  Book your escape
</button>
```

### 2. Mobile-First Responsive Design

Unprefixed utilities apply to all screen sizes. Responsive prefixes apply at specific breakpoints and above:

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- 1 column on mobile, 2 on sm, 4 on lg -->
</div>
```

### 3. State-Based Styling

Apply styles on hover, focus, active, and other states using variant prefixes:

```html
<a class="text-blue-600 hover:text-blue-800 
          hover:underline 
          focus:outline-none focus:ring-2 
          active:text-blue-900
          transition">
  Learn more
</a>
```

---

## Commonly Used Utility Categories

### Layout
```html
<div class="flex justify-between items-center">...</div>
<div class="grid grid-cols-3 gap-4">...</div>
<div class="block">...</div>
<div class="hidden md:block">...</div>
```

### Spacing
```html
<div class="p-4 m-2">Padding and margin</div>
<div class="px-6 py-3">Horizontal and vertical padding</div>
<div class="mt-8 mb-4">Top and bottom margin</div>
<div class="space-y-4">Vertical spacing between children</div>
```

### Typography
```html
<h1 class="text-4xl font-bold text-gray-900">Heading</h1>
<p class="text-base leading-relaxed text-gray-600">Paragraph</p>
<span class="text-sm font-medium uppercase tracking-wider">Label</span>
```

### Colors
```html
<div class="bg-blue-500 text-white">Blue background</div>
<div class="bg-gray-100 text-gray-800">Light gray</div>
<div class="border border-red-300">Red border</div>
```

### Sizing
```html
<div class="w-full h-screen">Full width, full viewport height</div>
<div class="w-64 h-32">Fixed width and height</div>
<div class="max-w-md mx-auto">Centered container</div>
<img class="size-12 rounded-full" src="avatar.jpg">  <!-- w-12 h-12 -->
```

---

## Arbitrary Values

When Tailwind's defaults aren't enough, use bracket notation for custom values:

```html
<!-- Custom values with square brackets -->
<div class="w-[137px]">Exact width</div>
<div class="bg-[#1da1f2]">Custom color</div>
<div class="text-[22px]">Custom font size</div>
<div class="grid grid-cols-[1fr_2fr_1fr]">Custom grid</div>
<div class="top-[calc(100%-2rem)]">Calculated value</div>
```

---

## Opacity Modifier

Use `/` to set opacity on any color utility:

```html
<div class="bg-black/50">50% black background</div>
<div class="bg-blue-500/75">75% opacity blue</div>
<div class="text-white/90">90% opacity white text</div>
<div class="border-red-500/30">30% opacity red border</div>
```

---

## Negative Values

Prefix with a dash for negative values:

```html
<div class="-mt-4">Negative top margin</div>
<div class="-translate-x-1/2">Negative translate</div>
<div class="-rotate-45">Negative rotation</div>
```

---

## Important Modifier

Prefix with `!` to make a utility `!important`:

```html
<div class="!text-red-500">This text will be red no matter what</div>
```

---

## Why Not Just Use Inline Styles?

| Feature | Tailwind Utilities | Inline Styles |
|---------|-------------------|---------------|
| Responsive design | `md:flex` | ❌ Not possible |
| Hover/Focus states | `hover:bg-blue-500` | ❌ Not possible |
| Design constraints | Limited to theme values | Any value |
| Consistency | Shared design tokens | Copy-paste prone |
| Dark mode | `dark:bg-gray-800` | ❌ Not possible |
| Performance | Generated at build | Duplicated in DOM |

---

## The "Ugly HTML" Concern

**Common worry:** "Won't my HTML be full of classes?"

**Answer:** Yes, and that's okay! Here's why:

1. **Co-location** — Styles are right next to the content they style
2. **No naming** — No need to invent class names like `.sidebar-inner-wrapper`
3. **No dead CSS** — Delete the HTML, the styles go with it
4. **Component extraction** — In React/Vue, components keep things clean:

```jsx
// React component — classes are contained in one place
function Button({ children }) {
  return (
    <button className="bg-indigo-600 hover:bg-indigo-500 
                        text-white font-semibold 
                        px-5 py-3 rounded-lg transition">
      {children}
    </button>
  );
}
```
