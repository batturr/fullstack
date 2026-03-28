# Next.js Topic 18 — Database Integration

Connect Next.js (App Router and Route Handlers) to relational and document databases using ORMs, connection pooling, serverless providers, and safe query patterns. Examples span e-commerce catalogs, blogs, SaaS multi-tenant data, dashboards, and social activity feeds. TypeScript types are shown throughout.

## 📑 Table of Contents

- [18.1 Database Options](#181-database-options)
- [18.2 ORMs and Query Builders](#182-orms-and-query-builders)
- [18.3 Database Connection](#183-database-connection)
- [18.4 Serverless Databases](#184-serverless-databases)
- [18.5 Database Queries](#185-database-queries)
- [18.6 Data Modeling](#186-data-modeling)
- [18.7 Database Best Practices](#187-database-best-practices)
- [Document-Wide Best Practices](#document-wide-best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 18.1 Database Options

### 18.1.1 PostgreSQL

**Beginner Level**  
PostgreSQL is a powerful open-source relational database—great for e-commerce orders, inventory, and payments with strong ACID guarantees.

**Intermediate Level**  
Use JSONB for flexible attributes, full-text search with `tsvector`, and extensions like `pgcrypto`. Hosted options include RDS, Cloud SQL, Neon, Supabase.

**Expert Level**  
Leverage row-level security (RLS) for tenant isolation in SaaS; partition large time-series tables (social events); tune `shared_buffers`, `work_mem`, and autovacuum; use read replicas for analytics with logical replication lag awareness.

```typescript
// types/db/ecommerce.ts
export type ProductRow = {
  id: string;
  sku: string;
  title: string;
  price_cents: number;
  metadata: Record<string, unknown> | null;
  created_at: Date;
};
```

**Key Points**

- Prefer Postgres when you need complex queries, constraints, and transactions.
- Use migrations for every schema change in team environments.

### 18.1.2 MySQL / MariaDB

**Beginner Level**  
MySQL is widely supported by hosts—common for WordPress-style blogs and LAMP stacks migrating toward a Next.js headless frontend.

**Intermediate Level**  
InnoDB for transactions and foreign keys; understand isolation levels for reporting queries on a dashboard.

**Expert Level**  
Galera Cluster for HA; careful `utf8mb4` collation choices; optimize covering indexes for high-read SaaS listing endpoints.

```typescript
export type BlogPostRow = {
  id: bigint;
  slug: string;
  title: string;
  body: string;
  published_at: Date | null;
};
```

**Key Points**

- Great ecosystem and tooling; JSON support improved over time but Postgres JSONB is often richer.
- Validate SQL modes to avoid silent truncation.

### 18.1.3 MongoDB

**Beginner Level**  
MongoDB stores JSON-like documents—flexible for social feeds and rapidly evolving schemas.

**Intermediate Level**  
Model embed vs reference: embed comments for a post document up to size limits; reference users collection for profile data.

**Expert Level**  
Sharding, compound indexes, aggregation pipelines for analytics; transactions available but design to minimize cross-shard transactions.

```typescript
import type { ObjectId } from "mongodb";

export type SocialPostDoc = {
  _id: ObjectId;
  authorId: ObjectId;
  text: string;
  likes: ObjectId[];
  createdAt: Date;
};
```

**Key Points**

- Schema discipline still matters—use Mongoose or Zod at boundaries.
- Understand eventual consistency and retry writes in serverless.

### 18.1.4 SQLite

**Beginner Level**  
SQLite is a file-based SQL database—perfect for local dev, embedded tools, and small internal dashboards.

**Intermediate Level**  
WAL mode for better concurrency; not ideal for high-write multi-tenant SaaS on a single file on network storage.

**Expert Level**  
Turso/libSQL edge replicas; consider Litestream for backups; use `better-sqlite3` in Node for synchronous ergonomic APIs when not serverless.

```typescript
export type TodoRow = {
  id: number;
  title: string;
  done: number; // 0/1
};
```

**Key Points**

- Simple ops story; limited concurrent writers—know the ceiling.
- Great for prototypes and edge-local caches with care.

### 18.1.5 Serverless-Friendly Databases

**Beginner Level**  
Serverless databases scale connections and storage without you managing VMs—good for Vercel-hosted Next apps.

**Intermediate Level**  
They often use HTTP drivers, connection pooling proxies (PgBouncer), or WebSockets to avoid exhausting Postgres connection limits.

**Expert Level**  
Choose drivers compatible with Edge when needed (`@neondatabase/serverless`); tune statement timeouts and pool sizes per function concurrency.

**Key Points**

- Classic Postgres on a small VM can still work with a pooler like PgBouncer in front.
- Measure cold start + DB handshake latency together.

---

## 18.2 ORMs and Query Builders

### 18.2.1 Prisma — Setup

**Beginner Level**  
Run `npm install prisma @prisma/client`, `npx prisma init`, set `DATABASE_URL` in `.env`.

**Intermediate Level**  
Use `prisma/schema.prisma` with `generator client` and `datasource db`; generate client in CI after migrations.

**Expert Level**  
Split schemas with `multiSchema` preview features when needed; use custom output path for monorepos (`output = "../node_modules/.prisma/client"` patterns per docs).

```bash
npx prisma init
npx prisma migrate dev --name init
npx prisma generate
```

**Key Points**

- Pin Prisma versions across workspace packages.
- Never commit `.env` with production credentials.

### 18.2.2 Prisma — Schema

**Beginner Level**  
Define `model User` with fields and `@id`; Prisma maps to SQL tables.

**Intermediate Level**  
Use `@relation`, `onDelete: Cascade`, enums, and `@@index` for query paths in a marketplace schema.

**Expert Level**  
Use `middleware`/`extensions` for soft deletes, tenancy filters, and audit columns—mind performance.

```prisma
model Order {
  id         String   @id @default(cuid())
  userId     String
  totalCents Int
  placedAt   DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id], onDelete: Restrict)
  items      OrderItem[]

  @@index([userId, placedAt])
}

model OrderItem {
  id        String @id @default(cuid())
  orderId   String
  productId String
  qty       Int
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
}
```

**Key Points**

- Schema is source of truth—review migrations like application code.
- Use meaningful relation names for self-relations.

### 18.2.3 Prisma — Client

**Beginner Level**  
`const prisma = new PrismaClient()` then `prisma.user.findMany()`.

**Intermediate Level**  
Instantiate a singleton in dev to avoid hot-reload connection explosions (`globalThis` guard).

**Expert Level**  
Use `$transaction` for invariants; `$queryRaw` with tagged templates to prevent injection; logging middleware only in dev.

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Key Points**

- Do not create new `PrismaClient` per request in serverless without guidance—use singleton + pooler.
- Use `select`/`include` deliberately to avoid over-fetching PII.

### 18.2.4 Prisma — Migrations

**Beginner Level**  
`prisma migrate dev` creates SQL migration files from schema changes.

**Intermediate Level**  
CI runs `prisma migrate deploy` on release; never `db push` in production casually.

**Expert Level**  
For zero-downtime deploys, use expand/contract pattern: add nullable columns, backfill, then add constraints in later migration.

```bash
npx prisma migrate dev --name add_order_status
npx prisma migrate deploy
```

**Key Points**

- Backup before destructive migrations.
- Review generated SQL for large table rewrites.

### 18.2.5 Prisma — Studio

**Beginner Level**  
`npx prisma studio` opens a GUI to browse tables—handy for debugging a blog’s `Post` rows.

**Intermediate Level**  
Do not expose Studio to the internet; local or VPN only.

**Expert Level**  
For production data fixes, prefer audited scripts and idempotent migrations over manual Studio edits.

**Key Points**

- Great DX for onboarding engineers.
- Treat edits like production operations—log and review.

### 18.2.6 Drizzle ORM

**Beginner Level**  
Drizzle offers SQL-like TypeScript schema definitions and a thin query builder—popular for edge and serverless.

**Intermediate Level**  
Co-locate `schema.ts` with migrations via `drizzle-kit`; use `drizzle-orm/pg-core` for Postgres.

**Expert Level**  
Combine with `postgres.js` or serverless drivers; generate types from introspection for brownfield DBs.

```typescript
import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  priceCents: integer("price_cents").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

**Key Points**

- Explicit SQL feel with strong typing.
- Smaller runtime than some ORMs—measure bundle impact on edge.

### 18.2.7 TypeORM

**Beginner Level**  
Decorator-based entities (`@Entity`) map classes to tables—familiar for NestJS backends sharing models.

**Intermediate Level**  
Use DataSource configuration in Next carefully—avoid bundling unused drivers.

**Expert Level**  
Watch for Active Record patterns in serverless (connection overhead); prefer repository pattern with shared DataSource singleton.

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "users" })
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;
}
```

**Key Points**

- Mature ecosystem; configuration can be heavy for edge.
- Good when aligning with existing TypeORM services.

### 18.2.8 Sequelize

**Beginner Level**  
Sequelize is a longstanding Node ORM with migrations and model definitions—common in legacy Node apps.

**Intermediate Level**  
Use `sequelize-typescript` for decorators; pool config critical under serverless concurrency.

**Expert Level**  
Evaluate migration to Prisma/Drizzle for greenfield Next features while strangling legacy Sequelize services.

```typescript
import { DataTypes, Model, Sequelize } from "sequelize";

export function defineProduct(sequelize: Sequelize) {
  class Product extends Model {
    declare id: string;
    declare title: string;
  }
  Product.init(
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
    },
    { sequelize, modelName: "Product" },
  );
  return Product;
}
```

**Key Points**

- Proven patterns; be mindful of async connection init on cold starts.

### 18.2.9 Kysely

**Beginner Level**  
Kysely is a type-safe SQL query builder without full ORM lifecycle—great when you want raw control.

**Intermediate Level**  
Generate types from DB schema with `kysely-codegen`; use with `pg` pool.

**Expert Level**  
Compose dynamic WHERE clauses with type-safe helpers; excellent for reporting endpoints in a dashboard API.

```typescript
import type { Kysely } from "kysely";

export interface Database {
  invoices: {
    id: string;
    org_id: string;
    amount_cents: number;
    due_date: Date;
  };
}

export type DB = Kysely<Database>;

export async function overdueInvoices(db: DB, orgId: string) {
  return db
    .selectFrom("invoices")
    .selectAll()
    .where("org_id", "=", orgId)
    .where("due_date", "<", new Date())
    .execute();
}
```

**Key Points**

- Excellent TypeScript ergonomics for SQL lovers.
- You manage migrations separately (e.g., Prisma migrate, Flyway, sqitch).

---

## 18.3 Database Connection

### 18.3.1 Connection Pooling

**Beginner Level**  
A pool reuses DB connections instead of opening a new one per request—essential for Next serverless with many concurrent invocations.

**Intermediate Level**  
Use PgBouncer transaction mode with Prisma; set `connection_limit` appropriately in serverless docs.

**Expert Level**  
Monitor `max_connections` vs pool size × concurrent functions; use separate pools for OLTP vs batch jobs.

```typescript
// conceptual: DATABASE_URL with pgbouncer=true or pooler host from Neon/Supabase
// postgresql://user:pass@pooler.host/db?pgbouncer=true
```

**Key Points**

- “Too many connections” is a frequent serverless failure—fix with pooler.
- Understand statement vs transaction pooling modes.

### 18.3.2 Clients (`pg`, serverless drivers)

**Beginner Level**  
`pg` is the standard Postgres client for Node—`Pool` for servers.

**Intermediate Level**  
For edge, use Neon serverless or similar HTTP-based query paths.

**Expert Level**  
Tune `idleTimeoutMillis`, `max`, SSL modes, and `application_name` for observability.

```typescript
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
});
```

**Key Points**

- One pool per runtime instance—not per request.
- Always close pools on graceful shutdown in long-running Node servers.

### 18.3.3 Environment Variables

**Beginner Level**  
Store `DATABASE_URL` in `.env.local` for Next.js; never commit secrets.

**Intermediate Level**  
Separate `DATABASE_URL` for preview branches (Neon branching, PlanetScale branches).

**Expert Level**  
Use Vercel/env encryption; rotate credentials; inject read-only replica URL for analytics Route Handlers.

```typescript
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_READ_URL: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);
```

**Key Points**

- Validate env at boot to fail fast.
- Read replicas: eventual consistency acceptable for dashboards only.

### 18.3.4 Connection Best Practices

**Beginner Level**  
Reuse clients; do not connect inside tight loops.

**Intermediate Level**  
Set query timeouts to protect API routes from slow queries.

**Expert Level**  
Circuit breakers and bulkheads: isolate heavy analytics queries from checkout latency-sensitive paths.

**Key Points**

- Add indexes to match WHERE/JOIN patterns—connection tuning cannot fix full table scans.
- Use structured logging with query duration metrics.

---

## 18.4 Serverless Databases

### 18.4.1 Vercel Postgres

**Beginner Level**  
Integrated Postgres offering tied to Vercel projects—quick start for prototypes.

**Intermediate Level**  
Use `@vercel/postgres` SQL template tags with automatic parameterization.

**Expert Level**  
Understand pricing/limits; plan migration to standard Postgres if lock-in or cost becomes an issue.

```typescript
import { sql } from "@vercel/postgres";

export async function listFeaturedProducts() {
  const { rows } = await sql`select id, title from products where featured = true limit 10`;
  return rows;
}
```

**Key Points**

- Great DX on Vercel; verify region latency to users.
- Follow least-privilege DB roles.

### 18.4.2 PlanetScale (MySQL)

**Beginner Level**  
PlanetScale offers branching schema like git—useful for SaaS teams with preview DBs per PR.

**Intermediate Level**  
Vitess-based; understand non-foreign-key workflows if using their recommendations.

**Expert Level**  
Deploy requests schema changes safely; use `planetscale` CLI in CI.

**Key Points**

- Excellent for migration workflows; learn their branching model deeply.

### 18.4.3 Neon

**Beginner Level**  
Serverless Postgres with autoscaling and branching—fits Next.js on Vercel.

**Intermediate Level**  
Use `@neondatabase/serverless` for edge-compatible queries when appropriate.

**Expert Level**  
Configure autoscaling limits; use IP allowlists and pooled connection strings for Prisma.

```typescript
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function getPostBySlug(slug: string) {
  const rows = await sql`select * from posts where slug = ${slug} limit 1`;
  return rows[0] ?? null;
}
```

**Key Points**

- Cold start + DB combo needs measurement.
- Branches for dev/staging mirror production realistically.

### 18.4.4 Supabase

**Beginner Level**  
Supabase is Postgres + auth + storage + realtime—great for social apps with RLS.

**Intermediate Level**  
Use server client with cookies in Next App Router; service role only on server.

**Expert Level**  
RLS policies per tenant; database webhooks; pgvector for embeddings in SaaS AI features.

**Key Points**

- RLS shifts authorization into the database—test thoroughly.
- Watch connection strategy with serverless functions.

### 18.4.5 MongoDB Atlas

**Beginner Level**  
Hosted MongoDB with free tier—good for document workloads.

**Intermediate Level**  
Use Atlas search, online archive, and VPC peering for enterprise.

**Expert Level**  
Global clusters for multi-region social products; define shard keys early if scale demands.

**Key Points**

- Network security lists and private endpoints for compliance.
- Backup and point-in-time restore planning.

---

## 18.5 Database Queries

### 18.5.1 CRUD

**Beginner Level**  
Create, read, update, delete rows—e.g., manage products in admin.

**Intermediate Level**  
Use transactions when multiple rows must succeed or fail together (order + inventory decrement).

**Expert Level**  
Idempotent creates with natural keys or idempotency tokens for payment webhooks.

```typescript
export async function createDraftPost(prisma: import("@/lib/prisma").prisma, authorId: string, title: string) {
  return prisma.post.create({
    data: { authorId, title, status: "DRAFT" },
    select: { id: true, title: true, status: true },
  });
}
```

**Key Points**

- Return minimal `select` shapes to API consumers.
- Validate input with Zod before touching DB.

### 18.5.2 Joins / Relations

**Beginner Level**  
Fetch user with their recent orders using a join or ORM `include`.

**Intermediate Level**  
Avoid N+1: use joins or batched `in` queries for comment authors on a blog list page.

**Expert Level**  
Strategic denormalization for read-heavy feeds; materialized views for dashboards refreshed periodically.

```typescript
export function postsWithAuthors(prisma: import("@/lib/prisma").prisma) {
  return prisma.post.findMany({
    take: 20,
    orderBy: { publishedAt: "desc" },
    where: { publishedAt: { not: null } },
    include: { author: { select: { id: true, name: true, image: true } } },
  });
}
```

**Key Points**

- Explain analyze slow queries in staging with production-like data volume.
- Index foreign keys used in joins.

### 18.5.3 Transactions

**Beginner Level**  
Wrap multiple writes in a transaction so partial failures roll back—critical for checkout.

**Intermediate Level**  
Use isolation level `Serializable` only when necessary—prefer default with clear locking strategy.

**Expert Level**  
Saga patterns across services when crossing DB boundaries; outbox table for reliable events.

```typescript
export async function placeOrder(prisma: import("@/lib/prisma").prisma, userId: string, cartId: string) {
  return prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUniqueOrThrow({ where: { id: cartId, userId }, include: { items: true } });
    const order = await tx.order.create({
      data: {
        userId,
        totalCents: cart.items.reduce((s, i) => s + i.priceCents * i.qty, 0),
        items: { create: cart.items.map((i) => ({ productId: i.productId, qty: i.qty, priceCents: i.priceCents })) },
      },
    });
    await tx.cart.delete({ where: { id: cart.id } });
    return order;
  });
}
```

**Key Points**

- Keep transactions short—no external API calls inside.
- Handle deadlocks with retry backoff.

### 18.5.4 Raw SQL

**Beginner Level**  
Sometimes ORMs cannot express a query—write SQL.

**Intermediate Level**  
Use parameterized queries only; never string-concatenate user input.

**Expert Level**  
Window functions, CTEs, and lateral joins for cohort analysis in SaaS reporting endpoints.

```typescript
import { prisma } from "@/lib/prisma";

export async function monthlyRevenue(orgId: string) {
  return prisma.$queryRaw<
    { month: Date; cents: bigint }[]
  >`select date_trunc('month', placed_at) as month, sum(total_cents)::bigint as cents
    from orders
    where org_id = ${orgId}
    group by 1
    order by 1`;
}
```

**Key Points**

- Prisma `$queryRaw` tagged templates parameterize automatically.
- Code review raw SQL carefully.

### 18.5.5 Optimization

**Beginner Level**  
Add indexes on columns you filter or sort by—speeds up product search.

**Intermediate Level**  
Use `EXPLAIN (ANALYZE, BUFFERS)`; fix sequential scans.

**Expert Level**  
Partial indexes, expression indexes, covering indexes, vacuum health, and connection pool tuning together.

**Key Points**

- Measure with realistic data sizes.
- Cache read-heavy public pages at CDN/Next cache where appropriate—not a DB substitute for writes.

---

## 18.6 Data Modeling

### 18.6.1 Schema Design

**Beginner Level**  
Tables represent entities: `users`, `posts`, `comments` for a blog.

**Intermediate Level**  
Normalize to 3NF; denormalize selectively for read performance with triggers or jobs.

**Expert Level**  
Event sourcing vs CRUD—choose for audit-heavy financial SaaS when immutability matters.

**Key Points**

- Name columns consistently (`created_at`, `*_id` foreign keys).
- Document cardinality and ownership boundaries.

### 18.6.2 Relationships

**Beginner Level**  
One-to-many: user has many orders; many-to-many: students and classes via join table.

**Intermediate Level**  
Use foreign keys with `ON DELETE` rules reflecting business rules (restrict vs cascade).

**Expert Level**  
Polymorphic associations are tricky—prefer explicit tables or JSONB with constraints when unavoidable.

```prisma
model User {
  id     String  @id @default(cuid())
  orders Order[]
}

model Order {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id])
}
```

**Key Points**

- Draw ER diagrams for complex domains (marketplaces, multi-sided platforms).
- Revisit relationships when adding soft deletes.

### 18.6.3 Indexing

**Beginner Level**  
Primary keys are indexed automatically.

**Intermediate Level**  
Composite indexes match column order to query predicates (`WHERE org_id = ? AND created_at > ?`).

**Expert Level**  
Watch write amplification; drop unused indexes; consider BRIN for very large time-series in Postgres.

**Key Points**

- Index for queries you actually run, not hypothetical ones.
- Reindex maintenance on major version upgrades.

### 18.6.4 Migrations (Process)

**Beginner Level**  
Migrations are versioned SQL scripts applied in order.

**Intermediate Level**  
Automate in CI/CD with rollback plans for app deploy coupling.

**Expert Level**  
Blue/green with backward-compatible schema (expand/contract); feature flags for code reading new columns.

**Key Points**

- Take backups before risky migrations.
- Test migrations against a copy of production stats when possible.

---

## 18.7 Database Best Practices

### 18.7.1 Connection Management

**Beginner Level**  
One pool per process; reuse Prisma singleton.

**Intermediate Level**  
Alert on connection count and waiting clients.

**Expert Level**  
Separate read/write pools; chaos test pooler failover.

**Key Points**

- Serverless concurrency multiplies connections—pooler is mandatory at scale.

### 18.7.2 Error Handling

**Beginner Level**  
Catch DB errors in Route Handlers and map to `500` with generic messages.

**Intermediate Level**  
Distinguish unique constraint violations (`P2002` in Prisma) for user-friendly signup errors.

**Expert Level**  
Retry transient errors with exponential backoff; use idempotency keys for writes from queues.

```typescript
import { Prisma } from "@prisma/client";

export function mapPrismaError(err: unknown): { status: number; message: string } {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    return { status: 409, message: "Already exists" };
  }
  return { status: 500, message: "Unexpected error" };
}
```

**Key Points**

- Log internal details server-side only.
- Include request IDs in logs.

### 18.7.3 Security / SQL Injection

**Beginner Level**  
Never interpolate user strings into SQL.

**Intermediate Level**  
Use ORM methods or parameterized queries exclusively.

**Expert Level**  
Principle of least privilege DB users (read-only roles for reporting); disable dangerous extensions; audit queries.

**Key Points**

- ORMs reduce but do not eliminate risk—raw SQL still needs care.
- Sanitize inputs at app boundary with Zod.

### 18.7.4 Performance

**Beginner Level**  
Paginate lists (`take`/`skip` or cursor-based) for a social timeline.

**Intermediate Level**  
Cursor pagination for stable ordering under inserts.

**Expert Level**  
Read replicas, caching layers (Redis), and precomputed aggregates for CEO dashboards.

```typescript
export type PageCursor = { id: string; createdAt: string };

export async function pagePosts(prisma: import("@/lib/prisma").prisma, cursor?: PageCursor) {
  return prisma.post.findMany({
    take: 20,
    ...(cursor
      ? {
          skip: 1,
          cursor: { id: cursor.id },
          where: { createdAt: { lt: new Date(cursor.createdAt) } },
        }
      : {}),
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, createdAt: true },
  });
}
```

**Key Points**

- Set sensible `maxDuration` on Vercel for heavy queries or move to background jobs.
- Monitor p95 query latency and slow query logs.

---

## Document-Wide Best Practices

1. Treat schema migrations as application releases—coordinate code and DB deploy order.
2. Use TypeScript types at repository boundaries (`Repository` pattern) to isolate ORM details.
3. Validate all external input before queries; encode business rules in one place.
4. Use read transactions for consistent reads when needed (`SERIALIZABLE` sparingly).
5. Backup, restore drills, and runbooks for incidents.
6. Separate test databases per CI job; seed deterministic fixtures.
7. Observability: query timings, pool metrics, error rates by endpoint.
8. Privacy: minimize stored PII; encrypt at rest; column-level encryption for secrets when required.
9. Load test critical paths (checkout, signup) before launches.
10. Document how to run local DB (Docker compose) matching prod engine version.

---

## Common Mistakes to Avoid

1. Opening a new DB connection per request in serverless without a pooler.
2. Running migrations manually in production without tracking.
3. N+1 queries in list pages causing DB meltdown.
4. Long transactions holding locks during external HTTP calls.
5. Using service role keys in client-side code (Supabase/Firebase admin patterns).
6. Ignoring index maintenance and autovacuum on Postgres.
7. Storing files in the database instead of object storage for large binaries.
8. `select *` in hot paths returning huge rows and PII to logs accidentally.
9. Deploying code that requires new columns before migration runs (or vice versa) without compatibility window.
10. Nondeterministic pagination with `OFFSET` on high-traffic feeds—use keyset pagination.

---

_End of Topic 18 — Database Integration._
