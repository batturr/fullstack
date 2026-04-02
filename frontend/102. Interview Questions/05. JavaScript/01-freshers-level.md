# JavaScript Interview Questions — Freshers (0–2 Years)

100 fundamental questions with detailed answers. Use this for revision and mock interviews.

---

## 1. What is JavaScript and what is it used for?

JavaScript is a high-level, interpreted programming language that was designed primarily to run in web browsers and make web pages interactive. Unlike HTML, which structures content, and CSS, which styles it, JavaScript adds behavior: validating forms, updating the page without full reloads, handling user clicks, and communicating with servers. Today JavaScript also runs outside the browser (for example on servers with Node.js, in mobile apps, and in desktop tooling), but its original and still central role is client-side web development. Understanding JavaScript matters because it is one of the three core technologies of the web and is required for modern front-end frameworks like React, Vue, and Angular.

```javascript
// Simple example: change text when a user clicks a button (conceptual)
document.getElementById("btn").addEventListener("click", () => {
  document.getElementById("msg").textContent = "Hello from JavaScript!";
});
```

---

## 2. What are the different data types in JavaScript?

JavaScript has two broad categories of values: primitives and objects. The primitive types are `undefined`, `null`, `boolean`, `number`, `bigint`, `string`, and `symbol`. Everything that is not a primitive is an object, including plain objects, arrays, functions, dates, and more. Primitives are immutable and compared by value; objects are mutable and compared by reference. Knowing the type system helps you avoid bugs—for example, confusing `null` with `undefined`, or assuming two separate object literals are equal when they are not.

```javascript
typeof undefined; // "undefined"
typeof null; // "object" (historical quirk)
typeof true; // "boolean"
typeof 42; // "number"
typeof "hi"; // "string"
typeof Symbol("x"); // "symbol"
typeof {}; // "object"
typeof function () {}; // "function"
```

---

## 3. What is the difference between `var`, `let`, and `const`?

`var` is the older way to declare variables; it is function-scoped and can be redeclared and updated, and declarations are hoisted (initialized as `undefined`). `let` and `const` are block-scoped (limited to `{ }`), which reduces accidental bugs in loops and conditionals. `let` allows reassignment but not redeclaration in the same scope; `const` requires an initializer and prevents rebinding the variable to a new value (though object properties can still change if the value is an object). For new code, prefer `const` by default, use `let` when you need reassignment, and avoid `var` unless you are maintaining legacy code.

```javascript
const PI = 3.14;
let count = 0;
count++;
// PI = 3; // Error

const user = { name: "Asha" };
user.name = "Ravi"; // OK — object mutation, not rebinding `user`
```

---

## 4. What is hoisting in JavaScript?

Hoisting is the behavior where variable and function declarations are conceptually moved to the top of their scope during the compilation phase, before code execution runs line by line. Function declarations are fully hoisted, so you can call a declared function before its line in the source file. Variables declared with `var` are hoisted but initialized with `undefined` until the assignment runs; `let` and `const` are hoisted too but live in the temporal dead zone until their declaration line executes, so accessing them earlier throws a reference error. Understanding hoisting explains why order sometimes seems to “not matter” for functions but does for `let`/`const`, and it helps you write predictable initialization code.

```javascript
console.log(x); // undefined (var hoisted, not the assignment)
var x = 1;

sayHi(); // works — function declaration hoisted
function sayHi() {
  console.log("Hi");
}
```

---

## 5. What is the difference between `==` and `===`?

The equality operator `==` compares two values after converting them to a common type (type coercion), which can produce surprising results—for example, `0 == false` is true. The strict equality operator `===` compares both value and type without coercion, so `0 === false` is false. In interviews and in production code, `===` and `!==` are almost always preferred because they make intent clear and avoid subtle coercion bugs. Use `==` only when you deliberately want coercion and document why.

```javascript
5 == "5"; // true (string coerced to number)
5 === "5"; // false

null == undefined; // true
null === undefined; // false
```

---

## 6. What are template literals?

