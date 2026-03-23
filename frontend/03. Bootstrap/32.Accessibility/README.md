# Bootstrap 5 Accessibility (A11y) Best Practices

## Overview
Bootstrap 5 provides accessible components out of the box, but developers must implement them correctly. This guide covers accessibility best practices.

## 1. Semantic HTML

### Use Proper Elements

```html
<!-- BAD: Divs everywhere -->
<div class="header">
  <div class="nav">
    <div onclick="navigate()">Home</div>
  </div>
</div>

<!-- GOOD: Semantic elements -->
<header>
  <nav>
    <a href="/">Home</a>
  </nav>
</header>
```

### Heading Hierarchy

```html
<!-- BAD: Skipping heading levels -->
<h1>Main Title</h1>
<h3>Subsection</h3>

<!-- GOOD: Proper hierarchy -->
<h1>Main Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
```

## 2. ARIA Attributes

### Modal Accessibility

```html
<div class="modal fade" 
     id="myModal" 
     tabindex="-1" 
     aria-labelledby="modalTitle" 
     aria-describedby="modalDescription"
     aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="modalTitle">Modal Title</h5>
        <button type="button" 
                class="btn-close" 
                data-bs-dismiss="modal" 
                aria-label="Close"></button>
      </div>
      <div class="modal-body" id="modalDescription">
        Modal content description
      </div>
    </div>
  </div>
</div>
```

### Dropdown Accessibility

```html
<div class="dropdown">
  <button class="btn btn-secondary dropdown-toggle" 
          type="button" 
          id="dropdownMenu" 
          data-bs-toggle="dropdown" 
          aria-expanded="false">
    Dropdown button
  </button>
  <ul class="dropdown-menu" aria-labelledby="dropdownMenu">
    <li><a class="dropdown-item" href="#">Action</a></li>
    <li><a class="dropdown-item" href="#">Another action</a></li>
  </ul>
</div>
```

### Accordion Accessibility

```html
<div class="accordion" id="accordionExample">
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#collapseOne" 
              aria-expanded="true" 
              aria-controls="collapseOne">
        Accordion Item #1
      </button>
    </h2>
    <div id="collapseOne" 
         class="accordion-collapse collapse show" 
         data-bs-parent="#accordionExample">
      <div class="accordion-body">
        Content
      </div>
    </div>
  </div>
</div>
```

## 3. Form Accessibility

### Labels

```html
<!-- BAD: No label -->
<input type="text" placeholder="Email">

<!-- GOOD: Visible label -->
<label for="email">Email</label>
<input type="text" id="email" class="form-control">

<!-- ACCEPTABLE: Hidden label with aria-label -->
<input type="text" 
       class="form-control" 
       aria-label="Email address" 
       placeholder="Email">
```

### Form Validation

```html
<form class="needs-validation" novalidate>
  <div class="mb-3">
    <label for="email" class="form-label">Email address</label>
    <input type="email" 
           class="form-control" 
           id="email" 
           required
           aria-describedby="emailHelp emailError">
    <div id="emailHelp" class="form-text">
      We'll never share your email with anyone else.
    </div>
    <div id="emailError" class="invalid-feedback">
      Please provide a valid email address.
    </div>
  </div>
</form>
```

### Required Fields

```html
<div class="mb-3">
  <label for="name" class="form-label">
    Name <span class="text-danger" aria-label="required">*</span>
  </label>
  <input type="text" 
         class="form-control" 
         id="name" 
         required 
         aria-required="true">
</div>
```

## 4. Color Contrast

### Ensure Sufficient Contrast

```html
<!-- BAD: Low contrast -->
<button class="btn" style="background: #ccc; color: #ddd;">Click</button>

<!-- GOOD: High contrast -->
<button class="btn btn-primary">Click</button>

<!-- Check contrast ratios -->
<!-- Normal text: minimum 4.5:1 -->
<!-- Large text: minimum 3:1 -->
<!-- UI components: minimum 3:1 -->
```

### Don't Rely on Color Alone

```html
<!-- BAD: Color only -->
<p class="text-danger">Error occurred</p>

<!-- GOOD: Color + icon/text -->
<p class="text-danger">
  <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
  <span class="visually-hidden">Error:</span>
  Error occurred
</p>
```

## 5. Keyboard Navigation

### Focus Management

```html
<!-- Ensure all interactive elements are keyboard accessible -->
<button class="btn btn-primary" tabindex="0">Accessible Button</button>

<!-- Skip to main content link -->
<a href="#main-content" class="visually-hidden-focusable">Skip to main content</a>

<main id="main-content">
  <!-- Main content -->
</main>
```

### Trap Focus in Modals

```javascript
const modal = document.getElementById('myModal');

modal.addEventListener('shown.bs.modal', function () {
  // Focus first focusable element
  const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (firstFocusable) firstFocusable.focus();
});

modal.addEventListener('hidden.bs.modal', function () {
  // Return focus to trigger element
  const trigger = document.querySelector('[data-bs-target="#myModal"]');
  if (trigger) trigger.focus();
});
```

### Custom Focus Styles

```css
/* Don't remove focus outline */
/* BAD */
*:focus {
  outline: none;
}

/* GOOD: Custom accessible focus style */
:focus {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}
```

## 6. Screen Reader Support

### Visually Hidden Content

```html
<!-- Hide visually but keep for screen readers -->
<span class="visually-hidden">Additional context for screen readers</span>

<!-- Show only when focused (skip links) -->
<a href="#main" class="visually-hidden-focusable">Skip to main content</a>
```

### Icons and Images

