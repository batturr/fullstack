# 17. Hover, Focus & Other States

## Pseudo-Class Variants

### Hover
```html
<button class="bg-blue-500 hover:bg-blue-700 text-white">
  Darker on hover
</button>
```

### Focus
```html
<input class="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none">
```

### Focus-Visible (Keyboard Only)
```html
<button class="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none">
  Ring only on keyboard focus, not mouse click
</button>
```

### Focus-Within
```html
<div class="focus-within:ring-2 focus-within:ring-blue-500 rounded-lg p-4">
  <input placeholder="Focus me to highlight parent">
</div>
```

### Active
```html
<button class="bg-blue-500 active:bg-blue-700 active:scale-95 transition">
  Pressed state
</button>
```

### Visited
```html
<a class="text-blue-500 visited:text-purple-500" href="#">
  Changes color after visiting
</a>
```

---

## First, Last, Odd, Even

```html
<ul>
  <li class="first:pt-0 last:pb-0 py-4 border-b">
    First has no top padding, last has no bottom padding
  </li>
</ul>

<!-- Zebra striping -->
<tr class="odd:bg-gray-50 even:bg-white">
  <td>Table row</td>
</tr>
```

### nth-* Variants (v4 New)
```html
<div class="nth-3:bg-blue-100">Every 3rd child</div>
<div class="nth-last-2:bg-red-100">2nd from last</div>
```

---

## Group Hover / Focus

Style a child when a parent is hovered:

```html
<div class="group rounded-lg p-6 bg-white hover:bg-blue-500 transition">
  <h3 class="text-gray-900 group-hover:text-white transition">Title</h3>
  <p class="text-gray-500 group-hover:text-blue-200 transition">Description</p>
</div>
```

### Named Groups
```html
<div class="group/card">
  <div class="group/button">
    <button class="group-hover/card:bg-blue-100 group-hover/button:bg-blue-500">
      Responds to different ancestors
    </button>
  </div>
</div>
```

---

## Peer Variants

Style an element based on a sibling's state:

```html
<div>
  <input class="peer" type="checkbox" id="toggle">
  <label class="peer-checked:text-blue-500" for="toggle">
    Blue when checked
  </label>
</div>

<!-- Error messaging -->
<input class="peer" required>
<p class="hidden peer-invalid:block text-red-500 text-sm mt-1">
  This field is required
</p>
```

---

## in-* Variant (v4 New)

Like `group-*` but without needing the `group` class:

```html
<div class="hover:bg-blue-500">
  <p class="in-hover:text-white">
    White text when parent is hovered (no group class needed!)
  </p>
</div>
```

---

## Form State Variants

```html
<!-- Disabled -->
<button class="disabled:opacity-50 disabled:cursor-not-allowed" disabled>
  Disabled
</button>

<!-- Required -->
<input class="required:border-red-500" required>

<!-- Invalid -->
<input class="invalid:border-red-500 invalid:text-red-500" type="email">

<!-- Valid -->
<input class="valid:border-green-500" type="email" value="test@example.com">

<!-- Placeholder shown -->
<input class="placeholder-shown:border-gray-300 not-placeholder-shown:border-blue-500">

<!-- Read only -->
<input class="read-only:bg-gray-100" readonly>

<!-- Checked -->
<input class="checked:bg-blue-500" type="checkbox">

<!-- Indeterminate -->
<input class="indeterminate:bg-gray-300" type="checkbox">

<!-- Autofill -->
<input class="autofill:bg-yellow-100">
```

---

## Pseudo-Elements

### Before & After
```html
<div class="before:content-['✓'] before:mr-2 before:text-green-500">
  Completed task
</div>

<div class="after:content-['*'] after:text-red-500 after:ml-1">
  Required field
</div>

<!-- Empty content (for decorative elements) -->
<div class="before:content-[''] before:block before:h-1 before:bg-blue-500 before:rounded">
  With top bar
</div>
```

### Placeholder
```html
<input class="placeholder:text-gray-400 placeholder:italic" 
       placeholder="Enter your name...">
```

### Selection
```html
<p class="selection:bg-blue-200 selection:text-blue-900">
  Selected text will have blue background
</p>
```

### First-Line & First-Letter
```html
<p class="first-line:uppercase first-line:tracking-widest">
  First line is uppercase and tracked
</p>

<p class="first-letter:text-7xl first-letter:font-bold first-letter:float-left first-letter:mr-2">
  Drop cap effect on the first letter
</p>
```

### File Input
```html
<input type="file" class="file:bg-blue-500 file:text-white file:border-0 
                          file:px-4 file:py-2 file:rounded-lg file:mr-4
                          file:hover:bg-blue-600 file:cursor-pointer">
```

### Marker (List Bullets)
```html
<ul class="marker:text-blue-500 list-disc pl-5">
  <li>Blue bullet point</li>
  <li>Another item</li>
</ul>
```

---

## not-* Variant (v4 New)

Style elements that **don't** match a condition:

```html
<!-- Not hovered -->
<div class="not-hover:opacity-75">Dim when NOT hovered</div>

<!-- Not first child -->
<div class="not-first:mt-4">Margin on all except first</div>

<!-- Negate media queries -->
<div class="not-supports-hanging-punctuation:px-4">
  Fallback padding
</div>
```

---

## Descendant Variant (v4 New)

Style all descendants:

```html
<div class="**:text-gray-700 **:leading-relaxed">
  <p>All paragraphs get these styles</p>
  <p>Without adding classes to each one</p>
</div>
```

---

## Inert Variant (v4 New)

```html
<div class="inert:opacity-50 inert:pointer-events-none" inert>
  This section is not interactive
</div>
```

---

## Open State

```html
<!-- Details/Summary -->
<details class="open:bg-gray-100 open:shadow-lg rounded-lg p-4 transition-all">
  <summary class="cursor-pointer font-semibold">Click to expand</summary>
  <p class="mt-2">Hidden content revealed</p>
</details>

<!-- Popover (v4 New) -->
<div popover class="open:opacity-100 open:scale-100 
                     opacity-0 scale-95 transition-all">
  Popover content
</div>
```

---

## Combining Variants

Stack multiple variants:

```html
<!-- Dark mode + hover -->
<a class="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
  Link
</a>

<!-- Responsive + hover -->
<div class="opacity-100 md:opacity-75 md:hover:opacity-100">
  Dim on desktop, full on hover
</div>

<!-- Group hover + focus-within -->
<div class="group">
  <input class="group-hover:border-blue-300 focus:border-blue-500">
</div>

<!-- First child + odd -->
<li class="first:rounded-t-lg last:rounded-b-lg odd:bg-gray-50">
  List item
</li>
```
