# Events in JavaScript

## Overview
Events are actions or occurrences that happen in the browser that JavaScript can detect and respond to. Event handling is crucial for creating interactive web applications.

## Purpose
- Respond to user interactions
- Handle form submissions
- Detect page lifecycle events
- Create interactive user interfaces
- Implement custom application logic

## Event Types

### Mouse Events
- `click` - Element is clicked
- `dblclick` - Element is double-clicked
- `mousedown` - Mouse button is pressed
- `mouseup` - Mouse button is released
- `mousemove` - Mouse is moved over element
- `mouseenter` - Mouse enters element
- `mouseleave` - Mouse leaves element
- `mouseover` - Mouse moves over element or its children
- `mouseout` - Mouse moves out of element or its children
- `contextmenu` - Right-click menu

### Keyboard Events
- `keydown` - Key is pressed
- `keyup` - Key is released
- `keypress` - Key is pressed (deprecated)

### Form Events
- `submit` - Form is submitted
- `change` - Input value changes
- `input` - Input value changes (real-time)
- `focus` - Element gains focus
- `blur` - Element loses focus
- `select` - Text is selected

### Document/Window Events
- `load` - Page/resource fully loaded
- `DOMContentLoaded` - DOM is ready
- `resize` - Window is resized
- `scroll` - Element is scrolled
- `unload` - Page is unloading
- `beforeunload` - Before page unloads

### Other Events
- `drag`, `dragstart`, `dragend` - Drag events
- `drop` - Element is dropped
- `copy`, `cut`, `paste` - Clipboard events
- `error` - Error occurs
- `abort` - Loading is aborted

## Adding Event Listeners

### addEventListener()
```javascript
element.addEventListener('click', function(event) {
    console.log('Element clicked!');
});

// With arrow function
element.addEventListener('click', (event) => {
    console.log('Element clicked!');
});

// With named function
function handleClick(event) {
    console.log('Element clicked!');
}
element.addEventListener('click', handleClick);
```

### Options
```javascript
element.addEventListener('click', handler, {
    once: true,      // Execute only once
    passive: true,   // Won't call preventDefault()
    capture: false   // Use capture phase
});
```

### Inline HTML (Not Recommended)
```html
<button onclick="handleClick()">Click me</button>
```

### DOM Property (Not Recommended)
```javascript
element.onclick = function() {
    console.log('Clicked');
};
```

## Removing Event Listeners

```javascript
function handleClick() {
    console.log('Clicked');
}

// Add listener
element.addEventListener('click', handleClick);

// Remove listener
element.removeEventListener('click', handleClick);
```

Note: Anonymous functions cannot be removed:
```javascript
// Cannot be removed
element.addEventListener('click', () => {
    console.log('Cannot remove this');
});
```

## Event Object

```javascript
element.addEventListener('click', (event) => {
    // Event properties
    console.log(event.type);          // 'click'
    console.log(event.target);        // Element that triggered event
    console.log(event.currentTarget); // Element with listener
    console.log(event.clientX);       // Mouse X coordinate
    console.log(event.clientY);       // Mouse Y coordinate
    console.log(event.key);           // Key pressed (keyboard events)
    console.log(event.timeStamp);     // Time when event occurred
    
    // Event methods
    event.preventDefault();  // Prevent default action
    event.stopPropagation(); // Stop event bubbling
    event.stopImmediatePropagation(); // Stop other listeners
});
```

## Event Bubbling and Capturing

### Bubbling (Default)
Events bubble up from target to root:
```javascript
document.body.addEventListener('click', () => {
    console.log('Body clicked');
});

document.querySelector('#child').addEventListener('click', () => {
    console.log('Child clicked'); // Fires first
});
```

### Capturing
Events capture down from root to target:
```javascript
element.addEventListener('click', handler, true); // Capture phase
element.addEventListener('click', handler, { capture: true });
```

### Stop Propagation
```javascript
element.addEventListener('click', (e) => {
    e.stopPropagation(); // Stop bubbling/capturing
});
```

## Event Delegation

Handle events for multiple elements with single listener:

```javascript
// Instead of adding listener to each item
document.querySelector('#list').addEventListener('click', (e) => {
    if (e.target.matches('.list-item')) {
        console.log('Item clicked:', e.target.textContent);
    }
});
```

## preventDefault()

Prevent default browser behavior:

```javascript
// Prevent form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Handle form with JavaScript
});

// Prevent link navigation
link.addEventListener('click', (e) => {
    e.preventDefault();
    // Custom navigation logic
});

// Prevent context menu
element.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    // Show custom menu
});
```

## Common Event Patterns

### Debouncing
Limit how often a function is called:
```javascript
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Usage
const handleSearch = debounce((e) => {
    console.log('Searching:', e.target.value);
}, 300);

input.addEventListener('input', handleSearch);
```

### Throttling
Ensure function is called at most once per time period:
```javascript
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Usage
const handleScroll = throttle(() => {
    console.log('Scrolled');
}, 200);

window.addEventListener('scroll', handleScroll);
```

## Real-Time Examples

