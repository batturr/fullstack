# 🎨 TailwindCSS 4 — 200 Real-Time Assignments with Answers

> **Organized by Level:** Beginner (1–70) | Intermediate (71–140) | Advanced (141–200)
> **Format:** Each assignment includes a task description, the expected TailwindCSS 4 classes/code, and a brief explanation.

---

## 📗 BEGINNER LEVEL (Assignments 1–70)

### Section A: Typography & Text Styling (1–15)

---

#### Assignment 1: Set Font Size to Extra Large
**Task:** Apply an extra-large font size to a heading.

```html
<h1 class="text-xl">Welcome to TailwindCSS 4</h1>
```

**Answer Explanation:** `text-xl` sets the font size to `1.25rem` (20px). Tailwind provides sizes from `text-xs` up to `text-9xl`.

---

#### Assignment 2: Make Text Bold
**Task:** Make a paragraph text bold.

```html
<p class="font-bold">This text is bold.</p>
```

**Answer Explanation:** `font-bold` applies `font-weight: 700`. Other options include `font-light`, `font-medium`, `font-semibold`, and `font-extrabold`.

---

#### Assignment 3: Center-Align Text
**Task:** Center the text inside a div.

```html
<div class="text-center">
  <p>This text is centered.</p>
</div>
```

**Answer Explanation:** `text-center` sets `text-align: center`. Alternatives: `text-left`, `text-right`, `text-justify`.

---

#### Assignment 4: Change Text Color
**Task:** Set paragraph text to blue-600.

```html
<p class="text-blue-600">This is blue text.</p>
```

**Answer Explanation:** `text-blue-600` applies a medium-dark blue. Tailwind 4 uses the same color palette with shades 50–950.

---

#### Assignment 5: Apply Italic Style
**Task:** Make a span of text italic.

```html
<span class="italic">This text is italic.</span>
```

**Answer Explanation:** `italic` applies `font-style: italic`. Use `not-italic` to remove it.

---

#### Assignment 6: Underline Text
**Task:** Add an underline to a link.

```html
<a href="#" class="underline">Click here</a>
```

**Answer Explanation:** `underline` applies `text-decoration-line: underline`. Related: `no-underline`, `line-through`, `overline`.

---

#### Assignment 7: Uppercase Text Transform
**Task:** Transform text to uppercase.

```html
<p class="uppercase">this will be uppercase</p>
```

**Answer Explanation:** `uppercase` applies `text-transform: uppercase`. Also: `lowercase`, `capitalize`, `normal-case`.

---

#### Assignment 8: Set Line Height
**Task:** Apply relaxed line height to a paragraph.

```html
<p class="leading-relaxed">
  This paragraph has a relaxed line height for better readability
  across multiple lines of text.
</p>
```

**Answer Explanation:** `leading-relaxed` sets `line-height: 1.625`. Options range from `leading-none` (1) to `leading-loose` (2).

---

#### Assignment 9: Letter Spacing
**Task:** Apply wide letter spacing to a heading.

```html
<h2 class="tracking-widest">SPACED OUT HEADING</h2>
```

**Answer Explanation:** `tracking-widest` sets `letter-spacing: 0.1em`. Options: `tracking-tighter`, `tracking-tight`, `tracking-normal`, `tracking-wide`, `tracking-wider`, `tracking-widest`.

---

#### Assignment 10: Truncate Overflowing Text
**Task:** Truncate text with an ellipsis when it overflows.

```html
<p class="truncate w-48">
  This is a very long text that will be truncated with an ellipsis at the end.
</p>
```

**Answer Explanation:** `truncate` applies `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`. Must be paired with a width constraint.

---

#### Assignment 11: Set Font Family to Monospace
**Task:** Display code-like text in a monospace font.

```html
<code class="font-mono">const x = 42;</code>
```

**Answer Explanation:** `font-mono` applies the monospace font stack. Also: `font-sans`, `font-serif`.

---

#### Assignment 12: Apply Text Shadow (TW4)
**Task:** Use Tailwind CSS 4's text shadow utility.

```html
<h1 class="text-shadow-sm text-4xl">Shadowed Heading</h1>
```

**Answer Explanation:** Tailwind CSS 4 introduces `text-shadow-*` utilities natively. `text-shadow-sm` adds a subtle shadow. Variants: `text-shadow-xs`, `text-shadow-sm`, `text-shadow-md`, `text-shadow-lg`.

---

#### Assignment 13: Set Word Break
**Task:** Allow long words to break and wrap.

```html
<p class="break-all w-32">
  Supercalifragilisticexpialidocious
</p>
```

**Answer Explanation:** `break-all` applies `word-break: break-all`, allowing breaks at any character. Alternative: `break-words` for softer wrapping.

---

#### Assignment 14: Apply Text Opacity
**Task:** Set text to 50% opacity.

```html
<p class="text-black/50">This text is semi-transparent.</p>
```

**Answer Explanation:** In Tailwind 4, use the `/` modifier for opacity. `text-black/50` means black at 50% opacity. This works with any color.

---

#### Assignment 15: Multi-line Text Clamp
**Task:** Clamp text to 3 lines.

```html
<p class="line-clamp-3">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
  tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
  quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
  consequat. Duis aute irure dolor in reprehenderit.
</p>
```

**Answer Explanation:** `line-clamp-3` limits visible text to 3 lines and adds ellipsis. Part of core Tailwind (no plugin needed in v4).

---

### Section B: Spacing — Padding & Margin (16–25)

---

#### Assignment 16: Add Padding on All Sides
**Task:** Add 16px padding to a box.

```html
<div class="p-4 bg-gray-200">Padded content</div>
```

**Answer Explanation:** `p-4` equals `padding: 1rem` (16px). The spacing scale: 1 = 0.25rem, 2 = 0.5rem, 4 = 1rem, 8 = 2rem, etc.

---

#### Assignment 17: Add Horizontal Padding Only
**Task:** Add padding only on left and right sides.

```html
<div class="px-6 bg-gray-200">Horizontal padding</div>
```

**Answer Explanation:** `px-6` applies `padding-left: 1.5rem; padding-right: 1.5rem`. `px` = padding x-axis.

---

#### Assignment 18: Add Vertical Margin
**Task:** Add vertical margin to space out a section.

```html
<section class="my-8">
  <p>Content with vertical margin.</p>
</section>
```

**Answer Explanation:** `my-8` applies `margin-top: 2rem; margin-bottom: 2rem`. `my` = margin y-axis.

---

#### Assignment 19: Auto Center with Margin
**Task:** Horizontally center a fixed-width element.

```html
<div class="mx-auto w-96 bg-blue-100 p-4">
  Centered container
</div>
```

**Answer Explanation:** `mx-auto` sets `margin-left: auto; margin-right: auto`, centering a block element with a defined width.

---

#### Assignment 20: Negative Margin
**Task:** Pull an element up by 4 units using negative margin.

```html
<div class="-mt-4 bg-red-200 p-4">
  Pulled upward with negative margin
</div>
```

**Answer Explanation:** `-mt-4` applies `margin-top: -1rem`. Negative margins use the `-` prefix before the utility name.

---

#### Assignment 21: Space Between Children
**Task:** Add vertical spacing between stacked items without margin on the last item.

```html
<div class="space-y-4">
  <div class="bg-blue-200 p-2">Item 1</div>
  <div class="bg-blue-200 p-2">Item 2</div>
  <div class="bg-blue-200 p-2">Item 3</div>
</div>
```

**Answer Explanation:** `space-y-4` adds `margin-top: 1rem` to every child except the first. Great for stacking elements with consistent gaps.

---

#### Assignment 22: Asymmetric Padding
**Task:** Apply different padding on each side of a box.

```html
<div class="pt-2 pr-4 pb-6 pl-8 bg-green-100">
  Asymmetric padding
</div>
```

**Answer Explanation:** Individual side padding: `pt` (top), `pr` (right), `pb` (bottom), `pl` (left). Each can have a different value.

---

#### Assignment 23: Add Margin to a Single Side
**Task:** Add margin only to the bottom of an element.

```html
<h2 class="mb-6">Section Title</h2>
<p>Content below the title.</p>
```

**Answer Explanation:** `mb-6` applies `margin-bottom: 1.5rem`. Single-side margin utilities: `mt`, `mr`, `mb`, `ml`.

---

#### Assignment 24: Responsive Padding
**Task:** Set padding that increases on larger screens.

```html
<div class="p-2 md:p-6 lg:p-10 bg-yellow-100">
  Responsive padding
</div>
```

**Answer Explanation:** Mobile-first responsive design. `p-2` is default, `md:p-6` applies at ≥768px, `lg:p-10` at ≥1024px.

---

#### Assignment 25: Space Between Horizontal Items
**Task:** Add horizontal spacing between inline items.

```html
<div class="flex space-x-4">
  <button class="bg-blue-500 text-white px-4 py-2">Btn 1</button>
  <button class="bg-blue-500 text-white px-4 py-2">Btn 2</button>
  <button class="bg-blue-500 text-white px-4 py-2">Btn 3</button>
</div>
```

**Answer Explanation:** `space-x-4` adds `margin-left: 1rem` to all children except the first. Pairs with `flex` for horizontal layouts.

---

### Section C: Backgrounds & Borders (26–35)

---

#### Assignment 26: Set Background Color
**Task:** Apply a light gray background to a section.

```html
<section class="bg-gray-100 p-6">
  Light background section
</section>
```

**Answer Explanation:** `bg-gray-100` sets a light gray background. Tailwind provides shades from 50 (lightest) to 950 (darkest).

---

#### Assignment 27: Add a Border
**Task:** Add a 1px solid border to a div.

```html
<div class="border border-gray-300 p-4">
  Bordered box
</div>
```

**Answer Explanation:** `border` applies a 1px solid border. `border-gray-300` sets its color. For thicker borders: `border-2`, `border-4`, `border-8`.

---

#### Assignment 28: Rounded Corners
**Task:** Apply medium rounded corners to a card.

```html
<div class="rounded-lg bg-white border p-6">
  Rounded card
</div>
```

**Answer Explanation:** `rounded-lg` sets `border-radius: 0.5rem`. Options: `rounded-sm`, `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`.

---

#### Assignment 29: Full Circle Element
**Task:** Create a circular avatar placeholder.

```html
<div class="w-16 h-16 rounded-full bg-blue-500"></div>
```

**Answer Explanation:** `rounded-full` sets `border-radius: 9999px`, making the element a perfect circle when width and height are equal.

---

#### Assignment 30: Border on One Side Only
**Task:** Add a border only on the left side.

```html
<div class="border-l-4 border-blue-500 pl-4">
  Left-bordered callout
</div>
```

**Answer Explanation:** `border-l-4` applies a 4px left border. Side-specific: `border-t`, `border-r`, `border-b`, `border-l`.

---

#### Assignment 31: Background Gradient
**Task:** Apply a gradient background from blue to purple.

```html
<div class="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-lg">
  Gradient background
</div>
```

**Answer Explanation:** `bg-gradient-to-r` sets direction (right). `from-blue-500` is start color, `to-purple-500` is end color. Directions: `to-t`, `to-tr`, `to-r`, `to-br`, `to-b`, `to-bl`, `to-l`, `to-tl`.

---

#### Assignment 32: Background Image with Cover
**Task:** Set a background image that covers the container.

```html
<div class="bg-cover bg-center bg-no-repeat h-64" style="background-image: url('/hero.jpg')">
  <h1 class="text-white text-4xl p-8">Hero Section</h1>
</div>
```

**Answer Explanation:** `bg-cover` ensures the image fills the container. `bg-center` centers it. `bg-no-repeat` prevents tiling.

---

#### Assignment 33: Ring Utility (Focus Ring)
**Task:** Add a ring around a button for focus styling.

```html
<button class="ring-2 ring-blue-500 px-4 py-2 rounded">
  Ringed Button
</button>
```

**Answer Explanation:** `ring-2` creates a 2px box-shadow ring. `ring-blue-500` sets its color. Rings don't affect layout unlike borders.

---

#### Assignment 34: Divide Between Items
**Task:** Add dividers between list items.

```html
<ul class="divide-y divide-gray-200">
  <li class="py-3">Item One</li>
  <li class="py-3">Item Two</li>
  <li class="py-3">Item Three</li>
</ul>
```

**Answer Explanation:** `divide-y` adds a top border to all children except the first. `divide-gray-200` sets divider color. Great for lists and tables.

---

#### Assignment 35: Outline Utility
**Task:** Apply an outline to an input field.

```html
<input type="text" class="outline-2 outline-blue-500 outline-offset-2 rounded p-2" placeholder="Focused input">
```

**Answer Explanation:** `outline-2` sets outline width. `outline-blue-500` sets color. `outline-offset-2` adds space between element and outline.

---

### Section D: Sizing — Width & Height (36–45)

---

#### Assignment 36: Fixed Width
**Task:** Set a div to 300px (w-72 ≈ 18rem) width.

```html
<div class="w-72 bg-gray-200 p-4">Fixed width box</div>
```

**Answer Explanation:** `w-72` sets `width: 18rem` (288px). Common widths: `w-32` (128px), `w-48` (192px), `w-64` (256px), `w-96` (384px).

---

#### Assignment 37: Full Width
**Task:** Make a div span the full width of its container.

```html
<div class="w-full bg-blue-200 p-4">Full width</div>
```

**Answer Explanation:** `w-full` sets `width: 100%`. The element takes all available horizontal space.

---

#### Assignment 38: Set a Fixed Height
**Task:** Create a box with a height of 10rem.

```html
<div class="h-40 bg-green-200 p-4">Tall box</div>
```

**Answer Explanation:** `h-40` sets `height: 10rem` (160px). The spacing scale works identically for height.

---

#### Assignment 39: Full Screen Height
**Task:** Make a section cover the full viewport height.

```html
<section class="h-screen bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center">
  <h1 class="text-white text-5xl">Full Screen Hero</h1>
</section>
```

**Answer Explanation:** `h-screen` sets `height: 100vh`. The element fills the entire viewport height.

---

#### Assignment 40: Min and Max Width
**Task:** Set a container with min and max width constraints.

```html
<div class="min-w-[200px] max-w-lg mx-auto bg-gray-100 p-6">
  Constrained container
</div>
```

