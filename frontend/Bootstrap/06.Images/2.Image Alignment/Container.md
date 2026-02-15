# BOOTSTRAP 5.3+ IMAGE ALIGNMENT AND POSITIONING

## Overview

Image alignment is a fundamental aspect of responsive web design. Bootstrap 5.3+ provides multiple utility classes to align and position images in various ways. These classes work with images and other inline/block elements, allowing you to create professional layouts without writing custom CSS.

### Key Alignment Methods
- **Float alignment** - `.float-start`, `.float-end`
- **Text alignment** - `.text-center`, `.text-start`, `.text-end`
- **Flexbox alignment** - `.d-flex`, `.justify-content-center`, `.align-items-center`
- **Grid alignment** - `.d-grid`, `.justify-items-center`
- **Margin utilities** - `.mx-auto` (center with margins)
- **Display utilities** - `.d-block`, `.d-inline`, `.d-inline-block`
- **Position utilities** - `.position-absolute`, `.position-relative`
- **NEW in Bootstrap 5.3+** - Enhanced flexbox, improved responsive variants

---

## Float-Based Alignment

### Left Alignment (`.float-start`)

```html
<!-- Float image to left -->
<img src="image.jpg" class="float-start" alt="Left aligned">
```

**CSS Equivalent:**
```css
.float-start {
    float: left !important;
}
```

**Characteristics:**
- Text wraps around image on the right
- Image stays at left edge
- Content flows around image
- Works with block elements

### Complete Left Alignment Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Left Aligned Image</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container my-5">
        <div class="row">
            <div class="col-12">
                <img src="https://via.placeholder.com/250/667eea/ffffff?text=Article+Image" 
                     class="float-start rounded me-3 mb-3" 
                     alt="Article image"
                     style="width: 250px; height: auto;">
                
                <h2>Article Title</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                
                <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                
                <div class="clearfix"></div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

### Right Alignment (`.float-end`)

```html
<!-- Float image to right -->
<img src="image.jpg" class="float-end" alt="Right aligned">
```

**CSS Equivalent:**
```css
.float-end {
    float: right !important;
}
```

**Characteristics:**
- Text wraps around image on the left
- Image stays at right edge
- Content flows around image
- Mirror of left alignment

### Complete Right Alignment Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Right Aligned Image</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container my-5">
        <div class="row">
            <div class="col-12">
                <img src="https://via.placeholder.com/250/764ba2/ffffff?text=Product+Image" 
                     class="float-end rounded ms-3 mb-3" 
                     alt="Product image"
                     style="width: 250px; height: auto;">
                
                <h2>Product Description</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                
                <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                
                <div class="clearfix"></div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

### Clearing Floats (`.clearfix`)

When using floated images, you need to clear the float to prevent layout issues:

```html
<img src="image.jpg" class="float-start me-3" alt="Floated image">
<p>Text content here...</p>

<!-- Clear the float -->
<div class="clearfix"></div>

<!-- Content after clearfix will not wrap around image -->
<p>This content starts on a new line</p>
```

**Alternative - Using Clear Utility:**
```html
<img src="image.jpg" class="float-start me-3" alt="Floated image">
<p>Text content here...</p>

<p class="clearfix">This paragraph clears the float itself</p>
```

---

## Center Alignment

### Center Alignment with Margin Auto

```html
<!-- Center using margin auto + block display -->
<img src="image.jpg" class="mx-auto d-block" alt="Centered image">
```

**Classes Explained:**
- `.mx-auto` - Margin left and right auto (horizontal center)
- `.d-block` - Display as block (required for mx-auto to work on images)

**CSS Equivalent:**
```css
.mx-auto {
    margin-left: auto !important;
    margin-right: auto !important;
}

.d-block {
    display: block !important;
}
```

### Center Alignment with Text-Center

```html
<!-- Container centered approach -->
<div class="text-center">
    <img src="image.jpg" alt="Centered image">
</div>
```

**When to Use:**
- Simpler for inline-block elements
- Affects all text inside container
- Good for isolated images

### Center Alignment with Flexbox

```html
<!-- Flexbox center (recommended modern approach) -->
<div class="d-flex justify-content-center">
    <img src="image.jpg" alt="Centered image">
</div>

<!-- Flexbox center with full height -->
<div class="d-flex justify-content-center align-items-center" style="height: 300px;">
    <img src="image.jpg" alt="Centered in container">
</div>
```

