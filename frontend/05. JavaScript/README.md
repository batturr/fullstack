# JavaScript Complete Learning Index
## The Ultimate JavaScript  - From Zero to Mastery

**Total Major Topics:** 25  
**Total Subtopics:** 312+  

---

## **1. INTRODUCTION TO JAVASCRIPT** (12 subtopics)

### 1.1 What is JavaScript?
- 1.1.1 History and Evolution
- 1.1.2 ECMAScript Standards (ES5, ES6+, ES2015-2024)
- 1.1.3 JavaScript vs Java
- 1.1.4 JavaScript Use Cases

### 1.2 JavaScript Environments
- 1.2.1 Browser Environment
- 1.2.2 Node.js Environment
- 1.2.3 Deno and Bun
- 1.2.4 Embedded Systems (IoT)

### 1.3 Setting Up Development Environment
- 1.3.1 Code Editors (VS Code, WebStorm)
- 1.3.2 Browser Developer Tools
- 1.3.3 Node.js Installation
- 1.3.4 Package Managers (npm, yarn, pnpm)

---

## **2. JAVASCRIPT BASICS** (45 subtopics)

### 2.1 Syntax and Structure
- 2.1.1 Statements and Expressions
- 2.1.2 Semicolons and ASI (Automatic Semicolon Insertion)
- 2.1.3 Comments (Single-line, Multi-line, JSDoc)
- 2.1.4 Code Formatting and Style Guides
- 2.1.5 Strict Mode ('use strict')

### 2.2 Variables and Constants
- 2.2.1 var Declaration
- 2.2.2 let Declaration
- 2.2.3 const Declaration
- 2.2.4 Variable Hoisting
- 2.2.5 Scope (Global, Function, Block)
- 2.2.6 Temporal Dead Zone (TDZ)
- 2.2.7 Variable Naming Conventions

### 2.3 Data Types
- 2.3.1 Primitive Types Overview
  - 2.3.1.1 Number
  - 2.3.1.2 String
  - 2.3.1.3 Boolean
  - 2.3.1.4 Undefined
  - 2.3.1.5 Null
  - 2.3.1.6 Symbol (ES6)
  - 2.3.1.7 BigInt (ES2020)
- 2.3.2 Reference Types (Objects)
- 2.3.3 typeof Operator
- 2.3.4 Type Checking Methods

### 2.4 Type Conversion and Coercion
- 2.4.1 Implicit Type Coercion
- 2.4.2 Explicit Type Conversion
- 2.4.3 String Conversion
- 2.4.4 Number Conversion
- 2.4.5 Boolean Conversion
- 2.4.6 Truthy and Falsy Values
- 2.4.7 == vs === (Equality Operators)

### 2.5 Operators
- 2.5.1 Arithmetic Operators (+, -, *, /, %, **)
- 2.5.2 Assignment Operators (=, +=, -=, etc.)
- 2.5.3 Comparison Operators (>, <, >=, <=, ==, ===, !=, !==)
- 2.5.4 Logical Operators (&&, ||, !)
- 2.5.5 Bitwise Operators (&, |, ^, ~, <<, >>, >>>)
- 2.5.6 Unary Operators (+, -, ++, --, typeof, delete, void)
- 2.5.7 Ternary (Conditional) Operator (? :)
- 2.5.8 Comma Operator
- 2.5.9 Nullish Coalescing Operator (??)
- 2.5.10 Optional Chaining Operator (?.)
- 2.5.11 Operator Precedence and Associativity

---

## **3. CONTROL FLOW** (18 subtopics)

### 3.1 Conditional Statements
- 3.1.1 if Statement
- 3.1.2 if...else Statement
- 3.1.3 else if Ladder
- 3.1.4 Nested if Statements
- 3.1.5 switch Statement
- 3.1.6 switch with Fall-through
- 3.1.7 switch Best Practices

### 3.2 Loops
- 3.2.1 for Loop
- 3.2.2 while Loop
- 3.2.3 do...while Loop
- 3.2.4 for...in Loop
- 3.2.5 for...of Loop (ES6)
- 3.2.6 Nested Loops
- 3.2.7 Loop Performance Optimization

### 3.3 Jump Statements
- 3.3.1 break Statement
- 3.3.2 continue Statement
- 3.3.3 Labeled Statements
- 3.3.4 return Statement

---

## **4. FUNCTIONS** (52 subtopics)

### 4.1 Function Basics
- 4.1.1 Function Declaration
- 4.1.2 Function Expression
- 4.1.3 Anonymous Functions
- 4.1.4 Named Function Expressions
- 4.1.5 Function Hoisting
- 4.1.6 Function Parameters and Arguments
- 4.1.7 Return Values
- 4.1.8 Function Scope

### 4.2 Arrow Functions (ES6)
- 4.2.1 Arrow Function Syntax
- 4.2.2 Implicit Return
- 4.2.3 Arrow Functions and 'this' Binding
- 4.2.4 When to Use Arrow Functions
- 4.2.5 Limitations of Arrow Functions

### 4.3 Advanced Function Concepts
- 4.3.1 Default Parameters (ES6)
- 4.3.2 Rest Parameters (...)
- 4.3.3 Spread Operator (...)
- 4.3.4 Destructuring Parameters
- 4.3.5 arguments Object
- 4.3.6 Function Constructor
- 4.3.7 IIFE (Immediately Invoked Function Expression)

### 4.4 Higher-Order Functions
- 4.4.1 Functions as First-Class Citizens
- 4.4.2 Callback Functions
- 4.4.3 Functions Returning Functions
- 4.4.4 Function Composition
- 4.4.5 Partial Application
- 4.4.6 Currying

### 4.5 Closures
- 4.5.1 Lexical Scope
- 4.5.2 Closure Basics
- 4.5.3 Closure Use Cases
- 4.5.4 Private Variables with Closures
- 4.5.5 Module Pattern
- 4.5.6 Closure Memory Considerations

### 4.6 Recursion
- 4.6.1 Recursive Function Basics
- 4.6.2 Base Case and Recursive Case
- 4.6.3 Tail Recursion
- 4.6.4 Recursion vs Iteration
- 4.6.5 Call Stack and Stack Overflow
- 4.6.6 Memoization for Recursion

### 4.7 Generator Functions (ES6)
- 4.7.1 Generator Syntax (function*)
- 4.7.2 yield Keyword
- 4.7.3 yield* Delegation
- 4.7.4 Generator.prototype Methods
- 4.7.5 Iterators and Generators
- 4.7.6 Async Generators (ES2018)

