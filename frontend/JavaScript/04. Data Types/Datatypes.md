# JavaScript Data Types

Data types specify what type of data can be stored and manipulated within a program. JavaScript is a **dynamically-typed** language, meaning variables can hold values of any type without explicit type declaration.

---

## 📑 Table of Contents

1. [What are Data Types?](#what-are-data-types)
2. [Types of Data Types](#types-of-data-types)
3. [Primitive Data Types](#primitive-data-types)
   - [String](#string)
   - [Number](#number)
   - [Boolean](#boolean)
   - [Undefined](#undefined)
   - [Null](#null)
   - [BigInt](#bigint)
   - [Symbol](#symbol)
4. [Non-Primitive Data Types (Reference Types)](#non-primitive-data-types-reference-types)
   - [Object](#object)
   - [Array](#array)
   - [Function](#function)
   - [Date](#date)
   - [RegExp](#regexp)
   - [Map](#map)
   - [Set](#set)
5. [Difference Between Primitive and Non-Primitive](#difference-between-primitive-and-non-primitive)
6. [Type Checking (typeof Operator)](#type-checking-typeof-operator)
7. [Type Coercion](#type-coercion)
8. [Type Conversion](#type-conversion)
9. [Special Values](#special-values)
10. [Best Practices](#best-practices)
11. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
12. [Practical Examples](#practical-examples)
13. [Comparison Table](#comparison-table)

---

## What are Data Types?

**Data types** define the kind of data that can be stored and manipulated within a program. JavaScript has two categories of data types:

### Key Characteristics:
- JavaScript is **dynamically typed** (type is determined at runtime)
- Variables can change types during execution
- No need to explicitly declare variable types
- Type checking happens automatically

### Example:
```javascript
let variable = 42;           // Number
console.log(typeof variable); // "number"

variable = "Hello";          // Now a String
console.log(typeof variable); // "string"

variable = true;             // Now a Boolean
console.log(typeof variable); // "boolean"
```

---

## Types of Data Types

JavaScript data types are classified into **two main categories**:

### 1. **Primitive Data Types** (7 types)
   - String
   - Number
   - Boolean
   - Undefined
   - Null
   - BigInt (ES2020)
   - Symbol (ES6)

### 2. **Non-Primitive Data Types** (Reference Types)
   - Object
   - Array
   - Function
   - Date
   - RegExp
   - Map
   - Set

### Visual Diagram:
```
JavaScript Data Types
├── Primitive (Stack)
│   ├── String
│   ├── Number
│   ├── Boolean
│   ├── Undefined
│   ├── Null
│   ├── BigInt
│   └── Symbol
└── Non-Primitive (Heap)
    ├── Object
    ├── Array
    ├── Function
    ├── Date
    ├── RegExp
    ├── Map
    └── Set
```

---

## Primitive Data Types

Primitive data types are **immutable** (cannot be changed) and stored **by value**.

---

### String

The **String** type represents textual data enclosed in quotes.

#### Characteristics:
- Immutable (cannot be changed, only replaced)
- Can use single (`'`), double (`"`), or backticks (`` ` ``)
- Zero-indexed (first character at index 0)

#### Example 1: Basic String
```javascript
let name = "Alice";
let greeting = 'Hello';
let message = `Welcome`;

console.log(typeof name);      // "string"
console.log(typeof greeting);  // "string"
console.log(typeof message);   // "string"
```

#### Example 2: String Concatenation
```javascript
let firstName = "John";
let lastName = "Doe";
let fullName = firstName + " " + lastName;

console.log(fullName);        // "John Doe"
console.log(typeof fullName); // "string"
```

#### Example 3: Template Literals (ES6)
```javascript
let name = "Alice";
let age = 25;
let message = `My name is ${name} and I am ${age} years old.`;

console.log(message); // "My name is Alice and I am 25 years old."
```

#### Example 4: String Properties and Methods
```javascript
let text = "JavaScript";

console.log(text.length);           // 10
console.log(text.toUpperCase());    // "JAVASCRIPT"
console.log(text.toLowerCase());    // "javascript"
console.log(text.charAt(0));        // "J"
console.log(text.substring(0, 4));  // "Java"
console.log(text.includes("Script")); // true
```

#### Example 5: Multiline Strings
```javascript
// Using template literals
let multiline = `This is line 1
This is line 2
This is line 3`;

console.log(multiline);

// Using escape characters
let escaped = "Line 1\nLine 2\nLine 3";
console.log(escaped);
```

#### Example 6: String Immutability
```javascript
let str = "Hello";
str[0] = "J";  // Doesn't change the string
console.log(str); // "Hello" (unchanged)

str = "Jello";  // Create new string
console.log(str); // "Jello"
```

---

### Number

The **Number** type represents both integer and floating-point numbers.

#### Characteristics:
- Represents integers and decimals
- Range: ±1.7976931348623157 × 10^308 (Number.MAX_VALUE)
- Safe integer range: -(2^53 - 1) to (2^53 - 1)
- Special values: Infinity, -Infinity, NaN

#### Example 1: Basic Numbers
```javascript
let age = 25;              // Integer
let price = 19.99;         // Floating-point
let negative = -42;        // Negative number

console.log(typeof age);    // "number"
console.log(typeof price);  // "number"
console.log(`Age: ${age}, Price: ${price}`); // Age: 25, Price: 19.99
```

#### Example 2: Arithmetic Operations
```javascript
let a = 10;
let b = 3;

console.log(a + b);  // 13 (Addition)
console.log(a - b);  // 7  (Subtraction)
console.log(a * b);  // 30 (Multiplication)
console.log(a / b);  // 3.3333... (Division)
console.log(a % b);  // 1  (Modulus/Remainder)
console.log(a ** b); // 1000 (Exponentiation)
```

#### Example 3: Special Number Values
```javascript
console.log(1 / 0);        // Infinity
console.log(-1 / 0);       // -Infinity
console.log("abc" / 2);    // NaN (Not a Number)
console.log(0 / 0);        // NaN

console.log(typeof Infinity);  // "number"
console.log(typeof NaN);       // "number"
```

#### Example 4: Number Methods
```javascript
let num = 123.456;

console.log(num.toFixed(2));       // "123.46" (2 decimals)
console.log(num.toPrecision(4));   // "123.5" (4 significant digits)
console.log(num.toString());       // "123.456" (convert to string)

console.log(parseInt("42px"));     // 42 (parse integer)
console.log(parseFloat("3.14abc")); // 3.14 (parse float)
```

#### Example 5: Checking for NaN
```javascript
let result = "hello" / 2;

console.log(result);           // NaN
console.log(typeof result);    // "number"
console.log(isNaN(result));    // true
console.log(Number.isNaN(result)); // true (recommended)

console.log(isNaN("hello"));       // true (coerces to number first)
console.log(Number.isNaN("hello")); // false (strict check)
```

#### Example 6: Number Constants
```javascript
console.log(Number.MAX_VALUE);         // 1.7976931348623157e+308
console.log(Number.MIN_VALUE);         // 5e-324
console.log(Number.MAX_SAFE_INTEGER);  // 9007199254740991
console.log(Number.MIN_SAFE_INTEGER);  // -9007199254740991
console.log(Number.POSITIVE_INFINITY); // Infinity
console.log(Number.NEGATIVE_INFINITY); // -Infinity
console.log(Number.NaN);               // NaN
```

---

### Boolean

The **Boolean** type represents logical values: `true` or `false`.

#### Characteristics:
- Only two possible values: `true` or `false`
- Used in conditional statements
- Result of comparison operations

#### Example 1: Basic Boolean
```javascript
let isLoggedIn = true;
let hasAccess = false;

console.log(typeof isLoggedIn); // "boolean"
console.log(typeof hasAccess);  // "boolean"
console.log(isLoggedIn);        // true
```

#### Example 2: Comparison Operations
```javascript
let age = 18;

console.log(age > 21);   // false
console.log(age >= 18);  // true
console.log(age === 18); // true
console.log(age !== 21); // true
```

#### Example 3: Logical Operations
```javascript
let isAdult = true;
let hasLicense = false;

console.log(isAdult && hasLicense); // false (AND)
console.log(isAdult || hasLicense); // true (OR)
console.log(!isAdult);              // false (NOT)
```

#### Example 4: Boolean in Conditionals
```javascript
let temperature = 30;
let isHot = temperature > 25;

if (isHot) {
    console.log("It's hot outside!"); // Executes
} else {
    console.log("It's cool outside!");
}
```

#### Example 5: Truthy and Falsy Values
```javascript
// Falsy values (convert to false)
console.log(Boolean(false));      // false
console.log(Boolean(0));          // false
console.log(Boolean(""));         // false
console.log(Boolean(null));       // false
console.log(Boolean(undefined));  // false
console.log(Boolean(NaN));        // false

// Truthy values (convert to true)
console.log(Boolean(true));       // true
console.log(Boolean(1));          // true
console.log(Boolean("hello"));    // true
console.log(Boolean([]));         // true
console.log(Boolean({}));         // true
```

---

### Undefined

The **Undefined** type represents a variable that has been declared but not assigned a value.

#### Characteristics:
- Automatically assigned to uninitialized variables
- Function returns `undefined` if no return statement
- Accessing non-existent object properties returns `undefined`

#### Example 1: Uninitialized Variable
```javascript
var a;
console.log(typeof a); // "undefined"
console.log(a);        // undefined
```

#### Example 2: let and const with Undefined
```javascript
var a;
let b;

console.log(typeof a); // "undefined"
console.log(a);        // undefined

console.log(typeof b); // "undefined"
console.log(b);        // undefined

// const c;  // SyntaxError: Missing initializer in const declaration
```

#### Example 3: Function Without Return
```javascript
function test() {
    let x = 10;
    // No return statement
}

let result = test();
console.log(result);        // undefined
console.log(typeof result); // "undefined"
```

#### Example 4: Non-Existent Object Property
```javascript
let person = {
    name: "John",
    age: 30
};

console.log(person.name);     // "John"
console.log(person.address);  // undefined
console.log(typeof person.address); // "undefined"
```

#### Example 5: Array with Undefined
```javascript
let arr = [1, 2, 3];

console.log(arr[0]);  // 1
console.log(arr[10]); // undefined (index doesn't exist)

arr[5] = 50;
console.log(arr);     // [1, 2, 3, empty × 2, 50]
console.log(arr[4]);  // undefined (sparse array)
```

#### Example 6: Undefined vs Not Defined
```javascript
let declared;
console.log(declared); // undefined (variable exists)

// console.log(notDeclared); // ReferenceError: notDeclared is not defined
```

---

### Null

The **Null** type represents an intentional absence of any value or an empty/unknown value.

#### Characteristics:
- Must be explicitly assigned
- Represents "no value" or "empty"
- `typeof null` returns "object" (JavaScript bug)

#### Example 1: Basic Null
```javascript
let userName = null;
console.log(typeof userName); // "object" (known bug)
console.log(userName);        // null
```

#### Example 2: Null vs Undefined
```javascript
let a;           // undefined (not initialized)
let b = null;    // null (explicitly set to no value)

console.log(a);  // undefined
console.log(b);  // null

console.log(a == b);   // true (loose equality)
console.log(a === b);  // false (strict equality)
```

#### Example 3: Intentional Empty Value
```javascript
let selectedUser = null; // No user selected yet

function selectUser(id) {
    if (id === 0) {
        selectedUser = null; // Clear selection
    } else {
        selectedUser = { id: id, name: "User" + id };
    }
}

selectUser(0);
console.log(selectedUser); // null
```

#### Example 4: Null in Object
```javascript
let person = {
    name: "John",
    middleName: null, // Explicitly no middle name
    age: 30
};

console.log(person.middleName);  // null
console.log(person.lastName);    // undefined (property doesn't exist)
```

#### Example 5: Checking for Null or Undefined
```javascript
let value = null;

// Check for both null and undefined
if (value == null) {
    console.log("Value is null or undefined"); // Executes
}

// Strict check for null only
if (value === null) {
    console.log("Value is null"); // Executes
}

// Nullish coalescing operator (ES2020)
let defaultValue = value ?? "Default";
console.log(defaultValue); // "Default"
```

---

### BigInt

The **BigInt** type represents integers with arbitrary precision, beyond the safe integer limit.

#### Characteristics:
- Introduced in ES2020
- Can represent integers larger than `Number.MAX_SAFE_INTEGER`
- Created by appending `n` to an integer or using `BigInt()`
- Cannot mix with regular numbers in operations

#### Example 1: Basic BigInt
```javascript
let largeNumber = 1234567890123456789012345678901234567890n;
console.log(typeof largeNumber); // "bigint"
console.log(largeNumber);        // 1234567890123456789012345678901234567890n
```

#### Example 2: Creating BigInt
```javascript
let bigInt1 = 9007199254740991n;           // Using 'n' suffix
let bigInt2 = BigInt(9007199254740991);    // Using BigInt()
let bigInt3 = BigInt("9007199254740991");  // From string

console.log(bigInt1); // 9007199254740991n
console.log(bigInt2); // 9007199254740991n
console.log(bigInt3); // 9007199254740991n
```

#### Example 3: BigInt Operations
```javascript
let a = 10n;
let b = 20n;

console.log(a + b);  // 30n
console.log(a * b);  // 200n
console.log(b - a);  // 10n
console.log(b / a);  // 2n (division returns BigInt, not decimal)
console.log(b % a);  // 0n
console.log(a ** b); // 100000000000000000000n
```

#### Example 4: BigInt Limitations
```javascript
let bigInt = 10n;
let number = 20;

// Cannot mix BigInt and Number
// console.log(bigInt + number); // TypeError

// Must convert explicitly
console.log(bigInt + BigInt(number)); // 30n
console.log(Number(bigInt) + number); // 30

// No decimal operations
console.log(5n / 2n); // 2n (not 2.5n)
```

#### Example 5: Safe Integer Limits
```javascript
console.log(Number.MAX_SAFE_INTEGER);     // 9007199254740991
console.log(Number.MAX_SAFE_INTEGER + 1); // 9007199254740992
console.log(Number.MAX_SAFE_INTEGER + 2); // 9007199254740992 (precision loss!)

let bigSafe = BigInt(Number.MAX_SAFE_INTEGER) + 2n;
console.log(bigSafe); // 9007199254740993n (accurate!)
```

#### Example 6: BigInt Comparisons
```javascript
console.log(10n === 10);     // false (different types)
console.log(10n == 10);      // true (type coercion)
console.log(10n < 20);       // true (comparison works)
console.log(5n > 3);         // true

// Sorting array with BigInt
let numbers = [30n, 2n, 100n, 5n];
numbers.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
console.log(numbers); // [2n, 5n, 30n, 100n]
```

---

### Symbol

The **Symbol** type represents a unique and immutable primitive value, often used as object property keys.

#### Characteristics:
- Introduced in ES6 (2015)
- Every symbol is unique, even with same description
- Immutable and cannot be auto-converted to string
- Used to create unique object properties

#### Example 1: Basic Symbol
```javascript
let id = Symbol("id");
let id2 = Symbol("id");

console.log(typeof id);   // "symbol"
console.log(typeof id2);  // "symbol"
console.log(id === id2);  // false (each symbol is unique)
```

#### Example 2: Symbol Description
```javascript
let sym1 = Symbol("mySymbol");
let sym2 = Symbol("mySymbol");

console.log(sym1.description);  // "mySymbol"
console.log(sym2.description);  // "mySymbol"
console.log(sym1 === sym2);     // false (different symbols)
```

#### Example 3: Symbols as Object Keys
```javascript
let id = Symbol("id");

let user = {
    name: "John",
    [id]: 123  // Symbol as property key
};

console.log(user.name);  // "John"
console.log(user[id]);   // 123
console.log(user.id);    // undefined (different from Symbol)
```

#### Example 4: Symbols are Hidden in Iterations
```javascript
let id = Symbol("id");

let user = {
    name: "John",
    age: 30,
    [id]: 123
};

// Symbols not shown in for...in
for (let key in user) {
    console.log(key);  // name, age (no Symbol)
}

// Not in Object.keys()
console.log(Object.keys(user));  // ["name", "age"]

// But accessible with Object.getOwnPropertySymbols()
console.log(Object.getOwnPropertySymbols(user));  // [Symbol(id)]
```

#### Example 5: Global Symbol Registry
```javascript
// Create global symbol
let globalSym = Symbol.for("appId");
let sameSym = Symbol.for("appId");

console.log(globalSym === sameSym);  // true (same global symbol)

// Get key from symbol
console.log(Symbol.keyFor(globalSym));  // "appId"

// Local symbol vs global symbol
let localSym = Symbol("appId");
console.log(localSym === globalSym);  // false
```

#### Example 6: Well-known Symbols
```javascript
// Symbol.iterator - makes object iterable
let range = {
    from: 1,
    to: 5,
    
    [Symbol.iterator]() {
        return {
            current: this.from,
            last: this.to,
            
            next() {
                if (this.current <= this.last) {
                    return { done: false, value: this.current++ };
                } else {
                    return { done: true };
                }
            }
        };
    }
};

for (let num of range) {
    console.log(num);  // 1, 2, 3, 4, 5
}
```

---

## Non-Primitive Data Types (Reference Types)

Non-primitive data types are **mutable** (can be changed) and stored **by reference**.

---

### Object

The **Object** type is a collection of key-value pairs (properties and methods).

#### Characteristics:
- Stores multiple values as properties
- Properties can be any data type
- Mutable (can be modified)
- Stored by reference

#### Example 1: Basic Object
```javascript
let person = {
    name: "John",
    age: 30,
    city: "New York"
};

console.log(typeof person);  // "object"
console.log(person.name);    // "John"
console.log(person["age"]);  // 30
```

#### Example 2: Object Methods
```javascript
let person = {
    firstName: "John",
    lastName: "Doe",
    fullName: function() {
        return this.firstName + " " + this.lastName;
    }
};

console.log(person.fullName());  // "John Doe"
```

#### Example 3: Adding and Deleting Properties
```javascript
let car = {
    brand: "Toyota",
    model: "Camry"
};

// Add property
car.year = 2023;
console.log(car);  // { brand: "Toyota", model: "Camry", year: 2023 }

// Delete property
delete car.model;
console.log(car);  // { brand: "Toyota", year: 2023 }
```

#### Example 4: Nested Objects
```javascript
let student = {
    name: "Alice",
    age: 20,
    address: {
        street: "123 Main St",
        city: "Boston",
        zip: "02101"
    }
};

console.log(student.address.city);  // "Boston"
console.log(student.address.zip);   // "02101"
```

#### Example 5: Object Constructor
```javascript
let person1 = new Object();
person1.name = "John";
person1.age = 30;

console.log(person1);  // { name: "John", age: 30 }
```

#### Example 6: Object Reference
```javascript
let obj1 = { value: 10 };
let obj2 = obj1;  // Reference copy

obj2.value = 20;

console.log(obj1.value);  // 20 (obj1 is also modified)
console.log(obj2.value);  // 20
console.log(obj1 === obj2);  // true (same reference)
```

---

### Array

The **Array** type is a special object used to store ordered collections of values.

#### Characteristics:
- Ordered collection (indexed from 0)
- Can store mixed data types
- Dynamic size (grows/shrinks automatically)
- Many built-in methods

#### Example 1: Basic Array
```javascript
let fruits = ["Apple", "Banana", "Orange"];

console.log(typeof fruits);     // "object"
console.log(Array.isArray(fruits));  // true
console.log(fruits[0]);         // "Apple"
console.log(fruits.length);     // 3
```

#### Example 2: Mixed Data Types
```javascript
let mixed = [1, "Hello", true, null, { name: "John" }, [1, 2, 3]];

console.log(mixed[0]);  // 1
console.log(mixed[1]);  // "Hello"
console.log(mixed[4]);  // { name: "John" }
console.log(mixed[5]);  // [1, 2, 3]
```

#### Example 3: Array Methods
```javascript
let numbers = [1, 2, 3, 4, 5];

// Add/remove elements
numbers.push(6);           // Add to end
numbers.unshift(0);        // Add to beginning
numbers.pop();             // Remove from end
numbers.shift();           // Remove from beginning

console.log(numbers);      // [2, 3, 4, 5]

// Other methods
console.log(numbers.slice(1, 3));   // [3, 4] (extract)
console.log(numbers.includes(3));    // true
console.log(numbers.indexOf(4));     // 2
```

#### Example 4: Array Iteration
```javascript
let colors = ["Red", "Green", "Blue"];

// forEach
colors.forEach((color, index) => {
    console.log(`${index}: ${color}`);
});
// 0: Red
// 1: Green
// 2: Blue

// map
let uppercase = colors.map(color => color.toUpperCase());
console.log(uppercase);  // ["RED", "GREEN", "BLUE"]

// filter
let filtered = colors.filter(color => color.length > 3);
console.log(filtered);  // ["Green", "Blue"]
```

#### Example 5: Multidimensional Array
```javascript
let matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

console.log(matrix[0][0]);  // 1
console.log(matrix[1][2]);  // 6
console.log(matrix[2][1]);  // 8
```

#### Example 6: Array Destructuring
```javascript
let arr = [10, 20, 30, 40];

let [first, second, ...rest] = arr;

console.log(first);   // 10
console.log(second);  // 20
console.log(rest);    // [30, 40]
```

---

### Function

The **Function** type is a special object that contains executable code.

#### Characteristics:
- First-class citizens (can be assigned to variables)
- Can be passed as arguments
- Can return other functions
- Has its own properties and methods

#### Example 1: Function Declaration
```javascript
function greet(name) {
    return `Hello, ${name}!`;
}

console.log(typeof greet);  // "function"
console.log(greet("Alice")); // "Hello, Alice!"
```

#### Example 2: Function Expression
```javascript
let multiply = function(a, b) {
    return a * b;
};

console.log(typeof multiply);  // "function"
console.log(multiply(5, 3));   // 15
```

#### Example 3: Arrow Function
```javascript
let add = (a, b) => a + b;

console.log(typeof add);  // "function"
console.log(add(10, 5));  // 15

// With single parameter
let square = x => x * x;
console.log(square(4));  // 16
```

#### Example 4: Function as Argument
```javascript
function operate(a, b, operation) {
    return operation(a, b);
}

let result1 = operate(5, 3, (x, y) => x + y);
console.log(result1);  // 8

let result2 = operate(5, 3, (x, y) => x * y);
console.log(result2);  // 15
```

#### Example 5: Function Returning Function
```javascript
function multiplier(factor) {
    return function(number) {
        return number * factor;
    };
}

let double = multiplier(2);
let triple = multiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15
```

---

### Date

The **Date** object represents dates and times.

#### Example 1: Creating Dates
```javascript
let now = new Date();
console.log(now);                 // Current date and time
console.log(typeof now);          // "object"

let specific = new Date("2024-01-15");
console.log(specific);            // Mon Jan 15 2024

let withTime = new Date(2024, 0, 15, 10, 30, 0);
console.log(withTime);            // Mon Jan 15 2024 10:30:00
```

#### Example 2: Date Methods
```javascript
let date = new Date();

console.log(date.getFullYear());  // 2026
console.log(date.getMonth());     // 1 (February, 0-indexed)
console.log(date.getDate());      // 8
console.log(date.getDay());       // 6 (Saturday, 0 = Sunday)
console.log(date.getHours());     // Current hour
```

---

### RegExp

The **RegExp** object represents regular expressions for pattern matching.

#### Example 1: Creating RegExp
```javascript
let pattern1 = /hello/i;  // Literal notation
let pattern2 = new RegExp("hello", "i");  // Constructor

console.log(typeof pattern1);  // "object"
console.log(pattern1.test("Hello World"));  // true (case-insensitive)
```

#### Example 2: Pattern Matching
```javascript
let email = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

console.log(email.test("user@example.com"));  // true
console.log(email.test("invalid-email"));     // false
```

---

### Map

The **Map** object holds key-value pairs and remembers the original insertion order.

#### Characteristics:
- Keys can be any type (object, function, primitive)
- Maintains insertion order
- Has size property
- Better performance for frequent additions/deletions

#### Example 1: Basic Map
```javascript
let map = new Map();

map.set("name", "John");
map.set("age", 30);
map.set(1, "one");

console.log(typeof map);     // "object"
console.log(map.get("name")); // "John"
console.log(map.get(1));     // "one"
console.log(map.size);       // 3
```

#### Example 2: Map with Object Keys
```javascript
let user1 = { name: "John" };
let user2 = { name: "Alice" };

let preferences = new Map();
preferences.set(user1, "Dark Mode");
preferences.set(user2, "Light Mode");

console.log(preferences.get(user1));  // "Dark Mode"
console.log(preferences.get(user2));  // "Light Mode"
```

#### Example 3: Map Iteration
```javascript
let map = new Map([
    ["name", "John"],
    ["age", 30],
    ["city", "New York"]
]);

// Iterate over keys
for (let key of map.keys()) {
    console.log(key);  // name, age, city
}

// Iterate over values
for (let value of map.values()) {
    console.log(value);  // John, 30, New York
}

// Iterate over entries
for (let [key, value] of map) {
    console.log(`${key}: ${value}`);
}
```

---

### Set

The **Set** object stores unique values of any type.

#### Characteristics:
- Stores only unique values (no duplicates)
- Maintains insertion order
- Can store any data type
- Has size property

#### Example 1: Basic Set
```javascript
let set = new Set();

set.add(1);
set.add(2);
set.add(3);
set.add(2);  // Duplicate, ignored

console.log(typeof set);  // "object"
console.log(set.size);    // 3 (not 4)
console.log(set.has(2));  // true
```

#### Example 2: Set from Array
```javascript
let numbers = [1, 2, 2, 3, 3, 3, 4, 5, 5];
let uniqueNumbers = new Set(numbers);

console.log(uniqueNumbers);  // Set(5) { 1, 2, 3, 4, 5 }

// Convert back to array
let uniqueArray = [...uniqueNumbers];
console.log(uniqueArray);    // [1, 2, 3, 4, 5]
```

#### Example 3: Set Operations
```javascript
let mySet = new Set([1, 2, 3, 4, 5]);

// Add and delete
mySet.add(6);
mySet.delete(2);

console.log(mySet);  // Set(5) { 1, 3, 4, 5, 6 }

// Iterate
for (let value of mySet) {
    console.log(value);  // 1, 3, 4, 5, 6
}

// Clear all
mySet.clear();
console.log(mySet.size);  // 0
```

---

## Difference Between Primitive and Non-Primitive

### Memory Storage:

| Aspect | Primitive | Non-Primitive |
|--------|-----------|---------------|
| **Storage** | Stack (direct value) | Heap (reference) |
| **Copy** | Value copied | Reference copied |
| **Mutability** | Immutable | Mutable |
| **Comparison** | By value | By reference |
| **Size** | Fixed size | Dynamic size |

### Example 1: Value vs Reference
```javascript
// Primitive (value copy)
let a = 10;
let b = a;  // Copy value
b = 20;

console.log(a);  // 10 (unchanged)
console.log(b);  // 20

// Non-primitive (reference copy)
let obj1 = { value: 10 };
let obj2 = obj1;  // Copy reference
obj2.value = 20;

console.log(obj1.value);  // 20 (changed!)
console.log(obj2.value);  // 20
```

### Example 2: Comparison
```javascript
// Primitive comparison (by value)
let x = 10;
let y = 10;
console.log(x === y);  // true (same value)

// Non-primitive comparison (by reference)
let arr1 = [1, 2, 3];
let arr2 = [1, 2, 3];
console.log(arr1 === arr2);  // false (different references)

let arr3 = arr1;
console.log(arr1 === arr3);  // true (same reference)
```

### Example 3: Immutability
```javascript
// Primitive (immutable)
let str = "Hello";
str[0] = "J";       // No effect
console.log(str);   // "Hello" (unchanged)

// Non-primitive (mutable)
let arr = [1, 2, 3];
arr[0] = 100;       // Changes array
console.log(arr);   // [100, 2, 3]
```

---

## Type Checking (typeof Operator)

The **typeof** operator returns a string indicating the type of a value.

### Syntax:
```javascript
typeof operand
typeof(operand)
```

### Example 1: typeof with Primitives
```javascript
console.log(typeof "Hello");         // "string"
console.log(typeof 42);              // "number"
console.log(typeof true);            // "boolean"
console.log(typeof undefined);       // "undefined"
console.log(typeof Symbol("id"));    // "symbol"
console.log(typeof 123n);            // "bigint"
```

### Example 2: typeof with Non-Primitives
```javascript
console.log(typeof {});              // "object"
console.log(typeof []);              // "object" (arrays are objects)
console.log(typeof function() {});   // "function"
console.log(typeof null);            // "object" (known bug)
console.log(typeof new Date());      // "object"
console.log(typeof /regex/);         // "object"
```

### Example 3: typeof Quirks
```javascript
// null returns "object" (JavaScript bug)
console.log(typeof null);  // "object"
console.log(null === null);  // true

// Array check
let arr = [];
console.log(typeof arr);           // "object"
console.log(Array.isArray(arr));   // true (correct way)

// NaN is "number"
console.log(typeof NaN);  // "number"
console.log(isNaN(NaN));  // true
```

### Example 4: Checking for null
```javascript
let value = null;

// Wrong way
if (typeof value === "object") {
    console.log("This will execute incorrectly");
}

// Correct way
if (value === null) {
    console.log("Value is null");
}

// Check for null or undefined
if (value == null) {
    console.log("Value is null or undefined");
}
```

---

## Type Coercion

**Type coercion** is JavaScript's automatic conversion of values from one type to another.

### Example 1: String Coercion
```javascript
console.log("5" + 2);      // "52" (number to string)
console.log("10" + "20");  // "1020"
console.log("Hello" + 5);  // "Hello5"
```

### Example 2: Number Coercion
```javascript
console.log("5" - 2);   // 3 (string to number)
console.log("10" * "2"); // 20 (both to numbers)
console.log("20" / "4"); // 5
console.log("5" % 2);   // 1
```

### Example 3: Boolean Coercion
```javascript
console.log(Boolean(""));       // false
console.log(Boolean("hello"));  // true
console.log(Boolean(0));        // false
console.log(Boolean(42));       // true

// In conditionals
if ("hello") {
    console.log("Truthy");  // Executes
}

if (0) {
    console.log("Falsy");  // Doesn't execute
}
```

### Example 4: Comparison Coercion
```javascript
// Double equals (coerces types)
console.log(5 == "5");     // true
console.log(true == 1);    // true
console.log(false == 0);   // true
console.log(null == undefined);  // true

// Triple equals (no coercion)
console.log(5 === "5");    // false
console.log(true === 1);   // false
console.log(null === undefined);  // false
```

### Example 5: Addition vs Concatenation
```javascript
console.log(1 + 2);        // 3 (addition)
console.log("1" + 2);      // "12" (concatenation)
console.log(1 + "2");      // "12" (concatenation)
console.log(1 + 2 + "3");  // "33" (1+2=3, then "3"+"3")
console.log("1" + 2 + 3);  // "123" (all concatenation)
```

---

## Type Conversion

**Type conversion** is the explicit conversion of values from one type to another.

### Example 1: Converting to String
```javascript
let num = 42;

// Method 1: String()
console.log(String(num));      // "42"

// Method 2: toString()
console.log(num.toString());   // "42"

// Method 3: Template literals
console.log(`${num}`);         // "42"

// Method 4: Concatenation
console.log(num + "");         // "42"
```

### Example 2: Converting to Number
```javascript
let str = "42";

// Method 1: Number()
console.log(Number(str));      // 42

// Method 2: parseInt() / parseFloat()
console.log(parseInt(str));    // 42
console.log(parseFloat("3.14")); // 3.14

// Method 3: Unary plus
console.log(+str);             // 42

// Method 4: Math operations
console.log(str * 1);          // 42
```

### Example 3: Converting to Boolean
```javascript
// Method 1: Boolean()
console.log(Boolean(1));       // true
console.log(Boolean(0));       // false
console.log(Boolean("hello")); // true
console.log(Boolean(""));      // false

// Method 2: Double NOT
console.log(!!1);              // true
console.log(!!"hello");        // true
console.log(!!"");             // false
```

### Example 4: Handling Invalid Conversions
```javascript
console.log(Number("42"));        // 42
console.log(Number("42px"));      // NaN
console.log(Number("hello"));     // NaN

console.log(parseInt("42px"));    // 42 (parses what it can)
console.log(parseInt("px42"));    // NaN (starts with non-digit)

console.log(String(undefined));   // "undefined"
console.log(String(null));        // "null"
```

---

## Special Values

### NaN (Not a Number)
```javascript
console.log(typeof NaN);           // "number" (it's a number type)
console.log(NaN === NaN);          // false (NaN is not equal to itself)
console.log(isNaN(NaN));           // true
console.log(Number.isNaN(NaN));    // true

console.log("abc" / 2);            // NaN
console.log(Math.sqrt(-1));        // NaN
```

### Infinity
```javascript
console.log(1 / 0);                // Infinity
console.log(-1 / 0);               // -Infinity
console.log(typeof Infinity);      // "number"
console.log(Infinity > 1000000);   // true
```

### undefined vs null
```javascript
let a;                  // undefined (not initialized)
let b = null;           // null (intentional empty)

console.log(typeof a);  // "undefined"
console.log(typeof b);  // "object" (bug)

console.log(a == b);    // true (loose equality)
console.log(a === b);   // false (different types)
```

---

## Best Practices

### ✅ Do:

1. **Use const by Default, let When Needed**
   ```javascript
   const MAX_SIZE = 100;   // Won't change
   let counter = 0;        // Can change
   ```

2. **Use Strict Equality (===)**
   ```javascript
   // Good
   if (value === 5) { }
   
   // Avoid
   if (value == 5) { }  // Can cause unexpected coercion
   ```

3. **Check Array with Array.isArray()**
   ```javascript
   // Good
   if (Array.isArray(data)) { }
   
   // Wrong
   if (typeof data === "object") { }  // null is also "object"
   ```

4. **Explicit Type Conversions**
   ```javascript
   // Good
   let num = Number(str);
   let str2 = String(num);
   
   // Avoid implicit coercion
   let num2 = str * 1;
   ```

5. **Check for null and undefined**
   ```javascript
   // Check for both
   if (value == null) { }
   
   // Or use nullish coalescing
   let result = value ?? "default";
   ```

6. **Use Template Literals for String Concatenation**
   ```javascript
   // Good
   let message = `Hello, ${name}!`;
   
   // Avoid
   let message2 = "Hello, " + name + "!";
   ```

7. **Initialize Variables**
   ```javascript
   // Good
   let count = 0;
   let name = "";
   let items = [];
   
   // Avoid
   let count;  // undefined
   ```

---

## Common Mistakes to Avoid

### ❌ Don't:

1. **Don't Confuse null and undefined**
   ```javascript
   // BAD
   let value = undefined;  // Don't explicitly set to undefined
   
   // GOOD
   let value = null;  // Use null for intentional empty
   ```

2. **Don't Rely on typeof for null**
   ```javascript
   // BAD
   if (typeof value === "object") {
       // null also passes this check!
   }
   
   // GOOD
   if (value !== null && typeof value === "object") { }
   ```

3. **Don't Mix Number and BigInt Without Conversion**
   ```javascript
   // BAD
   // let result = 10n + 20;  // TypeError
   
   // GOOD
   let result = 10n + BigInt(20);  // 30n
   ```

4. **Don't Trust Floating-Point Precision**
   ```javascript
   // BAD
   console.log(0.1 + 0.2 === 0.3);  // false
   
   // GOOD
   console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON);  // true
   ```

5. **Don't Use == for Comparisons**
   ```javascript
   // BAD
   if (value == true) { }  // Unexpected coercion
   
   // GOOD
   if (value === true) { }
   ```

6. **Don't Forget Array Check**
   ```javascript
   // BAD
   if (typeof arr === "object") { }  // null passes too
   
   // GOOD
   if (Array.isArray(arr)) { }
   ```

---

## Practical Examples

### Example 1: Data Validation
```javascript
function validateUser(user) {
    // Check if user is object
    if (typeof user !== "object" || user === null) {
        return "Invalid user";
    }
    
    // Check name is string
    if (typeof user.name !== "string" || user.name.trim() === "") {
        return "Name is required";
    }
    
    // Check age is number
    if (typeof user.age !== "number" || isNaN(user.age)) {
        return "Valid age is required";
    }
    
    // Check email is string
    if (typeof user.email !== "string") {
        return "Email is required";
    }
    
    return "Valid user";
}

console.log(validateUser({ name: "John", age: 30, email: "john@example.com" }));
// "Valid user"

console.log(validateUser({ name: "", age: 30, email: "john@example.com" }));
// "Name is required"
```

### Example 2: Type Conversion Helper
```javascript
function safeConvert(value, targetType) {
    switch (targetType) {
        case "number":
            let num = Number(value);
            return isNaN(num) ? 0 : num;
            
        case "string":
            return String(value);
            
        case "boolean":
            return Boolean(value);
            
        default:
            return value;
    }
}

console.log(safeConvert("42", "number"));     // 42
console.log(safeConvert("abc", "number"));    // 0
console.log(safeConvert(123, "string"));      // "123"
console.log(safeConvert(0, "boolean"));       // false
```

### Example 3: Deep Clone vs Shallow Copy
```javascript
// Shallow copy (reference issue)
let original = { name: "John", hobbies: ["reading", "gaming"] };
let shallowCopy = { ...original };

shallowCopy.name = "Alice";           // OK
shallowCopy.hobbies.push("cooking");  // Modifies original!

console.log(original.name);     // "John" (unchanged)
console.log(original.hobbies);  // ["reading", "gaming", "cooking"] (changed!)

// Deep clone
let deepCopy = JSON.parse(JSON.stringify(original));
deepCopy.hobbies.push("swimming");

console.log(original.hobbies);  // ["reading", "gaming", "cooking"] (unchanged)
console.log(deepCopy.hobbies);  // ["reading", "gaming", "cooking", "swimming"]
```

### Example 4: Remove Duplicates from Array
```javascript
function removeDuplicates(arr) {
    // Method 1: Using Set
    return [...new Set(arr)];
}

let numbers = [1, 2, 2, 3, 4, 4, 5];
console.log(removeDuplicates(numbers));  // [1, 2, 3, 4, 5]

// Method 2: Using filter
function removeDuplicates2(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
}

console.log(removeDuplicates2(numbers));  // [1, 2, 3, 4, 5]
```

### Example 5: Type-Safe Calculator
```javascript
function calculate(a, b, operation) {
    // Validate inputs
    if (typeof a !== "number" || typeof b !== "number") {
        return "Error: Both arguments must be numbers";
    }
    
    if (isNaN(a) || isNaN(b)) {
        return "Error: Invalid number";
    }
    
    // Perform calculation
    switch (operation) {
        case "add":
            return a + b;
        case "subtract":
            return a - b;
        case "multiply":
            return a * b;
        case "divide":
            if (b === 0) return "Error: Division by zero";
            return a / b;
        default:
            return "Error: Invalid operation";
    }
}

console.log(calculate(10, 5, "add"));      // 15
console.log(calculate(10, 5, "divide"));   // 2
console.log(calculate(10, 0, "divide"));   // "Error: Division by zero"
console.log(calculate("10", 5, "add"));    // "Error: Both arguments must be numbers"
```

---

## Comparison Table

| Type | Example | typeof | Mutable | Default Value | Memory |
|------|---------|--------|---------|---------------|--------|
| **String** | `"Hello"` | "string" | ❌ No | `""` | Stack |
| **Number** | `42` | "number" | ❌ No | `0` | Stack |
| **Boolean** | `true` | "boolean" | ❌ No | `false` | Stack |
| **Undefined** | `undefined` | "undefined" | ❌ No | `undefined` | Stack |
| **Null** | `null` | "object" (bug) | ❌ No | `null` | Stack |
| **BigInt** | `123n` | "bigint" | ❌ No | `0n` | Stack |
| **Symbol** | `Symbol()` | "symbol" | ❌ No | N/A | Stack |
| **Object** | `{a: 1}` | "object" | ✅ Yes | `{}` | Heap |
| **Array** | `[1, 2]` | "object" | ✅ Yes | `[]` | Heap |
| **Function** | `function(){}` | "function" | ✅ Yes | N/A | Heap |
| **Date** | `new Date()` | "object" | ✅ Yes | N/A | Heap |
| **RegExp** | `/ab/` | "object" | ✅ Yes | N/A | Heap |
| **Map** | `new Map()` | "object" | ✅ Yes | `new Map()` | Heap |
| **Set** | `new Set()` | "object" | ✅ Yes | `new Set()` | Heap |

---

## Summary

### Key Takeaways:

1. **7 Primitive Types**: String, Number, Boolean, Undefined, Null, BigInt, Symbol
2. **Non-Primitive Types**: Objects, Arrays, Functions (stored by reference)
3. **typeof operator**: Check data types (but watch out for `typeof null === "object"`)
4. **Type Coercion**: JavaScript automatically converts types (use `===` to avoid)
5. **Type Conversion**: Explicitly convert using `Number()`, `String()`, `Boolean()`
6. **Primitives are immutable**, Non-primitives are mutable
7. **Use strict equality (`===`)** to avoid unexpected type coercion

### Quick Reference:

```javascript
// Primitive types (7)
let str = "text";              // string
let num = 42;                  // number
let bool = true;               // boolean
let undef;                     // undefined
let empty = null;              // null (but typeof is "object")
let big = 9007199254740991n;   // bigint
let sym = Symbol("unique");    // symbol

// Non-primitive types
let obj = { key: "value" };    // object
let arr = [1, 2, 3];           // array (object)
let func = function() {};      // function
let date = new Date();         // object
let regex = /pattern/;         // object
let map = new Map();           // object
let set = new Set();           // object

// Type checking
console.log(typeof str);       // "string"
console.log(Array.isArray(arr)); // true
console.log(obj instanceof Object); // true

// Type conversion
let numToStr = String(42);     // "42"
let strToNum = Number("42");   // 42
let anyToBool = Boolean(1);    // true
```

### Memory Model:

```
Stack (Primitives)          Heap (Objects)
┌──────────────┐          ┌──────────────────┐
│ num = 42     │          │ obj: {name:"John"}│
│ str = "Hi"   │────┐     │                  │
│ bool = true  │    │     │ arr: [1, 2, 3]  │
└──────────────┘    │     └──────────────────┘
                    └──────▶ (reference)
```

---

**Remember**: Understanding data types is fundamental to writing bug-free JavaScript code. Always use the right type for the right purpose, and be mindful of type coercion!
