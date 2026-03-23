# 22. Responsive Web Design Patterns

## Mobile-First Workflow

Always start with the mobile design and layer on complexity:

```html
<!-- Mobile: stacked. Tablet: side-by-side. Desktop: wider with more padding -->
<section class="px-4 py-8 sm:px-6 md:px-8 lg:px-12 lg:py-16">
  <div class="max-w-7xl mx-auto">
    <div class="flex flex-col md:flex-row gap-6 lg:gap-12">
      <div class="md:w-1/2">Content</div>
      <div class="md:w-1/2">Image</div>
    </div>
  </div>
</section>
```

---

## Pattern 1: Responsive Navigation

### Mobile Hamburger → Desktop Horizontal

```html
<nav class="bg-white shadow">
  <div class="max-w-7xl mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <!-- Logo -->
      <a class="text-xl font-bold text-gray-900">Brand</a>
      
      <!-- Desktop Menu (hidden on mobile) -->
      <div class="hidden md:flex gap-8">
        <a class="text-gray-600 hover:text-gray-900">Home</a>
        <a class="text-gray-600 hover:text-gray-900">About</a>
        <a class="text-gray-600 hover:text-gray-900">Services</a>
        <a class="text-gray-600 hover:text-gray-900">Contact</a>
      </div>
      
      <!-- Hamburger (shown on mobile) -->
      <button class="md:hidden p-2">
        <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
    </div>
  </div>
  
  <!-- Mobile Menu (toggle with JS) -->
  <div class="md:hidden px-4 py-4 space-y-2 border-t">
    <a class="block text-gray-600 py-2">Home</a>
    <a class="block text-gray-600 py-2">About</a>
    <a class="block text-gray-600 py-2">Services</a>
    <a class="block text-gray-600 py-2">Contact</a>
  </div>
</nav>
```

---

## Pattern 2: Responsive Card Grid

```html
<!-- 1 col → 2 col → 3 col → 4 col -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <div class="bg-white rounded-xl shadow p-6">
    <img class="w-full h-48 object-cover rounded-lg" src="img1.jpg">
    <h3 class="mt-4 font-semibold text-lg">Card Title</h3>
    <p class="mt-2 text-gray-600 text-sm">Card description...</p>
  </div>
  <!-- Repeat cards... -->
</div>
```

---

## Pattern 3: Hero Section

```html
<section class="relative overflow-hidden">
  <!-- Background -->
  <div class="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700"></div>
  
  <!-- Content -->
  <div class="relative max-w-7xl mx-auto px-4 py-16 sm:py-24 lg:py-32">
    <div class="text-center lg:text-left lg:max-w-2xl">
      <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl 
                 font-bold text-white leading-tight">
        Build amazing<br>
        <span class="text-blue-200">products faster</span>
      </h1>
      <p class="mt-4 sm:mt-6 text-base sm:text-lg text-blue-100 
                max-w-xl mx-auto lg:mx-0">
        A powerful toolkit for building responsive websites.
      </p>
      <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
        <a class="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold 
                  hover:bg-blue-50 transition text-center">
          Get Started
        </a>
        <a class="border border-white/30 text-white px-6 py-3 rounded-lg 
                  font-semibold hover:bg-white/10 transition text-center">
          Learn More
        </a>
      </div>
    </div>
  </div>
</section>
```

---

## Pattern 4: Sidebar Layout

```html
<div class="flex flex-col lg:flex-row min-h-screen">
  <!-- Sidebar -->
  <aside class="w-full lg:w-64 xl:w-72 bg-gray-900 text-white 
                lg:min-h-screen p-4 lg:p-6">
    <h2 class="text-xl font-bold mb-6">Dashboard</h2>
    <nav class="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
      <a class="flex-shrink-0 px-4 py-2 rounded-lg hover:bg-gray-800">Overview</a>
      <a class="flex-shrink-0 px-4 py-2 rounded-lg hover:bg-gray-800">Analytics</a>
      <a class="flex-shrink-0 px-4 py-2 rounded-lg hover:bg-gray-800">Settings</a>
    </nav>
  </aside>
  
  <!-- Main content -->
  <main class="flex-1 p-4 sm:p-6 lg:p-8">
    <h1 class="text-2xl font-bold">Main Content</h1>
    <!-- ... -->
  </main>
</div>
```

---

## Pattern 5: Responsive Table

```html
<!-- Scrollable on mobile, full on desktop -->
<div class="overflow-x-auto rounded-lg border">
  <table class="min-w-full divide-y divide-gray-200">
    <thead class="bg-gray-50">
      <tr>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Email</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Role</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-200">
      <tr>
        <td class="px-6 py-4 text-sm">John Doe</td>
        <td class="px-6 py-4 text-sm hidden sm:table-cell">john@example.com</td>
        <td class="px-6 py-4 text-sm hidden md:table-cell">Admin</td>
        <td class="px-6 py-4"><span class="badge-green">Active</span></td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## Pattern 6: Footer

```html
<footer class="bg-gray-900 text-gray-300">
  <div class="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
    <!-- Links grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div>
        <h3 class="text-white font-semibold mb-4">Product</h3>
        <ul class="space-y-2 text-sm">
          <li><a class="hover:text-white transition">Features</a></li>
          <li><a class="hover:text-white transition">Pricing</a></li>
        </ul>
      </div>
      <div>
        <h3 class="text-white font-semibold mb-4">Company</h3>
        <ul class="space-y-2 text-sm">
          <li><a class="hover:text-white transition">About</a></li>
          <li><a class="hover:text-white transition">Blog</a></li>
        </ul>
      </div>
      <div>
        <h3 class="text-white font-semibold mb-4">Support</h3>
        <ul class="space-y-2 text-sm">
          <li><a class="hover:text-white transition">Help Center</a></li>
          <li><a class="hover:text-white transition">Contact</a></li>
        </ul>
      </div>
      <div>
        <h3 class="text-white font-semibold mb-4">Legal</h3>
        <ul class="space-y-2 text-sm">
          <li><a class="hover:text-white transition">Privacy</a></li>
          <li><a class="hover:text-white transition">Terms</a></li>
        </ul>
      </div>
    </div>
    
    <!-- Bottom bar -->
    <div class="mt-12 pt-8 border-t border-gray-800 
                flex flex-col sm:flex-row justify-between items-center gap-4">
      <p class="text-sm">&copy; 2025 Company. All rights reserved.</p>
      <div class="flex gap-6">
        <!-- Social icons -->
      </div>
    </div>
  </div>
</footer>
```

---

## Pattern 7: Responsive Typography Scale

```html
<!-- Fluid heading hierarchy -->
<h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">H1</h1>
<h2 class="text-2xl sm:text-3xl md:text-4xl font-bold">H2</h2>
<h3 class="text-xl sm:text-2xl font-semibold">H3</h3>
<p class="text-base sm:text-lg leading-relaxed">Body text</p>
<p class="text-sm sm:text-base text-gray-600">Secondary text</p>
```

---

## Responsive Breakpoint Strategy Tips

1. **Don't use every breakpoint** — Most designs need only 2-3 breakpoints
2. **Group breakpoints logically:**
   - Mobile: base (no prefix)
   - Tablet: `md:` (768px)
   - Desktop: `lg:` (1024px)
3. **Use `max-w-*` containers** — Prevent content from stretching too wide
4. **Consistent spacing** — Scale spacing proportionally: `p-4 sm:p-6 lg:p-8`
5. **Test on real devices** — Browser DevTools responsive mode isn't always accurate
