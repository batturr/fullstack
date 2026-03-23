# 200 Tailwind CSS v4 Real-Time Assignments (With Answers)

> **Default `app.css` (v4):** `@import "tailwindcss";` — when an answer includes a separate CSS fence, merge that snippet into your stylesheet together with the import.

**Version focus:** Tailwind CSS v4 — `@import "tailwindcss"`, `@theme`, `@utility`, `@variant`, `@plugin`, automatic content detection, CSS custom properties (`--color-*`, `--spacing-*`), OKLCH colors, container queries, 3D transforms, `not-*` / `in-*` variants, and modern utilities like `bg-linear-to-*`.

**How to use:** For each assignment, implement the UI with Tailwind utility classes. When an assignment references design tokens or custom utilities, configure them in CSS (not `tailwind.config.js`).

---

## BEGINNER (Assignments 1–70)

### Layout Basics (1–10)

1. Build a full-viewport section that uses Flexbox to center a single card both horizontally and vertically.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<section class="flex min-h-dvh items-center justify-center bg-slate-100 p-6">
  <article class="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/10">
    <h1 class="text-xl font-semibold tracking-tight">Centered card</h1>
    <p class="mt-2 text-sm leading-relaxed text-slate-600">Flexbox centering with <code class="rounded bg-slate-100 px-1">items-center</code> and <code class="rounded bg-slate-100 px-1">justify-center</code>.</p>
  </article>
</section>
</body>
</html>
```

---
2. Create a three-column grid of equal-width columns with consistent gaps; columns should stack on small screens.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<main class="mx-auto max-w-6xl space-y-4">
  <h2 class="text-lg font-semibold">Three-column grid</h2>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
    <div class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">Column A</div>
    <div class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">Column B</div>
    <div class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">Column C</div>
  </div>
</main>
</body>
</html>
```

---
3. Implement a responsive page container: centered, horizontal padding, and a sensible `max-width` at `lg` and above.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:max-w-5xl lg:px-8">
  <p class="text-sm text-slate-600">Container: <code class="rounded bg-white px-1 ring-1 ring-slate-200">mx-auto</code>, responsive <code class="rounded bg-white px-1 ring-1 ring-slate-200">px-*</code>, <code class="rounded bg-white px-1 ring-1 ring-slate-200">max-w-*</code> at <code class="rounded bg-white px-1 ring-1 ring-slate-200">lg</code>.</p>
</div>
</body>
</html>
```

---
4. Build a toolbar that is a column on mobile and a row on `md+`, with items spaced apart.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<header class="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5 md:flex-row md:items-center md:justify-between">
  <strong class="text-base font-semibold">Toolbar</strong>
  <nav class="flex flex-col gap-2 text-sm text-slate-600 md:flex-row md:gap-6">
    <a class="hover:text-slate-900" href="#">Dashboard</a>
    <a class="hover:text-slate-900" href="#">Projects</a>
    <a class="hover:text-slate-900" href="#">Settings</a>
  </nav>
</header>
</body>
</html>
```

---
5. Demonstrate `justify-*` and `items-*` on a flex container with multiple items of different heights.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex min-h-48 items-end justify-between gap-4 rounded-xl bg-slate-100 p-4">
  <div class="flex h-24 w-20 items-center justify-center rounded-lg bg-white text-sm font-medium shadow-sm">Short</div>
  <div class="flex h-36 w-20 items-center justify-center rounded-lg bg-white text-sm font-medium shadow-sm">Tall</div>
  <div class="flex h-16 w-20 items-center justify-center rounded-lg bg-white text-sm font-medium shadow-sm">Mid</div>
</div>
<p class="mt-2 text-xs text-slate-500">Parent uses <code class="rounded bg-slate-100 px-1">items-end</code> + <code class="rounded bg-slate-100 px-1">justify-between</code>.</p>
</body>
</html>
```

---
6. Create a flex row of tags with uniform `gap-*` spacing between items (no manual margins on each tag).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex flex-wrap gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
  <span class="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">design</span>
  <span class="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">tailwind</span>
  <span class="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">v4</span>
  <span class="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">css-first</span>
</div>
</body>
</html>
```

---
7. Build a “card gallery” flex row that wraps to the next line when space runs out.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex flex-wrap gap-4">
  <article class="w-40 rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Card 1</article>
  <article class="w-40 rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Card 2</article>
  <article class="w-40 rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Card 3</article>
  <article class="w-40 rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Card 4</article>
</div>
</body>
</html>
```

---
8. Use CSS Grid with an explicit template (different fractional column widths) for a simple two-sidebar layout sketch.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="grid min-h-64 grid-cols-1 gap-3 md:grid-cols-[14rem_1fr_12rem] md:grid-rows-[auto_1fr_auto]">
  <header class="rounded-lg bg-white p-3 text-sm font-semibold shadow-sm ring-1 ring-slate-900/5 md:col-span-3">Header</header>
  <aside class="rounded-lg bg-white p-3 text-sm shadow-sm ring-1 ring-slate-900/5">Left</aside>
  <main class="rounded-lg bg-white p-3 text-sm shadow-sm ring-1 ring-slate-900/5">Main</main>
  <aside class="rounded-lg bg-white p-3 text-sm shadow-sm ring-1 ring-slate-900/5">Right</aside>
  <footer class="rounded-lg bg-white p-3 text-sm shadow-sm ring-1 ring-slate-900/5 md:col-span-3">Footer</footer>
</div>
</body>
</html>
```

---
9. Create a grid where columns auto-fit with a minimum column width using `grid-cols` / `minmax` style patterns.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-3">
  <div class="rounded-lg bg-emerald-50 p-4 text-sm ring-1 ring-emerald-200">Auto 1</div>
  <div class="rounded-lg bg-emerald-50 p-4 text-sm ring-1 ring-emerald-200">Auto 2</div>
  <div class="rounded-lg bg-emerald-50 p-4 text-sm ring-1 ring-emerald-200">Auto 3</div>
  <div class="rounded-lg bg-emerald-50 p-4 text-sm ring-1 ring-emerald-200">Auto 4</div>
</div>
</body>
</html>
```

---
10. Hide a promotional banner on small screens and show it from `md` upward; hide secondary nav on mobile only.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="space-y-3">
  <div class="hidden rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white md:block">Promo: Save 20% this week</div>
  <div class="rounded-lg bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">
    <p>Main content</p>
    <p class="mt-2 text-slate-600 md:hidden">Secondary nav hidden on mobile (see markup).</p>
    <nav class="mt-3 hidden gap-3 text-sm md:flex">
      <a class="text-slate-700 hover:text-slate-900" href="#">Docs</a>
      <a class="text-slate-700 hover:text-slate-900" href="#">API</a>
    </nav>
  </div>
</div>
</body>
</html>
```

---

### Spacing & Sizing (11–18)

11. Build a content panel demonstrating `p-*` and `m-*` on nested boxes so spacing hierarchy is obvious.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
  <div class="m-4 rounded-lg bg-slate-50 p-6 ring-1 ring-slate-200">
    <div class="m-3 rounded-md bg-white p-4 text-sm ring-1 ring-slate-200">Nested boxes show <code class="rounded bg-slate-100 px-1">p-*</code> + <code class="rounded bg-slate-100 px-1">m-*</code>.</div>
  </div>
</div>
</body>
</html>
```

---
12. Create a centered block element using horizontal auto margins and a fixed `max-width`.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="mx-auto mt-8 max-w-xl rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
  <p class="text-sm text-slate-600">Centered with <code class="rounded bg-slate-100 px-1">mx-auto</code> and <code class="rounded bg-slate-100 px-1">max-w-xl</code>.</p>
</div>
</body>
</html>
```

---
13. Use `space-x-*` / `space-y-*` on a vertical list so children are spaced without per-item margins.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<ul class="max-w-md space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
  <li class="rounded-lg bg-slate-50 px-3 py-2 text-sm">Item A</li>
  <li class="rounded-lg bg-slate-50 px-3 py-2 text-sm">Item B</li>
  <li class="rounded-lg bg-slate-50 px-3 py-2 text-sm">Item C</li>
</ul>
<p class="mt-2 text-xs text-slate-500">Parent uses <code class="rounded bg-slate-100 px-1">space-y-3</code> (no per-item margins).</p>
</body>
</html>
```

---
14. Demonstrate `w-*`, `h-*`, and `w-full` on a card inside a constrained parent.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="w-full max-w-3xl rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
  <div class="h-40 w-full rounded-lg bg-linear-to-br from-sky-100 to-indigo-100 ring-1 ring-slate-200"></div>
  <p class="mt-3 text-sm text-slate-600"><code class="rounded bg-slate-100 px-1">w-full</code> + fixed <code class="rounded bg-slate-100 px-1">h-40</code>.</p>
</div>
</body>
</html>
```

---
15. Use `min-h-*`, `min-w-*`, and `max-w-*` so text never exceeds a readable line length.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<article class="mx-auto max-w-prose rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
  <h3 class="text-lg font-semibold">Readable measure</h3>
  <p class="mt-2 min-h-[4.5rem] text-sm leading-relaxed text-slate-600">
    This paragraph sits inside a container using <code class="rounded bg-slate-100 px-1">max-w-prose</code> plus <code class="rounded bg-slate-100 px-1">min-h-*</code> to demonstrate sizing constraints.
  </p>
</article>
</body>
</html>
```

---
16. Build a video thumbnail placeholder using `aspect-video` (or `aspect-*`) and responsive width.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="mx-auto w-full max-w-md">
  <div class="aspect-video w-full overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-900/10">
    <div class="flex h-full items-center justify-center text-sm font-medium text-white/80">16:9</div>
  </div>
</div>
</body>
</html>
```

---
17. Use the `size-*` utility to make a square avatar placeholder.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex items-center gap-3">
  <div class="size-12 rounded-full bg-linear-to-br from-fuchsia-500 to-indigo-500 ring-2 ring-white shadow-sm"></div>
  <p class="text-sm text-slate-600"><code class="rounded bg-slate-100 px-1">size-12</code> square avatar placeholder.</p>
</div>
</body>
</html>
```

---
18. Combine padding, margin, and `gap-*` in one layout and explain (in comments) which spacing tool you used where.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<!-- Spacing: outer margin on section, padding inside card, gap between chips -->
<section class="m-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
  <div class="flex flex-wrap gap-2">
    <span class="rounded-full bg-slate-900 px-3 py-1 text-xs text-white">alpha</span>
    <span class="rounded-full bg-slate-900 px-3 py-1 text-xs text-white">beta</span>
    <span class="rounded-full bg-slate-900 px-3 py-1 text-xs text-white">gamma</span>
  </div>
</section>
</body>
</html>
```

---

### Typography (19–28)

19. Show a heading and paragraph with responsive font sizes (`text-sm` → `text-3xl` style progression).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="space-y-4">
  <h1 class="text-2xl font-bold tracking-tight sm:text-3xl lg:text-5xl">Responsive heading</h1>
  <p class="text-sm sm:text-base lg:text-lg text-slate-600">Body copy scales up at larger breakpoints.</p>
</div>
</body>
</html>
```

---
20. Display the same word in multiple `font-weight` utilities side by side.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<p class="flex flex-wrap gap-4 text-sm">
  <span class="font-thin">thin</span>
  <span class="font-normal">normal</span>
  <span class="font-semibold">semibold</span>
  <span class="font-black">black</span>
</p>
</body>
</html>
```

---
21. Use semantic text colors (`text-slate-*`, `text-emerald-*`, etc.) for title, body, and muted caption.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<article class="space-y-2">
  <h2 class="text-xl font-semibold text-slate-900">Title</h2>
  <p class="text-sm text-slate-700">Body uses a neutral slate ramp.</p>
  <p class="text-xs text-emerald-700">Caption / success tone</p>
</article>
</body>
</html>
```

---
22. Align blocks of text `left`, `center`, and `right` in a simple demo row or stack.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="space-y-3">
  <p class="text-left text-sm">Left aligned</p>
  <p class="text-center text-sm">Center aligned</p>
  <p class="text-right text-sm">Right aligned</p>
</div>
</body>
</html>
```

---
23. Apply underline, line-through, and `no-underline` examples on inline text.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<p class="text-sm">
  <span class="underline decoration-2 underline-offset-4">underlined</span>,
  <span class="line-through">struck</span>,
  <a class="no-underline hover:underline" href="#">link</a>
</p>
</body>
</html>
```

---
24. Adjust letter spacing with `tracking-*` on headings and labels.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="space-y-2">
  <h3 class="text-lg font-semibold tracking-tight">Tight heading</h3>
  <p class="text-xs font-medium uppercase tracking-widest text-slate-500">Overline label</p>
</div>
</body>
</html>
```

---
25. Use `leading-*` to contrast tight vs relaxed paragraph line height.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="grid gap-4 md:grid-cols-2">
  <p class="text-sm leading-none text-slate-700">Leading tight: Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quibusdam, facere.</p>
  <p class="text-sm leading-relaxed text-slate-700">Leading relaxed: Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quibusdam, facere.</p>
</div>
</body>
</html>
```

---
26. Truncate a long single-line heading with `truncate` inside a narrow column.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="max-w-xs">
  <p class="truncate text-sm font-medium">
    This is an extremely long single-line heading that should truncate with an ellipsis when space runs out.
  </p>
</div>
</body>
</html>
```

---
27. Clamp a multi-line description to three lines with `line-clamp-*`.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<p class="line-clamp-3 text-sm text-slate-700">
  Multi-line paragraph that should clamp after three lines. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.
</p>
</body>
</html>
```

---
28. Style rich text using the Typography plugin (`@plugin "@tailwindcss/typography"`) and the `prose` classes.

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<article class="prose prose-slate max-w-none lg:prose-lg">
  <h2>Typography plugin</h2>
  <p>This paragraph is styled by <code>prose</code>. Lists also look nice:</p>
  <ul>
    <li>First</li>
    <li>Second</li>
  </ul>
</article>
</body>
</html>
```

---

### Colors & Backgrounds (29–36)

29. Build swatches of `text-*` colors on white and dark backgrounds.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
  <div class="rounded-lg bg-white p-4 text-sm text-slate-900 ring-1 ring-slate-200">text-slate-900</div>
  <div class="rounded-lg bg-slate-900 p-4 text-sm text-emerald-300">on dark</div>
  <div class="rounded-lg bg-white p-4 text-sm text-indigo-600 ring-1 ring-slate-200">text-indigo-600</div>
  <div class="rounded-lg bg-amber-100 p-4 text-sm text-amber-900">amber</div>
</div>
</body>
</html>
```

---
30. Combine `bg-*` and `text-*` for accessible contrast on a call-to-action strip.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<section class="rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 px-6 py-8 text-white shadow-lg">
  <h3 class="text-xl font-semibold tracking-tight">Accessible CTA</h3>
  <p class="mt-2 max-w-prose text-sm text-white/90">High contrast text on gradient using opacity modifiers.</p>
  <button class="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-white/90" type="button">Get started</button>
</section>
</body>
</html>
```

