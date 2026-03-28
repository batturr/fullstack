# Authentication

## 📑 Table of Contents

- [22.1 Authentication Basics](#221-authentication-basics)
  - [22.1.1 Authentication Concepts](#2211-authentication-concepts)
  - [22.1.2 Authentication Flow](#2212-authentication-flow)
  - [22.1.3 Credentials](#2213-credentials)
  - [22.1.4 Tokens](#2214-tokens)
  - [22.1.5 Sessions](#2215-sessions)
- [22.2 JWT Authentication](#222-jwt-authentication)
  - [22.2.1 JWT Structure](#2221-jwt-structure)
  - [22.2.2 Token Creation](#2222-token-creation)
  - [22.2.3 Token Validation](#2223-token-validation)
  - [22.2.4 Token Refresh](#2224-token-refresh)
  - [22.2.5 Token Expiration](#2225-token-expiration)
- [22.3 Bearer Tokens](#223-bearer-tokens)
  - [22.3.1 Bearer Token Format](#2231-bearer-token-format)
  - [22.3.2 Token in Headers](#2232-token-in-headers)
  - [22.3.3 Token Validation](#2233-token-validation)
  - [22.3.4 Token Revocation](#2234-token-revocation)
  - [22.3.5 Token Blacklisting](#2235-token-blacklisting)
- [22.4 OAuth2 Integration](#224-oauth2-integration)
  - [22.4.1 OAuth2 Flow](#2241-oauth2-flow)
  - [22.4.2 Authorization Code Flow](#2242-authorization-code-flow)
  - [22.4.3 Implicit Flow](#2243-implicit-flow)
  - [22.4.4 Client Credentials Flow](#2244-client-credentials-flow)
  - [22.4.5 Resource Owner Password Flow](#2245-resource-owner-password-flow)
- [22.5 Social Authentication](#225-social-authentication)
  - [22.5.1 Google OAuth](#2251-google-oauth)
  - [22.5.2 GitHub OAuth](#2252-github-oauth)
  - [22.5.3 Facebook OAuth](#2253-facebook-oauth)
  - [22.5.4 OpenID Connect](#2254-openid-connect)
  - [22.5.5 Multi-Provider Setup](#2255-multi-provider-setup)
- [22.6 Session Management](#226-session-management)
  - [22.6.1 Session Creation](#2261-session-creation)
  - [22.6.2 Session Storage](#2262-session-storage)
  - [22.6.3 Session Validation](#2263-session-validation)
  - [22.6.4 Session Expiration](#2264-session-expiration)
  - [22.6.5 Session Cleanup](#2265-session-cleanup)
- [22.7 Advanced Authentication](#227-advanced-authentication)
  - [22.7.1 Multi-Factor Authentication](#2271-multi-factor-authentication)
  - [22.7.2 Passwordless Authentication](#2272-passwordless-authentication)
  - [22.7.3 Biometric Authentication](#2273-biometric-authentication)
  - [22.7.4 Hardware Tokens](#2274-hardware-tokens)
  - [22.7.5 Certificate-Based Authentication](#2275-certificate-based-authentication)

---

## 22.1 Authentication Basics

### 22.1.1 Authentication Concepts

#### Beginner

**Authentication** answers “who are you?” It happens **before** GraphQL execution: the client proves identity (password, token, session cookie). GraphQL itself does not define auth; your **HTTP layer** and **context** carry the authenticated **user** (or `null`) into resolvers.

#### Intermediate

Distinguish **identification** (username) from **verification** (password check). **Factors** include something you know, have, or are. For APIs, **stateless** tokens (JWT) and **stateful** sessions are common. **Authorization** (what you may do) is separate and covered in the Authorization topic.

#### Expert

Design **trust boundaries**: browser vs mobile vs machine-to-machine. Consider **token binding**, **audience** (`aud`) and **issuer** (`iss`) claims, **clock skew**, **key rotation**, and **replay** resistance. GraphQL **batching** and **aliases** do not bypass auth—every operation must run with the same **request-scoped** principal in `context`.

```javascript
// apolloServer.js — attach user to GraphQL context from HTTP
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => ({
    user: await authenticateFromRequest(req),
  }),
});
```

```graphql
type Query {
  me: User
}
```

#### Key Points

- Authentication establishes identity; it is not the same as authorization.
- Context is the standard place to inject `user` for all resolvers in one request.
- GraphQL’s single endpoint does not remove the need for strong auth at the edge.

#### Best Practices

- Treat unauthenticated and authenticated states explicitly (`null` vs user object).
- Log authentication failures with care—avoid leaking whether an account exists.
- Use HTTPS for any credential or token in transit.

#### Common Mistakes

- Skipping auth because “the schema is private.”
- Putting passwords or long-lived secrets in GraphQL variables logged by APM tools.
- Confusing a signed JWT with an encrypted payload—JWTs are often only signed.

---

### 22.1.2 Authentication Flow

#### Beginner

A typical **flow**: client sends credentials or code → server validates → server issues **session** or **token** → client sends token on each GraphQL request (header or cookie) → server builds `context.user` → resolvers use it.

#### Intermediate

**Login** may be REST or a GraphQL **mutation** (`login`). Prefer **short-lived access tokens** and **refresh tokens** for SPAs. For **cookies**, set `HttpOnly`, `Secure`, `SameSite` appropriately and protect against **CSRF** on mutations that use cookies.

#### Expert

Use **opaque tokens** with server-side lookup for instant revocation, or **JWT** with **short TTL** plus refresh and **jti** for blacklist/compromise handling. For **federation**, authenticate at the **router** and forward **identity headers** to subgraphs with **mTLS** or signed internal tokens.

```javascript
// login mutation resolver (simplified)
async function login(_, { email, password }, { users, issueTokens }) {
  const user = await users.findByEmail(email);
  if (!user || !(await users.verifyPassword(user, password))) {
    throw new GraphQLError("Invalid credentials", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return issueTokens(user);
}
```

```graphql
type Mutation {
  login(email: String!, password: String!): AuthPayload!
}

type AuthPayload {
  accessToken: String!
  refreshToken: String!
  user: User!
}
```

#### Key Points

- One clear path from credential exchange to request-scoped identity.
- Separate transport concerns (cookies vs Authorization header) from resolver logic.
- GraphQL errors should use consistent codes (`UNAUTHENTICATED`) for clients.

#### Best Practices

- Centralize token issuance in one module; avoid duplicating secret handling.
- Rate-limit login and refresh endpoints aggressively.
- Return generic errors for bad login to reduce user enumeration.

#### Common Mistakes

- Returning different error messages for “user not found” vs “wrong password.”
- Storing refresh tokens in `localStorage` without threat modeling XSS.
- Running expensive resolvers before cheap auth checks.

---

### 22.1.3 Credentials

#### Beginner

**Credentials** are secrets used to prove identity: **passwords**, **API keys**, **client secrets**. Never log them, never return them in GraphQL responses, and never embed them in client-side bundles for production APIs.

#### Intermediate

**Passwords** must be hashed with a modern algorithm (**Argon2id**, **bcrypt**, or **scrypt**) with per-user salt. **API keys** suit server-to-server flows; scope and rotate them. **Client secrets** in OAuth belong only on confidential servers, never in browser code.

#### Expert

Enforce **password policies** that favor length over complexity rules that users circumvent. Use **peppering** (server-side secret combined with hash) for defense in depth. For **API keys**, prefer **HMAC** request signing or **mTLS** for high-assurance integrations alongside GraphQL.

```javascript
import argon2 from "argon2";

async function hashPassword(plain) {
  return argon2.hash(plain, { type: argon2.argon2id });
}

async function verifyPassword(hash, plain) {
  return argon2.verify(hash, plain);
}
```

```graphql
input RegisterInput {
  email: String!
  password: String!
}

type Mutation {
  register(input: RegisterInput!): User!
}
```

#### Key Points

- Plaintext password storage is never acceptable.
- Credentials in GraphQL inputs need the same validation as REST bodies.
- Different credential types imply different threat models and storage.

#### Best Practices

- Validate password strength server-side; cap input length to avoid DoS on hashing.
- Use environment variables or a secrets manager for signing keys and pepper.
- Rotate API keys and document the rotation process for integrators.

#### Common Mistakes

- Using fast hashes (MD5, SHA-256 alone) for passwords.
- Echoing submitted passwords in error messages or debug logs.
- Putting third-party API keys in GraphQL schema defaults or examples.

---

### 22.1.4 Tokens

#### Beginner

A **token** is a string the client presents after login. **Opaque tokens** are random IDs looked up in a database or cache. **JWTs** are self-contained JSON with a signature so servers can verify without a lookup (if keys are known).

#### Intermediate

Tokens carry **claims** (subject, expiry, scopes). **Access tokens** are short-lived; **refresh tokens** are long-lived and stored more carefully. Validate **signature**, **exp**, **nbf**, and **iss**/**aud** on every GraphQL request that uses JWTs.

#### Expert

Mitigate **JWT theft**: short TTL, **rotation**, **binding** to client context where possible, and **asymmetric** signing (RS256) so verifying services do not hold private keys. For GraphQL gateways, normalize token validation in **plugins** or **middleware** before `execute`.

```javascript
import jwt from "jsonwebtoken";

function issueAccessToken(user, privateKey, opts = {}) {
  return jwt.sign(
    { sub: user.id, roles: user.roles },
    privateKey,
    { algorithm: "RS256", expiresIn: "15m", issuer: "api.example.com", ...opts }
  );
}
```

```graphql
# Token is not part of the schema; sent via Authorization header
type Query {
  dashboard: Dashboard!
}
```

#### Key Points

- Tokens identify sessions or users across stateless requests.
- Validation logic should run once per HTTP request, not per field.
- Refresh and access tokens serve different risk profiles.

#### Best Practices

- Prefer asymmetric keys for multi-service verification.
- Include minimal claims in access tokens; avoid PII in JWT payload.
- Monitor for abnormal token usage patterns.

#### Common Mistakes

- Trusting the JWT payload without verifying the signature.
- Using `alg: none` or accepting unexpected algorithms.
- Storing refresh tokens without encryption at rest when required by policy.

---

### 22.1.5 Sessions

#### Beginner

A **session** ties a browser or client to server-side state via a **session ID** (often in a cookie). Each GraphQL request sends the cookie; the server loads the session and sets `context.user`.

#### Intermediate

**Server-side sessions** scale with **Redis** or a database. **Sticky sessions** alone are fragile; prefer a shared store. Set cookie flags to reduce **XSS** and **CSRF** risk. For SPAs using cookies, use **SameSite=Lax** or **Strict** and CSRF tokens for state-changing operations if needed.

#### Expert

Implement **session fixation** defense by regenerating session ID on privilege change. **Concurrent session** limits and **device lists** improve account security. For GraphQL over **WebSocket**, re-validate or re-issue session when upgrading the connection.

```javascript
import session from "express-session";
import RedisStore from "connect-redis";
import { createClient } from "redis";

const redisClient = createClient({ url: process.env.REDIS_URL });
await redisClient.connect();

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true, httpOnly: true, sameSite: "lax", maxAge: 86400000 },
  })
);
```

```graphql
type Query {
  me: User
}
```

#### Key Points

- Sessions are ideal when you need instant server-side invalidation.
- Cookie security flags are part of your GraphQL API’s threat model.
- Shared session stores enable horizontal scaling.

#### Best Practices

- Use cryptographically random session IDs with sufficient entropy.
- Destroy sessions on logout server-side.
- Align session TTL with business requirements and risk.

#### Common Mistakes

- Storing large objects in the session cookie (avoid huge JWTs in cookies).
- Forgetting HTTPS in production with `Secure` cookies.
- No session rotation after login.

---

## 22.2 JWT Authentication

### 22.2.1 JWT Structure

#### Beginner

A **JWT** has three Base64URL parts separated by dots: **header** (algorithm, type), **payload** (claims), **signature**. Decoding the payload is trivial—never put secrets there thinking it is hidden.

#### Intermediate

Standard claims include **`sub`** (subject), **`iat`** (issued at), **`exp`** (expiration), **`iss`**, **`aud`**, **`jti`**. **Custom claims** hold app-specific data. The signature proves integrity and issuer; use **HS256** (shared secret) or **RS256** (public/private key pair).

#### Expert

Validate **`alg`** against an allowlist to prevent **algorithm confusion** attacks. Pin **kid** (key id) for rotation. For GraphQL microservices, propagate a **verified** JWT or internal identity assertion—do not re-parse untrusted headers from subgraph to subgraph without trust boundaries.

```javascript
// Decode without verifying — ONLY for debugging, never for auth decisions
import jwt from "jsonwebtoken";

function unsafePeek(token) {
  return jwt.decode(token, { complete: true });
}
```

```graphql
# Claims inform authorization; schema stays independent of JWT shape
type User {
  id: ID!
  email: String!
}
```

#### Key Points

- JWT = header.payload.signature; payload is not confidential by default.
- Always verify signature and claims before trusting `sub`.
- Keep payloads small to fit headers and reduce bandwidth.

#### Best Practices

- Use standard claims where possible for interoperability.
- Version keys and support multiple `kid` values during rotation.
- Document expected `iss` and `aud` for all consumers.

#### Common Mistakes

- Using JWT for data you must hide from the client (use encryption or server-side lookup).
- Skipping `exp` validation “because the gateway checked.”
- Huge custom claims bloating every request.

---

### 22.2.2 Token Creation

#### Beginner

**Create** a JWT after successful login: sign a payload with a secret or private key, set **`exp`**, return the string to the client. The client sends it in `Authorization: Bearer <token>`.

#### Intermediate

Separate **access** (15m) and **refresh** (7d) tokens with different signing keys or claims. Store **refresh token** hashes in the database. Include **`jti`** on refresh tokens to support revocation lists.

#### Expert

Use a **key management service** for private keys; avoid filesystem keys on ephemeral containers without injection. Emit **token introspection** endpoints or use **opaque** refresh tokens with database backing for compliance-heavy environments.

```javascript
import jwt from "jsonwebtoken";

function createAccessToken(userId, privateKey) {
  const jti = crypto.randomUUID();
  return jwt.sign(
    { sub: userId, jti, scope: "api" },
    privateKey,
    { algorithm: "RS256", expiresIn: "15m", issuer: "https://auth.example.com" }
  );
}
```

```graphql
type Mutation {
  login(email: String!, password: String!): TokenPair!
}

type TokenPair {
  accessToken: String!
  refreshToken: String!
}
```

#### Key Points

- Creation is the point to enforce TTL and minimal claims.
- Refresh tokens need stronger storage and rotation policies than access tokens.
- Signing algorithm and key material must match verification side.

#### Best Practices

- Use `crypto.randomUUID()` for `jti` where revocation tracking is needed.
- Never log full tokens at info level.
- Unit-test token creation with fixed clock mocks for `exp`.

#### Common Mistakes

- Infinite-lived access tokens for convenience.
- Same secret for access and refresh tokens.
- Including sensitive PII in signed JWT for the browser.

---

### 22.2.3 Token Validation

#### Beginner

On each request, read the **Bearer** token, **verify** the signature with the secret or public key, check **`exp`**, then load or map **`sub`** to `context.user`.

#### Intermediate

Use middleware or Apollo **plugins** (`requestDidStart`) to parse `Authorization` once. Handle **clock skew** (e.g., ±60s). Reject tokens with wrong **`aud`** or **`iss`**. Map verification errors to **GraphQL** `UNAUTHENTICATED` without leaking internals.

#### Expert

Support **JWKS** endpoints for rotating public keys; cache keys with TTL. For **multi-tenant** APIs, validate tenant claim against route or header. Consider **binding** access tokens to a **hash of the TLS client cert** for high-security internal GraphQL.

```javascript
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const client = jwksClient({ jwksUri: "https://auth.example.com/.well-known/jwks.json" });

function getKey(header, cb) {
  client.getSigningKey(header.kid, (err, key) => {
    cb(err, key?.getPublicKey());
  });
}

function verifyAccessToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      { algorithms: ["RS256"], issuer: "https://auth.example.com" },
      (err, payload) => (err ? reject(err) : resolve(payload))
    );
  });
}
```

```graphql
type Query {
  me: User
}
```

#### Key Points

- Verification must include algorithm, signature, and time-based claims.
- Centralize validation to avoid divergent checks in resolvers.
- JWKS enables rotation without redeploying every consumer.

#### Best Practices

- Fail closed: malformed tokens reject the whole request or return field errors consistently.
- Use `jsonwebtoken` or `jose` with explicit allowed algorithms.
- Add metrics for validation failures to detect attacks.

#### Common Mistakes

- Catching verification errors and continuing as anonymous silently.
- Accepting tokens intended for another `audience`.
- Parsing JWT manually without constant-time comparisons where needed.

---

### 22.2.4 Token Refresh

#### Beginner

When the **access token** expires, the client sends the **refresh token** to a **refresh** endpoint or mutation. The server validates the refresh token, issues a **new access token** (and optionally a new refresh token—**rotation**).

#### Intermediate

**Refresh token rotation** reduces replay window: each use invalidates the previous refresh token and stores the new hash. Detect **reuse** (presenting an old refresh token) and revoke the whole token family as a possible theft signal.

#### Expert

Implement **refresh** as a separate bounded context with stricter rate limits and device binding. For GraphQL, expose `refreshToken` as a **mutation** that returns the same `AuthPayload` shape as login; avoid putting refresh tokens in query strings.

```javascript
async function refreshTokens(oldRefreshToken, { refreshStore, issuePair }) {
  const row = await refreshStore.consume(oldRefreshToken);
  if (!row) throw new GraphQLError("Invalid refresh token");
  if (row.reuseDetected) await refreshStore.revokeFamily(row.familyId);
  return issuePair(row.userId, { familyId: row.familyId });
}
```

```graphql
type Mutation {
  refreshToken(token: String!): TokenPair!
}
```

#### Key Points

- Refresh endpoints are high-value targets—harden and monitor them.
- Rotation limits damage from a single stolen refresh token.
- Keep access tokens off long-lived storage where possible.

#### Best Practices

- Bind refresh tokens to client instance IDs when feasible.
- Log refresh failures with IP and user agent for fraud detection.
- Return `UNAUTHENTICATED` for all invalid refresh attempts.

#### Common Mistakes

- Long-lived access tokens to avoid implementing refresh.
- Storing refresh tokens in URLs or referrer-visible places.
- No reuse detection on rotation.

---

### 22.2.5 Token Expiration

#### Beginner

**`exp`** claim defines when the token is no longer valid. Short **access token** lifetime limits exposure if stolen. Clients must handle **401** / GraphQL auth errors and refresh or re-login.

#### Intermediate

Balance **UX** and **security**: 5–15 minutes for access tokens is common. **Sliding sessions** via refresh can keep UX smooth. Document **clock skew** tolerance on servers.

#### Expert

Use **`nbf`** (not before) for delayed activation. **Grace periods** can help distributed systems but widen attack windows—prefer synchronized time (NTP). For GraphQL **subscriptions**, define whether tokens are re-validated on **ping/pong** intervals.

```javascript
import jwt from "jsonwebtoken";

function isExpired(token) {
  const decoded = jwt.decode(token);
  if (!decoded?.exp) return true;
  return Date.now() >= decoded.exp * 1000;
}
```

```graphql
type Query {
  health: String!
}
```

#### Key Points

- Expiration is enforced at verification time, not client honesty.
- Short access + refresh is the norm for browser clients.
- Subscription lifetimes may need explicit re-auth policy.

#### Best Practices

- Use server time only; do not trust client `exp` interpretation for security.
- Alert on tokens with absurdly long TTL from misconfiguration.
- Test edge cases around token expiry during long-running mutations.

#### Common Mistakes

- Ignoring timezone bugs by comparing seconds vs milliseconds incorrectly.
- Allowing negative TTL or zero `exp` due to bad clock on issuer.
- No client-side handling leading to confusing partial UI states.

---

## 22.3 Bearer Tokens

### 22.3.1 Bearer Token Format

#### Beginner

The **Bearer** scheme means: whoever holds the token is treated as authorized to use it (until invalidation). The HTTP form is `Authorization: Bearer <token>`. The token string itself may be a JWT or opaque.

#### Intermediate

**RFC 6750** defines Bearer usage. Do not accept tokens in query parameters in production (leaks via logs and Referer). Normalize parsing: trim whitespace, reject multiple spaces, case-insensitive `Bearer` prefix handling per spec.

#### Expert

For **HTTP/2** and **gRPC-Gateway** to GraphQL bridges, ensure intermediaries do not strip `Authorization`. Some proxies require explicit **allowlists** for headers to subgraphs in federation.

```javascript
function parseBearer(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  return token.length ? token : null;
}
```

```graphql
type Query {
  projects: [Project!]!
}
```

#### Key Points

- Bearer implies possession—protect transport with TLS.
- Format is standardized; parse defensively.
- Query string tokens are almost always a bad idea.

#### Best Practices

- Reject empty bearer tokens with `UNAUTHENTICATED`.
- Document exact header requirements for API consumers.
- Use integration tests that send malformed `Authorization` headers.

#### Common Mistakes

- Accepting `Bearer` without a token body.
- Logging full `Authorization` headers in HTTP access logs.
- Mixing Basic and Bearer parsing in one fragile branch.

---

### 22.3.2 Token in Headers

#### Beginner

Put the token in the **`Authorization`** header for GraphQL **POST** requests. Tools like Apollo Client set `headers: { authorization: 'Bearer ...' }` per operation or via **Apollo Link**.

#### Intermediate

**CORS**: browsers preflight `Authorization`; configure `Access-Control-Allow-Headers` on the GraphQL server. For **WebSocket** subscriptions, pass the token in **`connectionParams`** and validate in the server `onConnect`.

#### Expert

**CDN and API gateways** may cache responses—never cache GraphQL responses that vary by `Authorization` without **Vary: Authorization** or private cache control. For **BFF** patterns, the browser may use cookies while the BFF uses Bearer to the GraphQL origin.

```javascript
// Apollo Client 3
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const authLink = setContext((_, { headers }) => {
  const token = getAccessToken();
  return { headers: { ...headers, authorization: token ? `Bearer ${token}` : "" } };
});
```

```graphql
query Me {
  me {
    id
    email
  }
}
```

#### Key Points

- Headers are the default secure transport for bearer tokens in browsers.
- Subscription transports need a parallel path for the same credential.
- CORS must explicitly allow Authorization when using custom origins.

#### Best Practices

- Use `credentials: 'include'` only when you intentionally use cookies.
- Refresh tokens before expiry using an interceptor or link.
- Avoid duplicating token in custom headers without reason.

#### Common Mistakes

- Forgetting preflight configuration and debugging “works in curl, fails in browser.”
- Sending refresh token on every GraphQL request unnecessarily.
- Storing access token in a place XSS can read when cookies with HttpOnly are an option.

---

### 22.3.3 Token Validation

#### Beginner

**Validate** means: extract token, verify signature (if JWT), check expiry, map to user. Unauthenticated requests may still be allowed for public fields—policy choice.

#### Intermediate

Run validation in **one place** (middleware or plugin) and attach `context.auth` with `{ user, scopes, rawClaims }`. Resolvers should not re-parse headers ad hoc.

#### Expert

Add **step-up** authentication for sensitive mutations by checking **amr** / **acr** claims or a server-side **step-up session** flag. For **federation**, the router validates outward tokens; subgraphs trust **internal** identity headers only from the router.

```javascript
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    {
      async requestDidStart() {
        return {
          async didResolveOperation(requestContext) {
            const op = requestContext.operationName;
            if (op === "IntrospectionQuery") return;
            // optional: enforce auth for all operations except login
          },
        };
      },
    },
  ],
});
```

```graphql
type Mutation {
  transferFunds(to: ID!, amount: Float!): TransferResult!
}
```

#### Key Points

- Consistent validation prevents security holes in “forgotten” resolvers.
- Public vs private operations should be explicit in code or directives.
- Federation shifts some validation to the gateway layer.

#### Best Practices

- Cache JWKS moderately; handle key rotation failures gracefully.
- Type `context` in TypeScript for `user` and `scopes`.
- Unit-test the auth plugin with mocked requests.

#### Common Mistakes

- Validating token in parent resolver but not in nested field resolvers that assume auth.
- Different code paths for HTTP and WebSocket with inconsistent rules.

---

### 22.3.4 Token Revocation

#### Beginner

**Revocation** means the token should no longer work even before `exp`. **Opaque tokens** are easy to revoke by deleting server-side records. **JWTs** cannot be truly revoked without extra machinery until they expire.

#### Intermediate

Strategies: **short TTL**, **server-side denylist** of `jti`, **version** claim checked against DB on each request, or **logout** that clears session. For compliance, combine short JWT with server-side session record.

#### Expert

At scale, use **Redis** for `jti` revocation sets with TTL matching max token life. **Push** revocation events to edge nodes. For **zero-trust**, prefer **introspection** endpoints for opaque tokens at the GraphQL gateway.

```javascript
async function assertTokenActive(jti, { revoked }) {
  if (await revoked.has(jti)) {
    throw new GraphQLError("Token revoked", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
}
```

```graphql
type Mutation {
  logout: Boolean!
}
```

#### Key Points

- Stateless JWT and instant global revocation are in tension—design explicitly.
- Logout should revoke refresh tokens and mark access `jti` where supported.
- Revocation checks must be fast to avoid latency spikes on every request.

#### Best Practices

- Document realistic revocation semantics to security reviewers.
- Use family revocation on refresh token compromise.
- Monitor revocation store availability as a critical dependency.

#### Common Mistakes

- Claiming “logout” works while access JWT remains valid until `exp`.
- Unbounded growth of revocation lists without TTL alignment.
- Checking revocation only on mutations but not queries.

---

### 22.3.5 Token Blacklisting

#### Beginner

A **blacklist** (denylist) stores identifiers of tokens that must be rejected—commonly **`jti`** or token hash. It complements short JWT lifetimes.

#### Intermediate

Store **hashes** of tokens if you cannot extract `jti`. Use **TTL** equal to remaining token life to auto-expire blacklist entries. On **password change**, blacklist all outstanding access `jti` or bump a **tokenVersion** user claim.

#### Expert

**Partition** blacklist by region for latency. **Bloom filters** can be a first-pass negative check with a backing store for certainty. Ensure **race-free** logout: blacklist before returning success to client.

```javascript
import { createClient } from "redis";

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

async function blacklistJti(jti, expSec) {
  const ttl = Math.max(1, expSec - Math.floor(Date.now() / 1000));
  await redis.set(`deny:jti:${jti}`, "1", { EX: ttl });
}

async function isBlacklisted(jti) {
  return (await redis.get(`deny:jti:${jti}`)) === "1";
}
```

```graphql
type Mutation {
  changePassword(current: String!, next: String!): Boolean!
}
```

#### Key Points

- Blacklist entries should expire automatically with token `exp`.
- Pair with user-level version claims for bulk invalidation.
- Redis or similar is typical for high-throughput checks.

#### Best Practices

- Use constant key prefixes and monitor memory usage.
- Test failover behavior if blacklist is unavailable (fail closed vs open policy).
- Audit admin-triggered global blacklists.

#### Common Mistakes

- Blacklisting without TTL → unbounded Redis memory use.
- Storing raw tokens in Redis instead of `jti` or hash.
- Failing open on Redis errors without business approval.

---

## 22.4 OAuth2 Integration

### 22.4.1 OAuth2 Flow

#### Beginner

**OAuth2** lets a user authorize a **client** to access resources without giving the client their password. **Authorization server** issues tokens; **resource server** (your GraphQL API) validates them.

#### Intermediate

Roles: **resource owner**, **client**, **authorization server**, **resource server**. Flows differ by client type (public vs confidential). GraphQL is usually the **resource server** or sits behind an API gateway that validates tokens.

#### Expert

Map OAuth **scopes** to GraphQL **authorization** rules. Avoid exposing raw **permissions strings** in the schema; map claims to internal roles. For **mobile**, use **PKCE** with authorization code flow instead of deprecated implicit flow.

```javascript
// Express: validate OAuth token before Apollo
app.use("/graphql", async (req, res, next) => {
  const user = await validateResourceServerToken(req);
  req.graphqlUser = user;
  next();
});
```

```graphql
type Query {
  me: User
}
```

#### Key Points

- OAuth2 is a framework; choose the correct flow per client type.
- Your GraphQL layer consumes access tokens issued elsewhere.
- Scopes and claims must align with resolver-level authorization.

#### Best Practices

- Use well-maintained OAuth libraries (`openid-client`, provider-specific SDKs).
- Store client secrets only on servers.
- Log authorization decisions without logging tokens.

#### Common Mistakes

- Using resource owner password flow for first-party SPAs.
- Treating access tokens as authentication for the wrong audience.
- Custom crypto instead of vetted OAuth libraries.

---

### 22.4.2 Authorization Code Flow

#### Beginner

User is redirected to the **authorization server**, approves, and returns with a **`code`**. The **backend** exchanges the code for **access** and **refresh** tokens using **client_secret** (confidential client).

#### Intermediate

Add **PKCE** (`code_verifier` / `code_challenge`) for public clients. The GraphQL server typically does **not** see the code exchange—only the resulting bearer access token on API calls.

#### Expert

**State** parameter prevents CSRF on redirect; **nonce** binds ID tokens in OIDC. For **BFF**, the exchange happens server-side; the browser holds only a session cookie.

```javascript
import { generators, Issuer } from "openid-client";

const issuer = await Issuer.discover("https://accounts.google.com");
const client = new issuer.Client({
  client_id: process.env.OAUTH_CLIENT_ID,
  client_secret: process.env.OAUTH_CLIENT_SECRET,
  redirect_uris: ["https://app.example.com/callback"],
});

const codeVerifier = generators.codeVerifier();
const codeChallenge = generators.codeChallenge(codeVerifier);
// redirect user to authorizationUrl with code_challenge_method=S256
```

```graphql
# After OAuth, client calls GraphQL with access token
query Me {
  me {
    id
  }
}
```

#### Key Points

- Code flow + PKCE is the modern default for user-facing apps.
- Secret never ships to browser for confidential clients.
- `state` must be verified on callback.

#### Best Practices

- Use HTTPS redirect URIs only.
- Bind code exchange to the same client instance that started the flow.
- Rotate client secrets per environment.

#### Common Mistakes

- Omitting PKCE on mobile or SPA.
- Predictable `state` values.
- Accepting codes on wrong redirect URI.

---

### 22.4.3 Implicit Flow

#### Beginner

**Implicit flow** returned access tokens directly in the **URL fragment** for old SPAs without backends. It is **deprecated** for most cases due to token exposure in browser history and referrer leakage.

#### Intermediate

Prefer **authorization code + PKCE** instead. If you maintain legacy implicit clients, minimize token scope and lifetime and migrate aggressively.

#### Expert

Security reviews often **fail** implicit flow for new systems. If tokens appear in URLs, **Content Security Policy** and **Referrer-Policy** cannot fully fix inherent weaknesses.

```javascript
// Migration note in server config (example message only)
console.warn(
  "Implicit grant disabled — use authorization code flow with PKCE for SPAs"
);
```

```graphql
type Query {
  me: User
}
```

#### Key Points

- Implicit flow is largely obsolete for new applications.
- Access tokens in URLs are hard to protect.
- Modern OAuth providers discourage or disable implicit.

#### Best Practices

- Block new implicit clients at the authorization server.
- Document migration paths for existing integrations.
- Use silent refresh with code flow where possible.

#### Common Mistakes

- Enabling implicit for convenience in tutorials.
- Confusing implicit with “simple OAuth.”
- Long-lived tokens delivered via fragment.

---

### 22.4.4 Client Credentials Flow

#### Beginner

**Machine-to-machine**: the client sends **client_id** and **client_secret** (or JWT assertion) to the token endpoint and receives an **access token** without a user present.

#### Intermediate

Use for **cron jobs**, **workers**, and **service accounts** calling your GraphQL API. Scopes should be **minimal** and **audience**-restricted. Rotate secrets via automation.

#### Expert

Prefer **mTLS** or **private_key_jwt** client authentication over static shared secrets when the auth server supports it. Rate-limit token endpoint per client to prevent secret guessing.

```javascript
import fetch from "node-fetch";

async function fetchClientCredentialsToken() {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.M2M_CLIENT_ID,
    client_secret: process.env.M2M_CLIENT_SECRET,
    scope: "api.read",
  });
  const res = await fetch("https://auth.example.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = await res.json();
  return json.access_token;
}
```

```graphql
type Query {
  internalReport: Report
}
```

#### Key Points

- No end-user consent—treat as highly privileged automation.
- Secrets belong in vaults and env-injected at runtime.
- Narrow scopes reduce blast radius.

#### Best Practices

- Separate M2M clients per service or environment.
- Alert on unusual token request rates.
- Use asymmetric client auth when available.

#### Common Mistakes

- Reusing the same M2M client for every microservice.
- Embedding client secrets in frontend or mobile apps.
- Overly broad scopes “because it is internal.”

---

### 22.4.5 Resource Owner Password Flow

#### Beginner

The client collects **username** and **password** and sends them to the token endpoint (**password grant**). Simple but **discouraged**—the client sees credentials and bypasses the authorization server’s UI.

#### Intermediate

Acceptable only for **highly trusted first-party** legacy cases; even then, migrate to code flow. Never use for third-party apps.

#### Expert

Many providers **disable** ROPG. If you must support it temporarily, enforce **MFA** via step-up endpoints, strict rate limits, and **IP** allowlists—not just GraphQL-level checks.

```javascript
// Anti-pattern demo — prefer authorization code + PKCE
async function passwordGrant(username, password) {
  const body = new URLSearchParams({
    grant_type: "password",
    username,
    password,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    scope: "openid profile",
  });
  // ... token endpoint call
}
```

```graphql
type Mutation {
  login(email: String!, password: String!): TokenPair!
}
```

#### Key Points

- ROPG trains users to type passwords into non-AS UIs.
- Hard to add modern auth (WebAuthn, SSO) cleanly.
- Prefer dedicated login hosted by the identity provider.

#### Best Practices

- Plan migration off ROPG as a priority.
- If unavoidable, combine with short tokens and heavy monitoring.
- Never use for public or partner clients.

#### Common Mistakes

- Building mobile login with ROPG against a generic OAuth server.
- Storing passwords in mobile keychains for repeated grant calls.
- Assuming ROPG is simpler—it shifts liability to your app.

---

## 22.5 Social Authentication

### 22.5.1 Google OAuth

#### Beginner

**Google** sign-in uses OAuth2/OIDC. You register an app in **Google Cloud Console**, get **client ID/secret**, configure **redirect URIs**, and exchange codes for tokens. Your GraphQL API trusts Google-issued **ID tokens** or uses your own session after verifying them.

#### Intermediate

Verify **ID token** signature against Google **JWKS**, check **`aud`** matches your client ID and **`iss`** is `https://accounts.google.com` or `accounts.google.com`. Map **`sub`** to your internal user table.

#### Expert

Support **hd** (hosted domain) claim for workspace-only apps. Handle **email verified** claim—do not link accounts on unverified emails. Refresh **Google public keys** cache on `401` from tokeninfo edge cases.

```javascript
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleIdToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}
```

```graphql
type Mutation {
  loginWithGoogle(idToken: String!): AuthPayload!
}
```

#### Key Points

- Always verify ID tokens server-side; never trust client-decoded JWT alone.
- `sub` is the stable Google user identifier, not email.
- Email can change; account linking must be careful.

#### Best Practices

- Request minimal scopes (`openid email profile`).
- Provide account deletion and data export per policy.
- Use separate OAuth clients for web vs iOS vs Android.

#### Common Mistakes

- Using access token as proof of identity without userinfo validation when needed.
- Omitting `email_verified` checks.
- Wrong `aud` leading to token acceptance from another app.

---

### 22.5.2 GitHub OAuth

#### Beginner

**GitHub OAuth Apps** redirect users to GitHub; callback includes **`code`** exchanged for **access token**. Use token to call **`/user`** API and map to your user.

#### Intermediate

GitHub tokens are **opaque**; validate by calling GitHub’s API. For **Organizations**, consider **GitHub Apps** for finer permissions. Store **GitHub user id** as stable foreign key.

#### Expert

**Scopes** like `read:user` vs `user:email`—email may require secondary API call if private. Watch **rate limits** (`X-RateLimit-Remaining`) when resolving GraphQL `me` from GitHub on every request—cache profile.

```javascript
import fetch from "node-fetch";

async function fetchGitHubUser(accessToken) {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "graphql-api",
    },
  });
  if (!res.ok) throw new Error("GitHub user fetch failed");
  return res.json();
}
```

```graphql
type User {
  githubId: String
  login: String
}
```

#### Key Points

- GitHub OAuth gives API access tokens, not OIDC ID tokens by default.
- Stable ID is numeric `id` field from GitHub user JSON.
- Rate limits affect how often you can hydrate user data.

#### Best Practices

- Use GitHub Apps for org-level integrations where possible.
- Encrypt stored GitHub tokens at rest if you persist them.
- Offer “unlink GitHub” in account settings.

#### Common Mistakes

- Using login handle as primary key (handles can change).
- Requesting excessive scopes alarming users.
- Hitting GitHub on every GraphQL field resolve without caching.

---

### 22.5.3 Facebook OAuth

#### Beginner

**Facebook Login** uses OAuth2; you obtain **access tokens** and call **Graph API** for profile. Follow **Facebook** app review for advanced permissions.

#### Intermediate

Validate tokens with **`debug_token`** endpoint using app access token. Be aware **email** may be missing or unverified depending on user settings.

#### Expert

**Data use** policies and **Limited Login** for iOS change available fields—keep SDKs updated. Map **`id`** from Facebook as external key; handle **deletion callbacks** for compliance.

```javascript
async function debugFacebookToken(userAccessToken) {
  const appId = process.env.FB_APP_ID;
  const appSecret = process.env.FB_APP_SECRET;
  const appToken = `${appId}|${appSecret}`;
  const url = `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(
    userAccessToken
  )}&access_token=${encodeURIComponent(appToken)}`;
  const res = await fetch(url);
  return res.json();
}
```

```graphql
type Mutation {
  loginWithFacebook(accessToken: String!): AuthPayload!
}
```

#### Key Points

- Facebook permissions are granular and review-gated.
- Token debug is essential before trusting identity.
- Platform policy changes frequently—monitor developer changelog.

#### Best Practices

- Request least-permission scopes.
- Implement data deletion webhook.
- Cache profile fetches appropriately.

#### Common Mistakes

- Assuming email is always present or verified.
- Using deprecated API versions without migration.
- Storing long-lived tokens without encryption.

---

### 22.5.4 OpenID Connect

#### Beginner

**OIDC** builds on OAuth2 and adds **ID Token** (JWT) and **UserInfo** endpoint. **Standard claims** like `sub`, `name`, `email` ease interoperable login.

#### Intermediate

Use **`openid-client`** or provider SDKs for **discovery** (`.well-known/openid-configuration`), **nonce**, **state**, and **token validation**. Your GraphQL layer can accept **Bearer access tokens** issued alongside ID tokens for API calls.

#### Expert

**RP-initiated logout**, **session management** (`check_session_iframe`), and **front-channel/back-channel logout** matter for enterprise SSO. Map **`acr_values`** for step-up authentication requirements.

```javascript
import { Issuer } from "openid-client";

const issuer = await Issuer.discover("https://login.microsoftonline.com/{tenant}/v2.0");
const client = new issuer.Client({
  client_id: process.env.OIDC_CLIENT_ID,
  client_secret: process.env.OIDC_CLIENT_SECRET,
  redirect_uris: ["https://app.example.com/callback"],
});
```

```graphql
type User {
  sub: String!
  email: String
}
```

#### Key Points

- OIDC standardizes identity; OAuth2 alone does not.
- ID token is for the client; access token is for resource APIs.
- Discovery document reduces configuration drift.

#### Best Practices

- Validate `nonce` in ID token for implicit/hybrid flows.
- Support key rotation via JWKS.
- Align clock skew between services.

#### Common Mistakes

- Using ID token as bearer to your API without audience checks meant for API resource.
- Skipping `nonce` allowing replay in some configurations.
- Hardcoding endpoints instead of discovery.

---

### 22.5.5 Multi-Provider Setup

#### Beginner

Support **Google**, **GitHub**, **email/password**, etc. **Link** multiple provider identities to one internal **user** record via a **`accounts`** table (`provider`, `providerUserId`, `userId`).

#### Intermediate

Prevent **account takeover**: when linking, require **logged-in** session or **email verification** flow. Show **connected accounts** in settings; allow **unlink** if at least one login method remains.

#### Expert

**Canonical email** matching is risky—prefer explicit **link** confirmations. **SAML** enterprise IdPs alongside social login need unified **`sub`** mapping and **audit** logs for admin merges.

```javascript
async function linkProvider(userId, provider, profile) {
  await db.accounts.upsert({
    where: { provider_providerUserId: { provider, providerUserId: profile.id } },
    create: { userId, provider, providerUserId: profile.id },
    update: {},
  });
}
```

```graphql
type Account {
  provider: String!
  providerUserId: String!
}

type User {
  accounts: [Account!]!
}
```

#### Key Points

- One internal user, many external identities.
- Linking flows are security-sensitive—require strong proof.
- Schema can expose linked providers for UX without exposing secrets.

#### Best Practices

- Unique constraint on (`provider`, `providerUserId`).
- Metrics on failed link attempts.
- Admin tools for split/merge with approval workflow.

#### Common Mistakes

- Auto-merge by email without verification → account takeover.
- Allowing unlink of last credential strand.
- Inconsistent `sub` handling across providers.

---

## 22.6 Session Management

### 22.6.1 Session Creation

#### Beginner

On successful login, create a **session record** (or regenerate ID), store **user id** and metadata, send **session cookie** to client. Subsequent GraphQL requests include the cookie.

#### Intermediate

**Regenerate** session ID on login to prevent fixation. Store **IP** and **user agent** hashes for anomaly detection. For APIs, sessions may be **stateless JWT** stored in cookies—still set secure flags.

#### Expert

**Partition** session creation by region. **Encrypt** session payloads at rest in cookies if using client-side session stores. Integrate **risk scoring** (new device) before finalizing session.

```javascript
app.post("/login", async (req, res) => {
  const user = await authenticate(req.body);
  req.session.regenerate((err) => {
    if (err) return res.status(500).end();
    req.session.userId = user.id;
    res.json({ ok: true });
  });
});
```

```graphql
type Mutation {
  login(email: String!, password: String!): User!
}
```

#### Key Points

- Session creation is a privilege-changing event—treat carefully.
- Regeneration mitigates fixation attacks.
- Store minimal data in the session blob.

#### Best Practices

- Use server-side sessions for easy revocation.
- Log session creation with non-PII correlation IDs.
- Align session length with product security requirements.

#### Common Mistakes

- Reusing old session after login without regeneration.
- Storing full user objects in session (stale data, size).
- Missing secure cookie flags.

---

### 22.6.2 Session Storage

#### Beginner

**Memory** stores do not scale beyond one process. Use **Redis**, **Memcached**, or **database** for shared session storage in Node clusters.

#### Intermediate

**Serialize** only plain objects. **TTL** aligns with idle timeout. **Encrypt** Redis connections (TLS) in cloud environments. Consider **session versioning** for rolling deploys.

#### Expert

**Sticky sessions** without shared store fail on deploys. **Read-your-writes** consistency: session write must be visible before GraphQL response returns. **Multi-region** active-active needs replicated store or centralized session authority.

```javascript
import RedisStore from "connect-redis";
import session from "express-session";

app.use(
  session({
    store: new RedisStore({ client: redisClient, prefix: "sess:" }),
    secret: process.env.SESSION_SECRET,
    name: "sid",
    resave: false,
    saveUninitialized: false,
  })
);
```

```graphql
type Query {
  me: User
}
```

#### Key Points

- Shared store is required for horizontal scaling.
- Prefix keys to avoid collisions with other Redis data.
- Session store downtime impacts all authenticated traffic.

#### Best Practices

- Monitor Redis memory and eviction policies.
- Use connection pooling and timeouts appropriate to traffic.
- Backup strategy if sessions carry billing-critical state (usually avoid).

#### Common Mistakes

- Default memory store in production cluster.
- No TTL → orphaned sessions forever.
- Storing PCI or highly sensitive data in session JSON.

---

### 22.6.3 Session Validation

#### Beginner

On each request, load session by ID from store; if missing or invalid, user is anonymous. Attach to GraphQL `context`.

#### Intermediate

Validate **fingerprint** changes (optional): sudden user-agent or IP shift may trigger **step-up** auth. **Double-submit** cookie pattern for CSRF if using cookies with mutations.

#### Expert

**Concurrent session** caps: reject new session if over limit, or evict oldest. **Geo** anomalies feed risk engine. For **JWT-in-cookie**, validate signature on every request similarly.

```javascript
function sessionUserMiddleware(req, res, next) {
  if (req.session.userId) {
    req.graphqlContext = { userId: req.session.userId };
  } else {
    req.graphqlContext = {};
  }
  next();
}
```

```graphql
type Query {
  me: User
}
```

#### Key Points

- Validation must be fast—session store latency is on critical path.
- Fingerprinting can frustrate mobile users—tune carefully.
- Consistent anonymous vs authenticated context prevents logic bugs.

#### Best Practices

- Cache user row separately if session only stores `userId`.
- Rate-limit anonymous sessions creation (bot defense).
- Audit admin impersonation sessions distinctly.

#### Common Mistakes

- Trusting `userId` in session without checking account status (disabled user).
- Ignoring session store errors and treating as logged out silently without metrics.
- Different validation for HTTP and WS without documentation.

---

### 22.6.4 Session Expiration

#### Beginner

**Absolute** timeout: max session lifetime. **Idle** timeout: no activity window. Both can apply together—whichever comes first wins.

#### Intermediate

Express **rolling** option refreshes `maxAge` on each response. For GraphQL, decide if every **subscription** event counts as activity. Communicate **session expiry** to frontend for re-auth prompts.

#### Expert

**Sliding** vs **fixed** windows affect security/compliance (PCI, HIPAA). **Remember me** uses longer-lived refresh with separate risk acceptance. **Server-side** forced expiry on password reset must delete or invalidate sessions immediately.

```javascript
app.use(
  session({
    cookie: { maxAge: 1000 * 60 * 30 },
    rolling: true,
  })
);
```

```graphql
type Query {
  sessionInfo: SessionInfo
}

type SessionInfo {
  expiresAt: String
}
```

#### Key Points

- Expiration reduces stolen session utility.
- Rolling sessions improve UX but extend exposure while active.
- Security events should truncate all sessions for that user.

#### Best Practices

- Document timeouts in user-facing security pages.
- Align idle timeout with access token TTL if hybrid.
- Test timezone/DST edge cases in expiry displays.

#### Common Mistakes

- Infinite sessions for “convenience.”
- Not invalidating sessions on logout or password change.
- Showing misleading “logged in” UI when session already server-expired.

---

### 22.6.5 Session Cleanup

#### Beginner

**Delete** expired sessions from DB/Redis. Redis TTL on keys automates cleanup. For DB, run **cron** jobs to purge old rows.

#### Intermediate

**Logout** should `destroy` session and clear cookie. **Bulk** cleanup after user deletion (GDPR). **Orphan** sessions when user row deleted—foreign key or periodic sweep.

#### Expert

**Telemetry** on session table growth. **Archive** cold sessions for fraud investigations if policy allows. **Distributed** cleanup: shard by user id to avoid single huge deletes.

```javascript
req.logout?.((err) => {
  req.session.destroy(() => {
    res.clearCookie("sid", { path: "/", httpOnly: true, secure: true });
    res.json({ ok: true });
  });
});
```

```graphql
type Mutation {
  logout: Boolean!
}
```

#### Key Points

- Automated cleanup prevents unbounded storage growth.
- User-initiated logout is part of cleanup semantics.
- Compliance may require provable deletion.

#### Best Practices

- Batch deletes with limits to avoid DB locks.
- Monitor cleanup job failures.
- Document retention for security investigations.

#### Common Mistakes

- Relying on manual DB maintenance.
- Clearing client cookie without server session delete.
- Deleting sessions that active WebSockets still assume valid.

---

## 22.7 Advanced Authentication

### 22.7.1 Multi-Factor Authentication

#### Beginner

**MFA** requires two or more factors: password + **TOTP** app, **SMS** (weaker), **push**, or **WebAuthn**. After password check, challenge second factor before issuing full session/tokens.

#### Intermediate

Use **`speakeasy`** or **`otplib`** for TOTP, store **secret** encrypted. Provide **backup codes** hashed once. GraphQL: `enableMfa`, `verifyMfa`, `disableMfa` mutations with **step-up** token requirement.

#### Expert

**WebAuthn** (FIDO2) for phishing-resistant MFA. **Risk-based** MFA triggers only on suspicious logins. **AMR** claim in OIDC communicates authentication methods to downstream GraphQL authorization.

```javascript
import { authenticator } from "otplib";

function verifyTotp(secret, token) {
  authenticator.options = { window: 1 };
  return authenticator.verify({ token, secret });
}
```

```graphql
type Mutation {
  enableMfa: MfaSetup!
  verifyMfa(code: String!): Boolean!
}
```

#### Key Points

- MFA dramatically reduces credential stuffing success.
- SMS OTP is vulnerable to SIM swap—prefer TOTP/WebAuthn.
- Backup codes must be hashed like passwords.

#### Best Practices

- Enroll flows should confirm existing password or session.
- Rate-limit MFA attempts; lockouts with recovery paths.
- Log MFA enrollment changes prominently.

#### Common Mistakes

- Allowing MFA disable without strong verification.
- Storing TOTP secrets in plaintext.
- No brute-force protection on 6-digit codes.

---

### 22.7.2 Passwordless Authentication

#### Beginner

**Magic links** emailed to users contain one-time tokens; clicking logs them in. **OTP via email/SMS** similar. No permanent password stored.

#### Intermediate

Tokens must be **single-use**, **short-lived**, and **hashed** in DB. GraphQL mutation `requestMagicLink(email)` + `consumeMagicLink(token)` or REST callback that sets session.

#### Expert

**Phishing** risk: train users to recognize domain. **Device binding** via cookies reduces token forwarding abuse. **WebAuthn** passkeys are a modern passwordless standard with stronger phishing resistance.

```javascript
import crypto from "crypto";

function createMagicLinkToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function storeMagicLinkToken(hash, userId, expiresAt) {
  await db.magicTokens.create({ data: { hash, userId, expiresAt } });
}
```

```graphql
type Mutation {
  requestMagicLink(email: String!): Boolean!
  verifyMagicLink(token: String!): AuthPayload!
}
```

#### Key Points

- Passwordless reduces password reuse and database breach impact.
- Email/SMS delivery is part of your security boundary.
- Tokens must be hashed at rest.

#### Best Practices

- Constant-time comparison of tokens.
- Generic response for unknown emails to limit enumeration (business tradeoff).
- Invalidate pending tokens on new request.

#### Common Mistakes

- Long-lived magic links.
- Returning different messages revealing account existence.
- Logging full magic link URLs.

---

### 22.7.3 Biometric Authentication

#### Beginner

**Face ID** / **Touch ID** unlock **keys** on device; servers rarely see biometrics. Typical pattern: device performs **WebAuthn** or platform key attestation, server verifies **assertion**.

#### Intermediate

Do not transmit raw biometric templates to GraphQL. Use **OS APIs** that only expose success/failure and cryptographic signatures. Pair with **user verification** flags in WebAuthn.

#### Expert

**Attestation** policies for corporate devices. **Biometric change** events should re-prompt or re-enroll WebAuthn credentials. Compliance: store only **credential public keys**, not biometrics.

```javascript
// Server verifies WebAuthn assertion (pseudo-structure)
import { verifyAuthenticationResponse } from "@simplewebauthn/server";

async function verifyAssertion(response, expectedChallenge, credential) {
  return verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: "https://app.example.com",
    expectedRPID: "app.example.com",
    credential,
  });
}
```

```graphql
type Mutation {
  webAuthnFinish(assertion: JSON!): AuthPayload!
}
```

#### Key Points

- Biometrics stay on device; cryptography crosses the wire.
- WebAuthn is the web-standard way to integrate securely.
- Fallbacks matter when biometrics unavailable.

#### Best Practices

- Offer alternative factors for account recovery.
- Record credential `aaguid` for support diagnostics minimally.
- Follow SimpleWebAuthn or FIDO reference implementations.

#### Common Mistakes

- Claiming “we store fingerprints” server-side.
- Skipping origin/RP ID checks on assertions.
- No recovery path when device lost.

---

### 22.7.4 Hardware Tokens

#### Beginner

**YubiKey** and similar devices provide **OTP** or **FIDO** credentials. Users prove possession by tapping the token.

#### Intermediate

**U2F/FIDO2** integrates via WebAuthn. For **HOTP/TOTP** hardware, treat like software TOTP with same server validation. Backup device enrollment recommended.

#### Expert

**PIV** smart cards for enterprise, often via mutual TLS terminating at gateway then passing **client cert** identity to GraphQL context. **FIPS** requirements may mandate specific token models.

```javascript
// Client cert forwarded as headers after TLS termination (conceptual)
function userFromClientCert(req) {
  const serial = req.headers["x-ssl-client-cert-serial"];
  const dn = req.headers["x-ssl-client-dn"];
  if (!serial) return null;
  return mapCertToUser({ serial, dn });
}
```

```graphql
type Query {
  me: User
}
```

#### Key Points

- Hardware keys resist remote phishing better than SMS.
- Enterprise deployments often combine with MDM policies.
- Certificate headers must come only from trusted proxy.

#### Best Practices

- Enroll two hardware keys when possible.
- Revoke credentials on HR offboarding immediately.
- Document support for various authenticator types.

#### Common Mistakes

- Trusting client-supplied certificate headers from the public internet without mTLS at edge.
- No backup factor leading to lockouts.
- Confusing OTP display devices with FIDO security keys behavior.

---

### 22.7.5 Certificate-Based Authentication

#### Beginner

**Mutual TLS (mTLS)**: client presents **X.509 certificate** during TLS handshake; server verifies chain and maps **subject** to user/service account.

#### Intermediate

Terminate mTLS at **load balancer** or **API gateway**, forward verified identity via **trusted internal headers** to Node GraphQL. Rotate **CAs** and publish **CRL/OCSP** checks or short-lived certs.

#### Expert

**SPIFFE/SVID** identities for service meshes simplify cert issuance and rotation. **GraphQL federation** subgraphs authenticate to router via mTLS; external users use OAuth at the edge.

```javascript
// Express behind nginx with ssl_client_verify
app.use((req, res, next) => {
  const verified = req.get("X-Client-Verify") === "SUCCESS";
  const dn = req.get("X-Client-DN");
  if (verified && dn) req.clientCertDN = dn;
  next();
});
```

```graphql
type Query {
  internalHealth: String!
}
```

#### Key Points

- mTLS is strong for B2B and service-to-service GraphQL.
- Never accept cert DN headers from untrusted clients.
- Lifecycle management (issuance, renewal, revocation) is operationally heavy.

#### Best Practices

- Automate cert renewal (ACME for public, internal PKI for private).
- Map certificates to accounts via stable identifiers, not display names.
- Monitor upcoming expirations aggressively.

#### Common Mistakes

- Forwarding cert headers from user-controlled requests.
- Weak private key storage on client devices.
- No revocation checking beyond expiry.

---
