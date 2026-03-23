# ES6+ Features in JavaScript

## Overview
ES6 (ECMAScript 2015) and later versions introduced many powerful features that make JavaScript more expressive and easier to work with.

## Purpose
- Write cleaner, more readable code
- Reduce boilerplate
- Enable functional programming patterns
- Improve code organization
- Add powerful new capabilities

## let and const

### let
Block-scoped variable declaration:
```javascript
let count = 0;
count = 1; // Can be reassigned

if (true) {
    let blockScoped = 'only here';
}
// blockScoped is not accessible here
```

### const
Block-scoped constant declaration:
```javascript
const PI = 3.14159;
// PI = 3.14; // Error: Cannot reassign

const user = { name: 'John' };
user.name = 'Jane'; // OK: Can modify object properties
// user = {}; // Error: Cannot reassign
```

## Arrow Functions

Concise function syntax:
```javascript
// Traditional function
function add(a, b) {
    return a + b;
}

// Arrow function
const add = (a, b) => a + b;

// With block
const multiply = (a, b) => {
    return a * b;
};

// Single parameter
const square = x => x * x;

// No parameters
const greet = () => 'Hello!';
```

**Lexical this binding:**
```javascript
const obj = {
    name: 'John',
    greet: function() {
        setTimeout(() => {
            console.log(`Hello, ${this.name}`);
        }, 1000);
    }
};
```

## Template Literals

String interpolation and multi-line strings:
```javascript
const name = 'John';
const age = 30;

// Interpolation
const message = `My name is ${name} and I'm ${age} years old`;

// Multi-line
const html = `
    <div>
        <h1>${name}</h1>
        <p>Age: ${age}</p>
    </div>
`;

// Expressions
const result = `Sum: ${10 + 20}`;
```

## Destructuring

### Array Destructuring
```javascript
const numbers = [1, 2, 3, 4, 5];

const [first, second] = numbers;
// first = 1, second = 2

const [, , third] = numbers;
// third = 3

// Rest operator
const [head, ...tail] = numbers;
// head = 1, tail = [2, 3, 4, 5]

// Default values
const [a = 0, b = 0] = [1];
// a = 1, b = 0
```

### Object Destructuring
```javascript
const user = {
    name: 'John',
    age: 30,
    email: 'john@example.com'
};

const { name, age } = user;

// Rename variables
const { name: userName, age: userAge } = user;

// Default values
const { phone = 'N/A' } = user;

// Nested destructuring
const company = {
    name: 'Tech Corp',
    location: {
        city: 'SF',
        state: 'CA'
    }
};

const { location: { city } } = company;
```

## Spread Operator (...)

### Array Spread
```javascript
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];

// Combine arrays
const combined = [...arr1, ...arr2];

// Copy array
const copy = [...arr1];

// Add elements
const withExtra = [0, ...arr1, 4];
```

### Object Spread
```javascript
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };

// Combine objects
const combined = { ...obj1, ...obj2 };

// Copy object
const copy = { ...obj1 };

// Override properties
const updated = { ...obj1, b: 10 };
```

## Rest Parameters

Collect remaining arguments:
```javascript
function sum(...numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}

sum(1, 2, 3, 4, 5); // 15

function greet(greeting, ...names) {
    return `${greeting} ${names.join(', ')}!`;
}

greet('Hello', 'John', 'Jane', 'Bob'); // "Hello John, Jane, Bob!"
```

## Default Parameters

```javascript
function greet(name = 'Guest', greeting = 'Hello') {
    return `${greeting}, ${name}!`;
}

greet(); // "Hello, Guest!"
greet('John'); // "Hello, John!"
greet('John', 'Hi'); // "Hi, John!"
```

## Enhanced Object Literals

### Property Shorthand
```javascript
const name = 'John';
const age = 30;

// Old way
const user1 = { name: name, age: age };

// ES6 shorthand
const user2 = { name, age };
```

### Method Shorthand
```javascript
const obj = {
    // Old way
    greet: function() {
        return 'Hello';
    },
    
    // ES6 shorthand
    hello() {
        return 'Hello';
    }
};
```

### Computed Property Names
```javascript
const key = 'name';
const obj = {
    [key]: 'John',
    ['age' + '2024']: 30
};
```

## Classes

```javascript
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    greet() {
        return `Hello, I'm ${this.name}`;
    }
    
    static species() {
        return 'Homo sapiens';
    }
}

class Employee extends Person {
    constructor(name, age, role) {
        super(name, age);
        this.role = role;
    }
    
    work() {
        return `${this.name} is working as ${this.role}`;
    }
}

const emp = new Employee('John', 30, 'Developer');
```

## Modules

### Exporting
```javascript
// Named exports
export const PI = 3.14159;
export function add(a, b) {
    return a + b;
}

// Default export
export default class Calculator {
    // ...
}

// Export all at once
const multiply = (a, b) => a * b;
const divide = (a, b) => a / b;
export { multiply, divide };
```

### Importing
```javascript
// Named imports
import { PI, add } from './math.js';

// Default import
import Calculator from './calculator.js';

// Import all
import * as math from './math.js';

// Rename imports
import { add as sum } from './math.js';
```

## Promises

```javascript
const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('Success!');
        // or reject('Error!');
    }, 1000);
});

