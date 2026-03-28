# Next.js Topic 19 — Forms and Validation

Build accessible, secure forms in Next.js using controlled and uncontrolled inputs, React Hook Form, Zod/Yup/Joi, App Router server actions, file uploads, and progressive enhancement. Scenarios include e-commerce checkout, SaaS onboarding, blog comments, dashboard settings, and social profile editing—all with TypeScript.

## 📑 Table of Contents

- [19.1 Form Handling](#191-form-handling)
- [19.2 React Hook Form](#192-react-hook-form)
- [19.3 Validation Libraries](#193-validation-libraries)
- [19.4 Form State Management (App Router)](#194-form-state-management-app-router)
- [19.5 File Uploads](#195-file-uploads)
- [19.6 Form Best Practices](#196-form-best-practices)
- [Document-Wide Best Practices](#document-wide-best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## 19.1 Form Handling

### 19.1.1 Controlled Components

**Beginner Level**  
Controlled inputs store value in React state: `value={email}` and `onChange` updates state—what you type is always in sync with React.

**Intermediate Level**  
Use for dynamic validation messages and dependent fields (e.g., country → state dropdown) in a checkout form.

**Expert Level**  
Watch re-render cost on large forms; prefer uncontrolled + RHF or field-level subscriptions; memoize handlers with `useCallback` when passing to lists.

```tsx
"use client";

import { useState, type FormEvent } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(ev) => setEmail(ev.target.value)}
        required
      />
      <button type="submit">Subscribe</button>
    </form>
  );
}
```

**Key Points**

- Controlled pattern simplifies instant validation UX.
- Always pair labels with `htmlFor`/`id`.

### 19.1.2 Uncontrolled Components

**Beginner Level**  
Uncontrolled inputs use the DOM as source of truth; read values with `ref` on submit—less React state for simple forms.

**Intermediate Level**  
Good for integrating non-React widgets or migrating legacy markup in a marketing page.

**Expert Level**  
Combine with `FormData` in Server Actions for zero-JS progressive enhancement paths.

```tsx
"use client";

import { useRef, type FormEvent } from "react";

export function ContactForm() {
  const ref = useRef<HTMLFormElement>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const fd = new FormData(ref.current!);
    const payload = Object.fromEntries(fd.entries());
    console.log(payload);
  }

  return (
    <form ref={ref} onSubmit={onSubmit}>
      <input name="name" />
      <textarea name="message" />
      <button type="submit">Send</button>
    </form>
  );
}
```

**Key Points**

- Less boilerplate for one-shot forms.
- Harder to drive complex cross-field validation purely in React.

### 19.1.3 Submission Handling

**Beginner Level**  
`onSubmit` + `preventDefault` then `fetch` to an API route is the classic SPA pattern.

**Intermediate Level**  
Return typed JSON errors `{ fieldErrors: Record<string, string[]> }` for inline display in a SaaS settings form.

**Expert Level**  
Use idempotency keys for payment submissions; retry-safe POST handling with duplicate detection.

```typescript
// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  displayName: z.string().min(2).max(40),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ fieldErrors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  return NextResponse.json({ ok: true });
}
```

**Key Points**

- Separate transport errors from validation errors in UI.
- Disable submit button during in-flight requests.

### 19.1.4 Server Actions

**Beginner Level**  
Server Actions let you post a form directly to a function on the server without writing a separate API route—great for Next.js App Router.

**Intermediate Level**  
Mark action with `"use server"`; accept `FormData` or typed objects; revalidate tags after mutation.

**Expert Level**  
Authorize inside the action with session lookup; never trust hidden fields for permissions; rate limit sensitive actions.

```tsx
// app/actions/post.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3),
  body: z.string().min(10),
});

export type CreatePostState = { error?: string; fieldErrors?: Record<string, string[]> };

export async function createPost(_prev: CreatePostState, formData: FormData): Promise<CreatePostState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    return { fieldErrors: fe as Record<string, string[]> };
  }
  revalidatePath("/blog");
  return {};
}
```

```tsx
// app/blog/new/PostForm.tsx
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createPost, type CreatePostState } from "@/app/actions/post";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Publishing…" : "Publish"}
    </button>
  );
}

const initial: CreatePostState = {};

export function PostForm() {
  const [state, action] = useFormState(createPost, initial);
  return (
    <form action={action}>
      <input name="title" aria-invalid={!!state.fieldErrors?.title} />
      {state.fieldErrors?.title?.map((m) => (
        <p key={m} className="text-red-600 text-sm">
          {m}
        </p>
      ))}
      <textarea name="body" />
      {state.fieldErrors?.body?.map((m) => (
        <p key={m} className="text-red-600 text-sm">
          {m}
        </p>
      ))}
      <SubmitButton />
    </form>
  );
}
```

**Key Points**

- Server Actions still need client-side UX for instant feedback when desired.
- Validate on server always—client validation is supplementary.

### 19.1.5 Progressive Enhancement

**Beginner Level**  
Forms work without JavaScript when using native `action`/`method` to a route that returns HTML—blog comment fallback.

**Intermediate Level**  
Layer `onSubmit` enhancements when JS loads; keep semantic HTML and server handlers.

**Expert Level**  
Use Server Actions + `useFormStatus` while ensuring baseline HTML validation attributes and meaningful server redirects.

```tsx
export function CommentForm({ postId }: { postId: string }) {
  return (
    <form action={`/api/posts/${postId}/comments`} method="post">
      <textarea name="body" required minLength={2} />
      <button type="submit">Comment</button>
    </form>
  );
}
```

**Key Points**

- Enhancement improves UX; server validation ensures security.
- Test with JS disabled for public forms when required.

---

## 19.2 React Hook Form

### 19.2.1 Setup

**Beginner Level**  
Install `react-hook-form`; wrap inputs with `register` or `Controller` for controlled components like MUI.

**Intermediate Level**  
Combine with `@hookform/resolvers` + Zod for schema validation.

**Expert Level**  
Split large wizard forms with `useFieldArray` and lazy default values loaded asynchronously for dashboard onboarding.

```bash
npm install react-hook-form @hookform/resolvers zod
```

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  sku: z.string().min(1),
  price: z.coerce.number().positive(),
});

export type ProductFormValues = z.infer<typeof schema>;

export function useProductForm(defaultValues?: Partial<ProductFormValues>) {
  return useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { sku: "", price: 0, ...defaultValues },
    mode: "onBlur",
  });
}
```

**Key Points**

- Choose validation `mode` based on UX (`onChange` can be noisy).
- Tree-shake unused resolvers.

### 19.2.2 `useForm`

**Beginner Level**  
`useForm` returns helpers: `register`, `handleSubmit`, `formState`.

**Intermediate Level**  
Reset form after successful SaaS team invite to clear fields.

**Expert Level**  
Use `watch` sparingly—prefer `useWatch` to isolate re-renders in big forms.

```tsx
"use client";

import { useProductForm } from "./useProductForm";

export function ProductForm() {
  const { register, handleSubmit, formState, reset } = useProductForm();

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await fetch("/api/products", { method: "POST", body: JSON.stringify(values) });
        reset();
      })}
    >
      <input {...register("sku")} />
      {formState.errors.sku && <p>{formState.errors.sku.message}</p>}
      <input type="number" step="0.01" {...register("price")} />
      <button type="submit" disabled={formState.isSubmitting}>
        Save
      </button>
    </form>
  );
}
```

**Key Points**

- `formState` is proxy-based—destructure per RHF docs to subscribe correctly.

### 19.2.3 `register`

**Beginner Level**  
`register("name")` spreads `name`, `onBlur`, `ref` onto inputs.

**Intermediate Level**  
Pass validation rules inline or via resolver exclusively—avoid duplicating conflicting rules.

**Expert Level**  
Custom components need `Controller` to wire value/onChange/ref properly.

```tsx
<input
  {...register("email", {
    required: "Email is required",
    pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
  })}
