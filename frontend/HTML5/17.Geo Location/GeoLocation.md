# 17. Geolocation API

## Overview

The **Geolocation API** allows web pages to access the user's geographical location (with permission).

```
Browser → asks user for permission → if granted → returns coordinates
```

> **HTTPS Required** — Geolocation only works on secure origins (`https://` or `localhost`).

---

## Getting Current Position

```javascript
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    successCallback,
    errorCallback,
    options
  );
} else {
  console.log('Geolocation is not supported');
}

function successCallback(position) {
  console.log('Latitude:', position.coords.latitude);
  console.log('Longitude:', position.coords.longitude);
  console.log('Accuracy:', position.coords.accuracy, 'meters');
  console.log('Altitude:', position.coords.altitude);
  console.log('Speed:', position.coords.speed);
  console.log('Heading:', position.coords.heading);
  console.log('Timestamp:', position.timestamp);
}

function errorCallback(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      console.log('User denied the request.');
      break;
    case error.POSITION_UNAVAILABLE:
      console.log('Location information unavailable.');
      break;
    case error.TIMEOUT:
      console.log('The request timed out.');
      break;
  }
}
```

---

## Position Object Properties

| Property | Description | Type |
|----------|-------------|------|
| `coords.latitude` | Latitude in decimal degrees | Number |
| `coords.longitude` | Longitude in decimal degrees | Number |
| `coords.accuracy` | Accuracy in meters | Number |
| `coords.altitude` | Altitude in meters (may be `null`) | Number / null |
| `coords.altitudeAccuracy` | Altitude accuracy (may be `null`) | Number / null |
| `coords.heading` | Direction of travel in degrees (may be `null`) | Number / null |
| `coords.speed` | Speed in meters/second (may be `null`) | Number / null |
| `timestamp` | Time of the position fix | DOMTimeStamp |

---

## Options

```javascript
const options = {
  enableHighAccuracy: true,   // Use GPS (more accurate, slower, more battery)
  timeout: 10000,             // Max time to wait (ms)
  maximumAge: 0               // Don't use cached position (0 = always fresh)
};

navigator.geolocation.getCurrentPosition(success, error, options);
```

| Option | Default | Description |
|--------|---------|-------------|
| `enableHighAccuracy` | `false` | Request GPS-level accuracy |
| `timeout` | `Infinity` | Maximum wait time in milliseconds |
| `maximumAge` | `0` | Accept cached positions up to this age (ms) |

---

## Watching Position (Continuous Tracking)

```javascript
const watchId = navigator.geolocation.watchPosition(
  (position) => {
    console.log(`Lat: ${position.coords.latitude}`);
    console.log(`Lng: ${position.coords.longitude}`);
    updateMap(position.coords.latitude, position.coords.longitude);
  },
  (error) => {
    console.error(error.message);
  },
  { enableHighAccuracy: true }
);

// Stop watching
navigator.geolocation.clearWatch(watchId);
```

- `watchPosition()` fires the callback **every time** the position changes
- Returns a `watchId` used to stop tracking

---

## Practical Example: Show on Google Maps

```html
<button onclick="getLocation()">Get My Location</button>
<div id="map"></div>
<p id="location"></p>

<script>
function getLocation() {
  if (!navigator.geolocation) {
    document.getElementById('location').textContent = 'Geolocation not supported';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      
      document.getElementById('location').textContent = 
        `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
      
      // Open in Google Maps
      const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      document.getElementById('map').innerHTML = 
        `<a href="${mapUrl}" target="_blank">View on Google Maps</a>`;
    },
    (err) => {
      document.getElementById('location').textContent = `Error: ${err.message}`;
    },
    { enableHighAccuracy: true, timeout: 5000 }
  );
}
</script>
```

---

## Distance Calculation (Haversine Formula)

```javascript
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Example: Distance from NYC to London
const d = getDistanceKm(40.7128, -74.0060, 51.5074, -0.1278);
console.log(`Distance: ${d.toFixed(2)} km`); // ~5570 km
```

---

## Privacy & Best Practices

- **Always ask permission** — browser handles the prompt
- Show **why** you need location before requesting
- Provide a **fallback** for users who deny permission
- Use `enableHighAccuracy: false` unless you actually need GPS precision
- Don't track position continuously unless necessary (battery drain)
- Clear `watchPosition` when no longer needed