promise
    .then(result => console.log(result))
    .catch(error => console.error(error))
    .finally(() => console.log('Done'));
```

## Async/Await

```javascript
async function fetchData() {
    try {
        const response = await fetch('https://api.example.com/data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Usage
fetchData().then(data => console.log(data));
```

## Map and Set

### Map
```javascript
const map = new Map();

map.set('name', 'John');
map.set('age', 30);

console.log(map.get('name')); // 'John'
console.log(map.has('age')); // true
console.log(map.size); // 2

map.delete('age');

// Iterate
for (let [key, value] of map) {
    console.log(`${key}: ${value}`);
}
```

### Set
```javascript
const set = new Set();

set.add(1);
set.add(2);
set.add(2); // Duplicate, ignored

console.log(set.has(1)); // true
console.log(set.size); // 2

// From array
const uniqueNumbers = new Set([1, 2, 2, 3, 3, 4]);
console.log([...uniqueNumbers]); // [1, 2, 3, 4]
```

## Symbols

Unique identifiers:
```javascript
const sym1 = Symbol('description');
const sym2 = Symbol('description');

console.log(sym1 === sym2); // false

// Use as object property
const obj = {
    [sym1]: 'value'
};
```

## Iterators and Generators

### Generators
```javascript
function* numberGenerator() {
    yield 1;
    yield 2;
    yield 3;
}

const gen = numberGenerator();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }

// Infinite generator
function* fibonacci() {
    let [prev, curr] = [0, 1];
    while (true) {
        yield curr;
        [prev, curr] = [curr, prev + curr];
    }
}
```

## Optional Chaining (?.)

Safe property access:
```javascript
const user = {
    name: 'John',
    address: {
        city: 'NYC'
    }
};

console.log(user?.address?.city); // 'NYC'
console.log(user?.phone?.number); // undefined (no error)

// With methods
user?.greet?.(); // Safe method call
```

## Nullish Coalescing (??)

Default for null/undefined only:
```javascript
const value1 = null ?? 'default'; // 'default'
const value2 = 0 ?? 'default'; // 0
const value3 = '' ?? 'default'; // ''

// Compare with ||
const val1 = null || 'default'; // 'default'
const val2 = 0 || 'default'; // 'default'
```

## Array Methods

### find() and findIndex()
```javascript
const users = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
];

const user = users.find(u => u.id === 2);
const index = users.findIndex(u => u.id === 2);
```

### includes()
```javascript
const numbers = [1, 2, 3, 4, 5];
console.log(numbers.includes(3)); // true
```

### flat() and flatMap()
```javascript
const nested = [1, [2, 3], [4, [5, 6]]];
console.log(nested.flat()); // [1, 2, 3, 4, [5, 6]]
console.log(nested.flat(2)); // [1, 2, 3, 4, 5, 6]

const arr = [1, 2, 3];
console.log(arr.flatMap(x => [x, x * 2])); // [1, 2, 2, 4, 3, 6]
```

## Object Methods

### Object.entries(), Object.keys(), Object.values()
```javascript
const obj = { a: 1, b: 2, c: 3 };

console.log(Object.keys(obj)); // ['a', 'b', 'c']
console.log(Object.values(obj)); // [1, 2, 3]
console.log(Object.entries(obj)); // [['a', 1], ['b', 2], ['c', 3]]
```

### Object.fromEntries()
```javascript
const entries = [['a', 1], ['b', 2]];
const obj = Object.fromEntries(entries);
// { a: 1, b: 2 }
```

## Real-Time Examples

### Example 1: Modern API Client
```javascript
class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.headers = {
            'Content-Type': 'application/json'
        };
    }
    
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = `${this.baseURL}${endpoint}?${queryString}`;
        
        try {
            const response = await fetch(url, {
                headers: this.headers
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('GET request failed:', error);
            throw error;
        }
    }
    
    async post(endpoint, data = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(data)
            });
            
            return await response.json();
        } catch (error) {
            console.error('POST request failed:', error);
            throw error;
        }
    }
}

// Usage
const api = new APIClient('https://api.example.com');
const data = await api.get('/users', { page: 1, limit: 10 });
```

### Example 2: Data Transformer
```javascript
class DataTransformer {
    static transform(data, schema) {
        return data.map(item => {
            const transformed = {};
            
            for (const [newKey, config] of Object.entries(schema)) {
                const { from, transform = x => x, default: defaultValue } = config;
                const value = item[from] ?? defaultValue;
                transformed[newKey] = transform(value);
            }
            
            return transformed;
        });
    }
    
    static groupBy(array, key) {
        return array.reduce((groups, item) => {
            const groupKey = item[key];
            return {
                ...groups,
                [groupKey]: [...(groups[groupKey] || []), item]
            };
        }, {});
    }
    
    static unique(array, key) {
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) return false;
            seen.add(value);
            return true;
        });
    }
}
```

## Best Practices

1. Use `const` by default, `let` when reassignment is needed
2. Prefer arrow functions for callbacks
3. Use destructuring to extract values from objects/arrays
4. Use spread operator for copying and merging
5. Use template literals for string interpolation
6. Prefer async/await over raw promises
7. Use optional chaining for safe property access
8. Use nullish coalescing for default values
9. Use Map/Set for appropriate data structures
10. Leverage modern array methods (map, filter, reduce)
