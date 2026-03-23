# 02. Installation & Setup

## Method 1: Using Vite (Recommended)

The most seamless way to integrate Tailwind CSS v4 — especially with frameworks like React, Vue, Svelte, SolidJS, etc.

### Step 1: Create Your Project

```bash
npm create vite@latest my-project
cd my-project
```

### Step 2: Install Tailwind CSS

```bash
npm install tailwindcss @tailwindcss/vite
```

### Step 3: Configure the Vite Plugin

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})
```

### Step 4: Import Tailwind CSS

```css
/* src/style.css */
@import "tailwindcss";
```

> **Note:** In v4, you just write `@import "tailwindcss"` — no more `@tailwind base; @tailwind components; @tailwind utilities;`

### Step 5: Start Your Build Process

```bash
npm run dev
```

### Step 6: Start Using Tailwind in HTML

```html
<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="/src/style.css" rel="stylesheet">
</head>
<body>
  <h1 class="text-3xl font-bold underline">
    Hello world!
  </h1>
</body>
</html>
```

---

## Method 2: Using PostCSS

```bash
# Install dependencies
npm install tailwindcss @tailwindcss/postcss

# Create postcss.config.js
```

```js
// postcss.config.js
export default {
  plugins: ["@tailwindcss/postcss"],
};
```

```css
/* app.css */
@import "tailwindcss";
```

---

## Method 3: Tailwind CLI

For projects that don't use a bundler:

```bash
# Install Tailwind CSS
npm install tailwindcss @tailwindcss/cli

# Run the CLI to compile your CSS
npx @tailwindcss/cli -i src/input.css -o src/output.css --watch
```

```css
/* src/input.css */
@import "tailwindcss";
```

---

## Method 4: Play CDN (Quick Prototyping Only)

```html
<head>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
```

> ⚠️ **CDN Limitations:**
> - Cannot customize Tailwind's default theme
> - Cannot use directives like `@apply`
> - Third-party plugins cannot be installed
> - Not suitable for production

---

## Framework-Specific Guides

| Framework | Plugin | Setup |
|-----------|--------|-------|
| React (Vite) | `@tailwindcss/vite` | Use Vite plugin method above |
| Next.js | `@tailwindcss/postcss` | PostCSS method |
| Vue (Vite) | `@tailwindcss/vite` | Vite plugin method |
| Nuxt | `@tailwindcss/vite` | Vite plugin method |
| SvelteKit | `@tailwindcss/vite` | Vite plugin method |
| Laravel | `@tailwindcss/vite` | Vite plugin method |
| Angular | `@tailwindcss/postcss` | PostCSS method |
| Remix | `@tailwindcss/vite` | Vite plugin method |

---

## What Gets Imported

When you write `@import "tailwindcss"`, here's what you're actually importing:

```css
/* node_modules/tailwindcss/index.css */
@layer theme, base, components, utilities;
@import "./theme.css" layer(theme);
@import "./preflight.css" layer(base);
@import "./utilities.css" layer(utilities);
```

### The Four Layers

| Layer | Purpose |
|-------|---------|
| `theme` | Design tokens (colors, fonts, spacing, etc.) as CSS variables |
| `base` | Preflight/reset styles (normalize browser defaults) |
| `components` | Reusable component classes (from `@apply` or plugins) |
| `utilities` | All utility classes (`flex`, `text-xl`, `bg-red-500`, etc.) |

---

## VS Code Setup

### Install Tailwind CSS IntelliSense Extension

```
Extension: Tailwind CSS IntelliSense
ID: bradlc.vscode-tailwindcss
```

This provides:
- ✅ Autocomplete for utility classes
- ✅ Linting / error detection
- ✅ Hover preview showing CSS output
- ✅ Syntax highlighting for `@theme`, `@apply`, etc.

### Recommended VS Code Settings

```json
{
  "editor.quickSuggestions": {
    "strings": "on"
  },
  "tailwindCSS.includeLanguages": {
    "javascript": "javascript",
    "html": "html"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

---

## Verifying Installation

After setup, add this to your HTML to verify it's working:

```html
<h1 class="text-3xl font-bold underline text-blue-600">
  Tailwind CSS is Working! 🎉
</h1>
```

If you see a large, bold, blue, underlined heading — you're all set!
