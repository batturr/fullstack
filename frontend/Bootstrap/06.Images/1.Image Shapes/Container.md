# BOOTSTRAP 5.3+ IMAGE SHAPES AND STYLING

## Overview

Bootstrap provides several image styling classes to shape and style images for better presentation. These utilities allow you to create rounded corners, circular images, bordered thumbnails, and other effects. Bootstrap's image classes work seamlessly with responsive design, making images adaptable to different screen sizes.

### Key Features
- **Rounded corners** - `.rounded`, `.rounded-lg`, `.rounded-xl`
- **Circular images** - `.rounded-circle`
- **Thumbnails** - `.img-thumbnail`
- **Responsive images** - `.img-fluid`
- **Responsive aspects** - `.ratio`, `.object-fit`
- **NEW in Bootstrap 5.3+** - Enhanced utilities, CSS variables, improved sizing
- **Dark mode support** - Automatic theme adjustments
- **Accessibility** - Proper alt text and semantic usage
- **Alignment classes** - Center, float, flex alignment

---

## Basic Image Classes Reference

### 1. Image Shapes Classes

| Class | Purpose | Effect |
|-------|---------|--------|
| `.rounded` | Rounded corners | Default border-radius (0.25rem) |
| `.rounded-1` | Slight rounding | Smaller border-radius (0.125rem) |
| `.rounded-2` | More rounding | Medium border-radius (0.25rem) |
| `.rounded-3` | Extra rounding | Large border-radius (0.375rem) |
| `.rounded-lg` | Large rounding | Large border-radius (0.5rem) |
| `.rounded-xl` | XL rounding | Extra large border-radius (0.75rem) |
| `.rounded-xxl` | XXL rounding | Largest border-radius (1rem) |
| `.rounded-circle` | Perfect circle | 50% border-radius |
| `.rounded-pill` | Pill-shaped | Full border-radius |
| `.img-thumbnail` | Bordered box | Border + padding + rounded |

### 2. Responsive Image Classes

| Class | Purpose | Effect |
|-------|---------|--------|
| `.img-fluid` | Responsive scaling | max-width: 100%; height: auto |
| `.img-responsive` | Older version | Use `.img-fluid` instead |
| `.mw-100` | Max width 100% | Ensures max-width: 100% |
| `.mh-100` | Max height 100% | Ensures max-height: 100% |

### 3. Alignment Classes

| Class | Purpose | Effect |
|-------|---------|--------|
| `.d-block` | Block display | Displays as block |
| `.mx-auto` | Horizontal center | Auto margin left/right |
| `.float-start` | Float left | Float to left side |
| `.float-end` | Float right | Float to right side |
| `.text-center` | Center text | Centers text and inline elements |

---

## Rounded Corners - `.rounded` Class Family

### Basic Rounded Corners

```html
<!-- Default rounded corners -->
<img src="image.jpg" class="rounded" alt="Rounded image">
```

**CSS Equivalent:**
```css
.rounded {
    border-radius: 0.25rem;
}
```

### All Rounded Variations

```html
<!-- Very slight rounding -->
<img src="image.jpg" class="rounded-1" alt="Slightly rounded">

<!-- Default rounded -->
<img src="image.jpg" class="rounded-2" alt="Default rounded">

<!-- Extra rounded -->
<img src="image.jpg" class="rounded-3" alt="Extra rounded">

<!-- Large rounded -->
<img src="image.jpg" class="rounded-lg" alt="Large rounded">

<!-- Extra large rounded -->
<img src="image.jpg" class="rounded-xl" alt="XL rounded">

<!-- XXL rounded -->
<img src="image.jpg" class="rounded-xxl" alt="XXL rounded">

<!-- Pill-shaped (max rounding) -->
<img src="image.jpg" class="rounded-pill" alt="Pill-shaped">
```

