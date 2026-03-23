# BOOTSTRAP 5.3+ JUMBOTRON - HERO SECTION COMPONENTS

## Overview

The Jumbotron was a popular component in Bootstrap 3 and 4 used to display prominent, large heading and paragraph text with a highlighted background box. However, starting with Bootstrap 5, the Jumbotron component was **deprecated and removed**.

Instead, Bootstrap 5.3+ recommends using **utility classes** to build hero sections and similar prominent content areas. This approach is more flexible, lighter, and aligns with Bootstrap's utility-first design philosophy.

### Why Was Jumbotron Deprecated?

**Reasons for Deprecation:**
- Limited customization options
- Redundant with utility classes
- Component bloat reduction
- Utility classes provide more flexibility
- Better performance
- Aligned with modern CSS practices
- Easier to maintain
- More reusable patterns

### What's the Alternative?

Instead of using deprecated `.jumbotron` class, use these approaches:

✅ **Utility classes** - Most flexible and recommended
✅ **Custom CSS** - For unique designs
✅ **Bootstrap components** - Cards, containers, grids
✅ **Hero section patterns** - Industry-standard layouts

---

## Bootstrap 4 vs Bootstrap 5+ Jumbotron

### Bootstrap 4 (Deprecated)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jumbotron - Bootstrap 4</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <!-- Bootstrap 4: Using .jumbotron class -->
    <div class="jumbotron text-center">
        <h1 class="display-4">Welcome!</h1>
        <p class="lead">This is a jumbotron component.</p>
        <hr class="my-4">
        <p>Additional information here.</p>
        <a class="btn btn-primary btn-lg" href="#">Learn more</a>
    </div>
</body>
</html>
```

### Bootstrap 5+ (Recommended Approach)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hero Section - Bootstrap 5</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <!-- Bootstrap 5: Using utility classes -->
    <div class="bg-light p-5 text-center rounded">
        <h1 class="display-4">Welcome!</h1>
        <p class="lead">This is a hero section using utility classes.</p>
        <hr class="my-4">
        <p>Additional information here.</p>
        <a class="btn btn-primary btn-lg" href="#">Learn more</a>
    </div>
</body>
</html>
```

---

## Alternative 1: Simple Hero Section with Utility Classes

### Basic Hero Section

```html
<div class="bg-light p-5 text-center rounded-lg">
    <h1 class="display-4 fw-bold">Welcome to Our Site</h1>
    <p class="lead mb-4">Build amazing websites with Bootstrap 5</p>
    <a class="btn btn-primary btn-lg" href="#">Get Started</a>
</div>
```

**Classes Used:**
- `.bg-light` - Light background color
- `.p-5` - Padding (3rem on all sides)
- `.text-center` - Center text alignment
- `.rounded-lg` - Rounded corners (larger border radius)
- `.display-4` - Large display heading (3.5rem)
- `.fw-bold` - Font weight bold
- `.lead` - Lead paragraph style (larger, lighter)
- `.mb-4` - Margin bottom
- `.btn` - Button style
- `.btn-primary` - Primary button color
- `.btn-lg` - Large button size

### Complete Basic Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hero Section</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container my-5">
        <div class="bg-light p-5 text-center rounded-lg">
            <h1 class="display-4 fw-bold mb-3">Welcome to My Website</h1>
            <p class="lead mb-4">This is a custom-styled hero section using Bootstrap 5 utility classes.</p>
            <a class="btn btn-primary btn-lg" href="#">Learn More</a>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## Alternative 2: Full-Width Hero Section

### Full-Width Background Hero

```html
<div class="container-fluid bg-primary text-white py-5">
    <div class="container">
        <h1 class="display-3 fw-bold mb-3">Featured Content</h1>
        <p class="lead mb-4">A full-width hero section with colored background</p>
        <a class="btn btn-light btn-lg" href="#">Explore</a>
    </div>
</div>
```

**Classes Used:**
- `.container-fluid` - Full width container
- `.bg-primary` - Primary background color
- `.text-white` - White text color
- `.py-5` - Padding top and bottom
- `.display-3` - Larger display heading

