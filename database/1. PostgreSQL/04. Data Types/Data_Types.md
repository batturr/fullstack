# Data Types

Choosing the right PostgreSQL data type affects correctness, storage, indexability, and query performance. This module walks numeric, textual, temporal, boolean, binary, JSON, enum, range, geometric, network, UUID, custom, array, OID-related types, and casting rules—each at three depth levels with runnable SQL.

## 📑 Table of Contents

- [1. Numeric Types](#1-numeric-types)
- [2. String Types](#2-string-types)
- [3. Date and Time Types](#3-date-and-time-types)
- [4. Boolean Type](#4-boolean-type)
- [5. Binary Types (BYTEA)](#5-binary-types-bytea)
- [6. JSON and JSONB Types](#6-json-and-jsonb-types)
- [7. Enumerated Types (ENUM)](#7-enumerated-types-enum)
- [8. Range Types](#8-range-types)
- [9. Geometric Types](#9-geometric-types)
- [10. Network Address Types](#10-network-address-types)
- [11. UUID Type](#11-uuid-type)
- [12. Custom Types](#12-custom-types)
- [13. Array Types](#13-array-types)
- [14. Object Identifier Types](#14-object-identifier-types)
- [15. Type Casting and Conversion](#15-type-casting-and-conversion)

---

## 1. Numeric Types

### Beginner

Common integers:

- `smallint` (16-bit)
- `integer` / `int` (32-bit)
- `bigint` (64-bit)

Exact decimals: `numeric(precision, scale)` (also called `decimal`).

Floating point: `real` (32-bit), `double precision` (64-bit).

```sql
CREATE TABLE nums (
  id     bigserial PRIMARY KEY,
  qty    integer NOT NULL CHECK (qty >= 0),
  price  numeric(10,2) NOT NULL,
  approx double precision
);

INSERT INTO nums (qty, price, approx) VALUES (3, 19.99, 19.99);
SELECT qty * price AS line_total FROM nums;
```

### Intermediate

Prefer `numeric` for money-like values when exactness matters; floats are fine for scientific approximations.

Overflow behavior: integers error on overflow; `numeric` has large precision limits but is slower than integers.

```sql
SELECT pg_typeof(1 + 1) AS t_int;
SELECT pg_typeof(1::numeric + 1::numeric) AS t_num;
```

### Expert

`serial` types are shorthand for `integer`/`bigint` columns backed by sequences. For distributed IDs, many teams use `bigint` or `uuid` instead.

Consider `numeric` scale/precision in check constraints; domain types can centralize validation (later section).

```sql
CREATE SEQUENCE nums_id_seq;
CREATE TABLE alt_nums (
  id bigint PRIMARY KEY DEFAULT nextval('nums_id_seq')
);
ALTER SEQUENCE nums_id_seq OWNED BY alt_nums.id;
```

### Key Points

- Integers are fast and exact within their ranges; `numeric` is exact at a cost.
- Floats can surprise with rounding—never use `real` for ledger balances without strong justification.

### Best Practices

- Use `bigint` for high-volume surrogate keys when `int` may exhaust.
- Store currency as `numeric` with explicit scale; document currency code separately.

### Common Mistakes

- Using `double precision` for money, then fighting penny drift.

---

## 2. String Types

### Beginner

- `char(n)` / `character(n)` pads with spaces to length `n` (often surprising).
- `varchar(n)` / `character varying(n)` limits length, no padding.
- `text` is unlimited-length—simple and common in Postgres (no performance penalty vs `varchar` in typical cases).

```sql
CREATE TABLE strings_demo (
  code   char(3),            -- padded
  name   varchar(100) NOT NULL,
  notes  text
);

INSERT INTO strings_demo VALUES ('ab', 'Ada', 'pioneer');
SELECT code, length(code), octet_length(code::bytea) FROM strings_demo;
```

### Intermediate

**Collation** affects sort/compare:

```sql
SHOW lc_collate;
SELECT 'ä' < 'z' COLLATE "C" AS c_binary, 'ä' < 'z' COLLATE "en_US.utf8" AS en_locale;
```

Encoding is per-database; clients must send compatible encodings (usually UTF8).

`bytea` holds binary strings—distinct from textual strings.

### Expert

Full-text search and pattern ops are influenced by collations and indexes—test edge cases for international product names.

```sql
CREATE COLLATION case_insensitive (provider = icu, locale = 'und-u-ks-level2', deterministic = false);
-- availability depends on build options; verify on your cluster
```

### Key Points

- Prefer `text` unless you have a hard length requirement.
- `char(n)` padding causes subtle bugs in comparisons.

### Best Practices

- Apply `CHECK (length(col) <= N)` or `varchar(N)` when the domain demands limits.

### Common Mistakes

- Assuming `char(n)` trims automatically on read—it does not.

---

## 3. Date and Time Types

### Beginner

- `date`: calendar date
- `time` / `time with time zone`: time-of-day
- `timestamp without time zone`: “wall clock” without zone context—risky for distributed systems
- `timestamptz` (`timestamp with time zone`): stores UTC internally, displays in session zone

```sql
CREATE TABLE events (
  id    bigserial PRIMARY KEY,
  ts    timestamptz NOT NULL DEFAULT now(),
  day   date GENERATED ALWAYS AS ((ts AT TIME ZONE 'UTC')::date) STORED
);

INSERT INTO events (ts) VALUES ('2026-03-29 12:00:00+00');
TABLE events;
```

### Intermediate

Intervals:

```sql
SELECT now() + interval '1 day' AS tomorrow;
SELECT interval '1 hour 30 minutes' AS span;
```

Time zone settings:

```sql
SHOW TimeZone;
SET TimeZone = 'America/Los_Angeles';
SELECT now();
```

### Expert

Ambiguous local times during DST transitions require careful handling—store `timestamptz` at ingestion boundaries, convert for display.

```sql
SELECT extract(epoch from timestamptz '2026-03-29 00:00:00+00') AS epoch_utc;
```

### Key Points

- Prefer `timestamptz` for event times; avoid `timestamp` unless you truly mean “floating local wall clock.”

### Best Practices

- Store UTC-ish instants; render with locale libraries in apps.

### Common Mistakes

- Inserting local times into `timestamp` without documenting implied zone.

---

## 4. Boolean Type

### Beginner

`boolean` accepts `true`, `false`, `NULL`.

```sql
CREATE TABLE flags (id int PRIMARY KEY, active boolean NOT NULL DEFAULT false);
INSERT INTO flags VALUES (1, true);
SELECT * FROM flags WHERE active;
```

### Intermediate

Casting from strings:

```sql
SELECT bool('t'), bool('false'), bool('off'); -- may error on invalid
```

Boolean logic uses three-valued logic with `NULL`.

### Expert

Store enums as `boolean` only for true binary predicates; otherwise `text` check constraints or real enums reduce ambiguity.

```sql
SELECT true AND NULL AS t_and_null, false OR NULL AS f_or_null;
```

### Key Points

- `NULL` is neither true nor false—filter explicitly.

### Best Practices

- Default booleans intentionally; document meaning of `NULL` if allowed.

### Common Mistakes

- Using `boolean` for tri-state logic without `NULL` discipline.

---

## 5. Binary Types (BYTEA)

### Beginner

`bytea` stores binary data. Literals use hex or escape formats in SQL.

```sql
CREATE TABLE blobs (id int PRIMARY KEY, data bytea NOT NULL);
INSERT INTO blobs VALUES (1, decode('DEADBEEF', 'hex'));
SELECT encode(data, 'hex') FROM blobs;
```

### Intermediate

Comparison uses binary ordering—be mindful of size and indexing costs.

### Expert

Large blobs may be better on object storage; store pointers in Postgres unless transactional blob access is required.

```sql
SELECT octet_length(data) FROM blobs;
```

### Key Points

- `bytea` can bloat tables—consider TOAST behavior and vacuum implications.

### Best Practices

- Never log raw `bytea` at high volume in application logs.

### Common Mistakes

- Accidentally double-encoding binary as text.

---

## 6. JSON and JSONB Types

### Beginner

- `json` stores textual JSON (preserves whitespace/key order on input).
- `jsonb` stores a binary decomposition—faster to query, slower to insert sometimes.

```sql
CREATE TABLE docs (id serial PRIMARY KEY, body jsonb NOT NULL);
INSERT INTO docs (body) VALUES ('{"a":1,"b":"x"}');
SELECT body->'a' AS a_json, body->>'b' AS b_text FROM docs;
```

### Intermediate

Containment:

```sql
SELECT * FROM docs WHERE body @> '{"a":1}';
```

### Expert

Index with GIN:

```sql
CREATE INDEX docs_body_gin ON docs USING gin (body jsonb_path_ops);
```

### Key Points

- Prefer `jsonb` for most workloads needing operators and indexes.

### Best Practices

- Add `CHECK (jsonb_typeof(body) = 'object')` when appropriate.

### Common Mistakes

- Expecting JSON numbers to map cleanly to SQL `numeric` without explicit casts.

---

## 7. Enumerated Types (ENUM)

### Beginner

Enums are static labels with ordering.

```sql
CREATE TYPE order_status AS ENUM ('new', 'paid', 'shipped', 'closed');

CREATE TABLE orders (
  id bigserial PRIMARY KEY,
  status order_status NOT NULL DEFAULT 'new'
);

INSERT INTO orders (status) VALUES ('paid');
```

### Intermediate

Comparisons use declaration order:

```sql
SELECT 'shipped'::order_status > 'paid'::order_status AS shipped_after_paid;
```

### Expert

Adding values uses `ALTER TYPE ... ADD VALUE`—plan migrations carefully on large enums in busy systems.

```sql
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'returned' AFTER 'shipped';
```

### Key Points

- Enums are hard to remove values from—treat as long-lived contracts.

### Best Practices

- For highly dynamic labels, use lookup tables instead.

### Common Mistakes

- Creating dozens of one-off enums without namespace discipline.

---

## 8. Range Types

### Beginner

Ranges represent intervals with inclusive/exclusive bounds.

```sql
CREATE TABLE shifts (
  id serial PRIMARY KEY,
  during tstzrange NOT NULL
);

INSERT INTO shifts VALUES (1, tstzrange('[2026-03-29 09:00+00, 2026-03-29 17:00+00)'));
SELECT * FROM shifts WHERE during @> '2026-03-29 12:00:00+00'::timestamptz;
```

### Intermediate

Overlap operator `&&`:

```sql
SELECT tstzrange('[2026-03-29 09:00+00,2026-03-29 12:00+00)') &&
       tstzrange('[2026-03-29 11:00+00,2026-03-29 13:00+00)') AS overlaps;
```

### Expert

Exclusion constraints prevent overlaps per key (scheduling):

```sql
CREATE TABLE room_booking (
  room_id int NOT NULL,
  during tstzrange NOT NULL,
  EXCLUDE USING gist (room_id WITH =, during WITH &&)
);
```

### Key Points

- Ranges pair well with GiST indexes for containment/overlap queries.

### Best Practices

- Prefer half-open bounds `[)` to avoid endpoint duplicates.

### Common Mistakes

- Mixing `timestamp` and `timestamptz` ranges without time zone clarity.

---

## 9. Geometric Types

### Beginner

Built-in types include `point`, `line`, `lseg`, `box`, `path`, `polygon`, `circle`.

```sql
SELECT point(1,2) AS p;
SELECT circle(point(0,0), 5) AS c;
```

### Intermediate

Operators compute distance, containment, intersection—useful for simple 2D math, not a replacement for PostGIS for geodesy.

```sql
SELECT point(0,0) <-> point(3,4) AS dist;
```

### Expert

For earth distances and SRIDs, install **PostGIS**—built-in geometry is Cartesian.

### Key Points

- Great for teaching and lightweight geometry; GIS needs PostGIS.

### Best Practices

- Document units—geometry types are unitless.

### Common Mistakes

- Confusing `box` semantics vs axis-aligned expectations without reading docs.

---

## 10. Network Address Types

### Beginner

- `inet` holds host + optional netmask
- `cidr` network specifications
- `macaddr` / `macaddr8` hardware addresses

```sql
CREATE TABLE nets (id serial PRIMARY KEY, addr inet);
INSERT INTO nets (addr) VALUES ('192.0.2.10'), ('2001:db8::1');
SELECT * FROM nets WHERE addr << '192.0.2.0/24'::cidr;
```

### Intermediate

Text casts parse common string formats; invalid input errors early.

### Expert

Store client IPs from proxies carefully—authenticate the proxy chain before trusting `inet` columns.

```sql
SELECT host(addr), masklen(addr) FROM nets;
```

### Key Points

- Network types enable concise containment queries.

### Best Practices

- Use `inet` for IPs; avoid `text` unless you have unusual parsing needs.

### Common Mistakes

- Storing IPs as `text` and attempting substring searches.

---

## 11. UUID Type

### Beginner

`uuid` type stores 128-bit identifiers.

```sql
CREATE TABLE u (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text);
INSERT INTO u (name) VALUES ('Ada');
TABLE u;
```

### Intermediate

`uuid-ossp` extension (if available) provides alternative generators:

```sql
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- SELECT uuid_generate_v4();
```

### Expert

UUIDs as PKs reduce insertion hotspot contention vs sequential integers but widen indexes—measure insert and index size trade-offs.

```sql
SELECT gen_random_uuid() AS sample_uuid; -- compare with uuidv7 strategies in newer generators when applicable
```

### Key Points

- Random UUID v4 increases index page splits—still often fine at moderate scale.

### Best Practices

- Prefer `gen_random_uuid()` when available over bespoke text IDs.

### Common Mistakes

- Storing UUIDs as `text` without enforcing format.

---

## 12. Custom Types

### Beginner

**Composite types** group fields:

```sql
CREATE TYPE address AS (
  street text,
  city text,
  zip text
);

CREATE TABLE office (id serial PRIMARY KEY, loc address);
INSERT INTO office (loc) VALUES (ROW('1 Main St', 'NYC', '10001'));
SELECT (loc).city FROM office;
```

### Intermediate

**Domains** add constraints to base types:

```sql
CREATE DOMAIN us_zip AS text
  CHECK (VALUE ~ '^\d{5}(-\d{4})?$');

CREATE TABLE mailing (zip us_zip);
INSERT INTO mailing VALUES ('94107');
```

### Expert

C extensions can define base types—outside typical SQL-only workflows.

### Key Points

- Domains are excellent for reusable validation.

### Best Practices

- Name domains clearly (`email_address`, `money_usd`).

### Common Mistakes

- Using composites where normalized tables would simplify constraints.

---

## 13. Array Types

### Beginner

Arrays are first-class with rich operators.

```sql
CREATE TABLE tags (id serial PRIMARY KEY, items text[] NOT NULL);
INSERT INTO tags (items) VALUES (ARRAY['sql','postgres']);
SELECT * FROM tags WHERE 'sql' = ANY (items);
```

### Intermediate

Slicing and dimensions:

```sql
SELECT ARRAY[1,2,3][1:2] AS slice;
```

### Expert

GIN indexes accelerate containment:

```sql
CREATE INDEX tags_items_gin ON tags USING gin (items);
```

### Key Points

- Arrays are powerful but can complicate ORM mapping.

### Best Practices

- Prefer junction tables for many-to-many relationships unless arrays truly fit access patterns.

### Common Mistakes

- Storing ordered lists without considering duplicate semantics.

---

## 14. Object Identifier Types

### Beginner

**OID** historically identified rows in system catalogs—avoid as app PKs.

**Reg types** cast human-readable names to OIDs in queries:

```sql
SELECT 'pg_class'::regclass AS oid_value;
SELECT typname FROM pg_type WHERE oid = 'integer'::regtype;
```

### Intermediate

`regprocedure`/`regoperator` help introspect functions and operators.

### Expert

Dynamic SQL generation uses regclass casts carefully—beware injection if concatenating untrusted strings (prefer identifiers via format `%I` in PL/pgSQL).

```sql
SELECT to_regclass('public.orders');
```

### Key Points

- Reg casts are ergonomic for meta-programming in admin scripts.

### Best Practices

- Use `to_regclass` to avoid exceptions on missing names.

### Common Mistakes

- Feeding user-controlled strings into reg casts without validation.

---

## 15. Type Casting and Conversion

### Beginner

Cast syntax:

```sql
SELECT CAST('42' AS integer) AS i1, '42'::integer AS i2;
```

### Intermediate

Implicit casts happen in many expressions—watch for surprises:

```sql
SELECT 1 + 1.5 AS mixed; -- promotes to numeric/float per rules
```

### Expert

`to_timestamp`, `to_date`, `to_number` parse strings with formats:

```sql
SELECT to_timestamp('20260329 14:30', 'YYYYMMDD HH24:MI');
```

### Key Points

- Prefer explicit casts in migrations for clarity.

### Best Practices

- Centralize parsing in SQL functions when formats repeat.

### Common Mistakes

- Relying on locale-dependent date parsing without a format mask.

---

## Appendix A — Numeric Overflow Experiments (Safe)

### Beginner

```sql
SELECT 2147483647::int + 1::int; -- errors
```

### Intermediate

```sql
SELECT 2147483647::bigint + 1::bigint; -- ok
```

### Expert

Understand `numeric` overflow vs error:

```sql
SELECT power(10::numeric, 131071); -- may error at extremes
```

### Key Points

- Choose types wide enough for theoretical maxima.

### Best Practices

- Add `CHECK` constraints for business limits regardless of type width.

### Common Mistakes

- Casting floats to ints silently truncating.

---

## Appendix B — Text vs VARCHAR Decision Records

### Beginner

If unsure, choose `text`.

### Intermediate

Add `CHECK (char_length(col) <= n)` when you want a soft limit without migration pain on increases.

### Expert

Measure storage with `pg_column_size` on representative rows.

```sql
SELECT pg_column_size('hello world'::text) AS bytes_text;
```

### Key Points

- Schema flexibility often beats premature length caps.

### Best Practices

- Document maximum lengths implied by UI validation.

### Common Mistakes

- Using `varchar(255)` by reflex.

---

## Appendix C — Time Zone Gotchas Workshop

### Beginner

```sql
SET TimeZone = 'UTC';
SELECT timestamptz '2026-03-29 00:00:00+02' AS instant_utc_view;
```

### Intermediate

```sql
SELECT now() AT TIME ZONE 'UTC' AS local_wall_clock_looks_like_timestamp;
```

### Expert

Test DST boundaries for your business regions.

### Key Points

- `AT TIME ZONE` combinations are confusing—experiment in a scratch session.

### Best Practices

- Standardize on IANA zone names, not abbreviations.

### Common Mistakes

- Storing floating timestamps for multi-region SaaS.

---

## Appendix D — JSONB Index Operator Classes

### Beginner

Default `jsonb_ops` supports many operators.

### Intermediate

`jsonb_path_ops` smaller/faster for `@>` containment-heavy workloads with trade-offs.

### Expert

Partial GIN indexes on JSON paths for hot keys.

```sql
CREATE INDEX docs_tenant_id_expr ON docs ((body -> 'tenant_id')) WHERE body ? 'tenant_id';
```

### Key Points

- Index definitions must mirror query predicates.

### Best Practices

- Re-run `EXPLAIN` after index changes.

### Common Mistakes

- Expecting `->>` indexed scans without expression indexes.

---

## Appendix E — Enum Migration Patterns

### Beginner

New values at end of enum are simpler.

### Intermediate

Renaming values may require recreate patterns—plan downtime or use lookup tables.

### Expert

Some teams avoid enums entirely for high-churn vocabularies.

### Key Points

- Enum changes are operational events.

### Best Practices

- Script enum migrations with existence checks.

### Common Mistakes

- Adding values inside transactions incorrectly on older versions—read version-specific notes.

---

## Appendix F — Range Bounds Reference

### Beginner

`[)` inclusive start, exclusive end is a common idiom.

### Intermediate

Empty ranges exist—test behavior.

### Expert

Use multiranges (`datemultirange`, etc.) on supported versions for unions of intervals.

### Key Points

- Bound inclusivity must match business language (“through end of day”).

### Best Practices

- Store UTC `tstzrange` for global scheduling.

### Common Mistakes

- Off-by-one-day errors with exclusive end dates.

---

## Appendix G — Geometry Quick Reference

### Beginner

```sql
SELECT box(point(0,0), point(2,2));
```

### Intermediate

```sql
SELECT area(polygon(path '((0,0),(2,0),(2,2),(0,2))'));
```

### Expert

For production GIS, skip builtins—use PostGIS.

### Key Points

- Operators are plentiful—consult docs for matrices of support.

### Best Practices

- Unit test geometric predicates with known examples.

### Common Mistakes

- Using polygon for lat/long without projection awareness.

---

## Appendix H — Network Types and Logs

### Beginner

Parse IPs from text carefully—validate before insert.

### Intermediate

```sql
SELECT inet_same_family('192.0.2.1'::inet, '2001:db8::1'::inet);
```

### Expert

For geolocation, join IP intelligence tables by range—still often easier with `inet`/`cidr`.

### Key Points

- IPs are not integers—use proper types.

### Best Practices

- Store both `inet` and raw text only if auditing original headers.

### Common Mistakes

- Forgetting IPv6 normalization issues in app layers.

---

## Appendix I — UUID + btree Index Notes

### Beginner

UUID PK indexes are wider than `bigint`.

### Intermediate

Clustering on insertion order differs between random UUIDs and sequences.

### Expert

Some teams use UUIDv7 (time-sortable) strategies—verify generator support and driver compatibility.

### Key Points

- Measure index bloat and autovacuum impact under churn.

### Best Practices

- Fillfactor tuning on heavily updated UUID indexes is a lever—use carefully.

### Common Mistakes

- Assuming UUID removes all contention magically.

---

## Appendix J — Composite vs Table Normalization

### Beginner

Composites shine for embedded value objects.

### Intermediate

Normalization splits composites when you need foreign keys to subparts.

### Expert

Composite equality uses field-wise rules—know how NULL fields behave.

```sql
SELECT ROW(1,NULL)::composite_type = ROW(1,NULL)::composite_type;
```

### Key Points

- Prefer tables when subentities evolve independently.

### Best Practices

- Document composite immutability expectations.

### Common Mistakes

- Embedding composites in many columns, complicating migrations.

---

## Appendix K — Array Anti-Patterns

### Beginner

Arrays are not a substitute for foreign keys to reference many rows.

### Intermediate

Updating one element requires rewriting the array value.

### Expert

GIN indexes help read patterns; write-heavy arrays can be painful.

### Key Points

- Normalize unless read pattern is overwhelmingly “fetch row + tags.”

### Best Practices

- Keep arrays small and bounded.

### Common Mistakes

- Unbounded array growth in hot rows.

---

## Appendix L — Regclass Safety Snippets

### Beginner

```sql
SELECT to_regclass('public.orders');
```

### Intermediate

```sql
SELECT c.relname FROM pg_class c WHERE oid = to_regclass('public.orders');
```

### Expert

Use `format('%I', tablename)` in dynamic SQL—never string-concat unescaped identifiers from users.

### Key Points

- Metadata scripts are still security-sensitive.

### Best Practices

- Prefer whitelists for dynamic object names.

### Common Mistakes

- SQL injection via `"'; DROP TABLE orders; --"` style names.

---

## Appendix M — Casting Table for Common Literals

### Beginner

```sql
SELECT timestamp '2026-03-29 12:00:00', date '2026-03-29';
```

### Intermediate

```sql
SELECT numeric '19.99', real '19.99', double precision '19.99';
```

### Expert

```sql
SELECT jsonb '{"x":1}', json '{"x":1}';
```

### Key Points

- Typed literals reduce casting noise.

### Best Practices

- Use typed literals in migrations for clarity.

### Common Mistakes

- Ambiguous date formats without ISO-8601 discipline.

---

## Appendix N — BYTEA and Encoding

### Beginner

Hex insert:

```sql
SELECT decode('aa', 'hex');
```

### Intermediate

Escape format is error-prone—prefer hex or parameterized queries from apps.

### Expert

Track `bytea_output` setting impact on client display.

```sql
SHOW bytea_output;
```

### Key Points

- Drivers handle binary best—avoid constructing bytea literals manually at scale.

### Best Practices

- Use prepared statements for blob inserts.

### Common Mistakes

- Logging bytea columns in plaintext debug logs.

---

## Appendix O — Boolean Indexing Notes

### Beginner

Low-cardinality boolean indexes are often useless alone.

### Intermediate

Partial indexes help:

```sql
CREATE INDEX users_active_id_idx ON users (id) WHERE active;
```

### Expert

Combine booleans with selective predicates in partial index definitions.

### Key Points

- Selectivity drives index usefulness.

### Best Practices

- Measure with `EXPLAIN` whether boolean filters are selective.

### Common Mistakes

- Indexing `WHERE is_deleted` without considering query volume.

---

## Appendix P — JSON Schema-ish Constraints

### Beginner

```sql
ALTER TABLE docs ADD CONSTRAINT body_is_object
  CHECK (jsonb_typeof(body) = 'object');
```

### Intermediate

```sql
ALTER TABLE docs ADD CONSTRAINT body_has_keys
  CHECK (body ? 'id' AND body ? 'type');
```

### Expert

Consider `jsonschema` validation in app + minimal DB checks, or extension-based validation if adopted.

### Key Points

- DB constraints should enforce invariants, not duplicate entire JSON Schema specs unless intended.

### Best Practices

- Version JSON documents if schema evolves (`body->>'version'`).

### Common Mistakes

- Over-constraining JSON in DB while app still mutates schema weekly.

---

## Appendix Q — Interval Formatting

### Beginner

```sql
SELECT interval '2 days 3 hours';
```

### Intermediate

```sql
SELECT justify_interval(interval '1 hour - 90 minutes');
```

### Expert

Month/year intervals interact with timestamps—test edge cases.

### Key Points

- Month math is calendar-aware and can surprise.

### Best Practices

- For billing periods, sometimes store period start/end instead of month intervals.

### Common Mistakes

- Adding `interval '1 month'` repeatedly expecting fixed 30-day lengths.

---

## Appendix R — Type Choice Worksheet (Copy for Design Reviews)

### Beginner

Questions: What are min/max magnitudes? Need exactness?

### Intermediate

Questions: Sorting locale? Time zone rules? JSON query operators?

### Expert

Questions: Index type? Replication identity needs? Partition key type?

```sql
-- No SQL here by design—this is a process checklist in a SQL course.
SELECT 'Use this appendix in PR descriptions when adding columns.' AS note;
```

### Key Points

- Type decisions deserve written rationale at scale.

### Best Practices

- Link benchmarks or cardinality estimates when debating UUID vs bigint.

### Common Mistakes

- Cargo-culting types from another product without workload match.

---

## Appendix S — `pg_column_size` Micro-Benchmark Pattern

### Beginner

Measure stored size for representative values:

```sql
SELECT pg_column_size('hello'::text) AS text_bytes;
SELECT pg_column_size('{"a":1}'::jsonb) AS jsonb_bytes;
```

### Intermediate

Compare `json` vs `jsonb` footprints on identical payloads.

### Expert

Correlate average column sizes with table bloat investigations using stats views (later modules).

### Key Points

- Size hints inform TOAST thresholds and wide-row strategies.

### Best Practices

- Sample real rows—synthetic micro strings lie.

### Common Mistakes

- Extrapolating from one-row tests on empty tables.

---

## Appendix T — Typed Tables vs Composites (Conceptual)

### Beginner

A composite type is a labeled tuple shape; a table row can be cast to its composite analog only when structures align—usually prefer explicit tables.

### Intermediate

Composite types can be returned from functions—useful for RPC-like SQL APIs.

### Expert

When generating APIs, composites can reduce column lists but complicate schema evolution.

```sql
CREATE TYPE money_line AS (currency char(3), amount numeric(14,2));
SELECT ROW('USD', 19.99::numeric)::money_line AS line;
```

### Key Points

- Composites excel at API boundaries inside SQL; tables excel at storage normalization.

### Best Practices

- Version composite shapes if exposed across services.

### Common Mistakes

- Shipping composites as stable external contracts without compatibility discipline.

---

## Appendix U — Multirange Types (Version-Dependent)

### Beginner

Multiranges aggregate multiple disjoint intervals—useful for schedules with breaks.

### Intermediate

Verify availability:

```sql
SELECT typname FROM pg_type WHERE typname LIKE '%multirange%' ORDER BY 1 LIMIT 20;
```

### Expert

Migrate from array-of-ranges patterns carefully—operators differ.

### Key Points

- Feature availability varies by major version—guard migrations.

### Best Practices

- Add compatibility branches in migration tools when supporting multiple majors.

### Common Mistakes

- Assuming tutorials apply without checking `server_version_num`.

---

## Appendix V — ICU Collations and Indexing Caveats

### Beginner

Non-deterministic collations may affect index usability for certain operations—read release notes when using ICU providers.

### Intermediate

Test `ORDER BY` with and without indexes when adopting new collations.

### Expert

Operational teams sometimes standardize on `C` collation for identifier columns and localized collation for display-only fields.

### Key Points

- Collation changes are sort-order changes—treat as breaking changes.

### Best Practices

- Snapshot ordering expectations as automated tests when upgrading OS/ICU bundles.

### Common Mistakes

- Mixing collations across joined columns without explicit `COLLATE` clauses and being surprised by plan choices.

---

## Appendix W — `money` Type: Historical Note

### Beginner

Postgres provides a `money` type—many teams avoid it in favor of `numeric` plus currency metadata.

### Intermediate

`money` is locale-sensitive in some behaviors—portability suffers.

### Expert

If you inherit `money`, document rounding and display rules explicitly.

```sql
SELECT '12.34'::money;
```

### Key Points

- Prefer `numeric` for ledgers unless you have a compelling legacy reason.

### Best Practices

- Store currency code (`ISO 4217`) as `char(3)` or a lookup FK.

### Common Mistakes

- Mixing `money` and `numeric` in expressions without explicit casts.

---

**Next module:** `05. Creating Tables and Schemas` for translating types into durable table designs.

