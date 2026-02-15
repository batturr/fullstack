# Bootstrap 5 Real-World Projects

## Overview
This section contains complete, production-ready project examples showcasing Bootstrap 5 best practices and advanced techniques.

## Project 1: E-Commerce Product Page

### Features
- Responsive product grid
- Image gallery with lightbox
- Product filters and sorting
- Shopping cart integration
- Review system
- Wishlist functionality

### Key Components Used
- Grid system
- Cards
- Modal
- Offcanvas (filters/cart)
- Badges
- Forms
- Buttons

### Implementation Highlights

```html
<!-- Product Grid -->
<div class="container">
  <div class="row">
    <!-- Filters Sidebar (Offcanvas on mobile) -->
    <aside class="col-lg-3">
      <div class="offcanvas-lg offcanvas-start" id="filters">
        <div class="offcanvas-header">
          <h5>Filters</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
        </div>
        <div class="offcanvas-body">
          <!-- Accordion filters -->
          <div class="accordion">
            <!-- Categories, Price, Brands, etc. -->
          </div>
        </div>
      </div>
    </aside>
    
    <!-- Products -->
    <main class="col-lg-9">
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <!-- Product cards -->
      </div>
    </main>
  </div>
</div>
```

### Key Techniques
1. **Responsive Layout**: Mobile-first grid with offcanvas filters
2. **Performance**: Lazy loading images, infinite scroll
3. **Accessibility**: ARIA labels, keyboard navigation
4. **State Management**: Cart state with localStorage
5. **Dark Mode**: Theme toggle with persistence

## Project 2: Admin Dashboard

### Features
- Sidebar navigation
- Data tables with sorting/filtering
- Charts and statistics
- User management
- Notifications system
- Settings panel

### Key Components Used
- Navbar
- Offcanvas sidebar
- Tables
- Cards
- Badges
- Progress bars
- Toasts
- Dropdowns

### Layout Structure

```html
<div class="container-fluid">
  <div class="row">
    <!-- Sidebar -->
    <nav class="col-md-3 col-lg-2 d-md-block bg-light sidebar">
      <div class="position-sticky pt-3">
        <!-- Navigation links -->
      </div>
    </nav>
    
    <!-- Main Content -->
    <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
      <!-- Top Stats Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-6 col-lg-3">
          <div class="card">
            <div class="card-body">
              <h5>Total Users</h5>
              <h2>2,847</h2>
              <small class="text-success">↑ 12%</small>
            </div>
          </div>
        </div>
        <!-- More stat cards -->
      </div>
      
      <!-- Charts -->
      <div class="row mb-4">
        <div class="col-lg-8">
          <div class="card">
            <!-- Chart.js canvas -->
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card">
            <!-- Recent activity -->
          </div>
        </div>
      </div>
      
      <!-- Data Table -->
      <div class="card">
        <div class="card-header">
          <h5>Users</h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <!-- Table content -->
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
```

### Key Techniques
1. **Fixed Sidebar**: Collapsible on mobile, fixed on desktop
2. **Data Visualization**: Integration with Chart.js
3. **Real-time Updates**: Toast notifications for updates
4. **Search & Filter**: Live table filtering
5. **Responsive Tables**: Horizontal scroll on mobile

## Project 3: Portfolio Website

### Features
- Hero section with parallax
- Project showcase grid
- Skill tags
- Contact form with validation
- Smooth scrolling navigation
- Light/Dark theme toggle

### Key Components Used
- Navbar with scrollspy
- Cards
- Modal (project details)
- Forms
- Badges
- Carousel
- Progress bars

### Hero Section

```html
<section class="hero-section bg-primary text-white" style="min-height: 100vh;">
  <div class="container h-100 d-flex align-items-center">
    <div class="row w-100">
      <div class="col-lg-6">
        <h1 class="display-3 fw-bold mb-4">
          Hi, I'm John Doe
        </h1>
        <p class="lead mb-4">
          Full-Stack Developer specializing in React & Node.js
        </p>
        <div class="d-flex gap-3">
          <a href="#projects" class="btn btn-light btn-lg">View Projects</a>
          <a href="#contact" class="btn btn-outline-light btn-lg">Contact Me</a>
        </div>
      </div>
      <div class="col-lg-6">
        <!-- Animated illustration or image -->
      </div>
    </div>
  </div>
</section>
```

### Project Grid with Filters