/>
```

**Key Points**

- `register` fits native inputs best.
- For accessibility, connect `aria-invalid` and `aria-describedby` to error ids.

### 19.2.4 `handleSubmit`

**Beginner Level**  
`handleSubmit(onValid, onInvalid)` centralizes submission.

**Intermediate Level**  
`onValid` can be async; RHF tracks `isSubmitting` until promise resolves.

**Expert Level**  
Combine with optimistic UI updates and server error mapping in `setError` for per-field server messages.

```tsx
const { handleSubmit, setError } = useProductForm();

const onSubmit = handleSubmit(async (values) => {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  if (res.status === 422) {
    const data = (await res.json()) as { fieldErrors: Record<string, string[]> };
    for (const [key, msgs] of Object.entries(data.fieldErrors)) {
      setError(key as keyof ProductFormValues, { message: msgs[0] });
    }
    return;
  }
});
```

**Key Points**

- Map server field names to form field names consistently.

### 19.2.5 Validation Rules

**Beginner Level**  
Inline `required`, `minLength`, `pattern` options in `register`.

**Intermediate Level**  
Prefer Zod schema as single source of truth shared with Server Actions.

**Expert Level**  
Cross-field validation with `refine` in Zod (password confirmation) and `superRefine` for async uniqueness checks debounced.

```typescript
import { z } from "zod";

