# Bootstrap 5 JavaScript API & Events

## Overview
Bootstrap 5 provides a comprehensive JavaScript API for programmatic control of components. All components are built with vanilla JavaScript (no jQuery required).

## Getting the Instance

### Method 1: Get Existing Instance

```javascript
const element = document.getElementById('myModal');
const instance = bootstrap.Modal.getInstance(element);
```

### Method 2: Get or Create Instance

```javascript
const element = document.getElementById('myModal');
const instance = bootstrap.Modal.getOrCreateInstance(element);
```

## Modal API

### Initialization

```javascript
// Create instance
const myModal = new bootstrap.Modal(document.getElementById('myModal'), {
  backdrop: 'static',
  keyboard: false
});
```

### Methods

```javascript
// Show modal
myModal.show();

// Hide modal
myModal.hide();

// Toggle modal
myModal.toggle();

// Handle updates (after DOM changes)
myModal.handleUpdate();

// Destroy instance
myModal.dispose();
```

### Events

```javascript
const modalElement = document.getElementById('myModal');

// Before show
modalElement.addEventListener('show.bs.modal', function (event) {
  console.log('Modal is about to be shown');
  // event.relatedTarget = button that triggered the modal
});

// After shown
modalElement.addEventListener('shown.bs.modal', function (event) {
  console.log('Modal is now visible');
});

// Before hide
modalElement.addEventListener('hide.bs.modal', function (event) {
  console.log('Modal is about to be hidden');
  // Prevent closing
  // event.preventDefault();
});

// After hidden
modalElement.addEventListener('hidden.bs.modal', function (event) {
  console.log('Modal is now hidden');
});

// When backdrop is clicked
modalElement.addEventListener('hidePrevented.bs.modal', function (event) {
  console.log('Hide was prevented (e.g., static backdrop clicked)');
});
```

## Offcanvas API

### Initialization & Methods

```javascript
const offcanvasElement = document.getElementById('myOffcanvas');
const offcanvas = new bootstrap.Offcanvas(offcanvasElement, {
  backdrop: true,
  keyboard: true,
  scroll: false
});

offcanvas.show();
offcanvas.hide();
offcanvas.toggle();
offcanvas.dispose();
```

### Events

```javascript
offcanvasElement.addEventListener('show.bs.offcanvas', function () {});
offcanvasElement.addEventListener('shown.bs.offcanvas', function () {});
offcanvasElement.addEventListener('hide.bs.offcanvas', function () {});
offcanvasElement.addEventListener('hidden.bs.offcanvas', function () {});
offcanvasElement.addEventListener('hidePrevented.bs.offcanvas', function () {});
```

## Dropdown API

### Methods

```javascript
const dropdown = new bootstrap.Dropdown(document.getElementById('myDropdown'));

dropdown.show();
dropdown.hide();
dropdown.toggle();
dropdown.update(); // Update popper position
dropdown.dispose();
```

### Events

```javascript
const dropdownElement = document.getElementById('myDropdown');

dropdownElement.addEventListener('show.bs.dropdown', function (event) {
  // event.relatedTarget = toggle element
});

dropdownElement.addEventListener('shown.bs.dropdown', function (event) {});
dropdownElement.addEventListener('hide.bs.dropdown', function (event) {});
dropdownElement.addEventListener('hidden.bs.dropdown', function (event) {});
```

## Collapse API

### Methods

```javascript
const collapse = new bootstrap.Collapse(document.getElementById('myCollapse'), {
  toggle: false
});

collapse.show();
collapse.hide();
collapse.toggle();
collapse.dispose();
```

### Events

```javascript
const collapseElement = document.getElementById('myCollapse');

collapseElement.addEventListener('show.bs.collapse', function () {});
collapseElement.addEventListener('shown.bs.collapse', function () {});
collapseElement.addEventListener('hide.bs.collapse', function () {});
collapseElement.addEventListener('hidden.bs.collapse', function () {});
```

## Toast API

### Methods

```javascript
const toast = new bootstrap.Toast(document.getElementById('myToast'), {
  animation: true,
  autohide: true,
  delay: 5000
});

toast.show();
toast.hide();
toast.dispose();

// Check if toast is shown
const isShowing = bootstrap.Toast.getInstance(toastElement).isShown();
```

### Events

```javascript
const toastElement = document.getElementById('myToast');

toastElement.addEventListener('show.bs.toast', function () {});
toastElement.addEventListener('shown.bs.toast', function () {});
toastElement.addEventListener('hide.bs.toast', function () {});
toastElement.addEventListener('hidden.bs.toast', function () {});
```

### Toast Helper Function

```javascript
function showToast(message, type = 'info') {
  const toastHTML = `
    <div class="toast align-items-center text-bg-${type} border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;
  
  const container = document.getElementById('toastContainer');
  container.insertAdjacentHTML('beforeend', toastHTML);
  
  const toastElement = container.lastElementChild;
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
  
  // Remove from DOM after hidden
  toastElement.addEventListener('hidden.bs.toast', function () {
    toastElement.remove();
  });
}