```html
<!-- Decorative icon -->
<i class="bi bi-star-fill" aria-hidden="true"></i>

<!-- Meaningful icon -->
<button type="button" class="btn-close" aria-label="Close"></button>

<!-- Image with alt text -->
<img src="logo.png" alt="Company Logo" class="img-fluid">

<!-- Decorative image -->
<img src="decoration.png" alt="" role="presentation">
```

### Live Regions

```html
<!-- Announce dynamic content changes -->
<div role="status" aria-live="polite" aria-atomic="true">
  <div class="toast show">
    <div class="toast-body">
      Your settings have been saved.
    </div>
  </div>
</div>

<!-- Urgent announcements -->
<div role="alert" aria-live="assertive">
  <div class="alert alert-danger">
    Critical error occurred!
  </div>
</div>
```

## 7. Tables

### Accessible Data Tables

```html
<table class="table table-striped">
  <caption>User List</caption>
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Name</th>
      <th scope="col">Email</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1</th>
      <td>John Doe</td>
      <td>john@example.com</td>
    </tr>
  </tbody>
</table>
```

### Complex Tables

```html
<table class="table">
  <thead>
    <tr>
      <th scope="col" id="name">Name</th>
      <th scope="col" id="age">Age</th>
      <th scope="col" id="city">City</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td headers="name">John</td>
      <td headers="age">30</td>
      <td headers="city">New York</td>
    </tr>
  </tbody>
</table>
```

## 8. Navigation

### Accessible Navbar

```html
<nav class="navbar navbar-expand-lg navbar-light bg-light" aria-label="Main navigation">
  <div class="container-fluid">
    <a class="navbar-brand" href="/">
      <img src="logo.png" alt="Company Name" height="30">
    </a>
    <button class="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
            aria-controls="navbarNav" 
            aria-expanded="false" 
            aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="/">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/about">About</a>
        </li>
      </ul>
    </div>
  </div>
</nav>
```

### Breadcrumbs

```html
<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a href="/">Home</a></li>
    <li class="breadcrumb-item"><a href="/products">Products</a></li>
    <li class="breadcrumb-item active" aria-current="page">Item</li>
  </ol>
</nav>
```

## 9. Buttons and Links

### Accessible Buttons

```html
<!-- Button for actions -->
<button type="button" class="btn btn-primary">
  <i class="bi bi-save" aria-hidden="true"></i>
  Save
</button>

<!-- Link for navigation -->
<a href="/page" class="btn btn-primary" role="button">
  Go to Page
</a>

<!-- Disabled button -->
<button type="button" class="btn btn-primary" disabled aria-disabled="true">
  Disabled Button
</button>
```

### Button Groups

```html
<div class="btn-group" role="group" aria-label="Text alignment">
  <button type="button" class="btn btn-outline-primary" aria-label="Align left">
    <i class="bi bi-text-left" aria-hidden="true"></i>
  </button>
  <button type="button" class="btn btn-outline-primary" aria-label="Align center">
    <i class="bi bi-text-center" aria-hidden="true"></i>
  </button>
  <button type="button" class="btn btn-outline-primary" aria-label="Align right">
    <i class="bi bi-text-right" aria-hidden="true"></i>
  </button>
</div>
```

## 10. Carousel Accessibility

```html
<div id="carouselExample" 
     class="carousel slide" 
     data-bs-ride="carousel"
     aria-label="Image carousel">
  <div class="carousel-indicators">
    <button type="button" 
            data-bs-target="#carouselExample" 
            data-bs-slide-to="0" 
            class="active" 
            aria-current="true" 
            aria-label="Slide 1"></button>
    <button type="button" 
            data-bs-target="#carouselExample" 
            data-bs-slide-to="1" 
            aria-label="Slide 2"></button>
  </div>
  
  <div class="carousel-inner">
    <div class="carousel-item active">
      <img src="slide1.jpg" class="d-block w-100" alt="Description of slide 1">
      <div class="carousel-caption">
        <h5>First slide label</h5>
        <p>Description</p>
      </div>
    </div>
  </div>
  
  <button class="carousel-control-prev" 
          type="button" 
          data-bs-target="#carouselExample" 
          data-bs-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Previous</span>
  </button>
  <button class="carousel-control-next" 
          type="button" 
          data-bs-target="#carouselExample" 
          data-bs-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Next</span>
  </button>
</div>
```

## Testing Tools

### Browser Extensions
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Screen Readers
- **NVDA** (Windows, free)
- **JAWS** (Windows, paid)
- **VoiceOver** (macOS/iOS, built-in)
- **TalkBack** (Android, built-in)

### Keyboard Testing
Test with keyboard only:
- Tab: Navigate forward
- Shift+Tab: Navigate backward
- Enter/Space: Activate buttons
- Escape: Close modals/dropdowns
- Arrow keys: Navigate menus

## Accessibility Checklist

- [ ] All images have alt text
- [ ] Forms have proper labels
- [ ] Color contrast ratios meet WCAG AA
- [ ] Site is keyboard navigable
- [ ] Focus indicators are visible
- [ ] ARIA attributes are used correctly
- [ ] Heading hierarchy is logical
- [ ] Links have descriptive text
- [ ] Tables have proper headers
- [ ] Page has proper document structure
- [ ] Interactive elements are accessible
- [ ] Error messages are clear
- [ ] Content is readable without CSS
- [ ] Site works with screen readers
- [ ] Forms have validation feedback

## Resources

- [Bootstrap Accessibility](https://getbootstrap.com/docs/5.3/getting-started/accessibility/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