export const signupSchema = z
  .object({
    password: z.string().min(10),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords must match" });
```

**Key Points**

- Keep schemas next to server validators for parity.

### 19.2.6 Error Handling

**Beginner Level**  
Show `errors.field?.message` under inputs.

**Intermediate Level**  
Announce errors with `role="alert"` for screen readers in a checkout flow.

**Expert Level**  
Focus first invalid field on submit via `setFocus` from RHF.

**Key Points**

- Distinguish client validation from server/network errors in messaging.

### 19.2.7 Form State (`formState`, dirty, touched)

**Beginner Level**  
`isDirty` tells you if user changed anything—warn before navigation away from SaaS settings.

**Intermediate Level**  
`touchedFields` drives showing errors only after interaction.

**Expert Level**  
Persist draft values to `sessionStorage` for long social posts with debounce (mind PII).

```tsx
const {
  formState: { isDirty, isSubmitting },
} = useProductForm();
```

**Key Points**

- `formState` updates are asynchronous—read RHF docs for subscription nuances.

---

## 19.3 Validation Libraries

### 19.3.1 Zod

**Beginner Level**  
Zod schemas describe shapes and parse unknown JSON into typed values—popular with TypeScript.

**Intermediate Level**  
`z.coerce.number()` for form strings; `safeParse` returns discriminated union for error handling.

**Expert Level**  
`.brand()` types for nominal typing; transform pipelines normalizing emails; compose base schemas for API + forms.

```typescript
import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z.string().min(2),
  addressLine1: z.string().min(5),
  city: z.string().min(2),
  postalCode: z.string().regex(/^[0-9]{5}$/),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
```

**Key Points**

- Share schema between client and server in monorepos.

### 19.3.2 Yup

**Beginner Level**  
Yup is a schema builder with similar goals to Zod—common in older codebases.

**Intermediate Level**  
Use `yupResolver` with RHF.

**Expert Level**  
Gradually migrate to Zod for better TS inference if starting greenfield.

```typescript
import * as yup from "yup";

export const profileSchema = yup.object({
  displayName: yup.string().required().min(2),
  bio: yup.string().max(280),
});

export type ProfileInput = yup.InferType<typeof profileSchema>;
```

**Key Points**

- Know bundle size vs Zod for edge bundles.

### 19.3.3 Joi

**Beginner Level**  
Joi is popular in Node APIs for validation—often used server-side only.

**Intermediate Level**  
Validate `FormData` converted to objects in Route Handlers for uploads.

**Expert Level**  
Map Joi errors to consistent field error objects for the client.

```typescript
import Joi from "joi";

export const inviteSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid("member", "admin").required(),
});
```

**Key Points**

- Avoid shipping large Joi to client when unnecessary.

### 19.3.4 Client-Side Validation

**Beginner Level**  
Instant feedback as user types or blurs—improves long registration forms.

**Intermediate Level**  
Mirror server rules to avoid divergent behavior; generate from shared schema when possible.

**Expert Level**  
Debounce async validators (username availability) and cancel in-flight requests on change.

**Key Points**

- Client validation is UX, not security.

### 19.3.5 Server-Side Validation

**Beginner Level**  
Always validate on server—attackers can bypass browsers.

**Intermediate Level**  
Return structured field errors for forms; generic error for unexpected failures.

**Expert Level**  
Add honeypot fields, rate limits, and bot protection on public endpoints (blog comments).

```typescript
import { checkoutSchema, type CheckoutInput } from "@/lib/validation/checkout";

export function parseCheckoutBody(
  body: unknown,
): { ok: true; data: CheckoutInput } | { ok: false; fieldErrors: Record<string, string[]> } {
  const r = checkoutSchema.safeParse(body);
  if (r.success) return { ok: true, data: r.data };
  return { ok: false, fieldErrors: r.error.flatten().fieldErrors as Record<string, string[]> };
}
```

**Key Points**

- Treat validation as part of your API contract.

---

## 19.4 Form State Management (App Router)

### 19.4.1 `useFormState`

**Beginner Level**  
Pairs with Server Actions to receive serializable return state after each submission—error messages without client routers.

**Intermediate Level**  
Return discriminated unions `{ status: "error", fieldErrors } | { status: "success" }` for typed UI.

**Expert Level**  
Seed initial state from server props by merging into `initialState` immutably.

**Key Points**

- State must be JSON-serializable.

### 19.4.2 `useFormStatus`

**Beginner Level**  
Child of `<form>` reads `pending` to disable submit button—native feeling loading state.

**Intermediate Level**  
Nest submit button in small component to subscribe to status.

**Expert Level**  
Combine with `aria-busy` on form for accessibility.

```tsx
"use client";

