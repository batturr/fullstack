# 23. Optimizing for Production

## How Tailwind v4 Handles Unused CSS

Tailwind v4 **automatically** scans your template files and generates only the CSS for utilities you actually use. No manual purge configuration needed!

### Automatic Content Detection

v4 scans your project directory for template files:
- `.html`, `.js`, `.jsx`, `.ts`, `.tsx`, `.vue`, `.svelte`, `.astro`
- Ignores `node_modules`, `.git`, hidden directories

### Custom Source Paths

If templates are outside the default detection:

```css
@import "tailwindcss";

/* Add additional paths */
@source "../shared-components/**/*.tsx";
@source "../content/**/*.md";
```

### Restricting Sources

```css
@import "tailwindcss" source(none);

/* Only scan these specific paths */
@source "./src/**/*.{html,jsx,tsx}";
```

---

## Build Output Size

### Typical Output Sizes

| Scenario | Uncompressed | Gzipped | Brotli |
|----------|-------------|---------|--------|
| Small project (~50 utilities) | ~5 KB | ~2 KB | ~1.5 KB |
| Medium project (~200 utilities) | ~15 KB | ~4 KB | ~3 KB |
| Large project (~500+ utilities) | ~30 KB | ~8 KB | ~6 KB |
| Full Tailwind (development) | ~4+ MB | ~350 KB | ~70 KB |

> Production builds are **tiny** because only used utilities are included.

---

## Dynamic Class Safety

### The Problem

Tailwind scans files as **plain text** — it doesn't execute JavaScript. Dynamic classes may not be detected:

```jsx
// ❌ These WON'T be detected:
const color = 'blue';
<div className={`text-${color}-500`}>...</div>

<div className={isActive ? 'bg-green-500' : 'bg-red-500'}>...</div>
// ↑ This one actually WORKS because "bg-green-500" and "bg-red-500"
//   appear as complete strings in the file.
```

### The Rules

```jsx
// ✅ Always use complete class names as strings:
<div className={isActive ? 'bg-green-500' : 'bg-red-500'}>...</div>

// ✅ Use a mapping object:
const colorMap = {
  success: 'bg-green-500 text-green-900',
  error: 'bg-red-500 text-red-900',
  warning: 'bg-yellow-500 text-yellow-900',
};
<div className={colorMap[status]}>...</div>

// ❌ Never construct class names dynamically:
<div className={`bg-${color}-500`}>...</div>
<div className={'bg-' + color + '-500'}>...</div>
```

---

## Safelist (Force-Include Classes)

For truly dynamic classes (e.g., from a CMS or API):

```css
@import "tailwindcss";

/* Force these utilities to always be included */
@source inline("
  bg-red-500 bg-green-500 bg-blue-500 bg-yellow-500
  text-red-500 text-green-500 text-blue-500 text-yellow-500
");
```

---

## Performance Tips

### 1. Use the Vite Plugin (Fastest)

```js
// vite.config.js
import tailwindcss from '@tailwindcss/vite';

export default {
  plugins: [tailwindcss()],
};
```

The Vite plugin is faster than PostCSS because it integrates directly into Vite's build pipeline.

### 2. Minimize @import Usage

```css
/* ✅ One import */
@import "tailwindcss";

/* ❌ Avoid many CSS @import chains */
@import "./reset.css";
@import "./fonts.css";
@import "./animations.css";
/* Each import is a network request in development */
```

### 3. Avoid Large Safelists

```css
/* ❌ Don't safelist hundreds of classes */
@source inline("
  bg-red-50 bg-red-100 bg-red-200 ...every shade of every color
");

/* ✅ Only safelist what you actually need dynamically */
@source inline("bg-red-500 bg-green-500 bg-blue-500");
```

### 4. Use `content-visibility: auto` for Long Pages

```html
<section class="content-auto">
  Heavy section that can be lazily rendered
</section>
```

(Tailwind v4 doesn't have this utility by default — add it yourself.)

---

## CSS Layers & Specificity

Tailwind v4 uses native CSS `@layer`:

```css
@layer theme, base, components, utilities;
```

Utilities **always** win over components because of layer ordering. This means:

```html
<!-- ✅ Inline utility overrides the component class -->
<button class="btn-primary bg-red-500">
  This will be red, not the btn-primary color
</button>
```

---

## Caching Strategy

### Cache Headers for CSS

```nginx
# nginx
location ~* \.css$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Content Hash in Filename

Most build tools (Vite, Webpack) add content hashes automatically:
```
styles.a3b2c1d4.css  ← changes hash when CSS changes
```

---

## Debugging Tips

### 1. Check What CSS is Generated

```bash
# Build and inspect output
npx @tailwindcss/cli -i input.css -o output.css
wc -c output.css   # Check file size
```

### 2. Find Unused Classes in HTML

The Tailwind IntelliSense VS Code extension highlights unknown classes.

### 3. Inspect with DevTools

Browser DevTools → Elements → Computed Styles shows which Tailwind utilities are applied and any that are being overridden.

### 4. Use `@apply` Sparingly

Every `@apply` generates additional CSS. Prefer component frameworks (React, Vue) for reusability.

---

## Production Checklist

- [ ] Using Vite plugin or PostCSS (not CDN)
- [ ] All class names are complete strings (no dynamic construction)
- [ ] No unnecessary safelist entries
- [ ] CSS is minified (automatic in production builds)
- [ ] Gzip/Brotli compression enabled on server
- [ ] Cache headers set for static CSS
- [ ] No unused `@import` statements
- [ ] Test dark mode and responsive at all breakpoints
- [ ] Remove any development-only classes
- [ ] Check total CSS bundle size (should be < 30KB gzipped)
