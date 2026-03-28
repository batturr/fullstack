# Types and Fields

## 📑 Table of Contents

- [4.1 Object Types](#41-object-types)
  - [4.1.1 Defining Object Types](#411-defining-object-types)
  - [4.1.2 Fields in Objects](#412-fields-in-objects)
  - [4.1.3 Nested Objects](#413-nested-objects)
  - [4.1.4 Object Composition](#414-object-composition)
  - [4.1.5 Object Inheritance (Interfaces)](#415-object-inheritance-interfaces)
- [4.2 Scalar Types](#42-scalar-types)
  - [4.2.1 Built-in Scalars (Int, Float, String, Boolean, ID)](#421-built-in-scalars-int-float-string-boolean-id)
  - [4.2.2 Scalar Type Usage](#422-scalar-type-usage)
  - [4.2.3 Type Coercion](#423-type-coercion)
  - [4.2.4 Custom Scalars](#424-custom-scalars)
  - [4.2.5 Scalar Serialization](#425-scalar-serialization)
- [4.3 List Types](#43-list-types)
  - [4.3.1 List Declaration](#431-list-declaration)
  - [4.3.2 Nullable and Non-Nullable Lists](#432-nullable-and-non-nullable-lists)
  - [4.3.3 Nested Lists](#433-nested-lists)
  - [4.3.4 List Operations](#434-list-operations)
  - [4.3.5 List Performance](#435-list-performance)
- [4.4 Nullable Types](#44-nullable-types)
  - [4.4.1 Nullable Fields](#441-nullable-fields)
  - [4.4.2 Non-Nullable Fields](#442-non-nullable-fields)
  - [4.4.3 Null Handling](#443-null-handling)
  - [4.4.4 Partial Results](#444-partial-results)
  - [4.4.5 Error Propagation](#445-error-propagation)
- [4.5 Field Arguments](#45-field-arguments)
  - [4.5.1 Defining Arguments](#451-defining-arguments)
  - [4.5.2 Argument Types](#452-argument-types)
  - [4.5.3 Default Values](#453-default-values)
  - [4.5.4 Required Arguments](#454-required-arguments)
  - [4.5.5 Argument Validation](#455-argument-validation)
- [4.6 Deprecated Fields](#46-deprecated-fields)
  - [4.6.1 @deprecated Directive](#461-deprecated-directive)
  - [4.6.2 Deprecation Reasons](#462-deprecation-reasons)
  - [4.6.3 Client Handling](#463-client-handling)
  - [4.6.4 Removal Strategies](#464-removal-strategies)
  - [4.6.5 Migration Path](#465-migration-path)

---

## 4.1 Object Types

### 4.1.1 Defining Object Types

**Beginner:** **Object types** represent things with **named fields**, like `type Book { title: String }`. They are the main **output** building blocks of a schema.

**Intermediate:** Object types **cannot** appear in **input** positions; use **`input` types** for writes. Objects may **implement** **interfaces** and appear in **union** members.

**Expert:** In **reference implementations**, resolvers return **plain objects** (POJOs), **class instances**, or **primitives** for scalar fields; the runtime **coerces** and **validates** against the **field type**.

```graphql
type Book {
  id: ID!
  title: String!
  isbn: String
}

type Author {
  id: ID!
  name: String!
  books: [Book!]!
}
```

```javascript
const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLNonNull, GraphQLList } = require("graphql");

const BookType = new GraphQLObjectType({
  name: "Book",
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    isbn: { type: GraphQLString },
  },
});

module.exports = { BookType };
```

#### Key Points

- **Object type names** are **unique** in a schema.
- **Fields** map to **resolver functions** or **default property** resolution.
- **Circular** types (`Author` ↔ `Book`) are **common** and **valid**.

#### Best Practices

- Model **product language** (`Order`, `LineItem`) not **tables** (`orders_row`).
- **Keep** objects **focused**; split **mega-types** via **associations** or **new** queries.
- **Align** naming with **client** **codegen** expectations.

#### Common Mistakes

- Using **`input`** keyword for **output** objects.
- **Duplicating** the same **shape** under **many** names.
- **Exposing** **internal** **join** tables as **first-class** public types without **purpose**.

---

### 4.1.2 Fields in Objects

**Beginner:** Each **field** has a **name**, optional **arguments**, and a **return type**. Fields are what clients **select** in queries.

**Intermediate:** **Field arguments** are **not** the same as **input object fields**—arguments live **on the field** in SDL. **Descriptions** and **directives** attach per field.

**Expert:** **Resolver signature** is `(parent, args, context, info)` in GraphQL.js; **parent** is the **object** returned by the **parent field**’s resolver.

```graphql
type Product {
  id: ID!
  slug: String!
  price(currency: CurrencyCode = USD): Money!
}
```

```javascript
const resolvers = {
  Product: {
    price: (product, { currency }) => convertMoney(product.priceUSD, currency),
  },
};
```

#### Key Points

- **Return type** may be **scalar**, **object**, **interface**, **union**, or **list** thereof.
- **Arguments** can appear on **any** field, not only **Query**.
- **Default args** apply when **variable** is **omitted** or **null** per spec rules.

#### Best Practices

- **Colocate** **complex** arg objects as **`input` types** when arity **grows**.
- **Cache** **expensive** field resolvers with **request-scoped** memoization where safe.
- **Instrument** **slow** fields separately in **APM**.

#### Common Mistakes

- **Mis-typing** **parent** shape in resolvers leading to **`undefined`** reads.
- **Using** **mutations** semantics inside **object** field resolvers (**side effects**).
- **Returning** **wrong** GraphQL **nullability** vs actual **values**.

---

### 4.1.3 Nested Objects

**Beginner:** **Nesting** means an object field returns **another object**: `author { books { title } }`.

**Intermediate:** **Depth** increases **resolver calls**; each level may **fetch** from DB or services. **Batching** mitigates **N+1**.

**Expert:** **Query cost** analysis often **weights** depth and **list sizes**. **@defer** (where supported) can **stream** heavy subtrees.

```graphql
type Query {
  book(id: ID!): Book
}

type Book {
  id: ID!
  title: String!
  author: Author!
}

type Author {
  id: ID!
  name: String!
}
```

```javascript
const resolvers = {
  Query: {
    book: (_p, { id }, ctx) => ctx.db.books.byId(id),
  },
  Book: {
    author: (book, _a, ctx) => ctx.loaders.authorById.load(book.authorId),
  },
};
```

#### Key Points

- **Nested selections** drive **resolver** **tree** execution.
- **Each** nested field can **fail** independently affecting **null propagation**.
- **DataLoader** is the **standard** Node pattern for **many children**.

#### Best Practices

- **Limit** **depth** at **gateway** for **public** APIs.
- **Prefer** **loaders** over **per-row** **DB** queries.
- **Document** **max** list sizes for **nested** collections.

#### Common Mistakes

- **Unbounded** recursion in **friends-of-friends** patterns.
- **Sequential** **await** in **loops** instead of **batched** queries.
- **Returning** **partial** objects missing **required** child fields.

---

### 4.1.4 Object Composition

**Beginner:** **Compose** small types into larger ones: `Money`, `Address`, `GeoPoint` reused across `Order`, `User`, `Store`.

**Intermediate:** **Value objects** as GraphQL **object types** (not inputs) document **structure** clearly vs **flattening** into strings.

**Expert:** **Composition** vs **inheritance**: GraphQL favors **interfaces** + **composition**; **avoid** deep **type hierarchies** mirroring OOP.

```graphql
type Money {
  amount: String!
  currencyCode: String!
}

type Order {
  id: ID!
  total: Money!
  tax: Money!
}
```

```javascript
function toMoney(cents, code) {
  return { amount: String(cents), currencyCode: code };
}

const resolvers = {
  Order: {
    total: (o) => toMoney(o.totalCents, o.currency),
    tax: (o) => toMoney(o.taxCents, o.currency),
  },
};
```

#### Key Points

- **Reuse** reduces **drift** between **similar** fields.
- **Composition** clarifies **units** (`cents` vs `dollars`) when documented.
- **Small** types are easier to **evolve** with **additive** fields.

#### Best Practices

- **Standardize** **Money**, **DateTime**, **LocaleString** patterns **once**.
- **Version** **value objects** carefully—they **touch** many queries.
- **Avoid** **anonymous** JSON **scalar** blobs when **structure** is **known**.

#### Common Mistakes

- **Inconsistent** **Money** shapes (`amountCents` vs `amount` string) across types.
- **Overusing** **`JSON` scalar** for **typed** data.
- **Huge** **composed** graphs in **one** type—**split** by **query** entry instead.

---

### 4.1.5 Object Inheritance (Interfaces)

**Beginner:** **`interface Node { id: ID! }`** declares **shared fields**; **`type User implements Node`** **promises** those fields exist.

**Intermediate:** Clients query **interface fields** and use **inline fragments** for **concrete** extras: `... on User { handle }`.

**Expert:** **`resolveType`** (or **`__typename` on objects**) tells the executor which **concrete** type a value is. **Federation** uses **interfaces** carefully across **subgraphs**—composition rules apply.

```graphql
interface Node {
  id: ID!
}

type User implements Node {
  id: ID!
  handle: String!
}

type Organization implements Node {
  id: ID!
  name: String!
}

type Query {
  node(id: ID!): Node
}
```

```javascript
const resolvers = {
  Node: {
    __resolveType(obj) {
      if ("handle" in obj) return "User";
      if ("name" in obj) return "Organization";
      return null;
    },
  },
};
```

#### Key Points

- **Interfaces** are **output-only** (no **input interfaces**).
- **Implementing types** must **include** **all** interface fields with **compatible** types (**covariance** rules apply for **lists/nullable**).
- **`__resolveType`** must be **fast** and **stable**.

#### Best Practices

- Prefer **small** interfaces **(`Node`, `Timestamped`)** over **wide** ones.
- **Include** **`__typename`** in **client** queries for **caches**.
- **Test** **each** implementor for **interface** compliance in **CI**.

#### Common Mistakes

- **`__resolveType`** **misclassification** causing **validation** errors at runtime.
- **Forgetting** **inline fragments** for **fields** not on the **interface**.
- **Breaking** interface **contracts** by **tightening** field types in **implementors**.

---

## 4.2 Scalar Types

### 4.2.1 Built-in Scalars (Int, Float, String, Boolean, ID)

**Beginner:** **Scalars** are **leaf** values. **`Int`** is 32-bit signed; **`Float`** is IEEE 754; **`String`** is UTF-8; **`Boolean`** is true/false; **`ID`** serializes as **string** but accepts **int/string** inputs often.

**Intermediate:** **`ID`** is **opaque** to clients—do not assume **numeric** semantics. **Int** overflow behaviors are **implementation-defined** beyond 32-bit.

**Expert:** **Custom scalars** extend the system; **built-ins** have **defined** **literal** and **coercion** rules in the **spec**.

```graphql
type DemoScalars {
  count: Int
  ratio: Float
  label: String
  enabled: Boolean
  ref: ID
}
```

```javascript
const { graphql, buildSchema } = require("graphql");

const schema = buildSchema(`
  type Query {
    demo: DemoScalars
  }
  type DemoScalars {
    count: Int
    ratio: Float
    label: String
    enabled: Boolean
    ref: ID
  }
`);

graphql({
  schema,
  source: `{ demo { count ratio label enabled ref } }`,
  rootValue: {
    demo: { count: 3, ratio: 1.5, label: "ok", enabled: true, ref: "rm9ldHM=" },
  },
}).then(console.log);
```

#### Key Points

- **Leaves** must be **scalars** or **enums** (enums behave like **scalars** in results).
- **`ID`** **serialization** as **string** avoids **JS** **BigInt** issues for large ids in some stacks.
- **Coercion** from **string literals** to **Int** only if **valid** integer format.

#### Best Practices

- Use **`ID!`** for **primary keys** exposed to clients.
- **Document** **Float** **precision** expectations for **financial** values (often use **custom** `Decimal` scalar).
- **Validate** **Int** ranges in **resolvers** for **business** rules.

#### Common Mistakes

- Using **`Float`** for **money**.
- Treating **`ID`** as **always numeric**.
- **Relying** on **Int** for **values** > 2^31-1.

---

### 4.2.2 Scalar Type Usage

**Beginner:** Scalars appear as **field return types** and **argument types**. **Enums** are separate but **feel** similar to clients.

**Intermediate:** **Lists of scalars** `[String!]!` model **tags**, **roles**, **codes**.

**Expert:** **Union** members must be **object types**, **not** scalars. **Interfaces** cannot **inherit** scalars—only **object** types **implement** interfaces.

```graphql
type Profile {
  displayName: String!
  website: String
  yearsExperience: Int
  verified: Boolean!
  externalIds: [ID!]!
}
```

```javascript
// TypeScript-like typing of resolver return for scalars
/** @returns {Promise<import('./types').Profile>} */
async function profileResolver(_p, _a, ctx) {
  return ctx.db.profile.get();
}
```

#### Key Points

- **Scalars** keep **schemas** **typed** vs **JSON** blobs.
- **Optional** scalars **`String`** communicate **unknown/missing** data.
- **Lists** of scalars still need **pagination** if **large**.

#### Best Practices

- **Prefer** **enums** over **string** for **closed** sets.
- **Use** **custom scalars** for **emails**, **URLs**, **UUIDs** when validating **inputs**.
- **Keep** **scalar** semantics **consistent** across **services** in **federated** graphs.

#### Common Mistakes

- **Encoding** **complex** state in **delimited strings**.
- **Returning** **objects** where **scalar** is **declared**.
- **Mixing** **timezone** **policies** across **DateTime** usages.

---

### 4.2.3 Type Coercion

**Beginner:** GraphQL **coerces** **inputs** to match types when **safe** (e.g., `"2"` → `Int` if valid).

**Intermediate:** **Boolean** coercion rejects **non-boolean** strings like `"yes"`. **Float** can accept **Int** literals in **some** contexts per rules.

**Expert:** **Variable** coercion and **literal** coercion follow **parallel** tables in the spec; **custom scalars** define their own **parsing**.

```graphql
type Query {
  twice(n: Int!): Int!
}
```

```javascript
const { graphql, buildSchema } = require("graphql");

const schema = buildSchema(`
  type Query { twice(n: Int!): Int! }
`);

graphql({
  schema,
  source: `query($n:Int!){ twice(n:$n) }`,
  variableValues: { n: "4" },
  rootValue: { twice: ({ n }) => n * 2 },
}).then(console.log);
```

#### Key Points

- **Coercion** is **not** **casting** arbitrary strings to **types** without rules.
- **Invalid** coercion yields **errors** at **execution** (variables) or **validation**.
- **Clients** should still send **correct JSON types** to **avoid surprises**.

#### Best Practices

- **Send** **native JSON types** from **clients** (`number`, not `"number"`).
- **Test** **edge** literals in **unit tests** (`"0"`, `0`, `false`).
- **Document** **custom scalar** **coercion** explicitly.

#### Common Mistakes

- Assuming **`"true"`** string coerces to **Boolean** (it does **not**).
- **Implicit** timezone conversions **hidden** in **DateTime** scalars.
- **Relying** on coercion to **fix** **bad** client typings.

---

### 4.2.4 Custom Scalars

**Beginner:** **`scalar Email`** extends the type system. You **implement** parsing/serialization in **server** code.

**Intermediate:** Use **`@specifiedBy`** to link **scalar spec** URL. **Validation errors** should be **user-readable**.

**Expert:** **AST** kinds for literals: **StringValue**, **IntValue**, etc. **parseLiteral** must handle **only** valid kinds or return **null** leading to **errors**.

```graphql
scalar Email @specifiedBy(url: "https://example.com/scalars/email")

type User {
  id: ID!
  email: Email!
}
```

```javascript
const { GraphQLScalarType, Kind, GraphQLError } = require("graphql");

function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

const EmailScalar = new GraphQLScalarType({
  name: "Email",
  serialize: (v) => String(v),
  parseValue: (v) => {
    const s = String(v);
    if (!isEmail(s)) throw new GraphQLError("Invalid email");
    return s.toLowerCase();
  },
  parseLiteral: (ast) => {
    if (ast.kind !== Kind.STRING) return null;
    if (!isEmail(ast.value)) throw new GraphQLError("Invalid email");
    return ast.value.toLowerCase();
  },
});

module.exports = { EmailScalar };
```

#### Key Points

- **Three** functions must **agree** on **invariants**.
- **parseLiteral** is **required** for **inline** literals in queries.
- **serialize** defines **JSON** output shape.

#### Best Practices

- **Normalize** values (lowercase email, trim whitespace).
- **Unit-test** **all three** paths.
- **Prefer** **community** scalars when **battle-tested**.

#### Common Mistakes

- **Empty** **parseLiteral** implementation.
- **Throwing** **non-GraphQLError** **without** mapping.
- **Changing** **serialization** format **without** **migration**.

---

### 4.2.5 Scalar Serialization

**Beginner:** **Serialization** turns **internal** values (Date, Buffer) into **JSON-safe** **GraphQL** responses.

**Intermediate:** **Custom scalars**’ **`serialize`** runs for **every** output leaf. **Built-ins** serialize per **JSON** mapping (**Boolean** → boolean).

**Expert:** **BigInt** may need **string** serialization; **binary** data often **base64** **string** via **custom** scalar. **Performance**: avoid **heavy** work in **serialize**—**precompute** in resolvers if needed.

```javascript
const { GraphQLScalarType } = require("graphql");

const BigIntScalar = new GraphQLScalarType({
  name: "BigInt",
  description: "Arbitrary precision integer as string",
  serialize(value) {
    return value.toString();
  },
  parseValue(value) {
    return BigInt(value);
  },
  parseLiteral(ast) {
    return ast.kind === "StringValue" || ast.kind === "IntValue"
      ? BigInt(ast.value)
      : undefined;
  },
});
```

```graphql
scalar BigInt

type LedgerEntry {
  id: ID!
  amount: BigInt!
}
```

#### Key Points

- **JSON** cannot carry **BigInt** natively in **all** environments—**string** is common.
- **serialize** must **never** throw **unexpected** types if schema is **honored**.
- **Clients** must **parse** **string-encoded** numbers carefully.

#### Best Practices

- **Document** wire format in **scalar description**.
- **Align** with **OpenAPI**/**JSON Schema** **consumers** if **shared**.
- **Benchmark** **hot** scalars.

#### Common Mistakes

- Returning **`undefined`** from **serialize** for **non-null** fields.
- **Serializing** **Date** objects as **empty** objects `{}` by mistake.
- **Lossy** **Float** conversions for **currency**.

---

## 4.3 List Types

### 4.3.1 List Declaration

**Beginner:** Wrap type in `[]`: `[String]` is a list whose items are nullable `String` if not further marked.

**Intermediate:** Combine **list** + **`!`**: **`[String!]`**, **`[String]!`**, **`[String!]!`** mean different things.

**Expert:** **List** types can wrap **objects**, **interfaces**, **unions**, or **enums**. **Arguments** can be **list** typed too: `ids: [ID!]!`.

```graphql
type SearchResults {
  hits: [SearchHit!]!
}

type SearchHit {
  score: Float!
  doc: Document!
}
```

```javascript
const resolvers = {
  SearchResults: {
    hits: async (_p, _a, ctx) => {
      const rows = await ctx.search.query();
      return rows.map((r) => ({ score: r.score, doc: r.document }));
    },
  },
};
```

#### Key Points

- **Order** of `[]` and `!` **matters**.
- **Empty list** is valid for **`[T!]!`**.
- **List** fields often need **pagination** wrappers for **production**.

#### Best Practices

- **Prefer** **`[T!]!`** when **null elements** are meaningless.
- **Name** connection types **`XConnection`** when using **cursor** pattern.
- **Validate** **max length** of **input lists** (`ids: [ID!]!`).

#### Common Mistakes

- **Returning** **`null`** for **`[T!]!`** field.
- **Sparse arrays** with **`null`** holes when schema expects **`[T!]`**.
- **Confusing** **JSON** `null` vs **missing** list.

---

### 4.3.2 Nullable and Non-Nullable Lists

**Beginner:** **`[User]`** — list may be null? Actually **`[User]`** means list can contain null users if User nullable? **`User` without `!`** means each element nullable. **`[User!]`** means elements non-null.

**Intermediate:** **`[User!]!`** — list non-null, elements non-null. This is the **strictest** common pattern for collections.

**Expert:** **Partial** failures in lists: if **element** is **nullable**, **errors** can **null** that **element** while **retaining** list structure.

```graphql
type Example {
  a: [String]
  b: [String]!
  c: [String!]
  d: [String!]!
}
```

```javascript
const example = {
  a: null, // ok
  b: null, // invalid for [String]! — error
  c: ["x", null, "y"], // ok if schema allows null elements — here [String!] disallows null elements
  d: ["x", "y"],
};
```

#### Key Points

- **Four** combinations are **distinct** contracts.
- **Choose** nullability based on **partial success** needs.
- **Non-null** elements **fail** the **whole list field** if any element cannot be resolved as non-null? Actually per spec, error at element may **bubble** depending on parent nullability.

#### Best Practices

- **Default** to **`[T!]!`** for **clean** **TS** types when **appropriate**.
- Use **nullable elements** only when **partial** **batch** results are **required**.
- **Document** meaning of **`null`** list vs **empty list**.

#### Common Mistakes

- **Using** **`[T]!`** and **returning** **`null`** entries without **schema** support.
- **Assuming** **`[]` and `null`** are **equivalent** to **clients**.
- **Changing** nullability **without** **breaking change** analysis.

---

### 4.3.3 Nested Lists

**Beginner:** **Matrix-like** structures: `[[Int!]!]!` for **2D** arrays (grids, spreadsheets).

**Intermediate:** **Nested lists** complicate **pagination**—often model **`rows`** as **objects** instead for **clarity**.

**Expert:** **GraphQL** does not **optimize** nested lists automatically; **resolver** **cost** grows **multiplicatively**.

```graphql
type Heatmap {
  cells: [[Float!]!]!
}
```

```javascript
function buildHeatmap(matrix) {
  return matrix.map((row) => row.map((v) => v));
}
```

```graphql
query Nested {
  heatmap {
    cells
  }
}
```

#### Key Points

- **Prefer** **`Row { values: [Float!]! }`** when **rows** have **identity** or **metadata**.
- **Deep** nesting hurts **readability** in **queries** and **responses**.
- **Size** limits are **critical**.

#### Best Practices

- **Cap** **dimensions** server-side.
- **Offer** **flattened** **views** (`cellsFlat` + `width`) for **clients** that prefer.
- **Compress** or **paginate** **large** matrices via **separate** queries.

#### Common Mistakes

- **Returning** **jagged** arrays when **schema** implies **rectangular**.
- **Omitting** **validation** on **nested** **input** lists.
- **Giant** JSON payloads **killing** **mobile** performance.

---

### 4.3.4 List Operations

**Beginner:** GraphQL **does not** define **map/filter** in the language—**operations** are **server-defined** fields: `sort`, `filter`, `distinct`.

**Intermediate:** **Client** cannot **sort arbitrary lists** without **server support**; **no** generic **list comprehension**.

**Expert:** **Relay connections** model **slice** operations (`first`, `after`). **Arguments** encode **operations** explicitly.

```graphql
type Query {
  todos(filter: TodoFilter, orderBy: TodoOrder!): [Todo!]!
}
```

```javascript
function todosResolver(_p, { filter, orderBy }, ctx) {
  return ctx.db.todos.find({ where: buildWhere(filter), orderBy });
}
```

#### Key Points

- **Business logic** for **list operations** lives in **resolvers** / services.
- **Arguments** should be **structured** (`input` types) for **complex** ops.
- **Stable sort** keys **prevent** **pagination bugs**.

#### Best Practices

- **Whitelist** **sort** fields.
- **Index** DB for **common** **filter+sort** combos.
- **Return** **empty list** instead of **`null`** when **non-null list** type.

#### Common Mistakes

- Expecting **SQL-like** **ad-hoc** **query** power without **governance**.
- **Unbounded** **`OR`** filters **bypassing** **indexes**.
- **Null** vs **`[]`** inconsistency.

---

### 4.3.5 List Performance

**Beginner:** Returning **10,000** items in one list is **slow** for **JSON** and **UI**. **Paginate**.

**Intermediate:** **DataLoader** batches **many** list **child** resolutions. **SQL `LIMIT`** must match **`first`**.

**Expert:** **Query complexity** analyzers **weight** list **multipliers**. **@stream** (where available) **streams** list elements.

```javascript
const resolvers = {
  Query: {
    products: (_p, { first }, ctx) => {
      const cap = Math.min(first, 100);
      return ctx.db.products.topN(cap);
    },
  },
};
```

```graphql
query Perf($first: Int!) {
  products(first: $first) {
    id
    title
  }
}
```

#### Key Points

- **p95** latency **scales** with **list size** and **per-item** resolver cost.
- **N+1** dominates **real-world** GraphQL **slowness**.
- **Pagination** + **batching** are **baseline** **production** requirements.

#### Best Practices

- **Enforce** **`first` ≤ max** at **schema** boundary.
- **Explain** **SQL** plans for **hot** list resolvers.
- **Monitor** **field** **timings** per **operation**.

#### Common Mistakes

- **Logging** **full** list payloads in **production**.
- **Resolver** **per element** **HTTP** calls.
- **No** **timeouts** on **downstream** **fetches**.

---

## 4.4 Nullable Types

### 4.4.1 Nullable Fields

**Beginner:** A field **without** `!` may return **`null`** when data is missing or **hidden** by auth.

**Intermediate:** **Nullable** fields **absorb** **errors** without **null bubbling** past them (the field becomes **null** with an **error** entry).

**Expert:** **Privacy**: use **nullable** fields when **unauthorized** access should appear as **`null`** (careful with **inference attacks**).

```graphql
type User {
  id: ID!
  email: String
}
```

```javascript
const resolvers = {
  User: {
    email: (user, _a, ctx) => (ctx.viewer?.isSelf ? user.email : null),
  },
};
```

#### Key Points

- **Nullable** is the **default** in SDL if **`!` omitted**.
- **`null`** is **valid** successful **value** for nullable field.
- **Different** from **errors**—but **errors** can **yield** **null** **field values**.

#### Best Practices

- **Document** **`null` meaning**: missing vs **forbidden** vs **inapplicable**.
- **Avoid** **`null` for errors** when **clients** need **actionable** **codes**—use **`UserError` lists** or **extensions**.
- **Test** **auth** paths for **null** vs **error**.

#### Common Mistakes

- **Nullable** **`ID`** for **objects** that **always** exist when **parent** exists.
- **Using** **null** to hide **bugs**.
- **Client** **assuming** **null** means **network failure**.

---

### 4.4.2 Non-Nullable Fields

**Beginner:** **`String!`** means “if this field is executed successfully, value is **non-null** string.”

**Intermediate:** If resolver **returns null** or **throws**, and field is **`!`**, GraphQL **nulls parent** per **bubble rules** up to next **nullable** field.

**Expert:** **Non-null** at **high** levels makes **errors** **bigger** (lose **whole** subtree). **Tune** **error bars** around **risky** dependencies.

```graphql
type User {
  id: ID!
  name: String!
}
```

```javascript
// If name resolver throws, and User.name is String! -> User may become null for nullable user parent
```

#### Key Points

- **`!` is a guarantee** backed by **resolvers** and **data integrity**.
- **Misused `!`** causes **large** **failed** subgraphs.
- **Root** **non-null** (`user: User!`) fails **entire** `data.user` on error.

#### Best Practices

- **`!` on `id`** when object exists.
- **Nullable** around **third-party** **integrations**.
- **Integration tests** for **failure** modes.

#### Common Mistakes

- **`!` on everything**.
- **Violating** **non-null** with **soft-deleted** rows.
- **Hiding** **partial** **success** opportunities.

---

### 4.4.3 Null Handling

**Beginner:** Clients should **defensively** read **`data`** knowing **nullable** fields may be **absent** or **`null`**.

**Intermediate:** **TypeScript** with **codegen** marks **optional** properties; **still** need **runtime** guards for **partial errors**.

**Expert:** **Relay** normalizes **null** **records**; **Apollo** **cache** **eviction** rules interact with **`null` vs missing**. **Version** **client** libraries when **null** semantics **change**.

```javascript
function renderEmail(user) {
  if (user.email == null) return <Masked />;
  return user.email;
}
```

```graphql
query NullHandling {
  me {
    id
    email
  }
}
```

#### Key Points

- **`null`** is **explicit** in JSON; **missing** key should not happen for **requested** nullable fields unless **error**?
- Actually if **field errors**, may be **null** with **error path**.
- **Clients** must read **`errors`** alongside **`data`**.

#### Best Practices

- **Centralize** **error** + **data** merging policy in **one** client module.
- **Log** **anomalies** when **non-null** promised by **docs** but **null** received.
- **UI** **skeletons** for **loading** vs **null** vs **error**.

#### Common Mistakes

- **`user.email!` non-null assertion** in TS without **server guarantee**.
- Ignoring **`errors`** when **`data` partial**.
- **Caching** **`null`** **permanently** for **transient** failures.

---

### 4.4.4 Partial Results

**Beginner:** GraphQL may return **`data`** with **some fields** while **`errors`** lists **other field failures**.

**Intermediate:** **Spec** allows **partial success**; **HTTP** may still be **200**. **UX** should show **inline** errors.

**Expert:** **Non-null** bubbling may **wipe** **larger** subtrees—**design nullability** to **contain** failures.

```json
{
  "data": {
    "me": {
      "id": "1",
      "email": null
    }
  },
  "errors": [
    {
      "message": "Forbidden",
      "path": ["me", "email"]
    }
  ]
}
```

```javascript
function handlePartial(body) {
  const { data, errors } = body;
  const emailError = errors?.find((e) => e.path?.join(".") === "me.email");
  return { user: data?.me, emailError };
}
```

#### Key Points

- **Partial** results are a **feature**, not **bugs** (when expected).
- **`path`** is essential for **mapping** errors to **UI fields**.
- **Transactions** across **fields** are **not** implied.

#### Best Practices

- **Standardize** **`extensions.code`** for **FORBIDDEN**, **NOT_FOUND**.
- **Design** **forms** to **show** **field-level** errors.
- **Test** **partial** **rendering** in **Storybook** with **mock** responses.

#### Common Mistakes

- **Throwing away** entire **screen** on **single** field error.
- **No** **`path`** in **custom** errors from resolvers.
- **Assuming** **atomic** **updates** across **sibling** mutation fields **without** **documentation**.

---

### 4.4.5 Error Propagation

**Beginner:** Errors **start** at a field and may **bubble** up, **nulling** **parents** until a **nullable** field is found.

**Intermediate:** If **root** **non-null** field fails, **`data` may be `null`** entirely for that operation result.

**Expert:** **`GraphQLError` originalError** chains help **logging**; **mask** in **production** responses.

```graphql
type Query {
  user(id: ID!): User
}

type User {
  id: ID!
  friend: User!
}
```

```javascript
// If friend is non-null but resolver fails -> user may become null if User.friend is non-null child
// If Query.user is nullable, user field nulls with errors; if Query.user were User!, could bubble further
```

#### Key Points

- **Propagation** rules are **deterministic** per **spec**.
- **Nullable lists** with **non-null** elements: **element error** may **null** element or fail list—depends on **nullability** of **list items**.
- **Understanding** propagation is key to **schema** **design**.

#### Best Practices

- **Draw** **nullability trees** for **critical** queries during **design reviews**.
- **Add** **integration tests** asserting **paths** on **forced failures**.
- **Log** **server** **stack traces** separately from **client** **messages**.

#### Common Mistakes

- **Surprising** **whole-tree** **loss** due to **one** **`!`** field.
- **Catching** errors and returning **`null`** without **GraphQLError** **path**.
- **Clients** not **handling** **`data: null`**.

---

## 4.5 Field Arguments

### 4.5.1 Defining Arguments

**Beginner:** Arguments appear in parentheses after field names: `user(id: ID!)`.

**Intermediate:** **Multiple** args comma-separated. **Input types** group args: `createUser(input: CreateUserInput!)`.

**Expert:** **Default values** use `=`. **List** and **non-null** apply to **arg types**. **Directives** on **arguments** are **rare** but valid in SDL.

```graphql
type Query {
  user(id: ID!): User
  users(role: Role, limit: Int! = 25): [User!]!
}
```

```javascript
const resolvers = {
  Query: {
    users: (_p, { role, limit }, ctx) => ctx.db.users.list({ role, limit }),
  },
};
```

#### Key Points

- **Argument names** are **significant**; order is **not** for **named** calls.
- **Variables** map **by name** to **arguments**.
- **Literal** vs **variable** affects **coercion** timing slightly.

#### Best Practices

- **Use `input` objects** for **>3** related args.
- **Validate** **cross-arg** rules in **resolver** or **directive**.
- **Document** **defaults** in **SDL descriptions**.

#### Common Mistakes

- **Typos** in **arg names** between **SDL** and **resolvers**.
- **Using** **String** for **structured** data repeatedly.
- **Missing** **`!`** on args that **must** be provided.

---

### 4.5.2 Argument Types

**Beginner:** Args may be **scalars**, **enums**, **input objects**, or **lists** of those. **Outputs** (interfaces/unions) **cannot** be arg types.

**Intermediate:** **Recursive input types** are **disallowed** (spec). **Enums** provide **closed** sets.

**Expert:** **Custom scalars** as args **validate** at **entry**. **Upload** scalars are **community** pattern (not in core spec).

```graphql
enum SortDir {
  ASC
  DESC
}

input PageInput {
  first: Int! = 20
  after: String
}

type Query {
  feed(page: PageInput!, dir: SortDir!): Feed!
}
```

```javascript
const resolvers = {
  Query: {
    feed: (_p, { page, dir }, ctx) => ctx.feed.get({ ...page, dir }),
  },
};
```

#### Key Points

- **Input** types are **separate** from **output** types.
- **Lists** in args need **limits** for **DoS** safety.
- **Enums** are **strings** on wire in **JSON**.

#### Best Practices

- **Cap** **`first`** in **resolver**.
- **Prefer** **enums** over **free strings**.
- **Version** **inputs** additively with **`@deprecated` fields** inside inputs? (input fields can be deprecated in newer SDL tooling)

#### Common Mistakes

- **Using** **output** type as **input** by mistake.
- **Huge** **input** objects **without** **validation**.
- **Ambiguous** **optional** args with **interdependent** meaning.

---

### 4.5.3 Default Values

**Beginner:** Defaults in SDL: `limit: Int = 20`. Used when **argument not provided**.

**Intermediate:** **Variable defaults** in operation signature: `query ($n: Int = 1)`. **Precedence**: variable value > variable default > arg default (per spec for variables).

**Expert:** **`null` variable** behavior: for optional args, **null** may **override default** to “pass null” depending on **optional** vs **nullable**—teams should **test**.

```graphql
type Query {
  items(first: Int! = 10, skip: Int = 0): [Item!]!
}
```

```javascript
// Resolver still receives coerced values; ensure DB query uses them
function items(_p, { first, skip }) {
  return db.items.find({ take: first, offset: skip });
}
```

#### Key Points

- **Defaults** reduce **client** **boilerplate**.
- **Document** **defaults**—they are part of **contract**.
- **Changing defaults** can be **behavior breaking** even if **SDL** “additive.”

#### Best Practices

- **Integration test** **defaulted** args.
- **Announce** **default changes** in **changelog**.
- **Mirror** defaults in **client** **variables** for **clarity** when **non-obvious**.

#### Common Mistakes

- **Relying** on **implicit** **JS undefined** instead of **explicit** SDL defaults.
- **Different** defaults in **SDL** vs **resolver** fallback.
- **Surprising** **`null`** **wiping** **defaults**.

---

### 4.5.4 Required Arguments

**Beginner:** **`ID!`** means **required** argument—client **must supply** value (variable or literal).

**Intermediate:** **Required** args with **variables** need **`$id: ID!`** in operation header.

**Expert:** **Server** may still **reject** semantically invalid IDs with **execution errors** even when **required args present**.

```graphql
type Query {
  node(id: ID!): Node
}
```

```graphql
query Req($id: ID!) {
  node(id: $id) {
    id
  }
}
```

```javascript
// Missing variable -> validation error before execution
```

#### Key Points

- **`!` on argument type** != **business** “must exist in DB.”
- **Two layers**: **GraphQL required** and **domain exists**.
- **Clients** should **encode** required **variables** in **generated** hooks.

#### Best Practices

- **Use `ID!`** for **fetch by id** operations.
- Return **`NOT_FOUND`** **extensions** rather than **`null` without distinction** when **appropriate**.
- **Validate** **UUID** format in **custom scalar** or **resolver**.

#### Common Mistakes

- **Non-null** arg but **resolver** treats missing **internal** data as **`null` return** on **non-null field**.
- **Empty string** as **`ID!`** passing **GraphQL** validation but **failing** **domain** rules.
- **Breaking** clients by **adding** required args **without** **defaults** or **deprecation path**.

---

### 4.5.5 Argument Validation

**Beginner:** **GraphQL** validates **types**; **you** validate **business rules** (`first <= 100`, `date range ok`).

**Intermediate:** Throw **`GraphQLError`** with **`extensions.code`**. Return **`userErrors`** on **mutation payloads** for **form** validation.

**Expert:** **Zod/Yup/Joi** in **resolvers** for **input** objects; **directive-based** validation for **cross-field** rules.

```javascript
const { GraphQLError } = require("graphql");

function validatePage(page) {
  if (page.first > 100) {
    throw new GraphQLError("`first` cannot exceed 100", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
}

const resolvers = {
  Query: {
    items: (_p, { page }) => {
      validatePage(page);
      return db.items.list(page);
    },
  },
};
```

```graphql
input PageInput {
  first: Int!
  after: String
}

type Query {
  items(page: PageInput!): [Item!]!
}
```

#### Key Points

- **Type validation** != **domain validation**.
- **User-facing** messages should be **safe** to display.
- **Codes** should be **stable** for **clients**.

#### Best Practices

- **Centralize** validation **helpers** per **domain**.
- **Map** **DB constraint** errors to **consistent** API errors.
- **Log** **validation failures** with **correlation id**, not **PII**.

#### Common Mistakes

- **Leaking** **SQL** errors to **`message`**.
- **Inconsistent** **error** shapes across **mutations**.
- **Throwing** **500** for **expected** validation failures.

---

## 4.6 Deprecated Fields

### 4.6.1 @deprecated Directive

**Beginner:** Mark fields **deprecated** in SDL: `oldField: String @deprecated(reason: "Use newField")`.

**Intermediate:** **Introspection** exposes **`isDeprecated`** and **`deprecationReason`**. Tools **strike through** fields in UIs.

**Expert:** **Federation** and **composition** carry **deprecation** metadata to **supergraph**. **Codegen** can **annotate** TS as **@deprecated** JSDoc.

```graphql
type User {
  id: ID!
  username: String! @deprecated(reason: "Use handle")
  handle: String!
}
```

```javascript
// Introspection fields include deprecation for tooling
const { getIntrospectionQuery } = require("graphql");
console.log(getIntrospectionQuery().includes("isDeprecated")); // true in standard introspection
```

#### Key Points

- **Deprecation** is **metadata**; **servers still resolve** deprecated fields until removal.
- **`reason`** should be **actionable**.
- **Clients** should **migrate** proactively.

#### Best Practices

- **Set** removal **dates** in **reason** when possible.
- **Track** usage with **metrics** before removal.
- **Communicate** in **release notes**.

#### Common Mistakes

- **Deprecating** without **replacement** field ready.
- **Empty** **reason** strings.
- **Removing** **deprecated** fields **without** **usage** check.

---

### 4.6.2 Deprecation Reasons

**Beginner:** **`reason:`** explains **what to use instead** and **why**.

**Intermediate:** Include **links** to **docs** or **migration guides** (markdown in description/reason where rendered).

**Expert:** **Internal** reasons for **employees** can reference **ticket** IDs; **public** APIs need **customer-safe** wording.

```graphql
type Account {
  legacyNumber: String
    @deprecated(
      reason: "Superseded by `publicId` (RFC-12). Removal scheduled 2026-09-01."
    )
  publicId: ID!
}
```

#### Key Points

- **Reason** is part of **API contract** communication.
- **Dates** create **accountability**.
- **Links** rot—**verify** periodically.

#### Best Practices

- **Template**: **Replacement + timeline + risk note**.
- **Translate** for **public** **partner** portals if needed.
- **Archive** **migration** guides with **version** tags.

#### Common Mistakes

- **Vague** “deprecated” **without** guidance.
- **Blaming** **users** in **reason** text.
- **Promising** dates **you** cannot **keep**.

---

### 4.6.3 Client Handling

**Beginner:** **TypeScript** may show **strikethrough** on deprecated fields when **introspection**-driven.

**Intermediate:** **ESLint** rules can **ban** deprecated fields in **new** code (`graphql-eslint`).

**Expert:** **Apollo Studio** field usage reports show **deprecated** field traffic; **CI** fails if **usage** **increases**.

```javascript
/* eslint graphql/template-strings: ["error", { env: "apollo", schemaJsonFile: "./schema.json" }] */
import gql from "graphql-tag";

// After migration, remove deprecated selection from operations
export const USER_FRAGMENT = gql`
  fragment UserParts on User {
    id
    handle
  }
`;
```

#### Key Points

- **Clients** must **update operations**, not only **TS types**.
- **Cached persisted queries** may **pin** old fields—**rotate** them.
- **Mobile** apps **lag**—plan **long** deprecation windows.

#### Best Practices

- **Search** repo for **deprecated field names** regularly.
- **Coordinate** **mobile/web** releases.
- **Feature flag** **new** fields during **migration**.

#### Common Mistakes

- **Updating** **types** but **forgetting** **query documents**.
- **Ship** **new** app **using** **deprecated** fields due to **copy-paste**.
- **No** **lint** enforcement.

---

### 4.6.4 Removal Strategies

**Beginner:** **Stop** new usage → **wait** → **remove** field from **schema** in **breaking** release.

**Intermediate:** **Two-step** removal: **deprecate**, then **remove** after **window**. **Measure** **zero** traffic (with **margin**).

**Expert:** **GraphQL Inspector** **breaking change** diff; **Apollo** **schema checks** against **operations** from **production**. **Versioned** endpoints are **last resort**.

```javascript
// CI pseudocode
// if (breakingDiff.removedFields.includes("User.username")) fail unless major bump approved
```

```graphql
# After removal, clients requesting username get validation error
type User {
  id: ID!
  handle: String!
}
```

#### Key Points

- **Removal** is **always breaking** for **someone** if **unknown clients** exist.
- **Persisted queries** reduce **surprise** removals.
- **Sunset** headers (uncommon in GraphQL) vs **comm** channels.

#### Best Practices

- **Announce** **multiple** times across **channels**.
- **Monitor** **404-like** **GraphQL validation** spikes post-deploy.
- **Keep** **rollback** **ready**.

#### Common Mistakes

- **Removing** during **holiday** freeze communication gaps.
- **Assuming** **no usage** because **dashboard** **sampling** **missed** **edge** clients.
- **Removing** **both** **old** and **new** fields **accidentally**.

---

### 4.6.5 Migration Path

**Beginner:** **Add** **replacement** field → **deprecate** old → **update clients** → **remove** old.

**Intermediate:** **Dual write**/**read** patterns in **mutations** if **backend storage** changes.

**Expert:** **Database migrations** **decoupled** from **GraphQL** schema: **feature flags** toggle **resolver** **implementation** while **schema** exposes **both** fields temporarily.

```graphql
type Mutation {
  updateUser(input: UpdateUserInput!): UpdateUserPayload!
}

input UpdateUserInput {
  handle: String
  """Deprecated: use handle"""
  username: String @deprecated(reason: "Use handle")
}
```

```javascript
async function updateUser(_p, { input }, ctx) {
  const handle = input.handle ?? input.username;
  if (!handle) throw new GraphQLError("handle required");
  return ctx.users.updateHandle(ctx.user.id, handle);
}
```

#### Key Points

- **Migration** is **cross-stack**: **schema**, **resolvers**, **clients**, **docs**.
- **Backward compatible** periods reduce **incidents**.
- **Communicate** **ownership** for each **phase**.

#### Best Practices

- **Write** **migration guide** with **examples** for **each** client platform.
- **Automate** **codemods** for **simple** renames.
- **Celebrate** **removal** PRs—**debt paid**.

#### Common Mistakes

- **Breaking** **mobile** **older** versions **without** **version** gating.
- **Inconsistent** **naming** between **old/new** confusing **developers**.
- **Skipping** **post-migration** **cleanup** in **DB**.

---

## Summary: Types and Fields Module

**Object types** and **fields** form the public **shape** of your graph; **scalars** and **lists** express **leaf** and **collection** data with **nullability** controlling **error propagation** and **partial results**. **Arguments** wire **inputs** into **resolvers**, and **`@deprecated`** fields demand a **disciplined migration** story. Apply these ideas together to build **predictable**, **evolvable** GraphQL APIs in **Node.js** and beyond.
