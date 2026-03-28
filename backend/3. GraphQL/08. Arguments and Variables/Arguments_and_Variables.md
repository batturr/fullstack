# Arguments and Variables

## 📑 Table of Contents

- [8.1 Arguments Fundamentals](#81-arguments-fundamentals)
  - [8.1.1 Argument Declaration](#811-argument-declaration)
  - [8.1.2 Argument Types](#812-argument-types)
  - [8.1.3 Argument Usage](#813-argument-usage)
  - [8.1.4 Positional Arguments](#814-positional-arguments)
  - [8.1.5 Named Arguments](#815-named-arguments)
- [8.2 Variables](#82-variables)
  - [8.2.1 Variable Declaration](#821-variable-declaration)
  - [8.2.2 Variable Types](#822-variable-types)
  - [8.2.3 Variable Values](#823-variable-values)
  - [8.2.4 Default Values](#824-default-values)
  - [8.2.5 Required Variables](#825-required-variables)
- [8.3 Input Types](#83-input-types)
  - [8.3.1 Input Type Definition](#831-input-type-definition)
  - [8.3.2 Input Fields](#832-input-fields)
  - [8.3.3 Nested Input Types](#833-nested-input-types)
  - [8.3.4 Input Validation](#834-input-validation)
  - [8.3.5 Input Composition](#835-input-composition)
- [8.4 Variable Validation](#84-variable-validation)
  - [8.4.1 Type Validation](#841-type-validation)
  - [8.4.2 Null Handling](#842-null-handling)
  - [8.4.3 Default Value Coercion](#843-default-value-coercion)
  - [8.4.4 Custom Validation](#844-custom-validation)
  - [8.4.5 Error Handling](#845-error-handling)
- [8.5 Advanced Variable Usage](#85-advanced-variable-usage)
  - [8.5.1 List Variables](#851-list-variables)
  - [8.5.2 Nested Variables](#852-nested-variables)
  - [8.5.3 Scalar Variables](#853-scalar-variables)
  - [8.5.4 Custom Scalar Variables](#854-custom-scalar-variables)
  - [8.5.5 Variable Reuse](#855-variable-reuse)
- [8.6 Best Practices](#86-best-practices)
  - [8.6.1 Naming Conventions](#861-naming-conventions)
  - [8.6.2 Type Safety](#862-type-safety)
  - [8.6.3 Documentation](#863-documentation)
  - [8.6.4 Performance Considerations](#864-performance-considerations)
  - [8.6.5 Security Considerations](#865-security-considerations)

---

## 8.1 Arguments Fundamentals

### 8.1.1 Argument Declaration

#### Beginner

In GraphQL, **arguments** are named parameters you pass to a field, similar to function parameters in programming languages. They appear in parentheses immediately after the field name in a query, and they are declared on the schema side on the corresponding field definition. Arguments let clients filter, paginate, or configure how a field is resolved without creating a new endpoint for every variation.

On the server, each field in your schema can list zero or more arguments with names and types. The GraphQL execution engine validates that every argument you send matches the schema (correct type, required vs optional) before your resolver runs.

#### Intermediate

Argument declarations live in **SDL (Schema Definition Language)** on `Query`, `Mutation`, `Subscription`, and object type fields. Syntax is `fieldName(argName: ArgType = defaultValue): ReturnType`. The type can be a scalar, enum, input object, or list of those. Default values use GraphQL literal syntax, not JSON.

Resolvers receive arguments as the second parameter: `(parent, args, context, info)`. The `args` object is already coerced to the expected runtime shapes for scalars according to the spec.

#### Expert

The GraphQL specification defines **argument coercion** rules: literals and variables are parsed, validated against input types, and defaults apply when omitted. List and non-null modifiers (`!`, `[]`) interact with `null` in precise ways. Custom scalars serialize/deserialize argument values through `parseValue` / `parseLiteral` in reference implementations like `graphql-js`.

For federated subgraphs, argument definitions must be consistent where fields merge; gateway validation rejects incompatible argument lists across services.

```graphql
type Query {
  product(sku: String!, region: String = "US"): Product
}

query {
  product(sku: "ABC-1") {
    name
    price
  }
}
```

```javascript
import { buildSchema, graphql } from "graphql";

const schema = buildSchema(`
  type Query {
    product(sku: String!, region: String = "US"): Product
  }
  type Product { name: String, price: Float }
`);

const rootValue = {
  product: (_, { sku, region }) => ({
    name: `Item ${sku}`,
    price: region === "EU" ? 19.99 : 17.99,
  }),
};

const result = await graphql({
  schema,
  source: `{ product(sku: "X1") { name price } }`,
  rootValue,
});
console.log(result.data);
```

#### Key Points

- Arguments are always **named** in GraphQL; there is no anonymous positional argument syntax in the query language.
- Schema declares types and optional defaults; clients supply values as literals or via variables.
- Resolvers read coerced `args`—not raw strings from HTTP—after validation passes.

#### Best Practices

- Prefer specific input types over long flat argument lists for complex operations.
- Use `ID!` for primary keys and `String` for free text only when appropriate.
- Document argument semantics in schema descriptions for discoverability in GraphiQL.

#### Common Mistakes

- Forgetting `!` on required arguments in the schema while assuming the client always sends a value.
- Using output types (`type User`) as argument types instead of `input` types.
- Expecting JSON-style `undefined` in variables; use omission or explicit `null` per spec rules.

---

### 8.1.2 Argument Types

#### Beginner

Every argument has a **GraphQL type**. Common scalars include `Int`, `Float`, `String`, `Boolean`, and `ID`. You can also use **enums** (a fixed set of allowed strings), **input object types** (structured bundles of fields), and **lists** like `[String!]` or `[Int]`. The type tells the server what shape of value is legal.

Optional arguments allow `null` or omission (unless combined with `!`). A trailing `!` on the argument type means the value cannot be `null` when provided, and for variables, the variable must be supplied if the argument is required.

#### Intermediate

**Input type covariance** is restricted: only `input` types can be used for arguments (not regular `type` definitions). Lists and non-null compose: `[String]!` is a non-null list that may contain null elements; `[String!]!` is a non-null list of non-null strings—common for tag arrays.

Enum values are identifiers in the schema; clients send them without quotes in GraphQL documents. Custom scalars (e.g., `DateTime`, `JSON`) behave like scalars but with custom parsing.

#### Expert

Implementations use **input coercion** algorithms from the spec: `Int` must fit signed 32-bit; `Float` accepts int literals; `Boolean` rejects non-boolean literals. For input objects, unknown fields are errors in strict mode, and field order does not matter.

Polymorphic designs sometimes use `oneOf` input (when supported) or explicit discriminant fields. Federation `@requires` / `@external` can affect which arguments are available at the gateway versus subgraph.

```graphql
enum SortOrder {
  ASC
  DESC
}

input DateRangeInput {
  start: String!
  end: String!
}

type Query {
  orders(sort: SortOrder = ASC, between: DateRangeInput): [Order!]!
}
```

```javascript
import { GraphQLSchema, GraphQLEnumType, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLNonNull } from "graphql";

const SortOrder = new GraphQLEnumType({
  name: "SortOrder",
  values: { ASC: { value: "ASC" }, DESC: { value: "DESC" } },
});

const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    orders: {
      type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
      args: {
        sort: { type: SortOrder, defaultValue: "ASC" },
      },
      resolve: (_, { sort }) => (sort === "DESC" ? ["c", "b"] : ["a", "b"]),
    },
  },
});

const schema = new GraphQLSchema({ query: QueryType });
```

#### Key Points

- Arguments use **input** types, scalars, enums, and lists—not output `type` objects.
- `!` and `[]` combine to express nullability and list structure precisely.
- Enums and custom scalars extend the type system without breaking the JSON transport.

#### Best Practices

- Model ranges, filters, and pagination as dedicated **input** types.
- Prefer non-null list elements (`[T!]!`) when empty lists are valid but null elements are not.
- Align enum naming with domain language (`PaymentStatus` not `Status1`).

#### Common Mistakes

- Using `String` for everything instead of enums or `ID`.
- Allowing both `null` and "magic" empty string for the same meaning.
- Declaring `[Type]` when `[Type!]!` matches the actual resolver contract.

---

### 8.1.3 Argument Usage

#### Beginner

You **use** arguments by writing them next to a field: `user(id: "42")` or `posts(limit: 10, offset: 0)`. Values can be **literals** (numbers, strings, booleans, enums, list/object literals) or **variables** prefixed with `$` that are bound in the operation header.

Multiple arguments are separated by whitespace or commas. Order does not matter because every argument is named—this reduces client bugs compared to positional APIs.

#### Intermediate

The same field can appear multiple times in one selection if you use **aliases** (topic 9); each alias can pass different arguments. Arguments are evaluated per field occurrence, not shared across the query tree.

For **mutations**, input arguments often bundle data: `createUser(input: { name: "Ada", email: "a@b.com" })`. This pattern pairs well with a single `input` object type and a single `Payload` return type.

#### Expert

**Variable definitions** must match how arguments use variables: types must be compatible (including nullability). The executor may short-circuit validation if an operation is invalid. Tools like persisted queries hash the document; argument usage must remain inside the document, not concatenated from untrusted fragments without validation.

```graphql
query UserPosts($uid: ID!, $lim: Int = 5) {
  user(id: $uid) {
    name
    posts(limit: $lim) {
      title
    }
  }
}
```

```javascript
import { graphql, buildSchema } from "graphql";

const schema = buildSchema(`
  type Query {
    user(id: ID!): User
  }
  type User {
    name: String
    posts(limit: Int = 5): [Post!]!
  }
  type Post { title: String }
`);

const rootValue = {
  user: (_, { id }) => ({
    name: `User-${id}`,
    posts: ({ limit }) => Array.from({ length: limit }, (_, i) => ({ title: `Post ${i}` })),
  }),
};

await graphql({
  schema,
  source: `
    query UserPosts($uid: ID!, $lim: Int = 5) {
      user(id: $uid) { name posts(limit: $lim) { title } }
    }
  `,
  variableValues: { uid: "7", lim: 2 },
  rootValue,
});
```

#### Key Points

- Literal vs variable usage is a client choice; variables are preferred for dynamic values.
- Argument names in the query must match the schema exactly (case-sensitive).
- Field arguments are independent from sibling fields’ arguments.

#### Best Practices

- Use variables for anything that comes from user input or config.
- Keep argument sets small and stable to reduce breaking changes.
- Return connection types for large lists instead of unbounded `limit` alone.

#### Common Mistakes

- Passing a variable where the schema expects a literal enum in some tools—verify tooling support.
- Reusing one variable for incompatible fields without checking nullability.
- Omitting required arguments when using default variables incorrectly.

---

### 8.1.4 Positional Arguments

#### Beginner

GraphQL **does not** support positional arguments in the sense of “first arg, second arg” without names. Every argument must be written as `name: value`. If you are coming from REST path segments or RPC, think of GraphQL as always using keyword-style parameters.

This design keeps queries readable and resilient when optional parameters are added to the schema later.

#### Intermediate

Documentation sometimes says “positional” when comparing to **GraphQL shorthand** for the root `query` operation (`{ field }` instead of `query { field }`), but that is not related to arguments. Confusion also arises with **ordered lists** `[1, 2, 3]`—order matters for lists, not for named arguments.

In code-first schemas, the order you declare `args` in the field config is irrelevant to clients; only names matter.

#### Expert

Interoperability layers (OpenAPI to GraphQL) may simulate positional parameters in generated client SDKs, but the wire format remains named. Parsers never accept `foo(1, 2)`. This simplifies diffing queries and static analysis.

```graphql
# Valid: all arguments named
{ node(id: "100", type: USER) }

# Invalid in GraphQL: positional
# { node("100", USER) }
```

```javascript
import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";

const schema = buildSchema(`
  type Query { node(id: ID!, type: NodeType!): String }
  enum NodeType { USER POST }
`);

const app = express();
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: {
      node: (_, args) => JSON.stringify(args),
    },
    graphiql: true,
  })
);
```

#### Key Points

- **Named-only** arguments are a core language rule, not a style preference.
- Lists preserve order; argument lists in the field definition do not imply call order.
- Client generators may hide names but still emit valid GraphQL.

#### Best Practices

- Teach newcomers explicitly that “positional args” do not exist on the wire.
- When wrapping GraphQL in internal SDKs, preserve names in generated documents for debugging.

#### Common Mistakes

- Assuming the first declared schema argument must be “first” in the query.
- Building query strings by concatenating values without names (invalid syntax).

---

### 8.1.5 Named Arguments

#### Beginner

**Named arguments** are the standard GraphQL mechanism: `fieldName(arg1: value1, arg2: value2)`. Names make it obvious what each value means when reading the query, and they allow you to skip optional arguments without placeholder commas.

This is the same concept as keyword arguments in Python or options objects in JavaScript.

#### Intermediate

Named arguments combine with **defaults**: if `page: Int = 1` is declared, the client can omit `page`. If both `page` and `pageSize` exist, the client can supply only the ones they need. Named spreading does not exist in GraphQL—you list each argument explicitly (or use input objects to group them).

Aliases let you call the same field twice with different named argument sets in one operation.

#### Expert

Static query analysis tools rely on named arguments to detect unused parameters, suggest completions, and enforce lint rules (e.g., `graphql-eslint`). In Apollo Federation, argument merging uses names and types across subgraphs; mismatches are composition errors.

```graphql
query Search($q: String!, $first: Int) {
  search(query: $q, first: $first, after: null) {
    edges { node { id } }
  }
}
```

```javascript
import { parse } from "graphql";

const doc = parse(`
  query Search($q: String!, $first: Int) {
    search(query: $q, first: $first, after: null) { edges { node { id } } }
  }
`);

for (const def of doc.definitions) {
  if (def.kind === "OperationDefinition") {
    console.log(def.variableDefinitions?.map((v) => v.variable.name.value));
  }
}
```

#### Key Points

- Clarity and optional-parameter ergonomics follow directly from named arguments.
- Defaults and variables work naturally with names.
- AST tooling inspects `ArgumentNode` by name.

#### Best Practices

- Group related named args into one `input` type when arity grows.
- Use descriptive names (`filter`, `cursor`) not abbreviations (`f`, `c`) in public APIs.

#### Common Mistakes

- Typos in argument names pass client compilation but fail server validation—use codegen.
- Duplicating the same argument name twice in one field (parse error).

---

## 8.2 Variables

### 8.2.1 Variable Declaration

#### Beginner

**Variables** let you write one query document with placeholders and send the actual values separately (usually as JSON in the HTTP body). In the operation signature you declare them: `query Name($varName: Type, $other: Type!) { ... }`. Inside the selection set you reference them with `$varName`.

This separation keeps documents cacheable and avoids string interpolation vulnerabilities.

#### Intermediate

Variable declarations appear only at the **operation** level (query/mutation/subscription), not on individual fields. Each operation has its own variable scope. The same variable name in two operations in one document is allowed if each operation defines it in its own signature (or uses different operations).

GraphQL servers expect `variables` as a JSON object mapping variable names **without** the `$` prefix to JSON values.

#### Expert

The validation pipeline checks that every variable is used at least once (warning in some tools) and that usages are type-compatible. Unused variables are often flagged by linters. `graphql-js` exposes `getVariableValues` for executing with coercion rules identical to the spec.

```graphql
query Hero($episode: Episode) {
  hero(episode: $episode) {
    name
  }
}
```

```javascript
import { getVariableValues, buildSchema, parse } from "graphql";

const schema = buildSchema(`
  enum Episode { NEWHOPE, EMPIRE, JEDI }
  type Query { hero(episode: Episode): Character }
  type Character { name: String }
`);

const doc = parse(`query Hero($episode: Episode) { hero(episode: $episode) { name } }`);
const op = doc.definitions[0];
const coerced = getVariableValues(schema, op, { episode: "JEDI" });
console.log(coerced.coerced);
```

#### Key Points

- Declare once at the top of the operation; use `$name` in field arguments.
- JSON keys in `variables` omit `$`.
- Type compatibility includes nullability (`!`) rules.

#### Best Practices

- Always give operations a name when using variables (`query GetX`) for logs and APM.
- Validate variables on the client with the same schema when possible (codegen).

#### Common Mistakes

- Defining `$id: ID` but passing `null` where the argument expects `ID!`.
- Putting variable definitions on fragments (invalid).

---

### 8.2.2 Variable Types

#### Beginner

A variable’s type uses the same notation as argument types: scalars, enums, input types, lists, and `!` for required. Example: `$filter: UserFilterInput`, `$ids: [ID!]!`. The variable type must be **equal or broader** than the argument it fills in some cases—practically, use the exact input type expected by the field for simplicity.

If a field expects `String` and you use `$s: String`, that matches. If the field expects `String!`, your variable should be `String!` too, or you risk null errors.

#### Intermediate

**Subtyping** for variables: if an argument is `Int` (nullable), a variable `Int!` can still be used because a non-null value is acceptable where null is allowed—but not vice versa. The spec’s “does variable type allow argument type” rules prevent passing nullable variables into non-null arguments without a default.

Input object fields have their own nullability; variables must supply required subfields when the input type requires them.

#### Expert

Code generators map GraphQL variable types to TypeScript or Flow types. For unions on the output side, variables only involve **input** types; polymorphic inputs use `oneOf` or tagged unions manually.

```graphql
input Point2D {
  x: Float!
  y: Float!
}

query Nearby($origin: Point2D!, $radiusKm: Float!) {
  locations(origin: $origin, radiusKm: $radiusKm) {
    name
  }
}
```

```javascript
import { graphql, buildSchema } from "graphql";

const schema = buildSchema(`
  input Point2D { x: Float!, y: Float! }
  type Query {
    locations(origin: Point2D!, radiusKm: Float!): [String!]!
  }
`);

await graphql({
  schema,
  source: `query Nearby($origin: Point2D!, $radiusKm: Float!) {
    locations(origin: $origin, radiusKm: $radiusKm)
  }`,
  variableValues: { origin: { x: 0, y: 0 }, radiusKm: 5 },
  rootValue: {
    locations: () => ["A", "B"],
  },
});
```

#### Key Points

- Variable types use the same grammar as argument types.
- Nullable vs non-null must align with how the variable is used.
- Only input-side types appear in variable definitions.

#### Best Practices

- Prefer dedicated input types for complex variable shapes.
- Use `ID!` for identifiers consistently across operations.

#### Common Mistakes

- Using `String` for JSON blobs instead of a custom scalar or structured input.
- Marking a variable optional when every use site requires a value.

---

### 8.2.3 Variable Values

#### Beginner

Variable values are sent as **JSON** alongside the query. Keys match variable names without `$`. JSON `null` maps to GraphQL null; omitted keys mean the variable was not provided (different from `null` for optional types).

Strings, numbers, booleans, arrays, and objects map naturally to GraphQL scalars, lists, and input objects.

#### Intermediate

**Coercion** happens server-side: a JSON number may fill a `Float` or `Int` per rules; strings for `ID` are common. Enum variables accept the enum’s name as a JSON string in variables (not unquoted—JSON requires strings). Custom scalars may accept structured JSON if `parseValue` allows it.

For HTTP, typical body shape: `{ "query": "...", "variables": { "id": "1" }, "operationName": "GetUser" }`.

#### Expert

Batched requests may send an array of such objects. WebSocket subscriptions often reuse the same variable envelope. Normalization layers (Apollo cache) rely on stable variable JSON ordering—serialize consistently.

```javascript
import fetch from "node-fetch";

async function run() {
  const res = await fetch("http://localhost:4000/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query GetUser($id: ID!) { user(id: $id) { name } }`,
      variables: { id: "42" },
      operationName: "GetUser",
    }),
  });
  console.log(await res.json());
}
```

#### Key Points

- JSON is the transport representation; GraphQL literals differ slightly in documents.
- Omission vs explicit `null` matters for optional variables.
- Enum values in JSON are strings.

#### Best Practices

- Always send `variables` as an object, not a stringified JSON string (unless your server expects that).
- Validate variable JSON size for DoS protection.

#### Common Mistakes

- Sending `{ "id": 42 }` when the schema expects `ID`—often works but can confuse strict clients.
- Double-encoding variables as a string.

---

### 8.2.4 Default Values

#### Beginner

Variables can have **defaults** in the declaration: `$pageSize: Int = 20`. If the client omits `pageSize` in the variables JSON, the default applies. This mirrors argument defaults on fields but applies at the operation level.

Defaults use GraphQL literal syntax (not JSON) in the query document: `= 20`, `= true`, `= null`, `= RED`, `= { x: 0, y: 0 }`.

#### Intermediate

If a variable is **not required** (`$x: Int` without `!`) and omitted, the default is used when specified; if there is no default, the variable’s value is undefined and may propagate as null per usage. Interaction with **argument defaults** can be subtle: a missing variable that feeds a missing optional argument may still trigger the field’s default.

#### Expert

The spec defines **coercion** of default variable values at validation time. Changing a default in the schema or document can be a breaking change for clients relying on old behavior. Some gateways strip or inject defaults when rewriting queries.

```graphql
query Feed($first: Int = 10, $after: String) {
  feed(first: $first, after: $after) {
    nodes { id }
  }
}
```

```javascript
import { getVariableValues, buildSchema, parse } from "graphql";

const schema = buildSchema(`type Query { feed(first: Int, after: String): String }`);
const doc = parse(`query Feed($first: Int = 10, $after: String) { feed(first: $first, after: $after) }`);
const { coerced } = getVariableValues(schema, doc.definitions[0], {});
console.log(coerced);
```

#### Key Points

- Defaults are declared in the GraphQL document, not only in JSON.
- Required variables (`!`) cannot rely on omission—clients must supply or default in the signature.
- Defaults simplify common pagination patterns.

#### Best Practices

- Default safe limits (`first: 20`) to reduce accidental full-table scans.
- Document defaults in schema descriptions for fields, not only variables.

#### Common Mistakes

- Using JSON `undefined` in variables—omit the key instead.
- Setting variable default `null` and expecting the argument default to run—check spec interaction for your stack.

---

### 8.2.5 Required Variables

#### Beginner

A **required variable** uses non-null type: `$id: ID!`. Clients must supply it in `variables`; omission is a validation error. This matches required arguments like `user(id: ID!)` when you pass `$id`.

Required variables cannot have defaults that make them “optional” in practice—`$id: ID! = "0"` is valid GraphQL but often undesirable because it hides missing IDs.

#### Intermediate

If an operation uses `$id: ID!` in multiple places, one value satisfies all. Partial execution does not happen for validation failures—the whole operation fails before resolvers run (unless using some nonstandard clients).

Tools like `graphql-codegen` mark required variables as non-optional TypeScript properties.

#### Expert

**@include/@skip** (topic 11) can skip fields, but variables used only inside skipped fields may still be required by strict validators—behavior depends on tooling; the spec’s rules focus on type correctness, not directive reachability.

```graphql
query MustHaveId($id: ID!) {
  user(id: $id) {
    email
  }
}
```

```javascript
import { graphql, buildSchema } from "graphql";

const schema = buildSchema(`type Query { user(id: ID!): User } type User { email: String }`);

const bad = await graphql({
  schema,
  source: `query MustHaveId($id: ID!) { user(id: $id) { email } }`,
  variableValues: {},
  rootValue: { user: ({ id }) => ({ email: `${id}@x.com` }) },
});
console.log(bad.errors?.[0]?.message);
```

#### Key Points

- `!` on a variable definition means “must be provided.”
- Validation fails fast if required variables are missing.
- Align required variables with required arguments for clarity.

#### Best Practices

- Keep required sets minimal to ease mobile client evolution.
- Use input objects so “required” is one nested object instead of many top-level variables.

#### Common Mistakes

- Marking variables required when defaults would serve onboarding flows.
- Confusing variable `!` with field return type `!`.

---

## 8.3 Input Types

### 8.3.1 Input Type Definition

#### Beginner

**Input types** (`input CreateUserInput { ... }`) describe structured data you can pass as arguments. Unlike `type` (output), `input` cannot contain fields that are resolved by functions—only data fields. This mirrors “DTOs” or “request bodies” in REST.

You define inputs in SDL alongside the rest of the schema, then reference them in argument lists: `createUser(input: CreateUserInput!)`.

#### Intermediate

Input types are **closed** sets of fields for a single message shape. They can reference other input types for nesting. Circular input types are forbidden in standard GraphQL. Inputs cannot implement interfaces in classic GraphQL (unlike output types).

In `graphql-js`, use `GraphQLInputObjectType` for code-first schemas.

#### Expert

Federation and schema stitching require compatible input definitions when the same mutation appears in multiple graphs—rare but possible in gateways. **Input unions** are not in classic spec; patterns use `oneOf` or wrapper fields.

```graphql
input CreateUserInput {
  email: String!
  displayName: String
}

type Mutation {
  createUser(input: CreateUserInput!): UserPayload!
}
```

```javascript
import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString, GraphQLObjectType, GraphQLSchema } from "graphql";

const CreateUserInput = new GraphQLInputObjectType({
  name: "CreateUserInput",
  fields: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    displayName: { type: GraphQLString },
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    createUser: {
      type: GraphQLString,
      args: { input: { type: new GraphQLNonNull(CreateUserInput) } },
      resolve: (_, { input }) => `created:${input.email}`,
    },
  },
});

export const schema = new GraphQLSchema({
  mutation: Mutation,
  query: new GraphQLObjectType({ name: "Query", fields: { _: { type: GraphQLString } } }),
});
```

#### Key Points

- `input` vs `type` separation enforces safe, serializable argument shapes.
- Inputs compose for complex mutations and queries.
- Code-first and SDL-first both support the same concepts.

#### Best Practices

- Name inputs with verb/noun suffix (`CreateUserInput`, `UserFilter`).
- One mutation argument `input` is easier to extend than many positional args.

#### Common Mistakes

- Putting resolvers on input fields (impossible—inputs are not resolved).
- Reusing output types as inputs.

---

### 8.3.2 Input Fields

#### Beginner

Each **input field** has a name, type, and optional default. Required subfields use `!`. Clients send input objects as JSON maps with matching keys. Unknown keys are errors.

Input fields can be scalars, enums, other inputs, or lists—same composition rules as arguments.

#### Intermediate

Defaults on input fields use GraphQL literals: `role: Role = MEMBER`. When the client omits `role`, the default applies during coercion. This differs from output field defaults (which do not exist—outputs come from resolvers).

Nullable input fields distinguish **omitted** vs **explicit null** in some APIs for patch semantics (GraphQL itself does not define PATCH; conventions do).

#### Expert

**GraphQL over HTTP** recommendations suggest consistent null handling. For partial updates, some APIs use dedicated `UpdateUserInput` with optional fields and interpret `null` as “clear this field” only when documented.

```graphql
input UpdateProfileInput {
  bio: String
  website: String = ""
}
```

```javascript
import { graphql, buildSchema } from "graphql";

const schema = buildSchema(`
  input UpdateProfileInput { bio: String, website: String = "" }
  type Mutation { updateProfile(input: UpdateProfileInput!): String }
`);

await graphql({
  schema,
  source: `mutation($input: UpdateProfileInput!) { updateProfile(input: $input) }`,
  variableValues: { input: { bio: "Hi" } },
  rootValue: {
    updateProfile: (_, { input }) => JSON.stringify(input),
  },
});
```

#### Key Points

- Input field nullability controls required JSON keys after coercion.
- Field-level defaults reduce client boilerplate.
- Document semantics of explicit `null` for your API.

#### Best Practices

- Keep inputs forward-compatible by adding optional fields.
- Avoid huge monolithic inputs—split by use case.

#### Common Mistakes

- Using `String!` for every field when partial updates need optionality.
- Clients sending wrong casing for keys—match schema exactly.

---

### 8.3.3 Nested Input Types

#### Beginner

**Nested inputs** let you group related data: `AddressInput` inside `OrderInput`. JSON mirrors the nesting: `{ "shipping": { "line1": "...", "city": "..." } }`.

This models real-world forms and domain aggregates cleanly.

#### Intermediate

Depth limits are important: deeply nested inputs enlarge payloads and CPU for validation. Many servers configure **max depth** for queries; similar limits may apply to input size.

Nesting can represent **value objects** (money, date ranges) reused across mutations.

#### Expert

Validation libraries (e.g., Zod paired with codegen) can mirror nested input rules on the client. For security, reject unexpected keys and cap string lengths in resolvers or middleware.

```graphql
input MoneyInput {
  amount: Float!
  currency: String!
}

input LineItemInput {
  sku: ID!
  quantity: Int!
  unitPrice: MoneyInput!
}

input PlaceOrderInput {
  items: [LineItemInput!]!
}
```

```javascript
const input = {
  items: [
    { sku: "1", quantity: 2, unitPrice: { amount: 9.99, currency: "USD" } },
  ],
};
console.log(JSON.stringify(input).length);
```

#### Key Points

- Nesting improves clarity versus flat prefixed keys.
- Lists of inputs are common for bulk operations.
- Reuse small input types across mutations.

#### Best Practices

- Extract repeated structures (`MoneyInput`, `DateRangeInput`).
- Align nesting with domain boundaries.

#### Common Mistakes

- Excessive depth without server-side limits.
- Inconsistent nesting between create and update inputs.

---

### 8.3.4 Input Validation

#### Beginner

GraphQL validates inputs **structurally** against types before resolvers run: correct fields, types, enums, and null rules. This catches many bugs early but is **not** full business validation (e.g., “email must be unique”).

You still validate domain rules in resolvers or a service layer.

#### Intermediate

Custom scalars can reject bad formats (`Email`, `PositiveInt`). Directive-based validation is possible on some servers but not universal. **Input object validation** in pure spec is type-level only.

Return **user-facing errors** via GraphQL errors extensions or mutation payloads with `UserError` lists—both patterns are common.

#### Expert

Libraries like `graphql-constraint-directive` add min/max constraints via SDL extensions. Federation routers may run additional validation. Consider **validation middleware** that walks variable values against JSON Schema generated from GraphQL.

```javascript
import { GraphQLScalarType, Kind } from "graphql";

const PositiveInt = new GraphQLScalarType({
  name: "PositiveInt",
  serialize: (v) => v,
  parseValue: (v) => {
    if (!Number.isInteger(v) || v < 1) throw new TypeError("PositiveInt expected");
    return v;
  },
  parseLiteral: (ast) => {
    if (ast.kind !== Kind.INT) return undefined;
    const n = parseInt(ast.value, 10);
    if (n < 1) return undefined;
    return n;
  },
});
```

#### Key Points

- Schema validation ≠ business validation.
- Custom scalars enforce parse-time constraints.
- Decide between errors array in payload vs top-level GraphQL errors.

#### Best Practices

- Validate permissions before expensive validation.
- Keep error messages safe for clients (no stack traces).

#### Common Mistakes

- Relying only on GraphQL for constraints like max length.
- Throwing generic errors without codes for clients.

---

### 8.3.5 Input Composition

#### Beginner

**Composition** means building larger inputs from smaller ones: `PagingInput`, `SortInput`, `UserFilterInput` combined into `UserSearchInput`. This reduces duplication and keeps schemas maintainable.

Clients send one composed JSON object matching the composed input type.

#### Intermediate

SDL `input` cannot inherit or extend other inputs in classic GraphQL; composition is by **field embedding** only. Codegen tools may duplicate TypeScript interfaces per input unless configured to share types.

Some teams use **builder patterns** on the server to construct internal DTOs from a single `input` argument.

#### Expert

Versioning: add optional fields to composed inputs instead of renaming. For **breaking** changes, introduce `UserSearchInputV2` and deprecate fields on the old input (deprecation on input fields is supported in SDL).

```graphql
input PagingInput {
  limit: Int = 20
  offset: Int = 0
}

input UserFilterInput {
  role: String
  active: Boolean
}

input UserSearchInput {
  filter: UserFilterInput
  page: PagingInput!
}
```

#### Key Points

- Embed; do not “extend” inputs in standard SDL.
- Composition mirrors modular domain design.
- Plan versioning for evolving composed shapes.

#### Best Practices

- Name embedded inputs by role (`page`, `filter`, `sort`).
- Avoid diamond-shaped redundant embedding.

#### Common Mistakes

- Copy-pasting identical substructures instead of extracting inputs.
- Deep coupling between unrelated mutations through shared inputs.

---

## 8.4 Variable Validation

### 8.4.1 Type Validation

#### Beginner

**Type validation** ensures variables match their declared types: you cannot pass a string where an `Int` is declared. This happens during the validation phase alongside document parsing.

Mismatch produces a descriptive error before any resolver executes.

#### Intermediate

The validator checks **every variable usage** against the variable definition and the argument or directive location. List and non-null modifiers are part of the type check. `graphql-js` function `validate()` returns an array of `GraphQLError`s.

#### Expert

Custom scalars participate in validation only if literals are present; variable values are validated with `parseValue` at coercion time. Federation may re-validate at the gateway after query planning.

```javascript
import { buildSchema, parse, validate } from "graphql";

const schema = buildSchema(`type Query { n(x: Int): Int }`);
const doc = parse(`query($x: String) { n(x: $x) }`);
console.log(validate(schema, doc).map((e) => e.message));
```

#### Key Points

- Static validation protects resolvers from inconsistent types.
- List/nullable combinations are strict.
- Fix errors at compile time with codegen.

#### Best Practices

- Run validation in CI on persisted operations.
- Surface validation errors clearly in GraphiQL during development.

#### Common Mistakes

- Disabling validation in production “for speed” (unsafe).
- Using `Any` scalar everywhere to bypass checks.

---

### 8.4.2 Null Handling

#### Beginner

GraphQL distinguishes **null** from **omitted**. For optional variables, omitting the key may mean “use default” or “no value,” while JSON `null` sets the variable to null. That propagates to arguments unless blocked by `!`.

Required fields and arguments reject null.

#### Intermediate

For input objects, **absence** of a key vs `null` key matters for partial update semantics you define. The spec’s coercion rules define how `null` interacts with non-null types—generally, `null` for `T!` is an error.

#### Expert

**Null propagation** in lists: `[String!]` cannot contain null elements; `null` in JSON array fails coercion. Clients using Apollo may strip undefined keys; ensure your server interprets that consistently.

```graphql
query Q($maybe: String) {
  echo(text: $maybe)
}
```

```javascript
import { getVariableValues, buildSchema, parse } from "graphql";

const schema = buildSchema(`type Query { echo(text: String): String }`);
const doc = parse(`query Q($maybe: String) { echo(text: $maybe) }`);
console.log(getVariableValues(schema, doc.definitions[0], { maybe: null }).coerced);
```

#### Key Points

- `null` is explicit; omission is different for variables and input fields.
- `!` forbids null end-to-end.
- Document your API’s meaning of explicit nulls.

#### Best Practices

- Prefer optional variables without `!` when `null` is meaningful.
- Use mutation payloads to return validation issues instead of silent ignores.

#### Common Mistakes

- Sending `null` for `ID!`.
- Confusing SQL NULL semantics with GraphQL null.

---

### 8.4.3 Default Value Coercion

#### Beginner

**Coercion** turns JSON variable values into internal GraphQL values: strings to enums, numbers to floats, etc. **Default value coercion** applies defaults from variable or argument definitions using GraphQL literal rules.

If a default is the literal `10`, it is coerced as if the client sent `10`.

#### Intermediate

Order of application: variable default → variable value → argument default when variable is not provided and argument receives that variable slot—exact combinations should be tested per your framework.

#### Expert

Changing coercion behavior in `graphql-js` major versions is rare but watch release notes. Custom scalars must implement consistent literal vs variable parsing.

```javascript
import { coerceInputValue, buildSchema } from "graphql";

const schema = buildSchema(`
  input Point { x: Int!, y: Int! }
  type Query { _: Boolean }
`);
const Point = schema.getType("Point");
const value = coerceInputValue({ x: 1, y: 2 }, Point);
console.log(value);
```

#### Key Points

- Coercion is spec-defined for scalars and enums.
- Defaults participate in coercion like literals.
- Test edge cases (empty strings, boundary ints).

#### Best Practices

- Unit-test custom scalar coercion paths.
- Avoid relying on implicit coercion between stringly numbers and `Int`.

#### Common Mistakes

- Assuming all servers coerce `"123"` to `Int` in variables (they should not).

---

### 8.4.4 Custom Validation

#### Beginner

**Custom validation** is your code checking business rules: email format, ownership, inventory, etc. GraphQL only guarantees structural validity.

Implement this inside resolvers, domain services, or middleware after authentication.

#### Intermediate

Return structured errors: `MutationResult { success: Boolean, errors: [ValidationError!] }` is a popular pattern versus throwing for expected validation failures.

#### Expert

Use **directive-based** validation or **schema transforms** in advanced setups. For Node, `yup`/`zod` schemas generated from GraphQL can share rules front-to-back.

```javascript
async function createUser(_, { input }, ctx) {
  if (!/^[^@]+@[^@]+$/.test(input.email)) {
    return { success: false, errors: [{ field: "email", message: "Invalid email" }] };
  }
  await ctx.db.users.insert(input);
  return { success: true, user: input };
}
```

#### Key Points

- Structural vs domain validation are separate layers.
- Structured errors improve UX.
- Throw for unexpected failures; return for expected validation.

#### Best Practices

- Centralize validation helpers per domain entity.
- Log validation failures at info level, not error, if expected.

#### Common Mistakes

- Mixing HTTP 400 with GraphQL 200 responses inconsistently.
- Leaking internal validation details to clients.

---

### 8.4.5 Error Handling

#### Beginner

GraphQL typically returns **200 OK** with `{ "errors": [...], "data": ... }` even for partial failures. Each error has a `message`; optional `locations`, `path`, and `extensions`.

Variable validation errors appear here before execution.

#### Intermediate

Distinguish **syntax/validation** errors (bad document) from **execution** errors (resolver threw). Clients should inspect `errors` array and `data` nullability per field.

#### Expert

**Masking** production errors hides stack traces; use `extensions.code` for machine-readable categories. Apollo and Yoga provide hooks to format errors consistently.

```javascript
import { GraphQLError } from "graphql";

throw new GraphQLError("Not found", {
  extensions: { code: "NOT_FOUND" },
  path: ["user"],
});
```

#### Key Points

- Multiple errors can occur in one response.
- Path helps correlate errors to selection fields.
- Extensions carry custom metadata safely.

#### Best Practices

- Standardize error codes across the API.
- Do not expose internal identifiers in messages.

#### Common Mistakes

- Returning HTTP 500 for all GraphQL errors.
- Ignoring partial data when `data` is still useful.

---

## 8.5 Advanced Variable Usage

### 8.5.1 List Variables

#### Beginner

A variable can be a **list**: `$ids: [ID!]!` means a non-null list of non-null IDs. JSON sends an array: `{ "ids": ["1", "2"] }`.

Use lists for batch fetches, `IN` filters, or ordering.

#### Intermediate

Empty list `[]` is valid for `[ID!]!`. Null list is invalid for `[ID!]!` but valid for `[ID!]` (nullable list) depending on declaration.

#### Expert

Large lists stress query logs and SQL `IN` clauses—paginate or cap length server-side.

```graphql
query UsersByIds($ids: [ID!]!) {
  nodes(ids: $ids) {
    id
    name
  }
}
```

```javascript
const variableValues = { ids: Array.from({ length: 500 }, (_, i) => String(i)) };
console.log(JSON.stringify(variableValues).length);
```

#### Key Points

- List nullability is independent from element nullability.
- JSON arrays map to GraphQL lists.
- Consider server-side caps.

#### Best Practices

- Validate max length for list variables.
- Use DataLoader batching keyed by list contents carefully.

#### Common Mistakes

- Sending a single scalar when a list is expected.
- Allowing unbounded list size from clients.

---

### 8.5.2 Nested Variables

#### Beginner

Variables can have **nested object** types matching input objects: `$input: PlaceOrderInput!` with JSON nested structure.

There is no special syntax—just declare the input type and pass JSON.

#### Intermediate

Nested variables pair well with **fragments** (topic 9) for reusing field selections while keeping variables at operation scope.

#### Expert

**Variable hoisting** does not exist—all variables are operation-scoped. Deep merging nested variables is client-side only; the server receives final JSON.

```graphql
query Nested($q: SearchQueryInput!) {
  search(query: $q) {
    totalCount
  }
}
```

#### Key Points

- Nested variables follow input type shape exactly.
- Operation-level scope still applies.
- Good for complex search/filter UIs.

#### Best Practices

- Keep nested JSON under size limits (WAF/body parser).
- Version nested inputs carefully.

#### Common Mistakes

- Flattening nested JSON incorrectly on the client.
- Mismatched optional nested objects vs null.

---

### 8.5.3 Scalar Variables

#### Beginner

**Scalar variables** are the simplest: `$id: ID!`, `$q: String`, `$active: Boolean`. JSON provides string/number/boolean/null.

Most operations are mostly scalars plus one input object.

#### Intermediate

Scalars coerce per spec; locale issues can affect `Float` stringification—prefer sending numbers as JSON numbers.

#### Expert

**Custom scalars** like `DateTime` may accept ISO-8601 strings in variables; document the exact format.

```graphql
scalar DateTime

query Events($from: DateTime!, $to: DateTime!) {
  events(from: $from, to: $to) {
    id
  }
}
```

#### Key Points

- Scalars are the leaves of variable types.
- Coercion rules are uniform across servers implementing the spec.
- Document custom scalar wire formats.

#### Best Practices

- Use `Boolean` variables with `@include`/`@skip` for conditional queries.
- Prefer `ID` for keys, not `Int`, unless keys are truly numeric.

#### Common Mistakes

- Quoting booleans in JSON (`"true"`)—invalid for GraphQL Boolean coercion.

---

### 8.5.4 Custom Scalar Variables

#### Beginner

When your schema defines `scalar JSON` or `scalar Upload`, variables of that type pass through **parseValue** on the server. Clients send JSON-compatible representations.

#### Intermediate

File uploads often use **multipart requests** (e.g., `graphql-upload`) where the file map references variable paths. This is outside pure JSON POST but common in Node ecosystems.

#### Expert

Ensure **introspection** documents the scalar; clients may treat unknown scalars as `any`. Serialization for responses uses `serialize`.

```javascript
import { GraphQLScalarType, Kind } from "graphql";

export const JSONScalar = new GraphQLScalarType({
  name: "JSON",
  description: "Arbitrary JSON",
  serialize: (v) => v,
  parseValue: (v) => v,
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return JSON.parse(ast.value);
    return null;
  },
});
```

#### Key Points

- Custom scalars unify parsing for literals and variables.
- Upload scalars need transport conventions.
- Treat `JSON` scalar as escape hatch sparingly.

#### Best Practices

- Prefer structured inputs over blob `JSON` when possible.
- Add descriptions and examples for custom scalars.

#### Common Mistakes

- Using `JSON` scalar to bypass schema design.
- Forgetting `parseLiteral` parity with `parseValue`.

---

### 8.5.5 Variable Reuse

#### Beginner

The same variable may appear in **many fields** in one operation: `$orgId: ID!` passed to multiple root fields. One JSON value feeds all usages.

This keeps operations DRY and consistent.

#### Intermediate

Reuse across **different arguments** requires compatible types; you cannot reuse `$id: ID!` where `Int!` is expected without coercion errors.

#### Expert

**Query planning** in federation might duplicate requests; variable reuse does not imply single backend call. Caching keys (e.g., Apollo) include serialized variables.

```graphql
query OrgDashboard($orgId: ID!) {
  organization(id: $orgId) { name }
  projects(orgId: $orgId) { id }
  members(orgId: $orgId) { userId }
}
```

#### Key Points

- One variable, many sites—consistent semantics.
- Types must be compatible everywhere.
- Caching and logs include full variable map.

#### Best Practices

- Reuse for correlation IDs across related fields.
- Avoid overloading one variable for unrelated concepts.

#### Common Mistakes

- Reusing a variable that subtly differs semantically (e.g., `userId` vs `actorId`).
- Huge variable maps hurting log and cache performance.

---

## 8.6 Best Practices

### 8.6.1 Naming Conventions

#### Beginner

Use **camelCase** for field and argument names in GraphQL (community convention). Types and inputs use **PascalCase** (`User`, `CreateUserInput`). Enum values are often **SCREAMING_SNAKE_CASE** or **PascalCase**—pick one style per schema.

Variables are typically **camelCase** without `$` in JSON: `$userId` → `"userId"`.

#### Intermediate

Consistent naming improves **code generation** and avoids awkward renamed fields. GraphQL is case-sensitive; `userId` and `userid` are different names.

#### Expert

Lint with `graphql-eslint` rules like `naming-convention` to enforce team standards across SDL files.

```graphql
type Query {
  userById(userId: ID!): User
}
```

#### Key Points

- Conventions aid tooling and readability.
- Case sensitivity matters everywhere.
- Align enums with domain standards.

#### Best Practices

- Document naming in your API guidelines.
- Avoid abbreviations unless universal (`id`, `url`).

#### Common Mistakes

- Mixing snake_case and camelCase in one schema.
- Renaming args without deprecation strategy.

---

### 8.6.2 Type Safety

#### Beginner

**Type safety** means your operations match the schema: correct arguments, variables, and selections. Achieve this with **codegen** from `.graphql` files to TypeScript types.

Editors with GraphQL extensions validate queries live.

#### Intermediate

**Strict nullability** in the schema propagates to client types—plan for optional chaining. Use `graphql-codegen` with `typescript-operations` plugin.

#### Expert

CI can run `graphql-inspector` or `rover` for breaking change detection against a schema registry.

```bash
npx graphql-codegen --config codegen.ts
```

#### Key Points

- Schema-first + codegen closes the loop with TypeScript.
- Nullable design affects client ergonomics.
- CI guards against drift.

#### Best Practices

- Commit generated types or generate in CI consistently.
- Pin schema versions for mobile clients.

#### Common Mistakes

- Hand-writing types that drift from schema.
- Overusing `String` reducing safety gains.

---

### 8.6.3 Documentation

#### Beginner

Add **descriptions** in SDL with string literals before types/fields/args: `"""Fetches a user by primary key"""`. GraphiQL shows these as tooltips.

Document variables implicitly by describing arguments they feed.

#### Intermediate

Use **@deprecated(reason: "...")** on args and input fields when evolving APIs. Link to migration guides in the reason string.

#### Expert

Some teams generate **Markdown docs** from introspection (`graphdoc`, `docusaurus-graphql-plugin`).

```graphql
"""
Primary customer identifier in our billing system.
"""
scalar CustomerId
```

#### Key Points

- Descriptions are first-class schema metadata.
- Deprecations guide clients safely.
- External docs can mirror introspection.

#### Best Practices

- Describe units (`meters`, `cents`) in field descriptions.
- Keep reasons actionable.

#### Common Mistakes

- Empty descriptions on public APIs.
- Deprecating without timeline or replacement.

---

### 8.6.4 Performance Considerations

#### Beginner

Arguments and variables affect **what work** resolvers do: large `limit` values or huge `IN` lists can overload databases. Set **maximum limits** in resolvers.

Variables change cache keys— enormous unique variables reduce cache hit rates.

#### Intermediate

**Persisted queries** hash the document; variables remain dynamic. This is good for CDN caching of POST if supported.

#### Expert

Use **query cost** analysis factoring argument magnitudes (e.g., `first` multiplier). DataLoader batches per request; variables influence batch keys.

```javascript
function posts(_, { first = 10 }) {
  const n = Math.min(first, 50);
  return db.posts.limit(n);
}
```

#### Key Points

- Validate magnitudes server-side.
- Variables participate in caching strategies.
- Cost-aware schemas are production-ready.

#### Best Practices

- Default and cap pagination args.
- Log slow operations with variable snapshots (redacted).

#### Common Mistakes

- Trusting client-provided `limit`.
- Ignoring variable cardinality in metrics.

---

### 8.6.5 Security Considerations

#### Beginner

Never build query strings with **string concatenation** from untrusted input—use **variables** to separate code from data. This avoids injection-style bugs (GraphQL is not SQL, but bad patterns persist).

Authenticate users before running resolvers; pass identity via **context**.

#### Intermediate

**Rate limit** by IP and user. Restrict introspection in production if policy requires. Validate **query depth** and **complexity**.

#### Expert

**Allow lists** for persisted operations reduce attack surface. Audit **argument logging** for PII. Use `@auth` patterns (custom directives) consistently.

```javascript
app.use("/graphql", (req, res, next) => {
  req.gqlContext = { user: req.user };
  next();
});
```

#### Key Points

- Variables parameterize safely.
- Context carries auth, not arguments alone.
- Defense in depth: validation, limits, authz.

#### Best Practices

- Redact passwords and tokens from logs.
- Align GraphQL authz with REST resource rules.

#### Common Mistakes

- Exposing admin fields without checks in resolvers.
- Logging full variable blobs containing secrets.

---
