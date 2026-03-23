# JavaScript MCQ - Set 1 (Beginner Level)

**1. What keyword is used to declare a variable in JavaScript that cannot be reassigned?**

a) `var`
b) `let`
c) `const`
d) `static`

**Answer: c) `const`**

---

**2. Which declaration allows you to reassign the variable to a new value but is block-scoped?**

a) `var`
b) `let`
c) `const`
d) `define`

**Answer: b) `let`**

---

**3. What will `typeof null` return in JavaScript?**

a) `"null"`
b) `"undefined"`
c) `"object"`
d) `"boolean"`

**Answer: c) `"object"`**

---

**4. What is the output of the following code?**

```javascript
console.log(typeof undefined);
```

a) `"undefined"`
b) `undefined`
c) `"object"`
d) `"null"`

**Answer: a) `"undefined"`**

---

**5. Which value represents “no value” when a variable has been declared but not assigned?**

a) `null`
b) `undefined`
c) `NaN`
d) `false`

**Answer: b) `undefined`**

---

**6. What does `==` do compared to `===`?**

a) `==` checks value and type; `===` checks value only
b) `==` allows type coercion; `===` does not
c) They are identical in modern JavaScript
d) `===` allows type coercion; `==` does not

**Answer: b) `==` allows type coercion; `===` does not**

---

**7. What is the result of `5 + "5"` in JavaScript?**

a) `10`
b) `"55"`
c) `55`
d) `NaN`

**Answer: b) `"55"`**

---

**8. Which of these is falsy in JavaScript?**

a) `"0"`
b) `[]`
c) `0`
d) `{}`

**Answer: c) `0`**

---

**9. What is the output?**

```javascript
console.log(Boolean(""));
```

a) `true`
b) `false`
c) `undefined`
d) `null`

**Answer: b) `false`**

---

**10. Which primitive type is returned by `typeof true`?**

a) `"bool"`
b) `"boolean"`
c) `"true"`
d) `"object"`

**Answer: b) `"boolean"`**

---

**11. What is the result of `10 % 3`?**

a) `3`
b) `1`
c) `0`
d) `3.33`

**Answer: b) `1`**

---

**12. What does the logical AND operator `&&` return when the first operand is falsy?**

a) The second operand
b) The first operand
c) Always `true`
d) Always `false`

**Answer: b) The first operand**

---

**13. What is the output?**

```javascript
console.log(2 ** 3);
```

a) `6`
b) `8`
c) `9`
d) `5`

**Answer: b) `8`**

---

**14. Which operator increments a variable by 1 after using its value?**

a) `++x` (prefix)
b) `x++` (postfix)
c) `+= 1` always behaves as postfix
d) `--x`

**Answer: b) `x++` (postfix)**

---

**15. What is `NaN === NaN`?**

a) `true`
b) `false`
c) `undefined`
d) Throws an error

**Answer: b) `false`**

---

**16. Which method returns the character at a specific index in a string?**

a) `charAt()`
b) `indexOf()`
c) `slice()`
d) `split()`

**Answer: a) `charAt()`**

---

**17. What is the output?**

```javascript
console.log("hello".toUpperCase());
```

a) `"Hello"`
b) `"HELLO"`
c) `"hello"`
d) `TypeError`

**Answer: b) `"HELLO"`**

---

**18. What does `"JavaScript".indexOf("Script")` return?**

a) `-1`
b) `0`
c) `4`
d) `10`

**Answer: c) `4`**

---

**19. Which method removes whitespace from both ends of a string?**

a) `trim()`
b) `strip()`
c) `clean()`
d) `pad()`

**Answer: a) `trim()`**

---

**20. What is the output?**

```javascript
console.log("a,b,c".split(",").length);
```

a) `1`
b) `3`
c) `5`
d) `NaN`

**Answer: b) `3`**

---

**21. What does `Math.floor(4.9)` return?**

a) `5`
b) `4`
c) `4.9`
d) `-4`

**Answer: b) `4`**

---

**22. What is the output?**

```javascript
console.log(Math.max(3, 7, 2));
```

a) `3`
b) `7`
c) `12`
d) `undefined`

**Answer: b) `7`**

---

**23. Which expression correctly checks if a value is Not-a-Number?**

a) `value === NaN`
b) `Number.isNaN(value)`
c) `typeof value === "NaN"`
d) `value == NaN`

**Answer: b) `Number.isNaN(value)`**

---

**24. What is the result of `parseInt("10px", 10)`?**

a) `NaN`
b) `10`
c) `"10"`
d) `0`

**Answer: b) `10`**

---

**25. What does `Math.random()` return?**

a) An integer from 1 to 10
b) A number `>= 0` and `< 1`
c) Always `0.5`
d) A string

**Answer: b) A number `>= 0` and `< 1`**

---

**26. How do you create a template literal in JavaScript?**

a) Single quotes `'...'`
b) Double quotes `"..."`
c) Backticks `` `...` ``
d) Parentheses `(...)`

**Answer: c) Backticks `` `...` ``**

---

**27. What is the output?**

