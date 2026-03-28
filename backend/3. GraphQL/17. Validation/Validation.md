# GraphQL Validation

## 📑 Table of Contents

- [17.1 Query Validation](#171-query-validation)
  - [17.1.1 Type Validation](#1711-type-validation)
  - [17.1.2 Field Validation](#1712-field-validation)
  - [17.1.3 Argument Validation](#1713-argument-validation)
  - [17.1.4 Query Depth Validation](#1714-query-depth-validation)
  - [17.1.5 Query Complexity Validation](#1715-query-complexity-validation)
- [17.2 Input Validation](#172-input-validation)
  - [17.2.1 Type Checking](#1721-type-checking)
  - [17.2.2 Field Validation](#1722-field-validation)
  - [17.2.3 Custom Validators](#1723-custom-validators)
  - [17.2.4 Async Validation](#1724-async-validation)
  - [17.2.5 Conditional Validation](#1725-conditional-validation)
- [17.3 Custom Validation Rules](#173-custom-validation-rules)
  - [17.3.1 Creating Custom Rules](#1731-creating-custom-rules)
  - [17.3.2 Schema Validation](#1732-schema-validation)
  - [17.3.3 Query Validation Plugins](#1733-query-validation-plugins)
  - [17.3.4 Depth Limiting](#1734-depth-limiting)
  - [17.3.5 Complexity Analysis](#1735-complexity-analysis)
- [17.4 Security Validation](#174-security-validation)
  - [17.4.1 Input Sanitization](#1741-input-sanitization)
  - [17.4.2 SQL Injection Prevention](#1742-sql-injection-prevention)
  - [17.4.3 XSS Prevention](#1743-xss-prevention)
  - [17.4.4 Authorization Validation](#1744-authorization-validation)
  - [17.4.5 Rate Limit Validation](#1745-rate-limit-validation)
- [17.5 Error Handling in Validation](#175-error-handling-in-validation)
  - [17.5.1 Validation Errors](#1751-validation-errors)
  - [17.5.2 Error Messages](#1752-error-messages)
  - [17.5.3 Error Paths](#1753-error-paths)
  - [17.5.4 Error Details](#1754-error-details)
  - [17.5.5 Error Documentation](#1755-error-documentation)
- [17.6 Advanced Validation](#176-advanced-validation)
  - [17.6.1 Cross-Field Validation](#1761-cross-field-validation)
  - [17.6.2 Business Logic Validation](#1762-business-logic-validation)
  - [17.6.3 Semantic Validation](#1763-semantic-validation)
  - [17.6.4 Validation Hooks](#1764-validation-hooks)
  - [17.6.5 Performance Optimization](#1765-performance-optimization)

---

## 17.1 Query Validation

### 17.1.1 Type Validation

#### Beginner

**Type validation** happens when GraphQL checks that your query matches the schema: you cannot select `User.typoField` if it does not exist, or pass a string where an `Int` is required. This is automatic in the **validation** phase before execution.

#### Intermediate

The spec defines validation rules (for example `FieldsOnCorrectType`, `FragmentSpreadTypeExistence`). Variables are validated against their declared types with coercion rules for scalars. Custom scalars participate via `parseLiteral` and `parseValue`.

#### Expert

You can run `validate(schema, document)` from `graphql` manually for linters or CI. Custom validation rules extend `ValidationRule` and walk the AST. Federation gateways validate against supergraph SDL; subgraphs validate locally—mismatches surface at composition time.

```javascript
import { parse, validate, specifiedRules, buildSchema } from "graphql";

const schema = buildSchema(`
  type Query { n: Int }
`);

const doc = parse(`query { n }`);
const errors = validate(schema, doc, specifiedRules);
console.log(errors); // [] if valid
```

#### Key Points

- Type validation is spec-defined and runs on every operation.
- It catches most client mistakes before resolvers run.
- Custom rules augment but rarely replace core rules.

#### Best Practices

- Run validation in tests for representative operations.
- Pin `graphql` versions across services for consistent validation.
- Surface validation errors clearly in devtools during development.

#### Common Mistakes

- Assuming runtime resolver checks replace static validation.
- Misconfigured custom scalars that accept invalid literals.
- Skipping validation when executing from trusted internal callers without safeguards.

---

### 17.1.2 Field Validation

#### Beginner

**Field validation** ensures fields exist on the declared type, that merging selections is legal, and that directives like `@include`/`@skip` are used correctly. Clients get errors such as `Cannot query field "foo" on type "User"`.

#### Intermediate

**Fragments** must be compatible with their target types; spreads cannot form cycles. `@deprecated` fields still validate as present unless removed from schema. Interfaces require selections that work on all possible concrete types when using abstract spreads.

#### Expert

Schema **transforms** (stitching, filtering) can accidentally remove fields still referenced in persisted queries—validate persisted query sets after schema deploys. **Apollo usage reporting** can flag unknown fields hitting production from old clients.

```graphql
query {
  user {
    id
    # invalidField # validation error
  }
}
```

#### Key Points

- Field validation protects schema integrity at query time.
- Fragments and interfaces add composite rules.
- Schema evolution must consider persisted operations.

#### Best Practices

- Use GraphQL codegen so clients cannot compile invalid selections.
- CI: validate operations against schema artifacts.
- Communicate breaking removals via deprecations first.

#### Common Mistakes

- Deploying schema removals before clients migrate.
- Invalid inline fragments on concrete types.
- Overusing `Any` patterns that bypass static guarantees.

---

### 17.1.3 Argument Validation

#### Beginner

**Argument validation** checks required (`!`) arguments are provided, types match, and variables default correctly. Example error: `Field "user" argument "id" of type "ID!" is required, but it was not provided`.

#### Intermediate

**Coercion** applies: int strings may coerce to `Int` where defined. `List` and `NonNull` nesting is validated strictly. Directive arguments (`@deprecated(reason:)`) follow the same rules.

#### Expert

For **custom directives**, validation plugins can enforce allowed locations and argument shapes. **OneOf** input types (when supported) add exclusivity validation at the spec level in newer implementations.

```graphql
query ($id: ID!) {
  user(id: $id) {
    name
  }
}
```

```javascript
// Missing variable -> validation error before execution
```

#### Key Points

- Required arguments and nullability are validated statically.
- Coercion rules reduce brittle client failures for scalars.
- Variables are validated with the operation.

#### Best Practices

- Prefer input objects for arity > 2–3 arguments.
- Use enums instead of free strings when values are finite.
- Document default behaviors for optional args.

#### Common Mistakes

- Relying on resolver null checks instead of schema `!` for critical args.
- Confusing nullable variables with nullable arguments.
- Breaking changes to argument types without versioning.

---

### 17.1.4 Query Depth Validation

#### Beginner

**Depth limiting** rejects deeply nested queries like `user { friend { friend { friend { ... }}}}` that could stress CPU or databases. You set a max depth (for example 7) and reject deeper ASTs.

#### Intermediate

Implement with a **validation rule** that tracks depth during AST traversal or use packages like `graphql-depth-limit`. Count depth from the root operation or per field depending on policy; document the rule for API consumers.

#### Expert

Depth alone is insufficient: **wide** queries with many fields at the same level can still be expensive. Combine depth with **complexity** limits. Introspection queries may need separate limits or authentication.

```javascript
import depthLimit from "graphql-depth-limit";
import { validate, parse } from "graphql";

const rules = [depthLimit(7)];

function validateQuery(schema, source) {
  return validate(schema, parse(source), rules);
}
```

#### Key Points

- Depth limits mitigate nested fan-out attacks.
- They are simple to explain and enforce.
- Pair with complexity and timeouts for defense in depth.

#### Best Practices

- Tune limits using production query histograms.
- Return clear error messages with configured max depth.
- Allow elevated limits for trusted internal tokens if needed.

#### Common Mistakes

- Setting depth so low legitimate mobile queries fail.
- Ignoring introspection as an attack vector.
- Only limiting depth without addressing breadth.

---

### 17.1.5 Query Complexity Validation

#### Beginner

**Complexity validation** assigns a **cost** to each field (often static weights) and sums over the query; if the total exceeds a threshold, reject the request. This targets expensive operations beyond simple depth.

#### Intermediate

Weights may vary by field (`items` connection higher than `id`). **Dynamic complexity** uses variables (for example `first` argument multiplies cost). Libraries like `graphql-query-complexity` integrate as validation rules.

#### Expert

Tune with **empirical** CPU and DB costs; static weights drift as resolvers change. **Persisted queries** allow whitelisting and dropping arbitrary complexity validation for known operations. Watch bypass via aliases duplicating expensive fields—complexity calculators should account for aliases.

```javascript
import { createComplexityLimitRule } from "graphql-validation-complexity";

const rule = createComplexityLimitRule(1000, {
  scalarCost: 1,
  objectCost: 5,
  listFactor: 10,
});
```

#### Key Points

- Complexity complements depth and pagination limits.
- It must be maintained as the schema evolves.
- Dynamic factors tie cost to actual fan-out parameters.

#### Best Practices

- Start conservative; relax with data.
- Log rejected queries to refine weights.
- Document how clients can structure cheaper queries.

#### Common Mistakes

- Uniform weights hiding cheap hot fields vs expensive cold ones.
- Forgetting variable-driven multipliers on list sizes.
- Complexity so high it never triggers until an incident.

---

## 17.2 Input Validation

### 17.2.1 Type Checking

#### Beginner

**Input type checking** starts with GraphQL: `String!`, `Int`, enums, and `input` objects enforce structure before your resolver runs. This is your first line of defense.

#### Intermediate

Add **runtime** checks in resolvers or middleware for constraints GraphQL does not express: regex for formats, min/max lengths, numeric ranges. Libraries like **Zod** or **Yup** parse `input` objects into validated DTOs.

#### Expert

**Branded types** in TypeScript encode validated inputs (`EmailString`). Consider **input union** patterns via separate mutations or `oneOf` when the schema supports it. Align JSON Schema documentation with GraphQL inputs for public APIs.

```javascript
import { z } from "zod";

const SignUpInput = z.object({
  email: z.string().email(),
  password: z.string().min(12),
});

const resolvers = {
  Mutation: {
    signUp: (_p, { input }) => {
      const dto = SignUpInput.parse(input);
      // ...
      return { user: dto };
    },
  },
};
```

#### Key Points

- GraphQL types are structural, not semantic.
- Runtime validation closes the semantic gap.
- Schema + zod gives defense in depth.

#### Best Practices

- Validate once at the boundary, reuse DTOs inside services.
- Map Zod errors to `UserInputError` with field paths.
- Keep scalar parse/coerce behavior documented.

#### Common Mistakes

- Trusting `String` inputs as safe URLs or emails without checks.
- Duplicating divergent validation on client and server.
- Throwing raw Zod messages in production without curation.

---

### 17.2.2 Field Validation

#### Beginner

**Field validation** checks individual input fields: non-empty strings, positive integers, enum membership. Fail fast with per-field errors so clients can highlight form fields.

#### Intermediate

Use **custom scalars** (`Email`, `DateTime`) to centralize parsing; invalid literals fail during query validation for literals, and `parseValue` for variables. For `input` types, field-level rules often live in one schema-validated object.

#### Expert

Custom scalars should not replace **authorization** checks. Combine scalars with **directive-based** validation (`@constraint` from community packages) where appropriate—audit third-party directive code for security.

```javascript
import { GraphQLScalarType, Kind } from "graphql";

const EmailScalar = new GraphQLScalarType({
  name: "Email",
  serialize: (v) => v,
  parseValue: (v) => {
    if (typeof v !== "string" || !/^[^\s@]+@[^\s@]+$/.test(v)) {
      throw new TypeError("Invalid email");
    }
    return v.toLowerCase();
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) throw new TypeError("Invalid email");
    return EmailScalar.parseValue(ast.value);
  },
});
```

#### Key Points

- Field validation can be scalar-level or object-level.
- Custom scalars unify parsing for variables and literals.
- Clear errors improve client UX.

#### Best Practices

- Normalize values (trim, lowercase emails) at parse time.
- Keep scalar parse errors user-safe.
- Test literals and variables separately.

#### Common Mistakes

- Scalars that accept overly broad formats.
- Inconsistent normalization between mutations and queries.
- Throwing generic errors without field attribution.

---

### 17.2.3 Custom Validators

#### Beginner

**Custom validators** are functions or classes that enforce rules beyond types: “password must contain a digit,” “endDate after startDate.” Call them from resolvers after parsing input.

#### Intermediate

Organize validators per **domain** (`validateBooking`, `validatePayment`). Return `Result` types or throw domain errors mapped to GraphQL. Reuse validators from REST controllers if you share a core service layer.

#### Expert

**Declarative** rule engines (JSON rules) allow non-dev tweaks—evaluate carefully for injection and testing gaps. **i18n**: return error codes; let clients translate messages.

```javascript
function validatePassword(pw) {
  if (!/\d/.test(pw)) {
    const err = new Error("Password must include a digit");
    err.extensions = { code: "BAD_PASSWORD", field: "password" };
    throw err;
  }
}
```

#### Key Points

- Custom validators encode business constraints.
- Centralize to avoid drift between mutations.
- Pair with structured error metadata.

#### Best Practices

- Pure validators are easy to unit test.
- Compose small validators into larger ones.
- Version rules when they change behavior materially.

#### Common Mistakes

- Copy-pasted validation across mutations.
- Validators that hit the database without deduplication (N+1 validation).
- Throwing strings without codes.

---

### 17.2.4 Async Validation

#### Beginner

**Async validation** awaits I/O: uniqueness checks (`email` not taken), credit limits, inventory availability. Perform after synchronous structural validation succeeds.

#### Intermediate

Batch async checks when possible (one query for many emails). Set **timeouts** and handle database errors as `INTERNAL_ERROR` unless safe to expose. Avoid starting transactions before validation completes when validation itself reads widely.

#### Expert

**Race conditions**: two requests can pass uniqueness validation concurrently—enforce with **unique indexes** and handle conflict errors. **Sagas** may validate across services with compensations; surface partial failures clearly.

```javascript
const resolvers = {
  Mutation: {
    register: async (_p, { input }, ctx) => {
      const taken = await ctx.db.users.existsByEmail(input.email);
      if (taken) {
        throw new Error("EMAIL_TAKEN");
      }
      return ctx.db.users.create(input);
    },
  },
};
```

#### Key Points

- Async validation is necessary for external truth.
- Database constraints are the final authority for races.
- Timeouts prevent hung operations.

#### Best Practices

- Keep async validation out of GraphQL scalar `parseValue` (sync API).
- Use idempotency keys for retried mutations after validation.
- Log validation failures at warn, not error, when expected.

#### Common Mistakes

- Only client-side async validation for uniqueness.
- Long serial async checks that could be parallelized.
- Leaking “exists” checks as user enumeration—use generic messages.

---

### 17.2.5 Conditional Validation

#### Beginner

**Conditional validation** applies rules based on other inputs or context: if `type === COMPANY`, require `vatNumber`; if `shipOvernight`, require `phone`. Encode with `if` statements or schema-level discriminated inputs.

#### Intermediate

GraphQL lacks native discriminated unions for inputs widely—patterns include separate mutations or nullable fields validated in code. Document mutually exclusive field groups clearly.

#### Expert

**oneOf input objects** (graphql-js 16.8+ feature in ecosystem) enforce exactly one field set. When not available, **superRefine** in Zod models conditional rules cleanly with path-specific issues.

```javascript
import { z } from "zod";

const Input = z
  .object({
    accountType: z.enum(["PERSON", "COMPANY"]),
    vatNumber: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.accountType === "COMPANY" && !val.vatNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["vatNumber"],
        message: "Required for company accounts",
      });
    }
  });
```

#### Key Points

- Conditional rules mirror real-world forms.
- Express in one validator object when possible.
- Schema design can reduce conditional complexity.

#### Best Practices

- Integration tests for each branch.
- Clear API docs for which fields apply when.
- Avoid exponential rule combinations without tests.

#### Common Mistakes

- Contradictory rules across mutations.
- Missing validation when optional fields combine dangerously.
- Clients guessing conditions from error messages alone.

---

## 17.3 Custom Validation Rules

### 17.3.1 Creating Custom Rules

#### Beginner

A **custom validation rule** in `graphql-js` is a function `(context) => ({ enter?, leave? })` visitor over the AST. Push errors to `context.reportError(new GraphQLError(...))` when a violation is found.

#### Intermediate

Reuse `GraphQLVisitor` patterns: track **fragments**, **variable definitions**, and **field depth** in visitor state. Compose multiple rules in an array passed to `validate`.

#### Expert

Rules run in **validation order** alongside built-ins; avoid O(n²) scans on huge documents. For **multi-operation** documents, scope checks per operation. Test rules with `graphql`’s test utilities pattern.

```javascript
import { GraphQLError, ValidationContext } from "graphql";

function NoIntrospectionRule(context) {
  return {
    Field(node) {
      const fieldName = node.name.value;
      if (fieldName === "__schema" || fieldName === "__type") {
        context.reportError(
          new GraphQLError("Introspection is disabled", { nodes: node })
        );
      }
    },
  };
}
```

#### Key Points

- Custom rules extend static analysis without executing resolvers.
- They are ideal for policy (no introspection, field bans).
- Keep rules fast and deterministic.

#### Best Practices

- Unit test with minimal documents hitting each branch.
- Name rules clearly for debugging.
- Document for API consumers if behavior changes errors.

#### Common Mistakes

- Rules that duplicate execution-time concerns incorrectly.
- Heavy work in validation (external I/O)—keep static.
- Reporting duplicate errors for nested traversals.

---

### 17.3.2 Schema Validation

#### Beginner

**Schema validation** ensures your SDL is internally consistent: types referenced exist, interfaces implemented correctly, default values match field types. `buildSchema` / `makeExecutableSchema` fail on invalid SDL.

#### Intermediate

Use **graphql-inspector** or **rover** for diffing schemas between environments. **Breaking change detection** compares field nullability, argument additions, and removals.

#### Expert

**Federation** composition validates subgraph SDL + link directives. **Custom directives** must be validated for placement and arguments via schema extensions. CI should block deploy if composition fails.

```javascript
import { buildSchema } from "graphql";

try {
  buildSchema(`
    type Query { a: A }
    type A { x: String }
  `);
} catch (e) {
  console.error(e.message);
}
```

#### Key Points

- Valid schema is prerequisite for valid queries.
- CI schema checks prevent production composition failures.
- Breaking change tools protect clients.

#### Best Practices

- Store canonical schema as code or artifact.
- Review `nullable` changes carefully.
- Version schemas alongside server releases.

#### Common Mistakes

- Editing deployed schema without compatibility checks.
- Invalid default values for input fields.
- Circular type dependencies without interfaces/objects resolved.

---

### 17.3.3 Query Validation Plugins

#### Beginner

**Plugins** in servers like Apollo or Envelop wrap the pipeline: parse → validate → execute. They can inject additional `validationRules` arrays per request or add metrics on validation failures.

#### Intermediate

Envelop’s `useValidationRule` composes multiple rules and shares config. **Yoga** plugins similarly extend validation. Order plugins so security rules run before execution always.

#### Expert

Combine plugins with **persisted operations** plugins: skip arbitrary documents entirely. For **multi-tenant** schemas, choose rules dynamically based on `context`—ensure rules are immutable per request for caching safety.

```javascript
// PseudographQL envelop-style composition
const plugins = [
  {
    onValidate({ addValidationRule }) {
      addValidationRule(depthLimit(8));
    },
  },
];
```

#### Key Points

- Plugins standardize validation across services.
- They integrate observability (counts, timings).
- Order and composition matter.

#### Best Practices

- Log validation failure reasons with operation name only.
- Feature-flag new rules in shadow mode first.
- Keep plugin code thin; delegate to shared rule modules.

#### Common Mistakes

- Different validation stacks across subgraphs causing inconsistent security.
- Skipping validation on internal routes accidentally.
- Plugins mutating schema documents incorrectly.

---

### 17.3.4 Depth Limiting

#### Beginner

See **17.1.4** for concept: implement via `graphql-depth-limit` or custom visitors counting nested selections from the root field set.

#### Intermediate

Decide whether **inline fragments** and **fragment spreads** count toward depth—usually yes, using merged selections. Some implementations count only executable fields, not type conditions.

#### Expert

**Relay**-style connections can explode depth with `edges { node { friends { edges { node { ... } } } } }`—tune limits for your client patterns. Combine with **pagination caps** (`first` maximum).

```javascript
// Conceptual custom visitor depth
function getDepthLimitRule(max) {
  return function rule(context) {
    let maxSeen = 0;
    function walk(selectionSet, depth) {
      maxSeen = Math.max(maxSeen, depth);
      // recurse into fields and inline fragments...
    }
    return {
      OperationDefinition(node) {
        walk(node.selectionSet, 0);
        if (maxSeen > max) {
          context.reportError(new GraphQLError(`Max depth ${max} exceeded`));
        }
      },
    };
  };
}
```

#### Key Points

- Depth limiting is standard for public APIs.
- Fragment merging semantics affect true depth.
- Tune with real client operations.

#### Best Practices

- Exempt admin tools cautiously if at all.
- Include depth in API rate limit docs.
- Monitor reject metrics.

#### Common Mistakes

- Miscounting spreads leading to false positives/negatives.
- Same as 17.1.4: depth without breadth control.

---

### 17.3.5 Complexity Analysis

#### Beginner

See **17.1.5**: assign costs and sum. **Analysis** can also be offline: scan persisted queries to estimate worst-case costs before rollout.

#### Intermediate

**Static analysis** tools can highlight expensive fields in SDL docs for internal developers. **Dynamic analysis** uses traces to adjust weights quarterly.

#### Expert

**Alias complexity**: two `expensiveField` aliases double cost—good calculators traverse selection sets with alias awareness. **Introspection** fields may need zero or low cost depending on policy.

```javascript
function fieldCost(name) {
  const weights = { user: 1, search: 50, node: 2 };
  return weights[name] ?? 1;
}
```

#### Key Points

- Analysis informs both static limits and engineering focus.
- Alias-aware costing is essential.
- Revisit after schema changes.

#### Best Practices

- Export a dashboard of top costly operations.
- Pair complexity with resolver-level timeouts.
- Educate client teams on efficient query shapes.

#### Common Mistakes

- Costing ignores variables and assumes minimal sizes.
- Underestimating list fields with large `first`.

---

## 17.4 Security Validation

### 17.4.1 Input Sanitization

#### Beginner

**Sanitization** trims whitespace, normalizes unicode, strips unexpected HTML, or rejects control characters in string inputs. Do it after type validation and before persistence.

#### Intermediate

Distinguish **sanitization** from **validation**: sanitization mutates input to a safe canonical form; validation rejects invalid input. For rich text, use allowlist HTML sanitizers (DOMPurify on server for SSR contexts, or equivalent).

#### Expert

**Unicode tricks** (homoglyphs, bidirectional overrides) affect usernames and phishing. **NFKC** normalization may be needed but can break legitimate passwords—apply only where appropriate. Log sanitization changes at debug level only.

```javascript
function sanitizeUsername(u) {
  return u.normalize("NFKC").trim().slice(0, 32);
}
```

#### Key Points

- Sanitization reduces surprises from messy client input.
- Do not sanitize secrets in ways that change user intent unexpectedly.
- Combine with output encoding for XSS defense in depth.

#### Best Practices

- Centralize sanitizers per field type.
- Test with malicious unicode corpora.
- Document canonical formats.

#### Common Mistakes

- Over-sanitizing passwords (breaking valid characters).
- Only client-side sanitization.
- Storing HTML unsanitized from untrusted users.

---

### 17.4.2 SQL Injection Prevention

#### Beginner

GraphQL does not prevent **SQL injection**—your resolver code does. Always use **parameterized queries** or ORMs with bound parameters; never concatenate raw arguments into SQL strings.

#### Intermediate

Dynamic `ORDER BY` or table names cannot be parameterized—map user input to **allowlists** (`sort` enum → known column names). Raw reporting queries behind admin auth still need discipline.

#### Expert

**Prisma** and **Knex** reduce footguns but raw fragments can reintroduce risk. **SQL in DataLoader** batch functions must parameterize `IN` clauses with arrays properly. Audit any `$executeRaw`.

```javascript
// Good: parameterized
await pool.query("SELECT * FROM users WHERE id = $1", [userId]);

// Bad: string concat with userId — never do this
```

#### Key Points

- Parameterization is mandatory.
- Allowlists for identifiers (columns, sort keys).
- ORMs are not automatic immunity for raw SQL.

#### Best Practices

- Static analysis or lint rules banning template literals in SQL.
- Code review checklist for new resolvers touching SQL.
- Least-privilege DB roles for the API user.

#### Common Mistakes

- Logging interpolated SQL for debugging and copying the pattern.
- Unsafe order/filter maps from client strings.
- Copy-paste from tutorials using string concat.

---

### 17.4.3 XSS Prevention

#### Beginner

GraphQL responses are JSON; XSS risk appears when clients **inject HTML** from string fields into DOM without escaping, or when you serve **GraphiQL** on the same origin as cookies without CSRF protections.

#### Intermediate

Treat string fields as **data**, not HTML. If you must return HTML, sanitize on write or on read consistently. **Content-Security-Policy** headers help browsers mitigate injection.

#### Expert

**Stored XSS** via `bio` fields requires sanitization or strict Content-Type policies in any HTML views. **Reflected XSS** is less common in pure JSON APIs but appears in error pages or developer tools—sanitize `request.url` echoes.

```javascript
// Server returns plain text; client framework escapes on render
return { bio: userInputString };
```

#### Key Points

- XSS is primarily a client rendering concern plus stored content hygiene.
- API still should not amplify attacks with unsafe HTML.
- CSP and escaping are layered defenses.

#### Best Practices

- Prefer markdown + safe renderer pipelines for rich text.
- Security headers on GraphQL HTTP endpoints.
- Disable arbitrary script in admin tools.

#### Common Mistakes

- `dangerouslySetInnerHTML` with user-controlled GraphQL strings.
- Embedding GraphQL responses in HTML without encoding.
- Weak CSP `unsafe-inline`.

---

### 17.4.4 Authorization Validation

#### Beginner

**Authorization validation** answers “may this user perform this action on this data?” Implement after authentication; check in resolvers, services, or centralized rules—not only at HTTP edge for GraphQL.

#### Intermediate

**Resource-based** checks need loaded entities (`post.authorId === ctx.user.id`). **Role-based** checks use `ctx.user.roles`. **Attribute-based** policies evaluate multiple attributes. GraphQL Shield encodes rule trees.

#### Expert

**Field-level** auth without object fetch can leak existence—sometimes return generic `null` vs error per threat model. **Union** error strategies vs **filter** strategies change enumeration risk. Log denied attempts sparingly (privacy).

```javascript
function canEditPost(user, post) {
  return user && (user.id === post.authorId || user.roles.includes("admin"));
}

const resolvers = {
  Mutation: {
    updatePost: async (_p, { id, input }, ctx) => {
      const post = await ctx.db.posts.findById(id);
      if (!canEditPost(ctx.user, post)) throw new Error("FORBIDDEN");
      return ctx.db.posts.update(id, input);
    },
  },
};
```

#### Key Points

- Authn ≠ authz; both belong in GraphQL servers.
- Consistent checks across queries and mutations.
- Policy as code with tests.

#### Best Practices

- Centralize `assertCanView(user, resource)`.
- Use deny-by-default for new fields.
- Audit admin paths regularly.

#### Common Mistakes

- Checking auth only on mutations, not sensitive fields.
- IDOR via predictable IDs without authorization.
- Relying on client-side hiding of fields.

---

### 17.4.5 Rate Limit Validation

#### Beginner

**Rate limiting** caps requests per IP, token, or user to mitigate brute force and DoS. Apply at reverse proxy (nginx, Envoy) or application middleware before expensive validation/execution.

#### Intermediate

GraphQL-specific limits: cost-based throttling after complexity calculation, **per-operation** quotas using persisted query hashes, and **concurrent** request limits per user.

#### Expert

**Leaky bucket** vs **token bucket** algorithms differ for burst traffic. Combine with **global** circuit breakers when backends degrade. For anonymous traffic, use progressive challenges (CAPTCHA) only when needed to reduce friction.

```javascript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 60_000,
  max: 120,
  keyGenerator: (req) => req.user?.id ?? req.ip,
});
```

#### Key Points

- Rate limits protect infrastructure and reduce abuse.
- GraphQL needs more than naive per-HTTP-request limits for heavy documents.
- Authenticated keys enable fairer quotas than IP-only.

#### Best Practices

- Return `429` with `Retry-After` headers where supported.
- Whitelist health checks and internal jobs.
- Monitor limit hit rates.

#### Common Mistakes

- Only IP limits behind NAT punishing innocent users.
- No differentiation between cheap and expensive operations.
- Blocking without observability into false positives.

---

## 17.5 Error Handling in Validation

### 17.5.1 Validation Errors

#### Beginner

GraphQL validation failures return **no execution**; the response contains `errors` with messages like `Cannot query field`. These are distinct from resolver errors during execution.

#### Intermediate

**Multiple validation errors** can be returned in one response. Clients should display them in dev; in production logs, aggregate counts by error type.

#### Expert

Custom validation rules should use **`GraphQLError`** with `locations` and `nodes` for precise highlighting in GraphiQL. Avoid leaking stack traces in validation errors.

```javascript
import { GraphQLError } from "graphql";

context.reportError(
  new GraphQLError("Banned field used", {
    nodes: [node],
  })
);
```

#### Key Points

- Validation errors are pre-execution; safe to expose messages mostly.
- Good AST nodes improve tooling UX.
- Distinguish from `BAD_USER_INPUT` execution errors.

#### Best Practices

- Teach client teams to read validation errors in CI.
- Track top validation failures to improve docs.
- Stable codes for custom validation when clients branch.

#### Common Mistakes

- Treating validation errors as 500s at the HTTP layer.
- Swallowing validation errors in custom wrappers.
- Confusing parser errors with validation errors.

---

### 17.5.2 Error Messages

#### Beginner

Built-in GraphQL validation messages are spec-driven and English. For custom rules, write concise messages explaining what rule failed and how to fix.

#### Intermediate

**i18n**: clients may map `extensions.code` to localized strings; keep `message` English for logs or default. **Security**: do not reveal schema existence details unnecessarily in public APIs (balance with DX).

#### Expert

**Persisted query** mismatches should message clearly: “Unknown operation hash.” **Complexity** errors should include configured max and computed score when safe.

```javascript
throw new GraphQLError(`Query too complex: ${cost} > ${max}`, {
  extensions: { code: "QUERY_COMPLEXITY", cost, max },
});
```

#### Key Points

- Messages are API surface—curate them.
- Codes beat prose for programmatic handling.
- Balance security vs developer experience.

#### Best Practices

- Include remediation hints in dev, generic in prod if needed.
- Avoid variable values in messages when sensitive.
- Snapshot messages in tests where stable.

#### Common Mistakes

- Cryptic internal codes without human message.
- Leaking stack traces via extensions.
- Inconsistent wording for the same failure.

---

### 17.5.3 Error Paths

#### Beginner

Execution errors include **`path`** arrays (`["user", "posts", 2, "title"]`) pointing to the field in the response. Validation errors may include **locations** (line/column) instead.

#### Intermediate

Map Zod issues to GraphQL `extensions` with **`fieldPath`** arrays mirroring input object structure (`["input", "email"]`). Clients use this to attach errors to form fields.

#### Expert

**Apollo Client** merges errors by path for UI. For **batched** operations, ensure paths are scoped per operation in multi-part documents—GraphQL spec structures this in execution contexts.

```javascript
throw new GraphQLError("Invalid email", {
  extensions: { code: "BAD_USER_INPUT", fieldPath: ["input", "email"] },
});
```

#### Key Points

- Paths connect errors to UI elements.
- Input errors need synthetic paths—GraphQL does not auto-map them.
- Align client expectations with server extensions contract.

#### Best Practices

- Document `fieldPath` convention in API guide.
- Use consistent casing with schema field names.
- Test client error display mapping.

#### Common Mistakes

- Omitting paths for multi-field validation failures.
- Different path shapes between mutations.
- Assuming `path` exists on all error types.

---

### 17.5.4 Error Details

#### Beginner

Use **`extensions`** for machine-readable metadata: `code`, `constraint`, `expected`, `actual` (careful with PII). Keep `message` human-readable.

#### Intermediate

**RFC 7807** problem details can inspire extension keys (`type`, `title`, `detail`). Gate verbose details behind `debug` flags or roles.

#### Expert

**Sentry** breadcrumbs can capture extensions server-side while clients receive trimmed payloads. **OpenTelemetry** spans should annotate `graphql.error.code` on failures.

```javascript
extensions: {
  code: "BAD_USER_INPUT",
  issues: [{ path: ["password"], rule: "minLength", min: 12 }],
}
```

#### Key Points

- Extensions carry structured detail for clients and tools.
- Avoid secrets and PII in extensions.
- Version extension shapes carefully.

#### Best Practices

- Publish a JSON schema for error extensions if public API.
- Limit array sizes in `issues` to prevent huge responses.
- Redact in `formatError`.

#### Common Mistakes

- Dumping entire validation objects unsanitized.
- Changing extension keys without versioning.
- Using extensions for large stack traces to clients.

---

### 17.5.5 Error Documentation

#### Beginner

Document common **validation** failures in your API guide: depth limits, complexity, banned fields. Provide examples of fixed queries.

#### Intermediate

Maintain a **catalog** of error codes (`AUTH`, `NOT_FOUND`, `BAD_USER_INPUT`) with meanings and remediation. Link from developer portal.

#### Expert

**OpenAPI** for REST bridges can align error models. **GraphQL errors** spec proposals evolve—track ecosystem guidance. Machine-readable catalogs enable client codegen for union error handling.

```markdown
## Errors

| Code            | Meaning            | HTTP |
|-----------------|--------------------|------|
| QUERY_DEPTH     | Exceeds max depth  | 400  |
| QUERY_COMPLEXITY| Exceeds cost budget| 400  |
```

#### Key Points

- Documentation reduces support load.
- Codes should be stable contracts.
- Examples teach better than tables alone.

#### Best Practices

- Changelog for new/changed codes.
- Playground snippets showing fixes.
- Internal runbooks for operators vs external docs.

#### Common Mistakes

- Undocumented ad-hoc error strings.
- Docs drift from implementation.
- No guidance for retries vs client bugs.

---

## 17.6 Advanced Validation

### 17.6.1 Cross-Field Validation

#### Beginner

**Cross-field validation** compares multiple inputs: `password === confirmPassword`, `start < end`. GraphQL input objects do not express these; validate in code.

#### Intermediate

Zod **refine** / **superRefine** models cross-field constraints with multiple issues. Return all violations at once when possible for better UX.

#### Expert

**Database-level** checks (CHECK constraints) enforce invariants across fields even if API bypassed. **Optimistic concurrency** (`version` field) pairs with validation of stale updates.

```javascript
const Range = z
  .object({ start: z.date(), end: z.date() })
  .refine((d) => d.end > d.start, {
    message: "end must be after start",
    path: ["end"],
  });
```

#### Key Points

- Cross-field rules are common in forms and bookings.
- Schema cannot replace all of them.
- Database constraints backstop races.

#### Best Practices

- Single validator object per mutation input.
- Tests for each pairwise constraint.
- Clear error attribution to the “later” field when arbitrary.

#### Common Mistakes

- Validating fields independently then missing combinations.
- Returning only the first of many cross-field errors.
- No DB constraint for critical invariants.

---

### 17.6.2 Business Logic Validation

#### Beginner

**Business logic validation** encodes domain rules: cannot cancel a shipped order, cannot withdraw more than balance. Lives in **domain services** called from mutation resolvers.

#### Intermediate

Separate **technical validation** (format) from **domain validation** (eligibility). Domain errors map to specific GraphQL error codes or payload unions.

#### Expert

**Event-sourced** systems validate commands against aggregate state; GraphQL mutations become command adapters. **Sagas** validate across services with timeouts and compensations—surface partial success carefully.

```javascript
async function cancelOrder(orderId, user) {
  const order = await repo.get(orderId);
  if (order.status === "SHIPPED") {
    const e = new Error("Cannot cancel shipped order");
    e.extensions = { code: "INVALID_STATE" };
    throw e;
  }
  if (order.customerId !== user.id) throw new Error("FORBIDDEN");
  // ...
}
```

#### Key Points

- Business rules change often—centralize them.
- GraphQL is just the edge; domain core owns truth.
- Errors should reflect domain vocabulary.

#### Best Practices

- Ubiquitous language in error codes/messages.
- Unit tests for each rule with fixtures.
- Auditable logs for denied business actions.

#### Common Mistakes

- Scattering domain rules across resolvers inconsistently.
- Returning 200 with `{ success: false }` without GraphQL errors—pick a consistent style.
- Leaking internal state machines verbatim to clients.

---

### 17.6.3 Semantic Validation

#### Beginner

**Semantic validation** ensures meaning: a string is a valid **ISO country code**, a date is a business day, a SKU exists. Unlike syntax, semantics need databases or registries.

#### Intermediate

Cache semantic checks (country list) in memory. For existence checks (`organizationId`), prefer batched queries with DataLoader inside mutation validation pipelines.

#### Expert

**Ontologies** and **taxonomies** may require external validation services—handle degradation (stale cache vs fail closed). **Legal** semantics (sanctions lists) need audit trails.

```javascript
const ISO_COUNTRIES = new Set(["US", "CA", "GB" /* ... */]);

function validateCountry(code) {
  if (!ISO_COUNTRIES.has(code)) throw new Error("UNKNOWN_COUNTRY");
}
```

#### Key Points

- Semantic validation ties API to real world data.
- Caching reduces latency and load.
- Some semantics require authoritative remote sources.

#### Best Practices

- Refresh reference data on schedule.
- Version reference datasets.
- Fail closed for compliance checks when services down.

#### Common Mistakes

- Hardcoding stale reference lists.
- No batching for many semantic lookups in one mutation.
- Confusing enums with exhaustive semantic coverage.

---

### 17.6.4 Validation Hooks

#### Beginner

**Hooks** run validation at defined lifecycle points: before execute, before resolver, after parse. Server plugins expose these hooks to inject rules without forking the executor.

#### Intermediate

**Envelop** `onParse`, `onValidate`, `onExecute` phases compose. Use `onValidate` to push validation rules dynamically based on context (for example stricter for anonymous).

#### Expert

**Middleware** chains in resolvers act as post-validation hooks for args already structurally valid. Beware double validation costs—memoize per request when expensive.

```javascript
const useStrictValidationForAnonymous = {
  onValidate({ context, addValidationRule }) {
    if (!context.user) {
      addValidationRule(complexityRuleStrict);
    }
  },
};
```

#### Key Points

- Hooks decouple frameworks from business validation.
- Phase choice matters (parse vs validate vs execute).
- Dynamic hooks enable per-tenant policies.

#### Best Practices

- Keep hooks fast; no network in pure validation phase.
- Log hook-added rules in debug builds.
- Test matrix: anonymous vs authed, tenant A vs B.

#### Common Mistakes

- Heavy I/O in validate phase blocking event loop.
- Ordering bugs between plugins.
- Different hook behavior across environments unnoticed.

---

### 17.6.5 Performance Optimization

#### Beginner

**Optimize validation** by avoiding redundant passes: validate once per request, cache parsed documents where safe (**parser cache**), and keep custom rules O(n) in selection nodes.

#### Intermediate

**Persisted queries** skip parsing/validation of arbitrary text for known hashes. **Compiler** optimizations in graphql-js improve over versions—benchmark upgrades.

#### Expert

**JIT** or precompiled query plans are research/industry topics; most Node apps win bigger from **batching** and **indexes** than micro-optimizing validation. Profile before rewriting validators.

```javascript
const parseCache = new Map();

function getDocument(source) {
  if (parseCache.has(source)) return parseCache.get(source);
  const doc = parse(source);
  parseCache.set(source, doc);
  return doc;
}
```

#### Key Points

- Validation is usually cheap vs resolvers—but custom rules can hurt.
- Caching parsed docs helps only for repeated exact strings—bounded caches prevent memory leaks.
- Persisted operations move cost to deploy time.

#### Best Practices

- Cap parse cache size (LRU).
- Load test with worst-case allowed queries.
- Measure validation time in APM spans.

#### Common Mistakes

- Unbounded parse caches on multi-tenant arbitrary queries.
- Extremely complex custom validators on every field.
- Optimizing validation while ignoring N+1 in resolvers.

---
