# JavaScript Closures

A **closure** is a function that has access to its own scope, the outer function's scope, and the global scope — even after the outer function has returned. Closures are a fundamental concept in JavaScript that enable powerful patterns like data privacy, currying, and function factories.

---

## Table of Contents

| No. | Topic                                                              |
|-----|--------------------------------------------------------------------|
| 1   | [What is a Closure?](#1-what-is-a-closure)                         |
| 2   | [Lexical Scoping](#2-lexical-scoping)                              |
| 3   | [How Closures Work](#3-how-closures-work)                          |
| 4   | [Private Variables with Closures](#4-private-variables-with-closures) |
| 5   | [Closure with Return Object (Module Pattern)](#5-closure-with-return-object-module-pattern) |
| 6   | [Closure in Loops](#6-closure-in-loops)                            |
| 7   | [Function Factories](#7-function-factories)                        |
| 8   | [Currying with Closures](#8-currying-with-closures)                |
| 9   | [Event Handlers & Closures](#9-event-handlers--closures)           |
| 10  | [setTimeout & Closures](#10-settimeout--closures)                  |
| 11  | [IIFE (Immediately Invoked Function Expression)](#11-iife-immediately-invoked-function-expression) |
| 12  | [Memoization with Closures](#12-memoization-with-closures)         |
| 13  | [Common Mistakes](#13-common-mistakes)                             |
| 14  | [Practical Examples](#14-practical-examples)                       |
|     | [Summary](#summary)                                                |

---

## 1. What is a Closure?

A **closure** is created when a function is defined inside another function and the inner function **references variables** from the outer function. The inner function "closes over" those variables, keeping them alive even after the outer function finishes execution.

```javascript
function outer() {
    let message = "Hello from closure!";

    function inner() {
        console.log(message); // inner() has access to 'message'
    }

    return inner;
}

let closureFunc = outer();
closureFunc(); // "Hello from closure!"
// 'message' is still accessible even though outer() has finished executing
```

> **Key Point:** The inner function retains access to the outer function's variables even after the outer function has returned.

---

## 2. Lexical Scoping

Closures rely on **lexical scoping** — a function's scope is determined by **where it is defined**, not where it is called.

```javascript
let globalVar = "I'm global";

function outerFunc() {
    let outerVar = "I'm outer";

    function innerFunc() {
        let innerVar = "I'm inner";
        console.log(globalVar); // ✅ Accessible
        console.log(outerVar);  // ✅ Accessible (closure)
        console.log(innerVar);  // ✅ Accessible
    }

    innerFunc();
    // console.log(innerVar); // ❌ Error: innerVar is not defined
}

outerFunc();
```

### Scope Chain

```
innerFunc scope → outerFunc scope → Global scope
```

The JavaScript engine looks for a variable in the current scope first, then moves outward through the scope chain.

---

## 3. How Closures Work

When a function is created, it carries a hidden reference to its **lexical environment** (the scope in which it was defined).

```javascript
function createCounter() {
    let count = 0; // This variable is "enclosed" in the closure

    return function () {
        count++;
        console.log(count);
    };
}

let counter = createCounter();
counter(); // 1
counter(); // 2
counter(); // 3

// 'count' is not accessible directly
// console.log(count); // ❌ Error: count is not defined
```

Each call to `counter()` increments the same `count` variable because the returned function maintains a reference to it.

### Multiple Independent Closures

```javascript
let counter1 = createCounter();
let counter2 = createCounter();

counter1(); // 1
counter1(); // 2
counter2(); // 1 (independent closure, separate 'count')
counter2(); // 2
```

---

## 4. Private Variables with Closures

Closures are used to create **private variables** that are accessible only through specific methods. JavaScript doesn't have built-in private access modifiers (before `#` syntax in classes), so closures provide this functionality.

```javascript
var createPerson = function (name, age) {
    var _name = name;    // Private variable
    var _age = age;      // Private variable

    return {
        getName: function () {
            return _name;
        },
        getAge: function () {
            return _age;
        },
        setAge: function (newAge) {
            if (newAge > 0) {
                _age = newAge;
            }
        }
    };
};

var person = createPerson("Alice", 25);
console.log(person.getName()); // "Alice"
console.log(person.getAge());  // 25

person.setAge(26);
console.log(person.getAge());  // 26

// Private variables are NOT accessible directly
console.log(person._name); // undefined
console.log(person._age);  // undefined
```

---

## 5. Closure with Return Object (Module Pattern)

This is the pattern from the original notes — creating a function that returns an object with methods that can access private variables.

### Syntax

```javascript
var moduleName = function () {
    var privateVar = value;

    return {
        method1: function () {
            // Can access privateVar
        },
        method2: function () {
            // Can access privateVar
        }
    };
};

var instance = moduleName();
// instance.privateVar → undefined (private)
// instance.method1()  → works ✅
```

### Example: Bank Account

```javascript
var createBankAccount = function (initialBalance) {
    var balance = initialBalance; // Private variable
    var transactions = [];        // Private variable

    return {
        deposit: function (amount) {
            if (amount > 0) {
                balance += amount;
                transactions.push("Deposited: ₹" + amount);
                console.log("Deposited ₹" + amount);
            }
        },
        withdraw: function (amount) {
            if (amount > 0 && amount <= balance) {
                balance -= amount;
                transactions.push("Withdrawn: ₹" + amount);
                console.log("Withdrawn ₹" + amount);
            } else {
                console.log("Insufficient balance!");
            }
        },
        getBalance: function () {
            return balance;
        },
        getTransactions: function () {
            return [...transactions]; // Return a copy
        }
    };
};

var account = createBankAccount(1000);
account.deposit(500);             // "Deposited ₹500"
account.withdraw(200);            // "Withdrawn ₹200"
console.log(account.getBalance()); // 1300

// Private variables are NOT accessible
console.log(account.balance);       // undefined
console.log(account.transactions);  // undefined
```

---

## 6. Closure in Loops

A common pitfall with closures inside loops.

### The Problem (using `var`)

```javascript
for (var i = 0; i < 3; i++) {
    setTimeout(function () {
        console.log(i);
    }, 1000);
}
// Output: 3, 3, 3 (NOT 0, 1, 2)
// Because 'var' is function-scoped, all callbacks share the same 'i'
```

### Solution 1: Using `let` (Block Scoping)

```javascript
for (let i = 0; i < 3; i++) {
    setTimeout(function () {
        console.log(i);
    }, 1000);
}
// Output: 0, 1, 2 ✅
// 'let' creates a new scope for each iteration
```

### Solution 2: Using IIFE (Closure)

```javascript
for (var i = 0; i < 3; i++) {
    (function (j) {
        setTimeout(function () {
            console.log(j);
        }, 1000);
    })(i);
}
// Output: 0, 1, 2 ✅
// Each IIFE creates a new closure with its own copy of 'i'
```

### Solution 3: Using a Closure Function

```javascript
function createLogger(value) {
    return function () {
        console.log(value);
    };
}

for (var i = 0; i < 3; i++) {
    setTimeout(createLogger(i), 1000);
}
// Output: 0, 1, 2 ✅
```

---

## 7. Function Factories

Closures allow you to create **functions that generate other functions** with pre-configured behavior.

```javascript
function multiplier(factor) {
    return function (number) {
        return number * factor;
    };
}

let double = multiplier(2);
let triple = multiplier(3);
let tenTimes = multiplier(10);

console.log(double(5));   // 10
console.log(triple(5));   // 15
console.log(tenTimes(5)); // 50
```

### Greeting Factory

```javascript
function createGreeting(greeting) {
    return function (name) {
        return `${greeting}, ${name}!`;
    };
}

let sayHello = createGreeting("Hello");
let sayNamaste = createGreeting("Namaste");

console.log(sayHello("Alice"));    // "Hello, Alice!"
console.log(sayNamaste("Rahul"));  // "Namaste, Rahul!"
```

---

## 8. Currying with Closures

**Currying** transforms a function with multiple arguments into a sequence of functions, each taking a single argument.

```javascript
// Regular function
function add(a, b, c) {
    return a + b + c;
}
console.log(add(1, 2, 3)); // 6

// Curried version using closures
function curriedAdd(a) {
    return function (b) {
        return function (c) {
            return a + b + c;
        };
    };
}

console.log(curriedAdd(1)(2)(3)); // 6

// Partial application
let addOne = curriedAdd(1);
let addOneAndTwo = addOne(2);
console.log(addOneAndTwo(3)); // 6
console.log(addOneAndTwo(10)); // 13
```

### Practical Currying: URL Builder

```javascript
function buildURL(baseURL) {
    return function (endpoint) {
        return function (id) {
            return `${baseURL}/${endpoint}/${id}`;
        };
    };
}

let apiURL = buildURL("https://api.example.com");
let usersURL = apiURL("users");
let postsURL = apiURL("posts");

console.log(usersURL(42));  // "https://api.example.com/users/42"
console.log(postsURL(101)); // "https://api.example.com/posts/101"
```

---

## 9. Event Handlers & Closures

Closures are commonly used in event handlers to retain access to variables.

```javascript
function setupButtons() {
    let buttons = document.querySelectorAll(".btn");

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function () {
            console.log("Button " + (i + 1) + " clicked");
        });
    }
}
// Each click handler closes over its own 'i' (because of 'let')
```

### Counter Button

```javascript
function createCounterButton(buttonId) {
    let count = 0; // Private to each button

    document.getElementById(buttonId).addEventListener("click", function () {
        count++;
        this.textContent = "Clicked: " + count;
    });
}

createCounterButton("btn1");
createCounterButton("btn2"); // Independent counter
```

---

## 10. `setTimeout` & Closures

```javascript
function delayedMessages() {
    for (let i = 1; i <= 5; i++) {
        setTimeout(function () {
            console.log("Message " + i);
        }, i * 1000);
    }
}

delayedMessages();
// After 1s: "Message 1"
// After 2s: "Message 2"
// After 3s: "Message 3"
// After 4s: "Message 4"
// After 5s: "Message 5"
```

### Countdown with Closure

```javascript
function startCountdown(seconds) {
    let remaining = seconds;

    let timer = setInterval(function () {
        console.log(remaining);
        remaining--;

        if (remaining < 0) {
            clearInterval(timer);
            console.log("Done!");
        }
    }, 1000);
}

startCountdown(5); // 5, 4, 3, 2, 1, 0, Done!
```

---

## 11. IIFE (Immediately Invoked Function Expression)

An IIFE creates a closure **immediately** — commonly used to avoid polluting the global scope.

```javascript
var counter = (function () {
    var count = 0; // Private

    return {
        increment: function () {
            count++;
            return count;
        },
        decrement: function () {
            count--;
            return count;
        },
        getCount: function () {
            return count;
        }
    };
})();

console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.decrement()); // 1
console.log(counter.getCount());  // 1
// console.log(counter.count);    // undefined (private)
```

---

## 12. Memoization with Closures

**Memoization** caches the results of expensive function calls to improve performance.

```javascript
function memoize(fn) {
    let cache = {}; // Private cache via closure

    return function (n) {
        if (cache[n] !== undefined) {
            console.log("From cache");
            return cache[n];
        }
        console.log("Computing...");
        cache[n] = fn(n);
        return cache[n];
    };
}

function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

let memoizedFactorial = memoize(factorial);

console.log(memoizedFactorial(5)); // "Computing..." → 120
console.log(memoizedFactorial(5)); // "From cache"   → 120
console.log(memoizedFactorial(6)); // "Computing..." → 720
```

---

## 13. Common Mistakes

### Mistake 1: Closures Share References, Not Values

```javascript
function createFunctions() {
    var funcs = [];

    for (var i = 0; i < 3; i++) {
        funcs.push(function () {
            return i; // All closures share the same 'i'
        });
    }

    return funcs;
}

var myFuncs = createFunctions();
console.log(myFuncs[0]()); // 3 (not 0!)
console.log(myFuncs[1]()); // 3 (not 1!)
console.log(myFuncs[2]()); // 3 (not 2!)

// Fix: use 'let' instead of 'var' in the loop
```

### Mistake 2: Memory Leaks

```javascript
// BAD: Closure keeps reference to large data unnecessarily
function processData() {
    let hugeArray = new Array(1000000).fill("data");

    return function () {
        // hugeArray is kept in memory even if not needed
        console.log("Processing done");
    };
}

// GOOD: Only close over what you need
function processDataBetter() {
    let hugeArray = new Array(1000000).fill("data");
    let result = hugeArray.length; // Extract what's needed

    return function () {
        console.log("Processed " + result + " items");
    };
}
```

### Mistake 3: Accidental Closure Over `this`

```javascript
let obj = {
    name: "Alice",
    greet: function () {
        setTimeout(function () {
            console.log(this.name); // undefined ('this' is window/global)
        }, 1000);
    }
};

// Fix 1: Arrow function (inherits 'this')
let objFixed1 = {
    name: "Alice",
    greet: function () {
        setTimeout(() => {
            console.log(this.name); // "Alice" ✅
        }, 1000);
    }
};

// Fix 2: Store 'this' in a variable (classic closure approach)
let objFixed2 = {
    name: "Alice",
    greet: function () {
        let self = this;
        setTimeout(function () {
            console.log(self.name); // "Alice" ✅
        }, 1000);
    }
};
```

---

## 14. Practical Examples

### Rate Limiter

```javascript
function createRateLimiter(limit, interval) {
    let calls = 0;

    setInterval(function () {
        calls = 0; // Reset every interval
    }, interval);

    return function (fn) {
        if (calls < limit) {
            calls++;
            fn();
        } else {
            console.log("Rate limit exceeded. Try again later.");
        }
    };
}

let limiter = createRateLimiter(3, 5000); // 3 calls per 5 seconds
limiter(() => console.log("API call 1")); // ✅
limiter(() => console.log("API call 2")); // ✅
limiter(() => console.log("API call 3")); // ✅
limiter(() => console.log("API call 4")); // "Rate limit exceeded..."
```

### Once Function (Execute Only Once)

```javascript
function once(fn) {
    let executed = false;
    let result;

    return function (...args) {
        if (!executed) {
            executed = true;
            result = fn.apply(this, args);
        }
        return result;
    };
}

let initialize = once(function () {
    console.log("Initialized!");
    return true;
});

initialize(); // "Initialized!" → true
initialize(); // (nothing logged) → true (cached result)
initialize(); // (nothing logged) → true
```

### Debounce Function

```javascript
function debounce(fn, delay) {
    let timerId;

    return function (...args) {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

let searchHandler = debounce(function (query) {
    console.log("Searching for: " + query);
}, 300);

// Only the last call within 300ms will execute
searchHandler("J");
searchHandler("Ja");
searchHandler("Jav");
searchHandler("Java");
// After 300ms → "Searching for: Java"
```

---

## Summary

| Concept                | Description                                                      |
|------------------------|------------------------------------------------------------------|
| **Closure**            | A function that remembers its outer scope even after it returns  |
| **Lexical Scoping**    | Scope is determined by where a function is defined               |
| **Private Variables**  | Variables hidden from outside using closures                     |
| **Module Pattern**     | Return an object with methods that access private variables      |
| **Closure in Loops**   | Use `let` or IIFE to avoid shared variable issues                |
| **Function Factory**   | A function that returns pre-configured functions                 |
| **Currying**           | Transform a multi-arg function into chained single-arg functions |
| **Memoization**        | Cache results of expensive computations using closures           |
| **IIFE**               | Immediately invoked function to create isolated scope            |
| **Debounce / Throttle**| Control function execution frequency using closures              |
