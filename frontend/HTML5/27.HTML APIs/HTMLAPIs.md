# 27. HTML APIs

## Overview

HTML5 introduced many JavaScript APIs that enhance web capabilities beyond simple document rendering.

---

## History API

Navigate and manipulate the browser history without full page reloads (foundation of SPAs).

```javascript
// Add a new history entry
history.pushState({ page: 1 }, 'Page 1', '/page-1');

// Replace current history entry (no new entry created)
history.replaceState({ page: 2 }, 'Page 2', '/page-2');

// Navigate back/forward
history.back();
history.forward();
history.go(-2);    // Go back 2 pages

// Listen for back/forward navigation
window.addEventListener('popstate', (event) => {
  console.log('State:', event.state);
  // Update page content based on state
});
```

### SPA Routing Pattern

```javascript
function navigate(path) {
  history.pushState({ path }, '', path);
  renderPage(path);
}

window.addEventListener('popstate', (event) => {
  renderPage(event.state?.path || '/');
});

function renderPage(path) {
  const content = document.getElementById('content');
  switch (path) {
    case '/': content.innerHTML = '<h1>Home</h1>'; break;
    case '/about': content.innerHTML = '<h1>About</h1>'; break;
    case '/contact': content.innerHTML = '<h1>Contact</h1>'; break;
  }
}
```

---

## Clipboard API

```javascript
// Copy text to clipboard
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Copied!');
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

// Read text from clipboard
async function pasteText() {
  try {
    const text = await navigator.clipboard.readText();
    console.log('Pasted:', text);
  } catch (err) {
    console.error('Failed to paste:', err);
  }
}

// Copy image to clipboard
async function copyImage(blob) {
  const item = new ClipboardItem({ 'image/png': blob });
  await navigator.clipboard.write([item]);
}
```

> **Requires HTTPS** and user permission (for reading).

---

## Fullscreen API

```javascript
const element = document.getElementById('video');

// Enter fullscreen
element.requestFullscreen();
// or: element.webkitRequestFullscreen() for Safari

// Exit fullscreen
document.exitFullscreen();

// Check if fullscreen
document.fullscreenElement;    // The element in fullscreen (or null)

// Listen for fullscreen changes
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    console.log('Entered fullscreen');
  } else {
    console.log('Exited fullscreen');
  }
});
```

```css
/* Style the fullscreen element */
:fullscreen {
  background: black;
}

/* Style the backdrop */
::backdrop {
  background: rgba(0, 0, 0, 0.9);
}
```

---

## Intersection Observer

Efficiently detect when an element enters or leaves the viewport — perfect for lazy loading, infinite scroll, and scroll animations.

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Optionally stop observing
      observer.unobserve(entry.target);
    }
  });
}, {
  root: null,           // viewport
  rootMargin: '0px',    // margin around root
  threshold: 0.1        // 10% visible triggers callback
});

// Observe elements
document.querySelectorAll('.animate-on-scroll').forEach(el => {
  observer.observe(el);
});
```

### Lazy Loading Images

```javascript
const imgObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      imgObserver.unobserve(img);
    }
  });
});

document.querySelectorAll('img.lazy').forEach(img => {
  imgObserver.observe(img);
});
```

```html
<img class="lazy" data-src="photo.jpg" alt="Photo" src="placeholder.jpg">
```

### Infinite Scroll

```javascript
const sentinel = document.getElementById('sentinel');

const scrollObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadMoreContent();
  }
});

scrollObserver.observe(sentinel);
```

---

## Notification API

```javascript
// Request permission
const permission = await Notification.requestPermission();

if (permission === 'granted') {
  // Show notification
  const notification = new Notification('New Message', {
    body: 'You have 3 unread messages.',
    icon: '/icon.png',
    badge: '/badge.png',
    tag: 'message-group',        // Group notifications
    requireInteraction: false,   // Auto-dismiss
  });
  
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
  
  // Auto close after 5 seconds
  setTimeout(() => notification.close(), 5000);
}
```

---

## Page Visibility API

Detect when the user switches tabs or minimizes the browser.

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden — pause animations, timer, video
    console.log('Page hidden');
  } else {
    // Page is visible — resume
    console.log('Page visible');
  }
});

// Check current state
document.visibilityState;  // "visible", "hidden", "prerender"
```

### Use Cases
- Pause/resume video or audio
- Stop polling when tab is inactive
- Pause game loop
- Reduce animation frame rate

---

## Battery Status API

```javascript
if ('getBattery' in navigator) {
  const battery = await navigator.getBattery();
  
  console.log('Level:', battery.level * 100 + '%');
  console.log('Charging:', battery.charging);
  console.log('Charging time:', battery.chargingTime);
  console.log('Discharging time:', battery.dischargingTime);
  
  battery.addEventListener('levelchange', () => {
    console.log('Battery level:', battery.level * 100 + '%');
  });
  
  battery.addEventListener('chargingchange', () => {
    console.log('Charging:', battery.charging);
  });
}
```

> Limited browser support. Privacy concerns led to removal from some browsers.

---

## Vibration API

```javascript
// Vibrate for 200ms
navigator.vibrate(200);

// Vibration pattern: vibrate, pause, vibrate
navigator.vibrate([200, 100, 200]);

// Stop vibration
navigator.vibrate(0);
```

> Works on mobile devices with vibration hardware.

---

## Screen Orientation API

```javascript
// Get current orientation
screen.orientation.type;    // "portrait-primary", "landscape-primary", etc.
screen.orientation.angle;   // 0, 90, 180, 270

// Lock orientation (fullscreen only)
await screen.orientation.lock('landscape');
screen.orientation.unlock();

// Listen for changes
screen.orientation.addEventListener('change', () => {
  console.log('Orientation:', screen.orientation.type);
});
```

---

## Network Information API

```javascript
if ('connection' in navigator) {
  const conn = navigator.connection;
  
  console.log('Type:', conn.effectiveType);     // "4g", "3g", "2g", "slow-2g"
  console.log('Downlink:', conn.downlink);       // Mbps
  console.log('RTT:', conn.rtt);                 // Round-trip time (ms)
  console.log('Save Data:', conn.saveData);      // User prefers reduced data
  
  conn.addEventListener('change', () => {
    console.log('Connection changed:', conn.effectiveType);
  });
}
```

---

## API Support Summary

| API | Chrome | Firefox | Safari | Edge |
|-----|--------|---------|--------|------|
| History | ✅ | ✅ | ✅ | ✅ |
| Clipboard | ✅ | ✅ | ✅ | ✅ |
| Fullscreen | ✅ | ✅ | ✅ | ✅ |
| Intersection Observer | ✅ | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ | ✅ |
| Page Visibility | ✅ | ✅ | ✅ | ✅ |
| Battery Status | ✅ | ❌ | ❌ | ✅ |
| Vibration | ✅ | ✅ | ❌ | ✅ |
| Network Info | ✅ | ❌ | ❌ | ✅ |
