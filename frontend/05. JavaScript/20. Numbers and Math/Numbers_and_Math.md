# JavaScript Numbers and Math

JavaScript has a single numeric type for “ordinary” numbers: **IEEE-754 double-precision floating-point** (`number`). That design choice affects literals, equality, rounding, and which values are representable exactly. This guide covers the `Number` type, instance and static APIs, `BigInt` for integers beyond the safe integer range, the `Math` object for common mathematical operations, and `Intl.NumberFormat` for human-readable, locale-aware formatting.

---

## 📑 Table of Contents

1. [Number Basics](#1-number-basics)
2. [Number Methods](#2-number-methods)
3. [Number Static Methods](#3-number-static-methods)
4. [BigInt (ES2020)](#4-bigint-es2020)
5. [Math Object](#5-math-object)
6. [Number Formatting](#6-number-formatting)
7. [Best Practices](#best-practices)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 1. Number Basics

### 1.1 The `number` Type

In JavaScript, **all** “normal” numbers—integers and fractions—are values of the primitive type `number`. There is no separate `float` or `int` type in the language surface.

```javascript
typeof 42;        // "number"
typeof 3.14;      // "number"
typeof NaN;       // "number" (Not-a-Number is still type number)
typeof Infinity;  // "number"
```

### 1.2 Literal Formats

**Decimal** literals are the usual base-10 form. Underscores (`_`) are allowed as digit separators in modern JavaScript (ES2021) for readability.

```javascript
let a = 255;
let b = 1_000_000;
let c = 0.5;
let d = .5;       // same as 0.5
let e = 5e2;      // 500 (scientific notation)
let f = 5e-2;     // 0.05
```

**Hexadecimal** literals use the `0x` or `0X` prefix (base 16).

```javascript
let hex = 0xff;       // 255
let hex2 = 0x10;      // 16
console.log(hex.toString(16)); // "ff"
```

**Binary** literals use the `0b` or `0B` prefix (base 2).

```javascript
let bin = 0b1010;   // 10
let bin2 = 0b1111;  // 15
```

**Octal** literals use the `0o` or `0O` prefix (base 8). A leading `0` followed by octal digits was legacy behavior; prefer explicit `0o`.

```javascript
let oct = 0o377;    // 255
```

### 1.3 Floating-Point Precision

Numbers are stored as **64-bit doubles**. Many decimal fractions **cannot** be represented exactly in binary floating-point, which leads to small rounding errors.

```javascript
console.log(0.1 + 0.2);           // 0.30000000000000004
console.log((0.1 + 0.2) === 0.3); // false
```

For **money** or **exact decimal** arithmetic, use integers (e.g. cents), a decimal library, or `BigInt` where appropriate—not raw `number` for “penny perfect” sums.

```javascript
// Example: work in cents
let priceCents = 1099;
let taxCents = Math.round(priceCents * 0.08); // 88
let totalCents = priceCents + taxCents;       // 1187 → $11.87
```

### 1.4 Integer vs Float (Conceptual)

JavaScript does not distinguish types, but **safe integers** are those where the value and `value + 1` are both exactly representable as `number`. The constant `Number.MAX_SAFE_INTEGER` marks the upper bound.

```javascript
Number.MAX_SAFE_INTEGER;  // 9007199254740991 (2^53 - 1)
Number.MIN_SAFE_INTEGER;  // -9007199254740991

let n = Number.MAX_SAFE_INTEGER;
console.log(n === n + 1); // true — precision lost; no longer unique integers
```

### 1.5 Number Range: `MIN_VALUE`, `MAX_VALUE`

- **`Number.MAX_VALUE`**: Largest finite positive number (~1.79 × 10^308).
- **`Number.MIN_VALUE`**: Smallest **positive** number greater than zero (~5 × 10^-324), not the most negative number.

```javascript
console.log(Number.MAX_VALUE);              // 1.7976931348623157e+308
console.log(Number.MAX_VALUE * 2);          // Infinity
console.log(Number.MIN_VALUE);              // 5e-324
console.log(-Number.MAX_VALUE);             // largest magnitude negative finite
```

### 1.6 `Infinity` and `-Infinity`

Division by zero yields infinity (not an error). `Infinity` is a numeric value.

```javascript
console.log(1 / 0);              // Infinity
console.log(-1 / 0);             // -Infinity
console.log(Infinity > 1e308);   // true
console.log(Number.POSITIVE_INFINITY === Infinity); // true
console.log(Number.NEGATIVE_INFINITY === -Infinity); // true
```

### 1.7 `NaN`

**NaN** (“Not-a-Number”) means the result of an invalid numeric operation. Uniquely, **`NaN !== NaN`**.

```javascript
console.log(NaN === NaN);           // false
console.log(Number.NaN);            // NaN
console.log(Math.sqrt(-1));         // NaN
console.log("abc" * 2);             // NaN
```

Use `Number.isNaN(value)` (recommended) instead of the global `isNaN` when you only care about the true NaN value (see Section 3).

```javascript
console.log(Number.isNaN(NaN));     // true
console.log(Number.isNaN("NaN")); // false — string is not NaN
```

### 1.8 `Number.EPSILON` and Comparing Floats

`Number.EPSILON` is the difference between `1` and the next representable `number` greater than `1` (~2.22 × 10^-16). Use it (or a custom tolerance) to compare floats “close enough.”

```javascript
function approxEqual(a, b, epsilon = Number.EPSILON) {
  return Math.abs(a - b) < epsilon;
}

console.log(approxEqual(0.1 + 0.2, 0.3)); // often true with default epsilon
```

### 1.9 `Object.is` and Edge Cases

`Object.is` treats `NaN` as equal to `NaN` and distinguishes `+0` from `-0`.

```javascript
Object.is(NaN, NaN);   // true
Object.is(0, -0);      // false
Object.is(-0, -0);     // true
NaN === NaN;           // false
```

---

## 2. Number Methods

These methods exist on **number primitives** (autoboxed to `Number`) and on `Number` instances.

### 2.1 `toString([radix])`

Returns a string representation. Optional **radix** (2–36) selects the base.

```javascript
(255).toString();      // "255"
(255).toString(16);    // "ff"
(10).toString(2);      // "1010"
(36).toString(36);    // "10"
```

### 2.2 `toFixed([digits])`

Returns a string with a fixed number of digits **after** the decimal point (0–100). **Rounds** half-away-from-zero in typical engines for decimal output.

```javascript
let x = 3.14159;
console.log(x.toFixed(2));   // "3.14"
console.log((2.5).toFixed(0)); // "3" (rounded)
console.log((1.005).toFixed(2)); // may be "1.00" or "1.01" — floating-point artifact
```

### 2.3 `toExponential([fractionDigits])`

Returns a string in **scientific notation** (one digit before the decimal unless overridden).

```javascript
let n = 1234.56;
console.log(n.toExponential());    // "1.23456e+3"
console.log(n.toExponential(2));   // "1.23e+3"
```

### 2.4 `toPrecision([precision])`

Returns a string with **total significant digits** (1–100), choosing fixed or exponential form as needed.

```javascript
let v = 123.456;
console.log(v.toPrecision(4));  // "123.5"
console.log(v.toPrecision(2));  // "1.2e+2"
console.log((0.0001234).toPrecision(2)); // "0.00012"
```

### 2.5 `valueOf()`

Returns the primitive numeric value of a `Number` object; rarely needed explicitly.

```javascript
let obj = new Number(42);
console.log(obj.valueOf());  // 42
console.log(typeof obj.valueOf()); // "number"
```

---

## 3. Number Static Methods

### 3.1 `Number.isNaN(value)`

Returns `true` **only** if `value` is `NaN`. Does **not** coerce to number (unlike global `isNaN`).

```javascript
Number.isNaN(NaN);           // true
Number.isNaN(0 / 0);         // true
Number.isNaN("NaN");         // false
Number.isNaN(undefined);     // false
```

### 3.2 `Number.isFinite(value)`

Returns `true` if `value` is a **number** and is neither `Infinity`, `-Infinity`, nor `NaN`. No coercion.

```javascript
Number.isFinite(100);        // true
Number.isFinite(Infinity);   // false
Number.isFinite(NaN);      // false
Number.isFinite("100");    // false — not a number type
```

### 3.3 `Number.isInteger(value)`

Returns `true` if `value` is a finite number with no fractional part.

```javascript
Number.isInteger(4);         // true
Number.isInteger(4.0);       // true
Number.isInteger(4.1);       // false
Number.isInteger(NaN);      // false
```

### 3.4 `Number.isSafeInteger(value)`

Returns `true` if `value` is an integer between `MIN_SAFE_INTEGER` and `MAX_SAFE_INTEGER` inclusive.

```javascript
Number.isSafeInteger(9007199254740991);   // true
Number.isSafeInteger(9007199254740992);   // false
```

### 3.5 `Number.parseFloat(string)`

Parses a string to a floating-point number, like global `parseFloat` but lives on `Number` for consistency.

```javascript
Number.parseFloat("3.14");       // 3.14
Number.parseFloat("  3.14px");  // 3.14 (stops at first invalid char for float)
Number.parseFloat("abc");        // NaN
```

### 3.6 `Number.parseInt(string[, radix])`

Parses an integer; **`radix` should always be provided** (e.g. `10`) to avoid legacy octal interpretation on leading zeros in non-strict old code paths.

```javascript
Number.parseInt("42", 10);       // 42
Number.parseInt("ff", 16);       // 255
Number.parseInt("1010", 2);      // 10
Number.parseInt("10px", 10);     // 10
Number.parseInt("0x10");         // 16 (hex if string starts with 0x)
```

---

## 4. BigInt (ES2020)

`BigInt` is a separate primitive type for **arbitrary-precision integers**. It is **not** interchangeable with `number` in arithmetic without explicit conversion.

### 4.1 Creation

```javascript
let a = 123456789012345678901234567890n; // suffix n
let b = BigInt("123456789012345678901234567890");
let c = BigInt(42);                      // 42n
let d = BigInt(true);                    // 1n
```

### 4.2 Operations

`+`, `-`, `*`, `**`, `%` work with two `BigInt` operands. Division truncates toward zero (integer division).

```javascript
let x = 10n;
let y = 3n;
console.log(x + y);   // 13n
console.log(x * y);   // 30n
console.log(x / y);   // 3n
console.log(x % y);   // 1n
console.log(x ** 2n); // 100n
```

### 4.3 Limitations

- **No mixing** with `number` using `+`, etc., without conversion (throws `TypeError`).
- **No** `Math` methods for `BigInt` in the same way as numbers.
- **JSON**: `JSON.stringify` does not support `BigInt` by default (throws unless you use a replacer).

```javascript
// 1n + 1; // TypeError

let sum = 1n + BigInt(1); // 2n
let asNumber = Number(9007199254740993n); // may lose precision

try {
  JSON.stringify({ id: 1n });
} catch (e) {
  console.log(e.name); // TypeError
}
```

### 4.4 Comparison with `Number`

| Aspect | `number` | `BigInt` |
|--------|----------|----------|
| Type | IEEE-754 double | Arbitrary integer |
| Safe integers | ±(2^53 − 1) | Limited by memory |
| Decimals | Yes | No |
| `typeof` | `"number"` | `"bigint"` |

```javascript
console.log(typeof 1);    // "number"
console.log(typeof 1n);   // "bigint"
console.log(1n == 1);     // true (loose equality)
console.log(1n === 1);    // false (strict — different types)
```

---

## 5. Math Object

`Math` is a built-in **namespace object** (not a constructor). All properties and methods are static.

### 5.1 Constants

```javascript
console.log(Math.PI);   // 3.141592653589793
console.log(Math.E);    // 2.718281828459045
console.log(Math.LN2);  // 0.6931471805599453 (ln(2))
console.log(Math.LN10); // 2.302585092994046
console.log(Math.LOG2E);  // log base 2 of e
console.log(Math.LOG10E); // log base 10 of e
console.log(Math.SQRT2);  // 1.4142135623730951
console.log(Math.SQRT1_2); // sqrt(1/2)
```

### 5.2 `Math.abs(x)`

Absolute value.

```javascript
Math.abs(-7);    // 7
Math.abs(7);     // 7
Math.abs(-0);    // 0
```

### 5.3 `Math.round(x)`, `Math.ceil(x)`, `Math.floor(x)`, `Math.trunc(x)`

- **`round`**: nearest integer (ties round **up** for positive .5 in typical ES behavior).
- **`ceil`**: smallest integer ≥ x.
- **`floor`**: largest integer ≤ x.
- **`trunc`**: removes fractional part (toward zero).

```javascript
Math.round(4.5);   // 5
Math.round(-4.5);  // -4
Math.ceil(4.1);    // 5
Math.floor(4.9);   // 4
Math.trunc(4.9);   // 4
Math.trunc(-4.9);  // -4
```

### 5.4 `Math.max(...values)`, `Math.min(...values)`

Return the largest or smallest of the arguments. Use spread for arrays.

```javascript
Math.max(1, 5, 3);           // 5
Math.min(1, 5, 3);           // 1
Math.max(...[1, 8, 2]);      // 8
Math.max();                  // -Infinity
Math.min();                  // Infinity
```

### 5.5 `Math.pow(base, exponent)`, `Math.sqrt(x)`, `Math.cbrt(x)`

```javascript
Math.pow(2, 10);   // 1024
Math.pow(9, 0.5);  // 3
Math.sqrt(16);     // 4
Math.cbrt(27);     // 3
```

### 5.6 `Math.random()`

Returns a pseudo-random number in **[0, 1)**.

```javascript
let r = Math.random();
console.log(r >= 0 && r < 1); // true

// Integer from 0 to 9 inclusive
let digit = Math.floor(Math.random() * 10);

// Integer from min to max inclusive
function randomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
console.log(randomIntInclusive(1, 6));
```

> **Security note:** `Math.random` is **not** cryptographically secure. Use `crypto.getRandomValues()` for keys, tokens, etc.

```javascript
// Cryptographically strong random bytes (browser / modern Node)
function randomUint32() {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0];
}
```

### 5.7 Trigonometric Functions

Angles are in **radians**. Use `degrees * Math.PI / 180` to convert.

```javascript
let rad = Math.PI / 2;
console.log(Math.sin(rad));  // 1
console.log(Math.cos(0));    // 1
console.log(Math.tan(Math.PI / 4)); // ~1

console.log(Math.asin(1));   // π/2
console.log(Math.acos(1));   // 0
console.log(Math.atan(1));    // π/4
console.log(Math.atan2(1, 1)); // π/4 (y, x — quadrant-aware)
```

### 5.8 Logarithmic Functions

```javascript
Math.log(Math.E);    // 1 (natural log)
Math.log10(100);     // 2
Math.log2(8);        // 3
Math.exp(1);         // E
```

### 5.9 `Math.sign(x)`

Returns `1`, `-1`, `0`, `-0`, or `NaN` according to the sign of `x`.

```javascript
Math.sign(42);     // 1
Math.sign(-42);    // -1
Math.sign(0);      // 0
Math.sign(-0);     // -0
Math.sign(NaN);    // NaN
```

### 5.10 `Math.hypot(...values)`

Square root of sum of squares (avoids overflow for large components).

```javascript
Math.hypot(3, 4);           // 5
Math.hypot(3, 4, 12);       // 13
```

### 5.11 `Math.imul(a, b)`

32-bit integer multiplication of the low 32 bits (useful for algorithms, hashing, asm.js-style code).

```javascript
Math.imul(0xffffffff, 5); // -5 (32-bit overflow semantics)
Math.imul(2, 3);          // 6
```

### 5.12 Other Handy `Math` Methods (Brief)

```javascript
// Clamp pattern (not built into Math — common utility)
const clamp = (x, lo, hi) => Math.min(Math.max(x, lo), hi);
console.log(clamp(150, 0, 100)); // 100

Math.fround(1.337);     // 32-bit float rounding
Math.cosh(0);           // 1 — hyperbolic cosine
Math.sinh(0);           // 0
Math.tanh(0);           // 0
Math.expm1(1e-10);      // ~1e-10 — more accurate than Math.exp(1e-10) - 1 for tiny x
Math.log1p(1e-10);      // ~1e-10 — accurate ln(1+x) for small x
```

### 5.13 Bitwise Helpers on `Math` (ES2015+)

```javascript
Math.clz32(1);   // 31 — count leading zero bits in 32-bit representation
Math.clz32(0);   // 32
Math.fround(1.5); // 1.5 as IEEE-754 float32
```

---

## 6. Number Formatting

The **`Intl.NumberFormat`** constructor produces locale-sensitive number formatters (decimals, grouping, currency, percent, units).

### 6.1 Basic Locale Formatting

```javascript
let n = 1234567.89;

console.log(new Intl.NumberFormat("en-US").format(n));
// "1,234,567.89"

console.log(new Intl.NumberFormat("de-DE").format(n));
// "1.234.567,89"

console.log(new Intl.NumberFormat("en-IN").format(n));
// "12,34,567.89" (Indian grouping)
```

### 6.2 Options: Minimum / Maximum Fraction Digits

```javascript
let formatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
console.log(formatter.format(5));    // "5.00"
console.log(formatter.format(3.141)); // "3.14"
```

### 6.3 Currency

Use `style: "currency"` and a valid **currency** code (ISO 4217).

```javascript
let usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});
console.log(usd.format(1999.5)); // "$1,999.50"

let eur = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR"
});
console.log(eur.format(1999.5)); // "1.999,50 €"

let jpy = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY"
});
console.log(jpy.format(1999)); // "￥1,999" (no fractional yen in typical display)
```

### 6.4 Percentage

```javascript
let pct = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});
console.log(pct.format(0.756));  // "75.6%"
console.log(pct.format(1));      // "100.0%"
```

### 6.5 Unit Formatting (Intl)

Modern environments support **unit** style with `unit` and `unitDisplay`.

```javascript
let speed = new Intl.NumberFormat("en-US", {
  style: "unit",
  unit: "kilometer-per-hour",
  unitDisplay: "short"
});
console.log(speed.format(88)); // "88 km/h" (exact string depends on engine/locale data)
```

### 6.6 Reusing a Formatter

Formatters are relatively expensive to create; reuse one instance when formatting many values in a loop.

```javascript
const fmt = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP"
});
let prices = [10, 20.5, 99.99];
prices.map((p) => fmt.format(p));
```

### 6.7 Compact Notation (Large Numbers)

`notation: "compact"` displays values like “1.2M” or “3.5K” depending on locale.

```javascript
let big = 1_250_000;
let compact = new Intl.NumberFormat("en", {
  notation: "compact",
  compactDisplay: "short"
});
console.log(compact.format(big)); // e.g. "1.3M" (locale-dependent rounding)

let compactLong = new Intl.NumberFormat("en", {
  notation: "compact",
  compactDisplay: "long"
});
console.log(compactLong.format(1500)); // e.g. "1.5 thousand"
```

### 6.8 `formatToParts` for Custom UI

Split formatted output into typed parts (e.g. to style currency symbol separately).

```javascript
let nf = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});
console.log(nf.formatToParts(1234.56));
// [
//   { type: "currency", value: "$" },
//   { type: "integer", value: "1" },
//   { type: "group", value: "," },
//   ...
// ]
```

---

## Best Practices

1. **Prefer `Number.isNaN` / `Number.isFinite`** over global `isNaN` / `isFinite` when you want to avoid string coercion surprises.
2. **Always pass a radix** to `parseInt` (usually `10`) unless you intentionally parse another base.
3. **Compare floats with tolerance** (epsilon) or use integer (e.g. cents) math for monetary calculations.
4. **Check `Number.isSafeInteger`** before relying on exact integer IDs in the ±2^53 range boundary.
5. **Use `BigInt`** only when you need integers beyond safe integer range or exact large integers—not as a default replacement for all numbers.
6. **Reuse `Intl.NumberFormat` instances** for performance in hot paths.
7. **Use `crypto.getRandomValues`** instead of `Math.random` for anything security-sensitive.
8. **Document radix and locale** choices in code that parses or formats numbers for users across regions.

---

## Common Mistakes to Avoid

1. **Using `===` with computed floats** without rounding or epsilon: `0.1 + 0.2 === 0.3` is `false`.
2. **Using global `isNaN("hello")`** which coerces and can confuse debugging; use `Number.isNaN` for “is this the NaN value?”
3. **Assuming `toFixed` is always “banker’s rounding”** or exact for all decimals—underlying binary representation still matters.
4. **Treating `Number.MIN_VALUE` as the most negative number**—it is the smallest **positive** subnormal, not `-Number.MAX_VALUE`.
5. **Mixing `BigInt` and `number` in expressions** without `BigInt()` / `Number()`—this throws at runtime.
6. **Calling `Math.max()` or `Math.min()` with no arguments**—result is `-Infinity` / `Infinity`, which is rarely what you want.
7. **Forgetting that `Math.random()` excludes 1**—the range is `[0, 1)`, not `[0, 1]`.
8. **Using `parseInt` on large numbers**—for strings like `"900719925474099267"` precision may be lost when the result is still a `number`; consider `BigInt` for huge integers.
9. **Stringifying objects containing `BigInt`** with plain `JSON.stringify`—throws unless you customize serialization.
10. **Hard-coding currency symbols** instead of `Intl.NumberFormat`—breaks localization and grouping rules.

---

*End of notes — JavaScript Numbers and Math.*
