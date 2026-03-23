# 200 JavaScript Real-Time Assignments with Answers

---

## 🟢 BEGINNER LEVEL (Assignments 1–70)

### Variables, Data Types & Operators

---

**Assignment 1:** Write a program that declares variables for your name, age, and city, then prints a sentence using them.

```javascript
const name = "Alice";
const age = 25;
const city = "New York";
console.log(`My name is ${name}, I am ${age} years old, and I live in ${city}.`);
```

---

**Assignment 2:** Swap two numbers without using a third variable.

```javascript
let a = 5, b = 10;
a = a + b; // a = 15
b = a - b; // b = 5
a = a - b; // a = 10
console.log(`a = ${a}, b = ${b}`);

// ES6 way:
let x = 5, y = 10;
[x, y] = [y, x];
console.log(`x = ${x}, y = ${y}`);
```

---

**Assignment 3:** Write a program to check whether a number is positive, negative, or zero.

```javascript
function checkNumber(num) {
  if (num > 0) return "Positive";
  else if (num < 0) return "Negative";
  else return "Zero";
}

console.log(checkNumber(5));   // Positive
console.log(checkNumber(-3));  // Negative
console.log(checkNumber(0));   // Zero
```

---

**Assignment 4:** Write a program that converts Celsius to Fahrenheit.

```javascript
function celsiusToFahrenheit(celsius) {
  return (celsius * 9/5) + 32;
}

console.log(celsiusToFahrenheit(0));    // 32
console.log(celsiusToFahrenheit(100));  // 212
console.log(celsiusToFahrenheit(37));   // 98.6
```

---

**Assignment 5:** Write a program that calculates the area and perimeter of a rectangle given its length and width.

```javascript
function rectangleCalc(length, width) {
  const area = length * width;
  const perimeter = 2 * (length + width);
  return { area, perimeter };
}

const result = rectangleCalc(5, 3);
console.log(`Area: ${result.area}`);        // Area: 15
console.log(`Perimeter: ${result.perimeter}`); // Perimeter: 16
```

---

**Assignment 6:** Write a program to find the largest of three numbers.

```javascript
function findLargest(a, b, c) {
  return Math.max(a, b, c);
}

console.log(findLargest(10, 25, 15)); // 25
console.log(findLargest(-1, -5, -2)); // -1
```

---

**Assignment 7:** Write a program to check if a number is even or odd.

```javascript
function isEvenOrOdd(num) {
  return num % 2 === 0 ? "Even" : "Odd";
}

console.log(isEvenOrOdd(4));  // Even
console.log(isEvenOrOdd(7));  // Odd
console.log(isEvenOrOdd(0));  // Even
```

---

**Assignment 8:** Write a program that calculates simple interest given principal, rate, and time.

```javascript
function simpleInterest(principal, rate, time) {
  const interest = (principal * rate * time) / 100;
  return interest;
}

console.log(simpleInterest(1000, 5, 2));  // 100
console.log(simpleInterest(5000, 8, 3));  // 1200
```

---

**Assignment 9:** Write a program to find the remainder when one number is divided by another.

```javascript
function findRemainder(a, b) {
  return a % b;
}

console.log(findRemainder(10, 3)); // 1
console.log(findRemainder(25, 7)); // 4
console.log(findRemainder(16, 4)); // 0
```

---

**Assignment 10:** Write a program that takes a temperature in Fahrenheit and converts it to Celsius.

```javascript
function fahrenheitToCelsius(fahrenheit) {
  return ((fahrenheit - 32) * 5) / 9;
}

console.log(fahrenheitToCelsius(32));   // 0
console.log(fahrenheitToCelsius(212));  // 100
console.log(fahrenheitToCelsius(98.6)); // 37
```

---

### Strings

---

**Assignment 11:** Write a program to count the number of vowels in a given string.

```javascript
function countVowels(str) {
  const vowels = "aeiouAEIOU";
  let count = 0;
  for (const char of str) {
    if (vowels.includes(char)) count++;
  }
  return count;
}

console.log(countVowels("Hello World"));    // 3
console.log(countVowels("JavaScript"));     // 3
```

---

**Assignment 12:** Write a program to reverse a string without using the built-in `reverse()` method.

```javascript
function reverseString(str) {
  let reversed = "";
  for (let i = str.length - 1; i >= 0; i--) {
    reversed += str[i];
  }
  return reversed;
}

console.log(reverseString("hello"));     // "olleh"
console.log(reverseString("JavaScript")); // "tpircSavaJ"
```

---

**Assignment 13:** Write a program to check if a string is a palindrome.

```javascript
function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  let left = 0, right = cleaned.length - 1;
  while (left < right) {
    if (cleaned[left] !== cleaned[right]) return false;
    left++;
    right--;
  }
  return true;
}

console.log(isPalindrome("racecar"));       // true
console.log(isPalindrome("A man a plan a canal Panama")); // true
console.log(isPalindrome("hello"));         // false
```

---

**Assignment 14:** Write a program to capitalize the first letter of each word in a sentence.

```javascript
function capitalizeWords(sentence) {
  return sentence
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

console.log(capitalizeWords("hello world from javascript")); 
// "Hello World From Javascript"
```

---

**Assignment 15:** Write a program to count the number of words in a sentence.

```javascript
function countWords(sentence) {
  return sentence.trim().split(/\s+/).filter(word => word.length > 0).length;
}

console.log(countWords("Hello World"));            // 2
console.log(countWords("  This has   extra spaces  ")); // 4
```

---

**Assignment 16:** Write a program that removes all whitespace from a string.

```javascript
function removeWhitespace(str) {
  return str.replace(/\s/g, "");
}

console.log(removeWhitespace("Hello World"));       // "HelloWorld"
console.log(removeWhitespace("  J a v a  "));       // "Java"
```

---

**Assignment 17:** Write a program to find the longest word in a sentence.

```javascript
function longestWord(sentence) {
  const words = sentence.split(" ");
  let longest = "";
  for (const word of words) {
    if (word.length > longest.length) longest = word;
  }
  return longest;
}

console.log(longestWord("The quick brown fox jumps")); // "jumps" (or "quick"/"brown" - tied at 5)
console.log(longestWord("JavaScript is amazing"));     // "JavaScript"
```

---

**Assignment 18:** Write a program to replace all occurrences of a character in a string with another character.

```javascript
function replaceChar(str, target, replacement) {
  return str.split(target).join(replacement);
}

console.log(replaceChar("hello world", "o", "0")); // "hell0 w0rld"
console.log(replaceChar("banana", "a", "o"));      // "bonono"
```

---

**Assignment 19:** Write a program to truncate a string to a specified length and add "..." at the end.

```javascript
function truncate(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

console.log(truncate("Hello World", 5));        // "Hello..."
console.log(truncate("Hi", 10));                // "Hi"
```

---

**Assignment 20:** Write a program to check if a string contains a specific substring.

```javascript
function containsSubstring(str, sub) {
  return str.includes(sub);
}

console.log(containsSubstring("JavaScript is fun", "Script")); // true
console.log(containsSubstring("Hello World", "world"));        // false (case-sensitive)
```

---

### Conditionals & Loops

---

**Assignment 21:** Write a program to print the multiplication table for a given number.

```javascript
function multiplicationTable(num) {
  for (let i = 1; i <= 10; i++) {
    console.log(`${num} x ${i} = ${num * i}`);
  }
}

multiplicationTable(5);
// 5 x 1 = 5, 5 x 2 = 10, ... 5 x 10 = 50
```

---

**Assignment 22:** Write a program to calculate the factorial of a number using a loop.

```javascript
function factorial(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

console.log(factorial(5));  // 120
console.log(factorial(0));  // 1
console.log(factorial(10)); // 3628800
```

---

**Assignment 23:** Write a program to print the Fibonacci sequence up to n terms.

```javascript
function fibonacci(n) {
  const seq = [0, 1];
  for (let i = 2; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
  }
  return seq.slice(0, n);
}

console.log(fibonacci(8)); // [0, 1, 1, 2, 3, 5, 8, 13]
```

---

**Assignment 24:** Write a program to check if a number is prime.

```javascript
function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

console.log(isPrime(7));  // true
console.log(isPrime(10)); // false
console.log(isPrime(2));  // true
```

---

**Assignment 25:** Write a program to find the sum of all numbers from 1 to n.

```javascript
function sumToN(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
  // Formula: return n * (n + 1) / 2;
}

console.log(sumToN(10));  // 55
console.log(sumToN(100)); // 5050
```

---

**Assignment 26:** Write a program to print all even numbers between 1 and 100.

```javascript
function printEvenNumbers() {
  const evens = [];
  for (let i = 2; i <= 100; i += 2) {
    evens.push(i);
  }
  return evens;
}

console.log(printEvenNumbers()); // [2, 4, 6, 8, ..., 100]
```

---

**Assignment 27:** Write a program that uses a switch statement to print the day of the week based on a number (1–7).

```javascript
function getDayName(dayNum) {
  switch (dayNum) {
    case 1: return "Monday";
    case 2: return "Tuesday";
    case 3: return "Wednesday";
    case 4: return "Thursday";
    case 5: return "Friday";
    case 6: return "Saturday";
    case 7: return "Sunday";
    default: return "Invalid day number";
  }
}

console.log(getDayName(1)); // "Monday"
console.log(getDayName(5)); // "Friday"
```

---

**Assignment 28:** Write a program to find the GCD (Greatest Common Divisor) of two numbers.

```javascript
function gcd(a, b) {
  while (b !== 0) {
    let temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

console.log(gcd(12, 8));  // 4
console.log(gcd(54, 24)); // 6
```

---

**Assignment 29:** Write a program to print a right-angled triangle pattern of stars.

```javascript
function starTriangle(rows) {
  for (let i = 1; i <= rows; i++) {
    console.log("*".repeat(i));
  }
}

starTriangle(5);
// *
// **
// ***
// ****
// *****
```

---

**Assignment 30:** Write a program to count the number of digits in a given number.

```javascript
function countDigits(num) {
  return Math.abs(num).toString().length;
}

console.log(countDigits(12345)); // 5
console.log(countDigits(-987));  // 3
console.log(countDigits(0));     // 1
```

---

### Arrays

---

**Assignment 31:** Write a program to find the largest element in an array.

```javascript
function findLargest(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}

console.log(findLargest([3, 7, 2, 9, 1])); // 9
```

---

**Assignment 32:** Write a program to find the smallest element in an array.

```javascript
function findSmallest(arr) {
  let min = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < min) min = arr[i];
  }
  return min;
}

console.log(findSmallest([3, 7, 2, 9, 1])); // 1
```

---

**Assignment 33:** Write a program to reverse an array without using the built-in `reverse()` method.

```javascript
function reverseArray(arr) {
  const reversed = [];
  for (let i = arr.length - 1; i >= 0; i--) {
    reversed.push(arr[i]);
  }
  return reversed;
}

console.log(reverseArray([1, 2, 3, 4, 5])); // [5, 4, 3, 2, 1]
```

---

**Assignment 34:** Write a program to find the sum of all elements in an array.

```javascript
function sumArray(arr) {
  let sum = 0;
  for (const num of arr) {
    sum += num;
  }
  return sum;
}

console.log(sumArray([1, 2, 3, 4, 5])); // 15
```

---

**Assignment 35:** Write a program to remove duplicate values from an array.

```javascript
function removeDuplicates(arr) {
  return [...new Set(arr)];
}

console.log(removeDuplicates([1, 2, 2, 3, 4, 4, 5])); // [1, 2, 3, 4, 5]
console.log(removeDuplicates(["a", "b", "a", "c"]));   // ["a", "b", "c"]
```

---

**Assignment 36:** Write a program to merge two arrays and sort the result in ascending order.

```javascript
function mergeAndSort(arr1, arr2) {
  return [...arr1, ...arr2].sort((a, b) => a - b);
}

console.log(mergeAndSort([3, 1, 5], [4, 2, 6])); // [1, 2, 3, 4, 5, 6]
```

---

**Assignment 37:** Write a program to find the second largest number in an array.

```javascript
function secondLargest(arr) {
  let first = -Infinity, second = -Infinity;
  for (const num of arr) {
    if (num > first) {
      second = first;
      first = num;
    } else if (num > second && num !== first) {
      second = num;
    }
  }
  return second;
}

console.log(secondLargest([3, 7, 2, 9, 1])); // 7
```

---

**Assignment 38:** Write a program to check if an array contains a specific value.

```javascript
function containsValue(arr, value) {
  return arr.includes(value);
}

console.log(containsValue([1, 2, 3, 4], 3)); // true
console.log(containsValue([1, 2, 3, 4], 5)); // false
```

---

**Assignment 39:** Write a program to rotate an array to the left by one position.

```javascript
function rotateLeft(arr) {
  const first = arr[0];
  return [...arr.slice(1), first];
}

console.log(rotateLeft([1, 2, 3, 4, 5])); // [2, 3, 4, 5, 1]
```

---

**Assignment 40:** Write a program to find the average of all numbers in an array.

```javascript
function average(arr) {
  const sum = arr.reduce((acc, num) => acc + num, 0);
  return sum / arr.length;
}

console.log(average([10, 20, 30, 40, 50])); // 30
```

---

### Functions

---

**Assignment 41:** Write a function that takes two numbers and returns their sum.

```javascript
function add(a, b) {
  return a + b;
}

console.log(add(3, 5));    // 8
console.log(add(-1, 10));  // 9
```

---

**Assignment 42:** Write a function that checks whether a year is a leap year.

```javascript
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

console.log(isLeapYear(2024)); // true
console.log(isLeapYear(2023)); // false
console.log(isLeapYear(2000)); // true
console.log(isLeapYear(1900)); // false
```

---

**Assignment 43:** Write a function that returns the power of a number (base^exponent) without using `Math.pow()`.

```javascript
function power(base, exponent) {
  let result = 1;
  for (let i = 0; i < Math.abs(exponent); i++) {
    result *= base;
  }
  return exponent < 0 ? 1 / result : result;
}

console.log(power(2, 10));  // 1024
console.log(power(5, 3));   // 125
console.log(power(2, -3));  // 0.125
```

---

**Assignment 44:** Write a function that returns the absolute value of a number without using `Math.abs()`.

```javascript
function absoluteValue(num) {
  return num < 0 ? -num : num;
}

console.log(absoluteValue(-5));  // 5
console.log(absoluteValue(10));  // 10
console.log(absoluteValue(0));   // 0
```

---

**Assignment 45:** Write an arrow function that takes an array and returns a new array with each element doubled.

