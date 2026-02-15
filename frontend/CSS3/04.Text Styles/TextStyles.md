# 04. Text Styles

## letter-spacing

Gap between individual characters:

```css
p { letter-spacing: normal; }    /* Default */
p { letter-spacing: 2px; }      /* Add 2px between each character */
p { letter-spacing: -0.5px; }   /* Tighten characters */
p { letter-spacing: 0.1em; }    /* Relative to font-size */
```

### Common Use Cases

```css
.uppercase-heading {
  text-transform: uppercase;
  letter-spacing: 0.05em;     /* Always add spacing for uppercase text */
}

.logo {
  letter-spacing: 0.2em;      /* Wide-spaced logo text */
}
```

---

## word-spacing

Gap between words:

```css
p { word-spacing: normal; }     /* Default (usually ~0.25em) */
p { word-spacing: 5px; }        /* Extra 5px between words */
p { word-spacing: -2px; }       /* Tighter words */
p { word-spacing: 0.5em; }      /* Relative */
```

---

## line-height

Vertical space for each line of text:

```css
p { line-height: normal; }      /* Browser default (~1.2) */
p { line-height: 1.5; }         /* Unitless (recommended) — 1.5× font-size */
p { line-height: 24px; }        /* Fixed pixel value */
p { line-height: 150%; }        /* 150% of font-size */
```

### Recommendations

```css
body { line-height: 1.5; }        /* Body text: 1.4–1.6 */
h1   { line-height: 1.1; }        /* Headings: 1.1–1.3 */
.btn { line-height: 1; }          /* Buttons: 1 */
```

> **Best Practice:** Use unitless values (e.g., `1.5`) not fixed units. Unitless values scale with font-size changes.

---

## text-decoration

Adds decorative lines to text:

```css
/* Individual properties */
a { text-decoration-line: underline; }
a { text-decoration-color: red; }
a { text-decoration-style: wavy; }
a { text-decoration-thickness: 2px; }

/* Shorthand */
a { text-decoration: underline wavy red 2px; }
```

### text-decoration-line Values

| Value | Effect |
|-------|--------|
| `none` | No decoration (remove default underline on links) |
| `underline` | Line below text |
| `overline` | Line above text |
| `line-through` | Strikethrough |
| `underline overline` | Both above and below |

### text-decoration-style Values

```css
a { text-decoration-style: solid; }    /* ─── */
a { text-decoration-style: double; }   /* ═══ */
a { text-decoration-style: dashed; }   /* --- */
a { text-decoration-style: dotted; }   /* ··· */
a { text-decoration-style: wavy; }     /* ~~~ */
```

### text-underline-offset

```css
a {
  text-decoration: underline;
  text-underline-offset: 4px;   /* Push underline away from text */
}
```

### text-decoration-skip-ink

```css
a {
  text-decoration: underline;
  text-decoration-skip-ink: auto;  /* Underline skips descenders (default) */
  text-decoration-skip-ink: none;  /* Underline runs through descenders */
}
```

---

## text-transform

Changes text case:

```css
p { text-transform: none; }          /* As written */
p { text-transform: uppercase; }     /* ALL UPPERCASE */
p { text-transform: lowercase; }     /* all lowercase */
p { text-transform: capitalize; }    /* Capitalize Each Word */
p { text-transform: full-width; }    /* Full-width characters (CJK) */
```

---

## text-align

Horizontal alignment of text:

```css
p { text-align: left; }       /* Default (LTR languages) */
p { text-align: right; }
p { text-align: center; }
p { text-align: justify; }    /* Stretch to fill full width */
p { text-align: start; }      /* Logical: depends on text direction */
p { text-align: end; }        /* Logical: depends on text direction */
```

### text-align-last

Alignment of the **last line** in a justified paragraph:

```css
p {
  text-align: justify;
  text-align-last: center;      /* Center the last line */
}
```

---

## text-indent

Indentation of the first line:

```css
p { text-indent: 0; }          /* No indent (default) */
p { text-indent: 2em; }        /* Indent first line by 2em */
p { text-indent: 40px; }       /* Fixed pixel indent */
p { text-indent: -20px; }      /* Hanging indent (negative) */
```

---

## text-overflow

What happens when text overflows its container:

