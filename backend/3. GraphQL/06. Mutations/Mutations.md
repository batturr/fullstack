# GraphQL Mutations

## 📑 Table of Contents

- [6.1 Mutation Basics](#61-mutation-basics)
  - [6.1.1 Mutation Operations](#611-mutation-operations)
  - [6.1.2 Mutation Syntax](#612-mutation-syntax)
  - [6.1.3 Mutation Return Values](#613-mutation-return-values)
  - [6.1.4 Side Effects](#614-side-effects)
  - [6.1.5 Mutation Naming](#615-mutation-naming)
- [6.2 CRUD Operations](#62-crud-operations)
  - [6.2.1 Create Mutation](#621-create-mutation)
  - [6.2.2 Read Query](#622-read-query)
  - [6.2.3 Update Mutation](#623-update-mutation)
  - [6.2.4 Delete Mutation](#624-delete-mutation)
  - [6.2.5 Batch Operations](#625-batch-operations)
- [6.3 Mutation Arguments](#63-mutation-arguments)
  - [6.3.1 Input Arguments](#631-input-arguments)
  - [6.3.2 Required Arguments](#632-required-arguments)
  - [6.3.3 Optional Arguments](#633-optional-arguments)
  - [6.3.4 Argument Validation](#634-argument-validation)
  - [6.3.5 Default Values](#635-default-values)
- [6.4 Mutation Response](#64-mutation-response)
  - [6.4.1 Returning Created Object](#641-returning-created-object)
  - [6.4.2 Success/Error Response](#642-successerror-response)
  - [6.4.3 Partial Updates](#643-partial-updates)
  - [6.4.4 Batch Response](#644-batch-response)
  - [6.4.5 Response Metadata](#645-response-metadata)
- [6.5 Optimistic Responses](#65-optimistic-responses)
  - [6.5.1 Client-Side Prediction](#651-client-side-prediction)
  - [6.5.2 Optimistic UI](#652-optimistic-ui)
  - [6.5.3 Rollback Handling](#653-rollback-handling)
  - [6.5.4 Error Recovery](#654-error-recovery)
  - [6.5.5 Conflict Resolution](#655-conflict-resolution)
- [6.6 Transaction Management](#66-transaction-management)
  - [6.6.1 Multi-Step Mutations](#661-multi-step-mutations)
  - [6.6.2 Atomic Operations](#662-atomic-operations)
  - [6.6.3 Rollback Handling](#663-rollback-handling)
  - [6.6.4 Consistency Guarantees](#664-consistency-guarantees)
  - [6.6.5 Distributed Transactions](#665-distributed-transactions)
- [6.7 Advanced Mutation Patterns](#67-advanced-mutation-patterns)
  - [6.7.1 Bulk Mutations](#671-bulk-mutations)
  - [6.7.2 Conditional Mutations](#672-conditional-mutations)
  - [6.7.3 Cascading Updates](#673-cascading-updates)
  - [6.7.4 Payload Patterns](#674-payload-patterns)
  - [6.7.5 Error Response Standards](#675-error-response-standards)

---

## 6.1 Mutation Basics

### 6.1.1 Mutation Operations

#### Beginner

A **mutation** is a GraphQL operation type intended to change server-side state: create a row, charge a card, enqueue a job. Unlike queries, mutations are conventionally **serialized** by servers: root mutation fields often run in document order so effects are predictable.

#### Intermediate

The `Mutation` root type holds fields like `createUser`, `updatePost`. Each field triggers resolvers that may write to databases, call payment APIs, or publish events. Clients still send one POST with `mutation { ... }` and receive JSON with `data` and/or `errors`.

#### Expert

Spec note: mutation root fields are logically sequential; implementations may still parallelize non-conflicting internals, but sibling root mutations should not assume concurrency. **Idempotency keys** (header or argument) are not in the GraphQL spec but are essential for payments and retries.

```graphql
mutation SignUp($input: SignUpInput!) {
  signUp(input: $input) {
    user {
      id
      email
    }
    token
  }
}
```

```javascript
import { createHandler } from "graphql-http/lib/use/express";
import { makeExecutableSchema } from "@graphql-tools/schema";

const typeDefs = `#graphql
  type Mutation {
    signUp(input: SignUpInput!): SignUpPayload!
  }
`;

const resolvers = {
  Mutation: {
    signUp: async (_, { input }, ctx) => {
      const user = await ctx.auth.register(input);
      return { user, token: user.sessionToken };
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });
```

#### Key Points

- Mutations express writes; queries express reads.
- Root-level mutation ordering is part of the execution model.
- Transport-level retries need idempotency design.

#### Best Practices

- One logical business action per mutation field when possible.
- Return enough data to refresh the client cache without a follow-up query.
- Log mutation name + correlation id, not raw passwords.

#### Common Mistakes

- Performing irreversible side effects in query resolvers.
- Assuming parallel root mutations (race conditions).
- No idempotency for network-retried mutations.

---

### 6.1.2 Mutation Syntax

#### Beginner

Start with the `mutation` keyword, optional name, variable definitions, then selection set on `Mutation` fields: `mutation M { createItem(input:{}) { id } }`.

#### Intermediate

Variables work like queries: `mutation ($input: ItemInput!) { createItem(input: $input) { id } }`. Directives `@include`/`@skip` apply to fields inside mutations too.

#### Expert

Multiple mutations in one document require `operationName`. **Anonymous mutations** parse but hurt observability. **Fragment** usage inside mutations follows the same rules as queries.

```graphql
mutation RenameProject($id: ID!, $name: String!) {
  updateProject(id: $id, input: { name: $name }) {
    project {
      id
      name
    }
  }
}
```

```javascript
import { parse, validate } from "graphql";

const doc = parse(`
  mutation RenameProject($id: ID!, $name: String!) {
    updateProject(id: $id, input: { name: $name }) {
      project { id name }
    }
  }
`);
```

#### Key Points

- Syntax mirrors queries except the root type and keyword.
- Variables keep mutation documents static for APQ.
- Validation runs before any resolver executes.

#### Best Practices

- Name every production mutation.
- Co-locate variables with strongly typed input objects.
- Lint mutation documents in CI.

#### Common Mistakes

- Using `query` keyword for writes.
- Forgetting `!` on input variables.
- Invalid inline input (wrong field names vs input type).

---

### 6.1.3 Mutation Return Values

#### Beginner

Mutations return a **payload type** (object) so the client can ask for `id`, `errors`, `user`, etc. Returning only `Boolean` loses debugging and cache-update data.

#### Intermediate

**Payload pattern**: `{ user: User, errors: [UserError!] }` or union `CreateUserResult = User | ValidationError`. GraphQL errors array handles transport-level failures; domain errors can live in `data` for partial success UX.

#### Expert

**Relay mutations** often return `clientMutationId` for correlation. **Federation** may require returning entities with `@key` fields for gateway cache. Consider **nullable payload fields** when using `errors` in data.

```graphql
type Mutation {
  createComment(input: CreateCommentInput!): CreateCommentPayload!
}

type CreateCommentPayload {
  comment: Comment
  query: Query
}
```

```javascript
async function createComment(_, { input }, ctx) {
  const comment = await ctx.db.comments.insert(input);
  return {
    comment,
    query: {},
  };
}
```

#### Key Points

- Rich return types reduce round trips.
- `query` field pattern lets clients refetch arbitrary graph after mutation (Relay).
- Align nullability with “success vs failure” semantics.

#### Best Practices

- Return the modified entity and commonly needed related ids.
- Document which fields appear only on success.
- Version payloads when adding non-breaking fields.

#### Common Mistakes

- `Boolean` only returns.
- Throwing for business validation when clients need structured errors.
- Non-null entity in payload when creation failed.

---

### 6.1.4 Side Effects

#### Beginner

Side effects are anything beyond returning JSON: DB writes, emails, S3 uploads, metrics increments.

#### Intermediate

Order side effects with care: validate inputs before charging money. Use **outbox pattern** or message queues for reliable async work. Keep resolvers thin; call domain services.

#### Expert

**Saga pattern** for long workflows: mutation kicks off process, client polls or subscribes. **Two-phase commit** rarely lives in GraphQL itself—use transactional DB boundaries inside one mutation resolver tree.

```javascript
async function placeOrder(_, { input }, ctx) {
  const order = await ctx.db.transaction(async (tx) => {
    const o = await tx.orders.create(input);
    await tx.inventory.reserve(o.lines);
    return o;
  });
  await ctx.queue.publish("order.placed", { orderId: order.id });
  return { order };
}
```

#### Key Points

- Not all side effects belong synchronously in the resolver.
- Transactions should match business atomicity, not arbitrary field grouping.
- Async work needs observability (dead letter queues).

#### Best Practices

- Validate before irreversible external calls.
- Make email/SMS fire-and-forget async when possible.
- Emit domain events after commit.

#### Common Mistakes

- Sending email before DB commit rolls back.
- Hidden side effects in field resolvers called from mutations unexpectedly.
- Double charges without idempotency.

---

### 6.1.5 Mutation Naming

#### Beginner

Use **verbs**: `createUser`, `updatePost`, `deleteComment`, not `user` on `Mutation`.

#### Intermediate

Namespace by domain: `billingChargeInvoice`, `authLogin`. Avoid HTTP-style names (`postUsers`). **Past tense** (`userCreated`) is less common than imperative verbs for mutations.

#### Expert

**Event naming** (`orderPlaced`) suits event-sourced backends but can confuse CRUD clients—pick one style per API. **Deprecation**: `@deprecated` on mutation fields with migration path.

```graphql
type Mutation {
  createDraftPost(input: CreateDraftInput!): CreateDraftPayload!
  publishPost(id: ID!): PublishPostPayload!
  archivePost(id: ID!): ArchivePostPayload!
}
```

#### Key Points

- Clear names document intent in schema explorers.
- Consistent prefixes (`create`/`update`/`delete`) aid discovery.
- Names appear in logs and APQ registrations.

#### Best Practices

- Avoid generic `update` without resource name.
- Pair mutation name with input type name (`XInput` / `XPayload`).
- Review naming in API design guidelines.

#### Common Mistakes

- Duplicate semantics (`addUser` vs `createUser`).
- CamelCase violations (GraphQL is camelCase).
- Names that promise more than the mutation does.

---

## 6.2 CRUD Operations

### 6.2.1 Create Mutation

#### Beginner

**Create** adds a resource. Typical signature: `createUser(input: CreateUserInput!): CreateUserPayload!`.

#### Intermediate

Input objects group fields; exclude server-generated fields (`id`, `createdAt`) or accept them only from trusted internal clients. Validate uniqueness constraints and return field-level errors.

#### Expert

**Insert returning** pattern in SQL maps cleanly to GraphQL returns. **Multi-resource creation** (user + workspace) can be one mutation with nested writes or a saga—document transactional boundaries.

```graphql
mutation {
  createBook(input: { title: "GraphQL in Depth", authorId: "a1" }) {
    book {
      id
      title
    }
  }
}
```

```javascript
async function createBook(_, { input }, ctx) {
  ctx.auth.requireRole("author");
  const book = await ctx.db.books.create(input);
  return { book };
}
```

#### Key Points

- Create mutations should return the new resource’s id.
- Server assigns stable identifiers.
- Authorization must run before insert.

#### Best Practices

- Use database defaults for timestamps.
- Return `UserError` list for validation failures if using payload pattern.
- Index foreign keys used in creation.

#### Common Mistakes

- Trusting client-provided ids without checks.
- Leaking stack traces on unique constraint violations.
- Omitting created resource from response (extra round trip).

---

### 6.2.2 Read Query

#### Beginner

**Read** belongs to **queries**, not mutations. After a mutation, clients either rely on the mutation response or run a **refetch query**.

#### Intermediate

**Apollo** `refetchQueries`, Relay **updaters**, or normalized cache writes avoid refetch. For simple apps, `mutation { createX { x { ... } } }` embeds the read in the mutation response.

#### Expert

**CQRS** systems may separate write and read models: mutation returns ack + id; client queries read model after eventual consistency delay. Document lag expectations.

```graphql
query BookAfterCreate($id: ID!) {
  book(id: $id) {
    id
    title
    author {
      name
    }
  }
}
```

```javascript
// After mutation, client calls query with returned id
async function refetchBook(apolloClient, id) {
  return apolloClient.query({
    query: BOOK_QUERY,
    variables: { id },
    fetchPolicy: "network-only",
  });
}
```

#### Key Points

- Do not use mutations for pure reads.
- Refetch policy depends on cache strategy.
- Read-your-writes consistency may require primary DB routing.

#### Best Practices

- Prefer mutation payloads that match list item shape for cache insertion.
- Use `network-only` when staleness is unacceptable after write.
- Expose `node` for Relay refetch containers.

#### Common Mistakes

- Adding `getUser` under `Mutation` type.
- Assuming read replica sees write immediately.
- Under-fetching in mutation response then N refetches.

---

### 6.2.3 Update Mutation

#### Beginner

**Update** changes an existing resource: `updateProfile(input: UpdateProfileInput!): UpdateProfilePayload!`.

#### Intermediate

**Patch semantics**: only provided input fields change; omitting a field means “leave as is.” Contrast with “set null” requiring explicit null in input (tricky in JSON—use `Optional` types or separate operations).

#### Expert

**Optimistic locking**: `expectedVersion` or `updatedAt` in input; reject stale updates with conflict error. **Partial unique constraints** and **soft deletes** complicate updates—encode invariants in the service layer.

```graphql
mutation {
  updatePost(
    id: "p1"
    input: { title: "Revised title", published: true }
  ) {
    post {
      id
      title
      published
      updatedAt
    }
  }
}
```

```javascript
async function updatePost(_, { id, input }, ctx) {
  const current = await ctx.db.posts.findById(id);
  ctx.auth.assertCanEdit(ctx.user, current);
  const post = await ctx.db.posts.update(id, input);
  return { post };
}
```

#### Key Points

- Clarify patch vs replace in API docs.
- Authorization checks resource ownership or roles.
- Return fresh `updatedAt` for client conflict detection.

#### Best Practices

- Validate state transitions (draft → published).
- Use DB `UPDATE ... RETURNING` for accurate rows.
- Emit `post.updated` events after success.

#### Common Mistakes

- Null vs omit ambiguity for optional fields.
- No authorization on update by id enumeration.
- Returning stale object from cache without refetch.

---

### 6.2.4 Delete Mutation

#### Beginner

**Delete** removes or archives a resource: `deleteComment(id: ID!): DeleteCommentPayload!`.

#### Intermediate

**Soft delete** sets `deletedAt`; queries filter it out. Payload may return `deletedId` and `query` for cache eviction. **Cascades** might be DB-level or explicit in service.

#### Expert

**GDPR** erasure may be async mutation returning job id. **Federation** may need to delete across subgraphs—orchestrate carefully. **Restore** mutations pair with soft delete.

```graphql
mutation {
  deleteComment(id: "c9") {
    deletedCommentId
    post {
      id
      commentCount
    }
  }
}
```

```javascript
async function deleteComment(_, { id }, ctx) {
  const comment = await ctx.db.comments.findById(id);
  ctx.auth.assertCanDelete(ctx.user, comment);
  await ctx.db.comments.softDelete(id);
  const post = await ctx.db.posts.refreshCounts(comment.postId);
  return { deletedCommentId: id, post };
}
```

#### Key Points

- Decide hard vs soft delete and document.
- Returning parent aggregates helps UI update.
- Deletion is irreversible in hard delete—confirm UX.

#### Best Practices

- Use transactions if updating counts and deleting rows.
- Return identifiers clients need to purge cache keys.
- Audit log deletions for compliance.

#### Common Mistakes

- 404 vs 403 distinction leaking information.
- Orphan rows from missing cascade rules.
- Deleting without checking referential integrity.

---

### 6.2.5 Batch Operations

#### Beginner

Batch **create/update/delete** multiple items in one mutation: `archivePosts(ids: [ID!]!): ArchivePostsPayload!`.

#### Intermediate

Return **per-item errors** in payload (`results: [BatchResult!]!`) or fail entire batch on first error—choose explicitly. **Input**: `[PostArchiveInput!]!` for heterogeneous updates.

#### Expert

**Chunk** large batches in resolver to avoid long transactions. **Partial success** complicates HTTP status codes—GraphQL often returns 200 with `errors` + partial `data`. **Rate limit** batch size.

```graphql
mutation {
  reorderTasks(input: { taskIds: ["t1", "t2", "t3"] }) {
    tasks {
      id
      sortOrder
    }
  }
}
```

```javascript
async function reorderTasks(_, { input }, ctx) {
  if (input.taskIds.length > 500) {
    throw new GraphQLError("Too many tasks in one batch");
  }
  await ctx.db.transaction((tx) =>
    tx.tasks.reorder(input.taskIds, ctx.user.id)
  );
  const tasks = await ctx.db.tasks.findByIds(input.taskIds);
  return { tasks };
}
```

#### Key Points

- Batch mutations reduce chatter but increase blast radius.
- Define all-or-nothing vs per-row failure.
- Limit input size for DoS protection.

#### Best Practices

- Validate all ids belong to same tenant.
- Use `UNNEST` or bulk SQL where possible.
- Log batch size histograms.

#### Common Mistakes

- Silent partial failure without structured reporting.
- Unbounded `ids` array.
- Long locks holding transaction open.

---

## 6.3 Mutation Arguments

### 6.3.1 Input Arguments

#### Beginner

Mutations usually take one **`input` object** rather than many top-level scalars—easier to extend and validate.

#### Intermediate

`input` types cannot have circular references. Use separate inputs for create vs update (`CreateUserInput` vs `UpdateUserInput`) because required fields differ.

#### Expert

**Input unions** are not in classic GraphQL; use separate mutations or `oneOf` input (spec evolution). **JSON scalar** escape hatch for truly dynamic payloads—use sparingly.

```graphql
input UpdateSettingsInput {
  theme: Theme
  notificationsEnabled: Boolean
  locale: String
}

type Mutation {
  updateSettings(input: UpdateSettingsInput!): UpdateSettingsPayload!
}
```

```javascript
async function updateSettings(_, { input }, ctx) {
  const settings = await ctx.db.settings.patch(ctx.user.id, input);
  return { settings };
}
```

#### Key Points

- Input types version more safely than adding args ad hoc.
- Separate create/update inputs reflect different invariants.
- Document which fields are write-once.

#### Best Practices

- Avoid putting `id` inside create input (or accept only for idempotent upsert).
- Strip unknown keys in resolvers if using raw JSON elsewhere.
- Generate TypeScript types from schema for clients.

#### Common Mistakes

- One mega-input shared by unrelated mutations.
- Breaking changes adding required fields without default migration.
- Using `String` for dates instead of custom scalars.

---

### 6.3.2 Required Arguments

#### Beginner

`!` after type means mandatory: `deletePost(id: ID!)`. Client must supply variable or literal.

#### Intermediate

Required **input fields** inside `input` types also use `!`. Combining optional wrapper with required inner fields models “if you send input, field X is required.”

#### Expert

**Non-null input object** `UpdateUserInput!` with all-optional inside is a common “patch” pattern. **Variable null** vs absent: GraphQL distinguishes; clients using JSON merge must be careful.

```graphql
input CreateOrgInput {
  name: String!
  slug: String!
}

type Mutation {
  createOrg(input: CreateOrgInput!): CreateOrgPayload!
}
```

#### Key Points

- Required args fail fast at validation.
- `!` on mutation field return type means “always return payload or top-level error.”
- Nullable return allows “not found” without throwing.

#### Best Practices

- Require ids for updates/deletes.
- Use enums instead of free strings for modes.
- Document cross-field requirements in description.

#### Common Mistakes

- Everything required, blocking gradual client rollout.
- Non-null payload field when error path returns partial nulls.
- Confusing `String` vs `String!` in inputs.

---

### 6.3.3 Optional Arguments

#### Beginner

Omit `!` for optional: `updateNote(id: ID!, input: UpdateNoteInput!)` where `UpdateNoteInput` fields are optional for patch semantics.

#### Intermediate

**Default values** in SDL for arguments (less common on mutations than queries). **Nullable variables** `$note: String` allow explicit null to clear a field if your API defines that.

#### Expert

**Explicit null** in JSON variables sets argument to null; omitting key means “undefined” for variable default handling—resolver may see `null` vs `undefined` in JS implementations.

```graphql
input UpdateNoteInput {
  title: String
  body: String
}

type Mutation {
  updateNote(id: ID!, input: UpdateNoteInput!): UpdateNotePayload!
}
```

```javascript
async function updateNote(_, { id, input }, ctx) {
  const patch = Object.fromEntries(
    Object.entries(input).filter(([, v]) => v !== undefined)
  );
  return { note: await ctx.db.notes.patch(id, patch) };
}
```

#### Key Points

- Optional input fields power PATCH-like APIs.
- JS `undefined` often means “not provided” after destructuring—normalize carefully.
- Document null vs omit semantics per field.

#### Best Practices

- Use a helper to distinguish “unset” vs “set null” if both matter.
- Integration tests for both cases.
- Avoid optional `id` on update—use argument.

#### Common Mistakes

- Accidentally treating null as “no change” when it should clear.
- Spreading defaults that overwrite intentional nulls.
- Optional args without defaults confusing codegen.

---

### 6.3.4 Argument Validation

#### Beginner

GraphQL validates types and input shapes first. Business rules (slug format, password strength) go in resolvers/services.

#### Intermediate

Use **Zod**/**Yup** to parse `input` before DB. Throw `GraphQLError` with `extensions` for codes. **Custom scalars** (Email, Slug) encode reusable validation.

#### Expert

**Database constraints** are last line of defense; map `23505` unique violations to user-facing errors. **i18n**: return error codes; translate client-side.

```javascript
import { z } from "zod";
import { GraphQLError } from "graphql";

const CreateUser = z.object({
  email: z.string().email(),
  password: z.string().min(12),
});

async function createUser(_, { input }, ctx) {
  const parsed = CreateUser.safeParse(input);
  if (!parsed.success) {
    throw new GraphQLError("Invalid input", {
      extensions: { code: "BAD_USER_INPUT", issues: parsed.error.issues },
    });
  }
  return { user: await ctx.users.create(parsed.data) };
}
```

#### Key Points

- Validate early, return structured errors.
- Do not trust client-only validation.
- Align error codes with mobile and web handlers.

#### Best Practices

- One validation module per mutation input type.
- Log validation failures at warn, not error, if expected.
- Rate limit abusive validation failures.

#### Common Mistakes

- Generic “invalid input” with no details.
- Leaking regex or SQL in error messages.
- Duplicating validation in resolver and service inconsistently.

---

### 6.3.5 Default Values

#### Beginner

SDL defaults on mutation arguments: `publishPost(id: ID!, notify: Boolean = false)`.

#### Intermediate

Default for **input object fields** is less common; often use application defaults in resolver. Variable defaults `($notify: Boolean = false)` work similarly to queries.

#### Expert

Changing defaults changes behavior for old clients—treat as semver minor or major. **Feature flags** sometimes read from context instead of SDL defaults.

```graphql
type Mutation {
  inviteMember(email: String!, role: Role = MEMBER): InvitePayload!
}
```

```javascript
async function inviteMember(_, { email, role = "MEMBER" }, ctx) {
  return { invitation: await ctx.org.invite(email, role) };
}
```

#### Key Points

- Defaults reduce client boilerplate.
- Keep SDL and JS defaults in sync or generate one from the other.
- Document defaults in schema descriptions.

#### Best Practices

- Prefer safe defaults (`notify: false`).
- Integration test “omit optional” paths.
- Introspection exposes defaults to codegen.

#### Common Mistakes

- Divergent defaults in SDL vs code.
- Default that enables expensive side effects.
- Using defaults to fix breaking changes silently.

---

## 6.4 Mutation Response

### 6.4.1 Returning Created Object

#### Beginner

After `createUser`, return `user { id email }` so UI can navigate and cache can register the entity.

#### Intermediate

Include **computed fields** (avatar URL, display name) that UI needs immediately. **Global IDs** for Relay clients.

#### Expert

Return **edge** for connection inserts: `{ userEdge { node { id } cursor } }` to splice into lists without refetch.

```graphql
mutation {
  createProject(input: { name: "Wiki" }) {
    project {
      id
      name
      createdAt
      owner {
        id
      }
    }
  }
}
```

```javascript
return {
  project: {
    id: row.id,
    name: row.name,
    createdAt: row.created_at.toISOString(),
    owner: { id: row.owner_id },
  },
};
```

#### Key Points

- Created object should match `Project` type elsewhere for cache normalization.
- Timestamps from DB are source of truth.
- Nested owner can be a stub `{ id }` if full fetch is expensive—document.

#### Best Practices

- Return all fields the creating form displayed as editable defaults.
- Use same date scalar serialization everywhere.
- Avoid exposing internal-only columns.

#### Common Mistakes

- Returning only `id` when UI needs more.
- Different field names than query type (cache break).
- Forgetting `__typename` implications in Apollo (usually automatic).

---

### 6.4.2 Success/Error Response

#### Beginner

GraphQL HTTP often returns **200** with `errors` array for partial failures. Top-level `errors` entries have `message`, `path`, `locations`, optional `extensions`.

#### Intermediate

**Mutation-specific**: success in `data.mutationField`, validation in payload `errors` list, or throw `GraphQLError` for fatal cases. Decide org-wide convention.

#### Expert

**Apollo Federation** and gateways may add `extensions` for trace ids. **Custom error codes** enable client branching without string matching messages.

```javascript
import { GraphQLError } from "graphql";

function insufficientFunds() {
  return new GraphQLError("Insufficient funds", {
    extensions: { code: "INSUFFICIENT_FUNDS" },
  });
}

// In resolver
if (balance < amount) throw insufficientFunds();
```

```graphql
type ChargePayload {
  receipt: Receipt
  userErrors: [UserError!]!
}

type UserError {
  field: [String!]
  message: String!
}
```

#### Key Points

- Do not rely on HTTP codes alone in GraphQL.
- `extensions.code` is widely used for machine-readable errors.
- User-facing copy may differ from `message` in hardened APIs.

#### Best Practices

- Centralize error factory functions.
- Never put secrets in error messages.
- Map unexpected exceptions to generic message in production.

#### Common Mistakes

- Inconsistent error shapes across mutations.
- Using `message` for logic in clients (fragile i18n).
- Swallowing errors returning null without clearing why.

---

### 6.4.3 Partial Updates

#### Beginner

**Partial update** means only some columns change; response should reflect **full current state** or at least updated fields.

#### Intermediate

Clients merge into cache; returning full object avoids stale fields. If only delta returned, clients must patch manually.

#### Expert

**JSON merge patch** semantics are subtle; GraphQL inputs are explicit fields. **Optimistic locking** failures should return structured conflict, not generic 500.

```graphql
mutation {
  updateUser(input: { displayName: "Ada" }) {
    user {
      id
      displayName
      email
      updatedAt
    }
  }
}
```

```javascript
async function updateUser(_, { input }, ctx) {
  const user = await ctx.db.users.patch(ctx.user.id, input);
  return { user };
}
```

#### Key Points

- Full resource in response simplifies caches.
- `updatedAt` helps detect concurrent edits.
- Partial failure in batch needs per-item shape.

#### Best Practices

- Return fields that can change from any allowed input key.
- Document read-only fields ignored in input.
- Test concurrent updates.

#### Common Mistakes

- Returning input echo instead of DB truth.
- Omitting fields that other tabs in UI still show stale.
- Nulling unspecified fields accidentally.

---

### 6.4.4 Batch Response

#### Beginner

Return **arrays** of results: `results: [ImportRowResult!]!` with `success` + `errorMessage` per row.

#### Intermediate

Align order with input order for deterministic client mapping. Include **indices** if rows can be reordered.

#### Expert

For huge batches, return **job id** + poll `importJobStatus` mutation/query. **Streaming** responses are not classic GraphQL HTTP—consider separate API.

```graphql
type ImportRowResult {
  index: Int!
  ok: Boolean!
  error: String
  recordId: ID
}

type ImportCsvPayload {
  results: [ImportRowResult!]!
}
```

```javascript
async function importCsv(_, { rows }, ctx) {
  const results = [];
  for (let i = 0; i < rows.length; i++) {
    try {
      const id = await ctx.db.importRow(rows[i]);
      results.push({ index: i, ok: true, error: null, recordId: id });
    } catch (e) {
      results.push({ index: i, ok: false, error: e.message, recordId: null });
    }
  }
  return { results };
}
```

#### Key Points

- Per-row results preserve UX for partial success.
- Order preservation is a contract.
- Large batches belong async.

#### Best Practices

- Cap rows per request.
- Aggregate success count in payload for dashboards.
- Idempotent row keys if clients retry.

#### Common Mistakes

- Throwing on first failure without reporting prior successes.
- Misaligned indices after filtering input.
- Returning verbose stack per row to clients.

---

### 6.4.5 Response Metadata

#### Beginner

Expose useful extras: `clientMutationId`, `version`, `warnings: [String!]`.

#### Intermediate

**Extensions** (experimental in some clients) or dedicated payload fields. **Tracing** timing often goes in HTTP headers or Apollo tracing extension.

#### Expert

**Rate limit** headers (`X-RateLimit-Remaining`) complement GraphQL body. **ETag** rarely used with POST mutations—prefer payload metadata for resource version.

```graphql
type UpdateDocumentPayload {
  document: Document!
  serverVersion: Int!
  warnings: [String!]!
}
```

```javascript
return {
  document: updated,
  serverVersion: updated.version,
  warnings: deprecatedFeaturesUsed,
};
```

#### Key Points

- Metadata supports debugging and client state machines.
- Keep metadata small and documented.
- Version fields enable conflict UI.

#### Best Practices

- Use `warnings` for deprecations, not errors.
- Include request id in logs server-side; optional in extensions for support.
- Avoid duplicating HTTP headers in body without reason.

#### Common Mistakes

- Unbounded warning arrays.
- Using metadata for large binary data.
- Breaking clients by renaming metadata fields.

---

## 6.5 Optimistic Responses

### 6.5.1 Client-Side Prediction

#### Beginner

**Predict** the mutation outcome locally before the server answers: e.g., assume `likePost` increments `likeCount` by 1.

#### Intermediate

Prediction uses **cached data** + mutation arguments. Must match server rules or UI will flicker on correction.

#### Expert

**Probabilistic** features (A/B) make prediction hard—disable optimistic for those paths. **Server-assigned fields** (ids, timestamps) need temp placeholders or deferred optimistic display.

```javascript
// Apollo-like pseudocode
const optimisticResponse = {
  __typename: "Mutation",
  likePost: {
    __typename: "LikePostPayload",
    post: {
      __typename: "Post",
      id: postId,
      likeCount: previousCount + 1,
      likedByMe: true,
    },
  },
};
```

#### Key Points

- Prediction requires accurate understanding of server logic.
- `__typename` is required for normalized caches.
- Wrong prediction is a UX bug, not a server bug.

#### Best Practices

- Mirror resolver business rules in a shared util when possible.
- Feature-flag optimistic paths per screen.
- Log prediction mismatches in dev.

#### Common Mistakes

- Optimistic increment when server caps counts.
- Missing typenames breaking cache.
- Predicting forbidden actions without auth check.

---

### 6.5.2 Optimistic UI

#### Beginner

**Optimistic UI** updates interface immediately: checkbox toggles, list item appears, then confirms or rolls back.

#### Intermediate

Apollo `optimisticResponse`, Relay `commitMutation` optimistic updater, urql cache exchange. **Lists** need insert order and temporary ids.

#### Expert

**Normalized caches** update entities by id; **pagination** lists need `cache.modify` or relay store updaters. **Fragment** colocation ensures optimistic shape matches query fragments.

```javascript
// Apollo cache update + optimistic response sketch
client.mutate({
  mutation: ADD_COMMENT,
  variables: { postId, body },
  optimisticResponse: {
    addComment: {
      __typename: "AddCommentPayload",
      comment: {
        __typename: "Comment",
        id: `temp-${Date.now()}`,
        body,
        author: { __typename: "User", id: me.id, handle: me.handle },
      },
    },
  },
  update(cache, { data }) {
    /* splice comment into post.comments connection */
  },
});
```

#### Key Points

- Optimistic UI improves perceived performance.
- Rollback path must be smooth.
- Complex connections need expert cache surgery.

#### Best Practices

- Use temporary ids prefixed for easy identification.
- Replace temp id with server id on completion.
- Test on slow 3G throttling.

#### Common Mistakes

- Forgetting to update all cached queries showing the entity.
- Optimistic duplicate rows in lists.
- No loading state when optimistic disabled.

---

### 6.5.3 Rollback Handling

#### Beginner

On mutation **failure**, revert optimistic changes: restore previous cache or refetch.

#### Intermediate

Apollo rolls back automatically if `onError` fires and optimistic was used; custom updaters may need manual undo. **Relay** store snapshots help.

#### Expert

**Partial success** (batch) requires per-item rollback in client state, not whole mutation. **Race**: two mutations—sequence rollbacks carefully.

```javascript
client.mutate({
  mutation: RENAME_BOARD,
  optimisticResponse: { /* ... */ },
  onError() {
    client.refetchQueries({ include: [BOARD_QUERY] });
  },
});
```

#### Key Points

- Rollback should return UI to authoritative server state.
- Refetch is simple but slower than precise cache undo.
- User messaging on failure builds trust.

#### Best Practices

- Show toast on failure explaining state reverted.
- Avoid double rollback (framework + manual).
- Keep rollback idempotent.

#### Common Mistakes

- Leaving temp entities in cache after error.
- Silent failure with inconsistent UI.
- Refetch storm on every keystroke error.

---

### 6.5.4 Error Recovery

#### Beginner

Let users **retry** failed mutations. Show error message from `errors[0].message` or payload `userErrors`.

#### Intermediate

**Exponential backoff** for transient errors (503, network). **Idempotency** prevents duplicate charges on retry.

#### Expert

**Offline queues** (mobile): persist mutations, replay when online—conflict resolution required. **Circuit breaker** stops hammering dead services.

```javascript
async function mutateWithRetry(client, options, { retries = 3 } = {}) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      return await client.mutate(options);
    } catch (e) {
      lastErr = e;
      if (!isTransient(e)) break;
      await sleep(2 ** i * 100);
    }
  }
  throw lastErr;
}
```

#### Key Points

- Classify errors: user fixable vs transient vs fatal.
- Retries + idempotency go together for writes.
- Offline is advanced; start with online retry.

#### Best Practices

- Map `extensions.code` to recovery flows.
- Disable retry for non-idempotent mutations without keys.
- Log retry counts.

#### Common Mistakes

- Infinite retry loops.
- Retrying validation errors.
- Losing user input on error.

---

### 6.5.5 Conflict Resolution

#### Beginner

**Conflict** when two edits clash: concurrent `update` overwrites, or version mismatch.

#### Intermediate

Strategies: **last-write-wins** (simple), **version field** reject, **merge** (CRDTs for text). Return `409`-like code in `extensions`.

#### Expert

**Operational transformation** and **CRDT** live in domain layer; GraphQL exposes `saveDocument(version:, patch:)` patterns. **ETags** conceptually map to `expectedVersion`.

```graphql
type Mutation {
  updateWikiPage(
    id: ID!
    expectedVersion: Int!
    input: UpdateWikiPageInput!
  ): UpdateWikiPagePayload!
}
```

```javascript
async function updateWikiPage(_, { id, expectedVersion, input }, ctx) {
  const row = await ctx.db.pages.updateIfVersion(id, expectedVersion, input);
  if (!row)
    throw new GraphQLError("Version conflict", {
      extensions: { code: "CONFLICT", expectedVersion },
    });
  return { page: row };
}
```

#### Key Points

- Conflicts are normal in collaborative apps.
- Surface conflicts to users with resolution choices.
- Server is source of truth.

#### Best Practices

- Always return current server version on conflict.
- Offer “reload and merge” UX for text.
- Audit conflict rates.

#### Common Mistakes

- Silent last-write-wins losing data.
- No version field on highly contended resources.
- Cryptic conflict errors.

---

## 6.6 Transaction Management

### 6.6.1 Multi-Step Mutations

#### Beginner

One mutation resolver runs **multiple DB statements** in order: create invoice, create line items.

#### Intermediate

Wrap in a **single DB transaction** so partial failure rolls back. Return single payload aggregating results.

#### Expert

**Saga** when steps span services: mutation starts saga, returns `processId`; compensating transactions on failure. **Orchestration** vs **choreography** is architectural.

```javascript
async function createInvoice(_, { input }, ctx) {
  return ctx.db.transaction(async (tx) => {
    const inv = await tx.invoices.create(input.header);
    await tx.lineItems.bulkInsert(
      input.lines.map((l) => ({ ...l, invoiceId: inv.id }))
    );
    return { invoice: await tx.invoices.loadWithLines(inv.id) };
  });
}
```

#### Key Points

- Multi-step in one mutation should be atomic if advertised as such.
- Cross-service steps need different patterns than SQL transactions.
- Timeouts apply to whole mutation.

#### Best Practices

- Keep transaction scope short.
- Avoid HTTP calls inside DB transactions.
- Return composite payload ids for tracing.

#### Common Mistakes

- Partial commit without telling client.
- Long transactions locking tables.
- Mixing sync steps with async side effects incorrectly.

---

### 6.6.2 Atomic Operations

#### Beginner

**Atomic** means all-or-nothing: either every write succeeds or none persist.

#### Intermediate

SQL `BEGIN`/`COMMIT`/`ROLLBACK`. **MongoDB** multi-doc transactions in replica sets. GraphQL does not guarantee atomicity—you implement it.

#### Expert

**Serializable isolation** vs **read committed** tradeoffs under load. **Retries** on serialization failure (`40001`) with backoff.

```javascript
await db.transaction(async (tx) => {
  await tx.exec("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [
    amount,
    from,
  ]);
  await tx.exec("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [
    amount,
    to,
  ]);
});
```

#### Key Points

- Atomicity boundaries must match user mental model.
- Document what happens on mid-flight crash.
- Isolation level affects phantom reads.

#### Best Practices

- Use constraints and `UPDATE ... WHERE version` for races.
- Test rollback paths.
- Monitor transaction duration.

#### Common Mistakes

- Nested transactions without savepoints misunderstanding.
- Assuming GraphQL field order implies cross-request atomicity.
- Side effects outside transaction that do not roll back.

---

### 6.6.3 Rollback Handling

#### Beginner

On error inside transaction, **rollback** discards writes. Resolver throws; client sees `errors`.

#### Intermediate

Map DB errors to `GraphQLError`. **Savepoints** for partial rollback within one mutation (advanced).

#### Expert

**Compensating transactions** in sagas undo prior steps (e.g., refund after ship failure). **Outbox** ensures message not published if tx rolls back.

```javascript
try {
  await db.transaction(async (tx) => {
    await tx.step1();
    throw new Error("fail");
  });
} catch (e) {
  throw new GraphQLError("Could not complete operation", {
    extensions: { code: "TRANSACTION_FAILED" },
  });
}
```

#### Key Points

- Client should not assume partial success unless designed for it.
- Rollback does not undo external HTTP calls—avoid or compensate.
- Logs should include transaction id.

#### Best Practices

- Catch, map, rethrow domain errors inside tx callback carefully.
- Use `SET LOCAL` for per-transaction settings in Postgres.
- Integration tests for failure injection.

#### Common Mistakes

- Swallowing errors committing nothing without clear message.
- Sending webhooks inside uncommitted transaction.
- Leaking SQL errors to clients.

---

### 6.6.4 Consistency Guarantees

#### Beginner

After successful mutation, **read-your-writes**: client should see updated data on next read (may require primary DB read).

#### Intermediate

**Eventual consistency** across read replicas—route critical reads to primary after mutation. **Cache** invalidation keeps CDN consistent.

#### Expert

**Linearizability** vs **causal consistency** in distributed systems—GraphQL API docs should set expectations. **Federation** may have temporary inconsistency across subgraphs.

```javascript
// Route session to primary after write
ctx.db.usePrimaryForSession(ctx.requestId);
```

#### Key Points

- Consistency model is a product decision, not GraphQL default.
- Mobile offline adds complexity.
- Stale reads confuse users after “success” toast.

#### Best Practices

- Document replica lag behavior.
- Use sticky sessions or read-after-write tokens.
- Invalidate client cache keys on mutation success.

#### Common Mistakes

- Reading from replica immediately after mutation.
- Assuming subgraphs sync instantly.
- Over-promising strong consistency globally.

---

### 6.6.5 Distributed Transactions

#### Beginner

**Distributed transaction**: money debit in service A and credit in service B must coordinate—harder than single DB.

#### Intermediate

Patterns: **2PC** (rare in microservices), **Saga**, **outbox + consumer**. GraphQL mutation is one entry point orchestrating calls.

#### Expert

**Idempotency** across services with shared keys. **Timeouts** and **human intervention** queues for stuck sagas. Avoid long synchronous chains in GraphQL resolver (latency).

```javascript
async function transferPoints(_, { from, to, amount }, ctx) {
  const idemKey = ctx.req.header("idempotency-key");
  if (await ctx.ledger.alreadyProcessed(idemKey)) {
    return { transfer: await ctx.ledger.result(idemKey) };
  }
  await ctx.saga.startTransfer({ idemKey, from, to, amount });
  return { transfer: { status: "PENDING" } };
}
```

#### Key Points

- True cross-service ACID is rare; sagas are pragmatic.
- GraphQL should not block minutes waiting for all steps.
- Pending states belong in schema.

#### Best Practices

- Return process ids for async workflows.
- Implement compensating actions.
- Monitor saga completion times.

#### Common Mistakes

- Synchronous HTTP cascade with no timeouts.
- No idempotency on double-submit.
- Hiding pending state, showing false success.

---

## 6.7 Advanced Mutation Patterns

### 6.7.1 Bulk Mutations

#### Beginner

**Bulk** operations affect many entities: `mergeTopics(into: ID!, from: [ID!]!): BulkMergePayload!`.

#### Intermediate

Use **background jobs** for large bulk; mutation returns `jobId`. **Progress** via subscription or polling field `bulkJob(id)`.

#### Expert

**Chunk processing** with rate limits to protect DB. **Dead letter** queue for failures. **Audit** bulk actions for compliance.

```graphql
type Mutation {
  archiveThreads(ids: [ID!]!): ArchiveThreadsPayload!
}

type ArchiveThreadsPayload {
  archivedIds: [ID!]!
  failed: [BulkFailure!]!
}
```

```javascript
async function archiveThreads(_, { ids }, ctx) {
  const archivedIds = [];
  const failed = [];
  for (const id of ids.slice(0, 1000)) {
    try {
      await ctx.db.threads.archive(id);
      archivedIds.push(id);
    } catch (e) {
      failed.push({ id, reason: e.message });
    }
  }
  return { archivedIds, failed };
}
```

#### Key Points

- Bulk mutations are admin-heavy and risky.
- Caps and async are essential at scale.
- Structured failures preserve operability.

#### Best Practices

- Require elevated role.
- Soft-delete first for recoverability.
- Emit one analytics event per bulk op, not per row.

#### Common Mistakes

- Unbounded `ids`.
- All-or-nothing without reporting which failed.
- Long synchronous bulk blocking event loop.

---

### 6.7.2 Conditional Mutations

#### Beginner

Mutations that run only if a condition holds: SQL `UPDATE ... WHERE status = 'DRAFT'`.

#### Intermediate

Expose `expectedStatus` or `ifMatches: PostState` argument. Return `ok: false` with reason or throw `CONFLICT`.

#### Expert

**Compare-and-set** with version integers. **GraphQL** does not standardize HTTP preconditions—encode in schema.

```graphql
mutation {
  publishIfDraft(id: "p1", expectedStatus: DRAFT) {
    publishedPost {
      id
      status
    }
    applied
  }
}
```

```javascript
async function publishIfDraft(_, { id, expectedStatus }, ctx) {
  const row = await ctx.db.posts.tryPublish(id, expectedStatus);
  return { publishedPost: row.post, applied: row.changed };
}
```

#### Key Points

- Conditions prevent accidental state transitions.
- `applied: Boolean` helps clients branch without errors.
- Align with optimistic locking.

#### Best Practices

- Document allowed transitions as a state machine diagram.
- Test race between two publishers.
- Metrics on `applied: false` rate.

#### Common Mistakes

- Check-then-act race without DB support.
- Throwing for benign “already published” when UI wants idempotent success.
- Confusing `null` return with false condition.

---

### 6.7.3 Cascading Updates

#### Beginner

Changing a **parent** updates **children**: rename folder renames display paths; delete user deletes posts (policy-dependent).

#### Intermediate

Implement via **DB foreign keys ON CASCADE**, triggers, or explicit service code. GraphQL returns parent; children may need refetch.

#### Expert

**Soft cascade** marks children deleted; **hard cascade** removes rows. **Federation** may need **entity deletion events** across subgraphs.

```javascript
async function deleteProject(_, { id }, ctx) {
  await ctx.db.transaction(async (tx) => {
    await tx.tasks.deleteByProject(id);
    await tx.projects.delete(id);
  });
  return { deletedProjectId: id };
}
```

#### Key Points

- Cascades are policy and performance sensitive.
- Document what deletes with what.
- Async cascade may leave temporary inconsistency.

#### Best Practices

- Prefer DB cascades for referential integrity.
- Limit cascade depth to avoid accidents.
- Offer `dryRun` flag for destructive cascades (admin).

#### Common Mistakes

- Accidental orphan rows.
- Deleting without checking quotas or billing implications.
- Returning huge child lists in delete payload.

---

### 6.7.4 Payload Patterns

#### Beginner

Common patterns: **Node + errors**, **union result**, **field + query root** (Relay).

#### Intermediate

`MutationPayload { user: User userErrors: [UserError!]! }` vs `union RegisterResult = RegisterSuccess | ValidationFailed`.

#### Expert

**Relay** `clientMutationId`. **Apollo** recommends returning affected objects for cache. **Omit errors** from union members for simpler TS discriminated unions.

```graphql
union DeleteAccountResult = DeleteSuccess | DeleteBlocked

type DeleteSuccess {
  deleted: Boolean!
}

type DeleteBlocked {
  reason: String!
}

type Mutation {
  deleteAccount: DeleteAccountResult!
}
```

```javascript
async function deleteAccount(_, _args, ctx) {
  if (ctx.user.hasOutstandingBalance) {
    return { __typename: "DeleteBlocked", reason: "Outstanding balance" };
  }
  await ctx.users.delete(ctx.user.id);
  return { __typename: "DeleteSuccess", deleted: true };
}
```

#### Key Points

- Unions enforce exhaustive handling in typed clients.
- Payload pattern with `userErrors` allows partial success UX.
- `__typename` is required for union resolution in resolvers.

#### Best Practices

- Pick one primary pattern per API for consistency.
- Document error vs union member choice.
- Add new union members as non-breaking if clients handle unknown.

#### Common Mistakes

- Resolver returning wrong `__typename`.
- Mixing unions and top-level GraphQL errors inconsistently.
- Payload too large for mobile.

---

### 6.7.5 Error Response Standards

#### Beginner

Standardize **`extensions.code`**: `UNAUTHENTICATED`, `FORBIDDEN`, `BAD_USER_INPUT`, `INTERNAL_SERVER_ERROR` (align with Apollo/GraphQL community practice).

#### Intermediate

Add **`extensions.fieldPath`** or RFC-style problem details in extensions. **i18n**: `code` + `args` for client translation.

#### Expert

**OpenTelemetry** span status from error codes. **Gateway** maps subgraph errors to public shape stripping internals.

```javascript
import { GraphQLError } from "graphql";

export const GqlErrors = {
  forbidden: () =>
    new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } }),
  badInput: (msg, fields) =>
    new GraphQLError(msg, {
      extensions: { code: "BAD_USER_INPUT", fields },
    }),
};
```

#### Key Points

- Standards help clients branch consistently.
- Do not expose internal codes to public APIs without review.
- GraphQL allows multiple errors; order may matter for UI.

#### Best Practices

- Publish error catalog to API consumers.
- Integration tests assert codes.
- Strip `extensions` details in production for unexpected errors.

#### Common Mistakes

- Every mutation inventing new string codes.
- Empty extensions on all errors.
- Returning 401 HTTP for GraphQL when some fields could still resolve (partial).

---

*End of GraphQL Mutations notes (Topic 6).*