Template literals are string literals delimited by backticks (`` ` ``) that support embedded expressions and multi-line strings without escape sequences for newlines. You interpolate values with `${expression}`, which is cleaner than concatenation with `+`. They were introduced in ES6 and are now the standard way to build dynamic strings in modern JavaScript. They improve readability when mixing text and variables, especially for URLs, messages, and HTML snippets (with care for XSS when inserting into HTML).

```javascript
const name = "Priya";
const greeting = `Hello, ${name}!
Welcome back.`; // multi-line
const url = `https://api.example.com/users/${userId}`;
```

---

## 7. What is `typeof` operator?

The `typeof` operator returns a string indicating the type of its operand, which is useful for quick runtime checks. For primitives it usually behaves as expected, but there are quirks: `typeof null` returns `"object"` due to a long-standing language bug, and `typeof NaN` is `"number"` because `NaN` is a special numeric value. For functions it returns `"function"`. It is not a perfect type system—arrays return `"object"`—so for arrays you combine with `Array.isArray()`. Still, `typeof` is handy for guarding optional parameters or distinguishing functions from other values.

```javascript
typeof 42; // "number"
typeof "x"; // "string"
typeof NaN; // "number"
typeof []; // "object"
typeof (() => {}); // "function"
```

---

## 8. What is `NaN` and how do you check for it?

`NaN` stands for “Not a Number” and is a special value of the `number` type that represents invalid or undefined numeric results, such as `Number("abc")` or `0 / 0`. A confusing property is that `NaN !== NaN`; you cannot use `===` to detect it. The reliable checks are `Number.isNaN(value)` (preferred in modern code) or the global `isNaN()` (which coerces to number first, so it can misreport). Using `Number.isNaN` avoids coercion surprises and clearly expresses intent.

```javascript
const x = Number("hello");
Number.isNaN(x); // true
Number.isNaN("hello"); // false — not coerced

isNaN("hello"); // true — coerces string to number first
```

---

## 9. What is the difference between `null` and `undefined`?

Both represent “absence” of a meaningful value, but in different situations. `undefined` typically means a variable has been declared but not assigned, a missing object property, or a function that returns nothing explicitly. `null` is usually assigned intentionally to mean “no value” or “empty” by design, such as clearing a reference. In strict equality they differ (`null === undefined` is false), though `null == undefined` is true due to coercion. APIs sometimes use one or the other by convention, so reading documentation matters.

```javascript
let a;
console.log(a); // undefined

let user = { name: "Lee" };
console.log(user.age); // undefined — property missing

user.lastLogin = null; // intentional “no login yet”
```

---

## 10. What are JavaScript operators (arithmetic, assignment, comparison, logical)?

Operators are symbols that perform operations on values: arithmetic (`+`, `-`, `*`, `/`, `%`, `**`), assignment (`=`, `+=`, `-=`, and similar compound forms), comparison (`>`, `<`, `>=`, `<=`, `==`, `===`, `!=`, `!==`), and logical (`&&`, `||`, `!`, and also `??` for nullish coalescing). Arithmetic follows familiar math rules with quirks such as `+` also concatenating strings if one operand is a string. Logical operators use short-circuit evaluation: `&&` stops at the first falsy value, `||` at the first truthy value. Knowing operator precedence and coercion rules prevents subtle bugs in conditions and math.

```javascript
let n = 10;
n += 5; // 15
console.log(5 > 3 && 2 < 4); // true
console.log(0 || "default"); // "default"
```

---

## 11. What is type coercion in JavaScript?

Type coercion is the automatic or implicit conversion of values from one type to another when an operation expects a different type—for example, using `+` with a number and a string converts the number to string and concatenates. Equality with `==` also coerces operands. Coercion can be convenient but is a common source of interview questions and real bugs because the rules are not always intuitive. Prefer explicit conversions with `Number()`, `String()`, `Boolean()`, or `parseInt` when you need predictable behavior.

```javascript
"5" - 2; // 3 — string coerced to number for subtraction
"5" + 2; // "52" — number coerced to string for concatenation
Boolean(""); // false
Boolean("hi"); // true
```

---

## 12. What is the difference between primitive and reference types?

Primitives (`number`, `string`, `boolean`, `null`, `undefined`, `symbol`, `bigint`) store their value directly and are compared by value—two strings with the same characters are equal. Reference types (objects, arrays, functions) store a reference to a location in memory; comparing two object literals with `===` checks whether they are the same object, not whether their contents match. Assignment copies primitives by value and objects by reference, so mutating a shared object affects all variables pointing to it. This distinction is essential for understanding equality, copying, and function arguments.

```javascript
let a = 5;
let b = a;
b = 10;
console.log(a); // 5

let o1 = { x: 1 };
let o2 = o1;
o2.x = 2;
console.log(o1.x); // 2 — same object
```

---

## 13. What is strict mode in JavaScript?

Strict mode is a restricted variant of JavaScript activated with `"use strict";` at the top of a script or function; it catches common mistakes and disables some error-prone features. For example, assigning to undeclared variables throws instead of creating globals, duplicate parameter names in functions are errors, and `this` in plain functions can behave differently. Modern modules are implicitly strict. Using strict mode makes code safer and aligns with how the language is evolving. Interviewers often expect you to know that it exists and generally improves code quality.

```javascript
"use strict";
// x = 1; // ReferenceError in strict mode (no var/let/const)
```

---

## 14. How do you write comments in JavaScript?

Single-line comments start with `//` and run to the end of the line; they are ideal for brief explanations next to code. Multi-line comments use `/* ... */` and can span several lines, often used for file headers or temporarily disabling blocks of code. Comments should explain why something is done when it is not obvious, not restate what the code already says. Good commenting habits help teammates and your future self during code review and debugging.

```javascript
// Increment retry count after a failed request
retryCount++;

/*
  Legacy API returns dates as strings;
  we normalize to ISO format here.
*/
```

---

## 15. What is the difference between dynamically typed and statically typed languages?

In a statically typed language, variables have fixed types checked at compile time (for example TypeScript when compiled, or Java), and type errors are caught before you run the program. JavaScript is dynamically typed: you can assign a number to a variable and later assign a string to the same variable, and types are checked as the program runs. That flexibility speeds prototyping but can hide bugs until runtime. Many teams adopt TypeScript or JSDoc to add static checking on top of JavaScript for larger codebases.

```javascript
let value = 100;
value = "now a string"; // allowed in JavaScript
```

---

## 16. What are common string methods in JavaScript?

Strings provide many methods for inspection and transformation without mutating the original string (strings are immutable). Common methods include `length` (property), `charAt`/`at`, `slice`, `substring`, `indexOf`/`lastIndexOf`, `includes`, `startsWith`, `endsWith`, `toLowerCase`/`toUpperCase`, `trim`, `split`, `replace`, and `repeat`. Choosing the right method matters for parsing user input, formatting output, and building URLs or paths. Remember that methods return new strings rather than changing the existing one.

```javascript
const s = "  Hello World  ";
s.trim(); // "Hello World"
"abc-def".split("-"); // ["abc", "def"]
"hello".replace("l", "L"); // "heLlo" — first match only
```

---

## 17. How do you convert a string to a number and vice versa?

To convert a string to a number you can use `Number(str)`, unary `+str`, `parseInt(str, radix)`, or `parseFloat(str)` depending on whether you need integers, decimals, or strict parsing. `Number` and unary `+` fail fast on invalid characters (yielding `NaN`), while `parseInt`/`parseFloat` parse until they hit an invalid character. To convert a number to a string, use `String(n)`, `n.toString()`, or template literals. Always specify radix `10` with `parseInt` to avoid octal interpretation on older inputs.

```javascript
Number("42"); // 42
parseInt("42px", 10); // 42
String(3.14); // "3.14"
(255).toString(16); // "ff"
```

---

## 18. What is string interpolation?

String interpolation means embedding expressions inside a string so their values are computed and inserted at runtime. In JavaScript this is done with template literals using `${}` inside backticks. It replaces older patterns of concatenating with `+`, which become hard to read for long messages. Interpolation can include any expression: variables, function calls, or ternary results. Be careful when building HTML from user data—always escape or sanitize to prevent XSS.

```javascript
const price = 19.99;
const line = `Total: $${price.toFixed(2)}`;
```

---

## 19. What is the difference between `parseInt` and `parseFloat`?

`parseInt` parses a string into an integer, optionally stopping at the first non-digit character (depending on rules), and accepts a radix for bases other than ten. `parseFloat` parses a string into a floating-point number, including a decimal part. Both ignore leading whitespace and return `NaN` if no valid number is found. For currency or precise decimals, be aware that floating-point arithmetic has precision limits; sometimes integers in cents are safer than dollars as floats.

```javascript
parseInt("10.9", 10); // 10 — truncates toward zero for integer part
parseFloat("10.9"); // 10.9
parseInt("0xFF", 16); // 255
```

---

## 20. What is `Number.isFinite()` vs global `isFinite()`?

Both test whether a value is a finite number (not `Infinity`, `-Infinity`, or `NaN`), but they differ in coercion. `Number.isFinite(value)` does not coerce: it returns `true` only if the value is already a number type and finite. The global `isFinite(value)` coerces the argument to a number first, so strings like `"123"` become finite numbers. For strict checks, `Number.isFinite` is usually safer because it avoids accidental truth from string coercion.

```javascript
isFinite("123"); // true — string coerced to 123
Number.isFinite("123"); // false — not a number type

Number.isFinite(123); // true
Number.isFinite(Infinity); // false
```

---

## 21. What are escape characters in strings?

Escape characters let you insert special characters inside string literals using a backslash (`\`). Common escapes include `\n` (newline), `\t` (tab), `\'` and `\"` for quotes inside quoted strings, `\\` for a literal backslash, and `\uXXXX` for Unicode code points. Without escapes, a single-quoted string cannot easily contain a single quote. Template literals reduce the need for some escapes for newlines but you still need escapes for backticks or `${` if you want them literally.

```javascript
const path = "C:\\Users\\name\\file.txt";
const quote = "She said, \"Hello\"";
const unicode = "\u00A9"; // copyright symbol
```

---

## 22. What is the `Math` object and its commonly used methods?

`Math` is a built-in object providing mathematical constants and functions—not a constructor. Common methods include `Math.abs`, `Math.round`, `Math.floor`, `Math.ceil`, `Math.max`, `Math.min`, `Math.pow`, `Math.sqrt`, `Math.random`, and trigonometric functions like `Math.sin`. Constants include `Math.PI` and `Math.E`. `Math.random()` returns a pseudo-random number in `[0, 1)`. For cryptographically secure randomness, use `crypto.getRandomValues` in browsers or `crypto` in Node, not `Math.random`.

```javascript
Math.ceil(4.2); // 5
Math.floor(4.8); // 4
Math.max(1, 5, 3); // 5
const dice = Math.floor(Math.random() * 6) + 1; // 1–6
```

---

## 23. What are conditional statements in JavaScript?

Conditional statements run different code paths based on boolean conditions. The primary forms are `if`, `else if`, and `else`, which evaluate conditions in order and execute the first matching block. Ternary expressions and `switch` (covered separately) are additional tools. Conditions are coerced to boolean unless you use strict checks yourself. Clear conditionals improve readability and reduce nested complexity; early returns from functions often simplify `if` trees.

```javascript
function grade(score) {
  if (score >= 90) return "A";
  else if (score >= 80) return "B";
  else return "C or below";
}
```

---

## 24. What is the `switch` statement?

`switch` compares one expression against multiple `case` labels using strict equality (`===`) and runs the matching branch, often with `break` to avoid fall-through to the next case. A `default` case runs when no label matches. Forgetting `break` is a classic bug because execution continues into the next case. `switch` can be clearer than long `else if` chains when comparing one value against many discrete options. For ranges or complex logic, `if/else` or lookup objects are sometimes clearer.

```javascript
function dayType(day) {
  switch (day) {
    case "Sat":
    case "Sun":
      return "weekend";
    default:
      return "weekday";
  }
}
```

---

## 25. What are the different types of loops in JavaScript?

JavaScript provides several loops: `for` (classic index loop), `while` (condition checked before each iteration), `do...while` (runs at least once), `for...in` (iterates enumerable property keys—usually objects), and `for...of` (iterates iterable values like arrays and strings). Array methods such as `forEach`, `map`, and `reduce` express iteration in a more functional style. Choosing the right loop depends on whether you need indices, early exit, async handling (where `for...of` works well with `await`), or object key iteration.

```javascript
for (let i = 0; i < 3; i++) console.log(i);

const arr = ["a", "b"];
for (const item of arr) console.log(item);
```

---

## 26. What is the difference between `for...in` and `for...of`?

`for...in` iterates over enumerable property names (keys) of an object, including inherited enumerable properties unless filtered, which is why it is not ideal for arrays if you only care about indices and not extra properties. `for...of` iterates over values of any iterable (arrays, strings, `Map`, `Set`, etc.) and gives you the elements directly. For arrays, `for...of` is usually what you want for values; use classic `for` or `forEach` if you need the index. Mixing them up is a common fresher mistake in interviews.

```javascript
const arr = [10, 20];
for (const key in arr) console.log(key); // "0", "1" (and possibly more if extended)

for (const value of arr) console.log(value); // 10, 20
```

---

## 27. What are `break` and `continue` statements?

`break` exits the nearest enclosing loop or `switch` immediately, skipping any remaining iterations or cases. `continue` skips the rest of the current loop iteration and jumps to the next iteration of the same loop. In nested loops, labeled `break`/`continue` can target an outer loop, though this is less common. Overusing `break`/`continue` can reduce clarity; sometimes extracting a function or using a flag is cleaner. They are still useful for performance-sensitive paths or when you must stop as soon as a condition is found.

```javascript
for (let i = 0; i < 10; i++) {
  if (i === 2) continue; // skip 2
  if (i === 5) break; // stop at 5
  console.log(i);
}
```

---

## 28. What is the ternary (conditional) operator?

The ternary operator `condition ? exprIfTrue : exprIfFalse` is a compact expression that returns one of two values based on a condition. Because it is an expression, you can embed it inside template literals, return statements, or assignments. It should stay short; deeply nested ternaries hurt readability—use `if/else` or helper functions instead. It evaluates one of the two branches (with a caveat: both sides are not always evaluated—only the chosen branch runs).

```javascript
const label = age >= 18 ? "adult" : "minor";
const fee = isMember ? 0 : 10;
```

---

## 29. What is short-circuit evaluation?

Logical operators `&&` and `||` evaluate left to right and stop as soon as the result is determined—this is short-circuit evaluation. For `&&`, if the left side is falsy, the right side is not evaluated. For `||`, if the left side is truthy, the right side is not evaluated. This behavior is often used for default values (`name || "Guest"`) or conditional calls (`user && user.save()`), though `??` is better than `||` when `0` or `""` are valid values. Understanding short-circuiting helps you avoid running expensive or unsafe code unnecessarily.

```javascript
const port = options.port || 3000;
true && console.log("runs");
false && console.log("skipped");
```

---

## 30. What is optional chaining (`?.`)?

Optional chaining lets you safely access nested properties or call methods when an intermediate value might be `null` or `undefined`. If the part before `?.` is nullish, the whole expression short-circuits to `undefined` instead of throwing a `TypeError`. It also works with `?.()` for optional function calls and `?.[]` for optional computed properties. This reduces repetitive `&&` chains and makes code that handles partial API responses much cleaner.

```javascript
const city = user?.address?.city;
const len = arr?.length;
maybeFn?.();
```

---

## 31. What are the different ways to define a function in JavaScript?

You can define functions with a function declaration (`function name() {}`), a function expression (`const f = function() {}`), an arrow function (`const f = () => {}`), or as methods inside object literals (`obj: function() {}` or shorthand `m() {}`). Constructors use `function` or `class` syntax. Each form differs in hoisting, `this` binding, and suitability as methods or callbacks. Knowing multiple styles helps you read older codebases and choose the right tool for callbacks and object methods.

```javascript
function add(a, b) {
  return a + b;
}
const mul = (a, b) => a * b;
```

---

## 32. What is the difference between function declaration and function expression?

A function declaration (`function foo() {}`) is hoisted entirely, so you can invoke `foo` before its line in the source. A function expression assigns an anonymous or named function to a variable and only the variable is hoisted (as `undefined` for `var` or TDZ for `let`), so you cannot call it before the assignment. Named function expressions can help stack traces. Declarations create a binding in the enclosing scope; expressions give you more control when passing functions as values.

```javascript
hoisted(); // OK
function hoisted() {}

notHoisted(); // ReferenceError — TDZ before const assignment
const notHoisted = function () {};
```

---

## 33. What are arrow functions?

Arrow functions provide a concise syntax with `=>` and lexically bind `this` from the surrounding scope, meaning they do not have their own `this` like traditional functions. They are ideal for short callbacks and array methods. They cannot be used as constructors (no `new`), and they have no own `arguments` object (use rest parameters instead). Omitting braces implies an implicit return of the expression; braces require explicit `return`.

```javascript
const nums = [1, 2, 3].map((n) => n * 2);

const obj = {
  value: 1,
  getDouble: function () {
    return this.value * 2;
  },
};
```

---

## 34. What are default parameters?

Default parameters let you specify fallback values in the function signature when an argument is `undefined` or missing. They are evaluated at call time in left-to-right order, and later defaults can refer to earlier parameters. This replaces older patterns like `x = x || 0` which incorrectly replaced valid falsy values such as `0`. Default parameters improve API ergonomics for optional configuration objects and flags.

```javascript
function greet(name = "Guest") {
  return `Hello, ${name}`;
}
function createUser(name, id = generateId()) {
  return { name, id };
}
```

---

## 35. What is the `arguments` object?

Inside non-arrow `function` functions, `arguments` is an array-like object containing all passed arguments, even beyond declared parameters. It is not a real array, so you often convert it with `Array.from(arguments)` or use rest parameters in modern code instead. Arrow functions do not have their own `arguments`; they inherit from the outer function if any. Rest parameters (`...args`) are usually clearer and give you a real array.

```javascript
function sum() {
  let total = 0;
  for (let i = 0; i < arguments.length; i++) total += arguments[i];
  return total;
}

function sumModern(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
```

---

## 36. What is a rest parameter (`...args`)?

A rest parameter collects remaining arguments into a real array, always appearing last in the parameter list. It replaces many uses of the `arguments` object and works with array methods directly. Rest is different from spread: rest gathers parameters into an array; spread expands an array or iterable into elements. Using rest makes variadic functions (`function join(sep, ...parts)`) easy to read and maintain.

```javascript
function maxFirst(first, ...rest) {
  return Math.max(first, ...rest);
}
maxFirst(3, 1, 4, 1); // 4
```

---

## 37. What is the spread operator?

The spread operator `...` expands an iterable (like an array or string) into individual elements in places where multiple values are expected: array literals, function calls, and object literals (object spread copies enumerable own properties). It creates shallow copies for arrays and objects. Spread is invaluable for concatenating arrays, copying, merging objects, and passing array elements as function arguments. Remember that object spread is shallow—nested objects are still shared references.

```javascript
const merged = [...[1, 2], ...[3, 4]];
Math.max(...[1, 5, 3]);
const copy = { ...original, extra: true };
```

---

## 38. What are higher-order functions?

A higher-order function is a function that either takes another function as an argument or returns a function (or both). Examples in JavaScript include `map`, `filter`, `reduce`, and `Array.prototype.sort` with a comparator. Higher-order functions enable composition, reuse, and declarative code for collections and async flows. Understanding them is a stepping stone to functional programming patterns and to libraries like Redux middleware.

```javascript
function withLogging(fn) {
  return function (...args) {
    console.log("calling");
    return fn(...args);
  };
}
```

---

## 39. What is a callback function?

A callback is a function passed into another function to be invoked later, either synchronously (for example `array.map(cb)`) or asynchronously (after a timer, I/O, or promise resolution). Callbacks are the foundation of asynchronous JavaScript, though nested callbacks can lead to “callback hell,” which `Promise` and `async/await` mitigate. Always consider error-handling conventions: Node-style `(err, result)` callbacks versus Promise `catch`.

```javascript
setTimeout(() => console.log("later"), 1000);

readFile("a.txt", (err, data) => {
  if (err) return console.error(err);
  console.log(data);
});
```

---

## 40. What are IIFE (Immediately Invoked Function Expressions)?

An IIFE is a function expression that is defined and called immediately, often wrapped in parentheses: `(function () { ... })();`. It creates a private scope, avoiding polluting the global namespace—a pattern used heavily before modules were standard. Modern ES modules reduce the need for IIFEs, but you still see them in legacy code and in bundler output. IIFEs can also return values or set up private variables inaccessible from outside.

```javascript
const counter = (function () {
  let n = 0;
  return {
    inc: () => ++n,
    get: () => n,
  };
})();
```

---

## 41. What is a pure function?

A pure function always returns the same output for the same input and has no observable side effects (no mutating external state, no I/O, no logging if you consider that a side effect in strict definitions). Pure functions are easier to test, reason about, and parallelize. In practice, programs need impure functions for DOM updates and network calls, but isolating pure logic improves quality. `map` with a pure callback transforms arrays predictably; impure callbacks can cause surprises.

```javascript
function add(a, b) {
  return a + b;
} // pure

let total = 0;
function addToTotal(x) {
  total += x;
} // impure — mutates external state
```

---

## 42. What is recursion?

Recursion is when a function calls itself to solve a problem by breaking it into smaller subproblems of the same shape. Classic examples include factorial, tree traversal, and flattening nested structures. Every recursive function needs a base case to stop and avoid infinite recursion (stack overflow). Recursion can be elegant but deep recursion can hit stack limits; iterative solutions or tail-call optimization (limited in JS engines) may be needed for very large inputs.

```javascript
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
```

---

## 43. What is the difference between `call()`, `apply()`, and `bind()`?

All three are methods on `Function.prototype` that control the value of `this` inside a function. `fn.call(thisArg, arg1, arg2)` invokes `fn` immediately with a given `this` and arguments listed separately. `fn.apply(thisArg, [args])` is the same but takes arguments as an array or array-like object. `fn.bind(thisArg, ...partialArgs)` returns a new function with `this` fixed (and optionally partial arguments), to be called later. They are used to borrow methods from other objects or to set `this` explicitly when passing methods as callbacks.

```javascript
function greet(greeting) {
  return `${greeting}, ${this.name}`;
}
const user = { name: "Ana" };
greet.call(user, "Hi");
greet.apply(user, ["Hello"]);
const bound = greet.bind(user, "Hey");
bound(); // "Hey, Ana"
```

---

## 44. What is function currying?

Currying transforms a function that takes multiple arguments into a sequence of functions each taking a single argument (or a subset), so you can partially apply arguments and reuse specialized functions. It is related to `bind` with partial application. Currying can improve reuse and readability in functional pipelines, though over-currying can obscure intent in teams unfamiliar with the style. JavaScript does not curry automatically; you implement it manually or use libraries.

```javascript
function add(a) {
  return function (b) {
    return function (c) {
      return a + b + c;
    };
  };
}
add(1)(2)(3); // 6
```

---

## 45. What is a first-class function?

In JavaScript, functions are first-class values: they can be assigned to variables, stored in data structures, passed as arguments, and returned from other functions. This enables callbacks, higher-order functions, and functional composition. It distinguishes JavaScript from languages where functions are second-class. This feature is central to patterns like event handlers, middleware, and promises.

```javascript
const ops = {
  add: (a, b) => a + b,
  mul: (a, b) => a * b,
};
function applyOp(op, x, y) {
  return op(x, y);
}
applyOp(ops.add, 2, 3); // 5
```

---

## 46. How do you create an array in JavaScript?

You can create arrays with array literals `[]`, the `Array` constructor `new Array()` (careful: `new Array(3)` creates a sparse array of length 3, not `[3]`), or `Array.of` and `Array.from` for specific cases. Literals are the most common and readable. Arrays are objects with numeric keys and a `length` property, and they inherit useful methods from `Array.prototype`. Knowing creation patterns helps avoid off-by-one errors and empty-slot pitfalls.

```javascript
const a = [1, 2, 3];
const b = Array.from({ length: 3 }, (_, i) => i);
const c = Array.of(1, 2, 3);
```

---

## 47. What are common array methods (`push`, `pop`, `shift`, `unshift`, `splice`)?

`push` and `pop` add/remove at the end of the array; `unshift` and `shift` add/remove at the beginning. `splice(start, deleteCount, ...items)` removes and/or inserts elements at an index and returns deleted elements—it mutates the original array. These methods change `length` and are essential for stack- and queue-like behavior. `shift`/`unshift` are slower on large arrays because indexes must move. Choose the right pair based on whether you treat the structure as LIFO or FIFO.

```javascript
const s = [1, 2];
s.push(3); // [1,2,3]
s.pop(); // 3
const q = ["a", "b"];
q.shift(); // "a"
q.splice(1, 0, "x"); // insert at index 1
```

---

## 48. What is the difference between `map()`, `filter()`, and `reduce()`?

`map` transforms each element and returns a new array of the same length. `filter` keeps elements that pass a predicate and returns a new array of possibly shorter length. `reduce` accumulates a single value by processing each element with an accumulator function—powerful but sometimes harder to read for newcomers. None of these three should mutate the original array if you write pure callbacks, though `sort` and `splice` do mutate. Choosing among them depends on whether you need a one-to-one transform, subset selection, or aggregation.

```javascript
[1, 2, 3].map((n) => n * 2); // [2,4,6]
[1, 2, 3, 4].filter((n) => n % 2 === 0); // [2,4]
[1, 2, 3].reduce((sum, n) => sum + n, 0); // 6
```

---

## 49. What is the `forEach()` method?

`forEach` executes a callback for each array element in order and returns `undefined`; it is used for side effects like logging or mutating external variables, not for transforming data (use `map` for that). You cannot `break` out of `forEach` early—use a `for` loop or `some`/`every` with conditions if you need short-circuiting. `forEach` skips holes in sparse arrays in modern engines. Async callbacks in `forEach` do not await in sequence unless you handle promises manually—often `for...of` with `await` is better for async work.

```javascript
["a", "b"].forEach((item, index) => {
  console.log(index, item);
});
```

---

## 50. What is the `find()` and `findIndex()` method?

`find` returns the first element that satisfies a predicate, or `undefined` if none match. `findIndex` returns the index of that element, or `-1` if not found—similar to `indexOf` but with a custom test instead of equality. They are ideal for looking up an object in an array by property. They do not mutate the array and stop as soon as a match is found.

```javascript
const users = [{ id: 1 }, { id: 2 }];
const u = users.find((x) => x.id === 2);
const i = users.findIndex((x) => x.id === 2);
```

---

## 51. What is the `some()` and `every()` method?

`some` returns `true` if at least one element passes the predicate; `every` returns `true` only if all elements pass. Both short-circuit: `some` stops at the first truthy result, `every` stops at the first falsy result. They are excellent for validation questions (“does any user have admin?” or “are all scores passing?”). Empty arrays: `every` on `[]` returns `true` (vacuous truth), and `some` on `[]` returns `false`.

```javascript
[1, 2, 3].some((n) => n > 2); // true
[1, 2, 3].every((n) => n > 0); // true
```

---

## 52. What is the `flat()` and `flatMap()` method?

`flat(depth)` flattens nested arrays up to the given depth (default 1), returning a new array. `flatMap` maps each element with a callback and flattens the result one level—useful when each input maps to zero or more outputs. They replace manual `reduce` + `concat` patterns for nested structures. Be cautious with very deep nesting or circular structures; `flat(Infinity)` can flatten all levels but may be expensive.

```javascript
[1, [2, [3]]].flat(2); // [1,2,3]
[1, 2, 3].flatMap((n) => [n, n * 2]); // [1,2,2,4,3,6]
```

---

## 53. What is `Array.from()` and `Array.isArray()`?

`Array.isArray(value)` reliably checks whether a value is an array, unlike `typeof` which reports `"object"` for arrays. `Array.from(arrayLike, mapFn?)` creates a new array from array-like objects (with `length` and indices) or iterables, optionally mapping in one step. It is how you convert a NodeList from `querySelectorAll` into a real array for `map`/`filter`. These utilities are part of writing robust DOM and data-processing code.

```javascript
Array.isArray([]); // true
Array.from("ab"); // ["a","b"]
Array.from({ length: 3 }, (_, i) => i); // [0,1,2]
```

---

## 54. What is array destructuring?

Array destructuring assigns elements from an array to variables by position using syntax like `const [a, b] = arr`. You can skip elements with commas, use rest patterns `const [first, ...rest] = arr`, and provide defaults `const [x = 0] = arr`. It pairs with iterables and is widely used for swapping variables, unpacking function returns, and extracting values from regex `match` results. Destructuring is shallow: nested arrays/objects can be further destructured.

```javascript
const [x, y] = [1, 2];
const [head, ...tail] = [1, 2, 3];
```

---

## 55. How do you sort an array in JavaScript?

`sort()` sorts an array in place and returns the same array reference. Default sort converts elements to strings and compares UTF-16 code units, which misorders numbers (`[10,2,1].sort()` is not numeric order). For numbers, pass a comparator `(a, b) => a - b`. For strings in a locale-aware way, use `localeCompare`. Remember that `sort` mutates; copy first with `slice()` or spread if you need immutability.

```javascript
[10, 2, 1].sort((a, b) => a - b); // [1,2,10]
["b", "a"].sort((a, b) => a.localeCompare(b));
```

---

## 56. What is the `includes()` method?

`includes(searchElement, fromIndex?)` checks whether an array contains a value using `SameValueZero` equality (similar to `===` but treats `NaN` as equal to `NaN`). It returns a boolean and is clearer than `indexOf(...) !== -1` for simple membership tests. For objects, it compares references, not deep equality. Strings also have `includes` for substring checks.

```javascript
[1, 2, 3].includes(2); // true
[NaN].includes(NaN); // true
```

---

## 57. How do you remove duplicates from an array?

Common approaches include using a `Set` (spread to array: `[...new Set(arr)]`), `filter` with `indexOf`, or `reduce`—`Set` is concise for primitives. For objects, you need a key function or serialization because reference equality will not dedupe different objects with the same content. Sorting first can help some algorithms but `Set` is usually simplest for primitives. Consider performance and memory for very large arrays.

```javascript
const unique = [...new Set([1, 2, 2, 3])];
```

---

## 58. What is the difference between `slice()` and `splice()`?

`slice(start, end)` returns a shallow copy of a portion of the array without modifying the original—end is exclusive. `splice(start, deleteCount, ...items)` mutates the array by removing and/or inserting elements and returns an array of removed elements. Names are often confused in interviews: `slice` is non-destructive; `splice` is destructive. Use `slice` for copying or immutability-friendly patterns; use `splice` when you intentionally edit the array in place.

```javascript
const a = [1, 2, 3, 4];
a.slice(1, 3); // [2,3] — a unchanged

const b = [1, 2, 3, 4];
b.splice(1, 2, 9); // b is [1,9,4], returns [2,3]
```

---

## 59. How do you create an object in JavaScript?

Object literals `{ key: value }` are the most common approach; keys are strings or symbols, and ES6 adds shorthand `{ name, age }` when variable names match keys. You can use `new Object()` but literals are idiomatic. `Object.create(proto)` creates an object with a specific prototype chain. Classes (`class`) are syntactic sugar over prototype-based constructors. Understanding creation helps with patterns like factories and configuration objects.

```javascript
const user = { name: "Kim", age: 30 };
const point = { x: 0, y: 0 };
```

---

## 60. What is object destructuring?

Object destructuring pulls properties from an object into variables by name: `const { name, age } = user`. You can rename with `name: n`, provide defaults `age = 0`, and nest destructuring for deep properties. It is widely used in function parameters to unpack options objects. Like array destructuring, it is shallow regarding nested objects unless you destructure further.

```javascript
const { width: w, height: h = 100 } = box;
function draw({ color = "black", x = 0 } = {}) {
  /* ... */
}
```

---

## 61. What are computed property names?

Computed property names let you use an expression inside square brackets as the key in an object literal: `{ [expr]: value }`. This is useful when keys come from variables or dynamic strings. Without this feature you had to create the object first then assign properties. It pairs well with maps built from runtime data.

```javascript
const field = "userId";
const obj = { [field]: 42, [`${field}Label`]: "ID" };
```

---

## 62. What are `Object.keys()`, `Object.values()`, and `Object.entries()`?

These static methods return arrays of an object’s own enumerable string-keyed properties: keys only, values only, or `[key, value]` pairs respectively. Order is generally insertion order for string keys in modern engines. They do not include symbol keys in the default methods—use `Object.getOwnPropertySymbols` separately if needed. They are the standard way to iterate objects when you do not use `for...in`.

```javascript
const o = { a: 1, b: 2 };
Object.keys(o); // ["a","b"]
Object.values(o); // [1,2]
Object.entries(o); // [["a",1],["b",2]]
```

---

## 63. What is the `this` keyword?

`this` is a runtime binding whose value depends on how a function is called, not where it is written. In a method call `obj.method()`, `this` is typically `obj`. In a plain function call in non-strict mode, `this` may be the global object; in strict mode it is `undefined`. Arrow functions inherit `this` lexically. `call`/`apply`/`bind` set `this` explicitly. Misunderstanding `this` is a top source of bugs, especially when passing methods as callbacks.

```javascript
const counter = {
  n: 0,
  inc() {
    this.n++;
  },
};
const f = counter.inc;
f(); // `this` is not counter — n not updated on counter
```

---

## 64. What is the `new` keyword?

`new` invokes a constructor function (or class) to create an object: it creates a new object, sets its prototype to `Constructor.prototype`, binds `this` to that object, runs the constructor body, and returns the object (unless the constructor returns an object explicitly). Classes in ES6 desugar to this pattern. Forgetting `new` on a constructor can accidentally pollute globals in older code. Understanding `new` connects to prototypes and `instanceof`.

```javascript
function Person(name) {
  this.name = name;
}
const p = new Person("Jo");
```

---

## 65. What is property shorthand in ES6?

When an object literal’s property name matches a variable name in scope, you can write `{ name }` instead of `{ name: name }`. Method shorthand lets you write `m() {}` instead of `m: function() {}`. These features reduce repetition when building objects from local variables. They are ubiquitous in modern React props and API payload construction.

```javascript
const name = "Bo";
const age = 20;
const user = { name, age };
```

---

## 66. How do you clone an object (shallow vs deep copy)?

A shallow copy duplicates top-level properties but nested objects are still shared references—`Object.assign({}, obj)`, `{ ...obj }`, or `Array.from`/`slice` for arrays. A deep copy duplicates nested structures; common approaches include `structuredClone(obj)` (modern environments), `JSON.parse(JSON.stringify(obj))` (limited: no functions, dates become strings, loses `undefined`), or libraries like Lodash’s `cloneDeep`. Choose based on data shape and performance needs.

```javascript
const shallow = { ...original };
const deep = structuredClone(original);
```

---

## 67. What is the `in` operator and `hasOwnProperty()`?

The `in` operator checks whether a property exists anywhere on the object or its prototype chain (`"toString" in {}` is true). `obj.hasOwnProperty("key")` checks only own properties, not inherited ones—though objects created with `Object.create(null)` may lack `hasOwnProperty`, so `Object.hasOwn(obj, key)` (ES2022) is the safe modern alternative. Use these when distinguishing own data properties from prototype pollution or inherited defaults.

```javascript
const o = { a: 1 };
"a" in o; // true
Object.hasOwn(o, "a"); // true
Object.hasOwn(o, "toString"); // false
```

---

## 68. What are getters and setters?

Getters and setters are accessor properties defined with `get` and `set` syntax; they look like properties but run functions when read or written. They enable computed properties, validation on assignment, and compatibility with APIs expecting property access instead of methods. They participate in enumeration and `Object.defineProperty` patterns. Overuse can hide expensive work behind innocent-looking property access.

```javascript
const account = {
  _balance: 0,
  get balance() {
    return this._balance;
  },
  set balance(v) {
    if (v < 0) throw new Error("invalid");
    this._balance = v;
  },
};
```

---

## 69. What is scope in JavaScript?

Scope answers where a variable name is visible and can be resolved. JavaScript has function scope (for `var`), block scope (for `let`/`const`), module scope, and global scope. Inner scopes can access outer variables, but not vice versa. Parameters and `catch` bindings are block-scoped in modern JS. Understanding scope prevents accidental globals and explains many closure behaviors.

```javascript
function outer() {
  const x = 1;
  function inner() {
    console.log(x);
  }
  inner();
}
```

---

## 70. What is the scope chain?

When resolving a variable, JavaScript looks up the chain of nested scopes from inner to outer until it finds a binding or reaches the global scope. This chain is established lexically at write time. If a variable is not found, a `ReferenceError` is thrown (in strict mode for undeclared assignments too). The scope chain is why closures can read outer variables even after outer functions return—those variables remain in memory if referenced.

```javascript
const a = "global";
function f() {
  const a = "outer";
  return function g() {
    console.log(a); // "outer" — nearest binding wins
  };
}
```

---

## 71. What is lexical scoping?

Lexical (static) scoping means a function’s free variables are resolved by where the function is defined in the source text, not where it is called. This makes scope predictable: nested functions close over outer variables from their defining environment. It contrasts with dynamic scoping (not used for variables in JavaScript). Lexical scoping is the foundation of closures.

```javascript
const x = 10;
function f() {
  console.log(x);
}
function g() {
  const x = 20;
  f(); // logs 10 — f's x is lexical, not g's
}
```

---

## 72. What is a closure?

A closure is a function together with its lexical environment—the variables from outer scopes that it retains access to even after those outer functions finish executing. Closures enable private state, factory functions, and callbacks that remember configuration. They are powerful but can retain large objects in memory if references are kept unintentionally. Interviewers love closure questions because they test understanding of scope and memory.

```javascript
function makeCounter() {
  let n = 0;
  return () => ++n;
}
const c = makeCounter();
c(); // 1
c(); // 2
```

---

## 73. What is the temporal dead zone (TDZ)?

The TDZ is the period from the start of a block until a `let` or `const` declaration is executed, during which the variable exists but cannot be accessed—access throws `ReferenceError`. This prevents using variables before declaration in a way that `var` accidentally allowed (with `undefined`). TDZ applies to `let` and `const` and also to `class` declarations. Understanding TDZ clarifies errors when reordering code or using variables in circular dependencies.

```javascript
// console.log(x); // ReferenceError — TDZ
let x = 1;
```

---

## 74. What is block scope vs function scope?

Function scope means a binding is visible throughout the entire function body (`var`). Block scope limits visibility to a pair of braces (`let`/`const`), such as `if`, `for`, or bare blocks. Block scope reduces accidental leakage from loop variables and temporary constants. `var` in a loop does not create a new binding per iteration in classic `for` loops the way `let` does, which is a classic interview pitfall with asynchronous callbacks.

```javascript
for (var i = 0; i < 3; i++) {
  /* one shared i */
}
for (let j = 0; j < 3; j++) {
  /* new j each iteration */
}
```

---

## 75. What is variable shadowing?

Shadowing occurs when an inner scope declares a variable with the same name as an outer scope, hiding the outer binding within the inner scope. The inner variable does not affect the outer one. It can be intentional to avoid renaming, but it can confuse readers if names are reused carelessly. `let`/`const` can shadow `var` in nested blocks with different rules; understanding the difference helps debug wrong values.

```javascript
let x = 1;
function f() {
  let x = 2;
  console.log(x); // 2
}
f();
console.log(x); // 1
```

---

## 76. What is the DOM?

The Document Object Model is a tree representation of an HTML document that scripts can read and modify. Each node corresponds to an element, text, or attribute, and APIs let you query, create, remove, and listen to events on these nodes. The DOM bridges markup and JavaScript behavior in the browser. Changes to the DOM can trigger reflow and repaint, which matters for performance on large pages.

```javascript
const root = document.documentElement;
console.log(document.body.childNodes.length);
```

---

## 77. How do you select elements in the DOM?

Common selectors include `document.getElementById`, `getElementsByClassName`, `getElementsByTagName`, and the more flexible `querySelector` / `querySelectorAll` which accept CSS selectors. `querySelector` returns the first match; `querySelectorAll` returns a static NodeList. Prefer specific selectors for performance and clarity. Remember that IDs should be unique; class selectors may return many elements.

```javascript
const app = document.getElementById("app");
const items = document.querySelectorAll(".item");
```

---

## 78. How do you create and append elements?

Use `document.createElement(tagName)` to create elements, set properties and `textContent`/`innerHTML` carefully (avoid unsanitized `innerHTML` with user data), then attach with `parent.appendChild(node)` or `append`/`insertBefore`. Document fragments can batch inserts to reduce reflows. Removing uses `removeChild` or `element.remove()`. Building UIs programmatically is core to vanilla JS and to understanding what frameworks abstract.

```javascript
const li = document.createElement("li");
li.textContent = "New item";
document.querySelector("ul").append(li);
```

---

## 79. What is event handling in JavaScript?

Event handling connects user actions (clicks, input, keyboard) or browser notifications (load, resize) to JavaScript functions called event handlers or listeners. You register listeners with `addEventListener` or legacy properties like `onclick`. The browser dispatches event objects containing details (`target`, `currentTarget`, `type`). Good event handling keeps UI responsive and separates concerns from markup when using unobtrusive JavaScript.

```javascript
button.addEventListener("click", (event) => {
  console.log(event.target);
});
```

---

## 80. What is event bubbling and capturing?

DOM events propagate in three phases: capturing from window down to the target, target phase, then bubbling from target up to ancestors. Most handlers listen during bubbling by default; `addEventListener(..., true)` listens in the capture phase. Bubbling means a click on a child can trigger listeners on parents unless stopped. Understanding phases explains why order of registration and `stopPropagation` matter.

```javascript
outer.addEventListener(
  "click",
  () => console.log("outer capture"),
  true
);
```

---

## 81. What is event delegation?

Event delegation attaches a single listener to a parent and relies on bubbling to handle events from many children, often checking `event.target` against a selector. It reduces memory use and automatically handles dynamically added children. It is commonly used for lists and tables. You must be careful with `target` vs `closest` when nested elements exist inside list items.

```javascript
list.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li || !list.contains(li)) return;
  console.log(li.dataset.id);
});
```

---

## 82. What is `event.preventDefault()`?

`preventDefault()` cancels the browser’s default action for an event, such as following a link on click or submitting a form, or scrolling on touch in some cases. It does not stop propagation unless you also call `stopPropagation`. Use it for SPA navigation, custom form validation, and drag-and-drop. Calling it conditionally lets you allow default behavior when validation passes.

```javascript
form.addEventListener("submit", (e) => {
  e.preventDefault();
  submitViaAjax();
});
```

---

## 83. What is `event.stopPropagation()`?

`stopPropagation()` stops the event from continuing to other listeners in the same phase and from moving to the other phase (no further bubbling or capturing depending on when called). `stopImmediatePropagation()` also prevents other listeners on the same element from running. Use these when a child handler should consume an event so parents do not react. Overusing them can make event flows hard to debug.

```javascript
child.addEventListener("click", (e) => {
  e.stopPropagation();
});
```

---

## 84. What is the difference between `addEventListener` and `onclick`?

`element.onclick = handler` assigns a single handler property; a second assignment replaces the first. `addEventListener` registers multiple independent listeners for the same event and supports options like `{ once: true }`, `{ passive: true }`, and capture. `addEventListener` is the modern, flexible approach; `onclick` attributes in HTML mix behavior with markup. Removing listeners requires matching `removeEventListener` with the same function reference.

```javascript
el.addEventListener("click", onClick);
el.removeEventListener("click", onClick);
```

---

## 85. What is the DOMContentLoaded event?

`DOMContentLoaded` fires when the HTML document has been fully parsed and the DOM is built, without waiting for stylesheets, images, and subframes to finish loading. It is the usual hook to start DOM-dependent initialization. `load` waits for all resources and is later in the lifecycle. Scripts deferred with `defer` run before `DOMContentLoaded`; async scripts may run before or after depending on download timing.

```javascript
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});
```

---

## 86. What is synchronous vs asynchronous JavaScript?

Synchronous code runs line by line, blocking until each operation finishes; long synchronous work freezes the UI in browsers. Asynchronous code schedules work to complete later (timers, network, I/O) and uses callbacks, promises, or `async/await` to resume. The JavaScript runtime is single-threaded for your code but delegates async work to the host (browser APIs, libuv in Node) and coordinates completion via the event loop. Understanding this distinction is essential for responsive apps.

```javascript
console.log("A");
setTimeout(() => console.log("B"), 0);
console.log("C"); // A, C, B
```

---

## 87. What is `setTimeout` and `setInterval`?

`setTimeout(fn, delayMs, ...args)` schedules `fn` once after at least `delayMs` milliseconds (not guaranteed exact timing). `setInterval` repeats `fn` at roughly every `delayMs` until cleared. Both return numeric IDs you pass to `clearTimeout` / `clearInterval`. Timers are asynchronous and subject to throttling in background tabs. For animation, `requestAnimationFrame` is often better than tight `setInterval` loops.

```javascript
const id = setInterval(() => console.log("tick"), 1000);
clearInterval(id);
```

---

## 88. What are Promises?

A Promise represents a future value of an asynchronous operation: it can be pending, fulfilled with a value, or rejected with a reason. You attach continuations with `.then(onFulfilled, onRejected)` and `.catch(onRejected)`, and chain further `.then` calls. Promises flatten asynchronous control flow compared to nested callbacks. `new Promise((resolve, reject) => { ... })` creates a manual promise for wrapping legacy APIs.

```javascript
fetch("/api/data")
  .then((r) => r.json())
  .then((data) => console.log(data))
  .catch((err) => console.error(err));
```

---

## 89. What is `async`/`await`?

`async` functions always return a Promise and allow you to use `await` inside them to pause until a Promise settles, writing asynchronous code that reads like synchronous code. `await` unwraps fulfilled values and throws on rejection (caught by `try/catch`). This reduces `.then` chains and improves readability for sequential async steps. Remember that `await` in loops has sequential vs parallel implications—`Promise.all` runs tasks concurrently.

```javascript
async function load() {
  try {
    const res = await fetch("/api");
    const data = await res.json();
    return data;
  } catch (e) {
    console.error(e);
  }
}
```

---

## 90. What is the event loop?

The event loop is the mechanism that coordinates the call stack, message queue (macrotasks), and microtask queue in JavaScript runtimes. When the stack is empty, the loop takes the next task from the queue and runs it. Promises and `queueMicrotask` use microtasks, which run before the next macrotask after the current synchronous code finishes. This ordering explains why `Promise.then` runs before `setTimeout(0)` when scheduled in the same turn. Deep event-loop knowledge separates solid async understanding from memorized APIs.

```javascript
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4"); // 1, 4, 3, 2
```

---

## 91. What is `Promise.all()` and `Promise.race()`?

`Promise.all(iterable)` returns a promise that fulfills with an array of all results when every input promise fulfills, or rejects immediately if any input rejects—useful for parallel independent requests. `Promise.race(iterable)` settles with the first settled promise’s outcome—useful for timeouts or fastest-source wins. There is also `Promise.allSettled` (never rejects; gives status per promise) and `Promise.any` (first fulfillment). Choosing the right combinator prevents unnecessary waiting or missed errors.

```javascript
const [a, b] = await Promise.all([fetch("/a"), fetch("/b")]);
```

---

## 92. What is `fetch` API?

`fetch` is the browser (and Node with polyfills) API for making HTTP requests, returning a Promise that resolves to a `Response` object. You typically call `response.json()`, `text()`, or `blob()` to read the body—another async step. It does not reject on HTTP error status codes like 404 or 500; you check `response.ok` or `status`. For older browsers or advanced upload progress, libraries or `XMLHttpRequest` may still appear.

```javascript
const res = await fetch("/api/users");
if (!res.ok) throw new Error(res.statusText);
const users = await res.json();
```

---

## 93. What are ES6 modules (`import`/`export`)?

ES modules let you split code into files with explicit `export` declarations and `import` bindings, enabling static analysis and tree shaking. They are always strict mode and use live bindings for exports. In browsers, use `<script type="module">`; in Node, use `"type": "module"` or `.mjs`. Default vs named exports organize APIs: `export default` for the main thing, named exports for utilities. Cyclic dependencies are possible but should be designed carefully.

```javascript
// math.js
export const pi = 3.14;
export function add(a, b) {
  return a + b;
}

// main.js
import { add, pi } from "./math.js";
```

---

## 94. What is the `Symbol` type?

`Symbol` is a primitive type representing a unique identifier, often used for object property keys that won’t collide with string keys. `Symbol()` returns a unique value; `Symbol.for("key")` registers a global symbol. Well-known symbols like `Symbol.iterator` customize language behavior (iterables). Symbols are not enumerable with `Object.keys` by default, which can hide “internal” properties. They are useful for metaprogramming and library APIs.

```javascript
const id = Symbol("id");
const user = { [id]: 123, name: "Pat" };
```

---

## 95. What are `Map` and `Set`?

`Map` stores key-value pairs where keys can be any type (including objects), maintains insertion order, and has convenient size and iteration methods. Plain objects coerce keys to strings, which is wrong for some use cases. `Set` stores unique values and supports fast membership tests. Both are iterable and work well with `for...of`. Choose `Map`/`Set` when keys are objects or when you care about key type fidelity and frequent add/delete.

```javascript
const m = new Map();
m.set("a", 1);
const s = new Set([1, 2, 2]);
s.has(2); // true
```

---

## 96. What is `JSON.stringify()` and `JSON.parse()`?

`JSON.stringify` converts JavaScript values to JSON strings for storage or transport; `JSON.parse` parses JSON strings back to values. They support objects, arrays, strings, numbers, booleans, and `null`, but not `undefined`, functions, or `Symbol` keys in a straightforward way. `JSON.stringify` can take a replacer and space for formatting. Dates stringify as ISO strings but parse back as strings unless revived. These are the standard serialization tools for REST APIs and `localStorage`.

```javascript
const json = JSON.stringify({ ok: true, n: 1 });
const obj = JSON.parse(json);
```

---

## 97. What are tagged template literals?

A tagged template is a function call where a template literal is passed to a function as separate cooked strings and substitution values: `tag(strings, ...values)`. The function can customize string assembly, escaping, or build DSLs (like styled-components or i18n). The first argument is an array of raw string segments including raw text; the rest are evaluated expressions. It is an advanced feature but shows up in modern libraries.

```javascript
function highlight(strings, ...values) {
  return strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), "");
}
highlight`Hello ${name}!`;
```

---

## 98. What is the nullish coalescing operator (`??`)?

The `??` operator returns the right-hand side only when the left-hand side is `null` or `undefined`, unlike `||` which triggers on any falsy value (`0`, `""`, `false`). This makes `??` ideal for defaulting when `0` or empty string are valid data. It has lower precedence than many expect, so combine with parentheses when mixing with `&&` or `||`. It improves correctness for configuration and API defaults.

```javascript
const port = options.port ?? 3000;
const label = input ?? "default";
```

---

## 99. What is `globalThis`?

`globalThis` is a standard way to refer to the global object across environments: `window` in browsers, `global` in Node, `self` in workers. Using `globalThis` avoids environment-specific checks in cross-platform libraries. It matters for polyfills and feature detection in isomorphic code. Avoid polluting the global object; prefer modules and explicit exports.

```javascript
globalThis.myLib = { version: 1 };
```

---

## 100. What are `WeakMap` and `WeakSet`?

`WeakMap` holds key-value pairs where keys must be objects (or registered symbols), and `WeakSet` holds only objects, both without preventing garbage collection of keys when nothing else references them—hence “weak.” They are not iterable and have no `size` reliably exposed in the same way because membership is ephemeral. Use cases include private data associated with DOM nodes or marking objects without leaking memory. They complement `Map`/`Set` when object identity and weak lifetime are required.

```javascript
const wm = new WeakMap();
const el = document.body;
wm.set(el, { clicks: 0 });
```

---