**Answer Explanation:** `min-w-[200px]` uses arbitrary value syntax. `max-w-lg` sets `max-width: 32rem`. Tailwind 4 fully supports arbitrary values in brackets.

---

#### Assignment 41: Aspect Ratio
**Task:** Create a 16:9 aspect ratio container.

```html
<div class="aspect-video bg-gray-800 rounded-lg">
  <p class="text-white p-4">16:9 Container</p>
</div>
```

**Answer Explanation:** `aspect-video` applies `aspect-ratio: 16/9`. Also: `aspect-square` (1/1), `aspect-auto`, or arbitrary `aspect-[4/3]`.

---

#### Assignment 42: Size Utility (Width + Height)
**Task:** Create a square box using the `size` utility.

```html
<div class="size-20 bg-purple-500 rounded-lg"></div>
```

**Answer Explanation:** `size-20` sets both `width: 5rem` and `height: 5rem` simultaneously. New in Tailwind 4 as a first-class utility.

---

#### Assignment 43: Max Height with Scroll
**Task:** Create a scrollable box with max height.

```html
<div class="max-h-48 overflow-y-auto border rounded p-4">
  <p>Line 1</p><p>Line 2</p><p>Line 3</p><p>Line 4</p>
  <p>Line 5</p><p>Line 6</p><p>Line 7</p><p>Line 8</p>
  <p>Line 9</p><p>Line 10</p><p>Line 11</p><p>Line 12</p>
</div>
```

**Answer Explanation:** `max-h-48` limits height to 12rem. `overflow-y-auto` adds a vertical scrollbar when content exceeds the max height.

---

#### Assignment 44: Percentage Width
**Task:** Set an element to 50% width.

```html
<div class="w-1/2 bg-orange-200 p-4">Half width</div>
```

**Answer Explanation:** `w-1/2` sets `width: 50%`. Fractions available: `w-1/3`, `w-2/3`, `w-1/4`, `w-3/4`, `w-1/5`, etc.

---

#### Assignment 45: Fit Content Width
**Task:** Shrink a div to only fit its content.

```html
<div class="w-fit bg-teal-200 px-4 py-2 rounded">
  Fits content
</div>
```

**Answer Explanation:** `w-fit` sets `width: fit-content`. The element shrinks to the size of its content. Also: `w-min`, `w-max`.

---

### Section E: Flexbox Basics (46–55)

---

#### Assignment 46: Horizontal Flex Container
**Task:** Lay out three boxes in a horizontal row.

```html
<div class="flex">
  <div class="bg-red-200 p-4">Box 1</div>
  <div class="bg-green-200 p-4">Box 2</div>
  <div class="bg-blue-200 p-4">Box 3</div>
</div>
```

**Answer Explanation:** `flex` enables flexbox. Default direction is `row`, so children line up horizontally.

---

#### Assignment 47: Vertical Flex Container
**Task:** Stack items vertically.

```html
<div class="flex flex-col">
  <div class="bg-red-200 p-4">Top</div>
  <div class="bg-green-200 p-4">Middle</div>
  <div class="bg-blue-200 p-4">Bottom</div>
</div>
```

**Answer Explanation:** `flex-col` sets `flex-direction: column`, stacking children vertically.

---

#### Assignment 48: Center Items Both Axes
**Task:** Perfectly center a child element.

```html
<div class="flex items-center justify-center h-64 bg-gray-100">
  <p class="text-2xl">Centered!</p>
</div>
```

**Answer Explanation:** `items-center` vertically centers (align-items). `justify-center` horizontally centers (justify-content). Together they center on both axes.

---

#### Assignment 49: Space Between Items
**Task:** Push items to the edges with space between.

```html
<nav class="flex justify-between bg-gray-800 text-white p-4">
  <span>Logo</span>
  <span>Menu</span>
</nav>
```

**Answer Explanation:** `justify-between` applies `justify-content: space-between`, placing maximum space between items.

---

#### Assignment 50: Flex Wrap
**Task:** Allow flex items to wrap to the next line.

```html
<div class="flex flex-wrap gap-4">
  <div class="w-32 h-32 bg-blue-300">1</div>
  <div class="w-32 h-32 bg-blue-300">2</div>
  <div class="w-32 h-32 bg-blue-300">3</div>
  <div class="w-32 h-32 bg-blue-300">4</div>
  <div class="w-32 h-32 bg-blue-300">5</div>
</div>
```

**Answer Explanation:** `flex-wrap` allows items to wrap. `gap-4` adds consistent spacing between all items (both rows and columns).

---

#### Assignment 51: Flex Grow
**Task:** Make the middle item take remaining space.

```html
<div class="flex">
  <div class="bg-red-200 p-4 w-24">Fixed</div>
  <div class="bg-green-200 p-4 flex-1">Grows</div>
  <div class="bg-blue-200 p-4 w-24">Fixed</div>
</div>
```

**Answer Explanation:** `flex-1` applies `flex: 1 1 0%`, making the element grow to fill available space. Sidebars stay fixed, center expands.

---

#### Assignment 52: Flex Shrink None
**Task:** Prevent a flex item from shrinking.

```html
<div class="flex">
  <div class="shrink-0 w-48 bg-yellow-200 p-4">Won't shrink</div>
  <div class="bg-blue-200 p-4">May shrink</div>
</div>
```

**Answer Explanation:** `shrink-0` applies `flex-shrink: 0`, preventing the element from shrinking below its set width.

---

#### Assignment 53: Align Self
**Task:** Override alignment for a single flex item.

```html
<div class="flex items-start h-48 bg-gray-100">
  <div class="bg-red-300 p-4">Top</div>
  <div class="self-center bg-green-300 p-4">Center</div>
  <div class="self-end bg-blue-300 p-4">Bottom</div>
</div>
```

**Answer Explanation:** `self-center` and `self-end` override the parent's `items-start`. Options: `self-auto`, `self-start`, `self-center`, `self-end`, `self-stretch`.

---

#### Assignment 54: Reverse Flex Direction
**Task:** Reverse the order of flex items.

```html
<div class="flex flex-row-reverse">
  <div class="bg-red-200 p-4">First in DOM, last visually</div>
  <div class="bg-green-200 p-4">Middle</div>
  <div class="bg-blue-200 p-4">Last in DOM, first visually</div>
</div>
```

**Answer Explanation:** `flex-row-reverse` reverses the horizontal order. Also: `flex-col-reverse` for vertical reverse.

---

#### Assignment 55: Gap Utility in Flex
**Task:** Add consistent gaps between flex items.

```html
<div class="flex gap-6">
  <div class="bg-indigo-200 p-4 rounded">A</div>
  <div class="bg-indigo-200 p-4 rounded">B</div>
  <div class="bg-indigo-200 p-4 rounded">C</div>
</div>
```

**Answer Explanation:** `gap-6` adds `gap: 1.5rem` between all items. Better than margins because it doesn't add space on outer edges. Also: `gap-x-*`, `gap-y-*`.

---

### Section F: Display, Visibility & Overflow (56–65)

---

#### Assignment 56: Hide an Element
**Task:** Completely hide an element from the page.

```html
<div class="hidden">This is invisible and takes no space.</div>
```

**Answer Explanation:** `hidden` applies `display: none`. The element is removed from layout and not visible.

---

#### Assignment 57: Block Display
**Task:** Force an inline element to behave as block.

```html
<span class="block bg-yellow-100 p-2">I'm block-level now</span>
```

**Answer Explanation:** `block` sets `display: block`, making the element take full width and start on a new line.

---

#### Assignment 58: Inline Block
**Task:** Set an element to inline-block.

```html
<div class="inline-block bg-pink-200 p-4 m-2">Inline Block 1</div>
<div class="inline-block bg-pink-200 p-4 m-2">Inline Block 2</div>
```

**Answer Explanation:** `inline-block` allows elements to sit side by side while respecting width/height and padding.

---

#### Assignment 59: Visibility Hidden
**Task:** Hide an element but keep its space.

```html
<div class="invisible bg-red-200 p-4">Hidden but space reserved</div>
```

**Answer Explanation:** `invisible` sets `visibility: hidden`. Unlike `hidden`, the element still occupies space in the layout.

---

#### Assignment 60: Overflow Hidden
**Task:** Clip content that overflows a box.

```html
<div class="w-48 h-24 overflow-hidden bg-gray-100 p-2">
  This long text will be clipped when it exceeds the box dimensions and won't show scrollbars.
</div>
```

**Answer Explanation:** `overflow-hidden` clips any content exceeding the container. No scrollbar appears.

---

#### Assignment 61: Overflow Scroll
**Task:** Always show scrollbars on a container.

```html
<div class="w-48 h-24 overflow-scroll bg-gray-100 p-2">
  Scrollable content that always shows scrollbars regardless of content length.
</div>
```

**Answer Explanation:** `overflow-scroll` always shows scrollbars. For auto-scrollbars, use `overflow-auto` instead.

---

#### Assignment 62: Responsive Display
**Task:** Hide on mobile, show on desktop.

```html
<div class="hidden md:block">
  Visible only on medium screens and above.
</div>
```

**Answer Explanation:** `hidden` hides by default (mobile). `md:block` shows it at ≥768px. A very common responsive pattern.

---

#### Assignment 63: Show Only on Mobile
**Task:** Show an element only on small screens.

```html
<div class="block md:hidden">
  Mobile only content
</div>
```

**Answer Explanation:** `block` shows on mobile. `md:hidden` hides at ≥768px. Inverse of the previous pattern.

---

#### Assignment 64: Screen Reader Only
**Task:** Make text available only to screen readers.

```html
<span class="sr-only">Accessible label for screen readers</span>
```

**Answer Explanation:** `sr-only` visually hides the element but keeps it accessible. Uses a clip/position technique. Use `not-sr-only` to undo.

---

#### Assignment 65: Overflow X/Y Control
**Task:** Allow horizontal scroll, clip vertical overflow.

```html
<div class="overflow-x-auto overflow-y-hidden w-64 h-32">
  <div class="w-[600px] h-[200px] bg-gradient-to-r from-blue-200 to-purple-200">
    Wide content
  </div>
</div>
```

**Answer Explanation:** `overflow-x-auto` shows a horizontal scrollbar when needed. `overflow-y-hidden` clips vertical overflow.

---

### Section G: Basic Interactivity (66–70)

---

#### Assignment 66: Hover Background Change
**Task:** Change background color on hover.

```html
<button class="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded">
  Hover Me
</button>
```

**Answer Explanation:** `hover:bg-blue-700` applies on mouse hover. Tailwind's `hover:` prefix works with virtually any utility.

---

#### Assignment 67: Focus Ring on Input
**Task:** Add a focus ring to an input field.

```html
<input
  type="text"
  class="border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
  placeholder="Focus me"
>
```

**Answer Explanation:** `focus:ring-2` adds a ring on focus. `focus:outline-none` removes the default browser outline. Best practice for accessible inputs.

---

#### Assignment 68: Cursor Pointer
**Task:** Change cursor to pointer on a clickable div.

```html
<div class="cursor-pointer bg-gray-200 hover:bg-gray-300 p-4 rounded">
  Click me
</div>
```

**Answer Explanation:** `cursor-pointer` sets `cursor: pointer`. Others: `cursor-default`, `cursor-wait`, `cursor-not-allowed`, `cursor-grab`.

---

#### Assignment 69: Disabled Styling
**Task:** Style a disabled button.

```html
<button class="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed" disabled>
  Disabled
</button>
```

**Answer Explanation:** `disabled:opacity-50` reduces opacity on `:disabled`. `disabled:cursor-not-allowed` shows the not-allowed cursor.

---

#### Assignment 70: Transition on Hover
**Task:** Add a smooth color transition on hover.

```html
<button class="bg-green-500 hover:bg-green-700 text-white px-6 py-3 rounded transition duration-300 ease-in-out">
  Smooth Hover
</button>
```

**Answer Explanation:** `transition` enables transitions on common properties. `duration-300` sets 300ms. `ease-in-out` sets the timing function.

---

---

## 📘 INTERMEDIATE LEVEL (Assignments 71–140)

### Section H: CSS Grid (71–85)

---

#### Assignment 71: Basic 3-Column Grid
**Task:** Create a 3-column grid layout.

```html
<div class="grid grid-cols-3 gap-4">
  <div class="bg-blue-200 p-4">1</div>
  <div class="bg-blue-200 p-4">2</div>
  <div class="bg-blue-200 p-4">3</div>
  <div class="bg-blue-200 p-4">4</div>
  <div class="bg-blue-200 p-4">5</div>
  <div class="bg-blue-200 p-4">6</div>
</div>
```

**Answer Explanation:** `grid` enables CSS Grid. `grid-cols-3` creates 3 equal columns. `gap-4` adds spacing between cells.

---

#### Assignment 72: Responsive Grid Columns
**Task:** 1 column on mobile, 2 on tablet, 3 on desktop.

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="bg-teal-200 p-4 rounded">Card 1</div>
  <div class="bg-teal-200 p-4 rounded">Card 2</div>
  <div class="bg-teal-200 p-4 rounded">Card 3</div>
  <div class="bg-teal-200 p-4 rounded">Card 4</div>
  <div class="bg-teal-200 p-4 rounded">Card 5</div>
  <div class="bg-teal-200 p-4 rounded">Card 6</div>
</div>
```

**Answer Explanation:** Mobile-first approach: `grid-cols-1` default, `md:grid-cols-2` at 768px+, `lg:grid-cols-3` at 1024px+.

---

#### Assignment 73: Column Span
**Task:** Make an item span 2 columns.

```html
<div class="grid grid-cols-3 gap-4">
  <div class="col-span-2 bg-red-200 p-4">Spans 2 columns</div>
  <div class="bg-blue-200 p-4">Normal</div>
  <div class="bg-green-200 p-4">Normal</div>
  <div class="bg-yellow-200 p-4">Normal</div>
</div>
```

**Answer Explanation:** `col-span-2` makes the item span across 2 grid columns. Options: `col-span-1` through `col-span-12`, `col-span-full`.

---

#### Assignment 74: Row Span
**Task:** Make an item span 2 rows.

```html
<div class="grid grid-cols-2 grid-rows-3 gap-4 h-96">
  <div class="row-span-2 bg-purple-300 p-4">Tall item</div>
  <div class="bg-blue-200 p-4">Normal</div>
  <div class="bg-green-200 p-4">Normal</div>
  <div class="bg-yellow-200 p-4">Normal</div>