### Example 1: Form Validation
```javascript
class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.errors = {};
        this.attachEvents();
    }
    
    attachEvents() {
        // Validate on submit
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (this.validate()) {
                console.log('Form is valid');
                this.submit();
            } else {
                this.showErrors();
            }
        });
        
        // Real-time validation
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                if (this.errors[input.name]) {
                    this.validateField(input);
                }
            });
        });
    }
    
    validateField(input) {
        const name = input.name;
        const value = input.value.trim();
        
        // Remove previous error
        delete this.errors[name];
        
        if (input.required && !value) {
            this.errors[name] = `${name} is required`;
        } else if (input.type === 'email' && !this.isValidEmail(value)) {
            this.errors[name] = 'Invalid email format';
        } else if (input.minLength && value.length < input.minLength) {
            this.errors[name] = `Minimum ${input.minLength} characters`;
        }
        
        this.updateFieldError(input);
    }
    
    validate() {
        this.errors = {};
        const inputs = this.form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            this.validateField(input);
        });
        
        return Object.keys(this.errors).length === 0;
    }
    
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    updateFieldError(input) {
        const errorEl = input.nextElementSibling;
        
        if (this.errors[input.name]) {
            if (errorEl?.classList.contains('error')) {
                errorEl.textContent = this.errors[input.name];
            } else {
                const error = document.createElement('span');
                error.className = 'error';
                error.textContent = this.errors[input.name];
                input.after(error);
            }
            input.classList.add('invalid');
        } else {
            if (errorEl?.classList.contains('error')) {
                errorEl.remove();
            }
            input.classList.remove('invalid');
        }
    }
    
    showErrors() {
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => this.updateFieldError(input));
    }
    
    submit() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        console.log('Submitting:', data);
    }
}
```

### Example 2: Drag and Drop
```javascript
class DragDrop {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.draggedElement = null;
        this.attachEvents();
    }
    
    attachEvents() {
        // Draggable items
        const items = this.container.querySelectorAll('[draggable="true"]');
        
        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                this.draggedElement = item;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', item.innerHTML);
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                this.draggedElement = null;
            });
        });
        
        // Drop zones
        const zones = this.container.querySelectorAll('.drop-zone');
        
        zones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });
            
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                
                if (this.draggedElement) {
                    zone.appendChild(this.draggedElement);
                }
            });
        });
    }
}
```

### Example 3: Keyboard Shortcuts
```javascript
class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        this.attachEvents();
    }
    
    register(keys, callback, description = '') {
        const key = this.normalizeKeys(keys);
        this.shortcuts.set(key, { callback, description });
    }
    
    normalizeKeys(keys) {
        return keys.toLowerCase().split('+').sort().join('+');
    }
    
    attachEvents() {
        document.addEventListener('keydown', (e) => {
            const keys = [];
            
            if (e.ctrlKey) keys.push('ctrl');
            if (e.altKey) keys.push('alt');
            if (e.shiftKey) keys.push('shift');
            if (e.metaKey) keys.push('meta');
            
            const key = e.key.toLowerCase();
            if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
                keys.push(key);
            }
            
            const shortcut = keys.sort().join('+');
            const action = this.shortcuts.get(shortcut);
            
            if (action) {
                e.preventDefault();
                action.callback(e);
            }
        });
    }
    
    getShortcuts() {
        const shortcuts = [];
        this.shortcuts.forEach((value, key) => {
            shortcuts.push({
                keys: key,
                description: value.description
            });
        });
        return shortcuts;
    }
}

// Usage
const shortcuts = new KeyboardShortcuts();
shortcuts.register('ctrl+s', () => console.log('Save'), 'Save document');
shortcuts.register('ctrl+shift+p', () => console.log('Command palette'), 'Open command palette');
```

### Example 4: Infinite Scroll
```javascript
class InfiniteScroll {
    constructor(containerId, loadMoreFn) {
        this.container = document.getElementById(containerId);
        this.loadMoreFn = loadMoreFn;
        this.loading = false;
        this.page = 1;
        this.attachEvents();
    }
    
    attachEvents() {
        window.addEventListener('scroll', throttle(() => {
            if (this.shouldLoadMore()) {
                this.loadMore();
            }
        }, 200));
    }
    
    shouldLoadMore() {
        if (this.loading) return false;
        
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        return scrollTop + windowHeight >= documentHeight - 500;
    }
    
    async loadMore() {
        this.loading = true;
        this.showLoader();
        
        try {
            const data = await this.loadMoreFn(this.page);
            this.appendItems(data);
            this.page++;
        } catch (error) {
            console.error('Failed to load more:', error);
        } finally {
            this.loading = false;
            this.hideLoader();
        }
    }
    
    appendItems(items) {
        items.forEach(item => {
            const el = this.createItemElement(item);
            this.container.appendChild(el);
        });
    }
    
    createItemElement(item) {
        const div = document.createElement('div');
        div.className = 'item';
        div.textContent = item.title;
        return div;
    }
    
    showLoader() {
        const loader = document.createElement('div');
        loader.id = 'loader';
        loader.textContent = 'Loading...';
        this.container.appendChild(loader);
    }
    
    hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) loader.remove();
    }
}
```

## Custom Events

Create and dispatch custom events:

```javascript
// Create custom event
const myEvent = new CustomEvent('userLogin', {
    detail: {
        username: 'john',
        timestamp: Date.now()
    },
    bubbles: true,
    cancelable: true
});

// Listen for custom event
document.addEventListener('userLogin', (e) => {
    console.log('User logged in:', e.detail);
});

// Dispatch event
document.dispatchEvent(myEvent);
```

### Event Emitter Pattern
```javascript
class EventEmitter {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
    
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}
```

## Best Practices

1. Use `addEventListener` over inline handlers
2. Remove event listeners when elements are removed
3. Use event delegation for dynamic content
4. Debounce/throttle high-frequency events
5. Use `passive: true` for scroll/touch events
6. Name event handler functions for easier debugging
7. Use `once: true` for one-time events
8. Prevent memory leaks by cleaning up listeners
9. Use custom events for application-level events
10. Consider accessibility when handling events
