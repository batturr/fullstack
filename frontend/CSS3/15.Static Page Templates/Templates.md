# 15. Static Page Templates

## Page Layout Patterns

---

## Classic Holy Grail Layout

```html
<div class="page">
  <header class="header">Header</header>
  <nav class="sidebar-left">Left Nav</nav>
  <main class="content">Main Content</main>
  <aside class="sidebar-right">Right Sidebar</aside>
  <footer class="footer">Footer</footer>
</div>
```

### With CSS Grid

```css
.page {
  display: grid;
  grid-template-areas:
    "header  header  header"
    "nav     main    aside"
    "footer  footer  footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 0;
}

.header        { grid-area: header; }
.sidebar-left  { grid-area: nav; }
.content       { grid-area: main; }
.sidebar-right { grid-area: aside; }
.footer        { grid-area: footer; }

@media (max-width: 768px) {
  .page {
    grid-template-areas:
      "header"
      "main"
      "nav"
      "aside"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

---

## Sticky Header + Scrollable Content

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
```

---

## Sidebar Layout

```css
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 260px;
  background: #1f2937;
  color: #d1d5db;
  padding: 1.5rem;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

/* Responsive: hide sidebar on mobile */
@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    height: auto;
    position: static;
  }
}
```

---

## Footer Stays at Bottom

```css
/* Method 1: Flexbox */
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin: 0;
}

main {
  flex: 1;  /* Takes up remaining space */
}

footer {
  /* Naturally sticks to bottom */
}

/* Method 2: Grid */
body {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  margin: 0;
}
```

---

## Centered Card Layout

```css
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  font-family: system-ui, sans-serif;
}

.card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  max-width: 450px;
  width: 90%;
}
```

---

## Responsive Card Grid

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

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
```

---

## Full-Page Template

```css
/* Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  color: #333;
}

/* Navigation */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 64px;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111;
  text-decoration: none;
}

.navbar-links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
}

.navbar-links a {
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.navbar-links a:hover { color: #111; }

/* Hero Section */
.hero {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.hero h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 1.1;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.25rem;
  max-width: 600px;
  opacity: 0.9;
  margin-bottom: 2rem;
}

/* Section */
.section {
  padding: 5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 3rem;
}

/* Footer */
.footer {
  background: #1f2937;
  color: #9ca3af;
  padding: 3rem 2rem;
  text-align: center;
}

.footer a { color: #d1d5db; }
```

---

## Responsive Utilities

```css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Hide/show at breakpoints */
@media (max-width: 768px) {
  .hide-mobile { display: none; }
}

@media (min-width: 769px) {
  .hide-desktop { display: none; }
}

/* Responsive text */
.text-responsive {
  font-size: clamp(1rem, 2.5vw, 1.5rem);
}

/* Responsive spacing */
.section {
  padding: clamp(2rem, 5vw, 5rem) 1rem;
}
```
