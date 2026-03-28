# Testing

## 📑 Table of Contents

- [24.1 Testing Fundamentals](#241-testing-fundamentals)
  - [24.1.1 Test Structure](#2411-test-structure)
  - [24.1.2 Test Organization](#2412-test-organization)
  - [24.1.3 Test Naming](#2413-test-naming)
  - [24.1.4 Test Utilities](#2414-test-utilities)
  - [24.1.5 Testing Best Practices](#2415-testing-best-practices)
- [24.2 Query Testing](#242-query-testing)
  - [24.2.1 Simple Query Tests](#2421-simple-query-tests)
  - [24.2.2 Query with Arguments](#2422-query-with-arguments)
  - [24.2.3 Query Variables](#2423-query-variables)
  - [24.2.4 Query Error Testing](#2424-query-error-testing)
  - [24.2.5 Query Response Validation](#2425-query-response-validation)
- [24.3 Mutation Testing](#243-mutation-testing)
  - [24.3.1 Simple Mutation Tests](#2431-simple-mutation-tests)
  - [24.3.2 Mutation with Input](#2432-mutation-with-input)
  - [24.3.3 Mutation Error Testing](#2433-mutation-error-testing)
  - [24.3.4 Mutation Side Effects](#2434-mutation-side-effects)
  - [24.3.5 Rollback Testing](#2435-rollback-testing)
- [24.4 Subscription Testing](#244-subscription-testing)
  - [24.4.1 Subscription Connection Testing](#2441-subscription-connection-testing)
  - [24.4.2 Event Publishing](#2442-event-publishing)
  - [24.4.3 Message Reception](#2443-message-reception)
  - [24.4.4 Disconnection Handling](#2444-disconnection-handling)
  - [24.4.5 Error Handling](#2445-error-handling)
- [24.5 Resolver Testing](#245-resolver-testing)
  - [24.5.1 Unit Testing Resolvers](#2451-unit-testing-resolvers)
  - [24.5.2 Mocking Dependencies](#2452-mocking-dependencies)
  - [24.5.3 Context Testing](#2453-context-testing)
  - [24.5.4 DataLoader Testing](#2454-dataloader-testing)
  - [24.5.5 Integration Testing](#2455-integration-testing)
- [24.6 End-to-End Testing](#246-end-to-end-testing)
  - [24.6.1 API Testing](#2461-api-testing)
  - [24.6.2 Client Testing](#2462-client-testing)
  - [24.6.3 Authentication Testing](#2463-authentication-testing)
  - [24.6.4 Authorization Testing](#2464-authorization-testing)
  - [24.6.5 Performance Testing](#2465-performance-testing)
- [24.7 Advanced Testing](#247-advanced-testing)
  - [24.7.1 Snapshot Testing](#2471-snapshot-testing)
  - [24.7.2 Schema Testing](#2472-schema-testing)
  - [24.7.3 Contract Testing](#2473-contract-testing)
  - [24.7.4 Load Testing](#2474-load-testing)
  - [24.7.5 Security Testing](#2475-security-testing)

---

## 24.1 Testing Fundamentals

### 24.1.1 Test Structure

#### Beginner

A GraphQL test usually **arranges** context/data, **acts** by executing a document against a schema or server, and **asserts** on `data` and `errors`. Use **`describe` / `it`** blocks (Jest/Vitest) for readability.

#### Intermediate

Separate **unit** tests (pure resolvers) from **integration** tests (in-memory or test DB) and **e2e** (HTTP). Share **fixture** builders for users and posts. Keep tests **deterministic**—no real network unless marked `@network`.

#### Expert

Model **given/when/then** with table-driven cases for permission matrices. Use **transaction rollbacks** per test for DB isolation. **Parallel** test runs require unique DB schemas or transaction scoping per worker.

```javascript
import { graphql } from "graphql";
import { schema } from "../schema";

it("returns hello", async () => {
  const res = await graphql({
    schema,
    source: `{ hello }`,
    contextValue: {},
  });
  expect(res.errors).toBeUndefined();
  expect(res.data.hello).toBe("world");
});
```

```graphql
query Smoke {
  hello
}
```

#### Key Points

- Structure tests so failures pinpoint layer (parse, validate, execute).
- One logical behavior per `it` block when possible.
- GraphQL returns 200 with `errors`—assert both shape and HTTP if testing transport.

#### Best Practices

- Use `expect(res).toMatchObject({ data: ... })` for partial matching.
- Avoid testing implementation details of resolver internals in e2e.
- Clean up timers, servers, and Redis keys in `afterEach`.

#### Common Mistakes

- Asserting only `!res.errors` while `data` is null.
- Sharing mutable global schema between tests that mutate resolvers.
- Missing `await` on async `graphql()` calls.

---

### 24.1.2 Test Organization

#### Beginner

Folder layout: `__tests__/resolvers/`, `__tests__/integration/`, `__tests__/e2e/`. Co-locate small unit tests as `user.test.js` next to `user.js` if your team prefers.

#### Intermediate

**Colocation** scales for units; **central integration** folder avoids spinning up multiple servers. Use **`setupFilesAfterEnv`** for Jest to configure timeouts and matchers.

#### Expert

**Package boundaries**: test public GraphQL surface per service; **contract tests** live in `contracts/`. **Nx/Vitest** projects with **tags** enforce which tests run in CI stages (fast vs slow).

```text
src/
  schema/
    index.js
  resolvers/
    post.js
__tests__/
  integration/
    posts.int.test.js
  e2e/
    api.e2e.test.js
```

```graphql
# __tests__/fixtures/queries/postById.graphql
query PostById($id: ID!) {
  post(id: $id) {
    id
    title
  }
}
```

#### Key Points

- Organization should mirror deployment units for microservices.
- Fast feedback loops depend on splitting unit vs e2e CI jobs.
- Fixture files keep large GraphQL documents out of JS strings.

#### Best Practices

- Name files `*.int.test.js` / `*.e2e.test.js` for glob runners.
- Document where to add a new test type in CONTRIBUTING.
- Keep `node_modules` test utils in `test-utils/` package in monorepos.

#### Common Mistakes

- One giant `all.test.js` file conflict-prone in Git.
- E2E tests importing internal resolver files directly (bypasses HTTP layer).
- Circular imports between tests and production code.

---

### 24.1.3 Test Naming

#### Beginner

Names read like specs: **`it('returns 401 when token missing')`**. Include **operation** and **condition**. Avoid vague `it('works')`.

#### Intermediate

Prefix with layer: **`[resolver] User.email redacts for non-admin`**. For table-driven tests, include **case** in each row’s `name` property.

#### Expert

Align names with **Gherkin** features for BDD teams. **CI** flaky test quarantine lists use stable names—avoid random suffixes. **Snapshot** titles derive from test name—keep concise.

```javascript
describe("Mutation.login", () => {
  it("returns UNAUTHENTICATED when password is wrong", async () => {
    // ...
  });

  it("returns AuthPayload when credentials valid", async () => {
    // ...
  });
});
```

```graphql
mutation Login($e: String!, $p: String!) {
  login(email: $e, password: $p) {
    accessToken
  }
}
```

#### Key Points

- Good names document intent when assertions fail.
- Consistent vocabulary (`returns`, `throws`, `emits`) helps scanning.
- Operation name in describe block maps to schema navigation.

#### Best Practices

- Avoid implementation names (`calls findUser`) in e2e titles.
- Use `test.each` for matrix naming uniformity.
- Review test names in PR as closely as code.

#### Common Mistakes

- Identical names in nested describes causing confusion in reports.
- Overly long names wrapping awkwardly—split describe blocks instead.
- Numbered tests `test 1` after copy-paste.

---

### 24.1.4 Test Utilities

#### Beginner

Create **`executeOperation({ document, variables, context })`** wrapping `graphql()` or Apollo **`executeHTTPGraphQLRequest`**. Factory **`makeTestContext({ user })`** standardizes auth.

#### Intermediate

**@graphql-tools/schema** `makeExecutableSchema` for partial schemas in isolation. **`graphql-tag`** for multiline documents. **Supertest** for Express + Apollo integration.

#### Expert

**Test double** of `PubSub` with synchronous dispatch. **In-memory SQLite** + Prisma migrate for resolver integration. **OpenTelemetry** test exporter to assert spans on resolver path.

```javascript
import { graphql } from "graphql";

export async function gql(schema, source, contextValue, variableValues) {
  return graphql({ schema, source, contextValue, variableValues });
}

export function ctx(user = null) {
  return { user, db: testDb, loaders: buildLoaders(testDb) };
}
```

```graphql
query Me {
  me {
    id
  }
}
```

#### Key Points

- Utilities reduce boilerplate and inconsistency.
- Context factory prevents “forgot to pass user” bugs in tests.
- Keep utils thin—complex logic belongs in helpers with tests.

#### Best Practices

- Version utilities alongside breaking schema changes.
- TypeScript generics for typed context in tests.
- Export `seedDatabase()` with minimal rows per suite.

#### Common Mistakes

- Utils hiding assertion failures with broad try/catch.
- Different execute helpers in different packages diverging behavior.
- Context factory including production secrets.

---

### 24.1.5 Testing Best Practices

#### Beginner

Test **happy path** and **one failure** per feature first. Add **edge** cases when bugs appear. Run **`npm test`** in pre-push hooks for small repos.

#### Intermediate

**Coverage** targets for resolvers (not blindly 100%). **Mutation tests** assert DB state, not only GraphQL response. **Freeze time** with `@sinonjs/fake-timers` for TTL logic.

#### Expert

**Mutation testing** (Stryker) on authorization helpers. **Property-based** testing (fast-check) for input validation. **Chaos** tests kill DB mid-request for resilience documentation.

```javascript
import { jest } from "@jest/globals";

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-01-01T00:00:00Z"));
});

afterEach(() => {
  jest.useRealTimers();
});
```

```graphql
type Query {
  now: String
}
```

#### Key Points

- Tests are living documentation—keep them trustworthy.
- Flaky tests erode confidence—fix or delete quickly.
- GraphQL encourages many code paths—prioritize risk-based testing.

#### Best Practices

- Run slow tests nightly, fast tests on every PR.
- Tag tests `security` for mandatory gates.
- Review test code with same rigor as production.

#### Common Mistakes

- Testing mock behavior instead of real integration behavior exclusively.
- Ignoring subscription and websocket paths until production incident.
- Sharing production database URLs in `.env.test` by accident.

---

## 24.2 Query Testing

### 24.2.1 Simple Query Tests

#### Beginner

Execute a **string query** with no variables; assert `data` shape. Use **`graphql`** for in-process tests without HTTP.

#### Intermediate

Validate **errors** array is empty for success cases. Snapshot **extensions** if tracing enabled in dev. Compare **strict** vs **partial** matchers depending on stability.

#### Expert

**Federated** queries: integration test with **gateway** and **stitched** subgraphs using **nock** for downstream HTTP or test doubles.

```javascript
const GET_HELLO = `
  query {
    hello
  }
`;

it("simple query", async () => {
  const res = await graphql({ schema, source: GET_HELLO });
  expect(res).toEqual({ data: { hello: "world" } });
});
```

```graphql
query {
  hello
}
```

#### Key Points

- Simple queries validate schema wiring and root resolvers.
- In-process tests are faster than HTTP for tight loops.
- Still upgrade to HTTP tests for middleware interactions.

#### Best Practices

- Name operations in documents for better errors: `query Hello { hello }`.
- Assert `errors` is undefined vs empty array consistently.
- Use `expect.objectContaining` for evolving schemas.

#### Common Mistakes

- Typo in field name masked by nullable parent returning null.
- Not awaiting full execution when using lazy resolvers with promises.
- Testing only `JSON.stringify(res)`—brittle ordering.

---

### 24.2.2 Query with Arguments

#### Beginner

Pass **`variableValues`** to `graphql()` for `post(id: $id)`. Assert correct **ID** returns object; bad ID returns `null` or `NOT_FOUND` per API design.

#### Intermediate

Test **coercion** rules: int/string for IDs. **Invalid enum** arguments should yield validation errors before execution.

#### Expert

**Injection** attempts in string args should be safely parameterized—assert DB query receives bound params via mock ORM spy.

```javascript
const DOC = `
  query ($id: ID!) {
    post(id: $id) {
      title
    }
  }
`;

it("fetches post by id", async () => {
  const res = await graphql({
    schema,
    source: DOC,
    contextValue: ctx(),
    variableValues: { id: "p1" },
  });
  expect(res.data.post.title).toBe("T1");
});
```

```graphql
query Post($id: ID!) {
  post(id: $id) {
    title
  }
}
```

#### Key Points

- Arguments are the primary attack surface—test validation paths.
- Variable maps must match operation signature types.
- Nullable vs non-null arguments change error behavior.

#### Best Practices

- Table of invalid inputs: wrong type, missing required, unknown enum.
- Use realistic IDs from seed data.
- Test default argument values if used in schema.

#### Common Mistakes

- Passing variables as strings instead of proper JSON types (`"123"` vs `123`).
- Only testing happy path IDs.
- Forgetting to test `null` for optional args.

---

### 24.2.3 Query Variables

#### Beginner

**Variables** separate query text from user input. Tests should pass **`variableValues`** object and ensure **operation** uses them.

#### Intermediate

Multiple operations in one document require **`operationName`**. Test **missing variable** for required `!` types → `Variable "$id" of required type "ID!" was not provided`.

#### Expert

**Default variables** in `@graphql-tools/mock` scenarios. **Complex input** variables: test deep partial updates and unknown keys rejection if using strict validation.

```javascript
import { graphql } from "graphql";

const res = await graphql({
  schema,
  source: `
    query Q($first: Int) {
      posts(first: $first) {
        id
      }
    }
  `,
  variableValues: { first: 2 },
});
```

```graphql
query Q($first: Int) {
  posts(first: $first) {
    id
  }
}
```

#### Key Points

- Variables are validated against operation before execution.
- Operation name disambiguates batch documents in tools and tests.
- Default values belong in SDL; tests should cover defaults explicitly.

#### Best Practices

- Serialize variables as clients would (JSON).
- Test unicode and large strings in variable boundaries.
- Validate error messages only loosely (codes > exact text).

#### Common Mistakes

- Using same variable name across operations without operationName.
- Testing with variables inlined into query string—does not match clients.
- Ignoring `variableValues: undefined` vs `{}` differences in tooling.

---

### 24.2.4 Query Error Testing

#### Beginner

Expect **`errors[0].extensions.code`** for domain errors (`NOT_FOUND`, `FORBIDDEN`). GraphQL execution may return **partial data** with errors.

#### Intermediate

Distinguish **syntax** errors (parse), **validation** errors, and **execution** errors. Use **`graphql`** `validate()` separately when unit testing rules.

#### Expert

**Federation** errors: assert `extensions` include **serviceName** when subgraph fails. **Sanitized** production errors—test that stack traces are stripped via `formatError`.

```javascript
it("returns FORBIDDEN", async () => {
  const res = await graphql({
    schema,
    source: `{ secret }`,
    contextValue: ctx(null),
  });
  expect(res.errors?.[0].extensions.code).toBe("FORBIDDEN");
  expect(res.data.secret).toBeNull();
});
```

```graphql
type Query {
  secret: String
}
```

#### Key Points

- Error tests prevent regressions in security messaging.
- Partial results need assertions on both `data` and `errors`.
- Validation errors should not hit resolvers—spy to confirm.

#### Best Practices

- Never assert full error `message` strings if i18n or formatting changes.
- Use custom matchers `expectGraphqlError(res, 'FORBIDDEN')`.
- Test error paths for each resolver throwing.

#### Common Mistakes

- Assuming `errors` is always a single element.
- Not testing `locations` for syntax errors in developer tools.
- Swallowing errors in test utilities.

---

### 24.2.5 Query Response Validation

#### Beginner

Use **`expect(res.data).toEqual({ ... })`** for exact match or **`toMatchObject`** for subset. Avoid **order** assumptions unless schema guarantees sorting.

#### Intermediate

Validate **pagination** cursors: opaque strings round-trip. **Custom scalars** return as strings in JSON—assert format with regex.

#### Expert

**JSON Schema** validation of responses for public APIs. **GraphQL** result **normalization** tests for clients (Apollo cache) using `cache.extract()`.

```javascript
import { validate } from "jsonschema";

it("matches response schema", () => {
  const res = { data: { posts: [{ id: "1", title: "A" }] } };
  const v = validate(res.data, {
    type: "object",
    properties: {
      posts: { type: "array", items: { required: ["id", "title"] } },
    },
    required: ["posts"],
  });
  expect(v.errors).toHaveLength(0);
});
```

```graphql
query {
  posts {
    id
    title
  }
}
```

#### Key Points

- Response validation catches accidental nulls and renames.
- Order-sensitive lists should be sorted in query or assertion.
- Schema drift in clients is reduced by contract tests (see 24.7.3).

#### Best Practices

- Build **factories** for expected nested trees.
- For large responses, assert critical subtrees only.
- Snapshot only stable fields; exclude timestamps or random IDs.

#### Common Mistakes

- Strict equality on objects with extra resolver-added fields.
- Comparing floats without delta.
- Validating introspection responses in CI against production—too noisy.

---

## 24.3 Mutation Testing

### 24.3.1 Simple Mutation Tests

#### Beginner

Call **`graphql()`** with `mutation { createPost(title: "Hi") { id } }`. Assert returned **id** and DB row exists if integration test.

#### Intermediate

Use **anonymous mutations** only in tests; real clients name operations for logs. Verify **side effect** tables (audit log rows).

#### Expert

**Idempotency** keys: send same `clientMutationId` twice; assert single resource. **Optimistic** UI not tested server-side, but **conflict** errors should be tested.

```javascript
const M = `
  mutation {
    createPost(title: "T") {
      id
      title
    }
  }
`;

it("creates post", async () => {
  const res = await graphql({ schema, source: M, contextValue: ctx(user) });
  expect(res.errors).toBeUndefined();
  expect(res.data.createPost.title).toBe("T");
});
```

```graphql
mutation {
  createPost(title: "T") {
    id
    title
  }
}
```

#### Key Points

- Mutations change state—tests need isolation (transactions/truncate).
- Always assert both GraphQL layer and persistence when integration testing.
- Naming mutations aids debugging in Apollo Studio logs.

#### Best Practices

- `beforeEach` seed minimal users; `afterEach` cleanup.
- Use unique titles/slugs to avoid collisions in parallel tests.
- Test concurrent mutations if business rules require serializability.

#### Common Mistakes

- Leaving data in shared DB breaking other tests.
- Not testing unauthenticated mutation attempts.
- Assuming returned object includes fields not requested in selection set.

---

### 24.3.2 Mutation with Input

#### Beginner

Use **`input` objects** matching `CreatePostInput`. Pass nested **`variableValues`**. Assert validation errors for bad input.

#### Intermediate

**Partial updates**: only provided fields change; test omitted fields remain. **Null vs omit** semantics per your resolver conventions.

#### Expert

**Complexity**: large input arrays—test max length enforcement at validation layer. **Sanitization** strips HTML from `body` field—assert stored value.

```javascript
const M = `
  mutation ($input: CreatePostInput!) {
    createPost(input: $input) {
      id
    }
  }
`;

await graphql({
  schema,
  source: M,
  contextValue: ctx(user),
  variableValues: { input: { title: "Hi", tags: ["a", "b"] } },
});
```

```graphql
input CreatePostInput {
  title: String!
  tags: [String!]
}

type Mutation {
  createPost(input: CreatePostInput!): Post!
}
```

#### Key Points

- Input types centralize validation—test each constraint.
- Variables must match input shape exactly (nested objects).
- File uploads use multipart—separate test harness (e.g., apollo-server-testing).

#### Best Practices

- Property-based generation of invalid inputs for fuzzing.
- Assert error `extensions` include `field` hints if you implement them.
- Version inputs (`CreatePostInputV2`) with parallel tests during migration.

#### Common Mistakes

- Testing only valid inputs.
- Confusing GraphQL `null` with key omission in JSON.
- Huge inline input JSON in test hurting readability—use variables file.

---

### 24.3.3 Mutation Error Testing

#### Beginner

Trigger **business rule** violations (`title too short`) and assert `BAD_USER_INPUT` or custom code. Ensure **no partial commit** if transactional.

#### Intermediate

**Unique constraint** violations from DB should map to user-safe GraphQL errors, not raw PG errors.

#### Expert

**Optimistic locking**: `version` mismatch returns conflict. **Rate limit** exceeded returns `TOO_MANY_REQUESTS` with retry-after extension.

```javascript
it("rejects empty title", async () => {
  const res = await graphql({
    schema,
    source: `mutation { createPost(input: { title: "" }) { id } }`,
    contextValue: ctx(user),
  });
  expect(res.errors?.[0].extensions.code).toBe("BAD_USER_INPUT");
});
```

```graphql
type Mutation {
  createPost(input: CreatePostInput!): Post!
}
```

#### Key Points

- Error codes are API contracts—test them.
- Transaction boundaries: failed mutation should not leave orphan rows.
- Map internal codes consistently in `formatError`.

#### Best Practices

- Spy logger to ensure internal details logged but not returned.
- Test DB down scenario with dependency injection mock.
- Include i18n key in extensions if applicable.

#### Common Mistakes

- Asserting raw SQL error text leaked to client.
- Not testing foreign key violations on relational creates.
- Single test asserting multiple unrelated error conditions.

---

### 24.3.4 Mutation Side Effects

#### Beginner

After mutation, **query** DB or secondary store: email outbox row created, **cache** invalidated (spy). Side effects include **webhooks** and **events**.

#### Intermediate

**Mock** `sendEmail` and assert called with recipient. **Queue** job pushed—use in-memory queue in tests.

#### Expert

**Saga** patterns: assert compensating transaction invoked on downstream failure. **Event sourcing** append-only log has expected event type and payload version.

```javascript
const sendEmail = jest.fn();

it("sends welcome email", async () => {
  await graphql({
    schema,
    source: `mutation { register(input: { email: "a@b.com", password: "x" }) { id } }`,
    contextValue: ctx({ sendEmail }),
  });
  expect(sendEmail).toHaveBeenCalledWith(
    expect.objectContaining({ to: "a@b.com", template: "welcome" })
  );
});
```

```graphql
type Mutation {
  register(input: RegisterInput!): User!
}
```

#### Key Points

- Side effects are where bugs hide—email, billing, search index.
- Use interfaces in context for test doubles.
- Async side effects may need `await flushPromises()` patterns.

#### Best Practices

- Reset mocks in `afterEach`.
- Test “no email when flag off” explicitly.
- For Kafka, use testcontainers or embedded broker selectively.

#### Common Mistakes

- Testing with real third-party APIs in CI.
- Not awaiting asynchronous handlers attached to mutation resolution.
- Assuming order of side effects when not guaranteed.

---

### 24.3.5 Rollback Testing

#### Beginner

Open **transaction** in `beforeEach`, pass transactional client in context, **rollback** in `afterEach` so mutations do not persist.

#### Intermediate

If using **real commits**, use **truncate** or **delete** with FK order. Test application-level **rollback** when second step fails after first succeeded.

#### Expert

**Distributed transactions**: simulate failure after remote call; assert **outbox** state consistent. **Prisma** interactive transaction tests with `throw` mid-block.

```javascript
await prisma.$transaction(async (tx) => {
  const post = await tx.post.create({ data: { title: "T" } });
  await tx.comment.create({ data: { postId: post.id, body: "C" } });
  throw new Error("rollback test");
}).catch(() => {});
const count = await prisma.post.count();
expect(count).toBe(0);
```

```graphql
mutation {
  createPostWithComment {
    postId
  }
}
```

#### Key Points

- Rollback tests prove atomicity expectations.
- Framework-specific transaction APIs differ—document team pattern.
- Application rollback may need compensations, not only DB rollback.

#### Best Practices

- Prefer transactional tests for speed when DB supports it.
- Separate tests for ORM rollback vs manual compensation logic.
- Monitor deadlocks under parallel test runs.

#### Common Mistakes

- Forgetting that some DB DDL is not transactional.
- Nested transactions behaving differently than expected.
- SQLite vs Postgres transaction semantics mismatch between dev and CI.

---

## 24.4 Subscription Testing

### 24.4.1 Subscription Connection Testing

#### Beginner

Use **`graphql-ws`** or **`subscriptions-transport-ws`** client in tests to open connection, assert **`connection_ack`**. May require **async** server startup on random port.

#### Intermediate

Test **`connectionParams`** auth rejected closes socket with **4401** unauthorized. **Heartbeat** ping/pong keeps connection alive—assert timeout behavior.

#### Expert

**Sticky** load balancers: contract test that **upgrade** headers reach GraphQL server. **mTLS** subscription path with custom agent in Node test.

```javascript
import { createClient } from "graphql-ws";
import WebSocket from "ws";

function wsClient(url) {
  return createClient({ url, webSocketImpl: WebSocket });
}
```

```graphql
type Subscription {
  commentAdded(postId: ID!): Comment!
}
```

#### Key Points

- Subscriptions are long-lived—tests need teardown (`client.dispose()`).
- Auth at connection vs per-subscribe differs by implementation—test both.
- Flaky CI may need increased timeouts for WS handshake.

#### Best Practices

- Use `wait-for-expect` style loops for async events.
- Run subscription tests in serial job or isolate ports.
- Log raw frames when debugging protocol issues.

#### Common Mistakes

- Not closing sockets → open handle warnings in Jest.
- Testing with wrong subprotocol string.
- Assuming Apollo Server 3 vs 4 subscription APIs are identical.

---

### 24.4.2 Event Publishing

#### Beginner

**PubSub.publish** triggers subscriber. In test, inject **mock PubSub** or use in-memory implementation; call publish after mutation; assert subscriber received.

#### Intermediate

**Filter** functions on subscriptions—publish event that should be filtered out and assert non-receipt.

#### Expert

**Redis pubsub** integration: use **test Redis** or docker-compose service. **Cluster** mode fan-out correctness.

```javascript
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

await pubsub.publish("COMMENT_ADDED", { commentAdded: { id: "c1" } });
```

```graphql
subscription {
  commentAdded(postId: "p1") {
    id
  }
}
```

#### Key Points

- Topic naming conventions must be consistent between publish and subscribe.
- AsyncIterator error propagation should be tested.
- Memory leaks if iterators not cleaned on unsubscribe.

#### Best Practices

- Wrap subscribe in `try/finally` with `return iterator.return()`.
- Use unique channel names per test to avoid cross-talk.
- Assert payload shape matches resolver return type.

#### Common Mistakes

- Publishing wrong key name vs what async iterator expects.
- Not awaiting publish (if async redis client).
- Testing only local PubSub while production uses Redis.

---

### 24.4.3 Message Reception

#### Beginner

**for await** on async iterator from `subscribe()` (graphql-js) or client.subscribe. Collect **n** messages then break.

#### Intermediate

**Debounce** or **buffer** in resolver—test ordering guarantees. **Backpressure**: slow consumer should not crash publisher (behavioral expectation).

#### Expert

**At-least-once** delivery: duplicate events possible—assert idempotent client handling or dedupe keys in test harness.

```javascript
import { subscribe } from "graphql";

const iter = await subscribe({ schema, document, contextValue: ctx() });
const result = await iter.next();
expect(result.value.data.commentAdded.id).toBe("c1");
await iter.return();
```

```graphql
subscription S {
  commentAdded(postId: "p1") {
    id
    body
  }
}
```

#### Key Points

- Iterator protocol must be respected to avoid hanging tests.
- GraphQL subscription payloads are GraphQL result objects (`data` / `errors`).
- Multiple subscribers should each receive events if broadcast.

#### Best Practices

- Timeout guard with `Promise.race` around iterator next.
- Compare payloads with `toMatchObject`.
- Test completion vs infinite streams explicitly.

#### Common Mistakes

- Forgetting to cancel subscription → Jest open handle.
- Assuming `next()` resolves immediately without published event.
- Not testing error field in subscription results.

---

### 24.4.4 Disconnection Handling

#### Beginner

When client disconnects, server should **cleanup** resources. Spy on **`onDisconnect`** hooks if using Apollo subscription server.

#### Intermediate

**Reconnect** with exponential backoff on client—integration test server restart mid-subscription.

#### Expert

**Drain** in-flight publishes on shutdown; assert no uncaught exceptions. **Redis** connection drop triggers reconnect logic—simulate with proxy toxics.

```javascript
server.cleanupListeners.push(() => {
  // close redis subscriber connection
});
```

```graphql
type Subscription {
  tick: Int!
}
```

#### Key Points

- Resource leaks on disconnect cause production memory growth.
- Client libraries auto-reconnect—server must handle duplicate subscriptions idempotently.
- Graceful shutdown order: stop accepting, drain, close transports.

#### Best Practices

- Use `process.on('SIGTERM')` handlers in e2e with supertest+ws.
- Metrics: active subscription gauge should return to zero after test.
- Document expected client behavior on disconnect.

#### Common Mistakes

- Ignoring `iterator.return()` on client abort.
- Server continues publishing to dead iterators.
- Test suite kills process before async cleanup completes.

---

### 24.4.5 Error Handling

#### Beginner

Subscription resolver **throws** → client receives error payload. Assert `errors[0].message` and connection policy (close vs continue) per your server.

#### Intermediate

**Auth errors** during subscribe should not leak existence of protected channels. **Malformed** subscription document fails at parse/validate like queries.

#### Expert

**Source stream errors** from Kafka: map to GraphQL errors and retry policy. **Partial** failures in federated subscriptions—assert `extensions` from subgraph.

```javascript
const subRes = await subscribe({
  schema,
  document: parse(`subscription { bad }`),
  contextValue: ctx(),
});
const n = await subRes.next();
expect(n.value.errors).toBeDefined();
```

```graphql
type Subscription {
  bad: String!
}
```

#### Key Points

- Subscription errors differ from query errors in transport behavior.
- Decide whether one bad event kills entire stream.
- Log internal errors; return safe messages to clients.

#### Best Practices

- Test both resolver throw and `publish` with invalid shape.
- Align with `formatError` used for queries.
- Client tests should assert `onError` callback invocation.

#### Common Mistakes

- Swallowing errors in async iterator without logging.
- Infinite error loops on retry without backoff.
- Not distinguishing auth vs application errors in WebSocket close codes.

---

## 24.5 Resolver Testing

### 24.5.1 Unit Testing Resolvers

#### Beginner

Import resolver function and call **`resolver(parent, args, context, info)`** with hand-built inputs. No full schema needed for pure functions.

#### Intermediate

**Mock `info`** minimally (`fieldName`, `path`) when logic uses them. **Default resolver** behavior test by omitting custom resolver.

#### Expert

**Resolver tracing** wraps—test with and without instrumentation enabled. **Federation** `__resolveReference` unit tests with representative entity keys.

```javascript
import { postTitle } from "./post";

it("uppercases title when flag", () => {
  const out = postTitle(
    { title: "a" },
    {},
    { features: { uppercaseTitles: true } },
    {}
  );
  expect(out).toBe("A");
});
```

```graphql
type Post {
  title: String!
}
```

#### Key Points

- Unit tests are fastest feedback for business logic in resolvers.
- Keep resolvers thin; push heavy logic to services for easier testing.
- `info` is large—avoid deep coupling.

#### Best Practices

- Table-driven tests for args variations.
- TypeScript types for resolver signatures from codegen.
- Test parent nullability paths for nested resolvers.

#### Common Mistakes

- Passing incomplete `context` causing undefined access.
- Testing resolver that only delegates to service without mocking service separately (duplicate coverage).
- Using production DB in “unit” tests.

---

### 24.5.2 Mocking Dependencies

#### Beginner

**jest.mock('../db')** to replace database with fake returning canned rows. **Context injection** passes `{ db: mockDb }`.

#### Intermediate

**Manual mocks** per test with `mockResolvedValueOnce` chains. **Sinon** stubs for non-Jest.

#### Expert

**DI container** resolves test implementations. **Wiremock** for HTTP dependencies in higher-level tests. **MSW** for fetch in Node 18+ resolver code.

```javascript
const db = { user: { findById: jest.fn().mockResolvedValue({ id: "1", name: "A" }) } };

await userResolver.Query.user(null, { id: "1" }, { db }, info);
expect(db.user.findById).toHaveBeenCalledWith("1");
```

```graphql
type Query {
  user(id: ID!): User
}
```

#### Key Points

- Mocks must be reset between tests to avoid bleed.
- Over-mocking hides integration issues—balance layers.
- Prefer interfaces + fakes over monkey-patching globals.

#### Best Practices

- `afterEach(() => jest.clearAllMocks())`
- Assert call counts and arguments for critical side effects.
- Use `mockImplementation` for stateful behavior.

#### Common Mistakes

- Mock returning promise vs value inconsistency.
- Hoisting issues with `jest.mock` variables—use factory form.
- Shared mutable mock state across parallel workers.

---

### 24.5.3 Context Testing

#### Beginner

Build **`context`** objects explicitly: `{ user: { id: 'u1' }, db }`. Test resolver branches for **anonymous** vs **authenticated** users.

#### Intermediate

**Context factory** composes: auth + loaders + requestId. Test that **loaders** are per-request (new instance each call).

#### Expert

**Async context** (AsyncLocalStorage) for tracing—assert correlation IDs propagate when resolvers call services.

```javascript
it("uses ctx.user.id in default scope", async () => {
  const ctx = { user: { id: "u1", tenantId: "t1" }, db: scopedDb("t1") };
  const rows = await resolver.Query.items(null, {}, ctx, info);
  expect(db.lastWhere.tenantId).toBe("t1");
});
```

```graphql
type Query {
  items: [Item!]!
}
```

#### Key Points

- Context is the dependency injection vehicle—test it thoroughly.
- Immutability prevents cross-test pollution.
- Subscription context may differ from HTTP—duplicate tests if needed.

#### Best Practices

- Freeze context in tests with `Object.freeze` when enforcing immutability.
- Snapshot `Object.keys(context)` shape smoke test in integration.
- Document required context fields on each resolver module.

#### Common Mistakes

- Reusing same loaders instance across requests in tests (hides caching bugs).
- Missing `user` when testing auth-required resolver → false positives.
- Context built differently in tests vs production middleware.

---

### 24.5.4 DataLoader Testing

#### Beginner

Instantiate **DataLoader** with batch function spy; call **load** twice with same key; assert batch called **once** with both keys.

#### Intermediate

**Prime** loaders in tests for cache hits. **Error** propagation: batch rejects single key error.

#### Expert

**Per-request** scope: ensure loaders not shared—memory leak or stale cache tests. **Max batch** size configuration behavior.

```javascript
import DataLoader from "dataloader";

it("batches loads", async () => {
  const batchFn = jest.fn(async (keys) => keys.map((k) => ({ id: k })));
  const loader = new DataLoader(batchFn);
  await Promise.all([loader.load("1"), loader.load("1"), loader.load("2")]);
  expect(batchFn).toHaveBeenCalledTimes(1);
  expect(batchFn.mock.calls[0][0].sort()).toEqual(["1", "2"]);
});
```

```graphql
type Post {
  author: User!
}
```

#### Key Points

- DataLoader correctness prevents N+1 in production.
- Clearing loader cache between tests if reusing instance incorrectly.
- Batch function must return array same length as keys.

#### Best Practices

- Test ordering of keys in batch (sort if order not guaranteed).
- Test error if key missing—reject vs null element.
- Integration test with real DB batch SQL (single query assertion).

#### Common Mistakes

- Sharing one DataLoader across concurrent test requests.
- Forgetting `dispatch` timing—loads in same tick batch.
- Batch function mutating input keys array.

---

### 24.5.5 Integration Testing

#### Beginner

Spin **ApolloServer** with test **`dataSources`** or DB connection to **test database**. Use **`executeOperation`** from `@apollo/server` testing or HTTP `fetch`.

#### Intermediate

**Testcontainers** for Postgres/Redis. **Migrate** schema in `globalSetup`.

#### Expert

**Supertest** with full middleware chain (compression, auth). **Record/replay** HTTP with Polly.js for third-party APIs at integration boundary.

```javascript
import { ApolloServer } from "@apollo/server";

const server = new ApolloServer({ typeDefs, resolvers });
await server.start();
const res = await server.executeOperation(
  { query: "query { me { id } }" },
  { contextValue: ctx(user) }
);
expect(res.body.singleResult.errors).toBeUndefined();
```

```graphql
query {
  me {
    id
  }
}
```

#### Key Points

- Integration tests validate wiring between layers.
- Slower than unit—run selectively in CI.
- Use realistic middleware ordering.

#### Best Practices

- Randomize ports or use `listen(0)`.
- `afterAll` `server.stop()` cleanly.
- Seed reference data once, transactional per test when possible.

#### Common Mistakes

- Hitting production services due to env misconfiguration.
- Not awaiting server start/stop.
- Flaky tests from shared ports.

---

## 24.6 End-to-End Testing

### 24.6.1 API Testing

#### Beginner

**fetch** or **axios** POST to `/graphql` with JSON `{ query, variables }`. Assert HTTP **200** and JSON body structure.

#### Intermediate

**Content-Type** `application/json` vs **multipart** file uploads. **Persisted queries** with `extensions.persistedQuery` hash.

#### Expert

**HTTP/2** multiplexing behavior with many parallel operations. **CDN** caching headers should be `private` for authenticated responses—assert headers.

```javascript
import fetch from "node-fetch";

const res = await fetch("http://localhost:4000/graphql", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ query: `query { hello }` }),
});
const json = await res.json();
expect(json.data.hello).toBe("world");
```

```graphql
query {
  hello
}
```

#### Key Points

- E2E catches CORS, body parser limits, and HTTP concerns.
- Batched operations send array—test server configuration.
- Use test environment URLs from config.

#### Best Practices

- Start server programmatically in test or use `start-server-and-test`.
- Retry health check before running queries.
- Capture response text on parse failures for debugging.

#### Common Mistakes

- Forgetting `JSON.stringify` on body.
- Testing only localhost while prod behind path prefix `/api/graphql`.
- Not sending `operationName` for logging correlation.

---

### 24.6.2 Client Testing

#### Beginner

**@apollo/client** `MockedProvider` wraps React tree with mocked responses for components using `useQuery`.

#### Intermediate

**MSW** intercepts HTTP in Jest/jsdom for closer-to-real client stack. Test **error** and **loading** states.

#### Expert

**Cache** behavior: assert `cache.extract()` after mutation updates normalized entities. **Fragment** masking tests with codegen.

```javascript
import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import { gql, useQuery } from "@apollo/client";

const Q = gql`query { me { id } }`;

function Me() {
  const { data } = useQuery(Q);
  return <div>{data?.me?.id}</div>;
}

render(
  <MockedProvider mocks={[{ request: { query: Q }, result: { data: { me: { id: "1" } } } }]}>
    <Me />
  </MockedProvider>
);
```

```graphql
query {
  me {
    id
  }
}
```

#### Key Points

- Client tests ensure UI handles GraphQL shapes correctly.
- MockedProvider requires exact query match unless using link mocks.
- E2E with Playwright hits real server for full stack confidence.

#### Best Practices

- Use `waitFor` to handle async query resolution.
- Test network error path with `error: new Error('network')`.
- Align fragment names with codegen outputs.

#### Common Mistakes

- Mocks missing `__typename` when cache writes expect it.
- Different variable values causing mock miss and hanging query.
- Testing implementation (`useQuery` call count) vs user-visible behavior only.

---

### 24.6.3 Authentication Testing

#### Beginner

E2E login flow obtains **token**; subsequent GraphQL requests include **`Authorization` header**. Assert **401** or GraphQL `UNAUTHENTICATED` when missing.

#### Intermediate

**Cookie** session: use agent with **cookie jar** (`supertest.agent`). **CSRF** token required for mutations—test rejection without token.

#### Expert

**Token expiry** simulation: clock fake + short TTL token; assert refresh flow in client E2E. **mTLS** client certs in Node `https.request` options.

```javascript
const login = await fetch(`${API}/graphql`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    query: `mutation($e:String!,$p:String!){ login(email:$e,password:$p){ accessToken } }`,
    variables: { e: "a@b.com", p: "secret" },
  }),
});
const token = (await login.json()).data.login.accessToken;

const me = await fetch(`${API}/graphql`, {
  method: "POST",
  headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
  body: JSON.stringify({ query: `query { me { id } }` }),
});
```

```graphql
mutation Login($e: String!, $p: String!) {
  login(email: $e, password: $p) {
    accessToken
  }
}
```

#### Key Points

- Auth tests must cover both transport and GraphQL error codes.
- Refresh and logout flows need dedicated cases.
- Never commit real credentials; use seed users.

#### Best Practices

- Central `authHeaders(token)` helper in test suite.
- Rotate test passwords if repo ever leaked (use env vars).
- Test malformed `Authorization` header.

#### Common Mistakes

- Testing with admin token only—missing standard user regressions.
- Ignoring WebSocket `connectionParams` auth path.
- Time-sensitive JWT tests flaky across CI workers.

---

### 24.6.4 Authorization Testing

#### Beginner

As **user A**, query **user B’s private resource**; expect `null`, `FORBIDDEN`, or `NOT_FOUND` per policy. Positive case as owner must succeed.

#### Intermediate

Matrix test **roles** × **operations**. **Field-level** denial: query includes sensitive field—assert null or error.

#### Expert

**Horizontal privilege escalation** automation: iterate IDs. **Federation**: assert subgraph cannot be called directly without gateway headers (network isolation test).

```javascript
const alice = await tokenFor("alice");
const bobPostId = "post-owned-by-bob";

const res = await gqlRequest(
  { query: `query($id:ID!){ post(id:$id){ title } }`, variables: { id: bobPostId } },
  alice
);
expect(res.data.post).toBeNull();
```

```graphql
query ($id: ID!) {
  post(id: $id) {
    title
  }
}
```

#### Key Points

- Authorization bugs are critical—automate IDOR checks.
- Negative tests should be as thorough as positive.
- Align assertions with chosen information disclosure policy.

#### Best Practices

- Generate IDs from seed data, not hardcoded assumptions.
- Tag tests `security` for mandatory CI stage.
- Pair with static analysis (graphql-eslint) for `@auth` coverage.

#### Common Mistakes

- Only testing admin positive paths.
- Using same user for setup and assertion unknowingly.
- Missing batch query alias escalation tests.

---

### 24.6.5 Performance Testing

#### Beginner

Measure **latency** of representative query with `console.time` or performance hooks. Set **threshold** assertions in CI (p95 < 200ms local).

#### Intermediate

**k6** or **Artillery** scripts POST GraphQL operations at RPS targets. Track **error rate** and latency percentiles.

#### Expert

**OpenTelemetry** traces assert **span** count per operation (detect N+1). **CPU profiling** in CI optional job comparing flame graphs across releases.

```javascript
import { performance } from "perf_hooks";

it("p95 smoke locally", async () => {
  const t0 = performance.now();
  await graphql({ schema, source: `{ posts(first: 50) { id author { id } } }` });
  const ms = performance.now() - t0;
  expect(ms).toBeLessThan(500);
});
```

```graphql
query {
  posts(first: 50) {
    id
    author {
      id
    }
  }
}
```

#### Key Points

- Performance tests are environment-sensitive—trend over time, not absolutes.
- Warmup iterations reduce JIT noise.
- Load tests need realistic queries, not only `__typename`.

#### Best Practices

- Run k6 from separate machine or CI larger runner.
- Include think time for user-like scenarios.
- Monitor DB CPU during load tests.

#### Common Mistakes

- Testing empty database—unrealistic index behavior.
- Saturating client instead of server (too many concurrent local processes).
- Ignoring cold start in serverless GraphQL latency.

---

## 24.7 Advanced Testing

### 24.7.1 Snapshot Testing

#### Beginner

**`expect(string).toMatchSnapshot()`** for printed GraphQL errors or formatted JSON responses. Update snapshots deliberately via `-u`.

#### Intermediate

**Inline snapshots** for small outputs. **Custom serializers** strip volatile fields (`requestId`, timestamps) before snapshotting.

#### Expert

**Schema snapshot**: `printSchema(schema)` committed to detect SDL drift across subgraphs. **Apollo operation manifest** snapshot for persisted query allowlist.

```javascript
import { printSchema } from "graphql";

expect(printSchema(schema)).toMatchSnapshot("schema.sdl");
```

```graphql
type Query {
  hello: String
}
```

#### Key Points

- Snapshots catch unintended widespread changes quickly.
- Noisy snapshots erode trust—normalize first.
- Review snapshot diffs carefully in PRs.

#### Best Practices

- Limit snapshot count; prefer targeted assertions when possible.
- Use descriptive snapshot names.
- Fail CI if snapshot missing requires team approval workflow.

#### Common Mistakes

- Snapshotting entire error stacks with machine-specific paths.
- Auto-updating snapshots without reading diff.
- Huge one-line JSON snapshots unreadable in review.

---

### 24.7.2 Schema Testing

#### Beginner

**`buildSchema`** or **`makeExecutableSchema`** should **not throw** on startup. Assert **required** root fields exist via `getQueryType().getFields()`.

#### Intermediate

**Breaking change detection** with **`graphql-inspector` diff** in CI: removed fields, type changes.

#### Expert

**Federation composition** checks: **`composeServices`** succeeds; `@key` directives consistent. **Custom rules** lint schema for disallowed patterns.

```javascript
import { getIntrospectionQuery, buildClientSchema, graphqlSync } from "graphql";

const intro = graphqlSync({ schema, source: getIntrospectionQuery() });
const clientSchema = buildClientSchema(intro.data);
expect(clientSchema.getQueryType().getFields().me).toBeDefined();
```

```graphql
type Query {
  me: User
}
```

#### Key Points

- Schema is the contract—test it like OpenAPI.
- Introspection builds a schema useful for client codegen validation.
- Federation adds composition-specific failures.

#### Best Practices

- Run inspector on PR from subgraph SDL artifacts.
- Version schema artifacts in registry.
- Fail on `@deprecated` removal without major version bump policy.

#### Common Mistakes

- Testing SDL string equality including comment noise.
- Not composing supergraph in CI when using federation.
- Ignoring custom scalar serialization in schema tests.

---

### 24.7.3 Contract Testing

#### Beginner

**Consumer-driven**: client team commits expected **operation** document; server test asserts schema **still supports** that operation (validation only).

#### Intermediate

**Pact** or **Spring Cloud Contract** style for GraphQL—share contracts via broker. **Apollo Studio** schema checks on publish.

#### Expert

**Multi-subgraph** contracts: gateway validates **operation** against **composed** supergraph. **Versioned** contracts per mobile app release train.

```javascript
import { parse, validate } from "graphql";

const op = parse(`
  query MobileHome {
    me { id avatarUrl }
  }
`);

const errors = validate(schema, op);
expect(errors).toHaveLength(0);
```

```graphql
query MobileHome {
  me {
    id
    avatarUrl
  }
}
```

#### Key Points

- Contracts protect clients from accidental breaking changes.
- Validate operations, not just schema existence of fields.
- Mobile clients especially benefit from long upgrade cycles.

#### Best Practices

- Store operations in `.graphql` files consumed by tests and clients.
- CI fails if contract operation invalid against new schema.
- Coordinate deprecation periods with contract owners.

#### Common Mistakes

- Only testing introspection compatibility, not real operations.
- Contracts drift from actual client shipped code.
- No ownership of who updates contracts when schema evolves.

---

### 24.7.4 Load Testing

#### Beginner

Run **Artillery** scenario with `post` to `/graphql` body file. Watch **RPS**, **latency**, **errors**.

#### Intermediate

**Ramp** stages: warm-up, sustained, spike. **Data setup** script seeds DB before load.

#### Expert

**Chaos** during load: kill random pod, assert SLO via GraphQL error budget. **GraphQL-specific** attack queries in security load (depth limits).

```yaml
# artillery-graphql.yml (excerpt)
scenarios:
  - flow:
      - post:
          url: "/graphql"
          json:
            query: "query { posts(first: 20) { id } }"
```

```graphql
query {
  posts(first: 20) {
    id
  }
}
```

#### Key Points

- Load tests validate autoscaling, connection pools, and query cost limits.
- Mix read/write carefully on shared environments.
- GraphQL single endpoint concentrates traffic—watch hotspots.

#### Best Practices

- Use isolated environment matching prod topology minimally.
- Monitor DB slow query log during test.
- Stop tests if error rate exceeds threshold early.

#### Common Mistakes

- Testing from laptop on Wi-Fi—unreliable metrics.
- No ramp—immediate overload unrealistic.
- Writing data unbounded until disk fills.

---

### 24.7.5 Security Testing

#### Beginner

Send **deep nested** query; expect **depth limit** error. **Introspection** disabled in prod—assert in staging config test.

#### Intermediate

**sqlmap** not directly applicable to GraphQL, but test **SQL injection** via arguments in resolvers using **integration** tests with malicious strings.

#### Expert

**Burp** GraphQL addon or **InQL** for batching attacks, alias amplification. **CI** job runs **`graphql-cop`** or custom fuzzer against staging.

```javascript
const deep = `{ a ${"a { ".repeat(50)}x ${"}".repeat(50)} }`; // illustrative
const res = await graphql({ schema, source: deep });
expect(res.errors?.[0]?.message).toMatch(/depth|complexity/i);
```

```graphql
query {
  a {
    a {
      a {
        x
      }
    }
  }
}
```

#### Key Points

- Security tests belong in automated pipeline, not only annual pentest.
- Depth/complexity limits need tests or they regress.
- Authz tests overlap with security suite—coordinate coverage.

#### Best Practices

- Static allowlist of operations for public internet APIs where feasible.
- Regular dependency audit (`npm audit`) on graphql-related packages.
- Red-team exercises on preview environments.

#### Common Mistakes

- Testing security only in production-like manual environments.
- Assuming WAF replaces app-level validation.
- Ignoring subscription/WebSocket attack surface.

---