### 4.8 Function Performance
- 4.8.1 Debouncing
- 4.8.2 Throttling
- 4.8.3 Memoization Techniques
- 4.8.4 Function Optimization Strategies

---

## **5. OBJECTS** (48 subtopics)

### 5.1 Object Fundamentals
- 5.1.1 Object Literal Syntax
- 5.1.2 Creating Objects
- 5.1.3 Property Access (Dot vs Bracket Notation)
- 5.1.4 Adding Properties
- 5.1.5 Modifying Properties
- 5.1.6 Deleting Properties
- 5.1.7 Property Keys (String and Symbol)
- 5.1.8 Computed Property Names (ES6)

### 5.2 Object Methods
- 5.2.1 Method Definitions
- 5.2.2 Method Shorthand (ES6)
- 5.2.3 'this' Keyword in Methods
- 5.2.4 Method Chaining

### 5.3 Object Properties
- 5.3.1 Property Descriptors
- 5.3.2 writable, enumerable, configurable
- 5.3.3 Object.defineProperty()
- 5.3.4 Object.defineProperties()
- 5.3.5 Object.getOwnPropertyDescriptor()
- 5.3.6 Getters and Setters
- 5.3.7 Property Flags

### 5.4 Object Iteration
- 5.4.1 for...in Loop
- 5.4.2 Object.keys()
- 5.4.3 Object.values()
- 5.4.4 Object.entries()
- 5.4.5 Object.getOwnPropertyNames()
- 5.4.6 Object.getOwnPropertySymbols()

### 5.5 Object Copying and Cloning
- 5.5.1 Shallow Copy
- 5.5.2 Deep Copy
- 5.5.3 Object.assign()
- 5.5.4 Spread Operator for Objects (ES2018)
- 5.5.5 structuredClone() (ES2022)
- 5.5.6 JSON.parse(JSON.stringify()) Method

### 5.6 Object Prototypes
- 5.6.1 Prototype Chain
- 5.6.2 __proto__ Property
- 5.6.3 Object.getPrototypeOf()
- 5.6.4 Object.setPrototypeOf()
- 5.6.5 Object.create()
- 5.6.6 prototype Property
- 5.6.7 Constructor Functions

### 5.7 Object Static Methods
- 5.7.1 Object.freeze()
- 5.7.2 Object.seal()
- 5.7.3 Object.preventExtensions()
- 5.7.4 Object.isFrozen()
- 5.7.5 Object.isSealed()
- 5.7.6 Object.isExtensible()
- 5.7.7 Object.is()
- 5.7.8 Object.hasOwn() (ES2022)

### 5.8 Property Enumeration
- 5.8.1 Enumerable vs Non-enumerable
- 5.8.2 Own vs Inherited Properties
- 5.8.3 hasOwnProperty()
- 5.8.4 in Operator
- 5.8.5 propertyIsEnumerable()

---

## **6. ARRAYS** (62 subtopics)

### 6.1 Array Basics
- 6.1.1 Array Creation (Literal, Constructor)
- 6.1.2 Array Length Property
- 6.1.3 Accessing Array Elements
- 6.1.4 Modifying Array Elements
- 6.1.5 Multi-dimensional Arrays
- 6.1.6 Sparse Arrays
- 6.1.7 Array Holes

### 6.2 Array Methods - Adding/Removing
- 6.2.1 push() - Add to End
- 6.2.2 pop() - Remove from End
- 6.2.3 unshift() - Add to Beginning
- 6.2.4 shift() - Remove from Beginning
- 6.2.5 splice() - Add/Remove at Position
- 6.2.6 slice() - Extract Portion
- 6.2.7 concat() - Merge Arrays
- 6.2.8 Array Spread for Combining

### 6.3 Array Iteration Methods
- 6.3.1 forEach()
- 6.3.2 map()
- 6.3.3 filter()
- 6.3.4 reduce()
- 6.3.5 reduceRight()
- 6.3.6 every()
- 6.3.7 some()
- 6.3.8 find()
- 6.3.9 findIndex()
- 6.3.10 findLast() (ES2023)
- 6.3.11 findLastIndex() (ES2023)

### 6.4 Array Searching
- 6.4.1 indexOf()
- 6.4.2 lastIndexOf()
- 6.4.3 includes() (ES2016)
- 6.4.4 Binary Search Implementation

### 6.5 Array Sorting
- 6.5.1 sort() Method
- 6.5.2 Custom Compare Functions
- 6.5.3 reverse() Method
- 6.5.4 Stable vs Unstable Sorting
- 6.5.5 Sorting Algorithms Overview

### 6.6 Array Transformation
- 6.6.1 flat() (ES2019)
- 6.6.2 flatMap() (ES2019)
- 6.6.3 Array.from()
- 6.6.4 Array.of()
- 6.6.5 join() - Array to String
- 6.6.6 toString() and toLocaleString()

### 6.7 Array Copying
- 6.7.1 Shallow Copy Methods
- 6.7.2 Deep Copy Techniques
- 6.7.3 copyWithin()
- 6.7.4 Spread Operator for Arrays

### 6.8 Typed Arrays
- 6.8.1 ArrayBuffer
- 6.8.2 Int8Array, Uint8Array
- 6.8.3 Int16Array, Uint16Array
- 6.8.4 Int32Array, Uint32Array
- 6.8.5 Float32Array, Float64Array
- 6.8.6 BigInt64Array, BigUint64Array
- 6.8.7 DataView
- 6.8.8 Typed Array Use Cases

### 6.9 Array-like Objects
- 6.9.1 Understanding Array-like Objects
- 6.9.2 Converting to Real Arrays
- 6.9.3 arguments Object
- 6.9.4 NodeList and HTMLCollection

### 6.10 Advanced Array Techniques
- 6.10.1 Array Destructuring
- 6.10.2 Array Performance Optimization
- 6.10.3 Array Immutability Patterns
- 6.10.4 Array Methods Chaining
- 6.10.5 toReversed() (ES2023)
- 6.10.6 toSorted() (ES2023)
- 6.10.7 toSpliced() (ES2023)
- 6.10.8 with() Method (ES2023)

---

## **7. STRINGS** (45 subtopics)