---
31. Create a gradient button or banner using `bg-linear-to-r` with OKLCH-friendly `from-*` / `to-*` stops.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<button class="rounded-xl bg-linear-to-r from-cyan-400 via-sky-500 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:brightness-110" type="button">Gradient button</button>
</body>
</html>
```

---
32. Layer opacity with `bg-*` / `text-*` and the `/opacity` modifier (e.g. `bg-slate-900/80`).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="space-y-3">
  <div class="rounded-xl bg-slate-900/80 p-4 text-sm text-white backdrop-blur-sm">bg-slate-900/80</div>
  <p class="text-sm text-slate-600/70">Muted copy with <code class="rounded bg-slate-100 px-1">text-slate-600/70</code>.</p>
</div>
</body>
</html>
```

---
33. Use `bg-[url(...)]` (arbitrary image) with overlays for a hero section.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<section class="relative isolate overflow-hidden rounded-2xl bg-slate-900 px-6 py-16 text-white">
  <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=60')] bg-cover bg-center opacity-40"></div>
  <div class="absolute inset-0 bg-linear-to-t from-slate-950/90 to-slate-950/20"></div>
  <div class="relative">
    <h2 class="text-2xl font-semibold">Hero with bg image</h2>
    <p class="mt-2 max-w-xl text-sm text-white/80">Overlay + gradient for readability.</p>
  </div>
</section>
</body>
</html>
```

---
34. Demonstrate `bg-cover`, `bg-center`, and `bg-no-repeat` on a tall hero.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="h-56 overflow-hidden rounded-2xl bg-slate-200 ring-1 ring-slate-900/10">
  <div class="h-full w-full bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=60')] bg-cover bg-center bg-no-repeat"></div>
</div>
</body>
</html>
```

---
35. Add a focus ring style with `ring-*`, `ring-offset-*`, and rounded corners on a button.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<button class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-50 outline-none hover:bg-indigo-500 focus-visible:ring-4" type="button">Focus me</button>
</body>
</html>
```

---
36. Build a vertical list with `divide-y` and `divide-*` border colors between items.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<ul class="max-w-md divide-y divide-slate-200 rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
  <li class="px-4 py-3 text-sm">Inbox</li>
  <li class="px-4 py-3 text-sm">Drafts</li>
  <li class="px-4 py-3 text-sm">Sent</li>
</ul>
</body>
</html>
```

---

### Borders & Effects (37–44)

37. Create cards with different `border` widths and colors on each side (where practical).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="grid gap-3 md:grid-cols-3">
  <div class="border-2 border-slate-200 p-4 text-sm">Uniform border</div>
  <div class="border-y-4 border-indigo-200 p-4 text-sm">Thick top/bottom</div>
  <div class="border-l-4 border-amber-400 pl-4 text-sm">Accent left border</div>
</div>
</body>
</html>
```

---
38. Show `rounded-*` variants from none to full pill on buttons and cards.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex flex-wrap gap-3">
  <button class="rounded-none bg-slate-900 px-3 py-2 text-xs text-white" type="button">none</button>
  <button class="rounded-md bg-slate-900 px-3 py-2 text-xs text-white" type="button">md</button>
  <button class="rounded-2xl bg-slate-900 px-3 py-2 text-xs text-white" type="button">2xl</button>
  <button class="rounded-full bg-slate-900 px-4 py-2 text-xs text-white" type="button">pill</button>
</div>
</body>
</html>
```

---
39. Compare `shadow-sm`, `shadow`, and `shadow-xl` on stacked cards.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex flex-wrap items-end gap-4">
  <div class="h-24 w-32 rounded-lg bg-white shadow-sm ring-1 ring-slate-900/5">shadow-sm</div>
  <div class="h-24 w-32 rounded-lg bg-white shadow">shadow</div>
  <div class="h-24 w-32 rounded-lg bg-white shadow-xl">shadow-xl</div>
</div>
</body>
</html>
```

---
40. Combine `ring-*` and `shadow-*` on an input to show focus vs rest states.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<label class="block max-w-sm text-sm font-medium text-slate-700">
  Email
  <input class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm ring-2 ring-transparent outline-none focus:border-indigo-500 focus:ring-indigo-500/30" type="email" placeholder="you@example.com" />
</label>
</body>
</html>
```

---
41. Style a ghost button using `outline` utilities instead of a filled background.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<button class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 outline outline-2 outline-offset-2 outline-indigo-500/0 hover:outline-indigo-500/40" type="button">Ghost outline</button>
</body>
</html>
```

---
42. Build a table-like list using `divide-x` / `divide-y` on a flex or grid container.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex divide-x divide-slate-200 rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
  <div class="px-4 py-3 text-sm">A</div>
  <div class="px-4 py-3 text-sm">B</div>
  <div class="px-4 py-3 text-sm">C</div>
</div>
</body>
</html>
```

---
43. Fade secondary UI with `opacity-*` and restore on `hover:`.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<button class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white opacity-60 transition hover:opacity-100" type="button">Hover to focus</button>
</body>
</html>
```

---
44. Apply `blur-*`, `brightness-*`, and `contrast-*` to an image on hover.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<img class="h-40 w-full rounded-xl object-cover blur-0 brightness-100 contrast-100 transition duration-500 hover:blur-sm hover:brightness-125 hover:contrast-125" alt="Landscape" src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=60" />
</body>
</html>
```

---

### Responsive Design (45–54)

45. Build a hero that changes padding, font size, and alignment at `sm`, `md`, and `lg`.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<section class="rounded-2xl bg-white px-4 py-8 text-left shadow-sm ring-1 ring-slate-900/5 sm:px-8 sm:py-12 md:px-12 lg:py-16 lg:text-center">
  <h2 class="text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">Responsive hero</h2>
  <p class="mt-3 text-sm text-slate-600 sm:text-base">Padding, size, and alignment change by breakpoint.</p>
</section>
</body>
</html>
```

---
46. Demonstrate mobile-first spacing: tight padding on mobile, roomier at `lg`.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="mx-auto max-w-3xl rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5 sm:p-6 lg:p-10">
  <p class="text-sm text-slate-600">Mobile-first padding: <code class="rounded bg-slate-100 px-1">p-4</code> → <code class="rounded bg-slate-100 px-1">lg:p-10</code>.</p>
</div>
</body>
</html>
```

---
47. Make a headline `text-2xl` on mobile and `text-5xl` at `xl`.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<h2 class="text-2xl font-semibold tracking-tight xl:text-5xl">Scales at xl</h2>
</body>
</html>
```

---
48. Convert a single-column card list to two columns at `md` and three at `lg` using grid utilities.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  <div class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">Card</div>
  <div class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">Card</div>
  <div class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">Card</div>
</div>
</body>
</html>
```

---
49. Show a “Menu” label on mobile and a full horizontal nav from `md` upward.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<header class="flex items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
  <span class="text-sm font-semibold">Brand</span>
  <span class="md:hidden">Menu</span>
  <nav class="hidden gap-4 text-sm md:flex">
    <a class="text-slate-700 hover:text-slate-900" href="#">Home</a>
    <a class="text-slate-700 hover:text-slate-900" href="#">Pricing</a>
  </nav>
</header>
</body>
</html>
```

---
50. Hide decorative imagery on small screens; show it from `lg`.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="grid gap-4 md:grid-cols-2">
  <div class="hidden text-sm text-slate-600 lg:block">Decorative image column (lg+)</div>
  <div class="rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Primary content always visible</div>
</div>
</body>
</html>
```

---
51. Adjust `gap-*` responsively in a card grid (tighter mobile, looser desktop).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-8">
  <div class="rounded-lg bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Item</div>
  <div class="rounded-lg bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Item</div>
</div>
</body>
</html>
```

---
52. Switch `flex-col` to `flex-row` at a breakpoint for a feature section.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<section class="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5 md:flex-row md:items-center md:justify-between">
  <div>
    <h3 class="text-lg font-semibold">Feature</h3>
    <p class="text-sm text-slate-600">Stacks on mobile.</p>
  </div>
  <button class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="button">Action</button>
</section>
</body>
</html>
```

---
53. Change `text-left` to `text-center` at `md` for a marketing band.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="rounded-xl bg-slate-100 px-6 py-8 text-left md:text-center">
  <h3 class="text-lg font-semibold">Marketing band</h3>
  <p class="mt-2 text-sm text-slate-600">Text centers at md+.</p>
</div>
</body>
</html>
```

---
54. Constrain content to a wider `max-width` at `2xl` while staying centered.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="mx-auto w-full max-w-5xl px-4 2xl:max-w-7xl">
  <div class="rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Wider max width only at 2xl.</div>
</div>
</body>
</html>
```

---

### States (55–62)

55. Style a button with distinct `hover:` background and text colors.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<button class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-600 hover:text-white" type="button">Hover me</button>
</body>
</html>
```

---
56. Add a visible `focus:` ring on links and buttons for keyboard users.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<a class="rounded-md px-2 py-1 text-sm font-semibold text-indigo-700 underline-offset-4 hover:underline focus:outline-none focus:ring-4 focus:ring-indigo-500/30" href="#">Keyboard-focusable link</a>
</body>
</html>
```

---
57. Show `active:` scale or background change on a pressable card.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<button class="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-900/10 transition active:scale-95 active:bg-slate-50" type="button">Pressable card</button>
</body>
</html>
```

---
58. Dim a button with `disabled:` opacity and remove pointer interaction.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<button class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:pointer-events-none disabled:opacity-40" disabled type="button">Disabled</button>
</body>
</html>
```

---
59. Use `group` / `group-hover:` to reveal an icon when hovering a card.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="group relative max-w-sm cursor-pointer overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
  <div class="flex items-center justify-between">
    <h3 class="text-base font-semibold">Hover card</h3>
    <span class="translate-x-2 text-slate-400 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100">→</span>
  </div>
  <p class="mt-2 text-sm text-slate-600">Icon reveals on <code class="rounded bg-slate-100 px-1">group-hover</code>.</p>
</div>
</body>
</html>
```

---
60. Build a toggle row where `peer` and `peer-checked:` style a custom track.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<label class="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
  <input class="peer sr-only" type="checkbox" />
  <span class="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500">
    <span class="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition peer-checked:translate-x-5"></span>
  </span>
  Notifications
</label>
</body>
</html>
```

---
61. Highlight a search field container with `focus-within:` ring when any child input is focused.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="max-w-md rounded-xl bg-white p-2 shadow-sm ring-2 ring-transparent transition focus-within:ring-indigo-500/30">
  <label class="block px-2 pt-1 text-xs font-medium text-slate-500" for="q">Search</label>
  <input class="w-full rounded-lg border-0 bg-transparent px-2 pb-2 text-sm outline-none" id="q" placeholder="Type here" />
</div>
</body>
</html>
```

---
62. Use `focus-visible:` (not plain `focus:`) to show outlines only for keyboard focus.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex gap-3">
  <button class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/40" type="button">Keyboard only ring</button>
  <button class="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900" type="button">Mouse click</button>
</div>
</body>
</html>
```

---

### Basic Components (63–70)

63. Primary, secondary, and danger button variants sharing consistent padding and radius.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex flex-wrap gap-3">
  <button class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500" type="button">Primary</button>
  <button class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50" type="button">Secondary</button>
  <button class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500" type="button">Danger</button>
</div>
</body>
</html>
```

---
64. A card with header, body, footer regions and subtle border/shadow.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<article class="max-w-md overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
  <header class="border-b border-slate-100 px-4 py-3 text-sm font-semibold">Card header</header>
  <div class="px-4 py-4 text-sm text-slate-600">Body content goes here.</div>
  <footer class="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">Footer meta</footer>
</article>
</body>
</html>
```

---
65. Pill badges for “New”, “Beta”, and “Sale” with different color themes.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex flex-wrap gap-2 text-xs font-semibold">
  <span class="rounded-full bg-emerald-100 px-2 py-1 text-emerald-800">New</span>
  <span class="rounded-full bg-amber-100 px-2 py-1 text-amber-900">Beta</span>
  <span class="rounded-full bg-rose-100 px-2 py-1 text-rose-800">Sale</span>
</div>
</body>
</html>
```

---
66. Avatar stack (overlapping circles) for a fake team list.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex -space-x-3">
  <img class="size-10 rounded-full ring-2 ring-white object-cover" alt="" src="https://i.pravatar.cc/120?img=12" />
  <img class="size-10 rounded-full ring-2 ring-white object-cover" alt="" src="https://i.pravatar.cc/120?img=47" />
  <img class="size-10 rounded-full ring-2 ring-white object-cover" alt="" src="https://i.pravatar.cc/120?img=33" />
  <div class="flex size-10 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 ring-2 ring-white">+4</div>
</div>
</body>
</html>
```

---
67. Alert banners for success, warning, and error with icons and dismiss affordance (non-JS markup OK).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="space-y-3">
  <div class="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-200">
    <span class="mt-0.5 size-2 rounded-full bg-emerald-500"></span>
    <div class="flex-1"><strong class="font-semibold">Success</strong><p class="mt-1 text-emerald-800/90">Saved successfully.</p></div>
    <button aria-label="Dismiss" class="rounded-md px-2 text-emerald-800/70 hover:bg-emerald-100" type="button">×</button>
  </div>
  <div class="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-950 ring-1 ring-amber-200">
    <strong class="font-semibold">Warning</strong>
  </div>
  <div class="flex items-start gap-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-950 ring-1 ring-rose-200">
    <strong class="font-semibold">Error</strong>
  </div>
</div>
</body>
</html>
```

---
68. Responsive navbar: brand left, links center/right, collapsible placeholder for mobile.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<header class="flex flex-col gap-3 rounded-xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-slate-900/5 backdrop-blur md:flex-row md:items-center md:justify-between">
  <div class="text-sm font-bold">Acme</div>
  <nav class="hidden gap-4 text-sm md:flex">
    <a class="text-slate-700 hover:text-slate-900" href="#">Product</a>
    <a class="text-slate-700 hover:text-slate-900" href="#">Docs</a>
  </nav>
  <button class="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white md:hidden" type="button">Open</button>
</header>
</body>
</html>
```

---
69. Text input with label, helper text, and error state classes.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="max-w-md space-y-1">
  <label class="text-sm font-medium text-slate-700" for="email">Email</label>
  <input class="w-full rounded-lg border border-red-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20" id="email" type="email" value="bad" />
  <p class="text-xs text-red-600">Please enter a valid email.</p>
  <p class="text-xs text-slate-500">Helper: we never spam.</p>
