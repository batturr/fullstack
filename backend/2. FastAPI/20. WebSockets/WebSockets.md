# WebSockets

WebSockets enable **full-duplex**, **long-lived** communication between clients and servers over a single TCP connection. In FastAPI, `WebSocket` integrates cleanly with **Starlette**’s ASGI stack, **dependency injection**, and **async** handlers. This chapter moves from **protocol fundamentals** through **endpoint design**, **message patterns**, **connection management**, **production concerns**, **domain use cases**, and **testing**.

**How to use these notes:** Run examples with `uvicorn app:app --reload`. For browser clients, use the **WebSocket API**; for tests, prefer **`TestClient.websocket_connect`** or **`websockets`** / **`httpx`** libraries. Always validate **origin**, **auth**, and **payloads** before trusting peer data.

## 📑 Table of Contents

- [20.1 WebSocket Basics](#201-websocket-basics)
  - [20.1.1 WebSocket Protocol](#2011-websocket-protocol)
  - [20.1.2 vs HTTP](#2012-vs-http)
  - [20.1.3 Connection Lifecycle](#2013-connection-lifecycle)
  - [20.1.4 Bidirectional Communication](#2014-bidirectional-communication)
  - [20.1.5 Use Cases](#2015-use-cases)
- [20.2 Creating WebSocket Endpoints](#202-creating-websocket-endpoints)
  - [20.2.1 @app.websocket Decorator](#2021-appwebsocket-decorator)
  - [20.2.2 WebSocket Connection](#2022-websocket-connection)
  - [20.2.3 Receiving Data](#2023-receiving-data)
  - [20.2.4 Sending Data](#2024-sending-data)
  - [20.2.5 Connection Closure](#2025-connection-closure)
- [20.3 Client-Server Communication](#203-client-server-communication)
  - [20.3.1 JSON Messaging](#2031-json-messaging)
  - [20.3.2 Text Messages](#2032-text-messages)
  - [20.3.3 Binary Messages](#2033-binary-messages)
  - [20.3.4 Message Routing](#2034-message-routing)
  - [20.3.5 Message Validation](#2035-message-validation)
- [20.4 WebSocket Management](#204-websocket-management)
  - [20.4.1 Multiple Connections](#2041-multiple-connections)
  - [20.4.2 Connection Tracking](#2042-connection-tracking)
  - [20.4.3 Broadcasting](#2043-broadcasting)
  - [20.4.4 Unicasting](#2044-unicasting)
  - [20.4.5 Room/Channel Pattern](#2045-roomchannel-pattern)
- [20.5 Advanced WebSocket Features](#205-advanced-websocket-features)
  - [20.5.1 Reconnection Handling](#2051-reconnection-handling)
  - [20.5.2 Heartbeat/Ping-Pong](#2052-heartbeatping-pong)
  - [20.5.3 Error Handling](#2053-error-handling)
  - [20.5.4 Graceful Shutdown](#2054-graceful-shutdown)
  - [20.5.5 Authentication](#2055-authentication)
- [20.6 WebSocket Use Cases](#206-websocket-use-cases)
  - [20.6.1 Real-time Chat](#2061-real-time-chat)
  - [20.6.2 Live Notifications](#2062-live-notifications)
  - [20.6.3 Collaborative Editing](#2063-collaborative-editing)
  - [20.6.4 Live Streaming](#2064-live-streaming)
  - [20.6.5 Gaming Applications](#2065-gaming-applications)
- [20.7 Testing WebSockets](#207-testing-websockets)
  - [20.7.1 WebSocket Test Client](#2071-websocket-test-client)
  - [20.7.2 Connection Testing](#2072-connection-testing)
  - [20.7.3 Message Testing](#2073-message-testing)
  - [20.7.4 Error Scenario Testing](#2074-error-scenario-testing)
  - [20.7.5 Load Testing](#2075-load-testing)
- [Chapter Key Points, Best Practices, and Common Mistakes](#chapter-key-points-best-practices-and-common-mistakes)

---

## 20.1 WebSocket Basics

Before wiring FastAPI routes, understand what the browser and proxies see: an **upgrade** from HTTP, a **framed** protocol, and **application-level** semantics you must define yourself.

### 20.1.1 WebSocket Protocol

#### Beginner

WebSocket is defined by **RFC 6455**. The client starts with an HTTP **Upgrade** request; the server responds **101 Switching Protocols**. After the handshake, both sides exchange **frames** (text, binary, ping, pong, close) on the same TCP connection—no new HTTP request per message.

```python
# Conceptual: FastAPI/Starlette performs the handshake when you accept the socket
from fastapi import FastAPI, WebSocket

app = FastAPI()


@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket) -> None:
    await websocket.accept()
    await websocket.send_text("handshake complete — now we speak WebSocket frames")
    await websocket.close()
```

#### Intermediate

Frames include **opcode**, **mask** (client-to-server only), **payload length**, and optional **extensions** negotiated in headers (`Sec-WebSocket-Extensions`). Proxies may buffer unless configured for **WebSocket pass-through**. TLS terminates at **WSS** (`wss://`) the same way HTTPS does.

```python
from fastapi import FastAPI, WebSocket

app = FastAPI()


@app.websocket("/ws")
async def echo(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        while True:
            message = await websocket.receive_text()
            await websocket.send_text(message)
    except Exception:
        await websocket.close()
```

#### Expert

Study **compression** (`permessage-deflate`), **subprotocols** (`Sec-WebSocket-Protocol`), and **backpressure**: ASGI servers apply **flow control**; saturating `send_*` without awaiting can stall the event loop or exhaust memory if you buffer unbounded outbound messages.

**Key Points (20.1.1)**

- WebSocket is **not** HTTP after upgrade; it is a **distinct framing layer** on TCP.
- **RFC 6455** specifies handshake, framing, and close codes.

**Best Practices (20.1.1)**

- Prefer **WSS** in production and terminate TLS at a well-understood edge.

**Common Mistakes (20.1.1)**

- Assuming WebSocket **inherits** HTTP caching or REST semantics—it does not.

### 20.1.2 vs HTTP

#### Beginner

**HTTP/1.1** is mostly **request-response**: client asks, server answers (unless streaming). **WebSocket** keeps the connection open so **either side** can send anytime—ideal for **push** and **interactive** UIs.

```python
from fastapi import FastAPI, WebSocket
from fastapi.responses import JSONResponse

app = FastAPI()


@app.get("/poll")
async def poll() -> JSONResponse:
    return JSONResponse({"server_time_ms": 0})


@app.websocket("/live")
async def live(websocket: WebSocket) -> None:
    await websocket.accept()
    await websocket.send_json({"channel": "live", "note": "server can push without a new GET"})
    await websocket.close()
```

#### Intermediate

**HTTP/2** multiplexes streams but is still **master-slave** from the client’s perspective for typical browser APIs. WebSocket gives you a **single bi-directional channel** with low framing overhead for **many small messages**.

#### Expert

For **public APIs**, HTTP **cacheability** and **CDN** friendliness beat WebSockets. Use WebSockets when **latency**, **fan-out complexity**, or **session state** on the wire outweighs operational cost.

**Key Points (20.1.2)**

- Choose HTTP for **stateless**, **cacheable** resources; WebSocket for **sessions** and **push**.

**Best Practices (20.1.2)**

- Expose **REST** for CRUD and **WS** for live channels—do not duplicate every REST route over WS without reason.

**Common Mistakes (20.1.2)**

- Polling aggressively with HTTP when a **single** WebSocket would reduce load.

### 20.1.3 Connection Lifecycle

#### Beginner

Lifecycle: **connect** → **accept** → **receive/send loop** → **close** (client, server, or error). Closing sends a **close frame** with a **code** and optional **reason**.

```python
from fastapi import WebSocket, WebSocketDisconnect, FastAPI

app = FastAPI()


@app.websocket("/chat")
async def chat(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"echo: {data}")
    except WebSocketDisconnect:
        # client gone — clean up session-scoped resources here
        return
```

#### Intermediate

`WebSocketDisconnect` is raised when the peer closes or the connection drops. Use **`try/finally`** for **guaranteed** cleanup (DB rows, Redis keys, tasks).

```python
from fastapi import WebSocket, WebSocketDisconnect, FastAPI

app = FastAPI()


@app.websocket("/scoped")
async def scoped(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        while True:
            await websocket.send_text(await websocket.receive_text())
    except WebSocketDisconnect:
        pass
    finally:
        # release locks, unsubscribe channels, cancel asyncio tasks
        ...
```

#### Expert

Coordinate lifecycle with **app shutdown**: cancel **background tasks** tied to the socket, flush **metrics**, and use **timeouts** on `receive_*` to detect **half-open** TCP connections behind broken NATs.

**Key Points (20.1.3)**

- Always plan **cleanup** on disconnect—users close tabs without warning.

**Best Practices (20.1.3)**

- Use **`finally`** for idempotent teardown logic.

**Common Mistakes (20.1.3)**

- Leaking **global** registries of dead sockets because disconnect paths were not handled.

### 20.1.4 Bidirectional Communication

#### Beginner

Either party may send **text** or **binary** at any time. Your server loop typically **awaits** incoming messages and **responds** or **pushes** based on application rules.

```python
import asyncio
from fastapi import FastAPI, WebSocket

app = FastAPI()


@app.websocket("/tick")
async def tick(websocket: WebSocket) -> None:
    await websocket.accept()
    sender = asyncio.create_task(_push_ticks(websocket))
    try:
        while True:
            msg = await websocket.receive_text()
            if msg == "pause":
                await websocket.send_text("paused")
    finally:
        sender.cancel()


async def _push_ticks(ws: WebSocket) -> None:
    i = 0
    while True:
        await asyncio.sleep(1.0)
        i += 1
        await ws.send_text(f"tick {i}")
```

#### Intermediate

When combining **reader** and **writer** tasks, use **`asyncio.wait`** or structured concurrency (`TaskGroup` on 3.11+) to avoid **orphan tasks** and to shut down cleanly.

#### Expert

For **high-throughput** feeds, separate **ingress** parsing from **egress** scheduling; apply **per-connection queues** with **drop** or **coalesce** policies to protect p99 latency.

**Key Points (20.1.4)**

- Bi-directional does not mean “free”—you still design **protocol** and **flow control**.

**Best Practices (20.1.4)**

- Prefer **one** clear ownership model for who may send which **message types**.

**Common Mistakes (20.1.4)**

- Blocking the loop with **CPU-heavy** work inside the receive loop.

### 20.1.5 Use Cases

#### Beginner

Common uses: **chat**, **notifications**, **live dashboards**, **collaboration**, **multiplayer** games, **progress** streams for long jobs.

```python
from fastapi import FastAPI, WebSocket

app = FastAPI()


@app.websocket("/notify")
async def notify(websocket: WebSocket) -> None:
    await websocket.accept()
    await websocket.send_json({"type": "welcome", "user": "anonymous"})
    await websocket.close()
```

#### Intermediate

Also consider **SSE** for **server→client** one-way streams (simpler over HTTP) and **message queues** (Redis, NATS) when you need **durable** delivery across processes.

#### Expert

At scale, **edge** WebSocket brokers, **sticky sessions**, and **horizontal** fan-out via pub/sub become architectural requirements—not afterthoughts.

**Key Points (20.1.5)**

- Match transport to **directionality**, **durability**, and **scale**.

**Best Practices (20.1.5)**

- Document **message schema** and **versioning** before shipping clients.

**Common Mistakes (20.1.5)**

- Using WebSocket for **file upload** primary path—multipart HTTP is usually simpler.

---

## 20.2 Creating WebSocket Endpoints

FastAPI exposes WebSockets with the same **routing** and **dependency** system as HTTP—only the request type differs.

### 20.2.1 @app.websocket Decorator

#### Beginner

Register a WebSocket route with `@app.websocket("/path")`. The handler receives a **`WebSocket`** instance.

```python
from fastapi import FastAPI, WebSocket

app = FastAPI()


@app.websocket("/ws")
async def root_ws(websocket: WebSocket) -> None:
    await websocket.accept()
    await websocket.close()
```

#### Intermediate

Combine with **`APIRouter`** for modular apps: `router = APIRouter()` then `router.websocket("/updates")`.

```python
from fastapi import APIRouter, FastAPI, WebSocket

router = APIRouter()


@router.websocket("/updates")
async def updates(websocket: WebSocket) -> None:
    await websocket.accept()
    await websocket.close()


app = FastAPI()
app.include_router(router, prefix="/api")
```

#### Expert

WebSocket routes participate in **OpenAPI** limitations—document protocols via **descriptions** and separate **asyncapi** specs if consumers are external.

**Key Points (20.2.1)**

- `@app.websocket` is the entry point for **ASGI WebSocket** sessions.

**Best Practices (20.2.1)**

- Namespace paths (`/ws/v1/...`) when evolving **wire protocols**.

**Common Mistakes (20.2.1)**

- Forgetting **`await websocket.accept()`**, leaving clients hanging.

### 20.2.2 WebSocket Connection

#### Beginner

`await websocket.accept()` completes the handshake. Optionally pass **`subprotocol`**, **`headers`**, to customize the response.

```python
from fastapi import WebSocket, FastAPI

app = FastAPI()


@app.websocket("/proto")
async def proto(websocket: WebSocket) -> None:
    await websocket.accept(subprotocol="chat.v1+json")
    await websocket.send_text("using negotiated subprotocol (if client offered it)")
    await websocket.close()
```

#### Intermediate

Inspect **`websocket.headers`** and **`websocket.query_params`** before `accept()` for **auth** and **routing**—reject with `websocket.close(code=4401)` pattern via closing without accept or using middleware patterns.

```python
from fastapi import WebSocket, FastAPI, status

app = FastAPI()


@app.websocket("/secure")
async def secure(websocket: WebSocket) -> None:
    token = websocket.query_params.get("token")
    if token != "secret":
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    await websocket.accept()
    await websocket.close()
```

#### Expert

Behind **load balancers**, ensure **`X-Forwarded-Proto`** and **cookie** settings align with **secure** cookie policies; WebSocket cookies behave like HTTP for the handshake.

**Key Points (20.2.2)**

- The **handshake** is your last easy moment to **deny** connection cheaply.

**Best Practices (20.2.2)**

- Prefer **short-lived tokens** in query or **header**-based auth strategies documented for your clients.

**Common Mistakes (20.2.2)**

- Accepting first, then realizing auth failed—now you must **close** and audit noisy failures.

### 20.2.3 Receiving Data

#### Beginner

Use `receive_text()`, `receive_bytes()`, or `receive_json()` to read messages. They **await** until a message arrives.

```python
from fastapi import WebSocket, FastAPI

app = FastAPI()


@app.websocket("/in")
async def inbound(websocket: WebSocket) -> None:
    await websocket.accept()
    text = await websocket.receive_text()
    await websocket.send_text(f"got: {text}")
    await websocket.close()
```

#### Intermediate

`websocket.receive()` returns a **dict** with **`type`** (`websocket.receive` payload) for advanced branching between text, bytes, and disconnect events.

```python
from fastapi import WebSocket, FastAPI

app = FastAPI()


@app.websocket("/raw")
async def raw(websocket: WebSocket) -> None:
    await websocket.accept()
    event = await websocket.receive()
    if "text" in event:
        await websocket.send_text(event["text"])
    elif "bytes" in event:
        await websocket.send_bytes(event["bytes"])
    await websocket.close()
```

#### Expert

Implement **timeouts** with `asyncio.wait_for` around `receive_*` to detect **silent** dead peers.

**Key Points (20.2.3)**

- Pick **one** receive style per loop iteration or centralize parsing.

**Best Practices (20.2.3)**

- Validate **size** and **rate** before parsing expensive payloads.

**Common Mistakes (20.2.3)**

- Calling `receive_json()` on **binary** frames—expect exceptions or protocol errors.

### 20.2.4 Sending Data

#### Beginner

`send_text`, `send_bytes`, `send_json` serialize outbound frames. All are **async** and should be **awaited**.

```python
from fastapi import WebSocket, FastAPI

app = FastAPI()


@app.websocket("/out")
async def outbound(websocket: WebSocket) -> None:
    await websocket.accept()
    await websocket.send_json({"ok": True, "value": 42})
    await websocket.close()
```

#### Intermediate

Large payloads: consider **chunking** at application level or using **binary** frames with efficient serializers (MessagePack) for bandwidth.

#### Expert

Backpressure: if your producer outpaces the network, bound **queues** and measure **queue depth** per connection.

**Key Points (20.2.4)**

- `send_json` uses **`json.dumps`** defaults—handle **datetime** and **Decimal** explicitly.

**Best Practices (20.2.4)**

- Use **stable** field ordering and **explicit** schemas for cross-language clients.

**Common Mistakes (20.2.4)**

- Sending **non-JSON-serializable** objects without custom encoders.

### 20.2.5 Connection Closure

#### Beginner

`await websocket.close(code=1000, reason="done")` sends a close frame. Clients may close first; catch **`WebSocketDisconnect`**.

```python
from fastapi import WebSocket, WebSocketDisconnect, FastAPI

app = FastAPI()


@app.websocket("/bye")
async def bye(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        await websocket.receive_text()
    except WebSocketDisconnect:
        return
    await websocket.close(code=1000)
```

#### Intermediate

Use **registered** close codes: `1000` normal, `1001` going away, `1008` policy violation, `1011` server error—do not invent arbitrary codes.

#### Expert

On shutdown, **broadcast** `1001` and **await** pending `send` operations where your stack allows; coordinate with **Kubernetes** preStop hooks.

**Key Points (20.2.5)**

- Closure is part of your **API contract**—clients parse **codes**.

**Best Practices (20.2.5)**

- Map **application errors** to documented **close codes** and JSON **error events** before close when possible.

**Common Mistakes (20.2.5)**

- Closing **without** reading remaining frames—can surprise some proxies; usually acceptable at app level but know your client.

---

## 20.3 Client-Server Communication

Define a **message contract** early: types, versions, and error envelopes—WebSocket does not do this for you.

### 20.3.1 JSON Messaging

#### Beginner

`send_json` / `receive_json` are convenient for web clients. Always include a **`type`** discriminator field.

```python
from fastapi import WebSocket, FastAPI

app = FastAPI()


@app.websocket("/json")
async def json_ws(websocket: WebSocket) -> None:
    await websocket.accept()
    msg = await websocket.receive_json()
    if msg.get("type") == "ping":
        await websocket.send_json({"type": "pong"})
    await websocket.close()
```

#### Intermediate

Version your payloads: `{"v":1,"type":"chat.message","body":{...}}` to evolve servers without breaking old apps.

#### Expert

Consider **JSON Schema** or **Pydantic** models for **ingress** validation—convert dict → model, reject with typed error messages.

```python
from pydantic import BaseModel, ValidationError
from fastapi import WebSocket, FastAPI

app = FastAPI()


class ChatIn(BaseModel):
    type: str
    text: str


@app.websocket("/chat")
async def chat(websocket: WebSocket) -> None:
    await websocket.accept()
    raw = await websocket.receive_json()
    try:
        data = ChatIn.model_validate(raw)
    except ValidationError as exc:
        await websocket.send_json({"type": "error", "detail": exc.errors()})
        await websocket.close(code=1003)
        return
    await websocket.send_json({"type": "ack", "echo": data.text})
    await websocket.close()
```

**Key Points (20.3.1)**

- JSON is ubiquitous but **verbose**; watch **payload size**.

**Best Practices (20.3.1)**

- Use **envelopes** with `type`, `id`, `ts` for observability.

**Common Mistakes (20.3.1)**

- Treating JSON as **trusted**—it is attacker-controlled input.

### 20.3.2 Text Messages

#### Beginner

`send_text` / `receive_text` handle UTF-8 text frames. Good for **simple** protocols and debugging.

```python
from fastapi import WebSocket, FastAPI

app = FastAPI()


@app.websocket("/text")
async def text_ws(websocket: WebSocket) -> None:
    await websocket.accept()
    line = await websocket.receive_text()
    await websocket.send_text(line.upper())
    await websocket.close()
```

#### Intermediate

If mixing **newline-delimited** records, specify **max line length** to prevent memory exhaustion.

#### Expert

For **protocol upgrades** inside text mode, define **escape** rules and **state machines**—avoid ambiguous grammars.

**Key Points (20.3.2)**

- Text frames still carry **byte** length limits you should enforce.

**Best Practices (20.3.2)**

- Prefer **JSON** or **binary** framing for structured data at scale.

**Common Mistakes (20.3.2)**

- Sending **non-UTF-8** data as text—will fail or corrupt.

### 20.3.3 Binary Messages

#### Beginner

`send_bytes` / `receive_bytes` move raw bytes—useful for **audio**, **video**, **protobuf**, or **compressed** payloads.

```python
from fastapi import WebSocket, FastAPI

app = FastAPI()


@app.websocket("/bin")
async def bin_ws(websocket: WebSocket) -> None:
    await websocket.accept()
    data = await websocket.receive_bytes()
    await websocket.send_bytes(data[::-1])
    await websocket.close()
```

#### Intermediate

Prefix binary messages with a **short header** (version + opcode + length) so parsers stay **synchronized** after partial reads at app layer.

#### Expert

Zero-copy paths are limited in Python—profile **serialization** cost; sometimes **shared memory** or **C extensions** matter for media.

**Key Points (20.3.3)**

- Binary is efficient but **harder** to debug—keep **correlation IDs** in metadata side channel.

**Best Practices (20.3.3)**

- Document **endianness** and **alignment** for numeric packed formats.

**Common Mistakes (20.3.3)**

- Mixing text and binary **without** a framing layer—clients lose sync.

### 20.3.4 Message Routing

#### Beginner

Route by `type` field in JSON or by **separate** WebSocket URLs per feature (`/ws/chat`, `/ws/game`).

```python
from fastapi import WebSocket, FastAPI

app = FastAPI()


@app.websocket("/router")
async def router_ws(websocket: WebSocket) -> None:
    await websocket.accept()
    msg = await websocket.receive_json()
    handlers = {"foo": handle_foo, "bar": handle_bar}
    fn = handlers.get(msg.get("type"))
    if fn is None:
        await websocket.send_json({"type": "error", "reason": "unknown_type"})
    else:
        await fn(websocket, msg)
    await websocket.close()


async def handle_foo(ws: WebSocket, msg: dict) -> None:
    await ws.send_json({"type": "foo.ok"})


async def handle_bar(ws: WebSocket, msg: dict) -> None:
    await ws.send_json({"type": "bar.ok"})
```

#### Intermediate

Centralize **dispatch** in a class with **registered** commands; attach **middleware** for logging and metrics.

#### Expert

For **multi-tenant** systems, include **tenant id** in envelope and authorize **per command** against policy engines.

**Key Points (20.3.4)**

- Explicit **dispatch tables** beat giant `if/elif` chains for maintainability.

**Best Practices (20.3.4)**

- Log **message type counts**, not full payloads, in production.

**Common Mistakes (20.3.4)**

- **Implicit** routing via message order—brittle under retries.

### 20.3.5 Message Validation

#### Beginner

Validate required keys and basic types before acting—reject fast.

```python
from fastapi import WebSocket, FastAPI

app = FastAPI()


@app.websocket("/valid")
async def valid(websocket: WebSocket) -> None:
    await websocket.accept()
    msg = await websocket.receive_json()
    if not isinstance(msg.get("count"), int) or msg["count"] < 0:
        await websocket.send_json({"type": "error", "reason": "bad_count"})
        await websocket.close(code=1003)
        return
    await websocket.send_json({"type": "ok", "count": msg["count"]})
    await websocket.close()
```

#### Intermediate

Use **Pydantic v2** `TypeAdapter` or models with **`model_validate`** for nested structures.

#### Expert

Add **rate limits** per message type and **idempotency keys** for commands that trigger side effects.

**Key Points (20.3.5)**

- Treat WebSocket input like **HTTP body**—same security mindset.

**Best Practices (20.3.5)**

- Return **structured** validation errors; avoid leaking stack traces.

**Common Mistakes (20.3.5)**

- Skipping validation because “it’s an internal client”—clients get compromised too.

---

## 20.4 WebSocket Management

Production chat and dashboards require **tracking** who is connected and **targeted** delivery patterns.

### 20.4.1 Multiple Connections

#### Beginner

One user may open **several tabs**—each tab is a distinct `WebSocket`. Track **connection ids**, not only user ids.

```python
import itertools
from fastapi import WebSocket, FastAPI

app = FastAPI()
_counter = itertools.count(1)


@app.websocket("/multi")
async def multi(websocket: WebSocket) -> None:
    conn_id = next(_counter)
    await websocket.accept()
    await websocket.send_json({"conn_id": conn_id})
    await websocket.close()
```

#### Intermediate

Store connections in **per-process** structures; remember **multi-worker** deployments need **shared** pub/sub for cross-worker fan-out.

#### Expert

Shard connection registries by **user hash** to reduce lock contention; use **asyncio.Lock** around shared mutating structures.

**Key Points (20.4.1)**

- Connection cardinality drives **memory** and **CPU**—plan limits.

**Best Practices (20.4.1)**

- Cap **connections per user** at business layer if needed.

**Common Mistakes (20.4.1)**

- Assuming **one** socket per user always.

### 20.4.2 Connection Tracking

#### Beginner

Keep `dict[str, WebSocket]` or `set` of connections; remove on disconnect.

```python
from fastapi import WebSocket, WebSocketDisconnect, FastAPI

app = FastAPI()
SOCKETS: dict[int, WebSocket] = {}
_next_id = 1


@app.websocket("/track")
async def track(websocket: WebSocket) -> None:
    global _next_id
    await websocket.accept()
    my_id = _next_id
    _next_id += 1
    SOCKETS[my_id] = websocket
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        SOCKETS.pop(my_id, None)
```

#### Intermediate

For **typed** apps, wrap `WebSocket` with metadata dataclass (`user_id`, `rooms`, `created_at`).

#### Expert

Emit **metrics**: active connections, connect/disconnect rate, bytes in/out histograms.

**Key Points (20.4.2)**

- Mutations to global registries must be **thread/async safe**—use locks.

**Best Practices (20.4.2)**

- Prefer **weakrefs** only if you fully understand lifetimes—usually explicit removal is clearer.

**Common Mistakes (20.4.2)**

- **Memory leaks** from never removing dead sockets.

### 20.4.3 Broadcasting

#### Beginner

Iterate tracked sockets and `send_json` to each; skip failures.

```python
import asyncio
from fastapi import WebSocket, WebSocketDisconnect, FastAPI

app = FastAPI()
ROOM: list[WebSocket] = []


@app.websocket("/broadcast")
async def broadcast(websocket: WebSocket) -> None:
    await websocket.accept()
    ROOM.append(websocket)
    try:
        while True:
            msg = await websocket.receive_json()
            dead: list[WebSocket] = []
            for peer in ROOM:
                try:
                    await peer.send_json(msg)
                except Exception:
                    dead.append(peer)
            for peer in dead:
                if peer in ROOM:
                    ROOM.remove(peer)
    except WebSocketDisconnect:
        pass
    finally:
        if websocket in ROOM:
            ROOM.remove(websocket)
```

#### Intermediate

Use **`asyncio.gather`** with `return_exceptions=True` for parallel sends with **timeouts**.

#### Expert

Push broadcasts through **Redis pub/sub** so **all workers** receive events.

**Key Points (20.4.3)**

- Broadcasting is **O(n)** per message—optimize fan-out architecture early.

**Best Practices (20.4.3)**

- Coalesce **high-frequency** updates (e.g., cursor moves) before broadcast.

**Common Mistakes (20.4.3)**

- Awaiting sends **sequentially** to thousands of peers without chunking—hurts tail latency.

### 20.4.4 Unicasting

#### Beginner

Send to **one** connection id—lookup in your registry.

```python
from fastapi import WebSocket, FastAPI

app = FastAPI()
PEERS: dict[str, WebSocket] = {}


@app.websocket("/peer/{user_id}")
async def peer(user_id: str, websocket: WebSocket) -> None:
    await websocket.accept()
    PEERS[user_id] = websocket
    try:
        while True:
            await websocket.receive_text()
    finally:
        PEERS.pop(user_id, None)


@app.post("/dm/{user_id}")
async def dm(user_id: str, payload: dict) -> dict:
    ws = PEERS.get(user_id)
    if ws is None:
        return {"delivered": False}
    await ws.send_json({"type": "dm", "payload": payload})
    return {"delivered": True}
```

#### Intermediate

Combine with **persistent** notifications (email/push) when user offline.

#### Expert

Use **message queues** with **at-least-once** delivery for DM reliability across restarts.

**Key Points (20.4.4)**

- Unicast requires **authoritative** mapping from logical user → live socket(s).

**Best Practices (20.4.4)**

- Support **multiple devices** explicitly in your model.

**Common Mistakes (20.4.4)**

- Delivering to **stale** socket after reconnect on a different worker without sticky routing.

### 20.4.5 Room/Channel Pattern

#### Beginner

Maintain `dict[room_name, set[WebSocket]]`; join/leave messages update membership.

```python
from fastapi import WebSocket, WebSocketDisconnect, FastAPI

app = FastAPI()
ROOMS: dict[str, set[WebSocket]] = {}


@app.websocket("/rooms/{name}")
async def room_ws(name: str, websocket: WebSocket) -> None:
    await websocket.accept()
    ROOMS.setdefault(name, set()).add(websocket)
    try:
        while True:
            text = await websocket.receive_text()
            for peer in list(ROOMS.get(name, ())):
                if peer is not websocket:
                    await peer.send_text(text)
    except WebSocketDisconnect:
        pass
    finally:
        ROOMS.get(name, set()).discard(websocket)
```

#### Intermediate

Add **authorization** per room; server-side **whitelist** which rooms a user may join.

#### Expert

Implement **presence** (who’s online), **typing indicators**, and **epoch** counters for **ordering** guarantees.

**Key Points (20.4.5)**

- Rooms are **application concepts**—the protocol is still yours.

**Best Practices (20.4.5)**

- Broadcast **membership changes** as structured events.

**Common Mistakes (20.4.5)**

- Client-chosen room names without **server validation**—IDOR risk.

---

## 20.5 Advanced WebSocket Features

Harden connections for **real networks**: flaky Wi‑Fi, sleeping laptops, and rolling deploys.

### 20.5.1 Reconnection Handling

#### Beginner

Clients should **exponential backoff** reconnect and **resend** identity tokens.

```python
# Client-side sketch (browser Python not typical — pattern for asyncio clients)
import asyncio
import websockets


async def resilient_client(url: str) -> None:
    delay = 1.0
    while True:
        try:
            async with websockets.connect(url) as ws:
                delay = 1.0
                await ws.send("hello")
                print(await ws.recv())
        except Exception:
            await asyncio.sleep(delay)
            delay = min(delay * 2, 30.0)
```

#### Intermediate

Server assigns **session tokens**; client sends **last_seen_seq** to replay missed events from a **buffer** or **DB**.

#### Expert

Use **CRDTs** or **OT** for collaborative state so reconnect merges cleanly.

**Key Points (20.5.1)**

- Reconnects will happen—design **idempotent** joins.

**Best Practices (20.5.1)**

- Log **reconnect storms** after outages separately from steady state.

**Common Mistakes (20.5.1)**

- Infinite **tight** reconnect loops hammering the server.

### 20.5.2 Heartbeat/Ping-Pong

#### Beginner

Application-level **ping** JSON messages on a timer; expect **pong** responses.

```python
import asyncio
from fastapi import WebSocket, WebSocketDisconnect, FastAPI

app = FastAPI()


@app.websocket("/hb")
async def heartbeat(websocket: WebSocket) -> None:
    await websocket.accept()

    async def watcher() -> None:
        while True:
            await asyncio.sleep(20.0)
            await websocket.send_json({"type": "ping", "t": asyncio.get_event_loop().time()})

    task = asyncio.create_task(watcher())
    try:
        while True:
            msg = await websocket.receive_json()
            if msg.get("type") == "pong":
                continue
    except WebSocketDisconnect:
        pass
    finally:
        task.cancel()
```

#### Intermediate

ASGI servers expose **protocol-level** ping/pong frames—consult **Uvicorn**/**Hypercorn** docs; not always exposed via Starlette `WebSocket` high-level API uniformly.

#### Expert

Tune **idle timeouts** at **LB**, **server**, and **app** layers—misaligned values cause ghost connections.

**Key Points (20.5.2)**

- Heartbeats detect **half-open** TCP faster than OS defaults.

**Best Practices (20.5.2)**

- Prefer **server-initiated** pings with **client** pongs for mobile backgrounding scenarios.

**Common Mistakes (20.5.2)**

- Heartbeats so **frequent** they dominate bandwidth on cellular.

### 20.5.3 Error Handling

#### Beginner

Catch `WebSocketDisconnect`, log, and clean up. Map unexpected parsing errors to **error** messages.

```python
from fastapi import WebSocket, WebSocketDisconnect, FastAPI

app = FastAPI()


@app.websocket("/errs")
async def errs(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        await websocket.receive_json()
    except WebSocketDisconnect:
        return
    except Exception as exc:
        await websocket.send_json({"type": "error", "reason": str(exc)})
        await websocket.close(code=1011)
```

#### Intermediate

Never send raw **exception** strings to untrusted clients in production—use **codes**.

#### Expert

Attach **correlation ids** to logs across HTTP upgrade, WS session, and background tasks.

**Key Points (20.5.3)**

- Distinguish **protocol** errors from **business** errors in your envelope.

**Best Practices (20.5.3)**

- Use **structured logging** (`json`) with `connection_id`.

**Common Mistakes (20.5.3)**

- Swallowing exceptions silently—losing **signal** on incidents.

### 20.5.4 Graceful Shutdown

#### Beginner

On SIGTERM, stop accepting, **close** sockets with `1001`, join tasks.

```python
import asyncio
import signal
from contextlib import suppress
from fastapi import FastAPI

app = FastAPI()
shutdown_event = asyncio.Event()


@app.on_event("startup")
async def startup() -> None:
    loop = asyncio.get_running_loop()

    def _stop() -> None:
        shutdown_event.set()

    with suppress(NotImplementedError):
        loop.add_signal_handler(signal.SIGTERM, _stop)
```

#### Intermediate

Integrate **Kubernetes** `terminationGracePeriodSeconds` with server **drain** mode.

#### Expert

Persist **in-flight** game or edit sessions to **recovery** stores before process exit.

**Key Points (20.5.4)**

- Graceful shutdown is **coordination** across load balancer, app, and clients.

**Best Practices (20.5.4)**

- Document **expected** client behavior on `1001` close.

**Common Mistakes (20.5.4)**

- Killing workers mid-broadcast without draining—**duplicate** or **lost** messages.

### 20.5.5 Authentication

#### Beginner

Pass **JWT** in query string during handshake or use **cookies** set by prior HTTPS login.

```python
from fastapi import WebSocket, FastAPI

app = FastAPI()


def parse_token(q: str | None) -> str | None:
    return q


@app.websocket("/auth")
async def auth_ws(websocket: WebSocket, token: str | None = None) -> None:
    token = parse_token(websocket.query_params.get("token"))
    if not token:
        await websocket.close(code=4401)
        return
    await websocket.accept()
    await websocket.send_json({"type": "authed", "token_len": len(token)})
    await websocket.close()
```

#### Intermediate

Prefer **short-lived** access tokens and **refresh** over HTTPS separately; avoid **long-lived** secrets in query strings where **referrer** leakage is possible.

#### Expert

Implement **post-handshake** re-auth on token **rotation**; tie **session** to **IP**/`User-Agent` only if you understand **mobile** carrier NAT behavior.

```python
from jose import JWTError, jwt
from fastapi import WebSocket, FastAPI

app = FastAPI()
SECRET = "change-me"
ALGO = "HS256"


@app.websocket("/jwt")
async def jwt_ws(websocket: WebSocket) -> None:
    raw = websocket.query_params.get("access_token")
    if not raw:
        await websocket.close(code=4401)
        return
    try:
        claims = jwt.decode(raw, SECRET, algorithms=[ALGO])
    except JWTError:
        await websocket.close(code=4401)
        return
    await websocket.accept()
    await websocket.send_json({"type": "hello", "sub": claims.get("sub")})
    await websocket.close()
```

**Key Points (20.5.5)**

- WebSocket **auth** is as critical as HTTP **auth**.

**Best Practices (20.5.5)**

- Centralize verification in a **dependency** or helper used by all WS routes.

**Common Mistakes (20.5.5)**

- Trusting **client-provided** `user_id` fields without cryptographic proof.

---

## 20.6 WebSocket Use Cases

Patterns you will recognize in production systems and portfolios.

### 20.6.1 Real-time Chat

#### Beginner

Echo to room; include **sender** and **timestamp** server-side—never trust client time for ordering.

```python
from datetime import UTC, datetime
from fastapi import WebSocket, FastAPI

app = FastAPI()


@app.websocket("/chat/{room}")
async def chat(room: str, websocket: WebSocket) -> None:
    await websocket.accept()
    msg = await websocket.receive_json()
    await websocket.send_json(
        {
            "room": room,
            "text": msg.get("text"),
            "ts": datetime.now(tz=UTC).isoformat(),
        }
    )
    await websocket.close()
```

#### Intermediate

Persist messages to **Postgres**; publish **new message** events to **Redis** for cross-worker fan-out.

#### Expert

Add **moderation** pipelines, **rate limits**, **attachments** via object storage with **signed URLs**.

**Key Points (20.6.1)**

- Chat is the **hello world** of WebSockets—still needs **abuse** controls.

**Best Practices (20.6.1)**

- Pagination for **history** via HTTP; live tail via WS.

**Common Mistakes (20.6.1)**

- No **spam** protection—small room sizes explode cost.

### 20.6.2 Live Notifications

#### Beginner

Push lightweight **toast** events `{type:"notify", body:"..."}`.

#### Intermediate

Combine with **device push** (APNs/FCM) when websocket offline.

#### Expert

**Prioritize** notifications; coalesce **batchable** alerts to protect user attention and system load.

**Key Points (20.6.2)**

- Notifications need **deduplication** keys.

**Best Practices (20.6.2)**

- Include **deep links** and **expiry** timestamps.

**Common Mistakes (20.6.2)**

- Using WS for **email-grade** reliability without durable queue backing.

### 20.6.3 Collaborative Editing

#### Beginner

Broadcast **operations** (`insert`, `delete`) with **positions**; expect conflicts.

#### Intermediate

Adopt **OT** or **CRDT** libraries; centralize transformation on server or accept CRDT merges client-side.

#### Expert

Version **document snapshots** + **operation logs** for recovery; control **history compaction**.

**Key Points (20.6.3)**

- Collaborative editing is **distributed systems**—WebSocket is just transport.

**Best Practices (20.6.3)**

- Snapshot **periodically** to bound replay cost.

**Common Mistakes (20.6.3)**

- Naïve last-write-wins on rich text—corrupts documents.

### 20.6.4 Live Streaming

#### Beginner

Stream **metadata** or **chunk references** over WS; deliver heavy bytes via **CDN** or **binary** channel.

#### Intermediate

For **video**, WebSocket is rarely the whole answer—use **HLS/DASH**; WS for **control plane**.

#### Expert

Measure **jitter** and **bufferbloat**; align **keyframe** strategy with segment boundaries.

**Key Points (20.6.4)**

- Separate **control** from **bulk data** paths.

**Best Practices (20.6.4)**

- Use **backpressure-aware** producers.

**Common Mistakes (20.6.4)**

- Pushing **raw video** through Python WS without understanding bitrate costs.

### 20.6.5 Gaming Applications

#### Beginner

Send **input state** at fixed tick; server **authoritative** for scores and positions.

#### Intermediate

Compensate **latency** with **client prediction** and **server reconciliation**.

#### Expert

Consider **UDP**-friendly engines for twitch shooters; WS for **lobby** and **matchmaking** if appropriate.

**Key Points (20.6.5)**

- Low latency requires **tick** design, not only WebSocket.

**Best Practices (20.6.5)**

- Cap **update rate** per client; validate **physics** server-side.

**Common Mistakes (20.6.5)**

- Trusting client **hit** claims without verification.

---

## 20.7 Testing WebSockets

Automated tests prevent regressions in **handshake**, **protocol**, and **backpressure** behavior.

### 20.7.1 WebSocket Test Client

#### Beginner

Use Starlette/FastAPI **`TestClient`** context manager `websocket_connect`.

```python
from fastapi import FastAPI, WebSocket
from fastapi.testclient import TestClient

app = FastAPI()


@app.websocket("/ws")
async def ws(websocket: WebSocket) -> None:
    await websocket.accept()
    data = await websocket.receive_text()
    await websocket.send_text(f"echo:{data}")


def test_ws() -> None:
    client = TestClient(app)
    with client.websocket_connect("/ws") as socket:
        socket.send_text("hi")
        assert socket.receive_text() == "echo:hi"
```

#### Intermediate

Parametrize **paths** and **query strings**; assert **close codes** when applicable.

#### Expert

For **async** tests across real loop behaviors, consider **`httpx.AsyncClient` transport=ASGI** or **`pytest-asyncio`** patterns—pick one style per suite.

**Key Points (20.7.1)**

- `TestClient` wraps **requests**/**websockets** synchronously—great for pytest.

**Best Practices (20.7.1)**

- Factor app factory **`create_app()`** for tests vs prod wiring.

**Common Mistakes (20.7.1)**

- Mixing **async** route tests with wrong pytest markers—leading to subtle failures.

### 20.7.2 Connection Testing

#### Beginner

Assert connection opens, **`accept`** path runs, initial **welcome** message shape.

```python
from fastapi import FastAPI, WebSocket, status
from fastapi.testclient import TestClient

app = FastAPI()


@app.websocket("/gate")
async def gate(websocket: WebSocket) -> None:
    if websocket.headers.get("x-magic") != "1":
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    await websocket.accept()


def test_gate_denies() -> None:
    import pytest
    from starlette.websockets import WebSocketDisconnect

    client = TestClient(app)
    with pytest.raises(WebSocketDisconnect):
        with client.websocket_connect("/gate"):
            pass
```

#### Intermediate

Test **subprotocol** negotiation if used.

#### Expert

Simulate **slow** handshakes with timeouts to ensure **resource** limits work.

**Key Points (20.7.2)**

- Connection tests should cover **reject** and **accept** branches.

**Best Practices (20.7.2)**

- Include **security** headers expectations where middleware sets them.

**Common Mistakes (20.7.2)**

- Only testing **happy path** accepts.

### 20.7.3 Message Testing

#### Beginner

Send JSON/text, assert **echo** and **side effects** (DB writes via dependency overrides).

#### Intermediate

Property-based tests (`hypothesis`) for **parser** robustness—bounded sizes.

#### Expert

Fuzz **binary** framing parsers for **crash** safety in native extensions.

**Key Points (20.7.3)**

- Golden tests for **message envelopes** catch accidental breaking changes.

**Best Practices (20.7.3)**

- Snapshot **canonical JSON** strings carefully—ordering matters.

**Common Mistakes (20.7.3)**

- Asserting floats **exactly**—use **approx** comparisons.

### 20.7.4 Error Scenario Testing

#### Beginner

Force `receive` after close; ensure server handles **`WebSocketDisconnect`**.

#### Intermediate

Inject **failing** `send` by replacing socket with mock that raises.

#### Expert

Chaos-test **Redis pub/sub** fan-out: subscriber dies mid-broadcast.

**Key Points (20.7.4)**

- Error paths are **user-visible**—test them.

**Best Practices (20.7.4)**

- Use **dependency overrides** to simulate downstream failures.

**Common Mistakes (20.7.4)**

- Mocking so heavily the test no longer resembles **ASGI** behavior.

### 20.7.5 Load Testing

#### Beginner

Use **`locust`** or **`k6`** WebSocket plugins to open **N** connections, send periodic messages.

#### Intermediate

Measure **CPU**, **memory**, and **p99** broadcast latency under **stepped** load.

#### Expert

Reproduce **multi-worker** topology behind **HAProxy**/NLB with **sticky** sessions vs **shared** bus—compare failure modes.

```python
# k6 (JavaScript) sketch — run outside Python ecosystem
# import ws from 'k6/ws'; export default function () { ws.connect('ws://host/ws', {}, function (socket) { ... }); }
```

**Key Points (20.7.5)**

- Load test **production-like** frame sizes and **fan-out**.

**Best Practices (20.7.5)**

- Start with **soak tests** (hours) to catch **slow leaks**.

**Common Mistakes (20.7.5)**

- Benchmarking **single worker** on laptop and extrapolating linearly.

---

## Chapter Key Points, Best Practices, and Common Mistakes

### Key Points

- WebSocket provides **full-duplex** channels after an HTTP **Upgrade** handshake.
- FastAPI’s **`WebSocket`** API mirrors **Starlette**—learn **accept/receive/send/close** deeply.
- Treat messages as **untrusted input**; validate **auth**, **schema**, and **rate**.
- **Broadcast** and **room** patterns need **cross-worker** strategies in production.
- **Testing** with `TestClient.websocket_connect` is the fastest feedback loop for protocol regressions.

### Best Practices

- Prefer **WSS**, **short-lived** credentials, and **documented** message **versioning**.
- Centralize **dispatch**, **logging**, and **metrics** per connection.
- Align **heartbeat** and **idle timeout** settings across **LB**, **server**, and **app**.
- Use **HTTP** for cacheable resources; **WS** for live **session** semantics.
- Plan **graceful shutdown** and **reconnect** semantics explicitly.

### Common Mistakes

- Accepting connections without **auth** or **origin** checks.
- **Unbounded** in-memory registries of sockets and **O(n)** broadcast hot loops.
- Mixing **text/binary** without a **framing** contract.
- Assuming **one** socket per user or **single-worker** deployment.
- **Swallowing** exceptions and losing **observability** on failures.