</div>
```

**Answer Explanation:** `row-span-2` spans 2 rows vertically. `grid-rows-3` defines 3 explicit rows. Combined with `h-96` for visible height.

---

#### Assignment 75: Grid Start/End Position
**Task:** Place an item at a specific grid position.

```html
<div class="grid grid-cols-4 gap-4">
  <div class="col-start-2 col-end-4 bg-pink-300 p-4">Columns 2-3</div>
  <div class="bg-blue-200 p-4">Auto placed</div>
</div>
```

**Answer Explanation:** `col-start-2` begins at column line 2. `col-end-4` ends at column line 4. The item spans columns 2 and 3.

---

#### Assignment 76: Auto-Fit Grid
**Task:** Create a grid that auto-fits items with a minimum size.

```html
<div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
  <div class="bg-cyan-200 p-4 rounded">Auto 1</div>
  <div class="bg-cyan-200 p-4 rounded">Auto 2</div>
  <div class="bg-cyan-200 p-4 rounded">Auto 3</div>
  <div class="bg-cyan-200 p-4 rounded">Auto 4</div>
  <div class="bg-cyan-200 p-4 rounded">Auto 5</div>
</div>
```

**Answer Explanation:** Using Tailwind 4's arbitrary value syntax with `grid-cols-[...]`. `auto-fit` fills the row, `minmax(200px,1fr)` sets min/max size per item.

---

#### Assignment 77: Grid Template Rows
**Task:** Define explicit row sizes.

```html
<div class="grid grid-rows-[auto_1fr_auto] h-screen">
  <header class="bg-gray-800 text-white p-4">Header</header>
  <main class="bg-white p-4">Main Content (fills remaining)</main>
  <footer class="bg-gray-800 text-white p-4">Footer</footer>
</div>
```

**Answer Explanation:** `grid-rows-[auto_1fr_auto]` creates 3 rows: auto header, flexible main, auto footer. A classic page layout pattern.

---

#### Assignment 78: Subgrid (TW4)
**Task:** Use subgrid to inherit parent grid tracks.

```html
<div class="grid grid-cols-4 gap-4">
  <div class="col-span-4 grid grid-cols-subgrid gap-4">
    <div class="col-span-2 bg-amber-200 p-4">Aligned to parent col 1-2</div>
    <div class="col-span-2 bg-amber-300 p-4">Aligned to parent col 3-4</div>
  </div>
</div>
```

**Answer Explanation:** `grid-cols-subgrid` makes a nested grid inherit the parent's column tracks. Native CSS subgrid support in Tailwind 4.

---

#### Assignment 79: Grid Auto Flow Dense
**Task:** Pack items densely to fill empty cells.

```html
<div class="grid grid-cols-3 auto-rows-auto grid-flow-dense gap-4">
  <div class="col-span-2 bg-red-200 p-4">Wide</div>
  <div class="bg-blue-200 p-4">Small</div>
  <div class="bg-green-200 p-4">Small</div>
  <div class="col-span-2 bg-yellow-200 p-4">Wide</div>
  <div class="bg-purple-200 p-4">Fills gap</div>
</div>
```

**Answer Explanation:** `grid-flow-dense` enables dense packing, filling holes in the grid caused by differently-sized items.

---

#### Assignment 80: Place Items Center
**Task:** Center all grid items within their cells.

```html
<div class="grid grid-cols-3 gap-4 place-items-center h-64">
  <div class="bg-blue-200 p-4">Centered</div>
  <div class="bg-green-200 p-4">Centered</div>
  <div class="bg-red-200 p-4">Centered</div>
</div>
```

**Answer Explanation:** `place-items-center` is shorthand for `align-items: center; justify-items: center`. Centers items in both axes.

---

#### Assignment 81: Grid Gap Variants
**Task:** Different gap for rows and columns.

```html
<div class="grid grid-cols-3 gap-x-8 gap-y-2">
  <div class="bg-blue-200 p-4">1</div>
  <div class="bg-blue-200 p-4">2</div>
  <div class="bg-blue-200 p-4">3</div>
  <div class="bg-blue-200 p-4">4</div>
  <div class="bg-blue-200 p-4">5</div>
  <div class="bg-blue-200 p-4">6</div>
</div>
```

**Answer Explanation:** `gap-x-8` sets column gap (2rem). `gap-y-2` sets row gap (0.5rem). Allows different spacing per axis.

---

#### Assignment 82: Full-Width Grid Item
**Task:** Make one item span all columns.

```html
<div class="grid grid-cols-3 gap-4">
  <div class="col-span-full bg-indigo-300 p-4 text-center">Full Width Banner</div>
  <div class="bg-indigo-100 p-4">1</div>
  <div class="bg-indigo-100 p-4">2</div>
  <div class="bg-indigo-100 p-4">3</div>
</div>
```

**Answer Explanation:** `col-span-full` spans all columns regardless of how many there are. Equivalent to `col-span-1/-1`.

---

#### Assignment 83: Auto-Fill vs Auto-Fit
**Task:** Compare auto-fill and auto-fit behavior.

```html
<!-- auto-fill: creates empty tracks -->
<div class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 mb-8">
  <div class="bg-green-200 p-4">1</div>
  <div class="bg-green-200 p-4">2</div>
</div>

<!-- auto-fit: collapses empty tracks -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
  <div class="bg-blue-200 p-4">1</div>
  <div class="bg-blue-200 p-4">2</div>
</div>
```

**Answer Explanation:** `auto-fill` creates invisible empty tracks. `auto-fit` collapses empty tracks, so existing items stretch wider.

---

#### Assignment 84: Grid Place Content
**Task:** Center the entire grid content area.

```html
<div class="grid grid-cols-2 gap-4 place-content-center h-screen">
  <div class="bg-pink-200 p-8">A</div>
  <div class="bg-pink-200 p-8">B</div>
  <div class="bg-pink-200 p-8">C</div>
  <div class="bg-pink-200 p-8">D</div>
</div>
```

**Answer Explanation:** `place-content-center` centers the entire grid as a group within the container. Different from `place-items` which centers within cells.

---

#### Assignment 85: Named Grid Lines with Arbitrary Values
**Task:** Define custom named grid areas.

```html
<div class="grid grid-cols-[sidebar_200px_main_1fr] grid-rows-[header_auto_content_1fr_footer_auto] gap-4 h-screen">
  <header class="col-span-full bg-slate-700 text-white p-4">Header</header>
  <aside class="bg-slate-200 p-4">Sidebar</aside>
  <main class="bg-white p-4">Main Content</main>
  <footer class="col-span-full bg-slate-700 text-white p-4">Footer</footer>
</div>
```

**Answer Explanation:** Arbitrary values `grid-cols-[...]` and `grid-rows-[...]` let you define custom track sizes directly in the class.

---

### Section I: Positioning & Layout (86–95)

---

#### Assignment 86: Relative Positioning
**Task:** Nudge an element from its normal position.

```html
<div class="relative top-4 left-4 bg-blue-200 p-4 w-48">
  Moved 1rem down and right
</div>
```

**Answer Explanation:** `relative` sets `position: relative`. `top-4` and `left-4` offset by 1rem each from its original position.

---

#### Assignment 87: Absolute Positioning
**Task:** Position a badge in the top-right corner of a card.

```html
<div class="relative w-64 h-40 bg-white border rounded-lg">
  <span class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
    NEW
  </span>
  <p class="p-4">Card Content</p>
</div>
```

**Answer Explanation:** `absolute` positions relative to the nearest `relative` parent. `top-2 right-2` places it 0.5rem from top-right.

---

#### Assignment 88: Fixed Position Header
**Task:** Create a fixed navigation bar.

```html
<nav class="fixed top-0 left-0 right-0 bg-white shadow-md z-50 p-4">
  <span class="font-bold">Fixed Navbar</span>
</nav>
<div class="pt-16">
  <!-- Content with padding to account for fixed header -->
</div>
```

**Answer Explanation:** `fixed` makes the element stay in place during scroll. `top-0 left-0 right-0` spans the top. `z-50` ensures it's above other content.

---

#### Assignment 89: Sticky Position
**Task:** Make a sidebar heading stick on scroll.

```html
<div class="h-[200vh]">
  <div class="sticky top-0 bg-yellow-200 p-4 z-10">
    I stick to the top when scrolling
  </div>
  <p class="p-4">Scroll down to see the sticky effect...</p>
</div>
```

**Answer Explanation:** `sticky` makes the element act as relative until it reaches the specified threshold (`top-0`), then it sticks.

---

#### Assignment 90: Z-Index Stacking
**Task:** Stack overlapping elements with z-index.

```html
<div class="relative h-48">
  <div class="absolute top-4 left-4 z-10 bg-red-400 size-24 rounded">z-10</div>
  <div class="absolute top-8 left-8 z-20 bg-green-400 size-24 rounded">z-20</div>
  <div class="absolute top-12 left-12 z-30 bg-blue-400 size-24 rounded">z-30</div>
</div>
```

**Answer Explanation:** Higher `z-*` values appear on top. Options: `z-0`, `z-10`, `z-20`, `z-30`, `z-40`, `z-50`, or arbitrary `z-[100]`.

---

#### Assignment 91: Inset Shorthand
**Task:** Position an overlay covering the full parent.

```html
<div class="relative w-64 h-40">
  <img src="/image.jpg" class="w-full h-full object-cover" alt="Background">
  <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
    <p class="text-white text-xl">Overlay Text</p>
  </div>
</div>
```

**Answer Explanation:** `inset-0` is shorthand for `top: 0; right: 0; bottom: 0; left: 0`. Creates a full overlay. `bg-black/50` adds semi-transparent black.

---

#### Assignment 92: Float and Clear
**Task:** Float an image to the left with text wrap.

```html
<div class="clearfix">
  <img src="/avatar.jpg" class="float-left mr-4 mb-2 w-24 h-24 rounded" alt="Avatar">
  <p>This text wraps around the floated image. It demonstrates the classic float layout pattern that's still useful for text-wrapping scenarios.</p>
</div>
```

**Answer Explanation:** `float-left` floats the element left. Text flows around it. Combine with `mr-4` for spacing between image and text.

---

#### Assignment 93: Object Fit
**Task:** Make an image cover its container without distortion.

```html
<div class="w-64 h-48 overflow-hidden rounded-lg">
  <img src="/photo.jpg" class="w-full h-full object-cover" alt="Photo">
</div>
```

**Answer Explanation:** `object-cover` scales the image to cover the area, cropping if needed. Maintains aspect ratio. Also: `object-contain`, `object-fill`, `object-none`.

---

#### Assignment 94: Container Utility
**Task:** Create a responsive centered container.

```html
<div class="container mx-auto px-4">
  <h1 class="text-3xl">Page Content</h1>
  <p>Contained and centered with responsive breakpoints.</p>
</div>
```

**Answer Explanation:** `container` sets max-width at each breakpoint. `mx-auto` centers it. `px-4` adds horizontal padding to prevent edge touching.

---

#### Assignment 95: Isolate Stacking Context
**Task:** Create an isolated stacking context.

```html
<div class="isolate">
  <div class="relative z-10 bg-blue-200 p-4">Isolated layer 1</div>
  <div class="relative z-20 bg-red-200 p-4 -mt-4">Isolated layer 2</div>
</div>
```

**Answer Explanation:** `isolate` creates a new stacking context with `isolation: isolate`. Z-index values inside don't leak out to the parent context.

---

### Section J: Shadows, Opacity & Effects (96–105)

---

#### Assignment 96: Box Shadow
**Task:** Add a medium shadow to a card.

```html
<div class="shadow-md bg-white rounded-lg p-6">
  Card with medium shadow
</div>
```

**Answer Explanation:** `shadow-md` adds a medium box shadow. Scale: `shadow-sm`, `shadow`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`, `shadow-none`.

---

#### Assignment 97: Colored Shadow (TW4)
**Task:** Apply a colored shadow.

```html
<div class="shadow-lg shadow-blue-500/50 bg-blue-500 text-white rounded-lg p-6">
  Blue glowing shadow
</div>
```

**Answer Explanation:** `shadow-blue-500/50` colors the shadow. The `/50` sets 50% opacity. Tailwind 4 supports shadow colors natively.

---

#### Assignment 98: Opacity
**Task:** Make an element 75% opaque.

```html
<div class="opacity-75 bg-purple-500 text-white p-6 rounded">
  Semi-transparent element
</div>
```

**Answer Explanation:** `opacity-75` sets `opacity: 0.75`. Affects the entire element and its children. Scale from `opacity-0` to `opacity-100` in steps of 5.

---

#### Assignment 99: Backdrop Blur
**Task:** Create a frosted glass effect.

```html
<div class="relative h-64 bg-[url('/photo.jpg')] bg-cover">
  <div class="absolute inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center">
    <p class="text-xl font-bold">Frosted Glass</p>
  </div>
</div>
```

**Answer Explanation:** `backdrop-blur-md` blurs what's behind the element. `bg-white/30` adds semi-transparent white. Together they create a glass effect.

---

#### Assignment 100: Mix Blend Mode
**Task:** Apply a blend mode to overlapping elements.

```html
<div class="relative">
  <div class="bg-blue-500 size-32 rounded-full"></div>
  <div class="bg-red-500 size-32 rounded-full -mt-16 ml-16 mix-blend-multiply"></div>
</div>
```

**Answer Explanation:** `mix-blend-multiply` multiplies the colors where elements overlap. Options: `mix-blend-screen`, `mix-blend-overlay`, `mix-blend-darken`, etc.

---

#### Assignment 101: Blur Filter
**Task:** Apply a blur effect to an image.

```html
<img src="/photo.jpg" class="blur-sm rounded-lg w-64" alt="Blurred">
```

**Answer Explanation:** `blur-sm` applies a small Gaussian blur. Scale: `blur-none`, `blur-sm`, `blur`, `blur-md`, `blur-lg`, `blur-xl`, `blur-2xl`, `blur-3xl`.

---

#### Assignment 102: Grayscale Filter
**Task:** Desaturate an image on load, show color on hover.

