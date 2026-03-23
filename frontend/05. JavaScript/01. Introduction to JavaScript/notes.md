# Getting Started with JavaScript

## What is JavaScript?
JavaScript is a high-level, interpreted programming language that is one of the core technologies of the World Wide Web, alongside HTML and CSS. It enables interactive web pages and is an essential part of web applications.

## Purpose
- Add interactivity to websites
- Build web applications
- Create server-side applications (Node.js)
- Develop mobile apps (React Native)
- Build desktop applications (Electron)

## Basic Concepts

### 1. How to Include JavaScript

#### Inline JavaScript
```html
<!DOCTYPE html>
<html>
<body>
    <button onclick="alert('Hello World!')">Click Me</button>
</body>
</html>
```

#### Internal JavaScript
```html
<!DOCTYPE html>
<html>
<head>
    <script>
        function greet() {
            alert('Hello from internal script!');
        }
    </script>
</head>
<body>
    <button onclick="greet()">Greet</button>
</body>
</html>
```

#### External JavaScript
```html
<!DOCTYPE html>
<html>
<head>
    <script src="script.js"></script>
</head>
<body>
    <h1>My Website</h1>
</body>
</html>
```

### 2. Console Methods

```javascript
// Log messages to console
console.log('This is a log message');

// Display warnings
console.warn('This is a warning');

// Display errors
console.error('This is an error');

// Display info
console.info('This is informational');

// Clear console
console.clear();
```

## Real-Time Examples

### Example 1: Simple Calculator
```javascript
// Basic calculator operations
function calculate(num1, num2, operation) {
    switch(operation) {
        case 'add':
            return num1 + num2;
        case 'subtract':
            return num1 - num2;
        case 'multiply':
            return num1 * num2;
        case 'divide':
            return num1 / num2;
        default:
            return 'Invalid operation';
    }
}

console.log(calculate(10, 5, 'add'));      // Output: 15
console.log(calculate(10, 5, 'multiply')); // Output: 50
```

### Example 2: Form Validation
```html
<!DOCTYPE html>
<html>
<body>
    <form id="myForm">
        <input type="text" id="username" placeholder="Enter username">
        <button type="submit">Submit</button>
    </form>

    <script>
        document.getElementById('myForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            
            if (username.length < 3) {
                alert('Username must be at least 3 characters');
            } else {
                alert('Welcome, ' + username + '!');
            }
        });
    </script>
</body>
</html>
```

### Example 3: Dynamic Content Update
```javascript
// Update webpage content dynamically
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('clock').textContent = timeString;
}

// Update time every second
setInterval(updateTime, 1000);
```

## Best Practices
1. Always use semicolons to end statements
2. Use meaningful variable names
3. Comment your code for clarity
4. Keep functions small and focused
5. Use strict mode: `'use strict';`
6. Avoid global variables when possible