```javascript
const doubleArray = (arr) => arr.map(num => num * 2);

console.log(doubleArray([1, 2, 3, 4]));  // [2, 4, 6, 8]
console.log(doubleArray([10, 20, 30]));  // [20, 40, 60]
```

---

**Assignment 46:** Write a function that accepts any number of arguments and returns their sum (use rest parameters).

```javascript
function sumAll(...numbers) {
  return numbers.reduce((acc, num) => acc + num, 0);
}

console.log(sumAll(1, 2, 3));       // 6
console.log(sumAll(10, 20, 30, 40)); // 100
```

---

**Assignment 47:** Write a function that returns a greeting message with a default parameter for the name.

```javascript
function greet(name = "Guest") {
  return `Hello, ${name}! Welcome aboard.`;
}

console.log(greet("Alice")); // "Hello, Alice! Welcome aboard."
console.log(greet());        // "Hello, Guest! Welcome aboard."
```

---

**Assignment 48:** Write a function to count the occurrences of a specific character in a string.

```javascript
function countChar(str, char) {
  let count = 0;
  for (const c of str) {
    if (c === char) count++;
  }
  return count;
}

console.log(countChar("hello world", "l")); // 3
console.log(countChar("banana", "a"));      // 3
```

---

**Assignment 49:** Write a function that converts minutes into hours and minutes format.

```javascript
function convertMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

console.log(convertMinutes(135)); // "2h 15m"
console.log(convertMinutes(60));  // "1h 0m"
console.log(convertMinutes(45));  // "0h 45m"
```

---

**Assignment 50:** Write a function that generates a random integer between a given min and max value.

```javascript
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

console.log(randomInt(1, 10));   // Random number between 1-10
console.log(randomInt(50, 100)); // Random number between 50-100
```

---

### Objects

---

**Assignment 51:** Create an object representing a book with properties: title, author, pages, and a method that returns a summary string.

```javascript
const book = {
  title: "JavaScript: The Good Parts",
  author: "Douglas Crockford",
  pages: 176,
  summary() {
    return `"${this.title}" by ${this.author}, ${this.pages} pages.`;
  }
};

console.log(book.summary());
// "JavaScript: The Good Parts" by Douglas Crockford, 176 pages.
```

---

**Assignment 52:** Write a program to list all keys and values of an object.

```javascript
const person = { name: "Alice", age: 30, city: "Paris" };

Object.keys(person).forEach(key => {
  console.log(`${key}: ${person[key]}`);
});
// name: Alice
// age: 30
// city: Paris
```

---

**Assignment 53:** Write a program to merge two objects into one.

```javascript
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };
const merged = { ...obj1, ...obj2 };

console.log(merged); // { a: 1, b: 2, c: 3, d: 4 }
```

---

**Assignment 54:** Write a program to check if a given key exists in an object.

```javascript
function hasKey(obj, key) {
  return key in obj;
  // or: return obj.hasOwnProperty(key);
}

const user = { name: "Alice", age: 25 };
console.log(hasKey(user, "name")); // true
console.log(hasKey(user, "email")); // false
```

---

**Assignment 55:** Write a program to count the number of properties in an object.

```javascript
function countProperties(obj) {
  return Object.keys(obj).length;
}

console.log(countProperties({ a: 1, b: 2, c: 3 })); // 3
console.log(countProperties({}));                      // 0
```

---

**Assignment 56:** Create an array of student objects with name and grade properties. Write a function to find the student with the highest grade.

```javascript
function topStudent(students) {
  return students.reduce((top, student) => 
    student.grade > top.grade ? student : top
  );
}

const students = [
  { name: "Alice", grade: 92 },
  { name: "Bob", grade: 88 },
  { name: "Charlie", grade: 95 },
  { name: "Diana", grade: 90 }
];

console.log(topStudent(students)); // { name: "Charlie", grade: 95 }
```

---

**Assignment 57:** Write a program to create a shallow copy of an object using the spread operator.

```javascript
const original = { name: "Alice", scores: [90, 85, 88] };
const copy = { ...original };

copy.name = "Bob";
console.log(original.name); // "Alice" (unchanged)
console.log(copy.name);     // "Bob"

// Note: nested arrays/objects are still shared (shallow copy)
copy.scores.push(100);
console.log(original.scores); // [90, 85, 88, 100] (shared reference!)
```

---

**Assignment 58:** Write a program to convert an object into an array of key-value pairs.

```javascript
const obj = { name: "Alice", age: 25, city: "NYC" };
const pairs = Object.entries(obj);

console.log(pairs);
// [["name", "Alice"], ["age", 25], ["city", "NYC"]]
```

---

**Assignment 59:** Write a program to freeze an object and demonstrate that its properties cannot be changed.

```javascript
const config = { theme: "dark", language: "en" };
Object.freeze(config);

config.theme = "light";      // Silently fails (or throws in strict mode)
config.newProp = "value";    // Silently fails
delete config.language;      // Silently fails

console.log(config); // { theme: "dark", language: "en" }
```

---

**Assignment 60:** Write a program to destructure an object and log individual properties.

```javascript
const user = { 
  name: "Alice", 
  age: 25, 
  address: { city: "NYC", zip: "10001" } 
};

const { name, age, address: { city, zip } } = user;
console.log(name);  // "Alice"
console.log(age);   // 25
console.log(city);  // "NYC"
console.log(zip);   // "10001"
```

---

### DOM Basics & Miscellaneous

---

**Assignment 61:** Write a program using `setTimeout` that prints "Hello" after 3 seconds.

```javascript
console.log("Waiting...");
setTimeout(() => {
  console.log("Hello");
}, 3000);
```

---

**Assignment 62:** Write a program using `setInterval` that prints the current time every second. Stop it after 5 seconds.

```javascript
const intervalId = setInterval(() => {
  console.log(new Date().toLocaleTimeString());
}, 1000);

setTimeout(() => {
  clearInterval(intervalId);
  console.log("Stopped!");
}, 5000);
```

---

**Assignment 63:** Write a program that uses `typeof` to check the data types of different values.

```javascript
console.log(typeof 42);            // "number"
console.log(typeof "hello");       // "string"
console.log(typeof true);          // "boolean"
console.log(typeof undefined);     // "undefined"
console.log(typeof null);          // "object" (known JS quirk)
console.log(typeof {});            // "object"
console.log(typeof []);            // "object"
console.log(typeof function(){}); // "function"
console.log(typeof Symbol());      // "symbol"
```

---

**Assignment 64:** Write a program to demonstrate the difference between `==` and `===`.

```javascript
console.log(5 == "5");     // true  (type coercion)
console.log(5 === "5");    // false (strict comparison)

console.log(null == undefined);  // true
console.log(null === undefined); // false

console.log(0 == false);   // true
console.log(0 === false);  // false

console.log("" == false);  // true
console.log("" === false); // false
```

---

**Assignment 65:** Write a program to convert a string to a number and a number to a string.

```javascript
// String to Number
console.log(Number("42"));        // 42
console.log(parseInt("42px"));    // 42
console.log(parseFloat("3.14"));  // 3.14
console.log(+"100");              // 100

// Number to String
console.log(String(42));          // "42"
console.log((42).toString());     // "42"
console.log(42 + "");             // "42"
```

---

**Assignment 66:** Write a program that uses template literals to format a multi-line string.

```javascript
const name = "Alice";
const items = ["Laptop", "Mouse", "Keyboard"];

const message = `
Dear ${name},

Your order includes:
${items.map((item, i) => `  ${i + 1}. ${item}`).join("\n")}

Total items: ${items.length}
Thank you for your purchase!
`;

console.log(message);
```

---

**Assignment 67:** Write a program to generate a random hex color code.

```javascript
function randomHexColor() {
  const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16);
  return `#${hex.padStart(6, "0")}`;
}

console.log(randomHexColor()); // e.g., "#a3f2b1"
console.log(randomHexColor()); // e.g., "#ff09c4"
```

---

**Assignment 68:** Write a program using ternary operators to assign a grade based on a score.

```javascript
function getGrade(score) {
  return score >= 90 ? "A"
       : score >= 80 ? "B"
       : score >= 70 ? "C"
       : score >= 60 ? "D"
       : "F";
}

console.log(getGrade(95)); // "A"
console.log(getGrade(73)); // "C"
console.log(getGrade(58)); // "F"
```

---

**Assignment 69:** Write a program that demonstrates short-circuit evaluation with `&&` and `||`.

```javascript
// || returns the first truthy value
console.log(0 || "" || "hello" || "world"); // "hello"
console.log(null || undefined || 42);        // 42

// && returns the first falsy value (or last if all truthy)
console.log(1 && 2 && 3);          // 3
console.log(1 && 0 && 3);          // 0
console.log("hello" && "world");   // "world"

// Practical usage
const user = null;
const name = user && user.name; // null (doesn't throw error)
const displayName = name || "Anonymous"; // "Anonymous"
console.log(displayName);
```

---

**Assignment 70:** Write a program to validate if an email string contains "@" and "." using basic string methods.

```javascript
function isValidEmail(email) {
  const atIndex = email.indexOf("@");
  const dotIndex = email.lastIndexOf(".");
  return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < email.length - 1;
}

console.log(isValidEmail("user@example.com"));  // true
console.log(isValidEmail("invalid-email"));      // false
console.log(isValidEmail("@example.com"));       // false
console.log(isValidEmail("user@.com"));          // false
```

---

## 🟡 INTERMEDIATE LEVEL (Assignments 71–140)

### Array Higher-Order Methods

---

**Assignment 71:** Use `map()` to convert an array of temperatures in Celsius to Fahrenheit.

```javascript
const celsius = [0, 20, 30, 37, 100];
const fahrenheit = celsius.map(temp => (temp * 9/5) + 32);

console.log(fahrenheit); // [32, 68, 86, 98.6, 212]
```

---

**Assignment 72:** Use `filter()` to get all numbers greater than 10 from an array.

```javascript
const numbers = [5, 12, 8, 130, 44, 3, 10, 15];
const filtered = numbers.filter(num => num > 10);

console.log(filtered); // [12, 130, 44, 15]
```

---

**Assignment 73:** Use `reduce()` to find the product of all elements in an array.

```javascript
const numbers = [1, 2, 3, 4, 5];
const product = numbers.reduce((acc, num) => acc * num, 1);

console.log(product); // 120
```

---

**Assignment 74:** Use `find()` to locate the first object in an array where age is greater than 25.

```javascript
const people = [
  { name: "Alice", age: 22 },
  { name: "Bob", age: 28 },
  { name: "Charlie", age: 30 },
];

const found = people.find(person => person.age > 25);
console.log(found); // { name: "Bob", age: 28 }
```

---

**Assignment 75:** Use `some()` and `every()` to check if an array contains negative numbers and if all numbers are positive.

```javascript
const nums = [1, -2, 3, 4, -5];

console.log(nums.some(n => n < 0));  // true (some are negative)
console.log(nums.every(n => n > 0)); // false (not all are positive)

const positiveNums = [1, 2, 3, 4];
console.log(positiveNums.every(n => n > 0)); // true
```

---

**Assignment 76:** Use `sort()` to sort an array of objects by a specific property (e.g., price).

```javascript
const products = [
  { name: "Laptop", price: 999 },
  { name: "Phone", price: 699 },
  { name: "Tablet", price: 499 },
  { name: "Watch", price: 299 },
];

const sorted = [...products].sort((a, b) => a.price - b.price);
console.log(sorted);
// [{Watch: 299}, {Tablet: 499}, {Phone: 699}, {Laptop: 999}]
```

---

**Assignment 77:** Use `flatMap()` to flatten and transform a nested array of sentences into an array of words.

```javascript
const sentences = ["Hello world", "How are you", "JavaScript is fun"];
const words = sentences.flatMap(sentence => sentence.split(" "));

console.log(words); 
// ["Hello", "world", "How", "are", "you", "JavaScript", "is", "fun"]
```

---

**Assignment 78:** Chain `filter()`, `map()`, and `reduce()` to find the total price of all items over $20 with a 10% discount.

```javascript
const items = [
  { name: "Shirt", price: 25 },
  { name: "Socks", price: 10 },
  { name: "Jacket", price: 60 },
  { name: "Cap", price: 15 },
  { name: "Shoes", price: 80 },
];

const total = items
  .filter(item => item.price > 20)
  .map(item => item.price * 0.9)
  .reduce((sum, price) => sum + price, 0);

console.log(total); // (25 + 60 + 80) * 0.9 = 148.5
```

---

**Assignment 79:** Write a function that groups an array of objects by a given property using `reduce()`.

```javascript
function groupBy(arr, key) {
  return arr.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
}

const people = [
  { name: "Alice", dept: "Engineering" },
  { name: "Bob", dept: "Marketing" },
  { name: "Charlie", dept: "Engineering" },
  { name: "Diana", dept: "Marketing" },
];

console.log(groupBy(people, "dept"));
// { Engineering: [{Alice}, {Charlie}], Marketing: [{Bob}, {Diana}] }
```

---

**Assignment 80:** Use `map()` and `filter()` to extract and uppercase only the names longer than 4 characters from an array of names.

```javascript
const names = ["Al", "Alice", "Bob", "Charlie", "Diana", "Ed"];
const result = names
  .filter(name => name.length > 4)
  .map(name => name.toUpperCase());

console.log(result); // ["ALICE", "CHARLIE", "DIANA"]
```

---

### Closures & Scope

---

**Assignment 81:** Write a function that returns a counter function using closures. Each call increments and returns the count.

```javascript
function createCounter() {
  let count = 0;
  return {
    increment() { return ++count; },
    decrement() { return --count; },
    getCount() { return count; }
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.decrement()); // 1
console.log(counter.getCount());  // 1
```

---

**Assignment 82:** Write a function that creates a private variable accessible only through getter and setter functions using closures.

```javascript
function createSecret(initialValue) {
  let secret = initialValue;
  return {
    getSecret() { return secret; },
    setSecret(newValue) {
      if (typeof newValue === "string" && newValue.length > 0) {
        secret = newValue;
      } else {
        throw new Error("Secret must be a non-empty string");
      }
    }
  };
}

const mySecret = createSecret("password123");
console.log(mySecret.getSecret()); // "password123"
mySecret.setSecret("newSecret");
console.log(mySecret.getSecret()); // "newSecret"
```

---

**Assignment 83:** Demonstrate the difference between `var`, `let`, and `const` in a loop with `setTimeout`.

```javascript
// var — all print 3 because var is function-scoped
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var:", i), 100);
}
// Output: var: 3, var: 3, var: 3

