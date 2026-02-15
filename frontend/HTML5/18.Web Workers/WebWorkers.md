# 18. Web Workers

## What Are Web Workers?

Web Workers run JavaScript in a **background thread**, separate from the main UI thread. This prevents heavy computations from blocking the user interface.

```
Main Thread (UI)                Background Thread (Worker)
┌──────────────┐               ┌──────────────────┐
│ DOM, Events  │  postMessage  │ Heavy computation │
│ User input   │ ──────────►  │ Data processing   │
│ Rendering    │               │ No DOM access     │
│              │  ◄──────────  │                   │
│              │  postMessage  │                   │
└──────────────┘               └──────────────────┘
```

---

## Types of Workers

| Type | Description | Scope |
|------|-------------|-------|
| **Dedicated Worker** | One-to-one with a script | Single page |
| **Shared Worker** | Shared across multiple pages/tabs | Same origin |
| **Service Worker** | Proxy between app and network | Entire origin (offline support) |

---

## Dedicated Worker

### Main Script (main.js)

```javascript
// Create worker
const worker = new Worker('worker.js');

// Send message to worker
worker.postMessage({ type: 'compute', data: [1, 2, 3, 4, 5] });

// Receive message from worker
worker.onmessage = (event) => {
  console.log('Result from worker:', event.data);
};

// Handle errors
worker.onerror = (error) => {
  console.error('Worker error:', error.message);
};

// Terminate worker
worker.terminate();
```

### Worker Script (worker.js)

```javascript
// Receive message from main thread
self.onmessage = (event) => {
  const { type, data } = event.data;
  
  if (type === 'compute') {
    // Heavy computation
    const result = data.reduce((sum, num) => sum + num, 0);
    
    // Send result back
    self.postMessage(result);
  }
};
```

---

## What Workers CAN and CANNOT Do

| ✅ Can Access | ❌ Cannot Access |
|--------------|-----------------|
| `navigator` | `document` (no DOM) |
| `location` (read-only) | `window` |
| `XMLHttpRequest` / `fetch` | `parent` |
| `setTimeout` / `setInterval` | UI elements |
| `IndexedDB` | `localStorage` / `sessionStorage` |
| `WebSockets` | `alert()` / `confirm()` / `prompt()` |
| `importScripts()` | — |

---

## Practical Example: Heavy Computation

### Without Worker (Blocks UI)

```javascript
// ❌ This blocks the UI for several seconds
function computePrimes(limit) {
  const primes = [];
  for (let i = 2; i <= limit; i++) {
    let isPrime = true;
    for (let j = 2; j <= Math.sqrt(i); j++) {
      if (i % j === 0) { isPrime = false; break; }
    }
    if (isPrime) primes.push(i);
  }
  return primes;
}
const result = computePrimes(10000000); // UI freezes!
```

### With Worker (Non-blocking)

**main.js:**
```javascript
const worker = new Worker('prime-worker.js');

document.getElementById('startBtn').addEventListener('click', () => {
  document.getElementById('status').textContent = 'Computing...';
  worker.postMessage(10000000);
});

worker.onmessage = (event) => {
  document.getElementById('status').textContent = 
    `Found ${event.data.length} primes`;
};
```

**prime-worker.js:**
```javascript
self.onmessage = (event) => {
  const limit = event.data;
  const primes = [];
  
  for (let i = 2; i <= limit; i++) {
    let isPrime = true;
    for (let j = 2; j <= Math.sqrt(i); j++) {
      if (i % j === 0) { isPrime = false; break; }
    }
    if (isPrime) primes.push(i);
  }
  
  self.postMessage(primes);
};
```

---

## Transferable Objects

For large data (ArrayBuffers), use **transfer** instead of copy for better performance:

```javascript
// Main thread
const buffer = new ArrayBuffer(1024 * 1024); // 1MB
worker.postMessage(buffer, [buffer]); // Transfer (zero-copy)
// buffer.byteLength === 0 (transferred, no longer accessible)

// Worker
self.onmessage = (event) => {
  const buffer = event.data;
  // Process buffer...
  self.postMessage(buffer, [buffer]); // Transfer back
};
```

---

## Shared Worker

Shared across multiple tabs/windows of the same origin.

### shared-worker.js

```javascript
const connections = [];

self.onconnect = (event) => {
  const port = event.ports[0];
  connections.push(port);
  
  port.onmessage = (e) => {
    // Broadcast to all connected tabs
    connections.forEach(p => {
      p.postMessage(`Broadcast: ${e.data}`);
    });
  };
  
  port.start();
};
```

### Using from a page

```javascript
const worker = new SharedWorker('shared-worker.js');
worker.port.start();

worker.port.postMessage('Hello from Tab 1');
worker.port.onmessage = (event) => {
  console.log(event.data);
};
```

---

## Service Worker (Brief Overview)

Service workers act as a **proxy** between your web app and the network, enabling offline experiences and push notifications.

```javascript
// Register
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registered'))
    .catch(err => console.log('SW failed', err));
}
```

### sw.js

```javascript
// Install — cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll(['/index.html', '/style.css', '/app.js']);
    })
  );
});

// Fetch — serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
```

---

## Use Cases

| Use Case | Worker Type |
|----------|------------|
| Image processing | Dedicated Worker |
| Data sorting/filtering | Dedicated Worker |
| Encryption/hashing | Dedicated Worker |
| Cross-tab synchronization | Shared Worker |
| Offline support | Service Worker |
| Push notifications | Service Worker |
| Background sync | Service Worker |
