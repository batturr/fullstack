# Next.js Topic 17 — Authentication

End-to-end authentication patterns for Next.js (App Router and Pages Router): sessions, JWTs, cookies, OAuth/OIDC, Auth.js (NextAuth), protected routes, custom auth, and third-party providers. Examples reference e-commerce checkout, SaaS dashboards, blogs with comments, social feeds, and B2B admin tools. All snippets use TypeScript.

## 📑 Table of Contents

- [17.1 Authentication Basics](#171-authentication-basics)
- [17.2 Auth.js / NextAuth.js](#172-authjs--nextauthjs)
- [17.3 Auth with App Router](#173-auth-with-app-router)
- [17.4 Auth with Pages Router](#174-auth-with-pages-router)
- [17.5 Protected Routes](#175-protected-routes)
- [17.6 Custom Authentication](#176-custom-authentication)
- [17.7 Third-Party Auth Services](#177-third-party-auth-services)
- [Document-Wide Best Practices](#document-wide-best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 17.1 Authentication Basics

### 17.1.1 Overview

**Beginner Level**  
Authentication answers “Who is this user?” After login, your app knows the shopper’s account so it can show orders. Authorization (permissions) is the next step: “What may they do?”

**Intermediate Level**  
In Next.js, auth can run in Middleware (edge), Route Handlers / API routes (server), Server Components (no secrets leaked to client), and Client Components (interactive login UI). Threat model: XSS steals tokens in `localStorage`; `httpOnly` cookies reduce impact when combined with CSRF protections for state-changing operations.

**Expert Level**  
For multi-tenant SaaS, combine organization IDs in session claims with row-level security in Postgres. Prefer short-lived access tokens + rotating refresh stored server-side or in secure cookies. Align with OWASP ASVS for session fixation, brute-force throttling, and secure password storage (argon2/bcrypt with proper work factors).

```typescript
// types/auth.ts — shared session shape (example)
export type UserRole = "customer" | "merchant" | "admin";

export type AppUser = {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  orgId?: string;
};

export type AuthSession = {
  user: AppUser;
  expires: string;
};
```

**Key Points**

- Separate identification (auth) from authorization (RBAC/ABAC).
- Decide where session state lives early: cookie session vs JWT vs external IdP.

### 17.1.2 Session-Based Authentication

**Beginner Level**  
After login, the server stores session data (often in Redis or a database) and sends the browser a small session ID cookie. Each request sends the cookie; the server looks up the session—like a coat-check ticket for a mall e-commerce site.

**Intermediate Level**  
Use `httpOnly`, `Secure`, `SameSite` flags. For Next.js Route Handlers, set cookies with `cookies().set` (App Router) or `res.setHeader('Set-Cookie', ...)` patterns. Rotate session ID on privilege elevation to prevent fixation.

**Expert Level**  
Sticky sessions vs centralized session store: serverless favors external stores (Redis, DynamoDB). Encrypt session blobs at rest; sign cookies if using stateless encrypted sessions (JWT-as-session) with short TTL and revocation strategy.

```typescript
// lib/session-cookie.ts
import { cookies } from "next/headers";

export const SESSION_COOKIE = "app_session";

export type SessionPayload = {
  sub: string;
  orgId?: string;
};

export async function readSessionCookie(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  // Verify signature / decrypt, handle errors
  return verifySessionToken(token);
}

function verifySessionToken(_token: string): SessionPayload | null {
  // Implement HMAC/JWE verification — placeholder
  return null;
}
```

**Key Points**

- Server-side sessions simplify revocation (delete row).
- Cookie attributes are security-critical—never skip `Secure` in production.

### 17.1.3 Token-Based (JWT)

**Beginner Level**  
A JWT is a signed JSON object the client sends on each API call—often in `Authorization: Bearer`. Good for mobile or SPAs talking to many APIs.

**Intermediate Level**  
Avoid storing long-lived JWTs in `localStorage` for web due to XSS. Prefer `httpOnly` cookies for browser apps or split: short-lived JWT in memory + refresh cookie. Include `exp`, `iat`, `iss`, `aud` claims; use asymmetric keys (RS256) when multiple services verify.

**Expert Level**  
Implement key rotation with `kid` headers, denylist for compromised tokens, and narrow scopes per microservice. For Next.js BFF pattern, keep JWT verification on the server only; Client Components receive opaque session summaries.

```typescript
// lib/jwt.ts
import type { AppUser } from "@/types/auth";

export type AccessTokenClaims = {
  sub: string;
  email: string;
  role: AppUser["role"];
  exp: number;
};

export function decodeJwtUnsafe(token: string): AccessTokenClaims | null {
  const [, payload] = token.split(".");
  if (!payload) return null;
  try {
    const json = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(json) as AccessTokenClaims;
  } catch {
    return null;
  }
}
```

**Key Points**

- JWTs are not inherently sessions—revocation needs extra design.
- Always verify signatures server-side; never trust client-decoded payloads alone.

### 17.1.4 Cookie-Based (Browser Sessions)

**Beginner Level**  
Cookies are key-value pairs the browser stores and sends automatically to your domain—ideal for “remember me” on a blog commenter account.

**Intermediate Level**  
Use `SameSite=Lax` for typical sites; `Strict` for high-security admin; `None` + `Secure` only for cross-site flows (embedded widgets, some OAuth callbacks). Partitioned cookies (CHIPS) help third-party embed scenarios.

**Expert Level**  
Double-submit cookie CSRF defense for cookie-authenticated POST from untrusted origins; synchronize token in header vs cookie for SPA mutations. Next.js Middleware can refresh sliding expiration on each navigation.

```typescript
// middleware.ts (sketch — refresh sliding session)
import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = req.cookies.get("app_session");
  if (session) {
    res.cookies.set({
      name: "app_session",
      value: session.value,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  return res;
}

export const config = { matcher: ["/app/:path*"] };
```

**Key Points**

- Treat cookies as secrets-in-transport—always HTTPS.
- Document cookie names and lifetimes for security review.

### 17.1.5 OAuth 2.0 / OpenID Connect (OIDC)

**Beginner Level**  
“Sign in with Google” uses OAuth/OIDC: you redirect users to Google, they approve, Google sends your app a code you exchange for tokens.

**Intermediate Level**  
OIDC adds identity layer (`id_token` with user claims) on top of OAuth 2.0. Use PKCE for public clients (SPAs, mobile). Validate `state` and `nonce` to prevent CSRF and token injection.

**Expert Level**  
For enterprise SaaS, support SAML bridges via IdPs (Okta, Azure AD) mapping to OIDC in Auth0/Clerk or custom brokers. Store refresh tokens server-side; use rotating refresh tokens (RFC 6819, OAuth 2.1 guidance).

```typescript
// app/api/oauth/google/start/route.ts (illustrative types)
import { NextResponse } from "next/server";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.APP_URL}/api/oauth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state: crypto.randomUUID(),
    code_challenge: "…",
    code_challenge_method: "S256",
  });
  return NextResponse.redirect(`${AUTH_URL}?${params.toString()}`);
}
```

**Key Points**

- Never handle OAuth secrets in Client Components.
- Prefer battle-tested libraries (Auth.js, vendor SDKs) over raw OAuth in most apps.

---

## 17.2 Auth.js / NextAuth.js

### 17.2.1 Setup

**Beginner Level**  
Install `next-auth` (v4) or `next-auth@beta` / `@auth/core` patterns for v5 (Auth.js). Add environment variables for providers and `NEXTAUTH_SECRET`.

**Intermediate Level**  
Place route handler at `app/api/auth/[...nextauth]/route.ts` (v5) or `pages/api/auth/[...nextauth].ts` (v4). Configure `trustHost` for Vercel preview URLs.

**Expert Level**  
Split configs per environment; use encrypted env in CI; rotate `NEXTAUTH_SECRET` with dual-key acceptance during rotation windows.

```typescript
// auth.config.ts (Auth.js v5 style — illustrative)
import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

export const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  trustHost: true,
} satisfies NextAuthConfig;
```

**Key Points**

- Match docs to your installed major version (v4 vs v5 differ).
- `NEXTAUTH_URL` / `AUTH_URL` must reflect public origin.

### 17.2.2 `[...nextauth]` Route Handler

**Beginner Level**  
Catch-all route handles `/api/auth/signin`, `/api/auth/callback/:provider`, `/api/auth/session`.

**Intermediate Level**  
Export `GET` and `POST` from `route.ts` delegating to `handlers` from `auth.ts` in v5.

**Expert Level**  
Customize pages (`signIn`, `error`) for branded SaaS flows; instrument with OpenTelemetry on auth failures without logging secrets.

```typescript
// app/api/auth/[...nextauth]/route.ts (v5 sketch)
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

```typescript
// auth.ts (v5 sketch)
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
```

**Key Points**

- Keep handler file thin—logic belongs in `auth.config` / callbacks.
- Test callbacks locally with HTTPS tunnel if providers require it.

### 17.2.3 Providers — Email

**Beginner Level**  
Magic link email login: user enters email, receives link, clicks to sign in—great for a low-friction blog newsletter portal.

**Intermediate Level**  
Use Auth.js Email provider with SMTP or Resend/SendGrid adapters; throttle sends to prevent abuse.

**Expert Level**  
Bind tokens to IP/user-agent loosely, short TTL, single-use tokens stored hashed. Monitor bounce rates and spam complaints.

```typescript
// providers fragment
import EmailProvider from "next-auth/providers/email";

EmailProvider({
  server: process.env.EMAIL_SERVER,
  from: process.env.EMAIL_FROM,
}),
```

**Key Points**

- Email deliverability is production work—verify domains (SPF/DKIM).
- Provide fallback support path when users lose access to email.

### 17.2.4 Providers — Credentials

**Beginner Level**  
Username/password checked against your database—classic e-commerce account login.

**Intermediate Level**  
In `authorize`, query user, compare password with argon2/bcrypt, return user object or `null`. Never throw raw DB errors to clients.

**Expert Level**  
Add rate limiting (Upstash Redis), CAPTCHA after failures, and credential stuffing detection. Consider WebAuthn passkeys as upgrade path.

```typescript
import Credentials from "next-auth/providers/credentials";
import type { AppUser } from "@/types/auth";

Credentials({
  name: "Credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials): Promise<AppUser | null> {
    if (!credentials?.email || !credentials.password) return null;
    // const user = await findUser(credentials.email);
    // if (!user) return null;
    // const ok = await verifyPassword(user, credentials.password);
    // return ok ? { id: user.id, email: user.email, role: user.role } : null;
    return null;
  },
}),
```

**Key Points**

- Credentials provider bypasses some OAuth safety nets—harden everything.
- Combine with CSRF protection on the login form POST.

### 17.2.5 Providers — Google / GitHub / Others

**Beginner Level**  
OAuth providers let users skip passwords—common for developer dashboards (GitHub) or consumer apps (Google).

**Intermediate Level**  
Request minimal scopes; verify email_verified claim before trusting email as identifier.

**Expert Level**  
Map external `sub` to internal user rows; handle account linking when the same email exists from another provider.

```typescript
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

Google({
  clientId: process.env.AUTH_GOOGLE_ID!,
  clientSecret: process.env.AUTH_GOOGLE_SECRET!,
  allowDangerousEmailAccountLinking: false,
}),
GitHub({
  clientId: process.env.AUTH_GITHUB_ID!,
  clientSecret: process.env.AUTH_GITHUB_SECRET!,
}),
```

**Key Points**

- Register redirect URIs exactly in provider consoles.
- Document which providers are enabled per environment (staging vs prod).

### 17.2.6 Session Management

**Beginner Level**  
Session holds user info after login. Auth.js exposes `/api/auth/session` JSON for client hooks.

**Intermediate Level**  
Use `callbacks.session` to inject `role` and `orgId` from database into the session object.

**Expert Level**  
Implement idle timeout vs absolute timeout; track concurrent sessions for enterprise “logout all devices”.

```typescript
// callbacks fragment (conceptual)
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.role = (user as AppUser).role;
      token.orgId = (user as AppUser).orgId;
    }
    return token;
  },
  async session({ session, token }) {
    session.user.role = token.role as AppUser["role"];
    session.user.orgId = token.orgId as string | undefined;
    return session;
  },
},
```

**Key Points**

- JWT sessions are stateless—plan revocation carefully.
- Database sessions give easier audit trails for B2B.

### 17.2.7 JWT Strategy

**Beginner Level**  
JWT strategy stores session in an encrypted/signed cookie—scales well on serverless.

**Intermediate Level**  
Customize `jwt` callback to add claims; set `maxAge` and `updateAge` for sliding windows.

**Expert Level**  
If you need immediate permission revocation, shorten JWT TTL and revalidate critical actions server-side against DB/Redis.

```typescript
session: {
  strategy: "jwt",
  maxAge: 60 * 60 * 8, // 8 hours
  updateAge: 60 * 15, // refresh every 15 minutes of activity
},
```

**Key Points**

- Understand size limits of cookies with large JWT payloads.
- Avoid putting PII you would not want client-readable in JWT claims (even if signed).

### 17.2.8 Database Adapters

**Beginner Level**  
Adapters persist users, accounts, sessions in SQL/NoSQL—needed for email magic links and multi-account linking in many setups.

**Intermediate Level**  
Use Prisma adapter with Auth.js schema; run migrations for `User`, `Account`, `Session`, `VerificationToken`.

**Expert Level**  
Shard user tables by region for global social apps; replicate read models for analytics without touching auth path.

```prisma
// prisma/schema.prisma (excerpt — illustrative)
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

**Key Points**

- Keep adapter schema upgrades in lockstep with Auth.js releases.
- Backup before migrations affecting auth tables.

---

## 17.3 Auth with App Router

### 17.3.1 Server Component Auth

**Beginner Level**  
Server Components run on the server—they can read cookies and sessions directly to personalize a product page.

**Intermediate Level**  
Call `auth()` from Auth.js v5 in layouts/pages to fetch session without client JS.

**Expert Level**  
Combine with React `cache()` for per-request deduplication when multiple components need the same session lookup.

```typescript
// app/(shop)/account/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/account");

  return (
    <main>
      <h1>Welcome, {session.user.email}</h1>
    </main>
  );
}
```

**Key Points**

- Never pass raw tokens to Client Components unnecessarily.
- Use `redirect()` for auth gates in RSC.

### 17.3.2 `getServerSession` (Pages / legacy patterns)

**Beginner Level**  
`getServerSession` reads session in `getServerSideProps` or API routes—still relevant in hybrid codebases.

**Intermediate Level**  
Pass the same `authOptions` object used by the NextAuth handler to avoid subtle mismatches.

**Expert Level**  
Wrap in helper `getCurrentUser()` that maps session to domain `AppUser` and logs audit metadata.

```typescript
// lib/auth-server.ts (Pages Router era helper)
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}
```

**Key Points**

- In pure App Router + Auth.js v5, prefer `auth()`.
- Centralize options import to prevent drift.

### 17.3.3 Protecting Routes (RSC)

**Beginner Level**  
Check session in `layout.tsx` for `/dashboard` segment to block guests.

**Intermediate Level**  
Use nested layouts for role-based areas (`(admin)` route group).

**Expert Level**  
For fine-grained entitlements, fetch permissions from DB in layout (cached) and pass serializable props to children—avoid N+1 session queries.

```typescript
// app/(app)/dashboard/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/dashboard");
  return <div className="dashboard-shell">{children}</div>;
}
```

**Key Points**

- Combine layout checks with Middleware for edge caching of redirects when appropriate.
- Keep unauthorized UX consistent (toast vs redirect).

### 17.3.4 Middleware Auth

**Beginner Level**  
Middleware runs before a request completes—good for fast redirects when cookies are missing.

**Intermediate Level**  
Use `NextRequest` cookies; avoid heavy DB calls—validate signature only or hit edge KV.

**Expert Level**  
Matcher patterns should exclude static assets; compose with i18n and bot protection; be careful with infinite redirect loops on `/login`.

```typescript
// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";

export default auth((req: NextRequest & { auth: unknown }) => {
  const isApp = req.nextUrl.pathname.startsWith("/app");
  if (isApp && !req.auth) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = { matcher: ["/app/:path*"] };
```

**Key Points**

- Middleware cannot use Node-only APIs in Edge runtime by default.
- Test matcher coverage for API routes vs pages.

### 17.3.5 Client Component Auth

**Beginner Level**  
Use `useSession` (v4) or session fetch hooks for interactive UI like showing an avatar menu in a social app header.

**Intermediate Level**  
Wrap with `SessionProvider` in a client provider file imported from root layout.

**Expert Level**  
Derive minimal client state from server; refetch session after mutations (role changes) via `router.refresh()` in App Router.

```tsx
// components/shell/UserMenu.tsx
"use client";

import { useSession, signOut } from "next-auth/react";

export function UserMenu() {
  const { data, status } = useSession();

  if (status === "loading") return <span>…</span>;
  if (!data?.user) return null;

  return (
    <div>
      <span>{data.user.email}</span>
      <button type="button" onClick={() => signOut({ callbackUrl: "/" })}>
        Sign out
      </button>
    </div>
  );
}
```

**Key Points**

- Treat client session as a hint—re-validate on server for protected actions.
- Avoid storing secrets in client state.

---

## 17.4 Auth with Pages Router

### 17.4.1 `useSession` (Client)

**Beginner Level**  
`useSession` returns `{ data, status }` to show login/logout in a blog navbar.

**Intermediate Level**  
Set `refetchInterval` for sensitive apps to pick up server-side session invalidation faster.

**Expert Level**  
Combine with React Query for user profile enrichment while keeping Auth.js session as source of truth for authn.

```tsx
"use client";

import { useSession } from "next-auth/react";

export function BlogNavAuth() {
  const { data, status } = useSession();
  if (status === "unauthenticated") return <a href="/api/auth/signin">Sign in to comment</a>;
  return <span>Hi {data?.user?.name}</span>;
}
```

**Key Points**

- Wrap `_app.tsx` with `SessionProvider`.
- Handle loading and error states explicitly.

### 17.4.2 `getSession` (Client / universal fetch)

**Beginner Level**  
`getSession()` fetches current session JSON—useful outside React hooks (e.g., after OAuth popup).

**Intermediate Level**  
Prefer `getCsrfToken` + POST flows when building custom forms against Auth.js endpoints.

**Expert Level**  
Avoid calling `getSession` in tight loops; cache result per navigation in custom routers.

```typescript
import { getSession } from "next-auth/react";

export async function clientEnsureSession() {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  return session;
}
```

**Key Points**

- `getSession` hits the network—mind latency on mobile.
- Align with CORS and cookie `SameSite` when using subdomains.

### 17.4.3 `getServerSession` (Server)

**Beginner Level**  
Use inside `getServerSideProps` to server-render a SaaS settings page with user data.

**Intermediate Level**  
Return `notFound` or `redirect` props pattern for unauthorized access.

**Expert Level**  
Batch DB queries after session validation in parallel `Promise.all` for TTFB.

```typescript
// pages/dashboard.tsx
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: { user: session.user } };
};

export default function Dashboard({ user }: { user: { email?: string | null } }) {
  return <h1>{user.email}</h1>;
}
```

**Key Points**

- Pass `req`/`res` into `getServerSession` for correct cookie parsing.
- Type props with your `AppUser` shape.

### 17.4.4 HOC for Auth

**Beginner Level**  
Higher-order components wrap pages to require login—reduces duplication across a marketing + app split.

**Intermediate Level**  
Compose `withAuth(Page, { roles: ['admin'] })` for RBAC.

**Expert Level**  
Prefer layouts in App Router over HOCs for new code; HOCs remain useful in legacy Pages apps.

```typescript
// lib/withAuth.tsx
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import type { ReactNode } from "react";

export function withAuth<P>(Component: NextPage<P>): NextPage<P> {
  const Wrapped: NextPage<P> = (props) => {
    const { status } = useSession();
    const router = useRouter();

    if (status === "loading") return null as unknown as ReactNode;
    if (status === "unauthenticated") {
      void router.replace("/login");
      return null as unknown as ReactNode;
    }
    return <Component {...props} />;
  };
  Wrapped.displayName = `withAuth(${Component.displayName ?? Component.name ?? "Page"})`;
  return Wrapped;
}
```

**Key Points**

- HOC + `getServerSideProps` both may be needed for true protection (client HOC alone is not enough).

---

## 17.5 Protected Routes

### 17.5.1 Server-Side Protection

**Beginner Level**  
Check auth before rendering sensitive HTML—users never see admin HTML in view source if redirected.

**Intermediate Level**  
Use RSC `auth()` or `getServerSession` + `redirect`.

**Expert Level**  
Add audit logs on denied attempts with request IDs; rate limit brute forcing of protected SSR pages.

```typescript
// app/(admin)/admin/page.tsx
import { auth } from "@/auth";
import { forbidden, redirect } from "next/navigation";

export default async function AdminHome() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") forbidden();
  return <h1>Admin</h1>;
}
```

**Key Points**

- Server protection is mandatory for security; client-only guards are UX helpers.

### 17.5.2 Client-Side Protection

**Beginner Level**  
Hide buttons for guests in a social app—faster feedback than waiting for server.

**Intermediate Level**  
Pair with server checks—never rely on client alone.

**Expert Level**  
Use optimistic UI only for non-security actions; gate purchases with server validation.

```tsx
"use client";

import { useSession } from "next-auth/react";

export function FollowButton({ userId }: { userId: string }) {
  const { status } = useSession();
  if (status !== "authenticated") return <a href="/login">Log in to follow</a>;
  return (
    <form action={`/api/social/${userId}/follow`} method="post">
      <button type="submit">Follow</button>
    </form>
  );
}
```

**Key Points**

- Client guards improve UX, not security.

### 17.5.3 Middleware Protection

**Beginner Level**  
Block `/app` routes without session cookie at the edge.

**Intermediate Level**  
Whitelist public API routes; exclude `_next/static`.

**Expert Level**  
Combine with geofencing or WAF signals for fraud-sensitive checkout routes.

**Key Points**

- Keep middleware fast—no Prisma in edge unless using edge-compatible driver.

### 17.5.4 RBAC (Role-Based Access Control)

**Beginner Level**  
Roles like `admin`, `editor`, `viewer` control what pages API routes allow—think CMS for a blog network.

**Intermediate Level**  
Encode roles in session claims; map to permissions server-side for each action.

**Expert Level**  
Use attribute-based checks (`orgId`, `subscriptionTier`) with policy engines or OpenFGA-style stores for large SaaS.

```typescript
// lib/rbac.ts
import type { AppUser } from "@/types/auth";

export function canEditPost(user: AppUser, authorId: string): boolean {
  if (user.role === "admin") return true;
  return user.id === authorId;
}
```

```typescript
// app/api/posts/[id]/route.ts (sketch)
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { canEditPost } from "@/lib/rbac";

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  // const post = await getPost(ctx.params.id);
  // if (!post || !canEditPost(session.user, post.authorId)) return NextResponse.json(null, { status: 403 });
  return NextResponse.json({ ok: true });
}
```

**Key Points**

- Default deny; explicit allow per route handler.
- Test RBAC matrix in CI with table-driven tests.

---

## 17.6 Custom Authentication

### 17.6.1 Building Custom Auth

**Beginner Level**  
Roll your own login form posting to a Route Handler that sets a cookie—full control, full responsibility.

**Intermediate Level**  
Hash passwords with argon2id; store only hashes; add email verification and password reset tokens hashed in DB.

**Expert Level**  
Threat model: timing attacks on comparisons—use `crypto.timingSafeEqual`; add device binding and step-up auth for money movement in e-commerce wallets.

```typescript
// app/api/auth/login/route.ts (sketch)
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const json = bodySchema.parse(await req.json());
  // const user = await findUserByEmail(json.email);
  // if (!user || !(await verifyPassword(user, json.password))) {
  //   return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  // }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", "signed-token", { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  return res;
}
```

**Key Points**

- Custom auth is rarely cheaper than Auth.js/Clerk long-term—budget security review.
- Log auth events with structured metadata.

### 17.6.2 Cookie Management

**Beginner Level**  
Set, read, and clear cookies on login/logout for session ID.

**Intermediate Level**  
Use `cookies()` in Server Actions and Route Handlers; sync `maxAge` with refresh policy.

**Expert Level**  
Encrypt cookie payloads with AES-GCM using rotating keys from KMS; store key ID alongside payload.

```typescript
import { cookies } from "next/headers";

export async function destroySession() {
  cookies().set({
    name: "session",
    value: "",
    maxAge: 0,
    path: "/",
  });
}
```

**Key Points**

- Never log raw cookie values.
- Validate cookie integrity before trusting claims.

### 17.6.3 Token Storage

**Beginner Level**  
Do not put long-lived tokens in `localStorage` for typical web apps—use `httpOnly` cookies.

**Intermediate Level**  
If using bearer tokens client-side (mobile/native), use secure storage OS APIs.

**Expert Level**  
For hybrid Next + native, use BFF exchanging refresh for access only server-side.

**Key Points**

- Match storage to threat model (XSS vs CSRF tradeoffs).
- Rotate tokens on password change.

### 17.6.4 Refresh Token

**Beginner Level**  
Short access token + long refresh keeps users signed in while limiting exposure.

**Intermediate Level**  
Store refresh server-side with family IDs to detect reuse attacks.

**Expert Level**  
Implement refresh token rotation (invalidate previous on use); alert user on suspicious reuse.

```typescript
// app/api/auth/refresh/route.ts (illustrative)
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const refresh = req.cookies.get("refresh")?.value;
  if (!refresh) return NextResponse.json({ error: "missing" }, { status: 401 });
  // validate + rotate refresh + issue new access cookie
  return NextResponse.json({ ok: true });
}
```

**Key Points**

- Never expose refresh tokens to JS on the web if avoidable.
- Monitor refresh failure rates.

### 17.6.5 Logout

**Beginner Level**  
Clear session cookie and redirect home—simple blog sign-out.

**Intermediate Level**  
Revoke server session row / denylist JWT `jti` if present.

**Expert Level**  
Propagate logout to IdP (OIDC end_session_endpoint) for SSO environments.

```typescript
// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

export async function POST() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
```

**Key Points**

- Ensure CSRF protection on cookie-authenticated logout POST.
- Clear client caches of user-specific data on logout.

---

## 17.7 Third-Party Auth Services

### 17.7.1 Auth0

**Beginner Level**  
Auth0 hosts login pages and user directory—integrate SDK in Next for quick enterprise SSO.

**Intermediate Level**  
Use `@auth0/nextjs-auth0` with App Router route handlers; configure `AUTH0_SECRET`, domain, client ID.

**Expert Level**  
Organizations feature for B2B tenants; customize actions/rules for claims enrichment; monitor MAU pricing.

```typescript
// conceptual env
// AUTH0_SECRET=...
// AUTH0_BASE_URL=https://app.example.com
// AUTH0_ISSUER_BASE_URL=https://tenant.auth0.com
// AUTH0_CLIENT_ID=...
// AUTH0_CLIENT_SECRET=...
```

**Key Points**

- Great when SAML/OIDC complexity is delegated.
- Keep SDK updated for security patches.

### 17.7.2 Firebase Auth

**Beginner Level**  
Firebase gives email/password and social providers with client SDKs—handy for mobile + web combos.

**Intermediate Level**  
Verify ID tokens in Route Handlers using Firebase Admin SDK; mint your own session cookie after verification.

**Expert Level**  
Watch for client SDK bundle size; isolate Firebase client imports to client components.

```typescript
// lib/firebase-admin.ts (sketch)
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!)),
  });
}

export async function verifyIdToken(token: string) {
  return admin.auth().verifyIdToken(token);
}
```

**Key Points**

- Always verify tokens server-side for protected APIs.
- Understand Firebase pricing and quotas.

### 17.7.3 Clerk

**Beginner Level**  
Clerk provides polished UI components and user management for SaaS apps with minimal code.

**Intermediate Level**  
Use `<ClerkProvider>` in layout; protect routes via `authMiddleware` and `auth()` helpers.

**Expert Level**  
Organizations, roles, and metadata sync webhooks to your DB for entitlements billing.

```tsx
// app/layout.tsx (illustrative)
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

**Key Points**

- Excellent DX—evaluate vendor lock-in vs speed to market.
- Map Clerk user IDs to internal UUIDs in your DB.

### 17.7.4 Supabase Auth

**Beginner Level**  
Supabase Auth pairs with Postgres; magic links and OAuth out of the box for a blog with row-level security.

**Intermediate Level**  
Use `@supabase/ssr` cookie helpers for Next.js App Router; never expose `service_role` key client-side.

**Expert Level**  
RLS policies using `auth.uid()` for multi-user data isolation; JWT claims for `role`.

```typescript
// lib/supabase/server.ts (pattern name only — follow official template)
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });
}
```

**Key Points**

- RLS + Auth is powerful—test policies exhaustively.
- Use server client for protected data operations.

---

## Document-Wide Best Practices

1. **Server-first checks**: Always enforce authorization in Server Components, Route Handlers, or server actions.
2. **Secrets**: Keep OAuth client secrets and JWT private keys only on the server; use env validation (e.g., Zod) at startup.
3. **Cookies**: `httpOnly`, `Secure`, sensible `SameSite`, narrow `Path`, consider `__Host-` prefix for session cookies when appropriate.
4. **CSRF**: Protect cookie-authenticated mutations; Auth.js handles many cases—understand your gaps for custom forms.
5. **Sessions**: Implement idle and absolute timeouts for financial and admin surfaces.
6. **Observability**: Log auth failures with request ID, never log passwords or tokens.
7. **Testing**: Integration tests for login, refresh, logout, RBAC matrix, and OAuth error paths.
8. **UX**: Deep-link returns (`next` param) after login; accessible error messages without leaking which account exists.
9. **Compliance**: GDPR data export/deletion flows when storing PII with adapters.
10. **Upgrades**: Pin and schedule upgrades for auth libraries—security patches are time-sensitive.

---

## Common Mistakes to Avoid

1. Trusting client-side session hooks alone to protect data.
2. Storing JWTs in `localStorage` on the web without a compelling reason.
3. Mismatched `authOptions` between handler and `getServerSession`.
4. Omitting `state`/`nonce` validation in custom OAuth implementations.
5. Logging full cookies or tokens during debugging in production.
6. Infinite redirect loops between Middleware and login page matcher overlap.
7. Exposing database adapter credentials in client bundles via accidental import.
8. Using `allowDangerousEmailAccountLinking` without understanding account takeover risks.
9. Forgetting to rotate `NEXTAUTH_SECRET` compromise response plan.
10. Skipping rate limits on credential login endpoints—credential stuffing is common.
11. Calling external IdPs synchronously inside Server Components without timeouts—can block rendering and hurt TTFB.
12. Reusing the same redirect URI across multiple environments without provider console updates—breaks OAuth in staging.

---

### Quick reference: where to enforce auth

| Surface | Enforce here | Typical pattern |
| --- | --- | --- |
| Page HTML | Server Component / `getServerSideProps` | `auth()` + `redirect()` |
| JSON API | Route Handler / API route | `auth()` + `401`/`403` |
| Edge redirect | Middleware | Cookie presence / JWT signature |
| UX only | Client Component | `useSession`, hide controls (not security) |

---

_End of Topic 17 — Authentication._
