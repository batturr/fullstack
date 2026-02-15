# 06. Typography

## Font Family

### Default Families
```html
<p class="font-sans">Default sans-serif (system UI fonts)</p>
<p class="font-serif">Serif font (Georgia, Times New Roman)</p>
<p class="font-mono">Monospace font (Consolas, Monaco)</p>
```

### Custom Font Family
```css
@import "tailwindcss";

@theme {
  --font-poppins: Poppins, sans-serif;
  --font-headline: "Playfair Display", serif;
}
```

```html
<h1 class="font-headline">Beautiful Headline</h1>
<p class="font-poppins">Body text in Poppins</p>
```

> **Tip:** Don't forget to include the font files or Google Fonts link in your project.

---

## Font Size

### Default Scale

| Class | Font Size | Line Height |
|-------|-----------|-------------|
| `text-xs` | 0.75rem (12px) | 1rem |
| `text-sm` | 0.875rem (14px) | 1.25rem |
| `text-base` | 1rem (16px) | 1.5rem |
| `text-lg` | 1.125rem (18px) | 1.75rem |
| `text-xl` | 1.25rem (20px) | 1.75rem |
| `text-2xl` | 1.5rem (24px) | 2rem |
| `text-3xl` | 1.875rem (30px) | 2.25rem |
| `text-4xl` | 2.25rem (36px) | 2.5rem |
| `text-5xl` | 3rem (48px) | 1 |
| `text-6xl` | 3.75rem (60px) | 1 |
| `text-7xl` | 4.5rem (72px) | 1 |
| `text-8xl` | 6rem (96px) | 1 |
| `text-9xl` | 8rem (128px) | 1 |

```html
<h1 class="text-4xl">Large Heading</h1>
<h2 class="text-2xl">Medium Heading</h2>
<p class="text-base">Body text</p>
<small class="text-sm">Small text</small>
```

### Arbitrary Font Size
```html
<p class="text-[22px]">Custom 22px text</p>
<p class="text-[1.375rem]">Custom rem size</p>
```

---

## Font Weight

| Class | Weight |
|-------|--------|
| `font-thin` | 100 |
| `font-extralight` | 200 |
| `font-light` | 300 |
| `font-normal` | 400 |
| `font-medium` | 500 |
| `font-semibold` | 600 |
| `font-bold` | 700 |
| `font-extrabold` | 800 |
| `font-black` | 900 |

```html
<p class="font-light">Light weight text</p>
<p class="font-normal">Normal weight text</p>
<p class="font-bold">Bold text</p>
<p class="font-black">Black (heaviest) text</p>
```

---

## Font Style
```html
<p class="italic">Italic text</p>
<p class="not-italic">Not italic (reset)</p>
```

---

## Letter Spacing (Tracking)

| Class | Value |
|-------|-------|
| `tracking-tighter` | -0.05em |
| `tracking-tight` | -0.025em |
| `tracking-normal` | 0em |
| `tracking-wide` | 0.025em |
| `tracking-wider` | 0.05em |
| `tracking-widest` | 0.1em |

```html
<h1 class="tracking-tight">Tight heading</h1>
<span class="uppercase tracking-wider text-sm font-semibold">Label</span>
```

> **Tip:** When using `uppercase`, increase letter spacing with `tracking-wider` or `tracking-widest` for better readability.

---

## Line Height (Leading)

| Class | Value |
|-------|-------|
| `leading-tight` | 1.25 |
| `leading-snug` | 1.375 |
| `leading-normal` | 1.5 |
| `leading-relaxed` | 1.625 |
| `leading-loose` | 2 |

```html
<p class="leading-tight">Tightly spaced lines</p>
<p class="leading-relaxed">Comfortably spaced lines</p>
<p class="leading-loose">Very spacious lines</p>

<!-- Arbitrary value -->
<p class="leading-[3rem]">Custom line height</p>
```

---