</div>
</body>
</html>
```

---
70. Simple two-field form (name, email) with stacked labels and a submit button.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<form class="max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
  <div class="space-y-1">
    <label class="text-sm font-medium text-slate-700" for="name">Name</label>
    <input class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" id="name" />
  </div>
  <div class="space-y-1">
    <label class="text-sm font-medium text-slate-700" for="mail">Email</label>
    <input class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" id="mail" type="email" />
  </div>
  <button class="w-full rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-800" type="submit">Submit</button>
</form>
</body>
</html>
```

---

---

## INTERMEDIATE (Assignments 71–140)

### Advanced Layouts (71–84)

71. Sticky header that stays visible while scrolling a long article body.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="min-h-dvh">
  <header class="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-4 py-3 text-sm font-semibold backdrop-blur">Sticky header</header>
  <main class="mx-auto max-w-3xl space-y-4 px-4 py-6">
    <p class="text-sm text-slate-700">Paragraph 1 — scroll to test sticky header.</p>
    <p class="text-sm text-slate-700">Paragraph 2 — scroll to test sticky header.</p>
    <p class="text-sm text-slate-700">Paragraph 3 — scroll to test sticky header.</p>
    <p class="text-sm text-slate-700">Paragraph 4 — scroll to test sticky header.</p>
    <p class="text-sm text-slate-700">Paragraph 5 — scroll to test sticky header.</p>
    <p class="text-sm text-slate-700">Paragraph 6 — scroll to test sticky header.</p>
    <p class="text-sm text-slate-700">Paragraph 7 — scroll to test sticky header.</p>
    <p class="text-sm text-slate-700">Paragraph 8 — scroll to test sticky header.</p>
    <p class="text-sm text-slate-700">Paragraph 9 — scroll to test sticky header.</p>
    <p class="text-sm text-slate-700">Paragraph 10 — scroll to test sticky header.</p>
    <p class="text-sm text-slate-700">Paragraph 11 — scroll to test sticky header.</p>
    <p class="text-sm text-slate-700">Paragraph 12 — scroll to test sticky header.</p>
    <p class="text-sm text-slate-700">Paragraph 13 — scroll to test sticky header.</p>
    <p class="text-sm text-slate-700">Paragraph 14 — scroll to test sticky header.</p>
    <p class="text-sm text-slate-700">Paragraph 15 — scroll to test sticky header.</p>
    <p class="text-sm text-slate-700">Paragraph 16 — scroll to test sticky header.</p>
    <p class="text-sm text-slate-700">Paragraph 17 — scroll to test sticky header.</p>
  </main>
</div>
</body>
</html>
```

---
72. Classic sidebar + content layout: fixed sidebar width on desktop, stacked on mobile.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="min-h-dvh gap-4 md:grid md:grid-cols-[16rem_1fr]">
  <aside class="border-b border-slate-200 bg-white p-4 text-sm md:border-b-0 md:border-r">Sidebar</aside>
  <main class="p-4 text-sm text-slate-700">Main column stacks on mobile.</main>
</div>
</body>
</html>
```

---
73. “Holy grail” sketch: header, footer, main + two side columns using grid.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-2 bg-slate-50 p-2">
  <header class="rounded-lg bg-white p-3 text-sm font-semibold shadow-sm">Header</header>
  <div class="grid gap-2 md:grid-cols-[12rem_1fr_12rem]">
    <aside class="rounded-lg bg-white p-3 text-sm shadow-sm">Left</aside>
    <main class="rounded-lg bg-white p-3 text-sm shadow-sm">Main</main>
    <aside class="rounded-lg bg-white p-3 text-sm shadow-sm">Right</aside>
  </div>
  <footer class="rounded-lg bg-white p-3 text-sm shadow-sm">Footer</footer>
</div>
</body>
</html>
```

---
74. Dashboard grid: sidebar, topbar, and main widget area with cards.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="min-h-dvh bg-slate-100 p-3 md:grid md:grid-cols-[14rem_1fr] md:grid-rows-[auto_1fr] md:gap-3">
  <aside class="rounded-xl bg-white p-3 text-sm shadow-sm md:row-span-2">Nav</aside>
  <header class="rounded-xl bg-white p-3 text-sm font-semibold shadow-sm">Topbar</header>
  <section class="mt-3 grid gap-3 md:mt-0 md:grid-cols-2">
    <div class="rounded-xl bg-white p-4 text-sm shadow-sm">Widget A</div>
    <div class="rounded-xl bg-white p-4 text-sm shadow-sm">Widget B</div>
  </section>
</div>
</body>
</html>
```

---
75. Responsive card grid where cards stretch evenly in each row.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <div class="flex min-h-32 flex-col justify-between rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5"><strong>Card 1</strong><span class="text-slate-500">Even rows via grid.</span></div>
  <div class="flex min-h-32 flex-col justify-between rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5"><strong>Card 2</strong><span class="text-slate-500">Even rows via grid.</span></div>
  <div class="flex min-h-32 flex-col justify-between rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5"><strong>Card 3</strong><span class="text-slate-500">Even rows via grid.</span></div>
  <div class="flex min-h-32 flex-col justify-between rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5"><strong>Card 4</strong><span class="text-slate-500">Even rows via grid.</span></div>
  <div class="flex min-h-32 flex-col justify-between rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5"><strong>Card 5</strong><span class="text-slate-500">Even rows via grid.</span></div>
  <div class="flex min-h-32 flex-col justify-between rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5"><strong>Card 6</strong><span class="text-slate-500">Even rows via grid.</span></div>
</div>
</body>
</html>
```

---
76. Masonry-like layout using column utilities or grid dense packing patterns.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="columns-1 gap-4 sm:columns-2 lg:columns-3">
  <div class="mb-4 break-inside-avoid rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Masonry-like 1</div>
  <div class="mb-4 break-inside-avoid rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Masonry-like 2</div>
  <div class="mb-4 break-inside-avoid rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Masonry-like 3</div>
  <div class="mb-4 break-inside-avoid rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Masonry-like 4</div>
  <div class="mb-4 break-inside-avoid rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Masonry-like 5</div>
  <div class="mb-4 break-inside-avoid rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Masonry-like 6</div>
  <div class="mb-4 break-inside-avoid rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Masonry-like 7</div>
  <div class="mb-4 break-inside-avoid rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Masonry-like 8</div>
  <div class="mb-4 break-inside-avoid rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Masonry-like 9</div>
</div>
</body>
</html>
```

---
77. Footer pushed to the bottom on short pages (`min-h-dvh` flex column pattern).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex min-h-dvh flex-col">
  <main class="flex-1 px-4 py-8 text-sm text-slate-700">Content grows; footer stays at bottom on short pages.</main>
  <footer class="border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">Footer</footer>
</div>
</body>
</html>
```

---
78. Scrollable sidebar panel with independent overflow from the main content.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="grid h-80 grid-cols-1 gap-3 md:grid-cols-[14rem_1fr]">
  <aside class="overflow-y-auto rounded-xl bg-white p-3 text-sm shadow-sm ring-1 ring-slate-900/5">
    <p class="border-b border-slate-100 py-2">Nav item 1</p>
    <p class="border-b border-slate-100 py-2">Nav item 2</p>
    <p class="border-b border-slate-100 py-2">Nav item 3</p>
    <p class="border-b border-slate-100 py-2">Nav item 4</p>
    <p class="border-b border-slate-100 py-2">Nav item 5</p>
    <p class="border-b border-slate-100 py-2">Nav item 6</p>
    <p class="border-b border-slate-100 py-2">Nav item 7</p>
    <p class="border-b border-slate-100 py-2">Nav item 8</p>
    <p class="border-b border-slate-100 py-2">Nav item 9</p>
    <p class="border-b border-slate-100 py-2">Nav item 10</p>
    <p class="border-b border-slate-100 py-2">Nav item 11</p>
    <p class="border-b border-slate-100 py-2">Nav item 12</p>
    <p class="border-b border-slate-100 py-2">Nav item 13</p>
    <p class="border-b border-slate-100 py-2">Nav item 14</p>
    <p class="border-b border-slate-100 py-2">Nav item 15</p>
    <p class="border-b border-slate-100 py-2">Nav item 16</p>
    <p class="border-b border-slate-100 py-2">Nav item 17</p>
    <p class="border-b border-slate-100 py-2">Nav item 18</p>
    <p class="border-b border-slate-100 py-2">Nav item 19</p>
  </aside>
  <section class="overflow-y-auto rounded-xl bg-slate-50 p-4 text-sm">Main scrolls independently.</section>
</div>
</body>
</html>
```

---
79. Fixed footer bar for mobile actions that does not overlap readable content (add bottom padding).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="pb-24 text-sm text-slate-700">
  <p>Bottom padding prevents overlap with fixed bar.</p>
  <div class="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
    <div class="mx-auto flex max-w-md justify-between gap-2">
      <button class="flex-1 rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white" type="button">Save</button>
      <button class="flex-1 rounded-lg bg-slate-200 py-2 text-xs font-semibold text-slate-900" type="button">Cancel</button>
    </div>
  </div>
</div>
</body>
</html>
```

---
80. Layered UI: modal backdrop, modal, and toast with explicit `z-*` values.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="relative min-h-48">
  <div class="absolute inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"></div>
  <div class="absolute left-1/2 top-1/2 z-50 w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 text-sm shadow-2xl ring-1 ring-slate-900/10">Modal layer</div>
  <div class="absolute bottom-4 right-4 z-[60] rounded-xl bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">Toast</div>
</div>
</body>
</html>
```

---
81. Long chat-like column that scrolls internally while header stays put.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex h-96 flex-col rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
  <header class="border-b border-slate-100 px-4 py-3 text-sm font-semibold">Chat</header>
  <div class="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-sm">
    <div class="max-w-[80%] rounded-2xl bg-slate-100 px-3 py-2">Message 1</div>
    <div class="max-w-[80%] rounded-2xl bg-slate-100 px-3 py-2">Message 2</div>
    <div class="max-w-[80%] rounded-2xl bg-slate-100 px-3 py-2">Message 3</div>
    <div class="max-w-[80%] rounded-2xl bg-slate-100 px-3 py-2">Message 4</div>
    <div class="max-w-[80%] rounded-2xl bg-slate-100 px-3 py-2">Message 5</div>
    <div class="max-w-[80%] rounded-2xl bg-slate-100 px-3 py-2">Message 6</div>
    <div class="max-w-[80%] rounded-2xl bg-slate-100 px-3 py-2">Message 7</div>
    <div class="max-w-[80%] rounded-2xl bg-slate-100 px-3 py-2">Message 8</div>
    <div class="max-w-[80%] rounded-2xl bg-slate-100 px-3 py-2">Message 9</div>
    <div class="max-w-[80%] rounded-2xl bg-slate-100 px-3 py-2">Message 10</div>
    <div class="max-w-[80%] rounded-2xl bg-slate-100 px-3 py-2">Message 11</div>
    <div class="max-w-[80%] rounded-2xl bg-slate-100 px-3 py-2">Message 12</div>
    <div class="max-w-[80%] rounded-2xl bg-slate-100 px-3 py-2">Message 13</div>
    <div class="max-w-[80%] rounded-2xl bg-slate-100 px-3 py-2">Message 14</div>
    <div class="max-w-[80%] rounded-2xl bg-slate-100 px-3 py-2">Message 15</div>
  </div>
</div>
</body>
</html>
```

---
82. Split pane: scrollable list left, detail pane right (stacks on mobile).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="grid min-h-80 grid-cols-1 gap-3 md:grid-cols-[minmax(0,20rem)_1fr]">
  <aside class="overflow-y-auto rounded-xl bg-white p-3 text-sm shadow-sm ring-1 ring-slate-900/5">
    <ul class="space-y-2">
      <li class="rounded-lg bg-slate-50 px-2 py-2">Item 1</li>
      <li class="rounded-lg bg-slate-50 px-2 py-2">Item 2</li>
      <li class="rounded-lg bg-slate-50 px-2 py-2">Item 3</li>
      <li class="rounded-lg bg-slate-50 px-2 py-2">Item 4</li>
      <li class="rounded-lg bg-slate-50 px-2 py-2">Item 5</li>
      <li class="rounded-lg bg-slate-50 px-2 py-2">Item 6</li>
      <li class="rounded-lg bg-slate-50 px-2 py-2">Item 7</li>
      <li class="rounded-lg bg-slate-50 px-2 py-2">Item 8</li>
      <li class="rounded-lg bg-slate-50 px-2 py-2">Item 9</li>
      <li class="rounded-lg bg-slate-50 px-2 py-2">Item 10</li>
      <li class="rounded-lg bg-slate-50 px-2 py-2">Item 11</li>
    </ul>
  </aside>
  <section class="rounded-xl bg-slate-50 p-4 text-sm">Detail pane</section>
</div>
</body>
</html>
```

---
83. Horizontal scrolling chip list with hidden scrollbar aesthetic (still accessible).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="-mx-2 flex gap-2 overflow-x-auto px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
  <span class="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold shadow-sm ring-1 ring-slate-900/10">Chip 1</span>
  <span class="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold shadow-sm ring-1 ring-slate-900/10">Chip 2</span>
  <span class="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold shadow-sm ring-1 ring-slate-900/10">Chip 3</span>
  <span class="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold shadow-sm ring-1 ring-slate-900/10">Chip 4</span>
  <span class="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold shadow-sm ring-1 ring-slate-900/10">Chip 5</span>
  <span class="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold shadow-sm ring-1 ring-slate-900/10">Chip 6</span>
  <span class="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold shadow-sm ring-1 ring-slate-900/10">Chip 7</span>
  <span class="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold shadow-sm ring-1 ring-slate-900/10">Chip 8</span>
  <span class="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold shadow-sm ring-1 ring-slate-900/10">Chip 9</span>
  <span class="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold shadow-sm ring-1 ring-slate-900/10">Chip 10</span>
  <span class="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold shadow-sm ring-1 ring-slate-900/10">Chip 11</span>
  <span class="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold shadow-sm ring-1 ring-slate-900/10">Chip 12</span>
  <span class="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold shadow-sm ring-1 ring-slate-900/10">Chip 13</span>
</div>
<p class="mt-2 text-xs text-slate-500">Horizontal scroll; scrollbar hidden visually.</p>
</body>
</html>
```

---
84. Sticky section headings within an `overflow-y-auto` container.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="h-64 overflow-y-auto rounded-xl bg-white p-3 text-sm shadow-sm ring-1 ring-slate-900/5">
  <section class="sticky top-0 z-10 bg-white/95 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 backdrop-blur">Section 1</section>
  <p class="mb-4 text-slate-700">Content 1</p>
  <section class="sticky top-0 z-10 bg-white/95 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 backdrop-blur">Section 2</section>
  <p class="mb-4 text-slate-700">Content 2</p>
  <section class="sticky top-0 z-10 bg-white/95 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 backdrop-blur">Section 3</section>
  <p class="mb-4 text-slate-700">Content 3</p>
  <section class="sticky top-0 z-10 bg-white/95 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 backdrop-blur">Section 4</section>
  <p class="mb-4 text-slate-700">Content 4</p>
  <section class="sticky top-0 z-10 bg-white/95 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 backdrop-blur">Section 5</section>
  <p class="mb-4 text-slate-700">Content 5</p>
  <section class="sticky top-0 z-10 bg-white/95 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 backdrop-blur">Section 6</section>
  <p class="mb-4 text-slate-700">Content 6</p>
</div>
</body>
</html>
```