import { useFormStatus } from "react-dom";

export function SaveBar() {
  const { pending, data } = useFormStatus();
  return <output aria-live="polite">{pending ? `Saving ${data?.get("title") ?? ""}…` : null}</output>;
}
```

**Key Points**

- Must render under the form context.

### 19.4.3 Pending States

**Beginner Level**  
Show spinners during `isSubmitting` (RHF) or `pending` (useFormStatus).

**Intermediate Level**  
Prevent double-submit by disabling buttons.

**Expert Level**  
Use `useTransition` for related optimistic navigations.

**Key Points**

- Avoid layout shift (CLS) when showing pending UI.

### 19.4.4 Optimistic UI

**Beginner Level**  
Update UI immediately before server confirms—social like buttons.

**Intermediate Level**  
Revert on failure with toast + rollback using `useOptimistic` where applicable.

**Expert Level**  
Server remains authoritative; handle races with versioning.

```tsx
"use client";

import { useOptimistic, useTransition, type FormEvent } from "react";

type Comment = { id: string; body: string };

export function CommentList({ initial }: { initial: Comment[] }) {
  const [items, setItems] = useOptimistic(initial, (state, newItem: Comment) => [...state, newItem]);
  const [, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = String(fd.get("body") ?? "");
    const temp: Comment = { id: `temp_${crypto.randomUUID()}`, body };
    startTransition(async () => {
      setItems(temp);
    });
    e.currentTarget.reset();
  }

  return (
    <>
      <ul>
        {items.map((c) => (
          <li key={c.id}>{c.body}</li>
        ))}
      </ul>
      <form onSubmit={onSubmit}>
        <input name="body" />
        <button type="submit">Post</button>
      </form>
    </>
  );
}
```

**Key Points**

- Do not optimistically confirm payments without server reconciliation.

---

## 19.5 File Uploads

### 19.5.1 File Input

**Beginner Level**  
`<input type="file" name="avatar" accept="image/*" />` lets users pick files.

**Intermediate Level**  
Use `multiple` for gallery uploads on a social profile.

**Expert Level**  
Client-side size/type checks before upload; still re-validate server-side.

```tsx
<input type="file" name="resume" accept=".pdf,application/pdf" />
```

**Key Points**

- Never trust `accept` alone for security.

### 19.5.2 `FormData` API

**Beginner Level**  
`new FormData(form)` captures fields and files for `fetch` POST.

**Intermediate Level**  
Append metadata only after server auth verification—not from hidden client fields alone.

**Expert Level**  
Stream large uploads to S3 multipart from Route Handlers with backpressure awareness.

```tsx
async function uploadAvatar(form: HTMLFormElement) {
  const fd = new FormData(form);
  await fetch("/api/me/avatar", { method: "POST", body: fd });
}
```

**Key Points**

- Do not set `Content-Type` manually when sending `FormData`.

### 19.5.3 Upload to Server (Route Handler)

**Beginner Level**  
In Route Handler, `const form = await req.formData()` then `form.get("file")`.

**Intermediate Level**  
Check `file instanceof File`; validate `file.type` and `file.size`.

**Expert Level**  
Scan with antivirus in enterprise; store in object storage, not ephemeral local disk.

```typescript
import { NextResponse } from "next/server";