// let — prints 0, 1, 2 because let is block-scoped
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log("let:", j), 100);
}
// Output: let: 0, let: 1, let: 2
```

---

**Assignment 84:** Write a function that generates unique ID strings using a closure to keep track of the count.

```javascript
function createIdGenerator(prefix = "id") {
  let count = 0;
  return () => `${prefix}_${++count}`;
}

const generateId = createIdGenerator("user");
console.log(generateId()); // "user_1"
console.log(generateId()); // "user_2"
console.log(generateId()); // "user_3"

const generateOrderId = createIdGenerator("order");
console.log(generateOrderId()); // "order_1"
```

---

**Assignment 85:** Write a memoization function that caches results of expensive function calls.

```javascript
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log("From cache");
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const expensiveAdd = memoize((a, b) => {
  console.log("Computing...");
  return a + b;
});

console.log(expensiveAdd(1, 2)); // Computing... 3
console.log(expensiveAdd(1, 2)); // From cache 3
console.log(expensiveAdd(3, 4)); // Computing... 7
```

---

### Async Programming

---

**Assignment 86:** Write a function that simulates an API call using a Promise that resolves after 2 seconds.

```javascript
function fakeApiCall(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: 200, data });
    }, 2000);
  });
}

fakeApiCall({ name: "Alice" }).then(response => {
  console.log(response); // { status: 200, data: { name: "Alice" } }
});
```

---

**Assignment 87:** Write an async function that fetches data from a public API and logs the result.

```javascript
async function fetchUser() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
    const user = await response.json();
    console.log(`Name: ${user.name}, Email: ${user.email}`);
  } catch (error) {
    console.error("Fetch failed:", error.message);
  }
}

fetchUser();
```

---

**Assignment 88:** Write a program that uses `Promise.all()` to make three API calls simultaneously.

```javascript
async function fetchMultiple() {
  try {
    const [users, posts, comments] = await Promise.all([
      fetch("https://jsonplaceholder.typicode.com/users").then(r => r.json()),
      fetch("https://jsonplaceholder.typicode.com/posts?_limit=5").then(r => r.json()),
      fetch("https://jsonplaceholder.typicode.com/comments?_limit=5").then(r => r.json()),
    ]);
    console.log(`Users: ${users.length}, Posts: ${posts.length}, Comments: ${comments.length}`);
  } catch (error) {
    console.error("One or more requests failed:", error);
  }
}

fetchMultiple();
```

---

**Assignment 89:** Write a program that uses `Promise.race()` with two promises of different delays.

```javascript
const slow = new Promise(resolve => setTimeout(() => resolve("Slow (3s)"), 3000));
const fast = new Promise(resolve => setTimeout(() => resolve("Fast (1s)"), 1000));

Promise.race([slow, fast]).then(result => {
  console.log(`Winner: ${result}`); // "Winner: Fast (1s)"
});
```

---

**Assignment 90:** Write a function that retries a failing async operation up to 3 times before rejecting.

```javascript
async function retry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`Attempt ${i + 1} failed: ${error.message}`);
      if (i === retries - 1) throw error;
    }
  }
}

// Test with a function that fails randomly
let attempt = 0;
const unreliable = () => new Promise((resolve, reject) => {
  attempt++;
  attempt < 3 ? reject(new Error("Failed!")) : resolve("Success!");
});

retry(unreliable).then(console.log).catch(console.error);
```

---

**Assignment 91:** Create a promise chain that simulates three sequential tasks.

```javascript
function fetchUser(id) {
  return new Promise(resolve => 
    setTimeout(() => resolve({ id, name: "Alice" }), 500)
  );
}

function fetchPosts(userId) {
  return new Promise(resolve => 
    setTimeout(() => resolve([{ id: 1, title: "Post 1", userId }]), 500)
  );
}

function fetchComments(postId) {
  return new Promise(resolve => 
    setTimeout(() => resolve([{ id: 1, text: "Great!", postId }]), 500)
  );
}

fetchUser(1)
  .then(user => { console.log("User:", user); return fetchPosts(user.id); })
  .then(posts => { console.log("Posts:", posts); return fetchComments(posts[0].id); })
  .then(comments => console.log("Comments:", comments));
```

---

**Assignment 92:** Write an async function with proper `try...catch` error handling for a failed fetch request.

```javascript
async function safeFetch(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Usage
const result = await safeFetch("https://jsonplaceholder.typicode.com/invalid");
if (!result.success) {
  console.log("Error:", result.error);
}
```

---

**Assignment 93:** Write a function that uses `Promise.allSettled()` to handle multiple promises where some may fail.

```javascript
async function fetchAll() {
  const promises = [
    fetch("https://jsonplaceholder.typicode.com/users/1").then(r => r.json()),
    Promise.reject(new Error("Network error")),
    fetch("https://jsonplaceholder.typicode.com/users/2").then(r => r.json()),
  ];

  const results = await Promise.allSettled(promises);
  
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      console.log(`Promise ${index}: Success`, result.value.name || result.value);
    } else {
      console.log(`Promise ${index}: Failed`, result.reason.message);
    }
  });
}

fetchAll();
```

---

**Assignment 94:** Build a simple loading state manager that shows "Loading..." while a promise resolves.

```javascript
async function withLoading(asyncFn) {
  console.log("Loading...");
  try {
    const result = await asyncFn();
    console.log("Complete!");
    return result;
  } catch (error) {
    console.log("Error!");
    throw error;
  } finally {
    console.log("Loading finished.");
  }
}

withLoading(() => new Promise(resolve => 
  setTimeout(() => resolve("Data loaded!"), 2000)
)).then(console.log);
```

---

**Assignment 95:** Write a function that implements a delay/sleep utility using Promises.

```javascript
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
  console.log("Start");
  await sleep(1000);
  console.log("After 1 second");
  await sleep(2000);
  console.log("After 3 seconds total");
}

demo();
```

---

### Error Handling

---

**Assignment 96:** Write a function that throws a custom error if a number is negative, and handle it with `try...catch`.

```javascript
function squareRoot(num) {
  if (num < 0) {
    throw new Error("Cannot compute square root of a negative number");
  }
  return Math.sqrt(num);
}

try {
  console.log(squareRoot(16));  // 4
  console.log(squareRoot(-4));  // throws error
} catch (error) {
  console.error("Error:", error.message);
}
```

---

**Assignment 97:** Create a custom Error class called `ValidationError` with a custom message and error code.

```javascript
class ValidationError extends Error {
  constructor(message, field, code) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
    this.code = code;
  }
}

function validateAge(age) {
  if (typeof age !== "number") {
    throw new ValidationError("Age must be a number", "age", "INVALID_TYPE");
  }
  if (age < 0 || age > 150) {
    throw new ValidationError("Age must be between 0 and 150", "age", "OUT_OF_RANGE");
  }
  return true;
}

try {
  validateAge("twenty");
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`${error.name} [${error.code}]: ${error.message} (field: ${error.field})`);
  }
}
```

---

**Assignment 98:** Write a program that demonstrates the `finally` block executing regardless of success or failure.

```javascript
function divideNumbers(a, b) {
  try {
    if (b === 0) throw new Error("Division by zero");
    const result = a / b;
    console.log(`Result: ${result}`);
    return result;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return null;
  } finally {
    console.log("Operation complete (finally always runs)");
  }
}

divideNumbers(10, 2);  // Result: 5, then "Operation complete..."
divideNumbers(10, 0);  // Error: Division by zero, then "Operation complete..."
```

---

**Assignment 99:** Write a function that validates user input (name, email, age) and throws specific errors for each invalid field.

```javascript
function validateUser({ name, email, age }) {
  const errors = [];
  
  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  }
  if (!email || !email.includes("@") || !email.includes(".")) {
    errors.push("Invalid email format");
  }
  if (typeof age !== "number" || age < 0 || age > 150) {
    errors.push("Age must be a number between 0 and 150");
  }
  
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join("; ")}`);
  }
  return true;
}

try {
  validateUser({ name: "A", email: "invalid", age: -5 });
} catch (error) {
  console.error(error.message);
}
```

---

**Assignment 100:** Write a wrapper function that catches errors from any function passed to it and returns a default value.

```javascript
function tryCatch(fn, defaultValue = null) {
  try {
    return fn();
  } catch (error) {
    console.warn(`Caught error: ${error.message}`);
    return defaultValue;
  }
}

const result1 = tryCatch(() => JSON.parse('{"valid": true}'), {});
console.log(result1); // { valid: true }

const result2 = tryCatch(() => JSON.parse('invalid json'), {});
console.log(result2); // {} (default value)
```

---

### ES6+ Features

---

**Assignment 101:** Use destructuring to swap two variables in a single line.

```javascript
let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b); // 2 1
```

---

**Assignment 102:** Write a function that uses the spread operator to merge multiple arrays and remove duplicates.

```javascript
function mergeUnique(...arrays) {
  return [...new Set(arrays.flat())];
}

console.log(mergeUnique([1, 2, 3], [3, 4, 5], [5, 6, 1]));
// [1, 2, 3, 4, 5, 6]
```

---

**Assignment 103:** Use `Object.entries()` and `map()` to transform an object's values.

```javascript
const prices = { apple: 1.5, banana: 0.75, cherry: 3.0 };
const doubled = Object.fromEntries(
  Object.entries(prices).map(([key, value]) => [key, value * 2])
);

console.log(doubled); // { apple: 3, banana: 1.5, cherry: 6 }
```

---

**Assignment 104:** Write a program using `for...of` to iterate over a Map and a Set.

```javascript
// Map
const userMap = new Map([
  ["alice", 25],
  ["bob", 30],
  ["charlie", 35],
]);

for (const [name, age] of userMap) {
  console.log(`${name} is ${age} years old`);
}

// Set
const uniqueColors = new Set(["red", "blue", "green", "red", "blue"]);
for (const color of uniqueColors) {
  console.log(color); // red, blue, green
}
```

---

**Assignment 105:** Use optional chaining (`?.`) to safely access deeply nested object properties.

```javascript
const user = {
  name: "Alice",
  address: {
    street: "123 Main St",
    city: "NYC"
  }
};

console.log(user?.address?.city);     // "NYC"
console.log(user?.address?.zip);      // undefined
console.log(user?.phone?.number);     // undefined (no error!)
console.log(user?.getName?.());       // undefined (safe method call)
```

---

**Assignment 106:** Write a program that uses the nullish coalescing operator (`??`) vs the OR operator (`||`) and explain the difference.

```javascript
const value1 = 0;
const value2 = "";
const value3 = null;
const value4 = undefined;

// || returns first TRUTHY value (treats 0 and "" as falsy)
console.log(value1 || "default"); // "default"
console.log(value2 || "default"); // "default"

// ?? returns first NON-NULLISH value (only null/undefined are nullish)
console.log(value1 ?? "default"); // 0
console.log(value2 ?? "default"); // ""
console.log(value3 ?? "default"); // "default"
console.log(value4 ?? "default"); // "default"
```

---

**Assignment 107:** Use `Symbol` to create private-like properties on an object.

```javascript
const _id = Symbol("id");
const _secret = Symbol("secret");

const user = {
  name: "Alice",
  [_id]: 12345,
  [_secret]: "password123",
};

console.log(user.name);      // "Alice"
console.log(user[_id]);      // 12345
console.log(Object.keys(user));              // ["name"] — symbols hidden
console.log(Object.getOwnPropertySymbols(user)); // [Symbol(id), Symbol(secret)]
```

---

**Assignment 108:** Write a generator function that yields the Fibonacci sequence indefinitely.

```javascript
function* fibonacciGenerator() {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const fib = fibonacciGenerator();
for (let i = 0; i < 10; i++) {
  console.log(fib.next().value);
}
// 0, 1, 1, 2, 3, 5, 8, 13, 21, 34
```

---

**Assignment 109:** Use tagged template literals to create a simple HTML escaping function.

```javascript
function safeHtml(strings, ...values) {
  const escape = (str) => String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] !== undefined ? escape(values[i]) : "");
  }, "");
}

const userInput = '<script>alert("xss")</script>';
const html = safeHtml`<div class="content">${userInput}</div>`;
console.log(html);
// <div class="content">&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</div>
```

---

**Assignment 110:** Write a program that uses `WeakMap` to associate private data with objects.

```javascript
const privateData = new WeakMap();

class Person {
  constructor(name, age) {
    privateData.set(this, { name, age });
  }
  
  getName() { return privateData.get(this).name; }
  getAge() { return privateData.get(this).age; }
  
  greet() {
    const { name, age } = privateData.get(this);
    return `Hi, I'm ${name}, ${age} years old.`;
  }
}

const alice = new Person("Alice", 25);
console.log(alice.greet());    // "Hi, I'm Alice, 25 years old."
console.log(alice.name);       // undefined (private!)
console.log(alice.getName());  // "Alice"
```

---

### OOP & Prototypes

---

**Assignment 111:** Create a `Car` class with properties and a method. Create instances and call the method.

```javascript
class Car {
  constructor(make, model, year) {
    this.make = make;
    this.model = model;
    this.year = year;
    this.speed = 0;
  }

  accelerate(amount) {
    this.speed += amount;
    return `${this.make} ${this.model} is going ${this.speed} km/h`;
  }

  brake() {
    this.speed = Math.max(0, this.speed - 20);
    return `Speed reduced to ${this.speed} km/h`;
  }
}

const car1 = new Car("Toyota", "Corolla", 2023);
console.log(car1.accelerate(50)); // "Toyota Corolla is going 50 km/h"
console.log(car1.accelerate(30)); // "Toyota Corolla is going 80 km/h"
console.log(car1.brake());        // "Speed reduced to 60 km/h"
```

---

**Assignment 112:** Create an `Animal` class and extend it with `Dog` and `Cat` classes that override a `speak()` method.

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} makes a sound.`;
  }
}

class Dog extends Animal {
  speak() {
    return `${this.name} barks: Woof!`;
  }
}

class Cat extends Animal {
  speak() {
    return `${this.name} meows: Meow!`;
  }
}

const dog = new Dog("Rex");
const cat = new Cat("Whiskers");
console.log(dog.speak()); // "Rex barks: Woof!"
console.log(cat.speak()); // "Whiskers meows: Meow!"
```

---

**Assignment 113:** Use `static` methods in a class to create a utility method that doesn't require instantiation.

```javascript
class MathUtils {
  static add(a, b) { return a + b; }
  static multiply(a, b) { return a * b; }
  static factorial(n) {
    if (n <= 1) return 1;
    return n * MathUtils.factorial(n - 1);
  }
  static isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) return false;
    }
    return true;
  }
}