### Full Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Full-Width Hero</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container-fluid bg-primary text-white py-5">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <h1 class="display-3 fw-bold">Welcome</h1>
                    <p class="lead mb-4">Transform your business with our solutions</p>
                    <a class="btn btn-light btn-lg" href="#">Get Started</a>
                </div>
                <div class="col-md-6">
                    <img src="hero-image.jpg" class="img-fluid" alt="Hero">
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## Alternative 3: Hero with Background Image

### Hero Section with Background Image

```html
<div class="position-relative overflow-hidden text-white text-center" 
     style="height: 500px; background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), 
                                         url('hero-bg.jpg') center/cover;">
    <div class="position-absolute top-50 start-50 translate-middle w-100">
        <h1 class="display-2 fw-bold mb-3">Welcome</h1>
        <p class="lead mb-4">Your content here</p>
        <a class="btn btn-primary btn-lg" href="#">Learn More</a>
    </div>
</div>
```

**Key Techniques:**
- `.position-relative` - Position relative container
- `.position-absolute` - Absolute positioning for content
- `.top-50` `.start-50` `.translate-middle` - Center the content
- `background` CSS - Background image with overlay
- `rgba(0, 0, 0, 0.5)` - Dark overlay for readability

### Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hero with Background Image</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .hero-section {
            height: 500px;
            background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), 
                        url('https://via.placeholder.com/1200x500') center/cover;
            color: white;
            position: relative;
            overflow: hidden;
        }
    </style>
</head>
<body>
    <div class="hero-section d-flex align-items-center justify-content-center text-center">
        <div>
            <h1 class="display-2 fw-bold mb-3">Welcome to Our Site</h1>
            <p class="lead mb-4">Transform Your Business Today</p>
            <a class="btn btn-primary btn-lg me-2" href="#">Get Started</a>
            <a class="btn btn-outline-light btn-lg" href="#">Learn More</a>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## Alternative 4: Hero with Content Cards

### Hero Section with Multiple Cards

```html
<div class="bg-light py-5">
    <div class="container">
        <div class="text-center mb-5">
            <h1 class="display-4 fw-bold">Our Features</h1>
            <p class="lead">Discover what makes us different</p>
        </div>
        
        <div class="row">
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">Feature 1</h5>
                        <p class="card-text">Description of feature 1</p>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">Feature 2</h5>
                        <p class="card-text">Description of feature 2</p>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">Feature 3</h5>
                        <p class="card-text">Description of feature 3</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
```

---

## Alternative 5: Hero with Text and Image

### Side-by-Side Layout

```html
<div class="bg-light py-5">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-md-6">
                <h1 class="display-4 fw-bold mb-3">Welcome</h1>
                <p class="lead mb-4">This is a flexible hero section layout combining text and image content.</p>
                <p class="mb-4">Use this layout for product showcases, feature announcements, or any promotional content.</p>
                <a class="btn btn-primary btn-lg" href="#">Get Started</a>
            </div>
            
            <div class="col-md-6 text-center">
                <img src="hero-image.jpg" class="img-fluid rounded" alt="Hero Image">
            </div>
        </div>
    </div>
</div>
```

### Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hero with Text and Image</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="bg-light py-5">
        <div class="container">
            <div class="row align-items-center gap-4 gap-md-0">
                <div class="col-12 col-md-6">
                    <h1 class="display-4 fw-bold mb-3">Powerful Features</h1>
                    <p class="lead mb-4">Experience the best solution for your needs</p>
                    
                    <ul class="list-unstyled mb-4">
                        <li class="mb-2">
                            <i class="bi bi-check-circle text-success me-2"></i>
                            Feature one
                        </li>
                        <li class="mb-2">
                            <i class="bi bi-check-circle text-success me-2"></i>
                            Feature two
                        </li>
                        <li class="mb-2">
                            <i class="bi bi-check-circle text-success me-2"></i>
                            Feature three
                        </li>
                    </ul>
                    
                    <a class="btn btn-primary btn-lg" href="#">Get Started</a>
                </div>
                
                <div class="col-12 col-md-6 text-center">
                    <img src="https://via.placeholder.com/400x300" class="img-fluid rounded-lg" alt="Product">
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## Alternative 6: Responsive Hero Section