### Complete Center Alignment Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Centered Images</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container my-5">
        <h1 class="mb-5 text-center">Image Centering Methods</h1>
        
        <!-- Method 1: mx-auto + d-block -->
        <section class="mb-5">
            <h3 class="mb-3">Method 1: mx-auto + d-block</h3>
            <img src="https://via.placeholder.com/300/667eea/ffffff?text=Centered" 
                 class="mx-auto d-block rounded shadow" 
                 alt="Centered"
                 style="width: 300px; height: 300px; object-fit: cover;">
            <p class="text-center text-muted mt-3">Classes: .mx-auto .d-block</p>
        </section>
        
        <!-- Method 2: text-center -->
        <section class="mb-5">
            <h3 class="mb-3">Method 2: text-center</h3>
            <div class="text-center">
                <img src="https://via.placeholder.com/300/764ba2/ffffff?text=Text+Center" 
                     class="rounded shadow" 
                     alt="Text centered"
                     style="width: 300px; height: 300px; object-fit: cover;">
            </div>
            <p class="text-center text-muted mt-3">Container class: .text-center</p>
        </section>
        
        <!-- Method 3: Flexbox -->
        <section class="mb-5">
            <h3 class="mb-3">Method 3: Flexbox</h3>
            <div class="d-flex justify-content-center">
                <img src="https://via.placeholder.com/300/f093fb/ffffff?text=Flexbox" 
                     class="rounded shadow" 
                     alt="Flexbox centered"
                     style="width: 300px; height: 300px; object-fit: cover;">
            </div>
            <p class="text-center text-muted mt-3">Container classes: .d-flex .justify-content-center</p>
        </section>
        
        <!-- Method 4: Flexbox with vertical center -->
        <section class="mb-5">
            <h3 class="mb-3">Method 4: Flexbox (Center Both Ways)</h3>
            <div class="d-flex justify-content-center align-items-center rounded shadow" 
                 style="height: 300px; background: #f8f9fa;">
                <img src="https://via.placeholder.com/200/4facfe/ffffff?text=Both+Ways" 
                     class="rounded" 
                     alt="Both ways centered"
                     style="width: 200px; height: 200px; object-fit: cover;">
            </div>
            <p class="text-center text-muted mt-3">Container classes: .d-flex .justify-content-center .align-items-center</p>
        </section>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## Text-Based Alignment

### Text Alignment Classes

```html
<!-- Left align (default) -->
<div class="text-start">
    <img src="image.jpg" alt="Left aligned">
</div>

<!-- Center align -->
<div class="text-center">
    <img src="image.jpg" alt="Center aligned">
</div>

<!-- Right align -->
<div class="text-end">
    <img src="image.jpg" alt="Right aligned">
</div>

<!-- Justify -->
<div class="text-justify">
    <img src="image.jpg" alt="Justified">
</div>
```

### Responsive Text Alignment

```html
<!-- Different alignment at different breakpoints -->
<div class="text-center text-md-start text-lg-end">
    <img src="image.jpg" alt="Responsive alignment">
</div>

<!-- Mobile: centered
     Tablet (≥768px): left aligned
     Desktop (≥992px): right aligned
-->
```

---

## Flexbox Alignment (Recommended)

### Horizontal Alignment Only

```html
<!-- Center horizontally -->
<div class="d-flex justify-content-center">
    <img src="image.jpg" alt="Centered">
</div>

<!-- Align to start -->
<div class="d-flex justify-content-start">
    <img src="image.jpg" alt="Start aligned">
</div>

<!-- Align to end -->
<div class="d-flex justify-content-end">
    <img src="image.jpg" alt="End aligned">
</div>

<!-- Space between -->
<div class="d-flex justify-content-between">
    <img src="image.jpg" alt="Image 1">
    <img src="image.jpg" alt="Image 2">
</div>

<!-- Space around -->
<div class="d-flex justify-content-around">
    <img src="image.jpg" alt="Image 1">
    <img src="image.jpg" alt="Image 2">
    <img src="image.jpg" alt="Image 3">
</div>
```

### Vertical Alignment Only

```html
<!-- Container with height for vertical alignment -->
<div class="d-flex align-items-center" style="height: 300px;">
    <img src="image.jpg" alt="Vertically centered">
</div>

<!-- Align to top -->
<div class="d-flex align-items-start" style="height: 300px;">
    <img src="image.jpg" alt="Top aligned">
</div>

<!-- Align to bottom -->
<div class="d-flex align-items-end" style="height: 300px;">
    <img src="image.jpg" alt="Bottom aligned">
</div>
```

