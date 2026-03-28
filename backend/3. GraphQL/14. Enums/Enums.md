# GraphQL Enums

## 📑 Table of Contents

- [14.1 Enum Fundamentals](#141-enum-fundamentals)
  - [14.1.1 Enum Definition](#1411-enum-definition)
  - [14.1.2 Enum Values](#1412-enum-values)
  - [14.1.3 Enum Usage](#1413-enum-usage)
  - [14.1.4 Enum Validation](#1414-enum-validation)
  - [14.1.5 Enum Serialization](#1415-enum-serialization)
- [14.2 Enum Patterns](#142-enum-patterns)
  - [14.2.1 Status Enums](#1421-status-enums)
  - [14.2.2 Role Enums](#1422-role-enums)
  - [14.2.3 Permission Enums](#1423-permission-enums)
  - [14.2.4 Direction Enums](#1424-direction-enums)
  - [14.2.5 Filter Enums](#1425-filter-enums)
- [14.3 Enum Features](#143-enum-features)
  - [14.3.1 Deprecated Enum Values](#1431-deprecated-enum-values)
  - [14.3.2 Enum Descriptions](#1432-enum-descriptions)
  - [14.3.3 Enum Aliases](#1433-enum-aliases)
  - [14.3.4 Enum Serialization Strategies](#1434-enum-serialization-strategies)
  - [14.3.5 Enum Performance](#1435-enum-performance)
- [14.4 Advanced Enum Usage](#144-advanced-enum-usage)
  - [14.4.1 Enum as Argument](#1441-enum-as-argument)
  - [14.4.2 Enum as Return Type](#1442-enum-as-return-type)
  - [14.4.3 Enum Filtering](#1443-enum-filtering)
  - [14.4.4 Enum with Introspection](#1444-enum-with-introspection)
  - [14.4.5 Enum Documentation](#1445-enum-documentation)

---

## 14.1 Enum Fundamentals

### 14.1.1 Enum Definition

#### Beginner

An **enum** is a GraphQL type with a fixed set of allowed **values**. You declare it with `enum Name { VALUE_ONE VALUE_TWO }`. Enums work in both input and output positions.

#### Intermediate

Enum value names use `Name` style (often `SCREAMING_SNAKE_CASE` or `PascalCase` depending on style guides). The schema lists all legal constants; anything else is a validation error.

#### Expert

Enums are not strings in the type system: coercion maps string tokens in the query/variables to internal enum values. Custom scalars are different—enums are structural types in introspection (`__Type.kind` = `ENUM`).

```graphql
enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  CANCELLED
}
```

```javascript
const { buildSchema } = require("graphql");

const schema = buildSchema(`
  enum OrderStatus { PENDING PAID SHIPPED CANCELLED }
  type Order { id: ID! status: OrderStatus! }
`);

const t = schema.getType("OrderStatus");
console.log(t.getValues().map((v) => v.name));
```

#### Key Points

- Enums close the set of legal values at the schema level.
- Stronger than `String` for categorical data.
- Appear in introspection for tooling and codegen.

#### Best Practices

- Name enums by domain concept (`FulfillmentStatus` not `Status`).
- Keep value names stable across mobile and web clients.
- Avoid huge enums (hundreds of values) without pagination elsewhere.

#### Common Mistakes

- Using `String` for statuses and validating only in resolvers.
- Renaming enum values without deprecation (breaking change).

---

### 14.1.2 Enum Values

#### Beginner

Each **enum value** is a name without quotes in SDL (`ACTIVE`). In JSON variables, you still send a string `"ACTIVE"` that must match a defined value.

#### Intermediate

Internal resolvers may map enum values to numbers or strings in your database. `graphql-js` passes the enum name string to resolvers by default unless you customize `value` in enum config.

#### Expert

In `GraphQLEnumType`, each value can specify `value` for the internal representation (for example map `PREMIUM` to `"premium_tier"`). This decodes DB/storage from wire names.

```javascript
const { GraphQLEnumType } = require("graphql");

const TierEnum = new GraphQLEnumType({
  name: "SubscriptionTier",
  values: {
    FREE: { value: "free" },
    PRO: { value: "pro" },
    ENTERPRISE: { value: "ent" },
  },
});
```

```graphql
enum SubscriptionTier {
  FREE
  PRO
  ENTERPRISE
}
```

#### Key Points

- Wire names (what clients send) may differ from internal `value`.
- Helps migrate legacy DB codes without breaking clients.
- Default internal value equals the name if unspecified.

#### Best Practices

- Document meaning of each value in descriptions.
- Avoid values that differ only by case (confusing in some clients).
- Keep internal values stable for ORM mappings.

#### Common Mistakes

- Assuming internal `value` is always uppercase like the SDL name.
- Duplicating the same semantic value under two names.

---

### 14.1.3 Enum Usage

#### Beginner

Enums appear as **field types**, **argument types**, and inside **input** types. Queries request enum fields without quotes; variables use JSON strings.

#### Intermediate

Lists of enums `[Role!]!` work like other lists. Non-null enum (`Role!`) rejects explicit `null` in variables.

#### Expert

Enums cannot contain directives on values in all GraphQL versions—deprecation uses `deprecated` on enum values in modern SDL. Input and output share the same enum type.

```graphql
type User {
  id: ID!
  role: Role!
}

enum Role {
  ADMIN
  MEMBER
}

type Query {
  users(role: Role): [User!]!
}
```

```graphql
query UsersByRole($role: Role) {
  users(role: $role) {
    id
    role
  }
}
```

```json
{ "role": "ADMIN" }
```

#### Key Points

- One enum definition, many usage sites.
- Variables coerce strings to enum values.
- Nullable enum arguments allow “no filter.”

#### Best Practices

- Use enums for any closed set clients should not invent.
- Align enum usage with UI select options.
- Regenerate client types when enums change.

#### Common Mistakes

- Sending numeric codes in variables for GraphQL enums (invalid).
- Using different enum types for the same concept (`UserRole` vs `Role`).

---

### 14.1.4 Enum Validation

#### Beginner

**Validation** rejects unknown enum strings before resolvers run. Typos in queries fail at validation time with a clear error.

#### Intermediate

Variable coercion applies to enums in `variables` JSON. Inline literals in the document are also validated against the schema.

#### Expert

Custom directives cannot easily extend enum validation per value; use union patterns or separate arguments if you need value-dependent argument shapes.

```javascript
const { graphql, buildSchema } = require("graphql");

const schema = buildSchema(`
  enum Color { RED GREEN }
  type Query { favorite: Color }
`);

graphql({
  schema,
  source: `{ favorite @bad }`,
  rootValue: { favorite: "RED" },
}).then((r) => console.log(r.errors));

graphql({
  schema,
  source: `query($c: Color!) { echo(c: $c) }`,
  variableValues: { c: "BLUE" },
}).catch(() => {});
```

#### Key Points

- Invalid enum values never hit resolvers.
- Same rules for input object fields typed as enums.
- Helps security by rejecting unexpected states early.

#### Best Practices

- Test invalid enum values in API contract tests.
- Return helpful messages in higher layers when mapping DB drift.
- Monitor for enum coercion errors (may signal outdated clients).

#### Common Mistakes

- Storing unknown DB codes without migration, then failing at runtime inside resolvers.
- Catching enum validation errors and converting to opaque 500s.

---

### 14.1.5 Enum Serialization

#### Beginner

**Serialization** turns resolver results into JSON response values. Enums serialize as **strings** matching the enum’s defined names on the wire.

#### Intermediate

If resolver returns an internal `value` from `GraphQLEnumType`, GraphQL still serializes to the **public name** the client expects (the key in `values`, not necessarily internal `value`).

#### Expert

For custom JSON serializers or logging, remember responses use enum names; databases might store shorter codes—translate in the repository layer, not ad hoc in every resolver.

```javascript
const resolvers = {
  Order: {
    status(order) {
      // DB might store lowercase
      return order.status_row.toUpperCase();
    },
  },
};
```

```graphql
enum OrderStatus {
  PENDING
  PAID
}
```

#### Key Points

- JSON output uses string enum tokens.
- Internal representation is implementation detail.
- Consistent mapping prevents leaky abstractions.

#### Best Practices

- Centralize DB↔enum mapping in mappers.
- Use TypeScript const enums or unions generated from schema.
- Snapshot HTTP responses in tests for enum casing.

#### Common Mistakes

- Returning raw integers for GraphQL enums in resolvers (may error or mis-serialize depending on server).
- Serializing different casing than schema defines.

---

## 14.2 Enum Patterns

### 14.2.1 Status Enums

#### Beginner

**Status enums** model lifecycles: `DRAFT`, `PUBLISHED`, `ARCHIVED`. They replace magic strings in mutations and make invalid transitions easier to detect in code.

#### Intermediate

Pair with state machines in the service layer. GraphQL validates membership; your domain validates transitions (`ARCHIVED` → `PUBLISHED` might be illegal).

#### Expert

For long-running workflows, consider separating `processingStatus` from `paymentStatus` rather than one mega-enum combinatorial explosion.

```graphql
enum ArticleStatus {
  DRAFT
  IN_REVIEW
  PUBLISHED
  ARCHIVED
}

input PublishArticleInput {
  id: ID!
  targetStatus: ArticleStatus!
}
```

```javascript
const transitions = {
  DRAFT: ["IN_REVIEW"],
  IN_REVIEW: ["DRAFT", "PUBLISHED"],
  PUBLISHED: ["ARCHIVED"],
  ARCHIVED: [],
};

function assertTransition(from, to) {
  if (!transitions[from]?.includes(to)) {
    throw new Error(`Illegal transition ${from} -> ${to}`);
  }
}
```

#### Key Points

- Enums document allowed states explicitly.
- Business rules live beyond schema validation.
- Split orthogonal dimensions into multiple enums.

#### Best Practices

- Document terminal states.
- Use events/audit logs on transitions.
- Index DB columns used for status filters.

#### Common Mistakes

- Encoding multiple dimensions in one enum value (`PAID_SHIPPED`).
- No server-side transition validation.

---

### 14.2.2 Role Enums

#### Beginner

**Role enums** describe user authorization levels: `ADMIN`, `EDITOR`, `VIEWER`. Expose carefully—listing roles is fine; enforcing happens in resolvers.

#### Intermediate

Avoid overloading roles with permissions; prefer a separate `Permission` enum or RBAC tables for fine-grained access, exposing only what the client needs.

#### Expert

GraphQL enums are public API; do not encode secret capability flags. Combine with server-side policy engines (OPA, Casbin) keyed by role resolved from the session, not from client-supplied enums alone.

```graphql
enum OrgRole {
  OWNER
  BILLING_ADMIN
  MEMBER
}

type Membership {
  user: User!
  role: OrgRole!
}
```

#### Key Points

- Roles are categorical and enum-friendly.
- Authz must not trust client-selected roles on sensitive mutations.
- Good for display and filtering org members.

#### Best Practices

- Map roles to permission sets server-side.
- Test each role against the same GraphQL operations.
- Deprecate roles with migration paths.

#### Common Mistakes

- Accepting `role` from anonymous clients on `signUp`.
- Assuming enum exhaustiveness in UI without default handling.

---

### 14.2.3 Permission Enums

#### Beginner

**Permission enums** name atomic capabilities: `READ_INVOICE`, `WRITE_INVOICE`. Some APIs expose them for admin UIs; others keep permissions internal.

#### Intermediate

Lists `[Permission!]` on `type User` can describe effective permissions for the session viewer (not global user object) to avoid leaking other users’ rights.

#### Expert

GraphQL Shield and similar use schema directives; enums complement but do not replace runtime checks. Consider bitmasks in DB, enums on the wire.

```graphql
enum Permission {
  POST_CREATE
  POST_MODERATE
  USER_BAN
}

type ViewerCapabilities {
  permissions: [Permission!]!
}
```

```javascript
function can(viewer, permission) {
  return viewer.permissions.includes(permission);
}
```

#### Key Points

- Fine-grained enums aid auditability.
- Often better as server-derived read models.
- Combine with object-level checks (row ACLs).

#### Best Practices

- Principle of least privilege in default roles.
- Log permission-denied with reason codes.
- Version permissions when splitting/merging capabilities.

#### Common Mistakes

- Huge flat enums without grouping (hard to navigate).
- Client-side only permission checks.

---

### 14.2.4 Direction Enums

#### Beginner

**Direction enums** capture `ASC`/`DESC` or `INCOMING`/`OUTGOING`. They pair with sort or graph edge queries.

#### Intermediate

Use one shared `SortDirection` enum across the schema instead of duplicating `Ascending`/`Descending` names per feature.

#### Expert

For cursor pagination, direction enums must align with encoding/decoding of cursors; reversing direction may require new cursors, not just toggling a flag on the same cursor.

```graphql
enum SortDirection {
  ASC
  DESC
}

input SortInput {
  field: String!
  direction: SortDirection!
}
```

#### Key Points

- Reuse generic enums for consistency.
- Document default direction per query field.
- Tie to indexes for performance.

#### Best Practices

- Default to stable, indexed directions.
- Validate `field` against an allowlist, not free string.
- Test tie-breaker fields with both directions.

#### Common Mistakes

- Different enums `OrderAscDesc` vs `SortDirection` for the same concept.
- Ignoring index direction when sorting DESC.

---

### 14.2.5 Filter Enums

#### Beginner

**Filter enums** constrain queries: `TimeRange: LAST_7_DAYS, LAST_30_DAYS, CUSTOM`. They are clearer than multiple booleans.

#### Intermediate

When `CUSTOM` is selected, additional arguments (`from`, `to`) may be required—validate combinations in resolver or input validators.

#### Expert

Map filter enums to SQL parameter bindings, never to string-concatenated SQL fragments. Whitelist mapping from enum to query builder operations.

```graphql
enum ActivityWindow {
  TODAY
  WEEK
  MONTH
  ALL
}

type Query {
  activity(window: ActivityWindow!): ActivitySummary!
}
```

```javascript
function windowToInterval(window, now = new Date()) {
  const start = new Date(now);
  switch (window) {
    case "TODAY":
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
    case "WEEK":
      start.setDate(start.getDate() - 7);
      return { start, end: now };
    case "MONTH":
      start.setMonth(start.getMonth() - 1);
      return { start, end: now };
    case "ALL":
      return { start: null, end: null };
    default:
      throw new Error("unknown window");
  }
}
```

#### Key Points

- Filter enums simplify client UX.
- Combo validation handles dependent args.
- Server translates to safe queries.

#### Best Practices

- Document timezone for time windows.
- Add `CUSTOM` only if you accept explicit dates.
- Cache hot windows when safe.

#### Common Mistakes

- Ambiguous overlaps (`WEEK` vs last 7×24 hours vs calendar week).
- Missing validation for `CUSTOM` without dates.

---

## 14.3 Enum Features

### 14.3.1 Deprecated Enum Values

#### Beginner

You can mark enum values **deprecated** in SDL so tools show warnings: `OLD_STATUS @deprecated(reason: "Use NEW_STATUS")`.

#### Intermediate

Clients can still send deprecated values until you remove them—plan server-side rejection after telemetry shows zero usage.

#### Expert

Codegen may omit deprecated values from strict unions or mark them optional. Combine deprecation with runtime mapping from old DB rows to new enums during migration.

```graphql
enum PaymentProvider {
  STRIPE
  PAYPAL
  LEGACY_WALLET @deprecated(reason: "Wallet sunset 2026-06-01; use STRIPE")
}
```

#### Key Points

- Deprecation communicates intent without immediate breakage.
- Track usage via logs and client versions.
- Removal is a breaking schema change.

#### Best Practices

- Give actionable reasons and dates.
- Mirror deprecation in REST if dual exposure exists.
- Alert owners of operations still referencing deprecated values.

#### Common Mistakes

- Deprecating without migration path.
- Removing values in the same release as deprecation.

---

### 14.3.2 Enum Descriptions

#### Beginner

SDL **descriptions** document enums for humans and tools: preceding string `"""Lifecycle state"""` before `enum`.

#### Intermediate

GraphiQL and Apollo Studio render descriptions. Per-value descriptions are supported in SDL with string literals before each value in many parsers.

#### Expert

Descriptions do not affect validation—they are not a substitute for authorization. Internationalization of descriptions is uncommon; product docs may localize separately.

```graphql
"""Whether a seat is available for booking."""
enum SeatState {
  """Held temporarily during checkout."""
  HELD
  """Purchased and confirmed."""
  CONFIRMED
  OPEN
}
```

#### Key Points

- Descriptions improve discoverability.
- Value-level docs clarify subtle differences.
- Appear in introspection `description` fields.

#### Best Practices

- Explain side effects (`CANCELLED` triggers refund).
- Mention related mutations.
- Keep descriptions concise for mobile Studio UIs.

#### Common Mistakes

- Empty descriptions on large enums.
- Contradictory descriptions vs actual resolver behavior.

---

### 14.3.3 Enum Aliases

#### Beginner

GraphQL has **no alias** for enum values themselves (unlike field aliases in queries). “Alias” here means **mapping** legacy codes to schema values via internal `value`.

#### Intermediate

Clients cannot rename `OLD` to `NEW` without schema support; server can accept both temporarily by using two values or mapping at the gateway.

#### Expert

For incremental renames, ship both enum values, deprecate old, translate DB reads to new, and reject old on writes after cutoff.

```javascript
new GraphQLEnumType({
  name: "Locale",
  values: {
    EN_US: { value: "en-US" },
    EN_GB: { value: "en-GB" },
  },
});
```

#### Key Points

- Wire names stay stable for public API.
- Internal `value` aliases storage formats.
- True enum aliases require duplicate values or gateway transforms.

#### Best Practices

- Prefer one canonical wire name per concept.
- Use migration scripts for DB value changes.
- Document mapping tables for support teams.

#### Common Mistakes

- Changing wire names thinking it is non-breaking.
- Internal values that are not JSON-serializable (objects) unnecessarily.

---

### 14.3.4 Enum Serialization Strategies

#### Beginner

**Strategies** include: store as string in DB matching enum name; store as short code mapped in resolver layer; store as integer mapped with a lookup table.

#### Intermediate

ORMs like Prisma can map enums to native DB enums—ensure GraphQL enum and DB enum evolve together with migrations.

#### Expert

For multi-tenant custom statuses, you may expose `String` or a dynamic schema—GraphQL enums are static. Consider metadata-driven status lists separate from schema enums.

```javascript
const dbToGraphQL = {
  pend: "PENDING",
  paid: "PAID",
};

function toGraphQLOrderStatus(row) {
  const g = dbToGraphQL[row.status_code];
  if (!g) throw new Error(`Unknown status_code ${row.status_code}`);
  return g;
}
```

#### Key Points

- Choose storage format for migration and reporting needs.
- Centralize mapping functions.
- Static SDL enums vs dynamic tenant config is a product trade-off.

#### Best Practices

- Avoid storing display labels instead of codes.
- Keep lowercase in DB, uppercase on wire if that is your convention—just be consistent.
- Backfill before tightening enum sets.

#### Common Mistakes

- Case-sensitive mismatches between DB and schema.
- Editing DB enums manually without migration.

---

### 14.3.5 Enum Performance

#### Beginner

Enums are **cheap** at runtime: validation is a hash lookup. Compared to arbitrary strings, they can slightly reduce payload ambiguity.

#### Intermediate

Large enums increase schema size and introspection payload; avoid thousands of values in a single enum—paginate catalog data as objects instead.

#### Expert

DB indexes on enum-like string columns speed filters. When exposing `filter: Status`, ensure corresponding composite indexes exist for common query patterns.

```graphql
type Query {
  orders(status: OrderStatus, first: Int): OrderConnection!
}
```

```sql
CREATE INDEX orders_status_created_at ON orders (status, created_at DESC);
```

#### Key Points

- Enums are not a performance bottleneck per se.
- Query performance depends on DB indexing, not GraphQL enums alone.
- Huge enums hurt tooling more than CPU.

#### Best Practices

- Index filtered columns.
- Explain-analyze slow operations with enum filters.
- Cache introspection in production gateways if needed.

#### Common Mistakes

- Using enums for unbounded vendor SKU lists.
- Missing DB indexes on highly selective enum filters.

---

## 14.4 Advanced Enum Usage

### 14.4.1 Enum as Argument

#### Beginner

**Arguments** typed as enums constrain operations: `sort(direction: SortDirection!)`. Variables pass JSON strings matching enum names.

#### Intermediate

Optional enum args often mean “default behavior” when omitted—document defaults; optionally set SDL default `= ASC`.

#### Expert

For polymorphic args, enums pair with `oneOf` patterns (experimental in some ecosystems) or separate fields—GraphQL core uses explicit separate args or input objects.

```graphql
type Query {
  leaderboard(period: LeaderboardPeriod! = THIS_WEEK): [User!]!
}

enum LeaderboardPeriod {
  THIS_WEEK
  THIS_MONTH
  ALL_TIME
}
```

#### Key Points

- Enum args are self-documenting.
- Defaults reduce client boilerplate.
- Great for toggles with >2 states beyond boolean.

#### Best Practices

- Use enums over booleans when future values are likely (`DRAFT` vs `PUBLISHED` vs `SCHEDULED`).
- Validate combo args (`CUSTOM` + dates).
- Keep argument names (`period`, `window`) domain-clear.

#### Common Mistakes

- Boolean explosion (`isWeek`, `isMonth`) instead of one enum.
- No default documented for optional enum args.

---

### 14.4.2 Enum as Return Type

#### Beginner

Fields can **return** enums directly: `user.accountTier: SubscriptionTier!`. Clients render labels via client-side maps or i18n tables.

#### Intermediate

Consider a parallel `displayName` field only if enums need localization from server; otherwise clients map `PRO` → “Pro plan.”

#### Expert

If enums must be hidden (feature flags), return them only for authorized viewers or replace with generic categories at lower tiers.

```graphql
type Subscription {
  id: ID!
  tier: SubscriptionTier!
  renews: Boolean!
}
```

```javascript
const tierLabels = {
  FREE: "Free",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};
```

#### Key Points

- Enum return types are compact JSON.
- Pair with metadata queries if clients need labels from server.
- Authorization still applies to parent objects.

#### Best Practices

- Do not put secrets in enum values.
- Version enum additions for mobile apps that switch on raw values.
- Test GraphQL responses for new values (forward compatibility).

#### Common Mistakes

- Client `switch` without `default` breaks on new enum values.
- Using enums for free-form user-generated tags.

---

### 14.4.3 Enum Filtering

#### Beginner

Pass enums into **filter inputs** to narrow lists: `posts(filter: { status: PUBLISHED })`. Combine multiple enums for richer filters.

#### Intermediate

For “any of these statuses,” use `[OrderStatus!]` input fields. For exclusions, pair with `notIn: [OrderStatus!]` patterns.

#### Expert

Translate enum filters to SQL `IN` clauses with parameterized queries. Avoid dynamic enum string concatenation into SQL.

```graphql
input OrderFilter {
  statuses: [OrderStatus!]
  paymentProvider: PaymentProvider
}
```

```javascript
function buildWhere(filter) {
  const where = {};
  if (filter.statuses?.length) {
    where.status = { in: filter.statuses };
  }
  if (filter.paymentProvider) {
    where.provider = filter.paymentProvider;
  }
  return where;
}
```

#### Key Points

- Enum filters are type-safe and concise.
- List enums model OR semantics clearly.
- Map cleanly to query builders.

#### Best Practices

- Document empty list vs null (`null` = no filter, `[]` might mean none—define explicitly).
- Index composite filters.
- Limit list length.

#### Common Mistakes

- Ambiguous meaning of empty `statuses` array.
- No validation on impossible combinations.

---

### 14.4.4 Enum with Introspection

#### Beginner

**Introspection** queries fetch enum definitions: `__type(name: "Role") { enumValues { name description } }`. Tools use this to build explorers and codegen.

#### Intermediate

Disable introspection in hardened production if policy requires—know that many GraphQL clients still expect it in dev/staging.

#### Expert

Codegen tools (GraphQL Code Generator) emit TS unions from enums. CI can diff introspection results to detect accidental enum removals.

```graphql
query EnumMeta {
  __type(name: "OrderStatus") {
    name
    kind
    enumValues {
      name
      description
      isDeprecated
      deprecationReason
    }
  }
}
```

```javascript
// fetch schema and build enum allowlist for a CMS dynamic form
async function loadEnumOptions(enumsClient) {
  const data = await enumsClient.request(`query { __type(name:"Color"){ enumValues { name } } }`);
  return data.__type.enumValues.map((v) => v.name);
}
```

#### Key Points

- Introspection powers dynamic UIs.
- Deprecated values still visible unless filtered by tool.
- Protect introspection in prod when needed.

#### Best Practices

- Use schema registry for canonical history, not only prod introspection.
- Snapshot tests for breaking enum removals.
- Document enums for external integrators.

#### Common Mistakes

- Relying on introspection in browser against locked-down prod.
- Assuming enum order from introspection is guaranteed meaningful.

---

### 14.4.5 Enum Documentation

#### Beginner

**Documentation** includes SDL descriptions, style guide rules (naming, when to use enums), and external developer portal pages with examples.

#### Intermediate

Provide **migration guides** when adding values (clients should use `default` branches) or deprecating values (timeline, replacement).

#### Expert

For public APIs, publish JSON Schema or GraphQL SDL fragments showing enums alongside REST equivalents if applicable. Link enum values to SLA or billing docs when relevant (`ENTERPRISE`).

```markdown
## OrderStatus

| Value     | Meaning                          | Next states        |
| --------- | -------------------------------- | ------------------ |
| PENDING   | Created, payment may be required | PAID, CANCELLED    |
| PAID      | Payment captured                 | SHIPPED, CANCELLED |
| SHIPPED   | Fulfilled                        | —                  |
| CANCELLED | Terminal                         | —                  |
```

#### Key Points

- Docs reduce misuse and support tickets.
- Tables clarify transitions better than prose alone.
- Align SDL descriptions with long-form docs.

#### Best Practices

- Give examples in GraphQL operations, not only tables.
- Note timezone/locale interactions for time-related enums.
- Changelog enum sections clearly.

#### Common Mistakes

- Docs drift from schema after fast releases.
- Undocumented server-only enum values leaking via errors.

---