---

### Animations & Transitions (85–94)

85. Button color transition using `transition-colors` and `duration-*`.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<button class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-violet-600" type="button">Smooth colors</button>
</body>
</html>
```

---
86. Card lift effect: `hover:` translate and shadow with `transition-all`.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="max-w-xs rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
  <h3 class="text-base font-semibold">Hover lift</h3>
  <p class="mt-2 text-sm text-slate-600">Translate + shadow on hover.</p>
</div>
</body>
</html>
```

---
87. Use `animate-spin` on a loader icon.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex items-center gap-3 text-sm text-slate-700">
  <span class="inline-block size-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></span>
  Loading…
</div>
</body>
</html>
```

---
88. Use `animate-ping` on a notification dot.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<span class="relative flex size-3">
  <span class="absolute inline-flex size-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
  <span class="relative inline-flex size-3 rounded-full bg-rose-500"></span>
</span>
</body>
</html>
```

---
89. Use `animate-bounce` sparingly on a CTA chevron.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex items-center gap-2 text-sm font-semibold text-slate-800">
  <span>See more</span>
  <span class="inline-block animate-bounce">↓</span>
</div>
</body>
</html>
```

---
90. Define custom `@keyframes` in CSS and expose them via `@theme` for a `animate-*` utility.

```css
@import "tailwindcss";
@keyframes wiggle {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}
```

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="animate-[wiggle_1s_ease-in-out_infinite] text-lg font-semibold">Custom @keyframes + arbitrary animate</div>
</body>
</html>
```

---
91. `hover:` scale transform on a product tile.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="grid max-w-sm gap-3 sm:grid-cols-2">
  <article class="rounded-xl bg-white p-3 text-sm shadow-sm ring-1 ring-slate-900/5 transition hover:scale-[1.02]">Tile A</article>
  <article class="rounded-xl bg-white p-3 text-sm shadow-sm ring-1 ring-slate-900/5 transition hover:scale-[1.02]">Tile B</article>
</div>
</body>
</html>
```

---
92. Rotate an element in 3D on hover using `rotate-x-*` / `rotate-y-*` / `perspective-*`.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="perspective-distant">
  <div class="mx-auto max-w-sm rounded-2xl bg-white p-6 text-sm shadow-xl ring-1 ring-slate-900/10 transition duration-500 hover:rotate-x-12 hover:rotate-y-6">
    3D hover (perspective + rotate-x/y)
  </div>
</div>
</body>
</html>
```

---
93. Combine `translate-*` and `rotate-*` for a playful hover state.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<button class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition duration-300 ease-out hover:translate-y-0.5 hover:rotate-2 hover:shadow-lg active:translate-y-0 active:rotate-0" type="button">Playful hover</button>
</body>
</html>
```

---
94. Tune `duration-*` and `ease-*` on a sliding panel (markup-only).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="max-w-sm translate-x-0 rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5 transition duration-500 ease-in-out hover:translate-x-2">
  Slide on hover
</div>
</body>
</html>
```

---

### Dark Mode (95–102)

95. Opt-in dark styles using the `dark:` variant on a card component.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased dark:bg-slate-950">
<div class="rounded-2xl bg-white p-4 text-slate-900 shadow-sm ring-1 ring-slate-900/10 dark:bg-slate-900 dark:text-slate-50 dark:ring-white/10">
  <h3 class="text-base font-semibold">Card</h3>
  <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Uses <code class="rounded bg-slate-100 px-1 dark:bg-white/10">dark:</code> utilities.</p>
</div>
</body>
</html>
```

---
96. Respect system theme using `prefers-color-scheme` driven dark mode (document the `dark` class strategy in a comment).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-white p-6 dark:bg-slate-950">
<!-- Toggle dark mode by adding class `dark` on <html>; pair with your own script or CSS media strategy. -->
<div class="rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:text-slate-50">
  Documented strategy in HTML comment.
</div>
</body>
</html>
```

---
97. Build a manual theme toggle button (two variants side by side) using `dark:` classes on a wrapper.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="grid gap-4 md:grid-cols-2">
  <div class="rounded-xl bg-white p-4 text-sm text-slate-900 shadow-sm ring-1 ring-slate-900/10">Light preview</div>
  <div class="dark rounded-xl bg-white p-4 text-sm text-slate-900 shadow-sm ring-1 ring-slate-900/10 dark:bg-slate-900 dark:text-slate-50">
    Manual <code class="rounded bg-slate-100 px-1 dark:bg-white/10">dark</code> subtree
  </div>
</div>
</body>
</html>
```

---
98. Dark-mode-friendly dashboard cards with distinct border and background tokens.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="dark grid gap-3 rounded-2xl bg-slate-950 p-4 text-slate-50">
  <div class="rounded-xl border border-white/10 bg-slate-900/40 p-4 text-sm shadow-sm">Dashboard card</div>
  <div class="rounded-xl border border-white/10 bg-slate-900/40 p-4 text-sm shadow-sm">Widget</div>
</div>
</body>
</html>
```

---
99. Styled form controls that remain legible in dark mode.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<form class="dark max-w-md space-y-3 rounded-2xl bg-slate-950 p-4 text-slate-50">
  <label class="text-xs font-medium text-slate-300" for="u">Username</label>
  <input class="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-indigo-500/40" id="u" />
</form>
</body>
</html>
```

---
100. Navbar that adapts background, text, and borders in dark mode.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<header class="dark flex items-center justify-between rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-50">
  <span class="text-sm font-bold">Night UI</span>
  <nav class="flex gap-3 text-xs text-slate-300">
    <a class="hover:text-white" href="#">Home</a>
    <a class="hover:text-white" href="#">Billing</a>
  </nav>
</header>
</body>
</html>
```

---
101. Extract repeated light/dark colors into `@theme` variables and use mapped utilities.

```css
@import "tailwindcss";
@theme {
  --color-surface: oklch(0.99 0.01 260);
  --color-surface-dark: oklch(0.18 0.03 260);
  --color-fg: oklch(0.2 0.02 260);
  --color-fg-dark: oklch(0.96 0.01 260);
}
```

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="rounded-xl bg-[var(--color-surface)] p-4 text-[var(--color-fg)] shadow-sm ring-1 ring-slate-900/10 dark:bg-[var(--color-surface-dark)] dark:text-[var(--color-fg-dark)]">
  Semantic OKLCH tokens via <code class="rounded bg-black/5 px-1 dark:bg-white/10">@theme</code> + CSS variables.
</div>
</body>
</html>
```

---
102. Gradient hero that flips gradient direction or stops between light and dark themes.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 dark:bg-slate-950">
<section class="rounded-2xl bg-linear-to-r from-sky-400 to-indigo-500 px-6 py-10 text-white shadow-lg dark:bg-linear-to-l dark:from-indigo-900 dark:to-slate-900">
  <h2 class="text-2xl font-semibold">Gradient hero</h2>
  <p class="mt-2 max-w-prose text-sm text-white/90 dark:text-slate-200">Theme-aware gradient.</p>
</section>
</body>
</html>
```

---

### Forms (103–114)

103. Text inputs with filled and outlined styles.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="grid max-w-md gap-4">
  <label class="block text-sm font-medium text-slate-700">Filled
    <input class="mt-1 w-full rounded-lg border-0 bg-slate-100 px-3 py-2 text-sm shadow-inner" />
  </label>
  <label class="block text-sm font-medium text-slate-700">Outlined
    <input class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm" />
  </label>
</div>
</body>
</html>
```

---
104. Styled `<select>` with custom arrow appearance using utilities (wrapper div pattern).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<label class="block max-w-xs text-sm font-medium text-slate-700">Country
  <div class="relative mt-1">
    <select class="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm shadow-sm">
      <option>United States</option>
      <option>Canada</option>
    </select>
    <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">▾</span>
  </div>
</label>
</body>
</html>
```

---
105. Custom checkbox visual using `peer` and `appearance-none`.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<label class="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
  <input class="peer sr-only" type="checkbox" />
  <span class="grid size-5 place-items-center rounded border border-slate-300 bg-white text-xs font-bold text-transparent peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white">
    ✓
  </span>
  Custom checkbox
</label>
</body>
</html>
```

---
106. Radio group styled as segmented control.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<fieldset class="max-w-md">
  <legend class="text-sm font-medium text-slate-700">Plan</legend>
  <div class="mt-2 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
    <label class="cursor-pointer rounded-lg border border-slate-200 px-2 py-2 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50">
      <input class="sr-only" name="plan" type="radio" />Basic
    </label>
    <label class="cursor-pointer rounded-lg border border-slate-200 px-2 py-2 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50">
      <input class="sr-only" name="plan" type="radio" />Pro
    </label>
    <label class="cursor-pointer rounded-lg border border-slate-200 px-2 py-2 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50">
      <input class="sr-only" name="plan" type="radio" />Team
    </label>
  </div>
</fieldset>
</body>
</html>
```

---
107. iOS-style switch using `peer-checked:` and rounded full track.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<label class="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
  <input class="peer sr-only" type="checkbox" />
  <span class="h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500">
    <span class="block size-7 translate-x-0 rounded-full bg-white shadow transition peer-checked:translate-x-5"></span>
  </span>
  Airplane mode
</label>
</body>
</html>
```

---
108. Range slider styled with accent-friendly utilities and width constraints.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<label class="block max-w-md text-sm font-medium text-slate-700">Volume
  <input class="mt-2 w-full accent-indigo-600" max="100" min="0" type="range" value="40" />
</label>
</body>
</html>
```

---
109. File input row with button-like `file:` selector styling.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<label class="block max-w-md text-sm font-medium text-slate-700">Attachment
  <input class="mt-2 block w-full cursor-pointer rounded-lg border border-dashed border-slate-300 bg-white px-3 py-6 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white" type="file" />
</label>
</body>
</html>
```

---
110. Input group: leading icon, input, trailing button.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex max-w-md rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
  <span class="flex items-center px-3 text-slate-500">@</span>
  <input class="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm outline-none" placeholder="username" />
  <button class="rounded-r-xl bg-indigo-600 px-4 text-xs font-semibold text-white" type="button">Go</button>
</div>
</body>
</html>
```

---
111. Floating label pattern (CSS-only) for an email field.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="relative max-w-md">
  <input class="peer w-full rounded-xl border border-slate-300 px-3 pb-2 pt-6 text-sm outline-none focus:border-indigo-500" id="em" placeholder=" " />
  <label class="pointer-events-none absolute left-3 top-2 text-xs text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-600" for="em">Email</label>
</div>
</body>
</html>
```

---
112. Validation states: `border-emerald-*` for success, `border-red-*` for error.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="grid max-w-md gap-3">
  <div>
    <label class="text-xs font-medium text-emerald-800" for="ok">Valid</label>
    <input class="mt-1 w-full rounded-lg border border-emerald-400 bg-emerald-50 px-3 py-2 text-sm" id="ok" />
  </div>
  <div>
    <label class="text-xs font-medium text-red-800" for="bad">Invalid</label>
    <input class="mt-1 w-full rounded-lg border border-red-400 bg-red-50 px-3 py-2 text-sm" id="bad" />
  </div>
</div>
</body>
</html>
```

---
113. Search field with clear icon spacing and `focus-within:` ring on wrapper.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex max-w-md items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm ring-2 ring-transparent transition focus-within:ring-indigo-500/30">
  <span class="text-slate-400" aria-hidden="true">⌕</span>
  <input class="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none" placeholder="Search…" type="search" />
</div>
</body>
</html>
```

---
114. `textarea` with auto `min-h-*`, `resize-y`, and character hint text.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<label class="block max-w-xl text-sm font-medium text-slate-700">Notes
  <textarea class="mt-1 min-h-32 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm leading-relaxed shadow-sm" rows="4"></textarea>
  <p class="mt-1 text-xs text-slate-500">Helper under textarea.</p>
</label>
</body>
</html>
```

---

### Advanced Components (115–126)

115. Dropdown menu panel positioned under a button (CSS-only hover/focus pattern).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="relative inline-block text-sm">
  <button class="rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white" type="button">Menu</button>
  <div class="absolute left-0 z-20 mt-2 hidden w-48 rounded-xl bg-white p-2 shadow-xl ring-1 ring-slate-900/10 group-hover:block">
    <!-- use `group` on parent + hover for CSS-only -->
  </div>
</div>
<div class="group relative inline-block text-sm">
  <button class="rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white" type="button">Hover me</button>
  <div class="invisible absolute left-0 z-20 mt-2 w-48 rounded-xl bg-white p-2 opacity-0 shadow-xl ring-1 ring-slate-900/10 transition group-hover:visible group-hover:opacity-100">
    <a class="block rounded-lg px-2 py-1 hover:bg-slate-50" href="#">Item</a>
    <a class="block rounded-lg px-2 py-1 hover:bg-slate-50" href="#">Settings</a>
  </div>
</div>
</body>
</html>
```

---
116. Modal dialog markup using `<dialog>` with backdrop styling classes.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<dialog class="open:flex hidden w-[min(100%-2rem,28rem)] flex-col gap-3 rounded-2xl border-0 bg-white p-6 text-sm shadow-2xl ring-1 ring-slate-900/10 backdrop:bg-slate-950/60" open>
  <h2 class="text-lg font-semibold">Dialog</h2>
  <p class="text-slate-600">Native <code class="rounded bg-slate-100 px-1">&lt;dialog&gt;</code> with backdrop utilities.</p>
  <button class="ml-auto rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white" method="dialog" type="submit">Close</button>
</dialog>
</body>
</html>
```

---
117. Tabs: list of triggers and panels with active state styles (no JS required beyond details/summary if you prefer).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="max-w-xl text-sm">
  <div class="flex gap-2 border-b border-slate-200">
    <button class="border-b-2 border-indigo-600 px-3 py-2 font-semibold text-indigo-700" type="button">Account</button>
    <button class="border-b-2 border-transparent px-3 py-2 text-slate-600 hover:text-slate-900" type="button">Billing</button>
  </div>
  <div class="mt-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">Tab panel A</div>
</div>
</body>
</html>
```

---
118. Accordion with `details` / `summary` and animated chevron.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="max-w-xl space-y-2 text-sm">
  <details class="group rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-900/5" open>
    <summary class="flex cursor-pointer list-none items-center justify-between font-semibold">
      Section 1
      <span class="transition group-open:rotate-180">⌄</span>
    </summary>
    <p class="mt-2 text-slate-600">Accordion body</p>
  </details>
  <details class="group rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-900/5">
    <summary class="flex cursor-pointer list-none items-center justify-between font-semibold">
      Section 2
      <span class="transition group-open:rotate-180">⌄</span>
    </summary>
    <p class="mt-2 text-slate-600">More content</p>
  </details>
</div>
</body>
</html>
```