### Both Horizontal and Vertical Alignment

```html
<!-- Center both ways -->
<div class="d-flex justify-content-center align-items-center" style="height: 300px;">
    <img src="image.jpg" alt="Centered both ways">
</div>

<!-- Combinations -->
<div class="d-flex justify-content-end align-items-start" style="height: 300px;">
    <img src="image.jpg" alt="Top-right">
</div>

<div class="d-flex justify-content-start align-items-end" style="height: 300px;">
    <img src="image.jpg" alt="Bottom-left">
</div>
```

### Flexbox Alignment Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flexbox Alignment</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .flex-demo {
            background: #f8f9fa;
            border: 2px dashed #dee2e6;
            border-radius: 8px;
        }
        
        .flex-demo img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container my-5">
        <h1 class="mb-5 text-center">Flexbox Alignment Examples</h1>
        
        <div class="row">
            <!-- Horizontal Alignments -->
            <div class="col-12 col-md-6 mb-4">
                <h4>justify-content-start</h4>
                <div class="d-flex justify-content-start flex-demo p-3" style="height: 150px;">
                    <img src="https://via.placeholder.com/100/667eea/ffffff?text=1" alt="">
                </div>
            </div>
            
            <div class="col-12 col-md-6 mb-4">
                <h4>justify-content-center</h4>
                <div class="d-flex justify-content-center flex-demo p-3" style="height: 150px;">
                    <img src="https://via.placeholder.com/100/764ba2/ffffff?text=2" alt="">
                </div>
            </div>
            
            <div class="col-12 col-md-6 mb-4">
                <h4>justify-content-end</h4>
                <div class="d-flex justify-content-end flex-demo p-3" style="height: 150px;">
                    <img src="https://via.placeholder.com/100/f093fb/ffffff?text=3" alt="">
                </div>
            </div>
            
            <div class="col-12 col-md-6 mb-4">
                <h4>justify-content-around</h4>
                <div class="d-flex justify-content-around flex-demo p-3" style="height: 150px;">
                    <img src="https://via.placeholder.com/100/4facfe/ffffff?text=A" alt="">
                    <img src="https://via.placeholder.com/100/43e97b/ffffff?text=B" alt="">
                </div>
            </div>
            
            <!-- Vertical Alignments -->
            <div class="col-12 col-md-6 mb-4">
                <h4>align-items-start</h4>
                <div class="d-flex align-items-start flex-demo p-3" style="height: 150px;">
                    <img src="https://via.placeholder.com/100/667eea/ffffff?text=T" alt="">
                </div>
            </div>
            
            <div class="col-12 col-md-6 mb-4">
                <h4>align-items-center</h4>
                <div class="d-flex align-items-center flex-demo p-3" style="height: 150px;">
                    <img src="https://via.placeholder.com/100/764ba2/ffffff?text=M" alt="">
                </div>
            </div>
            
            <div class="col-12 col-md-6 mb-4">
                <h4>align-items-end</h4>
                <div class="d-flex align-items-end flex-demo p-3" style="height: 150px;">
                    <img src="https://via.placeholder.com/100/f093fb/ffffff?text=B" alt="">
                </div>
            </div>
            
            <!-- Combined -->
            <div class="col-12 mb-4">
                <h4>Center Both Ways</h4>
                <div class="d-flex justify-content-center align-items-center flex-demo p-3" style="height: 200px;">
                    <img src="https://via.placeholder.com/150/4facfe/ffffff?text=CENTER" alt="">
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## Multiple Images Alignment

### Aligning Multiple Images Horizontally

```html
<!-- Center multiple images -->
<div class="d-flex justify-content-center gap-3">
    <img src="image1.jpg" class="rounded" width="150" alt="Image 1">
    <img src="image2.jpg" class="rounded" width="150" alt="Image 2">
    <img src="image3.jpg" class="rounded" width="150" alt="Image 3">
</div>

<!-- Space between multiple images -->
<div class="d-flex justify-content-between">
    <img src="image1.jpg" width="150" alt="Image 1">
    <img src="image2.jpg" width="150" alt="Image 2">
    <img src="image3.jpg" width="150" alt="Image 3">
</div>

<!-- Space around multiple images -->
<div class="d-flex justify-content-around">
    <img src="image1.jpg" width="150" alt="Image 1">
    <img src="image2.jpg" width="150" alt="Image 2">
    <img src="image3.jpg" width="150" alt="Image 3">
</div>
```