### Mobile-First Responsive Hero

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Responsive Hero Section</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .hero {
            min-height: 400px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
        }
        
        @media (max-width: 768px) {
            .hero {
                min-height: 300px;
            }
        }
    </style>
</head>
<body>
    <div class="hero text-center py-5">
        <div class="container">
            <h1 class="display-3 fw-bold mb-3">Welcome to Bootstrap 5</h1>
            <p class="lead mb-4">The most popular CSS framework for responsive design</p>
            
            <div>
                <a class="btn btn-light btn-lg me-2 mb-2" href="#">Primary Action</a>
                <a class="btn btn-outline-light btn-lg mb-2" href="#">Secondary Action</a>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## Alternative 7: Card-Based Hero Section

### Hero Using Bootstrap Card Component

```html
<div class="container my-5">
    <div class="card border-0 bg-primary text-white">
        <div class="card-body p-5">
            <h2 class="card-title display-4 fw-bold mb-3">Special Offer</h2>
            <p class="card-text lead mb-4">Get 50% off on your first purchase</p>
            <a class="btn btn-light btn-lg" href="#">Claim Offer</a>
        </div>
    </div>
</div>
```

---

## Alternative 8: Dark Mode Hero Section

### Hero Section with Dark Mode Support

```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dark Mode Hero</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <!-- Light mode hero -->
    <div class="bg-light p-5 text-center rounded-lg mb-5">
        <h1 class="display-4 fw-bold">Light Mode Hero</h1>
        <p class="lead">Content here</p>
    </div>

    <!-- Dark mode hero -->
    <div style="background-color: #212529;" class="p-5 text-center rounded-lg text-white">
        <h1 class="display-4 fw-bold">Dark Mode Hero</h1>
        <p class="lead">Content here</p>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## Utility Classes for Creating Jumbotron-Like Sections

### Essential Utility Classes Reference

| Class | Purpose | Example |
|-------|---------|---------|
| `.p-5` | Large padding (3rem) | `<div class="p-5">` |
| `.py-5` | Vertical padding | `<div class="py-5">` |
| `.px-5` | Horizontal padding | `<div class="px-5">` |
| `.bg-light` | Light background | `<div class="bg-light">` |
| `.bg-primary` | Primary color bg | `<div class="bg-primary">` |
| `.bg-dark` | Dark background | `<div class="bg-dark">` |
| `.text-center` | Center text | `<div class="text-center">` |
| `.text-white` | White text | `<div class="text-white">` |
| `.rounded` | Border radius | `<div class="rounded">` |
| `.rounded-lg` | Larger border radius | `<div class="rounded-lg">` |
| `.display-1` to `.display-6` | Display headings | `<h1 class="display-4">` |
| `.lead` | Lead paragraph | `<p class="lead">` |
| `.fw-bold` | Font weight bold | `<p class="fw-bold">` |
| `.mb-4` | Margin bottom | `<div class="mb-4">` |
| `.shadow` | Box shadow | `<div class="shadow">` |

---

## Complete Responsive Website with Hero Sections

```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern Website with Hero Section</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        
        .hero {
            min-height: 500px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            position: relative;
            overflow: hidden;
        }
        
        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 500px;
            height: 500px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            transform: translate(100px, -100px);
        }
        
        .feature-icon {
            font-size: 3rem;
            color: #667eea;
            margin-bottom: 1rem;
        }
        
        .card {
            border: none;
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.2);
        }
        
        section {
            padding: 60px 0;
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm">
        <div class="container">
            <a class="navbar-brand fw-bold" href="#">Brand</a>
            
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="#features">Features</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#pricing">Pricing</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#contact">Contact</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <div class="hero position-relative">
        <div class="container position-relative z-1">
            <div class="row align-items-center">
                <div class="col-12 col-md-6 mb-4 mb-md-0">
                    <h1 class="display-3 fw-bold mb-3">Welcome to Our Platform</h1>
                    <p class="lead mb-4">Transform your business with our innovative solutions</p>
                    <div>
                        <a class="btn btn-light btn-lg me-2 mb-2" href="#">Get Started</a>
                        <a class="btn btn-outline-light btn-lg mb-2" href="#">Learn More</a>
                    </div>
                </div>
                
                <div class="col-12 col-md-6">
                    <img src="https://via.placeholder.com/400x300" class="img-fluid rounded" alt="Hero Image">
                </div>
            </div>
        </div>
    </div>

    <!-- Features Section -->
    <section class="bg-light" id="features">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class="display-5 fw-bold mb-3">Why Choose Us</h2>
                <p class="lead text-muted">Experience the difference with our platform</p>
            </div>
            
            <div class="row">
                <div class="col-12 col-md-4 mb-4">
                    <div class="card h-100 text-center">
                        <div class="card-body p-4">
                            <div class="feature-icon">
                                <i class="bi bi-lightning-fill"></i>
                            </div>
                            <h5 class="card-title">Fast</h5>
                            <p class="card-text">Lightning fast performance and responsiveness</p>
                        </div>
                    </div>
                </div>
                
                <div class="col-12 col-md-4 mb-4">
                    <div class="card h-100 text-center">
                        <div class="card-body p-4">
                            <div class="feature-icon">
                                <i class="bi bi-shield-check"></i>
                            </div>
                            <h5 class="card-title">Secure</h5>
                            <p class="card-text">Enterprise-grade security for your peace of mind</p>
                        </div>
                    </div>
                </div>
                
                <div class="col-12 col-md-4 mb-4">
                    <div class="card h-100 text-center">
                        <div class="card-body p-4">
                            <div class="feature-icon">
                                <i class="bi bi-chat-dots"></i>
                            </div>
                            <h5 class="card-title">Support</h5>
                            <p class="card-text">24/7 customer support and helpful documentation</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class="display-5 fw-bold mb-3">Simple Pricing</h2>
                <p class="lead text-muted">Choose the plan that works for you</p>
            </div>
            
            <div class="row">
                <div class="col-12 col-md-4 mb-4">
                    <div class="card text-center h-100">
                        <div class="card-body">
                            <h5 class="card-title">Starter</h5>
                            <p class="display-6 fw-bold text-primary">$29<span class="fs-5">/mo</span></p>
                            <ul class="list-unstyled mb-4">
                                <li class="mb-2">✓ Up to 10 users</li>
                                <li class="mb-2">✓ 10GB storage</li>
                                <li class="mb-2">✓ Basic support</li>
                            </ul>
                            <button class="btn btn-outline-primary w-100">Get Started</button>
                        </div>
                    </div>
                </div>
                
                <div class="col-12 col-md-4 mb-4">
                    <div class="card text-center h-100 border-primary shadow-lg">
                        <div class="card-body">
                            <div class="badge bg-primary position-absolute top-0 start-50 translate-middle">Popular</div>
                            <h5 class="card-title mt-2">Professional</h5>
                            <p class="display-6 fw-bold text-primary">$79<span class="fs-5">/mo</span></p>
                            <ul class="list-unstyled mb-4">
                                <li class="mb-2">✓ Up to 50 users</li>
                                <li class="mb-2">✓ 100GB storage</li>
                                <li class="mb-2">✓ Priority support</li>
                            </ul>
                            <button class="btn btn-primary w-100">Get Started</button>
                        </div>
                    </div>
                </div>
                
                <div class="col-12 col-md-4 mb-4">
                    <div class="card text-center h-100">
                        <div class="card-body">
                            <h5 class="card-title">Enterprise</h5>
                            <p class="display-6 fw-bold text-primary">Custom</p>
                            <ul class="list-unstyled mb-4">
                                <li class="mb-2">✓ Unlimited users</li>
                                <li class="mb-2">✓ Unlimited storage</li>
                                <li class="mb-2">✓ Dedicated support</li>
                            </ul>
                            <button class="btn btn-outline-primary w-100">Contact Us</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-primary text-white py-5">
        <div class="container text-center">
            <h2 class="display-5 fw-bold mb-3">Ready to Get Started?</h2>
            <p class="lead mb-4">Join thousands of satisfied customers</p>
            <a class="btn btn-light btn-lg" href="#">Sign Up Now</a>
        </div>
    </section>

    <!-- Contact Section -->
    <section class="bg-light" id="contact">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class="display-5 fw-bold mb-3">Get In Touch</h2>
            </div>
            
            <div class="row justify-content-center">
                <div class="col-12 col-md-6">
                    <form>
                        <div class="mb-3">
                            <label class="form-label">Name</label>
                            <input type="text" class="form-control" placeholder="Your name">
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" placeholder="Your email">
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Message</label>
                            <textarea class="form-control" rows="5" placeholder="Your message"></textarea>
                        </div>
                        
                        <button type="submit" class="btn btn-primary w-100">Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-white py-5">
        <div class="container">
            <div class="row mb-4">
                <div class="col-12 col-md-3 mb-4 mb-md-0">
                    <h5 class="fw-bold mb-3">About</h5>
                    <p class="text-muted">Information about your company or product</p>
                </div>
                
                <div class="col-12 col-md-3 mb-4 mb-md-0">
                    <h5 class="fw-bold mb-3">Links</h5>
                    <ul class="list-unstyled">
                        <li><a href="#" class="text-muted text-decoration-none">Home</a></li>
                        <li><a href="#" class="text-muted text-decoration-none">Features</a></li>
                        <li><a href="#" class="text-muted text-decoration-none">Pricing</a></li>
                    </ul>
                </div>
                
                <div class="col-12 col-md-3 mb-4 mb-md-0">
                    <h5 class="fw-bold mb-3">Legal</h5>
                    <ul class="list-unstyled">
                        <li><a href="#" class="text-muted text-decoration-none">Privacy</a></li>
                        <li><a href="#" class="text-muted text-decoration-none">Terms</a></li>
                        <li><a href="#" class="text-muted text-decoration-none">Contact</a></li>
                    </ul>
                </div>
                
                <div class="col-12 col-md-3">
                    <h5 class="fw-bold mb-3">Follow</h5>
                    <div class="d-flex gap-3">
                        <a href="#" class="text-muted"><i class="bi bi-facebook"></i></a>
                        <a href="#" class="text-muted"><i class="bi bi-twitter"></i></a>
                        <a href="#" class="text-muted"><i class="bi bi-linkedin"></i></a>
                    </div>
                </div>
            </div>
            
            <hr class="border-secondary">
            
            <div class="text-center text-muted">
                <p>&copy; 2024 Your Company. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## Migration Guide: Bootstrap 4 to Bootstrap 5+

### Before (Bootstrap 4 - Using Deprecated Jumbotron)

```html
<div class="jumbotron jumbotron-fluid">
    <div class="container">
        <h1 class="display-4">Fluid jumbotron</h1>
        <p class="lead">This is a modified jumbotron that takes the full width of its parent.</p>
    </div>
</div>
```

### After (Bootstrap 5 - Using Utility Classes)

```html
<div class="container-fluid bg-light p-5">
    <h1 class="display-4">Fluid hero section</h1>
    <p class="lead">This is a replacement using Bootstrap 5 utility classes.</p>
</div>
```

---

## Best Practices for Hero Sections

### DO's ✅

✅ **Use semantic HTML**
```html
<section class="hero">
  <!-- Hero content -->
</section>
```

✅ **Optimize images**
- Use responsive images
- Use proper formats (WebP, SVG)
- Compress images

✅ **Ensure accessibility**
```html
<h1 class="display-4">Main heading (screen reader sees this)</h1>
```

✅ **Make it responsive**
```html
<h1 class="display-3 display-md-4 display-lg-5">
  Responsive heading
</h1>
```

✅ **Add proper contrast**
```html
<div class="bg-dark text-white py-5">
  <!-- Sufficient contrast -->
</div>
```

### DON'Ts ❌

❌ **Don't use deprecated `.jumbotron` class**
```html
<!-- Bad -->
<div class="jumbotron">Content</div>

<!-- Good -->
<div class="bg-light p-5">Content</div>
```

❌ **Don't use fixed heights**
```html
<!-- Bad -->
<div style="height: 500px;">Content</div>

<!-- Good -->
<div class="py-5">Content</div>
```

❌ **Don't overload with content**
- Keep message clear and concise
- One main call-to-action
- Limit text length

❌ **Don't forget mobile optimization**
```html
<!-- Test on mobile devices -->
```

---

## Advanced Hero Section Techniques

### Parallax Effect (CSS)

```css
.hero {
    background: url('image.jpg') fixed center/cover;
}
```

### Animated Hero with CSS

```css
@keyframes slideInDown {
    from {
        opacity: 0;
        transform: translateY(-30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.hero h1 {
    animation: slideInDown 0.6s ease;
}
```

### Hero with Video Background

```html
<div class="position-relative overflow-hidden">
    <video class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" 
           autoplay muted loop>
        <source src="hero-video.mp4" type="video/mp4">
    </video>
    
    <div class="position-relative z-1 py-5" style="background: rgba(0, 0, 0, 0.5);">
        <div class="container text-white text-center">
            <h1 class="display-4">Video Hero Section</h1>
        </div>
    </div>
</div>
```

---

## Utility Classes Summary for Hero Sections

### Layout Classes
- `.container` - Fixed width container
- `.container-fluid` - Full width container
- `.row` - Flex row
- `.col-*` - Grid columns

### Spacing Classes
- `.p-5` - Padding all sides (3rem)
- `.py-5` - Padding top/bottom (3rem)
- `.px-5` - Padding left/right (3rem)
- `.m-5` - Margin all sides (3rem)

### Color Classes
- `.bg-light` - Light background
- `.bg-primary` - Primary color
- `.bg-dark` - Dark background
- `.text-white` - White text
- `.text-muted` - Muted text

### Typography Classes
- `.display-1` to `.display-6` - Display headings
- `.lead` - Lead paragraph
- `.fw-bold` - Bold weight
- `.text-center` - Center text

### Shape Classes
- `.rounded` - Rounded corners
- `.rounded-lg` - Large border radius
- `.shadow` - Box shadow

---

## Complete Examples Collection

### Minimal Hero

```html
<div class="bg-primary text-white text-center py-5">
    <h1 class="display-4">Welcome</h1>
    <p class="lead">Simple hero section</p>
    <a class="btn btn-light" href="#">Get Started</a>
</div>
```

### Professional Hero

```html
<div class="bg-gradient py-5">
    <div class="container text-center">
        <h1 class="display-3 fw-bold mb-3">Professional</h1>
        <p class="lead mb-4">Premium hero section</p>
        <div>
            <a class="btn btn-primary btn-lg me-2" href="#">Action 1</a>
            <a class="btn btn-outline-primary btn-lg" href="#">Action 2</a>
        </div>
    </div>
</div>
```

### Elegant Hero

```html
<div class="position-relative overflow-hidden bg-light py-5">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-md-6">
                <h1 class="display-4 fw-bold">Elegant</h1>
                <p class="lead">Sophisticated design</p>
            </div>
            <div class="col-md-6 text-center">
                <img src="image.png" class="img-fluid" alt="">
            </div>
        </div>
    </div>
</div>
```

---

## Resources

### Official Documentation
- **Bootstrap Layout**: https://getbootstrap.com/docs/5.3/layout/
- **Bootstrap Utilities**: https://getbootstrap.com/docs/5.3/utilities/
- **Bootstrap Components**: https://getbootstrap.com/docs/5.3/components/

### CDN Links (Bootstrap 5.3.2)

**CSS:**
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
```

**JavaScript:**
```html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
```

**Icons (Optional):**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
```

---

## Summary

### Key Takeaways

1. **Jumbotron is deprecated** - Don't use `.jumbotron` class in Bootstrap 5+
2. **Use utility classes** - More flexible and recommended approach
3. **Multiple alternatives** - Choose the pattern that fits your needs
4. **Responsive design** - Always test on multiple devices
5. **Accessibility matters** - Ensure proper contrast and semantic HTML
6. **Performance first** - Optimize images and minimize CSS

### Hero Section Types

| Type | Best For | Complexity |
|------|----------|-----------|
| Simple | Minimal content | Low |
| Full-width | Branded sections | Medium |
| With image | Product showcases | Medium |
| With cards | Feature highlights | Medium |
| Background image | Visual impact | Medium |
| Dark mode | Modern design | Medium |

The shift from Jumbotron to utility classes in Bootstrap 5+ represents a more modern, flexible approach to web design. By mastering these utility classes, you can create beautiful, responsive hero sections for any project!