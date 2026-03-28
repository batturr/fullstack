# GraphQL Subscriptions

## 📑 Table of Contents

- [7.1 Subscription Basics](#71-subscription-basics)
  - [7.1.1 Real-Time Communication](#711-real-time-communication)
  - [7.1.2 Subscription Syntax](#712-subscription-syntax)
  - [7.1.3 WebSocket Transport](#713-websocket-transport)
  - [7.1.4 Subscription Lifecycle](#714-subscription-lifecycle)
  - [7.1.5 Event Streaming](#715-event-streaming)
- [7.2 Setting Up Subscriptions](#72-setting-up-subscriptions)
  - [7.2.1 WebSocket Configuration](#721-websocket-configuration)
  - [7.2.2 Pub/Sub System](#722-pubsub-system)
  - [7.2.3 Event Publishing](#723-event-publishing)
  - [7.2.4 Subscription Resolvers](#724-subscription-resolvers)
  - [7.2.5 Connection Management](#725-connection-management)
- [7.3 Pub/Sub Patterns](#73-pubsub-patterns)
  - [7.3.1 Topic-Based Pub/Sub](#731-topic-based-pubsub)
  - [7.3.2 Event Broadcasting](#732-event-broadcasting)
  - [7.3.3 Filtered Subscriptions](#733-filtered-subscriptions)
  - [7.3.4 Multi-Channel Subscriptions](#734-multi-channel-subscriptions)
  - [7.3.5 Error Broadcasting](#735-error-broadcasting)
- [7.4 Common Use Cases](#74-common-use-cases)
  - [7.4.1 Real-Time Updates](#741-real-time-updates)
  - [7.4.2 Chat Applications](#742-chat-applications)
  - [7.4.3 Live Notifications](#743-live-notifications)
  - [7.4.4 Live Data Updates](#744-live-data-updates)
  - [7.4.5 Collaborative Editing](#745-collaborative-editing)
- [7.5 Subscription Management](#75-subscription-management)
  - [7.5.1 Connection Pooling](#751-connection-pooling)
  - [7.5.2 Memory Management](#752-memory-management)
  - [7.5.3 Subscription Cleanup](#753-subscription-cleanup)
  - [7.5.4 Error Handling](#754-error-handling)
  - [7.5.5 Reconnection Logic](#755-reconnection-logic)
- [7.6 Performance Optimization](#76-performance-optimization)
  - [7.6.1 Backpressure Handling](#761-backpressure-handling)
  - [7.6.2 Buffer Management](#762-buffer-management)
  - [7.6.3 Rate Limiting](#763-rate-limiting)
  - [7.6.4 Connection Limits](#764-connection-limits)
  - [7.6.5 Resource Management](#765-resource-management)
- [7.7 Advanced Subscription Patterns](#77-advanced-subscription-patterns)
  - [7.7.1 Multiplexed Subscriptions](#771-multiplexed-subscriptions)
  - [7.7.2 Conditional Subscriptions](#772-conditional-subscriptions)
  - [7.7.3 Aggregate Subscriptions](#773-aggregate-subscriptions)
  - [7.7.4 Time-Window Subscriptions](#774-time-window-subscriptions)
  - [7.7.5 State Change Subscriptions](#775-state-change-subscriptions)

---

## 7.1 Subscription Basics

### 7.1.1 Real-Time Communication

#### Beginner

**Real-time** means the server pushes updates to clients as events happen, instead of the client polling HTTP. GraphQL **subscriptions** model this as a long-lived operation that yields a stream of results.

#### Intermediate

Typical transports: **WebSocket**, **SSE** (server-sent events, less common for full GraphQL subscription spec), or **HTTP multipart** (emerging patterns). Clients subscribe to `subscription { commentAdded(postId: $id) { ... } }` and receive multiple payloads over time.

#### Expert

At scale, **event buses** (Redis, NATS, Kafka) bridge stateless API nodes and WebSocket gateways. **Authorization** must filter events per connection—never broadcast private data to all sockets.

```graphql
subscription OnPriceUpdated($sku: ID!) {
  priceUpdated(sku: $sku) {
    sku
    amount
    currency
  }
}
```

```javascript
// Conceptual: subscription root returns AsyncIterator of payloads
const resolvers = {
  Subscription: {
    priceUpdated: {
      subscribe: (_, { sku }, ctx) => ctx.pubsub.asyncIterator(`PRICE:${sku}`),
    },
  },
};
```

#### Key Points

- Subscriptions complement queries/mutations for push semantics.
- Transport is not defined by the core GraphQL spec; WebSocket is de facto.
- Security and filtering are your responsibility.

#### Best Practices

- Prefer subscriptions for high-churn, small payloads (typing indicators, prices).
- Use polling or mutations for infrequent updates if ops complexity is high.
- Authenticate at connection time and on each subscribe message.

#### Common Mistakes

- Treating subscriptions like queries over HTTP POST once.
- Broadcasting sensitive events on public channels.
- No heartbeat—proxies drop “idle” connections.

---

### 7.1.2 Subscription Syntax

#### Beginner

Use the `subscription` keyword, optional name, variables, and a selection set on `Subscription` type fields.

#### Intermediate

Same **fragments**, **directives** (`@include` less common mid-stream), and **inline fragments** as queries. **Multiple root fields** in one subscription may be supported depending on server; many implementations allow one or merge iterators.

#### Expert

**Defer/stream** (incremental delivery over HTTP) differs from subscriptions—do not conflate. **Subscription** SDL defines async sources; validation ensures return types are valid for streaming (often via `AsyncIterable`).

```graphql
subscription MessageStream($roomId: ID!) {
  messageAdded(roomId: $roomId) {
    id
    body
    sender {
      handle
    }
    sentAt
  }
}
```

```javascript
import { parse } from "graphql";

const doc = parse(`
  subscription MessageStream($roomId: ID!) {
    messageAdded(roomId: $roomId) {
      id
      body
      sender { handle }
      sentAt
    }
  }
`);
```

#### Key Points

- Syntax mirrors queries with a different operation type.
- Variables parameterize which stream you join.
- Parser/validator treat subscriptions like operations with special execution.

#### Best Practices

- Name subscriptions for observability (`MessageStream` not `Sub1`).
- Keep selection sets small for high-frequency events.
- Lint subscription documents alongside queries.

#### Common Mistakes

- Using `query` keyword by habit.
- Subscribing to huge nested graphs per message.
- Invalid operation mixing `subscription` and `mutation` in one op (not allowed).

---

### 7.1.3 WebSocket Transport

#### Beginner

**WebSocket** is a bidirectional TCP channel over HTTP upgrade. GraphQL clients send `connection_init`, `subscribe`, `complete` **JSON messages** (graphql-ws or deprecated subscriptions-transport-ws protocols differ slightly).

#### Intermediate

**graphql-ws** (library by The Guild) is the modern standard: `graphql-ws` package with `useServer` from `graphql-ws/use/ws`. **Apollo** docs recommend `graphql-ws`. Payload includes `type`, `id`, `payload` with `query`, `variables`, `operationName`.

#### Expert

**Sticky sessions** if state lives on node; **Redis adapter** for multi-node fan-out. **TLS termination** at load balancer; WebSocket upgrade headers (`Upgrade`, `Connection`) must pass through. **Subprotocol** header: `graphql-transport-ws`.

```javascript
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import { makeExecutableSchema } from "@graphql-tools/schema";

const schema = makeExecutableSchema({ typeDefs, resolvers });
const server = createServer((_req, res) => res.end());
const wsServer = new WebSocketServer({ server, path: "/graphql" });

useServer({ schema }, wsServer);

server.listen(4000);
```

#### Key Points

- Protocol handshake matters—client and server must agree.
- Proxies must not buffer WebSocket indefinitely incorrectly.
- Ping/pong keeps connections alive through NATs.

#### Best Practices

- Use `graphql-ws` for new projects.
- Configure idle timeouts above client ping interval.
- Log connection id for tracing.

#### Common Mistakes

- Mixing old `subscriptions-transport-ws` with new clients.
- Load balancer idle timeout shorter than ping interval.
- Missing auth in `connection_init` payload.

---

### 7.1.4 Subscription Lifecycle

#### Beginner

**Lifecycle**: connect → subscribe → receive N payloads → complete/unsubscribe → disconnect. Errors may terminate the subscription or send error messages per protocol.

#### Intermediate

Server **subscribe** function returns `AsyncIterator`. Calling `return()` on iterator cleans up listeners. Client **unmount** should send `complete` for that subscription id.

#### Expert

**Graceful shutdown**: server closes WebSockets with code, drains iterators. **Backpressure** when client slow—see 7.6. **Per-operation** cancellation without killing whole socket (multiplexed).

```javascript
// Simplified async iterator cleanup
function topicIterator(topic, pubsub) {
  const iter = pubsub.asyncIterator(topic);
  const origReturn = iter.return?.bind(iter);
  iter.return = async () => {
    await pubsub.unsubscribe(topic, iter);
    return origReturn ? origReturn() : { value: undefined, done: true };
  };
  return iter;
}
```

#### Key Points

- Cleanup prevents memory leaks and zombie listeners.
- Each subscription id maps to one operation instance.
- Server-initiated completion signals end of stream.

#### Best Practices

- Always implement `return` on custom iterators.
- Timeout idle subscriptions in business terms if needed.
- Test tab close / network drop behavior.

#### Common Mistakes

- Subscribing in render loop (React) causing duplicate subs.
- No cleanup on server when client vanishes.
- Assuming disconnect equals immediate iterator stop without hooks.

---

### 7.1.5 Event Streaming

#### Beginner

**Stream** of events: each GraphQL execution yields `next` with `data`, until `complete`. Unlike a single query response, there are many `data` frames.

#### Intermediate

Map domain events (`OrderShipped`) to subscription payloads. **Ordering** may be best-effort unless using Kafka partition keys per entity.

#### Expert

**Ordered delivery** per aggregate: key by `orderId` so updates serialize. **Global ordering** is expensive; usually not needed for UI. **At-least-once** delivery may duplicate—clients dedupe by event id.

```graphql
subscription OrderUpdates($orderId: ID!) {
  orderStatusChanged(orderId: $orderId) {
    orderId
    status
    updatedAt
  }
}
```

```javascript
// Publisher side after mutation or worker
await pubsub.publish(`ORDER:${orderId}`, {
  orderStatusChanged: {
    orderId,
    status: "SHIPPED",
    updatedAt: new Date().toISOString(),
  },
});
```

#### Key Points

- Model payloads as complete GraphQL selection results.
- Include stable event ids for deduplication if needed.
- Schema should reflect event shape, not raw queue messages.

#### Best Practices

- Version event payloads with `schemaVersion` field if evolving fast.
- Keep payloads backward compatible when possible.
- Monitor events/sec per topic.

#### Common Mistakes

- Sending partial objects that break normalized cache.
- No ordering guarantees when UI assumes order.
- Flooding clients with high-frequency unchanged ticks.

---

## 7.2 Setting Up Subscriptions

### 7.2.1 WebSocket Configuration

#### Beginner

Create **WebSocketServer** attached to HTTP server or standalone. Set **path** (`/graphql`) matching client URL.

#### Intermediate

**CORS** does not apply to WebSockets the same way; validate `Origin` header if needed. **Compression** (`permessage-deflate`) trades CPU for bandwidth.

#### Expert

**Node cluster**: use Redis pubsub or adapter so all workers receive publish. **Kubernetes**: ingress must support WebSocket (timeouts, annotations). **mTLS** for internal gateway-to-gateway streams.

```javascript
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({
  port: 4001,
  path: "/subscriptions",
  perMessageDeflate: true,
  maxPayload: 256 * 1024,
});

wss.on("connection", (socket, req) => {
  const origin = req.headers.origin;
  if (!allowedOrigins.has(origin)) socket.close(4403, "Forbidden origin");
});
```

#### Key Points

- Path and port must match client configuration.
- Max payload prevents huge message DoS.
- Origin checks reduce CSWSH risk in browsers.

#### Best Practices

- Terminate TLS at LB; use `wss://` in production.
- Tune `heartbeat` with infrastructure idle timeouts.
- Document required subprotocol for API consumers.

#### Common Mistakes

- Same path for HTTP POST and WS without routing rules.
- Unlimited `maxPayload`.
- Forgetting IPv6 / dual-stack binding issues.

---

### 7.2.2 Pub/Sub System

#### Beginner

**Pub/Sub** decouples **publishers** (mutations, workers) from **subscribers** (GraphQL iterators). In-memory `EventEmitter` works for single process demos.

#### Intermediate

**Redis Pub/Sub** or **ioredis** for multi-instance. **NATS**/**Kafka** for durability and replay (subscriptions usually want live only; replay is advanced).

#### Expert

**Redis cluster** slot migrations affect channels—use hashtag `{tenantId}:orders` for locality. **Backpressure**: Redis drops slow consumers—monitor. **Exactly-once** is not Redis pubsub’s guarantee.

```javascript
import Redis from "ioredis";

export function createRedisPubSub() {
  const publisher = new Redis(process.env.REDIS_URL);
  const subscriber = new Redis(process.env.REDIS_URL);
  const handlers = new Map();

  subscriber.on("pmessage", (pattern, channel, message) => {
    const set = handlers.get(channel);
    if (!set) return;
    const payload = JSON.parse(message);
    for (const fn of set) fn(payload);
  });

  return {
    async subscribe(channel, onMessage) {
      if (!handlers.has(channel)) {
        handlers.set(channel, new Set());
        await subscriber.subscribe(channel);
      }
      handlers.get(channel).add(onMessage);
      return () => {
        handlers.get(channel).delete(onMessage);
      };
    },
    publish(channel, payload) {
      return publisher.publish(channel, JSON.stringify(payload));
    },
  };
}
```

#### Key Points

- In-memory pubsub does not scale horizontally.
- Redis is the common default for GraphQL gateways.
- Message size limits apply (Redis ~512MB theoretical, practical much lower).

#### Best Practices

- Separate publisher and subscriber Redis connections.
- Namespace channels (`app:room:123`).
- Handle JSON parse errors.

#### Common Mistakes

- Single Redis connection for both sub and pub blocking each other.
- Subscribing to `*` patterns carelessly (overload).
- Assuming delivery if Redis ACK—pubsub is fire-and-forget.

---

### 7.2.3 Event Publishing

#### Beginner

After a **mutation** succeeds, **publish** an event so subscribers receive updates: `pubsub.publish('COMMENT_ADDED', payload)`.

#### Intermediate

Payload keys should match subscription field names expected by resolver mapping. **Batch** publishes in workers; **debounce** high-frequency metrics.

#### Expert

**Transactional outbox**: write outbox row in same DB tx as mutation; **relay** process publishes to Redis—ensures no lost events if process crashes after commit. **CDC** (Debezium) publishes from WAL for read models.

```javascript
async function addComment(_, { input }, ctx) {
  const comment = await ctx.db.comments.create(input);
  await ctx.pubsub.publish(`POST:${input.postId}`, {
    commentAdded: comment,
  });
  return { comment };
}
```

#### Key Points

- Publish after durable state change.
- Outbox pattern aligns DB and bus.
- Payload shape = GraphQL resolver expectation.

#### Best Practices

- Include minimal fields; let clients refetch if needed.
- Use consistent channel naming helpers.
- Monitor publish failures.

#### Common Mistakes

- Publishing before commit (ghost events).
- Wrong channel key (subscribers never match).
- Publishing raw DB rows with internal columns.

---

### 7.2.4 Subscription Resolvers

#### Beginner

**Subscribe resolver** returns async iterable; **resolve** (optional) transforms each published payload to match selection set.

#### Intermediate

**Filter** function (e.g., `withFilter` from `graphql-subscriptions`) drops events not matching args. **Context** includes `connectionParams` from client.

#### Expert

**Schema stitching** / **federation** may not expose subscriptions from subgraphs the same way—check router capabilities. **graphql-js** `subscribe()` drives execution per event.

```javascript
import { withFilter } from "graphql-subscriptions";

const resolvers = {
  Subscription: {
    commentAdded: {
      subscribe: withFilter(
        (_, { postId }, ctx) => ctx.pubsub.asyncIterator(`POST:${postId}`),
        (payload, variables) => payload.commentAdded.postId === variables.postId
      ),
    },
  },
};
```

#### Key Points

- `subscribe` wires channel to iterator.
- `resolve` maps if publish shape differs from GraphQL field return.
- Filters prevent over-delivery to wrong clients.

#### Best Practices

- Narrow channels instead of mega-topic + filter when possible.
- Type payloads with JSDoc or TS.
- Log subscribe/unsubscribe at debug level.

#### Common Mistakes

- Missing `withFilter` leaking events across tenants.
- Resolve function async overhead per event without need.
- Context missing user in filter (auth bug).

---

### 7.2.5 Connection Management

#### Beginner

Track **open sockets**: limit per user, expose admin metrics. On login, associate socket with `userId`.

#### Intermediate

**Connection params** JWT in `connection_init`; validate and attach to `context`. **Refresh tokens** may require reconnect with new token.

#### Expert

**Horizontal scale**: sticky sessions or stateless JWT + shared pubsub only. **Drain** on deploy: stop accepting, wait for completions, then kill. **Socket.io**-style fallbacks not in raw `ws`.

```javascript
import { useServer } from "graphql-ws/use/ws";

useServer(
  {
    schema,
    context: async (ctx) => {
      const token = ctx.connectionParams?.authorization;
      const user = await validateToken(token);
      return { user, pubsub };
    },
    onConnect: async () => {
      metrics.wsConnections.inc();
    },
    onDisconnect: async () => {
      metrics.wsConnections.dec();
    },
  },
  wsServer
);
```

#### Key Points

- Context is per connection or per operation depending on setup.
- Metrics drive autoscaling decisions.
- Token expiry requires client reconnect strategy.

#### Best Practices

- Reject `connection_init` with `connection_error` payload if auth fails.
- Rate limit new connections per IP.
- Align server `keepAlive` with LB timeout.

#### Common Mistakes

- Long-lived connections with never-refreshed auth.
- Storing large per-connection state in memory unbounded.
- No graceful close on deploy (client storms).

---

## 7.3 Pub/Sub Patterns

### 7.3.1 Topic-Based Pub/Sub

#### Beginner

**Topics** are string channels: `room:123`, `user:456:notifications`. Publishers send to topic; subscribers listen.

#### Intermediate

**Hierarchical** naming enables ops tooling. **Wildcards** in MQTT-style systems; Redis has `psubscribe` patterns—use carefully for cost.

#### Expert

**Sharding** topics by tenant reduces cross-talk. **Hot topics** (global ticker) may need sampling or fan-out trees.

```javascript
export const topics = {
  postComments: (postId) => `post:${postId}:comments`,
  userInbox: (userId) => `user:${userId}:inbox`,
};
```

#### Key Points

- Topic design impacts security and performance.
- Predictable naming avoids collisions.
- Too many unique topics can stress Redis.

#### Best Practices

- Centralize topic builders in one module.
- Document topic catalog for internal teams.
- Avoid user-controlled full topic strings.

#### Common Mistakes

- String concat typos between publish and subscribe.
- Subscribing to overly broad patterns.
- No tenant prefix (data leak across orgs).

---

### 7.3.2 Event Broadcasting

#### Beginner

**Broadcast** same event to all subscribers on a topic—classic pubsub.

#### Intermediate

**Fan-out** from one publish to N iterators in N Node processes via Redis. **Ephemeral** events (typing) vs **durable** (notifications) may use different infra.

#### Expert

**Gossip** protocols for cluster membership vs centralized broker. **UDP multicast** rare in GraphQL stacks. **Edge** WebSocket aggregators (Ably, Pusher) as managed broadcast layer.

```javascript
// All nodes receive Redis message; each forwards to local sockets for that topic
redisSub.on("message", (channel, message) => {
  const subs = localRegistry.get(channel);
  if (!subs) return;
  for (const send of subs) send(message);
});
```

#### Key Points

- Broadcast scales with subscriber count—watch CPU on JSON serialize.
- Cross-region broadcast adds latency.
- Coalesce identical rapid events if UI allows.

#### Best Practices

- Binary payloads (MessagePack) at extreme scale.
- Sample metrics: subscribers per topic p99.
- Kill switch for runaway publishers.

#### Common Mistakes

- O(n) synchronous work per subscriber on hot path.
- Broadcasting full entity when only id changed.
- Double broadcast from primary and replica writers.

---

### 7.3.3 Filtered Subscriptions

#### Beginner

Only deliver events matching client **arguments** or **auth**: same post id, same org.

#### Intermediate

`withFilter(asyncIter, predicate)` in graphql-subscriptions. Predicate runs per event—keep it **fast**; no DB calls if avoidable.

#### Expert

**Server-side queue per connection** with filter pushes complexity. **Bloom filters** for approximate membership (rare). **RLS**-style row checks using cached permissions bitmask.

```javascript
withFilter(
  () => pubsub.asyncIterator("ORG_EVENTS"),
  (payload, vars, ctx) =>
    payload.orgId === vars.orgId && ctx.user.orgs.includes(payload.orgId)
);
```

#### Key Points

- Filter is defense in depth after topic scoping.
- Slow filters block delivery pipeline.
- Auth in filter must match mutation auth rules.

#### Best Practices

- Encode tenant in topic to reduce filter work.
- Unit test filter predicates.
- Avoid logging full payload in filter hot path.

#### Common Mistakes

- Relying on filter alone without secure topics.
- N+1 permission checks per event.
- Stale closure over ctx in long-lived iterators.

---

### 7.3.4 Multi-Channel Subscriptions

#### Beginner

One GraphQL subscription field merges **multiple** async iterators (e.g., merge `typing` and `messages` streams)—implementation-specific.

#### Intermediate

Use **AsyncIterator merge** utilities (`mergeAsyncIterators`) from libraries. **Race** iterators with `Promise.race` patterns for first event.

#### Expert

**GraphQL** spec allows multiple root subscription fields; some servers execute as merged stream. **Ordering** between channels is interleaved—UI must handle.

```javascript
import { mergeAsyncIterators } from "@n1ru4l/push-pull-async-iterable-iterator";

Subscription: {
  roomActivity: {
    subscribe: (_, { roomId }, ctx) =>
      mergeAsyncIterators([
        ctx.pubsub.asyncIterator(`ROOM:${roomId}:msg`),
        ctx.pubsub.asyncIterator(`ROOM:${roomId}:typing`),
      ]),
  },
},
```

#### Key Points

- Merging complicates error semantics—one failure may end all.
- Client selection set must distinguish event types (`__typename` or union).
- Backpressure applies to merged stream as a whole.

#### Best Practices

- Prefer separate subscription operations if types differ greatly.
- Use unions in schema for heterogeneous merged events.
- Document interleaving behavior.

#### Common Mistakes

- Merging without discriminator field in payload.
- One iterator leak blocking merge cleanup.
- Assuming strict alternation between sources.

---

### 7.3.5 Error Broadcasting

#### Beginner

Send **errors** to subscribers: protocol `error` message with `id`, or include `errors` in payload (non-standard—prefer protocol errors).

#### Intermediate

**graphql-ws** sends `{ type: "error", id, payload: [{ message }] }`. **Domain errors** might still use `data` with `UserError` if you want partial subscription results (unusual).

#### Expert

**Circuit open** events to clients: dedicated `systemAlert` subscription. **Sanitize** error messages on public APIs.

```javascript
// Server pushing a subscription error for operation `id`
send({
  type: "error",
  id: operationId,
  payload: [{ message: "Subscription limit exceeded" }],
});
```

#### Key Points

- Distinguish transport errors from business events.
- Subscription errors often terminate that operation.
- Clients should surface user-friendly copy.

#### Best Practices

- Use `extensions.code` in subscription errors where supported.
- Retry policy differs from queries (exponential backoff).
- Log server-side with correlation ids.

#### Common Mistakes

- Swallowing errors silently on client.
- Sending stack traces over WebSocket.
- Not completing subscription after fatal error.

---

## 7.4 Common Use Cases

### 7.4.1 Real-Time Updates

#### Beginner

**Live dashboards**: stock tickers, sports scores, order tracking—push when backend values change.

#### Intermediate

Combine **mutation response** for initial state + **subscription** for deltas. **Throttle** UI updates (requestAnimationFrame, debounce) if events flood.

#### Expert

**CRDT** or **event sourcing** backends feed subscriptions with version vectors. **Sampling** server-side for high-rate sensors.

```graphql
subscription DashboardMetrics($teamId: ID!) {
  teamMetricUpdated(teamId: $teamId) {
    metric
    value
    recordedAt
  }
}
```

#### Key Points

- Match update frequency to human perception.
- Initial load + stream is a common pattern.
- Consider SSE or polling fallback for restrictive networks.

#### Best Practices

- Send deltas with sequence numbers.
- Merge into client store efficiently.
- Feature-flag subscriptions per tenant.

#### Common Mistakes

- Full snapshot on every tick.
- No loading skeleton before first event.
- Subscribing before auth ready.

---

### 7.4.2 Chat Applications

#### Beginner

Subscribe to `messageAdded(roomId)`; publish on send message mutation.

#### Intermediate

**Presence** (`userJoined`), **typing indicators** (`userTyping` with short TTL), **read receipts**. **Pagination** still loads history via query.

#### Expert

**Sharding** rooms across nodes; **consistent hashing** for room → worker. **Moderation** pipeline scans before publish. **E2E encryption** changes server payload (opaque blobs).

```graphql
subscription Chat($roomId: ID!) {
  messageAdded(roomId: $roomId) {
    id
    body
    senderId
    sentAt
  }
  typing(roomId: $roomId) {
    userId
    isTyping
  }
}
```

#### Key Points

- Chat is the canonical subscription tutorial for good reason.
- Typing events need aggressive rate limits.
- Message ordering per room matters.

#### Best Practices

- Idempotent message ids for dedupe on flaky networks.
- Soft delete messages with tombstone events.
- Rate limit messages per user.

#### Common Mistakes

- Broadcasting message body to users not in room.
- No persistence—only ephemeral WS fan-out.
- Ignoring mobile background limitations.

---

### 7.4.3 Live Notifications

#### Beginner

**Toast** / bell icon updates: `notificationAdded { title body link }`.

#### Intermediate

**Unread counts** via separate counter subscription or piggyback on notification events. **Mark read** mutation updates state + optional publish.

#### Expert

**Multi-device** sync: same user, multiple sockets—Redis fan-out. **Email fallback** if user offline (out of band). **Priority** lanes for security alerts.

```graphql
subscription {
  notificationAdded {
    id
    severity
    title
    createdAt
  }
}
```

```javascript
await pubsub.publish(`USER:${userId}:notify`, {
  notificationAdded: row,
});
```

#### Key Points

- Notifications are often cross-cutting; centralize publisher service.
- Severity drives client UI treatment.
- Deduplicate repeated alerts.

#### Best Practices

- Cap stored notification history per user.
- Allow user preferences subscription filters.
- GDPR: delete notifications with user deletion.

#### Common Mistakes

- Flooding users with low-signal events.
- No snooze / mute.
- PII in notification titles logged in clients.

---

### 7.4.4 Live Data Updates

#### Beginner

**Tables** and **charts** updating as warehouse ETL completes or cache refreshes.

#### Intermediate

**GraphQL subscriptions** for `datasetVersionBumped`; client refetches heavy query on bump. Hybrid: small delta in sub, full data via query.

#### Expert

**Materialized views** refresh triggers publish. **ClickHouse** / **BigQuery** not sub-second—subscriptions signal “ready” not row-by-row.

```graphql
subscription {
  reportReady(reportId: ID!) {
    reportId
    status
    downloadUrl
  }
}
```

#### Key Points

- Heavy payloads often belong in object storage, not WS frames.
- Signal completion, then fetch via HTTP.
- Align SLA messaging with actual pipeline speed.

#### Best Practices

- Use signed URLs in completion events.
- TTL URLs short-lived.
- Idempotent “ready” events (version numbers).

#### Common Mistakes

- Streaming huge result sets over GraphQL WS.
- Client refetch storm on global “data changed” ping.
- No debounce when ETL flaps.

---

### 7.4.5 Collaborative Editing

#### Beginner

**Shared documents**: subscribe to `documentUpdated(id)` with patches or full doc snapshots (snapshots simpler, patches efficient).

#### Intermediate

**OT/CRDT** libraries handle merge; GraphQL carries **operations** or **updates** as JSON. **Awareness** (cursors) separate low-priority channel.

#### Expert

**Yjs** / **Automerge** with binary sync subprotocol may bypass GraphQL for performance—GraphQL signals presence only. **Version** vectors detect conflicts.

```graphql
subscription {
  docPatch(docId: ID!) {
    docId
    revision
    patch
  }
}
```

#### Key Points

- Real-time editing stresses ordering and conflict handling.
- GraphQL may be control plane; data plane is sometimes custom WS.
- Authorization per doc id critical.

#### Best Practices

- Include `revision` for optimistic concurrency.
- Compress patches (gzip at proxy or binary channel).
- Rate limit patch size and frequency.

#### Common Mistakes

- Full document broadcast on every keystroke at scale.
- No CRDT—last writer wins loses edits.
- Missing access revocation on doc permission change.

---

## 7.5 Subscription Management

### 7.5.1 Connection Pooling

#### Beginner

**Pool** DB connections per Node process, not per WebSocket—subscriptions share the app’s pool.

#### Intermediate

**Redis** connection pools for pubsub clients. **PgBouncer** for Postgres in transaction vs session mode affects prepared statements.

#### Expert

**Subscription resolvers** should avoid holding DB connections for duration of iterator—use message-driven queries instead. **Pool exhaustion** if sync work blocks event loop.

```javascript
import pg from "pg";

const pool = new pg.Pool({ max: 20, connectionTimeoutMillis: 2000 });

// Bad: long-lived query inside iterator
// Good: publish events from short mutation transactions using pool
```

#### Key Points

- Pools are process-wide resources.
- Long operations should not tie pool connections.
- Monitor `waitingClients` metrics.

#### Best Practices

- Size pool from load tests including WS peak.
- Use timeouts on queries.
- Separate read pool for fan-out workers if needed.

#### Common Mistakes

- One connection per subscription.
- Pool max higher than DB `max_connections`.
- Session-scoped temp tables with pooled connections.

---

### 7.5.2 Memory Management

#### Beginner

Each subscription holds **listeners**, **buffers**, and **closure state**—leaks if not released on unsubscribe.

#### Intermediate

**WeakMap** for auxiliary metadata keyed by socket if appropriate. **Heap** profiling under synthetic subscription load.

#### Expert

**Iterator ag**gregation: global Map of topic → Set of callbacks—delete empty Sets. **V8** tenure of large strings (payloads)—reuse buffers or compress.

```javascript
const topicListeners = new Map();

function addListener(topic, fn) {
  if (!topicListeners.has(topic)) topicListeners.set(topic, new Set());
  const set = topicListeners.get(topic);
  set.add(fn);
  return () => {
    set.delete(fn);
    if (set.size === 0) topicListeners.delete(topic);
  };
}
```

#### Key Points

- Unsubscribe paths must remove all references.
- Circular refs between socket and handlers are a classic leak.
- Monitor RSS vs connection count.

#### Best Practices

- Load test disconnect storms.
- Use `--inspect` heap snapshots comparing before/after.
- Cap concurrent subscriptions per connection.

#### Common Mistakes

- Global arrays appending handlers never cleared.
- Closures capturing large `ctx` objects.
- Logging entire payload strings at info level (memory + I/O).

---

### 7.5.3 Subscription Cleanup

#### Beginner

On **client** `complete` or **disconnect**, remove Redis subscriptions and local listeners.

#### Intermediate

`iterator.return()` triggers cleanup in graphql-ws. **finally** blocks in async generators ensure release.

#### Expert

**Lease** pattern: subscription valid for T seconds unless renewed (rare in GraphQL, more in IoT). **Admin kill** user sessions on security event.

```javascript
async function* subscribeChannel(topic) {
  const dispose = await bus.subscribe(topic, queue.push);
  try {
    while (true) yield await queue.take();
  } finally {
    dispose();
  }
}
```

#### Key Points

- Cleanup symmetry: every subscribe has corresponding teardown.
- Process signals (SIGTERM) should close iterators.
- Tests should assert no listener leak after N subscribe/unsubscribe cycles.

#### Best Practices

- Use `try/finally` in custom async generators.
- Audit third-party middleware for cleanup hooks.
- Timeout orphaned iterators defensively.

#### Common Mistakes

- Relying on GC without removing event listeners.
- Disconnect handler not idempotent.
- Redis unsubscribe not awaited (ordering bugs).

---

### 7.5.4 Error Handling

#### Beginner

**Network blips** disconnect WebSocket; client shows “reconnecting…” and resubscribes.

#### Intermediate

Distinguish **auth errors** (do not retry with same token) vs **transient** (retry with backoff). **GraphQL errors** in `next` payload rare—usually protocol-level.

#### Expert

**Observability**: trace id per connection in logs. **Fallback** to polling query if WS blocked by corporate proxy.

```javascript
import { createClient } from "graphql-ws";

const client = createClient({
  url: "wss://api.example.com/graphql",
  retryAttempts: Infinity,
  retryWait: async (retries) => Math.min(1000 * 2 ** retries, 30000),
  shouldRetry: (err) => !isAuthError(err),
  on: { error: (err) => console.error("WS error", err) },
});
```

#### Key Points

- Users need clear offline/reconnect UX.
- Infinite retry needs cap or jitter to avoid storms.
- Auth errors should prompt re-login.

#### Best Practices

- Jitter backoff (avoid thundering herd).
- Surface last successful sync time in UI.
- Server logs connection close codes.

#### Common Mistakes

- Tight retry loop hammering server.
- Losing subscription variables on reconnect.
- Treating all close codes as retryable.

---

### 7.5.5 Reconnection Logic

#### Beginner

**Exponential backoff** before reconnecting WebSocket. **Resubscribe** all active operations after new socket ready.

#### Intermediate

**graphql-ws** client handles resubscribe if configured. **Idempotent** server handlers for duplicate subscribe ids (client may reuse).

#### Expert

**Resume** from last `eventId` if server supports **event log** replay (advanced). **Sticky** routing helps restore colocated state (usually avoid state on node).

```javascript
let activeSubs = new Map();

client.on("connected", () => {
  for (const [id, params] of activeSubs) {
    client.subscribe(params, handlers.get(id));
  }
});
```

#### Key Points

- Client must track what to restore after reconnect.
- Server may assign new socket ids—do not rely on them for app logic.
- `connection_init` auth must run every reconnect.

#### Best Practices

- Persist minimal subscription manifest in client state store.
- Debounce rapid connect/disconnect (flapping network).
- Test laptop sleep/wake scenarios.

#### Common Mistakes

- Assuming first `next` after reconnect is fresh full state without gap.
- Not refreshing JWT on reconnect.
- Duplicate subscriptions after reconnect (double events).

---

## 7.6 Performance Optimization

### 7.6.1 Backpressure Handling

#### Beginner

**Backpressure**: producer faster than consumer—buffers grow, memory blows, latency spikes.

#### Intermediate

**Drop** old messages (LIVE sports scores), **block** producer (risk deadlock), or **sample** (keep latest only per key).

#### Expert

**Node streams** `highWaterMark`; async iterators with bounded queues. **Reactive** `onBackpressureDrop` in some libs. **Client** signals slow consumer rarely in GraphQL—usually server-side policy.

```javascript
class BoundedQueue {
  constructor(max = 100) {
    this.max = max;
    this.q = [];
    this.wait = null;
  }
  push(item) {
    if (this.q.length >= this.max) this.q.shift(); // drop oldest
    this.q.push(item);
    this.drain();
  }
}
```

#### Key Points

- Unbounded queues are an outage waiting to happen.
- Policy depends on domain (financial vs chat).
- Monitor queue depth metrics.

#### Best Practices

- Prefer drop with metric vs silent OOM.
- Coalesce high-frequency updates per key.
- Document lossy behavior if applicable.

#### Common Mistakes

- Assuming clients always consume instantly.
- Blocking event loop on backpressure logic.
- No metrics when dropping.

---

### 7.6.2 Buffer Management

#### Beginner

**Buffer** events client-side if UI renders slower than arrival—ring buffer of last N messages.

#### Intermediate

Server **batch** multiple events into one WS frame (application-level batching, not spec-mandated).

#### Expert

**SharedArrayBuffer** / **ring buffers** in workers for UI thread isolation. **Serialization** cost dominates—reuse string builders or binary formats.

```javascript
// Client-side rolling buffer for devtools log
const buf = [];
const N = 200;
function pushEvent(e) {
  if (buf.length === N) buf.shift();
  buf.push(e);
}
```

#### Key Points

- Separate server buffer (per connection) from client buffer.
- Bound both.
- Flush buffers on unsubscribe.

#### Best Practices

- Preallocate buffers in hot paths if profiling shows benefit.
- Avoid `JSON.parse` on huge historical arrays repeatedly.
- Clear buffers on room switch.

#### Common Mistakes

- Unbounded `messages[]` in React state.
- Copying entire buffer on each render.
- Server buffering without TTL during disconnect (memory leak).

---

### 7.6.3 Rate Limiting

#### Beginner

Limit **events per second** per user or per topic to prevent spam and accidental loops.

#### Intermediate

**Token bucket** in publish path: `rateLimiter.consume(userId, 1)`. **GraphQL** layer limit new `subscribe` operations per minute.

#### Expert

**Global** vs **local** limiter (Redis sliding window). **Prioritize** classes (security > marketing notifications).

```javascript
import { RateLimiterRedis } from "rate-limiter-flexible";

const limiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "sub_pub",
  points: 50,
  duration: 1,
});

async function publishThrottled(userId, channel, payload) {
  await limiter.consume(userId);
  await pubsub.publish(channel, payload);
}
```

#### Key Points

- Rate limit both subscribe and publish sides.
- Limits should align with product expectations.
- Return clear errors when publishing throttled internally.

#### Best Practices

- Whitelist internal system publishers.
- Different limits for typing vs messages.
- Alert on sustained limit hits (abuse or bug).

#### Common Mistakes

- Only limiting HTTP, not internal publish flood.
- Per-IP limit breaking corporate NAT users unfairly.
- Hard fail user UX on transient limit burst.

---

### 7.6.4 Connection Limits

#### Beginner

Cap **concurrent WebSockets** per user, per IP, and globally per process.

#### Intermediate

**Admission control** during overload: reject new WS with `4408` custom code. **Fairness** across tenants.

#### Expert

**OS file descriptor ulimit** tuning. **Kubernetes** pod limits vs expected connections per pod. **Horizontal** scale adds capacity—ensure pubsub shared.

```javascript
const MAX_CONN = 50_000;
let current = 0;

wss.on("connection", (socket) => {
  if (current >= MAX_CONN) {
    socket.close(1013, "Try again later");
    return;
  }
  current++;
  socket.on("close", () => current--);
});
```

#### Key Points

- Limits protect the fleet from connection storms.
- Measure handshake CPU cost at peak.
- Plan capacity = connections × memory per connection.

#### Best Practices

- Autoscale on connection count metric.
- Shed load gracefully with retry hints.
- Monitor close codes distribution.

#### Common Mistakes

- Only limiting HTTP requests, not WS.
- Per-pod limit without global coordination causing imbalance.
- Accepting connections then immediately idling forever.

---

### 7.6.5 Resource Management

#### Beginner

**CPU**, **memory**, **FDs**, **bandwidth**—subscriptions consume all four at scale.

#### Intermediate

**Worker threads** for heavy serialization off main event loop. **Compression** reduces bandwidth, increases CPU—profile.

#### Expert

**Cgroups** / **Kubernetes QoS** for GraphQL pods. **Chargeback** internal cost per tenant based on connection minutes + messages. **Profiling** flamegraphs during fan-out.

```javascript
import { performance } from "node:perf_hooks";

function instrumentPublish(pubsub) {
  const orig = pubsub.publish.bind(pubsub);
  pubsub.publish = async (ch, p) => {
    const t0 = performance.now();
    await orig(ch, p);
    metrics.publishLatency.observe(performance.now() - t0);
  };
}
```

#### Key Points

- Resource tuning is empirical.
- Subscriptions shift load from client polling to server push—often net win if bounded.
- Observability drives SLOs.

#### Best Practices

- Dashboard: connections, msgs/sec, payload bytes, errors.
- Alert on growth anomalies.
- Right-size pods after load tests.

#### Common Mistakes

- No metrics until outage.
- Ignoring egress costs for global fan-out.
- Running GraphQL WS on same thread as CPU-heavy image processing.

---

## 7.7 Advanced Subscription Patterns

### 7.7.1 Multiplexed Subscriptions

#### Beginner

**One WebSocket**, many **subscription ids**—graphql-ws standard. Client sends multiple `subscribe` messages with unique ids.

#### Intermediate

Server maps `id` → iterator; `complete` cancels one without closing socket. **Max subs** per socket configurable.

#### Expert

**GraphQL over SSE** multiplexing differs. **HTTP/2** streams for alternative transports. **Prioritization** of ids (UX-critical first) is application logic.

```javascript
// Client pseudocode: two active subscriptions on one connection
client.subscribe(
  { query: `subscription A { ... }`, variables: {} },
  { next: console.log, error: console.error, complete: () => {} }
);
client.subscribe(
  { query: `subscription B { ... }`, variables: {} },
  { next: console.log, error: console.error, complete: () => {} }
);
```

#### Key Points

- Multiplexing reduces TLS handshakes and NAT entries.
- Independent lifecycle per operation id.
- Server must isolate errors per id.

#### Best Practices

- Reuse connection across routes in SPA.
- Unsubscribe components on unmount.
- Cap subs per connection to prevent abuse.

#### Common Mistakes

- Opening new WS per React component.
- Completing socket killing unrelated subs unexpectedly.
- Id collisions on client retry bugs.

---

### 7.7.2 Conditional Subscriptions

#### Beginner

Client **starts** subscription only when feature flag / tab active: `if (enabled) subscribe()`.

#### Intermediate

Server **dynamic** channel subscription based on `variables` and auth—user without permission gets empty iterator or error at subscribe time.

#### Expert

**GraphQL directives** `@include(if: $live)` on subscription fields (supported in some clients for building document strings—not runtime server directive for WS universally). Often better: conditional hook in UI.

```javascript
function useLiveComments(postId, enabled) {
  useEffect(() => {
    if (!enabled) return;
    const sub = client.subscribe({ query: SUB, variables: { postId } });
    return () => sub.unsubscribe();
  }, [postId, enabled]);
}
```

#### Key Points

- Avoid subscribing when data not visible—saves resources.
- Server should reject unauthorized subscribe early.
- Re-evaluate condition on auth change.

#### Best Practices

- Tear down subs on logout immediately.
- Feature flags from server to avoid mismatched assumptions.
- Test enable/disable toggles rapidly.

#### Common Mistakes

- Leaving subscription running on hidden routes.
- Server accepting subscribe then filtering everything (waste).
- Stale closure on `enabled` in effects.

---

### 7.7.3 Aggregate Subscriptions

#### Beginner

Stream **aggregates**: `onlineCountUpdated(roomId) { count }` instead of per-user join events.

#### Intermediate

**Server maintains counter** in Redis `INCR`; publish on change. **Debounce** counter publishes (e.g., at most 1/sec).

#### Expert

**HyperLogLog** for approximate unique viewers. **Sliding window** counts with time buckets. **Federation**: aggregate subgraph may own counter service.

```graphql
subscription {
  leaderboardSnapshot(tournamentId: ID!) {
    tournamentId
    topPlayers {
      userId
      score
    }
    asOf
  }
}
```

```javascript
// Debounced publish
let timer;
function bumpLeaderboard(tournamentId) {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const top = computeTop(tournamentId);
    pubsub.publish(`TOUR:${tournamentId}`, {
      leaderboardSnapshot: { tournamentId, topPlayers: top, asOf: Date.now() },
    });
  }, 500);
}
```

#### Key Points

- Aggregates reduce event volume dramatically.
- Stale aggregate windows trade accuracy for load.
- Still need auth on tournament id.

#### Best Practices

- Document refresh latency.
- Use server clocks consistently (UTC).
- Invalidate on major events immediately (end of match).

#### Common Mistakes

- Aggregating without debounce on per-point scoring events.
- Wrong tournament id scope leaking scores.
- Huge top-N lists in every tick.

---

### 7.7.4 Time-Window Subscriptions

#### Beginner

Subscribe to events only within a **time range**: auction ending soon, live session 9–10am.

#### Intermediate

Server **auto-completes** iterator at window end. **Cron** starts/stops campaign topics.

#### Expert

**HLC** or **server time** authority to avoid client clock skew issues. **Grace period** after advertised end for stragglers.

```graphql
subscription {
  liveAuctionLot(auctionId: ID!) {
    currentBidCents
    endsAt
    extended
  }
}
```

```javascript
async function* liveLot(auctionId) {
  const end = await auctions.getEnd(auctionId);
  const iter = pubsub.asyncIterator(`AUCTION:${auctionId}`);
  for await (const v of iter) {
    yield v;
    if (Date.now() > end) break;
  }
}
```

#### Key Points

- Time windows need server-synchronized clocks.
- Auto-completion frees resources.
- Extensions (auction sniping) complicate `endsAt`.

#### Best Practices

- Send `endsAt` updates on extension.
- Use monotonic timers where relative durations matter.
- Test boundary conditions (exactly at end).

#### Common Mistakes

- Relying on client `setTimeout` alone for session end.
- Drift between published `endsAt` and actual cutoff logic.
- Subscriptions continuing after window (resource leak).

---

### 7.7.5 State Change Subscriptions

#### Beginner

Notify when **FSM** transitions: `order` from `PAID` → `SHIPPED`, `doc` from `DRAFT` → `PUBLISHED`.

#### Intermediate

Publish only on **valid transitions** from domain service. Payload includes `from`, `to`, `actorId`, `at`.

#### Expert

**Event sourcing**: subscription reads from event store tail (Kafka consumer group per scaled consumer). **Sagas** emit state change events consumed by GraphQL publisher worker.

```graphql
subscription {
  orderStateChanged(orderId: ID!) {
    orderId
    previousStatus
    newStatus
    at
  }
}
```

```javascript
function transitionOrder(order, next) {
  assertValidTransition(order.status, next);
  order.status = next;
  db.save(order);
  pubsub.publish(`ORDER:${order.id}`, {
    orderStateChanged: {
      orderId: order.id,
      previousStatus: order.prevStatus,
      newStatus: next,
      at: new Date().toISOString(),
    },
  });
}
```

#### Key Points

- State change events power workflows and UI steppers.
- Include enough context for clients to animate transitions.
- Idempotent handling if at-least-once delivery.

#### Best Practices

- Centralize transition validation in one module.
- Map illegal transitions to errors, not silent no-op publishes.
- Audit log state changes for compliance.

#### Common Mistakes

- Publishing before DB commit.
- Missing `previousStatus` (client cannot animate).
- Allowing invalid jumps via direct DB edits bypassing service.

---

*End of GraphQL Subscriptions notes (Topic 7).*