### Grid Layout for Multiple Images

```html
<!-- Responsive grid gallery -->
<div class="row">
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
        <img src="image1.jpg" class="img-fluid rounded" alt="">
    </div>
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
        <img src="image2.jpg" class="img-fluid rounded" alt="">
    </div>
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
        <img src="image3.jpg" class="img-fluid rounded" alt="">
    </div>
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
        <img src="image4.jpg" class="img-fluid rounded" alt="">
    </div>
</div>
```

---

## Margin and Padding Utilities for Alignment

### Margin Auto (Centering)

```html
<!-- Center horizontally with margin auto -->
<img src="image.jpg" class="mx-auto d-block" alt="">

<!-- Center with custom width -->
<img src="image.jpg" class="mx-auto d-block" style="width: 300px;" alt="">
```

### Spacing Around Images

```html
<!-- Right margin (left align with space) -->
<img src="image.jpg" class="float-start me-3" alt="">

<!-- Left margin (right align with space) -->
<img src="image.jpg" class="float-end ms-3" alt="">

<!-- Spacing on all sides -->
<img src="image.jpg" class="m-3" alt="">

<!-- Top and bottom spacing -->
<img src="image.jpg" class="my-3" alt="">

<!-- Left and right spacing -->
<img src="image.jpg" class="mx-3" alt="">
```

### Gap Utility Between Multiple Images

```html
<!-- Gap between items (NEW in Bootstrap 5.3+) -->
<div class="d-flex gap-2">
    <img src="image1.jpg" width="100" alt="">
    <img src="image2.jpg" width="100" alt="">
    <img src="image3.jpg" width="100" alt="">
</div>

<!-- Different gap sizes -->
<div class="d-flex gap-1">Small gap</div>
<div class="d-flex gap-2">Medium gap</div>
<div class="d-flex gap-3">Large gap</div>
<div class="d-flex gap-4">Extra large gap</div>
<div class="d-flex gap-5">Largest gap</div>
```

---

## Responsive Image Alignment

### Mobile-First Responsive Alignment

```html
<!-- Different alignment at different breakpoints -->
<div class="text-center text-md-start text-lg-end">
    <img src="image.jpg" class="img-fluid" alt="">
</div>

<!-- Mobile: centered
     Tablet (≥768px): left aligned
     Desktop (≥992px): right aligned
-->
```

### Responsive Flexbox Alignment

```html
<!-- Responsive flex direction and alignment -->
<div class="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center">
    <img src="image1.jpg" width="150" alt="">
    <img src="image2.jpg" width="150" alt="">
</div>

<!-- Mobile: stacked vertically
     Tablet (≥768px): side by side with space between
-->
```

---

## Real-World Alignment Patterns

### Blog Post Layout

```html
<article class="row">
    <!-- Sidebar with featured image -->
    <aside class="col-12 col-lg-4">
        <img src="featured-image.jpg" class="img-fluid rounded shadow mb-3" alt="">
        <div class="card">
            <div class="card-body">
                <h5>Related Posts</h5>
            </div>
        </div>
    </aside>
    
    <!-- Main content -->
    <main class="col-12 col-lg-8">
        <h1>Article Title</h1>
        <img src="https://via.placeholder.com/200" class="float-start rounded me-3 mb-3" alt="">
        <p>Article content with image floated to the left...</p>
        <div class="clearfix"></div>
    </main>
</article>
```

### Product Page Layout

```html
<div class="row">
    <!-- Product image (left on desktop, top on mobile) -->
    <div class="col-12 col-md-6 d-flex justify-content-center align-items-center">
        <img src="product.jpg" class="img-fluid rounded shadow" alt="">
    </div>
    
    <!-- Product details (right on desktop, bottom on mobile) -->
    <div class="col-12 col-md-6">
        <h1>Product Name</h1>
        <p class="lead">Product description</p>
        <p>Price: $99.99</p>
        <button class="btn btn-primary">Add to Cart</button>
    </div>
</div>
```

### Team Members Grid

