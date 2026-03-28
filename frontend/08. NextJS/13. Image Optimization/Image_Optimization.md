# Next.js Image Optimization — Topics 13.1–13.6

The `next/image` component automates **responsive images**, **modern formats** (WebP/AVIF), and **lazy loading**—critical for **e‑commerce** product grids, **blog** hero images, **SaaS** marketing pages, **dashboard** avatars, and **social** media-style feeds. This guide walks every subtopic with beginner, intermediate, and expert depth plus TypeScript-first examples.

## 📑 Table of Contents

- [13.1 `next/image` Component](#131-nextimage-component)
  - [13.1.1 Basics](#1311-basics)
  - [13.1.2 `src`](#1312-src)
  - [13.1.3 `width` / `height`](#1313-width--height)
  - [13.1.4 `alt`](#1314-alt)
  - [13.1.5 `priority`](#1315-priority)
  - [13.1.6 `fill`](#1316-fill)
  - [13.1.7 `sizes`](#1317-sizes)
  - [13.1.8 `quality`](#1318-quality)
- [13.2 Image Loading](#132-image-loading)
  - [13.2.1 Lazy by default](#1321-lazy-by-default)
  - [13.2.2 Eager loading](#1322-eager-loading)
  - [13.2.3 Priority and LCP](#1323-priority-and-lcp)
  - [13.2.4 Placeholder `blur` / `empty`](#1324-placeholder-blur--empty)
  - [13.2.5 `blurDataURL`](#1325-blurdataurl)
- [13.3 Image Sizing](#133-image-sizing)
  - [13.3.1 Fixed dimensions](#1331-fixed-dimensions)
  - [13.3.2 Responsive images](#1332-responsive-images)
  - [13.3.3 Fill container](#1333-fill-container)
  - [13.3.4 `object-fit`](#1334-object-fit)
  - [13.3.5 `object-position`](#1335-object-position)
- [13.4 Image Optimization Pipeline](#134-image-optimization-pipeline)
  - [13.4.1 Auto format WebP / AVIF](#1341-auto-format-webp--avif)
  - [13.4.2 Compression and quality](#1342-compression-and-quality)
  - [13.4.3 Responsive srcset generation](#1343-responsive-srcset-generation)
  - [13.4.4 Device detection](#1344-device-detection)
  - [13.4.5 CDN and the Image Optimization API](#1345-cdn-and-the-image-optimization-api)
- [13.5 Image Configuration](#135-image-configuration)
  - [13.5.1 `next.config.js` `images`](#1351-nextconfigjs-images)
  - [13.5.2 `domains` (legacy)](#1352-domains-legacy)
  - [13.5.3 `remotePatterns`](#1353-remotepatterns)
  - [13.5.4 `deviceSizes`](#1354-devicesizes)
  - [13.5.5 `imageSizes`](#1355-imagesizes)
  - [13.5.6 `formats`](#1356-formats)
- [13.6 Image Best Practices](#136-image-best-practices)
  - [13.6.1 Dimensions and layout stability](#1361-dimensions-and-layout-stability)
  - [13.6.2 Priority for above-the-fold](#1362-priority-for-above-the-fold)
  - [13.6.3 Core Web Vitals — LCP](#1363-core-web-vitals--lcp)
  - [13.6.4 Local vs remote images](#1364-local-vs-remote-images)
- [Key Points (Chapter Summary)](#key-points-chapter-summary)
- [Best Practices (End of Guide)](#best-practices-end-of-guide)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 13.1 `next/image` Component

### 13.1.1 Basics

**Beginner Level**  
Import `Image` from `next/image` instead of `<img>`. Next.js **resizes** and serves efficient formats automatically—great for a **store** product thumbnail list.

**Intermediate Level**  
The Image component wraps a responsive `<img>` with built-in `srcset`, optional blur placeholder, and configurable loaders. It requires either explicit `width`/`height` or `fill` with a positioned parent.

**Expert Level**  
Behind the scenes, the **Image Optimization** route (`/_next/image`) or a **custom loader** transforms URLs. Self-hosting requires understanding cache keys, `minimumCacheTTL`, and security allowlists for remote hosts.

```tsx
import Image from "next/image";
import hero from "./hero.jpg";

export function Hero(): JSX.Element {
  return (
    <Image
      src={hero}
      alt="SaaS dashboard preview"
      priority
      placeholder="blur"
      sizes="100vw"
      className="h-auto w-full rounded-xl"
    />
  );
}
```

#### Key Points — 13.1.1

- Prefer `next/image` for any raster image in App Router projects.
- Static imports give Next **build-time** metadata (width/height).

---

### 13.1.2 `src`

**Beginner Level**  
`src` is a **string URL** or a **static import** of an image file in your project.

**Intermediate Level**  
Remote URLs must match `images.remotePatterns` / `domains` in `next.config`. For **CMS**-driven **blogs**, `src={post.coverUrl}` is typical.

**Expert Level**  
Custom `loader` functions map `(src, width, quality) => string` for external CDNs like Cloudinary or Imgix—Next still handles `sizes` logic when configured correctly.

```tsx
import Image from "next/image";

type ProductImageProps = {
  url: string;
  productName: string;
};

export function ProductImage({ url, productName }: ProductImageProps): JSX.Element {
  return (
    <Image
      src={url}
      alt={`Photo of ${productName}`}
      width={640}
      height={640}
      sizes="(max-width: 768px) 100vw, 400px"
    />
  );
}
```

#### Key Points — 13.1.2

- Static import: best for **local** assets and automatic blur data.
- Remote: must be **allowlisted**—do not disable checks in production without understanding risk.

---

### 13.1.3 `width` / `height`

**Beginner Level**  
Set numbers in **pixels** so the browser reserves space—no jump when the image loads (**CLS**).

**Intermediate Level**  
These are **intrinsic** dimensions for layout, not necessarily the displayed size; CSS scales the image. For **dashboard** avatars, 40×40 is common.

**Expert Level**  
For unknown aspect ratios, either compute dimensions from metadata API or use `fill` + `aspect-ratio` CSS. Wrong aspect with fixed width/height causes **distortion** unless `object-fit` is applied.

```tsx
import Image from "next/image";

export function Avatar({ src, name }: { src: string; name: string }): JSX.Element {
  return (
    <Image
      src={src}
      alt={`${name} avatar`}
      width={40}
      height={40}
      className="rounded-full object-cover"
    />
  );
}
```

#### Key Points — 13.1.3

- Always pair with CSS for **cropping** (`object-cover`) when needed.
- Omitting dimensions on non-`fill` images is a **type/runtime** error in strict setups.

---

### 13.1.4 `alt`

**Beginner Level**  
`alt` describes the image for **screen readers** and when images fail to load.

**Intermediate Level**  
Decorative images: use `alt=""` and `role="presentation"` patterns sparingly; for **marketing** heroes, write meaningful copy, not keyword stuffing.

**Expert Level**  
For **e‑commerce**, include product attributes users rely on (“Navy running shoe, side view”). Automated CMS alt text should be reviewed for **accessibility** compliance.

```tsx
import Image from "next/image";

export function BlogCover({
  title,
  coverSrc,
}: {
  title: string;
  coverSrc: string;
}): JSX.Element {
  return (
    <Image
      src={coverSrc}
      alt={`Cover image for article: ${title}`}
      width={1200}
      height={630}
      priority
      sizes="(max-width: 1024px) 100vw, 1024px"
    />
  );
}
```

#### Key Points — 13.1.4

- Meaningful `alt` is **SEO** and **a11y**.
- Do not duplicate nearby heading text verbatim if it adds no value.

---

### 13.1.5 `priority`

**Beginner Level**  
Add `priority` to load important images **immediately**—like the big picture at the top of a **product** page.

**Intermediate Level**  
`priority` disables lazy loading and sets `fetchpriority="high"` (implementation may vary by version). Use on **one** or few LCP candidates per page.

**Expert Level**  
Overusing `priority` harms performance—every prioritized image competes for bandwidth. For **SaaS** homepages, prioritize hero only; defer below-fold screenshots.

```tsx
import Image from "next/image";

export function AboveFoldHero({ src }: { src: string }): JSX.Element {
  return (
    <Image
      src={src}
      alt="Collaboration workspace in action"
      width={1440}
      height={810}
      priority
      sizes="100vw"
    />
  );
}
```

#### Key Points — 13.1.5

- **Few** `priority` images per route.
- Pair with proper `sizes` to avoid over-fetching width.

---

### 13.1.6 `fill`

**Beginner Level**  
`fill` makes the image **stretch** to its parent container; parent needs `position: relative` (or fixed/absolute).

**Intermediate Level**  
Use for **card** layouts with fluid height—**social** post media, **dashboard** widgets.

**Expert Level**  
Combine with `sizes` to describe how wide the image will be in the layout; without `sizes`, the optimizer may choose unnecessarily large widths.

```tsx
import Image from "next/image";

export function CardMedia({ src, alt }: { src: string; alt: string }): JSX.Element {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
      <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 640px) 100vw, 400px" />
    </div>
  );
}
```

#### Key Points — 13.1.6

- Parent must establish **positioning context**.
- Always set **`sizes`** when using `fill` in responsive layouts.

---

### 13.1.7 `sizes`

**Beginner Level**  
Tell the browser **how wide** the image will be at different breakpoints—like “full width on phones, half on desktop.”

**Intermediate Level**  
`sizes` drives **`srcset` width selection**. Wrong `sizes` → downloading **too-large** images (slow) or **too-small** (blurry).

**Expert Level**  
For **grid** layouts, express column width: `(max-width: 768px) 100vw, 33vw` for three columns. Align with your CSS grid/flex, not the viewport alone.

```tsx
import Image from "next/image";

export function GalleryTile({ src, alt }: { src: string; alt: string }): JSX.Element {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="h-auto w-full"
    />
  );
}
```

#### Key Points — 13.1.7

- **Required** for correct responsive behavior with `fill` and wide layouts.
- Re-check when changing **CSS breakpoints**.

---

### 13.1.8 `quality`

**Beginner Level**  
`quality` is a 1–100 scale; higher = sharper but heavier files.

**Intermediate Level**  
Default is typically **75**; raise for **hero** banners, lower for **thumbnails**.

**Expert Level**  
Tune per **CDN** cache hit rates and **LCP** budgets. For **AVIF-first** configs, quality semantics still apply to encoder settings behind the optimizer.

```tsx
import Image from "next/image";

export function Thumb({ src, alt }: { src: string; alt: string }): JSX.Element {
  return <Image src={src} alt={alt} width={120} height={120} quality={60} className="rounded" />;
}
```

#### Key Points — 13.1.8

- Avoid max quality everywhere—**bandwidth** cost adds up on mobile.
- A/B test perceptual quality for **e‑commerce** zoom interactions.

---

## 13.2 Image Loading

### 13.2.1 Lazy by default

**Beginner Level**  
Images below the fold **wait** to load until the user scrolls near them—saves data on **blog** index pages.

**Intermediate Level**  
Default `loading="lazy"` behavior integrates with modern browser lazy loading; `next/image` aligns with this unless `priority` or `loading="eager"` is set.

**Expert Level**  
For infinite **social** feeds, combine lazy images with **virtualization** libraries to reduce DOM nodes; Next handles image lazy loading per element.

```tsx
import Image from "next/image";

export function LazyRow({ items }: { items: { id: string; src: string; alt: string }[] }): JSX.Element {
  return (
    <ul className="space-y-4">
      {items.map((i) => (
        <li key={i.id}>
          <Image src={i.src} alt={i.alt} width={800} height={450} sizes="100vw" />
        </li>
      ))}
    </ul>
  );
}
```

#### Key Points — 13.2.1

- Lazy loading improves **initial load**; do not lazy LCP candidates.
- Long pages benefit most (**e‑commerce** search results).

---

### 13.2.2 Eager loading

**Beginner Level**  
`loading="eager"` loads immediately—rarely needed if you use `priority` for heroes.

**Intermediate Level**  
Use when an image is **small** and critical but not LCP—icons beside the title, for example.

**Expert Level**  
Avoid fighting the optimizer: prefer **`priority`** for above-fold photos; use `eager` sparingly to prevent bandwidth contention.

```tsx
import Image from "next/image";

export function InlineBadge({ src }: { src: string }): JSX.Element {
  return (
    <Image src={src} alt="" width={20} height={20} loading="eager" className="inline-block" role="presentation" />
  );
}
```

#### Key Points — 13.2.2

- Prefer **`priority`** for large LCP images.
- Decorative tiny images: consider **SVG** instead of raster.

---

### 13.2.3 Priority and LCP

**Beginner Level**  
**LCP** (Largest Contentful Paint) is often a big image; `priority` helps it appear faster.

**Intermediate Level**  
Measure in **Lighthouse** or RUM; ensure the true LCP element is prioritized—sometimes it is text, not the hero.

**Expert Level**  
Preload only what matters; align **font** loading (Topic 14) so text does not beat image unexpectedly. For **dashboards**, charts may be LCP—images secondary.

```tsx
import Image from "next/image";

export function ProductHero({ src, name }: { src: string; name: string }): JSX.Element {
  return (
    <Image
      src={src}
      alt={name}
      width={1200}
      height={1200}
      priority
      sizes="(max-width: 768px) 100vw, 600px"
    />
  );
}
```

#### Key Points — 13.2.3

- Validate LCP element in **field** data, not only lab tests.
- Fix **CLS** alongside LCP (dimensions, placeholders).

---

### 13.2.4 Placeholder `blur` / `empty`

**Beginner Level**  
`placeholder="blur"` shows a fuzzy preview while the real image loads—feels faster on **SaaS** marketing sites.

**Intermediate Level**  
Requires `blurDataURL` for remote images or static import for automatic tiny placeholder generation.

**Expert Level**  
`placeholder="empty"` reserves no blur—use when placeholders distract (data-heavy **admin** UIs) or when CPU for blur decode matters on low-end devices.

```tsx
import Image from "next/image";
import cover from "./cover.jpg";

export function PostHeader(): JSX.Element {
  return (
    <Image
      src={cover}
      alt="Team workshop"
      placeholder="blur"
      sizes="100vw"
      className="h-auto w-full"
    />
  );
}
```

#### Key Points — 13.2.4

- Blur improves **perceived performance** if subtle.
- Too-strong blur on sharp UI mockups can look **muddy**.

---

### 13.2.5 `blurDataURL`

**Beginner Level**  
A tiny **Base64** image string used as the blur preview.

**Intermediate Level**  
Generate at build time in CMS pipelines or use libraries like `plaiceholder` for **blog** covers.

**Expert Level**  
Keep **data URLs tiny** to avoid inflating HTML. For thousands of cards, prefer **empty** placeholder or shared low-res assets.

```tsx
import Image from "next/image";

type RemoteCoverProps = {
  src: string;
  title: string;
  blurDataURL: string;
};

export function RemoteCover({ src, title, blurDataURL }: RemoteCoverProps): JSX.Element {
  return (
    <Image
      src={src}
      alt={`Cover for ${title}`}
      width={1200}
      height={630}
      placeholder="blur"
      blurDataURL={blurDataURL}
      sizes="(max-width: 1024px) 100vw, 800px"
    />
  );
}
```

#### Key Points — 13.2.5

- Precompute during **static generation** when possible.
- Balance **HTML size** vs UX benefit.

---

## 13.3 Image Sizing

### 13.3.1 Fixed dimensions

**Beginner Level**  
Width and height props stay constant—good for **icons** and **logos**.

**Intermediate Level**  
CSS can still scale, but intrinsic ratio is known—stable layout for **dashboard** sidebars.

**Expert Level**  
Use when design system specifies exact raster sizes; pair with `srcSet` via `sizes` if displayed size changes per breakpoint.

```tsx
import Image from "next/image";

export function BrandMark(): JSX.Element {
  return <Image src="/logo.svg" alt="Acme" width={120} height={32} priority />;
}
```

#### Key Points — 13.3.1

- Prefer **SVG** for logos when vector source exists.
- Fixed raster + responsive CSS still needs correct **`sizes`**.

---

### 13.3.2 Responsive images

**Beginner Level**  
Images grow/shrink with the screen—**mobile** shoppers see appropriately sized files.

**Intermediate Level**  
Combine `width`/`height` (intrinsic) + `className="w-full h-auto"` + accurate `sizes`.

**Expert Level**  
Test actual downloaded width in **Network** panel; mismatched `sizes` is a top bug in **e‑commerce** grids.

```tsx
import Image from "next/image";

export function ResponsiveBanner({ src, alt }: { src: string; alt: string }): JSX.Element {
  return (
    <Image
      src={src}
      alt={alt}
      width={1600}
      height={900}
      sizes="100vw"
      className="h-auto w-full max-w-6xl"
    />
  );
}
```

#### Key Points — 13.3.2

- `sizes` + CSS breakpoints = correct **bytes**.
- Re-test when redesigning grids.

---

### 13.3.3 Fill container

**Beginner Level**  
Image fills a box; good for **cards** with consistent aspect ratio.

**Intermediate Level**  
Parent controls height (`aspect-video`, fixed `h-64`, etc.).

**Expert Level**  
Watch **overflow** and **border-radius** clipping; use `object-cover` to avoid letterboxing in uneven user uploads (**social** UGC).

```tsx
import Image from "next/image";

export function UgcCard({ src, alt }: { src: string; alt: string }): JSX.Element {
  return (
    <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-muted">
      <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" />
    </div>
  );
}
```

#### Key Points — 13.3.3

- **`fill`** + **`relative`** parent is the standard pattern.
- Always pass **`sizes`**.

---

### 13.3.4 `object-fit`

**Beginner Level**  
CSS property controlling how the image fits its box—`cover` crops, `contain` letterboxes.

**Intermediate Level**  
Apply via `className` on `Image` (`tailwind`: `object-cover`). For **product** photos on white backgrounds, `contain` may be better.

**Expert Level**  
Combine with known aspect containers to avoid **face cropping** in thumbnails—consider `object-position`.

```tsx
import Image from "next/image";

export function ProductShot({ src, alt }: { src: string; alt: string }): JSX.Element {
  return (
    <div className="relative aspect-square w-full bg-white">
      <Image src={src} alt={alt} fill className="object-contain p-4" sizes="(max-width: 768px) 100vw, 480px" />
    </div>
  );
}
```

#### Key Points — 13.3.4

- `cover` vs `contain` is a **design** decision with UX impact.
- Test **portrait** vs **landscape** user uploads.

---

### 13.3.5 `object-position`

**Beginner Level**  
Chooses which part of the image stays visible when cropping—`object-top`, `center`, or `50% 20%`.

**Intermediate Level**  
Important for **fashion** **e‑commerce**—keep faces or products centered.

**Expert Level**  
For AI-detected focal points, pass inline `style={{ objectPosition: `${x}% ${y}%` }}` from metadata.

```tsx
import Image from "next/image";

export function PortraitCrop({ src, alt }: { src: string; alt: string }): JSX.Element {
  return (
    <div className="relative h-80 w-64 overflow-hidden rounded-lg">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        style={{ objectPosition: "50% 15%" }}
        sizes="256px"
      />
    </div>
  );
}
```

#### Key Points — 13.3.5

- Fine-tunes **`object-cover`** crops.
- Consider CMS-driven focal points for **editorial** **blogs**.

---

## 13.4 Image Optimization Pipeline

### 13.4.1 Auto format WebP / AVIF

**Beginner Level**  
Next serves **modern** formats when the browser supports them—smaller files, faster loads.

**Intermediate Level**  
Configure `formats` in `next.config` (`['image/avif','image/webp']`). Fallback JPEG/PNG as needed.

**Expert Level**  
AVIF decode can be **CPU**-heavy on low-end phones—monitor **LCP** and **INP** trade-offs; some teams prefer WebP-only.

#### Key Points — 13.4.1

- Automatic `Accept` negotiation via optimizer.
- Validate visually for **banding** on gradients.

---

### 13.4.2 Compression and quality

**Beginner Level**  
Compression reduces bytes; `quality` prop tunes it.

**Intermediate Level**  
Default balances size and clarity; thumbnails can go **55–65**.

**Expert Level**  
For **print-quality** downloads, serve **original** files via direct URL, not the optimized social preview.

#### Key Points — 13.4.2

- Tune **per component**, not globally only.
- Watch **artifacting** around text in screenshots.

---

### 13.4.3 Responsive srcset generation

**Beginner Level**  
Next creates multiple widths so the browser picks the closest.

**Intermediate Level**  
Widths derive from `deviceSizes` and `imageSizes` config + `sizes` attribute.

**Expert Level**  
Custom loaders must echo expected width query params for your CDN (**Imgix** `w=`, Cloudinary `w_`).

#### Key Points — 13.4.3

- `sizes` steers which **srcset** candidate wins.
- Misconfiguration wastes **CDN** bandwidth budgets.

---

### 13.4.4 Device detection

**Beginner Level**  
The optimizer uses request metadata (via deployment platform) to pick reasonable defaults.

**Intermediate Level**  
Not “magic”—still relies on `sizes` and configuration; **client hints** may be involved depending on setup.

**Expert Level**  
Document behavior on **self-hosted** Node vs **serverless** edge image optimization—caches and headers differ.

#### Key Points — 13.4.4

- Do not assume per-device **perfect** width without correct `sizes`.
- Test on real **iOS** and **Android** devices.

---

### 13.4.5 CDN and the Image Optimization API

**Beginner Level**  
On Vercel, optimized images are cached at the edge—fast globally for **SaaS** landing pages.

**Intermediate Level**  
Self-hosted: configure `minimumCacheTTL`, disk/cache adapter, and security.

**Expert Level**  
Some teams bypass built-in optimizer and use **`loader` + dedicated image CDN** for advanced transforms (art direction, AI cropping).

```typescript
// next.config.ts (typed excerpt)
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 60 * 60 * 24,
    remotePatterns: [
      { protocol: "https", hostname: "cdn.example.com", pathname: "/media/**" },
    ],
  },
};

export default nextConfig;
```

#### Key Points — 13.4.5

- Understand **cache invalidation** when replacing remote assets at same URL.
- Protect `/_next/image` from **open proxy** abuse via `remotePatterns`.

---

## 13.5 Image Configuration

### 13.5.1 `next.config.js` `images`

**Beginner Level**  
The `images` key configures allowed remotes, sizes, formats, and caching.

**Intermediate Level**  
Keep config in **TypeScript** `next.config.ts` for typed `NextConfig`.

**Expert Level**  
Combine with **Content Security Policy** `img-src` to match remote hosts.

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
```

#### Key Points — 13.5.1

- Treat `images` as **security + performance** config.
- Review on every new **asset domain**.

---

### 13.5.2 `domains` (legacy)

**Beginner Level**  
Old allowlist: list hostnames strings.

**Intermediate Level**  
Still works in many versions but **`remotePatterns`** is preferred for path/protocol control.

**Expert Level**  
Migrate to `remotePatterns` to prevent **path-wide** open proxies.

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["cdn.example.com"],
  },
};

export default nextConfig;
```

#### Key Points — 13.5.2

- Prefer **`remotePatterns`** for new projects.
- `domains` alone is **coarser** security.

---

### 13.5.3 `remotePatterns`

**Beginner Level**  
Allow images only from URLs matching **protocol**, **hostname**, **port**, **pathname** patterns.

**Intermediate Level**  
Use for **multi-tenant** **blogs** where each customer has `*.cdn.customer.com`.

**Expert Level**  
Restrict pathname to `/wp-content/uploads/**` etc., not `/`.

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
```

#### Key Points — 13.5.3

- Tightest practical pathname wins.
- Update when CMS **CDN** paths change.

---

### 13.5.4 `deviceSizes`

**Beginner Level**  
Widths used for **full-width** responsive images.

**Intermediate Level**  
Adjust if your design max width is far below defaults—avoid generating unused huge variants.

**Expert Level**  
Align with analytics of **viewport** widths; trim extremes for cost savings on image CDN bills.

#### Key Points — 13.5.4

- Affects **srcset** width list for layout-wide images.
- Too many large sizes increase **storage** and **CPU**.

---

### 13.5.5 `imageSizes`

**Beginner Level**  
Smaller widths for **icon-like** uses and grid thumbnails.

**Intermediate Level**  
Used when `sizes` indicates relatively small displayed widths.

**Expert Level**  
Tune for **avatar** grids and **dashboard** lists to avoid overserving 1080w files for 48px circles.

#### Key Points — 13.5.5

- Complements **`deviceSizes`**.
- Revisit when design system **density** changes.

---

### 13.5.6 `formats`

**Beginner Level**  
Order determines preferred modern formats to try.

**Intermediate Level**  
`['image/avif','image/webp']` is common; fall back automatically.

**Expert Level**  
If targeting old embedded browsers, test decode support; consider excluding AVIF.

#### Key Points — 13.5.6

- Order matters for **encoder** attempts.
- Validate **visual QA** on product imagery.

---

## 13.6 Image Best Practices

### 13.6.1 Dimensions and layout stability

**Beginner Level**  
Always reserve space—prevents page **jumping** while images load.

**Intermediate Level**  
Use explicit `width`/`height` or `fill` + `aspect-ratio` container.

**Expert Level**  
For **CLS** budgets under 0.1, audit skeleton vs final layout mismatch in **dashboard** tables.

#### Key Points — 13.6.1

- CLS affects **Core Web Vitals** ranking signals.
- Skeleton **heights** must match final media boxes.

---

### 13.6.2 Priority for above-the-fold

**Beginner Level**  
One clear hero image: `priority`.

**Intermediate Level**  
Carousels: prioritize **first slide** only.

**Expert Level**  
For **e‑commerce** PLP, never prioritize every row—use intersection-friendly defaults.

#### Key Points — 13.6.2

- Prioritize **true** LCP candidate from field data.
- Defer **non-critical** decorative imagery.

---

### 13.6.3 Core Web Vitals — LCP

**Beginner Level**  
Big image = often LCP; make it load fast (`priority`, proper `sizes`, CDN).

**Intermediate Level**  
Avoid transparent **hero** overlays that delay LCP discovery; ensure image is not `display:none` at first paint.

**Expert Level**  
Preconnect to image CDN origins in critical routes if not using same-origin optimizer.

#### Key Points — 13.6.3

- LCP is **user-centric**; measure on **4G**.
- Pair image strategy with **font** strategy (FOIT/FOUT).

---

### 13.6.4 Local vs remote images

**Beginner Level**  
Local imports are simplest and get automatic **blur** placeholders.

**Intermediate Level**  
Remote needs allowlisting; good for **headless CMS**.

**Expert Level**  
For **global** **social** apps, remote CDN with signed URLs may require **custom loader** and careful cache TTL.

```tsx
import Image from "next/image";
import local from "./badge.png";

export function HybridSources({ remoteUrl }: { remoteUrl: string }): JSX.Element {
  return (
    <div className="flex gap-4">
      <Image src={local} alt="Achievements" width={64} height={64} />
      <Image src={remoteUrl} alt="Friend avatar" width={64} height={64} />
    </div>
  );
}
```

#### Key Points — 13.6.4

- Local: **build-time** optimization and simpler CSP.
- Remote: **flexible** but more moving parts.

---

## Key Points (Chapter Summary)

- `next/image` couples **layout stability**, **responsive srcset**, and **modern formats**.
- **`sizes` is non-optional** for correct responsive behavior—especially with `fill`.
- **`priority`** should be rare and aligned with **LCP** measurement.
- **Placeholders** improve perceived speed when tuned and lightweight.
- **`remotePatterns`** is the secure way to allow **CMS/CDN** images.
- **`deviceSizes` / `imageSizes` / `formats`** tune the optimization pipeline for cost and quality.

## Best Practices (End of Guide)

- Always set meaningful **`alt`** text for content images.
- Specify accurate **`sizes`** whenever layout width differs from viewport width.
- Use **`fill` + aspect-ratio wrapper** for unknown-height responsive cards.
- Prefer **static imports** for known local marketing assets.
- Tighten **`remotePatterns`** to least privilege paths.
- Monitor **LCP** element in RUM; adjust `priority` and `sizes` based on evidence.
- For **UGC**, enforce **minimum dimensions** server-side to avoid extreme aspect ratios breaking layout.
- Revisit image config when switching **CDN** vendors or **CMS** domains.

## Common Mistakes to Avoid

- Omitting **`sizes`** with `fill` or responsive layouts → massive over-downloads.
- Adding **`priority`** to many images → bandwidth contention and slower LCP.
- Using **`unoptimized`** globally “to fix errors” instead of fixing **`remotePatterns`**.
- **Disabling** image optimization in production without a **replacement CDN** strategy.
- Hardcoding **enormous** `width`/`height` without CSS scaling and without correct `sizes`.
- Serving **text-heavy** screenshots as ultra-high quality JPEG—use PNG or WebP with tuned quality.
- Forgetting **`alt`** on **product** images—hurts accessibility and SEO image search.
- Mismatch between **CSS breakpoints** and `sizes` strings.
- Using remote URLs with **querystring cache-busters** without understanding **CDN cache** fragmentation.
- Relying on `domains` with **overbroad** permission when `remotePatterns` could narrow access.