```html
<img src="/photo.jpg" class="grayscale hover:grayscale-0 transition duration-500 w-64 rounded-lg" alt="Photo">
```

**Answer Explanation:** `grayscale` makes the image black-and-white. `hover:grayscale-0` restores color on hover. `transition duration-500` smooths the change.

---

#### Assignment 103: Inset Shadow (TW4)
**Task:** Apply an inset shadow to simulate a pressed button.

```html
<button class="shadow-inner bg-gray-200 px-6 py-3 rounded-lg active:shadow-[inset_0_4px_6px_rgba(0,0,0,0.3)]">
  Press Me
</button>
```

**Answer Explanation:** `shadow-inner` applies an inset box shadow. The arbitrary value on `active:` provides a deeper pressed effect.

---

#### Assignment 104: Drop Shadow (Filter)
**Task:** Add a drop shadow to an irregularly-shaped element.

```html
<img src="/logo.png" class="drop-shadow-lg w-48" alt="Logo with shadow">
```

**Answer Explanation:** `drop-shadow-lg` applies a CSS filter drop shadow. Unlike `shadow-*`, it follows the shape of transparent images (PNGs/SVGs).

---

#### Assignment 105: Brightness & Contrast
**Task:** Brighten and increase contrast on an image.

```html
<img src="/photo.jpg" class="brightness-110 contrast-125 w-64 rounded-lg" alt="Enhanced">
```

**Answer Explanation:** `brightness-110` increases brightness by 10%. `contrast-125` increases contrast by 25%. CSS filter utilities.

---

### Section K: Transitions & Animations (106–115)

---

#### Assignment 106: Transition Property Control
**Task:** Transition only the background color.

```html
<button class="bg-green-500 hover:bg-green-700 text-white px-6 py-3 rounded transition-colors duration-300">
  Color Transition Only
</button>
```

**Answer Explanation:** `transition-colors` limits transitions to color properties. Others: `transition-all`, `transition-opacity`, `transition-shadow`, `transition-transform`.

---

#### Assignment 107: Scale on Hover
**Task:** Scale up a card on hover.

```html
<div class="bg-white rounded-lg shadow p-6 transition-transform duration-300 hover:scale-105">
  Hover to enlarge
</div>
```

**Answer Explanation:** `hover:scale-105` scales to 105%. `transition-transform` enables smooth scaling. Scale: `scale-90`, `scale-95`, `scale-100`, `scale-105`, `scale-110`, `scale-125`, `scale-150`.

---

#### Assignment 108: Rotate on Hover
**Task:** Rotate an icon on hover.

```html
<div class="inline-block transition-transform duration-500 hover:rotate-180 text-4xl">
  ⚙️
</div>
```

**Answer Explanation:** `hover:rotate-180` rotates 180 degrees on hover. Options: `rotate-0`, `rotate-1`, `rotate-2`, `rotate-3`, `rotate-6`, `rotate-12`, `rotate-45`, `rotate-90`, `rotate-180`.

---

#### Assignment 109: Translate/Move on Hover
**Task:** Move an element upward on hover.

```html
<div class="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
  Floats up on hover
</div>
```

**Answer Explanation:** `hover:-translate-y-2` moves the element 0.5rem upward. Combined with `hover:shadow-xl` for a lifting effect.

---

#### Assignment 110: Spin Animation
**Task:** Apply a continuous spin animation.

```html
<div class="animate-spin inline-block size-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
```

**Answer Explanation:** `animate-spin` applies an infinite 360° rotation. The transparent top border creates a classic loading spinner.

---

#### Assignment 111: Pulse Animation
**Task:** Create a pulsing notification dot.

```html
<span class="relative flex size-3">
  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
  <span class="relative inline-flex rounded-full size-3 bg-red-500"></span>
</span>
```

**Answer Explanation:** `animate-ping` creates a pulsing ring effect. Layered with a solid dot for a notification indicator pattern.

---

#### Assignment 112: Bounce Animation
**Task:** Add a bounce effect to a scroll indicator.

```html
<div class="animate-bounce text-3xl text-gray-500">
  ↓
</div>
```

**Answer Explanation:** `animate-bounce` creates a vertical bouncing animation. Great for scroll indicators and attention-grabbing elements.

---

#### Assignment 113: Custom Duration and Delay
**Task:** Add transition with custom delay.

```html
<div class="opacity-0 hover:opacity-100 transition-opacity duration-700 delay-150">
  Appears with delay
</div>
```

**Answer Explanation:** `duration-700` sets 700ms transition. `delay-150` adds 150ms before the transition starts. Delay options: `delay-75`, `delay-100`, `delay-150`, `delay-200`, `delay-300`, `delay-500`, `delay-700`, `delay-1000`.

---

#### Assignment 114: Transform Origin
**Task:** Rotate from the top-left corner instead of center.

```html
<div class="origin-top-left hover:rotate-12 transition-transform duration-500 bg-blue-300 size-32 rounded">
  Rotates from corner
</div>
```

**Answer Explanation:** `origin-top-left` sets `transform-origin: top left`. The rotation pivots from the corner. Options: `origin-center`, `origin-top`, `origin-top-right`, etc.

---

#### Assignment 115: Will-Change Performance Hint
**Task:** Optimize performance for an animated element.

```html
<div class="will-change-transform hover:scale-110 transition-transform duration-300 bg-purple-300 p-6 rounded-lg">
  Optimized animation
</div>
```

**Answer Explanation:** `will-change-transform` hints the browser to optimize for transform changes. Also: `will-change-scroll`, `will-change-contents`, `will-change-auto`.

---

### Section L: Responsive Design (116–125)

---

#### Assignment 116: Mobile-First Responsive Text
**Task:** Increase heading size at each breakpoint.

```html
<h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
  Responsive Heading
</h1>
```

**Answer Explanation:** Tailwind is mobile-first. `text-2xl` is default (mobile). Each breakpoint overrides for larger screens. Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px).

---

#### Assignment 117: Responsive Flex Direction
**Task:** Stack vertically on mobile, horizontal on desktop.

```html
<div class="flex flex-col md:flex-row gap-4">
  <div class="bg-blue-200 p-6 md:w-1/3">Sidebar</div>
  <div class="bg-green-200 p-6 md:w-2/3">Main</div>
</div>
```

**Answer Explanation:** `flex-col` stacks on mobile. `md:flex-row` switches to horizontal at 768px+. Widths only apply at `md:`.

---

#### Assignment 118: Hide/Show Responsive Elements
**Task:** Show a hamburger icon on mobile, navigation links on desktop.

```html
<!-- Mobile hamburger -->
<button class="md:hidden p-2">☰</button>

<!-- Desktop navigation -->
<nav class="hidden md:flex gap-6">
  <a href="#">Home</a>
  <a href="#">About</a>
  <a href="#">Contact</a>
</nav>
```

**Answer Explanation:** The button shows on mobile and hides at `md:`. The nav is hidden on mobile and shows as `flex` at `md:`.

---

#### Assignment 119: Responsive Grid Changes
**Task:** Change grid layout at different breakpoints.

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <div class="bg-cyan-200 p-4">1</div>
  <div class="bg-cyan-200 p-4">2</div>
  <div class="bg-cyan-200 p-4">3</div>
  <div class="bg-cyan-200 p-4">4</div>
</div>
```

**Answer Explanation:** 1 column (mobile) → 2 columns (sm/640px) → 4 columns (lg/1024px). Fluid responsive grids.

---

#### Assignment 120: Responsive Padding & Margin
**Task:** Increase container padding at larger screens.

```html
<div class="p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 bg-slate-100 rounded-lg">
  Responsive padding grows with screen size
</div>
```

**Answer Explanation:** Padding scales up: 1rem → 1.5rem → 2rem → 3rem → 4rem. Gives more breathing room on larger displays.

---

#### Assignment 121: Container Queries (TW4)
**Task:** Style based on container width, not viewport.

```html
<div class="@container">
  <div class="flex flex-col @md:flex-row gap-4">
    <div class="bg-blue-200 p-4 @md:w-1/3">Sidebar</div>
    <div class="bg-green-200 p-4 @md:w-2/3">Content</div>
  </div>
</div>
```

**Answer Explanation:** Tailwind CSS 4 supports container queries natively. `@container` establishes the query scope. `@md:` applies when the container (not viewport) reaches medium size.

---

#### Assignment 122: Responsive Image Sizing
**Task:** Change image width at different breakpoints.

```html
<img
  src="/photo.jpg"
  class="w-full sm:w-3/4 md:w-1/2 lg:w-1/3 mx-auto rounded-lg"
  alt="Responsive image"
>
```

**Answer Explanation:** Image starts full-width on mobile and shrinks proportionally on larger screens. `mx-auto` keeps it centered.

---

#### Assignment 123: Responsive Typography Scale
**Task:** Create a responsive paragraph with adjusted line height.

```html
<p class="text-sm sm:text-base md:text-lg leading-relaxed sm:leading-relaxed md:leading-loose max-w-prose mx-auto">
  Readable paragraph that scales with the viewport.
</p>
```

**Answer Explanation:** `max-w-prose` sets an optimal reading width (~65ch). Text size and line height increase with screen size for better readability.

---

#### Assignment 124: Responsive Aspect Ratio
**Task:** Change aspect ratio based on screen size.

```html
<div class="aspect-square md:aspect-video lg:aspect-[21/9] bg-gray-800 rounded-lg overflow-hidden">
  <p class="text-white p-4">Responsive aspect ratio</p>
</div>
```

**Answer Explanation:** Square on mobile, 16:9 on tablet, ultra-wide 21:9 on desktop. Arbitrary aspect ratios use bracket syntax.

---

#### Assignment 125: Responsive Max Width
**Task:** Constrain content width responsively.

```html
<div class="max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-5xl mx-auto p-4">
  Content width grows with viewport
</div>
```

**Answer Explanation:** Max-width increases at each breakpoint. Prevents content from stretching too wide on large monitors while staying compact on mobile.

---

### Section M: Pseudo-Classes & States (126–140)

---

#### Assignment 126: First Child Styling
**Task:** Style the first item differently in a list.

```html
<ul>
  <li class="py-2 first:font-bold first:text-blue-600">Item 1 (bold & blue)</li>
  <li class="py-2 first:font-bold first:text-blue-600">Item 2</li>
  <li class="py-2 first:font-bold first:text-blue-600">Item 3</li>
</ul>
```

**Answer Explanation:** `first:font-bold` applies `font-weight: bold` only to the `:first-child`. Also: `last:`, `odd:`, `even:`.

---

#### Assignment 127: Odd/Even Row Striping
**Task:** Create striped table rows.

```html
<table class="w-full">
  <tbody>
    <tr class="odd:bg-white even:bg-gray-50"><td class="p-3">Row 1</td></tr>
    <tr class="odd:bg-white even:bg-gray-50"><td class="p-3">Row 2</td></tr>
    <tr class="odd:bg-white even:bg-gray-50"><td class="p-3">Row 3</td></tr>
    <tr class="odd:bg-white even:bg-gray-50"><td class="p-3">Row 4</td></tr>
  </tbody>
</table>
```

**Answer Explanation:** `odd:bg-white` styles odd rows, `even:bg-gray-50` styles even rows. Makes tabular data easier to scan.

---

#### Assignment 128: Group Hover
**Task:** Change a child element when hovering the parent.

```html
<div class="group bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
  <h3 class="text-lg font-semibold group-hover:text-blue-600 transition-colors">
    Card Title
  </h3>
  <p class="text-gray-500 group-hover:text-gray-700">Card description text.</p>
</div>
```

**Answer Explanation:** `group` marks the parent. `group-hover:text-blue-600` applies when hovering anywhere on the parent. Powerful for card interactions.

---

#### Assignment 129: Peer Modifier
**Task:** Show a message when a sibling input is focused.

```html
<div>
  <input type="email" class="peer border rounded p-2 w-full" placeholder="Email">
  <p class="invisible peer-focus:visible text-sm text-blue-500 mt-1">
    Enter your email address
  </p>
</div>
```

**Answer Explanation:** `peer` marks the reference sibling. `peer-focus:visible` shows the message only when the input has focus. Works with many states.

---

#### Assignment 130: Placeholder Styling
**Task:** Style placeholder text.

```html
<input
  type="text"
  class="border rounded p-3 w-full placeholder:text-gray-400 placeholder:italic"
  placeholder="Enter your name..."
>
```

**Answer Explanation:** `placeholder:text-gray-400` colors the placeholder text. `placeholder:italic` makes it italic. The `placeholder:` variant targets `::placeholder`.

---

#### Assignment 131: Selection Styling
**Task:** Customize text selection color.

```html
<p class="selection:bg-purple-200 selection:text-purple-900">
  Select this text to see custom selection colors. Highlight any portion.
</p>
```

**Answer Explanation:** `selection:bg-purple-200` changes selection background. `selection:text-purple-900` changes selected text color.

---

#### Assignment 132: Active State
**Task:** Style a button during press.

```html
<button class="bg-blue-500 hover:bg-blue-600 active:bg-blue-800 active:scale-95 text-white px-6 py-3 rounded-lg transition">
  Press Me
</button>
```

**Answer Explanation:** `active:bg-blue-800` darkens on click. `active:scale-95` shrinks slightly for a pressed effect. Transition smooths both.

---

#### Assignment 133: Focus-Within
**Task:** Highlight a form group when any child is focused.

```html
<div class="p-4 border rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition">
  <label class="block text-sm font-medium mb-1">Username</label>
  <input type="text" class="w-full p-2 border rounded outline-none" placeholder="Type here">
</div>
```

**Answer Explanation:** `focus-within:border-blue-500` triggers when any descendant has focus. Great for form groups and search bars.

---

#### Assignment 134: Checked State
**Task:** Style a custom checkbox appearance.

```html
<label class="flex items-center gap-2 cursor-pointer">
  <input type="checkbox" class="peer hidden">
  <div class="size-5 border-2 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 transition flex items-center justify-center">
    <span class="text-white text-xs hidden peer-checked:block">✓</span>
  </div>
  <span>Accept terms</span>