### Complete Rounded Corners Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rounded Corners - Bootstrap 5.3+</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .image-container {
            margin: 20px;
        }
        
        img {
            width: 200px;
            height: 200px;
            object-fit: cover;
            margin: 10px;
        }
        
        .border-example {
            border: 2px solid #e9ecef;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container my-5">
        <h1 class="mb-4">Rounded Corners Variations</h1>
        
        <div class="row">
            <div class="col-12 col-md-6 col-lg-4">
                <div class="border-example text-center">
                    <h6 class="mb-3">.rounded-1</h6>
                    <img src="image.jpg" class="rounded-1" alt="Slightly rounded">
                </div>
            </div>
            
            <div class="col-12 col-md-6 col-lg-4">
                <div class="border-example text-center">
                    <h6 class="mb-3">.rounded-2</h6>
                    <img src="image.jpg" class="rounded-2" alt="Default rounded">
                </div>
            </div>
            
            <div class="col-12 col-md-6 col-lg-4">
                <div class="border-example text-center">
                    <h6 class="mb-3">.rounded-3</h6>
                    <img src="image.jpg" class="rounded-3" alt="Extra rounded">
                </div>
            </div>
            
            <div class="col-12 col-md-6 col-lg-4">
                <div class="border-example text-center">
                    <h6 class="mb-3">.rounded-lg</h6>
                    <img src="image.jpg" class="rounded-lg" alt="Large rounded">
                </div>
            </div>
            
            <div class="col-12 col-md-6 col-lg-4">
                <div class="border-example text-center">
                    <h6 class="mb-3">.rounded-xl</h6>
                    <img src="image.jpg" class="rounded-xl" alt="XL rounded">
                </div>
            </div>
            
            <div class="col-12 col-md-6 col-lg-4">
                <div class="border-example text-center">
                    <h6 class="mb-3">.rounded-pill</h6>
                    <img src="image.jpg" class="rounded-pill" alt="Pill-shaped">
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## Circular Images - `.rounded-circle` Class

### Basic Circular Image

```html
<!-- Perfect circle image -->
<img src="avatar.jpg" class="rounded-circle" alt="Circular image" width="200px" height="200px">
```

**Important:** For `.rounded-circle` to work properly, the image must be:
- Square dimensions (width = height)
- Specified dimensions (using width/height attributes or CSS)

### Circular Avatar Variations

```html
<!-- Extra small avatar (24px) -->
<img src="avatar.jpg" class="rounded-circle" width="24" height="24" alt="Avatar XS">

<!-- Small avatar (48px) -->
<img src="avatar.jpg" class="rounded-circle" width="48" height="48" alt="Avatar SM">

<!-- Medium avatar (64px) -->
<img src="avatar.jpg" class="rounded-circle" width="64" height="64" alt="Avatar MD">

<!-- Large avatar (96px) -->
<img src="avatar.jpg" class="rounded-circle" width="96" height="96" alt="Avatar LG">

<!-- Extra large avatar (128px) -->
<img src="avatar.jpg" class="rounded-circle" width="128" height="128" alt="Avatar XL">
```

### Circular Image with Border

```html
<!-- Circular image with border -->
<img src="avatar.jpg" 
     class="rounded-circle border-3 border-primary" 
     width="150" 
     height="150" 
     alt="Avatar with border">

<!-- Circular image with shadow -->
<img src="avatar.jpg" 
     class="rounded-circle shadow-lg" 
     width="150" 
     height="150" 
     alt="Avatar with shadow">

<!-- Circular image with both -->
<img src="avatar.jpg" 
     class="rounded-circle border-3 border-success shadow" 
     width="150" 
     height="150" 
     alt="Avatar with border and shadow">
```

### Circular Images Gallery Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Circular Images - Bootstrap 5.3+</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .avatar-card {
            text-align: center;
            padding: 20px;
        }
        
        .avatar-card h6 {
            margin-top: 15px;
            font-weight: 600;
        }
        
        .avatar-card p {
            color: #6c757d;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container my-5">
        <h1 class="mb-5 text-center">Team Members</h1>
        
        <div class="row">
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                <div class="avatar-card">
                    <img src="https://via.placeholder.com/150/667eea/ffffff?text=JD" 
                         class="rounded-circle border-3 border-primary" 
                         width="150" 
                         height="150" 
                         alt="John Doe">
                    <h6>John Doe</h6>
                    <p>Product Manager</p>
                </div>
            </div>
            
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                <div class="avatar-card">
                    <img src="https://via.placeholder.com/150/764ba2/ffffff?text=JS" 
                         class="rounded-circle border-3 border-success" 
                         width="150" 
                         height="150" 
                         alt="Jane Smith">
                    <h6>Jane Smith</h6>
                    <p>Senior Designer</p>
                </div>
            </div>
            
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                <div class="avatar-card">
                    <img src="https://via.placeholder.com/150/f093fb/ffffff?text=MW" 
                         class="rounded-circle border-3 border-danger" 
                         width="150" 
                         height="150" 
                         alt="Mike Wilson">
                    <h6>Mike Wilson</h6>
                    <p>Lead Developer</p>
                </div>
            </div>
            
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                <div class="avatar-card">
                    <img src="https://via.placeholder.com/150/4facfe/ffffff?text=SJ" 
                         class="rounded-circle border-3 border-warning" 
                         width="150" 
                         height="150" 
                         alt="Sarah Johnson">
                    <h6>Sarah Johnson</h6>
                    <p>QA Engineer</p>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## Image Thumbnails - `.img-thumbnail` Class

### Basic Thumbnail

```html
<!-- Simple thumbnail -->
<img src="image.jpg" class="img-thumbnail" alt="Thumbnail image">
```

**CSS Equivalent:**
```css
.img-thumbnail {
    padding: 0.25rem;
    background-color: #fff;
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
    max-width: 100%;
    height: auto;
}
```

### Thumbnail Sizing

```html
<!-- Small thumbnail -->
<img src="image.jpg" class="img-thumbnail" width="100" height="100" alt="Small">

<!-- Medium thumbnail -->
<img src="image.jpg" class="img-thumbnail" width="200" height="200" alt="Medium">

<!-- Large thumbnail -->
<img src="image.jpg" class="img-thumbnail" width="300" height="300" alt="Large">

<!-- Full responsive thumbnail -->
<img src="image.jpg" class="img-thumbnail img-fluid" alt="Responsive">
```

### Thumbnail Gallery Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Thumbnails - Bootstrap 5.3+</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .thumbnail-wrapper {
            padding: 10px;
        }
        
        .img-thumbnail {
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .img-thumbnail:hover {
            transform: scale(1.05);
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }
    </style>
</head>
<body>
    <div class="container my-5">
        <h1 class="mb-4">Image Gallery Thumbnails</h1>
        
        <div class="row">
            <div class="col-12 col-sm-6 col-md-4 col-lg-3 thumbnail-wrapper">
                <img src="https://via.placeholder.com/250/667eea/ffffff?text=Image+1" 
                     class="img-thumbnail w-100" 
                     alt="Gallery 1">
            </div>
            
            <div class="col-12 col-sm-6 col-md-4 col-lg-3 thumbnail-wrapper">
                <img src="https://via.placeholder.com/250/764ba2/ffffff?text=Image+2" 
                     class="img-thumbnail w-100" 
                     alt="Gallery 2">
            </div>
            
            <div class="col-12 col-sm-6 col-md-4 col-lg-3 thumbnail-wrapper">
                <img src="https://via.placeholder.com/250/f093fb/ffffff?text=Image+3" 
                     class="img-thumbnail w-100" 
                     alt="Gallery 3">
            </div>
            
            <div class="col-12 col-sm-6 col-md-4 col-lg-3 thumbnail-wrapper">
                <img src="https://via.placeholder.com/250/4facfe/ffffff?text=Image+4" 
                     class="img-thumbnail w-100" 
                     alt="Gallery 4">
            </div>
            
            <div class="col-12 col-sm-6 col-md-4 col-lg-3 thumbnail-wrapper">
                <img src="https://via.placeholder.com/250/43e97b/ffffff?text=Image+5" 
                     class="img-thumbnail w-100" 
                     alt="Gallery 5">
            </div>
            
            <div class="col-12 col-sm-6 col-md-4 col-lg-3 thumbnail-wrapper">
                <img src="https://via.placeholder.com/250/fa709a/ffffff?text=Image+6" 
                     class="img-thumbnail w-100" 
                     alt="Gallery 6">
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## Responsive Images - `.img-fluid` Class

### Basic Responsive Image

```html
<!-- Image that scales with parent -->
<img src="large-image.jpg" class="img-fluid" alt="Responsive image">
```

**CSS Equivalent:**
```css
.img-fluid {
    max-width: 100%;
    height: auto;
}
```

### Responsive Images in Containers

```html
<!-- Full width container -->
<div class="container-fluid">
    <img src="image.jpg" class="img-fluid" alt="Full width">
</div>

<!-- Fixed width container -->
<div class="container">
    <img src="image.jpg" class="img-fluid" alt="Fixed width">
</div>

<!-- Custom width -->
<div style="width: 50%;">
    <img src="image.jpg" class="img-fluid" alt="50% width">
</div>
```

### Responsive Image with Caption

```html
<figure class="figure">
    <img src="image.jpg" class="figure-img img-fluid rounded" alt="Figure image">
    <figcaption class="figure-caption">Figure caption goes here</figcaption>
</figure>

<!-- Centered caption -->
<figure class="figure text-center">
    <img src="image.jpg" class="figure-img img-fluid rounded" alt="Figure image">
    <figcaption class="figure-caption">Centered caption</figcaption>
</figure>
```

---

## Image Ratio and Object-Fit

### Image Ratio Classes (NEW in Bootstrap 5.3+)

```html
<!-- 16x9 aspect ratio -->
<div class="ratio ratio-16x9">
    <img src="image.jpg" class="img-fluid" alt="16x9">
</div>

<!-- 4x3 aspect ratio -->
<div class="ratio ratio-4x3">
    <img src="image.jpg" alt="4x3">
</div>

<!-- 1x1 aspect ratio (square) -->
<div class="ratio ratio-1x1">
    <img src="image.jpg" alt="Square">
</div>

<!-- 21x9 aspect ratio (cinema) -->
<div class="ratio ratio-21x9">
    <img src="image.jpg" alt="21x9">
</div>
```

### Object-Fit Property

```html
<!-- Fill entire container -->
<div class="ratio ratio-1x1">
    <img src="image.jpg" class="object-fit-cover" alt="Cover">
</div>

<!-- Contain within container -->
<div class="ratio ratio-1x1">
    <img src="image.jpg" class="object-fit-contain" alt="Contain">
</div>

<!-- Stretch to fill -->
<div class="ratio ratio-1x1">
    <img src="image.jpg" class="object-fit-fill" alt="Fill">
</div>

<!-- Scale down -->
<div class="ratio ratio-1x1">
    <img src="image.jpg" class="object-fit-scale-down" alt="Scale down">
</div>
```

### Complete Responsive Image Gallery

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Responsive Images - Bootstrap 5.3+</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .gallery-item {
            margin-bottom: 30px;
        }
        
        .ratio {
            overflow: hidden;
            border-radius: 8px;
        }
        
        img {
            transition: transform 0.3s ease;
        }
        
        .gallery-item:hover img {
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <div class="container my-5">
        <h1 class="mb-5">Responsive Image Gallery</h1>
        
        <div class="row">
            <!-- 16x9 Gallery -->
            <div class="col-12 col-md-6 col-lg-4 gallery-item">
                <h5 class="mb-3">16x9 Ratio (Videos)</h5>
                <div class="ratio ratio-16x9">
                    <img src="https://via.placeholder.com/800x450/667eea/ffffff?text=16x9" 
                         class="img-fluid object-fit-cover" 
                         alt="16x9">
                </div>
            </div>
            
            <!-- 4x3 Gallery -->
            <div class="col-12 col-md-6 col-lg-4 gallery-item">
                <h5 class="mb-3">4x3 Ratio (Photos)</h5>
                <div class="ratio ratio-4x3">
                    <img src="https://via.placeholder.com/800x600/764ba2/ffffff?text=4x3" 
                         class="img-fluid object-fit-cover" 
                         alt="4x3">
                </div>
            </div>
            
            <!-- 1x1 Gallery -->
            <div class="col-12 col-md-6 col-lg-4 gallery-item">
                <h5 class="mb-3">1x1 Ratio (Square)</h5>
                <div class="ratio ratio-1x1">
                    <img src="https://via.placeholder.com/500x500/f093fb/ffffff?text=1x1" 
                         class="img-fluid object-fit-cover" 
                         alt="1x1">
                </div>
            </div>
            
            <!-- 21x9 Gallery -->
            <div class="col-12 gallery-item">
                <h5 class="mb-3">21x9 Ratio (Cinema/Hero)</h5>
                <div class="ratio ratio-21x9">
                    <img src="https://via.placeholder.com/1400x600/4facfe/ffffff?text=21x9" 
                         class="img-fluid object-fit-cover" 
                         alt="21x9">
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## Image Alignment

### Alignment Utilities

```html
<!-- Block display (default) -->
<img src="image.jpg" class="d-block" alt="Block">

<!-- Center image (inline) -->
<img src="image.jpg" class="mx-auto d-block" alt="Centered">

<!-- Float left -->
<img src="image.jpg" class="float-start" alt="Float left">

<!-- Float right -->
<img src="image.jpg" class="float-end" alt="Float right">

<!-- Text-center (for inline images) -->
<div class="text-center">
    <img src="image.jpg" alt="Centered inline">
</div>
```

### Alignment Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Alignment - Bootstrap 5.3+</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container my-5">
        <h1 class="mb-5">Image Alignment Examples</h1>
        
        <!-- Left Aligned -->
        <div class="mb-5">
            <h3>Left Aligned</h3>
            <img src="https://via.placeholder.com/200/667eea/ffffff?text=Left" 
                 class="rounded float-start me-3" 
                 alt="Left aligned">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
            <div class="clearfix"></div>
        </div>
        
        <!-- Right Aligned -->
        <div class="mb-5">
            <h3>Right Aligned</h3>
            <img src="https://via.placeholder.com/200/764ba2/ffffff?text=Right" 
                 class="rounded float-end ms-3" 
                 alt="Right aligned">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
            <div class="clearfix"></div>
        </div>
        
        <!-- Center Aligned -->
        <div class="mb-5">
            <h3>Center Aligned</h3>
            <div class="text-center">
                <img src="https://via.placeholder.com/200/f093fb/ffffff?text=Center" 
                     class="rounded" 
                     alt="Center aligned">
            </div>
            <p class="text-center">Centered image with centered text</p>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## Image Effects and Styling

### Image with Borders

```html
<!-- Simple border -->
<img src="image.jpg" class="border" alt="Bordered">

<!-- Colored borders -->
<img src="image.jpg" class="border border-primary" alt="Primary border">
<img src="image.jpg" class="border border-success" alt="Success border">
<img src="image.jpg" class="border border-danger" alt="Danger border">

<!-- Border widths -->
<img src="image.jpg" class="border border-1" alt="Thin border">
<img src="image.jpg" class="border border-3" alt="Medium border">
<img src="image.jpg" class="border border-5" alt="Thick border">
```

### Image with Shadows

```html
<!-- Soft shadow -->
<img src="image.jpg" class="shadow-sm" alt="Small shadow">

<!-- Regular shadow -->
<img src="image.jpg" class="shadow" alt="Regular shadow">

<!-- Large shadow -->
<img src="image.jpg" class="shadow-lg" alt="Large shadow">
```

### Image with Opacity

```html
<!-- 25% opacity -->
<img src="image.jpg" class="opacity-25" alt="25% opacity">

<!-- 50% opacity -->
<img src="image.jpg" class="opacity-50" alt="50% opacity">

<!-- 75% opacity -->
<img src="image.jpg" class="opacity-75" alt="75% opacity">

<!-- 100% opacity (default) -->
<img src="image.jpg" class="opacity-100" alt="100% opacity">
```

---

## Combined Effects Examples

### Avatar Profile Card

```html
<div class="card text-center" style="width: 300px;">
    <div class="card-body pt-4">
        <img src="avatar.jpg" 
             class="rounded-circle border-4 border-primary mb-3" 
             width="120" 
             height="120" 
             alt="Profile">
        <h5 class="card-title">John Doe</h5>
        <p class="card-text text-muted">Web Developer</p>
        <p class="small text-muted">john@example.com</p>
        
        <div class="d-grid gap-2">
            <button class="btn btn-primary">Follow</button>
            <button class="btn btn-outline-secondary">Message</button>
        </div>
    </div>
</div>
```

### Product Card with Image

```html
<div class="card" style="width: 250px;">
    <div class="ratio ratio-1x1">
        <img src="product.jpg" 
             class="card-img-top object-fit-cover" 
             alt="Product">
    </div>
    
    <div class="card-body">
        <h5 class="card-title">Product Name</h5>
        <p class="card-text text-muted">Product description here</p>
        <div class="d-flex justify-content-between align-items-center">
            <span class="h5 mb-0 text-primary">$99.99</span>
            <button class="btn btn-sm btn-primary">Add to Cart</button>
        </div>
    </div>
</div>
```

### Blog Post with Featured Image

```html
<article class="mb-5">
    <img src="featured-image.jpg" 
         class="img-fluid rounded-lg shadow mb-4" 
         alt="Featured image">
    
    <h2>Article Title</h2>
    <small class="text-muted">Published on January 29, 2024 by John Doe</small>
    
    <p class="mt-3">Article content goes here...</p>
    
    <a href="#" class="btn btn-primary">Read More</a>
</article>
```

---

## Responsive Image Example (Complete)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Shapes - Bootstrap 5.3+</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .example-section {
            padding: 40px 0;
            border-bottom: 1px solid #e9ecef;
        }
        
        .image-showcase {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .image-box {
            text-align: center;
            padding: 15px;
        }
        
        .image-box img {
            width: 150px;
            height: 150px;
            object-fit: cover;
            margin-bottom: 10px;
        }
        
        .image-box small {
            display: block;
            margin-top: 10px;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light sticky-top">
        <div class="container">
            <a class="navbar-brand fw-bold" href="#">Image Shapes</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item"><a class="nav-link" href="#rounded">Rounded</a></li>
                    <li class="nav-item"><a class="nav-link" href="#circle">Circle</a></li>
                    <li class="nav-item"><a class="nav-link" href="#thumbnail">Thumbnail</a></li>
                    <li class="nav-item"><a class="nav-link" href="#responsive">Responsive</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container my-5">
        <!-- Rounded Section -->
        <section class="example-section" id="rounded">
            <h2 class="mb-4">Rounded Corners</h2>
            
            <div class="image-showcase">
                <div class="image-box">
                    <img src="https://via.placeholder.com/150/667eea/ffffff?text=Default" 
                         class="rounded" 
                         alt="Default rounded">
                    <small>.rounded</small>
                </div>
                
                <div class="image-box">
                    <img src="https://via.placeholder.com/150/764ba2/ffffff?text=LG" 
                         class="rounded-lg" 
                         alt="Large rounded">
                    <small>.rounded-lg</small>
                </div>
                
                <div class="image-box">
                    <img src="https://via.placeholder.com/150/f093fb/ffffff?text=XL" 
                         class="rounded-xl" 
                         alt="XL rounded">
                    <small>.rounded-xl</small>
                </div>
                
                <div class="image-box">
                    <img src="https://via.placeholder.com/150/4facfe/ffffff?text=Pill" 
                         class="rounded-pill" 
                         alt="Pill shaped">
                    <small>.rounded-pill</small>
                </div>
            </div>
        </section>

        <!-- Circular Section -->
        <section class="example-section" id="circle">
            <h2 class="mb-4">Circular Images</h2>
            
            <div class="row">
                <div class="col-12 col-sm-6 col-md-3 text-center mb-4">
                    <img src="https://via.placeholder.com/100/667eea/ffffff?text=XS" 
                         class="rounded-circle" 
                         width="100" 
                         height="100" 
                         alt="Small">
                    <small class="d-block mt-2">Small (100px)</small>
                </div>
                
                <div class="col-12 col-sm-6 col-md-3 text-center mb-4">
                    <img src="https://via.placeholder.com/150/764ba2/ffffff?text=MD" 
                         class="rounded-circle border-3 border-primary" 
                         width="150" 
                         height="150" 
                         alt="Medium">
                    <small class="d-block mt-2">Medium with border</small>
                </div>
                
                <div class="col-12 col-sm-6 col-md-3 text-center mb-4">
                    <img src="https://via.placeholder.com/150/f093fb/ffffff?text=LG" 
                         class="rounded-circle shadow" 
                         width="150" 
                         height="150" 
                         alt="Large">
                    <small class="d-block mt-2">Large with shadow</small>
                </div>
                
                <div class="col-12 col-sm-6 col-md-3 text-center mb-4">
                    <img src="https://via.placeholder.com/150/4facfe/ffffff?text=XL" 
                         class="rounded-circle border-3 border-success shadow-lg" 
                         width="150" 
                         height="150" 
                         alt="XL">
                    <small class="d-block mt-2">XL with border & shadow</small>
                </div>
            </div>
        </section>

        <!-- Thumbnail Section -->
        <section class="example-section" id="thumbnail">
            <h2 class="mb-4">Image Thumbnails</h2>
            
            <div class="row">
                <div class="col-12 col-sm-6 col-md-4 mb-4">
                    <img src="https://via.placeholder.com/300/667eea/ffffff?text=Gallery+1" 
                         class="img-thumbnail w-100" 
                         alt="Gallery 1">
                </div>
                
                <div class="col-12 col-sm-6 col-md-4 mb-4">
                    <img src="https://via.placeholder.com/300/764ba2/ffffff?text=Gallery+2" 
                         class="img-thumbnail w-100" 
                         alt="Gallery 2">
                </div>
                
                <div class="col-12 col-sm-6 col-md-4 mb-4">
                    <img src="https://via.placeholder.com/300/f093fb/ffffff?text=Gallery+3" 
                         class="img-thumbnail w-100" 
                         alt="Gallery 3">
                </div>
            </div>
        </section>

        <!-- Responsive Section -->
        <section class="example-section" id="responsive">
            <h2 class="mb-4">Responsive Images</h2>
            
            <div class="mb-4">
                <h5>Full Width (img-fluid)</h5>
                <img src="https://via.placeholder.com/800x400/4facfe/ffffff?text=Responsive" 
                     class="img-fluid rounded shadow" 
                     alt="Responsive">
            </div>
            
            <div class="mb-4">
                <h5>16x9 Ratio</h5>
                <div class="ratio ratio-16x9">
                    <img src="https://via.placeholder.com/800x450/43e97b/ffffff?text=16x9" 
                         class="img-fluid object-fit-cover" 
                         alt="16x9">
                </div>
            </div>
            
            <div>
                <h5>Square (1x1)</h5>
                <div class="row">
                    <div class="col-12 col-md-6 col-lg-4">
                        <div class="ratio ratio-1x1">
                            <img src="https://via.placeholder.com/400/fa709a/ffffff?text=Square" 
                                 class="img-fluid object-fit-cover rounded" 
                                 alt="Square">
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>

    <!-- Footer -->
    <footer class="bg-light py-4 mt-5">
        <div class="container text-center text-muted">
            <p>&copy; 2024 Bootstrap 5.3+ Image Shapes. All rights reserved.</p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## CSS Variables for Images (NEW in Bootstrap 5.3+)

```css
/* Custom border radius */
:root {
    --bs-border-radius: 0.375rem;
    --bs-border-radius-lg: 0.5rem;
    --bs-border-radius-xl: 0.75rem;
}

/* Custom images */
img {
    max-width: 100%;
    height: auto;
    vertical-align: middle;
}
```

---

## Accessibility Best Practices

### DO's ✅

✅ **Always use alt text**
```html
<img src="image.jpg" alt="Descriptive text" class="rounded">
```

✅ **Use semantic tags**
```html
<figure>
    <img src="image.jpg" class="rounded" alt="Image">
    <figcaption>Caption text</figcaption>
</figure>
```

✅ **Ensure sufficient contrast**
```html
<!-- For thumbnails with dark backgrounds -->
<img src="image.jpg" class="img-thumbnail border-light" alt="">
```

✅ **Use lazy loading for performance**
```html
<img src="image.jpg" loading="lazy" class="img-fluid" alt="">
```

### DON'Ts ❌

❌ **Don't use empty alt text for decorative images**
```html
<!-- Only for truly decorative images -->
<img src="decoration.png" alt="" aria-hidden="true" class="rounded">
```

❌ **Don't overuse images**
- Optimize image sizes
- Use appropriate formats
- Compress properly

❌ **Don't ignore responsive images**
```html
<!-- Use responsive sizing -->
<img src="image.jpg" class="img-fluid" alt="">
```

---

## Bootstrap 5.3+ Improvements vs Bootstrap 4

| Feature | Bootstrap 4 | Bootstrap 5.3+ |
|---------|-----------|----------------|
| `.rounded` | Basic | Enhanced variants |
| `.rounded-circle` | ✅ Yes | ✅ Same |
| `.img-thumbnail` | ✅ Yes | ✅ Same |
| `.img-fluid` | ✅ Yes | ✅ Same |
| CSS Variables | ❌ No | ✅ Yes |
| `.ratio` | ❌ No | ✅ Yes |
| `.object-fit-*` | ❌ No | ✅ Yes |
| Dark mode | ❌ No | ✅ Yes |
| Performance | Good | Improved |

---

## Quick Reference Guide

### Common Image Shape Patterns

```html
<!-- Rounded image -->
<img src="image.jpg" class="rounded" alt="">

<!-- Circular avatar -->
<img src="avatar.jpg" class="rounded-circle" width="100" height="100" alt="">

<!-- Thumbnail gallery -->
<img src="image.jpg" class="img-thumbnail img-fluid" alt="">

<!-- Responsive image -->
<img src="image.jpg" class="img-fluid" alt="">

<!-- Square image with ratio -->
<div class="ratio ratio-1x1">
    <img src="image.jpg" class="object-fit-cover" alt="">
</div>

<!-- Centered circular image -->
<div class="text-center">
    <img src="avatar.jpg" class="rounded-circle border-3 border-primary shadow" 
         width="150" height="150" alt="">
</div>
```

---

## Resources

### Official Documentation
- **Bootstrap Images**: https://getbootstrap.com/docs/5.3/content/images/
- **Bootstrap Utilities**: https://getbootstrap.com/docs/5.3/utilities/
- **Bootstrap Figures**: https://getbootstrap.com/docs/5.3/content/figures/

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

### Key Takeaways

1. **Rounded Corners** - Use `.rounded`, `.rounded-lg`, `.rounded-xl`, `.rounded-pill`
2. **Circular Images** - Use `.rounded-circle` with square dimensions
3. **Thumbnails** - Use `.img-thumbnail` for bordered images
4. **Responsive** - Use `.img-fluid` for flexible sizing
5. **Aspect Ratio** - Use `.ratio` classes for specific proportions
6. **Object-Fit** - Use `.object-fit-cover` to control image scaling
7. **Accessibility** - Always include descriptive alt text
8. **Alignment** - Use flexbox and alignment utilities
9. **Effects** - Combine with shadows, borders, opacity classes
10. **Dark Mode** - Images adapt automatically to dark theme

Bootstrap's image utilities provide powerful, flexible options for styling and displaying images responsively across all devices. Master these classes to create professional, accessible image galleries and components!