## Text Alignment
```html
<p class="text-left">Left aligned</p>
<p class="text-center">Center aligned</p>
<p class="text-right">Right aligned</p>
<p class="text-justify">Justified text</p>
<p class="text-start">Start (respects RTL)</p>
<p class="text-end">End (respects RTL)</p>
```

---

## Text Decoration
```html
<a class="underline">Underlined</a>
<a class="overline">Overlined</a>
<a class="line-through">Strikethrough</a>
<a class="no-underline">No decoration</a>

<!-- Decoration style -->
<a class="underline decoration-wavy">Wavy underline</a>
<a class="underline decoration-dotted">Dotted underline</a>
<a class="underline decoration-dashed">Dashed underline</a>
<a class="underline decoration-double">Double underline</a>

<!-- Decoration color -->
<a class="underline decoration-blue-500">Blue underline</a>

<!-- Decoration thickness -->
<a class="underline decoration-2">2px underline</a>
<a class="underline decoration-4">4px underline</a>

<!-- Underline offset -->
<a class="underline underline-offset-4">Offset underline</a>
```

---

## Text Transform
```html
<p class="uppercase">UPPERCASE TEXT</p>
<p class="lowercase">lowercase text</p>
<p class="capitalize">Capitalize Each Word</p>
<p class="normal-case">Normal case (reset)</p>
```

---

## Text Overflow & Wrapping
```html
<!-- Truncate with ellipsis (single line) -->
<p class="truncate">Very long text that will be truncated...</p>

<!-- Line clamp (multi-line truncation) -->
<p class="line-clamp-3">Will show only 3 lines then ellipsis...</p>

<!-- Text overflow -->
<p class="overflow-ellipsis overflow-hidden">Ellipsis overflow</p>
<p class="overflow-clip">Clip overflow</p>

<!-- Word break -->
<p class="break-words">Break long words</p>
<p class="break-all">Break at any character</p>
<p class="break-keep">Keep words together</p>

<!-- Whitespace -->
<p class="whitespace-nowrap">No wrapping</p>
<p class="whitespace-pre">Preserve whitespace</p>
<p class="whitespace-pre-line">Preserve newlines only</p>
```

---

## Text Wrap
```html
<h1 class="text-wrap">Normal wrapping</h1>
<h1 class="text-nowrap">No wrapping</h1>
<h1 class="text-balance">Balanced wrapping (CSS text-wrap: balance)</h1>
<h1 class="text-pretty">Pretty wrapping (avoids orphans)</h1>
```

---

## Text Shadow (v4 New)
```html
<h1 class="text-shadow-sm">Small text shadow</h1>
<h1 class="text-shadow-md">Medium text shadow</h1>
<h1 class="text-shadow-lg">Large text shadow</h1>
```

---

## Font Stretch (v4 New)
```html
<!-- For variable fonts with width axis -->
<p class="font-stretch-condensed">Condensed</p>
<p class="font-stretch-expanded">Expanded</p>
<p class="font-stretch-75%">75% width</p>
```

---

## Complete Typography Example

```html
<article class="max-w-prose mx-auto">
  <span class="text-sm font-semibold uppercase tracking-wider text-indigo-600">
    Featured Article
  </span>
  
  <h1 class="mt-2 text-4xl font-bold tracking-tight text-gray-900 text-pretty">
    Building Beautiful Interfaces with Tailwind CSS
  </h1>
  
  <p class="mt-4 text-lg leading-relaxed text-gray-600">
    Tailwind CSS provides a comprehensive set of typography utilities 
    that make it easy to create beautiful, readable text without 
    writing any custom CSS.
  </p>
  
  <p class="mt-4 text-base leading-relaxed text-gray-500">
    Using a combination of font sizes, weights, colors, and spacing,
    you can create clear visual hierarchies that guide the reader's eye.
  </p>
  
  <a href="#" class="mt-4 inline-block text-indigo-600 font-medium 
                      underline decoration-indigo-300 underline-offset-4 
                      hover:text-indigo-500 hover:decoration-indigo-400 
                      transition">
    Read more →
  </a>
</article>
```
