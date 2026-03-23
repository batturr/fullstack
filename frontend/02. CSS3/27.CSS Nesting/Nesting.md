# 27. CSS Nesting

## What is CSS Nesting?

Native CSS nesting allows you to write child selectors **inside** parent selectors — similar to Sass/Less, but built into the browser:

```css
/* Without nesting */
.card { padding: 1rem; }
.card .title { font-size: 1.25rem; }
.card .title:hover { color: blue; }
.card .body { color: #666; }

/* With native nesting */
.card {
  padding: 1rem;

  .title {
    font-size: 1.25rem;

    &:hover {
      color: blue;
    }
  }

  .body {
    color: #666;
  }
}
```

---

## Syntax Rules

### The `&` (Nesting Selector)

`&` represents the parent selector:

```css
.button {
  background: blue;
  color: white;

  &:hover { background: darkblue; }
  &:focus-visible { outline: 2px solid blue; }
  &:active { background: navy; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }

  &.primary { background: #3b82f6; }
  &.secondary { background: #6b7280; }
}
```

This compiles to:
```css
.button { background: blue; color: white; }
.button:hover { background: darkblue; }
.button:focus-visible { outline: 2px solid blue; }
.button.primary { background: #3b82f6; }
```

### Nesting Without `&`

For descendant selectors, `&` is optional:

```css
.card {
  /* These are equivalent: */
  .title { font-weight: bold; }
  & .title { font-weight: bold; }
}
```

### Compound Selectors (& required)

When appending to the parent selector, `&` is required:

```css
.btn {
  &.active { }       /* .btn.active */
  &--large { }       /* .btn--large (BEM modifier) */
  &#main { }         /* .btn#main */
  &[disabled] { }    /* .btn[disabled] */
  &::before { }      /* .btn::before */
}
```

### Parent Reference After `&`

```css
.title {
  .dark-theme & {
    color: white;      /* .dark-theme .title */
  }
}
```

---

## Nesting Media Queries

```css
.card {
  padding: 1rem;
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    padding: 2rem;
    flex-direction: row;
  }

  @media (min-width: 1024px) {
    padding: 3rem;
  }
}
```

---

## Nesting @container

```css
.card-wrapper {
  container-type: inline-size;
}

.card {
  padding: 1rem;

  @container (min-width: 400px) {
    display: grid;
    grid-template-columns: 200px 1fr;
  }
}
```

---

## Nesting @layer

```css
@layer components {
  .button {
    padding: 8px 16px;

    &:hover {
      opacity: 0.9;
    }
  }
}
```

---

## Deep Nesting (Avoid)

```css
/* ❌ Too deep — hard to read and high specificity */
.page {
  .header {
    .nav {
      .list {
        .item {
          .link {
            color: blue;
          }
        }
      }
    }
  }
}

/* ✅ Keep nesting shallow (2-3 levels max) */
.nav {
  display: flex;
  gap: 1rem;

  .item {
    padding: 0.5rem;
  }

  .link {
    color: blue;
    &:hover { text-decoration: underline; }
  }
}
```

---

## Practical Examples

### BEM with Nesting

```css
.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;

  &__header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 600;
  }

  &__body {
    color: #6b7280;
    line-height: 1.6;
  }

  &__footer {
    margin-top: 1rem;
    border-top: 1px solid #e5e7eb;
    padding-top: 1rem;
  }

  &--featured {
    border: 2px solid #3b82f6;
  }
}
```

### Component with States and Variants

```css
.input {
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    border-color: #3b82f6;
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #9ca3af;
  }

  &.error {
    border-color: #ef4444;
    &:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  }

  &.success {
    border-color: #22c55e;
  }

  /* Responsive */
  @media (max-width: 768px) {
    font-size: 16px;      /* Prevent iOS zoom */
    padding: 12px 16px;
  }
}
```

---

## Browser Support

- Chrome 112+, Edge 112+, Safari 17.2+, Firefox 117+
- Full support since late 2023

```css
/* Progressive enhancement */
@supports selector(&) {
  .card {
    .title { font-weight: bold; }
  }
}
```

---

## Nesting vs Sass

| Feature | Native CSS | Sass |
|---------|-----------|------|
| `&` for parent | ✅ | ✅ |
| Deep nesting | ✅ | ✅ |
| Media queries inside | ✅ | ✅ |
| `&__element` (BEM) | ✅ | ✅ |
| Variables | CSS custom properties | `$variables` |
| Mixins | ❌ | ✅ |
| Functions | Limited | ✅ |
| Loops | ❌ | ✅ |

> Native nesting reduces the need for Sass in many projects. Consider going Sass-free if you don't need mixins, loops, or complex functions.
