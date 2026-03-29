# Flask 3.1.3 — File Uploads

Handling uploads safely is essential for marketplaces, social feeds, SaaS document hubs, and support portals. This guide walks through **HTML forms**, **`request.files`**, **validation** (type, size, name, MIME), **storage layout**, **images** (resize, thumbnails, optimization), **multiple files**, and **advanced** topics (extensions, scanning, chunked uploads, cloud storage) using Flask 3.1.3 on Python 3.9+.

---

## 📑 Table of Contents

1. [17.1 File Upload Basics](#171-file-upload-basics)
2. [17.2 File Validation](#172-file-validation)
3. [17.3 File Processing](#173-file-processing)
4. [17.4 Image Handling](#174-image-handling)
5. [17.5 Multiple File Uploads](#175-multiple-file-uploads)
6. [17.6 Advanced File Operations](#176-advanced-file-operations)
7. [Best Practices](#best-practices-summary)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
9. [Comparison Tables](#comparison-tables)

---

## 17.1 File Upload Basics

Browsers upload via **`multipart/form-data`**. Flask exposes **`FileStorage`** objects in **`request.files`**.

### 17.1.1 File Input Form

Use **`enctype="multipart/form-data"`** and **`input type="file"`**.

#### 🟢 Beginner Example

```html
<form method="post" enctype="multipart/form-data" action="/upload">
  <input type="file" name="photo" />
  <button type="submit">Upload</button>
</form>
```

#### 🟡 Intermediate Example

```html
<form method="post" enctype="multipart/form-data">
  <input type="file" name="document" accept=".pdf,.doc,.docx" required />
  <input type="hidden" name="csrf_token" value="{{ csrf_token() }}" />
  <button>Submit</button>
</form>
```

#### 🔴 Expert Example

```html
<!-- Multiple files same field name -->
<input type="file" name="attachments" multiple />
```

#### 🌍 Real-Time Example (E-Commerce Seller Onboarding)

```html
<form method="post" enctype="multipart/form-data">
  <label>GST certificate (PDF)</label>
  <input type="file" name="gst_cert" accept="application/pdf" />
  <label>Store logo (PNG/JPEG)</label>
  <input type="file" name="logo" accept="image/png,image/jpeg" />
</form>
```

### 17.1.2 File Receiving

Access **`request.files['field']`** or **`.get()`**; check **`.filename`** empty = no file.

#### 🟢 Beginner Example

```python
from flask import Flask, request

app = Flask(__name__)

@app.post("/upload")
def upload():
    f = request.files.get("photo")
    if not f or f.filename == "":
        return "No file", 400
    return "OK"
```

#### 🟡 Intermediate Example

```python
from flask import Flask, request, jsonify

@app.post("/api/upload")
def api_upload():
    if "document" not in request.files:
        return jsonify(error="missing_file"), 400
    f = request.files["document"]
    return jsonify(name=f.filename, ctype=f.mimetype)
```

#### 🔴 Expert Example

```python
from werkzeug.datastructures import FileStorage

def require_file(req, name: str) -> FileStorage:
    f = req.files.get(name)
    if not isinstance(f, FileStorage) or not f.filename:
        raise BadRequest("file required")  # noqa: F821
    return f
```

#### 🌍 Real-Time Example (SaaS Invoice Ingest)

```python
f = request.files["invoice"]
stream = f.stream
# pass stream to parser without full disk write if small
```

### 17.1.3 File Object Properties

**`filename`**, **`content_type`** / **`mimetype`**, **`stream`**, **`save(path)`**.

#### 🟢 Beginner Example

```python
@app.post("/meta")
def meta():
    f = request.files["f"]
    return {"name": f.filename, "mimetype": f.mimetype}
```

#### 🟡 Intermediate Example

```python
f = request.files["f"]
data = f.read()
f.seek(0)  # reset if saving later
```

#### 🔴 Expert Example

```python
# Content-Length may be missing for chunked; use limits in save
from werkzeug.utils import secure_filename
```

#### 🌍 Real-Time Example (Social Video Metadata)

```python
return jsonify(
    filename=f.filename,
    mimetype=f.mimetype,
    content_length=request.content_length,
)
```

### 17.1.4 File Saving

Use **`secure_filename`** and **`save()`** to a configured folder outside static source if private.

#### 🟢 Beginner Example

```python
from werkzeug.utils import secure_filename
import os

UPLOAD_FOLDER = "/tmp/up"

@app.post("/save")
def save():
    f = request.files["f"]
    name = secure_filename(f.filename)
    path = os.path.join(UPLOAD_FOLDER, name)
    f.save(path)
    return {"saved": name}
```

#### 🟡 Intermediate Example

```python
import uuid

def unique_name(original: str) -> str:
    ext = os.path.splitext(secure_filename(original))[1].lower()
    return f"{uuid.uuid4().hex}{ext}"

path = os.path.join(UPLOAD_FOLDER, unique_name(f.filename))
f.save(path)
```

#### 🔴 Expert Example

```python
import os
fd, tmp_path = tempfile.mkstemp(dir=UPLOAD_FOLDER)
os.close(fd)
try:
    f.save(tmp_path)
    os.replace(tmp_path, final_path)
except Exception:
    os.unlink(tmp_path)
    raise
```

#### 🌍 Real-Time Example (E-Commerce Return Labels)

```python
# Save to dated folder for support audits
day = datetime.utcnow().strftime("%Y-%m-%d")
dest_dir = os.path.join(UPLOAD_FOLDER, "returns", day)
os.makedirs(dest_dir, exist_ok=True)
f.save(os.path.join(dest_dir, unique_name(f.filename)))
```

### 17.1.5 Upload Directory Configuration

Use **`app.config['MAX_CONTENT_LENGTH']`** and absolute **`UPLOAD_FOLDER`**.

#### 🟢 Beginner Example

```python
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5 MB
```

#### 🟡 Intermediate Example

```python
app.config["UPLOAD_FOLDER"] = os.path.join(app.instance_path, "uploads")
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
```

#### 🔴 Expert Example

```python
@app.errorhandler(413)
def too_large(e):
    return jsonify(error="payload_too_large"), 413
```

#### 🌍 Real-Time Example (SaaS Per-Tenant Quota)

```python
# Combine MAX_CONTENT_LENGTH global + per-tenant accounting in view
```

---

## 17.2 File Validation

Never trust **filename** or **client MIME** alone.

### 17.2.1 File Type Validation

Whitelist **extensions** and optionally **magic bytes**.

#### 🟢 Beginner Example

```python
ALLOWED = {".png", ".jpg", ".jpeg"}

def allowed_file(name: str) -> bool:
    return os.path.splitext(name)[1].lower() in ALLOWED
```

#### 🟡 Intermediate Example

```python
import imghdr

def is_png_or_jpeg(path: str) -> bool:
    kind = imghdr.what(path)
    return kind in ("png", "jpeg")
```

#### 🔴 Expert Example

```python
import magic  # python-magic

def real_mime(path: str) -> str:
    return magic.from_file(path, mime=True)
```

#### 🌍 Real-Time Example (Social Avatar)

```python
if real_mime(tmp) not in {"image/jpeg", "image/png", "image/webp"}:
    abort(400)
```

### 17.2.2 File Size Validation

**`MAX_CONTENT_LENGTH`**, **`content_length`**, or **`stream.read(n+1)`** pattern.

#### 🟢 Beginner Example

```python
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024
```

#### 🟡 Intermediate Example

```python
MAX = 2 * 1024 * 1024
if request.content_length and request.content_length > MAX:
    abort(413)
```

#### 🔴 Expert Example

```python
def read_limited(stream, max_bytes: int) -> bytes:
    chunk = stream.read(max_bytes + 1)
    if len(chunk) > max_bytes:
        raise ValueError("too_large")
    return chunk
```

#### 🌍 Real-Time Example (SaaS Attachment)

```python
# Enterprise tier: 25MB; free tier: 5MB
max_b = g.tenant.upload_limit  # noqa: F821
```

### 17.2.3 File Name Validation

**`secure_filename`** strips path segments; generate **UUID** names for storage.

#### 🟢 Beginner Example

```python
name = secure_filename(f.filename)
if name == "":
    abort(400)
```

#### 🟡 Intermediate Example

```python
if ".." in f.filename or f.filename.startswith("/"):
    abort(400)
```

#### 🔴 Expert Example

```python
# Unicode normalization + max length
import unicodedata

def safe_display_name(name: str) -> str:
    name = unicodedata.normalize("NFKC", name)
    return name[:200]
```

#### 🌍 Real-Time Example (E-Commerce Bulk CSV)

```python
# Reject executable extensions even if renamed
BLOCK = {".exe", ".bat", ".sh", ".php"}
```

### 17.2.4 Security Checks

Scan for **zip bombs**, **SVG script**, **polyglot files**, **SSRF** if fetching URLs.

#### 🟢 Beginner Example

```python
# Do not execute uploaded files; store outside webroot
```

#### 🟡 Intermediate Example

```python
# For images, re-encode with Pillow to strip metadata/exploits
```

#### 🔴 Expert Example

```python
# ClamAV or cloud scanning pipeline before marking file "available"
```

#### 🌍 Real-Time Example (SaaS DLP)

```python
# Async job: policy scan before sharing link goes live
```

### 17.2.5 MIME Type Validation

Compare **magic MIME** to **allowlist**; ignore **`f.mimetype`** for security boundary.

#### 🟢 Beginner Example

```python
if f.mimetype not in ALLOWED_MIMES:
    abort(400)
```

#### 🟡 Intermediate Example

```python
ALLOWED_MIMES = {"image/png", "image/jpeg"}
```

#### 🔴 Expert Example

```python
# After save, verify magic; delete if mismatch
```

#### 🌍 Real-Time Example (Marketplace Listing Photos)

```python
# Only image/* after Pillow open verify
```

---

## 17.3 File Processing

Organize **directories**, **permissions**, and **unique names** for scale.

### 17.3.1 File Storage

Local disk, **object storage** (S3), or **CDN** origin.

#### 🟢 Beginner Example

```python
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
f.save(os.path.join(UPLOAD_FOLDER, secure_filename(f.filename)))
```

#### 🟡 Intermediate Example

```python
import boto3

s3 = boto3.client("s3")
s3.upload_fileobj(f.stream, "my-bucket", key)
```

#### 🔴 Expert Example

```python
# Presigned POST from browser direct-to-S3; Flask only issues policy
```

#### 🌍 Real-Time Example (E-Commerce CDN)

```python
# Save to bucket `static-assets`, CloudFront invalidation on replace
```

### 17.3.2 File Naming

**UUID + ext**; optional **content hash** for deduplication.

#### 🟢 Beginner Example

```python
key = f"{uuid.uuid4().hex}.jpg"
```

#### 🟡 Intermediate Example

```python
import hashlib

h = hashlib.sha256(data).hexdigest()[:16]
key = f"{h}{ext}"
```

#### 🔴 Expert Example

```python
# Content-addressable storage: path = ab/cd/{hash}
```

#### 🌍 Real-Time Example (Social Deduplicate Memes)

```python
if blob_exists(hash):
    return existing_url
```

### 17.3.3 Directory Organization

Shard by **date**, **user id**, or **hash prefix** to avoid huge directories.

#### 🟢 Beginner Example

```python
sub = datetime.utcnow().strftime("%Y/%m/%d")
```

#### 🟡 Intermediate Example

```python
prefix = user_id[:2]
path = os.path.join(UPLOAD_FOLDER, prefix, user_id, name)
```

#### 🔴 Expert Example

```python
# Leveling: aa/bb/cc/{hash}
```

#### 🌍 Real-Time Example (SaaS Tenant Isolation)

```python
path = os.path.join(UPLOAD_FOLDER, tenant_id, doc_id)
```

### 17.3.4 File Permissions

**`chmod 640`** on Unix; containers run as non-root.

#### 🟢 Beginner Example

```python
os.chmod(path, 0o640)
```

#### 🟡 Intermediate Example

```python
import stat
os.chmod(path, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP)
```

#### 🔴 Expert Example

```python
# SELinux/AppArmor labels in hardened hosts
```

#### 🌍 Real-Time Example (HIPAA SaaS)

```python
# Separate volume with encryption at rest
```

### 17.3.5 Unique File Names

Combine **UUID** + collision check.

#### 🟢 Beginner Example

```python
while os.path.exists(target):
    target = os.path.join(dir, uuid.uuid4().hex + ext)
```

#### 🟡 Intermediate Example

```python
# DB unique constraint on storage_key
```

#### 🔴 Expert Example

```python
# Object storage: keys are naturally unique; overwrite=false
```

#### 🌍 Real-Time Example (E-Commerce Product Images)

```python
sku = request.form["sku"]
key = f"products/{sku}/{uuid.uuid4().hex}.webp"
```

---

## 17.4 Image Handling

Use **Pillow** for decode/resize/transcode.

### 17.4.1 Image Upload

Accept only images; open with **`Image.open`** to verify.

#### 🟢 Beginner Example

```python
from PIL import Image

f = request.files["img"]
img = Image.open(f.stream)
img.verify()
```

#### 🟡 Intermediate Example

```python
f.stream.seek(0)
img = Image.open(f.stream).convert("RGB")
```

#### 🔴 Expert Example

```python
# Decompression bomb limits
Image.MAX_IMAGE_PIXELS = 50_000_000
```

#### 🌍 Real-Time Example (Social Story Image)

```python
img = Image.open(io.BytesIO(data))
if img.width * img.height > 25_000_000:
    abort(400)
```

### 17.4.2 Image Validation

Aspect ratio, dimensions, alpha channel rules.

#### 🟢 Beginner Example

```python
if img.width > 4000 or img.height > 4000:
    abort(400)
```

#### 🟡 Intermediate Example

```python
ratio = img.width / img.height
if ratio < 0.5 or ratio > 2:
    abort(400, "bad_aspect")
```

#### 🔴 Expert Example

```python
# NSFW ML classifier async job
```

#### 🌍 Real-Time Example (E-Commerce Hero Banner)

```python
# Require min 1200px width for quality
```

### 17.4.3 Image Resizing

**`thumbnail`** or **`resize`** with **`LANCZOS`**.

#### 🟢 Beginner Example

```python
img.thumbnail((256, 256))
img.save(out_path)
```

#### 🟡 Intermediate Example

```python
def fit_cover(img, w, h):
    img = img.copy()
    img.thumbnail((w, h), Image.Resampling.LANCZOS)
    return img
```

#### 🔴 Expert Example

```python
# Sharp-like pipeline: generate AVIF + WebP + JPEG fallback
```

#### 🌍 Real-Time Example (SaaS Doc Thumbnails)

```python
# PDF page 1 rasterize + thumb (via pdf2image)
```

### 17.4.4 Thumbnail Generation

Store **`thumb/`** prefix or separate key.

#### 🟢 Beginner Example

```python
thumb = img.copy()
thumb.thumbnail((128, 128))
thumb.save(thumb_path)
```

#### 🟡 Intermediate Example

```python
# Celery task: original upload sync, thumbs async
```

#### 🔴 Expert Example

```python
# On-the-fly resizing with signed URLs + CDN image optimizer
```

#### 🌍 Real-Time Example (Social Feed)

```python
sizes = [(64, 64), (320, 320), (1080, 1080)]
```

### 17.4.5 Image Optimization

**`optimize=True`**, **`quality`**, **progressive JPEG**, **WebP**.

#### 🟢 Beginner Example

```python
img.save(path, format="JPEG", quality=85, optimize=True)
```

#### 🟡 Intermediate Example

```python
img.save(path, format="WEBP", quality=80, method=6)
```

#### 🔴 Expert Example

```python
# mozjpeg / guetzli external tools in worker
```

#### 🌍 Real-Time Example (E-Commerce PLP)

```python
# Serve WebP with Accept negotiation at CDN
```

---

## 17.5 Multiple File Uploads

### 17.5.1 Multiple File Input

Same **`name`** with **`multiple`** or **`name[]`**.

#### 🟢 Beginner Example

```html
<input type="file" name="files" multiple />
```

#### 🟡 Intermediate Example

```python
files = request.files.getlist("files")
```

#### 🔴 Expert Example

```python
# Cap count
if len(files) > 20:
    abort(400)
```

#### 🌍 Real-Time Example (SaaS Expense Receipts)

```python
for f in request.files.getlist("receipts"):
    ...
```

### 17.5.2 Multiple File Processing

Loop with **per-file validation** and **aggregate errors**.

#### 🟢 Beginner Example

```python
for f in files:
    if f.filename:
        f.save(...)
```

#### 🟡 Intermediate Example

```python
errors = []
for i, f in enumerate(files):
    try:
        process(f)
    except ValueError as e:
        errors.append({"index": i, "msg": str(e)})
return jsonify(errors=errors), 422 if errors else 200
```

#### 🔴 Expert Example

```python
# Transactional: all succeed or none (DB + storage)
```

#### 🌍 Real-Time Example (E-Commerce Bulk SKU Images)

```python
# Map filename stem to SKU
```

### 17.5.3 Batch Processing

Queue **Celery** / **RQ** for heavy work.

#### 🟢 Beginner Example

```python
enqueue_job(batch_id)
```

#### 🟡 Intermediate Example

```python
from celery import chain
chain(process.s(batch_id), notify.s()).apply_async()
```

#### 🔴 Expert Example

```python
# idempotent workers with dedupe keys
```

#### 🌍 Real-Time Example (Social Import Album)

```python
# Progress in Redis: batch:{id}:done / :total
```

### 17.5.4 Progress Tracking

**XHR/fetch** upload with **`XMLHttpRequest.upload.onprogress`**; server uses **chunked** or **polling job status**.

#### 🟢 Beginner Example

```javascript
xhr.upload.addEventListener("progress", (e) => { /* UI */ });
```

#### 🟡 Intermediate Example

```python
@app.get("/jobs/<job_id>")
def job_status(job_id):
    return jsonify(redis_client.hgetall(f"job:{job_id}"))
```

#### 🔴 Expert Example

```python
# tus.io resumable protocol
```

#### 🌍 Real-Time Example (SaaS Large CAD Files)

```python
# WebSocket push on stage completion
```

### 17.5.5 Error Handling

Partial success strategies: **207 Multi-Status** or **JSON array of per-file results**.

#### 🟢 Beginner Example

```python
return jsonify(ok=False, file=bad_name), 400
```

#### 🟡 Intermediate Example

```python
return jsonify(results=[{"name": n, "ok": True}, {"name": n2, "ok": False, "err": "..."}])
```

#### 🔴 Expert Example

```python
# Compensating deletes for stored files if DB txn fails
```

#### 🌍 Real-Time Example (Marketplace Bulk Upload)

```python
# CSV row errors downloadable as report
```

---

## 17.6 Advanced File Operations

### 17.6.1 File-Flask Extension

Community patterns: **Flask-Uploads** (legacy) or **manual** + **S3**; prefer maintained libs.

#### 🟢 Beginner Example

```python
# Use werkzeug FileStorage + small helpers
```

#### 🟡 Intermediate Example

```python
# flask-reuploaded successor if adopted in project
```

#### 🔴 Expert Example

```python
# Unified storage interface: LocalBackend, S3Backend
```

#### 🌍 Real-Time Example (SaaS White-Label)

```python
# Per-tenant S3 bucket backend selection
```

### 17.6.2 Secure Uploads

**Out-of-band** execution, **virus scan**, **private buckets** with signed URLs.

#### 🟢 Beginner Example

```python
# Never `eval` or `subprocess` on user file
```

#### 🟡 Intermediate Example

```python
# AppArmor profile denying exec on upload dir
```

#### 🔴 Expert Example

```python
# Isolate scanning in sandboxed VM
```

#### 🌍 Real-Time Example (Enterprise Support)

```python
# DLP + AV before agent can download
```

### 17.6.3 Virus Scanning

**ClamAV** `clamd` stream scan.

#### 🟢 Beginner Example

```python
# Call `clamdscan` subprocess on saved path (simple)
```

#### 🟡 Intermediate Example

```python
import clamd
cd = clamd.ClamdUnixSocket()
scan = cd.instream(stream)
```

#### 🔴 Expert Example

```python
# Async scan; quarantine bucket until clean
```

#### 🌍 Real-Time Example (Legal SaaS)

```python
# Block macros in Office docs
```

### 17.6.4 Chunked Uploads

**Tus**, **S3 multipart**, or custom **`Content-Range`**.

#### 🟢 Beginner Example

```python
# Merge chunks in temp dir keyed by upload_id
```

#### 🟡 Intermediate Example

```python
@app.put("/upload/<uid>/<int:index>")
def chunk(uid, index):
    append_chunk(uid, index, request.data)
```

#### 🔴 Expert Example

```python
# S3 UploadPart + CompleteMultipartUpload from worker
```

#### 🌍 Real-Time Example (Video Social)

```python
# Resume after mobile network drop
```

### 17.6.5 Cloud Storage Integration

**boto3**, **google-cloud-storage**, **Azure Blob**.

#### 🟢 Beginner Example

```python
s3.put_object(Bucket="b", Key=k, Body=data)
```

#### 🟡 Intermediate Example

```python
s3.generate_presigned_post(Bucket="b", Fields={"key": key}, Conditions=[["content-length-range", 1, 10_000_000]])
```

#### 🔴 Expert Example

```python
# Server-side encryption, KMS per tenant
```

#### 🌍 Real-Time Example (E-Commerce Global)

```python
# Region-specific bucket + replication
```

---

## Best Practices (Summary)

- Enforce **size limits** at Werkzeug and application layer.
- **Whitelist** types using magic bytes, not just extensions.
- Use **`secure_filename`** + **random storage keys**.
- Store uploads **outside** code directory; serve via **signed URLs** or **send_file** with auth.
- Generate **derivatives** (thumbs) asynchronously for UX.
- Log **upload events** with user/tenant ids for abuse investigation.

---

## Common Mistakes to Avoid

| Mistake | Risk | Mitigation |
|---------|------|------------|
| Trusting `filename` for disk path | Path traversal | `secure_filename` + UUID |
| Serving uploads as static without auth | Data leak | Auth or signed URLs |
| No `MAX_CONTENT_LENGTH` | DoS | Set globally + 413 handler |
| Loading entire file into RAM | OOM | Stream + limits |
| Executing uploaded scripts | RCE | No exec; scan; W^X volume |

---

## Comparison Tables

| Validation | Strength | Cost |
|------------|----------|------|
| Extension only | Low | Cheap |
| Client MIME | Low | Cheap |
| Magic bytes | Medium | Low |
| Re-encode image | High | CPU |
| AV scan | High | Latency/$ |

| Storage | Good for |
|---------|----------|
| Local disk | Dev/small |
| S3/GCS | Prod scale |
| NFS | Legacy clusters |

| Pattern | When |
|---------|------|
| Direct upload | Large files |
| Through Flask | Small/med, auth glue |
| Presigned POST | Offload bandwidth |

---

*Flask 3.1.3 (February 2026), Python 3.9+. Uses Werkzeug `FileStorage` and `Request.files` APIs.*
