# Database Integration

## 📑 Table of Contents

- [27.1 SQL Databases](#271-sql-databases)
  - [27.1.1 PostgreSQL Integration](#2711-postgresql-integration)
  - [27.1.2 MySQL Integration](#2712-mysql-integration)
  - [27.1.3 SQLite Integration](#2713-sqlite-integration)
  - [27.1.4 ORM Selection](#2714-orm-selection)
  - [27.1.5 Connection Pooling](#2715-connection-pooling)
- [27.2 ORM Integration](#272-orm-integration)
  - [27.2.1 Sequelize Integration](#2721-sequelize-integration)
  - [27.2.2 TypeORM Integration](#2722-typeorm-integration)
  - [27.2.3 Prisma Integration](#2723-prisma-integration)
  - [27.2.4 SQLAlchemy Integration (Python)](#2724-sqlalchemy-integration-python)
  - [27.2.5 Mongoose (MongoDB)](#2725-mongoose-mongodb)
- [27.3 Query Building](#273-query-building)
  - [27.3.1 Query Builders](#2731-query-builders)
  - [27.3.2 Query Optimization](#2732-query-optimization)
  - [27.3.3 Query Complexity](#2733-query-complexity)
  - [27.3.4 Batch Queries](#2734-batch-queries)
  - [27.3.5 Transactions](#2735-transactions)
- [27.4 Relationship Handling](#274-relationship-handling)
  - [27.4.1 One-to-One Relationships](#2741-one-to-one-relationships)
  - [27.4.2 One-to-Many Relationships](#2742-one-to-many-relationships)
  - [27.4.3 Many-to-Many Relationships](#2743-many-to-many-relationships)
  - [27.4.4 Eager vs Lazy Loading](#2744-eager-vs-lazy-loading)
  - [27.4.5 Circular Relationships](#2745-circular-relationships)
- [27.5 Data Mutations](#275-data-mutations)
  - [27.5.1 Create Operations](#2751-create-operations)
  - [27.5.2 Update Operations](#2752-update-operations)
  - [27.5.3 Delete Operations](#2753-delete-operations)
  - [27.5.4 Batch Operations](#2754-batch-operations)
  - [27.5.5 Bulk Operations](#2755-bulk-operations)
- [27.6 Database Performance](#276-database-performance)
  - [27.6.1 Indexing Strategy](#2761-indexing-strategy)
  - [27.6.2 Query Performance](#2762-query-performance)
  - [27.6.3 Query Analysis](#2763-query-analysis)
  - [27.6.4 Optimization Techniques](#2764-optimization-techniques)
  - [27.6.5 Monitoring](#2765-monitoring)
- [27.7 Advanced Database Integration](#277-advanced-database-integration)
  - [27.7.1 Migrations](#2771-migrations)
  - [27.7.2 Seeds](#2772-seeds)
  - [27.7.3 Database Transactions](#2773-database-transactions)
  - [27.7.4 Event Sourcing](#2774-event-sourcing)
  - [27.7.5 CQRS Pattern](#2775-cqrs-pattern)

---

## 27.1 SQL Databases

### 27.1.1 PostgreSQL Integration

#### Beginner

**PostgreSQL** is a common production choice for GraphQL APIs: **ACID**, **JSON/JSONB**, **full-text search**, and **extensions** (PostGIS). Node connects via **`pg`** or ORMs like **Prisma** that target Postgres dialects.

#### Intermediate

Use **parameterized queries** in resolvers to prevent SQL injection. Map **GraphQL types** to **tables/views**; use **database views** for stable read models. **Row-Level Security (RLS)** can enforce tenancy when paired with **`SET LOCAL`** session variables per request.

#### Expert

**LISTEN/NOTIFY**, **logical replication**, and **partitioning** support high-scale patterns. For **GraphQL subscriptions**, bridge **NOTIFY** to **pubsub** carefully to avoid **fan-out storms**. Tune **`work_mem`**, **`shared_buffers`**, and **connection limits** vs your pool size.

```javascript
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
});

export async function getUserById(id) {
  const { rows } = await pool.query(
    "select id, email, display_name from users where id = $1",
    [id]
  );
  return rows[0] ?? null;
}
```

```graphql
type User {
  id: ID!
  email: String!
  displayName: String!
}

type Query {
  user(id: ID!): User
}
```

#### Key Points

- Postgres pairs well with GraphQL’s nested reads when indexed.
- Pool sizing must match server concurrency.
- RLS is optional but powerful for multi-tenant graphs.

#### Best Practices

- Use migrations for all DDL.
- Create indexes for foreign keys and filter columns.
- Log slow queries with `log_min_duration_statement` in staging.

#### Common Mistakes

- Opening a new connection per resolver (no pooling).
- N+1 SQL from naive nested resolvers without DataLoader.
- Using `SERIAL` without sequences ownership clarity in migrations.

---

### 27.1.2 MySQL Integration

#### Beginner

**MySQL** (or **MariaDB**) works with GraphQL through **`mysql2`** promises or ORMs. Choose **InnoDB** for transactions and foreign keys.

#### Intermediate

**JSON columns** map to GraphQL scalars or structured types. Watch **case sensitivity** in table/column names across OS. **Read replicas** can serve heavy **list** resolvers if **replication lag** is acceptable.

#### Expert

**Gap locks** and **next-key locks** affect concurrent mutations—keep transactions short. **GraphQL batching** + wide joins can stress **tmp table** usage; profile with **`EXPLAIN ANALYZE`**.

```javascript
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  uri: process.env.MYSQL_URL,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});

export async function listPosts(limit) {
  const [rows] = await pool.execute(
    "SELECT id, title, created_at AS createdAt FROM posts ORDER BY created_at DESC LIMIT :limit",
    { limit }
  );
  return rows;
}
```

#### Key Points

- InnoDB is the default transactional engine.
- Replication lag matters for read-your-writes UX.
- Parameterized queries are mandatory.

#### Best Practices

- Set explicit charset (`utf8mb4`).
- Index sort columns used in GraphQL list fields.
- Separate writer vs reader pools when scaling reads.

#### Common Mistakes

- Storing datetimes without timezone discipline.
- Using `SELECT *` in hot resolvers.
- Ignoring lock contention on hot rows.

---

### 27.1.3 SQLite Integration

#### Beginner

**SQLite** embeds a database file—great for **local dev**, **tests**, and **edge** prototypes. Node uses **`better-sqlite3`** (sync) or **`sqlite`/`sqlite3`** (async).

#### Intermediate

**Write concurrency** is limited (one writer); GraphQL servers with high write rates may bottleneck. Use **WAL mode** for better read/write overlap. **Foreign keys** must be **enabled** explicitly (`PRAGMA foreign_keys = ON`).

#### Expert

**Attaching** multiple DB files or **litestream** replication patterns can extend SQLite into small production footprints. For **serverless**, consider **Turso/libSQL** compatibility layers. Avoid **long transactions** holding locks across async GraphQL middleware.

```javascript
import Database from "better-sqlite3";

const db = new Database(process.env.SQLITE_PATH || ":memory:");
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function findTodo(id) {
  return db.prepare("SELECT id, title, done FROM todos WHERE id = ?").get(id);
}
```

#### Key Points

- SQLite favors read-heavy GraphQL prototypes.
- WAL improves concurrency characteristics.
- Enable foreign keys or refs silently fail.

#### Best Practices

- Use prepared statements for hot paths.
- Snapshot file DBs for CI test runs.
- Keep write transactions milliseconds short.

#### Common Mistakes

- Hosting high-concurrency writes on a single SQLite file.
- Disabling foreign keys and corrupting referential integrity.
- Using network filesystems for SQLite in production.

---

### 27.1.4 ORM Selection

#### Beginner

An **ORM** maps tables to objects and generates SQL. **Prisma** is schema-first; **Sequelize** is mature in JS; **TypeORM** decorates classes—pick based on team taste and TypeScript depth.

#### Intermediate

Evaluate **migration UX**, **raw SQL escape hatches**, **type generation**, and **GraphQL codegen** integration. For **complex reporting**, lean on **SQL views** or **read models** even if writes use ORMs.

#### Expert

**Leaky abstractions** appear at bulk ops, locking, and partial indexes—ensure the ORM supports **raw fragments** safely. **Multi-schema** or **sharded** setups may push you toward **query builders** (`knex`) instead of heavy ORMs.

```javascript
// Decision matrix as code comments — illustrative
// Prisma: excellent DX, strict schema, great TS
// Sequelize: flexible, long track record, imperative models
// TypeORM: Active Record / Data Mapper patterns, decorators
// Knex: query builder, SQL stays visible
```

#### Key Points

- No ORM removes the need for SQL performance skills.
- Schema migrations must be first-class in selection.
- GraphQL resolvers should stay thin; DB logic belongs in services.

#### Best Practices

- Prototype one complex resolver path before committing.
- Standardize transaction boundaries in a service layer.
- Keep ORM version upgrades on a schedule.

#### Common Mistakes

- Choosing purely on hype without migration tooling review.
- Mixing three data layers (ORM + raw + GraphQL) inconsistently.
- Letting ORM defaults create silent N+1 queries.

---

### 27.1.5 Connection Pooling

#### Beginner

A **pool** reuses DB connections instead of connecting per request. Size it from **expected concurrency**, not “more is better.”

#### Intermediate

**PgBouncer** in **transaction mode** works well with stateless GraphQL servers. **Pool exhaustion** surfaces as **timeouts**—correlate with **event loop lag** and **resolver depth**.

#### Expert

**RDS Proxy** / **Cloud SQL Auth Proxy** add resilience and IAM. Watch **prepared statement** limitations in poolers (transaction vs session pooling). **Prisma** manages pools; tune **`connection_limit`** per instance.

```javascript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
  log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
});

export { prisma };
```

#### Key Points

- Pool size × pod count must fit database `max_connections`.
- External poolers change session semantics.
- Timeouts should be explicit.

#### Best Practices

- Use health checks that acquire and release a connection.
- Alert on pool wait time metrics.
- Document per-environment pool settings.

#### Common Mistakes

- 100 Kubernetes pods each opening 20 connections to a small RDS.
- Holding connections across `await` points unnecessarily.
- Ignoring serverless “max connections per function” spikes.

---

## 27.2 ORM Integration

### 27.2.1 Sequelize Integration

#### Beginner

**Sequelize** defines **models** for tables and associations. You call **`Model.findAll`**, **`create`**, etc., inside GraphQL resolvers or services.

#### Intermediate

Use **`include`** for eager loading to mitigate N+1. **Scopes** encapsulate common filters. **Transactions** via **`sequelize.transaction`** wrap multi-step mutations.

#### Expert

**CLS** (continuation-local storage) can propagate transactions across async calls—verify compatibility with your GraphQL server runtime. **Replication** options route reads to replicas. **Dialect-specific** bugs require occasional **literal** SQL.

```javascript
import Sequelize from "sequelize";

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

export const User = sequelize.define(
  "User",
  {
    id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
    email: { type: Sequelize.STRING, allowNull: false, unique: true },
  },
  { tableName: "users", underscored: true }
);

export async function userById(id) {
  return User.findByPk(id);
}
```

```javascript
import { GraphQLError } from "graphql";

export const resolvers = {
  Query: {
    async user(_, { id }) {
      const row = await userById(id);
      if (!row) throw new GraphQLError("Not found", { extensions: { code: "NOT_FOUND" } });
      return row;
    },
  },
};
```

#### Key Points

- Sequelize associations mirror GraphQL nesting risks.
- Transactions belong around multi-table mutations.
- Pooling is built into the Sequelize instance.

#### Best Practices

- Centralize models in a module.
- Add DB constraints, not only model validations.
- Use benchmarks before complex `include` trees.

#### Common Mistakes

- Giant `include` graphs per GraphQL query without limits.
- Relying on validations that race without unique indexes.
- Mixing sync `{ alter: true }` in production.

---

### 27.2.2 TypeORM Integration

#### Beginner

**TypeORM** maps **decorated classes** to tables—popular with **TypeScript** GraphQL code-first schemas.

#### Intermediate

**Repository pattern** keeps resolvers testable. **QueryBuilder** expresses joins with control. **Relations** (`ManyToOne`, `OneToMany`) align with GraphQL parent/child fields.

#### Expert

**DataMapper vs ActiveRecord** mode changes lifecycle hooks. Watch **eager: true** defaults—they can explode query counts. **Subscribers** and **listeners** help audit trails for mutations.

```javascript
// TypeORM is typically TypeScript; JS usage mirrors decorators via experimental syntax or schema files.
// Example shown in TypeScript-compatible style as reference for Node backends:

// import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

// @Entity()
// export class User {
//   @PrimaryGeneratedColumn("uuid")
//   id;
//   @Column({ unique: true })
//   email;
//   @OneToMany(() => Post, (post) => post.author)
//   posts;
// }
```

```javascript
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: ["dist/entities/*.js"],
  synchronize: false,
});

export async function startDb() {
  await AppDataSource.initialize();
}
```

#### Key Points

- TypeORM shines with TS-heavy teams.
- `synchronize: true` is unsafe for production.
- QueryBuilder helps optimize hot paths.

#### Best Practices

- Use migrations (`typeorm migration:run`).
- Lazy-load relations by default; opt-in eager loads.
- Keep GraphQL types and entities aligned via codegen.

#### Common Mistakes

- Enabling synchronize against shared databases.
- Circular imports between entities and GraphQL types.
- Using repositories inside every resolver without batching.

---

### 27.2.3 Prisma Integration

#### Beginner

**Prisma** uses a **`schema.prisma`** file and generates a type-safe **client**. You **`await prisma.user.findUnique`** in resolvers.

#### Intermediate

**`include` / `select`** control column fetch width. **Transactions** via **`$transaction`** batch queries or interactive callbacks. **Middleware** can enforce multi-tenancy filters.

#### Expert

**Prisma Accelerate** / **connection pooling** products help serverless. **Raw queries** (`$queryRaw`) require **tagged templates** for safety. **Read replicas** via **`datasource` extensions** (preview features vary by version).

```javascript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function postsForAuthor(authorId) {
  return prisma.post.findMany({
    where: { authorId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, title: true, createdAt: true },
  });
}
```

```graphql
type Post {
  id: ID!
  title: String!
  createdAt: String!
}

type User {
  id: ID!
  posts: [Post!]!
}
```

#### Key Points

- Prisma client methods map closely to resolver functions.
- `select` reduces over-fetching to GraphQL clients.
- Migrations are `prisma migrate`.

#### Best Practices

- Generate client in CI before tests.
- Use `findUnique` for keyed lookups; indexes must exist.
- Wrap multi-step mutations in `$transaction`.

#### Common Mistakes

- Returning Prisma `Decimal`/`BigInt` without custom scalars.
- Using `include` without `take` limits on large relations.
- Sharing a global client incorrectly in serverless without adapters.

---

### 27.2.4 SQLAlchemy Integration (Python)

#### Beginner

**SQLAlchemy** is Python’s leading SQL toolkit/ORM. **GraphQL servers** like **Strawberry**, **Ariadne**, or **Graphene** call SQLAlchemy sessions inside resolvers.

#### Intermediate

Use **`session.execute(select(User).where(User.id == id))`** (2.0 style). **Scoped sessions** per request avoid leaks in **ASGI** apps (**FastAPI**).

#### Expert

**Async SQLAlchemy** pairs with **`asyncpg`** for high concurrency. **Joinedload/selectinload** control graph loads analogous to GraphQL nesting. Align **DB session lifecycle** with **GraphQL request context**.

```python
from sqlalchemy import select
from sqlalchemy.orm import Session

def resolve_user(_, info, id: str):
    db: Session = info.context["db"]
    user = db.execute(select(User).where(User.id == id)).scalar_one_or_none()
    return user
```

```javascript
// Node BFF calling a Python GraphQL upstream — integration sketch
import fetch from "node-fetch";

export async function gatewayUser(id) {
  const res = await fetch("http://python-api:8000/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: `query($id:ID!){ user(id:$id){ id email } }`,
      variables: { id },
    }),
  });
  return res.json();
}
```

#### Key Points

- Python GraphQL + SQLAlchemy is a common microservice stack.
- Session per request is the default safe pattern.
- Async drivers matter at high fan-out.

#### Best Practices

- Close sessions in middleware/finally blocks.
- Use migrations (Alembic).
- Add indexes for resolver filter columns.

#### Common Mistakes

- Global session shared across requests.
- Lazy loads inside async resolvers causing implicit IO.
- Missing transaction boundaries on multi-table mutations.

---

### 27.2.5 Mongoose (MongoDB)

#### Beginner

**Mongoose** schemas define **documents** in **MongoDB**. GraphQL **ObjectIds** map to **ID scalars** as strings.

#### Intermediate

**`.lean()`** returns plain objects faster for read APIs. **Populate** resembles SQL joins but uses separate queries—watch performance.

#### Expert

**Change streams** feed GraphQL subscriptions for **live** dashboards. **Multi-document ACID** transactions exist but require **replica sets**. Design **embedding vs referencing** to match GraphQL access patterns.

```javascript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    displayName: String,
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

export async function connectMongo() {
  await mongoose.connect(process.env.MONGO_URL);
}
```

```graphql
scalar DateTime

type User {
  id: ID!
  email: String!
  displayName: String
  createdAt: DateTime!
}
```

#### Key Points

- Mongo is document-oriented; GraphQL still benefits from batching.
- Population can cause N+1 without DataLoader.
- Transactions need replica set topology.

#### Best Practices

- Index fields used in `find` from resolver args.
- Validate at schema + GraphQL input levels.
- Use projection to limit fields returned.

#### Common Mistakes

- Storing unbounded arrays that GraphQL lists explode.
- Treating Mongo as “schemaless” in production APIs.
- Missing `_id` to string mapping consistency.

---

## 27.3 Query Building

### 27.3.1 Query Builders

#### Beginner

**Query builders** (e.g., **Knex.js**) compose SQL strings safely with **bindings**. Useful when ORMs feel too heavy.

#### Intermediate

Builders help **dynamic filters** from GraphQL arguments—add **`where` clauses** only when args exist.

#### Expert

**CTE**s, **window functions**, and **lateral joins** remain readable vs raw string concat. Combine builders with **DataLoader** for SQL `WHERE id IN (...)`.

```javascript
import knex from "knex";

export const db = knex({
  client: "pg",
  connection: process.env.DATABASE_URL,
  pool: { min: 2, max: 10 },
});

export function usersByRole(role) {
  return db("users").select("id", "email").where({ role }).limit(100);
}
```

#### Key Points

- Builders reduce SQL injection vs concatenation.
- Dynamic GraphQL args map cleanly to conditional clauses.
- Keep SQL complexity visible for reviews.

#### Best Practices

- Wrap reusable snippets in functions, not copy-paste.
- Add `.debug()` in dev sparingly.
- Test generated SQL against explain plans.

#### Common Mistakes

- Injecting unsanitized sort order strings into `orderBy`.
- Building mega-queries without limits.
- Mixing builder and ORM in conflicting transactions.

---

### 27.3.2 Query Optimization

#### Beginner

**Optimize** by **fetching fewer columns**, **adding indexes**, and **avoiding N+1** resolver queries.

#### Intermediate

Use **`EXPLAIN (ANALYZE, BUFFERS)`** on Postgres for slow operations. **Covering indexes** help list queries. **Partial indexes** accelerate filtered GraphQL list fields.

#### Expert

**Materialized views** refresh on schedules for dashboards. **Cursor pagination** (`WHERE id > $cursor`) outperforms large `OFFSET`. **GraphQL query cost** limits protect DB from expensive traversals.

```javascript
export async function postsByAuthorOptimized(authorId, { after, limit }) {
  return prisma.$queryRaw`
    SELECT id, title, created_at AS "createdAt"
    FROM posts
    WHERE author_id = ${authorId}
      AND (${after}::uuid IS NULL OR id > ${after}::uuid)
    ORDER BY id ASC
    LIMIT ${limit}
  `;
}
```

#### Key Points

- Resolver shape drives SQL shape—design both together.
- OFFSET pagination does not scale.
- Indexes must match actual filter/sort combos.

#### Best Practices

- Capture top slow queries weekly.
- Add composite indexes for multi-column filters.
- Cap list sizes at the schema level.

#### Common Mistakes

- Indexing every column blindly.
- Ignoring selectivity when choosing indexes.
- Letting GraphQL depth limits be the only guardrail.

---

### 27.3.3 Query Complexity

#### Beginner

**Complexity** means how expensive a GraphQL operation is—deep nesting multiplies database work.

#### Intermediate

Implement **complexity plugins** (e.g., **graphql-validation-complexity**) with **field costs**. Weight **list** fields higher than scalars.

#### Expert

**Persisted queries** remove arbitrary client queries. Combine **complexity** with **depth limits** and **rate limiting** tokens. Tune costs using **production traces**.

```javascript
import { createComplexityLimitRule } from "graphql-validation-complexity";

export const complexityRule = createComplexityLimitRule(1200, {
  scalarCost: 1,
  objectCost: 5,
  listFactor: 10,
});
```

```graphql
# Expensive pattern — lists inside lists
query {
  authors(first: 100) {
    posts(first: 100) {
      comments(first: 100) {
        body
      }
    }
  }
}
```

#### Key Points

- Complexity rules approximate worst-case DB load.
- List fields are multipliers.
- Safelisted operations avoid bypass hacks.

#### Best Practices

- Start with conservative limits; relax with data.
- Document max recommended query shapes.
- Log rejected queries for tuning.

#### Common Mistakes

- Only limiting depth, not breadth.
- Uniform costs for cheap vs expensive resolvers.
- Complexity bypass via aliases (mitigate with query hashing).

---

### 27.3.4 Batch Queries

#### Beginner

**Batching** collapses many **`findById`** calls into **`WHERE id IN (...)`** using **DataLoader**.

#### Intermediate

**Prisma `findMany` where `id in`** or **Knex `whereIn`** implement batches. Align **key ordering** with GraphQL expectations.

#### Expert

**Dataloader caching** is per-request—do not share across users. **SQL batch + JOIN** strategies differ: batch IDs vs **single join query** for stable plans.

```javascript
import DataLoader from "dataloader";
import { prisma } from "./prisma.js";

export function createLoaders() {
  return {
    userById: new DataLoader(async (ids) => {
      const users = await prisma.user.findMany({ where: { id: { in: [...ids] } } });
      const map = new Map(users.map((u) => [u.id, u]));
      return ids.map((id) => map.get(id) ?? new Error(`User ${id} missing`));
    }),
  };
}
```

#### Key Points

- DataLoader is the standard GraphQL batching primitive.
- Cache is short-lived (request scoped).
- Preserve result order matching input keys.

#### Best Practices

- One loader per entity type per request.
- Prime loaders after mutations when helpful.
- Monitor batch sizes; chunk huge IN lists.

#### Common Mistakes

- Sharing loaders across concurrent requests.
- Returning undefined instead of Error for missing keys inconsistently.
- Batching without indexes on keyed lookups.

---

### 27.3.5 Transactions

#### Beginner

A **transaction** wraps multiple SQL statements with **ACID** guarantees—**all commit or rollback**.

#### Intermediate

In GraphQL, start a transaction in **mutation** resolvers or service functions. **Isolation levels** (`READ COMMITTED`, `SERIALIZABLE`) trade consistency vs contention.

#### Expert

**Savepoints** allow partial rollback. **Optimistic concurrency** uses **version columns** (`UPDATE ... WHERE id AND version = ?`). **Sagas** span services when a single DB TX cannot cover GraphQL federated writes.

```javascript
import { sequelize, Account, LedgerEntry } from "./models.js";

export async function transferMoney({ fromId, toId, amount }) {
  return sequelize.transaction(async (t) => {
    await Account.decrement("balance", { by: amount, where: { id: fromId }, transaction: t });
    await Account.increment("balance", { by: amount, where: { id: toId }, transaction: t });
    await LedgerEntry.create({ fromId, toId, amount }, { transaction: t });
  });
}
```

#### Key Points

- Mutations affecting multiple tables should use transactions.
- Isolation level defaults vary by database.
- Long transactions block other work—keep them tight.

#### Best Practices

- Retry serialization failures with backoff.
- Avoid user-facing awaits inside transactions.
- Test deadlock scenarios in staging.

#### Common Mistakes

- Nested transactions without savepoints on some ORMs.
- Holding transactions open across network calls.
- Mixing unrelated writes in one TX (long lock duration).

---

## 27.4 Relationship Handling

### 27.4.1 One-to-One Relationships

#### Beginner

**One-to-one** links a row to at most one related row (user ↔ profile). Implement with a **foreign key** on one side and a **unique constraint**.

#### Intermediate

GraphQL can expose **`profile` on `User`** and **`user` on `Profile`**. Resolve with **DataLoader** by foreign key.

#### Expert

**Shared primary key** tables (`profile.user_id` PK/FK) enforce strict 1:1. **Nullable** 1:1 requires careful **null handling** in non-null GraphQL fields.

```javascript
// Prisma schema sketch
// model User { id String @id @default(uuid()) profile Profile? }
// model Profile { userId String @unique user User @relation(fields: [userId], references: [id]) bio String }
```

```graphql
type User {
  id: ID!
  profile: Profile
}

type Profile {
  userId: ID!
  bio: String
  user: User!
}
```

#### Key Points

- Enforce 1:1 in the database, not only in GraphQL types.
- Choose owning side for FK placement.
- Unique constraints prevent accidental duplicates.

#### Best Practices

- Fetch profile via join or batched query.
- Use `@defer` only if your stack supports it and UX warrants.
- Index the FK column.

#### Common Mistakes

- Modeling 1:1 as embedded JSON without constraints.
- Non-null GraphQL fields when FK may be null.
- Resolver N+1 on lists of users to profiles.

---

### 27.4.2 One-to-Many Relationships

#### Beginner

**One-to-many** means one parent has many children (author has many posts). FK lives on the **many** side.

#### Intermediate

GraphQL list fields need **`limit` arguments** and **ordering**. Use **`take/skip` or cursors** at the DB.

#### Expert

**Restricting child visibility** (tenant scoping) belongs in the service/query layer, not scattered across field resolvers inconsistently.

```javascript
export const resolvers = {
  User: {
    async posts(parent, args, ctx) {
      return ctx.loaders.postsByAuthorId.load({
        authorId: parent.id,
        limit: args.first ?? 20,
      });
    },
  },
};
```

#### Key Points

- Always cap lists to protect DB and clients.
- Order must be deterministic for pagination.
- FK indexes speed child lookups.

#### Best Practices

- Use keyset pagination for large feeds.
- DataLoader batches by parent id.
- Document default limits in schema descriptions.

#### Common Mistakes

- Returning unbounded `posts` arrays.
- Random SQL order causing flaky pagination.
- Missing index on `author_id`.

---

### 27.4.3 Many-to-Many Relationships

#### Beginner

**Many-to-many** uses a **join table** (`post_tags`) linking posts and tags.

#### Intermediate

GraphQL may expose **`tags: [Tag!]!`** on `Post` and **`posts` on `Tag`. Resolve via **join queries** or **two-step** loads with batching.

#### Expert

**Association objects** (with extra columns like `addedAt`) map to **GraphQL types** (`PostTag`). **Prisma implicit M:N** vs explicit join model affects mutation ergonomics.

```javascript
await prisma.post.update({
  where: { id: postId },
  data: {
    tags: { set: [], connect: tagIds.map((id) => ({ id })) },
  },
});
```

```graphql
type Post {
  id: ID!
  tags: [Tag!]!
}

type Tag {
  id: ID!
  posts(first: Int = 10): [Post!]!
}
```

#### Key Points

- Explicit join tables carry metadata flexibly.
- `set`/`connect` patterns differ per ORM.
- Both sides of M:N need pagination discipline.

#### Best Practices

- Index both FK columns on join tables.
- Use transactions when replacing all links.
- Validate tag existence before connect.

#### Common Mistakes

- Duplicate join rows without composite PK/unique.
- Exploding M:N queries without limits.
- Orphaned joins after deletes without cascades.

---

### 27.4.4 Eager vs Lazy Loading

#### Beginner

**Eager** loads relations up front (join/`include`). **Lazy** loads on access—risky in GraphQL if each field triggers IO.

#### Intermediate

Prefer **explicit eager** in service functions per resolver shape. **GraphQL** field resolvers encourage **lazy** unless batched.

#### Expert

**DataLoader** turns many lazy field accesses into **batched eager** queries—best of both worlds.

```javascript
// Anti-pattern: lazy per field without batching
// posts(parent) { return prisma.post.findMany({ where: { authorId: parent.id }}) } on User.posts is OK
// but comments(parent) per post without loader causes N+1

// Preferred: loaders batch comments by post ids
```

#### Key Points

- Naive lazy loading + GraphQL = N+1.
- Eager everything can over-fetch.
- DataLoader is the standard mitigation.

#### Best Practices

- Measure SQL counts per GraphQL operation in tests.
- Use `select`/`include` minimally.
- Code review resolver trees.

#### Common Mistakes

- ORM lazy proxies across async boundaries.
- Eager loading entire object graphs “just in case.”
- Assuming Prisma `include` is always one query (it may split).

---

### 27.4.5 Circular Relationships

#### Beginner

**Circular** types reference each other (`User` → `Team` → `User`). GraphQL allows cycles; databases use FKs both ways.

#### Intermediate

Avoid **infinite recursion** in resolvers with **depth/complexity limits** and **nullable** stopping points.

#### Expert

**Fragment cycles** are valid; **query cycles** still hit depth limits. **Serialization** (`JSON.stringify`) for logging can stack overflow on cyclic ORM instances—map to DTOs.

```graphql
type User {
  id: ID!
  team: Team
}

type Team {
  id: ID!
  members: [User!]!
}
```

```javascript
export const resolvers = {
  User: {
    team(user, _args, ctx) {
      return user.teamId ? ctx.loaders.teamById.load(user.teamId) : null;
    },
  },
  Team: {
    members(team, args, ctx) {
      return ctx.loaders.usersByTeamId.load({ teamId: team.id, first: args.first });
    },
  },
};
```

#### Key Points

- Cycles are normal in domain models.
- GraphQL execution must terminate via limits.
- DTOs prevent accidental infinite object graphs in logs.

#### Best Practices

- Default `first` arguments on reciprocal lists.
- Use query cost analysis.
- Integration test maximum depth paths.

#### Common Mistakes

- Removing depth limits because “clients are trusted.”
- Returning ORM models with backrefs to parents unbounded.
- Cache key schemes that recurse infinitely.

---

## 27.5 Data Mutations

### 27.5.1 Create Operations

#### Beginner

**Create** inserts a row—GraphQL **`createUser` mutation** maps to **`INSERT`**.

#### Intermediate

Validate **input objects** at GraphQL and DB layers. Return **created identifiers** for client cache updates.

#### Expert

**Idempotency keys** in mutations prevent duplicate creates on retries. **Partial unique indexes** enforce business rules (e.g., one primary email per tenant).

```javascript
export const resolvers = {
  Mutation: {
    async createPost(_, { input }, ctx) {
      return prisma.post.create({
        data: {
          title: input.title,
          authorId: ctx.user.id,
        },
        select: { id: true, title: true, createdAt: true },
      });
    },
  },
};
```

```graphql
input CreatePostInput {
  title: String!
}

type Mutation {
  createPost(input: CreatePostInput!): Post!
}
```

#### Key Points

- Creates should return enough fields for UI + cache.
- Auth context must constrain who can create what.
- DB defaults (timestamps) should mirror GraphQL scalars.

#### Best Practices

- Use transactions when creating multiple related rows.
- Log mutation names with tenant/user IDs (not PII).
- Add database `NOT NULL` constraints.

#### Common Mistakes

- Trusting client-supplied IDs without validation.
- Omitting `createdBy` audit columns.
- Returning huge rows on create.

---

### 27.5.2 Update Operations

#### Beginner

**Update** modifies existing rows—often **`updateUser` with patch input**.

#### Intermediate

Support **partial updates** with nullable vs omitted fields—GraphQL **`input` types** sometimes use **explicit null** semantics; document behavior.

#### Expert

**Optimistic locking** with `version` fields prevents lost updates. **Conditional updates** (`UPDATE ... WHERE id AND tenant_id`) enforce **multi-tenant** safety.

```javascript
export async function updateDisplayName(userId, displayName) {
  const updated = await prisma.user.updateMany({
    where: { id: userId },
    data: { displayName },
  });
  if (updated.count === 0) throw new Error("Not found");
  return prisma.user.findUnique({ where: { id: userId } });
}
```

#### Key Points

- `updateMany` helps detect no-ops vs errors.
- Patch semantics must be consistent across API layers.
- Return updated entity for Apollo cache friendliness.

#### Best Practices

- Whitelist updatable fields server-side.
- Audit old/new values for sensitive data.
- Index columns used in `where`.

#### Common Mistakes

- Overwriting fields when clients omit them incorrectly.
- Missing tenant predicates in `where`.
- No row-level existence check → generic success responses.

---

### 27.5.3 Delete Operations

#### Beginner

**Delete** removes rows—GraphQL **`deletePost`**.

#### Intermediate

Choose **hard delete** vs **soft delete** (`deleted_at`). Soft deletes need **filtered queries** everywhere.

#### Expert

**Cascading deletes** via FK `ON DELETE CASCADE` vs explicit service orchestration—document **referential integrity** behavior for API consumers.

```javascript
export async function softDeletePost(id) {
  return prisma.post.update({
    where: { id },
    data: { deletedAt: new Date() },
    select: { id: true, deletedAt: true },
  });
}
```

#### Key Points

- Soft delete impacts unique constraints and indexes.
- Returns can be **boolean**, **ID**, or **deleted object**—pick a standard.
- Cascades can surprise API users if implicit.

#### Best Practices

- Prefer idempotent deletes when safe (`DELETE` 0 rows OK).
- Archive critical data before hard delete.
- GraphQL errors for not found vs forbidden.

#### Common Mistakes

- Unique email reuse blocked by soft-deleted rows.
- Exposing soft-deleted records in default list resolvers.
- Deleting parents without handling children.

---

### 27.5.4 Batch Operations

#### Beginner

**Batch** applies the same operation to many IDs—**`archivePosts(ids: [ID!]!)`**.

#### Intermediate

Use **`Promise.all` with chunking** or **`UNNEST`** in SQL for efficiency. Limit batch sizes at the schema.

#### Expert

**Partial success** semantics are tricky in GraphQL—return **`BatchResult`** unions with per-item errors or use **transaction all-or-nothing**.

```javascript
export async function archivePosts(ids) {
  const chunks = [];
  for (let i = 0; i < ids.length; i += 100) chunks.push(ids.slice(i, i + 100));
  let count = 0;
  for (const batch of chunks) {
    const res = await prisma.post.updateMany({
      where: { id: { in: batch }, deletedAt: null },
      data: { archived: true },
    });
    count += res.count;
  }
  return { affected: count };
}
```

#### Key Points

- Chunk to avoid giant `IN` clauses and lock times.
- Decide all-or-nothing vs per-item errors explicitly.
- Authorization checks must run per item or via scoped query.

#### Best Practices

- Enforce maximum input array length.
- Return counts or updated IDs.
- Audit batch mutations heavily.

#### Common Mistakes

- Single item failure rolling back entire unrelated batch without spec.
- OOM from huge input arrays.
- Missing auth checks assuming IDs are unguessable.

---

### 27.5.5 Bulk Operations

#### Beginner

**Bulk** often means **ETL-style** inserts/updates—**CSV import** endpoints or **admin** tools.

#### Intermediate

Use **`COPY`** (Postgres) or **multi-row `INSERT`** from controlled jobs, not arbitrary GraphQL clients.

#### Expert

**Background workers** (BullMQ, Temporal) process bulk jobs; GraphQL kicks off a **job** and polls **status**. **Rate limit** admin mutations.

```javascript
import { Queue } from "bullmq";

const bulkQueue = new Queue("bulk-import", { connection: { host: "redis" } });

export const resolvers = {
  Mutation: {
    async enqueueUserImport(_, { uploadId }) {
      const job = await bulkQueue.add("users", { uploadId });
      return { jobId: job.id };
    },
  },
};
```

#### Key Points

- GraphQL is a poor fit for megabyte payloads—use object storage + jobs.
- Bulk ops belong behind strong auth.
- Progress reporting uses subscriptions or polling fields.

#### Best Practices

- Validate files in staging buckets.
- Idempotent job processing.
- Dead letter queues for failures.

#### Common Mistakes

- Streaming huge CSV through GraphQL strings.
- Synchronous bulk work blocking event loop.
- No visibility into partial failures.

---

## 27.6 Database Performance

### 27.6.1 Indexing Strategy

#### Beginner

**Indexes** speed **`WHERE`**, **`JOIN`**, and **`ORDER BY`**. Too many indexes slow writes.

#### Intermediate

Composite indexes **(tenant_id, created_at)** match common GraphQL list filters. **Partial indexes** help filtered lists (`WHERE published`).

#### Expert

**Index-only scans** require covering columns—coordinate with `SELECT` projections. **BRIN** for very large time-series tables. Revisit indexes after **query plan** regressions on upgrades.

```sql
CREATE INDEX CONCURRENTLY idx_posts_author_created
  ON posts (author_id, created_at DESC)
  WHERE deleted_at IS NULL;
```

#### Key Points

- Index the predicates GraphQL resolvers generate.
- CONCURRENTLY avoids long locks in Postgres (with caveats).
- Partial indexes match soft-delete patterns.

#### Best Practices

- Index foreign keys by default.
- Monitor index bloat and autovacuum health.
- Drop unused indexes found via `pg_stat_user_indexes`.

#### Common Mistakes

- Indexing low-cardinality columns alone.
- Forgetting `DESC` mismatch with `ORDER BY`.
- Creating duplicate redundant indexes.

---

### 27.6.2 Query Performance

#### Beginner

**Slow queries** make GraphQL feel sluggish—measure **p95** resolver times and SQL duration.

#### Intermediate

**Limit joins**—sometimes two simpler queries beat one mega-join due to planner quirks.

#### Expert

**Prepared statements** help when plans stabilize. **Partition pruning** for date-ranged queries. **Read replicas** with **staleness** hints in API docs.

```javascript
import { performance } from "node:perf_hooks";

export async function instrumentedResolve(name, fn) {
  const t0 = performance.now();
  try {
    return await fn();
  } finally {
    const ms = performance.now() - t0;
    if (ms > 200) console.warn(`Slow resolver ${name}: ${ms.toFixed(1)}ms`);
  }
}
```

#### Key Points

- Instrument at both GraphQL and SQL layers.
- p95 matters more than mean for UX.
- Resolver names map ops to traces.

#### Best Practices

- Add OpenTelemetry spans around DB calls.
- Track rows examined vs returned.
- Set SLOs for critical queries.

#### Common Mistakes

- Optimizing before measuring.
- Logging full SQL with PII in production.
- Caching results that are user-specific without keys.

---

### 27.6.3 Query Analysis

#### Beginner

Use **`EXPLAIN`** to see plans. **`ANALYZE`** executes and shows actual timings (Postgres).

#### Intermediate

GraphQL **tracing** extensions (`extensions.tracing`) highlight slow fields. **ORM logging** prints SQL—enable in staging.

#### Expert

**Auto explain** logs plans crossing thresholds. **pg_stat_statements** aggregates SQL fingerprints. Correlate **GraphQL operation name** with **SQL fingerprints** via context tags.

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, title FROM posts
WHERE author_id = $1
ORDER BY created_at DESC
LIMIT 50;
```

#### Key Points

- Plans reveal missing indexes and seq scans.
- Buffers show cache vs disk IO.
- ORMs still require SQL literacy.

#### Best Practices

- Save explains for regressions in tickets.
- Reset stats after schema changes carefully.
- Train devs to read basic plans.

#### Common Mistakes

- Testing explains with tiny dev datasets only.
- Ignoring mis-estimates due to stale stats.
- Running `EXPLAIN ANALYZE` on production mutating data carelessly.

---

### 27.6.4 Optimization Techniques

#### Beginner

**Denormalize** counts (`commentCount`) when reads dominate writes. **Cache** hot entities in Redis with TTL.

#### Intermediate

**Read-through caches** in resolvers; **write-through** invalidation on mutations.

#### Expert

**CQRS** separates read models (see 27.7.5). **Approximate counts** for huge tables. **GraphQL @defer** (where available) streams large payloads.

```javascript
import { createClient } from "redis";

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

export async function getCachedUser(id) {
  const key = `user:${id}`;
  const hit = await redis.get(key);
  if (hit) return JSON.parse(hit);
  const user = await prisma.user.findUnique({ where: { id } });
  if (user) await redis.set(key, JSON.stringify(user), { EX: 30 });
  return user;
}
```

#### Key Points

- Caching must include tenant/user dimensions when needed.
- Denormalization trades write complexity for read speed.
- Invalidate on mutations or accept TTL staleness.

#### Best Practices

- Stamp cache entries with schema versions.
- Use cache aside pattern with dogpile protection.
- Measure hit rates.

#### Common Mistakes

- Caching personalized data under global keys.
- No TTL on volatile objects.
- Forgetting invalidation on admin edits.

---

### 27.6.5 Monitoring

#### Beginner

Monitor **CPU**, **memory**, **disk IO**, **connection counts**, and **slow query logs**.

#### Intermediate

**APM** tools (Datadog, New Relic) trace GraphQL operations to DB spans. **Postgres** `pg_stat_activity` shows blocked queries.

#### Expert

**SLO dashboards** per critical mutation. **Anomaly detection** on error rates from DB pool timeouts. **Synthetic probes** run `__typename` health checks plus **read-only canary queries**.

```javascript
import client from "prom-client";

const gqlDbDuration = new client.Histogram({
  name: "graphql_db_seconds",
  help: "DB time per GraphQL operation",
  labelNames: ["operationName"],
});

export function trackDb(operationName, ms) {
  gqlDbDuration.labels(operationName || "anonymous").observe(ms / 1000);
}
```

#### Key Points

- Labels must stay low-cardinality (avoid raw IDs).
- Pool wait time is an early warning.
- Correlate deploys with DB metric shifts.

#### Best Practices

- Alert on saturation, not single spikes only.
- Review slow logs weekly.
- Document on-call runbooks for DB incidents.

#### Common Mistakes

- High-cardinality Prometheus labels crashing TSDB.
- Monitoring averages only.
- No tracing between GraphQL and SQL.

---

## 27.7 Advanced Database Integration

### 27.7.1 Migrations

#### Beginner

**Migrations** version DDL changes—add column, index, FK—checked into git.

#### Intermediate

**Zero-downtime** deploys use **expand/contract**: add nullable column → backfill → enforce → remove old.

#### Expert

**Online index builds** (`CONCURRENTLY`) and **shadow tables** for large rewrites. **GraphQL schema** changes coordinate with **migration windows** and **feature flags**.

```bash
# Prisma example
npx prisma migrate dev --name add-user-role
```

#### Key Points

- Never edit applied migrations retroactively.
- Backfill jobs may require throttling.
- GraphQL nullable fields help phased rollouts.

#### Best Practices

- Test migrations against production-sized snapshots.
- Automate in CI with ephemeral DBs.
- Keep migrations small and reversible when possible.

#### Common Mistakes

- Blocking migrations locking huge tables on deploy.
- Adding non-null columns without defaults in one step.
- Drift between environments.

---

### 27.7.2 Seeds

#### Beginner

**Seeds** insert **baseline data** for dev/test—admin user, reference tags.

#### Intermediate

**Idempotent seeds** (`upsert`) allow re-runs. Separate **dev** vs **staging** datasets.

#### Expert

**Synthetic data generators** (faker) create volume tests for GraphQL queries. **PII** must not leak from seeds to shared envs.

```javascript
import { prisma } from "./prisma.js";

export async function seed() {
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { email: "admin@example.com", role: "ADMIN" },
  });
}
```

#### Key Points

- Seeds speed local GraphQL development.
- Upserts reduce friction.
- Production data belongs in migrations/jobs, not casual seeds.

#### Best Practices

- Wire `package.json` script `db:seed`.
- Keep seeds fast (< few seconds).
- Document required env vars.

#### Common Mistakes

- Hard-coded passwords committed to repos.
- Seeds assuming empty DB when tables already have rows.
- Using production dumps in developer laptops.

---

### 27.7.3 Database Transactions

#### Beginner

Transactions group writes—already covered in 27.3.5; here emphasize **GraphQL mutation mapping**: one mutation → one service function → one TX boundary.

#### Intermediate

**GraphQL batching** of mutations is **not** one TX by default—clients may send independent ops.

#### Expert

**Distributed transactions** across services are avoided; use **outbox pattern** for reliable cross-DB effects.

```javascript
export async function createOrderWithItems(input, ctx) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({ data: { userId: ctx.user.id } });
    await tx.orderItem.createMany({
      data: input.items.map((i) => ({
        orderId: order.id,
        sku: i.sku,
        qty: i.qty,
      })),
    });
    return order;
  });
}
```

#### Key Points

- One mutation should own its TX story.
- Document whether multiple mutations in one request are atomic—they usually are not.
- Outbox handles Kafka/email side effects.

#### Best Practices

- Keep TX scope minimal.
- Retry serializable failures.
- Test rollback paths.

#### Common Mistakes

- Assuming Apollo batching links TX across mutations.
- Side effects (emails) inside TX before commit.
- Nested TX confusion across libraries.

---

### 27.7.4 Event Sourcing

#### Beginner

**Event sourcing** stores **events** instead of only current state—state is a **fold** of events.

#### Intermediate

GraphQL **queries** read **materialized views**; **mutations** append events to a log.

#### Expert

**CQRS** pairs naturally—see 27.7.5. **Snapshots** accelerate replay. **Versioning** event schemas is the hardest part.

```javascript
// Simplified event append + projector sketch
export async function appendEvent(streamId, type, payload) {
  await prisma.event.create({ data: { streamId, type, payload } });
  await projectOrderView(streamId);
}
```

```graphql
type Mutation {
  placeOrder(input: PlaceOrderInput!): OrderPlacedPayload!
}
```

#### Key Points

- Event stores are not typical CRUD GraphQL tutorials.
- Read models keep GraphQL simple.
- Eventual consistency surfaces in UX copy.

#### Best Practices

- Use idempotent consumers.
- Strong typing for payloads.
- Retention/archival policies for logs.

#### Common Mistakes

- Querying raw events from public GraphQL without care.
- No migration strategy for old event shapes.
- Massive replays blocking OLTP traffic.

---

### 27.7.5 CQRS Pattern

#### Beginner

**CQRS** splits **command** (write) models from **query** models—different schemas or tables optimized per path.

#### Intermediate

GraphQL can expose **separate endpoints** or **namespaces** (`admin` vs `storefront`) with different resolvers backing different DB views.

#### Expert

**Federated subgraphs** map cleanly: **orders command service** vs **reporting read service**. **Consistency** is eventual between them—surface **status** fields honestly.

```javascript
// Command side — normalized tables
export async function handleDeactivateAccount(userId) {
  await prisma.user.update({ where: { id: userId }, data: { active: false } });
  await outbox.publish({ type: "UserDeactivated", userId });
}

// Query side — denormalized search document (another DB or index)
export async function searchUsers(q) {
  return opensearch.search({ index: "users-read", q });
}
```

#### Key Points

- CQRS reduces contention between heavy reads and writes.
- GraphQL is a thin edge; services own storage shapes.
- Eventual consistency must be documented.

#### Best Practices

- Start with logical separation before physical DB split.
- Use message buses with dead-letter queues.
- Monitor lag between write and read models.

#### Common Mistakes

- Over-splitting early for small apps.
- Inconsistent authorization between command/query paths.
- Hiding stale read data from users without cues.

---