console.log(MathUtils.add(5, 3));        // 8
console.log(MathUtils.factorial(5));      // 120
console.log(MathUtils.isPrime(17));       // true
```

---

**Assignment 114:** Implement getters and setters in a class to validate property values.

```javascript
class Temperature {
  #celsius;
  
  constructor(celsius) {
    this.celsius = celsius;
  }
  
  get celsius() { return this.#celsius; }
  
  set celsius(value) {
    if (typeof value !== "number") throw new TypeError("Temperature must be a number");
    if (value < -273.15) throw new RangeError("Temperature below absolute zero");
    this.#celsius = value;
  }
  
  get fahrenheit() { return (this.#celsius * 9/5) + 32; }
  
  set fahrenheit(value) {
    this.celsius = (value - 32) * 5/9;
  }
}

const temp = new Temperature(100);
console.log(temp.fahrenheit); // 212
temp.fahrenheit = 32;
console.log(temp.celsius);   // 0
```

---

**Assignment 115:** Write a class that uses `#` private fields and provides public methods to access them.

```javascript
class BankAccount {
  #balance;
  #owner;

  constructor(owner, initialBalance = 0) {
    this.#owner = owner;
    this.#balance = initialBalance;
  }

  deposit(amount) {
    if (amount <= 0) throw new Error("Deposit must be positive");
    this.#balance += amount;
    return `Deposited $${amount}. Balance: $${this.#balance}`;
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new Error("Insufficient funds");
    this.#balance -= amount;
    return `Withdrew $${amount}. Balance: $${this.#balance}`;
  }

  getBalance() { return this.#balance; }
  getOwner() { return this.#owner; }
}

const account = new BankAccount("Alice", 100);
console.log(account.deposit(50));   // "Deposited $50. Balance: $150"
console.log(account.withdraw(30));  // "Withdrew $30. Balance: $120"
// console.log(account.#balance);   // SyntaxError: Private field
```

---

**Assignment 116:** Create a `Shape` base class. Extend it into `Circle` and `Rectangle` with their own `area()` methods.

```javascript
class Shape {
  constructor(name) {
    this.name = name;
  }
  area() {
    throw new Error("area() must be implemented");
  }
  toString() {
    return `${this.name}: area = ${this.area().toFixed(2)}`;
  }
}

class Circle extends Shape {
  constructor(radius) {
    super("Circle");
    this.radius = radius;
  }
  area() { return Math.PI * this.radius ** 2; }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super("Rectangle");
    this.width = width;
    this.height = height;
  }
  area() { return this.width * this.height; }
}

console.log(new Circle(5).toString());         // "Circle: area = 78.54"
console.log(new Rectangle(4, 6).toString());   // "Rectangle: area = 24.00"
```

---

**Assignment 117:** Demonstrate prototypal inheritance by adding a method to a constructor function's prototype.

```javascript
function Vehicle(type, speed) {
  this.type = type;
  this.speed = speed;
}

Vehicle.prototype.describe = function () {
  return `This ${this.type} goes ${this.speed} km/h.`;
};

Vehicle.prototype.isFast = function () {
  return this.speed > 100;
};

const car = new Vehicle("car", 120);
const bike = new Vehicle("bike", 60);

console.log(car.describe()); // "This car goes 120 km/h."
console.log(car.isFast());   // true
console.log(bike.isFast());  // false
```

---

**Assignment 118:** Use `Object.create()` to set up inheritance between two objects without classes.

```javascript
const animal = {
  init(name, sound) {
    this.name = name;
    this.sound = sound;
    return this;
  },
  speak() {
    return `${this.name} says ${this.sound}`;
  }
};

const dog = Object.create(animal);
dog.fetch = function (item) {
  return `${this.name} fetches the ${item}!`;
};

const myDog = Object.create(dog).init("Rex", "Woof");
console.log(myDog.speak());        // "Rex says Woof"
console.log(myDog.fetch("ball"));  // "Rex fetches the ball!"
console.log(Object.getPrototypeOf(myDog) === dog); // true
```

---

**Assignment 119:** Implement a `Singleton` pattern using a class with a static method.

```javascript
class Database {
  static #instance = null;
  
  constructor() {
    if (Database.#instance) {
      return Database.#instance;
    }
    this.connection = `Connected at ${Date.now()}`;
    Database.#instance = this;
  }
  
  static getInstance() {
    if (!Database.#instance) {
      new Database();
    }
    return Database.#instance;
  }
  
  query(sql) {
    return `Executing: ${sql} on ${this.connection}`;
  }
}

const db1 = Database.getInstance();
const db2 = Database.getInstance();
console.log(db1 === db2); // true (same instance)
console.log(db1.query("SELECT * FROM users"));
```

---

**Assignment 120:** Write a mixin function that adds shared methods to multiple classes.

```javascript
const Serializable = (superclass) => class extends superclass {
  toJSON() {
    return JSON.stringify(this);
  }
  static fromJSON(json) {
    return Object.assign(new this(), JSON.parse(json));
  }
};

const Timestamped = (superclass) => class extends superclass {
  constructor(...args) {
    super(...args);
    this.createdAt = new Date().toISOString();
  }
};

class BaseModel {}

class User extends Timestamped(Serializable(BaseModel)) {
  constructor(name, email) {
    super();
    this.name = name;
    this.email = email;
  }
}

const user = new User("Alice", "alice@example.com");
console.log(user.toJSON());      // JSON string with name, email, createdAt
console.log(user.createdAt);     // timestamp
```

---

### Intermediate DOM & Events

---

**Assignment 121:** Build a to-do list where users can add items, mark them done, and delete them using DOM manipulation.

```javascript
// HTML: <input id="todoInput"><button id="addBtn">Add</button><ul id="todoList"></ul>

const input = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("todoList");

addBtn.addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return;
  
  const li = document.createElement("li");
  li.innerHTML = `
    <span>${text}</span>
    <button class="done-btn">✓</button>
    <button class="del-btn">✕</button>
  `;
  
  li.querySelector(".done-btn").addEventListener("click", () => {
    li.querySelector("span").style.textDecoration = 
      li.querySelector("span").style.textDecoration === "line-through" ? "none" : "line-through";
  });
  
  li.querySelector(".del-btn").addEventListener("click", () => li.remove());
  
  list.appendChild(li);
  input.value = "";
});
```

---

**Assignment 122:** Build a character counter for a text area that updates in real-time as the user types.

```javascript
// HTML: <textarea id="textArea" maxlength="200"></textarea><p id="counter">0/200</p>

const textArea = document.getElementById("textArea");
const counter = document.getElementById("counter");
const maxLength = 200;

textArea.addEventListener("input", () => {
  const current = textArea.value.length;
  counter.textContent = `${current}/${maxLength}`;
  counter.style.color = current > maxLength * 0.9 ? "red" : "black";
});
```

---

**Assignment 123:** Create a dynamic dropdown filter that shows/hides list items based on the selected category.

```javascript
// HTML: <select id="filter"><option value="all">All</option>...</select>
//       <ul id="items"><li data-category="fruit">Apple</li>...</ul>

const filter = document.getElementById("filter");
const items = document.querySelectorAll("#items li");

filter.addEventListener("change", () => {
  const selected = filter.value;
  items.forEach(item => {
    item.style.display = 
      selected === "all" || item.dataset.category === selected ? "block" : "none";
  });
});
```

---

**Assignment 124:** Build a simple image carousel/slider with previous and next buttons.

```javascript
// HTML: <div id="carousel"><img id="slide"><button id="prev">◀</button><button id="next">▶</button></div>

const images = ["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg"];
let currentIndex = 0;

const slide = document.getElementById("slide");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

function updateSlide() {
  slide.src = images[currentIndex];
}

prevBtn.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  updateSlide();
});

nextBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % images.length;
  updateSlide();
});

updateSlide();
```

---

**Assignment 125:** Create a modal popup that opens on button click and closes when clicking outside or on a close button.

```javascript
// HTML: <button id="openModal">Open</button>
//       <div id="modal" class="modal hidden"><div class="modal-content">
//       <span id="closeModal">×</span><p>Modal Content</p></div></div>

const modal = document.getElementById("modal");
const openBtn = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");

openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") modal.classList.add("hidden");
});
```

---

**Assignment 126:** Implement event delegation: attach a single click handler to a parent `<ul>` that handles clicks on any `<li>`.

```javascript
const list = document.getElementById("myList");

list.addEventListener("click", (event) => {
  if (event.target.tagName === "LI") {
    event.target.classList.toggle("selected");
    console.log(`Clicked: ${event.target.textContent}`);
  }
});

// Adding new items still works without re-attaching events
const newItem = document.createElement("li");
newItem.textContent = "New Item";
list.appendChild(newItem);
```

---

**Assignment 127:** Build a form with real-time validation that shows error messages as the user types.

```javascript
const form = document.getElementById("myForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

function showError(input, message) {
  let errorEl = input.nextElementSibling;
  if (!errorEl || !errorEl.classList.contains("error")) {
    errorEl = document.createElement("span");
    errorEl.classList.add("error");
    input.after(errorEl);
  }
  errorEl.textContent = message;
  errorEl.style.color = "red";
}

function clearError(input) {
  const errorEl = input.nextElementSibling;
  if (errorEl && errorEl.classList.contains("error")) errorEl.textContent = "";
}

emailInput.addEventListener("input", () => {
  const value = emailInput.value;
  if (!value.includes("@") || !value.includes(".")) {
    showError(emailInput, "Enter a valid email");
  } else {
    clearError(emailInput);
  }
});

passwordInput.addEventListener("input", () => {
  if (passwordInput.value.length < 8) {
    showError(passwordInput, "Password must be at least 8 characters");
  } else {
    clearError(passwordInput);
  }
});
```

---

**Assignment 128:** Create a dark mode toggle that saves the preference to `localStorage`.

```javascript
const toggleBtn = document.getElementById("darkModeToggle");
const body = document.body;

// Load saved preference
if (localStorage.getItem("darkMode") === "true") {
  body.classList.add("dark-mode");
}

toggleBtn.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
  const isDark = body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDark);
  toggleBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
});
```

---

**Assignment 129:** Build a stopwatch with start, stop, and reset buttons.

```javascript
let time = 0;
let intervalId = null;
const display = document.getElementById("display");

function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

document.getElementById("start").addEventListener("click", () => {
  if (!intervalId) {
    intervalId = setInterval(() => {
      time += 10;
      display.textContent = formatTime(time);
    }, 10);
  }
});

document.getElementById("stop").addEventListener("click", () => {
  clearInterval(intervalId);
  intervalId = null;
});

document.getElementById("reset").addEventListener("click", () => {
  clearInterval(intervalId);
  intervalId = null;
  time = 0;
  display.textContent = "00:00.00";
});
```

---

**Assignment 130:** Create a drag-and-drop interface to reorder list items.

```javascript
const list = document.getElementById("sortableList");

list.querySelectorAll("li").forEach(item => {
  item.draggable = true;
  
  item.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", item.id);
    item.classList.add("dragging");
  });
  
  item.addEventListener("dragend", () => {
    item.classList.remove("dragging");
  });
  
  item.addEventListener("dragover", (e) => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    if (dragging !== item) {
      const rect = item.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) {
        list.insertBefore(dragging, item);
      } else {
        list.insertBefore(dragging, item.nextSibling);
      }
    }
  });
});
```

---

### Data Structures & Algorithms

---

**Assignment 131:** Implement a Stack class with `push`, `pop`, `peek`, and `isEmpty` methods.

```javascript
class Stack {
  #items = [];
  
