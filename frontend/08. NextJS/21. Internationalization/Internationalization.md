# Internationalization (i18n) in Next.js

This guide covers multilingual apps with the Pages Router, App Router, popular libraries, translation workflows, and production SEO patterns. Examples use TypeScript and realistic domains: e-commerce, blogs, SaaS dashboards, and social feeds.

## 📑 Table of Contents

- [21.1 i18n Basics](#211-i18n-basics)
  - [Overview](#overview)
  - [Locale Detection](#locale-detection)
  - [Language Switching](#language-switching)
  - [next.config.js i18n (Pages Router)](#nextconfigjs-i18n-pages-router)
- [21.2 Built-in i18n Pages Router](#212-built-in-i18n-pages-router)
  - [i18n Routing](#i18n-routing)
  - [Locale in useRouter](#locale-in-userouter)
  - [Sub-path /en /fr](#sub-path-en--fr)
  - [Domain Routing](#domain-routing)
  - [Default Locale](#default-locale)
- [21.3 i18n Libraries](#213-i18n-libraries)
  - [next-intl](#next-intl)
  - [next-i18next](#next-i18next)
  - [react-intl](#react-intl)
  - [i18next](#i18next)
- [21.4 App Router i18n](#214-app-router-i18n)
  - [[lang] Dynamic Segment](#lang-dynamic-segment)
  - [generateStaticParams for Locales](#generatestaticparams-for-locales)
  - [Locale Middleware](#locale-middleware)
  - [Server Component Translations](#server-component-translations)
- [21.5 Translation Management](#215-translation-management)
  - [Translation Files JSON](#translation-files-json)
  - [Translation Keys](#translation-keys)
  - [Interpolation](#interpolation)
  - [Pluralization](#pluralization)
  - [Date and Number Formatting](#date-and-number-formatting)
- [21.6 i18n Best Practices](#216-i18n-best-practices)
  - [SEO Multilingual](#seo-multilingual)
  - [hreflang Tags](#hreflang-tags)
  - [Language Selector UI](#language-selector-ui)
  - [RTL Support](#rtl-support)
  - [File Organization](#file-organization)
- [Key Points (Chapter Summary)](#key-points-chapter-summary)
- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 21.1 i18n Basics

### Overview

**Beginner Level:** Internationalization means preparing your app so text, dates, and numbers can change based on the user’s language (locale), without rewriting the whole UI. A simple e-commerce “Add to cart” button becomes reusable: the *key* stays `cart.add`, while English shows “Add to cart” and French shows “Ajouter au panier”.

**Intermediate Level:** i18n separates *content* from *code*. You store strings in resource files (often JSON), resolve them at runtime using a locale (e.g. `en-US`, `fr-FR`), and keep routing aware of language so URLs and SEO stay correct. Next.js can help with built-in routing (Pages Router) or you implement locale segments in the App Router (`/[lang]/...`).

**Expert Level:** Production systems combine locale negotiation (Accept-Language, cookie, user profile), stable translation keys, ICU-style pluralization, SSR-safe message loading, and CDN caching per locale. You align HTML `lang`, metadata, and `hreflang` so crawlers index each language variant without duplicate-content penalties when configured correctly.

```typescript
// types/locale.ts
export type AppLocale = "en" | "fr" | "de";

export const locales: readonly AppLocale[] = ["en", "fr", "de"] as const;

export const defaultLocale: AppLocale = "en";

export function isAppLocale(value: string): value is AppLocale {
  return (locales as readonly string[]).includes(value);
}
```

**Key Points — Overview**

- Treat locale as first-class data, not a string sprinkled in components.
- Separate keys from copy; never concatenate translated fragments naïvely for grammar-heavy languages.

---

### Locale Detection

**Beginner Level:** When someone opens your blog, the site guesses their language from the browser (e.g. Chrome set to Spanish) or from a saved preference. If you run a travel SaaS, you might default to English but offer Spanish when `Accept-Language` prefers it.

**Intermediate Level:** Detection order is usually: explicit path (`/es/pricing`) → user cookie/session → `Accept-Language` header → default locale. In Next.js middleware you can read `request.headers.get("accept-language")`, parse q-values, and redirect or rewrite to the best supported locale.

**Expert Level:** For logged-in dashboard users, persist `locale` in the profile and override headers. Combine with edge middleware for low latency, but keep SSR and static generation rules in mind—avoid non-deterministic locale for fully static paths unless you accept client-side switching only.

```typescript
// middleware.ts (App Router) — sketch: pick locale from path first, else cookie, else Accept-Language
import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isAppLocale, locales, type AppLocale } from "./types/locale";

const LOCALE_COOKIE = "NEXT_LOCALE";

function pickFromAcceptLanguage(header: string | null): AppLocale {
  if (!header) return defaultLocale;
  const parts = header.split(",").map((part) => {
    const [lang, ...qParts] = part.trim().split(";q=");
    const q = qParts[0] ? Number.parseFloat(qParts[0]) : 1;
    return { lang: lang.split("-")[0]?.toLowerCase() ?? "", q };
  });
  const ranked = parts.sort((a, b) => b.q - a.q);
  for (const { lang } of ranked) {
    const match = locales.find((l) => l === lang);
    if (match) return match;
  }
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1];
  if (segment && isAppLocale(segment)) {
    return NextResponse.next();
  }
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale: AppLocale =
    cookieLocale && isAppLocale(cookieLocale)
      ? cookieLocale
      : pickFromAcceptLanguage(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api|.*\\..*).*)"],
};
```

**Key Points — Locale Detection**

- Path-first detection keeps URLs shareable and cache-friendly.
- Always fall back to a defined default locale.

---

### Language Switching

**Beginner Level:** A language dropdown on a social media app lets users pick “日本語”. After selection, menus and feed labels update to Japanese.

**Intermediate Level:** Switching should update the URL (`/en/feed` → `/ja/feed`), set a cookie for return visits, and optionally sync to the user account. Use `<Link href={localizedPath} locale={nextLocale}>` in the Pages Router or rebuild the path in the App Router.

**Expert Level:** Preserve the rest of the path when switching (product slug, query params). Prefetch translated routes where possible. For a large e-commerce catalog, avoid loading all languages at once—load messages for the active locale only.

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppLocale } from "@/types/locale";

const LOCALE_COOKIE = "NEXT_LOCALE";

export function LanguageSwitcher({ current }: { current: AppLocale }) {
  const pathname = usePathname();
  const rest = pathname.replace(/^\/(en|fr|de)/, "") || "/";

  function setCookie(locale: AppLocale) {
    document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }

  return (
    <div className="flex gap-2">
      {(["en", "fr", "de"] as const).map((locale) => (
        <Link
          key={locale}
          href={`/${locale}${rest}`}
          onClick={() => setCookie(locale)}
          aria-current={locale === current ? "true" : undefined}
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
```

**Key Points — Language Switching**

- Sync URL, cookie, and optional server-side user profile.
- Do not reload the entire app unnecessarily; prefer client navigation.

---

### next.config.js i18n (Pages Router)

**Beginner Level:** In the classic Pages Router, `next.config.js` has an `i18n` block listing `locales` and `defaultLocale`. Next.js then prefixes routes like `/fr/about` automatically.

**Intermediate Level:** You can choose `localeDetection: true` (default) to use Accept-Language on the root `/`, or disable it when you want strict path-based locales only. Domain routing maps hostnames to locales for multi-brand SaaS.

**Expert Level:** App Router does **not** use the `i18n` key in `next.config.js` the same way; prefer segment-based routing and middleware. If you maintain a hybrid app, document which router owns i18n to avoid double redirects.

```typescript
// next.config.ts (Pages Router example)
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  i18n: {
    locales: ["en", "fr", "de"],
    defaultLocale: "en",
    localeDetection: true,
    domains: [
      { domain: "example.fr", defaultLocale: "fr", locales: ["fr"] },
      { domain: "example.de", defaultLocale: "de", locales: ["de"] },
    ],
  },
};

export default nextConfig;
```

**Key Points — next.config.js i18n**

- Pages Router: central `i18n` config drives automatic sub-paths and `next/link` locale prop.
- App Router: implement `[lang]` + middleware; do not rely solely on legacy `i18n` config.

---

## 21.2 Built-in i18n Pages Router

### i18n Routing

**Beginner Level:** With `i18n` enabled, Next automatically serves `/` and `/fr` versions of the same page file in `pages/`. A blog’s `pages/post/[slug].tsx` becomes `/en/post/hello` and `/fr/post/hello`.

**Intermediate Level:** `getStaticPaths` can return paths per locale, or you omit locale in paths and let Next inject locale when using `getStaticProps` context. Dynamic routes combine with `locales` array for static generation.

**Expert Level:** For millions of SKUs in e-commerce, use ISR or SSR selectively per locale, and shard builds. Align CDN cache keys with `Vary: Accept-Language` only when necessary—prefer explicit locale in the URL for cache efficiency.

```typescript
// pages/post/[slug].tsx (Pages Router + SSG sketch)
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";

type Post = { title: string; body: string };

type Props = { post: Post };

const PostPage: NextPage<Props> = ({ post }) => (
  <article>
    <h1>{post.title}</h1>
    <p>{post.body}</p>
  </article>
);

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const paths =
    locales?.flatMap((locale) =>
      ["hello", "bonjour"].map((slug) => ({ params: { slug }, locale })),
    ) ?? [];
  return { paths, fallback: "blocking" };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string;
  const post: Post = { title: `Post: ${slug}`, body: "…" };
  return { props: { post }, revalidate: 60 };
};

export default PostPage;
```

**Key Points — i18n Routing**

- Locale in the URL simplifies caching and sharing.
- `getStaticPaths` receives `locales` when i18n is configured.

---

### Locale in useRouter

**Beginner Level:** `useRouter` from `next/router` exposes `router.locale`, the active language code for the current page in the Pages Router.

**Intermediate Level:** Use `router.locales`, `router.defaultLocale`, and `router.push(asPath, asPath, { locale: "fr" })` for imperative navigation. This is ideal for dashboard tools that change language without losing deep links.

**Expert Level:** For analytics, send `router.locale` with every event. For auth callbacks, include locale in `callbackUrl` to avoid landing users in the wrong language after OAuth.

```tsx
"use client";

import { useRouter } from "next/router";

export function LocaleDebug() {
  const router = useRouter();
  return (
    <pre>
      {JSON.stringify(
        {
          locale: router.locale,
          locales: router.locales,
          defaultLocale: router.defaultLocale,
          asPath: router.asPath,
        },
        null,
        2,
      )}
    </pre>
  );
}
```

**Key Points — Locale in useRouter**

- `next/navigation` equivalents differ; use `useParams()` for `[lang]` in App Router.
- Imperative locale switches should preserve path and query.

---

### Sub-path /en /fr

**Beginner Level:** Sub-path locales mean English lives at `/en/shop` and French at `/fr/shop`. Users can bookmark language-specific URLs.

**Intermediate Level:** Configure `locales: ["en", "fr"]` and `defaultLocale`. Decide whether default locale omits the prefix (`localePrefix: "as-needed"` patterns in libraries) or always shows `/en`—be consistent for SEO.

**Expert Level:** For marketing sites, “always show prefix” avoids ambiguous canonical URLs. Combine with middleware redirects from bare `/shop` → `/en/shop` when required by your SEO strategy.

```typescript
// Example: normalize default locale prefix in middleware (conceptual)
import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/shop") {
    const url = req.nextUrl.clone();
    url.pathname = "/en/shop";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
```

**Key Points — Sub-path Locales**

- Pick one canonical strategy: prefixed default or as-needed prefix.
- Align internal links with that strategy.

---

### Domain Routing

**Beginner Level:** `fr.example.com` shows French and `example.com` shows English—different hostnames, same codebase.

**Intermediate Level:** In `next.config.js`, `i18n.domains` maps domains to `defaultLocale` and allowed `locales`. Links should use absolute URLs when crossing domains.

**Expert Level:** Set cookies with `Domain=.example.com` if you want SSO across subdomains; be careful with locale cookies conflicting across regional domains. Use edge config or middleware to enforce HTTPS and HSTS per domain.

**Key Points — Domain Routing**

- Great for strong regional branding and legal entities.
- Cross-domain locale switching needs explicit UX (clear language toggle).

---

### Default Locale

**Beginner Level:** The default locale is what users see when no other rule matches—often English for a global SaaS.

**Intermediate Level:** It must exist in `locales` and match your content fallback files (`en.json`). Middleware and detection logic should always resolve to it safely.

**Expert Level:** For compliance, some regions require a specific default; combine with geo hints carefully and always allow manual override.

**Key Points — Default Locale**

- One explicit default avoids `undefined` locale bugs.
- Document default for translators and CMS editors.

---

## 21.3 i18n Libraries

### next-intl

**Beginner Level:** `next-intl` helps App Router apps load messages for a `[locale]` segment and use `useTranslations("nav")` in Client Components.

**Intermediate Level:** Server Components call `getTranslations` for zero client JS for static labels. Configure `NextIntlClientProvider` with messages fetched per request or from static imports.

**Expert Level:** Split namespaces (`checkout`, `account`) to reduce payload. Use `t.rich` for embedded links and formatting. Type-safe keys via codegen or custom helper types.

```tsx
// app/[locale]/layout.tsx (sketch)
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  return (
    <html lang={params.locale}>
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

**Key Points — next-intl**

- Strong fit for App Router + RSC.
- Keep provider boundaries shallow to avoid huge client bundles.

---

### next-i18next

**Beginner Level:** `next-i18next` wraps `i18next` for the Pages Router with file-based JSON in `public/locales`.

**Intermediate Level:** `serverSideTranslations` in `getStaticProps`/`getServerSideProps` hydrates `appWithTranslation` HOC. Good for legacy e-commerce sites on Pages Router.

**Expert Level:** Namespace splitting, backend plugins, and ICU formats integrate with translation management platforms. Watch bundle size on client-heavy pages.

```typescript
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetStaticProps } from "next";

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "footer"])),
  },
});
```

**Key Points — next-i18next**

- Mature Pages Router solution.
- Consider migration path if moving to App Router.

---

### react-intl

**Beginner Level:** FormatJS’s `react-intl` gives `<FormattedMessage>` and `useIntl()` for dates, numbers, and pluralization in React.

**Intermediate Level:** Works with any React setup; combine with your own locale routing. Use `IntlProvider` at the root with messages loaded per locale.

**Expert Level:** Polyfill `Intl` for older browsers if needed. For SSR, ensure messages are serialized consistently to avoid hydration mismatches.

```tsx
"use client";

import { useIntl, FormattedNumber } from "react-intl";

export function PriceTag({ cents }: { cents: number }) {
  const intl = useIntl();
  return (
    <span>
      <FormattedNumber value={cents / 100} style="currency" currency="USD" />
      <span className="sr-only">{intl.formatMessage({ id: "price.includesTax" })}</span>
    </span>
  );
}
```

**Key Points — react-intl**

- Excellent formatting primitives.
- Bring your own routing and message loading.

---

### i18next

**Beginner Level:** `i18next` is a general-purpose i18n core with plugins, often used with `react-i18next` for hooks like `useTranslation()`.

**Intermediate Level:** Lazy-load namespaces via `i18next-http-backend` in SPAs; in Next.js prefer server-loaded JSON to reduce flicker.

**Expert Level:** Use custom language detectors, interpolation escape strategies, and context keys for gender/grammar where needed.

```typescript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

void i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  resources: {
    en: { translation: { welcome: "Welcome, {{name}}" } },
    fr: { translation: { welcome: "Bienvenue, {{name}}" } },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
```

**Key Points — i18next**

- Ecosystem is huge; mind SSR initialization timing in Next.js.

---

## 21.4 App Router i18n

### [lang] Dynamic Segment

**Beginner Level:** Folder `app/[lang]/page.tsx` means the first URL segment is the language: `/en`, `/fr`.

**Intermediate Level:** Type `params` as `Promise<{ lang: string }>` in Next.js 15+ or sync in 14—match your version. Validate `lang` against allowed locales and call `notFound()` if invalid.

**Expert Level:** Colocate dictionaries under `dictionaries/{lang}.ts` and import dynamically to tree-shake unused locales from server bundles where possible.

```typescript
// app/[lang]/layout.tsx
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { isAppLocale, type AppLocale } from "@/types/locale";

export default function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { lang: string };
}) {
  if (!isAppLocale(params.lang)) notFound();
  const lang: AppLocale = params.lang;
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
```

**Key Points — [lang] Segment**

- Validate early in `layout.tsx`.
- Keep `lang` in every public route segment for clarity.

---

### generateStaticParams for Locales

**Beginner Level:** For static marketing pages, prebuild `/en`, `/fr`, `/de` at build time using `generateStaticParams`.

**Intermediate Level:** Return `[{ lang: "en" }, { lang: "fr" }]` from `generateStaticParams` in `[lang]` layouts or pages. Combine with CMS-driven slugs for blog posts per locale.

**Expert Level:** For 50+ locales, shard builds or use ISR. Ensure CDN purges target each locale path.

```typescript
// app/[lang]/blog/[slug]/page.tsx
import { locales } from "@/types/locale";

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    ["launch-post", "product-update"].map((slug) => ({ lang, slug })),
  );
}
```

**Key Points — generateStaticParams**

- Static params + SSG yield fastest TTFB for content sites.
- Watch build time growth with locales × dynamic routes.

---

### Locale Middleware

**Beginner Level:** Middleware runs at the edge before your page: it can redirect `/` to `/en` based on cookies or headers.

**Intermediate Level:** Exclude `_next`, static files, and `api` routes via `matcher`. Compose with auth middleware: first locale, then session.

**Expert Level:** Use `NextResponse.rewrite` for invisible locale defaulting if product requires unprefixed marketing URLs—document SEO implications.

**Key Points — Locale Middleware**

- Keep matchers tight for performance.
- Avoid infinite redirect loops between `/` and `/en`.

---

### Server Component Translations

**Beginner Level:** Server Components fetch dictionary JSON and render translated headings without sending keys to the client.

**Intermediate Level:** Pass only the strings needed by Client Components as props to minimize leakage and bundle size.

**Expert Level:** Stream translated content; cache per locale with `fetch` tags or unstable_cache. For dashboards, join user locale with tenant branding strings from a CMS.

```typescript
// app/[lang]/dashboard/page.tsx
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function DashboardPage({ params }: { params: { lang: string } }) {
  const dict = await getDictionary(params.lang);
  return (
    <main>
      <h1>{dict.dashboard.title}</h1>
      <p>{dict.dashboard.welcome}</p>
    </main>
  );
}
```

**Key Points — Server Component Translations**

- Prefer server loading for SEO and smaller client JS.
- Type dictionaries with `satisfies` or Zod parsing.

---

## 21.5 Translation Management

### Translation Files JSON

**Beginner Level:** `en.json` holds flat or nested keys like `{ "nav": { "home": "Home" } }`. Load the right file per locale.

**Intermediate Level:** Split files per namespace (`checkout.json`, `product.json`) and merge at build or request time. Social apps might isolate “moderation” strings for different release cadence.

**Expert Level:** Integrate Phrase, Lokalise, or Crowdin with CI to diff keys, fail builds on missing translations, and export ICU JSON.

```json
{
  "nav": {
    "home": "Home",
    "cart": "Cart"
  },
  "product": {
    "addToCart": "Add to cart"
  }
}
```

**Key Points — JSON Files**

- Keep nesting shallow for translator UX.
- Validate JSON in CI.

---

### Translation Keys

**Beginner Level:** Keys are stable IDs (`cart.checkout`) while values change per language.

**Intermediate Level:** Namespace keys by feature (`settings.notifications.email`). Avoid reusing the same key for different English sentences that might diverge in other languages.

**Expert Level:** Enforce key naming via ESLint custom rule or codegen from master spreadsheet; detect unused keys.

```typescript
type NavKeys = "nav.home" | "nav.cart";

const nav: Record<NavKeys, string> = {
  "nav.home": "Home",
  "nav.cart": "Cart",
};
```

**Key Points — Translation Keys**

- Stable keys > reusing English text as the key.
- Document context for translators (“button label, max 20 chars”).

---

### Interpolation

**Beginner Level:** Insert dynamic values: “Hello, **Ada**” from template `Hello, {{name}}`.

**Intermediate Level:** Escape user-generated content to prevent XSS when rendering translated HTML; prefer React nodes via library-safe rich text APIs.

**Expert Level:** Use ICU placeholders and strict typing for variables required per message.

```typescript
type Interpolation = { name: string };

export function greet(messages: { template: string }, values: Interpolation) {
  return messages.template.replace("{{name}}", values.name);
}
```

**Key Points — Interpolation**

- Never trust raw HTML from translators without sanitization pipeline.
- Keep variable names meaningful for linguists.

---

### Pluralization

**Beginner Level:** English: “1 item” vs “5 items”. Other languages have more plural forms.

**Intermediate Level:** Use ICU `plural` rules or library helpers (`next-intl` `t.rich`, `react-intl` `FormattedPlural`).

**Expert Level:** Arabic and Polish require correct plural categories; test with native speakers and fixture-driven unit tests.

```json
{
  "items": "{count, plural, =0 {No items} one {# item} other {# items}}"
}
```

**Key Points — Pluralization**

- Do not concatenate `(s)` in English and expect it to generalize.
- Cover zero/one/other categories.

---

### Date and Number Formatting

**Beginner Level:** Show dates like `3/28/2026` in the US and `28/03/2026` in France using `Intl.DateTimeFormat`.

**Intermediate Level:** Always pass `locale` explicitly in SaaS reports so server-rendered PDFs match user settings.

**Expert Level:** Respect time zones (`Asia/Tokyo`) for scheduling dashboards; store UTC, display local.

```typescript
export function formatOrderDate(iso: string, locale: string, timeZone: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(iso));
}
```

**Key Points — Date/Number Formatting**

- Prefer `Intl` over manual strings.
- Time zone is separate from language locale.

---

## 21.6 i18n Best Practices

### SEO Multilingual

**Beginner Level:** Each language should have crawlable URLs and clear titles, e.g. `/fr/prix` with a French `<title>`.

**Intermediate Level:** Avoid duplicate content: use canonical URLs and consistent `lang` attributes. For App Router, export `generateMetadata` per locale.

**Expert Level:** Submit localized sitemaps; structure data (`Product` JSON-LD) in the correct language.

```typescript
import type { Metadata } from "next";

export function buildMetadata(locale: string): Metadata {
  return {
    title: locale === "fr" ? "Boutique" : "Shop",
    alternates: { canonical: `https://example.com/${locale}/shop` },
  };
}
```

**Key Points — SEO Multilingual**

- Language-specific metadata is mandatory for ranking clarity.
- Do not cloak different language content on the same URL without signals.

---

### hreflang Tags

**Beginner Level:** `hreflang` tells Google which URL targets which language/region.

**Intermediate Level:** Add `<link rel="alternate" hrefLang="fr-FR" href="...">` for each locale plus `x-default`.

**Expert Level:** Align with sitemap `hreflang` entries; verify in Search Console; handle regional variants (`en-GB` vs `en-US`).

```tsx
export function HreflangLinks({
  path,
  locales,
}: {
  path: string;
  locales: readonly string[];
}) {
  const origin = "https://example.com";
  return (
    <>
      {locales.map((locale) => (
        <link
          key={locale}
          rel="alternate"
          hrefLang={locale}
          href={`${origin}/${locale}${path}`}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${origin}/en${path}`} />
    </>
  );
}
```

**Key Points — hreflang**

- Include `x-default` for language chooser or global fallback.
- Href values must be absolute.

---

### Language Selector UI

**Beginner Level:** Show flags and native names (“Español”, “Deutsch”) for a travel blog.

**Intermediate Level:** Use accessible `<select>` or listbox with `aria-label`, keyboard support, and current language indication.

**Expert Level:** Persist selection, sync account settings, and reflect RTL layout changes immediately without full reload where possible.

**Key Points — Language Selector**

- Avoid relying on flags alone (languages ≠ countries).
- Test with screen readers.

---

### RTL Support

**Beginner Level:** Arabic and Hebrew read right-to-left; mirror layouts with `dir="rtl"` on `<html>` or a wrapper.

**Intermediate Level:** Use logical CSS properties (`margin-inline-start`) instead of `margin-left` only.

**Expert Level:** Audit icons, charts, and animation directions; test mixed LTR content inside RTL (URLs, code snippets).

```tsx
export function DocumentShell({
  locale,
  dir,
  children,
}: {
  locale: string;
  dir: "ltr" | "rtl";
  children: React.ReactNode;
}) {
  return (
    <html lang={locale} dir={dir}>
      <body>{children}</body>
    </html>
  );
}
```

**Key Points — RTL**

- Set `dir` at the root per locale.
- Prefer logical properties in design systems.

---

### File Organization

**Beginner Level:** Put JSON files in `messages/en.json`, `messages/fr.json`.

**Intermediate Level:** Feature folders: `messages/en/checkout.json`, merged in loader. Co-locate route-specific copy near routes when small.

**Expert Level:** Monorepo shared package `@acme/i18n` consumed by web and email templates; single source of truth.

**Key Points — File Organization**

- One pattern per repo; document loading order.
- Automate missing key detection per namespace.

---

## Key Points (Chapter Summary)

- Choose Pages Router built-in `i18n` **or** App Router `[lang]` + middleware—know which applies.
- Detect locale with path → cookie → `Accept-Language` → default.
- Use libraries for ICU pluralization and rich formatting; do not invent fragile string math.
- SEO needs unique URLs, `lang`, metadata, and `hreflang` with `x-default`.
- RTL and accessible language switchers are part of i18n, not an afterthought.

---

## Best Practices

1. **Keep locale in the URL** for shareable, cacheable pages in most products.
2. **Type locales** with unions and narrow with guards at boundaries.
3. **Load only active locale messages** on the client; split namespaces.
4. **Test plural and gender rules** with real locale fixtures, not only English.
5. **Align analytics and SEO** so every event and page records `locale`.
6. **Document translator context** (max length, tone, where string appears).
7. **Version translation files** with releases to avoid partial deployments.
8. **Use `Intl` APIs** for dates, numbers, and lists consistently.
9. **Middleware matchers** should exclude assets and APIs to save edge invocations.
10. **Plan migration** from Pages `i18n` config to App Router segments early in greenfield projects.

---

## Common Mistakes to Avoid

1. **Using English concatenation** (“You have ” + n + “ items”) that breaks in other grammars.
2. **Forgetting `lang` and `dir`** on `<html>`, harming accessibility and SEO.
3. **Infinite redirect loops** between `/` and localized home without exclusions.
4. **Hydration mismatches** from locale guessed only on the client.
5. **Caching the wrong variant** by not varying cache keys by locale.
6. **Duplicating routes** manually instead of using `locales` in static generation.
7. **Trusting translator-supplied HTML** without sanitization when using rich messages.
8. **Omitting `x-default` hreflang** and confusing search engines about fallback URLs.
9. **Huge client bundles** from passing entire translation catalogs to `Provider`.
10. **Mixing App and Pages i18n** without a single source of truth for supported locales.
