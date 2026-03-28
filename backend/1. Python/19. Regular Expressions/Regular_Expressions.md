# Regular Expressions in Python

The **`re`** module matches patterns in strings—for **log parsing**, **validation**, **scraping**, and **ETL**.

## 📑 Table of Contents

- [19.1 Basics](#191-basics)
  - [Regex Syntax Overview](#regex-syntax-overview)
  - [The re Module](#the-re-module)
  - [Literal Characters](#literal-characters)
  - [Special Characters](#special-characters)
  - [Metacharacters](#metacharacters)
- [19.2 Pattern Matching](#192-pattern-matching)
  - [re.match](#rematch)
  - [re.search](#research)
  - [re.findall](#refindall)
  - [re.finditer](#refinditer)
  - [match vs search](#match-vs-search)
- [19.3 Character Classes](#193-character-classes)
  - [[abc] and Ranges](#abc-and-ranges)
  - [Negated Classes](#negated-classes)
  - [Digit and Word Shorthands](#digit-and-word-shorthands)
  - [Whitespace Shorthands](#whitespace-shorthands)
- [19.4 Quantifiers](#194-quantifiers)
  - [Star, Plus, Question](#star-plus-question)
  - [Braced Repetition](#braced-repetition)
  - [Greedy vs Lazy](#greedy-vs-lazy)
- [19.5 Anchors and Boundaries](#195-anchors-and-boundaries)
  - [Caret and Dollar](#caret-and-dollar)
  - [Word Boundaries](#word-boundaries)
  - [MULTILINE Mode](#multiline-mode)
- [19.6 Groups](#196-groups)
  - [Capturing Groups](#capturing-groups)
  - [Non-Capturing Groups](#non-capturing-groups)
  - [Named Groups](#named-groups)
  - [Backreferences](#backreferences)
  - [Match Object Methods](#match-object-methods)
- [19.7 String Operations](#197-string-operations)
  - [re.sub](#resub)
  - [re.split](#resplit)
  - [re.subn](#resubn)
  - [Replacement Functions](#replacement-functions)
  - [re.escape](#reescape)
- [19.8 Flags](#198-flags)
  - [IGNORECASE](#ignorecase)
  - [MULTILINE Flag](#multiline-flag)
  - [DOTALL](#dotall)
  - [VERBOSE](#verbose)
  - [Combining Flags](#combining-flags)
- [19.9 Production Recipes](#199-production-recipes)
- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 19.3 Character Classes

### [abc] and Ranges

**Beginner Level**: `[abc]` matches one of a, b, or c; `[a-z]` range of lowercase ASCII.

```python
import re

re.findall(r"[aeiou]", "hello")
```

**Intermediate Level**: **Hex color** `#RRGGBB`: `r"#[0-9a-fA-F]{6}"`.

**Expert Level**: Ranges compare **code points**—be careful with Unicode ranges; use `\p` not in stdlib—spell explicit sets or use `regex` module.

**Key Points**: `-` is range between two chars; literal `-` at ends: `[a-z-]`.

---

### Negated Classes

**Beginner Level**: `[^abc]` matches any char **except** a, b, c.

```python
import re

re.findall(r"[^,]+", "a,b,,c")
```

**Intermediate Level**: **CSV field** (naive): non-comma runs—real CSV needs proper parser.

**Expert Level**: `[^]` invalid in Python; `[^\n]` common for “line rest.”

**Key Points**: `^` first inside class means negate; elsewhere `^` is anchor.

---

### Digit and Word Shorthands

**Beginner Level**: `\d` digit; `\D` non-digit; `\w` word; `\W` non-word.

```python
import re

re.sub(r"\D", "", "(555) 123-4567")
```

**Intermediate Level**: **Order IDs** alphanumeric: `r"\b[A-Z]{2}-\d{6}\b"`.

**Expert Level**: With `re.ASCII`, `\d` and `\w` are ASCII-only—important for security filters.

**Key Points**: `\w` includes `_`; use explicit `[A-Za-z0-9]` when you mean ASCII identifier.

---

### Whitespace Shorthands

**Beginner Level**: `\s` whitespace; `\S` non-whitespace.

```python
import re

re.split(r"\s+", "a  \t b\n c")
```

**Intermediate Level**: **Normalize** scraped text: split on whitespace, rejoin single spaces.

**Expert Level**: `\s` includes Unicode whitespace unless `ASCII` flag.

**Key Points**: `re.split` drops capturing groups in result if groups used—design pattern accordingly.

---

## 19.4 Quantifiers

### Star, Plus, Question

**Beginner Level**: `*` zero or more; `+` one or more; `?` zero or one.

```python
import re

re.match(r"https?://", "http://x")
```

**Intermediate Level**: **Optional sign** number: `r"[+-]?\d+"`.

**Expert Level**: `*?` `+?` `??` **lazy** variants—stop as soon as possible.

**Key Points**: `*` can match empty—can cause empty matches; anchor or constrain.

---

### Braced Repetition

**Beginner Level**: `{n}` exactly n; `{n,}` at least n; `{n,m}` between n and m.

```python
import re

re.fullmatch(r"\d{3}-\d{4}", "555-1234")
```

**Intermediate Level**: **ISO-like** dates `YYYY-MM-DD`: `r"\d{4}-\d{2}-\d{2}"` (still validate calendar).

**Expert Level**: Quantifiers default **greedy**—`{n,m}?` lazy.

**Key Points**: `{,m}` invalid; `{0,}` same as `*`.

---

### Greedy vs Lazy

**Beginner Level**: Greedy takes **as much as possible** while still allowing rest to match; lazy takes **minimum**.

```python
import re

re.findall(r"<.*>", "<a>x</a>")  # greedy grabs too much
re.findall(r"<.*?>", "<a>x</a>")
```

**Intermediate Level**: **HTML tags** (fragile): lazy `.*?` between delimiters—still not a HTML parser.

**Expert Level**: Possessive quantifiers not in stdlib `re`—mitigate catastrophic backtracking by constraining class or use **atomic** alternatives in `regex` package.

**Key Points**: ReDoS: `r"(a+)+b"` on `"aaaaaaaaac"` can explode—audit user regexes.

---

## 19.5 Anchors and Boundaries

### Caret and Dollar

**Beginner Level**: `^` start of string; `$` end of string.

```python
import re

re.search(r"^ERROR", "ERROR: fail", re.MULTILINE)
```

**Intermediate Level**: **Whole line** comment strip: `r"^\s*#.*$"` per line with `MULTILINE`.

**Expert Level**: Without `MULTILINE`, `^`/`$` match whole string ends only.

**Key Points**: `$` before final newline: Python’s `$` matches before `\n` at end in default—use `\Z` for absolute string end if needed.

---

### Word Boundaries

**Beginner Level**: `\b` boundary between `\w` and `\W` (or start/end).

```python
import re

re.findall(r"\b\w{4}\b", "this word has four")
```

**Intermediate Level**: Match **`cat`** not `category`: `\bcat\b`.

**Expert Level**: `\B` non-boundary—inside longer tokens.

**Key Points**: Boundaries depend on `\w` definition (Unicode vs ASCII).

---

### MULTILINE Mode

**Beginner Level**: `re.M` makes `^`/`$` match each **line** start/end.

```python
import re

text = "a\nb\nc"
re.findall(r"^b$", text, re.MULTILINE)
```

**Intermediate Level**: **Multiline log** grep in Python: find `^ERROR` on any line.

**Expert Level**: Combine with `re.S` (`DOTALL`) carefully—`.` crosses lines if `DOTALL`.

**Key Points**: `re.M` is `re.MULTILINE`; not related to `\n` in `.` unless `DOTALL`.

---

## 19.6 Groups

### Capturing Groups

**Beginner Level**: `(...)` captures substring accessible via `m.group(1)` etc.

```python
import re

m = re.search(r"(\d+)/(\d+)/(\d+)", "12/31/2025")
m.groups()
```

**Intermediate Level**: **Rewrite** date formats in ETL: capture parts then `sub` with `\1`.

**Expert Level**: Group numbers count opening parens left to right—nested groups affect numbering.

**Key Points**: Capturing has small cost; use `(?:...)` when no capture needed.

---

### Non-Capturing Groups

**Beginner Level**: `(?:...)` groups without capture—used for alternation or quantifier scope.

```python
import re

re.findall(r"(?:foo|bar)\d+", "foo1 bar2")
```

**Intermediate Level**: **Optional prefix** without extra capture: `r"(?:https?://)?example\.com"`.

**Expert Level**: Keeps `findall` return shape simple (no tuple for that group).

**Key Points**: Prefer `(?:...)` for performance and clarity when you don’t need text.

---

### Named Groups

**Beginner Level**: `(?P<name>...)` capture with name `m.group("name")` or `m.groupdict()`.

```python
import re

m = re.match(
    r"(?P<hour>\d{2}):(?P<min>\d{2})",
    "14:05",
)
m.groupdict()
```

**Intermediate Level**: **Structured logs** → dict for JSON export.

```python
import re

PAT = re.compile(r'level=(?P<level>\w+)\s+msg=(?P<msg>.+)')
PAT.search("level=ERROR msg=disk full").groupdict()
```

**Expert Level**: Backref by name `(?P=name)` in same pattern—validate repeated tokens.

**Key Points**: Names must be valid identifiers; improves readability over index-only.

---

### Backreferences

**Beginner Level**: `\1` in pattern refers to first group; `r"\b(\w+)\s+\1\b"` repeated word.

```python
import re

re.search(r"(\w+)\s+\1", "hello hello")
```

**Intermediate Level**: **Quoted strings** with same quote char—fragile; better use parsers.

**Expert Level**: In replacement string of `sub`, use `\g<1>` to disambiguate from following digits.

**Key Points**: Backrefs match **exact** repeated text, not “same pattern again.”

---

### Match Object Methods

**Beginner Level**: `.group()`, `.groups()`, `.start()`, `.end()`, `.span()`.

```python
import re

m = re.search(r"a(\d+)b", "xa12by")
m.span(1)
```

**Intermediate Level**: **Slice original** string by span for UI snippets.

**Expert Level**: `.expand(r"Field: \1")` template expansion; `.string` whole haystack; `.re` pattern used.

**Key Points**: Group `0` is whole match; `lastindex`, `lastgroup` for optional groups.

---

## 19.7 String Operations

### re.sub

**Beginner Level**: Replace matches with string or template.

```python
import re

re.sub(r"\d+", "#", "pin 1234")
```

**Intermediate Level**: **Redact** credit-card-like runs in logs for display.

```python
import re

re.sub(r"\b\d{4}-\d{4}-\d{4}-\d{4}\b", "[REDACTED]", "card 4111-1111-1111-1111")
```

**Expert Level**: `count` limits replacements; use function replacer for logic.

**Key Points**: Backrefs in repl use `\1` or `\g<1>`; raw strings help.

---

### re.split

**Beginner Level**: Split on pattern; capturing groups include delimiters in output.

```python
import re

re.split(r"[;,]", "a;b,c")
```

**Intermediate Level**: **CSV-like** split (naive)—real CSV has quoted commas.

**Expert Level**: `maxsplit` parameter; empty splits possible at start—filter if needed.

**Key Points**: If pattern has capturing group, delimiters appear in list.

---

### re.subn

**Beginner Level**: Like `sub` but returns `(new_string, count)`.

```python
import re

re.subn(r"\s+", " ", "a   b  c")
```

**Intermediate Level**: **Metrics**: how many PII fields scrubbed per line.

**Expert Level**: Same repl rules as `sub`.

**Key Points**: Useful for logging replacement counts in batch jobs.

---

### Replacement Functions

**Beginner Level**: Pass `callable(match)` as repl; return string.

```python
import re


def title_case(m: re.Match) -> str:
    return m.group(0).title()


re.sub(r"\w+", title_case, "hello world")
```

**Intermediate Level**: **Normalize** phone: strip non-digits in callback, reformat.

**Expert Level**: Callback receives `Match`—use `m.expand` for complex templates.

**Key Points**: Slower than string template—fine for moderate volume.

---

### re.escape

**Beginner Level**: Escape all regex specials in arbitrary user literal for safe inclusion.

```python
import re

user = "2+2=4"
re.search(re.escape(user), "eq 2+2=4 ok")
```

**Intermediate Level**: Build pattern mixing **fixed** user substring and **regex** parts.

```python
import re

def find_literal(haystack: str, needle: str):
    return re.search(re.escape(needle), haystack)
```

**Expert Level**: Still audit combining with surrounding pattern for injection into **other** systems.

**Key Points**: `escape` is essential when embedding dynamic literals in patterns.

---

## 19.8 Flags

### IGNORECASE

**Beginner Level**: `re.I` case-insensitive match.

```python
import re

re.search(r"error", "ERROR", re.I)
```

**Intermediate Level**: **Log level** case variants: `info`, `INFO`, `Info`.

**Expert Level**: Inline `(?i)` at pattern start; scope with `(?i:subpat)`.

**Key Points**: Turkish locale `i` issues rare in Python regex—still test i18n inputs.

---

### MULTILINE Flag

**Beginner Level**: `re.M` — `^`/`$` per line.

```python
import re

re.findall(r"^#.*$", "# a\nb\n# c", re.MULTILINE)
```

**Intermediate Level**: **Strip bash-style comments** from config text.

**Expert Level**: Often paired with `re.S` wrongly—know difference.

**Key Points**: `re.M` is `re.MULTILINE`.

---

### DOTALL

**Beginner Level**: `re.S` makes `.` match **newline** too.

```python
import re

re.search(r"begin.*end", "begin\nend", re.DOTALL)
```

**Intermediate Level**: **Multiline HTML** comments `<!-- ... -->` (still use a parser for HTML).

**Expert Level**: Prefer explicit `[\s\S]` if you want to avoid flag threading.

**Key Points**: `re.S` is `re.DOTALL`.

---

### VERBOSE

**Beginner Level**: `re.X` allows whitespace and `#` comments in pattern—must escape literal space or use class.

```python
import re

pat = re.compile(
    r"""
    \d{4}-\d{2}-\d{2}   # date
    \s+
    [A-Z]+              # level
    """,
    re.X,
)
```

**Intermediate Level**: **Document** complex security or billing parsers for code review.

**Expert Level**: Embed pattern in triple-quoted raw string; indent carefully.

**Key Points**: Literal space in pattern: `[ ]` or `\ `; verbose ignores whitespace outside classes.

---

### Combining Flags

**Beginner Level**: Bitwise OR: `re.I | re.M`.

```python
import re

re.findall(r"^ok$", "OK\nno", re.I | re.MULTILINE)
```

**Intermediate Level**: **`compile` once** with combined flags for web scraper normalization.

**Expert Level**: Inline mode switches `(?im)` prefix; scope with `(?im:...)`.

**Key Points**: Pass flags to `compile`, `search`, `sub`, etc. consistently.

---

## 19.9 Production Recipes

### Log line parser (structured)

**Beginner Level**: Split fixed columns with regex when logs are uniform.

```python
import re

LINE = re.compile(r"^(?P<ts>\S+)\s+(?P<lvl>\w+)\s+(?P<msg>.+)$")


def parse(line: str) -> dict[str, str] | None:
    m = LINE.match(line.strip())
    return m.groupdict() if m else None
```

**Intermediate Level**: **ISO-8601-ish** timestamp and bracketed request id.

```python
import re

PAT = re.compile(
    r"^(?P<ts>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)\s+"
    r"\[(?P<rid>[a-f0-9-]{36})\]\s+"
    r"(?P<lvl>INFO|WARN|ERROR)\s+"
    r"(?P<msg>.+)$"
)
```

**Expert Level**: Ship **parsing stats**: count `None` matches, alert on format drift; version your regex per log schema.

**Key Points**: Log formats evolve—centralize pattern constants; feature-flag new patterns.

---

### API JSON string cleanup

**Beginner Level**: Strip trailing commas before `json.loads` is **not** regex-safe—use `json5` or fix producer. Regex only for **known** glitches.

**Intermediate Level**: Replace **double spaces** in string values only with care—usually parse JSON first.

```python
import json
import re

s = '{"a":  "b"  }'
s2 = re.sub(r"\s+", " ", s)
json.loads(s2)
```

**Expert Level**: For **malformed** scraped “JSON,” regex-extract `{...}` then repair—document fragility.

**Key Points**: Prefer `json` module; regex is last resort.

---

### Web scraping: href extraction

**Beginner Level**: Naive `href="..."` for static pages.

```python
import re

HREF = re.compile(r'href="([^"]+)"')


def links(html: str) -> list[str]:
    return HREF.findall(html)
```

**Intermediate Level**: Handle **single quotes** and relative URLs.

```python
import re

HREF = re.compile(r"""href=(["'])(.*?)\1""", re.I)
```

**Expert Level**: Use **BeautifulSoup** / **lxml** for HTML; keep regex for quick one-off scripts only.

**Key Points**: HTML is not regular; regex helpers are brittle.

---

### File batch: rename with pattern

**Beginner Level**: Capture groups in `re.sub` for bulk rename planning.

```python
import re
from pathlib import Path


def plan_rename(src_dir: Path, pattern: re.Pattern, repl: str) -> list[tuple[Path, Path]]:
    out: list[tuple[Path, Path]] = []
    for p in src_dir.glob("*.txt"):
        new_name = pattern.sub(repl, p.name)
        if new_name != p.name:
            out.append((p, p.with_name(new_name)))
    return out
```

**Intermediate Level**: **Dry-run** print before `rename`; validate collisions.

**Expert Level**: Integrate with **git mv** in repos; never run unreviewed rename on production buckets.

**Key Points**: Test on copies; `re.sub` can surprise with empty matches.

---

### Password / token shape checks

**Beginner Level**: Client-side hints only—server enforces policy.

```python
import re

HAS_LOWER = re.compile(r"[a-z]")
HAS_UPPER = re.compile(r"[A-Z]")
HAS_DIGIT = re.compile(r"\d")


def password_hints(pw: str) -> dict[str, bool]:
    return {
        "lower": bool(HAS_LOWER.search(pw)),
        "upper": bool(HAS_UPPER.search(pw)),
        "digit": bool(HAS_DIGIT.search(pw)),
        "len12": len(pw) >= 12,
    }
```

**Intermediate Level**: Do **not** embed full OWASP rules only in regex—use libraries.

**Expert Level**: Rate-limit auth endpoints; regex is UX hint, not security boundary.

**Key Points**: Store passwords hashed; never log raw tokens.

---

### IPv4 and CIDR (illustrative)

**Beginner Level**: Simple IPv4 octet pattern (already in 19.1)—validate with `ipaddress` module after match.

```python
import ipaddress
import re

IP = re.compile(
    r"\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\b"
)


def parse_ip(s: str):
    m = IP.search(s)
    if not m:
        return None
    try:
        return ipaddress.ip_address(m.group(0))
    except ValueError:
        return None
```

**Intermediate Level**: **CIDR** `10.0.0.0/24` split with regex then `ip_network`.

**Expert Level**: IPv6 needs different patterns—use `ipaddress` directly on validated strings.

**Key Points**: Regex finds candidates; stdlib validates semantics.

---

### Email and URL (pragmatic)

**Beginner Level**: Loose email pattern for **internal** tools—not RFC complete.

```python
import re

LOOSE_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def maybe_email(s: str) -> bool:
    return bool(LOOSE_EMAIL.fullmatch(s.strip()))
```

**Intermediate Level**: **URL** extraction: `https?://` then non-space—pair with `urllib.parse`.

```python
import re
from urllib.parse import urlparse

URL = re.compile(r"https?://[^\s\"'<>]+")


def first_url(text: str) -> str | None:
    m = URL.search(text)
    return m.group(0) if m else None


def host(text: str) -> str | None:
    u = first_url(text)
    return urlparse(u).hostname if u else None
```

**Expert Level**: For production validation use **validators** library or framework schemas.

**Key Points**: False positives/negatives exist—test real corp email rules.

---

### Quantifiers reference card

**Beginner Level**: Memorize `* + ? {n,m}` meanings with flashcard drills.

**Intermediate Level**: Build **unit tests** table-driven from examples.

```python
import re

CASES = [
    (r"ab*c", "ac", True),
    (r"ab*c", "abbbc", True),
    (r"ab+c", "ac", False),
    (r"ab?c", "abc", True),
    (r"ab?c", "ac", True),
]


def ok(pat, s, exp):
    assert bool(re.fullmatch(pat, s)) == exp


for pat, s, exp in CASES:
    ok(pat, s, exp)
```

**Expert Level**: Property-based tests with `hypothesis` for string generator + safe patterns.

**Key Points**: Automated tests catch flag and anchor mistakes.

---

### Character class edge cases

**Beginner Level**: `[]` empty class matches nothing useful—avoid.

**Intermediate Level**: `[\^]` matches literal caret; `[^^]` negated caret class (not caret char).

```python
import re

re.findall(r"[^^]+", "a^b^c")
```

**Expert Level**: Unicode properties: Python `re` lacks `\p{L}`—use explicit ranges or `regex` module.

**Key Points**: Test non-ASCII inputs if app is international.

---

### Anchors with multiline worked example

**Beginner Level**: Print every line starting with `TODO` in a source file.

```python
import re
from pathlib import Path

TODO_LINE = re.compile(r"^TODO\b.*$", re.MULTILINE)


def todos_in_file(p: Path) -> list[str]:
    text = p.read_text(encoding="utf-8", errors="replace")
    return TODO_LINE.findall(text)
```

**Intermediate Level**: **Diff hunks** `^\+` lines with `MULTILINE`.

**Expert Level**: Combine `re.DOTALL` only when you intend `.` to cross lines—separate patterns otherwise.

**Key Points**: Read file as single string for `^`/`$` per line; or iterate lines and `match`.

---

### Groups: numbering and optional groups

**Beginner Level**: Optional group `(pattern)?` yields `None` in `groups()`.

```python
import re

m = re.match(r"(?P<a>\d+)(?:-(?P<b>\d+))?", "12-3")
m.groupdict()
```

**Intermediate Level**: **CLI** args `cmd` or `cmd subcmd`.

**Expert Level**: **`(?P<name>...)?`** still appears key with `None` if missing—normalize in application code.

**Key Points**: Document which groups optional in `groupdict()` consumers.

---

### re.subn monitoring in ETL

**Beginner Level**: Count replacements per row for data quality dashboard.

```python
import re

TAG = re.compile(r"<[^>]+>")


def strip_tags_stats(html: str) -> tuple[str, int]:
    return TAG.subn("", html)
```

**Intermediate Level**: Aggregate counts in **Spark** / **pandas** apply—watch performance.

**Expert Level**: If count is zero unexpectedly, log sample row for debugging.

**Key Points**: `subn` is cheap way to add observability.

---

### Flags inline vs compile

**Beginner Level**: `(?i)pattern` at start for case-insensitive without passing flag to function.

```python
import re

re.findall(r"(?i)error", "ERROR eRrOr")
```

**Intermediate Level**: Scoped `(?i:sub)` only casefolds **sub** pattern.

```python
import re

re.match(r"(?i:abc)123", "ABC123")
```

**Expert Level**: Mixing inline and argument flags—document precedence (inline applies locally).

**Key Points**: `compile` with flags is clearer for large shared patterns.

---

### Performance and safety checklist

**Beginner Level**: If pattern runs 1M times, **compile** once.

**Intermediate Level**: **Timeout** on user regex not in stdlib `re`—use third-party or sandbox.

**Expert Level**: **Audit** alternation order—put common branches first for micro-optimization; measure first.

**Key Points**: ReDoS is a real production issue for regex search features.

---

### Unicode identifiers in logs

**Beginner Level**: `\w+` matches Unicode letters by default—good for international usernames in logs.

```python
import re

USER = re.compile(r"\w+")
USER.findall("user_ada 用户123")
```

**Intermediate Level**: Restrict to ASCII with `re.ASCII` for **legacy** parsers.

```python
import re

re.findall(r"\w+", "naïve", re.ASCII)
```

**Expert Level**: Normalize Unicode **NFKC** before regex in security-sensitive allowlists.

**Key Points**: Know your data charset; decode bytes before `re`.

---

### Binary data and re

**Beginner Level**: `re` works on **str** and **bytes**; pattern type must match.

```python
import re

re.findall(rb"\x00+", b"a\x00\x00b")
```

**Intermediate Level**: **Parse** binary headers in network captures—prefer `struct` for fixed layouts.

**Expert Level**: Mixing str/bytes raises `TypeError`—stay consistent per pipeline stage.

**Key Points**: Prefer `struct`/`mmap` protocols for binary; regex is occasional.

---

### Testing regex with pytest

**Beginner Level**: Parametrize pattern and input.

```python
import re

import pytest


@pytest.mark.parametrize(
    "s,ok",
    [
        ("4111-1111-1111-1111", True),
        ("4111-1111-1111", False),
    ],
)
def test_card_shape(s, ok):
    pat = re.compile(r"^\d{4}-\d{4}-\d{4}-\d{4}$")
    assert bool(pat.fullmatch(s)) is ok
```

**Intermediate Level**: Snapshot **golden files** of parser outputs for log samples.

**Expert Level**: Mutation testing on regex-heavy modules—ensure tests kill mutants.

**Key Points**: Regression tests when log format changes quarterly.

---

### Alternation order and pitfalls

**Beginner Level**: `cat|catalog` matches `cat` first in left-to-right alternation—may prevent longer match if engine finds shorter first? Actually regex tries left branch first at position—`catalog` as text: `cat|catalog` matches `cat` at start only if `catalog` starts with cat—at position 0 `cat` matches first three chars of `catalog`—often you want longer first: `catalog|cat`.

```python
import re

re.match(r"catalog|cat", "catalog").group(0)
```

**Intermediate Level**: **Keyword** lists for token lexer: order longer tokens before shorter (`return` before `ret`).

**Expert Level**: Non-greedy alternation not a thing—order branches explicitly.

**Key Points**: Review alternation when adding new keywords.

---

### Lookahead / lookbehind note

**Beginner Level**: `(?=...)` positive lookahead; `(?!...)` negative—assert without consuming.

```python
import re

re.findall(r"\d+(?=px)", "10px 20 em 30px")
```

**Intermediate Level**: **Password** must contain digit ahead check combined with fullstring elsewhere.

**Expert Level**: Lookbehind `(?<=...)` fixed-width in older Python—3.11+ relaxed for variable length in some cases—check version docs.

**Key Points**: Powerful but hurts readability—comment `VERBOSE` patterns.

---

### Regex vs split for CSV

**Beginner Level**: `csv.reader` wins for real CSV.

**Intermediate Level**: Regex split on comma **fails** on quoted commas.

**Expert Level**: If stuck with regex, use **pyparsing** or **pandas** `read_csv`.

**Key Points**: Never parse production CSV solely with `re.split(",")`.

---

### Greedy disaster toy example

**Beginner Level**: See failure mode:

```python
import re

re.match(r".*(\d+)", "abcdefghij1").group(1)  # may not be what you expect
```

**Intermediate Level**: Use **`.*?`** or **`[^1]*`** to steer engine.

**Expert Level**: Design patterns so **possessive** would help—simulate with atomic workaround using `(?=(...))\1` tricks sparingly.

**Key Points**: When in doubt, test with `regex.debug` mental model or `hypothesis`.

---

### Match.span for highlighting UI

**Beginner Level**: Build list of ranges for frontend highlighter.

```python
import re

def ranges(pattern: str, text: str) -> list[tuple[int, int]]:
    return [m.span() for m in re.finditer(pattern, text)]
```

**Intermediate Level**: Merge overlapping spans for CSS overlays.

**Expert Level**: UTF-16 vs UTF-8 indices in JS frontends—normalize encoding story.

**Key Points**: Python spans are code-unit indices in str (Unicode code points for BMP mostly—surrogate pairs not in str).

---

### Schema validation helper

**Beginner Level**: Field `^[A-Z]{3}\d{6}$` for toy product codes.

**Intermediate Level**: Combine **multiple** `fullmatch` checks in validation function returning `list[str]` errors.

**Expert Level**: JSON Schema / Pydantic for nested; regex for leaf string formats.

**Key Points**: Layer validation: type, shape, business rules.

---

## Best Practices

1. **Compile** patterns used repeatedly in loops.
2. Use **`re.escape`** for user literals embedded in regex.
3. Prefer **`fullmatch`** for validating entire fields.
4. Use **`finditer`** when match positions matter.
5. Add **`VERBOSE`** and comments for non-trivial patterns.
6. Guard against **ReDoS** on user-supplied regex or inputs.
7. Validate emails, phones, and URLs with **layered** checks—not regex alone.
8. Use **`bytes` patterns** only for binary protocols—usually stick to decoded text.
9. Test with **unicode**, **empty**, and **boundary** cases.
10. For **CSV/HTML/JSON**, use proper parsers; regex assists but does not replace.

---

## Common Mistakes to Avoid

1. Confusing **`match`** with **`search`**.
2. Forgetting **`r"..."`** and broken escapes.
3. **Greedy** `.*` eating too much—use lazy or negated class.
4. Using regex as **only** email/HTML validation.
5. **`findall`** group behavior surprises—verify tuple shape.
6. **`split`** with capturing groups—unexpected empty strings.
7. **`$`** end semantics with trailing newline confusion.
8. **MULTILINE** without understanding `^`/`$` line vs string.
9. **Verbose** mode accidentally ignoring needed spaces.
10. **Catastrophic backtracking** on nested quantifiers with hostile input.

---

*End of Topic 19 — Regular Expressions.*