```html
<div class="row text-center">
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
        <img src="avatar1.jpg" class="rounded-circle border-3 border-primary" width="150" height="150" alt="">
        <h5 class="mt-3">John Doe</h5>
        <p class="text-muted">Product Manager</p>
    </div>
    
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
        <img src="avatar2.jpg" class="rounded-circle border-3 border-success" width="150" height="150" alt="">
        <h5 class="mt-3">Jane Smith</h5>
        <p class="text-muted">Senior Designer</p>
    </div>
    
    <!-- Repeat for more team members -->
</div>
```

### Hero Section with Image

```html
<div class="d-flex align-items-center" style="height: 400px; background: #f8f9fa;">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-12 col-md-6">
                <h1 class="display-4">Welcome</h1>
                <p class="lead">Your hero content here</p>
                <button class="btn btn-primary btn-lg">Get Started</button>
            </div>
            
            <div class="col-12 col-md-6 text-center">
                <img src="hero-image.jpg" class="img-fluid" alt="">
            </div>
        </div>
    </div>
</div>
```

---

## Complete Working Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Alignment - Bootstrap 5.3+</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .example-section {
            padding: 40px 0;
            border-bottom: 1px solid #e9ecef;
        }
        
        .align-demo-box {
            background: #f8f9fa;
            border: 2px dashed #dee2e6;
            border-radius: 8px;
            min-height: 200px;
        }
        
        .align-demo-box img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light sticky-top">
        <div class="container">
            <a class="navbar-brand fw-bold" href="#">Image Alignment</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item"><a class="nav-link" href="#float">Float</a></li>
                    <li class="nav-item"><a class="nav-link" href="#center">Center</a></li>
                    <li class="nav-item"><a class="nav-link" href="#flexbox">Flexbox</a></li>
                    <li class="nav-item"><a class="nav-link" href="#responsive">Responsive</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container my-5">
        <!-- Float Alignment Section -->
        <section class="example-section" id="float">
            <h2 class="mb-4">Float Alignment</h2>
            
            <!-- Left Float -->
            <div class="mb-4">
                <h4>Left Float (.float-start)</h4>
                <div class="align-demo-box p-3 d-flex align-items-center">
                    <img src="https://via.placeholder.com/150/667eea/ffffff?text=Float+Left" 
                         class="float-start rounded me-3" 
                         width="150" 
                         height="150" 
                         alt="">
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Text wraps around the floated image on the right side.</p>
                </div>
                <small class="text-muted mt-2 d-block">Note: Use .clearfix to clear float</small>
            </div>
            
            <!-- Right Float -->
            <div class="mb-4">
                <h4>Right Float (.float-end)</h4>
                <div class="align-demo-box p-3 d-flex align-items-center">
                    <p class="flex-grow-1 me-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Text wraps around the floated image on the left side.</p>
                    <img src="https://via.placeholder.com/150/764ba2/ffffff?text=Float+Right" 
                         class="float-end rounded" 
                         width="150" 
                         height="150" 
                         alt="">
                </div>
            </div>
        </section>

        <!-- Center Alignment Section -->
        <section class="example-section" id="center">
            <h2 class="mb-4">Center Alignment</h2>
            
            <!-- Method 1 -->
            <div class="mb-4">
                <h4>Method 1: .mx-auto .d-block</h4>
                <div class="align-demo-box p-3 d-flex justify-content-center align-items-center">
                    <img src="https://via.placeholder.com/150/f093fb/ffffff?text=Method+1" 
                         class="mx-auto d-block rounded" 
                         width="150" 
                         height="150" 
                         alt="">
                </div>
            </div>
            
            <!-- Method 2 -->
            <div class="mb-4">
                <h4>Method 2: .text-center</h4>
                <div class="align-demo-box p-3 text-center">
                    <img src="https://via.placeholder.com/150/4facfe/ffffff?text=Method+2" 
                         class="rounded" 
                         width="150" 
                         height="150" 
                         alt="">
                </div>
            </div>
            
            <!-- Method 3 -->
            <div class="mb-4">
                <h4>Method 3: .d-flex .justify-content-center</h4>
                <div class="align-demo-box p-3 d-flex justify-content-center align-items-center">
                    <img src="https://via.placeholder.com/150/43e97b/ffffff?text=Method+3" 
                         class="rounded" 
                         width="150" 
                         height="150" 
                         alt="">
                </div>
            </div>
        </section>

        <!-- Flexbox Alignment Section -->
        <section class="example-section" id="flexbox">
            <h2 class="mb-4">Flexbox Alignment</h2>
            
            <!-- Horizontal -->
            <div class="mb-4">
                <h4>Horizontal: justify-content-center</h4>
                <div class="align-demo-box p-3 d-flex justify-content-center">
                    <img src="https://via.placeholder.com/120/667eea/ffffff?text=1" 
                         class="rounded me-2" 
                         width="120" 
                         height="120" 
                         alt="">
                    <img src="https://via.placeholder.com/120/764ba2/ffffff?text=2" 
                         class="rounded mx-2" 
                         width="120" 
                         height="120" 
                         alt="">
                    <img src="https://via.placeholder.com/120/f093fb/ffffff?text=3" 
                         class="rounded ms-2" 
                         width="120" 
                         height="120" 
                         alt="">
                </div>
            </div>
            
            <!-- Vertical -->
            <div class="mb-4">
                <h4>Vertical: align-items-center</h4>
                <div class="align-demo-box p-3 d-flex align-items-center" style="height: 200px;">
                    <img src="https://via.placeholder.com/150/4facfe/ffffff?text=Centered" 
                         class="rounded mx-auto" 
                         width="150" 
                         height="150" 
                         alt="">
                </div>
            </div>
            
            <!-- Both -->
            <div class="mb-4">
                <h4>Both: justify-content-center align-items-center</h4>
                <div class="align-demo-box p-3 d-flex justify-content-center align-items-center" style="height: 250px;">
                    <img src="https://via.placeholder.com/180/43e97b/ffffff?text=Both" 
                         class="rounded shadow" 
                         width="180" 
                         height="180" 
                         alt="">
                </div>
            </div>
        </section>

        <!-- Responsive Alignment Section -->
        <section class="example-section" id="responsive">
            <h2 class="mb-4">Responsive Alignment</h2>
            
            <div class="mb-4">
                <h4>Mobile: Stacked | Desktop: Side-by-Side</h4>
                <div class="row align-items-center">
                    <div class="col-12 col-md-6 d-flex justify-content-center mb-3 mb-md-0">
                        <img src="https://via.placeholder.com/200/667eea/ffffff?text=Image+1" 
                             class="rounded shadow" 
                             width="200" 
                             height="200" 
                             alt="">
                    </div>
                    <div class="col-12 col-md-6">
                        <h5>Responsive Content</h5>
                        <p>Images stack on mobile and arrange side-by-side on larger screens using Bootstrap grid.</p>
                    </div>
                </div>
            </div>
            
            <div class="mb-4">
                <h4>Text Alignment Changes per Breakpoint</h4>
                <div class="text-center text-md-start text-lg-end">
                    <img src="https://via.placeholder.com/150/764ba2/ffffff?text=Responsive" 
                         class="rounded shadow" 
                         width="150" 
                         height="150" 
                         alt="">
                    <p class="mt-2">Mobile: Centered | Tablet: Left | Desktop: Right</p>
                </div>
            </div>
        </section>
    </div>

    <!-- Footer -->
    <footer class="bg-light py-4 mt-5">
        <div class="container text-center text-muted">
            <p>&copy; 2024 Bootstrap 5.3+ Image Alignment. All rights reserved.</p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## Alignment Classes Reference

