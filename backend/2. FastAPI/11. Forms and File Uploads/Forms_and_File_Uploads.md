# Forms and File Uploads in FastAPI

## 📑 Table of Contents

- [11.1 HTML Forms](#111-html-forms)
  - [11.1.1 Form Data Parsing](#1111-form-data-parsing)
  - [11.1.2 Form() Function](#1112-form-function)
  - [11.1.3 Simple Form Fields](#1113-simple-form-fields)
  - [11.1.4 Multiple Form Fields](#1114-multiple-form-fields)
  - [11.1.5 Form Field Types](#1115-form-field-types)
- [11.2 File Uploads](#112-file-uploads)
  - [11.2.1 UploadFile Class](#1121-uploadfile-class)
  - [11.2.2 Single File Upload](#1122-single-file-upload)
  - [11.2.3 Multiple File Upload](#1123-multiple-file-upload)
  - [11.2.4 File Size Limits](#1124-file-size-limits)
  - [11.2.5 File Type Validation](#1125-file-type-validation)
- [11.3 File Operations](#113-file-operations)
  - [11.3.1 File Content Reading](#1131-file-content-reading)
  - [11.3.2 File Saving](#1132-file-saving)
  - [11.3.3 File Path Handling](#1133-file-path-handling)
  - [11.3.4 File Cleanup](#1134-file-cleanup)
  - [11.3.5 Streaming Large Files](#1135-streaming-large-files)
- [11.4 Form Validation](#114-form-validation)
  - [11.4.1 Required Fields](#1141-required-fields)
  - [11.4.2 Optional Fields](#1142-optional-fields)
  - [11.4.3 Field Type Validation](#1143-field-type-validation)
  - [11.4.4 Custom Validators](#1144-custom-validators)
  - [11.4.5 Validation Messages](#1145-validation-messages)
- [11.5 Combining Forms and Files](#115-combining-forms-and-files)
  - [11.5.1 Form with File](#1151-form-with-file)
  - [11.5.2 Multiple Files and Form Data](#1152-multiple-files-and-form-data)
  - [11.5.3 Nested Form Data](#1153-nested-form-data)
  - [11.5.4 Complex Form Structures](#1154-complex-form-structures)
  - [11.5.5 Form Processing](#1155-form-processing)
- [11.6 File Type Handling](#116-file-type-handling)
  - [11.6.1 Image Files](#1161-image-files)
  - [11.6.2 Document Files](#1162-document-files)
  - [11.6.3 Archive Files](#1163-archive-files)
  - [11.6.4 Video Files](#1164-video-files)
  - [11.6.5 Custom File Types](#1165-custom-file-types)
- [11.7 Advanced File Features](#117-advanced-file-features)
  - [11.7.1 File Streaming](#1171-file-streaming)
  - [11.7.2 Chunked Uploads](#1172-chunked-uploads)
  - [11.7.3 Progress Tracking](#1173-progress-tracking)
  - [11.7.4 Resume Capability](#1174-resume-capability)
  - [11.7.5 Virus Scanning](#1175-virus-scanning)
- [11.8 Form Documentation](#118-form-documentation)
  - [11.8.1 Form Field Descriptions](#1181-form-field-descriptions)
  - [11.8.2 File Upload Examples](#1182-file-upload-examples)
  - [11.8.3 Swagger UI Forms](#1183-swagger-ui-forms)
  - [11.8.4 Form Validation Documentation](#1184-form-validation-documentation)
  - [11.8.5 Best Practices](#1185-best-practices)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)

---

## 11.1 HTML Forms

HTML forms typically submit **`application/x-www-form-urlencoded`** or **`multipart/form-data`**. FastAPI parses both using **`Form()`** and file parts using **`UploadFile`**.

### 11.1.1 Form Data Parsing

#### Beginner

When a client sends a **POST** with **`Content-Type: application/x-www-form-urlencoded`**, key/value pairs map to Python parameters declared with **`Form()`**.

```python
from typing import Annotated

from fastapi import FastAPI, Form

app = FastAPI()


@app.post("/login-form")
def login_form(
    username: Annotated[str, Form()],
    password: Annotated[str, Form()],
) -> dict[str, str]:
    return {"user": username, "got_password": bool(password)}
```

#### Intermediate

Starlette parses the body into a form **multi-dict**. FastAPI injects values by **name**. For **duplicate keys**, behavior follows the underlying parser—design APIs to use **unique** field names.

#### Expert

**ASGI** servers may buffer the body. Very large **urlencoded** bodies are inefficient compared to **multipart** or **JSON**; set **limits** at the reverse proxy (**`client_max_body_size`** in nginx) aligned with app limits.

**Key Points (11.1.1)**

- **`Form()`** is required for non-file form fields (not mixed with JSON body the same way).
- Parsing happens **before** your function runs (dependency injection layer).

**Best Practices (11.1.1)**

- Prefer **explicit** field names matching HTML **`name`** attributes.
- Document **charset** expectations (UTF-8 is typical today).

**Common Mistakes (11.1.1)**

- Using **`Form()`** for **JSON** endpoints—clients will get **422** mismatches.
- Expecting **nested** JSON structures from classic HTML forms without encoding strategy.

---

### 11.1.2 Form() Function

#### Beginner

**`Form`** is imported from **`fastapi`**. It behaves like **`Query`** but reads the **request body** form section.

```python
from typing import Annotated

from fastapi import FastAPI, Form

app = FastAPI()


@app.post("/echo")
def echo(msg: Annotated[str, Form(alias="message")]) -> dict[str, str]:
    return {"message": msg}
```

#### Intermediate

Use **`alias`** when the HTML **`name`** is **`message`** but you want a Python parameter **`msg`**. OpenAPI will show the **external** name.

#### Expert

**`Form`** supports **`min_length`**, **`max_length`**, **`regex`** via **`Annotated` + `Field`** metadata in Pydantic v2 style integrations; validation integrates with the same machinery as query/path parameters.

**Key Points (11.1.2)**

- **`Form`** parameters are **not** the same as **Pydantic `BaseModel` body** for **JSON**.
- Aliases help when **frontend** names are fixed.

**Best Practices (11.1.2)**

- Keep **aliases** rare to reduce cognitive load—rename HTML fields when you control both sides.

**Common Mistakes (11.1.2)**

- Mixing **`Body(embed=True)`** mental model incorrectly with **`Form`**.

---

### 11.1.3 Simple Form Fields

#### Beginner

Declare each field as **`Annotated[str, Form()]`**. FastAPI coerces simple types where possible (e.g., **bool**, **int**).

```python
from typing import Annotated

from fastapi import FastAPI, Form

app = FastAPI()


@app.post("/subscribe")
def subscribe(email: Annotated[str, Form()]) -> dict[str, str]:
    return {"subscribed": email}
```

#### Intermediate

For **booleans**, HTML sends **`"on"`** for checkboxes—often better to accept **`str`** and map explicitly, or use **hidden + checkbox** patterns.

#### Expert

**Internationalized** text may contain characters that need careful **normalization** (NFC) before storage—validate at the **domain** layer, not only HTTP.

**Key Points (11.1.3)**

- One parameter ↔ one form field in the simple case.
- Coercion follows FastAPI/Pydantic **type adapter** rules.

**Best Practices (11.1.3)**

- Trim strings in **validators** if user input may include stray whitespace.

**Common Mistakes (11.1.3)**

- Assuming **checkbox** absent means **`False`** without handling missing keys—use **`Form(default=False)`** patterns carefully.

---

### 11.1.4 Multiple Form Fields

#### Beginner

Add multiple **`Form()`** parameters. Order in the function signature does **not** need to match the wire order.

```python
from typing import Annotated

from fastapi import FastAPI, Form

app = FastAPI()


@app.post("/profile")
def profile(
    name: Annotated[str, Form()],
    age: Annotated[int, Form()],
    city: Annotated[str, Form()],
) -> dict[str, str | int]:
    return {"name": name, "age": age, "city": city}
```

#### Intermediate

For **lists** from forms (multiple fields with same name), use **`list[str]`** with **`Form()`**—verify client behavior (some send repeated keys).

#### Expert

**Arrays** in urlencoded forms are **not standardized** across clients—prefer **JSON** for complex structures, or **multipart** with indexed names **`item[0]`** with documented convention.

**Key Points (11.1.4)**

- Multiple **`Form()`** parameters compose a single **parsed form** namespace.
- Lists require **consistent** client encoding.

**Best Practices (11.1.4)**

- Cap the number of fields to avoid **accidental** huge bodies.

**Common Mistakes (11.1.4)**

- Using **`Form()`** for **hundreds** of fields without **pagination** or **JSON** alternative.

---

### 11.1.5 Form Field Types

#### Beginner

FastAPI can parse **int**, **float**, **bool**, **datetime**, **UUID**, etc., from string form values when annotated.

```python
from datetime import date
from typing import Annotated

from fastapi import FastAPI, Form

app = FastAPI()


@app.post("/event")
def event(
    title: Annotated[str, Form()],
    on_date: Annotated[date, Form()],
) -> dict[str, str]:
    return {"title": title, "on_date": on_date.isoformat()}
```

#### Intermediate

**`date`** vs **`datetime`** matters for **timezone**—forms are often **naive** local dates; store **UTC** in DB with explicit policy.

#### Expert

Use **`Annotated[..., Form(), Field(...)]`** patterns with Pydantic constraints for **min/max** on numerics parsed from strings.

**Key Points (11.1.5)**

- All form values arrive as **strings** first; coercion may **fail** with **422**.
- Choose types that match **real user input** granularity.

**Best Practices (11.1.5)**

- Validate **business rules** (e.g., age ranges) in **Pydantic models** or services.

**Common Mistakes (11.1.5)**

- Parsing **floats** for **money**—use **Decimal** and quantize.

---

## 11.2 File Uploads

File uploads use **`multipart/form-data`**. FastAPI exposes uploaded files as **`UploadFile`** (async-friendly) or raw **`bytes`**.

### 11.2.1 UploadFile Class

#### Beginner

**`UploadFile`** wraps a **SpooledTemporaryFile**-like object with **`filename`**, **`content_type`**, and async **`read()`** / **`write()`**.

```python
from fastapi import FastAPI, UploadFile, File

app = FastAPI()


@app.post("/upload-meta")
async def upload_meta(file: UploadFile = File()) -> dict[str, str | None]:
    return {
        "filename": file.filename,
        "content_type": file.content_type,
    }
```

#### Intermediate

Use **`async def`** and **`await file.read()`** for non-blocking I/O under async servers. For **`def`**, FastAPI runs file ops in threadpool—still works but know the tradeoff.

#### Expert

**`UploadFile.file`** is the underlying sync file object; prefer **`read`/`seek`** APIs to stay compatible across Starlette versions.

**Key Points (11.2.1)**

- **`UploadFile`** is **not** fully loaded into memory by default (spooled to disk after threshold).
- **`File()`** default marks the parameter as a **file part**.

**Best Practices (11.2.1)**

- Always validate **filename** and **size**—never **trust** client metadata.

**Common Mistakes (11.2.1)**

- Reading **entire** huge files into memory with **`read()`** without **streaming** strategy.

---

### 11.2.2 Single File Upload

#### Beginner

Declare **`file: UploadFile = File()`**. Client sends one part named **`file`** (by default) or match with **`File(alias=...)`**.

```python
from fastapi import FastAPI, UploadFile, File

app = FastAPI()


@app.post("/single")
async def single(file: UploadFile = File(description="Any small file")) -> dict[str, int]:
    data = await file.read()
    return {"bytes": len(data)}
```

#### Intermediate

Prefer **`Annotated[UploadFile, File()]`** style for consistency with modern FastAPI examples.

```python
from typing import Annotated

from fastapi import FastAPI, File, UploadFile

app = FastAPI()


@app.post("/single-annotated")
async def single_annotated(
    file: Annotated[UploadFile, File()],
) -> dict[str, str | None]:
    return {"name": file.filename}
```

#### Expert

Combine with **`Form`** fields in the same endpoint for **metadata** alongside upload (profile update + avatar).

**Key Points (11.2.2)**

- Default multipart **name** is the parameter name **`file`**.
- Use **`description`** for OpenAPI clarity.

**Best Practices (11.2.2)**

- Enforce **max size** at proxy and **application** layer.

**Common Mistakes (11.2.2)**

- Forgetting **`await`** on **`read()`** in **`async`** routes.

---

### 11.2.3 Multiple File Upload

#### Beginner

Accept **`list[UploadFile]`** with **`File()`** to read many files under the same field name or use **multiple parameters**.

```python
from typing import Annotated

from fastapi import FastAPI, File, UploadFile

app = FastAPI()


@app.post("/multi-same-name")
async def multi_same_name(
    files: Annotated[list[UploadFile], File()],
) -> dict[str, list[str | None]]:
    return {"names": [f.filename for f in files]}
```

#### Intermediate

Alternatively, fixed slots: **`img_a: UploadFile`**, **`img_b: UploadFile`** when the client uses **distinct** names.

#### Expert

**Concurrency**: processing many uploads may **saturate** disk I/O—use **bounded** worker pools or **queue** heavy processing.

**Key Points (11.2.3)**

- **`list[UploadFile]`** maps to **repeated** multipart parts with the **same** name (typical HTML **`multiple`** input).

**Best Practices (11.2.3)**

- Limit **count** of files server-side to prevent **zip bombs** / DoS.

**Common Mistakes (11.2.3)**

- Assuming **order** is meaningful without client contract.

---

### 11.2.4 File Size Limits

#### Beginner

Starlette/FastAPI does not replace **reverse proxy** limits. In app code, count bytes while reading and **abort** over threshold.

```python
from fastapi import FastAPI, UploadFile, File, HTTPException

app = FastAPI()
MAX_BYTES = 1_000_000


@app.post("/bounded")
async def bounded(file: UploadFile = File()) -> dict[str, int]:
    total = 0
    chunk = await file.read(1024 * 64)
    while chunk:
        total += len(chunk)
        if total > MAX_BYTES:
            raise HTTPException(status_code=413, detail="File too large")
        chunk = await file.read(1024 * 64)
    return {"accepted": total}
```

#### Intermediate

For **exact** content length, **`Content-Length`** may be spoofed—still enforce while reading.

#### Expert

Use **streaming** to **object storage** (S3 multipart) with **server-side** encryption; avoid buffering **entire** object on app host.

**Key Points (11.2.4)**

- **413 Payload Too Large** is the conventional status (also configure **nginx** **`client_max_body_size`**).

**Best Practices (11.2.4)**

- Apply limits **per route** (avatar vs bulk import).

**Common Mistakes (11.2.4)**

- Reading **`file.file.read()`** without chunking and **OOM** on big uploads.

---

### 11.2.5 File Type Validation

#### Beginner

Check **`content_type`** and/or **file extension**—both are **client-controlled**. For images, inspect **magic bytes** (avoid relying on **`imghdr`**, removed in Python 3.13).

```python
from fastapi import FastAPI, UploadFile, File, HTTPException

app = FastAPI()


def sniff_image_kind(head: bytes) -> str | None:
    if head.startswith(b"\xff\xd8\xff"):
        return "jpeg"
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if head.startswith(b"GIF87a") or head.startswith(b"GIF89a"):
        return "gif"
    if len(head) >= 12 and head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return "webp"
    return None


@app.post("/image-only")
async def image_only(file: UploadFile = File()) -> dict[str, str]:
    data = await file.read(32)
    kind = sniff_image_kind(data)
    if kind is None:
        raise HTTPException(status_code=400, detail="Not a supported image")
    return {"detected": kind}
```

#### Intermediate

**`python-magic`** (libmagic) offers stronger detection than extension sniffing.

#### Expert

**Content-Type** validation must be **defense in depth**—malware may be **polyglot** files. Combine **AV scanning** (see 11.7.5) for user uploads.

**Key Points (11.2.5)**

- **Never** execute uploaded content.
- Store outside **web root** with **random** names.

**Best Practices (11.2.5)**

- Allowlist **types**; do not try to blocklist **everything**.

**Common Mistakes (11.2.5)**

- Trusting **`file.filename.endswith(".png")`** alone.

---

## 11.3 File Operations

### 11.3.1 File Content Reading

#### Beginner

**`await upload_file.read()`** returns **`bytes`**. For text, **decode** explicitly with **errors** policy.

```python
from fastapi import FastAPI, UploadFile, File

app = FastAPI()


@app.post("/text")
async def read_text(file: UploadFile = File()) -> dict[str, str]:
    raw = await file.read()
    text = raw.decode("utf-8", errors="replace")
    return {"preview": text[:200]}
```

#### Intermediate

**`read(size)`** in a loop handles large files; **`seek(0)`** if you need to **re-read**.

#### Expert

For **CSV** parsing, use **`io.TextIOWrapper`** around a **sync** file object carefully in async code—offload CPU-heavy parsing to **`run_in_executor`**.

**Key Points (11.3.1)**

- Decide **text vs binary** early; **encoding** bugs are common.

**Best Practices (11.3.1)**

- Set **read chunk size** based on **memory** budget.

**Common Mistakes (11.3.1)**

- Using **default** decode errors **`strict`** on untrusted uploads—can **500** on bad bytes.

---

### 11.3.2 File Saving

#### Beginner

Write **`bytes`** to disk with **`aiofiles`** (async) or sync **`Path.write_bytes`** in threadpool.

```python
from pathlib import Path

import aiofiles
from fastapi import FastAPI, UploadFile, File

app = FastAPI()
OUT = Path("uploads")
OUT.mkdir(exist_ok=True)


@app.post("/save")
async def save(file: UploadFile = File()) -> dict[str, str]:
    dest = OUT / (file.filename or "unnamed")
    async with aiofiles.open(dest, "wb") as out:
        while chunk := await file.read(1024 * 1024):
            await out.write(chunk)
    return {"saved": str(dest)}
```

#### Intermediate

**Sanitize** filenames: reject **`..`**, absolute paths, and **control characters**.

#### Expert

Prefer **object storage** with **pre-signed URLs** for **scale**; local disk is a **dev** convenience.

**Key Points (11.3.2)**

- Never use **raw user filename** as path component without **validation**.
- Stream writes to avoid **memory** spikes.

**Best Practices (11.3.2)**

- Generate **UUID** server names; keep **original** name as **metadata** only.

**Common Mistakes (11.3.2)**

- Saving under **static** URL path enabling **direct execution** (historical PHP risk mindset still applies to **mis-served** types).

---

### 11.3.3 File Path Handling

#### Beginner

Use **`pathlib.Path`**. Resolve **relative** paths against a **known root** (**chroot** / jail concept).

```python
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File

app = FastAPI()
ROOT = Path("data").resolve()


def safe_name(name: str) -> Path:
    candidate = (ROOT / name).resolve()
    if not str(candidate).startswith(str(ROOT)):
        raise HTTPException(status_code=400, detail="Invalid path")
    return candidate


@app.post("/store-named")
async def store_named(name: str, file: UploadFile = File()) -> dict[str, str]:
    path = safe_name(name)
    path.write_bytes(await file.read())
    return {"path": str(path)}
```

#### Intermediate

On **Windows vs POSIX**, path quirks differ—**`resolve`** helps but test **CI** matrix.

#### Expert

**Container** ephemeral filesystems: persist to **volume** or **remote** store; **read-only** root FS is common in **Kubernetes**.

**Key Points (11.3.3)**

- **Path traversal** (`../../`) is a **classic** vulnerability.

**Best Practices (11.3.3)**

- Store uploads **outside** application code directory.

**Common Mistakes (11.3.3)**

- Concatenating strings to build paths.

---

### 11.3.4 File Cleanup

#### Beginner

Delete temp files after processing or on **error** using **`try/finally`**.

```python
from pathlib import Path

from fastapi import FastAPI, UploadFile, File

app = FastAPI()


@app.post("/process-temp")
async def process_temp(file: UploadFile = File()) -> dict[str, int]:
    tmp = Path("/tmp") / (file.filename or "up")
    try:
        tmp.write_bytes(await file.read())
        return {"size": tmp.stat().st_size}
    finally:
        if tmp.exists():
            tmp.unlink()
```

#### Intermediate

**`SpooledTemporaryFile`** may already be cleaning some resources—still delete **copied** artifacts.

#### Expert

Scheduled **GC** jobs for **orphaned** uploads if clients **abort** mid-upload (track **multipart** session ids).

**Key Points (11.3.4)**

- **Disk exhaustion** is an **availability** risk.

**Best Practices (11.3.4)**

- Use **TTL** policies on buckets (**S3 lifecycle**).

**Common Mistakes (11.3.4)**

- Leaving **temp** files on **exception** paths only partially handled.

---

### 11.3.5 Streaming Large Files

#### Beginner

Return **`StreamingResponse`** or **`FileResponse`** for downloads; for uploads, **chunk** reads and **pipe** to destination.

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()


@app.get("/big")
def big() -> StreamingResponse:
    def gen():
        for i in range(5):
            yield f"chunk-{i}\n".encode()

    return StreamingResponse(gen(), media_type="text/plain")
```

#### Intermediate

**`UploadFile`** supports **`read`/`seek`**; combine with **async generators** carefully—mixing sync/async can **block** event loop.

#### Expert

**Range requests** (**`Accept-Ranges`**) for video require **`Starlette FileResponse`** patterns or **CDN** offload.

**Key Points (11.3.5)**

- **Backpressure** matters—don’t read faster than you can write.

**Best Practices (11.3.5)**

- Offload **large** static delivery to **object storage + CDN**.

**Common Mistakes (11.3.5)**

- Loading **multi-GB** files into **RAM** for **JSON** responses.

---

## 11.4 Form Validation

### 11.4.1 Required Fields

#### Beginner

Mark form fields required by omitting defaults: **`Annotated[str, Form()]`**. Missing fields yield **422 Unprocessable Entity** with validation details.

```python
from typing import Annotated

from fastapi import FastAPI, Form

app = FastAPI()


@app.post("/contact")
def contact(
    name: Annotated[str, Form()],
    email: Annotated[str, Form()],
) -> dict[str, str]:
    return {"ok": "received", "email": email}
```

#### Intermediate

Use **`Field(min_length=1)`** to reject **empty strings** that are technically “present”.

```python
from typing import Annotated

from fastapi import FastAPI, Form
from pydantic import Field

app = FastAPI()


@app.post("/nonempty")
def nonempty(
    title: Annotated[str, Form(), Field(min_length=1)],
) -> dict[str, str]:
    return {"title": title}
```

#### Expert

Differentiate **400** vs **422** at API design level: **422** for schema violations is OpenAPI-friendly; **400** for semantic issues is sometimes clearer for public APIs—use **`HTTPException`** after parsing if needed.

**Key Points (11.4.1)**

- Required **`Form`** parameters must appear in **multipart/urlencoded** body.
- Empty string may still be **valid** unless constrained.

**Best Practices (11.4.1)**

- Combine **min length** with **strip** validators for human text.

**Common Mistakes (11.4.1)**

- Assuming **missing** vs **empty** are the same for optional checkboxes.

---

### 11.4.2 Optional Fields

#### Beginner

Provide a **default** or use **`Form(None)`** / **`str | None`** with default **`None`**.

```python
from typing import Annotated

from fastapi import FastAPI, Form

app = FastAPI()


@app.post("/optional-note")
def optional_note(
    note: Annotated[str | None, Form()] = None,
) -> dict[str, str | None]:
    return {"note": note}
```

#### Intermediate

**`Form(default="")`** vs **`None`** changes OpenAPI **required** flags—be intentional.

#### Expert

Optional multipart fields may be **absent** or **empty**; normalize once in a **Pydantic model** via **`model_validator`** for consistent semantics.

**Key Points (11.4.2)**

- Optional fields simplify **progressive** forms and **API evolution**.

**Best Practices (11.4.2)**

- Document **defaults** clearly in OpenAPI descriptions.

**Common Mistakes (11.4.2)**

- Using **`Optional`** incorrectly without **`= None`** default.

---

### 11.4.3 Field Type Validation

#### Beginner

Annotate with **`int`**, **`float`**, **`bool`**, etc. FastAPI validates and coerces string form values.

```python
from typing import Annotated

from fastapi import FastAPI, Form

app = FastAPI()


@app.post("/numbers")
def numbers(
    qty: Annotated[int, Form(gt=0)],
    price: Annotated[float, Form(gt=0)],
) -> dict[str, float | int]:
    return {"total": qty * price}
```

#### Intermediate

**`Annotated[int, Form(), Field(gt=0, le=99)]`** composes constraints for OpenAPI and validation.

#### Expert

For **high precision**, use **`Decimal`** with **`Field`** constraints and **quantize** to currency minor units in a **`field_validator`**.

**Key Points (11.4.3)**

- Coercion errors surface as **422** with **loc** pointing to the field.

**Best Practices (11.4.3)**

- Keep **HTTP layer** types close to **domain** types to avoid double parsing.

**Common Mistakes (11.4.3)**

- Using **`float`** for **money**.

---

### 11.4.4 Custom Validators

#### Beginner

Use a **`Pydantic` `BaseModel`** with **`Form` as dependencies** is not direct—often validate manually or use **`Depends`** wrapper. Alternative: validate after reading strings.

```python
import re
from typing import Annotated

from fastapi import FastAPI, Form, HTTPException

app = FastAPI()
CODE_RE = re.compile(r"^[A-Z]{3}-\d{4}$")


@app.post("/promo")
def promo(code: Annotated[str, Form()]) -> dict[str, str]:
    if not CODE_RE.fullmatch(code):
        raise HTTPException(status_code=400, detail="Invalid promo format")
    return {"code": code}
```

#### Intermediate

Define a **`BaseModel`** with **`model_validator`** and build it from individual **`Form`** parameters inside a **`Depends`** factory for reusable validation.

```python
from pydantic import BaseModel, field_validator


class SignupForm(BaseModel):
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def username_alnum(cls, v: str) -> str:
        if not v.isalnum():
            raise ValueError("username must be alphanumeric")
        return v
```

#### Expert

For **multi-step** wizard forms, validate **step** schemas independently and store **draft** state server-side with **idempotency keys**.

**Key Points (11.4.4)**

- Custom validation encodes **business rules** beyond types.

**Best Practices (11.4.4)**

- Prefer **Pydantic** validators for **testability** and **reuse**.

**Common Mistakes (11.4.4)**

- Duplicating validation in **JS** only.

---

### 11.4.5 Validation Messages

#### Beginner

FastAPI returns **`detail`** as a list of errors for **RequestValidationError**. Customize with **`RequestValidationError` handler** or Pydantic **`Field(..., json_schema_extra=...)`** patterns for docs.

```python
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

app = FastAPI()


@app.exception_handler(RequestValidationError)
async def validation_handler(_, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={"errors": exc.errors(), "body": "invalid"},
    )
```

#### Intermediate

Map **`exc.errors()`** **`loc`** to **user-friendly** field labels for frontend forms.

#### Expert

**i18n**: keep **machine codes** in **`type`** and map to **locale** strings client-side; avoid baking **English** sentences into security-sensitive responses if **enumeration** matters.

**Key Points (11.4.5)**

- Default **422** payloads are **structured**—use them.

**Best Practices (11.4.5)**

- Log validation failures at **info** level, not **error**, unless spike indicates attack.

**Common Mistakes (11.4.5)**

- Returning **500** on validation issues due to uncaught exceptions in validators.

---

## 11.5 Combining Forms and Files

### 11.5.1 Form with File

#### Beginner

Declare both **`Form()`** and **`UploadFile = File()`** in the same function. Client must use **multipart**.

```python
from typing import Annotated

from fastapi import FastAPI, File, Form, UploadFile

app = FastAPI()


@app.post("/avatar")
async def avatar(
    user_id: Annotated[str, Form()],
    image: Annotated[UploadFile, File()],
) -> dict[str, str]:
    data = await image.read()
    return {"user_id": user_id, "bytes": str(len(data))}
```

#### Intermediate

**OpenAPI** shows **multipart** schema with **binary** + **fields**—great for **Swagger UI** testing.

#### Expert

**Content negotiation**: some clients incorrectly set **`Content-Type`** without **boundary**—reject early with clear **400** message in **middleware** if needed.

**Key Points (11.5.1)**

- **Cannot** use **`Form`** fields with **raw JSON body** in the same request the same way—multipart bundles them.

**Best Practices (11.5.1)**

- Keep **metadata** fields small; large structured data should be **JSON** endpoint separately.

**Common Mistakes (11.5.1)**

- Sending **`application/json`** with **file**—won’t map to **`Form`/`File`**.

---

### 11.5.2 Multiple Files and Form Data

#### Beginner

Combine **`list[UploadFile]`** with additional **`Form`** parameters.

```python
from typing import Annotated

from fastapi import FastAPI, File, Form, UploadFile

app = FastAPI()


@app.post("/gallery")
async def gallery(
    album: Annotated[str, Form()],
    photos: Annotated[list[UploadFile], File()],
) -> dict[str, str | int]:
    total = 0
    for p in photos:
        total += len(await p.read())
    return {"album": album, "total_bytes": total}
```

#### Intermediate

Consider **per-file size** limits inside the loop to **fail fast**.

#### Expert

**Transaction** semantics: if DB insert fails, delete **orphaned** objects from storage—use **outbox** or **Saga** patterns for distributed consistency.

**Key Points (11.5.2)**

- Treat the whole request as a **unit of work** when possible.

**Best Practices (11.5.2)**

- Return **201** with **resource ids** for created files when persisting.

**Common Mistakes (11.5.2)**

- Partial success without telling the client **which** files failed.

---

### 11.5.3 Nested Form Data

#### Beginner

Classic HTML forms **flatten** nested keys as **`user[name]`** strings. Python/FastAPI won’t auto-nest without **custom parsing**.

```python
from typing import Annotated

from fastapi import FastAPI, Form

app = FastAPI()


@app.post("/flat-only")
def flat_only(
    user_name: Annotated[str, Form(alias="user[name]")],
) -> dict[str, str]:
    return {"user_name": user_name}
```

#### Intermediate

Prefer a **JSON body** with a **`BaseModel`** for nested structures; forms are a poor fit.

#### Expert

If you must support **Rails-style** nested encodings, add a **normalization** layer in **`Depends`** that builds a **`BaseModel`**.

**Key Points (11.5.3)**

- **Nested** forms are **convention**, not standard—document yours.

**Best Practices (11.5.3)**

- Avoid **deep** nesting in multipart—hard to debug.

**Common Mistakes (11.5.3)**

- Expecting automatic **`user: User`** model from **flat** form keys.

---

### 11.5.4 Complex Form Structures

#### Beginner

For complex input, accept **`str` JSON in a form field** (sometimes seen in legacy APIs) and parse with **`model_validate_json`**—use sparingly.

```python
from typing import Annotated

from fastapi import FastAPI, Form, HTTPException
from pydantic import BaseModel, ValidationError

app = FastAPI()


class Item(BaseModel):
    sku: str
    qty: int


@app.post("/order-legacy")
def order_legacy(payload: Annotated[str, Form()]) -> dict[str, str]:
    try:
        Item.model_validate_json(payload)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors()) from e
    return {"status": "ok"}
```

#### Intermediate

Prefer **two endpoints**: **`POST /order`** JSON for structure, **`POST /order/{id}/attachment`** multipart for files.

#### Expert

**GraphQL** and **gRPC** have different upload stories—**REST multipart** remains common for **browser** compatibility.

**Key Points (11.5.4)**

- **JSON-in-form** is a **compatibility** hack with sharp edges.

**Best Practices (11.5.4)**

- Version APIs when changing **encoding** strategy.

**Common Mistakes (11.5.4)**

- Double **encoding** bugs (JSON string of JSON).

---

### 11.5.5 Form Processing

#### Beginner

Processing means **validate → transform → persist → respond**. Keep orchestration in a **service** function for testability.

```python
from typing import Annotated

from fastapi import FastAPI, File, Form, UploadFile

app = FastAPI()


def save_profile(user_id: str, bio: str, avatar: bytes) -> None:
    # pretend DB + object store
    _ = (user_id, bio, len(avatar))


@app.post("/profile-submit")
async def profile_submit(
    user_id: Annotated[str, Form()],
    bio: Annotated[str, Form()],
    avatar: Annotated[UploadFile, File()],
) -> dict[str, str]:
    data = await avatar.read()
    save_profile(user_id, bio, data)
    return {"status": "saved"}
```

#### Intermediate

Use **`BackgroundTasks`** for **thumbnails**, **virus scan**, and **search indexing**—return quickly to the client.

#### Expert

**Idempotency-Key** header pattern helps **safe retries** on flaky mobile networks for **form posts**.

**Key Points (11.5.5)**

- Separate **HTTP adapter** from **domain** logic.

**Best Practices (11.5.5)**

- Emit **metrics** (count, latency, failure) per **upload** route.

**Common Mistakes (11.5.5)**

- Doing **heavy** CPU work on the **event loop** thread.

---

## 11.6 File Type Handling

### 11.6.1 Image Files

#### Beginner

Validate **magic bytes**, resize with **Pillow**, strip **EXIF** if privacy-sensitive, convert to **safe** formats.

```python
from io import BytesIO

from fastapi import FastAPI, UploadFile, File, HTTPException
from PIL import Image

app = FastAPI()


@app.post("/normalize-png")
async def normalize_png(file: UploadFile = File()) -> dict[str, int]:
    raw = await file.read()
    try:
        with Image.open(BytesIO(raw)) as img:
            img.verify()
        with Image.open(BytesIO(raw)) as img2:
            w, h = img2.size
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image") from None
    return {"width": w, "height": h}
```

#### Intermediate

**Decompression bombs**: set **pixel limits** before **`load()`**.

#### Expert

**SVG** is XML-based—**sanitize** if you must support it; **XXE** and **script** tags are **risk vectors**.

**Key Points (11.6.1)**

- **Re-encode** images to canonical format to strip **exploits**.

**Best Practices (11.6.1)**

- Generate **derivatives** (thumbnails) asynchronously.

**Common Mistakes (11.6.1)**

- Serving user uploads with **`Content-Disposition: inline`** from same **origin** as admin without **CSP**.

---

### 11.6.2 Document Files

#### Beginner

**PDF**, **DOCX** may contain **macros** (less in DOCX but **embedded** objects exist). Scan and **sandbox** parsing libraries.

```python
from fastapi import FastAPI, UploadFile, File

app = FastAPI()


@app.post("/doc-meta")
async def doc_meta(file: UploadFile = File()) -> dict[str, str | None]:
    return {"filename": file.filename, "ctype": file.content_type}
```

#### Intermediate

Extract **text** with **specialized** parsers; never use **`eval`** on **extracted** content.

#### Expert

**Redaction** pipelines for **PII** before **indexing** to search—**GDPR** compliance.

**Key Points (11.6.2)**

- Documents are **attack surface** for parser bugs.

**Best Practices (11.6.2)**

- Keep parser libraries **pinned** and **updated**.

**Common Mistakes (11.6.2)**

- Trusting **libreoffice** headless conversions without **resource** limits.

---

### 11.6.3 Archive Files

#### Beginner

**ZIP** can contain **zip bombs** (high compression ratio). Limit **uncompressed** size and **entry count**.

```python
import zipfile
from io import BytesIO

from fastapi import FastAPI, UploadFile, File, HTTPException

app = FastAPI()


@app.post("/zip-inspect")
async def zip_inspect(file: UploadFile = File()) -> dict[str, int]:
    raw = await file.read()
    try:
        with zipfile.ZipFile(BytesIO(raw)) as zf:
            names = zf.namelist()
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Bad zip") from None
    return {"entries": len(names)}
```

#### Intermediate

**Path traversal** in ZIP: reject entries with **`..`** or absolute paths on **extract**.

#### Expert

**tar** has similar issues; streaming **extract** to **quota**-enforced filesystems.

**Key Points (11.6.3)**

- **Never** extract blindly to **predictable** paths.

**Best Practices (11.6.3)**

- Virus scan **before** and **after** extract.

**Common Mistakes (11.6.3)**

- Using **`extractall`** without **safelisting**.

---

### 11.6.4 Video Files

#### Beginner

Avoid **server-side transcode** on **request path** for large files—**queue** jobs. Validate **container** with **ffprobe** in worker.

```python
from fastapi import FastAPI, UploadFile, File

app = FastAPI()


@app.post("/video-accept")
async def video_accept(file: UploadFile = File()) -> dict[str, str | None]:
    return {"accepted": file.filename, "ctype": file.content_type}
```

#### Intermediate

**Presigned upload** to **S3** + **lambda/ffmpeg** workers scales better.

#### Expert

**DRM** and **watermarking** belong in **media pipeline**, not FastAPI process.

**Key Points (11.6.4)**

- Video is **bandwidth** and **CPU** heavy.

**Best Practices (11.6.4)**

- Use **CDN** for **delivery**, not app servers.

**Common Mistakes (11.6.4)**

- Blocking workers with **ffmpeg** on **web** threads.

---

### 11.6.5 Custom File Types

#### Beginner

Define **allowlist** of extensions + **magic** signatures for proprietary formats used in your domain (e.g., **CAD**, **game assets**).

```python
from fastapi import FastAPI, UploadFile, File, HTTPException

app = FastAPI()
MAGIC = b"MYAPP"


@app.post("/custom")
async def custom(file: UploadFile = File()) -> dict[str, bool]:
    head = await file.read(len(MAGIC))
    if head != MAGIC:
        raise HTTPException(status_code=400, detail="Not a MYAPP file")
    return {"ok": True}
```

#### Intermediate

**Version** the file header (`MYAPPv2`) to support **migration**.

#### Expert

**Schema evolution** for binary formats should include **compatibility tests** in CI.

**Key Points (11.6.5)**

- Custom types need **strong** validation—attackers **fuzz** parsers.

**Best Practices (11.6.5)**

- Document **format** publicly for integrators.

**Common Mistakes (11.6.5)**

- **Backward** compatibility breaks in **minor** releases.

---

## 11.7 Advanced File Features

### 11.7.1 File Streaming

#### Beginner

Stream **upload** to storage while reading chunks; stream **download** via **`StreamingResponse`**.

#### Intermediate

Use **`UploadFile`** iteration patterns and **async writes** to **object storage** SDKs that support **multipart**.

#### Expert

**HTTP/2** multiplexing affects **large** upload concurrency—tune **server** and **client** limits.

**Key Points (11.7.1)**

- Streaming reduces **memory** footprint.

**Best Practices (11.7.1)**

- Set **`Content-Length`** when known for **downloads**.

**Common Mistakes (11.7.1)**

- Mixing **sync** file I/O in **async** handlers without **executor**.

---

### 11.7.2 Chunked Uploads

#### Beginner

Clients send **chunks** with **index**; server **assembles** temp parts and **commits** when complete.

```python
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, File, Header, HTTPException, UploadFile

app = FastAPI()
PARTS = Path("parts")
PARTS.mkdir(exist_ok=True)


@app.post("/chunk")
async def chunk(
    upload_id: Annotated[str, Header(alias="X-Upload-Id")],
    index: Annotated[int, Header(alias="X-Chunk-Index")],
    file: UploadFile = File(),
) -> dict[str, str | int]:
    if not upload_id or index < 0:
        raise HTTPException(status_code=400, detail="Bad chunk headers")
    dest = PARTS / f"{upload_id}.{index:05d}"
    dest.write_bytes(await file.read())
    return {"saved": str(dest), "index": index}
```

#### Intermediate

Add **checksum per chunk** (**SHA-256**) to detect **corruption**.

#### Expert

**TUS** protocol provides **resumable** uploads with **ecosystem** support—consider **standard** instead of ad-hoc.

**Key Points (11.7.2)**

- **Idempotent** chunk writes help **retries**.

**Best Practices (11.7.2)**

- **TTL** cleanup for **abandoned** upload ids.

**Common Mistakes (11.7.2)**

- **Race** conditions on **final merge** without **locking**.

---

### 11.7.3 Progress Tracking

#### Beginner

Pure server-side **FastAPI** doesn’t push progress to browser by default—client tracks **bytes uploaded** via **XHR/fetch** **upload events** or use **WebSocket** **side channel**.

#### Intermediate

For **internal** jobs, store **progress** in **Redis** keyed by **job id**; poll **`GET /jobs/{id}`**.

#### Expert

**Backpressure**: reporting progress should **not** add **significant** overhead—**sample** every N MB.

**Key Points (11.7.3)**

- **Progress** is primarily a **client** concern for HTTP uploads.

**Best Practices (11.7.3)**

- Use **resumable** protocols for **large** assets.

**Common Mistakes (11.7.3)**

- Trying to **wrap** standard **`UploadFile`** with **fine-grained** progress without **custom** ASGI plumbing.

---

### 11.7.4 Resume Capability

#### Beginner

Resume requires **client** to remember **upload id** + **next byte offset**; server stores **partial** object.

#### Intermediate

**S3 multipart upload** supports **listing** completed parts to **resume**.

#### Expert

**Mobile** networks benefit enormously—implement **exponential backoff** and **chunk** retries.

**Key Points (11.7.4)**

- **Atomic finalize** step commits **visible** file.

**Best Practices (11.7.4)**

- **Expire** partial uploads to save **cost**.

**Common Mistakes (11.7.4)**

- **Merging** chunks in **wrong order** without **sorting** by index.

---

### 11.7.5 Virus Scanning

#### Beginner

After upload, **write** file to **quarantine** bucket; **worker** invokes **ClamAV** or cloud **AV**; move to **clean** on success.

```python
from fastapi import FastAPI, UploadFile, File

app = FastAPI()


@app.post("/scan-stub")
async def scan_stub(file: UploadFile = File()) -> dict[str, str]:
    _ = await file.read()
    # enqueue background job: clamscan path
    return {"status": "queued_for_scan"}
```

#### Intermediate

**EICAR** test string validates **pipeline** in **staging**.

#### Expert

**Scanning** is not **100%**; combine with **type** restrictions, **sandboxing**, and **user** trust tiers.

**Key Points (11.7.5)**

- **Async** scanning avoids blocking **HTTP** responses.

**Best Practices (11.7.5)**

- **Block** download URLs until **scan complete** for **public** sharing apps.

**Common Mistakes (11.7.5)**

- Scanning **only** at upload but not **periodic** re-scan on **new** signatures.

---

## 11.8 Form Documentation

### 11.8.1 Form Field Descriptions

#### Beginner

Add **`description`** via **`Field`** inside **`Annotated`** for OpenAPI.

```python
from typing import Annotated

from fastapi import FastAPI, Form
from pydantic import Field

app = FastAPI()


@app.post("/doc-form")
def doc_form(
    email: Annotated[
        str,
        Form(description="Primary contact email"),
        Field(examples=["you@example.com"]),
    ],
) -> dict[str, str]:
    return {"email": email}
```

#### Intermediate

**`examples`** improve **Swagger UI** prefills.

#### Expert

Generate **OpenAPI** from **code** and also publish **human** integration guides for **multipart** quirks.

**Key Points (11.8.1)**

- Good docs reduce **support** load.

**Best Practices (11.8.1)**

- Document **max size** and **allowed** types per route.

**Common Mistakes (11.8.1)**

- Undocumented **required** headers like **`Idempotency-Key`**.

---

### 11.8.2 File Upload Examples

#### Beginner

OpenAPI **3** supports **binary** schemas; FastAPI emits **`format: binary`**. Provide **`example`** filenames in descriptions.

#### Intermediate

Ship **Postman**/**Insomnia** collections for **multipart** tests.

#### Expert

**CI** integration tests should **upload** random **bytes** with **boundaries** to catch **parser** regressions.

**Key Points (11.8.2)**

- Examples should mirror **real** client **field names**.

**Best Practices (11.8.2)**

- Include **curl** samples in docs:

```bash
curl -X POST "http://localhost:8000/avatar" \
  -F "user_id=42" \
  -F "image=@./photo.png"
```

**Common Mistakes (11.8.2)**

- Examples using **wrong** multipart **field** names vs implementation.

---

### 11.8.3 Swagger UI Forms

#### Beginner

**`/docs`** renders **Try it out** for **multipart** endpoints—great for **QA**.

#### Intermediate

Disable **`/docs`** in **production** or protect with **auth**.

#### Expert

**Swagger** may mishandle **very large** files—use **external** tools for **stress** tests.

**Key Points (11.8.3)**

- Swagger is **developer** tooling, not a **user** UI.

**Best Practices (11.8.3)**

- Use **`Redoc`** for **read-only** nicer docs if desired.

**Common Mistakes (11.8.3)**

- Leaving **try-it-out** open on **admin** routes.

---

### 11.8.4 Form Validation Documentation

#### Beginner

Document **422** shapes and **common** error codes in **`responses`**.

```python
from typing import Annotated

from fastapi import FastAPI, Form

app = FastAPI()


@app.post(
    "/signup",
    responses={422: {"description": "Validation error"}},
)
def signup(username: Annotated[str, Form()]) -> dict[str, str]:
    return {"username": username}
```

#### Intermediate

Link to **Pydantic** **`json_schema`** for **constraints** automatically via FastAPI.

#### Expert

Publish **changelog** when **validation** tightens—clients break silently otherwise.

**Key Points (11.8.4)**

- **API contracts** include **error** formats.

**Best Practices (11.8.4)**

- Provide **correlation id** in error responses for **support**.

**Common Mistakes (11.8.4)**

- Changing **error** JSON shape without **version** bump.

---

### 11.8.5 Best Practices

#### Beginner

Use **multipart** only when needed; **JSON** for structure; **validate** types; **limit** size; **sanitize** filenames.

#### Intermediate

**Centralize** upload policies in **`settings`** (max size, allowed MIME list).

#### Expert

**Threat model** user content: **XSS**, **malware**, **DoS**, **legal** issues (copyright).

**Key Points (11.8.5)**

- Documentation + **enforcement** must align.

**Best Practices (11.8.5)**

- **Monitor** upload **volume** anomalies.

**Common Mistakes (11.8.5)**

- **Undocumented** behavior clients come to **depend** on.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Chapter Key Points

- **`Form()`** parses **urlencoded** and **multipart** text fields; **`File()`/`UploadFile`** handles **binary** parts.
- **Multipart** combines **metadata** and **files** in one request.
- **Validation** uses **types**, **`Field`**, and **custom** validators—**422** is the default for schema issues.
- **Security** requires **size limits**, **type sniffing**, **safe paths**, and often **async** **virus scan**.
- **Large files** need **streaming**, **chunked** or **resumable** protocols, and **offload** to **object storage/CDN**.

### Chapter Best Practices

- Prefer **`Annotated`** style for **`Form`**, **`File`**, and **`UploadFile`**.
- Enforce limits at **proxy** and **application** layers.
- Never **trust** filenames or **Content-Type**; verify **content**.
- Use **service** functions for **orchestration**; **background tasks** for heavy post-processing.
- Document **multipart field names** and **curl** examples for integrators.

### Chapter Common Mistakes

- Using **`Form`** where **JSON body** is appropriate (or vice versa).
- **OOM** from **`read()`** without **chunking**.
- **Path traversal** via **upload** filenames.
- **Blocking** event loop with **sync** **Pillow/ffmpeg** in **async** routes.
- **Partial** multi-file uploads without clear **error** reporting and **cleanup**.

---