### 7.1 String Basics
- 7.1.1 String Creation (Literal, Constructor)
- 7.1.2 String Immutability
- 7.1.3 String Length Property
- 7.1.4 Character Access
- 7.1.5 Unicode and Character Encoding
- 7.1.6 Escape Sequences

### 7.2 Template Literals (ES6)
- 7.2.1 Template Literal Syntax
- 7.2.2 String Interpolation
- 7.2.3 Multi-line Strings
- 7.2.4 Tagged Templates
- 7.2.5 Raw Strings (String.raw)

### 7.3 String Methods - Searching
- 7.3.1 indexOf()
- 7.3.2 lastIndexOf()
- 7.3.3 search()
- 7.3.4 includes() (ES6)
- 7.3.5 startsWith() (ES6)
- 7.3.6 endsWith() (ES6)

### 7.4 String Methods - Extraction
- 7.4.1 substring()
- 7.4.2 substr() (Deprecated)
- 7.4.3 slice()
- 7.4.4 charAt()
- 7.4.5 charCodeAt()
- 7.4.6 codePointAt() (ES6)

### 7.5 String Methods - Modification
- 7.5.1 concat()
- 7.5.2 repeat() (ES6)
- 7.3 padStart() (ES2017)
- 7.5.4 padEnd() (ES2017)
- 7.5.5 trim()
- 7.5.6 trimStart() / trimLeft()
- 7.5.7 trimEnd() / trimRight()
- 7.5.8 replace()
- 7.5.9 replaceAll() (ES2021)

### 7.6 String Case Methods
- 7.6.1 toLowerCase()
- 7.6.2 toUpperCase()
- 7.6.3 toLocaleLowerCase()
- 7.6.4 toLocaleUpperCase()

### 7.7 String Splitting and Joining
- 7.7.1 split()
- 7.7.2 Split with Regex
- 7.7.3 Split Limit Parameter

### 7.8 String Comparison
- 7.8.1 Comparison Operators
- 7.8.2 localeCompare()
- 7.8.3 Collation and Sorting

### 7.9 String Regular Expressions
- 7.9.1 match()
- 7.9.2 matchAll() (ES2020)
- 7.9.3 Using Regex with Strings

### 7.10 String Internationalization
- 7.10.1 Intl.Collator
- 7.10.2 Unicode Normalization
- 7.10.3 normalize() Method

---

## **8. REGULAR EXPRESSIONS** (28 subtopics)

### 8.1 Regex Basics
- 8.1.1 Regex Literal Syntax
- 8.1.2 RegExp Constructor
- 8.1.3 Regex Flags (g, i, m, s, u, y)
- 8.1.4 Test Method
- 8.1.5 Exec Method

### 8.2 Regex Patterns
- 8.2.1 Literal Characters
- 8.2.2 Metacharacters
- 8.2.3 Character Classes
- 8.2.4 Predefined Character Classes (\d, \w, \s, etc.)
- 8.2.5 Negated Character Classes
- 8.2.6 Ranges [a-z]

### 8.3 Regex Quantifiers
- 8.3.1 * (Zero or More)
- 8.3.2 + (One or More)
- 8.3.3 ? (Zero or One)
- 8.3.4 {n} (Exactly n)
- 8.3.5 {n,} (n or More)
- 8.3.6 {n,m} (Between n and m)
- 8.3.7 Greedy vs Lazy Quantifiers

### 8.4 Regex Anchors and Boundaries
- 8.4.1 ^ (Start of String)
- 8.4.2 $ (End of String)
- 8.4.3 \b (Word Boundary)
- 8.4.4 \B (Non-word Boundary)

### 8.5 Regex Groups
- 8.5.1 Capturing Groups ()
- 8.5.2 Non-capturing Groups (?:)
- 8.5.3 Named Capturing Groups (ES2018)
- 8.5.4 Backreferences
- 8.5.5 Lookahead Assertions
- 8.5.6 Lookbehind Assertions (ES2018)

### 8.6 Regex Advanced
- 8.6.1 Alternation (|)
- 8.6.2 Escaping Special Characters
- 8.6.3 Unicode Property Escapes (ES2018)
- 8.6.4 Regex Performance Optimization

---

## **9. NUMBERS AND MATH** (32 subtopics)

### 9.1 Number Basics
- 9.1.1 Number Type
- 9.1.2 Number Literal Formats
- 9.1.3 Floating-Point Precision Issues
- 9.1.4 Integer vs Float
- 9.1.5 Number Range (MIN_VALUE, MAX_VALUE)
- 9.1.6 Infinity and -Infinity
- 9.1.7 NaN (Not a Number)

### 9.2 Number Methods
- 9.2.1 toString()
- 9.2.2 toFixed()
- 9.2.3 toExponential()
- 9.2.4 toPrecision()
- 9.2.5 valueOf()

### 9.3 Number Static Methods
- 9.3.1 Number.isNaN() (ES6)
- 9.3.2 Number.isFinite() (ES6)
- 9.3.3 Number.isInteger() (ES6)
- 9.3.4 Number.isSafeInteger() (ES6)
- 9.3.5 Number.parseFloat()
- 9.3.6 Number.parseInt()

### 9.4 BigInt (ES2020)
- 9.4.1 BigInt Creation
- 9.4.2 BigInt Operations
- 9.4.3 BigInt Limitations
- 9.4.4 BigInt vs Number Comparison

### 9.5 Math Object
- 9.5.1 Math Constants (PI, E, LN2, etc.)
- 9.5.2 Math.abs()
- 9.5.3 Math.round(), ceil(), floor(), trunc()
- 9.5.4 Math.max(), min()
- 9.5.5 Math.pow(), sqrt(), cbrt()
- 9.5.6 Math.random()
- 9.5.7 Trigonometric Functions
- 9.5.8 Logarithmic Functions
- 9.5.9 Math.sign() (ES6)
- 9.5.10 Math.hypot() (ES6)
- 9.5.11 Math.imul() (ES6)

### 9.6 Number Formatting
- 9.6.1 Intl.NumberFormat
- 9.6.2 Locale-specific Formatting
- 9.6.3 Currency Formatting
- 9.6.4 Percentage Formatting

---

## **10. DATE AND TIME** (26 subtopics)

### 10.1 Date Object Basics
- 10.1.1 Creating Date Objects
- 10.1.2 Date Constructor Variations
- 10.1.3 Date.now()
- 10.1.4 Date.parse()
- 10.1.5 Date.UTC()
- 10.1.6 Timestamps