### Display Classes

| Class | Purpose |
|-------|---------|
| `.d-block` | Display as block |
| `.d-inline` | Display inline |
| `.d-inline-block` | Display inline-block |
| `.d-flex` | Display flex |
| `.d-grid` | Display grid |
| `.d-none` | Display none |

### Float Classes

| Class | Purpose |
|-------|---------|
| `.float-start` | Float left |
| `.float-end` | Float right |
| `.float-none` | No float |

### Text Alignment Classes

| Class | Purpose |
|-------|---------|
| `.text-start` | Left align text |
| `.text-center` | Center text |
| `.text-end` | Right align text |
| `.text-justify` | Justify text |

### Flexbox Alignment Classes

| Class | Purpose |
|-------|---------|
| `.justify-content-start` | Flex items to start |
| `.justify-content-center` | Flex items center |
| `.justify-content-end` | Flex items to end |
| `.justify-content-between` | Flex items space between |
| `.justify-content-around` | Flex items space around |
| `.align-items-start` | Align items to start |
| `.align-items-center` | Align items center |
| `.align-items-end` | Align items to end |

### Margin Classes for Alignment

| Class | Purpose |
|-------|---------|
| `.mx-auto` | Margin left/right auto (center) |
| `.me-*` | Margin end (right) |
| `.ms-*` | Margin start (left) |
| `.mt-*` | Margin top |
| `.mb-*` | Margin bottom |