```html
<section id="projects" class="py-5">
  <div class="container">
    <h2 class="text-center mb-5">My Projects</h2>
    
    <!-- Filter buttons -->
    <div class="text-center mb-4">
      <button class="btn btn-outline-primary active" data-filter="all">All</button>
      <button class="btn btn-outline-primary" data-filter="web">Web</button>
      <button class="btn btn-outline-primary" data-filter="mobile">Mobile</button>
      <button class="btn btn-outline-primary" data-filter="design">Design</button>
    </div>
    
    <!-- Projects grid -->
    <div class="row g-4" id="projectsGrid">
      <div class="col-md-6 col-lg-4 project-item" data-category="web">
        <div class="card h-100">
          <img src="project1.jpg" class="card-img-top" alt="Project">
          <div class="card-body">
            <h5 class="card-title">E-Commerce Platform</h5>
            <p class="card-text">Full-stack application...</p>
            <div class="mb-3">
              <span class="badge bg-primary">React</span>
              <span class="badge bg-success">Node.js</span>
            </div>
            <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#projectModal">
              View Details
            </button>
          </div>
        </div>
      </div>
      <!-- More projects -->
    </div>
  </div>
</section>
```

### Key Techniques
1. **Scrollspy Navigation**: Active menu item based on scroll position
2. **Smooth Scrolling**: Animated scroll to sections
3. **Project Filtering**: JavaScript filter with animations
4. **Form Validation**: Client-side validation with feedback
5. **Responsive Images**: Optimized images with lazy loading

## Project 4: Blog Platform

### Features
- Article listing with pagination
- Sidebar with categories/tags
- Search functionality
- Comment system
- Author profiles
- Social sharing buttons

### Key Components Used
- Grid system
- Cards
- Pagination
- Breadcrumbs
- Forms
- List groups
- Badges

### Article Layout

```html
<div class="container my-5">
  <div class="row">
    <!-- Main Content -->
    <main class="col-lg-8">
      <!-- Breadcrumbs -->
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="/">Home</a></li>
          <li class="breadcrumb-item"><a href="/blog">Blog</a></li>
          <li class="breadcrumb-item active">Article Title</li>
        </ol>
      </nav>
      
      <!-- Article -->
      <article class="card mb-4">
        <img src="featured.jpg" class="card-img-top" alt="Article">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span class="badge bg-primary">Technology</span>
              <span class="badge bg-secondary">Tutorial</span>
            </div>
            <small class="text-muted">March 15, 2024</small>
          </div>
          
          <h1 class="card-title">Article Title</h1>
          
          <div class="d-flex align-items-center mb-4">
            <img src="avatar.jpg" class="rounded-circle me-2" width="40" alt="Author">
            <div>
              <strong>John Doe</strong>
              <small class="text-muted d-block">5 min read</small>
            </div>
          </div>
          
          <div class="article-content">
            <!-- Article content -->
          </div>
          
          <!-- Social sharing -->
          <div class="d-flex gap-2 mt-4">
            <button class="btn btn-outline-primary">
              <i class="bi bi-facebook"></i> Share
            </button>
            <button class="btn btn-outline-info">
              <i class="bi bi-twitter"></i> Tweet
            </button>
            <button class="btn btn-outline-danger">
              <i class="bi bi-pinterest"></i> Pin
            </button>
          </div>
        </div>
      </article>
      
      <!-- Comments Section -->
      <section class="card">
        <div class="card-header">
          <h3>Comments (12)</h3>
        </div>
        <div class="card-body">
          <!-- Comments list -->
        </div>
      </section>
    </main>
    
    <!-- Sidebar -->
    <aside class="col-lg-4">
      <!-- Search -->
      <div class="card mb-4">
        <div class="card-body">
          <form>
            <div class="input-group">
              <input type="search" class="form-control" placeholder="Search...">
              <button class="btn btn-primary">
                <i class="bi bi-search"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Categories -->
      <div class="card mb-4">
        <div class="card-header">
          <h5>Categories</h5>
        </div>
        <div class="list-group list-group-flush">
          <a href="#" class="list-group-item d-flex justify-content-between">
            Technology <span class="badge bg-primary">24</span>
          </a>
          <!-- More categories -->
        </div>
      </div>
      
      <!-- Popular Posts -->
      <div class="card">
        <div class="card-header">
          <h5>Popular Posts</h5>
        </div>
        <div class="card-body">
          <!-- Post previews -->
        </div>
      </div>
    </aside>
  </div>
</div>
```