  push(element) { this.#items.push(element); }
  pop() {
    if (this.isEmpty()) throw new Error("Stack is empty");
    return this.#items.pop();
  }
  peek() {
    if (this.isEmpty()) throw new Error("Stack is empty");
    return this.#items[this.#items.length - 1];
  }
  isEmpty() { return this.#items.length === 0; }
  size() { return this.#items.length; }
  toString() { return this.#items.toString(); }
}

const stack = new Stack();
stack.push(1);
stack.push(2);
stack.push(3);
console.log(stack.peek()); // 3
console.log(stack.pop());  // 3
console.log(stack.size()); // 2
```

---

**Assignment 132:** Implement a Queue class with `enqueue`, `dequeue`, `front`, and `isEmpty` methods.

```javascript
class Queue {
  #items = [];
  
  enqueue(element) { this.#items.push(element); }
  dequeue() {
    if (this.isEmpty()) throw new Error("Queue is empty");
    return this.#items.shift();
  }
  front() {
    if (this.isEmpty()) throw new Error("Queue is empty");
    return this.#items[0];
  }
  isEmpty() { return this.#items.length === 0; }
  size() { return this.#items.length; }
}

const queue = new Queue();
queue.enqueue("a");
queue.enqueue("b");
queue.enqueue("c");
console.log(queue.front());    // "a"
console.log(queue.dequeue());  // "a"
console.log(queue.size());     // 2
```

---

**Assignment 133:** Write a function to implement binary search on a sorted array.

```javascript
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

const sorted = [1, 3, 5, 7, 9, 11, 13, 15];
console.log(binarySearch(sorted, 7));  // 3
console.log(binarySearch(sorted, 6));  // -1
```

---

**Assignment 134:** Write a function to implement bubble sort.

```javascript
function bubbleSort(arr) {
  const result = [...arr];
  const n = result.length;
  
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (result[j] > result[j + 1]) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return result;
}

console.log(bubbleSort([64, 34, 25, 12, 22, 11, 90]));
// [11, 12, 22, 25, 34, 64, 90]
```

---

**Assignment 135:** Write a function that checks if two strings are anagrams of each other.

```javascript
function areAnagrams(str1, str2) {
  const normalize = (s) => s.toLowerCase().replace(/\s/g, "").split("").sort().join("");
  return normalize(str1) === normalize(str2);
}

console.log(areAnagrams("listen", "silent")); // true
console.log(areAnagrams("hello", "world"));   // false
console.log(areAnagrams("Astronomer", "Moon starer")); // true
```

---

**Assignment 136:** Write a function to flatten a deeply nested array without using `.flat()`.

```javascript
function flatten(arr) {
  const result = [];
  
  function helper(items) {
    for (const item of items) {
      if (Array.isArray(item)) {
        helper(item);
      } else {
        result.push(item);
      }
    }
  }
  
  helper(arr);
  return result;
}

console.log(flatten([1, [2, [3, [4, [5]]]]])); // [1, 2, 3, 4, 5]
console.log(flatten([[1, 2], [3, [4, 5]], 6])); // [1, 2, 3, 4, 5, 6]
```

---

**Assignment 137:** Write a function to find the intersection of two arrays.

```javascript
function intersection(arr1, arr2) {
  const set = new Set(arr1);
  return [...new Set(arr2.filter(item => set.has(item)))];
}

console.log(intersection([1, 2, 3, 4], [3, 4, 5, 6])); // [3, 4]
console.log(intersection([1, 1, 2], [2, 2, 3]));         // [2]
```

---

**Assignment 138:** Implement a simple hash map using an object with `set`, `get`, and `delete` methods.

```javascript
class HashMap {
  constructor() {
    this.data = {};
    this.size = 0;
  }
  
  #hash(key) { return String(key); }
  
  set(key, value) {
    const hash = this.#hash(key);
    if (!(hash in this.data)) this.size++;
    this.data[hash] = { key, value };
  }
  
  get(key) {
    const entry = this.data[this.#hash(key)];
    return entry ? entry.value : undefined;
  }
  
  delete(key) {
    const hash = this.#hash(key);
    if (hash in this.data) {
      delete this.data[hash];
      this.size--;
      return true;
    }
    return false;
  }
  
  has(key) { return this.#hash(key) in this.data; }
}

const map = new HashMap();
map.set("name", "Alice");
map.set("age", 25);
console.log(map.get("name")); // "Alice"
console.log(map.has("age"));  // true
map.delete("age");
console.log(map.size);        // 1
```

---

**Assignment 139:** Write a function that returns all permutations of a given string.

```javascript
function permutations(str) {
  if (str.length <= 1) return [str];
  
  const result = [];
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const remaining = str.slice(0, i) + str.slice(i + 1);
    const perms = permutations(remaining);
    for (const perm of perms) {
      result.push(char + perm);
    }
  }
  return [...new Set(result)];
}

console.log(permutations("abc")); 
// ["abc", "acb", "bac", "bca", "cab", "cba"]
```

---

**Assignment 140:** Write a function to find the first non-repeating character in a string.

```javascript
function firstNonRepeating(str) {
  const charCount = {};
  for (const char of str) {
    charCount[char] = (charCount[char] || 0) + 1;
  }
  for (const char of str) {
    if (charCount[char] === 1) return char;
  }
  return null;
}

console.log(firstNonRepeating("aabbcdd")); // "c"
console.log(firstNonRepeating("abab"));    // null
console.log(firstNonRepeating("leetcode")); // "l"
```

---

## 🔴 ADVANCED LEVEL (Assignments 141–200)

### Advanced Functions & Patterns

---

**Assignment 141:** Implement your own version of `Function.prototype.bind()`.

```javascript
Function.prototype.myBind = function (context, ...boundArgs) {
  const fn = this;
  return function (...args) {
    return fn.apply(context, [...boundArgs, ...args]);
  };
};

const person = { name: "Alice" };
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

const greetAlice = greet.myBind(person, "Hello");
console.log(greetAlice("!")); // "Hello, Alice!"
console.log(greetAlice("?")); // "Hello, Alice?"
```

---

**Assignment 142:** Implement a debounce function that delays execution until after a specified wait time.

```javascript
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

const expensiveSearch = debounce((query) => {
  console.log(`Searching for: ${query}`);
}, 300);

// Only the last call within 300ms executes
expensiveSearch("h");
expensiveSearch("he");
expensiveSearch("hel");
expensiveSearch("hello"); // Only this one fires
```

---

**Assignment 143:** Implement a throttle function that limits execution to once every specified interval.

```javascript
function throttle(fn, limit) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

const logScroll = throttle(() => {
  console.log("Scroll event handled at:", Date.now());
}, 1000);

// Simulating rapid calls — only one per second executes
window.addEventListener("scroll", logScroll);
```

---

**Assignment 144:** Implement currying: write a function `curry(fn)` that transforms `fn(a, b, c)` into `fn(a)(b)(c)`.

```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function (...nextArgs) {
      return curried.apply(this, [...args, ...nextArgs]);
    };
  };
}

function add(a, b, c) { return a + b + c; }

const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3));    // 6
console.log(curriedAdd(1, 2)(3));    // 6
console.log(curriedAdd(1)(2, 3));    // 6
console.log(curriedAdd(1, 2, 3));    // 6
```

---

**Assignment 145:** Implement a `pipe()` function that composes multiple functions left to right.

```javascript
function pipe(...fns) {
  return (value) => fns.reduce((acc, fn) => fn(acc), value);
}

const add10 = (x) => x + 10;
const multiply2 = (x) => x * 2;
const subtract5 = (x) => x - 5;

const transform = pipe(add10, multiply2, subtract5);
console.log(transform(5));  // ((5 + 10) * 2) - 5 = 25
console.log(transform(10)); // ((10 + 10) * 2) - 5 = 35
```

---

**Assignment 146:** Implement a `compose()` function that composes multiple functions right to left.

```javascript
function compose(...fns) {
  return (value) => fns.reduceRight((acc, fn) => fn(acc), value);
}

const add10 = (x) => x + 10;
const multiply2 = (x) => x * 2;
const subtract5 = (x) => x - 5;

const transform = compose(subtract5, multiply2, add10);
console.log(transform(5));  // subtract5(multiply2(add10(5))) = 25
```

---

**Assignment 147:** Implement a deep clone function that handles objects, arrays, dates, and regex.

```javascript
function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags);
  if (obj instanceof Map) {
    const clone = new Map();
    obj.forEach((value, key) => clone.set(deepClone(key), deepClone(value)));
    return clone;
  }
  if (obj instanceof Set) {
    const clone = new Set();
    obj.forEach((value) => clone.add(deepClone(value)));
    return clone;
  }
  
  const clone = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    clone[key] = deepClone(obj[key]);
  }
  return clone;
}

const original = {
  name: "Alice",
  date: new Date(),
  nested: { scores: [1, 2, 3] },
  pattern: /hello/gi,
};

const clone = deepClone(original);
clone.nested.scores.push(4);
console.log(original.nested.scores); // [1, 2, 3] (unchanged)
console.log(clone.nested.scores);    // [1, 2, 3, 4]
```

---

**Assignment 148:** Write a function that implements the Observer (Pub/Sub) pattern.

```javascript
class EventBus {
  #listeners = {};

  on(event, callback) {
    if (!this.#listeners[event]) this.#listeners[event] = [];
    this.#listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.#listeners[event]) return;
    this.#listeners[event] = this.#listeners[event].filter(cb => cb !== callback);
  }

  emit(event, ...args) {
    if (!this.#listeners[event]) return;
    this.#listeners[event].forEach(cb => cb(...args));
  }
}

const bus = new EventBus();
const unsubscribe = bus.on("message", (msg) => console.log(`Received: ${msg}`));
bus.emit("message", "Hello!");  // "Received: Hello!"
unsubscribe();
bus.emit("message", "World!"); // (nothing — unsubscribed)
```

---

**Assignment 149:** Implement a `once()` function that ensures a function is only called once.

```javascript
function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

const initialize = once(() => {
  console.log("Initialized!");
  return { ready: true };
});

console.log(initialize()); // "Initialized!" → { ready: true }
console.log(initialize()); // { ready: true } (no log, returns cached result)
```

---

**Assignment 150:** Write a function that implements the `flatMap` method from scratch for arrays.

```javascript
function flatMap(arr, fn) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const mapped = fn(arr[i], i, arr);
    if (Array.isArray(mapped)) {
      result.push(...mapped);
    } else {
      result.push(mapped);
    }
  }
  return result;
}

console.log(flatMap([1, 2, 3], x => [x, x * 2]));
// [1, 2, 2, 4, 3, 6]

console.log(flatMap(["hello world", "foo bar"], s => s.split(" ")));
// ["hello", "world", "foo", "bar"]
```

---

### Advanced Async Patterns

---

**Assignment 151:** Implement a `promisify` function that converts a callback-based function to a Promise-based one.

```javascript
function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  };
}

// Simulated callback-based function
function readFile(path, callback) {
  setTimeout(() => {
    if (path === "/valid") callback(null, "File content here");
    else callback(new Error("File not found"));
  }, 100);
}

const readFileAsync = promisify(readFile);
readFileAsync("/valid").then(console.log);    // "File content here"
readFileAsync("/bad").catch(e => console.error(e.message)); // "File not found"
```

---

**Assignment 152:** Build an async task queue that processes tasks one at a time in order.

```javascript
class AsyncQueue {
  #queue = [];
  #processing = false;

  enqueue(asyncFn) {
    return new Promise((resolve, reject) => {
      this.#queue.push({ asyncFn, resolve, reject });
      this.#process();
    });
  }

  async #process() {
    if (this.#processing) return;
    this.#processing = true;

    while (this.#queue.length > 0) {
      const { asyncFn, resolve, reject } = this.#queue.shift();
      try {
        const result = await asyncFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.#processing = false;
  }
}

const queue = new AsyncQueue();
const delay = (ms, val) => () => new Promise(r => setTimeout(() => r(val), ms));

queue.enqueue(delay(300, "First")).then(console.log);
queue.enqueue(delay(100, "Second")).then(console.log);
queue.enqueue(delay(200, "Third")).then(console.log);
// Output: "First", "Second", "Third" (in order despite different delays)
```

---

**Assignment 153:** Implement `Promise.all()` from scratch.

```javascript
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let completed = 0;
    const promiseArray = Array.from(promises);
    
    if (promiseArray.length === 0) {
      resolve([]);
      return;
    }

    promiseArray.forEach((promise, index) => {
      Promise.resolve(promise).then(
        (value) => {
          results[index] = value;
          completed++;
          if (completed === promiseArray.length) resolve(results);
        },
        (error) => reject(error)
      );
    });
  });
}

promiseAll([
  Promise.resolve(1),
  new Promise(r => setTimeout(() => r(2), 100)),
  Promise.resolve(3),
]).then(console.log); // [1, 2, 3]
```

---

**Assignment 154:** Implement `Promise.race()` from scratch.

```javascript
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    for (const promise of promises) {
      Promise.resolve(promise).then(resolve, reject);
    }
  });
}

promiseRace([
  new Promise(r => setTimeout(() => r("slow"), 200)),
  new Promise(r => setTimeout(() => r("fast"), 50)),
]).then(console.log); // "fast"
```

---

**Assignment 155:** Write an async function that fetches paginated data from an API, collecting all pages.

```javascript
async function fetchAllPages(baseUrl, pageSize = 10) {
  const allData = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`${baseUrl}?_page=${page}&_limit=${pageSize}`);
    const data = await response.json();
    
    if (data.length === 0) {
      hasMore = false;
    } else {
      allData.push(...data);
      page++;
    }
    
    if (data.length < pageSize) hasMore = false;
  }

  return allData;
}

// Usage:
// const allPosts = await fetchAllPages("https://jsonplaceholder.typicode.com/posts", 20);
```

---

**Assignment 156:** Implement an async retry function with exponential backoff.

```javascript
async function retryWithBackoff(fn, maxRetries = 5, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(`Attempt ${attempt + 1} failed. Retrying in ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage:
// await retryWithBackoff(() => fetch("https://unstable-api.example.com/data"));
```

---

**Assignment 157:** Build a concurrent task limiter that processes at most N promises at a time.

```javascript
async function asyncPool(poolLimit, items, asyncFn) {
  const results = [];
  const executing = new Set();

  for (const [index, item] of items.entries()) {
    const promise = Promise.resolve().then(() => asyncFn(item, index));
    results.push(promise);
    executing.add(promise);

    const clean = () => executing.delete(promise);
    promise.then(clean, clean);

    if (executing.size >= poolLimit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

// Process 20 URLs, max 3 at a time
const urls = Array.from({ length: 20 }, (_, i) => `https://api.example.com/item/${i}`);
const results = await asyncPool(3, urls, async (url) => {
  const res = await fetch(url);
  return res.json();
});
```

---

**Assignment 158:** Implement a cancellable promise using AbortController.

```javascript
function cancellableFetch(url) {
  const controller = new AbortController();

  const promise = fetch(url, { signal: controller.signal })
    .then(response => response.json())
    .catch(error => {
      if (error.name === "AbortError") {
        console.log("Request was cancelled");
        return null;
      }
      throw error;
    });

  return { promise, cancel: () => controller.abort() };
}

const { promise, cancel } = cancellableFetch("https://jsonplaceholder.typicode.com/posts");

// Cancel after 100ms if it hasn't resolved
setTimeout(cancel, 100);

promise.then(data => {
  if (data) console.log("Data received:", data.length, "items");
  else console.log("Request was cancelled");
});
```

---

**Assignment 159:** Write an async generator that yields items from a paginated API one at a time.

```javascript
async function* paginatedFetcher(baseUrl, pageSize = 10) {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`${baseUrl}?_page=${page}&_limit=${pageSize}`);
    const data = await response.json();

    for (const item of data) {
      yield item;
    }

    hasMore = data.length === pageSize;
    page++;
  }
}

// Usage
async function main() {
  const fetcher = paginatedFetcher("https://jsonplaceholder.typicode.com/posts", 5);
  let count = 0;

  for await (const post of fetcher) {
    console.log(`Post ${post.id}: ${post.title}`);
    if (++count >= 12) break; // Stop after 12 items
  }
}
```

---

**Assignment 160:** Implement a simple event-driven async pipeline using EventEmitter pattern.

```javascript
class AsyncPipeline {
  #stages = [];

  addStage(name, handler) {
    this.#stages.push({ name, handler });
    return this;
  }

  async execute(input) {
    let data = input;
    const log = [];

    for (const { name, handler } of this.#stages) {
      console.log(`Executing stage: ${name}`);
      data = await handler(data);
      log.push({ stage: name, output: data });
    }

    return { result: data, log };
  }
}

const pipeline = new AsyncPipeline()
  .addStage("fetch", async (url) => {
    const res = await fetch(url);
    return res.json();
  })
  .addStage("transform", async (data) => {
    return data.slice(0, 5).map(item => item.title);
  })
  .addStage("format", async (titles) => {
    return titles.map((t, i) => `${i + 1}. ${t}`).join("\n");
  });

