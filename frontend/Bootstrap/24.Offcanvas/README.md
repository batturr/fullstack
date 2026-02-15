# Offcanvas Component (New in Bootstrap 5)

## Overview
Offcanvas is a sidebar component that can be toggled to appear from the edge of the viewport. It's perfect for navigation menus, shopping carts, filters, and more.

## Key Features
- ✅ Slides from top, bottom, left, or right
- ✅ Backdrop with optional closing
- ✅ Keyboard support (ESC to close)
- ✅ Scrollable content
- ✅ Responsive placement

## Basic Syntax

```html
<!-- Trigger Button -->
<button class="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample">
  Open Offcanvas
</button>

<!-- Offcanvas -->
<div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasExample">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title">Offcanvas Title</h5>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
  </div>
  <div class="offcanvas-body">
    Content goes here...
  </div>
</div>
```

## Placement Options

### Left Side (Default)
```html
<div class="offcanvas offcanvas-start" id="offcanvasLeft">
  <!-- Content -->
</div>
```

### Right Side
```html
<div class="offcanvas offcanvas-end" id="offcanvasRight">
  <!-- Content -->
</div>
```

### Top
```html
<div class="offcanvas offcanvas-top" id="offcanvasTop">
  <!-- Content -->
</div>
```

### Bottom
```html
<div class="offcanvas offcanvas-bottom" id="offcanvasBottom">
  <!-- Content -->
</div>
```

## Offcanvas Options

### With Backdrop (Default)
Default behavior includes a backdrop that closes offcanvas when clicked.

### Without Backdrop
```html
<div class="offcanvas offcanvas-start" data-bs-backdrop="false" id="offcanvasWithoutBackdrop">
  <!-- Content -->
</div>
```

### Static Backdrop
Backdrop doesn't close offcanvas when clicked:
```html
<div class="offcanvas offcanvas-start" data-bs-backdrop="static" id="offcanvasStatic">
  <!-- Content -->
</div>
```

### Enable Body Scrolling
```html
<div class="offcanvas offcanvas-start" data-bs-scroll="true" id="offcanvasScrolling">
  <!-- Content -->
</div>
```

### Both Scrolling and Backdrop
```html
<div class="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" id="offcanvasBoth">
  <!-- Content -->
</div>
```

## JavaScript API

### Initialize
```javascript
// Via JavaScript
const myOffcanvas = new bootstrap.Offcanvas(document.getElementById('myOffcanvas'));

// Show
myOffcanvas.show();

// Hide
myOffcanvas.hide();

// Toggle
myOffcanvas.toggle();
```

### Options
```javascript
const myOffcanvas = new bootstrap.Offcanvas(element, {
  backdrop: true,      // true, false, 'static'
  keyboard: true,      // Close with ESC key
  scroll: false        // Allow body scroll
});
```

### Events
```javascript
const offcanvasElement = document.getElementById('myOffcanvas');

// Before show
offcanvasElement.addEventListener('show.bs.offcanvas', function () {
  console.log('Offcanvas is about to be shown');
});

// After shown
offcanvasElement.addEventListener('shown.bs.offcanvas', function () {
  console.log('Offcanvas is fully visible');
});

// Before hide
offcanvasElement.addEventListener('hide.bs.offcanvas', function () {
  console.log('Offcanvas is about to be hidden');
});

// After hidden
offcanvasElement.addEventListener('hidden.bs.offcanvas', function () {
  console.log('Offcanvas is fully hidden');
});
```

## Responsive Offcanvas

Show offcanvas on specific breakpoints:

```html
<!-- Show offcanvas on screens smaller than lg -->
<div class="offcanvas-lg offcanvas-end" id="offcanvasResponsive">
  <div class="offcanvas-header">
    <h5>Responsive Offcanvas</h5>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#offcanvasResponsive"></button>
  </div>
  <div class="offcanvas-body">
    <p>This is content that resizes based on viewport</p>
  </div>
</div>
```

Available responsive classes:
- `offcanvas-sm` - Show on screens < 576px
- `offcanvas-md` - Show on screens < 768px
- `offcanvas-lg` - Show on screens < 992px
- `offcanvas-xl` - Show on screens < 1200px
- `offcanvas-xxl` - Show on screens < 1400px

## Dark Mode Support

```html
<div class="offcanvas offcanvas-start" data-bs-theme="dark" id="offcanvasDark">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title text-white">Dark Offcanvas</h5>
    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
  </div>
  <div class="offcanvas-body">
    <p class="text-white">Content with dark theme</p>
  </div>
</div>
```

## Best Practices

1. **Accessibility**: Always include `tabindex="-1"` and proper ARIA labels
2. **Close Button**: Always provide a way to close the offcanvas
3. **Keyboard Support**: Enable keyboard navigation (ESC key)
4. **Mobile First**: Use responsive classes for better mobile experience
5. **Performance**: Clean up event listeners when not needed
6. **Content**: Keep offcanvas content concise and scrollable

## Browser Compatibility

✅ All modern browsers  
✅ Mobile browsers  
⚠️ No IE 11 support
