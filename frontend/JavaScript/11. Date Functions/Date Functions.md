# JavaScript Date Functions

The `Date` object in JavaScript is used to work with dates and times. It provides methods for creating, reading, and manipulating dates.

---

## Table of Contents

| No. | Topic                                                |
|-----|------------------------------------------------------|
| 1   | [new Date()](#1-new-date)                            |
| 2   | [toLocaleDateString()](#2-tolocaledatestring)        |
| 3   | [toLocaleTimeString()](#3-tolocaletimestring)        |
| 4   | [getTime()](#4-gettime)                              |
| 5   | [getDay()](#5-getday)                                |
| 6   | [getDate()](#6-getdate)                              |
| 7   | [getMonth()](#7-getmonth)                            |
| 8   | [getFullYear()](#8-getfullyear)                      |
| 9   | [getHours()](#9-gethours)                            |
| 10  | [getMinutes()](#10-getminutes)                       |
| 11  | [getSeconds()](#11-getseconds)                       |
| 12  | [getMilliseconds()](#12-getmilliseconds)             |
| 13  | [Creating a Custom Date](#13-creating-a-custom-date) |
| 14  | [Setter Methods](#14-setter-methods-additional-content) |
| 15  | [Other Useful Date Methods](#15-other-useful-date-methods-additional-content) |
| 16  | [Date Comparisons](#16-date-comparisons-additional-content) |
| 17  | [Date Arithmetic](#17-date-arithmetic-additional-content) |
| 18  | [Practical Examples](#18-practical-examples-additional-content) |
|     | [Summary Table](#summary-table)                      |

---

## 1. `new Date()`

Creates a new Date object representing the **current date and time**.

```javascript
let now = new Date();
console.log(now); // e.g., Tue Feb 10 2026 14:30:00 GMT+0530 (India Standard Time)
```

### Different Ways to Create a Date Object

```javascript
// 1. No arguments – current date & time
let d1 = new Date();

// 2. Date string
let d2 = new Date("2026-02-10");
console.log(d2); // Tue Feb 10 2026 05:30:00 GMT+0530

// 3. Year, Month (0-indexed), Day, Hours, Minutes, Seconds, Milliseconds
let d3 = new Date(2026, 1, 10, 14, 30, 0, 0);
console.log(d3); // Tue Feb 10 2026 14:30:00

// 4. Milliseconds since Jan 1, 1970 (Unix Epoch)
let d4 = new Date(0);
console.log(d4); // Thu Jan 01 1970 05:30:00 GMT+0530

// 5. Milliseconds value
let d5 = new Date(1770000000000);
console.log(d5); // Some future date
```

> **Note:** Months are **0-indexed** in JavaScript → January = 0, February = 1, ..., December = 11.

---

## 2. `toLocaleDateString()`

Returns the **date portion** of a Date object as a locale-specific string.

```javascript
let today = new Date();

console.log(today.toLocaleDateString());
// e.g., "2/10/2026" (US locale)

// With locale and options
console.log(today.toLocaleDateString("en-US"));
// "2/10/2026"

console.log(today.toLocaleDateString("en-GB"));
// "10/02/2026"

console.log(today.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
}));
// "Tuesday, 10 February 2026"

console.log(today.toLocaleDateString("de-DE"));
// "10.2.2026"
```

---

## 3. `toLocaleTimeString()`

Returns the **time portion** of a Date object as a locale-specific string.

```javascript
let now = new Date();

console.log(now.toLocaleTimeString());
// e.g., "2:30:45 PM"

console.log(now.toLocaleTimeString("en-US"));
// "2:30:45 PM"

console.log(now.toLocaleTimeString("en-GB"));
// "14:30:45"

console.log(now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
}));
// "02:30:45 PM"

console.log(now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
}));
// "14:30"
```

---

## 4. `getTime()`

Returns the number of **milliseconds** since **January 1, 1970 00:00:00 UTC** (Unix Epoch).

```javascript
let now = new Date();
console.log(now.getTime());
// e.g., 1770633000000

// Useful for comparing dates
let date1 = new Date("2026-02-10");
let date2 = new Date("2026-03-15");

if (date1.getTime() < date2.getTime()) {
    console.log("date1 is before date2"); // ✅ This runs
}

// Measuring execution time
let start = new Date().getTime();
for (let i = 0; i < 1000000; i++) {} // some operation
let end = new Date().getTime();
console.log("Time taken: " + (end - start) + "ms");
```

---

## 5. `getDay()`

Returns the **day of the week** as a number (0–6).

| Value | Day       |
|-------|-----------|
| 0     | Sunday    |
| 1     | Monday    |
| 2     | Tuesday   |
| 3     | Wednesday |
| 4     | Thursday  |
| 5     | Friday    |
| 6     | Saturday  |

```javascript
let today = new Date();
console.log(today.getDay()); // e.g., 2 (Tuesday)

// Map day number to day name
let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
console.log(days[today.getDay()]); // "Tuesday"

// Check if it's a weekend
let dayNum = today.getDay();
if (dayNum === 0 || dayNum === 6) {
    console.log("It's the weekend! 🎉");
} else {
    console.log("It's a weekday.");
}
```

> **Note:** `getDay()` returns the day of the **week**, not the day of the **month**. Use `getDate()` for that.

---

## 6. `getDate()`

Returns the **day of the month** (1–31).

```javascript
let today = new Date();
console.log(today.getDate()); // e.g., 10

// Get the last day of the current month
let lastDay = new Date(2026, 2, 0); // Month 2 = March, Day 0 = last day of Feb
console.log(lastDay.getDate()); // 28

// Check if today is the 1st of the month
if (today.getDate() === 1) {
    console.log("It's the first day of the month!");
}
```

---

## 7. `getMonth()`

Returns the **month** as a number (0–11).

| Value | Month     |
|-------|-----------|
| 0     | January   |
| 1     | February  |
| 2     | March     |
| 3     | April     |
| 4     | May       |
| 5     | June      |
| 6     | July      |
| 7     | August    |
| 8     | September |
| 9     | October   |
| 10    | November  |
| 11    | December  |

```javascript
let today = new Date();
console.log(today.getMonth()); // e.g., 1 (February)

// Map month number to month name
let months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
console.log(months[today.getMonth()]); // "February"

// Get next month
let nextMonth = (today.getMonth() + 1) % 12;
console.log("Next month: " + months[nextMonth]); // "March"
```

> **Note:** Months are **0-indexed** → Always add 1 when displaying to users.

---

## 8. `getFullYear()`

Returns the **full year** (4 digits).

```javascript
let today = new Date();
console.log(today.getFullYear()); // 2026

// Calculate age
let birthYear = 1995;
let age = today.getFullYear() - birthYear;
console.log("Age: " + age); // 31

// Check for leap year
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}
console.log(isLeapYear(2026)); // false
console.log(isLeapYear(2024)); // true
```

> **Note:** Use `getFullYear()` instead of the deprecated `getYear()`.

---

## 9. `getHours()`

Returns the **hour** (0–23) in 24-hour format.

```javascript
let now = new Date();
console.log(now.getHours()); // e.g., 14

// Convert to 12-hour format
let hours = now.getHours();
let period = hours >= 12 ? "PM" : "AM";
let hours12 = hours % 12 || 12; // Convert 0 to 12
console.log(hours12 + " " + period); // "2 PM"

// Greeting based on time
if (hours < 12) {
    console.log("Good Morning!");
} else if (hours < 17) {
    console.log("Good Afternoon!");
} else {
    console.log("Good Evening!");
}
```

---

## 10. `getMinutes()`

Returns the **minutes** (0–59).

```javascript
let now = new Date();
console.log(now.getMinutes()); // e.g., 30

// Format with leading zero
let minutes = now.getMinutes();
let formatted = minutes < 10 ? "0" + minutes : minutes;
console.log(formatted); // "30" or "05"
```

---

## 11. `getSeconds()`

Returns the **seconds** (0–59).

```javascript
let now = new Date();
console.log(now.getSeconds()); // e.g., 45

// Format time as HH:MM:SS
let h = String(now.getHours()).padStart(2, "0");
let m = String(now.getMinutes()).padStart(2, "0");
let s = String(now.getSeconds()).padStart(2, "0");
console.log(`${h}:${m}:${s}`); // "14:30:45"
```

---

## 12. `getMilliseconds()`

Returns the **milliseconds** (0–999).

```javascript
let now = new Date();
console.log(now.getMilliseconds()); // e.g., 123

// Precise time measurement
let start = new Date();
// ... some operation ...
let end = new Date();
let diff = end.getTime() - start.getTime();
console.log("Operation took " + diff + " milliseconds");
```

---

## 13. Creating a Custom Date

You can create custom dates using the `Date` constructor with specific values.

### Method 1: Using Date String

```javascript
let customDate1 = new Date("2026-12-25");
console.log(customDate1); // Thu Dec 25 2026

let customDate2 = new Date("February 14, 2026");
console.log(customDate2); // Sat Feb 14 2026

let customDate3 = new Date("2026-02-10T14:30:00");
console.log(customDate3); // Tue Feb 10 2026 14:30:00
```

### Method 2: Using Individual Values

```javascript
// new Date(year, month, day, hours, minutes, seconds, milliseconds)
let birthday = new Date(1995, 5, 15); // June 15, 1995 (month is 0-indexed)
console.log(birthday);

let eventDate = new Date(2026, 11, 31, 23, 59, 59); // Dec 31, 2026 at 11:59:59 PM
console.log(eventDate);
```

### Method 3: Using Timestamps (Milliseconds)

```javascript
let fromTimestamp = new Date(1770633000000);
console.log(fromTimestamp);

// Get timestamp from a date
let ts = new Date("2026-02-10").getTime();
console.log(ts); // Milliseconds since epoch
```

---

## 14. Setter Methods (Additional Content)

Just like getter methods, JavaScript provides **setter methods** to modify date values.

| Method               | Description                      |
|----------------------|----------------------------------|
| `setFullYear()`      | Sets the year                    |
| `setMonth()`         | Sets the month (0–11)            |
| `setDate()`          | Sets the day of the month (1–31) |
| `setHours()`         | Sets the hour (0–23)             |
| `setMinutes()`       | Sets the minutes (0–59)          |
| `setSeconds()`       | Sets the seconds (0–59)          |
| `setMilliseconds()`  | Sets the milliseconds (0–999)    |
| `setTime()`          | Sets the time (milliseconds)     |

```javascript
let date = new Date();

date.setFullYear(2030);
console.log(date.getFullYear()); // 2030

date.setMonth(11); // December
console.log(date.getMonth()); // 11

date.setDate(25);
console.log(date.getDate()); // 25

date.setHours(10);
date.setMinutes(30);
date.setSeconds(0);
console.log(date); // Dec 25, 2030 at 10:30:00
```

---

## 15. Other Useful Date Methods (Additional Content)

| Method                  | Description                                          |
|-------------------------|------------------------------------------------------|
| `toString()`            | Full date and time as a string                       |
| `toDateString()`        | Date portion as a readable string                    |
| `toTimeString()`        | Time portion as a readable string                    |
| `toISOString()`         | Date in ISO 8601 format                              |
| `toUTCString()`         | Date as a UTC string                                 |
| `toLocaleString()`      | Date and time in locale format                       |
| `Date.now()`            | Current timestamp in milliseconds (static method)    |
| `Date.parse()`          | Parses a date string and returns milliseconds        |

```javascript
let now = new Date();

console.log(now.toString());
// "Tue Feb 10 2026 14:30:00 GMT+0530 (India Standard Time)"

console.log(now.toDateString());
// "Tue Feb 10 2026"

console.log(now.toTimeString());
// "14:30:00 GMT+0530 (India Standard Time)"

console.log(now.toISOString());
// "2026-02-10T09:00:00.000Z"

console.log(now.toUTCString());
// "Tue, 10 Feb 2026 09:00:00 GMT"

console.log(now.toLocaleString());
// "2/10/2026, 2:30:00 PM"

console.log(Date.now());
// 1770633000000 (current timestamp)

console.log(Date.parse("2026-02-10"));
// 1770595200000
```

---

## 16. Date Comparisons (Additional Content)

```javascript
let date1 = new Date("2026-02-10");
let date2 = new Date("2026-03-15");

// Using getTime()
if (date1.getTime() === date2.getTime()) {
    console.log("Dates are equal");
} else if (date1.getTime() < date2.getTime()) {
    console.log("date1 is earlier"); // ✅
} else {
    console.log("date1 is later");
}

// Using comparison operators
console.log(date1 > date2);  // false
console.log(date1 < date2);  // true
console.log(date1 >= date2); // false
```

---

## 17. Date Arithmetic (Additional Content)

```javascript
// Add 7 days
let today = new Date();
let nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);
console.log("Next week: " + nextWeek.toDateString());

// Difference between two dates (in days)
let startDate = new Date("2026-01-01");
let endDate = new Date("2026-02-10");
let diffMs = endDate.getTime() - startDate.getTime();
let diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
console.log("Difference: " + diffDays + " days"); // 40

// Add 3 months
let futureDate = new Date();
futureDate.setMonth(futureDate.getMonth() + 3);
console.log("3 months later: " + futureDate.toDateString());
```

---

## 18. Practical Examples (Additional Content)

### Digital Clock

```javascript
function displayClock() {
    let now = new Date();
    let h = String(now.getHours()).padStart(2, "0");
    let m = String(now.getMinutes()).padStart(2, "0");
    let s = String(now.getSeconds()).padStart(2, "0");
    console.log(`${h}:${m}:${s}`);
}

setInterval(displayClock, 1000); // Updates every second
```

### Countdown Timer

```javascript
function countdown(targetDate) {
    let now = new Date();
    let target = new Date(targetDate);
    let diff = target.getTime() - now.getTime();

    if (diff <= 0) {
        console.log("The event has passed!");
        return;
    }

    let days = Math.floor(diff / (1000 * 60 * 60 * 24));
    let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((diff % (1000 * 60)) / 1000);

    console.log(`${days}d ${hours}h ${minutes}m ${seconds}s remaining`);
}

countdown("2026-12-31"); // Countdown to New Year's Eve
```

### Format Date as DD/MM/YYYY

```javascript
function formatDate(date) {
    let d = String(date.getDate()).padStart(2, "0");
    let m = String(date.getMonth() + 1).padStart(2, "0");
    let y = date.getFullYear();
    return `${d}/${m}/${y}`;
}

console.log(formatDate(new Date())); // "10/02/2026"
```

### Calculate Age from Birthdate

```javascript
function calculateAge(birthDate) {
    let today = new Date();
    let birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    let monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
}

console.log(calculateAge("1995-06-15")); // e.g., 30
```

---

## Summary Table

| Method                  | Returns                           | Range       |
|-------------------------|-----------------------------------|-------------|
| `new Date()`            | Current date & time object        | –           |
| `toLocaleDateString()`  | Locale-formatted date string      | –           |
| `toLocaleTimeString()`  | Locale-formatted time string      | –           |
| `getTime()`             | Milliseconds since epoch          | –           |
| `getDay()`              | Day of the week                   | 0–6         |
| `getDate()`             | Day of the month                  | 1–31        |
| `getMonth()`            | Month                             | 0–11        |
| `getFullYear()`         | Full year                         | 4 digits    |
| `getHours()`            | Hours                             | 0–23        |
| `getMinutes()`          | Minutes                           | 0–59        |
| `getSeconds()`          | Seconds                           | 0–59        |
| `getMilliseconds()`     | Milliseconds                      | 0–999       |
| `Date.now()`            | Current timestamp (ms)            | –           |
| `Date.parse()`          | Timestamp from date string        | –           |
| `toISOString()`         | ISO 8601 formatted string         | –           |
| `toDateString()`        | Readable date string              | –           |
| `toTimeString()`        | Readable time string              | –           |