### 10.2 Date Get Methods
- 10.2.1 getFullYear(), getMonth(), getDate()
- 10.2.2 getDay() (Day of Week)
- 10.2.3 getHours(), getMinutes(), getSeconds()
- 10.2.4 getMilliseconds()
- 10.2.5 getTime()
- 10.2.6 getTimezoneOffset()
- 10.2.7 UTC Get Methods

### 10.3 Date Set Methods
- 10.3.1 setFullYear(), setMonth(), setDate()
- 10.3.2 setHours(), setMinutes(), setSeconds()
- 10.3.3 setMilliseconds()
- 10.3.4 setTime()
- 10.3.5 UTC Set Methods

### 10.4 Date Formatting
- 10.4.1 toString() and toDateString()
- 10.4.2 toTimeString()
- 10.4.3 toISOString()
- 10.4.4 toJSON()
- 10.4.5 toLocaleString()
- 10.4.6 toLocaleDateString()
- 10.4.7 toLocaleTimeString()

### 10.5 Date Manipulation
- 10.5.1 Adding/Subtracting Days
- 10.5.2 Date Arithmetic
- 10.5.3 Date Comparison

### 10.6 Internationalization
- 10.6.1 Intl.DateTimeFormat
- 10.6.2 Locale-specific Formatting
- 10.6.3 Timezone Handling

### 10.7 Modern Date Libraries
- 10.7.1 Temporal API (Stage 3 Proposal)
- 10.7.2 Third-party Libraries (Moment.js, date-fns, Day.js, Luxon)

---

## **11. ERROR HANDLING** (22 subtopics)

### 11.1 Error Basics
- 11.1.1 Error Types Overview
- 11.1.2 Error Object
- 11.1.3 Error Properties (name, message, stack)
- 11.1.4 Creating Errors

### 11.2 Try-Catch-Finally
- 11.2.1 try Block
- 11.2.2 catch Block
- 11.2.3 finally Block
- 11.2.4 Nested Try-Catch
- 11.2.5 Error Propagation

### 11.3 Throwing Errors
- 11.3.1 throw Statement
- 11.3.2 Throwing Custom Errors
- 11.3.3 Rethrowing Errors
- 11.3.4 When to Throw Errors

### 11.4 Built-in Error Types
- 11.4.1 Error
- 11.4.2 SyntaxError
- 11.4.3 ReferenceError
- 11.4.4 TypeError
- 11.4.5 RangeError
- 11.4.6 URIError
- 11.4.7 EvalError
- 11.4.8 AggregateError (ES2021)

### 11.5 Custom Error Classes
- 11.5.1 Extending Error Class
- 11.5.2 Custom Error Properties
- 11.5.3 Error Factory Functions

### 11.6 Error Handling Best Practices
- 11.6.1 Fail Fast Principle
- 11.6.2 Error Logging
- 11.6.3 Error Boundaries (React Context)

---

## **12. ASYNCHRONOUS JAVASCRIPT** (48 subtopics)

### 12.1 Synchronous vs Asynchronous
- 12.1.1 Understanding Blocking Code
- 12.1.2 Understanding Non-blocking Code
- 12.1.3 Event Loop Basics
- 12.1.4 Call Stack
- 12.1.5 Task Queue / Callback Queue
- 12.1.6 Microtask Queue

### 12.2 Callbacks
- 12.2.1 Callback Function Basics
- 12.2.2 Asynchronous Callbacks
- 12.2.3 Callback Hell / Pyramid of Doom
- 12.2.4 Error-first Callbacks
- 12.2.5 Callback Patterns

### 12.3 Promises (ES6)
- 12.3.1 Promise States (Pending, Fulfilled, Rejected)
- 12.3.2 Creating Promises
- 12.3.3 Promise Constructor
- 12.3.4 then() Method
- 12.3.5 catch() Method
- 12.3.6 finally() Method (ES2018)
- 12.3.7 Promise Chaining
- 12.3.8 Returning Promises
- 12.3.9 Promise Error Handling

### 12.4 Promise Static Methods
- 12.4.1 Promise.resolve()
- 12.4.2 Promise.reject()
- 12.4.3 Promise.all()
- 12.4.4 Promise.allSettled() (ES2020)
- 12.4.5 Promise.race()
- 12.4.6 Promise.any() (ES2021)
- 12.4.7 Comparing Promise Methods

### 12.5 Async/Await (ES2017)
- 12.5.1 async Function Basics
- 12.5.2 await Keyword
- 12.5.3 Async Functions Return Promises
- 12.5.4 Error Handling with Try-Catch
- 12.5.5 Async/Await vs Promises
- 12.5.6 Parallel Execution with Async/Await
- 12.5.7 Sequential vs Concurrent Operations
- 12.5.8 Top-level Await (ES2022)

### 12.6 Timers
- 12.6.1 setTimeout()
- 12.6.2 clearTimeout()
- 12.6.3 setInterval()
- 12.6.4 clearInterval()
- 12.6.5 setImmediate() (Node.js)
- 12.6.6 process.nextTick() (Node.js)

### 12.7 Event Loop Deep Dive
- 12.7.1 Event Loop Phases
- 12.7.2 Macro Tasks vs Micro Tasks
- 12.7.3 Execution Order
- 12.7.4 RequestAnimationFrame
- 12.7.5 RequestIdleCallback

### 12.8 Async Patterns
- 12.8.1 Sequential Execution
- 12.8.2 Parallel Execution
- 12.8.3 Race Conditions
- 12.8.4 Retry Logic
- 12.8.5 Timeout Patterns
- 12.8.6 Circuit Breaker Pattern

---

## **13. THIS KEYWORD AND CONTEXT** (18 subtopics)

### 13.1 'this' Basics
- 13.1.1 What is 'this'?
- 13.1.2 Execution Context
- 13.1.3 Global Context
- 13.1.4 Function Context

### 13.2 'this' Binding Rules
- 13.2.1 Default Binding
- 13.2.2 Implicit Binding
- 13.2.3 Explicit Binding
- 13.2.4 new Binding
- 13.2.5 Binding Precedence

### 13.3 Changing 'this' Context
- 13.3.1 call() Method
- 13.3.2 apply() Method
- 13.3.3 bind() Method
- 13.3.4 Partial Application with bind()

