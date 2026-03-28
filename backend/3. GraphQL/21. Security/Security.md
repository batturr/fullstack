# Security

## 📑 Table of Contents

- [21.1 Security Basics](#211-security-basics)
  - [21.1.1 GraphQL Security Considerations](#2111-graphql-security-considerations)
  - [21.1.2 Attack Vectors](#2112-attack-vectors)
  - [21.1.3 Vulnerability Types](#2113-vulnerability-types)
  - [21.1.4 Security Best Practices](#2114-security-best-practices)
  - [21.1.5 Security Audits](#2115-security-audits)
- [21.2 Query Depth and Complexity](#212-query-depth-and-complexity)
  - [21.2.1 Query Depth Limiting](#2121-query-depth-limiting)
  - [21.2.2 Query Complexity Analysis](#2122-query-complexity-analysis)
  - [21.2.3 Query Cost Analysis](#2123-query-cost-analysis)
  - [21.2.4 Rate Limiting](#2124-rate-limiting)
  - [21.2.5 Query Throttling](#2125-query-throttling)
- [21.3 Introspection Security](#213-introspection-security)
  - [21.3.1 Disabling Introspection](#2131-disabling-introspection)
  - [21.3.2 Partial Introspection](#2132-partial-introspection)
  - [21.3.3 Controlled Introspection](#2133-controlled-introspection)
  - [21.3.4 Schema Stitching Security](#2134-schema-stitching-security)
  - [21.3.5 Information Disclosure](#2135-information-disclosure)
- [21.4 Input Validation Security](#214-input-validation-security)
  - [21.4.1 Input Sanitization](#2141-input-sanitization)
  - [21.4.2 Injection Prevention](#2142-injection-prevention)
  - [21.4.3 Type Validation](#2143-type-validation)
  - [21.4.4 Size Limits](#2144-size-limits)
  - [21.4.5 Content Validation](#2145-content-validation)
- [21.5 Data Protection](#215-data-protection)
  - [21.5.1 Sensitive Data Masking](#2151-sensitive-data-masking)
  - [21.5.2 Field-Level Permissions](#2152-field-level-permissions)
  - [21.5.3 Data Encryption](#2153-data-encryption)
  - [21.5.4 PII Handling](#2154-pii-handling)
  - [21.5.5 Audit Logging](#2155-audit-logging)
- [21.6 Transport Security](#216-transport-security)
  - [21.6.1 HTTPS/TLS](#2161-httpstls)
  - [21.6.2 Certificate Management](#2162-certificate-management)
  - [21.6.3 Secure Cookies](#2163-secure-cookies)
  - [21.6.4 CORS Configuration](#2164-cors-configuration)
  - [21.6.5 Referrer Policy](#2165-referrer-policy)
- [21.7 Advanced Security](#217-advanced-security)
  - [21.7.1 Batching Attacks Prevention](#2171-batching-attacks-prevention)
  - [21.7.2 Alias Attacks Prevention](#2172-alias-attacks-prevention)
  - [21.7.3 Fragment Attacks Prevention](#2173-fragment-attacks-prevention)
  - [21.7.4 Directive Abuse Prevention](#2174-directive-abuse-prevention)
  - [21.7.5 Resource Exhaustion Prevention](#2175-resource-exhaustion-prevention)

---

## 21.1 Security Basics

### 21.1.1 GraphQL Security Considerations

#### Beginner

GraphQL exposes a **single endpoint** and accepts **flexible queries**. That power means attackers can craft **expensive** or **deep** documents, probe **schema** details, and attempt **injection** via arguments if resolvers concatenate strings into SQL.

#### Intermediate

Security must cover **transport** (TLS), **authentication/authorization** per field, **input validation**, **rate limits**, **depth/complexity** controls, and **logging** without leaking secrets. **Errors** should not reveal stack traces to clients in production.

#### Expert

Threat model **federation** and **subscriptions** separately: subgraph trust boundaries, **router-level** auth, **WebSocket** origin checks, **token** refresh, **tenant isolation** in loaders, and **supply chain** risks in schema generation tools.

```javascript
import { ApolloServer } from "@apollo/server";
import { GraphQLError } from "graphql";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err) => {
    if (process.env.NODE_ENV === "production") {
      return new GraphQLError("Internal error", {
        extensions: { code: "INTERNAL" },
      });
    }
    return err;
  },
});
```

```graphql
type Query {
  me: User
}
```

#### Key Points

- Flexibility increases attack surface versus fixed REST routes.
- Defense in depth: validation, limits, authz, observability.
- Production error shaping prevents information leaks.

#### Best Practices

- Centralize authz in a policy layer or graphql-shield-style rules.
- Use structured logging with correlation IDs.
- Regular dependency updates for graphql and servers.

#### Common Mistakes

- Relying on “security through obscurity” by hiding SDL only.
- Returning raw DB errors to clients.
- No auth checks inside field resolvers.

---

### 21.1.2 Attack Vectors

#### Beginner

Common vectors: **deep recursion**, **wide queries** with aliases, **batching** many operations in one HTTP call, **introspection** for reconnaissance, **injection** in string-built queries, **broken access control** on object fields.

#### Intermediate

**Denial of wallet** on hosted services via expensive resolver chains. **CSRF** on cookie-based GraphQL POST if CORS/methods misconfigured. **WebSocket** hijacking without origin checks.

#### Expert

**GraphiQL exposure** in prod leaks schema and aids attackers. **APQ** bypass if server accepts arbitrary queries alongside. **Federation** `entities` batching can become a **bulk IDOR** if authorization is per-request but not per-entity.

```graphql
query AttackWide {
  a1: user(id: "1") { email }
  a2: user(id: "2") { email }
  a3: user(id: "3") { email }
}
```

```javascript
const resolvers = {
  Query: {
    user: (_, { id }, ctx) => ctx.db.query("SELECT * FROM users WHERE id=$1", [id]),
  },
};
```

#### Key Points

- Attackers abuse query flexibility and batching.
- Auth must be object-aware, not only endpoint-aware.
- Developer tools in prod are a reconnaissance risk.

#### Best Practices

- Maintain an internal threat model checklist.
- Run authenticated fuzzing against staging.
- Disable GraphiQL in production unless protected.

#### Common Mistakes

- Checking auth only at HTTP middleware, not per field.
- Ignoring alias multiplication.
- Public staging with production-like data.

---

### 21.1.3 Vulnerability Types

#### Beginner

Types include **injection** (SQL/NoSQL/OS), **broken access control**, **sensitive data exposure**, **DoS**, **misconfiguration** (CORS, TLS), **vulnerable dependencies**.

#### Intermediate

GraphQL-specific: **introspection disclosure**, **field suggestion** leaks, **resolver SSRF** when URLs come from arguments, **upload** issues with multipart.

#### Expert

**Business logic** flaws: coupon stacking via parallel mutations, **race conditions** in inventory, **idempotency** gaps. Map to **OWASP API Top 10** and **CWE** for triage severity.

```javascript
const resolvers = {
  Query: {
    preview: async (_, { url }) => {
      const res = await fetch(url);
      return res.text();
    },
  },
};
```

#### Key Points

- Classic web vulns still apply under GraphQL.
- Business logic bugs hide behind strongly typed schemas.
- Classification helps prioritization and compliance.

#### Best Practices

- Tie findings to exploitability and data classification.
- Track CWE in issue tracker.
- Red team GraphQL separately from REST.

#### Common Mistakes

- Assuming types prevent all invalid states.
- Focusing only on injection, missing authz.
- No inventory of public vs internal operations.

---

### 21.1.4 Security Best Practices

#### Beginner

Use **parameterized queries**, **validate inputs**, **authenticate** users, **authorize** every sensitive field, **limit** query size/depth, **disable introspection** in prod if appropriate, serve over **HTTPS**.

#### Intermediate

**Persisted queries** for mobile/web clients you control. **RBAC/ABAC** centralized. **Secrets** in vaults, not env files in images. **CSP** for any hosted GraphiQL.

#### Expert

**Zero-trust** between subgraphs; **mTLS**; **signed** persisted query manifests; **continuous** SAST/DAST in CI; **subprocessor** review for hosted routers.

```javascript
import { rule, shield } from "graphql-shield";

const isAuthenticated = rule()(async (_p, _a, ctx) => Boolean(ctx.user));

export const permissions = shield({
  Query: { me: isAuthenticated },
  Mutation: { deleteUser: isAuthenticated },
  // Add rules per mutation field; avoid blanket wildcards unless intended.
});
```

```javascript
import rateLimit from "express-rate-limit";

app.use(
  "/graphql",
  rateLimit({ windowMs: 60_000, max: 300, standardHeaders: true }),
);
```

#### Key Points

- Layer controls: edge, server, resolver, data store.
- Automation enforces practices consistently.
- Least privilege everywhere.

#### Best Practices

- Security requirements in definition of done.
- Rotate keys regularly.
- Train developers on GraphQL-specific pitfalls.

#### Common Mistakes

- Copy-pasting REST middleware without GraphQL semantics.
- Over-blocking introspection for internal tools without VPN.
- Storing JWTs in localStorage without XSS plan.

---

### 21.1.5 Security Audits

#### Beginner

**Audits** review schema, resolvers, auth, deployment config, and dependencies. Include **penetration testing** with GraphQL-aware tools.

#### Intermediate

Use **graphql-cop**, **InQL**, **clairvoyance** (where legal), custom scripts for **alias** stress. Review **CI** for `NODE_ENV`, **introspection** flags, **GraphiQL** exposure.

#### Expert

**SOC2/ISO** evidence: access logs, change management, incident response playbooks for credential leaks. **Bug bounty** scope should explicitly mention GraphQL edge cases.

```javascript
export function listFields(schema) {
  const typeMap = schema.getTypeMap();
  return Object.keys(typeMap).filter((k) => !k.startsWith("__"));
}
```

```bash
npm audit --omit=dev --audit-level=high
```

#### Key Points

- Audits combine automated and manual review.
- Compliance needs traceable controls.
- Re-audit after major schema changes.

#### Best Practices

- Maintain audit checklist versioned with schema.
- External pen-test annually for internet-facing APIs.
- Document exceptions and compensating controls.

#### Common Mistakes

- Only running generic web scanners.
- Ignoring WebSocket endpoints.
- No review of admin-only tooling routes.

---

## 21.2 Query Depth and Complexity

### 21.2.1 Query Depth Limiting

#### Beginner

**Depth** is nesting level: `a { b { c } }` has depth 3. Limit depth to prevent **stack** and **resolver** explosions.

#### Intermediate

Implement via **validation rules** or **plugins** that traverse AST `SelectionSet` depth. Allow higher limits for trusted internal operations.

#### Expert

Depth limits miss **wide** queries—pair with **complexity** or **cost**. **Introspection** queries can be deep—handle `__schema` paths explicitly.

```javascript
import { visit } from "graphql";

export function maxDepthRule(max) {
  return function DepthLimit(context) {
    return {
      Document(node) {
        let deepest = 0;
        visit(node, {
          SelectionSet: {
            enter(_, _k, _p, path) {
              const d = path.filter((x) => x === "selections").length;
              deepest = Math.max(deepest, d);
            },
          },
        });
        if (deepest > max) {
          context.reportError(new Error(`Max depth ${max} exceeded (${deepest})`));
        }
      },
    };
  };
}
```

#### Key Points

- Depth limiting is a coarse but useful guardrail.
- Must align with legitimate client queries.
- Not sufficient alone.

#### Best Practices

- Default conservative limits for public APIs.
- Whitelist operations for special cases.
- Log rejected queries for tuning.

#### Common Mistakes

- Setting depth so low that introspection breaks devtools.
- Measuring depth incorrectly across fragments.
- Only depth, no breadth controls.

---

### 21.2.2 Query Complexity Analysis

#### Beginner

Assign **weights** to fields (e.g., `users` = 10 × child weight). Sum weights over the AST; reject over threshold.

#### Intermediate

Multiply by **list size arguments** (`first`, `limit`). Cache complexity per **persisted query id**.

#### Expert

**Field multipliers** from **database cost hints**; **dynamic** complexity based on **tenant tier**; integrate with **gateway** policies in federation.

```javascript
import { getComplexity, simpleEstimator } from "graphql-query-complexity";

const complexityPlugin = {
  requestDidStart() {
    return {
      didResolveOperation(rc) {
        const max = 1000;
        const complexity = getComplexity({
          schema: rc.schema,
          operationName: rc.request.operationName,
          query: rc.document,
          variables: rc.request.variables,
          estimators: [simpleEstimator({ defaultComplexity: 1 })],
        });
        if (complexity > max) throw new Error("Query too complex");
      },
    };
  },
};
```

#### Key Points

- Complexity aligns limits with actual work better than depth alone.
- Estimators must be tuned to your schema.
- Dynamic limits support enterprise tiers.

#### Best Practices

- Start with simple estimators, refine with traces.
- Document how to request limit increases.
- Monitor complexity distribution.

#### Common Mistakes

- Uniform weights for cheap vs expensive fields.
- Ignoring variables in list size multipliers.
- Throwing opaque errors without support hints.

---

### 21.2.3 Query Cost Analysis

#### Beginner

**Cost** is similar to complexity but often tied to **infrastructure** pricing or **SLO budgets** (e.g., max DB reads).

#### Intermediate

Attach **directives** `@cost` in SDL extensions; aggregate **resolver-level** timings in staging to set costs.

#### Expert

**Adaptive** cost enforcement using **live** p95 timings per field; **circuit breakers** when downstream latency spikes.

```graphql
directive @cost(weight: Int!) on FIELD_DEFINITION

extend type Query {
  search(q: String!): [Item!]! @cost(weight: 50)
}
```

```javascript
export function costFromExtensions(fieldDef) {
  const astNode = fieldDef.astNode;
  const dir = astNode?.directives?.find((d) => d.name.value === "cost");
  const arg = dir?.arguments?.find((a) => a.name.value === "weight");
  return arg ? Number(arg.value.value) : 1;
}
```

#### Key Points

- Cost modeling connects security to economics.
- Needs ongoing calibration.
- Directives document intent in schema.

#### Best Practices

- Review costs when resolvers change.
- Export metrics on rejected queries.
- Align with pagination defaults.

#### Common Mistakes

- Static costs never updated.
- Costs ignoring fan-out to microservices.
- Blocking legitimate bulk admin tools without alternative.

---

### 21.2.4 Rate Limiting

#### Beginner

**Rate limits** cap requests per IP, user, or API key per time window—mitigate brute force and DoS.

#### Intermediate

**Sliding window** in Redis; **cost-based** limits (expensive operations consume more tokens). **GraphQL-specific**: limit **batch operations** array size too.

#### Expert

**Global** vs **per-operation** quotas; **burst** allowances; **WAF** integration; **GraphQL** `@defer` can change traffic patterns—validate limits still meaningful.

```javascript
import { RateLimiterRedis } from "rate-limiter-flexible";
import { createClient } from "redis";

const redisClient = createClient({ url: process.env.REDIS_URL });
await redisClient.connect();

const limiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rl",
  points: 100,
  duration: 60,
});

app.use("/graphql", async (req, res, next) => {
  const key = req.user?.id ?? req.ip;
  try {
    await limiter.consume(key);
    next();
  } catch {
    res.status(429).json({ errors: [{ message: "Too many requests" }] });
  }
});
```

#### Key Points

- Rate limits complement query cost controls.
- Per-user limits fairer than IP-only behind NAT.
- Redis enables distributed limiting.

#### Best Practices

- Return `Retry-After` when possible.
- Separate anonymous vs authenticated quotas.
- Monitor false positives by region.

#### Common Mistakes

- Only IP limiting for mobile carriers.
- Ignoring batched GraphQL bodies.
- No bypass for health checks hitting same route.

---

### 21.2.5 Query Throttling

#### Beginner

**Throttling** slows or queues excess traffic—**soft** degradation vs hard **429**.

#### Intermediate

**Leaky bucket**/**token bucket** algorithms; combine with **priority** for premium tenants.

#### Expert

**Server-side** backpressure: reduce **concurrency** to DB during incidents; **shedding** read traffic while preserving mutations for payments with allowlists.

```javascript
import PQueue from "p-queue";

const queue = new PQueue({ concurrency: 50 });

app.use("/graphql", (req, res, next) => {
  queue
    .add(() => new Promise((resolve) => next(resolve)))
    .catch(() => res.status(503).end());
});
```

#### Key Points

- Throttling protects dependencies under load.
- Different from static rate limits—more dynamic.
- Must avoid starvation of critical operations.

#### Best Practices

- Define SLOs for queue wait times.
- Metrics on shed requests.
- Graceful error messages.

#### Common Mistakes

- Unbounded queues causing memory spikes.
- Throttling auth endpoints too aggressively.
- No bypass for internal monitoring probes.

---

## 21.3 Introspection Security

### 21.3.1 Disabling Introspection

#### Beginner

**Introspection** lets clients download the full schema via `__schema`. Disable in **production** public APIs to reduce reconnaissance—**not** a substitute for auth.

#### Intermediate

Use **`NoSchemaIntrospectionCustomRule`** from `graphql` or Apollo’s `introspection: false` in gateway config for untrusted traffic.

#### Expert

Some **clients** (IDEs, codegen) need introspection—expose on **separate** internal endpoint/VPN. **Federation** routers may still need controlled supergraph visibility.

```javascript
import { NoSchemaIntrospectionCustomRule, graphql } from "graphql";

const result = await graphql({
  schema,
  source: req.body.query,
  contextValue: ctx,
  variableValues: req.body.variables,
  validationRules: [NoSchemaIntrospectionCustomRule],
});
```

```javascript
import { ApolloServer } from "@apollo/server";

new ApolloServer({
  schema,
  introspection: process.env.NODE_ENV !== "production",
});
```

#### Key Points

- Disabling introspection reduces schema leakage.
- Legitimate tooling may break without alternatives.
- Pair with authz and query limits.

#### Best Practices

- Environment-based toggles.
- Internal schema registry for developers.
- Monitor for introspection attempts.

#### Common Mistakes

- Believing introspection off equals secure API.
- Breaking CI codegen without persisted schema artifact.
- Inconsistent settings between subgraph and gateway.

---

### 21.3.2 Partial Introspection

#### Beginner

**Partial** introspection exposes only subsets (e.g., public types) via **custom** endpoints or **filtered** schemas.

#### Intermediate

Generate **two schemas**: `publicSchema` without sensitive fields for external introspection; full schema for internal.

#### Expert

**Schema trimming** tools strip internal directives and types. **Field-level** visibility in **GraphQL Mesh** or custom **`transformSchema`** pipelines.

```javascript
import { filterSchema } from "@graphql-tools/wrap";

export const publicSchema = filterSchema({
  schema: fullSchema,
  rootFieldFilter: (op, name) => !name.startsWith("admin"),
  fieldFilter: (_type, field) => !field.name.startsWith("secret"),
});
```

#### Key Points

- Partial introspection balances DX and disclosure risk.
- Requires build-time discipline to avoid drift.
- Test that filtered schema validates client operations.

#### Best Practices

- Automate public schema generation in CI.
- Diff public vs internal SDL on PRs.
- Document which types are public.

#### Common Mistakes

- Leaking internal types via interfaces/unions.
- Forgetting to filter subscription fields.
- Manual filtering that rots.

---

### 21.3.3 Controlled Introspection

#### Beginner

Allow introspection only for **authenticated** admin roles or **mTLS** clients.

#### Intermediate

**Time-limited tokens** for codegen jobs. **IP allowlists** on `/graphql` dev routes.

#### Expert

**OAuth scopes** like `schema:read`; **audit** every introspection query; **watermark** SDL downloads with downloader identity metadata in logs.

```javascript
app.use("/graphql", (req, res, next) => {
  const isIntro = req.body.query?.includes("__schema");
  if (isIntro && !req.user?.roles?.includes("ADMIN")) {
    return res.status(403).json({ errors: [{ message: "Forbidden" }] });
  }
  next();
});
```

#### Key Points

- Controlled introspection preserves developer workflows.
- Strong auth and audit are mandatory.
- Simple substring checks are fragile—prefer validation phase hooks.

#### Best Practices

- Use validation rules/plugins for robust detection.
- Log who introspected and when.
- Rate-limit introspection separately.

#### Common Mistakes

- Fragile `includes("__schema")` bypass via aliases/fragments.
- Admin accounts without MFA.
- Logging full introspection responses (huge, sensitive).

---

### 21.3.4 Schema Stitching Security

#### Beginner

**Stitching** combines multiple schemas—risk of **type collisions**, **unexpected** field exposure, and **trust** in remote schemas.

#### Intermediate

Validate **ownership** of types; **namespace** types per subgraph; enforce **authorization** at gateway before delegating.

#### Expert

**Federation** replaces classic stitching often—verify **`@external`** misuse cannot bypass auth. **SDL pulling** from untrusted URLs is **SSRF**—disallow or sandbox.

```javascript
import { stitchSchemas } from "@graphql-tools/stitch";

export const schema = stitchSchemas({
  subschemas: [
    { schema: usersSchema, executor: usersExecutor },
    { schema: ordersSchema, executor: ordersExecutor },
  ],
});
```

#### Key Points

- Composition expands trust boundaries.
- Remote schema fetching is high risk.
- Gateway policies must be authoritative.

#### Best Practices

- Pin subgraph versions in CI.
- Static SDL artifacts instead of runtime fetch when possible.
- Pen-test delegation resolvers.

#### Common Mistakes

- Assuming subgraphs are trusted without TLS/mTLS.
- Exposing internal admin subgraphs publicly.
- Missing conflict resolution on type names.

---

### 21.3.5 Information Disclosure

#### Beginner

**Disclosure** happens via verbose **errors**, **stack traces**, **debug extensions**, **introspection**, and **suggestions** (“Did you mean…”).

#### Intermediate

Disable **field suggestions** in production (graphql-yoga, Apollo options). Strip **`extensions.exception`** from responses.

#### Expert

**Timing attacks** on user enumeration via different error paths—normalize messages and response times. **DataLoader** errors should not reveal internal IDs beyond authz.

```javascript
import { GraphQLError } from "graphql";

throw new GraphQLError("Invalid credentials", {
  extensions: { code: "AUTH_FAILED" },
});
```

```javascript
formatError: (formattedError) => {
  if (formattedError.extensions?.exception) {
    delete formattedError.extensions.exception;
  }
  return formattedError;
},
```

#### Key Points

- Errors are a primary leak channel.
- Timing and message shape both matter.
- Extensions require hygiene.

#### Best Practices

- Unified auth failure messages.
- Constant-time comparisons for secrets.
- Redact variables in logs.

#### Common Mistakes

- `"User not found"` vs `"Wrong password"` differences.
- Returning SQL strings in errors.
- Logging full documents with tokens.

---

## 21.4 Input Validation Security

### 21.4.1 Input Sanitization

#### Beginner

**Sanitize** strings to prevent **XSS** when values are rendered in HTML, and to remove **control characters** before storage.

#### Intermediate

Use libraries like **validator.js**, **dompurify** on client, **sanitize-html** server-side for rich text. **GraphQL** `String` still can carry HTML.

#### Expert

**Unicode normalization** (NFKC) to avoid homoglyph attacks in emails; **strip** zero-width chars; **length** limits before regex work to prevent ReDoS.

```javascript
import validator from "validator";

function sanitizeEmail(s) {
  const t = s.trim().toLowerCase();
  if (!validator.isEmail(t)) throw new Error("Invalid email");
  return t;
}
```

```javascript
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

export function sanitizeHtml(html) {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
```

#### Key Points

- Sanitization depends on output context (HTML vs plain).
- Validate first, sanitize for display/storage policies.
- Email/username need normalization rules.

#### Best Practices

- Allowlists over denylists for rich text.
- Centralize sanitizers per field type.
- Test with known XSS payloads.

#### Common Mistakes

- Double-escaping breaking legitimate content.
- Sanitizing only on read, not on write.
- Trusting `String` GraphQL type as safe HTML.

---

### 21.4.2 Injection Prevention

#### Beginner

Never build SQL with **string concatenation** of user input. Use **parameterized** queries or ORM methods that bind parameters.

#### Intermediate

**NoSQL injection** via `$where` operators in some drivers—validate object shapes. **OS command** injection if resolvers shell out.

#### Expert

**GraphQL variables** are not automatically safe if passed into **raw** query fragments. **LIKE** patterns need **escaping** `%` and `_`. **Second-order** injection via stored payloads.

```javascript
await db.query("SELECT * FROM users WHERE email = $1", [email]);
```

```javascript
await db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

#### Key Points

- Parameter binding separates code from data.
- Injection surfaces include SQL, NoSQL, LDAP, OS.
- GraphQL typing does not replace input validation.

#### Best Practices

- Lint for string-built queries.
- Use ORM query APIs.
- Escape LIKE wildcards when user supplies pattern.

#### Common Mistakes

- Dynamic `ORDER BY` column names from args without allowlists.
- Passing JSON blobs straight into Mongo queries.
- Logging interpolated queries with secrets.

---

### 21.4.3 Type Validation

#### Beginner

GraphQL validates **scalars** and **enums** at the validation layer before resolvers run.

#### Intermediate

Add **custom scalars** (`Email`, `PositiveInt`) with `parseValue`/`parseLiteral` coercion and checks.

#### Expert

**Zod/Yup/Joi** in resolvers for **Input** objects when rules exceed GraphQL expressiveness (cross-field constraints). **JSON scalar** is high risk—avoid or wrap with strict schema validation.

```javascript
import { GraphQLScalarType, Kind } from "graphql";

const EmailScalar = new GraphQLScalarType({
  name: "Email",
  serialize: (v) => v,
  parseValue: (v) => {
    if (typeof v !== "string" || !/^[^@\s]+@[^@\s]+$/.test(v)) {
      throw new TypeError("Invalid email");
    }
    return v.toLowerCase();
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) throw new TypeError("Email must be string");
    return this.parseValue(ast.value);
  },
});
```

#### Key Points

- Custom scalars centralize parsing rules.
- Complex validation may need resolver-level libraries.
- JSON scalar bypasses structure guarantees.

#### Best Practices

- Prefer specific input types over loose scalars.
- Unit test parseLiteral and parseValue paths.
- Document coercion behavior.

#### Common Mistakes

- Coercion that hides invalid states silently.
- Regexes vulnerable to ReDoS.
- Validating only on client.

---

### 21.4.4 Size Limits

#### Beginner

Limit **HTTP body** size, **query string** length for GET, **maximum tokens** in document, **max aliases**, **max batch operations**.

#### Intermediate

Express **`limit`**, **`graphql-upload`** file size caps, **depth** and **complexity** as indirect size controls.

#### Expert

**Node** JSON parser limits; **WAF** body limits; **per-field** string max lengths in scalars; **array input** max items.

```javascript
import express from "express";

const app = express();
app.use(express.json({ limit: "100kb" }));
```

```javascript
import { depthLimit } from "graphql-depth-limit";

app.use(
  graphqlHTTP({
    schema,
    validationRules: [depthLimit(10)],
  }),
);
```

#### Key Points

- Size limits prevent memory bombs and parser DoS.
- Limits should exist at reverse proxy and app layers.
- Batch and alias attacks need explicit caps.

#### Best Practices

- Align limits with largest legitimate operation.
- 413/400 with clear errors for developers.
- Monitor rejected oversized payloads.

#### Common Mistakes

- Huge base64 blobs in variables.
- No limit on GraphQL batch array length.
- Depth limit without query length limit.

---

### 21.4.5 Content Validation

#### Beginner

Validate **business rules**: age ranges, allowed file types, **profanity** policy, **geo** restrictions—beyond scalar format.

#### Intermediate

**Cross-field** validation: `endDate` after `startDate`. Centralize in **domain services** callable from resolvers.

#### Expert

**Content moderation** pipelines (async), **virus scan** for uploads, **PII** detection before logging. **Rate** expensive validators.

```javascript
import { z } from "zod";

const BookingInput = z
  .object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  })
  .refine((v) => v.end > v.start, { message: "end after start" });

export function parseBooking(input) {
  return BookingInput.parse(input);
}
```

#### Key Points

- Business validation belongs in the domain layer.
- GraphQL errors should map cleanly for clients.
- Async moderation may need pending states.

#### Best Practices

- Return `USER_INPUT_ERROR` codes with field paths.
- Keep validators pure and testable.
- Document allowed content policies.

#### Common Mistakes

- Throwing generic errors for validation failures.
- Validating only in UI.
- Blocking event loop with CPU-heavy validators unbounded.

---

## 21.5 Data Protection

### 21.5.1 Sensitive Data Masking

#### Beginner

**Mask** PII in logs and errors: show last-4 of card, redact emails in non-admin contexts.

#### Intermediate

**Resolver-level** masking based on role; **@auth** directives triggering field resolvers to null fields.

#### Expert

**Tokenization** for PCI; **detokenization** only in isolated service. **Log processors** with automatic redaction patterns (credit cards, JWT).

```javascript
export const resolvers = {
  User: {
    ssn: (u, _, ctx) => (ctx.user?.isAdmin ? u.ssn : "***-**-****"),
  },
};
```

```javascript
function redact(obj) {
  const s = JSON.stringify(obj);
  return s.replace(/\b\d{4}-\d{4}-\d{4}-\d{4}\b/g, "[REDACTED_CARD]");
}
```

#### Key Points

- Mask at presentation boundary, not only DB.
- Logs are a common leak path.
- Admin views need explicit policy.

#### Best Practices

- Structured logging with allowlisted fields.
- Sample and review production logs regularly.
- Separate data classes (public, internal, secret).

#### Common Mistakes

- Masking in UI but exposing in API.
- Partial masking that is reversible.
- Storing masked values back as if authoritative.

---

### 21.5.2 Field-Level Permissions

#### Beginner

Check **roles/scopes** inside field resolvers or with a rules engine before returning data.

#### Intermediate

**GraphQL Shield**, **CASL**, **OPA** integration. **Parent** checks insufficient—**each** field that exposes sensitive data must enforce policy.

#### Expert

**Attribute-based** access: row-level `tenantId` must match `ctx.tenant`. **Federation** requires **entity** reference resolvers to re-check auth.

```javascript
import { rule, shield } from "graphql-shield";

const ownsUser = rule()(async (_p, args, ctx) => ctx.user?.id === args.id);
const isAdmin = rule()(async (_p, _a, ctx) => ctx.user?.roles?.includes("ADMIN"));

export default shield({
  Query: {
    user: ownsUser.or(isAdmin),
  },
  User: {
    email: isAdmin,
  },
  Mutation: {
    deleteUser: isAdmin,
  },
});
```

#### Key Points

- Fine-grained authz prevents IDOR at field level.
- List every sensitive `Mutation` field explicitly; use library options for global fallback deny where supported.
- Rules should be composable and testable.

#### Best Practices

- Unit tests per sensitive field.
- Central policy documentation.
- Metrics on denied field access attempts.

#### Common Mistakes

- Auth only on parent object fetch.
- Inconsistent rules between queries and mutations.
- Trusting client-provided `__typename`.

---

### 21.5.3 Data Encryption

#### Beginner

**TLS** encrypts data in transit. **At-rest** encryption via database/cloud KMS for disks and backups.

#### Intermediate

**Application-level** encryption for ultra-sensitive columns (using **AES-GCM**) with keys in **KMS**; **envelope encryption** pattern.

#### Expert

**Per-tenant keys**, **rotation**, **HSM** integration. **Searchable encryption** tradeoffs—often tokenize instead. **GraphQL** file uploads: encrypt objects in **S3** with SSE-KMS.

```javascript
import { createCipheriv, randomBytes, scryptSync } from "node:crypto";

const key = scryptSync(process.env.MASTER_SECRET, "salt", 32);

export function encrypt(plain) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}
```

#### Key Points

- Layer encryption: transit, disk, app column.
- Key management is the hardest part.
- Encrypted fields complicate search and indexing.

#### Best Practices

- Use cloud KMS/HSM for key storage.
- Automate rotation with re-encryption jobs.
- Never log ciphertext keys or IVs unnecessarily.

#### Common Mistakes

- Hardcoding keys in repo.
- ECB mode or homegrown crypto.
- Decrypting entire tables into memory without need.

---

### 21.5.4 PII Handling

#### Beginner

**PII** includes names, emails, addresses, government IDs. **Minimize** collection, **limit** retention, obtain **consent** where required.

#### Intermediate

**Data maps** documenting PII per GraphQL type. **Right to erasure** workflows deleting user rows and cache keys.

#### Expert

**DPA** with subprocessors, **cross-border** transfer mechanisms, **pseudonymization** for analytics pipelines fed by GraphQL events.

```javascript
export async function deleteUserData(db, redis, userId) {
  await db.query("DELETE FROM users WHERE id = $1", [userId]);
  await redis.del(`user:${userId}`);
  await redis.del(`user:${userId}:orders`);
}
```

#### Key Points

- GDPR/CCPA etc. impose operational requirements.
- GraphQL caches and logs spread PII—track them all.
- Erasure must be end-to-end.

#### Best Practices

- Privacy review for new fields.
- TTL on analytics exports.
- Data processing agreements in place.

#### Common Mistakes

- PII in client persisted caches without policy.
- Backups retaining deleted user data forever.
- Sharing staging DB snapshots publicly.

---

### 21.5.5 Audit Logging

#### Beginner

Log **who** did **what** **when** for sensitive mutations (`deleteAccount`, `changeRole`). Avoid logging secrets.

#### Intermediate

**Immutable** log sinks (SIEM), **correlation IDs** across subgraphs, **hash** user identifiers where pseudonymization suffices.

#### Expert

**Tamper-evident** logs (WORM storage), **real-time** alerts on privilege escalations, **dual control** for admin actions.

```javascript
export function auditLog(ctx, action, target) {
  ctx.logger.info({
    type: "audit",
    action,
    actor: ctx.user?.id,
    target,
    requestId: ctx.requestId,
    ts: new Date().toISOString(),
  });
}
```

```javascript
auditLog(ctx, "GRANT_ROLE", { userId, role });
```

#### Key Points

- Audit logs support forensics and compliance.
- Structure enables querying and alerting.
- Balance detail vs PII exposure in logs.

#### Best Practices

- Append-only storage for audit stream.
- Regular access reviews of who can read audits.
- Test alert pipelines.

#### Common Mistakes

- Logging passwords or reset tokens.
- Mutable logs in SQL without protections.
- No retention policy (infinite PII store).

---

## 21.6 Transport Security

### 21.6.1 HTTPS/TLS

#### Beginner

Serve GraphQL only over **HTTPS** in production. **TLS** encrypts headers and body, preventing passive sniffing.

#### Intermediate

**TLS 1.2+**, strong cipher suites, **HSTS** header. **Terminate TLS** at load balancer or Node (less common) with proper cert chain.

#### Expert

**mTLS** for service-to-service GraphQL or subgraph calls. **OCSP stapling** on edge. **Zero-round-trip** resumption settings reviewed for security tradeoffs.

```javascript
import fs from "node:fs";
import https from "node:https";

https
  .createServer(
    {
      key: fs.readFileSync("key.pem"),
      cert: fs.readFileSync("cert.pem"),
      minVersion: "TLSv1.2",
    },
    app,
  )
  .listen(443);
```

#### Key Points

- TLS protects confidentiality and integrity on the wire.
- Configuration errors (old protocols) are common findings.
- mTLS raises assurance for internal APIs.

#### Best Practices

- Automated cert renewal (ACME).
- Redirect HTTP→HTTPS.
- Test SSL Labs grade periodically.

#### Common Mistakes

- Mixed content with WS `ws://` from `https://` pages.
- TLS termination misconfigured exposing plain HTTP internally without VPC protection.
- Weak ciphers for legacy clients.

---

### 21.6.2 Certificate Management

#### Beginner

**Certificates** prove server identity. Manage **private keys** securely; rotate before expiry.

#### Intermediate

Use **Let’s Encrypt** or cloud **ACM**; store keys in **KMS** or **vault**; automate **renewal** and **deploy** to load balancers.

#### Expert

**Private PKI** for internal mesh; **certificate pinning** for high-risk mobile apps (careful with rotation). **Short-lived** certs with automated rotation reduce breach impact.

```bash
certbot renew --quiet --deploy-hook "systemctl reload nginx"
```

#### Key Points

- Expired certs cause outages and drive bad workarounds.
- Key compromise requires revocation and rotation.
- Automation reduces human error.

#### Best Practices

- Alerts 30/14/7 days before expiry if manual.
- HSM or KMS for key storage in regulated environments.
- Document rotation runbooks.

#### Common Mistakes

- Shared wildcard private keys broadly.
- No monitoring of cert expiry.
- Checking in `key.pem` to git.

---

### 21.6.3 Secure Cookies

#### Beginner

If using **cookies** for sessions (CSRF considerations aside), set **`HttpOnly`**, **`Secure`**, **`SameSite`**.

#### Intermediate

**SameSite=Lax** or **Strict** depending on cross-site needs. **Partitioned** cookies for third-party contexts where applicable.

#### Expert

**Double-submit cookie** CSRF defense is weaker than **synchronizer tokens** for GraphQL POST—prefer **custom headers** or **SameSite** + **Origin** checks.

```javascript
res.cookie("sid", token, {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 3600 * 1000,
});
```

#### Key Points

- Cookies are a session fixation/sniffing risk without flags.
- SameSite mitigates many CSRF cases.
- GraphQL POST + cookies needs explicit CSRF strategy.

#### Best Practices

- Rotate session IDs on login elevation.
- Bind session to user-agent/IP only with caution (mobile NAT).
- Logout clears cookie server-side.

#### Common Mistakes

- Missing Secure on production.
- SameSite=None without Secure.
- Storing JWT in non-HttpOnly cookie without hardening.

---

### 21.6.4 CORS Configuration

#### Beginner

**CORS** controls which browser origins may read GraphQL responses. **`Access-Control-Allow-Origin: *`** with **credentials** is invalid—be explicit.

#### Intermediate

Whitelist **origins**; handle **preflight** `OPTIONS`. **Credentials** require specific origin, not `*`.

#### Expert

**GraphQL** often uses **POST** with `content-type: application/json` → preflight required. **WebSocket** subscriptions need correct **Origin** checks at handshake.

```javascript
import cors from "cors";

app.use(
  "/graphql",
  cors({
    origin: ["https://app.example.com"],
    credentials: true,
    methods: ["POST", "GET", "OPTIONS"],
    allowedHeaders: ["content-type", "authorization", "apollographql-client-name"],
  }),
);
```

#### Key Points

- CORS is a browser enforcement, not server auth.
- Misconfigured CORS enables cross-site data theft with user cookies.
- Preflight caching via `Access-Control-Max-Age` reduces overhead.

#### Best Practices

- Environment-specific allowlists.
- Avoid reflecting arbitrary Origin headers.
- Test from unauthorized origins in QA.

#### Common Mistakes

- Regex origins too permissive.
- Allowing `null` origin inadvertently.
- Forgetting websocket origin validation.

---

### 21.6.5 Referrer Policy

#### Beginner

**Referrer-Policy** reduces leakage of URLs (which may contain **tokens** in query strings) to third parties.

#### Intermediate

Use **`strict-origin-when-cross-origin`** or **`no-referrer`** for sensitive apps. Avoid putting **access tokens** in GET URLs.

#### Expert

**GraphQL GET** persisted queries with tokens in query string are especially dangerous—prefer **POST** + headers or **short-lived** signed URLs with tight scope.

```javascript
app.use((req, res, next) => {
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
```

#### Key Points

- Referrer headers leak path and query data.
- Policy complements avoiding secrets in URLs.
- CDN logs may capture referrers.

#### Best Practices

- Never pass refresh tokens in URLs.
- Align CSP and Referrer-Policy.
- Educate frontend devs on link meta tags.

#### Common Mistakes

- OAuth implicit flow patterns with tokens in fragment (still risky).
- Logging full URLs with `access_token=`.
- `Referrer-Policy: unsafe-url` globally.

---

## 21.7 Advanced Security

### 21.7.1 Batching Attacks Prevention

#### Beginner

Clients can send **arrays of GraphQL operations** in one HTTP request or use **aliases** to multiply fields—amplifying cost.

#### Intermediate

Limit **batch size** at JSON parse layer; reject documents with **excessive aliases**; **per-operation** cost caps inside batch.

#### Expert

**Apollo Server** batching support—disable or authenticate strictly. **Federation** query plans may batch entities—ensure **per-node** authz in `__resolveReference`.

```javascript
app.use("/graphql", (req, res, next) => {
  if (Array.isArray(req.body)) {
    if (req.body.length > 5) {
      return res.status(400).json({ errors: [{ message: "Batch too large" }] });
    }
  }
  next();
});
```

#### Key Points

- Batching is a legitimate feature and an attack vector.
- Limits should be configurable per API product.
- Pair with complexity and rate limits.

#### Best Practices

- Document max batch size for API consumers.
- Monitor batch usage patterns.
- Require API keys for batch-heavy clients.

#### Common Mistakes

- Only rate limiting by HTTP request ignoring batch size.
- Allowing unauthenticated batching on public internet.
- No server-side guard in JSON middleware order.

---

### 21.7.2 Alias Attacks Prevention

#### Beginner

**Aliases** let the same field repeat many times with different names, bypassing naive “field occurrence” limits.

#### Intermediate

Count **selections** after **fragment spread** expansion or use **complexity** estimators that sum repeated fields with multipliers.

#### Expert

**Normalize** queries for analysis; **persisted queries** remove arbitrary alias patterns; **WAF** rules rarely understand GraphQL—prefer **server validation**.

```graphql
query ManyAliases {
  u1: user(id: "1") { id }
  u2: user(id: "2") { id }
  u3: user(id: "3") { id }
}
```

```javascript
import { visit } from "graphql";

export function countFieldInstances(doc, fieldName) {
  let n = 0;
  visit(doc, {
    Field(node) {
      if (node.name.value === fieldName) n += 1;
    },
  });
  return n;
}
```

#### Key Points

- Aliases multiply work with identical resolvers.
- Static analysis must include fragments and inline spreads.
- Persisted operations reduce alias freedom.

#### Best Practices

- Complexity estimators that charge per field instance.
- Integration tests with alias-heavy documents.
- Alerts on anomalous alias counts.

#### Common Mistakes

- Depth limits only.
- Forgetting inline fragments when counting.
- Allowing unlimited `user` alias fan-out.

---

### 21.7.3 Fragment Attacks Prevention

#### Beginner

**Fragments** can be **cyclic** or **deeply nested** when combined with spreads, increasing work. Malicious clients may craft **overlapping** fragments to stress parsers—spec-conformant parsers should still validate.

#### Intermediate

Enforce **query complexity** and **token limits**; validate **fragment spreads** exist and types match—GraphQL validation already covers many cases.

#### Expert

**Fragment bombs** (many spreads) can stress validation or execution—use **max tokens** and **timeout** on parse/validate. **Persisted** queries precompile trusted documents.

```graphql
fragment F on Query {
  me {
    id
  }
}

query {
  ...F
  ...F
  ...F
}
```

#### Key Points

- Validation rules catch unknown fragments; bombs target performance.
- Token/time limits complement semantic rules.
- Trusted persisted queries avoid arbitrary fragments.

#### Best Practices

- Set parse/validate timeouts.
- Monitor CPU for validation step.
- Use query whitelisting for high-risk public APIs.

#### Common Mistakes

- Infinite recursion in custom fragment utilities.
- Custom directives altering spreads without security review.
- Allowing arbitrary persisted query registration publicly.

---

### 21.7.4 Directive Abuse Prevention

#### Beginner

**Directives** like `@include`/`@skip` change execution shape—attackers can craft large conditional trees; **custom directives** may bypass auth if poorly implemented.

#### Intermediate

Disallow **unknown directives** in public APIs unless explicitly supported. Review **schema directive** implementations that short-circuit auth.

#### Expert

**Custom execution** hooks that read directive metadata must **not** skip permission checks. **Federation** `@external`/`@requires` changes data planning—validate **authorization** on required fields.

```graphql
directive @auth(role: String!) on FIELD_DEFINITION
```

```javascript
import { mapSchema, getDirective, MapperKind, defaultFieldResolver } from "@graphql-tools/utils";

function authDirectiveTransformer(schema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const dir = getDirective(schema, fieldConfig.astNode, "auth")?.[0];
      if (!dir) return fieldConfig;
      const { resolve = defaultFieldResolver } = fieldConfig;
      return {
        ...fieldConfig,
        resolve: async (source, args, ctx, info) => {
          if (!ctx.user?.roles?.includes(dir.role)) {
            throw new Error("Forbidden");
          }
          return resolve(source, args, ctx, info);
        },
      };
    },
  });
}
```

#### Key Points

- Directives are powerful; unsafe transforms risk auth bypass.
- Unknown directives should error in strict modes.
- Server-side enforcement remains mandatory.

#### Best Practices

- Code review directive transformers carefully.
- Test negative cases (wrong role).
- Keep directive surface minimal on public schemas.

#### Common Mistakes

- Client-trusted `@auth` without server enforcement.
- Directive logic skipping validation.
- Introspection leaking internal directive meanings.

---

### 21.7.5 Resource Exhaustion Prevention

#### Beginner

Prevent **CPU**, **memory**, **connection**, and **DB** exhaustion with **timeouts**, **limits**, **queues**, and **circuit breakers**.

#### Intermediate

**Node** `--max-old-space-size` is not a security boundary—use **container limits** and **query timeouts**. Wrap execution with **deadlines** and propagate **`AbortSignal`** to fetch/DB where supported.

#### Expert

**Global** concurrency limits per tenant, **bulkhead** isolation for expensive subgraphs, **automatic** degradation (disable noncritical fields) during incidents with feature flags.

```javascript
import { GraphQLError } from "graphql";

function timeoutPlugin(ms) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  return {
    async requestDidStart() {
      return {
        async willSendResponse() {
          clearTimeout(t);
        },
        async didEncounterErrors() {
          clearTimeout(t);
        },
      };
    },
    context: async () => ({ signal: controller.signal }),
  };
}
```

```javascript
import http from "node:http";

const server = http.createServer(app);
server.maxConnections = 1000;
```

#### Key Points

- GraphQL’s flexibility makes resource limits essential.
- Timeouts must propagate to downstream fetches (`signal`).
- Layered defenses at edge, app, and DB.

#### Best Practices

- Load test to find breaking points.
- Runbooks for disabling introspection/expensive fields.
- Monitor event loop lag.

#### Common Mistakes

- Long-running resolvers without cancellation.
- Unbounded `Promise.all` to microservices.
- No connection limits on public endpoints.

---