---

## Bootstrap 5.3+ Improvements vs Bootstrap 4

| Feature | Bootstrap 4 | Bootstrap 5.3+ |
|---------|-----------|----------------|
| Float classes | ✅ Yes | ✅ Yes |
| Text alignment | ✅ Yes | ✅ Yes |
| Flexbox utilities | Limited | ✅ Enhanced |
| Gap utility | ❌ No | ✅ Yes |
| CSS Variables | ❌ No | ✅ Yes |
| Responsive variants | ✅ Limited | ✅ More |
| Dark mode | ❌ No | ✅ Yes |

---

## Best Practices

### DO's ✅

✅ **Use flexbox for modern layouts**
```html
<div class="d-flex justify-content-center align-items-center">
    <img src="image.jpg" alt="">
</div>
```

✅ **Combine with responsive utilities**
```html
<div class="d-flex justify-content-center justify-content-md-start">
    <img src="image.jpg" alt="">
</div>
```

✅ **Use margin utilities for spacing**
```html
<img src="image.jpg" class="me-3 ms-3" alt="">
```

✅ **Test on multiple devices**

✅ **Include alt text for accessibility**

### DON'Ts ❌

❌ **Don't use float for layouts anymore**
- Flexbox and Grid are modern alternatives
- Float is legacy approach

❌ **Don't forget clearfix when using floats**
```html
<div class="clearfix"></div>
```

❌ **Don't use inline styles excessively**
```html
<!-- Bad -->
<img style="margin: 10px;" alt="">

<!-- Good -->
<img class="m-2" alt="">
```

---

## Quick Reference Cheat Sheet

### Center Image Horizontally
```html
<img src="image.jpg" class="mx-auto d-block" alt="">
<!-- or -->
<div class="text-center">
    <img src="image.jpg" alt="">
</div>
<!-- or -->
<div class="d-flex justify-content-center">
    <img src="image.jpg" alt="">
</div>
```

### Center Image Both Ways
```html
<div class="d-flex justify-content-center align-items-center" style="height: 300px;">
    <img src="image.jpg" alt="">
</div>
```

### Left Align with Text Wrap
```html
<img src="image.jpg" class="float-start rounded me-3" alt="">
<p>Text wraps around image...</p>
<div class="clearfix"></div>
```

### Right Align with Text Wrap
```html
<img src="image.jpg" class="float-end rounded ms-3" alt="">
<p>Text wraps around image...</p>
<div class="clearfix"></div>
```

### Responsive Alignment
```html
<div class="text-center text-md-start text-lg-end">
    <img src="image.jpg" alt="">
</div>
```

---

## Resources

### Official Documentation
- **Bootstrap Images**: https://getbootstrap.com/docs/5.3/content/images/
- **Bootstrap Utilities**: https://getbootstrap.com/docs/5.3/utilities/
- **Bootstrap Flexbox**: https://getbootstrap.com/docs/5.3/utilities/flex/

### CDN Links (Bootstrap 5.3.2)

**CSS:**
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
```

**JavaScript:**
```html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
```

---

## Summary

### Key Image Alignment Methods

1. **Float Classes** - `.float-start`, `.float-end`
   - Text wraps around image
   - Use `.clearfix` to clear

2. **Center with Margin** - `.mx-auto .d-block`
   - Simple horizontal center
   - Requires block display

3. **Text Alignment** - `.text-center`, `.text-start`, `.text-end`
   - Works for inline elements
   - Container-based approach

4. **Flexbox** - `.d-flex .justify-content-center .align-items-center`
   - Most powerful and flexible
   - Recommended modern approach
   - Works for both horizontal and vertical

5. **Grid** - Bootstrap grid system with columns
   - Best for complex layouts
   - Responsive by default
   - Combines text and images

### When to Use Each Method

| Method | Best For |
|--------|----------|
| Float | Text wrapping around images |
| Margin Auto | Simple horizontal center |
| Text Center | Single centered images |
| Flexbox | Precise alignment both ways |
| Grid | Complex multi-column layouts |

Master these alignment techniques to create professional, responsive layouts with images in Bootstrap 5.3+!