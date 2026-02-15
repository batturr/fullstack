# JavaScript Functions

**Functions** are reusable blocks of code that perform a specific task. They can be called from anywhere in your application, eliminating the need to repeat code and promoting **code reusability** and **modularity**.

---

## 📑 Table of Contents

1. [What is a Function?](#what-is-a-function)
2. [Function Declaration (Definition)](#function-declaration-definition)
   - [Basic Function](#example-1-basic-function)
   - [Function with Parameters](#example-2-function-with-parameters)
   - [Function with Return Value](#example-3-function-with-return-value)
   - [Hoisting with Function Declarations](#example-4-hoisting-with-function-declarations)
3. [Function Calling (Invocation)](#function-calling-invocation)
4. [Parameters vs Arguments](#parameters-vs-arguments)
   - [Default Parameters](#1-default-parameters)
   - [Rest Parameters](#2-rest-parameters)
   - [Required Arguments](#3-required-arguments)
   - [Optional Arguments](#4-optional-arguments)
   - [Excess Arguments](#5-excess-arguments)
   - [Arguments Object](#6-arguments-object)
5. [Return Statement](#return-statement)
   - [Returning a Single Value](#1-returning-a-single-value)
   - [Returning Multiple Values Using an Object](#2-returning-multiple-values-using-an-object)
   - [Returning Multiple Values Using an Array](#3-returning-multiple-values-using-an-array)
   - [No Return and Empty Return](#4-no-return-and-empty-return)
6. [Types of Functions](#types-of-functions)
7. [Function Expressions](#function-expressions)
8. [Anonymous Functions](#anonymous-functions)
9. [Named Function Expressions](#named-function-expressions)
10. [Immediately Invoked Function Expressions (IIFEs)](#immediately-invoked-function-expressions-iifes)
11. [Arrow Functions (ES6)](#arrow-functions-es6)
    - [Basic Syntax](#basic-arrow-function-syntax)
    - [Single Parameter (No Parentheses)](#example-1-single-parameter)
    - [Implicit Return](#example-2-implicit-return)
    - [No Parameters](#example-3-no-parameters)
    - [Returning Objects](#example-4-returning-objects)
    - [Arrow Function with Arrays](#example-5-arrow-function-with-arrays)
    - [Arrow Functions vs Regular Functions](#arrow-functions-vs-regular-functions)
12. [Generator Functions](#generator-functions)
13. [Async Functions](#async-functions)
14. [Nested Functions](#nested-functions)
15. [Callback Functions](#callback-functions)
16. [Higher-Order Functions](#higher-order-functions)
17. [Closures](#closures)
18. [Recursion](#recursion)
19. [Pure Functions](#pure-functions)
20. [Currying](#currying)
21. [The `this` Keyword in Functions](#the-this-keyword-in-functions)
    - [Global Scope](#1-global-scope)
    - [Function Context](#2-function-context)
    - [Object Method](#3-object-method)
    - [Constructor Function](#4-constructor-function)
    - [Event Handlers](#5-event-handlers)
    - [Arrow Function this](#6-arrow-function-this)
22. [call(), apply(), and bind()](#call-apply-and-bind)
    - [call() Method](#call-method)
    - [apply() Method](#apply-method)
    - [bind() Method](#bind-method)
    - [call vs apply vs bind](#call-vs-apply-vs-bind)
23. [Methods vs Functions](#methods-vs-functions)
24. [Function Overloading](#function-overloading)
25. [Best Practices](#best-practices)
26. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
27. [Practical Examples](#practical-examples)
28. [Comparison Table](#comparison-table)

---

## What is a Function?

A **function** is a self-contained block of code designed to perform a particular task. Functions are one of the fundamental building blocks of JavaScript.

### Key Points:
- Functions are **first-class objects** — they can be assigned to variables, passed as arguments, and returned from other functions
- Functions promote **DRY** (Don't Repeat Yourself) principle
- Functions create their own **scope**
- Functions can accept **parameters** and **return values**
- JavaScript functions can be called **before** or **after** they are defined (if declared, not expressed)

### Anatomy of a Function:
```
function functionName(param1, param2) {
    │         │            │
    │         │            └── Parameters (inputs)
    │         └── Function Name (identifier)
    └── function keyword
    
    // Function Body (code block)
    return value;  ◄── Return statement (output)
}
```

---

## Function Declaration (Definition)

A **function declaration** (also called function statement) starts with the `function` keyword, followed by the function name, parameters in parentheses, and the code block in curly braces.

### Syntax:
```javascript
function functionName(parameters) {
    // function body
    return value; // optional
}
```

### Example 1: Basic Function
```javascript
function welcome() {
    console.log("Welcome to JavaScript World!");
}

// Function calling
welcome();
// Output: Welcome to JavaScript World!
```

### Example 2: Function with Parameters
```javascript
function welcome(name) {
    console.log("Hey " + name + " welcome to JavaScript!");
}

welcome("Prince");
// Output: Hey Prince welcome to JavaScript!
```

### Example 3: Function with Return Value
```javascript
function add(a, b) {
    return a + b;  // Returns the sum
}

let result = add(5, 3);
console.log(result);  // 8
```

### Example 4: Hoisting with Function Declarations
```javascript
// ✅ Function declarations are HOISTED — can be called before definition
greet("Alice");  // Output: Hello, Alice!

function greet(name) {
    console.log("Hello, " + name + "!");
}
```

### Example 5: Multiple Returns
```javascript
function checkAge(age) {
    if (age >= 18) {
        return "Adult";      // Exits function here if true
    }
    return "Minor";          // Exits function here if false
}

console.log(checkAge(20));   // "Adult"
console.log(checkAge(15));   // "Minor"
```

### Example 6: Function with Local Variable
```javascript
function myFunction() {
    let name = "Prince";  // Local variable
    console.log(name, "hello");
    return name;
}

myFunction();
// Output: Prince hello
```

---

## Function Calling (Invocation)

To execute a function, simply type the function's name followed by parentheses `()`. Arguments are passed inside the parentheses.

> By default, all JavaScript functions can utilize the `arguments` object. Each parameter's value is stored in the argument object, which can be accessed using an index (like an array).

```javascript
function sayHello(name) {
    console.log(`Hello, ${name}!`);
}

// Different ways to call
sayHello("Alice");          // Direct call
let greetFn = sayHello;
greetFn("Bob");             // Call via variable reference

// Calling with different argument counts
sayHello();                 // name is undefined → "Hello, undefined!"
sayHello("A", "B", "C");   // Extra arguments ignored → "Hello, A!"
```

---

## Parameters vs Arguments

- **Parameters** — Variables listed in a function's **definition** (placeholders)
- **Arguments** — Actual values **passed** to the function when it is called
- Because JavaScript is a **dynamically typed** language, function arguments can have any data type as a value

```javascript
function greet(name) {         // 'name' is a PARAMETER
    console.log(`Hello, ${name}!`);
}

greet("Prince");               // 'Prince' is an ARGUMENT
// Output: Hello, Prince!
```

### 1. Default Parameters

Default values are assigned to parameters when no argument is provided. Introduced in **ES6**.

```javascript
function greet(name = "Guest") {
    console.log(`Hello, ${name}!`);
}

greet();        // Output: Hello, Guest!
greet("Bob");   // Output: Hello, Bob!
```

```javascript
// Default can be an expression
function createUser(name, role = "user", createdAt = new Date()) {
    return { name, role, createdAt };
}

console.log(createUser("Alice"));
// { name: "Alice", role: "user", createdAt: 2026-02-08T... }

console.log(createUser("Bob", "admin"));
// { name: "Bob", role: "admin", createdAt: 2026-02-08T... }
```

### 2. Rest Parameters

Rest parameters (`...`) allow a function to accept an **indefinite number** of arguments as an array. Must be the **last** parameter.

```javascript
function sum(...numbers) {
    return numbers.reduce((acc, num) => acc + num, 0);
}

console.log(sum(1, 2, 3, 4));  // 10
console.log(sum(10, 20));       // 30
```

```javascript
// Rest parameter with other parameters
function greetAll(greeting, ...names) {
    names.forEach(name => console.log(`${greeting}, ${name}!`));
}

greetAll("Hello", "Alice", "Bob", "Charlie");
// Hello, Alice!
// Hello, Bob!
// Hello, Charlie!
```

### 3. Required Arguments

All defined parameters must be provided; otherwise `undefined` is used.

```javascript
function multiply(a, b) {
    return a * b;
}

console.log(multiply(2, 3));  // 6
console.log(multiply(2));     // NaN (b is undefined → 2 * undefined = NaN)
```

### 4. Optional Arguments

Some arguments may not be passed. Use default parameters to handle such cases.

```javascript
function multiply(a, b = 1) {
    return a * b;
}

console.log(multiply(5));      // 5 (b defaults to 1)
console.log(multiply(5, 3));   // 15
```

### 5. Excess Arguments

Functions ignore extra arguments unless explicitly handled.

```javascript
function add(a, b) {
    return a + b;
}

console.log(add(1, 2, 3, 4));  // 3 (extra arguments 3, 4 ignored)

// To handle excess arguments, use rest parameters
function addAll(...numbers) {
    return numbers.reduce((acc, num) => acc + num, 0);
}

console.log(addAll(1, 2, 3, 4));  // 10
```

### 6. Arguments Object

The `arguments` object is an **array-like** object accessible inside regular functions, containing all arguments passed.

```javascript
function sum() {
    let total = 0;
    for (let num of arguments) {
        total += num;
    }
    return total;
}

console.log(sum(1, 2, 3));         // 6
console.log(sum(10, 20, 30, 40));  // 100
```

> **⚠️ Note:** The `arguments` object is **NOT available** in arrow functions. Use rest parameters instead.

```javascript
// ❌ Arrow functions don't have arguments object
const bad = () => {
    // console.log(arguments);  // ReferenceError!
};

// ✅ Use rest parameters instead
const good = (...args) => {
    console.log(args);  // [1, 2, 3]
};
good(1, 2, 3);
```

### Parameters & Arguments Summary:

| Feature | Example | Notes |
|---------|---------|-------|
| Default Parameters | `function greet(name = "Guest") {}` | Provides a default value if no argument is passed |
| Rest Parameters | `function sum(...nums) {}` | Groups remaining arguments into an array |
| Arguments Object | `function foo() { arguments[0] }` | Array-like object (not in arrow functions) |
| Optional Arguments | `function multiply(a, b = 1) {}` | Optional arguments handled using defaults |
| Excess Arguments | `add(1, 2, 3)` | Ignored unless handled by rest parameters |

---

## Return Statement

The `return` statement stops function execution and optionally returns a value to the caller. If there is no return statement, the function returns `undefined`. The return statement should be the **final statement** of a function.

### Syntax:
```javascript
return;         // Returns undefined
return value;   // Returns the specified value
```

### 1. Returning a Single Value
```javascript
function product(a, b) {
    return a * b;
}

console.log(product(6, 10));  // 60
```

### 2. Returning Multiple Values Using an Object
```javascript
function getLanguages() {
    let first = "HTML",
        second = "CSS",
        third = "JavaScript";

    return { first, second, third };
}

let { first, second, third } = getLanguages();  // Object destructuring
console.log(first);   // HTML
console.log(second);  // CSS
console.log(third);   // JavaScript
```

### 3. Returning Multiple Values Using an Array
```javascript
function getMinMax(arr) {
    let min = Math.min(...arr);
    let max = Math.max(...arr);
    return [min, max];
}

let [minimum, maximum] = getMinMax([5, 2, 9, 1, 7]);
console.log(minimum);  // 1
console.log(maximum);  // 9
```

### 4. No Return and Empty Return
```javascript
function fun1() { }             // Empty block
function fun2() { return; }     // Returns nothing

console.log(fun1());  // undefined
console.log(fun2());  // undefined
```

### ⚠️ Return and Automatic Semicolon Insertion (ASI):
```javascript
// ❌ BAD — return and value on different lines
function badReturn() {
    return           // JS inserts semicolon here → return;
    {
        name: "Alice"
    };
}
console.log(badReturn());  // undefined! 😱

// ✅ GOOD — opening brace on same line
function goodReturn() {
    return {
        name: "Alice"
    };
}
console.log(goodReturn());  // { name: "Alice" }
```

---

## Types of Functions

JavaScript supports multiple types of functions:

| # | Type | Syntax | Key Feature |
|---|------|--------|-------------|
| 1 | Function Declaration | `function name() {}` | Hoisted |
| 2 | Function Expression | `const fn = function() {}` | Not hoisted |
| 3 | Anonymous Function | `function() {}` | No name |
| 4 | Named Function Expression | `const fn = function name() {}` | Named for debugging |
| 5 | IIFE | `(function() {})()` | Runs immediately |
| 6 | Arrow Function | `() => {}` | Short syntax, lexical `this` |
| 7 | Generator Function | `function* name() {}` | Pausable with `yield` |
| 8 | Async Function | `async function name() {}` | Returns Promise |
| 9 | Nested Function | Function inside function | Access outer scope |

---

## Function Expressions

A **function expression** defines a function within an expression and assigns it to a variable. Unlike function declarations, they are **NOT hoisted**.

### Syntax:
```javascript
const functionName = function(parameters) {
    // function body
};
```

### Example:
```javascript
const greet = function(name) {
    console.log("Hey " + name + " welcome to JavaScript world!");
};

greet("Prince");
// Output: Hey Prince welcome to JavaScript world!
```

### Not Hoisted:
```javascript
// ❌ Cannot call before definition
// greet("Alice");  // TypeError: greet is not a function

const greet = function(name) {
    console.log("Hello, " + name);
};

greet("Alice");  // ✅ Works after definition
```

### Assign and Reuse:
```javascript
let hello = function() {
    return "Welcome to JavaScript";
};

let world = hello();
console.log(world);  // Welcome to JavaScript
```

---

## Anonymous Functions

**Anonymous functions** are functions without a name. They are typically used in function expressions and as **callbacks**.

### Syntax:
```javascript
function(parameters) {
    // function body
}
```

### Example 1: Assigned to a Variable
```javascript
let greet = function(name) {
    return `Hello, ${name}!`;
};

console.log(greet("Alice"));  // Hello, Alice!
```

### Example 2: Used as Callbacks
```javascript
let numbers = [1, 2, 3];

numbers.forEach(function(num) {
    console.log(num * 2);
});
// Output: 2, 4, 6
```

### Example 3: As IIFE
```javascript
(function() {
    console.log("This function runs immediately!");
})();
// Output: This function runs immediately!
```

### Example 4: Inside Event Handlers
```javascript
document.getElementById("myButton").onclick = function() {
    alert("Button clicked!");
};
```

### Example with HTML:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Button Click Example</title>
</head>
<body>
    <button id="myButton">Click Me</button>

    <script>
        document.getElementById("myButton").onclick = function() {
            alert("Button clicked!");
        };
    </script>
</body>
</html>
```

---

## Named Function Expressions

**Named function expressions** include a name after the `function` keyword. The name is useful for **recursion** and **debugging** (appears in call stack).

### Syntax:
```javascript
const functionName = function namedFunction(parameters) {
    // function body
};
```

### Example:
```javascript
const greet = function greetWithName(name) {
    console.log("Hello, " + name + "!");
};

greet("Prince");          // Output: Hello, Prince!
// greetWithName("Bob");  // ❌ ReferenceError — name only accessible inside
```

### Example with Recursion:
```javascript
const factorial = function fact(n) {
    if (n <= 1) return 1;
    return n * fact(n - 1);  // Can reference itself by name
};

console.log(factorial(5));  // 120
```

---

## Immediately Invoked Function Expressions (IIFEs)

An **IIFE** is a function that is defined and executed **immediately** after creation. It creates a new scope, avoiding pollution of the global namespace.

### Syntax:
```javascript
(function(parameters) {
    // function body
})(arguments);

// Arrow function IIFE
(() => {
    // function body
})();
```

### Example 1: Basic IIFE
```javascript
(function() {
    const message = "Hello, world!";
    console.log(message);
})();
// Output: Hello, world!
// message is NOT accessible outside
```

### Example 2: IIFE with Return
```javascript
let msg = (function() {
    return "Welcome to JavaScript World";
})();

console.log(msg);  // Welcome to JavaScript World
```

### Example 3: IIFE with Parameters
```javascript
(function(name, age) {
    console.log(`${name} is ${age} years old`);
})("Alice", 25);
// Output: Alice is 25 years old
```

### Example 4: Module Pattern with IIFE
```javascript
const counter = (function() {
    let count = 0;  // Private variable

    return {
        increment: function() { count++; },
        decrement: function() { count--; },
        getCount: function() { return count; }
    };
})();

counter.increment();
counter.increment();
counter.increment();
counter.decrement();
console.log(counter.getCount());  // 2
// console.log(count);  // ❌ ReferenceError — count is private
```

---

## Arrow Functions (ES6)

**Arrow functions** provide a concise syntax for writing function expressions. Introduced in **ES6 (2015)**. They use the `=>` syntax and have a **lexical `this`** binding.

### Basic Arrow Function Syntax:
```javascript
// Full syntax
const functionName = (parameters) => {
    // function body
    return value;
};

// Short syntax (implicit return)
const functionName = (parameters) => expression;

// Single parameter (no parentheses needed)
const functionName = parameter => expression;

// No parameters
const functionName = () => expression;
```

### Example 1: Single Parameter
```javascript
const greet = name => `Hello, ${name}!`;

console.log(greet("Prince"));  // Hello, Prince!
```

### Example 2: Implicit Return
```javascript
// With curly braces — explicit return needed
const add = (a, b) => {
    return a + b;
};

// Without curly braces — implicit return
const addShort = (a, b) => a + b;

console.log(add(3, 4));        // 7
console.log(addShort(3, 4));   // 7
```

### Example 3: No Parameters
```javascript
const getRandom = () => Math.floor(Math.random() * 100);

console.log(getRandom());  // Random number 0-99
```

### Example 4: Returning Objects
```javascript
// ⚠️ Must wrap object literal in parentheses
const createUser = (name, age) => ({ name, age });

console.log(createUser("Alice", 25));
// { name: "Alice", age: 25 }
```

### Example 5: Arrow Function with Arrays
```javascript
const languages = ["HTML", "CSS", "BootStrap", "Tailwind"];

// Regular function
const lengths1 = languages.map(function(s) {
    return s.length;
});
console.log("Normal way:", lengths1);  // [4, 3, 9, 8]

// Arrow function
const lengths2 = languages.map(s => s.length);
console.log("Arrow Function:", lengths2);  // [4, 3, 9, 8]
```

### Example 6: Chaining with Arrow Functions
```javascript
let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

let result = numbers
    .filter(n => n % 2 === 0)         // [2, 4, 6, 8, 10]
    .map(n => n * n)                   // [4, 16, 36, 64, 100]
    .reduce((sum, n) => sum + n, 0);   // 220

console.log(result);  // 220
```

### Arrow Functions vs Regular Functions:

| Feature | Regular Function | Arrow Function |
|---------|-----------------|----------------|
| Syntax | `function name() {}` | `() => {}` |
| `this` binding | Dynamic (depends on caller) | Lexical (inherits from parent) |
| `arguments` object | ✅ Available | ❌ Not available |
| Hoisting | ✅ (declarations) | ❌ Not hoisted |
| Can be constructor | ✅ `new Func()` | ❌ Cannot use `new` |
| `prototype` property | ✅ Has | ❌ Does not have |
| Methods in objects | ✅ Use regular | ❌ Avoid (wrong `this`) |
| Callbacks | ✅ Works | ✅ Preferred for short callbacks |

---

## Generator Functions

**Generator functions** can be **paused and resumed** during execution. They are defined using `function*` and use the `yield` keyword.

### Syntax:
```javascript
function* functionName(parameters) {
    yield value1;
    yield value2;
    // ...
}
```

### Example 1: Basic Generator
```javascript
function* idGenerator() {
    let id = 10;
    while (true) {
        yield id++;
    }
}

const gen = idGenerator();
console.log(gen.next().value);  // 10
console.log(gen.next().value);  // 11
console.log(gen.next().value);  // 12
```

### Example 2: Fibonacci Generator
```javascript
function* fibonacci() {
    let a = 0, b = 1;
    while (true) {
        yield a;
        [a, b] = [b, a + b];
    }
}

const fib = fibonacci();
for (let i = 0; i < 8; i++) {
    console.log(fib.next().value);
}
// Output: 0, 1, 1, 2, 3, 5, 8, 13
```

### Example 3: Generator with for...of
```javascript
function* range(start, end, step = 1) {
    for (let i = start; i <= end; i += step) {
        yield i;
    }
}

for (let num of range(1, 10, 2)) {
    console.log(num);
}
// Output: 1, 3, 5, 7, 9
```

---

## Async Functions

**Async functions** allow you to write asynchronous code in a synchronous style using `async`/`await`. They always return a **Promise**.

### Syntax:
```javascript
async function functionName(parameters) {
    let result = await someAsyncOperation();
    return result;
}
```

### Example 1: Basic Async/Await
```javascript
async function fetchUserDetails(userId) {
    const response = await fetch(`https://api.example.com/users/${userId}`);
    const userDetails = await response.json();
    console.log(userDetails);
}

fetchUserDetails(1);
```

### Example 2: Async with Error Handling
```javascript
async function getData(url) {
    try {
        let response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        let data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch:", error.message);
        return null;
    }
}
```

### Example 3: Multiple Async Operations
```javascript
async function fetchAllUsers() {
    let [user1, user2] = await Promise.all([
        fetch("/api/users/1").then(r => r.json()),
        fetch("/api/users/2").then(r => r.json())
    ]);

    console.log(user1, user2);
}
```

---

## Nested Functions

A function can contain one or more **inner functions**. The inner function has access to the variables and parameters of the outer function (**closure**). However, variables declared within inner functions **cannot** be accessed by outer functions.

### Example 1: Basic Nested Function
```javascript
function msg(firstName) {
    console.log("Hey, I'm from parent function");

    function hey() {
        console.log("Hey, I'm from child function");
        console.log("Hey " + firstName);
    }

    return hey();
}

msg("Prince");
// Output:
// Hey, I'm from parent function
// Hey, I'm from child function
// Hey Prince
```

### Example 2: Nested Functions with Scope
```javascript
function outer() {
    let outerVar = "I'm outer";

    function inner() {
        let innerVar = "I'm inner";
        console.log(outerVar);   // ✅ Can access outer variable
        console.log(innerVar);   // ✅ Can access own variable
    }

    inner();
    // console.log(innerVar);  // ❌ ReferenceError — can't access inner variable
}

outer();
```

### Example 3: Function Factory
```javascript
function multiplier(factor) {
    return function(number) {
        return number * factor;
    };
}

const double = multiplier(2);
const triple = multiplier(3);

console.log(double(5));   // 10
console.log(triple(5));   // 15
```

---

## Callback Functions

A **callback function** is a function passed as an **argument** to another function, which is then called (invoked) inside the outer function.

### Example 1: Basic Callback
```javascript
function greet(name, callback) {
    console.log("Hello, " + name);
    callback();
}

function sayBye() {
    console.log("Goodbye!");
}

greet("Alice", sayBye);
// Output:
// Hello, Alice
// Goodbye!
```

### Example 2: Callback with setTimeout
```javascript
console.log("Start");

setTimeout(function() {
    console.log("This runs after 2 seconds");
}, 2000);

console.log("End");
// Output:
// Start
// End
// This runs after 2 seconds (after 2s delay)
```

### Example 3: Array Methods with Callbacks
```javascript
let numbers = [1, 2, 3, 4, 5];

// forEach — executes callback for each element
numbers.forEach(function(num) {
    console.log(num * 2);
});
// Output: 2, 4, 6, 8, 10

// map — transforms using callback
let doubled = numbers.map(num => num * 2);
console.log(doubled);  // [2, 4, 6, 8, 10]

// filter — filters using callback
let evens = numbers.filter(num => num % 2 === 0);
console.log(evens);  // [2, 4]
```

### Example 4: Custom Callback Pattern
```javascript
function fetchData(url, onSuccess, onError) {
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("HTTP Error");
            return response.json();
        })
        .then(data => onSuccess(data))
        .catch(error => onError(error));
}

fetchData(
    "https://api.example.com/data",
    data => console.log("Success:", data),
    error => console.error("Error:", error.message)
);
```

---

## Higher-Order Functions

A **higher-order function** is a function that either:
1. **Takes** another function as an argument, OR
2. **Returns** a function

### Example 1: Function as Argument
```javascript
function operate(a, b, operation) {
    return operation(a, b);
}

const add = (x, y) => x + y;
const multiply = (x, y) => x * y;

console.log(operate(5, 3, add));       // 8
console.log(operate(5, 3, multiply));  // 15
```

### Example 2: Function that Returns a Function
```javascript
function greeter(greeting) {
    return function(name) {
        return `${greeting}, ${name}!`;
    };
}

const hello = greeter("Hello");
const hi = greeter("Hi");

console.log(hello("Alice"));  // "Hello, Alice!"
console.log(hi("Bob"));       // "Hi, Bob!"
```

### Example 3: Built-in Higher-Order Functions
```javascript
let products = [
    { name: "Laptop", price: 1200 },
    { name: "Phone", price: 800 },
    { name: "Tablet", price: 400 }
];

// map, filter, reduce are all higher-order functions
let expensiveNames = products
    .filter(p => p.price > 500)
    .map(p => p.name);

console.log(expensiveNames);  // ["Laptop", "Phone"]
```

---

## Closures

A **closure** is a function that has access to variables from its **outer (enclosing) function's scope**, even after the outer function has returned.

### Example 1: Basic Closure
```javascript
function outer() {
    let count = 0;  // Enclosed variable

    function inner() {
        count++;
        console.log(count);
    }

    return inner;
}

const counter = outer();
counter();  // 1
counter();  // 2
counter();  // 3
// count variable is preserved between calls!
```

### Example 2: Private Variables
```javascript
function createBankAccount(initialBalance) {
    let balance = initialBalance;  // Private — can't be accessed directly

    return {
        deposit(amount) {
            balance += amount;
            console.log(`Deposited: $${amount}. Balance: $${balance}`);
        },
        withdraw(amount) {
            if (amount > balance) {
                console.log("Insufficient funds!");
                return;
            }
            balance -= amount;
            console.log(`Withdrew: $${amount}. Balance: $${balance}`);
        },
        getBalance() {
            return balance;
        }
    };
}

const account = createBankAccount(100);
account.deposit(50);    // Deposited: $50. Balance: $150
account.withdraw(30);   // Withdrew: $30. Balance: $120
console.log(account.getBalance());  // 120
// console.log(balance);  // ❌ ReferenceError — balance is private!
```

### Example 3: Loop with Closure
```javascript
// ❌ Problem with var
for (var i = 0; i < 3; i++) {
    setTimeout(function() {
        console.log(i);  // 3, 3, 3
    }, 100);
}

// ✅ Fix with let (block scope)
for (let i = 0; i < 3; i++) {
    setTimeout(function() {
        console.log(i);  // 0, 1, 2
    }, 100);
}

// ✅ Fix with closure (IIFE)
for (var i = 0; i < 3; i++) {
    (function(j) {
        setTimeout(function() {
            console.log(j);  // 0, 1, 2
        }, 100);
    })(i);
}
```

---

## Recursion

**Recursion** is when a function calls **itself**. Every recursive function needs a **base case** to stop the recursion.

### Example 1: Factorial
```javascript
function factorial(n) {
    if (n <= 1) return 1;        // Base case
    return n * factorial(n - 1);  // Recursive call
}

console.log(factorial(5));   // 120 (5 × 4 × 3 × 2 × 1)
console.log(factorial(0));   // 1
```

### Example 2: Fibonacci
```javascript
function fibonacci(n) {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(7));  // 13 (0,1,1,2,3,5,8,13)
```

### Example 3: Sum of Array
```javascript
function sumArray(arr) {
    if (arr.length === 0) return 0;
    return arr[0] + sumArray(arr.slice(1));
}

console.log(sumArray([1, 2, 3, 4, 5]));  // 15
```

### Example 4: Deep Flatten
```javascript
function deepFlatten(arr) {
    let result = [];
    for (let item of arr) {
        if (Array.isArray(item)) {
            result = result.concat(deepFlatten(item));
        } else {
            result.push(item);
        }
    }
    return result;
}

console.log(deepFlatten([1, [2, [3, [4]], 5]]));
// [1, 2, 3, 4, 5]
```

---

## Pure Functions

A **pure function** always returns the **same output** for the same input and has **no side effects** (doesn't modify external state).

### Example:
```javascript
// ✅ Pure function — same input, same output, no side effects
function add(a, b) {
    return a + b;
}

console.log(add(2, 3));  // Always 5

// ❌ Impure function — modifies external state
let total = 0;
function addToTotal(value) {
    total += value;  // Side effect!
    return total;
}

console.log(addToTotal(5));   // 5
console.log(addToTotal(5));   // 10 (different output for same input!)
```

### Benefits of Pure Functions:
- **Predictable** — same input always gives same output
- **Testable** — easy to unit test
- **Cacheable** — results can be memoized
- **No side effects** — doesn't affect other parts of the program

---

## Currying

**Currying** transforms a function with multiple arguments into a sequence of functions, each taking a **single argument**.

### Example 1: Basic Currying
```javascript
// Regular function
function add(a, b) {
    return a + b;
}

// Curried version
function curriedAdd(a) {
    return function(b) {
        return a + b;
    };
}

console.log(add(2, 3));          // 5
console.log(curriedAdd(2)(3));   // 5

// Create reusable partial functions
const add5 = curriedAdd(5);
console.log(add5(3));   // 8
console.log(add5(10));  // 15
```

### Example 2: Arrow Function Currying
```javascript
const multiply = a => b => a * b;

const double = multiply(2);
const triple = multiply(3);

console.log(double(5));   // 10
console.log(triple(5));   // 15
```

### Example 3: Practical Currying
```javascript
const formatCurrency = currency => amount =>
    `${currency}${amount.toFixed(2)}`;

const formatUSD = formatCurrency("$");
const formatEUR = formatCurrency("€");
const formatINR = formatCurrency("₹");

console.log(formatUSD(99.5));    // "$99.50"
console.log(formatEUR(149.99));  // "€149.99"
console.log(formatINR(7999));    // "₹7999.00"
```

---

## The `this` Keyword in Functions

In JavaScript, `this` refers to the **object** that is executing the current function. Its value depends on **how** the function is called.

> **Note:** `this` is **not** a variable — it's a keyword. You cannot change the value of `this`.

### 1. Global Scope

Outside any function, `this` refers to the **global object** (`window` in browsers, `global` in Node.js).

```javascript
console.log(this);
// In browsers: Window object
// In Node.js: global object (or {} in modules)
```

### 2. Function Context

#### Regular Function (Non-Strict)
```javascript
function myFunction() {
    return this;  // Window object (in browser)
}

console.log(myFunction());
```

```javascript
function test() {
    console.log("this in a function:", this);  // Window object
}
test();
```

#### Regular Function (Strict Mode)
```javascript
"use strict";

function myFunction() {
    return this;  // undefined
}

console.log(myFunction());
```

### 3. Object Method

In a method, `this` refers to the **object** that owns the method.

```javascript
const car = {
    brand: "Tesla",
    model: "XS",
    cost: "$1",
    getBrand: function() {
        return this.brand;  // this = car object
    }
};

const car2 = {
    brand: "BMW",
    model: "L",
    cost: "$1",
    getBrand2: function() {
        return this.brand;
    }
};

console.log(car.getBrand());   // "Tesla"
console.log(car2.getBrand2()); // "BMW"
```

```javascript
const club = {
    name: "Arsenal",
    yearFounded: "1989",
    details() {
        return `Hey, ${this.name} ${this.yearFounded}`;
    }
};

console.log(club.details());  // "Hey, Arsenal 1989"

// ⚠️ Losing context when detaching method
const detached = club.details;
console.log(detached());  // "Hey, undefined undefined"
// this is now the global object (or undefined in strict mode)
```

### 4. Constructor Function

In a constructor, `this` refers to the **newly created object** (`new` keyword creates the instance).

```javascript
function Country(name) {
    this.name = name;
    this.age = 1960;

    this.info = function() {
        console.log(`${this.name} was founded ${this.age} years ago`);
    };
}

const country = new Country("Nigeria");
console.log(country.name);   // "Nigeria"
country.info();               // "Nigeria was founded 1960 years ago"
```

### 5. Event Handlers

In an `addEventListener` event handler, `this` refers to the **HTML element** that received the event.

```javascript
const button = document.querySelector("button");

button.addEventListener("click", function() {
    console.log(this);  // <button> element
    this.style.backgroundColor = "red";
});
// OUTPUT: <button>click</button>
```

### 6. Arrow Function this

Arrow functions **do NOT** have their own `this`. They inherit `this` from the **enclosing lexical scope**.

```javascript
const person = {
    name: "Alice",
    greetRegular: function() {
        return `Hello, ${this.name}`;  // this = person
    },
    greetArrow: () => {
        return `Hello, ${this.name}`;  // this = global (NOT person!)
    }
};

console.log(person.greetRegular());  // "Hello, Alice"
console.log(person.greetArrow());    // "Hello, undefined" ⚠️
```

```javascript
// ✅ Arrow functions are useful in callbacks (preserves outer this)
const timer = {
    seconds: 0,
    start() {
        setInterval(() => {
            this.seconds++;  // this = timer (inherited from start())
            console.log(this.seconds);
        }, 1000);
    }
};

timer.start();  // 1, 2, 3, 4, ...
```

### `this` Summary Table:

| Context | Value of `this` |
|---------|----------------|
| Global | `window` (browsers) or `global` (Node.js) |
| Function (non-strict) | `window` (browsers) |
| Function (strict) | `undefined` |
| Object Method | The object that owns the method |
| Arrow Function | Lexical `this` (inherits from enclosing scope) |
| Constructor Function | The newly created object |
| Class | The instance of the class |
| Event Handler | The HTML element that received the event |

---

## call(), apply(), and bind()

These methods allow you to explicitly set the value of `this` when calling a function.

### call() Method

The `call()` method is a predefined JavaScript method. It calls a function with a given `this` value and **individual arguments**. This allows borrowing methods from other objects, executing them within a different context, overriding the default value, and passing arguments.

```javascript
function greet(greeting, punctuation) {
    console.log(`${greeting}, ${this.name}${punctuation}`);
}

const person = { name: "Bob" };

greet.call(person, "Hello", "!");
// Output: Hello, Bob!
```

```javascript
// Using call with product function
function product(a, b) {
    return a * b;
}

let result = product.call(this, 20, 5);
console.log(result);  // 100
```

```javascript
// Borrowing methods from objects
let employee = {
    details: function(designation, experience) {
        return `${this.name} (${this.id}) - ${designation}, ${experience}`;
    }
};

let emp1 = { name: "Prince", id: "001" };
let emp2 = { name: "Princess", id: "002" };

console.log(employee.details.call(emp1, "Developer", "5 years"));
// Prince (001) - Developer, 5 years

console.log(employee.details.call(emp2, "Manager", "10 years"));
// Princess (002) - Manager, 10 years
```

### apply() Method

Same as `call()`, but arguments are passed as an **array**.

```javascript
function greet(greeting, punctuation) {
    console.log(`${greeting}, ${this.name}${punctuation}`);
}

const person = { name: "Bob" };

greet.apply(person, ["Hello", "!"]);
// Output: Hello, Bob!
```

```javascript
// Useful for Math functions with arrays
let numbers = [5, 2, 9, 1, 7];

let max = Math.max.apply(null, numbers);
console.log(max);  // 9

// Modern alternative: spread operator
let max2 = Math.max(...numbers);
console.log(max2);  // 9
```

### bind() Method

Returns a **new function** with `this` permanently bound. Does NOT call the function immediately.

```javascript
function greet() {
    console.log(`Hello, ${this.name}`);
}

const person = { name: "Bob" };

const boundGreet = greet.bind(person);
boundGreet();  // Output: Hello, Bob

// Useful for event handlers
const user = {
    name: "Alice",
    sayHi() {
        console.log(`Hi, I'm ${this.name}`);
    }
};

const button = document.querySelector("button");
// Without bind — this would be the button element
button.addEventListener("click", user.sayHi.bind(user));
```

### call vs apply vs bind:

| Feature | `call()` | `apply()` | `bind()` |
|---------|----------|-----------|----------|
| Executes immediately? | ✅ Yes | ✅ Yes | ❌ No (returns new function) |
| Arguments format | Individual: `fn.call(obj, a, b)` | Array: `fn.apply(obj, [a, b])` | Individual: `fn.bind(obj, a, b)` |
| Returns | Function result | Function result | New bound function |
| Use case | Call with different `this` | Call with array args | Create reusable bound function |

---

## Methods vs Functions

| Feature | Function | Method |
|---------|----------|--------|
| Definition | Standalone block of code | Function stored as an object property |
| Calling | `functionName()` | `object.methodName()` |
| `this` | Global object (or `undefined` in strict) | The object that owns the method |
| Declaration | `function name() {}` | Inside object: `{ method() {} }` |

### JavaScript Function:
```javascript
function func(a, b) {
    let sum = a + b;
    return sum;
}

console.log(func(1, 2));  // 3
```

**Work Around:**
- The function is executed when something calls/invokes it
- The name may contain letters, digits, dollar signs, and underscore
- Parameters are listed inside round parenthesis after the name
- Arguments are values a function receives when it is invoked
- When the control reaches the return statement, JS will stop executing and the value is returned to the caller

### JavaScript Method:
```javascript
let employee = {
    empname: "Prince",
    department: "Sales",
    details: function() {
        return this.empname + " works with Department " + this.department;
    }
};

console.log(employee.details());
// Output: Prince works with Department Sales
```

**Work Around:**
- Actions that can be performed on objects are what we term JavaScript methods
- The objects can also be called without using parenthesis
- `this` refers to the owner object in a method

---

## Function Overloading

JavaScript does **NOT** support function overloading directly (like Java or C++). If you define two functions with the same name, the **last one wins**. You can handle different argument counts manually.

### Example 1: Manual Overloading
```javascript
function display(a, b) {
    if (b === undefined) {
        console.log(`One argument: ${a}`);
    } else {
        console.log(`Two arguments: ${a}, ${b}`);
    }
}

display(5);       // "One argument: 5"
display(5, 10);   // "Two arguments: 5, 10"
```

### Example 2: Using Rest Parameters
```javascript
function calculate(...args) {
    switch (args.length) {
        case 1: return args[0] * 2;
        case 2: return args[0] + args[1];
        case 3: return args[0] + args[1] + args[2];
        default: return "Invalid arguments";
    }
}

console.log(calculate(5));        // 10
console.log(calculate(5, 3));     // 8
console.log(calculate(1, 2, 3));  // 6
```

### Example 3: Using typeof Checks
```javascript
function process(input) {
    if (typeof input === "string") {
        return input.toUpperCase();
    } else if (typeof input === "number") {
        return input * 2;
    } else if (Array.isArray(input)) {
        return input.length;
    }
    return "Unsupported type";
}

console.log(process("hello"));     // "HELLO"
console.log(process(5));           // 10
console.log(process([1, 2, 3]));   // 3
```

---

## Best Practices

### ✅ Do:

1. **Use Descriptive Function Names**
   ```javascript
   // ✅ Good — clear intent
   function calculateTax(income, rate) { }
   function isValidEmail(email) { }

   // ❌ Bad — vague names
   function calc(a, b) { }
   function check(x) { }
   ```

2. **Keep Functions Small (Single Responsibility)**
   ```javascript
   // ✅ Good — each function does one thing
   function validateEmail(email) { /* ... */ }
   function sendEmail(to, subject, body) { /* ... */ }

   // ❌ Bad — does too many things
   function processAndSendEmail(to, subject, body) {
       // validates, formats, sends, logs... too much!
   }
   ```

3. **Use Arrow Functions for Short Callbacks**
   ```javascript
   // ✅ Good
   let doubled = numbers.map(n => n * 2);

   // ❌ Unnecessarily verbose
   let doubled2 = numbers.map(function(n) { return n * 2; });
   ```

4. **Use Default Parameters Instead of Manual Checks**
   ```javascript
   // ✅ Good
   function greet(name = "Guest") { }

   // ❌ Bad
   function greet(name) {
       name = name || "Guest";  // Fails for empty string!
   }
   ```

5. **Use `const` for Function Expressions**
   ```javascript
   // ✅ Good — prevents reassignment
   const add = (a, b) => a + b;

   // ❌ Risky — can be overwritten
   let add = (a, b) => a + b;
   ```

6. **Return Early to Avoid Deep Nesting**
   ```javascript
   // ✅ Good — guard clauses
   function process(data) {
       if (!data) return null;
       if (!data.valid) return "Invalid";
       return data.value;
   }
   ```

7. **Prefer Pure Functions When Possible**
   ```javascript
   // ✅ Pure — no side effects
   function add(a, b) { return a + b; }

   // ❌ Impure — modifies external state
   let result;
   function addImpure(a, b) { result = a + b; }
   ```

---

## Common Mistakes to Avoid

### ❌ Don't:

1. **Don't Forget `return` in Functions**
   ```javascript
   // BAD — missing return
   function add(a, b) {
       a + b;  // Computed but not returned!
   }
   console.log(add(2, 3));  // undefined 😱

   // GOOD
   function add(a, b) {
       return a + b;
   }
   ```

2. **Don't Use Arrow Functions as Object Methods**
   ```javascript
   // BAD — arrow function has wrong `this`
   const obj = {
       name: "Alice",
       greet: () => {
           return `Hello, ${this.name}`;  // this ≠ obj!
       }
   };
   console.log(obj.greet());  // "Hello, undefined"

   // GOOD — use regular function
   const obj2 = {
       name: "Alice",
       greet() {
           return `Hello, ${this.name}`;
       }
   };
   console.log(obj2.greet());  // "Hello, Alice"
   ```

3. **Don't Modify Function Arguments Directly**
   ```javascript
   // BAD — modifies original object
   function updateUser(user) {
       user.name = "Modified";  // Mutates original!
   }

   // GOOD — return new object
   function updateUser(user) {
       return { ...user, name: "Modified" };
   }
   ```

4. **Don't Use `arguments` in Arrow Functions**
   ```javascript
   // BAD — ReferenceError
   const fn = () => {
       // console.log(arguments);  // Error!
   };

   // GOOD — use rest parameters
   const fn2 = (...args) => {
       console.log(args);
   };
   ```

5. **Don't Create Functions Inside Loops (Without Closures)**
   ```javascript
   // BAD — var creates shared closure
   for (var i = 0; i < 3; i++) {
       setTimeout(function() {
           console.log(i);  // 3, 3, 3
       }, 100);
   }

   // GOOD — use let
   for (let i = 0; i < 3; i++) {
       setTimeout(function() {
           console.log(i);  // 0, 1, 2
       }, 100);
   }
   ```

6. **Don't Put Return Value on a New Line**
   ```javascript
   // BAD — ASI inserts semicolon after return
   function bad() {
       return
       { name: "Alice" };
   }
   console.log(bad());  // undefined!

   // GOOD
   function good() {
       return {
           name: "Alice"
       };
   }
   ```

---

## Practical Examples

### Example 1: Debounce Function
```javascript
function debounce(fn, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

const search = debounce(function(query) {
    console.log(`Searching for: ${query}`);
}, 300);

// Only the last call within 300ms will execute
search("J");
search("Ja");
search("Jav");
search("Java");  // Only this runs after 300ms
```

### Example 2: Memoization
```javascript
function memoize(fn) {
    const cache = {};
    return function(...args) {
        const key = JSON.stringify(args);
        if (cache[key]) {
            console.log("From cache");
            return cache[key];
        }
        const result = fn(...args);
        cache[key] = result;
        return result;
    };
}

const expensiveCalc = memoize(function(n) {
    console.log("Computing...");
    return n * n;
});

console.log(expensiveCalc(5));  // Computing... 25
console.log(expensiveCalc(5));  // From cache 25
console.log(expensiveCalc(3));  // Computing... 9
```

### Example 3: Pipe/Compose Functions
```javascript
const pipe = (...fns) => (value) =>
    fns.reduce((acc, fn) => fn(acc), value);

const double = x => x * 2;
const addOne = x => x + 1;
const square = x => x * x;

const transform = pipe(double, addOne, square);

console.log(transform(3));  // (3*2 + 1)² = 7² = 49
```

### Example 4: Throttle Function
```javascript
function throttle(fn, limit) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            return fn.apply(this, args);
        }
    };
}

const handleScroll = throttle(function() {
    console.log("Scroll event handled!");
}, 1000);

// Even if triggered 100 times, runs at most once per second
```

### Example 5: Type-Safe Function Wrapper
```javascript
function withValidation(fn, ...types) {
    return function(...args) {
        for (let i = 0; i < types.length; i++) {
            if (typeof args[i] !== types[i]) {
                throw new TypeError(
                    `Argument ${i} must be ${types[i]}, got ${typeof args[i]}`
                );
            }
        }
        return fn(...args);
    };
}

const safeAdd = withValidation(
    (a, b) => a + b,
    "number", "number"
);

console.log(safeAdd(2, 3));      // 5
// console.log(safeAdd("2", 3)); // TypeError!
```

---

## Comparison Table

### All Function Types at a Glance:

| Feature | Declaration | Expression | Arrow | Generator | Async |
|---------|------------|------------|-------|-----------|-------|
| Syntax | `function fn(){}` | `const fn = function(){}` | `() => {}` | `function* fn(){}` | `async function fn(){}` |
| Hoisted | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| `this` binding | Dynamic | Dynamic | Lexical | Dynamic | Dynamic |
| `arguments` | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| Can be constructor | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Returns | Value | Value | Value | Iterator | Promise |

### Function Concepts:

| Concept | Description | Example |
|---------|-------------|---------|
| Callback | Function passed as argument | `arr.map(fn)` |
| Higher-Order | Takes or returns functions | `function hoc(fn) { return fn() }` |
| Closure | Inner function accesses outer scope | Counter, private variables |
| Recursion | Function calls itself | Factorial, Fibonacci |
| Pure Function | Same input → same output, no side effects | `(a, b) => a + b` |
| Currying | Transform multi-arg into single-arg chain | `add(2)(3)` |
| IIFE | Runs immediately on definition | `(function() {})()` |
| Memoization | Cache function results | Expensive computations |

---

## Summary

### Key Takeaways:

1. **Function Declaration** — hoisted, can be called before definition
2. **Function Expression** — NOT hoisted, assigned to a variable
3. **Arrow Functions** — concise syntax, lexical `this`, no `arguments` object
4. **IIFE** — runs immediately, creates private scope
5. **Callbacks** — functions passed as arguments to other functions
6. **Closures** — inner functions retain access to outer scope variables
7. **Higher-Order Functions** — take or return functions (`map`, `filter`, `reduce`)
8. **Recursion** — function calling itself with a base case
9. **`this`** — depends on how the function is called (dynamic vs lexical for arrows)
10. **`call/apply/bind`** — explicitly set `this` (`call` = individual args, `apply` = array, `bind` = returns new function)
11. Use **pure functions** for predictable, testable code
12. Use **default parameters** instead of manual checks
13. Keep functions **small** and focused on a single task

---

**Remember**: Functions are the building blocks of JavaScript! Master closures, `this`, and higher-order functions to write clean, modular, and reusable code.


