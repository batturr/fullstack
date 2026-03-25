# JavaScript JSON

**JSON** (JavaScript Object Notation) is a lightweight, text-based data format used to represent structured data. It is language-independent but maps cleanly to JavaScript values, which makes it the default choice for web APIs, configuration, and persistence. In the browser and in Node.js, the global `JSON` object provides `parse` and `stringify` for converting between JSON text and JavaScript values.

---

## 📑 Table of Contents

1. [JSON Basics](#1-json-basics)
2. [JSON Methods](#2-json-methods)
3. [JSON Handling](#3-json-handling)
4. [JSON Use Cases](#4-json-use-cases)
5. [Best Practices](#best-practices)
6. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 1. JSON Basics

### 1.1 JSON syntax (at a glance)

Valid JSON is built from **Unicode text** (typically UTF-8). Keys must be **double-quoted strings**. String values use **double quotes** with standard escapes (`\"`, `\\`, `\n`, `\t`, `\uXXXX`). Whitespace between tokens is allowed but not required.

```javascript
// This is a JSON *string* (what you send over the wire or store in a file)
const jsonText = `{
  "name": "Ada",
  "active": true,
  "score": 98.5,
  "tags": ["js", "json"],
  "meta": { "version": 1 }
}`;

const data = JSON.parse(jsonText);
console.log(data.name); // "Ada"
```

### 1.2 Data types in JSON

JSON supports exactly six value kinds:

| JSON type   | Example in JSON              | After `JSON.parse` in JS        |
|------------|------------------------------|----------------------------------|
| string     | `"hello"`                    | `string`                         |
| number     | `42`, `-1`, `3.14`, `1e6`    | `number`                         |
| boolean    | `true`, `false`              | `boolean`                        |
| null       | `null`                       | `null`                           |
| array      | `[1, "a", false]`            | `Array`                          |
| object     | `{ "k": "v" }`               | plain `Object`                   |

```javascript
const doc = `{
  "title": "Note",
  "count": 10,
  "ok": true,
  "empty": null,
  "items": [1, 2, 3],
  "nested": { "a": 1 }
}`;

console.log(JSON.parse(doc));
```

### 1.3 Structure rules

- The **root** of a JSON document must be a single value: an **object** `{...}`, an **array** `[...]`, or a primitive (`string`, `number`, `boolean`, `null`).
- **Objects** are unordered maps: string keys → JSON values. Duplicate keys are invalid in practice; parsers often keep the last occurrence.
- **Arrays** are ordered lists of JSON values.
- **Numbers** are decimal; there is **no** `NaN`, `Infinity`, or `-Infinity` in JSON.
- **No comments** (`//` or `/* */`) are allowed in JSON (unlike JavaScript object literals).

```javascript
// Valid minimal JSON documents
JSON.parse('{}');        // {}
JSON.parse('[]');        // []
JSON.parse('"plain"');   // "plain"
JSON.parse('42');        // 42
JSON.parse('true');      // true
JSON.parse('null');      // null
```

### 1.4 JSON vs JavaScript objects

JavaScript **object literals** are source code; JSON is a **serialization format**. They look similar but differ in important ways.

```javascript
// JavaScript object literal — keys can be unquoted if valid identifiers;
// values can be any JS expression (functions, undefined, Symbol, BigInt caveats).
const jsObj = {
  name: "Bob",
  'role-id': 2,
  [Symbol('id')]: 99,
  fn: () => {},
  undef: undefined,
};

// JSON.stringify only serializes JSON-safe data; see section 3 for edge cases.
console.log(JSON.stringify(jsObj));
// {"name":"Bob","role-id":2}  — Symbol, function, undefined omitted at root level rules apply

// JSON requires double-quoted keys and JSON-only values
const json = '{"name":"Bob","role-id":2}';
console.log(JSON.parse(json));
```

**Quick comparison**

| Feature              | JSON text                    | JavaScript object / value        |
|---------------------|------------------------------|-----------------------------------|
| Key quoting         | Keys always `"string"`       | Keys can be identifiers or strings |
| Trailing commas     | Not allowed                  | Allowed in modern JS              |
| `undefined`         | Not a JSON value             | Valid in JS                       |
| Functions / Symbols | Not representable            | Valid in JS                       |
| Single-quoted strings | Invalid in JSON            | Valid in JS literals              |

---

## 2. JSON Methods

### 2.1 `JSON.parse(text[, reviver])`

`JSON.parse` converts a JSON **string** into a JavaScript value. The optional **reviver** is a function that can transform values while the result tree is built (parent keys are visited after children).

```javascript
const text = '{"created":"2020-01-01T00:00:00.000Z","count":3}';

const raw = JSON.parse(text);
console.log(raw.created); // string, not a Date

// Reviver: turn ISO date strings into Date instances
const withDates = JSON.parse(text, (key, value) => {
  if (key === 'created' && typeof value === 'string') {
    return new Date(value);
  }
  return value;
});

console.log(withDates.created instanceof Date); // true
```

Revivers run depth-first: when the reviver returns `undefined` for an object **property**, that property is **deleted** from the parent object.

```javascript
const stripped = JSON.parse(
  '{"keep":1,"drop":2}',
  (key, value) => (key === 'drop' ? undefined : value)
);
console.log(stripped); // { keep: 1 }
```

### 2.2 `JSON.stringify(value[, replacer[, space]])`

`JSON.stringify` converts a JavaScript value into a JSON string. It skips non-JSON values according to specific rules (see section 3).

```javascript
const payload = { user: 'carol', roles: ['admin', 'editor'] };
const line = JSON.stringify(payload);
console.log(line);
// {"user":"carol","roles":["admin","editor"]}
```

### 2.3 Replacer function or array

**Array replacer**: whitelist of property names (only for objects; array indices as strings for arrays).

```javascript
const obj = { a: 1, b: 2, c: { d: 3, e: 4 } };
console.log(JSON.stringify(obj, ['a', 'c', 'd']));
// {"a":1,"c":{"d":3}}
```

**Function replacer**: called for each key/value; return `undefined` to omit a property.

```javascript
const out = JSON.stringify(
  { password: 'secret', username: 'dave' },
  (key, value) => (key === 'password' ? undefined : value)
);
console.log(out); // {"username":"dave"}
```

### 2.4 Pretty printing with `space`

The third argument inserts indentation for human-readable output. It can be a number of spaces or a string (e.g. `'\t'`).

```javascript
const data = { id: 1, name: 'Eve', tags: ['a', 'b'] };

console.log(JSON.stringify(data, null, 2));
/*
{
  "id": 1,
  "name": "Eve",
  "tags": [
    "a",
    "b"
  ]
}
*/
```

---

## 3. JSON Handling

### 3.1 Parsing errors and `try...catch`

Malformed JSON throws a `SyntaxError`. Always guard parsing of **untrusted** or **external** text.

```javascript
function safeParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.error('Invalid JSON:', err.message);
      return fallback;
    }
    throw err;
  }
}

console.log(safeParse('{ bad json }', {})); // {}
```

### 3.2 Circular references

`JSON.stringify` cannot serialize graphs with cycles; it throws `TypeError`.

```javascript
const a = { name: 'a' };
const b = { name: 'b', ref: a };
a.ref = b;

try {
  JSON.stringify(a);
} catch (e) {
  console.log(e.name); // TypeError
}

// Typical workaround: track seen objects and replace cycles with a placeholder
function stringifySafe(value, space) {
  const seen = new WeakSet();
  return JSON.stringify(
    value,
    (key, val) => {
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) return '[Circular]';
        seen.add(val);
      }
      return val;
    },
    space
  );
}

console.log(stringifySafe(a, 2));
```

### 3.3 Date serialization and deserialization

`Date` objects stringify to ISO 8601 strings. Parsing does **not** auto-restore `Date` unless you use a **reviver** (see §2.1).

```javascript
const when = new Date('2024-06-15T12:00:00.000Z');
const json = JSON.stringify({ at: when });
console.log(json); // {"at":"2024-06-15T12:00:00.000Z"}

const back = JSON.parse(json, (k, v) =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v) ? new Date(v) : v
);
console.log(back.at instanceof Date); // true
```

### 3.4 Functions are not serialized

Function values are **omitted** from objects and arrays when stringified (or the whole value becomes `undefined` at the root).

```javascript
const x = {
  n: 1,
  f: function () {
    return 2;
  },
};
console.log(JSON.stringify(x)); // {"n":1}

console.log(JSON.stringify(() => {})); // undefined
```

If you must move behavior, store a **string name** or **URL** and resolve it in code — do not `eval` untrusted strings.

### 3.5 `undefined`, `Symbol`, and sparse arrays

- In **objects**, properties whose value is `undefined` are **omitted** by `JSON.stringify`.
- In **arrays**, `undefined` (and `Symbol` and functions) stringify as **`null`** (holes become `null` as well in many engines when stringified via JSON).

```javascript
console.log(JSON.stringify({ a: 1, b: undefined })); // {"a":1}

console.log(JSON.stringify([1, undefined, 3])); // [1,null,3]

const sym = Symbol('s');
console.log(JSON.stringify({ [sym]: 1 })); // {}

console.log(JSON.stringify(undefined)); // undefined
```

`BigInt` is not JSON-safe and throws unless you convert to string first.

```javascript
try {
  JSON.stringify({ n: 10n });
} catch (e) {
  console.log(e.name); // TypeError
}

console.log(JSON.stringify({ n: (10n).toString() })); // {"n":"10"}
```

---

## 4. JSON Use Cases

### 4.1 API communication

HTTP APIs commonly use JSON bodies. `fetch` parses text; you choose when to call `JSON.parse` or use `.json()`.

```javascript
async function getUser(id) {
  const res = await fetch(`https://api.example.com/users/${id}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // parses JSON body to object/array
}

async function createUser(user) {
  const res = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(user),
  });
  return res.json();
}
```

### 4.2 Configuration files

Build tools and apps often read `package.json`, `tsconfig.json`, etc. In Node.js, `require` historically parsed JSON; modern ESM favors `readFile` + `JSON.parse` or `import` assertions.

```javascript
// Node.js (ESM) — conceptual example
// import { readFileSync } from 'node:fs';
// const cfg = JSON.parse(readFileSync('./app.config.json', 'utf8'));
// console.log(cfg.apiBaseUrl);
```

Keep secrets out of committed JSON config; use environment variables for credentials.

### 4.3 Data storage in `localStorage`

`localStorage` stores **strings**. Serialize objects with `JSON.stringify` and parse on read.

```javascript
const KEY = 'app:session';

function saveSession(session) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

function loadSession() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

saveSession({ token: 'abc', userId: 42 });
console.log(loadSession());
```

**Limits**: ~5MB per origin (varies), synchronous API, and **only strings** — still no native `Date` or `Map` unless you design a custom revival format.

### 4.4 Data exchange formats

JSON interoperates with databases (JSON columns), message queues, and other languages. For binary or schema-heavy systems, formats like **Protocol Buffers** or **MessagePack** may be used instead; JSON remains the default for human-readable REST and browser clients.

```javascript
// Example: normalizing an exchange payload
function normalizeProduct(raw) {
  const p = JSON.parse(raw);
  return {
    id: String(p.id),
    price: Number(p.price),
    inStock: Boolean(p.inStock),
  };
}
```

### 4.5 JSON Schema validation

[JSON Schema](https://json-schema.org/) describes allowed shape and types of JSON documents. JavaScript does not ship a built-in validator; libraries such as **Ajv** are common in Node and bundler setups.

```javascript
// Example schema as JSON text (draft-07 style, simplified)
const schemaText = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["email", "age"],
  "properties": {
    "email": { "type": "string", "format": "email" },
    "age": { "type": "integer", "minimum": 0 }
  },
  "additionalProperties": false
}`;

const schema = JSON.parse(schemaText);

// Pseudocode for validation flow (real code uses Ajv or similar):
// const Ajv = require('ajv');
// const ajv = new Ajv();
// const validate = ajv.compile(schema);
// const ok = validate({ email: 'a@b.com', age: 30 });
// if (!ok) console.log(validate.errors);

console.log('Schema loaded, type:', schema.type); // object
```

Use JSON Schema in CI to validate API fixtures, config files, and OpenAPI models.

---

## Best Practices

- **Validate before trusting**: Parse inside `try/catch`; validate shape (manual checks, TypeScript at compile time, or JSON Schema at runtime).
- **Explicit dates**: Standardize on ISO 8601 strings and revive with a reviver when loading.
- **Version your payloads**: Include a `schemaVersion` or `apiVersion` field so clients can migrate safely.
- **Stable key ordering** (optional): For signed payloads or deterministic hashes, sort keys before stringify or use a canonicalization library.
- **Security**: Never interpolate untrusted data into JSON by string concatenation; build an object and `JSON.stringify` it to avoid injection bugs. Do not `eval` JSON.
- **Size and performance**: Large JSON can block the main thread when parsed; for huge data consider streaming parsers (Node) or Web Workers in the browser.
- **Privacy**: Strip PII and secrets in logs; use replacers to redact sensitive fields.

---

## Common Mistakes to Avoid

- **Using single quotes** in JSON text or forgetting quotes on keys — parsers will throw.
- **Trailing commas** in JSON (`{"a":1,}`) — invalid in JSON (valid in modern JS objects).
- **Assuming `JSON.parse` returns a plain object** — it can return an array, string, number, boolean, or `null`; check `typeof` / `Array.isArray` before use.
- **Expecting `Date` or `Map` round-trips** — they do not without custom reviver/replacer logic.
- **Calling `JSON.stringify` on values with cycles** — always handle or detect circular structures.
- **Storing non-UTF-8 or binary** in JSON strings without proper encoding (e.g. Base64) — JSON is text.
- **Relying on property order** in JSON objects for logic — parsers may not guarantee order in all contexts; use arrays when order matters.
- **Using `JSON.parse` on JavaScript code** — that is not JSON; use a real JS parser or `import()` for modules, not `eval`.

---

*These notes focus on ECMAScript `JSON` behavior as implemented in modern browsers and Node.js. Always refer to the latest ECMAScript specification for normative details.*