### 13.4 'this' in Different Scenarios
- 13.4.1 'this' in Object Methods
- 13.4.2 'this' in Event Handlers
- 13.4.3 'this' in Arrow Functions
- 13.4.4 'this' in Classes
- 13.4.5 'this' in Strict Mode
- 13.4.6 Lost 'this' Problem

---

## **14. OBJECT-ORIENTED PROGRAMMING (OOP)** (42 subtopics)

### 14.1 OOP Principles
- 14.1.1 Encapsulation
- 14.1.2 Abstraction
- 14.1.3 Inheritance
- 14.1.4 Polymorphism
- 14.1.5 SOLID Principles Overview

### 14.2 Constructor Functions
- 14.2.1 Creating Constructor Functions
- 14.2.2 'new' Keyword Behavior
- 14.2.3 Constructor Pattern
- 14.2.4 Constructor Return Values

### 14.3 Prototypes
- 14.3.1 Prototype Property
- 14.3.2 Prototype Chain
- 14.3.3 Adding Methods to Prototype
- 14.3.4 Prototype vs Instance Properties
- 14.3.5 Prototype Inheritance
- 14.3.6 Object.create() Pattern

### 14.4 ES6 Classes
- 14.4.1 Class Declaration
- 14.4.2 Class Expression
- 14.4.3 Constructor Method
- 14.4.4 Instance Methods
- 14.4.5 Static Methods
- 14.4.6 Static Properties
- 14.4.7 Class Fields (ES2022)
- 14.4.8 Private Fields (#) (ES2022)
- 14.4.9 Private Methods (ES2022)
- 14.4.10 Getters and Setters in Classes

### 14.5 Inheritance
- 14.5.1 extends Keyword
- 14.5.2 super Keyword
- 14.5.3 Method Overriding
- 14.5.4 Calling Parent Methods
- 14.5.5 Multiple Inheritance (Mixins)
- 14.5.6 Composition over Inheritance

### 14.6 Design Patterns
- 14.6.1 Singleton Pattern
- 14.6.2 Factory Pattern
- 14.6.3 Module Pattern
- 14.6.4 Revealing Module Pattern
- 14.6.5 Observer Pattern
- 14.6.6 Pub/Sub Pattern
- 14.6.7 Prototype Pattern
- 14.6.8 Decorator Pattern
- 14.6.9 Strategy Pattern
- 14.6.10 Facade Pattern

### 14.7 Object Composition
- 14.7.1 Composition Basics
- 14.7.2 Mixin Pattern
- 14.7.3 Object.assign() for Composition
- 14.7.4 Functional Mixins

---

## **15. ES6+ MODERN FEATURES** (38 subtopics)

### 15.1 Destructuring
- 15.1.1 Array Destructuring
- 15.1.2 Object Destructuring
- 15.1.3 Nested Destructuring
- 15.1.4 Default Values in Destructuring
- 15.1.5 Rest in Destructuring
- 15.1.6 Destructuring Function Parameters

### 15.2 Spread and Rest
- 15.2.1 Spread Operator (...)
- 15.2.2 Spread with Arrays
- 15.2.3 Spread with Objects
- 15.2.4 Rest Parameters
- 15.2.5 Rest vs Arguments Object

### 15.3 Enhanced Object Literals
- 15.3.1 Property Shorthand
- 15.3.2 Method Shorthand
- 15.3.3 Computed Property Names
- 15.3.4 Dynamic Property Names

### 15.4 Modules (ES6)
- 15.4.1 Export Statement
- 15.4.2 Named Exports
- 15.4.3 Default Export
- 15.4.4 Import Statement
- 15.4.5 Import Default
- 15.4.6 Import Named
- 15.4.7 Import All (*)
- 15.4.8 Re-exporting
- 15.4.9 Dynamic Imports
- 15.4.10 Module Patterns
- 15.4.11 CommonJS vs ES6 Modules

### 15.5 Symbols
- 15.5.1 Creating Symbols
- 15.5.2 Symbol Description
- 15.5.3 Symbol Use Cases
- 15.5.4 Well-known Symbols
- 15.5.5 Symbol.iterator
- 15.5.6 Symbol.toStringTag
- 15.5.7 Symbol Registry (Symbol.for)

### 15.6 Iterators and Iterables
- 15.6.1 Iterator Protocol
- 15.6.2 Iterable Protocol
- 15.6.3 Creating Custom Iterators
- 15.6.4 for...of Loop with Iterables
- 15.6.5 Built-in Iterables

---

## **16. COLLECTIONS** (32 subtopics)

### 16.1 Map (ES6)
- 16.1.1 Creating Maps
- 16.1.2 Map Methods (set, get, has, delete, clear)
- 16.1.3 Map vs Object
- 16.1.4 Map Iteration
- 16.1.5 Map Size Property
- 16.1.6 Map Keys (Any Type)
- 16.1.7 WeakMap

### 16.2 Set (ES6)
- 16.2.1 Creating Sets
- 16.2.2 Set Methods (add, has, delete, clear)
- 16.2.3 Set vs Array
- 16.2.4 Set Iteration
- 16.2.5 Set Size Property
- 16.2.6 Set Operations (Union, Intersection, Difference)
- 16.2.7 WeakSet

### 16.3 WeakMap and WeakSet
- 16.3.1 WeakMap Basics
- 16.3.2 WeakMap Use Cases
- 16.3.3 WeakMap Limitations
- 16.3.4 WeakSet Basics
- 16.3.5 WeakSet Use Cases
- 16.3.6 Garbage Collection with Weak Collections

### 16.4 Collection Performance
- 16.4.1 Map vs Object Performance
- 16.4.2 Set vs Array Performance
- 16.4.3 When to Use Each Collection
- 16.4.4 Memory Considerations

### 16.5 Advanced Collection Patterns
- 16.5.1 Chaining Map Operations
- 16.5.2 Filtering Sets
- 16.5.3 Converting Collections
- 16.5.4 Nested Collections
- 16.5.5 Collection Serialization
- 16.5.6 Collection Immutability

---

## **17. FUNCTIONAL PROGRAMMING** (28 subtopics)

### 17.1 FP Concepts
- 17.1.1 Pure Functions
- 17.1.2 Immutability
- 17.1.3 First-Class Functions
- 17.1.4 Higher-Order Functions
- 17.1.5 Referential Transparency
- 17.1.6 Side Effects

### 17.2 Array Methods for FP
- 17.2.1 map() for Transformation
- 17.2.2 filter() for Selection
- 17.2.3 reduce() for Aggregation
- 17.2.4 Method Chaining
- 17.2.5 Avoiding Mutations

### 17.3 Function Composition
- 17.3.1 Compose Function
- 17.3.2 Pipe Function
- 17.3.3 Point-free Style
- 17.3.4 Function Combinators

### 17.4 Currying and Partial Application
- 17.4.1 Currying Explained
- 17.4.2 Manual Currying
- 17.4.3 Auto-currying
- 17.4.4 Partial Application
- 17.4.5 Practical Use Cases

### 17.5 Recursion in FP
- 17.5.1 Recursive Array Processing
- 17.5.2 Tail Call Optimization
- 17.5.3 Trampolining

### 17.6 Functors and Monads
- 17.6.1 Functor Basics
- 17.6.2 Maybe Monad
- 17.6.3 Either Monad
- 17.6.4 Promise as Monad

### 17.7 FP Libraries
- 17.7.1 Lodash/fp
- 17.7.2 Ramda
- 17.7.3 Immutable.js
- 17.7.4 Folktale

---

## **18. BROWSER APIs** (58 subtopics)

### 18.1 DOM (Document Object Model)
- 18.1.1 Understanding DOM
- 18.1.2 DOM Tree Structure
- 18.1.3 Node Types
- 18.1.4 Element vs Node
- 18.1.5 Selecting Elements
  - 18.1.5.1 getElementById()
  - 18.1.5.2 getElementsByClassName()
  - 18.1.5.3 getElementsByTagName()
  - 18.1.5.4 querySelector()
  - 18.1.5.5 querySelectorAll()
- 18.1.6 Traversing DOM
  - 18.1.6.1 parentNode, parentElement
  - 18.1.6.2 childNodes, children
  - 18.1.6.3 firstChild, lastChild
  - 18.1.6.4 nextSibling, previousSibling
  - 18.1.6.5 closest()
- 18.1.7 Manipulating Elements
  - 18.1.7.1 createElement()
  - 18.1.7.2 createTextNode()
  - 18.1.7.3 appendChild()
  - 18.1.7.4 insertBefore()
  - 18.1.7.5 replaceChild()
  - 18.1.7.6 removeChild()
  - 18.1.7.7 remove()
  - 18.1.7.8 cloneNode()
- 18.1.8 Element Properties
  - 18.1.8.1 innerHTML
  - 18.1.8.2 textContent
  - 18.1.8.3 innerText
  - 18.1.8.4 outerHTML
- 18.1.9 Attributes
  - 18.1.9.1 getAttribute()
  - 18.1.9.2 setAttribute()
  - 18.1.9.3 removeAttribute()
  - 18.1.9.4 hasAttribute()
  - 18.1.9.5 dataset (data-* attributes)
- 18.1.10 CSS Manipulation
  - 18.1.10.1 style Property
  - 18.1.10.2 classList (add, remove, toggle, contains)
  - 18.1.10.3 className
  - 18.1.10.4 getComputedStyle()
- 18.1.11 DOM Performance
  - 18.1.11.1 Reflow and Repaint
  - 18.1.11.2 DocumentFragment
  - 18.1.11.3 Virtual DOM Concept

### 18.2 Events
- 18.2.1 Event Basics
- 18.2.2 Event Listeners
  - 18.2.2.1 addEventListener()
  - 18.2.2.2 removeEventListener()
  - 18.2.2.3 Event Handler Properties
- 18.2.3 Event Object
- 18.2.4 Event Types
  - 18.2.4.1 Mouse Events (click, dblclick, mousedown, mouseup, mousemove, etc.)
  - 18.2.4.2 Keyboard Events (keydown, keyup, keypress)
  - 18.2.4.3 Form Events (submit, change, input, focus, blur)
  - 18.2.4.4 Window Events (load, resize, scroll, unload)
  - 18.2.4.5 Touch Events
  - 18.2.4.6 Drag and Drop Events
- 18.2.5 Event Propagation
  - 18.2.5.1 Event Bubbling
  - 18.2.5.2 Event Capturing
  - 18.2.5.3 stopPropagation()
  - 18.2.5.4 stopImmediatePropagation()
- 18.2.6 Event Delegation
- 18.2.7 preventDefault()
- 18.2.8 Custom Events
- 18.2.9 Event Performance Optimization

### 18.3 BOM (Browser Object Model)
- 18.3.1 Window Object
- 18.3.2 Navigator Object
- 18.3.3 Location Object
- 18.3.4 History API
- 18.3.5 Screen Object
- 18.3.6 Document Object

### 18.4 Storage APIs
- 18.4.1 localStorage
- 18.4.2 sessionStorage
- 18.4.3 Storage Events
- 18.4.4 IndexedDB
- 18.4.5 Cookies
- 18.4.6 Cache API

### 18.5 Fetch API
- 18.5.1 fetch() Basics
- 18.5.2 Request Object
- 18.5.3 Response Object
- 18.5.4 Headers
- 18.5.5 HTTP Methods (GET, POST, PUT, DELETE)
- 18.5.6 Request Body
- 18.5.7 Handling Responses
- 18.5.8 Error Handling
- 18.5.9 Fetch vs XMLHttpRequest

### 18.6 Other Browser APIs
- 18.6.1 Console API
- 18.6.2 Geolocation API
- 18.6.3 Notification API
- 18.6.4 Web Workers
- 18.6.5 Service Workers
- 18.6.6 File API
- 18.6.7 Canvas API
- 18.6.8 Web Audio API
- 18.6.9 WebRTC
- 18.6.10 Intersection Observer API
- 18.6.11 Mutation Observer API
- 18.6.12 Resize Observer API
- 18.6.13 Clipboard API

---

## **19. AJAX AND HTTP** (24 subtopics)

### 19.1 HTTP Basics
- 19.1.1 HTTP Protocol
- 19.1.2 HTTP Methods
- 19.1.3 HTTP Status Codes
- 19.1.4 HTTP Headers
- 19.1.5 Request/Response Cycle
- 19.1.6 RESTful APIs

### 19.2 XMLHttpRequest (Legacy)
- 19.2.1 Creating XHR Objects
- 19.2.2 XHR Methods
- 19.2.3 XHR Events
- 19.2.4 XHR Properties
- 19.2.5 Handling XHR Responses

### 19.3 Fetch API (Modern)
- 19.3.1 Basic Fetch Usage
- 19.3.2 Fetch Options
- 19.3.3 Handling JSON
- 19.3.4 FormData
- 19.3.5 Blob and File Uploads
- 19.3.6 Streaming Responses
- 19.3.7 AbortController (Canceling Requests)

### 19.4 CORS (Cross-Origin Resource Sharing)
- 19.4.1 Same-Origin Policy
- 19.4.2 CORS Headers
- 19.4.3 Preflight Requests
- 19.4.4 Credentials in CORS

### 19.5 API Integration
- 19.5.1 API Authentication (Tokens, OAuth)
- 19.5.2 Rate Limiting
- 19.5.3 Error Handling Strategies
- 19.5.4 Retry Logic

---

## **20. JSON** (12 subtopics)

### 20.1 JSON Basics
- 20.1.1 JSON Syntax
- 20.1.2 JSON Data Types
- 20.1.3 JSON Structure
- 20.1.4 JSON vs JavaScript Objects

### 20.2 JSON Methods
- 20.2.1 JSON.parse()
- 20.2.2 JSON.stringify()
- 20.2.3 Reviver Function
- 20.2.4 Replacer Function
- 20.2.5 Pretty Printing JSON

### 20.3 JSON Handling
- 20.3.1 Parsing JSON Errors
- 20.3.2 Circular References
- 20.3.3 Date Serialization
- 20.3.4 Function Serialization Limitation

### 20.4 JSON Use Cases
- 20.4.1 API Communication
- 20.4.2 Configuration Files
- 20.4.3 Data Storage

---

## **21. MODULES AND BUNDLERS** (22 subtopics)

### 21.1 Module Systems
- 21.1.1 CommonJS (Node.js)
- 21.1.2 ES6 Modules (ESM)
- 21.1.3 AMD (RequireJS)
- 21.1.4 UMD (Universal Module Definition)
- 21.1.5 Module System Comparison

### 21.2 ES6 Module Features
- 21.2.1 Named Exports/Imports
- 21.2.2 Default Exports/Imports
- 21.2.3 Mixed Exports
- 21.2.4 Re-exporting
- 21.2.5 Dynamic Imports
- 21.2.6 Import.meta
- 21.2.7 Tree Shaking

### 21.3 Build Tools
- 21.3.1 Webpack
- 21.3.2 Rollup
- 21.3.3 Parcel
- 21.3.4 Vite
- 21.3.5 esbuild
- 21.3.6 Snowpack

### 21.4 Module Bundling Concepts
- 21.4.1 Code Splitting
- 21.4.2 Lazy Loading
- 21.4.3 Dead Code Elimination
- 21.4.4 Minification
- 21.4.5 Source Maps
- 21.4.6 Hot Module Replacement (HMR)

---

## **22. TESTING** (26 subtopics)

### 22.1 Testing Fundamentals
- 22.1.1 Types of Tests (Unit, Integration, E2E)
- 22.1.2 Test-Driven Development (TDD)
- 22.1.3 Behavior-Driven Development (BDD)
- 22.1.4 Test Coverage
- 22.1.5 Assertions

### 22.2 Unit Testing
- 22.2.1 Writing Unit Tests
- 22.2.2 Test Structure (Arrange-Act-Assert)
- 22.2.3 Mocking
- 22.2.4 Stubbing
- 22.2.5 Spies

### 22.3 Testing Frameworks
- 22.3.1 Jest
- 22.3.2 Mocha
- 22.3.3 Jasmine
- 22.3.4 Vitest
- 22.3.5 AVA

### 22.4 Testing Tools
- 22.4.1 Chai (Assertions)
- 22.4.2 Sinon (Mocking)
- 22.4.3 Testing Library
- 22.4.4 Enzyme (React)
- 22.4.5 Cypress (E2E)
- 22.4.6 Playwright (E2E)
- 22.4.7 Puppeteer

### 22.5 Test Patterns
- 22.5.1 Setup and Teardown
- 22.5.2 Test Fixtures
- 22.5.3 Snapshot Testing
- 22.5.4 Property-based Testing
- 22.5.5 Visual Regression Testing

### 22.6 Testing Async Code
- 22.6.1 Testing Callbacks
- 22.6.2 Testing Promises
- 22.6.3 Testing Async/Await
- 22.6.4 Timeout Handling

---

## **23. PERFORMANCE OPTIMIZATION** (32 subtopics)

### 23.1 JavaScript Performance
- 23.1.1 V8 Engine Optimization
- 23.1.2 JIT Compilation
- 23.1.3 Hidden Classes
- 23.1.4 Inline Caching

### 23.2 Code Optimization
- 23.2.1 Loop Optimization
- 23.2.2 Function Optimization
- 23.2.3 Object Creation Optimization
- 23.2.4 String Concatenation
- 23.2.5 Avoiding Memory Leaks
- 23.2.6 Garbage Collection

### 23.3 DOM Performance
- 23.3.1 Minimizing DOM Access
- 23.3.2 Batch DOM Updates
- 23.3.3 DocumentFragment Usage
- 23.3.4 Avoiding Layout Thrashing
- 23.3.5 Virtual Scrolling

### 23.4 Rendering Performance
- 23.4.1 requestAnimationFrame
- 23.4.2 Debouncing and Throttling
- 23.4.3 Lazy Loading
- 23.4.4 Image Optimization
- 23.4.5 Critical Rendering Path

### 23.5 Network Performance
- 23.5.1 Resource Minification
- 23.5.2 Compression (Gzip, Brotli)
- 23.5.3 Code Splitting
- 23.5.4 Caching Strategies
- 23.5.5 CDN Usage
- 23.5.6 HTTP/2 and HTTP/3

### 23.6 Measuring Performance
- 23.6.1 Performance API
- 23.6.2 Chrome DevTools Performance Tab
- 23.6.3 Lighthouse
- 23.6.4 Web Vitals (LCP, FID, CLS)
- 23.6.5 console.time() and console.timeEnd()
- 23.6.6 Performance.now()
- 23.6.7 PerformanceObserver

### 23.7 Memory Management
- 23.7.1 Heap and Stack
- 23.7.2 Memory Profiling
- 23.7.3 Detecting Memory Leaks
- 23.7.4 WeakMap/WeakSet for Memory Optimization

---

## **24. SECURITY** (24 subtopics)

### 24.1 Common Vulnerabilities
- 24.1.1 XSS (Cross-Site Scripting)
- 24.1.2 CSRF (Cross-Site Request Forgery)
- 24.1.3 Injection Attacks
- 24.1.4 Clickjacking
- 24.1.5 Man-in-the-Middle Attacks

### 24.2 Input Validation
- 24.2.1 Client-side Validation
- 24.2.2 Sanitization
- 24.2.3 Whitelisting vs Blacklisting
- 24.2.4 Regular Expression Safety

### 24.3 Authentication & Authorization
- 24.3.1 JWT (JSON Web Tokens)
- 24.3.2 OAuth 2.0
- 24.3.3 Session Management
- 24.3.4 Secure Password Storage
- 24.3.5 Two-Factor Authentication

### 24.4 Secure Communication
- 24.4.1 HTTPS
- 24.4.2 TLS/SSL
- 24.4.3 Content Security Policy (CSP)
- 24.4.4 CORS Security
- 24.4.5 Secure Headers

### 24.5 Data Protection
- 24.5.1 Encryption Basics
- 24.5.2 Web Crypto API
- 24.5.3 Secure Storage
- 24.5.4 PII (Personally Identifiable Information) Handling

### 24.6 Security Best Practices
- 24.6.1 Least Privilege Principle
- 24.6.2 Input Escaping
- 24.6.3 Dependency Security
- 24.6.4 Regular Security Audits
- 24.6.5 OWASP Top 10

---

## **25. ADVANCED TOPICS** (35 subtopics)

### 25.1 Metaprogramming
- 25.1.1 Reflect API
- 25.1.2 Proxy Objects
- 25.1.3 Property Descriptors
- 25.1.4 Object Introspection

### 25.2 Memory and Performance Deep Dive
- 25.2.1 Garbage Collection Algorithms
- 25.2.2 Memory Profiling Tools
- 25.2.3 Performance Profiling
- 25.2.4 Benchmark Testing

### 25.3 Web Workers
- 25.3.1 Dedicated Workers
- 25.3.2 Shared Workers
- 25.3.3 Service Workers
- 25.3.4 Worker Communication
- 25.3.5 Worklets

### 25.4 WebAssembly (WASM)
- 25.4.1 WASM Basics
- 25.4.2 JavaScript-WASM Interop
- 25.4.3 Use Cases for WASM
- 25.4.4 Performance Comparisons

### 25.5 Streams API
- 25.5.1 Readable Streams
- 25.5.2 Writable Streams
- 25.5.3 Transform Streams
- 25.5.4 Backpressure
- 25.5.5 Piping Streams

### 25.6 Internationalization (i18n)
- 25.6.1 Intl Object
- 25.6.2 Intl.DateTimeFormat
- 25.6.3 Intl.NumberFormat
- 25.6.4 Intl.Collator
- 25.6.5 Intl.PluralRules
- 25.6.6 Intl.RelativeTimeFormat
- 25.6.7 Locale-specific Formatting

### 25.7 Design Patterns (Advanced)
- 25.7.1 Dependency Injection
- 25.7.2 Mediator Pattern
- 25.7.3 Command Pattern
- 25.7.4 State Pattern
- 25.7.5 Iterator Pattern
- 25.7.6 Proxy Pattern

### 25.8 Compiler and Transpilers
- 25.8.1 Babel
- 25.8.2 TypeScript
- 25.8.3 AST (Abstract Syntax Tree)
- 25.8.4 Source Maps

### 25.9 Node.js Specific
- 25.9.1 Event Emitters
- 25.9.2 Streams in Node.js
- 25.9.3 Buffer
- 25.9.4 File System (fs) Module
- 25.9.5 Child Processes

---

## **BONUS TOPICS** (Framework-Specific - Not Core JS)

### B.1 React Ecosystem
### B.2 Vue.js Ecosystem
### B.3 Angular Ecosystem
### B.4 Node.js & Express
### B.5 TypeScript
### B.6 GraphQL
### B.7 Progressive Web Apps (PWA)
### B.8 Mobile Development (React Native, Ionic)

---

## **LEARNING PATH RECOMMENDATIONS**

### **Beginner Path** (Weeks 1-12)
1. Topics 1-3: Introduction, Basics, Control Flow
2. Topic 4: Functions
3. Topic 5: Objects
4. Topic 6: Arrays
5. Topic 7: Strings
6. Topic 18 (Partial): DOM Basics, Events Basics

### **Intermediate Path** (Weeks 13-28)
7. Topic 8: Regular Expressions
8. Topic 9: Numbers and Math
9. Topic 10: Date and Time
10. Topic 11: Error Handling
11. Topic 12: Asynchronous JavaScript
12. Topic 13: 'this' Keyword
13. Topic 14: OOP
14. Topic 15: ES6+ Features
15. Topic 16: Collections
16. Topic 18 (Complete): Browser APIs
17. Topic 19: AJAX and HTTP
18. Topic 20: JSON

### **Advanced Path** (Weeks 29-52)
19. Topic 17: Functional Programming
20. Topic 21: Modules and Bundlers
21. Topic 22: Testing
22. Topic 23: Performance Optimization
23. Topic 24: Security
24. Topic 25: Advanced Topics

---

## **PRACTICE RECOMMENDATIONS**

### For Each Major Topic:
1. **Read Theory** (20% time)
2. **Code Examples** (30% time)
3. **Build Mini Projects** (40% time)
4. **Review and Refactor** (10% time)

### Project Ideas by Level:
- **Beginner:** Calculator, Todo List, Quiz App
- **Intermediate:** Weather App, Movie Search, E-commerce Cart
- **Advanced:** Real-time Chat, Data Visualization Dashboard, Full-stack Application

---

## **RESOURCES CHECKLIST**

- [ ] MDN Web Docs (Primary Reference)
- [ ] JavaScript.info (Detailed Tutorials)
- [ ] ECMAScript Specifications
- [ ] Node.js Documentation
- [ ] Browser DevTools Documentation
- [ ] GitHub for Code Examples
- [ ] Stack Overflow for Problem Solving
- [ ] YouTube Channels (Traversy Media, Fireship, Web Dev Simplified)

---

**Total Learning Index Summary:**
- **25 Major Topics**
- **312+ Subtopics**
- **Estimated 400-600 hours** of focused learning
- **Covers:** Core JavaScript + Browser APIs + Modern Features + Advanced Concepts
- **Applicable to:** Front-end, Back-end (Node.js), Full-stack Development

---

*This index is designed as a complete roadmap. Master each topic sequentially for best results. Happy coding! 🚀*