### Key Techniques
1. **SEO Optimization**: Proper heading hierarchy, meta tags
2. **Reading Experience**: Optimized typography, spacing
3. **Social Integration**: Share buttons with counters
4. **Infinite Scroll**: Load more articles dynamically
5. **Search**: Client-side search with highlighting

## Project 5: SaaS Landing Page

### Features
- Hero with CTA
- Feature sections
- Pricing tables
- Testimonials carousel
- FAQ accordion
- Newsletter signup

### Pricing Section

```html
<section class="py-5 bg-light">
  <div class="container">
    <h2 class="text-center mb-5">Choose Your Plan</h2>
    
    <div class="row g-4 align-items-center">
      <!-- Basic Plan -->
      <div class="col-lg-4">
        <div class="card">
          <div class="card-body text-center p-4">
            <h3 class="card-title">Basic</h3>
            <div class="my-4">
              <span class="display-4 fw-bold">$9</span>
              <span class="text-muted">/month</span>
            </div>
            <ul class="list-unstyled mb-4">
              <li class="mb-2">✓ 10 Projects</li>
              <li class="mb-2">✓ 5GB Storage</li>
              <li class="mb-2">✓ Email Support</li>
              <li class="mb-2 text-muted">✗ Priority Support</li>
            </ul>
            <button class="btn btn-outline-primary w-100">Get Started</button>
          </div>
        </div>
      </div>
      
      <!-- Pro Plan (Featured) -->
      <div class="col-lg-4">
        <div class="card border-primary shadow-lg" style="transform: scale(1.05);">
          <div class="card-header bg-primary text-white text-center">
            <span class="badge bg-warning text-dark">Most Popular</span>
          </div>
          <div class="card-body text-center p-4">
            <h3 class="card-title">Professional</h3>
            <div class="my-4">
              <span class="display-4 fw-bold">$29</span>
              <span class="text-muted">/month</span>
            </div>
            <ul class="list-unstyled mb-4">
              <li class="mb-2">✓ Unlimited Projects</li>
              <li class="mb-2">✓ 50GB Storage</li>
              <li class="mb-2">✓ Priority Support</li>
              <li class="mb-2">✓ Advanced Analytics</li>
            </ul>
            <button class="btn btn-primary w-100">Get Started</button>
          </div>
        </div>
      </div>
      
      <!-- Enterprise Plan -->
      <div class="col-lg-4">
        <div class="card">
          <div class="card-body text-center p-4">
            <h3 class="card-title">Enterprise</h3>
            <div class="my-4">
              <span class="display-4 fw-bold">$99</span>
              <span class="text-muted">/month</span>
            </div>
            <ul class="list-unstyled mb-4">
              <li class="mb-2">✓ Unlimited Everything</li>
              <li class="mb-2">✓ Dedicated Support</li>
              <li class="mb-2">✓ Custom Integration</li>
              <li class="mb-2">✓ SLA Guarantee</li>
            </ul>
            <button class="btn btn-outline-primary w-100">Contact Sales</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

### Key Techniques
1. **Conversion Optimization**: Clear CTAs, social proof
2. **Responsive Pricing**: Cards adjust on all screen sizes
3. **Interactive Elements**: Hover effects, animations
4. **Trust Indicators**: Testimonials, logos, stats
5. **Form Handling**: Newsletter signup with validation

## Common Patterns Across Projects

### 1. Loading States
```javascript
function showLoadingState(element) {
  element.innerHTML = `
    <div class="text-center p-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  `;
}
```

### 2. Error Handling
```javascript
function showError(message) {
  const toast = document.createElement('div');
  toast.className = 'toast align-items-center text-bg-danger border-0';
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  document.getElementById('toastContainer').appendChild(toast);
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
}
```

### 3. Confirmation Dialogs
```javascript
function confirmAction(title, message, onConfirm) {
  // Create modal, attach event, show
}
```

## Project Structure Best Practices

```
project/
├── index.html
├── css/
│   ├── bootstrap.min.css
│   └── custom.css
├── js/
│   ├── bootstrap.bundle.min.js
│   └── main.js
├── images/
│   ├── optimized/
│   └── original/
├── fonts/
└── assets/
```

## Resources

- [Bootstrap Examples](https://getbootstrap.com/docs/5.3/examples/)
- [Start Bootstrap Themes](https://startbootstrap.com/)
- [BootstrapMade Templates](https://bootstrapmade.com/)
- [MDBootstrap](https://mdbootstrap.com/)
