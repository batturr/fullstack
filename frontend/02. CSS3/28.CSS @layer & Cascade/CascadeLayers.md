# 28. CSS @layer & Cascade Control

## The Cascade Problem

In large projects, specificity wars are common — authors use `!important` or overly specific selectors to override styles. CSS Cascade Layers (`@layer`) solve this by giving you **explicit control** over which styles override which.

---

## @layer

Define named cascade layers with explicit priority order:

```css
/* Declare layer order (first = lowest priority) */
@layer reset, base, components, utilities;

/* Add styles to layers */
@layer reset {
  * { margin: 0; padding: 0; box-sizing: border-box; }
}

@layer base {
  body { font-family: system-ui; line-height: 1.5; color: #333; }
  a { color: #3b82f6; }
}

@layer components {
  .btn { padding: 8px 16px; border-radius: 8px; }
  .card { padding: 1.5rem; border-radius: 12px; }
}

@layer utilities {
  .text-center { text-align: center; }
  .hidden { display: none; }
}
```

### Layer Priority

```
Lowest priority → Highest priority

@layer reset
@layer base
@layer components
@layer utilities
Unlayered styles         ← Highest priority (not in any layer)
```

- Later-declared layers **override** earlier ones
- **Unlayered** styles always beat layered styles (regardless of specificity!)
- Within the same layer, normal specificity rules apply

---

## Why Layers Matter

### Without Layers (Specificity Fights)

```css
/* Framework CSS: high specificity */
.nav .item .link { color: blue; }

/* Your override: needs even higher specificity */
.nav .item .link { color: red; }   /* Same specificity — relies on source order */
#nav .item .link { color: red; }    /* Hack: use ID for higher specificity */
.link { color: red !important; }    /* Nuclear option */
```

### With Layers (Clean Override)

```css
@layer framework, custom;

@layer framework {
  .nav .item .link { color: blue; }   /* High specificity, but low layer */
}

@layer custom {
  .link { color: red; }   /* Low specificity, but higher layer — WINS! */
}
```

---

## Importing CSS into Layers

```css
/* Import third-party CSS into a layer */
@import url("bootstrap.css") layer(framework);
@import url("reset.css") layer(reset);

/* Your styles in a higher layer */
@layer custom {
  /* These override bootstrap regardless of specificity */
}
```

### Layer with `<link>`

```html
<!-- Not yet widely supported in HTML, but coming -->
<link rel="stylesheet" href="framework.css" layer="framework">
```

---

## Anonymous Layers

```css
@layer {
  /* Anonymous layer — can't be referenced by name */
  .temp-style { color: red; }
}
```

---

## Nested Layers

```css
@layer components {
  @layer buttons {
    .btn { padding: 8px 16px; }
  }
  
  @layer cards {
    .card { padding: 1.5rem; }
  }
}

/* Reference nested layer */
@layer components.buttons {
  .btn { border-radius: 8px; }
}
```

---

## Specificity Refresher

| Selector | Specificity (A, B, C) |
|----------|----------------------|
| `*` | 0, 0, 0 |
| `p` | 0, 0, 1 |
| `.class` | 0, 1, 0 |
| `#id` | 1, 0, 0 |
| `[attr]` | 0, 1, 0 |
| `:hover` | 0, 1, 0 |
| `::before` | 0, 0, 1 |
| `style=""` | Inline (wins over all) |
| `!important` | Reverses cascade |

### :where() — Zero Specificity

```css
/* :where() has 0 specificity — easy to override */
:where(.card, .panel, .box) {
  padding: 1rem;
  border-radius: 8px;
}

/* Any simple selector overrides it */
.card { padding: 2rem; }      /* Wins! */
```

### :is() — Takes Highest Specificity

```css
:is(.card, #header) p { color: blue; }
/* Specificity = (1, 0, 1) because #header is the most specific argument */
```

---

## @scope

Limit styles to a specific **DOM subtree**:

```css
@scope (.card) {
  /* Only applies inside .card elements */
  .title { font-weight: bold; }
  .body { color: #666; }
  
  /* Can set a lower boundary */
  @scope (.card) to (.card-footer) {
    /* Applies inside .card but NOT inside .card-footer */
    p { line-height: 1.6; }
  }
}
```

> `@scope` is supported in Chrome 118+ and Edge 118+.

---

## !important with Layers

`!important` **reverses** the layer order:

```css
@layer base, components;

@layer base {
  .text { color: red !important; }    /* In lower layer, but !important */
}

@layer components {
  .text { color: blue !important; }   /* In higher layer, but loses to lower layer's !important */
}

/* Result: color is RED because !important reverses layer priority! */
```

| Normal styles | !important styles |
|---------------|-------------------|
| Later layers win | Earlier layers win |
| Unlayered wins | Unlayered loses to layered |

> This is why `!important` in layers is tricky. Best practice: avoid `!important` entirely.

---

## Architecture Pattern

```css
/* 1. Define layer order upfront */
@layer reset, tokens, base, layout, components, patterns, utilities, overrides;

/* 2. Reset */
@layer reset {
  *, *::before, *::after { box-sizing: border-box; margin: 0; }
}

/* 3. Design tokens */
@layer tokens {
  :root {
    --color-primary: #3b82f6;
    --radius-md: 8px;
    --space-4: 1rem;
  }
}

/* 4. Base / typography */
@layer base {
  body { font-family: system-ui; line-height: 1.5; }
  h1, h2, h3 { line-height: 1.2; }
}

/* 5. Layout */
@layer layout {
  .container { max-width: 1200px; margin: 0 auto; }
  .grid { display: grid; gap: var(--space-4); }
}

/* 6. Components */
@layer components {
  .btn { /* ... */ }
  .card { /* ... */ }
}

/* 7. Utilities (highest layered priority) */
@layer utilities {
  .hidden { display: none; }
  .text-center { text-align: center; }
}
```

---

## Browser Support

- `@layer`: Chrome 99+, Firefox 97+, Safari 15.4+, Edge 99+
- `@scope`: Chrome 118+, Edge 118+ (Firefox behind flag)
