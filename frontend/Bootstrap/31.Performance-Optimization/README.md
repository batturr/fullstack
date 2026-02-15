# Bootstrap 5 Performance Optimization

## Overview
Optimizing Bootstrap 5 for performance improves load times, user experience, and SEO. This guide covers techniques to make your Bootstrap sites faster.

## 1. Import Only What You Need

### Method 1: Selective Sass Imports

Instead of importing all of Bootstrap:

```scss
// DON'T: Import everything (1MB+)
@import "bootstrap/scss/bootstrap";

// DO: Import only needed components
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/variables-dark";
@import "bootstrap/scss/maps";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/root";

// Only import components you use
@import "bootstrap/scss/reboot";
@import "bootstrap/scss/type";
@import "bootstrap/scss/containers";
@import "bootstrap/scss/grid";
@import "bootstrap/scss/buttons";
@import "bootstrap/scss/navbar";
@import "bootstrap/scss/card";

// Utilities
@import "bootstrap/scss/utilities";
@import "bootstrap/scss/utilities/api";
```

### Method 2: Custom Build

Create a custom build with only needed components:

```javascript
// webpack.config.js
module.exports = {
  entry: './src/index.js',
  resolve: {
    alias: {
      'bootstrap': path.resolve(__dirname, 'node_modules/bootstrap/dist/js/bootstrap.esm.js')
    }
  }
};
```

```javascript
// Import only needed JS components
import Modal from 'bootstrap/js/dist/modal';
import Dropdown from 'bootstrap/js/dist/dropdown';
import Collapse from 'bootstrap/js/dist/collapse';
```

## 2. Optimize CSS

### Remove Unused CSS with PurgeCSS

```bash
npm install --save-dev purgecss @fullhuman/postcss-purgecss
```

```javascript
// postcss.config.js
const purgecss = require('@fullhuman/postcss-purgecss');

module.exports = {
  plugins: [
    purgecss({
      content: ['./**/*.html', './**/*.js'],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: {
        standard: ['modal-backdrop', 'fade', 'show'],
        deep: [/^dropdown/, /^offcanvas/],
        greedy: [/tooltip$/]
      }
    })
  ]
};
```

### Minify CSS

```bash
npm install --save-dev cssnano
```

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    cssnano: {
      preset: ['default', {
        discardComments: { removeAll: true },
        normalizeWhitespace: false
      }]
    }
  }
};
```

## 3. Minimize JavaScript

### Use Bootstrap Bundle

```html
<!-- Instead of separate files -->
<script src="bootstrap.bundle.min.js"></script>

<!-- This includes Bootstrap + Popper.js (smaller than separate files) -->
```

### Tree Shaking

Use ES6 modules to enable tree shaking:

```javascript
// Import only used components
import { Modal, Dropdown, Tooltip } from 'bootstrap';

// Initialize
const modal = new Modal(document.getElementById('myModal'));
```

### Webpack Configuration

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: true
        }
      }
    })]
  }
};
```

## 4. CDN Optimization

### Use CDN for Bootstrap

```html
<!-- Use official Bootstrap CDN with integrity hash -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" 
      rel="stylesheet" 
      integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" 
      crossorigin="anonymous">

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" 
        integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" 
        crossorigin="anonymous"></script>
```

### Preconnect to CDN

```html
<head>
  <!-- Establish early connection to CDN -->
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
</head>
```

## 5. Lazy Loading

### Lazy Load JavaScript Components

```javascript
// Load tooltip only when needed
async function enableTooltips() {
  const { Tooltip } = await import('bootstrap/js/dist/tooltip');
  
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  [...tooltipTriggerList].map(el => new Tooltip(el));
}

// Call when needed
document.getElementById('showTooltips').addEventListener('click', enableTooltips);
```

### Lazy Load Images

```html
<!-- Use loading="lazy" attribute -->
<img src="image.jpg" loading="lazy" alt="Description">

<!-- Bootstrap responsive images with lazy loading -->
<img src="image.jpg" class="img-fluid" loading="lazy" alt="Description">
```

## 6. Optimize Images

### Responsive Images

```html
<!-- Use srcset for different screen sizes -->
<img srcset="image-320w.jpg 320w,
             image-480w.jpg 480w,
             image-800w.jpg 800w"
     sizes="(max-width: 320px) 280px,
            (max-width: 480px) 440px,
            800px"
     src="image-800w.jpg"
     alt="Description"
     class="img-fluid">
```

### Modern Image Formats

```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="Description" class="img-fluid">
</picture>
```

## 7. Critical CSS

### Inline Critical CSS

