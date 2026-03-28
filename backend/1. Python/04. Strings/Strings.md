# Strings in Python

Python **`str`** is an immutable sequence of Unicode code points. Strings appear everywhere: **SKU** labels in **inventory**, **student** names, **bank** narratives on statements, **e-commerce** product copy, and **weather** descriptions. This guide covers creation, methods, formatting, operations, and raw/bytes edges.

---

## 📑 Table of Contents

### 4.1 Basics
1. [4.1.1 Creating Strings](#411-creating-strings)
2. [4.1.2 Immutability](#412-immutability)
3. [4.1.3 Length with len()](#413-length-with-len)
4. [4.1.4 Positive Indexing](#414-positive-indexing)
5. [4.1.5 Negative Indexing](#415-negative-indexing)
6. [4.1.6 Slicing Basics](#416-slicing-basics)
7. [4.1.7 Slicing with Step](#417-slicing-with-step)
8. [4.1.8 Out-of-Range Indexing](#418-out-of-range-indexing)
9. [4.1.9 Escape Sequences in Literals](#419-escape-sequences-in-literals)

### 4.2 Methods
10. [4.2.1 Case — lower, upper, casefold](#421-case--lower-upper-casefold)
11. [4.2.2 Case — capitalize, title, swapcase](#422-case--capitalize-title-swapcase)
12. [4.2.3 Whitespace — strip, lstrip, rstrip](#423-whitespace--strip-lstrip-rstrip)
13. [4.2.4 split and rsplit](#424-split-and-rsplit)
14. [4.2.5 splitlines](#425-splitlines)
15. [4.2.6 join](#426-join)
16. [4.2.7 find, index, rfind, rindex](#427-find-index-rfind-rindex)
17. [4.2.8 replace and count](#428-replace-and-count)
18. [4.2.9 startswith and endswith](#429-startswith-and-endswith)
19. [4.2.10 Testing Methods — isdigit, isalpha, ...](#4210-testing-methods--isdigit-isalpha-)
20. [4.2.11 Alignment — ljust, rjust, center, zfill](#4211-alignment--ljust-rjust-center-zfill)
21. [4.2.12 partition and rpartition](#4212-partition-and-rpartition)

### 4.3 Formatting
22. [4.3.1 Percent (%) Formatting](#431-percent--formatting)
23. [4.3.2 str.format() Positional](#432-strformat-positional)
24. [4.3.3 str.format() Named and Mapping](#433-strformat-named-and-mapping)
25. [4.3.4 f-strings Basics](#434-f-strings-basics)
26. [4.3.5 Format Specification Mini-Language](#435-format-specification-mini-language)
27. [4.3.6 Formatting Numbers](#436-formatting-numbers)
28. [4.3.7 Formatting Dates and Times](#437-formatting-dates-and-times)
29. [4.3.8 Nested and Advanced Formatting](#438-nested-and-advanced-formatting)

### 4.4 Operations
30. [4.4.1 Concatenation with +](#441-concatenation-with-)
31. [4.4.2 Efficient Concatenation — join and list](#442-efficient-concatenation--join-and-list)
32. [4.4.3 Repetition with *](#443-repetition-with-)
33. [4.4.4 Membership — in and not in](#444-membership--in-and-not-in)
34. [4.4.5 Lexicographic Comparison](#445-lexicographic-comparison)
35. [4.4.6 Iteration Character by Character](#446-iteration-character-by-character)
36. [4.4.7 Iteration with enumerate](#447-iteration-with-enumerate)

### 4.5 Raw, Multiline, Unicode, Bytes
37. [4.5.1 Raw Strings r""](#451-raw-strings-r)
38. [4.5.2 Multiline Triple Quotes](#452-multiline-triple-quotes)
39. [4.5.3 Unicode Literals and Normalization](#453-unicode-literals-and-normalization)
40. [4.5.4 str.encode and bytes.decode](#454-strencode-and-bytesdecode)
41. [4.5.5 Byte String Literals b""](#455-byte-string-literals-b)
42. [4.5.6 bytearray and Mutable Buffers](#456-bytearray-and-mutable-buffers)

- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 4.1.1 Creating Strings

### Key Points

- Quotes: **single** `'`, **double** `"`, or **triple** `'''` / `"""`.
- Adjacent string literals concatenate implicitly: `"a" "b"` → `"ab"`.
- **`str(object)`** calls **`__str__`**.

**Beginner Level:** **E-commerce** product title.

```python
title = 'Organic "Fair Trade" Coffee'
sku_label = "SKU-" + "A100"
```

**Intermediate Level:** Build **student** display from parts.

```python
first, last = "Maya", "Chen"
full = f"{first} {last}"
```

**Expert Level:** **`str`** vs **`repr`** for logging **bank** events — user-facing vs debugging.

```python
event = {"type": "transfer", "amount": 50}
print(str(event), repr(event))
```

---

## 4.1.2 Immutability

### Key Points

- Strings cannot be mutated in place; “changes” create **new** objects.
- Reassignment replaces the **name** binding, not the old object’s content.
- Enables **hashing** (strings are valid dict keys).

**Beginner Level:**

```python
s = "hello"
# s[0] = "H"  # TypeError
s = "H" + s[1:]
```

**Intermediate Level:** **Inventory** tags uppercase normalization returns new string.

```python
tag = "sku-a1".upper()
```

**Expert Level:** Interning and copy-on-write in CPython — do not rely on identity for deduplication logic.

---

## 4.1.3 Length with len()

### Key Points

- **`len(s)`** counts Unicode **code points**, not necessarily user-perceived graphemes.
- **O(1)** for built-in str in CPython (cached size).
- Surrogate pairs / combining characters can surprise “character” counts.

**Beginner Level:**

```python
print(len("hello"))
```

**Intermediate Level:** **Weather** city name validation.

```python
city = "São Paulo"
print(len(city))
```

**Expert Level:** Use **`grapheme`** libraries for accurate **international** display limits in **e-commerce** UIs.

---

## 4.1.4 Positive Indexing

### Key Points

- **0-based** indexing; last index **`len(s)-1`**.
- **`s[i]`** returns one-character string.

**Beginner Level:**

```python
course = "Python"
print(course[0])
```

**Intermediate Level:** **Bank** mask account digits showing last 4.

```python
acct = "123456789"
masked = "*" * (len(acct) - 4) + acct[-4:]
```

**Expert Level:** Bounds still checked at runtime — no silent overflow unlike C.

---

## 4.1.5 Negative Indexing

### Key Points

- **`-1`** last, **`-2`** second last.
- **`s[-n]`** ≡ **`s[len(s)-n]`** when `n` positive.

**Beginner Level:**

```python
print("data"[-1])
```

**Intermediate Level:** File extension from **student** submission path.

```python
path = "essay.pdf"
ext = path[path.rindex(".") + 1 :]
```

**Expert Level:** Combine with slicing for robust parsers.

---

## 4.1.6 Slicing Basics

### Key Points

- **`s[start:stop]`** — `stop` **exclusive**.
- Omitted start → `0`; omitted stop → `len(s)`.
- Slices **never** raise index errors for out-of-range bounds — they clip.

**Beginner Level:**

```python
print("inventory"[0:3])
```

**Intermediate Level:** **E-commerce** breadcrumb segments.

```python
url = "/shop/electronics/laptops"
parts = url.split("/")
```

**Expert Level:** **`slice`** objects for dynamic slicing in data pipelines.

---

## 4.1.7 Slicing with Step

### Key Points

- **`s[start:stop:step]`**; step negative reverses.
- **`s[::-1]`** reverses string.

**Beginner Level:**

```python
print("abcde"[::2])
```

**Intermediate Level:** Quick palindrome check (naive):

```python
def is_pal(s: str) -> bool:
    s = s.lower().replace(" ", "")
    return s == s[::-1]
```

**Expert Level:** Large string reversal — still O(n) new allocation; use **array** APIs if needed.

---

## 4.1.8 Out-of-Range Indexing

### Key Points

- **`s[i]`** raises **`IndexError`** if out of range.
- **`s[i:j]`** clips — no error.

**Beginner Level:**

```python
# print("hi"[5])  # IndexError
print("hi"[1:10])
```

**Intermediate Level:** Defensive **inventory** code checks length before `[0]`.

**Expert Level:** Prefer slicing or **`str[i:i+1]`** with guards in parsers.

---

## 4.1.9 Escape Sequences in Literals

### Key Points

- **`\n \t \\ \' \"`**
- **`\uXXXX`**, **`\UXXXXXXXX`**, **`\N{name}`**

**Beginner Level:**

```python
print("Line1\nLine2")
```

**Intermediate Level:** **Bank** export with quoted CSV fields.

```python
field = 'He said "OK"'
```

**Expert Level:** Normalization with **`unicodedata`** for **international** product search.

---

## 4.2.1 Case — lower, upper, casefold

### Key Points

- **`casefold()`** strongest for **case-insensitive** comparison (Unicode).
- **`lower()`** locale-independent for ASCII-centric data.
- **`upper()`** for display, not reliable for i18n equality alone.

**Beginner Level:**

```python
print("Sale".upper())
```

**Intermediate Level:** **Student** login normalize:

```python
email = "User@School.EDU".casefold()
```

**Expert Level:** **E-commerce** dedupe SKUs with **`casefold`** + normalization.

---

## 4.2.2 Case — capitalize, title, swapcase

### Key Points

- **`capitalize`**: first char upper, rest lower.
- **`title`**: word starts upper — can mishandle apostrophes.
- **`swapcase`**: toggles case.

**Beginner Level:**

```python
print("hello world".title())
```

**Intermediate Level:** Display **weather** city names for UI.

**Expert Level:** Use **`regex`** or **`titlecase`** libs for proper titles (“McDonald”).

---

## 4.2.3 Whitespace — strip, lstrip, rstrip

### Key Points

- **`strip(chars)`** removes leading/trailing; default whitespace.
- **`lstrip` / `rstrip`** one-sided.
- Does not remove internal spaces.

**Beginner Level:**

```python
print("  hi  ".strip())
```

**Intermediate Level:** **Bank** CSV import:

```python
raw = "  100.50  \n"
amount = float(raw.strip())
```

**Expert Level:** **`split()`** without args splits on arbitrary whitespace runs — often paired with strip.

---

## 4.2.4 split and rsplit

### Key Points

- **`split(sep)`** — `sep=None` splits on whitespace, discards empty strings from edges in some cases.
- **`maxsplit`** limits splits from left; **`rsplit`** from right.

**Beginner Level:**

```python
print("a,b,c".split(","))
```

**Intermediate Level:** **Inventory** key-value pairs:

```python
line = "sku=A1;qty=3"
parts = dict(p.split("=") for p in line.split(";"))
```

**Expert Level:** **`re.split`** when delimiters are patterns.

---

## 4.2.5 splitlines

### Key Points

- **`splitlines(keepends=False)`** handles **`\n`**, **`\r\n`**, **`\r`**.
- Better than **`split("\n")`** for mixed newlines.

**Beginner Level:**

```python
print("a\nb\r\nc".splitlines())
```

**Intermediate Level:** Parse **student** multiline addresses from forms.

**Expert Level:** Large file processing — iterate lines with **`for line in fh:`** instead of loading all.

---

## 4.2.6 join

### Key Points

- **`sep.join(iterable)`** — **`sep`** is the string called on.
- **O(n)** total for strings; prefer over **`+`** in loops.

**Beginner Level:**

```python
print(", ".join(["apple", "banana"]))
```

**Intermediate Level:** **E-commerce** tag string from list.

```python
tags = ["sale", "new", "electronics"]
query = " OR ".join(tags)
```

**Expert Level:** **`io.StringIO`** for huge concatenations if join materializes large intermediates — rare.

---

## 4.2.7 find, index, rfind, rindex

### Key Points

- **`find`** returns **`-1`** if missing; **`index`** raises **`ValueError`**.
- **`rfind` / `rindex`** search from right.

**Beginner Level:**

```python
print("banana".find("na"))
```

**Intermediate Level:** **SKU** prefix extraction:

```python
s = "WH-A12-003"
i = s.find("-")
warehouse = s[:i]
```

**Expert Level:** For many patterns, compile **`re`** once.

---

## 4.2.8 replace and count

### Key Points

- **`replace(old, new, count=-1)`** returns new string.
- **`count(sub)`** non-overlapping occurrences.

**Beginner Level:**

```python
print("foo foo".replace("foo", "bar", 1))
```

**Intermediate Level:** **Bank** template redaction:

```python
msg = "Card 4111111111111111"
print(msg.replace("4111111111111111", "************1111"))
```

**Expert Level:** Overlapping counts need custom algorithms or regex.

---

## 4.2.9 startswith and endswith

### Key Points

- Accept **tuple** of prefixes/suffixes: **`s.startswith(("http://", "https://"))`**.

**Beginner Level:**

```python
print("readme.txt".endswith(".txt"))
```

**Intermediate Level:** **Weather** API URL scheme check.

**Expert Level:** Combine with **`pathlib.PurePath.suffix`** for file types.

---

## 4.2.10 Testing Methods — isdigit, isalpha, ...

### Key Points

- **`isdigit`**, **`isdecimal`**, **`isnumeric`** differ for unicode numerals.
- **`isalnum`**, **`isalpha`**, **`isspace`**, **`isidentifier`**.

**Beginner Level:**

```python
print("42".isdigit())
```

**Intermediate Level:** Validate **student** ID all digits.

```python
def ok_id(s: str) -> bool:
    return len(s) == 8 and s.isdigit()
```

**Expert Level:** **`isidentifier`** for safe dynamic codegen — still validate against keywords.

---

## 4.2.11 Alignment — ljust, rjust, center, zfill

### Key Points

- **`zfill`** pads numeric strings with zeros on left (sign aware).
- **`center(width, fillchar)`** — `fillchar` single char.

**Beginner Level:**

```python
print("42".zfill(5))
```

**Intermediate Level:** **Inventory** fixed-width export.

```python
row = f"{sku.ljust(10)}{str(qty).rjust(5)}"
```

**Expert Level:** For **bank** mainframes, document encoding and width rules explicitly.

---

## 4.2.12 partition and rpartition

### Key Points

- **`partition(sep)`** → `(head, sep, tail)`; if sep missing, `(s, "", "")`.
- **`rpartition`** splits on last occurrence.

**Beginner Level:**

```python
print("key=value".partition("="))
```

**Intermediate Level:** Split **e-commerce** `name.ext` safely.

```python
name, dot, ext = "archive.tar.gz".rpartition(".")
```

**Expert Level:** Prefer **`pathlib`** for paths; **`partition`** for generic delimited records.

---

## 4.3.1 Percent (%) Formatting

### Key Points

- **`"%.2f" % x`** legacy but still in old **inventory** scripts.
- Tuple for multiple values.

**Beginner Level:**

```python
print("Total: %s" % 19.99)
```

**Intermediate Level:**

```python
print("%(sku)s %(qty)03d" % {"sku": "A1", "qty": 7})
```

**Expert Level:** Migrate to f-strings for new **bank** reporting code.

---

## 4.3.2 str.format() Positional

### Key Points

- **`"{0} {1}".format(a, b)`** — explicit positions.

**Beginner Level:**

```python
print("{} {}".format("Hello", "World"))
```

**Intermediate Level:** Reorder for translated **e-commerce** strings.

```python
"{1} {0}".format("World", "Hello")
```

**Expert Level:** **`str.format_map`** for **`defaultdict`**-style missing keys.

---

## 4.3.3 str.format() Named and Mapping

### Key Points

- **`"{name}".format(name="Ada")`**
- **`"{sku}".format_map(row_dict)`**

**Beginner Level:**

```python
print("{item}: ${price:.2f}".format(item="Mug", price=12.5))
```

**Intermediate Level:** **Student** report templates.

**Expert Level:** **`string.Template`** for safer user-controlled templates (still validate).

---

## 4.3.4 f-strings Basics

### Key Points

- **`f"{expr}"`** evaluates expressions.
- **`{{` and `}}`** for literal braces.

**Beginner Level:**

```python
city = "Oslo"
print(f"Weather in {city}")
```

**Intermediate Level:** **Bank** balance line:

```python
bal = 1500.20
print(f"Available: ${bal:,.2f}")
```

**Expert Level:** **`=`** debug spec, nested quotes discipline, avoid overly complex expressions inside braces.

---

## 4.3.5 Format Specification Mini-Language

### Key Points

- After `:` inside f-string or **`format`**: **`[[fill]align][sign][#][0][width][,][.precision][type]`**
- Types: **`d`**, **`f`**, **`e`**, **`g`**, **`b`**, **`x`**, **`s`**

**Beginner Level:**

```python
print(f"{255:x}")
```

**Intermediate Level:** **Inventory** hex lot IDs.

**Expert Level:** **`Decimal`** formatting with quantize separate from mini-language in strict financial code.

---

## 4.3.6 Formatting Numbers

### Key Points

- Thousands separator: **`{:,}`**.
- Precision: **`{:.3f}`**.
- Sign: **`{:+}`**.

**Beginner Level:**

```python
print(f"{1234567:,}")
```

**Intermediate Level:** **E-commerce** invoice totals.

```python
print(f"Subtotal: ${sub:,.2f}\nTax: ${tax:,.2f}")
```

**Expert Level:** Locale-aware formatting with **`locale`** module for **international** storefronts.

---

## 4.3.7 Formatting Dates and Times

### Key Points

- **`datetime`** **`strftime`** / **`format`** codes.
- f-string: **`f"{d:%Y-%m-%d}"`**

**Beginner Level:**

```python
from datetime import date
d = date(2026, 3, 28)
print(f"{d:%A, %B %d, %Y}")
```

**Intermediate Level:** **Bank** statement period headers.

**Expert Level:** **zoneinfo** for aware datetimes; **ISO 8601** for APIs.

---

## 4.3.8 Nested and Advanced Formatting

### Key Points

- Nested **`format`** fields for dynamic widths.
- **`f"{value:{width}.{prec}f}"`**

**Beginner Level:**

```python
w = 10
print(f"{42:{w}d}")
```

**Intermediate Level:** Dynamic column widths in **student** text reports.

**Expert Level:** Prefer **`tabulate`** or **rich** tables for complex layouts.

---

## 4.4.1 Concatenation with +

### Key Points

- **`+`** creates new string each time.
- Fine for few pieces; poor in tight loops.

**Beginner Level:**

```python
print("Hello" + " " + "World")
```

**Intermediate Level:** Build **weather** sentence.

**Expert Level:** **`''.join(parts)`** in loops for performance.

---

## 4.4.2 Efficient Concatenation — join and list

### Key Points

- Collect parts in **list**, **`join`** once.
- **`io.StringIO`** alternative for streams.

**Beginner Level:**

```python
parts = ["a", "b", "c"]
print("".join(parts))
```

**Intermediate Level:** **E-commerce** HTML snippet builder.

**Expert Level:** Profile before optimizing — Python 3.11+ has optimizations, but join remains idiomatic.

---

## 4.4.3 Repetition with *

### Key Points

- **`s * n`** repeats string `n` times; `n` must be int ≥ 0.

**Beginner Level:**

```python
print("-" * 20)
```

**Intermediate Level:** **Bank** mask:

```python
masked = "*" * 12 + last_four
```

**Expert Level:** Memory blow if `n` huge — validate inputs.

---

## 4.4.4 Membership — in and not in

### Key Points

- Substring test **O(n*m)** naive worst case; optimized in CPython.
- **`in`** for char or substring.

**Beginner Level:**

```python
print("at" in "cat")
```

**Intermediate Level:** **Inventory** forbidden word filter in descriptions.

**Expert Level:** **`Aho-Corasick`** for many needles in **e-commerce** moderation.

---

## 4.4.5 Lexicographic Comparison

### Key Points

- **`== != < > <= >=`** use character code point order by default.
- **Locale-aware** sorting uses **`locale.strxfrm`** or **`PyICU`**.

**Beginner Level:**

```python
print("apple" < "banana")
```

**Intermediate Level:** Sort **student** names — may need **`key=str.casefold`**.

```python
names = ["Zoe", "álvaro", "Ben"]
print(sorted(names, key=str.casefold))
```

**Expert Level:** **Unicode collation** for international **bank** customer lists.

---

## 4.4.6 Iteration Character by Character

### Key Points

- **`for ch in s:`** yields length-1 strings.
- Equivalent to indexing in loop but cleaner.

**Beginner Level:**

```python
for ch in "abc":
    print(ch)
```

**Intermediate Level:** Count vowels in **student** essay snippet.

**Expert Level:** **`iter` + **`itertools`** for windowed processing.

---

## 4.4.7 Iteration with enumerate

### Key Points

- **`enumerate(s, start=0)`** yields `(index, char)`.

**Beginner Level:**

```python
for i, ch in enumerate("hi"):
    print(i, ch)
```

**Intermediate Level:** Find positions of delimiter in **SKU** string.

**Expert Level:** Combine with **`zip`** for parallel string alignment algorithms.

---

## 4.5.1 Raw Strings r""

### Key Points

- Backslashes mostly literal — handy for **regex** and Windows paths.
- Cannot end with single `\` (syntax error) — use **`\\`** or normal string.

**Beginner Level:**

```python
path = r"C:\Users\Student\data.csv"
```

**Intermediate Level:** **Bank** regex for account pattern.

```python
import re
pattern = r"\d{4}-\d{4}-\d{4}"
```

**Expert Level:** **`re.VERBOSE`** + raw strings for readable patterns.

---

## 4.5.2 Multiline Triple Quotes

### Key Points

- **`"""`** preserves newlines; first line can start immediately after quotes.
- Docstring convention: summary line, blank line, body.

**Beginner Level:**

```python
sql = """
SELECT id, name
FROM students
WHERE active = 1
"""
```

**Intermediate Level:** **E-commerce** email template (then replace placeholders).

**Expert Level:** **`textwrap.dedent`** to align indented multiline strings in code.

---

## 4.5.3 Unicode Literals and Normalization

### Key Points

- Source files default UTF-8 in Python 3.
- **`unicodedata.normalize('NFC', s)`** for consistent composed form.

**Beginner Level:**

```python
print("\u20AC")  # €
```

**Intermediate Level:** **International** product title search normalization.

**Expert Level:** **IDNA** for domain names; **grapheme** segmentation for limits.

---

## 4.5.4 str.encode and bytes.decode

### Key Points

- **`s.encode('utf-8')`** → bytes; **`b.decode('utf-8')`** → str.
- **`errors=`** parameter: **`strict`**, **`ignore`**, **`replace`**.

**Beginner Level:**

```python
b = "hi".encode()
print(b.decode())
```

**Intermediate Level:** **Weather** API binary payload to JSON text pipeline.

**Expert Level:** **`surrogateescape`** for filesystem paths on Unix with undecodable bytes.

---

## 4.5.5 Byte String Literals b""

### Key Points

- **`b"abc"`** — ASCII only in literal; **`b"\xff"`** escapes for non-ASCII bytes.
- No separate `str` methods — use **`bytes`** API.

**Beginner Level:**

```python
print(b"ping")
```

**Intermediate Level:** **Bank** fixed-width wire format as bytes.

**Expert Level:** **`memoryview`** for zero-copy slicing of large buffers.

---

## 4.5.6 bytearray and Mutable Buffers

### Key Points

- **`bytearray`** mutable; **`bytes`** immutable.
- Useful for incremental I/O, socket protocols.

**Beginner Level:**

```python
buf = bytearray(b"abc")
buf[0] = ord("z")
print(buf)
```

**Intermediate Level:** **Inventory** binary protocol framing.

**Expert Level:** **`struct.pack_into`** into preallocated **`bytearray`**.

---

## Best Practices

- Prefer **f-strings** for readability; use **`join`** for concatenating many strings.
- Normalize **Unicode** before **case-insensitive** **e-commerce** search.
- Use **`pathlib`** for filesystem paths instead of manual string splitting.
- Never build **SQL** with naive string concat — use parameters / ORM.
- Validate user strings for length and charset at **API** boundaries (**student** forms, **bank** notes).
- Choose **`isdigit`** vs **`isdecimal`** consciously for international numeric input.
- Use **`encode`/`decode`** explicitly with **`utf-8`**; document **`errors`** policy.
- Replace **`%` formatting** in new code; keep tests when migrating legacy **inventory** tools.

---

## Common Mistakes to Avoid

- Using **`+`** in a tight loop to build large strings.
- Confusing **`strip`** with removing internal whitespace.
- **`"{}".format(user_input)`** without validation — format injection in logs/templates.
- Assuming **`len(str)`** equals **user-visible** character count for emoji.
- **`s.split(",")`** when **`csv`** module should handle quoted commas (**bank** CSV).
- **`bytes` vs `str`** concatenation — **TypeError** on Python 3.
- **`defaultdict` + join** mistakes — joining non-string values without **`map(str, ...)`**.
- Using **`==`** for IP or path comparison — normalize first.

---

*Strings bridge human text and machine protocols — master them before heavy I/O.*