// pipeline.execute("https://jsonplaceholder.typicode.com/posts").then(console.log);
```

---

### Advanced Data Structures & Algorithms

---

**Assignment 161:** Implement a Linked List class with `append`, `prepend`, `delete`, `find`, and `toArray` methods.

```javascript
class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  append(value) {
    const node = new Node(value);
    if (!this.head) { this.head = node; }
    else {
      let current = this.head;
      while (current.next) current = current.next;
      current.next = node;
    }
    this.size++;
  }

  prepend(value) {
    const node = new Node(value);
    node.next = this.head;
    this.head = node;
    this.size++;
  }

  delete(value) {
    if (!this.head) return false;
    if (this.head.value === value) {
      this.head = this.head.next;
      this.size--;
      return true;
    }
    let current = this.head;
    while (current.next) {
      if (current.next.value === value) {
        current.next = current.next.next;
        this.size--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  find(value) {
    let current = this.head;
    while (current) {
      if (current.value === value) return current;
      current = current.next;
    }
    return null;
  }

  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
}

const list = new LinkedList();
list.append(1); list.append(2); list.append(3);
list.prepend(0);
console.log(list.toArray()); // [0, 1, 2, 3]
list.delete(2);
console.log(list.toArray()); // [0, 1, 3]
```

---

**Assignment 162:** Implement a Binary Search Tree with `insert`, `search`, and `inOrderTraversal` methods.

```javascript
class BSTNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() { this.root = null; }

  insert(value) {
    const node = new BSTNode(value);
    if (!this.root) { this.root = node; return; }
    
    let current = this.root;
    while (true) {
      if (value < current.value) {
        if (!current.left) { current.left = node; return; }
        current = current.left;
      } else {
        if (!current.right) { current.right = node; return; }
        current = current.right;
      }
    }
  }

  search(value) {
    let current = this.root;
    while (current) {
      if (value === current.value) return true;
      current = value < current.value ? current.left : current.right;
    }
    return false;
  }

  inOrderTraversal(node = this.root, result = []) {
    if (node) {
      this.inOrderTraversal(node.left, result);
      result.push(node.value);
      this.inOrderTraversal(node.right, result);
    }
    return result;
  }
}

const bst = new BinarySearchTree();
[5, 3, 7, 1, 4, 6, 8].forEach(v => bst.insert(v));
console.log(bst.inOrderTraversal()); // [1, 3, 4, 5, 6, 7, 8]
console.log(bst.search(4));          // true
console.log(bst.search(9));          // false
```

---

**Assignment 163:** Implement merge sort algorithm.

```javascript
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
}

console.log(mergeSort([38, 27, 43, 3, 9, 82, 10]));
// [3, 9, 10, 27, 38, 43, 82]
```

---

**Assignment 164:** Implement quick sort algorithm.

```javascript
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[arr.length - 1];
  const left = [], right = [];
  
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }
  
  return [...quickSort(left), pivot, ...quickSort(right)];
}

console.log(quickSort([10, 7, 8, 9, 1, 5]));
// [1, 5, 7, 8, 9, 10]
```

---

**Assignment 165:** Write a function to detect a cycle in a linked list (Floyd's algorithm).

```javascript
function hasCycle(head) {
  let slow = head, fast = head;
  
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

// Test
class ListNode {
  constructor(val) { this.val = val; this.next = null; }
}

const a = new ListNode(1);
const b = new ListNode(2);
const c = new ListNode(3);
const d = new ListNode(4);
a.next = b; b.next = c; c.next = d; d.next = b; // cycle at b

console.log(hasCycle(a)); // true
```

---

**Assignment 166:** Implement a Trie (prefix tree) with `insert`, `search`, and `startsWith` methods.

```javascript
class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

class Trie {
  constructor() { this.root = new TrieNode(); }

  insert(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) node.children[char] = new TrieNode();
      node = node.children[char];
    }
    node.isEnd = true;
  }

  search(word) {
    const node = this.#traverse(word);
    return node !== null && node.isEnd;
  }

  startsWith(prefix) {
    return this.#traverse(prefix) !== null;
  }

  #traverse(str) {
    let node = this.root;
    for (const char of str) {
      if (!node.children[char]) return null;
      node = node.children[char];
    }
    return node;
  }
}

const trie = new Trie();
trie.insert("apple");
trie.insert("app");
console.log(trie.search("apple"));     // true
console.log(trie.search("app"));       // true
console.log(trie.search("ap"));        // false
console.log(trie.startsWith("ap"));    // true
```

---

**Assignment 167:** Implement a min-heap / priority queue with `insert` and `extractMin` methods.

```javascript
class MinHeap {
  #heap = [];

  insert(value) {
    this.#heap.push(value);
    this.#bubbleUp(this.#heap.length - 1);
  }

  extractMin() {
    if (this.#heap.length === 0) return null;
    const min = this.#heap[0];
    const last = this.#heap.pop();
    if (this.#heap.length > 0) {
      this.#heap[0] = last;
      this.#sinkDown(0);
    }
    return min;
  }

  #bubbleUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.#heap[parent] <= this.#heap[index]) break;
      [this.#heap[parent], this.#heap[index]] = [this.#heap[index], this.#heap[parent]];
      index = parent;
    }
  }

  #sinkDown(index) {
    const length = this.#heap.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.#heap[left] < this.#heap[smallest]) smallest = left;
      if (right < length && this.#heap[right] < this.#heap[smallest]) smallest = right;
      if (smallest === index) break;

      [this.#heap[smallest], this.#heap[index]] = [this.#heap[index], this.#heap[smallest]];
      index = smallest;
    }
  }

  get size() { return this.#heap.length; }
}

const heap = new MinHeap();
[5, 3, 8, 1, 2, 7].forEach(v => heap.insert(v));
console.log(heap.extractMin()); // 1
console.log(heap.extractMin()); // 2
console.log(heap.extractMin()); // 3
```

---

**Assignment 168:** Write a function to solve the "two sum" problem with O(n) time complexity.

```javascript
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return null;
}

console.log(twoSum([2, 7, 11, 15], 9));  // [0, 1]
console.log(twoSum([3, 2, 4], 6));       // [1, 2]
```

---

**Assignment 169:** Implement BFS (Breadth-First Search) for a graph represented as an adjacency list.

```javascript
function bfs(graph, start) {
  const visited = new Set();
  const queue = [start];
  const order = [];

  visited.add(start);

  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);

    for (const neighbor of (graph[node] || [])) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return order;
}

const graph = {
  A: ["B", "C"],
  B: ["A", "D", "E"],
  C: ["A", "F"],
  D: ["B"],
  E: ["B", "F"],
  F: ["C", "E"],
};

console.log(bfs(graph, "A")); // ["A", "B", "C", "D", "E", "F"]
```

---

**Assignment 170:** Implement DFS (Depth-First Search) for a graph represented as an adjacency list.

```javascript
function dfs(graph, start) {
  const visited = new Set();
  const order = [];

  function traverse(node) {
    if (visited.has(node)) return;
    visited.add(node);
    order.push(node);
    for (const neighbor of (graph[node] || [])) {
      traverse(neighbor);
    }
  }

  traverse(start);
  return order;
}

const graph = {
  A: ["B", "C"],
  B: ["A", "D", "E"],
  C: ["A", "F"],
  D: ["B"],
  E: ["B", "F"],
  F: ["C", "E"],
};

console.log(dfs(graph, "A")); // ["A", "B", "D", "E", "F", "C"]
```

---

### Advanced OOP & Design Patterns

---

**Assignment 171:** Implement the Factory pattern to create different types of user objects.

```javascript
class UserFactory {
  static create(type, name) {
    switch (type) {
      case "admin":
        return { name, role: "admin", permissions: ["read", "write", "delete", "manage"] };
      case "editor":
        return { name, role: "editor", permissions: ["read", "write"] };
      case "viewer":
        return { name, role: "viewer", permissions: ["read"] };
      default:
        throw new Error(`Unknown user type: ${type}`);
    }
  }
}

const admin = UserFactory.create("admin", "Alice");
const editor = UserFactory.create("editor", "Bob");
console.log(admin);  // { name: "Alice", role: "admin", permissions: [...] }
console.log(editor); // { name: "Bob", role: "editor", permissions: [...] }
```

---

**Assignment 172:** Implement the Strategy pattern for a payment processing system with multiple methods.

```javascript
class PaymentProcessor {
  #strategy;
  
  setStrategy(strategy) { this.#strategy = strategy; }
  
  pay(amount) {
    if (!this.#strategy) throw new Error("No payment strategy set");
    return this.#strategy.pay(amount);
  }
}

class CreditCardPayment {
  constructor(cardNumber) { this.cardNumber = cardNumber; }
  pay(amount) { return `Paid $${amount} with credit card ending in ${this.cardNumber.slice(-4)}`; }
}

class PayPalPayment {
  constructor(email) { this.email = email; }
  pay(amount) { return `Paid $${amount} via PayPal (${this.email})`; }
}

class CryptoPayment {
  constructor(wallet) { this.wallet = wallet; }
  pay(amount) { return `Paid $${amount} in crypto to ${this.wallet.slice(0, 8)}...`; }
}

const processor = new PaymentProcessor();
processor.setStrategy(new CreditCardPayment("1234567890123456"));
console.log(processor.pay(99.99));

processor.setStrategy(new PayPalPayment("alice@email.com"));
console.log(processor.pay(49.99));
```

---

**Assignment 173:** Implement the Decorator pattern to add logging to any function.

```javascript
function withLogging(fn, label = fn.name) {
  return function (...args) {
    console.log(`[${label}] Called with:`, args);
    const start = performance.now();
    const result = fn.apply(this, args);
    const duration = (performance.now() - start).toFixed(2);
    console.log(`[${label}] Returned:`, result, `(${duration}ms)`);
    return result;
  };
}

function withValidation(fn, validator) {
  return function (...args) {
    const error = validator(...args);
    if (error) throw new Error(`Validation failed: ${error}`);
    return fn.apply(this, args);
  };
}

function add(a, b) { return a + b; }

const safeAdd = withLogging(
  withValidation(add, (a, b) => {
    if (typeof a !== "number" || typeof b !== "number") return "Arguments must be numbers";
  }),
  "safeAdd"
);

console.log(safeAdd(3, 5)); // Logs input, output, and timing → 8
```

---

**Assignment 174:** Implement the Command pattern with undo/redo functionality.

```javascript
class CommandManager {
  #history = [];
  #undone = [];

  execute(command) {
    command.execute();
    this.#history.push(command);
    this.#undone = [];
  }

  undo() {
    const command = this.#history.pop();
    if (command) {
      command.undo();
      this.#undone.push(command);
    }
  }

  redo() {
    const command = this.#undone.pop();
    if (command) {
      command.execute();
      this.#history.push(command);
    }
  }
}

class AddTextCommand {
  constructor(editor, text) { this.editor = editor; this.text = text; }
  execute() { this.editor.content += this.text; }
  undo() { this.editor.content = this.editor.content.slice(0, -this.text.length); }
}

const editor = { content: "" };
const manager = new CommandManager();

manager.execute(new AddTextCommand(editor, "Hello"));
manager.execute(new AddTextCommand(editor, " World"));
console.log(editor.content); // "Hello World"

manager.undo();
console.log(editor.content); // "Hello"

manager.redo();
console.log(editor.content); // "Hello World"
```

---

**Assignment 175:** Implement the Iterator pattern by making a custom object iterable with `Symbol.iterator`.

```javascript
class Range {
  constructor(start, end, step = 1) {
    this.start = start;
    this.end = end;
    this.step = step;
  }

  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    const step = this.step;
    return {
      next() {
        if (current <= end) {
          const value = current;
          current += step;
          return { value, done: false };
        }
        return { done: true };
      }
    };
  }
}

const range = new Range(1, 10, 2);
for (const num of range) {
  console.log(num); // 1, 3, 5, 7, 9
}

console.log([...new Range(0, 5)]); // [0, 1, 2, 3, 4, 5]
```

---

**Assignment 176:** Implement the Proxy pattern to create a validation layer for object property access.

```javascript
function createValidatedObject(schema) {
  const data = {};
  
  return new Proxy(data, {
    set(target, property, value) {
      if (schema[property]) {
        const { type, required, min, max, validate } = schema[property];
        
        if (type && typeof value !== type) {
          throw new TypeError(`${property} must be of type ${type}`);
        }
        if (min !== undefined && value < min) {
          throw new RangeError(`${property} must be >= ${min}`);
        }
        if (max !== undefined && value > max) {
          throw new RangeError(`${property} must be <= ${max}`);
        }
        if (validate && !validate(value)) {
          throw new Error(`${property} failed custom validation`);
        }
      }
      target[property] = value;
      return true;
    },
    
    get(target, property) {
      if (!(property in target) && schema[property]?.required) {
        throw new Error(`${property} is required but not set`);
      }
      return target[property];
    }
  });
}

const user = createValidatedObject({
  name: { type: "string", required: true },
  age: { type: "number", min: 0, max: 150 },
  email: { type: "string", validate: (v) => v.includes("@") },
});

user.name = "Alice";
user.age = 25;
user.email = "alice@example.com";
// user.age = -5; // RangeError!
// user.email = "invalid"; // Error: failed validation!
```

---

**Assignment 177:** Implement the Builder pattern to construct complex configuration objects step by step.

```javascript
class QueryBuilder {
  #query = { table: "", conditions: [], orderBy: null, limit: null, fields: ["*"] };

