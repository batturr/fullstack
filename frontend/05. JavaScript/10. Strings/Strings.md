# JavaScript Strings

Strings in JavaScript represent textual data: sequences of UTF-16 code units. They are primitives (when created with literals) but behave like objects thanks to automatic boxing when you call methods. Understanding creation, immutability, Unicode, the rich `String` prototype API, regular expressions, and internationalization helps you write correct, locale-aware, and maintainable code in browsers and Node.js.

## 📑 Table of Contents

1. [String Basics](#1-string-basics)
2. [Template Literals (ES6)](#2-template-literals-es6)
3. [Searching Methods](#3-searching-methods)
4. [Extraction Methods](#4-extraction-methods)
5. [Modification Methods](#5-modification-methods)
6. [Case Methods](#6-case-methods)
7. [Splitting and Joining](#7-splitting-and-joining)
8. [Comparison](#8-comparison)
9. [Regex Methods](#9-regex-methods)
10. [Internationalization](#10-internationalization)
11. [Best Practices](#best-practices)
12. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 1. String Basics

### Creation: Literal vs Constructor

The usual way to create a string is a **string literal** (single quotes, double quotes, or backticks for template literals). The **`String` constructor** wraps a value in a string object (or returns a primitive string when called *without* `new` in normal usage).

```javascript
// Literal (primitive string)
const a = "hello";
const b = 'world';
const c = `template`; // also a string literal (see Template Literals section)

// String() as function — coerces to primitive string (preferred over `new String()`)
const n = String(42);           // "42"
const u = String(undefined);    // "undefined"

// `new String("x")` creates a String object (rarely needed; avoid in typical code)
const obj = new String("hi");
typeof obj; // "object"
obj.valueOf(); // "hi"
```

Prefer literals and `String(value)` for coercion. Avoid `new String()` unless you have a specific reason (it breaks `===` with primitives).

### Immutability

String values are **immutable**: methods return *new* strings; they do not change the original.

```javascript
let s = "abc";
s.toUpperCase(); // "ABC"
console.log(s);  // still "abc"

// "Changing" a string means reassigning the variable
s = s + "d";
console.log(s); // "abcd"
```

### Length

The read-only `.length` property returns the number of **UTF-16 code units**, not necessarily the number of user-visible characters (grapheme clusters) or Unicode code points.

```javascript
"hello".length; // 5

// Astral symbols (e.g. many emoji) use two UTF-16 code units (surrogate pair)
"😀".length; // 2

"e\u0301".length; // 2 (e + combining acute — still two code units)
```

### Character Access

Bracket notation with a numeric index returns a single-code-unit substring (or `undefined` out of range). Older style: `.charAt()` (covered in Extraction).

```javascript
const s = "hello";
s[0];  // "h"
s[4];  // "o"
s[10]; // undefined

// Bracket notation cannot assign (silently fails in non-strict legacy; still no mutation)
s[0] = "H";
console.log(s); // "hello" (unchanged)
```

### Unicode and Encoding

JavaScript strings are **UTF-16**. Code points above U+FFFF are stored as **surrogate pairs**. `codePointAt` and iteration helpers handle full code points better than raw index math.

```javascript
const emoji = "😀";
emoji.charCodeAt(0); // 55357 (high surrogate)
emoji.charCodeAt(1); // 56832 (low surrogate)

// Full code point at start of string
emoji.codePointAt(0); // 128512 (U+1F600)

// Spread or Array.from iterates by code point for many cases
[...emoji].length; // 1
```

### Escape Sequences

Inside quoted literals, backslash introduces **escape sequences**.

```javascript
// Common escapes
const quote = "He said \"Hi\"";  // quotes inside double-quoted string
const newline = "line1\nline2";    // newline
const tab = "col1\tcol2";        // tab
const backslash = "C:\\Users";   // backslash

// Unicode escapes (BMP): \uXXXX — one UTF-16 code unit
const pi = "\u03C0"; // "π"

// Unicode code point escape (ES6): \u{...} — full code point
const grin = "\u{1F600}"; // "😀"

// Template literal note: `${` must be escaped as `\${` if you want literal text
const raw = `Price: \${5}`; // "Price: ${5}"
```

---

## 2. Template Literals (ES6)

### Syntax

Template literals use **backticks** `` ` `` and can span multiple lines without `\n` escapes.

```javascript
const name = "Ada";
const greeting = `Hello, ${name}!`;
console.log(greeting); // "Hello, Ada!"

const multiline = `Line 1
Line 2
Line 3`;
console.log(multiline);
```

### String Interpolation

Expressions inside `${}` are evaluated and coerced to strings (via `ToString` semantics, like template concatenation).

```javascript
const a = 2;
const b = 3;
console.log(`${a} + ${b} = ${a + b}`); // "2 + 3 = 5"

const obj = { x: 1 };
console.log(`obj = ${obj}`); // default: "[object Object]" unless toString customized
```

### Multi-line Strings

Useful for HTML snippets, SQL (with care), or messages. Mind indentation: leading spaces inside the template are preserved.

```javascript
const html = `
  <article>
    <h1>Title</h1>
  </article>
`;
```

### Tagged Templates

A **tag** is a function called with `(strings, ...values)` where `strings` is an array of raw literal pieces including empty strings between interpolations.

```javascript
function highlight(strings, ...values) {
  return strings.reduce((acc, s, i) => {
    const v = values[i] !== undefined ? `[${values[i]}]` : "";
    return acc + s + v;
  }, "");
}

const who = "world";
highlight`Hello ${who}!`; // "Hello [world]!"

// `strings` has a special `raw` property on the array-like object
function logRaw(strings) {
  console.log(strings.raw[0]);
}
logRaw`a\tb`; // logs "a\\tb" (see Raw Strings below)
```

### Raw Strings (`String.raw`)

`String.raw` as a **tag** gives you the literal backslash sequences (useful for regex or paths).

```javascript
const path = String.raw`C:\Users\name\new_folder`;
console.log(path); // C:\Users\name\new_folder (real backslashes)

// Also available as a method on strings for tagged-like raw handling of a single string:
String.raw`\\`; // "\\"
```

---

## 3. Searching Methods

### `indexOf(searchString, position?)`

Returns the **index** of the first occurrence of `searchString`, or `-1` if not found. Optional `position` starts the search at that index.

```javascript
const s = "banana";
s.indexOf("na");        // 2
s.indexOf("na", 3);     // 4 (search from index 3)
s.indexOf("x");         // -1

// Empty search string: match at start index (ECMAScript behavior)
"abc".indexOf("", 1);   // 1
"abc".indexOf("", 10);  // 3 (clamped to string length)
```

### `lastIndexOf(searchString, position?)`

Like `indexOf`, but searches **backward** from the string end (or from `position` if provided).

```javascript
const s = "banana";
s.lastIndexOf("na");    // 4
s.lastIndexOf("na", 3); // 2 (search backward from index 3)

// Empty string: finds at or before `position` (clamped)
"abc".lastIndexOf("", 2); // 2
```

### `search(regexp)`

Takes a **regular expression** (or something coerced to one). Returns the index of the first match or `-1`. Unlike `indexOf`, you cannot pass a plain string without it becoming a regex.

```javascript
const s = "foo123bar";
s.search(/\d+/);   // 3
s.search("[0-9]"); // 3 (string pattern treated as RegExp source)

s.search(/z/);     // -1

// First match wins; global flag on regex does not change "first match" semantics
"aa".search(/a/g); // 0
```

### `includes(searchString, position?)`

Returns **boolean**: whether the substring exists at or after `position` (default `0`).

```javascript
const s = "hello world";
s.includes("world");     // true
s.includes("world", 7);  // true
s.includes("world", 8);  // false
s.includes("hi");        // false

// Empty string is always found at valid positions
"abc".includes("", 3);    // true (at end)
```

### `startsWith(searchString, position?)`

Returns whether the string **starts with** `searchString` at `position` (default `0`).

```javascript
const s = "https://example.com";
s.startsWith("https");       // true
s.startsWith("example", 8); // true (index 8 is "e" of example)
s.startsWith("http");       // true

// Case-sensitive, literal substring (not regex)
"Hello".startsWith("hel");  // true
"Hello".startsWith("Hel");  // false
```

### `endsWith(searchString, length?)`

Returns whether the string ends with `searchString` when considering only the first `length` code units (default: full string length).

```javascript
const s = "report.pdf";
s.endsWith(".pdf");        // true
s.endsWith("port", 6);     // true (first 6 chars: "report")
s.endsWith(".doc");        // false

// `length` shorter than searchString → false
"hello".endsWith("hello", 3); // false
```

---

## 4. Extraction Methods

### `substring(start, end?)`

Returns the substring from `start` (inclusive) to `end` (**exclusive**). Negative or `NaN` indices are treated as `0`. If `start > end`, arguments are **swapped**.

```javascript
const s = "abcdef";
s.substring(2, 5);   // "cde"
s.substring(5, 2);   // "cde" (swapped)
s.substring(-1);   // "abcdef" (negative -> 0)
```

### `substr(start, length?)` (deprecated)

**Deprecated**; avoid in new code. Starts at `start` and returns up to `length` code units. Use `slice` or `substring` instead.

```javascript
const s = "abcdef";
s.substr(2, 3); // "cde" (still works in engines, but deprecated)
```

### `slice(start, end?)`

Similar to `substring`, but **negative** indices count from the end, and there is **no swapping** if `start > end` (returns empty or partial as per rules).

```javascript
const s = "abcdef";
s.slice(2, 5);    // "cde"
s.slice(-3);      // "def" (last 3)
s.slice(5, 2);    // "" (empty — no swap)
s.slice(-3, -1);  // "de"
```

### `charAt(index)`

Returns the single-code-unit string at `index`, or `""` if out of range (no `undefined`).

```javascript
const s = "abc";
s.charAt(0);  // "a"
s.charAt(10); // ""
```

### `charCodeAt(index)`

Returns the **UTF-16 code unit** (0–65535) at `index`, or `NaN` if out of range.

```javascript
const s = "A😀";
s.charCodeAt(0); // 65 ('A')
s.charCodeAt(1); // 55357 (high surrogate of 😀)
```

### `codePointAt(index)`

Returns the **Unicode code point** starting at `index` (may consume a surrogate pair), or `undefined` if invalid position.

```javascript
const s = "A😀";
s.codePointAt(0); // 65
s.codePointAt(1); // 128512 (full emoji code point)
s.codePointAt(2); // 56832 (low surrogate alone — still a number, but not ideal usage)

### `at(index)` (ES2022)

Returns the substring of one code unit at `index`, or `undefined` if out of range — similar to bracket notation but supports **negative** indices.

```javascript
const s = "abc";
s.at(0);   // "a"
s.at(-1);  // "c"
s.at(10);  // undefined
```

### Choosing `slice` vs `substring`

Use **`slice`** when you need **negative indices** or predictable behavior when `start > end`. Use **`substring`** only when you explicitly want **argument swapping** and `NaN`/negative clamping to zero.

```javascript
const s = "012345";
s.slice(-2);        // "45"
s.substring(-2);    // "012345" (negative → 0)
```

---

## 5. Modification Methods

### `concat(str1, str2, ...)`

Returns a new string concatenating all arguments. The `+` operator and template literals are usually clearer.

```javascript
const s = "Hello";
s.concat(", ", "world", "!"); // "Hello, world!"
```

### `repeat(count)` (ES2015)

Repeats the string `count` times. `count` must be a finite non-negative integer (or coerced).

```javascript
"ab".repeat(3); // "ababab"
"x".repeat(0);  // ""

// RangeError if count is negative or not finite integer after coercion
try {
  "a".repeat(-1);
} catch (e) {
  console.log(e.name); // RangeError
}
```

### `padStart(targetLength, padString?)`

Pads the **start** until the string reaches `targetLength` (code units). Default pad is space.

```javascript
"5".padStart(3, "0");     // "005"
"hi".padStart(5, "abc");  // "abchi" (truncates pad as needed)
```

### `padEnd(targetLength, padString?)`

Same as `padStart`, but pads the **end**.

```javascript
"5".padEnd(3, "0");       // "500"
"ok".padEnd(6, ".");      // "ok...."
```

### `trim()`

Removes **whitespace** from both ends (per ECMAScript whitespace and line terminators).

```javascript
"  hello  \n".trim(); // "hello"

// NBSP (U+00A0) is NOT trimmed by trim() in ECMAScript — only defined whitespace
const nbsp = "\u00A0hello\u00A0";
nbsp.trim(); // still contains NBSP on both sides if only NBSP used
"  hi\u00A0".trim(); // "hi\u00A0" — trailing NBSP remains
```

### `trimStart()` / `trimLeft()`

Removes leading whitespace. `trimLeft` is an alias (legacy name).

```javascript
"  hello  ".trimStart(); // "hello  "
```

### `trimEnd()` / `trimRight()`

Removes trailing whitespace.

```javascript
"  hello  ".trimEnd(); // "  hello"
```

### `replace(searchValue, replaceValue)`

Replaces the **first** occurrence when `searchValue` is a string. With a **global** `RegExp`, replaces all matches.

```javascript
"a-a-a".replace("-", "/");     // "a/a-a" (first only)
"a-a-a".replace(/-/g, "/");   // "a/a/a"

// Replacement patterns with capture groups
"John Doe".replace(/(\w+) (\w+)/, "$2, $1"); // "Doe, John"

// Callable replacement
"1+2".replace(/\d/g, (m) => Number(m) * 10); // "10+20"
```

#### Replacement placeholders in string `replaceValue`

In the **replacement string**, `$&` is the whole match, `` $` `` is text before match, `$'` after, `$n` is capture group `n`, `$$` is a literal dollar.

```javascript
"abcd".replace(/bc/, "[$`-$&-$']"); // "a[ab-bc-d]d"

"foo bar".replace(/(\w+) (\w+)/, "$2 $1"); // "bar foo"

"price".replace(/e/, "$$"); // "pric$"
```

### `replaceAll(searchValue, replaceValue)` (ES2021)

When `searchValue` is a **string**, replaces **all** occurrences. With `RegExp`, the regex **must** have the `g` flag or a `TypeError` is thrown.

```javascript
"a-a-a".replaceAll("-", "/"); // "a/a/a"

try {
  "a-a".replaceAll(/-/, "/"); // TypeError: must use g flag
} catch (e) {
  console.log(e.name); // TypeError
}

"a-a".replaceAll(/-/g, "/"); // "a/a"
```

---

## 6. Case Methods

### `toLowerCase()` / `toUpperCase()`

Locale-**insensitive** default Unicode case mapping (good for ASCII; may not match every human language rule).

```javascript
"Hello".toLowerCase(); // "hello"
"Hello".toUpperCase(); // "HELLO"
```

### `toLocaleLowerCase(locales?)` / `toLocaleUpperCase(locales?)`

Uses **locale-sensitive** rules. Pass a BCP 47 locale tag (string or array).

```javascript
const tr = "İstanbul";
tr.toLocaleLowerCase("tr-TR"); // "istanbul" (Turkish dotted I rules)

const de = "STRASSE";
de.toLocaleLowerCase("de-DE"); // may apply ß rules depending on engine/version
```

Use locale-aware methods when the string is **user-facing text** in a known language.

---

## 7. Splitting and Joining

### `split(separator?, limit?)`

Splits a string into an **array** of substrings. If `separator` is omitted, the whole string becomes a single element. If `separator` is `""`, splits into UTF-16 code units (not full code points for astral symbols — same caveat as indexing).

```javascript
"a,b,c".split(",");           // ["a", "b", "c"]
"a||b".split("|");            // ["a", "", "b"]
"hello".split("");            // ["h","e","l","l","o"]

// Limit
"a,b,c,d".split(",", 2);      // ["a", "b"]

// No separator
"whole".split();              // ["whole"]
```

### `split` with RegExp

A regex can split on **patterns**, including captures (captured groups are often included in the result).

```javascript
"one1two2three".split(/\d/);           // ["one", "two", "three"]

// With capturing group — matches included in output
"a x b x c".split(/(\sx\s)/);         // ["a", " x ", "b", " x ", "c"]
```

### Joining (Array → String)

Not a `String` method, but the natural inverse: `Array.prototype.join`.

```javascript
["a", "b", "c"].join("-"); // "a-b-c"
["a", "b", "c"].join("");  // "abc"

// join on holes in sparse arrays — holes become empty segments (engine-consistent with Array.prototype.join)
const sparse = ["a", , "c"];
sparse.join("-"); // "a--c"
```

### `split` with lookahead / lookbehind (advanced)

**Lookaround** assertions can split **without** consuming characters, useful for delimiters you want to keep out of the result.

```javascript
// Split on comma not inside quotes (simplified illustration)
'a,"b,c",d'.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

// Often clearer to use match or a parser for CSV — regex-only CSV is error-prone
```

### RegExp `Symbol.split` (custom split behavior)

If a separator object defines `@@split`, `String.prototype.split` delegates to it (used internally by `RegExp`).

```javascript
const custom = {
  [Symbol.split](str, limit) {
    return limit === undefined
      ? [str.slice(0, 2), str.slice(2)]
      : [str];
  },
};
"abcdef".split(custom); // ["ab", "cdef"]
```

---

## 8. Comparison

### Comparison Operators

`===` and `!==` compare **value and type** for primitives. For strings, equality is **character-by-character** (UTF-16 code units). `<`, `>`, `<=`, `>=` use **lexicographic** order by code unit values (not linguistically correct for all languages).

```javascript
"apple" === "apple"; // true
"Apple" === "apple"; // false

"2" > "10"; // true — because "2" > "1" as first differing code unit
```

### `localeCompare(compareString, locales?, options?)`

Returns a **negative**, **zero**, or **positive** number indicating sort order relative to `compareString`, using locale rules.

```javascript
"a".localeCompare("b"); // negative
"b".localeCompare("a"); // positive
"same".localeCompare("same"); // 0

// Locale and sensitivity
"ä".localeCompare("z", "de"); // German ordering
"resume".localeCompare("Résumé", "en", { sensitivity: "base" }); // often 0 (ignore accents)

// Common options: numeric, caseFirst, ignorePunctuation
["10", "2", "1"].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
// ["1", "2", "10"]

"ß".localeCompare("ss", "de", { sensitivity: "base" }); // engine/locale dependent
```

### Collation

**Collation** is the set of rules for ordering strings. `localeCompare` and `Intl.Collator` implement collation; options like `numeric: true` sort embedded numbers naturally.

```javascript
const collator = new Intl.Collator("en", { numeric: true });
["item2", "item10", "item1"].sort(collator.compare);
// ["item1", "item2", "item10"]

// Collator resolved options (debugging / passing same rules elsewhere)
const c = new Intl.Collator("fr", { sensitivity: "accent" });
c.resolvedOptions();
// { locale: "fr", usage: "sort", sensitivity: "accent", ... }
```

---

## 9. Regex Methods

### `match(regexp)`

With a **non-global** regex, returns an **array** with the full match at index `0`, then capture groups, plus an `index` and `input` property. With the **`g`** flag, returns an **array of all matches** (no groups, no `index`).

```javascript
const s = "foo 123 bar 456";

s.match(/\d+/);     // ["123", index: 4, input: "foo 123 bar 456", groups: undefined]
s.match(/\d+/g);    // ["123", "456"]

s.match(/z/);       // null (no match)

// Named capture groups (ES2018) appear on `.groups`
const m = "year=2025".match(/year=(?<y>\d+)/);
m.groups.y; // "2025"

// With `g`, match returns only full matches — use matchAll for groups + iteration
```

### `matchAll(regexp)` (ES2020)

Returns an **iterator** of match objects. The regex **must** have the **`g`** flag.

```javascript
const s = "id:1 id:22";

const re = /id:(\d+)/g;
for (const m of s.matchAll(re)) {
  console.log(m[0], m[1]); // full match, group 1
}

// Spread to array
[...s.matchAll(/\w+/g)].map((m) => m[0]);

// Same RegExp object can be reused; iterator reads current lastIndex in older quirks —
// prefer creating a fresh /g regex per loop if you mutate lastIndex elsewhere
const re2 = /(\d+)/g;
const iter = "1 2".matchAll(re2);
console.log([...iter].length); // 2
```

### Related: `RegExp` methods on strings

`search` is like `regexp.exec` for first match index. For all matches with capture detail, **`matchAll`** is the modern default. `replace`/`split` also invoke regexp internal methods.

```javascript
const text = "a1b2";
const digits = text.match(/\d/g); // ["1","2"] — global returns array of matches only
```

---

## 10. Internationalization

### `Intl.Collator`

Construct a collator for **sorting** and **equality** checks according to locale.

```javascript
const collator = new Intl.Collator("sv", { sensitivity: "variant" });
["ö", "z", "ä"].sort(collator.compare);

collator.compare("coop", "co-op"); // negative, zero, or positive

// Collation for equality checks
const primary = new Intl.Collator("en", { sensitivity: "base" });
primary.compare("Resume", "resume") === 0; // true — ignore case and accents at primary level

// Sorting with multiple locales fallback
const multi = new Intl.Collator(["de-DE", "en-US"]);
["ä", "z"].sort(multi.compare);
```

### Unicode Normalization

Some characters can be written in **composed** or **decomposed** forms (e.g. é as one code point vs `e` + combining accent). Normalization makes comparisons reliable.

### `normalize(form?)`

Returns the Unicode-normalized form: `"NFC"` (default), `"NFD"`, `"NFKC"`, or `"NFKD"`.

```javascript
const s1 = "café";            // possibly NFC
const s2 = "cafe\u0301";      // e + combining acute

s1 === s2;                    // may be false
s1.normalize("NFC") === s2.normalize("NFC"); // often true

"café".normalize();           // default NFC
```

Use normalization before **deduplication**, **database keys**, or **security-sensitive** string comparison.

### Normalization forms in practice

- **NFC** — composed form; common on the web and in many databases.
- **NFD** — decomposed; useful for **accent-insensitive** matching when pairing with regex.
- **NFKC / NFKD** — **compatibility** decomposition (e.g. fullwidth digits, ligatures) — can change visual appearance; use when you need looser matching.

```javascript
const full = "\uFF11"; // fullwidth digit １
full.normalize("NFKC"); // "1"

const fi = "\uFB01"; // ﬁ ligature
fi.normalize("NFKD"); // "fi" (two code points)
```

### Optional: locale-aware segmentation (`Intl.Segmenter`)

Not a `String` method, but often paired with string processing for **user-perceived** boundaries (graphemes, words). Availability depends on runtime.

```javascript
if (typeof Intl.Segmenter === "function") {
  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  const text = "😀🇺🇸";
  [...segmenter.segment(text)].map((s) => s.segment);
  // Better reflects user-visible units than [...text] for some emoji sequences
}
```

---

## Best Practices

- Prefer **string literals** or `String(x)` for coercion; avoid `new String()` in application code.
- Remember **immutability**: assign the result of methods back to a variable or use it inline.
- Treat `.length` and index access as **UTF-16 code units**; use `codePointAt`, spreading, or libraries for **grapheme**-aware UX when needed.
- Use **template literals** for readable interpolation and multi-line text; use `String.raw` when backslashes must stay literal.
- For “does it contain / start / end?”, prefer **`includes` / `startsWith` / `endsWith`** over `indexOf(...) !== -1` for clarity.
- Prefer **`slice`** over **`substring`** when you want predictable behavior with negative indices; avoid **`substr`** in new code.
- Use **`replaceAll`** for global string replacement instead of splitting and joining when appropriate.
- For user-visible sorting and equality, use **`localeCompare`** or **`Intl.Collator`**, not raw `<`/`>`.
- When comparing **international text**, consider **`normalize()`** (usually NFC) first.
- With **`matchAll`**, always use a **global** regex; reuse compiled `RegExp` objects in hot paths.
- Prefer **`String.raw`** or doubled backslashes when building **RegExp** sources from paths or Windows-style strings.
- When trimming user input for **storage**, decide whether **NBSP** and other Unicode spaces should be removed — `trim()` alone may not be enough.
- Document whether your API returns **NFC** or raw Unicode so clients compare strings consistently.
- For **numeric-looking** strings in UI sorts (`"item10"`), always use **`numeric: true`** collation.

---

## Common Mistakes to Avoid

- Assuming **`"😀".length === 1`** — it is usually **2** (surrogate pair).
- Using **`indexOf` without checking `-1`** and then using the index blindly.
- Expecting **`split("")`** to yield **grapheme clusters** — it splits **UTF-16 units**, not visual characters.
- Forgetting that **`search(string)`** interprets the string as a **RegExp source**, not a literal substring (special characters matter).
- Using **`replace` without `/g`** and wondering why only the **first** match changed.
- Calling **`replaceAll` with a non-global RegExp** — throws **`TypeError`**.
- Sorting an array of names with **default `sort()`** — it uses code unit order, not human locale order.
- Comparing strings that look the same but use **different normalization** forms and getting **false** from `===`.
- Relying on **`toLowerCase()`** for **Turkish/I** and similar cases where **`toLocaleLowerCase(locale)`** is required.
- Mutating **String wrapper objects** (`new String("x")[0] = ...`) — it does not change the **primitive** value and is confusing.
- Using **`match`** with **`g`** when you need **capture groups** for each match — use **`matchAll`** instead.
- Assuming **`trim()`** removes **all Unicode whitespace** — it removes a fixed set; narrow NBSP and other space characters may remain.
- Building a RegExp from **user input** with `new RegExp(userString)` without **escaping** — regex metacharacters break or open **ReDoS** risk.
- Comparing filenames or URLs after **`toLowerCase()`** instead of a defined normalization (Unicode, percent-encoding) for **security** checks.

---

_End of notes — JavaScript String reference._
