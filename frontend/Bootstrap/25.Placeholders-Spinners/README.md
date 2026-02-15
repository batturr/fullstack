# Placeholders & Spinners (Loading States)

## Overview
Bootstrap 5 provides two main ways to indicate loading states:
- **Placeholders**: Content placeholders for skeleton screens
- **Spinners**: Animated loading indicators

## Placeholders (New in Bootstrap 5.1+)

Placeholders create skeleton screens while content is loading, improving perceived performance.

### Basic Placeholder

```html
<p class="placeholder-glow">
  <span class="placeholder col-12"></span>
</p>

<p class="placeholder-wave">
  <span class="placeholder col-6"></span>
</p>
```

### Width Sizing
Use column classes or width utilities:

```html
<span class="placeholder col-6"></span>
<span class="placeholder col-8"></span>
<span class="placeholder col-12"></span>

<!-- Or use width utilities -->
<span class="placeholder w-75"></span>
<span class="placeholder w-50"></span>
<span class="placeholder w-25"></span>
```

### Animation Types

**Glow Animation** (pulse effect):
```html
<p class="placeholder-glow">
  <span class="placeholder col-12"></span>
</p>
```

**Wave Animation** (shimmer effect):
```html
<p class="placeholder-wave">
  <span class="placeholder col-12"></span>
</p>
```

### Colors
```html
<span class="placeholder col-12"></span>
<span class="placeholder col-12 bg-primary"></span>
<span class="placeholder col-12 bg-secondary"></span>
<span class="placeholder col-12 bg-success"></span>
<span class="placeholder col-12 bg-danger"></span>
<span class="placeholder col-12 bg-warning"></span>
<span class="placeholder col-12 bg-info"></span>
<span class="placeholder col-12 bg-light"></span>
<span class="placeholder col-12 bg-dark"></span>
```

### Sizing
```html
<span class="placeholder col-12 placeholder-lg"></span>
<span class="placeholder col-12"></span>
<span class="placeholder col-12 placeholder-sm"></span>
<span class="placeholder col-12 placeholder-xs"></span>
```

### Card with Placeholder

```html
<div class="card">
  <img src="..." class="card-img-top" alt="...">
  
  <div class="card-body">
    <h5 class="card-title placeholder-glow">
      <span class="placeholder col-6"></span>
    </h5>
    <p class="card-text placeholder-glow">
      <span class="placeholder col-7"></span>
      <span class="placeholder col-4"></span>
      <span class="placeholder col-4"></span>
      <span class="placeholder col-6"></span>
      <span class="placeholder col-8"></span>
    </p>
    <a class="btn btn-primary disabled placeholder col-6"></a>
  </div>
</div>
```

## Spinners

### Border Spinner (Default)

```html
<div class="spinner-border" role="status">
  <span class="visually-hidden">Loading...</span>
</div>
```

### Growing Spinner

```html
<div class="spinner-grow" role="status">
  <span class="visually-hidden">Loading...</span>
</div>
```

### Colors

```html
<!-- Border Spinners -->
<div class="spinner-border text-primary" role="status"></div>
<div class="spinner-border text-secondary" role="status"></div>
<div class="spinner-border text-success" role="status"></div>
<div class="spinner-border text-danger" role="status"></div>
<div class="spinner-border text-warning" role="status"></div>
<div class="spinner-border text-info" role="status"></div>
<div class="spinner-border text-light" role="status"></div>
<div class="spinner-border text-dark" role="status"></div>

<!-- Growing Spinners -->
<div class="spinner-grow text-primary" role="status"></div>
<div class="spinner-grow text-secondary" role="status"></div>
<!-- etc. -->
```

### Sizes

**Small Spinners**:
```html
<div class="spinner-border spinner-border-sm" role="status"></div>
<div class="spinner-grow spinner-grow-sm" role="status"></div>
```

**Custom Sizes** (using inline styles):
```html
<div class="spinner-border" style="width: 3rem; height: 3rem;" role="status"></div>
<div class="spinner-grow" style="width: 3rem; height: 3rem;" role="status"></div>
```

### Alignment