// Usage
showToast('Operation successful!', 'success');
showToast('An error occurred!', 'danger');
```

## Tooltip API

### Initialization

```javascript
// Single tooltip
const tooltip = new bootstrap.Tooltip(document.getElementById('myElement'), {
  placement: 'top',
  trigger: 'hover',
  title: 'Tooltip text'
});

// Enable all tooltips
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(el => new bootstrap.Tooltip(el));
```

### Methods

```javascript
tooltip.show();
tooltip.hide();
tooltip.toggle();
tooltip.enable();
tooltip.disable();
tooltip.toggleEnabled();
tooltip.update(); // Update position
tooltip.dispose();
```

### Events

```javascript
element.addEventListener('show.bs.tooltip', function () {});
element.addEventListener('shown.bs.tooltip', function () {});
element.addEventListener('hide.bs.tooltip', function () {});
element.addEventListener('hidden.bs.tooltip', function () {});
element.addEventListener('inserted.bs.tooltip', function () {});
```

## Popover API

### Initialization

```javascript
const popover = new bootstrap.Popover(document.getElementById('myElement'), {
  placement: 'right',
  trigger: 'click',
  title: 'Popover Title',
  content: 'Popover content'
});

// Enable all popovers
const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
const popoverList = [...popoverTriggerList].map(el => new bootstrap.Popover(el));
```

### Methods

Same as Tooltip: `show()`, `hide()`, `toggle()`, `enable()`, `disable()`, `update()`, `dispose()`

## Carousel API

### Methods

```javascript
const carousel = new bootstrap.Carousel(document.getElementById('myCarousel'), {
  interval: 5000,
  keyboard: true,
  ride: 'carousel'
});

carousel.cycle();      // Start cycling
carousel.pause();      // Pause
carousel.prev();       // Previous slide
carousel.next();       // Next slide
carousel.nextWhenVisible(); // Next only if visible
carousel.to(2);        // Go to specific slide (0-indexed)
carousel.dispose();
```

### Events

```javascript
const carouselElement = document.getElementById('myCarousel');

carouselElement.addEventListener('slide.bs.carousel', function (event) {
  // event.from = current slide index
  // event.to = next slide index
  // event.direction = 'left' or 'right'
});

carouselElement.addEventListener('slid.bs.carousel', function (event) {
  // Slide transition completed
});
```

## Tab API

### Methods

```javascript
const tab = new bootstrap.Tab(document.getElementById('myTab'));

tab.show();
tab.dispose();
```

### Events

```javascript
const tabElement = document.getElementById('myTab');

tabElement.addEventListener('show.bs.tab', function (event) {
  // event.target = newly activated tab
  // event.relatedTarget = previous active tab
});

tabElement.addEventListener('shown.bs.tab', function (event) {});
tabElement.addEventListener('hide.bs.tab', function (event) {});
tabElement.addEventListener('hidden.bs.tab', function (event) {});
```

## Alert API

### Methods

```javascript
const alert = new bootstrap.Alert(document.getElementById('myAlert'));

alert.close();
alert.dispose();
```

### Events

```javascript
const alertElement = document.getElementById('myAlert');

alertElement.addEventListener('close.bs.alert', function () {
  console.log('Alert is about to close');
});

alertElement.addEventListener('closed.bs.alert', function () {
  console.log('Alert is closed');
});
```

## Scrollspy API

### Initialization

```javascript
const scrollSpy = new bootstrap.ScrollSpy(document.body, {
  target: '#navbar',
  offset: 100,
  method: 'auto'
});
```

### Methods

```javascript
scrollSpy.refresh(); // Refresh after DOM changes
scrollSpy.dispose();
```

### Events

```javascript
const navElement = document.getElementById('navbar');

navElement.addEventListener('activate.bs.scrollspy', function (event) {
  // event.relatedTarget = activated navigation link
});
```

## Complete Example: Dynamic Modal

```javascript
function createDynamicModal(title, body, onConfirm) {
  // Create modal HTML
  const modalHTML = `
    <div class="modal fade" id="dynamicModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">${body}</div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="confirmBtn">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add to DOM
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modalElement = document.getElementById('dynamicModal');
  
  // Create instance
  const modal = new bootstrap.Modal(modalElement);
  
  // Confirm button handler
  document.getElementById('confirmBtn').addEventListener('click', function() {
    onConfirm();
    modal.hide();
  });
  
  // Remove from DOM after hidden
  modalElement.addEventListener('hidden.bs.modal', function () {
    modalElement.remove();
  });
  
  // Show modal
  modal.show();
}

// Usage
createDynamicModal(
  'Confirm Action',
  'Are you sure you want to proceed?',
  function() {
    alert('Confirmed!');
  }
);
```

## Best Practices

1. **Dispose unused instances** to prevent memory leaks
2. **Use event delegation** for dynamic elements
3. **Check instance existence** before creating new ones
4. **Handle errors** in event listeners
5. **Clean up event listeners** when disposing
6. **Use `getOrCreateInstance`** when uncertain
7. **Prevent default** carefully in events
8. **Test accessibility** with keyboard navigation

## Browser Compatibility

✅ All modern browsers  
✅ No jQuery required  
⚠️ No IE 11 support
