# 13. CSS Real-Time Examples

## Table Styling

### Basic Styled Table

```css
table {
  width: 100%;
  border-collapse: collapse;
  font-family: system-ui, sans-serif;
}

th, td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

tr:hover {
  background: #f3f4f6;
}

/* Zebra stripes */
tr:nth-child(even) {
  background: #f9fafb;
}
tr:nth-child(even):hover {
  background: #f3f4f6;
}
```

### Responsive Table

```css
@media (max-width: 768px) {
  table, thead, tbody, th, td, tr {
    display: block;
  }
  
  thead { display: none; }
  
  tr {
    margin-bottom: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }
  
  td {
    display: flex;
    justify-content: space-between;
    padding: 8px 16px;
    border-bottom: 1px solid #f3f4f6;
  }
  
  td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #6b7280;
  }
}
```

---

## Hyperlink Styles

### Modern Link Styling

```css
a {
  color: #2563eb;
  text-decoration: underline;
  text-decoration-color: rgba(37, 99, 235, 0.3);
  text-underline-offset: 3px;
  transition: all 0.2s ease;
}

a:hover {
  color: #1d4ed8;
  text-decoration-color: currentcolor;
}

a:active { color: #1e40af; }

a:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 2px;
}

/* External link indicator */
a[href^="http"]::after {
  content: " ↗";
  font-size: 0.8em;
}

/* PDF link */
a[href$=".pdf"]::before {
  content: "📄 ";
}
```

### Button-style Links

```css
.btn-link {
  display: inline-block;
  padding: 10px 24px;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.2s, transform 0.1s;
}

.btn-link:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-link:active {
  transform: translateY(0);
}
```

---

## Navigation Menu

### Horizontal Menu

```css
.nav {
  display: flex;
  gap: 0;
  list-style: none;
  padding: 0;
  margin: 0;
  background: #1f2937;
  border-radius: 8px;
  overflow: hidden;
}

.nav a {
  display: block;
  padding: 12px 20px;
  color: #d1d5db;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
}

.nav a:hover {
  background: #374151;
  color: white;
}

.nav a.active {
  background: #3b82f6;
  color: white;
}
```

### Dropdown Menu

```css
.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
  list-style: none;
  padding: 8px 0;
  margin: 0;
  z-index: 100;
}

.dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-menu a {
  display: block;
  padding: 8px 16px;
  color: #374151;
  text-decoration: none;
}

.dropdown-menu a:hover {
  background: #f3f4f6;
  color: #111827;
}
```

---

## Login Form

```css
.login-form {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.login-form h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #111827;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-group input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.form-group input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input:invalid:not(:placeholder-shown) {
  border-color: #ef4444;
}

.form-group input:valid:not(:placeholder-shown) {
  border-color: #22c55e;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: #2563eb;
}

.submit-btn:active {
  background: #1d4ed8;
}
```

---

## Card Component

```css
.card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s, transform 0.3s;
}

.card:hover {
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  transform: translateY(-2px);
}

.card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-body {
  padding: 1.25rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.card-text {
  color: #6b7280;
  line-height: 1.6;
}

.card-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

---

## Tooltip (Pure CSS)

```css
[data-tooltip] {
  position: relative;
  cursor: help;
}

[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 12px;
  background: #1f2937;
  color: white;
  font-size: 0.8rem;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  pointer-events: none;
  z-index: 10;
}

[data-tooltip]::before {
  content: "";
  position: absolute;
  bottom: calc(100% + 2px);
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #1f2937;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
}

[data-tooltip]:hover::after,
[data-tooltip]:hover::before {
  opacity: 1;
  visibility: visible;
}
```

```html
<span data-tooltip="This is a tooltip">Hover me</span>
```

---

## Loading Spinner (Pure CSS)

```css
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Dots spinner */
.dots {
  display: flex;
  gap: 8px;
}

.dots span {
  width: 12px;
  height: 12px;
  background: #3b82f6;
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite;
}

.dots span:nth-child(2) { animation-delay: 0.2s; }
.dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
```