</label>
```

**Answer Explanation:** `peer-checked:bg-blue-500` styles the visual checkbox when the hidden input is checked. Combines `peer` with the `checked` variant.

---

#### Assignment 135: Has Modifier (TW4)
**Task:** Style a parent based on the state of a descendant.

```html
<div class="has-[input:focus]:border-blue-500 has-[input:focus]:ring-2 has-[input:focus]:ring-blue-200 p-4 border rounded-lg transition">
  <label class="block text-sm font-medium mb-1">Search</label>
  <input type="text" class="w-full p-2 border rounded" placeholder="Type to search...">
</div>
```

**Answer Explanation:** `has-[input:focus]:` styles the parent when a descendant input has focus. Tailwind 4 supports the CSS `:has()` selector natively.

---

#### Assignment 136: Not Modifier (TW4)
**Task:** Apply style to all items except the last one.

```html
<div class="space-y-2">
  <div class="p-3 not-last:border-b not-last:border-gray-200">Item 1</div>
  <div class="p-3 not-last:border-b not-last:border-gray-200">Item 2</div>
  <div class="p-3 not-last:border-b not-last:border-gray-200">Item 3</div>
</div>
```

**Answer Explanation:** `not-last:border-b` adds a bottom border to all items except the last. Tailwind 4 introduces `not-*` variants for negated pseudo-classes.

---

#### Assignment 137: Before/After Pseudo-Elements
**Task:** Add a decorative line before a heading.

```html
<h2 class="before:content-[''] before:block before:w-12 before:h-1 before:bg-blue-500 before:mb-2 text-2xl font-bold">
  Section Title
</h2>
```

**Answer Explanation:** `before:content-['']` creates the pseudo-element. `before:block` makes it visible. `before:w-12 before:h-1 before:bg-blue-500` creates a decorative bar.

---

#### Assignment 138: Dark Mode
**Task:** Support light and dark color schemes.

```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 rounded-lg">
  <h2 class="text-xl font-bold">Adaptive Card</h2>
  <p class="text-gray-600 dark:text-gray-400">
    This card changes appearance in dark mode.
  </p>
</div>
```

**Answer Explanation:** `dark:bg-gray-900` applies in dark mode. Tailwind 4 uses `prefers-color-scheme` by default. All utilities accept the `dark:` prefix.

---

#### Assignment 139: Print Variant
**Task:** Hide navigation and adjust layout for printing.

```html
<nav class="print:hidden bg-gray-800 text-white p-4">Navigation</nav>
<main class="p-4 print:p-0 print:text-black">
  <h1 class="text-2xl print:text-3xl">Printable Content</h1>
</main>
```

**Answer Explanation:** `print:hidden` hides elements when printing. `print:p-0` removes padding. `print:text-black` ensures readable text. Uses `@media print`.

---

#### Assignment 140: Aria Modifiers (TW4)
**Task:** Style based on ARIA attributes.

```html
<div role="alert" aria-live="assertive" class="aria-[live=assertive]:border-red-500 aria-[live=assertive]:bg-red-50 border-2 p-4 rounded-lg">
  <p class="text-red-700">Critical error message!</p>
</div>
```

**Answer Explanation:** `aria-[live=assertive]:` targets elements with specific ARIA attributes. Tailwind 4 supports arbitrary ARIA selectors for accessibility-driven styling.

---

---

## 📕 ADVANCED LEVEL (Assignments 141–200)

### Section N: Advanced Layout Patterns (141–155)

---

#### Assignment 141: Holy Grail Layout
**Task:** Create the classic header/sidebar/content/sidebar/footer layout.

```html
<div class="grid grid-rows-[auto_1fr_auto] grid-cols-[200px_1fr_200px] min-h-screen">
  <header class="col-span-full bg-slate-800 text-white p-4">Header</header>
  <aside class="bg-slate-100 p-4">Left Sidebar</aside>
  <main class="bg-white p-6">Main Content Area</main>
  <aside class="bg-slate-100 p-4">Right Sidebar</aside>
  <footer class="col-span-full bg-slate-800 text-white p-4">Footer</footer>
</div>
```

**Answer Explanation:** Uses CSS Grid with explicit row and column tracks. `grid-rows-[auto_1fr_auto]` makes header/footer auto-size and content stretch. `col-span-full` spans all columns.

---

#### Assignment 142: Masonry-Style Layout
**Task:** Simulate a masonry layout with CSS columns.

```html
<div class="columns-3 gap-4 space-y-4">
  <div class="break-inside-avoid bg-blue-200 p-4 rounded-lg h-32">Short</div>
  <div class="break-inside-avoid bg-green-200 p-4 rounded-lg h-48">Medium</div>
  <div class="break-inside-avoid bg-red-200 p-4 rounded-lg h-24">Tiny</div>
  <div class="break-inside-avoid bg-yellow-200 p-4 rounded-lg h-64">Tall</div>
  <div class="break-inside-avoid bg-purple-200 p-4 rounded-lg h-40">Medium</div>
  <div class="break-inside-avoid bg-pink-200 p-4 rounded-lg h-56">Large</div>
</div>
```

**Answer Explanation:** `columns-3` creates a 3-column CSS column layout. `break-inside-avoid` prevents items from splitting across columns. Results in a Pinterest-like layout.

---

#### Assignment 143: Sticky Sidebar with Scrollable Content
**Task:** Fixed sidebar, scrollable main area.

```html
<div class="flex h-screen">
  <aside class="w-64 bg-gray-900 text-white p-6 overflow-y-auto shrink-0">
    <nav class="space-y-4 sticky top-0">
      <a href="#" class="block hover:text-blue-400">Dashboard</a>
      <a href="#" class="block hover:text-blue-400">Settings</a>
      <a href="#" class="block hover:text-blue-400">Profile</a>
    </nav>
  </aside>
  <main class="flex-1 overflow-y-auto p-8">
    <div class="h-[200vh]">Scrollable content...</div>
  </main>
</div>
```

**Answer Explanation:** `h-screen` constrains the layout. `shrink-0` prevents sidebar from collapsing. `overflow-y-auto` on main creates independent scroll. `sticky top-0` keeps nav pinned.

---

#### Assignment 144: Auto-Scrolling Horizontal Carousel
**Task:** Horizontally scrollable card carousel with snap.

```html
<div class="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide">
  <div class="snap-center shrink-0 w-72 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-xl p-6">
    <h3 class="font-bold text-lg">Card 1</h3>
    <p class="mt-2 opacity-80">Swipe to browse cards</p>
  </div>
  <div class="snap-center shrink-0 w-72 bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-xl p-6">
    <h3 class="font-bold text-lg">Card 2</h3>
    <p class="mt-2 opacity-80">Snap scrolling enabled</p>
  </div>
  <div class="snap-center shrink-0 w-72 bg-gradient-to-br from-pink-400 to-pink-600 text-white rounded-xl p-6">
    <h3 class="font-bold text-lg">Card 3</h3>
    <p class="mt-2 opacity-80">Smooth snap points</p>
  </div>
</div>
```

**Answer Explanation:** `snap-x snap-mandatory` enables horizontal scroll snapping. `snap-center` on children sets snap points. `shrink-0` prevents cards from shrinking.

---

#### Assignment 145: CSS Grid Dashboard Layout
**Task:** Build a dashboard with varied-size widget areas.

```html
<div class="grid grid-cols-4 grid-rows-[auto_1fr_1fr] gap-4 h-screen p-4 bg-gray-100">
  <header class="col-span-full bg-white rounded-xl shadow p-4">Dashboard Header</header>
  <div class="col-span-2 row-span-2 bg-white rounded-xl shadow p-6">
    <h3 class="font-bold mb-4">Main Chart</h3>
    <div class="h-full bg-blue-50 rounded-lg"></div>
  </div>
  <div class="bg-white rounded-xl shadow p-6">Widget A</div>
  <div class="bg-white rounded-xl shadow p-6">Widget B</div>
  <div class="bg-white rounded-xl shadow p-6">Widget C</div>
  <div class="bg-white rounded-xl shadow p-6">Widget D</div>
</div>
```

**Answer Explanation:** `grid-cols-4 grid-rows-[auto_1fr_1fr]` creates a structured dashboard. `col-span-2 row-span-2` makes the main chart large. All widgets auto-fill remaining cells.

---

#### Assignment 146: Responsive Card Grid with Aspect Ratios
**Task:** Cards that maintain aspect ratio responsively.

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="aspect-[4/3] bg-white rounded-xl shadow-md overflow-hidden group">
    <div class="h-3/5 bg-gradient-to-br from-rose-400 to-orange-300 group-hover:scale-110 transition-transform duration-500"></div>
    <div class="h-2/5 p-4">
      <h3 class="font-semibold">Card Title</h3>
      <p class="text-sm text-gray-500 mt-1">Description text</p>
    </div>
  </div>
</div>
```

**Answer Explanation:** `aspect-[4/3]` locks card proportions. `group-hover:scale-110` on the inner image zooms on card hover. `overflow-hidden` clips the scaled image.

---

#### Assignment 147: Overlay Navigation
**Task:** Full-screen overlay menu.

```html
<!-- Trigger: use JS to toggle 'hidden' class -->
<div class="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center gap-8">
  <button class="absolute top-6 right-6 text-white text-3xl">&times;</button>
  <a href="#" class="text-white text-4xl font-light hover:text-blue-400 transition-colors">Home</a>
  <a href="#" class="text-white text-4xl font-light hover:text-blue-400 transition-colors">About</a>
  <a href="#" class="text-white text-4xl font-light hover:text-blue-400 transition-colors">Work</a>
  <a href="#" class="text-white text-4xl font-light hover:text-blue-400 transition-colors">Contact</a>
</div>
```

**Answer Explanation:** `fixed inset-0 z-50` covers the viewport. `bg-black/90` is 90% opaque black. `flex flex-col items-center justify-center` centers the menu items.

---

#### Assignment 148: Two-Column with Sticky Image
**Task:** Image sticks while text scrolls.

```html
<div class="flex gap-8 max-w-5xl mx-auto p-8">
  <div class="w-1/2">
    <div class="sticky top-8">
      <img src="/hero.jpg" class="rounded-2xl w-full object-cover aspect-square" alt="Sticky">
    </div>
  </div>
  <div class="w-1/2 space-y-6">
    <h2 class="text-3xl font-bold">Long Content</h2>
    <p>Paragraph 1...</p>
    <p>Paragraph 2...</p>
    <p>Paragraph 3...</p>
    <p>Paragraph 4...</p>
    <p>Many more paragraphs...</p>
  </div>
</div>
```

**Answer Explanation:** `sticky top-8` on the image wrapper makes it stick 2rem from the top while the adjacent text column scrolls normally.

---

#### Assignment 149: Auto-Responsive Grid with minmax
**Task:** Grid that adjusts columns based on content.

```html
<div class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-6 p-6">
  <div class="bg-white rounded-lg shadow-md p-6 space-y-3">
    <div class="h-2 w-3/4 bg-gray-200 rounded"></div>
    <div class="h-2 w-full bg-gray-100 rounded"></div>
    <div class="h-2 w-5/6 bg-gray-100 rounded"></div>
  </div>
  <!-- Repeat cards as needed -->
</div>
```

**Answer Explanation:** `minmax(min(100%,300px),1fr)` handles small screens gracefully by using `min()` to prevent overflow. The grid auto-adjusts column count.

---

#### Assignment 150: Full-Bleed Layout
**Task:** Content container with full-bleed breakout sections.

```html
<div class="grid grid-cols-[1fr_min(65ch,100%)_1fr]">
  <p class="col-start-2 py-4">Normal width paragraph confined to reading width...</p>

  <div class="col-span-full bg-blue-600 text-white py-12 px-6 text-center">
    <h2 class="text-3xl font-bold">Full Bleed Section</h2>
    <p class="mt-2 opacity-80">Breaks out of the content container</p>
  </div>

  <p class="col-start-2 py-4">Back to normal width paragraph...</p>
</div>
```

**Answer Explanation:** The 3-column grid `[1fr_min(65ch,100%)_1fr]` constrains content to 65ch center column. `col-span-full` breaks out to full width.

---

#### Assignment 151: Scrollbar Customization (TW4)
**Task:** Style scrollbars to match the design.

```html
<div class="h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 rounded p-4">
  <!-- Note: scrollbar utilities require @tailwindcss/scrollbar plugin -->
  <!-- Alternative with arbitrary properties in TW4: -->
  <div class="h-64 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100">
    <p>Long scrollable content...</p>
  </div>
</div>
```

**Answer Explanation:** Tailwind 4's arbitrary variant syntax `[&::-webkit-scrollbar]` targets scrollbar pseudo-elements directly. Creates custom scrollbar appearance.

---

#### Assignment 152: CSS Grid Animation Layout
**Task:** Expandable grid item with smooth animation.

```html
<div class="grid grid-cols-3 gap-4">
  <div class="bg-blue-200 p-4 rounded-lg transition-all duration-500 hover:col-span-2 hover:row-span-2 hover:bg-blue-400 hover:text-white hover:shadow-xl cursor-pointer">
    Hover to expand
  </div>
  <div class="bg-green-200 p-4 rounded-lg">Static</div>
  <div class="bg-red-200 p-4 rounded-lg">Static</div>
  <div class="bg-yellow-200 p-4 rounded-lg">Static</div>
  <div class="bg-purple-200 p-4 rounded-lg">Static</div>
</div>
```

**Answer Explanation:** `hover:col-span-2 hover:row-span-2` expands the item on hover. `transition-all duration-500` smooths the growth. Note: grid span transitions have limited browser support.

---

#### Assignment 153: Layered Background Effects
**Task:** Multiple layered background effects.

```html
<div class="relative overflow-hidden rounded-2xl">
  <div class="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400"></div>
  <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent_50%)]"></div>
  <div class="absolute inset-0 backdrop-blur-[1px]"></div>
  <div class="relative z-10 p-12 text-white text-center">
    <h1 class="text-4xl font-bold">Layered Hero</h1>
    <p class="mt-4 text-lg opacity-90">Multiple background effects stacked</p>
  </div>
</div>
```

**Answer Explanation:** Multiple `absolute inset-0` layers stack on top of each other. Arbitrary gradient syntax creates custom radial gradients. `relative z-10` brings content above the layers.

---

#### Assignment 154: Responsive Table
**Task:** Table that transforms to card layout on mobile.

