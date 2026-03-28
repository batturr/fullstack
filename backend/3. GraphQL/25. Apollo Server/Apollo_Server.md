# Apollo Server

## 📑 Table of Contents

- [25.1 Apollo Server Setup](#251-apollo-server-setup)
  - [25.1.1 Installation](#2511-installation)
  - [25.1.2 Basic Configuration](#2512-basic-configuration)
  - [25.1.3 Starting Server](#2513-starting-server)
  - [25.1.4 Port Configuration](#2514-port-configuration)
  - [25.1.5 Environment Variables](#2515-environment-variables)
- [25.2 Schema Definitions](#252-schema-definitions)
  - [25.2.1 Schema Creation](#2521-schema-creation)
  - [25.2.2 Type Definitions](#2522-type-definitions)
  - [25.2.3 Resolvers](#2523-resolvers)
  - [25.2.4 Schema Organization](#2524-schema-organization)
  - [25.2.5 Module Federation](#2525-module-federation)
- [25.3 Apollo Server Features](#253-apollo-server-features)
  - [25.3.1 Playground/Apollo Sandbox](#2531-playgroundapollo-sandbox)
  - [25.3.2 Schema Introspection](#2532-schema-introspection)
  - [25.3.3 Apollo Tracing](#2533-apollo-tracing)
  - [25.3.4 Performance Metrics](#2534-performance-metrics)
  - [25.3.5 Error Handling](#2535-error-handling)
- [25.4 Context and Middleware](#254-context-and-middleware)
  - [25.4.1 Context Creation](#2541-context-creation)
  - [25.4.2 Request Middleware](#2542-request-middleware)
  - [25.4.3 Response Middleware](#2543-response-middleware)
  - [25.4.4 Error Handling Middleware](#2544-error-handling-middleware)
  - [25.4.5 Plugin System](#2545-plugin-system)
- [25.5 Plugins](#255-plugins)
  - [25.5.1 Server Lifecycle Plugins](#2551-server-lifecycle-plugins)
  - [25.5.2 Request Plugins](#2552-request-plugins)
  - [25.5.3 Parsing Plugins](#2553-parsing-plugins)
  - [25.5.4 Validation Plugins](#2554-validation-plugins)
  - [25.5.5 Execution Plugins](#2555-execution-plugins)
- [25.6 Data Sources](#256-data-sources)
  - [25.6.1 REST API Integration](#2561-rest-api-integration)
  - [25.6.2 Database Integration](#2562-database-integration)
  - [25.6.3 DataLoader Caching](#2563-dataloader-caching)
  - [25.6.4 Custom Data Sources](#2564-custom-data-sources)
  - [25.6.5 Error Handling](#2565-error-handling)
- [25.7 Production Setup](#257-production-setup)
  - [25.7.1 Production Configuration](#2571-production-configuration)
  - [25.7.2 Environment Setup](#2572-environment-setup)
  - [25.7.3 Logging Configuration](#2573-logging-configuration)
  - [25.7.4 Monitoring Setup](#2574-monitoring-setup)
  - [25.7.5 Scaling Considerations](#2575-scaling-considerations)
- [25.8 Advanced Features](#258-advanced-features)
  - [25.8.1 Federation](#2581-federation)
  - [25.8.2 Subscriptions Setup](#2582-subscriptions-setup)
  - [25.8.3 WebSocket Configuration](#2583-websocket-configuration)
  - [25.8.4 Custom Directives](#2584-custom-directives)
  - [25.8.5 Schema Stitching](#2585-schema-stitching)

---

## 25.1 Apollo Server Setup

### 25.1.1 Installation

#### Beginner

Install **`@apollo/server`** for Apollo Server 4 and a GraphQL implementation (**`graphql`**). For Express, add **`@as-integrations/express4`** (or the version matching your Express major). Run **`npm install @apollo/server graphql`**.

#### Intermediate

Pin **`graphql`** to a version compatible with Apollo’s peer dependency range. Use **`engines`** in `package.json` for Node LTS alignment. DevDependencies: **`tsx`** or **`nodemon`** for local reload.

#### Expert

**Monorepos**: hoist `graphql` once to dedupe duplicate instances (schema/build errors if two copies). **Docker** multi-stage builds: `npm ci --omit=dev` in production image. **SBOM** generation in CI for supply chain review.

```javascript
// package.json scripts (excerpt)
{
  "dependencies": {
    "@apollo/server": "^4.10.0",
    "graphql": "^16.8.1"
  },
  "scripts": {
    "start": "node server.mjs"
  }
}
```

```graphql
# No install artifact — schema lives in your repo
type Query {
  ping: String
}
```

#### Key Points

- Single `graphql` copy per runtime process is critical.
- Apollo Server 4 uses a different import path than Apollo Server 3.
- Integration packages bridge Apollo to Express/Fastify/etc.

#### Best Practices

- Lockfile committed; CI uses `npm ci`.
- Regular `npm outdated` review for security patches.
- Document Node version in README.

#### Common Mistakes

- Installing `apollo-server` (v3 meta-package) alongside v4 packages by mistake.
- Two versions of `graphql` from nested dependencies.
- Using ESM vs CJS mismatch without `"type": "module"` clarity.

---

### 25.1.2 Basic Configuration

#### Beginner

Create **`ApolloServer`** with **`typeDefs`** (string or array) and **`resolvers`**. Call **`server.start()`** before accepting traffic when using middleware integrations.

#### Intermediate

Set **`introspection: false`** in production if policy requires. Configure **`formatError`** to sanitize messages. **`csrfPrevention`** for browser POSTs when using built-in JSON handling.

#### Expert

**Persisted queries** only mode for edge caching. **Gateway** mode with **`ApolloGateway`** for federation (separate package). **Landing page** plugins disabled in locked-down environments.

```javascript
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== "production",
});

const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });
console.log(`Listening ${url}`);
```

```graphql
type Query {
  hello: String
}
```

#### Key Points

- `ApolloServer` is transport-agnostic until you choose startup helper or middleware.
- Security-related defaults evolve—read migration guides on major bumps.
- `typeDefs` can be an array for file merging.

#### Best Practices

- Extract config into `apollo.config.js` or env-driven module.
- Enable plugins (logging, metrics) in one factory function.
- TypeScript: use `ApolloServerPlugin` types for plugins array.

#### Common Mistakes

- Forgetting `await server.start()` with middleware integration.
- Passing executable schema and also `typeDefs` incorrectly duplicated.
- `csrfPrevention` breaking legitimate clients without documentation.

---

### 25.1.3 Starting Server

#### Beginner

**`startStandaloneServer`** is the quickest path: it embeds **`express`-less** minimal HTTP server for development and small services.

#### Intermediate

For **Express**, use **`expressMiddleware`** from `@as-integrations/express4` after **`app.use(express.json())`**. For **Fastify**, use the matching integration package.

#### Expert

**Node cluster** or **worker threads** behind shared load balancer—each worker runs `ApolloServer` instance. **Serverless**: `@as-integrations/aws-lambda` with cold start tuning.

```javascript
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import express from "express";
import http from "http";

const app = express();
const httpServer = http.createServer(app);
const server = new ApolloServer({ typeDefs, resolvers });
await server.start();

app.use(
  "/graphql",
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.authorization }),
  })
);

httpServer.listen(4000);
```

```graphql
schema {
  query: Query
}
```

#### Key Points

- Standalone vs framework integration affects context shape (`req` available in Express).
- HTTP server reference needed for subscriptions + drain plugin.
- Graceful shutdown calls `await server.stop()` then close HTTP server.

#### Best Practices

- Health route `/healthz` outside GraphQL for orchestrators.
- `server.start()` once per process lifecycle.
- Use `httpServer` for Apollo Server 4 subscription WebSocket servers.

#### Common Mistakes

- Mounting middleware before `express.json()` → empty body.
- Binding to wrong path (`/graphql` vs `/`) breaking client URLs.
- Not handling `EADDRINUSE` in dev scripts.

---

### 25.1.4 Port Configuration

#### Beginner

Pass **`listen: { port: 4000 }`** to `startStandaloneServer`. Read **`process.env.PORT`** for PaaS compatibility (`Number(process.env.PORT || 4000)`).

#### Intermediate

**`port: 0`** assigns ephemeral port—useful in parallel tests; read `address().port` from underlying server if exposed by helper or create custom http server.

#### Expert

**Unix domain sockets** for sidecar communication on same host. **IPv6** binding `::` vs `0.0.0.0` in containers—align with platform networking.

```javascript
const port = Number(process.env.PORT || 4000);
const { url } = await startStandaloneServer(server, {
  listen: { port, host: "0.0.0.0" },
});
```

```graphql
type Query {
  ping: String
}
```

#### Key Points

- Platform injects `PORT`—never hardcode in production.
- Host `0.0.0.0` exposes in Docker; localhost-only for local security.
- TLS usually terminates at load balancer; Node HTTP behind it.

#### Best Practices

- Log resolved URL at startup.
- Document default port in README for frontend dev proxy.
- Firewall rules align with exposed host/port.

#### Common Mistakes

- `PORT` read as string without `Number()` causing subtle bugs.
- Exposing GraphQL admin on public interface unintentionally.
- Conflicting ports when running gateway + subgraphs locally.

---

### 25.1.5 Environment Variables

#### Beginner

Use **`.env`** with **`dotenv/config`** import early. Variables: **`NODE_ENV`**, **`PORT`**, **`DATABASE_URL`**, **`APOLLO_INTROSPECTION`**.

#### Intermediate

Validate env at boot with **`zod`** or **`envalid`**—fail fast if missing secrets. Separate **`.env.test`** for CI with ephemeral DB URL.

#### Expert

**Kubernetes** secrets mounted as files—support `*_FILE` pattern. **Feature flags** from remote config service cached with TTL. **Rotation**: support dual secrets during JWT key rollover.

```javascript
import "dotenv/config";
import { z } from "zod";

const Env = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
});

export const env = Env.parse(process.env);
```

```graphql
type Query {
  version: String
}
```

#### Key Points

- Never commit `.env` with secrets.
- Typed env reduces misconfiguration.
- GraphQL layer reads env only in composition root, not per resolver randomly.

#### Best Practices

- Example `.env.example` without secrets committed.
- 12-factor alignment: config in env, not code.
- Log effective config with secrets redacted.

#### Common Mistakes

- Reading `process.env` inside hot resolver path (performance + testability).
- Defaults that enable introspection in prod if `NODE_ENV` unset.
- Different env var names between local docker-compose and cloud.

---

## 25.2 Schema Definitions

### 25.2.1 Schema Creation

#### Beginner

Use **`makeExecutableSchema`** from **`@graphql-tools/schema`** or pass SDL strings directly to `ApolloServer`. Executable schema combines **typeDefs + resolvers**.

#### Intermediate

**Schema merging** with **`mergeTypeDefs`**, **`mergeResolvers`** from `@graphql-tools/merge` for modular monoliths.

#### Expert

**Federation `@link` directives** and **`buildSubgraphSchema`** from `@apollo/subgraph` for entity keys. **Custom directives** applied via **`mapSchema`** transformer before Apollo consumes schema.

```javascript
import { makeExecutableSchema } from "@graphql-tools/schema";

const schema = makeExecutableSchema({ typeDefs, resolvers });
const server = new ApolloServer({ schema });
```

```graphql
type Query {
  hello: String
}
```

#### Key Points

- Executable schema is what Apollo executes; SDL alone is not enough.
- Subgraph schemas differ from monolith schemas (entities, references).
- Transform pipeline order matters (directives before or after merge).

#### Best Practices

- Single `makeExecutableSchema` call in factory.
- Snapshot `printSchema` in CI for drift detection.
- Keep SDL files small and named by domain.

#### Common Mistakes

- Passing `graphql-js` schema built twice with different resolvers.
- Federation entities missing `@key` fields.
- Circular type imports in JS merging utilities.

---

### 25.2.2 Type Definitions

#### Beginner

Define **`Query`**, **`Mutation`**, object types, scalars, enums in SDL. **`!`** means non-null. Lists: **`[String!]!`**.

#### Intermediate

**Interfaces** and **unions** for polymorphism. **`extend type Query`** across modules merged into one document.

#### Expert

**Custom scalars** with serialization/coercion/parsing functions. **Federation directives** `@key`, `@external`, `@requires`, `@provides` on subgraph SDL.

```graphql
scalar DateTime

enum Role {
  USER
  ADMIN
}

type User {
  id: ID!
  email: String!
  createdAt: DateTime!
  role: Role!
}

type Query {
  user(id: ID!): User
}
```

#### Key Points

- SDL is the contract with clients—version carefully.
- Nullable vs non-null affects client ergonomics and error propagation.
- Scalars hide validation complexity behind one type.

#### Best Practices

- Document types with `#` comments or GraphQL description strings (`"""`).
- Align naming conventions (`User`, `CreateUserInput`).
- Avoid `JSON` scalar unless necessary—prefer structured types.

#### Common Mistakes

- Overusing `JSON` for everything.
- Non-null fields on types that legitimately may be missing → cascade errors.
- Enum value renames without deprecation strategy.

---

### 25.2.3 Resolvers

#### Beginner

**Resolvers** map field name to function **`(parent, args, context, info)`**. Default resolver reads **`parent[fieldName]`** for objects.

#### Intermediate

**Resolver map** structure mirrors types. **`Query`/`Mutation`** root resolvers return objects or scalars. **Args** destructuring for clarity.

#### Expert

**Resolver tracing** wrappers, **error masking**, **N+1** solutions with DataLoader in context. **Federation** `__resolveReference` for entities.

```javascript
const resolvers = {
  Query: {
    user: async (_, { id }, { db }) => db.user.findById(id),
  },
  User: {
    posts: async (user, _, { loaders }) => loaders.postsByUser.load(user.id),
  },
};
```

```graphql
type Query {
  user(id: ID!): User
}

type User {
  id: ID!
  posts: [Post!]!
}
```

#### Key Points

- Keep resolvers thin; delegate to services.
- Context carries per-request dependencies.
- Field resolvers run per requested field—performance matters.

#### Best Practices

- TypeScript + GraphQL Code Generator for typed resolvers.
- Avoid async work in resolvers when result already on parent.
- Consistent error throwing (`GraphQLError` with extensions).

#### Common Mistakes

- Returning objects missing fields requested without proper nullable schema.
- Using `info` to parse queries manually everywhere (complexity).
- Swallowing errors returning `null` when non-null schema breaks whole branch.

---

### 25.2.4 Schema Organization

#### Beginner

Split SDL into **`user.graphql`**, **`post.graphql`**; merge strings in JS. Resolvers split **`user.resolvers.js`**.

#### Intermediate

**Barrel files** export merged typeDefs/resolvers. **Colocate** tests next to module.

#### Expert

**Domain-driven** boundaries with **package exports** in monorepo. **Schema linting** (`graphql-eslint`) per package. **Codegen** per subgraph with **rover** composition in CI.

```javascript
import { readFileSync } from "fs";
import { join } from "path";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";

const loadGql = (name) => readFileSync(join(__dirname, "modules", name, "schema.graphql"), "utf8");

export const typeDefs = mergeTypeDefs([loadGql("user"), loadGql("post")]);
```

```graphql
# modules/user/schema.graphql
type User {
  id: ID!
}
```

#### Key Points

- Modular schemas scale with team size.
- Merge order rarely matters for typeDefs if no duplicates.
- Resolver merge conflicts must be resolved—no duplicate field names.

#### Best Practices

- One module owns a type’s fields end-to-end.
- CI check for orphan SDL files not imported.
- Document module boundaries in architecture decision record.

#### Common Mistakes

- Duplicate `type Query` blocks not using `extend`.
- Circular JS imports between resolver modules.
- Merging federated subgraph SDL into monolith accidentally.

---

### 25.2.5 Module Federation

#### Beginner

**Apollo Federation** splits schema across **subgraphs**; **gateway** composes **supergraph**. Each subgraph is its own Apollo Server (or compatible).

#### Intermediate

**`@apollo/gateway`** with **`IntrospectAndCompose`** for dev; **`ApolloSchemaManager`** or **GraphOS** for prod with managed composition.

#### Expert

**`@inaccessible`**, **`@tag`**, **`@override`** for controlled rollout. **Router** (Rust) replacing Node gateway for performance—same supergraph SDL conceptually.

```javascript
import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import gql from "graphql-tag";

const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@key"])
  type User @key(fields: "id") {
    id: ID!
    name: String!
  }
`;

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
});
```

```graphql
type User @key(fields: "id") {
  id: ID!
  name: String!
}
```

#### Key Points

- Subgraphs must define entity keys for federation references.
- Gateway handles query planning across services.
- Version federation spec imports consistently across subgraphs.

#### Best Practices

- Use **Rover** to `subgraph check` in CI.
- Staging supergraph matches prod composition flow.
- Monitor query planner latency at gateway.

#### Common Mistakes

- Missing `__resolveReference` for `@key` types.
- Divergent `federation` spec versions between subgraphs.
- Calling subgraphs directly from clients bypassing gateway policies.

---

## 25.3 Apollo Server Features

### 25.3.1 Playground/Apollo Sandbox

#### Beginner

Apollo Server 4 **does not ship GraphQL Playground** by default. Use **Apollo Sandbox** (hosted) or **Apollo Studio Explorer** connected to your endpoint.

#### Intermediate

**Landing page plugins** like **`ApolloServerPluginLandingPageLocalDefault`** for local dev embed Sandbox. Disable in production via env flag.

#### Expert

**Custom landing page** HTML for internal docs links. **CSP** headers if embedding iframe-based tools. **Corporate** proxies blocking external Sandbox—self-host **GraphiQL** with integrations.

```javascript
import { ApolloServer } from "@apollo/server";
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from "@apollo/server/plugin/landingPage/default";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    process.env.NODE_ENV === "production"
      ? ApolloServerPluginLandingPageProductionDefault({ footer: false })
      : ApolloServerPluginLandingPageLocalDefault({ embed: true }),
  ],
});
```

```graphql
type Query {
  hello: String
}
```

#### Key Points

- Sandbox improves DX but exposes endpoint—protect with auth in dev VPN.
- Production landing page should not leak stack details.
- Explorer needs CORS allowed for browser origin if used remotely.

#### Best Practices

- Document how teammates open Sandbox for local URL.
- Turn off embed in prod or restrict by network policy.
- Pair with example queries in repo `examples/` folder.

#### Common Mistakes

- Expecting Playground at `/graphql` automatically like AS3.
- Enabling local default plugin in public internet production.
- CORS `*` with credentials true breaking Sandbox.

---

### 25.3.2 Schema Introspection

#### Beginner

**Introspection** query returns schema metadata; tools use it for codegen. Apollo allows it in dev easily; **disable** in hardened prod.

#### Intermediate

Set **`introspection: false`** on `ApolloServer`. Some teams allow introspection only for **authenticated** admins via plugin inspecting request.

#### Expert

**Masked introspection** or **allowlisted** fields using custom plugin wrapping schema or blocking `__schema` at parse layer. **GraphOS** publishes schema from CI instead of prod introspection.

```javascript
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.ALLOW_INTROSPECTION === "true",
});
```

```graphql
query IntrospectionQuery {
  __schema {
    queryType {
      name
    }
  }
}
```

#### Key Points

- Introspection aids attackers mapping surface area—risk-based decision.
- Client codegen often needs introspection from dev/staging, not prod.
- Subgraph introspection used by gateway composition in some setups.

#### Best Practices

- Document policy in security README.
- If disabled, provide SDL artifact to consumers.
- Monitor unusual introspection volume as reconnaissance signal.

#### Common Mistakes

- Disabling introspection but forgetting Studio still needs schema via other means.
- Partial introspection implementations breaking tools unpredictably.
- Assuming introspection off stops all schema leaks (error messages may hint).

---

### 25.3.3 Apollo Tracing

#### Beginner

**Tracing** adds per-resolver timing to **extensions** (`tracing` field) in responses—mostly legacy; modern observability uses **OpenTelemetry**.

#### Intermediate

Apollo Server plugins can add **custom `willSendResponse`** hooks attaching **metrics** to `response.extensions`.

#### Expert

**Federated tracing** (`ftv1`) propagates subgraph timings to gateway for waterfall views in Studio. **Sampling** to reduce overhead on hot paths.

```javascript
const tracingPlugin = {
  async requestDidStart() {
    const start = Date.now();
    return {
      async willSendResponse({ response }) {
        response.extensions = {
          ...response.extensions,
          serverTiming: { totalMs: Date.now() - start },
        };
      },
    };
  },
};

const server = new ApolloServer({ typeDefs, resolvers, plugins: [tracingPlugin] });
```

```graphql
query {
  hello
}
```

#### Key Points

- Exposing detailed timing to clients can leak logic about backend shape—gate carefully.
- OpenTelemetry spans per resolver give richer data than legacy tracing field.
- Studio tracing requires compatible reporting plugin configuration.

#### Best Practices

- Sample traces in production (1–5%).
- Correlate traces with `x-request-id` header.
- Avoid huge extension payloads.

#### Common Mistakes

- Enabling full tracing for all users impacting performance.
- Leaking resolver names that reveal internal architecture unnecessarily.
- Parsing extensions in clients for logic—prefer dedicated APIs.

---

### 25.3.4 Performance Metrics

#### Beginner

Count **requests**, **errors**, **latency histogram** via **`prom-client`** in plugin hooks **`didEncounterErrors`**, **`willSendResponse`**.

#### Intermediate

**Apollo Server metrics** with **`@apollo/server/plugin/drainHttpServer`** plus **`responseCache`** metrics if caching. Export **`/metrics`** for Prometheus scrape.

#### Expert

**Resolver-level** histograms labeled by `operationName`—cardinality explosion risk; **whitelist** or **aggregate**. **Saturation** metrics: event loop lag, GraphQL queue depth.

```javascript
import client from "prom-client";

const httpDuration = new client.Histogram({
  name: "graphql_request_duration_seconds",
  help: "GraphQL HTTP request duration",
  labelNames: ["operationName"],
});

const metricsPlugin = {
  async requestDidStart() {
    const end = httpDuration.startTimer();
    return {
      async willSendResponse(rc) {
        const name = rc.request.operationName || "anonymous";
        end({ operationName: name });
      },
    };
  },
};
```

```graphql
query Named {
  hello
}
```

#### Key Points

- High-cardinality labels (per user id) blow Prometheus—avoid.
- GraphQL returns 200 with errors—label success vs `graphql_error`.
- Combine with DB pool metrics for holistic view.

#### Best Practices

- Dashboards: p50/p95/p99 latency, error rate, top operations.
- Alert on sustained error spikes.
- Use exemplars for trace linking if supported.

#### Common Mistakes

- Timer not stopped on early errors or aborted requests.
- Missing operation name for anonymous operations—hard to triage.
- Metrics middleware double-counting with load balancer logs.

---

### 25.3.5 Error Handling

#### Beginner

Throw **`GraphQLError`** from resolvers with **`extensions.code`**. Apollo **`formatError`** shapes errors returned to clients.

#### Intermediate

Map **domain errors** to codes; mask **unexpected** errors in production. **`unwrapResolverError`** helper in AS4 for cause chains.

#### Expert

**Federation subgraph errors** include **`serviceName`** in extensions when using appropriate version. **I18n**: put **`messageKey`** in extensions, map client-side.

```javascript
import { ApolloServer } from "@apollo/server";
import { GraphQLError } from "graphql";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (formattedError, error) => {
    if (formattedError.extensions?.code === "INTERNAL") {
      return new GraphQLError("Internal server error", {
        extensions: { code: "INTERNAL" },
      });
    }
    return formattedError;
  },
});
```

```graphql
type Query {
  fail: String
}
```

#### Key Points

- Clients should rely on **codes**, not message text.
- `formatError` runs last—keep it pure-ish (no heavy I/O).
- Logging should happen in plugins with full error object.

#### Best Practices

- Central registry of error codes.
- Log `originalError` stack server-side only.
- Include `requestId` in extensions for support tickets.

#### Common Mistakes

- Returning stack traces to browsers in prod.
- Using generic `Error` without `GraphQLError` → unclear extensions.
- Swallowing errors returning `null` breaking non-null schema unexpectedly.

---

## 25.4 Context and Middleware

### 25.4.1 Context Creation

#### Beginner

**`context`** function receives integration-specific args (`{ req }` in Express) and returns object passed to all resolvers for that operation.

#### Intermediate

**Per-request** DataLoaders created inside context factory. **Auth**: decode JWT once, attach `user`.

#### Expert

**AsyncLocalStorage** to propagate request context into deep services without passing `ctx` everywhere—use carefully for testability.

```javascript
expressMiddleware(server, {
  context: async ({ req }) => {
    const user = await authenticate(req);
    return {
      user,
      db,
      loaders: createLoaders(db),
    };
  },
});
```

```graphql
type Query {
  me: User
}
```

#### Key Points

- Context must be immutable from resolver side effects ideally.
- Heavy work in context factory runs once per operation—keep efficient.
- Batched operations may share context per HTTP request in arrays—verify integration behavior.

#### Best Practices

- TypeScript interface `GraphQLContext`.
- Avoid storing large buffers in context.
- Unit-test context factory with mocked `req`.

#### Common Mistakes

- Sharing DataLoader across requests (cache bleed).
- Putting request-unscoped singletons mistaken as per-request.
- Context async errors unhandled crashing request.

---

### 25.4.2 Request Middleware

#### Beginner

Express **`app.use`** before GraphQL: **logging**, **cors**, **helmet**, **compression**. Order: security → parsers → auth → GraphQL.

#### Intermediate

**Rate limiting** (`express-rate-limit`) keyed by IP or user id. **Request ID** middleware attaches `req.id`.

#### Expert

**Body size limits** on `express.json({ limit: '1mb' })** to mitigate large query attacks. **WAF** integration headers parsed for geo blocking.

```javascript
import cors from "cors";
import helmet from "helmet";
import express from "express";

app.use(helmet());
app.use(cors({ origin: ["https://app.example.com"] }));
app.use(express.json({ limit: "1mb" }));
```

```graphql
type Query {
  ping: String
}
```

#### Key Points

- Middleware is the first line of defense before GraphQL parsing.
- CORS preflight must allow `Content-Type` and custom headers.
- JSON parser errors return non-GraphQL responses—clients must handle.

#### Best Practices

- Centralize middleware order in one function `applyHttpMiddleware(app)`.
- Test middleware with `supertest` end-to-end.
- Use `trust proxy` correctly when behind ALB for IP limits.

#### Common Mistakes

- CORS misconfigured causing “Network error” in browsers only.
- GraphQL mounted before `express.json`.
- Rate limiter counting batched operations as one request incorrectly.

---

### 25.4.3 Response Middleware

#### Beginner

Express **`res.on('finish')`** for logging status codes and duration after response sent.

#### Intermediate

**Custom headers** like **`X-Request-Id`** added in middleware after GraphQL resolves—use plugin `willSendResponse` for GraphQL-aware timing.

#### Expert

**Cache-Control** headers for GET-based persisted queries (if used)—careful with personalized data. **Vary: Authorization** when responses differ by auth.

```javascript
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(JSON.stringify({ path: req.path, ms: Date.now() - start, status: res.statusCode }));
  });
  next();
});
```

```graphql
type Query {
  hello: String
}
```

#### Key Points

- GraphQL often returns 200 for partial errors—middleware status code alone insufficient.
- Plugins better attach GraphQL-specific metadata than raw Express middleware alone.
- Compression middleware interacts with SSE/subscriptions—configure exclusions.

#### Best Practices

- Structured JSON logs for ingestion.
- Correlate logs with `requestId`.
- Avoid logging full response bodies (PII).

#### Common Mistakes

- Assuming `res.statusCode === 200` means GraphQL success.
- Setting headers after response already sent.
- Huge `console.log` of GraphQL results in production.

---

### 25.4.4 Error Handling Middleware

#### Beginner

Express **error middleware** `(err, req, res, next)` catches non-GraphQL errors thrown outside Apollo pipeline—map to 500 JSON.

#### Intermediate

**`async` route errors**: wrap with **`express-async-errors`** or pass `next(err)` manually.

#### Expert

Differentiate **Apollo CSRF errors** (400) vs **JSON parse** errors. **GraphQL batching** may return array—error middleware may not see individual operation errors.

```javascript
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: "internal_error" });
});
```

```graphql
type Query {
  hello: String
}
```

#### Key Points

- Apollo handles most errors inside GraphQL response; HTTP middleware is for outer failures.
- Unhandled promise rejections should be logged and process supervised.
- Align JSON error shape with company standard for non-GraphQL routes.

#### Best Practices

- Monitor `unhandledRejection` events.
- Use `next(err)` consistently in async Express handlers.
- Test middleware with thrown sync and async errors.

#### Common Mistakes

- Error middleware defined before routes (never reached).
- Calling `next()` after sending response.
- Swallowing errors without logging in catch blocks.

---

### 25.4.5 Plugin System

#### Beginner

**Plugins** are objects with **`async requestDidStart()`** returning hooks like **`didResolveOperation`**, **`willSendResponse`**.

#### Intermediate

**Plugin ordering** matters: first plugin’s `requestDidStart` runs first; inner hooks order documented in Apollo docs.

#### Expert

**Experimental** incremental delivery plugins or **custom cache** hooks. **Federation** gateway uses internal plugins—avoid conflicting assumptions.

```javascript
const logPlugin = {
  async requestDidStart() {
    console.log("request start");
    return {
      async didResolveOperation(rc) {
        console.log("operation", rc.operationName);
      },
      async willSendResponse() {
        console.log("response");
      },
    };
  },
};

const server = new ApolloServer({ typeDefs, resolvers, plugins: [logPlugin] });
```

```graphql
query OpName {
  hello
}
```

#### Key Points

- Plugins are the supported extension point vs monkey-patching internals.
- Use for cross-cutting concerns: auth logging, metrics, deny rules.
- Keep plugin hooks fast; offload work to async queues if heavy.

#### Best Practices

- Compose plugins array from `createPlugins(env)` factory.
- Unit-test plugins by driving fake `requestContext` objects where possible.
- Read Apollo changelog on hook behavior changes across majors.

#### Common Mistakes

- Throwing inside hooks without mapping to GraphQL errors appropriately.
- Stateful plugins shared across tests mutating globals.
- Assuming `didEncounterErrors` always has `errors` populated synchronously.

---

## 25.5 Plugins

### 25.5.1 Server Lifecycle Plugins

#### Beginner

**`serverWillStart`** hook runs when `server.start()` invoked—open DB pools, warm caches.

#### Intermediate

**`drainServer`** / **`ApolloServerPluginDrainHttpServer`** on shutdown to wait for in-flight requests.

#### Expert

**Schema reporting** plugin registers schema with GraphOS. **Landing page** plugin is also lifecycle-related for static asset serving.

```javascript
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
```

```graphql
type Query {
  ping: String
}
```

#### Key Points

- Lifecycle hooks enable graceful startup/shutdown for zero-downtime deploys.
- Drain plugin prevents cutting connections mid-query during k8s pod termination.
- Combine with SIGTERM handler calling `server.stop()`.

#### Best Practices

- Timeout drain after N seconds with forced exit fallback.
- Close DB pool in `serverWillStop`.
- Integration test shutdown path.

#### Common Mistakes

- Forgetting drain plugin → truncated responses on deploy.
- `httpServer` undefined when using wrong integration helper.
- Blocking `serverWillStart` too long delaying readiness probe.

---

### 25.5.2 Request Plugins

#### Beginner

**`requestDidStart`** fires once per GraphQL HTTP request (or per operation in some integrations—verify). Log **operationName**.

#### Intermediate

**`didResolveOperation`** after operation is known—enforce allow/deny lists, complexity limits here.

#### Expert

**`executionDidStart`** gives `executionArgs` for advanced tracing. **Abort** patterns generally map to throwing `GraphQLError` in validation hooks, not literal abort controllers pre-AS4 patterns.

```javascript
const denyIntrospectionPlugin = {
  async requestDidStart() {
    return {
      async didResolveOperation({ request, operationName }) {
        if (operationName === "IntrospectionQuery") {
          throw new GraphQLError("Introspection disabled", {
            extensions: { code: "GRAPHQL_VALIDATION_FAILED" },
          });
        }
      },
    };
  },
};
```

```graphql
query IntrospectionQuery {
  __schema {
    types {
      name
    }
  }
}
```

#### Key Points

- Request plugins are ideal for cross-cutting request guards.
- Throwing in `didResolveOperation` aborts execution early.
- Anonymous operations complicate logging—hash query text if needed.

#### Best Practices

- Include safe subset of variables in logs (redacted).
- Metric cardinality control on operationName.
- Combine with persisted query allowlist for public APIs.

#### Common Mistakes

- Blocking introspection but breaking legitimate Studio publishing flows.
- Heavy synchronous work in `requestDidStart` slowing all requests.
- Different behavior between batched and single operations not accounted for.

---

### 25.5.3 Parsing Plugins

#### Beginner

Parsing is usually internal; custom plugins rarely hook **parse** directly—use **`graphql-middleware`** or validate raw body before Apollo.

#### Intermediate

**`unexpectedErrorProcessingRequest`** captures parse failures. **Persisted queries** plugin replaces query string before parse.

#### Expert

**Custom persisted query** store implementations: LRU + Redis. **Query hashing** with SHA-256; reject unknown hashes in production.

```javascript
// Concept: block non-persisted queries in prod via plugin + store
const persistedQueriesPlugin = {
  async requestDidStart({ request }) {
    if (process.env.NODE_ENV === "production" && !request.http?.headers.get("apollographql-client-name")) {
      // illustrative guard — tailor to your persisted query protocol
    }
  },
};
```

```graphql
query {
  hello
}
```

#### Key Points

- Parse stage failures are client bugs or attacks (malformed documents).
- Persisted queries move trust to hash registry.
- Very large documents should be rejected before parse for CPU safety.

#### Best Practices

- Limit raw body size at HTTP layer.
- Log parse failures at warn level with IP rate limit.
- Use `graphql` parser in utilities for static analysis, not per-request reimplementation.

#### Common Mistakes

- Trying to parse query twice without caching AST (performance).
- Custom parsers breaking spec compliance.
- Persisted query middleware misordered before JSON parse.

---

### 25.5.4 Validation Plugins

#### Beginner

Validation ensures document matches schema types. **Custom validation rules** via **`ValidationContext`** in `graphql` when building custom executable schema—Apollo uses same.

#### Intermediate

**`didResolveOperation`** can inspect **`document`** AST for depth/complexity custom checks beyond `graphql` built-ins.

#### Expert

**`graphql-validation-complexity`** or **`@graphql-eslint`** run in CI; runtime plugin enforces limits on **`fieldNode`** counts.

```javascript
import depthLimit from "graphql-depth-limit";
import { createComplexityLimitRule } from "graphql-validation-complexity";

// When using graphqlHTTP or execute with custom validationRules — pattern shown conceptually
const validationRules = [depthLimit(7), createComplexityLimitRule(1000)];
```

```graphql
query Deep {
  a {
    a {
      a {
        a {
          a {
            a {
              a {
                x
              }
            }
          }
        }
      }
    }
  }
}
```

#### Key Points

- Validation prevents expensive execution before resolvers run.
- Depth and complexity are standard GraphQL API protections.
- Custom rules must be fast—they run every request.

#### Best Practices

- Tune limits using production query histograms.
- Whitelist introspection or internal operations if needed.
- Return clear `BAD_USER_INPUT` / custom codes for limit breaches.

#### Common Mistakes

- Limits too low breaking legitimate mobile queries.
- Only depth, no complexity—wide queries with aliases still hurt.
- Validating after cache layer incorrectly skipping checks.

---

### 25.5.5 Execution Plugins

#### Beginner

**`executionDidStart`** returns **`willResolveField`** hook to time each field resolution.

#### Intermediate

**`executionDidStart`** can return **`end`** callback when execution completes—use for aggregate timing.

#### Expert

**Field instrumentation** feeds OpenTelemetry spans per resolver. **Federation** gateway uses execution hooks to assemble subgraph requests—custom gateway plugins are advanced.

```javascript
const timingPlugin = {
  async requestDidStart() {
    return {
      async executionDidStart() {
        return {
          async willResolveField({ fieldName }) {
            const t0 = Date.now();
            return () => {
              const ms = Date.now() - t0;
              if (ms > 100) console.warn("slow field", fieldName, ms);
            };
          },
        };
      },
    };
  },
};
```

```graphql
query {
  hello
  slow
}
```

#### Key Points

- Field hooks fire often—keep work O(1) and sampled in prod.
- Useful for identifying hot resolver paths.
- N+1 shows as many slow field resolutions—pair with DataLoader metrics.

#### Best Practices

- Aggregate timings in histograms, not per-field logs in prod.
- Include parent type name with field name labels carefully (cardinality).
- Disable detailed field hooks under feature flag.

#### Common Mistakes

- Logging every field in high-traffic APIs (I/O saturation).
- Misinterpreting async resolver timing (hook covers await).
- Infinite recursion in hooks accidentally.

---

## 25.6 Data Sources

### 25.6.1 REST API Integration

#### Beginner

Use **`fetch`** or **`axios`** inside resolvers or service classes. **Cache** GET responses with short TTL if safe.

#### Intermediate

**`RESTDataSource`** from `@apollo/datasource-rest` (Apollo’s approach) provides **`get`/`post`**, header forwarding, memoized fetches per request.

#### Expert

**Circuit breakers** around flaky REST dependencies. **Opentelemetry** HTTP instrumentation auto-traces outbound calls.

```javascript
import { RESTDataSource } from "@apollo/datasource-rest";

class UsersAPI extends RESTDataSource {
  baseURL = "https://api.example.com/";

  async getUser(id) {
    return this.get(`users/${id}`);
  }
}
```

```graphql
type Query {
  remoteUser(id: ID!): User
}
```

#### Key Points

- RESTDataSource dedupes in-flight GETs per data source instance per request.
- Map REST errors to `GraphQLError` with meaningful codes.
- Do not forward all client headers blindly—security risk.

#### Best Practices

- Set timeouts on outbound HTTP.
- Retry idempotent GETs with backoff cautiously.
- Version REST client base URL per environment.

#### Common Mistakes

- Creating new RESTDataSource instance per resolver call (breaks dedupe).
- Not handling 404 vs 500 differently in GraphQL layer.
- Logging full REST responses with PII.

---

### 25.6.2 Database Integration

#### Beginner

Pass **ORM** client (`prisma`, `knex`, `mongoose`) via `context`. Resolvers call **`findUnique`**, **`create`**, etc.

#### Intermediate

**Transaction** per mutation via `prisma.$transaction`. **Row-level** filters always include `tenantId` from context.

#### Expert

**Read replicas**: route read resolvers to replica with **lag-aware** logic for critical reads-after-write. **Connection pool** sizing per instance with PgBouncer in front.

```javascript
const resolvers = {
  Query: {
    post: (_, { id }, { db, user }) =>
      db.post.findFirst({ where: { id, tenantId: user.tenantId } }),
  },
};
```

```graphql
type Query {
  post(id: ID!): Post
}
```

#### Key Points

- DB is source of truth—GraphQL is thin layer.
- Context must carry scoped clients to enforce tenant isolation.
- N+1 remains the top performance issue—use DataLoader or JOINs.

#### Best Practices

- Index foreign keys used in resolver filters.
- Explain analyze slow operations in staging.
- Migrations automated in CI before deploy.

#### Common Mistakes

- Global singleton Prisma without request context (fine) but missing tenant filter (not fine).
- Long transactions open during GraphQL execution across awaits holding locks.
- Raw SQL string concatenation from args (injection).

---

### 25.6.3 DataLoader Caching

#### Beginner

Create **new DataLoader per request** in context: **`new DataLoader(keys => batchFn(keys))`**.

#### Intermediate

**Cache** option `false` when data changes mid-request or reads need freshness. **Prime** loaders after mutations.

#### Expert

**Redis** as secondary cache layer behind DataLoader for cross-request caching—invalidate on writes with event bus.

```javascript
function createLoaders(db) {
  return {
    user: new DataLoader(async (ids) => {
      const rows = await db.user.findMany({ where: { id: { in: [...ids] } } });
      const map = new Map(rows.map((r) => [r.id, r]));
      return ids.map((id) => map.get(id) ?? new Error(`User ${id} missing`));
    }),
  };
}
```

```graphql
type Post {
  author: User!
}
```

#### Key Points

- DataLoader batches within a single event loop tick by default.
- Errors in batch should map per-key, not fail entire batch unexpectedly.
- Request-scoped caching ≠ global caching semantics.

#### Best Practices

- Document that loader cache is short-lived.
- Use `clear`/`prime` intentionally after writes in same request.
- Monitor batch sizes.

#### Common Mistakes

- Sharing loaders across requests (privacy leak + stale data).
- Batch function returning wrong order vs keys.
- Using DataLoader for writes.

---

### 25.6.4 Custom Data Sources

#### Beginner

Encapsulate remote systems in **classes** with methods `getX`, `createY` used by resolvers.

#### Intermediate

Implement interface **`DataSource`** pattern with **`initialize({ context, cache })`** if using Apollo’s data source container (legacy patterns) or roll your own DI.

#### Expert

**GraphQL** upstream (subgraph) as data source from monolith resolver—careful with **cycles** and **timeouts**.

```javascript
export class InventoryAPI {
  constructor({ rpc }) {
    this.rpc = rpc;
  }

  async stock(sku) {
    return this.rpc.call("inventory.stock", { sku });
  }
}
```

```graphql
type Product {
  sku: String!
  inStock: Boolean!
}
```

#### Key Points

- Custom sources improve testability (inject mock).
- Single place to add retries, metrics, and auth token injection.
- Avoid god objects—split by bounded context.

#### Best Practices

- Constructor injection over global imports.
- Timeout and retry policies centralized.
- Map vendor errors to internal error taxonomy.

#### Common Mistakes

- Fat resolvers duplicating fetch logic across fields.
- No interface abstraction—hard to mock in tests.
- Blocking event loop with sync SDK calls.

---

### 25.6.5 Error Handling

#### Beginner

Catch fetch errors, wrap **`GraphQLError`** with code **`UPSTREAM_ERROR`**. Log **`cause`**.

#### Intermediate

**Partial success** in batch resolvers: GraphQL allows some fields to error; use per-element try/catch carefully with non-null implications.

#### Expert

**Fallback** values from cache when upstream down—feature flag **degraded mode** with explicit `extensions.degraded: true`.

```javascript
async function safeFetch(url) {
  try {
    const res = await fetch(url, { timeout: 2000 });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    throw new GraphQLError("Upstream unavailable", {
      extensions: { code: "UPSTREAM", cause: e.message },
    });
  }
}
```

```graphql
type Query {
  externalStat: Int
}
```

#### Key Points

- Upstream failures should not become unhandled promise rejections.
- Decide between fail entire operation vs nullable field null with error entry.
- Monitor upstream error rates by dependency name.

#### Best Practices

- Classify retryable vs non-retryable errors.
- Use `AbortController` for cancellation/timeouts.
- Include dependency name in extensions for support.

#### Common Mistakes

- Swallowing errors returning `0` silently (misleading).
- Throwing raw vendor errors to clients.
- No timeout causing hung GraphQL operations.

---

## 25.7 Production Setup

### 25.7.1 Production Configuration

#### Beginner

Set **`NODE_ENV=production`**, disable verbose playground, enable **introspection policy**, trust reverse proxy if needed.

#### Intermediate

**Helmet**, **CORS allowlist**, **rate limits**, **CSRF** for cookie auth. **`persistedQueries`** or operation safelist.

#### Expert

**Multi-region** active-active: sticky sessions or stateless JWT; **GraphQL** behind GeoDNS. **Feature flags** toggle expensive tracing plugins.

```javascript
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: false,
  csrfPrevention: true,
  cache: "bounded",
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer }), productionLoggingPlugin],
});
```

```graphql
type Query {
  health: String!
}
```

#### Key Points

- Production defaults should be secure; opt-in to dev ergonomics.
- Bounded cache prevents memory exhaustion attacks.
- CSRF protection matters for cookie-based POSTs from browsers.

#### Best Practices

- Infrastructure as code for env vars.
- Runbook for toggling introspection temporarily.
- Load test before launch.

#### Common Mistakes

- `cache: bounded` not set → unbounded in-memory query cache risk.
- Wildcard CORS with credentials.
- Missing drain plugin on k8s.

---

### 25.7.2 Environment Setup

#### Beginner

Separate **`.env.production`** managed by platform (Vercel, Heroku, k8s secrets). No dev URLs in prod.

#### Intermediate

**12-factor**: build artifact immutable; config injected at runtime. **Secrets rotation** without redeploy when using secret managers with dynamic fetch (careful with cold starts).

#### Expert

**Service mesh** mTLS between subgraphs; **SPIFFE** identities. **VPC** private subgraphs unreachable from internet—only gateway public.

```javascript
if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL required");
}
```

```graphql
type Query {
  ping: String
}
```

#### Key Points

- Parity between staging and prod reduces surprises.
- Secrets never in GraphQL responses or logs.
- Feature flags stored separately from code.

#### Best Practices

- Automated staging deploy on main merges.
- Secret scanning in CI (gitleaks).
- Document required env vars in one table.

#### Common Mistakes

- Staging using production database by typo.
- Logging env at startup with secrets unredacted.
- Different Node versions in CI vs prod.

---

### 25.7.3 Logging Configuration

#### Beginner

Use **pino** or **winston** JSON logs. Log **operationName**, **duration**, **user id** (hashed), **error codes**.

#### Intermediate

**Redaction** paths for passwords, tokens in variables. **Sampling** debug logs.

#### Expert

**OpenTelemetry** logs correlated with traces via `trace_id`. **PII** policies determine which arguments are never logged.

```javascript
const loggingPlugin = {
  async requestDidStart({ request }) {
    const start = Date.now();
    return {
      async willSendResponse({ response }) {
        logger.info({
          op: request.operationName,
          ms: Date.now() - start,
          errors: response.body.kind === "single" ? response.body.singleResult.errors?.length : undefined,
        });
      },
    };
  },
};
```

```graphql
query Me {
  me {
    id
  }
}
```

#### Key Points

- Structured logs enable search and alerting.
- Never log `Authorization` header values.
- Correlate with distributed tracing IDs.

#### Best Practices

- Single log line per request at info level; debug more verbose.
- Centralize redaction utility.
- Alert on error rate thresholds from logs/metrics.

#### Common Mistakes

- Logging full GraphQL variables including passwords.
- Unstructured printf debugging left in code.
- Excessive sync logging hurting latency under load.

---

### 25.7.4 Monitoring Setup

#### Beginner

**Health** and **readiness** endpoints for k8s probes. **Uptime** checks POST simple query.

#### Intermediate

**Prometheus + Grafana** dashboards. **Sentry** for error tracking with `ApolloServer` integration capturing exceptions.

#### Expert

**SLOs** on availability and latency with **error budget** policies. **Synthetic** canaries every minute from multiple regions.

```javascript
app.get("/healthz", (_req, res) => res.status(200).send("ok"));
app.get("/readyz", async (_req, res) => {
  try {
    await db.queryRaw`SELECT 1`;
    res.status(200).send("ready");
  } catch {
    res.status(503).send("not ready");
  }
});
```

```graphql
query Ping {
  __typename
}
```

#### Key Points

- Readiness should check critical dependencies (DB), liveness lighter.
- GraphQL-specific metrics complement generic HTTP metrics.
- Synthetic tests catch DNS/TLS issues app metrics miss.

#### Best Practices

- Define SLIs: success rate, latency p95, saturation.
- Page on SLO burn rate, not every blip.
- Include subgraph health in federated monitoring.

#### Common Mistakes

- Readiness probe hitting DB every few seconds too aggressively.
- Liveness restarting pods on slow GC spikes incorrectly configured.
- Monitoring only gateway ignoring subgraph failures.

---

### 25.7.5 Scaling Considerations

#### Beginner

**Horizontal scale**: stateless Node instances behind load balancer; sticky sessions only if using in-memory subs without Redis.

#### Intermediate

**Worker** pool for CPU-heavy tasks (image processing) off main event loop—GraphQL resolver should enqueue job, not block.

#### Expert

**Federation** scales subgraphs independently; **query planner** cache at gateway. **Node clustering** vs containers—prefer many small pods over fork() cluster.

```javascript
// Offload heavy work
async function generateReport(_, __, { queues }) {
  const job = await queues.add("report", { userId: "..." });
  return { jobId: job.id };
}
```

```graphql
type Mutation {
  generateReport: Job!
}
```

#### Key Points

- GraphQL servers should stay stateless except WebSocket subscription registry (use Redis).
- CPU profiling guides when to scale out vs optimize resolvers.
- Database often bottlenecks before Node.

#### Best Practices

- Auto-scale on CPU and request queue depth.
- Use read replicas and caching for hot queries.
- Load test with realistic query mix.

#### Common Mistakes

- Storing session only in memory at scale.
- Subscriptions without Redis adapter on multiple instances.
- Oversized pods causing noisy neighbor GC pauses.

---

## 25.8 Advanced Features

### 25.8.1 Federation

#### Beginner

**Subgraphs** expose pieces of supergraph; **gateway** stitches execution plans. Entities referenced across services use **`@key`**.

#### Intermediate

**Rover** `supergraph compose` in CI. **Apollo Uplink** or static supergraph SDL in enterprise.

#### Expert

**Entity interfaces**, **@interfaceObject**, **@composeDirective** for advanced schema design. **GraphOS** contracts enforce consumer-safe evolution.

```javascript
// Gateway (simplified — use ApolloGateway in practice)
import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: "users", url: "http://localhost:4001/graphql" },
      { name: "posts", url: "http://localhost:4002/graphql" },
    ],
  }),
});

const server = new ApolloServer({ gateway });
```

```graphql
# Supergraph is composed artifact — illustration only
type User @key(fields: "id") {
  id: ID!
}
```

#### Key Points

- Federation trades operational complexity for team autonomy.
- Gateway is single entry for external clients.
- Backward compatible entity changes require planning across teams.

#### Best Practices

- Schema checks on every subgraph PR.
- Integration tests spanning multiple subgraphs for critical queries.
- Standard error handling extensions across subgraphs.

#### Common Mistakes

- Breaking changes to `@key` fields without migration.
- Inconsistent authorization between subgraphs.
- Oversized supergraph causing planner latency—split domains thoughtfully.

---

### 25.8.2 Subscriptions Setup

#### Beginner

Use **`graphql-ws`** server with **`useServer`** from `graphql-ws/use/ws` attached to **HTTP server** upgrades; pass **`execute`, `subscribe`, `schema`** and **`context`** function.

#### Intermediate

**`@apollo/server` v4** subscriptions require separate WebSocket server wiring—see official docs for `expressMiddleware` + `graphql-ws` integration pattern.

#### Expert

**Redis** `PubSub` for multi-instance subscription fan-out. **Authentication** in `onConnect` reading `connectionParams`.

```javascript
import { useServer } from "graphql-ws/use/ws";
import { WebSocketServer } from "ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { subscribe, parse } from "graphql";

const schema = makeExecutableSchema({ typeDefs, resolvers });
const wsServer = new WebSocketServer({ server: httpServer, path: "/graphql" });

useServer(
  {
    schema,
    context: async (ctx) => ({ token: ctx.connectionParams?.Authorization }),
    onSubscribe: async (_ctx, msg) => ({ document: parse(msg.payload.query) }),
  },
  wsServer
);
```

```graphql
type Subscription {
  messageAdded(channelId: ID!): Message!
}
```

#### Key Points

- Subscriptions are not HTTP POST—different scaling and auth patterns.
- `graphql-ws` is the modern protocol; avoid deprecated libraries for new work.
- Context per subscription event may differ from HTTP—document clearly.

#### Best Practices

- Heartbeat/ping configuration aligned with proxies/load balancers.
- Cap concurrent subscriptions per user.
- Load test connection churn.

#### Common Mistakes

- Forgetting to handle `onDisconnect` cleanup.
- Using in-memory PubSub in clustered deployment without shared bus.
- SSL termination at LB misconfigured for WebSocket upgrades.

---

### 25.8.3 WebSocket Configuration

#### Beginner

**Path** `/graphql` vs `/subscriptions`—match client URL. **`ws://` vs `wss://`** behind TLS terminator.

#### Intermediate

**Sticky sessions** if using in-memory subscription state without Redis. **Idle timeouts** on ALB must exceed ping interval.

#### Expert

**Custom subprotocols** compatibility between client and server. **Compression** `permessage-deflate` tradeoffs on CPU.

```javascript
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});
```

```graphql
type Subscription {
  tick: Int!
}
```

#### Key Points

- Proxies must support `Upgrade: websocket` and not buffer indefinitely.
- WSS required in production browsers except localhost.
- Health checks should not target WS path with HTTP GET incorrectly.

#### Best Practices

- Document required headers and connectionParams for clients.
- Test through same load balancer path as production.
- Monitor active connection gauges.

#### Common Mistakes

- Double WebSocket servers attached to same path.
- Nginx missing `proxy_read_timeout` for long-lived WS.
- Mixing `subscriptions-transport-ws` client with `graphql-ws` server.

---

### 25.8.4 Custom Directives

#### Beginner

SDL **`directive @upper on FIELD_DEFINITION`**; use **`mapSchema`** from `@graphql-tools/utils` to wrap field resolvers.

#### Intermediate

**GraphQL Tools** `directiveTransformer` pattern with `getDirectiveValues`.

#### Expert

**Federation** `@tag` for contracts; custom directives must be composed correctly or stripped at gateway per policy.

```javascript
import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import { defaultFieldResolver } from "graphql";

function upperDirectiveTransformer(schema, directiveName) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const upper = getDirective(schema, fieldConfig, directiveName)?.[0];
      if (!upper) return fieldConfig;
      const { resolve = defaultFieldResolver } = fieldConfig;
      fieldConfig.resolve = async (source, args, context, info) => {
        const result = await resolve(source, args, context, info);
        return typeof result === "string" ? result.toUpperCase() : result;
      };
      return fieldConfig;
    },
  });
}
```

```graphql
directive @upper on FIELD_DEFINITION

type Query {
  hello: String @upper
}
```

#### Key Points

- Directives extend schema metadata executed server-side.
- Clients see directives in introspection—no secrets in args.
- Order transformers: auth before logging, etc.

#### Best Practices

- Unit-test transformed schema with sample queries.
- Name directives with company prefix to avoid collisions (`@orgAuth`).
- Document client impact (mostly none for server directives).

#### Common Mistakes

- Applying transformer but forgetting to merge into executable schema passed to Apollo.
- Directive on wrong location (INPUT_FIELD vs FIELD).
- Heavy work in directive wrappers on every field unintentionally.

---

### 25.8.5 Schema Stitching

#### Beginner

**Stitching** merges multiple **executable** or **subschemas** into one gateway schema using **`@graphql-tools/stitch`**.

#### Intermediate

**Remote schemas** via introspection or SDL with **`introspectSchema`**, **`makeRemoteExecutableSchema`**. **Transforms** rename types, filter fields.

#### Expert

**Batching** links to reduce N+1 cross-service calls. **Federation** largely supersedes stitching for greenfield Apollo ecosystems—stitching still valid for integrating legacy GraphQL services.

```javascript
import { stitchSchemas } from "@graphql-tools/stitch";
import { schemaFromExecutor } from "@graphql-tools/wrap";
import { Executor } from "@graphql-tools/utils";

const remoteExecutor = async ({ document, variables }) =>
  fetch("http://localhost:4001/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: print(document), variables }),
  }).then((r) => r.json());

const subschema = await schemaFromExecutor(remoteExecutor);

export const schema = stitchSchemas({ subschemas: [{ schema: subschema }] });
```

```graphql
type Query {
  user(id: ID!): User
}
```

#### Key Points

- Stitching is schema gateway pattern alternative/complement to federation.
- Remote executors must handle errors and auth forwarding consistently.
- Type conflicts across subschemas need transforms to rename.

#### Best Practices

- Cache remote introspection results with TTL in dev tools.
- Add resilience: timeouts, retries for introspection fetch.
- Prefer federation when all subgraphs are Apollo-native.

#### Common Mistakes

- Circular delegation causing infinite loops.
- Missing `batch` settings causing thundering herd.
- Schema drift when remote service deploys without coordination.

---
