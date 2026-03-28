# Authorization

## 📑 Table of Contents

- [23.1 Authorization Basics](#231-authorization-basics)
  - [23.1.1 Authorization Concepts](#2311-authorization-concepts)
  - [23.1.2 Access Control](#2312-access-control)
  - [23.1.3 Permissions](#2313-permissions)
  - [23.1.4 Roles](#2314-roles)
  - [23.1.5 Claims](#2315-claims)
- [23.2 RBAC](#232-rbac)
  - [23.2.1 Role Definition](#2321-role-definition)
  - [23.2.2 Role Assignment](#2322-role-assignment)
  - [23.2.3 Role Inheritance](#2323-role-inheritance)
  - [23.2.4 Role Validation](#2324-role-validation)
  - [23.2.5 Role Management](#2325-role-management)
- [23.3 ABAC](#233-abac)
  - [23.3.1 Attribute Definition](#2331-attribute-definition)
  - [23.3.2 Policy Rules](#2332-policy-rules)
  - [23.3.3 Policy Evaluation](#2333-policy-evaluation)
  - [23.3.4 Context Attributes](#2334-context-attributes)
  - [23.3.5 Dynamic Policies](#2335-dynamic-policies)
- [23.4 Field-Level Authorization](#234-field-level-authorization)
  - [23.4.1 Field Permission Checks](#2341-field-permission-checks)
  - [23.4.2 Sensitive Field Masking](#2342-sensitive-field-masking)
  - [23.4.3 Field-Level Directives](#2343-field-level-directives)
  - [23.4.4 Computed Permissions](#2344-computed-permissions)
  - [23.4.5 Dynamic Field Access](#2345-dynamic-field-access)
- [23.5 Authorization Patterns](#235-authorization-patterns)
  - [23.5.1 Directive-Based Authorization](#2351-directive-based-authorization)
  - [23.5.2 Resolver-Based Authorization](#2352-resolver-based-authorization)
  - [23.5.3 Middleware-Based Authorization](#2353-middleware-based-authorization)
  - [23.5.4 Context-Based Authorization](#2354-context-based-authorization)
  - [23.5.5 Policy-Based Authorization](#2355-policy-based-authorization)
- [23.6 Advanced Authorization](#236-advanced-authorization)
  - [23.6.1 Object-Level Authorization](#2361-object-level-authorization)
  - [23.6.2 Scoped Permissions](#2362-scoped-permissions)
  - [23.6.3 Time-Based Permissions](#2363-time-based-permissions)
  - [23.6.4 Resource Ownership](#2364-resource-ownership)
  - [23.6.5 Delegation](#2365-delegation)

---

## 23.1 Authorization Basics

### 23.1.1 Authorization Concepts

#### Beginner

**Authorization** answers “what may you do?” After **authentication** identifies the user, authorization decides if they may run a **field**, **mutation**, or see **data**. In GraphQL, every resolver is a potential authorization checkpoint.

#### Intermediate

Policies can be **deny-by-default** or **allow-by-default**; security-critical APIs should default deny. **Coarse** checks gate whole operations; **fine** checks gate individual fields or rows. Errors often map to GraphQL **`FORBIDDEN`** (or `UNAUTHENTICATED` when identity is missing).

#### Expert

**Attribute-based** and **relationship-based** rules exceed simple role checks. **Federation** requires consistent identity propagation and **subgraph** trust. **Audit** authorization decisions for regulated workloads without logging sensitive arguments.

```javascript
import { GraphQLError } from "graphql";

function ensureCanEditPost(user, post) {
  if (!user) throw new GraphQLError("Auth required", { extensions: { code: "UNAUTHENTICATED" } });
  if (post.authorId !== user.id && !user.roles.includes("ADMIN")) {
    throw new GraphQLError("Not allowed", { extensions: { code: "FORBIDDEN" } });
  }
}
```

```graphql
type Mutation {
  updatePost(id: ID!, input: PostInput!): Post!
}
```

#### Key Points

- Authentication ≠ authorization; both are required for protected resources.
- Default deny reduces accidental exposure as schemas grow.
- GraphQL’s graph shape demands checks at multiple depths.

#### Best Practices

- Centralize error codes for clients to branch UX.
- Document which operations are public vs authenticated vs admin-only.
- Review authorization on every new field in PR checklist.

#### Common Mistakes

- Checking auth only on the root query and assuming children inherit safety.
- Returning `null` instead of forbidden for sensitive existence leaks.
- Inconsistent codes between HTTP and GraphQL layers.

---

### 23.1.2 Access Control

#### Beginner

**Access control** lists who can **read** or **write** which resources. In GraphQL, map HTTP identity to **allowed actions** before returning data from resolvers.

#### Intermediate

Models include **ACL** (per-resource lists), **RBAC** (roles), **ABAC** (attributes). **Layered** control: gateway, resolver, database **row-level security** (RLS) as defense in depth.

#### Expert

**Zero trust**: verify authorization on every call even inside VPC. **GraphQL batching** must not bypass per-item checks in list resolvers. **Side-channel** leaks: timing and error shapes can reveal existence—align responses.

```javascript
const canAccessProject = (user, project) =>
  user && (project.ownerId === user.id || project.members.some((m) => m.userId === user.id));
```

```graphql
type Project {
  id: ID!
  name: String!
  members: [Member!]!
}
```

#### Key Points

- Multiple layers (API + DB) beat resolver-only checks for persistent data.
- List fields need per-element or query-level filtering, not just parent checks.
- Access control must survive schema refactors.

#### Best Practices

- Push row filters into SQL/ORM where possible for performance and correctness.
- Test negative cases (wrong user) explicitly.
- Use types to encode permission results (`AuthzResult` enums internally).

#### Common Mistakes

- Filtering in JS after fetching all rows (performance + leak risk).
- Trusting `id` from client without verifying ownership server-side.
- Admin “god mode” without audit logging.

---

### 23.1.3 Permissions

#### Beginner

A **permission** is a named capability: `post:read`, `post:write`, `billing:manage`. Users or roles hold sets of permissions; resolvers assert required permissions.

#### Intermediate

**String** permissions are simple; **structured** permissions include **resource** and **action** (`project:123:write`). Store permissions in **JWT claims** or **database**; avoid huge claim payloads.

#### Expert

**Permission catalogs** version over time—support **migration** of old tokens. **Implication** rules (`admin` implies `post:write`) live in policy engine. **GraphQL** `@auth(requires: POST_WRITE)` style directives map to permission constants in code.

```javascript
const PERMS = { POST_WRITE: "post:write", POST_READ: "post:read" };

function hasPerm(user, perm) {
  return user?.permissions?.includes(perm) || user?.roles?.includes("ADMIN");
}
```

```graphql
type Mutation {
  createPost(input: PostInput!): Post!
}
```

#### Key Points

- Fine-grained permissions scale better than role explosion for large orgs.
- Normalize permission strings to avoid typos across resolvers.
- JWT permissions go stale until refresh—consider short TTL or versioning.

#### Best Practices

- Single module exporting permission constants.
- Integration tests per permission boundary.
- Periodic review of unused permissions.

#### Common Mistakes

- Duplicating permission strings across files.
- Granting `*` or `admin` for development and shipping it.
- No mapping doc between product features and permissions.

---

### 23.1.4 Roles

#### Beginner

**Roles** group permissions: `EDITOR`, `VIEWER`, `ADMIN`. Assign roles to users; check `user.role === 'ADMIN'` or `user.roles.includes('EDITOR')` in resolvers.

#### Intermediate

**Hierarchical** roles: `ADMIN` > `EDITOR` > `VIEWER`. **Multi-role** users combine capabilities via union of permissions. **Tenant** roles may differ per organization in SaaS.

#### Expert

**Dynamic roles** from IdP **groups** sync on login. **Separation of duties**: no single role can both approve and pay. **Role explosion** signals need for ABAC or scoped permissions.

```javascript
const ROLE_PERMS = {
  VIEWER: ["post:read"],
  EDITOR: ["post:read", "post:write"],
  ADMIN: ["post:read", "post:write", "user:manage"],
};

function effectivePermissions(roles) {
  return [...new Set(roles.flatMap((r) => ROLE_PERMS[r] || []))];
}
```

```graphql
type User {
  id: ID!
  roles: [String!]!
}
```

#### Key Points

- Roles are a UX-friendly layer over permissions.
- Many systems need both roles and direct permission grants.
- Tenant-scoped roles need composite cache keys.

#### Best Practices

- Resolve effective permissions once per request into `context`.
- Avoid stringly-typed role checks scattered everywhere—wrap helpers.
- Align role names with IAM or IdP group names deliberately.

#### Common Mistakes

- Case-sensitive role bugs (`admin` vs `ADMIN`).
- Checking only one role when users have multiple.
- Hard-deleting role rows while tokens still claim them.

---

### 23.1.5 Claims

#### Beginner

**Claims** are name/value pairs in tokens (JWT) or session: `sub`, `roles`, `tenant_id`. Authorization reads claims from `context` instead of re-querying identity on every field.

#### Intermediate

**Custom claims** must be **validated** at issuance time; GraphQL should not trust client-supplied headers for claims. **Refresh** updates claims; **version** claim invalidates old assumptions.

#### Expert

**Privacy**: minimize claims in browser JWTs. **Delegation** claims (`act`, `on_behalf_of`) for impersonation require strict audit and TTL. **Federation** passes **signed** internal claims between subgraphs.

```javascript
function tenantFromContext(ctx) {
  const tid = ctx.user?.tenantId;
  if (!tid) throw new GraphQLError("Tenant required", { extensions: { code: "FORBIDDEN" } });
  return tid;
}
```

```graphql
type Query {
  invoices: [Invoice!]!
}
```

#### Key Points

- Claims are hints; authoritative data may still live in DB for critical checks.
- Stale claims are a class of authorization bugs.
- Tenant isolation often starts from a claim or session value.

#### Best Practices

- Type claims in TypeScript interfaces shared with auth middleware.
- Log claim version mismatches when rejecting requests.
- Document claim contract with identity team.

#### Common Mistakes

- Trusting `email` claim without `email_verified`.
- Letting users pick `tenantId` in GraphQL variables without server binding.
- Oversized JWTs from embedding entire permission lists.

---

## 23.2 RBAC

### 23.2.1 Role Definition

#### Beginner

Define roles as **constants** and document what each can do. Keep the list **small** at first: `USER`, `ADMIN`, later split as needed.

#### Intermediate

Store definitions in **database** for admin UI editing with **migration** safeguards. **Immutable** system roles vs **custom** tenant roles. Export role metadata for **frontend** menu gating (never as sole security).

#### Expert

**Role templates** for enterprise onboarding. **Compatibility matrix** when renaming roles—support aliases during transition. **JSON schema** validate role config at deploy.

```javascript
export const SYSTEM_ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
  BILLING: "BILLING",
};
```

```graphql
enum Role {
  USER
  ADMIN
  BILLING
}
```

#### Key Points

- Clear role definitions prevent ambiguous checks in resolvers.
- Enums in SDL can mirror internal roles when stable.
- Product and security should co-own the role catalog.

#### Best Practices

- Version role definition changes in changelog.
- Generate TypeScript from a single source of truth if possible.
- Integration tests for each role’s CRUD matrix.

#### Common Mistakes

- Ad-hoc string roles created in production data without code support.
- Duplicating enum in schema and DB without sync strategy.
- Roles that imply overlapping permissions inconsistently.

---

### 23.2.2 Role Assignment

#### Beginner

Assign roles when creating users or via **admin** mutation. Persist `user_roles` join table or array column. GraphQL `updateUserRoles` should be **admin-only**.

#### Intermediate

**Self-service** role requests through approval workflow. **IdP group** sync assigns roles on login. **Breaking glass** temporary elevation with expiry.

#### Expert

**Just-in-time** access integrates with PAM; GraphQL receives **short-lived** elevated claims. **Dual control** for role assignment mutations. **Event sourcing** role changes for audit.

```javascript
async function assignRole(adminUser, targetUserId, role, ctx) {
  if (!adminUser.roles.includes("ADMIN")) throw forbidden();
  await db.user.update({
    where: { id: targetUserId },
    data: { roles: { set: await mergeRoles(targetUserId, role) } },
  });
  await auditLog.write({ adminUserId: adminUser.id, targetUserId, role, action: "ASSIGN" });
}
```

```graphql
type Mutation {
  assignRole(userId: ID!, role: Role!): User!
}
```

#### Key Points

- Assignment is a privileged operation—protect and audit it.
- Sync from IdP needs deterministic mapping rules.
- Bulk assignment scripts need safety rails.

#### Best Practices

- Require MFA for admin role changes when possible.
- Notify users when their roles change.
- Idempotent sync from external directory.

#### Common Mistakes

- Users assigning themselves admin via crafted mutation.
- Missing audit trail for compliance.
- Race conditions on concurrent role updates.

---

### 23.2.3 Role Inheritance

#### Beginner

**Inheritance** means `ADMIN` automatically includes all `EDITOR` permissions. Implement by **expanding** roles to permissions at login or per request.

#### Intermediate

**DAG** of roles for complex orgs—detect **cycles** in config. **Override** denies (`cannot: delete_org`) as exceptions to inherited allows.

#### Expert

**Lattice-based** models combine inheritance with constraints. **Tooling** to visualize inherited permissions for support engineers. **Cache** expanded permissions with invalidation on role graph change.

```javascript
function expandRoles(roles, graph) {
  const out = new Set(roles);
  let added = true;
  while (added) {
    added = false;
    for (const r of [...out]) {
      for (const child of graph[r] || []) {
        if (!out.has(child)) {
          out.add(child);
          added = true;
        }
      }
    }
  }
  return [...out];
}
```

```graphql
type RoleNode {
  name: String!
  inherits: [String!]!
}
```

#### Key Points

- Inheritance reduces duplication but can surprise operators.
- Explicit deny rules need clear precedence over inheritance.
- Graph cycles must be rejected at config load time.

#### Best Practices

- Unit tests for inheritance expansion with deep chains.
- Admin UI shows effective permissions preview.
- Document precedence: deny > explicit allow > inherited allow.

#### Common Mistakes

- Infinite loops in poorly validated inheritance graphs.
- Assuming inheritance applies to object ownership automatically.
- Debugging “has role X but still denied” without effective perm view.

---

### 23.2.4 Role Validation

#### Beginner

Before trusting `context.user.roles`, ensure roles came from **your** auth layer, not raw client input. Validate role strings against an **allowlist**.

#### Intermediate

On **token refresh**, re-load roles from DB if critical (payment). **Schema validation** for admin APIs accepting role arrays—max length, unique values.

#### Expert

**Cross-service** validation: subgraph trusts gateway-signed headers containing **role snapshot** and **issued-at**. **Replay** protection with nonce or short TTL on internal assertions.

```javascript
const ALLOWED = new Set(["USER", "EDITOR", "ADMIN", "BILLING"]);

function sanitizeRoles(roles) {
  return [...new Set(roles.filter((r) => ALLOWED.has(r)))];
}
```

```graphql
input UpdateRolesInput {
  roles: [Role!]!
}
```

#### Key Points

- Never accept role list from unauthenticated GraphQL variables alone.
- Allowlists prevent typos becoming silent no-op security.
- Re-validation cadence balances freshness vs DB load.

#### Best Practices

- Fail startup if DB contains unknown roles when strict mode on.
- Metrics for role validation failures.
- Align JWT role claim format with parser expectations (string vs array).

#### Common Mistakes

- Trusting deprecated roles still embedded in old mobile app tokens.
- Case normalization bugs.
- Omitting validation on webhook-triggered internal mutations.

---

### 23.2.5 Role Management

#### Beginner

Provide **CRUD** for roles in admin tools: list users, filter by role, change role. Back with secure mutations and **pagination**.

#### Intermediate

**Role versioning** and **deprecation** banners in admin UI. **Import/export** CSV for enterprise customers with validation. **Soft-delete** roles to preserve historical audit.

#### Expert

**Approval workflows** with **ticket IDs** stored on assignment. **SCIM** provisioning from HR systems syncs roles automatically. **Anomaly detection** on mass role elevation.

```javascript
const resolvers = {
  Query: {
    usersByRole: async (_, { role }, ctx) => {
      requireRole(ctx, "ADMIN");
      return ctx.db.user.findMany({ where: { roles: { has: role } } });
    },
  },
};
```

```graphql
type Query {
  usersByRole(role: Role!, first: Int, after: String): UserConnection!
}
```

#### Key Points

- Management surfaces are high-value attack targets.
- Enterprise expects automation (SCIM) plus manual override.
- Historical data matters for audits and investigations.

#### Best Practices

- Pagination on all list queries.
- Rate-limit admin mutations more aggressively than user mutations.
- Separate admin GraphQL schema or router in large systems.

#### Common Mistakes

- Exposing role management on same endpoint without IP allowlist or MFA.
- No export for compliance audits.
- Deleting roles that historical logs still reference without mapping.

---

## 23.3 ABAC

### 23.3.1 Attribute Definition

#### Beginner

**Attributes** describe user, resource, environment: `user.department`, `resource.classification`, `env.ipCountry`. ABAC rules compare attributes to decide allow/deny.

#### Intermediate

Standardize **attribute names** and **types** across services. **User attributes** from IdP; **resource attributes** from database columns; **environment** from request metadata in `context`.

#### Expert

**Ontology** alignment with enterprise data catalogs. **Sensitivity labels** propagate through **ETL** into GraphQL-backed objects. **Attribute freshness** SLAs when used for real-time authz.

```javascript
const userAttrs = (user, ctx) => ({
  id: user.id,
  department: user.department,
  clearance: user.clearanceLevel,
  ipCountry: ctx.requestCountry,
});
```

```graphql
type Document {
  id: ID!
  classification: String!
  ownerId: ID!
}
```

#### Key Points

- Consistent attribute vocabulary prevents conflicting policy interpretations.
- Environment attributes can change per request—document them.
- Sensitive attributes should not leak to clients via introspection tricks.

#### Best Practices

- Central `attributes.js` module building the authz view model.
- Validate attribute ranges (clearance 1–5) at write time.
- Document attribute sources for auditors.

#### Common Mistakes

- Null handling bugs when attribute missing → accidental allow.
- Deriving clearance from client-supplied GraphQL fields.
- Divergent attribute names between monolith and new microservice.

---

### 23.3.2 Policy Rules

#### Beginner

A **policy rule** is an expression: “allow read if `resource.ownerId === user.id` OR `user.role === ADMIN`.” Encode as functions or rule objects evaluated at runtime.

#### Intermediate

**JSON policies** (e.g., IAM-style) parsed and interpreted. **Priority** ordering: explicit deny wins. **Unit tests** per rule with fixtures.

#### Expert

**OPA/Rego** or **Cedar** for declarative policies with formal semantics. **Policy as code** in Git with PR review. **Simulation** mode for admins to test policy against hypothetical attributes.

```javascript
const policies = [
  {
    id: "doc-read-owner",
    effect: "allow",
    action: "document:read",
    when: ({ user, doc }) => doc.ownerId === user.id,
  },
  {
    id: "doc-read-admin",
    effect: "allow",
    action: "document:read",
    when: ({ user }) => user.clearance >= 5,
  },
];
```

```graphql
type Query {
  document(id: ID!): Document
}
```

#### Key Points

- Rules should be small, composable, and testable.
- Deny overrides must be explicit in precedence docs.
- External policy engines reduce bespoke interpreter bugs.

#### Best Practices

- Name rules for observability (`policy_denied{rule="doc-read-owner"}`).
- Keep rules close to domain experts’ language.
- Snapshot test policy bundles on upgrade.

#### Common Mistakes

- Copy-paste rules with stale field names after schema migration.
- Implicit default allow when no rule matches.
- Evaluating rules in N+1 pattern per list item without batching attributes.

---

### 23.3.3 Policy Evaluation

#### Beginner

**Evaluate** by passing `{ user, resource, action }` into your rule engine or `can(user, 'read', post)` helper. Call from resolver before returning data.

#### Intermediate

**Short-circuit** on first matching allow if denies handled separately. **Memoize** per-request evaluation results for hot paths. **Batch** fetches for list resolvers: load attributes for all parents once.

#### Expert

**Distributed** evaluation with sidecar OPA; **latency** budgets on critical path. **Partial evaluation** to push filters into SQL (`WHERE policy allows`). **Caching** policy decisions with **TTL** and **invalidation** on attribute change events.

```javascript
function evaluatePolicies(policies, ctx) {
  let deny = false;
  let allow = false;
  for (const p of policies) {
    if (!p.when(ctx)) continue;
    if (p.effect === "deny") deny = true;
    if (p.effect === "allow") allow = true;
  }
  if (deny) return false;
  return allow;
}
```

```graphql
type Mutation {
  shareDocument(id: ID!, withUserId: ID!): Document!
}
```

#### Key Points

- Evaluation order must be documented (deny vs allow precedence).
- Performance matters—policy engine on every field can hurt.
- Batching prevents N policy evaluations for N list elements.

#### Best Practices

- Trace spans around policy evaluation in APM.
- Fallback deny on engine timeout if business accepts availability tradeoff.
- Property tests for policy matrices where feasible.

#### Common Mistakes

- Evaluating policies after expensive resolver work.
- Non-deterministic rules (time without request-scoped clock).
- Swallowing evaluation errors as allow.

---

### 23.3.4 Context Attributes

#### Beginner

**Context** carries request attributes: IP, user-agent, API key id, request time. Build `context.authz = { ... }` in Apollo `context` function from `req`.

#### Intermediate

**GeoIP**, **device fingerprint** hashes, **mTLS** client cert serial—all feed ABAC. **Feature flags** as attributes enable gradual rollout of stricter rules.

#### Expert

**Risk score** from fraud service as transient attribute with TTL. **Step-up** satisfied flag after MFA challenge. **Correlation id** links authz logs across subgraphs.

```javascript
const context = async ({ req }) => ({
  user: await loadUser(req),
  requestIp: req.ip,
  userAgent: req.headers["user-agent"],
  requestId: req.headers["x-request-id"],
});
```

```graphql
type Query {
  sensitiveReport: Report
}
```

#### Key Points

- Context attributes must be server-derived, not client-forged.
- Too many attributes complicate debugging—log selectively.
- Align attribute extraction between HTTP and WebSocket transports.

#### Best Practices

- TypeScript interface for `GraphQLContext`.
- Redact PII in attribute logs.
- Unit tests with mocked `req` objects.

#### Common Mistakes

- Trusting `X-Forwarded-For` without trusted proxy configuration.
- Missing attributes for subgraph when using federation headers inconsistently.
- Time-based rules using local timezone accidentally.

---

### 23.3.5 Dynamic Policies

#### Beginner

**Dynamic** policies change without code deploy: store rules in **database**, reload periodically or on webhook. Admin toggles **maintenance mode** that denies non-admin mutations.

#### Intermediate

**Version** policies; **blue/green** evaluation for canary tenants. **Cache** compiled policies in memory with **ETag** invalidation.

#### Expert

**Real-time** updates via Redis pub/sub to all Node workers. **Signed** policy bundles from central security service. **Formal verification** or **lint** for policy DSL before activation.

```javascript
let policyCache = { etag: "", rules: [] };

async function loadPolicies() {
  const remote = await fetchPolicyBundle();
  if (remote.etag !== policyCache.etag) policyCache = remote;
  return policyCache.rules;
}
```

```graphql
type Mutation {
  updatePolicyDraft(input: PolicyInput!): PolicyDraft!
}
```

#### Key Points

- Dynamic policies enable incident response (global deny).
- Caching introduces staleness—define acceptable delay.
- Governance: who can edit live policies?

#### Best Practices

- Audit log every policy change with diff.
- Dry-run mode applying new policies to sampled traffic (shadow).
- Rollback to last known good bundle automatically on error spike.

#### Common Mistakes

- Editing production policy without version control backup.
- Workers with divergent policy versions due to failed pub/sub.
- SQL injection–style issues if policies embed unsanitized strings into eval.

---

## 23.4 Field-Level Authorization

### 23.4.1 Field Permission Checks

#### Beginner

Wrap **field resolvers** to check permission before returning `User.email` or `Post.internalNotes`. If denied, return **`null`** or **`FORBIDDEN`** based on your info-leak policy.

#### Intermediate

Use **graphql-shield** or custom **directive** that wraps resolvers. **Default** rule: authenticated for all unless marked `public`.

#### Expert

**Query complexity** aware auth: expensive fields require higher clearance. **Federation** `@requires` fields may need authz on **contributing** subgraphs consistently.

```javascript
const resolvers = {
  User: {
    ssn: (parent, _, ctx) => {
      if (!ctx.user?.permissions?.includes("PII_VIEW")) return null;
      return parent.ssn;
    },
  },
};
```

```graphql
type User {
  id: ID!
  ssn: String
}
```

#### Key Points

- Parent object visibility does not imply child field visibility.
- Returning null vs error has different enumeration implications.
- Field-level checks compose with object-level checks.

#### Best Practices

- Schema annotate sensitive fields in code comments or metadata.
- Automated test that forbidden fields never appear in responses.
- Consistent pattern (shield rules vs manual resolvers).

#### Common Mistakes

- Forgetting list items: `[User]` where each user’s fields differ by viewer.
- Leaking through `extensions` or `debug` fields.
- Introspection exposing field names for hidden data—still OK but document.

---

### 23.4.2 Sensitive Field Masking

#### Beginner

**Mask** by returning placeholders: `****1234` for card last4, or redacted strings. Alternative: omit field entirely.

#### Intermediate

**Role-based masking**: managers see full phone, others see masked. **Audit** who viewed full PII via separate **access log** mutation or resolver side effect (careful with performance).

#### Expert

**Tokenization** stores real value in vault; GraphQL returns non-sensitive surrogate. **Format-preserving** masks for UX testing environments.

```javascript
function maskEmail(email) {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  return `${user[0]}***@${domain}`;
}
```

```graphql
type Employee {
  id: ID!
  email: String
}
```

#### Key Points

- Masking reduces accidental data exposure in logs and UIs.
- Masking is not encryption—combine with access control.
- Different jurisdictions may define PII differently.

#### Best Practices

- Central masking utilities per field type.
- Snapshot tests for mask formats.
- Document which fields are masked vs omitted.

#### Common Mistakes

- Partial masks that still identify individuals uniquely.
- Applying mask after logging raw value.
- Inconsistent mask between REST and GraphQL.

---

### 23.4.3 Field-Level Directives

#### Beginner

Custom directive `@auth(requires: ADMIN)` on fields; **schema transformer** or **directive executor** attaches resolver wrapper.

#### Intermediate

Apollo **@deprecated** is built-in; for auth use **graphql-authz** or implement `mapSchema` with `getDirectiveValues`. Ensure **subgraph** directives propagate in federation if supported.

#### Expert

**Compose** multiple directives `@auth @audit`. **Static analysis** CI ensures every sensitive type field has `@auth`. **Cost** of directive wrapping negligible if implemented via `defaultFieldResolver` chaining.

```javascript
import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import { defaultFieldResolver } from "graphql";

function authDirectiveTransformer(schema, directiveName) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const auth = getDirective(schema, fieldConfig, directiveName)?.[0];
      if (!auth) return fieldConfig;
      const { resolve = defaultFieldResolver } = fieldConfig;
      fieldConfig.resolve = async (source, args, context, info) => {
        requireRole(context, auth.requires);
        return resolve(source, args, context, info);
      };
      return fieldConfig;
    },
  });
}
```

```graphql
directive @auth(requires: Role!) on FIELD_DEFINITION

type User {
  id: ID!
  taxId: String @auth(requires: ADMIN)
}
```

#### Key Points

- Directives make auth requirements visible in SDL.
- Transformer runs once at startup—not per request parse.
- Federation: verify router/subgraph directive behavior for your version.

#### Best Practices

- Keep directive args simple enums, not raw strings from DB.
- Test that unauthorized requests skip resolver side effects.
- Document directive semantics for client teams.

#### Common Mistakes

- Directive applied in SDL but transformer not applied to executable schema.
- Assuming directives enforce auth on introspection queries.
- Different directive names per subgraph causing confusion.

---

### 23.4.4 Computed Permissions

#### Beginner

Compute **canEdit** boolean on type for UI convenience: `Post.canEdit` resolver checks ownership. Still enforce same rules on **mutations**.

#### Intermediate

**GraphQL** `viewerCan` pattern reduces duplicate logic by calling shared `policy.can()`. Cache computed flags per object per request in `WeakMap`.

#### Expert

**Field-level** `permissions: [String!]!` on types for dynamic UIs driven by policy engine. Avoid exposing raw internal policy IDs; map to stable **capability** strings.

```javascript
const resolvers = {
  Post: {
    viewerCanEdit: (post, _, ctx) => post.authorId === ctx.user?.id || ctx.user?.roles?.includes("ADMIN"),
  },
};
```

```graphql
type Post {
  id: ID!
  viewerCanEdit: Boolean!
}
```

#### Key Points

- Computed fields aid UX but must not replace mutation enforcement.
- Keep computation cheap or batch-loaded.
- Names like `viewerCan*` clarify perspective.

#### Best Practices

- Share implementation with mutation guards via pure functions.
- Test computed fields for each role matrix.
- Rate-limit if computation triggers side effects (should not).

#### Common Mistakes

- UI trusts `viewerCanEdit` but API mutation only checks login.
- Expensive policy engine calls per field in large lists.
- Exposing permissions that help attackers map attack surface unnecessarily.

---

### 23.4.5 Dynamic Field Access

#### Beginner

**Dynamic** access: field visible if `user.plan === 'PRO'`. Implement in resolver or directive reading **subscription** state from DB.

#### Intermediate

**Feature flags** gate experimental fields. **A/B** tests: avoid security differences between cohorts without review.

#### Expert

**Consent** attributes (GDPR) gate `marketingPreferences`. **Legal hold** flags hide destructive mutations but allow audit fields for counsel-only roles.

```javascript
function canSeePremiumFields(user) {
  return user?.subscriptionTier === "PRO" || user?.roles?.includes("ADMIN");
}
```

```graphql
type Account {
  id: ID!
  advancedMetrics: JSON
}
```

#### Key Points

- Dynamic access must be consistent across related fields.
- Subscription state changes require cache invalidation on user object.
- Product gating must not accidentally grant security-sensitive APIs.

#### Best Practices

- Central `featuresForUser(user)` helper.
- Webhooks from billing sync subscription tier promptly.
- Log upgrades/downgrades affecting API access.

#### Common Mistakes

- Stale cache serving PRO fields after cancellation.
- Different checks on `advancedMetrics` vs related mutation.
- Using dynamic access to hide security patches—use versioning instead.

---

## 23.5 Authorization Patterns

### 23.5.1 Directive-Based Authorization

#### Beginner

Declare `@auth` on fields/types; one piece of framework wraps resolvers. Good for **declarative** readability.

#### Intermediate

Combine with **graphql-shield** `rule` objects for complex logic. **Type-level** directive applies default to all fields unless overridden.

#### Expert

**Codegen** plugins generate TypeScript types marking fields with required auth metadata for client SDK hints (non-security). **Router-level** directives in Apollo Federation for **policy** hints.

```graphql
directive @auth(requires: Role!) on OBJECT | FIELD_DEFINITION

type Mutation @auth(requires: USER) {
  comment(body: String!): Comment!
}
```

#### Key Points

- Directives document intent in schema.
- Must be wired to executable schema to have effect.
- Works best when rules map cleanly to enums.

#### Best Practices

- Integration test hitting each protected field without role.
- Lint rule: no `FIELD_DEFINITION` without `@auth` on sensitive types.
- Keep directive handler code minimal—delegate to policy module.

#### Common Mistakes

- Schema-first team forgets transformer in one microservice.
- Overloading directive with too many parameters.
- Directives on interface fields without testing implementing types.

---

### 23.5.2 Resolver-Based Authorization

#### Beginner

Inline `if (!ctx.user) throw Forbidden` at top of each resolver. Simple for small APIs.

#### Intermediate

Extract **`assertCanUpdatePost(ctx, post)`** helpers. **Higher-order** function `withAuth(role, resolver)` reduces duplication.

#### Expert

**Resolver shield** wraps automatically via codegen from config map `Mutation.updatePost -> EDITOR`. **Tracing** spans around auth helpers for latency analysis.

```javascript
const updatePost = async (_, { id, input }, ctx) => {
  const post = await ctx.db.post.findUnique({ where: { id } });
  if (!post) throw new GraphQLError("Not found", { extensions: { code: "NOT_FOUND" } });
  ensureCanEditPost(ctx.user, post);
  return ctx.db.post.update({ where: { id }, data: input });
};
```

```graphql
type Mutation {
  updatePost(id: ID!, input: PostInput!): Post!
}
```

#### Key Points

- Most explicit; easy to trace in debugger.
- Duplication risk without helpers.
- Works with any schema style.

#### Best Practices

- Keep auth first line after loading resource ID.
- Pair with integration tests per resolver.
- Use typed context everywhere.

#### Common Mistakes

- Copy-paste checks diverging over time.
- Throwing wrong error code (`NOT_FOUND` vs `FORBIDDEN`) leaking existence.
- Async race loading resource twice with different auth results.

---

### 23.5.3 Middleware-Based Authorization

#### Beginner

Express **middleware** rejects requests before GraphQL: `if (!req.user) return 401`. Coarse gate only—GraphQL still needs fine checks.

#### Intermediate

**Operation name** allowlists for public vs private routes. **Persisted queries** plus middleware checking API key scopes.

#### Expert

**Apollo plugins** `didResolveOperation` inspect `operation` AST and **variable** values for dangerous patterns combined with auth. **WAF** + middleware for IP reputation.

```javascript
app.use("/graphql", (req, res, next) => {
  if (isIntrospectionDisabled(req) && looksLikeIntrospection(req.body?.query)) {
    return res.status(403).json({ errors: [{ message: "Forbidden" }] });
  }
  next();
});
```

```graphql
schema {
  query: Query
}
```

#### Key Points

- Middleware cannot replace field-level auth for graph queries.
- Good for global policies: IP block, API key presence.
- Order matters: auth middleware before GraphQL handler.

#### Best Practices

- Keep middleware fast (cache lookups).
- Log blocked requests with rule id.
- Document interaction with GraphQL batching (array of operations).

#### Common Mistakes

- Only middleware auth → over-permissive nested fields.
- Parsing GraphQL query string in middleware naively—use graphql parser if needed.
- Blocking legitimate persisted query IDs by typo in allowlist.

---

### 23.5.4 Context-Based Authorization

#### Beginner

Put **`user`**, **`roles`**, **`permissions`** on `context`; resolvers read `context` only—no global singletons.

#### Intermediate

Add **`loaders`** that respect tenant/row scope automatically. **Immutable** context per request—no cross-request mutation.

#### Expert

**Context factories** per transport (HTTP vs subscription). **Impersonation** context includes `realUser` and `actingAs` for audit. **Request-scoped** DI containers for policy clients.

```javascript
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const user = await authenticate(req);
    return {
      user,
      db: scopedDbForUser(user),
      policy: createPolicyClient(user),
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

- Context is the backbone of testable authorization (inject mocks).
- Scoped DB handles tenant isolation at data layer.
- Subscription context must receive same auth standards.

#### Best Practices

- Freeze or document context shape versioning.
- Avoid putting entire JWT on context—extract needed fields.
- Integration tests with various context fixtures.

#### Common Mistakes

- Mutating `context` in one resolver affecting siblings unexpectedly.
- Missing context in subscription `onConnect`.
- Using global Prisma client without row filters.

---

### 23.5.5 Policy-Based Authorization

#### Beginner

Central **`Policy`** module: `policy.allow('post.delete', ctx, post)`. Resolvers call policy; no scattered `if` chains.

#### Intermediate

**CASL**-style ability objects: `ability.can('delete', subject('Post', post))`. **Persist** rules from DB for admin-tunable behavior.

#### Expert

**OPA sidecar** decision API `POST /v1/data/graphql/allow` with input document. **Batch** decisions for multiple resources in one network round-trip.

```javascript
import { AbilityBuilder, Ability } from "@casl/ability";

function defineAbilityFor(user) {
  const { can, cannot, build } = new AbilityBuilder(Ability);
  if (user?.roles.includes("ADMIN")) can("manage", "all");
  else {
    can("read", "Post");
    can("update", "Post", { authorId: user.id });
  }
  return build();
}
```

```graphql
type Mutation {
  deletePost(id: ID!): Boolean!
}
```

#### Key Points

- Policy objects enable reusable tests and UI permission hints.
- External engines excel when non-devs own rules.
- Keep GraphQL-specific action naming consistent (`Post:delete`).

#### Best Practices

- Serialize ability per request, not global singleton.
- Log policy denials with rule id.
- Benchmark remote policy calls.

#### Common Mistakes

- Stale ability built once at login never refreshed.
- Mismatch between CASL subject names and actual GraphQL types.
- Remote policy outage handling undefined.

---

## 23.6 Advanced Authorization

### 23.6.1 Object-Level Authorization

#### Beginner

After fetching `post` by `id`, verify **viewer may see this post** before returning. Prevents **IDOR** (insecure direct object reference).

#### Intermediate

**Batch** authorization: `WHERE id IN (...) AND tenant_id = ?` in SQL. **GraphQL** `node` relay global ID decoding must include type + id verification.

#### Expert

**Zanzibar-style** relationship tuples (`user:alice reader document:123`) with consistent caching. **Federation** entity resolution must re-check authz on each subgraph reference.

```javascript
async function getPostForViewer(id, ctx) {
  const post = await ctx.db.post.findFirst({
    where: { id, OR: [{ public: true }, { authorId: ctx.user.id }] },
  });
  if (!post) throw new GraphQLError("Not found", { extensions: { code: "NOT_FOUND" } });
  return post;
}
```

```graphql
type Query {
  post(id: ID!): Post
}
```

#### Key Points

- Object-level checks are the core IDOR defense.
- “Not found” vs “forbidden” is a product/security tradeoff.
- Batching avoids N+1 auth queries.

#### Best Practices

- Use DB constraints and filters, not app-only filters.
- Property tests random IDs across tenants.
- Document unified error strategy for your API.

#### Common Mistakes

- Find by id only, then check auth—race window; prefer combined query.
- Leaking existence via timing differences.
- Skipping check on nested `post` loaded via dataloader without tenant in key.

---

### 23.6.2 Scoped Permissions

#### Beginner

**Scopes** limit tokens: `repo:read`, `repo:write`. OAuth **scope** strings map to GraphQL operations or fields.

#### Intermediate

**Per-tenant** scopes in SaaS (`tenant:abc:admin`). **Downscope** short-lived tokens for specific mutation batch jobs.

#### Expert

**SPIFFE ID** scoped workloads receive only needed GraphQL operations via **automated** scope provisioning tied to service identity.

```javascript
function tokenScopes(ctx) {
  return ctx.oauthScopes || [];
}

function requireScope(ctx, scope) {
  if (!tokenScopes(ctx).includes(scope)) {
    throw new GraphQLError("Insufficient scope", { extensions: { code: "FORBIDDEN" } });
  }
}
```

```graphql
type Mutation {
  importRepos: ImportJob!
}
```

#### Key Points

- Scopes express least privilege for clients.
- Align scope grammar with identity provider capabilities.
- GraphQL flexibility may need coarse scopes (`write:all`) unless using persisted queries.

#### Best Practices

- Table mapping scope → allowed operations.
- Warn when integrating third parties with overly broad scopes.
- Audit scope usage in tokens regularly.

#### Common Mistakes

- Scopes checked only at HTTP edge, not in resolvers.
- Scope string typos silently granting/denying wrong access.
- No scope downgrade on refresh token rotation.

---

### 23.6.3 Time-Based Permissions

#### Beginner

Allow access **only** between `startsAt` and `endsAt` (e.g., scheduled webinar content). Check `Date.now()` against stored window in resolver.

#### Intermediate

**Timezone** aware comparisons using UTC storage. **Maintenance windows** deny mutations globally except break-glass role.

#### Expert

**Temporary elevation** records with auto-expiring **admin** bit; cron or lazy check on each request. **Legal** hold indefinite until flag cleared.

```javascript
function isActiveWindow(resource) {
  const now = Date.now();
  return (!resource.startsAt || now >= new Date(resource.startsAt).getTime()) &&
    (!resource.endsAt || now <= new Date(resource.endsAt).getTime());
}
```

```graphql
type Event {
  id: ID!
  startsAt: String
  endsAt: String
}
```

#### Key Points

- Server clock is source of truth—sync NTP.
- Time-based rules interact poorly with cached responses—set TTL appropriately.
- Elevation without audit is dangerous.

#### Best Practices

- Store instants in UTC ISO strings or epoch ints consistently.
- Test boundary conditions (exactly at `endsAt`).
- Alert before org-wide permission expiry.

#### Common Mistakes

- Using local timezone in server without explicit zone.
- Negative durations due to bad data entry.
- Cached GraphQL responses serving past-window content.

---

### 23.6.4 Resource Ownership

#### Beginner

**Owner** fields like `authorId` or `ownerId` determine who may mutate/delete. Compare to `ctx.user.id`.

#### Intermediate

**Shared ownership** via join table `project_members`. **Transfer ownership** mutation requires both old owner consent or admin.

#### Expert

**Organizational** ownership: resources belong to **org**, not user; check **org role** via membership service. **Inheritance** of ownership on fork/duplicate events.

```javascript
async function transferOwnership(postId, newOwnerId, ctx) {
  const post = await ctx.db.post.findUnique({ where: { id: postId } });
  if (post.authorId !== ctx.user.id) throw forbidden();
  return ctx.db.post.update({ where: { id: postId }, data: { authorId: newOwnerId } });
}
```

```graphql
type Mutation {
  transferPostOwnership(postId: ID!, newOwnerId: ID!): Post!
}
```

#### Key Points

- Ownership is a common special case of ABAC/RBAC.
- Org-owned resources need different checks than user-owned.
- Transfer flows are sensitive—audit and notify.

#### Best Practices

- Database foreign keys enforce valid owners exist.
- Notify old and new owners on transfer.
- Prevent transfer to suspended users.

#### Common Mistakes

- Checking ownership only on `update`, not `delete`.
- Allowing ownership change via `updatePost` generic mutation without extra guard.
- Orphaned resources when owner deleted without policy.

---

### 23.6.5 Delegation

#### Beginner

**Delegation**: user A allows user B to act on their resources (share folder). Store **grant** records with **grantee**, **resource**, **actions**.

#### Intermediate

**OAuth** `urn:ietf:params:oauth:grant-type:jwt-bearer` style delegation for service accounts. **Admin impersonation** with **banner** in UI and **audit**.

#### Expert

**Macaroons** or **chained** capabilities for cryptographic delegation (niche). **Zanzibar** `delegated` edges. **Break-glass** with **dual approval**.

```javascript
async function canActOnBehalfOf(actorId, ownerId, action, ctx) {
  if (actorId === ownerId) return true;
  const grant = await ctx.db.accessGrant.findFirst({
    where: { ownerId, granteeId: actorId, actions: { has: action } },
  });
  return Boolean(grant);
}
```

```graphql
type AccessGrant {
  id: ID!
  grantee: User!
  actions: [String!]!
}
```

#### Key Points

- Delegation multiplies risk—expire grants and limit actions.
- Impersonation must be visible and auditable.
- Revocation paths must be fast.

#### Best Practices

- TTL on grants by default.
- User-revocable delegation dashboard.
- Strong authentication for creating delegation.

#### Common Mistakes

- Grants without scoping to specific resource IDs.
- Infinite delegation chains.
- Missing audit when internal support impersonates customer.

---