```html
<!-- Desktop: Table | Mobile: Stacked cards -->
<div class="hidden md:block overflow-x-auto">
  <table class="w-full text-left">
    <thead class="bg-gray-100">
      <tr>
        <th class="p-3">Name</th><th class="p-3">Role</th><th class="p-3">Status</th>
      </tr>
    </thead>
    <tbody class="divide-y">
      <tr><td class="p-3">Alice</td><td class="p-3">Engineer</td><td class="p-3">Active</td></tr>
      <tr><td class="p-3">Bob</td><td class="p-3">Designer</td><td class="p-3">Away</td></tr>
    </tbody>
  </table>
</div>

<!-- Mobile card version -->
<div class="md:hidden space-y-4">
  <div class="bg-white rounded-lg shadow p-4 space-y-2">
    <div class="flex justify-between"><span class="font-semibold">Name</span><span>Alice</span></div>
    <div class="flex justify-between"><span class="font-semibold">Role</span><span>Engineer</span></div>
    <div class="flex justify-between"><span class="font-semibold">Status</span><span>Active</span></div>
  </div>
</div>
```

**Answer Explanation:** `hidden md:block` shows the table on desktop. `md:hidden` shows cards on mobile. A common pattern for responsive data display.

---

#### Assignment 155: Viewport Height Sections with Snap
**Task:** Full-screen scroll-snapping sections.

```html
<div class="h-screen overflow-y-auto snap-y snap-mandatory">
  <section class="h-screen snap-start bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
    <h1 class="text-white text-6xl font-bold">Section 1</h1>
  </section>
  <section class="h-screen snap-start bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
    <h1 class="text-white text-6xl font-bold">Section 2</h1>
  </section>
  <section class="h-screen snap-start bg-gradient-to-br from-green-500 to-teal-400 flex items-center justify-center">
    <h1 class="text-white text-6xl font-bold">Section 3</h1>
  </section>
</div>
```

**Answer Explanation:** `snap-y snap-mandatory` enables vertical scroll snapping. `snap-start` on each section defines snap points. Each section fills the viewport with `h-screen`.

---

### Section O: Advanced Tailwind 4 Features (156–175)

---

#### Assignment 156: CSS Variables with Tailwind 4
**Task:** Use CSS custom properties with Tailwind 4's `@theme` directive.

```css
/* In your CSS file */
@import "tailwindcss";

@theme {
  --color-brand: #6366f1;
  --color-brand-light: #818cf8;
  --color-brand-dark: #4338ca;
  --font-display: "Cal Sans", sans-serif;
}
```

```html
<h1 class="text-brand font-display text-4xl">Themed Heading</h1>
<button class="bg-brand hover:bg-brand-dark text-white px-6 py-3 rounded-lg">
  Branded Button
</button>
```

**Answer Explanation:** Tailwind CSS 4 uses `@theme` to define design tokens as CSS variables. Colors, fonts, and spacing become utilities automatically.

---

#### Assignment 157: Tailwind 4 CSS-First Configuration
**Task:** Configure Tailwind entirely in CSS (no `tailwind.config.js`).

```css
@import "tailwindcss";

@theme {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;

  --color-primary: oklch(0.6 0.2 260);
  --color-secondary: oklch(0.7 0.15 330);

  --font-sans: "Inter", system-ui, sans-serif;
  --spacing-18: 4.5rem;

  --radius-card: 1rem;
}
```

```html
<div class="rounded-card bg-primary p-18 font-sans">
  CSS-first config in action
</div>
```

**Answer Explanation:** Tailwind 4 moves configuration from JS to CSS. `@theme` replaces `tailwind.config.js`. Custom tokens auto-generate utilities. OKLCH colors are supported natively.

---

#### Assignment 158: OKLCH Colors (TW4)
**Task:** Use OKLCH color space for better perceptual uniformity.

```html
<div class="flex gap-4">
  <div class="size-20 rounded-lg bg-[oklch(0.7_0.15_150)]"></div>
  <div class="size-20 rounded-lg bg-[oklch(0.7_0.15_200)]"></div>
  <div class="size-20 rounded-lg bg-[oklch(0.7_0.15_250)]"></div>
  <div class="size-20 rounded-lg bg-[oklch(0.7_0.15_300)]"></div>
  <div class="size-20 rounded-lg bg-[oklch(0.7_0.15_350)]"></div>
</div>
```

**Answer Explanation:** OKLCH provides perceptually uniform colors. Same lightness/chroma across different hues. Tailwind 4's default palette uses OKLCH. Arbitrary values support it.

---

#### Assignment 159: Nesting with `@apply` and Native CSS
**Task:** Use Tailwind 4's improved CSS nesting with `@apply`.

```css
@import "tailwindcss";

.card {
  @apply bg-white rounded-xl shadow-md overflow-hidden;

  & .card-header {
    @apply bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white;
  }

  & .card-body {
    @apply p-6 space-y-4;
  }

  &:hover {
    @apply shadow-xl -translate-y-1;
    transition: all 0.3s ease;
  }
}
```

**Answer Explanation:** Tailwind 4 supports native CSS nesting with `&`. `@apply` extracts utility classes into component styles. Use sparingly — utility-first is preferred.

---

#### Assignment 160: Variant Groups (TW4)
**Task:** Apply multiple utilities under one variant efficiently.

```html
<!-- Without variant groups (verbose) -->
<div class="hover:bg-blue-500 hover:text-white hover:shadow-lg hover:scale-105">
  Verbose
</div>

<!-- With variant groups in TW4 (concept) — use standard approach -->
<div class="group/card bg-white p-6 rounded-lg transition-all hover:bg-blue-500 hover:text-white hover:shadow-lg hover:scale-105">
  Efficient with named groups
</div>
```

**Answer Explanation:** While Tailwind doesn't have bracket variant grouping syntax, named groups (`group/name`) and structured classes achieve clean multi-state styling.

---

#### Assignment 161: Named Groups (TW4)
**Task:** Use multiple named groups for complex component interactions.

```html
<div class="group/card bg-white rounded-xl shadow p-6">
  <div class="group/header flex items-center justify-between">
    <h3 class="font-bold group-hover/header:text-blue-600 transition-colors">Title</h3>
    <button class="opacity-0 group-hover/header:opacity-100 transition-opacity">Edit</button>
  </div>
  <p class="text-gray-500 group-hover/card:text-gray-700 transition-colors mt-2">
    Card description
  </p>
</div>
```

**Answer Explanation:** `group/card` and `group/header` create independent hover scopes. `group-hover/header:` targets only the header group's hover state.

---

#### Assignment 162: 3D Transforms
**Task:** Create a 3D card flip effect.

```html
<div class="group [perspective:1000px] w-64 h-40">
  <div class="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
    <!-- Front -->
    <div class="absolute inset-0 [backface-visibility:hidden] bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white flex items-center justify-center">
      <h3 class="text-xl font-bold">Front Side</h3>
    </div>
    <!-- Back -->
    <div class="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-pink-500 to-orange-400 rounded-xl p-6 text-white flex items-center justify-center">
      <p class="text-center">Back side content revealed on hover!</p>
    </div>
  </div>
</div>
```

**Answer Explanation:** Arbitrary values `[perspective:1000px]`, `[transform-style:preserve-3d]`, and `[backface-visibility:hidden]` enable 3D transforms. `group-hover:[transform:rotateY(180deg)]` triggers the flip.

---

#### Assignment 163: Custom Easing Functions
**Task:** Apply custom cubic-bezier easing.

```html
<button class="bg-purple-500 text-white px-8 py-4 rounded-lg
  hover:bg-purple-700 hover:scale-110 hover:shadow-xl
  transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
  Bouncy Hover
</button>
```

**Answer Explanation:** `ease-[cubic-bezier(0.34,1.56,0.64,1)]` defines a custom easing with overshoot, creating a bouncy effect. Arbitrary values work for timing functions.

---

#### Assignment 164: Logical Properties (TW4)
**Task:** Use logical properties for RTL/LTR support.

```html
<div class="ms-4 me-8 ps-6 pe-2 border-s-4 border-blue-500 text-start">
  <p>This layout respects text direction.</p>
  <p>In LTR: margin-left, margin-right, padding-left, padding-right, border-left</p>
  <p>In RTL: these flip automatically!</p>
</div>
```

**Answer Explanation:** `ms-*` (margin-start), `me-*` (margin-end), `ps-*` (padding-start), `pe-*` (padding-end), `border-s-*` (border-start). These flip in RTL contexts.

---

#### Assignment 165: @starting-style for Entry Animations (TW4)
**Task:** Animate elements when they first appear.

```html
<div class="transition-all duration-500
  starting:opacity-0 starting:translate-y-4
  opacity-100 translate-y-0">
  Fades in from below on mount
</div>
```

**Answer Explanation:** Tailwind 4 supports `@starting-style` via the `starting:` variant. It sets the initial state for CSS transitions when elements first render. Enables pure CSS entry animations.

---

#### Assignment 166: Color Mix Function (TW4)
**Task:** Mix two colors together.

```html
<div class="bg-[color-mix(in_oklch,theme(--color-blue-500)_70%,white)] p-6 rounded-lg">
  70% blue mixed with white
</div>

<div class="bg-[color-mix(in_oklch,theme(--color-red-500),theme(--color-blue-500))] p-6 rounded-lg text-white">
  Red + Blue mix
</div>
```

**Answer Explanation:** CSS `color-mix()` in arbitrary values creates blended colors. `in oklch` ensures perceptual blending. Tailwind 4's `theme()` function accesses design tokens.

---

#### Assignment 167: Anchor Positioning (TW4)
**Task:** Use CSS anchor positioning for tooltips.

```html
<div class="relative">
  <button class="[anchor-name:--tooltip-anchor] bg-blue-500 text-white px-4 py-2 rounded">
    Hover me
  </button>
  <div class="fixed [position-anchor:--tooltip-anchor]
    [top:anchor(bottom)] [left:anchor(center)]
    bg-gray-900 text-white text-sm px-3 py-1 rounded mt-2
    opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
    Tooltip content
  </div>
</div>
```

**Answer Explanation:** CSS Anchor Positioning (emerging spec) allows elements to position relative to anchors. Tailwind 4 supports this via arbitrary properties. Browser support is growing.

---

#### Assignment 168: Cascade Layers (TW4)
**Task:** Use CSS cascade layers for specificity management.

```css
@import "tailwindcss";

@layer components {
  .btn {
    @apply px-4 py-2 rounded font-medium transition-colors;
  }

  .btn-primary {
    @apply bg-blue-500 text-white hover:bg-blue-600;
  }

  .btn-secondary {
    @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
  }
}

@layer utilities {
  .text-gradient {
    @apply bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent;
  }
}
```

**Answer Explanation:** Tailwind 4 uses CSS `@layer` natively for cascade management. Components sit below utilities in specificity, so utility classes always win.

---

#### Assignment 169: Dynamic Grid with Container Queries
**Task:** Grid that adapts based on container size.

```html
<div class="@container">
  <div class="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 @xl:grid-cols-4 gap-4">
    <div class="bg-white rounded-lg shadow p-4">Widget 1</div>
    <div class="bg-white rounded-lg shadow p-4">Widget 2</div>
    <div class="bg-white rounded-lg shadow p-4">Widget 3</div>
    <div class="bg-white rounded-lg shadow p-4">Widget 4</div>
    <div class="bg-white rounded-lg shadow p-4">Widget 5</div>
    <div class="bg-white rounded-lg shadow p-4">Widget 6</div>
  </div>
</div>
```

**Answer Explanation:** Container queries (`@container` + `@sm:`, `@lg:`, `@xl:`) let the grid respond to its parent's width, not the viewport. Ideal for reusable widget components.

---

#### Assignment 170: Forced Colors Mode
**Task:** Ensure UI works in Windows High Contrast mode.

```html
<button class="bg-blue-500 text-white px-6 py-3 rounded-lg
  forced-colors:bg-[ButtonFace] forced-colors:text-[ButtonText] forced-colors:border-2 forced-colors:border-[ButtonText]">
  Accessible Button
</button>
```

**Answer Explanation:** `forced-colors:` variant targets `@media (forced-colors: active)`. System color keywords like `ButtonFace` and `ButtonText` ensure visibility in high-contrast mode.

---

#### Assignment 171: Custom Variant with @variant (TW4)
**Task:** Define a reusable custom variant.

```css
@import "tailwindcss";

@custom-variant pointer-coarse (@media (pointer: coarse));
@custom-variant pointer-fine (@media (pointer: fine));
```

```html
<button class="px-4 py-2 pointer-coarse:px-6 pointer-coarse:py-4 pointer-coarse:text-lg
  pointer-fine:px-3 pointer-fine:py-1.5 pointer-fine:text-sm
  bg-blue-500 text-white rounded-lg">
  Adaptive Button
</button>
```

**Answer Explanation:** `@custom-variant` in Tailwind 4 creates reusable selectors/media queries. Touch devices get larger tap targets, mouse users get compact buttons.

---

#### Assignment 172: Field Sizing (TW4)
**Task:** Auto-resize a textarea to fit content.

```html
<textarea class="field-sizing-content border rounded-lg p-3 w-full min-h-[80px] max-h-64 resize-none"
  placeholder="Type here — I'll grow with your content">
</textarea>
```

**Answer Explanation:** `field-sizing-content` applies `field-sizing: content`, a newer CSS property that auto-sizes form fields. Tailwind 4 includes it as a utility.

---

#### Assignment 173: @property Registration (Advanced CSS)
**Task:** Register custom properties for animatable gradients.

```css
@import "tailwindcss";

@property --gradient-angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

.animate-gradient {
  --gradient-angle: 0deg;
  background: conic-gradient(from var(--gradient-angle), #6366f1, #ec4899, #6366f1);
  animation: spin-gradient 3s linear infinite;
}

@keyframes spin-gradient {
  to { --gradient-angle: 360deg; }
}
```

```html
<div class="animate-gradient size-48 rounded-full"></div>
```

**Answer Explanation:** `@property` registers custom properties with types, enabling gradient angle animation. Without registration, CSS can't animate custom properties.

---

#### Assignment 174: Subgrid Layout with Aligned Cards
**Task:** Align card contents across a grid using subgrid.

