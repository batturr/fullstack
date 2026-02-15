# JavaScript Operators

An **operator** is a symbol that performs an operation on one or more values (operands) and produces a result. JavaScript supports a wide variety of operators for arithmetic, comparison, logic, assignment, and more.

---

## 📑 Table of Contents

- [JavaScript Operators](#javascript-operators)
  - [📑 Table of Contents](#-table-of-contents)
  - [What are Operators?](#what-are-operators)
    - [Key Terminology:](#key-terminology)
    - [Simple Example:](#simple-example)
  - [Types of Operators](#types-of-operators)
  - [Arithmetic Operators](#arithmetic-operators)
    - [Example 1: Basic Arithmetic](#example-1-basic-arithmetic)
    - [Example 2: Division Results](#example-2-division-results)
    - [Example 3: Modulus (Remainder) Use Cases](#example-3-modulus-remainder-use-cases)
    - [Example 4: Exponentiation](#example-4-exponentiation)
    - [Example 5: Floating-Point Precision](#example-5-floating-point-precision)
  - [Assignment Operators](#assignment-operators)
    - [Example 1: Basic Assignment](#example-1-basic-assignment)
    - [Example 2: String Assignment](#example-2-string-assignment)
    - [Example 3: Logical Assignment (ES2021)](#example-3-logical-assignment-es2021)
  - [Unary Operators (Increment \& Decrement)](#unary-operators-increment--decrement)
    - [Example 1: Post-Increment (`x++`)](#example-1-post-increment-x)
    - [Example 2: Pre-Increment (`++x`)](#example-2-pre-increment-x)
    - [Example 3: Post-Decrement (`x--`)](#example-3-post-decrement-x--)
    - [Example 4: Pre-Decrement (`--x`)](#example-4-pre-decrement---x)
    - [Example 5: Pre vs Post in Expressions](#example-5-pre-vs-post-in-expressions)
    - [Example 6: In Loops](#example-6-in-loops)
    - [Example 7: Other Unary Operators](#example-7-other-unary-operators)
  - [Relational (Comparison) Operators](#relational-comparison-operators)
    - [Example 1: Basic Comparisons](#example-1-basic-comparisons)
    - [Example 2: String Comparisons](#example-2-string-comparisons)
    - [Example 3: Mixed Type Comparisons](#example-3-mixed-type-comparisons)
    - [Example 4: In Conditional Statements](#example-4-in-conditional-statements)
  - [Equality Operators (== vs ===)](#equality-operators--vs-)
    - [Example 1: Loose Equality (`==`) — With Coercion](#example-1-loose-equality---with-coercion)
    - [Example 2: Strict Equality (`===`) — No Coercion](#example-2-strict-equality---no-coercion)
    - [Example 3: Loose Inequality (`!=`)](#example-3-loose-inequality-)
    - [Example 4: Strict Inequality (`!==`)](#example-4-strict-inequality-)
    - [Example 5: Tricky `==` Comparisons](#example-5-tricky--comparisons)
    - [`==` vs `===` Quick Reference:](#-vs--quick-reference)
  - [Logical Operators](#logical-operators)
    - [Truth Table:](#truth-table)
    - [Example 1: Logical AND (`&&`)](#example-1-logical-and-)
    - [Example 2: Logical OR (`||`)](#example-2-logical-or-)
    - [Example 3: Logical NOT (`!`)](#example-3-logical-not-)
    - [Example 4: Short-Circuit Evaluation](#example-4-short-circuit-evaluation)
    - [Example 5: Default Values with `||`](#example-5-default-values-with-)
    - [Example 6: Conditional Execution with `&&`](#example-6-conditional-execution-with-)
  - [Concatenation Operator](#concatenation-operator)
    - [Example 1: Basic Concatenation](#example-1-basic-concatenation)
    - [Example 2: Number + String = String](#example-2-number--string--string)
    - [Example 3: Template Literals (Modern Alternative)](#example-3-template-literals-modern-alternative)
    - [Example 4: Multiline Strings](#example-4-multiline-strings)
    - [Example 5: concat() Method](#example-5-concat-method)
  - [Bitwise Operators](#bitwise-operators)
    - [Example 1: Bitwise AND (`&`)](#example-1-bitwise-and-)
    - [Example 2: Bitwise OR (`|`)](#example-2-bitwise-or-)
    - [Example 3: Bitwise XOR (`^`)](#example-3-bitwise-xor-)
    - [Example 4: Bitwise NOT (`~`)](#example-4-bitwise-not-)
    - [Example 5: Left Shift (`<<`) and Right Shift (`>>`)](#example-5-left-shift--and-right-shift-)
    - [Example 6: Practical Uses](#example-6-practical-uses)
  - [Ternary (Conditional) Operator](#ternary-conditional-operator)
    - [Syntax:](#syntax)
    - [Example 1: Basic Ternary](#example-1-basic-ternary)
    - [Example 2: Replacing if...else](#example-2-replacing-ifelse)
    - [Example 3: Nested Ternary](#example-3-nested-ternary)
    - [Example 4: Ternary in Template Literals](#example-4-ternary-in-template-literals)
    - [Example 5: Ternary for Default Values](#example-5-ternary-for-default-values)
    - [Example 6: Ternary with Function Calls](#example-6-ternary-with-function-calls)
  - [Type Operators](#type-operators)
    - [Example 1: typeof Operator](#example-1-typeof-operator)
    - [Example 2: instanceof Operator](#example-2-instanceof-operator)
    - [Example 3: Practical Type Checking](#example-3-practical-type-checking)
  - [Spread and Rest Operators](#spread-and-rest-operators)
    - [Spread Operator (Expands elements)](#spread-operator-expands-elements)
      - [Example 1: Spread in Arrays](#example-1-spread-in-arrays)
      - [Example 2: Spread in Objects](#example-2-spread-in-objects)
      - [Example 3: Copy Arrays and Objects](#example-3-copy-arrays-and-objects)
      - [Example 4: Spread in Function Calls](#example-4-spread-in-function-calls)
    - [Rest Operator (Collects elements)](#rest-operator-collects-elements)
      - [Example 5: Rest in Function Parameters](#example-5-rest-in-function-parameters)
      - [Example 6: Rest in Destructuring](#example-6-rest-in-destructuring)
  - [Optional Chaining Operator (?.)](#optional-chaining-operator-)
    - [Example 1: Object Property Access](#example-1-object-property-access)
    - [Example 2: Method Calls](#example-2-method-calls)
    - [Example 3: Array Element Access](#example-3-array-element-access)
    - [Example 4: Chained Optional Access](#example-4-chained-optional-access)
  - [Nullish Coalescing Operator (??)](#nullish-coalescing-operator-)
    - [Example 1: Basic Nullish Coalescing](#example-1-basic-nullish-coalescing)
    - [Example 2: `??` vs `||`](#example-2--vs-)
    - [Example 3: With Optional Chaining](#example-3-with-optional-chaining)
  - [Comma Operator](#comma-operator)
    - [Example 1: Basic Comma Operator](#example-1-basic-comma-operator)
    - [Example 2: In for Loop](#example-2-in-for-loop)
  - [Operator Precedence](#operator-precedence)
    - [Precedence Table (High to Low):](#precedence-table-high-to-low)
    - [Example 1: Precedence in Action](#example-1-precedence-in-action)
    - [Example 2: Left-to-Right Evaluation](#example-2-left-to-right-evaluation)
    - [Example 3: Mixed Operators](#example-3-mixed-operators)
    - [Example 4: Logical Operator Precedence](#example-4-logical-operator-precedence)
  - [Best Practices](#best-practices)
    - [✅ Do:](#-do)
  - [Common Mistakes to Avoid](#common-mistakes-to-avoid)
    - [❌ Don't:](#-dont)
  - [Practical Examples](#practical-examples)
    - [Example 1: Simple Calculator](#example-1-simple-calculator)
    - [Example 2: Grade Calculator with Ternary](#example-2-grade-calculator-with-ternary)
    - [Example 3: Even/Odd Checker](#example-3-evenodd-checker)
    - [Example 4: Safe Object Access](#example-4-safe-object-access)
    - [Example 5: Merge Objects with Spread](#example-5-merge-objects-with-spread)
    - [Example 6: Permission Check with Logical Operators](#example-6-permission-check-with-logical-operators)
    - [Example 7: Fibonacci with Assignment Operators](#example-7-fibonacci-with-assignment-operators)
  - [Quick Reference](#quick-reference)
    - [All Operators at a Glance:](#all-operators-at-a-glance)

---

## What are Operators?

An **operator** is a special symbol that tells the JavaScript engine to perform a specific mathematical, relational, or logical operation.

### Key Terminology:

| Term | Definition | Example |
|------|-----------|---------|
| **Operator** | Symbol that performs an operation | `+`, `-`, `*` |
| **Operand** | The value the operator acts on | In `5 + 3`, `5` and `3` are operands |
| **Unary** | Operator with one operand | `++x`, `typeof x` |
| **Binary** | Operator with two operands | `x + y` |
| **Ternary** | Operator with three operands | `x ? y : z` |

### Simple Example:
```javascript
let result = 10 + 5;  // '+' is operator, 10 and 5 are operands
console.log(result);   // 15
```

---

## Types of Operators

JavaScript supports the following types of operators:

| # | Operator Type | Symbol(s) |
|---|--------------|-----------|
| 1 | Arithmetic Operators | `+`, `-`, `*`, `/`, `%`, `**` |
| 2 | Assignment Operators | `=`, `+=`, `-=`, `*=`, `/=`, `%=`, `**=` |
| 3 | Unary (Increment/Decrement) | `++`, `--` |
| 4 | Relational (Comparison) | `<`, `>`, `<=`, `>=` |
| 5 | Equality Operators | `==`, `!=`, `===`, `!==` |
| 6 | Logical Operators | `&&`, `\|\|`, `!` |
| 7 | Concatenation Operator | `+` (with strings) |
| 8 | Bitwise Operators | `&`, `\|`, `^`, `~`, `<<`, `>>`, `>>>` |
| 9 | Ternary Operator | `? :` |
| 10 | Type Operators | `typeof`, `instanceof` |
| 11 | Spread/Rest Operator | `...` |
| 12 | Optional Chaining | `?.` |
| 13 | Nullish Coalescing | `??` |
| 14 | Comma Operator | `,` |

---

## Arithmetic Operators

Arithmetic operators perform mathematical calculations on numbers.

| Operator | Name | Example | Result |
|----------|------|---------|--------|
| `+` | Addition | `10 + 5` | `15` |
| `-` | Subtraction | `10 - 5` | `5` |
| `*` | Multiplication | `10 * 5` | `50` |
| `/` | Division | `10 / 5` | `2` |
| `%` | Modulus (Remainder) | `10 % 3` | `1` |
| `**` | Exponentiation | `2 ** 3` | `8` |

### Example 1: Basic Arithmetic
```javascript
let a = 10;
let b = 3;

console.log(a + b);   // 13 (Addition)
console.log(a - b);   // 7  (Subtraction)
console.log(a * b);   // 30 (Multiplication)
console.log(a / b);   // 3.3333... (Division)
console.log(a % b);   // 1  (Remainder)
console.log(a ** b);  // 1000 (10 to the power of 3)
```

### Example 2: Division Results
```javascript
console.log(10 / 3);    // 3.3333333333333335
console.log(10 / 0);    // Infinity
console.log(-10 / 0);   // -Infinity
console.log(0 / 0);     // NaN
```

### Example 3: Modulus (Remainder) Use Cases
```javascript
// Check if even or odd
let num = 7;
console.log(num % 2);  // 1 (odd)

let num2 = 10;
console.log(num2 % 2); // 0 (even)

// Get last digit
let number = 12345;
console.log(number % 10);  // 5

// Wrap around values (clock, circular array)
let hour = 25;
console.log(hour % 24);  // 1 (next day 1 AM)
```

### Example 4: Exponentiation
```javascript
console.log(2 ** 3);    // 8 (2 × 2 × 2)
console.log(5 ** 2);    // 25 (5 × 5)
console.log(9 ** 0.5);  // 3 (square root)
console.log(27 ** (1/3)); // 3 (cube root)

// Same as Math.pow()
console.log(Math.pow(2, 3));  // 8
```

### Example 5: Floating-Point Precision
```javascript
console.log(0.1 + 0.2);           // 0.30000000000000004 (not 0.3!)
console.log(0.1 + 0.2 === 0.3);   // false

// Fix with toFixed()
console.log((0.1 + 0.2).toFixed(1));  // "0.3"
console.log(Number((0.1 + 0.2).toFixed(1)));  // 0.3
```

---

## Assignment Operators

Assignment operators assign values to variables and can combine with arithmetic.

| Operator | Name | Example | Equivalent To |
|----------|------|---------|---------------|
| `=` | Assign | `x = 10` | `x = 10` |
| `+=` | Add and assign | `x += 5` | `x = x + 5` |
| `-=` | Subtract and assign | `x -= 5` | `x = x - 5` |
| `*=` | Multiply and assign | `x *= 5` | `x = x * 5` |
| `/=` | Divide and assign | `x /= 5` | `x = x / 5` |
| `%=` | Modulus and assign | `x %= 5` | `x = x % 5` |
| `**=` | Exponent and assign | `x **= 2` | `x = x ** 2` |
| `&&=` | Logical AND assign | `x &&= 5` | `x && (x = 5)` |
| `\|\|=` | Logical OR assign | `x \|\|= 5` | `x \|\| (x = 5)` |
| `??=` | Nullish assign | `x ??= 5` | `x ?? (x = 5)` |

### Example 1: Basic Assignment
```javascript
let x = 10;
console.log(x);  // 10

x += 5;   // x = x + 5
console.log(x);  // 15

x -= 3;   // x = x - 3
console.log(x);  // 12

x *= 2;   // x = x * 2
console.log(x);  // 24

x /= 4;   // x = x / 4
console.log(x);  // 6

x %= 4;   // x = x % 4
console.log(x);  // 2

x **= 3;  // x = x ** 3
console.log(x);  // 8
```

### Example 2: String Assignment
```javascript
let greeting = "Hello";
greeting += " World";
console.log(greeting);  // "Hello World"

greeting += "!";
console.log(greeting);  // "Hello World!"
```

### Example 3: Logical Assignment (ES2021)
```javascript
// Logical AND assignment (&&=)
let a = 1;
a &&= 5;  // a is truthy, so a = 5
console.log(a);  // 5

let b = 0;
b &&= 5;  // b is falsy, so b stays 0
console.log(b);  // 0

// Logical OR assignment (||=)
let c = 0;
c ||= 10;  // c is falsy, so c = 10
console.log(c);  // 10

let d = 5;
d ||= 10;  // d is truthy, so d stays 5
console.log(d);  // 5

// Nullish coalescing assignment (??=)
let e = null;
e ??= "default";  // e is null, so e = "default"
console.log(e);    // "default"

let f = 0;
f ??= 10;  // f is 0 (not null/undefined), so f stays 0
console.log(f);    // 0
```

---

## Unary Operators (Increment & Decrement)

Unary operators work with a single operand to increase or decrease a value by 1.

| Operator | Name | Description |
|----------|------|-------------|
| `++x` | Pre-increment | Increment first, then use value |
| `x++` | Post-increment | Use value first, then increment |
| `--x` | Pre-decrement | Decrement first, then use value |
| `x--` | Post-decrement | Use value first, then decrement |

### Example 1: Post-Increment (`x++`)
```javascript
let x = 5;
console.log(x++);  // 5 (uses value first, then increments)
console.log(x);    // 6 (now incremented)
```

### Example 2: Pre-Increment (`++x`)
```javascript
let x = 5;
console.log(++x);  // 6 (increments first, then uses value)
console.log(x);    // 6
```

### Example 3: Post-Decrement (`x--`)
```javascript
let x = 5;
console.log(x--);  // 5 (uses value first, then decrements)
console.log(x);    // 4 (now decremented)
```

### Example 4: Pre-Decrement (`--x`)
```javascript
let x = 5;
console.log(--x);  // 4 (decrements first, then uses value)
console.log(x);    // 4
```

### Example 5: Pre vs Post in Expressions
```javascript
let a = 10;
let b = 10;

let result1 = a++ + 5;  // 10 + 5 = 15, then a becomes 11
let result2 = ++b + 5;  // b becomes 11, then 11 + 5 = 16

console.log(result1);  // 15
console.log(result2);  // 16
console.log(a);         // 11
console.log(b);         // 11
```

### Example 6: In Loops
```javascript
// Post-increment in loop (most common)
for (let i = 0; i < 5; i++) {
    console.log(i);  // 0, 1, 2, 3, 4
}

// Pre-increment in loop (same output)
for (let i = 0; i < 5; ++i) {
    console.log(i);  // 0, 1, 2, 3, 4
}
```

### Example 7: Other Unary Operators
```javascript
// Unary plus (convert to number)
console.log(+"42");       // 42
console.log(+true);       // 1
console.log(+false);      // 0

// Unary minus (negate)
console.log(-42);         // -42
console.log(-"42");       // -42

// typeof (returns type as string)
console.log(typeof 42);   // "number"
console.log(typeof "hi"); // "string"

// Logical NOT
console.log(!true);       // false
console.log(!0);          // true
console.log(!!"hello");   // true
```

---

## Relational (Comparison) Operators

Relational operators compare two values and return a **boolean** result (`true` or `false`).

| Operator | Name | Example | Result |
|----------|------|---------|--------|
| `<` | Less than | `5 < 10` | `true` |
| `>` | Greater than | `10 > 5` | `true` |
| `<=` | Less than or equal to | `5 <= 5` | `true` |
| `>=` | Greater than or equal to | `10 >= 10` | `true` |

### Example 1: Basic Comparisons
```javascript
let a = 10;
let b = 20;

console.log(a < b);   // true
console.log(a > b);   // false
console.log(a <= 10); // true
console.log(b >= 20); // true
```

### Example 2: String Comparisons
```javascript
// Strings are compared character by character (Unicode values)
console.log("apple" < "banana");  // true ('a' < 'b')
console.log("cat" > "bat");      // true ('c' > 'b')
console.log("abc" < "abd");      // true ('c' < 'd')

// Uppercase comes before lowercase
console.log("A" < "a");   // true (65 < 97)
console.log("Z" < "a");   // true (90 < 97)
```

### Example 3: Mixed Type Comparisons
```javascript
console.log("10" > 5);    // true (string "10" converted to number)
console.log("10" > "9");  // false (string comparison: "1" < "9")
console.log(true > 0);    // true (true → 1)
console.log(null >= 0);   // true (null → 0)
```

### Example 4: In Conditional Statements
```javascript
let age = 18;

if (age >= 18) {
    console.log("You can vote!");    // Executes
} else {
    console.log("Too young to vote");
}

let temperature = 35;
if (temperature > 30) {
    console.log("It's hot!");  // Executes
}
```

---

## Equality Operators (== vs ===)

JavaScript has **two types** of equality comparison.

| Operator | Name | Description |
|----------|------|-------------|
| `==` | Loose Equality | Compares values **with** type coercion |
| `!=` | Loose Inequality | Not equal **with** type coercion |
| `===` | Strict Equality | Compares values **without** type coercion |
| `!==` | Strict Inequality | Not equal **without** type coercion |

### Example 1: Loose Equality (`==`) — With Coercion
```javascript
console.log(5 == "5");           // true (string → number)
console.log(true == 1);          // true (boolean → number)
console.log(false == 0);         // true (boolean → number)
console.log(null == undefined);  // true (special rule)
console.log("" == 0);            // true (string → number)
console.log(" " == 0);           // true (string → number)
console.log([] == false);        // true ([] → "" → 0)
```

### Example 2: Strict Equality (`===`) — No Coercion
```javascript
console.log(5 === "5");           // false (different types)
console.log(true === 1);          // false (different types)
console.log(false === 0);         // false (different types)
console.log(null === undefined);  // false (different types)
console.log("" === 0);            // false (different types)
```

### Example 3: Loose Inequality (`!=`)
```javascript
console.log(5 != "5");   // false (values are equal after coercion)
console.log(5 != 6);     // true
console.log(true != 1);  // false
```

### Example 4: Strict Inequality (`!==`)
```javascript
console.log(5 !== "5");   // true (different types)
console.log(5 !== 5);     // false (same type and value)
console.log(true !== 1);  // true (different types)
```

### Example 5: Tricky `==` Comparisons
```javascript
console.log(false == "");         // true
console.log(false == []);         // true
console.log(false == {});         // false
console.log("" == 0);             // true
console.log("" == []);            // true
console.log(0 == []);             // true
console.log("" == null);          // false
console.log(0 == null);           // false
console.log(null == undefined);   // true

// NaN is never equal to anything
console.log(NaN == NaN);          // false
console.log(NaN === NaN);         // false
```

### `==` vs `===` Quick Reference:

| Comparison | `==` (Loose) | `===` (Strict) |
|-----------|------|------|
| `5` vs `"5"` | true | false |
| `0` vs `""` | true | false |
| `0` vs `false` | true | false |
| `1` vs `true` | true | false |
| `null` vs `undefined` | true | false |
| `NaN` vs `NaN` | false | false |

---

## Logical Operators

Logical operators perform logical operations and are used in decision-making.

| Operator | Name | Description |
|----------|------|-------------|
| `&&` | Logical AND | Returns `true` if **both** operands are true |
| `\|\|` | Logical OR | Returns `true` if **at least one** operand is true |
| `!` | Logical NOT | Inverts the boolean value |

### Truth Table:

| A | B | `A && B` | `A \|\| B` | `!A` |
|---|---|---------|----------|------|
| true | true | true | true | false |
| true | false | false | true | false |
| false | true | false | true | true |
| false | false | false | false | true |

### Example 1: Logical AND (`&&`)
```javascript
console.log(true && true);    // true
console.log(true && false);   // false
console.log(false && true);   // false
console.log(false && false);  // false

// Practical usage
let age = 25;
let hasLicense = true;

if (age >= 18 && hasLicense) {
    console.log("Can drive");  // Executes
}
```

### Example 2: Logical OR (`||`)
```javascript
console.log(true || true);    // true
console.log(true || false);   // true
console.log(false || true);   // true
console.log(false || false);  // false

// Practical usage
let isAdmin = false;
let isModerator = true;

if (isAdmin || isModerator) {
    console.log("Has access");  // Executes
}
```

### Example 3: Logical NOT (`!`)
```javascript
console.log(!true);    // false
console.log(!false);   // true
console.log(!0);       // true
console.log(!"");      // true
console.log(!null);    // true
console.log(!"hello"); // false
```

### Example 4: Short-Circuit Evaluation
```javascript
// AND (&&) — stops at first falsy value
console.log("Hello" && "World");  // "World" (both truthy, returns last)
console.log(0 && "World");        // 0 (first is falsy, returns it)
console.log("" && "World");       // "" (first is falsy, returns it)
console.log("Hello" && 0);        // 0 (second is falsy)

// OR (||) — stops at first truthy value
console.log("Hello" || "World");  // "Hello" (first is truthy, returns it)
console.log(0 || "World");        // "World" (first is falsy, returns second)
console.log("" || "Default");     // "Default"
console.log(null || "Fallback");  // "Fallback"
```

### Example 5: Default Values with `||`
```javascript
function greet(name) {
    name = name || "Guest";
    console.log(`Hello, ${name}!`);
}

greet("Alice");  // "Hello, Alice!"
greet();         // "Hello, Guest!"
greet("");       // "Hello, Guest!" (empty string is falsy!)
```

### Example 6: Conditional Execution with `&&`
```javascript
let isLoggedIn = true;

// Instead of: if (isLoggedIn) { showDashboard(); }
isLoggedIn && showDashboard();

function showDashboard() {
    console.log("Dashboard shown");
}
```

---

## Concatenation Operator

The `+` operator, when used with strings, **concatenates** (joins) them together.

### Example 1: Basic Concatenation
```javascript
let firstName = "John";
let lastName = "Doe";
let fullName = firstName + " " + lastName;

console.log(fullName);  // "John Doe"
```

### Example 2: Number + String = String
```javascript
console.log("5" + 3);       // "53"
console.log(5 + "3");       // "53"
console.log("Hello" + 5);   // "Hello5"
console.log(1 + 2 + "3");   // "33" (1+2=3, then "3"+"3")
console.log("1" + 2 + 3);   // "123" (all become strings)
```

### Example 3: Template Literals (Modern Alternative)
```javascript
let name = "Alice";
let age = 25;

// Old way (concatenation)
let msg1 = "My name is " + name + " and I am " + age + " years old.";

// New way (template literals) — Recommended
let msg2 = `My name is ${name} and I am ${age} years old.`;

console.log(msg1);  // "My name is Alice and I am 25 years old."
console.log(msg2);  // "My name is Alice and I am 25 years old."
```

### Example 4: Multiline Strings
```javascript
// Old way
let html1 = "<div>\n" +
             "  <h1>Title</h1>\n" +
             "</div>";

// New way (template literals)
let html2 = `<div>
  <h1>Title</h1>
</div>`;

console.log(html1);
console.log(html2);
```

### Example 5: concat() Method
```javascript
let str1 = "Hello";
let str2 = "World";

console.log(str1.concat(" ", str2));  // "Hello World"
console.log(str1.concat(" ", str2, "!"));  // "Hello World!"
```

---

## Bitwise Operators

Bitwise operators work on the binary (bit-level) representation of numbers.

| Operator | Name | Description | Example |
|----------|------|-------------|---------|
| `&` | AND | Sets bit to 1 if both bits are 1 | `5 & 3` = `1` |
| `\|` | OR | Sets bit to 1 if at least one bit is 1 | `5 \| 3` = `7` |
| `^` | XOR | Sets bit to 1 if only one bit is 1 | `5 ^ 3` = `6` |
| `~` | NOT | Inverts all bits | `~5` = `-6` |
| `<<` | Left shift | Shifts bits left, fills with 0 | `5 << 1` = `10` |
| `>>` | Right shift | Shifts bits right (sign-preserving) | `5 >> 1` = `2` |
| `>>>` | Unsigned right shift | Shifts bits right, fills with 0 | `5 >>> 1` = `2` |

### Example 1: Bitwise AND (`&`)
```javascript
// Binary: 5 = 101, 3 = 011
console.log(5 & 3);  // 1 (binary: 001)

//   101
// & 011
// -----
//   001 → 1
```

### Example 2: Bitwise OR (`|`)
```javascript
// Binary: 5 = 101, 3 = 011
console.log(5 | 3);  // 7 (binary: 111)

//   101
// | 011
// -----
//   111 → 7
```

### Example 3: Bitwise XOR (`^`)
```javascript
// Binary: 5 = 101, 3 = 011
console.log(5 ^ 3);  // 6 (binary: 110)

//   101
// ^ 011
// -----
//   110 → 6
```

### Example 4: Bitwise NOT (`~`)
```javascript
console.log(~5);   // -6 (inverts all bits)
console.log(~-1);  // 0
console.log(~0);   // -1
```

### Example 5: Left Shift (`<<`) and Right Shift (`>>`)
```javascript
console.log(5 << 1);   // 10 (101 → 1010)
console.log(5 << 2);   // 20 (101 → 10100)
console.log(20 >> 1);  // 10 (10100 → 1010)
console.log(20 >> 2);  // 5  (10100 → 101)
```

### Example 6: Practical Uses
```javascript
// Check if a number is even or odd using &
console.log(4 & 1);  // 0 (even)
console.log(7 & 1);  // 1 (odd)

function isEven(n) {
    return (n & 1) === 0;
}

console.log(isEven(4));  // true
console.log(isEven(7));  // false

// Swap two numbers without temp variable
let a = 5, b = 10;
a = a ^ b;
b = a ^ b;
a = a ^ b;
console.log(a, b);  // 10, 5

// Double a number using left shift
console.log(5 << 1);   // 10 (5 × 2)
console.log(5 << 2);   // 20 (5 × 4)

// Halve a number using right shift
console.log(10 >> 1);  // 5 (10 ÷ 2)
console.log(20 >> 1);  // 10 (20 ÷ 2)
```

---

## Ternary (Conditional) Operator

The ternary operator is the only JavaScript operator that takes **three operands**. It's a shorthand for `if...else`.

### Syntax:
```javascript
condition ? valueIfTrue : valueIfFalse;
```

### Example 1: Basic Ternary
```javascript
let age = 20;
let status = age >= 18 ? "Adult" : "Minor";
console.log(status);  // "Adult"
```

### Example 2: Replacing if...else
```javascript
let score = 85;

// Using if...else
let grade;
if (score >= 90) {
    grade = "A";
} else {
    grade = "B";
}

// Using ternary (same result)
let grade2 = score >= 90 ? "A" : "B";
console.log(grade2);  // "B"
```

### Example 3: Nested Ternary
```javascript
let score = 75;

let grade = score >= 90 ? "A" :
            score >= 80 ? "B" :
            score >= 70 ? "C" :
            score >= 60 ? "D" : "F";

console.log(grade);  // "C"
```

### Example 4: Ternary in Template Literals
```javascript
let isLoggedIn = true;
let message = `User is ${isLoggedIn ? "online" : "offline"}`;
console.log(message);  // "User is online"
```

### Example 5: Ternary for Default Values
```javascript
function greet(name) {
    let displayName = name ? name : "Guest";
    console.log(`Hello, ${displayName}!`);
}

greet("Alice");  // "Hello, Alice!"
greet();         // "Hello, Guest!"
```

### Example 6: Ternary with Function Calls
```javascript
let isAdmin = true;

isAdmin ? showAdminPanel() : showUserPanel();

function showAdminPanel() {
    console.log("Admin Panel");  // Executes
}

function showUserPanel() {
    console.log("User Panel");
}
```

---

## Type Operators

Type operators check or determine the type of a value.

| Operator | Description | Example |
|----------|-------------|---------|
| `typeof` | Returns a string indicating the type | `typeof 42` → `"number"` |
| `instanceof` | Checks if object is an instance of a class | `[] instanceof Array` → `true` |

### Example 1: typeof Operator
```javascript
console.log(typeof 42);            // "number"
console.log(typeof "hello");       // "string"
console.log(typeof true);          // "boolean"
console.log(typeof undefined);     // "undefined"
console.log(typeof null);          // "object" (known bug)
console.log(typeof {});            // "object"
console.log(typeof []);            // "object"
console.log(typeof function(){}); // "function"
console.log(typeof Symbol("id")); // "symbol"
console.log(typeof 123n);          // "bigint"
```

### Example 2: instanceof Operator
```javascript
let arr = [1, 2, 3];
let obj = { name: "John" };
let date = new Date();

console.log(arr instanceof Array);    // true
console.log(arr instanceof Object);   // true
console.log(obj instanceof Object);   // true
console.log(date instanceof Date);    // true
console.log("hello" instanceof String); // false (primitive, not object)
```

### Example 3: Practical Type Checking
```javascript
function checkType(value) {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value;
}

console.log(checkType(42));         // "number"
console.log(checkType("hello"));    // "string"
console.log(checkType(null));       // "null"
console.log(checkType([1, 2, 3])); // "array"
console.log(checkType({ a: 1 }));  // "object"
```

---

## Spread and Rest Operators

The `...` (three dots) operator serves two purposes depending on context.

### Spread Operator (Expands elements)

#### Example 1: Spread in Arrays
```javascript
let arr1 = [1, 2, 3];
let arr2 = [4, 5, 6];
let combined = [...arr1, ...arr2];

console.log(combined);  // [1, 2, 3, 4, 5, 6]
```

#### Example 2: Spread in Objects
```javascript
let defaults = { theme: "dark", lang: "en" };
let userSettings = { lang: "fr", fontSize: 14 };
let merged = { ...defaults, ...userSettings };

console.log(merged);  // { theme: "dark", lang: "fr", fontSize: 14 }
```

#### Example 3: Copy Arrays and Objects
```javascript
// Array copy
let original = [1, 2, 3];
let copy = [...original];
copy.push(4);

console.log(original);  // [1, 2, 3] (unchanged)
console.log(copy);       // [1, 2, 3, 4]

// Object copy
let person = { name: "John", age: 30 };
let clone = { ...person };
clone.name = "Alice";

console.log(person.name);  // "John" (unchanged)
console.log(clone.name);   // "Alice"
```

#### Example 4: Spread in Function Calls
```javascript
let numbers = [5, 2, 8, 1, 9];
console.log(Math.max(...numbers));  // 9
console.log(Math.min(...numbers));  // 1
```

### Rest Operator (Collects elements)

#### Example 5: Rest in Function Parameters
```javascript
function sum(...numbers) {
    return numbers.reduce((total, n) => total + n, 0);
}

console.log(sum(1, 2, 3));       // 6
console.log(sum(1, 2, 3, 4, 5)); // 15
```

#### Example 6: Rest in Destructuring
```javascript
let [first, second, ...rest] = [1, 2, 3, 4, 5];

console.log(first);   // 1
console.log(second);  // 2
console.log(rest);    // [3, 4, 5]

let { name, ...others } = { name: "John", age: 30, city: "NYC" };
console.log(name);    // "John"
console.log(others);  // { age: 30, city: "NYC" }
```

---

## Optional Chaining Operator (?.)

The **optional chaining** operator (`?.`) safely accesses nested object properties. Returns `undefined` instead of throwing an error if the reference is `null` or `undefined`.

### Example 1: Object Property Access
```javascript
let user = {
    name: "John",
    address: {
        city: "New York"
    }
};

console.log(user.address?.city);     // "New York"
console.log(user.phone?.number);     // undefined (no error)
// console.log(user.phone.number);   // TypeError without ?.
```

### Example 2: Method Calls
```javascript
let user = {
    name: "John",
    greet() {
        return "Hello!";
    }
};

console.log(user.greet?.());       // "Hello!"
console.log(user.goodbye?.());     // undefined (no error)
```

### Example 3: Array Element Access
```javascript
let users = [{ name: "Alice" }, { name: "Bob" }];

console.log(users[0]?.name);  // "Alice"
console.log(users[5]?.name);  // undefined
```

### Example 4: Chained Optional Access
```javascript
let company = {
    name: "TechCo",
    departments: {
        engineering: {
            lead: { name: "Alice" }
        }
    }
};

console.log(company.departments?.engineering?.lead?.name);  // "Alice"
console.log(company.departments?.marketing?.lead?.name);    // undefined
```

---

## Nullish Coalescing Operator (??)

The `??` operator returns the **right-hand operand** when the left-hand operand is `null` or `undefined`. Unlike `||`, it does **not** treat `0`, `""`, or `false` as fallback triggers.

### Example 1: Basic Nullish Coalescing
```javascript
let name = null;
console.log(name ?? "Guest");       // "Guest"

let count = undefined;
console.log(count ?? 0);            // 0
```

### Example 2: `??` vs `||`
```javascript
let count = 0;

console.log(count || 10);   // 10 (0 is falsy, so falls back)
console.log(count ?? 10);   // 0 (0 is not null/undefined, keeps it)

let text = "";
console.log(text || "default");  // "default" (empty string is falsy)
console.log(text ?? "default");  // "" (empty string is not null/undefined)

let flag = false;
console.log(flag || true);    // true (false is falsy)
console.log(flag ?? true);    // false (false is not null/undefined)
```

### Example 3: With Optional Chaining
```javascript
let user = {
    settings: {
        theme: null
    }
};

let theme = user.settings?.theme ?? "dark";
console.log(theme);  // "dark" (theme is null)

let fontSize = user.settings?.fontSize ?? 14;
console.log(fontSize);  // 14 (fontSize is undefined)
```

---

## Comma Operator

The **comma** operator evaluates each operand from left to right and returns the value of the **last** operand.

### Example 1: Basic Comma Operator
```javascript
let x = (1, 2, 3);
console.log(x);  // 3 (returns last value)
```

### Example 2: In for Loop
```javascript
for (let i = 0, j = 10; i < 5; i++, j--) {
    console.log(`i=${i}, j=${j}`);
}
// i=0, j=10
// i=1, j=9
// i=2, j=8
// i=3, j=7
// i=4, j=6
```

---

## Operator Precedence

Operator precedence determines the **order** in which operators are evaluated. Higher precedence is evaluated first.

### Precedence Table (High to Low):

| Precedence | Operator | Description |
|------------|----------|-------------|
| 1 (Highest) | `()` | Grouping |
| 2 | `.`, `?.`, `[]` | Member access |
| 3 | `new` (with args) | Constructor |
| 4 | `()` | Function call |
| 5 | `++`, `--` | Postfix inc/dec |
| 6 | `!`, `~`, `+`, `-`, `++`, `--`, `typeof`, `void`, `delete` | Unary |
| 7 | `**` | Exponentiation |
| 8 | `*`, `/`, `%` | Multiplication, division |
| 9 | `+`, `-` | Addition, subtraction |
| 10 | `<<`, `>>`, `>>>` | Bitwise shift |
| 11 | `<`, `<=`, `>`, `>=`, `instanceof`, `in` | Relational |
| 12 | `==`, `!=`, `===`, `!==` | Equality |
| 13 | `&` | Bitwise AND |
| 14 | `^` | Bitwise XOR |
| 15 | `\|` | Bitwise OR |
| 16 | `&&` | Logical AND |
| 17 | `\|\|` | Logical OR |
| 18 | `??` | Nullish coalescing |
| 19 | `? :` | Ternary |
| 20 | `=`, `+=`, `-=`, etc. | Assignment |
| 21 (Lowest) | `,` | Comma |

### Example 1: Precedence in Action
```javascript
// * has higher precedence than +
console.log(2 + 3 * 4);    // 14 (not 20)
console.log((2 + 3) * 4);  // 20 (parentheses override)
```

### Example 2: Left-to-Right Evaluation
```javascript
console.log(10 - 5 - 2);   // 3 (left-to-right: (10-5)-2)
console.log(10 - (5 - 2));  // 7 (parentheses change order)
```

### Example 3: Mixed Operators
```javascript
let result = 2 + 3 * 4 ** 2;
// Step 1: 4 ** 2 = 16 (exponentiation first)
// Step 2: 3 * 16 = 48 (multiplication next)
// Step 3: 2 + 48 = 50 (addition last)
console.log(result);  // 50
```

### Example 4: Logical Operator Precedence
```javascript
// && has higher precedence than ||
console.log(true || false && false);   // true (false && false = false, then true || false = true)
console.log((true || false) && false); // false (parentheses change order)
```

---

## Best Practices

### ✅ Do:

1. **Use `===` and `!==` (Strict Equality)**
   ```javascript
   // Good
   if (value === 5) { }
   if (type !== "string") { }
   
   // Avoid
   if (value == 5) { }  // Unpredictable coercion
   ```

2. **Use Parentheses for Clarity**
   ```javascript
   // Good — clear precedence
   let result = (a + b) * (c - d);
   
   // Confusing — relies on knowledge of precedence
   let result2 = a + b * c - d;
   ```

3. **Use Template Literals Instead of Concatenation**
   ```javascript
   // Good
   let msg = `Hello, ${name}! You have ${count} messages.`;
   
   // Avoid
   let msg2 = "Hello, " + name + "! You have " + count + " messages.";
   ```

4. **Use `??` for Default Values**
   ```javascript
   // Good — only null/undefined trigger default
   let count = userCount ?? 0;
   
   // Risky — 0 and "" also trigger default
   let count2 = userCount || 0;
   ```

5. **Use `?.` for Safe Property Access**
   ```javascript
   // Good — safe access
   let city = user?.address?.city;
   
   // Risky — can throw TypeError
   // let city = user.address.city;
   ```

6. **Keep Ternary Operators Simple**
   ```javascript
   // Good — simple condition
   let status = isActive ? "Active" : "Inactive";
   
   // Avoid — complex nested ternary (use if...else instead)
   // let x = a ? b ? c : d : e ? f : g;
   ```

7. **Use Meaningful Comparison Order**
   ```javascript
   // Good — natural reading order
   if (age >= 18) { }
   if (count === 0) { }
   
   // Avoid — "Yoda conditions" (unless intentional)
   if (18 <= age) { }
   if (0 === count) { }
   ```

---

## Common Mistakes to Avoid

### ❌ Don't:

1. **Don't Confuse `=` and `==` and `===`**
   ```javascript
   let x = 5;
   
   // BAD — assignment, not comparison!
   if (x = 10) {  // Always true (assigns 10, which is truthy)
       console.log(x);  // 10
   }
   
   // GOOD — comparison
   if (x === 10) {
       console.log(x);
   }
   ```

2. **Don't Use `+` for Number Addition with Strings**
   ```javascript
   // BAD
   let total = "10" + 5;  // "105" (string concatenation!)
   
   // GOOD
   let total2 = Number("10") + 5;  // 15
   ```

3. **Don't Forget Side Effects of `++` and `--`**
   ```javascript
   // Confusing
   let x = 5;
   let y = x++ + ++x;
   // x++ returns 5 (then x becomes 6)
   // ++x makes x 7 (then returns 7)
   // y = 5 + 7 = 12
   console.log(y);  // 12
   console.log(x);  // 7
   
   // GOOD — keep it simple
   let a = 5;
   a++;
   let b = a + 1;
   ```

4. **Don't Deeply Nest Ternary Operators**
   ```javascript
   // BAD — hard to read
   let result = a > b ? a > c ? a : c : b > c ? b : c;
   
   // GOOD — use if...else for complex logic
   let result2;
   if (a > b && a > c) {
       result2 = a;
   } else if (b > c) {
       result2 = b;
   } else {
       result2 = c;
   }
   ```

5. **Don't Rely on Implicit Type Coercion**
   ```javascript
   // BAD — confusing behavior
   console.log([] + []);     // ""
   console.log([] + {});     // "[object Object]"
   console.log({} + []);     // "[object Object]" or 0
   console.log(true + true); // 2
   
   // GOOD — be explicit
   console.log(String([]) + String([]));  // ""
   ```

6. **Don't Use Bitwise Operators for Math Unintentionally**
   ```javascript
   // BAD — confusing, use Math.floor()
   let floored = ~~3.7;  // 3
   
   // GOOD — readable
   let floored2 = Math.floor(3.7);  // 3
   ```

---

## Practical Examples

### Example 1: Simple Calculator
```javascript
function calculate(a, b, operator) {
    switch (operator) {
        case "+": return a + b;
        case "-": return a - b;
        case "*": return a * b;
        case "/":
            if (b === 0) return "Cannot divide by zero";
            return a / b;
        case "%": return a % b;
        case "**": return a ** b;
        default: return "Invalid operator";
    }
}

console.log(calculate(10, 5, "+"));   // 15
console.log(calculate(10, 5, "-"));   // 5
console.log(calculate(10, 5, "*"));   // 50
console.log(calculate(10, 5, "/"));   // 2
console.log(calculate(10, 3, "%"));   // 1
console.log(calculate(2, 10, "**"));  // 1024
console.log(calculate(10, 0, "/"));   // "Cannot divide by zero"
```

### Example 2: Grade Calculator with Ternary
```javascript
function getGrade(score) {
    return score >= 90 ? "A" :
           score >= 80 ? "B" :
           score >= 70 ? "C" :
           score >= 60 ? "D" : "F";
}

console.log(getGrade(95));  // "A"
console.log(getGrade(82));  // "B"
console.log(getGrade(71));  // "C"
console.log(getGrade(55));  // "F"
```

### Example 3: Even/Odd Checker
```javascript
function checkEvenOdd(num) {
    return num % 2 === 0 ? "Even" : "Odd";
}

console.log(checkEvenOdd(4));   // "Even"
console.log(checkEvenOdd(7));   // "Odd"
console.log(checkEvenOdd(0));   // "Even"
console.log(checkEvenOdd(-3));  // "Odd"
```

### Example 4: Safe Object Access
```javascript
function getUserCity(user) {
    return user?.address?.city ?? "Unknown City";
}

let user1 = { name: "John", address: { city: "New York" } };
let user2 = { name: "Alice" };
let user3 = null;

console.log(getUserCity(user1));  // "New York"
console.log(getUserCity(user2));  // "Unknown City"
console.log(getUserCity(user3));  // "Unknown City"
```

### Example 5: Merge Objects with Spread
```javascript
function mergeConfig(defaults, userConfig) {
    return { ...defaults, ...userConfig };
}

let defaults = {
    theme: "light",
    fontSize: 14,
    language: "en",
    notifications: true
};

let userConfig = {
    theme: "dark",
    fontSize: 16
};

let config = mergeConfig(defaults, userConfig);
console.log(config);
// { theme: "dark", fontSize: 16, language: "en", notifications: true }
```

### Example 6: Permission Check with Logical Operators
```javascript
function checkAccess(user) {
    let hasRole = user?.role === "admin" || user?.role === "editor";
    let isActive = user?.active === true;
    let notBanned = user?.banned !== true;
    
    if (hasRole && isActive && notBanned) {
        return "Access Granted";
    } else {
        return "Access Denied";
    }
}

console.log(checkAccess({ role: "admin", active: true }));
// "Access Granted"

console.log(checkAccess({ role: "user", active: true }));
// "Access Denied"

console.log(checkAccess({ role: "admin", active: true, banned: true }));
// "Access Denied"
```

### Example 7: Fibonacci with Assignment Operators
```javascript
function fibonacci(n) {
    let a = 0, b = 1;
    
    for (let i = 0; i < n; i++) {
        console.log(a);
        let temp = a;
        a = b;
        b = temp + b;
        // Or using destructuring:
        // [a, b] = [b, a + b];
    }
}

fibonacci(8);  // 0, 1, 1, 2, 3, 5, 8, 13
```

---

## Quick Reference

### All Operators at a Glance:

```javascript
// Arithmetic
5 + 3       // 8 (addition)
5 - 3       // 2 (subtraction)
5 * 3       // 15 (multiplication)
5 / 3       // 1.666... (division)
5 % 3       // 2 (remainder)
5 ** 3      // 125 (exponentiation)

// Assignment
x = 10      // assign
x += 5      // x = x + 5
x -= 5      // x = x - 5
x *= 5      // x = x * 5
x /= 5      // x = x / 5
x %= 5      // x = x % 5
x **= 2     // x = x ** 2
x ??= 10    // x = x ?? 10

// Increment / Decrement
x++          // post-increment
++x          // pre-increment
x--          // post-decrement
--x          // pre-decrement

// Comparison
5 == "5"     // true (loose)
5 === "5"    // false (strict)
5 != "5"     // false (loose)
5 !== "5"    // true (strict)
5 > 3        // true
5 < 3        // false
5 >= 5       // true
5 <= 5       // true

// Logical
true && false  // false
true || false  // true
!true          // false

// Ternary
condition ? "yes" : "no"

// Type
typeof 42           // "number"
[] instanceof Array // true

// Spread / Rest
[...arr]       // spread
function(...args) {} // rest

// Optional Chaining
obj?.prop      // safe access
obj?.method?.()  // safe method call

// Nullish Coalescing
value ?? "default"  // default if null/undefined
```

---

**Remember**: Use operators intentionally! Prefer `===` over `==`, `??` over `||` for defaults, `?.` for safe access, and always use parentheses when precedence is ambiguous.