  from(table) { this.#query.table = table; return this; }
  
  select(...fields) { this.#query.fields = fields; return this; }
  
  where(condition) { this.#query.conditions.push(condition); return this; }
  
  orderBy(field, direction = "ASC") {
    this.#query.orderBy = `${field} ${direction}`;
    return this;
  }
  
  limit(n) { this.#query.limit = n; return this; }

  build() {
    let sql = `SELECT ${this.#query.fields.join(", ")} FROM ${this.#query.table}`;
    if (this.#query.conditions.length) {
      sql += ` WHERE ${this.#query.conditions.join(" AND ")}`;
    }
    if (this.#query.orderBy) sql += ` ORDER BY ${this.#query.orderBy}`;
    if (this.#query.limit) sql += ` LIMIT ${this.#query.limit}`;
    return sql;
  }
}

const query = new QueryBuilder()
  .from("users")
  .select("name", "email", "age")
  .where("age > 18")
  .where("active = true")
  .orderBy("name")
  .limit(10)
  .build();

console.log(query);
// SELECT name, email, age FROM users WHERE age > 18 AND active = true ORDER BY name ASC LIMIT 10
```

---

**Assignment 178:** Implement the State pattern for a traffic light system with different behaviors per state.

```javascript
class TrafficLight {
  #states = {};
  #currentState;

  addState(name, config) {
    this.#states[name] = config;
    return this;
  }

  setState(name) {
    this.#currentState = name;
    const state = this.#states[name];
    console.log(`Light: ${state.color} — ${state.message}`);
  }

  next() {
    const state = this.#states[this.#currentState];
    setTimeout(() => this.setState(state.next), state.duration);
  }

  getState() { return this.#currentState; }
}

const light = new TrafficLight()
  .addState("green",  { color: "🟢", message: "Go!",     next: "yellow", duration: 3000 })
  .addState("yellow", { color: "🟡", message: "Caution!", next: "red",    duration: 1000 })
  .addState("red",    { color: "🔴", message: "Stop!",    next: "green",  duration: 2000 });

light.setState("green");
// light.next(); // cycles automatically
```

---

**Assignment 179:** Implement the Mediator pattern for a simple chat room where users communicate through a central mediator.

```javascript
class ChatRoom {
  #users = new Map();

  register(user) {
    this.#users.set(user.name, user);
    user.chatRoom = this;
  }

  send(message, from, to) {
    if (to) {
      const recipient = this.#users.get(to);
      if (recipient) recipient.receive(message, from);
    } else {
      this.#users.forEach((user, name) => {
        if (name !== from) user.receive(message, from);
      });
    }
  }
}

class User {
  constructor(name) { this.name = name; this.chatRoom = null; }

  send(message, to) {
    console.log(`${this.name} sends: ${message}`);
    this.chatRoom.send(message, this.name, to);
  }

  receive(message, from) {
    console.log(`${this.name} received from ${from}: ${message}`);
  }
}

const room = new ChatRoom();
const alice = new User("Alice");
const bob = new User("Bob");
const charlie = new User("Charlie");

room.register(alice);
room.register(bob);
room.register(charlie);

alice.send("Hello everyone!");      // broadcast
bob.send("Hi Alice!", "Alice");     // direct message
```

---

**Assignment 180:** Implement the Chain of Responsibility pattern for a middleware-like request processing pipeline.

```javascript
class MiddlewarePipeline {
  #middlewares = [];

  use(middleware) {
    this.#middlewares.push(middleware);
    return this;
  }

  async execute(context) {
    let index = 0;

    const next = async () => {
      if (index < this.#middlewares.length) {
        const middleware = this.#middlewares[index++];
        await middleware(context, next);
      }
    };

    await next();
    return context;
  }
}

const app = new MiddlewarePipeline();

app.use(async (ctx, next) => {
  ctx.startTime = Date.now();
  console.log(`[Logger] ${ctx.method} ${ctx.path}`);
  await next();
  console.log(`[Logger] Completed in ${Date.now() - ctx.startTime}ms`);
});

app.use(async (ctx, next) => {
  if (!ctx.headers?.authorization) {
    ctx.status = 401;
    ctx.body = "Unauthorized";
    return; // stop chain
  }
  ctx.user = "Alice";
  await next();
});

app.use(async (ctx, next) => {
  ctx.status = 200;
  ctx.body = `Hello, ${ctx.user}!`;
  await next();
});

app.execute({
  method: "GET",
  path: "/api/data",
  headers: { authorization: "Bearer token123" }
}).then(console.log);
```

---

### Advanced JavaScript Concepts

---

**Assignment 181:** Implement a reactive data binding system where changing a variable automatically updates the DOM.

```javascript
function reactive(obj, onChange) {
  return new Proxy(obj, {
    set(target, property, value) {
      const oldValue = target[property];
      target[property] = value;
      if (oldValue !== value) {
        onChange(property, value, oldValue);
      }
      return true;
    }
  });
}

// Usage
const state = reactive({ count: 0, message: "Hello" }, (prop, newVal) => {
  const el = document.querySelector(`[data-bind="${prop}"]`);
  if (el) el.textContent = newVal;
  console.log(`${prop} changed to ${newVal}`);
});

state.count = 1;    // Updates any element with data-bind="count"
state.message = "World"; // Updates any element with data-bind="message"
```

---

**Assignment 182:** Write a custom `JSON.stringify()` that handles circular references.

```javascript
function safeStringify(obj, indent = 2) {
  const seen = new WeakSet();

  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return "[Circular Reference]";
      seen.add(value);
    }
    if (typeof value === "bigint") return value.toString() + "n";
    if (value instanceof RegExp) return value.toString();
    if (value instanceof Error) return { message: value.message, stack: value.stack };
    return value;
  }, indent);
}

const obj = { name: "Alice" };
obj.self = obj; // circular reference

console.log(safeStringify(obj));
// { "name": "Alice", "self": "[Circular Reference]" }
```

---

**Assignment 183:** Implement a simple virtual DOM diffing algorithm that compares two trees and outputs the changes.

```javascript
function h(type, props = {}, ...children) {
  return { type, props, children: children.flat() };
}

function diff(oldTree, newTree, path = "") {
  const patches = [];

  if (!oldTree) {
    patches.push({ type: "CREATE", path, node: newTree });
  } else if (!newTree) {
    patches.push({ type: "REMOVE", path });
  } else if (typeof oldTree !== typeof newTree || 
             (typeof oldTree === "string" && oldTree !== newTree) ||
             oldTree.type !== newTree.type) {
    patches.push({ type: "REPLACE", path, node: newTree });
  } else if (newTree.type) {
    // Compare props
    const allProps = { ...oldTree.props, ...newTree.props };
    for (const key of Object.keys(allProps)) {
      if (oldTree.props[key] !== newTree.props[key]) {
        patches.push({ type: "UPDATE_PROP", path, key, value: newTree.props[key] });
      }
    }
    // Compare children
    const maxLen = Math.max(oldTree.children.length, newTree.children.length);
    for (let i = 0; i < maxLen; i++) {
      patches.push(...diff(oldTree.children[i], newTree.children[i], `${path}/${i}`));
    }
  }

  return patches;
}

const oldVDOM = h("div", { class: "app" }, h("h1", {}, "Hello"), h("p", {}, "World"));
const newVDOM = h("div", { class: "app" }, h("h1", {}, "Hi"), h("span", {}, "Universe"));

console.log(diff(oldVDOM, newVDOM));
```

---

**Assignment 184:** Build a simple module bundler that resolves dependencies between JavaScript files.

```javascript
class ModuleBundler {
  #modules = new Map();

  register(name, dependencies, factory) {
    this.#modules.set(name, { dependencies, factory, exports: null });
  }

  #resolve(name) {
    const mod = this.#modules.get(name);
    if (!mod) throw new Error(`Module not found: ${name}`);
    if (mod.exports) return mod.exports;

    mod.exports = {};
    const deps = mod.dependencies.map(dep => this.#resolve(dep));
    mod.factory(mod.exports, ...deps);
    return mod.exports;
  }

  bundle(entryPoint) {
    return this.#resolve(entryPoint);
  }
}

const bundler = new ModuleBundler();

bundler.register("math", [], (exports) => {
  exports.add = (a, b) => a + b;
  exports.multiply = (a, b) => a * b;
});

bundler.register("utils", ["math"], (exports, math) => {
  exports.square = (n) => math.multiply(n, n);
  exports.sum = (...nums) => nums.reduce(math.add, 0);
});

bundler.register("app", ["utils", "math"], (exports, utils, math) => {
  exports.run = () => {
    console.log("Square of 5:", utils.square(5));
    console.log("Sum:", utils.sum(1, 2, 3, 4));
    console.log("Add:", math.add(10, 20));
  };
});

bundler.bundle("app").run();
```

---

**Assignment 185:** Implement a template engine that parses strings like `"Hello, {{name}}!"` and replaces placeholders with values.

```javascript
function templateEngine(template, data) {
  return template.replace(/\{\{(.+?)\}\}/g, (match, key) => {
    const keys = key.trim().split(".");
    let value = data;
    
    for (const k of keys) {
      if (value == null) return match;
      value = value[k];
    }
    
    return value != null ? value : match;
  });
}

const template = `
Hello, {{user.name}}!
You have {{user.notifications}} new notifications.
Your role is: {{user.role}}.
Welcome to {{site.name}}!
`;

const data = {
  user: { name: "Alice", notifications: 5, role: "Admin" },
  site: { name: "MyApp" },
};

console.log(templateEngine(template, data));
```

---

**Assignment 186:** Write a program that uses `Proxy` and `Reflect` to create an observable object that logs every property access and mutation.

```javascript
function createObservable(target, handlers = {}) {
  return new Proxy(target, {
    get(obj, prop) {
      const value = Reflect.get(obj, prop);
      if (handlers.onGet) handlers.onGet(prop, value);
      
      if (typeof value === "object" && value !== null) {
        return createObservable(value, handlers);
      }
      return value;
    },
    
    set(obj, prop, value) {
      const oldValue = obj[prop];
      const result = Reflect.set(obj, prop, value);
      if (handlers.onSet) handlers.onSet(prop, value, oldValue);
      return result;
    },
    
    deleteProperty(obj, prop) {
      if (handlers.onDelete) handlers.onDelete(prop, obj[prop]);
      return Reflect.deleteProperty(obj, prop);
    }
  });
}

const state = createObservable({ user: { name: "Alice", age: 25 }, count: 0 }, {
  onGet: (prop, value) => console.log(`GET ${prop} = ${JSON.stringify(value)}`),
  onSet: (prop, newVal, oldVal) => console.log(`SET ${prop}: ${oldVal} → ${newVal}`),
  onDelete: (prop) => console.log(`DELETE ${prop}`),
});

state.count = 1;         // SET count: 0 → 1
state.user.name = "Bob"; // SET name: Alice → Bob
```

---

**Assignment 187:** Implement a simple router for a single-page application using the History API.

```javascript
class Router {
  #routes = new Map();
  #root;

  constructor(rootElement) {
    this.#root = rootElement;
    window.addEventListener("popstate", () => this.#resolve());
  }

  addRoute(path, handler) {
    this.#routes.set(path, handler);
    return this;
  }

  navigate(path) {
    window.history.pushState({}, "", path);
    this.#resolve();
  }

  #resolve() {
    const path = window.location.pathname;
    const handler = this.#routes.get(path) || this.#routes.get("*");
    
    if (handler) {
      const content = handler();
      if (this.#root) this.#root.innerHTML = content;
    }
  }

  start() { this.#resolve(); return this; }
}

// Usage:
// const app = new Router(document.getElementById("app"))
//   .addRoute("/", () => "<h1>Home</h1>")
//   .addRoute("/about", () => "<h1>About</h1>")
//   .addRoute("*", () => "<h1>404 Not Found</h1>")
//   .start();
```

---

**Assignment 188:** Implement lazy evaluation using generators and a custom `LazySequence` class with `map`, `filter`, and `take`.

```javascript
class LazySequence {
  constructor(generator) {
    this.generator = generator;
  }

  static from(iterable) {
    return new LazySequence(function* () {
      yield* iterable;
    });
  }

  map(fn) {
    const gen = this.generator;
    return new LazySequence(function* () {
      for (const value of gen()) {
        yield fn(value);
      }
    });
  }

  filter(fn) {
    const gen = this.generator;
    return new LazySequence(function* () {
      for (const value of gen()) {
        if (fn(value)) yield value;
      }
    });
  }

  take(n) {
    const gen = this.generator;
    return new LazySequence(function* () {
      let count = 0;
      for (const value of gen()) {
        if (count++ >= n) return;
        yield value;
      }
    });
  }

  toArray() { return [...this.generator()]; }
}

// Process millions of items lazily — only computes what's needed
const result = LazySequence.from(Array.from({ length: 1000000 }, (_, i) => i + 1))
  .filter(n => n % 2 === 0)
  .map(n => n * n)
  .take(5)
  .toArray();

console.log(result); // [4, 16, 36, 64, 100]
```

---

**Assignment 189:** Write a Web Worker script that performs heavy computation off the main thread.

```javascript
// --- worker.js ---
self.onmessage = function (e) {
  const { type, data } = e.data;

  if (type === "fibonacci") {
    function fib(n) {
      if (n <= 1) return n;
      let a = 0, b = 1;
      for (let i = 2; i <= n; i++) {
        [a, b] = [b, a + b];
      }
      return b;
    }
    self.postMessage({ type: "result", value: fib(data) });
  }

  if (type === "primes") {
    function findPrimes(limit) {
      const sieve = new Array(limit + 1).fill(true);
      sieve[0] = sieve[1] = false;
      for (let i = 2; i * i <= limit; i++) {
        if (sieve[i]) {
          for (let j = i * i; j <= limit; j += i) sieve[j] = false;
        }
      }
      return sieve.reduce((primes, isPrime, i) => isPrime ? [...primes, i] : primes, []);
    }
    self.postMessage({ type: "result", value: findPrimes(data) });
  }
};

// --- main.js ---
const worker = new Worker("worker.js");

worker.onmessage = (e) => {
  console.log("Result from worker:", e.data.value);
};

worker.postMessage({ type: "fibonacci", data: 45 });
worker.postMessage({ type: "primes", data: 100 });
```

---

**Assignment 190:** Implement a simple dependency injection container.

```javascript
class Container {
  #services = new Map();
  #singletons = new Map();

  register(name, factory, singleton = false) {
    this.#services.set(name, { factory, singleton });
    return this;
  }

  resolve(name) {
    const service = this.#services.get(name);
    if (!service) throw new Error(`Service not found: ${name}`);

    if (service.singleton) {
      if (!this.#singletons.has(name)) {
        this.#singletons.set(name, service.factory(this));
      }
      return this.#singletons.get(name);
    }
    return service.factory(this);
  }
}

const container = new Container();

container.register("config", () => ({ dbHost: "localhost", dbPort: 5432 }), true);
container.register("logger", () => ({
  log: (msg) => console.log(`[LOG] ${msg}`),
}), true);
container.register("database", (c) => {
  const config = c.resolve("config");
  const logger = c.resolve("logger");
  logger.log(`Connecting to ${config.dbHost}:${config.dbPort}`);
  return { query: (sql) => `Executing: ${sql}` };
});

const db = container.resolve("database");
console.log(db.query("SELECT * FROM users"));
```

---

### Real-World Application Challenges

---

**Assignment 191:** Build a real-time search autocomplete component with debouncing and API calls.

```javascript
class Autocomplete {
  #input;
  #dropdown;
  #cache = new Map();

  constructor(inputSelector, dropdownSelector) {
    this.#input = document.querySelector(inputSelector);
    this.#dropdown = document.querySelector(dropdownSelector);

    this.#input.addEventListener("input", this.#debounce(async (e) => {
      const query = e.target.value.trim();
      if (query.length < 2) { this.#dropdown.innerHTML = ""; return; }

      const results = await this.#search(query);
      this.#render(results);
    }, 300));
  }

  async #search(query) {
    if (this.#cache.has(query)) return this.#cache.get(query);

    const response = await fetch(
      `https://jsonplaceholder.typicode.com/users?q=${query}`
    );
    const data = await response.json();
    this.#cache.set(query, data);
    return data;
  }

  #render(items) {
    this.#dropdown.innerHTML = items
      .map(item => `<div class="suggestion" data-id="${item.id}">${item.name}</div>`)
      .join("");
  }

  #debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }
}

// new Autocomplete("#searchInput", "#suggestions");
```

---

**Assignment 192:** Build a form wizard (multi-step form) with validation at each step and data persistence.

```javascript
class FormWizard {
  #steps;
  #currentStep = 0;
  #data = {};