```html
<div class="grid grid-cols-3 gap-6">
  <div class="grid grid-rows-subgrid row-span-3 bg-white rounded-xl shadow p-6">
    <h3 class="text-xl font-bold">Basic Plan</h3>
    <p class="text-gray-500">Perfect for starters with limited needs</p>
    <button class="bg-blue-500 text-white rounded-lg py-2 self-end">Choose</button>
  </div>
  <div class="grid grid-rows-subgrid row-span-3 bg-white rounded-xl shadow p-6">
    <h3 class="text-xl font-bold">Pro Plan</h3>
    <p class="text-gray-500">For growing teams that need more power and flexibility</p>
    <button class="bg-blue-500 text-white rounded-lg py-2 self-end">Choose</button>
  </div>
  <div class="grid grid-rows-subgrid row-span-3 bg-white rounded-xl shadow p-6">
    <h3 class="text-xl font-bold">Enterprise</h3>
    <p class="text-gray-500">Custom solutions</p>
    <button class="bg-blue-500 text-white rounded-lg py-2 self-end">Choose</button>
  </div>
</div>
```

**Answer Explanation:** `grid-rows-subgrid row-span-3` inherits row tracks from the parent. Each card's title, description, and button align across columns regardless of content length.

---

#### Assignment 175: Light-Dark Function (TW4)
**Task:** Use CSS `light-dark()` function for theme colors.

```html
<div class="bg-[light-dark(#ffffff,#1a1a2e)] text-[light-dark(#1a1a2e,#e0e0e0)] p-8 rounded-xl">
  <h2 class="text-2xl font-bold text-[light-dark(#333,#fff)]">Auto Theme</h2>
  <p class="mt-2">This adapts automatically to system color scheme.</p>
</div>
```

**Answer Explanation:** CSS `light-dark()` function selects between two values based on the current color scheme. Tailwind 4 supports it in arbitrary values. Requires `color-scheme: light dark` on the root.

---

### Section P: Component Patterns (176–190)

---

#### Assignment 176: Responsive Navbar
**Task:** Build a full responsive navigation bar.

```html
<nav class="bg-white shadow-sm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16 items-center">
      <div class="flex items-center">
        <span class="text-xl font-bold text-blue-600">Brand</span>
      </div>
      <!-- Desktop Nav -->
      <div class="hidden md:flex items-center gap-8">
        <a href="#" class="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
        <a href="#" class="text-gray-700 hover:text-blue-600 transition-colors">Products</a>
        <a href="#" class="text-gray-700 hover:text-blue-600 transition-colors">About</a>
        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Sign Up
        </button>
      </div>
      <!-- Mobile Hamburger -->
      <button class="md:hidden text-2xl">☰</button>
    </div>
  </div>
</nav>
```

**Answer Explanation:** Uses `hidden md:flex` for desktop nav and `md:hidden` for mobile hamburger. `max-w-7xl mx-auto` centers the content. A production-ready navbar pattern.

---

#### Assignment 177: Modal Dialog
**Task:** Create a centered modal with backdrop.

```html
<!-- Backdrop -->
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <!-- Modal -->
  <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
    <div class="flex justify-between items-center p-6 border-b">
      <h2 class="text-xl font-bold">Modal Title</h2>
      <button class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
    </div>
    <div class="p-6">
      <p class="text-gray-600">Modal body content goes here with any elements you need.</p>
    </div>
    <div class="flex justify-end gap-3 p-6 border-t bg-gray-50">
      <button class="px-4 py-2 rounded-lg border hover:bg-gray-100 transition">Cancel</button>
      <button class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">Confirm</button>
    </div>
  </div>
</div>
```

**Answer Explanation:** `fixed inset-0 z-50` creates full-screen overlay. `flex items-center justify-center` centers the modal. `backdrop-blur-sm` blurs the background. `max-w-md mx-4` constrains width.

---

#### Assignment 178: Toast Notification
**Task:** Create a toast notification.

```html
<div class="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl
  animate-[slideInRight_0.3s_ease-out]">
  <span class="text-green-400 text-xl">✓</span>
  <div>
    <p class="font-medium">Success!</p>
    <p class="text-sm text-gray-400">Your changes have been saved.</p>
  </div>
  <button class="ml-4 text-gray-400 hover:text-white">&times;</button>
</div>
```

**Answer Explanation:** `fixed bottom-6 right-6 z-50` pins it to the bottom-right. Arbitrary keyframes `animate-[slideInRight_0.3s_ease-out]` add entrance animation (keyframes defined in CSS).

---

#### Assignment 179: Pricing Card
**Task:** Build an elevated pricing card.

```html
<div class="bg-white rounded-2xl shadow-xl border-2 border-blue-500 p-8 relative overflow-hidden">
  <div class="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
    POPULAR
  </div>
  <h3 class="text-lg font-semibold text-gray-500">Pro Plan</h3>
  <div class="mt-4 flex items-baseline gap-1">
    <span class="text-5xl font-extrabold">$29</span>
    <span class="text-gray-500">/month</span>
  </div>
  <ul class="mt-8 space-y-4">
    <li class="flex items-center gap-3">
      <span class="text-green-500">✓</span>Unlimited projects
    </li>
    <li class="flex items-center gap-3">
      <span class="text-green-500">✓</span>Priority support
    </li>
    <li class="flex items-center gap-3">
      <span class="text-green-500">✓</span>Advanced analytics
    </li>
  </ul>
  <button class="mt-8 w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors">
    Get Started
  </button>
</div>
```

**Answer Explanation:** `border-2 border-blue-500` highlights the card. `absolute` badge positions the "POPULAR" tag. `flex items-baseline gap-1` aligns the price. Clean, production-ready pricing card.

---

#### Assignment 180: Avatar Group
**Task:** Create overlapping avatar stack.

```html
<div class="flex -space-x-3">
  <img src="/avatar1.jpg" class="size-10 rounded-full border-2 border-white relative z-40 object-cover" alt="User 1">
  <img src="/avatar2.jpg" class="size-10 rounded-full border-2 border-white relative z-30 object-cover" alt="User 2">
  <img src="/avatar3.jpg" class="size-10 rounded-full border-2 border-white relative z-20 object-cover" alt="User 3">
  <div class="size-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 relative z-10">
    +5
  </div>
</div>
```

**Answer Explanation:** `-space-x-3` creates negative spacing for overlap. Descending `z-*` values ensure left-to-right stacking. `border-2 border-white` creates separation rings.

---

#### Assignment 181: Search Input with Icon
**Task:** Build a search input with embedded icon.

```html
<div class="relative max-w-md">
  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
    <svg class="size-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
    </svg>
  </div>
  <input type="search"
    class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50
      focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200
      focus:outline-none transition-all"
    placeholder="Search...">
</div>
```

**Answer Explanation:** `relative` on wrapper + `absolute` on icon positions it inside the input. `pl-10` on the input creates space for the icon. `pointer-events-none` prevents icon from blocking clicks.

---

#### Assignment 182: Toggle Switch
**Task:** Create a custom toggle switch.

```html
<label class="relative inline-flex items-center cursor-pointer">
  <input type="checkbox" class="sr-only peer">
  <div class="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-blue-200 rounded-full
    peer-checked:bg-blue-500 transition-colors duration-300
    after:content-[''] after:absolute after:top-[2px] after:start-[2px]
    after:bg-white after:rounded-full after:size-5 after:transition-all after:duration-300
    peer-checked:after:translate-x-full">
  </div>
  <span class="ml-3 text-sm font-medium text-gray-700">Dark Mode</span>
</label>
```

**Answer Explanation:** `sr-only` hides the native checkbox. `peer-checked:` styles the visual toggle. `after:` pseudo-element creates the knob. `peer-checked:after:translate-x-full` slides it.

---

#### Assignment 183: Breadcrumb Navigation
**Task:** Build a breadcrumb trail.

```html
<nav class="flex items-center gap-2 text-sm">
  <a href="#" class="text-gray-500 hover:text-blue-600 transition-colors">Home</a>
  <span class="text-gray-300">/</span>
  <a href="#" class="text-gray-500 hover:text-blue-600 transition-colors">Products</a>
  <span class="text-gray-300">/</span>
  <span class="text-gray-900 font-medium">Current Page</span>
</nav>
```

**Answer Explanation:** `flex items-center gap-2` lays items inline with spacing. Separators are styled with `text-gray-300`. The current page uses `font-medium` and darker text.

---

#### Assignment 184: Progress Bar
**Task:** Create an animated progress bar.

```html
<div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
  <div class="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out"
    style="width: 72%">
  </div>
</div>
<p class="text-sm text-gray-500 mt-2">72% complete</p>
```

**Answer Explanation:** Outer bar is `bg-gray-200 rounded-full`. Inner bar fills with gradient. `transition-all duration-1000` animates width changes. Inline style sets the percentage.

---

#### Assignment 185: Badge/Tag Component
**Task:** Create multiple badge variants.

```html
<div class="flex flex-wrap gap-2">
  <span class="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">Info</span>
  <span class="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full">Success</span>
  <span class="bg-yellow-100 text-yellow-700 text-xs font-medium px-2.5 py-0.5 rounded-full">Warning</span>
  <span class="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-0.5 rounded-full">Error</span>
  <span class="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full">Default</span>
</div>
```

**Answer Explanation:** Each badge uses a light background (`-100`) with matching dark text (`-700`). `rounded-full` creates pill shape. `text-xs px-2.5 py-0.5` keeps them compact.

---

#### Assignment 186: Skeleton Loading Screen
**Task:** Create a skeleton loader for a card.

```html
<div class="bg-white rounded-xl shadow p-6 max-w-sm animate-pulse">
  <div class="h-48 bg-gray-200 rounded-lg mb-4"></div>
  <div class="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
  <div class="h-4 bg-gray-200 rounded w-full mb-3"></div>
  <div class="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
  <div class="flex items-center gap-3">
    <div class="size-10 bg-gray-200 rounded-full"></div>
    <div>
      <div class="h-3 bg-gray-200 rounded w-24 mb-2"></div>
      <div class="h-3 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
</div>
```

**Answer Explanation:** `animate-pulse` creates a pulsing effect. Gray rounded divs mimic content shapes. Varying widths (`w-3/4`, `w-full`, `w-5/6`) create a realistic text placeholder look.

---

#### Assignment 187: Timeline Component
**Task:** Create a vertical timeline.

```html
<div class="relative pl-8 space-y-8 before:absolute before:left-3 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-200">
  <div class="relative">
    <div class="absolute -left-8 top-1 size-6 rounded-full bg-blue-500 border-4 border-white shadow"></div>
    <div class="bg-white rounded-lg shadow p-4">
      <time class="text-sm text-gray-400">2024 Q1</time>
      <h3 class="font-semibold mt-1">Project Launch</h3>
      <p class="text-gray-500 text-sm mt-1">Initial release of the platform.</p>
    </div>
  </div>
  <div class="relative">
    <div class="absolute -left-8 top-1 size-6 rounded-full bg-green-500 border-4 border-white shadow"></div>
    <div class="bg-white rounded-lg shadow p-4">
      <time class="text-sm text-gray-400">2024 Q2</time>
      <h3 class="font-semibold mt-1">Feature Update</h3>
      <p class="text-gray-500 text-sm mt-1">Major new features added.</p>
    </div>
  </div>
</div>
```

**Answer Explanation:** `before:` pseudo-element creates the vertical line. `absolute -left-8` positions dots on the line. Cards offset to the right with `pl-8`. Clean timeline pattern.

---

#### Assignment 188: Accordion Component
**Task:** Build a CSS-only accordion using details/summary.

```html
<div class="max-w-lg mx-auto space-y-2">
  <details class="group bg-white rounded-lg shadow">
    <summary class="flex justify-between items-center cursor-pointer p-4 font-medium list-none">
      What is TailwindCSS?
      <span class="transition-transform duration-300 group-open:rotate-180">▼</span>
    </summary>
    <div class="px-4 pb-4 text-gray-600">
      Tailwind CSS is a utility-first CSS framework that provides low-level utility classes to build designs directly in your markup.
    </div>
  </details>
  <details class="group bg-white rounded-lg shadow">
    <summary class="flex justify-between items-center cursor-pointer p-4 font-medium list-none">
      What's new in version 4?
      <span class="transition-transform duration-300 group-open:rotate-180">▼</span>
    </summary>
    <div class="px-4 pb-4 text-gray-600">
      Tailwind CSS 4 features a new engine, CSS-first configuration, OKLCH colors, container queries, and many new utilities.
    </div>
  </details>
</div>
```

**Answer Explanation:** `<details>` provides native toggle behavior. `group-open:rotate-180` rotates the arrow when open. `list-none` on `<summary>` removes the default marker. No JS needed.

---

#### Assignment 189: Notification Panel
**Task:** Build a notification dropdown panel.

```html
<div class="w-80 bg-white rounded-xl shadow-2xl border overflow-hidden">
  <div class="flex items-center justify-between p-4 border-b">
    <h3 class="font-bold">Notifications</h3>
    <span class="bg-red-500 text-white text-xs size-5 rounded-full flex items-center justify-center">3</span>
  </div>
  <div class="divide-y max-h-80 overflow-y-auto">
    <div class="flex gap-3 p-4 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
      <div class="size-10 rounded-full bg-blue-200 shrink-0 flex items-center justify-center">💬</div>
      <div>
        <p class="text-sm font-medium">New comment on your post</p>
        <p class="text-xs text-gray-400 mt-1">2 minutes ago</p>
      </div>
    </div>
    <div class="flex gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer">
      <div class="size-10 rounded-full bg-green-200 shrink-0 flex items-center justify-center">✓</div>
      <div>
        <p class="text-sm">Task completed successfully</p>
        <p class="text-xs text-gray-400 mt-1">1 hour ago</p>
      </div>
    </div>
  </div>
  <div class="p-3 border-t text-center">
    <a href="#" class="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</a>
  </div>
</div>
```

**Answer Explanation:** `shadow-2xl border` gives depth. `divide-y` separates items. `bg-blue-50` highlights unread. `max-h-80 overflow-y-auto` enables scrolling. Complete notification panel.

---

#### Assignment 190: Testimonial Card
**Task:** Create a testimonial card with quote styling.

