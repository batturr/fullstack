# 23. Meta Tags & SEO

## What Are Meta Tags?

Meta tags provide **metadata** about the HTML document — information for browsers, search engines, and social media platforms. They go inside `<head>`.

---

## Essential Meta Tags

```html
<head>
  <!-- Character encoding (always first) -->
  <meta charset="UTF-8">
  
  <!-- Responsive viewport -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Page title (most important for SEO) -->
  <title>Page Title — Site Name</title>
  
  <!-- Page description (shown in search results) -->
  <meta name="description" content="A concise 150-160 character description of the page content.">
  
  <!-- Author -->
  <meta name="author" content="John Doe">
  
  <!-- Language -->
  <html lang="en">
</head>
```

---

## Viewport Meta Tag

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

| Property | Value | Purpose |
|----------|-------|---------|
| `width` | `device-width` | Match the device's width |
| `initial-scale` | `1.0` | Initial zoom level |
| `maximum-scale` | `5.0` | Max zoom allowed |
| `minimum-scale` | `1.0` | Min zoom allowed |
| `user-scalable` | `yes` / `no` | Allow pinch zoom (don't set `no` — accessibility) |

---

## SEO Meta Tags

```html
<!-- Description (shown in Google search results) -->
<meta name="description" content="Learn HTML5 from basics to advanced topics with practical examples.">

<!-- Keywords (mostly ignored by Google now, but used by some engines) -->
<meta name="keywords" content="HTML5, tutorial, web development, semantic tags">

<!-- Robots: tell search engines what to do -->
<meta name="robots" content="index, follow">
<meta name="robots" content="noindex, nofollow">     <!-- Don't index this page -->
<meta name="robots" content="noindex, follow">         <!-- Don't index but follow links -->
<meta name="robots" content="index, nofollow">         <!-- Index but don't follow links -->

<!-- Canonical URL (prevent duplicate content) -->
<link rel="canonical" href="https://example.com/page">

<!-- Language and region -->
<html lang="en">
<meta name="language" content="English">
```

### Robots Directives

| Value | Meaning |
|-------|---------|
| `index` | Allow indexing |
| `noindex` | Don't index this page |
| `follow` | Follow links on this page |
| `nofollow` | Don't follow links |
| `noarchive` | Don't show cached version |
| `nosnippet` | Don't show description snippet |
| `noimageindex` | Don't index images |
| `max-snippet:50` | Max snippet length (chars) |

---

## Open Graph (Facebook / LinkedIn / WhatsApp)

When someone shares your URL, these tags control the preview card:

```html
<meta property="og:title" content="HTML5 Complete Course">
<meta property="og:description" content="Learn HTML5 from basics to advanced topics.">
<meta property="og:image" content="https://example.com/preview.jpg">
<meta property="og:url" content="https://example.com/html5-course">
<meta property="og:type" content="website">
<meta property="og:site_name" content="My Learning Site">
<meta property="og:locale" content="en_US">
```

### `og:type` Values

| Type | Use for |
|------|---------|
| `website` | General web pages |
| `article` | Blog posts, news |
| `product` | E-commerce products |
| `profile` | Personal profiles |
| `video.other` | Video pages |

---

## Twitter Cards

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="HTML5 Complete Course">
<meta name="twitter:description" content="Learn HTML5 from basics to advanced.">
<meta name="twitter:image" content="https://example.com/preview.jpg">
<meta name="twitter:site" content="@username">
<meta name="twitter:creator" content="@author">
```

### Card Types

| Type | Preview |
|------|---------|
| `summary` | Small image + title + description |
| `summary_large_image` | Large image + title + description |
| `app` | App download card |
| `player` | Video/audio player |

---

## Favicon

```html
<!-- Standard favicon -->
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/icon.svg" type="image/svg+xml">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" href="/apple-touch-icon.png">

<!-- Android Chrome -->
<link rel="manifest" href="/site.webmanifest">

<!-- Theme color (browser toolbar) -->
<meta name="theme-color" content="#3b82f6">
```

### site.webmanifest

```json
{
  "name": "My Site",
  "short_name": "Site",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "display": "standalone"
}
```

---

## Structured Data (JSON-LD)

Helps search engines understand your content — enables rich results in Google.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "HTML5 Complete Course",
  "author": {
    "@type": "Person",
    "name": "John Doe"
  },
  "datePublished": "2025-02-08",
  "image": "https://example.com/image.jpg",
  "publisher": {
    "@type": "Organization",
    "name": "My Site"
  }
}
</script>
```

### Common Schema Types
- `Article` — Blog posts, news
- `Product` — E-commerce items (with `price`, `availability`)
- `FAQPage` — FAQ sections (shows Q&A in search results)
- `BreadcrumbList` — Breadcrumb navigation
- `Organization` — Company info
- `LocalBusiness` — Local business with address/hours
- `Recipe` — Cooking recipes

---

## HTTP-Equiv Meta Tags

```html
<!-- Redirect after 5 seconds -->
<meta http-equiv="refresh" content="5; url=https://example.com">

<!-- Content Security Policy -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'">

<!-- Compatibility mode (IE) — rarely needed now -->
<meta http-equiv="X-UA-Compatible" content="IE=edge">
```

---

## Complete Head Template

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <title>Page Title — Site Name</title>
  <meta name="description" content="Page description for search engines (150-160 chars).">
  <meta name="author" content="Author Name">
  
  <link rel="canonical" href="https://example.com/page">
  <meta name="robots" content="index, follow">
  
  <!-- Open Graph -->
  <meta property="og:title" content="Page Title">
  <meta property="og:description" content="Page description.">
  <meta property="og:image" content="https://example.com/image.jpg">
  <meta property="og:url" content="https://example.com/page">
  <meta property="og:type" content="website">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Page Title">
  <meta name="twitter:description" content="Page description.">
  <meta name="twitter:image" content="https://example.com/image.jpg">
  
  <!-- Favicon -->
  <link rel="icon" href="/favicon.ico" sizes="32x32">
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <meta name="theme-color" content="#3b82f6">
  
  <!-- Styles -->
  <link rel="stylesheet" href="styles.css">
</head>
```
