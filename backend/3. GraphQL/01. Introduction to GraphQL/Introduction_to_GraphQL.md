# Introduction to GraphQL

## 📑 Table of Contents

- [1.1 What is GraphQL?](#11-what-is-graphql)
  - [1.1.1 GraphQL Overview](#111-graphql-overview)
  - [1.1.2 Query Language for APIs](#112-query-language-for-apis)
  - [1.1.3 History and Background](#113-history-and-background)
  - [1.1.4 Why GraphQL?](#114-why-graphql)
  - [1.1.5 Use Cases](#115-use-cases)
- [1.2 GraphQL vs REST](#12-graphql-vs-rest)
  - [1.2.1 Comparison Overview](#121-comparison-overview)
  - [1.2.2 Advantages of GraphQL](#122-advantages-of-graphql)
  - [1.2.3 Disadvantages of GraphQL](#123-disadvantages-of-graphql)
  - [1.2.4 When to Use GraphQL](#124-when-to-use-graphql)
  - [1.2.5 When to Use REST](#125-when-to-use-rest)
- [1.3 GraphQL Core Concepts](#13-graphql-core-concepts)
  - [1.3.1 Strongly Typed Schema](#131-strongly-typed-schema)
  - [1.3.2 Query Language](#132-query-language)
  - [1.3.3 Single Endpoint](#133-single-endpoint)
  - [1.3.4 Real-time with Subscriptions](#134-real-time-with-subscriptions)
  - [1.3.5 Introspection](#135-introspection)
- [1.4 Getting Started](#14-getting-started)
  - [1.4.1 Installation Options](#141-installation-options)
  - [1.4.2 GraphQL Playground](#142-graphql-playground)
  - [1.4.3 GraphQL Client Setup](#143-graphql-client-setup)
  - [1.4.4 First Query](#144-first-query)
  - [1.4.5 Learning Roadmap](#145-learning-roadmap)

---

## 1.1 What is GraphQL?

### 1.1.1 GraphQL Overview

**Beginner:** GraphQL is a way to ask a server for exactly the data you need in one request. You write a **query** that looks like JSON (but is not JSON yet), and the server returns JSON that matches the shape of your query. Think of it as a menu: you pick fields, and the kitchen sends only those dishes.

**Intermediate:** GraphQL is a **specification** (maintained by the GraphQL Foundation) that defines a type system, query language, and execution algorithm. A **GraphQL service** exposes a **schema** describing available types and operations. Clients send **documents** (queries, mutations, subscriptions) to a single HTTP endpoint (typically); the server parses, validates against the schema, resolves fields, and returns a JSON object with `data` and optionally `errors`.

**Expert:** The execution model is **resolver-based**: each field in the response is produced by a resolver function (explicit or default). Resolution is **breadth-first** at each level; lists and nullable fields interact with the **null propagation** rules in the spec. GraphQL is transport-agnostic (HTTP, WebSockets, etc.) but HTTP POST with a JSON body is the most common. **Batching**, **DataLoader**, **federation**, and **security** (depth/complexity limits) are production concerns built around this core.

```graphql
# A minimal read operation: shape of response follows selection set
query OverviewExample {
  user(id: "1") {
    id
    name
    email
  }
}
```

```javascript
// Node.js: POST the document to a GraphQL HTTP endpoint
const fetch = require("node-fetch"); // or global fetch in Node 18+

async function runOverviewExample() {
  const response = await fetch("http://localhost:4000/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query OverviewExample {
          user(id: "1") { id name email }
        }
      `,
    }),
  });
  const json = await response.json();
  console.log(json.data);   // { user: { id, name, email } }
  console.log(json.errors); // undefined if valid
}

runOverviewExample().catch(console.error);
```

#### Key Points

- GraphQL is a **specification** for APIs, not a database or a framework.
- You request a **tree of fields**; the response mirrors that tree (with nulls where allowed).
- **Schema** + **resolvers** define what exists and how values are produced.

#### Best Practices

- Start by reading the official spec’s “Overview” and “Execution” sections for precise terminology.
- Treat GraphQL as a **contract**: evolve the schema with versioning strategies (`@deprecated`, additive changes).
- Log both **query text** and **variables** in development to debug client issues quickly.

#### Common Mistakes

- Confusing the **query syntax** with JSON (queries are strings; responses are JSON).
- Assuming GraphQL automatically solves **N+1** problems (you still design data access).
- Exposing internal database shapes **one-to-one** as the public API without domain modeling.

---

### 1.1.2 Query Language for APIs

**Beginner:** The “QL” means **query language**. You use keywords like `query`, `mutation`, and curly braces to describe what you want. Arguments go in parentheses: `user(id: "42")`.

**Intermediate:** The language has **operations** (query, mutation, subscription), **selection sets**, **fragments**, **variables** (`$id: ID!`), **directives** (`@include`, `@skip`), and **aliases**. The server validates your document **statically** against the schema before execution.

**Expert:** Parsers produce an **AST**; validation rules include scalar leaf checks, fragment spread constraints, and “fields on correct type.” **Defer/stream** (where supported) and **persisted queries** extend transport and caching strategies without changing the core field-resolution model.

```graphql
query UserWithVars($uid: ID!) {
  user(id: $uid) {
    id
    posts(first: 3) {
      edges {
        cursor
        node { title }
      }
    }
  }
}
```

```javascript
// Variables are sent separately from the query string (recommended)
const query = `
  query UserWithVars($uid: ID!) {
    user(id: $uid) {
      id
      posts(first: 3) {
        edges { cursor node { title } }
      }
    }
  }
`;

async function withVariables(uid) {
  const res = await fetch("http://localhost:4000/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { uid } }),
  });
  return res.json();
}

withVariables("42").then(console.log).catch(console.error);
```

#### Key Points

- Queries are **strings**; variables are a **JSON map** alongside them.
- The language is **hierarchical**, matching how UIs consume nested data.
- **Validation** happens before your resolvers run for invalid field/argument combinations.

#### Best Practices

- Always use **variables** instead of string-interpolating user input into the query text.
- Name operations (`query UserWithVars`) for logs, metrics, and debugging.
- Keep **selection sets** as small as possible for mobile and slow networks.

#### Common Mistakes

- Building queries with **template literals** and unsanitized user input (injection risk).
- Omitting the `query` keyword when using variables or multiple operations (anonymous operation rules).
- Treating **GraphQL errors** like HTTP errors only; partial data with `errors` is valid per spec.

---

### 1.1.3 History and Background

**Beginner:** GraphQL was created at **Facebook** around 2012 to power their mobile apps, then **open-sourced in 2015**. Today it is governed by the **GraphQL Foundation** under the Linux Foundation.

**Intermediate:** The design goals included **avoiding over-fetching**, **reducing round-trips**, and **strong typing** for large teams. Ecosystem growth produced **Apollo**, **Relay**, **GraphiQL/Playground**, **Prisma**, **GraphQL Code Generator**, and server implementations in Node (graphql-js), Java, Go, Ruby, etc.

**Expert:** The spec evolves via **RFC-style proposals** (e.g., **Scalar Specification**, **Stream/Defer**). **Apollo Federation** and **GraphQL Mesh** address multi-service graphs. **Security** research highlighted risks (introspection abuse, batch attacks), driving **allowlists**, **complexity limits**, and **gateway** patterns.

```graphql
# Historical "shape" problem GraphQL addressed: one request, nested data
query MobileFeed {
  viewer {
    friends(first: 10) {
      name
      profileImage { url width height }
    }
  }
}
```

```javascript
// Node.js timeline-style note: graphql package is the reference implementation
const { graphql, buildSchema } = require("graphql");

const schema = buildSchema(`
  type Query { ping: String }
`);

graphql({
  schema,
  source: "{ ping }",
  rootValue: { ping: "pong" },
}).then((result) => {
  console.log(result.data); // { ping: 'pong' }
});
```

#### Key Points

- GraphQL’s roots are in **product engineering** at scale, not academic theory only.
- **graphql-js** (`graphql` on npm) is the **reference** implementation in JavaScript.
- Governance moved to a **foundation** to ensure neutral evolution.

#### Best Practices

- Follow **official release notes** when upgrading `graphql` major versions.
- Prefer **spec-correct** behavior over framework-specific shortcuts when building libraries.
- Document **why** your public schema fields exist (product intent), not only types.

#### Common Mistakes

- Assuming **Facebook/Meta** still “owns” day-to-day decisions for every ecosystem tool.
- Pinning very old `graphql` versions and missing **security** and **validation** fixes.
- Choosing GraphQL because it is **trendy** rather than for **product/API fit**.

---

### 1.1.4 Why GraphQL?

**Beginner:** Teams pick GraphQL when **one screen needs many related pieces of data** and REST would mean many endpoints or huge payloads. You write **one query** and get **one JSON** response shaped for the UI.

**Intermediate:** GraphQL centralizes **API discovery** through the schema and **introspection** (often disabled in production). It supports **evolution** via additive schema changes and **deprecations**. Tooling (code generation, IDE plugins) improves **developer experience** for typed clients.

**Expert:** The tradeoff is **operational complexity**: query cost control, caching at the edge (harder than URL-based HTTP caching), and **resolver performance** tuning. GraphQL shines when **graph-shaped data**, **many clients**, and **rapid UI iteration** dominate; it is less compelling for **simple CRUD** with heavy HTTP caching needs.

```graphql
query WhyGraphQL_ProductPage($productId: ID!) {
  product(id: $productId) {
    title
    price { amount currency }
    reviews(first: 5) { rating body }
    related { id title }
  }
}
```

```javascript
// Express-style server sketch: one route handles arbitrary operations
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");

const app = express();

const schema = buildSchema(`
  type Query { hello: String }
`);

app.use(
  "/graphql",
  graphqlHTTP({ schema, rootValue: { hello: "world" }, graphiql: true })
);

app.listen(4000, () => console.log("http://localhost:4000/graphql"));
```

#### Key Points

- Primary wins: **client-driven selection**, **fewer round-trips**, **strong schema**.
- Costs: **caching**, **rate limiting**, and **server complexity** need deliberate design.
- **Why** should always tie to user/product metrics, not slogans.

#### Best Practices

- Measure **payload size** and **request count** before vs after a pilot.
- Pair GraphQL with **observability** (operation name, trace per resolver).
- Define **SLAs** for p95 latency early; GraphQL can hide fan-out until it hurts.

#### Common Mistakes

- Exposing **entire database** through auto-generated schemas without review.
- Ignoring **pagination** until lists explode.
- Using GraphQL to fix **organizational** problems (ownership, API design discipline).

---

### 1.1.5 Use Cases

**Beginner:** Common uses: **mobile apps**, **dashboards**, **BFFs** (backend-for-frontend), and **aggregating microservices** behind a **gateway**. Any UI that needs **nested** data is a candidate.

**Intermediate:** **Admin tools** benefit from introspection-driven UIs. **Partner APIs** may use GraphQL for flexible integrations (with strict authz). **Real-time** features use **subscriptions** over WebSockets (with careful scaling).

**Expert:** **Federated graphs** split ownership by **domain services** with a **supergraph**. **GraphQL at the edge** (CDN, partial caching) requires **normalized** caching clients (Relay/Apollo) and **stable entity keys**. For **highly cacheable public content**, consider **REST** or **CDN-friendly** patterns alongside GraphQL.

```graphql
subscription UseCaseOrderUpdates($userId: ID!) {
  orderStatusChanged(userId: $userId) {
    orderId
    status
    updatedAt
  }
}
```

```javascript
// Node: subscriptions often use graphql-ws or subscriptions-transport-ws with Apollo
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
const { execute, subscribe } = require("graphql");

// Pseudocode wiring — real apps compose schema + context + auth
function createSubscriptionServer(httpServer, schema) {
  const wsServer = new WebSocketServer({ server: httpServer, path: "/graphql" });
  return useServer({ schema, execute, subscribe }, wsServer);
}

const httpServer = createServer(/* express app */);
createSubscriptionServer(httpServer, /* your schema */);
httpServer.listen(4000);
```

#### Key Points

- **BFF + GraphQL** is a frequent pattern for web and mobile teams.
- **Subscriptions** are powerful but add **stateful** infrastructure concerns.
- **Federation** solves **service boundaries**, not team communication by itself.

#### Best Practices

- Start **narrow**: one product surface, one graph, clear ownership.
- Map **roles** to **field-level authorization** rules, not only to “API keys.”
- Document **which operations** are supported for third parties vs internal clients.

#### Common Mistakes

- Using subscriptions for **everything** (polling is sometimes simpler).
- Building a **god resolver** that knows about all microservices without boundaries.
- Skipping **pagination** and **limits** on list fields exposed to external users.

---

## 1.2 GraphQL vs REST

### 1.2.1 Comparison Overview

**Beginner:** REST usually means **many URLs** (`/users`, `/users/1/posts`) and HTTP verbs. GraphQL is usually **one URL** and you describe what you need in the **body**. Both can return JSON.

**Intermediate:** REST maps well to **resources** and **HTTP caching** (GET + URLs). GraphQL maps well to **product graphs** and **typed clients**. REST **over/under-fetching** is common; GraphQL mitigates selection but pushes complexity to **query cost** and **server resolvers**.

**Expert:** Hybrid architectures are normal: **REST for webhooks/CDN**, **GraphQL for apps**. **OpenAPI** and **JSON Schema** ecosystems are mature for REST; **GraphQL Codegen** bridges GraphQL to TypeScript. **Versioning** differs: REST often uses `/v1`; GraphQL favors **continuous evolution** of a single version with deprecations.

```graphql
# One operation, nested resources
query CompareGraphQL {
  me { id orders(first: 2) { totalCents } }
}
```

```javascript
// REST: multiple round-trips vs one GraphQL request (conceptual)
const fetch = require("node-fetch");

async function restStyle(userId) {
  const user = await (await fetch(`https://api.example.com/users/${userId}`)).json();
  const orders = await (
    await fetch(`https://api.example.com/users/${userId}/orders?limit=2`)
  ).json();
  return { user, orders };
}

async function graphQLStyle(userId) {
  const res = await fetch("https://api.example.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query { me { id orders(first:2){ totalCents } } }`,
      variables: {},
    }),
  });
  return res.json();
}
```

#### Key Points

- REST is **resource/verb-centric**; GraphQL is **field/graph-centric**.
- Neither replaces disciplined **authorization** or **domain design**.
- **Tooling** and **team habits** often matter more than the label on the API.

#### Best Practices

- Compare **p95 latency**, **payload sizes**, and **client complexity** empirically.
- Use **OpenAPI** or **GraphQL schema** as the **contract** in code review.
- Prefer **consistent error models** within whichever style you choose.

#### Common Mistakes

- Declaring “REST is dead” or “GraphQL solves everything.”
- Implementing GraphQL as **RPC over HTTP** with giant opaque fields (loses benefits).
- Ignoring **HTTP semantics** entirely when they still help (status codes for transport errors).

---

### 1.2.2 Advantages of GraphQL

**Beginner:** You get **less extra data**, **fewer requests** for nested screens, and **auto-documentation** from types. Frontend and backend can share **generated types**.

**Intermediate:** **Strong schema** enables **safe refactors** with codegen. **Fragments** colocate data needs with UI components. **Introspection** powers GraphiQL and schema registries.

**Expert:** **Batching** multiple operations in one HTTP call is possible (with caveats). **Federation** allows **independent teams** to own subgraphs. **Persisted queries** reduce payload size and attack surface. **Field-level metrics** clarify which parts of the graph are expensive.

```graphql
fragment ProductCard on Product {
  id
  title
  thumbnail { url }
}

query ShopWindow {
  featured {
    ...ProductCard
  }
}
```

```javascript
// Colocated fragment pattern with a client (conceptual)
const PRODUCT_CARD = `
  fragment ProductCard on Product {
    id
    title
    thumbnail { url }
  }
`;

// Many teams compose fragments in the client query at build time
const query = `
  query ShopWindow {
    featured { ...ProductCard }
  }
  ${PRODUCT_CARD}
`;
```

#### Key Points

- Advantages compound with **good schema design** and **tooling**.
- **Fragments** support **component-driven** data fetching in modern SPAs.
- **Type generation** closes the gap between client and server contracts.

#### Best Practices

- Invest in **linting** (`graphql-eslint`) and **schema checks** in CI.
- Track **field usage** to remove dead schema safely.
- Teach **all engineers** the difference between schema types and transport.

#### Common Mistakes

- Assuming advantages appear **without** resolver/data-layer work.
- Generating **giant** universal queries that stress the server.
- Skipping **pagination** because “the client can just ask for less.”

---

### 1.2.3 Disadvantages of GraphQL

**Beginner:** Learning curve: **new language**, **new debugging**. Errors can be confusing at first. Simple things might feel **more setup** than REST.

**Intermediate:** **HTTP caching** for GET is weaker for typical GraphQL POST setups. **File uploads** are not in the core spec (community patterns exist). **Rate limiting** is harder than “100 requests to /users.”

**Expert:** **Query complexity** attacks require **depth/cost limits**. **N+1** resolver issues need **DataLoader** or batching at the service layer. **Partial failure** semantics (nulls + errors) must be taught to client teams. **Subscription scaling** needs **pub/sub** infrastructure.

```graphql
# Deep queries illustrate why servers enforce depth limits
query Deep {
  a { b { c { d { e { f { name } } } } } } }
}
```

```javascript
// Naive resolvers cause N+1 (conceptual anti-pattern)
const resolvers = {
  Query: {
    authors: () => db.authors.findMany(),
  },
  Author: {
    books: (author) => db.books.findByAuthorId(author.id), // N+1 when listing authors
  },
};

// Better: batch in Author.books via DataLoader (see later topics)
```

#### Key Points

- Disadvantages cluster around **performance**, **security**, and **operations**.
- Many “GraphQL problems” are really **data access** or **architecture** problems.
- Mitigations exist; they require **engineering investment**.

#### Best Practices

- Add **complexity/depth** limits before public launch.
- Use **DataLoader** (or equivalent) per request for consistent batching.
- Document **error handling** for clients (network vs GraphQL errors).

#### Common Mistakes

- Going to production **without** limits or monitoring.
- Blaming GraphQL for **poor SQL** or missing **indexes**.
- Turning off **introspection** in dev (slows teams) without a replacement workflow.

---

### 1.2.4 When to Use GraphQL

**Beginner:** Use GraphQL when your app needs **flexible queries** and **nested data**, and when **many client platforms** share one API.

**Intermediate:** Strong fit for **product APIs** behind auth, **aggregating services**, and **rapid iteration** where REST versioning churns. Also when **type-safe clients** are a priority.

**Expert:** Use GraphQL when you can invest in **gateway**, **observability**, **schema governance**, and **client caching** strategy. If your API is **CDN-first public cache** with trivial payloads, REST may stay simpler. **GraphQL + microservices** often implies **federation** or **BFF** experience on the team.

```graphql
query WhenToUse($teamId: ID!) {
  team(id: $teamId) {
    members { user { name avatarUrl } role }
    projects { name milestones { dueDate } }
  }
}
```

```javascript
// Decision checklist encoded as comments for your ADR template
/*
  Choose GraphQL when:
  - Multiple clients need different shapes of the same domain
  - You want a single endpoint behind auth with strong typing
  - You accept operational cost of query analysis + resolver tuning

  Defer GraphQL when:
  - Heavy reliance on HTTP edge caching of GET resources
  - Very simple CRUD with stable clients and no nesting pain
*/
```

#### Key Points

- Fit is about **team capability** and **product shape**, not hype.
- **Pilot** one vertical slice before org-wide commitment.
- **Governance** is a prerequisite at scale.

#### Best Practices

- Write an **ADR** documenting alternatives (REST, gRPC, OpenAPI).
- Define **SLIs** for GraphQL operations (latency, error rate, cost).
- Plan **schema review** process before hundreds of types land.

#### Common Mistakes

- Mandating GraphQL **org-wide** without training.
- Using GraphQL for **binary/file** primary workflows without a plan.
- Skipping **pagination** because the first screen is small.

---

### 1.2.5 When to Use REST

**Beginner:** REST is great when each **resource** maps cleanly to a URL, you want **browser caching**, or your team already has **solid REST** patterns.

**Intermediate:** **Webhooks**, **simple public APIs**, **CDN assets**, and **third-party integrations** often favor REST/OpenAPI. **HTTP verbs** and **status codes** are universally understood.

**Expert:** **High-scale read-heavy** endpoints with **immutable URLs** benefit from **HTTP caching** and **edge** rules. **GraphQL can coexist**: REST for static or file-heavy paths, GraphQL for app-specific composition. **gRPC** may win for **internal** service-to-service RPC.

```javascript
// REST: explicit cache headers at the edge
const express = require("express");
const app = express();

app.get("/v1/articles/:slug", (req, res) => {
  res.set("Cache-Control", "public, max-age=60");
  res.json({ slug: req.params.slug, title: "Example" });
});
```

```graphql
# GraphQL can still read data produced by REST microservices in resolvers
# (schema stays GraphQL; upstream may be REST)
```

#### Key Points

- REST remains **excellent** for resource-oriented, cache-friendly APIs.
- **OpenAPI** tooling is mature for codegen, docs, and gateways.
- Polyglot APIs (REST + GraphQL) are **normal** in large systems.

#### Best Practices

- Use **consistent** resource naming and **hypermedia** or **links** where helpful.
- Prefer **204/201** etc. correctly; don’t put everything in 200.
- If adding GraphQL, **avoid duplicating** business rules in two styles without boundaries.

#### Common Mistakes

- Confusing **JSON HTTP APIs** with “REST” without hypermedia or clear resources.
- Using REST **verbs** incorrectly (e.g., GET with side effects).
- **Copying** REST DTOs 1:1 into GraphQL type names without domain thought.

---

## 1.3 GraphQL Core Concepts

### 1.3.1 Strongly Typed Schema

**Beginner:** Every field has a **type** (like `String` or `User`). You cannot ask for a field that does not exist on the type. The server checks your query **before** running it.

**Intermediate:** The schema defines **scalars**, **object types**, **interfaces**, **unions**, **enums**, **inputs**, and **directives**. **Nullability** (`!`) and **lists** (`[Type!]!`) are part of the type system.

**Expert:** Schema **SDL** (Schema Definition Language) can be merged from modules, **federated** with directives like `@key`, or generated from code. **Custom scalars** extend validation/serialization. **Schema stitching** composes remote schemas (legacy vs federation tradeoffs).

```graphql
schema {
  query: Query
}

type Query {
  me: User
}

type User {
  id: ID!
  email: String
  friends: [User!]!
}
```

```javascript
const { buildSchema } = require("graphql");

const schema = buildSchema(`
  type Query { ping: Int! }
`);

// Introspection: schema.getTypeMap(), schema.getQueryType(), etc.
console.log(schema.getQueryType().getFields().ping.type.toString()); // Int!
```

#### Key Points

- Types are the **contract** between client and server.
- **Nullability** is explicit; mistakes here drive production bugs.
- **Introspection** reflects the same schema clients should use.

#### Best Practices

- Prefer **`ID!`** for identifiers clients treat as opaque strings.
- Make **lists** non-null with nullable elements (`[User]!`) vs nullable lists (`[User!]`) deliberately.
- Run **breaking change detection** on schema evolution in CI.

#### Common Mistakes

- Using `String` for **everything** instead of enums and custom scalars.
- Overusing **non-null** (`!`) on fields that can fail independently.
- **Leaking** internal enum values that are not stable for clients.

---

### 1.3.2 Query Language

**Beginner:** You nest fields like JSON **without quotes on keys**. You can name your operation and reuse pieces with **fragments**.

**Intermediate:** **Aliases** rename fields in the response. **Directives** conditionally include fields. **Inline fragments** handle **interfaces/unions**.

**Expert:** **@defer/@stream** (where available) change delivery semantics. **Lexical grammar** is stable; parsers exist in many languages for **AST** transforms, **persisted query** hashing, and **linting**.

```graphql
query LanguageDemo {
  search(q: "graphql") {
    __typename
    ... on Article { title url }
    ... on Video { title durationSec }
  }
}
```

```javascript
const { parse } = require("graphql");

const doc = parse(`
  query LanguageDemo {
    search(q: "graphql") {
      __typename
      ... on Article { title url }
      ... on Video { title durationSec }
    }
  }
`);

console.log(doc.definitions[0].operation); // query
```

#### Key Points

- **__typename** disambiguates unions/interfaces in client caches.
- **Fragments** reduce duplication and align with UI components.
- **parse()** vs **execute()**: different stages of the pipeline.

#### Best Practices

- Teach **inline vs named fragments** early.
- Use **eslint-plugin-graphql** or `graphql-eslint` for query linting in CI.
- Keep **operation documents** in `.graphql` files for reuse.

#### Common Mistakes

- Forgetting **typename** on polymorphic lists in normalized caches.
- Using **string building** for fragments unsafely.
- **Over-aliasing** until responses become hard to consume.

---

### 1.3.3 Single Endpoint

**Beginner:** Instead of dozens of URLs, clients often call **`/graphql`** (name varies) for all operations.

**Intermediate:** The server **dispatches** by operation type inside the document. **GET** with `query` query-param is supported by some servers for caching, but **POST** is standard.

**Expert:** **API gateways** may expose GraphQL at `/api/graphql` with **auth**, **mTLS**, or **mocks**. **Router/supergraph** architectures forward to **subgraphs** while presenting one endpoint to clients.

```javascript
const express = require("express");
const app = express();

app.post("/graphql", express.json(), (req, res) => {
  const { query, variables, operationName } = req.body;
  // Pass to graphql.execute / Apollo / Yoga handler
  res.json({ data: null, errors: [{ message: "Not implemented in stub" }] });
});
```

```graphql
query OneEndpoint {
  health
}
```

#### Key Points

- **Single endpoint** simplifies client config; **routing** moves into the document.
- **Operation name** helps observability across one URL.
- **Security** shifts to **authz** and **query limits**, not path-based hiding.

#### Best Practices

- Always log **operationName** and a **stable hash** of the query in production.
- Consider **GET** only for **allowlisted** persisted queries if caching matters.
- Put **versioning** in headers or schema evolution, not `/v2/graphql` only.

#### Common Mistakes

- Assuming **one endpoint** means **one microservice** (often it is a gateway).
- **No rate limits** because “it’s one URL.”
- Returning **500** for all GraphQL errors (use **200** with `errors` for execution errors per common practice).

---

### 1.3.4 Real-time with Subscriptions

**Beginner:** **Subscriptions** let the server **push** updates when something changes, like new chat messages. Usually uses **WebSockets**.

**Intermediate:** The subscription **selects fields** like a query, but the **async iterator** yields events over time. **Filtering** often happens via subscription arguments and **pub/sub** topics.

**Expert:** **Scaling** requires **sticky sessions** or **shared** pub/sub (Redis, Kafka, managed services). **Authorization** must apply per event; **payload minimization** reduces bandwidth. **graphql-ws** is the modern protocol implementation for many stacks.

```graphql
subscription OnMessage($roomId: ID!) {
  messageAdded(roomId: $roomId) {
    id
    body
    sentAt
  }
}
```

```javascript
// Conceptual pub/sub bridge in Node
const { Redis } = require("ioredis");
const subscriber = new Redis(process.env.REDIS_URL);

function subscribeRoom(roomId, push) {
  const channel = `room:${roomId}`;
  subscriber.subscribe(channel, (err) => {
    if (err) console.error(err);
  });
  subscriber.on("message", (ch, message) => {
    if (ch === channel) push(JSON.parse(message));
  });
  return () => subscriber.unsubscribe(channel);
}
```

#### Key Points

- Subscriptions are **long-lived**; they change **capacity planning**.
- **Auth** for connect vs **auth** per event are both required.
- Choose **protocol** (`graphql-ws`) consistently across clients and servers.

#### Best Practices

- Keep subscription payloads **small**; let clients refetch heavy data if needed.
- Use **idempotent** event IDs for client reconciliation.
- Monitor **open connection** counts and **heartbeat** health.

#### Common Mistakes

- Treating subscriptions like **unbounded** firehoses without throttling.
- **Leaking** events across tenants due to bad topic naming.
- No **reconnect/backoff** strategy in mobile clients.

---

### 1.3.5 Introspection

**Beginner:** Introspection lets tools **ask the server** what types and fields exist—this powers **autocomplete** in GraphiQL.

**Intermediate:** The `__schema` and `__type` fields are **built-in**. **Introspection queries** are regular GraphQL queries returning metadata about your API.

**Expert:** **Disable introspection in production** if policy requires, but provide **schema artifacts** (SDL file, registry) for clients. **Apollo Studio** and **Hive** use introspection or schema upload. **Custom directives** appear in introspection for codegen.

```graphql
query IntrospectTypes {
  __schema {
    types { name kind }
  }
}
```

```javascript
const { getIntrospectionQuery, buildClientSchema, printSchema } = require("graphql");

const introspectionQuery = getIntrospectionQuery();

// After fetching introspectionResult from server:
// const schema = buildClientSchema(introspectionResult.data);
// console.log(printSchema(schema));
```

#### Key Points

- Introspection is **powerful for DX** and **dangerous if abused** publicly.
- **SDL export** is often the CI source of truth.
- **Client** tooling depends on **accurate** introspection results.

#### Best Practices

- Store **`schema.graphql`** in repo or registry on every deploy.
- Use **persisted queries** + **disable introspection** for some public APIs.
- **Redact** sensitive descriptions if SDL leaks implementation details.

#### Common Mistakes

- Relying on production introspection when **offline codegen** should use artifacts.
- **Forgetting** to update published schema after deploy.
- Assuming **all tools** need runtime introspection (they do not).

---

## 1.4 Getting Started

### 1.4.1 Installation Options

**Beginner:** In Node, you typically `npm install graphql` plus a server integration: **Apollo Server**, **GraphQL Yoga**, **express-graphql** (legacy), or **Mercurius** (Fastify).

**Intermediate:** Choose based on **framework** (Express, Fastify, Nest), **subscriptions** needs, **federation** support, and **deployment** model (serverless vs long-running).

**Expert:** **graphql-js** is the engine; frameworks add **middleware**, **plugins**, **tracing**, and **federation**. **pnpm workspaces** and **monorepos** often pin a **single graphql version** across packages to avoid duplicate instances.

```bash
# Example: new project dependencies (run in your project directory)
npm install graphql @apollo/server
```

```javascript
// package.json dependencies (illustrative)
// "graphql": "^16.8.1",
// "@apollo/server": "^4.10.0"
```

#### Key Points

- Pin **one** `graphql` version across the monorepo.
- **Peer dependency** warnings often mean duplicate `graphql` copies.
- **Server choice** affects **subscription** and **federation** ergonomics.

#### Best Practices

- Use **lockfiles** and **automated updates** with changelog review.
- Start with **official quickstarts** for your framework.
- Add **TypeScript** early if the team uses codegen heavily.

#### Common Mistakes

- Installing **incompatible** Apollo and `graphql` major pairs.
- Mixing **two servers** on the same process without clear routing.
- Ignoring **Node LTS** support matrices for your server library.

---

### 1.4.2 GraphQL Playground

**Beginner:** **GraphiQL** / **Apollo Sandbox** / legacy **Playground** are web UIs to write queries and see docs. They connect to your local server.

**Intermediate:** Configure **CSRF**, **auth headers**, and **environment variables** for staging URLs. **Playground** is largely superseded by **GraphiQL** or **Apollo Studio Explorer**.

**Expert:** **Embed GraphiQL** behind **auth** in internal tools. **Disable** in production public APIs or protect with **VPN**. **Custom plugins** add headers, mocks, and operation collections.

```javascript
// Apollo Server 4 enables landing page / explorer in dev
// const { ApolloServer } = require("@apollo/server");
// const { startStandaloneServer } = require("@apollo/server/standalone");
//
// const server = new ApolloServer({ typeDefs, resolvers });
// const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });
```

```graphql
query PlaygroundPing {
  __typename
}
```

#### Key Points

- IDEs **lower the learning curve** for queries and introspection.
- **Never** expose unauthenticated Playground to the public internet for sensitive APIs.
- **Operation collections** help QA reproduce bugs.

#### Best Practices

- Check **introspection** settings per environment.
- Store **example queries** in the repo under `/operations`.
- Teach **variables** panel usage on day one.

#### Common Mistakes

- Committing **production tokens** in saved Playground headers.
- Using Playground as the **only** documentation (add prose docs for flows).
- **CORS** misconfiguration blocking local browser access.

---

### 1.4.3 GraphQL Client Setup

**Beginner:** Popular clients: **Apollo Client**, **Relay**, **urql**, or plain **`fetch`**. They attach **caching** and **devtools**.

**Intermediate:** Configure **HTTP link**, **auth link** (JWT), **error policies**, and **cache policies** (Apollo `InMemoryCache`, Relay store).

**Expert:** **Normalized caches** need **`id` + `__typename`**. **SSR** frameworks (Next.js) require **hydration** discipline. **Codegen** with **fragments** enforces colocation.

```javascript
const { ApolloClient, InMemoryCache, HttpLink } = require("@apollo/client");
const fetch = require("cross-fetch");

const client = new ApolloClient({
  link: new HttpLink({ uri: "http://localhost:4000/graphql", fetch }),
  cache: new InMemoryCache(),
});

// client.query({ query, variables })
```

```graphql
query ClientSetupMe {
  me { id name }
}
```

#### Key Points

- **Client cache** is as important as the server for perceived performance.
- **Links/middleware** centralize **auth** and **retries**.
- **Codegen** reduces runtime typos in operation documents.

#### Best Practices

- Use **`fetchPolicy`** intentionally (`cache-first` vs `network-only`).
- Centralize **error handling** for UNAUTHENTICATED GraphQL errors.
- Version **client operations** with the schema in CI.

#### Common Mistakes

- **Disabling cache** everywhere instead of fixing **cache IDs**.
- Storing **sensitive** data in persistent caches on shared devices.
- **Duplicating** fetch logic in every component without a client.

---

### 1.4.4 First Query

**Beginner:** Run a **hello world** query: `{ hello }` after defining `hello` on `Query` in the schema.

**Intermediate:** Add **variables**, **operation name**, and inspect **`errors` array** when you intentionally break a field.

**Expert:** Trace the path **parse → validate → execute** in dev with logging middleware; set up **jest** tests using `graphql()` function for unit testing schema.

```graphql
query FirstQuery {
  hello
}
```

```javascript
const { buildSchema, graphql } = require("graphql");

const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

graphql({
  schema,
  source: "query FirstQuery { hello }",
  rootValue: { hello: () => "Hello, GraphQL!" },
}).then((r) => console.log(JSON.stringify(r, null, 2)));
```

#### Key Points

- Your **first query** should include **operation name** and **variables** habits.
- **`graphql()`** is enough for tests without HTTP.
- **Separation** of schema (`typeDefs`) and resolvers is a common pattern.

#### Best Practices

- Write a **smoke test** query in CI against a **staging** schema.
- Use **graphql-tag** or `.graphql` files for static analysis.
- Pair first query with **first mutation** to learn argument patterns.

#### Common Mistakes

- Using **GraphQL** without **git** tracking the schema SDL.
- **Hardcoding** URLs in clients; use **env** config.
- Ignoring **`errors[0].extensions`** when servers attach codes.

---

### 1.4.5 Learning Roadmap

**Beginner:** Next steps: **SDL**, **types/fields**, **arguments**, **mutations**, then **error handling** and **pagination**.

**Intermediate:** Deepen on **DataLoader**, **context**, **authz**, **testing**, **codegen**, and **Apollo/Relay** caching.

**Expert:** Study **federation**, **security limits**, **performance tracing**, **subscription scaling**, and **schema governance** (linting, breaking change checks).

```graphql
# Roadmap reminder query: mix features as you learn
query RoadmapPractice($id: ID!) {
  node(id: $id) {
    __typename
    id
  }
}
```

```javascript
const roadmap = [
  "Schema & SDL",
  "Resolvers & context",
  "Arguments & input types",
  "Errors & partial results",
  "Pagination (connections)",
  "DataLoader batching",
  "Authn/z patterns",
  "Production hardening",
];

console.log(roadmap.join(" → "));
```

#### Key Points

- **Foundations** (schema + execution) beat framework churn.
- **Build** a toy API with **lists**, **mutations**, and **errors** early.
- **Operate** GraphQL only after **metrics** exist.

#### Best Practices

- Re-read the **GraphQL spec** sections as you implement each feature.
- Contribute **example operations** to internal docs as you learn.
- Pair **frontend** and **backend** engineers on schema reviews.

#### Common Mistakes

- Jumping to **federation** before **single-graph** mastery.
- Skipping **pagination** “until later.”
- Learning only **Apollo** APIs without understanding **`graphql-js`**.

---

## Summary: Introduction Module

This module established **what** GraphQL is, **how** it compares to REST, **core concepts** (schema, language, endpoint, subscriptions, introspection), and **practical first steps** in Node.js. Continue with **GraphQL Basics** for transport, execution flow, and common patterns, then **SDL** and **Types/Fields** for authoritative schema craft.
