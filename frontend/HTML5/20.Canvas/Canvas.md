# 20. Canvas

## What Is Canvas?

The `<canvas>` element provides a **bitmap drawing surface** that you control with JavaScript. It's used for games, graphs, image manipulation, and real-time animations.

```html
<canvas id="myCanvas" width="600" height="400" style="border:1px solid #000;">
  Your browser does not support Canvas.
</canvas>
```

> Always set `width` and `height` as **attributes** (not CSS). CSS scaling stretches the bitmap.

---

## Getting the Context

```javascript
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');     // 2D drawing context
// const gl = canvas.getContext('webgl'); // 3D (WebGL)
```

---

## Drawing Shapes

### Rectangles

```javascript
// Filled rectangle
ctx.fillStyle = '#3b82f6';
ctx.fillRect(10, 10, 150, 100);      // (x, y, width, height)

// Outlined rectangle
ctx.strokeStyle = '#ef4444';
ctx.lineWidth = 3;
ctx.strokeRect(180, 10, 150, 100);

// Clear a rectangle area
ctx.clearRect(50, 30, 60, 40);
```

### Lines

```javascript
ctx.beginPath();
ctx.moveTo(50, 200);       // Start point
ctx.lineTo(200, 250);      // Draw line to
ctx.lineTo(50, 300);       // Another line
ctx.closePath();            // Close path (back to start)
ctx.strokeStyle = 'black';
ctx.lineWidth = 2;
ctx.stroke();               // Draw the outline
// ctx.fill();              // Fill the shape
```

### Circles and Arcs

```javascript
ctx.beginPath();
ctx.arc(300, 200, 50, 0, Math.PI * 2);   // (x, y, radius, startAngle, endAngle)
ctx.fillStyle = '#10b981';
ctx.fill();

// Semi-circle
ctx.beginPath();
ctx.arc(450, 200, 50, 0, Math.PI);       // Half circle
ctx.stroke();

// Arc (quarter)
ctx.beginPath();
ctx.arc(300, 350, 50, 0, Math.PI / 2);   // Quarter circle
ctx.stroke();
```

---

## Colors and Styles

```javascript
// Solid colors
ctx.fillStyle = '#ff6600';
ctx.fillStyle = 'rgb(255, 102, 0)';
ctx.fillStyle = 'rgba(255, 102, 0, 0.5)';

// Gradient (linear)
const gradient = ctx.createLinearGradient(0, 0, 300, 0);
gradient.addColorStop(0, '#3b82f6');
gradient.addColorStop(1, '#8b5cf6');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 300, 100);

// Gradient (radial)
const radial = ctx.createRadialGradient(200, 200, 20, 200, 200, 100);
radial.addColorStop(0, 'white');
radial.addColorStop(1, '#3b82f6');
ctx.fillStyle = radial;
ctx.fillRect(100, 100, 200, 200);

// Line styles
ctx.lineWidth = 5;
ctx.lineCap = 'round';        // butt, round, square
ctx.lineJoin = 'round';       // miter, round, bevel
ctx.setLineDash([10, 5]);     // Dashed line
```

---

## Text

```javascript
ctx.font = '30px Arial';
ctx.fillStyle = 'black';
ctx.textAlign = 'center';      // left, right, center, start, end
ctx.textBaseline = 'middle';   // top, middle, bottom, alphabetic

// Filled text
ctx.fillText('Hello Canvas!', 300, 50);

// Outlined text
ctx.strokeStyle = '#3b82f6';
ctx.lineWidth = 2;
ctx.strokeText('Outlined Text', 300, 100);

// Measure text width
const metrics = ctx.measureText('Hello');
console.log(metrics.width);   // Width in pixels
```

---

## Images

```javascript
const img = new Image();
img.src = 'photo.jpg';
img.onload = () => {
  // Draw full image
  ctx.drawImage(img, 0, 0);
  
  // Draw scaled
  ctx.drawImage(img, 0, 0, 200, 150);      // (img, x, y, width, height)
  
  // Draw cropped portion
  ctx.drawImage(img, 
    50, 50, 100, 100,     // Source: sx, sy, sWidth, sHeight
    0, 0, 200, 200         // Destination: dx, dy, dWidth, dHeight
  );
};
```

---

## Transformations

```javascript
// Translate (move origin)
ctx.translate(100, 100);

// Rotate (in radians)
ctx.rotate(Math.PI / 4);      // 45 degrees

// Scale
ctx.scale(2, 2);               // Double size

// Save and restore state
ctx.save();        // Save current state (fills, strokes, transforms)
ctx.translate(200, 200);
ctx.rotate(Math.PI / 6);
ctx.fillRect(-25, -25, 50, 50);
ctx.restore();     // Restore to saved state
```

---

## Paths — Complex Shapes

```javascript
// Bézier curves
ctx.beginPath();
ctx.moveTo(50, 200);
ctx.quadraticCurveTo(200, 50, 350, 200);   // Control point, end point
ctx.stroke();

ctx.beginPath();
ctx.moveTo(50, 300);
ctx.bezierCurveTo(100, 200, 300, 400, 350, 300); // Two control points, end
ctx.stroke();

// Rounded rectangle (manual)
function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// Built-in roundRect (modern browsers)
ctx.beginPath();
ctx.roundRect(10, 10, 200, 100, 20);
ctx.fill();
```

---

## Animation

```javascript
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let x = 0;
let y = canvas.height / 2;
const speed = 2;

function animate() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw ball
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444';
  ctx.fill();
  
  // Update position
  x += speed;
  if (x > canvas.width + 20) x = -20;
  
  // Loop
  requestAnimationFrame(animate);
}

animate();
```

---

## Pixel Manipulation

```javascript
// Get pixel data
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const data = imageData.data;  // Uint8ClampedArray [R, G, B, A, R, G, B, A, ...]

// Invert colors
for (let i = 0; i < data.length; i += 4) {
  data[i]     = 255 - data[i];      // Red
  data[i + 1] = 255 - data[i + 1];  // Green
  data[i + 2] = 255 - data[i + 2];  // Blue
  // data[i + 3] = Alpha (unchanged)
}

// Put modified pixels back
ctx.putImageData(imageData, 0, 0);

// Export canvas as image
const dataUrl = canvas.toDataURL('image/png');    // Base64 data URL
const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
```

---

## Canvas vs SVG

| Feature | Canvas | SVG |
|---------|--------|-----|
| Type | Bitmap (raster) | Vector |
| Resolution | Pixel-dependent | Resolution-independent |
| DOM | Single element | Each shape is a DOM element |
| Events | Canvas-level only | Per-element events |
| Animation | `requestAnimationFrame` | CSS / SMIL / JS |
| Performance | Better for many objects | Better for fewer, interactive objects |
| Use case | Games, image processing, charts | Icons, logos, maps, diagrams |
