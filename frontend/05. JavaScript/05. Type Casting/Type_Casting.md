# JavaScript Type Casting

**Type Casting** (or Type Conversion) refers to converting a value from one data type to another. JavaScript provides both **implicit** (automatic) and **explicit** (manual) methods for type conversion.

---

## 📑 Table of Contents

1. [What is Type Casting?](#what-is-type-casting)
2. [Types of Casting](#types-of-casting)
3. [Implicit Type Casting (Type Coercion)](#implicit-type-casting-type-coercion)
   - [String Coercion](#string-coercion)
   - [Number Coercion](#number-coercion)
   - [Boolean Coercion](#boolean-coercion)
4. [Explicit Type Casting (Type Conversion)](#explicit-type-casting-type-conversion)
   - [Converting to Number](#converting-to-number)
   - [Converting to String](#converting-to-string)
   - [Converting to Boolean](#converting-to-boolean)
5. [Array and Object Conversions](#array-and-object-conversions)
6. [Special Conversion Cases](#special-conversion-cases)
7. [Truthy and Falsy Values](#truthy-and-falsy-values)
8. [Checking Type After Casting](#checking-type-after-casting)
9. [Type Casting with Operators](#type-casting-with-operators)
10. [Best Practices](#best-practices)
11. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
12. [Practical Examples](#practical-examples)
13. [Comparison Table](#comparison-table)

---

## What is Type Casting?

**Type casting** is the process of converting a value from one data type to another. Since JavaScript is a **dynamically typed** language, variables can hold any type and values can be converted between types easily.

### Key Points:
- JavaScript has **two main types** of casting: Implicit and Explicit
- **Implicit casting** happens automatically during operations
- **Explicit casting** is done intentionally by the programmer
- Type casting does **not change** the original variable (creates a new value)

### Simple Example:
```javascript
let num = 42;
let str = String(num);  // Explicit casting: number → string

console.log(num);          // 42
console.log(typeof num);   // "number" (original unchanged)
console.log(str);          // "42"
console.log(typeof str);   // "string"
```

---

## Types of Casting

JavaScript has **two types** of casting:

| Type | Also Known As | How It Works | Who Does It |
|------|---------------|--------------|-------------|
| **Implicit** | Type Coercion | Automatic | JavaScript Engine |
| **Explicit** | Type Conversion | Manual | Programmer |

---

## Implicit Type Casting (Type Coercion)

**Implicit casting** (Type Coercion) happens automatically when JavaScript expects a specific type in an operation.

---

### String Coercion

When the `+` operator is used with a string, JavaScript converts the other operand to a string.

#### Example 1: String + Number
```javascript
let result = "5" + 3;
console.log(result);        // "53"
console.log(typeof result); // "string"
```

#### Example 2: String + Boolean
```javascript
let result1 = "Hello" + true;
console.log(result1);  // "Hellotrue"

let result2 = "Value: " + false;
console.log(result2);  // "Value: false"
```

#### Example 3: String + null / undefined
```javascript
console.log("text" + null);       // "textnull"
console.log("text" + undefined);  // "textundefined"
```

#### Example 4: String + Object / Array
```javascript
console.log("obj: " + {});        // "obj: [object Object]"
console.log("arr: " + [1, 2, 3]); // "arr: 1,2,3"
console.log("arr: " + []);        // "arr: "
```

---

### Number Coercion

When using arithmetic operators (`-`, `*`, `/`, `%`), JavaScript converts operands to numbers.

#### Example 1: String - Number
```javascript
let result = "5" - 3;
console.log(result);        // 2
console.log(typeof result); // "number"
```

#### Example 2: String * String
```javascript
console.log("10" * "2");  // 20
console.log("20" / "4");  // 5
console.log("10" % "3");  // 1
```

#### Example 3: Boolean to Number
```javascript
console.log(true + 1);    // 2 (true → 1)
console.log(false + 1);   // 1 (false → 0)
console.log(true + true); // 2 (1 + 1)
console.log(true * 10);   // 10
```

#### Example 4: null and undefined in Arithmetic
```javascript
console.log(null + 5);       // 5 (null → 0)
console.log(undefined + 5);  // NaN (undefined → NaN)
console.log(null * 10);      // 0
```

#### Example 5: Unary Plus
```javascript
console.log(+"5");        // 5
console.log(+true);       // 1
console.log(+false);      // 0
console.log(+null);       // 0
console.log(+undefined);  // NaN
console.log(+"hello");    // NaN
console.log(+"");         // 0
```

---

### Boolean Coercion

JavaScript converts values to boolean in logical contexts (if statements, logical operators, etc.).

#### Example 1: In if Statements
```javascript
if ("hello") {
    console.log("Truthy!");  // Executes
}

if (0) {
    console.log("Falsy!");  // Does NOT execute
}
```

#### Example 2: Logical OR (||)
```javascript
let name = "" || "Default";
console.log(name);  // "Default" (empty string is falsy)

let count = 0 || 10;
console.log(count);  // 10 (0 is falsy)
```

#### Example 3: Logical AND (&&)
```javascript
let result = "Hello" && "World";
console.log(result);  // "World" (first is truthy, returns second)

let result2 = "" && "World";
console.log(result2);  // "" (first is falsy, returns first)
```

#### Example 4: Double NOT (!!) for Boolean Coercion
```javascript
console.log(!!"hello");     // true
console.log(!!"");          // false
console.log(!!42);          // true
console.log(!!0);           // false
console.log(!!null);        // false
console.log(!!undefined);   // false
```

---

## Explicit Type Casting (Type Conversion)

**Explicit casting** is when the programmer intentionally converts a value from one type to another using built-in functions or methods.

---

### Converting to Number

#### Method 1: `Number()` Function
Converts a value to a number. Returns `NaN` if conversion fails.

```javascript
console.log(Number("123"));       // 123
console.log(Number("123.45"));    // 123.45
console.log(Number(""));          // 0
console.log(Number(" "));         // 0
console.log(Number("abc"));       // NaN
console.log(Number("12abc"));     // NaN
console.log(Number(true));        // 1
console.log(Number(false));       // 0
console.log(Number(null));        // 0
console.log(Number(undefined));   // NaN
console.log(Number([]));          // 0
console.log(Number([5]));         // 5
console.log(Number([1, 2]));      // NaN
```

#### Method 2: `parseInt()` — Integer Parsing
Parses a string from left to right and extracts an integer. Stops at the first non-numeric character.

```javascript
console.log(parseInt("123"));      // 123
console.log(parseInt("123.99"));   // 123 (ignores decimals)
console.log(parseInt("42px"));     // 42 (stops at 'p')
console.log(parseInt("px42"));     // NaN (starts with non-digit)
console.log(parseInt("0xFF"));     // 255 (hexadecimal)
console.log(parseInt("10", 2));    // 2 (binary)
console.log(parseInt("10", 8));    // 8 (octal)
console.log(parseInt("10", 16));   // 16 (hexadecimal)
```

#### Method 3: `parseFloat()` — Decimal Parsing
Parses a string and extracts a floating-point number.

```javascript
console.log(parseFloat("123.45"));    // 123.45
console.log(parseFloat("123.45.67")); // 123.45 (stops at second dot)
console.log(parseFloat("42px"));      // 42
console.log(parseFloat(".5"));        // 0.5
console.log(parseFloat("3.14rad"));   // 3.14
```

#### Method 4: Unary Plus (`+`)
A shorthand way to convert to number.

```javascript
console.log(+"42");       // 42
console.log(+"3.14");     // 3.14
console.log(+"");         // 0
console.log(+"abc");      // NaN
console.log(+true);       // 1
console.log(+false);      // 0
console.log(+null);       // 0
console.log(+undefined);  // NaN
```

#### Method 5: Multiply by 1 or Subtract 0
```javascript
console.log("42" * 1);    // 42
console.log("42" - 0);    // 42
console.log("3.14" * 1);  // 3.14
```

#### Comparison: `Number()` vs `parseInt()` vs `parseFloat()`

| Input | `Number()` | `parseInt()` | `parseFloat()` |
|-------|-----------|-------------|---------------|
| `"123"` | 123 | 123 | 123 |
| `"123.45"` | 123.45 | 123 | 123.45 |
| `"42px"` | NaN | 42 | 42 |
| `""` | 0 | NaN | NaN |
| `" "` | 0 | NaN | NaN |
| `"0xFF"` | 255 | 255 | 0 |
| `true` | 1 | NaN | NaN |
| `null` | 0 | NaN | NaN |

---

### Converting to String

#### Method 1: `String()` Function
```javascript
console.log(String(123));        // "123"
console.log(String(123.45));     // "123.45"
console.log(String(true));       // "true"
console.log(String(false));      // "false"
console.log(String(null));       // "null"
console.log(String(undefined));  // "undefined"
console.log(String(NaN));        // "NaN"
console.log(String(Infinity));   // "Infinity"
```

#### Method 2: `.toString()` Method
```javascript
let num = 123;
console.log(num.toString());     // "123"

let bool = true;
console.log(bool.toString());    // "true"

let arr = [1, 2, 3];
console.log(arr.toString());     // "1,2,3"

// null.toString();     // TypeError
// undefined.toString(); // TypeError
```

#### Method 3: Template Literals (Backticks)
```javascript
let num = 42;
let str = `${num}`;
console.log(str);          // "42"
console.log(typeof str);   // "string"

let bool = true;
console.log(`${bool}`);    // "true"
```

#### Method 4: Concatenation with Empty String
```javascript
let num = 123;
let str = num + "";
console.log(str);          // "123"
console.log(typeof str);   // "string"

let bool = false;
console.log(bool + "");    // "false"
```

#### Number to String with Formatting
```javascript
let num = 255;

// Different bases
console.log(num.toString(2));    // "11111111" (binary)
console.log(num.toString(8));    // "377" (octal)
console.log(num.toString(16));   // "ff" (hexadecimal)

// Fixed decimal places
let pi = 3.14159;
console.log(pi.toFixed(2));     // "3.14"
console.log(pi.toFixed(4));     // "3.1416"

// Exponential notation
let bigNum = 123456;
console.log(bigNum.toExponential(2));  // "1.23e+5"

// Precision
let val = 123.456;
console.log(val.toPrecision(5));  // "123.46"
console.log(val.toPrecision(2));  // "1.2e+2"
```

---

### Converting to Boolean

#### Method 1: `Boolean()` Function
```javascript
// Falsy values → false
console.log(Boolean(false));      // false
console.log(Boolean(0));          // false
console.log(Boolean(-0));         // false
console.log(Boolean(0n));         // false
console.log(Boolean(""));         // false
console.log(Boolean(null));       // false
console.log(Boolean(undefined));  // false
console.log(Boolean(NaN));        // false

// Truthy values → true
console.log(Boolean(true));       // true
console.log(Boolean(1));          // true
console.log(Boolean(-1));         // true
console.log(Boolean("hello"));    // true
console.log(Boolean("0"));        // true (non-empty string!)
console.log(Boolean("false"));    // true (non-empty string!)
console.log(Boolean([]));         // true (empty array is truthy!)
console.log(Boolean({}));         // true (empty object is truthy!)
console.log(Boolean(Infinity));   // true
```

#### Method 2: Double NOT (`!!`)
```javascript
console.log(!!1);           // true
console.log(!!0);           // false
console.log(!!"hello");     // true
console.log(!!"");          // false
console.log(!!null);        // false
console.log(!!undefined);   // false
```

#### Method 3: Comparison Operators
```javascript
// Any comparison returns boolean
console.log(5 > 3);     // true
console.log(5 === 5);   // true
console.log(5 < 3);     // false
```

---

## Array and Object Conversions

### Array to String
```javascript
let arr1 = [1, 2, 3];
console.log(arr1.toString());  // "1,2,3"
console.log(arr1.join("-"));   // "1-2-3"
console.log(arr1.join(" "));   // "1 2 3"
console.log(arr1.join(""));    // "123"
console.log(String(arr1));     // "1,2,3"
```

### String to Array
```javascript
let str = "Hello World";

console.log(str.split(" "));   // ["Hello", "World"]
console.log(str.split(""));    // ["H","e","l","l","o"," ","W","o","r","l","d"]
console.log(Array.from(str));  // ["H","e","l","l","o"," ","W","o","r","l","d"]
console.log([...str]);         // ["H","e","l","l","o"," ","W","o","r","l","d"]

let csv = "apple,banana,cherry";
console.log(csv.split(","));  // ["apple", "banana", "cherry"]
```

### Object to String
```javascript
let obj = { name: "John", age: 30 };

console.log(String(obj));                // "[object Object]"
console.log(JSON.stringify(obj));        // '{"name":"John","age":30}'
console.log(JSON.stringify(obj, null, 2)); // Pretty-printed JSON
```

### String to Object (JSON Parsing)
```javascript
let jsonStr = '{"name": "John", "age": 30}';
let obj = JSON.parse(jsonStr);

console.log(obj.name);  // "John"
console.log(obj.age);   // 30
console.log(typeof obj); // "object"
```

### Array to Number
```javascript
console.log(Number([]));         // 0
console.log(Number([5]));        // 5
console.log(Number([1, 2]));     // NaN
console.log(Number(["3"]));      // 3
```

### Array/Object to Boolean
```javascript
// Both empty arrays and objects are truthy!
console.log(Boolean([]));    // true
console.log(Boolean({}));    // true
console.log(Boolean([0]));   // true
console.log(Boolean([null])); // true
```

---

## Special Conversion Cases

### Edge Cases with `Number()`
```javascript
console.log(Number(""));          // 0
console.log(Number(" "));         // 0
console.log(Number("\n"));        // 0
console.log(Number("\t"));        // 0
console.log(Number("  42  "));    // 42 (trims whitespace)
console.log(Number(null));        // 0
console.log(Number(undefined));   // NaN
console.log(Number(true));        // 1
console.log(Number(false));       // 0
console.log(Number(Infinity));    // Infinity
console.log(Number(-Infinity));   // -Infinity
```

### NaN (Not a Number)
```javascript
// NaN is the result of invalid number conversions
console.log(Number("abc"));          // NaN
console.log(Number(undefined));      // NaN
console.log(0 / 0);                  // NaN
console.log(Math.sqrt(-1));          // NaN

// NaN is NOT equal to anything, including itself
console.log(NaN === NaN);            // false
console.log(NaN == NaN);             // false

// Checking for NaN
console.log(isNaN(NaN));             // true
console.log(isNaN("hello"));         // true (coerces first)
console.log(Number.isNaN(NaN));      // true (strict, recommended)
console.log(Number.isNaN("hello"));  // false (no coercion)
```

### Infinity Cases
```javascript
console.log(1 / 0);                // Infinity
console.log(-1 / 0);               // -Infinity
console.log(Number("Infinity"));   // Infinity
console.log(isFinite(Infinity));   // false
console.log(isFinite(42));         // true
console.log(isFinite(NaN));        // false
```

### null vs undefined Conversions
```javascript
// To Number
console.log(Number(null));        // 0
console.log(Number(undefined));   // NaN

// To String
console.log(String(null));        // "null"
console.log(String(undefined));   // "undefined"

// To Boolean
console.log(Boolean(null));       // false
console.log(Boolean(undefined));  // false

// Equality
console.log(null == undefined);   // true
console.log(null === undefined);  // false
console.log(null == 0);           // false
console.log(null == "");          // false
```

---

## Truthy and Falsy Values

### All Falsy Values (only 8):
```javascript
console.log(Boolean(false));      // false
console.log(Boolean(0));          // false
console.log(Boolean(-0));         // false
console.log(Boolean(0n));         // false (BigInt zero)
console.log(Boolean(""));         // false (empty string)
console.log(Boolean(null));       // false
console.log(Boolean(undefined));  // false
console.log(Boolean(NaN));        // false
```

### Common Truthy Surprises:
```javascript
// These are ALL truthy (may feel counterintuitive)
console.log(Boolean("0"));         // true (non-empty string)
console.log(Boolean("false"));     // true (non-empty string)
console.log(Boolean(" "));         // true (space is non-empty)
console.log(Boolean([]));          // true (empty array)
console.log(Boolean({}));          // true (empty object)
console.log(Boolean(function(){})); // true (function)
console.log(Boolean(-1));          // true (non-zero number)
console.log(Boolean(Infinity));    // true
console.log(Boolean(new Date()));  // true
```

### Truthy/Falsy Quick Reference:

| Value | Boolean | Reason |
|-------|---------|--------|
| `false` | false | Literal false |
| `0`, `-0` | false | Zero |
| `0n` | false | BigInt zero |
| `""` | false | Empty string |
| `null` | false | No value |
| `undefined` | false | Not assigned |
| `NaN` | false | Not a number |
| `"0"` | **true** | Non-empty string |
| `"false"` | **true** | Non-empty string |
| `[]` | **true** | Object (array) |
| `{}` | **true** | Object |
| `" "` | **true** | Non-empty string |

---

## Checking Type After Casting

Use the `typeof` operator to verify the type after conversion.

### Example 1: After Number Conversion
```javascript
let num = Number("123");
console.log(num);          // 123
console.log(typeof num);   // "number"

let parsed = parseInt("42px");
console.log(parsed);       // 42
console.log(typeof parsed); // "number"
```

### Example 2: After String Conversion
```javascript
let str = String(123);
console.log(str);          // "123"
console.log(typeof str);   // "string"

let strBool = String(true);
console.log(strBool);      // "true"
console.log(typeof strBool); // "string"
```

### Example 3: After Boolean Conversion
```javascript
let bool = Boolean(1);
console.log(bool);         // true
console.log(typeof bool);  // "boolean"

let bool2 = Boolean("");
console.log(bool2);        // false
console.log(typeof bool2); // "boolean"
```

### Example 4: instanceof for Objects
```javascript
let arr = [1, 2, 3];
console.log(typeof arr);           // "object"
console.log(arr instanceof Array); // true
console.log(Array.isArray(arr));   // true

let date = new Date();
console.log(typeof date);           // "object"
console.log(date instanceof Date);  // true
```

---

## Type Casting with Operators

Different operators trigger different type conversions.

### The `+` Operator (Dual Purpose)
```javascript
// If one operand is a string → concatenation (string coercion)
console.log("5" + 3);      // "53"
console.log(5 + "3");      // "53"
console.log("5" + true);   // "5true"

// If both operands are numbers → addition
console.log(5 + 3);        // 8

// Order matters
console.log(1 + 2 + "3");  // "33" (1+2=3, then 3+"3")
console.log("1" + 2 + 3);  // "123" (all concatenation after first string)
```

### Arithmetic Operators (`-`, `*`, `/`, `%`, `**`)
```javascript
// Always convert to number
console.log("10" - 5);     // 5
console.log("10" * "2");   // 20
console.log("20" / "4");   // 5
console.log("10" % "3");   // 1
console.log("2" ** "3");   // 8
```

### Comparison Operators
```javascript
// == (loose equality) - allows coercion
console.log(5 == "5");         // true
console.log(true == 1);        // true
console.log(false == 0);       // true
console.log(null == undefined); // true
console.log("" == 0);          // true

// === (strict equality) - no coercion
console.log(5 === "5");        // false
console.log(true === 1);       // false
console.log(null === undefined); // false
```

### Relational Operators (`<`, `>`, `<=`, `>=`)
```javascript
// String comparisons (lexicographic)
console.log("apple" < "banana");  // true

// String vs Number (string converted to number)
console.log("10" > 5);      // true
console.log("10" > "5");    // false (string comparison: "1" < "5")
console.log("10" > "9");    // false (string comparison: "1" < "9")
```

### Nullish Coalescing (`??`) vs OR (`||`)
```javascript
// || returns first truthy value
console.log(0 || "default");        // "default" (0 is falsy)
console.log("" || "default");       // "default" (empty is falsy)
console.log(null || "default");     // "default"

// ?? returns first non-null/undefined value
console.log(0 ?? "default");        // 0 (0 is valid)
console.log("" ?? "default");       // "" (empty string is valid)
console.log(null ?? "default");     // "default"
console.log(undefined ?? "default"); // "default"
```

---

## Best Practices

### ✅ Do:

1. **Use Explicit Conversions for Clarity**
   ```javascript
   // Good — clear intent
   let num = Number(userInput);
   let str = String(count);
   let bool = Boolean(value);
   
   // Avoid — implicit, harder to read
   let num2 = +userInput;
   let str2 = count + "";
   ```

2. **Use `===` (Strict Equality) Instead of `==`**
   ```javascript
   // Good
   if (value === 0) { }
   if (value === "") { }
   
   // Avoid
   if (value == 0) { }   // "" == 0 is true!
   ```

3. **Validate Before Converting**
   ```javascript
   let input = "42abc";
   
   // Good — check result
   let num = Number(input);
   if (!isNaN(num)) {
       console.log("Valid number:", num);
   } else {
       console.log("Invalid input");
   }
   ```

4. **Use `parseInt()` with Radix**
   ```javascript
   // Good — specify base
   parseInt("010", 10);  // 10 (decimal)
   parseInt("0xFF", 16); // 255 (hex)
   
   // Risky — no radix
   parseInt("010");  // 10 (modern) or 8 (old engines)
   ```

5. **Use `Number.isNaN()` Instead of `isNaN()`**
   ```javascript
   // Good — no type coercion
   Number.isNaN(NaN);      // true
   Number.isNaN("hello");  // false
   
   // Misleading — coerces first
   isNaN("hello");  // true (converts "hello" to NaN first)
   ```

6. **Use Template Literals for String Conversions**
   ```javascript
   let num = 42;
   let bool = true;
   
   // Good — readable
   let str = `Number: ${num}, Bool: ${bool}`;
   ```

7. **Use Nullish Coalescing for Defaults**
   ```javascript
   // Good — only null/undefined trigger default
   let count = userCount ?? 0;
   
   // Risky — 0 and "" are treated as missing
   let count2 = userCount || 0;
   ```

---

## Common Mistakes to Avoid

### ❌ Don't:

1. **Don't Forget `+` with Strings Does Concatenation**
   ```javascript
   // BAD — unexpected concatenation
   let price = "10" + 5;    // "105" (not 15)
   
   // GOOD — convert first
   let price2 = Number("10") + 5;  // 15
   ```

2. **Don't Trust `==` for Type Safety**
   ```javascript
   // BAD — unpredictable coercion
   console.log("" == false);        // true
   console.log("0" == false);       // true
   console.log(null == false);      // false (surprise!)
   console.log([] == false);        // true
   console.log([0] == false);       // true
   
   // GOOD — use ===
   console.log("" === false);       // false
   ```

3. **Don't Confuse `"0"` as Falsy**
   ```javascript
   // BAD — "0" is a truthy string!
   if ("0") {
       console.log("This executes!");  // Surprise!
   }
   
   // GOOD — convert to number first
   if (Number("0")) {
       console.log("This does NOT execute");
   }
   ```

4. **Don't Use `parseInt()` Without Radix**
   ```javascript
   // BAD — ambiguous
   parseInt("08");  // Could be 0 or 8
   
   // GOOD — always specify base
   parseInt("08", 10);  // 8
   ```

5. **Don't Forget `Number()` and `parseInt()` Behave Differently**
   ```javascript
   // Different results for same input
   console.log(Number("42px"));    // NaN
   console.log(parseInt("42px"));  // 42
   
   console.log(Number(""));        // 0
   console.log(parseInt(""));      // NaN
   ```

6. **Don't Assume Arrays/Objects Are Falsy When Empty**
   ```javascript
   // BAD — empty array is truthy!
   if ([]) {
       console.log("Empty array is truthy!");  // Executes
   }
   
   // GOOD — check length
   let arr = [];
   if (arr.length > 0) {
       console.log("Array has elements");
   }
   ```

7. **Don't Ignore NaN Results**
   ```javascript
   // BAD — NaN propagates silently
   let result = Number("abc") + 10;
   console.log(result);  // NaN (no error thrown)
   
   // GOOD — validate after conversion
   let num = Number("abc");
   if (Number.isNaN(num)) {
       console.log("Invalid conversion");
   }
   ```

---

## Practical Examples

### Example 1: Form Input Validation
```javascript
function validateAge(input) {
    let age = Number(input);
    
    if (Number.isNaN(age)) {
        return "Please enter a valid number";
    }
    if (!Number.isInteger(age)) {
        return "Age must be a whole number";
    }
    if (age < 0 || age > 150) {
        return "Age must be between 0 and 150";
    }
    
    return `Valid age: ${age}`;
}

console.log(validateAge("25"));      // "Valid age: 25"
console.log(validateAge("25.5"));    // "Age must be a whole number"
console.log(validateAge("abc"));     // "Please enter a valid number"
console.log(validateAge("-5"));      // "Age must be between 0 and 150"
```

### Example 2: Currency Formatter
```javascript
function formatCurrency(value) {
    let num = parseFloat(value);
    
    if (Number.isNaN(num)) {
        return "Invalid amount";
    }
    
    return "$" + num.toFixed(2);
}

console.log(formatCurrency("1234.5"));   // "$1234.50"
console.log(formatCurrency("99"));       // "$99.00"
console.log(formatCurrency("abc"));      // "Invalid amount"
console.log(formatCurrency("10.999"));   // "$11.00"
```

### Example 3: Safe Type Converter
```javascript
function safeCast(value, type) {
    switch (type) {
        case "number":
            let num = Number(value);
            return Number.isNaN(num) ? 0 : num;
            
        case "string":
            return value == null ? "" : String(value);
            
        case "boolean":
            if (value === "false" || value === "0") return false;
            return Boolean(value);
            
        case "integer":
            let int = parseInt(value, 10);
            return Number.isNaN(int) ? 0 : int;
            
        default:
            return value;
    }
}

console.log(safeCast("42", "number"));      // 42
console.log(safeCast("abc", "number"));     // 0
console.log(safeCast(null, "string"));      // ""
console.log(safeCast("false", "boolean"));  // false
console.log(safeCast("42.9", "integer"));   // 42
```

### Example 4: Query String Parser
```javascript
function parseQueryString(queryString) {
    let params = {};
    let pairs = queryString.replace("?", "").split("&");
    
    for (let pair of pairs) {
        let [key, value] = pair.split("=");
        
        // Auto-detect and convert types
        if (value === "true") params[key] = true;
        else if (value === "false") params[key] = false;
        else if (value === "null") params[key] = null;
        else if (!isNaN(value) && value !== "") params[key] = Number(value);
        else params[key] = decodeURIComponent(value || "");
    }
    
    return params;
}

let result = parseQueryString("?page=1&sort=name&active=true&limit=10");
console.log(result);
// { page: 1, sort: "name", active: true, limit: 10 }
```

### Example 5: Sum of Mixed Array
```javascript
function sumArray(arr) {
    return arr.reduce((sum, item) => {
        let num = Number(item);
        return sum + (Number.isNaN(num) ? 0 : num);
    }, 0);
}

console.log(sumArray([1, "2", "3", true, null, "abc"]));
// 7 (1 + 2 + 3 + 1 + 0 + 0)

console.log(sumArray(["10", "20", "30"]));
// 60
```

---

## Comparison Table

### Complete Type Conversion Reference:

| Original Value | to Number | to String | to Boolean |
|---------------|-----------|-----------|------------|
| `"123"` | 123 | "123" | true |
| `"123.45"` | 123.45 | "123.45" | true |
| `"abc"` | NaN | "abc" | true |
| `""` | 0 | "" | **false** |
| `" "` | 0 | " " | true |
| `"0"` | 0 | "0" | **true** |
| `"false"` | NaN | "false" | **true** |
| `true` | 1 | "true" | true |
| `false` | 0 | "false" | false |
| `0` | 0 | "0" | false |
| `1` | 1 | "1" | true |
| `-1` | -1 | "-1" | true |
| `null` | 0 | "null" | false |
| `undefined` | NaN | "undefined" | false |
| `NaN` | NaN | "NaN" | false |
| `Infinity` | Infinity | "Infinity" | true |
| `[]` | 0 | "" | **true** |
| `[5]` | 5 | "5" | true |
| `[1,2]` | NaN | "1,2" | true |
| `{}` | NaN | "[object Object]" | **true** |

---

## Summary

### Key Takeaways:

1. **Implicit casting** happens automatically; **explicit casting** is done by the programmer
2. The `+` operator with strings does **concatenation**, not addition
3. Arithmetic operators (`-`, `*`, `/`) convert operands to **numbers**
4. There are only **8 falsy values**: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`
5. Empty arrays `[]` and objects `{}` are **truthy** (common gotcha!)
6. `Number()` and `parseInt()` behave **differently** — know when to use which
7. Always use `===` (strict equality) to avoid unexpected coercion
8. Use `Number.isNaN()` instead of `isNaN()` for reliable NaN checking

### Quick Conversion Cheat Sheet:

```javascript
// To Number
Number("42")          // 42
parseInt("42px", 10)  // 42
parseFloat("3.14")    // 3.14
+"42"                 // 42

// To String
String(42)            // "42"
(42).toString()       // "42"
`${42}`               // "42"
42 + ""               // "42"

// To Boolean
Boolean(value)        // true or false
!!value               // true or false

// Type Checking
typeof value          // "string", "number", etc.
Array.isArray(arr)    // true/false
Number.isNaN(val)     // true/false
value instanceof Type // true/false
```

---

**Remember**: Explicit is always better than implicit! Write clear, intentional type conversions to make your code predictable and maintainable.