---
119. Tooltip on hover using `group-hover:` and absolutely positioned bubble.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<span class="group relative inline-flex text-sm font-medium text-slate-800">
  Hover for tip
  <span class="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-40 -translate-x-1/2 rounded-lg bg-slate-900 px-2 py-1 text-center text-xs text-white opacity-0 shadow-lg transition group-hover:opacity-100">
    Tooltip text
  </span>
</span>
</body>
</html>
```

---
120. Toast stack fixed to the corner with shadow and border.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="fixed bottom-4 right-4 z-50 w-72 space-y-2 text-sm">
  <div class="rounded-xl bg-slate-900 px-3 py-2 text-white shadow-lg">Saved</div>
  <div class="rounded-xl bg-white px-3 py-2 text-slate-800 shadow-lg ring-1 ring-slate-900/10">New message</div>
</div>
</body>
</html>
```

---
121. Breadcrumb trail with separators and `truncate` on small screens.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<nav aria-label="Breadcrumb" class="flex max-w-xl flex-wrap items-center gap-2 text-xs text-slate-600">
  <a class="hover:text-slate-900" href="#">Home</a>
  <span class="text-slate-400">/</span>
  <a class="hover:text-slate-900" href="#">Docs</a>
  <span class="text-slate-400">/</span>
  <span class="truncate font-medium text-slate-900">Very long current page title…</span>
</nav>
</body>
</html>
```

---
122. Pagination row with previous/next and numbered pages.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<nav class="flex flex-wrap items-center gap-2 text-sm">
  <button class="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50" type="button">Prev</button>
  <button class="rounded-lg px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50" type="button">1</button>
  <button class="rounded-lg px-3 py-1.5 bg-slate-900 text-white" type="button">2</button>
  <button class="rounded-lg px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50" type="button">3</button>
  <button class="rounded-lg px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50" type="button">4</button>
  <button class="rounded-lg px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50" type="button">5</button>
  <button class="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50" type="button">Next</button>
</nav>
</body>
</html>
```

---
123. Stepper showing three steps with connectors and active/completed states.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<ol class="flex max-w-2xl items-center gap-3 text-xs font-semibold text-slate-600">
  <li class="flex items-center gap-2">
    <span class="grid size-8 place-items-center rounded-full bg-emerald-600 text-white">1</span>
    <span class="hidden sm:inline">Step 1</span>
    <span class="h-px w-8 bg-slate-200"></span>
  </li>
  <li class="flex items-center gap-2">
    <span class="grid size-8 place-items-center rounded-full bg-emerald-600 text-white">2</span>
    <span class="hidden sm:inline">Step 2</span>
    <span class="h-px w-8 bg-slate-200"></span>
  </li>
  <li class="flex items-center gap-2">
    <span class="grid size-8 place-items-center rounded-full bg-slate-200">3</span>
    <span class="hidden sm:inline">Step 3</span>
  </li>
</ol>
</body>
</html>
```

---
124. Vertical timeline with dots and connecting line.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<ul class="relative max-w-md space-y-6 border-l border-slate-200 pl-6 text-sm">
  <li class="relative">
    <span class="absolute -left-[0.4rem] top-1 size-3 rounded-full bg-indigo-600 ring-4 ring-white"></span>
    <p class="font-semibold">Milestone 1</p>
    <p class="text-slate-600">Description 1</p>
  </li>
  <li class="relative">
    <span class="absolute -left-[0.4rem] top-1 size-3 rounded-full bg-indigo-600 ring-4 ring-white"></span>
    <p class="font-semibold">Milestone 2</p>
    <p class="text-slate-600">Description 2</p>
  </li>
  <li class="relative">
    <span class="absolute -left-[0.4rem] top-1 size-3 rounded-full bg-indigo-600 ring-4 ring-white"></span>
    <p class="font-semibold">Milestone 3</p>
    <p class="text-slate-600">Description 3</p>
  </li>
</ul>
</body>
</html>
```

---
125. Pricing card with highlighted “Popular” tier and feature list.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="grid max-w-5xl gap-4 md:grid-cols-3">
  <article class="rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
    <h3 class="text-base font-semibold">Starter</h3>
    <p class="mt-2 text-3xl font-bold">$9<span class="text-sm font-normal text-slate-500">/mo</span></p>
    <ul class="mt-4 space-y-2 text-slate-600">
      <li>✓ Feature</li>
    </ul>
  </article>
  <article class="relative rounded-2xl border-2 border-indigo-600 bg-white p-5 text-sm shadow-lg">
    <span class="absolute -top-3 left-4 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Popular</span>
    <h3 class="text-base font-semibold">Pro</h3>
    <p class="mt-2 text-3xl font-bold">$29<span class="text-sm font-normal text-slate-500">/mo</span></p>
    <ul class="mt-4 space-y-2 text-slate-600">
      <li>✓ Everything in Starter</li>
      <li>✓ Priority support</li>
    </ul>
  </article>
  <article class="rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
    <h3 class="text-base font-semibold">Team</h3>
    <p class="mt-2 text-3xl font-bold">$99<span class="text-sm font-normal text-slate-500">/mo</span></p>
  </article>
</div>
</body>
</html>
```

---
126. Testimonial card with avatar, quote, and star rating row.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<figure class="max-w-md rounded-2xl bg-white p-5 text-sm shadow-sm ring-1 ring-slate-900/5">
  <div class="flex items-center gap-3">
    <img class="size-12 rounded-full object-cover" alt="" src="https://i.pravatar.cc/120?img=5" />
    <div>
      <p class="font-semibold">Avery</p>
      <p class="text-xs text-slate-500">Product designer</p>
    </div>
  </div>
  <blockquote class="mt-3 text-slate-700">“Tailwind v4 makes design tokens feel native.”</blockquote>
  <div class="mt-3 flex gap-1 text-amber-400">★★★★★</div>
</figure>
</body>
</html>
```

---

### Container Queries & Modern Variants (127–134)

127. Mark a card wrapper as `@container` and change layout at `@md` container sizes.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="@container max-w-xl resize-x overflow-auto rounded-2xl bg-slate-100 p-4 text-sm">
  <p class="text-xs text-slate-500">Drag corner (browser) to resize container.</p>
  <div class="mt-3 grid grid-cols-1 gap-3 @md:grid-cols-2">
    <div class="rounded-xl bg-white p-3 shadow-sm">A</div>
    <div class="rounded-xl bg-white p-3 shadow-sm">B</div>
  </div>
</div>
</body>
</html>
```

---
128. Card that switches from stacked to horizontal when its container is wide enough.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="@container w-full max-w-3xl rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">
  <div class="flex flex-col gap-3 @lg:flex-row @lg:items-center">
    <div class="h-24 flex-1 rounded-xl bg-slate-100"></div>
    <div class="flex-1">
      <h3 class="text-base font-semibold">Card title</h3>
      <p class="text-slate-600">Stacks until container is wide.</p>
    </div>
  </div>
</div>
</body>
</html>
```

---
129. Grid inside a container that reflows based on container width, not only viewport.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="@container max-w-4xl rounded-2xl bg-slate-50 p-4">
  <div class="grid grid-cols-1 gap-3 @xl:grid-cols-3">
    <div class="rounded-xl bg-white p-3 text-sm shadow-sm">Box 1</div>
    <div class="rounded-xl bg-white p-3 text-sm shadow-sm">Box 2</div>
    <div class="rounded-xl bg-white p-3 text-sm shadow-sm">Box 3</div>
    <div class="rounded-xl bg-white p-3 text-sm shadow-sm">Box 4</div>
    <div class="rounded-xl bg-white p-3 text-sm shadow-sm">Box 5</div>
    <div class="rounded-xl bg-white p-3 text-sm shadow-sm">Box 6</div>
  </div>
</div>
</body>
</html>
```

---
130. Use `not-hover:` to dim helper text when the parent is *not* hovered.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="group max-w-md rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5 transition">
  <p class="text-slate-500 transition not-group-hover:text-slate-900">Dims when the card is <em>not</em> hovered.</p>
  <p class="mt-2 text-xs text-slate-400 not-group-hover:opacity-60">Helper copy uses <code class="rounded bg-slate-100 px-1">not-hover:</code> / <code class="rounded bg-slate-100 px-1">not-group-hover:</code> patterns.</p>
</div>
</body>
</html>
```

---
131. Parent highlights when it `has-[:checked]` using `has-*` utilities.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="max-w-md rounded-xl border border-slate-200 bg-white p-4 text-sm has-[:checked]:border-indigo-500 has-[:checked]:shadow-md">
  <label class="flex items-center gap-2 font-medium">
    <input class="size-4 accent-indigo-600" type="checkbox" />
    Accept terms
  </label>
  <p class="mt-2 text-xs text-slate-500">Parent highlights when input is checked.</p>
</div>
</body>
</html>
```

---
132. Use `in-data-[state=open]:` or `in-aria-expanded-*:` style patterns on nested labels (document expected attributes).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<!-- Expect `data-state="open"` on ancestor for demo styling -->
<div class="space-y-2 text-sm">
  <div class="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600" data-state="open">
    <span class="font-semibold text-slate-900 in-data-[state=open]:text-indigo-700">Label</span>
    <p class="in-data-[state=open]:text-indigo-600">Nested text reacts to ancestor data attribute.</p>
  </div>
</div>
</body>
</html>
```

---
133. Combine `group-has-*` to style a row when an inner checkbox is checked.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="group max-w-md rounded-xl border border-slate-200 bg-white p-4 text-sm">
  <label class="flex items-center gap-2">
    <input class="peer accent-indigo-600" type="checkbox" />
    <span class="text-slate-700 group-has-[:checked]:font-semibold group-has-[:checked]:text-indigo-700">Row title</span>
  </label>
  <p class="mt-2 text-xs text-slate-500">Row style changes when inner checkbox is checked.</p>
</div>
</body>
</html>
```

---
134. Style a button differently when `data-variant="ghost"` using arbitrary `data-*` variants.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex gap-2 text-sm">
  <button class="rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white data-[variant=ghost]:bg-transparent data-[variant=ghost]:text-slate-900 data-[variant=ghost]:ring-1 data-[variant=ghost]:ring-slate-300" data-variant="solid" type="button">Solid</button>
  <button class="rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white data-[variant=ghost]:bg-transparent data-[variant=ghost]:text-slate-900 data-[variant=ghost]:ring-1 data-[variant=ghost]:ring-slate-300" data-variant="ghost" type="button">Ghost</button>
</div>
</body>
</html>
```

---

### Customization (135–140)

135. Add brand colors as OKLCH values inside `@theme` and use them as `bg-*` / `text-*`.

```css
@import "tailwindcss";
@theme {
  --color-brand-500: oklch(0.62 0.19 265);
  --color-brand-700: oklch(0.45 0.18 265);
}
```

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="rounded-xl bg-[var(--color-brand-500)] px-4 py-3 text-sm font-semibold text-white">
  Brand surface using OKLCH tokens in <code class="rounded bg-white/15 px-1">@theme</code>.
</div>
</body>
</html>
```

---
136. Extend spacing with a custom `--spacing-*` token and use it in `p-*`, `m-*`, or `gap-*`.

```css
@import "tailwindcss";
@theme {
  --spacing-18: 4.5rem;
}
```

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="rounded-xl bg-white p-[var(--spacing-18)] text-sm shadow-sm ring-1 ring-slate-900/5">
  Custom spacing token consumed via arbitrary value.
</div>
</body>
</html>
```

---
137. Register a custom font family in `@theme` and apply with `font-*` utilities.