```css
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;   /* Shows "..." when text overflows */
}

.clip {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;       /* Just cuts off (default) */
}
```

### Multi-line Truncation (Line Clamp)

```css
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;         /* Show max 3 lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Modern approach (limited support as of 2025) */
.line-clamp-3 {
  line-clamp: 3;
}
```

---

## white-space

Controls how whitespace and line breaks are handled:

| Value | Whitespace | Newlines | Wrapping |
|-------|-----------|----------|----------|
| `normal` | Collapse | Collapse | Wrap |
| `nowrap` | Collapse | Collapse | **No wrap** |
| `pre` | **Preserve** | **Preserve** | No wrap |
| `pre-wrap` | **Preserve** | **Preserve** | Wrap |
| `pre-line` | Collapse | **Preserve** | Wrap |
| `break-spaces` | **Preserve** | **Preserve** | Wrap (spaces break too) |

```css
code { white-space: pre; }        /* Preserve formatting in code */
.nowrap { white-space: nowrap; }   /* Prevent line breaking */
```

---

## word-break & overflow-wrap

### word-break

```css
p { word-break: normal; }        /* Break at normal break points */
p { word-break: break-all; }     /* Break anywhere (even mid-word) */
p { word-break: keep-all; }      /* Don't break CJK characters */
```

### overflow-wrap (formerly word-wrap)

```css
p { overflow-wrap: normal; }        /* Only break at normal points */
p { overflow-wrap: break-word; }    /* Break long words if needed */
p { overflow-wrap: anywhere; }      /* Like break-word but affects min-content */
```

### Difference

```css
/* word-break: break-all → breaks ALL words at any character */
/* overflow-wrap: break-word → only breaks words that overflow */
```

---

## text-wrap (Modern CSS)

```css
h1 { text-wrap: balance; }    /* Balance lines for even width (headings) */
h1 { text-wrap: pretty; }     /* Prevents orphans (single words on last line) */
p  { text-wrap: wrap; }       /* Normal wrapping (default) */
p  { text-wrap: nowrap; }     /* No wrapping */
p  { text-wrap: stable; }     /* Prevent layout shift on editable text */
```

> `text-wrap: balance` is great for headings — it makes multi-line headings look cleaner.

---

## text-shadow

```css
/* text-shadow: offsetX offsetY blur color */
h1 { text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }

/* Multiple shadows */
h1 {
  text-shadow:
    1px 1px 2px black,
    0 0 10px blue,
    0 0 20px blue;
}

/* No blur */
h1 { text-shadow: 2px 2px 0 black; }

/* Embossed effect */
h1 {
  color: #ccc;
  text-shadow: -1px -1px 0 #000, 1px 1px 0 #fff;
}
```

---

## writing-mode & text-orientation

```css
/* Vertical text */
.vertical {
  writing-mode: vertical-rl;     /* Top-to-bottom, right-to-left */
  text-orientation: mixed;        /* Default */
}

.vertical-lr {
  writing-mode: vertical-lr;     /* Top-to-bottom, left-to-right */
}

/* Sideways text */
.sideways {
  writing-mode: sideways-rl;
}
```

---

## hyphens

Automatic hyphenation at line breaks:

```css
p {
  hyphens: auto;         /* Browser hyphenates automatically */
  -webkit-hyphens: auto;
  lang: "en";            /* Must set lang attribute for hyphens to work */
}

p { hyphens: manual; }   /* Only at &shy; or - */
p { hyphens: none; }     /* No hyphenation */
```

```html
<p lang="en">This long supercalifragilisticexpialidocious word will hyphenate.</p>
```

---

## Complete Example

```css
.article {
  font-family: "Georgia", serif;
  font-size: 1.125rem;
  line-height: 1.7;
  color: #333;
  text-align: justify;
  hyphens: auto;
}

.article h1 {
  font-family: "Inter", sans-serif;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  line-height: 1.2;
  letter-spacing: -0.02em;
  text-wrap: balance;
  text-align: left;
}

.article a {
  color: #2563eb;
  text-decoration: underline;
  text-decoration-color: rgba(37, 99, 235, 0.3);
  text-underline-offset: 3px;
  transition: text-decoration-color 0.2s;
}

.article a:hover {
  text-decoration-color: currentcolor;
}
```