  constructor(steps) {
    this.#steps = steps;
  }

  getCurrentStep() { return this.#steps[this.#currentStep]; }

  validate() {
    const step = this.getCurrentStep();
    const errors = [];
    for (const field of step.fields) {
      const value = this.#data[field.name];
      if (field.required && !value) errors.push(`${field.label} is required`);
      if (field.validate && value) {
        const error = field.validate(value);
        if (error) errors.push(error);
      }
    }
    return errors;
  }

  setData(field, value) { this.#data[field] = value; }

  next() {
    const errors = this.validate();
    if (errors.length > 0) return { success: false, errors };
    if (this.#currentStep < this.#steps.length - 1) this.#currentStep++;
    return { success: true, step: this.#currentStep };
  }

  prev() {
    if (this.#currentStep > 0) this.#currentStep--;
    return this.#currentStep;
  }

  submit() {
    const errors = this.validate();
    if (errors.length > 0) return { success: false, errors };
    return { success: true, data: { ...this.#data } };
  }
}

const wizard = new FormWizard([
  {
    title: "Personal Info",
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "email", label: "Email", required: true, validate: (v) => !v.includes("@") ? "Invalid email" : null },
    ]
  },
  {
    title: "Address",
    fields: [
      { name: "city", label: "City", required: true },
      { name: "zip", label: "ZIP Code", required: true },
    ]
  }
]);

wizard.setData("name", "Alice");
wizard.setData("email", "alice@example.com");
console.log(wizard.next()); // { success: true, step: 1 }
```

---

**Assignment 193:** Implement an infinite scroll feature that loads more data as the user scrolls to the bottom.

```javascript
class InfiniteScroll {
  #container;
  #loadMore;
  #page = 1;
  #loading = false;
  #hasMore = true;

  constructor(containerSelector, loadMoreFn, options = {}) {
    this.#container = document.querySelector(containerSelector);
    this.#loadMore = loadMoreFn;
    this.threshold = options.threshold || 200;

    window.addEventListener("scroll", this.#debounce(() => this.#check(), 100));
    this.#loadNextPage();
  }

  async #check() {
    const scrollBottom = window.innerHeight + window.scrollY;
    const docHeight = document.documentElement.scrollHeight;

    if (scrollBottom >= docHeight - this.threshold && !this.#loading && this.#hasMore) {
      await this.#loadNextPage();
    }
  }

  async #loadNextPage() {
    this.#loading = true;
    try {
      const items = await this.#loadMore(this.#page);
      if (items.length === 0) { this.#hasMore = false; return; }
      
      items.forEach(item => {
        const el = document.createElement("div");
        el.className = "item";
        el.textContent = item.title;
        this.#container.appendChild(el);
      });
      
      this.#page++;
    } finally {
      this.#loading = false;
    }
  }

  #debounce(fn, delay) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
  }
}

// new InfiniteScroll("#content", async (page) => {
//   const res = await fetch(`/api/items?page=${page}`);
//   return res.json();
// });
```

---

**Assignment 194:** Build a local caching layer that stores API responses with expiration times (TTL cache).

```javascript
class TTLCache {
  #cache = new Map();

  set(key, value, ttlMs = 60000) {
    this.#cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  get(key) {
    const entry = this.#cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.#cache.delete(key);
      return null;
    }
    return entry.value;
  }

  has(key) { return this.get(key) !== null; }

  clear() { this.#cache.clear(); }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.#cache) {
      if (now > entry.expiresAt) this.#cache.delete(key);
    }
  }
}

// Cached API fetch
const cache = new TTLCache();

async function cachedFetch(url, ttl = 30000) {
  if (cache.has(url)) {
    console.log("Cache hit!");
    return cache.get(url);
  }
  
  console.log("Cache miss, fetching...");
  const response = await fetch(url);
  const data = await response.json();
  cache.set(url, data, ttl);
  return data;
}
```

---

**Assignment 195:** Implement a rate limiter class that restricts function calls to N times per second.

```javascript
class RateLimiter {
  #tokens;
  #maxTokens;
  #refillRate;
  #lastRefill;

  constructor(maxCalls, perSeconds = 1) {
    this.#maxTokens = maxCalls;
    this.#tokens = maxCalls;
    this.#refillRate = maxCalls / perSeconds;
    this.#lastRefill = Date.now();
  }

  #refill() {
    const now = Date.now();
    const elapsed = (now - this.#lastRefill) / 1000;
    this.#tokens = Math.min(this.#maxTokens, this.#tokens + elapsed * this.#refillRate);
    this.#lastRefill = now;
  }

  tryAcquire() {
    this.#refill();
    if (this.#tokens >= 1) {
      this.#tokens -= 1;
      return true;
    }
    return false;
  }

  async acquire() {
    while (!this.tryAcquire()) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  wrap(fn) {
    return async (...args) => {
      await this.acquire();
      return fn(...args);
    };
  }
}

const limiter = new RateLimiter(3, 1); // 3 calls per second
const limitedFetch = limiter.wrap(fetch);

// Only 3 requests per second will go through
for (let i = 0; i < 10; i++) {
  limitedFetch(`https://api.example.com/item/${i}`).then(() => console.log(`Request ${i} done`));
}
```

---

**Assignment 196:** Build a keyboard shortcut manager that registers, unregisters, and triggers actions for key combinations.

```javascript
class ShortcutManager {
  #shortcuts = new Map();
  #active = true;

  constructor() {
    document.addEventListener("keydown", (e) => this.#handleKeyDown(e));
  }

  register(combo, action, description = "") {
    const key = this.#normalize(combo);
    this.#shortcuts.set(key, { action, description, combo });
    return () => this.unregister(combo);
  }

  unregister(combo) {
    this.#shortcuts.delete(this.#normalize(combo));
  }

  #normalize(combo) {
    return combo.toLowerCase().split("+").sort().join("+");
  }

  #handleKeyDown(e) {
    if (!this.#active) return;

    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push("ctrl");
    if (e.shiftKey) parts.push("shift");
    if (e.altKey) parts.push("alt");
    parts.push(e.key.toLowerCase());

    const key = parts.sort().join("+");
    const shortcut = this.#shortcuts.get(key);
    
    if (shortcut) {
      e.preventDefault();
      shortcut.action(e);
    }
  }

  listShortcuts() {
    return [...this.#shortcuts.values()].map(s => ({
      combo: s.combo,
      description: s.description,
    }));
  }

  enable() { this.#active = true; }
  disable() { this.#active = false; }
}

const shortcuts = new ShortcutManager();
shortcuts.register("Ctrl+S", () => console.log("Save!"), "Save document");
shortcuts.register("Ctrl+Shift+P", () => console.log("Command palette"), "Open commands");
```

---

**Assignment 197:** Build a mini spreadsheet with formula parsing that supports basic operations like `=SUM(A1:A5)`.

```javascript
class MiniSpreadsheet {
  #cells = {};

  setCellValue(cell, value) {
    this.#cells[cell.toUpperCase()] = value;
  }

  getCellValue(cell) {
    const raw = this.#cells[cell.toUpperCase()];
    if (typeof raw === "string" && raw.startsWith("=")) {
      return this.#evaluate(raw.slice(1));
    }
    return Number(raw) || 0;
  }

  #evaluate(formula) {
    const sumMatch = formula.match(/^SUM\(([A-Z]\d+):([A-Z]\d+)\)$/i);
    if (sumMatch) return this.#getRange(sumMatch[1], sumMatch[2]).reduce((a, b) => a + b, 0);

    const avgMatch = formula.match(/^AVG\(([A-Z]\d+):([A-Z]\d+)\)$/i);
    if (avgMatch) {
      const range = this.#getRange(avgMatch[1], avgMatch[2]);
      return range.reduce((a, b) => a + b, 0) / range.length;
    }

    // Simple cell reference or number
    if (/^[A-Z]\d+$/i.test(formula)) return this.getCellValue(formula);
    return eval(formula.replace(/[A-Z]\d+/gi, (ref) => this.getCellValue(ref)));
  }

  #getRange(start, end) {
    const col = start[0].toUpperCase();
    const startRow = parseInt(start.slice(1));
    const endRow = parseInt(end.slice(1));
    const values = [];
    for (let r = startRow; r <= endRow; r++) {
      values.push(this.getCellValue(`${col}${r}`));
    }
    return values;
  }
}

const sheet = new MiniSpreadsheet();
sheet.setCellValue("A1", 10);
sheet.setCellValue("A2", 20);
sheet.setCellValue("A3", 30);
sheet.setCellValue("A4", "=SUM(A1:A3)");
sheet.setCellValue("A5", "=AVG(A1:A3)");

console.log(sheet.getCellValue("A4")); // 60
console.log(sheet.getCellValue("A5")); // 20
```

---

**Assignment 198:** Implement undo/redo functionality for a text editor using the Command pattern with a history stack.

```javascript
class TextEditor {
  #content = "";
  #history = [];
  #future = [];

  type(text) {
    this.#saveState();
    this.#content += text;
    this.#future = [];
  }

  deleteLast(n = 1) {
    this.#saveState();
    this.#content = this.#content.slice(0, -n);
    this.#future = [];
  }

  replace(search, replacement) {
    this.#saveState();
    this.#content = this.#content.replace(search, replacement);
    this.#future = [];
  }

  undo() {
    if (this.#history.length === 0) return;
    this.#future.push(this.#content);
    this.#content = this.#history.pop();
  }

  redo() {
    if (this.#future.length === 0) return;
    this.#history.push(this.#content);
    this.#content = this.#future.pop();
  }

  #saveState() { this.#history.push(this.#content); }

  getContent() { return this.#content; }
}

const editor = new TextEditor();
editor.type("Hello");
editor.type(" World");
console.log(editor.getContent()); // "Hello World"

editor.undo();
console.log(editor.getContent()); // "Hello"

editor.redo();
console.log(editor.getContent()); // "Hello World"

editor.replace("World", "JavaScript");
console.log(editor.getContent()); // "Hello JavaScript"

editor.undo();
console.log(editor.getContent()); // "Hello World"
```

---

**Assignment 199:** Build a client-side state management library similar to a mini Redux (store, actions, reducers, subscribe).

```javascript
function createStore(reducer, initialState) {
  let state = initialState;
  const listeners = new Set();

  return {
    getState: () => state,
    
    dispatch(action) {
      state = reducer(state, action);
      listeners.forEach(listener => listener(state));
      return action;
    },
    
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

// Combine multiple reducers
function combineReducers(reducers) {
  return (state = {}, action) => {
    const nextState = {};
    for (const [key, reducer] of Object.entries(reducers)) {
      nextState[key] = reducer(state[key], action);
    }
    return nextState;
  };
}

// Example usage
const todosReducer = (state = [], action) => {
  switch (action.type) {
    case "ADD_TODO": return [...state, { id: Date.now(), text: action.text, done: false }];
    case "TOGGLE_TODO": return state.map(t => t.id === action.id ? { ...t, done: !t.done } : t);
    default: return state;
  }
};

const counterReducer = (state = 0, action) => {
  switch (action.type) {
    case "INCREMENT": return state + 1;
    case "DECREMENT": return state - 1;
    default: return state;
  }
};

const rootReducer = combineReducers({ todos: todosReducer, counter: counterReducer });
const store = createStore(rootReducer, { todos: [], counter: 0 });

const unsubscribe = store.subscribe((state) => console.log("State:", state));

store.dispatch({ type: "ADD_TODO", text: "Learn JS" });
store.dispatch({ type: "INCREMENT" });
store.dispatch({ type: "INCREMENT" });
console.log(store.getState());
// { todos: [{ id: ..., text: "Learn JS", done: false }], counter: 2 }
```

---

**Assignment 200:** Implement a full-featured event emitter class with `on`, `off`, `once`, `emit`, and wildcard listeners.

```javascript
class EventEmitter {
  #events = new Map();

  on(event, listener) {
    if (!this.#events.has(event)) this.#events.set(event, []);
    this.#events.get(event).push({ listener, once: false });
    return this;
  }

  once(event, listener) {
    if (!this.#events.has(event)) this.#events.set(event, []);
    this.#events.get(event).push({ listener, once: true });
    return this;
  }

  off(event, listener) {
    if (!this.#events.has(event)) return this;
    if (!listener) {
      this.#events.delete(event);
    } else {
      const filtered = this.#events.get(event).filter(e => e.listener !== listener);
      this.#events.set(event, filtered);
    }
    return this;
  }

  emit(event, ...args) {
    const listeners = this.#events.get(event) || [];
    const wildcardListeners = this.#events.get("*") || [];
    
    const all = [
      ...listeners.map(e => ({ ...e, isWildcard: false })),
      ...wildcardListeners.map(e => ({ ...e, isWildcard: true })),
    ];

    const toRemove = [];

    for (const entry of all) {
      if (entry.isWildcard) {
        entry.listener(event, ...args);
      } else {
        entry.listener(...args);
      }
      if (entry.once) toRemove.push(entry);
    }

    // Remove once listeners
    for (const entry of toRemove) {
      const source = entry.isWildcard ? "*" : event;
      const arr = this.#events.get(source);
      if (arr) {
        const idx = arr.findIndex(e => e.listener === entry.listener);
        if (idx !== -1) arr.splice(idx, 1);
      }
    }

    return this;
  }

  listenerCount(event) {
    return (this.#events.get(event) || []).length;
  }

  removeAllListeners() {
    this.#events.clear();
    return this;
  }
}

// Usage
const emitter = new EventEmitter();

emitter.on("*", (event, ...args) => console.log(`[Wildcard] ${event}:`, args));
emitter.on("data", (payload) => console.log("Data received:", payload));
emitter.once("connect", () => console.log("Connected! (only once)"));

emitter.emit("connect");     // "Connected! (only once)" + wildcard
emitter.emit("connect");     // only wildcard (once listener removed)
emitter.emit("data", { id: 1, name: "Test" });

console.log(`Data listeners: ${emitter.listenerCount("data")}`); // 1
```

---

*Total: 200 Assignments with Complete Answers — 70 Beginner | 70 Intermediate | 60 Advanced*
