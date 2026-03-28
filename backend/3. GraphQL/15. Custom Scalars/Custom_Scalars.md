# GraphQL Custom Scalars

## 📑 Table of Contents

- [15.1 Custom Scalar Fundamentals](#151-custom-scalar-fundamentals)
  - [15.1.1 Custom Scalar Definition](#1511-custom-scalar-definition)
  - [15.1.2 Scalar Serialization](#1512-scalar-serialization)
  - [15.1.3 Scalar Parsing](#1513-scalar-parsing)
  - [15.1.4 Scalar Validation](#1514-scalar-validation)
  - [15.1.5 Scalar Documentation](#1515-scalar-documentation)
- [15.2 Common Custom Scalars](#152-common-custom-scalars)
  - [15.2.1 DateTime Scalar](#1521-datetime-scalar)
  - [15.2.2 Date Scalar](#1522-date-scalar)
  - [15.2.3 Time Scalar](#1523-time-scalar)
  - [15.2.4 JSON Scalar](#1524-json-scalar)
  - [15.2.5 URL Scalar](#1525-url-scalar)
- [15.3 Specialized Scalars](#153-specialized-scalars)
  - [15.3.1 UUID Scalar](#1531-uuid-scalar)
  - [15.3.2 Email Scalar](#1532-email-scalar)
  - [15.3.3 Phone Scalar](#1533-phone-scalar)
  - [15.3.4 Currency Scalar](#1534-currency-scalar)
  - [15.3.5 Coordinate Scalar](#1535-coordinate-scalar)
- [15.4 Custom Scalar Implementation](#154-custom-scalar-implementation)
  - [15.4.1 Serialization Logic](#1541-serialization-logic)
  - [15.4.2 Parse Value Logic](#1542-parse-value-logic)
  - [15.4.3 Parse Literal Logic](#1543-parse-literal-logic)
  - [15.4.4 Error Handling](#1544-error-handling)
  - [15.4.5 Type Coercion](#1545-type-coercion)
- [15.5 Advanced Custom Scalars](#155-advanced-custom-scalars)
  - [15.5.1 Polymorphic Scalars](#1551-polymorphic-scalars)
  - [15.5.2 Nested Scalars](#1552-nested-scalars)
  - [15.5.3 Branded Types](#1553-branded-types)
  - [15.5.4 Validated Scalars](#1554-validated-scalars)
  - [15.5.5 Performance Optimizations](#1555-performance-optimizations)

---

## 15.1 Custom Scalar Fundamentals

### 15.1.1 Custom Scalar Definition

#### Beginner

A **custom scalar** extends GraphQL beyond built-in `Int`, `Float`, `String`, `Boolean`, and `ID`. You declare `scalar DateTime` in SDL, then provide runtime functions that parse inputs and serialize outputs.

#### Intermediate

Scalars are both **input** and **output** types (unlike unions). They appear in arguments, input objects, and field return types. The spec treats scalars as leaf types.

#### Expert

Implement via `GraphQLScalarType` in `graphql-js` or framework helpers (`apollo-server`, Pothos, Nexus). Federation may require scalars to be defined consistently across subgraphs with compatible serialization.

```graphql
scalar DateTime
scalar URL

type Event {
  id: ID!
  startsAt: DateTime!
  infoUrl: URL
}
```

```javascript
const { GraphQLScalarType, Kind } = require("graphql");

const DateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  description: "ISO-8601 instant in UTC",
  serialize(value) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? new Date(ast.value) : null;
  },
});
```

#### Key Points

- SDL declares the name; JS implements behavior.
- Scalars are the extension point for domain primitives.
- Must handle both variables and inline literals.

#### Best Practices

- Choose widely understood wire formats (ISO-8601, RFC URLs).
- Name scalars clearly (`DateTime` vs `Timestamp`).
- Add descriptions for tooling.

#### Common Mistakes

- Declaring `scalar Foo` without registering implementation (runtime errors).
- Different subgraphs defining incompatible `Foo` behavior.

---

### 15.1.2 Scalar Serialization

#### Beginner

**Serialization** converts an internal resolver result (Date, bigint, custom class) into a JSON-compatible value in the HTTP response.

#### Intermediate

For custom scalars, `serialize` runs on **output** when the field resolves. It must throw or coerce invalid internal values consistently.

#### Expert

Serialization errors surface as field errors in the `errors` array with path to the field. Avoid leaking stack traces; wrap with `GraphQLError` if your framework requires structured extensions.

```javascript
const PositiveInt = new GraphQLScalarType({
  name: "PositiveInt",
  serialize(value) {
    if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
      throw new TypeError("PositiveInt must be a positive integer");
    }
    return value;
  },
  parseValue(v) {
    const n = Number(v);
    if (!Number.isInteger(n) || n <= 0) throw new TypeError("Invalid PositiveInt");
    return n;
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.INT) return undefined;
    return PositiveInt.parseValue(ast.value);
  },
});
```

#### Key Points

- Output path uses `serialize`.
- JSON numbers/strings/booleans are typical results.
- Throwing rejects the field, not always the whole request.

#### Best Practices

- Accept reasonable internal representations (Date, number).
- Normalize formats (always UTC ISO strings for datetimes).
- Log unexpected internal types in development.

#### Common Mistakes

- Returning `undefined` silently (may strip field incorrectly depending on nullability).
- Serializing BigInt without a string strategy in JSON.

---

### 15.1.3 Scalar Parsing

#### Beginner

**Parsing** converts **incoming** GraphQL values to internal forms. Two entry points: `parseValue` for variables, `parseLiteral` for hard-coded literals in the document.

#### Intermediate

Variables arrive as JSON already; `parseValue` receives JavaScript primitives or objects (for lists/objects—those are not scalars). Literals are AST nodes (`StringValue`, `IntValue`).

#### Expert

`parseLiteral` must recurse if you model structured scalars (discouraged). Prefer JSON scalar or separate input types for structures.

```javascript
const { Kind } = require("graphql");

parseLiteral(ast) {
  switch (ast.kind) {
    case Kind.STRING:
      return ast.value;
    case Kind.INT:
      return ast.value;
    default:
      return undefined;
  }
}
```

#### Key Points

- `parseValue` ≠ `parseLiteral`—implement both.
- Returning `undefined`/`null` invalidates the literal/value per rules.
- Coercion happens before resolvers for arguments.

#### Best Practices

- Share validation helpers between parse paths.
- Reject objects where you expect strings.
- Unit-test both variable and inline literal queries.

#### Common Mistakes

- Implementing only `parseValue` (inline literals fail).
- Mutating AST nodes in `parseLiteral`.

---

### 15.1.4 Scalar Validation

#### Beginner

Scalars are the **first line of validation** for leaf data: emails, URLs, UUIDs. Invalid input fails before business logic.

#### Intermediate

Combine scalar validation with input-object validators for cross-field rules. Scalars should not access databases.

#### Expert

For expensive validation (DNS on email domain), consider lazy validation in resolvers or async rules—scalar parsing is synchronous in `graphql-js`; heavy work can block event loop.

```javascript
const EmailScalar = new GraphQLScalarType({
  name: "Email",
  serialize: (v) => v,
  parseValue: (v) => {
    if (typeof v !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      throw new TypeError("Invalid email");
    }
    return v.toLowerCase();
  },
  parseLiteral: (ast) => {
    if (ast.kind !== Kind.STRING) return undefined;
    return EmailScalar.parseValue(ast.value);
  },
});
```

#### Key Points

- Keep scalar checks cheap and deterministic.
- Normalize canonical forms (lowercase email).
- Throw `TypeError` or `GraphQLError` per your wrapper.

#### Best Practices

- Prefer well-tested regex or libraries (validator.js).
- Document accepted formats in scalar description.
- Do not validate uniqueness in scalars.

#### Common Mistakes

- Using scalars for business rules (“email must be corporate domain”).
- Swallowing invalid values and returning unexpected types.

---

### 15.1.5 Scalar Documentation

#### Beginner

Add a **description** on `GraphQLScalarType` and/or SDL `""" ... """` above `scalar Foo`. State format, timezone, and examples.

#### Intermediate

Link to RFCs or ISO standards. If the wire is a string encoding of a number, say so to avoid client type confusion.

#### Expert

In public APIs, publish example operations in docs showing variables and literals. Changelog scalar behavior changes—they can be breaking even if the name is unchanged.

```graphql
"""
Instant in time as RFC3339 string, e.g. "2026-03-28T12:00:00.000Z".
Always UTC; client must convert for display.
"""
scalar DateTime
```

#### Key Points

- Descriptions surface in GraphiQL/Studio.
- Examples reduce integration time.
- Clarify null vs invalid empty string.

#### Best Practices

- Mention precision (milliseconds vs seconds).
- Note comparison with built-in types (`ID` vs `UUID` scalar).
- Align docs with actual `serialize`/`parse` behavior.

#### Common Mistakes

- Promising UTC but serializing local time.
- Undocumented behavior changes in patch releases.

---

## 15.2 Common Custom Scalars

### 15.2.1 DateTime Scalar

#### Beginner

**DateTime** represents an instant (date + time + zone or UTC). Wire format is usually **ISO-8601** string. Internal representation is often a JavaScript `Date`.

#### Intermediate

Always pick **one convention**: store UTC in DB, serialize UTC ISO strings, reject offsets if you do not want ambiguity—or preserve offsets explicitly and use a library (`luxon`, `date-fns-tz`).

#### Expert

JavaScript `Date` parses some ISO strings inconsistently across engines; validate with a dedicated parser. For nanosecond precision, use string transport and string internal type.

```javascript
const DateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  serialize(value) {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      throw new TypeError("DateTime serialize expected Date");
    }
    return value.toISOString();
  },
  parseValue(value) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) throw new TypeError("Invalid DateTime");
    return d;
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) return undefined;
    return DateTimeScalar.parseValue(ast.value);
  },
});
```

#### Key Points

- ISO strings interop well with JSON.
- `Date` is mutable—consider copying before returning from resolvers.
- Document timezone policy.

#### Best Practices

- Use `timestamptz` in Postgres.
- Reject obviously wrong years in high-risk apps.
- Test DST boundaries if accepting offsets.

#### Common Mistakes

- Mixing “date only” strings with DateTime scalar.
- Allowing empty string as valid DateTime.

---

### 15.2.2 Date Scalar

#### Beginner

A **Date** scalar models a **calendar day** without time—birthdays, holidays. Wire format often `YYYY-MM-DD` string.

#### Intermediate

Avoid `Date` objects (which carry timezone) for pure dates; use strings or a small `{ year, month, day }` class internally.

#### Expert

Parsing `YYYY-MM-DD` as `Date` in JS is UTC midnight in ES5 engines—be careful with local shifts. Libraries like `Temporal.PlainDate` (stage proposals) or `date-fns` parse components safely.

```javascript
const DateScalar = new GraphQLScalarType({
  name: "Date",
  serialize: (v) => v,
  parseValue: (v) => {
    if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      throw new TypeError("Date must be YYYY-MM-DD");
    }
    return v;
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) return undefined;
    return DateScalar.parseValue(ast.value);
  },
});
```

#### Key Points

- Separate `Date` from `DateTime` in schema.
- String wire format avoids timezone drift.
- Validate month/day ranges if strict.

#### Best Practices

- Reject invalid calendar dates (Feb 30).
- Use CHECK constraints in SQL for `date` columns.
- Document leap seconds not applicable to calendar dates.

#### Common Mistakes

- Using `DateTime` for birthdays (time component meaningless).
- Local midnight bugs when converting to `Date`.

---

### 15.2.3 Time Scalar

#### Beginner

**Time** scalars represent time-of-day without date—opening hours. Common wire: `HH:mm:ss` or `HH:mm`.

#### Intermediate

Decide if seconds are required. For durations, use a dedicated `Duration` scalar or `Int` seconds instead of overloading `Time`.

#### Expert

Without timezone, time is ambiguous across regions—pair with `TimeZone` scalar or store as offset if needed.

```javascript
const TimeScalar = new GraphQLScalarType({
  name: "Time",
  serialize: (v) => v,
  parseValue: (v) => {
    if (typeof v !== "string" || !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(v)) {
      throw new TypeError("Invalid Time");
    }
    return v.length === 5 ? `${v}:00` : v;
  },
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? TimeScalar.parseValue(ast.value) : undefined;
  },
});
```

#### Key Points

- Clear distinction from `DateTime`.
- Regex validation is simple for fixed formats.
- Consider 24h vs 12h—prefer 24h in APIs.

#### Best Practices

- Normalize seconds padding.
- Document leap-second policy (usually ignore).
- Pair with locale only at presentation layer.

#### Common Mistakes

- Storing local wall time without zone for global schedules.
- Using `Time` for elapsed duration.

---

### 15.2.4 JSON Scalar

#### Beginner

A **JSON scalar** accepts arbitrary JSON-compatible structures. Common packages: `graphql-type-json`, `graphql-scalars`’s `JSONObject`/`JSON`.

#### Intermediate

**Security**: arbitrary JSON can be large or deeply nested—enforce size and depth limits at the HTTP parser or a wrapping validator.

#### Expert

Prefer structured `input` types when possible; JSON scalars weaken type safety and introspection benefits. If you must use JSON, pair server-side with JSON Schema validation.

```javascript
const { GraphQLScalarType, Kind, valueFromASTUntyped } = require("graphql");

const JSONScalar = new GraphQLScalarType({
  name: "JSON",
  description: "Arbitrary JSON value",
  serialize: (v) => v,
  parseValue: (v) => v,
  parseLiteral(ast) {
    return valueFromASTUntyped(ast);
  },
});
```

#### Key Points

- Flexible but untyped.
- Good for metadata bags, plugin configs, truly dynamic payloads.
- Validate aggressively on server.

#### Best Practices

- Cap payload size at reverse proxy.
- Reject `__proto__` keys if merging objects (prototype pollution).
- Log shape metrics, not raw PII.

#### Common Mistakes

- Using JSON scalar everywhere instead of modeling domain.
- No depth limit leading to stack exhaustion.

---

### 15.2.5 URL Scalar

#### Beginner

A **URL scalar** validates http(s) URLs in variables and literals. Serialize as string.

#### Intermediate

Use the WHATWG `URL` class in Node.js to validate; optionally restrict protocols (`https:` only) for security.

#### Expert

Block internal network ranges (SSRF) if URLs will be fetched server-side—scalar validation is not enough; add network-layer guards.

```javascript
const URLScalar = new GraphQLScalarType({
  name: "URL",
  serialize: (v) => v,
  parseValue: (v) => {
    if (typeof v !== "string") throw new TypeError("URL must be string");
    let u;
    try {
      u = new URL(v);
    } catch {
      throw new TypeError("Invalid URL");
    }
    if (u.protocol !== "https:") throw new TypeError("Only https URLs allowed");
    return u.toString();
  },
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? URLScalar.parseValue(ast.value) : undefined;
  },
});
```

#### Key Points

- Centralizes URL validation.
- Enforces https policy if desired.
- SSRF needs additional checks beyond format.

#### Best Practices

- Normalize URLs (remove default ports).
- Consider max length.
- Document internationalized domain handling (punycode).

#### Common Mistakes

- Fetching user-supplied URLs without SSRF protection.
- Allowing `javascript:` URLs.

---

## 15.3 Specialized Scalars

### 15.3.1 UUID Scalar

#### Beginner

**UUID** scalar validates canonical string form `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (version-agnostic or specific).

#### Intermediate

Node.js 19+ has `crypto.randomUUID()`. For parsing, use `uuid` package’s `validate`/`version` checks.

#### Expert

If exposing both `ID` and `UUID`, document which is stable for `node` refetch. Some APIs base64-wrap UUIDs in `ID`—keep one canonical external representation.

```javascript
const { validate: uuidValidate } = require("uuid");

const UUIDScalar = new GraphQLScalarType({
  name: "UUID",
  serialize: (v) => v,
  parseValue: (v) => {
    if (typeof v !== "string" || !uuidValidate(v)) {
      throw new TypeError("Invalid UUID");
    }
    return v.toLowerCase();
  },
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? UUIDScalar.parseValue(ast.value) : undefined;
  },
});
```

#### Key Points

- Normalizes casing to lowercase commonly.
- Stronger than generic `String` for identifiers.
- Works well with Postgres `uuid` type.

#### Best Practices

- Generate UUIDv7 or v4 per your architecture guidance.
- Index UUID columns appropriately (B-tree).
- Do not log full UUIDs if pseudonymity matters—hash in logs.

#### Common Mistakes

- Accepting UUIDs with wrong segment lengths silently truncated.
- Using UUID where sequential `ID` leaks enumeration concerns—UUID helps.

---

### 15.3.2 Email Scalar

#### Beginner

**Email** scalar validates address format and normalizes case of domain/local parts per policy (often lowercase entire string).

#### Intermediate

Full RFC 5322 validation is complex; pragmatic validation plus verification flow (magic link) is common.

#### Expert

Prevent homograph attacks if displaying emails in UI; scalar cannot solve Unicode confusables—handle in presentation layer.

```javascript
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EmailScalar = new GraphQLScalarType({
  name: "Email",
  serialize: (v) => v,
  parseValue: (v) => {
    if (typeof v !== "string" || v.length > 254 || !EMAIL_RE.test(v)) {
      throw new TypeError("Invalid email");
    }
    return v.trim().toLowerCase();
  },
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? EmailScalar.parseValue(ast.value) : undefined;
  },
});
```

#### Key Points

- Format validation ≠ deliverability.
- Normalization avoids duplicate accounts by case.
- Length limits matter for DB columns.

#### Best Practices

- Store normalized form.
- Separate `Email` scalar from `String` for clarity.
- Add verification status on the user type, not the scalar.

#### Common Mistakes

- Rejecting valid internationalized emails with strict regex.
- Using scalar to check disposable domains (too heavy).

---

### 15.3.3 Phone Scalar

#### Beginner

**Phone** scalars often store **E.164** format `+15551234567` for international consistency.

#### Intermediate

Use `libphonenumber-js` to parse regional inputs to E.164 in mutations, or enforce E.164-only at the API boundary.

#### Expert

Store country code separately if you need reliable formatting for SMS providers; still expose E.164 in GraphQL for simplicity.

```javascript
const parsePhoneNumberFromString = require("libphonenumber-js").parsePhoneNumberFromString;

const PhoneScalar = new GraphQLScalarType({
  name: "Phone",
  serialize: (v) => v,
  parseValue: (v) => {
    if (typeof v !== "string") throw new TypeError("Phone must be string");
    const p = parsePhoneNumberFromString(v);
    if (!p || !p.isValid()) throw new TypeError("Invalid phone number");
    return p.format("E.164");
  },
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? PhoneScalar.parseValue(ast.value) : undefined;
  },
});
```

#### Key Points

- E.164 reduces ambiguity.
- Parsing library handles locales better than regex.
- Scalar should reject invalid numbers early.

#### Best Practices

- Never log full phone numbers in analytics.
- Rate-limit SMS triggers separately from GraphQL.
- Document default region if accepting national formats.

#### Common Mistakes

- Storing display-formatted numbers only.
- Valid format but unassigned number ranges—handle at SMS gateway.

---

### 15.3.4 Currency Scalar

#### Beginner

**Currency** often models **ISO 4217** codes (`USD`, `EUR`) as a validated string scalar or enum. Money **amounts** should not be `Float`—use minor units (`Int`) plus currency code.

#### Intermediate

A `Money` type combines `amountCents: BigInt` (or `String` for large values) and `currency: Currency`. Custom scalar for `Currency` alone keeps enums separate from arbitrary strings.

#### Expert

Use `graphql-scalars` `BigInt` or string transport for large integers to avoid JS `Number` precision loss.

```graphql
scalar CurrencyCode

type Money {
  amountMinor: String!
  currency: CurrencyCode!
}
```

```javascript
const ISO4217 = new Set(["USD", "EUR", "GBP" /* ... */]);

const CurrencyCodeScalar = new GraphQLScalarType({
  name: "CurrencyCode",
  serialize: (v) => v,
  parseValue: (v) => {
    if (typeof v !== "string" || !ISO4217.has(v)) {
      throw new TypeError("Unsupported currency");
    }
    return v;
  },
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? CurrencyCodeScalar.parseValue(ast.value) : undefined;
  },
});
```

#### Key Points

- Never use IEEE floats for money.
- Currency scalar ≠ amount scalar.
- Validate against an allowlist.

#### Best Practices

- Store minor units integers in DB.
- Document rounding rules (bankers vs half-up).
- Handle zero-decimal currencies (JPY).

#### Common Mistakes

- `Float` dollars in GraphQL schema.
- Missing currency when amount is present.

---

### 15.3.5 Coordinate Scalar

#### Beginner

**Coordinates** represent points on Earth—often `latitude` and `longitude` as two `Float` fields, or a string `"lat,lng"`, or GeoJSON.

#### Intermediate

Validate latitude `[-90, 90]`, longitude `[-180, 180]`. Prefer two fields or a small input type over ambiguous string parsing.

#### Expert

For PostGIS, expose scalars or fields that map to geography types; ensure axis order matches EPSG:4326 (lat, lon) vs lon, lat confusion.

```javascript
const CoordinateScalar = new GraphQLScalarType({
  name: "Longitude",
  serialize: (v) => v,
  parseValue: (v) => {
    const n = Number(v);
    if (!Number.isFinite(n) || n < -180 || n > 180) {
      throw new TypeError("Invalid longitude");
    }
    return n;
  },
  parseLiteral(ast) {
    return ast.kind === Kind.FLOAT || ast.kind === Kind.INT
      ? CoordinateScalar.parseValue(ast.value)
      : undefined;
  },
});
```

#### Key Points

- Separate scalars or fields for lat vs lon clarity.
- Range validation is essential.
- Watch floating precision for small movements.

#### Best Practices

- Document decimal precision expectations.
- Use spatial indexes for radius queries.
- Consider privacy (rounding) for user locations.

#### Common Mistakes

- Swapping lat/lon order silently.
- Storing floats without SRID context.

---

## 15.4 Custom Scalar Implementation

### 15.4.1 Serialization Logic

#### Beginner

**Serialization** should be **pure**: same internal value → same JSON output. Avoid side effects like DB writes.

#### Intermediate

Convert internal nulls carefully: if field is `NonNull`, returning `null` from `serialize` errors; if nullable, `null` passes through without calling serialize in some paths—know your framework.

#### Expert

For objects, consider serializing to string and parsing back symmetrically. For buffers, pick explicit encoding (base64).

```javascript
serialize(value) {
  if (value == null) return null;
  if (Buffer.isBuffer(value)) return value.toString("base64");
  throw new TypeError("Expected Buffer or null");
}
```

#### Key Points

- Symmetry with parsing aids mental model.
- Handle nullability at field level.
- Pure functions ease testing.

#### Best Practices

- Unit-test edge cases (`0`, `false`, empty string).
- Avoid timezone conversions in serialize if already canonical.
- Benchmark hot scalars if on critical path.

#### Common Mistakes

- Returning non-JSON types (BigInt without plugin).
- Locale-dependent number formatting in APIs.

---

### 15.4.2 Parse Value Logic

#### Beginner

`parseValue` receives **variable** values after JSON parsing. Types are `string`, `number`, `boolean`, `null`, `object`, `array`.

#### Intermediate

Reject objects/arrays for string-based scalars. For numeric scalars, accept both JSON numbers and strings if you want lenient clients—document behavior.

#### Expert

Coerce cautiously: silent coercion hides bugs. Prefer strict parsing for public APIs; lenient parsing only with explicit versioning.

```javascript
parseValue(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && /^-?\d+$/.test(value)) return Number(value);
  throw new TypeError("Expected integer");
}
```

#### Key Points

- Variables path only.
- Strict vs lenient is a product decision.
- Throw on invalid input.

#### Best Practices

- Share code with `parseLiteral` via helpers.
- Trim strings where appropriate.
- Limit string length before regex work.

#### Common Mistakes

- Accepting `true` as `1` without documentation.
- Not handling scientific notation if rejecting floats.

---

### 15.4.3 Parse Literal Logic

#### Beginner

`parseLiteral` receives an **AST node**. Use `ast.kind` to branch (`STRING`, `INT`, `FLOAT`, `BOOLEAN`, `NULL`).

#### Intermediate

Use `valueFromASTUntyped` for JSON-like literals if implementing a JSON scalar. For custom scalars, usually only `STRING` or numeric kinds apply.

#### Expert

For enum-like literals, remember clients cannot pass custom scalars as enum tokens—literals are still strings in GraphQL grammar for strings.

```javascript
const { Kind } = require("graphql");

function parseLiteral(ast) {
  if (ast.kind === Kind.STRING) return ast.value;
  if (ast.kind === Kind.INT) return ast.value;
  return undefined;
}
```

#### Key Points

- Undefined return fails validation for required args.
- AST is immutable.
- Combine with `parseValue` for one source of truth.

#### Best Practices

- Import `Kind` constants, not string compares alone.
- Test inline arguments in operations.
- Support same formats as variables when possible.

#### Common Mistakes

- Forgetting `FLOAT` vs `INT` distinction for whole numbers.
- Returning invalid internal types that break serializers downstream.

---

### 15.4.4 Error Handling

#### Beginner

Throw **`TypeError`**, **`GraphQLError`**, or your framework’s error type when parsing/serialization fails. Messages should be safe for clients.

#### Intermediate

GraphQL will place errors in the `errors` array with locations. Use `extensions` for codes like `BAD_USER_INPUT` if wrapping in a formatter.

#### Expert

Distinguish scalar coercion errors (client bug) from resolver errors (server/domain). Monitor rates; spikes may indicate an outdated mobile client.

```javascript
const { GraphQLError } = require("graphql");

parseValue(value) {
  try {
    return strictParse(value);
  } catch (e) {
    throw new GraphQLError("Invalid scalar", {
      extensions: { code: "BAD_USER_INPUT", scalar: "SKU" },
    });
  }
}
```

#### Key Points

- Clear messages aid debugging.
- Extensions carry structured metadata.
- Do not include internal stack traces to clients.

#### Best Practices

- Standardize error codes across scalars.
- Log server-side details separately.
- Test error paths in integration tests.

#### Common Mistakes

- Empty error messages.
- Throwing strings instead of Error objects.

---

### 15.4.5 Type Coercion

#### Beginner

**Coercion** is GraphQL’s process to adapt values to types. Scalars participate through parse/serialize functions; the engine handles `null`, lists, and non-null wrappers around your scalar.

#### Intermediate

If a variable is `String` but argument is `MyScalar`, `parseValue` of `MyScalar` runs. Lists of scalars map per element.

#### Expert

Non-null coercion happens after scalar parsing; a scalar parse returning `null` may violate `MyScalar!` and error before resolver.

```graphql
query ($x: Email!) {
  user(email: $x) {
    id
  }
}
```

```javascript
// variable null → validation error before parseValue
// variable "" → parseValue throws or returns invalid
```

#### Key Points

- Scalars are the leaf coercion point.
- `!` modifiers wrap your scalar behavior.
- Lists use element-wise coercion.

#### Best Practices

- Test `T`, `T!`, `[T!]`, `[T!]!` combinations.
- Document behavior for empty string vs null for custom scalars.
- Align with GraphQL spec coercion order.

#### Common Mistakes

- Assuming `parseValue` runs when variable type mismatches earlier.
- Returning `null` from `parseValue` for `String!` scalar incorrectly.

---

## 15.5 Advanced Custom Scalars

### 15.5.1 Polymorphic Scalars

#### Beginner

A **polymorphic scalar** accepts multiple wire shapes (for example string **or** number) and normalizes to one internal form. This complicates clients and tools—use sparingly.

#### Intermediate

If polymorphism is needed, prefer **union output types** or separate fields instead of overloaded scalars.

#### Expert

When migrating wire formats, accept both temporarily in `parseValue`, serialize to the new canonical format only, log old format usage, then remove support.

```javascript
parseValue(value) {
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  throw new TypeError("Expected string or number");
}
```

#### Key Points

- Increases client ambiguity.
- Useful for gradual migration only.
- Document accepted variants explicitly.

#### Best Practices

- Set telemetry on legacy branches.
- Sunset old branches with deadlines.
- Prefer explicit union types long term.

#### Common Mistakes

- Hiding multiple concepts behind one scalar name.
- Unbounded polymorphism (objects, arrays, strings).

---

### 15.5.2 Nested Scalars

#### Beginner

Scalars are **leaves**; they cannot have subfields. “Nested scalars” usually means **encoding** nested data in a string (JSON string) or using a `JSON` scalar—not true nesting in the GraphQL sense.

#### Intermediate

If you embed JSON in a string scalar, you double-encode mentally: escape carefully and validate inner JSON separately.

#### Expert

Prefer `input` types for nesting. If using JSON scalar, apply JSON Schema validation in a middleware layer.

```javascript
parseValue(value) {
  if (typeof value !== "string") throw new TypeError("Expected JSON string");
  const obj = JSON.parse(value);
  if (typeof obj !== "object" || obj === null) throw new TypeError("Expected object");
  return obj;
}
```

#### Key Points

- GraphQL type system does not nest scalars.
- String-encoded JSON is a workaround.
- Structured inputs beat encoded strings.

#### Best Practices

- Minimize double encoding.
- Validate inner shape.
- Size-limit parsed JSON.

#### Common Mistakes

- Parsing untrusted JSON without limits.
- Using nested scalars instead of refactoring schema.

---

### 15.5.3 Branded Types

#### Beginner

In TypeScript, **branded types** distinguish `UserId` from `PostId` at compile time while both are strings at runtime. GraphQL still uses separate scalars or clear naming (`UserID`, `PostID`).

#### Intermediate

Define `scalar UserID` and `scalar PostID` with the same parse rules if you want stronger codegen distinctions.

#### Expert

Ensure global ID encoders embed type name to avoid cross-type ID injection. Branded scalars align well with `node` refetch patterns.

```graphql
scalar UserId
scalar PostId

type User {
  id: UserId!
}

type Post {
  id: PostId!
}
```

```typescript
type UserId = string & { readonly __brand: "UserId" };
```

#### Key Points

- GraphQL scalars enable TS branding via codegen.
- Runtime validation should still treat IDs as opaque strings.
- Helps prevent argument swaps in large APIs.

#### Best Practices

- Keep parse rules identical if only branding differs.
- Document encoding format once.
- Use consistent suffix `Id` vs `ID`.

#### Common Mistakes

- Too many scalars confuses API explorers.
- Different validation rules accidentally copied incorrectly.

---

### 15.5.4 Validated Scalars

#### Beginner

**Validated scalars** centralize domain constraints: `SKU`, `Slug`, `ColorHex`. They act as types + validation in one.

#### Intermediate

Keep validators synchronous; async validation belongs in resolvers/DataLoader unless your framework supports async scalars (nonstandard).

#### Expert

Compose validators: `Slug` checks charset + length; `ReservedSlug` blacklist lives in config loaded at startup.

```javascript
const SlugScalar = new GraphQLScalarType({
  name: "Slug",
  serialize: (v) => v,
  parseValue: (v) => {
    if (typeof v !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)) {
      throw new TypeError("Invalid slug");
    }
    if (v.length > 120) throw new TypeError("Slug too long");
    return v;
  },
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? SlugScalar.parseValue(ast.value) : undefined;
  },
});
```

#### Key Points

- DRY validation across mutations and queries.
- Clear error messages per scalar.
- Good for security-sensitive formats.

#### Best Practices

- Centralize regex/constants.
- Test boundary lengths.
- Version slugs if rules tighten.

#### Common Mistakes

- Validating reserved words only in one resolver.
- Throwing different error types inconsistently.

---

### 15.5.5 Performance Optimizations

#### Beginner

Scalars run **per value**; keep regex simple. Cache compiled regexes at module scope, not per call.

#### Intermediate

Avoid allocating new `Date` objects if returning unchanged from DB layer—still validate immutability expectations of your cache layers.

#### Expert

For high-throughput, short-circuit checks (`typeof` first), use Aho-Corasick for many allowlisted strings instead of repeated regex, and profile with clinic/flame graphs.

```javascript
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

parseValue(value) {
  if (typeof value !== "string") throw new TypeError("Invalid");
  if (value.length > 254) throw new TypeError("Invalid");
  if (!RE_EMAIL.test(value)) throw new TypeError("Invalid");
  return value.toLowerCase();
}
```

#### Key Points

- Scalars are hot paths in large arrays.
- Micro-optimizations matter in list-heavy responses.
- Measure before exotic optimizations.

#### Best Practices

- Precompile regexes.
- Avoid heavy libraries in parseLiteral hot paths.
- Batch domain validation outside scalar when possible.

#### Common Mistakes

- Creating new RegExp per invocation.
- DNS lookups inside email scalar parsing.

---