```javascript
const n = 5;
console.log(`Count: ${n + 1}`);
```

a) `Count: 51`
b) `Count: ${n + 1}`
c) `Count: 6`
d) `Count: n + 1`

**Answer: c) `Count: 6`**

---

**28. Which symbol starts a single-line comment in JavaScript?**

a) `#`
b) `//`
c) `/*`
d) `--`

**Answer: b) `//`**

---

**29. How do you write a multi-line comment?**

a) `<!-- ... -->`
b) `# ... #`
c) `/* ... */`
d) `// ... //`

**Answer: c) `/* ... */`**

---

**30. What is the output?**

```javascript
let x = 1;
if (x) {
  console.log("yes");
} else {
  console.log("no");
}
```

a) `yes`
b) `no`
c) Nothing is printed
d) Error

**Answer: a) `yes`**

---

**31. What does `switch` compare values with by default?**

a) Loose equality (`==`)
b) Strict equality (`===`)
c) Reference equality only
d) It never compares; it only runs the first case

**Answer: b) Strict equality (`===`)**

---

**32. What is the output?**

```javascript
for (let i = 0; i < 3; i++) {}
console.log(i);
```

a) `2`
b) `3`
c) `undefined`
d) ReferenceError

**Answer: d) ReferenceError**

---

**33. Which loop checks the condition before each iteration?**

a) `do...while`
b) `while`
c) `for...in` only
d) `for...of` only

**Answer: b) `while`**

---

**34. What is the output?**

```javascript
let s = 0;
let j = 0;
while (j < 4) {
  s += j;
  j++;
}
console.log(s);
```

a) `4`
b) `6`
c) `10`
d) `0`

**Answer: b) `6`**

---

**35. What keyword exits a loop early?**

a) `stop`
b) `exit`
c) `break`
d) `return` (always, even outside functions)

**Answer: c) `break`**

---

**36. How do you add an element to the end of an array?**

a) `push()`
b) `pop()`
c) `shift()`
d) `unshift()`

**Answer: a) `push()`**

---

**37. What does `pop()` do to an array?**

a) Adds to the end
b) Removes the last element
c) Removes the first element
d) Sorts the array

**Answer: b) Removes the last element**

---

**38. What is the output?**

```javascript
const arr = [10, 20, 30];
console.log(arr[arr.length - 1]);
```

a) `10`
b) `20`
c) `30`
d) `undefined`

**Answer: c) `30`**

---

**39. Which method creates a new array with only elements that pass a test function?**

a) `map()`
b) `filter()`
c) `forEach()`
d) `reduce()`

**Answer: b) `filter()`**

---

**40. What is the output?**

```javascript
console.log([1, 2, 3].map(x => x * 2).join("-"));
```

a) `"1-2-3"`
b) `"2-4-6"`
c) `[2,4,6]`
d) `6`

**Answer: b) `"2-4-6"`**

---

**41. How do you access a property `name` on an object `user`?**

a) Only `user(name)`
b) `user.name` or `user["name"]`
c) `user->name`
d) `user::name`

**Answer: b) `user.name` or `user["name"]`**

---

**42. What is the output?**

```javascript
const o = { a: 1, b: 2 };
console.log("c" in o);
```

a) `true`
b) `false`
c) `undefined`
d) Error

**Answer: b) `false`**

---

**43. Which syntax defines a named function declaration?**

a) `const f = function() {}`
b) `function f() {}`
c) `let f() {}`
d) `def f() {}`

**Answer: b) `function f() {}`**

---

**44. What is the output?**

```javascript
function add(a, b) {
  return a + b;
}
console.log(add(2, 3));
```

a) `23`
b) `5`
c) `undefined`
d) `NaN`

**Answer: b) `5`**

---

**45. What happens if a function has no `return` statement?**

a) It returns `0`
b) It returns `null`
c) It returns `undefined`
d) It throws an error

**Answer: c) It returns `undefined`**

---

**46. In the following code, what can `console.log` inside `inner` access?**

```javascript
const outer = 1;
function inner() {
  console.log(outer);
}
inner();
```

a) Nothing; `outer` is not in scope
b) `outer` from the enclosing scope
c) Only variables declared inside `inner`
d) It always prints `undefined`

**Answer: b) `outer` from the enclosing scope**

---

**47. What will this log?**

```javascript
console.log(typeof []);
```

a) `"array"`
b) `"object"`
c) `"list"`
d) `"undefined"`

**Answer: b) `"object"`**

---

**48. Which `console` method is commonly used to show a labeled table for arrays of objects?**

a) `console.table()`
b) `console.grid()`
c) `console.sheet()`
d) `console.matrix()`

**Answer: a) `console.table()`**

---

**49. Trying to read a property of `null` typically throws which error type?**

a) `SyntaxError`
b) `TypeError`
c) `ReferenceError`
d) `RangeError`

**Answer: b) `TypeError`**

---

**50. In the browser, which object represents the current web page’s document structure?**

a) `window.console`
b) `document`
c) `navigator`
d) `localStorage`

**Answer: b) `document`**

---
