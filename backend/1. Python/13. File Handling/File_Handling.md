
# File Handling in Python

Files back every real system: CSV exports from HR, JSON configs for microservices, binary attachments in KYC, and rotated logs for SRE. This guide ties paths, I/O, and formats to those workflows.



## 📑 Table of Contents

- [13.1 Paths and Discovery](#131-paths-and-discovery)
- [13.2 Opening and Closing](#132-opening-and-closing)
- [13.3 Reading](#133-reading)
- [13.4 Writing](#134-writing)
- [13.5 File Operations](#135-file-operations)
- [13.6 Structured Formats](#136-structured-formats)
- [13.7 Directories](#137-directories)

### 13.1 Paths and Discovery
<a id="131-paths-and-discovery"></a>



### 13.1.1 Paths in Applications

<a id="1311-paths-intro"></a>

**Beginner Level**: In real-world e-commerce workflows, Paths in Applications connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in e-commerce contexts combine solid practice around paths in applications with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to paths in applications affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in e-commerce systems.

```python
from pathlib import Path

p = Path("data/orders.csv")
print(p.name, p.suffix)
```

**Key Points**
- Paths locate invoices, exports, and config
- Choose `pathlib` for readable object-oriented paths
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.1.2 Absolute Paths

<a id="1312-absolute-paths"></a>

**Beginner Level**: In real-world backups workflows, Absolute Paths connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in backups contexts combine solid practice around absolute paths with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to absolute paths affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in backups systems.

```python
from pathlib import Path

print(Path("/var/log/app").is_absolute())
```

**Key Points**
- Anchor at filesystem root (or drive on Windows)
- Useful for daemon log locations
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.1.3 Relative Paths

<a id="1313-relative-paths"></a>

**Beginner Level**: In real-world local dev workflows, Relative Paths connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in local dev contexts combine solid practice around relative paths with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to relative paths affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in local dev systems.

```python
from pathlib import Path

cfg = Path("config/app.yaml")
print(cfg)
```

**Key Points**
- Resolved against process working directory
- Docker/K8s: set `WORKDIR` explicitly
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.1.4 Legacy `os.path`

<a id="1314-os-path"></a>

**Beginner Level**: In real-world legacy ERP workflows, Legacy `os.path` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in legacy ERP contexts combine solid practice around legacy `os.path` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to legacy `os.path` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in legacy ERP systems.

```python
import os.path

print(os.path.join("var", "data", "file.txt"))
```

**Key Points**
- Still common in older codebases
- `pathlib` often clearer for new code
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.1.5 `pathlib` Operations

<a id="1315-pathlib-overview"></a>

**Beginner Level**: In real-world media catalog workflows, `pathlib` Operations connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in media catalog contexts combine solid practice around `pathlib` operations with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `pathlib` operations affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in media catalog systems.

```python
from pathlib import Path

root = Path("assets")
for img in root.glob("*.png"):
    print(img)
```

**Key Points**
- `/`, `.glob`, `.read_text`, `.mkdir`
- Cross-platform path semantics
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.1.6 Checking Existence

<a id="1316-path-existence"></a>

**Beginner Level**: In real-world KYC uploads workflows, Checking Existence connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in KYC uploads contexts combine solid practice around checking existence with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to checking existence affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in KYC uploads systems.

```python
from pathlib import Path

p = Path("/tmp/kyc/doc.pdf")
print(p.exists(), p.is_file())
```

**Key Points**
- `exists` can race in concurrent systems
- Atomic create with `open(..., "x")` when needed
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.2 Opening and Closing

<a id="132-opening-and-closing"></a>

### 13.2.1 The `open()` Function

<a id="1321-open-function"></a>

**Beginner Level**: In real-world reports workflows, The `open()` Function connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in reports contexts combine solid practice around the `open()` function with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to the `open()` function affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in reports systems.

```python
f = open("report.txt", "w", encoding="utf-8")
f.write("ok")
f.close()
```

**Key Points**
- Returns a file-like object
- Always specify encoding for text mode
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.2.2 File Modes (`r`, `w`, `a`, `+`, `b`)

<a id="1322-file-modes"></a>

**Beginner Level**: In real-world inventory export workflows, File Modes (`r`, `w`, `a`, `+`, `b`) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in inventory export contexts combine solid practice around file modes (`r`, `w`, `a`, `+`, `b`) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to file modes (`r`, `w`, `a`, `+`, `b`) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in inventory export systems.

```python
open("out.csv", "w")  # truncate/create
open("log.txt", "a")  # append
```

**Key Points**
- `w` truncates; `a` preserves and appends at end
- `+` allows read/write when combined
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.2.3 Text Mode

<a id="1323-text-mode"></a>

**Beginner Level**: In real-world localization workflows, Text Mode connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in localization contexts combine solid practice around text mode with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to text mode affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in localization systems.

```python
open("poem.txt", "r", encoding="utf-8")
```

**Key Points**
- Decodes bytes to `str` using codec
- UTF-8 default expectation for new apps
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.2.4 Binary Mode

<a id="1324-binary-mode"></a>

**Beginner Level**: In real-world checksums workflows, Binary Mode connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in checksums contexts combine solid practice around binary mode with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to binary mode affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in checksums systems.

```python
data = open("image.bin", "rb").read()
print(len(data))
```

**Key Points**
- `bytes` I/O without decoding
- Use for images, pickles (careful), protobuf
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.2.5 The `encoding` Parameter

<a id="1325-encoding-parameter"></a>

**Beginner Level**: In real-world CSV feeds workflows, The `encoding` Parameter connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in CSV feeds contexts combine solid practice around the `encoding` parameter with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to the `encoding` parameter affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in CSV feeds systems.

```python
open("customers.csv", "r", encoding="utf-8-sig")  # BOM handling
```

**Key Points**
- Explicit encoding prevents mojibake in international data
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.2.6 `close()` and Resource Hygiene

<a id="1326-close"></a>

**Beginner Level**: In real-world batch workflows, `close()` and Resource Hygiene connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in batch contexts combine solid practice around `close()` and resource hygiene with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `close()` and resource hygiene affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in batch systems.

```python
f = open("tmp.txt", "w")
try:
    f.write("x")
finally:
    f.close()
```

**Key Points**
- OS file descriptors are limited—close promptly
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.2.7 The `with` Statement

<a id="1327-with-statement"></a>

**Beginner Level**: In real-world payments audit workflows, The `with` Statement connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in payments audit contexts combine solid practice around the `with` statement with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to the `with` statement affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in payments audit systems.

```python
with open("audit.log", "a", encoding="utf-8") as f:
    f.write("event\n")
```

**Key Points**
- Context manager ensures closure even on exceptions
- Preferred over manual try/finally for files
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.3 Reading

<a id="133-reading"></a>

### 13.3.1 `read()`

<a id="1331-read"></a>

**Beginner Level**: In real-world small configs workflows, `read()` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in small configs contexts combine solid practice around `read()` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `read()` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in small configs systems.

```python
with open("config.json", "r", encoding="utf-8") as f:
    body = f.read()
print(body[:20])
```

**Key Points**
- `read(n)` optional size cap
- Large files: stream or mmap
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.3.2 `readline()`

<a id="1332-readline"></a>

**Beginner Level**: In real-world log tailing workflows, `readline()` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in log tailing contexts combine solid practice around `readline()` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `readline()` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in log tailing systems.

```python
with open("app.log", "r", encoding="utf-8") as f:
    first = f.readline()
print(first.strip())
```

**Key Points**
- Includes newline character unless stripped
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.3.3 `readlines()`

<a id="1333-readlines"></a>

**Beginner Level**: In real-world unit tests workflows, `readlines()` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in unit tests contexts combine solid practice around `readlines()` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `readlines()` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in unit tests systems.

```python
with open("sample.txt", "w", encoding="utf-8") as f:
    f.write("a\nb\n")
with open("sample.txt", "r", encoding="utf-8") as f:
    print(f.readlines())
```

**Key Points**
- Returns list of lines—memory heavy on big files
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.3.4 Iterating a Text File

<a id="1334-iterating-files"></a>

**Beginner Level**: In real-world warehouse ETL workflows, Iterating a Text File connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in warehouse ETL contexts combine solid practice around iterating a text file with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to iterating a text file affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in warehouse ETL systems.

```python
with open("lines.txt", "r", encoding="utf-8") as f:
    for line in f:
        print(line.strip())
```

**Key Points**
- Iterator reads incrementally—scalable
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.3.5 `seek()` for Random Access

<a id="1335-seek"></a>

**Beginner Level**: In real-world index files workflows, `seek()` for Random Access connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in index files contexts combine solid practice around `seek()` for random access with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `seek()` for random access affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in index files systems.

```python
with open("fixed.bin", "w+b") as f:
    f.write(b"0123456789")
    f.seek(5)
    print(f.read(1))
```

**Key Points**
- `whence` 0 start, 1 current, 2 end
- Text files: only safe seeks to known offsets with same encoding
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.3.6 `tell()` Current Offset

<a id="1336-tell"></a>

**Beginner Level**: In real-world binary protocols workflows, `tell()` Current Offset connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in binary protocols contexts combine solid practice around `tell()` current offset with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `tell()` current offset affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in binary protocols systems.

```python
with open("blob.dat", "wb") as f:
    f.write(b"abc")
    print(f.tell())
```

**Key Points**
- Useful when writing length-prefixed frames
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.4 Writing

<a id="134-writing"></a>

### 13.4.1 `write()`

<a id="1341-write"></a>

**Beginner Level**: In real-world invoice PDF sidecar workflows, `write()` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in invoice PDF sidecar contexts combine solid practice around `write()` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `write()` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in invoice PDF sidecar systems.

```python
with open("note.txt", "w", encoding="utf-8") as f:
    n = f.write("total due")
    print(n)
```

**Key Points**
- Returns number of characters/bytes written
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.4.2 `writelines()`

<a id="1342-writelines"></a>

**Beginner Level**: In real-world bulk export workflows, `writelines()` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in bulk export contexts combine solid practice around `writelines()` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `writelines()` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in bulk export systems.

```python
lines = ["a\n", "b\n"]
with open("out.txt", "w", encoding="utf-8") as f:
    f.writelines(lines)
```

**Key Points**
- Does not add separators automatically
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.4.3 Appending

<a id="1343-append-mode"></a>

**Beginner Level**: In real-world audit trails workflows, Appending connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in audit trails contexts combine solid practice around appending with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to appending affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in audit trails systems.

```python
with open("ledger.txt", "a", encoding="utf-8") as f:
    f.write("txn\n")
```

**Key Points**
- `a` writes at EOF without truncating
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.4.4 Creating New Files

<a id="1344-creating-files"></a>

**Beginner Level**: In real-world idempotency workflows, Creating New Files connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in idempotency contexts combine solid practice around creating new files with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to creating new files affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in idempotency systems.

```python
open("new_only.txt", "x", encoding="utf-8").write("fresh")
```

**Key Points**
- `x` fails if exists—prevents accidental overwrite
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.4.5 Overwriting Behavior

<a id="1345-overwriting"></a>

**Beginner Level**: In real-world catalog refresh workflows, Overwriting Behavior connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in catalog refresh contexts combine solid practice around overwriting behavior with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to overwriting behavior affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in catalog refresh systems.

```python
open("snapshot.json", "w", encoding="utf-8").write("{}")
```

**Key Points**
- `w` truncates first—backup before destructive writes
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.4.6 Buffering and `flush()`

<a id="1346-buffering-and-flush"></a>

**Beginner Level**: In real-world real-time logs workflows, Buffering and `flush()` connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in real-time logs contexts combine solid practice around buffering and `flush()` with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to buffering and `flush()` affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in real-time logs systems.

```python
import sys
sys.stdout.write("ping")
sys.stdout.flush()
```

**Key Points**
- Line-buffered text files flush on newline
- `flush` before crash diagnostics
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.5 File Operations

<a id="135-file-operations"></a>

### 13.5.1 Copying Files

<a id="1351-copying-files"></a>

**Beginner Level**: In real-world content CDN workflows, Copying Files connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in content CDN contexts combine solid practice around copying files with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to copying files affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in content CDN systems.

```python
from pathlib import Path
import shutil

src = Path("a.txt")
src.write_text("x", encoding="utf-8")
shutil.copy(src, Path("b.txt"))
```

**Key Points**
- `shutil.copy2` preserves metadata
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.5.2 Moving Files

<a id="1352-moving-files"></a>

**Beginner Level**: In real-world warehouse bins workflows, Moving Files connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in warehouse bins contexts combine solid practice around moving files with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to moving files affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in warehouse bins systems.

```python
from pathlib import Path
import shutil

Path("old.txt").write_text("v", encoding="utf-8")
shutil.move("old.txt", "new.txt")
```

**Key Points**
- Atomic on same filesystem where possible
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.5.3 Renaming Paths

<a id="1353-renaming"></a>

**Beginner Level**: In real-world versioned exports workflows, Renaming Paths connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in versioned exports contexts combine solid practice around renaming paths with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to renaming paths affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in versioned exports systems.

```python
from pathlib import Path

Path("v1.txt").write_text("1", encoding="utf-8")
Path("v1.txt").rename("v2.txt")
```

**Key Points**
- `Path.rename` replaces destination if exists on Unix—watch out
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.5.4 Deleting Files

<a id="1354-deleting-files"></a>

**Beginner Level**: In real-world GDPR erasure workflows, Deleting Files connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in GDPR erasure contexts combine solid practice around deleting files with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to deleting files affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in GDPR erasure systems.

```python
from pathlib import Path

p = Path("pii.tmp")
p.write_text("secret", encoding="utf-8")
p.unlink()
```

**Key Points**
- `missing_ok` avoids race errors in cleanup
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.5.5 File Permissions

<a id="1355-permissions"></a>

**Beginner Level**: In real-world shared servers workflows, File Permissions connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in shared servers contexts combine solid practice around file permissions with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to file permissions affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in shared servers systems.

```python
import os
from pathlib import Path

Path("secure.txt").write_text("x", encoding="utf-8")
os.chmod("secure.txt", 0o600)
```

**Key Points**
- Least privilege for credential files
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.5.6 File Metadata (`stat`)

<a id="1356-metadata"></a>

**Beginner Level**: In real-world compliance workflows, File Metadata (`stat`) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in compliance contexts combine solid practice around file metadata (`stat`) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to file metadata (`stat`) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in compliance systems.

```python
from pathlib import Path

p = Path(__file__)
st = p.stat()
print(st.st_size)
```

**Key Points**
- mtime for cache invalidation
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.6 Structured Formats

<a id="136-structured-formats"></a>

### 13.6.1 CSV Files

<a id="1361-csv-format"></a>

**Beginner Level**: In real-world sales ops workflows, CSV Files connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in sales ops contexts combine solid practice around csv files with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to csv files affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in sales ops systems.

```python
import csv
from io import StringIO

buf = StringIO()
w = csv.writer(buf)
w.writerow(["sku", "qty"])
print(buf.getvalue())
```

**Key Points**
- Use `csv` module—do not split on commas naively
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.6.2 JSON Files

<a id="1362-json-format"></a>

**Beginner Level**: In real-world REST cache workflows, JSON Files connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in REST cache contexts combine solid practice around json files with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to json files affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in REST cache systems.

```python
import json

payload = {"user": 1, "cart": [1, 2]}
print(json.dumps(payload))
```

**Key Points**
- `json.load` / `json.dump` for files
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.6.3 YAML Configuration

<a id="1363-yaml-format"></a>

**Beginner Level**: In real-world k8s style workflows, YAML Configuration connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in k8s style contexts combine solid practice around yaml configuration with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to yaml configuration affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in k8s style systems.

```python
# pip install pyyaml  # third-party
# import yaml; yaml.safe_load("a: 1")
config = {"a": 1}
print(config)
```

**Key Points**
- Never `yaml.load` untrusted input—use `safe_load`
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.6.4 XML Documents

<a id="1364-xml-format"></a>

**Beginner Level**: In real-world enterprise feeds workflows, XML Documents connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in enterprise feeds contexts combine solid practice around xml documents with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to xml documents affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in enterprise feeds systems.

```python
import xml.etree.ElementTree as ET

root = ET.fromstring("<order id='1'/>")
print(root.attrib["id"])
```

**Key Points**
- Beware billion laughs—limit parsers and validate sources
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.6.5 Binary Files

<a id="1365-binary-files"></a>

**Beginner Level**: In real-world receipt images workflows, Binary Files connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in receipt images contexts combine solid practice around binary files with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to binary files affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in receipt images systems.

```python
with open("blob.bin", "wb") as f:
    f.write(bytes(range(4)))
```

**Key Points**
- Use `bytes`/`memoryview` for performance
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.6.6 `pickle` (Use with Care)

<a id="1366-pickle-caution"></a>

**Beginner Level**: In real-world internal only workflows, `pickle` (Use with Care) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in internal only contexts combine solid practice around `pickle` (use with care) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `pickle` (use with care) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in internal only systems.

```python
import pickle

b = pickle.dumps({"k": 1})
print(pickle.loads(b))
```

**Key Points**
- Never unpickle untrusted data—RCE risk
- Prefer JSON/Protobuf across trust boundaries
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.6.7 JSON File Round-trip

<a id="1367-json-file-roundtrip"></a>

**Beginner Level**: In real-world config service workflows, JSON File Round-trip connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in config service contexts combine solid practice around json file round-trip with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to json file round-trip affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in config service systems.

```python
import json
from pathlib import Path

p = Path("cfg.json")
p.write_text(json.dumps({"fee_bps": 30}), encoding="utf-8")
print(json.loads(p.read_text(encoding="utf-8")))
```

**Key Points**
- `json.dump`/`load` for file objects; `dumps`/`loads` for strings
- Keep UTF-8 for cross-platform configs
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.6.8 `csv.DictReader` for Named Columns

<a id="1368-csv-dictreader"></a>

**Beginner Level**: In real-world payroll export workflows, `csv.DictReader` for Named Columns connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in payroll export contexts combine solid practice around `csv.dictreader` for named columns with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to `csv.dictreader` for named columns affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in payroll export systems.

```python
import csv
from io import StringIO

buf = StringIO("name,hours\nBo,40\n")
rows = list(csv.DictReader(buf))
print(rows[0]["name"])
```

**Key Points**
- Headers become keys—safer than positional indexing
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.6.9 Line-delimited JSON (NDJSON) Streams

<a id="1369-line-delimited-json"></a>

**Beginner Level**: In real-world analytics workflows, Line-delimited JSON (NDJSON) Streams connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in analytics contexts combine solid practice around line-delimited json (ndjson) streams with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to line-delimited json (ndjson) streams affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in analytics systems.

```python
from pathlib import Path

p = Path("events.ndjson")
p.write_text('{"e":"view"}\n{"e":"click"}\n', encoding="utf-8")
for line in p.read_text(encoding="utf-8").splitlines():
    print(line[:10])
```

**Key Points**
- One JSON object per line simplifies streaming ingestion
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.6.10 Secure Temporary Files (`tempfile`)

<a id="13610-tempfile-module"></a>

**Beginner Level**: In real-world KYC uploads workflows, Secure Temporary Files (`tempfile`) connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in KYC uploads contexts combine solid practice around secure temporary files (`tempfile`) with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to secure temporary files (`tempfile`) affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in KYC uploads systems.

```python
import tempfile
from pathlib import Path

with tempfile.TemporaryDirectory() as d:
    f = Path(d) / "scan.pdf"
    f.write_bytes(b"%PDF")
    print(f.exists())
```

**Key Points**
- Avoid predictable `/tmp` names—race and symlink attacks
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.6.11 File Locking Patterns

<a id="13611-file-locking-note"></a>

**Beginner Level**: In real-world multi-worker cron workflows, File Locking Patterns connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in multi-worker cron contexts combine solid practice around file locking patterns with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to file locking patterns affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in multi-worker cron systems.

```python
# import fcntl  # Unix: fcntl.flock(fd, fcntl.LOCK_EX)
# Document lock scope with your platform—no single stdlib cross-platform lock
print("coordinate writers")
```

**Key Points**
- Use OS-specific locks or databases for cross-host coordination
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.6.12 Chunked Reads for Large Files

<a id="13612-large-files-chunked"></a>

**Beginner Level**: In real-world data lake export workflows, Chunked Reads for Large Files connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in data lake export contexts combine solid practice around chunked reads for large files with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to chunked reads for large files affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in data lake export systems.

```python
from pathlib import Path

p = Path("big.txt")
p.write_text("x\\n" * 1000, encoding="utf-8")

def chunks(path, size=256):
    with path.open("r", encoding="utf-8") as f:
        while True:
            piece = f.read(size)
            if not piece:
                break
            yield piece


print(sum(1 for _ in chunks(p)))
```

**Key Points**
- Control memory by bounded `read(size)` loops
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.7 Directories

<a id="137-directories"></a>

### 13.7.1 Creating Directories

<a id="1371-create-directory"></a>

**Beginner Level**: In real-world tenant exports workflows, Creating Directories connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in tenant exports contexts combine solid practice around creating directories with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to creating directories affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in tenant exports systems.

```python
from pathlib import Path

Path("out/2024/dec").mkdir(parents=True, exist_ok=True)
```

**Key Points**
- `parents=True` builds nested tree
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.7.2 Listing Directories

<a id="1372-listing-directory"></a>

**Beginner Level**: In real-world media library workflows, Listing Directories connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in media library contexts combine solid practice around listing directories with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to listing directories affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in media library systems.

```python
from pathlib import Path

for child in Path(".").iterdir():
    print(child.name)
```

**Key Points**
- `iterdir` yields Path objects
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.7.3 Walking Directory Trees

<a id="1373-walking-trees"></a>

**Beginner Level**: In real-world bulk ingest workflows, Walking Directory Trees connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in bulk ingest contexts combine solid practice around walking directory trees with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to walking directory trees affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in bulk ingest systems.

```python
from pathlib import Path

for p in Path("src").rglob("*.py"):
    if p.is_file():
        print(p)
```

**Key Points**
- `rglob` recursive glob
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.7.4 Removing Directories

<a id="1374-removing-trees"></a>

**Beginner Level**: In real-world temp workspaces workflows, Removing Directories connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in temp workspaces contexts combine solid practice around removing directories with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to removing directories affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in temp workspaces systems.

```python
from pathlib import Path
import shutil

d = Path("tmp_tree")
d.mkdir()
(d / "f.txt").write_text("x", encoding="utf-8")
shutil.rmtree(d)
```

**Key Points**
- `rmtree` is destructive—confirm paths
- See code sample.
- Relates to production data integrity.
- Test edge cases.

### 13.7.5 Joining and Normalizing Paths

<a id="1375-path-combine-patterns"></a>

**Beginner Level**: In real-world multi-OS CLI workflows, Joining and Normalizing Paths connects what users see to correct business rules—start with one happy path and one failure path before adding complexity.

**Intermediate Level**: Production services in multi-OS CLI contexts combine solid practice around joining and normalizing paths with validation, logging, and tests so edge cases (empty inputs, stale state) do not corrupt money or inventory.

**Expert Level**: At scale, choices tied to joining and normalizing paths affect latency, observability, and safe refactors: prefer explicit state machines or dispatch tables when nested branching harms maintainability in multi-OS CLI systems.

```python
from pathlib import Path

base = Path("data")
print((base / ".." / "cfg").resolve())
```

**Key Points**
- `resolve` canonicalizes `..` segments
- See code sample.
- Relates to production data integrity.
- Test edge cases.


---

## Worked example: atomic config write for a bank microservice

**Beginner Level**: Write JSON to a temp file in the same directory, then replace the old config.

**Intermediate Level**: Use `Path.write_text` with `tmp` + `replace` and `fsync` where durability matters.

**Expert Level**: On POSIX, `os.replace` is atomic when source and dest are on same filesystem; pair with file locks for multi-process writers.

```python
import json
from pathlib import Path


def write_config_atomic(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, indent=2), encoding="utf-8")
    tmp.replace(path)


cfg = Path("settings.json")
write_config_atomic(cfg, {"env": "prod", "fee_bps": 35})
print(cfg.read_text(encoding="utf-8")[:40])
```

**Key Points**
- Never truncate the only copy in place without a backup window.
- Encoding and newline consistency matter for diffs and audits.

---

## Best Practices

- Always specify `encoding='utf-8'` for text unless you have a binary contract.
- Use context managers (`with`) so descriptors close on errors.
- For large files, stream line-by-line instead of `read()` whole file.
- Validate external formats (XML/CSV) against schemas and size limits.

---

## Common Mistakes to Avoid

- Using default encoding on Windows—silent corruption risk.
- Reading/writing pickle from untrusted sources.
- Calling `unlink`/`rmtree` on unvalidated user-provided paths.