```css
@import "tailwindcss";
@theme {
  --font-display: ui-sans-serif, system-ui, sans-serif;
}
```

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<h2 class="text-2xl font-bold" style="font-family: var(--font-display)">Display heading</h2>
<p class="mt-2 max-w-prose text-sm text-slate-600">Register a custom family in <code class="rounded bg-slate-100 px-1">@theme</code> and apply (here via inline style for portability).</p>
</body>
</html>
```

---
138. Create a `@utility` that applies a reusable cluster of utilities (document the CSS).

```css
@import "tailwindcss";
@import "tailwindcss";
@utility tabular-nums-tight {
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
```

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<p class="tabular-nums-tight text-lg font-semibold">$12,345.67</p>
</body>
</html>
```

---
139. Create a `@variant` (e.g. `hocus:` for hover+focus) and demonstrate on a link.

```css
@import "tailwindcss";
@import "tailwindcss";
@custom-variant hocus (&:hover, &:focus-visible);
```

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<a class="hocus:underline text-indigo-700" href="#">Hocus link</a>
</body>
</html>
```

---
140. Use arbitrary values such as `top-[137px]` and `w-[73cqw]` in a layout sketch.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="@container relative h-48 w-full max-w-md rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
  <div class="absolute left-2 top-[137px] h-10 w-[73cqw] rounded-lg bg-indigo-100 text-xs leading-10 text-indigo-900 ring-1 ring-indigo-200">
    <span class="px-2">top-[137px] + w-[73cqw]</span>
  </div>
</div>
</body>
</html>
```

---

---

## ADVANCED (Assignments 141–200)

### Complex Components (141–152)

141. Animated hamburger icon that morphs into an `X` using transitions (checkbox or `peer` hack).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<label class="group relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-900/10">
  <input class="peer sr-only" type="checkbox" />
  <span class="block h-0.5 w-6 bg-slate-900 transition peer-checked:translate-y-0 peer-checked:rotate-45 peer-checked:bg-rose-600"></span>
  <span class="absolute block h-0.5 w-6 bg-slate-900 transition peer-checked:opacity-0"></span>
  <span class="absolute block h-0.5 w-6 bg-slate-900 transition peer-checked:-translate-y-0 peer-checked:-rotate-45 peer-checked:bg-rose-600"></span>
</label>
</body>
</html>
```

---
142. Mega menu dropdown with multi-column groups (CSS hover/focus visibility).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="group relative inline-block text-sm">
  <button class="rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white" type="button">Products ▾</button>
  <div class="invisible absolute left-0 z-30 mt-2 w-[min(100vw-2rem,48rem)] translate-y-1 rounded-2xl bg-white p-4 opacity-0 shadow-2xl ring-1 ring-slate-900/10 transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
    <div class="grid gap-4 md:grid-cols-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Build</p>
        <ul class="mt-2 space-y-1 text-slate-700">
          <li><a class="hover:text-slate-900" href="#">Compiler</a></li>
          <li><a class="hover:text-slate-900" href="#">CLI</a></li>
        </ul>
      </div>
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Learn</p>
        <ul class="mt-2 space-y-1 text-slate-700">
          <li><a class="hover:text-slate-900" href="#">Docs</a></li>
        </ul>
      </div>
      <div class="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">Featured promo</div>
    </div>
  </div>
</div>
</body>
</html>
```

---
143. Image gallery grid with a “lightbox” overlay frame (static markup; dimmed backdrop).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="grid grid-cols-2 gap-2 md:grid-cols-4">
  <button class="relative aspect-square overflow-hidden rounded-xl bg-slate-200 ring-1 ring-slate-900/10">
    <span class="absolute inset-0 bg-slate-900/0 transition hover:bg-slate-900/20"></span>
    <span class="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold">IMG 1</span>
  </button>
  <button class="relative aspect-square overflow-hidden rounded-xl bg-slate-200 ring-1 ring-slate-900/10">
    <span class="absolute inset-0 bg-slate-900/0 transition hover:bg-slate-900/20"></span>
    <span class="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold">IMG 2</span>
  </button>
  <button class="relative aspect-square overflow-hidden rounded-xl bg-slate-200 ring-1 ring-slate-900/10">
    <span class="absolute inset-0 bg-slate-900/0 transition hover:bg-slate-900/20"></span>
    <span class="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold">IMG 3</span>
  </button>
  <button class="relative aspect-square overflow-hidden rounded-xl bg-slate-200 ring-1 ring-slate-900/10">
    <span class="absolute inset-0 bg-slate-900/0 transition hover:bg-slate-900/20"></span>
    <span class="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold">IMG 4</span>
  </button>
  <button class="relative aspect-square overflow-hidden rounded-xl bg-slate-200 ring-1 ring-slate-900/10">
    <span class="absolute inset-0 bg-slate-900/0 transition hover:bg-slate-900/20"></span>
    <span class="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold">IMG 5</span>
  </button>
  <button class="relative aspect-square overflow-hidden rounded-xl bg-slate-200 ring-1 ring-slate-900/10">
    <span class="absolute inset-0 bg-slate-900/0 transition hover:bg-slate-900/20"></span>
    <span class="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold">IMG 6</span>
  </button>
  <button class="relative aspect-square overflow-hidden rounded-xl bg-slate-200 ring-1 ring-slate-900/10">
    <span class="absolute inset-0 bg-slate-900/0 transition hover:bg-slate-900/20"></span>
    <span class="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold">IMG 7</span>
  </button>
  <button class="relative aspect-square overflow-hidden rounded-xl bg-slate-200 ring-1 ring-slate-900/10">
    <span class="absolute inset-0 bg-slate-900/0 transition hover:bg-slate-900/20"></span>
    <span class="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold">IMG 8</span>
  </button>
</div>
<div class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-950/70 p-6">
  <div class="max-h-[80vh] w-full max-w-3xl rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-slate-900/10">Lightbox frame (toggle with JS)</div>
</div>
</body>
</html>
```

---
144. Drag-and-drop *style* list: cards with “handle”, elevation, and reordering hints (visual only).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<ul class="max-w-md space-y-2 text-sm">
  <li class="flex cursor-grab items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-3 shadow-sm active:cursor-grabbing">
    <span class="text-slate-400">⋮⋮</span>
    <span>Task 1</span>
  </li>
  <li class="flex cursor-grab items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-3 shadow-sm active:cursor-grabbing">
    <span class="text-slate-400">⋮⋮</span>
    <span>Task 2</span>
  </li>
  <li class="flex cursor-grab items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-3 shadow-sm active:cursor-grabbing">
    <span class="text-slate-400">⋮⋮</span>
    <span>Task 3</span>
  </li>
  <li class="flex cursor-grab items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-3 shadow-sm active:cursor-grabbing">
    <span class="text-slate-400">⋮⋮</span>
    <span>Task 4</span>
  </li>
</ul>
</body>
</html>
```

---
145. Kanban board: columns, cards, tags, and scrollable columns.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex min-h-64 gap-3 overflow-x-auto pb-2">
  <section class="w-64 shrink-0 rounded-2xl bg-slate-50 p-3 text-sm ring-1 ring-slate-200">
    <h3 class="font-semibold">Column 1</h3>
    <div class="mt-3 space-y-2">
      <article class="rounded-xl bg-white p-3 shadow-sm">Card A</article>
      <article class="rounded-xl bg-white p-3 shadow-sm">Card B</article>
    </div>
  </section>
  <section class="w-64 shrink-0 rounded-2xl bg-slate-50 p-3 text-sm ring-1 ring-slate-200">
    <h3 class="font-semibold">Column 2</h3>
    <div class="mt-3 space-y-2">
      <article class="rounded-xl bg-white p-3 shadow-sm">Card A</article>
      <article class="rounded-xl bg-white p-3 shadow-sm">Card B</article>
    </div>
  </section>
  <section class="w-64 shrink-0 rounded-2xl bg-slate-50 p-3 text-sm ring-1 ring-slate-200">
    <h3 class="font-semibold">Column 3</h3>
    <div class="mt-3 space-y-2">
      <article class="rounded-xl bg-white p-3 shadow-sm">Card A</article>
      <article class="rounded-xl bg-white p-3 shadow-sm">Card B</article>
    </div>
  </section>
</div>
</body>
</html>
```

---
146. Chat UI: bubbles, timestamps, sticky composer bar, unread divider.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<section class="flex max-w-lg flex-col rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
  <header class="border-b border-slate-100 px-4 py-3 text-sm font-semibold">Team chat</header>
  <div class="h-64 space-y-2 overflow-y-auto px-4 py-3 text-sm">
    <div class="mr-8 rounded-2xl bg-slate-100 px-3 py-2">Peer: Got the Tailwind v4 build working?</div>
    <div class="ml-8 rounded-2xl bg-indigo-600 px-3 py-2 text-white">You: Yes — CSS-first config is lovely.</div>
    <div class="border-t border-dashed border-slate-200 pt-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">New messages</div>
  </div>
  <footer class="border-t border-slate-100 p-3">
    <div class="flex gap-2">
      <input class="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Message" />
      <button class="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white" type="button">Send</button>
    </div>
  </footer>
</section>
</body>
</html>
```

---
147. Notification center panel list with icons, unread dot, and time stamps.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="max-w-sm rounded-2xl bg-white p-3 text-sm shadow-xl ring-1 ring-slate-900/10">
  <div class="flex items-start gap-3 border-b border-slate-100 py-3">
    <span class="mt-1 size-2 rounded-full bg-sky-500"></span>
    <div class="flex-1">
      <p class="font-semibold">Deploy finished</p>
      <p class="text-xs text-slate-500">2m ago</p>
    </div>
  </div>
  <div class="flex items-start gap-3 py-3">
    <span class="mt-1 size-2 rounded-full bg-slate-300"></span>
    <div class="flex-1">
      <p class="font-semibold text-slate-600">Comment</p>
      <p class="text-xs text-slate-500">1h ago</p>
    </div>
  </div>
</div>
</body>
</html>
```

---
148. Command palette mock: search input, grouped results, kbd hints.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="mx-auto max-w-xl rounded-2xl bg-slate-950 p-4 text-slate-50 shadow-2xl">
  <label class="text-xs font-semibold text-slate-400">Command palette</label>
  <input class="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40" placeholder="Type a command…" />
  <div class="mt-3 space-y-2 text-sm">
    <div class="flex items-center justify-between rounded-lg bg-white/5 px-2 py-2">
      <span>Toggle theme</span>
      <kbd class="rounded bg-black/40 px-1.5 py-0.5 text-[10px]">⌘K</kbd>
    </div>
    <div class="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-white/5">
      <span>Search docs</span>
      <kbd class="rounded bg-black/40 px-1.5 py-0.5 text-[10px]">/</kbd>
    </div>
  </div>
</div>
</body>
</html>
```

---
149. Month calendar grid with headers, cells, and an “event” chip on a day.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="max-w-3xl rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">
  <div class="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">
<div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>
  </div>
  <div class="mt-2 grid grid-cols-7 gap-1 text-center text-xs">
    <div class="aspect-square rounded-lg py-2 hover:bg-slate-50 "></div>
    <div class="aspect-square rounded-lg py-2 hover:bg-slate-50 "></div>
    <div class="aspect-square rounded-lg py-2 hover:bg-slate-50 "></div>
    <div class="aspect-square rounded-lg py-2 hover:bg-slate-50 "></div>
    <div class="aspect-square rounded-lg py-2 hover:bg-slate-50 ">1</div>
    <div class="aspect-square rounded-lg py-2 hover:bg-slate-50 ">2</div>
    <div class="aspect-square rounded-lg py-2 hover:bg-slate-50 ">3</div>
    <div class="aspect-square rounded-lg py-2 hover:bg-slate-50 ">4</div>
    <div class="aspect-square rounded-lg py-2 hover:bg-slate-50 ">5</div>
    <div class="aspect-square rounded-lg py-2 hover:bg-slate-50 ">6</div>
    <div class="aspect-square rounded-lg py-2 hover:bg-slate-50 ">7</div>
    <div class="aspect-square rounded-lg py-2 hover:bg-slate-50 ">8</div>
    <div class="aspect-square rounded-lg py-2 hover:bg-slate-50 ">9</div>
    <div class="aspect-square rounded-lg py-2 hover:bg-slate-50 ">10</div>
    <div class="aspect-square rounded-lg py-2 hover:bg-slate-50 ">11</div>
    <div class="aspect-square rounded-lg py-2 hover:bg-slate-50 bg-indigo-50 font-semibold text-indigo-700">12</div>
    <div class="aspect-square rounded-lg py-2 hover:bg-slate-50 ">13</div>
    <div class="aspect-square rounded-lg py-2 hover:bg-slate-50 ">14</div>
  </div>
</div>
</body>
</html>
```

---
150. Data table with sortable column headers (buttons) and zebra rows.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="overflow-x-auto rounded-2xl bg-white text-sm shadow-sm ring-1 ring-slate-900/5">
  <table class="min-w-full text-left">
    <thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
      <tr>
        <th class="px-3 py-2"><button class="flex items-center gap-1 hover:text-slate-900" type="button">Name <span>↕</span></button></th>
        <th class="px-3 py-2"><button class="flex items-center gap-1 hover:text-slate-900" type="button">Role <span>↕</span></button></th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-100">
      <tr class="odd:bg-white even:bg-slate-50">
        <td class="px-3 py-2">Ada</td>
        <td class="px-3 py-2">Engineer</td>
      </tr>
      <tr class="odd:bg-white even:bg-slate-50">
        <td class="px-3 py-2">Lin</td>
        <td class="px-3 py-2">Designer</td>
      </tr>
    </tbody>
  </table>
</div>
</body>
</html>
```

---
151. Infinite scroll *skeleton* list showing placeholder cards.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="max-w-md space-y-3">
  <div class="animate-pulse rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
    <div class="h-4 w-1/3 rounded bg-slate-200"></div>
    <div class="mt-3 h-3 w-full rounded bg-slate-200"></div>
    <div class="mt-2 h-3 w-5/6 rounded bg-slate-200"></div>
  </div>
  <div class="animate-pulse rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
    <div class="h-4 w-1/3 rounded bg-slate-200"></div>
    <div class="mt-3 h-3 w-full rounded bg-slate-200"></div>
    <div class="mt-2 h-3 w-5/6 rounded bg-slate-200"></div>
  </div>
  <div class="animate-pulse rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
    <div class="h-4 w-1/3 rounded bg-slate-200"></div>
    <div class="mt-3 h-3 w-full rounded bg-slate-200"></div>
    <div class="mt-2 h-3 w-5/6 rounded bg-slate-200"></div>
  </div>
  <div class="animate-pulse rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
    <div class="h-4 w-1/3 rounded bg-slate-200"></div>
    <div class="mt-3 h-3 w-full rounded bg-slate-200"></div>
    <div class="mt-2 h-3 w-5/6 rounded bg-slate-200"></div>
  </div>
</div>
</body>
</html>
```

---
152. Multi-select tags input visual: chips, input inline, and dropdown panel.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="max-w-xl rounded-2xl bg-white p-3 text-sm shadow-sm ring-1 ring-slate-900/5">
  <div class="flex flex-wrap gap-2">
    <span class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-800">design <button class="text-slate-500 hover:text-slate-900" type="button">×</button></span>
    <span class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-800">tailwind <button class="text-slate-500 hover:text-slate-900" type="button">×</button></span>
    <input class="min-w-[8rem] flex-1 border-0 bg-transparent text-sm outline-none" placeholder="Add tag…" />
  </div>
  <div class="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600">Dropdown panel for suggestions (static)</div>
</div>
</body>
</html>
```

---

### Design System (153–162)

153. Define a complete brand palette in `@theme` using OKLCH and semantic names (`--color-brand-*`).

```css
@import "tailwindcss";
@theme {
  --color-brand-50: oklch(0.97 0.02 265);
  --color-brand-500: oklch(0.62 0.19 265);
  --color-brand-900: oklch(0.28 0.12 265);
}
```

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex gap-2">
  <div class="size-16 rounded-xl bg-[var(--color-brand-50)] ring-1 ring-slate-200"></div>
  <div class="size-16 rounded-xl bg-[var(--color-brand-500)] ring-1 ring-slate-200"></div>
  <div class="size-16 rounded-xl bg-[var(--color-brand-900)] ring-1 ring-slate-200"></div>
</div>
</body>
</html>
```

---
154. Build a spacing scale snippet in `@theme` and demo boxes for each step.

```css
@import "tailwindcss";
@theme {
  --spacing-scale-1: 0.25rem;
  --spacing-scale-2: 0.5rem;
  --spacing-scale-3: 1rem;
}
```

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex items-end gap-2">
  <div class="w-4 bg-indigo-500" style="height: var(--spacing-scale-1)"></div>
  <div class="w-4 bg-indigo-500" style="height: var(--spacing-scale-2)"></div>
  <div class="w-4 bg-indigo-500" style="height: var(--spacing-scale-3)"></div>
</div>
</body>
</html>
```

---
155. Typography scale in `@theme` (`--text-*`, line heights) applied to a type specimen page.

```css
@import "tailwindcss";
@theme {
  --text-body: 0.95rem;
  --text-body--line-height: 1.6;
}
```

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<p class="max-w-prose text-slate-700" style="font-size: var(--text-body); line-height: var(--text-body--line-height)">
  Typography specimen using theme variables (apply via style or map to utilities in your design system).
</p>
</body>
</html>
```

---
156. Document buttons, inputs, and cards as reusable HTML patterns using the same tokens.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex flex-wrap gap-3 text-sm">
  <button class="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white" type="button">Button</button>
  <input class="rounded-lg border border-slate-300 px-3 py-2" placeholder="Input" />
  <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">Card</div>
</div>
</body>
</html>
```

---
157. Map semantic tokens (`surface`, `muted`, `danger`) to utilities via `@theme`.

```css
@import "tailwindcss";
@theme {
  --color-surface: oklch(0.99 0.01 260);
  --color-muted: oklch(0.55 0.02 260);
  --color-danger: oklch(0.55 0.22 25);
}
```

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="space-y-2 text-sm">
  <div class="rounded-lg bg-[var(--color-surface)] p-3 text-slate-900 ring-1 ring-slate-200">Surface</div>
  <p class="text-[var(--color-muted)]">Muted copy</p>
  <p class="font-semibold text-[var(--color-danger)]">Danger text</p>
</div>
</body>
</html>
```

---
158. Build a “token gallery” page that lists swatches and labels for teaching.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<section class="grid max-w-4xl gap-4 md:grid-cols-2">
  <div class="rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">
    <h3 class="font-semibold">Colors</h3>
    <div class="mt-3 flex flex-wrap gap-2">
      <div class="size-10 rounded-lg bg-slate-900"></div>
      <div class="size-10 rounded-lg bg-indigo-600"></div>
      <div class="size-10 rounded-lg bg-emerald-500"></div>
    </div>
  </div>
  <div class="rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">
    <h3 class="font-semibold">Spacing</h3>
    <div class="mt-3 space-y-2">
      <div class="h-2 w-full rounded bg-slate-200"></div>
      <div class="h-3 w-full rounded bg-slate-200"></div>
      <div class="h-4 w-full rounded bg-slate-200"></div>
    </div>
  </div>
</section>
</body>
</html>
```

---
159. Create primary/secondary/ghost button components using only shared utility clusters.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex flex-wrap gap-2 text-sm font-semibold">
  <button class="rounded-lg bg-slate-900 px-4 py-2 text-white" type="button">Primary</button>
  <button class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900" type="button">Secondary</button>
  <button class="rounded-lg px-4 py-2 text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-50" type="button">Ghost</button>
</div>
</body>
</html>
```

---
160. Align border radii and shadows across card + modal + popover examples.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="grid gap-3 md:grid-cols-3 text-sm">
  <div class="rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-900/5">Card radius xl</div>
  <div class="rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-900/5">Modal-style surface</div>
  <div class="rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-900/5">Popover-style surface</div>
</div>
</body>
</html>
```

---
161. Build a compact and comfortable density toggle using different `gap-*` / `p-*` presets.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex flex-col gap-4 text-sm">
  <div class="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-900/5">
    <p class="font-semibold">Compact</p>
    <p class="text-xs text-slate-600">Use smaller gap/padding presets.</p>
  </div>
  <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
    <p class="font-semibold">Comfortable</p>
    <p class="text-sm text-slate-600">Roomier spacing for reading.</p>
  </div>
</div>
</body>
</html>
```

---
162. Show how CSS variables from `@theme` surface as utilities on sample components.

```css
@import "tailwindcss";
@theme {
  --color-token-accent: oklch(0.62 0.19 265);
}
```

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<button class="rounded-lg bg-[var(--color-token-accent)] px-4 py-2 text-sm font-semibold text-white" type="button">Themed button</button>
</body>
</html>
```

---

### Advanced Patterns (163–174)

163. Glassmorphism card: translucent background, blur, subtle border on a bright photo hero.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="relative overflow-hidden rounded-3xl bg-[url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=60')] bg-cover bg-center p-8 text-white">
  <div class="absolute inset-0 bg-slate-900/30"></div>
  <div class="relative max-w-md rounded-2xl border border-white/30 bg-white/15 p-5 text-sm shadow-2xl backdrop-blur-xl">
    Glassmorphism card
  </div>
</div>
</body>
</html>
```

---
164. Soft neumorphism-inspired panel using layered shadows (tasteful, not extreme).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="rounded-3xl bg-slate-200 p-8 text-sm text-slate-800 shadow-[8px_8px_16px_#c0c4cc,-8px_-8px_16px_#ffffff]">
  Soft neumorphic-inspired panel (subtle dual shadows).
</div>
</body>
</html>
```

---
165. Gradient mesh background using multiple blurred blobs in absolute layers.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="relative isolate min-h-48 overflow-hidden rounded-3xl bg-slate-950">
  <div class="absolute -left-24 -top-24 size-72 rounded-full bg-fuchsia-500/40 blur-3xl"></div>
  <div class="absolute -right-16 top-10 size-64 rounded-full bg-cyan-400/40 blur-3xl"></div>
  <div class="absolute bottom-0 left-10 size-56 rounded-full bg-indigo-500/40 blur-3xl"></div>
  <p class="relative p-6 text-sm font-medium text-white">Gradient mesh background</p>
</div>
</body>
</html>
```

---
166. Animated gradient border around a card using pseudo-element technique (CSS + utilities).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="rounded-2xl bg-linear-to-r from-indigo-500 via-fuchsia-500 to-amber-400 p-[2px]">
  <div class="rounded-[14px] bg-white p-4 text-sm text-slate-800">Animated gradient border (static frame)</div>
</div>
</body>
</html>
```

---
167. Text gradient heading using `bg-linear-to-r` with `bg-clip-text` and `text-transparent`.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<h2 class="bg-linear-to-r from-indigo-600 via-sky-500 to-emerald-500 bg-clip-text text-4xl font-black text-transparent">
  Gradient heading
</h2>
</body>
</html>
```

---
168. Parallax-like layers: background moves slower using transforms on scroll simulation (static demo OK).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="relative min-h-64 overflow-hidden rounded-2xl bg-slate-900">
  <div class="absolute inset-0 translate-y-6 scale-110 bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=60')] bg-cover bg-center opacity-60"></div>
  <div class="relative p-6 text-sm font-semibold text-white">Parallax-like layer (background scaled/translated)</div>
</div>
</body>
</html>
```

---
169. CSS-only carousel strip with overflow, snap points, and arrow buttons as links.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="flex items-center gap-3">
  <a class="rounded-full bg-white/80 px-3 py-2 text-xs font-semibold shadow ring-1 ring-slate-200" href="#s1">‹</a>
  <div id="carousel" class="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2">
    <article id="s1" class="w-56 shrink-0 snap-start rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Slide 1</article>
    <article id="s2" class="w-56 shrink-0 snap-start rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Slide 2</article>
    <article id="s3" class="w-56 shrink-0 snap-start rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Slide 3</article>
    <article id="s4" class="w-56 shrink-0 snap-start rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Slide 4</article>
  </div>
  <a class="rounded-full bg-white/80 px-3 py-2 text-xs font-semibold shadow ring-1 ring-slate-200" href="#s4">›</a>
</div>
</body>
</html>
```

---
170. Animated counter aesthetic: tabular numbers and `transition` on opacity (no real JS counter required).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<p class="text-3xl font-semibold tabular-nums tracking-tight transition-opacity duration-500 opacity-100">42,980</p>
<p class="text-xs text-slate-500">Opacity/transition demo for counter UI (pair with JS).</p>
</body>
</html>
```

---
171. Typing animation using `steps()` keyframes in custom CSS referenced by `@theme`.

```css
@import "tailwindcss";
@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}
```

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="overflow-hidden whitespace-nowrap border-r-2 border-slate-900 pr-1 text-sm font-mono animate-[typing_3s_steps(20,end)_forwards]">Typing effect placeholder…</div>
</body>
</html>
```

---
172. Skeleton placeholders for avatar, text lines, and image block.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="max-w-sm space-y-3">
  <div class="flex items-center gap-3">
    <div class="size-12 animate-pulse rounded-full bg-slate-200"></div>
    <div class="flex-1 space-y-2">
      <div class="h-3 w-2/3 animate-pulse rounded bg-slate-200"></div>
      <div class="h-3 w-1/2 animate-pulse rounded bg-slate-200"></div>
    </div>
  </div>
  <div class="h-32 animate-pulse rounded-xl bg-slate-200"></div>
</div>
</body>
</html>
```

---
173. Shimmer loading bar or card using `animate-*` and gradient background.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="h-3 w-full overflow-hidden rounded-full bg-slate-200">
  <div class="h-full w-1/3 animate-pulse bg-linear-to-r from-slate-200 via-white to-slate-200"></div>
</div>
</body>
</html>
```

---
174. Aurora / northern lights background with slow moving gradients.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="relative min-h-56 overflow-hidden rounded-3xl bg-slate-950">
  <div class="absolute inset-[-40%] animate-[spin_18s_linear_infinite] bg-[conic-gradient(from_180deg,indigo,sky,fuchsia,indigo)] opacity-70 blur-3xl"></div>
  <div class="relative p-6 text-sm font-semibold text-white">Aurora background</div>
</div>
</body>
</html>
```

---

### Performance & Optimization (175–180)

175. Show a *safe* pattern for dynamic class names (avoid string concatenation that breaks compilation).

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<!-- BAD: building class strings at runtime can miss purge. GOOD: map variants to full literals. -->
<div class="flex gap-2 text-sm" id="alert" data-tone="info">
  <span class="hidden data-[tone=info]:block data-[tone=info]:text-sky-700">Info</span>
  <span class="hidden data-[tone=error]:block data-[tone=error]:text-rose-700">Error</span>
</div>
</body>
</html>
```

---
176. Demonstrate `@source` usage in CSS to include extra content paths for class detection.

```css
@import "tailwindcss";
@source "../extra-path/**/*.html";
```

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<p class="text-sm text-slate-600">Demonstrate <code class="rounded bg-slate-100 px-1">@source</code> for extra content roots (adjust path to your repo).</p>
</body>
</html>
```

---
177. Compare `@theme` vs `@theme inline` with a short comment on when inlining helps.

```css
@import "tailwindcss";
@theme inline {
  --color-inline-token: #6366f1;
}
```

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<p class="text-sm text-slate-600">@theme inline inlines values for smaller CSS output in some setups — see Tailwind v4 docs.</p>
</body>
</html>
```

---
178. Build a component using CSS variables (`var(--custom)`) without inventing unseen utilities.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5" style="--custom: 12px; padding-left: var(--custom)">
  Uses a plain CSS variable without dynamic Tailwind class names.
</div>
</body>
</html>
```

---
179. Show conditional classes using data attributes instead of interpolated Tailwind strings.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<button class="rounded-lg bg-slate-200 px-3 py-2 text-sm data-[active=true]:bg-slate-900 data-[active=true]:text-white" data-active="true" type="button">Active</button>
<button class="rounded-lg bg-slate-200 px-3 py-2 text-sm data-[active=true]:bg-slate-900 data-[active=true]:text-white" data-active="false" type="button">Inactive</button>
</body>
</html>
```

---
180. Responsive `<img>` or `<picture>` markup with `object-cover` and sized containers.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="aspect-video w-full max-w-3xl overflow-hidden rounded-2xl bg-slate-200">
  <img class="h-full w-full object-cover" alt="Hero" loading="lazy" src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=60" />
</div>
</body>
</html>
```

---

### Accessibility (181–186)

181. Visible `focus-visible:` styles on all interactive controls in a mini form.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<form class="max-w-md space-y-3 text-sm">
  <button class="rounded-lg bg-slate-900 px-3 py-2 text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/50" type="button">Button</button>
  <a class="rounded-md text-indigo-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/40" href="#">Link</a>
</form>
</body>
</html>
```

---
182. Use `forced-colors:` adjustments for buttons and links in high-contrast mode.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<button class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm forced-colors:border-[CanvasText] forced-colors:text-[CanvasText]" type="button">High contrast</button>
</body>
</html>
```

---
183. Enhance borders for `contrast-more:` users on subtle cards.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm contrast-more:border-slate-900 contrast-more:shadow-none">
  Card with stronger border when user prefers more contrast.
</div>
</body>
</html>
```

---
184. Replace distracting motion with reduced animations under `motion-reduce:`.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="animate-bounce text-lg motion-reduce:animate-none">Bouncing (disabled if prefers-reduced-motion)</div>
</body>
</html>
```

---
185. Accessible skip link that is off-screen until `focus:` using `sr-only` and `focus:not-sr-only` patterns.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<a class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow-lg" href="#main">Skip to content</a>
<main class="p-6 text-sm" id="main">Main content</main>
</body>
</html>
```

---
186. Associate labels, inputs, `aria-invalid`, and hint text using utility-based layout.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<form class="max-w-md space-y-2 text-sm">
  <label class="font-medium text-slate-800" for="email2">Email</label>
  <input aria-describedby="e-hint" aria-invalid="true" class="w-full rounded-lg border border-red-400 px-3 py-2" id="email2" />
  <p class="text-xs text-red-600" id="e-hint">Enter a valid email.</p>
</form>
</body>
</html>
```

---

### Real-World Projects (187–200)

187. Landing page hero + features + testimonial + footer for a fictional SaaS.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="space-y-10 bg-white text-slate-900">
  <section class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 lg:flex-row lg:items-center">
    <div class="flex-1 space-y-4">
      <p class="text-xs font-semibold uppercase tracking-wide text-indigo-600">SaaS</p>
      <h1 class="text-4xl font-bold tracking-tight">Ship faster with utilities</h1>
      <p class="text-slate-600">Hero + CTA + social proof below.</p>
      <div class="flex gap-3">
        <button class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="button">Start</button>
        <button class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold" type="button">Demo</button>
      </div>
    </div>
    <div class="flex-1 rounded-3xl bg-linear-to-br from-indigo-500 to-violet-600 p-10 text-white shadow-xl">
      Product preview
    </div>
  </section>
  <section class="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3">
    <article class="rounded-2xl border border-slate-200 p-5 text-sm shadow-sm"><h3 class="font-semibold">Feature 1</h3><p class="mt-2 text-slate-600">Short copy.</p></article>
    <article class="rounded-2xl border border-slate-200 p-5 text-sm shadow-sm"><h3 class="font-semibold">Feature 2</h3><p class="mt-2 text-slate-600">Short copy.</p></article>
    <article class="rounded-2xl border border-slate-200 p-5 text-sm shadow-sm"><h3 class="font-semibold">Feature 3</h3><p class="mt-2 text-slate-600">Short copy.</p></article>
  </section>
  <section class="mx-auto max-w-6xl px-4 py-12">
    <div class="rounded-2xl bg-slate-50 p-6 text-sm text-slate-700 ring-1 ring-slate-200">Testimonial</div>
  </section>
  <footer class="border-t border-slate-200 py-8 text-center text-xs text-slate-500">Footer</footer>
</div>
</body>
</html>
```

---
188. Portfolio grid with project cards, tags, and contact strip.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="mx-auto max-w-5xl space-y-8 px-4 py-10">
  <header class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
    <div>
      <h1 class="text-3xl font-bold">Portfolio</h1>
      <p class="text-slate-600">Selected work</p>
    </div>
    <a class="text-sm font-semibold text-indigo-700" href="#">Contact</a>
  </header>
  <div class="grid gap-4 md:grid-cols-3">
    <article class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
      <div class="aspect-[4/3] bg-slate-200"></div>
      <div class="space-y-1 p-4 text-sm"><h3 class="font-semibold">Project 1</h3><p class="text-xs text-slate-500">Tag</p></div>
    </article>
    <article class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
      <div class="aspect-[4/3] bg-slate-200"></div>
      <div class="space-y-1 p-4 text-sm"><h3 class="font-semibold">Project 2</h3><p class="text-xs text-slate-500">Tag</p></div>
    </article>
    <article class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
      <div class="aspect-[4/3] bg-slate-200"></div>
      <div class="space-y-1 p-4 text-sm"><h3 class="font-semibold">Project 3</h3><p class="text-xs text-slate-500">Tag</p></div>
    </article>
    <article class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
      <div class="aspect-[4/3] bg-slate-200"></div>
      <div class="space-y-1 p-4 text-sm"><h3 class="font-semibold">Project 4</h3><p class="text-xs text-slate-500">Tag</p></div>
    </article>
    <article class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
      <div class="aspect-[4/3] bg-slate-200"></div>
      <div class="space-y-1 p-4 text-sm"><h3 class="font-semibold">Project 5</h3><p class="text-xs text-slate-500">Tag</p></div>
    </article>
    <article class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
      <div class="aspect-[4/3] bg-slate-200"></div>
      <div class="space-y-1 p-4 text-sm"><h3 class="font-semibold">Project 6</h3><p class="text-xs text-slate-500">Tag</p></div>
    </article>
  </div>
</div>
</body>
</html>
```

---
189. Blog layout: article column, sidebar with TOC and author card.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
  <article class="max-w-none space-y-3 text-base leading-relaxed text-slate-800 lg:text-lg">
    <h1 class="text-3xl font-bold tracking-tight text-slate-900">Blog post</h1>
    <p>Article column with sidebar for TOC + author. (Optional: add <code class="rounded bg-slate-100 px-1 text-sm">@plugin "@tailwindcss/typography"</code> + <code class="rounded bg-slate-100 px-1 text-sm">prose</code>.)</p>
  </article>
  <aside class="space-y-4 text-sm">
    <div class="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <p class="font-semibold">On this page</p>
      <ul class="mt-2 space-y-1 text-slate-600">
        <li>Intro</li>
        <li>Details</li>
      </ul>
    </div>
    <div class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
      <p class="font-semibold">Author</p>
      <p class="text-xs text-slate-500">Bio snippet</p>
    </div>
  </aside>
</div>
</body>
</html>
```

---
190. E-commerce product page: gallery, title, price, variants, add-to-cart area.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-2">
  <div class="space-y-3">
    <div class="aspect-square rounded-2xl bg-slate-200"></div>
    <div class="grid grid-cols-4 gap-2">
      <button class="aspect-square rounded-lg bg-slate-100 ring-1 ring-slate-200" type="button"></button>
      <button class="aspect-square rounded-lg bg-slate-100 ring-1 ring-slate-200" type="button"></button>
      <button class="aspect-square rounded-lg bg-slate-100 ring-1 ring-slate-200" type="button"></button>
      <button class="aspect-square rounded-lg bg-slate-100 ring-1 ring-slate-200" type="button"></button>
    </div>
  </div>
  <div class="space-y-4 text-sm">
    <h1 class="text-3xl font-bold">Product name</h1>
    <p class="text-2xl font-semibold text-indigo-700">$129</p>
    <div class="flex flex-wrap gap-2">
      <button class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold" type="button">S</button>
      <button class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold" type="button">M</button>
    </div>
    <button class="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white" type="button">Add to cart</button>
  </div>
</div>
</body>
</html>
```

---
191. Admin dashboard with sidebar, stats row, chart placeholders, and table.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="min-h-dvh bg-slate-100 md:grid md:grid-cols-[15rem_1fr]">
  <aside class="hidden bg-slate-950 px-4 py-6 text-sm text-slate-200 md:block">
    <p class="font-semibold">Admin</p>
    <nav class="mt-4 space-y-2">
      <a class="block rounded-lg px-2 py-1 hover:bg-white/10" href="#">Dashboard</a>
      <a class="block rounded-lg px-2 py-1 hover:bg-white/10" href="#">Users</a>
    </nav>
  </aside>
  <main class="space-y-4 p-4">
    <div class="grid gap-3 md:grid-cols-3">
      <div class="rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Stat 1</div>
      <div class="rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Stat 2</div>
      <div class="rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Stat 3</div>
    </div>
    <div class="h-40 rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">Chart placeholder</div>
    <div class="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
      <table class="min-w-full text-left text-sm"><thead><tr class="text-xs text-slate-500"><th class="px-3 py-2">User</th><th class="px-3 py-2">Role</th></tr></thead><tbody><tr><td class="px-3 py-2">Ada</td><td class="px-3 py-2">Admin</td></tr></tbody></table>
    </div>
  </main>
</div>
</body>
</html>
```

---
192. Pricing page with three tiers and FAQ accordion.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="mx-auto max-w-6xl space-y-10 px-4 py-12">
  <header class="text-center">
    <h1 class="text-4xl font-bold">Pricing</h1>
    <p class="mt-2 text-slate-600">Simple tiers</p>
  </header>
  <div class="grid gap-4 md:grid-cols-3">
    <article class="rounded-2xl border border-slate-200 p-6 text-sm">Basic</article>
    <article class="rounded-2xl border-2 border-indigo-600 p-6 text-sm shadow-lg">Popular</article>
    <article class="rounded-2xl border border-slate-200 p-6 text-sm">Enterprise</article>
  </div>
  <section class="max-w-3xl space-y-2 text-sm">
    <details class="rounded-xl bg-white p-4 ring-1 ring-slate-900/5" open><summary class="cursor-pointer font-semibold">FAQ</summary><p class="mt-2 text-slate-600">Answer</p></details>
  </section>
</div>
</body>
</html>
```

---
193. Restaurant menu with sections, dietary badges, and prices.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="mx-auto max-w-3xl space-y-6 px-4 py-10">
  <h1 class="text-3xl font-bold">Menu</h1>
  <section class="space-y-3 text-sm">
    <h2 class="text-xs font-semibold uppercase tracking-wide text-slate-500">Mains</h2>
    <div class="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
      <div>
        <p class="font-semibold">Citrus salmon</p>
        <p class="text-xs text-slate-500">Gluten-free</p>
      </div>
      <p class="font-semibold">$24</p>
    </div>
  </section>
</div>
</body>
</html>
```

---
194. Login and signup cards side by side on desktop, stacked mobile.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="mx-auto grid max-w-5xl gap-6 px-4 py-12 md:grid-cols-2">
  <form class="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 text-sm">
    <h2 class="text-lg font-semibold">Login</h2>
    <input class="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Email" type="email" />
    <input class="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Password" type="password" />
    <button class="w-full rounded-lg bg-slate-900 py-2 font-semibold text-white" type="submit">Sign in</button>
  </form>
  <form class="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 text-sm">
    <h2 class="text-lg font-semibold">Sign up</h2>
    <input class="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Name" />
    <input class="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Email" type="email" />
    <button class="w-full rounded-lg bg-indigo-600 py-2 font-semibold text-white" type="submit">Create account</button>
  </form>
</div>
</body>
</html>
```

---
195. Weather app UI: current temperature, weekly row, wind/humidity chips.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="mx-auto max-w-md space-y-4 rounded-3xl bg-slate-900 p-6 text-slate-50">
  <div class="flex items-center justify-between">
    <p class="text-sm text-slate-300">San Francisco</p>
    <p class="text-xs text-slate-400">Now</p>
  </div>
  <p class="text-5xl font-semibold">72°</p>
  <div class="flex gap-2 text-xs">
    <span class="rounded-full bg-white/10 px-3 py-1">Wind 8 mph</span>
    <span class="rounded-full bg-white/10 px-3 py-1">UV 5</span>
  </div>
  <div class="grid grid-cols-7 gap-2 text-center text-[10px] text-slate-300">
    <div><p class="font-semibold text-white">M</p><p>°</p></div>
    <div><p class="font-semibold text-white">T</p><p>°</p></div>
    <div><p class="font-semibold text-white">W</p><p>°</p></div>
    <div><p class="font-semibold text-white">T</p><p>°</p></div>
    <div><p class="font-semibold text-white">F</p><p>°</p></div>
    <div><p class="font-semibold text-white">S</p><p>°</p></div>
    <div><p class="font-semibold text-white">S</p><p>°</p></div>
  </div>
</div>
</body>
</html>
```

---
196. Social feed cards with avatar, media placeholder, actions row.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="mx-auto max-w-xl space-y-4">
  <article class="rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">
    <div class="flex items-center gap-3">
      <div class="size-10 rounded-full bg-slate-200"></div>
      <div><p class="font-semibold">User 1</p><p class="text-xs text-slate-500">2h</p></div>
    </div>
    <p class="mt-3 text-slate-700">Post body snippet…</p>
    <div class="mt-3 flex gap-4 text-xs text-slate-500"><span>Like</span><span>Comment</span><span>Share</span></div>
  </article>
  <article class="rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">
    <div class="flex items-center gap-3">
      <div class="size-10 rounded-full bg-slate-200"></div>
      <div><p class="font-semibold">User 2</p><p class="text-xs text-slate-500">2h</p></div>
    </div>
    <p class="mt-3 text-slate-700">Post body snippet…</p>
    <div class="mt-3 flex gap-4 text-xs text-slate-500"><span>Like</span><span>Comment</span><span>Share</span></div>
  </article>
  <article class="rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">
    <div class="flex items-center gap-3">
      <div class="size-10 rounded-full bg-slate-200"></div>
      <div><p class="font-semibold">User 3</p><p class="text-xs text-slate-500">2h</p></div>
    </div>
    <p class="mt-3 text-slate-700">Post body snippet…</p>
    <div class="mt-3 flex gap-4 text-xs text-slate-500"><span>Like</span><span>Comment</span><span>Share</span></div>
  </article>
</div>
</body>
</html>
```

---
197. Job listing page with filters sidebar and job cards.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[14rem_1fr]">
  <aside class="rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">
    <p class="font-semibold">Filters</p>
    <label class="mt-3 block text-xs text-slate-600"><input class="mr-2" type="checkbox" />Remote</label>
  </aside>
  <div class="space-y-3">
    <article class="rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">
      <h3 class="text-base font-semibold">Job title 1</h3>
      <p class="text-xs text-slate-500">Acme · Remote</p>
    </article>
    <article class="rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">
      <h3 class="text-base font-semibold">Job title 2</h3>
      <p class="text-xs text-slate-500">Acme · Remote</p>
    </article>
    <article class="rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">
      <h3 class="text-base font-semibold">Job title 3</h3>
      <p class="text-xs text-slate-500">Acme · Remote</p>
    </article>
    <article class="rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-900/5">
      <h3 class="text-base font-semibold">Job title 4</h3>
      <p class="text-xs text-slate-500">Acme · Remote</p>
    </article>
  </div>
</div>
</body>
</html>
```

---
198. Documentation page with sidebar nav, content column, and on-this-page anchors.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[16rem_1fr]">
  <nav class="rounded-2xl bg-white p-3 text-sm shadow-sm ring-1 ring-slate-900/5">
    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Docs</p>
    <ul class="mt-2 space-y-1 text-slate-700">
      <li><a class="hover:text-slate-900" href="#">Intro</a></li>
      <li><a class="hover:text-slate-900" href="#">Install</a></li>
    </ul>
  </nav>
  <div class="lg:grid lg:grid-cols-[minmax(0,1fr)_12rem] lg:gap-8">
    <article class="max-w-none space-y-2 text-sm leading-relaxed text-slate-800">
      <h1 class="text-2xl font-bold text-slate-900">Page</h1>
      <p>Documentation content.</p>
    </article>
    <aside class="mt-6 text-xs text-slate-500 lg:mt-0">
      <p class="font-semibold text-slate-700">On this page</p>
      <ul class="mt-2 space-y-1">
        <li><a class="hover:text-slate-900" href="#a">Section A</a></li>
      </ul>
    </aside>
  </div>
</div>
</body>
</html>
```

---
199. SaaS homepage with logo wall, feature grid, metrics, and CTA band.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="bg-slate-950 text-slate-50">
  <header class="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
    <span class="text-sm font-bold">Orbit</span>
    <nav class="hidden gap-4 text-sm text-slate-300 md:flex">
      <a class="hover:text-white" href="#">Product</a>
      <a class="hover:text-white" href="#">Customers</a>
    </nav>
  </header>
  <section class="mx-auto max-w-6xl px-4 py-16 text-center">
    <h1 class="text-4xl font-bold">SaaS homepage</h1>
    <p class="mt-3 text-slate-300">Hero + proof + CTA</p>
    <button class="mt-6 rounded-xl bg-white px-5 py-2 text-sm font-semibold text-slate-900" type="button">Get started</button>
  </section>
  <section class="mx-auto max-w-6xl px-4 pb-16">
    <p class="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Trusted by</p>
    <div class="mt-4 grid grid-cols-2 gap-4 opacity-70 md:grid-cols-4">
      <div class="rounded-xl bg-white/5 px-3 py-6 text-center text-xs">Logo 1</div>
      <div class="rounded-xl bg-white/5 px-3 py-6 text-center text-xs">Logo 2</div>
      <div class="rounded-xl bg-white/5 px-3 py-6 text-center text-xs">Logo 3</div>
      <div class="rounded-xl bg-white/5 px-3 py-6 text-center text-xs">Logo 4</div>
    </div>
  </section>
</div>
</body>
</html>
```

---
200. Mobile app frame UI: bottom tab bar, header, scrollable content cards.

```html
<!-- app.css: @import "tailwindcss"; (add @plugin lines when shown in a css block) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tailwind CSS v4</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body class="min-h-dvh bg-slate-50 p-6 text-slate-900 antialiased">
<div class="mx-auto flex min-h-dvh max-w-md flex-col rounded-[2rem] bg-slate-50 shadow-xl ring-1 ring-slate-200">
  <header class="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 text-sm font-semibold">
    <span>9:41</span>
    <span>App</span>
    <span class="text-xs text-slate-500">●●●</span>
  </header>
  <main class="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
    <article class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">Card 1</article>
    <article class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">Card 2</article>
    <article class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">Card 3</article>
    <article class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">Card 4</article>
    <article class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">Card 5</article>
  </main>
  <nav class="grid grid-cols-4 border-t border-slate-200 bg-white px-2 py-2 text-[10px] font-semibold text-slate-600">
    <button class="rounded-lg py-2 hover:bg-slate-50" type="button">Home</button>
    <button class="rounded-lg py-2 hover:bg-slate-50" type="button">Search</button>
    <button class="rounded-lg py-2 hover:bg-slate-50" type="button">Alerts</button>
    <button class="rounded-lg py-2 hover:bg-slate-50" type="button">Profile</button>
  </nav>
</div>
</body>
</html>
```

---