**Center**:
```html
<div class="d-flex justify-content-center">
  <div class="spinner-border" role="status"></div>
</div>
```

**With Text**:
```html
<div class="d-flex align-items-center">
  <strong>Loading...</strong>
  <div class="spinner-border ms-auto" role="status"></div>
</div>
```

**Floats**:
```html
<div class="clearfix">
  <div class="spinner-border float-end" role="status"></div>
</div>
```

**Text Align**:
```html
<div class="text-center">
  <div class="spinner-border" role="status"></div>
</div>
```

### Buttons with Spinners

```html
<!-- Button with spinner -->
<button class="btn btn-primary" type="button" disabled>
  <span class="spinner-border spinner-border-sm" role="status"></span>
  <span class="visually-hidden">Loading...</span>
</button>

<!-- Button with spinner and text -->
<button class="btn btn-primary" type="button" disabled>
  <span class="spinner-border spinner-border-sm" role="status"></span>
  Loading...
</button>

<!-- Growing spinner -->
<button class="btn btn-primary" type="button" disabled>
  <span class="spinner-grow spinner-grow-sm" role="status"></span>
  Loading...
</button>
```

## JavaScript Integration

### Show/Hide Spinner

```javascript
function showSpinner(elementId) {
  document.getElementById(elementId).classList.remove('d-none');
}

function hideSpinner(elementId) {
  document.getElementById(elementId).classList.add('d-none');
}

// Usage
showSpinner('mySpinner');
setTimeout(() => hideSpinner('mySpinner'), 2000);
```

### Replace Content with Placeholder

```javascript
function showPlaceholder(elementId) {
  const element = document.getElementById(elementId);
  element.dataset.originalContent = element.innerHTML;
  element.innerHTML = '<span class="placeholder col-12"></span>';
  element.classList.add('placeholder-glow');
}

function hidePlaceholder(elementId) {
  const element = document.getElementById(elementId);
  element.innerHTML = element.dataset.originalContent;
  element.classList.remove('placeholder-glow');
}
```

### Loading Button State

```javascript
function setButtonLoading(buttonId, loading) {
  const button = document.getElementById(buttonId);
  
  if (loading) {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText;
  }
}

// Usage
setButtonLoading('submitBtn', true);
// ... perform async operation
setButtonLoading('submitBtn', false);
```

## Real-World Examples

### Fetch Data with Loading State

```javascript
async function loadData() {
  const container = document.getElementById('dataContainer');
  
  // Show placeholder
  container.innerHTML = `
    <div class="placeholder-glow">
      <span class="placeholder col-12 mb-2"></span>
      <span class="placeholder col-10 mb-2"></span>
      <span class="placeholder col-8"></span>
    </div>
  `;
  
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    
    // Show actual content
    container.innerHTML = `<p>${data.content}</p>`;
  } catch (error) {
    container.innerHTML = '<div class="alert alert-danger">Error loading data</div>';
  }
}
```

### Infinite Scroll Loader

```javascript
<div class="text-center my-4 d-none" id="infiniteLoader">
  <div class="spinner-border text-primary" role="status">
    <span class="visually-hidden">Loading more...</span>
  </div>
</div>
```

## Accessibility

Always include `role="status"` and visually hidden text:

```html
<div class="spinner-border" role="status">
  <span class="visually-hidden">Loading...</span>
</div>
```

For placeholders, ensure the loading state is announced to screen readers:

```html
<div aria-busy="true" aria-live="polite">
  <span class="placeholder col-12"></span>
</div>
```

## Best Practices

1. **Choose Appropriately**: Use placeholders for skeleton screens, spinners for active loading
2. **Accessibility**: Always include proper ARIA attributes and visually hidden text
3. **User Feedback**: Provide clear indication of what's being loaded
4. **Timeout Handling**: Show error messages if loading takes too long
5. **Progressive Enhancement**: Show spinners immediately, placeholders for longer waits
6. **Consistency**: Use similar loading patterns throughout your application

## Browser Support

✅ All modern browsers  
✅ Placeholders supported in Bootstrap 5.1+  
⚠️ No IE 11 support
