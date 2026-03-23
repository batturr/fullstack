# JavaScript Objects

**Objects** are one of the most important data types in JavaScript. An object is a collection of **properties** (key-value pairs) and **methods** (functions associated with the object). Objects allow you to group related data and functionality together, forming the foundation of **Object-Oriented Programming (OOP)** in JavaScript.

---

## 📑 Table of Contents

- [JavaScript Objects](#javascript-objects)
  - [📑 Table of Contents](#-table-of-contents)
  - [Introduction to Objects](#introduction-to-objects)
    - [Key Points:](#key-points)
    - [Anatomy of an Object:](#anatomy-of-an-object)
    - [Real-World Example:](#real-world-example)
  - [Types of OOP Languages](#types-of-oop-languages)
  - [Creating Objects](#creating-objects)
    - [1. Object Literals](#1-object-literals)
    - [2. Constructor Function](#2-constructor-function)
    - [3. Object.create()](#3-objectcreate)
    - [4. ES6 Classes](#4-es6-classes)
    - [5. Factory Functions](#5-factory-functions)
    - [Creating Objects — Summary:](#creating-objects--summary)
  - [Accessing Object Properties](#accessing-object-properties)
    - [1. Dot Notation](#1-dot-notation)
    - [2. Bracket Notation](#2-bracket-notation)
    - [Dot vs Bracket Notation](#dot-vs-bracket-notation)
  - [Adding, Modifying \& Deleting Properties](#adding-modifying--deleting-properties)
  - [Object Methods](#object-methods)
  - [The `this` Keyword in Objects](#the-this-keyword-in-objects)
  - [Object.keys(), Object.values(), Object.entries()](#objectkeys-objectvalues-objectentries)
    - [Object.keys()](#objectkeys)
    - [Object.values()](#objectvalues)
    - [Object.entries()](#objectentries)
    - [Practical Use Case:](#practical-use-case)
  - [Looping Through Objects](#looping-through-objects)
    - [1. for...in Loop](#1-forin-loop)
    - [2. Object.keys() with forEach](#2-objectkeys-with-foreach)
    - [3. Object.entries() with for...of](#3-objectentries-with-forof)
  - [Nested Objects](#nested-objects)
  - [Object Destructuring (ES6)](#object-destructuring-es6)
  - [Spread \& Rest with Objects (ES6)](#spread--rest-with-objects-es6)
    - [Spread Operator (`...`) — Expanding Objects](#spread-operator---expanding-objects)
    - [Rest Operator (`...`) — Collecting Remaining Properties](#rest-operator---collecting-remaining-properties)
  - [Optional Chaining (?.)](#optional-chaining-)
  - [Computed Property Names](#computed-property-names)
  - [Shorthand Properties \& Methods (ES6)](#shorthand-properties--methods-es6)
  - [JSON (JavaScript Object Notation)](#json-javascript-object-notation)
    - [Key Points:](#key-points-1)
    - [JSON vs Object Literal](#json-vs-object-literal)
    - [JSON.stringify()](#jsonstringify)
    - [JSON.parse()](#jsonparse)
  - [Object Array Literal](#object-array-literal)
  - [Object Array (Constructor)](#object-array-constructor)
  - [Prototype](#prototype)
    - [Why Use Prototype?](#why-use-prototype)
  - [Prototype Chain](#prototype-chain)
  - [Inheritance (Prototypal)](#inheritance-prototypal)
  - [Object Static Methods](#object-static-methods)
    - [Object.assign()](#objectassign)
    - [Object.freeze()](#objectfreeze)
    - [Object.seal()](#objectseal)
    - [Object.keys()](#objectkeys-1)
    - [Object.values()](#objectvalues-1)
    - [Object.entries()](#objectentries-1)
    - [Object.fromEntries()](#objectfromentries)
    - [Object.is()](#objectis)
    - [Object.defineProperty()](#objectdefineproperty)
    - [Object.getOwnPropertyNames()](#objectgetownpropertynames)
    - [Object.getPrototypeOf()](#objectgetprototypeof)
  - [Property Descriptors](#property-descriptors)
  - [Getter and Setter](#getter-and-setter)
  - [Shallow Copy vs Deep Copy](#shallow-copy-vs-deep-copy)
    - [Shallow Copy](#shallow-copy)
    - [Deep Copy](#deep-copy)
  - [Comparing Objects](#comparing-objects)
  - [Symbol as Object Key](#symbol-as-object-key)
  - [Best Practices](#best-practices)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)
    - [1. Using Arrow Functions as Object Methods](#1-using-arrow-functions-as-object-methods)
    - [2. Assuming Object Comparison Works by Value](#2-assuming-object-comparison-works-by-value)
    - [3. Shallow Copy Pitfall](#3-shallow-copy-pitfall)
    - [4. Modifying Object During Iteration](#4-modifying-object-during-iteration)
    - [5. Forgetting `new` with Constructor Functions](#5-forgetting-new-with-constructor-functions)
  - [Practical Examples](#practical-examples)
    - [Example 1: Shopping Cart](#example-1-shopping-cart)
    - [Example 2: Student Grade Manager](#example-2-student-grade-manager)
    - [Example 3: Config Manager with Freeze \& Seal](#example-3-config-manager-with-freeze--seal)
  - [Comparison Table](#comparison-table)
    - [Object Creation Methods](#object-creation-methods)
    - [Object Immutability](#object-immutability)
    - [Object Iteration Methods](#object-iteration-methods)
    - [Copying Methods](#copying-methods)

---

## Introduction to Objects

**Object-Oriented Programming (OOP)** is a programming paradigm (programming style), which is based on the concept of **objects**.

### Key Points:
- An **object** represents a physical item / entity (e.g., a car, a student, a product)
- An object is a collection of two types of members:
  1. **Properties / Fields** — Details about the object (variables stored inside the object)
  2. **Methods** — Manipulations on the properties (functions stored inside the object)
- Properties store **data** about a specific person, product, or thing
- Methods **read from** and/or **write values** into properties
- Objects are **reference types** — variables hold a reference (address) to the object, not the object itself
- Objects are **mutable** — their properties can be changed even when declared with `const`

### Anatomy of an Object:
```
{
    propertyName: value,         ◄── Property (key-value pair)
    │              │
    │              └── Value (any data type)
    └── Key (string or Symbol)
    
    methodName: function() {     ◄── Method (function as value)
        // code
    }
}
```

### Real-World Example:
```
"Car" Object
├── Properties
│   ├── carModel: "Honda City"
│   ├── carColor: "Black"
│   └── carNo: 1234
└── Methods
    ├── start()
    ├── changeGear()
    └── stop()
```

---

## Types of OOP Languages

There are two types of OOP languages:

| Type | Description | Examples |
|------|-------------|----------|
| **Class-based OOP** | Objects are created from classes (blueprints) | Java, C++, C#, Python |
| **Prototype-based OOP** | Objects are created from other objects (prototypes) | JavaScript, Lua |

> **Note:** JavaScript is a **prototype-based** OOP language but supports class syntax since ES6 (which is syntactic sugar over prototypes).

---

## Creating Objects

JavaScript provides multiple ways to create objects:

### 1. Object Literals

Object literals are the simplest and most common way to create objects. They are represented using curly braces `{}`.

**Syntax:**
```javascript
let objectName = {
    property1: value1,
    property2: value2,
    method1: function() { /* ... */ }
};
```

**Example 1: Simple Object**
```javascript
let student = {
    name: "Prince",
    age: 22,
    course: "JavaScript"
};

console.log(student);
// Output: { name: "Prince", age: 22, course: "JavaScript" }
console.log(student.name);   // Output: Prince
console.log(student.age);    // Output: 22
```

**Example 2: Object with Methods**
```javascript
let car = {
    model: "Honda City",
    color: "Black",
    carNo: 1234,
    start: function() {
        console.log(this.model + " started!");
    },
    stop: function() {
        console.log(this.model + " stopped!");
    }
};

car.start();   // Output: Honda City started!
car.stop();    // Output: Honda City stopped!
```

**Example 3: Object with Various Data Types**
```javascript
let person = {
    firstName: "John",            // string
    lastName: "Doe",              // string
    age: 30,                      // number
    isEmployed: true,             // boolean
    hobbies: ["reading", "gaming"], // array
    address: {                    // nested object
        city: "New York",
        zip: "10001"
    },
    greet: function() {           // method
        return `Hi, I'm ${this.firstName} ${this.lastName}`;
    }
};

console.log(person.greet());           // Hi, I'm John Doe
console.log(person.hobbies[0]);         // reading
console.log(person.address.city);       // New York
```

---

### 2. Constructor Function

A **constructor function** is a regular function that is used to create multiple objects of the same type. It receives an empty (new) object and initializes properties and methods to it.

**Key Concepts:**
- The `this` keyword inside the constructor function represents the **current working object**
- It receives parameters to initialize property values
- Called with the `new` keyword
- By convention, constructor function names start with a **capital letter**

**Syntax:**
```javascript
function ConstructorName(param1, param2) {
    this.property1 = param1;
    this.property2 = param2;
    this.method = function() { /* ... */ };
}
let obj = new ConstructorName(arg1, arg2);
```

**Example 1: Basic Constructor Function**
```javascript
function Student(name, age, course) {
    this.name = name;
    this.age = age;
    this.course = course;
    this.display = function() {
        console.log(`${this.name}, Age: ${this.age}, Course: ${this.course}`);
    };
}

let stu1 = new Student("Prince", 22, "JavaScript");
let stu2 = new Student("Alice", 25, "React");

stu1.display();   // Output: Prince, Age: 22, Course: JavaScript
stu2.display();   // Output: Alice, Age: 25, Course: React
```

**Example 2: Constructor with Default Values**
```javascript
function Product(name, price, category = "General") {
    this.name = name;
    this.price = price;
    this.category = category;
    this.getInfo = function() {
        return `${this.name} - $${this.price} (${this.category})`;
    };
}

let p1 = new Product("Laptop", 999, "Electronics");
let p2 = new Product("Pen", 2);

console.log(p1.getInfo());  // Laptop - $999 (Electronics)
console.log(p2.getInfo());  // Pen - $2 (General)
```

**What happens when `new` is used:**
1. A new empty object `{}` is created
2. `this` is set to the new object
3. The function body executes (properties are added to `this`)
4. The new object is returned automatically

---

### 3. Object.create()

Creates a new object with the specified prototype object and optional properties.

```javascript
let personPrototype = {
    greet: function() {
        return `Hello, I'm ${this.name}`;
    }
};

let person = Object.create(personPrototype);
person.name = "Prince";
person.age = 22;

console.log(person.greet());   // Hello, I'm Prince
console.log(person.age);       // 22
```

```javascript
// Creating an object with no prototype
let bareObj = Object.create(null);
bareObj.name = "Clean Object";
console.log(bareObj.name);          // Clean Object
// console.log(bareObj.toString()); // ❌ TypeError — no prototype methods
```

---

### 4. ES6 Classes

Classes are syntactic sugar over constructor functions and prototypes. They provide a cleaner syntax for creating objects.

```javascript
class Animal {
    constructor(name, sound) {
        this.name = name;
        this.sound = sound;
    }

    speak() {
        return `${this.name} says ${this.sound}!`;
    }
}

let dog = new Animal("Dog", "Woof");
let cat = new Animal("Cat", "Meow");

console.log(dog.speak());   // Dog says Woof!
console.log(cat.speak());   // Cat says Meow!
```

> **Note:** For a comprehensive guide on ES6 classes, refer to the **Class-based OOP** section.

---

### 5. Factory Functions

A **factory function** is a regular function that returns a new object every time it is called — without using `new` or `this`.

```javascript
function createUser(name, age, role) {
    return {
        name,
        age,
        role,
        greet() {
            return `Hi, I'm ${name}, a ${role}`;
        }
    };
}

let user1 = createUser("Alice", 25, "Developer");
let user2 = createUser("Bob", 30, "Designer");

console.log(user1.greet());   // Hi, I'm Alice, a Developer
console.log(user2.greet());   // Hi, I'm Bob, a Designer
```

### Creating Objects — Summary:

| Method | Use Case | `new` Keyword | Prototype |
|--------|----------|:------------:|:---------:|
| Object Literal | Single, one-off object | ❌ | `Object.prototype` |
| Constructor Function | Multiple similar objects | ✅ | Custom prototype |
| `Object.create()` | Explicit prototype control | ❌ | Custom prototype |
| ES6 Class | Clean OOP syntax | ✅ | Class prototype |
| Factory Function | Flexible object creation | ❌ | `Object.prototype` |

---

## Accessing Object Properties

### 1. Dot Notation

The most common way to access object properties.

```javascript
let student = {
    name: "Prince",
    age: 22,
    course: "JavaScript"
};

console.log(student.name);     // Prince
console.log(student.age);      // 22
console.log(student.course);   // JavaScript
```

### 2. Bracket Notation

Used when property names are dynamic, contain spaces, or start with a number.

```javascript
let student = {
    "first name": "Prince",
    age: 22,
    course: "JavaScript"
};

console.log(student["first name"]);  // Prince
console.log(student["age"]);         // 22

// Dynamic property access
let prop = "course";
console.log(student[prop]);          // JavaScript
```

### Dot vs Bracket Notation

| Feature | Dot Notation | Bracket Notation |
|---------|-------------|-----------------|
| Syntax | `obj.key` | `obj["key"]` |
| Dynamic keys | ❌ Not supported | ✅ Supported |
| Spaces in key | ❌ Not supported | ✅ Supported |
| Reserved words as key | ❌ May cause issues | ✅ Supported |
| Performance | Slightly faster | Slightly slower |
| Readability | More readable | Less readable |

---

## Adding, Modifying & Deleting Properties

```javascript
let person = {
    name: "Prince",
    age: 22
};

// ➕ Adding new properties
person.email = "prince@example.com";
person["phone"] = "1234567890";

console.log(person);
// { name: "Prince", age: 22, email: "prince@example.com", phone: "1234567890" }

// ✏️ Modifying existing properties
person.age = 23;
person["name"] = "Prince Kumar";

console.log(person.age);    // 23
console.log(person.name);   // Prince Kumar

// 🗑️ Deleting properties
delete person.phone;

console.log(person);
// { name: "Prince Kumar", age: 23, email: "prince@example.com" }
```

> **Note:** `delete` only removes **own properties**, not inherited ones.

---

## Object Methods

Methods are functions stored as object properties. They can access the object's properties using `this`.

```javascript
let calculator = {
    num1: 0,
    num2: 0,

    setValues: function(a, b) {
        this.num1 = a;
        this.num2 = b;
    },

    add: function() {
        return this.num1 + this.num2;
    },

    subtract: function() {
        return this.num1 - this.num2;
    },

    multiply: function() {
        return this.num1 * this.num2;
    }
};

calculator.setValues(10, 5);
console.log(calculator.add());        // 15
console.log(calculator.subtract());   // 5
console.log(calculator.multiply());   // 50
```

**ES6 Shorthand Method Syntax:**
```javascript
let calculator = {
    num1: 0,
    num2: 0,

    setValues(a, b) {           // Shorthand — no 'function' keyword
        this.num1 = a;
        this.num2 = b;
    },

    add() {
        return this.num1 + this.num2;
    }
};
```

---

## The `this` Keyword in Objects

The `this` keyword refers to the **object that is calling the method**. Its value depends on how the function is called.

```javascript
let user = {
    name: "Prince",
    age: 22,
    greet: function() {
        console.log(`Hello, I'm ${this.name} and I'm ${this.age} years old.`);
    }
};

user.greet();  // Hello, I'm Prince and I'm 22 years old.
```

**⚠️ Arrow Functions and `this`:**
```javascript
let user = {
    name: "Prince",
    // ❌ Arrow function does NOT have its own 'this'
    greetArrow: () => {
        console.log(`Hello, I'm ${this.name}`);  // 'this' refers to outer scope
    },
    // ✅ Regular function has its own 'this'
    greetRegular: function() {
        console.log(`Hello, I'm ${this.name}`);
    }
};

user.greetArrow();    // Hello, I'm undefined
user.greetRegular();  // Hello, I'm Prince
```

> **Rule:** Always use **regular functions** (not arrow functions) for object methods when you need `this` to refer to the object.

---

## Object.keys(), Object.values(), Object.entries()

These static methods are used to retrieve properties, values, or both from an object.

### Object.keys()

Returns an array of the object's **property names** (keys).

```javascript
let student = {
    name: "Prince",
    age: 22,
    course: "JavaScript"
};

let keys = Object.keys(student);
console.log(keys);   // ["name", "age", "course"]
```

### Object.values()

Returns an array of the object's **property values**.

```javascript
let student = {
    name: "Prince",
    age: 22,
    course: "JavaScript"
};

let values = Object.values(student);
console.log(values);   // ["Prince", 22, "JavaScript"]
```

### Object.entries()

Returns an array of **[key, value]** pairs.

```javascript
let student = {
    name: "Prince",
    age: 22,
    course: "JavaScript"
};

let entries = Object.entries(student);
console.log(entries);
// [["name", "Prince"], ["age", 22], ["course", "JavaScript"]]
```

### Practical Use Case:
```javascript
// When you receive data and don't know its structure
let unknownData = { x: 10, y: 20, z: 30 };

Object.keys(unknownData).forEach(key => {
    console.log(`${key}: ${unknownData[key]}`);
});
// x: 10
// y: 20
// z: 30
```

---

## Looping Through Objects

### 1. for...in Loop

Iterates over all **enumerable** properties of an object (including inherited ones).

```javascript
let student = {
    name: "Prince",
    age: 22,
    course: "JavaScript"
};

for (let key in student) {
    console.log(`${key}: ${student[key]}`);
}
// name: Prince
// age: 22
// course: JavaScript
```

**Filtering Own Properties:**
```javascript
for (let key in student) {
    if (student.hasOwnProperty(key)) {
        console.log(`${key}: ${student[key]}`);
    }
}
```

### 2. Object.keys() with forEach

```javascript
let student = { name: "Prince", age: 22, course: "JavaScript" };

Object.keys(student).forEach(key => {
    console.log(`${key}: ${student[key]}`);
});
```

### 3. Object.entries() with for...of

```javascript
let student = { name: "Prince", age: 22, course: "JavaScript" };

for (let [key, value] of Object.entries(student)) {
    console.log(`${key}: ${value}`);
}
```

---

## Nested Objects

Objects can contain other objects, creating a hierarchical structure.

```javascript
let company = {
    name: "TechCorp",
    address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001"
    },
    employees: {
        manager: {
            name: "Alice",
            department: "Engineering"
        },
        developer: {
            name: "Bob",
            department: "Engineering"
        }
    }
};

// Accessing nested properties
console.log(company.address.city);                 // New York
console.log(company.employees.manager.name);        // Alice
console.log(company.employees.developer.department); // Engineering
```

---

## Object Destructuring (ES6)

Destructuring allows you to extract properties from objects and assign them to variables in a single statement.

**Basic Destructuring:**
```javascript
let student = {
    name: "Prince",
    age: 22,
    course: "JavaScript"
};

let { name, age, course } = student;

console.log(name);    // Prince
console.log(age);     // 22
console.log(course);  // JavaScript
```

**Renaming Variables:**
```javascript
let student = { name: "Prince", age: 22 };

let { name: studentName, age: studentAge } = student;

console.log(studentName);  // Prince
console.log(studentAge);   // 22
```

**Default Values:**
```javascript
let student = { name: "Prince" };

let { name, age = 18, course = "Unknown" } = student;

console.log(name);    // Prince
console.log(age);     // 18 (default)
console.log(course);  // Unknown (default)
```

**Nested Destructuring:**
```javascript
let user = {
    name: "Prince",
    address: {
        city: "New York",
        zip: "10001"
    }
};

let { name, address: { city, zip } } = user;

console.log(name);  // Prince
console.log(city);  // New York
console.log(zip);   // 10001
```

**Destructuring in Function Parameters:**
```javascript
function displayUser({ name, age, course = "N/A" }) {
    console.log(`${name}, Age: ${age}, Course: ${course}`);
}

displayUser({ name: "Prince", age: 22, course: "JS" });
// Output: Prince, Age: 22, Course: JS
```

---

## Spread & Rest with Objects (ES6)

### Spread Operator (`...`) — Expanding Objects

```javascript
let defaults = { theme: "light", language: "en", fontSize: 14 };
let userSettings = { theme: "dark", fontSize: 18 };

// Merge objects (later values override earlier ones)
let finalSettings = { ...defaults, ...userSettings };

console.log(finalSettings);
// { theme: "dark", language: "en", fontSize: 18 }
```

**Cloning an Object:**
```javascript
let original = { name: "Prince", age: 22 };
let clone = { ...original };

clone.name = "Alice";

console.log(original.name);  // Prince (unchanged)
console.log(clone.name);     // Alice
```

### Rest Operator (`...`) — Collecting Remaining Properties

```javascript
let student = { name: "Prince", age: 22, course: "JS", grade: "A" };

let { name, ...rest } = student;

console.log(name);   // Prince
console.log(rest);   // { age: 22, course: "JS", grade: "A" }
```

---

## Optional Chaining (?.)

Safely access deeply nested properties without worrying about `null` or `undefined` errors. Introduced in **ES2020**.

```javascript
let user = {
    name: "Prince",
    address: {
        city: "New York"
    }
};

// ✅ Safe access
console.log(user.address?.city);     // New York
console.log(user.address?.zip);      // undefined (no error)
console.log(user.contact?.email);    // undefined (no error)

// ❌ Without optional chaining
// console.log(user.contact.email);  // TypeError: Cannot read property 'email' of undefined
```

**With Methods:**
```javascript
let user = {
    name: "Prince",
    greet() {
        return "Hello!";
    }
};

console.log(user.greet?.());       // Hello!
console.log(user.farewell?.());    // undefined (no error)
```

---

## Computed Property Names

Use expressions as property names by wrapping them in square brackets `[]`.

```javascript
let propName = "score";

let student = {
    name: "Prince",
    [propName]: 95,               // computed property name
    ["is" + "Active"]: true       // expression as key
};

console.log(student.score);       // 95
console.log(student.isActive);    // true
```

**Dynamic Object Keys:**
```javascript
function createField(key, value) {
    return { [key]: value };
}

console.log(createField("name", "Prince"));   // { name: "Prince" }
console.log(createField("age", 22));           // { age: 22 }
```

---

## Shorthand Properties & Methods (ES6)

When variable names match property names, you can use shorthand syntax.

**Shorthand Properties:**
```javascript
let name = "Prince";
let age = 22;
let course = "JavaScript";

// ❌ Old way
let student1 = { name: name, age: age, course: course };

// ✅ ES6 Shorthand
let student2 = { name, age, course };

console.log(student2);  // { name: "Prince", age: 22, course: "JavaScript" }
```

**Shorthand Methods:**
```javascript
// ❌ Old way
let obj1 = {
    greet: function() {
        return "Hello!";
    }
};

// ✅ ES6 Shorthand
let obj2 = {
    greet() {
        return "Hello!";
    }
};
```

---

## JSON (JavaScript Object Notation)

**JSON** stands for **JavaScript Object Notation**. It is a lightweight, text-based data exchange format used to transfer data between browser and server.

### Key Points:
- JSON is similar to object literals but with stricter rules
- Properties **must** be in double quotes
- Methods are **not allowed**
- Values can be: strings, numbers, booleans, arrays, objects, `null`
- JSON is language-independent — used across many programming languages

### JSON vs Object Literal

| Feature | Object Literal | JSON |
|---------|---------------|------|
| Property quotes | Optional | **Required** (double quotes) |
| Methods | ✅ Allowed | ❌ Not allowed |
| Trailing commas | ✅ Allowed (in some engines) | ❌ Not allowed |
| Data types | All JS types | Strings, numbers, booleans, arrays, objects, null |
| Usage | In JavaScript code | Data exchange format |

**JSON Format:**
```json
{
    "name": "Prince",
    "age": 22,
    "course": "JavaScript",
    "isActive": true,
    "hobbies": ["reading", "coding"],
    "address": {
        "city": "New York",
        "zip": "10001"
    }
}
```

### JSON.stringify()

Converts a JavaScript **object** to a **JSON string**.

```javascript
let student = {
    name: "Prince",
    age: 22,
    course: "JavaScript"
};

let jsonString = JSON.stringify(student);
console.log(jsonString);
// Output: '{"name":"Prince","age":22,"course":"JavaScript"}'
console.log(typeof jsonString);  // string
```

**Pretty Print:**
```javascript
let jsonPretty = JSON.stringify(student, null, 2);
console.log(jsonPretty);
// Output:
// {
//   "name": "Prince",
//   "age": 22,
//   "course": "JavaScript"
// }
```

**With Replacer Function (Filter properties):**
```javascript
let student = { name: "Prince", age: 22, password: "secret123" };

let safe = JSON.stringify(student, (key, value) => {
    if (key === "password") return undefined;  // Exclude password
    return value;
});

console.log(safe);  // '{"name":"Prince","age":22}'
```

### JSON.parse()

Converts a **JSON string** to a JavaScript **object**.

```javascript
let jsonString = '{"name":"Prince","age":22,"course":"JavaScript"}';

let student = JSON.parse(jsonString);
console.log(student);
// Output: { name: "Prince", age: 22, course: "JavaScript" }
console.log(student.name);   // Prince
console.log(typeof student); // object
```

**With Reviver Function:**
```javascript
let json = '{"name":"Prince","birthDate":"2004-01-15"}';

let person = JSON.parse(json, (key, value) => {
    if (key === "birthDate") return new Date(value);
    return value;
});

console.log(person.birthDate instanceof Date);  // true
```

---

## Object Array Literal

An **Object Array Literal** is a collection of object literals stored as an array. It represents a group of records (e.g., list of students).

```javascript
let students = [
    { name: "Prince", age: 22, course: "JavaScript" },
    { name: "Alice", age: 25, course: "React" },
    { name: "Bob", age: 23, course: "Node.js" }
];

// Accessing individual objects
console.log(students[0].name);    // Prince
console.log(students[1].course);  // React

// Looping through object array
students.forEach(student => {
    console.log(`${student.name} - ${student.course}`);
});
// Prince - JavaScript
// Alice - React
// Bob - Node.js
```

**Common Operations on Object Arrays:**
```javascript
let products = [
    { name: "Laptop", price: 999, category: "Electronics" },
    { name: "Shirt", price: 29, category: "Clothing" },
    { name: "Phone", price: 699, category: "Electronics" },
    { name: "Shoes", price: 89, category: "Clothing" }
];

// Filter — get only electronics
let electronics = products.filter(p => p.category === "Electronics");
console.log(electronics);
// [{ name: "Laptop", ... }, { name: "Phone", ... }]

// Map — get only product names
let names = products.map(p => p.name);
console.log(names);  // ["Laptop", "Shirt", "Phone", "Shoes"]

// Find — find a specific product
let phone = products.find(p => p.name === "Phone");
console.log(phone);  // { name: "Phone", price: 699, category: "Electronics" }

// Reduce — calculate total price
let total = products.reduce((sum, p) => sum + p.price, 0);
console.log(total);  // 1816

// Sort — sort by price
let sorted = products.sort((a, b) => a.price - b.price);
console.log(sorted.map(p => `${p.name}: $${p.price}`));
// ["Shirt: $29", "Shoes: $89", "Phone: $699", "Laptop: $999"]
```

---

## Object Array (Constructor)

An array of objects created using a constructor function.

```javascript
function Employee(name, position, salary) {
    this.name = name;
    this.position = position;
    this.salary = salary;
    this.display = function() {
        return `${this.name} - ${this.position} ($${this.salary})`;
    };
}

let employees = [
    new Employee("Alice", "Manager", 80000),
    new Employee("Bob", "Developer", 65000),
    new Employee("Charlie", "Designer", 60000)
];

employees.forEach(emp => {
    console.log(emp.display());
});
// Alice - Manager ($80000)
// Bob - Developer ($65000)
// Charlie - Designer ($60000)
```

---

## Prototype

The **prototype** is a model/template for objects. Every constructor function has a `prototype` property. Properties and methods added to `prototype` are shared across **all** objects created from that constructor.

### Why Use Prototype?
- Methods defined **inside** the constructor are re-created for each instance → wastes memory
- Methods defined on **prototype** are shared across all instances → saves memory

```javascript
function Student(name, age) {
    this.name = name;
    this.age = age;
}

// Adding method to prototype (shared across all instances)
Student.prototype.display = function() {
    return `${this.name}, Age: ${this.age}`;
};

// Adding property to prototype
Student.prototype.institution = "Tech University";

let s1 = new Student("Prince", 22);
let s2 = new Student("Alice", 25);

console.log(s1.display());       // Prince, Age: 22
console.log(s2.display());       // Alice, Age: 25
console.log(s1.institution);     // Tech University
console.log(s2.institution);     // Tech University

// Both share the same method reference
console.log(s1.display === s2.display);   // true ✅ (same function in memory)
```

---

## Prototype Chain

When you access a property on an object, JavaScript first looks at the object itself. If not found, it looks at the object's prototype, then the prototype's prototype, and so on — up to `Object.prototype` (which is `null`).

```javascript
function Animal(name) {
    this.name = name;
}
Animal.prototype.speak = function() {
    return `${this.name} makes a sound`;
};

let dog = new Animal("Rex");

console.log(dog.name);           // "Rex"        — found on object itself
console.log(dog.speak());        // "Rex makes a sound" — found on Animal.prototype
console.log(dog.toString());     // "[object Object]" — found on Object.prototype
console.log(dog.hasOwnProperty("name"));  // true — inherited from Object.prototype
```

```
dog → Animal.prototype → Object.prototype → null
```

---

## Inheritance (Prototypal)

The process of creating an object based on another object. The child object inherits all properties and methods of the parent.

**Using Constructor Functions:**
```javascript
// Parent constructor
function Person(name, age) {
    this.name = name;
    this.age = age;
}

Person.prototype.greet = function() {
    return `Hello, I'm ${this.name}`;
};

// Child constructor
function Student(name, age, course) {
    Person.call(this, name, age);   // Call parent constructor
    this.course = course;
}

// Set up prototype chain
Student.prototype = Object.create(Person.prototype);
Student.prototype.constructor = Student;

// Add child-specific method
Student.prototype.study = function() {
    return `${this.name} is studying ${this.course}`;
};

let stu = new Student("Prince", 22, "JavaScript");

console.log(stu.greet());       // Hello, I'm Prince (inherited from Person)
console.log(stu.study());       // Prince is studying JavaScript (own method)
console.log(stu instanceof Student);  // true
console.log(stu instanceof Person);   // true
```

**Using ES6 Classes (Modern Syntax):**
```javascript
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    greet() {
        return `Hello, I'm ${this.name}`;
    }
}

class Student extends Person {
    constructor(name, age, course) {
        super(name, age);        // Call parent constructor
        this.course = course;
    }
    study() {
        return `${this.name} is studying ${this.course}`;
    }
}

let stu = new Student("Prince", 22, "JavaScript");
console.log(stu.greet());   // Hello, I'm Prince
console.log(stu.study());   // Prince is studying JavaScript
```

---

## Object Static Methods

### Object.assign()

Copies properties from one or more **source** objects to a **target** object. Returns the modified target.

```javascript
let target = { a: 1, b: 2 };
let source = { b: 3, c: 4 };

let result = Object.assign(target, source);
console.log(result);   // { a: 1, b: 3, c: 4 }
console.log(target);   // { a: 1, b: 3, c: 4 } — target is modified!

// Cloning an object (use empty target)
let original = { x: 10, y: 20 };
let clone = Object.assign({}, original);
console.log(clone);    // { x: 10, y: 20 }
```

### Object.freeze()

Freezes an object — no adding, removing, or modifying properties.

```javascript
let config = {
    apiUrl: "https://api.example.com",
    timeout: 5000
};

Object.freeze(config);

config.apiUrl = "https://hacked.com";   // ❌ Silently fails (strict mode throws error)
config.newProp = "test";                // ❌ Silently fails
delete config.timeout;                  // ❌ Silently fails

console.log(config.apiUrl);    // https://api.example.com (unchanged)
console.log(Object.isFrozen(config));  // true
```

> **Note:** `Object.freeze()` is **shallow** — nested objects are NOT frozen.

### Object.seal()

Seals an object — existing properties can be **modified**, but you cannot **add or remove** properties.

```javascript
let user = { name: "Prince", age: 22 };

Object.seal(user);

user.name = "Alice";        // ✅ Modification allowed
user.email = "a@b.com";    // ❌ Cannot add new properties
delete user.age;            // ❌ Cannot delete properties

console.log(user);          // { name: "Alice", age: 22 }
console.log(Object.isSealed(user));  // true
```

### Object.keys()

Returns an array of own enumerable property **names**.

```javascript
let obj = { a: 1, b: 2, c: 3 };
console.log(Object.keys(obj));   // ["a", "b", "c"]
```

### Object.values()

Returns an array of own enumerable property **values**.

```javascript
let obj = { a: 1, b: 2, c: 3 };
console.log(Object.values(obj));  // [1, 2, 3]
```

### Object.entries()

Returns an array of own enumerable **[key, value]** pairs.

```javascript
let obj = { a: 1, b: 2, c: 3 };
console.log(Object.entries(obj));  // [["a", 1], ["b", 2], ["c", 3]]
```

### Object.fromEntries()

Creates an object from an array of **[key, value]** pairs (reverse of `Object.entries()`).

```javascript
let entries = [["name", "Prince"], ["age", 22], ["course", "JS"]];

let obj = Object.fromEntries(entries);
console.log(obj);  // { name: "Prince", age: 22, course: "JS" }

// Useful for transforming Map to Object
let map = new Map([["x", 10], ["y", 20]]);
let mapObj = Object.fromEntries(map);
console.log(mapObj);  // { x: 10, y: 20 }
```

### Object.is()

Compares two values for **strict equality** (similar to `===` but handles edge cases).

```javascript
console.log(Object.is(25, 25));          // true
console.log(Object.is("hello", "hello"));// true
console.log(Object.is(NaN, NaN));        // true  ← (NaN === NaN is false!)
console.log(Object.is(0, -0));           // false ← (0 === -0 is true!)
console.log(Object.is(null, undefined)); // false
```

### Object.defineProperty()

Adds or modifies a property with fine-grained control over its behavior.

```javascript
let person = { name: "Prince" };

Object.defineProperty(person, "age", {
    value: 22,
    writable: false,        // Cannot modify value
    enumerable: true,       // Shows up in for...in & Object.keys()
    configurable: false     // Cannot delete or reconfigure
});

person.age = 30;            // ❌ Silently fails (writable: false)
console.log(person.age);    // 22
```

### Object.getOwnPropertyNames()

Returns all own property names (including non-enumerable ones).

```javascript
let obj = {};
Object.defineProperty(obj, "hidden", { value: 42, enumerable: false });
obj.visible = 100;

console.log(Object.keys(obj));                  // ["visible"]
console.log(Object.getOwnPropertyNames(obj));    // ["hidden", "visible"]
```

### Object.getPrototypeOf()

Returns the prototype of the specified object.

```javascript
function Student(name) {
    this.name = name;
}

let s = new Student("Prince");

console.log(Object.getPrototypeOf(s) === Student.prototype);  // true
```

---

## Property Descriptors

Every property in JavaScript has a **descriptor** that controls its behavior.

| Descriptor | Default | Description |
|-----------|---------|-------------|
| `value` | `undefined` | The value of the property |
| `writable` | `true` | Can the value be changed? |
| `enumerable` | `true` | Does it show in loops/Object.keys()? |
| `configurable` | `true` | Can it be deleted or reconfigured? |
| `get` | `undefined` | Getter function |
| `set` | `undefined` | Setter function |

```javascript
let person = { name: "Prince" };

let descriptor = Object.getOwnPropertyDescriptor(person, "name");
console.log(descriptor);
// {
//   value: "Prince",
//   writable: true,
//   enumerable: true,
//   configurable: true
// }
```

---

## Getter and Setter

Getters and setters allow you to define **computed properties** — properties that run a function when accessed or modified.

```javascript
let person = {
    firstName: "Prince",
    lastName: "Kumar",

    // Getter
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    },

    // Setter
    set fullName(name) {
        let parts = name.split(" ");
        this.firstName = parts[0];
        this.lastName = parts[1];
    }
};

// Using getter (no parentheses needed)
console.log(person.fullName);   // Prince Kumar

// Using setter (assign like a property)
person.fullName = "John Doe";
console.log(person.firstName);  // John
console.log(person.lastName);   // Doe
```

**Getter/Setter with Validation:**
```javascript
let account = {
    _balance: 0,    // Convention: _ prefix for "private" property

    get balance() {
        return `$${this._balance.toFixed(2)}`;
    },

    set balance(amount) {
        if (typeof amount !== "number" || amount < 0) {
            console.log("Invalid amount!");
            return;
        }
        this._balance = amount;
    }
};

account.balance = 500;
console.log(account.balance);  // $500.00

account.balance = -100;        // Invalid amount!
console.log(account.balance);  // $500.00 (unchanged)
```

---

## Shallow Copy vs Deep Copy

### Shallow Copy

Copies only the top-level properties. Nested objects are still **referenced** (shared).

```javascript
let original = {
    name: "Prince",
    address: { city: "New York" }
};

// Shallow copy methods
let copy1 = { ...original };
let copy2 = Object.assign({}, original);

copy1.name = "Alice";              // ✅ Does NOT affect original
copy1.address.city = "London";     // ❌ AFFECTS original (shared reference)

console.log(original.name);           // Prince (unchanged)
console.log(original.address.city);   // London (changed!)
```

### Deep Copy

Creates a completely independent copy — nested objects are also copied.

```javascript
let original = {
    name: "Prince",
    address: { city: "New York" }
};

// Method 1: JSON (simple but has limitations)
let deepCopy1 = JSON.parse(JSON.stringify(original));

// Method 2: structuredClone (modern, recommended)
let deepCopy2 = structuredClone(original);

deepCopy1.address.city = "London";
deepCopy2.address.city = "Tokyo";

console.log(original.address.city);    // New York (unchanged!)
console.log(deepCopy1.address.city);   // London
console.log(deepCopy2.address.city);   // Tokyo
```

| Method | Type | Handles Nested | Handles Functions | Handles Dates |
|--------|------|:---------:|:---------:|:---------:|
| Spread `{...obj}` | Shallow | ❌ | N/A | N/A |
| `Object.assign()` | Shallow | ❌ | N/A | N/A |
| `JSON.parse(JSON.stringify())` | Deep | ✅ | ❌ | ❌ |
| `structuredClone()` | Deep | ✅ | ❌ | ✅ |

---

## Comparing Objects

Objects are compared by **reference**, not by value.

```javascript
let obj1 = { name: "Prince" };
let obj2 = { name: "Prince" };
let obj3 = obj1;

console.log(obj1 === obj2);    // false (different references)
console.log(obj1 === obj3);    // true  (same reference)
console.log(obj1 == obj2);     // false (still different references)
```

**Comparing by Value:**
```javascript
// Method 1: JSON.stringify (simple cases)
let a = { x: 1, y: 2 };
let b = { x: 1, y: 2 };

console.log(JSON.stringify(a) === JSON.stringify(b));  // true

// ⚠️ Order matters!
let c = { y: 2, x: 1 };
console.log(JSON.stringify(a) === JSON.stringify(c));  // false (different order)
```

---

## Symbol as Object Key

**Symbols** are unique identifiers that can be used as object keys to avoid property name conflicts.

```javascript
let id = Symbol("id");
let name = Symbol("name");

let user = {
    [id]: 101,
    [name]: "Prince",
    age: 22
};

console.log(user[id]);       // 101
console.log(user[name]);     // Prince

// Symbols are NOT included in for...in or Object.keys()
console.log(Object.keys(user));          // ["age"]
console.log(Object.getOwnPropertySymbols(user));  // [Symbol(id), Symbol(name)]
```

---

## Best Practices

1. **Use `const` for objects** — prevents reassignment while allowing property modification
   ```javascript
   const user = { name: "Prince" };
   user.name = "Alice";     // ✅ Allowed
   // user = {};             // ❌ TypeError: Assignment to constant variable
   ```

2. **Use shorthand syntax** when property name matches variable name
   ```javascript
   const name = "Prince", age = 22;
   const user = { name, age };   // ✅ Clean
   ```

3. **Use `Object.freeze()` for constants** that should not be modified
   ```javascript
   const CONFIG = Object.freeze({ API_URL: "https://api.example.com" });
   ```

4. **Use descriptive property names** — avoid abbreviations
   ```javascript
   // ❌ Bad
   const u = { fn: "Prince", ln: "Kumar" };
   // ✅ Good
   const user = { firstName: "Prince", lastName: "Kumar" };
   ```

5. **Use optional chaining** to safely access nested properties
   ```javascript
   const city = user?.address?.city ?? "Unknown";
   ```

6. **Use `hasOwnProperty()` or `Object.hasOwn()`** to check property existence
   ```javascript
   if (Object.hasOwn(user, "name")) { /* ... */ }
   ```

7. **Define methods on prototype** (not inside constructor) for memory efficiency

8. **Use destructuring** for cleaner property extraction

---

## Common Mistakes to Avoid

### 1. Using Arrow Functions as Object Methods
```javascript
// ❌ Wrong — arrow function doesn't have its own 'this'
let user = {
    name: "Prince",
    greet: () => console.log(`Hi, ${this.name}`)   // 'this' is not user
};
user.greet();   // Hi, undefined

// ✅ Correct — use regular function or shorthand
let user2 = {
    name: "Prince",
    greet() { console.log(`Hi, ${this.name}`); }
};
user2.greet();  // Hi, Prince
```

### 2. Assuming Object Comparison Works by Value
```javascript
// ❌ Wrong assumption
console.log({ a: 1 } === { a: 1 });   // false — different references!
```

### 3. Shallow Copy Pitfall
```javascript
let obj = { data: { value: 42 } };
let copy = { ...obj };
copy.data.value = 99;
console.log(obj.data.value);   // 99 — original modified! Use deep copy instead.
```

### 4. Modifying Object During Iteration
```javascript
// ❌ Avoid
let obj = { a: 1, b: 2, c: 3 };
for (let key in obj) {
    delete obj[key];    // May cause unexpected behavior
}

// ✅ Use Object.keys() to iterate a snapshot
Object.keys(obj).forEach(key => delete obj[key]);
```

### 5. Forgetting `new` with Constructor Functions
```javascript
function User(name) {
    this.name = name;
}

// ❌ Without new — 'this' refers to global object
let u = User("Prince");
console.log(u);           // undefined
console.log(window.name); // "Prince" (pollutes global!)

// ✅ With new
let u2 = new User("Prince");
console.log(u2.name);    // Prince
```

---

## Practical Examples

### Example 1: Shopping Cart
```javascript
let cart = {
    items: [],

    addItem(name, price, quantity = 1) {
        this.items.push({ name, price, quantity });
    },

    removeItem(name) {
        this.items = this.items.filter(item => item.name !== name);
    },

    getTotal() {
        return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },

    display() {
        console.log("--- Shopping Cart ---");
        this.items.forEach(item => {
            console.log(`${item.name} x${item.quantity} - $${item.price * item.quantity}`);
        });
        console.log(`Total: $${this.getTotal()}`);
    }
};

cart.addItem("Laptop", 999);
cart.addItem("Mouse", 25, 2);
cart.addItem("Keyboard", 75);
cart.display();
// --- Shopping Cart ---
// Laptop x1 - $999
// Mouse x2 - $50
// Keyboard x1 - $75
// Total: $1124
```

### Example 2: Student Grade Manager
```javascript
function StudentManager() {
    this.students = [];
}

StudentManager.prototype.addStudent = function(name, grades) {
    this.students.push({ name, grades });
};

StudentManager.prototype.getAverage = function(name) {
    let student = this.students.find(s => s.name === name);
    if (!student) return "Student not found";
    let sum = student.grades.reduce((acc, g) => acc + g, 0);
    return (sum / student.grades.length).toFixed(2);
};

StudentManager.prototype.getTopStudent = function() {
    let top = this.students.reduce((best, s) => {
        let avg = s.grades.reduce((a, g) => a + g, 0) / s.grades.length;
        let bestAvg = best.grades.reduce((a, g) => a + g, 0) / best.grades.length;
        return avg > bestAvg ? s : best;
    });
    return top.name;
};

let manager = new StudentManager();
manager.addStudent("Prince", [85, 92, 78, 90]);
manager.addStudent("Alice", [95, 88, 92, 97]);
manager.addStudent("Bob", [70, 75, 80, 72]);

console.log(manager.getAverage("Prince"));  // 86.25
console.log(manager.getTopStudent());        // Alice
```

### Example 3: Config Manager with Freeze & Seal
```javascript
// Immutable configuration
const appConfig = Object.freeze({
    apiUrl: "https://api.example.com",
    version: "1.0.0",
    features: Object.freeze({      // Deep freeze for nested object
        darkMode: true,
        notifications: true
    })
});

// Sealed user preferences (can modify, can't add/remove)
let userPrefs = { theme: "light", fontSize: 14, language: "en" };
Object.seal(userPrefs);

userPrefs.theme = "dark";       // ✅ Allowed
userPrefs.font = "Arial";      // ❌ Silently fails
delete userPrefs.language;      // ❌ Silently fails

console.log(userPrefs);        // { theme: "dark", fontSize: 14, language: "en" }
```

---

## Comparison Table

### Object Creation Methods
| Method | Syntax | Best For |
|--------|--------|----------|
| Object Literal | `let obj = { key: value }` | Single objects, simple structures |
| Constructor Function | `function Obj() { this.key = value }` | Multiple similar objects |
| `Object.create()` | `Object.create(proto)` | Specific prototype control |
| ES6 Class | `class Obj { constructor() {} }` | Modern OOP, inheritance |
| Factory Function | `function create() { return {} }` | Flexible creation without `new` |

### Object Immutability
| Method | Add Properties | Modify Values | Delete Properties |
|--------|:---------:|:---------:|:---------:|
| Normal Object | ✅ | ✅ | ✅ |
| `Object.seal()` | ❌ | ✅ | ❌ |
| `Object.freeze()` | ❌ | ❌ | ❌ |

### Object Iteration Methods
| Method | Returns | Includes Inherited |
|--------|---------|:---------:|
| `for...in` | Keys (strings) | ✅ |
| `Object.keys()` | Keys array | ❌ |
| `Object.values()` | Values array | ❌ |
| `Object.entries()` | [key, value] array | ❌ |
| `Object.getOwnPropertyNames()` | All own keys (incl. non-enumerable) | ❌ |

### Copying Methods
| Method | Depth | Preserves Methods | Preserves Dates |
|--------|-------|:---------:|:---------:|
| Spread `{...obj}` | Shallow | ✅ | ✅ |
| `Object.assign()` | Shallow | ✅ | ✅ |
| `JSON.parse(JSON.stringify())` | Deep | ❌ | ❌ |
| `structuredClone()` | Deep | ❌ | ✅ |