```html
<head>
  <!-- Inline critical Bootstrap styles -->
  <style>
    /* Critical Bootstrap classes */
    .container{width:100%;padding-right:15px;padding-left:15px;margin-right:auto;margin-left:auto}
    .row{display:flex;flex-wrap:wrap;margin-right:-15px;margin-left:-15px}
    .col{flex-basis:0;flex-grow:1;max-width:100%}
    /* Add more critical styles */
  </style>
  
  <!-- Load full CSS asynchronously -->
  <link rel="preload" href="bootstrap.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="bootstrap.min.css"></noscript>
</head>
```

## 8. Reduce HTTP Requests

### Combine Files

```html
<!-- Instead of multiple files -->
<link href="bootstrap.min.css" rel="stylesheet">
<link href="custom.css" rel="stylesheet">
<link href="fonts.css" rel="stylesheet">

<!-- Combine into one file -->
<link href="combined.min.css" rel="stylesheet">
```

### Use Icon Fonts Sparingly

```html
<!-- Instead of loading entire icon library -->
<link href="bootstrap-icons.css" rel="stylesheet">

<!-- Use SVG sprites for only needed icons -->
<svg class="icon"><use xlink:href="icons.svg#icon-home"></use></svg>
```

## 9. Optimize Web Fonts

### Subset Fonts

```css
/* Load only needed font weights */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

/* Use font-display for better performance */
@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2') format('woff2');
  font-display: swap; /* or optional, fallback */
}
```

### Preload Fonts

```html
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>
```

## 10. JavaScript Performance

### Defer Non-Critical JavaScript

```html
<!-- Defer Bootstrap JS -->
<script src="bootstrap.bundle.min.js" defer></script>

<!-- Or use async for independent scripts -->
<script src="analytics.js" async></script>
```

### Minimize DOM Manipulation

```javascript
// BAD: Multiple reflows
document.querySelector('.card').style.width = '300px';
document.querySelector('.card').style.height = '200px';
document.querySelector('.card').style.background = '#fff';

// GOOD: Single reflow
const card = document.querySelector('.card');
card.style.cssText = 'width:300px;height:200px;background:#fff;';

// BETTER: Use CSS class
card.classList.add('card-styled');
```

### Event Delegation

```javascript
// BAD: Multiple event listeners
document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
  toggle.addEventListener('click', handleClick);
});

// GOOD: Single event listener with delegation
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('dropdown-toggle')) {
    handleClick(e);
  }
});
```

## 11. Caching Strategies

### Browser Caching

```html
<!-- Set cache headers on server -->
<!-- Apache .htaccess example -->
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
</IfModule>
```

### Service Worker

```javascript
// service-worker.js
const CACHE_NAME = 'bootstrap-v1';
const urlsToCache = [
  '/css/bootstrap.min.css',
  '/js/bootstrap.bundle.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

## 12. Monitoring Performance

### Lighthouse

```bash
# Run Lighthouse audit
npm install -g lighthouse
lighthouse https://yoursite.com --view
```

### Performance Metrics

```javascript
// Measure component initialization time
console.time('Bootstrap Init');

const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
[...tooltips].map(el => new bootstrap.Tooltip(el));

console.timeEnd('Bootstrap Init');
```

### Web Vitals

```javascript
// Monitor Core Web Vitals
import {getCLS, getFID, getFCP, getLCP, getTTFB} from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## 13. Build Configuration

### package.json Scripts

```json
{
  "scripts": {
    "build:css": "sass --style compressed scss/custom.scss css/custom.min.css",
    "build:js": "webpack --mode production",
    "purge:css": "purgecss --css css/*.css --content '**/*.html' --output css/purged/",
    "optimize": "npm run build:css && npm run build:js && npm run purge:css",
    "watch": "sass --watch scss:css"
  }
}
```

## Performance Checklist

- [ ] Import only needed Bootstrap components
- [ ] Remove unused CSS with PurgeCSS
- [ ] Minify CSS and JavaScript
- [ ] Use CDN with integrity hashes
- [ ] Enable compression (Gzip/Brotli)
- [ ] Lazy load images and components
- [ ] Optimize images (WebP, compression)
- [ ] Inline critical CSS
- [ ] Defer non-critical JavaScript
- [ ] Implement caching strategy
- [ ] Use browser caching
- [ ] Preconnect to external resources
- [ ] Minimize HTTP requests
- [ ] Optimize web fonts
- [ ] Test with Lighthouse
- [ ] Monitor Core Web Vitals

## Tools & Resources

- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PurgeCSS](https://purgecss.com/)
- [Webpack](https://webpack.js.org/)
- [WebPageTest](https://www.webpagetest.org/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Bundle Phobia](https://bundlephobia.com/) - Check package sizes

## Expected Results

After optimization:
- CSS: ~30-50KB (from ~200KB)
- JS: ~15-30KB (from ~60KB)
- Initial load: < 2s
- Lighthouse score: 90+