const MAX = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.size > MAX) {
    return NextResponse.json({ error: "Too large" }, { status: 413 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  return NextResponse.json({ ok: true, bytes: buf.length });
}
```

**Key Points**

- Authenticate uploads—anonymous endpoints get abused.

### 19.5.4 Image Upload / Processing

**Beginner Level**  
Resize images client-side with canvas for avatars before upload.

**Intermediate Level**  
Use `sharp` on server to generate thumbnails for marketplace galleries.

**Expert Level**  
Offload to CDN transformers with signed URLs; strip EXIF for privacy.

```typescript
import sharp from "sharp";

export async function makeThumbnail(input: Buffer) {
  return sharp(input).resize(256, 256, { fit: "cover" }).webp({ quality: 80 }).toBuffer();
}
```

**Key Points**

- Watch serverless CPU/memory limits for `sharp`.

### 19.5.5 Cloud Storage (S3 / Cloudinary)

**Beginner Level**  
Upload files to S3 or Cloudinary for durable URLs—avoid large binaries in SQL.

**Intermediate Level**  
Use pre-signed POST URLs so browsers upload directly to S3.

**Expert Level**  
Short-lived signed URLs, private buckets, lifecycle policies for drafts.

```typescript
export type PresignedUpload = { url: string; fields: Record<string, string> };

export async function createPresignedProductImageUpload(_sku: string): Promise<PresignedUpload> {
  return { url: "https://s3.amazonaws.com/bucket", fields: {} };
}
```

**Key Points**

- Never expose long-lived cloud credentials to the client.

---

## 19.6 Form Best Practices

### 19.6.1 Accessibility

**Beginner Level**  
Labels, `aria-invalid`, `aria-describedby` for errors, visible focus rings.

**Intermediate Level**  
Group related fields with `fieldset`/`legend` for addresses in checkout.

**Expert Level**  
Test with VoiceOver/NVDA; `role="alert"` for critical validation summaries.

**Key Points**

- Placeholder is not a label.

### 19.6.2 Error Messages

**Beginner Level**  
Specific messages beat generic “Invalid input”.

**Intermediate Level**  
Map server codes to i18n strings for global SaaS.

**Expert Level**  
Avoid leaking whether an email exists when security requires uniform login errors.

**Key Points**

- Do not rely on color alone to signal errors.

### 19.6.3 Loading States

**Beginner Level**  
Disable submit and show spinner on async submit.

**Intermediate Level**  
Use `useFormStatus` pending for Server Actions.

**Expert Level**  
Skeleton screens for wizard steps fetching defaults.

**Key Points**

- Manage focus after success (move to confirmation heading).

### 19.6.4 Reset Behavior

**Beginner Level**  
`reset()` in RHF after success.

**Intermediate Level**  
Clear file inputs—may require key remount.

**Expert Level**  
Preserve sticky defaults across submissions where appropriate.

**Key Points**

- Confirm before resetting long `isDirty` forms.

### 19.6.5 Validation Feedback Timing

**Beginner Level**  
Validate on blur for less noise; on submit for simple forms.

**Intermediate Level**  
`mode: "onTouched"` balances UX in dashboards.

**Expert Level**  
Adaptive: first submit shows all errors; thereafter per-field live validation.

**Key Points**

- Payment flows often need stricter, earlier feedback.

### 19.6.6 Security

**Beginner Level**  
CSRF protection for cookie sessions; SameSite cookies.

**Intermediate Level**  
Honeypot fields for bots on public comment forms.

**Expert Level**  
Rate limit, CAPTCHA on signup, CSP to mitigate XSS.

**Key Points**

- Never execute uploaded files on server.
- Sanitize rich text server-side.

---

## Document-Wide Best Practices

1. Single schema source (Zod) shared across Server Actions and client helpers when possible.
2. Always validate on server; mirror rules client-side for UX.
3. Use semantic HTML forms for accessibility and progressive enhancement.
4. Structure API errors as field-keyed maps for RHF `setError`.
5. Instrument form abandonment analytics ethically.
6. Keep sensitive operations behind auth checks inside Server Actions.
7. Prefer presigned uploads for large files to reduce server memory spikes.
8. Test keyboard-only flows for critical forms (checkout, login).
9. Localize validation messages where needed.
10. Version API payloads when forms evolve with the backend.

---

## Common Mistakes to Avoid

1. Trusting client-side validation alone for security or billing correctness.
2. Omitting `name` attributes when using native Server Action `FormData`.
3. Huge controlled forms causing janky typing.
4. Setting `Content-Type: application/json` when sending `FormData`.
5. Uploading unlimited file sizes to serverless functions.
6. Displaying raw stack traces to users on 500 errors from form posts.
7. Using password fields without HTTPS in production.
8. Forgetting to disable submit during pending—double-charges on checkout.
9. Mismatched field names between client form and server parser.
10. Storing user uploads on ephemeral local filesystem in serverless.

---

### Appendix: Decision matrix

| Need | Prefer |
| --- | --- |
| Max progressive enhancement | Native `form` + Server Actions + HTML constraints |
| Complex client validation | RHF + Zod resolver |
| Heavy file uploads | Presigned S3 + metadata Route Handler |
| Public spam risk | Server validation + rate limits + honeypot |

---

_End of Topic 19 — Forms and Validation._