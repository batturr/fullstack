# Dark Mode Implementation in Bootstrap 5.3+

## Overview
Bootstrap 5.3+ includes built-in dark mode support using CSS variables and the `data-bs-theme` attribute. This provides a native, performant way to implement dark themes.

## Basic Implementation

### Method 1: HTML Attribute

Set dark mode on the entire document:

```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
<head>
    <!-- ... -->
</head>
<body>
    <!-- All Bootstrap components will use dark mode -->
</body>
</html>
```

### Method 2: Scoped Dark Mode

Apply dark mode to specific sections:

```html
<div data-bs-theme="light">
    <!-- Light mode content -->
</div>

<div data-bs-theme="dark">
    <!-- Dark mode content -->
</div>
```

## Toggle Dark Mode with JavaScript

### Simple Toggle

```html
<button onclick="toggleDarkMode()" class="btn btn-primary">
    Toggle Dark Mode
</button>

<script>
function toggleDarkMode() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-bs-theme', newTheme);
}
</script>
```

### Toggle with Icon Change

```html
<button onclick="toggleDarkMode()" class="btn btn-outline-secondary" id="themeToggle">
    <i class="bi bi-moon-fill" id="themeIcon"></i>
</button>

<script>
function toggleDarkMode() {
    const html = document.documentElement;
    const icon = document.getElementById('themeIcon');
    const currentTheme = html.getAttribute('data-bs-theme');
    
    if (currentTheme === 'dark') {
        html.setAttribute('data-bs-theme', 'light');
        icon.classList.replace('bi-sun-fill', 'bi-moon-fill');
    } else {
        html.setAttribute('data-bs-theme', 'dark');
        icon.classList.replace('bi-moon-fill', 'bi-sun-fill');
    }
}
</script>
```

## Persistent Dark Mode (LocalStorage)

```html
<script>
// Load saved theme on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    updateThemeIcon(savedTheme);
});

function toggleDarkMode() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Set new theme
    html.setAttribute('data-bs-theme', newTheme);
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
    
    // Update icon
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
    }
}
</script>
```

## System Preference Detection

Detect and apply the user's system theme preference:

```javascript
// Check system preference
function getPreferredTheme() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
        return storedTheme;
    }
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Apply theme
function setTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
}

// Initialize
setTheme(getPreferredTheme());

// Listen for system preference changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
    }
});
```

## Advanced Theme Toggle Component

```html
<div class="dropdown">
    <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
        <i class="bi bi-palette"></i> Theme
    </button>
    <ul class="dropdown-menu">
        <li>
            <button class="dropdown-item" onclick="setTheme('light')">
                <i class="bi bi-sun-fill"></i> Light
            </button>
        </li>
        <li>
            <button class="dropdown-item" onclick="setTheme('dark')">
                <i class="bi bi-moon-fill"></i> Dark
            </button>
        </li>
        <li>
            <button class="dropdown-item" onclick="setTheme('auto')">
                <i class="bi bi-circle-half"></i> Auto
            </button>
        </li>
    </ul>
</div>

<script>
function setTheme(theme) {
    if (theme === 'auto') {
        localStorage.removeItem('theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-bs-theme', systemTheme);
    } else {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-bs-theme', theme);
    }
}
</script>
```

## Custom Dark Mode Colors

### Using CSS Variables

```css
/* Light mode (default) */
:root {
    --app-bg-color: #ffffff;
    --app-text-color: #212529;
    --app-card-bg: #f8f9fa;
}

/* Dark mode */
[data-bs-theme="dark"] {
    --app-bg-color: #212529;
    --app-text-color: #dee2e6;
    --app-card-bg: #2b3035;
}

/* Apply custom colors */
body {
    background-color: var(--app-bg-color);
    color: var(--app-text-color);
}

.custom-card {
    background-color: var(--app-card-bg);
}
```

### Customizing Bootstrap Colors

```css
/* Override Bootstrap dark mode colors */
[data-bs-theme="dark"] {
    --bs-body-bg: #1a1d20;
    --bs-body-color: #e4e6eb;
    --bs-primary: #4dabf7;
    --bs-secondary: #748ffc;
    --bs-success: #51cf66;
    --bs-danger: #ff6b6b;
}
```

## Per-Component Dark Mode

Apply dark mode to specific components:

```html
<!-- Dark card in light page -->
<div class="card" data-bs-theme="dark">
    <div class="card-body">
        This card is always dark
    </div>
</div>

<!-- Dark navbar -->
<nav class="navbar navbar-expand-lg" data-bs-theme="dark">
    <!-- Navbar content -->
</nav>

<!-- Dark modal -->
<div class="modal fade" data-bs-theme="dark">
    <div class="modal-dialog">
        <div class="modal-content">
            <!-- Modal content in dark mode -->
        </div>
    </div>
</div>
```

## Images and Dark Mode

### Hide/Show Different Images

```html
<img src="logo-light.png" class="d-none d-dark-block" alt="Logo">
<img src="logo-dark.png" class="d-block d-dark-none" alt="Logo">
```

Using CSS:

```css
[data-bs-theme="light"] .dark-only {
    display: none !important;
}

[data-bs-theme="dark"] .light-only {
    display: none !important;
}
```

```html
<img src="logo-light.png" class="light-only" alt="Logo">
<img src="logo-dark.png" class="dark-only" alt="Logo">
```

### Image Filters for Dark Mode

```css
[data-bs-theme="dark"] img {
    filter: brightness(0.8) contrast(1.2);
}
```

## Smooth Transitions

Add smooth transitions when switching themes:

```css
body,
.card,
.navbar,
.btn {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

## Accessibility Considerations

1. **Contrast**: Ensure sufficient color contrast in both modes
2. **User Preference**: Respect system preferences
3. **Persistence**: Save user's theme choice
4. **Icons**: Use appropriate icons (sun/moon)
5. **ARIA Labels**: Add descriptive labels to toggle buttons

```html
<button onclick="toggleDarkMode()" 
        class="btn btn-outline-secondary" 
        aria-label="Toggle dark mode">
    <i class="bi bi-moon-fill"></i>
</button>
```

## Testing Dark Mode

```javascript
// Force dark mode for testing
localStorage.setItem('theme', 'dark');
document.documentElement.setAttribute('data-bs-theme', 'dark');

// Force light mode
localStorage.setItem('theme', 'light');
document.documentElement.setAttribute('data-bs-theme', 'light');

// Clear saved preference
localStorage.removeItem('theme');
```

## Browser Support

✅ All modern browsers supporting CSS variables  
✅ Chrome 49+, Firefox 31+, Safari 9.1+, Edge 15+  
⚠️ No IE 11 support

## Best Practices

1. **Default to system preference** when no user preference is saved
2. **Persist user choice** in localStorage
3. **Provide clear toggle UI** with appropriate icons
4. **Test all components** in both modes
5. **Use CSS variables** for custom colors
6. **Smooth transitions** for better UX
7. **Respect accessibility** standards
8. **Consider images** and icons in both modes
9. **Test contrast ratios** in both themes
10. **Document custom implementations** for your team