```html
<div class="bg-white rounded-2xl shadow-lg p-8 max-w-md relative">
  <div class="text-6xl text-blue-200 absolute -top-4 left-6 font-serif">"</div>
  <p class="text-gray-600 leading-relaxed relative z-10">
    This framework has completely transformed our development workflow. We ship features in half the time.
  </p>
  <div class="flex items-center gap-4 mt-6">
    <div class="size-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
    <div>
      <p class="font-semibold">Jane Smith</p>
      <p class="text-sm text-gray-400">CTO, TechCorp</p>
    </div>
  </div>
</div>
```

**Answer Explanation:** Oversized quote mark positioned `absolute -top-4 left-6`. `leading-relaxed` improves readability. Avatar uses gradient as placeholder. `relative z-10` on text keeps it above the quote mark.

---

### Section Q: Performance & Production (191–200)

---

#### Assignment 191: Content Visibility
**Task:** Optimize rendering of off-screen content.

```html
<div class="[content-visibility:auto] [contain-intrinsic-size:auto_500px]">
  <div class="space-y-4 p-6">
    <!-- Heavy content block that is only rendered when near viewport -->
    <div class="bg-white rounded-lg shadow p-4">Heavy component 1</div>
    <div class="bg-white rounded-lg shadow p-4">Heavy component 2</div>
  </div>
</div>
```

**Answer Explanation:** `content-visibility: auto` skips rendering off-screen content. `contain-intrinsic-size` reserves space to prevent layout shift. Major performance optimization for long pages.

---

#### Assignment 192: Composing Utility Classes with @apply
**Task:** Create a reusable button system with @apply.

```css
@import "tailwindcss";

@layer components {
  .btn {
    @apply inline-flex items-center justify-center gap-2 rounded-lg font-medium
           transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
           disabled:opacity-50 disabled:cursor-not-allowed;
  }
  .btn-sm { @apply px-3 py-1.5 text-sm; }
  .btn-md { @apply px-5 py-2.5 text-base; }
  .btn-lg { @apply px-8 py-3.5 text-lg; }
  .btn-primary { @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500; }
  .btn-secondary { @apply bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400; }
  .btn-danger { @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500; }
}
```

```html
<button class="btn btn-primary btn-md">Save Changes</button>
<button class="btn btn-secondary btn-sm">Cancel</button>
<button class="btn btn-danger btn-lg">Delete Account</button>
```

**Answer Explanation:** `@apply` extracts repeated utilities into component classes. `@layer components` ensures utilities can still override them. A scalable button system.

---

#### Assignment 193: Responsive Image with Art Direction
**Task:** Different image crops for different screen sizes.

```html
<picture>
  <source media="(min-width: 1024px)" srcset="/hero-wide.jpg">
  <source media="(min-width: 640px)" srcset="/hero-medium.jpg">
  <img src="/hero-mobile.jpg" class="w-full h-64 sm:h-80 lg:h-[500px] object-cover rounded-xl" alt="Hero">
</picture>
```

**Answer Explanation:** `<picture>` with `<source>` media queries loads different images per breakpoint. Tailwind handles responsive sizing. `object-cover` ensures proper crop.

---

#### Assignment 194: Critical CSS Pattern
**Task:** Inline critical styles and defer the rest.

```html
<head>
  <!-- Critical above-the-fold CSS inlined -->
  <style>
    /* Minimal reset + above-fold layout utilities */
    .hero { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  </style>
  <!-- Full Tailwind loaded asynchronously -->
  <link rel="preload" href="/dist/output.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/dist/output.css"></noscript>
</head>
```

**Answer Explanation:** Critical CSS is inlined for instant first paint. Full Tailwind CSS is preloaded asynchronously. `noscript` fallback ensures CSS loads without JS. Reduces render-blocking.

---

#### Assignment 195: GPU-Accelerated Animations
**Task:** Ensure animations run on the GPU.

```html
<div class="transform-gpu transition-transform duration-500 hover:translate-x-4 hover:scale-105 will-change-transform bg-white rounded-xl shadow-lg p-6">
  GPU-accelerated movement
</div>

<!-- Avoid: These trigger layout recalculation -->
<!-- Bad: hover:w-64 hover:h-48 hover:p-8 -->
```

**Answer Explanation:** `transform-gpu` forces GPU acceleration via `translate3d(0,0,0)`. `will-change-transform` hints the browser. Only use `translate`, `scale`, `rotate`, and `opacity` for 60fps animations.

---

#### Assignment 196: Reduced Motion Accessibility
**Task:** Respect user's motion preferences.

```html
<div class="animate-bounce motion-reduce:animate-none">
  <span class="text-2xl">↓</span>
</div>

<div class="transition-all duration-500 hover:-translate-y-2 hover:shadow-xl
  motion-reduce:transition-none motion-reduce:hover:transform-none">
  <div class="bg-white rounded-lg shadow p-6">
    Accessible animated card
  </div>
</div>
```

**Answer Explanation:** `motion-reduce:animate-none` disables animations for users with `prefers-reduced-motion: reduce`. `motion-reduce:transition-none` disables transitions. Essential for accessibility.

---

#### Assignment 197: Tailwind 4 Oxide Engine Optimization
**Task:** Structure CSS for optimal Tailwind 4 performance.

```css
/* Optimized Tailwind 4 entry file */
@import "tailwindcss";

/* Layer 1: Theme tokens — compiled once */
@theme {
  --color-brand-50: oklch(0.97 0.01 260);
  --color-brand-500: oklch(0.55 0.2 260);
  --color-brand-900: oklch(0.25 0.1 260);
  --font-heading: "Plus Jakarta Sans", sans-serif;
}

/* Layer 2: Base styles — applied globally */
@layer base {
  html { @apply scroll-smooth antialiased; }
  body { @apply bg-gray-50 text-gray-900 font-sans; }
}

/* Layer 3: Components — only what you need */
@layer components {
  .prose-custom { @apply max-w-prose mx-auto leading-relaxed; }
}

/* Layer 4: No arbitrary CSS outside layers */
```

**Answer Explanation:** Tailwind 4's Oxide engine compiles faster with clean layered CSS. `@theme` tokens are resolved at build time. Keeping styles in `@layer` blocks ensures correct specificity.

---

#### Assignment 198: Complex Form Layout
**Task:** Build a comprehensive form with validation states.

```html
<form class="max-w-lg mx-auto space-y-6">
  <!-- Valid field -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
    <input type="email" value="user@example.com"
      class="w-full px-4 py-3 rounded-lg border-2 border-green-500 bg-green-50
        focus:ring-2 focus:ring-green-200 focus:outline-none transition-all"
    >
    <p class="text-green-600 text-sm mt-1 flex items-center gap-1">
      <span>✓</span> Email looks good
    </p>
  </div>

  <!-- Error field -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
    <input type="password"
      class="w-full px-4 py-3 rounded-lg border-2 border-red-500 bg-red-50
        focus:ring-2 focus:ring-red-200 focus:outline-none transition-all"
    >
    <p class="text-red-600 text-sm mt-1 flex items-center gap-1">
      <span>✕</span> Password must be at least 8 characters
    </p>
  </div>

  <!-- Neutral field -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
    <input type="text" placeholder="Choose a username"
      class="w-full px-4 py-3 rounded-lg border-2 border-gray-200
        focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
    >
  </div>

  <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold
    hover:bg-blue-700 active:bg-blue-800 focus:ring-4 focus:ring-blue-200 transition-all">
    Create Account
  </button>
</form>
```

**Answer Explanation:** Three states: valid (`border-green-500 bg-green-50`), error (`border-red-500 bg-red-50`), neutral (`border-gray-200`). Focus states add rings. Validation messages use matching colors.

---

#### Assignment 199: Dark Mode Theme System
**Task:** Build a comprehensive dark mode design system.

```html
<div class="bg-white dark:bg-gray-950 min-h-screen transition-colors duration-300">
  <!-- Header -->
  <header class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
    <h1 class="text-gray-900 dark:text-gray-100 font-bold text-xl">Dashboard</h1>
  </header>

  <!-- Card -->
  <div class="m-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-800 p-6">
    <h2 class="text-gray-800 dark:text-gray-200 font-semibold text-lg">Analytics</h2>
    <p class="text-gray-500 dark:text-gray-400 mt-2">Your weekly performance summary.</p>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 mt-6">
      <div class="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 text-center">
        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">1.2k</p>
        <p class="text-sm text-blue-600/70 dark:text-blue-400/70">Visitors</p>
      </div>
      <div class="bg-green-50 dark:bg-green-950 rounded-lg p-4 text-center">
        <p class="text-2xl font-bold text-green-600 dark:text-green-400">$4.5k</p>
        <p class="text-sm text-green-600/70 dark:text-green-400/70">Revenue</p>
      </div>
      <div class="bg-purple-50 dark:bg-purple-950 rounded-lg p-4 text-center">
        <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">89%</p>
        <p class="text-sm text-purple-600/70 dark:text-purple-400/70">Satisfaction</p>
      </div>
    </div>
  </div>

  <!-- Input -->
  <div class="mx-6">
    <input type="text" placeholder="Search..."
      class="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        text-gray-900 dark:text-gray-100
        placeholder:text-gray-400 dark:placeholder:text-gray-500
        focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors">
  </div>
</div>
```

**Answer Explanation:** Every visual element has `dark:` counterparts. Background goes light→dark (`bg-white`→`dark:bg-gray-950`). Text inverts. Borders, shadows, and stat cards all adapt. The `950` shade is Tailwind 4's deepest tone.

---

#### Assignment 200: Full Landing Page
**Task:** Build a complete responsive landing page combining all concepts.

```html
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landing Page</title>
</head>
<body class="bg-white text-gray-900 antialiased">

  <!-- Navbar -->
  <nav class="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        BrandName
      </span>
      <div class="hidden md:flex items-center gap-8">
        <a href="#features" class="text-sm text-gray-600 hover:text-gray-900 transition">Features</a>
        <a href="#pricing" class="text-sm text-gray-600 hover:text-gray-900 transition">Pricing</a>
        <a href="#faq" class="text-sm text-gray-600 hover:text-gray-900 transition">FAQ</a>
        <button class="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 transition">
          Get Started
        </button>
      </div>
      <button class="md:hidden text-2xl">☰</button>
    </div>
  </nav>

  <!-- Hero -->
  <section class="pt-32 pb-20 px-4">
    <div class="max-w-4xl mx-auto text-center">
      <div class="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
        🚀 Now in v4.0
      </div>
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
        Build beautiful websites
        <span class="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          without leaving your HTML
        </span>
      </h1>
      <p class="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
        A utility-first CSS framework packed with classes that can be composed to build any design, directly in your markup.
      </p>
      <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <button class="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 transition-all">
          Start Building
        </button>
        <button class="border-2 border-gray-200 px-8 py-3.5 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all">
          View Docs
        </button>
      </div>
    </div>
  </section>

  <!-- Features -->
  <section id="features" class="py-20 bg-gray-50">
    <div class="max-w-6xl mx-auto px-4">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-bold">Everything you need</h2>
        <p class="mt-4 text-gray-500 max-w-xl mx-auto">
          Powerful features to help you build modern, responsive websites faster.
        </p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div class="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
          <div class="size-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl mb-4">⚡</div>
          <h3 class="text-lg font-semibold">Lightning Fast</h3>
          <p class="mt-2 text-gray-500 text-sm leading-relaxed">
            Optimized build process that generates minimal CSS for production.
          </p>
        </div>
        <div class="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
          <div class="size-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl mb-4">🎨</div>
          <h3 class="text-lg font-semibold">Fully Customizable</h3>
          <p class="mt-2 text-gray-500 text-sm leading-relaxed">
            Every aspect of the framework can be customized to match your design.
          </p>
        </div>
        <div class="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
          <div class="size-12 rounded-xl bg-pink-100 flex items-center justify-center text-2xl mb-4">📱</div>
          <h3 class="text-lg font-semibold">Responsive by Default</h3>
          <p class="mt-2 text-gray-500 text-sm leading-relaxed">
            Mobile-first design with intuitive responsive modifiers.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="py-20">
    <div class="max-w-4xl mx-auto px-4 text-center">
      <div class="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-12 sm:p-16 text-white">
        <h2 class="text-3xl sm:text-4xl font-bold">Ready to get started?</h2>
        <p class="mt-4 text-blue-100 text-lg max-w-md mx-auto">
          Join thousands of developers building amazing things.
        </p>
        <button class="mt-8 bg-white text-blue-600 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors">
          Start Free Trial
        </button>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-gray-900 text-gray-400 py-12">
    <div class="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between gap-8">
      <div>
        <span class="text-white font-bold text-lg">BrandName</span>
        <p class="mt-2 text-sm">Building the future of web development.</p>
      </div>
      <div class="flex gap-12 text-sm">
        <div class="space-y-2">
          <h4 class="text-white font-medium">Product</h4>
          <a href="#" class="block hover:text-white transition">Features</a>
          <a href="#" class="block hover:text-white transition">Pricing</a>
        </div>
        <div class="space-y-2">
          <h4 class="text-white font-medium">Company</h4>
          <a href="#" class="block hover:text-white transition">About</a>
          <a href="#" class="block hover:text-white transition">Contact</a>
        </div>
      </div>
    </div>
  </footer>

</body>
</html>
```

**Answer Explanation:** This final assignment combines everything: fixed glassmorphic nav (`bg-white/80 backdrop-blur-md`), gradient text (`bg-clip-text text-transparent`), responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`), hover effects, responsive flex layout, utility-first component patterns, and proper semantic structure. A production-ready landing page built entirely with TailwindCSS 4.

---

## 📊 Quick Reference

| Level | Assignments | Topics Covered |
|-------|-------------|----------------|
| **Beginner** | 1–70 | Typography, Spacing, Backgrounds, Borders, Sizing, Flexbox, Display, Visibility, Hover/Focus |
| **Intermediate** | 71–140 | CSS Grid, Positioning, Shadows, Effects, Transitions, Animations, Responsive Design, Pseudo-Classes, Dark Mode |
| **Advanced** | 141–200 | Complex Layouts, TW4 Features (Container Queries, Subgrid, OKLCH, @theme), Component Patterns, Performance, Production Optimization |

---
